import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const { crates, refetch } = useNearbyCrates();
  const collections = useInventoryStore((state) => state.collections);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch, refreshing]);

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
          <View style={styles.titleRow}>
            <Text style={styles.title}>RADAR</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={COLORS.accent} />
              ) : (
                <Text style={styles.refreshIcon}>↻</Text>
              )}
            </TouchableOpacity>
          </View>
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
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 4,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.radarRing,
  },
  refreshIcon: {
    fontSize: 18,
    color: COLORS.accent,
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
    paddingBottom: 20,
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
