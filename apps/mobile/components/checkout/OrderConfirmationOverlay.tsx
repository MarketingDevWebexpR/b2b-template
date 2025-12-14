/**
 * OrderConfirmationOverlay Component
 * Full-screen celebration overlay shown after successful payment
 * Features confetti particles, success animations, and elegant typography
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { Check, Package, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback } from '../../constants/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design tokens - Import from centralized file for consistency
import { COLORS as DESIGN_COLORS, FONTS as DESIGN_FONTS, SPACING as DESIGN_SPACING, RADIUS as DESIGN_RADIUS, SHADOWS } from '../../constants/designTokens';

const COLORS = {
  hermes: DESIGN_COLORS.hermes,
  hermesLight: DESIGN_COLORS.hermesLight,
  charcoal: DESIGN_COLORS.charcoal,
  textMuted: DESIGN_COLORS.textMuted,
  white: DESIGN_COLORS.white,
  stone: DESIGN_COLORS.stone,
  sand: DESIGN_COLORS.sand,
  gold: DESIGN_COLORS.gold,
  success: DESIGN_COLORS.success,
  successLight: DESIGN_COLORS.successLight,
  backdrop: DESIGN_COLORS.overlay,
};

const FONTS = {
  body: DESIGN_FONTS.body,
  bodySemiBold: DESIGN_FONTS.bodySemiBold,
  displayMedium: DESIGN_FONTS.displayMedium,
  displaySemiBold: DESIGN_FONTS.displaySemiBold,
};

const SPACING = {
  xs: DESIGN_SPACING.xxs,
  sm: DESIGN_SPACING.xs,
  md: DESIGN_SPACING.md,
  lg: DESIGN_SPACING.xl,
  xl: DESIGN_SPACING.xxl,
  xxl: DESIGN_SPACING.huge,
};

const RADIUS = {
  md: DESIGN_RADIUS.md,
  lg: DESIGN_RADIUS.lg,
  xxl: DESIGN_RADIUS.xxl,
};

// Particle configuration
const PARTICLE_COUNT = 20;
const PARTICLE_COLORS = [
  COLORS.hermes,
  COLORS.gold,
  '#fed7aa',
  '#fde68a',
  COLORS.success,
  '#a5f3fc',
];

// Particle type definition
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  delay: number;
  type: 'circle' | 'square' | 'diamond';
}

// Pre-generate particles for consistent rendering
const generateParticles = (): Particle[] =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2,
    y: -(100 + Math.random() * 200),
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    delay: Math.random() * 300,
    type: (['circle', 'square', 'diamond'] as const)[Math.floor(Math.random() * 3)],
  }));

// Static particles - generated once
const PARTICLES = generateParticles();

interface OrderConfirmationOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Order number to display */
  orderNumber: string;
  /** Callback when "View Order" is pressed */
  onViewOrder: () => void;
  /** Callback when "Continue Shopping" is pressed */
  onContinueShopping: () => void;
}

/**
 * Individual particle view component
 */
interface ParticleViewProps {
  particle: Particle;
  progress: SharedValue<number>;
}

function ParticleView({ particle, progress }: ParticleViewProps) {
  const style = useAnimatedStyle(() => {
    // Calculate particle animation based on progress
    // Each particle has a slight delay based on its own delay value
    const particleDelay = particle.delay / 300; // Normalize to 0-1 range
    const adjustedProgress = Math.max(0, (progress.value - particleDelay * 0.3) / 0.7);

    const translateYValue = interpolate(
      adjustedProgress,
      [0, 1],
      [0, particle.y],
      Extrapolation.CLAMP
    );

    const scaleValue = interpolate(
      adjustedProgress,
      [0, 0.1, 0.7, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );

    const opacityValue = interpolate(
      adjustedProgress,
      [0, 0.1, 0.7, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );

    const rotationValue = interpolate(
      adjustedProgress,
      [0, 1],
      [particle.rotation, particle.rotation + 180],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: particle.x },
        { translateY: translateYValue },
        { rotate: `${rotationValue}deg` },
        { scale: scaleValue },
      ],
      opacity: opacityValue,
    };
  });

  // Shape style based on particle type
  const shapeStyle = useMemo(
    () => ({
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.color,
      borderRadius:
        particle.type === 'circle'
          ? particle.size / 2
          : particle.type === 'diamond'
            ? 0
            : 2,
      transform: particle.type === 'diamond' ? [{ rotate: '45deg' }] : [],
    }),
    [particle]
  );

  return (
    <Animated.View style={[styles.particle, style]}>
      <View style={shapeStyle} />
    </Animated.View>
  );
}

/**
 * Animated action button component
 */
interface ActionButtonProps {
  variant: 'primary' | 'secondary';
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
}

function ActionButton({ variant, onPress, icon, label }: ActionButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfigs.button);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.button);
  };

  const handlePress = () => {
    hapticFeedback.softConfirm();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.actionButton,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {icon}
        <Text
          style={[
            styles.buttonText,
            isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Main OrderConfirmationOverlay component
 */
export function OrderConfirmationOverlay({
  visible,
  orderNumber,
  onViewOrder,
  onContinueShopping,
}: OrderConfirmationOverlayProps) {
  // Animation values
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const successCircleScale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const orderNumberScale = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(30);

  // Single progress value for all particles (avoids hooks in loops)
  const particleProgress = useSharedValue(0);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }, [visible]);

  // Show overlay animation sequence
  const showOverlay = useCallback(() => {
    // Haptic feedback for celebration
    hapticFeedback.addToCartSuccess();

    // Reset animation values
    cardScale.value = 0.8;
    successCircleScale.value = 0;
    checkScale.value = 0;
    titleOpacity.value = 0;
    titleY.value = 20;

    // Backdrop fade in
    backdropOpacity.value = withTiming(1, { duration: 300 });

    // Card entrance animation
    cardScale.value = withSpring(1, springConfigs.celebration);
    cardOpacity.value = withTiming(1, { duration: 200 });

    // Success circle pop
    successCircleScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    // Glow pulse animation
    glowScale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Checkmark bounce
    checkScale.value = withDelay(
      400,
      withSequence(
        withSpring(1.4, springConfigs.celebration),
        withSpring(1, springConfigs.button)
      )
    );

    // Title slide up
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    titleY.value = withDelay(500, withSpring(0, springConfigs.gentle));

    // Subtitle fade in
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));

    // Order number pop
    orderNumberScale.value = withDelay(
      700,
      withSequence(
        withSpring(1.1, springConfigs.button),
        withSpring(1, springConfigs.gentle)
      )
    );

    // Buttons slide up
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 300 }));
    buttonsY.value = withDelay(800, withSpring(0, springConfigs.gentle));

    // Confetti particles animation - single progress drives all particles
    particleProgress.value = 0;
    particleProgress.value = withDelay(
      300,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) })
    );
  }, []);

  // Hide overlay animation
  const hideOverlay = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    cardScale.value = withTiming(0.9, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 200 });
    particleProgress.value = withTiming(0, { duration: 200 });
  }, []);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const successCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successCircleScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: interpolate(
      glowScale.value,
      [1, 1.3],
      [0.5, 0.2],
      Extrapolation.CLAMP
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const orderNumberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orderNumberScale.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  // Don't render if not visible
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Backdrop with blur */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Confetti Particles */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {PARTICLES.map((particle) => (
          <ParticleView
            key={particle.id}
            particle={particle}
            progress={particleProgress}
          />
        ))}
      </View>

      {/* Main Card */}
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Success Circle with Glow */}
        <View style={styles.successContainer}>
          {/* Pulsing Glow */}
          <Animated.View style={[styles.glow, glowStyle]} />

          {/* Circle */}
          <Animated.View style={[styles.successCircle, successCircleStyle]}>
            <Animated.View style={checkStyle}>
              <Check size={48} color={COLORS.success} strokeWidth={3} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>Commande confirmée !</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Merci pour votre achat. Vous recevrez un email de confirmation.
        </Animated.Text>

        {/* Order Number Badge */}
        <Animated.View style={[styles.orderNumberContainer, orderNumberStyle]}>
          <Package size={16} color={COLORS.stone} />
          <Text style={styles.orderNumberLabel}>Commande</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
          <ActionButton
            variant="secondary"
            onPress={onViewOrder}
            icon={<ShoppingBag size={18} color={COLORS.hermes} />}
            label="Voir ma commande"
          />
          <ActionButton
            variant="primary"
            onPress={onContinueShopping}
            icon={<ArrowRight size={18} color={COLORS.white} />}
            label="Continuer"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
  card: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    alignItems: 'center',
    ...SHADOWS.modal, // Use consistent shadow from design tokens
  },
  successContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.successLight,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.success,
    // Success glow shadow
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 26,
    color: COLORS.charcoal,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.sand,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  orderNumberLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  orderNumber: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.charcoal,
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: RADIUS.lg, // Use consistent 16px radius for buttons
  },
  secondaryButton: {
    backgroundColor: COLORS.hermesLight,
    borderWidth: 1,
    borderColor: COLORS.hermes,
  },
  primaryButton: {
    backgroundColor: COLORS.hermes,
  },
  buttonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
  },
  secondaryButtonText: {
    color: COLORS.hermes,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
});

export default OrderConfirmationOverlay;
