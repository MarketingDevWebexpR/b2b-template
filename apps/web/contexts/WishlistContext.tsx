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
import type { Wishlist, WishlistItem, Product } from '@/types';

// Local storage key for wishlist persistence
const WISHLIST_STORAGE_KEY = 'bijoux-wishlist';

/**
 * Wishlist Context Type
 * Defines all wishlist operations and state
 */
interface WishlistContextType {
  /** Current wishlist state */
  wishlist: Wishlist;
  /** Whether wishlist is being loaded from storage */
  isLoading: boolean;
  /** Add a product to wishlist */
  addToWishlist: (product: Product) => void;
  /** Remove a product from wishlist */
  removeFromWishlist: (productId: string) => void;
  /** Toggle a product in wishlist (add if not present, remove if present) */
  toggleWishlist: (product: Product) => void;
  /** Clear all items from wishlist */
  clearWishlist: () => void;
  /** Check if a product is in wishlist */
  isInWishlist: (productId: string) => boolean;
  /** Get a specific wishlist item by product ID */
  getWishlistItem: (productId: string) => WishlistItem | undefined;
}

/**
 * Initial empty wishlist state
 */
const initialWishlist: Wishlist = {
  items: [],
  totalItems: 0,
};

/**
 * Create the Wishlist Context
 */
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

/**
 * Load wishlist from localStorage
 */
function loadWishlistFromStorage(): Wishlist {
  if (typeof window === 'undefined') {
    return initialWishlist;
  }

  try {
    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!storedWishlist) {
      return initialWishlist;
    }

    const parsed = JSON.parse(storedWishlist) as Wishlist;

    // Validate wishlist structure
    if (!parsed.items || !Array.isArray(parsed.items)) {
      return initialWishlist;
    }

    // Recalculate totals to ensure data integrity
    return {
      items: parsed.items,
      totalItems: parsed.items.length,
    };
  } catch (error) {
    console.error('Erreur lors du chargement de la wishlist:', error);
    return initialWishlist;
  }
}

/**
 * Save wishlist to localStorage
 */
function saveWishlistToStorage(wishlist: Wishlist): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la wishlist:', error);
  }
}

/**
 * Wishlist Provider Component
 * Manages wishlist state and provides wishlist operations to children
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist>(initialWishlist);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = loadWishlistFromStorage();
    setWishlist(storedWishlist);
    setIsLoading(false);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveWishlistToStorage(wishlist);
    }
  }, [wishlist, isLoading]);

  /**
   * Add product to wishlist
   * If product already exists, does nothing
   */
  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prevWishlist) => {
      // Check if product already in wishlist
      const exists = prevWishlist.items.some(
        (item) => item.product.id === product.id
      );

      if (exists) {
        return prevWishlist;
      }

      // Add new item with timestamp
      const newItem: WishlistItem = {
        product,
        addedAt: new Date().toISOString(),
      };

      const newItems = [...prevWishlist.items, newItem];

      return {
        items: newItems,
        totalItems: newItems.length,
      };
    });
  }, []);

  /**
   * Remove product from wishlist
   */
  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prevWishlist) => {
      const newItems = prevWishlist.items.filter(
        (item) => item.product.id !== productId
      );

      return {
        items: newItems,
        totalItems: newItems.length,
      };
    });
  }, []);

  /**
   * Toggle product in wishlist
   * Add if not present, remove if present
   */
  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prevWishlist) => {
      const existingIndex = prevWishlist.items.findIndex(
        (item) => item.product.id === product.id
      );

      let newItems: WishlistItem[];

      if (existingIndex > -1) {
        // Product exists, remove it
        newItems = prevWishlist.items.filter(
          (item) => item.product.id !== product.id
        );
      } else {
        // Product doesn't exist, add it
        const newItem: WishlistItem = {
          product,
          addedAt: new Date().toISOString(),
        };
        newItems = [...prevWishlist.items, newItem];
      }

      return {
        items: newItems,
        totalItems: newItems.length,
      };
    });
  }, []);

  /**
   * Clear all items from wishlist
   */
  const clearWishlist = useCallback(() => {
    setWishlist(initialWishlist);
  }, []);

  /**
   * Check if a product is in wishlist
   */
  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlist.items.some((item) => item.product.id === productId);
    },
    [wishlist.items]
  );

  /**
   * Get a specific wishlist item by product ID
   */
  const getWishlistItem = useCallback(
    (productId: string): WishlistItem | undefined => {
      return wishlist.items.find((item) => item.product.id === productId);
    },
    [wishlist.items]
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<WishlistContextType>(
    () => ({
      wishlist,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
      isInWishlist,
      getWishlistItem,
    }),
    [
      wishlist,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
      isInWishlist,
      getWishlistItem,
    ]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

/**
 * Hook to access wishlist context
 * Must be used within a WishlistProvider
 */
export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);

  if (context === undefined) {
    throw new Error('useWishlist doit etre utilise dans un WishlistProvider');
  }

  return context;
}

/**
 * Export wishlist storage key for potential external use
 */
export { WISHLIST_STORAGE_KEY };
