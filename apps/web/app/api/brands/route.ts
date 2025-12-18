/**
 * Brands API Route
 *
 * Fetches all brands from Medusa backend and transforms them for UI consumption.
 * Uses Edge runtime for optimal performance and caches results for 1 hour.
 *
 * GET /api/brands
 *
 * Response:
 * {
 *   brands: Brand[],                    // All brands sorted alphabetically
 *   total: number,                      // Total brand count
 *   premium: Brand[],                   // Top 6-8 brands by product count
 *   byLetter: Record<string, Brand[]>   // Brands grouped by first letter (A-Z, #)
 * }
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { Brand, BrandResponse } from '@/types/brand';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour (ISR)

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PREMIUM_BRANDS_COUNT = 8;
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// ============================================================================
// Mock Data (for development/fallback)
// ============================================================================

/** Mock brand data shape for fallback */
interface MockBrand {
  id: string;
  name: string;
  handle: string;
  logo_url: string | null;
  country: string;
  product_count: number;
  description: string;
}

const MOCK_BRANDS: MockBrand[] = [
  { id: 'brand_cartier', name: 'Cartier', handle: 'cartier', logo_url: null, country: 'France', product_count: 156, description: 'Maison de haute joaillerie française' },
  { id: 'brand_tiffany', name: 'Tiffany & Co', handle: 'tiffany-co', logo_url: null, country: 'USA', product_count: 142, description: 'American luxury jewelry brand' },
  { id: 'brand_bvlgari', name: 'Bulgari', handle: 'bulgari', logo_url: null, country: 'Italie', product_count: 128, description: 'Italian luxury brand' },
  { id: 'brand_vancleef', name: 'Van Cleef & Arpels', handle: 'van-cleef-arpels', logo_url: null, country: 'France', product_count: 98, description: 'French luxury jewelry house' },
  { id: 'brand_chopard', name: 'Chopard', handle: 'chopard', logo_url: null, country: 'Suisse', product_count: 87, description: 'Swiss luxury watchmaker and jeweler' },
  { id: 'brand_piaget', name: 'Piaget', handle: 'piaget', logo_url: null, country: 'Suisse', product_count: 76, description: 'Swiss luxury watchmaker' },
  { id: 'brand_boucheron', name: 'Boucheron', handle: 'boucheron', logo_url: null, country: 'France', product_count: 65, description: 'French high jewelry maison' },
  { id: 'brand_chaumet', name: 'Chaumet', handle: 'chaumet', logo_url: null, country: 'France', product_count: 58, description: 'Parisian high jewelry and watchmaking maison' },
  { id: 'brand_graff', name: 'Graff', handle: 'graff', logo_url: null, country: 'UK', product_count: 52, description: 'British luxury jeweler' },
  { id: 'brand_harrywinston', name: 'Harry Winston', handle: 'harry-winston', logo_url: null, country: 'USA', product_count: 48, description: 'American luxury jeweler' },
  { id: 'brand_mikimoto', name: 'Mikimoto', handle: 'mikimoto', logo_url: null, country: 'Japon', product_count: 45, description: 'Japanese pearl jeweler' },
  { id: 'brand_pomellato', name: 'Pomellato', handle: 'pomellato', logo_url: null, country: 'Italie', product_count: 42, description: 'Italian jewelry brand' },
  { id: 'brand_davidyurman', name: 'David Yurman', handle: 'david-yurman', logo_url: null, country: 'USA', product_count: 38, description: 'American jewelry designer' },
  { id: 'brand_degrisogono', name: 'De Grisogono', handle: 'de-grisogono', logo_url: null, country: 'Suisse', product_count: 35, description: 'Swiss luxury jeweler' },
  { id: 'brand_fred', name: 'Fred', handle: 'fred', logo_url: null, country: 'France', product_count: 32, description: 'Parisian jeweler' },
  { id: 'brand_messika', name: 'Messika', handle: 'messika', logo_url: null, country: 'France', product_count: 30, description: 'French diamond jewelry' },
  { id: 'brand_repossi', name: 'Repossi', handle: 'repossi', logo_url: null, country: 'Italie', product_count: 28, description: 'Italian fine jewelry' },
  { id: 'brand_dinh_van', name: 'Dinh Van', handle: 'dinh-van', logo_url: null, country: 'France', product_count: 26, description: 'French jewelry designer' },
  { id: 'brand_mauboussin', name: 'Mauboussin', handle: 'mauboussin', logo_url: null, country: 'France', product_count: 24, description: 'French jeweler since 1827' },
  { id: 'brand_roberto_coin', name: 'Roberto Coin', handle: 'roberto-coin', logo_url: null, country: 'Italie', product_count: 22, description: 'Italian jewelry designer' },
  { id: 'brand_stephen_webster', name: 'Stephen Webster', handle: 'stephen-webster', logo_url: null, country: 'UK', product_count: 20, description: 'British jewelry designer' },
  { id: 'brand_wellendorff', name: 'Wellendorff', handle: 'wellendorff', logo_url: null, country: 'Allemagne', product_count: 18, description: 'German goldsmith' },
  { id: 'brand_zolotas', name: 'Zolotas', handle: 'zolotas', logo_url: null, country: 'Grèce', product_count: 16, description: 'Greek jeweler' },
  { id: 'brand_nikos_koulis', name: 'Nikos Koulis', handle: 'nikos-koulis', logo_url: null, country: 'Grèce', product_count: 14, description: 'Greek fine jewelry' },
  { id: 'brand_akillis', name: 'Akillis', handle: 'akillis', logo_url: null, country: 'France', product_count: 12, description: 'French jewelry brand' },
];

// ============================================================================
// Types
// ============================================================================

/**
 * Raw marque response from Medusa backend
 * Note: Medusa uses "marques" in French
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
  is_favorite?: boolean;
  product_count?: number;
}

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Fetch all marques from Medusa backend CMS endpoint
 * @returns Array of marques from the API
 * @throws Error if the request fails
 */
async function fetchMarquesFromMedusa(): Promise<MedusaMarque[]> {
  const url = `${MEDUSA_BACKEND_URL}/cms/marques?take=200`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Note: Edge runtime uses `revalidate` export for caching, not fetch options
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Brands API] Medusa error: ${response.status}`, errorText);
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
 * Normalizes fields and ensures proper defaults
 */
function mapMedusaMarqueToBrand(marque: MedusaMarque): Brand {
  return {
    id: marque.id,
    name: marque.name,
    slug: marque.slug,
    logo_url: marque.logo_url ?? null,
    country: null, // Not available in Medusa marque model
    product_count: marque.product_count ?? 0,
    description: marque.description ?? null,
    founded_year: null,
    is_favorite: marque.is_favorite ?? false,
  };
}

/**
 * Map mock brand to API Brand type
 * Preserves product_count and country from mock data
 */
function mapMockBrandToBrand(mockBrand: MockBrand): Brand {
  return {
    id: mockBrand.id,
    name: mockBrand.name,
    slug: mockBrand.handle,
    logo_url: mockBrand.logo_url,
    country: mockBrand.country,
    product_count: mockBrand.product_count,
    description: mockBrand.description,
    founded_year: null,
  };
}

/**
 * Sort brands alphabetically by name (case-insensitive)
 */
function sortBrandsAlphabetically(brands: Brand[]): Brand[] {
  return [...brands].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
  );
}

/**
 * Get premium brands (top N by product count)
 * Filters to brands with at least 1 product
 */
function getPremiumBrands(brands: Brand[], count: number = PREMIUM_BRANDS_COUNT): Brand[] {
  return [...brands]
    .filter((brand) => brand.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, count)
    .map((brand) => ({ ...brand, is_premium: true }));
}

/**
 * Get the grouping key for a brand name
 * Returns uppercase first letter (A-Z) or '#' for numbers/special chars
 */
function getLetterKey(name: string): string {
  const firstChar = name.trim().charAt(0).toUpperCase();

  // Check if it's a letter (A-Z)
  if (/^[A-Z]$/.test(firstChar)) {
    return firstChar;
  }

  // Numbers and special characters go under '#'
  return '#';
}

/**
 * Group brands by their first letter
 * Creates entries for A-Z and # (for numbers/special chars)
 */
function groupBrandsByLetter(brands: Brand[]): Record<string, Brand[]> {
  const groups: Record<string, Brand[]> = {};

  // Initialize all letter groups (ensures consistent ordering)
  for (let i = 65; i <= 90; i++) {
    groups[String.fromCharCode(i)] = [];
  }
  groups['#'] = [];

  // Group brands
  for (const brand of brands) {
    const key = getLetterKey(brand.name);
    groups[key].push(brand);
  }

  // Remove empty groups for cleaner response
  const result: Record<string, Brand[]> = {};
  for (const [key, value] of Object.entries(groups)) {
    if (value.length > 0) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Build complete brand response from transformed brands
 */
function buildBrandResponse(brands: Brand[]): BrandResponse {
  // Sort alphabetically
  const sortedBrands = sortBrandsAlphabetically(brands);

  // Get premium brands
  const premiumBrands = getPremiumBrands(brands);

  // Group by letter
  const byLetter = groupBrandsByLetter(sortedBrands);

  return {
    brands: sortedBrands,
    total: sortedBrands.length,
    premium: premiumBrands,
    byLetter,
  };
}

/**
 * Create empty fallback response for error cases
 */
function createEmptyResponse(): BrandResponse {
  return {
    brands: [],
    total: 0,
    premium: [],
    byLetter: {},
  };
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(): Promise<NextResponse<BrandResponse>> {
  let brands: Brand[] = [];
  let usedMockData = false;

  try {
    // Try to fetch marques from Medusa backend
    const marques = await fetchMarquesFromMedusa();
    console.info(`[Brands API] Fetched ${marques.length} marques from Medusa`);

    // Map Medusa marques to Brand type
    brands = marques.map(mapMedusaMarqueToBrand);
  } catch (error) {
    console.warn('[Brands API] Medusa fetch failed, using mock data:', error);
    usedMockData = true;
  }

  // If no brands from Medusa (error or empty response), use mock data
  if (brands.length === 0) {
    if (!usedMockData) {
      console.info('[Brands API] No marques from Medusa, using mock data');
    }
    // Map mock brands directly to Brand type, preserving product_count and country
    brands = MOCK_BRANDS.map(mapMockBrandToBrand);
  }

  // Build complete response
  const response = buildBrandResponse(brands);

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=3600',
      'Vercel-CDN-Cache-Control': 'public, max-age=3600',
    },
  });
}
