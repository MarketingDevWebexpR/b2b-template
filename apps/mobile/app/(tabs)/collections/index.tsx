import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { CategoryCard } from '@/components/CategoryCard';
import { useCategories } from '@/context/CategoryContext';

export default function CollectionsScreen() {
  const { categories, isLoading, refetch, getCategoryIndex } = useCategories();

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 pt-6 pb-4">
        <Text className="font-serif text-3xl text-text-primary">Collections</Text>
        <Text className="font-sans text-text-muted mt-1">
          Découvrez nos créations par catégorie
        </Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={{ flex: 1, height: 130 }}>
            <CategoryCard category={item} index={getCategoryIndex(item.id) - 1} size="large" />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#f67828" />
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-text-muted">Chargement...</Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-text-muted">Aucune collection disponible</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
