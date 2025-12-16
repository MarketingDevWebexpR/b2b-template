/**
 * B2B Approval Request Model
 *
 * Represents a request that needs approval through a workflow.
 * Tracks the overall status and progress through approval levels.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";
import { WORKFLOW_ENTITY_TYPES } from "./approval-workflow";

/**
 * Approval request statuses
 */
export const REQUEST_STATUSES = [
  "pending",     // Waiting for first approver
  "in_review",   // Being reviewed at current level
  "approved",    // Fully approved (all levels)
  "rejected",    // Rejected at any level
  "escalated",   // Escalated to higher level
  "expired",     // Expired without decision
  "cancelled",   // Cancelled by requester
] as const;

/**
 * B2B Approval Request Model
 *
 * Main record for tracking an approval through its workflow.
 *
 * @example
 * ```typescript
 * const request = await approvalService.createApprovalRequests({
 *   request_number: "APR-2024-00001",
 *   company_id: "comp_123",
 *   entity_type: "order",
 *   entity_id: "cart_456",
 *   entity_amount: 25000,
 *   requester_id: "cust_789",
 *   workflow_id: "wf_123",
 *   status: "pending",
 *   current_level: 1,
 *   total_levels: 2,
 * });
 * ```
 */
export const ApprovalRequest = model.define({ name: "ApprovalRequest", tableName: "b2b_approval_request" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Request identification
  /** Unique request number (APR-YYYY-NNNNN) */
  request_number: model.text().unique().searchable(),

  // Company and workflow association
  company_id: model.text(),
  workflow_id: model.text(),

  // Entity being approved
  /** Type of entity requiring approval */
  entity_type: model.enum([...WORKFLOW_ENTITY_TYPES]),
  /** ID of the entity (cart_id, quote_id, etc.) */
  entity_id: model.text(),
  /** Amount for amount-based approval tracking */
  entity_amount: model.bigNumber().nullable(),
  /** Currency code */
  entity_currency: model.text().default("EUR"),

  // Requester
  /** Customer ID who initiated the request */
  requester_id: model.text(),
  /** Reason/notes from requester */
  requester_notes: model.text().nullable(),

  // Status tracking
  /** Current status */
  status: model.enum([...REQUEST_STATUSES]).default("pending"),
  /** Current approval level (1-based) */
  current_level: model.number().default(1),
  /** Total levels in the workflow */
  total_levels: model.number(),

  // Timing
  /** When this request will expire */
  due_at: model.dateTime().nullable(),
  /** When the request was submitted */
  submitted_at: model.dateTime(),
  /** When a final decision was made */
  decided_at: model.dateTime().nullable(),

  // Final decision details
  /** ID of the approver who made final decision */
  final_approver_id: model.text().nullable(),
  /** Final decision notes */
  final_notes: model.text().nullable(),

  // Metadata
  /** Additional context about the request */
  metadata: model.json().nullable(),
})
.indexes([
  { on: ["company_id"], name: "idx_request_company" },
  { on: ["company_id", "status"], name: "idx_request_status" },
  { on: ["requester_id"], name: "idx_request_requester" },
  { on: ["entity_type", "entity_id"], name: "idx_request_entity" },
  { on: ["workflow_id"], name: "idx_request_workflow" },
  { on: ["request_number"], name: "idx_request_number", unique: true },
  { on: ["due_at"], name: "idx_request_due" },
]);

export default ApprovalRequest;
