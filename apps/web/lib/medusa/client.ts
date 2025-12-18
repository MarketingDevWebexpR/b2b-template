/**
 * Medusa Storefront API Client
 *
 * Client for interacting with Medusa V2 Store API.
 * Handles products, categories, carts, and customer operations.
 *
 * @packageDocumentation
 */

// ============================================
// Types
// ============================================

export interface MedusaClientConfig {
  /** Medusa backend URL */
  baseUrl: string;
  /** Publishable API key for store API calls */
  publishableKey?: string;
  /** Request timeout in ms */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  subtitle: string | null;
  description: string | null;
  is_giftcard: boolean;
  status: 'draft' | 'proposed' | 'published' | 'rejected';
  thumbnail: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  origin_country: string | null;
  hs_code: string | null;
  mid_code: string | null;
  material: string | null;
  collection_id: string | null;
  collection?: MedusaCollection | null;
  type_id: string | null;
  type?: { id: string; value: string } | null;
  discountable: boolean;
  external_id: string | null;
  images: Array<{
    id: string;
    url: string;
    rank: number;
  }>;
  options: Array<{
    id: string;
    title: string;
    values: Array<{ id: string; value: string }>;
  }>;
  variants: MedusaVariant[];
  categories?: MedusaCategory[];
  tags?: Array<{ id: string; value: string }>;
  metadata: Record<string, unknown> | null;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedusaVariant {
  id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  ean: string | null;
  upc: string | null;
  inventory_quantity: number;
  allow_backorder: boolean;
  manage_inventory: boolean;
  hs_code: string | null;
  origin_country: string | null;
  mid_code: string | null;
  material: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  prices: MedusaPrice[];
  options?: Array<{ id: string; value: string }>;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MedusaPrice {
  id: string;
  currency_code: string;
  amount: number;
  min_quantity?: number | null;
  max_quantity?: number | null;
}

export interface MedusaCategory {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  is_active: boolean;
  is_internal: boolean;
  rank: number;
  parent_category_id: string | null;
  parent_category?: MedusaCategory | null;
  category_children?: MedusaCategory[];
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MedusaCollection {
  id: string;
  title: string;
  handle: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  products: MedusaProduct[];
  count: number;
  offset: number;
  limit: number;
}

export interface ProductResponse {
  product: MedusaProduct;
}

export interface CategoriesResponse {
  product_categories: MedusaCategory[];
  count: number;
  offset: number;
  limit: number;
}

export interface CategoryResponse {
  product_category: MedusaCategory;
}

// ============================================
// Medusa Client
// ============================================

/**
 * Medusa Storefront API Client
 *
 * @example
 * ```typescript
 * const client = getMedusaClient();
 *
 * // Get product by handle
 * const product = await client.getProductByHandle('gold-ring');
 *
 * // List products by category
 * const products = await client.listProducts({ category_id: 'cat_123' });
 * ```
 */
export class MedusaClient {
  private baseUrl: string;
  private publishableKey: string;
  private timeout: number;
  private debug: boolean;

  constructor(config: MedusaClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.publishableKey = config.publishableKey ?? '';
    this.timeout = config.timeout ?? 10000;
    this.debug = config.debug ?? false;
  }

  // ==========================================
  // Products
  // ==========================================

  /**
   * Get a single product by handle
   */
  async getProductByHandle(handle: string): Promise<MedusaProduct | null> {
    try {
      const response = await this.listProducts({
        handle,
        limit: 1,
      });

      if (response.products.length === 0) {
        return null;
      }

      return response.products[0];
    } catch (error) {
      if (this.debug) {
        console.error(`[MedusaClient] getProductByHandle error:`, error);
      }
      return null;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<MedusaProduct | null> {
    try {
      const url = `${this.baseUrl}/store/products/${id}?fields=*variants.prices,*images,*categories,*collection,*tags`;
      const response = await this.request<ProductResponse>(url);
      return response.product;
    } catch (error) {
      if (this.debug) {
        console.error(`[MedusaClient] getProductById error:`, error);
      }
      return null;
    }
  }

  /**
   * List products with optional filters
   */
  async listProducts(options: {
    handle?: string;
    category_id?: string[];
    collection_id?: string[];
    tags?: string[];
    q?: string;
    limit?: number;
    offset?: number;
    order?: string;
  } = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    // Add fields to expand
    params.set('fields', '*variants.prices,*images,*categories,*collection,*tags');

    if (options.handle) params.set('handle', options.handle);
    if (options.category_id) {
      options.category_id.forEach((id) => params.append('category_id[]', id));
    }
    if (options.collection_id) {
      options.collection_id.forEach((id) => params.append('collection_id[]', id));
    }
    if (options.tags) {
      options.tags.forEach((tag) => params.append('tags[]', tag));
    }
    if (options.q) params.set('q', options.q);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.order) params.set('order', options.order);

    const url = `${this.baseUrl}/store/products?${params.toString()}`;
    return this.request<ProductsResponse>(url);
  }

  /**
   * Get related products (same category, excluding current)
   */
  async getRelatedProducts(
    product: MedusaProduct,
    limit: number = 4
  ): Promise<MedusaProduct[]> {
    if (!product.categories || product.categories.length === 0) {
      return [];
    }

    const categoryId = product.categories[0].id;

    const response = await this.listProducts({
      category_id: [categoryId],
      limit: limit + 1, // Fetch one extra in case the current product is included
    });

    return response.products
      .filter((p) => p.id !== product.id)
      .slice(0, limit);
  }

  /**
   * Get similar products based on multiple criteria (B2B enhanced)
   * - Same category
   * - Similar price range
   * - Same brand or collection
   * - Similar characteristics (metal, stone type)
   */
  async getSimilarProducts(
    product: MedusaProduct,
    limit: number = 8
  ): Promise<MedusaProduct[]> {
    const allRelated: MedusaProduct[] = [];

    // 1. Same category products (primary)
    if (product.categories && product.categories.length > 0) {
      const categoryResponse = await this.listProducts({
        category_id: [product.categories[0].id],
        limit: limit * 2,
      });
      allRelated.push(
        ...categoryResponse.products.filter((p) => p.id !== product.id)
      );
    }

    // 2. Same collection products
    if (product.collection_id && allRelated.length < limit) {
      const collectionResponse = await this.listProducts({
        collection_id: [product.collection_id],
        limit: limit,
      });
      const newProducts = collectionResponse.products.filter(
        (p) => p.id !== product.id && !allRelated.some((r) => r.id === p.id)
      );
      allRelated.push(...newProducts);
    }

    // 3. Same tags
    if (product.tags && product.tags.length > 0 && allRelated.length < limit) {
      const tagValues = product.tags.map((t) => t.value);
      const tagResponse = await this.listProducts({
        tags: tagValues,
        limit: limit,
      });
      const newProducts = tagResponse.products.filter(
        (p) => p.id !== product.id && !allRelated.some((r) => r.id === p.id)
      );
      allRelated.push(...newProducts);
    }

    // Sort by relevance (same category first, then collection, then tags)
    // and take the first `limit` products
    return allRelated.slice(0, limit);
  }

  /**
   * Get complementary products (accessories, matching items)
   * Based on complementary category relationships
   */
  async getComplementaryProducts(
    product: MedusaProduct,
    limit: number = 4
  ): Promise<MedusaProduct[]> {
    // Define complementary category mappings
    const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
      // Rings go with bracelets, necklaces
      'bagues': ['bracelets', 'colliers', 'pendentifs'],
      'rings': ['bracelets', 'necklaces', 'pendants'],
      // Necklaces go with earrings, bracelets
      'colliers': ['boucles-doreilles', 'bracelets'],
      'necklaces': ['earrings', 'bracelets'],
      // Earrings go with necklaces, bracelets
      'boucles-doreilles': ['colliers', 'bracelets'],
      'earrings': ['necklaces', 'bracelets'],
      // Bracelets go with watches, rings
      'bracelets': ['montres', 'bagues'],
      // Watches go with bracelets
      'montres': ['bracelets'],
      'watches': ['bracelets'],
    };

    if (!product.categories || product.categories.length === 0) {
      return [];
    }

    const categoryHandle = product.categories[0].handle.toLowerCase();
    const complementaryHandles = COMPLEMENTARY_CATEGORIES[categoryHandle] || [];

    if (complementaryHandles.length === 0) {
      return [];
    }

    // Fetch products from complementary categories
    const complementaryProducts: MedusaProduct[] = [];

    for (const handle of complementaryHandles) {
      if (complementaryProducts.length >= limit) break;

      const category = await this.getCategoryByHandle(handle);
      if (category) {
        const response = await this.listProducts({
          category_id: [category.id],
          limit: Math.ceil(limit / complementaryHandles.length),
        });
        complementaryProducts.push(...response.products);
      }
    }

    return complementaryProducts
      .filter((p) => p.id !== product.id)
      .slice(0, limit);
  }

  /**
   * Get all related products with sections (B2B enhanced)
   */
  async getAllRelatedProducts(
    product: MedusaProduct,
    options: {
      similarLimit?: number;
      complementaryLimit?: number;
    } = {}
  ): Promise<{
    similar: MedusaProduct[];
    complementary: MedusaProduct[];
  }> {
    const { similarLimit = 8, complementaryLimit = 4 } = options;

    const [similar, complementary] = await Promise.all([
      this.getSimilarProducts(product, similarLimit),
      this.getComplementaryProducts(product, complementaryLimit),
    ]);

    return { similar, complementary };
  }

  // ==========================================
  // Categories
  // ==========================================

  /**
   * Get a single category by handle
   */
  async getCategoryByHandle(handle: string): Promise<MedusaCategory | null> {
    try {
      const response = await this.listCategories({ handle });
      if (response.product_categories.length === 0) {
        return null;
      }
      return response.product_categories[0];
    } catch (error) {
      if (this.debug) {
        console.error(`[MedusaClient] getCategoryByHandle error:`, error);
      }
      return null;
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<MedusaCategory | null> {
    try {
      const url = `${this.baseUrl}/store/product-categories/${id}?include_descendants_tree=true`;
      const response = await this.request<CategoryResponse>(url);
      return response.product_category;
    } catch (error) {
      if (this.debug) {
        console.error(`[MedusaClient] getCategoryById error:`, error);
      }
      return null;
    }
  }

  /**
   * List categories with optional filters
   */
  async listCategories(options: {
    handle?: string;
    parent_category_id?: string;
    include_descendants_tree?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<CategoriesResponse> {
    const params = new URLSearchParams();

    if (options.handle) params.set('handle', options.handle);
    if (options.parent_category_id) params.set('parent_category_id', options.parent_category_id);
    if (options.include_descendants_tree) params.set('include_descendants_tree', 'true');
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));

    const url = `${this.baseUrl}/store/product-categories?${params.toString()}`;
    return this.request<CategoriesResponse>(url);
  }

  /**
   * Get root categories with their children tree
   */
  async getRootCategories(): Promise<MedusaCategory[]> {
    const response = await this.listCategories({
      parent_category_id: 'null',
      include_descendants_tree: true,
    });
    return response.product_categories;
  }

  /**
   * Get a category with its full ancestor chain populated
   * Recursively fetches parent categories to build the complete hierarchy
   */
  async getCategoryWithAncestors(categoryId: string): Promise<MedusaCategory | null> {
    try {
      // Fetch the category
      const category = await this.getCategoryById(categoryId);
      if (!category) return null;

      // If no parent, return as-is
      if (!category.parent_category_id) {
        return category;
      }

      // Recursively fetch and attach parent
      const parentWithAncestors = await this.getCategoryWithAncestors(category.parent_category_id);
      if (parentWithAncestors) {
        category.parent_category = parentWithAncestors;
      }

      return category;
    } catch (error) {
      if (this.debug) {
        console.error(`[MedusaClient] getCategoryWithAncestors error:`, error);
      }
      return null;
    }
  }

  // ==========================================
  // HTTP Request
  // ==========================================

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      if (this.debug) {
        console.log(`[MedusaClient] ${options.method || 'GET'} ${url}`);
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.publishableKey && { 'x-publishable-api-key': this.publishableKey }),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Medusa API error: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }

      const data = await response.json();

      if (this.debug) {
        console.log(`[MedusaClient] Response:`, data);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Medusa request timed out after ${this.timeout}ms`);
      }

      throw error;
    }
  }
}

// ============================================
// Factory & Singleton
// ============================================

/**
 * Create a configured Medusa client
 */
export function createMedusaClient(config?: Partial<MedusaClientConfig>): MedusaClient {
  const baseUrl =
    config?.baseUrl ??
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
    'http://localhost:9000';

  const publishableKey =
    config?.publishableKey ??
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ??
    '';

  return new MedusaClient({
    baseUrl,
    publishableKey,
    timeout: config?.timeout ?? 10000,
    debug: config?.debug ?? process.env.NODE_ENV === 'development',
  });
}

let clientInstance: MedusaClient | null = null;

/**
 * Get the singleton Medusa client instance
 */
export function getMedusaClient(): MedusaClient {
  if (!clientInstance) {
    clientInstance = createMedusaClient();
  }
  return clientInstance;
}

export default MedusaClient;
