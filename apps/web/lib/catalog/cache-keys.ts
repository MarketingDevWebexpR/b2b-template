/**
 * React Query Cache Keys for Catalog Module
 *
 * Provides a type-safe, hierarchical cache key system for React Query.
 * Keys are structured to enable efficient cache invalidation at multiple levels.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Brand filter options for cache key generation
 */
export interface BrandCacheFilters {
  letter?: string;
  premium?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: 'name' | 'product_count';
}

/**
 * Category filter options for cache key generation
 */
export interface CategoryCacheFilters {
  depth?: number;
  parentId?: string | null;
  activeOnly?: boolean;
  withProductsOnly?: boolean;
}

/**
 * Product filter options for cache key generation
 */
export interface ProductCacheFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

/**
 * Cache key structure for type safety
 */
export type CacheKey = readonly (string | number | boolean | null | undefined | object)[];

// ============================================================================
// Cache Key Factory
// ============================================================================

/**
 * Cache key factory for catalog module
 *
 * Follows the React Query recommended pattern of hierarchical keys:
 * - ['catalog'] - all catalog data
 * - ['catalog', 'brands'] - all brand data
 * - ['catalog', 'brands', 'list', filters] - filtered brand list
 * - ['catalog', 'brands', 'detail', slug] - single brand detail
 *
 * @example
 * ```typescript
 * // Get all brands
 * const allBrandsKey = catalogKeys.brands.all;
 *
 * // Get filtered brands
 * const filteredKey = catalogKeys.brands.list({ premium: true });
 *
 * // Invalidate all brand queries
 * queryClient.invalidateQueries({ queryKey: catalogKeys.brands.all });
 * ```
 */
export const catalogKeys = {
  /**
   * Root key for all catalog data
   * Invalidating this invalidates all catalog queries
   */
  all: ['catalog'] as const,

  // ==========================================================================
  // Brand Keys
  // ==========================================================================
  brands: {
    /**
     * All brand-related queries
     */
    all: ['catalog', 'brands'] as const,

    /**
     * Brand list queries with optional filters
     */
    lists: () => [...catalogKeys.brands.all, 'list'] as const,

    /**
     * Specific filtered brand list
     */
    list: (filters?: BrandCacheFilters) =>
      [...catalogKeys.brands.lists(), filters ?? {}] as const,

    /**
     * All brand detail queries
     */
    details: () => [...catalogKeys.brands.all, 'detail'] as const,

    /**
     * Specific brand by slug
     */
    detail: (slug: string) => [...catalogKeys.brands.details(), slug] as const,

    /**
     * Brand products queries
     */
    products: (slug: string, filters?: ProductCacheFilters) =>
      [...catalogKeys.brands.detail(slug), 'products', filters ?? {}] as const,

    /**
     * Premium brands only
     */
    premium: () => [...catalogKeys.brands.all, 'premium'] as const,

    /**
     * Brands grouped by letter
     */
    byLetter: () => [...catalogKeys.brands.all, 'byLetter'] as const,
  },

  // ==========================================================================
  // Category Keys
  // ==========================================================================
  categories: {
    /**
     * All category-related queries
     */
    all: ['catalog', 'categories'] as const,

    /**
     * Category tree queries
     */
    tree: () => [...catalogKeys.categories.all, 'tree'] as const,

    /**
     * Category list queries with optional filters
     */
    lists: () => [...catalogKeys.categories.all, 'list'] as const,

    /**
     * Specific filtered category list
     */
    list: (filters?: CategoryCacheFilters) =>
      [...catalogKeys.categories.lists(), filters ?? {}] as const,

    /**
     * All category detail queries
     */
    details: () => [...catalogKeys.categories.all, 'detail'] as const,

    /**
     * Specific category by path segments
     */
    detail: (path: string[]) =>
      [...catalogKeys.categories.details(), ...path] as const,

    /**
     * Category by handle
     */
    byHandle: (handle: string) =>
      [...catalogKeys.categories.details(), 'handle', handle] as const,

    /**
     * Category by ID
     */
    byId: (id: string) =>
      [...catalogKeys.categories.details(), 'id', id] as const,

    /**
     * Category products
     */
    products: (categoryId: string, filters?: ProductCacheFilters) =>
      [...catalogKeys.categories.byId(categoryId), 'products', filters ?? {}] as const,

    /**
     * Category breadcrumbs
     */
    breadcrumbs: (categoryId: string) =>
      [...catalogKeys.categories.byId(categoryId), 'breadcrumbs'] as const,

    /**
     * Category children
     */
    children: (categoryId: string) =>
      [...catalogKeys.categories.byId(categoryId), 'children'] as const,
  },

  // ==========================================================================
  // Product Keys
  // ==========================================================================
  products: {
    /**
     * All product-related queries
     */
    all: ['catalog', 'products'] as const,

    /**
     * Product list queries
     */
    lists: () => [...catalogKeys.products.all, 'list'] as const,

    /**
     * Specific filtered product list
     */
    list: (filters?: ProductCacheFilters) =>
      [...catalogKeys.products.lists(), filters ?? {}] as const,

    /**
     * Infinite product queries
     */
    infinite: (filters?: Omit<ProductCacheFilters, 'offset'>) =>
      [...catalogKeys.products.all, 'infinite', filters ?? {}] as const,

    /**
     * All product detail queries
     */
    details: () => [...catalogKeys.products.all, 'detail'] as const,

    /**
     * Specific product by handle/slug
     */
    detail: (handle: string) =>
      [...catalogKeys.products.details(), handle] as const,

    /**
     * Product by ID
     */
    byId: (id: string) =>
      [...catalogKeys.products.details(), 'id', id] as const,

    /**
     * Product facets (filters/aggregations)
     */
    facets: (filters?: ProductCacheFilters) =>
      [...catalogKeys.products.all, 'facets', filters ?? {}] as const,

    /**
     * Related products for a specific product
     */
    related: (productId: string) =>
      [...catalogKeys.products.byId(productId), 'related'] as const,
  },

  // ==========================================================================
  // Search Keys
  // ==========================================================================
  search: {
    /**
     * All search-related queries
     */
    all: ['catalog', 'search'] as const,

    /**
     * Search suggestions
     */
    suggestions: (query: string) =>
      [...catalogKeys.search.all, 'suggestions', query] as const,

    /**
     * Full search results
     */
    results: (query: string, filters?: ProductCacheFilters) =>
      [...catalogKeys.search.all, 'results', query, filters ?? {}] as const,
  },
} as const;

// ============================================================================
// Cache Invalidation Helpers
// ============================================================================

/**
 * Get keys to invalidate when a brand is updated
 */
export function getBrandInvalidationKeys(slug?: string): CacheKey[] {
  const keys: CacheKey[] = [
    catalogKeys.brands.lists(),
    catalogKeys.brands.premium(),
    catalogKeys.brands.byLetter(),
  ];

  if (slug) {
    keys.push(catalogKeys.brands.detail(slug));
  }

  return keys;
}

/**
 * Get keys to invalidate when a category is updated
 */
export function getCategoryInvalidationKeys(
  categoryId?: string,
  path?: string[]
): CacheKey[] {
  const keys: CacheKey[] = [
    catalogKeys.categories.tree(),
    catalogKeys.categories.lists(),
  ];

  if (categoryId) {
    keys.push(catalogKeys.categories.byId(categoryId));
    keys.push(catalogKeys.categories.breadcrumbs(categoryId));
    keys.push(catalogKeys.categories.children(categoryId));
  }

  if (path) {
    keys.push(catalogKeys.categories.detail(path));
  }

  return keys;
}

/**
 * Get keys to invalidate when products are updated
 */
export function getProductInvalidationKeys(productHandle?: string): CacheKey[] {
  const keys: CacheKey[] = [
    catalogKeys.products.lists(),
    catalogKeys.products.facets(),
  ];

  if (productHandle) {
    keys.push(catalogKeys.products.detail(productHandle));
  }

  return keys;
}

// ============================================================================
// Stale Time Configuration
// ============================================================================

/**
 * Default stale times for different data types (in milliseconds)
 *
 * These values determine how long data is considered "fresh" before
 * React Query will refetch in the background.
 */
export const catalogStaleTimes = {
  /** Brands rarely change - 10 minutes */
  brands: 10 * 60 * 1000,
  /** Categories change occasionally - 5 minutes */
  categories: 5 * 60 * 1000,
  /** Products may change more often - 2 minutes */
  products: 2 * 60 * 1000,
  /** Search results should be fresh - 30 seconds */
  search: 30 * 1000,
  /** Facets (aggregations) - 2 minutes */
  facets: 2 * 60 * 1000,
} as const;

/**
 * Default garbage collection times (in milliseconds)
 *
 * These values determine how long data is kept in cache after
 * all observers have unmounted.
 */
export const catalogGcTimes = {
  /** Keep brands in cache for 30 minutes */
  brands: 30 * 60 * 1000,
  /** Keep categories in cache for 30 minutes */
  categories: 30 * 60 * 1000,
  /** Keep products in cache for 10 minutes */
  products: 10 * 60 * 1000,
  /** Keep search results for 5 minutes */
  search: 5 * 60 * 1000,
} as const;

export default catalogKeys;
