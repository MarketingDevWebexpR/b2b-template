/**
 * Sage Product Service
 *
 * Implements IProductService for Sage ERP integration.
 * Provides product sync and inventory management from Sage.
 */

import type { Product } from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";
import type {
  IProductService,
  ListProductsOptions,
  GetProductOptions,
  ProductWithRelated,
  ProductSearchResult,
  ProductInventory,
} from "@maison/api-client";
import type { SageApiClient } from "../client";
import { mapSageProduct, mapSageProducts } from "../mappers";

/**
 * Product service for Sage ERP
 *
 * @remarks
 * Sage is primarily used for:
 * - Product catalog sync from ERP
 * - Real-time inventory levels
 * - Product pricing from ERP
 *
 * Some features like search and related products are limited
 * as Sage is not a full e-commerce platform.
 */
export class SageProductService implements IProductService {
  constructor(private readonly client: SageApiClient) {}

  /**
   * List products from Sage
   */
  async list(options?: ListProductsOptions): Promise<PaginatedResponse<Product>> {
    const result = await this.client.getProducts({
      page: options?.page ?? 1,
      pageSize: options?.pageSize ?? 50,
      ...(options?.categoryId && { category: options.categoryId }),
      ...(options?.availableOnly !== undefined && { active: options.availableOnly }),
    });

    return {
      items: mapSageProducts([...result.items]),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  /**
   * Get a single product by ID (reference in Sage)
   */
  async get(id: string, _options?: GetProductOptions): Promise<ProductWithRelated> {
    const response = await this.client.getProduct(id);
    const product = mapSageProduct(response.data);

    // Sage doesn't have native related products functionality
    return product;
  }

  /**
   * Get product by slug
   *
   * @remarks
   * Sage doesn't use slugs natively, so we search by reference.
   */
  async getBySlug(slug: string, options?: GetProductOptions): Promise<ProductWithRelated> {
    // In Sage, we use reference as the primary identifier
    // Slugs would be generated client-side from the name
    // Try to find by searching all products
    const result = await this.list({ pageSize: 100 });
    const found = result.items.find((p) => p.slug === slug);

    if (!found) {
      throw new Error(`Product with slug "${slug}" not found`);
    }

    return this.get(found.id, options);
  }

  /**
   * Get product by SKU (reference in Sage)
   */
  async getBySku(sku: string, options?: GetProductOptions): Promise<ProductWithRelated> {
    // In Sage, SKU is the Reference field
    return this.get(sku, options);
  }

  /**
   * Search products
   *
   * @remarks
   * Sage has limited search capabilities. This implementation
   * fetches all products and filters client-side.
   */
  async search(query: string, options?: ListProductsOptions): Promise<ProductSearchResult> {
    // Sage doesn't have native search, fetch and filter
    const result = await this.list({
      ...options,
      pageSize: options?.pageSize ?? 100,
    });

    const queryLower = query.toLowerCase();
    const filtered = result.items.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.reference.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower)
    );

    return {
      products: filtered,
      total: filtered.length,
    };
  }

  /**
   * Get multiple products by IDs
   */
  async getMany(ids: string[]): Promise<Product[]> {
    const products: Product[] = [];

    // Sage doesn't have batch get, fetch individually
    for (const id of ids) {
      try {
        const product = await this.get(id);
        products.push(product);
      } catch {
        // Skip products that fail to fetch
        console.warn(`Failed to fetch product ${id} from Sage`);
      }
    }

    return products;
  }

  /**
   * Get featured products
   *
   * @remarks
   * Sage doesn't have a concept of featured products.
   * Returns first N products instead.
   */
  async getFeatured(limit = 10): Promise<Product[]> {
    const result = await this.list({ pageSize: limit, availableOnly: true });
    return [...result.items];
  }

  /**
   * Get new products
   *
   * @remarks
   * Returns products created within the specified days.
   */
  async getNew(limit = 10, daysBack = 30): Promise<Product[]> {
    const result = await this.list({ pageSize: 100, availableOnly: true });
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);

    const newProducts = result.items.filter((p) => {
      if (!p.createdAt) return false;
      return new Date(p.createdAt) >= cutoff;
    });

    return newProducts.slice(0, limit);
  }

  /**
   * Get products by category
   */
  async getByCategory(
    categoryId: string,
    options?: Omit<ListProductsOptions, "categoryId">
  ): Promise<PaginatedResponse<Product>> {
    return this.list({ ...options, categoryId });
  }

  /**
   * Get inventory for a product
   */
  async getInventory(productId: string): Promise<ProductInventory> {
    const inventory = await this.client.getInventory(productId);

    if (inventory.length === 0) {
      return {
        productId,
        sku: productId,
        available: 0,
        reserved: 0,
      };
    }

    // Aggregate inventory across warehouses
    const totalAvailable = inventory.reduce((sum, inv) => sum + inv.availableQuantity, 0);
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0);
    const firstItem = inventory[0];

    return {
      productId,
      sku: firstItem ? firstItem.sku : productId,
      available: totalAvailable,
      reserved: totalReserved,
    };
  }

  /**
   * Get inventory for multiple products
   */
  async getInventoryBulk(productIds: string[]): Promise<Map<string, ProductInventory>> {
    const inventoryMap = new Map<string, ProductInventory>();

    // Fetch all inventory and filter
    const allInventory = await this.client.getInventory();

    for (const productId of productIds) {
      const productInventory = allInventory.filter((inv) => inv.productId === productId);

      if (productInventory.length > 0) {
        const totalAvailable = productInventory.reduce(
          (sum, inv) => sum + inv.availableQuantity,
          0
        );
        const totalReserved = productInventory.reduce(
          (sum, inv) => sum + inv.reservedQuantity,
          0
        );
        const firstItem = productInventory[0];

        inventoryMap.set(productId, {
          productId,
          sku: firstItem ? firstItem.sku : productId,
          available: totalAvailable,
          reserved: totalReserved,
        });
      } else {
        inventoryMap.set(productId, {
          productId,
          sku: productId,
          available: 0,
          reserved: 0,
        });
      }
    }

    return inventoryMap;
  }
}
