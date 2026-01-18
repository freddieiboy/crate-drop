// Collection radius in meters - how close user needs to be to auto-collect
export const COLLECTION_RADIUS_METERS = 10;

// Background location task name
export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Android notification channel ID
export const NOTIFICATION_CHANNEL_ID = 'crate-drops';

// Radar range in meters - how far crates are visible on radar
export const RADAR_RANGE_METERS = 50;

// Location tracking configuration
export const LOCATION_CONFIG = {
  accuracy: 6, // Location.Accuracy.High
  distanceInterval: 2, // Update every 2 meters moved
  timeInterval: 1000, // Or every 1 second
};

// How far user must move before refetching crates from server
// Should be less than RADAR_RANGE_METERS so new crates appear before you reach them
export const CRATE_REFETCH_DISTANCE_METERS = 30;

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
