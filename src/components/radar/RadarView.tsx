import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { COLORS, RADAR_RANGE_METERS } from '../../utils/constants';
import { getRadarPosition } from '../../utils/geo';
import { CrateBlip } from './CrateBlip';
import type { Crate, Location } from '../../types';

const { width } = Dimensions.get('window');
const RADAR_SIZE = width * 0.85;
const RADAR_RADIUS = RADAR_SIZE / 2;

interface RadarViewProps {
  userLocation: Location | null;
  crates: Crate[];
}

export function RadarView({ userLocation, crates }: RadarViewProps) {
  const pingScale = useSharedValue(0);
  const pingOpacity = useSharedValue(0.6);
  const radarRotation = useSharedValue(0);

  // Ping animation
  useEffect(() => {
    pingScale.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pingOpacity.value = withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, [pingScale, pingOpacity]);

  // Update rotation when heading changes
  useEffect(() => {
    if (userLocation?.heading != null) {
      // Negative rotation so that "forward" points up
      radarRotation.value = withSpring(-userLocation.heading, {
        damping: 30,
        stiffness: 60,
        mass: 1,
      });
    }
  }, [userLocation?.heading, radarRotation]);

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  const blipsContainerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarRotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.radar}>
        {/* Background rings */}
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
        <View style={[styles.ring, styles.ring3]} />

        {/* Animated ping */}
        <Animated.View style={[styles.ping, pingStyle]} />

        {/* Crosshairs */}
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />

        {/* Center dot (user) */}
        <View style={styles.centerDot} />

        {/* Crate blips - rotated based on heading */}
        <Animated.View style={[styles.blipsContainer, blipsContainerStyle]}>
          {userLocation &&
            crates.map((crate) => {
              const { x, y, distance } = getRadarPosition(
                userLocation,
                crate,
                RADAR_RADIUS - 20,
                RADAR_RANGE_METERS
              );
              return (
                <CrateBlip
                  key={crate.id}
                  x={x}
                  y={y}
                  distance={distance}
                  maxDistance={RADAR_RANGE_METERS}
                />
              );
            })}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radar: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: COLORS.radarBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.radarRing,
    overflow: 'hidden',
  },
  blipsContainer: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.radarRing,
  },
  ring1: {
    width: '33%',
    height: '33%',
  },
  ring2: {
    width: '66%',
    height: '66%',
  },
  ring3: {
    width: '100%',
    height: '100%',
  },
  ping: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.radarPing,
  },
  crosshairH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: COLORS.radarRing,
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: COLORS.radarRing,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
