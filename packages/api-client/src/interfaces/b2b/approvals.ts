/**
 * B2B Approval Service Interface
 * Defines the contract for approval workflow operations in B2B context.
 */

import type {
  ApprovalRequest,
  ApprovalSummary,
  ApprovalStatus,
  ApprovalEntityType,
  ApprovalWorkflow,
  ApprovalDelegation,
  ApprovalActionInput,
  CreateApprovalWorkflowInput,
  UpdateApprovalWorkflowInput,
  ApprovalFilters,
} from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";

/**
 * Options for listing approvals
 */
export interface ListApprovalsOptions extends ApprovalFilters {
  /** Page number */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Sort field */
  sortBy?: "createdAt" | "dueAt" | "priority" | "entityAmount";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Approval action result
 */
export interface ApprovalActionResult {
  /** Updated approval request */
  approval: ApprovalRequest;
  /** Whether action was successful */
  success: boolean;
  /** Result message */
  message: string;
  /** Next steps (if any) */
  nextSteps?: string;
}

/**
 * Approval statistics
 */
export interface ApprovalStats {
  /** Pending count */
  pending: number;
  /** In review count */
  inReview: number;
  /** Approved today */
  approvedToday: number;
  /** Rejected today */
  rejectedToday: number;
  /** Average approval time (hours) */
  avgApprovalTimeHours: number;
  /** Overdue count */
  overdue: number;
}

/**
 * Interface for B2B approval operations.
 * All adapters must implement this interface.
 */
export interface IApprovalService {
  /**
   * List approval requests with optional filtering.
   *
   * @param options - Listing options
   * @returns Paginated list of approvals
   *
   * @example
   * ```typescript
   * const approvals = await api.b2b.approvals.list({
   *   status: "pending",
   *   approverId: "emp_123",
   *   entityType: "order"
   * });
   * ```
   */
  list(options?: ListApprovalsOptions): Promise<PaginatedResponse<ApprovalSummary>>;

  /**
   * Get an approval request by ID.
   *
   * @param id - Approval request ID
   * @returns Full approval details
   */
  get(id: string): Promise<ApprovalRequest>;

  /**
   * Get approval by request number.
   *
   * @param requestNumber - Human-readable request number
   * @returns Full approval details
   */
  getByNumber(requestNumber: string): Promise<ApprovalRequest>;

  /**
   * Get approvals pending for current user.
   *
   * @param options - Listing options
   * @returns Paginated pending approvals
   */
  getMyPending(
    options?: Omit<ListApprovalsOptions, "approverId" | "status">
  ): Promise<PaginatedResponse<ApprovalSummary>>;

  /**
   * Get approvals I submitted.
   *
   * @param options - Listing options
   * @returns Paginated submitted approvals
   */
  getMySubmitted(
    options?: Omit<ListApprovalsOptions, "requesterId">
  ): Promise<PaginatedResponse<ApprovalSummary>>;

  /**
   * Get approval statistics.
   *
   * @param companyId - Company ID (optional)
   * @returns Approval statistics
   */
  getStats(companyId?: string): Promise<ApprovalStats>;

  /**
   * Take action on an approval.
   *
   * @param id - Approval request ID
   * @param input - Action input
   * @returns Action result
   *
   * @example
   * ```typescript
   * // Approve
   * await api.b2b.approvals.takeAction("apr_123", {
   *   action: "approve",
   *   comment: "Approved for Q1 budget"
   * });
   *
   * // Reject
   * await api.b2b.approvals.takeAction("apr_123", {
   *   action: "reject",
   *   comment: "Exceeds monthly limit"
   * });
   *
   * // Delegate
   * await api.b2b.approvals.takeAction("apr_123", {
   *   action: "delegate",
   *   delegateToId: "emp_456"
   * });
   * ```
   */
  takeAction(id: string, input: ApprovalActionInput): Promise<ApprovalActionResult>;

  /**
   * Approve a request (shorthand).
   *
   * @param id - Approval request ID
   * @param comment - Optional comment
   * @returns Action result
   */
  approve(id: string, comment?: string): Promise<ApprovalActionResult>;

  /**
   * Reject a request (shorthand).
   *
   * @param id - Approval request ID
   * @param reason - Rejection reason
   * @returns Action result
   */
  reject(id: string, reason: string): Promise<ApprovalActionResult>;

  /**
   * Delegate a request.
   *
   * @param id - Approval request ID
   * @param delegateToId - Employee ID to delegate to
   * @param comment - Optional comment
   * @returns Action result
   */
  delegate(
    id: string,
    delegateToId: string,
    comment?: string
  ): Promise<ApprovalActionResult>;

  /**
   * Escalate a request.
   *
   * @param id - Approval request ID
   * @param reason - Escalation reason
   * @returns Action result
   */
  escalate(id: string, reason?: string): Promise<ApprovalActionResult>;

  /**
   * Request more information.
   *
   * @param id - Approval request ID
   * @param question - Information needed
   * @returns Action result
   */
  requestInfo(id: string, question: string): Promise<ApprovalActionResult>;

  /**
   * Add comment to approval.
   *
   * @param id - Approval request ID
   * @param comment - Comment text
   * @returns Updated approval
   */
  addComment(id: string, comment: string): Promise<ApprovalRequest>;

  // Workflow Management

  /**
   * List approval workflows.
   *
   * @param companyId - Company ID
   * @returns Array of workflows
   */
  listWorkflows(companyId: string): Promise<ApprovalWorkflow[]>;

  /**
   * Get a workflow by ID.
   *
   * @param id - Workflow ID
   * @returns Workflow details
   */
  getWorkflow(id: string): Promise<ApprovalWorkflow>;

  /**
   * Create a new workflow.
   *
   * @param companyId - Company ID
   * @param input - Workflow data
   * @returns Created workflow
   *
   * @example
   * ```typescript
   * const workflow = await api.b2b.approvals.createWorkflow("comp_123", {
   *   name: "High Value Orders",
   *   entityType: "order",
   *   triggers: [{ type: "amount_exceeds", threshold: 10000 }],
   *   levels: [
   *     {
   *       name: "Manager Approval",
   *       approverRole: "manager",
   *       requiredApprovals: 1,
   *       requireAll: false,
   *       escalationHours: 24
   *     }
   *   ]
   * });
   * ```
   */
  createWorkflow(
    companyId: string,
    input: CreateApprovalWorkflowInput
  ): Promise<ApprovalWorkflow>;

  /**
   * Update a workflow.
   *
   * @param id - Workflow ID
   * @param input - Update data
   * @returns Updated workflow
   */
  updateWorkflow(
    id: string,
    input: UpdateApprovalWorkflowInput
  ): Promise<ApprovalWorkflow>;

  /**
   * Delete a workflow.
   *
   * @param id - Workflow ID
   */
  deleteWorkflow(id: string): Promise<void>;

  /**
   * Activate a workflow.
   *
   * @param id - Workflow ID
   * @returns Updated workflow
   */
  activateWorkflow(id: string): Promise<ApprovalWorkflow>;

  /**
   * Deactivate a workflow.
   *
   * @param id - Workflow ID
   * @returns Updated workflow
   */
  deactivateWorkflow(id: string): Promise<ApprovalWorkflow>;

  // Delegation Management

  /**
   * List delegations for a company.
   *
   * @param companyId - Company ID
   * @returns Array of delegations
   */
  listDelegations(companyId: string): Promise<ApprovalDelegation[]>;

  /**
   * Create a delegation.
   *
   * @param input - Delegation data
   * @returns Created delegation
   *
   * @example
   * ```typescript
   * const delegation = await api.b2b.approvals.createDelegation({
   *   delegateeId: "emp_456",
   *   startDate: "2024-01-15",
   *   endDate: "2024-01-22",
   *   reason: "Vacation",
   *   entityTypes: ["order"],
   *   maxAmount: 5000
   * });
   * ```
   */
  createDelegation(
    input: Omit<ApprovalDelegation, "id" | "companyId" | "delegatorId" | "delegatorName" | "delegateeName" | "isActive" | "createdAt">
  ): Promise<ApprovalDelegation>;

  /**
   * Cancel a delegation.
   *
   * @param id - Delegation ID
   */
  cancelDelegation(id: string): Promise<void>;

  /**
   * Get active delegations for current user.
   *
   * @returns Array of active delegations
   */
  getMyDelegations(): Promise<ApprovalDelegation[]>;

  /**
   * Get delegations to current user.
   *
   * @returns Array of delegations where current user is delegatee
   */
  getDelegationsToMe(): Promise<ApprovalDelegation[]>;

  // Batch Operations

  /**
   * Approve multiple requests.
   *
   * @param ids - Approval request IDs
   * @param comment - Comment for all
   * @returns Results for each
   */
  approveMany(
    ids: string[],
    comment?: string
  ): Promise<Map<string, ApprovalActionResult>>;

  /**
   * Reject multiple requests.
   *
   * @param ids - Approval request IDs
   * @param reason - Reason for all
   * @returns Results for each
   */
  rejectMany(
    ids: string[],
    reason: string
  ): Promise<Map<string, ApprovalActionResult>>;
}
