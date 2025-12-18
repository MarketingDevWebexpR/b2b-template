import { Cart, CartItem } from '@maison/types';
import { ICommerceClient } from '@maison/api-client';

/**
 * Cart Hook
 *
 * Provides unified cart management for web and mobile.
 */

/**
 * Extended cart item with ID for API operations
 */
interface CartItemWithId extends CartItem {
    /** Unique item ID for cart operations */
    id?: string;
    /** Product ID reference */
    productId?: string;
    /** Variant ID if applicable */
    variantId?: string;
}
/**
 * Extended cart with additional fields
 */
interface ExtendedCart extends Cart {
    /** Cart ID */
    id?: string;
    /** Subtotal (before taxes/discounts) */
    subtotal?: number;
    /** Total (with taxes/discounts) */
    total?: number;
    /** Total items count */
    totalItems: number;
    /** Total price */
    totalPrice: number;
    /** Extended items with IDs */
    items: CartItemWithId[];
}
/**
 * Cart update input
 */
interface CartUpdateInput {
    /** Product or variant ID */
    productId: string;
    /** Quantity to add/update */
    quantity: number;
    /** Variant ID if applicable */
    variantId?: string;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Cart hook options
 */
interface UseCartOptions {
    /** Cart ID (optional, will create/retrieve if not provided) */
    cartId?: string;
    /** Region ID for pricing */
    regionId?: string;
    /** Auto-refresh interval in ms */
    refreshInterval?: number;
}
/**
 * Cart hook result
 */
interface UseCartResult {
    /** Current cart */
    cart: ExtendedCart | null;
    /** Cart items */
    items: CartItemWithId[];
    /** Total items count */
    itemCount: number;
    /** Cart subtotal */
    subtotal: number;
    /** Cart total (with taxes/discounts) */
    total: number;
    /** Loading state */
    isLoading: boolean;
    /** Error if any */
    error: Error | null;
    /** Whether cart is empty */
    isEmpty: boolean;
    /** Add item to cart */
    addItem: (input: CartUpdateInput) => Promise<ExtendedCart>;
    /** Update item quantity */
    updateItem: (itemId: string, quantity: number) => Promise<ExtendedCart>;
    /** Remove item from cart */
    removeItem: (itemId: string) => Promise<ExtendedCart>;
    /** Clear entire cart */
    clearCart: () => Promise<void>;
    /** Apply discount code */
    applyDiscount: (code: string) => Promise<ExtendedCart>;
    /** Remove discount code */
    removeDiscount: (code: string) => Promise<ExtendedCart>;
    /** Refresh cart data */
    refresh: () => void;
}
/**
 * Hook for managing shopping cart
 *
 * @param api - API client instance
 * @param options - Hook options
 * @returns Cart state and actions
 *
 * @example
 * ```typescript
 * const {
 *   cart,
 *   items,
 *   total,
 *   addItem,
 *   removeItem,
 *   clearCart
 * } = useCart(api, { regionId: 'reg_123' });
 *
 * // Add item
 * await addItem({ productId: 'prod_123', quantity: 2 });
 *
 * // Update quantity
 * await updateItem('item_123', 5);
 * ```
 */
declare function useCart(api: ICommerceClient, options?: UseCartOptions): UseCartResult;

/**
 * Bulk Cart Hook
 *
 * Provides bulk operations for B2B cart management.
 */

/**
 * Bulk item input
 */
interface BulkItemInput {
    /** Product ID */
    productId: string;
    /** Variant ID if applicable */
    variantId?: string;
    /** Quantity */
    quantity: number;
    /** SKU for quick reference */
    sku?: string;
}
/**
 * CSV import result
 */
interface CSVImportResult {
    /** Successfully added items */
    added: BulkItemInput[];
    /** Failed items with reasons */
    failed: Array<{
        item: BulkItemInput;
        reason: string;
    }>;
    /** Skipped items (duplicates, etc.) */
    skipped: BulkItemInput[];
}
/**
 * Bulk cart hook options
 */
interface UseBulkCartOptions {
    /** Cart ID */
    cartId: string;
    /** Max items per batch */
    batchSize?: number;
    /** Validate items before adding */
    validateBeforeAdd?: boolean;
}
/**
 * Bulk cart hook result
 */
interface UseBulkCartResult {
    /** Add multiple items at once */
    addBulkItems: (items: BulkItemInput[]) => Promise<CSVImportResult>;
    /** Import from CSV string */
    importFromCSV: (csvContent: string) => Promise<CSVImportResult>;
    /** Clear and replace cart contents */
    replaceCart: (items: BulkItemInput[]) => Promise<ExtendedCart>;
    /** Duplicate items (e.g., from previous order) */
    duplicateFromOrder: (orderId: string) => Promise<ExtendedCart>;
    /** Loading state */
    isProcessing: boolean;
    /** Progress for bulk operations */
    progress: {
        current: number;
        total: number;
    };
    /** Last error */
    error: Error | null;
}
/**
 * Hook for bulk cart operations in B2B context
 *
 * @param api - API client instance
 * @param options - Hook options
 * @returns Bulk cart actions and state
 *
 * @example
 * ```typescript
 * const {
 *   addBulkItems,
 *   importFromCSV,
 *   duplicateFromOrder,
 *   isProcessing,
 *   progress
 * } = useBulkCart(api, { cartId: 'cart_123' });
 *
 * // Add multiple items
 * const result = await addBulkItems([
 *   { productId: 'prod_1', quantity: 10 },
 *   { productId: 'prod_2', quantity: 5 },
 * ]);
 *
 * // Import from CSV
 * const csvResult = await importFromCSV(csvFileContent);
 * ```
 */
declare function useBulkCart(api: ICommerceClient, options: UseBulkCartOptions): UseBulkCartResult;

export { type BulkItemInput, type CSVImportResult, type CartItemWithId, type CartUpdateInput, type ExtendedCart, type UseBulkCartOptions, type UseBulkCartResult, type UseCartOptions, type UseCartResult, useBulkCart, useCart };
