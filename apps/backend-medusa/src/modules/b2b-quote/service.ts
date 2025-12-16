/**
 * B2B Quote Module Service
 *
 * Core business logic for quote management including:
 * - Quote CRUD operations
 * - Quote lifecycle (submit, respond, accept, reject)
 * - Item management
 * - Messaging between buyer/seller
 * - Quote conversion to order
 * - History tracking
 *
 * @packageDocumentation
 */

import { MedusaService } from "@medusajs/framework/utils";
import {
  Quote,
  QuoteItem,
  QuoteMessage,
  QuoteHistory,
  type QuoteStatus,
  type MessageSenderType,
  type MessageType,
  type HistoryEventType,
} from "./models/index";
import {
  validateRequired,
  validateFutureDate,
  validateOptional,
} from "../validation-utils";

/**
 * Quote totals structure
 */
export interface QuoteTotals {
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  currency_code: string;
}

/**
 * Quote terms structure
 */
export interface QuoteTerms {
  payment_terms?: {
    type: string;
    days: number;
  };
  delivery_terms?: string;
  shipping_method?: string;
  incoterms?: string;
  minimum_order_value?: number;
}

/**
 * Input for creating a new quote
 */
export interface CreateQuoteInput {
  companyId: string;
  requesterId: string;
  title?: string;
  notes?: string;
  regionId?: string;
  salesChannelId?: string;
  cartId?: string;
  /** Number of days the quote is valid (default: 30) */
  validDays?: number;
  /** Explicit valid until date (takes precedence over validDays if provided) */
  validUntil?: Date | string;
  terms?: QuoteTerms;
  items?: CreateQuoteItemInput[];
}

/**
 * Input for creating a quote item
 */
export interface CreateQuoteItemInput {
  variantId: string;
  productId?: string;
  title: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  originalUnitPrice: number;
  requestedUnitPrice?: number;
  currencyCode?: string;
  notes?: string;
  variantMetadata?: Record<string, unknown>;
}

/**
 * Input for responding to a quote (seller)
 */
export interface RespondToQuoteInput {
  quoteId: string;
  actorId: string;
  actorName: string;
  items: {
    itemId: string;
    offeredUnitPrice: number;
    notes?: string;
  }[];
  terms?: QuoteTerms;
  validDays?: number;
  notes?: string;
}

/**
 * Input for adding a message to a quote
 */
export interface AddMessageInput {
  quoteId: string;
  senderType: MessageSenderType;
  senderId: string;
  senderName?: string;
  messageType?: MessageType;
  content: string;
  attachments?: { url: string; filename: string; mimetype: string; size: number }[];
  isInternal?: boolean;
  quoteItemId?: string;
}

/**
 * Input for recording history
 */
export interface RecordHistoryInput {
  quoteId: string;
  eventType: HistoryEventType;
  actorType: string;
  actorId?: string;
  actorName?: string;
  description: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  changedFields?: string[];
  relatedEntityType?: string;
  relatedEntityId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Quote conversion result
 */
export interface ConversionResult {
  success: boolean;
  orderId?: string;
  approvalRequired?: boolean;
  approvalRequestId?: string;
  error?: string;
}

/**
 * B2B Quote Module Service
 *
 * Manages the complete quote lifecycle for B2B e-commerce.
 */
class QuoteModuleService extends MedusaService({
  Quote,
  QuoteItem,
  QuoteMessage,
  QuoteHistory,
}) {
  /**
   * Generates a unique quote number.
   *
   * Queries the database for the highest existing number with the current month prefix
   * and increments the sequence. This is database-safe and works across server restarts
   * and multiple instances.
   *
   * Format: Q{YYYYMM}-{NNNNN}
   *
   * @returns Promise resolving to a unique quote number
   */
  async generateQuoteNumber(): Promise<string> {
    const now = new Date();
    const prefix = `Q${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Get all quotes with this month's prefix to find max sequence
    const quotes = await this.listQuotes({
      filters: {
        quote_number: { $like: `${prefix}-%` },
      },
      select: ["quote_number"],
    });

    let maxSeq = 0;
    for (const quote of quotes) {
      const quoteNumber = quote.quote_number as string;
      const match = quoteNumber.match(/-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }

    return `${prefix}-${String(maxSeq + 1).padStart(5, "0")}`;
  }

  /**
   * Creates a new quote
   *
   * @param input - Quote creation data
   * @returns The created quote
   * @throws ValidationError if input validation fails
   */
  async createQuote(input: CreateQuoteInput) {
    // Validate required fields
    validateRequired(input.companyId, "companyId");
    validateRequired(input.requesterId, "requesterId");

    // Validate validUntil is a future date if provided
    validateOptional(input.validUntil, (value) =>
      validateFutureDate(value, "validUntil")
    );

    const quoteNumber = await this.generateQuoteNumber();

    // Calculate valid_until date: use explicit validUntil if provided, otherwise calculate from validDays
    let validUntil: Date;
    if (input.validUntil) {
      validUntil = typeof input.validUntil === "string" ? new Date(input.validUntil) : input.validUntil;
    } else {
      validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + (input.validDays ?? 30));
    }

    const quote = await this.createQuotes({
      quote_number: quoteNumber,
      company_id: input.companyId,
      requester_id: input.requesterId,
      title: input.title,
      notes: input.notes,
      region_id: input.regionId,
      sales_channel_id: input.salesChannelId,
      cart_id: input.cartId,
      status: "draft",
      valid_until: validUntil,
      terms: (input.terms || {}) as unknown as Record<string, unknown>,
      totals: {
        subtotal: 0,
        discount_amount: 0,
        discount_percentage: 0,
        shipping_amount: 0,
        tax_amount: 0,
        total: 0,
        currency_code: "EUR",
      },
    });

    // Add items if provided
    if (input.items && input.items.length > 0) {
      for (let i = 0; i < input.items.length; i++) {
        await this.addQuoteItem(quote.id, { ...input.items[i], sortOrder: i });
      }

      // Recalculate totals
      await this.recalculateQuoteTotals(quote.id);
    }

    // Record history
    await this.recordHistory({
      quoteId: quote.id,
      eventType: "created",
      actorType: "customer",
      actorId: input.requesterId,
      description: `Quote ${quoteNumber} created`,
      newValues: { quote_number: quoteNumber, company_id: input.companyId },
    });

    return this.retrieveQuote(quote.id);
  }

  /**
   * Adds an item to a quote
   */
  async addQuoteItem(
    quoteId: string,
    input: CreateQuoteItemInput & { sortOrder?: number }
  ) {
    const item = await this.createQuoteItems({
      quote_id: quoteId,
      variant_id: input.variantId,
      product_id: input.productId,
      title: input.title,
      variant_title: input.variantTitle,
      sku: input.sku,
      quantity: input.quantity,
      original_unit_price: input.originalUnitPrice,
      requested_unit_price: input.requestedUnitPrice,
      currency_code: input.currencyCode || "EUR",
      notes: input.notes,
      sort_order: input.sortOrder || 0,
      variant_metadata: input.variantMetadata,
      line_total: input.quantity * input.originalUnitPrice,
    });

    return item;
  }

  /**
   * Recalculates quote totals from items
   */
  async recalculateQuoteTotals(quoteId: string): Promise<QuoteTotals> {
    const items = await this.listQuoteItems({
      filters: { quote_id: quoteId },
    });

    let subtotal = 0;
    let currencyCode = "EUR";

    for (const item of items) {
      // Use final price if set, otherwise offered, otherwise original
      const unitPrice =
        item.final_unit_price ?? item.offered_unit_price ?? item.original_unit_price;
      const lineTotal = Number(unitPrice) * item.quantity;

      // Update item line total
      await this.updateQuoteItems({ id: item.id, line_total: lineTotal });

      subtotal += lineTotal;
      currencyCode = item.currency_code;
    }

    const totals: QuoteTotals = {
      subtotal,
      discount_amount: 0,
      discount_percentage: 0,
      shipping_amount: 0,
      tax_amount: 0,
      total: subtotal,
      currency_code: currencyCode,
    };

    await this.updateQuotes({ id: quoteId, totals: totals as unknown as Record<string, unknown> });

    return totals;
  }

  /**
   * Submits a quote for seller review
   */
  async submitQuote(
    quoteId: string,
    actorId: string,
    actorName?: string
  ) {
    const quote = await this.retrieveQuote(quoteId);

    if (quote.status !== "draft") {
      throw new Error(`Cannot submit quote with status "${quote.status}"`);
    }

    // Verify quote has items
    const items = await this.listQuoteItems({
      filters: { quote_id: quoteId },
      select: ["id"],
    });

    if (items.length === 0) {
      throw new Error("Cannot submit quote without items");
    }

    const updatedQuote = await this.updateQuotes({
      id: quoteId,
      status: "submitted",
      submitted_at: new Date(),
    });

    await this.recordHistory({
      quoteId,
      eventType: "submitted",
      actorType: "customer",
      actorId,
      actorName,
      description: `Quote ${quote.quote_number} submitted for review`,
      previousValues: { status: "draft" },
      newValues: { status: "submitted" },
      changedFields: ["status", "submitted_at"],
    });

    return updatedQuote;
  }

  /**
   * Seller responds to a quote with pricing
   */
  async respondToQuote(input: RespondToQuoteInput) {
    const quote = await this.retrieveQuote(input.quoteId);

    const validStatuses: QuoteStatus[] = ["submitted", "under_review", "negotiating"];
    if (!validStatuses.includes(quote.status as QuoteStatus)) {
      throw new Error(`Cannot respond to quote with status "${quote.status}"`);
    }

    // Update item prices
    for (const itemUpdate of input.items) {
      await this.updateQuoteItems({
        id: itemUpdate.itemId,
        offered_unit_price: itemUpdate.offeredUnitPrice,
        notes: itemUpdate.notes,
      });
    }

    // Recalculate totals
    await this.recalculateQuoteTotals(input.quoteId);

    // Update validity if provided
    const updates: Record<string, unknown> = {
      status: "responded",
      responded_at: new Date(),
    };

    if (input.validDays) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + input.validDays);
      updates.valid_until = validUntil;
    }

    if (input.terms) {
      updates.terms = { ...(quote.terms as QuoteTerms), ...input.terms } as unknown as Record<string, unknown>;
    }

    if (input.notes) {
      // Add message for notes
      await this.addMessage({
        quoteId: input.quoteId,
        senderType: "admin",
        senderId: input.actorId,
        senderName: input.actorName,
        messageType: "price_update",
        content: input.notes,
      });
    }

    const updatedQuote = await this.updateQuotes({ id: input.quoteId, ...updates });

    await this.recordHistory({
      quoteId: input.quoteId,
      eventType: "responded",
      actorType: "admin",
      actorId: input.actorId,
      actorName: input.actorName,
      description: `Seller responded with pricing`,
      previousValues: { status: quote.status },
      newValues: { status: "responded" },
      changedFields: ["status", "responded_at"],
    });

    return updatedQuote;
  }

  /**
   * Buyer accepts a quote
   */
  async acceptQuote(
    quoteId: string,
    actorId: string,
    actorName?: string
  ) {
    const quote = await this.retrieveQuote(quoteId);

    if (quote.status !== "responded" && quote.status !== "negotiating") {
      throw new Error(`Cannot accept quote with status "${quote.status}"`);
    }

    // Check if quote is expired
    if (quote.valid_until && new Date(quote.valid_until) < new Date()) {
      await this.updateQuotes({ id: quoteId, status: "expired" });
      throw new Error("Quote has expired");
    }

    // Finalize item prices
    const items = await this.listQuoteItems({
      filters: { quote_id: quoteId },
    });

    for (const item of items) {
      const finalPrice =
        item.offered_unit_price ?? item.original_unit_price;
      await this.updateQuoteItems({
        id: item.id,
        final_unit_price: finalPrice,
      });
    }

    await this.recalculateQuoteTotals(quoteId);

    const updatedQuote = await this.updateQuotes({
      id: quoteId,
      status: "accepted",
      decided_at: new Date(),
    });

    await this.recordHistory({
      quoteId,
      eventType: "accepted",
      actorType: "customer",
      actorId,
      actorName,
      description: `Quote ${quote.quote_number} accepted by buyer`,
      previousValues: { status: quote.status },
      newValues: { status: "accepted" },
      changedFields: ["status", "decided_at"],
    });

    return updatedQuote;
  }

  /**
   * Rejects a quote
   */
  async rejectQuote(
    quoteId: string,
    actorId: string,
    actorType: "customer" | "admin",
    reason?: string,
    actorName?: string
  ) {
    const quote = await this.retrieveQuote(quoteId);

    const rejectionStatuses: QuoteStatus[] = [
      "submitted",
      "under_review",
      "responded",
      "negotiating",
    ];

    if (!rejectionStatuses.includes(quote.status as QuoteStatus)) {
      throw new Error(`Cannot reject quote with status "${quote.status}"`);
    }

    const updatedQuote = await this.updateQuotes({
      id: quoteId,
      status: "rejected",
      decided_at: new Date(),
      rejection_reason: reason,
    });

    await this.recordHistory({
      quoteId,
      eventType: "rejected",
      actorType,
      actorId,
      actorName,
      description: `Quote ${quote.quote_number} rejected${reason ? `: ${reason}` : ""}`,
      previousValues: { status: quote.status },
      newValues: { status: "rejected", rejection_reason: reason },
      changedFields: ["status", "decided_at", "rejection_reason"],
    });

    return updatedQuote;
  }

  /**
   * Marks a quote as converted to order
   */
  async markAsConverted(
    quoteId: string,
    orderId: string,
    actorId: string,
    actorName?: string
  ) {
    const quote = await this.retrieveQuote(quoteId);

    if (quote.status !== "accepted") {
      throw new Error(`Cannot convert quote with status "${quote.status}"`);
    }

    const updatedQuote = await this.updateQuotes({
      id: quoteId,
      status: "converted",
      converted_at: new Date(),
      order_id: orderId,
    });

    await this.recordHistory({
      quoteId,
      eventType: "converted",
      actorType: "customer",
      actorId,
      actorName,
      description: `Quote ${quote.quote_number} converted to order ${orderId}`,
      previousValues: { status: "accepted" },
      newValues: { status: "converted", order_id: orderId },
      changedFields: ["status", "converted_at", "order_id"],
    });

    return updatedQuote;
  }

  /**
   * Adds a message to a quote thread
   */
  async addMessage(input: AddMessageInput) {
    const message = await this.createQuoteMessages({
      quote_id: input.quoteId,
      sender_type: input.senderType,
      sender_id: input.senderId,
      sender_name: input.senderName,
      message_type: input.messageType || "text",
      content: input.content,
      attachments: (input.attachments || []) as unknown as Record<string, unknown>,
      is_internal: input.isInternal || false,
      quote_item_id: input.quoteItemId,
    });

    return message;
  }

  /**
   * Lists messages for a quote
   */
  async listMessages(
    quoteId: string,
    includeInternal = false
  ) {
    const filters: Record<string, unknown> = { quote_id: quoteId };

    if (!includeInternal) {
      filters.is_internal = false;
    }

    return this.listQuoteMessages({ filters });
  }

  /**
   * Records a history event
   */
  async recordHistory(input: RecordHistoryInput) {
    return this.createQuoteHistories({
      quote_id: input.quoteId,
      event_type: input.eventType,
      actor_type: input.actorType,
      actor_id: input.actorId,
      actor_name: input.actorName,
      description: input.description,
      previous_values: input.previousValues,
      new_values: input.newValues,
      changed_fields: (input.changedFields || []) as unknown as Record<string, unknown>,
      related_entity_type: input.relatedEntityType,
      related_entity_id: input.relatedEntityId,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
    });
  }

  /**
   * Gets the full history of a quote
   */
  async getQuoteHistory(quoteId: string) {
    return this.listQuoteHistories({
      filters: { quote_id: quoteId },
    });
  }

  /**
   * Gets quotes for a company
   */
  async getCompanyQuotes(
    companyId: string,
    options?: {
      status?: QuoteStatus | QuoteStatus[];
      requesterId?: string;
      skip?: number;
      take?: number;
    }
  ) {
    const filters: Record<string, unknown> = { company_id: companyId };

    if (options?.status) {
      filters.status = Array.isArray(options.status)
        ? { $in: options.status }
        : options.status;
    }

    if (options?.requesterId) {
      filters.requester_id = options.requesterId;
    }

    return this.listQuotes({
      filters,
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Gets quotes pending seller action
   */
  async getPendingQuotes(options?: {
    assignedToId?: string;
    skip?: number;
    take?: number;
  }) {
    const filters: Record<string, unknown> = {
      status: { $in: ["submitted", "under_review", "negotiating"] },
    };

    if (options?.assignedToId) {
      filters.assigned_to_id = options.assignedToId;
    }

    return this.listQuotes({
      filters,
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Assigns a sales rep to a quote
   */
  async assignSalesRep(
    quoteId: string,
    assignedToId: string,
    assignedByName?: string
  ) {
    const quote = await this.retrieveQuote(quoteId);

    const updatedQuote = await this.updateQuotes({
      id: quoteId,
      assigned_to_id: assignedToId,
      status: quote.status === "submitted" ? "under_review" : quote.status,
    });

    await this.recordHistory({
      quoteId,
      eventType: "assigned",
      actorType: "admin",
      actorId: assignedToId,
      actorName: assignedByName,
      description: `Quote assigned to sales rep`,
      previousValues: { assigned_to_id: quote.assigned_to_id },
      newValues: { assigned_to_id: assignedToId },
      changedFields: ["assigned_to_id"],
    });

    return updatedQuote;
  }

  /**
   * Checks for and marks expired quotes
   */
  async processExpiredQuotes(): Promise<number> {
    const expirableStatuses: QuoteStatus[] = [
      "submitted",
      "under_review",
      "responded",
      "negotiating",
    ];

    const expiredQuotes = await this.listQuotes({
      filters: {
        status: { $in: expirableStatuses },
        valid_until: { $lt: new Date() },
      },
    });

    for (const quote of expiredQuotes) {
      await this.updateQuotes({ id: quote.id, status: "expired" });

      await this.recordHistory({
        quoteId: quote.id,
        eventType: "expired",
        actorType: "system",
        description: `Quote ${quote.quote_number} expired`,
        previousValues: { status: quote.status },
        newValues: { status: "expired" },
        changedFields: ["status"],
      });
    }

    return expiredQuotes.length;
  }
}

export default QuoteModuleService;

// Re-export types
export type {
  QuoteStatus,
  MessageSenderType,
  MessageType,
  HistoryEventType,
} from "./models/index";
