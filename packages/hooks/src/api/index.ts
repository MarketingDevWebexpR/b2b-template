/**
 * API Hooks
 *
 * Generic hooks for fetching and mutating data.
 */

// Query Cache Context (SSR-safe)
export {
  QueryCacheProvider,
  useQueryCache,
  useInvalidateQueries,
  type QueryCacheContextValue,
  type QueryCacheProviderProps,
  type CacheEntry,
  type UseInvalidateQueriesResult,
} from "./QueryCacheContext";

// Query Hook
export {
  useApiQuery,
  clearQueryCache,
  invalidateQueries,
  type QueryFnContext,
  type QueryState,
  type UseApiQueryOptions,
  type UseApiQueryResult,
} from "./useApiQuery";

// Mutation Hook
export {
  useApiMutation,
  type MutationState,
  type UseApiMutationOptions,
  type UseApiMutationResult,
} from "./useApiMutation";
