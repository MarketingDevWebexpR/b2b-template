/**
 * Skeleton Component
 * Elegant shimmer loading placeholders for luxury jewelry e-commerce
 * Features pearl-like luminescence effect with warm bone tones
 */

import React, { useEffect, memo } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Skeleton design tokens - Luxury warm tones
export const SKELETON_COLORS = {
  // Base colors - warm bone/pearl tones
  base: '#f5f0e8',           // Primary background - warm bone
  baseLight: '#faf7f2',      // Lighter variant - pearl
  baseDark: '#ebe4d8',       // Darker variant - taupe
  card: '#ffffff',           // Card background

  // Shimmer gradient colors
  shimmerStart: '#f5f0e8',
  shimmerMiddle: '#fffcf7',  // App background for seamless blend
  shimmerEnd: '#f5f0e8',

  // Warm gold shimmer variant (for CTAs, prices)
  shimmerGoldStart: '#f5f0e8',
  shimmerGoldMiddle: '#fdf9f0',
  shimmerGoldEnd: '#f5f0e8',
};

// Border radius presets
export const SKELETON_RADIUS = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
  full: 999,
};

/**
 * Helper to get staggered delay for list items
 */
export function getStaggeredDelay(index: number, baseDelay: number = 80): number {
  return index * baseDelay;
}

// Animation configuration - slower = more luxurious feel
const ANIMATION_CONFIG = {
  duration: 1800,        // 1.8s cycle - leisurely, luxury pace
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: DimensionValue;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  radius?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'round' | 'full';
  /** Shimmer style variant */
  shimmerStyle?: 'subtle' | 'warm';
  /** Custom style */
  style?: ViewStyle;
  /** Whether to show animation */
  animated?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
}

function SkeletonComponent({
  width = '100%',
  height = 16,
  radius = 4,
  shimmerStyle = 'subtle',
  style,
  animated = true,
  delay = 0,
}: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  const shimmerPosition = useSharedValue(0);

  // Calculate actual border radius using SKELETON_RADIUS presets
  const borderRadius = typeof radius === 'number'
    ? radius
    : SKELETON_RADIUS[radius] ?? 4;

  // Start shimmer animation with optional delay
  useEffect(() => {
    if (reducedMotion || !animated) return;

    const startAnimation = () => {
      shimmerPosition.value = withRepeat(
        withTiming(1, {
          duration: ANIMATION_CONFIG.duration,
          easing: ANIMATION_CONFIG.easing,
        }),
        -1,
        false
      );
    };

    if (delay > 0) {
      const timer = setTimeout(startAnimation, delay);
      return () => clearTimeout(timer);
    } else {
      startAnimation();
    }
  }, [reducedMotion, animated, delay]);

  // Animated shimmer style
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [0, 1],
      [-200, 200]
    );
    return {
      transform: [{ translateX }],
    };
  });

  // Select shimmer colors based on style
  const shimmerColors: readonly [string, string, string] = shimmerStyle === 'warm'
    ? [SKELETON_COLORS.shimmerGoldStart, SKELETON_COLORS.shimmerGoldMiddle, SKELETON_COLORS.shimmerGoldEnd]
    : [SKELETON_COLORS.shimmerStart, SKELETON_COLORS.shimmerMiddle, SKELETON_COLORS.shimmerEnd];

  const shouldAnimate = animated && !reducedMotion;

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {shouldAnimate && (
        <AnimatedLinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.shimmer, shimmerAnimatedStyle]}
        />
      )}
    </View>
  );
}

export const Skeleton = memo(SkeletonComponent);

// ============================================================================
// SKELETON VARIANTS
// ============================================================================

/**
 * Text line skeleton
 */
export interface SkeletonTextProps {
  width?: DimensionValue;
  style?: ViewStyle;
}

export const SkeletonText = memo(function SkeletonText({
  width = '100%',
  style
}: SkeletonTextProps) {
  return <Skeleton width={width} height={14} radius="sm" style={style} />;
});

/**
 * Heading skeleton
 */
export const SkeletonHeading = memo(function SkeletonHeading({
  width = '60%',
  style
}: SkeletonTextProps) {
  return <Skeleton width={width} height={24} radius="sm" style={style} />;
});

/**
 * Multiple text lines skeleton
 */
export interface SkeletonLinesProps {
  lines?: number;
  lastLineWidth?: DimensionValue;
  spacing?: number;
  style?: ViewStyle;
}

export const SkeletonLines = memo(function SkeletonLines({
  lines = 3,
  lastLineWidth = '70%',
  spacing = 8,
  style,
}: SkeletonLinesProps) {
  return (
    <View style={[{ gap: spacing }, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonText
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
});

/**
 * Image skeleton
 */
export interface SkeletonImageProps {
  width?: DimensionValue;
  height?: number;
  aspectRatio?: number;
  radius?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'round' | 'full';
  style?: ViewStyle;
  animated?: boolean;
  delay?: number;
}

export const SkeletonImage = memo(function SkeletonImage({
  width = '100%',
  height,
  aspectRatio,
  radius = 'md',
  style,
  animated = true,
  delay = 0,
}: SkeletonImageProps) {
  const imageStyle: ViewStyle = aspectRatio
    ? { width, aspectRatio }
    : { width, height: height || 200 };

  return (
    <View style={[imageStyle, style]}>
      <Skeleton
        width="100%"
        height={height || 200}
        radius={radius}
        animated={animated}
        delay={delay}
        style={{ flex: aspectRatio ? 1 : undefined }}
      />
    </View>
  );
});

/**
 * Circle skeleton (for avatars, icons)
 */
export interface SkeletonCircleProps {
  size?: number;
  style?: ViewStyle;
  animated?: boolean;
  delay?: number;
}

export const SkeletonCircle = memo(function SkeletonCircle({
  size = 48,
  style,
  animated = true,
  delay = 0,
}: SkeletonCircleProps) {
  return <Skeleton width={size} height={size} radius="full" animated={animated} delay={delay} style={style} />;
});

/**
 * Button skeleton
 */
export interface SkeletonButtonProps {
  width?: DimensionValue;
  height?: number;
  style?: ViewStyle;
}

export const SkeletonButton = memo(function SkeletonButton({
  width = '100%',
  height = 56,
  style,
}: SkeletonButtonProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      radius={28}
      shimmerStyle="warm"
      style={style}
    />
  );
});

/**
 * Card skeleton container
 */
export interface SkeletonCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SkeletonCard = memo(function SkeletonCard({
  children,
  style,
}: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
});

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

/**
 * Horizontal row of skeletons with spacing
 */
export interface SkeletonRowProps {
  children: React.ReactNode;
  /** Gap between items (preferred over spacing) */
  gap?: number;
  /** @deprecated Use gap instead */
  spacing?: number;
  style?: ViewStyle;
}

export const SkeletonRow = memo(function SkeletonRow({
  children,
  gap,
  spacing = 12,
  style,
}: SkeletonRowProps) {
  const gapValue = gap ?? spacing;
  return (
    <View style={[styles.row, { gap: gapValue }, style]}>
      {children}
    </View>
  );
});

/**
 * Vertical stack of skeletons with spacing
 */
export interface SkeletonStackProps {
  children: React.ReactNode;
  /** Gap between items (preferred over spacing) */
  gap?: number;
  /** @deprecated Use gap instead */
  spacing?: number;
  style?: ViewStyle;
}

export const SkeletonStack = memo(function SkeletonStack({
  children,
  gap,
  spacing = 12,
  style,
}: SkeletonStackProps) {
  const gapValue = gap ?? spacing;
  return (
    <View style={[{ gap: gapValue }, style]}>
      {children}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: SKELETON_COLORS.base,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '200%',
  },
  card: {
    backgroundColor: SKELETON_COLORS.baseLight,
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Skeleton;
