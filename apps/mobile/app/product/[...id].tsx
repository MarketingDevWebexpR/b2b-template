import { View, Text, ScrollView, Image, Pressable, Dimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, ShoppingBag } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import type { Product } from '@bijoux/types';
import { formatPrice } from '@bijoux/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCartAnimation } from '@/context/CartAnimationContext';
import { ProductDetailSkeleton } from '@/components/skeleton';
import { api } from '@/lib/api';
import {
  LuxuryQuantitySelector,
  LuxuryAddToCartBar,
} from '@/components/product';
import type { ButtonPosition } from '@/components/product/LuxuryAddToCartBar';
import { hapticFeedback } from '@/constants/haptics';

const { width: screenWidth } = Dimensions.get('window');

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?ixlib=rb-4.1.0&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max';

// Design tokens
const COLORS = {
  charcoal: '#2b333f',
  hermes: '#f67828',
  white: '#ffffff',
  stone: '#b8a99a',
};

export default function ProductDetailScreen() {
  const { id: idSegments } = useLocalSearchParams<{ id: string[] }>();
  const router = useRouter();

  // Handle catch-all route - join segments with "/" to reconstruct full product ID
  // This handles Sage product references like "CHAAR/VAR"
  const id = Array.isArray(idSegments) ? idSegments.join('/') : idSegments;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isInCart, getItemQuantity, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { triggerFlyToCart } = useCartAnimation();

  // Store the last captured button position for the animation
  const lastButtonPosition = useRef<ButtonPosition | null>(null);

  const inCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getItemQuantity(product.id) : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await api.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Handle button position capture from LuxuryAddToCartBar
  const handleButtonPositionCapture = useCallback((position: ButtonPosition) => {
    lastButtonPosition.current = position;
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    const images = product.images.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE];
    const productImage = images[0];

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart(product, quantity);

    // Trigger fly-to-cart animation if we have a position
    if (lastButtonPosition.current) {
      triggerFlyToCart({
        productImage,
        startPosition: lastButtonPosition.current,
      });
    }

    // Reset quantity for next add
    setQuantity(1);
  }, [product, quantity, addToCart, triggerFlyToCart]);

  const handleToggleWishlist = useCallback(() => {
    if (product) {
      hapticFeedback.selection();
      toggleWishlist(product);
    }
  }, [product, toggleWishlist]);

  // Header right component with cart icon
  const HeaderRight = useCallback(() => (
    <Pressable
      onPress={() => {
        hapticFeedback.navigation();
        router.push('/(tabs)/cart');
      }}
      style={styles.headerCartButton}
      accessibilityLabel={`Panier, ${cart.totalItems} article${cart.totalItems > 1 ? 's' : ''}`}
    >
      <ShoppingBag size={22} color={COLORS.charcoal} strokeWidth={1.5} />
      {cart.totalItems > 0 && (
        <View style={styles.headerCartBadge}>
          <Text style={styles.headerCartBadgeText}>
            {cart.totalItems > 9 ? '9+' : cart.totalItems}
          </Text>
        </View>
      )}
    </Pressable>
  ), [cart.totalItems, router]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="font-serif text-xl text-text-primary">Produit non trouvé</Text>
      </View>
    );
  }

  const images = product.images.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: 'Retour',
          headerStyle: { backgroundColor: '#fffcf7' },
          headerTintColor: '#2b333f',
          headerShadowVisible: false,
          headerRight: HeaderRight,
        }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Image Gallery */}
        <Animated.View entering={FadeIn.duration(400)} className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width: screenWidth, height: screenWidth * 1.1 }}
                resizeMode="cover"
                className="bg-background-beige"
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {images.length > 1 && (
            <View className="absolute bottom-6 left-0 right-0 flex-row justify-center">
              {images.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1.5 ${
                    index === currentImageIndex ? 'bg-hermes-500 w-6' : 'bg-white/70'
                  }`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  }}
                />
              ))}
            </View>
          )}

          {/* Favorite Button */}
          <Pressable
            onPress={handleToggleWishlist}
            className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
            accessibilityLabel={product && isInWishlist(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            accessibilityRole="button"
          >
            <Heart
              size={22}
              color={product && isInWishlist(product.id) ? '#f67828' : '#696969'}
              fill={product && isInWishlist(product.id) ? '#f67828' : 'transparent'}
              strokeWidth={1.5}
            />
          </Pressable>
        </Animated.View>

        {/* Product Info */}
        <View className="px-6 pt-6">
          {/* Collection Badge */}
          {product.collection && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <Text className="font-sans text-xs text-hermes-500 uppercase tracking-[3px] mb-3">
                {product.collection}
              </Text>
            </Animated.View>
          )}

          {/* Name */}
          <Animated.Text
            entering={FadeInDown.delay(150).duration(400)}
            className="font-serif text-2xl text-text-primary leading-tight"
          >
            {product.name}
          </Animated.Text>

          {/* Price */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="flex-row items-baseline mt-3"
          >
            <Text className="font-serif text-2xl text-hermes-500">
              {formatPrice(product.price)}
            </Text>
            {product.isPriceTTC && (
              <Text className="font-sans text-sm text-text-muted ml-2">TTC</Text>
            )}
          </Animated.View>

          {/* Reference */}
          <Animated.Text
            entering={FadeInDown.delay(250).duration(400)}
            className="font-sans text-sm text-text-muted mt-2"
          >
            Ref: {product.reference}
          </Animated.Text>

          {/* Divider */}
          <View className="h-px bg-border-light my-6" />

          {/* Quantity Selector - Moved up for better visibility */}
          <Animated.View entering={FadeInDown.delay(280).duration(400)}>
            <View style={styles.quantityCard}>
              <View style={styles.quantityHeader}>
                <Text style={styles.quantityTitle}>Quantité à ajouter</Text>
                {inCart && (
                  <View style={styles.inCartBadge}>
                    <Text style={styles.inCartText}>
                      {cartQuantity} déjà dans le panier
                    </Text>
                  </View>
                )}
              </View>
              <LuxuryQuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={10}
              />
            </View>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(320).duration(400)}>
            <Text className="font-serif text-lg text-text-primary mb-3">Description</Text>
            <Text className="font-sans text-text-secondary leading-relaxed">
              {product.description}
            </Text>
          </Animated.View>

          {/* Specifications */}
          {(product.materials.length > 0 || product.weight || product.origin || product.warranty) && (
            <Animated.View entering={FadeInDown.delay(360).duration(400)} className="mt-8">
              <Text className="font-serif text-lg text-text-primary mb-4">Caractéristiques</Text>
              <View className="bg-background-beige rounded-xl p-5">
                {product.materials.length > 0 && (
                  <View className="flex-row justify-between py-3 border-b border-border-light">
                    <Text className="font-sans text-text-muted">Matériaux</Text>
                    <Text className="font-sans text-text-primary font-medium">
                      {product.materials.join(', ')}
                    </Text>
                  </View>
                )}
                {product.weight && (
                  <View className="flex-row justify-between py-3 border-b border-border-light">
                    <Text className="font-sans text-text-muted">Poids</Text>
                    <Text className="font-sans text-text-primary font-medium">
                      {product.weight} {product.weightUnit}
                    </Text>
                  </View>
                )}
                {product.origin && (
                  <View className="flex-row justify-between py-3 border-b border-border-light">
                    <Text className="font-sans text-text-muted">Origine</Text>
                    <Text className="font-sans text-text-primary font-medium">{product.origin}</Text>
                  </View>
                )}
                {product.warranty && (
                  <View className="flex-row justify-between py-3">
                    <Text className="font-sans text-text-muted">Garantie</Text>
                    <Text className="font-sans text-text-primary font-medium">
                      {product.warranty} mois
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Spacing for bottom bar */}
          <View className="h-8" />
        </View>
      </ScrollView>

      {/* Luxury Add to Cart Bar */}
      <LuxuryAddToCartBar
        price={product.price}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        isInCart={inCart}
        cartQuantity={cartQuantity}
        onButtonPositionCapture={handleButtonPositionCapture}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerCartButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  headerCartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.hermes,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  headerCartBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: COLORS.white,
  },

  quantityCard: {
    backgroundColor: '#fcf7f1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0ebe3',
  },

  quantityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  quantityTitle: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 16,
    color: COLORS.charcoal,
  },

  inCartBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  inCartText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#059669',
  },
});
