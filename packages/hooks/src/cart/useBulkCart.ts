/**
 * Bulk Cart Hook
 *
 * Provides bulk operations for B2B cart management.
 */

import { useState, useCallback } from "react";
import type { Cart } from "@maison/types";
import type { ICommerceClient } from "@maison/api-client";
import { useApiMutation } from "../api/useApiMutation";
import { invalidateQueries } from "../api/useApiQuery";
import type { ExtendedCart, CartItemWithId } from "./useCart";

/**
 * Bulk item input
 */
export interface BulkItemInput {
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
export interface CSVImportResult {
  /** Successfully added items */
  added: BulkItemInput[];
  /** Failed items with reasons */
  failed: Array<{ item: BulkItemInput; reason: string }>;
  /** Skipped items (duplicates, etc.) */
  skipped: BulkItemInput[];
}

/**
 * Bulk cart hook options
 */
export interface UseBulkCartOptions {
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
export interface UseBulkCartResult {
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
  progress: { current: number; total: number };
  /** Last error */
  error: Error | null;
}

/**
 * Parse CSV content into bulk items
 */
function parseCSV(content: string): BulkItemInput[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const skuIndex = header.findIndex((h) => h === "sku" || h === "reference");
  const productIdIndex = header.findIndex((h) => h === "productid" || h === "product_id" || h === "id");
  const variantIdIndex = header.findIndex((h) => h === "variantid" || h === "variant_id" || h === "variant");
  const quantityIndex = header.findIndex((h) => h === "quantity" || h === "qty" || h === "quantite");

  if (quantityIndex === -1) {
    throw new Error("CSV must contain a quantity column");
  }
  if (skuIndex === -1 && productIdIndex === -1) {
    throw new Error("CSV must contain a sku or productId column");
  }

  const items: BulkItemInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const quantity = parseInt(values[quantityIndex], 10);

    if (isNaN(quantity) || quantity <= 0) continue;

    items.push({
      productId: productIdIndex >= 0 ? values[productIdIndex] : "",
      sku: skuIndex >= 0 ? values[skuIndex] : undefined,
      variantId: variantIdIndex >= 0 ? values[variantIdIndex] : undefined,
      quantity,
    });
  }

  return items;
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
export function useBulkCart(
  api: ICommerceClient,
  options: UseBulkCartOptions
): UseBulkCartResult {
  const { cartId, batchSize = 10, validateBeforeAdd = true } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<Error | null>(null);

  const addBulkItems = useCallback(
    async (items: BulkItemInput[]): Promise<CSVImportResult> => {
      if (!api?.cart) {
        throw new Error("Cart API not available");
      }

      setIsProcessing(true);
      setError(null);
      setProgress({ current: 0, total: items.length });

      const result: CSVImportResult = {
        added: [],
        failed: [],
        skipped: [],
      };

      // Process in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (item) => {
            try {
              // Resolve SKU to product ID if needed
              let productId = item.productId;
              if (!productId && item.sku) {
                // Try to find product by SKU if the API supports it
                const productsApi = api.products as { findBySku?: (sku: string) => Promise<{ id: string } | null> };
                if (productsApi?.findBySku) {
                  const product = await productsApi.findBySku(item.sku);
                  if (product) {
                    productId = product.id;
                  }
                }
              }

              if (!productId) {
                result.failed.push({
                  item,
                  reason: "Product not found",
                });
                return;
              }

              // Validate stock if enabled
              if (validateBeforeAdd && api.products?.getInventory) {
                const inventory = await api.products.getInventory(productId);
                if (inventory.available < item.quantity) {
                  result.failed.push({
                    item,
                    reason: `Insufficient stock: ${inventory.available} available`,
                  });
                  return;
                }
              }

              // Add to cart
              await api.cart.addItem(cartId, {
                productId,
                variantId: item.variantId,
                quantity: item.quantity,
              });

              result.added.push(item);
            } catch (err) {
              result.failed.push({
                item,
                reason: err instanceof Error ? err.message : "Unknown error",
              });
            }
          })
        );

        setProgress({ current: Math.min(i + batchSize, items.length), total: items.length });
      }

      invalidateQueries(["cart", cartId]);
      setIsProcessing(false);

      return result;
    },
    [api, cartId, batchSize, validateBeforeAdd]
  );

  const importFromCSV = useCallback(
    async (csvContent: string): Promise<CSVImportResult> => {
      try {
        const items = parseCSV(csvContent);
        if (items.length === 0) {
          throw new Error("No valid items found in CSV");
        }
        return addBulkItems(items);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [addBulkItems]
  );

  const replaceCart = useCallback(
    async (items: BulkItemInput[]): Promise<ExtendedCart> => {
      if (!api?.cart) {
        throw new Error("Cart API not available");
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Get current cart and clear it
        const currentCart = await api.cart.get(cartId);
        const cartItems = currentCart.items as Array<{ id?: string; productId?: string; product?: { id: string } }>;
        for (let i = 0; i < cartItems.length; i++) {
          const item = cartItems[i];
          const itemId = item.id ?? item.productId ?? item.product?.id ?? `item-${i}`;
          await api.cart.removeItem(cartId, itemId);
        }

        // Add new items
        await addBulkItems(items);

        // Return updated cart
        const updatedCart = await api.cart.get(cartId);
        setIsProcessing(false);
        return updatedCart as unknown as ExtendedCart;
      } catch (err) {
        setIsProcessing(false);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [api, cartId, addBulkItems]
  );

  const duplicateFromOrder = useCallback(
    async (orderId: string): Promise<ExtendedCart> => {
      if (!api?.cart || !api?.orders) {
        throw new Error("Cart or Orders API not available");
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Get order items
        const order = await api.orders.get(orderId);

        // Convert to bulk items - use generic type for order items
        type OrderItemLike = { productId?: string; product?: { id: string }; variantId?: string; quantity: number };
        const orderItems = order.items as OrderItemLike[];
        const items: BulkItemInput[] = orderItems.map((item) => ({
          productId: item.productId ?? item.product?.id ?? "",
          variantId: item.variantId,
          quantity: item.quantity,
        }));

        // Add to cart
        await addBulkItems(items);

        // Return updated cart
        const updatedCart = await api.cart.get(cartId);
        setIsProcessing(false);
        return updatedCart as unknown as ExtendedCart;
      } catch (err) {
        setIsProcessing(false);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [api, cartId, addBulkItems]
  );

  return {
    addBulkItems,
    importFromCSV,
    replaceCart,
    duplicateFromOrder,
    isProcessing,
    progress,
    error,
  };
}
