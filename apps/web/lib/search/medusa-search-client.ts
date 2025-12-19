/**
 * Medusa Search API Client
 *
 * Client for the Medusa backend search API.
 * Proxies search requests through the backend instead of direct search engine access.
 * This provides better security (no API key exposure) and allows server-side processing.
 *
 * @packageDocumentation
 */

// ============================================
// Types
// ============================================

export interface MedusaSearchConfig {
  /** Medusa backend URL */
  baseUrl: string;
  /** Request timeout in ms */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

export interface ProductSearchResult {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  thumbnail: string | null;
  images: string[];
  collection_id: string | null;
  collection: string | null;
  /** Brand ID from product-marque link */
  brand_id: string | null;
  /** Brand name from product-marque link */
  brand_name: string | null;
  /** Brand slug from product-marque link */
  brand_slug: string | null;
  /** Legacy brand field (fallback from metadata) */
  brand: string | null;
  material: string | null;
  categories: Array<{ id: string; name: string; handle: string }>;
  tags: string[];
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    prices: Array<{ amount: number; currency_code: string }>;
    inventory_quantity: number;
  }>;
  price_min: number | null;
  price_max: number | null;
  is_available: boolean;
  has_stock: boolean;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface CategorySearchResult {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  parent_category_id: string | null;
  is_active: boolean;
  rank: number;
  depth: number;
  product_count: number;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface SearchOptions {
  /** Search type */
  type?: 'all' | 'products' | 'categories';
  /** Max results */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Include facets */
  facets?: boolean;
  /** Category filter (handle or ID) */
  category?: string;
  /** Brand filter */
  brand?: string;
  /** Material filter */
  material?: string;
  /** Tags filter (comma-separated) */
  tags?: string;
  /** Stock filter */
  inStock?: boolean;
  /** Min price */
  priceMin?: number;
  /** Max price */
  priceMax?: number;
  /** Sort field */
  sort?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
}

/**
 * Hierarchical category facet from App Search v3
 * Format: "Parent > Child > Grandchild"
 */
export interface HierarchicalCategoryFacet {
  /** Full path string (e.g., "Plomberie > Robinetterie > Mitigeurs") */
  value: string;
  /** Product count */
  count: number;
}

/**
 * Hierarchical facets response from v3 API
 * Extends the base facet distribution format with typed category levels
 */
export type HierarchicalFacetsResponse = Record<string, Record<string, number>> & {
  category_lvl0?: Record<string, number>;
  category_lvl1?: Record<string, number>;
  category_lvl2?: Record<string, number>;
  category_lvl3?: Record<string, number>;
  category_lvl4?: Record<string, number>;
  brand_name?: Record<string, number>;
  brand_slug?: Record<string, number>;
  has_stock?: Record<string, number>;
  is_available?: Record<string, number>;
  material?: Record<string, number>;
  tags?: Record<string, number>;
};

export interface ProductSearchResponse {
  query: string;
  type: 'products';
  hits: ProductSearchResult[];
  total: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
  /** v3 facet distribution with hierarchical categories */
  facetDistribution?: HierarchicalFacetsResponse;
  error?: string;
}

export interface CategorySearchResponse {
  query: string;
  type: 'categories';
  hits: CategorySearchResult[];
  total: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
  error?: string;
}

export interface MultiSearchResponse {
  query: string;
  type: 'all';
  products: {
    hits: ProductSearchResult[];
    total: number;
    processingTimeMs: number;
  };
  categories: {
    hits: CategorySearchResult[];
    total: number;
    processingTimeMs: number;
  };
}

/**
 * Product suggestion with v3 brand and category fields
 */
export interface ProductSuggestion {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price_min: number | null;
  // v3 additions
  brand_id?: string | null;
  brand_name?: string | null;
  brand_slug?: string | null;
  category_path?: string | null;
  category_handle?: string | null;
}

export interface SuggestionsResponse {
  query: string;
  suggestions: ProductSuggestion[];
  /** Category suggestions (from suggestions endpoint) */
  categories?: CategorySuggestion[];
  /** Brand suggestions (from suggestions endpoint) */
  marques?: MarqueSuggestion[];
}

export interface CategorySuggestion {
  id: string;
  name: string;
  handle: string;
  path: string[];
  pathString: string;
  /** Full URL path for navigation (e.g., "electricite/led-e14") */
  fullPath: string;
  productCount: number;
  depth: number;
}

export interface CategorySuggestionsResponse {
  query: string;
  categories: CategorySuggestion[];
}

export interface MarqueSuggestion {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  product_count: number;
}

export interface MarqueSuggestionsResponse {
  query: string;
  marques: MarqueSuggestion[];
}

export type SearchResponse = ProductSearchResponse | CategorySearchResponse | MultiSearchResponse;

// ============================================
// Medusa Search Client
// ============================================

/**
 * Medusa Search API Client
 *
 * Connects to the Medusa backend search endpoints.
 *
 * @example
 * ```typescript
 * const client = new MedusaSearchClient({
 *   baseUrl: 'http://localhost:9000',
 * });
 *
 * const results = await client.search('diamond ring', {
 *   type: 'products',
 *   limit: 20,
 *   facets: true,
 * });
 * ```
 */
export class MedusaSearchClient {
  private baseUrl: string;
  private timeout: number;
  private debug: boolean;

  constructor(config: MedusaSearchConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout ?? 10000;
    this.debug = config.debug ?? false;
  }

  /**
   * Search products and/or categories
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const params = new URLSearchParams();

    params.set('q', query);
    if (options.type) params.set('type', options.type);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.facets) params.set('facets', 'true');
    if (options.category) params.set('category', options.category);
    if (options.brand) params.set('brand', options.brand);
    if (options.material) params.set('material', options.material);
    if (options.tags) params.set('tags', options.tags);
    if (options.inStock) params.set('in_stock', 'true');
    if (options.priceMin !== undefined) params.set('price_min', String(options.priceMin));
    if (options.priceMax !== undefined) params.set('price_max', String(options.priceMax));
    if (options.sort) params.set('sort', options.sort);
    if (options.order) params.set('order', options.order);

    const url = `${this.baseUrl}/search?${params.toString()}`;
    return this.request<SearchResponse>(url);
  }

  /**
   * Search products only
   */
  async searchProducts(
    query: string,
    options: Omit<SearchOptions, 'type'> = {}
  ): Promise<ProductSearchResponse> {
    return this.search(query, { ...options, type: 'products' }) as Promise<ProductSearchResponse>;
  }

  /**
   * Search categories only
   */
  async searchCategories(
    query: string,
    options: Omit<SearchOptions, 'type'> = {}
  ): Promise<CategorySearchResponse> {
    return this.search(query, { ...options, type: 'categories' }) as Promise<CategorySearchResponse>;
  }

  /**
   * Get quick suggestions for autocomplete
   */
  async getSuggestions(query: string, limit: number = 8): Promise<SuggestionsResponse> {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('limit', String(limit));

    const url = `${this.baseUrl}/search/suggestions?${params.toString()}`;
    return this.request<SuggestionsResponse>(url);
  }

  /**
   * Get category suggestions for autocomplete
   */
  async getCategorySuggestions(query: string, limit: number = 5): Promise<CategorySuggestionsResponse> {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('limit', String(limit));

    const url = `${this.baseUrl}/search/categories?${params.toString()}`;
    return this.request<CategorySuggestionsResponse>(url);
  }

  /**
   * Get brand/marque suggestions for autocomplete
   */
  async getBrandSuggestions(query: string, limit: number = 5): Promise<MarqueSuggestionsResponse> {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('limit', String(limit));

    const url = `${this.baseUrl}/search/marques?${params.toString()}`;
    return this.request<MarqueSuggestionsResponse>(url);
  }

  /**
   * Check if search service is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.search('', { limit: 1 });
      return !('error' in response);
    } catch {
      return false;
    }
  }

  /**
   * Make HTTP request
   */
  private async request<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      if (this.debug) {
        console.log(`[MedusaSearch] GET ${url}`);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (this.debug) {
        console.log(`[MedusaSearch] Response:`, data);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Search request timed out after ${this.timeout}ms`);
      }

      throw error;
    }
  }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a configured Medusa search client
 *
 * Uses local API proxy routes by default to avoid CORS issues.
 * The proxy routes forward requests to the Medusa backend.
 *
 * @example
 * ```typescript
 * const client = createMedusaSearchClient();
 * const results = await client.search('ring');
 * ```
 */
export function createMedusaSearchClient(config?: Partial<MedusaSearchConfig>): MedusaSearchClient {
  // Use local API proxy to avoid CORS issues
  // The proxy routes at /api/search/* forward requests to Medusa backend
  const baseUrl = config?.baseUrl ?? '/api';

  return new MedusaSearchClient({
    baseUrl,
    timeout: config?.timeout ?? 10000,
    debug: config?.debug ?? process.env.NODE_ENV === 'development',
  });
}

// ============================================
// Singleton Instance
// ============================================

let clientInstance: MedusaSearchClient | null = null;

/**
 * Get the singleton Medusa search client instance
 */
export function getMedusaSearchClient(): MedusaSearchClient {
  if (!clientInstance) {
    clientInstance = createMedusaSearchClient();
  }
  return clientInstance;
}

export default MedusaSearchClient;
