import { useEffect, useCallback } from 'react';
import { useLocationStore } from '../store/locationStore';
import { useCrateStore } from '../store/crateStore';
import { useInventoryStore } from '../store/inventoryStore';
import { fetchNearbyCrates, getUserCollectedCrateIds } from '../services/supabase/crates';
import { calculateDistance } from '../utils/geo';
import { CRATE_REFETCH_DISTANCE_METERS, RADAR_RANGE_METERS } from '../utils/constants';

export function useNearbyCrates() {
  const location = useLocationStore((state) => state.location);
  const nearbyCrates = useCrateStore((state) => state.nearbyCrates);
  const lastFetchLocation = useCrateStore((state) => state.lastFetchLocation);
  const setCrates = useCrateStore((state) => state.setCrates);
  const setLoading = useCrateStore((state) => state.setLoading);
  const setLastFetchLocation = useCrateStore((state) => state.setLastFetchLocation);
  const isLoading = useCrateStore((state) => state.isLoading);
  const userId = useInventoryStore((state) => state.userId);

  const fetchCrates = useCallback(async () => {
    if (!location || !userId) return;

    setLoading(true);
    try {
      // Fetch crates from server
      const crates = await fetchNearbyCrates(
        location.latitude,
        location.longitude,
        RADAR_RANGE_METERS * 2 // Fetch slightly larger area
      );

      // Get user's already-collected crate IDs
      const collectedIds = await getUserCollectedCrateIds(userId);
      const collectedSet = new Set(collectedIds);

      // Filter out already-collected crates
      const availableCrates = crates.filter((crate) => !collectedSet.has(crate.id));

      setCrates(availableCrates);
      setLastFetchLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      console.error('Error fetching nearby crates:', error);
    } finally {
      setLoading(false);
    }
  }, [location, userId, setCrates, setLoading, setLastFetchLocation]);

  // Initial fetch and refetch when user moves significantly
  useEffect(() => {
    if (!location || !userId) return;

    // Check if we need to refetch
    const shouldFetch =
      !lastFetchLocation ||
      calculateDistance(location, lastFetchLocation) > CRATE_REFETCH_DISTANCE_METERS;

    if (shouldFetch) {
      fetchCrates();
    }
  }, [location, userId, lastFetchLocation, fetchCrates]);

  return {
    crates: nearbyCrates,
    isLoading,
    refetch: fetchCrates,
  };
}
