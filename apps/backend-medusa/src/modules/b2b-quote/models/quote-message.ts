/**
 * Quote Message Model
 *
 * Represents communication between buyer and seller on a quote.
 * Enables negotiation and clarification exchanges.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Message sender types
 */
export const MESSAGE_SENDER_TYPES = [
  "customer",  // Buyer/customer
  "admin",     // Seller/sales rep
  "system",    // Automated messages
] as const;

export type MessageSenderType = (typeof MESSAGE_SENDER_TYPES)[number];

/**
 * Message types
 */
export const MESSAGE_TYPES = [
  "text",          // Plain text message
  "price_update",  // Price change notification
  "terms_update",  // Terms change notification
  "status_change", // Status change notification
  "attachment",    // File attachment
  "internal",      // Internal note (not visible to customer)
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

/**
 * Quote Message Model Definition
 *
 * Communication thread for quote negotiations.
 */
export const QuoteMessage = model.define({ name: "QuoteMessage", tableName: "b2b_quote_message" }, {
  /** Primary identifier */
  id: model.id().primaryKey(),

  /** Parent quote */
  quote_id: model.text().searchable(),

  /** Type of sender */
  sender_type: model.enum([...MESSAGE_SENDER_TYPES]),

  /** Sender ID (customer_id or user_id) */
  sender_id: model.text().searchable(),

  /** Sender name (cached for display) */
  sender_name: model.text().nullable(),

  /** Message type */
  message_type: model.enum([...MESSAGE_TYPES]).default("text"),

  /** Message content */
  content: model.text(),

  /**
   * Attachments (JSON array)
   * [{ url, filename, mimetype, size }]
   */
  attachments: model.json(),

  /** Is internal note (not visible to customer) */
  is_internal: model.boolean().default(false),

  /** Has been read by recipient */
  is_read: model.boolean().default(false),

  /** When message was read */
  read_at: model.dateTime().nullable(),

  /** Referenced quote item (for item-specific messages) */
  quote_item_id: model.text().nullable(),

  /** Additional metadata */
  metadata: model.json().nullable(),
})
  .indexes([
    { on: ["quote_id"], name: "idx_quote_message_quote" },
    { on: ["sender_id"], name: "idx_quote_message_sender" },
    { on: ["quote_id", "sender_type"], name: "idx_quote_message_quote_type" },
  ]);

export default QuoteMessage;
