/**
 * PaymentForm Component
 * Payment method selector with Apple Pay, Google Pay, and card payment options
 * Features shimmer effects, selection animations, and Stripe integration ready
 */

import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  FadeIn,
} from 'react-native-reanimated';
import { CreditCard, Plus, Check, Lock } from 'lucide-react-native';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens - Import from centralized file for consistency
import { COLORS as DESIGN_COLORS, FONTS as DESIGN_FONTS, SPACING as DESIGN_SPACING, RADIUS as DESIGN_RADIUS, SHADOWS } from '../../constants/designTokens';

const COLORS = {
  hermes: DESIGN_COLORS.hermes,
  hermesLight: DESIGN_COLORS.hermesLight,
  hermesLightAlpha: DESIGN_COLORS.hermesLightAlpha,
  charcoal: DESIGN_COLORS.charcoal,
  textMuted: DESIGN_COLORS.textMuted,
  white: DESIGN_COLORS.white,
  stone: DESIGN_COLORS.stone,
  sand: DESIGN_COLORS.sand,
  border: DESIGN_COLORS.border,
  borderLight: DESIGN_COLORS.borderLight,
  backgroundBeige: DESIGN_COLORS.backgroundBeige,
  success: DESIGN_COLORS.success,
};

const FONTS = {
  body: DESIGN_FONTS.body,
  bodyMedium: DESIGN_FONTS.bodyMedium,
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
  sm: DESIGN_RADIUS.sm,
  md: DESIGN_RADIUS.md,
  lg: DESIGN_RADIUS.lg,
};

// Payment method types
type PaymentType = 'apple_pay' | 'google_pay' | 'card' | 'new_card';

// Payment method interface
export interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  lastFourDigits?: string;
  brand?: 'visa' | 'mastercard' | 'amex';
  expiryDate?: string;
  isDefault?: boolean;
}

interface PaymentFormProps {
  /** Available payment methods */
  methods: PaymentMethod[];
  /** Currently selected payment method ID */
  selectedId: string | null;
  /** Callback when a payment method is selected */
  onSelect: (id: string) => void;
  /** Callback to add a new card */
  onAddNew?: () => void;
  /** Whether to show the secure payment indicator */
  showSecureIndicator?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Individual payment method card component
 */
interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}

function PaymentMethodCard({
  method,
  isSelected,
  onSelect,
}: PaymentMethodCardProps) {
  const scale = useSharedValue(1);
  const borderProgress = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const shimmerX = useSharedValue(-200);

  const isWallet = method.type === 'apple_pay' || method.type === 'google_pay';

  // Selection animation
  useEffect(() => {
    if (isSelected) {
      borderProgress.value = withTiming(1, { duration: 200 });
      checkScale.value = withSpring(1, springConfigs.celebration);

      // Shimmer effect for wallet options
      if (isWallet) {
        shimmerX.value = withSequence(
          withTiming(-200, { duration: 0 }),
          withTiming(400, { duration: 800 })
        );
      }
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
      checkScale.value = withTiming(0, { duration: 150 });
    }
  }, [isSelected, isWallet]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springConfigs.button);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const handlePress = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    onSelect();
  }, [onSelect]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.borderLight, COLORS.hermes]
    ),
    borderWidth: borderProgress.value > 0.5 ? 2 : 1,
    backgroundColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.white, COLORS.hermesLight]
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  // Render the appropriate icon based on payment type
  const renderIcon = () => {
    if (method.type === 'apple_pay') {
      return (
        <View style={styles.walletIcon}>
          <Text style={styles.walletLogoText}>Pay</Text>
        </View>
      );
    }

    if (method.type === 'google_pay') {
      return (
        <View style={styles.walletIcon}>
          <Text style={styles.walletLogoText}>G Pay</Text>
        </View>
      );
    }

    // Card icon with brand indicator
    return (
      <View style={styles.cardIconContainer}>
        <CreditCard size={24} color={COLORS.stone} />
        {method.brand && (
          <View style={styles.brandIndicator}>
            <Text style={styles.brandText}>
              {method.brand.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.methodContainer, containerStyle]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={method.label}
    >
      <Animated.View style={[styles.methodCard, cardStyle]}>
        {/* Shimmer Effect for wallet */}
        {isWallet && isSelected && (
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        )}

        {/* Icon */}
        {renderIcon()}

        {/* Content */}
        <View style={styles.methodContent}>
          <Text
            style={[
              styles.methodLabel,
              isSelected && styles.methodLabelSelected,
            ]}
          >
            {method.label}
          </Text>

          {/* Card details */}
          {method.lastFourDigits && (
            <Text style={styles.cardDetails}>
              **** **** **** {method.lastFourDigits}
              {method.expiryDate && ` - Exp. ${method.expiryDate}`}
            </Text>
          )}

          {/* Default badge */}
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Par defaut</Text>
            </View>
          )}
        </View>

        {/* Selection Indicator */}
        <Animated.View style={[styles.checkContainer, checkStyle]}>
          <Check size={16} color={COLORS.white} strokeWidth={3} />
        </Animated.View>
      </Animated.View>
    </AnimatedPressable>
  );
}

/**
 * Add new card button component
 */
function AddNewCardButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfigs.button);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.button);
  };

  const handlePress = () => {
    debouncedHaptic(hapticFeedback.softConfirm);
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.addNewContainer, containerStyle]}
      accessibilityRole="button"
      accessibilityLabel="Ajouter une nouvelle carte"
    >
      <View style={styles.addNewCard}>
        <View style={styles.addNewIcon}>
          <Plus size={20} color={COLORS.hermes} />
        </View>
        <Text style={styles.addNewText}>Ajouter une carte</Text>
      </View>
    </AnimatedPressable>
  );
}

/**
 * Main PaymentForm component
 */
export function PaymentForm({
  methods,
  selectedId,
  onSelect,
  onAddNew,
  showSecureIndicator = true,
}: PaymentFormProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
    >
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Mode de paiement</Text>

      {/* Payment Methods List */}
      <View style={styles.methodsList}>
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isSelected={selectedId === method.id}
            onSelect={() => onSelect(method.id)}
          />
        ))}

        {/* Add New Card Button */}
        {onAddNew && <AddNewCardButton onPress={onAddNew} />}
      </View>

      {/* Secure Payment Indicator */}
      {showSecureIndicator && (
        <View style={styles.secureIndicator}>
          <Lock size={14} color={COLORS.success} />
          <Text style={styles.secureText}>
            Vos donnees de paiement sont securisees
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 20,
    color: COLORS.charcoal,
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  methodsList: {
    gap: SPACING.sm,
  },
  methodContainer: {},
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.subtle, // Use consistent shadow from design tokens
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  walletIcon: {
    width: 48,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.charcoal,
    borderRadius: RADIUS.sm, // Use consistent 8px radius
  },
  walletLogoText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.white,
  },
  cardIconContainer: {
    width: 48,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.sand,
    borderRadius: RADIUS.sm, // Use consistent 8px radius
    position: 'relative',
  },
  brandIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.charcoal,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  brandText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 6,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.charcoal,
  },
  methodLabelSelected: {
    color: COLORS.hermes,
  },
  cardDetails: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: COLORS.sand,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.md, // Use consistent 12px radius
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  defaultText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.hermes,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewContainer: {
    marginTop: SPACING.xs,
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundBeige,
  },
  addNewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.hermesLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  addNewText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.hermes,
  },
  secureIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: 6,
  },
  secureText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.success,
  },
});

export default PaymentForm;
