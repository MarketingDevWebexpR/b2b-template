// src/types/actions.ts
var CompanyActionTypes = {
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
  CLEAR_COMPANY_ERROR: "company/clearError"
};
var QuotesActionTypes = {
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
  CLEAR_QUOTES_ERROR: "quotes/clearError"
};
var ApprovalsActionTypes = {
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
  CLEAR_APPROVALS_ERROR: "approvals/clearError"
};
var CartB2BActionTypes = {
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
  CLEAR_CART_ERROR: "cartB2B/clearError"
};

// src/actions/company.actions.ts
function fetchCompanyStart() {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_START
  };
}
function fetchCompanySuccess(company, employee) {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_SUCCESS,
    payload: {
      company,
      employee
    }
  };
}
function fetchCompanyFailure(error) {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_FAILURE,
    payload: {
      error
    }
  };
}
function setCurrentCompany(company) {
  return {
    type: CompanyActionTypes.SET_CURRENT_COMPANY,
    payload: {
      company
    }
  };
}
function setCurrentEmployee(employee) {
  return {
    type: CompanyActionTypes.SET_CURRENT_EMPLOYEE,
    payload: {
      employee
    }
  };
}
function loadEmployees(employees) {
  return {
    type: CompanyActionTypes.LOAD_EMPLOYEES,
    payload: {
      employees
    }
  };
}
function resetCompanyState() {
  return {
    type: CompanyActionTypes.RESET_COMPANY_STATE
  };
}
function clearCompanyError() {
  return {
    type: CompanyActionTypes.CLEAR_COMPANY_ERROR
  };
}
var CompanyAsyncActionTypes = {
  /** Fetch company and employee data */
  FETCH_COMPANY: "company/fetch",
  /** Refresh company data */
  REFRESH_COMPANY: "company/refresh",
  /** Switch to different company (for multi-company users) */
  SWITCH_COMPANY: "company/switch",
  /** Fetch employees list */
  FETCH_EMPLOYEES: "company/fetchEmployees"
};

// src/actions/quotes.actions.ts
function fetchQuotesStart() {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_START
  };
}
function fetchQuotesSuccess(quotes, pagination) {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_SUCCESS,
    payload: {
      quotes,
      pagination
    }
  };
}
function fetchQuotesFailure(error) {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_FAILURE,
    payload: {
      error
    }
  };
}
function fetchQuoteDetailStart() {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_START
  };
}
function fetchQuoteDetailSuccess(quote) {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_SUCCESS,
    payload: {
      quote
    }
  };
}
function fetchQuoteDetailFailure(error) {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_FAILURE,
    payload: {
      error
    }
  };
}
function selectQuote(quoteId) {
  return {
    type: QuotesActionTypes.SELECT_QUOTE,
    payload: {
      quoteId
    }
  };
}
function clearSelectedQuote() {
  return {
    type: QuotesActionTypes.CLEAR_SELECTED_QUOTE
  };
}
function setQuoteFilters(filters) {
  return {
    type: QuotesActionTypes.SET_QUOTE_FILTERS,
    payload: {
      filters
    }
  };
}
function setQuoteStatusFilter(status) {
  return {
    type: QuotesActionTypes.SET_QUOTE_STATUS_FILTER,
    payload: {
      status
    }
  };
}
function setQuoteSearch(query) {
  return {
    type: QuotesActionTypes.SET_QUOTE_SEARCH,
    payload: {
      query
    }
  };
}
function clearQuoteFilters() {
  return {
    type: QuotesActionTypes.CLEAR_QUOTE_FILTERS
  };
}
function setQuotesPagination(pagination) {
  return {
    type: QuotesActionTypes.SET_QUOTES_PAGINATION,
    payload: {
      pagination
    }
  };
}
function setQuotesPage(page) {
  return {
    type: QuotesActionTypes.SET_QUOTES_PAGE,
    payload: {
      page
    }
  };
}
function createQuoteSuccess(quote) {
  return {
    type: QuotesActionTypes.CREATE_QUOTE_SUCCESS,
    payload: {
      quote
    }
  };
}
function updateQuoteSuccess(quote) {
  return {
    type: QuotesActionTypes.UPDATE_QUOTE_SUCCESS,
    payload: {
      quote
    }
  };
}
function resetQuotesState() {
  return {
    type: QuotesActionTypes.RESET_QUOTES_STATE
  };
}
function clearQuotesError() {
  return {
    type: QuotesActionTypes.CLEAR_QUOTES_ERROR
  };
}
var QuotesAsyncActionTypes = {
  /** Fetch quotes list */
  FETCH_QUOTES: "quotes/fetch",
  /** Fetch single quote details */
  FETCH_QUOTE_DETAIL: "quotes/fetchDetail",
  /** Create new quote */
  CREATE_QUOTE: "quotes/create",
  /** Update existing quote */
  UPDATE_QUOTE: "quotes/update",
  /** Submit quote for review */
  SUBMIT_QUOTE: "quotes/submit",
  /** Accept a quote */
  ACCEPT_QUOTE: "quotes/accept",
  /** Reject a quote */
  REJECT_QUOTE: "quotes/reject",
  /** Cancel a quote */
  CANCEL_QUOTE: "quotes/cancel",
  /** Convert quote to order */
  CONVERT_QUOTE: "quotes/convert"
};

// src/actions/approvals.actions.ts
function fetchApprovalsStart() {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_START
  };
}
function fetchApprovalsSuccess(approvals, pagination) {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_SUCCESS,
    payload: {
      approvals,
      pagination
    }
  };
}
function fetchApprovalsFailure(error) {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_FAILURE,
    payload: {
      error
    }
  };
}
function fetchPendingStart() {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_START
  };
}
function fetchPendingSuccess(approvals, count) {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_SUCCESS,
    payload: {
      approvals,
      count
    }
  };
}
function fetchPendingFailure(error) {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_FAILURE,
    payload: {
      error
    }
  };
}
function fetchApprovalDetailStart() {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_START
  };
}
function fetchApprovalDetailSuccess(approval) {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_SUCCESS,
    payload: {
      approval
    }
  };
}
function fetchApprovalDetailFailure(error) {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_FAILURE,
    payload: {
      error
    }
  };
}
function selectApproval(approvalId) {
  return {
    type: ApprovalsActionTypes.SELECT_APPROVAL,
    payload: {
      approvalId
    }
  };
}
function clearSelectedApproval() {
  return {
    type: ApprovalsActionTypes.CLEAR_SELECTED_APPROVAL
  };
}
function setApprovalFilters(filters) {
  return {
    type: ApprovalsActionTypes.SET_APPROVAL_FILTERS,
    payload: {
      filters
    }
  };
}
function setApprovalStatusFilter(status) {
  return {
    type: ApprovalsActionTypes.SET_APPROVAL_STATUS_FILTER,
    payload: {
      status
    }
  };
}
function clearApprovalFilters() {
  return {
    type: ApprovalsActionTypes.CLEAR_APPROVAL_FILTERS
  };
}
function setApprovalsPagination(pagination) {
  return {
    type: ApprovalsActionTypes.SET_APPROVALS_PAGINATION,
    payload: {
      pagination
    }
  };
}
function setApprovalsPage(page) {
  return {
    type: ApprovalsActionTypes.SET_APPROVALS_PAGE,
    payload: {
      page
    }
  };
}
function approvalActionSuccess(approvalId, action, updatedApproval) {
  return {
    type: ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS,
    payload: {
      approvalId,
      action,
      updatedApproval
    }
  };
}
function updatePendingCount(count) {
  return {
    type: ApprovalsActionTypes.UPDATE_PENDING_COUNT,
    payload: {
      count
    }
  };
}
function resetApprovalsState() {
  return {
    type: ApprovalsActionTypes.RESET_APPROVALS_STATE
  };
}
function clearApprovalsError() {
  return {
    type: ApprovalsActionTypes.CLEAR_APPROVALS_ERROR
  };
}
var ApprovalsAsyncActionTypes = {
  /** Fetch all approvals */
  FETCH_APPROVALS: "approvals/fetch",
  /** Fetch pending approvals */
  FETCH_PENDING: "approvals/fetchPending",
  /** Fetch single approval details */
  FETCH_APPROVAL_DETAIL: "approvals/fetchDetail",
  /** Approve a request */
  APPROVE: "approvals/approve",
  /** Reject a request */
  REJECT: "approvals/reject",
  /** Escalate a request */
  ESCALATE: "approvals/escalate",
  /** Delegate a request */
  DELEGATE: "approvals/delegate",
  /** Request more info */
  REQUEST_INFO: "approvals/requestInfo"
};

// src/actions/cart-b2b.actions.ts
function addItem(item) {
  return {
    type: CartB2BActionTypes.ADD_ITEM,
    payload: {
      item
    }
  };
}
function updateItemQuantity(productId, quantity) {
  return {
    type: CartB2BActionTypes.UPDATE_ITEM_QUANTITY,
    payload: {
      productId,
      quantity
    }
  };
}
function removeItem(productId) {
  return {
    type: CartB2BActionTypes.REMOVE_ITEM,
    payload: {
      productId
    }
  };
}
function updateItemNotes(productId, notes) {
  return {
    type: CartB2BActionTypes.UPDATE_ITEM_NOTES,
    payload: {
      productId,
      notes
    }
  };
}
function clearCart() {
  return {
    type: CartB2BActionTypes.CLEAR_CART
  };
}
function addItemsBulk(items) {
  return {
    type: CartB2BActionTypes.ADD_ITEMS_BULK,
    payload: {
      items
    }
  };
}
function setShippingAddress(addressId) {
  return {
    type: CartB2BActionTypes.SET_SHIPPING_ADDRESS,
    payload: {
      addressId
    }
  };
}
function setPurchaseOrderNumber(poNumber) {
  return {
    type: CartB2BActionTypes.SET_PURCHASE_ORDER_NUMBER,
    payload: {
      poNumber
    }
  };
}
function setCartNotes(notes) {
  return {
    type: CartB2BActionTypes.SET_NOTES,
    payload: {
      notes
    }
  };
}
function updateTotals(totals) {
  return {
    type: CartB2BActionTypes.UPDATE_TOTALS,
    payload: {
      totals
    }
  };
}
function updateSpendingValidation(validation, limits) {
  return {
    type: CartB2BActionTypes.UPDATE_SPENDING_VALIDATION,
    payload: {
      validation,
      limits
    }
  };
}
function cartLoadingStart() {
  return {
    type: CartB2BActionTypes.CART_LOADING_START
  };
}
function cartLoadingSuccess() {
  return {
    type: CartB2BActionTypes.CART_LOADING_SUCCESS
  };
}
function cartLoadingFailure(error) {
  return {
    type: CartB2BActionTypes.CART_LOADING_FAILURE,
    payload: {
      error
    }
  };
}
function hydrateCart(items, shippingAddressId, purchaseOrderNumber, notes) {
  return {
    type: CartB2BActionTypes.HYDRATE_CART,
    payload: {
      items,
      shippingAddressId,
      purchaseOrderNumber,
      notes
    }
  };
}
function resetCartState() {
  return {
    type: CartB2BActionTypes.RESET_CART_STATE
  };
}
function clearCartError() {
  return {
    type: CartB2BActionTypes.CLEAR_CART_ERROR
  };
}
var CartB2BAsyncActionTypes = {
  /** Validate cart with server */
  VALIDATE_CART: "cartB2B/validate",
  /** Calculate totals with server (discounts, tax, shipping) */
  CALCULATE_TOTALS: "cartB2B/calculateTotals",
  /** Validate spending limits */
  VALIDATE_SPENDING: "cartB2B/validateSpending",
  /** Submit cart as order */
  SUBMIT_ORDER: "cartB2B/submitOrder",
  /** Convert cart to quote request */
  REQUEST_QUOTE: "cartB2B/requestQuote",
  /** Sync cart with server */
  SYNC_CART: "cartB2B/sync",
  /** Load cart from server */
  LOAD_CART: "cartB2B/load"
};

export { ApprovalsAsyncActionTypes, CartB2BAsyncActionTypes, CompanyAsyncActionTypes, QuotesAsyncActionTypes, addItem, addItemsBulk, approvalActionSuccess, cartLoadingFailure, cartLoadingStart, cartLoadingSuccess, clearApprovalFilters, clearApprovalsError, clearCart, clearCartError, clearCompanyError, clearQuoteFilters, clearQuotesError, clearSelectedApproval, clearSelectedQuote, createQuoteSuccess, fetchApprovalDetailFailure, fetchApprovalDetailStart, fetchApprovalDetailSuccess, fetchApprovalsFailure, fetchApprovalsStart, fetchApprovalsSuccess, fetchCompanyFailure, fetchCompanyStart, fetchCompanySuccess, fetchPendingFailure, fetchPendingStart, fetchPendingSuccess, fetchQuoteDetailFailure, fetchQuoteDetailStart, fetchQuoteDetailSuccess, fetchQuotesFailure, fetchQuotesStart, fetchQuotesSuccess, hydrateCart, loadEmployees, removeItem, resetApprovalsState, resetCartState, resetCompanyState, resetQuotesState, selectApproval, selectQuote, setApprovalFilters, setApprovalStatusFilter, setApprovalsPage, setApprovalsPagination, setCartNotes, setCurrentCompany, setCurrentEmployee, setPurchaseOrderNumber, setQuoteFilters, setQuoteSearch, setQuoteStatusFilter, setQuotesPage, setQuotesPagination, setShippingAddress, updateItemNotes, updateItemQuantity, updatePendingCount, updateQuoteSuccess, updateSpendingValidation, updateTotals };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map