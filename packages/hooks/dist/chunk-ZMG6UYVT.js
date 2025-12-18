import {
  invalidateQueries,
  useApiMutation,
  useApiQuery
} from "./chunk-KPRLFJKZ.js";

// src/cart/useCart.ts
import { useState, useMemo, useEffect } from "react";
function useCart(api, options = {}) {
  const { cartId: initialCartId, regionId, refreshInterval } = options;
  const [cartId, setCartId] = useState(initialCartId);
  const {
    data: cart,
    isLoading,
    error,
    refetch
  } = useApiQuery(
    ["cart", cartId],
    async () => {
      if (!api?.cart) {
        return null;
      }
      if (cartId) {
        try {
          const existingCart = await api.cart.get(cartId);
          return existingCart;
        } catch {
        }
      }
      const newCart = await api.cart.create(regionId ?? "");
      setCartId(newCart.id);
      return newCart;
    },
    {
      enabled: !!api?.cart,
      staleTime: 3e4
      // 30 seconds
    }
  );
  useEffect(() => {
    if (!refreshInterval || !api?.cart) return;
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, api, refetch]);
  const items = useMemo(() => cart?.items ?? [], [cart]);
  const itemCount = useMemo(
    () => cart?.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0),
    [cart, items]
  );
  const subtotal = useMemo(() => {
    if (cart?.subtotal !== void 0) return cart.subtotal;
    return cart?.totalPrice ?? 0;
  }, [cart]);
  const total = useMemo(() => cart?.total ?? cart?.totalPrice ?? 0, [cart]);
  const isEmpty = items.length === 0;
  const getItemId = (item, index) => {
    return item.id ?? item.productId ?? item.product?.id ?? `item-${index}`;
  };
  const addItemMutation = useApiMutation(
    async (input) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      const result = await api.cart.addItem(cartId, {
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        metadata: input.metadata
      });
      return result;
    },
    {
      invalidateKeys: [["cart", cartId]]
    }
  );
  const updateItemMutation = useApiMutation(
    async ({ itemId, quantity }) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      const result = await api.cart.updateItem(cartId, itemId, { quantity });
      return result;
    },
    {
      invalidateKeys: [["cart", cartId]]
    }
  );
  const removeItemMutation = useApiMutation(
    async (itemId) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      const result = await api.cart.removeItem(cartId, itemId);
      return result;
    },
    {
      invalidateKeys: [["cart", cartId]]
    }
  );
  const clearCartMutation = useApiMutation(
    async () => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = getItemId(item, i);
        await api.cart.removeItem(cartId, itemId);
      }
    },
    {
      invalidateKeys: [["cart", cartId]]
    }
  );
  const applyDiscountMutation = useApiMutation(
    async (code) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      const result = await api.cart.applyDiscount(cartId, code);
      return result;
    },
    {
      invalidateKeys: [["cart", cartId]]
    }
  );
  const removeDiscountMutation = useApiMutation(
    async (code) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      const result = await api.cart.removeDiscount(cartId, code);
      return result;
    },
    {
      invalidateKeys: [["cart", cartId]]
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
    updateItem: (itemId, quantity) => updateItemMutation.mutateAsync({ itemId, quantity }),
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    applyDiscount: applyDiscountMutation.mutateAsync,
    removeDiscount: removeDiscountMutation.mutateAsync,
    refresh: refetch
  };
}

// src/cart/useBulkCart.ts
import { useState as useState2, useCallback as useCallback2 } from "react";
function parseCSV(content) {
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
  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const quantity = parseInt(values[quantityIndex], 10);
    if (isNaN(quantity) || quantity <= 0) continue;
    items.push({
      productId: productIdIndex >= 0 ? values[productIdIndex] : "",
      sku: skuIndex >= 0 ? values[skuIndex] : void 0,
      variantId: variantIdIndex >= 0 ? values[variantIdIndex] : void 0,
      quantity
    });
  }
  return items;
}
function useBulkCart(api, options) {
  const { cartId, batchSize = 10, validateBeforeAdd = true } = options;
  const [isProcessing, setIsProcessing] = useState2(false);
  const [progress, setProgress] = useState2({ current: 0, total: 0 });
  const [error, setError] = useState2(null);
  const addBulkItems = useCallback2(
    async (items) => {
      if (!api?.cart) {
        throw new Error("Cart API not available");
      }
      setIsProcessing(true);
      setError(null);
      setProgress({ current: 0, total: items.length });
      const result = {
        added: [],
        failed: [],
        skipped: []
      };
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (item) => {
            try {
              let productId = item.productId;
              if (!productId && item.sku) {
                const productsApi = api.products;
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
                  reason: "Product not found"
                });
                return;
              }
              if (validateBeforeAdd && api.products?.getInventory) {
                const inventory = await api.products.getInventory(productId);
                if (inventory.available < item.quantity) {
                  result.failed.push({
                    item,
                    reason: `Insufficient stock: ${inventory.available} available`
                  });
                  return;
                }
              }
              await api.cart.addItem(cartId, {
                productId,
                variantId: item.variantId,
                quantity: item.quantity
              });
              result.added.push(item);
            } catch (err) {
              result.failed.push({
                item,
                reason: err instanceof Error ? err.message : "Unknown error"
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
  const importFromCSV = useCallback2(
    async (csvContent) => {
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
  const replaceCart = useCallback2(
    async (items) => {
      if (!api?.cart) {
        throw new Error("Cart API not available");
      }
      setIsProcessing(true);
      setError(null);
      try {
        const currentCart = await api.cart.get(cartId);
        const cartItems = currentCart.items;
        for (let i = 0; i < cartItems.length; i++) {
          const item = cartItems[i];
          const itemId = item.id ?? item.productId ?? item.product?.id ?? `item-${i}`;
          await api.cart.removeItem(cartId, itemId);
        }
        await addBulkItems(items);
        const updatedCart = await api.cart.get(cartId);
        setIsProcessing(false);
        return updatedCart;
      } catch (err) {
        setIsProcessing(false);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [api, cartId, addBulkItems]
  );
  const duplicateFromOrder = useCallback2(
    async (orderId) => {
      if (!api?.cart || !api?.orders) {
        throw new Error("Cart or Orders API not available");
      }
      setIsProcessing(true);
      setError(null);
      try {
        const order = await api.orders.get(orderId);
        const orderItems = order.items;
        const items = orderItems.map((item) => ({
          productId: item.productId ?? item.product?.id ?? "",
          variantId: item.variantId,
          quantity: item.quantity
        }));
        await addBulkItems(items);
        const updatedCart = await api.cart.get(cartId);
        setIsProcessing(false);
        return updatedCart;
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
    error
  };
}

export {
  useCart,
  useBulkCart
};
//# sourceMappingURL=chunk-ZMG6UYVT.js.map