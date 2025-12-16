/**
 * B2B Spending Transaction Model
 *
 * Records all spending events for audit trail and limit tracking.
 * Each transaction affects the current_spending of related limits.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = [
  "charge",      // Spending from order/purchase
  "refund",      // Refund reversing a charge
  "adjustment",  // Manual adjustment by admin
  "reset",       // Periodic reset of limits
] as const;

/**
 * Transaction statuses
 */
export const TRANSACTION_STATUSES = [
  "pending",     // Transaction created, not yet applied
  "applied",     // Successfully applied to limits
  "reversed",    // Reversed (e.g., order cancelled)
  "failed",      // Failed to apply (e.g., limit exceeded)
] as const;

/**
 * B2B Spending Transaction Model
 *
 * Immutable record of all spending events for audit purposes.
 *
 * @example
 * ```typescript
 * // Record order spending
 * const transaction = await spendingService.createSpendingTransactions({
 *   company_id: "comp_123",
 *   customer_id: "cust_456",
 *   type: "charge",
 *   amount: 15000,
 *   order_id: "order_789",
 *   description: "Order ORD-2024-001",
 * });
 *
 * // Record refund
 * const refund = await spendingService.createSpendingTransactions({
 *   company_id: "comp_123",
 *   customer_id: "cust_456",
 *   type: "refund",
 *   amount: -5000,
 *   order_id: "order_789",
 *   related_transaction_id: transaction.id,
 *   description: "Partial refund for ORD-2024-001",
 * });
 * ```
 */
export const SpendingTransaction = model.define({ name: "SpendingTransaction", tableName: "b2b_spending_transaction" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Company and customer association
  company_id: model.text(),
  customer_id: model.text(),

  // Transaction details
  /** Type of transaction */
  type: model.enum([...TRANSACTION_TYPES]),
  /** Status of the transaction */
  status: model.enum([...TRANSACTION_STATUSES]).default("pending"),
  /** Amount in cents (positive for charges, negative for refunds) */
  amount: model.bigNumber(),
  /** Currency code */
  currency_code: model.text().default("EUR"),

  // Reference to source
  /** Order ID if transaction is from an order */
  order_id: model.text().nullable(),
  /** Quote ID if transaction is from a quote conversion */
  quote_id: model.text().nullable(),
  /** Related transaction ID (e.g., original charge for a refund) */
  related_transaction_id: model.text().nullable(),

  // Affected limits (for tracking which limits were updated)
  /** IDs of spending limits affected by this transaction */
  affected_limit_ids: model.json().nullable(), // string[]
  /** Snapshot of limits before transaction */
  limits_snapshot_before: model.json().nullable(),
  /** Snapshot of limits after transaction */
  limits_snapshot_after: model.json().nullable(),

  // Metadata
  /** Human-readable description */
  description: model.text().nullable(),
  /** Additional metadata */
  metadata: model.json().nullable(),

  // Audit
  /** User/system that created this transaction */
  created_by: model.text().nullable(),
  /** When the transaction was applied */
  applied_at: model.dateTime().nullable(),
  /** Reason if transaction failed or was reversed */
  failure_reason: model.text().nullable(),
})
.indexes([
  { on: ["company_id"], name: "idx_spending_tx_company" },
  { on: ["company_id", "customer_id"], name: "idx_spending_tx_customer" },
  { on: ["order_id"], name: "idx_spending_tx_order" },
  { on: ["status"], name: "idx_spending_tx_status" },
  { on: ["type"], name: "idx_spending_tx_type" },
  { on: ["company_id", "created_at"], name: "idx_spending_tx_created" },
]);

export default SpendingTransaction;
