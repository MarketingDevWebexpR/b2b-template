'use client';

/**
 * SubcategoriesTags Component
 *
 * Compact horizontal tags/pills display of subcategories.
 * Replaces SubcategoriesGrid for a more space-efficient layout.
 *
 * Features:
 * - Compact pill/chip style
 * - Category icon support (Lucide icons)
 * - Product count badges
 * - Flex wrap responsive layout
 * - Accessible navigation links
 *
 * @packageDocumentation
 */

import { memo } from 'react';
import Link from 'next/link';
import {
  Zap,
  Droplets,
  Hammer,
  Thermometer,
  Wrench,
  Plug,
  Lightbulb,
  Cable,
  Shield,
  Gauge,
  Fan,
  Pipette,
  Settings,
  Box,
  Package,
  Layers,
  Grid3X3,
  Folder,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryPath } from '@/lib/categories/hierarchy';
import type { IndexedCategory } from '@/types/category';

// ============================================================================
// Types
// ============================================================================

export interface SubcategoriesTagsProps {
  /** Array of subcategories to display */
  subcategories: IndexedCategory[];
  /** Tag size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show product counts */
  showCounts?: boolean;
  /** Show icons */
  showIcons?: boolean;
  /** Title for the section */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<string, LucideIcon> = {
  bolt: Zap,
  zap: Zap,
  droplets: Droplets,
  hammer: Hammer,
  thermometer: Thermometer,
  wrench: Wrench,
  plug: Plug,
  lightbulb: Lightbulb,
  cable: Cable,
  shield: Shield,
  gauge: Gauge,
  fan: Fan,
  pipette: Pipette,
  settings: Settings,
  box: Box,
  package: Package,
  layers: Layers,
  grid: Grid3X3,
  folder: Folder,
  tag: Tag,
};

/**
 * Get the Lucide icon component for a category
 */
function getCategoryIcon(iconName: string | null): LucideIcon | null {
  if (!iconName) return null;
  return iconMap[iconName.toLowerCase()] || null;
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig = {
  sm: {
    tag: 'px-2.5 py-1 text-xs gap-1.5',
    icon: 'w-3 h-3',
    count: 'text-[10px] px-1.5 py-0.5',
  },
  md: {
    tag: 'px-3 py-1.5 text-sm gap-2',
    icon: 'w-4 h-4',
    count: 'text-xs px-2 py-0.5',
  },
  lg: {
    tag: 'px-4 py-2 text-base gap-2',
    icon: 'w-5 h-5',
    count: 'text-sm px-2 py-1',
  },
};

// ============================================================================
// Subcategory Tag Component
// ============================================================================

interface SubcategoryTagProps {
  category: IndexedCategory;
  size: 'sm' | 'md' | 'lg';
  showCount: boolean;
  showIcon: boolean;
}

const SubcategoryTag = memo(function SubcategoryTag({
  category,
  size,
  showCount,
  showIcon,
}: SubcategoryTagProps) {
  const config = sizeConfig[size];
  const categoryPath = getCategoryPath(category);
  const IconComponent = showIcon ? getCategoryIcon(category.icon) : null;

  return (
    <Link
      href={categoryPath}
      className={cn(
        // Group for child hover states
        'group',
        // Base styles
        'inline-flex items-center',
        'rounded-full',
        'border border-neutral-200',
        'bg-white',
        'text-neutral-700',
        'font-medium',
        'whitespace-nowrap',
        // Hover & focus states
        'hover:bg-accent hover:text-white hover:border-accent',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        // Transitions
        'transition-all duration-200 ease-out',
        // Hover shadow
        'hover:shadow-md',
        // Size config
        config.tag
      )}
      aria-label={`Voir ${category.name}${category.product_count > 0 ? `, ${category.product_count} produits` : ''}`}
    >
      {/* Icon */}
      {IconComponent && (
        <IconComponent
          className={cn(config.icon, 'flex-shrink-0')}
          aria-hidden="true"
        />
      )}

      {/* Category Name */}
      <span className="truncate max-w-[180px]">{category.name}</span>

      {/* Product Count Badge */}
      {showCount && category.product_count > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'rounded-full',
            'bg-neutral-100 text-neutral-500',
            'font-normal',
            'min-w-[1.25rem]',
            // Inherit hover color
            'group-hover:bg-white/20 group-hover:text-white',
            config.count
          )}
        >
          {category.product_count}
        </span>
      )}
    </Link>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * SubcategoriesTags - Compact horizontal tags display
 *
 * @example
 * ```tsx
 * <SubcategoriesTags
 *   subcategories={subcategories}
 *   size="md"
 *   showCounts
 *   showIcons
 *   title="Sous-categories"
 * />
 * ```
 */
export const SubcategoriesTags = memo(function SubcategoriesTags({
  subcategories,
  size = 'md',
  showCounts = true,
  showIcons = true,
  title,
  className,
}: SubcategoriesTagsProps) {
  if (subcategories.length === 0) {
    return null;
  }

  // Sort by rank
  const sortedCategories = [...subcategories].sort((a, b) => a.rank - b.rank);

  return (
    <section className={className}>
      {/* Section Header */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <span className="text-sm text-neutral-500">
            {subcategories.length} categorie{subcategories.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Tags Container */}
      <div className="flex flex-wrap gap-2">
        {sortedCategories.map((category) => (
          <SubcategoryTag
            key={category.id}
            category={category}
            size={size}
            showCount={showCounts}
            showIcon={showIcons}
          />
        ))}
      </div>
    </section>
  );
});

SubcategoriesTags.displayName = 'SubcategoriesTags';

export default SubcategoriesTags;
