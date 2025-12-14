/**
 * LoadingAnimation Component - Maison Bijoux
 * Elegant Lottie-based loading animation for luxury jewelry app
 */

import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

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
  small: 60,
  medium: 100,
  large: 140,
};

// Lottie Animation Component
const LuxuryLottie = memo(function LuxuryLottie({ size }: { size: number }) {
  return (
    <View style={[styles.lottieContainer, { width: size, height: size }]}>
      <LottieView
        source={require('../assets/animations/luxury-loader.json')}
        autoPlay
        loop
        speed={1}
        style={{ width: size, height: size }}
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
      <LuxuryLottie size={animationSize} />

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

  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
