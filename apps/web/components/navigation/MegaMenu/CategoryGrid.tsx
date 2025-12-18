'use client';

/**
 * CategoryGrid Component (Levels 3-5)
 *
 * Main content grid in the dropdown panel displaying Level 3 categories.
 * Each L3 item shows icon, name, and child count badge.
 * Levels 4-5 are displayed as nested lists under each L3 section.
 * Maximum 4-5 items shown per L3 section with "Voir tout" links.
 */

import { memo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryIcon } from './CategoryIcon';
import { Badge } from '@/components/ui/Badge';
import type { CategoryLevel2, CategoryLevel3, CategoryLevel4 } from './types';

export interface CategoryGridProps {
  /** Active Level 2 category */
  category: CategoryLevel2;
  /** Parent category slug for URL construction */
  parentSlug: string;
  /** Callback when any link is clicked (for closing menu) */
  onLinkClick: () => void;
  /** Maximum number of L4/L5 items to show per L3 section */
  maxItemsPerSection?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for Level 4-5 nested items
 */
interface NestedItemProps {
  item: CategoryLevel4;
  basePath: string;
  onLinkClick: () => void;
  depth: number;
}

/**
 * Nested item component for Levels 4-5
 */
const NestedItem = memo(function NestedItem({
  item,
  basePath,
  onLinkClick,
  depth,
}: NestedItemProps) {
  const router = useRouter();
  const itemPath = `${basePath}/${item.slug}`;

  const handleMouseEnter = useCallback(() => {
    // Prefetch the category page on hover
    router.prefetch(itemPath);
  }, [router, itemPath]);

  return (
    <li>
      <Link
        href={itemPath}
        onClick={onLinkClick}
        onMouseEnter={handleMouseEnter}
        className={cn(
          'group flex items-center justify-between gap-2',
          'py-1.5',
          'text-sm text-neutral-600',
          'hover:text-amber-600',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:text-amber-600',
          depth > 0 && 'pl-4 text-xs text-neutral-500'
        )}
      >
        <span className="truncate">{item.name}</span>
        {item.productCount !== undefined && item.productCount > 0 && (
          <span className="text-xs text-neutral-400 group-hover:text-amber-500">
            ({item.productCount})
          </span>
        )}
      </Link>

      {/* Level 5 items (if any, limited display) */}
      {item.children && item.children.length > 0 && depth < 1 && (
        <ul className="ml-3 mt-1 space-y-1 border-l border-neutral-200 pl-3">
          {item.children.slice(0, 3).map((child) => (
            <li key={child.id}>
              <Link
                href={`${itemPath}/${child.slug}`}
                onClick={onLinkClick}
                className={cn(
                  'group/l5 flex items-center justify-between gap-2 py-1',
                  'text-xs text-neutral-500',
                  'hover:text-amber-600',
                  'transition-colors duration-150',
                  'focus:outline-none focus-visible:text-amber-600'
                )}
              >
                <span className="truncate">{child.name}</span>
                {child.productCount !== undefined && child.productCount > 0 && (
                  <span className="text-xs text-neutral-400 group-hover/l5:text-amber-500">
                    ({child.productCount})
                  </span>
                )}
              </Link>
            </li>
          ))}
          {item.children.length > 3 && (
            <li>
              <Link
                href={itemPath}
                onClick={onLinkClick}
                className={cn(
                  'inline-flex items-center gap-1',
                  'py-1',
                  'text-xs font-medium text-amber-600',
                  'hover:text-amber-700',
                  'transition-colors duration-150'
                )}
              >
                +{item.children.length - 3} autres
              </Link>
            </li>
          )}
        </ul>
      )}
    </li>
  );
});

NestedItem.displayName = 'NestedItem';

/**
 * Props for Level 3 category section
 */
interface CategorySectionProps {
  category: CategoryLevel3;
  basePath: string;
  onLinkClick: () => void;
  maxItems: number;
}

/**
 * Category section for Level 3
 */
const CategorySection = memo(function CategorySection({
  category,
  basePath,
  onLinkClick,
  maxItems,
}: CategorySectionProps) {
  const router = useRouter();
  const sectionPath = `${basePath}/${category.slug}`;
  const children = category.children || [];
  const displayedChildren = children.slice(0, maxItems);
  const remainingCount = children.length - maxItems;

  const handleMouseEnter = useCallback(() => {
    router.prefetch(sectionPath);
  }, [router, sectionPath]);

  const totalProducts = category.productCount || children.reduce(
    (sum, child) => sum + (child.productCount || 0),
    0
  );

  return (
    <div className="space-y-3">
      {/* Section header (L3) */}
      <Link
        href={sectionPath}
        onClick={onLinkClick}
        onMouseEnter={handleMouseEnter}
        className={cn(
          'group flex items-center gap-3',
          'pb-2 border-b border-neutral-200',
          'focus:outline-none'
        )}
      >
        <CategoryIcon
          name={category.icon}
          size="md"
          className={cn(
            'text-neutral-400',
            'transition-colors duration-150',
            'group-hover:text-amber-600',
            'group-focus-visible:text-amber-600'
          )}
        />
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-sm font-semibold text-neutral-900',
              'group-hover:text-amber-600',
              'group-focus-visible:text-amber-600',
              'transition-colors duration-150',
              'truncate'
            )}
          >
            {category.name}
          </h3>
        </div>
        {totalProducts > 0 && (
          <Badge
            variant="light"
            size="xs"
            className="shrink-0"
          >
            {totalProducts}
          </Badge>
        )}
      </Link>

      {/* L4 items */}
      {displayedChildren.length > 0 && (
        <ul className="space-y-1">
          {displayedChildren.map((child) => (
            <NestedItem
              key={child.id}
              item={child}
              basePath={sectionPath}
              onLinkClick={onLinkClick}
              depth={0}
            />
          ))}
        </ul>
      )}

      {/* "Voir tout" link */}
      {remainingCount > 0 && (
        <Link
          href={sectionPath}
          onClick={onLinkClick}
          className={cn(
            'group inline-flex items-center gap-1.5',
            'text-xs font-medium text-amber-600',
            'hover:text-amber-700',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:underline'
          )}
        >
          <span>Voir tout ({children.length})</span>
          <ChevronRight
            className={cn(
              'w-3 h-3',
              'transition-transform duration-150',
              'group-hover:translate-x-0.5'
            )}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

/**
 * CategoryGrid renders the main content area with Level 3-5 categories.
 * Uses a 2-3 column responsive grid layout.
 *
 * @example
 * <CategoryGrid
 *   category={activeL2Category}
 *   parentSlug="electricite"
 *   onLinkClick={closeMenu}
 *   maxItemsPerSection={5}
 * />
 */
export const CategoryGrid = memo(function CategoryGrid({
  category,
  parentSlug,
  onLinkClick,
  maxItemsPerSection = 5,
  className,
}: CategoryGridProps) {
  const basePath = `/categorie/${parentSlug}/${category.slug}`;
  const children = category.children || [];

  if (children.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center h-full',
          'text-center py-12',
          className
        )}
      >
        <CategoryIcon
          name={category.icon}
          size="lg"
          className="text-neutral-300 mb-4"
        />
        <p className="text-sm text-neutral-500 mb-4">
          Aucune sous-catégorie disponible
        </p>
        <Link
          href={`/categorie/${parentSlug}/${category.slug}`}
          onClick={onLinkClick}
          className={cn(
            'inline-flex items-center gap-2',
            'px-4 py-2',
            'text-sm font-medium text-amber-600',
            'bg-amber-50 hover:bg-amber-100',
            'rounded-lg',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
          )}
        >
          <span>Explorer {category.name}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-full overflow-y-auto',
        'p-6',
        className
      )}
    >
      {/* Category header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CategoryIcon
            name={category.icon}
            size="md"
            className="text-amber-600"
          />
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {category.name}
            </h2>
            {category.productCount !== undefined && category.productCount > 0 && (
              <p className="text-xs text-neutral-500">
                {category.productCount.toLocaleString('fr-FR')} produits
              </p>
            )}
          </div>
        </div>
        <Link
          href={basePath}
          onClick={onLinkClick}
          className={cn(
            'group inline-flex items-center gap-1.5',
            'px-3 py-1.5',
            'text-sm font-medium text-amber-600',
            'hover:text-amber-700 hover:bg-amber-50',
            'rounded-lg',
            'transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
          )}
        >
          <span>Voir tout</span>
          <ArrowRight
            className={cn(
              'w-4 h-4',
              'transition-transform duration-150',
              'group-hover:translate-x-0.5'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* L3 categories grid */}
      <div
        className={cn(
          'grid gap-6',
          children.length === 1 && 'grid-cols-1',
          children.length === 2 && 'grid-cols-2',
          children.length >= 3 && 'grid-cols-2 lg:grid-cols-3'
        )}
      >
        {children.map((l3Category) => (
          <CategorySection
            key={l3Category.id}
            category={l3Category}
            basePath={basePath}
            onLinkClick={onLinkClick}
            maxItems={maxItemsPerSection}
          />
        ))}
      </div>
    </div>
  );
});

CategoryGrid.displayName = 'CategoryGrid';

export default CategoryGrid;
