import type { Product, Category } from '@bijoux/types';
import { slugify } from '@bijoux/utils';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  normalizeSearchQuery,
  calculateRelevanceScore,
  applyFilters,
  sortProducts,
  extractAvailableFilters,
  fuzzyMatch,
} from './searchUtils';

const API_BASE_URL =
  Constants.expoConfig?.extra?.sageApiUrl || 'https://sage-portal.webexpr.dev/api';

// ============================================
// Search Types
// ============================================

/**
 * Available sort options for search results
 */
export type SearchSortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc' | 'name-desc';

/**
 * Price range filter with optional min/max bounds
 */
export interface PriceRange {
  readonly min?: number;
  readonly max?: number;
}

/**
 * Filters that can be applied to search results
 */
export interface SearchFilters {
  readonly categories?: readonly string[];
  readonly collections?: readonly string[];
  readonly materials?: readonly string[];
  readonly brands?: readonly string[];
  readonly priceRange?: PriceRange;
  readonly inStock?: boolean;
  readonly isNew?: boolean;
  readonly isFeatured?: boolean;
}

/**
 * Parameters for the search API
 */
export interface SearchParams {
  readonly query: string;
  readonly filters?: SearchFilters;
  readonly sort?: SearchSortOption;
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Paginated search response with metadata
 */
export interface SearchResponse {
  readonly products: readonly Product[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly query: string;
  readonly appliedFilters: SearchFilters;
  readonly availableFilters: AvailableFilters;
}

/**
 * Available filter options derived from search results
 */
export interface AvailableFilters {
  readonly categories: readonly FilterOption[];
  readonly collections: readonly FilterOption[];
  readonly materials: readonly FilterOption[];
  readonly brands: readonly FilterOption[];
  readonly priceRange: PriceRange;
}

/**
 * A single filter option with count
 */
export interface FilterOption {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

/**
 * Auto-complete suggestion item
 */
export interface SearchSuggestion {
  readonly type: 'product' | 'category' | 'collection' | 'query';
  readonly text: string;
  readonly highlight?: string;
  readonly productId?: string;
  readonly categoryId?: string;
}

/**
 * Popular/trending search term
 */
export interface PopularSearch {
  readonly query: string;
  readonly searchCount: number;
}

/**
 * Recent search entry with timestamp
 */
export interface RecentSearch {
  readonly query: string;
  readonly timestamp: number;
}

// Storage keys for search history
const RECENT_SEARCHES_KEY = '@bijoux/recent_searches';
const MAX_RECENT_SEARCHES = 10;

// Parse ASP.NET JSON date format
function parseAspNetDate(dateString: string): Date {
  const match = dateString.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  return new Date(dateString);
}

// Map Sage article to Product
function mapSageArticleToProduct(article: any): Product {
  const images: string[] = [];
  if (article.Photo) {
    // Use the API endpoint for article images
    images.push(`${API_BASE_URL}/sage/articles/${encodeURIComponent(article.Reference)}/image`);
  }

  // Extract materials from description or infos libres
  const materials: string[] = [];
  const brandInfo = article.InfosLibres?.find((info: any) => info.Name === 'Marque commerciale');

  return {
    id: article.Reference,
    reference: article.Reference,
    name: article.Intitule,
    nameEn: article.Langue1 || undefined,
    slug: slugify(article.Intitule),
    ean: article.CodeBarres || undefined,
    description: article.Langue1 || article.Intitule,
    shortDescription: article.Intitule,
    price: article.PrixVente || 0,
    compareAtPrice: undefined,
    isPriceTTC: article.EstEnPrixTTTC || false,
    images,
    categoryId: article.CodeFamille,
    collection: article.Statistique1 || undefined,
    style: article.Statistique2 || undefined,
    materials,
    weight: article.PoidsNet || undefined,
    weightUnit: 'g',
    brand: brandInfo?.Value?.toString() || undefined,
    origin: article.Pays || undefined,
    warranty: article.Garantie || undefined,
    stock: 10, // Default stock for display
    isAvailable: article.Publie && !article.EstEnSommeil && !article.InterdireCommande,
    featured: article.PrixVente > 1000,
    isNew: false,
    createdAt: article.DateCreation
      ? parseAspNetDate(article.DateCreation).toISOString()
      : new Date().toISOString(),
  };
}

// Map Sage famille to Category
function mapSageFamilleToCategory(famille: any): Category {
  return {
    id: famille.CodeFamille,
    code: famille.CodeFamille,
    name: famille.Intitule,
    slug: slugify(famille.Intitule),
    description: `Collection ${famille.Intitule}`,
    image: `https://via.placeholder.com/400x300?text=${encodeURIComponent(famille.Intitule)}`,
    productCount: 0,
    type: famille.TypeFamille,
  };
}

export const api = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sage/articles`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return (data || []).map(mapSageArticleToProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((p) => p.featured).slice(0, 8);
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  // Get product by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.slug === slug) || null;
  },

  // Get raw articles for counting (with proper filters like web app)
  async getRawArticles(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sage/articles`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching raw articles:', error);
      return [];
    }
  },

  // Get all categories with product counts (matching web app filters)
  async getCategories(): Promise<Category[]> {
    try {
      // Fetch both families and raw articles in parallel
      const [familiesResponse, articles] = await Promise.all([
        fetch(`${API_BASE_URL}/sage/families`),
        this.getRawArticles(),
      ]);
      if (!familiesResponse.ok) throw new Error('Failed to fetch categories');
      const familiesData = await familiesResponse.json();

      // Count products per category - apply same filters as web app
      // Exclude: EstEnSommeil (dormant) and Fictif (fictional) articles
      const productCounts: Record<string, number> = {};
      articles.forEach((article: any) => {
        if (article.CodeFamille && !article.EstEnSommeil && !article.Fictif) {
          productCounts[article.CodeFamille] = (productCounts[article.CodeFamille] || 0) + 1;
        }
      });

      // Map families with product counts and apply same filters as web app
      return (familiesData || [])
        .filter((famille: any) => famille.TypeFamille === 0) // Only leaf categories (like web)
        .map((famille: any) => ({
          ...mapSageFamilleToCategory(famille),
          productCount: productCounts[famille.CodeFamille] || 0,
        }))
        .filter((category: Category) => category.productCount > 0); // Only categories with products (like web)
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.slug === slug) || null;
  },

  // Get products by category
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((p) => p.categoryId === categoryId);
  },

  // Get products by category slug
  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const categories = await this.getCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return [];
    return this.getProductsByCategory(category.id);
  },

  // ============================================
  // Search API Methods
  // ============================================

  /**
   * Full-text search with filters, sorting, and pagination.
   * Searches across: name, description, collection, materials, reference.
   *
   * @param params - Search parameters including query, filters, sort, and pagination
   * @returns Paginated search results with available filter options
   */
  async searchProducts(params: SearchParams): Promise<SearchResponse> {
    const {
      query,
      filters = {},
      sort = 'relevance',
      page = 1,
      pageSize = 20,
    } = params;

    try {
      // Fetch all products and categories in parallel
      const [allProducts, categories] = await Promise.all([
        this.getProducts(),
        this.getCategories(),
      ]);

      const normalizedQuery = normalizeSearchQuery(query);

      // Score and filter products by search relevance
      let scoredProducts = allProducts
        .map((product) => ({
          product,
          score: calculateRelevanceScore(product, normalizedQuery),
        }))
        .filter((item) => item.score > 0);

      // Apply additional filters
      const filteredProducts = applyFilters(
        scoredProducts.map((item) => item.product),
        filters
      );

      // Re-score after filtering for proper relevance sorting
      scoredProducts = filteredProducts.map((product) => ({
        product,
        score: calculateRelevanceScore(product, normalizedQuery),
      }));

      // Sort products
      const sortedProducts = sortProducts(scoredProducts, sort);

      // Extract available filters from filtered results
      const availableFilters = extractAvailableFilters(filteredProducts, categories);

      // Paginate results
      const totalCount = sortedProducts.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);

      return {
        products: paginatedProducts,
        totalCount,
        page,
        pageSize,
        totalPages,
        query,
        appliedFilters: filters,
        availableFilters,
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        products: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
        query,
        appliedFilters: filters,
        availableFilters: {
          categories: [],
          collections: [],
          materials: [],
          brands: [],
          priceRange: {},
        },
      };
    }
  },

  /**
   * Get auto-complete suggestions for a search query.
   * Returns product matches, category matches, and query suggestions.
   *
   * @param query - Partial search query
   * @param limit - Maximum number of suggestions (default: 10)
   * @returns Array of search suggestions
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const [products, categories] = await Promise.all([
        this.getProducts(),
        this.getCategories(),
      ]);

      const normalizedQuery = normalizeSearchQuery(query);
      const suggestions: SearchSuggestion[] = [];

      // Find matching products (prioritize name matches)
      const productMatches = products
        .filter((p) => {
          const normalizedName = normalizeSearchQuery(p.name);
          return (
            normalizedName.includes(normalizedQuery) ||
            fuzzyMatch(normalizedName, normalizedQuery) > 0.6
          );
        })
        .slice(0, 5);

      for (const product of productMatches) {
        suggestions.push({
          type: 'product',
          text: product.name,
          highlight: query,
          productId: product.id,
        });
      }

      // Find matching categories
      const categoryMatches = categories
        .filter((c) => {
          const normalizedName = normalizeSearchQuery(c.name);
          return (
            normalizedName.includes(normalizedQuery) ||
            fuzzyMatch(normalizedName, normalizedQuery) > 0.6
          );
        })
        .slice(0, 3);

      for (const category of categoryMatches) {
        suggestions.push({
          type: 'category',
          text: category.name,
          highlight: query,
          categoryId: category.id,
        });
      }

      // Find matching collections
      const collections = new Set<string>();
      for (const product of products) {
        if (product.collection) {
          collections.add(product.collection);
        }
      }

      const collectionMatches = Array.from(collections)
        .filter((c) => {
          const normalizedCollection = normalizeSearchQuery(c);
          return (
            normalizedCollection.includes(normalizedQuery) ||
            fuzzyMatch(normalizedCollection, normalizedQuery) > 0.6
          );
        })
        .slice(0, 2);

      for (const collection of collectionMatches) {
        suggestions.push({
          type: 'collection',
          text: collection,
          highlight: query,
        });
      }

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  },

  /**
   * Get popular/trending search terms.
   * In a real implementation, this would fetch from analytics.
   *
   * @param limit - Maximum number of popular searches (default: 10)
   * @returns Array of popular search terms with counts
   */
  async getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
    // Mock popular searches for jewelry e-commerce
    // In production, this would come from analytics/backend
    const popularSearches: PopularSearch[] = [
      { query: 'bague or', searchCount: 1250 },
      { query: 'collier perles', searchCount: 980 },
      { query: 'bracelet argent', searchCount: 875 },
      { query: 'boucles diamant', searchCount: 720 },
      { query: 'alliance', searchCount: 650 },
      { query: 'pendentif coeur', searchCount: 540 },
      { query: 'montre femme', searchCount: 480 },
      { query: 'chaine or', searchCount: 420 },
      { query: 'solitaire', searchCount: 380 },
      { query: 'bijoux mariage', searchCount: 350 },
    ];

    return popularSearches.slice(0, limit);
  },

  /**
   * Look up a product by its barcode (EAN code).
   *
   * @param barcode - EAN barcode to search for
   * @returns Product if found, null otherwise
   */
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    if (!barcode || barcode.trim().length === 0) {
      return null;
    }

    try {
      const products = await this.getProducts();
      const normalizedBarcode = barcode.trim();

      // Find product with matching EAN
      const product = products.find(
        (p) => p.ean === normalizedBarcode || p.reference === normalizedBarcode
      );

      return product || null;
    } catch (error) {
      console.error('Error looking up product by barcode:', error);
      return null;
    }
  },

  /**
   * Get recent searches from local storage.
   *
   * @returns Array of recent searches sorted by timestamp (newest first)
   */
  async getRecentSearches(): Promise<RecentSearch[]> {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) {
        return [];
      }

      const searches: RecentSearch[] = JSON.parse(stored);
      // Sort by timestamp descending (newest first)
      return searches.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  },

  /**
   * Save a search query to recent searches in local storage.
   * Maintains a maximum of MAX_RECENT_SEARCHES items.
   * Duplicates are moved to the top with updated timestamp.
   *
   * @param query - Search query to save
   */
  async saveRecentSearch(query: string): Promise<void> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return;
    }

    try {
      const existing = await this.getRecentSearches();

      // Remove duplicate if exists
      const filtered = existing.filter(
        (s) => s.query.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      // Add new search at the beginning
      const newSearch: RecentSearch = {
        query: trimmedQuery,
        timestamp: Date.now(),
      };

      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  },

  /**
   * Remove a specific search from recent searches.
   *
   * @param query - Search query to remove
   */
  async removeRecentSearch(query: string): Promise<void> {
    try {
      const existing = await this.getRecentSearches();
      const filtered = existing.filter(
        (s) => s.query.toLowerCase() !== query.toLowerCase()
      );
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  },

  /**
   * Clear all recent searches from local storage.
   */
  async clearRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  },
};
