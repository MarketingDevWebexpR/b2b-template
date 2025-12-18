'use client';

import { memo, useMemo, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Gem,
  Watch,
  CircleDot,
  Sparkles,
  Heart,
  Diamond,
  Crown,
  Star,
  Package,
  Grid3X3,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import { CategoryListItem } from './CategoryListItem';

// ============================================================================
// Types
// ============================================================================

export interface CategoryData {
  /** Unique category identifier */
  id: string;
  /** Category display name */
  name: string;
  /** URL path for the category */
  href: string;
  /** Optional icon key for L1-L2 categories */
  icon?: string;
  /** Number of products in this category */
  productCount?: number;
  /** Child categories (for hierarchical navigation) */
  children?: CategoryData[];
}

export interface NavigationPanelProps {
  /** Categories to display at current level */
  categories: CategoryData[];
  /** Current navigation depth level (0-4) */
  level?: number;
  /** Optional title for the panel */
  title?: string;
  /** Optional "View All" link */
  viewAllHref?: string;
  /** Optional "View All" label */
  viewAllLabel?: string;
  /** Callback when navigating to a category page */
  onNavigate?: (href: string) => void;
  /** Animation direction (1 = forward, -1 = backward) */
  direction?: number;
  /** Whether to show animations */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<string, ReactNode> = {
  ring: <CircleDot className="w-5 h-5" />,
  necklace: <Gem className="w-5 h-5" />,
  bracelet: <Sparkles className="w-5 h-5" />,
  earring: <Heart className="w-5 h-5" />,
  watch: <Watch className="w-5 h-5" />,
  diamond: <Diamond className="w-5 h-5" />,
  crown: <Crown className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  package: <Package className="w-5 h-5" />,
  grid: <Grid3X3 className="w-5 h-5" />,
  tag: <Tag className="w-5 h-5" />,
  default: <Gem className="w-5 h-5" />,
};

function getIconForCategory(iconKey?: string): ReactNode {
  if (!iconKey) return null;
  return iconMap[iconKey] || iconMap.default;
}

// ============================================================================
// Animation Variants
// ============================================================================

const panelVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

// ============================================================================
// Component
// ============================================================================

/**
 * Navigation Panel
 *
 * Displays a scrollable list of categories for the current navigation level.
 * Supports animated entry/exit for panel transitions.
 *
 * Features:
 * - Full height scrollable content
 * - Icons on L1-L2 categories
 * - Animated slide transitions (left/right)
 * - Optional "View All" header link
 * - Connects to MobileMenuContext for navigation
 *
 * @example
 * ```tsx
 * <NavigationPanel
 *   categories={categoryData}
 *   level={1}
 *   viewAllHref="/categories/rings"
 *   viewAllLabel="Voir toutes les bagues"
 *   direction={1}
 * />
 * ```
 */
const NavigationPanel = memo(function NavigationPanel({
  categories,
  level = 0,
  title,
  viewAllHref,
  viewAllLabel,
  onNavigate,
  direction = 1,
  animate = true,
  className,
}: NavigationPanelProps) {
  const { pushCategory, closeMenu } = useMobileMenu();

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleExpand = useCallback(
    (id: string, name: string, icon?: string) => {
      pushCategory(id, name, icon);
    },
    [pushCategory]
  );

  const handleNavigate = useCallback(
    (href: string) => {
      if (onNavigate) {
        onNavigate(href);
      }
      closeMenu();
    },
    [onNavigate, closeMenu]
  );

  // ============================================================================
  // Render
  // ============================================================================

  const content = (
    <div
      className={cn(
        'flex flex-col h-full',
        'bg-white',
        className
      )}
    >
      {/* View All link at top */}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          onClick={() => handleNavigate(viewAllHref)}
          className={cn(
            'flex items-center justify-between',
            'px-4 py-4',
            'bg-accent/5 border-b border-stroke-light',
            'text-body font-semibold text-accent',
            'hover:bg-accent/10',
            'transition-colors duration-150',
            // Focus
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-inset'
          )}
        >
          <span>{viewAllLabel || `Voir tout`}</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      )}

      {/* Optional title */}
      {title && (
        <div className="px-4 py-3 border-b border-stroke-light">
          <h3 className="text-caption font-medium text-content-muted uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}

      {/* Scrollable category list */}
      <div
        className={cn(
          'flex-1 overflow-y-auto',
          'overscroll-contain',
          // Safe area padding at bottom for notched devices
          'pb-safe'
        )}
      >
        <nav aria-label={`Categories niveau ${level + 1}`}>
          <ul className="divide-y divide-stroke-light">
            {categories.map((category) => (
              <li key={category.id}>
                <CategoryListItem
                  id={category.id}
                  name={category.name}
                  href={category.href}
                  icon={getIconForCategory(category.icon)}
                  productCount={category.productCount}
                  hasChildren={category.children && category.children.length > 0}
                  level={level}
                  onExpand={(id, name) => handleExpand(id, name, category.icon)}
                  onNavigate={handleNavigate}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Empty state */}
        {categories.length === 0 && (
          <div className="flex items-center justify-center h-40 text-content-muted">
            <p>Aucune categorie disponible</p>
          </div>
        )}
      </div>
    </div>
  );

  // Wrap with animation if enabled
  if (animate) {
    return (
      <motion.div
        custom={direction}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          type: 'tween',
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className="absolute inset-0"
      >
        {content}
      </motion.div>
    );
  }

  return content;
});

// ============================================================================
// Navigation Panel Container
// ============================================================================

export interface NavigationPanelContainerProps {
  /** Root level categories */
  rootCategories: CategoryData[];
  /** Function to get children for a category ID */
  getChildCategories?: (categoryId: string) => CategoryData[];
  /** Callback when navigating to a page */
  onNavigate?: (href: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation Panel Container
 *
 * Manages the animated transitions between navigation panels
 * based on the current navigation stack.
 *
 * @example
 * ```tsx
 * <NavigationPanelContainer
 *   rootCategories={categories}
 *   getChildCategories={(id) => findCategoryById(id)?.children || []}
 *   onNavigate={(href) => router.push(href)}
 * />
 * ```
 */
const NavigationPanelContainer = memo(function NavigationPanelContainer({
  rootCategories,
  getChildCategories,
  onNavigate,
  className,
}: NavigationPanelContainerProps) {
  const { navigationStack, currentLevel, currentCategory } = useMobileMenu();

  // Determine which categories to show based on current level
  const currentCategories = useMemo(() => {
    if (currentLevel === 0) {
      return rootCategories;
    }

    if (currentCategory && getChildCategories) {
      return getChildCategories(currentCategory.categoryId);
    }

    return [];
  }, [currentLevel, currentCategory, rootCategories, getChildCategories]);

  // Get view all info from current category
  const viewAllInfo = useMemo(() => {
    if (currentLevel === 0) return null;

    // Find the current category's href
    const findCategoryHref = (
      categories: CategoryData[],
      targetId: string
    ): string | undefined => {
      for (const cat of categories) {
        if (cat.id === targetId) return cat.href;
        if (cat.children) {
          const found = findCategoryHref(cat.children, targetId);
          if (found) return found;
        }
      }
      return undefined;
    };

    const href = currentCategory
      ? findCategoryHref(rootCategories, currentCategory.categoryId)
      : undefined;

    return href
      ? {
          href,
          label: `Voir tout ${currentCategory?.name || ''}`,
        }
      : null;
  }, [currentLevel, currentCategory, rootCategories]);

  // Track direction for animation
  const direction = 1; // Always forward when pushing, handled by AnimatePresence mode

  return (
    <div className={cn('relative flex-1 overflow-hidden', className)}>
      <AnimatePresence mode="wait" custom={direction}>
        <NavigationPanel
          key={currentLevel}
          categories={currentCategories}
          level={currentLevel}
          viewAllHref={viewAllInfo?.href}
          viewAllLabel={viewAllInfo?.label}
          onNavigate={onNavigate}
          direction={direction}
        />
      </AnimatePresence>
    </div>
  );
});

export { NavigationPanel, NavigationPanelContainer, iconMap, getIconForCategory };
export default NavigationPanel;
