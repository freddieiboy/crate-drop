import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CollectedCrate } from '../types';
import * as Crypto from 'expo-crypto';
import { fetchUserCollections } from '../services/supabase/crates';

interface InventoryState {
  collections: CollectedCrate[];
  userId: string | null;
  isSyncing: boolean;
  addCollection: (collection: CollectedCrate) => void;
  markOpened: (collectionId: string) => void;
  removeCollection: (collectionId: string) => void;
  initUserId: () => Promise<void>;
  syncFromServer: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      collections: [],
      userId: null,
      isSyncing: false,
      addCollection: (collection) =>
        set((state) => ({
          collections: [...state.collections, collection],
        })),
      markOpened: (collectionId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, openedAt: new Date().toISOString() }
              : c
          ),
        })),
      removeCollection: (collectionId) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== collectionId),
        })),
      initUserId: async () => {
        if (get().userId) return;
        const id = Crypto.randomUUID();
        set({ userId: id });
      },
      syncFromServer: async () => {
        const userId = get().userId;
        if (!userId || get().isSyncing) return;

        set({ isSyncing: true });
        try {
          const serverCollections = await fetchUserCollections(userId);
          if (serverCollections.length > 0) {
            set({ collections: serverCollections });
          }
        } catch (error) {
          console.error('Error syncing collections:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'crate-drop-inventory',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
