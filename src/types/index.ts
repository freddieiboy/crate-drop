export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  heading: number | null; // Compass heading in degrees (0 = north, 90 = east)
}

export interface Fortune {
  id: string;
  message: string;
  created_at: string;
}

export interface Crate {
  id: string;
  latitude: number;
  longitude: number;
  fortune_id: string;
  fortune?: Fortune;
  created_at: string;
}

export interface UserCollection {
  id: string;
  user_id: string;
  crate_id: string;
  collected_at: string;
  opened_at: string | null;
  crate?: Crate;
}

export interface CollectedCrate {
  id: string;
  crateId: string;
  collectedAt: string;
  openedAt: string | null;
  fortune: Fortune;
}
