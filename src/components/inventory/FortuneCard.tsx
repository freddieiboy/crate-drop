import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';
import type { CollectedCrate } from '../../types';

const { width } = Dimensions.get('window');
const CARD_SIZE = width - 40;

interface FortuneCardProps {
  crate: CollectedCrate;
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

export function FortuneCard({ crate }: FortuneCardProps) {
  const hasLocation = crate.latitude != null && crate.longitude != null;

  return (
    <View style={styles.container}>
      {/* Map Background */}
      {hasLocation ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: crate.latitude!,
            longitude: crate.longitude!,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          mapType="mutedStandard"
          userInterfaceStyle="dark"
        >
          <Marker
            coordinate={{
              latitude: crate.latitude!,
              longitude: crate.longitude!,
            }}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerDot} />
            </View>
          </Marker>
        </MapView>
      ) : (
        <View style={styles.noMapBackground} />
      )}

      {/* Mesh Gradient Overlays */}
      <View style={styles.gradientContainer}>
        {/* Top-left warm gradient */}
        <LinearGradient
          colors={['rgba(255, 100, 50, 0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.meshGradient1}
        />

        {/* Bottom-right cool gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 255, 136, 0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.meshGradient2}
        />

        {/* Purple accent */}
        <LinearGradient
          colors={['rgba(138, 43, 226, 0.3)', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.meshGradient3}
        />

        {/* Dark overlay for text readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.darkOverlay}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✨</Text>
          </View>
          <Text style={styles.date}>{formatDate(crate.openedAt!)}</Text>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.quoteOpen}>"</Text>
          <Text style={styles.message}>{crate.fortune.message}</Text>
          <Text style={styles.quoteClose}>"</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: COLORS.card,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  noMapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.radarBg,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  meshGradient1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '70%',
    height: '70%',
    borderRadius: 24,
  },
  meshGradient2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '80%',
    height: '80%',
    borderRadius: 24,
  },
  meshGradient3: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60%',
    height: '50%',
    borderRadius: 24,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  quoteOpen: {
    fontSize: 48,
    color: COLORS.accent,
    opacity: 0.6,
    lineHeight: 48,
    marginBottom: -20,
    fontFamily: 'Georgia',
  },
  message: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 30,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  quoteClose: {
    fontSize: 48,
    color: COLORS.accent,
    opacity: 0.6,
    lineHeight: 48,
    marginTop: -10,
    textAlign: 'right',
    fontFamily: 'Georgia',
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 136, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});
