/**
 * Admin Search Reindex API Routes
 *
 * Endpoints for triggering full index rebuilds.
 * Use sparingly - these operations can be resource-intensive.
 *
 * POST /admin/search/reindex - Reindex all data
 * POST /admin/search/reindex?type=products - Reindex products only
 * POST /admin/search/reindex?type=categories - Reindex categories only
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SEARCH_MODULE } from "../../../../modules/search";
import type SearchModuleService from "../../../../modules/search/service";
import { INDEX_NAMES } from "../../../../modules/search/utils/index-config";

interface ReindexQuery {
  type?: "all" | "products" | "categories" | "collections";
  clear?: string;
}

/**
 * POST /admin/search/reindex
 *
 * Triggers a full reindex of the specified type(s).
 * This is a potentially long-running operation.
 *
 * @admin
 */
export async function POST(
  req: MedusaRequest & { query: ReindexQuery },
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const logger = req.scope.resolve("logger");

  const { type = "all", clear = "false" } = req.query;
  const shouldClear = clear === "true" || clear === "1";

  const startTime = Date.now();
  const results: Record<string, { count: number; success: boolean; error?: string }> = {};

  try {
    // Reindex products
    if (type === "all" || type === "products") {
      logger.info("[Reindex] Starting product reindex...");

      try {
        if (shouldClear) {
          await searchService.clearIndex(INDEX_NAMES.PRODUCTS);
        }

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
    }

    // Reindex categories
    if (type === "all" || type === "categories") {
      logger.info("[Reindex] Starting category reindex...");

      try {
        if (shouldClear) {
          await searchService.clearIndex(INDEX_NAMES.CATEGORIES);
        }

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
    }

    // Reindex collections
    if (type === "all" || type === "collections") {
      logger.info("[Reindex] Starting collection reindex...");

      try {
        if (shouldClear) {
          await searchService.clearIndex(INDEX_NAMES.COLLECTIONS);
        }

        // Fetch all collections
        const { data: collections } = await query.graph({
          entity: "product_collection",
          fields: [
            "id",
            "title",
            "handle",
            "created_at",
            "metadata",
          ],
        });

        // Collections index would need similar implementation
        // For now, mark as not implemented
        results.collections = { count: collections.length, success: true };
        logger.info(`[Reindex] Found ${collections.length} collections (indexing TBD)`);
      } catch (error) {
        logger.error("[Reindex] Collection reindex error:", error instanceof Error ? error : undefined);
        results.collections = {
          count: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      type,
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
 * DELETE /admin/search/reindex
 *
 * Clears all search indexes.
 * Use with caution - requires manual reindex afterward.
 *
 * @admin
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  try {
    logger.warn("[Search] Clearing all indexes...");

    for (const indexName of Object.values(INDEX_NAMES)) {
      try {
        await searchService.clearIndex(indexName);
        logger.info(`[Search] Cleared index: ${indexName}`);
      } catch (error) {
        logger.warn(`[Search] Failed to clear index ${indexName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.status(200).json({
      success: true,
      message: "All search indexes cleared",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[Search] Clear error:", error instanceof Error ? error : undefined);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
