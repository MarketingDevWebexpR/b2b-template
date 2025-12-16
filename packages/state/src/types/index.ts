/**
 * Types Module
 *
 * Exports all state and action type definitions.
 *
 * @packageDocumentation
 */

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
} from "./state";

export {
  initialPaginationState,
  initialCompanyState,
  initialQuotesState,
  initialApprovalsState,
  initialSpendingValidation,
  initialCartTotals,
  initialCartB2BState,
  initialRootState,
} from "./state";

// Action types
export {
  CompanyActionTypes,
  QuotesActionTypes,
  ApprovalsActionTypes,
  CartB2BActionTypes,
} from "./actions";

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
} from "./actions";
