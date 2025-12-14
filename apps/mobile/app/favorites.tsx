import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@bijoux/types';

// Mock favorites data - to be replaced with actual favorites system
const mockFavorites: Product[] = [];

export default function FavoritesScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingAnimation variant="fullScreen" />
      </SafeAreaView>
    );
  }

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-background-beige items-center justify-center mb-6">
            <Heart size={36} color="#696969" />
          </View>
          <Text className="font-serif text-2xl text-text-primary mb-2">Mes favoris</Text>
          <Text className="font-sans text-text-muted text-center mb-6">
            Connectez-vous pour sauvegarder vos coups de cœur
          </Text>

          <Link href="/(auth)/login" asChild>
            <Pressable className="bg-hermes-500 px-8 py-4 rounded-soft w-full mb-3">
              <Text className="text-white font-sans font-medium text-center">Se connecter</Text>
            </Pressable>
          </Link>

          <Link href="/(auth)/register" asChild>
            <Pressable className="border border-hermes-500 px-8 py-4 rounded-soft w-full">
              <Text className="text-hermes-500 font-sans font-medium text-center">Créer un compte</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no favorites
  if (mockFavorites.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-6 pt-6 pb-4">
          <Text className="font-serif text-3xl text-text-primary">Mes favoris</Text>
          <Text className="font-sans text-text-muted mt-1">0 article</Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-background-beige items-center justify-center mb-6">
            <Heart size={36} color="#696969" />
          </View>
          <Text className="font-serif text-xl text-text-primary mb-2 text-center">
            Aucun favori pour le moment
          </Text>
          <Text className="font-sans text-text-muted text-center mb-6">
            Parcourez nos collections et ajoutez vos pièces préférées à votre liste de favoris
          </Text>
          <Link href="/collections" asChild>
            <Pressable className="bg-hermes-500 px-8 py-4 rounded-soft">
              <Text className="text-white font-sans font-medium">Découvrir nos collections</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  // Favorites list
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="font-serif text-3xl text-text-primary">Mes favoris</Text>
        <Text className="font-sans text-text-muted mt-1">
          {mockFavorites.length} article{mockFavorites.length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={mockFavorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View className="flex-1">
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-text-muted">Aucun favori</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
