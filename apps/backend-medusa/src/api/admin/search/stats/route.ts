/**
 * Admin Search Statistics API Route
 *
 * GET /admin/search/stats
 *
 * Returns detailed index statistics including document counts,
 * sync history summary, and per-engine metrics.
 *
 * @admin
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../../modules/search";
import type SearchModuleService from "../../../../modules/search/service";
import { INDEX_NAMES } from "../../../../modules/search/utils/index-config";
import type {
  SearchStatsResponse,
  EngineStats,
  IndexStats,
  SyncStatistics,
} from "../../../../modules/search/types/admin";

/**
 * GET /admin/search/stats
 *
 * Returns comprehensive search statistics.
 *
 * Response includes:
 * - Per-engine statistics (document counts, index status)
 * - Active engine indicator
 * - Sync operation summary (last 24h)
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  try {
    // Get engine status
    const engineStatus = searchService.getEngineStatus();
    const activeEngine = engineStatus.activeProvider as "meilisearch" | "appsearch";

    // Get Meilisearch stats
    const meilisearchStats = await getEngineStats(searchService, "meilisearch");

    // Get App Search stats if configured
    const appsearchConfigured = Boolean(process.env.APPSEARCH_ENDPOINT);
    let appsearchStats: EngineStats | undefined;
    if (appsearchConfigured) {
      appsearchStats = await getAppSearchStats();
    }

    // Get sync statistics
    const syncStats = await getSyncStatistics(searchService);

    const response: SearchStatsResponse = {
      engines: {
        meilisearch: meilisearchStats,
        ...(appsearchStats && { appsearch: appsearchStats }),
      },
      active_engine: activeEngine,
      sync_stats: syncStats,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error("[Admin Search Stats] Error:", error instanceof Error ? error : undefined);

    res.status(500).json({
      success: false,
      error_code: "INTERNAL_ERROR",
      message: "Failed to retrieve search statistics",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Get statistics for Meilisearch
 */
async function getEngineStats(
  searchService: SearchModuleService,
  engine: "meilisearch" | "appsearch"
): Promise<EngineStats> {
  const indexes: Record<string, IndexStats> = {};
  let totalDocuments = 0;
  let available = true;

  try {
    // Get stats for each index
    for (const [key, indexName] of Object.entries(INDEX_NAMES)) {
      try {
        const stats = await searchService.getIndexStats(indexName);

        const indexStats: IndexStats = {
          name: indexName,
          document_count: stats.numberOfDocuments,
          is_indexing: stats.isIndexing,
        };

        indexes[key.toLowerCase()] = indexStats;
        totalDocuments += stats.numberOfDocuments;
      } catch {
        indexes[key.toLowerCase()] = {
          name: indexName,
          document_count: 0,
          is_indexing: false,
        };
      }
    }
  } catch {
    available = false;
  }

  // Get last sync info
  let lastSync: EngineStats["last_sync"];
  try {
    const reports = await searchService.getSyncReports(1);
    if (reports.length > 0 && reports[0].status === "completed") {
      lastSync = {
        id: reports[0].id,
        completed_at: reports[0].completedAt?.toISOString() || new Date().toISOString(),
        documents_processed: reports[0].documentsIndexed,
      };
    }
  } catch {
    // Ignore errors fetching sync reports
  }

  return {
    engine,
    available,
    total_documents: totalDocuments,
    indexes: indexes as EngineStats["indexes"],
    last_sync: lastSync,
  };
}

/**
 * Get statistics for App Search
 */
async function getAppSearchStats(): Promise<EngineStats> {
  const endpoint = process.env.APPSEARCH_ENDPOINT;
  const apiKey = process.env.APPSEARCH_PRIVATE_KEY;
  const engineName = process.env.APPSEARCH_ENGINE_NAME || "dev-medusa-v2";

  if (!endpoint || !apiKey) {
    return {
      engine: "appsearch",
      available: false,
      total_documents: 0,
      indexes: {
        products: { name: "products", document_count: 0, is_indexing: false },
        categories: { name: "categories", document_count: 0, is_indexing: false },
        marques: { name: "marques", document_count: 0, is_indexing: false },
      },
    };
  }

  try {
    // Get engine stats from App Search API
    const response = await fetch(`${endpoint}/api/as/v1/engines/${engineName}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const engineData = await response.json() as { document_count?: number };
    const documentCount = engineData.document_count || 0;

    return {
      engine: "appsearch",
      available: true,
      total_documents: documentCount,
      indexes: {
        // App Search uses a single engine, so we report all docs there
        products: {
          name: engineName,
          document_count: documentCount,
          is_indexing: false,
        },
        categories: { name: "categories", document_count: 0, is_indexing: false },
        marques: { name: "marques", document_count: 0, is_indexing: false },
      },
    };
  } catch {
    return {
      engine: "appsearch",
      available: false,
      total_documents: 0,
      indexes: {
        products: { name: "products", document_count: 0, is_indexing: false },
        categories: { name: "categories", document_count: 0, is_indexing: false },
        marques: { name: "marques", document_count: 0, is_indexing: false },
      },
    };
  }
}

/**
 * Get sync statistics summary
 */
async function getSyncStatistics(
  searchService: SearchModuleService
): Promise<SyncStatistics> {
  try {
    const reports = await searchService.getSyncReports(100);

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter reports from last 24 hours
    const recent24h = reports.filter(
      (r) => r.startedAt && r.startedAt >= yesterday
    );

    const successful24h = recent24h.filter((r) => r.status === "completed");
    const failed24h = recent24h.filter((r) => r.status === "failed");

    // Calculate average duration from completed syncs
    const completedWithDuration = reports.filter(
      (r) => r.status === "completed" && r.startedAt && r.completedAt
    );

    const avgDuration =
      completedWithDuration.length > 0
        ? completedWithDuration.reduce((sum, r) => {
            const duration = r.completedAt!.getTime() - r.startedAt!.getTime();
            return sum + duration;
          }, 0) / completedWithDuration.length
        : 0;

    // Total documents synced in last 24h
    const documentsSynced24h = successful24h.reduce(
      (sum, r) => sum + r.documentsIndexed,
      0
    );

    return {
      total_syncs: reports.length,
      successful_last_24h: successful24h.length,
      failed_last_24h: failed24h.length,
      avg_duration_ms: Math.round(avgDuration),
      documents_synced_24h: documentsSynced24h,
    };
  } catch {
    return {
      total_syncs: 0,
      successful_last_24h: 0,
      failed_last_24h: 0,
      avg_duration_ms: 0,
      documents_synced_24h: 0,
    };
  }
}
