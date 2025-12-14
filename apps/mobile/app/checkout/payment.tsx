/**
 * Payment Screen
 * Step 2: Payment method selection and Stripe integration
 * Luxury jewelry e-commerce checkout experience
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  CheckoutStepIndicator,
  OrderSummary,
  PaymentForm,
  CheckoutButton,
  SecurePaymentBadge,
  type PaymentMethod,
  type CartItem,
} from '@/components/checkout';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/hooks/useCheckout';
import { useStripePayment, type StripePaymentError } from '@/hooks/useStripePayment';
import { formatPrice } from '@bijoux/utils';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  backgroundBeige: '#fcf7f1',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesLight: '#fff7ed',
  white: '#ffffff',
  textMuted: '#696969',
  borderLight: '#f0ebe3',
  success: '#059669',
  error: '#dc2626',
};

const FONTS = {
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  displayMedium: 'PlayfairDisplay-Medium',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const RADIUS = {
  md: 12,
  lg: 16,
};

// Default payment methods
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'apple_pay',
    type: 'apple_pay',
    label: 'Apple Pay',
  },
  {
    id: 'card_1',
    type: 'card',
    label: 'Visa ****4242',
    lastFourDigits: '4242',
    brand: 'visa',
    expiryDate: '12/25',
    isDefault: true,
  },
];

// Button state type
type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, clearCart } = useCart();
  const { shippingOption, shippingAddress } = useCheckout();
  const {
    isLoading: isStripeLoading,
    isProcessing: stripeProcessing,
    error: stripeError,
    initializePayment,
    confirmPayment,
    reset: resetStripe,
  } = useStripePayment({
    onPaymentSuccess: (result) => {
      console.log('Payment succeeded:', result);
    },
    onPaymentError: (error: StripePaymentError) => {
      console.error('Payment error:', error);
    },
  });

  // State
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('card_1');
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Calculate totals
  const { subtotal, shippingCost, total, cartItems } = useMemo(() => {
    const subtotal = cart.totalPrice;
    const shippingCost = shippingOption?.price || 0;
    const total = subtotal + shippingCost;

    // Convert cart items to OrderSummary format
    const cartItems: CartItem[] = cart.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0] || '',
      variant: item.product.collection,
    }));

    return { subtotal, shippingCost, total, cartItems };
  }, [cart, shippingOption]);

  // Handle Stripe error
  useEffect(() => {
    if (stripeError) {
      setPaymentError(stripeError.localizedMessage);
      setButtonState('error');
    }
  }, [stripeError]);

  // Handle payment method selection
  const handlePaymentSelect = useCallback((id: string) => {
    hapticFeedback.softConfirm();
    setSelectedPaymentId(id);
    setPaymentError(null);
  }, []);

  // Handle add new card
  const handleAddNewCard = useCallback(() => {
    hapticFeedback.softConfirm();
    Alert.alert(
      'Ajouter une carte',
      'Cette fonctionnalité sera disponible prochainement.',
      [{ text: 'OK' }]
    );
  }, []);

  // Handle payment submission
  const handlePayment = useCallback(async () => {
    if (buttonState !== 'idle') return;

    setButtonState('loading');
    setPaymentError(null);

    try {
      // Simulate payment processing
      // In production, use the useStripePayment hook
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Process payment with Stripe
      // const result = await processPayment({
      //   amount: total,
      //   currency: 'eur',
      //   paymentMethodId: selectedPaymentId,
      // });

      // Success
      setButtonState('success');
      hapticFeedback.addToCartSuccess();

      // Navigate to confirmation after animation
      setTimeout(() => {
        // Clear cart
        clearCart();
        router.replace('/checkout/confirmation');
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      setButtonState('error');
      setPaymentError('Le paiement a échoué. Veuillez réessayer.');
      hapticFeedback.error();

      // Reset button state after error animation
      setTimeout(() => {
        setButtonState('idle');
      }, 1500);
    }
  }, [buttonState, total, selectedPaymentId, clearCart, router]);

  // Error message animation
  const errorOpacity = useSharedValue(0);

  useEffect(() => {
    if (paymentError) {
      errorOpacity.value = withSpring(1, springConfigs.gentle);
    } else {
      errorOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [paymentError]);

  const errorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Step Indicator */}
      <CheckoutStepIndicator
        currentStep="payment"
        completedSteps={['shipping']}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary - Collapsible */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.summarySection}
        >
          <OrderSummary
            items={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            initiallyExpanded={false}
          />
        </Animated.View>

        {/* Payment Form */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.paymentSection}
        >
          <PaymentForm
            methods={DEFAULT_PAYMENT_METHODS}
            selectedId={selectedPaymentId}
            onSelect={handlePaymentSelect}
            onAddNew={handleAddNewCard}
            showSecureIndicator={false}
          />
        </Animated.View>

        {/* Secure Payment Badge */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.securitySection}
        >
          <SecurePaymentBadge variant="prominent" animated />
        </Animated.View>

        {/* Error Message */}
        {paymentError && (
          <Animated.View style={[styles.errorContainer, errorStyle]}>
            <Text style={styles.errorText}>{paymentError}</Text>
          </Animated.View>
        )}

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
        {/* Shipping Address Summary */}
        {shippingAddress && (
          <View style={styles.addressSummary}>
            <Text style={styles.addressLabel}>Livraison à :</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {shippingAddress.firstName} {shippingAddress.lastName}, {shippingAddress.city}
            </Text>
          </View>
        )}

        <CheckoutButton
          amount={total}
          onPress={handlePayment}
          state={buttonState}
          disabled={!selectedPaymentId || buttonState !== 'idle'}
          showSecureIcon={true}
        />

        {/* Terms */}
        <Text style={styles.termsText}>
          En passant commande, vous acceptez nos{' '}
          <Text style={styles.termsLink}>conditions générales</Text>
        </Text>
      </View>
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
    paddingBottom: 200,
  },

  // Summary section
  summarySection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  // Payment section
  paymentSection: {
    marginTop: SPACING.md,
  },

  // Security section
  securitySection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },

  // Error container
  errorContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.error + '15',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  errorText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },

  // Bottom spacer
  bottomSpacer: {
    height: 40,
  },

  // Bottom container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  // Address summary
  addressSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  addressLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  addressText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.charcoal,
    maxWidth: 200,
  },

  // Terms
  termsText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 16,
  },
  termsLink: {
    color: COLORS.hermes,
    textDecorationLine: 'underline',
  },
});
