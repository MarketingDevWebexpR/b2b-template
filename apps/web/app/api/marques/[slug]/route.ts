/**
 * Brand by Slug API Route
 *
 * GET /api/marques/[slug] - Get a single brand by slug
 *
 * Features:
 * - Fetches brand details from Medusa backend
 * - Includes associated products
 * - Caching with Next.js revalidation
 *
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Types
// ============================================================================

interface MedusaMarque {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  country?: string | null;
  is_favorite?: boolean;
  rank?: number;
  metadata?: Record<string, unknown> | null;
}

interface BrandWithProducts {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  product_count: number;
  is_premium: boolean;
  is_favorite: boolean;
  description: string | null;
  website_url?: string | null;
  founded_year?: number | null;
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

interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  thumbnail?: string;
  images?: Array<{ url: string }>;
  variants?: Array<{
    id: string;
    prices?: Array<{ amount: number; currency_code: string }>;
    inventory_quantity?: number;
  }>;
  categories?: Array<{ id: string; name: string; handle: string }>;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Configuration
// ============================================================================

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const CACHE_REVALIDATE_SECONDS = 3600; // 1 hour

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetches a brand by slug from Medusa
 */
async function fetchMedusaBrand(slug: string): Promise<MedusaMarque | null> {
  const url = `${MEDUSA_BACKEND_URL}/store/marques/${slug}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['brand', `brand-${slug}`],
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error(`Medusa marque API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.marque;
  } catch (error) {
    console.error('Failed to fetch marque from Medusa:', error);
    return null;
  }
}

/**
 * Fetches products for a brand from Medusa
 * Note: This uses a search/filter approach since products may be linked via metadata
 */
async function fetchBrandProducts(
  brandId: string,
  brandName: string,
  limit: number = 24,
  offset: number = 0
): Promise<{ products: MedusaProduct[]; count: number }> {
  // Try to fetch products with brand metadata
  const url = new URL(`${MEDUSA_BACKEND_URL}/store/products`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['products', `brand-products-${brandId}`],
      },
    });

    if (!response.ok) {
      console.error(`Medusa products API error: ${response.status}`);
      return { products: [], count: 0 };
    }

    const data = await response.json();

    // Filter products that belong to this brand (via metadata or title pattern)
    const brandProducts = (data.products || []).filter((product: MedusaProduct) => {
      // Check metadata for brand_id
      if (product.metadata?.brand_id === brandId) {
        return true;
      }
      // Check metadata for marque_id
      if (product.metadata?.marque_id === brandId) {
        return true;
      }
      // Fallback: check if brand name is in product title (less reliable)
      if (product.title?.toLowerCase().includes(brandName.toLowerCase())) {
        return true;
      }
      return false;
    });

    return {
      products: brandProducts,
      count: brandProducts.length,
    };
  } catch (error) {
    console.error('Failed to fetch brand products from Medusa:', error);
    return { products: [], count: 0 };
  }
}

/**
 * Transforms Medusa product to BrandProduct format
 */
function transformProduct(product: MedusaProduct): BrandProduct {
  const variant = product.variants?.[0];
  const priceData = variant?.prices?.find((p) => p.currency_code === 'eur') || variant?.prices?.[0];

  return {
    id: product.id,
    name: product.title,
    slug: product.handle,
    price: priceData ? priceData.amount / 100 : 0,
    images: product.images?.map((img) => img.url) || (product.thumbnail ? [product.thumbnail] : []),
    category: product.categories?.[0]
      ? {
          id: product.categories[0].id,
          name: product.categories[0].name,
          handle: product.categories[0].handle,
        }
      : undefined,
    stock: variant?.inventory_quantity ?? 0,
    reference: product.metadata?.sku as string | undefined,
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

    // Fetch brand from Medusa
    const marque = await fetchMedusaBrand(slug);

    if (!marque) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Parse query parameters for products
    const { searchParams } = new URL(request.url);
    const productLimit = parseInt(searchParams.get('productLimit') || '24', 10);
    const productOffset = parseInt(searchParams.get('productOffset') || '0', 10);

    // Fetch products for this brand
    const { products: medusaProducts, count: productCount } = await fetchBrandProducts(
      marque.id,
      marque.name,
      productLimit,
      productOffset
    );

    // Transform to BrandWithProducts format
    const foundedYear = marque.metadata?.year_founded as number | undefined;

    const brand: BrandWithProducts = {
      id: marque.id,
      name: marque.name,
      slug: marque.slug,
      logo_url: marque.logo_url || null,
      country: marque.country || null,
      product_count: productCount,
      is_premium: (marque.rank ?? 0) >= 80,
      is_favorite: marque.is_favorite || false,
      description: marque.description || null,
      website_url: marque.website_url,
      founded_year: foundedYear || null,
      products: medusaProducts.map(transformProduct),
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
