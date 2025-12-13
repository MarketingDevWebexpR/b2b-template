/**
 * SearchResults Component
 * Displays search results with grid/list toggle, skeleton loading,
 * and elegant empty states
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
  interpolate,
} from 'react-native-reanimated';
import { Link, useRouter } from 'expo-router';
import { Grid3X3, List, Search, Package } from 'lucide-react-native';
import type { Product } from '@bijoux/types';
import { formatPrice } from '@bijoux/utils';
import { springConfigs, timingConfigs, durations } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  backgroundBeige: '#f8f5f0',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesLight: '#fff7ed',
  taupe: '#d4c9bd',
  stone: '#b8a99a',
  sand: '#f0ebe3',
  white: '#ffffff',
  muted: '#696969',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20; // Container paddingHorizontal
const ITEM_GAP = 16; // Gap between grid items
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - ITEM_GAP) / 2;
const LIST_ITEM_IMAGE_SIZE = 100;

// Height constants for getItemLayout optimization
const GRID_ITEM_HEIGHT = GRID_ITEM_WIDTH + 80; // Image (square) + content padding
const LIST_ITEM_HEIGHT = LIST_ITEM_IMAGE_SIZE + 24; // Image + padding
const LIST_SEPARATOR_HEIGHT = 12;

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?ixlib=rb-4.1.0&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max';

interface SearchResultsProps {
  results: Product[];
  isLoading: boolean;
  searchQuery: string;
  onProductPress?: (product: Product) => void;
}

type ViewMode = 'grid' | 'list';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Extracted separator component to avoid inline function in FlatList
const ListSeparator = () => <View style={styles.listSeparator} />;

// Skeleton Loading Component
function SkeletonLoader({ viewMode }: { viewMode: ViewMode }) {
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    shimmerValue.value = withTiming(1, { duration: 1500 });
    const interval = setInterval(() => {
      shimmerValue.value = 0;
      shimmerValue.value = withTiming(1, { duration: 1500 });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerValue.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  if (viewMode === 'grid') {
    return (
      <View style={styles.gridContainer}>
        {[...Array(6)].map((_, index) => (
          <Animated.View
            key={index}
            entering={FadeIn.delay(index * 50).duration(300)}
            style={[styles.gridSkeletonItem, shimmerStyle]}
          >
            <View style={styles.gridSkeletonImage} />
            <View style={styles.gridSkeletonContent}>
              <View style={styles.gridSkeletonTitle} />
              <View style={styles.gridSkeletonPrice} />
            </View>
          </Animated.View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {[...Array(5)].map((_, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 50).duration(300)}
          style={[styles.listSkeletonItem, shimmerStyle]}
        >
          <View style={styles.listSkeletonImage} />
          <View style={styles.listSkeletonContent}>
            <View style={styles.listSkeletonTitle} />
            <View style={styles.listSkeletonSubtitle} />
            <View style={styles.listSkeletonPrice} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// Empty State Component
function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(500)}
      style={styles.emptyContainer}
    >
      <View style={styles.emptyIconContainer}>
        <Search size={48} color={COLORS.taupe} strokeWidth={1.2} />
      </View>
      <Text style={styles.emptyTitle}>Aucun resultat</Text>
      <Text style={styles.emptyDescription}>
        Nous n'avons trouve aucun bijou correspondant a "{searchQuery}"
      </Text>
      <Text style={styles.emptySuggestion}>
        Essayez d'autres termes ou explorez nos collections
      </Text>
    </Animated.View>
  );
}

// No Results State Component
function NoResultsState() {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(500)}
      style={styles.emptyContainer}
    >
      <View style={styles.emptyIconContainer}>
        <Package size={48} color={COLORS.taupe} strokeWidth={1.2} />
      </View>
      <Text style={styles.emptyTitle}>Commencez votre recherche</Text>
      <Text style={styles.emptyDescription}>
        Decouvrez notre collection de bijoux d'exception
      </Text>
    </Animated.View>
  );
}

// Grid Item Component
function GridItem({
  product,
  index,
  onPress,
}: {
  product: Product;
  index: number;
  onPress?: () => void;
}) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const imageUrl = product.images[0] || DEFAULT_PRODUCT_IMAGE;

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springConfigs.button);
    debouncedHaptic(hapticFeedback.softConfirm);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const handlePress = useCallback(() => {
    onPress?.();
    router.push(`/product/${product.id}`);
  }, [product.id, onPress, router]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.gridItemWrapper}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.gridItemInner, animatedStyle]}
      >
        <Animated.View
          entering={FadeInDown.delay(index * 80).duration(400)}
          layout={Layout.springify()}
        >
          <View style={styles.gridImageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.gridImage}
              resizeMode="cover"
            />
            {product.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nouveau</Text>
              </View>
            )}
          </View>
          <View style={styles.gridItemContent}>
            <Text style={styles.gridProductName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.gridPrice}>{formatPrice(product.price)}</Text>
            {product.collection && (
              <Text style={styles.gridCollection} numberOfLines={1}>
                {product.collection}
              </Text>
            )}
          </View>
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
}

// List Item Component
function ListItem({
  product,
  index,
  onPress,
}: {
  product: Product;
  index: number;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);
  const imageUrl = product.images[0] || DEFAULT_PRODUCT_IMAGE;

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springConfigs.button);
    debouncedHaptic(hapticFeedback.softConfirm);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Link href={`/product/${product.id}`} asChild>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.listItem, animatedStyle]}
      >
        <Animated.View
          entering={FadeInDown.delay(index * 60).duration(400)}
          layout={Layout.springify()}
          style={styles.listItemInner}
        >
          <View style={styles.listImageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.listImage}
              resizeMode="cover"
            />
            {product.isNew && (
              <View style={styles.listNewBadge}>
                <Text style={styles.listNewBadgeText}>N</Text>
              </View>
            )}
          </View>
          <View style={styles.listItemContent}>
            <Text style={styles.listProductName} numberOfLines={2}>
              {product.name}
            </Text>
            {product.collection && (
              <Text style={styles.listCollection} numberOfLines={1}>
                {product.collection}
              </Text>
            )}
            <View style={styles.listPriceRow}>
              <Text style={styles.listPrice}>{formatPrice(product.price)}</Text>
              {product.isAvailable ? (
                <Text style={styles.stockAvailable}>En stock</Text>
              ) : (
                <Text style={styles.stockUnavailable}>Indisponible</Text>
              )}
            </View>
          </View>
        </Animated.View>
      </AnimatedPressable>
    </Link>
  );
}

// View Mode Toggle Component
function ViewModeToggle({
  viewMode,
  onModeChange,
}: {
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}) {
  const indicatorPosition = useSharedValue(viewMode === 'grid' ? 0 : 1);

  React.useEffect(() => {
    indicatorPosition.value = withSpring(
      viewMode === 'grid' ? 0 : 1,
      springConfigs.button
    );
  }, [viewMode]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * 36 }],
  }));

  const handleGridPress = useCallback(() => {
    debouncedHaptic(hapticFeedback.quantityChange);
    onModeChange('grid');
  }, [onModeChange]);

  const handleListPress = useCallback(() => {
    debouncedHaptic(hapticFeedback.quantityChange);
    onModeChange('list');
  }, [onModeChange]);

  return (
    <View style={styles.toggleContainer}>
      <Animated.View style={[styles.toggleIndicator, indicatorStyle]} />
      <Pressable
        style={styles.toggleButton}
        onPress={handleGridPress}
        accessibilityLabel="Vue grille"
        accessibilityRole="button"
        accessibilityState={{ selected: viewMode === 'grid' }}
      >
        <Grid3X3
          size={18}
          color={viewMode === 'grid' ? COLORS.hermes : COLORS.stone}
          strokeWidth={viewMode === 'grid' ? 2 : 1.5}
        />
      </Pressable>
      <Pressable
        style={styles.toggleButton}
        onPress={handleListPress}
        accessibilityLabel="Vue liste"
        accessibilityRole="button"
        accessibilityState={{ selected: viewMode === 'list' }}
      >
        <List
          size={18}
          color={viewMode === 'list' ? COLORS.hermes : COLORS.stone}
          strokeWidth={viewMode === 'list' ? 2 : 1.5}
        />
      </Pressable>
    </View>
  );
}

export function SearchResults({
  results,
  isLoading,
  searchQuery,
  onProductPress,
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const renderGridItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <GridItem
        product={item}
        index={index}
        onPress={() => onProductPress?.(item)}
      />
    ),
    [onProductPress]
  );

  const renderListItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ListItem
        product={item}
        index={index}
        onPress={() => onProductPress?.(item)}
      />
    ),
    [onProductPress]
  );

  // Optimized getItemLayout for list view (improves scroll performance)
  const getListItemLayout = useCallback(
    (_data: ArrayLike<Product> | null | undefined, index: number) => ({
      length: LIST_ITEM_HEIGHT + LIST_SEPARATOR_HEIGHT,
      offset: (LIST_ITEM_HEIGHT + LIST_SEPARATOR_HEIGHT) * index,
      index,
    }),
    []
  );

  // Memoized keyExtractor to prevent unnecessary re-renders
  const keyExtractor = useCallback((item: Product) => item.id, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.resultCountSkeleton]} />
          </View>
          <ViewModeToggle viewMode={viewMode} onModeChange={setViewMode} />
        </View>
        <SkeletonLoader viewMode={viewMode} />
      </View>
    );
  }

  // No search query yet
  if (!searchQuery || searchQuery.trim().length === 0) {
    return null;
  }

  // No results
  if (results.length === 0) {
    return <EmptyState searchQuery={searchQuery} />;
  }

  return (
    <View style={styles.container}>
      {/* Header with result count and view toggle */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.resultCount}>
            {results.length} resultat{results.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.searchQueryText}>
            pour "{searchQuery}"
          </Text>
        </View>
        <ViewModeToggle viewMode={viewMode} onModeChange={setViewMode} />
      </View>

      {/* Results */}
      <FlatList
        key={viewMode === 'grid' ? 'grid-flatlist' : 'list-flatlist'}
        data={results}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={keyExtractor}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        contentContainerStyle={viewMode === 'grid' ? styles.gridListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ItemSeparatorComponent={viewMode === 'list' ? ListSeparator : undefined}
        // Performance optimizations
        getItemLayout={viewMode === 'list' ? getListItemLayout : undefined}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
    marginBottom: 16,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },

  resultCount: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    color: COLORS.charcoal,
  },

  searchQueryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.muted,
    marginLeft: 8,
  },

  resultCountSkeleton: {
    width: 100,
    height: 20,
    backgroundColor: COLORS.sand,
    borderRadius: 4,
  },

  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.sand,
    borderRadius: 8,
    padding: 2,
    position: 'relative',
  },

  toggleIndicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 32,
    height: 32,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  toggleButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  // Grid styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: ITEM_GAP,
  },

  gridRow: {
    justifyContent: 'space-between',
  },

  gridListContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 16,
  },

  gridItemWrapper: {
    width: GRID_ITEM_WIDTH,
    marginBottom: ITEM_GAP,
  },

  gridItemInner: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  gridImageContainer: {
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundBeige,
  },

  gridImage: {
    width: '100%',
    height: '100%',
  },

  gridItemContent: {
    padding: 12,
  },

  gridProductName: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 14,
    color: COLORS.charcoal,
    lineHeight: 20,
    marginBottom: 4,
  },

  gridPrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.hermes,
  },

  gridCollection: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },

  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.hermes,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  newBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Grid skeleton styles
  gridSkeletonItem: {
    width: GRID_ITEM_WIDTH,
    marginBottom: ITEM_GAP,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },

  gridSkeletonImage: {
    aspectRatio: 1,
    backgroundColor: COLORS.sand,
  },

  gridSkeletonContent: {
    padding: 12,
  },

  gridSkeletonTitle: {
    width: '80%',
    height: 16,
    backgroundColor: COLORS.sand,
    borderRadius: 4,
    marginBottom: 8,
  },

  gridSkeletonPrice: {
    width: '50%',
    height: 14,
    backgroundColor: COLORS.sand,
    borderRadius: 4,
  },

  // List styles
  listContainer: {
    paddingBottom: 16,
  },

  listItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  listItemInner: {
    flexDirection: 'row',
    padding: 12,
  },

  listImageContainer: {
    width: LIST_ITEM_IMAGE_SIZE,
    height: LIST_ITEM_IMAGE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundBeige,
  },

  listImage: {
    width: '100%',
    height: '100%',
  },

  listNewBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    backgroundColor: COLORS.hermes,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listNewBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: COLORS.white,
  },

  listItemContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },

  listProductName: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 16,
    color: COLORS.charcoal,
    lineHeight: 22,
    marginBottom: 4,
  },

  listCollection: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 8,
  },

  listPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listPrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.hermes,
  },

  stockAvailable: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#22c55e',
  },

  stockUnavailable: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.stone,
  },

  listSeparator: {
    height: 12,
  },

  // List skeleton styles
  listSkeletonItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
  },

  listSkeletonImage: {
    width: LIST_ITEM_IMAGE_SIZE,
    height: LIST_ITEM_IMAGE_SIZE,
    borderRadius: 8,
    backgroundColor: COLORS.sand,
  },

  listSkeletonContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },

  listSkeletonTitle: {
    width: '70%',
    height: 18,
    backgroundColor: COLORS.sand,
    borderRadius: 4,
    marginBottom: 8,
  },

  listSkeletonSubtitle: {
    width: '50%',
    height: 14,
    backgroundColor: COLORS.sand,
    borderRadius: 4,
    marginBottom: 8,
  },

  listSkeletonPrice: {
    width: '30%',
    height: 16,
    backgroundColor: COLORS.sand,
    borderRadius: 4,
  },

  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  emptyTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 22,
    color: COLORS.charcoal,
    marginBottom: 12,
    textAlign: 'center',
  },

  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },

  emptySuggestion: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.stone,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SearchResults;
