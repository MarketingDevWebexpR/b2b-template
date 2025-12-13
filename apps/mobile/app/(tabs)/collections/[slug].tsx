import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import type { Product, Category } from '@bijoux/types';
import { ProductCard } from '@/components/ProductCard';
import { api } from '@/lib/api';

export default function CollectionDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const [categoryData, productsData] = await Promise.all([
          api.getCategoryBySlug(slug),
          api.getProductsByCategorySlug(slug),
        ]);
        setCategory(categoryData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#f67828" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: category?.name || 'Collection' }} />
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <Text className="font-serif text-2xl text-text-primary">{category?.name}</Text>
          {category?.description && (
            <Text className="font-sans text-text-muted mt-1">{category.description}</Text>
          )}
          <Text className="font-sans text-sm text-text-muted mt-2">
            {products.length} produit{products.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Products Grid */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom + 100, 120) }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View className="flex-1">
              <ProductCard product={item} />
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-text-muted">Aucun produit dans cette collection</Text>
            </View>
          }
        />
      </View>
    </>
  );
}
