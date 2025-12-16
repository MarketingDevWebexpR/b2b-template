/**
 * Bulk Order Types
 *
 * Type definitions for bulk order operations in the B2B e-commerce platform.
 * Includes types for bulk order items, summaries, catalog entries, and validation.
 *
 * @packageDocumentation
 */

/**
 * Represents a single item in a bulk order.
 *
 * @example
 * ```ts
 * const item: BulkOrderItem = {
 *   sku: 'BRA-001',
 *   quantity: 5,
 *   product: productCatalogEntry,
 *   isValid: true,
 *   unitPrice: 450,
 *   lineTotal: 2250,
 * };
 * ```
 */
export interface BulkOrderItem {
  /** Stock Keeping Unit (product reference) */
  sku: string;
  /** Quantity requested */
  quantity: number;
  /** Reference to the product catalog entry (if found) */
  product?: ProductCatalogEntry;
  /** Whether the item is valid for ordering */
  isValid: boolean;
  /** Price per unit (in EUR) */
  unitPrice?: number;
  /** Total price for this line (unitPrice * quantity) */
  lineTotal?: number;
  /** Error messages if item has validation issues */
  errors?: string[];
}

/**
 * Summary of a bulk order with aggregated totals.
 *
 * @example
 * ```ts
 * const summary: BulkOrderSummary = {
 *   totalItems: 3,
 *   totalQuantity: 25,
 *   totalAmount: 3500,
 *   currency: 'EUR',
 *   errorCount: 1,
 *   availableCount: 2,
 * };
 * ```
 */
export interface BulkOrderSummary {
  /** Number of distinct items (SKUs) */
  totalItems: number;
  /** Sum of all quantities */
  totalQuantity: number;
  /** Total order amount before tax (in cents or minor currency unit) */
  totalAmount: number;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Number of items with errors */
  errorCount: number;
  /** Number of items that are fully available */
  availableCount: number;
}

/**
 * Product catalog entry for bulk order lookup.
 *
 * @example
 * ```ts
 * const product: ProductCatalogEntry = {
 *   productId: 'prod_001',
 *   sku: 'BRA-001',
 *   name: 'Bracelet Or 18K - Maille Figaro',
 *   description: 'Bracelet en or 18K avec maille figaro',
 *   unitPrice: 450,
 *   currency: 'EUR',
 *   minQuantity: 1,
 *   maxQuantity: 100,
 *   availableStock: 25,
 *   category: 'bracelets',
 *   brand: 'Maison',
 * };
 * ```
 */
export interface ProductCatalogEntry {
  /** Product unique identifier */
  productId: string;
  /** Stock Keeping Unit (product reference) */
  sku: string;
  /** Product name */
  name: string;
  /** Product description */
  description: string;
  /** Price per unit */
  unitPrice: number;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Minimum order quantity */
  minQuantity: number;
  /** Maximum order quantity */
  maxQuantity: number;
  /** Current available stock level */
  availableStock: number;
  /** Product category name */
  category: string;
  /** Product brand name */
  brand: string;
  /** Product image URL */
  imageUrl?: string;
}

/**
 * Result of bulk order validation.
 *
 * @example
 * ```ts
 * const result: BulkOrderValidationResult = {
 *   isValid: false,
 *   errors: [
 *     { row: 1, field: 'sku', code: 'PRODUCT_NOT_FOUND', message: 'SKU non trouve' }
 *   ],
 *   warnings: [],
 *   validItems: [],
 *   invalidCount: 1,
 *   totalAmount: 0,
 *   currency: 'EUR',
 * };
 * ```
 */
export interface BulkOrderValidationResult {
  /** Whether the entire bulk order is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: BulkOrderValidationError[];
  /** List of validation warnings (non-blocking) */
  warnings: BulkOrderValidationWarning[];
  /** List of valid items that passed validation */
  validItems: BulkOrderItem[];
  /** Number of invalid items */
  invalidCount: number;
  /** Total amount for valid items */
  totalAmount: number;
  /** Currency code for the total amount */
  currency: string;
}

/**
 * Validation error for a bulk order item.
 */
export interface BulkOrderValidationError {
  /** Row number in the bulk order (1-indexed) */
  row: number;
  /** Field that has the error */
  field: string;
  /** Error code for programmatic handling */
  code: BulkOrderErrorCode;
  /** Human-readable error message */
  message: string;
}

/**
 * Validation warning for a bulk order item.
 */
export interface BulkOrderValidationWarning {
  /** SKU that has the warning */
  sku: string;
  /** Warning code for programmatic handling */
  code: BulkOrderWarningCode;
  /** Human-readable warning message */
  message: string;
}

/**
 * Error codes for bulk order validation.
 */
export type BulkOrderErrorCode =
  | 'UNKNOWN_SKU'
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_QUANTITY'
  | 'PRODUCT_UNAVAILABLE'
  | 'EXCEEDS_ORDER_LIMIT'
  | 'BELOW_MIN_QUANTITY'
  | 'BELOW_MINIMUM';

/**
 * Warning codes for bulk order validation.
 */
export type BulkOrderWarningCode =
  | 'LOW_STOCK'
  | 'PRICE_CHANGED'
  | 'BACKORDER_AVAILABLE';

/**
 * Input for parsing CSV content into bulk order items.
 */
export interface BulkOrderCsvInput {
  /** Raw CSV content */
  content: string;
  /** Delimiter character (default: comma) */
  delimiter?: ',' | ';' | '\t';
  /** Whether the first row is a header */
  hasHeader?: boolean;
}

/**
 * Result of parsing CSV content.
 */
export interface BulkOrderCsvParseResult {
  /** Successfully parsed items */
  items: Array<{ sku: string; quantity: number }>;
  /** Parsing errors */
  errors: Array<{
    line: number;
    message: string;
  }>;
}
