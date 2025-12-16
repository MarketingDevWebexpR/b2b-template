/**
 * Medusa Product Service
 *
 * Implements IProductService for Medusa V2 backend.
 */

import type {
  IProductService,
  ListProductsOptions,
  GetProductOptions,
  ProductWithRelated,
  ProductSearchResult,
  ProductFacets,
  ProductInventory,
} from "@maison/api-client";
import type { Product } from "@maison/types";
import type { PaginatedResponse, BaseApiClient } from "@maison/api-core";
import { mapMedusaProduct, type MedusaProduct, type MedusaCategory } from "../mappers";

/**
 * Medusa API response wrapper
 */
interface MedusaResponse<T> {
  products?: T[];
  product?: T;
  categories?: MedusaCategory[];
  count?: number;
  offset?: number;
  limit?: number;
}

/**
 * Medusa Product Service implementation.
 *
 * @example
 * ```typescript
 * const productService = new MedusaProductService(httpClient, "reg_123");
 * const products = await productService.list({ pageSize: 20 });
 * ```
 */
export class MedusaProductService implements IProductService {
  constructor(
    private readonly client: BaseApiClient,
    private readonly regionId?: string,
    private readonly currencyCode = "EUR"
  ) {}

  /**
   * List products with filtering, sorting, and pagination.
   */
  async list(options: ListProductsOptions = {}): Promise<PaginatedResponse<Product>> {
    const {
      page = 1,
      pageSize = 20,
      categoryId,
      collection,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      minPrice,
      maxPrice,
    } = options;

    const offset = (page - 1) * pageSize;

    // Map sortBy to Medusa field names
    const sortFieldMap: Record<string, string> = {
      createdAt: "created_at",
      price: "price",
      name: "title",
      popularity: "created_at", // Medusa doesn't have popularity, fallback to created_at
    };
    const medusaSortBy = sortFieldMap[sortBy] ?? "created_at";

    // Build query parameters
    const params = new URLSearchParams();
    params.set("offset", offset.toString());
    params.set("limit", pageSize.toString());
    params.set("order", sortOrder === "asc" ? medusaSortBy : `-${medusaSortBy}`);

    if (categoryId) params.set("category_id[]", categoryId);
    if (collection) params.set("collection_id[]", collection);
    if (search) params.set("q", search);

    // Note: Medusa doesn't support price filtering directly in store API
    // This would need to be handled client-side or via custom endpoint

    const response = await this.client.get<MedusaResponse<MedusaProduct>>(
      `/store/products?${params.toString()}`
    );

    const products = (response.data.products ?? []).map((p: MedusaProduct) =>
      mapMedusaProduct(p, this.regionId, this.currencyCode)
    );

    // Apply client-side price filtering if needed
    let filteredProducts = products;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filteredProducts = products.filter((p) => {
        if (minPrice !== undefined && p.price < minPrice) return false;
        if (maxPrice !== undefined && p.price > maxPrice) return false;
        return true;
      });
    }

    const total = response.data.count ?? products.length;
    const totalPages = Math.ceil(total / pageSize);

    return {
      items: filteredProducts,
      total,
      page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get a single product by ID with optional related products.
   */
  async get(id: string, options: GetProductOptions = {}): Promise<ProductWithRelated> {
    const product = await this.fetchProduct(id);

    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }

    // Fetch related products if requested
    let relatedProducts: Product[] | undefined;
    if (options.includeRelated && product.categoryId) {
      const related = await this.list({
        categoryId: product.categoryId,
        pageSize: options.relatedLimit ?? 4,
      });
      relatedProducts = related.items.filter((p) => p.id !== product.id).slice(0, options.relatedLimit ?? 4);
    }

    return {
      ...product,
      relatedProducts,
    };
  }

  /**
   * Get a product by slug/handle.
   */
  async getBySlug(slug: string, options: GetProductOptions = {}): Promise<ProductWithRelated> {
    const listResponse = await this.client.get<MedusaResponse<MedusaProduct>>(
      `/store/products?handle=${slug}`
    );

    const medusaProduct = listResponse.data.products?.[0];
    if (!medusaProduct) {
      throw new Error(`Product not found with slug: ${slug}`);
    }

    const product = mapMedusaProduct(medusaProduct, this.regionId, this.currencyCode);

    // Fetch related products if requested
    let relatedProducts: Product[] | undefined;
    if (options.includeRelated && product.categoryId) {
      const related = await this.list({
        categoryId: product.categoryId,
        pageSize: options.relatedLimit ?? 4,
      });
      relatedProducts = related.items.filter((p) => p.id !== product.id).slice(0, options.relatedLimit ?? 4);
    }

    return {
      ...product,
      relatedProducts,
    };
  }

  /**
   * Get a product by SKU/reference.
   */
  async getBySku(sku: string, options: GetProductOptions = {}): Promise<ProductWithRelated> {
    // Medusa doesn't have a direct SKU search, so we search and filter
    const listResponse = await this.client.get<MedusaResponse<MedusaProduct>>(
      `/store/products?q=${sku}`
    );

    const medusaProduct = listResponse.data.products?.find(
      (p) => p.variants?.some((v) => v.sku === sku)
    );

    if (!medusaProduct) {
      throw new Error(`Product not found with SKU: ${sku}`);
    }

    const product = mapMedusaProduct(medusaProduct, this.regionId, this.currencyCode);

    // Fetch related products if requested
    let relatedProducts: Product[] | undefined;
    if (options.includeRelated && product.categoryId) {
      const related = await this.list({
        categoryId: product.categoryId,
        pageSize: options.relatedLimit ?? 4,
      });
      relatedProducts = related.items.filter((p) => p.id !== product.id).slice(0, options.relatedLimit ?? 4);
    }

    return {
      ...product,
      relatedProducts,
    };
  }

  /**
   * Search products by query.
   */
  async search(
    query: string,
    options: ListProductsOptions = {}
  ): Promise<ProductSearchResult> {
    const response = await this.list({
      ...options,
      search: query,
    });

    // Get facets from results
    const facets = await this.getFacetsFromProducts(response.items as Product[]);

    return {
      products: response.items as Product[],
      facets,
      total: response.total,
      suggestions: [], // Would need separate endpoint for suggestions
    };
  }

  /**
   * Get multiple products by IDs.
   */
  async getMany(ids: string[]): Promise<Product[]> {
    const products = await Promise.all(
      ids.map((id) => this.fetchProduct(id).catch(() => null))
    );
    return products.filter((p): p is Product => p !== null);
  }

  /**
   * Get featured products.
   */
  async getFeatured(limit = 10): Promise<Product[]> {
    // Medusa doesn't have built-in featured flag
    // This would need custom metadata or a specific collection
    const response = await this.list({ pageSize: limit });
    return (response.items as Product[]).filter((p) => p.featured);
  }

  /**
   * Get new products.
   */
  async getNew(limit = 10, daysBack = 30): Promise<Product[]> {
    const response = await this.list({
      pageSize: limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    // Filter by date if daysBack is specified
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return (response.items as Product[]).filter((p) => {
      const productDate = new Date(p.createdAt);
      return productDate >= cutoffDate;
    });
  }

  /**
   * Get products by category.
   */
  async getByCategory(
    categoryId: string,
    options?: Omit<ListProductsOptions, "categoryId">
  ): Promise<PaginatedResponse<Product>> {
    return this.list({ ...options, categoryId });
  }

  /**
   * Get product inventory/stock information.
   */
  async getInventory(productId: string): Promise<ProductInventory> {
    const product = await this.fetchProduct(productId);

    return {
      productId,
      sku: product?.reference ?? "",
      available: product?.stock ?? 0,
      reserved: 0, // Medusa doesn't expose reserved stock in store API
    };
  }

  /**
   * Get inventory for multiple products.
   */
  async getInventoryBulk(productIds: string[]): Promise<Map<string, ProductInventory>> {
    const inventoryMap = new Map<string, ProductInventory>();

    await Promise.all(
      productIds.map(async (id) => {
        try {
          const inventory = await this.getInventory(id);
          inventoryMap.set(id, inventory);
        } catch {
          // Product not found, skip
        }
      })
    );

    return inventoryMap;
  }

  /**
   * Fetch a single product without related products (internal helper).
   */
  private async fetchProduct(idOrHandle: string): Promise<Product | null> {
    try {
      // Try by ID first
      const response = await this.client.get<MedusaResponse<MedusaProduct>>(
        `/store/products/${idOrHandle}`
      );

      if (!response.data.product) return null;

      return mapMedusaProduct(response.data.product, this.regionId, this.currencyCode);
    } catch {
      // Try by handle if ID fails
      const listResponse = await this.client.get<MedusaResponse<MedusaProduct>>(
        `/store/products?handle=${idOrHandle}`
      );

      const product = listResponse.data.products?.[0];
      if (!product) return null;

      return mapMedusaProduct(product, this.regionId, this.currencyCode);
    }
  }

  /**
   * Extract facets from product list.
   */
  private async getFacetsFromProducts(products: Product[]): Promise<ProductFacets> {
    // Extract unique values for facets
    const categories = new Map<string, { id: string; name: string; count: number }>();
    const collections = new Map<string, number>();
    const materials = new Map<string, number>();
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const product of products) {
      // Categories
      if (product.categoryId && product.category) {
        const existing = categories.get(product.categoryId);
        if (existing) {
          existing.count++;
        } else {
          categories.set(product.categoryId, {
            id: product.categoryId,
            name: product.category.name,
            count: 1,
          });
        }
      }

      // Collections
      if (product.collection) {
        collections.set(product.collection, (collections.get(product.collection) ?? 0) + 1);
      }

      // Materials
      product.materials.forEach((m) => {
        materials.set(m, (materials.get(m) ?? 0) + 1);
      });

      // Price range
      if (product.price < minPrice) minPrice = product.price;
      if (product.price > maxPrice) maxPrice = product.price;
    }

    return {
      categories: Array.from(categories.values()),
      collections: Array.from(collections.entries()).map(([value, count]) => ({ value, count })),
      materials: Array.from(materials.entries()).map(([value, count]) => ({ value, count })),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice,
      },
    };
  }
}
