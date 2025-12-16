/**
 * Order Service Interface
 * Defines the contract for order-related operations.
 */

import type {
  Order,
  OrderStatus,
  OrderItem,
  ShippingAddress,
  BillingAddress,
  PaymentMethod,
} from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";
import type { Cart } from "./cart";

/**
 * Options for listing orders
 */
export interface ListOrdersOptions {
  /** Page number */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Filter by status */
  status?: OrderStatus | OrderStatus[];
  /** Filter by customer ID */
  customerId?: string;
  /** Filter by company ID (B2B) */
  companyId?: string;
  /** Filter orders after this date */
  createdAfter?: string;
  /** Filter orders before this date */
  createdBefore?: string;
  /** Sort field */
  sortBy?: "createdAt" | "updatedAt" | "total" | "orderNumber";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Search by order number or product name */
  search?: string;
}

/**
 * Input for creating an order from cart
 */
export interface CreateOrderInput {
  /** Cart ID to convert */
  cartId: string;
  /** Shipping address (required if not on cart) */
  shippingAddress?: ShippingAddress;
  /** Billing address (defaults to shipping) */
  billingAddress?: BillingAddress;
  /** Payment method */
  paymentMethod?: PaymentMethod;
  /** Order notes */
  notes?: string;
  /** PO number (B2B) */
  purchaseOrderNumber?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Input for creating a direct order (without cart)
 */
export interface CreateDirectOrderInput {
  /** Order items */
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice?: number;
  }>;
  /** Customer ID */
  customerId?: string;
  /** Company ID (B2B) */
  companyId?: string;
  /** Shipping address */
  shippingAddress: ShippingAddress;
  /** Billing address */
  billingAddress?: BillingAddress;
  /** Payment method */
  paymentMethod?: PaymentMethod;
  /** Shipping option ID */
  shippingOptionId?: string;
  /** Discount codes */
  discountCodes?: string[];
  /** Notes */
  notes?: string;
  /** PO number */
  purchaseOrderNumber?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Order with additional computed fields
 */
export interface OrderWithDetails extends Order {
  /** Customer name */
  customerName?: string;
  /** Customer email */
  customerEmail?: string;
  /** Company name (B2B) */
  companyName?: string;
  /** Tracking URL */
  trackingUrl?: string;
  /** Invoice URL */
  invoiceUrl?: string;
  /** Can be cancelled */
  canCancel: boolean;
  /** Can be modified */
  canModify: boolean;
  /** Time since creation */
  age?: string;
}

/**
 * Order fulfillment information
 */
export interface OrderFulfillment {
  id: string;
  orderId: string;
  status: "pending" | "packed" | "shipped" | "delivered" | "failed";
  items: Array<{
    orderItemId: string;
    quantity: number;
  }>;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
}

/**
 * Order refund information
 */
export interface OrderRefund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: "pending" | "processing" | "completed" | "failed";
  items?: Array<{
    orderItemId: string;
    quantity: number;
    amount: number;
  }>;
  createdAt: string;
  processedAt?: string;
}

/**
 * Interface for order-related operations.
 * All adapters must implement this interface.
 */
export interface IOrderService {
  /**
   * List orders with optional filtering.
   *
   * @param options - Listing options
   * @returns Paginated list of orders
   *
   * @example
   * ```typescript
   * const orders = await api.orders.list({
   *   status: "shipped",
   *   pageSize: 20
   * });
   * ```
   */
  list(options?: ListOrdersOptions): Promise<PaginatedResponse<Order>>;

  /**
   * Get a single order by ID.
   *
   * @param id - Order ID
   * @returns Order details
   */
  get(id: string): Promise<OrderWithDetails>;

  /**
   * Get order by order number.
   *
   * @param orderNumber - Human-readable order number
   * @returns Order details
   */
  getByNumber(orderNumber: string): Promise<OrderWithDetails>;

  /**
   * Create an order from a cart.
   *
   * @param input - Order creation input
   * @returns Created order
   *
   * @example
   * ```typescript
   * const order = await api.orders.create({
   *   cartId: "cart_123",
   *   notes: "Please leave at door"
   * });
   * ```
   */
  create(input: CreateOrderInput): Promise<Order>;

  /**
   * Create an order directly (without cart).
   *
   * @param input - Direct order input
   * @returns Created order
   */
  createDirect(input: CreateDirectOrderInput): Promise<Order>;

  /**
   * Cancel an order.
   *
   * @param orderId - Order ID
   * @param reason - Cancellation reason
   * @returns Updated order
   */
  cancel(orderId: string, reason?: string): Promise<Order>;

  /**
   * Update order notes.
   *
   * @param orderId - Order ID
   * @param notes - New notes
   * @returns Updated order
   */
  updateNotes(orderId: string, notes: string): Promise<Order>;

  /**
   * Get fulfillments for an order.
   *
   * @param orderId - Order ID
   * @returns Array of fulfillments
   */
  getFulfillments(orderId: string): Promise<OrderFulfillment[]>;

  /**
   * Get refunds for an order.
   *
   * @param orderId - Order ID
   * @returns Array of refunds
   */
  getRefunds(orderId: string): Promise<OrderRefund[]>;

  /**
   * Request a refund.
   *
   * @param orderId - Order ID
   * @param items - Items to refund
   * @param reason - Refund reason
   * @returns Created refund request
   */
  requestRefund(
    orderId: string,
    items: Array<{ orderItemId: string; quantity: number }>,
    reason: string
  ): Promise<OrderRefund>;

  /**
   * Get orders for a customer.
   *
   * @param customerId - Customer ID
   * @param options - Listing options
   * @returns Paginated orders
   */
  getCustomerOrders(
    customerId: string,
    options?: Omit<ListOrdersOptions, "customerId">
  ): Promise<PaginatedResponse<Order>>;

  /**
   * Get orders for a company (B2B).
   *
   * @param companyId - Company ID
   * @param options - Listing options
   * @returns Paginated orders
   */
  getCompanyOrders(
    companyId: string,
    options?: Omit<ListOrdersOptions, "companyId">
  ): Promise<PaginatedResponse<Order>>;

  /**
   * Reorder (create new order from existing order).
   *
   * @param orderId - Original order ID
   * @returns New cart with items from order
   */
  reorder(orderId: string): Promise<Cart>;

  /**
   * Get order invoice PDF URL.
   *
   * @param orderId - Order ID
   * @returns Invoice download URL
   */
  getInvoiceUrl(orderId: string): Promise<string>;

  /**
   * Track order shipment.
   *
   * @param orderId - Order ID
   * @returns Tracking information
   */
  track(orderId: string): Promise<{
    status: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    events?: Array<{
      status: string;
      description: string;
      location?: string;
      timestamp: string;
    }>;
  }>;
}
