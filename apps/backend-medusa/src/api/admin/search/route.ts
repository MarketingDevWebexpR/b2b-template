/**
 * Admin Search API Routes
 *
 * Administrative endpoints for search management.
 * Provides index statistics and health checks.
 *
 * GET /admin/search - Get search index statistics
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../modules/search";
import type SearchModuleService from "../../../modules/search/service";
import { INDEX_NAMES } from "../../../modules/search/utils/index-config";

/**
 * GET /admin/search
 *
 * Returns search index statistics and health status.
 *
 * @admin
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  try {
    const isHealthy = await searchService.isHealthy();

    const stats: Record<string, { numberOfDocuments: number; isIndexing: boolean }> = {};

    // Get stats for each index
    for (const [key, indexName] of Object.entries(INDEX_NAMES)) {
      try {
        const indexStats = await searchService.getIndexStats(indexName);
        stats[key.toLowerCase()] = indexStats;
      } catch {
        stats[key.toLowerCase()] = { numberOfDocuments: 0, isIndexing: false };
      }
    }

    res.status(200).json({
      status: isHealthy ? "healthy" : "unhealthy",
      indexes: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[Admin Search] Stats error:", error instanceof Error ? error : undefined);

    res.status(500).json({
      status: "error",
      message: "Failed to get search statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
