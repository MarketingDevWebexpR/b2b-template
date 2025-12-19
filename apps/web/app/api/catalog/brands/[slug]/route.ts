/**
 * Catalog Brand Detail API Route (App Search v3)
 *
 * Fetches a single brand by slug with its products using Elastic App Search v3.
 *
 * GET /api/catalog/brands/[slug]
 * GET /api/catalog/brands/[slug]?limit=20&offset=0&sort=created_at&order=desc
 *
 * Query Parameters:
 * - limit: Number of products to return (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - sort: Sort field (created_at, price_min, title) - default: created_at
 * - order: Sort order (asc, desc) - default: desc
 * - inStock: Filter by stock availability ('true')
 *
 * Response:
 * {
 *   brand: Brand,
 *   products: TransformedProduct[],
 *   total: number,
 *   relatedBrands: Brand[]
 * }
 *
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  APP_SEARCH_CONFIG,
  getAppSearchUrl,
  type ProductHit,
  type MarqueHit,
  type AppSearchResponse,
  transformProductHit,
  transformMarqueHit,
  type TransformedProduct,
  type TransformedMarque,
  PRODUCT_RESULT_FIELDS,
  PRODUCT_SEARCH_FIELDS,
  PRODUCT_FACETS,
} from '@/lib/search/app-search-v3';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes

// ============================================================================
// Types
// ============================================================================

interface BrandDetailResponse {
  brand: TransformedMarque;
  products: TransformedProduct[];
  total: number;
  limit: number;
  offset: number;
  relatedBrands: TransformedMarque[];
}

interface QueryParams {
  limit: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
  inStock?: boolean;
}

// ============================================================================
// Query Parameter Parsing
// ============================================================================

function parseQueryParams(request: NextRequest): QueryParams {
  const { searchParams } = new URL(request.url);

  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '20', 10), 1),
    100
  );
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  const sortParam = searchParams.get('sort') || 'created_at';
  const validSorts = ['created_at', 'price_min', 'title', 'name'];
  const sort = validSorts.includes(sortParam) ? sortParam : 'created_at';

  const orderParam = searchParams.get('order') || 'desc';
  const order = orderParam === 'asc' ? 'asc' : 'desc';

  const inStockParam = searchParams.get('inStock');

  return {
    limit,
    offset,
    sort,
    order,
    inStock: inStockParam === 'true' ? true : undefined,
  };
}

// ============================================================================
// App Search Queries
// ============================================================================

/**
 * Fetch brand (marque) by slug from App Search
 * Uses only fields from App Search v3 marques: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
 */
async function fetchBrandBySlug(slug: string): Promise<TransformedMarque | null> {
  const appSearchUrl = getAppSearchUrl();

  const query = {
    query: '',
    page: { size: 1, current: 1 },
    filters: {
      all: [
        { doc_type: 'marques' },
        { slug: slug },
      ],
    },
    // Result fields - only include fields from App Search v3 marques schema
    // Marques: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
    result_fields: {
      id: { raw: {} },
      name: { raw: {} },
      slug: { raw: {} },
      description: { raw: {}, snippet: { size: 300, fallback: true } },
      logo_url: { raw: {} },
      country: { raw: {} },
      website_url: { raw: {} },
      is_active: { raw: {} },
      rank: { raw: {} },
      doc_type: { raw: {} },
    },
  };

  try {
    const response = await fetch(appSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APP_SEARCH_CONFIG.publicKey}`,
      },
      body: JSON.stringify(query),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`[Brand API] App Search error: ${response.status}`);
      return null;
    }

    const data: AppSearchResponse<MarqueHit> = await response.json();

    if (data.results.length === 0) {
      return null;
    }

    return transformMarqueHit(data.results[0]);
  } catch (error) {
    console.error('[Brand API] Error fetching brand:', error);
    return null;
  }
}

/**
 * Fetch products for a brand by brand_slug from App Search
 */
async function fetchBrandProducts(
  brandSlug: string,
  params: QueryParams
): Promise<{ products: TransformedProduct[]; total: number }> {
  const appSearchUrl = getAppSearchUrl();

  // Build filters
  const filters: Record<string, unknown>[] = [
    { doc_type: 'products' },
    { brand_slug: brandSlug },
  ];

  // Add stock filter if requested
  if (params.inStock) {
    filters.push({ has_stock: 'true' });
  }

  const query = {
    query: '',
    page: {
      size: params.limit,
      current: Math.floor(params.offset / params.limit) + 1,
    },
    filters: {
      all: filters,
    },
    result_fields: PRODUCT_RESULT_FIELDS,
    search_fields: PRODUCT_SEARCH_FIELDS,
    facets: PRODUCT_FACETS,
    sort: [{ [params.sort]: params.order }],
  };

  try {
    const response = await fetch(appSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APP_SEARCH_CONFIG.publicKey}`,
      },
      body: JSON.stringify(query),
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Brand Products API] App Search error: ${response.status}`, errorText);
      return { products: [], total: 0 };
    }

    const data: AppSearchResponse<ProductHit> = await response.json();

    return {
      products: data.results.map(transformProductHit),
      total: data.meta.page.total_results,
    };
  } catch (error) {
    console.error('[Brand Products API] Error fetching products:', error);
    return { products: [], total: 0 };
  }
}

/**
 * Fetch related brands (other brands from same country)
 * Uses only fields from App Search v3 marques: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
 * Note: product_count does NOT exist on marques, so we sort by rank instead
 */
async function fetchRelatedBrands(
  currentBrand: TransformedMarque,
  limit: number = 6
): Promise<TransformedMarque[]> {
  const appSearchUrl = getAppSearchUrl();

  // Query to get brands from the same country or by rank
  const query = {
    query: '',
    page: { size: 50, current: 1 },
    filters: {
      all: [{ doc_type: 'marques' }],
    },
    // Result fields - only include fields from App Search v3 marques schema
    result_fields: {
      id: { raw: {} },
      name: { raw: {} },
      slug: { raw: {} },
      description: { raw: {} },
      logo_url: { raw: {} },
      country: { raw: {} },
      website_url: { raw: {} },
      is_active: { raw: {} },
      rank: { raw: {} },
      doc_type: { raw: {} },
    },
    sort: [{ rank: 'asc' }], // Sort by rank since product_count doesn't exist on marques
  };

  try {
    const response = await fetch(appSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APP_SEARCH_CONFIG.publicKey}`,
      },
      body: JSON.stringify(query),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`[Related Brands API] App Search error: ${response.status}`);
      return [];
    }

    const data: AppSearchResponse<MarqueHit> = await response.json();

    // Transform and filter out current brand
    const allBrands = data.results
      .map(transformMarqueHit)
      .filter((b) => b.id !== currentBrand.id);

    // Score and sort by relevance (same country = higher score)
    // Note: product_count doesn't exist on marques in v3, use _score from search instead
    const scoredBrands = allBrands.map((brand) => ({
      ...brand,
      score:
        (brand.country === currentBrand.country ? 10 : 0) +
        brand._score, // Use search score as relevance indicator
    }));

    scoredBrands.sort((a, b) => b.score - a.score);

    // Return top N without the score property
    return scoredBrands.slice(0, limit).map(({ score, ...brand }) => brand);
  } catch (error) {
    console.error('[Related Brands API] Error fetching related brands:', error);
    return [];
  }
}

// ============================================================================
// Route Handler
// ============================================================================

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<BrandDetailResponse | { error: string }>> {
  const startTime = Date.now();

  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Brand slug is required' },
        { status: 400 }
      );
    }

    const params = parseQueryParams(request);

    // Fetch brand by slug
    const brand = await fetchBrandBySlug(slug);

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Fetch products and related brands in parallel
    const [productsResult, relatedBrands] = await Promise.all([
      fetchBrandProducts(slug, params),
      fetchRelatedBrands(brand),
    ]);

    const processingTimeMs = Date.now() - startTime;
    console.log(
      `[Brand API] Fetched brand "${brand.name}" with ${productsResult.total} products in ${processingTimeMs}ms`
    );

    const response: BrandDetailResponse = {
      brand,
      products: productsResult.products,
      total: productsResult.total,
      limit: params.limit,
      offset: params.offset,
      relatedBrands,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('[Catalog Brand Detail API] Error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch brand details' },
      { status: 500 }
    );
  }
}
