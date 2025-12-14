import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Wishlist, WishlistItem, Product } from '@bijoux/types';

interface WishlistContextType {
  wishlist: Wishlist;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistItem: (productId: string) => WishlistItem | undefined;
}

const initialWishlist: Wishlist = {
  items: [],
  totalItems: 0,
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = '@bijoux/wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist>(initialWishlist);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from AsyncStorage on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const savedWishlist = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadWishlist();
  }, []);

  // Save wishlist to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist)).catch((error) =>
        console.error('Error saving wishlist:', error)
      );
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.items.some((item) => item.product.id === product.id);
      if (exists) return prev;

      const newItem: WishlistItem = {
        product,
        addedAt: new Date().toISOString(),
      };
      const newItems = [...prev.items, newItem];

      return {
        items: newItems,
        totalItems: newItems.length,
      };
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newItems = prev.items.filter((item) => item.product.id !== productId);
      return {
        items: newItems,
        totalItems: newItems.length,
      };
    });
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => setWishlist(initialWishlist);

  const isInWishlist = (productId: string) =>
    wishlist.items.some((item) => item.product.id === productId);

  const getWishlistItem = (productId: string) =>
    wishlist.items.find((item) => item.product.id === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
