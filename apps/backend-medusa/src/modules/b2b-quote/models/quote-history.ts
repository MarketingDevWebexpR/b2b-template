/**
 * Quote History Model
 *
 * Audit trail for quote changes and events.
 * Tracks all modifications for compliance and analysis.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * History event types
 */
export const HISTORY_EVENT_TYPES = [
  "created",           // Quote created
  "updated",           // Quote fields updated
  "submitted",         // Quote submitted to seller
  "reviewed",          // Seller started review
  "responded",         // Seller provided pricing
  "counter_offered",   // Price counter-offer
  "accepted",          // Quote accepted
  "rejected",          // Quote rejected
  "expired",           // Quote expired
  "converted",         // Converted to order
  "cancelled",         // Quote cancelled
  "item_added",        // Item added to quote
  "item_removed",      // Item removed from quote
  "item_updated",      // Item quantity/price changed
  "terms_changed",     // Payment/delivery terms changed
  "assigned",          // Sales rep assigned
  "reminder_sent",     // Reminder notification sent
  "approval_required", // Sent for approval
  "approval_completed",// Approval completed
] as const;

export type HistoryEventType = (typeof HISTORY_EVENT_TYPES)[number];

/**
 * Quote History Model Definition
 *
 * Complete audit trail of quote lifecycle events.
 */
export const QuoteHistory = model.define({ name: "QuoteHistory", tableName: "b2b_quote_history" }, {
  /** Primary identifier */
  id: model.id().primaryKey(),

  /** Parent quote */
  quote_id: model.text().searchable(),

  /** Event type */
  event_type: model.enum([...HISTORY_EVENT_TYPES]),

  /** Actor type (customer/admin/system) */
  actor_type: model.text(),

  /** Actor ID */
  actor_id: model.text().nullable(),

  /** Actor name (cached) */
  actor_name: model.text().nullable(),

  /** Human-readable description */
  description: model.text(),

  /**
   * Previous values (JSON)
   * Stores the state before the change
   */
  previous_values: model.json().nullable(),

  /**
   * New values (JSON)
   * Stores the state after the change
   */
  new_values: model.json().nullable(),

  /**
   * Changed fields (JSON array)
   * List of field names that changed
   */
  changed_fields: model.json(),

  /** Related entity type (item, message, etc.) */
  related_entity_type: model.text().nullable(),

  /** Related entity ID */
  related_entity_id: model.text().nullable(),

  /** IP address of actor */
  ip_address: model.text().nullable(),

  /** User agent string */
  user_agent: model.text().nullable(),

  /** Additional metadata */
  metadata: model.json().nullable(),
})
  .indexes([
    { on: ["quote_id"], name: "idx_quote_history_quote" },
    { on: ["event_type"], name: "idx_quote_history_event_type" },
    { on: ["quote_id", "event_type"], name: "idx_quote_history_quote_event" },
  ]);

export default QuoteHistory;
