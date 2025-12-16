/**
 * Sage API client implementation
 */

import {
  BaseApiClient,
  type ApiAdapter,
  type ApiResponse,
  type PaginatedResponse,
} from "@maison/api-core";
import type {
  SageConfig,
  SageProduct,
  SageInventory,
  SageProductsResponse,
  SageInventoryResponse,
} from "./types";

/**
 * Default Sage API version
 */
const DEFAULT_API_VERSION = "v1";

/**
 * Sage API client for interacting with Sage ERP
 */
export class SageApiClient extends BaseApiClient implements ApiAdapter {
  public readonly name = "sage";
  public readonly version = "1.0.0";

  private readonly companyId: string;
  private readonly apiVersion: string;
  private initialized = false;

  constructor(config: SageConfig) {
    super(config);
    this.companyId = config.companyId;
    this.apiVersion = config.apiVersion ?? DEFAULT_API_VERSION;
  }

  /**
   * Initialize the Sage client
   */
  async initialize(): Promise<void> {
    // Verify connection by checking health
    const healthy = await this.healthCheck();
    if (!healthy) {
      throw new Error("Failed to connect to Sage API");
    }
    this.initialized = true;
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return this.initialized && Boolean(this.config.authToken);
  }

  /**
   * Perform health check on Sage API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get(`/${this.apiVersion}/health`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a list of products from Sage
   */
  async getProducts(options?: {
    page?: number;
    pageSize?: number;
    category?: string;
    active?: boolean;
  }): Promise<PaginatedResponse<SageProduct>> {
    const response = await this.get<SageProductsResponse>(
      `/${this.apiVersion}/companies/${this.companyId}/products`,
      {
        params: {
          page: options?.page ?? 1,
          pageSize: options?.pageSize ?? 50,
          category: options?.category,
          active: options?.active,
        },
      }
    );

    const { products, total, page, pageSize } = response.data;

    return {
      items: products,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<ApiResponse<SageProduct>> {
    return this.get<SageProduct>(
      `/${this.apiVersion}/companies/${this.companyId}/products/${productId}`
    );
  }

  /**
   * Get inventory for all products or a specific product
   */
  async getInventory(productId?: string): Promise<readonly SageInventory[]> {
    const path = productId
      ? `/${this.apiVersion}/companies/${this.companyId}/inventory/${productId}`
      : `/${this.apiVersion}/companies/${this.companyId}/inventory`;

    const response = await this.get<SageInventoryResponse>(path);
    return response.data.inventory;
  }

  /**
   * Update inventory quantity for a product
   */
  async updateInventory(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<ApiResponse<SageInventory>> {
    return this.patch<SageInventory>(
      `/${this.apiVersion}/companies/${this.companyId}/inventory/${productId}`,
      {
        warehouseId,
        quantity,
      }
    );
  }

  /**
   * Sync products from Sage (full sync)
   */
  async syncProducts(): Promise<{
    synced: number;
    errors: readonly string[];
  }> {
    const response = await this.post<{
      synced: number;
      errors: readonly string[];
    }>(`/${this.apiVersion}/companies/${this.companyId}/sync/products`);

    return response.data;
  }
}
