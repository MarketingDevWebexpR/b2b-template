/**
 * Actions Module
 *
 * Exports all action creators and async action types.
 * All action creators are pure functions that return action objects.
 *
 * @packageDocumentation
 */

// Company actions
export {
  // Fetch actions
  fetchCompanyStart,
  fetchCompanySuccess,
  fetchCompanyFailure,
  // Set context actions
  setCurrentCompany,
  setCurrentEmployee,
  // Employee management
  loadEmployees,
  // Reset/clear
  resetCompanyState,
  clearCompanyError,
  // Async types
  CompanyAsyncActionTypes,
  type CompanyAsyncActions,
} from "./company.actions";

// Quotes actions
export {
  // Fetch list actions
  fetchQuotesStart,
  fetchQuotesSuccess,
  fetchQuotesFailure,
  // Fetch detail actions
  fetchQuoteDetailStart,
  fetchQuoteDetailSuccess,
  fetchQuoteDetailFailure,
  // Selection actions
  selectQuote,
  clearSelectedQuote,
  // Filter actions
  setQuoteFilters,
  setQuoteStatusFilter,
  setQuoteSearch,
  clearQuoteFilters,
  // Pagination actions
  setQuotesPagination,
  setQuotesPage,
  // CRUD actions
  createQuoteSuccess,
  updateQuoteSuccess,
  // Reset/clear
  resetQuotesState,
  clearQuotesError,
  // Async types
  QuotesAsyncActionTypes,
  type QuotesAsyncActions,
} from "./quotes.actions";

// Approvals actions
export {
  // Fetch all actions
  fetchApprovalsStart,
  fetchApprovalsSuccess,
  fetchApprovalsFailure,
  // Fetch pending actions
  fetchPendingStart,
  fetchPendingSuccess,
  fetchPendingFailure,
  // Fetch detail actions
  fetchApprovalDetailStart,
  fetchApprovalDetailSuccess,
  fetchApprovalDetailFailure,
  // Selection actions
  selectApproval,
  clearSelectedApproval,
  // Filter actions
  setApprovalFilters,
  setApprovalStatusFilter,
  clearApprovalFilters,
  // Pagination actions
  setApprovalsPagination,
  setApprovalsPage,
  // Action operations
  approvalActionSuccess,
  updatePendingCount,
  // Reset/clear
  resetApprovalsState,
  clearApprovalsError,
  // Async types
  ApprovalsAsyncActionTypes,
  type ApprovalsAsyncActions,
} from "./approvals.actions";

// Cart B2B actions
export {
  // Item operations
  addItem,
  updateItemQuantity,
  removeItem,
  updateItemNotes,
  clearCart,
  // Bulk operations
  addItemsBulk,
  // Cart metadata
  setShippingAddress,
  setPurchaseOrderNumber,
  setCartNotes,
  // Totals and validation
  updateTotals,
  updateSpendingValidation,
  // Loading states
  cartLoadingStart,
  cartLoadingSuccess,
  cartLoadingFailure,
  // Hydration
  hydrateCart,
  // Reset/clear
  resetCartState,
  clearCartError,
  // Async types
  CartB2BAsyncActionTypes,
  type CartB2BAsyncActions,
} from "./cart-b2b.actions";
