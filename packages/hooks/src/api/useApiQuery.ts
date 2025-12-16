/**
 * Generic API Query Hook
 *
 * Provides a reusable hook for fetching data with caching, loading states,
 * and error handling. Works with any async function.
 *
 * Uses React Context for SSR-safe request-scoped caching.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryCache, useInvalidateQueries } from "./QueryCacheContext";

/**
 * Options that can be passed to the query function
 */
export interface QueryFnContext {
  /** AbortSignal for cancelling the request */
  signal: AbortSignal;
}

/**
 * Query state
 */
export interface QueryState<T> {
  /** The fetched data */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Whether data has been fetched at least once */
  isSuccess: boolean;
  /** Whether the query is currently fetching (includes refetches) */
  isFetching: boolean;
}

/**
 * Query options
 */
export interface UseApiQueryOptions<T> {
  /** Whether to enable the query */
  enabled?: boolean;
  /** Initial data */
  initialData?: T;
  /** Stale time in ms (default: 0 - always stale) */
  staleTime?: number;
  /** Cache time in ms (default: 5 minutes) */
  cacheTime?: number;
  /** Retry count (default: 3) */
  retryCount?: number;
  /** Retry delay in ms (default: 1000) */
  retryDelay?: number;
  /** On success callback */
  onSuccess?: (data: T) => void;
  /** On error callback */
  onError?: (error: Error) => void;
  /** Refetch on window focus (default: false) */
  refetchOnWindowFocus?: boolean;
}

/**
 * Query result
 */
export interface UseApiQueryResult<T> extends QueryState<T> {
  /** Manually refetch the data */
  refetch: () => Promise<void>;
  /** Reset the query state */
  reset: () => void;
}

/**
 * Generic API query hook
 *
 * @param queryKey - Unique key for the query (used for caching)
 * @param queryFn - Async function to fetch data (optionally receives context with abort signal)
 * @param options - Query options
 * @returns Query result with data, loading state, and refetch function
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useApiQuery(
 *   ["products", categoryId],
 *   ({ signal }) => api.products.list({ categoryId }, { signal }),
 *   { staleTime: 60000 }
 * );
 * ```
 */
export function useApiQuery<T>(
  queryKey: unknown[],
  queryFn: (context?: QueryFnContext) => Promise<T>,
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const {
    enabled = true,
    initialData,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    refetchOnWindowFocus = false,
  } = options;

  const cache = useQueryCache();
  const cacheKey = JSON.stringify(queryKey);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const [state, setState] = useState<QueryState<T>>(() => {
    // Check cache first
    if (cache.hasValidCache(cacheKey, cacheTime)) {
      const cachedData = cache.getCachedData<T>(cacheKey);
      if (cachedData !== null) {
        return {
          data: cachedData,
          isLoading: false,
          error: null,
          isSuccess: true,
          isFetching: false,
        };
      }
    }

    return {
      data: initialData ?? null,
      isLoading: enabled,
      error: null,
      isSuccess: false,
      isFetching: enabled,
    };
  });

  const fetchData = useCallback(
    async (isRefetch = false) => {
      if (!isRefetch) {
        // Check if cached data is still fresh
        const cachedData = cache.getFromCache<T>(cacheKey, staleTime);
        if (cachedData !== null) {
          setState((prev) => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            isSuccess: true,
            isFetching: false,
          }));
          return;
        }
      }

      // Cancel any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Abort any in-flight request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setState((prev) => ({
        ...prev,
        isLoading: !prev.data,
        isFetching: true,
        error: null,
      }));

      try {
        const data = await queryFn({ signal });

        // Check if component is still mounted and request wasn't aborted
        if (!isMountedRef.current || signal.aborted) return;

        // Update cache
        cache.setInCache(cacheKey, data);

        setState({
          data,
          isLoading: false,
          error: null,
          isSuccess: true,
          isFetching: false,
        });

        retryCountRef.current = 0;
        onSuccess?.(data);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        // Check if component is still mounted
        if (!isMountedRef.current) return;

        const error = err instanceof Error ? err : new Error(String(err));

        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          retryTimeoutRef.current = setTimeout(
            () => fetchData(isRefetch),
            retryDelay * retryCountRef.current
          );
          return;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
          isFetching: false,
        }));

        retryCountRef.current = 0;
        onError?.(error);
      }
    },
    [cacheKey, queryFn, staleTime, retryCount, retryDelay, onSuccess, onError, cache]
  );

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData(true);
  }, [fetchData]);

  const reset = useCallback(() => {
    cache.invalidate(cacheKey);
    setState({
      data: initialData ?? null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isFetching: false,
    });
  }, [cacheKey, initialData, cache]);

  // Track mounted state and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      // Cleanup: cancel any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Cleanup: abort any in-flight request
      abortControllerRef.current?.abort();
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch on window focus (with SSR check)
  useEffect(() => {
    // SSR safety: check if window is available
    if (!refetchOnWindowFocus || !enabled || typeof window === "undefined") {
      return;
    }

    const handleFocus = () => {
      const cachedData = cache.getFromCache<T>(cacheKey, staleTime);
      if (cachedData === null) {
        fetchData(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnWindowFocus, enabled, cacheKey, staleTime, fetchData, cache]);

  return {
    ...state,
    refetch,
    reset,
  };
}

/**
 * Clear the query cache
 *
 * @deprecated Use useInvalidateQueries().invalidateAll() instead for SSR-safe cache clearing.
 * This function is kept for backward compatibility but only works with the context provider.
 */
export function clearQueryCache(): void {
  // This is a no-op now - use useInvalidateQueries hook instead
  console.warn(
    "clearQueryCache() is deprecated. Use useInvalidateQueries().invalidateAll() instead."
  );
}

/**
 * Invalidate specific query keys
 *
 * @deprecated Use useInvalidateQueries().invalidate(queryKey) instead for SSR-safe cache invalidation.
 * This function is kept for backward compatibility but only works with the context provider.
 */
export function invalidateQueries(_queryKey: unknown[]): void {
  // This is a no-op now - use useInvalidateQueries hook instead
  console.warn(
    "invalidateQueries() is deprecated. Use useInvalidateQueries().invalidate(queryKey) instead."
  );
}

// Re-export cache context utilities
export { useInvalidateQueries } from "./QueryCacheContext";
