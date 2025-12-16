import { Company, Employee, EmployeeSummary, QuoteSummary, Quote, QuoteFilters, QuoteStatus, ApprovalSummary, ApprovalRequest, ApprovalFilters, ApprovalStatus, ApprovalAction, SpendingLimit } from '@maison/types';
import { F as FetchCompanyStartAction, a as FetchCompanySuccessAction, b as FetchCompanyFailureAction, S as SetCurrentCompanyAction, c as SetCurrentEmployeeAction, L as LoadEmployeesAction, R as ResetCompanyStateAction, C as ClearCompanyErrorAction, e as FetchQuotesStartAction, f as FetchQuotesSuccessAction, g as FetchQuotesFailureAction, h as FetchQuoteDetailStartAction, i as FetchQuoteDetailSuccessAction, j as FetchQuoteDetailFailureAction, k as SelectQuoteAction, l as ClearSelectedQuoteAction, m as SetQuoteFiltersAction, n as SetQuoteStatusFilterAction, o as SetQuoteSearchAction, p as ClearQuoteFiltersAction, q as SetQuotesPaginationAction, r as SetQuotesPageAction, s as CreateQuoteSuccessAction, U as UpdateQuoteSuccessAction, t as ResetQuotesStateAction, u as ClearQuotesErrorAction, v as FetchApprovalsStartAction, w as FetchApprovalsSuccessAction, x as FetchApprovalsFailureAction, y as FetchPendingStartAction, z as FetchPendingSuccessAction, A as FetchPendingFailureAction, B as FetchApprovalDetailStartAction, D as FetchApprovalDetailSuccessAction, E as FetchApprovalDetailFailureAction, G as SelectApprovalAction, H as ClearSelectedApprovalAction, I as SetApprovalFiltersAction, J as SetApprovalStatusFilterAction, K as ClearApprovalFiltersAction, M as SetApprovalsPaginationAction, N as SetApprovalsPageAction, O as ApprovalActionSuccessAction, P as UpdatePendingCountAction, T as ResetApprovalsStateAction, V as ClearApprovalsErrorAction, X as AddItemAction, Y as UpdateItemQuantityAction, Z as RemoveItemAction, _ as UpdateItemNotesAction, $ as ClearCartAction, a0 as AddItemsBulkAction, a1 as SetShippingAddressAction, a2 as SetPurchaseOrderNumberAction, a3 as SetCartNotesAction, a4 as UpdateTotalsAction, a5 as UpdateSpendingValidationAction, a6 as CartLoadingStartAction, a7 as CartLoadingSuccessAction, a8 as CartLoadingFailureAction, a9 as HydrateCartAction, aa as ResetCartStateAction, ab as ClearCartErrorAction } from '../actions-ONThwaCz.js';
import { P as PaginationState, B as B2BCartItem, b as B2BCartTotals, S as SpendingValidation } from '../state-RCP8oCT3.js';

/**
 * Company Action Creators
 *
 * Factory functions for creating type-safe company actions.
 * All action creators are pure functions with no side effects.
 *
 * @packageDocumentation
 */

/**
 * Creates an action to start fetching company data.
 *
 * @returns Fetch company start action
 *
 * @example
 * ```ts
 * dispatch(fetchCompanyStart());
 * ```
 */
declare function fetchCompanyStart(): FetchCompanyStartAction;
/**
 * Creates an action for successful company fetch.
 *
 * @param company - The fetched company data
 * @param employee - The current employee data
 * @returns Fetch company success action
 *
 * @example
 * ```ts
 * dispatch(fetchCompanySuccess(companyData, employeeData));
 * ```
 */
declare function fetchCompanySuccess(company: Company, employee: Employee): FetchCompanySuccessAction;
/**
 * Creates an action for failed company fetch.
 *
 * @param error - Error message
 * @returns Fetch company failure action
 *
 * @example
 * ```ts
 * dispatch(fetchCompanyFailure('Failed to load company data'));
 * ```
 */
declare function fetchCompanyFailure(error: string): FetchCompanyFailureAction;
/**
 * Creates an action to set the current company.
 *
 * @param company - Company to set as current, or null to clear
 * @returns Set current company action
 *
 * @example
 * ```ts
 * dispatch(setCurrentCompany(companyData));
 * // or to clear
 * dispatch(setCurrentCompany(null));
 * ```
 */
declare function setCurrentCompany(company: Company | null): SetCurrentCompanyAction;
/**
 * Creates an action to set the current employee.
 *
 * @param employee - Employee to set as current, or null to clear
 * @returns Set current employee action
 *
 * @example
 * ```ts
 * dispatch(setCurrentEmployee(employeeData));
 * // or to clear
 * dispatch(setCurrentEmployee(null));
 * ```
 */
declare function setCurrentEmployee(employee: Employee | null): SetCurrentEmployeeAction;
/**
 * Creates an action to load company employees.
 *
 * @param employees - Array of employee summaries
 * @returns Load employees action
 *
 * @example
 * ```ts
 * dispatch(loadEmployees(employeesList));
 * ```
 */
declare function loadEmployees(employees: readonly EmployeeSummary[]): LoadEmployeesAction;
/**
 * Creates an action to reset company state to initial values.
 * Use when logging out or switching contexts.
 *
 * @returns Reset company state action
 *
 * @example
 * ```ts
 * dispatch(resetCompanyState());
 * ```
 */
declare function resetCompanyState(): ResetCompanyStateAction;
/**
 * Creates an action to clear company error.
 *
 * @returns Clear company error action
 *
 * @example
 * ```ts
 * dispatch(clearCompanyError());
 * ```
 */
declare function clearCompanyError(): ClearCompanyErrorAction;
/**
 * Async action type constants for company operations.
 * Use these with middleware like redux-thunk or redux-saga.
 */
declare const CompanyAsyncActionTypes: {
    /** Fetch company and employee data */
    readonly FETCH_COMPANY: "company/fetch";
    /** Refresh company data */
    readonly REFRESH_COMPANY: "company/refresh";
    /** Switch to different company (for multi-company users) */
    readonly SWITCH_COMPANY: "company/switch";
    /** Fetch employees list */
    readonly FETCH_EMPLOYEES: "company/fetchEmployees";
};
/**
 * Async action creator types for external implementation.
 * These are type definitions only - implement with your async middleware.
 */
interface CompanyAsyncActions {
    /** Fetches company and current employee data */
    fetchCompany: () => Promise<void>;
    /** Refreshes current company data */
    refreshCompany: () => Promise<void>;
    /** Switches to a different company */
    switchCompany: (companyId: string) => Promise<void>;
    /** Fetches the list of company employees */
    fetchEmployees: () => Promise<void>;
}

/**
 * Quotes Action Creators
 *
 * Factory functions for creating type-safe quotes actions.
 * All action creators are pure functions with no side effects.
 *
 * @packageDocumentation
 */

/**
 * Creates an action to start fetching quotes list.
 *
 * @returns Fetch quotes start action
 */
declare function fetchQuotesStart(): FetchQuotesStartAction;
/**
 * Creates an action for successful quotes fetch.
 *
 * @param quotes - Array of quote summaries
 * @param pagination - Pagination state
 * @returns Fetch quotes success action
 */
declare function fetchQuotesSuccess(quotes: readonly QuoteSummary[], pagination: PaginationState): FetchQuotesSuccessAction;
/**
 * Creates an action for failed quotes fetch.
 *
 * @param error - Error message
 * @returns Fetch quotes failure action
 */
declare function fetchQuotesFailure(error: string): FetchQuotesFailureAction;
/**
 * Creates an action to start fetching quote details.
 *
 * @returns Fetch quote detail start action
 */
declare function fetchQuoteDetailStart(): FetchQuoteDetailStartAction;
/**
 * Creates an action for successful quote detail fetch.
 *
 * @param quote - Full quote data
 * @returns Fetch quote detail success action
 */
declare function fetchQuoteDetailSuccess(quote: Quote): FetchQuoteDetailSuccessAction;
/**
 * Creates an action for failed quote detail fetch.
 *
 * @param error - Error message
 * @returns Fetch quote detail failure action
 */
declare function fetchQuoteDetailFailure(error: string): FetchQuoteDetailFailureAction;
/**
 * Creates an action to select a quote.
 *
 * @param quoteId - ID of the quote to select
 * @returns Select quote action
 */
declare function selectQuote(quoteId: string): SelectQuoteAction;
/**
 * Creates an action to clear the selected quote.
 *
 * @returns Clear selected quote action
 */
declare function clearSelectedQuote(): ClearSelectedQuoteAction;
/**
 * Creates an action to set quote filters.
 *
 * @param filters - Quote filters to apply
 * @returns Set quote filters action
 */
declare function setQuoteFilters(filters: QuoteFilters): SetQuoteFiltersAction;
/**
 * Creates an action to set the status filter.
 *
 * @param status - Status to filter by, or 'all' for no filter
 * @returns Set quote status filter action
 */
declare function setQuoteStatusFilter(status: QuoteStatus | "all"): SetQuoteStatusFilterAction;
/**
 * Creates an action to set the search query.
 *
 * @param query - Search query string
 * @returns Set quote search action
 */
declare function setQuoteSearch(query: string): SetQuoteSearchAction;
/**
 * Creates an action to clear all quote filters.
 *
 * @returns Clear quote filters action
 */
declare function clearQuoteFilters(): ClearQuoteFiltersAction;
/**
 * Creates an action to set quotes pagination.
 *
 * @param pagination - Pagination state
 * @returns Set quotes pagination action
 */
declare function setQuotesPagination(pagination: PaginationState): SetQuotesPaginationAction;
/**
 * Creates an action to set the current page.
 *
 * @param page - Page number (1-indexed)
 * @returns Set quotes page action
 */
declare function setQuotesPage(page: number): SetQuotesPageAction;
/**
 * Creates an action for successful quote creation.
 *
 * @param quote - Created quote summary
 * @returns Create quote success action
 */
declare function createQuoteSuccess(quote: QuoteSummary): CreateQuoteSuccessAction;
/**
 * Creates an action for successful quote update.
 *
 * @param quote - Updated quote data
 * @returns Update quote success action
 */
declare function updateQuoteSuccess(quote: Quote): UpdateQuoteSuccessAction;
/**
 * Creates an action to reset quotes state to initial values.
 *
 * @returns Reset quotes state action
 */
declare function resetQuotesState(): ResetQuotesStateAction;
/**
 * Creates an action to clear quotes error.
 *
 * @returns Clear quotes error action
 */
declare function clearQuotesError(): ClearQuotesErrorAction;
/**
 * Async action type constants for quotes operations.
 */
declare const QuotesAsyncActionTypes: {
    /** Fetch quotes list */
    readonly FETCH_QUOTES: "quotes/fetch";
    /** Fetch single quote details */
    readonly FETCH_QUOTE_DETAIL: "quotes/fetchDetail";
    /** Create new quote */
    readonly CREATE_QUOTE: "quotes/create";
    /** Update existing quote */
    readonly UPDATE_QUOTE: "quotes/update";
    /** Submit quote for review */
    readonly SUBMIT_QUOTE: "quotes/submit";
    /** Accept a quote */
    readonly ACCEPT_QUOTE: "quotes/accept";
    /** Reject a quote */
    readonly REJECT_QUOTE: "quotes/reject";
    /** Cancel a quote */
    readonly CANCEL_QUOTE: "quotes/cancel";
    /** Convert quote to order */
    readonly CONVERT_QUOTE: "quotes/convert";
};
/**
 * Async action creator types for external implementation.
 */
interface QuotesAsyncActions {
    /** Fetches quotes list with current filters */
    fetchQuotes: (filters?: QuoteFilters, page?: number) => Promise<void>;
    /** Fetches a single quote's full details */
    fetchQuoteDetail: (quoteId: string) => Promise<void>;
    /** Creates a new quote */
    createQuote: (data: unknown) => Promise<Quote>;
    /** Updates an existing quote */
    updateQuote: (quoteId: string, data: unknown) => Promise<Quote>;
    /** Submits a quote for seller review */
    submitQuote: (quoteId: string) => Promise<void>;
    /** Accepts a quote */
    acceptQuote: (quoteId: string) => Promise<void>;
    /** Rejects a quote */
    rejectQuote: (quoteId: string, reason?: string) => Promise<void>;
    /** Cancels a quote */
    cancelQuote: (quoteId: string) => Promise<void>;
    /** Converts a quote to an order */
    convertQuote: (quoteId: string) => Promise<string>;
}

/**
 * Approvals Action Creators
 *
 * Factory functions for creating type-safe approvals actions.
 * All action creators are pure functions with no side effects.
 *
 * @packageDocumentation
 */

/**
 * Creates an action to start fetching approvals list.
 *
 * @returns Fetch approvals start action
 */
declare function fetchApprovalsStart(): FetchApprovalsStartAction;
/**
 * Creates an action for successful approvals fetch.
 *
 * @param approvals - Array of approval summaries
 * @param pagination - Pagination state
 * @returns Fetch approvals success action
 */
declare function fetchApprovalsSuccess(approvals: readonly ApprovalSummary[], pagination: PaginationState): FetchApprovalsSuccessAction;
/**
 * Creates an action for failed approvals fetch.
 *
 * @param error - Error message
 * @returns Fetch approvals failure action
 */
declare function fetchApprovalsFailure(error: string): FetchApprovalsFailureAction;
/**
 * Creates an action to start fetching pending approvals.
 *
 * @returns Fetch pending start action
 */
declare function fetchPendingStart(): FetchPendingStartAction;
/**
 * Creates an action for successful pending approvals fetch.
 *
 * @param approvals - Array of pending approval summaries
 * @param count - Total count of pending approvals
 * @returns Fetch pending success action
 */
declare function fetchPendingSuccess(approvals: readonly ApprovalSummary[], count: number): FetchPendingSuccessAction;
/**
 * Creates an action for failed pending approvals fetch.
 *
 * @param error - Error message
 * @returns Fetch pending failure action
 */
declare function fetchPendingFailure(error: string): FetchPendingFailureAction;
/**
 * Creates an action to start fetching approval details.
 *
 * @returns Fetch approval detail start action
 */
declare function fetchApprovalDetailStart(): FetchApprovalDetailStartAction;
/**
 * Creates an action for successful approval detail fetch.
 *
 * @param approval - Full approval request data
 * @returns Fetch approval detail success action
 */
declare function fetchApprovalDetailSuccess(approval: ApprovalRequest): FetchApprovalDetailSuccessAction;
/**
 * Creates an action for failed approval detail fetch.
 *
 * @param error - Error message
 * @returns Fetch approval detail failure action
 */
declare function fetchApprovalDetailFailure(error: string): FetchApprovalDetailFailureAction;
/**
 * Creates an action to select an approval.
 *
 * @param approvalId - ID of the approval to select
 * @returns Select approval action
 */
declare function selectApproval(approvalId: string): SelectApprovalAction;
/**
 * Creates an action to clear the selected approval.
 *
 * @returns Clear selected approval action
 */
declare function clearSelectedApproval(): ClearSelectedApprovalAction;
/**
 * Creates an action to set approval filters.
 *
 * @param filters - Approval filters to apply
 * @returns Set approval filters action
 */
declare function setApprovalFilters(filters: ApprovalFilters): SetApprovalFiltersAction;
/**
 * Creates an action to set the status filter.
 *
 * @param status - Status to filter by, or 'all' for no filter
 * @returns Set approval status filter action
 */
declare function setApprovalStatusFilter(status: ApprovalStatus | "all"): SetApprovalStatusFilterAction;
/**
 * Creates an action to clear all approval filters.
 *
 * @returns Clear approval filters action
 */
declare function clearApprovalFilters(): ClearApprovalFiltersAction;
/**
 * Creates an action to set approvals pagination.
 *
 * @param pagination - Pagination state
 * @returns Set approvals pagination action
 */
declare function setApprovalsPagination(pagination: PaginationState): SetApprovalsPaginationAction;
/**
 * Creates an action to set the current page.
 *
 * @param page - Page number (1-indexed)
 * @returns Set approvals page action
 */
declare function setApprovalsPage(page: number): SetApprovalsPageAction;
/**
 * Creates an action for successful approval action (approve, reject, etc.).
 *
 * @param approvalId - ID of the approval
 * @param action - Action that was taken
 * @param updatedApproval - Updated approval data
 * @returns Approval action success action
 */
declare function approvalActionSuccess(approvalId: string, action: ApprovalAction, updatedApproval: ApprovalRequest): ApprovalActionSuccessAction;
/**
 * Creates an action to update the pending count.
 *
 * @param count - New pending count
 * @returns Update pending count action
 */
declare function updatePendingCount(count: number): UpdatePendingCountAction;
/**
 * Creates an action to reset approvals state to initial values.
 *
 * @returns Reset approvals state action
 */
declare function resetApprovalsState(): ResetApprovalsStateAction;
/**
 * Creates an action to clear approvals error.
 *
 * @returns Clear approvals error action
 */
declare function clearApprovalsError(): ClearApprovalsErrorAction;
/**
 * Async action type constants for approvals operations.
 */
declare const ApprovalsAsyncActionTypes: {
    /** Fetch all approvals */
    readonly FETCH_APPROVALS: "approvals/fetch";
    /** Fetch pending approvals */
    readonly FETCH_PENDING: "approvals/fetchPending";
    /** Fetch single approval details */
    readonly FETCH_APPROVAL_DETAIL: "approvals/fetchDetail";
    /** Approve a request */
    readonly APPROVE: "approvals/approve";
    /** Reject a request */
    readonly REJECT: "approvals/reject";
    /** Escalate a request */
    readonly ESCALATE: "approvals/escalate";
    /** Delegate a request */
    readonly DELEGATE: "approvals/delegate";
    /** Request more info */
    readonly REQUEST_INFO: "approvals/requestInfo";
};
/**
 * Async action creator types for external implementation.
 */
interface ApprovalsAsyncActions {
    /** Fetches all approvals with filters */
    fetchApprovals: (filters?: ApprovalFilters, page?: number) => Promise<void>;
    /** Fetches pending approvals only */
    fetchPendingApprovals: () => Promise<void>;
    /** Fetches a single approval's details */
    fetchApprovalDetail: (approvalId: string) => Promise<void>;
    /** Approves a request */
    approve: (approvalId: string, comment?: string) => Promise<void>;
    /** Rejects a request */
    reject: (approvalId: string, comment: string) => Promise<void>;
    /** Escalates a request to higher authority */
    escalate: (approvalId: string, comment?: string) => Promise<void>;
    /** Delegates a request to another approver */
    delegate: (approvalId: string, delegateTo: string, comment?: string) => Promise<void>;
    /** Requests more information */
    requestInfo: (approvalId: string, comment: string) => Promise<void>;
}

/**
 * Cart B2B Action Creators
 *
 * Factory functions for creating type-safe B2B cart actions.
 * All action creators are pure functions with no side effects.
 *
 * @packageDocumentation
 */

/**
 * Creates an action to add an item to the cart.
 *
 * @param item - Cart item to add
 * @returns Add item action
 *
 * @example
 * ```ts
 * dispatch(addItem({
 *   productId: 'prod-123',
 *   productSku: 'SKU-001',
 *   productName: 'Gold Necklace',
 *   productImage: '/images/necklace.jpg',
 *   unitPrice: 299.99,
 *   quantity: 2,
 *   minOrderQuantity: 1,
 *   maxOrderQuantity: 100,
 *   lineTotal: 599.98,
 * }));
 * ```
 */
declare function addItem(item: B2BCartItem): AddItemAction;
/**
 * Creates an action to update an item's quantity.
 *
 * @param productId - ID of the product to update
 * @param quantity - New quantity
 * @returns Update item quantity action
 */
declare function updateItemQuantity(productId: string, quantity: number): UpdateItemQuantityAction;
/**
 * Creates an action to remove an item from the cart.
 *
 * @param productId - ID of the product to remove
 * @returns Remove item action
 */
declare function removeItem(productId: string): RemoveItemAction;
/**
 * Creates an action to update an item's notes.
 *
 * @param productId - ID of the product
 * @param notes - Notes for the item
 * @returns Update item notes action
 */
declare function updateItemNotes(productId: string, notes: string): UpdateItemNotesAction;
/**
 * Creates an action to clear all items from the cart.
 *
 * @returns Clear cart action
 */
declare function clearCart(): ClearCartAction;
/**
 * Creates an action to add multiple items at once.
 *
 * @param items - Array of cart items to add
 * @returns Add items bulk action
 *
 * @example
 * ```ts
 * dispatch(addItemsBulk([item1, item2, item3]));
 * ```
 */
declare function addItemsBulk(items: readonly B2BCartItem[]): AddItemsBulkAction;
/**
 * Creates an action to set the shipping address.
 *
 * @param addressId - ID of the shipping address, or null to clear
 * @returns Set shipping address action
 */
declare function setShippingAddress(addressId: string | null): SetShippingAddressAction;
/**
 * Creates an action to set the purchase order number.
 *
 * @param poNumber - Purchase order number
 * @returns Set purchase order number action
 */
declare function setPurchaseOrderNumber(poNumber: string): SetPurchaseOrderNumberAction;
/**
 * Creates an action to set cart notes.
 *
 * @param notes - Cart notes
 * @returns Set notes action
 */
declare function setCartNotes(notes: string): SetCartNotesAction;
/**
 * Creates an action to update cart totals.
 * Use after receiving calculated totals from the server.
 *
 * @param totals - Cart totals breakdown
 * @returns Update totals action
 */
declare function updateTotals(totals: B2BCartTotals): UpdateTotalsAction;
/**
 * Creates an action to update spending validation.
 * Use after validating cart against spending limits.
 *
 * @param validation - Spending validation result
 * @param limits - Applicable spending limits
 * @returns Update spending validation action
 */
declare function updateSpendingValidation(validation: SpendingValidation, limits: readonly SpendingLimit[]): UpdateSpendingValidationAction;
/**
 * Creates an action to indicate cart loading has started.
 *
 * @returns Cart loading start action
 */
declare function cartLoadingStart(): CartLoadingStartAction;
/**
 * Creates an action to indicate cart loading succeeded.
 *
 * @returns Cart loading success action
 */
declare function cartLoadingSuccess(): CartLoadingSuccessAction;
/**
 * Creates an action to indicate cart loading failed.
 *
 * @param error - Error message
 * @returns Cart loading failure action
 */
declare function cartLoadingFailure(error: string): CartLoadingFailureAction;
/**
 * Creates an action to hydrate cart from persisted data.
 * Use when loading cart from localStorage or session.
 *
 * @param items - Persisted cart items
 * @param shippingAddressId - Persisted shipping address ID
 * @param purchaseOrderNumber - Persisted PO number
 * @param notes - Persisted notes
 * @returns Hydrate cart action
 *
 * @example
 * ```ts
 * const savedCart = JSON.parse(localStorage.getItem('b2b-cart') || '{}');
 * dispatch(hydrateCart(
 *   savedCart.items || [],
 *   savedCart.shippingAddressId || null,
 *   savedCart.purchaseOrderNumber || '',
 *   savedCart.notes || ''
 * ));
 * ```
 */
declare function hydrateCart(items: readonly B2BCartItem[], shippingAddressId: string | null, purchaseOrderNumber: string, notes: string): HydrateCartAction;
/**
 * Creates an action to reset cart state to initial values.
 *
 * @returns Reset cart state action
 */
declare function resetCartState(): ResetCartStateAction;
/**
 * Creates an action to clear cart error.
 *
 * @returns Clear cart error action
 */
declare function clearCartError(): ClearCartErrorAction;
/**
 * Async action type constants for cart operations.
 */
declare const CartB2BAsyncActionTypes: {
    /** Validate cart with server */
    readonly VALIDATE_CART: "cartB2B/validate";
    /** Calculate totals with server (discounts, tax, shipping) */
    readonly CALCULATE_TOTALS: "cartB2B/calculateTotals";
    /** Validate spending limits */
    readonly VALIDATE_SPENDING: "cartB2B/validateSpending";
    /** Submit cart as order */
    readonly SUBMIT_ORDER: "cartB2B/submitOrder";
    /** Convert cart to quote request */
    readonly REQUEST_QUOTE: "cartB2B/requestQuote";
    /** Sync cart with server */
    readonly SYNC_CART: "cartB2B/sync";
    /** Load cart from server */
    readonly LOAD_CART: "cartB2B/load";
};
/**
 * Async action creator types for external implementation.
 */
interface CartB2BAsyncActions {
    /** Validates cart items with server (stock, pricing, availability) */
    validateCart: () => Promise<boolean>;
    /** Calculates totals with server (applies discounts, tax, shipping) */
    calculateTotals: () => Promise<B2BCartTotals>;
    /** Validates cart against employee spending limits */
    validateSpending: () => Promise<SpendingValidation>;
    /** Submits cart as a new order */
    submitOrder: () => Promise<string>;
    /** Converts cart to a quote request */
    requestQuote: () => Promise<string>;
    /** Syncs local cart with server */
    syncCart: () => Promise<void>;
    /** Loads cart from server (for logged-in users) */
    loadCart: () => Promise<void>;
}

export { ApprovalsAsyncActionTypes, type ApprovalsAsyncActions, CartB2BAsyncActionTypes, type CartB2BAsyncActions, CompanyAsyncActionTypes, type CompanyAsyncActions, QuotesAsyncActionTypes, type QuotesAsyncActions, addItem, addItemsBulk, approvalActionSuccess, cartLoadingFailure, cartLoadingStart, cartLoadingSuccess, clearApprovalFilters, clearApprovalsError, clearCart, clearCartError, clearCompanyError, clearQuoteFilters, clearQuotesError, clearSelectedApproval, clearSelectedQuote, createQuoteSuccess, fetchApprovalDetailFailure, fetchApprovalDetailStart, fetchApprovalDetailSuccess, fetchApprovalsFailure, fetchApprovalsStart, fetchApprovalsSuccess, fetchCompanyFailure, fetchCompanyStart, fetchCompanySuccess, fetchPendingFailure, fetchPendingStart, fetchPendingSuccess, fetchQuoteDetailFailure, fetchQuoteDetailStart, fetchQuoteDetailSuccess, fetchQuotesFailure, fetchQuotesStart, fetchQuotesSuccess, hydrateCart, loadEmployees, removeItem, resetApprovalsState, resetCartState, resetCompanyState, resetQuotesState, selectApproval, selectQuote, setApprovalFilters, setApprovalStatusFilter, setApprovalsPage, setApprovalsPagination, setCartNotes, setCurrentCompany, setCurrentEmployee, setPurchaseOrderNumber, setQuoteFilters, setQuoteSearch, setQuoteStatusFilter, setQuotesPage, setQuotesPagination, setShippingAddress, updateItemNotes, updateItemQuantity, updatePendingCount, updateQuoteSuccess, updateSpendingValidation, updateTotals };
