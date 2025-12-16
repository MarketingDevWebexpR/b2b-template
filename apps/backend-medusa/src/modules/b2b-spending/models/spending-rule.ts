/**
 * B2B Spending Rule Model
 *
 * Defines business rules that trigger actions when spending conditions are met.
 * Rules can require approval, send notifications, or block transactions.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Actions that can be triggered by spending rules
 */
export const RULE_ACTIONS = [
  "require_approval",  // Require manager approval
  "notify",            // Send notification to managers
  "block",             // Block the transaction
  "warn",              // Show warning but allow
] as const;

/**
 * Conditions that trigger rule actions
 */
export const RULE_CONDITIONS = [
  "amount_exceeds",         // Order amount > threshold
  "limit_exceeded",         // Would exceed spending limit
  "limit_warning",          // Approaching warning threshold
  "category_restricted",    // Purchasing from restricted category
  "vendor_restricted",      // Purchasing from restricted vendor
  "quantity_exceeds",       // Item quantity > threshold
] as const;

/**
 * B2B Spending Rule Model
 *
 * Configurable rules that define business policies for spending control.
 *
 * @example
 * ```typescript
 * // Require approval for orders > $5000
 * const highValueRule = await spendingService.createSpendingRules({
 *   company_id: "comp_123",
 *   name: "High Value Order Approval",
 *   condition: "amount_exceeds",
 *   threshold_amount: 5000,
 *   action: "require_approval",
 *   priority: 10,
 * });
 *
 * // Notify when approaching limit
 * const warningRule = await spendingService.createSpendingRules({
 *   company_id: "comp_123",
 *   name: "Spending Warning",
 *   condition: "limit_warning",
 *   action: "notify",
 *   notify_emails: ["finance@company.com"],
 *   priority: 5,
 * });
 * ```
 */
export const SpendingRule = model.define({ name: "SpendingRule", tableName: "b2b_spending_rule" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Company association
  company_id: model.text(),

  // Rule identification
  /** Human-readable name */
  name: model.text(),
  /** Description of what this rule does */
  description: model.text().nullable(),

  // Rule configuration
  /** Condition that triggers this rule */
  condition: model.enum([...RULE_CONDITIONS]),
  /** Threshold amount for amount-based conditions (cents) */
  threshold_amount: model.bigNumber().nullable(),
  /** Threshold percentage for percentage-based conditions */
  threshold_percentage: model.number().nullable(),
  /** Action to take when condition is met */
  action: model.enum([...RULE_ACTIONS]),

  // Targeting
  /** Apply to specific entity types only */
  applies_to_entity_types: model.json().nullable(), // string[]
  /** Apply to specific entity IDs only */
  applies_to_entity_ids: model.json().nullable(), // string[]
  /** Product category IDs to restrict */
  restricted_category_ids: model.json().nullable(), // string[]
  /** Vendor IDs to restrict */
  restricted_vendor_ids: model.json().nullable(), // string[]

  // Notification settings
  /** Email addresses to notify */
  notify_emails: model.json().nullable(), // string[]
  /** Customer IDs to notify */
  notify_customer_ids: model.json().nullable(), // string[]

  // Priority and status
  /** Rule priority (higher = evaluated first) */
  priority: model.number().default(0),
  /** Whether this rule is active */
  is_active: model.boolean().default(true),

  // Approval workflow integration
  /** If action is require_approval, which workflow to use */
  approval_workflow_id: model.text().nullable(),
})
.indexes([
  { on: ["company_id"], name: "idx_spending_rule_company" },
  { on: ["company_id", "condition"], name: "idx_spending_rule_condition" },
  { on: ["company_id", "is_active"], name: "idx_spending_rule_active" },
  { on: ["priority"], name: "idx_spending_rule_priority" },
]);

export default SpendingRule;
