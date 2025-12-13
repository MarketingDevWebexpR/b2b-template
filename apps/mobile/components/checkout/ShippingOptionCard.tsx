/**
 * ShippingOptionCard Component
 * Elegant selectable shipping option card with radio button animations
 * Features price animation, icon bounce, and speed badges
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { Truck, Zap, Package, Clock } from 'lucide-react-native';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens - Import from centralized file for consistency
import { COLORS as DESIGN_COLORS, FONTS as DESIGN_FONTS, SPACING as DESIGN_SPACING, RADIUS as DESIGN_RADIUS, SHADOWS } from '../../constants/designTokens';

const COLORS = {
  hermes: DESIGN_COLORS.hermes,
  hermesLight: DESIGN_COLORS.hermesLight,
  hermesLightAlpha: 'rgba(246, 120, 40, 0.2)',
  charcoal: DESIGN_COLORS.charcoal,
  textMuted: DESIGN_COLORS.textMuted,
  white: DESIGN_COLORS.white,
  stone: DESIGN_COLORS.stone,
  sand: DESIGN_COLORS.sand,
  borderLight: DESIGN_COLORS.borderLight,
  success: DESIGN_COLORS.success,
  successLight: DESIGN_COLORS.successLight,
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
};

const RADIUS = {
  md: DESIGN_RADIUS.md,
};

// Shipping speed types
type ShippingSpeed = 'standard' | 'express' | 'overnight' | 'pickup';

// Shipping option interface
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  speed: ShippingSpeed;
  isFree?: boolean;
  isEco?: boolean;
}

interface ShippingOptionCardProps {
  /** Shipping option data */
  option: ShippingOption;
  /** Whether this option is currently selected */
  isSelected: boolean;
  /** Callback when option is selected */
  onSelect: () => void;
  /** Whether the card is disabled */
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Icon mapping for shipping speeds
const SHIPPING_ICONS = {
  standard: Truck,
  express: Zap,
  overnight: Clock,
  pickup: Package,
};

// Speed badge configuration
const SPEED_BADGES: Record<string, { label: string; color: string }> = {
  express: { label: 'Rapide', color: COLORS.hermes },
  overnight: { label: 'Demain', color: COLORS.success },
};

/**
 * Format price for display
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function ShippingOptionCard({
  option,
  isSelected,
  onSelect,
  disabled = false,
}: ShippingOptionCardProps) {
  // Animation values
  const scale = useSharedValue(1);
  const borderProgress = useSharedValue(0);
  const radioScale = useSharedValue(0);
  const priceScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);

  // Get the appropriate icon component
  const Icon = SHIPPING_ICONS[option.speed];
  const speedBadge = SPEED_BADGES[option.speed];

  // Selection animation effect
  useEffect(() => {
    if (isSelected) {
      // Animate border and background
      borderProgress.value = withTiming(1, { duration: 200 });
      // Radio button pop animation
      radioScale.value = withSpring(1, springConfigs.celebration);
      // Price pop animation
      priceScale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withSpring(1, springConfigs.button)
      );
      // Icon bounce
      iconRotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withSpring(0, springConfigs.button)
      );
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
      radioScale.value = withTiming(0, { duration: 150 });
    }
  }, [isSelected]);

  // Press handlers
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(0.98, springConfigs.button);
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const handlePress = useCallback(() => {
    if (disabled) return;
    debouncedHaptic(hapticFeedback.softConfirm);
    onSelect();
  }, [disabled, onSelect]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
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

  const radioOuterStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.stone, COLORS.hermes]
    ),
  }));

  const radioInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radioScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const priceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: priceScale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, containerStyle]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={`${option.name}, ${option.estimatedDays}, ${option.isFree ? 'Gratuit' : formatPrice(option.price)}`}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {/* Radio Button */}
          <Animated.View style={[styles.radioOuter, radioOuterStyle]}>
            <Animated.View style={[styles.radioInner, radioInnerStyle]} />
          </Animated.View>

          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              isSelected && styles.iconContainerSelected,
              iconStyle,
            ]}
          >
            <Icon
              size={20}
              color={isSelected ? COLORS.hermes : COLORS.stone}
            />
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.name,
                  isSelected && styles.nameSelected,
                ]}
              >
                {option.name}
              </Text>

              {/* Speed Badge */}
              {speedBadge && (
                <View
                  style={[
                    styles.speedBadge,
                    { backgroundColor: speedBadge.color + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.speedBadgeText,
                      { color: speedBadge.color },
                    ]}
                  >
                    {speedBadge.label}
                  </Text>
                </View>
              )}

              {/* Eco Badge */}
              {option.isEco && (
                <View style={styles.ecoBadge}>
                  <Text style={styles.ecoBadgeText}>ECO</Text>
                </View>
              )}
            </View>

            <Text style={styles.description}>{option.estimatedDays}</Text>
          </View>
        </View>

        {/* Price */}
        <Animated.View style={priceStyle}>
          {option.isFree ? (
            <View style={styles.freeContainer}>
              <Text style={styles.freeText}>Gratuit</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.price,
                isSelected && styles.priceSelected,
              ]}
            >
              {formatPrice(option.price)}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.subtle, // Use consistent shadow from design tokens
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.hermes,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md, // Use consistent 12px radius
    backgroundColor: COLORS.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.hermesLightAlpha,
  },
  textContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  name: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.charcoal,
  },
  nameSelected: {
    color: COLORS.hermes,
  },
  speedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.md, // Use consistent 12px radius
  },
  speedBadgeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ecoBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.md, // Use consistent 12px radius
  },
  ecoBadgeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  freeContainer: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md, // Use consistent 12px radius
  },
  freeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.success,
  },
  price: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: COLORS.charcoal,
  },
  priceSelected: {
    color: COLORS.hermes,
  },
});

export default ShippingOptionCard;
