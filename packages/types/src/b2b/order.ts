/**
 * B2B Order Types
 * Defines order entities, items, shipping, payment, and workflow for B2B order management.
 */

import type { PaymentTermType } from './company';

// ============================================
// Order Status
// ============================================

/**
 * Status of an order in the workflow.
 */
export type OrderStatus =
  | 'pending_approval'  // Awaiting internal approval
  | 'pending_payment'   // Approved, awaiting payment
  | 'processing'        // Payment confirmed, being prepared
  | 'shipped'           // Order has been shipped
  | 'delivered'         // Order has been delivered
  | 'cancelled'         // Order was cancelled
  | 'returned';         // Order was returned

// ============================================
// Order Item
// ============================================

/**
 * A single item in an order.
 */
export interface OrderItem {
  /** Unique identifier */
  id: string;
  /** Product ID */
  productId: string;
  /** Product SKU/reference */
  productSku: string;
  /** Product name at time of order */
  productName: string;
  /** Product image URL */
  productImage?: string;
  /** Ordered quantity */
  quantity: number;
  /** Unit of measure */
  unitOfMeasure: string;
  /** Original unit price (list price) */
  listPrice: number;
  /** Final unit price (after discounts) */
  unitPrice: number;
  /** Discount percentage applied */
  discountPercent?: number;
  /** Discount amount per unit */
  discountAmount?: number;
  /** Line total (quantity * unitPrice) */
  lineTotal: number;
  /** Tax amount for this line */
  lineTax: number;
  /** Weight per unit (for shipping calculation) */
  unitWeight?: number;
  /** Total weight for this line */
  totalWeight?: number;
  /** Notes specific to this item */
  notes?: string;
  /** Custom specifications */
  specifications?: Record<string, string>;
  /** Fulfillment status for this item */
  fulfillmentStatus?: 'pending' | 'partial' | 'fulfilled' | 'backordered';
  /** Quantity fulfilled */
  quantityFulfilled?: number;
  /** Quantity backordered */
  quantityBackordered?: number;
}

// ============================================
// Order Totals
// ============================================

/**
 * Order financial totals.
 */
export interface OrderTotals {
  /** Sum of line totals before discounts */
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
  /** Total weight */
  totalWeight?: number;
  /** Weight unit (kg, lb) */
  weightUnit?: string;
}

// ============================================
// Order Shipping
// ============================================

/**
 * Shipping address for an order.
 */
export interface OrderShippingAddress {
  /** Address ID reference */
  addressId?: string;
  /** Recipient name */
  recipientName: string;
  /** Company name */
  companyName?: string;
  /** Street address line 1 */
  street1: string;
  /** Street address line 2 */
  street2?: string;
  /** City */
  city: string;
  /** State/Province/Region */
  state?: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Country name */
  country: string;
  /** Phone number */
  phone?: string;
  /** Delivery instructions */
  deliveryInstructions?: string;
}

/**
 * Shipping information for an order.
 */
export interface OrderShipping {
  /** Shipping address */
  address: OrderShippingAddress;
  /** Billing address (if different) */
  billingAddress?: OrderShippingAddress;
  /** Shipping method ID */
  methodId: string;
  /** Shipping method name */
  methodName: string;
  /** Shipping carrier */
  carrier?: string;
  /** Tracking number */
  trackingNumber?: string;
  /** Tracking URL */
  trackingUrl?: string;
  /** Estimated delivery date */
  estimatedDelivery?: string;
  /** Actual delivery date */
  actualDelivery?: string;
  /** Shipped date */
  shippedAt?: string;
  /** Shipping cost */
  cost: number;
  /** Whether shipping is free */
  isFreeShipping: boolean;
  /** Shipping notes */
  notes?: string;
  /** Signature required on delivery */
  signatureRequired?: boolean;
  /** Insurance amount */
  insuranceAmount?: number;
}

// ============================================
// Order Payment
// ============================================

/**
 * Payment method types.
 */
export type PaymentMethodType =
  | 'credit_card'
  | 'bank_transfer'
  | 'check'
  | 'wire'
  | 'net_terms'
  | 'purchase_order'
  | 'paypal'
  | 'other';

/**
 * Payment status.
 */
export type PaymentStatus =
  | 'pending'       // Payment not yet received
  | 'authorized'    // Payment authorized but not captured
  | 'paid'          // Payment received in full
  | 'partial'       // Partial payment received
  | 'refunded'      // Full refund issued
  | 'partial_refund'// Partial refund issued
  | 'failed'        // Payment failed
  | 'cancelled';    // Payment cancelled

/**
 * Payment information for an order.
 */
export interface OrderPayment {
  /** Payment method type */
  method: PaymentMethodType;
  /** Payment method display name */
  methodName: string;
  /** Payment status */
  status: PaymentStatus;
  /** Payment reference/transaction ID */
  reference?: string;
  /** Purchase order number (for PO payments) */
  purchaseOrderNumber?: string;
  /** Payment terms type */
  paymentTerms: PaymentTermType;
  /** Payment terms days */
  paymentTermsDays?: number;
  /** Amount authorized */
  amountAuthorized?: number;
  /** Amount paid */
  amountPaid: number;
  /** Amount refunded */
  amountRefunded?: number;
  /** Amount due */
  amountDue: number;
  /** Payment due date */
  dueDate?: string;
  /** Date payment was received */
  paidAt?: string;
  /** Last 4 digits of card (for card payments) */
  cardLast4?: string;
  /** Card brand (for card payments) */
  cardBrand?: string;
  /** Bank name (for bank transfers) */
  bankName?: string;
  /** Payment notes */
  notes?: string;
}

// ============================================
// Order History Entry
// ============================================

/**
 * Type of order history event.
 */
export type OrderHistoryEventType =
  | 'created'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'payment_received'
  | 'payment_failed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded'
  | 'item_updated'
  | 'note_added'
  | 'tracking_updated';

/**
 * A history entry tracking order changes.
 */
export interface OrderHistoryEntry {
  /** Unique identifier */
  id: string;
  /** Order ID */
  orderId: string;
  /** Event type */
  eventType: OrderHistoryEventType;
  /** Human-readable description */
  description: string;
  /** Actor who made the change */
  actorId: string;
  /** Actor type */
  actorType: 'buyer' | 'seller' | 'system';
  /** Actor name */
  actorName: string;
  /** Previous values (for changes) */
  previousValues?: Record<string, unknown>;
  /** New values (for changes) */
  newValues?: Record<string, unknown>;
  /** ISO timestamp */
  createdAt: string;
}

// ============================================
// Order Attachment
// ============================================

/**
 * An attachment on an order (invoice, packing slip, etc.).
 */
export interface OrderAttachment {
  /** Unique identifier */
  id: string;
  /** File name */
  fileName: string;
  /** File type/MIME type */
  fileType: string;
  /** File size in bytes */
  fileSize: number;
  /** Download URL */
  url: string;
  /** Attachment type */
  attachmentType: 'invoice' | 'packing_slip' | 'receipt' | 'customs' | 'other';
  /** Uploaded by user ID */
  uploadedById: string;
  /** ISO timestamp of upload */
  uploadedAt: string;
}

// ============================================
// Order
// ============================================

/**
 * B2B Order entity.
 * Represents a complete purchase order with all associated data.
 */
export interface Order {
  /** Unique identifier */
  id: string;
  /** Human-readable order number */
  orderNumber: string;

  // Company and employee
  /** Company placing the order */
  companyId: string;
  /** Company name (denormalized) */
  companyName: string;
  /** Employee who placed the order */
  employeeId: string;
  /** Employee name (denormalized) */
  employeeName: string;
  /** Contact email for this order */
  contactEmail: string;
  /** Contact phone for this order */
  contactPhone?: string;

  // Status
  /** Current order status */
  status: OrderStatus;
  /** Display label for status (localized) */
  statusLabel?: string;
  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Items and totals
  /** Order items */
  items: OrderItem[];
  /** Order totals */
  totals: OrderTotals;

  // Shipping
  /** Shipping information */
  shipping: OrderShipping;

  // Payment
  /** Payment information */
  payment: OrderPayment;

  // Approval
  /** Whether approval was required */
  approvalRequired: boolean;
  /** Approval request ID (if approval was required) */
  approvalRequestId?: string;
  /** Approver ID (if approved) */
  approvedById?: string;
  /** Approver name (denormalized) */
  approvedByName?: string;
  /** Approval timestamp */
  approvedAt?: string;

  // Source
  /** Source quote ID (if converted from quote) */
  sourceQuoteId?: string;
  /** Source quote number */
  sourceQuoteNumber?: string;

  // Dates
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** ISO timestamp when submitted for approval */
  submittedAt?: string;
  /** ISO timestamp when shipped */
  shippedAt?: string;
  /** ISO timestamp when delivered */
  deliveredAt?: string;
  /** ISO timestamp when cancelled */
  cancelledAt?: string;

  // Notes
  /** Internal notes (visible only to buyer) */
  internalNotes?: string;
  /** Notes for seller/fulfillment */
  notesForSeller?: string;
  /** Seller notes */
  sellerNotes?: string;
  /** Cancellation reason (if cancelled) */
  cancelReason?: string;

  // Related entities
  /** Sales representative ID */
  salesRepId?: string;
  /** Sales representative name */
  salesRepName?: string;
  /** Attachments */
  attachments: OrderAttachment[];

  // History
  /** Order history */
  history: OrderHistoryEntry[];

  // Reorder
  /** Whether this order can be reordered */
  canReorder: boolean;
  /** Parent order ID (if this is a reorder) */
  reorderedFromId?: string;
}

// ============================================
// Order Summary (for lists)
// ============================================

/**
 * Lightweight order representation for lists.
 * Matches the mock data pattern used in the UI.
 */
export interface OrderSummary {
  /** Unique identifier */
  id: string;
  /** Human-readable order number */
  orderNumber: string;
  /** Order date (formatted for display) */
  date?: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** Current status */
  status: OrderStatus;
  /** Status display label (localized) */
  statusLabel?: string;
  /** Number of items in the order */
  itemCount: number;
  /** Order total */
  total: number;
  /** Currency code */
  currency: string;
  /** Shipping address (formatted for display) */
  shippingAddress: string;
  /** Tracking number (if shipped) */
  trackingNumber?: string;
  /** Name of employee who ordered */
  orderedBy: string;
  /** Estimated delivery date (if shipped) */
  estimatedDelivery?: string;
  /** ISO timestamp when shipped */
  shippedAt?: string;
  /** Actual delivery date (if delivered) */
  deliveredAt?: string;
  /** ISO timestamp when cancelled */
  cancelledAt?: string;
  /** Whether approval is required/pending */
  approvalRequired?: boolean;
  /** Cancellation reason (if cancelled) */
  cancelReason?: string;
  /** Whether this order can be reordered */
  canReorder?: boolean;
}

// ============================================
// Order Create/Update DTOs
// ============================================

/**
 * Item input for creating an order.
 */
export interface OrderItemInput {
  /** Product ID */
  productId: string;
  /** Quantity to order */
  quantity: number;
  /** Requested unit price (for negotiated pricing) */
  requestedPrice?: number;
  /** Notes for this item */
  notes?: string;
  /** Custom specifications */
  specifications?: Record<string, string>;
}

/**
 * Shipping address input.
 */
export interface ShippingAddressInput {
  /** Existing address ID (if using saved address) */
  addressId?: string;
  /** Recipient name */
  recipientName?: string;
  /** Company name */
  companyName?: string;
  /** Street address line 1 */
  street1?: string;
  /** Street address line 2 */
  street2?: string;
  /** City */
  city?: string;
  /** State/Province/Region */
  state?: string;
  /** Postal/ZIP code */
  postalCode?: string;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode?: string;
  /** Phone number */
  phone?: string;
  /** Delivery instructions */
  deliveryInstructions?: string;
}

/**
 * Data required to create a new order.
 */
export interface CreateOrderInput {
  /** Order items */
  items: OrderItemInput[];
  /** Shipping address */
  shippingAddress: ShippingAddressInput;
  /** Billing address (if different from shipping) */
  billingAddress?: ShippingAddressInput;
  /** Shipping method ID */
  shippingMethodId: string;
  /** Payment method type */
  paymentMethod: PaymentMethodType;
  /** Payment terms (for net terms payment) */
  paymentTerms?: PaymentTermType;
  /** Purchase order number */
  purchaseOrderNumber?: string;
  /** Notes for seller */
  notesForSeller?: string;
  /** Internal notes */
  internalNotes?: string;
  /** Priority level */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** Source quote ID (if converting from quote) */
  sourceQuoteId?: string;
  /** Requested delivery date */
  requestedDeliveryDate?: string;
}

/**
 * Data to update an existing order.
 * Only certain fields can be updated based on order status.
 */
export interface UpdateOrderInput {
  /** Shipping address (only if not yet shipped) */
  shippingAddress?: ShippingAddressInput;
  /** Shipping method (only if not yet shipped) */
  shippingMethodId?: string;
  /** Notes for seller */
  notesForSeller?: string;
  /** Internal notes */
  internalNotes?: string;
  /** Priority level */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Input for cancelling an order.
 */
export interface CancelOrderInput {
  /** Reason for cancellation */
  reason: string;
  /** Additional notes */
  notes?: string;
}

/**
 * Input for returning an order or items.
 */
export interface ReturnOrderInput {
  /** Items to return (if partial return) */
  items?: {
    orderItemId: string;
    quantity: number;
    reason: string;
  }[];
  /** Return all items */
  returnAll?: boolean;
  /** Overall return reason */
  reason: string;
  /** Additional notes */
  notes?: string;
}

// ============================================
// Order Filters
// ============================================

/**
 * Filters for listing orders.
 */
export interface OrderFilters {
  /** Filter by status */
  status?: OrderStatus | OrderStatus[];
  /** Filter by priority */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** Filter by company ID */
  companyId?: string;
  /** Filter by employee ID */
  employeeId?: string;
  /** Filter by sales rep ID */
  salesRepId?: string;
  /** Minimum order total */
  minTotal?: number;
  /** Maximum order total */
  maxTotal?: number;
  /** Orders created after this date */
  createdAfter?: string;
  /** Orders created before this date */
  createdBefore?: string;
  /** Orders delivered after this date */
  deliveredAfter?: string;
  /** Orders delivered before this date */
  deliveredBefore?: string;
  /** Search term (order number, tracking, customer name) */
  search?: string;
  /** Filter by approval required */
  approvalRequired?: boolean;
  /** Filter by source quote ID */
  sourceQuoteId?: string;
  /** Filter by tracking number */
  trackingNumber?: string;
  /** Filter by purchase order number */
  purchaseOrderNumber?: string;
}

// ============================================
// Order Sort Options
// ============================================

/**
 * Sort field options for order lists.
 */
export type OrderSortField =
  | 'orderNumber'
  | 'createdAt'
  | 'updatedAt'
  | 'total'
  | 'status'
  | 'deliveredAt';

/**
 * Sort configuration for order lists.
 */
export interface OrderSortOptions {
  /** Field to sort by */
  field: OrderSortField;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

// ============================================
// Order Statistics
// ============================================

/**
 * Statistics for order dashboard.
 */
export interface OrderStatistics {
  /** Total number of orders */
  total: number;
  /** Orders pending approval */
  pendingApproval: number;
  /** Orders pending payment */
  pendingPayment: number;
  /** Orders being processed */
  processing: number;
  /** Orders shipped */
  shipped: number;
  /** Orders delivered */
  delivered: number;
  /** Orders cancelled */
  cancelled: number;
  /** Orders returned */
  returned: number;
  /** Total revenue */
  totalRevenue: number;
  /** Average order value */
  averageOrderValue: number;
  /** Currency for monetary values */
  currency: string;
}
