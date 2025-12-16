/**
 * Cart Hook
 *
 * Provides unified cart management for web and mobile.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Cart, CartItem } from "@maison/types";
import type { ICommerceClient } from "@maison/api-client";
import { useApiQuery, invalidateQueries } from "../api/useApiQuery";
import { useApiMutation } from "../api/useApiMutation";

/**
 * Extended cart item with ID for API operations
 */
export interface CartItemWithId extends CartItem {
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
export interface ExtendedCart extends Cart {
  /** Cart ID */
  id?: string;
  /** Subtotal (before taxes/discounts) */
  subtotal?: number;
  /** Total (with taxes/discounts) */
  total?: number;
  /** Extended items with IDs */
  items: CartItemWithId[];
}

/**
 * Cart update input
 */
export interface CartUpdateInput {
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
export interface UseCartOptions {
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
export interface UseCartResult {
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
export function useCart(
  api: ICommerceClient,
  options: UseCartOptions = {}
): UseCartResult {
  const { cartId: initialCartId, regionId, refreshInterval } = options;
  const [cartId, setCartId] = useState<string | undefined>(initialCartId);

  // Query for cart
  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useApiQuery<ExtendedCart | null>(
    ["cart", cartId],
    async () => {
      if (!api?.cart) {
        return null;
      }

      // If we have a cart ID, retrieve it
      if (cartId) {
        try {
          return await api.cart.get(cartId);
        } catch {
          // Cart not found, create new one
        }
      }

      // Create a new cart
      const newCart = await api.cart.create({ regionId });
      setCartId(newCart.id);
      return newCart;
    },
    {
      enabled: !!api?.cart,
      staleTime: 30000, // 30 seconds
    }
  );

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval || !api?.cart) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, api, refetch]);

  // Derived state
  const items = useMemo(() => (cart?.items ?? []) as CartItemWithId[], [cart]);
  const itemCount = useMemo(
    () => cart?.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0),
    [cart, items]
  );
  // Use subtotal if available, otherwise calculate from items or use totalPrice
  const subtotal = useMemo(() => {
    if (cart?.subtotal !== undefined) return cart.subtotal;
    // Fallback to totalPrice or calculate from items
    return cart?.totalPrice ?? 0;
  }, [cart]);
  // Use total if available, otherwise use totalPrice
  const total = useMemo(() => cart?.total ?? cart?.totalPrice ?? 0, [cart]);
  const isEmpty = items.length === 0;

  // Helper to get item ID
  const getItemId = (item: CartItemWithId, index: number): string => {
    return item.id ?? item.productId ?? item.product?.id ?? `item-${index}`;
  };

  // Add item mutation
  const addItemMutation = useApiMutation<ExtendedCart, CartUpdateInput>(
    async (input) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      return api.cart.addItem(cartId, {
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        metadata: input.metadata,
      });
    },
    {
      invalidateKeys: [["cart", cartId]],
    }
  );

  // Update item mutation
  const updateItemMutation = useApiMutation<
    ExtendedCart,
    { itemId: string; quantity: number }
  >(
    async ({ itemId, quantity }) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      return api.cart.updateItem(cartId, itemId, { quantity });
    },
    {
      invalidateKeys: [["cart", cartId]],
    }
  );

  // Remove item mutation
  const removeItemMutation = useApiMutation<ExtendedCart, string>(
    async (itemId) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      return api.cart.removeItem(cartId, itemId);
    },
    {
      invalidateKeys: [["cart", cartId]],
    }
  );

  // Clear cart mutation
  const clearCartMutation = useApiMutation<void, void>(
    async () => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      // Remove all items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = getItemId(item, i);
        await api.cart.removeItem(cartId, itemId);
      }
    },
    {
      invalidateKeys: [["cart", cartId]],
    }
  );

  // Apply discount mutation
  const applyDiscountMutation = useApiMutation<ExtendedCart, string>(
    async (code) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      return api.cart.applyDiscount(cartId, code);
    },
    {
      invalidateKeys: [["cart", cartId]],
    }
  );

  // Remove discount mutation
  const removeDiscountMutation = useApiMutation<ExtendedCart, string>(
    async (code) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      return api.cart.removeDiscount(cartId, code);
    },
    {
      invalidateKeys: [["cart", cartId]],
    }
  );

  return {
    cart,
    items,
    itemCount,
    subtotal,
    total,
    isLoading,
    error,
    isEmpty,
    addItem: addItemMutation.mutateAsync,
    updateItem: (itemId, quantity) =>
      updateItemMutation.mutateAsync({ itemId, quantity }),
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    applyDiscount: applyDiscountMutation.mutateAsync,
    removeDiscount: removeDiscountMutation.mutateAsync,
    refresh: refetch,
  };
}
