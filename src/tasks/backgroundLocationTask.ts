import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { processBackgroundLocation } from '../services/backgroundCollection';
import { BACKGROUND_LOCATION_TASK } from '../utils/constants';

// Define the background location task at module scope
// This MUST be defined before the app component renders
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };

    // Process each location update
    for (const location of locations) {
      const { latitude, longitude } = location.coords;
      console.log('Background location update:', latitude, longitude);

      await processBackgroundLocation(latitude, longitude);
    }
  }
});

/**
 * Start background location tracking
 * Requires "Always Allow" location permission
 */
export async function startBackgroundLocationTracking(): Promise<boolean> {
  try {
    // Check if task is already running
    const isTaskRunning = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TASK
    );

    if (isTaskRunning) {
      console.log('Background location task already running');
      return true;
    }

    // Request background location permission
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      console.log('Foreground location permission not granted');
      return false;
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
      console.log('Background location permission not granted');
      return false;
    }

    // Start background location updates
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced, // Battery-friendly
      timeInterval: 30000, // 30 seconds
      distanceInterval: 10, // 10 meters
      deferredUpdatesInterval: 60000, // Batch every 60 seconds
      deferredUpdatesDistance: 50, // Or every 50 meters
      showsBackgroundLocationIndicator: true, // iOS blue bar
      // iOS-specific options
      activityType: Location.ActivityType.Fitness, // Walking/running activity
      pausesUpdatesAutomatically: false, // Don't let iOS pause updates
      foregroundService: {
        // Android foreground service
        notificationTitle: 'Crate Drop Active',
        notificationBody: 'Searching for nearby crates...',
        notificationColor: '#00ff88',
      },
    });

    console.log('Background location tracking started');
    return true;
  } catch (error) {
    console.error('Error starting background location tracking:', error);
    return false;
  }
}

/**
 * Stop background location tracking
 */
export async function stopBackgroundLocationTracking(): Promise<void> {
  try {
    const isTaskRunning = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TASK
    );

    if (isTaskRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log('Background location tracking stopped');
    }
  } catch (error) {
    console.error('Error stopping background location tracking:', error);
  }
}
