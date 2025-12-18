'use client';

/**
 * Product Hooks for Catalog Module
 *
 * React Query hooks for fetching and managing product data with support
 * for filtering, pagination, infinite scroll, and faceted search.
 *
 * @packageDocumentation
 */

import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  type UseQueryResult,
  type UseInfiniteQueryResult,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  catalogKeys,
  catalogStaleTimes,
  catalogGcTimes,
  type ProductCacheFilters,
} from '@/lib/catalog/cache-keys';
import {
  getCatalogApiClient,
  CatalogApiError,
} from '@/lib/catalog/api-client';

// ============================================================================
// Types
// ============================================================================

/**
 * Product as returned from the catalog API
 */
export interface CatalogProduct {
  id: string;
  title: string;
  handle: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  images: string[];
  price: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  inStock: boolean;
  totalInventory: number;
  categories: Array<{ id: string; name: string; handle: string }>;
  tags: string[];
  createdAt: string;
}

/**
 * Facet option for filtering
 */
export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

/**
 * Facets returned from API
 */
export interface CatalogFacets {
  categories: FacetOption[];
  brands: FacetOption[];
  priceRanges: FacetOption[];
}

/**
 * Products response from API
 */
export interface CatalogProductsResponse {
  products: CatalogProduct[];
  total: number;
  facets: CatalogFacets;
  limit: number;
  offset: number;
}

/**
 * Filter options for catalog products
 */
export interface CatalogFilters {
  /** Filter by category ID or handle */
  category?: string;
  /** Filter by brand slug */
  brand?: string;
  /** Minimum price in cents */
  minPrice?: number;
  /** Maximum price in cents */
  maxPrice?: number;
  /** Search query string */
  search?: string;
  /** Sort order */
  sort?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
  /** Number of products per page */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Filter by stock availability */
  inStock?: boolean;
}

/**
 * Options for useCatalogProducts hook
 */
export interface UseCatalogProductsOptions extends CatalogFilters {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Initial data for SSR hydration */
  initialData?: CatalogProductsResponse;
}

/**
 * Options for useInfiniteProducts hook
 */
export interface UseInfiniteProductsOptions extends Omit<CatalogFilters, 'offset'> {
  /** Enable/disable the query */
  enabled?: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch products from API
 */
async function fetchProducts(filters: CatalogFilters): Promise<CatalogProductsResponse> {
  const client = getCatalogApiClient();

  const params: Record<string, string | number | boolean | undefined> = {};

  if (filters.category) params.category = filters.category;
  if (filters.brand) params.brand = filters.brand;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.search) params.search = filters.search;
  if (filters.sort) params.sort = filters.sort;
  if (filters.limit) params.limit = filters.limit;
  if (filters.offset !== undefined) params.offset = filters.offset;
  if (filters.inStock !== undefined) params.inStock = filters.inStock;

  return client.get<CatalogProductsResponse>('/api/catalog/products', { params });
}

// ============================================================================
// Main Hooks
// ============================================================================

/**
 * Hook to fetch catalog products with filtering and pagination
 *
 * @param filters - Filter and pagination options
 * @returns Query result with products and facets
 *
 * @example
 * ```tsx
 * // Fetch products with filters
 * const { data, isLoading } = useCatalogProducts({
 *   category: 'rings',
 *   sort: 'price_asc',
 *   limit: 20,
 * });
 *
 * // Search products
 * const { data } = useCatalogProducts({
 *   search: 'diamond',
 *   minPrice: 10000, // 100 EUR in cents
 * });
 * ```
 */
export function useCatalogProducts(
  options: UseCatalogProductsOptions = {}
): UseQueryResult<CatalogProductsResponse, CatalogApiError> {
  const { enabled = true, initialData, ...filters } = options;

  // Set defaults
  const normalizedFilters: CatalogFilters = {
    limit: 20,
    offset: 0,
    sort: 'newest',
    ...filters,
  };

  return useQuery<CatalogProductsResponse, CatalogApiError>({
    queryKey: catalogKeys.products.list(normalizedFilters),
    queryFn: () => fetchProducts(normalizedFilters),
    enabled,
    initialData,
    staleTime: catalogStaleTimes.products,
    gcTime: catalogGcTimes.products,
    retry: (failureCount, error) => {
      if (error instanceof CatalogApiError && error.isClientError) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch product facets (aggregations) for filtering
 *
 * @param filters - Current filter state
 * @returns Query result with facets
 *
 * @example
 * ```tsx
 * const { data: facets } = useProductFacets({
 *   category: 'rings',
 * });
 *
 * // Use facets for filter UI
 * <FacetFilter
 *   title="Brand"
 *   options={facets?.brands}
 * />
 * ```
 */
export function useProductFacets(
  filters: CatalogFilters = {}
): UseQueryResult<CatalogFacets, CatalogApiError> {
  return useQuery<CatalogFacets, CatalogApiError>({
    queryKey: catalogKeys.products.facets(filters),
    queryFn: async () => {
      // Fetch with minimal products just to get facets
      const response = await fetchProducts({ ...filters, limit: 1, offset: 0 });
      return response.facets;
    },
    staleTime: catalogStaleTimes.facets,
    gcTime: catalogGcTimes.products,
  });
}

/**
 * Hook for infinite scroll product loading
 *
 * @param filters - Filter options (excluding offset)
 * @returns Infinite query result
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteProducts({
 *   category: 'rings',
 *   limit: 20,
 * });
 *
 * // Flatten pages for rendering
 * const products = data?.pages.flatMap(page => page.products) ?? [];
 *
 * // Load more on scroll
 * <InfiniteScroll
 *   loadMore={fetchNextPage}
 *   hasMore={hasNextPage}
 *   isLoading={isFetchingNextPage}
 * />
 * ```
 */
export function useInfiniteProducts(
  options: UseInfiniteProductsOptions = {}
): UseInfiniteQueryResult<InfiniteData<CatalogProductsResponse>, CatalogApiError> {
  const { enabled = true, ...filters } = options;
  const limit = filters.limit ?? 20;

  return useInfiniteQuery<
    CatalogProductsResponse,
    CatalogApiError,
    InfiniteData<CatalogProductsResponse>,
    readonly (string | object)[],
    number
  >({
    queryKey: catalogKeys.products.infinite(filters),
    queryFn: ({ pageParam }) =>
      fetchProducts({
        ...filters,
        limit,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.products.length,
        0
      );

      // Check if there are more products to load
      if (totalLoaded >= lastPage.total) {
        return undefined;
      }

      return totalLoaded;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.offset === 0) {
        return undefined;
      }
      return Math.max(0, firstPage.offset - limit);
    },
    enabled,
    staleTime: catalogStaleTimes.products,
    gcTime: catalogGcTimes.products,
  });
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get just the products array from catalog query
 *
 * @param filters - Filter options
 * @returns Array of products or empty array
 *
 * @example
 * ```tsx
 * const products = useProducts({ category: 'rings' });
 * ```
 */
export function useProducts(filters: CatalogFilters = {}): CatalogProduct[] {
  const { data } = useCatalogProducts(filters);
  return data?.products ?? [];
}

/**
 * Hook to get total product count for current filters
 *
 * @param filters - Filter options
 * @returns Total count or 0
 */
export function useProductCount(filters: CatalogFilters = {}): number {
  const { data } = useCatalogProducts({ ...filters, limit: 1 });
  return data?.total ?? 0;
}

/**
 * Hook to search products
 *
 * @param query - Search query string
 * @param options - Additional filter options
 * @returns Query result with search results
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useProductSearch('diamond ring', {
 *   limit: 10,
 * });
 * ```
 */
export function useProductSearch(
  query: string,
  options: Omit<UseCatalogProductsOptions, 'search'> = {}
): UseQueryResult<CatalogProductsResponse, CatalogApiError> {
  const { enabled = true, ...filters } = options;

  return useCatalogProducts({
    ...filters,
    search: query,
    enabled: enabled && query.length >= 2,
  });
}

/**
 * Hook to get products by category
 *
 * @param categoryHandle - Category handle
 * @param options - Additional filter options
 * @returns Query result with products
 *
 * @example
 * ```tsx
 * const { data } = useProductsByCategory('rings', {
 *   sort: 'newest',
 *   limit: 12,
 * });
 * ```
 */
export function useProductsByCategory(
  categoryHandle: string,
  options: Omit<UseCatalogProductsOptions, 'category'> = {}
): UseQueryResult<CatalogProductsResponse, CatalogApiError> {
  const { enabled = true, ...filters } = options;

  return useCatalogProducts({
    ...filters,
    category: categoryHandle,
    enabled: enabled && !!categoryHandle,
  });
}

/**
 * Hook to get products by brand
 *
 * @param brandSlug - Brand slug
 * @param options - Additional filter options
 * @returns Query result with products
 *
 * @example
 * ```tsx
 * const { data } = useProductsByBrand('cartier', {
 *   sort: 'price_desc',
 * });
 * ```
 */
export function useProductsByBrand(
  brandSlug: string,
  options: Omit<UseCatalogProductsOptions, 'brand'> = {}
): UseQueryResult<CatalogProductsResponse, CatalogApiError> {
  const { enabled = true, ...filters } = options;

  return useCatalogProducts({
    ...filters,
    brand: brandSlug,
    enabled: enabled && !!brandSlug,
  });
}

// ============================================================================
// Prefetch Utilities
// ============================================================================

/**
 * Hook providing prefetch utilities for products
 *
 * @returns Object with prefetch functions
 *
 * @example
 * ```tsx
 * const { prefetchProducts, prefetchSearch } = useProductPrefetch();
 *
 * // Prefetch on category hover
 * <CategoryCard
 *   onMouseEnter={() => prefetchProducts({ category: cat.handle })}
 * />
 * ```
 */
export function useProductPrefetch() {
  const queryClient = useQueryClient();

  const prefetchProducts = useCallback(
    async (filters: CatalogFilters) => {
      await queryClient.prefetchQuery({
        queryKey: catalogKeys.products.list(filters),
        queryFn: () => fetchProducts(filters),
        staleTime: catalogStaleTimes.products,
      });
    },
    [queryClient]
  );

  const prefetchSearch = useCallback(
    async (query: string, filters?: Omit<CatalogFilters, 'search'>) => {
      await queryClient.prefetchQuery({
        queryKey: catalogKeys.search.results(query, filters),
        queryFn: () => fetchProducts({ ...filters, search: query }),
        staleTime: catalogStaleTimes.search,
      });
    },
    [queryClient]
  );

  return {
    prefetchProducts,
    prefetchSearch,
  };
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Hook for invalidating product cache
 *
 * @returns Object with invalidation functions
 *
 * @example
 * ```tsx
 * const { invalidateProducts, invalidateFacets } = useProductInvalidation();
 *
 * // After product update
 * await invalidateProducts();
 * ```
 */
export function useProductInvalidation() {
  const queryClient = useQueryClient();

  const invalidateProducts = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogKeys.products.lists(),
    });
  }, [queryClient]);

  const invalidateFacets = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogKeys.products.all,
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.includes('facets');
      },
    });
  }, [queryClient]);

  const invalidateAllProducts = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogKeys.products.all,
    });
  }, [queryClient]);

  const invalidateSearch = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogKeys.search.all,
    });
  }, [queryClient]);

  return {
    invalidateProducts,
    invalidateFacets,
    invalidateAllProducts,
    invalidateSearch,
  };
}

// ============================================================================
// Filter State Hook
// ============================================================================

/**
 * Filter state shape
 */
export interface ProductFilterState extends CatalogFilters {
  /** Update a single filter value */
  setFilter: <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => void;
  /** Update multiple filter values */
  setFilters: (filters: Partial<CatalogFilters>) => void;
  /** Reset all filters to defaults */
  resetFilters: () => void;
  /** Remove a specific filter */
  removeFilter: (key: keyof CatalogFilters) => void;
  /** Check if any filters are active */
  hasActiveFilters: boolean;
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: CatalogFilters = {
  sort: 'newest',
  limit: 20,
  offset: 0,
};

// ============================================================================
// Server-side Helpers
// ============================================================================

/**
 * Fetch products for SSR/SSG
 *
 * @param filters - Filter options
 * @returns Promise with products response
 *
 * @example
 * ```typescript
 * // In a Server Component
 * const data = await getServerProducts({ category: 'rings', limit: 12 });
 *
 * return <ProductGrid initialData={data} />;
 * ```
 */
export async function getServerProducts(
  filters: CatalogFilters = {}
): Promise<CatalogProductsResponse> {
  return fetchProducts({
    ...DEFAULT_FILTERS,
    ...filters,
  });
}

/**
 * Fetch product facets for SSR/SSG
 *
 * @param filters - Filter options
 * @returns Promise with facets
 */
export async function getServerFacets(
  filters: CatalogFilters = {}
): Promise<CatalogFacets> {
  const response = await fetchProducts({ ...filters, limit: 1, offset: 0 });
  return response.facets;
}
