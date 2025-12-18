/**
 * Brands API Route
 *
 * GET /api/marques - List all active brands
 *
 * Features:
 * - Fetches brands from Meilisearch (primary) with Medusa fallback
 * - Caching with Next.js revalidation
 * - Search, filter, and pagination support
 * - Groups brands alphabetically
 *
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Types
// ============================================================================

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

interface Brand {
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

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const CACHE_REVALIDATE_SECONDS = 3600; // 1 hour

// ============================================================================
// Meilisearch Functions
// ============================================================================

interface MeilisearchSearchResponse {
  hits: MeilisearchMarque[];
  estimatedTotalHits: number;
  limit: number;
  offset: number;
}

/**
 * Fetches brands from Meilisearch
 */
async function fetchMeilisearchBrands(params: {
  search?: string;
  skip?: number;
  take?: number;
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
        filter: 'is_active = true',
        sort: ['rank:desc', 'name:asc'],
      }),
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['brands', 'marques'],
      },
    });

    if (!response.ok) {
      console.error(`Meilisearch marques API error: ${response.status}`);
      throw new Error(`Meilisearch error: ${response.status}`);
    }

    const data: MeilisearchSearchResponse = await response.json();
    return {
      marques: data.hits,
      count: data.estimatedTotalHits,
    };
  } catch (error) {
    console.error('Failed to fetch marques from Meilisearch:', error);
    throw error;
  }
}

// ============================================================================
// Medusa Fallback Functions
// ============================================================================

/**
 * Fetches brands from Medusa backend (fallback)
 */
async function fetchMedusaBrands(params: {
  search?: string;
  skip?: number;
  take?: number;
}): Promise<{ marques: MedusaMarque[]; count: number }> {
  const url = new URL(`${MEDUSA_BACKEND_URL}/store/marques`);

  if (params.search) {
    url.searchParams.set('q', params.search);
  }
  if (params.skip !== undefined) {
    url.searchParams.set('skip', String(params.skip));
  }
  if (params.take !== undefined) {
    url.searchParams.set('take', String(params.take));
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: ['brands', 'marques'],
      },
    });

    if (!response.ok) {
      console.error(`Medusa marques API error: ${response.status}`);
      return { marques: [], count: 0 };
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch marques from Medusa:', error);
    return { marques: [], count: 0 };
  }
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transforms Meilisearch marque to Brand format
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

/**
 * Transforms Medusa marque to Brand format
 */
function transformMarqueToBrand(marque: MedusaMarque): Brand {
  // Extract founded year from metadata if available
  const foundedYear = marque.metadata?.year_founded as number | undefined;

  return {
    id: marque.id,
    name: marque.name,
    slug: marque.slug,
    logo_url: marque.logo_url || null,
    country: marque.country || null,
    product_count: 0, // Will be enriched later if needed
    is_premium: (marque.rank ?? 0) >= 80,
    is_favorite: marque.is_favorite || false,
    description: marque.description || null,
    website_url: marque.website_url,
    founded_year: foundedYear || null,
  };
}

/**
 * Groups brands by first letter
 */
function groupByLetter(brands: Brand[]): Record<string, Brand[]> {
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

// ============================================================================
// Route Handler
// ============================================================================

/**
 * GET /api/marques
 *
 * Query Parameters:
 * - search: string - Search by brand name
 * - letter: string - Filter by first letter
 * - premium: 'true' - Only premium brands
 * - country: string - Filter by country
 * - limit: number - Pagination limit (default: 100)
 * - offset: number - Pagination offset (default: 0)
 * - sortBy: 'name' | 'product_count' | 'country'
 * - sortOrder: 'asc' | 'desc'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const letter = searchParams.get('letter')?.toUpperCase();
    const premiumOnly = searchParams.get('premium') === 'true';
    const country = searchParams.get('country') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sortBy = searchParams.get('sortBy') as 'name' | 'product_count' | 'country' | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    let marques: (MeilisearchMarque | MedusaMarque)[] = [];
    let count = 0;
    let usedMeilisearch = true;

    // Try Meilisearch first, fall back to Medusa
    try {
      const meilisearchResult = await fetchMeilisearchBrands({
        search,
        skip: offset,
        take: limit,
      });
      marques = meilisearchResult.marques;
      count = meilisearchResult.count;
    } catch (meilisearchError) {
      console.warn('[Brands API] Meilisearch failed, falling back to Medusa:', meilisearchError);
      usedMeilisearch = false;
      const medusaResult = await fetchMedusaBrands({
        search,
        skip: offset,
        take: limit,
      });
      marques = medusaResult.marques;
      count = medusaResult.count;
    }

    // Transform to Brand format
    let brands = marques.map((m) =>
      usedMeilisearch
        ? transformMeilisearchMarqueToBrand(m as MeilisearchMarque)
        : transformMarqueToBrand(m as MedusaMarque)
    );

    // Apply filters
    if (letter) {
      brands = brands.filter((b) => b.name.charAt(0).toUpperCase() === letter);
    }

    if (premiumOnly) {
      brands = brands.filter((b) => b.is_premium || b.is_favorite);
    }

    if (country) {
      brands = brands.filter(
        (b) => b.country?.toLowerCase() === country.toLowerCase()
      );
    }

    // Apply sorting
    if (sortBy) {
      brands.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'product_count':
            comparison = a.product_count - b.product_count;
            break;
          case 'country':
            comparison = (a.country || '').localeCompare(b.country || '');
            break;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    } else {
      // Default sort: favorites first, then by name
      brands.sort((a, b) => {
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        if (a.is_premium && !b.is_premium) return -1;
        if (!a.is_premium && b.is_premium) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    // Group by letter
    const byLetter = groupByLetter(brands);

    // Get premium brands
    const premium = brands.filter((b) => b.is_premium || b.is_favorite);

    // Get unique countries
    const countries = [...new Set(brands.map((b) => b.country).filter(Boolean))] as string[];

    // Response
    const response = {
      brands,
      total: count || brands.length,
      premium,
      byLetter,
      countries,
      pagination: {
        limit,
        offset,
        hasMore: offset + brands.length < count,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error('Brands API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch brands',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
