/**
 * Approvals Reducer
 *
 * Manages approval requests, filters, and pending counts for B2B workflow management.
 * Pure function with no side effects - compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

import type { ApprovalsState } from "../types/state";
import type { ApprovalsAction } from "../types/actions";
import { ApprovalsActionTypes } from "../types/actions";
import { initialApprovalsState } from "../types/state";

/**
 * Calculates pagination metadata from raw values.
 *
 * @param currentPage - Current page number
 * @param pageSize - Items per page
 * @param totalItems - Total number of items
 * @returns Complete pagination state
 */
function calculatePagination(
  currentPage: number,
  pageSize: number,
  totalItems: number
): {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
} {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Reducer for approvals state management.
 *
 * Handles:
 * - Fetching pending and all approval requests
 * - Fetching approval details
 * - Filtering and searching approvals
 * - Approval selection
 * - Processing approval actions (approve, reject, etc.)
 * - Tracking pending approval counts
 * - Pagination
 *
 * @param state - Current approvals state
 * @param action - Action to process
 * @returns New approvals state
 *
 * @example
 * ```ts
 * const newState = approvalsReducer(currentState, {
 *   type: ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS,
 *   payload: { approvalId: '123', action: 'approve', updatedApproval: approval }
 * });
 * ```
 */
export function approvalsReducer(
  state: ApprovalsState = initialApprovalsState,
  action: ApprovalsAction
): ApprovalsState {
  switch (action.type) {
    case ApprovalsActionTypes.FETCH_APPROVALS_START: {
      return {
        ...state,
        listStatus: "loading",
        error: null,
      };
    }

    case ApprovalsActionTypes.FETCH_APPROVALS_SUCCESS: {
      return {
        ...state,
        allApprovals: action.payload.approvals,
        pagination: action.payload.pagination,
        listStatus: "succeeded",
        error: null,
      };
    }

    case ApprovalsActionTypes.FETCH_APPROVALS_FAILURE: {
      return {
        ...state,
        listStatus: "failed",
        error: action.payload.error,
      };
    }

    case ApprovalsActionTypes.FETCH_PENDING_START: {
      return {
        ...state,
        listStatus: "loading",
        error: null,
      };
    }

    case ApprovalsActionTypes.FETCH_PENDING_SUCCESS: {
      return {
        ...state,
        pendingApprovals: action.payload.approvals,
        pendingCount: action.payload.count,
        listStatus: "succeeded",
        error: null,
      };
    }

    case ApprovalsActionTypes.FETCH_PENDING_FAILURE: {
      return {
        ...state,
        listStatus: "failed",
        error: action.payload.error,
      };
    }

    case ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_START: {
      return {
        ...state,
        detailStatus: "loading",
        error: null,
      };
    }

    case ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_SUCCESS: {
      return {
        ...state,
        selectedApproval: action.payload.approval,
        detailStatus: "succeeded",
        error: null,
      };
    }

    case ApprovalsActionTypes.FETCH_APPROVAL_DETAIL_FAILURE: {
      return {
        ...state,
        detailStatus: "failed",
        error: action.payload.error,
      };
    }

    case ApprovalsActionTypes.SELECT_APPROVAL: {
      // Selection only - full details should be fetched separately
      return state;
    }

    case ApprovalsActionTypes.CLEAR_SELECTED_APPROVAL: {
      return {
        ...state,
        selectedApproval: null,
        detailStatus: "idle",
      };
    }

    case ApprovalsActionTypes.SET_APPROVAL_FILTERS: {
      return {
        ...state,
        filters: action.payload.filters,
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      };
    }

    case ApprovalsActionTypes.SET_APPROVAL_STATUS_FILTER: {
      // Create new filters, removing status key when 'all' is selected
      const { status: _unusedStatus, ...restFilters } = state.filters;
      const newFilters =
        action.payload.status === "all"
          ? restFilters
          : { ...restFilters, status: action.payload.status };

      return {
        ...state,
        activeStatusFilter: action.payload.status,
        filters: newFilters,
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      };
    }

    case ApprovalsActionTypes.CLEAR_APPROVAL_FILTERS: {
      return {
        ...state,
        filters: {},
        activeStatusFilter: "all",
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      };
    }

    case ApprovalsActionTypes.SET_APPROVALS_PAGINATION: {
      return {
        ...state,
        pagination: action.payload.pagination,
      };
    }

    case ApprovalsActionTypes.SET_APPROVALS_PAGE: {
      const newPagination = calculatePagination(
        action.payload.page,
        state.pagination.pageSize,
        state.pagination.totalItems
      );
      return {
        ...state,
        pagination: newPagination,
      };
    }

    case ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS: {
      const { approvalId, updatedApproval } = action.payload;

      // Create summary from updated approval, handling optional fields properly
      // for exactOptionalPropertyTypes compatibility
      const baseSummary = {
        id: updatedApproval.id,
        requestNumber: updatedApproval.requestNumber,
        entityType: updatedApproval.entityType,
        entityReference: updatedApproval.entityReference,
        entitySummary: updatedApproval.entitySummary,
        requesterName: updatedApproval.requesterName,
        status: updatedApproval.status,
        currentLevel: updatedApproval.currentLevel,
        totalLevels: updatedApproval.totalLevels,
        priority: updatedApproval.priority,
        createdAt: updatedApproval.createdAt,
        isOverdue:
          updatedApproval.dueAt !== undefined &&
          new Date(updatedApproval.dueAt) < new Date(),
      };

      // Build the updated summary with optional properties only when defined
      const updatedSummary = {
        ...baseSummary,
        ...(updatedApproval.entityAmount !== undefined && {
          entityAmount: updatedApproval.entityAmount,
        }),
        ...(updatedApproval.entityCurrency !== undefined && {
          entityCurrency: updatedApproval.entityCurrency,
        }),
        ...(updatedApproval.dueAt !== undefined && {
          dueAt: updatedApproval.dueAt,
        }),
      };

      // Update in all approvals list
      const updatedAllApprovals = state.allApprovals.map((a) =>
        a.id === approvalId ? updatedSummary : a
      );

      // Remove from pending if no longer pending
      const isPending = updatedApproval.status === "pending";
      const updatedPendingApprovals = isPending
        ? state.pendingApprovals.map((a) =>
            a.id === approvalId ? updatedSummary : a
          )
        : state.pendingApprovals.filter((a) => a.id !== approvalId);

      // Update pending count
      const newPendingCount = isPending
        ? state.pendingCount
        : Math.max(0, state.pendingCount - 1);

      return {
        ...state,
        allApprovals: updatedAllApprovals,
        pendingApprovals: updatedPendingApprovals,
        pendingCount: newPendingCount,
        selectedApproval:
          state.selectedApproval?.id === approvalId
            ? updatedApproval
            : state.selectedApproval,
      };
    }

    case ApprovalsActionTypes.UPDATE_PENDING_COUNT: {
      return {
        ...state,
        pendingCount: action.payload.count,
      };
    }

    case ApprovalsActionTypes.RESET_APPROVALS_STATE: {
      return initialApprovalsState;
    }

    case ApprovalsActionTypes.CLEAR_APPROVALS_ERROR: {
      return {
        ...state,
        error: null,
      };
    }

    default: {
      return state;
    }
  }
}

export default approvalsReducer;
