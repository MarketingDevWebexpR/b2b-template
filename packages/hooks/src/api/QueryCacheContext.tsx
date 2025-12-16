/**
 * Query Cache Context
 *
 * Provides SSR-safe request-scoped caching for API queries.
 * Prevents data leaking between requests in server-side rendering environments.
 */

import React, {
  createContext,
  useContext,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Cache entry structure
 */
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

/**
 * Query cache context value
 */
export interface QueryCacheContextValue {
  /** Get data from cache if not stale */
  getFromCache: <T,>(key: string, staleTime: number) => T | null;
  /** Check if cache entry exists and is within cache time */
  hasValidCache: (key: string, cacheTime: number) => boolean;
  /** Get cached data regardless of staleness */
  getCachedData: <T,>(key: string) => T | null;
  /** Store data in cache */
  setInCache: <T,>(key: string, data: T) => void;
  /** Invalidate a specific cache key */
  invalidate: (key: string) => void;
  /** Invalidate all cache entries matching a prefix */
  invalidateByPrefix: (prefix: string) => void;
  /** Clear all cache entries */
  invalidateAll: () => void;
}

const QueryCacheContext = createContext<QueryCacheContextValue | null>(null);

/**
 * Client-side fallback cache (only used when provider is not mounted)
 * This is safe because it's only used on the client side
 */
let clientFallbackCache: Map<string, CacheEntry> | null = null;

function getClientFallbackCache(): Map<string, CacheEntry> {
  if (!clientFallbackCache) {
    clientFallbackCache = new Map();
  }
  return clientFallbackCache;
}

/**
 * Create cache operations for a given Map instance
 */
function createCacheOperations(
  cacheRef: React.MutableRefObject<Map<string, CacheEntry>>
): QueryCacheContextValue {
  const getFromCache = function <T,>(key: string, staleTime: number): T | null {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      return cached.data as T;
    }
    return null;
  };

  const hasValidCache = function (key: string, cacheTime: number): boolean {
    const cached = cacheRef.current.get(key);
    return cached !== undefined && Date.now() - cached.timestamp < cacheTime;
  };

  const getCachedData = function <T,>(key: string): T | null {
    const cached = cacheRef.current.get(key);
    return cached ? (cached.data as T) : null;
  };

  const setInCache = function <T,>(key: string, data: T): void {
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  };

  const invalidate = function (key: string): void {
    cacheRef.current.delete(key);
  };

  const invalidateByPrefix = function (prefix: string): void {
    const keysToDelete: string[] = [];
    cacheRef.current.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => cacheRef.current.delete(key));
  };

  const invalidateAll = function (): void {
    cacheRef.current.clear();
  };

  return {
    getFromCache,
    hasValidCache,
    getCachedData,
    setInCache,
    invalidate,
    invalidateByPrefix,
    invalidateAll,
  };
}

/**
 * Props for QueryCacheProvider
 */
export interface QueryCacheProviderProps {
  children: ReactNode;
}

/**
 * Query Cache Provider
 *
 * Wraps your application to provide request-scoped caching.
 * Must be used in SSR environments to prevent data leaking between requests.
 *
 * @example
 * ```tsx
 * // In your app layout or _app.tsx
 * import { QueryCacheProvider } from '@maison/hooks';
 *
 * export default function App({ children }) {
 *   return (
 *     <QueryCacheProvider>
 *       {children}
 *     </QueryCacheProvider>
 *   );
 * }
 * ```
 */
export function QueryCacheProvider({
  children,
}: QueryCacheProviderProps): React.ReactElement {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const value = useMemo<QueryCacheContextValue>(
    () => createCacheOperations(cacheRef),
    []
  );

  return (
    <QueryCacheContext.Provider value={value}>
      {children}
    </QueryCacheContext.Provider>
  );
}

/**
 * Hook to access the query cache
 *
 * Returns cache operations that are safe for SSR.
 * Falls back to a client-side cache if provider is not mounted (for testing or client-only apps).
 *
 * @throws Error if used in SSR without QueryCacheProvider
 *
 * @example
 * ```tsx
 * const { getFromCache, setInCache, invalidate } = useQueryCache();
 * ```
 */
export function useQueryCache(): QueryCacheContextValue {
  const context = useContext(QueryCacheContext);

  // Create a stable fallback ref for client-side usage without provider
  const fallbackRef = useRef<Map<string, CacheEntry> | null>(null);

  const fallbackValue = useMemo<QueryCacheContextValue | null>(() => {
    // Only create fallback on client side
    if (typeof window === "undefined") {
      return null;
    }

    if (!fallbackRef.current) {
      fallbackRef.current = getClientFallbackCache();
    }

    return createCacheOperations(
      fallbackRef as React.MutableRefObject<Map<string, CacheEntry>>
    );
  }, []);

  if (context) {
    return context;
  }

  // In SSR without provider, throw error to prevent data leaking
  if (typeof window === "undefined") {
    throw new Error(
      "QueryCacheProvider is required for SSR. " +
        "Wrap your application with <QueryCacheProvider> to enable request-scoped caching."
    );
  }

  // On client without provider, use fallback (for tests or simple client-only apps)
  if (fallbackValue) {
    return fallbackValue;
  }

  // This should never happen, but TypeScript needs it
  throw new Error("Failed to initialize query cache");
}

/**
 * Hook to invalidate queries
 *
 * Provides convenient methods to invalidate cached queries.
 *
 * @example
 * ```tsx
 * const { invalidate, invalidateByPrefix, invalidateAll } = useInvalidateQueries();
 *
 * // Invalidate a specific query
 * invalidate(['products', 'list']);
 *
 * // Invalidate all queries starting with 'products'
 * invalidateByPrefix('products');
 *
 * // Clear all cache
 * invalidateAll();
 * ```
 */
export function useInvalidateQueries() {
  const cache = useQueryCache();

  const invalidate = useCallback(
    (queryKey: unknown[]): void => {
      const cacheKey = JSON.stringify(queryKey);
      cache.invalidate(cacheKey);
    },
    [cache]
  );

  const invalidateByPrefix = useCallback(
    (prefix: string | unknown[]): void => {
      const prefixStr =
        typeof prefix === "string" ? prefix : JSON.stringify(prefix);
      // Remove the trailing bracket to match partial keys
      const normalizedPrefix = prefixStr.endsWith("]")
        ? prefixStr.slice(0, -1)
        : prefixStr;
      cache.invalidateByPrefix(normalizedPrefix);
    },
    [cache]
  );

  const invalidateAll = useCallback((): void => {
    cache.invalidateAll();
  }, [cache]);

  return {
    invalidate,
    invalidateByPrefix,
    invalidateAll,
  };
}

/**
 * Type for useInvalidateQueries return value
 */
export type UseInvalidateQueriesResult = ReturnType<typeof useInvalidateQueries>;
