'use client';

/**
 * Cart Context - B2B Enhanced
 *
 * Manages shopping cart state with B2B-specific features:
 * - Persistent storage (localStorage)
 * - Multi-warehouse support
 * - Real-time stock validation
 * - B2B pricing integration
 * - Saved carts functionality
 *
 * @packageDocumentation
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  Product,
  CartState,
  CartItemWithDetails,
  StockStatus,
  WarehouseStock,
} from '@/types';

// ============================================================================
// Constants
// ============================================================================

const CART_STORAGE_KEY = 'bijoux-b2b-cart';
const SAVED_CARTS_STORAGE_KEY = 'bijoux-b2b-saved-carts';
const CART_EXPIRY_HOURS = 72; // Cart expires after 72 hours

// ============================================================================
// Types
// ============================================================================

/**
 * B2B Cart Item with extended details
 */
export interface B2BCartItem extends CartItemWithDetails {
  /** Variant information */
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
  /** Selected warehouse ID */
  warehouseId?: string;
  /** Warehouse name for display */
  warehouseName?: string;
  /** Stock information */
  stock: {
    status: StockStatus;
    available: number;
    reserved?: number;
    nextRestockDate?: string;
  };
  /** B2B price details */
  pricing: {
    unitPriceHT: number;
    unitPriceTTC: number;
    originalPriceHT?: number;
    discountPercent?: number;
    volumeDiscountApplied?: {
      minQuantity: number;
      discountPercent: number;
      label?: string;
    };
    priceListId?: string;
    priceListName?: string;
  };
  /** Line notes */
  notes?: string;
  /** Added timestamp */
  addedAt: string;
}

/**
 * B2B Cart State
 */
export interface B2BCartState {
  /** Unique cart ID */
  id: string;
  /** Cart items */
  items: B2BCartItem[];
  /** Total item count */
  itemCount: number;
  /** Total items (alias for itemCount - compatibility with legacy code) */
  totalItems: number;
  /** Total quantity */
  totalQuantity: number;
  /** Total price TTC (alias for totalTTC - compatibility with legacy code) */
  totalPrice: number;
  /** Subtotal HT */
  subtotalHT: number;
  /** Subtotal TTC */
  subtotalTTC: number;
  /** Applied discounts */
  discounts: CartDiscount[];
  /** Total discount amount HT */
  totalDiscountHT: number;
  /** Tax amount */
  taxAmount: number;
  /** Estimated shipping HT */
  estimatedShippingHT: number;
  /** Total HT */
  totalHT: number;
  /** Total TTC */
  totalTTC: number;
  /** Promo code applied */
  promoCode?: string;
  /** Promo discount */
  promoDiscount?: number;
  /** Selected warehouse ID for fulfillment */
  selectedWarehouseId?: string;
  /** Last updated timestamp */
  lastUpdated: string;
  /** Cart expiration timestamp */
  expiresAt: string;
}

/**
 * Cart discount
 */
export interface CartDiscount {
  type: 'volume' | 'tier' | 'promo' | 'loyalty';
  label: string;
  amountHT: number;
  percentage?: number;
}

/**
 * Saved cart
 */
export interface SavedCart {
  id: string;
  name: string;
  items: B2BCartItem[];
  itemCount: number;
  totalHT: number;
  createdAt: string;
  updatedAt: string;
  sharedLink?: string;
}

/**
 * Stock validation result
 */
export interface StockValidationResult {
  productId: string;
  isValid: boolean;
  requestedQuantity: number;
  availableQuantity: number;
  message?: string;
  suggestedWarehouseId?: string;
}

/**
 * Cart Context Type
 */
export interface CartContextType {
  // State
  cart: B2BCartState;
  isLoading: boolean;
  isValidatingStock: boolean;
  stockValidationErrors: StockValidationResult[];

  // Drawer state
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Cart operations
  addToCart: (
    product: Product,
    quantity?: number,
    options?: {
      warehouseId?: string;
      variantId?: string;
      notes?: string;
    }
  ) => Promise<boolean>;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<boolean>;
  updateItemNotes: (productId: string, notes: string, variantId?: string) => void;
  updateItemWarehouse: (productId: string, warehouseId: string, variantId?: string) => void;
  clearCart: () => void;

  // Cart queries
  isInCart: (productId: string, variantId?: string) => boolean;
  getItemQuantity: (productId: string, variantId?: string) => number;
  getCartItem: (productId: string, variantId?: string) => B2BCartItem | undefined;

  // Stock validation
  validateStock: (items?: B2BCartItem[]) => Promise<StockValidationResult[]>;
  validateSingleItem: (productId: string, quantity: number, warehouseId?: string) => Promise<StockValidationResult>;

  // Promo codes
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;

  // Saved carts (B2B feature)
  savedCarts: SavedCart[];
  saveCurrentCart: (name: string) => SavedCart;
  loadSavedCart: (cartId: string) => void;
  deleteSavedCart: (cartId: string) => void;
  shareSavedCart: (cartId: string) => string;

  // Warehouse selection
  setSelectedWarehouse: (warehouseId: string) => void;
}

// ============================================================================
// Initial State
// ============================================================================

const generateCartId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const getExpiryDate = (): string => {
  const date = new Date();
  date.setHours(date.getHours() + CART_EXPIRY_HOURS);
  return date.toISOString();
};

const initialCartState: B2BCartState = {
  id: generateCartId(),
  items: [],
  itemCount: 0,
  totalItems: 0,
  totalQuantity: 0,
  totalPrice: 0,
  subtotalHT: 0,
  subtotalTTC: 0,
  discounts: [],
  totalDiscountHT: 0,
  taxAmount: 0,
  estimatedShippingHT: 0,
  totalHT: 0,
  totalTTC: 0,
  lastUpdated: new Date().toISOString(),
  expiresAt: getExpiryDate(),
};

// ============================================================================
// Context
// ============================================================================

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate cart totals from items
 */
function calculateCartTotals(
  items: B2BCartItem[],
  promoDiscount: number = 0
): Pick<B2BCartState, 'itemCount' | 'totalItems' | 'totalQuantity' | 'totalPrice' | 'subtotalHT' | 'subtotalTTC' | 'discounts' | 'totalDiscountHT' | 'taxAmount' | 'totalHT' | 'totalTTC'> {
  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalHT = items.reduce((sum, item) => {
    return sum + item.pricing.unitPriceHT * item.quantity;
  }, 0);

  const subtotalTTC = items.reduce((sum, item) => {
    return sum + item.pricing.unitPriceTTC * item.quantity;
  }, 0);

  // Calculate discounts
  const discounts: CartDiscount[] = [];
  let totalDiscountHT = 0;

  // Volume discounts already applied in item pricing
  items.forEach((item) => {
    if (item.pricing.volumeDiscountApplied && item.pricing.originalPriceHT) {
      const itemDiscount = (item.pricing.originalPriceHT - item.pricing.unitPriceHT) * item.quantity;
      if (itemDiscount > 0) {
        totalDiscountHT += itemDiscount;
      }
    }
  });

  if (totalDiscountHT > 0) {
    discounts.push({
      type: 'volume',
      label: 'Remises volume',
      amountHT: totalDiscountHT,
    });
  }

  // Add promo discount if applied
  if (promoDiscount > 0) {
    discounts.push({
      type: 'promo',
      label: 'Code promo',
      amountHT: promoDiscount,
    });
    totalDiscountHT += promoDiscount;
  }

  const taxAmount = subtotalTTC - subtotalHT;
  const totalHT = subtotalHT - totalDiscountHT;
  const totalTTC = totalHT + taxAmount;

  return {
    itemCount,
    totalItems: itemCount, // Alias for legacy compatibility
    totalQuantity,
    totalPrice: Math.round(totalTTC * 100) / 100, // Alias for legacy compatibility
    subtotalHT: Math.round(subtotalHT * 100) / 100,
    subtotalTTC: Math.round(subtotalTTC * 100) / 100,
    discounts,
    totalDiscountHT: Math.round(totalDiscountHT * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalHT: Math.round(totalHT * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
  };
}

/**
 * Load cart from localStorage
 */
function loadCartFromStorage(): B2BCartState {
  if (typeof window === 'undefined') {
    return initialCartState;
  }

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      return { ...initialCartState, id: generateCartId() };
    }

    const parsed = JSON.parse(storedCart) as B2BCartState;

    // Check if cart has expired
    if (new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return { ...initialCartState, id: generateCartId() };
    }

    // Validate cart structure
    if (!parsed.items || !Array.isArray(parsed.items)) {
      return { ...initialCartState, id: generateCartId() };
    }

    // Recalculate totals to ensure data integrity
    const totals = calculateCartTotals(parsed.items, parsed.promoDiscount);

    return {
      ...parsed,
      ...totals,
    };
  } catch (error) {
    console.error('Erreur lors du chargement du panier:', error);
    return { ...initialCartState, id: generateCartId() };
  }
}

/**
 * Save cart to localStorage
 */
function saveCartToStorage(cart: B2BCartState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du panier:', error);
  }
}

/**
 * Load saved carts from localStorage
 */
function loadSavedCartsFromStorage(): SavedCart[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(SAVED_CARTS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SavedCart[];
  } catch (error) {
    console.error('Erreur lors du chargement des paniers sauvegardes:', error);
    return [];
  }
}

/**
 * Save saved carts to localStorage
 */
function saveSavedCartsToStorage(carts: SavedCart[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(SAVED_CARTS_STORAGE_KEY, JSON.stringify(carts));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paniers:', error);
  }
}

/**
 * Create cart item from product
 */
function createCartItem(
  product: Product,
  quantity: number,
  options?: {
    warehouseId?: string;
    variantId?: string;
    notes?: string;
    pricing?: B2BCartItem['pricing'];
  }
): B2BCartItem {
  const now = new Date().toISOString();

  // Default pricing (would be calculated by PricingContext in production)
  const defaultPricing: B2BCartItem['pricing'] = options?.pricing || {
    unitPriceHT: product.price,
    unitPriceTTC: product.isPriceTTC ? product.price : product.price * 1.20,
    originalPriceHT: product.compareAtPrice,
    discountPercent: product.compareAtPrice
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : undefined,
  };

  return {
    productId: product.id,
    productReference: product.reference,
    productName: product.name,
    productSlug: product.slug,
    productImage: product.images[0] || '/images/placeholder-product.jpg',
    unitPrice: defaultPricing.unitPriceHT,
    quantity,
    maxQuantity: product.stock || 999,
    totalPrice: defaultPricing.unitPriceHT * quantity,
    warehouseId: options?.warehouseId,
    stock: {
      status: product.isAvailable ? 'in_stock' : 'out_of_stock',
      available: product.stock || 0,
    },
    pricing: defaultPricing,
    notes: options?.notes,
    addedAt: now,
  };
}

// ============================================================================
// Provider Component
// ============================================================================

export interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  // State
  const [cart, setCart] = useState<B2BCartState>(initialCartState);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [stockValidationErrors, setStockValidationErrors] = useState<StockValidationResult[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);

  // Drawer controls
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = loadCartFromStorage();
    const storedSavedCarts = loadSavedCartsFromStorage();
    setCart(storedCart);
    setSavedCarts(storedSavedCarts);
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage(cart);
    }
  }, [cart, isLoading]);

  // Save saved carts to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveSavedCartsToStorage(savedCarts);
    }
  }, [savedCarts, isLoading]);

  /**
   * Validate stock for items
   */
  const validateStock = useCallback(
    async (items?: B2BCartItem[]): Promise<StockValidationResult[]> => {
      const itemsToValidate = items || cart.items;
      setIsValidatingStock(true);

      try {
        // In production, this would call an API
        // For now, we simulate validation
        await new Promise((resolve) => setTimeout(resolve, 300));

        const results: StockValidationResult[] = itemsToValidate.map((item) => {
          const isValid = item.quantity <= item.stock.available;
          return {
            productId: item.productId,
            isValid,
            requestedQuantity: item.quantity,
            availableQuantity: item.stock.available,
            message: isValid
              ? undefined
              : `Stock insuffisant. Disponible: ${item.stock.available}`,
          };
        });

        const errors = results.filter((r) => !r.isValid);
        setStockValidationErrors(errors);
        return results;
      } finally {
        setIsValidatingStock(false);
      }
    },
    [cart.items]
  );

  /**
   * Validate single item stock
   */
  const validateSingleItem = useCallback(
    async (
      productId: string,
      quantity: number,
      warehouseId?: string
    ): Promise<StockValidationResult> => {
      // In production, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 100));

      const item = cart.items.find((i) => i.productId === productId);
      const available = item?.stock.available || 0;
      const isValid = quantity <= available;

      return {
        productId,
        isValid,
        requestedQuantity: quantity,
        availableQuantity: available,
        message: isValid ? undefined : `Stock insuffisant. Disponible: ${available}`,
      };
    },
    [cart.items]
  );

  /**
   * Add product to cart
   */
  const addToCart = useCallback(
    async (
      product: Product,
      quantity: number = 1,
      options?: {
        warehouseId?: string;
        variantId?: string;
        notes?: string;
      }
    ): Promise<boolean> => {
      if (quantity < 1) return false;

      // Validate stock before adding
      const validation = await validateSingleItem(product.id, quantity, options?.warehouseId);
      if (!validation.isValid) {
        setStockValidationErrors((prev) => [...prev.filter((e) => e.productId !== product.id), validation]);
        return false;
      }

      setCart((prevCart) => {
        const itemKey = `${product.id}-${options?.variantId || ''}`;
        const existingItemIndex = prevCart.items.findIndex(
          (item) =>
            item.productId === product.id &&
            (!options?.variantId || item.variant?.id === options.variantId)
        );

        let newItems: B2BCartItem[];

        if (existingItemIndex > -1) {
          // Product exists, update quantity
          newItems = prevCart.items.map((item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  totalPrice: (item.quantity + quantity) * item.pricing.unitPriceHT,
                }
              : item
          );
        } else {
          // New product, add to cart
          const newItem = createCartItem(product, quantity, options);
          newItems = [...prevCart.items, newItem];
        }

        const totals = calculateCartTotals(newItems, prevCart.promoDiscount);

        return {
          ...prevCart,
          items: newItems,
          ...totals,
          lastUpdated: new Date().toISOString(),
          expiresAt: getExpiryDate(),
        };
      });

      // Clear validation error for this product
      setStockValidationErrors((prev) => prev.filter((e) => e.productId !== product.id));
      return true;
    },
    [validateSingleItem]
  );

  /**
   * Remove product from cart
   */
  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) =>
          !(item.productId === productId && (!variantId || item.variant?.id === variantId))
      );

      const totals = calculateCartTotals(newItems, prevCart.promoDiscount);

      return {
        ...prevCart,
        items: newItems,
        ...totals,
        lastUpdated: new Date().toISOString(),
      };
    });

    // Clear validation error for this product
    setStockValidationErrors((prev) => prev.filter((e) => e.productId !== productId));
  }, []);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(
    async (productId: string, quantity: number, variantId?: string): Promise<boolean> => {
      if (quantity < 1) {
        removeFromCart(productId, variantId);
        return true;
      }

      // Validate stock
      const validation = await validateSingleItem(productId, quantity);
      if (!validation.isValid) {
        setStockValidationErrors((prev) => [...prev.filter((e) => e.productId !== productId), validation]);
        return false;
      }

      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) =>
          item.productId === productId && (!variantId || item.variant?.id === variantId)
            ? {
                ...item,
                quantity,
                totalPrice: quantity * item.pricing.unitPriceHT,
              }
            : item
        );

        const totals = calculateCartTotals(newItems, prevCart.promoDiscount);

        return {
          ...prevCart,
          items: newItems,
          ...totals,
          lastUpdated: new Date().toISOString(),
        };
      });

      // Clear validation error
      setStockValidationErrors((prev) => prev.filter((e) => e.productId !== productId));
      return true;
    },
    [removeFromCart, validateSingleItem]
  );

  /**
   * Update item notes
   */
  const updateItemNotes = useCallback((productId: string, notes: string, variantId?: string) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.productId === productId && (!variantId || item.variant?.id === variantId)
          ? { ...item, notes }
          : item
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  /**
   * Update item warehouse
   */
  const updateItemWarehouse = useCallback(
    (productId: string, warehouseId: string, variantId?: string) => {
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.productId === productId && (!variantId || item.variant?.id === variantId)
            ? { ...item, warehouseId }
            : item
        ),
        lastUpdated: new Date().toISOString(),
      }));
    },
    []
  );

  /**
   * Clear cart
   */
  const clearCart = useCallback(() => {
    setCart({
      ...initialCartState,
      id: generateCartId(),
      totalItems: 0,
      totalPrice: 0,
      lastUpdated: new Date().toISOString(),
      expiresAt: getExpiryDate(),
    });
    setStockValidationErrors([]);
  }, []);

  /**
   * Check if product is in cart
   */
  const isInCart = useCallback(
    (productId: string, variantId?: string): boolean => {
      return cart.items.some(
        (item) =>
          item.productId === productId && (!variantId || item.variant?.id === variantId)
      );
    },
    [cart.items]
  );

  /**
   * Get item quantity
   */
  const getItemQuantity = useCallback(
    (productId: string, variantId?: string): number => {
      const item = cart.items.find(
        (item) =>
          item.productId === productId && (!variantId || item.variant?.id === variantId)
      );
      return item?.quantity ?? 0;
    },
    [cart.items]
  );

  /**
   * Get cart item
   */
  const getCartItem = useCallback(
    (productId: string, variantId?: string): B2BCartItem | undefined => {
      return cart.items.find(
        (item) =>
          item.productId === productId && (!variantId || item.variant?.id === variantId)
      );
    },
    [cart.items]
  );

  /**
   * Apply promo code
   */
  const applyPromoCode = useCallback(async (code: string): Promise<boolean> => {
    // In production, this would validate the code via API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate promo code validation
    const validCodes: Record<string, number> = {
      BIENVENUE10: 10,
      PRO20: 20,
      VIP15: 15,
    };

    const discountPercent = validCodes[code.toUpperCase()];
    if (!discountPercent) {
      return false;
    }

    setCart((prevCart) => {
      const promoDiscount = (prevCart.subtotalHT * discountPercent) / 100;
      const totals = calculateCartTotals(prevCart.items, promoDiscount);

      return {
        ...prevCart,
        ...totals,
        promoCode: code.toUpperCase(),
        promoDiscount,
        lastUpdated: new Date().toISOString(),
      };
    });

    return true;
  }, []);

  /**
   * Remove promo code
   */
  const removePromoCode = useCallback(() => {
    setCart((prevCart) => {
      const totals = calculateCartTotals(prevCart.items, 0);

      return {
        ...prevCart,
        ...totals,
        promoCode: undefined,
        promoDiscount: undefined,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  /**
   * Save current cart
   */
  const saveCurrentCart = useCallback(
    (name: string): SavedCart => {
      const savedCart: SavedCart = {
        id: `saved_${Date.now()}`,
        name,
        items: cart.items,
        itemCount: cart.itemCount,
        totalHT: cart.totalHT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSavedCarts((prev) => [...prev, savedCart]);
      return savedCart;
    },
    [cart.items, cart.itemCount, cart.totalHT]
  );

  /**
   * Load saved cart
   */
  const loadSavedCart = useCallback((cartId: string) => {
    setSavedCarts((prevSavedCarts) => {
      const savedCart = prevSavedCarts.find((c) => c.id === cartId);
      if (!savedCart) return prevSavedCarts;

      const totals = calculateCartTotals(savedCart.items, 0);

      setCart({
        ...initialCartState,
        id: generateCartId(),
        items: savedCart.items,
        ...totals,
        lastUpdated: new Date().toISOString(),
        expiresAt: getExpiryDate(),
      });

      return prevSavedCarts;
    });
  }, []);

  /**
   * Delete saved cart
   */
  const deleteSavedCart = useCallback((cartId: string) => {
    setSavedCarts((prev) => prev.filter((c) => c.id !== cartId));
  }, []);

  /**
   * Share saved cart (generate link)
   */
  const shareSavedCart = useCallback(
    (cartId: string): string => {
      const savedCart = savedCarts.find((c) => c.id === cartId);
      if (!savedCart) return '';

      // In production, this would generate a shareable link via API
      const shareToken = btoa(JSON.stringify({ id: cartId, items: savedCart.items.length }));
      const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/panier/partage/${shareToken}`;

      setSavedCarts((prev) =>
        prev.map((c) =>
          c.id === cartId ? { ...c, sharedLink: shareLink, updatedAt: new Date().toISOString() } : c
        )
      );

      return shareLink;
    },
    [savedCarts]
  );

  /**
   * Set selected warehouse
   */
  const setSelectedWarehouse = useCallback((warehouseId: string) => {
    setCart((prevCart) => ({
      ...prevCart,
      selectedWarehouseId: warehouseId,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Memoize context value
  const contextValue = useMemo<CartContextType>(
    () => ({
      // State
      cart,
      isLoading,
      isValidatingStock,
      stockValidationErrors,

      // Drawer
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,

      // Operations
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItemNotes,
      updateItemWarehouse,
      clearCart,

      // Queries
      isInCart,
      getItemQuantity,
      getCartItem,

      // Stock validation
      validateStock,
      validateSingleItem,

      // Promo codes
      applyPromoCode,
      removePromoCode,

      // Saved carts
      savedCarts,
      saveCurrentCart,
      loadSavedCart,
      deleteSavedCart,
      shareSavedCart,

      // Warehouse
      setSelectedWarehouse,
    }),
    [
      cart,
      isLoading,
      isValidatingStock,
      stockValidationErrors,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItemNotes,
      updateItemWarehouse,
      clearCart,
      isInCart,
      getItemQuantity,
      getCartItem,
      validateStock,
      validateSingleItem,
      applyPromoCode,
      removePromoCode,
      savedCarts,
      saveCurrentCart,
      loadSavedCart,
      deleteSavedCart,
      shareSavedCart,
      setSelectedWarehouse,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access cart context
 * @throws Error if used outside of CartProvider
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart doit etre utilise dans un CartProvider');
  }

  return context;
}

/**
 * Hook for cart item operations
 */
export function useCartItem(productId: string, variantId?: string) {
  const { getCartItem, getItemQuantity, isInCart, updateQuantity, removeFromCart } = useCart();

  const item = getCartItem(productId, variantId);
  const quantity = getItemQuantity(productId, variantId);
  const inCart = isInCart(productId, variantId);

  return {
    item,
    quantity,
    inCart,
    updateQuantity: (qty: number) => updateQuantity(productId, qty, variantId),
    remove: () => removeFromCart(productId, variantId),
  };
}

/**
 * Hook for cart totals
 */
export function useCartTotals() {
  const { cart } = useCart();

  return {
    itemCount: cart.itemCount,
    totalQuantity: cart.totalQuantity,
    subtotalHT: cart.subtotalHT,
    subtotalTTC: cart.subtotalTTC,
    totalDiscountHT: cart.totalDiscountHT,
    taxAmount: cart.taxAmount,
    totalHT: cart.totalHT,
    totalTTC: cart.totalTTC,
    discounts: cart.discounts,
    hasPromo: !!cart.promoCode,
    promoCode: cart.promoCode,
  };
}

// Export storage key for potential external use
export { CART_STORAGE_KEY, SAVED_CARTS_STORAGE_KEY };
