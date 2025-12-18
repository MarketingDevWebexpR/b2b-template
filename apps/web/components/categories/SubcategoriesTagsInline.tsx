'use client';

/**
 * SubcategoriesTagsInline Component
 *
 * Ultra-compact inline version of subcategory tags for horizontal navigation.
 * Designed for maximum space efficiency with minimal height footprint.
 *
 * Features:
 * - Extra-small (xs) size option
 * - inline-flex layout (single row with overflow scroll)
 * - Minimal padding and margins
 * - Horizontal scrolling on overflow
 * - Separator characters between tags
 * - Keyboard accessible
 *
 * @packageDocumentation
 */

import { memo, useRef, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryPath } from '@/lib/categories/hierarchy';
import type { MeilisearchCategory } from '@/types/category';

// ============================================================================
// Types
// ============================================================================

export interface SubcategoriesTagsInlineProps {
  /** Array of subcategories to display */
  subcategories: MeilisearchCategory[];
  /** Tag size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show product counts */
  showCounts?: boolean;
  /** Show separator between tags */
  showSeparator?: boolean;
  /** Separator character */
  separator?: string;
  /** Label prefix (e.g., "Explorer:") */
  label?: string;
  /** Show scroll arrows when content overflows */
  showScrollArrows?: boolean;
  /** Maximum tags to show (0 = all) */
  maxTags?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig = {
  xs: {
    tag: 'px-2 py-0.5 text-[11px] gap-1',
    count: 'text-[9px]',
    label: 'text-[11px]',
    separator: 'text-[10px]',
    arrow: 'w-5 h-5',
    arrowIcon: 'w-3 h-3',
  },
  sm: {
    tag: 'px-2.5 py-1 text-xs gap-1',
    count: 'text-[10px]',
    label: 'text-xs',
    separator: 'text-xs',
    arrow: 'w-6 h-6',
    arrowIcon: 'w-3.5 h-3.5',
  },
  md: {
    tag: 'px-3 py-1.5 text-sm gap-1.5',
    count: 'text-xs',
    label: 'text-sm',
    separator: 'text-sm',
    arrow: 'w-7 h-7',
    arrowIcon: 'w-4 h-4',
  },
};

// ============================================================================
// Inline Tag Component
// ============================================================================

interface InlineTagProps {
  category: MeilisearchCategory;
  size: 'xs' | 'sm' | 'md';
  showCount: boolean;
  isLast: boolean;
  showSeparator: boolean;
  separator: string;
}

const InlineTag = memo(function InlineTag({
  category,
  size,
  showCount,
  isLast,
  showSeparator,
  separator,
}: InlineTagProps) {
  const config = sizeConfig[size];
  const categoryPath = getCategoryPath(category);

  return (
    <span className="inline-flex items-center flex-shrink-0">
      <Link
        href={categoryPath}
        className={cn(
          'inline-flex items-center',
          'rounded-full',
          'font-medium',
          'whitespace-nowrap',
          // Colors
          'text-neutral-700 hover:text-white',
          'bg-neutral-100 hover:bg-accent',
          'border border-neutral-200 hover:border-accent',
          // Transitions
          'transition-all duration-150 ease-out',
          // Focus
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
          // Size
          config.tag
        )}
        aria-label={`${category.name}${category.product_count > 0 ? `, ${category.product_count} produits` : ''}`}
      >
        <span className="max-w-[100px] sm:max-w-[130px] truncate">
          {category.name}
        </span>
        {showCount && category.product_count > 0 && (
          <span className={cn(config.count, 'text-neutral-400')}>
            ({category.product_count})
          </span>
        )}
      </Link>
      {showSeparator && !isLast && (
        <span
          className={cn(
            'mx-1 text-neutral-300 flex-shrink-0',
            config.separator
          )}
          aria-hidden="true"
        >
          {separator}
        </span>
      )}
    </span>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * SubcategoriesTagsInline - Ultra-compact inline tags
 *
 * @example
 * ```tsx
 * <SubcategoriesTagsInline
 *   subcategories={subcategories}
 *   size="xs"
 *   showCounts
 *   showSeparator
 *   label="Explorer:"
 *   showScrollArrows
 * />
 * ```
 */
export const SubcategoriesTagsInline = memo(function SubcategoriesTagsInline({
  subcategories,
  size = 'sm',
  showCounts = true,
  showSeparator = true,
  separator = '|',
  label,
  showScrollArrows = true,
  maxTags = 0,
  className,
}: SubcategoriesTagsInlineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const config = sizeConfig[size];

  // Check scroll state
  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  // Initialize and listen for resize
  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState, subcategories]);

  // Scroll handlers
  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.6;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  if (subcategories.length === 0) {
    return null;
  }

  // Sort and optionally limit categories
  let sortedCategories = [...subcategories].sort((a, b) => a.rank - b.rank);
  if (maxTags > 0 && sortedCategories.length > maxTags) {
    sortedCategories = sortedCategories.slice(0, maxTags);
  }

  const showArrows = showScrollArrows && (canScrollLeft || canScrollRight);

  return (
    <div className={cn('relative flex items-center', className)}>
      {/* Label */}
      {label && (
        <span
          className={cn(
            'flex-shrink-0 font-medium text-neutral-500 mr-2',
            config.label
          )}
        >
          {label}
        </span>
      )}

      {/* Left Scroll Arrow */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 z-10 flex items-center justify-center',
            'bg-gradient-to-r from-white via-white to-transparent',
            'text-neutral-600 hover:text-accent',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            config.arrow,
            label && 'left-14'
          )}
          aria-label="Defiler vers la gauche"
        >
          <ChevronLeft className={config.arrowIcon} />
        </button>
      )}

      {/* Tags Container */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollState}
        className={cn(
          'flex items-center gap-0.5 overflow-x-auto',
          'scrollbar-hide',
          // Mask edges for scroll indication
          showArrows && 'scroll-smooth'
        )}
        role="navigation"
        aria-label="Sous-categories"
      >
        {sortedCategories.map((category, index) => (
          <InlineTag
            key={category.id}
            category={category}
            size={size}
            showCount={showCounts}
            isLast={index === sortedCategories.length - 1}
            showSeparator={showSeparator}
            separator={separator}
          />
        ))}

        {/* Show more indicator */}
        {maxTags > 0 && subcategories.length > maxTags && (
          <span
            className={cn(
              'ml-1 text-neutral-400 flex-shrink-0',
              config.count
            )}
          >
            +{subcategories.length - maxTags}
          </span>
        )}
      </div>

      {/* Right Scroll Arrow */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 z-10 flex items-center justify-center',
            'bg-gradient-to-l from-white via-white to-transparent',
            'text-neutral-600 hover:text-accent',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            config.arrow
          )}
          aria-label="Defiler vers la droite"
        >
          <ChevronRight className={config.arrowIcon} />
        </button>
      )}
    </div>
  );
});

SubcategoriesTagsInline.displayName = 'SubcategoriesTagsInline';

export default SubcategoriesTagsInline;
