/**
 * LuxuryWelcomeToast Component
 *
 * A sophisticated welcome notification for the Maison Bijoux luxury jewelry app.
 * Appears when a user successfully logs in, providing an elegant greeting experience.
 *
 * DESIGN SPECIFICATION
 * ====================
 *
 * 1. LAYOUT & POSITIONING
 * -----------------------
 * - Position: Fixed at top of screen, below status bar
 * - Width: Full screen width minus 40px horizontal margin (20px each side)
 * - Height: Auto, approximately 72px with content
 * - Alignment: Horizontally centered
 * - Top offset: Safe area top + 12px for breathing room
 * - Z-index: 500 (toast level per design tokens)
 *
 * 2. COLORS & BACKGROUNDS
 * -----------------------
 * - Background: Cream (#fffcf7) with subtle glass effect
 * - Border: Delicate gold/taupe border (1px, #d4c9bd at 60% opacity)
 * - Text Primary: Charcoal (#2b333f) for the greeting
 * - Text Secondary: Stone (#b8a99a) for tagline
 * - Accent: Hermes orange (#f67828) for decorative elements
 * - Shadow: Soft, warm shadow for depth and elegance
 *
 * 3. TYPOGRAPHY
 * -------------
 * - Greeting "Bienvenue": PlayfairDisplay-Medium, 20px
 * - User Name: PlayfairDisplay-SemiBold, 20px, Hermes orange
 * - Tagline: Inter-Regular, 13px, Stone color, tracking +0.3
 *
 * 4. ANIMATION
 * ------------
 * Entry Animation (slide + fade):
 * - Duration: 500ms elegant timing
 * - Easing: cubic-bezier(0.16, 1, 0.3, 1) - luxury ease-out
 * - Transform: translateY from -100% to 0
 * - Opacity: 0 to 1
 * - Scale: subtle 0.98 to 1 for polish
 *
 * Exit Animation:
 * - Duration: 300ms
 * - Transform: translateY to -20px (slight lift)
 * - Opacity: 1 to 0
 *
 * Auto-dismiss: 3000ms with progress indicator
 *
 * 5. DECORATIVE ELEMENTS
 * ----------------------
 * - Left accent: Vertical bar (3px) in Hermes orange
 * - Optional: Small diamond/gem icon for luxury feel
 * - Subtle shimmer effect on entry (luxury touch)
 *
 * 6. ACCESSIBILITY
 * ----------------
 * - Role: alert
 * - Live region: polite
 * - Dismiss on tap
 * - Respects reduce motion settings
 *
 * @module components/toast/LuxuryWelcomeToast
 * @version 1.0.0
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  AccessibilityInfo,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Sparkles } from 'lucide-react-native';

// Design tokens from the app's design system
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  Z_INDEX,
} from '@/constants/designTokens';
import { timingConfigs, durations, easings } from '@/constants/animations';
import { triggerHaptic } from '@/constants/haptics';

// =============================================================================
// TYPES
// =============================================================================

export interface LuxuryWelcomeToastProps {
  /** Whether the toast is visible */
  visible: boolean;
  /** User's display name */
  userName: string;
  /** Callback when toast is dismissed (manual or auto) */
  onDismiss: () => void;
  /** Auto-dismiss duration in milliseconds (default: 3000) */
  autoDismissMs?: number;
  /** Custom tagline below greeting (optional) */
  tagline?: string;
  /** Test ID for automated testing */
  testID?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Toast dimensions and spacing */
const TOAST_CONFIG = {
  marginHorizontal: SPACING.lg,
  marginTop: SPACING.sm,
  minHeight: 72,
  borderRadius: RADIUS.lg,
  accentBarWidth: 3,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.md,
} as const;

/** Animation timing */
const ANIMATION_CONFIG = {
  entryDuration: 500,
  exitDuration: 300,
  progressDuration: 3000, // Must match autoDismissMs default
  shimmerDuration: 1200,
  shimmerDelay: 200,
} as const;

/** Luxury easing curve */
const LUXURY_EASING = Easing.bezier(0.16, 1, 0.3, 1);

// =============================================================================
// COMPONENT
// =============================================================================

export function LuxuryWelcomeToast({
  visible,
  userName,
  onDismiss,
  autoDismissMs = 3000,
  tagline = 'Votre experience joailliere vous attend',
  testID = 'luxury-welcome-toast',
}: LuxuryWelcomeToastProps) {
  const insets = useSafeAreaInsets();

  // Animation values
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);
  const progressWidth = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);
  const accentGlow = useSharedValue(0);

  // Format user name for display (capitalize first letter of each word)
  const formattedName = useMemo(() => {
    return userName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, [userName]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    // Exit animation
    translateY.value = withTiming(-30, {
      duration: ANIMATION_CONFIG.exitDuration,
      easing: Easing.bezier(0.4, 0, 1, 1),
    });
    opacity.value = withTiming(0, {
      duration: ANIMATION_CONFIG.exitDuration,
    });
    scale.value = withTiming(0.98, {
      duration: ANIMATION_CONFIG.exitDuration,
    });

    // Trigger haptic feedback
    triggerHaptic('feedbackToast');

    // Call onDismiss after animation
    setTimeout(() => {
      onDismiss();
    }, ANIMATION_CONFIG.exitDuration);
  }, [onDismiss, translateY, opacity, scale]);

  // Show/hide effect
  useEffect(() => {
    if (visible) {
      // Reset values
      translateY.value = -120;
      opacity.value = 0;
      scale.value = 0.96;
      progressWidth.value = 0;
      shimmerPosition.value = -1;
      accentGlow.value = 0;

      // Entry animation sequence
      translateY.value = withTiming(0, {
        duration: ANIMATION_CONFIG.entryDuration,
        easing: LUXURY_EASING,
      });

      opacity.value = withTiming(1, {
        duration: ANIMATION_CONFIG.entryDuration * 0.6,
        easing: Easing.out(Easing.ease),
      });

      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      });

      // Shimmer effect
      shimmerPosition.value = withDelay(
        ANIMATION_CONFIG.shimmerDelay,
        withTiming(2, {
          duration: ANIMATION_CONFIG.shimmerDuration,
          easing: Easing.linear,
        })
      );

      // Accent glow pulse
      accentGlow.value = withDelay(
        300,
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) })
        )
      );

      // Progress bar animation (auto-dismiss timer)
      progressWidth.value = withTiming(100, {
        duration: autoDismissMs,
        easing: Easing.linear,
      });

      // Trigger haptic on entry
      triggerHaptic('premiumElegantConfirm');

      // Auto-dismiss timer
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissMs);

      return () => clearTimeout(timer);
    }
  }, [visible, autoDismissMs, handleDismiss]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerPosition.value,
          [-1, 2],
          [-SCREEN_WIDTH, SCREEN_WIDTH * 2],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      shimmerPosition.value,
      [-1, 0, 1, 2],
      [0, 0.6, 0.6, 0],
      Extrapolation.CLAMP
    ),
  }));

  const accentBarStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      accentGlow.value,
      [0, 1],
      [0, 0.6],
      Extrapolation.CLAMP
    ),
    shadowRadius: interpolate(
      accentGlow.value,
      [0, 1],
      [4, 12],
      Extrapolation.CLAMP
    ),
  }));

  // Don't render if not visible
  if (!visible) return null;

  return (
    <View
      style={[
        styles.wrapper,
        { top: insets.top + TOAST_CONFIG.marginTop },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View style={[styles.container, containerStyle]}>
        <Pressable
          onPress={handleDismiss}
          style={styles.pressable}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Bienvenue ${formattedName}. ${tagline}. Appuyez pour fermer.`}
          accessibilityHint="Touchez pour fermer la notification"
          testID={testID}
        >
          {/* Glass background for iOS */}
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={60}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Background overlay for consistent appearance */}
          <View style={styles.backgroundOverlay} />

          {/* Shimmer effect overlay */}
          <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />

          {/* Content */}
          <View style={styles.content}>
            {/* Top row: Greeting and icon */}
            <View style={styles.greetingRow}>
              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingPrefix}>Bienvenue,</Text>
                <Text style={styles.userName} numberOfLines={1}>
                  {formattedName}
                </Text>
              </View>

              {/* Decorative gem icon */}
              <View style={styles.iconContainer}>
                <Sparkles
                  size={20}
                  color={COLORS.hermes}
                  strokeWidth={1.5}
                />
              </View>
            </View>

            {/* Tagline */}
            <Text style={styles.tagline} numberOfLines={1}>
              {tagline}
            </Text>
          </View>

          {/* Progress bar (auto-dismiss indicator) */}
          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, progressStyle]} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: Z_INDEX.toast,
    alignItems: 'center',
    paddingHorizontal: TOAST_CONFIG.marginHorizontal,
  },

  container: {
    width: '100%',
    maxWidth: 400,
    minHeight: TOAST_CONFIG.minHeight,
    borderRadius: TOAST_CONFIG.borderRadius,
    overflow: 'hidden',
    // Elegant shadow
    ...SHADOWS.lg,
    shadowColor: COLORS.charcoal,
  },

  pressable: {
    flex: 1,
    borderRadius: TOAST_CONFIG.borderRadius,
    overflow: 'hidden',
  },

  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios'
      ? COLORS.backgroundGlassStrong
      : COLORS.background,
    // Subtle border
    borderWidth: 1,
    borderColor: 'rgba(212, 201, 189, 0.4)', // taupe at 40%
    borderRadius: TOAST_CONFIG.borderRadius,
  },

  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },

  accentBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: TOAST_CONFIG.accentBarWidth,
    backgroundColor: COLORS.hermes,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    // Glow effect (animated)
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 2,
  },

  content: {
    flex: 1,
    paddingVertical: TOAST_CONFIG.paddingVertical,
    paddingHorizontal: TOAST_CONFIG.paddingHorizontal,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  greetingTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },

  greetingPrefix: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    color: COLORS.charcoal,
    letterSpacing: 0.2,
    marginRight: 6,
  },

  userName: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 18,
    color: COLORS.hermes,
    letterSpacing: 0.3,
    flexShrink: 1,
  },

  iconContainer: {
    marginLeft: SPACING.sm,
    opacity: 0.9,
  },

  tagline: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.stone,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(212, 201, 189, 0.3)', // taupe at 30%
  },

  progressBar: {
    height: '100%',
    backgroundColor: COLORS.hermes,
    opacity: 0.7,
  },
});

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default LuxuryWelcomeToast;
