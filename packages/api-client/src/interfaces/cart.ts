/**
 * Cart Service Interface
 * Defines the contract for cart-related operations.
 */

import type { Product } from "@maison/types";

/**
 * Cart line item
 */
export interface CartLineItem {
  /** Unique line item ID */
  id: string;
  /** Product ID */
  productId: string;
  /** Product variant ID (if applicable) */
  variantId?: string;
  /** Product SKU */
  sku: string;
  /** Product name */
  name: string;
  /** Product image URL */
  imageUrl?: string;
  /** Unit price */
  unitPrice: number;
  /** Quantity */
  quantity: number;
  /** Line total (unitPrice * quantity) */
  lineTotal: number;
  /** Original price (before discounts) */
  originalPrice?: number;
  /** Discount amount per unit */
  discountAmount?: number;
  /** Whether item is available */
  isAvailable: boolean;
  /** Available stock quantity */
  availableStock?: number;
  /** Custom attributes */
  attributes?: Record<string, string>;
  /** Product reference for navigation */
  productSlug?: string;
}

/**
 * Cart discount
 */
export interface CartDiscount {
  /** Discount ID */
  id: string;
  /** Discount code (if from coupon) */
  code?: string;
  /** Discount type */
  type: "percentage" | "fixed" | "free_shipping";
  /** Discount value */
  value: number;
  /** Calculated discount amount */
  amount: number;
  /** Description */
  description?: string;
}

/**
 * Shipping option for cart
 */
export interface CartShippingOption {
  /** Option ID */
  id: string;
  /** Carrier name */
  carrier: string;
  /** Service name */
  name: string;
  /** Shipping cost */
  price: number;
  /** Estimated delivery days */
  estimatedDays?: number;
  /** Estimated delivery date */
  estimatedDeliveryDate?: string;
}

/**
 * Cart totals breakdown
 */
export interface CartTotals {
  /** Subtotal (sum of line totals) */
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
  /** Number of items */
  itemCount: number;
  /** Number of unique items */
  uniqueItemCount: number;
}

/**
 * Full cart object
 */
export interface Cart {
  /** Cart ID */
  id: string;
  /** Customer ID (if logged in) */
  customerId?: string;
  /** Company ID (for B2B) */
  companyId?: string;
  /** Region/market ID */
  regionId?: string;
  /** Line items */
  items: CartLineItem[];
  /** Applied discounts */
  discounts: CartDiscount[];
  /** Selected shipping option */
  shippingOption?: CartShippingOption;
  /** Available shipping options */
  availableShippingOptions?: CartShippingOption[];
  /** Cart totals */
  totals: CartTotals;
  /** Shipping address ID */
  shippingAddressId?: string;
  /** Billing address ID */
  billingAddressId?: string;
  /** Cart metadata */
  metadata?: Record<string, unknown>;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Cart expiry timestamp */
  expiresAt?: string;
}

/**
 * Input for adding item to cart
 */
export interface AddToCartInput {
  /** Product ID */
  productId: string;
  /** Variant ID */
  variantId?: string;
  /** Quantity to add */
  quantity: number;
  /** Custom attributes */
  attributes?: Record<string, string>;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating cart item
 */
export interface UpdateCartItemInput {
  /** New quantity */
  quantity: number;
  /** Updated attributes */
  attributes?: Record<string, string>;
}

/**
 * Input for bulk adding items
 */
export interface BulkAddToCartInput {
  /** Items to add */
  items: AddToCartInput[];
  /** Whether to replace existing cart */
  replaceExisting?: boolean;
}

/**
 * Result of bulk add operation
 */
export interface BulkAddResult {
  /** Successfully added items */
  added: CartLineItem[];
  /** Failed items with reasons */
  failed: Array<{
    input: AddToCartInput;
    reason: string;
  }>;
  /** Updated cart */
  cart: Cart;
}

/**
 * Interface for cart-related operations.
 * All adapters must implement this interface.
 */
export interface ICartService {
  /**
   * Get or create a cart.
   *
   * @param cartId - Existing cart ID (optional)
   * @returns Cart object
   *
   * @example
   * ```typescript
   * // Get existing cart
   * const cart = await api.cart.get("cart_123");
   *
   * // Create new cart
   * const newCart = await api.cart.get();
   * ```
   */
  get(cartId?: string): Promise<Cart>;

  /**
   * Create a new cart.
   *
   * @param regionId - Region/market ID
   * @param customerId - Customer ID (optional)
   * @returns New cart object
   */
  create(regionId?: string, customerId?: string): Promise<Cart>;

  /**
   * Add an item to the cart.
   *
   * @param cartId - Cart ID
   * @param input - Item to add
   * @returns Updated cart
   *
   * @example
   * ```typescript
   * const cart = await api.cart.addItem("cart_123", {
   *   productId: "prod_456",
   *   quantity: 2
   * });
   * ```
   */
  addItem(cartId: string, input: AddToCartInput): Promise<Cart>;

  /**
   * Update a cart item.
   *
   * @param cartId - Cart ID
   * @param itemId - Line item ID
   * @param input - Update data
   * @returns Updated cart
   */
  updateItem(cartId: string, itemId: string, input: UpdateCartItemInput): Promise<Cart>;

  /**
   * Remove an item from the cart.
   *
   * @param cartId - Cart ID
   * @param itemId - Line item ID
   * @returns Updated cart
   */
  removeItem(cartId: string, itemId: string): Promise<Cart>;

  /**
   * Add multiple items to cart (bulk operation).
   *
   * @param cartId - Cart ID
   * @param input - Bulk add input
   * @returns Result with successes and failures
   *
   * @example
   * ```typescript
   * const result = await api.cart.addItemsBulk("cart_123", {
   *   items: [
   *     { productId: "prod_1", quantity: 5 },
   *     { productId: "prod_2", quantity: 10 },
   *   ]
   * });
   * ```
   */
  addItemsBulk(cartId: string, input: BulkAddToCartInput): Promise<BulkAddResult>;

  /**
   * Clear all items from cart.
   *
   * @param cartId - Cart ID
   * @returns Empty cart
   */
  clear(cartId: string): Promise<Cart>;

  /**
   * Apply a discount code.
   *
   * @param cartId - Cart ID
   * @param code - Discount code
   * @returns Updated cart
   */
  applyDiscount(cartId: string, code: string): Promise<Cart>;

  /**
   * Remove a discount.
   *
   * @param cartId - Cart ID
   * @param discountId - Discount ID
   * @returns Updated cart
   */
  removeDiscount(cartId: string, discountId: string): Promise<Cart>;

  /**
   * Set shipping option.
   *
   * @param cartId - Cart ID
   * @param optionId - Shipping option ID
   * @returns Updated cart
   */
  setShippingOption(cartId: string, optionId: string): Promise<Cart>;

  /**
   * Get available shipping options for cart.
   *
   * @param cartId - Cart ID
   * @returns Array of shipping options
   */
  getShippingOptions(cartId: string): Promise<CartShippingOption[]>;

  /**
   * Associate cart with customer.
   *
   * @param cartId - Cart ID
   * @param customerId - Customer ID
   * @returns Updated cart
   */
  setCustomer(cartId: string, customerId: string): Promise<Cart>;

  /**
   * Set addresses for cart.
   *
   * @param cartId - Cart ID
   * @param shippingAddressId - Shipping address ID
   * @param billingAddressId - Billing address ID (optional, defaults to shipping)
   * @returns Updated cart
   */
  setAddresses(
    cartId: string,
    shippingAddressId: string,
    billingAddressId?: string
  ): Promise<Cart>;

  /**
   * Update cart metadata.
   *
   * @param cartId - Cart ID
   * @param metadata - Metadata to merge
   * @returns Updated cart
   */
  updateMetadata(cartId: string, metadata: Record<string, unknown>): Promise<Cart>;

  /**
   * Delete a cart.
   *
   * @param cartId - Cart ID
   */
  delete(cartId: string): Promise<void>;

  /**
   * Merge guest cart into customer cart.
   *
   * @param guestCartId - Guest cart ID
   * @param customerCartId - Customer cart ID
   * @returns Merged cart
   */
  merge(guestCartId: string, customerCartId: string): Promise<Cart>;
}
