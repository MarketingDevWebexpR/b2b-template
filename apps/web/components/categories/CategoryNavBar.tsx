'use client';

/**
 * CategoryNavBar Component
 *
 * Compact horizontal navigation bar for category pages.
 * Combines enriched breadcrumbs with dropdown navigation and inline subcategory tags.
 *
 * Features:
 * - Enriched breadcrumbs with hover dropdowns for sibling navigation
 * - Compact inline subcategory tags
 * - Responsive design (stacks vertically on mobile)
 * - Keyboard accessible
 * - Maximum height of 120-150px
 *
 * @packageDocumentation
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronDown,
  Home,
  Grid3X3,
  Layers,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryPath } from '@/lib/categories/hierarchy';
import type { MeilisearchCategory, CategoryResponse } from '@/types/category';
import type { HierarchicalBreadcrumb } from '@/lib/categories/hierarchy';

// ============================================================================
// Types
// ============================================================================

export interface CategoryNavBarProps {
  /** Current category */
  category: MeilisearchCategory;
  /** Breadcrumb trail */
  breadcrumbs: HierarchicalBreadcrumb[];
  /** Direct subcategories of current category */
  subcategories: MeilisearchCategory[];
  /** Sibling categories for dropdown navigation */
  siblings: MeilisearchCategory[];
  /** Full categories data for sibling lookup at each level */
  categoriesData?: CategoryResponse;
  /** Total product count */
  totalProductCount?: number;
  /** Additional CSS classes */
  className?: string;
}

interface BreadcrumbDropdownProps {
  item: HierarchicalBreadcrumb;
  siblings: MeilisearchCategory[];
  isLast: boolean;
  size: 'sm' | 'md';
}

// ============================================================================
// Breadcrumb Dropdown Item
// ============================================================================

const BreadcrumbDropdown = memo(function BreadcrumbDropdown({
  item,
  siblings,
  isLast,
  size,
}: BreadcrumbDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen((prev) => !prev);
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const sizeClasses = {
    sm: {
      text: 'text-xs',
      chevron: 'w-3 h-3',
      dropdown: 'text-xs',
    },
    md: {
      text: 'text-sm',
      chevron: 'w-3.5 h-3.5',
      dropdown: 'text-sm',
    },
  };

  const config = sizeClasses[size];
  const hasSiblings = siblings.length > 0;

  // Filter out current item from siblings
  const filteredSiblings = siblings.filter((s) => s.id !== item.id);

  return (
    <div
      ref={dropdownRef}
      className="relative flex items-center"
      onMouseEnter={hasSiblings && !isLast ? handleMouseEnter : undefined}
      onMouseLeave={hasSiblings && !isLast ? handleMouseLeave : undefined}
    >
      {isLast ? (
        // Current page - no link
        <span
          className={cn(
            config.text,
            'font-semibold text-neutral-900',
            'flex items-center gap-1',
            'max-w-[180px] truncate'
          )}
          aria-current="page"
          title={item.name}
        >
          {item.name}
        </span>
      ) : (
        // Navigable breadcrumb with optional dropdown
        <button
          type="button"
          className={cn(
            config.text,
            'flex items-center gap-0.5',
            'text-neutral-600 hover:text-accent',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:underline focus-visible:text-accent',
            'max-w-[150px]'
          )}
          onClick={() => (hasSiblings ? setIsOpen(!isOpen) : undefined)}
          onKeyDown={handleKeyDown}
          aria-expanded={hasSiblings ? isOpen : undefined}
          aria-haspopup={hasSiblings ? 'menu' : undefined}
          title={item.name}
        >
          <Link
            href={item.hierarchicalHref}
            className="truncate hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {item.name}
          </Link>
          {hasSiblings && filteredSiblings.length > 0 && (
            <ChevronDown
              className={cn(
                config.chevron,
                'flex-shrink-0 text-neutral-400',
                'transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              aria-hidden="true"
            />
          )}
        </button>
      )}

      {/* Dropdown Menu */}
      {hasSiblings && filteredSiblings.length > 0 && isOpen && (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-1',
            'min-w-[200px] max-w-[280px]',
            'bg-white rounded-lg shadow-lg',
            'border border-neutral-200',
            'py-1',
            'animate-in fade-in-0 slide-in-from-top-2 duration-150'
          )}
          role="menu"
          aria-label={`Autres categories dans ${item.name}`}
        >
          {/* Current item indicator */}
          <div className="px-3 py-1.5 border-b border-neutral-100">
            <span className={cn(config.dropdown, 'text-neutral-500')}>
              Actuellement dans:
            </span>
            <div className={cn(config.dropdown, 'font-medium text-accent truncate')}>
              {item.name}
            </div>
          </div>

          {/* Sibling links */}
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filteredSiblings
              .sort((a, b) => a.rank - b.rank)
              .map((sibling) => (
                <Link
                  key={sibling.id}
                  href={getCategoryPath(sibling)}
                  className={cn(
                    config.dropdown,
                    'flex items-center justify-between',
                    'px-3 py-2',
                    'text-neutral-700 hover:bg-neutral-50 hover:text-accent',
                    'transition-colors duration-150'
                  )}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="truncate">{sibling.name}</span>
                  {sibling.product_count > 0 && (
                    <span className="ml-2 text-[10px] text-neutral-400 flex-shrink-0">
                      ({sibling.product_count})
                    </span>
                  )}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// Breadcrumbs Section
// ============================================================================

interface BreadcrumbsSectionProps {
  breadcrumbs: HierarchicalBreadcrumb[];
  categoriesData?: CategoryResponse;
}

const BreadcrumbsSection = memo(function BreadcrumbsSection({
  breadcrumbs,
  categoriesData,
}: BreadcrumbsSectionProps) {
  // Filter out home and categories special items
  const categoryBreadcrumbs = breadcrumbs.filter(
    (b) => b.id !== 'home' && b.id !== 'categories'
  );

  // Get siblings for each breadcrumb level
  const getSiblingsForBreadcrumb = (breadcrumb: HierarchicalBreadcrumb, index: number): MeilisearchCategory[] => {
    if (!categoriesData) return [];

    const category = categoriesData.byId[breadcrumb.id];
    if (!category) return [];

    // Find siblings (categories with same parent)
    return categoriesData.flat.filter(
      (c) =>
        c.parent_category_id === category.parent_category_id &&
        c.is_active
    );
  };

  return (
    <nav
      className="flex flex-wrap items-center gap-1.5 py-2"
      aria-label="Fil d'Ariane"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {/* Home Link */}
        <li className="flex items-center gap-1.5">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-1 text-xs',
              'text-neutral-500 hover:text-accent',
              'transition-colors duration-150'
            )}
            aria-label="Accueil"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </li>

        {/* Categories Root */}
        <li className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-neutral-300" aria-hidden="true" />
          <Link
            href="/categorie"
            className={cn(
              'flex items-center gap-1 text-xs',
              'text-neutral-500 hover:text-accent',
              'transition-colors duration-150'
            )}
          >
            <Grid3X3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Categories</span>
          </Link>
        </li>

        {/* Category Breadcrumbs with Dropdowns */}
        {categoryBreadcrumbs.map((item, index) => {
          const isLast = index === categoryBreadcrumbs.length - 1;
          const siblings = getSiblingsForBreadcrumb(item, index);

          return (
            <li key={item.id} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-neutral-300" aria-hidden="true" />
              <BreadcrumbDropdown
                item={item}
                siblings={siblings}
                isLast={isLast}
                size="sm"
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

// ============================================================================
// Subcategory Tags Inline
// ============================================================================

interface SubcategoryTagsInlineProps {
  subcategories: MeilisearchCategory[];
  showCounts?: boolean;
}

const SubcategoryTagsInline = memo(function SubcategoryTagsInline({
  subcategories,
  showCounts = true,
}: SubcategoryTagsInlineProps) {
  if (subcategories.length === 0) return null;

  const sortedCategories = [...subcategories].sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
      <span className="flex-shrink-0 text-xs font-medium text-neutral-500 hidden sm:inline">
        Explorer:
      </span>
      <div className="flex items-center gap-1.5">
        {sortedCategories.map((category, index) => (
          <span key={category.id} className="flex items-center">
            <Link
              href={getCategoryPath(category)}
              className={cn(
                'inline-flex items-center gap-1',
                'px-2.5 py-1',
                'text-xs font-medium',
                'text-neutral-700 hover:text-accent',
                'bg-neutral-100 hover:bg-accent/10',
                'rounded-full',
                'border border-transparent hover:border-accent/30',
                'transition-all duration-150',
                'whitespace-nowrap',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1'
              )}
            >
              <span className="max-w-[120px] sm:max-w-[150px] truncate">
                {category.name}
              </span>
              {showCounts && category.product_count > 0 && (
                <span className="text-[10px] text-neutral-400">
                  ({category.product_count})
                </span>
              )}
            </Link>
            {index < sortedCategories.length - 1 && (
              <span className="mx-0.5 text-neutral-300 hidden sm:inline" aria-hidden="true">
                |
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// Category Stats Badge
// ============================================================================

interface CategoryStatsBadgeProps {
  category: MeilisearchCategory;
  totalProductCount?: number;
  subcategoriesCount: number;
}

const CategoryStatsBadge = memo(function CategoryStatsBadge({
  category,
  totalProductCount,
  subcategoriesCount,
}: CategoryStatsBadgeProps) {
  const productCount = totalProductCount ?? category.product_count;

  return (
    <div className="flex items-center gap-3 text-xs text-neutral-500">
      {/* Depth Level */}
      <span className="hidden md:flex items-center gap-1">
        <Layers className="w-3.5 h-3.5" aria-hidden="true" />
        Niveau {category.depth + 1}
      </span>

      {/* Product Count */}
      {productCount > 0 && (
        <span className="flex items-center gap-1">
          <Package className="w-3.5 h-3.5" aria-hidden="true" />
          {productCount.toLocaleString('fr-FR')} produit{productCount !== 1 ? 's' : ''}
        </span>
      )}

      {/* Subcategories Count */}
      {subcategoriesCount > 0 && (
        <span className="hidden sm:flex items-center gap-1">
          <Grid3X3 className="w-3.5 h-3.5" aria-hidden="true" />
          {subcategoriesCount} sous-categorie{subcategoriesCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * CategoryNavBar - Compact horizontal navigation bar
 *
 * @example
 * ```tsx
 * <CategoryNavBar
 *   category={category}
 *   breadcrumbs={breadcrumbs}
 *   subcategories={subcategories}
 *   siblings={siblings}
 *   categoriesData={categoriesData}
 *   totalProductCount={150}
 * />
 * ```
 */
export const CategoryNavBar = memo(function CategoryNavBar({
  category,
  breadcrumbs,
  subcategories,
  siblings,
  categoriesData,
  totalProductCount,
  className,
}: CategoryNavBarProps) {
  return (
    <div
      className={cn(
        'bg-white border-b border-neutral-200',
        'sticky top-16 z-30', // Below main header
        className
      )}
    >
      <div className="container mx-auto px-4">
        {/* Row 1: Breadcrumbs + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-neutral-100 py-2">
          <BreadcrumbsSection
            breadcrumbs={breadcrumbs}
            categoriesData={categoriesData}
          />
          <CategoryStatsBadge
            category={category}
            totalProductCount={totalProductCount}
            subcategoriesCount={subcategories.length}
          />
        </div>

        {/* Row 2: Category Title + Subcategory Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3">
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">
            {category.name}
          </h1>
          {subcategories.length > 0 && (
            <SubcategoryTagsInline
              subcategories={subcategories}
              showCounts
            />
          )}
        </div>
      </div>
    </div>
  );
});

CategoryNavBar.displayName = 'CategoryNavBar';

export default CategoryNavBar;
