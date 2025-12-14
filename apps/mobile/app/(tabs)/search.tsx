/**
 * Search Screen
 * A luxury search experience for jewelry discovery
 * Features animated search bar, suggestions, categories, and trending products
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Keyboard,
  Dimensions,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Link, useRouter } from 'expo-router';
import {
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  X,
  Filter,
  ArrowUpRight,
} from 'lucide-react-native';
import type { Product, Category } from '@bijoux/types';
import { formatPrice } from '@bijoux/utils';
import { api } from '@/lib/api';
import { useCategories } from '@/context/CategoryContext';
import {
  SearchBar,
  SearchResults,
  SearchFilters,
  VoiceSearch,
  BarcodeScanner,
} from '@/components/search';
import type { FilterState } from '@/components/search';
import { springConfigs, timingConfigs, durations } from '@/constants/animations';
import { hapticFeedback, debouncedHaptic } from '@/constants/haptics';

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
const CATEGORY_CARD_WIDTH = 100;
const TRENDING_CARD_WIDTH = 220; // Wider horizontal card for elegant display

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?ixlib=rb-4.1.0&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Popular search suggestions (static for now)
const POPULAR_SEARCHES = [
  'Bague or 18k',
  'Collier diamant',
  'Bracelet tennis',
  'Boucles perles',
  'Alliance platine',
  'Pendentif coeur',
];

// Mock recent searches (would come from AsyncStorage in production)
const INITIAL_RECENT_SEARCHES = [
  'Solitaire diamant',
  'Bracelet jonc or rose',
  'Boucles d\'oreilles saphir',
];

// Default filter state
const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 100000],
  categories: [],
  materials: [],
  sortBy: 'relevance',
};

// Category Quick Filter Component
function CategoryQuickFilter({
  category,
  index,
  isSelected,
  onPress,
}: {
  category: Category;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, springConfigs.button);
    debouncedHaptic(hapticFeedback.softConfirm);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Category images (placeholder, would come from API)
  const categoryImages: Record<string, string> = {
    'bagues': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80',
    'colliers': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80',
    'bracelets': 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&q=80',
    'boucles': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80',
    'montres': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&q=80',
  };

  const imageUrl = categoryImages[category.slug] || category.image || DEFAULT_PRODUCT_IMAGE;

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.categoryCard, animatedStyle]}
      accessibilityLabel={`Categorie ${category.name}${isSelected ? ', selectionnee' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        entering={FadeInDown.delay(index * 60).duration(400)}
      >
        <View style={[styles.categoryImageContainer, isSelected && styles.categoryImageSelected]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.categoryImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          {isSelected && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.categorySelectedOverlay}>
              <View style={styles.categoryCheckmark}>
                <Text style={styles.categoryCheckmarkText}>&#10003;</Text>
              </View>
            </Animated.View>
          )}
        </View>
        <Text
          style={[styles.categoryName, isSelected && styles.categoryNameSelected]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

// Suggestion Chip Component
function SuggestionChip({
  text,
  icon,
  onPress,
  delay = 0,
}: {
  text: string;
  icon?: React.ReactNode;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springConfigs.button);
    debouncedHaptic(hapticFeedback.softConfirm);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.suggestionChip, animatedStyle]}
      accessibilityLabel={`Rechercher ${text}`}
      accessibilityRole="button"
      accessibilityHint="Appuyez pour rechercher ce terme"
    >
      <Animated.View
        entering={FadeInDown.delay(delay).duration(300)}
        style={styles.suggestionChipContent}
      >
        {icon}
        <Text style={styles.suggestionChipText} numberOfLines={1}>
          {text}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

// Trending Product Card Component - Elegant horizontal card design
function TrendingProductCard({
  product,
  index,
  onPress,
}: {
  product: Product;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const [imageError, setImageError] = useState(false);

  // Get valid image URL - filter out empty strings
  const rawImageUrl = product.images?.[0];
  const imageUrl = (rawImageUrl && rawImageUrl.trim() !== '') ? rawImageUrl : DEFAULT_PRODUCT_IMAGE;
  const displayUrl = imageError ? DEFAULT_PRODUCT_IMAGE : imageUrl;

  // Format rank with leading zero for elegant display
  const displayRank = String(index + 1).padStart(2, '0');

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, springConfigs.button);
    debouncedHaptic(hapticFeedback.softConfirm);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <Link href={`/product/${product.id}`} asChild>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.trendingCard, animatedStyle]}
        accessibilityLabel={`${product.name}, ${formatPrice(product.price)}, tendance numero ${index + 1}`}
        accessibilityRole="button"
        accessibilityHint="Appuyez pour voir les details du produit"
      >
        <Animated.View
          entering={FadeInDown.delay(index * 80).duration(400)}
          style={styles.trendingCardInner}
        >
          {/* Rank Badge - Elegant serif number */}
          <View style={styles.trendingRankContainer}>
            <Text style={styles.trendingRankNumber}>{displayRank}</Text>
          </View>

          {/* Circular Product Image */}
          <View style={styles.trendingImageWrapper}>
            <Image
              source={{ uri: displayUrl }}
              style={styles.trendingImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              onError={handleImageError}
            />
          </View>

          {/* Product Info */}
          <View style={styles.trendingContent}>
            <Text style={styles.trendingName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.trendingPrice}>{formatPrice(product.price)}</Text>
          </View>

          {/* Chevron indicator */}
          <View style={styles.trendingChevron}>
            <ChevronRight size={16} color={COLORS.hermes} strokeWidth={2} />
          </View>
        </Animated.View>
      </AnimatedPressable>
    </Link>
  );
}

// Section Header Component
function SectionHeader({
  title,
  subtitle,
  icon,
  showViewAll = false,
  onViewAll,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showViewAll?: boolean;
  onViewAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {icon && <View style={styles.sectionIcon}>{icon}</View>}
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showViewAll && (
        <Pressable style={styles.viewAllButton} onPress={onViewAll}>
          <Text style={styles.viewAllText}>Voir tout</Text>
          <ChevronRight size={16} color={COLORS.hermes} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, refetch: refetchCategories } = useCategories();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(INITIAL_RECENT_SEARCHES);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Animation values
  const headerOpacity = useSharedValue(1);
  const suggestionsOpacity = useSharedValue(1);

  // Fetch trending products on mount
  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      setErrorMessage(null);
      const products = await api.getFeaturedProducts();
      setTrendingProducts(products.slice(0, 6));
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setErrorMessage('Impossible de charger les tendances. Tirez pour actualiser.');
    }
  };

  // Search handler with debounce
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResponse = await api.searchProducts({
          query: searchQuery,
          filters: {
            categories: filters.categories.length > 0 ? filters.categories : undefined,
            priceRange: (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000)
              ? { min: filters.priceRange[0], max: filters.priceRange[1] }
              : undefined,
          },
          sort: filters.sortBy,
        });

        // Extract products array from the response (it's readonly, so spread to mutable array)
        setSearchResults([...searchResponse.products]);
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
        setErrorMessage('Erreur lors de la recherche. Veuillez reessayer.');
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters]);

  // Handle focus state animations
  useEffect(() => {
    if (isSearchFocused || searchQuery.length > 0) {
      suggestionsOpacity.value = withTiming(1, timingConfigs.standard);
    } else {
      suggestionsOpacity.value = withTiming(1, timingConfigs.standard);
    }
  }, [isSearchFocused, searchQuery]);

  // Handlers
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      // Add to recent searches
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== searchQuery.toLowerCase());
        return [searchQuery, ...filtered].slice(0, 5);
      });
    }
    Keyboard.dismiss();
  }, [searchQuery]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearchSubmit();
  }, [handleSearchSubmit]);

  const handleClearRecentSearch = useCallback((search: string) => {
    debouncedHaptic(hapticFeedback.softConfirm);
    setRecentSearches((prev) => prev.filter((s) => s !== search));
  }, []);

  const handleClearAllRecent = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    setRecentSearches([]);
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
    // Also update filters
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  }, []);

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setSelectedCategories(newFilters.categories);
  }, []);

  const handleVoiceResult = useCallback((text: string) => {
    setSearchQuery(text);
    setShowVoiceSearch(false);
    handleSearchSubmit();
  }, [handleSearchSubmit]);

  const handleBarcodeScanned = useCallback((barcode: string) => {
    setSearchQuery(barcode);
    setShowBarcodeScanner(false);
    handleSearchSubmit();
  }, [handleSearchSubmit]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTrendingProducts(), refetchCategories()]);
    setIsRefreshing(false);
  }, [refetchCategories]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count++;
    count += filters.categories.length;
    count += filters.materials.length;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  }, [filters]);

  // Show results mode
  const showResults = searchQuery.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <Animated.View style={styles.header}>
        <Text style={styles.headerTitle}>Recherche</Text>
        <Text style={styles.headerSubtitle}>Trouvez le bijou parfait</Text>
      </Animated.View>

      {/* Search Bar */}
      <View style={[styles.searchBarContainer, !showResults && styles.searchBarContainerFull]}>
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onSubmit={handleSearchSubmit}
            onVoicePress={() => setShowVoiceSearch(true)}
            onCameraPress={() => setShowBarcodeScanner(true)}
            isFocused={isSearchFocused}
          />
        </View>

        {/* Filter Button */}
        {showResults && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.filterButtonContainer}
          >
            <Pressable
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
              accessibilityLabel="Ouvrir les filtres"
              accessibilityRole="button"
            >
              <Filter size={20} color={COLORS.charcoal} strokeWidth={1.5} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.hermes}
          />
        }
      >
        {/* Search Results */}
        {showResults && (
          <SearchResults
            results={searchResults}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        )}

        {/* Error Message */}
        {errorMessage && !showResults && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.errorContainer}
          >
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        )}

        {/* Discovery Content (when not searching) */}
        {!showResults && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(100).duration(400)}
                style={styles.section}
              >
                <View style={styles.recentHeader}>
                  <SectionHeader
                    title="Recherches recentes"
                    icon={<Clock size={18} color={COLORS.stone} strokeWidth={1.5} />}
                  />
                  <Pressable onPress={handleClearAllRecent}>
                    <Text style={styles.clearAllText}>Effacer</Text>
                  </Pressable>
                </View>
                <View style={styles.recentSearchesList}>
                  {recentSearches.map((search, index) => (
                    <View key={search} style={styles.recentSearchItem}>
                      <Pressable
                        style={styles.recentSearchContent}
                        onPress={() => handleSuggestionPress(search)}
                      >
                        <Clock size={14} color={COLORS.stone} strokeWidth={1.5} />
                        <Text style={styles.recentSearchText}>{search}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.recentSearchRemove}
                        onPress={() => handleClearRecentSearch(search)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <X size={16} color={COLORS.stone} strokeWidth={1.5} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Popular Searches */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              style={styles.section}
            >
              <SectionHeader
                title="Recherches populaires"
                icon={<TrendingUp size={18} color={COLORS.hermes} strokeWidth={1.5} />}
              />
              <View style={styles.suggestionsGrid}>
                {POPULAR_SEARCHES.map((suggestion, index) => (
                  <SuggestionChip
                    key={suggestion}
                    text={suggestion}
                    onPress={() => handleSuggestionPress(suggestion)}
                    delay={index * 50}
                  />
                ))}
              </View>
            </Animated.View>

            {/* Category Quick Filters */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              style={styles.section}
            >
              <SectionHeader
                title="Categories"
                subtitle="Explorer par type"
                showViewAll
                onViewAll={() => router.push('/collections')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {categories.slice(0, 8).map((category, index) => (
                  <CategoryQuickFilter
                    key={category.id}
                    category={category}
                    index={index}
                    isSelected={selectedCategories.includes(category.id)}
                    onPress={() => handleCategoryPress(category.id)}
                  />
                ))}
              </ScrollView>
            </Animated.View>

            {/* Trending Products */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(400)}
              style={styles.section}
            >
              <SectionHeader
                title="Tendances"
                subtitle="Les plus recherches"
                icon={<Sparkles size={18} color={COLORS.hermes} strokeWidth={1.5} />}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingScroll}
              >
                {trendingProducts.map((product, index) => (
                  <TrendingProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onPress={() => {}}
                  />
                ))}
              </ScrollView>
            </Animated.View>

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <SearchFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        categories={categories}
      />

      {/* Voice Search Modal */}
      <VoiceSearch
        visible={showVoiceSearch}
        onClose={() => setShowVoiceSearch(false)}
        onResult={handleVoiceResult}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onProductFound={handleBarcodeScanned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  headerTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 32,
    color: COLORS.charcoal,
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingVertical: 12,
  },

  searchBarContainerFull: {
    paddingRight: 20,
  },

  searchBarWrapper: {
    flex: 1,
  },

  filterButtonContainer: {
    paddingRight: 16,
    paddingLeft: 8,
  },

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.taupe,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.hermes,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  filterBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: COLORS.white,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingTop: 8,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    marginRight: 10,
  },

  sectionTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    color: COLORS.charcoal,
  },

  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: COLORS.hermes,
  },

  // Recent searches
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  clearAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: COLORS.stone,
  },

  recentSearchesList: {
    marginTop: 12,
  },

  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },

  recentSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  recentSearchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.charcoal,
    marginLeft: 12,
  },

  recentSearchRemove: {
    padding: 4,
  },

  // Suggestions
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  suggestionChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.taupe,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  suggestionChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  suggestionChipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.charcoal,
  },

  // Categories
  categoriesScroll: {
    paddingRight: 20,
  },

  categoryCard: {
    marginRight: 16,
    alignItems: 'center',
    width: CATEGORY_CARD_WIDTH,
  },

  categoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: COLORS.sand,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  categoryImageSelected: {
    borderColor: COLORS.hermes,
  },

  categoryImage: {
    width: '100%',
    height: '100%',
  },

  categorySelectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(246, 120, 40, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryCheckmarkText: {
    fontSize: 14,
    color: COLORS.hermes,
    fontWeight: 'bold',
  },

  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.charcoal,
    marginTop: 8,
    textAlign: 'center',
  },

  categoryNameSelected: {
    color: COLORS.hermes,
    fontFamily: 'Inter-SemiBold',
  },

  // Trending - Elegant horizontal card design
  trendingScroll: {
    paddingRight: 20,
  },

  trendingCard: {
    width: TRENDING_CARD_WIDTH,
    marginRight: 12,
    backgroundColor: COLORS.backgroundBeige,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.sand,
    overflow: 'hidden',
    // Subtle shadow matching design system
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  trendingCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  trendingRankContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  trendingRankNumber: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 20,
    color: COLORS.hermes,
    opacity: 0.5,
  },

  trendingImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.taupe,
    marginRight: 12,
  },

  trendingImage: {
    width: '100%',
    height: '100%',
  },

  trendingContent: {
    flex: 1,
    justifyContent: 'center',
  },

  trendingName: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 13,
    color: COLORS.charcoal,
    lineHeight: 17,
    marginBottom: 2,
  },

  trendingPrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: COLORS.hermes,
  },

  trendingChevron: {
    marginLeft: 4,
    opacity: 0.7,
  },

  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
});
