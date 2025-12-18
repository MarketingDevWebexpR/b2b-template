'use client';

/**
 * Mobile Menu Context
 *
 * Manages mobile navigation drawer state with support for 5-level
 * category navigation using a stacked panel approach.
 *
 * Features:
 * - Open/close state management
 * - Navigation stack for category hierarchy
 * - Breadcrumb trail support
 * - Push/pop category navigation
 * - Reset navigation to root
 *
 * @packageDocumentation
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Navigation stack item representing a category level
 */
export interface NavigationStackItem {
  /** Unique category identifier */
  categoryId: string;
  /** Display name for breadcrumb */
  name: string;
  /** Optional icon identifier for L1-L2 categories */
  icon?: string;
  /** Optional URL slug for the category */
  slug?: string;
}

/**
 * Mobile Menu Context state and actions
 */
export interface MobileMenuContextType {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Navigation stack representing current path through categories */
  navigationStack: NavigationStackItem[];
  /** Current navigation depth (0 = root, 1-5 = category levels) */
  currentLevel: number;
  /** Current category being viewed (last item in stack) */
  currentCategory: NavigationStackItem | null;

  /** Open the mobile menu drawer */
  openMenu: () => void;
  /** Close the mobile menu drawer */
  closeMenu: () => void;
  /** Toggle the mobile menu drawer */
  toggleMenu: () => void;

  /** Push a new category onto the navigation stack */
  pushCategory: (categoryId: string, name: string, icon?: string, slug?: string) => void;
  /** Pop the last category from the navigation stack (go back one level) */
  popCategory: () => void;
  /** Navigate to a specific level in the stack (for breadcrumb jumps) */
  navigateToLevel: (level: number) => void;
  /** Reset navigation to root level */
  resetNavigation: () => void;

  /** Check if we can go back (stack has items) */
  canGoBack: boolean;
  /** Check if we're at maximum depth (5 levels) */
  isAtMaxDepth: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_NAVIGATION_DEPTH = 5;

// ============================================================================
// Context
// ============================================================================

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export interface MobileMenuProviderProps {
  children: ReactNode;
}

/**
 * Provider component for mobile menu context.
 *
 * Wrap your app or layout with this provider to enable mobile navigation.
 *
 * @example
 * ```tsx
 * <MobileMenuProvider>
 *   <Header />
 *   <MobileDrawer />
 *   <main>{children}</main>
 * </MobileMenuProvider>
 * ```
 */
export function MobileMenuProvider({ children }: MobileMenuProviderProps) {
  // Drawer open/close state
  const [isOpen, setIsOpen] = useState(false);

  // Navigation stack state
  const [navigationStack, setNavigationStack] = useState<NavigationStackItem[]>([]);

  // ============================================================================
  // Drawer Controls
  // ============================================================================

  const openMenu = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    // Reset navigation after close animation completes
    setTimeout(() => {
      setNavigationStack([]);
    }, 300);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        // Closing - reset navigation after animation
        setTimeout(() => {
          setNavigationStack([]);
        }, 300);
      }
      return !prev;
    });
  }, []);

  // ============================================================================
  // Navigation Controls
  // ============================================================================

  const pushCategory = useCallback(
    (categoryId: string, name: string, icon?: string, slug?: string) => {
      setNavigationStack((prev) => {
        // Prevent exceeding max depth
        if (prev.length >= MAX_NAVIGATION_DEPTH) {
          console.warn(`Maximum navigation depth (${MAX_NAVIGATION_DEPTH}) reached`);
          return prev;
        }

        // Prevent duplicate entries
        if (prev.some((item) => item.categoryId === categoryId)) {
          return prev;
        }

        return [...prev, { categoryId, name, icon, slug }];
      });
    },
    []
  );

  const popCategory = useCallback(() => {
    setNavigationStack((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  }, []);

  const navigateToLevel = useCallback((level: number) => {
    setNavigationStack((prev) => {
      // Level 0 means root (empty stack)
      if (level <= 0) return [];

      // Clamp to valid range
      const targetLevel = Math.min(level, prev.length);
      return prev.slice(0, targetLevel);
    });
  }, []);

  const resetNavigation = useCallback(() => {
    setNavigationStack([]);
  }, []);

  // ============================================================================
  // Derived State
  // ============================================================================

  const currentLevel = navigationStack.length;
  const currentCategory = navigationStack.length > 0
    ? navigationStack[navigationStack.length - 1]
    : null;
  const canGoBack = navigationStack.length > 0;
  const isAtMaxDepth = navigationStack.length >= MAX_NAVIGATION_DEPTH;

  // ============================================================================
  // Memoized Context Value
  // ============================================================================

  const contextValue = useMemo<MobileMenuContextType>(
    () => ({
      // State
      isOpen,
      navigationStack,
      currentLevel,
      currentCategory,

      // Drawer controls
      openMenu,
      closeMenu,
      toggleMenu,

      // Navigation controls
      pushCategory,
      popCategory,
      navigateToLevel,
      resetNavigation,

      // Derived state
      canGoBack,
      isAtMaxDepth,
    }),
    [
      isOpen,
      navigationStack,
      currentLevel,
      currentCategory,
      openMenu,
      closeMenu,
      toggleMenu,
      pushCategory,
      popCategory,
      navigateToLevel,
      resetNavigation,
      canGoBack,
      isAtMaxDepth,
    ]
  );

  return (
    <MobileMenuContext.Provider value={contextValue}>
      {children}
    </MobileMenuContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access mobile menu context.
 *
 * @throws Error if used outside of MobileMenuProvider
 *
 * @example
 * ```tsx
 * const { isOpen, openMenu, pushCategory } = useMobileMenu();
 *
 * // Open the menu
 * <button onClick={openMenu}>Menu</button>
 *
 * // Navigate to a category
 * <button onClick={() => pushCategory('rings', 'Bagues', 'ring')}>
 *   Bagues
 * </button>
 * ```
 */
export function useMobileMenu(): MobileMenuContextType {
  const context = useContext(MobileMenuContext);

  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }

  return context;
}

/**
 * Hook for navigation stack operations only.
 * Useful for components that only need navigation without drawer controls.
 */
export function useMobileMenuNavigation() {
  const {
    navigationStack,
    currentLevel,
    currentCategory,
    pushCategory,
    popCategory,
    navigateToLevel,
    resetNavigation,
    canGoBack,
    isAtMaxDepth,
  } = useMobileMenu();

  return {
    navigationStack,
    currentLevel,
    currentCategory,
    pushCategory,
    popCategory,
    navigateToLevel,
    resetNavigation,
    canGoBack,
    isAtMaxDepth,
  };
}

/**
 * Hook for drawer open/close state only.
 * Useful for trigger buttons and overlay controls.
 */
export function useMobileMenuDrawer() {
  const { isOpen, openMenu, closeMenu, toggleMenu } = useMobileMenu();

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}

export { MAX_NAVIGATION_DEPTH };
