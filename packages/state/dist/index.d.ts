export { a as ApprovalsState, A as AsyncState, B as B2BCartItem, b as B2BCartTotals, c as CartB2BState, C as CompanyState, L as LoadingStatus, P as PaginationState, Q as QuotesState, R as RootState, S as SpendingValidation, f as initialApprovalsState, j as initialCartB2BState, h as initialCartTotals, d as initialCompanyState, i as initialPaginationState, e as initialQuotesState, k as initialRootState, g as initialSpendingValidation } from './state-RCP8oCT3.js';
export { X as AddItemAction, a0 as AddItemsBulkAction, O as ApprovalActionSuccessAction, W as ApprovalsAction, ag as ApprovalsActionTypes, ac as CartB2BAction, ah as CartB2BActionTypes, a8 as CartLoadingFailureAction, a6 as CartLoadingStartAction, a7 as CartLoadingSuccessAction, K as ClearApprovalFiltersAction, V as ClearApprovalsErrorAction, $ as ClearCartAction, ab as ClearCartErrorAction, C as ClearCompanyErrorAction, p as ClearQuoteFiltersAction, u as ClearQuotesErrorAction, H as ClearSelectedApprovalAction, l as ClearSelectedQuoteAction, d as CompanyAction, ae as CompanyActionTypes, s as CreateQuoteSuccessAction, E as FetchApprovalDetailFailureAction, B as FetchApprovalDetailStartAction, D as FetchApprovalDetailSuccessAction, x as FetchApprovalsFailureAction, v as FetchApprovalsStartAction, w as FetchApprovalsSuccessAction, b as FetchCompanyFailureAction, F as FetchCompanyStartAction, a as FetchCompanySuccessAction, A as FetchPendingFailureAction, y as FetchPendingStartAction, z as FetchPendingSuccessAction, j as FetchQuoteDetailFailureAction, h as FetchQuoteDetailStartAction, i as FetchQuoteDetailSuccessAction, g as FetchQuotesFailureAction, e as FetchQuotesStartAction, f as FetchQuotesSuccessAction, a9 as HydrateCartAction, L as LoadEmployeesAction, Q as QuotesAction, af as QuotesActionTypes, Z as RemoveItemAction, T as ResetApprovalsStateAction, aa as ResetCartStateAction, R as ResetCompanyStateAction, t as ResetQuotesStateAction, ad as RootAction, G as SelectApprovalAction, k as SelectQuoteAction, I as SetApprovalFiltersAction, J as SetApprovalStatusFilterAction, N as SetApprovalsPageAction, M as SetApprovalsPaginationAction, a3 as SetCartNotesAction, S as SetCurrentCompanyAction, c as SetCurrentEmployeeAction, a2 as SetPurchaseOrderNumberAction, m as SetQuoteFiltersAction, o as SetQuoteSearchAction, n as SetQuoteStatusFilterAction, r as SetQuotesPageAction, q as SetQuotesPaginationAction, a1 as SetShippingAddressAction, _ as UpdateItemNotesAction, Y as UpdateItemQuantityAction, P as UpdatePendingCountAction, U as UpdateQuoteSuccessAction, a5 as UpdateSpendingValidationAction, a4 as UpdateTotalsAction } from './actions-ONThwaCz.js';
export { Reducers, approvalsReducer, cartB2BReducer, companyReducer, quotesReducer, reducers, default as rootReducer } from './reducers/index.js';
export { CheckoutSummary, selectActiveStatusFilter, selectAllApprovals, selectAllQuantitiesValid, selectApplicableSpendingLimits, selectApprovalById, selectApprovalCount, selectApprovalCountsByStatus, selectApprovalDetailStatus, selectApprovalFilters, selectApprovalReason, selectApprovalStatusFilter, selectApprovalsByEntityType, selectApprovalsByStatus, selectApprovalsCurrentPage, selectApprovalsError, selectApprovalsListStatus, selectApprovalsPagination, selectApprovalsState, selectApprovalsTotalCount, selectApproverEmployees, selectAverageItemPrice, selectCanAcceptSelectedQuote, selectCanActionSelectedApproval, selectCanApproveOrders, selectCanCheckout, selectCanCreateOrders, selectCanCreateQuotes, selectCanEditSelectedQuote, selectCartB2BState, selectCartCurrency, selectCartError, selectCartForPersistence, selectCartItemByProductId, selectCartItemCount, selectCartItemQuantity, selectCartItems, selectCartLastUpdated, selectCartNotes, selectCartPurchaseOrderNumber, selectCartShippingAddressId, selectCartShippingEstimate, selectCartStatus, selectCartSubtotal, selectCartTax, selectCartTierDiscount, selectCartTotal, selectCartTotalDiscount, selectCartTotalQuantity, selectCartTotals, selectCartUniqueItemCount, selectCartVolumeDiscount, selectCheckoutBlockedReason, selectCheckoutSummary, selectCompanyAddresses, selectCompanyAvailableCredit, selectCompanyCreditLimit, selectCompanyCreditUsagePercent, selectCompanyError, selectCompanyLastRefreshed, selectCompanyPaymentTerms, selectCompanyState, selectCompanyStatus, selectCurrentCompany, selectCurrentCompanyId, selectCurrentCompanyName, selectCurrentCompanyTier, selectCurrentEmployee, selectCurrentEmployeeId, selectCurrentEmployeeName, selectCurrentEmployeePermissions, selectCurrentEmployeeRole, selectDefaultBillingAddressId, selectDefaultShippingAddressId, selectEmployeeApprovalLimit, selectEmployeeById, selectEmployeeCount, selectEmployeeCurrentSpending, selectEmployeeSpendingLimits, selectEmployees, selectExpiringQuotes, selectFilteredQuotes, selectHasPendingApprovals, selectHasPermission, selectHasQuotes, selectHasSpendingWarnings, selectHighPriorityApprovals, selectInvalidQuantityItems, selectIsApprovalDetailLoading, selectIsApprovalsLoading, selectIsApprover, selectIsB2BActive, selectIsCartEmpty, selectIsCartLoading, selectIsCompanyLoading, selectIsProductInCart, selectIsQuoteDetailLoading, selectIsQuotesLoading, selectIsSelectedApprovalOverdue, selectIsWithinSpendingLimits, selectOverdueApprovalCount, selectOverdueApprovals, selectPendingApprovalCount, selectPendingApprovals, selectPendingApprovalsTotalValue, selectPendingOrderApprovals, selectPendingQuoteApprovals, selectQuoteById, selectQuoteCountByStatus, selectQuoteDetailStatus, selectQuoteFilters, selectQuoteSearchQuery, selectQuotes, selectQuotesByStatus, selectQuotesCurrentPage, selectQuotesError, selectQuotesHasNextPage, selectQuotesHasPreviousPage, selectQuotesListStatus, selectQuotesPagination, selectQuotesState, selectQuotesTotalCount, selectQuotesTotalValue, selectQuotesWithUnreadMessages, selectRequiresApproval, selectRequiresOrderApproval, selectSelectedApproval, selectSelectedApprovalCurrentLevel, selectSelectedApprovalId, selectSelectedApprovalStatus, selectSelectedApprovalSteps, selectSelectedQuote, selectSelectedQuoteId, selectSelectedQuoteItems, selectSelectedQuoteStatus, selectSelectedQuoteTotals, selectSpendingValidation, selectSpendingWarnings, selectUnreadQuotesCount } from './selectors/index.js';
export { ApprovalsAsyncActionTypes, ApprovalsAsyncActions, CartB2BAsyncActionTypes, CartB2BAsyncActions, CompanyAsyncActionTypes, CompanyAsyncActions, QuotesAsyncActionTypes, QuotesAsyncActions, addItem, addItemsBulk, approvalActionSuccess, cartLoadingFailure, cartLoadingStart, cartLoadingSuccess, clearApprovalFilters, clearApprovalsError, clearCart, clearCartError, clearCompanyError, clearQuoteFilters, clearQuotesError, clearSelectedApproval, clearSelectedQuote, createQuoteSuccess, fetchApprovalDetailFailure, fetchApprovalDetailStart, fetchApprovalDetailSuccess, fetchApprovalsFailure, fetchApprovalsStart, fetchApprovalsSuccess, fetchCompanyFailure, fetchCompanyStart, fetchCompanySuccess, fetchPendingFailure, fetchPendingStart, fetchPendingSuccess, fetchQuoteDetailFailure, fetchQuoteDetailStart, fetchQuoteDetailSuccess, fetchQuotesFailure, fetchQuotesStart, fetchQuotesSuccess, hydrateCart, loadEmployees, removeItem, resetApprovalsState, resetCartState, resetCompanyState, resetQuotesState, selectApproval, selectQuote, setApprovalFilters, setApprovalStatusFilter, setApprovalsPage, setApprovalsPagination, setCartNotes, setCurrentCompany, setCurrentEmployee, setPurchaseOrderNumber, setQuoteFilters, setQuoteSearch, setQuoteStatusFilter, setQuotesPage, setQuotesPagination, setShippingAddress, updateItemNotes, updateItemQuantity, updatePendingCount, updateQuoteSuccess, updateSpendingValidation, updateTotals } from './actions/index.js';
import '@maison/types';

/**
 * Memoization Utilities
 *
 * Provides memoization functions for selectors to prevent unnecessary re-renders
 * by caching results and returning the same reference when inputs haven't changed.
 *
 * @packageDocumentation
 */
/**
 * Creates a memoized selector that caches its result.
 * Returns the cached result if the input state reference is unchanged.
 *
 * @param selector - The selector function to memoize
 * @returns A memoized version of the selector
 *
 * @example
 * ```ts
 * const selectFilteredItems = createSelector(
 *   (state: RootState) => state.items.filter(item => item.active)
 * );
 * ```
 */
declare function createSelector<TState, TResult>(selector: (state: TState) => TResult): (state: TState) => TResult;
/**
 * Selector function type for derived selectors
 */
type SelectorFunction<TState, TResult> = (state: TState) => TResult;
/**
 * Creates a memoized selector that derives data from multiple input selectors.
 * Only recalculates when any of the input selectors return a new reference.
 *
 * @param dependencies - Array of input selector functions
 * @param combiner - Function that combines the results of input selectors
 * @returns A memoized derived selector
 *
 * @example
 * ```ts
 * const selectFilteredQuotes = createDerivedSelector(
 *   [selectQuotes, selectActiveStatusFilter, selectSearchQuery],
 *   (quotes, statusFilter, searchQuery) => {
 *     // Only recalculates when quotes, statusFilter, or searchQuery changes
 *     return quotes.filter(q => q.status === statusFilter);
 *   }
 * );
 * ```
 */
declare function createDerivedSelector<TState, T1, TResult>(dependencies: [SelectorFunction<TState, T1>], combiner: (dep1: T1) => TResult): (state: TState) => TResult;
declare function createDerivedSelector<TState, T1, T2, TResult>(dependencies: [SelectorFunction<TState, T1>, SelectorFunction<TState, T2>], combiner: (dep1: T1, dep2: T2) => TResult): (state: TState) => TResult;
declare function createDerivedSelector<TState, T1, T2, T3, TResult>(dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>
], combiner: (dep1: T1, dep2: T2, dep3: T3) => TResult): (state: TState) => TResult;
declare function createDerivedSelector<TState, T1, T2, T3, T4, TResult>(dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>
], combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4) => TResult): (state: TState) => TResult;
declare function createDerivedSelector<TState, T1, T2, T3, T4, T5, TResult>(dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>,
    SelectorFunction<TState, T5>
], combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4, dep5: T5) => TResult): (state: TState) => TResult;
declare function createDerivedSelector<TState, T1, T2, T3, T4, T5, T6, TResult>(dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>,
    SelectorFunction<TState, T5>,
    SelectorFunction<TState, T6>
], combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4, dep5: T5, dep6: T6) => TResult): (state: TState) => TResult;
/**
 * Creates a memoized selector with shallow equality checking on the result.
 * Returns the cached result if the new result is shallowly equal to the previous one.
 * Useful for selectors that return objects with primitive values.
 *
 * @param selector - The selector function to memoize
 * @returns A memoized version with shallow equality checking
 *
 * @example
 * ```ts
 * const selectSpendingLimits = createShallowEqualSelector(
 *   (state: RootState) => ({
 *     perOrder: state.employee?.spendingLimitPerOrder ?? null,
 *     daily: state.employee?.spendingLimitDaily ?? null,
 *   })
 * );
 * ```
 */
declare function createShallowEqualSelector<TState, TResult extends Record<string, unknown>>(selector: (state: TState) => TResult): (state: TState) => TResult;
/**
 * Creates a memoized selector for parameterized access with a fixed cache size.
 * Caches results based on both state and a parameter.
 *
 * @param selector - The selector function that takes state and a parameter
 * @param cacheSize - Maximum number of cached entries (default: 10)
 * @returns A memoized version of the parameterized selector
 *
 * @example
 * ```ts
 * const selectQuotesByStatus = createParameterizedSelector(
 *   (state: RootState, status: QuoteStatus) =>
 *     state.quotes.quotes.filter(q => q.status === status)
 * );
 * ```
 */
declare function createParameterizedSelector<TState, TParam, TResult>(selector: (state: TState, param: TParam) => TResult, cacheSize?: number): (state: TState, param: TParam) => TResult;
/**
 * Creates a derived selector with shallow equality checking on the result.
 * Combines the benefits of derived selectors with result stability.
 *
 * @param dependencies - Array of input selector functions
 * @param combiner - Function that combines the results of input selectors
 * @returns A memoized derived selector with shallow equality
 */
declare function createDerivedShallowSelector<TState, T1, TResult extends Record<string, unknown>>(dependencies: [SelectorFunction<TState, T1>], combiner: (dep1: T1) => TResult): (state: TState) => TResult;
declare function createDerivedShallowSelector<TState, T1, T2, TResult extends Record<string, unknown>>(dependencies: [SelectorFunction<TState, T1>, SelectorFunction<TState, T2>], combiner: (dep1: T1, dep2: T2) => TResult): (state: TState) => TResult;
declare function createDerivedShallowSelector<TState, T1, T2, T3, TResult extends Record<string, unknown>>(dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>
], combiner: (dep1: T1, dep2: T2, dep3: T3) => TResult): (state: TState) => TResult;
declare function createDerivedShallowSelector<TState, T1, T2, T3, T4, TResult extends Record<string, unknown>>(dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>
], combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4) => TResult): (state: TState) => TResult;
declare function createDerivedShallowSelector<TState, T1, T2, T3, T4, T5, TResult extends Record<string, unknown>>(dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>,
    SelectorFunction<TState, T5>
], combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4, dep5: T5) => TResult): (state: TState) => TResult;
declare function createDerivedShallowSelector<TState, T1, T2, T3, T4, T5, T6, TResult extends Record<string, unknown>>(dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>,
    SelectorFunction<TState, T5>,
    SelectorFunction<TState, T6>
], combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4, dep5: T5, dep6: T6) => TResult): (state: TState) => TResult;

export { createDerivedSelector, createDerivedShallowSelector, createParameterizedSelector, createSelector, createShallowEqualSelector };
