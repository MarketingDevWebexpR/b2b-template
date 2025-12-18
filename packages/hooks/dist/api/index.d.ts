import React, { ReactNode } from 'react';

/**
 * Query Cache Context
 *
 * Provides SSR-safe request-scoped caching for API queries.
 * Prevents data leaking between requests in server-side rendering environments.
 */

/**
 * Cache entry structure
 */
interface CacheEntry<T = unknown> {
    data: T;
    timestamp: number;
}
/**
 * Query cache context value
 */
interface QueryCacheContextValue {
    /** Get data from cache if not stale */
    getFromCache: <T>(key: string, staleTime: number) => T | null;
    /** Check if cache entry exists and is within cache time */
    hasValidCache: (key: string, cacheTime: number) => boolean;
    /** Get cached data regardless of staleness */
    getCachedData: <T>(key: string) => T | null;
    /** Store data in cache */
    setInCache: <T>(key: string, data: T) => void;
    /** Invalidate a specific cache key */
    invalidate: (key: string) => void;
    /** Invalidate all cache entries matching a prefix */
    invalidateByPrefix: (prefix: string) => void;
    /** Clear all cache entries */
    invalidateAll: () => void;
}
/**
 * Props for QueryCacheProvider
 */
interface QueryCacheProviderProps {
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
declare function QueryCacheProvider({ children, }: QueryCacheProviderProps): React.ReactElement;
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
declare function useQueryCache(): QueryCacheContextValue;
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
declare function useInvalidateQueries(): {
    invalidate: (queryKey: unknown[]) => void;
    invalidateByPrefix: (prefix: string | unknown[]) => void;
    invalidateAll: () => void;
};
/**
 * Type for useInvalidateQueries return value
 */
type UseInvalidateQueriesResult = ReturnType<typeof useInvalidateQueries>;

/**
 * Generic API Query Hook
 *
 * Provides a reusable hook for fetching data with caching, loading states,
 * and error handling. Works with any async function.
 *
 * Uses React Context for SSR-safe request-scoped caching.
 */
/**
 * Options that can be passed to the query function
 */
interface QueryFnContext {
    /** AbortSignal for cancelling the request */
    signal: AbortSignal;
}
/**
 * Query state
 */
interface QueryState<T> {
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
interface UseApiQueryOptions<T> {
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
interface UseApiQueryResult<T> extends QueryState<T> {
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
declare function useApiQuery<T>(queryKey: unknown[], queryFn: (context?: QueryFnContext) => Promise<T>, options?: UseApiQueryOptions<T>): UseApiQueryResult<T>;
/**
 * Clear the query cache
 *
 * @deprecated Use useInvalidateQueries().invalidateAll() instead for SSR-safe cache clearing.
 * This function is kept for backward compatibility but only works with the context provider.
 */
declare function clearQueryCache(): void;
/**
 * Invalidate specific query keys
 *
 * @deprecated Use useInvalidateQueries().invalidate(queryKey) instead for SSR-safe cache invalidation.
 * This function is kept for backward compatibility but only works with the context provider.
 */
declare function invalidateQueries(_queryKey: unknown[]): void;

/**
 * Generic API Mutation Hook
 *
 * Provides a reusable hook for performing mutations (create, update, delete)
 * with loading states, error handling, and optimistic updates.
 */
/**
 * Mutation state
 */
interface MutationState<TData> {
    /** The result data */
    data: TData | null;
    /** Loading state */
    isLoading: boolean;
    /** Error if any */
    error: Error | null;
    /** Whether mutation was successful */
    isSuccess: boolean;
    /** Whether mutation resulted in error */
    isError: boolean;
}
/**
 * Mutation options
 */
interface UseApiMutationOptions<TData, TVariables> {
    /** On success callback */
    onSuccess?: (data: TData, variables: TVariables) => void;
    /** On error callback */
    onError?: (error: Error, variables: TVariables) => void;
    /** On settled callback (runs after success or error) */
    onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
    /** Query keys to invalidate on success */
    invalidateKeys?: unknown[][];
    /** Retry count (default: 0) */
    retryCount?: number;
}
/**
 * Mutation result
 */
interface UseApiMutationResult<TData, TVariables> extends MutationState<TData> {
    /** Execute the mutation */
    mutate: (variables: TVariables) => void;
    /** Execute the mutation and return a promise */
    mutateAsync: (variables: TVariables) => Promise<TData>;
    /** Reset the mutation state */
    reset: () => void;
}
/**
 * Generic API mutation hook
 *
 * @param mutationFn - Async function to perform the mutation
 * @param options - Mutation options
 * @returns Mutation result with mutate function and state
 *
 * @example
 * ```typescript
 * const { mutate, isLoading, error } = useApiMutation(
 *   (input) => api.cart.addItem(cartId, input),
 *   {
 *     onSuccess: () => toast.success('Item added!'),
 *     invalidateKeys: [['cart', cartId]]
 *   }
 * );
 *
 * // Usage
 * mutate({ productId: 'prod_123', quantity: 2 });
 * ```
 */
declare function useApiMutation<TData, TVariables = void>(mutationFn: (variables: TVariables) => Promise<TData>, options?: UseApiMutationOptions<TData, TVariables>): UseApiMutationResult<TData, TVariables>;

export { type CacheEntry, type MutationState, type QueryCacheContextValue, QueryCacheProvider, type QueryCacheProviderProps, type QueryFnContext, type QueryState, type UseApiMutationOptions, type UseApiMutationResult, type UseApiQueryOptions, type UseApiQueryResult, type UseInvalidateQueriesResult, clearQueryCache, invalidateQueries, useApiMutation, useApiQuery, useInvalidateQueries, useQueryCache };
