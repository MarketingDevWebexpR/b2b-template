'use client';

/**
 * Brand Hooks for Catalog Module
 *
 * React Query hooks for fetching and managing brand data.
 * Provides optimized caching, background refetching, and type-safe access.
 *
 * @packageDocumentation
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Brand, BrandResponse, BrandFilterOptions } from '@/types/brand';
import {
  catalogKeys,
  catalogStaleTimes,
  catalogGcTimes,
  type BrandCacheFilters,
} from '@/lib/catalog/cache-keys';
import {
  getCatalogApiClient,
  CatalogApiError,
} from '@/lib/catalog/api-client';
import {
  transformBrandToCardData,
  transformBrandsToCardData,
  type BrandCardData,
} from '@/lib/catalog/transformers';

// ============================================================================
// Types
// ============================================================================

/**
 * Options for useBrands hook
 */
export interface UseBrandsOptions extends BrandCacheFilters {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Initial data for SSR hydration */
  initialData?: BrandResponse;
}

/**
 * Brand detail response from API
 */
export interface BrandDetailResponse {
  brand: Brand;
  products: BrandProduct[];
  relatedBrands: Brand[];
}

/**
 * Simplified product type for brand pages
 */
export interface BrandProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  inStock: boolean;
}

/**
 * Options for useBrand hook
 */
export interface UseBrandOptions {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Initial data for SSR hydration */
  initialData?: BrandDetailResponse;
}

/**
 * Options for useBrandProducts hook
 */
export interface UseBrandProductsOptions {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Number of products to fetch */
  limit?: number;
  /** Pagination offset */
  offset?: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch brands from API
 */
async function fetchBrands(filters?: BrandCacheFilters): Promise<BrandResponse> {
  const client = getCatalogApiClient();

  const params: Record<string, string | number | boolean | undefined> = {};

  if (filters?.letter) params.letter = filters.letter;
  if (filters?.premium) params.premium = filters.premium;
  if (filters?.search) params.search = filters.search;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.offset) params.offset = filters.offset;
  if (filters?.sort) params.sort = filters.sort;

  return client.get<BrandResponse>('/api/catalog/brands', { params });
}

/**
 * Fetch a single brand by slug
 */
async function fetchBrand(slug: string): Promise<BrandDetailResponse> {
  const client = getCatalogApiClient();
  return client.get<BrandDetailResponse>(`/api/catalog/brands/${slug}`);
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all brands with optional filtering
 *
 * @param options - Filter and query options
 * @returns Query result with brands data
 *
 * @example
 * ```tsx
 * // Fetch all brands
 * const { data, isLoading, error } = useBrands();
 *
 * // Fetch premium brands only
 * const { data } = useBrands({ premium: true });
 *
 * // Fetch brands starting with 'C'
 * const { data } = useBrands({ letter: 'C' });
 *
 * // Search brands
 * const { data } = useBrands({ search: 'cartier' });
 * ```
 */
export function useBrands(
  options: UseBrandsOptions = {}
): UseQueryResult<BrandResponse, CatalogApiError> {
  const { enabled = true, initialData, ...filters } = options;

  return useQuery<BrandResponse, CatalogApiError>({
    queryKey: catalogKeys.brands.list(filters),
    queryFn: () => fetchBrands(filters),
    enabled,
    initialData,
    staleTime: catalogStaleTimes.brands,
    gcTime: catalogGcTimes.brands,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof CatalogApiError && error.isClientError) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch a single brand by slug
 *
 * @param slug - Brand URL slug
 * @param options - Query options
 * @returns Query result with brand detail
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useBrand('cartier');
 *
 * if (data) {
 *   console.log(data.brand.name);
 *   console.log(data.products.length);
 *   console.log(data.relatedBrands);
 * }
 * ```
 */
export function useBrand(
  slug: string,
  options: UseBrandOptions = {}
): UseQueryResult<BrandDetailResponse, CatalogApiError> {
  const { enabled = true, initialData } = options;

  return useQuery<BrandDetailResponse, CatalogApiError>({
    queryKey: catalogKeys.brands.detail(slug),
    queryFn: () => fetchBrand(slug),
    enabled: enabled && !!slug,
    initialData,
    staleTime: catalogStaleTimes.brands,
    gcTime: catalogGcTimes.brands,
    retry: (failureCount, error) => {
      if (error instanceof CatalogApiError && error.isNotFound) {
        return false;
      }
      if (error instanceof CatalogApiError && error.isClientError) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch products for a specific brand
 *
 * @param slug - Brand URL slug
 * @param options - Query options including pagination
 * @returns Query result with brand products
 *
 * @example
 * ```tsx
 * const { data: products, isLoading } = useBrandProducts('cartier', {
 *   limit: 20,
 *   offset: 0,
 * });
 * ```
 */
export function useBrandProducts(
  slug: string,
  options: UseBrandProductsOptions = {}
): UseQueryResult<BrandProduct[], CatalogApiError> {
  const { enabled = true, limit = 20, offset = 0 } = options;

  return useQuery<BrandProduct[], CatalogApiError>({
    queryKey: catalogKeys.brands.products(slug, { limit, offset }),
    queryFn: async () => {
      const response = await fetchBrand(slug);
      return response.products;
    },
    enabled: enabled && !!slug,
    staleTime: catalogStaleTimes.products,
    gcTime: catalogGcTimes.products,
  });
}

/**
 * Hook to fetch premium/featured brands
 *
 * @param options - Query options
 * @returns Query result with premium brands
 *
 * @example
 * ```tsx
 * const { data: premiumBrands, isLoading } = usePremiumBrands();
 * ```
 */
export function usePremiumBrands(
  options: { enabled?: boolean } = {}
): UseQueryResult<Brand[], CatalogApiError> {
  const { enabled = true } = options;

  return useQuery<Brand[], CatalogApiError>({
    queryKey: catalogKeys.brands.premium(),
    queryFn: async () => {
      const response = await fetchBrands({ premium: true });
      return response.premium;
    },
    enabled,
    staleTime: catalogStaleTimes.brands,
    gcTime: catalogGcTimes.brands,
  });
}

/**
 * Hook to get brands grouped by first letter
 *
 * @param options - Query options
 * @returns Query result with brands grouped by letter
 *
 * @example
 * ```tsx
 * const { data: byLetter } = useBrandsByLetter();
 *
 * // Render alphabetical navigation
 * Object.keys(byLetter).map(letter => (
 *   <BrandLetterSection key={letter} letter={letter} brands={byLetter[letter]} />
 * ));
 * ```
 */
export function useBrandsByLetter(
  options: { enabled?: boolean } = {}
): UseQueryResult<Record<string, Brand[]>, CatalogApiError> {
  const { enabled = true } = options;

  return useQuery<Record<string, Brand[]>, CatalogApiError>({
    queryKey: catalogKeys.brands.byLetter(),
    queryFn: async () => {
      const response = await fetchBrands();
      return response.byLetter;
    },
    enabled,
    staleTime: catalogStaleTimes.brands,
    gcTime: catalogGcTimes.brands,
  });
}

// ============================================================================
// Derived Data Hooks
// ============================================================================

/**
 * Hook to get brands as card data (with computed initials and colors)
 *
 * @param options - Filter and query options
 * @returns Query result with brand card data
 *
 * @example
 * ```tsx
 * const { data: brandCards } = useBrandCards();
 *
 * brandCards?.map(card => (
 *   <BrandCard
 *     key={card.id}
 *     name={card.name}
 *     initials={card.initials}
 *     color={card.color}
 *   />
 * ));
 * ```
 */
export function useBrandCards(
  options: UseBrandsOptions = {}
): UseQueryResult<BrandCardData[], CatalogApiError> {
  const { enabled = true, ...filters } = options;

  return useQuery<BrandCardData[], CatalogApiError>({
    queryKey: [...catalogKeys.brands.list(filters), 'cards'],
    queryFn: async () => {
      const response = await fetchBrands(filters);
      return transformBrandsToCardData(response.brands);
    },
    enabled,
    staleTime: catalogStaleTimes.brands,
    gcTime: catalogGcTimes.brands,
  });
}

// ============================================================================
// Prefetch Utilities
// ============================================================================

/**
 * Hook providing prefetch utilities for brands
 *
 * @returns Object with prefetch functions
 *
 * @example
 * ```tsx
 * const { prefetchBrand, prefetchBrands } = useBrandPrefetch();
 *
 * // Prefetch on hover
 * <Link
 *   href={`/marques/${brand.slug}`}
 *   onMouseEnter={() => prefetchBrand(brand.slug)}
 * >
 *   {brand.name}
 * </Link>
 * ```
 */
export function useBrandPrefetch() {
  const queryClient = useQueryClient();

  const prefetchBrands = useCallback(
    async (filters?: BrandCacheFilters) => {
      await queryClient.prefetchQuery({
        queryKey: catalogKeys.brands.list(filters),
        queryFn: () => fetchBrands(filters),
        staleTime: catalogStaleTimes.brands,
      });
    },
    [queryClient]
  );

  const prefetchBrand = useCallback(
    async (slug: string) => {
      await queryClient.prefetchQuery({
        queryKey: catalogKeys.brands.detail(slug),
        queryFn: () => fetchBrand(slug),
        staleTime: catalogStaleTimes.brands,
      });
    },
    [queryClient]
  );

  return {
    prefetchBrands,
    prefetchBrand,
  };
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Hook for invalidating brand cache
 *
 * @returns Object with invalidation functions
 *
 * @example
 * ```tsx
 * const { invalidateAllBrands, invalidateBrand } = useBrandInvalidation();
 *
 * // After updating a brand
 * await invalidateBrand('cartier');
 *
 * // After bulk changes
 * await invalidateAllBrands();
 * ```
 */
export function useBrandInvalidation() {
  const queryClient = useQueryClient();

  const invalidateAllBrands = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogKeys.brands.all,
    });
  }, [queryClient]);

  const invalidateBrand = useCallback(
    async (slug: string) => {
      await queryClient.invalidateQueries({
        queryKey: catalogKeys.brands.detail(slug),
      });
    },
    [queryClient]
  );

  const invalidatePremiumBrands = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogKeys.brands.premium(),
    });
  }, [queryClient]);

  return {
    invalidateAllBrands,
    invalidateBrand,
    invalidatePremiumBrands,
  };
}

// ============================================================================
// Server-side Helpers
// ============================================================================

/**
 * Fetch brands for SSR/SSG
 *
 * @param filters - Optional brand filters
 * @returns Promise with brand response
 *
 * @example
 * ```typescript
 * // In a Server Component
 * const brandData = await getServerBrands({ premium: true });
 *
 * return <BrandList initialData={brandData} />;
 * ```
 */
export async function getServerBrands(
  filters?: BrandCacheFilters
): Promise<BrandResponse> {
  return fetchBrands(filters);
}

/**
 * Fetch a single brand for SSR/SSG
 *
 * @param slug - Brand slug
 * @returns Promise with brand detail response
 */
export async function getServerBrand(
  slug: string
): Promise<BrandDetailResponse> {
  return fetchBrand(slug);
}

export type {
  BrandCardData,
};
