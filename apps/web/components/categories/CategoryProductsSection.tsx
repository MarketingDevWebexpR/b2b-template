import Link from 'next/link';
import Image from 'next/image';
import { Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ProductFilters } from './ProductFilters';
import { ProductSortSelect } from './ProductSortSelect';
import { PaginationClient } from './PaginationClient';

/**
 * CategoryProductsSection - Server component for product listing
 *
 * Features:
 * - Server-side data fetching with caching
 * - Product grid with responsive layout
 * - Integrated filters and sorting
 * - URL-based pagination
 * - Loading and error states
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

export interface TransformedProduct {
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

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface Facets {
  categories: FacetOption[];
  brands: FacetOption[];
  priceRanges: FacetOption[];
}

export interface ProductsResponse {
  products: TransformedProduct[];
  total: number;
  facets: Facets;
  limit: number;
  offset: number;
}

export interface CategoryProductsSectionProps {
  /** Category handle to filter products */
  categoryHandle: string;
  /** Category name for display */
  categoryName: string;
  /** Search params from URL */
  searchParams: {
    sort?: string;
    page?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    priceRange?: string;
    inStock?: string;
  };
  /** Number of products per page */
  pageSize?: number;
  /** Show filters sidebar */
  showFilters?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const DEFAULT_PAGE_SIZE = 20;
const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

// ============================================================================
// Data Fetching
// ============================================================================

async function fetchProducts(
  categoryHandle: string,
  searchParams: CategoryProductsSectionProps['searchParams'],
  pageSize: number
): Promise<ProductsResponse | null> {
  try {
    const params = new URLSearchParams();
    params.set('category', categoryHandle);
    params.set('limit', String(pageSize));

    // Pagination
    const page = parseInt(searchParams.page || '1', 10);
    const offset = (page - 1) * pageSize;
    params.set('offset', String(offset));

    // Sorting
    if (searchParams.sort) {
      params.set('sort', searchParams.sort);
    }

    // Brand filter
    if (searchParams.brand) {
      params.set('brand', searchParams.brand);
    }

    // Price filters
    if (searchParams.minPrice) {
      params.set('minPrice', searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      params.set('maxPrice', searchParams.maxPrice);
    }

    // In stock filter
    if (searchParams.inStock === 'true') {
      params.set('inStock', 'true');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/catalog/products?${params.toString()}`,
      {
        next: { revalidate: 120 }, // Cache for 2 minutes
      }
    );

    if (!response.ok) {
      console.error(`[CategoryProductsSection] API error: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('[CategoryProductsSection] Error fetching products:', error);
    return null;
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Product Card for category grid
 */
interface ProductCardProps {
  product: TransformedProduct;
  priority?: boolean;
}

function CategoryProductCard({ product, priority = false }: ProductCardProps) {
  const imageUrl = product.thumbnail || product.images[0] || PLACEHOLDER_IMAGE;
  const isNew =
    new Date(product.createdAt).getTime() >
    Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

  return (
    <Link
      href={`/produit/${product.handle}`}
      className="group block"
      aria-label={`Voir ${product.title}`}
    >
      <article
        className={cn(
          'bg-white rounded-xl border border-neutral-200 overflow-hidden',
          'transition-all duration-300',
          'hover:shadow-lg hover:border-neutral-300 hover:-translate-y-1'
        )}
      >
        {/* Image */}
        <div className="aspect-square relative bg-neutral-50 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-transform duration-500',
              'group-hover:scale-105'
            )}
            priority={priority}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && (
              <Badge variant="dark" size="sm">
                Nouveau
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="error" size="sm">
                Rupture
              </Badge>
            )}
          </div>

          {/* Stock indicator */}
          {product.inStock && product.totalInventory <= 5 && (
            <div className="absolute bottom-3 left-3">
              <Badge
                variant="warning"
                size="sm"
                className="bg-amber-50 text-amber-700 border border-amber-200"
              >
                Stock faible
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Category */}
          {product.categories[0] && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {product.categories[0].name}
            </p>
          )}

          {/* Title */}
          <h3
            className={cn(
              'text-sm font-medium text-neutral-900 line-clamp-2 min-h-[2.5rem]',
              'transition-colors group-hover:text-accent'
            )}
          >
            {product.title}
          </h3>

          {/* Stock status */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                product.inStock ? 'bg-emerald-500' : 'bg-red-500'
              )}
            />
            <span
              className={cn(
                'text-xs',
                product.inStock ? 'text-emerald-700' : 'text-red-700'
              )}
            >
              {product.inStock ? 'En stock' : 'Rupture'}
            </span>
          </div>

          {/* Price */}
          <div className="pt-2 border-t border-neutral-100">
            {product.price ? (
              <p className="text-lg font-bold text-neutral-900">
                {product.price.formatted}
                <span className="text-xs font-normal text-neutral-400 ml-1">
                  HT
                </span>
              </p>
            ) : (
              <p className="text-sm text-neutral-500">Prix sur demande</p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * Empty state when no products found
 */
function EmptyProductsState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
        <Package className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        Aucun produit trouve
      </h3>
      <p className="text-neutral-600 max-w-md mx-auto mb-6">
        {hasFilters
          ? 'Aucun produit ne correspond a vos criteres de recherche. Essayez de modifier ou reinitialiser vos filtres.'
          : 'Cette categorie ne contient pas encore de produits.'}
      </p>
      {hasFilters && (
        <Link
          href="?"
          className={cn(
            'inline-flex items-center justify-center',
            'h-11 px-6 text-base gap-2',
            'bg-white text-neutral-700',
            'border border-neutral-300 rounded-lg',
            'hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-900',
            'transition-all duration-200'
          )}
        >
          Reinitialiser les filtres
        </Link>
      )}
    </div>
  );
}

/**
 * Error state
 */
function ErrorState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        Erreur de chargement
      </h3>
      <p className="text-neutral-600 max-w-md mx-auto">
        Impossible de charger les produits pour le moment. Veuillez reessayer
        ulterieurement.
      </p>
    </div>
  );
}

/**
 * Products Grid Component
 */
interface ProductsGridProps {
  products: TransformedProduct[];
}

function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      role="list"
      aria-label="Liste des produits"
    >
      {products.map((product, index) => (
        <div key={product.id} role="listitem">
          <CategoryProductCard product={product} priority={index < 4} />
        </div>
      ))}
    </div>
  );
}

/**
 * Pagination info and controls
 */
interface PaginationSectionProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

function PaginationSection({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: PaginationSectionProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-neutral-600">
        Affichage {startItem}-{endItem} sur {totalItems.toLocaleString('fr-FR')}{' '}
        produits
      </p>
      <PaginationClient currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export async function CategoryProductsSection({
  categoryHandle,
  categoryName,
  searchParams,
  pageSize = DEFAULT_PAGE_SIZE,
  showFilters = true,
  className,
}: CategoryProductsSectionProps) {
  const data = await fetchProducts(categoryHandle, searchParams, pageSize);

  // Calculate pagination
  const currentPage = parseInt(searchParams.page || '1', 10);
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  // Check if any filters are active
  const hasFilters = Boolean(
    searchParams.brand ||
      searchParams.minPrice ||
      searchParams.maxPrice ||
      searchParams.inStock
  );

  // Error state
  if (!data) {
    return (
      <section className={cn('bg-white rounded-xl border border-neutral-200 p-6', className)}>
        <ErrorState />
      </section>
    );
  }

  // Empty state
  if (data.products.length === 0 && data.total === 0) {
    return (
      <section className={cn('bg-white rounded-xl border border-neutral-200 p-6', className)}>
        <EmptyProductsState hasFilters={hasFilters} />
      </section>
    );
  }

  return (
    <section className={className}>
      {/* Header with count and sort */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Produits</h2>
            <p className="text-sm text-neutral-500 mt-1">
              {data.total.toLocaleString('fr-FR')} produit
              {data.total !== 1 ? 's' : ''} dans {categoryName}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ProductSortSelect size="sm" />
          </div>
        </div>

        {/* Main content area */}
        <div className={cn(showFilters && 'lg:grid lg:grid-cols-[240px_1fr] lg:gap-8')}>
          {/* Filters sidebar */}
          {showFilters && (
            <ProductFilters
              brands={data.facets.brands}
              priceRanges={data.facets.priceRanges}
              totalCount={data.total}
            />
          )}

          {/* Products grid */}
          <div>
            <ProductsGrid products={data.products} />

            {/* Pagination */}
            <PaginationSection
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={data.total}
              pageSize={pageSize}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoryProductsSection;
