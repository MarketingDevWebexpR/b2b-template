import { Suspense } from 'react';
import { BrandProductsClient } from './BrandProductsClient';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  APP_SEARCH_CONFIG,
  getAppSearchUrl,
  type ProductHit,
  type AppSearchResponse,
  transformProductHit,
  PRODUCT_RESULT_FIELDS,
  PRODUCT_SEARCH_FIELDS,
  PRODUCT_FACETS,
} from '@/lib/search/app-search-v3';

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
const CACHE_REVALIDATE_SECONDS = 120; // 2 minutes

// ============================================================================
// Sort Configuration
// ============================================================================

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'popular';

const SORT_MAP: Record<SortOption, string> = {
  name_asc: 'title',
  name_desc: 'title',
  price_asc: 'price_min',
  price_desc: 'price_min',
  newest: 'created_at',
  popular: 'created_at',
};

const ORDER_MAP: Record<SortOption, 'asc' | 'desc'> = {
  name_asc: 'asc',
  name_desc: 'desc',
  price_asc: 'asc',
  price_desc: 'desc',
  newest: 'desc',
  popular: 'desc',
};

// ============================================================================
// Price Ranges
// ============================================================================

function generatePriceRanges(): FacetOption[] {
  return [
    { value: '0-5000', label: 'Moins de 50 EUR', count: 0 },
    { value: '5000-10000', label: '50 - 100 EUR', count: 0 },
    { value: '10000-25000', label: '100 - 250 EUR', count: 0 },
    { value: '25000-50000', label: '250 - 500 EUR', count: 0 },
    { value: '50000-100000', label: '500 - 1000 EUR', count: 0 },
    { value: '100000-', label: 'Plus de 1000 EUR', count: 0 },
  ];
}

// ============================================================================
// Data Fetching - Direct App Search v3
// ============================================================================

/**
 * Fetch products directly from App Search v3 with brand filter
 * This is more reliable than calling an API route from a Server Component
 */
async function fetchBrandProducts(
  brandSlug: string,
  params: BrandProductsSectionProps['searchParams']
): Promise<ProductsResponse> {
  const page = params.page ? parseInt(params.page, 10) : 1;
  const offset = (page - 1) * DEFAULT_PAGE_SIZE;
  const sortKey = (params.sort || 'newest') as SortOption;

  // Build filters array
  const filters: Record<string, unknown>[] = [
    { doc_type: 'products' },
    { brand_slug: brandSlug },
  ];

  // Category filter - use all_category_handles for hierarchical filtering
  if (params.category) {
    filters.push({ all_category_handles: params.category });
  }

  // Stock filter - V3 uses string "true"/"false"
  if (params.inStock === 'true') {
    filters.push({ has_stock: 'true' });
  }

  // Price filters
  if (params.minPrice || params.maxPrice) {
    const priceFilter: { from?: number; to?: number } = {};
    if (params.minPrice) priceFilter.from = parseInt(params.minPrice, 10);
    if (params.maxPrice) priceFilter.to = parseInt(params.maxPrice, 10);
    filters.push({ price_min: priceFilter });
  }

  // Build query
  const query = {
    query: '',
    page: {
      size: DEFAULT_PAGE_SIZE,
      current: page,
    },
    filters: { all: filters },
    result_fields: PRODUCT_RESULT_FIELDS,
    search_fields: PRODUCT_SEARCH_FIELDS,
    facets: PRODUCT_FACETS,
    sort: [{ [SORT_MAP[sortKey]]: ORDER_MAP[sortKey] }],
  };

  try {
    const appSearchUrl = getAppSearchUrl();

    console.log('[BrandProductsSection] Calling App Search v3 directly for brand:', brandSlug);

    const response = await fetch(appSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APP_SEARCH_CONFIG.publicKey}`,
      },
      body: JSON.stringify(query),
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['products', `brand-products-${brandSlug}`],
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[BrandProductsSection] App Search error: ${response.status}`, errorText);
      return {
        products: [],
        total: 0,
        facets: { categories: [], brands: [], priceRanges: generatePriceRanges() },
        limit: DEFAULT_PAGE_SIZE,
        offset,
      };
    }

    const data: AppSearchResponse<ProductHit> = await response.json();

    console.log('[BrandProductsSection] Got', data.results?.length || 0, 'products for brand:', brandSlug);

    // Transform products
    const products = data.results.map((hit) => {
      const transformed = transformProductHit(hit);
      return {
        id: transformed.id,
        title: transformed.title,
        handle: transformed.handle,
        subtitle: null,
        description: transformed.description,
        thumbnail: transformed.thumbnail,
        images: transformed.images,
        price: transformed.price_min !== null
          ? {
              amount: transformed.price_min,
              currency: 'EUR',
              formatted: formatPrice(transformed.price_min),
            }
          : null,
        inStock: transformed.has_stock,
        totalInventory: transformed.has_stock ? 1 : 0,
        categories: transformed.categories,
        tags: transformed.tags,
        createdAt: transformed.created_at,
      };
    });

    // Transform facets
    const facets = transformFacets(data.facets);

    return {
      products,
      total: data.meta?.page?.total_results || 0,
      facets,
      limit: DEFAULT_PAGE_SIZE,
      offset,
    };
  } catch (error) {
    console.error('[BrandProductsSection] Fetch error:', error);
    return {
      products: [],
      total: 0,
      facets: { categories: [], brands: [], priceRanges: generatePriceRanges() },
      limit: DEFAULT_PAGE_SIZE,
      offset: 0,
    };
  }
}

/**
 * Format price in cents to locale string
 */
function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Transform App Search v3 facets to Facets format
 */
function transformFacets(
  facetData?: Record<string, Array<{ type: string; data: Array<{ value: string; count: number }> }>>
): Facets {
  const categories: FacetOption[] = [];
  const brands: FacetOption[] = [];

  if (facetData) {
    // Get category facets from hierarchical levels
    const categoryLevels = ['category_lvl0', 'category_lvl1', 'category_lvl2'];
    for (const level of categoryLevels) {
      const levelFacets = facetData[level]?.[0]?.data;
      if (levelFacets) {
        for (const item of levelFacets) {
          // Extract the last segment after " > " for display label
          const parts = item.value.split(' > ');
          const label = parts[parts.length - 1] || item.value;
          const slug = label
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Avoid duplicates
          if (!categories.find(c => c.value === slug)) {
            categories.push({ value: slug, label, count: item.count });
          }
        }
      }
    }

    // Get brand facets (not used on brand page but kept for consistency)
    const brandFacets = facetData['brand_slug']?.[0]?.data || facetData['brand_name']?.[0]?.data;
    if (brandFacets) {
      for (const item of brandFacets) {
        brands.push({
          value: item.value,
          label: item.value.charAt(0).toUpperCase() + item.value.slice(1).replace(/-/g, ' '),
          count: item.count,
        });
      }
    }
  }

  // Sort by count descending
  categories.sort((a, b) => b.count - a.count);
  brands.sort((a, b) => b.count - a.count);

  return {
    categories,
    brands,
    priceRanges: generatePriceRanges(),
  };
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
