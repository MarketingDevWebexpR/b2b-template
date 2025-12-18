'use client';

/**
 * SearchResults Component
 *
 * Main layout component for the search results page.
 * Combines all search-related components: filters, product grid, pagination.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  useSearch,
  useSearchFilters,
  useSearchPagination,
} from '@/contexts/SearchContext';
import { useCatalogFeatures } from '@/contexts/FeatureContext';
import type { Product } from '@/types';
import { Drawer, Button } from '@/components/ui';
import { SlidersHorizontal, X } from 'lucide-react';

// Sub-components
import { SearchFacets } from './SearchFacets';
import { SearchProductGrid, generateMockProducts } from './SearchProductGrid';
import { SearchPagination } from './SearchPagination';
import { SearchSortSelect } from './SearchSortSelect';
import { ViewModeToggle } from './ViewModeToggle';
import { ActiveFilters } from './ActiveFilters';

// ============================================================================
// Search Results Header
// ============================================================================

interface SearchResultsHeaderProps {
  query: string;
  totalResults: number;
  onOpenFilters?: () => void;
  showMobileFilterButton?: boolean;
  hasFilters?: boolean;
  hasSorting?: boolean;
}

function SearchResultsHeader({
  query,
  totalResults,
  onOpenFilters,
  showMobileFilterButton = true,
  hasFilters = true,
  hasSorting = true,
}: SearchResultsHeaderProps) {
  return (
    <div className="mb-6">
      {/* Title and count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          {query ? (
            <h1 className="text-2xl font-semibold text-neutral-900">
              Resultats pour "{query}"
            </h1>
          ) : (
            <h1 className="text-2xl font-semibold text-neutral-900">
              Tous les produits
            </h1>
          )}
        </div>
        <p className="text-sm text-neutral-600">
          {totalResults.toLocaleString('fr-FR')} produit{totalResults !== 1 ? 's' : ''} trouve{totalResults !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Active filters - only show if filters feature is enabled */}
      {hasFilters && <ActiveFilters className="mb-4" />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-neutral-50 rounded-lg border border-neutral-200">
        {/* Mobile filter button - only show if filters feature is enabled */}
        {hasFilters && showMobileFilterButton && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenFilters}
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        )}

        {/* Sort select - only show if sorting feature is enabled */}
        {hasSorting && (
          <div className="flex-1 flex justify-start lg:justify-start">
            <SearchSortSelect size="sm" />
          </div>
        )}

        {/* View mode toggle */}
        <ViewModeToggle className="hidden sm:flex" />
      </div>
    </div>
  );
}

// ============================================================================
// Mobile Filters Drawer
// ============================================================================

interface MobileFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileFiltersDrawer({ isOpen, onClose }: MobileFiltersDrawerProps) {
  const { hasActiveFilters, clearFilters } = useSearchFilters();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filtres"
      side="left"
      size="lg"
      footer={
        <div className="flex gap-3">
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={() => {
                clearFilters();
              }}
              className="flex-1"
            >
              Effacer tout
            </Button>
          )}
          <Button onClick={onClose} className="flex-1">
            Voir les resultats
          </Button>
        </div>
      }
    >
      <SearchFacets collapsible />
    </Drawer>
  );
}

// ============================================================================
// Main SearchResults Component
// ============================================================================

export interface SearchResultsProps {
  /** Initial search query from URL */
  initialQuery?: string;
  /** Initial products (for SSR) */
  initialProducts?: Product[];
  /** Custom class name */
  className?: string;
}

/**
 * SearchResults is the main layout component for search results
 */
export function SearchResults({
  initialQuery = '',
  initialProducts,
  className,
}: SearchResultsProps) {
  const searchParams = useSearchParams();
  const { state, setQuery, search } = useSearch();
  const { setPage, setPageSize, setSortBy } = useSearchPagination();
  const {
    toggleCategoryFilter,
    toggleBrandFilter,
    setPriceRange,
    setStockFilter,
  } = useSearchFilters();

  // Feature flags for catalog module
  const { hasFilters, hasSorting, isEnabled: isCatalogEnabled } = useCatalogFeatures();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(
    initialProducts || generateMockProducts(state.totalResults || 24)
  );

  // Sync URL params with search state on initial load
  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    const sort = searchParams.get('sort');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');

    if (q) setQuery(q);
    if (category) {
      category.split(',').forEach((c) => toggleCategoryFilter(c));
    }
    if (brand) {
      brand.split(',').forEach((b) => toggleBrandFilter(b));
    }
    if (priceMin && priceMax) {
      setPriceRange({ min: Number(priceMin), max: Number(priceMax) });
    }
    if (sort) {
      setSortBy(sort as Parameters<typeof setSortBy>[0]);
    }
    if (page) setPage(Number(page));
    if (pageSize) setPageSize(Number(pageSize));

    // Trigger search if there's a query
    if (q || initialQuery) {
      search(q || initialQuery);
    }
  }, []); // Only run once on mount

  // Update products when search results change
  useEffect(() => {
    if (state.totalResults > 0) {
      setProducts(generateMockProducts(Math.min(state.pageSize, state.totalResults)));
    }
  }, [state.totalResults, state.pageSize, state.currentPage, state.sortBy]);

  // Handlers
  const handleOpenMobileFilters = useCallback(() => {
    setIsMobileFiltersOpen(true);
  }, []);

  const handleCloseMobileFilters = useCallback(() => {
    setIsMobileFiltersOpen(false);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    // TODO: Integrate with cart context
    console.log('Add to cart:', product.id);
  }, []);

  const handleToggleWishlist = useCallback((product: Product) => {
    // TODO: Integrate with wishlist context
    console.log('Toggle wishlist:', product.id);
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    // TODO: Check wishlist context
    return false;
  }, []);

  const displayQuery = state.query || initialQuery;

  return (
    <div className={cn('w-full', className)}>
      {/* Header with search info and toolbar */}
      <SearchResultsHeader
        query={displayQuery}
        totalResults={state.totalResults || products.length}
        onOpenFilters={handleOpenMobileFilters}
        hasFilters={hasFilters}
        hasSorting={hasSorting}
      />

      {/* Main content area */}
      <div className="flex gap-8">
        {/* Sidebar filters (desktop) - Feature Gated */}
        {hasFilters && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <SearchFacets collapsible />
            </div>
          </aside>
        )}

        {/* Products grid */}
        <main className="flex-1 min-w-0">
          <SearchProductGrid
            products={products}
            isLoading={state.isSearching}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isInWishlist={isInWishlist}
          />

          {/* Pagination */}
          <div className="mt-8">
            <SearchPagination
              showInfo
              showPageSize
              pageSizeOptions={[12, 24, 48, 96]}
            />
          </div>
        </main>
      </div>

      {/* Mobile filters drawer - Feature Gated */}
      {hasFilters && (
        <MobileFiltersDrawer
          isOpen={isMobileFiltersOpen}
          onClose={handleCloseMobileFilters}
        />
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { SearchFacets } from './SearchFacets';
export { SearchProductGrid, generateMockProducts } from './SearchProductGrid';
export { SearchPagination, SearchPaginationCompact, SearchLoadMore } from './SearchPagination';
export { SearchSortSelect, SearchSortSelectInline } from './SearchSortSelect';
export { ViewModeToggle } from './ViewModeToggle';
export { ActiveFilters } from './ActiveFilters';
export { SearchResultsLive } from './SearchResultsLive';
export { BrandFilter } from './BrandFilter';
export type { BrandFilterItem, BrandFilterProps } from './BrandFilter';

export default SearchResults;
