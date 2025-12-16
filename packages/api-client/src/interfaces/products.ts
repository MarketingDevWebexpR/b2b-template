/**
 * Product Service Interface
 * Defines the contract for product-related operations.
 */

import type { Product, Category, ProductFilters } from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";

/**
 * Options for listing products
 */
export interface ListProductsOptions {
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Category ID to filter by */
  categoryId?: string;
  /** Collection to filter by */
  collection?: string;
  /** Search query */
  search?: string;
  /** Minimum price filter */
  minPrice?: number;
  /** Maximum price filter */
  maxPrice?: number;
  /** Materials to filter by */
  materials?: string[];
  /** Sort field */
  sortBy?: "price" | "name" | "createdAt" | "popularity";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Only include available products */
  availableOnly?: boolean;
  /** Include featured products first */
  featuredFirst?: boolean;
  /** Additional filters specific to the provider */
  filters?: ProductFilters;
}

/**
 * Options for getting a single product
 */
export interface GetProductOptions {
  /** Include related products */
  includeRelated?: boolean;
  /** Number of related products to include */
  relatedLimit?: number;
  /** Include category details */
  includeCategory?: boolean;
}

/**
 * Product with related items
 */
export interface ProductWithRelated extends Product {
  /** Related products */
  relatedProducts?: Product[];
}

/**
 * Product search result
 */
export interface ProductSearchResult {
  /** Matching products */
  products: Product[];
  /** Total matches */
  total: number;
  /** Search suggestions */
  suggestions?: string[];
  /** Facets for filtering */
  facets?: ProductFacets;
}

/**
 * Facets for product filtering
 */
export interface ProductFacets {
  /** Available categories with counts */
  categories?: Array<{ id: string; name: string; count: number }>;
  /** Available collections with counts */
  collections?: Array<{ value: string; count: number }>;
  /** Available materials with counts */
  materials?: Array<{ value: string; count: number }>;
  /** Price range */
  priceRange?: { min: number; max: number };
}

/**
 * Product inventory info
 */
export interface ProductInventory {
  productId: string;
  sku: string;
  available: number;
  reserved: number;
  incoming?: number;
  incomingDate?: string;
}

/**
 * Interface for product-related operations.
 * All adapters must implement this interface.
 */
export interface IProductService {
  /**
   * List products with optional filtering and pagination.
   *
   * @param options - Listing options
   * @returns Paginated list of products
   *
   * @example
   * ```typescript
   * const products = await api.products.list({
   *   categoryId: "cat_123",
   *   page: 1,
   *   pageSize: 20,
   *   sortBy: "price",
   *   sortOrder: "asc"
   * });
   * ```
   */
  list(options?: ListProductsOptions): Promise<PaginatedResponse<Product>>;

  /**
   * Get a single product by ID.
   *
   * @param id - Product ID
   * @param options - Additional options
   * @returns Product details
   *
   * @example
   * ```typescript
   * const product = await api.products.get("prod_123", {
   *   includeRelated: true,
   *   relatedLimit: 4
   * });
   * ```
   */
  get(id: string, options?: GetProductOptions): Promise<ProductWithRelated>;

  /**
   * Get a product by slug.
   *
   * @param slug - Product slug
   * @param options - Additional options
   * @returns Product details
   */
  getBySlug(slug: string, options?: GetProductOptions): Promise<ProductWithRelated>;

  /**
   * Get a product by SKU/reference.
   *
   * @param sku - Product SKU or reference
   * @param options - Additional options
   * @returns Product details
   */
  getBySku(sku: string, options?: GetProductOptions): Promise<ProductWithRelated>;

  /**
   * Search products by query.
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Search results with facets
   *
   * @example
   * ```typescript
   * const results = await api.products.search("gold ring", {
   *   pageSize: 20,
   *   filters: { minPrice: 100 }
   * });
   * ```
   */
  search(query: string, options?: ListProductsOptions): Promise<ProductSearchResult>;

  /**
   * Get multiple products by IDs.
   *
   * @param ids - Array of product IDs
   * @returns Array of products (in same order as IDs)
   */
  getMany(ids: string[]): Promise<Product[]>;

  /**
   * Get featured products.
   *
   * @param limit - Maximum number to return
   * @returns Array of featured products
   */
  getFeatured(limit?: number): Promise<Product[]>;

  /**
   * Get new products.
   *
   * @param limit - Maximum number to return
   * @param daysBack - Consider products new within this many days
   * @returns Array of new products
   */
  getNew(limit?: number, daysBack?: number): Promise<Product[]>;

  /**
   * Get products by category.
   *
   * @param categoryId - Category ID
   * @param options - Listing options
   * @returns Paginated list of products
   */
  getByCategory(
    categoryId: string,
    options?: Omit<ListProductsOptions, "categoryId">
  ): Promise<PaginatedResponse<Product>>;

  /**
   * Get inventory information for a product.
   *
   * @param productId - Product ID
   * @returns Inventory information
   */
  getInventory(productId: string): Promise<ProductInventory>;

  /**
   * Get inventory for multiple products.
   *
   * @param productIds - Array of product IDs
   * @returns Map of product ID to inventory
   */
  getInventoryBulk(productIds: string[]): Promise<Map<string, ProductInventory>>;
}
