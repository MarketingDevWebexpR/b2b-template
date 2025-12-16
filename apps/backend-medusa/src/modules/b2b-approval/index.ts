/**
 * B2B Approval Module Definition
 *
 * This module provides approval workflow management for B2B e-commerce.
 *
 * Features:
 * - Multi-level approval workflows
 * - Configurable triggers (amount, category, always)
 * - Approval request tracking
 * - Step-by-step approval process
 * - Delegation support for approvers
 * - Auto-escalation and expiration
 *
 * @packageDocumentation
 */

import { Module } from "@medusajs/framework/utils";
import ApprovalModuleService from "./service";

/**
 * Module identifier - must match service name derived from first model's table name
 * (b2b_approval_workflow → b2bApprovalWorkflowService)
 */
export const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";

/**
 * B2B Approval Module
 *
 * Register this module in medusa-config.ts:
 * ```typescript
 * modules: [
 *   { resolve: "./src/modules/b2b-approval" },
 * ]
 * ```
 */
export default Module(B2B_APPROVAL_MODULE, {
  service: ApprovalModuleService,
});

// Re-export service and types
export { default as ApprovalModuleService } from "./service";
export type {
  WorkflowEntityType,
  WorkflowTrigger,
  RequestStatus,
  StepStatus,
  StepAction,
  DelegationStatus,
  WorkflowLevel,
  CreateWorkflowInput,
  CreateRequestInput,
  ProcessActionInput,
  CreateDelegationInput,
  WorkflowMatch,
} from "./service";

// Re-export models and constants
export {
  ApprovalWorkflow,
  ApprovalRequest,
  ApprovalStep,
  ApprovalDelegation,
  WORKFLOW_ENTITY_TYPES,
  WORKFLOW_TRIGGERS,
  REQUEST_STATUSES,
  STEP_STATUSES,
  STEP_ACTIONS,
  DELEGATION_STATUSES,
} from "./models/index";
