var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/cart/index.ts
var cart_exports = {};
__export(cart_exports, {
  useBulkCart: () => useBulkCart,
  useCart: () => useCart
});
module.exports = __toCommonJS(cart_exports);

// src/cart/useCart.ts
var import_react3 = require("react");

// src/api/useApiQuery.ts
var import_react = require("react");
var queryCache = /* @__PURE__ */ new Map();
function useApiQuery(queryKey, queryFn, options = {}) {
  const {
    enabled = true,
    initialData,
    staleTime = 0,
    cacheTime = 5 * 60 * 1e3,
    retryCount = 3,
    retryDelay = 1e3,
    onSuccess,
    onError,
    refetchOnWindowFocus = false
  } = options;
  const cacheKey = JSON.stringify(queryKey);
  const retryCountRef = (0, import_react.useRef)(0);
  const [state, setState] = (0, import_react.useState)(() => {
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return {
        data: cached.data,
        isLoading: false,
        error: null,
        isSuccess: true,
        isFetching: false
      };
    }
    return {
      data: initialData ?? null,
      isLoading: enabled,
      error: null,
      isSuccess: false,
      isFetching: enabled
    };
  });
  const fetchData = (0, import_react.useCallback)(
    async (isRefetch = false) => {
      if (!isRefetch) {
        const cached = queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < staleTime) {
          setState((prev) => ({
            ...prev,
            data: cached.data,
            isLoading: false,
            isSuccess: true,
            isFetching: false
          }));
          return;
        }
      }
      setState((prev) => ({
        ...prev,
        isLoading: !prev.data,
        isFetching: true,
        error: null
      }));
      try {
        const data = await queryFn();
        queryCache.set(cacheKey, { data, timestamp: Date.now() });
        setState({
          data,
          isLoading: false,
          error: null,
          isSuccess: true,
          isFetching: false
        });
        retryCountRef.current = 0;
        onSuccess?.(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setTimeout(() => fetchData(isRefetch), retryDelay * retryCountRef.current);
          return;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
          isFetching: false
        }));
        retryCountRef.current = 0;
        onError?.(error);
      }
    },
    [cacheKey, queryFn, staleTime, retryCount, retryDelay, onSuccess, onError]
  );
  const refetch = (0, import_react.useCallback)(async () => {
    retryCountRef.current = 0;
    await fetchData(true);
  }, [fetchData]);
  const reset = (0, import_react.useCallback)(() => {
    queryCache.delete(cacheKey);
    setState({
      data: initialData ?? null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isFetching: false
    });
  }, [cacheKey, initialData]);
  (0, import_react.useEffect)(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, cacheKey]);
  (0, import_react.useEffect)(() => {
    if (!refetchOnWindowFocus || !enabled) return;
    const handleFocus = () => {
      const cached = queryCache.get(cacheKey);
      if (!cached || Date.now() - cached.timestamp >= staleTime) {
        fetchData(true);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnWindowFocus, enabled, cacheKey, staleTime, fetchData]);
  return {
    ...state,
    refetch,
    reset
  };
}
function invalidateQueries(queryKey) {
  const cacheKey = JSON.stringify(queryKey);
  queryCache.delete(cacheKey);
}

// src/api/useApiMutation.ts
var import_react2 = require("react");
function useApiMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = [],
    retryCount = 0
  } = options;
  const [state, setState] = (0, import_react2.useState)({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false
  });
  const reset = (0, import_react2.useCallback)(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false
    });
  }, []);
  const mutateAsync = (0, import_react2.useCallback)(
    async (variables) => {
      setState({
        data: null,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false
      });
      let lastError = null;
      let attempts = 0;
      while (attempts <= retryCount) {
        try {
          const data = await mutationFn(variables);
          setState({
            data,
            isLoading: false,
            error: null,
            isSuccess: true,
            isError: false
          });
          for (const key of invalidateKeys) {
            invalidateQueries(key);
          }
          onSuccess?.(data, variables);
          onSettled?.(data, null, variables);
          return data;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          attempts++;
          if (attempts > retryCount) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1e3 * attempts));
        }
      }
      setState({
        data: null,
        isLoading: false,
        error: lastError,
        isSuccess: false,
        isError: true
      });
      onError?.(lastError, variables);
      onSettled?.(null, lastError, variables);
      throw lastError;
    },
    [mutationFn, retryCount, invalidateKeys, onSuccess, onError, onSettled]
  );
  const mutate = (0, import_react2.useCallback)(
    (variables) => {
      mutateAsync(variables).catch(() => {
      });
    },
    [mutateAsync]
  );
  return {
    ...state,
    mutate,
    mutateAsync,
    reset
  };
}

// src/cart/useCart.ts
function useCart(api, options = {}) {
  const { cartId: initialCartId, regionId, refreshInterval } = options;
  const [cartId, setCartId] = (0, import_react3.useState)(initialCartId);
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
          return await api.cart.get(cartId);
        } catch {
        }
      }
      const newCart = await api.cart.create({ regionId });
      setCartId(newCart.id);
      return newCart;
    },
    {
      enabled: !!api?.cart,
      staleTime: 3e4
      // 30 seconds
    }
  );
  (0, import_react3.useEffect)(() => {
    if (!refreshInterval || !api?.cart) return;
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, api, refetch]);
  const items = (0, import_react3.useMemo)(() => cart?.items ?? [], [cart]);
  const itemCount = (0, import_react3.useMemo)(
    () => cart?.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0),
    [cart, items]
  );
  const subtotal = (0, import_react3.useMemo)(() => {
    if (cart?.subtotal !== void 0) return cart.subtotal;
    return cart?.totalPrice ?? 0;
  }, [cart]);
  const total = (0, import_react3.useMemo)(() => cart?.total ?? cart?.totalPrice ?? 0, [cart]);
  const isEmpty = items.length === 0;
  const getItemId = (item, index) => {
    return item.id ?? item.productId ?? item.product?.id ?? `item-${index}`;
  };
  const addItemMutation = useApiMutation(
    async (input) => {
      if (!api?.cart || !cartId) {
        throw new Error("Cart not available");
      }
      return api.cart.addItem(cartId, {
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        metadata: input.metadata
      });
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
      return api.cart.updateItem(cartId, itemId, { quantity });
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
      return api.cart.removeItem(cartId, itemId);
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
      return api.cart.applyDiscount(cartId, code);
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
      return api.cart.removeDiscount(cartId, code);
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
var import_react4 = require("react");
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
  const [isProcessing, setIsProcessing] = (0, import_react4.useState)(false);
  const [progress, setProgress] = (0, import_react4.useState)({ current: 0, total: 0 });
  const [error, setError] = (0, import_react4.useState)(null);
  const addBulkItems = (0, import_react4.useCallback)(
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
              if (!productId && item.sku && api.products?.findBySku) {
                const product = await api.products.findBySku(item.sku);
                if (product) {
                  productId = product.id;
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
  const importFromCSV = (0, import_react4.useCallback)(
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
  const replaceCart = (0, import_react4.useCallback)(
    async (items) => {
      if (!api?.cart) {
        throw new Error("Cart API not available");
      }
      setIsProcessing(true);
      setError(null);
      try {
        const currentCart = await api.cart.get(cartId);
        for (let i = 0; i < currentCart.items.length; i++) {
          const item = currentCart.items[i];
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
  const duplicateFromOrder = (0, import_react4.useCallback)(
    async (orderId) => {
      if (!api?.cart || !api?.orders) {
        throw new Error("Cart or Orders API not available");
      }
      setIsProcessing(true);
      setError(null);
      try {
        const order = await api.orders.get(orderId);
        const items = order.items.map((item) => ({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useBulkCart,
  useCart
});
//# sourceMappingURL=index.cjs.map