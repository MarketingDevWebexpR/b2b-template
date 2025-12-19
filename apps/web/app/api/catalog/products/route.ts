/**
 * Catalog Products API Route
 *
 * Fetches products from App Search v3 with comprehensive filtering,
 * sorting, pagination, and faceted search support.
 * Falls back to Medusa backend if App Search fails.
 *
 * GET /api/catalog/products
 *
 * Query Parameters:
 * - category: Filter by category handle (uses all_category_handles for hierarchy)
 * - brand: Filter by brand_slug
 * - minPrice: Minimum price in cents
 * - maxPrice: Maximum price in cents
 * - search: Search query string
 * - sort: Sort order (name_asc, name_desc, price_asc, price_desc, newest, popular)
 * - limit: Number of products (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - inStock: Filter by stock availability ('true' | 'false') - V3 uses string booleans
 *
 * V3 API Fields:
 * - category_lvl0 to category_lvl4: Hierarchical category faceting
 * - all_category_handles: Array of category handles for hierarchical filtering
 * - brand_name, brand_slug, brand_id: Brand information
 * - has_stock, is_available: Boolean fields as strings ("true"/"false")
 * - category_paths: Full path like "Plomberie > Robinetterie > Mitigeurs"
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
import {
  APP_SEARCH_CONFIG,
  getAppSearchUrl,
  type ProductHit,
  type AppSearchResponse,
  transformProductHit,
  PRODUCT_RESULT_FIELDS,
  PRODUCT_SEARCH_FIELDS,
  PRODUCT_FACETS,
  type TransformedProduct as AppSearchTransformedProduct,
} from '@/lib/search/app-search-v3';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 120; // Cache for 2 minutes

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://localhost:9000';

const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

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
// Data Fetching - App Search v3 Direct
// ============================================================================

/**
 * Search products using App Search v3 directly
 * This bypasses Medusa backend and calls Elastic App Search API directly
 */
async function searchProductsAppSearchDirect(
  params: QueryParams
): Promise<{ products: TransformedProduct[]; total: number; facets: Facets }> {
  const appSearchUrl = getAppSearchUrl();

  // Build filters array
  const filters: Record<string, unknown>[] = [{ doc_type: 'products' }];

  // Brand filter - use brand_slug field
  if (params.brand) {
    filters.push({ brand_slug: params.brand });
  }

  // Category filter - use all_category_handles for hierarchical filtering
  if (params.category) {
    filters.push({ all_category_handles: params.category });
  }

  // Stock filter - V3 uses string "true"/"false"
  if (params.inStock === true) {
    filters.push({ has_stock: 'true' });
  }

  // Price filters
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFilter: { from?: number; to?: number } = {};
    if (params.minPrice !== undefined) priceFilter.from = params.minPrice;
    if (params.maxPrice !== undefined) priceFilter.to = params.maxPrice;
    filters.push({ price_min: priceFilter });
  }

  // Build sort configuration
  const sortMap: Record<SortOption, string> = {
    name_asc: 'title',
    name_desc: 'title',
    price_asc: 'price_min',
    price_desc: 'price_min',
    newest: 'created_at',
    popular: 'created_at',
  };
  const orderMap: Record<SortOption, 'asc' | 'desc'> = {
    name_asc: 'asc',
    name_desc: 'desc',
    price_asc: 'asc',
    price_desc: 'desc',
    newest: 'desc',
    popular: 'desc',
  };

  // Build query
  const query = {
    query: params.search || '',
    page: {
      size: params.limit,
      current: Math.floor(params.offset / params.limit) + 1,
    },
    filters: { all: filters },
    result_fields: PRODUCT_RESULT_FIELDS,
    search_fields: PRODUCT_SEARCH_FIELDS,
    facets: PRODUCT_FACETS,
    sort: [{ [sortMap[params.sort]]: orderMap[params.sort] }],
  };

  console.log('[Products API] Calling App Search v3 directly:', appSearchUrl);
  console.log('[Products API] Query filters:', JSON.stringify(filters));

  const response = await fetch(appSearchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${APP_SEARCH_CONFIG.publicKey}`,
    },
    body: JSON.stringify(query),
    next: {
      revalidate: 120, // Cache for 2 minutes
      tags: ['products', params.brand ? `brand-products-${params.brand}` : 'all-products'],
    },
  });

  console.log('[Products API] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Products API] Error response:', errorText);
    throw new Error(`App Search v3 request failed: ${response.status}`);
  }

  const data: AppSearchResponse<ProductHit> = await response.json();
  console.log('[Products API] Got', data.results?.length || 0, 'results, total:', data.meta?.page?.total_results || 0);

  // Transform results using shared transformer
  const products = data.results.map((hit) => transformAppSearchHitToProduct(hit));

  // Transform facets
  const facets = transformAppSearchFacetsV3(data.facets);

  return {
    products,
    total: data.meta?.page?.total_results || 0,
    facets,
  };
}

/**
 * Transform App Search v3 hit to TransformedProduct format for this API
 */
function transformAppSearchHitToProduct(hit: ProductHit): TransformedProduct {
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
}

/**
 * Transform App Search v3 facets to Facets format
 */
function transformAppSearchFacetsV3(
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
          if (!item.value || typeof item.value !== 'string') continue;
          // Extract the last segment after " > " for display label
          const parts = item.value.split(' > ');
          const label = parts[parts.length - 1] || item.value;
          const slug = String(label)
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

    // Get brand facets
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
// Data Fetching - Medusa Backend Fallback
// ============================================================================

/**
 * App Search v3 Product Hit (for Medusa backend fallback)
 *
 * V3 schema includes:
 * - `doc_type: "product"`
 * - `category_lvl0-4`: InstantSearch-style hierarchical facets (e.g., "Plomberie > Robinetterie")
 * - `all_category_handles`: Array of category handles for hierarchical filtering
 * - `has_stock`, `is_available`: Boolean fields as strings ("true"/"false")
 * - `brand_name`, `brand_slug`, `brand_id`: Brand information
 * - `category_paths`: Full path like "Plomberie > Robinetterie > Mitigeurs"
 */
interface MedusaAppSearchProductHit {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: string[];
  price_min?: number;
  price_max?: number;
  // V3: Boolean fields as strings ("true"/"false")
  has_stock?: string | boolean;
  is_available?: string | boolean;
  categories?: Array<{ id: string; name: string; handle: string }>;
  category_names?: string[];
  // V3: InstantSearch-style hierarchical category levels
  // These are ">" separated strings, e.g., "Plomberie > Robinetterie"
  category_lvl0?: string;
  category_lvl1?: string;
  category_lvl2?: string;
  category_lvl3?: string;
  category_lvl4?: string;
  // V3: Full category path for display
  category_paths?: string[];
  // V3: All category handles for hierarchical filtering
  all_category_handles?: string[];
  // V3: Brand fields
  brand_name?: string;
  brand_slug?: string;
  brand_id?: string;
  tags?: string[];
  created_at?: string;
}

/**
 * Search products using Medusa Backend (fallback)
 */
async function searchProductsMedusaBackend(
  params: QueryParams
): Promise<{ products: TransformedProduct[]; total: number; facets: Facets }> {
  const searchParams = new URLSearchParams();

  // Add search query
  searchParams.set('q', params.search || '');
  searchParams.set('type', 'products');
  searchParams.set('limit', String(params.limit));
  searchParams.set('offset', String(params.offset));
  searchParams.set('facets', 'true');

  // Add category filter (uses all_category_handles for hierarchical filtering)
  if (params.category) {
    searchParams.set('category', params.category);
  }

  // Add brand filter
  if (params.brand) {
    searchParams.set('brand', params.brand);
  }

  // Add price filters
  if (params.minPrice !== undefined) {
    searchParams.set('price_min', String(params.minPrice));
  }
  if (params.maxPrice !== undefined) {
    searchParams.set('price_max', String(params.maxPrice));
  }

  // Add stock filter
  if (params.inStock === true) {
    searchParams.set('in_stock', 'true');
  }

  // Add sort
  const sortMap: Record<SortOption, string> = {
    name_asc: 'title',
    name_desc: 'title',
    price_asc: 'price_min',
    price_desc: 'price_min',
    newest: 'created_at',
    popular: 'created_at',
  };
  const orderMap: Record<SortOption, string> = {
    name_asc: 'asc',
    name_desc: 'desc',
    price_asc: 'asc',
    price_desc: 'desc',
    newest: 'desc',
    popular: 'desc',
  };

  searchParams.set('sort', sortMap[params.sort]);
  searchParams.set('order', orderMap[params.sort]);

  const searchUrl = `${MEDUSA_BACKEND_URL}/store/search?${searchParams.toString()}`;

  console.log('[Products API Fallback] Calling Medusa Backend:', searchUrl);

  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(MEDUSA_PUBLISHABLE_KEY && { 'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY }),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Products API Fallback] Error response:', errorText);
    throw new Error(`Medusa Backend request failed: ${response.status}`);
  }

  const data = await response.json();

  // Transform results from backend search format
  const products = (data.hits || []).map((hit: MedusaAppSearchProductHit) => transformMedusaAppSearchHit(hit));

  // Transform facets from backend search format (uses 'facetDistribution')
  const facets = transformAppSearchFacets(data.facetDistribution);

  return {
    products,
    total: data.total || 0,
    facets,
  };
}

/**
 * Parse v3 boolean string ("true"/"false") or actual boolean to boolean
 */
function parseV3Boolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return false;
}

/**
 * Transform Medusa App Search hit to product format (for fallback)
 *
 * V3 changes:
 * - `has_stock` and `is_available` are strings ("true"/"false") not booleans
 * - Brand info available via `brand_name`, `brand_slug`, `brand_id`
 */
function transformMedusaAppSearchHit(hit: MedusaAppSearchProductHit): TransformedProduct {
  const price = hit.price_min ?? hit.price_max;
  // V3: Parse boolean strings
  const hasStock = parseV3Boolean(hit.has_stock);

  return {
    id: hit.id,
    title: hit.title,
    handle: hit.handle,
    subtitle: null,
    description: hit.description ?? null,
    thumbnail: hit.thumbnail ?? null,
    images: hit.images ?? [],
    price:
      price !== undefined
        ? {
            amount: price,
            currency: 'EUR',
            formatted: formatPrice(price),
          }
        : null,
    // V3: Use parsed boolean
    inStock: hasStock,
    totalInventory: hasStock ? 1 : 0,
    categories: hit.categories ?? [],
    tags: hit.tags ?? [],
    createdAt: hit.created_at || new Date().toISOString(),
  };
}

/**
 * Transform App Search v3 facets to standard format
 *
 * V3 schema includes:
 * - `category_lvl0-4`: Hierarchical faceting (InstantSearch style)
 *   - category_lvl0: "Plomberie" (root level)
 *   - category_lvl1: "Plomberie > Robinetterie" (sub-category)
 * - `brand_name`: Brand facets
 * - `brand_slug`: Brand slug for filtering
 *
 * Strategy for hierarchical categories:
 * 1. Try to get the current level + 1 for subcategories
 * 2. If filtering by category at level N, show level N+1 facets
 * 3. Extract the last segment after " > " for display label
 *
 * @param facetData - Raw facet distribution from App Search
 * @param currentCategoryDepth - Current category filter depth (0-4), -1 if none
 * @returns Transformed facets for frontend
 */
function transformAppSearchFacets(
  facetData?: Record<string, Record<string, number>>,
  currentCategoryDepth: number = -1
): Facets {
  const categories: FacetOption[] = [];
  const brands: FacetOption[] = [];

  if (facetData) {
    // V3: Get the appropriate category level for subcategory faceting
    // If we're at depth 0, show depth 1 subcategories; if at depth 1, show depth 2, etc.
    const targetLevel = Math.min(currentCategoryDepth + 1, 4);
    const categoryLevelKey = `category_lvl${targetLevel}`;

    // Try the target level first, then fall back to available levels
    const categoryFacets =
      facetData[categoryLevelKey] ||
      facetData['category_lvl1'] ||
      facetData['category_lvl0'] ||
      facetData['categories.name'] ||
      facetData['category_names'];

    if (categoryFacets) {
      for (const [name, count] of Object.entries(categoryFacets)) {
        if (!name || typeof name !== 'string') continue;
        // V3: Extract the last segment after " > " for display label
        // e.g., "Plomberie > Robinetterie > Mitigeurs" -> "Mitigeurs"
        const parts = name.split(' > ');
        const label = parts[parts.length - 1] || name;

        // The value is the full path for hierarchical filtering
        // or the handle if available (we use last segment lowercased as slug)
        const slug = String(label)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        categories.push({
          value: slug, // Use slug for URL-friendly filtering
          label: label,
          count: count
        });
      }
    }

    // V3: Try brand_slug for values, brand_name for labels
    // This allows filtering by slug while displaying name
    const brandSlugFacets = facetData['brand_slug'];
    const brandNameFacets = facetData['brand_name'];

    if (brandSlugFacets) {
      for (const [slug, count] of Object.entries(brandSlugFacets)) {
        // Use slug as value, try to find corresponding name
        brands.push({
          value: slug,
          label: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
          count
        });
      }
    } else if (brandNameFacets) {
      for (const [name, count] of Object.entries(brandNameFacets)) {
        if (!name || typeof name !== 'string') continue;
        // Generate slug from name for filtering
        const slug = String(name)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        brands.push({ value: slug, label: name, count });
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
    cache: 'no-store',
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
 * Transform facet distribution to our format (v3 compatible)
 *
 * V3 supports:
 * - `category_lvl0-4`: Hierarchical category facets
 * - `brand_name`, `brand_slug`: Brand facets
 *
 * Falls back to legacy field names for backward compatibility.
 *
 * @deprecated Use transformAppSearchFacets instead
 */
function transformFacets(
  distribution?: Record<string, Record<string, number>>
): Facets {
  // Delegate to the main facet transformer
  return transformAppSearchFacets(distribution);
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

    // Try App Search v3 directly first, then Medusa backend fallback, then direct Medusa API
    try {
      result = await searchProductsAppSearchDirect(params);
    } catch (appSearchDirectError) {
      console.warn(
        '[Catalog Products API] App Search v3 direct failed, trying Medusa backend:',
        appSearchDirectError
      );

      try {
        result = await searchProductsMedusaBackend(params);
      } catch (medusaBackendError) {
        console.warn(
          '[Catalog Products API] Medusa backend failed, falling back to direct Medusa API:',
          medusaBackendError
        );
        result = await fetchProductsMedusa(params);
      }
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
