import AsyncStorage from '@react-native-async-storage/async-storage';

const COLLECTED_IDS_KEY = 'background-collected-crate-ids';

/**
 * Get all collected crate IDs from persistent storage
 */
export async function getCollectedIds(): Promise<Set<string>> {
  try {
    const stored = await AsyncStorage.getItem(COLLECTED_IDS_KEY);
    if (stored) {
      const ids = JSON.parse(stored) as string[];
      return new Set(ids);
    }
  } catch (error) {
    console.error('Error reading collected IDs:', error);
  }
  return new Set();
}

/**
 * Add a collected crate ID to persistent storage
 */
export async function addCollectedId(crateId: string): Promise<void> {
  try {
    const existingIds = await getCollectedIds();
    existingIds.add(crateId);
    await AsyncStorage.setItem(
      COLLECTED_IDS_KEY,
      JSON.stringify(Array.from(existingIds))
    );
  } catch (error) {
    console.error('Error saving collected ID:', error);
  }
}
