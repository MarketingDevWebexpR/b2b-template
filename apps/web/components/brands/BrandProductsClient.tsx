'use client';

/**
 * BrandProductsClient Component
 *
 * Client-side wrapper for brand products with:
 * - URL state management for filters/sort/pagination
 * - Interactive filtering and sorting
 * - Responsive product grid
 * - Pagination with URL sync
 *
 * V3 API Integration:
 * - Uses brand_slug for product filtering
 * - has_stock filter uses string "true"/"false"
 * - Category filters use all_category_handles for hierarchy
 *
 * @packageDocumentation
 */

import { memo, useState, useCallback, useMemo, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3,
  LayoutList,
  SlidersHorizontal,
  Package,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Product } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface TransformedProduct {
  id: string;
  title: string;
  handle: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  images: string[];
  price: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  inStock: boolean;
  totalInventory: number;
  categories: Array<{ id: string; name: string; handle: string }>;
  tags: string[];
  createdAt: string;
}

interface FacetOption {
  value: string;
  label: string;
  count: number;
}

interface Facets {
  categories: FacetOption[];
  brands: FacetOption[];
  priceRanges: FacetOption[];
}

export interface BrandProductsClientProps {
  /** Products to display */
  products: TransformedProduct[];
  /** Brand name for context */
  brandName: string;
  /** Brand slug for URL */
  brandSlug: string;
  /** Total product count */
  totalProducts: number;
  /** Current page */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Page size */
  pageSize: number;
  /** Current sort value */
  sortBy: string;
  /** Available facets */
  facets: Facets;
  /** Active filters */
  activeFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SORT_OPTIONS = [
  { value: 'newest', label: 'Nouveautes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'name_asc', label: 'Nom A-Z' },
  { value: 'name_desc', label: 'Nom Z-A' },
  { value: 'popular', label: 'Popularite' },
];

const PRICE_RANGES = [
  { value: '0-5000', label: 'Moins de 50 EUR', min: 0, max: 5000 },
  { value: '5000-10000', label: '50 - 100 EUR', min: 5000, max: 10000 },
  { value: '10000-25000', label: '100 - 250 EUR', min: 10000, max: 25000 },
  { value: '25000-50000', label: '250 - 500 EUR', min: 25000, max: 50000 },
  { value: '50000-100000', label: '500 - 1000 EUR', min: 50000, max: 100000 },
  { value: '100000-', label: 'Plus de 1000 EUR', min: 100000, max: undefined },
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
 * Transforms API product to ProductCard Product type
 */
function transformToProduct(product: TransformedProduct): Product {
  return {
    id: product.id,
    name: product.title,
    slug: product.handle,
    price: product.price?.amount || 0,
    compareAtPrice: undefined,
    images: product.images.length > 0 ? product.images : (product.thumbnail ? [product.thumbnail] : []),
    category: product.categories[0]
      ? {
          id: product.categories[0].id,
          name: product.categories[0].name,
          slug: product.categories[0].handle,
          description: '',
          image: '',
          productCount: 0,
        }
      : undefined,
    categoryId: product.categories[0]?.id || '',
    stock: product.totalInventory,
    reference: product.id.slice(0, 8).toUpperCase(),
    description: product.description || '',
    shortDescription: product.subtitle || '',
    isNew: false,
    featured: false,
    isPriceTTC: false,
    isAvailable: product.inStock,
    materials: [],
    weightUnit: 'g',
    collection: product.categories[0]?.name,
    createdAt: product.createdAt,
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
  isPending: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
}

const Toolbar = memo(function Toolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  totalProducts,
  isPending,
  onToggleFilters,
  hasActiveFilters,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-neutral-50 rounded-lg border border-neutral-200">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <span className={cn(
          'text-sm text-neutral-600 transition-opacity',
          isPending && 'opacity-50'
        )}>
          {totalProducts.toLocaleString('fr-FR')} produit
          {totalProducts !== 1 ? 's' : ''}
        </span>

        {/* Mobile filter button */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={onToggleFilters}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres
          {hasActiveFilters && (
            <span className="ml-1.5 w-2 h-2 bg-accent rounded-full" />
          )}
        </Button>
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
          disabled={isPending}
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

interface ActiveFiltersProps {
  activeFilters: BrandProductsClientProps['activeFilters'];
  facets: Facets;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

const ActiveFilters = memo(function ActiveFilters({
  activeFilters,
  facets,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const filters: { key: string; label: string }[] = [];

  if (activeFilters.category) {
    const category = facets.categories.find(c => c.value === activeFilters.category);
    filters.push({
      key: 'category',
      label: category?.label || activeFilters.category,
    });
  }

  if (activeFilters.minPrice || activeFilters.maxPrice) {
    const priceKey = `${activeFilters.minPrice || '0'}-${activeFilters.maxPrice || ''}`;
    const priceRange = PRICE_RANGES.find(p => p.value === priceKey);
    filters.push({
      key: 'price',
      label: priceRange?.label || `${activeFilters.minPrice || '0'} - ${activeFilters.maxPrice || '...'} EUR`,
    });
  }

  if (activeFilters.inStock === 'true') {
    filters.push({
      key: 'inStock',
      label: 'En stock uniquement',
    });
  }

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-neutral-500">Filtres actifs:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="light"
          size="sm"
          className="gap-1.5 pr-1.5"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => onRemoveFilter(filter.key)}
            className="p-0.5 hover:bg-neutral-300 rounded-full transition-colors"
            aria-label={`Retirer le filtre ${filter.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm text-accent hover:text-orange-600 font-medium transition-colors"
      >
        Tout effacer
      </button>
    </div>
  );
});

ActiveFilters.displayName = 'ActiveFilters';

interface FilterPanelProps {
  facets: Facets;
  activeFilters: BrandProductsClientProps['activeFilters'];
  onFilterChange: (key: string, value: string | undefined) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel = memo(function FilterPanel({
  facets,
  activeFilters,
  onFilterChange,
  isOpen,
  onClose,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['categories', 'price', 'stock']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handlePriceChange = (priceRange: typeof PRICE_RANGES[0]) => {
    const currentKey = `${activeFilters.minPrice || '0'}-${activeFilters.maxPrice || ''}`;
    if (currentKey === priceRange.value) {
      // Deselect
      onFilterChange('minPrice', undefined);
      onFilterChange('maxPrice', undefined);
    } else {
      onFilterChange('minPrice', String(priceRange.min));
      onFilterChange('maxPrice', priceRange.max ? String(priceRange.max) : undefined);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Filter panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-80 bg-white z-50 transform transition-transform duration-300 lg:static lg:transform-none lg:w-64 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'hidden lg:block' // Hide on mobile unless isOpen
        )}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 lg:hidden">
          <h3 className="font-semibold text-neutral-900">Filtres</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] lg:max-h-none lg:overflow-visible">
          {/* Categories Filter */}
          {facets.categories.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full text-left"
              >
                <h4 className="text-sm font-semibold text-neutral-900">Categories</h4>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-neutral-500 transition-transform',
                    expandedSections.includes('categories') && 'rotate-180'
                  )}
                />
              </button>
              <AnimatePresence>
                {expandedSections.includes('categories') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      {facets.categories.slice(0, 10).map((category) => (
                        <label
                          key={category.value}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <Checkbox
                            checked={activeFilters.category === category.value}
                            onChange={(e) =>
                              onFilterChange(
                                'category',
                                e.target.checked ? category.value : undefined
                              )
                            }
                            size="sm"
                          />
                          <span className="text-sm text-neutral-700 group-hover:text-neutral-900 flex-1">
                            {category.label}
                          </span>
                          <span className="text-xs text-neutral-400">
                            ({category.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Price Filter */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-sm font-semibold text-neutral-900">Prix</h4>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-500 transition-transform',
                  expandedSections.includes('price') && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {expandedSections.includes('price') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {PRICE_RANGES.map((range) => {
                      const currentKey = `${activeFilters.minPrice || '0'}-${activeFilters.maxPrice || ''}`;
                      const isSelected = currentKey === range.value;
                      return (
                        <label
                          key={range.value}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handlePriceChange(range)}
                            size="sm"
                          />
                          <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                            {range.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stock Filter */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('stock')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-sm font-semibold text-neutral-900">Disponibilite</h4>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-500 transition-transform',
                  expandedSections.includes('stock') && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {expandedSections.includes('stock') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={activeFilters.inStock === 'true'}
                        onChange={(e) =>
                          onFilterChange('inStock', e.target.checked ? 'true' : undefined)
                        }
                        size="sm"
                      />
                      <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                        En stock uniquement
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
});

FilterPanel.displayName = 'FilterPanel';

interface EmptyStateProps {
  brandName: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

const EmptyState = memo(function EmptyState({
  brandName,
  hasFilters,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
        <Package className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {hasFilters ? 'Aucun produit trouve' : 'Aucun produit disponible'}
      </h3>
      <p className="text-neutral-500 max-w-sm mb-6">
        {hasFilters
          ? 'Essayez de modifier vos filtres pour voir plus de produits.'
          : `Les produits de la marque ${brandName} seront bientot disponibles dans notre catalogue.`}
      </p>
      {hasFilters ? (
        <Button variant="primary" onClick={onClearFilters}>
          Effacer les filtres
        </Button>
      ) : (
        <a
          href="/produits"
          className="inline-flex items-center justify-center h-11 px-6 text-base font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Voir tous les produits
        </a>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// ============================================================================
// Main Component
// ============================================================================

/**
 * BrandProductsClient - Client-side product grid with URL state
 *
 * @example
 * ```tsx
 * <BrandProductsClient
 *   products={products}
 *   brandName="Cartier"
 *   brandSlug="cartier"
 *   totalProducts={150}
 *   currentPage={1}
 *   totalPages={7}
 *   pageSize={24}
 *   sortBy="newest"
 *   facets={facets}
 *   activeFilters={{}}
 * />
 * ```
 */
export const BrandProductsClient = memo(function BrandProductsClient({
  products,
  brandName,
  brandSlug,
  totalProducts,
  currentPage,
  totalPages,
  pageSize,
  sortBy,
  facets,
  activeFilters,
  className,
}: BrandProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        activeFilters.category ||
          activeFilters.minPrice ||
          activeFilters.maxPrice ||
          activeFilters.inStock
      ),
    [activeFilters]
  );

  // Update URL with new params
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change (except for page changes)
      if (!('page' in updates)) {
        params.delete('page');
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  // Handlers
  const handleSortChange = useCallback(
    (value: string) => {
      updateSearchParams({ sort: value });
    },
    [updateSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateSearchParams({ page: page === 1 ? undefined : String(page) });
      // Scroll to products section
      document.getElementById('brand-products')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
    [updateSearchParams]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | undefined) => {
      if (key === 'price') {
        updateSearchParams({ minPrice: undefined, maxPrice: undefined });
      } else {
        updateSearchParams({ [key]: value });
      }
    },
    [updateSearchParams]
  );

  const handleRemoveFilter = useCallback(
    (key: string) => {
      if (key === 'price') {
        updateSearchParams({ minPrice: undefined, maxPrice: undefined });
      } else {
        updateSearchParams({ [key]: undefined });
      }
    },
    [updateSearchParams]
  );

  const handleClearAllFilters = useCallback(() => {
    updateSearchParams({
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
    });
  }, [updateSearchParams]);

  // Transform products for ProductCard
  const transformedProducts = useMemo(
    () => products.map(transformToProduct),
    [products]
  );

  // Empty state
  if (products.length === 0) {
    return (
      <EmptyState
        brandName={brandName}
        hasFilters={hasActiveFilters}
        onClearFilters={handleClearAllFilters}
      />
    );
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
        isPending={isPending}
        onToggleFilters={() => setIsFilterPanelOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Active Filters */}
      <ActiveFilters
        activeFilters={activeFilters}
        facets={facets}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Main content with optional filter sidebar */}
      <div className="flex gap-8">
        {/* Filter Panel (desktop sidebar) */}
        <FilterPanel
          facets={facets}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
        />

        {/* Product Grid */}
        <div className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`${currentPage}-${sortBy}`} // Re-animate on page/sort change
            className={cn(
              'grid gap-4',
              viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1',
              isPending && 'opacity-50 pointer-events-none'
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
                Page {currentPage} sur {totalPages} ({totalProducts.toLocaleString('fr-FR')}{' '}
                produits)
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={1}
                size="md"
                disabled={isPending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

BrandProductsClient.displayName = 'BrandProductsClient';

export default BrandProductsClient;
