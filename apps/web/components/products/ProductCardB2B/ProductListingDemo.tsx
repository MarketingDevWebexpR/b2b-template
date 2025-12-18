'use client';

/**
 * ProductListingDemo Component
 *
 * Demo component showcasing the optimized B2B product cards
 * with view mode toggle and responsive grid/list layouts.
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ProductCardGridOptimized } from './ProductCardGridOptimized';
import { ProductCardListOptimized, ProductCardListHeader } from './ProductCardListOptimized';
import { useProductViewMode, type ProductViewMode } from '@/hooks/useProductViewMode';
import type { Product } from '@/types';
import type { PriceInfo, StockInfo } from './types';

// ============================================================================
// Types
// ============================================================================

export interface ProductListingDemoProps {
  /** Products to display */
  products: Product[];
  /** Initial view mode */
  initialViewMode?: ProductViewMode;
  /** Show view mode toggle */
  showViewToggle?: boolean;
  /** Enable bulk selection */
  enableSelection?: boolean;
  /** Callback when adding to cart */
  onAddToCart?: (productId: string, quantity: number) => void;
  /** Callback when toggling favorite */
  onToggleFavorite?: (productId: string) => void;
  /** Callback when toggling compare */
  onToggleCompare?: (productId: string) => void;
  /** Set of favorite product IDs */
  favoriteIds?: Set<string>;
  /** Set of compared product IDs */
  compareIds?: Set<string>;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const Icons = {
  Grid: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  ),
  List: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="14" height="3" rx="0.5" />
      <rect x="3" y="8.5" width="14" height="3" rx="0.5" />
      <rect x="3" y="14" width="14" height="3" rx="0.5" />
    </svg>
  ),
  Compact: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
      <line x1="3" y1="5" x2="17" y2="5" />
      <line x1="3" y1="8" x2="17" y2="8" />
      <line x1="3" y1="11" x2="17" y2="11" />
      <line x1="3" y1="14" x2="17" y2="14" />
    </svg>
  ),
};

// ============================================================================
// Sub-Components
// ============================================================================

/** View mode toggle button group */
function ViewModeToggle({
  viewMode,
  onChange,
  className,
}: {
  viewMode: ProductViewMode;
  onChange: (mode: ProductViewMode) => void;
  className?: string;
}) {
  const modes: Array<{ mode: ProductViewMode; icon: typeof Icons.Grid; label: string }> = [
    { mode: 'grid', icon: Icons.Grid, label: 'Grille' },
    { mode: 'list', icon: Icons.List, label: 'Liste' },
    { mode: 'compact', icon: Icons.Compact, label: 'Compact' },
  ];

  return (
    <div
      className={cn('inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-lg', className)}
      role="group"
      aria-label="Mode d'affichage"
    >
      {modes.map(({ mode, icon: Icon, label }) => {
        const isActive = mode === viewMode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md',
              'text-sm font-medium transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
              isActive
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
            )}
            aria-pressed={isActive}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Results count display */
function ResultsCount({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-neutral-500', className)}>
      <span className="font-semibold text-neutral-900">{count}</span>{' '}
      {count === 1 ? 'produit' : 'produits'}
    </p>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ProductListingDemo - Demo wrapper for optimized product cards
 *
 * Shows products in grid or list mode with view toggle.
 */
export function ProductListingDemo({
  products,
  initialViewMode = 'grid',
  showViewToggle = true,
  enableSelection = false,
  onAddToCart,
  onToggleFavorite,
  onToggleCompare,
  favoriteIds = new Set(),
  compareIds = new Set(),
  className,
}: ProductListingDemoProps) {
  const { viewMode, setViewMode } = useProductViewMode({ defaultMode: initialViewMode });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Selection handlers
  const handleSelectionChange = useCallback((productId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }, [products, selectedIds.size]);

  const isAllSelected = selectedIds.size === products.length && products.length > 0;

  // Grid layout classes based on view mode
  const gridClasses = useMemo(() => {
    if (viewMode === 'grid') {
      return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
    }
    return 'flex flex-col';
  }, [viewMode]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <ResultsCount count={products.length} />

        {showViewToggle && (
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
        )}
      </div>

      {/* List header (only for list/compact modes) */}
      {(viewMode === 'list' || viewMode === 'compact') && (
        <ProductCardListHeader
          selectable={enableSelection}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          showStock={true}
        />
      )}

      {/* Product grid/list */}
      <div className={gridClasses}>
        {products.map((product, index) => {
          const isFavorite = favoriteIds.has(product.id);
          const isComparing = compareIds.has(product.id);
          const isSelected = selectedIds.has(product.id);
          const priority = index < 8; // Priority load first 8 images

          if (viewMode === 'grid') {
            return (
              <ProductCardGridOptimized
                key={product.id}
                product={product}
                showStock={true}
                showVolumeDiscount={true}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                onToggleCompare={onToggleCompare}
                isFavorite={isFavorite}
                isComparing={isComparing}
                priority={priority}
              />
            );
          }

          return (
            <ProductCardListOptimized
              key={product.id}
              product={product}
              showStock={true}
              showVolumeDiscount={false}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              onToggleCompare={onToggleCompare}
              isFavorite={isFavorite}
              isComparing={isComparing}
              selectable={enableSelection}
              isSelected={isSelected}
              onSelectionChange={(selected) => handleSelectionChange(product.id, selected)}
              priority={priority}
              compact={viewMode === 'compact'}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-neutral-500">Aucun produit trouve</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Mock Data Generator (for demo purposes)
// ============================================================================

/**
 * Generate mock products for demo
 */
export function generateMockProducts(count: number = 12): Product[] {
  const brands = ['Cartier', 'Bulgari', 'Chopard', 'Van Cleef', 'Boucheron', 'Piaget'];
  const categories = ['Bagues', 'Colliers', 'Bracelets', 'Boucles d\'oreilles', 'Montres'];
  const materials = ['Or 18K', 'Or blanc', 'Or rose', 'Platine', 'Argent 925'];

  return Array.from({ length: count }, (_, i) => {
    const id = `prod_${String(i + 1).padStart(3, '0')}`;
    const brand = brands[i % brands.length];
    const category = categories[i % categories.length];
    const material = materials[i % materials.length];
    const basePrice = Math.floor(Math.random() * 5000) + 200;
    const hasDiscount = Math.random() > 0.7;
    const isNew = Math.random() > 0.8;
    const stock = Math.floor(Math.random() * 200);

    return {
      id,
      reference: `${brand.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      name: `${category.slice(0, -1)} ${material} - Collection ${brand}`,
      nameEn: `${category} ${material} - ${brand} Collection`,
      slug: `${category.toLowerCase()}-${material.toLowerCase().replace(/\s/g, '-')}-${id}`,
      description: `Magnifique ${category.toLowerCase()} en ${material.toLowerCase()} de la collection ${brand}.`,
      shortDescription: `${category} ${material}`,
      price: basePrice,
      compareAtPrice: hasDiscount ? Math.floor(basePrice * 1.25) : undefined,
      isPriceTTC: false,
      images: [`/images/products/placeholder-${(i % 4) + 1}.jpg`],
      categoryId: `cat_${category.toLowerCase()}`,
      category: {
        id: `cat_${category.toLowerCase()}`,
        name: category,
        slug: category.toLowerCase(),
        description: '',
        image: '',
        productCount: 0,
      },
      brand,
      materials: [material],
      stock,
      isAvailable: stock > 0,
      isNew,
      featured: Math.random() > 0.9,
      createdAt: new Date().toISOString(),
    } as Product;
  });
}

export default ProductListingDemo;
