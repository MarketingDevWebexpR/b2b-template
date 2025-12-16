/**
 * ApprovalFlow Types
 *
 * Type definitions for visual approval workflow component
 * supporting multi-step approval processes.
 */

/**
 * Status of an approval step
 */
export type ApprovalStepStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "skipped"
  | "cancelled";

/**
 * Overall approval workflow status
 */
export type ApprovalWorkflowStatus =
  | "draft"
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected"
  | "cancelled";

/**
 * Approver information
 */
export interface Approver {
  /** Unique approver ID */
  id: string;
  /** Approver name */
  name: string;
  /** Approver email */
  email?: string;
  /** Approver role/title */
  role?: string;
  /** Avatar URL */
  avatarUrl?: string;
}

/**
 * Action taken on an approval step
 */
export interface ApprovalAction {
  /** Action type */
  type: "approve" | "reject" | "request_changes" | "delegate" | "skip";
  /** Approver who took the action */
  approver: Approver;
  /** Timestamp of the action */
  timestamp: Date;
  /** Comments/notes for the action */
  comment?: string;
  /** Delegated to (if action is delegate) */
  delegatedTo?: Approver;
}

/**
 * Approval step definition
 */
export interface ApprovalStep {
  /** Unique step ID */
  id: string;
  /** Step name/title */
  name: string;
  /** Step description */
  description?: string;
  /** Step order (0-based) */
  order: number;
  /** Current status */
  status: ApprovalStepStatus;
  /** Required approvers for this step */
  requiredApprovers: Approver[];
  /** Minimum number of approvals required */
  minApprovals: number;
  /** Actions taken on this step */
  actions: ApprovalAction[];
  /** Due date for this step */
  dueDate?: Date;
  /** Whether this step is optional */
  optional?: boolean;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Approval workflow definition
 */
export interface ApprovalWorkflow {
  /** Unique workflow ID */
  id: string;
  /** Workflow name */
  name: string;
  /** Workflow description */
  description?: string;
  /** Overall workflow status */
  status: ApprovalWorkflowStatus;
  /** Approval steps */
  steps: ApprovalStep[];
  /** Workflow initiator */
  initiator: Approver;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Target entity being approved */
  targetEntity?: {
    type: string;
    id: string;
    name?: string;
  };
  /** Workflow metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Approval flow state
 */
export interface ApprovalFlowState {
  /** Current workflow */
  workflow: ApprovalWorkflow;
  /** Currently active step index */
  currentStepIndex: number;
  /** Current active step */
  currentStep: ApprovalStep | null;
  /** Completed steps */
  completedSteps: ApprovalStep[];
  /** Pending steps */
  pendingSteps: ApprovalStep[];
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether the workflow is complete */
  isComplete: boolean;
  /** Whether the workflow is approved */
  isApproved: boolean;
  /** Whether the workflow is rejected */
  isRejected: boolean;
  /** Whether the workflow can be cancelled */
  canCancel: boolean;
  /** Current user's pending action (if any) */
  userPendingAction: ApprovalStep | null;
}

/**
 * Options for useApprovalFlow hook
 */
export interface UseApprovalFlowOptions {
  /** Initial workflow configuration */
  workflow: ApprovalWorkflow;
  /** Current user (to determine pending actions) */
  currentUser?: Approver;
  /** Callback when step status changes */
  onStepChange?: (step: ApprovalStep, workflow: ApprovalWorkflow) => void;
  /** Callback when workflow status changes */
  onWorkflowChange?: (workflow: ApprovalWorkflow) => void;
  /** Callback when workflow is approved */
  onApproved?: (workflow: ApprovalWorkflow) => void;
  /** Callback when workflow is rejected */
  onRejected?: (workflow: ApprovalWorkflow) => void;
}

/**
 * Return type for useApprovalFlow hook
 */
export interface UseApprovalFlowReturn {
  /** Current state */
  state: ApprovalFlowState;

  // Step actions
  /** Approve current or specific step */
  approve: (stepId?: string, comment?: string) => void;
  /** Reject current or specific step */
  reject: (stepId?: string, comment?: string) => void;
  /** Request changes on current or specific step */
  requestChanges: (stepId?: string, comment?: string) => void;
  /** Delegate step to another approver */
  delegate: (stepId: string, delegateTo: Approver, comment?: string) => void;
  /** Skip an optional step */
  skipStep: (stepId: string, comment?: string) => void;

  // Workflow actions
  /** Cancel the entire workflow */
  cancel: (comment?: string) => void;
  /** Reset workflow to draft */
  resetToDraft: () => void;
  /** Restart workflow from beginning */
  restart: () => void;

  // Query helpers
  /** Check if user can approve a step */
  canApprove: (stepId: string, userId?: string) => boolean;
  /** Check if user can reject a step */
  canReject: (stepId: string, userId?: string) => boolean;
  /** Check if step is current */
  isCurrentStep: (stepId: string) => boolean;
  /** Check if step is complete */
  isStepComplete: (stepId: string) => boolean;
  /** Get step by ID */
  getStep: (stepId: string) => ApprovalStep | undefined;
  /** Get approvers for a step */
  getStepApprovers: (stepId: string) => Approver[];
  /** Get remaining approvers for a step */
  getRemainingApprovers: (stepId: string) => Approver[];

  // Navigation
  /** Go to specific step (for viewing) */
  goToStep: (stepId: string) => void;
  /** Get next step */
  getNextStep: () => ApprovalStep | null;
  /** Get previous step */
  getPreviousStep: () => ApprovalStep | null;
}
