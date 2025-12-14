/**
 * AnimatedCartIcon Component
 * Cart icon for the tab bar with animated badge bounce and icon jiggle
 * when items land from the fly-to-cart animation.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { ShoppingBag } from 'lucide-react-native';
import { useCart } from '@/context/CartContext';
import { useCartAnimation } from '@/context/CartAnimationContext';
import { springConfigs } from '@/constants/animations';

// Design tokens
const COLORS = {
  hermes: '#f67828',
  white: '#ffffff',
};

interface AnimatedCartIconProps {
  color: string;
  focused: boolean;
}

export function AnimatedCartIcon({ color, focused }: AnimatedCartIconProps) {
  const { cart } = useCart();
  const { registerCartIconPosition, badgeBounceCount } = useCartAnimation();
  const itemCount = cart.totalItems;

  // Ref to track the icon view
  const iconRef = useRef<View>(null);

  // Animation values
  const badgeScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const iconScale = useSharedValue(1);

  // Track the previous bounce count to detect changes
  const prevBounceCount = useRef(badgeBounceCount);

  // Measure and register cart icon position
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    if (iconRef.current) {
      iconRef.current.measureInWindow((x, y, width, height) => {
        // Register the center of the icon
        registerCartIconPosition({
          x: x + width / 2,
          y: y + height / 2,
        });
      });
    }
  }, [registerCartIconPosition]);

  // Trigger bounce animation when badgeBounceCount changes
  useEffect(() => {
    if (badgeBounceCount > prevBounceCount.current) {
      prevBounceCount.current = badgeBounceCount;

      // Badge bounce animation
      badgeScale.value = withSequence(
        withSpring(1.35, { damping: 8, stiffness: 300 }),
        withSpring(0.9, { damping: 10, stiffness: 250 }),
        withSpring(1.15, { damping: 12, stiffness: 200 }),
        withSpring(1, springConfigs.gentle)
      );

      // Icon jiggle animation
      iconRotation.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 80 }),
        withTiming(-5, { duration: 70 }),
        withTiming(5, { duration: 60 }),
        withTiming(0, { duration: 50 })
      );

      // Icon pulse
      iconScale.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 300 }),
        withSpring(1, springConfigs.button)
      );
    }
  }, [badgeBounceCount]);

  // Animated styles
  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${iconRotation.value}deg` },
      { scale: iconScale.value },
    ],
  }));

  return (
    <View
      ref={iconRef}
      style={styles.container}
      onLayout={handleLayout}
    >
      <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
        <ShoppingBag
          size={24}
          color={color}
          strokeWidth={focused ? 2.5 : 2}
        />
      </Animated.View>

      {itemCount > 0 && (
        <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },

  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.hermes,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
});

export default AnimatedCartIcon;
