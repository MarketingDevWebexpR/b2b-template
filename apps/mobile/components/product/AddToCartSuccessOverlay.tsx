/**
 * AddToCartSuccessOverlay Component
 * A full-screen celebration overlay shown after successfully adding to cart
 * Features animated checkmark, confetti particles, and elegant typography
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { springConfigs, successOverlayTiming } from '../../constants/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design tokens
const COLORS = {
  backdrop: 'rgba(43, 51, 63, 0.4)',
  successLight: '#ecfdf5',
  success: '#059669',
  successDark: '#047857',
  white: '#ffffff',
  charcoal: '#2b333f',
  hermes: '#f67828',
  gold: '#d4a574',
};

// Particle configuration
const PARTICLE_COUNT = 12;
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

// Separate Particle component to respect hooks rules
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
  onDismiss?: () => void;
}

// Generate random particles - static to avoid regeneration
const STATIC_PARTICLES: ParticleData[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 200 - 100,
  y: -(50 + Math.random() * 100),
  rotation: Math.random() * 360,
  scale: 0.4 + Math.random() * 0.6,
  color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  delay: i * 30,
}));

export function AddToCartSuccessOverlay({
  visible,
  productName,
  productImage,
  quantity = 1,
  onDismiss,
}: AddToCartSuccessOverlayProps) {
  // Animation values
  const backdropOpacity = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const productOpacity = useSharedValue(0);
  const productTranslateY = useSharedValue(30);

  // Particle animation values - created once at component level
  const p0Scale = useSharedValue(0);
  const p0TranslateY = useSharedValue(0);
  const p0Opacity = useSharedValue(0);
  const p1Scale = useSharedValue(0);
  const p1TranslateY = useSharedValue(0);
  const p1Opacity = useSharedValue(0);
  const p2Scale = useSharedValue(0);
  const p2TranslateY = useSharedValue(0);
  const p2Opacity = useSharedValue(0);
  const p3Scale = useSharedValue(0);
  const p3TranslateY = useSharedValue(0);
  const p3Opacity = useSharedValue(0);
  const p4Scale = useSharedValue(0);
  const p4TranslateY = useSharedValue(0);
  const p4Opacity = useSharedValue(0);
  const p5Scale = useSharedValue(0);
  const p5TranslateY = useSharedValue(0);
  const p5Opacity = useSharedValue(0);
  const p6Scale = useSharedValue(0);
  const p6TranslateY = useSharedValue(0);
  const p6Opacity = useSharedValue(0);
  const p7Scale = useSharedValue(0);
  const p7TranslateY = useSharedValue(0);
  const p7Opacity = useSharedValue(0);
  const p8Scale = useSharedValue(0);
  const p8TranslateY = useSharedValue(0);
  const p8Opacity = useSharedValue(0);
  const p9Scale = useSharedValue(0);
  const p9TranslateY = useSharedValue(0);
  const p9Opacity = useSharedValue(0);
  const p10Scale = useSharedValue(0);
  const p10TranslateY = useSharedValue(0);
  const p10Opacity = useSharedValue(0);
  const p11Scale = useSharedValue(0);
  const p11TranslateY = useSharedValue(0);
  const p11Opacity = useSharedValue(0);

  // Array of particle animations for easier iteration
  const particleAnims = useMemo(() => [
    { scale: p0Scale, translateY: p0TranslateY, opacity: p0Opacity },
    { scale: p1Scale, translateY: p1TranslateY, opacity: p1Opacity },
    { scale: p2Scale, translateY: p2TranslateY, opacity: p2Opacity },
    { scale: p3Scale, translateY: p3TranslateY, opacity: p3Opacity },
    { scale: p4Scale, translateY: p4TranslateY, opacity: p4Opacity },
    { scale: p5Scale, translateY: p5TranslateY, opacity: p5Opacity },
    { scale: p6Scale, translateY: p6TranslateY, opacity: p6Opacity },
    { scale: p7Scale, translateY: p7TranslateY, opacity: p7Opacity },
    { scale: p8Scale, translateY: p8TranslateY, opacity: p8Opacity },
    { scale: p9Scale, translateY: p9TranslateY, opacity: p9Opacity },
    { scale: p10Scale, translateY: p10TranslateY, opacity: p10Opacity },
    { scale: p11Scale, translateY: p11TranslateY, opacity: p11Opacity },
  ], []);

  // Handle show/hide
  useEffect(() => {
    if (visible) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }, [visible]);

  const showOverlay = useCallback(() => {
    // Reset values
    circleScale.value = 0;
    checkmarkScale.value = 0;
    textOpacity.value = 0;
    textTranslateY.value = 20;
    productOpacity.value = 0;
    productTranslateY.value = 30;

    // Reset particle values
    particleAnims.forEach((anim) => {
      anim.scale.value = 0;
      anim.translateY.value = 0;
      anim.opacity.value = 0;
    });

    // Fade in backdrop
    backdropOpacity.value = withTiming(1, { duration: 200 });
    circleOpacity.value = withTiming(1, { duration: 150 });

    // Scale in circle with bounce
    circleScale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });

    // Animate checkmark
    checkmarkOpacity.value = withDelay(150, withTiming(1, { duration: 200 }));
    checkmarkScale.value = withDelay(
      150,
      withSequence(
        withSpring(1.2, springConfigs.celebration),
        withSpring(1, springConfigs.button)
      )
    );

    // Animate text
    textOpacity.value = withDelay(250, withTiming(1, { duration: 300 }));
    textTranslateY.value = withDelay(250, withSpring(0, springConfigs.gentle));

    // Animate product info
    productOpacity.value = withDelay(350, withTiming(1, { duration: 300 }));
    productTranslateY.value = withDelay(350, withSpring(0, springConfigs.gentle));

    // Animate particles
    particleAnims.forEach((anim, i) => {
      const particle = STATIC_PARTICLES[i];
      anim.opacity.value = withDelay(
        100 + particle.delay,
        withSequence(
          withTiming(1, { duration: 150 }),
          withDelay(300, withTiming(0, { duration: 400 }))
        )
      );
      anim.scale.value = withDelay(
        100 + particle.delay,
        withSequence(
          withSpring(particle.scale, springConfigs.celebration),
          withDelay(300, withTiming(0, { duration: 300 }))
        )
      );
      anim.translateY.value = withDelay(
        100 + particle.delay,
        withTiming(particle.y, { duration: 600, easing: Easing.out(Easing.ease) })
      );
    });

    // Auto-dismiss
    const timeout = setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      }
    }, successOverlayTiming.autoDismiss);

    return () => clearTimeout(timeout);
  }, [onDismiss]);

  const hideOverlay = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    circleScale.value = withTiming(0.8, { duration: 200 });
    circleOpacity.value = withTiming(0, { duration: 150 });
    textOpacity.value = withTiming(0, { duration: 150 });
    productOpacity.value = withTiming(0, { duration: 150 });
  }, []);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const productStyle = useAnimatedStyle(() => ({
    opacity: productOpacity.value,
    transform: [{ translateY: productTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Backdrop Blur */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Center Content */}
      <View style={styles.content}>
        {/* Particles */}
        {STATIC_PARTICLES.map((particle, i) => (
          <Particle
            key={particle.id}
            particle={particle}
            translateY={particleAnims[i].translateY}
            scale={particleAnims[i].scale}
            opacity={particleAnims[i].opacity}
          />
        ))}

        {/* Success Circle */}
        <Animated.View style={[styles.successCircle, circleStyle]}>
          {/* Glow Ring */}
          <View style={styles.glowRing} />

          {/* Checkmark */}
          <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
            <Check size={48} color={COLORS.success} strokeWidth={3} />
          </Animated.View>
        </Animated.View>

        {/* Success Text */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.successTitle}>Ajouté au panier</Text>
          <Text style={styles.successSubtitle}>
            {quantity} article{quantity > 1 ? 's' : ''} ajouté{quantity > 1 ? 's' : ''}
          </Text>
        </Animated.View>

        {/* Product Info (optional) */}
        {(productName || productImage) && (
          <Animated.View style={[styles.productInfo, productStyle]}>
            {productImage && (
              <Image source={{ uri: productImage }} style={styles.productImage} />
            )}
            {productName && (
              <Text style={styles.productName} numberOfLines={2}>
                {productName}
              </Text>
            )}
          </Animated.View>
        )}
      </View>
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
    backgroundColor: COLORS.backdrop,
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.successLight,
  },

  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    marginTop: 24,
    alignItems: 'center',
  },

  successTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 24,
    lineHeight: 32,
    color: COLORS.white,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  successSubtitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  },

  productInfo: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    maxWidth: 200,
  },

  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },

  productName: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default AddToCartSuccessOverlay;
