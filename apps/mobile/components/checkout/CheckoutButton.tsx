/**
 * CheckoutButton Component
 * Premium CTA button with multiple states: idle, loading, success, error
 * Features glow pulsing, ripple effects, and state transitions with haptic feedback
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { ArrowRight, Check, Lock } from 'lucide-react-native';
import { InlineLoader } from '@/components/LoadingAnimation';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens - Import from centralized file for consistency
import { COLORS as DESIGN_COLORS, FONTS as DESIGN_FONTS, SPACING as DESIGN_SPACING, RADIUS as DESIGN_RADIUS, SHADOWS } from '../../constants/designTokens';

const COLORS = {
  hermes: DESIGN_COLORS.hermes,
  charcoal: DESIGN_COLORS.charcoal,
  white: DESIGN_COLORS.white,
  success: DESIGN_COLORS.success,
};

const FONTS = {
  bodySemiBold: DESIGN_FONTS.bodySemiBold,
};

const SPACING = {
  xs: DESIGN_SPACING.xxs,
  sm: DESIGN_SPACING.xs,
};

const RADIUS = {
  pill: DESIGN_RADIUS.pill,
};

// Button state types
type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface CheckoutButtonProps {
  /** Amount to display in the button */
  amount: number;
  /** Callback when button is pressed */
  onPress: () => Promise<void> | void;
  /** Current button state */
  state?: ButtonState;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom label (overrides default "Payer X EUR") */
  label?: string;
  /** Whether to show the lock icon */
  showSecureIcon?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Format price for display in EUR
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function CheckoutButton({
  amount,
  onPress,
  state = 'idle',
  disabled = false,
  label,
  showSecureIcon = true,
}: CheckoutButtonProps) {
  // Main animation values
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  // Icon animations
  const arrowX = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const lockScale = useSharedValue(1);

  // Content opacity for state transitions
  const idleContentOpacity = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  // Idle state animations (glow pulse, arrow hint)
  useEffect(() => {
    if (state === 'idle' && !disabled) {
      // Pulsing glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.08, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Subtle arrow hint animation
      arrowX.value = withRepeat(
        withSequence(
          withDelay(3000, withTiming(4, { duration: 200 })),
          withSpring(0, springConfigs.button)
        ),
        -1,
        false
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
      arrowX.value = 0;
    }
  }, [state, disabled]);

  // State transition animations
  useEffect(() => {
    switch (state) {
      case 'idle':
        colorProgress.value = withTiming(0, { duration: 200 });
        idleContentOpacity.value = withTiming(1, { duration: 200 });
        loadingOpacity.value = withTiming(0, { duration: 150 });
        successOpacity.value = withTiming(0, { duration: 150 });
        break;

      case 'loading':
        idleContentOpacity.value = withTiming(0, { duration: 150 });
        loadingOpacity.value = withDelay(100, withTiming(1, { duration: 150 }));
        break;

      case 'success':
        // Color transition to success green
        colorProgress.value = withTiming(1, { duration: 300 });
        loadingOpacity.value = withTiming(0, { duration: 100 });
        successOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));

        // Checkmark bounce animation
        checkScale.value = withDelay(
          150,
          withSequence(
            withSpring(1.3, springConfigs.celebration),
            withSpring(1, springConfigs.button)
          )
        );

        // Button pop animation
        scale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withSpring(1.03, springConfigs.celebration),
          withSpring(1, springConfigs.gentle)
        );

        // Success haptic feedback
        hapticFeedback.addToCartSuccess();
        break;

      case 'error':
        // Shake animation
        scale.value = withSequence(
          withTiming(0.98, { duration: 50 }),
          withTiming(1.02, { duration: 50 }),
          withTiming(0.98, { duration: 50 }),
          withTiming(1.02, { duration: 50 }),
          withTiming(0.98, { duration: 50 }),
          withTiming(1.02, { duration: 50 }),
          withTiming(0.98, { duration: 50 }),
          withTiming(1.02, { duration: 50 }),
          withSpring(1, springConfigs.button)
        );
        // Error haptic feedback
        hapticFeedback.error();
        break;
    }
  }, [state]);

  // Press handlers
  const handlePressIn = useCallback(() => {
    if (disabled || state !== 'idle') return;
    scale.value = withSpring(0.96, springConfigs.button);
    lockScale.value = withSpring(0.9, springConfigs.button);
    glowOpacity.value = withTiming(0, { duration: 100 });
    debouncedHaptic(hapticFeedback.addToCartPress);
  }, [disabled, state]);

  const handlePressOut = useCallback(() => {
    if (disabled || state !== 'idle') return;
    scale.value = withSpring(1, springConfigs.button);
    lockScale.value = withSpring(1, springConfigs.button);

    // Ripple effect
    rippleScale.value = 0;
    rippleScale.value = withTiming(3, { duration: 600, easing: Easing.out(Easing.ease) });
    rippleOpacity.value = 0.3;
    rippleOpacity.value = withTiming(0, { duration: 600 });
  }, [disabled, state]);

  const handlePress = useCallback(() => {
    if (disabled || state !== 'idle') return;
    onPress();
  }, [disabled, state, onPress]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1],
      [COLORS.hermes, COLORS.success]
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: idleContentOpacity.value,
  }));

  const lockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lockScale.value }],
    opacity: idleContentOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: idleContentOpacity.value,
  }));

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: successOpacity.value,
  }));

  const successTextStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
  }));

  // Button label
  const buttonLabel = label || `Payer ${formatPrice(amount)}`;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || state !== 'idle'}
      style={[styles.container, containerStyle]}
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
      accessibilityState={{ disabled: disabled || state !== 'idle' }}
    >
      {/* Background with color transition */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        {/* Glow Effect */}
        <Animated.View style={[styles.glow, glowStyle]} />

        {/* Ripple Effect */}
        <Animated.View style={[styles.ripple, rippleStyle]} />
      </Animated.View>

      {/* Content Container */}
      <View style={styles.content}>
        {/* Idle State Content */}
        <View style={styles.idleContent}>
          {showSecureIcon && (
            <Animated.View style={lockStyle}>
              <Lock size={18} color={COLORS.white} strokeWidth={2} />
            </Animated.View>
          )}

          <Animated.Text style={[styles.label, textStyle]}>
            {buttonLabel}
          </Animated.Text>

          <Animated.View style={arrowStyle}>
            <ArrowRight size={20} color={COLORS.white} strokeWidth={2} />
          </Animated.View>
        </View>

        {/* Loading State Overlay */}
        <Animated.View style={[styles.stateOverlay, loaderStyle]}>
          <InlineLoader size="small" style="rings" />
        </Animated.View>

        {/* Success State Overlay */}
        <Animated.View style={[styles.stateOverlay, styles.successContent, successTextStyle]}>
          <Animated.View style={checkStyle}>
            <Check size={24} color={COLORS.white} strokeWidth={3} />
          </Animated.View>
          <Animated.Text style={styles.successLabel}>
            Paiement accepté
          </Animated.Text>
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: COLORS.hermes,
    borderRadius: RADIUS.pill + 20,
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
    borderRadius: 50,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  successLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default CheckoutButton;
