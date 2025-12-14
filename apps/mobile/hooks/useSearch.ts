/**
 * useSearch Hook
 *
 * Provides comprehensive search functionality for the jewelry e-commerce app.
 * Features:
 * - Debounced search input
 * - Results caching
 * - Pagination/infinite scroll support
 * - Filter state management
 * - Loading and error states
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Product } from '@bijoux/types';
import {
  api,
  type SearchParams,
  type SearchFilters,
  type SearchSortOption,
  type SearchResponse,
  type SearchSuggestion,
  type AvailableFilters,
} from '@/lib/api';

// ============================================
// Types
// ============================================

/**
 * Search state returned by the hook
 */
export interface SearchState {
  /** Current search query */
  readonly query: string;
  /** Search results */
  readonly results: readonly Product[];
  /** Total count of matching products */
  readonly totalCount: number;
  /** Current page number */
  readonly page: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Applied filters */
  readonly filters: SearchFilters;
  /** Current sort option */
  readonly sort: SearchSortOption;
  /** Available filter options based on results */
  readonly availableFilters: AvailableFilters;
  /** Auto-complete suggestions */
  readonly suggestions: readonly SearchSuggestion[];
  /** Whether a search is in progress */
  readonly isLoading: boolean;
  /** Whether suggestions are loading */
  readonly isSuggestionsLoading: boolean;
  /** Whether more results are being loaded */
  readonly isLoadingMore: boolean;
  /** Error message if search failed */
  readonly error: string | null;
  /** Whether there are more results to load */
  readonly hasMore: boolean;
  /** Whether any search has been performed */
  readonly hasSearched: boolean;
}

/**
 * Actions available from the hook
 */
export interface SearchActions {
  /** Update the search query (triggers debounced search) */
  setQuery: (query: string) => void;
  /** Execute search immediately with current query */
  search: () => Promise<void>;
  /** Update filters (triggers new search) */
  setFilters: (filters: SearchFilters) => void;
  /** Update a single filter */
  updateFilter: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Update sort option (triggers new search) */
  setSort: (sort: SearchSortOption) => void;
  /** Load more results (pagination) */
  loadMore: () => Promise<void>;
  /** Reset search to initial state */
  reset: () => void;
  /** Get suggestions for current query */
  fetchSuggestions: () => Promise<void>;
  /** Clear suggestions */
  clearSuggestions: () => void;
}

/**
 * Configuration options for useSearch
 */
export interface UseSearchOptions {
  /** Debounce delay in milliseconds (default: 300) */
  readonly debounceMs?: number;
  /** Number of results per page (default: 20) */
  readonly pageSize?: number;
  /** Whether to fetch suggestions as user types (default: true) */
  readonly enableSuggestions?: boolean;
  /** Minimum query length to trigger search (default: 2) */
  readonly minQueryLength?: number;
  /** Initial filters to apply */
  readonly initialFilters?: SearchFilters;
  /** Initial sort option (default: 'relevance') */
  readonly initialSort?: SearchSortOption;
  /** Cache TTL in milliseconds (default: 60000 = 1 minute) */
  readonly cacheTtl?: number;
  /** Callback when search completes */
  readonly onSearchComplete?: (response: SearchResponse) => void;
  /** Callback when error occurs */
  readonly onError?: (error: Error) => void;
}

// ============================================
// Cache Implementation
// ============================================

interface CacheEntry {
  readonly response: SearchResponse;
  readonly timestamp: number;
}

/**
 * Simple in-memory cache for search results
 */
class SearchCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttl: number;

  constructor(ttl: number = 60000) {
    this.ttl = ttl;
  }

  /**
   * Generate cache key from search parameters
   */
  private generateKey(params: SearchParams): string {
    return JSON.stringify({
      query: params.query,
      filters: params.filters,
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize,
    });
  }

  /**
   * Get cached response if valid
   */
  get(params: SearchParams): SearchResponse | null {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  /**
   * Store response in cache
   */
  set(params: SearchParams, response: SearchResponse): void {
    const key = this.generateKey(params);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });

    // Cleanup old entries (keep max 50)
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }
}

// ============================================
// Debounce Helper
// ============================================

/**
 * Creates a debounced version of a function
 */
function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

// ============================================
// Initial State
// ============================================

const INITIAL_AVAILABLE_FILTERS: AvailableFilters = {
  categories: [],
  collections: [],
  materials: [],
  brands: [],
  priceRange: {},
};

// ============================================
// Hook Implementation
// ============================================

/**
 * Custom hook for managing search state and operations.
 *
 * @param options - Configuration options
 * @returns Search state and actions
 *
 * @example
 * ```tsx
 * const { state, actions } = useSearch({
 *   debounceMs: 300,
 *   pageSize: 20,
 * });
 *
 * // Update query (debounced)
 * actions.setQuery('gold ring');
 *
 * // Apply filters
 * actions.setFilters({
 *   priceRange: { min: 100, max: 1000 },
 *   categories: ['rings'],
 * });
 *
 * // Load more results
 * if (state.hasMore) {
 *   await actions.loadMore();
 * }
 * ```
 */
export function useSearch(options: UseSearchOptions = {}): {
  state: SearchState;
  actions: SearchActions;
} {
  const {
    debounceMs = 300,
    pageSize = 20,
    enableSuggestions = true,
    minQueryLength = 2,
    initialFilters = {},
    initialSort = 'relevance',
    cacheTtl = 60000,
    onSearchComplete,
    onError,
  } = options;

  // Initialize cache
  const cacheRef = useRef(new SearchCache(cacheTtl));

  // State
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<readonly Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters);
  const [sort, setSortState] = useState<SearchSortOption>(initialSort);
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>(
    INITIAL_AVAILABLE_FILTERS
  );
  const [suggestions, setSuggestions] = useState<readonly SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Refs for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const suggestionsAbortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount - abort any pending requests to prevent memory leaks
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (suggestionsAbortRef.current) {
        suggestionsAbortRef.current.abort();
      }
    };
  }, []);

  // Computed values
  const hasMore = useMemo(() => page < totalPages, [page, totalPages]);

  /**
   * Execute search with given parameters
   */
  const executeSearch = useCallback(
    async (searchParams: SearchParams, append: boolean = false) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Check cache first (only for non-append requests)
      if (!append) {
        const cached = cacheRef.current.get(searchParams);
        if (cached) {
          setResults(cached.products);
          setTotalCount(cached.totalCount);
          setPage(cached.page);
          setTotalPages(cached.totalPages);
          setAvailableFilters(cached.availableFilters);
          setHasSearched(true);
          onSearchComplete?.(cached);
          return;
        }
      }

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const response = await api.searchProducts(searchParams);

        // Cache the response
        cacheRef.current.set(searchParams, response);

        if (append) {
          setResults((prev) => [...prev, ...response.products]);
        } else {
          setResults(response.products);
        }

        setTotalCount(response.totalCount);
        setPage(response.page);
        setTotalPages(response.totalPages);
        setAvailableFilters(response.availableFilters);
        setHasSearched(true);

        onSearchComplete?.(response);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore aborted requests
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [onSearchComplete, onError]
  );

  /**
   * Fetch suggestions for current query
   */
  const fetchSuggestions = useCallback(async () => {
    if (!enableSuggestions || query.length < minQueryLength) {
      setSuggestions([]);
      return;
    }

    // Cancel any pending suggestions request
    if (suggestionsAbortRef.current) {
      suggestionsAbortRef.current.abort();
    }
    suggestionsAbortRef.current = new AbortController();

    try {
      setIsSuggestionsLoading(true);
      const newSuggestions = await api.getSearchSuggestions(query);
      setSuggestions(newSuggestions);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Silently fail for suggestions
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, [query, enableSuggestions, minQueryLength]);

  /**
   * Debounced search execution
   */
  const debouncedSearch = useDebouncedCallback(() => {
    if (query.length >= minQueryLength) {
      executeSearch({
        query,
        filters,
        sort,
        page: 1,
        pageSize,
      });
    } else if (query.length === 0) {
      // Clear results when query is empty
      setResults([]);
      setTotalCount(0);
      setPage(1);
      setTotalPages(0);
      setAvailableFilters(INITIAL_AVAILABLE_FILTERS);
    }
  }, debounceMs);

  /**
   * Debounced suggestions fetch
   */
  const debouncedSuggestions = useDebouncedCallback(() => {
    fetchSuggestions();
  }, Math.max(100, debounceMs - 100));

  // Trigger debounced search when query changes
  useEffect(() => {
    debouncedSearch();
  }, [query, debouncedSearch]);

  // Trigger debounced suggestions when query changes
  useEffect(() => {
    if (enableSuggestions) {
      debouncedSuggestions();
    }
  }, [query, enableSuggestions, debouncedSuggestions]);

  // Re-search when filters or sort change
  useEffect(() => {
    if (hasSearched && query.length >= minQueryLength) {
      executeSearch({
        query,
        filters,
        sort,
        page: 1,
        pageSize,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  // ============================================
  // Actions
  // ============================================

  const actions: SearchActions = useMemo(
    () => ({
      setQuery: (newQuery: string) => {
        setQueryState(newQuery);
        setPage(1); // Reset page when query changes
      },

      search: async () => {
        if (query.length >= minQueryLength) {
          await executeSearch({
            query,
            filters,
            sort,
            page: 1,
            pageSize,
          });
        }
      },

      setFilters: (newFilters: SearchFilters) => {
        setFiltersState(newFilters);
        setPage(1); // Reset page when filters change
      },

      updateFilter: <K extends keyof SearchFilters>(
        key: K,
        value: SearchFilters[K]
      ) => {
        setFiltersState((prev) => ({
          ...prev,
          [key]: value,
        }));
        setPage(1);
      },

      clearFilters: () => {
        setFiltersState({});
        setPage(1);
      },

      setSort: (newSort: SearchSortOption) => {
        setSortState(newSort);
        setPage(1); // Reset page when sort changes
      },

      loadMore: async () => {
        if (!hasMore || isLoadingMore || isLoading) {
          return;
        }

        await executeSearch(
          {
            query,
            filters,
            sort,
            page: page + 1,
            pageSize,
          },
          true // append results
        );
      },

      reset: () => {
        setQueryState('');
        setResults([]);
        setTotalCount(0);
        setPage(1);
        setTotalPages(0);
        setFiltersState(initialFilters);
        setSortState(initialSort);
        setAvailableFilters(INITIAL_AVAILABLE_FILTERS);
        setSuggestions([]);
        setError(null);
        setHasSearched(false);
        cacheRef.current.clear();
      },

      fetchSuggestions,

      clearSuggestions: () => {
        setSuggestions([]);
      },
    }),
    [
      query,
      filters,
      sort,
      page,
      pageSize,
      hasMore,
      isLoadingMore,
      isLoading,
      initialFilters,
      initialSort,
      minQueryLength,
      executeSearch,
      fetchSuggestions,
    ]
  );

  // Construct state object
  const state: SearchState = useMemo(
    () => ({
      query,
      results,
      totalCount,
      page,
      totalPages,
      filters,
      sort,
      availableFilters,
      suggestions,
      isLoading,
      isSuggestionsLoading,
      isLoadingMore,
      error,
      hasMore,
      hasSearched,
    }),
    [
      query,
      results,
      totalCount,
      page,
      totalPages,
      filters,
      sort,
      availableFilters,
      suggestions,
      isLoading,
      isSuggestionsLoading,
      isLoadingMore,
      error,
      hasMore,
      hasSearched,
    ]
  );

  return { state, actions };
}

// ============================================
// Additional Hooks
// ============================================

/**
 * Hook for barcode scanning search.
 *
 * @returns Barcode search state and actions
 *
 * @example
 * ```tsx
 * const { product, isLoading, scan } = useBarcodeSearch();
 *
 * // When barcode is scanned
 * const foundProduct = await scan('1234567890123');
 * if (foundProduct) {
 *   navigation.navigate('Product', { id: foundProduct.id });
 * }
 * ```
 */
export function useBarcodeSearch(): {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  scan: (barcode: string) => Promise<Product | null>;
  clear: () => void;
} {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (barcode: string): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    setProduct(null);

    try {
      const foundProduct = await api.getProductByBarcode(barcode);
      setProduct(foundProduct);

      if (!foundProduct) {
        setError('Produit non trouvé');
      }

      return foundProduct;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setProduct(null);
    setError(null);
  }, []);

  return { product, isLoading, error, scan, clear };
}

/**
 * Hook for popular searches.
 *
 * @returns Popular searches data and loading state
 */
export function usePopularSearches(): {
  searches: readonly { query: string; searchCount: number }[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [searches, setSearches] = useState<
    readonly { query: string; searchCount: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const popularSearches = await api.getPopularSearches();
      setSearches(popularSearches);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load popular searches';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { searches, isLoading, error, refresh };
}

export default useSearch;
