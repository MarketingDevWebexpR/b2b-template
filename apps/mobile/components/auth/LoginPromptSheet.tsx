/**
 * LoginPromptSheet Component
 *
 * An elegant bottom sheet that prompts users to authenticate before checkout.
 * Features luxury design aesthetics with smooth slide-up animations and
 * haptic feedback for a premium mobile shopping experience.
 *
 * @module components/auth/LoginPromptSheet
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  TouchableWithoutFeedback,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Lock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  SIZES,
} from '@/constants/designTokens';
import { springConfigs, timingConfigs } from '@/constants/animations';
import { hapticFeedback, triggerHaptic } from '@/constants/haptics';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Props for the LoginPromptSheet component
 */
export interface LoginPromptSheetProps {
  /** Controls visibility of the bottom sheet */
  isVisible: boolean;
  /** Callback fired when the sheet is dismissed */
  onClose: () => void;
  /** Callback fired when user taps the login button */
  onLogin: () => void;
  /** Callback fired when user taps the register button */
  onRegister: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Sheet configuration */
const SHEET_CONFIG = {
  /** Maximum height of the sheet content */
  maxHeight: 420 as number,
  /** Drag threshold to trigger dismiss (percentage of sheet height) */
  dismissThreshold: 0.25,
  /** Backdrop opacity when sheet is fully visible */
  backdropOpacity: 0.4,
  /** Handle bar dimensions */
  handleWidth: 40,
  handleHeight: 4,
};

/** French copy for the component */
const COPY = {
  title: 'Finalisez votre commande',
  subtitle: 'Connectez-vous pour procéder au paiement et suivre vos créations d\'exception.',
  loginButton: 'Se connecter',
  registerButton: 'Créer un compte',
  dismissLink: 'Continuer mes achats',
} as const;

/** Accessibility labels */
const A11Y_LABELS = {
  sheet: 'Invite de connexion',
  closeButton: 'Fermer et continuer les achats',
  loginButton: 'Se connecter pour finaliser la commande',
  registerButton: 'Créer un nouveau compte',
  dismissLink: 'Fermer et continuer mes achats',
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * LoginPromptSheet - A premium bottom sheet for authentication prompts
 *
 * Displays when users attempt to checkout without being authenticated.
 * Features smooth animations, haptic feedback, and accessibility support.
 *
 * @example
 * ```tsx
 * <LoginPromptSheet
 *   isVisible={showLoginPrompt}
 *   onClose={() => setShowLoginPrompt(false)}
 *   onLogin={() => router.push('/auth/login')}
 *   onRegister={() => router.push('/auth/register')}
 * />
 * ```
 */
export function LoginPromptSheet({
  isVisible,
  onClose,
  onLogin,
  onRegister,
}: LoginPromptSheetProps): JSX.Element | null {
  const insets = useSafeAreaInsets();

  // Animation values
  const translateY = useSharedValue(SHEET_CONFIG.maxHeight);
  const backdropOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const secondaryButtonScale = useSharedValue(1);

  // Calculate sheet height including safe area
  const sheetHeight = SHEET_CONFIG.maxHeight + insets.bottom;

  // ==========================================================================
  // ANIMATION HANDLERS
  // ==========================================================================

  /**
   * Animate sheet entrance
   */
  const showSheet = useCallback(() => {
    // Trigger haptic on sheet appearance
    triggerHaptic('navigationModalPresent');

    translateY.value = withSpring(0, {
      ...springConfigs.gentle,
      damping: 20,
      stiffness: 120,
    });
    backdropOpacity.value = withTiming(SHEET_CONFIG.backdropOpacity, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [translateY, backdropOpacity]);

  /**
   * Animate sheet exit
   */
  const hideSheet = useCallback(() => {
    translateY.value = withTiming(sheetHeight, {
      duration: 250,
      easing: Easing.in(Easing.ease),
    });
    backdropOpacity.value = withTiming(0, {
      duration: 200,
    });
  }, [translateY, backdropOpacity, sheetHeight]);

  /**
   * Handle dismissal with haptic feedback
   */
  const handleDismiss = useCallback(() => {
    triggerHaptic('navigationModalDismiss');
    hideSheet();
    // Delay onClose to allow animation to complete
    setTimeout(onClose, 250);
  }, [hideSheet, onClose]);

  // ==========================================================================
  // GESTURE HANDLING
  // ==========================================================================

  /**
   * Pan gesture for drag-to-dismiss functionality
   */
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow dragging down
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        // Fade backdrop as user drags
        const progress = Math.min(event.translationY / sheetHeight, 1);
        backdropOpacity.value = SHEET_CONFIG.backdropOpacity * (1 - progress);
      }
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.translationY > sheetHeight * SHEET_CONFIG.dismissThreshold ||
        event.velocityY > 500;

      if (shouldDismiss) {
        runOnJS(handleDismiss)();
      } else {
        // Snap back to open position
        translateY.value = withSpring(0, springConfigs.gentle);
        backdropOpacity.value = withTiming(SHEET_CONFIG.backdropOpacity, {
          duration: 200,
        });
      }
    });

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    if (isVisible) {
      showSheet();
    } else {
      hideSheet();
    }
  }, [isVisible, showSheet, hideSheet]);

  // Announce sheet to screen readers
  useEffect(() => {
    if (isVisible) {
      AccessibilityInfo.announceForAccessibility(
        'Invite de connexion affichee. Connectez-vous pour finaliser votre commande.'
      );
    }
  }, [isVisible]);

  // ==========================================================================
  // BUTTON HANDLERS
  // ==========================================================================

  const handleLoginPress = useCallback(() => {
    hapticFeedback.buttonPress();
    onLogin();
  }, [onLogin]);

  const handleRegisterPress = useCallback(() => {
    hapticFeedback.softPress();
    onRegister();
  }, [onRegister]);

  const handleDismissLinkPress = useCallback(() => {
    hapticFeedback.selection();
    handleDismiss();
  }, [handleDismiss]);

  // Button press animations
  const handleLoginPressIn = useCallback(() => {
    buttonScale.value = withSpring(0.96, springConfigs.button);
  }, [buttonScale]);

  const handleLoginPressOut = useCallback(() => {
    buttonScale.value = withSpring(1, springConfigs.button);
  }, [buttonScale]);

  const handleRegisterPressIn = useCallback(() => {
    secondaryButtonScale.value = withSpring(0.96, springConfigs.button);
  }, [secondaryButtonScale]);

  const handleRegisterPressOut = useCallback(() => {
    secondaryButtonScale.value = withSpring(1, springConfigs.button);
  }, [secondaryButtonScale]);

  // ==========================================================================
  // ANIMATED STYLES
  // ==========================================================================

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const primaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const secondaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryButtonScale.value }],
  }));

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleDismiss}
      accessibilityViewIsModal
      accessibilityLabel={A11Y_LABELS.sheet}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel={A11Y_LABELS.closeButton}
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              { paddingBottom: insets.bottom + SPACING.lg },
            ]}
          >
            {/* Drag Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Lock
                size={32}
                color={COLORS.hermes}
                strokeWidth={1.5}
              />
            </View>

            {/* Title */}
            <Text
              style={styles.title}
              accessibilityRole="header"
            >
              {COPY.title}
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              {COPY.subtitle}
            </Text>

            {/* Primary Button - Login */}
            <Animated.View style={[styles.buttonWrapper, primaryButtonStyle]}>
              <Pressable
                style={styles.primaryButton}
                onPress={handleLoginPress}
                onPressIn={handleLoginPressIn}
                onPressOut={handleLoginPressOut}
                accessibilityRole="button"
                accessibilityLabel={A11Y_LABELS.loginButton}
              >
                <Text style={styles.primaryButtonText}>
                  {COPY.loginButton}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Secondary Button - Register */}
            <Animated.View style={[styles.buttonWrapper, secondaryButtonStyle]}>
              <Pressable
                style={styles.secondaryButton}
                onPress={handleRegisterPress}
                onPressIn={handleRegisterPressIn}
                onPressOut={handleRegisterPressOut}
                accessibilityRole="button"
                accessibilityLabel={A11Y_LABELS.registerButton}
              >
                <Text style={styles.secondaryButtonText}>
                  {COPY.registerButton}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Dismiss Link */}
            <Pressable
              style={styles.dismissLink}
              onPress={handleDismissLinkPress}
              accessibilityRole="button"
              accessibilityLabel={A11Y_LABELS.dismissLink}
              hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
            >
              <Text style={styles.dismissLinkText}>
                {COPY.dismissLink}
              </Text>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.charcoal,
  },

  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    ...SHADOWS.xl,
  },

  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  handle: {
    width: SHEET_CONFIG.handleWidth,
    height: SHEET_CONFIG.handleHeight,
    backgroundColor: COLORS.taupe,
    borderRadius: RADIUS.round,
  },

  iconContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },

  title: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZES.heading,
    color: COLORS.charcoal,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },

  subtitle: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: FONT_SIZES.body * 1.5,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },

  buttonWrapper: {
    width: '100%',
    marginBottom: SPACING.sm,
  },

  primaryButton: {
    backgroundColor: COLORS.hermes,
    height: SIZES.buttonLg,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },

  primaryButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  secondaryButton: {
    backgroundColor: COLORS.white,
    height: SIZES.buttonLg,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.hermes,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.hermes,
    letterSpacing: 0.3,
  },

  dismissLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },

  dismissLinkText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});

export default LoginPromptSheet;
