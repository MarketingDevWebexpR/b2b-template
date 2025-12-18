'use client';

/**
 * MegaMenu Component
 *
 * 5-level desktop navigation with hierarchical category structure.
 * Features a static NavBar with Catalogue, Promotions, Nouveautes, Contact links.
 * The Catalogue button opens the MegaMenu dropdown.
 *
 * Structure:
 * - NavBar: Static horizontal nav with Catalogue trigger + other links + phone
 * - Level 1: Left sidebar in dropdown (L1Sidebar)
 * - Level 2: Secondary sidebar (CategorySidebar)
 * - Level 3: Main content grid (CategoryGrid)
 * - Levels 4-5: Nested lists within L3 sections
 *
 * Features:
 * - 150ms hover delay to prevent flicker
 * - useTransition for smooth state updates
 * - Full keyboard navigation (Arrow keys, Enter, Escape)
 * - ARIA labels and roles for accessibility
 * - Framer Motion animations
 * - Prefetch on hover for faster navigation
 * - Variable depth support (2-5 levels)
 */

import {
  memo,
  useState,
  useCallback,
  useRef,
  useEffect,
  useTransition,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NavBar, CATALOGUE_ID, MARQUES_ID } from './NavBar';
import { DropdownPanel } from './DropdownPanel';
import { BrandsPanel } from './BrandsPanel';
import { useCategories } from './useCategories';
import type { CategoryLevel1, CategoryLevel2 } from './types';

/** Active panel type */
type ActivePanel = 'catalogue' | 'marques' | null;

export interface MegaMenuProps {
  /** Override categories from useCategories hook */
  categories?: CategoryLevel1[];
  /** Hover delay in milliseconds (default: 150) */
  hoverDelay?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MegaMenu is the main navigation component for desktop.
 * It manages state for all 5 levels of category navigation.
 *
 * @example
 * // Basic usage with hook data
 * <MegaMenu />
 *
 * @example
 * // With custom categories
 * <MegaMenu categories={customCategories} hoverDelay={200} />
 */
export const MegaMenu = memo(function MegaMenu({
  categories: propCategories,
  hoverDelay = 150,
  className,
}: MegaMenuProps) {
  // Fetch categories from hook or use props
  const { categories: hookCategories, isLoading } = useCategories();
  const categories = propCategories || hookCategories;

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [activeL1, setActiveL1] = useState<string | null>(null);
  const [activeL2, setActiveL2] = useState<string | null>(null);

  // useTransition for smooth state updates
  const [, startTransition] = useTransition();

  // Refs for hover delay management
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Helper function to open the Catalogue panel
   */
  const openCataloguePanel = useCallback(() => {
    setIsOpen(true);
    setActivePanel('catalogue');
    // Auto-select first L1 category
    if (categories.length > 0) {
      const firstL1 = categories[0];
      setActiveL1(firstL1.id);
      // Auto-select first L2 if available
      if (firstL1.children && firstL1.children.length > 0) {
        setActiveL2(firstL1.children[0].id);
      } else {
        setActiveL2(null);
      }
    }
  }, [categories]);

  /**
   * Helper function to open the Marques panel
   */
  const openMarquesPanel = useCallback(() => {
    setIsOpen(true);
    setActivePanel('marques');
    setActiveL1(null);
    setActiveL2(null);
  }, []);

  /**
   * Helper function to close any panel
   */
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActivePanel(null);
    setActiveL1(null);
    setActiveL2(null);
  }, []);

  /**
   * Handle NavBar category hover - for Catalogue and Marques buttons
   */
  const handleNavHover = useCallback(
    (categoryId: string | null) => {
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      // Clear any pending open timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      if (categoryId === null) {
        // Delay close to prevent flicker when moving between nav and dropdown
        closeTimeoutRef.current = setTimeout(() => {
          startTransition(() => {
            closeMenu();
          });
        }, hoverDelay);
      } else if (categoryId === CATALOGUE_ID) {
        // Open catalogue panel on hover with delay
        hoverTimeoutRef.current = setTimeout(() => {
          startTransition(() => {
            openCataloguePanel();
          });
        }, isOpen ? 0 : hoverDelay);
      } else if (categoryId === MARQUES_ID) {
        // Open marques panel on hover with delay
        hoverTimeoutRef.current = setTimeout(() => {
          startTransition(() => {
            openMarquesPanel();
          });
        }, isOpen ? 0 : hoverDelay);
      }
    },
    [hoverDelay, isOpen, openCataloguePanel, openMarquesPanel, closeMenu]
  );

  /**
   * Handle NavBar category click - for Catalogue and Marques button toggle
   */
  const handleNavClick = useCallback(
    (categoryId: string) => {
      if (categoryId === CATALOGUE_ID) {
        startTransition(() => {
          if (isOpen && activePanel === 'catalogue') {
            closeMenu();
          } else {
            openCataloguePanel();
          }
        });
      } else if (categoryId === MARQUES_ID) {
        startTransition(() => {
          if (isOpen && activePanel === 'marques') {
            closeMenu();
          } else {
            openMarquesPanel();
          }
        });
      }
    },
    [isOpen, activePanel, openCataloguePanel, openMarquesPanel, closeMenu]
  );

  /**
   * Handle L1 category hover with delay (in dropdown panel)
   */
  const handleL1Hover = useCallback(
    (categoryId: string | null) => {
      // Clear any pending timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      if (categoryId === null) {
        return; // Don't close on mouse leave, only on explicit close
      }

      // Delay the selection change for smooth UX
      hoverTimeoutRef.current = setTimeout(() => {
        startTransition(() => {
          setActiveL1(categoryId);
          // Auto-select first L2 if available
          const category = categories.find((cat) => cat.id === categoryId);
          if (category?.children && category.children.length > 0) {
            setActiveL2(category.children[0].id);
          } else {
            setActiveL2(null);
          }
        });
      }, activeL1 ? 0 : hoverDelay); // No delay if already has selection
    },
    [categories, hoverDelay, activeL1]
  );

  /**
   * Handle L1 category click (in dropdown panel)
   */
  const handleL1Click = useCallback((category: CategoryLevel1) => {
    startTransition(() => {
      setActiveL1(category.id);
      // Auto-select first L2 if available
      if (category.children && category.children.length > 0) {
        setActiveL2(category.children[0].id);
      } else {
        setActiveL2(null);
      }
    });
  }, []);

  /**
   * Handle L2 category hover with delay
   */
  const handleL2Hover = useCallback((categoryId: string | null) => {
    if (categoryId !== null) {
      startTransition(() => {
        setActiveL2(categoryId);
      });
    }
  }, []);

  /**
   * Handle L2 category click
   */
  const handleL2Click = useCallback((category: CategoryLevel2) => {
    startTransition(() => {
      setActiveL2(category.id);
    });
  }, []);

  /**
   * Handle panel mouse enter (cancel close timeout)
   */
  const handlePanelMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  /**
   * Handle panel mouse leave (start close timeout)
   */
  const handlePanelMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      startTransition(() => {
        closeMenu();
      });
    }, hoverDelay);
  }, [hoverDelay, closeMenu]);

  /**
   * Close the menu
   */
  const handleClose = useCallback(() => {
    startTransition(() => {
      closeMenu();
    });
  }, [closeMenu]);

  // Loading state
  if (isLoading) {
    return (
      <nav
        className={cn('relative', className)}
        aria-label="Navigation principale"
      >
        <div className="bg-white border-b border-neutral-200">
          <div className="flex items-center gap-4 max-w-7xl mx-auto px-4 py-3">
            {/* Skeleton loaders for nav items */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2">
                <div className="w-4 h-4 bg-neutral-200 rounded animate-pulse" />
                <div className="w-20 h-4 bg-neutral-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      className={cn('relative', className)}
      aria-label="Navigation principale"
    >
      {/* Static NavBar with Catalogue button + Marques button + links + phone */}
      <NavBar
        categories={categories}
        activeCategory={isOpen ? (activePanel === 'catalogue' ? CATALOGUE_ID : MARQUES_ID) : null}
        onCategoryHover={handleNavHover}
        onCategoryClick={handleNavClick}
        isDropdownOpen={isOpen}
        activePanel={activePanel}
      />

      {/* Dropdown Panels */}
      <AnimatePresence mode="wait">
        {/* Catalogue Panel (Levels 1-5) */}
        {isOpen && activePanel === 'catalogue' && (
          <DropdownPanel
            isOpen={isOpen}
            categories={categories}
            activeL1={activeL1}
            onL1Hover={handleL1Hover}
            onL1Click={handleL1Click}
            activeL2={activeL2}
            onL2Hover={handleL2Hover}
            onL2Click={handleL2Click}
            onClose={handleClose}
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handlePanelMouseLeave}
          />
        )}

        {/* Marques Panel */}
        {isOpen && activePanel === 'marques' && (
          <BrandsPanel
            isOpen={isOpen}
            onClose={handleClose}
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handlePanelMouseLeave}
          />
        )}
      </AnimatePresence>
    </nav>
  );
});

MegaMenu.displayName = 'MegaMenu';

// Named exports for individual components
export { NavBar, CATALOGUE_ID, MARQUES_ID } from './NavBar';
export { CatalogueTrigger } from './CatalogueTrigger';
export { DropdownPanel } from './DropdownPanel';
export { CategorySidebar } from './CategorySidebar';
export { CategoryGrid } from './CategoryGrid';
export { CategoryIcon } from './CategoryIcon';
export { useCategories } from './useCategories';
export { useBrands } from './useBrands';
export {
  BrandsPanel,
  BrandCard,
  FavoritesBrandsGrid,
  BrandsAlphabetNav,
  BrandsAlphabetList,
  BrandListItem,
  BrandsPanelSkeleton,
} from './BrandsPanel';
export type {
  CategoryLevel1,
  CategoryLevel2,
  CategoryLevel3,
  CategoryLevel4,
  CategoryLevel5,
  Category,
  FeaturedProduct,
  MegaMenuState,
  IconName,
} from './types';
export type { BrandsPanelProps } from './BrandsPanel';
export type { UseBrandsReturn, UseBrandsOptions } from './useBrands';

export default MegaMenu;
