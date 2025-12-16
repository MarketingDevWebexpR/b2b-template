import { Company, Employee, EmployeeSummary, QuoteSummary, Quote, QuoteFilters, QuoteStatus, ApprovalSummary, ApprovalRequest, ApprovalFilters, ApprovalStatus, ApprovalAction, SpendingLimit } from '@maison/types';
import { P as PaginationState, B as B2BCartItem, b as B2BCartTotals, S as SpendingValidation } from './state-RCP8oCT3.cjs';

/**
 * Action Type Definitions
 *
 * Defines all action types for the B2B state management system.
 * Uses discriminated unions for type-safe action handling.
 *
 * @packageDocumentation
 */

/**
 * Company action type constants.
 */
declare const CompanyActionTypes: {
    readonly FETCH_COMPANY_START: "company/fetchStart";
    readonly FETCH_COMPANY_SUCCESS: "company/fetchSuccess";
    readonly FETCH_COMPANY_FAILURE: "company/fetchFailure";
    readonly SET_CURRENT_COMPANY: "company/setCurrent";
    readonly SET_CURRENT_EMPLOYEE: "company/setCurrentEmployee";
    readonly LOAD_EMPLOYEES: "company/loadEmployees";
    readonly RESET_COMPANY_STATE: "company/reset";
    readonly CLEAR_COMPANY_ERROR: "company/clearError";
};
/**
 * Quotes action type constants.
 */
declare const QuotesActionTypes: {
    readonly FETCH_QUOTES_START: "quotes/fetchListStart";
    readonly FETCH_QUOTES_SUCCESS: "quotes/fetchListSuccess";
    readonly FETCH_QUOTES_FAILURE: "quotes/fetchListFailure";
    readonly FETCH_QUOTE_DETAIL_START: "quotes/fetchDetailStart";
    readonly FETCH_QUOTE_DETAIL_SUCCESS: "quotes/fetchDetailSuccess";
    readonly FETCH_QUOTE_DETAIL_FAILURE: "quotes/fetchDetailFailure";
    readonly SELECT_QUOTE: "quotes/select";
    readonly CLEAR_SELECTED_QUOTE: "quotes/clearSelected";
    readonly SET_QUOTE_FILTERS: "quotes/setFilters";
    readonly SET_QUOTE_STATUS_FILTER: "quotes/setStatusFilter";
    readonly SET_QUOTE_SEARCH: "quotes/setSearch";
    readonly CLEAR_QUOTE_FILTERS: "quotes/clearFilters";
    readonly SET_QUOTES_PAGINATION: "quotes/setPagination";
    readonly SET_QUOTES_PAGE: "quotes/setPage";
    readonly CREATE_QUOTE_SUCCESS: "quotes/createSuccess";
    readonly UPDATE_QUOTE_SUCCESS: "quotes/updateSuccess";
    readonly RESET_QUOTES_STATE: "quotes/reset";
    readonly CLEAR_QUOTES_ERROR: "quotes/clearError";
};
/**
 * Approvals action type constants.
 */
declare const ApprovalsActionTypes: {
    readonly FETCH_APPROVALS_START: "approvals/fetchListStart";
    readonly FETCH_APPROVALS_SUCCESS: "approvals/fetchListSuccess";
    readonly FETCH_APPROVALS_FAILURE: "approvals/fetchListFailure";
    readonly FETCH_PENDING_START: "approvals/fetchPendingStart";
    readonly FETCH_PENDING_SUCCESS: "approvals/fetchPendingSuccess";
    readonly FETCH_PENDING_FAILURE: "approvals/fetchPendingFailure";
    readonly FETCH_APPROVAL_DETAIL_START: "approvals/fetchDetailStart";
    readonly FETCH_APPROVAL_DETAIL_SUCCESS: "approvals/fetchDetailSuccess";
    readonly FETCH_APPROVAL_DETAIL_FAILURE: "approvals/fetchDetailFailure";
    readonly SELECT_APPROVAL: "approvals/select";
    readonly CLEAR_SELECTED_APPROVAL: "approvals/clearSelected";
    readonly SET_APPROVAL_FILTERS: "approvals/setFilters";
    readonly SET_APPROVAL_STATUS_FILTER: "approvals/setStatusFilter";
    readonly CLEAR_APPROVAL_FILTERS: "approvals/clearFilters";
    readonly SET_APPROVALS_PAGINATION: "approvals/setPagination";
    readonly SET_APPROVALS_PAGE: "approvals/setPage";
    readonly APPROVAL_ACTION_SUCCESS: "approvals/actionSuccess";
    readonly UPDATE_PENDING_COUNT: "approvals/updatePendingCount";
    readonly RESET_APPROVALS_STATE: "approvals/reset";
    readonly CLEAR_APPROVALS_ERROR: "approvals/clearError";
};
/**
 * Cart B2B action type constants.
 */
declare const CartB2BActionTypes: {
    readonly ADD_ITEM: "cartB2B/addItem";
    readonly UPDATE_ITEM_QUANTITY: "cartB2B/updateItemQuantity";
    readonly REMOVE_ITEM: "cartB2B/removeItem";
    readonly UPDATE_ITEM_NOTES: "cartB2B/updateItemNotes";
    readonly CLEAR_CART: "cartB2B/clear";
    readonly ADD_ITEMS_BULK: "cartB2B/addItemsBulk";
    readonly SET_SHIPPING_ADDRESS: "cartB2B/setShippingAddress";
    readonly SET_PURCHASE_ORDER_NUMBER: "cartB2B/setPurchaseOrderNumber";
    readonly SET_NOTES: "cartB2B/setNotes";
    readonly UPDATE_TOTALS: "cartB2B/updateTotals";
    readonly UPDATE_SPENDING_VALIDATION: "cartB2B/updateSpendingValidation";
    readonly CART_LOADING_START: "cartB2B/loadingStart";
    readonly CART_LOADING_SUCCESS: "cartB2B/loadingSuccess";
    readonly CART_LOADING_FAILURE: "cartB2B/loadingFailure";
    readonly HYDRATE_CART: "cartB2B/hydrate";
    readonly RESET_CART_STATE: "cartB2B/reset";
    readonly CLEAR_CART_ERROR: "cartB2B/clearError";
};
interface FetchCompanyStartAction {
    readonly type: typeof CompanyActionTypes.FETCH_COMPANY_START;
}
interface FetchCompanySuccessAction {
    readonly type: typeof CompanyActionTypes.FETCH_COMPANY_SUCCESS;
    readonly payload: {
        readonly company: Company;
        readonly employee: Employee;
    };
}
interface FetchCompanyFailureAction {
    readonly type: typeof CompanyActionTypes.FETCH_COMPANY_FAILURE;
    readonly payload: {
        readonly error: string;
    };
}
interface SetCurrentCompanyAction {
    readonly type: typeof CompanyActionTypes.SET_CURRENT_COMPANY;
    readonly payload: {
        readonly company: Company | null;
    };
}
interface SetCurrentEmployeeAction {
    readonly type: typeof CompanyActionTypes.SET_CURRENT_EMPLOYEE;
    readonly payload: {
        readonly employee: Employee | null;
    };
}
interface LoadEmployeesAction {
    readonly type: typeof CompanyActionTypes.LOAD_EMPLOYEES;
    readonly payload: {
        readonly employees: readonly EmployeeSummary[];
    };
}
interface ResetCompanyStateAction {
    readonly type: typeof CompanyActionTypes.RESET_COMPANY_STATE;
}
interface ClearCompanyErrorAction {
    readonly type: typeof CompanyActionTypes.CLEAR_COMPANY_ERROR;
}
type CompanyAction = FetchCompanyStartAction | FetchCompanySuccessAction | FetchCompanyFailureAction | SetCurrentCompanyAction | SetCurrentEmployeeAction | LoadEmployeesAction | ResetCompanyStateAction | ClearCompanyErrorAction;
interface FetchQuotesStartAction {
    readonly type: typeof QuotesActionTypes.FETCH_QUOTES_START;
}
interface FetchQuotesSuccessAction {
    readonly type: typeof QuotesActionTypes.FETCH_QUOTES_SUCCESS;
    readonly payload: {
        readonly quotes: readonly QuoteSummary[];
        readonly pagination: PaginationState;
    };
}
interface FetchQuotesFailureAction {
    readonly type: typeof QuotesActionTypes.FETCH_QUOTES_FAILURE;
    readonly payload: {
        readonly error: string;
    };
}
interface FetchQuoteDetailStartAction {
    readonly type: typeof QuotesActionTypes.FETCH_QUOTE_DETAIL_START;
}
interface FetchQuoteDetailSuccessAction {
    readonly type: typeof QuotesActionTypes.FETCH_QUOTE_DETAIL_SUCCESS;
    readonly payload: {
        readonly quote: Quote;
    };
}
interface FetchQuoteDetailFailureAction {
    readonly type: typeof QuotesActionTypes.FETCH_QUOTE_DETAIL_FAILURE;
    readonly payload: {
        readonly error: string;
    };
}
interface SelectQuoteAction {
    readonly type: typeof QuotesActionTypes.SELECT_QUOTE;
    readonly payload: {
        readonly quoteId: string;
    };
}
interface ClearSelectedQuoteAction {
    readonly type: typeof QuotesActionTypes.CLEAR_SELECTED_QUOTE;
}
interface SetQuoteFiltersAction {
    readonly type: typeof QuotesActionTypes.SET_QUOTE_FILTERS;
    readonly payload: {
        readonly filters: QuoteFilters;
    };
}
interface SetQuoteStatusFilterAction {
    readonly type: typeof QuotesActionTypes.SET_QUOTE_STATUS_FILTER;
    readonly payload: {
        readonly status: QuoteStatus | "all";
    };
}
interface SetQuoteSearchAction {
    readonly type: typeof QuotesActionTypes.SET_QUOTE_SEARCH;
    readonly payload: {
        readonly query: string;
    };
}
interface ClearQuoteFiltersAction {
    readonly type: typeof QuotesActionTypes.CLEAR_QUOTE_FILTERS;
}
interface SetQuotesPaginationAction {
    readonly type: typeof QuotesActionTypes.SET_QUOTES_PAGINATION;
    readonly payload: {
        readonly pagination: PaginationState;
    };
}
interface SetQuotesPageAction {
    readonly type: typeof QuotesActionTypes.SET_QUOTES_PAGE;
    readonly payload: {
        readonly page: number;
    };
}
interface CreateQuoteSuccessAction {
    readonly type: typeof QuotesActionTypes.CREATE_QUOTE_SUCCESS;
    readonly payload: {
        readonly quote: QuoteSummary;
    };
}
interface UpdateQuoteSuccessAction {
    readonly type: typeof QuotesActionTypes.UPDATE_QUOTE_SUCCESS;
    readonly payload: {
        readonly quote: Quote;
    };
}
interface ResetQuotesStateAction {
    readonly type: typeof QuotesActionTypes.RESET_QUOTES_STATE;
}
interface ClearQuotesErrorAction {
    readonly type: typeof QuotesActionTypes.CLEAR_QUOTES_ERROR;
}
type QuotesAction = FetchQuotesStartAction | FetchQuotesSuccessAction | FetchQuotesFailureAction | FetchQuoteDetailStartAction | FetchQuoteDetailSuccessAction | FetchQuoteDetailFailureAction | SelectQuoteAction | ClearSelectedQuoteAction | SetQuoteFiltersAction | SetQuoteStatusFilterAction | SetQuoteSearchAction | ClearQuoteFiltersAction | SetQuotesPaginationAction | SetQuotesPageAction | CreateQuoteSuccessAction | UpdateQuoteSuccessAction | ResetQuotesStateAction | ClearQuotesErrorAction;
interface FetchApprovalsStartAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_APPROVALS_START;
}
interface FetchApprovalsSuccessAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_APPROVALS_SUCCESS;
    readonly payload: {
        readonly approvals: readonly ApprovalSummary[];
        readonly pagination: PaginationState;
    };
}
interface FetchApprovalsFailureAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_APPROVALS_FAILURE;
    readonly payload: {
        readonly error: string;
    };
}
interface FetchPendingStartAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_PENDING_START;
}
interface FetchPendingSuccessAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_PENDING_SUCCESS;
    readonly payload: {
        readonly approvals: readonly ApprovalSummary[];
        readonly count: number;
    };
}
interface FetchPendingFailureAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_PENDING_FAILURE;
    readonly payload: {
        readonly error: string;
    };
}
interface FetchApprovalDetailStartAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_START;
}
interface FetchApprovalDetailSuccessAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_SUCCESS;
    readonly payload: {
        readonly approval: ApprovalRequest;
    };
}
interface FetchApprovalDetailFailureAction {
    readonly type: typeof ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_FAILURE;
    readonly payload: {
        readonly error: string;
    };
}
interface SelectApprovalAction {
    readonly type: typeof ApprovalsActionTypes.SELECT_APPROVAL;
    readonly payload: {
        readonly approvalId: string;
    };
}
interface ClearSelectedApprovalAction {
    readonly type: typeof ApprovalsActionTypes.CLEAR_SELECTED_APPROVAL;
}
interface SetApprovalFiltersAction {
    readonly type: typeof ApprovalsActionTypes.SET_APPROVAL_FILTERS;
    readonly payload: {
        readonly filters: ApprovalFilters;
    };
}
interface SetApprovalStatusFilterAction {
    readonly type: typeof ApprovalsActionTypes.SET_APPROVAL_STATUS_FILTER;
    readonly payload: {
        readonly status: ApprovalStatus | "all";
    };
}
interface ClearApprovalFiltersAction {
    readonly type: typeof ApprovalsActionTypes.CLEAR_APPROVAL_FILTERS;
}
interface SetApprovalsPaginationAction {
    readonly type: typeof ApprovalsActionTypes.SET_APPROVALS_PAGINATION;
    readonly payload: {
        readonly pagination: PaginationState;
    };
}
interface SetApprovalsPageAction {
    readonly type: typeof ApprovalsActionTypes.SET_APPROVALS_PAGE;
    readonly payload: {
        readonly page: number;
    };
}
interface ApprovalActionSuccessAction {
    readonly type: typeof ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS;
    readonly payload: {
        readonly approvalId: string;
        readonly action: ApprovalAction;
        readonly updatedApproval: ApprovalRequest;
    };
}
interface UpdatePendingCountAction {
    readonly type: typeof ApprovalsActionTypes.UPDATE_PENDING_COUNT;
    readonly payload: {
        readonly count: number;
    };
}
interface ResetApprovalsStateAction {
    readonly type: typeof ApprovalsActionTypes.RESET_APPROVALS_STATE;
}
interface ClearApprovalsErrorAction {
    readonly type: typeof ApprovalsActionTypes.CLEAR_APPROVALS_ERROR;
}
type ApprovalsAction = FetchApprovalsStartAction | FetchApprovalsSuccessAction | FetchApprovalsFailureAction | FetchPendingStartAction | FetchPendingSuccessAction | FetchPendingFailureAction | FetchApprovalDetailStartAction | FetchApprovalDetailSuccessAction | FetchApprovalDetailFailureAction | SelectApprovalAction | ClearSelectedApprovalAction | SetApprovalFiltersAction | SetApprovalStatusFilterAction | ClearApprovalFiltersAction | SetApprovalsPaginationAction | SetApprovalsPageAction | ApprovalActionSuccessAction | UpdatePendingCountAction | ResetApprovalsStateAction | ClearApprovalsErrorAction;
interface AddItemAction {
    readonly type: typeof CartB2BActionTypes.ADD_ITEM;
    readonly payload: {
        readonly item: B2BCartItem;
    };
}
interface UpdateItemQuantityAction {
    readonly type: typeof CartB2BActionTypes.UPDATE_ITEM_QUANTITY;
    readonly payload: {
        readonly productId: string;
        readonly quantity: number;
    };
}
interface RemoveItemAction {
    readonly type: typeof CartB2BActionTypes.REMOVE_ITEM;
    readonly payload: {
        readonly productId: string;
    };
}
interface UpdateItemNotesAction {
    readonly type: typeof CartB2BActionTypes.UPDATE_ITEM_NOTES;
    readonly payload: {
        readonly productId: string;
        readonly notes: string;
    };
}
interface ClearCartAction {
    readonly type: typeof CartB2BActionTypes.CLEAR_CART;
}
interface AddItemsBulkAction {
    readonly type: typeof CartB2BActionTypes.ADD_ITEMS_BULK;
    readonly payload: {
        readonly items: readonly B2BCartItem[];
    };
}
interface SetShippingAddressAction {
    readonly type: typeof CartB2BActionTypes.SET_SHIPPING_ADDRESS;
    readonly payload: {
        readonly addressId: string | null;
    };
}
interface SetPurchaseOrderNumberAction {
    readonly type: typeof CartB2BActionTypes.SET_PURCHASE_ORDER_NUMBER;
    readonly payload: {
        readonly poNumber: string;
    };
}
interface SetCartNotesAction {
    readonly type: typeof CartB2BActionTypes.SET_NOTES;
    readonly payload: {
        readonly notes: string;
    };
}
interface UpdateTotalsAction {
    readonly type: typeof CartB2BActionTypes.UPDATE_TOTALS;
    readonly payload: {
        readonly totals: B2BCartTotals;
    };
}
interface UpdateSpendingValidationAction {
    readonly type: typeof CartB2BActionTypes.UPDATE_SPENDING_VALIDATION;
    readonly payload: {
        readonly validation: SpendingValidation;
        readonly limits: readonly SpendingLimit[];
    };
}
interface CartLoadingStartAction {
    readonly type: typeof CartB2BActionTypes.CART_LOADING_START;
}
interface CartLoadingSuccessAction {
    readonly type: typeof CartB2BActionTypes.CART_LOADING_SUCCESS;
}
interface CartLoadingFailureAction {
    readonly type: typeof CartB2BActionTypes.CART_LOADING_FAILURE;
    readonly payload: {
        readonly error: string;
    };
}
interface HydrateCartAction {
    readonly type: typeof CartB2BActionTypes.HYDRATE_CART;
    readonly payload: {
        readonly items: readonly B2BCartItem[];
        readonly shippingAddressId: string | null;
        readonly purchaseOrderNumber: string;
        readonly notes: string;
    };
}
interface ResetCartStateAction {
    readonly type: typeof CartB2BActionTypes.RESET_CART_STATE;
}
interface ClearCartErrorAction {
    readonly type: typeof CartB2BActionTypes.CLEAR_CART_ERROR;
}
type CartB2BAction = AddItemAction | UpdateItemQuantityAction | RemoveItemAction | UpdateItemNotesAction | ClearCartAction | AddItemsBulkAction | SetShippingAddressAction | SetPurchaseOrderNumberAction | SetCartNotesAction | UpdateTotalsAction | UpdateSpendingValidationAction | CartLoadingStartAction | CartLoadingSuccessAction | CartLoadingFailureAction | HydrateCartAction | ResetCartStateAction | ClearCartErrorAction;
/**
 * Union of all possible actions in the B2B state management system.
 */
type RootAction = CompanyAction | QuotesAction | ApprovalsAction | CartB2BAction;

export { type ClearCartAction as $, type FetchPendingFailureAction as A, type FetchApprovalDetailStartAction as B, type ClearCompanyErrorAction as C, type FetchApprovalDetailSuccessAction as D, type FetchApprovalDetailFailureAction as E, type FetchCompanyStartAction as F, type SelectApprovalAction as G, type ClearSelectedApprovalAction as H, type SetApprovalFiltersAction as I, type SetApprovalStatusFilterAction as J, type ClearApprovalFiltersAction as K, type LoadEmployeesAction as L, type SetApprovalsPaginationAction as M, type SetApprovalsPageAction as N, type ApprovalActionSuccessAction as O, type UpdatePendingCountAction as P, type QuotesAction as Q, type ResetCompanyStateAction as R, type SetCurrentCompanyAction as S, type ResetApprovalsStateAction as T, type UpdateQuoteSuccessAction as U, type ClearApprovalsErrorAction as V, type ApprovalsAction as W, type AddItemAction as X, type UpdateItemQuantityAction as Y, type RemoveItemAction as Z, type UpdateItemNotesAction as _, type FetchCompanySuccessAction as a, type AddItemsBulkAction as a0, type SetShippingAddressAction as a1, type SetPurchaseOrderNumberAction as a2, type SetCartNotesAction as a3, type UpdateTotalsAction as a4, type UpdateSpendingValidationAction as a5, type CartLoadingStartAction as a6, type CartLoadingSuccessAction as a7, type CartLoadingFailureAction as a8, type HydrateCartAction as a9, type ResetCartStateAction as aa, type ClearCartErrorAction as ab, type CartB2BAction as ac, type RootAction as ad, CompanyActionTypes as ae, QuotesActionTypes as af, ApprovalsActionTypes as ag, CartB2BActionTypes as ah, type FetchCompanyFailureAction as b, type SetCurrentEmployeeAction as c, type CompanyAction as d, type FetchQuotesStartAction as e, type FetchQuotesSuccessAction as f, type FetchQuotesFailureAction as g, type FetchQuoteDetailStartAction as h, type FetchQuoteDetailSuccessAction as i, type FetchQuoteDetailFailureAction as j, type SelectQuoteAction as k, type ClearSelectedQuoteAction as l, type SetQuoteFiltersAction as m, type SetQuoteStatusFilterAction as n, type SetQuoteSearchAction as o, type ClearQuoteFiltersAction as p, type SetQuotesPaginationAction as q, type SetQuotesPageAction as r, type CreateQuoteSuccessAction as s, type ResetQuotesStateAction as t, type ClearQuotesErrorAction as u, type FetchApprovalsStartAction as v, type FetchApprovalsSuccessAction as w, type FetchApprovalsFailureAction as x, type FetchPendingStartAction as y, type FetchPendingSuccessAction as z };
