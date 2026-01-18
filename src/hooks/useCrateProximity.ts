import { useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useLocationStore } from '../store/locationStore';
import { useCrateStore } from '../store/crateStore';
import { useInventoryStore } from '../store/inventoryStore';
import { recordCollection } from '../services/supabase/crates';
import { isWithinCollectionRange } from '../utils/geo';
import { COLLECTION_RADIUS_METERS } from '../utils/constants';
import type { Crate, CollectedCrate } from '../types';

interface UseCrateProximityOptions {
  onCollect?: (crate: CollectedCrate) => void;
}

export function useCrateProximity(options: UseCrateProximityOptions = {}) {
  const { onCollect } = options;
  const location = useLocationStore((state) => state.location);
  const nearbyCrates = useCrateStore((state) => state.nearbyCrates);
  const removeCrate = useCrateStore((state) => state.removeCrate);
  const userId = useInventoryStore((state) => state.userId);
  const addCollection = useInventoryStore((state) => state.addCollection);

  // Track crates we've already collected this session to prevent duplicates
  const collectedIdsRef = useRef<Set<string>>(new Set());

  const collectCrate = useCallback(
    async (crate: Crate) => {
      if (!userId) return;

      // Prevent duplicate collection
      if (collectedIdsRef.current.has(crate.id)) return;
      collectedIdsRef.current.add(crate.id);

      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Record in database
      const collection = await recordCollection(userId, crate.id);

      if (collection) {
        // Create local collection object
        const collectedCrate: CollectedCrate = {
          id: collection.id,
          crateId: crate.id,
          collectedAt: collection.collected_at,
          openedAt: null,
          fortune: crate.fortune || {
            id: crate.fortune_id,
            message: 'A mystery awaits...',
            created_at: new Date().toISOString(),
          },
        };

        // Add to local inventory
        addCollection(collectedCrate);

        // Remove from radar
        removeCrate(crate.id);

        // Callback
        onCollect?.(collectedCrate);
      }
    },
    [userId, addCollection, removeCrate, onCollect]
  );

  // Check proximity on location updates
  useEffect(() => {
    if (!location || !userId) return;

    for (const crate of nearbyCrates) {
      if (collectedIdsRef.current.has(crate.id)) continue;

      if (isWithinCollectionRange(location, crate, COLLECTION_RADIUS_METERS)) {
        collectCrate(crate);
      }
    }
  }, [location, nearbyCrates, userId, collectCrate]);

  return {
    collectedCount: collectedIdsRef.current.size,
  };
}
