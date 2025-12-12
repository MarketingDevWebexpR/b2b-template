'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Cart, CartItem, Product } from '@/types';

// Local storage key for cart persistence
const CART_STORAGE_KEY = 'bijoux-cart';

/**
 * Cart Context Type
 * Defines all cart operations and state
 */
interface CartContextType {
  /** Current cart state */
  cart: Cart;
  /** Whether cart is being loaded from storage */
  isLoading: boolean;
  /** Add a product to cart (or increase quantity if already exists) */
  addToCart: (product: Product, quantity?: number) => void;
  /** Remove a product completely from cart */
  removeFromCart: (productId: string) => void;
  /** Update quantity of a specific item */
  updateQuantity: (productId: string, quantity: number) => void;
  /** Clear all items from cart */
  clearCart: () => void;
  /** Check if a product is in cart */
  isInCart: (productId: string) => boolean;
  /** Get quantity of a specific product in cart */
  getItemQuantity: (productId: string) => number;
}

/**
 * Initial empty cart state
 */
const initialCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

/**
 * Create the Cart Context
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Calculate cart totals from items
 */
function calculateCartTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  return items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      totalPrice: acc.totalPrice + item.product.price * item.quantity,
    }),
    { totalItems: 0, totalPrice: 0 }
  );
}

/**
 * Load cart from localStorage
 */
function loadCartFromStorage(): Cart {
  if (typeof window === 'undefined') {
    return initialCart;
  }

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      return initialCart;
    }

    const parsed = JSON.parse(storedCart) as Cart;

    // Validate cart structure
    if (!parsed.items || !Array.isArray(parsed.items)) {
      return initialCart;
    }

    // Recalculate totals to ensure data integrity
    const totals = calculateCartTotals(parsed.items);

    return {
      items: parsed.items,
      ...totals,
    };
  } catch (error) {
    console.error('Erreur lors du chargement du panier:', error);
    return initialCart;
  }
}

/**
 * Save cart to localStorage
 */
function saveCartToStorage(cart: Cart): void {
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
 * Cart Provider Component
 * Manages cart state and provides cart operations to children
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = loadCartFromStorage();
    setCart(storedCart);
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage(cart);
    }
  }, [cart, isLoading]);

  /**
   * Add product to cart
   * If product already exists, increase quantity
   */
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (quantity < 1) return;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.product.id === product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex > -1) {
        // Product exists, update quantity
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // New product, add to cart
        newItems = [...prevCart.items, { product, quantity }];
      }

      const totals = calculateCartTotals(newItems);

      return {
        items: newItems,
        ...totals,
      };
    });
  }, []);

  /**
   * Remove product from cart completely
   */
  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) => item.product.id !== productId
      );

      const totals = calculateCartTotals(newItems);

      return {
        items: newItems,
        ...totals,
      };
    });
  }, []);

  /**
   * Update quantity of a specific item
   * If quantity is 0 or less, remove the item
   */
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );

      const totals = calculateCartTotals(newItems);

      return {
        items: newItems,
        ...totals,
      };
    });
  }, [removeFromCart]);

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setCart(initialCart);
  }, []);

  /**
   * Check if a product is in cart
   */
  const isInCart = useCallback(
    (productId: string): boolean => {
      return cart.items.some((item) => item.product.id === productId);
    },
    [cart.items]
  );

  /**
   * Get quantity of a specific product in cart
   */
  const getItemQuantity = useCallback(
    (productId: string): number => {
      const item = cart.items.find((item) => item.product.id === productId);
      return item?.quantity ?? 0;
    },
    [cart.items]
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<CartContextType>(
    () => ({
      cart,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
    }),
    [
      cart,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart context
 * Must be used within a CartProvider
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart doit etre utilise dans un CartProvider');
  }

  return context;
}

/**
 * Export cart storage key for potential external use
 */
export { CART_STORAGE_KEY };
