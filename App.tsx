import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RadarScreen } from './src/screens/RadarScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { useInventoryStore } from './src/store/inventoryStore';
import { COLORS } from './src/utils/constants';

const Tab = createBottomTabNavigator();

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Radar: '📡',
    Inventory: '📦',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{icons[name]}</Text>
      {focused && (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: COLORS.accent,
            marginTop: 4,
          }}
        />
      )}
    </View>
  );
}

export default function App() {
  const initUserId = useInventoryStore((state) => state.initUserId);
  const syncFromServer = useInventoryStore((state) => state.syncFromServer);

  // Initialize anonymous user ID and sync collections on app start
  useEffect(() => {
    async function init() {
      await initUserId();
      await syncFromServer();
    }
    init();
  }, [initUserId, syncFromServer]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name={route.name} focused={focused} />
            ),
            tabBarStyle: {
              backgroundColor: COLORS.tabBar,
              borderTopColor: COLORS.radarRing,
              borderTopWidth: 1,
              paddingTop: 10,
              height: 90,
            },
            tabBarActiveTintColor: COLORS.accent,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1,
              marginTop: 4,
            },
          })}
        >
          <Tab.Screen name="Radar" component={RadarScreen} />
          <Tab.Screen name="Inventory" component={InventoryScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
