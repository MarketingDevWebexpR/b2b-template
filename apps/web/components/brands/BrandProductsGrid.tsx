'use client';

/**
 * BrandProductsGrid Component
 *
 * Displays products from a specific brand with:
 * - Responsive grid layout
 * - Sort controls
 * - Pagination
 * - Loading states
 * - Empty state
 *
 * @packageDocumentation
 */

import { memo, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, LayoutList, SlidersHorizontal, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface BrandProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: { id: string; name: string; handle: string };
  stock?: number;
  reference?: string;
}

export interface BrandProductsGridProps {
  /** Products to display */
  products: BrandProduct[];
  /** Brand name for context */
  brandName: string;
  /** Total product count (for pagination) */
  totalProducts: number;
  /** Current page */
  currentPage?: number;
  /** Page size */
  pageSize?: number;
  /** Callback for page change */
  onPageChange?: (page: number) => void;
  /** Current sort value */
  sortBy?: string;
  /** Callback for sort change */
  onSortChange?: (sort: string) => void;
  /** Is loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'name_asc', label: 'Nom A-Z' },
  { value: 'name_desc', label: 'Nom Z-A' },
  { value: 'newest', label: 'Nouveautes' },
];

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transforms BrandProduct to Product for ProductCard compatibility
 */
function transformToProduct(product: BrandProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.handle,
          description: '',
          image: '',
          productCount: 0,
        }
      : undefined,
    categoryId: product.category?.id || '',
    stock: product.stock ?? 0,
    reference: product.reference || '',
    description: '',
    shortDescription: '',
    isNew: false,
    featured: false,
    isPriceTTC: false,
    isAvailable: true,
    materials: [],
    weightUnit: 'g',
    collection: product.category?.name,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

interface ToolbarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalProducts: number;
}

const Toolbar = memo(function Toolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  totalProducts,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-neutral-50 rounded-lg border border-neutral-200">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600">
          {totalProducts.toLocaleString('fr-FR')} produit
          {totalProducts !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Sort */}
        <Select
          size="sm"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          options={SORT_OPTIONS}
          fullWidth={false}
          containerClassName="min-w-[160px]"
        />

        {/* View mode toggle */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-white rounded-lg border border-neutral-200">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'grid'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
            aria-label="Vue grille"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'list'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
            aria-label="Vue liste"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-4">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
          >
            <Skeleton className="aspect-square" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

interface EmptyStateProps {
  brandName: string;
}

const EmptyState = memo(function EmptyState({ brandName }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
        <Package className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        Aucun produit disponible
      </h3>
      <p className="text-neutral-500 max-w-sm">
        Les produits de la marque {brandName} seront bientot disponibles dans notre catalogue.
      </p>
      <a
        href="/produits"
        className={cn(
          'mt-6 inline-flex items-center justify-center',
          'h-11 px-6 text-base',
          'bg-accent text-white rounded-lg',
          'hover:bg-accent/90 transition-colors',
          'font-medium'
        )}
      >
        Voir tous les produits
      </a>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// ============================================================================
// Main Component
// ============================================================================

/**
 * BrandProductsGrid - Product grid for brand detail page
 *
 * @example
 * ```tsx
 * <BrandProductsGrid
 *   products={brandProducts}
 *   brandName="Cartier"
 *   totalProducts={150}
 *   currentPage={1}
 *   pageSize={24}
 *   onPageChange={handlePageChange}
 *   sortBy="relevance"
 *   onSortChange={handleSortChange}
 * />
 * ```
 */
export const BrandProductsGrid = memo(function BrandProductsGrid({
  products,
  brandName,
  totalProducts,
  currentPage = 1,
  pageSize = 24,
  onPageChange,
  sortBy = 'relevance',
  onSortChange,
  isLoading = false,
  className,
}: BrandProductsGridProps) {
  // Local state for view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Handle sort change
  const handleSortChange = useCallback(
    (value: string) => {
      onSortChange?.(value);
    },
    [onSortChange]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      onPageChange?.(page);
      // Scroll to top of products section
      document.getElementById('brand-products')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
    [onPageChange]
  );

  // Transform products for ProductCard
  const transformedProducts = useMemo(
    () => products.map(transformToProduct),
    [products]
  );

  // Total pages
  const totalPages = Math.ceil(totalProducts / pageSize);

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Empty state
  if (products.length === 0) {
    return <EmptyState brandName={brandName} />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Toolbar */}
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        totalProducts={totalProducts}
      />

      {/* Product Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'grid gap-4',
          viewMode === 'grid'
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1'
        )}
      >
        {transformedProducts.map((product, index) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard product={product} priority={index < 8} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-sm text-neutral-600">
            Page {currentPage} sur {totalPages} ({totalProducts.toLocaleString('fr-FR')} produits)
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            siblingCount={1}
            size="md"
          />
        </div>
      )}
    </div>
  );
});

BrandProductsGrid.displayName = 'BrandProductsGrid';

export default BrandProductsGrid;
