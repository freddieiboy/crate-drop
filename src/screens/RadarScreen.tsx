import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadarView } from '../components/radar/RadarView';
import { CollectionToast } from '../components/common/CollectionToast';
import { useLocation } from '../hooks/useLocation';
import { useNearbyCrates } from '../hooks/useNearbyCrates';
import { useCrateProximity } from '../hooks/useCrateProximity';
import { useInventoryStore } from '../store/inventoryStore';
import { COLORS } from '../utils/constants';
import type { CollectedCrate } from '../types';

export function RadarScreen() {
  const { location, error } = useLocation();
  const { crates } = useNearbyCrates();
  const collections = useInventoryStore((state) => state.collections);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle auto-collection
  useCrateProximity({
    onCollect: (crate: CollectedCrate) => {
      setToastMessage('Crate collected!');
      setTimeout(() => setToastMessage(null), 2000);
    },
  });

  const unopenedCount = collections.filter((c) => !c.openedAt).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>RADAR</Text>
          <Text style={styles.subtitle}>
            {crates.length} crate{crates.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>

        {/* Radar */}
        <View style={styles.radarContainer}>
          <RadarView userLocation={location} crates={crates} />
        </View>

        {/* Status */}
        <View style={styles.status}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : !location ? (
            <Text style={styles.statusText}>Acquiring location...</Text>
          ) : (
            <Text style={styles.statusText}>
              {location.accuracy
                ? `GPS accuracy: ${Math.round(location.accuracy)}m`
                : 'Tracking active'}
            </Text>
          )}
          {unopenedCount > 0 && (
            <Text style={styles.inventoryHint}>
              {unopenedCount} unopened crate{unopenedCount !== 1 ? 's' : ''} in inventory
            </Text>
          )}
        </View>
      </View>

      {/* Collection toast */}
      {toastMessage && <CollectionToast message={toastMessage} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
  },
  inventoryHint: {
    fontSize: 12,
    color: COLORS.accent,
    marginTop: 4,
  },
});
