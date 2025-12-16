/**
 * Generic API Query Hook
 *
 * Provides a reusable hook for fetching data with caching, loading states,
 * and error handling. Works with any async function.
 */
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
 * @param queryFn - Async function to fetch data
 * @param options - Query options
 * @returns Query result with data, loading state, and refetch function
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useApiQuery(
 *   ["products", categoryId],
 *   () => api.products.list({ categoryId }),
 *   { staleTime: 60000 }
 * );
 * ```
 */
declare function useApiQuery<T>(queryKey: unknown[], queryFn: () => Promise<T>, options?: UseApiQueryOptions<T>): UseApiQueryResult<T>;
/**
 * Clear the query cache
 */
declare function clearQueryCache(): void;
/**
 * Invalidate specific query keys
 */
declare function invalidateQueries(queryKey: unknown[]): void;

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

export { type MutationState, type QueryState, type UseApiMutationOptions, type UseApiMutationResult, type UseApiQueryOptions, type UseApiQueryResult, clearQueryCache, invalidateQueries, useApiMutation, useApiQuery };
