// Collection radius in meters - how close user needs to be to auto-collect
export const COLLECTION_RADIUS_METERS = 10;

// Radar range in meters - how far crates are visible on radar
export const RADAR_RANGE_METERS = 50;

// Location tracking configuration
export const LOCATION_CONFIG = {
  accuracy: 6, // Location.Accuracy.High
  distanceInterval: 5, // Update every 5 meters moved
  timeInterval: 3000, // Or every 3 seconds
};

// How far user must move before refetching crates from server
export const CRATE_REFETCH_DISTANCE_METERS = 100;

// App colors
export const COLORS = {
  background: '#0a0a0a',
  radarBg: '#0d1117',
  radarRing: '#1a3a2a',
  radarPing: '#00ff88',
  crateBlip: '#00ff88',
  crateBlipClose: '#00ffcc',
  text: '#ffffff',
  textMuted: '#666666',
  accent: '#00ff88',
  tabBar: '#111111',
  card: '#1a1a1a',
};
