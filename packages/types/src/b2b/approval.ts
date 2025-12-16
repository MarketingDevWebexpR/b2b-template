/**
 * B2B Approval Types
 * Defines approval workflow entities, rules, and statuses for B2B order management.
 */

// ============================================
// Approval Type
// ============================================

/**
 * Type of entity requiring approval.
 */
export type ApprovalEntityType =
  | 'order'           // Purchase order
  | 'quote'           // Quote acceptance
  | 'return'          // Return request
  | 'credit'          // Credit request
  | 'employee'        // New employee
  | 'spending_limit'; // Spending limit change

// ============================================
// Approval Trigger
// ============================================

/**
 * Condition that triggers an approval requirement.
 */
export type ApprovalTriggerType =
  | 'amount_exceeds'        // Order amount exceeds threshold
  | 'spending_limit_exceeds' // Employee spending limit exceeded
  | 'quantity_exceeds'      // Quantity exceeds threshold
  | 'new_vendor'            // First order with new vendor
  | 'new_customer'          // First order from new customer
  | 'restricted_product'    // Product requires approval
  | 'out_of_budget'         // Exceeds department budget
  | 'manual'                // Manually requested
  | 'always';               // Always require approval

/**
 * Configuration for an approval trigger.
 */
export interface ApprovalTrigger {
  type: ApprovalTriggerType;
  /** Threshold value (for amount/quantity triggers) */
  threshold?: number;
  /** Product IDs (for restricted product trigger) */
  productIds?: string[];
  /** Category IDs (for restricted category trigger) */
  categoryIds?: string[];
  /** Description of the trigger */
  description?: string;
}

// ============================================
// Approval Status
// ============================================

/**
 * Status of an approval request.
 */
export type ApprovalStatus =
  | 'pending'       // Awaiting review
  | 'in_review'     // Being reviewed
  | 'approved'      // Approved
  | 'rejected'      // Rejected
  | 'escalated'     // Escalated to higher authority
  | 'delegated'     // Delegated to another approver
  | 'expired'       // Approval request expired
  | 'cancelled';    // Cancelled by requester

// ============================================
// Approval Level
// ============================================

/**
 * A single level in a multi-level approval workflow.
 */
export interface ApprovalLevel {
  /** Level number (1 = first, 2 = second, etc.) */
  level: number;
  /** Name of this approval level */
  name: string;
  /** Description of this level's purpose */
  description?: string;
  /** IDs of employees who can approve at this level */
  approverIds: string[];
  /** Role required to approve (alternative to specific approvers) */
  approverRole?: string;
  /** Department that can approve (alternative to specific approvers) */
  approverDepartmentId?: string;
  /** Minimum amount threshold for this level */
  minAmount?: number;
  /** Maximum amount threshold for this level */
  maxAmount?: number;
  /** How many approvers needed (1 = any one, 2+ = multiple) */
  requiredApprovals: number;
  /** Whether all approvers must approve (vs any one) */
  requireAll: boolean;
  /** Hours before auto-escalation */
  escalationHours?: number;
  /** Next level to escalate to */
  escalatesToLevel?: number;
}

// ============================================
// Approval Workflow
// ============================================

/**
 * An approval workflow configuration.
 */
export interface ApprovalWorkflow {
  /** Unique identifier */
  id: string;
  /** Company this workflow belongs to */
  companyId: string;
  /** Workflow name */
  name: string;
  /** Workflow description */
  description?: string;
  /** Entity type this workflow applies to */
  entityType: ApprovalEntityType;
  /** Triggers that activate this workflow */
  triggers: ApprovalTrigger[];
  /** Approval levels */
  levels: ApprovalLevel[];
  /** Whether this workflow is active */
  isActive: boolean;
  /** Whether this is the default workflow for the entity type */
  isDefault: boolean;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}

// ============================================
// Approval Step
// ============================================

/**
 * Status of a single approval step.
 */
export interface ApprovalStep {
  /** Unique identifier */
  id: string;
  /** Approval request ID */
  approvalRequestId: string;
  /** Level number in the workflow */
  level: number;
  /** Level name */
  levelName: string;
  /** Status of this step */
  status: ApprovalStatus;
  /** Assigned approver IDs */
  assignedApproverIds: string[];
  /** Approver who took action */
  decidedById?: string;
  /** Approver name (denormalized) */
  decidedByName?: string;
  /** Decision timestamp */
  decidedAt?: string;
  /** Decision comment */
  comment?: string;
  /** Number of approvals received (for multi-approver steps) */
  approvalsReceived: number;
  /** Number of approvals required */
  approvalsRequired: number;
  /** Individual approver decisions */
  approverDecisions: ApproverDecision[];
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Due date for this step */
  dueAt?: string;
}

/**
 * Individual approver decision within a step.
 */
export interface ApproverDecision {
  approverId: string;
  approverName: string;
  decision: 'approved' | 'rejected' | 'pending';
  comment?: string;
  decidedAt?: string;
}

// ============================================
// Approval Request
// ============================================

/**
 * B2B Approval Request entity.
 * Represents a request for approval on an entity (order, quote, etc.).
 */
export interface ApprovalRequest {
  /** Unique identifier */
  id: string;
  /** Human-readable request number */
  requestNumber: string;
  /** Company ID */
  companyId: string;
  /** Company name (denormalized) */
  companyName: string;

  // Entity being approved
  /** Type of entity */
  entityType: ApprovalEntityType;
  /** ID of the entity */
  entityId: string;
  /** Reference number of the entity */
  entityReference: string;
  /** Entity summary for display */
  entitySummary: string;
  /** Entity amount (if applicable) */
  entityAmount?: number;
  /** Entity currency */
  entityCurrency?: string;

  // Requester
  /** Employee who requested approval */
  requesterId: string;
  /** Requester name (denormalized) */
  requesterName: string;
  /** Requester email */
  requesterEmail: string;

  // Workflow
  /** Workflow ID used */
  workflowId: string;
  /** Workflow name (denormalized) */
  workflowName: string;
  /** Trigger that caused this request */
  triggerType: ApprovalTriggerType;
  /** Trigger description */
  triggerDescription: string;

  // Status
  /** Overall status */
  status: ApprovalStatus;
  /** Current level being processed */
  currentLevel: number;
  /** Total levels in workflow */
  totalLevels: number;
  /** All approval steps */
  steps: ApprovalStep[];

  // Priority and timing
  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** Whether this is expedited */
  isExpedited: boolean;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Due date for final decision */
  dueAt?: string;
  /** ISO timestamp of completion */
  completedAt?: string;

  // Notes and attachments
  /** Requester notes */
  requesterNotes?: string;
  /** Final decision notes */
  decisionNotes?: string;
  /** Attachments */
  attachments?: ApprovalAttachment[];

  // Final decision
  /** Final decision maker ID */
  finalDecisionById?: string;
  /** Final decision maker name */
  finalDecisionByName?: string;
}

/**
 * Attachment on an approval request.
 */
export interface ApprovalAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
}

// ============================================
// Approval Summary (for lists)
// ============================================

/**
 * Lightweight approval request for lists.
 */
export interface ApprovalSummary {
  id: string;
  requestNumber: string;
  entityType: ApprovalEntityType;
  entityReference: string;
  entitySummary: string;
  entityAmount?: number;
  entityCurrency?: string;
  requesterName: string;
  status: ApprovalStatus;
  currentLevel: number;
  totalLevels: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  dueAt?: string;
  isOverdue: boolean;
}

// ============================================
// Approval Action DTOs
// ============================================

/**
 * Action to take on an approval request.
 */
export type ApprovalAction = 'approve' | 'reject' | 'escalate' | 'delegate' | 'request_info';

/**
 * Input for taking action on an approval.
 */
export interface ApprovalActionInput {
  action: ApprovalAction;
  comment?: string;
  /** For delegation: ID of employee to delegate to */
  delegateToId?: string;
  /** For escalation: level to escalate to */
  escalateToLevel?: number;
}

/**
 * Input for creating an approval workflow.
 */
export interface CreateApprovalWorkflowInput {
  name: string;
  description?: string;
  entityType: ApprovalEntityType;
  triggers: ApprovalTrigger[];
  levels: Omit<ApprovalLevel, 'level'>[];
  isDefault?: boolean;
}

/**
 * Input for updating an approval workflow.
 */
export interface UpdateApprovalWorkflowInput {
  name?: string;
  description?: string;
  triggers?: ApprovalTrigger[];
  levels?: Omit<ApprovalLevel, 'level'>[];
  isActive?: boolean;
  isDefault?: boolean;
}

// ============================================
// Approval Filters
// ============================================

/**
 * Filters for listing approvals.
 */
export interface ApprovalFilters {
  status?: ApprovalStatus | ApprovalStatus[];
  entityType?: ApprovalEntityType;
  requesterId?: string;
  approverId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  isOverdue?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

// ============================================
// Approval Delegation
// ============================================

/**
 * A delegation of approval authority.
 */
export interface ApprovalDelegation {
  id: string;
  companyId: string;
  /** Employee delegating authority */
  delegatorId: string;
  delegatorName: string;
  /** Employee receiving authority */
  delegateeId: string;
  delegateeName: string;
  /** Start date of delegation */
  startDate: string;
  /** End date of delegation */
  endDate: string;
  /** Reason for delegation */
  reason?: string;
  /** Whether delegation is active */
  isActive: boolean;
  /** Entity types this applies to */
  entityTypes?: ApprovalEntityType[];
  /** Max amount delegatee can approve */
  maxAmount?: number;
  createdAt: string;
}
