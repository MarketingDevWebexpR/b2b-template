import { Suspense } from 'react';
import { BrandProductsClient } from './BrandProductsClient';
import { Skeleton } from '@/components/ui/Skeleton';

// ============================================================================
// Types
// ============================================================================

export interface BrandProductsSectionProps {
  /** Brand slug for API filtering */
  brandSlug: string;
  /** Brand name for display */
  brandName: string;
  /** Search params from URL */
  searchParams: {
    page?: string;
    sort?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  };
}

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

interface ProductsResponse {
  products: TransformedProduct[];
  total: number;
  facets: Facets;
  limit: number;
  offset: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PAGE_SIZE = 24;
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Fetch products from the catalog API with brand filter
 */
async function fetchBrandProducts(
  brandSlug: string,
  params: BrandProductsSectionProps['searchParams']
): Promise<ProductsResponse> {
  const page = params.page ? parseInt(params.page, 10) : 1;
  const offset = (page - 1) * DEFAULT_PAGE_SIZE;

  const searchParams = new URLSearchParams();
  searchParams.set('brand', brandSlug);
  searchParams.set('limit', String(DEFAULT_PAGE_SIZE));
  searchParams.set('offset', String(offset));

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  if (params.category) {
    searchParams.set('category', params.category);
  }

  if (params.minPrice) {
    searchParams.set('minPrice', params.minPrice);
  }

  if (params.maxPrice) {
    searchParams.set('maxPrice', params.maxPrice);
  }

  if (params.inStock) {
    searchParams.set('inStock', params.inStock);
  }

  const url = `${API_BASE_URL}/api/catalog/products?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 120 }, // Cache for 2 minutes
    });

    if (!response.ok) {
      console.error(`[BrandProductsSection] API error: ${response.status}`);
      return {
        products: [],
        total: 0,
        facets: { categories: [], brands: [], priceRanges: [] },
        limit: DEFAULT_PAGE_SIZE,
        offset: 0,
      };
    }

    return response.json();
  } catch (error) {
    console.error('[BrandProductsSection] Fetch error:', error);
    return {
      products: [],
      total: 0,
      facets: { categories: [], brands: [], priceRanges: [] },
      limit: DEFAULT_PAGE_SIZE,
      offset: 0,
    };
  }
}

// ============================================================================
// Loading Component
// ============================================================================

export function BrandProductsSectionLoading() {
  return (
    <div className="space-y-6">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-4">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-full" />
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

      {/* Pagination skeleton */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="w-10 h-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Content Component (Server)
// ============================================================================

async function BrandProductsContent({
  brandSlug,
  brandName,
  searchParams,
}: BrandProductsSectionProps) {
  const data = await fetchBrandProducts(brandSlug, searchParams);

  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const totalPages = Math.ceil(data.total / DEFAULT_PAGE_SIZE);

  return (
    <BrandProductsClient
      products={data.products}
      brandName={brandName}
      brandSlug={brandSlug}
      totalProducts={data.total}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={DEFAULT_PAGE_SIZE}
      sortBy={searchParams.sort || 'newest'}
      facets={data.facets}
      activeFilters={{
        category: searchParams.category,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        inStock: searchParams.inStock,
      }}
    />
  );
}

// ============================================================================
// Main Component (Server with Suspense)
// ============================================================================

/**
 * BrandProductsSection - Server Component for brand products
 *
 * Features:
 * - Server-side data fetching from catalog API
 * - Pagination support via searchParams
 * - Sorting and filtering
 * - Suspense loading state
 * - Faceted search support
 *
 * @example
 * ```tsx
 * <BrandProductsSection
 *   brandSlug="cartier"
 *   brandName="Cartier"
 *   searchParams={{ page: '1', sort: 'newest' }}
 * />
 * ```
 */
export async function BrandProductsSection(props: BrandProductsSectionProps) {
  return (
    <Suspense fallback={<BrandProductsSectionLoading />}>
      <BrandProductsContent {...props} />
    </Suspense>
  );
}

export default BrandProductsSection;
