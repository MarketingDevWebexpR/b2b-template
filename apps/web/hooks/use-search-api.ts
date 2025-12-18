'use client';

/**
 * Search API Hooks
 *
 * React hooks for interacting with the Medusa Search API.
 * Provides instant search, suggestions, and faceted filtering.
 *
 * @packageDocumentation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getMedusaSearchClient,
  type ProductSearchResult,
  type CategorySearchResult,
  type SearchOptions,
  type ProductSearchResponse,
  type MultiSearchResponse,
  type SuggestionsResponse,
} from '@/lib/search/medusa-search-client';

// ============================================================================
// Types
// ============================================================================

export interface UseInstantSearchOptions {
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Minimum query length */
  minQueryLength?: number;
  /** Default limit */
  defaultLimit?: number;
  /** Include facets by default */
  includeFacets?: boolean;
  /** Auto-search on mount with initial query */
  initialQuery?: string;
}

export interface UseInstantSearchResult {
  /** Search query */
  query: string;
  /** Set query (will trigger search after debounce) */
  setQuery: (query: string) => void;
  /** Product results */
  products: ProductSearchResult[];
  /** Category results */
  categories: CategorySearchResult[];
  /** Total product count */
  totalProducts: number;
  /** Total category count */
  totalCategories: number;
  /** Facet distribution */
  facetDistribution?: Record<string, Record<string, number>>;
  /** Is loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Processing time in ms */
  processingTimeMs: number;
  /** Execute search immediately */
  search: (query?: string, options?: SearchOptions) => Promise<void>;
  /** Clear results */
  clear: () => void;
  /** Current page */
  page: number;
  /** Set page */
  setPage: (page: number) => void;
  /** Total pages */
  totalPages: number;
}

export interface UseSuggestionsOptions {
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Minimum query length */
  minQueryLength?: number;
  /** Max suggestions */
  limit?: number;
}

export interface UseSuggestionsResult {
  /** Suggestions */
  suggestions: SuggestionsResponse['suggestions'];
  /** Is loading */
  isLoading: boolean;
  /** Get suggestions for query */
  getSuggestions: (query: string) => void;
  /** Clear suggestions */
  clear: () => void;
}

export interface UseProductSearchOptions extends Omit<SearchOptions, 'type'> {
  /** Debounce delay in ms */
  debounceMs?: number;
}

export interface UseProductSearchResult {
  /** Products */
  products: ProductSearchResult[];
  /** Total count */
  total: number;
  /** Is loading */
  isLoading: boolean;
  /** Error */
  error: string | null;
  /** Facet distribution */
  facetDistribution?: Record<string, Record<string, number>>;
  /** Processing time */
  processingTimeMs: number;
  /** Execute search */
  search: (query: string, options?: Omit<SearchOptions, 'type'>) => Promise<void>;
  /** Load more (pagination) */
  loadMore: () => Promise<void>;
  /** Has more results */
  hasMore: boolean;
  /** Clear results */
  clear: () => void;
}

// ============================================================================
// useInstantSearch Hook
// ============================================================================

/**
 * Hook for instant search with debouncing
 *
 * @example
 * ```tsx
 * const { query, setQuery, products, categories, isLoading } = useInstantSearch();
 *
 * return (
 *   <input
 *     value={query}
 *     onChange={(e) => setQuery(e.target.value)}
 *     placeholder="Search..."
 *   />
 * );
 * ```
 */
export function useInstantSearch(options: UseInstantSearchOptions = {}): UseInstantSearchResult {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    defaultLimit = 20,
    includeFacets = true,
    initialQuery = '',
  } = options;

  const [query, setQueryState] = useState(initialQuery);
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [categories, setCategories] = useState<CategorySearchResult[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [facetDistribution, setFacetDistribution] = useState<Record<string, Record<string, number>>>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTimeMs, setProcessingTimeMs] = useState(0);
  const [page, setPage] = useState(1);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const client = getMedusaSearchClient();

  const totalPages = Math.ceil(totalProducts / defaultLimit);

  const executeSearch = useCallback(
    async (searchQuery: string, searchOptions: SearchOptions = {}) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (searchQuery.length < minQueryLength) {
        setProducts([]);
        setCategories([]);
        setTotalProducts(0);
        setTotalCategories(0);
        setFacetDistribution(undefined);
        setError(null);
        return;
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const result = await client.search(searchQuery, {
          type: 'all',
          limit: searchOptions.limit ?? defaultLimit,
          offset: searchOptions.offset ?? 0,
          facets: searchOptions.facets ?? includeFacets,
          ...searchOptions,
        });

        if ('products' in result) {
          // MultiSearchResponse
          const multiResult = result as MultiSearchResponse;
          setProducts(multiResult.products.hits);
          setCategories(multiResult.categories.hits);
          setTotalProducts(multiResult.products.total);
          setTotalCategories(multiResult.categories.total);
          setProcessingTimeMs(
            multiResult.products.processingTimeMs + multiResult.categories.processingTimeMs
          );
        } else if (result.type === 'products') {
          // ProductSearchResponse
          const productResult = result as ProductSearchResponse;
          setProducts(productResult.hits);
          setCategories([]);
          setTotalProducts(productResult.total);
          setTotalCategories(0);
          setFacetDistribution(productResult.facetDistribution);
          setProcessingTimeMs(productResult.processingTimeMs);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          console.error('[useInstantSearch] Error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [client, defaultLimit, includeFacets, minQueryLength]
  );

  const search = useCallback(
    async (searchQuery?: string, searchOptions?: SearchOptions) => {
      const q = searchQuery ?? query;
      await executeSearch(q, searchOptions);
    },
    [query, executeSearch]
  );

  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery);
      setPage(1);

      // Debounce search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        executeSearch(newQuery);
      }, debounceMs);
    },
    [debounceMs, executeSearch]
  );

  const clear = useCallback(() => {
    setQueryState('');
    setProducts([]);
    setCategories([]);
    setTotalProducts(0);
    setTotalCategories(0);
    setFacetDistribution(undefined);
    setError(null);
    setPage(1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Handle page change
  useEffect(() => {
    if (query.length >= minQueryLength && page > 1) {
      executeSearch(query, { offset: (page - 1) * defaultLimit });
    }
  }, [page, query, minQueryLength, defaultLimit, executeSearch]);

  // Search on initial query
  useEffect(() => {
    if (initialQuery && initialQuery.length >= minQueryLength) {
      executeSearch(initialQuery);
    }
  }, [initialQuery, minQueryLength, executeSearch]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    products,
    categories,
    totalProducts,
    totalCategories,
    facetDistribution,
    isLoading,
    error,
    processingTimeMs,
    search,
    clear,
    page,
    setPage,
    totalPages,
  };
}

// ============================================================================
// useSuggestions Hook
// ============================================================================

/**
 * Hook for search suggestions (autocomplete)
 *
 * @example
 * ```tsx
 * const { suggestions, isLoading, getSuggestions, clear } = useSuggestions();
 *
 * const handleInputChange = (e) => {
 *   getSuggestions(e.target.value);
 * };
 * ```
 */
export function useSuggestions(options: UseSuggestionsOptions = {}): UseSuggestionsResult {
  const { debounceMs = 150, minQueryLength = 2, limit = 8 } = options;

  const [suggestions, setSuggestions] = useState<SuggestionsResponse['suggestions']>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const client = getMedusaSearchClient();

  const getSuggestions = useCallback(
    (query: string) => {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Clear for short queries
      if (query.length < minQueryLength) {
        setSuggestions([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);

        try {
          const result = await client.getSuggestions(query, limit);
          setSuggestions(result.suggestions);
        } catch (err) {
          console.error('[useSuggestions] Error:', err);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [client, debounceMs, limit, minQueryLength]
  );

  const clear = useCallback(() => {
    setSuggestions([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    getSuggestions,
    clear,
  };
}

// ============================================================================
// useProductSearch Hook
// ============================================================================

/**
 * Hook for product-only search with infinite loading
 *
 * @example
 * ```tsx
 * const { products, total, isLoading, search, loadMore, hasMore } = useProductSearch();
 *
 * useEffect(() => {
 *   search('ring', { category: 'jewelry' });
 * }, []);
 *
 * return (
 *   <div>
 *     {products.map(p => <ProductCard key={p.id} product={p} />)}
 *     {hasMore && <button onClick={loadMore}>Load More</button>}
 *   </div>
 * );
 * ```
 */
export function useProductSearch(options: UseProductSearchOptions = {}): UseProductSearchResult {
  const { debounceMs = 0, limit = 20, ...restOptions } = options;

  // Memoize default options to prevent callback recreation on every render
  const defaultOptionsRef = useRef(restOptions);
  // Update ref if options actually changed (deep compare)
  if (JSON.stringify(defaultOptionsRef.current) !== JSON.stringify(restOptions)) {
    defaultOptionsRef.current = restOptions;
  }

  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facetDistribution, setFacetDistribution] = useState<Record<string, Record<string, number>>>();
  const [processingTimeMs, setProcessingTimeMs] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);

  const lastQueryRef = useRef<string>('');
  const lastOptionsRef = useRef<SearchOptions>({});
  const client = getMedusaSearchClient();

  const hasMore = products.length < total;

  const search = useCallback(
    async (query: string, searchOptions: Omit<SearchOptions, 'type'> = {}) => {
      setIsLoading(true);
      setError(null);
      setCurrentOffset(0);

      const currentDefaults = defaultOptionsRef.current;
      lastQueryRef.current = query;
      lastOptionsRef.current = { ...currentDefaults, ...searchOptions };

      try {
        const result = await client.searchProducts(query, {
          limit,
          offset: 0,
          ...currentDefaults,
          ...searchOptions,
        });

        setProducts(result.hits);
        setTotal(result.total);
        setFacetDistribution(result.facetDistribution);
        setProcessingTimeMs(result.processingTimeMs);
        setCurrentOffset(result.hits.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        console.error('[useProductSearch] Error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [client, limit]
  );

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !lastQueryRef.current) return;

    setIsLoading(true);

    try {
      const result = await client.searchProducts(lastQueryRef.current, {
        limit,
        offset: currentOffset,
        ...lastOptionsRef.current,
      });

      setProducts((prev) => [...prev, ...result.hits]);
      setCurrentOffset((prev) => prev + result.hits.length);
      setProcessingTimeMs(result.processingTimeMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load more failed');
      console.error('[useProductSearch] LoadMore Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client, currentOffset, hasMore, isLoading, limit]);

  const clear = useCallback(() => {
    setProducts([]);
    setTotal(0);
    setError(null);
    setFacetDistribution(undefined);
    setCurrentOffset(0);
    lastQueryRef.current = '';
    lastOptionsRef.current = {};
  }, []);

  return {
    products,
    total,
    isLoading,
    error,
    facetDistribution,
    processingTimeMs,
    search,
    loadMore,
    hasMore,
    clear,
  };
}

// ============================================================================
// useSearchHealth Hook
// ============================================================================

/**
 * Hook to check search service health
 */
export function useSearchHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const client = getMedusaSearchClient();

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const healthy = await client.isHealthy();
      setIsHealthy(healthy);
    } catch {
      setIsHealthy(false);
    } finally {
      setIsChecking(false);
    }
  }, [client]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return { isHealthy, isChecking, checkHealth };
}

export default useInstantSearch;
