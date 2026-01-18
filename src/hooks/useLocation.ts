import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../store/locationStore';
import { LOCATION_CONFIG } from '../utils/constants';

// Location filtering constants
const MIN_ACCURACY_METERS = 30; // Only use positions with accuracy better than this
const MAX_JUMP_METERS = 20; // Ignore jumps larger than this in a short time
const SMOOTHING_FACTOR = 0.7; // How much to weight new position (0-1, higher = more responsive)

// Calculate distance between two points in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Smooth interpolation between positions
function smoothPosition(
  oldLat: number, oldLon: number,
  newLat: number, newLon: number,
  factor: number
): { latitude: number; longitude: number } {
  return {
    latitude: oldLat + (newLat - oldLat) * factor,
    longitude: oldLon + (newLon - oldLon) * factor,
  };
}

export function useLocation() {
  const setLocation = useLocationStore((state) => state.setLocation);
  const setTracking = useLocationStore((state) => state.setTracking);
  const setError = useLocationStore((state) => state.setError);
  const location = useLocationStore((state) => state.location);
  const isTracking = useLocationStore((state) => state.isTracking);
  const error = useLocationStore((state) => state.error);
  const positionSubRef = useRef<Location.LocationSubscription | null>(null);
  const headingSubRef = useRef<Location.LocationSubscription | null>(null);
  const currentHeadingRef = useRef<number | null>(null);
  const lastValidPositionRef = useRef<{ lat: number; lon: number; time: number } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function startTracking() {
      try {
        // Request foreground permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        if (!isMounted) return;
        setTracking(true);

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!isMounted) return;
        setLocation({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
          accuracy: initialLocation.coords.accuracy,
          timestamp: initialLocation.timestamp,
          heading: initialLocation.coords.heading ?? null,
        });

        // Start watching heading (compass) - updates location with new heading
        // Only update if heading changed significantly to reduce jitter
        headingSubRef.current = await Location.watchHeadingAsync((heading) => {
          if (!isMounted) return;
          const newHeading = heading.trueHeading ?? heading.magHeading;
          const prevHeading = currentHeadingRef.current;

          // Only update if heading changed by more than 2 degrees
          const headingDelta = prevHeading !== null
            ? Math.abs(((newHeading - prevHeading + 180) % 360) - 180)
            : Infinity;

          if (headingDelta > 2) {
            currentHeadingRef.current = newHeading;
            // Update location with new heading for smooth radar rotation
            const currentLoc = useLocationStore.getState().location;
            if (currentLoc) {
              setLocation({
                ...currentLoc,
                heading: newHeading,
              });
            }
          }
        });

        // Start watching position with filtering and smoothing
        positionSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: LOCATION_CONFIG.distanceInterval,
            timeInterval: LOCATION_CONFIG.timeInterval,
          },
          (loc) => {
            if (!isMounted) return;

            const newLat = loc.coords.latitude;
            const newLon = loc.coords.longitude;
            const accuracy = loc.coords.accuracy ?? 999;
            const now = Date.now();

            // 1. Accuracy threshold - reject inaccurate positions
            if (accuracy > MIN_ACCURACY_METERS) {
              return; // Skip this update, accuracy too poor
            }

            const lastPos = lastValidPositionRef.current;
            let finalLat = newLat;
            let finalLon = newLon;

            if (lastPos) {
              const distance = getDistance(lastPos.lat, lastPos.lon, newLat, newLon);
              const timeDelta = now - lastPos.time;

              // 2. Jump filter - ignore large jumps that happen too quickly
              // Allow larger jumps if more time has passed (walking speed ~1.4m/s)
              const maxAllowedDistance = Math.max(MAX_JUMP_METERS, timeDelta * 0.002); // ~2m/s max
              if (distance > maxAllowedDistance) {
                return; // Skip this update, likely a GPS glitch
              }

              // 3. Position smoothing - interpolate for smoother movement
              const smoothed = smoothPosition(
                lastPos.lat, lastPos.lon,
                newLat, newLon,
                SMOOTHING_FACTOR
              );
              finalLat = smoothed.latitude;
              finalLon = smoothed.longitude;
            }

            // Update last valid position
            lastValidPositionRef.current = { lat: finalLat, lon: finalLon, time: now };

            setLocation({
              latitude: finalLat,
              longitude: finalLon,
              accuracy: loc.coords.accuracy,
              timestamp: loc.timestamp,
              heading: currentHeadingRef.current,
            });
          }
        );
      } catch (error) {
        console.error('Location tracking error:', error);
        if (isMounted) {
          setError('Failed to start location tracking');
        }
      }
    }

    startTracking();

    return () => {
      isMounted = false;
      setTracking(false);
      if (positionSubRef.current) {
        positionSubRef.current.remove();
        positionSubRef.current = null;
      }
      if (headingSubRef.current) {
        headingSubRef.current.remove();
        headingSubRef.current = null;
      }
    };
  }, [setLocation, setTracking, setError]);

  return { location, isTracking, error };
}
