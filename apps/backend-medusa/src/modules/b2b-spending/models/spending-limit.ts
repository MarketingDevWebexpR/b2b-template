/**
 * B2B Spending Limit Model
 *
 * Defines spending limits that can be applied at various levels:
 * - Company-wide limits
 * - Department-based limits
 * - Role-based limits
 * - Individual employee limits
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Entity types that can have spending limits
 */
export const ENTITY_TYPES = [
  "employee",    // Individual customer/employee
  "department",  // Department within company
  "company",     // Company-wide limit
  "role",        // Role-based (admin, manager, buyer, viewer)
] as const;

/**
 * Period types for spending limits
 */
export const PERIOD_TYPES = [
  "per_order",   // Limit per single order
  "daily",       // Daily reset
  "weekly",      // Weekly reset (Monday)
  "monthly",     // Monthly reset (1st of month)
  "quarterly",   // Quarterly reset
  "yearly",      // Yearly reset (Jan 1)
] as const;

/**
 * B2B Spending Limit Model
 *
 * Stores spending limits with automatic tracking of current usage
 * and scheduled resets based on the period type.
 *
 * @example
 * ```typescript
 * // Company-wide monthly limit
 * const companyLimit = await spendingService.createSpendingLimits({
 *   company_id: "comp_123",
 *   entity_type: "company",
 *   period: "monthly",
 *   limit_amount: 100000,
 *   warning_threshold: 80,
 * });
 *
 * // Employee per-order limit
 * const employeeLimit = await spendingService.createSpendingLimits({
 *   company_id: "comp_123",
 *   entity_type: "employee",
 *   entity_id: "cust_456",
 *   period: "per_order",
 *   limit_amount: 5000,
 * });
 * ```
 */
export const SpendingLimit = model.define({ name: "SpendingLimit", tableName: "b2b_spending_limit" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Company association
  company_id: model.text(),

  // Entity targeting
  /** Type of entity this limit applies to */
  entity_type: model.enum([...ENTITY_TYPES]),
  /** ID of the specific entity (customer_id, department name, role name) */
  entity_id: model.text().nullable(),

  // Limit configuration
  /** Period for this limit */
  period: model.enum([...PERIOD_TYPES]),
  /** Maximum spending amount in cents */
  limit_amount: model.bigNumber(),
  /** Warning threshold percentage (0-100) */
  warning_threshold: model.number().default(80),

  // Current usage tracking
  /** Current spending in this period */
  current_spending: model.bigNumber().default(0),
  /** When this limit will reset */
  next_reset_at: model.dateTime().nullable(),
  /** When spending was last recorded */
  last_transaction_at: model.dateTime().nullable(),

  // Status
  /** Whether this limit is active */
  is_active: model.boolean().default(true),

  // Metadata
  /** Display name for the limit */
  name: model.text().nullable(),
  /** Description or notes */
  description: model.text().nullable(),
})
.indexes([
  { on: ["company_id"], name: "idx_spending_limit_company" },
  { on: ["company_id", "entity_type"], name: "idx_spending_limit_entity_type" },
  { on: ["company_id", "entity_type", "entity_id"], name: "idx_spending_limit_entity" },
  { on: ["next_reset_at"], name: "idx_spending_limit_reset" },
  { on: ["is_active"], name: "idx_spending_limit_active" },
]);

export default SpendingLimit;
