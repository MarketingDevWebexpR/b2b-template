/**
 * B2B Approval Delegation Model
 *
 * Allows approvers to delegate their approval authority to others,
 * typically during vacations or absences.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Delegation statuses
 */
export const DELEGATION_STATUSES = [
  "active",      // Currently active
  "scheduled",   // Will become active in the future
  "expired",     // Past end date
  "cancelled",   // Manually cancelled
] as const;

/**
 * B2B Approval Delegation Model
 *
 * Temporary transfer of approval authority.
 *
 * @example
 * ```typescript
 * const delegation = await approvalService.createApprovalDelegations({
 *   company_id: "comp_123",
 *   delegator_id: "cust_456",
 *   delegate_id: "cust_789",
 *   start_date: new Date("2024-12-20"),
 *   end_date: new Date("2024-12-31"),
 *   reason: "Holiday vacation",
 * });
 * ```
 */
export const ApprovalDelegation = model.define({ name: "ApprovalDelegation", tableName: "b2b_approval_delegation" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Company association
  company_id: model.text(),

  // Delegation parties
  /** Customer ID who is delegating authority */
  delegator_id: model.text(),
  /** Customer ID who receives the delegated authority */
  delegate_id: model.text(),

  // Time period
  /** When delegation becomes active */
  start_date: model.dateTime(),
  /** When delegation expires */
  end_date: model.dateTime(),

  // Status
  status: model.enum([...DELEGATION_STATUSES]).default("scheduled"),

  // Configuration
  /** Reason for delegation */
  reason: model.text().nullable(),
  /** Limit delegation to specific workflow IDs */
  workflow_ids: model.json().nullable(), // string[] - null = all workflows
  /** Maximum amount delegate can approve (null = unlimited) */
  max_amount: model.bigNumber().nullable(),

  // Note: created_at and updated_at are added automatically by Medusa V2
})
.indexes([
  { on: ["company_id"], name: "idx_delegation_company" },
  { on: ["delegator_id"], name: "idx_delegation_delegator" },
  { on: ["delegate_id"], name: "idx_delegation_delegate" },
  { on: ["status"], name: "idx_delegation_status" },
  { on: ["start_date", "end_date"], name: "idx_delegation_dates" },
]);

export default ApprovalDelegation;
