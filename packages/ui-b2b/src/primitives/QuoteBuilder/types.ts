/**
 * QuoteBuilder Types
 *
 * Type definitions for quote construction from cart items
 * supporting B2B pricing, bulk discounts, and custom terms.
 */

/**
 * Quote status
 */
export type QuoteStatus =
  | "draft"
  | "pending_review"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";

/**
 * Discount type
 */
export type DiscountType = "percentage" | "fixed" | "per_unit";

/**
 * Tax type
 */
export type TaxType = "included" | "excluded" | "exempt";

/**
 * Quote line item
 */
export interface QuoteLineItem {
  /** Unique line item ID */
  id: string;
  /** Product/SKU ID */
  productId: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** SKU or reference */
  sku?: string;
  /** Quantity */
  quantity: number;
  /** Unit of measure */
  unit?: string;
  /** Unit price (before discounts) */
  unitPrice: number;
  /** Line discount */
  discount?: {
    type: DiscountType;
    value: number;
    reason?: string;
  };
  /** Effective unit price (after discount) */
  effectiveUnitPrice: number;
  /** Line total */
  lineTotal: number;
  /** Tax rate for this item */
  taxRate?: number;
  /** Tax amount */
  taxAmount?: number;
  /** Whether item is customizable */
  customizable?: boolean;
  /** Custom options selected */
  customOptions?: Record<string, unknown>;
  /** Lead time in days */
  leadTime?: number;
  /** Notes for this line item */
  notes?: string;
  /** Original cart item ID (if from cart) */
  cartItemId?: string;
}

/**
 * Quote customer information
 */
export interface QuoteCustomer {
  /** Customer/Company ID */
  id: string;
  /** Company name */
  companyName: string;
  /** Contact name */
  contactName: string;
  /** Contact email */
  email: string;
  /** Contact phone */
  phone?: string;
  /** Billing address */
  billingAddress?: Address;
  /** Shipping address */
  shippingAddress?: Address;
  /** Tax ID / VAT number */
  taxId?: string;
  /** Payment terms (e.g., 'NET30') */
  paymentTerms?: string;
  /** Credit limit */
  creditLimit?: number;
}

/**
 * Address structure
 */
export interface Address {
  /** Street address line 1 */
  line1: string;
  /** Street address line 2 */
  line2?: string;
  /** City */
  city: string;
  /** State/Province */
  state?: string;
  /** Postal code */
  postalCode: string;
  /** Country code */
  country: string;
}

/**
 * Quote pricing summary
 */
export interface QuotePricing {
  /** Subtotal (before discounts and tax) */
  subtotal: number;
  /** Total discount amount */
  discountTotal: number;
  /** Discounted subtotal */
  discountedSubtotal: number;
  /** Shipping cost */
  shipping: number;
  /** Tax type */
  taxType: TaxType;
  /** Tax rate (percentage) */
  taxRate: number;
  /** Tax amount */
  taxAmount: number;
  /** Grand total */
  total: number;
  /** Currency code */
  currency: string;
}

/**
 * Quote discount (applied to entire quote)
 */
export interface QuoteDiscount {
  /** Discount ID */
  id: string;
  /** Discount type */
  type: DiscountType;
  /** Discount value */
  value: number;
  /** Discount code (if applicable) */
  code?: string;
  /** Reason for discount */
  reason?: string;
  /** Minimum order value for discount */
  minOrderValue?: number;
  /** Maximum discount amount */
  maxDiscount?: number;
}

/**
 * Quote terms and conditions
 */
export interface QuoteTerms {
  /** Payment terms */
  paymentTerms: string;
  /** Payment due date */
  paymentDueDate?: Date;
  /** Delivery terms (Incoterms) */
  deliveryTerms?: string;
  /** Estimated delivery date */
  deliveryDate?: Date;
  /** Validity period in days */
  validityDays: number;
  /** Quote expiration date */
  expirationDate: Date;
  /** Custom terms and conditions */
  customTerms?: string;
  /** Notes to customer */
  notes?: string;
  /** Internal notes (not shown to customer) */
  internalNotes?: string;
}

/**
 * Complete quote structure
 */
export interface Quote {
  /** Unique quote ID */
  id: string;
  /** Quote number (display) */
  quoteNumber: string;
  /** Quote status */
  status: QuoteStatus;
  /** Customer information */
  customer: QuoteCustomer;
  /** Line items */
  items: QuoteLineItem[];
  /** Quote-level discounts */
  discounts: QuoteDiscount[];
  /** Pricing summary */
  pricing: QuotePricing;
  /** Terms and conditions */
  terms: QuoteTerms;
  /** Created by */
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  /** Creation date */
  createdAt: Date;
  /** Last updated */
  updatedAt: Date;
  /** Sent date (if sent) */
  sentAt?: Date;
  /** Viewed date (if viewed) */
  viewedAt?: Date;
  /** Response date (accepted/rejected) */
  respondedAt?: Date;
  /** Version number */
  version: number;
  /** Reference to original quote (if revision) */
  originalQuoteId?: string;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Cart item for conversion to quote
 */
export interface CartItem {
  /** Cart item ID */
  id: string;
  /** Product ID */
  productId: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** SKU */
  sku?: string;
  /** Quantity */
  quantity: number;
  /** Unit price */
  unitPrice: number;
  /** Custom options */
  customOptions?: Record<string, unknown>;
}

/**
 * Quote builder state
 */
export interface QuoteBuilderState {
  /** Current quote being built */
  quote: Quote;
  /** Whether quote has unsaved changes */
  isDirty: boolean;
  /** Validation errors */
  errors: QuoteValidationError[];
  /** Whether quote is valid */
  isValid: boolean;
  /** Selected line items (for bulk operations) */
  selectedItems: Set<string>;
}

/**
 * Quote validation error
 */
export interface QuoteValidationError {
  /** Field or path that has error */
  field: string;
  /** Error message */
  message: string;
  /** Error type */
  type: "error" | "warning";
}

/**
 * Options for useQuoteBuilder hook
 */
export interface UseQuoteBuilderOptions {
  /** Initial quote (for editing) */
  initialQuote?: Partial<Quote>;
  /** Customer information */
  customer: QuoteCustomer;
  /** Default currency */
  currency?: string;
  /** Default tax rate */
  taxRate?: number;
  /** Default tax type */
  taxType?: TaxType;
  /** Default validity period in days */
  validityDays?: number;
  /** Default payment terms */
  paymentTerms?: string;
  /** Auto-calculate pricing */
  autoCalculate?: boolean;
  /** Quote number generator */
  generateQuoteNumber?: () => string;
  /** Callback when quote changes */
  onChange?: (quote: Quote) => void;
  /** Callback when quote is saved */
  onSave?: (quote: Quote) => void;
  /** Callback when quote is sent */
  onSend?: (quote: Quote) => void;
}

/**
 * Return type for useQuoteBuilder hook
 */
export interface UseQuoteBuilderReturn {
  /** Current state */
  state: QuoteBuilderState;

  // Line item actions
  /** Add a line item */
  addItem: (item: Omit<QuoteLineItem, "id" | "effectiveUnitPrice" | "lineTotal">) => void;
  /** Update a line item */
  updateItem: (itemId: string, updates: Partial<QuoteLineItem>) => void;
  /** Remove a line item */
  removeItem: (itemId: string) => void;
  /** Duplicate a line item */
  duplicateItem: (itemId: string) => void;
  /** Update item quantity */
  setItemQuantity: (itemId: string, quantity: number) => void;
  /** Apply discount to item */
  applyItemDiscount: (
    itemId: string,
    discount: QuoteLineItem["discount"]
  ) => void;
  /** Clear item discount */
  clearItemDiscount: (itemId: string) => void;
  /** Reorder items */
  reorderItems: (fromIndex: number, toIndex: number) => void;

  // Cart conversion
  /** Import items from cart */
  importFromCart: (cartItems: CartItem[]) => void;
  /** Replace all items from cart */
  replaceFromCart: (cartItems: CartItem[]) => void;

  // Quote-level discount actions
  /** Add quote discount */
  addDiscount: (discount: Omit<QuoteDiscount, "id">) => void;
  /** Remove quote discount */
  removeDiscount: (discountId: string) => void;
  /** Clear all quote discounts */
  clearDiscounts: () => void;

  // Pricing actions
  /** Update shipping cost */
  setShipping: (amount: number) => void;
  /** Update tax rate */
  setTaxRate: (rate: number) => void;
  /** Update tax type */
  setTaxType: (type: TaxType) => void;
  /** Recalculate all pricing */
  recalculate: () => void;

  // Terms actions
  /** Update terms */
  updateTerms: (terms: Partial<QuoteTerms>) => void;
  /** Set expiration date */
  setExpirationDate: (date: Date) => void;
  /** Set validity days */
  setValidityDays: (days: number) => void;

  // Customer actions
  /** Update customer information */
  updateCustomer: (customer: Partial<QuoteCustomer>) => void;

  // Selection actions
  /** Select item */
  selectItem: (itemId: string) => void;
  /** Deselect item */
  deselectItem: (itemId: string) => void;
  /** Toggle item selection */
  toggleItemSelection: (itemId: string) => void;
  /** Select all items */
  selectAllItems: () => void;
  /** Deselect all items */
  deselectAllItems: () => void;
  /** Remove selected items */
  removeSelectedItems: () => void;
  /** Apply discount to selected items */
  applyDiscountToSelected: (discount: QuoteLineItem["discount"]) => void;

  // Quote actions
  /** Save quote */
  save: () => Quote;
  /** Send quote to customer */
  send: () => void;
  /** Create revision */
  createRevision: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Mark as dirty */
  markDirty: () => void;
  /** Mark as clean */
  markClean: () => void;

  // Validation
  /** Validate quote */
  validate: () => QuoteValidationError[];
  /** Get item by ID */
  getItem: (itemId: string) => QuoteLineItem | undefined;
  /** Check if item exists */
  hasItem: (itemId: string) => boolean;
}
