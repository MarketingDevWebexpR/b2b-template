'use client';

/**
 * CategoryHeroEnhanced Component
 *
 * Enhanced hero section for category pages with image, stats, and breadcrumbs.
 * Supports full-width display with gradient overlay.
 *
 * Features:
 * - Background image with fallback gradient
 * - Category stats (products, subcategories)
 * - Description display
 * - Integrated breadcrumbs
 * - Responsive design
 * - Depth level indicator
 *
 * @packageDocumentation
 */

import { memo } from 'react';
import Image from 'next/image';
import { Package, FolderTree, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container, Badge } from '@/components/ui';
import { CategoryBreadcrumbsDynamic } from './CategoryBreadcrumbsDynamic';
import { getDepthLevelName } from '@/lib/categories/hierarchy';
import type { IndexedCategory } from '@/types/category';
import type { HierarchicalBreadcrumb } from '@/lib/categories/hierarchy';

// ============================================================================
// Types
// ============================================================================

export interface CategoryHeroEnhancedProps {
  /** The category to display */
  category: IndexedCategory;
  /** Breadcrumbs for navigation */
  breadcrumbs: HierarchicalBreadcrumb[];
  /** Number of subcategories */
  subcategoryCount?: number;
  /** Total product count (including descendants) */
  totalProductCount?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Show stats badges */
  showStats?: boolean;
  /** Show depth level */
  showDepthLevel?: boolean;
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig = {
  sm: {
    height: 'min-h-[200px]',
    titleSize: 'text-2xl md:text-3xl',
    descSize: 'text-sm',
    padding: 'py-8 md:py-10',
  },
  md: {
    height: 'min-h-[280px]',
    titleSize: 'text-3xl md:text-4xl',
    descSize: 'text-base',
    padding: 'py-10 md:py-14',
  },
  lg: {
    height: 'min-h-[350px]',
    titleSize: 'text-4xl md:text-5xl',
    descSize: 'text-lg',
    padding: 'py-14 md:py-20',
  },
};

// ============================================================================
// Component
// ============================================================================

/**
 * CategoryHeroEnhanced - Rich hero section for category pages
 *
 * @example
 * ```tsx
 * <CategoryHeroEnhanced
 *   category={category}
 *   breadcrumbs={breadcrumbs}
 *   subcategoryCount={5}
 *   totalProductCount={150}
 *   showStats
 *   showBreadcrumbs
 * />
 * ```
 */
export const CategoryHeroEnhanced = memo(function CategoryHeroEnhanced({
  category,
  breadcrumbs,
  subcategoryCount = 0,
  totalProductCount,
  size = 'md',
  className,
  showBreadcrumbs = true,
  showStats = true,
  showDepthLevel = true,
}: CategoryHeroEnhancedProps) {
  const config = sizeConfig[size];
  const productCount = totalProductCount ?? category.product_count ?? 0;
  const hasImage = !!category.image_url;
  const depthName = getDepthLevelName(category.depth);

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        config.height,
        className
      )}
    >
      {/* Background Image or Gradient */}
      {hasImage ? (
        <>
          <Image
            src={category.image_url!}
            alt={category.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/50"
            aria-hidden="true"
          />
        </>
      ) : (
        /* Fallback Gradient */
        <div
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950'
          )}
          aria-hidden="true"
        >
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Content */}
      <div className={cn('relative z-10', config.padding)}>
        <Container>
          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <div className="mb-4">
              <CategoryBreadcrumbsDynamic
                breadcrumbs={breadcrumbs}
                showHome
                showCategoriesRoot
                size="sm"
                className="text-white/80 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-white/50"
              />
            </div>
          )}

          {/* Depth Level Badge */}
          {showDepthLevel && category.depth >= 0 && (
            <div className="mb-3">
              <Badge
                variant="primary-outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white/90"
              >
                <Layers className="w-3 h-3 mr-1" />
                {depthName}
              </Badge>
            </div>
          )}

          {/* Category Name */}
          <h1
            className={cn(
              config.titleSize,
              'font-bold text-white mb-4',
              'drop-shadow-lg'
            )}
          >
            {category.name}
          </h1>

          {/* Description */}
          {category.description && (
            <p
              className={cn(
                config.descSize,
                'text-white/80 max-w-2xl mb-6',
                'leading-relaxed'
              )}
            >
              {category.description}
            </p>
          )}

          {/* Stats */}
          {showStats && (productCount > 0 || subcategoryCount > 0) && (
            <div className="flex flex-wrap items-center gap-4">
              {productCount > 0 && (
                <div className="flex items-center gap-2 text-white/90">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">
                    {productCount.toLocaleString('fr-FR')} produit
                    {productCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {subcategoryCount > 0 && (
                <>
                  <span className="text-white/40 hidden sm:inline">|</span>
                  <div className="flex items-center gap-2 text-white/90">
                    <FolderTree className="w-5 h-5" />
                    <span className="font-medium">
                      {subcategoryCount} sous-categorie
                      {subcategoryCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}

              {category.depth < 4 && subcategoryCount > 0 && (
                <>
                  <span className="text-white/40 hidden sm:inline">|</span>
                  <span className="text-white/70 text-sm flex items-center gap-1">
                    <ChevronRight className="w-4 h-4" />
                    Explorez les sous-categories
                  </span>
                </>
              )}
            </div>
          )}
        </Container>
      </div>
    </section>
  );
});

CategoryHeroEnhanced.displayName = 'CategoryHeroEnhanced';

export default CategoryHeroEnhanced;
