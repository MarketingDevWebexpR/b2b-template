/**
 * B2B Quote Module Definition
 *
 * This module provides quote/RFQ management for B2B e-commerce.
 *
 * Features:
 * - Quote lifecycle management (draft → order)
 * - Multi-item quotes with price negotiation
 * - Buyer/seller messaging
 * - Quote terms and conditions
 * - Validity period management
 * - Quote-to-order conversion
 * - Full audit trail
 *
 * @packageDocumentation
 */

import { Module } from "@medusajs/framework/utils";
import QuoteModuleService from "./service";

/**
 * Module identifier - must match service name derived from first model's table name
 * (b2b_quote → b2bQuoteService)
 */
export const B2B_QUOTE_MODULE = "b2bQuoteService";

/**
 * B2B Quote Module
 *
 * Register this module in medusa-config.ts:
 * ```typescript
 * modules: [
 *   { resolve: "./src/modules/b2b-quote" },
 * ]
 * ```
 */
export default Module(B2B_QUOTE_MODULE, {
  service: QuoteModuleService,
});

// Re-export service and types
export { default as QuoteModuleService } from "./service";
export type {
  QuoteTotals,
  QuoteTerms,
  CreateQuoteInput,
  CreateQuoteItemInput,
  RespondToQuoteInput,
  AddMessageInput,
  RecordHistoryInput,
  ConversionResult,
} from "./service";

// Re-export models and constants
export {
  Quote,
  QuoteItem,
  QuoteMessage,
  QuoteHistory,
  QUOTE_STATUSES,
  MESSAGE_SENDER_TYPES,
  MESSAGE_TYPES,
  HISTORY_EVENT_TYPES,
  type QuoteStatus,
  type MessageSenderType,
  type MessageType,
  type HistoryEventType,
} from "./models/index";
