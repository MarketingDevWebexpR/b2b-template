/**
 * Brand Server-Side Functions
 *
 * Server-side functions for fetching brand data.
 * Used in Server Components and API routes.
 * Fetches from Medusa backend API for consistent data access.
 *
 * @packageDocumentation
 */

import type { Brand, BrandResponse } from '@/types/brand';

// ============================================================================
// Types
// ============================================================================

/**
 * Brand with extended product information
 */
export interface BrandWithProducts extends Brand {
  /** Products from this brand */
  products?: BrandProduct[];
  /** Total product count */
  productCount?: number;
  /** Website URL */
  website_url?: string | null;
  /** Founded year */
  founded_year?: number | null;
}

export interface BrandProduct {
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

/**
 * Indexed brand format from search API
 * Based on App Search v3 marques schema: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
 */
interface IndexedMarque {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  country?: string | null;
  is_active?: boolean;
  rank?: number;
}

/**
 * Search API response format
 */
interface SearchResponse {
  hits: IndexedMarque[];
  estimatedTotalHits: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Configuration
// ============================================================================

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  'http://localhost:9000';
const CACHE_REVALIDATE_SECONDS = 3600; // 1 hour

// App Search v3 Configuration
const APPSEARCH_ENDPOINT = process.env.APPSEARCH_ENDPOINT || 'https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io';
const APPSEARCH_PUBLIC_KEY = process.env.APPSEARCH_PUBLIC_KEY || 'search-smojpz6bs5oufe3g9krdupke';
const APPSEARCH_ENGINE = process.env.APPSEARCH_ENGINE || 'dev-medusa-v3';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Groups brands by their first letter
 */
function groupBrandsByLetter(brands: Brand[]): Record<string, Brand[]> {
  return brands.reduce(
    (acc, brand) => {
      const letter = brand.name.charAt(0).toUpperCase();
      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(brand);
      return acc;
    },
    {} as Record<string, Brand[]>
  );
}

/**
 * Transform indexed marque to Brand format
 * Note: founded_year is not available in v3 schema
 */
function transformIndexedMarqueToBrand(marque: IndexedMarque): Brand {
  return {
    id: marque.id,
    name: marque.name,
    slug: marque.slug,
    logo_url: marque.logo_url || null,
    country: marque.country || null,
    product_count: 0, // Will be enriched later if needed
    is_premium: (marque.rank ?? 0) >= 80,
    is_favorite: (marque.rank ?? 0) >= 90,
    description: marque.description || null,
    website_url: marque.website_url,
    founded_year: null, // Not available in v3 schema
  };
}

// ============================================================================
// App Search API Functions
// ============================================================================

/**
 * App Search v3 marque result structure
 * Marques schema: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
 */
interface AppSearchMarqueResult {
  id: { raw: string };
  name: { raw: string };
  slug: { raw: string };
  description?: { raw: string };
  logo_url?: { raw: string };
  website_url?: { raw: string };
  country?: { raw: string };
  is_active?: { raw: string };
  rank?: { raw: number | string }; // Can be number or string depending on indexing
  doc_type: { raw: string };
}

interface AppSearchResponse {
  meta: { page: { total_results: number } };
  results: AppSearchMarqueResult[];
}

/**
 * Build App Search filters for marques
 * App Search v3 uses { all: [...], any: [...], none: [...] } format for multiple conditions
 * Single filter can use simple { field: value } format
 */
function buildMarqueFilters(slugFilter?: string): Record<string, unknown> {
  // Base filter for doc_type
  const docTypeFilter = { doc_type: 'marques' };

  if (!slugFilter) {
    // Single filter - simple format works
    return docTypeFilter;
  }

  // Multiple filters - use 'all' array format
  return {
    all: [
      { doc_type: 'marques' },
      { slug: slugFilter },
    ],
  };
}

/**
 * Fetches brands from App Search v3
 */
async function fetchAppSearchBrands(params: {
  search?: string;
  skip?: number;
  take?: number;
  slugFilter?: string;
}): Promise<{ marques: IndexedMarque[]; count: number }> {
  const searchUrl = `${APPSEARCH_ENDPOINT}/api/as/v1/engines/${APPSEARCH_ENGINE}/search`;

  try {
    const filters = buildMarqueFilters(params.slugFilter);

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APPSEARCH_PUBLIC_KEY}`,
      },
      body: JSON.stringify({
        query: params.search || '',
        filters,
        // Result fields - only include fields from App Search v3 marques schema:
        // name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
        result_fields: {
          id: { raw: {} },
          name: { raw: {} },
          slug: { raw: {} },
          description: { raw: {} },
          logo_url: { raw: {} },
          website_url: { raw: {} },
          country: { raw: {} },
          is_active: { raw: {} },
          rank: { raw: {} },
          doc_type: { raw: {} },
        },
        page: { current: Math.floor((params.skip || 0) / (params.take || 100)) + 1, size: params.take || 100 },
      }),
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['brands', 'marques'],
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[App Search] Brands search error: ${response.status}`, errorText);
      throw new Error(`App Search error: ${response.status}`);
    }

    const data: AppSearchResponse = await response.json();

    // Transform App Search results to IndexedMarque format
    const marques: IndexedMarque[] = data.results.map(r => ({
      id: r.id?.raw || '',
      name: r.name?.raw || '',
      slug: r.slug?.raw || '',
      description: r.description?.raw || null,
      logo_url: r.logo_url?.raw || null,
      website_url: r.website_url?.raw || null,
      country: r.country?.raw || null,
      is_active: r.is_active?.raw === 'true',
      rank: typeof r.rank?.raw === 'number' ? r.rank.raw : parseInt(r.rank?.raw || '0', 10),
    }));

    return {
      marques,
      count: data.meta.page.total_results,
    };
  } catch (error) {
    console.error('[App Search] Failed to fetch brands:', error);
    throw error;
  }
}

// ============================================================================
// Server-Side Fetching Functions
// ============================================================================

/**
 * Fetch brands for SSR/SSG
 * Fetches from Medusa backend API for consistent data access.
 *
 * @returns Promise<BrandResponse> - Brands data with grouping
 *
 * @example
 * ```typescript
 * // In a Server Component
 * const brandsData = await getServerBrands();
 * ```
 */
export async function getServerBrands(): Promise<BrandResponse> {
  try {
    // Fetch from App Search v3
    const { marques, count } = await fetchAppSearchBrands({
      take: 200, // Get all brands
    });

    // Transform to Brand format
    const brands = marques.map(transformIndexedMarqueToBrand);

    // Sort: favorites first, then premium, then alphabetically
    brands.sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      if (a.is_premium && !b.is_premium) return -1;
      if (!a.is_premium && b.is_premium) return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      brands,
      total: count,
      premium: brands.filter((b) => b.is_premium || b.is_favorite),
      byLetter: groupBrandsByLetter(brands),
    };
  } catch (error) {
    console.error('[getServerBrands] Error:', error);
    return {
      brands: [],
      total: 0,
      premium: [],
      byLetter: {},
    };
  }
}

/**
 * Fetch a single brand by slug for SSR/SSG
 * Fetches from Medusa backend API for consistent data access.
 *
 * @param slug - Brand slug
 * @returns Promise<BrandWithProducts | null> - Brand data or null if not found
 *
 * @example
 * ```typescript
 * // In a Server Component
 * const brand = await getServerBrand('cartier');
 * ```
 */
export async function getServerBrand(slug: string): Promise<BrandWithProducts | null> {
  try {
    // Search by slug via App Search v3
    const { marques } = await fetchAppSearchBrands({
      slugFilter: slug,
      take: 1,
    });

    if (marques.length === 0) {
      console.warn(`[getServerBrand] Brand not found: ${slug}`);
      return null;
    }

    const marque = marques[0];
    const brand = transformIndexedMarqueToBrand(marque);

    // Return with extended properties (founded_year not available in v3 schema)
    return {
      ...brand,
      website_url: marque.website_url || null,
      founded_year: null, // Not available in v3 schema
    };
  } catch (error) {
    console.error('[getServerBrand] Error:', error);
    return null;
  }
}

/**
 * Fetch brands with specific filters for SSR
 * Fetches from Medusa backend API for consistent data access.
 *
 * @param options - Filter options
 * @returns Promise<BrandResponse> - Filtered brands data
 */
export async function getFilteredBrands(options: {
  letter?: string;
  country?: string;
  premiumOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<BrandResponse> {
  try {
    // Fetch from App Search v3
    const { marques, count } = await fetchAppSearchBrands({
      search: options.search,
      skip: options.offset,
      take: options.limit || 100,
    });

    // Transform to Brand format
    let brands = marques.map(transformIndexedMarqueToBrand);

    // Apply filters (post-process since App Search doesn't support all filters)
    if (options.letter) {
      brands = brands.filter(
        (b) => b.name.charAt(0).toUpperCase() === options.letter!.toUpperCase()
      );
    }
    if (options.country) {
      brands = brands.filter((b) => b.country === options.country);
    }
    if (options.premiumOnly) {
      brands = brands.filter((b) => b.is_premium || b.is_favorite);
    }

    // Sort: favorites first, then premium, then alphabetically
    brands.sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      if (a.is_premium && !b.is_premium) return -1;
      if (!a.is_premium && b.is_premium) return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      brands,
      total: options.letter ? brands.length : count,
      premium: brands.filter((b) => b.is_premium || b.is_favorite),
      byLetter: groupBrandsByLetter(brands),
    };
  } catch (error) {
    console.error('[getFilteredBrands] Error:', error);
    return {
      brands: [],
      total: 0,
      premium: [],
      byLetter: {},
    };
  }
}

/**
 * Get all brand slugs for static generation
 *
 * @returns Promise<string[]> - Array of brand slugs
 *
 * @example
 * ```typescript
 * // In generateStaticParams
 * const slugs = await getAllBrandSlugs();
 * return slugs.map(slug => ({ slug }));
 * ```
 */
export async function getAllBrandSlugs(): Promise<string[]> {
  const { brands } = await getServerBrands();
  return brands.map((brand) => brand.slug);
}
