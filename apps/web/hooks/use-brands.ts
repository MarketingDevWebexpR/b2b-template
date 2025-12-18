'use client';

/**
 * Brands Hook
 *
 * React hook for fetching and managing brand data with caching support.
 * For server-side functions, use @/lib/brands/server instead.
 *
 * @packageDocumentation
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type {
  Brand,
  BrandResponse,
  BrandCardData,
  BrandFilterOptions,
} from '@/types/brand';

// Re-export server functions for backwards compatibility
// These should be imported from @/lib/brands/server in Server Components
export {
  getServerBrands,
  getServerBrand,
} from '@/lib/brands/server';

// Import types for use in this file
import type { BrandWithProducts, BrandProduct } from '@/lib/brands/server';

// Re-export types
export type { BrandWithProducts, BrandProduct } from '@/lib/brands/server';

// ============================================================================
// Types
// ============================================================================

export interface UseBrandsOptions {
  /** Initial data from SSR (avoids fetch on mount) */
  initialData?: BrandResponse;
  /** Auto-fetch on mount (default: true) */
  enabled?: boolean;
  /** Stale time in ms before refetch (default: 5 minutes) */
  staleTime?: number;
  /** Filter options */
  filters?: BrandFilterOptions;
}

export interface UseBrandsResult {
  /** All brands */
  brands: Brand[];
  /** Premium/featured brands */
  premium: Brand[];
  /** Brands grouped by first letter */
  byLetter: Record<string, Brand[]>;
  /** Total count */
  total: number;
  /** Is currently fetching */
  isLoading: boolean;
  /** Has initial data loaded */
  isInitialized: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually refetch brands */
  refetch: () => Promise<void>;
  /** Get brand by slug */
  getBrandBySlug: (slug: string) => Brand | null;
  /** Filter brands by letter */
  filterByLetter: (letter: string) => Brand[];
  /** Search brands by query */
  searchBrands: (query: string) => Brand[];
  /** Get all available letters */
  availableLetters: string[];
}

export interface UseBrandOptions {
  /** Initial data from SSR */
  initialData?: BrandWithProducts;
  /** Auto-fetch on mount */
  enabled?: boolean;
}

// BrandWithProducts and BrandProduct are re-exported from @/lib/brands/server

export interface UseBrandResult {
  /** Brand data */
  brand: BrandWithProducts | null;
  /** Is loading */
  isLoading: boolean;
  /** Error */
  error: string | null;
  /** Refetch brand data */
  refetch: () => Promise<void>;
}

// ============================================================================
// Cache Implementation
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Simple in-memory cache for brands list
const brandsCache: {
  entry: CacheEntry<BrandResponse> | null;
  subscribers: Set<() => void>;
  fetchPromise: Promise<BrandResponse> | null;
} = {
  entry: null,
  subscribers: new Set(),
  fetchPromise: null,
};

// Cache for individual brands
const brandCache: Map<string, CacheEntry<BrandWithProducts>> = new Map();

function notifySubscribers() {
  brandsCache.subscribers.forEach((callback) => callback());
}

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
 * Converts a brand to card display data
 */
export function brandToCardData(brand: Brand): BrandCardData {
  // Generate initials from brand name
  const words = brand.name.split(' ').filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : brand.name.slice(0, 2).toUpperCase();

  // Generate consistent color based on brand name
  const colorIndex =
    brand.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;

  const BRAND_COLORS_ARRAY = [
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

  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url,
    product_count: brand.product_count,
    is_premium: brand.is_premium,
    is_favorite: brand.is_favorite,
    initials,
    color: BRAND_COLORS_ARRAY[colorIndex],
  };
}

// ============================================================================
// Fetch Functions
// ============================================================================

async function fetchBrands(filters?: BrandFilterOptions): Promise<BrandResponse> {
  const params = new URLSearchParams();

  if (filters?.query) {
    params.set('search', filters.query);
  }
  if (filters?.premiumOnly) {
    params.set('premium', 'true');
  }
  if (filters?.country) {
    params.set('country', filters.country);
  }
  if (filters?.minProducts) {
    params.set('minProducts', String(filters.minProducts));
  }
  if (filters?.sortBy) {
    params.set('sortBy', filters.sortBy);
  }
  if (filters?.sortOrder) {
    params.set('sortOrder', filters.sortOrder);
  }

  const url = `/api/marques${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brands: ${response.status}`);
  }

  const data = await response.json();

  // Transform API response to BrandResponse format
  const brands: Brand[] = data.brands || [];
  const byLetter = groupBrandsByLetter(brands);
  const premium = brands.filter((b: Brand) => b.is_premium || b.is_favorite);

  return {
    brands,
    total: data.total || brands.length,
    premium,
    byLetter,
  };
}

async function fetchBrandBySlug(slug: string): Promise<BrandWithProducts> {
  const response = await fetch(`/api/marques/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Brand not found');
    }
    throw new Error(`Failed to fetch brand: ${response.status}`);
  }

  const data = await response.json();
  return data.brand;
}

// ============================================================================
// useBrands Hook
// ============================================================================

/**
 * Hook for fetching and managing brands list
 *
 * @param options - Hook configuration options
 * @returns Brands data and utility functions
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { brands, premium, byLetter, isLoading } = useBrands();
 *
 * // With SSR initial data
 * const { brands } = useBrands({ initialData: serverBrands });
 *
 * // With filters
 * const { brands } = useBrands({ filters: { premiumOnly: true } });
 * ```
 */
export function useBrands(options: UseBrandsOptions = {}): UseBrandsResult {
  const {
    initialData,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    filters,
  } = options;

  // State
  const [data, setData] = useState<BrandResponse | null>(
    initialData ?? brandsCache.entry?.data ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(!!initialData || !!brandsCache.entry);

  // Refs
  const mountedRef = useRef(true);
  const staleTimeRef = useRef(staleTime);
  const filtersRef = useRef(filters);
  staleTimeRef.current = staleTime;
  filtersRef.current = filters;

  // Subscribe to cache updates
  useEffect(() => {
    const handleCacheUpdate = () => {
      if (mountedRef.current && brandsCache.entry) {
        setData(brandsCache.entry.data);
        setIsInitialized(true);
      }
    };

    brandsCache.subscribers.add(handleCacheUpdate);

    return () => {
      brandsCache.subscribers.delete(handleCacheUpdate);
    };
  }, []);

  // Fetch function
  const doFetch = useCallback(async () => {
    // Check if we have filters (skip cache if filtered)
    const hasFilters = filtersRef.current && Object.keys(filtersRef.current).length > 0;

    // Check fresh cache (only if no filters)
    if (!hasFilters && brandsCache.entry) {
      const age = Date.now() - brandsCache.entry.timestamp;
      if (age < staleTimeRef.current) {
        setData(brandsCache.entry.data);
        setIsInitialized(true);
        return;
      }
    }

    // Check if fetch in progress (only if no filters)
    if (!hasFilters && brandsCache.fetchPromise) {
      try {
        const result = await brandsCache.fetchPromise;
        if (mountedRef.current) {
          setData(result);
          setIsInitialized(true);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Fetch failed');
        }
      }
      return;
    }

    // Start new fetch
    setIsLoading(true);
    setError(null);

    const fetchPromise = fetchBrands(filtersRef.current);
    if (!hasFilters) {
      brandsCache.fetchPromise = fetchPromise;
    }

    try {
      const result = await fetchPromise;

      // Update cache (only if no filters)
      if (!hasFilters) {
        brandsCache.entry = {
          data: result,
          timestamp: Date.now(),
        };
        notifySubscribers();
      }

      if (mountedRef.current) {
        setData(result);
        setIsInitialized(true);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch brands');
      }
    } finally {
      if (!hasFilters) {
        brandsCache.fetchPromise = null;
      }
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    if (enabled && !initialData) {
      doFetch();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, initialData, doFetch]);

  // Memoized values
  const brands = useMemo(() => data?.brands ?? [], [data]);
  const premium = useMemo(() => data?.premium ?? [], [data]);
  const byLetter = useMemo(() => data?.byLetter ?? {}, [data]);
  const total = data?.total ?? 0;

  // Available letters (sorted)
  const availableLetters = useMemo(() => {
    return Object.keys(byLetter).sort();
  }, [byLetter]);

  // Utility functions
  const getBrandBySlug = useCallback(
    (slug: string): Brand | null => {
      return brands.find((b) => b.slug === slug) ?? null;
    },
    [brands]
  );

  const filterByLetter = useCallback(
    (letter: string): Brand[] => {
      return byLetter[letter.toUpperCase()] ?? [];
    },
    [byLetter]
  );

  const searchBrands = useCallback(
    (query: string): Brand[] => {
      if (!query.trim()) return brands;
      const lowerQuery = query.toLowerCase();
      return brands.filter(
        (brand) =>
          brand.name.toLowerCase().includes(lowerQuery) ||
          brand.country?.toLowerCase().includes(lowerQuery)
      );
    },
    [brands]
  );

  const refetch = useCallback(async () => {
    brandsCache.entry = null;
    await doFetch();
  }, [doFetch]);

  return {
    brands,
    premium,
    byLetter,
    total,
    isLoading,
    isInitialized,
    error,
    refetch,
    getBrandBySlug,
    filterByLetter,
    searchBrands,
    availableLetters,
  };
}

// ============================================================================
// useBrand Hook (Single Brand)
// ============================================================================

/**
 * Hook for fetching a single brand by slug
 *
 * @param slug - Brand slug
 * @param options - Hook options
 * @returns Brand data
 *
 * @example
 * ```tsx
 * const { brand, isLoading, error } = useBrand('cartier');
 * ```
 */
export function useBrand(
  slug: string | null | undefined,
  options: UseBrandOptions = {}
): UseBrandResult {
  const { initialData, enabled = true } = options;

  const [brand, setBrand] = useState<BrandWithProducts | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const doFetch = useCallback(async () => {
    if (!slug) return;

    // Check cache
    const cached = brandCache.get(slug);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < 5 * 60 * 1000) {
        setBrand(cached.data);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchBrandBySlug(slug);

      // Update cache
      brandCache.set(slug, {
        data: result,
        timestamp: Date.now(),
      });

      if (mountedRef.current) {
        setBrand(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch brand');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled && slug && !initialData) {
      doFetch();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, slug, initialData, doFetch]);

  const refetch = useCallback(async () => {
    if (slug) {
      brandCache.delete(slug);
      await doFetch();
    }
  }, [slug, doFetch]);

  return {
    brand,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// Client-side Helpers
// ============================================================================

/**
 * Prefetch brands data for hover states (client-side only)
 */
export function prefetchBrands(): void {
  if (brandsCache.entry) {
    const age = Date.now() - brandsCache.entry.timestamp;
    if (age < 5 * 60 * 1000) return;
  }

  if (brandsCache.fetchPromise) return;

  brandsCache.fetchPromise = fetchBrands()
    .then((result) => {
      brandsCache.entry = {
        data: result,
        timestamp: Date.now(),
      };
      notifySubscribers();
      return result;
    })
    .finally(() => {
      brandsCache.fetchPromise = null;
    });
}

export default useBrands;
