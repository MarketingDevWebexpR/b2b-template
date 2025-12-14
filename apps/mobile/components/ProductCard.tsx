import { View, Text, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import type { Product } from '@bijoux/types';
import { formatPrice } from '@bijoux/utils';
import { hapticFeedback } from '@/constants/haptics';

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?ixlib=rb-4.1.0&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0] || DEFAULT_PRODUCT_IMAGE;

  return (
    <Link href={`/product/${product.id}`} asChild>
      <Pressable
        className="bg-white rounded-elegant overflow-hidden shadow-sm"
        onPressIn={() => hapticFeedback.buttonPress()}
      >
        {/* Product Image */}
        <View className="aspect-square bg-background-beige">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {product.isNew && (
            <View className="absolute top-2 left-2 bg-hermes-500 px-2 py-1 rounded-soft">
              <Text className="text-white text-xs font-sans font-medium">Nouveau</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-3 min-h-[100px]">
          <Text className="font-serif text-sm text-text-primary h-[38px]" numberOfLines={2}>
            {product.name}
          </Text>
          <Text className="font-sans text-hermes-500 font-medium mt-1">
            {formatPrice(product.price)}
          </Text>
          <Text className="font-sans text-xs text-text-muted mt-1">
            {product.collection || ' '}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
