/**
 * B2B Approval Workflow Model
 *
 * Defines approval workflows that determine how requests are routed
 * through approval chains based on configurable triggers and conditions.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Entity types that can trigger approval workflows
 */
export const WORKFLOW_ENTITY_TYPES = [
  "order",       // Order placement
  "quote",       // Quote acceptance
  "return",      // Return request
  "credit",      // Credit request
] as const;

/**
 * Trigger conditions for workflows
 */
export const WORKFLOW_TRIGGERS = [
  "amount_exceeds",        // Order/quote amount exceeds threshold
  "spending_limit_exceeded", // Would exceed spending limit
  "category_restricted",   // Contains restricted categories
  "always",                // Always require approval
] as const;

/**
 * B2B Approval Workflow Model
 *
 * Defines a multi-level approval workflow with configurable triggers.
 *
 * @example
 * ```typescript
 * const workflow = await approvalService.createApprovalWorkflows({
 *   company_id: "comp_123",
 *   name: "High Value Orders",
 *   entity_type: "order",
 *   trigger: "amount_exceeds",
 *   trigger_threshold: 10000,
 *   levels: [
 *     { level: 1, approver_type: "manager" },
 *     { level: 2, approver_type: "director", amount_threshold: 50000 },
 *   ],
 * });
 * ```
 */
export const ApprovalWorkflow = model.define({ name: "ApprovalWorkflow", tableName: "b2b_approval_workflow" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Company association
  company_id: model.text(),

  // Workflow identification
  /** Human-readable name */
  name: model.text(),
  /** Description of when this workflow applies */
  description: model.text().nullable(),

  // Trigger configuration
  /** Entity type this workflow applies to */
  entity_type: model.enum([...WORKFLOW_ENTITY_TYPES]),
  /** Condition that triggers this workflow */
  trigger: model.enum([...WORKFLOW_TRIGGERS]),
  /** Threshold amount for amount-based triggers (cents) */
  trigger_threshold: model.bigNumber().nullable(),
  /** Category IDs for category-based triggers */
  trigger_category_ids: model.json().nullable(), // string[]

  // Workflow levels configuration (JSON array)
  /**
   * Array of approval levels:
   * [
   *   { level: 1, approver_type: "manager", approver_ids: [...], amount_threshold: null },
   *   { level: 2, approver_type: "specific", approver_ids: ["cust_123"], amount_threshold: 50000 },
   * ]
   */
  levels: model.json(),

  // Settings
  /** Hours before auto-escalation (0 = no auto-escalation) */
  escalation_hours: model.number().default(24),
  /** Hours before request expires (0 = no expiration) */
  expiration_hours: model.number().default(72),
  /** Send email notifications */
  notify_on_creation: model.boolean().default(true),
  /** Send reminder notifications */
  notify_on_reminder: model.boolean().default(true),
  /** Allow approvers to delegate */
  allow_delegation: model.boolean().default(true),

  // Priority (higher = checked first)
  priority: model.number().default(0),

  // Status
  is_active: model.boolean().default(true),
})
.indexes([
  { on: ["company_id"], name: "idx_workflow_company" },
  { on: ["company_id", "entity_type"], name: "idx_workflow_entity_type" },
  { on: ["company_id", "is_active"], name: "idx_workflow_active" },
  { on: ["priority"], name: "idx_workflow_priority" },
]);

export default ApprovalWorkflow;
