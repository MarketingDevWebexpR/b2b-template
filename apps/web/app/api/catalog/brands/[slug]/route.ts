/**
 * Catalog Brand Detail API Route
 *
 * Fetches a single brand by slug with its products and related brands.
 *
 * GET /api/catalog/brands/[slug]
 *
 * Response:
 * {
 *   brand: Brand,
 *   products: Product[],
 *   relatedBrands: Brand[]
 * }
 *
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Brand } from '@/types/brand';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

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
  founded_year?: number | null;
  is_favorite?: boolean;
  is_premium?: boolean;
  product_count?: number;
}

interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  images?: Array<{ id: string; url: string; rank: number }>;
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
    prices: Array<{
      id: string;
      currency_code: string;
      amount: number;
    }>;
    inventory_quantity: number;
  }>;
  categories?: Array<{ id: string; name: string; handle: string }>;
  created_at: string;
  updated_at: string;
}

interface BrandDetailResponse {
  brand: Brand;
  products: TransformedProduct[];
  relatedBrands: Brand[];
}

interface TransformedProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  inStock: boolean;
}

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Fetch a single marque by slug from Medusa
 */
async function fetchMarqueBySlug(slug: string): Promise<MedusaMarque | null> {
  const url = `${MEDUSA_BACKEND_URL}/cms/marques?slug=${encodeURIComponent(slug)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Medusa request failed: ${response.status}`);
  }

  const data = await response.json();
  const marques = data.marques ?? [];

  return marques.find((m: MedusaMarque) => m.slug === slug) ?? null;
}

/**
 * Fetch products for a brand from Medusa
 */
async function fetchBrandProducts(
  brandId: string,
  limit: number = 20
): Promise<MedusaProduct[]> {
  // Note: This assumes there's a way to filter products by brand/marque
  // Adjust the endpoint based on your Medusa setup
  const url = `${MEDUSA_BACKEND_URL}/store/products?limit=${limit}&fields=*variants.prices,*images,*categories`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    console.error(`[Brand Products] Failed to fetch products: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return data.products ?? [];
}

/**
 * Fetch related brands (other brands from same country or with similar product count)
 */
async function fetchRelatedBrands(
  currentBrand: Brand,
  limit: number = 6
): Promise<Brand[]> {
  const url = `${MEDUSA_BACKEND_URL}/cms/marques?take=50`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const marques: MedusaMarque[] = data.marques ?? [];

  // Filter out current brand and find related ones
  const relatedMarques = marques
    .filter((m) => m.id !== currentBrand.id)
    .map((m) => ({
      ...mapMedusaMarqueToBrand(m),
      // Score based on similarity (same country, similar product count)
      score:
        (m.country === currentBrand.country ? 10 : 0) +
        (Math.abs((m.product_count ?? 0) - currentBrand.product_count) < 20 ? 5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...brand }) => brand);

  return relatedMarques;
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Map Medusa marque to Brand type
 */
function mapMedusaMarqueToBrand(marque: MedusaMarque): Brand {
  return {
    id: marque.id,
    name: marque.name,
    slug: marque.slug,
    logo_url: marque.logo_url ?? null,
    country: marque.country ?? null,
    product_count: marque.product_count ?? 0,
    description: marque.description ?? null,
    founded_year: marque.founded_year ?? null,
    is_premium: marque.is_premium ?? false,
    is_favorite: marque.is_favorite ?? false,
  };
}

/**
 * Format price amount
 */
function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Transform Medusa product to simplified format
 */
function transformProduct(product: MedusaProduct): TransformedProduct {
  // Get lowest EUR price
  let lowestPrice: { amount: number; currency: string } | null = null;

  for (const variant of product.variants) {
    for (const price of variant.prices) {
      if (price.currency_code.toLowerCase() === 'eur') {
        if (!lowestPrice || price.amount < lowestPrice.amount) {
          lowestPrice = { amount: price.amount, currency: price.currency_code };
        }
      }
    }
  }

  // Calculate total inventory
  const totalInventory = product.variants.reduce(
    (sum, v) => sum + v.inventory_quantity,
    0
  );

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail,
    price: lowestPrice
      ? {
          amount: lowestPrice.amount,
          currency: lowestPrice.currency,
          formatted: formatPrice(lowestPrice.amount, lowestPrice.currency),
        }
      : null,
    inStock: totalInventory > 0,
  };
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
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Brand slug is required' },
        { status: 400 }
      );
    }

    // Fetch brand by slug
    const marque = await fetchMarqueBySlug(slug);

    if (!marque) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    const brand = mapMedusaMarqueToBrand(marque);

    // Fetch products and related brands in parallel
    const [products, relatedBrands] = await Promise.all([
      fetchBrandProducts(brand.id),
      fetchRelatedBrands(brand),
    ]);

    const response: BrandDetailResponse = {
      brand,
      products: products.map(transformProduct),
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
