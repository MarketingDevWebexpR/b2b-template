/**
 * Approvals Selectors
 *
 * Selector functions for extracting and deriving data from approvals state.
 * All selectors are pure functions that can be used with any state management library.
 *
 * @packageDocumentation
 */

import type {
  ApprovalRequest,
  ApprovalSummary,
  ApprovalStatus,
  ApprovalFilters,
  ApprovalEntityType,
} from "@maison/types";
import type {
  RootState,
  ApprovalsState,
  LoadingStatus,
  PaginationState,
} from "../types/state";
import {
  createDerivedSelector,
  createDerivedShallowSelector,
  createParameterizedSelector,
} from "../utils/memoize";

// ============================================
// Base Selectors
// ============================================

/**
 * Selects the entire approvals state slice.
 *
 * @param state - Root state
 * @returns Approvals state
 */
export function selectApprovalsState(state: RootState): ApprovalsState {
  return state.approvals;
}

/**
 * Selects pending approval requests.
 *
 * @param state - Root state
 * @returns Array of pending approval summaries
 */
export function selectPendingApprovals(
  state: RootState
): readonly ApprovalSummary[] {
  return state.approvals.pendingApprovals;
}

/**
 * Selects all approval requests.
 *
 * @param state - Root state
 * @returns Array of all approval summaries
 */
export function selectAllApprovals(
  state: RootState
): readonly ApprovalSummary[] {
  return state.approvals.allApprovals;
}

/**
 * Selects the currently selected approval request (full details).
 *
 * @param state - Root state
 * @returns Selected approval or null
 */
export function selectSelectedApproval(
  state: RootState
): ApprovalRequest | null {
  return state.approvals.selectedApproval;
}

/**
 * Selects the count of pending approvals.
 *
 * @param state - Root state
 * @returns Number of pending approvals
 */
export function selectPendingApprovalCount(state: RootState): number {
  return state.approvals.pendingCount;
}

/**
 * Alias for selectPendingApprovalCount.
 *
 * @param state - Root state
 * @returns Number of pending approvals
 */
export function selectApprovalCount(state: RootState): number {
  return state.approvals.pendingCount;
}

/**
 * Selects the current approval filters.
 *
 * @param state - Root state
 * @returns Active approval filters
 */
export function selectApprovalFilters(state: RootState): ApprovalFilters {
  return state.approvals.filters;
}

/**
 * Selects the active status filter.
 *
 * @param state - Root state
 * @returns Active status filter or 'all'
 */
export function selectApprovalStatusFilter(
  state: RootState
): ApprovalStatus | "all" {
  return state.approvals.activeStatusFilter;
}

// ============================================
// Status Selectors
// ============================================

/**
 * Selects the approvals list loading status.
 *
 * @param state - Root state
 * @returns Loading status for list
 */
export function selectApprovalsListStatus(state: RootState): LoadingStatus {
  return state.approvals.listStatus;
}

/**
 * Selects whether approvals list is loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
export function selectIsApprovalsLoading(state: RootState): boolean {
  return state.approvals.listStatus === "loading";
}

/**
 * Selects the approval detail loading status.
 *
 * @param state - Root state
 * @returns Loading status for detail
 */
export function selectApprovalDetailStatus(state: RootState): LoadingStatus {
  return state.approvals.detailStatus;
}

/**
 * Selects whether approval detail is loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
export function selectIsApprovalDetailLoading(state: RootState): boolean {
  return state.approvals.detailStatus === "loading";
}

/**
 * Selects the approvals error message.
 *
 * @param state - Root state
 * @returns Error message or null
 */
export function selectApprovalsError(state: RootState): string | null {
  return state.approvals.error;
}

// ============================================
// Pagination Selectors
// ============================================

/**
 * Selects the approvals pagination state.
 *
 * @param state - Root state
 * @returns Pagination state
 */
export function selectApprovalsPagination(state: RootState): PaginationState {
  return state.approvals.pagination;
}

/**
 * Selects the current page number.
 *
 * @param state - Root state
 * @returns Current page (1-indexed)
 */
export function selectApprovalsCurrentPage(state: RootState): number {
  return state.approvals.pagination.currentPage;
}

/**
 * Selects the total number of approvals.
 *
 * @param state - Root state
 * @returns Total approvals count
 */
export function selectApprovalsTotalCount(state: RootState): number {
  return state.approvals.pagination.totalItems;
}

// ============================================
// Derived Selectors
// ============================================

/**
 * Selects an approval by ID from all approvals.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param approvalId - Approval ID to find
 * @returns Approval summary or undefined
 */
export const selectApprovalById = createParameterizedSelector(
  (state: RootState, approvalId: string): ApprovalSummary | undefined =>
    state.approvals.allApprovals.find((a) => a.id === approvalId)
);

/**
 * Selects approvals by status.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param status - Status to filter by
 * @returns Filtered approval summaries
 */
export const selectApprovalsByStatus = createParameterizedSelector(
  (state: RootState, status: ApprovalStatus): readonly ApprovalSummary[] =>
    state.approvals.allApprovals.filter((a) => a.status === status)
);

/**
 * Selects approvals by entity type.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param entityType - Entity type to filter by
 * @returns Filtered approval summaries
 */
export const selectApprovalsByEntityType = createParameterizedSelector(
  (state: RootState, entityType: ApprovalEntityType): readonly ApprovalSummary[] =>
    state.approvals.allApprovals.filter((a) => a.entityType === entityType)
);

/**
 * Selects pending approvals for orders.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Pending order approvals
 */
export const selectPendingOrderApprovals = createDerivedSelector(
  [selectPendingApprovals],
  (pendingApprovals): readonly ApprovalSummary[] =>
    pendingApprovals.filter((a) => a.entityType === "order")
);

/**
 * Selects pending approvals for quotes.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Pending quote approvals
 */
export const selectPendingQuoteApprovals = createDerivedSelector(
  [selectPendingApprovals],
  (pendingApprovals): readonly ApprovalSummary[] =>
    pendingApprovals.filter((a) => a.entityType === "quote")
);

/**
 * Selects overdue approvals.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Overdue approval summaries
 */
export const selectOverdueApprovals = createDerivedSelector(
  [selectPendingApprovals],
  (pendingApprovals): readonly ApprovalSummary[] =>
    pendingApprovals.filter((a) => a.isOverdue)
);

/**
 * Selects the count of overdue approvals.
 *
 * @param state - Root state
 * @returns Number of overdue approvals
 */
export function selectOverdueApprovalCount(state: RootState): number {
  return state.approvals.pendingApprovals.filter((a) => a.isOverdue).length;
}

/**
 * Selects high-priority pending approvals.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns High-priority and urgent approvals
 */
export const selectHighPriorityApprovals = createDerivedSelector(
  [selectPendingApprovals],
  (pendingApprovals): readonly ApprovalSummary[] =>
    pendingApprovals.filter((a) => a.priority === "high" || a.priority === "urgent")
);

/**
 * Selects whether there are any pending approvals.
 *
 * @param state - Root state
 * @returns True if there are pending approvals
 */
export function selectHasPendingApprovals(state: RootState): boolean {
  return state.approvals.pendingCount > 0;
}

/**
 * Selects the total value of pending approvals.
 *
 * @param state - Root state
 * @returns Total value of pending approvals
 */
export function selectPendingApprovalsTotalValue(state: RootState): number {
  return state.approvals.pendingApprovals.reduce(
    (sum, a) => sum + (a.entityAmount ?? 0),
    0
  );
}

/**
 * Initial counts object with all statuses at zero.
 * Used as a base to ensure consistent object structure.
 */
const INITIAL_STATUS_COUNTS: Record<ApprovalStatus, number> = {
  pending: 0,
  in_review: 0,
  approved: 0,
  rejected: 0,
  escalated: 0,
  delegated: 0,
  expired: 0,
  cancelled: 0,
} as const;

/**
 * Selects approval counts grouped by status.
 * Memoized with shallow equality to prevent unnecessary re-renders
 * when counts haven't changed.
 *
 * @param state - Root state
 * @returns Object with counts per status
 */
export const selectApprovalCountsByStatus = createDerivedShallowSelector(
  [selectAllApprovals],
  (allApprovals): Record<ApprovalStatus, number> => {
    // Create a new counts object based on initial values
    const counts = { ...INITIAL_STATUS_COUNTS };

    for (const approval of allApprovals) {
      counts[approval.status]++;
    }

    return counts;
  }
);

// ============================================
// Selected Approval Selectors
// ============================================

/**
 * Selects the selected approval's ID.
 *
 * @param state - Root state
 * @returns Approval ID or null
 */
export function selectSelectedApprovalId(state: RootState): string | null {
  return state.approvals.selectedApproval?.id ?? null;
}

/**
 * Selects the selected approval's status.
 *
 * @param state - Root state
 * @returns Approval status or null
 */
export function selectSelectedApprovalStatus(
  state: RootState
): ApprovalStatus | null {
  return state.approvals.selectedApproval?.status ?? null;
}

/**
 * Selects the selected approval's steps.
 *
 * @param state - Root state
 * @returns Approval steps or empty array
 */
export function selectSelectedApprovalSteps(
  state: RootState
): ApprovalRequest["steps"] {
  return state.approvals.selectedApproval?.steps ?? [];
}

/**
 * Selects the selected approval's current level.
 *
 * @param state - Root state
 * @returns Current approval level or 0
 */
export function selectSelectedApprovalCurrentLevel(state: RootState): number {
  return state.approvals.selectedApproval?.currentLevel ?? 0;
}

/**
 * Selects whether the selected approval can be actioned.
 *
 * @param state - Root state
 * @returns True if approval can be actioned
 */
export function selectCanActionSelectedApproval(state: RootState): boolean {
  const status = state.approvals.selectedApproval?.status;
  return status === "pending" || status === "in_review";
}

/**
 * Selects whether the selected approval is overdue.
 *
 * @param state - Root state
 * @returns True if approval is overdue
 */
export function selectIsSelectedApprovalOverdue(state: RootState): boolean {
  const approval = state.approvals.selectedApproval;
  if (approval === null || approval.dueAt === undefined) {
    return false;
  }
  return new Date(approval.dueAt) < new Date();
}
