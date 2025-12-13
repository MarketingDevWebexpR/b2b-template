import { View, Text, ScrollView, Image, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import type { Product } from '@bijoux/types';
import { formatPrice } from '@bijoux/utils';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import {
  LuxuryQuantitySelector,
  LuxuryAddToCartBar,
  AddToCartSuccessOverlay,
} from '@/components/product';

const { width: screenWidth } = Dimensions.get('window');

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?ixlib=rb-4.1.0&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();

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

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart(product, quantity);
    setShowSuccessOverlay(true);
  }, [product, quantity, addToCart]);

  const handleDismissOverlay = useCallback(() => {
    setShowSuccessOverlay(false);
  }, []);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#f67828" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="font-serif text-xl text-text-primary">Produit non trouve</Text>
      </View>
    );
  }

  const images = product.images.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerTitle: '' }} />

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
            onPress={toggleFavorite}
            className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <Heart
              size={22}
              color={isFavorite ? '#f67828' : '#696969'}
              fill={isFavorite ? '#f67828' : 'transparent'}
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

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text className="font-serif text-lg text-text-primary mb-3">Description</Text>
            <Text className="font-sans text-text-secondary leading-relaxed">
              {product.description}
            </Text>
          </Animated.View>

          {/* Specifications */}
          {(product.materials.length > 0 || product.weight || product.origin || product.warranty) && (
            <Animated.View entering={FadeInDown.delay(350).duration(400)} className="mt-8">
              <Text className="font-serif text-lg text-text-primary mb-4">Caracteristiques</Text>
              <View className="bg-background-beige rounded-xl p-5">
                {product.materials.length > 0 && (
                  <View className="flex-row justify-between py-3 border-b border-border-light">
                    <Text className="font-sans text-text-muted">Materiaux</Text>
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

          {/* Luxury Quantity Selector */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <LuxuryQuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={10}
            />
          </Animated.View>

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
      />

      {/* Success Overlay */}
      <AddToCartSuccessOverlay
        visible={showSuccessOverlay}
        productName={product.name}
        productImage={images[0]}
        quantity={quantity}
        onDismiss={handleDismissOverlay}
      />
    </View>
  );
}
