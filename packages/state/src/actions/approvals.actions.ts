/**
 * Approvals Action Creators
 *
 * Factory functions for creating type-safe approvals actions.
 * All action creators are pure functions with no side effects.
 *
 * @packageDocumentation
 */

import type {
  ApprovalRequest,
  ApprovalSummary,
  ApprovalFilters,
  ApprovalStatus,
  ApprovalAction,
} from "@maison/types";
import type { PaginationState } from "../types/state";
import {
  ApprovalsActionTypes,
  type FetchApprovalsStartAction,
  type FetchApprovalsSuccessAction,
  type FetchApprovalsFailureAction,
  type FetchPendingStartAction,
  type FetchPendingSuccessAction,
  type FetchPendingFailureAction,
  type FetchApprovalDetailStartAction,
  type FetchApprovalDetailSuccessAction,
  type FetchApprovalDetailFailureAction,
  type SelectApprovalAction,
  type ClearSelectedApprovalAction,
  type SetApprovalFiltersAction,
  type SetApprovalStatusFilterAction,
  type ClearApprovalFiltersAction,
  type SetApprovalsPaginationAction,
  type SetApprovalsPageAction,
  type ApprovalActionSuccessAction,
  type UpdatePendingCountAction,
  type ResetApprovalsStateAction,
  type ClearApprovalsErrorAction,
} from "../types/actions";

// ============================================
// Fetch All Approvals Actions
// ============================================

/**
 * Creates an action to start fetching approvals list.
 *
 * @returns Fetch approvals start action
 */
export function fetchApprovalsStart(): FetchApprovalsStartAction {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_START,
  };
}

/**
 * Creates an action for successful approvals fetch.
 *
 * @param approvals - Array of approval summaries
 * @param pagination - Pagination state
 * @returns Fetch approvals success action
 */
export function fetchApprovalsSuccess(
  approvals: readonly ApprovalSummary[],
  pagination: PaginationState
): FetchApprovalsSuccessAction {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_SUCCESS,
    payload: {
      approvals,
      pagination,
    },
  };
}

/**
 * Creates an action for failed approvals fetch.
 *
 * @param error - Error message
 * @returns Fetch approvals failure action
 */
export function fetchApprovalsFailure(
  error: string
): FetchApprovalsFailureAction {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVALS_FAILURE,
    payload: {
      error,
    },
  };
}

// ============================================
// Fetch Pending Approvals Actions
// ============================================

/**
 * Creates an action to start fetching pending approvals.
 *
 * @returns Fetch pending start action
 */
export function fetchPendingStart(): FetchPendingStartAction {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_START,
  };
}

/**
 * Creates an action for successful pending approvals fetch.
 *
 * @param approvals - Array of pending approval summaries
 * @param count - Total count of pending approvals
 * @returns Fetch pending success action
 */
export function fetchPendingSuccess(
  approvals: readonly ApprovalSummary[],
  count: number
): FetchPendingSuccessAction {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_SUCCESS,
    payload: {
      approvals,
      count,
    },
  };
}

/**
 * Creates an action for failed pending approvals fetch.
 *
 * @param error - Error message
 * @returns Fetch pending failure action
 */
export function fetchPendingFailure(error: string): FetchPendingFailureAction {
  return {
    type: ApprovalsActionTypes.FETCH_PENDING_FAILURE,
    payload: {
      error,
    },
  };
}

// ============================================
// Fetch Approval Detail Actions
// ============================================

/**
 * Creates an action to start fetching approval details.
 *
 * @returns Fetch approval detail start action
 */
export function fetchApprovalDetailStart(): FetchApprovalDetailStartAction {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_START,
  };
}

/**
 * Creates an action for successful approval detail fetch.
 *
 * @param approval - Full approval request data
 * @returns Fetch approval detail success action
 */
export function fetchApprovalDetailSuccess(
  approval: ApprovalRequest
): FetchApprovalDetailSuccessAction {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_SUCCESS,
    payload: {
      approval,
    },
  };
}

/**
 * Creates an action for failed approval detail fetch.
 *
 * @param error - Error message
 * @returns Fetch approval detail failure action
 */
export function fetchApprovalDetailFailure(
  error: string
): FetchApprovalDetailFailureAction {
  return {
    type: ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_FAILURE,
    payload: {
      error,
    },
  };
}

// ============================================
// Selection Actions
// ============================================

/**
 * Creates an action to select an approval.
 *
 * @param approvalId - ID of the approval to select
 * @returns Select approval action
 */
export function selectApproval(approvalId: string): SelectApprovalAction {
  return {
    type: ApprovalsActionTypes.SELECT_APPROVAL,
    payload: {
      approvalId,
    },
  };
}

/**
 * Creates an action to clear the selected approval.
 *
 * @returns Clear selected approval action
 */
export function clearSelectedApproval(): ClearSelectedApprovalAction {
  return {
    type: ApprovalsActionTypes.CLEAR_SELECTED_APPROVAL,
  };
}

// ============================================
// Filter Actions
// ============================================

/**
 * Creates an action to set approval filters.
 *
 * @param filters - Approval filters to apply
 * @returns Set approval filters action
 */
export function setApprovalFilters(
  filters: ApprovalFilters
): SetApprovalFiltersAction {
  return {
    type: ApprovalsActionTypes.SET_APPROVAL_FILTERS,
    payload: {
      filters,
    },
  };
}

/**
 * Creates an action to set the status filter.
 *
 * @param status - Status to filter by, or 'all' for no filter
 * @returns Set approval status filter action
 */
export function setApprovalStatusFilter(
  status: ApprovalStatus | "all"
): SetApprovalStatusFilterAction {
  return {
    type: ApprovalsActionTypes.SET_APPROVAL_STATUS_FILTER,
    payload: {
      status,
    },
  };
}

/**
 * Creates an action to clear all approval filters.
 *
 * @returns Clear approval filters action
 */
export function clearApprovalFilters(): ClearApprovalFiltersAction {
  return {
    type: ApprovalsActionTypes.CLEAR_APPROVAL_FILTERS,
  };
}

// ============================================
// Pagination Actions
// ============================================

/**
 * Creates an action to set approvals pagination.
 *
 * @param pagination - Pagination state
 * @returns Set approvals pagination action
 */
export function setApprovalsPagination(
  pagination: PaginationState
): SetApprovalsPaginationAction {
  return {
    type: ApprovalsActionTypes.SET_APPROVALS_PAGINATION,
    payload: {
      pagination,
    },
  };
}

/**
 * Creates an action to set the current page.
 *
 * @param page - Page number (1-indexed)
 * @returns Set approvals page action
 */
export function setApprovalsPage(page: number): SetApprovalsPageAction {
  return {
    type: ApprovalsActionTypes.SET_APPROVALS_PAGE,
    payload: {
      page,
    },
  };
}

// ============================================
// Approval Action Operations
// ============================================

/**
 * Creates an action for successful approval action (approve, reject, etc.).
 *
 * @param approvalId - ID of the approval
 * @param action - Action that was taken
 * @param updatedApproval - Updated approval data
 * @returns Approval action success action
 */
export function approvalActionSuccess(
  approvalId: string,
  action: ApprovalAction,
  updatedApproval: ApprovalRequest
): ApprovalActionSuccessAction {
  return {
    type: ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS,
    payload: {
      approvalId,
      action,
      updatedApproval,
    },
  };
}

/**
 * Creates an action to update the pending count.
 *
 * @param count - New pending count
 * @returns Update pending count action
 */
export function updatePendingCount(count: number): UpdatePendingCountAction {
  return {
    type: ApprovalsActionTypes.UPDATE_PENDING_COUNT,
    payload: {
      count,
    },
  };
}

// ============================================
// Reset and Clear Actions
// ============================================

/**
 * Creates an action to reset approvals state to initial values.
 *
 * @returns Reset approvals state action
 */
export function resetApprovalsState(): ResetApprovalsStateAction {
  return {
    type: ApprovalsActionTypes.RESET_APPROVALS_STATE,
  };
}

/**
 * Creates an action to clear approvals error.
 *
 * @returns Clear approvals error action
 */
export function clearApprovalsError(): ClearApprovalsErrorAction {
  return {
    type: ApprovalsActionTypes.CLEAR_APPROVALS_ERROR,
  };
}

// ============================================
// Async Action Types (for thunks/sagas)
// ============================================

/**
 * Async action type constants for approvals operations.
 */
export const ApprovalsAsyncActionTypes = {
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
  REQUEST_INFO: "approvals/requestInfo",
} as const;

/**
 * Async action creator types for external implementation.
 */
export interface ApprovalsAsyncActions {
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
  delegate: (
    approvalId: string,
    delegateTo: string,
    comment?: string
  ) => Promise<void>;
  /** Requests more information */
  requestInfo: (approvalId: string, comment: string) => Promise<void>;
}
