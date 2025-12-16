/**
 * Quote Item Model
 *
 * Represents a line item within a B2B quote.
 * Tracks both requested and offered pricing.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Quote Item Model Definition
 *
 * Individual product line in a quote with pricing negotiation support.
 */
export const QuoteItem = model.define({ name: "QuoteItem", tableName: "b2b_quote_item" }, {
  /** Primary identifier */
  id: model.id().primaryKey(),

  /** Parent quote */
  quote_id: model.text().searchable(),

  /** Product variant being quoted */
  variant_id: model.text().searchable(),

  /** Product ID (for reference) */
  product_id: model.text().nullable(),

  /** Product title at time of quote */
  title: model.text(),

  /** Variant title at time of quote */
  variant_title: model.text().nullable(),

  /** Product SKU at time of quote */
  sku: model.text().nullable(),

  /** Requested quantity */
  quantity: model.number().default(1),

  /** Minimum order quantity (if applicable) */
  min_quantity: model.number().nullable(),

  /**
   * Original unit price (list price)
   * Stored as integer cents
   */
  original_unit_price: model.bigNumber(),

  /**
   * Requested unit price (buyer's target price)
   * Stored as integer cents
   */
  requested_unit_price: model.bigNumber().nullable(),

  /**
   * Offered unit price (seller's response)
   * Stored as integer cents
   */
  offered_unit_price: model.bigNumber().nullable(),

  /**
   * Final agreed unit price
   * Stored as integer cents
   */
  final_unit_price: model.bigNumber().nullable(),

  /** Discount percentage applied */
  discount_percentage: model.number().default(0),

  /** Line item total (quantity * final_unit_price) */
  line_total: model.bigNumber().default(0),

  /** Currency code */
  currency_code: model.text().default("EUR"),

  /** Item-level notes */
  notes: model.text().nullable(),

  /**
   * Inventory reservation ID (if stock is held)
   */
  reservation_id: model.text().nullable(),

  /** Sort order within quote */
  sort_order: model.number().default(0),

  /**
   * Custom fields from variant (JSON)
   * Captures any variant metadata at quote time
   */
  variant_metadata: model.json().nullable(),

  /** Additional metadata */
  metadata: model.json().nullable(),
})
  .indexes([
    { on: ["quote_id"], name: "idx_quote_item_quote" },
    { on: ["variant_id"], name: "idx_quote_item_variant" },
    { on: ["quote_id", "variant_id"], name: "idx_quote_item_quote_variant" },
  ]);

export default QuoteItem;
