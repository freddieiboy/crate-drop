import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNEL_ID, COLORS } from '../utils/constants';
import type { CollectedCrate } from '../types';

// Track if channel has been created (for background task context)
let channelCreated = false;

// Configure how notifications are handled when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Ensure Android notification channel exists
 * Safe to call multiple times - will only create once
 */
async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android' || channelCreated) {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Crate Drops',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: COLORS.accent,
      sound: 'default',
    });
    channelCreated = true;
  } catch (error) {
    console.error('Error creating notification channel:', error);
  }
}

/**
 * Request notification permissions and create Android channel
 */
export async function setupNotifications(): Promise<boolean> {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Create Android notification channel
    await ensureNotificationChannel();
    channelCreated = true;

    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
}

/**
 * Schedule a local notification for a collected crate
 * Works both in foreground and background task contexts
 */
export async function scheduleCollectionNotification(
  crate: CollectedCrate
): Promise<void> {
  try {
    // Ensure channel exists (critical for background task on Android)
    await ensureNotificationChannel();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Crate Collected!',
        body: 'You found a mystery crate! Tap to open and discover your fortune.',
        data: {
          collectionId: crate.id,
          crateId: crate.crateId,
        },
        sound: 'default',
        // Android-specific
        ...(Platform.OS === 'android' && {
          channelId: NOTIFICATION_CHANNEL_ID,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
        // iOS-specific: ensure notification shows even in focus modes (iOS 15+)
        ...(Platform.OS === 'ios' && {
          interruptionLevel: 'timeSensitive',
        }),
      },
      trigger: null, // Show immediately
    });

    console.log('Notification scheduled for crate:', crate.id);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}
