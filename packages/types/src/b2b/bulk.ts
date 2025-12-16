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
 *   name: 'Bracelet Or 18K - Maille Figaro',
 *   quantity: 5,
 *   unitPrice: 450,
 *   available: true,
 *   stock: 25,
 * };
 * ```
 */
export interface BulkOrderItem {
  /** Stock Keeping Unit (product reference) */
  sku: string;
  /** Product name */
  name: string;
  /** Quantity requested */
  quantity: number;
  /** Price per unit (in EUR) */
  unitPrice: number;
  /** Whether the requested quantity is available */
  available: boolean;
  /** Current stock level */
  stock: number;
  /** Error message if item has validation issues */
  error?: string;
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
 *   sku: 'BRA-001',
 *   name: 'Bracelet Or 18K - Maille Figaro',
 *   price: 450,
 *   stock: 25,
 *   available: true,
 *   category: 'bracelets',
 * };
 * ```
 */
export interface ProductCatalogEntry {
  /** Stock Keeping Unit (product reference) */
  sku: string;
  /** Product name */
  name: string;
  /** Price per unit (in EUR) */
  price: number;
  /** Current stock level */
  stock: number;
  /** Whether the product is available for ordering */
  available: boolean;
  /** Product category code */
  category?: string;
  /** Minimum order quantity */
  minOrderQuantity?: number;
  /** Maximum order quantity (based on stock or limits) */
  maxOrderQuantity?: number;
}

/**
 * Result of bulk order validation.
 *
 * @example
 * ```ts
 * const result: BulkOrderValidationResult = {
 *   valid: false,
 *   errors: [
 *     { sku: 'BRA-001', code: 'INSUFFICIENT_STOCK', message: 'Stock insuffisant' }
 *   ],
 *   warnings: [],
 * };
 * ```
 */
export interface BulkOrderValidationResult {
  /** Whether the entire bulk order is valid */
  valid: boolean;
  /** List of validation errors */
  errors: BulkOrderValidationError[];
  /** List of validation warnings (non-blocking) */
  warnings: BulkOrderValidationWarning[];
}

/**
 * Validation error for a bulk order item.
 */
export interface BulkOrderValidationError {
  /** SKU that has the error */
  sku: string;
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
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_QUANTITY'
  | 'PRODUCT_UNAVAILABLE'
  | 'EXCEEDS_ORDER_LIMIT'
  | 'BELOW_MIN_QUANTITY';

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
