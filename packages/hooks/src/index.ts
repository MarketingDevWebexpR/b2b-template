/**
 * @maison/hooks
 *
 * Shared React hooks for B2B e-commerce applications.
 * Platform-agnostic hooks that work with web and mobile.
 */

// Re-export API hooks
export {
  // Query Cache Context (SSR-safe)
  QueryCacheProvider,
  useQueryCache,
  useInvalidateQueries,
  type QueryCacheContextValue,
  type QueryCacheProviderProps,
  type CacheEntry,
  type UseInvalidateQueriesResult,
  // Query Hook
  useApiQuery,
  clearQueryCache,
  invalidateQueries,
  type QueryFnContext,
  type QueryState,
  type UseApiQueryOptions,
  type UseApiQueryResult,
  // Mutation Hook
  useApiMutation,
  type MutationState,
  type UseApiMutationOptions,
  type UseApiMutationResult,
} from "./api";

// Re-export B2B hooks
export {
  useCompany,
  type CompanyState,
  type UseCompanyOptions,
  type UseCompanyResult,
  type B2BAction,
  useQuotes,
  type QuoteFilters,
  type CreateQuoteInput,
  type RespondToQuoteInput,
  type UseQuotesResult,
  useApprovals,
  type Approval,
  type ApprovalType,
  type ApprovalFilters,
  type ApprovalDecisionInput,
  type UseApprovalsResult,
  type RequestApprovalInput,
  useSpendingLimits,
  type SpendingSummary,
  type UseSpendingLimitsResult,
  type SpendingHistoryEntry,
} from "./b2b";

// Re-export cart hooks
export {
  useCart,
  type CartItemWithId,
  type ExtendedCart,
  type CartUpdateInput,
  type UseCartOptions,
  type UseCartResult,
  useBulkCart,
  type BulkItemInput,
  type CSVImportResult,
  type UseBulkCartOptions,
  type UseBulkCartResult,
} from "./cart";

// Re-export utility hooks
export {
  useStorage,
  useSessionStorage,
  setStorageAdapter,
  type StorageAdapter,
  type UseStorageOptions,
  type UseStorageResult,
} from "./utils";
