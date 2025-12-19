/**
 * Admin Search Status API Route
 *
 * GET /admin/search/status
 *
 * Returns overall search health, active engine configuration,
 * and status of each configured search engine.
 *
 * @admin
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../../modules/search";
import type SearchModuleService from "../../../../modules/search/service";
import type {
  SearchStatusResponse,
  EngineHealth,
  EngineConfiguration,
} from "../../../../modules/search/types/admin";

/**
 * GET /admin/search/status
 *
 * Returns search system health and configuration status.
 *
 * Response includes:
 * - Overall system status (healthy/degraded/unhealthy)
 * - Active engine configuration
 * - Health status of each engine
 * - Last sync operation summary
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  try {
    // Check health of Meilisearch
    const meilisearchHealth = await checkEngineHealth(searchService, "meilisearch");

    // Initialize engines object
    const engines: { meilisearch: EngineHealth; appsearch?: EngineHealth } = {
      meilisearch: meilisearchHealth,
    };

    // Check App Search if configured
    const appsearchConfigured = Boolean(process.env.APPSEARCH_ENDPOINT);
    if (appsearchConfigured) {
      engines.appsearch = await checkAppSearchHealth();
    }

    // Get current configuration
    const configuration = getEngineConfiguration(searchService);

    // Get last sync report (from service if available)
    const lastSync = await getLastSyncReport(searchService);

    // Determine overall status
    const activeEngine = configuration.active_engine;
    const activeEngineHealth = engines[activeEngine];
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";

    if (!activeEngineHealth?.healthy) {
      status = "unhealthy";
    } else if (
      configuration.dual_write_enabled &&
      configuration.secondary_engine &&
      engines[configuration.secondary_engine] &&
      !engines[configuration.secondary_engine]?.healthy
    ) {
      status = "degraded";
    }

    const response: SearchStatusResponse = {
      status,
      configuration,
      engines,
      last_sync: lastSync,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error("[Admin Search Status] Error:", error instanceof Error ? error : undefined);

    res.status(500).json({
      success: false,
      error_code: "INTERNAL_ERROR",
      message: "Failed to retrieve search status",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Check health of Meilisearch via SearchModuleService
 */
async function checkEngineHealth(
  searchService: SearchModuleService,
  engine: "meilisearch" | "appsearch"
): Promise<EngineHealth> {
  const startTime = Date.now();

  try {
    const healthy = await searchService.isHealthy();
    const latency = Date.now() - startTime;

    return {
      engine,
      healthy,
      latency_ms: latency,
      last_check_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      engine,
      healthy: false,
      latency_ms: Date.now() - startTime,
      last_check_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Check App Search health directly
 */
async function checkAppSearchHealth(): Promise<EngineHealth> {
  const startTime = Date.now();
  const endpoint = process.env.APPSEARCH_ENDPOINT;
  const apiKey = process.env.APPSEARCH_PRIVATE_KEY;
  const engineName = process.env.APPSEARCH_ENGINE_NAME || "dev-medusa-v2";

  if (!endpoint || !apiKey) {
    return {
      engine: "appsearch",
      healthy: false,
      latency_ms: 0,
      last_check_at: new Date().toISOString(),
      error: "App Search not configured (missing endpoint or API key)",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `${endpoint}/api/as/v1/engines/${engineName}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (response.ok) {
      return {
        engine: "appsearch",
        healthy: true,
        latency_ms: latency,
        last_check_at: new Date().toISOString(),
      };
    }

    return {
      engine: "appsearch",
      healthy: false,
      latency_ms: latency,
      last_check_at: new Date().toISOString(),
      error: `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    return {
      engine: "appsearch",
      healthy: false,
      latency_ms: Date.now() - startTime,
      last_check_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Get current engine configuration from service
 */
function getEngineConfiguration(searchService: SearchModuleService): EngineConfiguration {
  // Get engine status from the service
  const engineStatus = searchService.getEngineStatus();

  return {
    active_engine: engineStatus.activeProvider as "meilisearch" | "appsearch",
    secondary_engine: engineStatus.secondaryProvider as "meilisearch" | "appsearch" | null,
    dual_write_enabled: engineStatus.mode === "dual",
    appsearch_traffic_percentage: engineStatus.appSearchTrafficPercentage,
    last_switch_at: null, // Would come from database
    last_switch_by: null, // Would come from database
  };
}

/**
 * Get most recent sync report from service
 */
async function getLastSyncReport(
  searchService: SearchModuleService
): Promise<{
  id: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  completed_at: string | null;
  documents_processed: number;
} | null> {
  try {
    const reports = await searchService.getSyncReports(1);
    if (reports.length === 0) return null;

    const latest = reports[0];
    return {
      id: latest.id,
      status: latest.status as "pending" | "in_progress" | "completed" | "failed" | "cancelled",
      completed_at: latest.completedAt?.toISOString() || null,
      documents_processed: latest.documentsIndexed,
    };
  } catch {
    return null;
  }
}
