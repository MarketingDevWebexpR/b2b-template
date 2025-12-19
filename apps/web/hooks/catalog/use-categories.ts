'use client';

/**
 * Category Hooks for Catalog Module
 *
 * React Query hooks for fetching and managing category data with full
 * hierarchy support. Provides tree structure, breadcrumbs, and filtering.
 *
 * Compatible with App Search v3 category schema:
 * - depth: 0-4 indicating hierarchy level (supports 5-level navigation L1-L5)
 * - parent_category_id: reference to parent category
 * - path: full path like "Plomberie > Robinetterie > Mitigeurs"
 * - ancestor_handles/ancestor_names: for URL and breadcrumb construction
 * - product_count: total products including descendants
 *
 * @packageDocumentation
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type {
  IndexedCategory,
  CategoryTreeNode,
  CategoryBreadcrumb,
  CategoryNavItem,
} from '@/types/category';
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
import {
  transformTreeToNavItems,
  transformCategoryToBreadcrumbs,
  buildCategoryFullPath,
} from '@/lib/catalog/transformers';

// ============================================================================
// Types
// ============================================================================

/**
 * Category tree response from API
 */
export interface CategoryTreeResponse {
  tree: CategoryTreeNode[];
  flat: IndexedCategory[];
  total: number;
}

/**
 * Category path response from API
 */
export interface CategoryPathResponse {
  category: IndexedCategory;
  children: IndexedCategory[];
  products: CategoryProduct[];
  ancestors: IndexedCategory[];
}

/**
 * Product in category context
 */
export interface CategoryProduct {
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
 * Options for useCategoryTree hook
 */
export interface UseCategoryTreeOptions {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Initial data for SSR hydration */
  initialData?: CategoryTreeResponse;
}

/**
 * Options for useCategory hook
 */
export interface UseCategoryOptions {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Initial data for SSR hydration */
  initialData?: CategoryPathResponse;
}

/**
 * Options for useCategoryProducts hook
 */
export interface UseCategoryProductsOptions extends ProductCacheFilters {
  /** Enable/disable the query */
  enabled?: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch category tree from API
 */
async function fetchCategoryTree(): Promise<CategoryTreeResponse> {
  const client = getCatalogApiClient();
  return client.get<CategoryTreeResponse>('/api/catalog/categories/tree');
}

/**
 * Fetch category by path from API
 */
async function fetchCategoryByPath(path: string[]): Promise<CategoryPathResponse> {
  const client = getCatalogApiClient();
  const pathString = path.join('/');
  return client.get<CategoryPathResponse>(`/api/catalog/categories/${pathString}`);
}

// ============================================================================
// Tree Hooks
// ============================================================================

/**
 * Hook to fetch the complete category tree
 *
 * @param options - Query options
 * @returns Query result with category tree
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useCategoryTree();
 *
 * if (data) {
 *   console.log('Tree:', data.tree);
 *   console.log('Flat:', data.flat);
 *   console.log('Total:', data.total);
 * }
 * ```
 */
export function useCategoryTree(
  options: UseCategoryTreeOptions = {}
): UseQueryResult<CategoryTreeResponse, CatalogApiError> {
  const { enabled = true, initialData } = options;

  return useQuery<CategoryTreeResponse, CatalogApiError>({
    queryKey: catalogKeys.categories.tree(),
    queryFn: fetchCategoryTree,
    enabled,
    initialData,
    staleTime: catalogStaleTimes.categories,
    gcTime: catalogGcTimes.categories,
    retry: (failureCount, error) => {
      if (error instanceof CatalogApiError && error.isClientError) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get navigation items from category tree
 *
 * @param maxDepth - Maximum depth to include (default: 2)
 * @param options - Query options
 * @returns Query result with navigation items
 *
 * @example
 * ```tsx
 * const { data: navItems } = useCategoryNavItems(2);
 *
 * // Use in mega menu
 * <MegaMenu items={navItems} />
 * ```
 */
export function useCategoryNavItems(
  maxDepth: number = 2,
  options: { enabled?: boolean } = {}
): UseQueryResult<CategoryNavItem[], CatalogApiError> {
  const { enabled = true } = options;

  return useQuery<CategoryNavItem[], CatalogApiError>({
    queryKey: [...catalogKeys.categories.tree(), 'nav', maxDepth],
    queryFn: async () => {
      const response = await fetchCategoryTree();
      return transformTreeToNavItems(response.tree, maxDepth);
    },
    enabled,
    staleTime: catalogStaleTimes.categories,
    gcTime: catalogGcTimes.categories,
  });
}

// ============================================================================
// Single Category Hooks
// ============================================================================

/**
 * Hook to fetch a category by its hierarchical path
 *
 * @param path - Array of category handles forming the path
 * @param options - Query options
 * @returns Query result with category data
 *
 * @example
 * ```tsx
 * // Fetch /bijoux/colliers/pendentifs
 * const { data, isLoading } = useCategory(['bijoux', 'colliers', 'pendentifs']);
 *
 * if (data) {
 *   console.log(data.category);
 *   console.log(data.children);
 *   console.log(data.products);
 *   console.log(data.ancestors);
 * }
 * ```
 */
export function useCategory(
  path: string[],
  options: UseCategoryOptions = {}
): UseQueryResult<CategoryPathResponse, CatalogApiError> {
  const { enabled = true, initialData } = options;

  return useQuery<CategoryPathResponse, CatalogApiError>({
    queryKey: catalogKeys.categories.detail(path),
    queryFn: () => fetchCategoryByPath(path),
    enabled: enabled && path.length > 0,
    initialData,
    staleTime: catalogStaleTimes.categories,
    gcTime: catalogGcTimes.categories,
    retry: (failureCount, error) => {
      if (error instanceof CatalogApiError && error.isNotFound) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch products for a specific category
 *
 * @param categoryId - Category ID
 * @param options - Query options including filters
 * @returns Query result with products
 *
 * @example
 * ```tsx
 * const { data: products } = useCategoryProducts('cat_123', {
 *   limit: 20,
 *   sort: 'price_asc',
 * });
 * ```
 */
export function useCategoryProducts(
  categoryId: string,
  options: UseCategoryProductsOptions = {}
): UseQueryResult<CategoryProduct[], CatalogApiError> {
  const { enabled = true, ...filters } = options;

  return useQuery<CategoryProduct[], CatalogApiError>({
    queryKey: catalogKeys.categories.products(categoryId, filters),
    queryFn: async () => {
      const client = getCatalogApiClient();

      const params: Record<string, string | number | boolean | undefined> = {
        category: categoryId,
      };

      if (filters.limit) params.limit = filters.limit;
      if (filters.offset) params.offset = filters.offset;
      if (filters.sort) params.sort = filters.sort;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const response = await client.get<{ products: CategoryProduct[] }>(
        '/api/catalog/products',
        { params }
      );

      return response.products;
    },
    enabled: enabled && !!categoryId,
    staleTime: catalogStaleTimes.products,
    gcTime: catalogGcTimes.products,
  });
}

/**
 * Hook to get breadcrumbs for a category
 *
 * @param categoryId - Category ID
 * @param options - Query options
 * @returns Query result with breadcrumbs
 *
 * @example
 * ```tsx
 * const { data: breadcrumbs } = useCategoryBreadcrumbs('cat_123');
 *
 * <Breadcrumb items={breadcrumbs} />
 * ```
 */
export function useCategoryBreadcrumbs(
  categoryId: string,
  options: { enabled?: boolean } = {}
): UseQueryResult<CategoryBreadcrumb[], CatalogApiError> {
  const { enabled = true } = options;

  return useQuery<CategoryBreadcrumb[], CatalogApiError>({
    queryKey: catalogKeys.categories.breadcrumbs(categoryId),
    queryFn: async () => {
      // Fetch the tree to build breadcrumbs
      const treeData = await fetchCategoryTree();
      const { flat } = treeData;
      const category = flat.find((c) => c.id === categoryId);

      if (!category) return [];

      // Build lookup map
      const byId = Object.fromEntries(flat.map((c) => [c.id, c]));

      return transformCategoryToBreadcrumbs(category, byId, '/categorie');
    },
    enabled: enabled && !!categoryId,
    staleTime: catalogStaleTimes.categories,
    gcTime: catalogGcTimes.categories,
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to find a category by handle in the tree
 *
 * @param handle - Category handle to find
 * @returns Category or null
 *
 * @example
 * ```tsx
 * const category = useCategoryByHandle('bijoux');
 * ```
 */
export function useCategoryByHandle(
  handle: string | null | undefined
): IndexedCategory | null {
  const { data } = useCategoryTree();

  return useMemo(() => {
    if (!data || !handle) return null;
    return data.flat.find((c) => c.handle === handle) ?? null;
  }, [data, handle]);
}

/**
 * Hook to get root categories (depth 0)
 *
 * @returns Array of root categories
 *
 * @example
 * ```tsx
 * const rootCategories = useRootCategories();
 * ```
 */
export function useRootCategories(): IndexedCategory[] {
  const { data } = useCategoryTree();

  return useMemo(() => {
    if (!data) return [];
    return data.flat
      .filter((c) => c.depth === 0)
      .sort((a, b) => a.rank - b.rank);
  }, [data]);
}

/**
 * Hook to get children of a category
 *
 * @param parentId - Parent category ID
 * @returns Array of child categories
 *
 * @example
 * ```tsx
 * const children = useCategoryChildren('cat_123');
 * ```
 */
export function useCategoryChildren(
  parentId: string | null | undefined
): IndexedCategory[] {
  const { data } = useCategoryTree();

  return useMemo(() => {
    if (!data || !parentId) return [];
    return data.flat
      .filter((c) => c.parent_category_id === parentId)
      .sort((a, b) => a.rank - b.rank);
  }, [data, parentId]);
}

// ============================================================================
// Prefetch Utilities
// ============================================================================

/**
 * Hook providing prefetch utilities for categories
 *
 * @returns Object with prefetch functions
 *
 * @example
 * ```tsx
 * const { prefetchCategory, prefetchTree } = useCategoryPrefetch();
 *
 * // Prefetch on hover
 * <Link
 *   href="/categorie/bijoux"
 *   onMouseEnter={() => prefetchCategory(['bijoux'])}
 * >
 *   Bijoux
 * </Link>
 * ```
 */
export function useCategoryPrefetch() {
  const queryClient = useQueryClient();

  const prefetchTree = useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey: catalogKeys.categories.tree(),
      queryFn: fetchCategoryTree,
      staleTime: catalogStaleTimes.categories,
    });
  }, [queryClient]);

  const prefetchCategory = useCallback(
    async (path: string[]) => {
      await queryClient.prefetchQuery({
        queryKey: catalogKeys.categories.detail(path),
        queryFn: () => fetchCategoryByPath(path),
        staleTime: catalogStaleTimes.categories,
      });
    },
    [queryClient]
  );

  return {
    prefetchTree,
    prefetchCategory,
  };
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Hook for invalidating category cache
 *
 * @returns Object with invalidation functions
 *
 * @example
 * ```tsx
 * const { invalidateTree, invalidateCategory } = useCategoryInvalidation();
 *
 * // After category updates
 * await invalidateTree();
 * ```
 */
export function useCategoryInvalidation() {
  const queryClient = useQueryClient();

  const invalidateTree = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogKeys.categories.tree(),
    });
  }, [queryClient]);

  const invalidateCategory = useCallback(
    async (path: string[]) => {
      await queryClient.invalidateQueries({
        queryKey: catalogKeys.categories.detail(path),
      });
    },
    [queryClient]
  );

  const invalidateAllCategories = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: catalogKeys.categories.all,
    });
  }, [queryClient]);

  return {
    invalidateTree,
    invalidateCategory,
    invalidateAllCategories,
  };
}

// ============================================================================
// Server-side Helpers
// ============================================================================

/**
 * Fetch category tree for SSR/SSG
 *
 * @returns Promise with category tree response
 *
 * @example
 * ```typescript
 * // In a Server Component
 * const treeData = await getServerCategoryTree();
 *
 * return <CategoryNav initialData={treeData} />;
 * ```
 */
export async function getServerCategoryTree(): Promise<CategoryTreeResponse> {
  return fetchCategoryTree();
}

/**
 * Fetch category by path for SSR/SSG
 *
 * @param path - Category path segments
 * @returns Promise with category path response
 */
export async function getServerCategory(
  path: string[]
): Promise<CategoryPathResponse> {
  return fetchCategoryByPath(path);
}
