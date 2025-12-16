/**
 * B2B Quote Service Interface
 * Defines the contract for quote-related operations in B2B context.
 */

import type {
  Quote,
  QuoteSummary,
  QuoteStatus,
  QuoteMessage,
  QuoteAttachment,
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteResponseInput,
  QuoteFilters,
} from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";
import type { Cart } from "../cart";

/**
 * Options for listing quotes
 */
export interface ListQuotesOptions extends QuoteFilters {
  /** Page number */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Sort field */
  sortBy?: "createdAt" | "updatedAt" | "validUntil" | "total" | "quoteNumber";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Quote conversion result
 */
export interface QuoteConversionResult {
  /** Created order ID */
  orderId: string;
  /** Order number */
  orderNumber: string;
  /** Updated quote */
  quote: Quote;
  /** Success message */
  message: string;
}

/**
 * Quote PDF options
 */
export interface QuotePdfOptions {
  /** Include company letterhead */
  includeLetterhead?: boolean;
  /** Include terms and conditions */
  includeTerms?: boolean;
  /** Language for the PDF */
  language?: string;
}

/**
 * Interface for B2B quote operations.
 * All adapters must implement this interface.
 */
export interface IQuoteService {
  /**
   * List quotes with optional filtering.
   *
   * @param options - Listing options
   * @returns Paginated list of quotes
   *
   * @example
   * ```typescript
   * const quotes = await api.b2b.quotes.list({
   *   status: ["submitted", "responded"],
   *   companyId: "comp_123",
   *   pageSize: 20
   * });
   * ```
   */
  list(options?: ListQuotesOptions): Promise<PaginatedResponse<QuoteSummary>>;

  /**
   * Get a quote by ID.
   *
   * @param id - Quote ID
   * @returns Full quote details
   */
  get(id: string): Promise<Quote>;

  /**
   * Get quote by quote number.
   *
   * @param quoteNumber - Human-readable quote number
   * @returns Full quote details
   */
  getByNumber(quoteNumber: string): Promise<Quote>;

  /**
   * Create a new quote from cart.
   *
   * @param cartId - Cart ID to convert
   * @param input - Additional quote details
   * @returns Created quote
   *
   * @example
   * ```typescript
   * const quote = await api.b2b.quotes.createFromCart("cart_123", {
   *   requestedDeliveryDate: "2024-03-01",
   *   notesForSeller: "Need bulk discount"
   * });
   * ```
   */
  createFromCart(cartId: string, input?: Partial<CreateQuoteInput>): Promise<Quote>;

  /**
   * Create a new quote directly.
   *
   * @param input - Quote creation input
   * @returns Created quote
   */
  create(input: CreateQuoteInput): Promise<Quote>;

  /**
   * Update a draft quote.
   *
   * @param id - Quote ID
   * @param input - Update data
   * @returns Updated quote
   */
  update(id: string, input: UpdateQuoteInput): Promise<Quote>;

  /**
   * Submit a draft quote for review.
   *
   * @param id - Quote ID
   * @param message - Optional message for seller
   * @returns Updated quote
   */
  submit(id: string, message?: string): Promise<Quote>;

  /**
   * Accept a responded quote.
   *
   * @param id - Quote ID
   * @param comment - Optional comment
   * @returns Updated quote
   */
  accept(id: string, comment?: string): Promise<Quote>;

  /**
   * Reject a quote.
   *
   * @param id - Quote ID
   * @param reason - Rejection reason
   * @returns Updated quote
   */
  reject(id: string, reason: string): Promise<Quote>;

  /**
   * Cancel a quote.
   *
   * @param id - Quote ID
   * @param reason - Cancellation reason
   * @returns Updated quote
   */
  cancel(id: string, reason?: string): Promise<Quote>;

  /**
   * Convert an accepted quote to an order.
   *
   * @param id - Quote ID
   * @param options - Conversion options
   * @returns Conversion result
   *
   * @example
   * ```typescript
   * const result = await api.b2b.quotes.convertToOrder("quote_123", {
   *   purchaseOrderNumber: "PO-2024-001"
   * });
   * ```
   */
  convertToOrder(
    id: string,
    options?: {
      purchaseOrderNumber?: string;
      notes?: string;
    }
  ): Promise<QuoteConversionResult>;

  /**
   * Convert quote to cart for further editing.
   *
   * @param id - Quote ID
   * @returns New cart with quote items
   */
  convertToCart(id: string): Promise<Cart>;

  /**
   * Request a quote revision.
   *
   * @param id - Quote ID
   * @param message - Message explaining requested changes
   * @returns Updated quote
   */
  requestRevision(id: string, message: string): Promise<Quote>;

  /**
   * Create a revision of a quote.
   *
   * @param id - Original quote ID
   * @returns New quote (revision)
   */
  createRevision(id: string): Promise<Quote>;

  // Item Management

  /**
   * Add item to draft quote.
   *
   * @param quoteId - Quote ID
   * @param item - Item to add
   * @returns Updated quote
   */
  addItem(
    quoteId: string,
    item: {
      productId: string;
      quantity: number;
      requestedPrice?: number;
      notes?: string;
    }
  ): Promise<Quote>;

  /**
   * Update item in draft quote.
   *
   * @param quoteId - Quote ID
   * @param itemId - Item ID
   * @param updates - Updates
   * @returns Updated quote
   */
  updateItem(
    quoteId: string,
    itemId: string,
    updates: {
      quantity?: number;
      requestedPrice?: number;
      notes?: string;
    }
  ): Promise<Quote>;

  /**
   * Remove item from draft quote.
   *
   * @param quoteId - Quote ID
   * @param itemId - Item ID
   * @returns Updated quote
   */
  removeItem(quoteId: string, itemId: string): Promise<Quote>;

  // Messaging

  /**
   * Get messages for a quote.
   *
   * @param quoteId - Quote ID
   * @returns Array of messages
   */
  getMessages(quoteId: string): Promise<QuoteMessage[]>;

  /**
   * Send a message on a quote.
   *
   * @param quoteId - Quote ID
   * @param message - Message content
   * @param attachments - Optional attachments
   * @returns Created message
   */
  sendMessage(
    quoteId: string,
    message: string,
    attachments?: File[]
  ): Promise<QuoteMessage>;

  /**
   * Mark messages as read.
   *
   * @param quoteId - Quote ID
   */
  markMessagesRead(quoteId: string): Promise<void>;

  // Attachments

  /**
   * Upload attachment to quote.
   *
   * @param quoteId - Quote ID
   * @param file - File to upload
   * @returns Created attachment
   */
  uploadAttachment(quoteId: string, file: File): Promise<QuoteAttachment>;

  /**
   * Delete attachment from quote.
   *
   * @param quoteId - Quote ID
   * @param attachmentId - Attachment ID
   */
  deleteAttachment(quoteId: string, attachmentId: string): Promise<void>;

  // PDF Generation

  /**
   * Generate quote PDF.
   *
   * @param id - Quote ID
   * @param options - PDF options
   * @returns PDF download URL
   */
  generatePdf(id: string, options?: QuotePdfOptions): Promise<string>;

  /**
   * Get PDF download URL.
   *
   * @param id - Quote ID
   * @returns PDF URL
   */
  getPdfUrl(id: string): Promise<string>;

  // Company/Employee specific

  /**
   * Get quotes for a company.
   *
   * @param companyId - Company ID
   * @param options - Listing options
   * @returns Paginated quotes
   */
  getByCompany(
    companyId: string,
    options?: Omit<ListQuotesOptions, "companyId">
  ): Promise<PaginatedResponse<QuoteSummary>>;

  /**
   * Get quotes for an employee.
   *
   * @param employeeId - Employee ID
   * @param options - Listing options
   * @returns Paginated quotes
   */
  getByEmployee(
    employeeId: string,
    options?: Omit<ListQuotesOptions, "employeeId">
  ): Promise<PaginatedResponse<QuoteSummary>>;

  /**
   * Get quotes requiring attention.
   *
   * @returns Quotes with unread messages or expiring soon
   */
  getRequiringAttention(): Promise<QuoteSummary[]>;

  /**
   * Delete a draft quote.
   *
   * @param id - Quote ID
   */
  delete(id: string): Promise<void>;
}
