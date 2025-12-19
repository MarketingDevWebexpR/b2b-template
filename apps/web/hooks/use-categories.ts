'use client';

/**
 * Categories Hook
 *
 * React hook for fetching and managing category data with hierarchy support.
 * Provides caching, prefetching for hover states, and SSR initial data support.
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

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type {
  IndexedCategory,
  CategoryResponse,
  CategoryTreeNode,
  CategoryFilterOptions,
  CategoryBreadcrumb,
} from '@/types/category';
import {
  findCategoryById,
  findCategoryByHandle,
  getCategoryBreadcrumbs,
  filterCategories,
  getRootCategories,
  getChildCategories,
  treeToNavItems,
} from '@/lib/categories/build-tree';

// ============================================================================
// Types
// ============================================================================

export interface UseCategoriesOptions {
  /** Initial data from SSR (avoids fetch on mount) */
  initialData?: CategoryResponse;
  /** Auto-fetch on mount (default: true) */
  enabled?: boolean;
  /** Stale time in ms before refetch (default: 5 minutes) */
  staleTime?: number;
  /** Cache time in ms to keep data after unmount (default: 30 minutes) */
  cacheTime?: number;
}

export interface UseCategoriesResult {
  /** Complete category response */
  data: CategoryResponse | null;
  /** Hierarchical tree structure */
  tree: CategoryTreeNode[];
  /** Flat array of all categories */
  flat: IndexedCategory[];
  /** Category lookup by ID */
  byId: Record<string, IndexedCategory>;
  /** Category lookup by handle */
  byHandle: Record<string, IndexedCategory>;
  /** Is currently fetching */
  isLoading: boolean;
  /** Has initial data loaded */
  isInitialized: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Total category count */
  total: number;
  /** Maximum depth in tree */
  maxDepth: number;
  /** Manually refetch categories */
  refetch: () => Promise<void>;
  /** Get category by ID */
  getCategoryById: (id: string) => IndexedCategory | null;
  /** Get category by handle */
  getCategoryByHandle: (handle: string) => IndexedCategory | null;
  /** Get breadcrumbs for a category */
  getBreadcrumbs: (categoryId: string) => CategoryBreadcrumb[];
  /** Get root level categories */
  getRootCategories: () => IndexedCategory[];
  /** Get children of a category */
  getChildren: (parentId: string) => IndexedCategory[];
  /** Filter categories */
  filter: (options: CategoryFilterOptions) => IndexedCategory[];
  /** Prefetch (no-op, for future TanStack Query compatibility) */
  prefetch: () => void;
}

// ============================================================================
// Cache Implementation
// ============================================================================

interface CacheEntry {
  data: CategoryResponse;
  timestamp: number;
}

// Simple in-memory cache shared across hook instances
const cache: {
  entry: CacheEntry | null;
  subscribers: Set<() => void>;
  fetchPromise: Promise<CategoryResponse> | null;
} = {
  entry: null,
  subscribers: new Set(),
  fetchPromise: null,
};

function notifySubscribers() {
  cache.subscribers.forEach((callback) => callback());
}

// ============================================================================
// Fetch Function
// ============================================================================

async function fetchCategories(): Promise<CategoryResponse> {
  const response = await fetch('/api/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data: CategoryResponse = await response.json();
  return data;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for fetching and managing categories with full hierarchy support
 *
 * @param options - Hook configuration options
 * @returns Category data and utility functions
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { tree, isLoading, getCategoryByHandle } = useCategories();
 *
 * // With SSR initial data
 * const { tree } = useCategories({ initialData: serverCategories });
 *
 * // Get specific category
 * const category = getCategoryByHandle('electricite');
 * const breadcrumbs = getBreadcrumbs(category.id);
 * ```
 */
export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesResult {
  const {
    initialData,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cacheTime = 30 * 60 * 1000, // 30 minutes (for future cleanup)
  } = options;

  // State
  const [data, setData] = useState<CategoryResponse | null>(
    initialData ?? cache.entry?.data ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(!!initialData || !!cache.entry);

  // Refs for avoiding stale closures
  const mountedRef = useRef(true);
  const staleTimeRef = useRef(staleTime);
  staleTimeRef.current = staleTime;

  // Subscribe to cache updates
  useEffect(() => {
    const handleCacheUpdate = () => {
      if (mountedRef.current && cache.entry) {
        setData(cache.entry.data);
        setIsInitialized(true);
      }
    };

    cache.subscribers.add(handleCacheUpdate);

    return () => {
      cache.subscribers.delete(handleCacheUpdate);
    };
  }, []);

  // Fetch function
  const doFetch = useCallback(async () => {
    // Check if we already have a fresh cache
    if (cache.entry) {
      const age = Date.now() - cache.entry.timestamp;
      if (age < staleTimeRef.current) {
        setData(cache.entry.data);
        setIsInitialized(true);
        return;
      }
    }

    // Check if another fetch is in progress
    if (cache.fetchPromise) {
      try {
        const result = await cache.fetchPromise;
        if (mountedRef.current) {
          setData(result);
          setIsInitialized(true);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Fetch failed');
        }
      }
      return;
    }

    // Start new fetch
    setIsLoading(true);
    setError(null);

    cache.fetchPromise = fetchCategories();

    try {
      const result = await cache.fetchPromise;

      // Update cache
      cache.entry = {
        data: result,
        timestamp: Date.now(),
      };

      // Notify all subscribers
      notifySubscribers();

      if (mountedRef.current) {
        setData(result);
        setIsInitialized(true);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      }
    } finally {
      cache.fetchPromise = null;
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    if (enabled && !initialData) {
      doFetch();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, initialData, doFetch]);

  // Memoized derived values
  const tree = useMemo(() => data?.tree ?? [], [data]);
  const flat = useMemo(() => data?.flat ?? [], [data]);
  const byId = useMemo(() => data?.byId ?? {}, [data]);
  const byHandle = useMemo(() => data?.byHandle ?? {}, [data]);
  const total = data?.total ?? 0;
  const maxDepth = data?.maxDepth ?? 0;

  // Utility functions
  const getCategoryById = useCallback(
    (id: string): IndexedCategory | null => {
      return byId[id] ?? null;
    },
    [byId]
  );

  const getCategoryByHandle = useCallback(
    (handle: string): IndexedCategory | null => {
      return byHandle[handle] ?? null;
    },
    [byHandle]
  );

  const getBreadcrumbs = useCallback(
    (categoryId: string): CategoryBreadcrumb[] => {
      const category = byId[categoryId];
      if (!category) return [];
      return getCategoryBreadcrumbs(category, byId);
    },
    [byId]
  );

  const getRootCategoriesCallback = useCallback((): IndexedCategory[] => {
    return getRootCategories(flat);
  }, [flat]);

  const getChildren = useCallback(
    (parentId: string): IndexedCategory[] => {
      return getChildCategories(parentId, flat);
    },
    [flat]
  );

  const filter = useCallback(
    (filterOptions: CategoryFilterOptions): IndexedCategory[] => {
      return filterCategories(flat, filterOptions);
    },
    [flat]
  );

  // Prefetch function (for hover states or router prefetching)
  const prefetch = useCallback(() => {
    // If we don't have data or it's stale, trigger a background fetch
    if (!cache.entry || Date.now() - cache.entry.timestamp > staleTimeRef.current) {
      // Don't await - let it run in background
      doFetch();
    }
  }, [doFetch]);

  // Refetch function
  const refetch = useCallback(async () => {
    // Invalidate cache
    cache.entry = null;
    await doFetch();
  }, [doFetch]);

  return {
    data,
    tree,
    flat,
    byId,
    byHandle,
    isLoading,
    isInitialized,
    error,
    total,
    maxDepth,
    refetch,
    getCategoryById,
    getCategoryByHandle,
    getBreadcrumbs,
    getRootCategories: getRootCategoriesCallback,
    getChildren,
    filter,
    prefetch,
  };
}

// ============================================================================
// Additional Hooks
// ============================================================================

/**
 * Hook to get a single category by handle
 *
 * @param handle - Category handle
 * @returns Category or null
 *
 * @example
 * ```tsx
 * const { category, isLoading, breadcrumbs } = useCategoryByHandle('electricite');
 * ```
 */
export function useCategoryByHandle(handle: string | null | undefined) {
  const { byHandle, byId, isLoading, error, isInitialized } = useCategories();

  const category = useMemo(() => {
    if (!handle) return null;
    return byHandle[handle] ?? null;
  }, [byHandle, handle]);

  const breadcrumbs = useMemo(() => {
    if (!category) return [];
    return getCategoryBreadcrumbs(category, byId);
  }, [category, byId]);

  const children = useMemo(() => {
    if (!category) return [];
    return getChildCategories(category.id, Object.values(byId));
  }, [category, byId]);

  return {
    category,
    breadcrumbs,
    children,
    isLoading,
    error,
    isInitialized,
  };
}

/**
 * Hook to get a single category by ID
 *
 * @param id - Category ID
 * @returns Category or null
 */
export function useCategoryById(id: string | null | undefined) {
  const { byId, isLoading, error, isInitialized } = useCategories();

  const category = useMemo(() => {
    if (!id) return null;
    return byId[id] ?? null;
  }, [byId, id]);

  const breadcrumbs = useMemo(() => {
    if (!category) return [];
    return getCategoryBreadcrumbs(category, byId);
  }, [category, byId]);

  const children = useMemo(() => {
    if (!category) return [];
    return getChildCategories(category.id, Object.values(byId));
  }, [category, byId]);

  return {
    category,
    breadcrumbs,
    children,
    isLoading,
    error,
    isInitialized,
  };
}

/**
 * Hook to get navigation items from category tree
 *
 * @param maxDepth - Maximum depth to include (default: 2)
 * @returns Navigation items array
 */
export function useCategoryNavigation(maxDepth: number = 2) {
  const { tree, isLoading, error, isInitialized } = useCategories();

  const navItems = useMemo(() => {
    return treeToNavItems(tree, maxDepth);
  }, [tree, maxDepth]);

  return {
    navItems,
    isLoading,
    error,
    isInitialized,
  };
}

/**
 * Hook to get root categories only
 */
export function useRootCategories() {
  const { flat, isLoading, error, isInitialized } = useCategories();

  const rootCategories = useMemo(() => {
    return getRootCategories(flat);
  }, [flat]);

  return {
    categories: rootCategories,
    isLoading,
    error,
    isInitialized,
  };
}

// ============================================================================
// Prefetch Helper
// ============================================================================

/**
 * Prefetch categories data
 * Call this on hover or route prefetch to warm the cache
 *
 * @example
 * ```tsx
 * <Link
 *   href="/categories"
 *   onMouseEnter={prefetchCategories}
 * >
 *   Categories
 * </Link>
 * ```
 */
export function prefetchCategories(): void {
  // Check if already cached and fresh
  if (cache.entry) {
    const age = Date.now() - cache.entry.timestamp;
    if (age < 5 * 60 * 1000) {
      return; // Already fresh
    }
  }

  // Check if fetch already in progress
  if (cache.fetchPromise) {
    return;
  }

  // Start background fetch
  cache.fetchPromise = fetchCategories()
    .then((result) => {
      cache.entry = {
        data: result,
        timestamp: Date.now(),
      };
      notifySubscribers();
      return result;
    })
    .finally(() => {
      cache.fetchPromise = null;
    });
}

// ============================================================================
// Server-side Helper
// ============================================================================

/**
 * Fetch categories for SSR/SSG
 * Use this in getServerSideProps or generateStaticParams
 *
 * @example
 * ```typescript
 * // In page.tsx (App Router)
 * export default async function CategoriesPage() {
 *   const categories = await getServerCategories();
 *   return <CategoryList initialData={categories} />;
 * }
 * ```
 */
export async function getServerCategories(): Promise<CategoryResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/categories`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  return response.json();
}

export default useCategories;
