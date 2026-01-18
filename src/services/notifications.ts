import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNEL_ID, COLORS } from '../utils/constants';
import type { CollectedCrate } from '../types';

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
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Crate Drops',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: COLORS.accent,
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
}

/**
 * Schedule a local notification for a collected crate
 */
export async function scheduleCollectionNotification(
  crate: CollectedCrate
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Crate Collected!',
        body: 'You found a mystery crate! Tap to open and discover your fortune.',
        data: {
          collectionId: crate.id,
          crateId: crate.crateId,
        },
        sound: 'default',
        ...(Platform.OS === 'android' && {
          channelId: NOTIFICATION_CHANNEL_ID,
        }),
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}
