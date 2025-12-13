import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Cart, CartItem, Product } from '@bijoux/types';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const initialCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@bijoux/cart';

function calculateCartTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  return items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      totalPrice: acc.totalPrice + item.product.price * item.quantity,
    }),
    { totalItems: 0, totalPrice: 0 }
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch((error) =>
        console.error('Error saving cart:', error)
      );
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (quantity < 1) return;

    setCart((prev) => {
      const existingIndex = prev.items.findIndex((item) => item.product.id === product.id);
      let newItems: CartItem[];

      if (existingIndex > -1) {
        newItems = prev.items.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newItems = [...prev.items, { product, quantity }];
      }

      return { items: newItems, ...calculateCartTotals(newItems) };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.product.id !== productId);
      return { items: newItems, ...calculateCartTotals(newItems) };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      return { items: newItems, ...calculateCartTotals(newItems) };
    });
  };

  const clearCart = () => setCart(initialCart);

  const isInCart = (productId: string) =>
    cart.items.some((item) => item.product.id === productId);

  const getItemQuantity = (productId: string) =>
    cart.items.find((item) => item.product.id === productId)?.quantity ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
