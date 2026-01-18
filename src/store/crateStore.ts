import { create } from 'zustand';
import type { Crate } from '../types';

interface CrateState {
  nearbyCrates: Crate[];
  isLoading: boolean;
  lastFetchLocation: { latitude: number; longitude: number } | null;
  setCrates: (crates: Crate[]) => void;
  removeCrate: (crateId: string) => void;
  setLoading: (loading: boolean) => void;
  setLastFetchLocation: (location: { latitude: number; longitude: number }) => void;
}

export const useCrateStore = create<CrateState>((set) => ({
  nearbyCrates: [],
  isLoading: false,
  lastFetchLocation: null,
  setCrates: (crates) => set({ nearbyCrates: crates }),
  removeCrate: (crateId) =>
    set((state) => ({
      nearbyCrates: state.nearbyCrates.filter((c) => c.id !== crateId),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setLastFetchLocation: (location) => set({ lastFetchLocation: location }),
}));
