import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInventoryStore } from '../store/inventoryStore';
import { CrateOpenModal } from './CrateOpenModal';
import { FortuneCard } from '../components/inventory/FortuneCard';
import { COLORS } from '../utils/constants';
import type { CollectedCrate } from '../types';

export function InventoryScreen() {
  const collections = useInventoryStore((state) => state.collections);
  const pendingOpenCrateId = useInventoryStore((state) => state.pendingOpenCrateId);
  const setPendingOpenCrateId = useInventoryStore((state) => state.setPendingOpenCrateId);
  const syncFromServer = useInventoryStore((state) => state.syncFromServer);
  const [selectedCrate, setSelectedCrate] = useState<CollectedCrate | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncFromServer();
    setRefreshing(false);
  }, [syncFromServer]);

  // Auto-open crate when navigating from notification tap
  useEffect(() => {
    if (pendingOpenCrateId) {
      const crateToOpen = collections.find((c) => c.id === pendingOpenCrateId);
      if (crateToOpen && !crateToOpen.openedAt) {
        setSelectedCrate(crateToOpen);
      }
      // Clear the pending ID
      setPendingOpenCrateId(null);
    }
  }, [pendingOpenCrateId, collections, setPendingOpenCrateId]);

  // Split into unopened and opened crates
  const { unopenedCrates, openedCrates } = useMemo(() => {
    const unopened = collections.filter((c) => !c.openedAt);
    const opened = collections
      .filter((c) => c.openedAt)
      .sort((a, b) => new Date(b.openedAt!).getTime() - new Date(a.openedAt!).getTime());
    return { unopenedCrates: unopened, openedCrates: opened };
  }, [collections]);

  const renderUnopenedCrate = (item: CollectedCrate) => (
    <TouchableOpacity
      key={item.id}
      style={styles.crateCard}
      onPress={() => setSelectedCrate(item)}
      activeOpacity={0.7}
    >
      <View style={styles.crateIcon}>
        <Text style={styles.crateEmoji}>📦</Text>
      </View>
      <View style={styles.crateInfo}>
        <Text style={styles.crateName}>Mystery Crate</Text>
        <Text style={styles.crateDate}>
          Collected {formatDate(item.collectedAt)}
        </Text>
      </View>
      <Text style={styles.tapHint}>TAP TO OPEN</Text>
    </TouchableOpacity>
  );

  const renderOpenedCrate = (item: CollectedCrate) => (
    <View key={item.id} style={styles.fortuneCardWrapper}>
      <FortuneCard crate={item} />
    </View>
  );

  const hasNoCrates = unopenedCrates.length === 0 && openedCrates.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>INVENTORY</Text>
        <Text style={styles.subtitle}>
          {unopenedCrates.length} unopened · {openedCrates.length} discovered
        </Text>
      </View>

      {hasNoCrates ? (
        <ScrollView
          contentContainerStyle={styles.emptyStateContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
        >
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No crates yet</Text>
            <Text style={styles.emptyText}>
              Walk around to find crates on the radar!
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
        >
          {/* Unopened Crates Section */}
          {unopenedCrates.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>UNOPENED CRATES</Text>
              {unopenedCrates.map(renderUnopenedCrate)}
            </View>
          )}

          {/* Opened Crates / Discovered Fortunes Section */}
          {openedCrates.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DISCOVERED FORTUNES</Text>
              {openedCrates.map(renderOpenedCrate)}
            </View>
          )}
        </ScrollView>
      )}

      {/* Crate Open Modal */}
      <Modal
        visible={selectedCrate !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedCrate(null)}
      >
        {selectedCrate && (
          <CrateOpenModal
            crate={selectedCrate}
            onClose={() => setSelectedCrate(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  crateCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.radarRing,
  },
  crateIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crateEmoji: {
    fontSize: 28,
  },
  crateInfo: {
    flex: 1,
    marginLeft: 16,
  },
  crateName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  crateDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  tapHint: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '600',
    letterSpacing: 1,
  },
  fortuneCardWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
