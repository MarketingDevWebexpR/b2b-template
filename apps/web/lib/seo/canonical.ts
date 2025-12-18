/**
 * Canonical URL Helper
 *
 * Utilities for generating canonical URLs for SEO.
 * Handles trailing slashes, query parameters, and normalization.
 *
 * @packageDocumentation
 */

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sage-portal.webexpr.dev';

/**
 * Query parameters that should be stripped from canonical URLs.
 * These are typically filter/sort parameters that don't represent unique content.
 */
const IGNORED_PARAMS = [
  // Pagination
  'page',
  'offset',
  'limit',
  // Sorting
  'sort',
  'order',
  'tri',
  'ordre',
  // Filtering
  'filter',
  'filtre',
  'min_price',
  'max_price',
  'prix_min',
  'prix_max',
  'brand',
  'marque',
  'color',
  'couleur',
  'material',
  'matiere',
  'size',
  'taille',
  // Display preferences
  'view',
  'affichage',
  'per_page',
  'par_page',
  // Tracking/analytics (should not be in canonical)
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'referrer',
  'gclid',
  'fbclid',
  'msclkid',
  // Session/temporary
  '_gl',
  '_ga',
  'sessionid',
  'sid',
];

/**
 * Query parameters that SHOULD be kept in canonical URLs.
 * These represent semantically different content.
 */
const PRESERVED_PARAMS = ['q', 'query', 'recherche', 'search'];

// ============================================================================
// Types
// ============================================================================

export interface CanonicalOptions {
  /** Whether to include trailing slash */
  trailingSlash?: boolean;
  /** Additional params to ignore beyond defaults */
  ignoreParams?: string[];
  /** Params to explicitly preserve beyond defaults */
  preserveParams?: string[];
  /** Force lowercase path */
  lowercasePath?: boolean;
  /** Base URL override */
  baseUrl?: string;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Generate the canonical URL for a given path.
 *
 * This function:
 * - Normalizes the path (removes double slashes, etc.)
 * - Strips ignored query parameters
 * - Handles trailing slashes consistently
 * - Ensures lowercase paths
 *
 * @example
 * ```typescript
 * // Basic usage
 * getCanonicalUrl('/produit/gold-ring')
 * // Returns: 'https://sage-portal.webexpr.dev/produit/gold-ring'
 *
 * // With query params
 * getCanonicalUrl('/recherche?q=collier&sort=price&utm_source=google')
 * // Returns: 'https://sage-portal.webexpr.dev/recherche?q=collier'
 *
 * // Category with hierarchy
 * getCanonicalUrl('/categorie/bijoux/colliers/colliers-or')
 * // Returns: 'https://sage-portal.webexpr.dev/categorie/bijoux/colliers/colliers-or'
 * ```
 */
export function getCanonicalUrl(path: string, options: CanonicalOptions = {}): string {
  const {
    trailingSlash = false,
    ignoreParams = [],
    preserveParams = [],
    lowercasePath = true,
    baseUrl = SITE_URL,
  } = options;

  // Handle empty path
  if (!path || path === '/') {
    return trailingSlash ? `${baseUrl}/` : baseUrl;
  }

  // Normalize the path
  let normalizedPath = path;

  // Remove base URL if included in path
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    try {
      const url = new URL(normalizedPath);
      normalizedPath = url.pathname + url.search;
    } catch {
      // Invalid URL, treat as path
    }
  }

  // Ensure path starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  // Split path and query string
  const [pathPart, queryPart] = normalizedPath.split('?');

  // Normalize path part
  let cleanPath = pathPart
    // Remove double slashes
    .replace(/\/+/g, '/')
    // Remove trailing slash for consistency
    .replace(/\/$/, '');

  // Apply lowercase if enabled
  if (lowercasePath) {
    cleanPath = cleanPath.toLowerCase();
  }

  // Handle trailing slash preference
  if (trailingSlash && cleanPath !== '') {
    cleanPath += '/';
  }

  // Process query parameters
  let canonicalQuery = '';
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const filteredParams = new URLSearchParams();

    // Determine which params to ignore
    const paramsToIgnore = new Set([...IGNORED_PARAMS, ...ignoreParams]);

    // Determine which params to preserve
    const paramsToPreserve = new Set([...PRESERVED_PARAMS, ...preserveParams]);

    // Filter params
    params.forEach((value, key) => {
      const lowerKey = key.toLowerCase();

      // Always preserve if in preserve list
      if (paramsToPreserve.has(lowerKey)) {
        filteredParams.set(key, value);
        return;
      }

      // Skip if in ignore list
      if (paramsToIgnore.has(lowerKey)) {
        return;
      }

      // Keep other params (be conservative - might be important)
      filteredParams.set(key, value);
    });

    // Sort params for consistent URLs
    const entries: [string, string][] = [];
    filteredParams.forEach((value, key) => {
      entries.push([key, value]);
    });
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    const sortedParams = new URLSearchParams(entries);

    canonicalQuery = sortedParams.toString();
  }

  // Build final URL
  const finalPath = canonicalQuery ? `${cleanPath}?${canonicalQuery}` : cleanPath;

  return `${baseUrl}${finalPath}`;
}

/**
 * Generate canonical URL for a product page
 */
export function getProductCanonicalUrl(handle: string): string {
  return getCanonicalUrl(`/produit/${handle}`);
}

/**
 * Generate canonical URL for a category page with full hierarchy
 *
 * @example
 * ```typescript
 * getCategoryCanonicalUrl('colliers-or', ['bijoux', 'colliers'])
 * // Returns: 'https://sage-portal.webexpr.dev/categorie/bijoux/colliers/colliers-or'
 * ```
 */
export function getCategoryCanonicalUrl(handle: string, ancestorHandles: string[] = []): string {
  const pathParts = [...ancestorHandles, handle];
  return getCanonicalUrl(`/categorie/${pathParts.join('/')}`);
}

/**
 * Generate canonical URL for a brand page
 */
export function getBrandCanonicalUrl(slug: string): string {
  return getCanonicalUrl(`/marques/${slug}`);
}

/**
 * Generate canonical URL for search results
 * Only preserves the query parameter, strips all others
 */
export function getSearchCanonicalUrl(query: string): string {
  if (!query) {
    return getCanonicalUrl('/recherche');
  }
  return getCanonicalUrl(`/recherche?q=${encodeURIComponent(query)}`);
}

// ============================================================================
// Alternate URLs (for hreflang)
// ============================================================================

export interface AlternateUrl {
  hreflang: string;
  href: string;
}

/**
 * Generate alternate URLs for different languages/regions
 * Currently returns French as primary (site is FR-focused B2B)
 *
 * @example
 * ```typescript
 * getAlternateUrls('/produit/gold-ring')
 * // Returns: [
 * //   { hreflang: 'fr', href: 'https://sage-portal.webexpr.dev/produit/gold-ring' },
 * //   { hreflang: 'x-default', href: 'https://sage-portal.webexpr.dev/produit/gold-ring' }
 * // ]
 * ```
 */
export function getAlternateUrls(path: string): AlternateUrl[] {
  const canonical = getCanonicalUrl(path);

  return [
    { hreflang: 'fr', href: canonical },
    { hreflang: 'x-default', href: canonical },
  ];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a URL/path should be indexed by search engines
 */
export function isIndexablePath(path: string): boolean {
  const noIndexPatterns = [
    /^\/compte/,
    /^\/panier/,
    /^\/panier-b2b/,
    /^\/checkout/,
    /^\/dashboard/,
    /^\/tableau-de-bord/,
    /^\/commandes/,
    /^\/devis/,
    /^\/entreprise/,
    /^\/listes/,
    /^\/approbations/,
    /^\/rapports/,
    /^\/comparer/,
    /^\/commande-rapide/,
    /^\/api\//,
    /^\/_next\//,
    /^\/login/,
    /^\/register/,
    /^\/auth/,
  ];

  const normalizedPath = path.toLowerCase().split('?')[0];

  return !noIndexPatterns.some((pattern) => pattern.test(normalizedPath));
}

/**
 * Build a complete metadata URL object for Next.js
 */
export function buildMetadataUrl(path: string): URL | string {
  const canonical = getCanonicalUrl(path);
  try {
    return new URL(canonical);
  } catch {
    return canonical;
  }
}
