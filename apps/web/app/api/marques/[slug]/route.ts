/**
 * Brand by Slug API Route (App Search v3)
 *
 * GET /api/marques/[slug] - Get a single brand by slug with its products
 *
 * Uses Elastic App Search v3 for both brand and products retrieval.
 * Products are filtered by brand_slug field.
 *
 * Query Parameters:
 * - productLimit: Number of products to return (default: 24, max: 100)
 * - productOffset: Pagination offset for products (default: 0)
 * - sort: Sort field for products (created_at, price_min, title) - default: created_at
 * - order: Sort order (asc, desc) - default: desc
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
} from '@/lib/search/app-search-v3';

// ============================================================================
// Types
// ============================================================================

interface BrandWithProducts extends TransformedMarque {
  is_premium: boolean;
  is_favorite: boolean;
  website_url: string | null;
  founded_year: number | null;
  products: BrandProduct[];
}

interface BrandProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: { id: string; name: string; handle: string };
  stock: number;
  reference?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes

// ============================================================================
// App Search Functions
// ============================================================================

/**
 * Fetches a brand by slug from App Search
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
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['brand', `brand-${slug}`],
      },
    });

    if (!response.ok) {
      console.error(`[Marques API] App Search error: ${response.status}`);
      return null;
    }

    const data: AppSearchResponse<MarqueHit> = await response.json();

    if (data.results.length === 0) {
      return null;
    }

    return transformMarqueHit(data.results[0]);
  } catch (error) {
    console.error('[Marques API] Error fetching brand:', error);
    return null;
  }
}

/**
 * Fetches products for a brand by brand_slug from App Search
 */
async function fetchBrandProducts(
  brandSlug: string,
  limit: number = 24,
  offset: number = 0,
  sort: string = 'created_at',
  order: 'asc' | 'desc' = 'desc'
): Promise<{ products: TransformedProduct[]; count: number }> {
  const appSearchUrl = getAppSearchUrl();

  const query = {
    query: '',
    page: {
      size: limit,
      current: Math.floor(offset / limit) + 1,
    },
    filters: {
      all: [
        { doc_type: 'products' },
        { brand_slug: brandSlug },
      ],
    },
    result_fields: PRODUCT_RESULT_FIELDS,
    search_fields: PRODUCT_SEARCH_FIELDS,
    sort: [{ [sort]: order }],
  };

  try {
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
      console.error(`[Marques Products API] App Search error: ${response.status}`, errorText);
      return { products: [], count: 0 };
    }

    const data: AppSearchResponse<ProductHit> = await response.json();

    return {
      products: data.results.map(transformProductHit),
      count: data.meta.page.total_results,
    };
  } catch (error) {
    console.error('[Marques Products API] Error fetching products:', error);
    return { products: [], count: 0 };
  }
}

/**
 * Transforms TransformedProduct to BrandProduct format
 */
function transformToBrandProduct(product: TransformedProduct): BrandProduct {
  return {
    id: product.id,
    name: product.title,
    slug: product.handle,
    price: product.price_min ? product.price_min / 100 : 0,
    images: product.images.length > 0 ? product.images : (product.thumbnail ? [product.thumbnail] : []),
    category: product.categories[0] || undefined,
    stock: product.has_stock ? 1 : 0,
    reference: product.sku || undefined,
  };
}

// ============================================================================
// Route Handler
// ============================================================================

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/marques/[slug]
 *
 * Returns a single brand with its associated products
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Brand slug is required' },
        { status: 400 }
      );
    }

    // Fetch brand from App Search
    const marque = await fetchBrandBySlug(slug);

    if (!marque) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Parse query parameters for products
    const { searchParams } = new URL(request.url);
    const productLimit = Math.min(
      Math.max(parseInt(searchParams.get('productLimit') || '24', 10), 1),
      100
    );
    const productOffset = Math.max(parseInt(searchParams.get('productOffset') || '0', 10), 0);
    const sort = searchParams.get('sort') || 'created_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Fetch products for this brand using brand_slug
    const { products: appSearchProducts, count: productCount } = await fetchBrandProducts(
      slug,
      productLimit,
      productOffset,
      sort,
      order
    );

    // Note: is_premium, is_favorite, founded_year don't exist in v3 marques schema
    // Transform to BrandWithProducts format
    const brand: BrandWithProducts = {
      ...marque,
      product_count: productCount, // Use actual count from products search
      is_premium: false, // is_premium doesn't exist in v3 schema
      is_favorite: false, // is_favorite doesn't exist in v3 schema
      website_url: marque.website_url, // website_url exists in v3 marques schema
      founded_year: null, // founded_year doesn't exist in v3 schema
      products: appSearchProducts.map(transformToBrandProduct),
    };

    return NextResponse.json(
      { brand },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
        },
      }
    );
  } catch (error) {
    console.error('Brand API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch brand',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
