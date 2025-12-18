'use client';

/**
 * useBrands Hook for MegaMenu
 *
 * Fetches and transforms brand data from the brands API.
 * Provides brand listing with computed initials and colors for display.
 * Supports optional search/filter functionality.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type {
  Brand,
  BrandResponse,
  BrandCardData,
  BrandColor,
  BrandFilterOptions,
} from '@/types/brand';
import { BRAND_COLORS } from '@/types/brand';

// Re-export BRAND_COLORS from types for convenience
export { BRAND_COLORS };

// ============================================================================
// Constants
// ============================================================================

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Default color palette for brand initials
 * Imported from types but kept here as fallback
 */
const DEFAULT_BRAND_COLORS: BrandColor[] = [
  { bg: '#fef3c7', text: '#92400e' }, // Amber
  { bg: '#dbeafe', text: '#1e40af' }, // Blue
  { bg: '#dcfce7', text: '#166534' }, // Green
  { bg: '#fce7f3', text: '#9d174d' }, // Pink
  { bg: '#e0e7ff', text: '#3730a3' }, // Indigo
  { bg: '#ffedd5', text: '#c2410c' }, // Orange
  { bg: '#f3e8ff', text: '#7c3aed' }, // Purple
  { bg: '#ccfbf1', text: '#0f766e' }, // Teal
  { bg: '#fef9c3', text: '#854d0e' }, // Yellow
  { bg: '#fee2e2', text: '#b91c1c' }, // Red
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract initials from a brand name
 *
 * @param name - Brand name (e.g., "Van Cleef & Arpels")
 * @returns Initials (e.g., "VC")
 *
 * @example
 * getBrandInitials("Van Cleef") // "VC"
 * getBrandInitials("Cartier") // "CA"
 * getBrandInitials("LVMH") // "LV"
 */
export function getBrandInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return '??';
  }

  // Clean the name - remove common suffixes and special characters
  const cleanedName = name
    .replace(/[&+]/g, ' ')
    .replace(/\s+(Inc|LLC|Ltd|Co|Corp)\.?$/i, '')
    .trim();

  // Split into words, filter out empty strings
  const words = cleanedName.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '??';
  }

  if (words.length === 1) {
    // Single word: take first two characters
    const word = words[0];
    if (word.length === 1) {
      return word.toUpperCase();
    }
    // If it's all uppercase (like "LVMH"), take first two letters
    if (word === word.toUpperCase() && word.length >= 2) {
      return word.slice(0, 2);
    }
    // Otherwise, take first two characters
    return word.slice(0, 2).toUpperCase();
  }

  // Multiple words: take first letter of first two significant words
  // Skip common words like "de", "la", "le", "the", "and"
  const skipWords = new Set(['de', 'la', 'le', 'les', 'the', 'and', 'of', 'du', 'des']);
  const significantWords = words.filter((w) => !skipWords.has(w.toLowerCase()));

  // Use significant words if available, otherwise fall back to all words
  const wordsToUse = significantWords.length >= 2 ? significantWords : words;

  return (wordsToUse[0][0] + wordsToUse[1][0]).toUpperCase();
}

/**
 * Generate a deterministic hash from a string
 * Uses djb2 algorithm for consistent results
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Get a deterministic color based on brand name
 *
 * @param name - Brand name
 * @returns Color pair (bg and text) for initials display
 *
 * @example
 * getBrandColor("Cartier") // { bg: '#dbeafe', text: '#1e40af' }
 */
export function getBrandColor(name: string): BrandColor {
  if (!name || typeof name !== 'string') {
    return DEFAULT_BRAND_COLORS[0];
  }

  const hash = hashString(name.toLowerCase());
  const index = hash % DEFAULT_BRAND_COLORS.length;
  return DEFAULT_BRAND_COLORS[index];
}

// ============================================================================
// Cache Implementation
// ============================================================================

interface CacheEntry {
  data: BrandResponse;
  timestamp: number;
}

// Simple in-memory cache shared across hook instances
const cache: {
  entry: CacheEntry | null;
  fetchPromise: Promise<BrandResponse> | null;
} = {
  entry: null,
  fetchPromise: null,
};

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform a Brand to BrandCardData with computed initials and color
 */
function transformToBrandCardData(brand: Brand): BrandCardData {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url,
    product_count: brand.product_count,
    is_premium: brand.is_premium,
    is_favorite: brand.is_favorite,
    initials: getBrandInitials(brand.name),
    color: getBrandColor(brand.name),
  };
}

/**
 * Transform API response to include computed display data
 */
function transformBrandResponse(response: BrandResponse): {
  brands: BrandCardData[];
  premium: BrandCardData[];
  byLetter: Record<string, BrandCardData[]>;
} {
  const brands = response.brands.map(transformToBrandCardData);
  const premium = response.premium.map(transformToBrandCardData);

  // Transform byLetter groups
  const byLetter: Record<string, BrandCardData[]> = {};
  for (const [letter, letterBrands] of Object.entries(response.byLetter)) {
    byLetter[letter] = letterBrands.map(transformToBrandCardData);
  }

  return { brands, premium, byLetter };
}

// ============================================================================
// Fetch Function
// ============================================================================

async function fetchBrandsFromAPI(): Promise<BrandResponse> {
  const response = await fetch('/api/brands', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brands: ${response.status}`);
  }

  const data: BrandResponse = await response.json();
  return data;
}

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Filter brands based on search query and options
 */
function filterBrands(
  brands: BrandCardData[],
  options?: BrandFilterOptions
): BrandCardData[] {
  if (!options) {
    return brands;
  }

  let filtered = [...brands];

  // Apply search query
  if (options.query && options.query.trim()) {
    const query = options.query.toLowerCase().trim();
    filtered = filtered.filter((brand) =>
      brand.name.toLowerCase().includes(query)
    );
  }

  // Filter by premium only
  if (options.premiumOnly) {
    filtered = filtered.filter((brand) => brand.is_premium);
  }

  // Filter by minimum products
  if (options.minProducts !== undefined && options.minProducts > 0) {
    filtered = filtered.filter(
      (brand) => brand.product_count >= options.minProducts!
    );
  }

  // Sort results
  if (options.sortBy) {
    const order = options.sortOrder === 'desc' ? -1 : 1;

    filtered.sort((a, b) => {
      switch (options.sortBy) {
        case 'name':
          return order * a.name.localeCompare(b.name);
        case 'product_count':
          return order * (a.product_count - b.product_count);
        default:
          return 0;
      }
    });
  }

  return filtered;
}

/**
 * Group brands by first letter
 */
function groupByLetter(brands: BrandCardData[]): Record<string, BrandCardData[]> {
  const grouped: Record<string, BrandCardData[]> = {};

  for (const brand of brands) {
    const firstLetter = brand.name.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(brand);
  }

  // Sort letters alphabetically, with '#' at the end
  const sortedGrouped: Record<string, BrandCardData[]> = {};
  const keys = Object.keys(grouped).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  for (const key of keys) {
    sortedGrouped[key] = grouped[key];
  }

  return sortedGrouped;
}

// ============================================================================
// Hook
// ============================================================================

export interface UseBrandsOptions {
  /** Optional filter options */
  filter?: BrandFilterOptions;
}

export interface UseBrandsReturn {
  /** All brands with computed display data */
  brands: BrandCardData[];
  /** Premium/featured brands */
  premium: BrandCardData[];
  /** Brands grouped by first letter */
  byLetter: Record<string, BrandCardData[]>;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Total number of brands (before filtering) */
  total: number;
  /** Refetch brands */
  refetch: () => void;
}

/**
 * Hook to fetch and manage brand data for MegaMenu
 *
 * @param options - Optional configuration including filter options
 * @returns Brand data and state
 *
 * @example
 * // Basic usage
 * const { brands, isLoading } = useBrands();
 *
 * @example
 * // With search filter
 * const { brands, byLetter } = useBrands({
 *   filter: { query: 'cart', sortBy: 'name' }
 * });
 */
export function useBrands(options?: UseBrandsOptions): UseBrandsReturn {
  const [rawData, setRawData] = useState<{
    brands: BrandCardData[];
    premium: BrandCardData[];
    byLetter: Record<string, BrandCardData[]>;
    total: number;
  } | null>(() => {
    // Initialize from cache if available
    if (cache.entry) {
      const transformed = transformBrandResponse(cache.entry.data);
      return {
        ...transformed,
        total: cache.entry.data.total,
      };
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(!cache.entry);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const doFetch = useCallback(async () => {
    // Check if we already have a fresh cache
    if (cache.entry) {
      const age = Date.now() - cache.entry.timestamp;
      if (age < STALE_TIME) {
        const transformed = transformBrandResponse(cache.entry.data);
        setRawData({
          ...transformed,
          total: cache.entry.data.total,
        });
        setIsLoading(false);
        return;
      }
    }

    // Check if another fetch is in progress
    if (cache.fetchPromise) {
      try {
        const result = await cache.fetchPromise;
        if (mountedRef.current) {
          const transformed = transformBrandResponse(result);
          setRawData({
            ...transformed,
            total: result.total,
          });
          setIsLoading(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error('Fetch failed'));
          setIsLoading(false);
        }
      }
      return;
    }

    // Start new fetch
    setIsLoading(true);
    setError(null);

    cache.fetchPromise = fetchBrandsFromAPI();

    try {
      const result = await cache.fetchPromise;

      // Update cache
      cache.entry = {
        data: result,
        timestamp: Date.now(),
      };

      if (mountedRef.current) {
        const transformed = transformBrandResponse(result);
        setRawData({
          ...transformed,
          total: result.total,
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch brands'));
      }
    } finally {
      cache.fetchPromise = null;
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    doFetch();

    return () => {
      mountedRef.current = false;
    };
  }, [doFetch]);

  const refetch = useCallback(() => {
    cache.entry = null;
    doFetch();
  }, [doFetch]);

  // Memoize filtered brands based on filter options
  const filteredBrands = useMemo(() => {
    if (!rawData) {
      return [];
    }
    return filterBrands(rawData.brands, options?.filter);
  }, [rawData, options?.filter]);

  // Memoize filtered premium brands
  const filteredPremium = useMemo(() => {
    if (!rawData) {
      return [];
    }
    // If filtering, also filter premium brands
    if (options?.filter?.query) {
      return filterBrands(rawData.premium, { query: options.filter.query });
    }
    return rawData.premium;
  }, [rawData, options?.filter?.query]);

  // Memoize byLetter grouping (recomputed when filter changes)
  const filteredByLetter = useMemo(() => {
    if (options?.filter) {
      // Recompute groups based on filtered brands
      return groupByLetter(filteredBrands);
    }
    // Use original grouping if no filter
    return rawData?.byLetter ?? {};
  }, [filteredBrands, options?.filter, rawData?.byLetter]);

  return useMemo(
    () => ({
      brands: filteredBrands,
      premium: filteredPremium,
      byLetter: filteredByLetter,
      isLoading,
      error,
      total: rawData?.total ?? 0,
      refetch,
    }),
    [filteredBrands, filteredPremium, filteredByLetter, isLoading, error, rawData?.total, refetch]
  );
}
