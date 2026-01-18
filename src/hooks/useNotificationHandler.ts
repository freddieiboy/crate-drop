import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useInventoryStore } from '../store/inventoryStore';

type NotificationSubscription = ReturnType<
  typeof Notifications.addNotificationResponseReceivedListener
>;

/**
 * Hook to handle notification taps
 * Navigates to Inventory and opens the collected crate
 */
export function useNotificationHandler() {
  const navigation = useNavigation<any>();
  const setPendingOpenCrateId = useInventoryStore(
    (state) => state.setPendingOpenCrateId
  );
  const responseListener = useRef<NotificationSubscription | null>(null);

  useEffect(() => {
    // Handle notification tap when app is backgrounded/closed
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (data?.collectionId) {
          console.log('Notification tapped, collection ID:', data.collectionId);

          // Set pending crate ID to auto-open in Inventory
          setPendingOpenCrateId(data.collectionId as string);

          // Navigate to Inventory tab
          navigation.navigate('Inventory');
        }
      });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [navigation, setPendingOpenCrateId]);
}
