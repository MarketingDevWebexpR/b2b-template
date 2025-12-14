/**
 * LoadingAnimation Component - Maison Bijoux
 * A stunning, luxury-themed loading animation for a high-end jewelry mobile app
 *
 * Features:
 * - Multiple variants: fullScreen, inline, overlay
 * - Five distinct animation styles: diamond, rings, typography, artDeco, shimmer
 * - Diamond facet geometric animations
 * - Elegant brand typography reveal
 * - Sophisticated shimmer and particle effects
 * - Gold ring expansion animation
 * - Art Deco geometric patterns
 * - 60fps smooth animations using react-native-reanimated
 *
 * @author Maison Bijoux Design System
 * @version 2.0.0
 */

import React, { useEffect, useMemo, memo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SHADOWS, Z_INDEX, SPACING, FONT_SIZES } from '../constants/designTokens';
import { springConfigs, easings, durations } from '../constants/animations';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type LoadingVariant = 'fullScreen' | 'inline' | 'overlay';
export type LoadingStyle = 'diamond' | 'rings' | 'typography' | 'artDeco' | 'shimmer';
export type LoadingSize = 'small' | 'medium' | 'large';

export interface LoadingAnimationProps {
  /** Display variant - fullScreen covers entire screen, inline fits in container, overlay shows on top of content */
  variant?: LoadingVariant;
  /** Animation style - different luxury-themed animations */
  style?: LoadingStyle;
  /** Size preset */
  size?: LoadingSize;
  /** Show brand name text */
  showBrandName?: boolean;
  /** Custom loading text */
  loadingText?: string;
  /** Custom size for inline variant (overrides size preset) */
  customSize?: number;
  /** Whether animation is visible */
  visible?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Brand Colors - Luxury Jewelry Palette
const BRAND = {
  hermes: '#f67828',
  hermesLight: '#ff9a5c',
  hermesDark: '#d45a10',
  gold: '#c9a96e',
  goldLight: '#e8d5b0',
  goldDark: '#a88a4a',
  goldShimmer: '#f5e6c8',
  cream: '#fffcf7',
  creamDark: '#f5f0e8',
  charcoal: '#2b333f',
  charcoalLight: '#4a5568',
  white: '#ffffff',
  platinum: '#e5e4e2',
  platinumLight: '#f0efed',
} as const;

// Size configurations
const SIZE_CONFIG = {
  small: { container: 60, element: 24 },
  medium: { container: 100, element: 40 },
  large: { container: 160, element: 64 },
} as const;

// Animation timing constants
const TIMING = {
  diamondRotation: 4000,
  ringExpand: 2800,
  shimmerSweep: 2200,
  pulseInterval: 2000,
  textReveal: 500,
  particleDrift: 4500,
  breathe: 3000,
  artDecoRotate: 10000,
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getSize = (size: LoadingSize, customSize?: number): number => {
  if (customSize) return customSize;
  return SIZE_CONFIG[size].container;
};

// =============================================================================
// DIAMOND ANIMATION COMPONENT
// Elegant rotating diamond with faceted surface and shimmer effect
// =============================================================================

interface DiamondAnimationProps {
  size: number;
}

const DiamondAnimation = memo(function DiamondAnimation({ size }: DiamondAnimationProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const innerRotation = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Entrance animation
    opacity.value = withTiming(1, { duration: durations.slow, easing: easings.elegant });
    scale.value = withSequence(
      withTiming(1.05, { duration: durations.slow, easing: easings.elegant }),
      withSpring(1, springConfigs.gentle)
    );

    // Continuous slow rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: TIMING.diamondRotation, easing: Easing.linear }),
      -1,
      false
    );

    // Counter-rotation for inner facet
    innerRotation.value = withRepeat(
      withTiming(-360, { duration: TIMING.diamondRotation * 1.5, easing: Easing.linear }),
      -1,
      false
    );

    // Shimmer sweep effect
    shimmerPosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: TIMING.shimmerSweep, easing: easings.standard }),
        withTiming(-1, { duration: 0 })
      ),
      -1,
      false
    );

    // Breathing glow
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: TIMING.breathe / 2, easing: easings.elegant }),
        withTiming(0.25, { duration: TIMING.breathe / 2, easing: easings.elegant })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(innerRotation);
      cancelAnimation(shimmerPosition);
      cancelAnimation(glowOpacity);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${innerRotation.value}deg` }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerPosition.value, [-1, 1], [-size * 0.8, size * 0.8]) }],
    opacity: interpolate(shimmerPosition.value, [-1, -0.3, 0, 0.3, 1], [0, 0.8, 1, 0.8, 0]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const facetSize = size * 0.45;
  const innerFacetSize = facetSize * 0.55;

  return (
    <View style={[styles.animationContainer, { width: size, height: size }]}>
      {/* Outer glow */}
      <Animated.View style={[styles.diamondGlow, { width: size * 0.9, height: size * 0.9 }, glowStyle]}>
        <LinearGradient
          colors={[`${BRAND.gold}00`, `${BRAND.gold}40`, `${BRAND.gold}00`]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.diamondOuter, containerStyle]}>
        {/* Main diamond shape */}
        <View style={[styles.diamondShape, { width: facetSize, height: facetSize }]}>
          <LinearGradient
            colors={[BRAND.goldLight, BRAND.gold, BRAND.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Diamond highlight */}
          <View style={styles.diamondHighlight} />
        </View>

        {/* Inner facet with counter-rotation */}
        <Animated.View style={[styles.diamondInnerContainer, innerStyle]}>
          <View style={[styles.diamondShape, { width: innerFacetSize, height: innerFacetSize }]}>
            <LinearGradient
              colors={[BRAND.white, BRAND.goldShimmer, BRAND.goldLight]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </Animated.View>

        {/* Sparkle points at corners */}
        {[0, 90, 180, 270].map((angle, index) => (
          <View
            key={index}
            style={[
              styles.sparklePoint,
              {
                transform: [{ rotate: `${angle}deg` }, { translateY: -facetSize * 0.7 }],
              },
            ]}
          >
            <View style={[styles.sparkle, { backgroundColor: BRAND.white }]} />
          </View>
        ))}
      </Animated.View>

      {/* Shimmer overlay */}
      <View style={styles.shimmerMask} pointerEvents="none">
        <Animated.View style={[styles.shimmerBar, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { width: size * 0.4 }]}
          />
        </Animated.View>
      </View>
    </View>
  );
});

// =============================================================================
// EXPANDING GOLD RINGS ANIMATION
// Concentric rings that pulse and expand with elegant timing
// =============================================================================

interface RingProps {
  index: number;
  maxRadius: number;
  delay: number;
}

const ExpandingRing = memo(function ExpandingRing({ index, maxRadius, delay }: RingProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration: TIMING.ringExpand, easing: easings.elegant })
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 200 }),
          withTiming(0, { duration: TIMING.ringExpand - 200, easing: easings.decelerate })
        ),
        -1,
        false
      )
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [delay]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringSize = maxRadius * 2;
  const borderWidth = 1.5 - index * 0.4;

  return (
    <Animated.View
      style={[
        styles.expandingRing,
        {
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: Math.max(borderWidth, 0.5),
          borderColor: BRAND.gold,
        },
        ringStyle,
      ]}
    />
  );
});

const RingsAnimation = memo(function RingsAnimation({ size }: { size: number }) {
  const centerScale = useSharedValue(0.8);
  const centerOpacity = useSharedValue(0);
  const centerPulse = useSharedValue(1);

  useEffect(() => {
    centerOpacity.value = withTiming(1, { duration: durations.slow });
    centerScale.value = withSpring(1, springConfigs.gentle);

    centerPulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: TIMING.pulseInterval / 2, easing: easings.elegant }),
        withTiming(1, { duration: TIMING.pulseInterval / 2, easing: easings.elegant })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(centerScale);
      cancelAnimation(centerPulse);
    };
  }, []);

  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerScale.value * centerPulse.value }],
    opacity: centerOpacity.value,
  }));

  const ringCount = 3;
  const maxRadius = size * 0.42;
  const ringDelays = [0, 500, 1000];

  return (
    <View style={[styles.animationContainer, { width: size, height: size }]}>
      {/* Expanding rings */}
      {Array.from({ length: ringCount }).map((_, index) => (
        <ExpandingRing
          key={index}
          index={index}
          maxRadius={maxRadius}
          delay={ringDelays[index]}
        />
      ))}

      {/* Center jewel */}
      <Animated.View style={[styles.centerJewel, centerStyle]}>
        <LinearGradient
          colors={[BRAND.goldLight, BRAND.gold, BRAND.goldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
        />
        <View style={styles.jewelHighlight} />
      </Animated.View>
    </View>
  );
});

// =============================================================================
// TYPOGRAPHY ANIMATION
// Elegant letter-by-letter reveal with monogram and decorative elements
// =============================================================================

const TypographyAnimation = memo(function TypographyAnimation({
  size,
  showBrandName,
}: {
  size: number;
  showBrandName: boolean;
}) {
  const brandText = 'MAISON BIJOUX';
  const letterCount = brandText.length;

  // Create shared values for each letter
  const letterOpacities = useMemo(
    () => Array.from({ length: letterCount }, () => useSharedValue(0)),
    [letterCount]
  );
  const letterTranslates = useMemo(
    () => Array.from({ length: letterCount }, () => useSharedValue(12)),
    [letterCount]
  );

  const monogramScale = useSharedValue(0.8);
  const monogramOpacity = useSharedValue(0);
  const monogramRotation = useSharedValue(-10);
  const underlineWidth = useSharedValue(0);
  const underlineOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    // Container fade in
    containerOpacity.value = withTiming(1, { duration: durations.normal });

    // Monogram entrance
    monogramOpacity.value = withDelay(100, withTiming(1, { duration: durations.slow }));
    monogramScale.value = withDelay(100, withSpring(1, springConfigs.gentle));
    monogramRotation.value = withDelay(100, withSpring(0, springConfigs.gentle));

    // Sequential letter reveal with stagger
    letterOpacities.forEach((opacity, index) => {
      const delay = 400 + index * 55;
      opacity.value = withDelay(delay, withTiming(1, { duration: TIMING.textReveal, easing: easings.elegant }));
    });

    letterTranslates.forEach((translate, index) => {
      const delay = 400 + index * 55;
      translate.value = withDelay(delay, withSpring(0, springConfigs.gentle));
    });

    // Decorative underline
    const underlineDelay = 400 + letterCount * 55 + 200;
    underlineOpacity.value = withDelay(underlineDelay, withTiming(1, { duration: durations.normal }));
    underlineWidth.value = withDelay(
      underlineDelay,
      withTiming(1, { duration: durations.slow, easing: easings.elegant })
    );

    return () => {
      letterOpacities.forEach((o) => cancelAnimation(o));
      letterTranslates.forEach((t) => cancelAnimation(t));
      cancelAnimation(monogramScale);
      cancelAnimation(monogramRotation);
      cancelAnimation(underlineWidth);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const monogramStyle = useAnimatedStyle(() => ({
    opacity: monogramOpacity.value,
    transform: [{ scale: monogramScale.value }, { rotate: `${monogramRotation.value}deg` }],
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    width: `${underlineWidth.value * 50}%`,
    opacity: underlineOpacity.value,
  }));

  return (
    <Animated.View style={[styles.typographyContainer, containerStyle]}>
      {/* Elegant Monogram */}
      <Animated.View style={[styles.monogramContainer, monogramStyle]}>
        <Text style={styles.monogramText}>MB</Text>
        <View style={styles.monogramFrame} />
        <View style={styles.monogramFrameInner} />
      </Animated.View>

      {/* Brand name with animated letters */}
      {showBrandName && (
        <View style={styles.brandNameContainer}>
          <View style={styles.letterRow}>
            {brandText.split('').map((letter, index) => {
              const letterStyle = useAnimatedStyle(() => ({
                opacity: letterOpacities[index].value,
                transform: [{ translateY: letterTranslates[index].value }],
              }));

              return (
                <Animated.Text
                  key={index}
                  style={[styles.brandLetter, letter === ' ' && styles.letterSpace, letterStyle]}
                >
                  {letter}
                </Animated.Text>
              );
            })}
          </View>

          {/* Decorative underline */}
          <View style={styles.underlineContainer}>
            <Animated.View style={[styles.brandUnderline, underlineStyle]} />
          </View>
        </View>
      )}
    </Animated.View>
  );
});

// =============================================================================
// ART DECO GEOMETRIC ANIMATION
// Sophisticated rotating geometric patterns inspired by 1920s luxury design
// =============================================================================

const ArtDecoAnimation = memo(function ArtDecoAnimation({ size }: { size: number }) {
  const outerRotation = useSharedValue(0);
  const innerRotation = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const lineOpacities = useMemo(() => Array.from({ length: 8 }, () => useSharedValue(0.4)), []);

  useEffect(() => {
    // Entrance
    opacity.value = withTiming(1, { duration: durations.slow });
    scale.value = withSpring(1, springConfigs.gentle);

    // Slow elegant rotation
    outerRotation.value = withRepeat(
      withTiming(360, { duration: TIMING.artDecoRotate, easing: Easing.linear }),
      -1,
      false
    );

    // Counter-rotation for inner element
    innerRotation.value = withRepeat(
      withTiming(-360, { duration: TIMING.artDecoRotate * 1.4, easing: Easing.linear }),
      -1,
      false
    );

    // Pulsing decorative lines
    lineOpacities.forEach((lineOpacity, index) => {
      lineOpacity.value = withDelay(
        index * 120,
        withRepeat(
          withSequence(
            withTiming(0.9, { duration: 900, easing: easings.elegant }),
            withTiming(0.3, { duration: 900, easing: easings.elegant })
          ),
          -1,
          true
        )
      );
    });

    return () => {
      cancelAnimation(outerRotation);
      cancelAnimation(innerRotation);
      lineOpacities.forEach((o) => cancelAnimation(o));
    };
  }, []);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${outerRotation.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${innerRotation.value}deg` }],
  }));

  const frameSize = size * 0.65;
  const innerFrameSize = size * 0.4;
  const centerSize = size * 0.15;

  return (
    <View style={[styles.animationContainer, { width: size, height: size }]}>
      {/* Outer octagonal frame */}
      <Animated.View style={[styles.artDecoOuter, { width: frameSize, height: frameSize }, outerStyle]}>
        {/* Radiating lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
          const lineStyle = useAnimatedStyle(() => ({
            opacity: lineOpacities[index].value,
          }));

          return (
            <Animated.View
              key={index}
              style={[
                styles.artDecoLine,
                { transform: [{ rotate: `${angle}deg` }], height: frameSize * 0.45 },
                lineStyle,
              ]}
            />
          );
        })}

        {/* Inner rotating square */}
        <Animated.View
          style={[
            styles.artDecoInner,
            { width: innerFrameSize, height: innerFrameSize },
            innerStyle,
          ]}
        >
          {/* Center gem */}
          <View style={[styles.artDecoCenter, { width: centerSize, height: centerSize }]}>
            <LinearGradient
              colors={[BRAND.goldLight, BRAND.gold, BRAND.hermes]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 4 }]}
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Corner accents */}
      {[45, 135, 225, 315].map((angle, index) => (
        <View
          key={index}
          style={[
            styles.artDecoCorner,
            {
              transform: [{ rotate: `${angle}deg` }, { translateY: -size * 0.38 }],
            },
          ]}
        />
      ))}
    </View>
  );
});

// =============================================================================
// SHIMMER / PEARL ANIMATION
// Ethereal floating particles with soft glow and pearl center
// =============================================================================

interface ShimmerParticleProps {
  index: number;
  containerSize: number;
}

const ShimmerParticle = memo(function ShimmerParticle({ index, containerSize }: ShimmerParticleProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  // Pre-calculate random values
  const startX = useMemo(() => (Math.random() - 0.5) * containerSize * 0.7, [containerSize]);
  const startY = useMemo(() => (Math.random() - 0.5) * containerSize * 0.7, [containerSize]);
  const driftX = useMemo(() => (Math.random() - 0.5) * 35, []);
  const driftY = useMemo(() => (Math.random() - 0.5) * 35, []);
  const particleScale = useMemo(() => 0.4 + Math.random() * 0.6, []);

  useEffect(() => {
    const delay = index * 180;

    x.value = startX;
    y.value = startY;

    // Ethereal fade cycle
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.75, { duration: 1100, easing: easings.elegant }),
          withTiming(0.15, { duration: 1600, easing: easings.elegant })
        ),
        -1,
        true
      )
    );

    // Gentle floating drift
    x.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + driftX, { duration: TIMING.particleDrift, easing: easings.standard }),
          withTiming(startX, { duration: TIMING.particleDrift, easing: easings.standard })
        ),
        -1,
        true
      )
    );

    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startY + driftY, { duration: TIMING.particleDrift * 0.85, easing: easings.standard }),
          withTiming(startY, { duration: TIMING.particleDrift * 0.85, easing: easings.standard })
        ),
        -1,
        true
      )
    );

    // Gentle scale breathing
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(particleScale * 1.3, { duration: 1300, easing: easings.elegant }),
          withTiming(particleScale, { duration: 1300, easing: easings.elegant })
        ),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(opacity);
      cancelAnimation(scale);
    };
  }, [index, startX, startY, driftX, driftY, particleScale]);

  const particleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.shimmerParticle, particleStyle]}>
      <LinearGradient colors={[BRAND.white, BRAND.goldShimmer]} style={styles.particleGradient} />
    </Animated.View>
  );
});

const ShimmerAnimation = memo(function ShimmerAnimation({ size }: { size: number }) {
  const pearlScale = useSharedValue(0.85);
  const pearlOpacity = useSharedValue(0);
  const pearlPulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.25);

  useEffect(() => {
    pearlOpacity.value = withTiming(1, { duration: durations.slow });
    pearlScale.value = withSpring(1, springConfigs.gentle);

    pearlPulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: TIMING.breathe / 2, easing: easings.elegant }),
        withTiming(1, { duration: TIMING.breathe / 2, easing: easings.elegant })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1800, easing: easings.elegant }),
        withTiming(0.2, { duration: 1800, easing: easings.elegant })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(pearlScale);
      cancelAnimation(pearlPulse);
      cancelAnimation(glowOpacity);
    };
  }, []);

  const pearlStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pearlScale.value * pearlPulse.value }],
    opacity: pearlOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const particleCount = 10;

  return (
    <View style={[styles.animationContainer, { width: size, height: size }]}>
      {/* Soft ambient glow */}
      <Animated.View
        style={[styles.shimmerGlow, { width: size * 0.85, height: size * 0.85, borderRadius: size * 0.425 }, glowStyle]}
      >
        <LinearGradient
          colors={['transparent', `${BRAND.gold}35`, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Floating shimmer particles */}
      {Array.from({ length: particleCount }).map((_, index) => (
        <ShimmerParticle key={index} index={index} containerSize={size} />
      ))}

      {/* Center pearl */}
      <Animated.View style={[styles.pearlCenter, pearlStyle]}>
        <LinearGradient
          colors={[BRAND.white, BRAND.platinum, BRAND.goldLight]}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.75, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        />
        {/* Pearl luster highlight */}
        <View style={styles.pearlHighlight} />
        <View style={styles.pearlSecondaryHighlight} />
      </Animated.View>
    </View>
  );
});

// =============================================================================
// MAIN LOADING ANIMATION COMPONENT
// =============================================================================

export const LoadingAnimation = memo(function LoadingAnimation({
  variant = 'inline',
  style = 'diamond',
  size = 'medium',
  showBrandName = true,
  loadingText,
  customSize,
  visible = true,
}: LoadingAnimationProps) {
  const containerOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      containerOpacity.value = withTiming(1, { duration: durations.normal });
      textOpacity.value = withDelay(450, withTiming(1, { duration: durations.slow, easing: easings.elegant }));
    } else {
      containerOpacity.value = withTiming(0, { duration: durations.fast });
      textOpacity.value = withTiming(0, { duration: durations.fast });
    }
  }, [visible]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!visible) return null;

  // Calculate animation size
  const animationSize = getSize(size, customSize);
  const adjustedSize = variant === 'fullScreen' ? Math.min(animationSize * 1.4, 200) : animationSize;

  // Render the selected animation style
  const renderAnimation = () => {
    switch (style) {
      case 'diamond':
        return <DiamondAnimation size={adjustedSize} />;
      case 'rings':
        return <RingsAnimation size={adjustedSize} />;
      case 'typography':
        return <TypographyAnimation size={adjustedSize} showBrandName={showBrandName} />;
      case 'artDeco':
        return <ArtDecoAnimation size={adjustedSize} />;
      case 'shimmer':
        return <ShimmerAnimation size={adjustedSize} />;
      default:
        return <DiamondAnimation size={adjustedSize} />;
    }
  };

  // Container styles based on variant
  const getContainerStyle = () => {
    switch (variant) {
      case 'fullScreen':
        return styles.fullScreenContainer;
      case 'overlay':
        return styles.overlayContainer;
      default:
        return styles.inlineContainer;
    }
  };

  const renderBackground = () => {
    if (variant === 'inline') return null;

    if (Platform.OS === 'ios') {
      return (
        <BlurView
          intensity={variant === 'fullScreen' ? 50 : 30}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      );
    }

    return (
      <View
        style={[
          styles.androidBackground,
          variant === 'fullScreen' ? styles.androidBackgroundFull : styles.androidBackgroundOverlay,
        ]}
      />
    );
  };

  return (
    <Animated.View style={[getContainerStyle(), containerAnimatedStyle]}>
      {renderBackground()}

      <View style={styles.contentContainer}>
        {/* Animation */}
        {renderAnimation()}

        {/* Loading text (not for typography style which has its own text) */}
        {style !== 'typography' && loadingText && (
          <Animated.View style={[styles.loadingTextContainer, textAnimatedStyle]}>
            <Text style={styles.loadingText}>{loadingText}</Text>
          </Animated.View>
        )}

        {/* Brand name for non-typography styles on fullScreen */}
        {style !== 'typography' && showBrandName && variant === 'fullScreen' && (
          <Animated.View style={[styles.brandFooter, textAnimatedStyle]}>
            <Text style={styles.brandFooterText}>MAISON BIJOUX</Text>
            <View style={styles.brandFooterDivider} />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
});

// =============================================================================
// CONVENIENCE WRAPPER COMPONENTS
// =============================================================================

/** Full screen loader with diamond animation */
export function DiamondLoader(props: Omit<LoadingAnimationProps, 'style'>) {
  return <LoadingAnimation {...props} style="diamond" variant="fullScreen" />;
}

/** Full screen loader with expanding rings animation */
export function RingsLoader(props: Omit<LoadingAnimationProps, 'style'>) {
  return <LoadingAnimation {...props} style="rings" variant="fullScreen" />;
}

/** Full screen loader with typography reveal animation */
export function TypographyLoader(props: Omit<LoadingAnimationProps, 'style'>) {
  return <LoadingAnimation {...props} style="typography" variant="fullScreen" />;
}

/** Full screen loader with art deco geometric animation */
export function ArtDecoLoader(props: Omit<LoadingAnimationProps, 'style'>) {
  return <LoadingAnimation {...props} style="artDeco" variant="fullScreen" />;
}

/** Full screen loader with shimmer/pearl animation */
export function ShimmerLoader(props: Omit<LoadingAnimationProps, 'style'>) {
  return <LoadingAnimation {...props} style="shimmer" variant="fullScreen" />;
}

/** Compact inline loader for embedding in content */
export function InlineLoader({
  size = 'small',
  style = 'rings',
  ...props
}: Omit<LoadingAnimationProps, 'variant' | 'showBrandName'>) {
  return <LoadingAnimation {...props} variant="inline" style={style} size={size} showBrandName={false} />;
}

/** Overlay loader for displaying over existing content */
export function OverlayLoader(props: Omit<LoadingAnimationProps, 'variant'>) {
  return <LoadingAnimation {...props} variant="overlay" />;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Container variants
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
    zIndex: Z_INDEX.overlay,
  },

  inlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },

  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX.overlay,
  },

  androidBackground: {
    ...StyleSheet.absoluteFillObject,
  },

  androidBackgroundFull: {
    backgroundColor: 'rgba(255, 252, 247, 0.96)',
  },

  androidBackgroundOverlay: {
    backgroundColor: 'rgba(255, 252, 247, 0.88)',
  },

  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Animation container
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Diamond styles
  diamondGlow: {
    position: 'absolute',
    borderRadius: 1000,
  },

  diamondOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  diamondShape: {
    transform: [{ rotate: '45deg' }],
    overflow: 'hidden',
    ...SHADOWS.lg,
    shadowColor: BRAND.gold,
  },

  diamondHighlight: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '30%',
    height: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },

  diamondInnerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sparklePoint: {
    position: 'absolute',
  },

  sparkle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    ...SHADOWS.sm,
    shadowColor: BRAND.goldLight,
    shadowOpacity: 0.9,
  },

  shimmerMask: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 100,
  },

  shimmerBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%',
  },

  // Ring styles
  expandingRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },

  centerJewel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.md,
    shadowColor: BRAND.gold,
  },

  jewelHighlight: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },

  // Typography styles
  typographyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },

  monogramContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },

  monogramText: {
    fontFamily: Platform.OS === 'ios' ? 'PlayfairDisplay-SemiBold' : 'PlayfairDisplay',
    fontSize: 30,
    color: BRAND.gold,
    letterSpacing: 3,
  },

  monogramFrame: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: BRAND.gold,
    transform: [{ rotate: '45deg' }],
  },

  monogramFrameInner: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderWidth: 0.75,
    borderColor: BRAND.goldLight,
    transform: [{ rotate: '45deg' }],
  },

  brandNameContainer: {
    alignItems: 'center',
  },

  letterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandLetter: {
    fontFamily: Platform.OS === 'ios' ? 'PlayfairDisplay-Medium' : 'PlayfairDisplay',
    fontSize: FONT_SIZES.sectionTitle,
    color: BRAND.charcoal,
    letterSpacing: 5,
  },

  letterSpace: {
    width: 14,
  },

  underlineContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },

  brandUnderline: {
    height: 1.5,
    backgroundColor: BRAND.gold,
  },

  // Art Deco styles
  artDecoOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BRAND.gold,
  },

  artDecoLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: BRAND.gold,
  },

  artDecoInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.goldLight,
    transform: [{ rotate: '45deg' }],
  },

  artDecoCenter: {
    transform: [{ rotate: '-45deg' }],
    overflow: 'hidden',
  },

  artDecoCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: BRAND.gold,
    backgroundColor: BRAND.cream,
    transform: [{ rotate: '45deg' }],
  },

  // Shimmer styles
  shimmerGlow: {
    position: 'absolute',
  },

  shimmerParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },

  particleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },

  pearlCenter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...SHADOWS.lg,
    shadowColor: BRAND.goldLight,
  },

  pearlHighlight: {
    position: 'absolute',
    top: 7,
    left: 9,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },

  pearlSecondaryHighlight: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },

  // Loading text
  loadingTextContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },

  loadingText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter',
    fontSize: FONT_SIZES.small,
    color: BRAND.charcoalLight,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  // Brand footer
  brandFooter: {
    marginTop: SPACING.xxxl,
    alignItems: 'center',
  },

  brandFooterText: {
    fontFamily: Platform.OS === 'ios' ? 'PlayfairDisplay-Medium' : 'PlayfairDisplay',
    fontSize: FONT_SIZES.caption,
    color: BRAND.charcoal,
    letterSpacing: 4,
  },

  brandFooterDivider: {
    width: 45,
    height: 1.5,
    backgroundColor: BRAND.gold,
    marginTop: SPACING.sm,
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default LoadingAnimation;
export { BRAND as LOADING_BRAND_COLORS };
