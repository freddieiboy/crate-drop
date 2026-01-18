import { supabase } from './client';
import type { Crate, UserCollection } from '../../types';

/**
 * Fetch crates within a bounding box around a location
 */
export async function fetchNearbyCrates(
  latitude: number,
  longitude: number,
  radiusMeters: number = 500
): Promise<Crate[]> {
  // Convert radius to approximate lat/lng deltas
  const latDelta = radiusMeters / 111000;
  const lngDelta = radiusMeters / (111000 * Math.cos((latitude * Math.PI) / 180));

  const { data, error } = await supabase
    .from('crates')
    .select('*, fortune:fortunes(*)')
    .gte('latitude', latitude - latDelta)
    .lte('latitude', latitude + latDelta)
    .gte('longitude', longitude - lngDelta)
    .lte('longitude', longitude + lngDelta);

  if (error) {
    console.error('Error fetching crates:', error);
    return [];
  }

  return data || [];
}

/**
 * Record a crate collection in the database
 */
export async function recordCollection(
  userId: string,
  crateId: string
): Promise<UserCollection | null> {
  const { data, error } = await supabase
    .from('user_collections')
    .insert({
      user_id: userId,
      crate_id: crateId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording collection:', error);
    return null;
  }

  return data;
}

/**
 * Mark a collection as opened
 */
export async function markCollectionOpened(collectionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_collections')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', collectionId);

  if (error) {
    console.error('Error marking collection opened:', error);
    return false;
  }

  return true;
}

/**
 * Get user's collected crate IDs to filter out already-collected crates
 */
export async function getUserCollectedCrateIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_collections')
    .select('crate_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user collections:', error);
    return [];
  }

  return (data || []).map((c) => c.crate_id);
}

/**
 * Fetch all user collections with fortune data for syncing
 */
export async function fetchUserCollections(userId: string) {
  const { data, error } = await supabase
    .from('user_collections')
    .select(`
      id,
      crate_id,
      collected_at,
      opened_at,
      crate:crates (
        id,
        fortune:fortunes (
          id,
          message,
          created_at
        )
      )
    `)
    .eq('user_id', userId)
    .order('collected_at', { ascending: false });

  if (error) {
    console.error('Error fetching user collections:', error);
    return [];
  }

  // Transform to CollectedCrate format
  return (data || []).map((item: any) => ({
    id: item.id,
    crateId: item.crate_id,
    collectedAt: item.collected_at,
    openedAt: item.opened_at,
    fortune: item.crate?.fortune || {
      id: 'unknown',
      message: 'Fortune not found',
      created_at: new Date().toISOString(),
    },
  }));
}
