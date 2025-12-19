/**
 * App Search v3 Configuration and Types
 *
 * Shared configuration and type definitions for Elastic App Search v3.
 * Used by all search API routes for consistency.
 *
 * Engine: dev-medusa-v3
 * Doc Types (plural form): products, categories, marques
 *
 * Note: category_lvl0-4 fields exist ONLY on products, not on categories
 *
 * @packageDocumentation
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * App Search v3 configuration from environment variables
 */
export const APP_SEARCH_CONFIG = {
  endpoint:
    process.env.APP_SEARCH_ENDPOINT ||
    'https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io',
  engine: process.env.APP_SEARCH_ENGINE || 'dev-medusa-v3',
  publicKey:
    process.env.APP_SEARCH_PUBLIC_KEY || 'search-smojpz6bs5oufe3g9krdupke',
} as const;

/**
 * Get the App Search API URL for the engine
 */
export function getAppSearchUrl(): string {
  return `${APP_SEARCH_CONFIG.endpoint}/api/as/v1/engines/${APP_SEARCH_CONFIG.engine}/search`;
}

// ============================================================================
// Document Types
// ============================================================================

/**
 * Document types indexed in the v3 engine (plural form)
 */
export type DocType = 'products' | 'categories' | 'marques';

/**
 * Search type parameter values
 */
export type SearchType = 'all' | 'products' | 'categories' | 'marques';

// ============================================================================
// Base App Search Types
// ============================================================================

/**
 * App Search raw field wrapper
 */
export interface RawField<T> {
  raw: T;
}

/**
 * App Search snippet field wrapper
 */
export interface SnippetField {
  raw?: string;
  snippet?: string;
}

/**
 * App Search result metadata
 */
export interface ResultMeta {
  score: number;
}

/**
 * App Search pagination metadata
 */
export interface PageMeta {
  current: number;
  total_pages: number;
  total_results: number;
  size: number;
}

/**
 * App Search response metadata
 */
export interface ResponseMeta {
  request_id: string;
  page: PageMeta;
}

/**
 * App Search facet data item
 */
export interface FacetDataItem {
  value: string;
  count: number;
}

/**
 * App Search facet entry
 */
export interface FacetEntry {
  type: string;
  data: FacetDataItem[];
}

/**
 * App Search facets response
 */
export type FacetsResponse = Record<string, FacetEntry[]>;

// ============================================================================
// Hit Types - Product
// ============================================================================

/**
 * App Search product hit from v3 engine
 * Products schema: title (NOT name!), handle, description, thumbnail, images, price_min, price_max,
 * brand_name, brand_slug, brand_id, category_lvl0-4, all_category_handles, category_names, category_ids, category_paths,
 * has_stock, is_available, sku, barcode, tags, material, metadata, created_at, updated_at, doc_type, id
 */
export interface ProductHit {
  id: RawField<string>;
  title?: RawField<string>; // v3 uses 'title' NOT 'name'
  handle?: RawField<string>;
  description?: SnippetField;
  thumbnail?: RawField<string>;
  images?: RawField<string[]>;
  doc_type?: RawField<string>;
  // Brand fields (v3)
  brand_id?: RawField<string>;
  brand_name?: RawField<string>;
  brand_slug?: RawField<string>;
  // Hierarchical categories (v3)
  category_lvl0?: RawField<string>;
  category_lvl1?: RawField<string>;
  category_lvl2?: RawField<string>;
  category_lvl3?: RawField<string>;
  category_lvl4?: RawField<string>;
  all_category_handles?: RawField<string[]>;
  category_names?: RawField<string[]>;
  category_ids?: RawField<string[]>;
  category_paths?: RawField<string[]>;
  // Pricing
  price_min?: RawField<number>;
  price_max?: RawField<number>;
  // Availability (boolean strings in v3)
  has_stock?: RawField<string>;
  is_available?: RawField<string>;
  // Additional product fields
  sku?: RawField<string>;
  barcode?: RawField<string>;
  tags?: RawField<string[]>;
  material?: RawField<string>;
  metadata?: RawField<Record<string, unknown>>;
  created_at?: RawField<string>;
  updated_at?: RawField<string>;
  _meta?: ResultMeta;
}

// ============================================================================
// Hit Types - Category
// ============================================================================

/**
 * App Search category hit from v3 engine
 * Categories schema: name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, is_active, doc_type, id
 *
 * Note: category_lvl0-4 fields do NOT exist on categories - they only exist on products.
 */
export interface CategoryHit {
  id: RawField<string>;
  name?: RawField<string>;
  handle?: RawField<string>;
  description?: SnippetField;
  doc_type?: RawField<string>;
  // Category hierarchy
  path?: RawField<string>;
  ancestor_names?: RawField<string[]>;
  ancestor_handles?: RawField<string[]>;
  // Category-specific fields
  parent_category_id?: RawField<string>;
  depth?: RawField<number>;
  rank?: RawField<number>;
  product_count?: RawField<number>;
  is_active?: RawField<string>;
  _meta?: ResultMeta;
}

// ============================================================================
// Hit Types - Marque/Brand
// ============================================================================

/**
 * App Search marque/brand hit from v3 engine
 * Marques schema: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
 */
export interface MarqueHit {
  id: RawField<string>;
  name?: RawField<string>;
  slug?: RawField<string>;
  description?: SnippetField;
  doc_type?: RawField<string>;
  // Marque-specific fields
  logo_url?: RawField<string>;
  country?: RawField<string>;
  website_url?: RawField<string>;
  is_active?: RawField<string>;
  rank?: RawField<number>;
  _meta?: ResultMeta;
}

// ============================================================================
// Union Hit Type
// ============================================================================

/**
 * Union type for any App Search hit
 */
export type AppSearchHit = ProductHit | CategoryHit | MarqueHit;

// ============================================================================
// Response Types
// ============================================================================

/**
 * App Search response with typed results
 */
export interface AppSearchResponse<T extends AppSearchHit = AppSearchHit> {
  meta: ResponseMeta;
  results: T[];
  facets?: FacetsResponse;
}

// ============================================================================
// Query Builder Types
// ============================================================================

/**
 * Result field configuration
 */
export interface ResultFieldConfig {
  raw?: Record<string, never>;
  snippet?: {
    size?: number;
    fallback?: boolean;
  };
}

/**
 * Search field configuration with weight
 */
export interface SearchFieldConfig {
  weight?: number;
}

/**
 * Filter configuration
 */
export type FilterValue = string | number | boolean | string[] | RangeFilter;

/**
 * Range filter
 */
export interface RangeFilter {
  from?: number;
  to?: number;
}

/**
 * Filters object
 */
export interface FiltersConfig {
  all?: Record<string, FilterValue>[];
  any?: Record<string, FilterValue>[];
  none?: Record<string, FilterValue>[];
}

/**
 * Sort configuration
 */
export interface SortConfig {
  [field: string]: 'asc' | 'desc';
}

/**
 * Facet configuration
 */
export interface FacetConfig {
  type: 'value' | 'range';
  size?: number;
  ranges?: Array<{ from?: number; to?: number; name?: string }>;
}

/**
 * Complete App Search query
 */
export interface AppSearchQuery {
  query: string;
  page?: {
    size?: number;
    current?: number;
  };
  result_fields?: Record<string, ResultFieldConfig>;
  search_fields?: Record<string, SearchFieldConfig>;
  filters?: FiltersConfig;
  facets?: Record<string, FacetConfig[]>;
  sort?: SortConfig[];
}

// ============================================================================
// Transformed Result Types (Frontend Format)
// ============================================================================

/**
 * Transformed product result for frontend
 * Based on App Search v3 products schema: title (NOT name!), handle, description, thumbnail, images, price_min, price_max,
 * brand_name, brand_slug, brand_id, category_lvl0-4, all_category_handles, category_names, category_ids, category_paths,
 * has_stock, is_available, sku, barcode, tags, material, metadata, created_at, updated_at, doc_type, id
 */
export interface TransformedProduct {
  id: string;
  title: string; // mapped from title (v3 uses 'title' not 'name')
  handle: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  thumbnail: string | null;
  images: string[];
  // Brand info (v3)
  brand_id: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  brand: string | null; // mapped from brand_name
  material: string | null;
  // Hierarchical categories (v3)
  category_lvl0: string | null;
  category_lvl1: string | null;
  category_lvl2: string | null;
  category_lvl3: string | null;
  category_lvl4: string | null;
  all_category_handles: string[];
  category_paths: string[];
  // Legacy categories format for backward compatibility
  categories: Array<{ id: string; name: string; handle: string }>;
  tags: string[];
  collection_id: string | null; // Not in v3 schema, set to null
  collection: string | null; // Not in v3 schema, set to null
  price_min: number | null;
  price_max: number | null;
  // Boolean values (converted from strings)
  is_available: boolean;
  has_stock: boolean;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  _score: number;
}

/**
 * Transformed category result for frontend
 * Based on App Search v3 categories schema: name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, doc_type, id
 */
export interface TransformedCategory {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  parent_category_id: string | null;
  is_active: boolean; // Not in v3 schema, default to true
  rank: number;
  depth: number;
  product_count: number;
  path: string;
  category_paths: string[]; // Not in v3 schema, empty array
  created_at: string; // Not in v3 schema, empty string
  metadata: Record<string, unknown>; // Not in v3 schema, empty object
  _score: number;
}

/**
 * Transformed marque/brand result for frontend
 * Based on App Search v3 marques schema: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
 */
export interface TransformedMarque {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  country: string | null;
  product_count: number; // Not in v3 schema, default to 0
  created_at: string; // Not in v3 schema, empty string
  metadata: Record<string, unknown>; // Not in v3 schema, empty object
  _score: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse boolean string from v3 schema
 * Converts "true"/"false" strings to actual booleans
 */
export function parseBooleanString(
  value: string | boolean | undefined | null
): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

/**
 * Extract raw value from App Search field
 */
export function extractRaw<T>(field: RawField<T> | undefined): T | undefined {
  return field?.raw;
}

/**
 * Extract raw value with default
 */
export function extractRawOrDefault<T>(
  field: RawField<T> | undefined,
  defaultValue: T
): T {
  return field?.raw ?? defaultValue;
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform App Search product hit to frontend format
 * Uses fields from v3 schema: title, handle, description, thumbnail, images, price_min, price_max, brand_name, brand_slug, brand_id, category_lvl0-4, all_category_handles, has_stock, is_available, sku, barcode, tags
 */
export function transformProductHit(hit: ProductHit): TransformedProduct {
  // Build categories from category_lvl fields
  const categories: Array<{ id: string; name: string; handle: string }> = [];
  const categoryLevels = [
    hit.category_lvl0?.raw,
    hit.category_lvl1?.raw,
    hit.category_lvl2?.raw,
    hit.category_lvl3?.raw,
    hit.category_lvl4?.raw,
  ].filter((lvl): lvl is string => Boolean(lvl));

  if (categoryLevels.length > 0) {
    // Use the deepest level to get the category name
    const deepestPath = categoryLevels[categoryLevels.length - 1];
    if (deepestPath && typeof deepestPath === 'string') {
      const categoryName = deepestPath.includes(' > ')
        ? deepestPath.split(' > ').pop() || ''
        : deepestPath;
      categories.push({
        id: `cat_${categoryLevels.length - 1}`,
        name: categoryName,
        handle: String(categoryName).toLowerCase().replace(/\s+/g, '-'),
      });
    }
  }

  return {
    id: hit.id?.raw || '',
    title: hit.title?.raw || '',
    handle: hit.handle?.raw || '',
    description: hit.description?.raw || null,
    sku: hit.sku?.raw || null,
    barcode: hit.barcode?.raw || null,
    thumbnail: hit.thumbnail?.raw || null,
    images: hit.images?.raw || [],
    // Brand info (v3)
    brand_id: hit.brand_id?.raw || null,
    brand_name: hit.brand_name?.raw || null,
    brand_slug: hit.brand_slug?.raw || null,
    brand: hit.brand_name?.raw || null,
    material: hit.material?.raw || null,
    // Hierarchical categories (v3)
    category_lvl0: hit.category_lvl0?.raw || null,
    category_lvl1: hit.category_lvl1?.raw || null,
    category_lvl2: hit.category_lvl2?.raw || null,
    category_lvl3: hit.category_lvl3?.raw || null,
    category_lvl4: hit.category_lvl4?.raw || null,
    all_category_handles: hit.all_category_handles?.raw || [],
    category_paths: hit.category_paths?.raw || [],
    // Legacy categories format for backward compatibility
    categories,
    tags: hit.tags?.raw || [],
    collection_id: null, // Not in v3 schema
    collection: null, // Not in v3 schema
    price_min: hit.price_min?.raw ?? null,
    price_max: hit.price_max?.raw ?? null,
    // Boolean strings to actual booleans
    is_available: parseBooleanString(hit.is_available?.raw),
    has_stock: parseBooleanString(hit.has_stock?.raw),
    created_at: hit.created_at?.raw || '',
    updated_at: hit.updated_at?.raw || '',
    metadata: hit.metadata?.raw || {},
    _score: hit._meta?.score || 0,
  };
}

/**
 * Transform App Search category hit to frontend format
 * Only uses fields from v3 schema: name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, is_active
 */
export function transformCategoryHit(hit: CategoryHit): TransformedCategory {
  return {
    id: hit.id?.raw || '',
    name: hit.name?.raw || '',
    handle: hit.handle?.raw || '',
    description: hit.description?.raw || null,
    parent_category_id: hit.parent_category_id?.raw || null,
    is_active: hit.is_active?.raw === 'true',
    rank: hit.rank?.raw ?? 0,
    depth: hit.depth?.raw ?? 0,
    product_count: hit.product_count?.raw ?? 0,
    path: hit.path?.raw || '',
    category_paths: [], // Not in v3 schema
    created_at: '', // Not in v3 schema
    metadata: {}, // Not in v3 schema
    _score: hit._meta?.score || 0,
  };
}

/**
 * Transform App Search marque hit to frontend format
 * Only uses fields from v3 schema: name, slug, description, country, logo_url, website_url, is_active, rank
 */
export function transformMarqueHit(hit: MarqueHit): TransformedMarque {
  return {
    id: hit.id?.raw || '',
    name: hit.name?.raw || '',
    slug: hit.slug?.raw || '',
    description: hit.description?.raw || null,
    logo_url: hit.logo_url?.raw || null,
    country: hit.country?.raw || null,
    product_count: 0, // Not in v3 schema
    created_at: '', // Not in v3 schema
    metadata: {}, // Not in v3 schema
    _score: hit._meta?.score || 0,
  };
}

// ============================================================================
// Facet Transformation
// ============================================================================

/**
 * Transform facets response to frontend format
 */
export function transformFacets(
  facets: FacetsResponse | undefined,
  type: SearchType
): Record<string, Record<string, number>> {
  if (!facets) return {};

  const result: Record<string, Record<string, number>> = {};

  for (const [fieldName, facetData] of Object.entries(facets)) {
    if (facetData?.[0]?.data) {
      result[fieldName] = {};
      for (const item of facetData[0].data) {
        result[fieldName][item.value] = item.count;
      }
    }
  }

  // For products, build a combined categories facet from hierarchical levels
  if (type === 'products' || type === 'all') {
    const categoriesFacet: Record<string, number> = {};
    for (let lvl = 0; lvl <= 4; lvl++) {
      const lvlKey = `category_lvl${lvl}`;
      if (result[lvlKey]) {
        for (const [value, count] of Object.entries(result[lvlKey])) {
          if (!value || typeof value !== 'string') continue;
          // Use the deepest category name (after last ' > ')
          const categoryName = value.includes(' > ')
            ? value.split(' > ').pop() || value
            : value;
          categoriesFacet[categoryName] =
            (categoriesFacet[categoryName] || 0) + (count as number);
        }
      }
    }
    if (Object.keys(categoriesFacet).length > 0) {
      result['categories.name'] = categoriesFacet;
    }
  }

  return result;
}

// ============================================================================
// Query Builder Helpers
// ============================================================================

/**
 * Standard result fields for products
 * App Search v3 products schema: title (NOT name!), handle, description, thumbnail, images, price_min, price_max,
 * brand_name, brand_slug, brand_id, category_lvl0-4, all_category_handles, category_names, category_ids, category_paths,
 * has_stock, is_available, sku, barcode, tags, material, metadata, created_at, updated_at, doc_type, id
 */
export const PRODUCT_RESULT_FIELDS: Record<string, ResultFieldConfig> = {
  id: { raw: {} },
  title: { raw: {} }, // v3 uses 'title' NOT 'name'
  handle: { raw: {} },
  description: { raw: {}, snippet: { size: 200, fallback: true } },
  thumbnail: { raw: {} },
  images: { raw: {} },
  doc_type: { raw: {} },
  // Brand fields
  brand_id: { raw: {} },
  brand_name: { raw: {} },
  brand_slug: { raw: {} },
  // Hierarchical categories
  category_lvl0: { raw: {} },
  category_lvl1: { raw: {} },
  category_lvl2: { raw: {} },
  category_lvl3: { raw: {} },
  category_lvl4: { raw: {} },
  all_category_handles: { raw: {} },
  category_names: { raw: {} },
  category_ids: { raw: {} },
  category_paths: { raw: {} },
  // Pricing
  price_min: { raw: {} },
  price_max: { raw: {} },
  // Availability
  has_stock: { raw: {} },
  is_available: { raw: {} },
  // Additional product fields
  sku: { raw: {} },
  barcode: { raw: {} },
  tags: { raw: {} },
  material: { raw: {} },
  metadata: { raw: {} },
  created_at: { raw: {} },
  updated_at: { raw: {} },
};

/**
 * Standard search fields with weights for products
 * Only use fields that exist in App Search v3 products schema
 */
export const PRODUCT_SEARCH_FIELDS: Record<string, SearchFieldConfig> = {
  title: { weight: 10 },
  description: { weight: 3 },
  brand_name: { weight: 5 },
  sku: { weight: 8 },
  barcode: { weight: 8 },
  tags: { weight: 4 },
  category_lvl0: { weight: 4 },
  category_lvl1: { weight: 3 },
  category_lvl2: { weight: 2 },
};

/**
 * Standard facets configuration for products
 * Only use fields that exist in App Search v3 products schema
 */
export const PRODUCT_FACETS: Record<string, FacetConfig[]> = {
  category_lvl0: [{ type: 'value', size: 20 }],
  category_lvl1: [{ type: 'value', size: 20 }],
  category_lvl2: [{ type: 'value', size: 20 }],
  category_lvl3: [{ type: 'value', size: 10 }],
  brand_name: [{ type: 'value', size: 20 }],
  brand_slug: [{ type: 'value', size: 20 }],
  has_stock: [{ type: 'value', size: 2 }],
  is_available: [{ type: 'value', size: 2 }],
  doc_type: [{ type: 'value', size: 5 }],
};

export default APP_SEARCH_CONFIG;
