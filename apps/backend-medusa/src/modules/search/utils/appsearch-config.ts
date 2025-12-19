/**
 * Elastic App Search Configuration
 *
 * Configuration for Elastic App Search engine including:
 * - Search field weights for relevance tuning
 * - Result field configuration
 * - Facet definitions
 * - Synonyms and curations
 *
 * App Search Endpoint: https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io
 * Engine: dev-medusa-v2
 */

import type { IndexSettings } from '../providers/search-provider.interface';

/**
 * App Search specific configuration interface
 */
export interface AppSearchEngineConfig {
  /** Name of the engine in App Search */
  engineName: string;
  /** Search field weights (0-10 scale, higher = more important) */
  searchFields: Record<string, { weight: number }>;
  /** Fields to return in results */
  resultFields: Record<string, { raw?: object; snippet?: { size?: number; fallback?: boolean } }>;
  /** Facet configuration */
  facets: Record<string, { type: 'value' | 'range'; size?: number }>;
  /** Boost configuration for relevance */
  boosts?: Record<string, Array<{ type: string; value?: unknown; operation?: string; factor?: number }>>;
}

/**
 * App Search API configuration
 */
export interface AppSearchConfig {
  /** App Search endpoint URL */
  endpoint: string;
  /** Private API key (for indexing) */
  privateApiKey: string;
  /** Public search key (for frontend queries) */
  publicSearchKey?: string;
  /** Engine name */
  engineName: string;
  /** Request timeout in ms */
  requestTimeout?: number;
}

// =============================================================================
// PRODUCTS ENGINE CONFIGURATION
// =============================================================================

/**
 * Product search field weights
 * Scale: 0-10 (10 = highest priority)
 *
 * Ponderation standard: Title > Description > SKU > Tags
 */
export const PRODUCTS_SEARCH_FIELDS: Record<string, { weight: number }> = {
  // Highest priority - Product identification
  title: { weight: 10 },
  handle: { weight: 7 },

  // High priority - SKU/Barcode for B2B lookup
  sku: { weight: 9 },
  barcode: { weight: 9 },

  // Medium priority - Brand and categorization
  brand_name: { weight: 7 },
  brand: { weight: 6 },
  category_names: { weight: 6 },

  // Hierarchical category search
  category_lvl0: { weight: 5 },
  category_lvl1: { weight: 4 },
  category_lvl2: { weight: 3 },

  // Standard priority - Descriptions and details
  description: { weight: 5 },
  collection: { weight: 5 },
  material: { weight: 4 },

  // Lower priority - Tags and metadata
  tags: { weight: 3 },
  category_paths: { weight: 3 },
};

/**
 * Product result fields configuration
 * Defines which fields to return and how
 */
export const PRODUCTS_RESULT_FIELDS: Record<string, { raw?: object; snippet?: { size?: number; fallback?: boolean } }> = {
  // Always return these as raw
  id: { raw: {} },
  title: { raw: {}, snippet: { size: 100, fallback: true } },
  handle: { raw: {} },
  description: { raw: {}, snippet: { size: 200, fallback: true } },
  sku: { raw: {} },
  barcode: { raw: {} },
  thumbnail: { raw: {} },
  images: { raw: {} },

  // Brand/Marque fields
  brand_id: { raw: {} },
  brand_name: { raw: {} },
  brand_slug: { raw: {} },
  brand: { raw: {} },

  // Category fields
  category_ids: { raw: {} },
  category_names: { raw: {} },
  category_paths: { raw: {} },
  all_category_handles: { raw: {} },
  categories: { raw: {} },

  // Hierarchical category levels for InstantSearch navigation
  category_lvl0: { raw: {} },
  category_lvl1: { raw: {} },
  category_lvl2: { raw: {} },
  category_lvl3: { raw: {} },
  category_lvl4: { raw: {} },

  // Pricing and availability
  price_min: { raw: {} },
  price_max: { raw: {} },
  is_available: { raw: {} },
  has_stock: { raw: {} },

  // Collections and tags
  collection_id: { raw: {} },
  collection: { raw: {} },
  material: { raw: {} },
  tags: { raw: {} },

  // Variants
  variants: { raw: {} },

  // Timestamps
  created_at: { raw: {} },
  updated_at: { raw: {} },

  // Metadata
  metadata: { raw: {} },
};

/**
 * Product facets configuration
 *
 * Includes hierarchical category levels (category_lvl0-4) for InstantSearch-style navigation
 */
export const PRODUCTS_FACETS: Record<string, { type: 'value' | 'range'; size?: number }> = {
  // Hierarchical category facets (Algolia/InstantSearch style)
  // Each level contains full path: "Électricité > Câbles > Domestique"
  category_lvl0: { type: 'value', size: 20 },  // Top-level categories
  category_lvl1: { type: 'value', size: 50 },  // Sub-categories
  category_lvl2: { type: 'value', size: 100 }, // Sub-sub-categories
  category_lvl3: { type: 'value', size: 100 }, // Deeper levels
  category_lvl4: { type: 'value', size: 50 },  // Deepest level

  // Legacy category facets (kept for compatibility)
  category_names: { type: 'value', size: 50 },
  category_ids: { type: 'value', size: 50 },

  // Brand facets
  brand_name: { type: 'value', size: 30 },
  brand_id: { type: 'value', size: 30 },

  // Filter facets
  collection: { type: 'value', size: 20 },
  material: { type: 'value', size: 20 },
  tags: { type: 'value', size: 30 },
  has_stock: { type: 'value', size: 2 },
  is_available: { type: 'value', size: 2 },

  // Price ranges
  price_min: { type: 'range' },
  price_max: { type: 'range' },
};

/**
 * Product boosts for relevance tuning
 * Note: has_stock and is_available use string values "true"/"false" for consistent faceting
 */
export const PRODUCTS_BOOSTS: Record<string, Array<{ type: string; value?: unknown; operation?: string; factor?: number }>> = {
  // Boost products in stock (string "true" for App Search compatibility)
  has_stock: [
    { type: 'value', value: 'true', operation: 'multiply', factor: 1.5 },
  ],
  // Boost available products (string "true" for App Search compatibility)
  is_available: [
    { type: 'value', value: 'true', operation: 'multiply', factor: 1.3 },
  ],
};

// =============================================================================
// CATEGORIES ENGINE CONFIGURATION
// =============================================================================

export const CATEGORIES_SEARCH_FIELDS: Record<string, { weight: number }> = {
  name: { weight: 10 },
  handle: { weight: 8 },
  description: { weight: 5 },
  path: { weight: 6 },
  ancestor_names: { weight: 4 },
};

export const CATEGORIES_RESULT_FIELDS: Record<string, { raw?: object; snippet?: { size?: number; fallback?: boolean } }> = {
  id: { raw: {} },
  name: { raw: {} },
  handle: { raw: {} },
  description: { raw: {}, snippet: { size: 150, fallback: true } },
  parent_category_id: { raw: {} },
  parent_category_ids: { raw: {} },
  path: { raw: {} },
  ancestor_names: { raw: {} },
  ancestor_handles: { raw: {} },
  is_active: { raw: {} },
  rank: { raw: {} },
  depth: { raw: {} },
  product_count: { raw: {} },
  icon: { raw: {} },
  image_url: { raw: {} },
  created_at: { raw: {} },
  metadata: { raw: {} },
};

export const CATEGORIES_FACETS: Record<string, { type: 'value' | 'range'; size?: number }> = {
  depth: { type: 'value', size: 10 },
  is_active: { type: 'value', size: 2 },
  parent_category_id: { type: 'value', size: 50 },
};

// =============================================================================
// MARQUES (BRANDS) ENGINE CONFIGURATION
// =============================================================================

export const MARQUES_SEARCH_FIELDS: Record<string, { weight: number }> = {
  name: { weight: 10 },
  description: { weight: 5 },
  country: { weight: 3 },
  slug: { weight: 7 },
};

export const MARQUES_RESULT_FIELDS: Record<string, { raw?: object; snippet?: { size?: number; fallback?: boolean } }> = {
  id: { raw: {} },
  name: { raw: {} },
  slug: { raw: {} },
  description: { raw: {}, snippet: { size: 150, fallback: true } },
  country: { raw: {} },
  logo_url: { raw: {} },
  website_url: { raw: {} },
  is_active: { raw: {} },
  rank: { raw: {} },
  created_at: { raw: {} },
  updated_at: { raw: {} },
  metadata: { raw: {} },
};

export const MARQUES_FACETS: Record<string, { type: 'value' | 'range'; size?: number }> = {
  is_active: { type: 'value', size: 2 },
  country: { type: 'value', size: 30 },
};

// =============================================================================
// COLLECTIONS ENGINE CONFIGURATION
// =============================================================================

export const COLLECTIONS_SEARCH_FIELDS: Record<string, { weight: number }> = {
  title: { weight: 10 },
  handle: { weight: 8 },
  'metadata.description': { weight: 5 },
};

export const COLLECTIONS_RESULT_FIELDS: Record<string, { raw?: object; snippet?: { size?: number; fallback?: boolean } }> = {
  id: { raw: {} },
  title: { raw: {} },
  handle: { raw: {} },
  product_count: { raw: {} },
  created_at: { raw: {} },
  metadata: { raw: {} },
};

export const COLLECTIONS_FACETS: Record<string, { type: 'value' | 'range'; size?: number }> = {
  product_count: { type: 'range' },
};

// =============================================================================
// SYNONYMS FOR JEWELRY INDUSTRY (French/English)
// =============================================================================

/**
 * Synonyms configuration for App Search
 * Format: Array of synonym sets (words in each set are considered equivalent)
 */
export const JEWELRY_SYNONYMS: string[][] = [
  // Materials - French/English
  ['or', 'gold', 'dore', 'jaune'],
  ['argent', 'silver', 'argente'],
  ['platine', 'platinum'],
  ['diamant', 'diamond', 'brillant'],
  ['perle', 'pearl', 'nacre'],
  ['rubis', 'ruby', 'rouge'],
  ['saphir', 'sapphire', 'bleu'],
  ['emeraude', 'emerald', 'vert'],
  ['cristal', 'crystal'],
  ['acier', 'steel', 'inox'],

  // Product types - French/English
  ['bague', 'ring', 'anneau'],
  ['collier', 'necklace', 'chaine', 'pendentif'],
  ['bracelet', 'gourmette', 'jonc'],
  ['boucle', 'earring', 'pendante', 'clou', 'creole'],
  ['montre', 'watch', 'horloge'],
  ['broche', 'brooch', 'pin'],
  ['parure', 'set', 'ensemble'],

  // B2B terms
  ['lot', 'pack', 'ensemble', 'assortiment'],
  ['gros', 'wholesale', 'grossiste'],
  ['catalogue', 'catalog', 'collection'],
  ['professionnel', 'pro', 'b2b'],
];

// =============================================================================
// CURATIONS (Promoted/Hidden Results)
// =============================================================================

/**
 * Default curations for common queries
 * These can be managed via the App Search dashboard
 */
export const DEFAULT_CURATIONS: Array<{
  query: string;
  promoted?: string[];
  hidden?: string[];
}> = [
  // Example: Promote specific products for certain queries
  // { query: 'best sellers', promoted: ['prod_xxx', 'prod_yyy'] },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get App Search engine configuration for a given index type
 *
 * All entity types (products, categories, marques, collections) are stored
 * in a SINGLE engine. Documents are distinguished by a `doc_type` field.
 * This simplifies management and allows cross-entity search.
 */
export function getAppSearchEngineConfig(
  indexName: string,
  baseEngineName: string
): AppSearchEngineConfig {
  // All entity types use the same engine - documents are distinguished by doc_type field
  const engineName = baseEngineName;

  switch (indexName) {
    case 'products':
      return {
        engineName,
        searchFields: PRODUCTS_SEARCH_FIELDS,
        resultFields: PRODUCTS_RESULT_FIELDS,
        facets: PRODUCTS_FACETS,
        boosts: PRODUCTS_BOOSTS,
      };
    case 'categories':
      return {
        engineName,
        searchFields: CATEGORIES_SEARCH_FIELDS,
        resultFields: CATEGORIES_RESULT_FIELDS,
        facets: CATEGORIES_FACETS,
      };
    case 'marques':
      return {
        engineName,
        searchFields: MARQUES_SEARCH_FIELDS,
        resultFields: MARQUES_RESULT_FIELDS,
        facets: MARQUES_FACETS,
      };
    case 'collections':
      return {
        engineName,
        searchFields: COLLECTIONS_SEARCH_FIELDS,
        resultFields: COLLECTIONS_RESULT_FIELDS,
        facets: COLLECTIONS_FACETS,
      };
    default:
      throw new Error(`Unknown index type: ${indexName}`);
  }
}

/**
 * App Search filter value type
 */
type AppSearchFilterValue =
  | string
  | number
  | boolean
  | { from?: number; to?: number };

/**
 * App Search filter structure
 */
interface AppSearchFilter {
  readonly [field: string]: AppSearchFilterValue;
}

/**
 * Combined App Search filter with logical operators
 */
interface AppSearchCombinedFilter {
  readonly all?: ReadonlyArray<AppSearchFilter | AppSearchCombinedFilter>;
  readonly any?: ReadonlyArray<AppSearchFilter | AppSearchCombinedFilter>;
  readonly none?: ReadonlyArray<AppSearchFilter | AppSearchCombinedFilter>;
}

/**
 * Convert filter syntax to App Search filter format
 *
 * Input: 'category_id = "cat_123" AND has_stock = true'
 * Output: { all: [{ category_id: "cat_123" }, { has_stock: true }] }
 *
 * @param filter - Filter string or array
 * @returns App Search filter object or undefined if no valid filters
 */
export function convertFilterToAppSearch(
  filter: string | string[] | undefined
): AppSearchFilter | AppSearchCombinedFilter | undefined {
  if (!filter) return undefined;

  const filterStr = Array.isArray(filter)
    ? filter.join(' AND ')
    : filter;

  if (!filterStr.trim()) return undefined;

  const filters: AppSearchFilter[] = [];

  // Parse simple equality filters: field = "value" or field = value
  const equalityRegex = /(\w+(?:\.\w+)?)\s*=\s*(?:"([^"]+)"|(\w+))/g;
  let match: RegExpExecArray | null;

  while ((match = equalityRegex.exec(filterStr)) !== null) {
    const field = match[1];
    const rawValue = match[2] ?? match[3];

    // Handle boolean values - App Search requires string values for boolean fields
    if (rawValue === 'true' || rawValue === 'false') {
      filters.push({ [field]: rawValue });
    } else if (!isNaN(Number(rawValue)) && rawValue !== '') {
      // Handle numeric values
      filters.push({ [field]: Number(rawValue) });
    } else {
      // String value
      filters.push({ [field]: rawValue });
    }
  }

  // Parse IN operator: field IN ["value1", "value2"]
  const inRegex = /(\w+(?:\.\w+)?)\s+IN\s+\[([^\]]+)\]/gi;
  while ((match = inRegex.exec(filterStr)) !== null) {
    const field = match[1];
    const valuesStr = match[2];
    // Parse comma-separated values (with or without quotes)
    const values = valuesStr
      .split(',')
      .map(v => v.trim().replace(/^["']|["']$/g, ''))
      .filter(v => v.length > 0);

    if (values.length > 0) {
      // App Search uses "any" for OR conditions within a field
      // Each value becomes a separate filter in an "any" block
      // For now, just use the first value (App Search IN support varies)
      filters.push({ [field]: values[0] });
    }
  }

  // Parse range filters: field >= value, field <= value
  const rangeRegex = /(\w+(?:\.\w+)?)\s*(>=|<=|>|<)\s*(\d+(?:\.\d+)?)/g;
  while ((match = rangeRegex.exec(filterStr)) !== null) {
    const field = match[1];
    const operator = match[2];
    const value = parseFloat(match[3]);
    const isInteger = Number.isInteger(value);

    // Build range filter based on operator
    // For strict inequalities on integers, adjust by 1 instead of 0.01
    switch (operator) {
      case '>=':
        filters.push({ [field]: { from: value } });
        break;
      case '<=':
        filters.push({ [field]: { to: value } });
        break;
      case '>':
        // For strict greater than, use from with +1 for integers, small delta for floats
        filters.push({
          [field]: { from: isInteger ? value + 1 : value + Number.EPSILON },
        });
        break;
      case '<':
        // For strict less than, use to with -1 for integers, small delta for floats
        filters.push({
          [field]: { to: isInteger ? value - 1 : value - Number.EPSILON },
        });
        break;
    }
  }

  // Parse NOT EQUAL: field != "value" or field <> "value"
  const notEqualRegex = /(\w+(?:\.\w+)?)\s*(?:!=|<>)\s*(?:"([^"]+)"|(\w+))/g;
  while ((match = notEqualRegex.exec(filterStr)) !== null) {
    const field = match[1];
    const rawValue = match[2] ?? match[3];

    // App Search uses "none" for NOT conditions
    // For now, log a warning - this needs special handling
    console.warn(
      `[AppSearch] NOT EQUAL filter (${field} != ${rawValue}) requires special handling`
    );
  }

  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];

  // Combine with AND logic
  return { all: filters };
}

/**
 * Convert sort syntax to App Search format
 *
 * Input: ['price_min:asc', 'created_at:desc']
 * Output: { price_min: 'asc', created_at: 'desc' }
 */
export function convertSortToAppSearch(
  sort: string[] | undefined
): Record<string, 'asc' | 'desc'> | undefined {
  if (!sort || sort.length === 0) return undefined;

  const sortObj: Record<string, 'asc' | 'desc'> = {};

  for (const sortItem of sort) {
    const [field, direction] = sortItem.split(':');
    if (field && (direction === 'asc' || direction === 'desc')) {
      sortObj[field] = direction;
    }
  }

  return Object.keys(sortObj).length > 0 ? sortObj : undefined;
}

export default {
  PRODUCTS_SEARCH_FIELDS,
  PRODUCTS_RESULT_FIELDS,
  PRODUCTS_FACETS,
  PRODUCTS_BOOSTS,
  CATEGORIES_SEARCH_FIELDS,
  CATEGORIES_RESULT_FIELDS,
  CATEGORIES_FACETS,
  MARQUES_SEARCH_FIELDS,
  MARQUES_RESULT_FIELDS,
  MARQUES_FACETS,
  COLLECTIONS_SEARCH_FIELDS,
  COLLECTIONS_RESULT_FIELDS,
  COLLECTIONS_FACETS,
  JEWELRY_SYNONYMS,
  DEFAULT_CURATIONS,
  getAppSearchEngineConfig,
  convertFilterToAppSearch,
  convertSortToAppSearch,
};
