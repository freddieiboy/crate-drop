import { useInventoryStore } from '../store/inventoryStore';
import { useCrateStore } from '../store/crateStore';
import { fetchNearbyCrates, recordCollection } from './supabase/crates';
import { getCollectedIds, addCollectedId } from '../utils/collectedIdsStorage';
import { scheduleCollectionNotification } from './notifications';
import { COLLECTION_RADIUS_METERS } from '../utils/constants';
import type { Crate, CollectedCrate } from '../types';

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Process a background location update - check for nearby crates and collect them
 * This function is hook-free and can be called from background tasks
 */
export async function processBackgroundLocation(
  latitude: number,
  longitude: number
): Promise<void> {
  try {
    // Get user ID from store (hook-free access)
    const state = useInventoryStore.getState();
    const userId = state.userId;

    if (!userId) {
      console.log('Background collection: No user ID available');
      return;
    }

    // Fetch nearby crates from server
    const nearbyCrates = await fetchNearbyCrates(latitude, longitude, 100);

    if (nearbyCrates.length === 0) {
      return;
    }

    // Get already collected IDs from persistent storage
    const collectedIds = await getCollectedIds();

    // Also check local store for recently collected crates
    const storeCollectedIds = new Set(
      state.collections.map((c) => c.crateId)
    );

    // Find crates within collection radius that haven't been collected
    for (const crate of nearbyCrates) {
      // Skip if already collected (check both persistent storage and store)
      if (collectedIds.has(crate.id) || storeCollectedIds.has(crate.id)) {
        continue;
      }

      // Calculate distance to crate
      const distance = calculateDistance(
        latitude,
        longitude,
        crate.latitude,
        crate.longitude
      );

      // Check if within collection radius
      if (distance <= COLLECTION_RADIUS_METERS) {
        await collectCrateInBackground(userId, crate);
      }
    }
  } catch (error) {
    console.error('Error processing background location:', error);
  }
}

/**
 * Collect a crate in background mode
 */
async function collectCrateInBackground(
  userId: string,
  crate: Crate
): Promise<void> {
  try {
    // Record collection in database
    const collection = await recordCollection(userId, crate.id);

    if (!collection) {
      console.error('Failed to record collection in background');
      return;
    }

    // Mark as collected in persistent storage to prevent duplicates
    await addCollectedId(crate.id);

    // Create CollectedCrate object with location
    const collectedCrate: CollectedCrate = {
      id: collection.id,
      crateId: crate.id,
      collectedAt: collection.collected_at,
      openedAt: null,
      fortune: crate.fortune || {
        id: 'unknown',
        message: 'A mysterious fortune awaits...',
        created_at: new Date().toISOString(),
      },
      latitude: crate.latitude,
      longitude: crate.longitude,
    };

    // Update stores (hook-free access)
    useInventoryStore.getState().addCollection(collectedCrate);
    useCrateStore.getState().removeCrate(crate.id);

    // Send notification
    await scheduleCollectionNotification(collectedCrate);

    console.log('Background collection successful:', crate.id);
  } catch (error) {
    console.error('Error collecting crate in background:', error);
  }
}
