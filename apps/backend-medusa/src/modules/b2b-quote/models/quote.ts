/**
 * Quote Model
 *
 * Represents a B2B quote/RFQ (Request for Quote).
 * Supports the full quote lifecycle from draft to order conversion.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Quote statuses
 */
export const QUOTE_STATUSES = [
  "draft",           // Initial state, buyer building quote
  "submitted",       // Sent to seller for review
  "under_review",    // Seller reviewing
  "responded",       // Seller provided pricing
  "negotiating",     // Back-and-forth on terms
  "accepted",        // Buyer accepted quote
  "rejected",        // Buyer or seller rejected
  "expired",         // Quote validity period passed
  "converted",       // Successfully converted to order
  "cancelled",       // Cancelled before completion
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

/**
 * Quote Model Definition
 *
 * Core quote entity for B2B pricing negotiations.
 */
export const Quote = model.define({ name: "Quote", tableName: "b2b_quote" }, {
  /** Primary identifier */
  id: model.id().primaryKey(),

  /** Human-readable quote number (Q202412-00001) */
  quote_number: model.text().searchable(),

  /** Company requesting the quote */
  company_id: model.text().searchable(),

  /** Customer who created the quote */
  requester_id: model.text().searchable(),

  /** Sales rep assigned to quote (admin user) */
  assigned_to_id: model.text().nullable(),

  /** Current quote status */
  status: model.enum([...QUOTE_STATUSES]).default("draft"),

  /** Quote title/name */
  title: model.text().nullable(),

  /** Additional notes/description */
  notes: model.text().nullable(),

  /**
   * Quote totals (JSON)
   * {
   *   subtotal: number,
   *   discount_amount: number,
   *   discount_percentage: number,
   *   shipping_amount: number,
   *   tax_amount: number,
   *   total: number,
   *   currency_code: string
   * }
   */
  totals: model.json().default({}),

  /**
   * Quote terms (JSON)
   * {
   *   payment_terms: { type, days },
   *   delivery_terms: string,
   *   shipping_method: string,
   *   incoterms: string,
   *   minimum_order_value: number
   * }
   */
  terms: model.json().default({}),

  /** Quote validity end date */
  valid_until: model.dateTime().nullable(),

  /** When buyer submitted the quote */
  submitted_at: model.dateTime().nullable(),

  /** When seller responded with pricing */
  responded_at: model.dateTime().nullable(),

  /** When quote was accepted/rejected */
  decided_at: model.dateTime().nullable(),

  /** When quote was converted to order */
  converted_at: model.dateTime().nullable(),

  /** Order ID after conversion */
  order_id: model.text().nullable(),

  /** Cart ID (draft cart for quote) */
  cart_id: model.text().nullable(),

  /** Region for pricing */
  region_id: model.text().nullable(),

  /** Sales channel */
  sales_channel_id: model.text().nullable(),

  /** Version number for tracking revisions */
  version: model.number().default(1),

  /** Rejection reason if rejected */
  rejection_reason: model.text().nullable(),

  /** Additional metadata */
  metadata: model.json().nullable(),
})
  .indexes([
    { on: ["company_id"], name: "idx_quote_company" },
    { on: ["status"], name: "idx_quote_status" },
    { on: ["requester_id"], name: "idx_quote_requester" },
    { on: ["quote_number"], name: "idx_quote_number", unique: true },
    { on: ["company_id", "status"], name: "idx_quote_company_status" },
  ]);

export default Quote;
