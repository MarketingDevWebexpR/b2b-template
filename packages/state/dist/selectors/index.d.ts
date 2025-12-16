import { Company, Employee, EmployeeSummary, EmployeePermission, QuoteSummary, Quote, QuoteFilters, QuoteStatus, ApprovalSummary, ApprovalRequest, ApprovalFilters, ApprovalStatus, ApprovalEntityType, SpendingLimit } from '@maison/types';
import { R as RootState, C as CompanyState, L as LoadingStatus, Q as QuotesState, P as PaginationState, a as ApprovalsState, c as CartB2BState, B as B2BCartItem, b as B2BCartTotals, S as SpendingValidation } from '../state-RCP8oCT3.js';

/**
 * Company Selectors
 *
 * Selector functions for extracting and deriving data from company state.
 * All selectors are pure functions that can be used with any state management library.
 *
 * @packageDocumentation
 */

/**
 * Selects the entire company state slice.
 *
 * @param state - Root state
 * @returns Company state
 */
declare function selectCompanyState(state: RootState): CompanyState;
/**
 * Selects the current company.
 *
 * @param state - Root state
 * @returns Current company or null if not set
 */
declare function selectCurrentCompany(state: RootState): Company | null;
/**
 * Selects the current employee.
 *
 * @param state - Root state
 * @returns Current employee or null if not set
 */
declare function selectCurrentEmployee(state: RootState): Employee | null;
/**
 * Selects the list of company employees.
 *
 * @param state - Root state
 * @returns Array of employee summaries
 */
declare function selectEmployees(state: RootState): readonly EmployeeSummary[];
/**
 * Selects whether B2B mode is active.
 * B2B mode is active when both company and employee are set.
 *
 * @param state - Root state
 * @returns True if B2B mode is active
 */
declare function selectIsB2BActive(state: RootState): boolean;
/**
 * Selects the company loading status.
 *
 * @param state - Root state
 * @returns Loading status
 */
declare function selectCompanyStatus(state: RootState): LoadingStatus;
/**
 * Selects whether company is currently loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
declare function selectIsCompanyLoading(state: RootState): boolean;
/**
 * Selects the company error message.
 *
 * @param state - Root state
 * @returns Error message or null
 */
declare function selectCompanyError(state: RootState): string | null;
/**
 * Selects the last refresh timestamp.
 *
 * @param state - Root state
 * @returns ISO timestamp or null
 */
declare function selectCompanyLastRefreshed(state: RootState): string | null;
/**
 * Selects the current company ID.
 *
 * @param state - Root state
 * @returns Company ID or null
 */
declare function selectCurrentCompanyId(state: RootState): string | null;
/**
 * Selects the current company name.
 *
 * @param state - Root state
 * @returns Company name or null
 */
declare function selectCurrentCompanyName(state: RootState): string | null;
/**
 * Selects the current company tier.
 *
 * @param state - Root state
 * @returns Company tier or null
 */
declare function selectCurrentCompanyTier(state: RootState): Company["tier"] | null;
/**
 * Selects the current company's available credit.
 *
 * @param state - Root state
 * @returns Available credit amount or 0
 */
declare function selectCompanyAvailableCredit(state: RootState): number;
/**
 * Selects the current company's credit limit.
 *
 * @param state - Root state
 * @returns Credit limit or 0
 */
declare function selectCompanyCreditLimit(state: RootState): number;
/**
 * Selects the current company's credit usage percentage.
 *
 * @param state - Root state
 * @returns Credit usage percentage (0-100) or 0
 */
declare function selectCompanyCreditUsagePercent(state: RootState): number;
/**
 * Selects the current company's payment terms.
 *
 * @param state - Root state
 * @returns Payment terms or null
 */
declare function selectCompanyPaymentTerms(state: RootState): Company["paymentTerms"] | null;
/**
 * Selects the current company's addresses.
 *
 * @param state - Root state
 * @returns Array of company addresses
 */
declare function selectCompanyAddresses(state: RootState): Company["addresses"];
/**
 * Selects the default shipping address ID.
 *
 * @param state - Root state
 * @returns Default shipping address ID or null
 */
declare function selectDefaultShippingAddressId(state: RootState): string | null;
/**
 * Selects the default billing address ID.
 *
 * @param state - Root state
 * @returns Default billing address ID or null
 */
declare function selectDefaultBillingAddressId(state: RootState): string | null;
/**
 * Selects the current employee ID.
 *
 * @param state - Root state
 * @returns Employee ID or null
 */
declare function selectCurrentEmployeeId(state: RootState): string | null;
/**
 * Selects the current employee's full name.
 *
 * @param state - Root state
 * @returns Full name or null
 */
declare function selectCurrentEmployeeName(state: RootState): string | null;
/**
 * Selects the current employee's role.
 *
 * @param state - Root state
 * @returns Employee role or null
 */
declare function selectCurrentEmployeeRole(state: RootState): Employee["role"] | null;
/**
 * Selects the current employee's permissions.
 *
 * @param state - Root state
 * @returns Array of permissions
 */
declare function selectCurrentEmployeePermissions(state: RootState): readonly EmployeePermission[];
/**
 * Checks if the current employee has a specific permission.
 *
 * @param state - Root state
 * @param permission - Permission to check
 * @returns True if employee has the permission
 */
declare function selectHasPermission(state: RootState, permission: EmployeePermission): boolean;
/**
 * Checks if the current employee is an approver.
 *
 * @param state - Root state
 * @returns True if employee can approve requests
 */
declare function selectIsApprover(state: RootState): boolean;
/**
 * Selects the current employee's approval limit.
 *
 * @param state - Root state
 * @returns Approval limit or null (unlimited)
 */
declare function selectEmployeeApprovalLimit(state: RootState): number | null;
/**
 * Selects the current employee's spending limits.
 * Memoized to prevent unnecessary re-renders - returns same object reference
 * when employee hasn't changed.
 *
 * @param state - Root state
 * @returns Object with spending limit values
 */
declare const selectEmployeeSpendingLimits: (state: RootState) => {
    readonly perOrder: number | null;
    readonly daily: number | null;
    readonly weekly: number | null;
    readonly monthly: number | null;
};
/**
 * Selects the current employee's current spending values.
 * Memoized to prevent unnecessary re-renders - returns same object reference
 * when employee hasn't changed.
 *
 * @param state - Root state
 * @returns Object with current spending values
 */
declare const selectEmployeeCurrentSpending: (state: RootState) => {
    readonly daily: number;
    readonly weekly: number;
    readonly monthly: number;
};
/**
 * Selects an employee by ID from the employees list.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param employeeId - Employee ID to find
 * @returns Employee summary or undefined
 */
declare const selectEmployeeById: (state: RootState, param: string) => EmployeeSummary | undefined;
/**
 * Selects employees who are approvers.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Array of approver employee summaries
 */
declare const selectApproverEmployees: (state: RootState) => readonly EmployeeSummary[];
/**
 * Selects the count of employees.
 *
 * @param state - Root state
 * @returns Number of employees
 */
declare function selectEmployeeCount(state: RootState): number;
/**
 * Selects whether the current user can create orders.
 *
 * @param state - Root state
 * @returns True if user can create orders
 */
declare function selectCanCreateOrders(state: RootState): boolean;
/**
 * Selects whether the current user can create quotes.
 *
 * @param state - Root state
 * @returns True if user can create quotes
 */
declare function selectCanCreateQuotes(state: RootState): boolean;
/**
 * Selects whether the current user can approve orders.
 *
 * @param state - Root state
 * @returns True if user can approve orders
 */
declare function selectCanApproveOrders(state: RootState): boolean;
/**
 * Selects whether the current user needs approval for orders.
 *
 * @param state - Root state
 * @returns True if orders require approval
 */
declare function selectRequiresOrderApproval(state: RootState): boolean;

/**
 * Quotes Selectors
 *
 * Selector functions for extracting and deriving data from quotes state.
 * All selectors are pure functions that can be used with any state management library.
 *
 * @packageDocumentation
 */

/**
 * Selects the entire quotes state slice.
 *
 * @param state - Root state
 * @returns Quotes state
 */
declare function selectQuotesState(state: RootState): QuotesState;
/**
 * Selects all quotes (summary view).
 *
 * @param state - Root state
 * @returns Array of quote summaries
 */
declare function selectQuotes(state: RootState): readonly QuoteSummary[];
/**
 * Selects the currently selected quote (full details).
 *
 * @param state - Root state
 * @returns Selected quote or null
 */
declare function selectSelectedQuote(state: RootState): Quote | null;
/**
 * Selects the current quote filters.
 *
 * @param state - Root state
 * @returns Active quote filters
 */
declare function selectQuoteFilters(state: RootState): QuoteFilters;
/**
 * Selects the active status filter.
 *
 * @param state - Root state
 * @returns Active status filter or 'all'
 */
declare function selectActiveStatusFilter(state: RootState): QuoteStatus | "all";
/**
 * Selects the current search query.
 *
 * @param state - Root state
 * @returns Search query string
 */
declare function selectQuoteSearchQuery(state: RootState): string;
/**
 * Selects the quotes list loading status.
 *
 * @param state - Root state
 * @returns Loading status for list
 */
declare function selectQuotesListStatus(state: RootState): LoadingStatus;
/**
 * Selects whether quotes list is loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
declare function selectIsQuotesLoading(state: RootState): boolean;
/**
 * Selects the quote detail loading status.
 *
 * @param state - Root state
 * @returns Loading status for detail
 */
declare function selectQuoteDetailStatus(state: RootState): LoadingStatus;
/**
 * Selects whether quote detail is loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
declare function selectIsQuoteDetailLoading(state: RootState): boolean;
/**
 * Selects the quotes error message.
 *
 * @param state - Root state
 * @returns Error message or null
 */
declare function selectQuotesError(state: RootState): string | null;
/**
 * Selects the quotes pagination state.
 *
 * @param state - Root state
 * @returns Pagination state
 */
declare function selectQuotesPagination(state: RootState): PaginationState;
/**
 * Selects the current page number.
 *
 * @param state - Root state
 * @returns Current page (1-indexed)
 */
declare function selectQuotesCurrentPage(state: RootState): number;
/**
 * Selects the total number of quotes.
 *
 * @param state - Root state
 * @returns Total quotes count
 */
declare function selectQuotesTotalCount(state: RootState): number;
/**
 * Selects whether there's a next page.
 *
 * @param state - Root state
 * @returns True if next page exists
 */
declare function selectQuotesHasNextPage(state: RootState): boolean;
/**
 * Selects whether there's a previous page.
 *
 * @param state - Root state
 * @returns True if previous page exists
 */
declare function selectQuotesHasPreviousPage(state: RootState): boolean;
/**
 * Selects a quote by ID from the quotes list.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param quoteId - Quote ID to find
 * @returns Quote summary or undefined
 */
declare const selectQuoteById: (state: RootState, param: string) => QuoteSummary | undefined;
/**
 * Selects quotes filtered by status.
 * Uses the current list and applies client-side filtering.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param status - Status to filter by
 * @returns Filtered quote summaries
 */
declare const selectQuotesByStatus: (state: RootState, param: QuoteStatus) => readonly QuoteSummary[];
/**
 * Selects filtered quotes based on current filter state.
 * Applies search query and status filter to the current list.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Filtered quote summaries
 */
declare const selectFilteredQuotes: (state: RootState) => readonly QuoteSummary[];
/**
 * Selects the count of quotes by status.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param status - Status to count
 * @returns Number of quotes with the given status
 */
declare const selectQuoteCountByStatus: (state: RootState, param: QuoteStatus) => number;
/**
 * Selects quotes that have unread messages.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Quotes with unread messages
 */
declare const selectQuotesWithUnreadMessages: (state: RootState) => readonly QuoteSummary[];
/**
 * Selects the count of quotes with unread messages.
 *
 * @param state - Root state
 * @returns Number of quotes with unread messages
 */
declare function selectUnreadQuotesCount(state: RootState): number;
/**
 * Selects quotes that are expiring soon (within 7 days).
 * Memoized to prevent recalculation when quotes haven't changed.
 * Note: The Date comparison uses the current time at the moment of selector call,
 * so results may change over time even with the same state.
 *
 * @param state - Root state
 * @returns Quotes expiring soon
 */
declare const selectExpiringQuotes: (state: RootState) => readonly QuoteSummary[];
/**
 * Selects whether there are any quotes.
 *
 * @param state - Root state
 * @returns True if there are quotes
 */
declare function selectHasQuotes(state: RootState): boolean;
/**
 * Selects the total value of all quotes.
 *
 * @param state - Root state
 * @returns Total value
 */
declare function selectQuotesTotalValue(state: RootState): number;
/**
 * Selects the selected quote's ID.
 *
 * @param state - Root state
 * @returns Quote ID or null
 */
declare function selectSelectedQuoteId(state: RootState): string | null;
/**
 * Selects the selected quote's status.
 *
 * @param state - Root state
 * @returns Quote status or null
 */
declare function selectSelectedQuoteStatus(state: RootState): QuoteStatus | null;
/**
 * Selects the selected quote's items.
 *
 * @param state - Root state
 * @returns Quote items or empty array
 */
declare function selectSelectedQuoteItems(state: RootState): Quote["items"];
/**
 * Selects the selected quote's totals.
 *
 * @param state - Root state
 * @returns Quote totals or null
 */
declare function selectSelectedQuoteTotals(state: RootState): Quote["totals"] | null;
/**
 * Selects whether the selected quote can be accepted.
 * Quote can be accepted if status is 'responded'.
 *
 * @param state - Root state
 * @returns True if quote can be accepted
 */
declare function selectCanAcceptSelectedQuote(state: RootState): boolean;
/**
 * Selects whether the selected quote can be edited.
 * Quote can be edited if status is 'draft'.
 *
 * @param state - Root state
 * @returns True if quote can be edited
 */
declare function selectCanEditSelectedQuote(state: RootState): boolean;

/**
 * Approvals Selectors
 *
 * Selector functions for extracting and deriving data from approvals state.
 * All selectors are pure functions that can be used with any state management library.
 *
 * @packageDocumentation
 */

/**
 * Selects the entire approvals state slice.
 *
 * @param state - Root state
 * @returns Approvals state
 */
declare function selectApprovalsState(state: RootState): ApprovalsState;
/**
 * Selects pending approval requests.
 *
 * @param state - Root state
 * @returns Array of pending approval summaries
 */
declare function selectPendingApprovals(state: RootState): readonly ApprovalSummary[];
/**
 * Selects all approval requests.
 *
 * @param state - Root state
 * @returns Array of all approval summaries
 */
declare function selectAllApprovals(state: RootState): readonly ApprovalSummary[];
/**
 * Selects the currently selected approval request (full details).
 *
 * @param state - Root state
 * @returns Selected approval or null
 */
declare function selectSelectedApproval(state: RootState): ApprovalRequest | null;
/**
 * Selects the count of pending approvals.
 *
 * @param state - Root state
 * @returns Number of pending approvals
 */
declare function selectPendingApprovalCount(state: RootState): number;
/**
 * Alias for selectPendingApprovalCount.
 *
 * @param state - Root state
 * @returns Number of pending approvals
 */
declare function selectApprovalCount(state: RootState): number;
/**
 * Selects the current approval filters.
 *
 * @param state - Root state
 * @returns Active approval filters
 */
declare function selectApprovalFilters(state: RootState): ApprovalFilters;
/**
 * Selects the active status filter.
 *
 * @param state - Root state
 * @returns Active status filter or 'all'
 */
declare function selectApprovalStatusFilter(state: RootState): ApprovalStatus | "all";
/**
 * Selects the approvals list loading status.
 *
 * @param state - Root state
 * @returns Loading status for list
 */
declare function selectApprovalsListStatus(state: RootState): LoadingStatus;
/**
 * Selects whether approvals list is loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
declare function selectIsApprovalsLoading(state: RootState): boolean;
/**
 * Selects the approval detail loading status.
 *
 * @param state - Root state
 * @returns Loading status for detail
 */
declare function selectApprovalDetailStatus(state: RootState): LoadingStatus;
/**
 * Selects whether approval detail is loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
declare function selectIsApprovalDetailLoading(state: RootState): boolean;
/**
 * Selects the approvals error message.
 *
 * @param state - Root state
 * @returns Error message or null
 */
declare function selectApprovalsError(state: RootState): string | null;
/**
 * Selects the approvals pagination state.
 *
 * @param state - Root state
 * @returns Pagination state
 */
declare function selectApprovalsPagination(state: RootState): PaginationState;
/**
 * Selects the current page number.
 *
 * @param state - Root state
 * @returns Current page (1-indexed)
 */
declare function selectApprovalsCurrentPage(state: RootState): number;
/**
 * Selects the total number of approvals.
 *
 * @param state - Root state
 * @returns Total approvals count
 */
declare function selectApprovalsTotalCount(state: RootState): number;
/**
 * Selects an approval by ID from all approvals.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param approvalId - Approval ID to find
 * @returns Approval summary or undefined
 */
declare const selectApprovalById: (state: RootState, param: string) => ApprovalSummary | undefined;
/**
 * Selects approvals by status.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param status - Status to filter by
 * @returns Filtered approval summaries
 */
declare const selectApprovalsByStatus: (state: RootState, param: ApprovalStatus) => readonly ApprovalSummary[];
/**
 * Selects approvals by entity type.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param entityType - Entity type to filter by
 * @returns Filtered approval summaries
 */
declare const selectApprovalsByEntityType: (state: RootState, param: ApprovalEntityType) => readonly ApprovalSummary[];
/**
 * Selects pending approvals for orders.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Pending order approvals
 */
declare const selectPendingOrderApprovals: (state: RootState) => readonly ApprovalSummary[];
/**
 * Selects pending approvals for quotes.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Pending quote approvals
 */
declare const selectPendingQuoteApprovals: (state: RootState) => readonly ApprovalSummary[];
/**
 * Selects overdue approvals.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Overdue approval summaries
 */
declare const selectOverdueApprovals: (state: RootState) => readonly ApprovalSummary[];
/**
 * Selects the count of overdue approvals.
 *
 * @param state - Root state
 * @returns Number of overdue approvals
 */
declare function selectOverdueApprovalCount(state: RootState): number;
/**
 * Selects high-priority pending approvals.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns High-priority and urgent approvals
 */
declare const selectHighPriorityApprovals: (state: RootState) => readonly ApprovalSummary[];
/**
 * Selects whether there are any pending approvals.
 *
 * @param state - Root state
 * @returns True if there are pending approvals
 */
declare function selectHasPendingApprovals(state: RootState): boolean;
/**
 * Selects the total value of pending approvals.
 *
 * @param state - Root state
 * @returns Total value of pending approvals
 */
declare function selectPendingApprovalsTotalValue(state: RootState): number;
/**
 * Selects approval counts grouped by status.
 * Memoized with shallow equality to prevent unnecessary re-renders
 * when counts haven't changed.
 *
 * @param state - Root state
 * @returns Object with counts per status
 */
declare const selectApprovalCountsByStatus: (state: RootState) => Record<ApprovalStatus, number>;
/**
 * Selects the selected approval's ID.
 *
 * @param state - Root state
 * @returns Approval ID or null
 */
declare function selectSelectedApprovalId(state: RootState): string | null;
/**
 * Selects the selected approval's status.
 *
 * @param state - Root state
 * @returns Approval status or null
 */
declare function selectSelectedApprovalStatus(state: RootState): ApprovalStatus | null;
/**
 * Selects the selected approval's steps.
 *
 * @param state - Root state
 * @returns Approval steps or empty array
 */
declare function selectSelectedApprovalSteps(state: RootState): ApprovalRequest["steps"];
/**
 * Selects the selected approval's current level.
 *
 * @param state - Root state
 * @returns Current approval level or 0
 */
declare function selectSelectedApprovalCurrentLevel(state: RootState): number;
/**
 * Selects whether the selected approval can be actioned.
 *
 * @param state - Root state
 * @returns True if approval can be actioned
 */
declare function selectCanActionSelectedApproval(state: RootState): boolean;
/**
 * Selects whether the selected approval is overdue.
 *
 * @param state - Root state
 * @returns True if approval is overdue
 */
declare function selectIsSelectedApprovalOverdue(state: RootState): boolean;

/**
 * Cart Selectors
 *
 * Selector functions for extracting and deriving data from B2B cart state.
 * All selectors are pure functions that can be used with any state management library.
 *
 * @packageDocumentation
 */

/**
 * Selects the entire cart B2B state slice.
 *
 * @param state - Root state
 * @returns Cart B2B state
 */
declare function selectCartB2BState(state: RootState): CartB2BState;
/**
 * Selects all cart items.
 *
 * @param state - Root state
 * @returns Array of cart items
 */
declare function selectCartItems(state: RootState): readonly B2BCartItem[];
/**
 * Selects the total item count in cart.
 *
 * @param state - Root state
 * @returns Total quantity of all items
 */
declare function selectCartItemCount(state: RootState): number;
/**
 * Selects the cart totals.
 *
 * @param state - Root state
 * @returns Cart totals breakdown
 */
declare function selectCartTotals(state: RootState): B2BCartTotals;
/**
 * Selects the cart total amount.
 *
 * @param state - Root state
 * @returns Grand total
 */
declare function selectCartTotal(state: RootState): number;
/**
 * Selects the spending validation state.
 *
 * @param state - Root state
 * @returns Spending validation result
 */
declare function selectSpendingValidation(state: RootState): SpendingValidation;
/**
 * Selects whether checkout is allowed.
 *
 * @param state - Root state
 * @returns True if checkout is possible
 */
declare function selectCanCheckout(state: RootState): boolean;
/**
 * Selects the reason checkout is blocked (if any).
 *
 * @param state - Root state
 * @returns Block reason or null
 */
declare function selectCheckoutBlockedReason(state: RootState): string | null;
/**
 * Selects the cart loading status.
 *
 * @param state - Root state
 * @returns Loading status
 */
declare function selectCartStatus(state: RootState): LoadingStatus;
/**
 * Selects whether cart is currently loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
declare function selectIsCartLoading(state: RootState): boolean;
/**
 * Selects the cart error message.
 *
 * @param state - Root state
 * @returns Error message or null
 */
declare function selectCartError(state: RootState): string | null;
/**
 * Selects the last update timestamp.
 *
 * @param state - Root state
 * @returns ISO timestamp or null
 */
declare function selectCartLastUpdated(state: RootState): string | null;
/**
 * Selects the selected shipping address ID.
 *
 * @param state - Root state
 * @returns Shipping address ID or null
 */
declare function selectCartShippingAddressId(state: RootState): string | null;
/**
 * Selects the purchase order number.
 *
 * @param state - Root state
 * @returns PO number string
 */
declare function selectCartPurchaseOrderNumber(state: RootState): string;
/**
 * Selects the cart notes.
 *
 * @param state - Root state
 * @returns Notes string
 */
declare function selectCartNotes(state: RootState): string;
/**
 * Selects a cart item by product ID.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param productId - Product ID to find
 * @returns Cart item or undefined
 */
declare const selectCartItemByProductId: (state: RootState, param: string) => B2BCartItem | undefined;
/**
 * Selects the quantity of a specific product in the cart.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param productId - Product ID to check
 * @returns Quantity or 0 if not in cart
 */
declare const selectCartItemQuantity: (state: RootState, param: string) => number;
/**
 * Checks if a product is in the cart.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param productId - Product ID to check
 * @returns True if product is in cart
 */
declare const selectIsProductInCart: (state: RootState, param: string) => boolean;
/**
 * Selects the number of unique products in the cart.
 *
 * @param state - Root state
 * @returns Number of unique products
 */
declare function selectCartUniqueItemCount(state: RootState): number;
/**
 * Selects the cart subtotal.
 *
 * @param state - Root state
 * @returns Subtotal before discounts/shipping/tax
 */
declare function selectCartSubtotal(state: RootState): number;
/**
 * Selects the tier discount amount.
 *
 * @param state - Root state
 * @returns Tier discount
 */
declare function selectCartTierDiscount(state: RootState): number;
/**
 * Selects the volume discount amount.
 *
 * @param state - Root state
 * @returns Volume discount
 */
declare function selectCartVolumeDiscount(state: RootState): number;
/**
 * Selects the total discount amount.
 *
 * @param state - Root state
 * @returns Total discount
 */
declare function selectCartTotalDiscount(state: RootState): number;
/**
 * Selects the shipping estimate.
 *
 * @param state - Root state
 * @returns Shipping estimate
 */
declare function selectCartShippingEstimate(state: RootState): number;
/**
 * Selects the tax amount.
 *
 * @param state - Root state
 * @returns Tax amount
 */
declare function selectCartTax(state: RootState): number;
/**
 * Selects the cart currency.
 *
 * @param state - Root state
 * @returns Currency code
 */
declare function selectCartCurrency(state: RootState): string;
/**
 * Selects whether cart is within spending limits.
 *
 * @param state - Root state
 * @returns True if within limits
 */
declare function selectIsWithinSpendingLimits(state: RootState): boolean;
/**
 * Selects whether the order requires approval.
 *
 * @param state - Root state
 * @returns True if approval required
 */
declare function selectRequiresApproval(state: RootState): boolean;
/**
 * Selects the reason for requiring approval.
 *
 * @param state - Root state
 * @returns Approval reason or null
 */
declare function selectApprovalReason(state: RootState): string | null;
/**
 * Selects applicable spending limits.
 *
 * @param state - Root state
 * @returns Array of applicable spending limits
 */
declare function selectApplicableSpendingLimits(state: RootState): readonly SpendingLimit[];
/**
 * Selects spending warnings.
 *
 * @param state - Root state
 * @returns Array of warning messages
 */
declare function selectSpendingWarnings(state: RootState): readonly string[];
/**
 * Selects whether there are spending warnings.
 *
 * @param state - Root state
 * @returns True if there are warnings
 */
declare function selectHasSpendingWarnings(state: RootState): boolean;
/**
 * Selects whether the cart is empty.
 *
 * @param state - Root state
 * @returns True if cart has no items
 */
declare function selectIsCartEmpty(state: RootState): boolean;
/**
 * Selects cart items with invalid quantities.
 * Invalid means quantity is below min or above max.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Items with invalid quantities
 */
declare const selectInvalidQuantityItems: (state: RootState) => readonly B2BCartItem[];
/**
 * Selects whether all items have valid quantities.
 *
 * @param state - Root state
 * @returns True if all quantities are valid
 */
declare function selectAllQuantitiesValid(state: RootState): boolean;
/**
 * Selects the total weight of all items in the cart.
 * Assumes unit price is used as placeholder for weight when not specified.
 *
 * @param state - Root state
 * @returns Total quantity (items don't have weight, returns quantity sum)
 */
declare function selectCartTotalQuantity(state: RootState): number;
/**
 * Selects the average item price in the cart.
 *
 * @param state - Root state
 * @returns Average price per unit or 0 if cart is empty
 */
declare function selectAverageItemPrice(state: RootState): number;
/**
 * Selects cart data for persistence (serializable subset).
 * Memoized with shallow equality to prevent unnecessary re-renders.
 *
 * @param state - Root state
 * @returns Data suitable for storage
 */
declare const selectCartForPersistence: (state: RootState) => {
    readonly items: readonly B2BCartItem[];
    readonly shippingAddressId: string | null;
    readonly purchaseOrderNumber: string;
    readonly notes: string;
};
/**
 * Type definition for checkout summary.
 */
interface CheckoutSummary {
    readonly itemCount: number;
    readonly uniqueItems: number;
    readonly subtotal: number;
    readonly discount: number;
    readonly shipping: number;
    readonly tax: number;
    readonly total: number;
    readonly currency: string;
    readonly requiresApproval: boolean;
    readonly canCheckout: boolean;
    readonly blockedReason: string | null;
    readonly [key: string]: unknown;
}
/**
 * Creates a checkout summary from current cart state.
 * Memoized with shallow equality to prevent unnecessary re-renders
 * when the derived values haven't changed.
 *
 * @param state - Root state
 * @returns Checkout summary object
 */
declare const selectCheckoutSummary: (state: RootState) => CheckoutSummary;

export { type CheckoutSummary, selectActiveStatusFilter, selectAllApprovals, selectAllQuantitiesValid, selectApplicableSpendingLimits, selectApprovalById, selectApprovalCount, selectApprovalCountsByStatus, selectApprovalDetailStatus, selectApprovalFilters, selectApprovalReason, selectApprovalStatusFilter, selectApprovalsByEntityType, selectApprovalsByStatus, selectApprovalsCurrentPage, selectApprovalsError, selectApprovalsListStatus, selectApprovalsPagination, selectApprovalsState, selectApprovalsTotalCount, selectApproverEmployees, selectAverageItemPrice, selectCanAcceptSelectedQuote, selectCanActionSelectedApproval, selectCanApproveOrders, selectCanCheckout, selectCanCreateOrders, selectCanCreateQuotes, selectCanEditSelectedQuote, selectCartB2BState, selectCartCurrency, selectCartError, selectCartForPersistence, selectCartItemByProductId, selectCartItemCount, selectCartItemQuantity, selectCartItems, selectCartLastUpdated, selectCartNotes, selectCartPurchaseOrderNumber, selectCartShippingAddressId, selectCartShippingEstimate, selectCartStatus, selectCartSubtotal, selectCartTax, selectCartTierDiscount, selectCartTotal, selectCartTotalDiscount, selectCartTotalQuantity, selectCartTotals, selectCartUniqueItemCount, selectCartVolumeDiscount, selectCheckoutBlockedReason, selectCheckoutSummary, selectCompanyAddresses, selectCompanyAvailableCredit, selectCompanyCreditLimit, selectCompanyCreditUsagePercent, selectCompanyError, selectCompanyLastRefreshed, selectCompanyPaymentTerms, selectCompanyState, selectCompanyStatus, selectCurrentCompany, selectCurrentCompanyId, selectCurrentCompanyName, selectCurrentCompanyTier, selectCurrentEmployee, selectCurrentEmployeeId, selectCurrentEmployeeName, selectCurrentEmployeePermissions, selectCurrentEmployeeRole, selectDefaultBillingAddressId, selectDefaultShippingAddressId, selectEmployeeApprovalLimit, selectEmployeeById, selectEmployeeCount, selectEmployeeCurrentSpending, selectEmployeeSpendingLimits, selectEmployees, selectExpiringQuotes, selectFilteredQuotes, selectHasPendingApprovals, selectHasPermission, selectHasQuotes, selectHasSpendingWarnings, selectHighPriorityApprovals, selectInvalidQuantityItems, selectIsApprovalDetailLoading, selectIsApprovalsLoading, selectIsApprover, selectIsB2BActive, selectIsCartEmpty, selectIsCartLoading, selectIsCompanyLoading, selectIsProductInCart, selectIsQuoteDetailLoading, selectIsQuotesLoading, selectIsSelectedApprovalOverdue, selectIsWithinSpendingLimits, selectOverdueApprovalCount, selectOverdueApprovals, selectPendingApprovalCount, selectPendingApprovals, selectPendingApprovalsTotalValue, selectPendingOrderApprovals, selectPendingQuoteApprovals, selectQuoteById, selectQuoteCountByStatus, selectQuoteDetailStatus, selectQuoteFilters, selectQuoteSearchQuery, selectQuotes, selectQuotesByStatus, selectQuotesCurrentPage, selectQuotesError, selectQuotesHasNextPage, selectQuotesHasPreviousPage, selectQuotesListStatus, selectQuotesPagination, selectQuotesState, selectQuotesTotalCount, selectQuotesTotalValue, selectQuotesWithUnreadMessages, selectRequiresApproval, selectRequiresOrderApproval, selectSelectedApproval, selectSelectedApprovalCurrentLevel, selectSelectedApprovalId, selectSelectedApprovalStatus, selectSelectedApprovalSteps, selectSelectedQuote, selectSelectedQuoteId, selectSelectedQuoteItems, selectSelectedQuoteStatus, selectSelectedQuoteTotals, selectSpendingValidation, selectSpendingWarnings, selectUnreadQuotesCount };
