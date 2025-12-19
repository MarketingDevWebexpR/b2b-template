'use client';

/**
 * SearchResultsLive Component
 *
 * Live search results using search API through Medusa backend.
 * Displays real product data from the backend search service.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useProductSearch } from '@/hooks/use-search-api';
import type { ProductSearchResult } from '@/lib/search';
import { Container, Button, Skeleton, Badge } from '@/components/ui';
import {
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Heart,
  Package,
  Loader2,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface SearchResultsLiveProps {
  /** Initial search query */
  initialQuery?: string;
  /** Initial category filter */
  initialCategory?: string;
  /** Page size */
  pageSize?: number;
}

interface FilterState {
  category?: string;
  brand?: string;
  material?: string;
  tags?: string[];
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

// ============================================================================
// Constants
// ============================================================================

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'newest', label: 'Nouveautés' },
];

// ============================================================================
// Sub-components
// ============================================================================

interface ProductCardProps {
  product: ProductSearchResult;
  viewMode: ViewMode;
  onAddToCart?: (product: ProductSearchResult) => void;
  onToggleWishlist?: (product: ProductSearchResult) => void;
  isInWishlist?: boolean;
}

function ProductCard({
  product,
  viewMode,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = imageError || !product.thumbnail ? PLACEHOLDER_IMAGE : product.thumbnail;
  const displayPrice = product.price_min ? formatPrice(product.price_min / 100) : null;

  if (viewMode === 'list') {
    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'group flex gap-4 md:gap-6 p-4',
          'bg-white rounded-lg border border-neutral-200',
          'hover:shadow-md hover:border-neutral-300',
          'transition-all duration-200'
        )}
      >
        {/* Image */}
        <Link
          href={`/products/${product.handle}`}
          className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100"
        >
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            sizes="128px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
          {product.has_stock && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500" />
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/products/${product.handle}`}>
                <h3 className="font-medium text-neutral-900 group-hover:text-accent transition-colors line-clamp-1">
                  {product.title}
                </h3>
              </Link>
              {product.sku && (
                <p className="text-xs text-neutral-500 mt-0.5">Ref: {product.sku}</p>
              )}
              {product.categories?.[0] && (
                <p className="text-xs text-neutral-400 mt-0.5">{product.categories[0].name}</p>
              )}
            </div>
            <button
              onClick={() => onToggleWishlist?.(product)}
              className={cn(
                'p-2 rounded-full transition-colors',
                isInWishlist
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between mt-3">
            <div>
              {displayPrice && (
                <span className="font-semibold text-lg text-neutral-900">{displayPrice}</span>
              )}
              <div className="flex items-center gap-2 mt-1">
                {product.has_stock ? (
                  <Badge variant="success" size="sm">
                    <Package className="w-3 h-3 mr-1" />
                    En stock
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">Sur commande</Badge>
                )}
              </div>
            </div>
            <Button size="sm" onClick={() => onAddToCart?.(product)}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </motion.article>
    );
  }

  // Grid view
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group',
        'bg-white rounded-lg border border-neutral-200 overflow-hidden',
        'hover:shadow-md hover:border-neutral-300',
        'transition-all duration-200'
      )}
    >
      {/* Image */}
      <Link href={`/products/${product.handle}`} className="block relative aspect-square">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.has_stock && (
            <Badge variant="success" size="sm">En stock</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist?.(product);
          }}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isInWishlist ? 'text-red-500' : 'text-neutral-400 hover:text-neutral-600'
          )}
        >
          <Heart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4">
        {product.sku && (
          <p className="text-xs text-neutral-400 mb-1">Ref: {product.sku}</p>
        )}
        <Link href={`/products/${product.handle}`}>
          <h3 className="font-medium text-sm text-neutral-900 group-hover:text-accent transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>
        </Link>
        {product.brand && (
          <p className="text-xs text-neutral-500 mt-1">{product.brand}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          {displayPrice ? (
            <span className="font-semibold text-neutral-900">{displayPrice}</span>
          ) : (
            <span className="text-sm text-neutral-500">Prix sur demande</span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddToCart?.(product)}
            className="h-8 w-8 p-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

interface FacetSectionProps {
  title: string;
  facets: Record<string, number>;
  selectedValues: string[];
  onToggle: (value: string) => void;
  initiallyExpanded?: boolean;
}

function FacetSection({
  title,
  facets,
  selectedValues,
  onToggle,
  initiallyExpanded = true,
}: FacetSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const entries = Object.entries(facets).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  return (
    <div className="border-b border-neutral-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <span className="font-medium text-sm text-neutral-900">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-2">
              {entries.slice(0, 10).map(([value, count]) => (
                <label
                  key={value}
                  className={cn(
                    'flex items-center justify-between py-1.5 px-2 -mx-2',
                    'rounded cursor-pointer hover:bg-neutral-50',
                    'transition-colors duration-150'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(value)}
                      onChange={() => onToggle(value)}
                      className="w-4 h-4 rounded border-neutral-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-neutral-700">{value}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{count}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SearchResultsLive({
  initialQuery = '',
  initialCategory,
  pageSize = 24,
}: SearchResultsLiveProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const queryFromUrl = searchParams.get('q') || initialQuery;
  const categoryFromUrl = searchParams.get('category') || initialCategory;
  const sortFromUrl = (searchParams.get('sort') as SortOption) || 'relevance';

  // State
  const [filters, setFilters] = useState<FilterState>({
    category: categoryFromUrl,
  });
  const [sortBy, setSortBy] = useState<SortOption>(sortFromUrl);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Search hook - memoize options to prevent infinite re-renders
  const searchOptions = useMemo(() => ({ limit: pageSize, facets: true }), [pageSize]);
  const {
    products,
    total,
    isLoading,
    error,
    facetDistribution,
    search,
    loadMore,
    hasMore,
    clear,
  } = useProductSearch(searchOptions);

  // Initial search
  const hasSearched = useRef(false);
  useEffect(() => {
    if (!hasSearched.current && queryFromUrl) {
      hasSearched.current = true;
      const sortField = getSortField(sortBy);
      const sortOrder = getSortOrder(sortBy);

      search(queryFromUrl, {
        category: filters.category,
        brand: filters.brand,
        material: filters.material,
        tags: filters.tags?.join(','),
        inStock: filters.inStock,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        sort: sortField,
        order: sortOrder,
      });
    }
  }, [queryFromUrl, filters, sortBy, search]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (queryFromUrl) params.set('q', queryFromUrl);
    if (filters.category) params.set('category', filters.category);
    if (sortBy !== 'relevance') params.set('sort', sortBy);

    const newUrl = `${pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [queryFromUrl, filters, sortBy, pathname]);

  // Helper functions
  function getSortField(sort: SortOption): string | undefined {
    switch (sort) {
      case 'price_asc':
      case 'price_desc':
        return 'price_min';
      case 'newest':
        return 'created_at';
      default:
        return undefined;
    }
  }

  function getSortOrder(sort: SortOption): 'asc' | 'desc' {
    return sort === 'price_desc' ? 'desc' : 'asc';
  }

  // Handlers
  const handleSearch = useCallback(() => {
    const sortField = getSortField(sortBy);
    const sortOrder = getSortOrder(sortBy);

    search(queryFromUrl, {
      category: filters.category,
      brand: filters.brand,
      material: filters.material,
      tags: filters.tags?.join(','),
      inStock: filters.inStock,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      sort: sortField,
      order: sortOrder,
    });
  }, [queryFromUrl, filters, sortBy, search]);

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string | boolean | undefined) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };
        return newFilters;
      });
    },
    []
  );

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
  }, []);

  // Re-search when filters or sort change
  // Note: We intentionally exclude handleSearch from deps to prevent infinite loops
  // handleSearch is stable for the current filters/sortBy values
  const filtersRef = useRef(filters);
  const sortByRef = useRef(sortBy);

  useEffect(() => {
    // Skip if this is the initial render or filters/sort haven't actually changed
    if (!hasSearched.current) return;

    const filtersChanged = JSON.stringify(filtersRef.current) !== JSON.stringify(filters);
    const sortChanged = sortByRef.current !== sortBy;

    if (filtersChanged || sortChanged) {
      filtersRef.current = filters;
      sortByRef.current = sortBy;
      handleSearch();
    }
  }, [filters, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = useCallback((product: ProductSearchResult) => {
    console.log('Add to cart:', product.id);
    // TODO: Integrate with cart
  }, []);

  const handleToggleWishlist = useCallback((product: ProductSearchResult) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(product.id)) {
        newSet.delete(product.id);
      } else {
        newSet.add(product.id);
      }
      return newSet;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            {queryFromUrl ? (
              <h1 className="text-2xl font-semibold text-neutral-900">
                Résultats pour "{queryFromUrl}"
              </h1>
            ) : (
              <h1 className="text-2xl font-semibold text-neutral-900">Tous les produits</h1>
            )}
          </div>
          <p className="text-sm text-neutral-600">
            {total.toLocaleString('fr-FR')} produit{total !== 1 ? 's' : ''} trouvé
            {total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {filters.category && (
              <button
                type="button"
                onClick={() => handleFilterChange('category', undefined)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Catégorie: {filters.category}
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.brand && (
              <button
                type="button"
                onClick={() => handleFilterChange('brand', undefined)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Marque: {filters.brand}
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.inStock && (
              <button
                type="button"
                onClick={() => handleFilterChange('inStock', undefined)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                En stock uniquement
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs text-accent hover:text-accent/80"
            >
              Effacer tout
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-neutral-50 rounded-lg border border-neutral-200">
          {/* Mobile filter button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
          </Button>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 hidden sm:inline">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className={cn(
                'text-sm border border-neutral-200 rounded-lg px-3 py-2',
                'bg-white focus:outline-none focus:ring-2 focus:ring-accent/20'
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View mode */}
          <div className="hidden sm:flex items-center gap-1 border border-neutral-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded',
                viewMode === 'grid'
                  ? 'bg-accent text-white'
                  : 'text-neutral-500 hover:text-neutral-700'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded',
                viewMode === 'list'
                  ? 'bg-accent text-white'
                  : 'text-neutral-500 hover:text-neutral-700'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-8">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-lg border border-neutral-200 p-4">
            <h2 className="font-semibold text-neutral-900 mb-4">Filtres</h2>

            {/* Category facet */}
            {facetDistribution?.['categories.name'] && (
              <FacetSection
                title="Catégories"
                facets={facetDistribution['categories.name']}
                selectedValues={filters.category ? [filters.category] : []}
                onToggle={(value) =>
                  handleFilterChange('category', filters.category === value ? undefined : value)
                }
              />
            )}

            {/* Brand facet */}
            {facetDistribution?.['brand'] && (
              <FacetSection
                title="Marques"
                facets={facetDistribution['brand']}
                selectedValues={filters.brand ? [filters.brand] : []}
                onToggle={(value) =>
                  handleFilterChange('brand', filters.brand === value ? undefined : value)
                }
              />
            )}

            {/* Material facet */}
            {facetDistribution?.['material'] && (
              <FacetSection
                title="Matériau"
                facets={facetDistribution['material']}
                selectedValues={filters.material ? [filters.material] : []}
                onToggle={(value) =>
                  handleFilterChange('material', filters.material === value ? undefined : value)
                }
                initiallyExpanded={false}
              />
            )}

            {/* Stock filter */}
            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock ?? false}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
                  className="w-4 h-4 rounded border-neutral-300 text-accent focus:ring-accent"
                />
                <span className="text-sm text-neutral-700">En stock uniquement</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products */}
        <main className="flex-1 min-w-0">
          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={handleSearch}>Réessayer</Button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && products.length === 0 && (
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1'
              )}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-neutral-200 overflow-hidden"
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
          )}

          {/* Empty state */}
          {!isLoading && products.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-lg text-neutral-600 mb-2">Aucun produit trouvé</p>
              <p className="text-sm text-neutral-500 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={handleClearFilters}>
                  Effacer les filtres
                </Button>
              )}
            </div>
          )}

          {/* Products grid/list */}
          {products.length > 0 && (
            <>
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1'
                )}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={wishlist.has(product.id)}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button variant="secondary" onClick={loadMore} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      'Charger plus de produits'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-full bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                  <h2 className="font-semibold text-neutral-900">Filtres</h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Category facet */}
                  {facetDistribution?.['categories.name'] && (
                    <FacetSection
                      title="Catégories"
                      facets={facetDistribution['categories.name']}
                      selectedValues={filters.category ? [filters.category] : []}
                      onToggle={(value) =>
                        handleFilterChange('category', filters.category === value ? undefined : value)
                      }
                    />
                  )}

                  {/* Brand facet */}
                  {facetDistribution?.['brand'] && (
                    <FacetSection
                      title="Marques"
                      facets={facetDistribution['brand']}
                      selectedValues={filters.brand ? [filters.brand] : []}
                      onToggle={(value) =>
                        handleFilterChange('brand', filters.brand === value ? undefined : value)
                      }
                    />
                  )}

                  {/* Stock filter */}
                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock ?? false}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
                        className="w-4 h-4 rounded border-neutral-300 text-accent focus:ring-accent"
                      />
                      <span className="text-sm text-neutral-700">En stock uniquement</span>
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-200 space-y-2">
                  {hasActiveFilters && (
                    <Button variant="secondary" className="w-full" onClick={handleClearFilters}>
                      Effacer tout
                    </Button>
                  )}
                  <Button className="w-full" onClick={() => setIsMobileFiltersOpen(false)}>
                    Voir {total} produit{total !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchResultsLive;
