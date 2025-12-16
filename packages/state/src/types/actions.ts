/**
 * Action Type Definitions
 *
 * Defines all action types for the B2B state management system.
 * Uses discriminated unions for type-safe action handling.
 *
 * @packageDocumentation
 */

import type {
  Company,
  Employee,
  EmployeeSummary,
  Quote,
  QuoteSummary,
  QuoteFilters,
  QuoteStatus,
  ApprovalRequest,
  ApprovalSummary,
  ApprovalFilters,
  ApprovalStatus,
  ApprovalAction,
  SpendingLimit,
} from "@maison/types";

import type {
  B2BCartItem,
  B2BCartTotals,
  SpendingValidation,
  PaginationState,
} from "./state";

// ============================================
// Action Type Constants
// ============================================

/**
 * Company action type constants.
 */
export const CompanyActionTypes = {
  // Fetch company
  FETCH_COMPANY_START: "company/fetchStart",
  FETCH_COMPANY_SUCCESS: "company/fetchSuccess",
  FETCH_COMPANY_FAILURE: "company/fetchFailure",
  // Set current context
  SET_CURRENT_COMPANY: "company/setCurrent",
  SET_CURRENT_EMPLOYEE: "company/setCurrentEmployee",
  // Employee management
  LOAD_EMPLOYEES: "company/loadEmployees",
  // Reset
  RESET_COMPANY_STATE: "company/reset",
  CLEAR_COMPANY_ERROR: "company/clearError",
} as const;

/**
 * Quotes action type constants.
 */
export const QuotesActionTypes = {
  // Fetch quotes list
  FETCH_QUOTES_START: "quotes/fetchListStart",
  FETCH_QUOTES_SUCCESS: "quotes/fetchListSuccess",
  FETCH_QUOTES_FAILURE: "quotes/fetchListFailure",
  // Fetch single quote
  FETCH_QUOTE_DETAIL_START: "quotes/fetchDetailStart",
  FETCH_QUOTE_DETAIL_SUCCESS: "quotes/fetchDetailSuccess",
  FETCH_QUOTE_DETAIL_FAILURE: "quotes/fetchDetailFailure",
  // Selection
  SELECT_QUOTE: "quotes/select",
  CLEAR_SELECTED_QUOTE: "quotes/clearSelected",
  // Filters
  SET_QUOTE_FILTERS: "quotes/setFilters",
  SET_QUOTE_STATUS_FILTER: "quotes/setStatusFilter",
  SET_QUOTE_SEARCH: "quotes/setSearch",
  CLEAR_QUOTE_FILTERS: "quotes/clearFilters",
  // Pagination
  SET_QUOTES_PAGINATION: "quotes/setPagination",
  SET_QUOTES_PAGE: "quotes/setPage",
  // Quote operations
  CREATE_QUOTE_SUCCESS: "quotes/createSuccess",
  UPDATE_QUOTE_SUCCESS: "quotes/updateSuccess",
  // Reset
  RESET_QUOTES_STATE: "quotes/reset",
  CLEAR_QUOTES_ERROR: "quotes/clearError",
} as const;

/**
 * Approvals action type constants.
 */
export const ApprovalsActionTypes = {
  // Fetch approvals
  FETCH_APPROVALS_START: "approvals/fetchListStart",
  FETCH_APPROVALS_SUCCESS: "approvals/fetchListSuccess",
  FETCH_APPROVALS_FAILURE: "approvals/fetchListFailure",
  // Fetch pending
  FETCH_PENDING_START: "approvals/fetchPendingStart",
  FETCH_PENDING_SUCCESS: "approvals/fetchPendingSuccess",
  FETCH_PENDING_FAILURE: "approvals/fetchPendingFailure",
  // Fetch detail
  FETCH_APPROVAL_DETAIL_START: "approvals/fetchDetailStart",
  FETCH_APPROVAL_DETAIL_SUCCESS: "approvals/fetchDetailSuccess",
  FETCH_APPROVAL_DETAIL_FAILURE: "approvals/fetchDetailFailure",
  // Selection
  SELECT_APPROVAL: "approvals/select",
  CLEAR_SELECTED_APPROVAL: "approvals/clearSelected",
  // Filters
  SET_APPROVAL_FILTERS: "approvals/setFilters",
  SET_APPROVAL_STATUS_FILTER: "approvals/setStatusFilter",
  CLEAR_APPROVAL_FILTERS: "approvals/clearFilters",
  // Pagination
  SET_APPROVALS_PAGINATION: "approvals/setPagination",
  SET_APPROVALS_PAGE: "approvals/setPage",
  // Actions
  APPROVAL_ACTION_SUCCESS: "approvals/actionSuccess",
  UPDATE_PENDING_COUNT: "approvals/updatePendingCount",
  // Reset
  RESET_APPROVALS_STATE: "approvals/reset",
  CLEAR_APPROVALS_ERROR: "approvals/clearError",
} as const;

/**
 * Cart B2B action type constants.
 */
export const CartB2BActionTypes = {
  // Item operations
  ADD_ITEM: "cartB2B/addItem",
  UPDATE_ITEM_QUANTITY: "cartB2B/updateItemQuantity",
  REMOVE_ITEM: "cartB2B/removeItem",
  UPDATE_ITEM_NOTES: "cartB2B/updateItemNotes",
  CLEAR_CART: "cartB2B/clear",
  // Bulk operations
  ADD_ITEMS_BULK: "cartB2B/addItemsBulk",
  // Cart metadata
  SET_SHIPPING_ADDRESS: "cartB2B/setShippingAddress",
  SET_PURCHASE_ORDER_NUMBER: "cartB2B/setPurchaseOrderNumber",
  SET_NOTES: "cartB2B/setNotes",
  // Totals and validation
  UPDATE_TOTALS: "cartB2B/updateTotals",
  UPDATE_SPENDING_VALIDATION: "cartB2B/updateSpendingValidation",
  // Loading states
  CART_LOADING_START: "cartB2B/loadingStart",
  CART_LOADING_SUCCESS: "cartB2B/loadingSuccess",
  CART_LOADING_FAILURE: "cartB2B/loadingFailure",
  // Hydration
  HYDRATE_CART: "cartB2B/hydrate",
  // Reset
  RESET_CART_STATE: "cartB2B/reset",
  CLEAR_CART_ERROR: "cartB2B/clearError",
} as const;

// ============================================
// Company Actions
// ============================================

export interface FetchCompanyStartAction {
  readonly type: typeof CompanyActionTypes.FETCH_COMPANY_START;
}

export interface FetchCompanySuccessAction {
  readonly type: typeof CompanyActionTypes.FETCH_COMPANY_SUCCESS;
  readonly payload: {
    readonly company: Company;
    readonly employee: Employee;
  };
}

export interface FetchCompanyFailureAction {
  readonly type: typeof CompanyActionTypes.FETCH_COMPANY_FAILURE;
  readonly payload: {
    readonly error: string;
  };
}

export interface SetCurrentCompanyAction {
  readonly type: typeof CompanyActionTypes.SET_CURRENT_COMPANY;
  readonly payload: {
    readonly company: Company | null;
  };
}

export interface SetCurrentEmployeeAction {
  readonly type: typeof CompanyActionTypes.SET_CURRENT_EMPLOYEE;
  readonly payload: {
    readonly employee: Employee | null;
  };
}

export interface LoadEmployeesAction {
  readonly type: typeof CompanyActionTypes.LOAD_EMPLOYEES;
  readonly payload: {
    readonly employees: readonly EmployeeSummary[];
  };
}

export interface ResetCompanyStateAction {
  readonly type: typeof CompanyActionTypes.RESET_COMPANY_STATE;
}

export interface ClearCompanyErrorAction {
  readonly type: typeof CompanyActionTypes.CLEAR_COMPANY_ERROR;
}

export type CompanyAction =
  | FetchCompanyStartAction
  | FetchCompanySuccessAction
  | FetchCompanyFailureAction
  | SetCurrentCompanyAction
  | SetCurrentEmployeeAction
  | LoadEmployeesAction
  | ResetCompanyStateAction
  | ClearCompanyErrorAction;

// ============================================
// Quotes Actions
// ============================================

export interface FetchQuotesStartAction {
  readonly type: typeof QuotesActionTypes.FETCH_QUOTES_START;
}

export interface FetchQuotesSuccessAction {
  readonly type: typeof QuotesActionTypes.FETCH_QUOTES_SUCCESS;
  readonly payload: {
    readonly quotes: readonly QuoteSummary[];
    readonly pagination: PaginationState;
  };
}

export interface FetchQuotesFailureAction {
  readonly type: typeof QuotesActionTypes.FETCH_QUOTES_FAILURE;
  readonly payload: {
    readonly error: string;
  };
}

export interface FetchQuoteDetailStartAction {
  readonly type: typeof QuotesActionTypes.FETCH_QUOTE_DETAIL_START;
}

export interface FetchQuoteDetailSuccessAction {
  readonly type: typeof QuotesActionTypes.FETCH_QUOTE_DETAIL_SUCCESS;
  readonly payload: {
    readonly quote: Quote;
  };
}

export interface FetchQuoteDetailFailureAction {
  readonly type: typeof QuotesActionTypes.FETCH_QUOTE_DETAIL_FAILURE;
  readonly payload: {
    readonly error: string;
  };
}

export interface SelectQuoteAction {
  readonly type: typeof QuotesActionTypes.SELECT_QUOTE;
  readonly payload: {
    readonly quoteId: string;
  };
}

export interface ClearSelectedQuoteAction {
  readonly type: typeof QuotesActionTypes.CLEAR_SELECTED_QUOTE;
}

export interface SetQuoteFiltersAction {
  readonly type: typeof QuotesActionTypes.SET_QUOTE_FILTERS;
  readonly payload: {
    readonly filters: QuoteFilters;
  };
}

export interface SetQuoteStatusFilterAction {
  readonly type: typeof QuotesActionTypes.SET_QUOTE_STATUS_FILTER;
  readonly payload: {
    readonly status: QuoteStatus | "all";
  };
}

export interface SetQuoteSearchAction {
  readonly type: typeof QuotesActionTypes.SET_QUOTE_SEARCH;
  readonly payload: {
    readonly query: string;
  };
}

export interface ClearQuoteFiltersAction {
  readonly type: typeof QuotesActionTypes.CLEAR_QUOTE_FILTERS;
}

export interface SetQuotesPaginationAction {
  readonly type: typeof QuotesActionTypes.SET_QUOTES_PAGINATION;
  readonly payload: {
    readonly pagination: PaginationState;
  };
}

export interface SetQuotesPageAction {
  readonly type: typeof QuotesActionTypes.SET_QUOTES_PAGE;
  readonly payload: {
    readonly page: number;
  };
}

export interface CreateQuoteSuccessAction {
  readonly type: typeof QuotesActionTypes.CREATE_QUOTE_SUCCESS;
  readonly payload: {
    readonly quote: QuoteSummary;
  };
}

export interface UpdateQuoteSuccessAction {
  readonly type: typeof QuotesActionTypes.UPDATE_QUOTE_SUCCESS;
  readonly payload: {
    readonly quote: Quote;
  };
}

export interface ResetQuotesStateAction {
  readonly type: typeof QuotesActionTypes.RESET_QUOTES_STATE;
}

export interface ClearQuotesErrorAction {
  readonly type: typeof QuotesActionTypes.CLEAR_QUOTES_ERROR;
}

export type QuotesAction =
  | FetchQuotesStartAction
  | FetchQuotesSuccessAction
  | FetchQuotesFailureAction
  | FetchQuoteDetailStartAction
  | FetchQuoteDetailSuccessAction
  | FetchQuoteDetailFailureAction
  | SelectQuoteAction
  | ClearSelectedQuoteAction
  | SetQuoteFiltersAction
  | SetQuoteStatusFilterAction
  | SetQuoteSearchAction
  | ClearQuoteFiltersAction
  | SetQuotesPaginationAction
  | SetQuotesPageAction
  | CreateQuoteSuccessAction
  | UpdateQuoteSuccessAction
  | ResetQuotesStateAction
  | ClearQuotesErrorAction;

// ============================================
// Approvals Actions
// ============================================

export interface FetchApprovalsStartAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_APPROVALS_START;
}

export interface FetchApprovalsSuccessAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_APPROVALS_SUCCESS;
  readonly payload: {
    readonly approvals: readonly ApprovalSummary[];
    readonly pagination: PaginationState;
  };
}

export interface FetchApprovalsFailureAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_APPROVALS_FAILURE;
  readonly payload: {
    readonly error: string;
  };
}

export interface FetchPendingStartAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_PENDING_START;
}

export interface FetchPendingSuccessAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_PENDING_SUCCESS;
  readonly payload: {
    readonly approvals: readonly ApprovalSummary[];
    readonly count: number;
  };
}

export interface FetchPendingFailureAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_PENDING_FAILURE;
  readonly payload: {
    readonly error: string;
  };
}

export interface FetchApprovalDetailStartAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_START;
}

export interface FetchApprovalDetailSuccessAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_SUCCESS;
  readonly payload: {
    readonly approval: ApprovalRequest;
  };
}

export interface FetchApprovalDetailFailureAction {
  readonly type: typeof ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_FAILURE;
  readonly payload: {
    readonly error: string;
  };
}

export interface SelectApprovalAction {
  readonly type: typeof ApprovalsActionTypes.SELECT_APPROVAL;
  readonly payload: {
    readonly approvalId: string;
  };
}

export interface ClearSelectedApprovalAction {
  readonly type: typeof ApprovalsActionTypes.CLEAR_SELECTED_APPROVAL;
}

export interface SetApprovalFiltersAction {
  readonly type: typeof ApprovalsActionTypes.SET_APPROVAL_FILTERS;
  readonly payload: {
    readonly filters: ApprovalFilters;
  };
}

export interface SetApprovalStatusFilterAction {
  readonly type: typeof ApprovalsActionTypes.SET_APPROVAL_STATUS_FILTER;
  readonly payload: {
    readonly status: ApprovalStatus | "all";
  };
}

export interface ClearApprovalFiltersAction {
  readonly type: typeof ApprovalsActionTypes.CLEAR_APPROVAL_FILTERS;
}

export interface SetApprovalsPaginationAction {
  readonly type: typeof ApprovalsActionTypes.SET_APPROVALS_PAGINATION;
  readonly payload: {
    readonly pagination: PaginationState;
  };
}

export interface SetApprovalsPageAction {
  readonly type: typeof ApprovalsActionTypes.SET_APPROVALS_PAGE;
  readonly payload: {
    readonly page: number;
  };
}

export interface ApprovalActionSuccessAction {
  readonly type: typeof ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS;
  readonly payload: {
    readonly approvalId: string;
    readonly action: ApprovalAction;
    readonly updatedApproval: ApprovalRequest;
  };
}

export interface UpdatePendingCountAction {
  readonly type: typeof ApprovalsActionTypes.UPDATE_PENDING_COUNT;
  readonly payload: {
    readonly count: number;
  };
}

export interface ResetApprovalsStateAction {
  readonly type: typeof ApprovalsActionTypes.RESET_APPROVALS_STATE;
}

export interface ClearApprovalsErrorAction {
  readonly type: typeof ApprovalsActionTypes.CLEAR_APPROVALS_ERROR;
}

export type ApprovalsAction =
  | FetchApprovalsStartAction
  | FetchApprovalsSuccessAction
  | FetchApprovalsFailureAction
  | FetchPendingStartAction
  | FetchPendingSuccessAction
  | FetchPendingFailureAction
  | FetchApprovalDetailStartAction
  | FetchApprovalDetailSuccessAction
  | FetchApprovalDetailFailureAction
  | SelectApprovalAction
  | ClearSelectedApprovalAction
  | SetApprovalFiltersAction
  | SetApprovalStatusFilterAction
  | ClearApprovalFiltersAction
  | SetApprovalsPaginationAction
  | SetApprovalsPageAction
  | ApprovalActionSuccessAction
  | UpdatePendingCountAction
  | ResetApprovalsStateAction
  | ClearApprovalsErrorAction;

// ============================================
// Cart B2B Actions
// ============================================

export interface AddItemAction {
  readonly type: typeof CartB2BActionTypes.ADD_ITEM;
  readonly payload: {
    readonly item: B2BCartItem;
  };
}

export interface UpdateItemQuantityAction {
  readonly type: typeof CartB2BActionTypes.UPDATE_ITEM_QUANTITY;
  readonly payload: {
    readonly productId: string;
    readonly quantity: number;
  };
}

export interface RemoveItemAction {
  readonly type: typeof CartB2BActionTypes.REMOVE_ITEM;
  readonly payload: {
    readonly productId: string;
  };
}

export interface UpdateItemNotesAction {
  readonly type: typeof CartB2BActionTypes.UPDATE_ITEM_NOTES;
  readonly payload: {
    readonly productId: string;
    readonly notes: string;
  };
}

export interface ClearCartAction {
  readonly type: typeof CartB2BActionTypes.CLEAR_CART;
}

export interface AddItemsBulkAction {
  readonly type: typeof CartB2BActionTypes.ADD_ITEMS_BULK;
  readonly payload: {
    readonly items: readonly B2BCartItem[];
  };
}

export interface SetShippingAddressAction {
  readonly type: typeof CartB2BActionTypes.SET_SHIPPING_ADDRESS;
  readonly payload: {
    readonly addressId: string | null;
  };
}

export interface SetPurchaseOrderNumberAction {
  readonly type: typeof CartB2BActionTypes.SET_PURCHASE_ORDER_NUMBER;
  readonly payload: {
    readonly poNumber: string;
  };
}

export interface SetCartNotesAction {
  readonly type: typeof CartB2BActionTypes.SET_NOTES;
  readonly payload: {
    readonly notes: string;
  };
}

export interface UpdateTotalsAction {
  readonly type: typeof CartB2BActionTypes.UPDATE_TOTALS;
  readonly payload: {
    readonly totals: B2BCartTotals;
  };
}

export interface UpdateSpendingValidationAction {
  readonly type: typeof CartB2BActionTypes.UPDATE_SPENDING_VALIDATION;
  readonly payload: {
    readonly validation: SpendingValidation;
    readonly limits: readonly SpendingLimit[];
  };
}

export interface CartLoadingStartAction {
  readonly type: typeof CartB2BActionTypes.CART_LOADING_START;
}

export interface CartLoadingSuccessAction {
  readonly type: typeof CartB2BActionTypes.CART_LOADING_SUCCESS;
}

export interface CartLoadingFailureAction {
  readonly type: typeof CartB2BActionTypes.CART_LOADING_FAILURE;
  readonly payload: {
    readonly error: string;
  };
}

export interface HydrateCartAction {
  readonly type: typeof CartB2BActionTypes.HYDRATE_CART;
  readonly payload: {
    readonly items: readonly B2BCartItem[];
    readonly shippingAddressId: string | null;
    readonly purchaseOrderNumber: string;
    readonly notes: string;
  };
}

export interface ResetCartStateAction {
  readonly type: typeof CartB2BActionTypes.RESET_CART_STATE;
}

export interface ClearCartErrorAction {
  readonly type: typeof CartB2BActionTypes.CLEAR_CART_ERROR;
}

export type CartB2BAction =
  | AddItemAction
  | UpdateItemQuantityAction
  | RemoveItemAction
  | UpdateItemNotesAction
  | ClearCartAction
  | AddItemsBulkAction
  | SetShippingAddressAction
  | SetPurchaseOrderNumberAction
  | SetCartNotesAction
  | UpdateTotalsAction
  | UpdateSpendingValidationAction
  | CartLoadingStartAction
  | CartLoadingSuccessAction
  | CartLoadingFailureAction
  | HydrateCartAction
  | ResetCartStateAction
  | ClearCartErrorAction;

// ============================================
// Combined Action Type
// ============================================

/**
 * Union of all possible actions in the B2B state management system.
 */
export type RootAction =
  | CompanyAction
  | QuotesAction
  | ApprovalsAction
  | CartB2BAction;
