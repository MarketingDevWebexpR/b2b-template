'use client';

/**
 * useProductViewMode Hook
 *
 * Manages product listing view mode (grid/list/compact) with localStorage persistence.
 * Provides a standalone solution for components that don't use SearchContext.
 *
 * Features:
 * - Three view modes: grid, list, compact
 * - Persists preference to localStorage
 * - SSR-safe with hydration handling
 * - TypeScript strict mode compliant
 *
 * @packageDocumentation
 */

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Available view modes for product listings
 */
export type ProductViewMode = 'grid' | 'list' | 'compact';

/**
 * Configuration options for the hook
 */
export interface UseProductViewModeOptions {
  /** Default view mode (default: 'grid') */
  defaultMode?: ProductViewMode;
  /** localStorage key for persistence (default: 'product_view_mode') */
  storageKey?: string;
  /** Enable localStorage persistence (default: true) */
  persist?: boolean;
}

/**
 * Return type for useProductViewMode hook
 */
export interface UseProductViewModeReturn {
  /** Current view mode */
  viewMode: ProductViewMode;
  /** Set view mode */
  setViewMode: (mode: ProductViewMode) => void;
  /** Toggle between grid and list modes */
  toggleViewMode: () => void;
  /** Check if current mode is grid */
  isGrid: boolean;
  /** Check if current mode is list */
  isList: boolean;
  /** Check if current mode is compact */
  isCompact: boolean;
  /** Cycle through all view modes */
  cycleViewMode: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STORAGE_KEY = 'product_view_mode';
const DEFAULT_MODE: ProductViewMode = 'grid';
const VALID_MODES: ProductViewMode[] = ['grid', 'list', 'compact'];

// ============================================================================
// Helpers
// ============================================================================

/**
 * Validate that a value is a valid ProductViewMode
 */
function isValidViewMode(value: unknown): value is ProductViewMode {
  return typeof value === 'string' && VALID_MODES.includes(value as ProductViewMode);
}

/**
 * Safely get value from localStorage
 */
function getStoredViewMode(key: string): ProductViewMode | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(key);
    if (stored && isValidViewMode(stored)) {
      return stored;
    }
  } catch {
    // localStorage might be unavailable (e.g., private browsing)
  }

  return null;
}

/**
 * Safely set value in localStorage
 */
function setStoredViewMode(key: string, mode: ProductViewMode): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, mode);
  } catch {
    // localStorage might be unavailable
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for managing product listing view mode
 *
 * @example
 * ```tsx
 * function ProductListing() {
 *   const { viewMode, setViewMode, isGrid, isList } = useProductViewMode();
 *
 *   return (
 *     <div>
 *       <ViewModeToggle value={viewMode} onChange={setViewMode} />
 *       {isGrid && <ProductGrid products={products} />}
 *       {isList && <ProductList products={products} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProductViewMode(
  options: UseProductViewModeOptions = {}
): UseProductViewModeReturn {
  const {
    defaultMode = DEFAULT_MODE,
    storageKey = DEFAULT_STORAGE_KEY,
    persist = true,
  } = options;

  // Initialize state with default (will be updated after hydration)
  const [viewMode, setViewModeState] = useState<ProductViewMode>(defaultMode);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted value after hydration
  useEffect(() => {
    if (persist) {
      const stored = getStoredViewMode(storageKey);
      if (stored) {
        setViewModeState(stored);
      }
    }
    setIsHydrated(true);
  }, [persist, storageKey]);

  // Set view mode with optional persistence
  const setViewMode = useCallback(
    (mode: ProductViewMode) => {
      if (!isValidViewMode(mode)) {
        console.warn(`Invalid view mode: ${mode}. Using default.`);
        mode = defaultMode;
      }

      setViewModeState(mode);

      if (persist) {
        setStoredViewMode(storageKey, mode);
      }
    },
    [persist, storageKey, defaultMode]
  );

  // Toggle between grid and list
  const toggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  }, [viewMode, setViewMode]);

  // Cycle through all modes: grid -> list -> compact -> grid
  const cycleViewMode = useCallback(() => {
    const currentIndex = VALID_MODES.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % VALID_MODES.length;
    setViewMode(VALID_MODES[nextIndex]);
  }, [viewMode, setViewMode]);

  // Computed booleans
  const isGrid = viewMode === 'grid';
  const isList = viewMode === 'list';
  const isCompact = viewMode === 'compact';

  return useMemo(
    () => ({
      viewMode,
      setViewMode,
      toggleViewMode,
      isGrid,
      isList,
      isCompact,
      cycleViewMode,
    }),
    [viewMode, setViewMode, toggleViewMode, isGrid, isList, isCompact, cycleViewMode]
  );
}

// ============================================================================
// Context-based alternative (for shared state across components)
// ============================================================================

interface ProductViewModeContextValue extends UseProductViewModeReturn {}

const ProductViewModeContext = createContext<ProductViewModeContextValue | null>(null);

export interface ProductViewModeProviderProps {
  children: ReactNode;
  /** Initial view mode */
  defaultMode?: ProductViewMode;
  /** localStorage key */
  storageKey?: string;
  /** Enable persistence */
  persist?: boolean;
}

/**
 * Provider for shared view mode state
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ProductViewModeProvider defaultMode="grid">
 *       <ProductListing />
 *       <ViewModeToggle />
 *     </ProductViewModeProvider>
 *   );
 * }
 * ```
 */
export function ProductViewModeProvider({
  children,
  defaultMode,
  storageKey,
  persist,
}: ProductViewModeProviderProps) {
  const value = useProductViewMode({ defaultMode, storageKey, persist });

  return (
    <ProductViewModeContext.Provider value={value}>
      {children}
    </ProductViewModeContext.Provider>
  );
}

/**
 * Hook to access shared view mode context
 *
 * @throws Error if used outside of ProductViewModeProvider
 */
export function useProductViewModeContext(): ProductViewModeContextValue {
  const context = useContext(ProductViewModeContext);

  if (!context) {
    throw new Error(
      'useProductViewModeContext must be used within a ProductViewModeProvider'
    );
  }

  return context;
}

/**
 * Hook to optionally access view mode context (returns null if not in provider)
 */
export function useOptionalProductViewModeContext(): ProductViewModeContextValue | null {
  return useContext(ProductViewModeContext);
}

export default useProductViewMode;
