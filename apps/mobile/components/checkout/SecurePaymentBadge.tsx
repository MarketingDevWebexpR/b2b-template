/**
 * SecurePaymentBadge Component
 * Animated security badge to build trust during checkout
 * Features pulsing glow, shield animation, and multiple variants
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Shield, Lock, CheckCircle } from 'lucide-react-native';
import { springConfigs } from '../../constants/animations';

// Design tokens - Import from centralized file for consistency
import { COLORS as DESIGN_COLORS, FONTS as DESIGN_FONTS, SPACING as DESIGN_SPACING, RADIUS as DESIGN_RADIUS, SHADOWS } from '../../constants/designTokens';

const COLORS = {
  charcoal: DESIGN_COLORS.charcoal,
  textMuted: DESIGN_COLORS.textMuted,
  white: DESIGN_COLORS.white,
  borderLight: DESIGN_COLORS.borderLight,
  success: DESIGN_COLORS.success,
  successLight: DESIGN_COLORS.successLight,
};

const FONTS = {
  body: DESIGN_FONTS.body,
  bodySemiBold: DESIGN_FONTS.bodySemiBold,
  displayMedium: DESIGN_FONTS.displayMedium,
};

const SPACING = {
  xs: DESIGN_SPACING.xxs,
  sm: DESIGN_SPACING.xs,
  md: DESIGN_SPACING.md,
  lg: DESIGN_SPACING.xl,
};

const RADIUS = {
  md: DESIGN_RADIUS.md,
  lg: DESIGN_RADIUS.lg,
};

// Badge variant types
type BadgeVariant = 'default' | 'compact' | 'prominent';

interface SecurePaymentBadgeProps {
  /** Visual variant of the badge */
  variant?: BadgeVariant;
  /** Whether to animate on mount */
  animated?: boolean;
}

/**
 * Compact variant - minimal inline display
 */
function CompactBadge() {
  return (
    <View style={styles.compactContainer}>
      <Lock size={14} color={COLORS.success} />
      <Text style={styles.compactText}>Paiement securise</Text>
    </View>
  );
}

/**
 * Default variant - standard badge with icon and text
 */
function DefaultBadge({ animated }: { animated: boolean }) {
  // Animation values
  const shieldScale = useSharedValue(animated ? 0 : 1);
  const shieldGlow = useSharedValue(0);
  const checkScale = useSharedValue(animated ? 0 : 1);
  const textOpacity = useSharedValue(animated ? 0 : 1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      // Entry animation sequence
      shieldScale.value = withSpring(1, springConfigs.celebration);

      checkScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, springConfigs.celebration),
          withSpring(1, springConfigs.button)
        )
      );

      textOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

      // Continuous glow pulse
      shieldGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Subtle scale pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  // Animated styles
  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: shieldGlow.value * 0.4,
    transform: [{ scale: pulseScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Glow Effect */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Shield Icon */}
      <Animated.View style={[styles.iconContainer, shieldStyle]}>
        <Shield size={24} color={COLORS.success} strokeWidth={1.5} />
        <Animated.View style={[styles.checkBadge, checkStyle]}>
          <CheckCircle size={12} color={COLORS.white} fill={COLORS.success} />
        </Animated.View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.title}>Paiement securise</Text>
        <Text style={styles.subtitle}>Vos donnees sont protegees</Text>
      </Animated.View>
    </View>
  );
}

/**
 * Prominent variant - larger display with trust indicators
 */
function ProminentBadge({ animated }: { animated: boolean }) {
  // Animation values
  const shieldScale = useSharedValue(animated ? 0 : 1);
  const shieldGlow = useSharedValue(0);
  const checkScale = useSharedValue(animated ? 0 : 1);
  const textOpacity = useSharedValue(animated ? 0 : 1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      // Entry animation sequence
      shieldScale.value = withSpring(1, springConfigs.celebration);

      checkScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, springConfigs.celebration),
          withSpring(1, springConfigs.button)
        )
      );

      textOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

      // Continuous glow pulse
      shieldGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Subtle scale pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  // Animated styles
  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: shieldGlow.value * 0.4,
    transform: [{ scale: pulseScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.prominentContainer}>
      {/* Glow Effect */}
      <Animated.View style={[styles.prominentGlow, glowStyle]} />

      {/* Content */}
      <Animated.View style={[styles.prominentContent, shieldStyle]}>
        <View style={styles.prominentIconContainer}>
          <Shield size={32} color={COLORS.success} strokeWidth={1.5} />
          <Animated.View style={[styles.prominentCheck, checkStyle]}>
            <CheckCircle size={14} color={COLORS.success} fill={COLORS.successLight} />
          </Animated.View>
        </View>

        <Animated.View style={textStyle}>
          <Text style={styles.prominentTitle}>Paiement 100% Securise</Text>
          <Text style={styles.prominentSubtitle}>
            Protection SSL 256 bits - Vos donnees sont cryptees
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Trust Indicators */}
      <View style={styles.trustIndicators}>
        <TrustItem label="VISA" />
        <TrustItem label="MC" />
        <TrustItem label="AMEX" />
        <TrustItem label="SSL" />
      </View>
    </View>
  );
}

/**
 * Trust indicator item
 */
function TrustItem({ label }: { label: string }) {
  return (
    <View style={styles.trustItem}>
      <Text style={styles.trustLabel}>{label}</Text>
    </View>
  );
}

/**
 * Main SecurePaymentBadge component
 */
export function SecurePaymentBadge({
  variant = 'default',
  animated = true,
}: SecurePaymentBadgeProps) {
  if (variant === 'compact') {
    return <CompactBadge />;
  }

  if (variant === 'prominent') {
    return (
      <Animated.View entering={animated ? FadeIn.duration(300) : undefined}>
        <ProminentBadge animated={animated} />
      </Animated.View>
    );
  }

  // Default variant
  return (
    <Animated.View entering={animated ? FadeIn.duration(300) : undefined}>
      <DefaultBadge animated={animated} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Default variant styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.success,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  // Compact variant styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.success,
  },

  // Prominent variant styles
  prominentContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.successLight,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.card, // Use consistent shadow from design tokens
  },
  prominentGlow: {
    position: 'absolute',
    top: -40,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 200,
    backgroundColor: COLORS.successLight,
    borderRadius: 100,
  },
  prominentContent: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  prominentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  prominentCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  prominentTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    color: COLORS.charcoal,
    textAlign: 'center',
  },
  prominentSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  trustItem: {
    opacity: 0.6,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.md, // Use consistent 12px radius instead of 4
  },
  trustLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.success,
    letterSpacing: 0.5,
  },
});

export default SecurePaymentBadge;
