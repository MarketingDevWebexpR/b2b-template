/**
 * FlyToCartAnimation Component
 * Premium fly-to-cart animation that renders at root level.
 * Product thumbnail flies from the add-to-cart button to the cart icon
 * following a smooth Bezier curve path.
 */

import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Image, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useCartAnimation } from '@/context/CartAnimationContext';
import { hapticFeedback } from '@/constants/haptics';
import { springConfigs, easings } from '@/constants/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design tokens
const COLORS = {
  white: '#ffffff',
  hermes: '#f67828',
  shadow: 'rgba(0, 0, 0, 0.15)',
};

// Animation configuration
const THUMBNAIL_SIZE = 56;
const THUMBNAIL_START_SCALE = 0.3;
const THUMBNAIL_FLIGHT_SCALE = 0.8;
const THUMBNAIL_END_SCALE = 0.35;

// Timing configuration
const TIMING = {
  launch: 100,      // Initial scale-up
  flight: 450,      // Main flight duration
  landing: 150,     // Fade out and bounce
  total: 700,       // Total animation time
};

interface FlyToCartAnimationProps {
  // Optional callback when animation completes
  onAnimationComplete?: () => void;
}

export function FlyToCartAnimation({ onAnimationComplete }: FlyToCartAnimationProps) {
  const { flyingItem, clearFlyingItem, triggerBadgeBounce } = useCartAnimation();

  // Animation values
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(THUMBNAIL_START_SCALE);
  const rotation = useSharedValue(0);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    // Trigger badge bounce on cart icon
    triggerBadgeBounce();

    // Success haptic
    hapticFeedback.addToCartSuccess();

    // Clear the flying item
    clearFlyingItem();

    // Call optional callback
    onAnimationComplete?.();
  }, [triggerBadgeBounce, clearFlyingItem, onAnimationComplete]);

  // Start animation when flyingItem changes
  useEffect(() => {
    if (!flyingItem) {
      // Reset values when no flying item
      progress.value = 0;
      opacity.value = 0;
      scale.value = THUMBNAIL_START_SCALE;
      rotation.value = 0;
      return;
    }

    // Launch haptic
    hapticFeedback.addToCartPress();

    // Reset values
    progress.value = 0;
    opacity.value = 0;
    scale.value = THUMBNAIL_START_SCALE;
    rotation.value = 0;

    // Phase 1: Launch - thumbnail appears and scales up
    opacity.value = withTiming(1, { duration: TIMING.launch });
    scale.value = withTiming(THUMBNAIL_FLIGHT_SCALE, {
      duration: TIMING.launch,
      easing: easings.bounce,
    });

    // Phase 2: Flight - follow Bezier curve path
    progress.value = withDelay(
      TIMING.launch,
      withTiming(1, {
        duration: TIMING.flight,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    // Scale shrinks during flight
    scale.value = withDelay(
      TIMING.launch,
      withTiming(THUMBNAIL_END_SCALE, {
        duration: TIMING.flight,
        easing: easings.decelerate,
      })
    );

    // Subtle rotation during flight
    rotation.value = withDelay(
      TIMING.launch,
      withTiming(-15, {
        duration: TIMING.flight,
        easing: easings.standard,
      })
    );

    // Phase 3: Landing - fade out
    opacity.value = withDelay(
      TIMING.launch + TIMING.flight - 50,
      withTiming(0, {
        duration: TIMING.landing,
        easing: easings.accelerate,
      })
    );

    // Complete animation after total duration
    const timeout = setTimeout(() => {
      handleAnimationComplete();
    }, TIMING.total);

    return () => clearTimeout(timeout);
  }, [flyingItem]);

  // Animated style for the flying thumbnail
  const thumbnailStyle = useAnimatedStyle(() => {
    if (!flyingItem) {
      return {
        opacity: 0,
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0 }, { rotate: '0deg' }],
      };
    }

    const { startPosition, endPosition } = flyingItem;

    // Calculate Bezier control point for the curve
    // The thumbnail rises slightly then falls to the cart
    const controlPointX = (startPosition.x + endPosition.x) / 2;
    const controlPointY = Math.min(startPosition.y, endPosition.y) - 120; // Rise 120px above

    // Quadratic Bezier curve interpolation
    const t = progress.value;
    const oneMinusT = 1 - t;

    // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const translateX =
      oneMinusT * oneMinusT * startPosition.x +
      2 * oneMinusT * t * controlPointX +
      t * t * endPosition.x;

    const translateY =
      oneMinusT * oneMinusT * startPosition.y +
      2 * oneMinusT * t * controlPointY +
      t * t * endPosition.y;

    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX - THUMBNAIL_SIZE / 2 },
        { translateY: translateY - THUMBNAIL_SIZE / 2 },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  // Don't render anything if no flying item
  if (!flyingItem) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.thumbnail, thumbnailStyle]}>
        {/* Glow effect */}
        <View style={styles.glow} />

        {/* Product image */}
        <Image
          source={{ uri: flyingItem.productImage }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Shine overlay */}
        <View style={styles.shine} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },

  thumbnail: {
    position: 'absolute',
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: THUMBNAIL_SIZE / 2,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: THUMBNAIL_SIZE / 2,
  },

  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: (THUMBNAIL_SIZE + 8) / 2,
    backgroundColor: COLORS.hermes,
    opacity: 0.2,
  },

  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '40%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }, { translateX: -10 }],
  },
});

export default FlyToCartAnimation;
