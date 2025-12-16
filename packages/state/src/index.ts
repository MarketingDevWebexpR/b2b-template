/**
 * @maison/state
 *
 * Shared B2B state management for the Maison monorepo.
 * Provides reducers, selectors, and actions for managing:
 * - Company and employee context
 * - Quotes management
 * - Approval workflows
 * - B2B cart with spending validation
 *
 * All state management utilities are pure functions compatible with
 * Redux, Zustand, useReducer, or any similar state management library.
 *
 * @packageDocumentation
 *
 * @example
 * ```ts
 * // With React useReducer
 * import { rootReducer, initialRootState, selectCanCheckout } from '@maison/state';
 *
 * function App() {
 *   const [state, dispatch] = useReducer(rootReducer, initialRootState);
 *   const canCheckout = selectCanCheckout(state);
 *   // ...
 * }
 * ```
 *
 * @example
 * ```ts
 * // With Redux
 * import { createStore } from 'redux';
 * import { rootReducer, addItem } from '@maison/state';
 *
 * const store = createStore(rootReducer);
 * store.dispatch(addItem(cartItem));
 * ```
 *
 * @example
 * ```ts
 * // With Zustand
 * import { create } from 'zustand';
 * import { rootReducer, initialRootState, type RootState, type RootAction } from '@maison/state';
 *
 * const useStore = create<RootState & { dispatch: (action: RootAction) => void }>((set) => ({
 *   ...initialRootState,
 *   dispatch: (action) => set((state) => rootReducer(state, action)),
 * }));
 * ```
 */

// ============================================
// Types
// ============================================

// State types
export type {
  LoadingStatus,
  AsyncState,
  CompanyState,
  QuotesState,
  ApprovalsState,
  B2BCartItem,
  SpendingValidation,
  B2BCartTotals,
  CartB2BState,
  PaginationState,
  RootState,
} from "./types";

// Action types
export type {
  // Company actions
  FetchCompanyStartAction,
  FetchCompanySuccessAction,
  FetchCompanyFailureAction,
  SetCurrentCompanyAction,
  SetCurrentEmployeeAction,
  LoadEmployeesAction,
  ResetCompanyStateAction,
  ClearCompanyErrorAction,
  CompanyAction,
  // Quotes actions
  FetchQuotesStartAction,
  FetchQuotesSuccessAction,
  FetchQuotesFailureAction,
  FetchQuoteDetailStartAction,
  FetchQuoteDetailSuccessAction,
  FetchQuoteDetailFailureAction,
  SelectQuoteAction,
  ClearSelectedQuoteAction,
  SetQuoteFiltersAction,
  SetQuoteStatusFilterAction,
  SetQuoteSearchAction,
  ClearQuoteFiltersAction,
  SetQuotesPaginationAction,
  SetQuotesPageAction,
  CreateQuoteSuccessAction,
  UpdateQuoteSuccessAction,
  ResetQuotesStateAction,
  ClearQuotesErrorAction,
  QuotesAction,
  // Approvals actions
  FetchApprovalsStartAction,
  FetchApprovalsSuccessAction,
  FetchApprovalsFailureAction,
  FetchPendingStartAction,
  FetchPendingSuccessAction,
  FetchPendingFailureAction,
  FetchApprovalDetailStartAction,
  FetchApprovalDetailSuccessAction,
  FetchApprovalDetailFailureAction,
  SelectApprovalAction,
  ClearSelectedApprovalAction,
  SetApprovalFiltersAction,
  SetApprovalStatusFilterAction,
  ClearApprovalFiltersAction,
  SetApprovalsPaginationAction,
  SetApprovalsPageAction,
  ApprovalActionSuccessAction,
  UpdatePendingCountAction,
  ResetApprovalsStateAction,
  ClearApprovalsErrorAction,
  ApprovalsAction,
  // Cart B2B actions
  AddItemAction,
  UpdateItemQuantityAction,
  RemoveItemAction,
  UpdateItemNotesAction,
  ClearCartAction,
  AddItemsBulkAction,
  SetShippingAddressAction,
  SetPurchaseOrderNumberAction,
  SetCartNotesAction,
  UpdateTotalsAction,
  UpdateSpendingValidationAction,
  CartLoadingStartAction,
  CartLoadingSuccessAction,
  CartLoadingFailureAction,
  HydrateCartAction,
  ResetCartStateAction,
  ClearCartErrorAction,
  CartB2BAction,
  // Root action
  RootAction,
} from "./types";

// Action type constants
export {
  CompanyActionTypes,
  QuotesActionTypes,
  ApprovalsActionTypes,
  CartB2BActionTypes,
} from "./types";

// Initial states
export {
  initialPaginationState,
  initialCompanyState,
  initialQuotesState,
  initialApprovalsState,
  initialSpendingValidation,
  initialCartTotals,
  initialCartB2BState,
  initialRootState,
} from "./types";

// ============================================
// Reducers
// ============================================

export {
  companyReducer,
  quotesReducer,
  approvalsReducer,
  cartB2BReducer,
  rootReducer,
  reducers,
  type Reducers,
} from "./reducers";

// ============================================
// Selectors
// ============================================

// Company selectors
export {
  selectCompanyState,
  selectCurrentCompany,
  selectCurrentEmployee,
  selectEmployees,
  selectIsB2BActive,
  selectCompanyStatus,
  selectIsCompanyLoading,
  selectCompanyError,
  selectCompanyLastRefreshed,
  selectCurrentCompanyId,
  selectCurrentCompanyName,
  selectCurrentCompanyTier,
  selectCompanyAvailableCredit,
  selectCompanyCreditLimit,
  selectCompanyCreditUsagePercent,
  selectCompanyPaymentTerms,
  selectCompanyAddresses,
  selectDefaultShippingAddressId,
  selectDefaultBillingAddressId,
  selectCurrentEmployeeId,
  selectCurrentEmployeeName,
  selectCurrentEmployeeRole,
  selectCurrentEmployeePermissions,
  selectHasPermission,
  selectIsApprover,
  selectEmployeeApprovalLimit,
  selectEmployeeSpendingLimits,
  selectEmployeeCurrentSpending,
  selectEmployeeById,
  selectApproverEmployees,
  selectEmployeeCount,
  selectCanCreateOrders,
  selectCanCreateQuotes,
  selectCanApproveOrders,
  selectRequiresOrderApproval,
} from "./selectors";

// Quotes selectors
export {
  selectQuotesState,
  selectQuotes,
  selectSelectedQuote,
  selectQuoteFilters,
  selectActiveStatusFilter,
  selectQuoteSearchQuery,
  selectQuotesListStatus,
  selectIsQuotesLoading,
  selectQuoteDetailStatus,
  selectIsQuoteDetailLoading,
  selectQuotesError,
  selectQuotesPagination,
  selectQuotesCurrentPage,
  selectQuotesTotalCount,
  selectQuotesHasNextPage,
  selectQuotesHasPreviousPage,
  selectQuoteById,
  selectQuotesByStatus,
  selectFilteredQuotes,
  selectQuoteCountByStatus,
  selectQuotesWithUnreadMessages,
  selectUnreadQuotesCount,
  selectExpiringQuotes,
  selectHasQuotes,
  selectQuotesTotalValue,
  selectSelectedQuoteId,
  selectSelectedQuoteStatus,
  selectSelectedQuoteItems,
  selectSelectedQuoteTotals,
  selectCanAcceptSelectedQuote,
  selectCanEditSelectedQuote,
} from "./selectors";

// Approvals selectors
export {
  selectApprovalsState,
  selectPendingApprovals,
  selectAllApprovals,
  selectSelectedApproval,
  selectPendingApprovalCount,
  selectApprovalCount,
  selectApprovalFilters,
  selectApprovalStatusFilter,
  selectApprovalsListStatus,
  selectIsApprovalsLoading,
  selectApprovalDetailStatus,
  selectIsApprovalDetailLoading,
  selectApprovalsError,
  selectApprovalsPagination,
  selectApprovalsCurrentPage,
  selectApprovalsTotalCount,
  selectApprovalById,
  selectApprovalsByStatus,
  selectApprovalsByEntityType,
  selectPendingOrderApprovals,
  selectPendingQuoteApprovals,
  selectOverdueApprovals,
  selectOverdueApprovalCount,
  selectHighPriorityApprovals,
  selectHasPendingApprovals,
  selectPendingApprovalsTotalValue,
  selectApprovalCountsByStatus,
  selectSelectedApprovalId,
  selectSelectedApprovalStatus,
  selectSelectedApprovalSteps,
  selectSelectedApprovalCurrentLevel,
  selectCanActionSelectedApproval,
  selectIsSelectedApprovalOverdue,
} from "./selectors";

// Cart selectors
export {
  selectCartB2BState,
  selectCartItems,
  selectCartItemCount,
  selectCartTotals,
  selectCartTotal,
  selectSpendingValidation,
  selectCanCheckout,
  selectCheckoutBlockedReason,
  selectCartStatus,
  selectIsCartLoading,
  selectCartError,
  selectCartLastUpdated,
  selectCartShippingAddressId,
  selectCartPurchaseOrderNumber,
  selectCartNotes,
  selectCartItemByProductId,
  selectCartItemQuantity,
  selectIsProductInCart,
  selectCartUniqueItemCount,
  selectCartSubtotal,
  selectCartTierDiscount,
  selectCartVolumeDiscount,
  selectCartTotalDiscount,
  selectCartShippingEstimate,
  selectCartTax,
  selectCartCurrency,
  selectIsWithinSpendingLimits,
  selectRequiresApproval,
  selectApprovalReason,
  selectApplicableSpendingLimits,
  selectSpendingWarnings,
  selectHasSpendingWarnings,
  selectIsCartEmpty,
  selectInvalidQuantityItems,
  selectAllQuantitiesValid,
  selectCartTotalQuantity,
  selectAverageItemPrice,
  selectCartForPersistence,
  selectCheckoutSummary,
  type CheckoutSummary,
} from "./selectors";

// ============================================
// Utilities
// ============================================

// Memoization utilities for creating optimized selectors
export {
  createSelector,
  createDerivedSelector,
  createShallowEqualSelector,
  createParameterizedSelector,
  createDerivedShallowSelector,
} from "./utils";

// ============================================
// Action Creators
// ============================================

// Company actions
export {
  fetchCompanyStart,
  fetchCompanySuccess,
  fetchCompanyFailure,
  setCurrentCompany,
  setCurrentEmployee,
  loadEmployees,
  resetCompanyState,
  clearCompanyError,
  CompanyAsyncActionTypes,
  type CompanyAsyncActions,
} from "./actions";

// Quotes actions
export {
  fetchQuotesStart,
  fetchQuotesSuccess,
  fetchQuotesFailure,
  fetchQuoteDetailStart,
  fetchQuoteDetailSuccess,
  fetchQuoteDetailFailure,
  selectQuote,
  clearSelectedQuote,
  setQuoteFilters,
  setQuoteStatusFilter,
  setQuoteSearch,
  clearQuoteFilters,
  setQuotesPagination,
  setQuotesPage,
  createQuoteSuccess,
  updateQuoteSuccess,
  resetQuotesState,
  clearQuotesError,
  QuotesAsyncActionTypes,
  type QuotesAsyncActions,
} from "./actions";

// Approvals actions
export {
  fetchApprovalsStart,
  fetchApprovalsSuccess,
  fetchApprovalsFailure,
  fetchPendingStart,
  fetchPendingSuccess,
  fetchPendingFailure,
  fetchApprovalDetailStart,
  fetchApprovalDetailSuccess,
  fetchApprovalDetailFailure,
  selectApproval,
  clearSelectedApproval,
  setApprovalFilters,
  setApprovalStatusFilter,
  clearApprovalFilters,
  setApprovalsPagination,
  setApprovalsPage,
  approvalActionSuccess,
  updatePendingCount,
  resetApprovalsState,
  clearApprovalsError,
  ApprovalsAsyncActionTypes,
  type ApprovalsAsyncActions,
} from "./actions";

// Cart B2B actions
export {
  addItem,
  updateItemQuantity,
  removeItem,
  updateItemNotes,
  clearCart,
  addItemsBulk,
  setShippingAddress,
  setPurchaseOrderNumber,
  setCartNotes,
  updateTotals,
  updateSpendingValidation,
  cartLoadingStart,
  cartLoadingSuccess,
  cartLoadingFailure,
  hydrateCart,
  resetCartState,
  clearCartError,
  CartB2BAsyncActionTypes,
  type CartB2BAsyncActions,
} from "./actions";
