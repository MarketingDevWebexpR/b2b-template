/**
 * Checkout Index Screen
 * Entry point for the checkout flow showing cart summary
 * Luxury jewelry e-commerce experience
 */

import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Package, Shield, Truck } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@bijoux/utils';
import { CheckoutStepIndicator, SecurePaymentBadge } from '@/components/checkout';
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

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 500;

/**
 * Cart item row component
 */
function CartItemRow({
  item,
  index,
}: {
  item: { product: { id: string; name: string; price: number; images: string[]; collection?: string }; quantity: number };
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 50).duration(400)}
      style={styles.itemRow}
    >
      <Image
        source={{ uri: item.product.images[0] || 'https://via.placeholder.com/80' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.product.name}
        </Text>
        {item.product.collection && (
          <Text style={styles.itemCollection}>{item.product.collection}</Text>
        )}
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          <Text style={styles.itemPrice}>
            {formatPrice(item.product.price * item.quantity)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Delivery info badge
 */
function DeliveryInfoBadge() {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(400)}
      style={styles.deliveryBadge}
    >
      <View style={styles.deliveryIconContainer}>
        <Truck size={18} color={COLORS.success} strokeWidth={1.5} />
      </View>
      <View style={styles.deliveryTextContainer}>
        <Text style={styles.deliveryTitle}>Livraison estimée</Text>
        <Text style={styles.deliverySubtitle}>3-5 jours ouvrables</Text>
      </View>
    </Animated.View>
  );
}

export default function CheckoutIndexScreen() {
  const router = useRouter();
  const { cart } = useCart();
  const insets = useSafeAreaInsets();

  // Button animation
  const buttonScale = useSharedValue(1);

  // Calculate totals
  const { subtotal, shippingCost, total, hasFreeShipping } = useMemo(() => {
    const subtotal = cart.totalPrice;
    const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingCost = hasFreeShipping ? 0 : 15;
    const total = subtotal + shippingCost;

    return { subtotal, shippingCost, total, hasFreeShipping };
  }, [cart.totalPrice]);

  const handleContinue = useCallback(() => {
    debouncedHaptic(hapticFeedback.addToCartSuccess);
    router.push('/checkout/shipping');
  }, [router]);

  const handlePressIn = useCallback(() => {
    buttonScale.value = withSpring(0.96, springConfigs.button);
    debouncedHaptic(hapticFeedback.addToCartPress);
  }, []);

  const handlePressOut = useCallback(() => {
    buttonScale.value = withSpring(1, springConfigs.button);
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Package size={48} color={COLORS.stone} strokeWidth={1.2} />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des articles pour continuer
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Step Indicator */}
      <CheckoutStepIndicator
        currentStep="shipping"
        completedSteps={[]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Title */}
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={styles.sectionTitle}
        >
          Récapitulatif
        </Animated.Text>

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cart.items.map((item, index) => (
            <CartItemRow key={item.product.id} item={item} index={index} />
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Delivery Info */}
        <DeliveryInfoBadge />

        {/* Order Summary */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.summaryContainer}
        >
          <Text style={styles.summaryTitle}>Détails du prix</Text>

          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Sous-total ({cart.totalItems} article{cart.totalItems > 1 ? 's' : ''})
            </Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          {/* Shipping */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text
              style={[
                styles.summaryValue,
                hasFreeShipping && styles.freeShippingValue,
              ]}
            >
              {hasFreeShipping ? 'Gratuite' : formatPrice(shippingCost)}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.summaryDivider} />

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </Animated.View>

        {/* Security Badge */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.securityContainer}
        >
          <SecurePaymentBadge variant="compact" animated={false} />
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.continueButton, buttonAnimatedStyle]}
          accessibilityRole="button"
          accessibilityLabel="Continuer vers la livraison"
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
          <ArrowRight size={20} color={COLORS.white} strokeWidth={2} />
        </AnimatedPressable>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 22,
    color: COLORS.charcoal,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 20,
    color: COLORS.charcoal,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Cart items
  itemsContainer: {
    gap: SPACING.md,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundBeige,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  itemName: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.charcoal,
    lineHeight: 20,
  },
  itemCollection: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.hermes,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  itemQuantity: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  itemPrice: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.charcoal,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.lg,
  },

  // Delivery badge
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.success,
  },
  deliverySubtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Summary
  summaryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: COLORS.charcoal,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.charcoal,
  },
  freeShippingValue: {
    color: COLORS.success,
    fontFamily: FONTS.bodySemiBold,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: COLORS.charcoal,
  },
  totalValue: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 22,
    color: COLORS.hermes,
  },

  // Security
  securityContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
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
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.hermes,
    paddingVertical: 18,
    borderRadius: 28,
    gap: SPACING.sm,
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
