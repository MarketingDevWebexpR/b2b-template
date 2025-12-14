/**
 * AddToCartSuccessOverlay Component
 * Enhanced version with actionable buttons and cart summary
 * Features: View cart / Continue shopping options
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { formatPrice } from '@bijoux/utils';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback } from '../../constants/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Design tokens
const COLORS = {
  backdrop: 'rgba(43, 51, 63, 0.6)',
  modalBg: '#fffcf7',
  successLight: '#ecfdf5',
  success: '#059669',
  successDark: '#047857',
  white: '#ffffff',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesDark: '#ea580c',
  gold: '#d4a574',
  stone: '#b8a99a',
  taupe: '#d4c9bd',
  border: '#f0ebe3',
};

// Particle configuration
const PARTICLE_COUNT = 8;
const PARTICLE_COLORS = [COLORS.hermes, COLORS.gold, COLORS.success, '#fed7aa', '#fde68a'];

interface ParticleData {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

interface ParticleProps {
  particle: ParticleData;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
  opacity: SharedValue<number>;
}

// Particle component
function Particle({ particle, translateY, scale, opacity }: ParticleProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle.x },
      { translateY: translateY.value },
      { rotate: `${particle.rotation}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.particle, { backgroundColor: particle.color }, animatedStyle]}
    />
  );
}

interface AddToCartSuccessOverlayProps {
  visible: boolean;
  productName?: string;
  productImage?: string;
  quantity?: number;
  cartTotalItems?: number;
  cartTotalPrice?: number;
  onDismiss?: () => void;
  onViewCart?: () => void;
  onContinueShopping?: () => void;
}

// Generate particles
const STATIC_PARTICLES: ParticleData[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 160 - 80,
  y: -(40 + Math.random() * 80),
  rotation: Math.random() * 360,
  scale: 0.4 + Math.random() * 0.6,
  color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  delay: i * 25,
}));

export function AddToCartSuccessOverlay({
  visible,
  productName,
  productImage,
  quantity = 1,
  cartTotalItems = 0,
  cartTotalPrice = 0,
  onDismiss,
  onViewCart,
  onContinueShopping,
}: AddToCartSuccessOverlayProps) {
  // Animation values - Backdrop & Modal
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);

  // Animation values - Success circle
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // Animation values - Content
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(15);
  const productOpacity = useSharedValue(0);
  const productTranslateY = useSharedValue(20);
  const summaryOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);

  // Button press animations
  const primaryButtonScale = useSharedValue(1);
  const secondaryButtonScale = useSharedValue(1);

  // Particle animations - individual shared values (hooks cannot be called inside useMemo)
  const particle0Scale = useSharedValue(0);
  const particle0TranslateY = useSharedValue(0);
  const particle0Opacity = useSharedValue(0);
  const particle1Scale = useSharedValue(0);
  const particle1TranslateY = useSharedValue(0);
  const particle1Opacity = useSharedValue(0);
  const particle2Scale = useSharedValue(0);
  const particle2TranslateY = useSharedValue(0);
  const particle2Opacity = useSharedValue(0);
  const particle3Scale = useSharedValue(0);
  const particle3TranslateY = useSharedValue(0);
  const particle3Opacity = useSharedValue(0);
  const particle4Scale = useSharedValue(0);
  const particle4TranslateY = useSharedValue(0);
  const particle4Opacity = useSharedValue(0);
  const particle5Scale = useSharedValue(0);
  const particle5TranslateY = useSharedValue(0);
  const particle5Opacity = useSharedValue(0);
  const particle6Scale = useSharedValue(0);
  const particle6TranslateY = useSharedValue(0);
  const particle6Opacity = useSharedValue(0);
  const particle7Scale = useSharedValue(0);
  const particle7TranslateY = useSharedValue(0);
  const particle7Opacity = useSharedValue(0);

  const particleAnims = useMemo(() => [
    { scale: particle0Scale, translateY: particle0TranslateY, opacity: particle0Opacity },
    { scale: particle1Scale, translateY: particle1TranslateY, opacity: particle1Opacity },
    { scale: particle2Scale, translateY: particle2TranslateY, opacity: particle2Opacity },
    { scale: particle3Scale, translateY: particle3TranslateY, opacity: particle3Opacity },
    { scale: particle4Scale, translateY: particle4TranslateY, opacity: particle4Opacity },
    { scale: particle5Scale, translateY: particle5TranslateY, opacity: particle5Opacity },
    { scale: particle6Scale, translateY: particle6TranslateY, opacity: particle6Opacity },
    { scale: particle7Scale, translateY: particle7TranslateY, opacity: particle7Opacity },
  ], []);

  // Handle visibility
  useEffect(() => {
    if (visible) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }, [visible]);

  const showOverlay = useCallback(() => {
    // Reset all values
    modalScale.value = 0.9;
    modalOpacity.value = 0;
    circleScale.value = 0;
    checkmarkScale.value = 0;
    titleOpacity.value = 0;
    titleTranslateY.value = 15;
    productOpacity.value = 0;
    productTranslateY.value = 20;
    summaryOpacity.value = 0;
    buttonsOpacity.value = 0;
    buttonsTranslateY.value = 20;

    particleAnims.forEach((anim) => {
      anim.scale.value = 0;
      anim.translateY.value = 0;
      anim.opacity.value = 0;
    });

    // Backdrop fade in
    backdropOpacity.value = withTiming(1, { duration: 200 });

    // Modal entrance
    modalOpacity.value = withDelay(50, withTiming(1, { duration: 250 }));
    modalScale.value = withDelay(50, withSpring(1, { damping: 15, stiffness: 200 }));

    // Success circle
    circleOpacity.value = withDelay(100, withTiming(1, { duration: 150 }));
    circleScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 180 }));
    glowOpacity.value = withDelay(200, withTiming(0.6, { duration: 300 }));

    // Checkmark
    checkmarkOpacity.value = withDelay(200, withTiming(1, { duration: 200 }));
    checkmarkScale.value = withDelay(200, withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    ));

    // Title
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 250 }));
    titleTranslateY.value = withDelay(300, withSpring(0, { damping: 20, stiffness: 150 }));

    // Product info
    productOpacity.value = withDelay(350, withTiming(1, { duration: 250 }));
    productTranslateY.value = withDelay(350, withSpring(0, { damping: 20, stiffness: 150 }));

    // Summary
    summaryOpacity.value = withDelay(400, withTiming(1, { duration: 250 }));

    // Buttons
    buttonsOpacity.value = withDelay(450, withTiming(1, { duration: 250 }));
    buttonsTranslateY.value = withDelay(450, withSpring(0, { damping: 20, stiffness: 150 }));

    // Particles
    particleAnims.forEach((anim, i) => {
      const particle = STATIC_PARTICLES[i];
      anim.opacity.value = withDelay(
        150 + particle.delay,
        withSequence(
          withTiming(1, { duration: 150 }),
          withDelay(400, withTiming(0, { duration: 300 }))
        )
      );
      anim.scale.value = withDelay(
        150 + particle.delay,
        withSequence(
          withSpring(particle.scale, { damping: 10, stiffness: 180 }),
          withDelay(400, withTiming(0, { duration: 250 }))
        )
      );
      anim.translateY.value = withDelay(
        150 + particle.delay,
        withTiming(particle.y, { duration: 500, easing: Easing.out(Easing.ease) })
      );
    });

    // Haptic feedback
    hapticFeedback.addToCartSuccess();
  }, []);

  const hideOverlay = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    modalOpacity.value = withTiming(0, { duration: 150 });
    modalScale.value = withTiming(0.95, { duration: 150 });
  }, []);

  // Button handlers
  const handlePrimaryPress = useCallback(() => {
    hapticFeedback.addToCartPress();
    onViewCart?.();
  }, [onViewCart]);

  const handleSecondaryPress = useCallback(() => {
    hapticFeedback.softConfirm();
    onContinueShopping?.() || onDismiss?.();
  }, [onContinueShopping, onDismiss]);

  const handleBackdropPress = useCallback(() => {
    hapticFeedback.softConfirm();
    onContinueShopping?.() || onDismiss?.();
  }, [onContinueShopping, onDismiss]);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: checkmarkOpacity.value,
    transform: [{ scale: checkmarkScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const productStyle = useAnimatedStyle(() => ({
    opacity: productOpacity.value,
    transform: [{ translateY: productTranslateY.value }],
  }));

  const summaryStyle = useAnimatedStyle(() => ({
    opacity: summaryOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const primaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryButtonScale.value }],
  }));

  const secondaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryButtonScale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop - Tappable to dismiss */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.androidBackdrop} />
          )}
        </Animated.View>
      </Pressable>

      {/* Modal Card */}
      <Animated.View style={[styles.modal, modalStyle]}>
        {/* Particles */}
        <View style={styles.particlesContainer}>
          {STATIC_PARTICLES.map((particle, i) => (
            <Particle
              key={particle.id}
              particle={particle}
              translateY={particleAnims[i].translateY}
              scale={particleAnims[i].scale}
              opacity={particleAnims[i].opacity}
            />
          ))}
        </View>

        {/* Success Circle */}
        <Animated.View style={[styles.successCircleContainer, circleStyle]}>
          {/* Glow Ring */}
          <Animated.View style={[styles.glowRing, glowStyle]} />

          {/* Circle */}
          <View style={styles.successCircle}>
            <Animated.View style={checkmarkStyle}>
              <Check size={32} color={COLORS.success} strokeWidth={3} />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          Ajouté au panier
        </Animated.Text>

        {/* Product Info */}
        {(productName || productImage) && (
          <Animated.View style={[styles.productSection, productStyle]}>
            {productImage && (
              <Image source={{ uri: productImage }} style={styles.productImage} />
            )}
            <View style={styles.productDetails}>
              {productName && (
                <Text style={styles.productName} numberOfLines={2}>
                  {productName}
                </Text>
              )}
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>×{quantity}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Cart Summary */}
        <Animated.View style={[styles.summarySection, summaryStyle]}>
          <Text style={styles.summaryText}>
            {cartTotalItems} article{cartTotalItems > 1 ? 's' : ''} dans votre panier
          </Text>
          <Text style={styles.totalText}>
            Total : {formatPrice(cartTotalPrice)}
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
          {/* Primary: View Cart */}
          <Animated.View style={primaryButtonStyle}>
            <Pressable
              onPressIn={() => {
                primaryButtonScale.value = withSpring(0.96, springConfigs.button);
              }}
              onPressOut={() => {
                primaryButtonScale.value = withSpring(1, springConfigs.button);
              }}
              onPress={handlePrimaryPress}
              style={styles.primaryButton}
              accessibilityLabel="Voir le panier"
              accessibilityRole="button"
            >
              <ShoppingBag size={18} color={COLORS.white} strokeWidth={1.5} />
              <Text style={styles.primaryButtonText}>Voir le panier</Text>
              <ArrowRight size={16} color={COLORS.white} strokeWidth={2} />
            </Pressable>
          </Animated.View>

          {/* Secondary: Continue Shopping */}
          <Animated.View style={secondaryButtonStyle}>
            <Pressable
              onPressIn={() => {
                secondaryButtonScale.value = withSpring(0.96, springConfigs.button);
              }}
              onPressOut={() => {
                secondaryButtonScale.value = withSpring(1, springConfigs.button);
              }}
              onPress={handleSecondaryPress}
              style={styles.secondaryButton}
              accessibilityLabel="Continuer mes achats"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Continuer mes achats</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  androidBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop,
  },

  modal: {
    width: Math.min(SCREEN_WIDTH - 48, 340),
    backgroundColor: COLORS.modalBg,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },

  particlesContainer: {
    position: 'absolute',
    top: 60,
    left: '50%',
    width: 200,
    height: 100,
    marginLeft: -100,
  },

  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  successCircleContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glowRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.successLight,
  },

  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  title: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 24,
    color: COLORS.charcoal,
    letterSpacing: 0.3,
    marginBottom: 20,
    textAlign: 'center',
  },

  productSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },

  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },

  productDetails: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  productName: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.charcoal,
    lineHeight: 20,
    marginRight: 8,
  },

  quantityBadge: {
    backgroundColor: COLORS.hermes,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  quantityText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },

  summarySection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },

  summaryText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: COLORS.stone,
    marginBottom: 4,
  },

  totalText: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    color: COLORS.charcoal,
    fontWeight: '500',
  },

  buttonsContainer: {
    width: '100%',
    gap: 12,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.hermes,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    gap: 10,
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  primaryButtonText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.taupe,
    backgroundColor: 'transparent',
  },

  secondaryButtonText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.charcoal,
    letterSpacing: 0.2,
  },
});

export default AddToCartSuccessOverlay;
