/**
 * LuxuryAddToCartBar Component
 * A premium sticky bottom bar with frosted glass effect, animated price,
 * and sophisticated add-to-cart button with micro-interactions
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
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
import { BlurView } from 'expo-blur';
import { ShoppingBag, Check } from 'lucide-react-native';
import { InlineLoader } from '@/components/LoadingAnimation';
import { formatPrice } from '@bijoux/utils';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  backgroundGlass: 'rgba(255, 252, 247, 0.85)',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesDark: '#ea580c',
  success: '#059669',
  successDark: '#047857',
  successLight: '#ecfdf5',
  white: '#ffffff',
  stone: '#b8a99a',
  taupe: '#d4c9bd',
  borderLight: '#f0ebe3',
};

interface LuxuryAddToCartBarProps {
  price: number;
  quantity: number;
  onAddToCart: () => Promise<void> | void;
  isInCart?: boolean;
  cartQuantity?: number;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LuxuryAddToCartBar({
  price,
  quantity,
  onAddToCart,
  isInCart = false,
  cartQuantity = 0,
  disabled = false,
}: LuxuryAddToCartBarProps) {
  // Calculate total price
  const totalPrice = useMemo(() => price * quantity, [price, quantity]);
  const formattedPrice = useMemo(() => formatPrice(totalPrice), [totalPrice]);

  // Button state
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Animation values - Button
  const buttonScale = useSharedValue(1);
  const buttonColorProgress = useSharedValue(isInCart ? 1 : 0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.1);

  // Animation values - Icons
  const cartIconOpacity = useSharedValue(1);
  const cartIconScale = useSharedValue(1);
  const checkIconOpacity = useSharedValue(0);
  const checkIconScale = useSharedValue(0);
  const loaderOpacity = useSharedValue(0);

  // Animation values - Price
  const priceScale = useSharedValue(1);
  const priceOpacity = useSharedValue(1);

  // Start idle glow animation
  useEffect(() => {
    if (!isInCart && !isLoading && !showSuccess) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.08, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isInCart, isLoading, showSuccess]);

  // Update color when isInCart changes
  useEffect(() => {
    buttonColorProgress.value = withTiming(isInCart ? 1 : 0, { duration: 300 });
    if (isInCart) {
      checkIconOpacity.value = withTiming(1, { duration: 200 });
      checkIconScale.value = withSpring(1, springConfigs.button);
      cartIconOpacity.value = withTiming(0, { duration: 150 });
    } else {
      checkIconOpacity.value = withTiming(0, { duration: 150 });
      checkIconScale.value = 0;
      cartIconOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isInCart]);

  // Animate price when quantity changes
  useEffect(() => {
    priceScale.value = withSequence(
      withTiming(1.08, { duration: 100 }),
      withSpring(1, springConfigs.number)
    );
    debouncedHaptic(hapticFeedback.quantityChange);
  }, [totalPrice]);

  // Handle button press
  const handlePressIn = useCallback(() => {
    if (disabled || isLoading) return;
    buttonScale.value = withSpring(0.96, springConfigs.button);
    debouncedHaptic(hapticFeedback.addToCartPress);
    glowOpacity.value = withTiming(0, { duration: 100 });
  }, [disabled, isLoading]);

  const handlePressOut = useCallback(() => {
    if (disabled || isLoading) return;
    buttonScale.value = withSpring(1, springConfigs.button);

    // Ripple effect
    rippleScale.value = 0;
    rippleScale.value = withTiming(3, { duration: 600, easing: Easing.out(Easing.ease) });
    rippleOpacity.value = 0.35;
    rippleOpacity.value = withTiming(0, { duration: 600 });
  }, [disabled, isLoading]);

  const handlePress = useCallback(async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    // Start loading animation
    loaderOpacity.value = withTiming(1, { duration: 150 });
    cartIconOpacity.value = withTiming(0, { duration: 100 });

    try {
      await onAddToCart();

      // Success animation
      setShowSuccess(true);
      setIsLoading(false);

      // Stop loader
      loaderOpacity.value = withTiming(0, { duration: 100 });

      // Button morph
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 80 }),
        withSpring(1.04, springConfigs.celebration),
        withSpring(1, springConfigs.gentle)
      );

      // Color to green
      buttonColorProgress.value = withTiming(1, { duration: 250 });

      // Show checkmark
      checkIconOpacity.value = withTiming(1, { duration: 150 });
      checkIconScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(50, withSpring(1.15, springConfigs.celebration)),
        withSpring(1, springConfigs.button)
      );

      // Success haptic
      hapticFeedback.addToCartSuccess();

      // Reset success state after delay (but keep "in cart" state)
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      // Error handling
      setIsLoading(false);
      loaderOpacity.value = withTiming(0, { duration: 100 });
      cartIconOpacity.value = withTiming(1, { duration: 150 });
      hapticFeedback.error();
    }
  }, [disabled, isLoading, onAddToCart]);

  // Animated styles
  const buttonContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const buttonBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      buttonColorProgress.value,
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

  const cartIconStyle = useAnimatedStyle(() => ({
    opacity: cartIconOpacity.value,
    transform: [{ scale: cartIconScale.value }],
  }));

  const checkIconStyle = useAnimatedStyle(() => ({
    opacity: checkIconOpacity.value,
    transform: [{ scale: checkIconScale.value }],
  }));

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }));

  const priceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: priceScale.value }],
    opacity: priceOpacity.value,
  }));

  // Button text based on state
  const buttonText = useMemo(() => {
    if (isLoading) return 'Ajout en cours...';
    if (showSuccess) return 'Ajouté au panier';
    if (isInCart) return `Dans le panier (${cartQuantity})`;
    return `Ajouter - ${formattedPrice}`;
  }, [isLoading, showSuccess, isInCart, cartQuantity, formattedPrice]);

  return (
    <View style={styles.container}>
      {/* Frosted Glass Background */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          <View style={styles.blurOverlay} />
        </BlurView>
      ) : (
        <View style={styles.androidBackground} />
      )}

      {/* Top Border */}
      <View style={styles.topBorder} />

      {/* Content */}
      <View style={styles.content}>
        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>TOTAL</Text>
          <Animated.Text style={[styles.priceValue, priceStyle]}>
            {formattedPrice}
          </Animated.Text>
        </View>

        {/* Add to Cart Button */}
        <AnimatedPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={disabled || isLoading}
          style={[styles.button, buttonContainerStyle]}
          accessibilityLabel={`Ajouter ${quantity} article${quantity > 1 ? 's' : ''} au panier pour ${formattedPrice}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || isLoading }}
        >
          {/* Button Background with Color Animation */}
          <Animated.View style={[styles.buttonBackground, buttonBackgroundStyle]}>
            {/* Glow Effect */}
            <Animated.View style={[styles.buttonGlow, glowStyle]} />

            {/* Ripple Effect */}
            <Animated.View style={[styles.ripple, rippleStyle]} />
          </Animated.View>

          {/* Button Content */}
          <View style={styles.buttonContent}>
            {/* Icons Container */}
            <View style={styles.iconContainer}>
              {/* Cart Icon */}
              <Animated.View style={[styles.iconWrapper, cartIconStyle]}>
                <ShoppingBag size={20} color={COLORS.white} strokeWidth={1.5} />
              </Animated.View>

              {/* Check Icon */}
              <Animated.View style={[styles.iconWrapper, styles.iconAbsolute, checkIconStyle]}>
                <Check size={20} color={COLORS.white} strokeWidth={2.5} />
              </Animated.View>

              {/* Inline Loader */}
              <Animated.View style={[styles.iconWrapper, styles.iconAbsolute, loaderStyle]}>
                <InlineLoader size="small" style="rings" />
              </Animated.View>
            </View>

            {/* Button Text */}
            <Text style={styles.buttonText}>{buttonText}</Text>
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  blurView: {
    ...StyleSheet.absoluteFillObject,
  },

  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 252, 247, 0.3)',
  },

  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 252, 247, 0.95)',
  },

  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
    gap: 16,
  },

  priceSection: {
    minWidth: 100,
    paddingTop: 8,
  },

  priceLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 14,
    color: COLORS.stone,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  priceValue: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.charcoal,
    letterSpacing: 0.3,
  },

  button: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },

  buttonBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },

  buttonGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: COLORS.hermes,
    borderRadius: 48,
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

  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconAbsolute: {
    position: 'absolute',
  },

  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default LuxuryAddToCartBar;
