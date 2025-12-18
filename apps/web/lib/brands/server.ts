/**
 * Brand Server-Side Functions
 *
 * Server-side functions for fetching brand data.
 * Used in Server Components and API routes.
 * Fetches directly from Meilisearch for optimal SSR performance.
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

interface MeilisearchMarque {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  country?: string | null;
  is_active?: boolean;
  rank?: number;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

interface MeilisearchSearchResponse {
  hits: MeilisearchMarque[];
  estimatedTotalHits: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Configuration
// ============================================================================

const MEILISEARCH_URL =
  process.env.NEXT_PUBLIC_MEILISEARCH_URL ||
  process.env.MEILISEARCH_URL ||
  'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const MARQUES_INDEX = process.env.MEILISEARCH_MARQUES_INDEX || 'bijoux_marques';
const CACHE_REVALIDATE_SECONDS = 3600; // 1 hour

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
 * Transform Meilisearch marque to Brand format
 */
function transformMeilisearchMarqueToBrand(marque: MeilisearchMarque): Brand {
  const foundedYear = marque.metadata?.year_founded as number | undefined;

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
    founded_year: foundedYear || null,
  };
}

// ============================================================================
// Meilisearch Direct Functions
// ============================================================================

/**
 * Fetches brands directly from Meilisearch
 */
async function fetchMeilisearchBrands(params: {
  search?: string;
  skip?: number;
  take?: number;
  filter?: string;
}): Promise<{ marques: MeilisearchMarque[]; count: number }> {
  const searchUrl = `${MEILISEARCH_URL}/indexes/${MARQUES_INDEX}/search`;

  try {
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(MEILISEARCH_API_KEY && { Authorization: `Bearer ${MEILISEARCH_API_KEY}` }),
      },
      body: JSON.stringify({
        q: params.search || '',
        limit: params.take || 100,
        offset: params.skip || 0,
        filter: params.filter || 'is_active = true',
        sort: ['rank:desc', 'name:asc'],
      }),
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['brands', 'marques'],
      },
    });

    if (!response.ok) {
      console.error(`[Meilisearch] Brands API error: ${response.status}`);
      throw new Error(`Meilisearch error: ${response.status}`);
    }

    const data: MeilisearchSearchResponse = await response.json();
    return {
      marques: data.hits,
      count: data.estimatedTotalHits,
    };
  } catch (error) {
    console.error('[Meilisearch] Failed to fetch brands:', error);
    throw error;
  }
}

// ============================================================================
// Server-Side Fetching Functions
// ============================================================================

/**
 * Fetch brands for SSR/SSG
 * Fetches directly from Meilisearch for optimal SSR performance.
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
    // Fetch directly from Meilisearch for SSR
    const { marques, count } = await fetchMeilisearchBrands({
      take: 200, // Get all brands
    });

    // Transform to Brand format
    const brands = marques.map(transformMeilisearchMarqueToBrand);

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
 * Fetches directly from Meilisearch for optimal SSR performance.
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
    // Search by slug in Meilisearch
    const searchUrl = `${MEILISEARCH_URL}/indexes/${MARQUES_INDEX}/search`;

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(MEILISEARCH_API_KEY && { Authorization: `Bearer ${MEILISEARCH_API_KEY}` }),
      },
      body: JSON.stringify({
        q: '',
        filter: `slug = "${slug}"`,
        limit: 1,
      }),
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['brands', 'marques', `brand-${slug}`],
      },
    });

    if (!response.ok) {
      console.error(`[getServerBrand] Meilisearch error: ${response.status}`);
      return null;
    }

    const data: MeilisearchSearchResponse = await response.json();

    if (data.hits.length === 0) {
      return null;
    }

    const marque = data.hits[0];
    const brand = transformMeilisearchMarqueToBrand(marque);

    // Return with extended properties
    return {
      ...brand,
      website_url: marque.website_url || null,
      founded_year: (marque.metadata?.year_founded as number) || null,
    };
  } catch (error) {
    console.error('[getServerBrand] Error:', error);
    return null;
  }
}

/**
 * Fetch brands with specific filters for SSR
 * Fetches directly from Meilisearch for optimal SSR performance.
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
    // Build Meilisearch filter
    const filters: string[] = ['is_active = true'];
    if (options.country) {
      filters.push(`country = "${options.country}"`);
    }
    if (options.premiumOnly) {
      filters.push('rank >= 80');
    }

    // Fetch from Meilisearch
    const { marques, count } = await fetchMeilisearchBrands({
      search: options.search,
      skip: options.offset,
      take: options.limit || 100,
      filter: filters.join(' AND '),
    });

    // Transform to Brand format
    let brands = marques.map(transformMeilisearchMarqueToBrand);

    // Apply letter filter (post-process as Meilisearch doesn't support startsWith)
    if (options.letter) {
      brands = brands.filter(
        (b) => b.name.charAt(0).toUpperCase() === options.letter!.toUpperCase()
      );
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
