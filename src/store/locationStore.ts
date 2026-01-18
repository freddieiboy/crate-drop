import { create } from 'zustand';
import type { Location } from '../types';

interface LocationState {
  location: Location | null;
  isTracking: boolean;
  error: string | null;
  setLocation: (location: Location) => void;
  setTracking: (isTracking: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  isTracking: false,
  error: null,
  setLocation: (location) => set({ location, error: null }),
  setTracking: (isTracking) => set({ isTracking }),
  setError: (error) => set({ error }),
}));
