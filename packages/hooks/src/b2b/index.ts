/**
 * B2B Hooks
 *
 * React hooks for B2B e-commerce functionality.
 */

export {
  useCompany,
  type CompanyState,
  type UseCompanyOptions,
  type UseCompanyResult,
  type B2BAction,
} from "./useCompany";

export {
  useQuotes,
  type QuoteFilters,
  type CreateQuoteInput,
  type RespondToQuoteInput,
  type UseQuotesResult,
} from "./useQuotes";

export {
  useApprovals,
  type Approval,
  type ApprovalType,
  type ApprovalFilters,
  type ApprovalDecisionInput,
  type UseApprovalsResult,
  type RequestApprovalInput,
} from "./useApprovals";

export {
  useSpendingLimits,
  type SpendingSummary,
  type UseSpendingLimitsResult,
  type SpendingHistoryEntry,
} from "./useSpendingLimits";
