/**
 * Cart Screen - Luxury Edition
 * A premium shopping cart experience with elegant animations
 */

import { View, Text, ScrollView, Pressable, Image, Platform, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Trash2, ShoppingBag, Package, Gift } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@bijoux/utils';
import { CartQuantitySelector } from '@/components/cart';
import { hapticFeedback } from '@/constants/haptics';
import { springConfigs } from '@/constants/animations';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  backgroundBeige: '#fcf7f1',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesDark: '#ea580c',
  white: '#ffffff',
  stone: '#b8a99a',
  textMuted: '#696969',
  textSecondary: '#444444',
  borderLight: '#f0ebe3',
  border: '#e2d8ce',
  success: '#059669',
  successLight: '#ecfdf5',
  danger: '#dc2626',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  const FREE_SHIPPING_THRESHOLD = 500;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - cart.totalPrice;
  const progressPercent = Math.min((cart.totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);

  // Checkout button animation
  const checkoutScale = useSharedValue(1);

  const checkoutButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkoutScale.value }],
  }));

  const handleCheckoutPressIn = () => {
    checkoutScale.value = withSpring(0.97, springConfigs.button);
    hapticFeedback.addToCartPress();
  };

  const handleCheckoutPressOut = () => {
    checkoutScale.value = withSpring(1, springConfigs.button);
  };

  const handleRemoveItem = (productId: string) => {
    hapticFeedback.warning();
    removeFromCart(productId);
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.emptyIconContainer}
        >
          <ShoppingBag size={44} color={COLORS.stone} strokeWidth={1.2} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.emptyTitle}
        >
          Votre panier est vide
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.emptySubtitle}
        >
          Découvrez nos collections et ajoutez vos coups de cœur
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Link href="/collections" asChild>
            <Pressable
              style={styles.emptyButton}
              onPressIn={() => hapticFeedback.navigation()}
            >
              <Text style={styles.emptyButtonText}>Voir les collections</Text>
            </Pressable>
          </Link>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon panier</Text>
        <Text style={styles.headerSubtitle}>
          {cart.totalItems} article{cart.totalItems > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Free Shipping Progress */}
      {remainingForFreeShipping > 0 ? (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.shippingBanner}
        >
          <View style={styles.shippingIconContainer}>
            <Package size={18} color={COLORS.hermes} strokeWidth={1.5} />
          </View>
          <View style={styles.shippingTextContainer}>
            <Text style={styles.shippingText}>
              Plus que <Text style={styles.shippingHighlight}>{formatPrice(remainingForFreeShipping)}</Text> pour la livraison gratuite
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.freeShippingBanner}
        >
          <Gift size={18} color={COLORS.success} strokeWidth={1.5} />
          <Text style={styles.freeShippingText}>Livraison gratuite incluse</Text>
        </Animated.View>
      )}

      {/* Cart Items */}
      <ScrollView
        style={styles.itemsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContent}
      >
        {cart.items.map((item, index) => (
          <Animated.View
            key={item.product.id}
            entering={FadeInDown.delay(index * 80).duration(400)}
            exiting={FadeOut.duration(200)}
            layout={Layout.springify()}
            style={styles.cartItem}
          >
            {/* Product Image */}
            <Pressable
              onPress={() => {
                hapticFeedback.navigation();
                router.push(`/product/${item.product.id}`);
              }}
              style={styles.itemImageContainer}
            >
              <Image
                source={{ uri: item.product.images[0] || 'https://via.placeholder.com/100' }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            </Pressable>

            {/* Product Info */}
            <View style={styles.itemInfo}>
              <Pressable onPress={() => {
                hapticFeedback.navigation();
                router.push(`/product/${item.product.id}`);
              }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
              </Pressable>

              {item.product.collection && (
                <Text style={styles.itemCollection}>{item.product.collection}</Text>
              )}

              <Text style={styles.itemPrice}>
                {formatPrice(item.product.price)}
              </Text>

              {/* Quantity & Remove Row */}
              <View style={styles.itemActions}>
                <CartQuantitySelector
                  value={item.quantity}
                  onChange={(quantity) => updateQuantity(item.product.id, quantity)}
                  min={1}
                  max={10}
                />

                <Pressable
                  onPress={() => handleRemoveItem(item.product.id)}
                  style={styles.removeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={18} color={COLORS.danger} strokeWidth={1.5} />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* Spacer for bottom bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Cart Summary - Sticky Bottom */}
      <View style={styles.summaryContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="light" style={styles.blurView}>
            <View style={styles.blurOverlay} />
          </BlurView>
        ) : (
          <View style={styles.androidBackground} />
        )}

        <View style={styles.topBorder} />

        <View style={styles.summaryContent}>
          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{formatPrice(cart.totalPrice)}</Text>
          </View>

          {/* Shipping */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={[
              styles.summaryValue,
              cart.totalPrice >= FREE_SHIPPING_THRESHOLD && styles.freeText
            ]}>
              {cart.totalPrice >= FREE_SHIPPING_THRESHOLD ? 'Gratuite' : 'Calculée à la commande'}
            </Text>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(cart.totalPrice)}</Text>
          </View>

          {/* Checkout Button */}
          <AnimatedPressable
            onPressIn={handleCheckoutPressIn}
            onPressOut={handleCheckoutPressOut}
            onPress={() => router.push('/checkout')}
            style={[styles.checkoutButton, checkoutButtonStyle]}
          >
            <Text style={styles.checkoutButtonText}>Passer commande</Text>
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.backgroundBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  emptyTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 26,
    color: COLORS.charcoal,
    marginBottom: 12,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  emptyButton: {
    backgroundColor: COLORS.hermes,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },

  emptyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },

  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 32,
    color: COLORS.charcoal,
    letterSpacing: 0.3,
  },

  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Shipping Banner
  shippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.backgroundBeige,
    borderRadius: 16,
  },

  shippingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  shippingTextContainer: {
    flex: 1,
  },

  shippingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  shippingHighlight: {
    fontFamily: 'Inter-SemiBold',
    color: COLORS.hermes,
  },

  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: COLORS.hermes,
    borderRadius: 2,
  },

  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 14,
    backgroundColor: COLORS.successLight,
    borderRadius: 16,
    gap: 8,
  },

  freeShippingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.success,
  },

  // Cart Items
  itemsContainer: {
    flex: 1,
  },

  itemsContent: {
    paddingHorizontal: 24,
  },

  cartItem: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  itemImageContainer: {
    marginRight: 16,
  },

  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundBeige,
  },

  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  itemName: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 16,
    color: COLORS.charcoal,
    lineHeight: 22,
  },

  itemCollection: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: COLORS.hermes,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },

  itemPrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.hermes,
    marginTop: 4,
  },

  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  removeButton: {
    padding: 8,
    opacity: 0.7,
  },

  bottomSpacer: {
    height: 200,
  },

  // Summary
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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

  summaryContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
  },

  summaryValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.charcoal,
  },

  freeText: {
    fontFamily: 'Inter-Medium',
    color: COLORS.success,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  totalLabel: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 18,
    color: COLORS.charcoal,
  },

  totalValue: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: COLORS.hermes,
  },

  checkoutButton: {
    backgroundColor: COLORS.hermes,
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
  },

  checkoutButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
