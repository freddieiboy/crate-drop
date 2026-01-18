import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useInventoryStore } from '../store/inventoryStore';
import { markCollectionOpened } from '../services/supabase/crates';
import { COLORS } from '../utils/constants';
import type { CollectedCrate } from '../types';

interface CrateOpenModalProps {
  crate: CollectedCrate;
  onClose: () => void;
}

type Phase = 'ready' | 'opening' | 'revealed';

export function CrateOpenModal({ crate, onClose }: CrateOpenModalProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const markOpened = useInventoryStore((state) => state.markOpened);

  // Animation values
  const crateScale = useSharedValue(1);
  const crateRotate = useSharedValue(0);
  const crateY = useSharedValue(0);
  const fortuneOpacity = useSharedValue(0);
  const fortuneScale = useSharedValue(0.8);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 300 });
  }, [overlayOpacity]);

  const handleOpen = async () => {
    if (phase !== 'ready') return;

    setPhase('opening');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Shake animation
    crateRotate.value = withSequence(
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 50 })
    );

    crateScale.value = withSequence(
      withTiming(1.1, { duration: 200 }),
      withDelay(
        200,
        withTiming(1.3, { duration: 200, easing: Easing.out(Easing.ease) })
      )
    );

    crateY.value = withDelay(
      400,
      withTiming(-50, { duration: 300, easing: Easing.out(Easing.ease) })
    );

    // After shake, reveal fortune
    setTimeout(async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase('revealed');

      fortuneOpacity.value = withSpring(1);
      fortuneScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      crateScale.value = withTiming(0, { duration: 300 });

      // Mark as opened in store and database
      markOpened(crate.id);
      await markCollectionOpened(crate.id);
    }, 600);
  };

  const handleDismiss = () => {
    // Just close the modal - the crate stays in inventory with openedAt set
    onClose();
  };

  const crateStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: crateScale.value },
      { rotate: `${crateRotate.value}deg` },
      { translateY: crateY.value },
    ],
  }));

  const fortuneStyle = useAnimatedStyle(() => ({
    opacity: fortuneOpacity.value,
    transform: [{ scale: fortuneScale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Pressable style={styles.backdrop} onPress={handleDismiss} />

      <View style={styles.content}>
        {phase !== 'revealed' && (
          <Animated.View style={[styles.crateContainer, crateStyle]}>
            <Text style={styles.crateEmoji}>📦</Text>
          </Animated.View>
        )}

        {phase === 'ready' && (
          <TouchableOpacity style={styles.openButton} onPress={handleOpen}>
            <Text style={styles.openButtonText}>TAP TO OPEN</Text>
          </TouchableOpacity>
        )}

        {phase === 'opening' && (
          <Text style={styles.openingText}>Opening...</Text>
        )}

        {phase === 'revealed' && (
          <Animated.View style={[styles.fortuneContainer, fortuneStyle]}>
            <View style={styles.fortuneCard}>
              <Text style={styles.fortuneText}>{crate.fortune.message}</Text>
            </View>
            <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
              <Text style={styles.dismissButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  crateContainer: {
    marginBottom: 40,
  },
  crateEmoji: {
    fontSize: 120,
  },
  openButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  openButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  openingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    letterSpacing: 2,
  },
  fortuneContainer: {
    alignItems: 'center',
    width: '100%',
  },
  fortuneCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  fortuneText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 32,
  },
  dismissButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  dismissButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
