/**
 * ProductGridSkeleton - Loading skeleton for product grids
 *
 * Features:
 * - Responsive grid matching product layout
 * - Animated shimmer effect
 * - Configurable count
 *
 * @packageDocumentation
 */

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

// ============================================================================
// Types
// ============================================================================

export interface ProductGridSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Grid columns configuration */
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square relative bg-neutral-100">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category & Stock row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Product name */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* SKU reference */}
        <Skeleton className="h-3 w-20" />

        {/* Price */}
        <div className="pt-2 border-t border-neutral-100">
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductGridSkeleton({
  count = 12,
  columns = {
    default: 2,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
  },
  className,
}: ProductGridSkeletonProps) {
  // Generate grid classes based on columns config
  const gridClasses = cn(
    'grid gap-4',
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  );

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className
      )}
      role="status"
      aria-label="Chargement des produits"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
      <span className="sr-only">Chargement des produits en cours...</span>
    </div>
  );
}

// ============================================================================
// Variant: Compact skeleton for smaller grids
// ============================================================================

export function ProductGridSkeletonCompact({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      role="status"
      aria-label="Chargement des produits"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-neutral-200 p-3"
        >
          <Skeleton className="aspect-square w-full rounded-lg mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
      <span className="sr-only">Chargement des produits en cours...</span>
    </div>
  );
}

export default ProductGridSkeleton;
