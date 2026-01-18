import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { COLORS, COLLECTION_RADIUS_METERS } from '../../utils/constants';

interface CrateBlipProps {
  x: number;
  y: number;
  distance: number;
  maxDistance: number;
}

// Determine which zone the blip is in (0 = inner, 1 = middle, 2 = outer)
function getZone(distance: number, maxDistance: number): number {
  const normalizedDistance = distance / maxDistance;
  if (normalizedDistance <= 0.33) return 0; // Inner ring
  if (normalizedDistance <= 0.66) return 1; // Middle ring
  return 2; // Outer ring
}

export function CrateBlip({ x, y, distance, maxDistance }: CrateBlipProps) {
  const pulse = useSharedValue(1);
  const zone = useMemo(() => getZone(distance, maxDistance), [distance, maxDistance]);

  // Zone-based animation settings
  // edgeSharpness: 1 = solid, 0 = fully diffuse (glow only)
  const { duration, pulseScale, baseOpacity, blurRadius, edgeSharpness } = useMemo(() => {
    switch (zone) {
      case 0: // Inner ring - fast pulse, full opacity, sharp edges
        return { duration: 600, pulseScale: 1.4, baseOpacity: 1, blurRadius: 4, edgeSharpness: 1 };
      case 1: // Middle ring - slower pulse, softer edges
        return { duration: 1200, pulseScale: 1.25, baseOpacity: 0.9, blurRadius: 10, edgeSharpness: 0.7 };
      case 2: // Outer ring - gentle pulse, still visible
      default:
        return { duration: 2400, pulseScale: 1.1, baseOpacity: 0.8, blurRadius: 14, edgeSharpness: 0.5 };
    }
  }, [zone]);

  // Pulse animation based on zone
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(pulseScale, { duration: duration / 2 }),
        withTiming(1, { duration: duration / 2 })
      ),
      -1,
      true
    );
  }, [duration, pulseScale, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x },
      { translateY: y },
      { scale: pulse.value },
    ],
    opacity: baseOpacity,
  }));

  // Size based on distance (closer = larger)
  const normalizedDistance = Math.min(distance / maxDistance, 1);
  const size = 20 - normalizedDistance * 10; // 20px when close, 10px when far
  const isCollectable = distance <= COLLECTION_RADIUS_METERS;
  const color = isCollectable ? COLORS.crateBlipClose : COLORS.crateBlip;

  // Parse the color to add alpha for edge softness
  // edgeSharpness controls how solid the center is (1 = solid, 0 = transparent/glow only)
  const rgbaColor = `rgba(0, 255, 136, ${edgeSharpness})`;

  return (
    <Animated.View
      style={[
        styles.blip,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: rgbaColor,
          shadowColor: color,
          shadowOpacity: baseOpacity,
          shadowRadius: blurRadius,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  blip: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
  },
});
