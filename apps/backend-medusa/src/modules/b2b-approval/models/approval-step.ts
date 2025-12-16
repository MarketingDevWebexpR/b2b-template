/**
 * B2B Approval Step Model
 *
 * Represents a single step in the approval process.
 * Each request can have multiple steps, one per approval level.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Step statuses
 */
export const STEP_STATUSES = [
  "pending",       // Waiting for action
  "approved",      // Approved at this step
  "rejected",      // Rejected at this step
  "escalated",     // Escalated to next level
  "delegated",     // Delegated to another approver
  "expired",       // Expired without action
  "skipped",       // Skipped (e.g., due to escalation)
] as const;

/**
 * Actions that can be taken on a step
 */
export const STEP_ACTIONS = [
  "approve",       // Approve the request
  "reject",        // Reject the request
  "escalate",      // Escalate to higher level
  "delegate",      // Delegate to another approver
  "request_info",  // Request more information
] as const;

/**
 * B2B Approval Step Model
 *
 * Tracks individual approval decisions within a request.
 *
 * @example
 * ```typescript
 * const step = await approvalService.createApprovalSteps({
 *   request_id: "req_123",
 *   level: 1,
 *   status: "pending",
 *   assigned_approver_ids: ["cust_456", "cust_789"],
 *   due_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
 * });
 * ```
 */
export const ApprovalStep = model.define({ name: "ApprovalStep", tableName: "b2b_approval_step" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Request association
  request_id: model.text(),

  // Step identification
  /** Approval level (1-based) */
  level: model.number(),
  /** Status of this step */
  status: model.enum([...STEP_STATUSES]).default("pending"),

  // Approvers
  /** IDs of customers who can approve at this level */
  assigned_approver_ids: model.json(), // string[]
  /** ID of the customer who took action */
  acted_by_id: model.text().nullable(),
  /** Was this action on behalf of another approver (delegation) */
  acted_on_behalf_of_id: model.text().nullable(),

  // Action details
  /** Action taken */
  action: model.enum([...STEP_ACTIONS]).nullable(),
  /** When action was taken */
  acted_at: model.dateTime().nullable(),
  /** Notes from the approver */
  notes: model.text().nullable(),

  // Timing
  /** When this step is due */
  due_at: model.dateTime().nullable(),
  /** When reminder was sent */
  reminder_sent_at: model.dateTime().nullable(),

  // Delegation tracking
  /** If delegated, to whom */
  delegated_to_id: model.text().nullable(),
  /** Reason for delegation */
  delegation_reason: model.text().nullable(),
})
.indexes([
  { on: ["request_id"], name: "idx_step_request" },
  { on: ["request_id", "level"], name: "idx_step_level" },
  { on: ["status"], name: "idx_step_status" },
  { on: ["due_at"], name: "idx_step_due" },
]);

export default ApprovalStep;
