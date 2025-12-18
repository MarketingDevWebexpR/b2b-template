/**
 * Catalog Products API Route
 *
 * Fetches products from Medusa/Meilisearch with comprehensive filtering,
 * sorting, pagination, and faceted search support.
 *
 * GET /api/catalog/products
 *
 * Query Parameters:
 * - category: Filter by category ID or handle
 * - brand: Filter by brand slug
 * - minPrice: Minimum price in cents
 * - maxPrice: Maximum price in cents
 * - search: Search query string
 * - sort: Sort order (name_asc, name_desc, price_asc, price_desc, newest, popular)
 * - limit: Number of products (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - inStock: Filter by stock availability ('true' | 'false')
 *
 * Response:
 * {
 *   products: Product[],
 *   total: number,
 *   facets: Facets
 * }
 *
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 120; // Cache for 2 minutes

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://localhost:9000';

const MEILISEARCH_URL =
  process.env.NEXT_PUBLIC_MEILISEARCH_URL ||
  process.env.MEILISEARCH_URL ||
  'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const PRODUCTS_INDEX =
  process.env.MEILISEARCH_PRODUCTS_INDEX || 'bijoux_products';

// ============================================================================
// Types
// ============================================================================

interface QueryParams {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort: SortOption;
  limit: number;
  offset: number;
  inStock?: boolean;
}

type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'popular';

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
  tags?: Array<{ id: string; value: string }>;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
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
// Query Parameter Parsing
// ============================================================================

function parseQueryParams(request: NextRequest): QueryParams {
  const { searchParams } = new URL(request.url);

  const sortParam = searchParams.get('sort');
  const validSorts: SortOption[] = [
    'name_asc',
    'name_desc',
    'price_asc',
    'price_desc',
    'newest',
    'popular',
  ];
  const sort: SortOption = validSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : 'newest';

  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '20', 10), 1),
    100
  );
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const inStockParam = searchParams.get('inStock');

  return {
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    minPrice: minPriceParam ? parseInt(minPriceParam, 10) : undefined,
    maxPrice: maxPriceParam ? parseInt(maxPriceParam, 10) : undefined,
    search: searchParams.get('search') || undefined,
    sort,
    limit,
    offset,
    inStock: inStockParam ? inStockParam === 'true' : undefined,
  };
}

// ============================================================================
// Data Fetching - Meilisearch
// ============================================================================

interface MeilisearchProductHit {
  id: string;
  title: string;
  handle: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  images?: string[];
  price?: number;
  currency_code?: string;
  inventory_quantity?: number;
  categories?: Array<{ id: string; name: string; handle: string }>;
  brand?: string;
  tags?: string[];
  created_at?: string;
}

interface MeilisearchSearchResponse {
  hits: MeilisearchProductHit[];
  estimatedTotalHits: number;
  facetDistribution?: Record<string, Record<string, number>>;
}

/**
 * Search products using Meilisearch
 */
async function searchProductsMeilisearch(
  params: QueryParams
): Promise<{ products: TransformedProduct[]; total: number; facets: Facets }> {
  const searchUrl = `${MEILISEARCH_URL}/indexes/${PRODUCTS_INDEX}/search`;

  // Build filters
  const filters: string[] = [];

  if (params.category) {
    // Use all_category_handles for hierarchical filtering
    // This allows products in child categories to appear when filtering by parent
    filters.push(`all_category_handles = "${params.category}"`);
  }

  if (params.brand) {
    filters.push(`brand = "${params.brand}"`);
  }

  if (params.minPrice !== undefined) {
    filters.push(`price >= ${params.minPrice}`);
  }

  if (params.maxPrice !== undefined) {
    filters.push(`price <= ${params.maxPrice}`);
  }

  if (params.inStock === true) {
    filters.push('inventory_quantity > 0');
  }

  // Build sort
  const sortMap: Record<SortOption, string[]> = {
    name_asc: ['title:asc'],
    name_desc: ['title:desc'],
    price_asc: ['price:asc'],
    price_desc: ['price:desc'],
    newest: ['created_at:desc'],
    popular: ['inventory_quantity:desc'],
  };

  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(MEILISEARCH_API_KEY && { Authorization: `Bearer ${MEILISEARCH_API_KEY}` }),
    },
    body: JSON.stringify({
      q: params.search || '',
      limit: params.limit,
      offset: params.offset,
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
      sort: sortMap[params.sort],
      facets: ['categories.name', 'brand'],
    }),
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new Error(`Meilisearch request failed: ${response.status}`);
  }

  const data: MeilisearchSearchResponse = await response.json();

  // Transform hits
  const products = data.hits.map((hit) => transformMeilisearchHit(hit));

  // Transform facets
  const facets = transformFacets(data.facetDistribution);

  return {
    products,
    total: data.estimatedTotalHits,
    facets,
  };
}

/**
 * Transform Meilisearch hit to product format
 */
function transformMeilisearchHit(hit: MeilisearchProductHit): TransformedProduct {
  return {
    id: hit.id,
    title: hit.title,
    handle: hit.handle,
    subtitle: hit.subtitle ?? null,
    description: hit.description ?? null,
    thumbnail: hit.thumbnail ?? null,
    images: hit.images ?? [],
    price:
      hit.price !== undefined
        ? {
            amount: hit.price,
            currency: hit.currency_code || 'EUR',
            formatted: formatPrice(hit.price, hit.currency_code || 'EUR'),
          }
        : null,
    inStock: (hit.inventory_quantity ?? 0) > 0,
    totalInventory: hit.inventory_quantity ?? 0,
    categories: hit.categories ?? [],
    tags: hit.tags ?? [],
    createdAt: hit.created_at || new Date().toISOString(),
  };
}

// ============================================================================
// Data Fetching - Medusa Fallback
// ============================================================================

/**
 * Fetch products from Medusa API as fallback
 */
async function fetchProductsMedusa(
  params: QueryParams
): Promise<{ products: TransformedProduct[]; total: number; facets: Facets }> {
  const queryParams = new URLSearchParams();

  queryParams.set('fields', '*variants.prices,*images,*categories,*tags');
  queryParams.set('limit', String(params.limit));
  queryParams.set('offset', String(params.offset));

  if (params.category) {
    queryParams.append('category_id[]', params.category);
  }

  if (params.search) {
    queryParams.set('q', params.search);
  }

  // Map sort options to Medusa format
  const sortMap: Record<SortOption, string> = {
    name_asc: 'title',
    name_desc: '-title',
    price_asc: 'variants.prices.amount',
    price_desc: '-variants.prices.amount',
    newest: '-created_at',
    popular: '-created_at', // Medusa doesn't have popularity, use newest
  };

  queryParams.set('order', sortMap[params.sort]);

  const url = `${MEDUSA_BACKEND_URL}/store/products?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new Error(`Medusa request failed: ${response.status}`);
  }

  const data = await response.json();
  const medusaProducts: MedusaProduct[] = data.products ?? [];
  let filteredProducts = medusaProducts;

  // Apply client-side filters for price and stock (if Medusa doesn't support them)
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter((product) => {
      const price = getLowestPrice(product);
      if (price === null) return false;
      if (params.minPrice !== undefined && price < params.minPrice) return false;
      if (params.maxPrice !== undefined && price > params.maxPrice) return false;
      return true;
    });
  }

  if (params.inStock === true) {
    filteredProducts = filteredProducts.filter((product) => {
      const totalInventory = product.variants.reduce(
        (sum, v) => sum + v.inventory_quantity,
        0
      );
      return totalInventory > 0;
    });
  }

  const products = filteredProducts.map(transformMedusaProduct);

  // Generate facets from products
  const facets = generateFacetsFromProducts(medusaProducts);

  return {
    products,
    total: data.count ?? products.length,
    facets,
  };
}

/**
 * Get lowest EUR price from product variants
 */
function getLowestPrice(product: MedusaProduct): number | null {
  let lowest: number | null = null;

  for (const variant of product.variants) {
    for (const price of variant.prices) {
      if (price.currency_code.toLowerCase() === 'eur') {
        if (lowest === null || price.amount < lowest) {
          lowest = price.amount;
        }
      }
    }
  }

  return lowest;
}

/**
 * Transform Medusa product to standard format
 */
function transformMedusaProduct(product: MedusaProduct): TransformedProduct {
  const lowestPrice = getLowestPrice(product);
  const totalInventory = product.variants.reduce(
    (sum, v) => sum + v.inventory_quantity,
    0
  );

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    subtitle: product.subtitle,
    description: product.description,
    thumbnail: product.thumbnail,
    images: product.images?.sort((a, b) => a.rank - b.rank).map((img) => img.url) ?? [],
    price:
      lowestPrice !== null
        ? {
            amount: lowestPrice,
            currency: 'EUR',
            formatted: formatPrice(lowestPrice),
          }
        : null,
    inStock: totalInventory > 0,
    totalInventory,
    categories:
      product.categories?.map((c) => ({
        id: c.id,
        name: c.name,
        handle: c.handle,
      })) ?? [],
    tags: product.tags?.map((t) => t.value) ?? [],
    createdAt: product.created_at,
  };
}

// ============================================================================
// Facets & Helpers
// ============================================================================

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
 * Transform Meilisearch facet distribution to our format
 */
function transformFacets(
  distribution?: Record<string, Record<string, number>>
): Facets {
  const categories: FacetOption[] = [];
  const brands: FacetOption[] = [];

  if (distribution) {
    if (distribution['categories.name']) {
      for (const [name, count] of Object.entries(distribution['categories.name'])) {
        categories.push({ value: name, label: name, count });
      }
    }

    if (distribution['brand']) {
      for (const [name, count] of Object.entries(distribution['brand'])) {
        brands.push({ value: name, label: name, count });
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

/**
 * Generate facets from Medusa products
 */
function generateFacetsFromProducts(products: MedusaProduct[]): Facets {
  const categoryMap = new Map<string, number>();
  const brandMap = new Map<string, number>();

  for (const product of products) {
    // Count categories
    for (const cat of product.categories ?? []) {
      categoryMap.set(cat.name, (categoryMap.get(cat.name) ?? 0) + 1);
    }

    // Count brands from metadata or tags
    const brand = (product.metadata?.brand as string) ?? null;
    if (brand) {
      brandMap.set(brand, (brandMap.get(brand) ?? 0) + 1);
    }
  }

  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ value: name, label: name, count }))
    .sort((a, b) => b.count - a.count);

  const brands = Array.from(brandMap.entries())
    .map(([name, count]) => ({ value: name, label: name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    categories,
    brands,
    priceRanges: generatePriceRanges(),
  };
}

/**
 * Generate standard price range facets
 */
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
// Route Handler
// ============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<ProductsResponse>> {
  try {
    const params = parseQueryParams(request);

    let result: { products: TransformedProduct[]; total: number; facets: Facets };

    // Try Meilisearch first, fall back to Medusa
    try {
      result = await searchProductsMeilisearch(params);
    } catch (meilisearchError) {
      console.warn(
        '[Catalog Products API] Meilisearch failed, falling back to Medusa:',
        meilisearchError
      );
      result = await fetchProductsMedusa(params);
    }

    const response: ProductsResponse = {
      products: result.products,
      total: result.total,
      facets: result.facets,
      limit: params.limit,
      offset: params.offset,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, max-age=120',
        'Vercel-CDN-Cache-Control': 'public, max-age=120',
      },
    });
  } catch (error) {
    console.error('[Catalog Products API] Error:', error);

    const emptyResponse: ProductsResponse = {
      products: [],
      total: 0,
      facets: { categories: [], brands: [], priceRanges: generatePriceRanges() },
      limit: 20,
      offset: 0,
    };

    return NextResponse.json(emptyResponse, { status: 500 });
  }
}
