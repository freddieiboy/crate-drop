import { getDistance, getRhumbLineBearing } from 'geolib';

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates in meters
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  return getDistance(from, to);
}

/**
 * Calculate bearing from one coordinate to another (0-360 degrees, 0 = north)
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  return getRhumbLineBearing(from, to);
}

/**
 * Convert crate position to radar coordinates (x, y relative to center)
 * @param userLocation User's current location
 * @param crateLocation Crate's location
 * @param radarRadius Radius of the radar view in pixels
 * @param maxDistance Maximum real-world distance the radar represents in meters
 */
export function getRadarPosition(
  userLocation: Coordinates,
  crateLocation: Coordinates,
  radarRadius: number,
  maxDistance: number
): { x: number; y: number; distance: number } {
  const distance = calculateDistance(userLocation, crateLocation);
  const bearing = calculateBearing(userLocation, crateLocation);

  // Scale distance to radar (crates beyond maxDistance appear at edge)
  const scaledDistance = Math.min(distance / maxDistance, 1) * radarRadius;

  // Convert bearing to x,y (bearing 0 = north = up, so we rotate)
  // Bearing is clockwise from north, canvas is clockwise from east
  const radians = ((bearing - 90) * Math.PI) / 180;
  const x = Math.cos(radians) * scaledDistance;
  const y = Math.sin(radians) * scaledDistance;

  return { x, y, distance };
}

/**
 * Check if user is within collection range of a crate
 */
export function isWithinCollectionRange(
  userLocation: Coordinates,
  crateLocation: Coordinates,
  rangeMeters: number
): boolean {
  const distance = calculateDistance(userLocation, crateLocation);
  return distance <= rangeMeters;
}
