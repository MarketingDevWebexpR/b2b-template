/**
 * Catalog Brands API Route
 *
 * Fetches all brands from Medusa backend with filtering, sorting, and grouping.
 * Supports search, premium filtering, and alphabetical grouping.
 *
 * GET /api/catalog/brands
 *
 * Query Parameters:
 * - letter: Filter brands by first letter (A-Z or #)
 * - premium: If 'true', returns only premium/featured brands
 * - search: Search query to filter brands by name
 * - limit: Number of brands to return (default: 100)
 * - offset: Pagination offset (default: 0)
 * - sort: Sort by 'name' or 'product_count' (default: 'name')
 *
 * Response:
 * {
 *   brands: Brand[],
 *   total: number,
 *   premium: Brand[],
 *   byLetter: Record<string, Brand[]>
 * }
 *
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Brand, BrandResponse } from '@/types/brand';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes (ISR)

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PREMIUM_BRANDS_COUNT = 8;

// ============================================================================
// Types
// ============================================================================

/**
 * Raw marque response from Medusa backend
 */
interface MedusaMarqueResponse {
  marques: MedusaMarque[];
  count: number;
}

/**
 * Marque as returned by Medusa backend
 */
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

/**
 * Query parameters for the brands endpoint
 */
interface BrandsQueryParams {
  letter?: string;
  premium?: boolean;
  search?: string;
  limit: number;
  offset: number;
  sort: 'name' | 'product_count';
}

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Fetch all marques from Medusa backend
 */
async function fetchMarquesFromMedusa(): Promise<MedusaMarque[]> {
  const url = `${MEDUSA_BACKEND_URL}/cms/marques?take=500`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Catalog Brands API] Medusa error: ${response.status}`, errorText);
    throw new Error(`Medusa request failed: ${response.status}`);
  }

  const data: MedusaMarqueResponse = await response.json();
  return data.marques ?? [];
}

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Map Medusa marque to API Brand type
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
 * Get the grouping key for a brand name
 */
function getLetterKey(name: string): string {
  const firstChar = name.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(firstChar) ? firstChar : '#';
}

/**
 * Sort brands alphabetically by name
 */
function sortBrandsAlphabetically(brands: Brand[]): Brand[] {
  return [...brands].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
  );
}

/**
 * Sort brands by product count (descending)
 */
function sortBrandsByProductCount(brands: Brand[]): Brand[] {
  return [...brands].sort((a, b) => b.product_count - a.product_count);
}

/**
 * Get premium brands (top N by product count)
 */
function getPremiumBrands(brands: Brand[], count: number = PREMIUM_BRANDS_COUNT): Brand[] {
  return [...brands]
    .filter((brand) => brand.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, count)
    .map((brand) => ({ ...brand, is_premium: true }));
}

/**
 * Group brands by their first letter
 */
function groupBrandsByLetter(brands: Brand[]): Record<string, Brand[]> {
  const groups: Record<string, Brand[]> = {};

  // Initialize all letter groups
  for (let i = 65; i <= 90; i++) {
    groups[String.fromCharCode(i)] = [];
  }
  groups['#'] = [];

  // Group brands
  for (const brand of brands) {
    const key = getLetterKey(brand.name);
    groups[key].push(brand);
  }

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([, brands]) => brands.length > 0)
  );
}

/**
 * Filter brands by search query
 */
function filterBrandsBySearch(brands: Brand[], query: string): Brand[] {
  const normalizedQuery = query.toLowerCase().trim();
  return brands.filter((brand) =>
    brand.name.toLowerCase().includes(normalizedQuery) ||
    brand.description?.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Filter brands by first letter
 */
function filterBrandsByLetter(brands: Brand[], letter: string): Brand[] {
  const normalizedLetter = letter.toUpperCase();
  return brands.filter((brand) => getLetterKey(brand.name) === normalizedLetter);
}

/**
 * Apply sorting to brands
 */
function sortBrands(brands: Brand[], sortBy: 'name' | 'product_count'): Brand[] {
  if (sortBy === 'product_count') {
    return sortBrandsByProductCount(brands);
  }
  return sortBrandsAlphabetically(brands);
}

/**
 * Apply pagination to brands
 */
function paginateBrands(brands: Brand[], limit: number, offset: number): Brand[] {
  return brands.slice(offset, offset + limit);
}

/**
 * Parse and validate query parameters
 */
function parseQueryParams(request: NextRequest): BrandsQueryParams {
  const { searchParams } = new URL(request.url);

  return {
    letter: searchParams.get('letter') || undefined,
    premium: searchParams.get('premium') === 'true',
    search: searchParams.get('search') || undefined,
    limit: Math.min(Math.max(parseInt(searchParams.get('limit') || '100', 10), 1), 500),
    offset: Math.max(parseInt(searchParams.get('offset') || '0', 10), 0),
    sort: (searchParams.get('sort') as 'name' | 'product_count') || 'name',
  };
}

/**
 * Build complete brand response
 */
function buildBrandResponse(
  allBrands: Brand[],
  params: BrandsQueryParams
): BrandResponse {
  let filteredBrands = [...allBrands];

  // Apply search filter
  if (params.search) {
    filteredBrands = filterBrandsBySearch(filteredBrands, params.search);
  }

  // Apply letter filter
  if (params.letter) {
    filteredBrands = filterBrandsByLetter(filteredBrands, params.letter);
  }

  // Filter premium only
  if (params.premium) {
    filteredBrands = filteredBrands.filter(
      (brand) => brand.is_premium || brand.product_count > 10
    );
  }

  // Sort
  filteredBrands = sortBrands(filteredBrands, params.sort);

  // Get total before pagination
  const total = filteredBrands.length;

  // Apply pagination
  const paginatedBrands = paginateBrands(filteredBrands, params.limit, params.offset);

  // Get premium brands from all brands (not filtered)
  const premiumBrands = getPremiumBrands(allBrands);

  // Group all brands by letter (sorted alphabetically)
  const sortedForGrouping = sortBrandsAlphabetically(allBrands);
  const byLetter = groupBrandsByLetter(sortedForGrouping);

  return {
    brands: paginatedBrands,
    total,
    premium: premiumBrands,
    byLetter,
  };
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<BrandResponse>> {
  try {
    // Parse query parameters
    const params = parseQueryParams(request);

    // Fetch marques from Medusa backend
    const marques = await fetchMarquesFromMedusa();
    console.info(`[Catalog Brands API] Fetched ${marques.length} marques from Medusa`);

    // Map to Brand type
    const brands = marques.map(mapMedusaMarqueToBrand);

    // Build response
    const response = buildBrandResponse(brands, params);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('[Catalog Brands API] Error:', error);

    // Return empty response on error
    const emptyResponse: BrandResponse = {
      brands: [],
      total: 0,
      premium: [],
      byLetter: {},
    };

    return NextResponse.json(emptyResponse, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
