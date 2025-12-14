/**
 * Confirmation Screen
 * Step 3: Order confirmation with celebration animation
 * Luxury jewelry e-commerce checkout experience
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Check,
  Package,
  Mail,
  Calendar,
  MapPin,
  Home,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { CheckoutStepIndicator } from '@/components/checkout';
import { useCheckout } from '@/hooks/useCheckout';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback, debouncedHaptic } from '@/constants/haptics';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  backgroundBeige: '#fcf7f1',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesLight: '#fff7ed',
  white: '#ffffff',
  stone: '#b8a99a',
  textMuted: '#696969',
  borderLight: '#f0ebe3',
  success: '#059669',
  successLight: '#ecfdf5',
};

const FONTS = {
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  displayMedium: 'PlayfairDisplay-Medium',
  displaySemiBold: 'PlayfairDisplay-SemiBold',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BJ-${timestamp}-${random}`;
}

// Format date for display
function formatDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 5); // Add 5 days for delivery
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Info card component
 */
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  delay?: number;
}

function InfoCard({ icon, title, subtitle, delay = 0 }: InfoCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      style={styles.infoCard}
    >
      <View style={styles.infoIconContainer}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSubtitle}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
}

/**
 * Action button component
 */
interface ActionButtonProps {
  variant: 'primary';
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, springConfigs.button);
    debouncedHaptic(hapticFeedback.softConfirm);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.button);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.actionButton,
        styles.primaryButton,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export default function ConfirmationScreen() {
  const router = useRouter();
  const { shippingAddress, resetCheckout } = useCheckout();

  // Generate order number once
  const orderNumber = useMemo(() => generateOrderNumber(), []);
  const deliveryDate = useMemo(() => formatDeliveryDate(), []);

  // Animation values
  const checkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // Trigger celebration animation on mount
  useEffect(() => {
    // Check scale animation
    checkScale.value = withDelay(
      500,
      withSequence(
        withSpring(1.3, springConfigs.celebration),
        withSpring(1, springConfigs.button)
      )
    );

    // Glow pulse
    glowOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Success haptic
    hapticFeedback.addToCartSuccess();
  }, []);

  // Prevent back navigation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate to home instead of going back
      router.replace('/');
      return true;
    });

    return () => backHandler.remove();
  }, [router]);

  // Animated styles
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Handle continue shopping
  const handleContinueShopping = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    resetCheckout();
    router.replace('/');
  }, [router, resetCheckout]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Step Indicator */}
      <CheckoutStepIndicator
        currentStep="confirmation"
        completedSteps={['shipping', 'payment']}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <Animated.View
          entering={FadeIn.delay(300).duration(400)}
          style={styles.successHeader}
        >
          {/* Glow */}
          <Animated.View style={[styles.successGlow, glowAnimatedStyle]} />

          {/* Check Circle */}
          <Animated.View style={[styles.successCircle, checkAnimatedStyle]}>
            <Check size={48} color={COLORS.success} strokeWidth={3} />
          </Animated.View>

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.successTitle}
          >
            Commande confirmée !
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(500).duration(400)}
            style={styles.successSubtitle}
          >
            Merci pour votre confiance. Votre commande est en cours de préparation.
          </Animated.Text>
        </Animated.View>

        {/* Order Number Card */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          style={styles.orderNumberCard}
        >
          <Package size={20} color={COLORS.stone} />
          <View style={styles.orderNumberContent}>
            <Text style={styles.orderNumberLabel}>Numéro de commande</Text>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
        </Animated.View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          {/* Email Confirmation */}
          <InfoCard
            icon={<Mail size={20} color={COLORS.hermes} />}
            title="Email de confirmation"
            subtitle={shippingAddress?.email || 'Un email vous sera envoyé'}
            delay={700}
          />

          {/* Delivery Date */}
          <InfoCard
            icon={<Calendar size={20} color={COLORS.hermes} />}
            title="Livraison estimée"
            subtitle={deliveryDate}
            delay={750}
          />

          {/* Shipping Address */}
          {shippingAddress && (
            <InfoCard
              icon={<MapPin size={20} color={COLORS.hermes} />}
              title="Adresse de livraison"
              subtitle={`${shippingAddress.address1}, ${shippingAddress.postalCode} ${shippingAddress.city}`}
              delay={800}
            />
          )}
        </View>

        {/* Action Button */}
        <Animated.View
          entering={FadeInUp.delay(900).duration(400)}
          style={styles.actionsContainer}
        >
          <ActionButton
            variant="primary"
            icon={<Home size={20} color={COLORS.white} />}
            label="Retour à l'accueil"
            onPress={handleContinueShopping}
          />
        </Animated.View>

        {/* Help Text */}
        <Animated.Text
          entering={FadeInUp.delay(1000).duration(400)}
          style={styles.helpText}
        >
          Une question ? Contactez notre service client disponible 7j/7.
        </Animated.Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  // Success Header
  successHeader: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  successGlow: {
    position: 'absolute',
    top: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.successLight,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 28,
    color: COLORS.charcoal,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  // Order Number Card
  orderNumberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundBeige,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  orderNumberContent: {
    flex: 1,
  },
  orderNumberLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  orderNumber: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.charcoal,
    letterSpacing: 0.5,
  },

  // Info Cards
  infoCardsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.hermesLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Actions
  actionsContainer: {
    marginTop: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    gap: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.hermes,
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  primaryButtonText: {
    color: COLORS.white,
  },

  // Help Text
  helpText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 20,
  },
});
