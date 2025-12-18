'use client';

/**
 * SubcategoriesGrid Component
 *
 * Grid display of subcategory cards with images and hover effects.
 * Used on category pages to show child categories.
 *
 * Features:
 * - Responsive grid layout
 * - Image backgrounds with fallback
 * - Product count badges
 * - Hover animations
 * - Link to hierarchical URLs
 *
 * @packageDocumentation
 */

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryPath } from '@/lib/categories/hierarchy';
import type { MeilisearchCategory } from '@/types/category';

// ============================================================================
// Types
// ============================================================================

export interface SubcategoriesGridProps {
  /** Array of subcategories to display */
  subcategories: MeilisearchCategory[];
  /** Parent category handle for building paths */
  parentHandle?: string;
  /** Grid columns (responsive) */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Card size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show product counts */
  showCounts?: boolean;
  /** Show "view all" indicator on hover */
  showViewAll?: boolean;
  /** Title for the section */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

interface SubcategoryCardProps {
  category: MeilisearchCategory;
  size: 'sm' | 'md' | 'lg';
  showCount: boolean;
  showViewAll: boolean;
  priority?: boolean;
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig = {
  sm: {
    height: 'h-[140px] sm:h-[160px]',
    titleSize: 'text-sm sm:text-base',
    padding: 'p-3 sm:p-4',
    iconSize: 'w-8 h-8',
  },
  md: {
    height: 'h-[180px] sm:h-[200px]',
    titleSize: 'text-base sm:text-lg',
    padding: 'p-4 sm:p-5',
    iconSize: 'w-10 h-10',
  },
  lg: {
    height: 'h-[220px] sm:h-[250px]',
    titleSize: 'text-lg sm:text-xl',
    padding: 'p-5 sm:p-6',
    iconSize: 'w-12 h-12',
  },
};

const columnConfig = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
};

// ============================================================================
// Subcategory Card Component
// ============================================================================

const SubcategoryCard = memo(function SubcategoryCard({
  category,
  size,
  showCount,
  showViewAll,
  priority = false,
}: SubcategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const config = sizeConfig[size];
  const categoryPath = getCategoryPath(category);
  const hasImage = category.image_url && !imageError;

  return (
    <Link
      href={categoryPath}
      className={cn(
        'group relative block overflow-hidden rounded-xl',
        config.height,
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        'transition-shadow duration-300',
        'hover:shadow-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Voir ${category.name}`}
    >
      {/* Background */}
      <div
        className={cn(
          'absolute inset-0 transition-transform duration-300 ease-out',
          isHovered && 'scale-105'
        )}
      >
        {hasImage ? (
          <Image
            src={category.image_url!}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900'
            )}
          >
            {/* Pattern for visual interest */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
              aria-hidden="true"
            />
            {/* Centered icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <FolderOpen
                className={cn(config.iconSize, 'text-white/30')}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300',
          'bg-gradient-to-t from-black/70 via-black/30 to-transparent',
          isHovered && 'from-black/80 via-black/40'
        )}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-end',
          config.padding
        )}
      >
        {/* Product Count Badge - Shows total including descendants */}
        {showCount && category.product_count > 0 && (
          <div
            className={cn(
              'absolute top-3 right-3',
              'flex items-center gap-1 px-2 py-1 rounded-full',
              'bg-white/20 backdrop-blur-sm',
              'text-white text-xs font-medium',
              'transition-all duration-300',
              isHovered && 'bg-white/30'
            )}
            title={`${category.product_count} produit${category.product_count !== 1 ? 's' : ''} (y compris sous-catégories)`}
          >
            <Package className="w-3 h-3" />
            {category.product_count}
          </div>
        )}

        {/* Category Name */}
        <h3
          className={cn(
            config.titleSize,
            'font-semibold text-white',
            'drop-shadow-md',
            'transition-colors duration-200',
            'group-hover:text-accent-200'
          )}
        >
          {category.name}
        </h3>

        {/* View All Indicator */}
        {showViewAll && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1',
              'text-white/70 text-xs sm:text-sm',
              'transition-all duration-300',
              isHovered
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-2'
            )}
          >
            <span>Voir tout</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </Link>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * SubcategoriesGrid - Grid of subcategory cards
 *
 * @example
 * ```tsx
 * <SubcategoriesGrid
 *   subcategories={subcategories}
 *   columns={4}
 *   size="md"
 *   showCounts
 *   title="Sous-categories"
 * />
 * ```
 */
export const SubcategoriesGrid = memo(function SubcategoriesGrid({
  subcategories,
  columns = 4,
  size = 'md',
  showCounts = true,
  showViewAll = true,
  title,
  className,
}: SubcategoriesGridProps) {
  if (subcategories.length === 0) {
    return null;
  }

  // Sort by rank
  const sortedCategories = [...subcategories].sort((a, b) => a.rank - b.rank);

  return (
    <section className={className}>
      {/* Section Title */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">
            {title}
          </h2>
          <span className="text-sm text-neutral-500">
            {subcategories.length} categorie{subcategories.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Grid */}
      <div className={cn('grid gap-4 sm:gap-6', columnConfig[columns])}>
        {sortedCategories.map((category, index) => (
          <SubcategoryCard
            key={category.id}
            category={category}
            size={size}
            showCount={showCounts}
            showViewAll={showViewAll}
            priority={index < 4}
          />
        ))}
      </div>
    </section>
  );
});

SubcategoriesGrid.displayName = 'SubcategoriesGrid';

export default SubcategoriesGrid;
