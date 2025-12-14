import { View, Text, FlatList, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import type { Product } from '@bijoux/types';
import { formatPrice } from '@bijoux/utils';
import { useWishlist } from '@/context/WishlistContext';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { api } from '@/lib/api';

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?ixlib=rb-4.1.0&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max';

export default function CollectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Convert slug to display name
  const collectionName = slug
    ? decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Collection';

  useEffect(() => {
    const fetchProducts = async () => {
      if (!slug) return;
      try {
        const allProducts = await api.getProducts();
        // Filter products by collection name (case-insensitive comparison)
        const collectionProducts = allProducts.filter(
          (p) =>
            p.collection &&
            p.collection.toLowerCase().replace(/[/\s]/g, '-') === slug.toLowerCase()
        );
        setProducts(collectionProducts);
      } catch (error) {
        console.error('Error fetching collection products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const imageUrl = item.images[0] || DEFAULT_PRODUCT_IMAGE;
    const isFavorite = isInWishlist(item.id);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(400)}
        className="flex-1 m-2"
      >
        <Pressable
          onPress={() => router.push(`/product/${item.id}`)}
          className="bg-white rounded-xl overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="relative">
            <Image
              source={{ uri: imageUrl }}
              className="w-full aspect-square bg-background-beige"
              resizeMode="cover"
            />
            <Pressable
              onPress={() => toggleWishlist(item)}
              className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full items-center justify-center"
              accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart
                size={18}
                color={isFavorite ? '#f67828' : '#696969'}
                fill={isFavorite ? '#f67828' : 'transparent'}
                strokeWidth={1.5}
              />
            </Pressable>
          </View>
          <View className="p-4">
            {item.collection && (
              <Text className="font-sans text-[10px] text-hermes-500 uppercase tracking-[2px] mb-1">
                {item.collection}
              </Text>
            )}
            <Text className="font-serif text-base text-text-primary" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="font-serif text-lg text-hermes-500 mt-2">
              {formatPrice(item.price)}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <LoadingAnimation variant="fullScreen" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerTitle: collectionName,
        }}
      />

      {products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-serif text-xl text-text-primary text-center">
            Aucun produit dans cette collection
          </Text>
          <Text className="font-sans text-text-muted text-center mt-2">
            Explorez nos autres collections
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-hermes-500 px-8 py-3 rounded-full"
          >
            <Text className="font-sans text-white font-medium">Retour</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 8 }}
          ListHeaderComponent={
            <View className="px-4 py-6">
              <Text className="font-serif text-2xl text-text-primary text-center">
                {collectionName}
              </Text>
              <Text className="font-sans text-text-muted text-center mt-2">
                {products.length} produit{products.length > 1 ? 's' : ''}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
