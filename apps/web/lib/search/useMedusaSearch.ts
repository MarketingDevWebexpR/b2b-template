'use client';

/**
 * useMedusaSearch Hook
 *
 * Custom hook for searching products using the Medusa search API.
 * Provides state management and convenience methods for search operations.
 *
 * Features:
 * - Category filtering
 * - Sorting
 * - Pagination
 * - Real-time search results
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getMedusaSearchClient, type ProductSearchResult } from './medusa-search-client';
import type { Product } from '@/types';

// ============================================================================
// Helper: Convert ProductSearchResult to Product
// ============================================================================

function adaptSearchResultToProduct(result: ProductSearchResult): Product {
  // Get the first variant for pricing info
  const firstVariant = result.variants?.[0];

  // Calculate price (use EUR prices, convert from cents if needed)
  const eurPrice = firstVariant?.prices?.find(
    (p) => p.currency_code === 'eur' || p.currency_code === 'EUR'
  );
  const price = eurPrice?.amount ?? result.price_min ?? 0;

  // Get first category
  const firstCategory = result.categories?.[0];

  // Get stock from variants
  const totalStock = result.variants?.reduce(
    (sum, v) => sum + (v.inventory_quantity ?? 0),
    0
  ) ?? 0;

  return {
    id: result.id,
    reference: result.sku ?? result.id,
    name: result.title,
    nameEn: undefined,
    slug: result.handle,
    ean: result.barcode ?? firstVariant?.barcode ?? undefined,
    description: result.description ?? '',
    shortDescription: result.description?.slice(0, 150) ?? '',
    price: price / 100, // Convert from cents to euros
    compareAtPrice: undefined,
    isPriceTTC: false,
    images: result.images?.length > 0 ? result.images : (result.thumbnail ? [result.thumbnail] : []),
    categoryId: firstCategory?.id ?? '',
    category: firstCategory ? {
      id: firstCategory.id,
      code: firstCategory.handle,
      name: firstCategory.name,
      slug: firstCategory.handle,
      description: '',
      image: '',
      productCount: 0,
      type: 0,
    } : undefined,
    collection: result.collection ?? undefined,
    style: undefined,
    materials: result.material ? [result.material] : [],
    weight: undefined,
    weightUnit: 'g',
    brand: result.brand ?? undefined,
    origin: undefined,
    warranty: undefined,
    stock: totalStock,
    isAvailable: result.is_available ?? totalStock > 0,
    featured: (result.metadata?.featured as boolean) ?? false,
    isNew: isNewProduct(result.created_at),
    createdAt: result.created_at,
  };
}

/**
 * Check if a product is "new" (created in the last 30 days)
 */
function isNewProduct(createdAt: string, daysThreshold: number = 30): boolean {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= daysThreshold;
}

// ============================================================================
// Types
// ============================================================================

export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'newest';

export interface UseMedusaSearchOptions {
  /** Initial search query */
  initialQuery?: string;
  /** Initial category ID filter */
  initialCategoryId?: string;
  /** Initial sort option */
  initialSort?: string;
  /** Initial page number */
  initialPage?: number;
  /** Number of results per page */
  pageSize?: number;
  /** Auto-search on mount */
  autoSearch?: boolean;
}

export interface UseMedusaSearchResult {
  /** Search results as Product array */
  products: Product[];
  /** Total number of results */
  totalResults: number;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Current search query */
  query: string;
  /** Current category ID filter */
  categoryId: string | undefined;
  /** Current page number */
  currentPage: number;
  /** Page size */
  pageSize: number;
  /** Current sort option */
  sortBy: SortOption;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Set category filter */
  setCategoryId: (categoryId: string | undefined) => void;
  /** Set current page */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Set sort option */
  setSortBy: (sort: SortOption) => void;
  /** Execute search */
  search: (query?: string) => Promise<void>;
  /** Reset all filters */
  reset: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMedusaSearch(
  options: UseMedusaSearchOptions = {}
): UseMedusaSearchResult {
  const {
    initialQuery = '',
    initialCategoryId,
    initialSort = 'relevance',
    initialPage = 1,
    pageSize: initialPageSize = 24,
    autoSearch = true,
  } = options;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQueryState] = useState(initialQuery);
  const [categoryId, setCategoryIdState] = useState<string | undefined>(initialCategoryId);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [sortBy, setSortByState] = useState<SortOption>(initialSort as SortOption);

  // Refs
  const searchClient = useRef(getMedusaSearchClient());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Convert sort option to API format
  const getSortParams = useCallback((sort: SortOption): { sort?: string; order?: 'asc' | 'desc' } => {
    switch (sort) {
      case 'price_asc':
        return { sort: 'price_min', order: 'asc' };
      case 'price_desc':
        return { sort: 'price_min', order: 'desc' };
      case 'name_asc':
        return { sort: 'title', order: 'asc' };
      case 'name_desc':
        return { sort: 'title', order: 'desc' };
      case 'newest':
        return { sort: 'created_at', order: 'desc' };
      case 'relevance':
      default:
        return {};
    }
  }, []);

  // Execute search
  const executeSearch = useCallback(
    async (searchQuery?: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const effectiveQuery = searchQuery !== undefined ? searchQuery : query;

      setIsLoading(true);
      setError(null);

      try {
        const sortParams = getSortParams(sortBy);
        const offset = (currentPage - 1) * pageSize;

        const response = await searchClient.current.searchProducts(effectiveQuery, {
          limit: pageSize,
          offset,
          category: categoryId,
          ...sortParams,
        });

        // Convert search results to Product type
        const adaptedProducts = response.hits.map(adaptSearchResultToProduct);
        setProducts(adaptedProducts);
        setTotalResults(response.total ?? response.hits.length);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        setError(err instanceof Error ? err : new Error('Search failed'));
        setProducts([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    },
    [query, categoryId, currentPage, pageSize, sortBy, getSortParams]
  );

  // Auto-search on mount and when dependencies change
  useEffect(() => {
    if (autoSearch) {
      executeSearch();
    }

    return () => {
      // Cleanup: abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [categoryId, currentPage, pageSize, sortBy, autoSearch, executeSearch]);

  // Setters with automatic search
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setCurrentPage(1); // Reset to first page on new query
  }, []);

  const setCategoryId = useCallback((newCategoryId: string | undefined) => {
    setCategoryIdState(newCategoryId);
    setCurrentPage(1); // Reset to first page on category change
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page on page size change
  }, []);

  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort);
    setCurrentPage(1); // Reset to first page on sort change
  }, []);

  const search = useCallback(
    async (searchQuery?: string) => {
      if (searchQuery !== undefined) {
        setQueryState(searchQuery);
        setCurrentPage(1);
      }
      await executeSearch(searchQuery);
    },
    [executeSearch]
  );

  const reset = useCallback(() => {
    setQueryState('');
    setCategoryIdState(initialCategoryId);
    setCurrentPage(1);
    setPageSizeState(initialPageSize);
    setSortByState('relevance');
    setProducts([]);
    setTotalResults(0);
  }, [initialCategoryId, initialPageSize]);

  return useMemo(
    () => ({
      products,
      totalResults,
      isLoading,
      error,
      query,
      categoryId,
      currentPage,
      pageSize,
      sortBy,
      setQuery,
      setCategoryId,
      setPage,
      setPageSize,
      setSortBy,
      search,
      reset,
    }),
    [
      products,
      totalResults,
      isLoading,
      error,
      query,
      categoryId,
      currentPage,
      pageSize,
      sortBy,
      setQuery,
      setCategoryId,
      setPage,
      setPageSize,
      setSortBy,
      search,
      reset,
    ]
  );
}

export default useMedusaSearch;
