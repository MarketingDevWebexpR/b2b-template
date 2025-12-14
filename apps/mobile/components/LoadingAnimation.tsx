/**
 * LoadingAnimation Component - Maison Bijoux
 * Elegant, visible loading animation for luxury jewelry app
 */

import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Brand Colors
const COLORS = {
  gold: '#c9a96e',
  goldLight: '#d4b896',
  goldDark: '#a68a5b',
  hermes: '#f67828',
  cream: '#fffcf7',
  charcoal: '#2b333f',
  white: '#ffffff',
};

export type LoadingVariant = 'fullScreen' | 'inline' | 'overlay';
export type LoadingSize = 'small' | 'medium' | 'large';

export interface LoadingAnimationProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  showBrandName?: boolean;
  loadingText?: string;
  visible?: boolean;
}

const SIZE_CONFIG = {
  small: 40,
  medium: 60,
  large: 80,
};

// Elegant rotating ring with gold gradient effect
const GoldRing = memo(function GoldRing({ size }: { size: number }) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Smooth continuous rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );

    // Subtle breathing effect
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(pulse);
    };
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: pulse.value }],
  }));

  const ringSize = size;
  const borderWidth = size * 0.06;

  return (
    <View style={[styles.ringContainer, { width: ringSize, height: ringSize }]}>
      {/* Outer glow */}
      <View
        style={[
          styles.ringGlow,
          {
            width: ringSize + 20,
            height: ringSize + 20,
            borderRadius: (ringSize + 20) / 2,
            backgroundColor: `${COLORS.gold}20`,
          },
        ]}
      />

      {/* Main rotating ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: borderWidth,
            borderColor: COLORS.gold,
            borderTopColor: COLORS.hermes,
            borderRightColor: COLORS.goldLight,
          },
          ringStyle,
        ]}
      />

      {/* Center dot */}
      <View
        style={[
          styles.centerDot,
          {
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: size * 0.075,
            backgroundColor: COLORS.gold,
          },
        ]}
      />
    </View>
  );
});

// Three dots animation
const ThreeDots = memo(function ThreeDots({ size }: { size: number }) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const duration = 400;
    const delay = 150;

    dot1.value = withRepeat(
      withSequence(
        withTiming(-size * 0.15, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    dot2.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-size * 0.15, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    dot3.value = withDelay(
      delay * 2,
      withRepeat(
        withSequence(
          withTiming(-size * 0.15, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(dot1);
      cancelAnimation(dot2);
      cancelAnimation(dot3);
    };
  }, [size]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  const dotSize = size * 0.18;
  const gap = size * 0.12;

  return (
    <View style={[styles.dotsContainer, { gap }]}>
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: COLORS.gold },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: COLORS.hermes },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: COLORS.gold },
          dot3Style,
        ]}
      />
    </View>
  );
});

// Main Loading Animation Component
export const LoadingAnimation = memo(function LoadingAnimation({
  variant = 'inline',
  size = 'medium',
  showBrandName = false,
  loadingText,
  visible = true,
}: LoadingAnimationProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const animationSize = SIZE_CONFIG[size];

  const renderContent = () => (
    <View style={styles.contentContainer}>
      <GoldRing size={animationSize} />

      {loadingText && (
        <Text style={styles.loadingText}>{loadingText}</Text>
      )}

      {showBrandName && variant === 'fullScreen' && (
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>MAISON BIJOUX</Text>
          <View style={styles.brandLine} />
        </View>
      )}
    </View>
  );

  if (variant === 'inline') {
    return (
      <Animated.View style={[styles.inlineContainer, containerStyle]}>
        {renderContent()}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        variant === 'fullScreen' ? styles.fullScreenContainer : styles.overlayContainer,
        containerStyle,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={styles.androidBackground} />
      )}
      {renderContent()}
    </Animated.View>
  );
});

// Convenience exports
export function InlineLoader({
  size = 'small',
  ...props
}: Omit<LoadingAnimationProps, 'variant' | 'showBrandName'>) {
  return <LoadingAnimation {...props} variant="inline" size={size} showBrandName={false} />;
}

export function FullScreenLoader(props: Omit<LoadingAnimationProps, 'variant'>) {
  return <LoadingAnimation {...props} variant="fullScreen" />;
}

export function OverlayLoader(props: Omit<LoadingAnimationProps, 'variant'>) {
  return <LoadingAnimation {...props} variant="overlay" />;
}

// Legacy exports for compatibility
export const DiamondLoader = FullScreenLoader;
export const RingsLoader = FullScreenLoader;
export const TypographyLoader = FullScreenLoader;
export const ArtDecoLoader = FullScreenLoader;
export const ShimmerLoader = FullScreenLoader;

const styles = StyleSheet.create({
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },

  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },

  inlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 252, 247, 0.95)',
  },

  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringGlow: {
    position: 'absolute',
  },

  ring: {
    position: 'absolute',
  },

  centerDot: {
    position: 'absolute',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },

  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dot: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  loadingText: {
    marginTop: 20,
    fontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter',
    fontSize: 13,
    color: COLORS.charcoal,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  brandContainer: {
    marginTop: 40,
    alignItems: 'center',
  },

  brandText: {
    fontFamily: Platform.OS === 'ios' ? 'PlayfairDisplay-Medium' : 'PlayfairDisplay',
    fontSize: 14,
    color: COLORS.charcoal,
    letterSpacing: 4,
  },

  brandLine: {
    marginTop: 8,
    width: 40,
    height: 2,
    backgroundColor: COLORS.gold,
  },
});

export default LoadingAnimation;
