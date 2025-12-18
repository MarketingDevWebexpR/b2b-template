/**
 * Public Search Reindex API (Development Only)
 *
 * Triggers a reindex of all products and categories.
 * This endpoint is for development/testing purposes.
 *
 * POST /search/reindex - Reindex all data
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SEARCH_MODULE } from "../../../modules/search";
import type SearchModuleService from "../../../modules/search/service";
import { INDEX_NAMES } from "../../../modules/search/utils/index-config";

/**
 * POST /search/reindex
 *
 * Triggers a full reindex of products and categories.
 * For development use only.
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({
      success: false,
      error: "Reindex endpoint disabled in production",
    });
    return;
  }

  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const logger = req.scope.resolve("logger");

  const startTime = Date.now();
  const results: Record<string, { count: number; success: boolean; error?: string }> = {};

  try {
    // Reindex products
    logger.info("[Reindex] Starting product reindex...");

    try {
      // Fetch all published products
      const { data: products } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "title",
          "handle",
          "description",
          "status",
          "thumbnail",
          "created_at",
          "updated_at",
          "metadata",
          "images.url",
          "categories.id",
          "categories.name",
          "categories.handle",
          "tags.id",
          "tags.value",
          "collection.id",
          "collection.title",
          "variants.id",
          "variants.title",
          "variants.sku",
          "variants.barcode",
          "variants.inventory_quantity",
          "variants.prices.amount",
          "variants.prices.currency_code",
        ],
        filters: {
          status: "published",
        },
      });

      if (products.length > 0) {
        await searchService.indexProducts(products);
      }

      results.products = { count: products.length, success: true };
      logger.info(`[Reindex] Indexed ${products.length} products`);
    } catch (error) {
      logger.error("[Reindex] Product reindex error:", error instanceof Error ? error : undefined);
      results.products = {
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Reindex categories
    logger.info("[Reindex] Starting category reindex...");

    try {
      // Fetch all active categories
      const { data: categories } = await query.graph({
        entity: "product_category",
        fields: [
          "id",
          "name",
          "handle",
          "description",
          "is_active",
          "rank",
          "created_at",
          "metadata",
          "parent_category.id",
          "parent_category.name",
          "parent_category.parent_category.id",
          "parent_category.parent_category.parent_category.id",
        ],
        filters: {
          is_active: true,
        },
      });

      if (categories.length > 0) {
        await searchService.indexCategories(categories);
      }

      results.categories = { count: categories.length, success: true };
      logger.info(`[Reindex] Indexed ${categories.length} categories`);
    } catch (error) {
      logger.error("[Reindex] Category reindex error:", error instanceof Error ? error : undefined);
      results.categories = {
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[Reindex] General error:", error instanceof Error ? error : undefined);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * GET /search/reindex
 *
 * Get index stats
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);

  try {
    const stats: Record<string, unknown> = {};

    for (const [key, indexName] of Object.entries(INDEX_NAMES)) {
      try {
        stats[key] = await searchService.getIndexStats(indexName);
      } catch {
        stats[key] = { error: "Index not found" };
      }
    }

    res.status(200).json({
      success: true,
      indexes: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
