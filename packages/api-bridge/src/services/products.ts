/**
 * Bridge Product Service
 *
 * Implements IProductService for Laravel Bridge backend.
 */

import type { BaseApiClient, PaginatedResponse } from "@maison/api-core";
import type {
  IProductService,
  ListProductsOptions,
  ProductWithRelated,
  ProductSearchResult,
  ProductInventory,
  GetProductOptions,
} from "@maison/api-client";
import type { Product } from "@maison/types";
import { mapBridgeProduct, mapBridgeProducts, type BridgeRawProduct } from "../mappers/product";

/**
 * Bridge API products response format
 */
interface BridgeProductsResponse {
  data: BridgeRawProduct[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}

interface BridgeSingleProductResponse {
  data: BridgeRawProduct;
}

interface BridgeInventoryResponse {
  data: {
    product_id: string;
    sku: string;
    available: number;
    reserved: number;
    incoming?: number;
    incoming_date?: string;
  };
}

interface BridgeBulkInventoryResponse {
  data: Array<{
    product_id: string;
    sku: string;
    available: number;
    reserved: number;
    incoming?: number;
    incoming_date?: string;
  }>;
}

/**
 * Bridge Product Service implementation.
 *
 * Provides product operations via Laravel Bridge API.
 *
 * @example
 * ```typescript
 * const service = new BridgeProductService(httpClient, 'EUR');
 * const products = await service.list({ pageSize: 20 });
 * const product = await service.get('prod-123');
 * ```
 */
export class BridgeProductService implements IProductService {
  constructor(
    private readonly client: BaseApiClient,
    private readonly currency = "EUR"
  ) {}

  /**
   * List products with optional filtering and pagination.
   */
  async list(options: ListProductsOptions = {}): Promise<PaginatedResponse<Product>> {
    const {
      page = 1,
      pageSize = 20,
      categoryId,
      collection,
      search,
      sortBy,
      sortOrder,
      filters,
    } = options;

    // Build query parameters for Laravel API
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(pageSize));

    if (categoryId) {
      params.set("category_id", categoryId);
    }
    if (collection) {
      params.set("collection", collection);
    }
    if (search) {
      params.set("search", search);
    }
    if (sortBy) {
      params.set("sort_by", sortBy);
      params.set("sort_order", sortOrder ?? "asc");
    }
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(`filter[${key}][]`, String(v)));
        } else if (value !== undefined && value !== null) {
          params.set(`filter[${key}]`, String(value));
        }
      }
    }

    const response = await this.client.get<BridgeProductsResponse>(
      `/products?${params.toString()}`
    );

    const products = mapBridgeProducts(response.data.data, this.currency);
    const meta = response.data.meta;

    return {
      items: products,
      total: meta?.total ?? products.length,
      page: meta?.current_page ?? page,
      pageSize: meta?.per_page ?? pageSize,
      hasNextPage: meta?.current_page !== undefined && meta?.last_page !== undefined
        ? meta.current_page < meta.last_page
        : false,
      hasPreviousPage: (meta?.current_page ?? page) > 1,
    };
  }

  /**
   * Get a single product by ID.
   */
  async get(id: string, options?: GetProductOptions): Promise<ProductWithRelated> {
    const params = new URLSearchParams();
    if (options?.includeRelated) {
      params.set("include_related", "true");
      if (options.relatedLimit) {
        params.set("related_limit", String(options.relatedLimit));
      }
    }

    const queryString = params.toString();
    const url = queryString ? `/products/${id}?${queryString}` : `/products/${id}`;

    const response = await this.client.get<BridgeSingleProductResponse & {
      related?: BridgeRawProduct[];
    }>(url);

    const product = mapBridgeProduct(response.data.data, this.currency);
    const relatedProducts = response.data.related
      ? mapBridgeProducts(response.data.related, this.currency)
      : undefined;

    return {
      ...product,
      ...(relatedProducts && { relatedProducts }),
    };
  }

  /**
   * Get a product by slug/handle.
   */
  async getBySlug(slug: string, options?: GetProductOptions): Promise<ProductWithRelated> {
    const params = new URLSearchParams();
    if (options?.includeRelated) {
      params.set("include_related", "true");
    }

    const queryString = params.toString();
    const url = queryString ? `/products/slug/${slug}?${queryString}` : `/products/slug/${slug}`;

    const response = await this.client.get<BridgeSingleProductResponse & {
      related?: BridgeRawProduct[];
    }>(url);

    const product = mapBridgeProduct(response.data.data, this.currency);
    const relatedProducts = response.data.related
      ? mapBridgeProducts(response.data.related, this.currency)
      : undefined;

    return {
      ...product,
      ...(relatedProducts && { relatedProducts }),
    };
  }

  /**
   * Get a product by SKU.
   */
  async getBySku(sku: string, options?: GetProductOptions): Promise<ProductWithRelated> {
    const params = new URLSearchParams();
    if (options?.includeRelated) {
      params.set("include_related", "true");
    }

    const queryString = params.toString();
    const url = queryString ? `/products/sku/${sku}?${queryString}` : `/products/sku/${sku}`;

    const response = await this.client.get<BridgeSingleProductResponse & {
      related?: BridgeRawProduct[];
    }>(url);

    const product = mapBridgeProduct(response.data.data, this.currency);
    const relatedProducts = response.data.related
      ? mapBridgeProducts(response.data.related, this.currency)
      : undefined;

    return {
      ...product,
      ...(relatedProducts && { relatedProducts }),
    };
  }

  /**
   * Get multiple products by IDs.
   */
  async getMany(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const params = new URLSearchParams();
    ids.forEach((id) => params.append("ids[]", id));

    const response = await this.client.get<BridgeProductsResponse>(
      `/products/batch?${params.toString()}`
    );

    return mapBridgeProducts(response.data.data, this.currency);
  }

  /**
   * Search products by query string.
   */
  async search(
    query: string,
    options: ListProductsOptions = {}
  ): Promise<ProductSearchResult> {
    const result = await this.list({ ...options, search: query });

    return {
      products: [...result.items],
      total: result.total,
      // suggestions and facets are optional and not available from Bridge API
    };
  }

  /**
   * Get products by category ID.
   */
  async getByCategory(
    categoryId: string,
    options: Omit<ListProductsOptions, "categoryId"> = {}
  ): Promise<PaginatedResponse<Product>> {
    return this.list({ ...options, categoryId });
  }

  /**
   * Get featured products.
   */
  async getFeatured(limit = 10): Promise<Product[]> {
    const response = await this.client.get<BridgeProductsResponse>(
      `/products/featured?limit=${limit}`
    );
    return mapBridgeProducts(response.data.data, this.currency);
  }

  /**
   * Get new products.
   */
  async getNew(limit = 10, daysBack = 30): Promise<Product[]> {
    const response = await this.client.get<BridgeProductsResponse>(
      `/products/new?limit=${limit}&days_back=${daysBack}`
    );
    return mapBridgeProducts(response.data.data, this.currency);
  }

  /**
   * Get product inventory information.
   */
  async getInventory(productId: string): Promise<ProductInventory> {
    const response = await this.client.get<BridgeInventoryResponse>(
      `/products/${productId}/inventory`
    );

    const inv = response.data.data;
    return {
      productId: inv.product_id,
      sku: inv.sku,
      available: inv.available,
      reserved: inv.reserved,
      ...(inv.incoming !== undefined && { incoming: inv.incoming }),
      ...(inv.incoming_date !== undefined && { incomingDate: inv.incoming_date }),
    };
  }

  /**
   * Get inventory for multiple products.
   */
  async getInventoryBulk(productIds: string[]): Promise<Map<string, ProductInventory>> {
    if (productIds.length === 0) return new Map();

    const params = new URLSearchParams();
    productIds.forEach((id) => params.append("product_ids[]", id));

    const response = await this.client.get<BridgeBulkInventoryResponse>(
      `/products/inventory?${params.toString()}`
    );

    const result = new Map<string, ProductInventory>();
    for (const inv of response.data.data) {
      result.set(inv.product_id, {
        productId: inv.product_id,
        sku: inv.sku,
        available: inv.available,
        reserved: inv.reserved,
        ...(inv.incoming !== undefined && { incoming: inv.incoming }),
        ...(inv.incoming_date !== undefined && { incomingDate: inv.incoming_date }),
      });
    }

    return result;
  }
}
