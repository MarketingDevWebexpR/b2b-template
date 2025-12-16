/**
 * B2B Quote Types
 * Defines quote entities, items, and workflow for B2B request-for-quote system.
 */

import type { PaymentTermType } from './company';

// ============================================
// Quote Status
// ============================================

/**
 * Status of a quote in the workflow.
 */
export type QuoteStatus =
  | 'draft'           // Quote being prepared by buyer
  | 'submitted'       // Submitted to seller for review
  | 'under_review'    // Seller is reviewing
  | 'pending_info'    // Seller needs more information
  | 'responded'       // Seller has responded with pricing
  | 'negotiating'     // In negotiation
  | 'accepted'        // Buyer accepted the quote
  | 'rejected'        // Buyer rejected the quote
  | 'expired'         // Quote expired
  | 'converted'       // Converted to order
  | 'cancelled';      // Cancelled

// ============================================
// Quote Item
// ============================================

/**
 * A single item in a quote.
 */
export interface QuoteItem {
  /** Unique identifier */
  id: string;
  /** Product ID */
  productId: string;
  /** Product SKU/reference */
  productSku: string;
  /** Product name at time of quote */
  productName: string;
  /** Product image URL */
  productImage?: string;
  /** Requested quantity */
  quantity: number;
  /** Unit of measure */
  unitOfMeasure: string;
  /** Original unit price (list price) */
  listPrice: number;
  /** Requested/proposed unit price */
  requestedPrice?: number;
  /** Final quoted price (after seller response) */
  quotedPrice?: number;
  /** Discount percentage from list */
  discountPercent?: number;
  /** Line total (quantity * quotedPrice or requestedPrice) */
  lineTotal: number;
  /** Target delivery date for this item */
  targetDeliveryDate?: string;
  /** Confirmed delivery date */
  confirmedDeliveryDate?: string;
  /** Notes specific to this item */
  notes?: string;
  /** Custom specifications */
  specifications?: Record<string, string>;
}

// ============================================
// Quote Totals
// ============================================

/**
 * Quote financial totals.
 */
export interface QuoteTotals {
  /** Sum of line totals */
  subtotal: number;
  /** Total discount amount */
  discount: number;
  /** Shipping cost */
  shipping: number;
  /** Tax amount */
  tax: number;
  /** Grand total */
  total: number;
  /** Currency code */
  currency: string;
}

// ============================================
// Quote Terms
// ============================================

/**
 * Terms and conditions for a quote.
 */
export interface QuoteTerms {
  /** Payment terms type */
  paymentTerms: PaymentTermType;
  /** Custom payment terms days */
  paymentTermsDays?: number;
  /** Shipping terms (Incoterms) */
  shippingTerms?: string;
  /** Warranty terms */
  warrantyTerms?: string;
  /** Return policy */
  returnPolicy?: string;
  /** Custom terms and conditions */
  customTerms?: string;
}

// ============================================
// Quote History Entry
// ============================================

/**
 * Type of quote history event.
 */
export type QuoteHistoryEventType =
  | 'created'
  | 'submitted'
  | 'viewed'
  | 'responded'
  | 'price_updated'
  | 'quantity_updated'
  | 'item_added'
  | 'item_removed'
  | 'note_added'
  | 'negotiation_started'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'
  | 'cancelled';

/**
 * A history entry tracking quote changes.
 */
export interface QuoteHistoryEntry {
  id: string;
  quoteId: string;
  eventType: QuoteHistoryEventType;
  description: string;
  /** Actor who made the change */
  actorId: string;
  actorType: 'buyer' | 'seller' | 'system';
  actorName: string;
  /** Previous values (for changes) */
  previousValues?: Record<string, unknown>;
  /** New values (for changes) */
  newValues?: Record<string, unknown>;
  /** ISO timestamp */
  createdAt: string;
}

// ============================================
// Quote Message
// ============================================

/**
 * A message in the quote conversation.
 */
export interface QuoteMessage {
  id: string;
  quoteId: string;
  senderId: string;
  senderType: 'buyer' | 'seller';
  senderName: string;
  message: string;
  attachments?: QuoteAttachment[];
  isRead: boolean;
  createdAt: string;
}

/**
 * An attachment on a quote or message.
 */
export interface QuoteAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedById: string;
  uploadedAt: string;
}

// ============================================
// Quote
// ============================================

/**
 * B2B Quote entity.
 * Represents a request for quotation and its responses.
 */
export interface Quote {
  /** Unique identifier */
  id: string;
  /** Human-readable quote number */
  quoteNumber: string;
  /** Reference to previous quote (for revisions) */
  parentQuoteId?: string;
  /** Revision number (1 for original) */
  revision: number;

  // Company and employee
  /** Company requesting the quote */
  companyId: string;
  /** Company name (denormalized) */
  companyName: string;
  /** Employee who created the quote */
  employeeId: string;
  /** Employee name (denormalized) */
  employeeName: string;
  /** Contact email for this quote */
  contactEmail: string;
  /** Contact phone for this quote */
  contactPhone?: string;

  // Status
  /** Current status */
  status: QuoteStatus;
  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Items and totals
  /** Quote items */
  items: QuoteItem[];
  /** Quote totals */
  totals: QuoteTotals;

  // Terms
  /** Quote terms */
  terms: QuoteTerms;

  // Shipping
  /** Shipping address ID */
  shippingAddressId?: string;
  /** Requested delivery date */
  requestedDeliveryDate?: string;
  /** Confirmed delivery date */
  confirmedDeliveryDate?: string;
  /** Shipping method preference */
  shippingMethod?: string;

  // Dates
  /** Quote validity period start */
  validFrom: string;
  /** Quote validity period end */
  validUntil: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** ISO timestamp of submission */
  submittedAt?: string;
  /** ISO timestamp of seller response */
  respondedAt?: string;
  /** ISO timestamp of acceptance/rejection */
  decidedAt?: string;
  /** ISO timestamp of conversion to order */
  convertedAt?: string;

  // Notes and messages
  /** Internal notes (visible only to buyer) */
  internalNotes?: string;
  /** Notes for seller */
  notesForSeller?: string;
  /** Seller response notes */
  sellerNotes?: string;
  /** Message count */
  messageCount: number;
  /** Unread message count */
  unreadMessageCount: number;

  // Related entities
  /** Converted order ID */
  orderId?: string;
  /** Sales representative ID */
  salesRepId?: string;
  /** Attachments */
  attachments: QuoteAttachment[];

  // History
  /** Quote history */
  history: QuoteHistoryEntry[];
}

// ============================================
// Quote Summary (for lists)
// ============================================

/**
 * Lightweight quote representation for lists.
 */
export interface QuoteSummary {
  id: string;
  quoteNumber: string;
  companyId: string;
  companyName: string;
  status: QuoteStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  itemCount: number;
  total: number;
  currency: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  hasUnreadMessages: boolean;
}

// ============================================
// Quote Create/Update DTOs
// ============================================

/**
 * Item input for creating/updating a quote.
 */
export interface QuoteItemInput {
  productId: string;
  quantity: number;
  requestedPrice?: number;
  targetDeliveryDate?: string;
  notes?: string;
  specifications?: Record<string, string>;
}

/**
 * Data required to create a new quote.
 */
export interface CreateQuoteInput {
  items: QuoteItemInput[];
  shippingAddressId?: string;
  requestedDeliveryDate?: string;
  shippingMethod?: string;
  paymentTerms?: PaymentTermType;
  notesForSeller?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  validityDays?: number;
}

/**
 * Data to update a draft quote.
 */
export interface UpdateQuoteInput {
  items?: QuoteItemInput[];
  shippingAddressId?: string;
  requestedDeliveryDate?: string;
  shippingMethod?: string;
  paymentTerms?: PaymentTermType;
  notesForSeller?: string;
  internalNotes?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Seller response to a quote.
 */
export interface QuoteResponseInput {
  items: {
    quoteItemId: string;
    quotedPrice: number;
    confirmedDeliveryDate?: string;
    notes?: string;
  }[];
  shipping: number;
  terms?: Partial<QuoteTerms>;
  sellerNotes?: string;
  validityDays?: number;
}

// ============================================
// Quote Filters
// ============================================

/**
 * Filters for listing quotes.
 */
export interface QuoteFilters {
  status?: QuoteStatus | QuoteStatus[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  companyId?: string;
  employeeId?: string;
  salesRepId?: string;
  minTotal?: number;
  maxTotal?: number;
  createdAfter?: string;
  createdBefore?: string;
  validUntilAfter?: string;
  validUntilBefore?: string;
  search?: string;
  hasUnreadMessages?: boolean;
}
