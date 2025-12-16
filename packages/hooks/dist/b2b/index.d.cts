import { Company, Employee, QuoteStatus, Quote, ApprovalStatus, ApprovalEntityType, ApprovalRequest, SpendingLimit, SpendingPeriod } from '@maison/types';

/**
 * Company Hook
 *
 * Provides access to the current B2B company context and company data.
 */

/**
 * Company state
 */
interface CompanyState {
    /** Current company */
    company: Company | null;
    /** Current employee */
    employee: Employee | null;
    /** Loading state */
    isLoading: boolean;
    /** Error if any */
    error: Error | null;
    /** Whether B2B context is active */
    isB2BActive: boolean;
}
/**
 * Company hook options
 */
interface UseCompanyOptions {
    /** Company ID to fetch (optional, uses context if not provided) */
    companyId?: string;
    /** Whether to fetch employees */
    includeEmployees?: boolean;
    /** Auto-refresh interval in ms */
    refreshInterval?: number;
}
/**
 * Company hook result
 */
interface UseCompanyResult extends CompanyState {
    /** Set the active company */
    setCompany: (companyId: string) => Promise<void>;
    /** Clear the company context */
    clearCompany: () => void;
    /** Refresh company data */
    refresh: () => Promise<void>;
    /** List employees (if B2B enabled) */
    employees: Employee[];
    /** Check if current user can perform an action */
    canPerform: (action: B2BAction) => boolean;
}
/**
 * B2B actions that can be checked for permissions
 */
type B2BAction = "create_quote" | "approve_order" | "manage_employees" | "view_spending" | "edit_company" | "place_order";
/**
 * Hook for managing B2B company context
 *
 * @param api - API client instance
 * @param options - Hook options
 * @returns Company state and actions
 *
 * @example
 * ```typescript
 * const { company, employee, isB2BActive, setCompany, canPerform } = useCompany(api);
 *
 * if (isB2BActive && canPerform('create_quote')) {
 *   // Show quote creation UI
 * }
 * ```
 */
declare function useCompany(api: any, // ICommerceClient - using any to avoid circular dep
options?: UseCompanyOptions): UseCompanyResult;

/**
 * Quotes Hook
 *
 * Provides access to B2B quote management functionality.
 */

/**
 * Quote filter options
 */
interface QuoteFilters {
    /** Filter by status */
    status?: QuoteStatus | QuoteStatus[];
    /** Filter by company ID */
    companyId?: string;
    /** Filter quotes after this date */
    createdAfter?: string;
    /** Filter quotes before this date */
    createdBefore?: string;
    /** Search by quote number or product */
    search?: string;
}
/**
 * Quote creation input
 */
interface CreateQuoteInput {
    /** Cart ID to create quote from */
    cartId: string;
    /** Quote notes */
    notes?: string;
    /** Requested delivery date */
    requestedDeliveryDate?: string;
    /** PO number */
    purchaseOrderNumber?: string;
}
/**
 * Quote response input
 */
interface RespondToQuoteInput {
    /** Response message */
    message?: string;
    /** Adjusted prices per item */
    priceAdjustments?: Array<{
        itemId: string;
        newPrice: number;
    }>;
    /** Validity period in days */
    validityDays?: number;
}
/**
 * Quotes hook result
 */
interface UseQuotesResult {
    /** List of quotes */
    quotes: Quote[];
    /** Loading state */
    isLoading: boolean;
    /** Error if any */
    error: Error | null;
    /** Fetch quotes */
    fetchQuotes: (filters?: QuoteFilters) => void;
    /** Get a single quote */
    getQuote: (quoteId: string) => Promise<Quote>;
    /** Create quote from cart */
    createFromCart: (input: CreateQuoteInput) => Promise<Quote>;
    /** Submit quote for review */
    submitQuote: (quoteId: string) => Promise<Quote>;
    /** Accept a quote */
    acceptQuote: (quoteId: string) => Promise<Quote>;
    /** Reject a quote */
    rejectQuote: (quoteId: string, reason?: string) => Promise<Quote>;
    /** Respond to quote (for admin/sales) */
    respondToQuote: (quoteId: string, input: RespondToQuoteInput) => Promise<Quote>;
    /** Convert quote to order */
    convertToOrder: (quoteId: string) => Promise<{
        orderId: string;
    }>;
    /** Delete draft quote */
    deleteQuote: (quoteId: string) => Promise<void>;
    /** Current filters */
    filters: QuoteFilters;
    /** Set filters */
    setFilters: (filters: QuoteFilters) => void;
    /** Refresh quotes */
    refresh: () => void;
}
/**
 * Hook for managing B2B quotes
 *
 * @param api - API client instance
 * @param initialFilters - Initial filter values
 * @returns Quotes state and actions
 *
 * @example
 * ```typescript
 * const {
 *   quotes,
 *   isLoading,
 *   createFromCart,
 *   acceptQuote,
 *   setFilters
 * } = useQuotes(api, { status: 'pending' });
 *
 * // Create quote from cart
 * await createFromCart({ cartId: 'cart_123', notes: 'Urgent order' });
 *
 * // Filter by status
 * setFilters({ status: 'responded' });
 * ```
 */
declare function useQuotes(api: any, // ICommerceClient
initialFilters?: QuoteFilters): UseQuotesResult;

/**
 * Approvals Hook
 *
 * Provides access to B2B approval workflow management.
 */

/**
 * Alias for ApprovalRequest for easier usage
 */
type Approval = ApprovalRequest;
/**
 * Alias for ApprovalEntityType for easier usage
 */
type ApprovalType = ApprovalEntityType;
/**
 * Approval filter options
 */
interface ApprovalFilters {
    /** Filter by status */
    status?: ApprovalStatus | ApprovalStatus[];
    /** Filter by type */
    type?: ApprovalType;
    /** Filter by company ID */
    companyId?: string;
    /** Filter by requester ID */
    requesterId?: string;
    /** Only show my pending approvals */
    pendingForMe?: boolean;
}
/**
 * Approval decision input
 */
interface ApprovalDecisionInput {
    /** Whether to approve */
    approved: boolean;
    /** Decision comment */
    comment?: string;
    /** Forward to another approver */
    forwardTo?: string;
}
/**
 * Approvals hook result
 */
interface UseApprovalsResult {
    /** List of approvals */
    approvals: Approval[];
    /** Pending approvals count */
    pendingCount: number;
    /** Loading state */
    isLoading: boolean;
    /** Error if any */
    error: Error | null;
    /** Get approval details */
    getApproval: (approvalId: string) => Promise<Approval>;
    /** Approve a request */
    approve: (approvalId: string, comment?: string) => Promise<Approval>;
    /** Reject a request */
    reject: (approvalId: string, comment?: string) => Promise<Approval>;
    /** Forward approval to another person */
    forward: (approvalId: string, toEmployeeId: string, comment?: string) => Promise<Approval>;
    /** Request approval (for order/quote) */
    requestApproval: (input: RequestApprovalInput) => Promise<Approval>;
    /** Current filters */
    filters: ApprovalFilters;
    /** Set filters */
    setFilters: (filters: ApprovalFilters) => void;
    /** Refresh approvals */
    refresh: () => void;
}
/**
 * Request approval input
 */
interface RequestApprovalInput {
    /** Type of approval */
    type: ApprovalType;
    /** Related entity ID (order, quote, etc.) */
    entityId: string;
    /** Approval amount */
    amount?: number;
    /** Request message */
    message?: string;
    /** Urgency level */
    urgency?: "low" | "normal" | "high";
}
/**
 * Hook for managing B2B approval workflows
 *
 * @param api - API client instance
 * @param initialFilters - Initial filter values
 * @returns Approvals state and actions
 *
 * @example
 * ```typescript
 * const {
 *   approvals,
 *   pendingCount,
 *   approve,
 *   reject,
 *   setFilters
 * } = useApprovals(api, { pendingForMe: true });
 *
 * // Approve a request
 * await approve('approval_123', 'Looks good');
 *
 * // Reject a request
 * await reject('approval_456', 'Budget exceeded');
 * ```
 */
declare function useApprovals(api: any, // ICommerceClient
initialFilters?: ApprovalFilters): UseApprovalsResult;

/**
 * Spending Limits Hook
 *
 * Provides access to B2B spending limits and budget tracking.
 */

/**
 * Spending summary for a specific period
 */
interface SpendingSummary {
    /** Spending limit for the period */
    limit: number;
    /** Amount spent in current period */
    spent: number;
    /** Remaining budget */
    remaining: number;
    /** Percentage of limit used */
    percentageUsed: number;
    /** Whether limit is exceeded */
    isExceeded: boolean;
    /** Whether approaching limit (warning threshold) */
    isWarning: boolean;
    /** Period start date */
    periodStart: string;
    /** Period end date */
    periodEnd: string;
}
/**
 * Spending hook result
 */
interface UseSpendingLimitsResult {
    /** All spending limits for the employee */
    limits: SpendingLimit[];
    /** Spending summaries by period */
    summaries: {
        perOrder: SpendingSummary | null;
        daily: SpendingSummary | null;
        weekly: SpendingSummary | null;
        monthly: SpendingSummary | null;
    };
    /** Loading state */
    isLoading: boolean;
    /** Error if any */
    error: Error | null;
    /** Check if an amount would exceed limits */
    canSpend: (amount: number) => {
        allowed: boolean;
        reason?: string;
    };
    /** Get spending history */
    getHistory: (period: SpendingPeriod) => Promise<SpendingHistoryEntry[]>;
    /** Refresh spending data */
    refresh: () => void;
}
/**
 * Spending history entry
 */
interface SpendingHistoryEntry {
    /** Entry ID */
    id: string;
    /** Order/quote ID */
    entityId: string;
    /** Entity type */
    entityType: "order" | "quote";
    /** Amount spent */
    amount: number;
    /** Timestamp */
    createdAt: string;
    /** Description */
    description?: string;
}
/**
 * Hook for managing B2B spending limits
 *
 * @param api - API client instance
 * @param employeeId - Employee ID (optional, uses current employee)
 * @returns Spending limits state and utilities
 *
 * @example
 * ```typescript
 * const { summaries, canSpend, refresh } = useSpendingLimits(api);
 *
 * // Check before placing order
 * const { allowed, reason } = canSpend(orderTotal);
 * if (!allowed) {
 *   showError(reason);
 * }
 *
 * // Display spending meter
 * const monthly = summaries.monthly;
 * if (monthly) {
 *   <SpendingMeter percentage={monthly.percentageUsed} warning={monthly.isWarning} />
 * }
 * ```
 */
declare function useSpendingLimits(api: any, // ICommerceClient
employeeId?: string): UseSpendingLimitsResult;

export { type Approval, type ApprovalDecisionInput, type ApprovalFilters, type ApprovalType, type B2BAction, type CompanyState, type CreateQuoteInput, type QuoteFilters, type RequestApprovalInput, type RespondToQuoteInput, type SpendingHistoryEntry, type SpendingSummary, type UseApprovalsResult, type UseCompanyOptions, type UseCompanyResult, type UseQuotesResult, type UseSpendingLimitsResult, useApprovals, useCompany, useQuotes, useSpendingLimits };
