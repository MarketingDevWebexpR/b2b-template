import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';
import type { Category } from '@bijoux/types';

interface CategoryCardProps {
  category: Category;
  index?: number;
  size?: 'default' | 'large';
}

export function CategoryCard({ category, index = 0, size = 'default' }: CategoryCardProps) {
  const isLarge = size === 'large';
  const displayIndex = String(index + 1).padStart(2, '0');

  // Fixed height for consistent card layout
  const cardHeight = isLarge ? 130 : 110;

  return (
    <Link href={`/collections/${category.slug}`} asChild>
      <Pressable
        className={`bg-background-beige rounded-elegant border border-border-light ${
          isLarge ? 'p-6' : 'p-4'
        }`}
        style={{ height: cardHeight }}
      >
        {/* Header with title and index */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <Text
              className={`font-serif text-text-primary ${
                isLarge ? 'text-lg' : 'text-base'
              }`}
              numberOfLines={2}
            >
              {category.name}
            </Text>
          </View>
          <Text className={`font-serif text-hermes-500 ${isLarge ? 'text-2xl' : 'text-xl'} opacity-50`}>
            {displayIndex}
          </Text>
        </View>

        {/* Spacer - flex to push footer to bottom */}
        <View className="flex-1" />

        {/* Footer with count and arrow */}
        <View className="flex-row justify-between items-center">
          <Text className="font-sans text-text-secondary text-sm tracking-wider uppercase">
            {category.productCount || 0} piece{(category.productCount || 0) > 1 ? 's' : ''}
          </Text>
          <ArrowUpRight size={20} color="#f67828" />
        </View>
      </Pressable>
    </Link>
  );
}
