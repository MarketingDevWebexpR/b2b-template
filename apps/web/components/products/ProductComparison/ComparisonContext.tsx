'use client';

/**
 * ComparisonContext - Product Comparison State Management
 *
 * Manages the comparison list with:
 * - Maximum 4 products
 * - localStorage persistence
 * - Add/remove/clear operations
 * - Modal/drawer state control
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
import type { Product } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const COMPARISON_STORAGE_KEY = 'bijoux-b2b-comparison';
const MAX_COMPARISON_ITEMS = 4;

// ============================================================================
// Types
// ============================================================================

/**
 * Comparison state
 */
export interface ComparisonState {
  /** Products being compared */
  products: Product[];
  /** Timestamp of last update */
  lastUpdated: string;
}

/**
 * Comparison context type
 */
export interface ComparisonContextType {
  // State
  products: Product[];
  count: number;
  isAtLimit: boolean;
  isModalOpen: boolean;
  isDrawerVisible: boolean;

  // Actions
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  toggleCompare: (product: Product) => boolean;

  // Modal/Drawer controls
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialComparisonState: ComparisonState = {
  products: [],
  lastUpdated: new Date().toISOString(),
};

// ============================================================================
// Context
// ============================================================================

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load comparison from localStorage
 */
function loadComparisonFromStorage(): ComparisonState {
  if (typeof window === 'undefined') {
    return initialComparisonState;
  }

  try {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (!stored) {
      return initialComparisonState;
    }

    const parsed = JSON.parse(stored) as ComparisonState;

    // Validate structure
    if (!parsed.products || !Array.isArray(parsed.products)) {
      return initialComparisonState;
    }

    // Ensure max limit
    if (parsed.products.length > MAX_COMPARISON_ITEMS) {
      parsed.products = parsed.products.slice(0, MAX_COMPARISON_ITEMS);
    }

    return parsed;
  } catch (error) {
    console.error('Erreur lors du chargement de la comparaison:', error);
    return initialComparisonState;
  }
}

/**
 * Save comparison to localStorage
 */
function saveComparisonToStorage(state: ComparisonState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la comparaison:', error);
  }
}

// ============================================================================
// Provider Component
// ============================================================================

export interface ComparisonProviderProps {
  children: ReactNode;
}

export function ComparisonProvider({ children }: ComparisonProviderProps) {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadComparisonFromStorage();
    setProducts(stored.products);
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    if (!isLoading) {
      saveComparisonToStorage({
        products,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [products, isLoading]);

  // Computed values
  const count = products.length;
  const isAtLimit = count >= MAX_COMPARISON_ITEMS;
  const isDrawerVisible = count > 0;

  /**
   * Check if product is in comparison
   */
  const isInComparison = useCallback(
    (productId: string): boolean => {
      return products.some((p) => p.id === productId);
    },
    [products]
  );

  /**
   * Add product to comparison
   * Returns false if at limit or already in comparison
   */
  const addToCompare = useCallback(
    (product: Product): boolean => {
      if (isAtLimit) {
        return false;
      }

      if (isInComparison(product.id)) {
        return false;
      }

      setProducts((prev) => [...prev, product]);
      return true;
    },
    [isAtLimit, isInComparison]
  );

  /**
   * Remove product from comparison
   */
  const removeFromCompare = useCallback((productId: string): void => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  /**
   * Clear all products from comparison
   */
  const clearComparison = useCallback((): void => {
    setProducts([]);
    setIsModalOpen(false);
  }, []);

  /**
   * Toggle product in comparison
   * Returns true if product was added, false if removed or at limit
   */
  const toggleCompare = useCallback(
    (product: Product): boolean => {
      if (isInComparison(product.id)) {
        removeFromCompare(product.id);
        return false;
      }
      return addToCompare(product);
    },
    [isInComparison, removeFromCompare, addToCompare]
  );

  // Modal controls
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);

  // Memoize context value
  const contextValue = useMemo<ComparisonContextType>(
    () => ({
      // State
      products,
      count,
      isAtLimit,
      isModalOpen,
      isDrawerVisible,

      // Actions
      addToCompare,
      removeFromCompare,
      clearComparison,
      isInComparison,
      toggleCompare,

      // Modal controls
      openModal,
      closeModal,
      toggleModal,
    }),
    [
      products,
      count,
      isAtLimit,
      isModalOpen,
      isDrawerVisible,
      addToCompare,
      removeFromCompare,
      clearComparison,
      isInComparison,
      toggleCompare,
      openModal,
      closeModal,
      toggleModal,
    ]
  );

  return (
    <ComparisonContext.Provider value={contextValue}>
      {children}
    </ComparisonContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access comparison context
 * @throws Error if used outside of ComparisonProvider
 */
export function useComparison(): ComparisonContextType {
  const context = useContext(ComparisonContext);

  if (context === undefined) {
    throw new Error('useComparison doit etre utilise dans un ComparisonProvider');
  }

  return context;
}

/**
 * Hook for single product comparison status
 */
export function useProductComparison(productId: string) {
  const { isInComparison, toggleCompare, isAtLimit, products } = useComparison();

  const isComparing = isInComparison(productId);
  const product = products.find((p) => p.id === productId);

  return {
    isComparing,
    product,
    canAdd: !isComparing && !isAtLimit,
    toggle: (product: Product) => toggleCompare(product),
  };
}

// Export constants
export { COMPARISON_STORAGE_KEY, MAX_COMPARISON_ITEMS };
