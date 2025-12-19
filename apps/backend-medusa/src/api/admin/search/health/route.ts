/**
 * Search Health Monitoring API Route
 *
 * GET /admin/search/health
 *
 * Provides detailed health status for load balancers and monitoring systems.
 * This endpoint does NOT require authentication for basic health checks.
 *
 * Features:
 * - App Search health check with latency
 * - Index statistics per engine
 * - Last sync timestamps
 * - Warning aggregation
 *
 * @public - No authentication required for load balancer health checks
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../../modules/search";
import type SearchModuleService from "../../../../modules/search/service";
import { INDEX_NAMES } from "../../../../modules/search/utils/index-config";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Health status enum for overall system status
 */
type HealthStatus = "healthy" | "degraded" | "unhealthy";

/**
 * Individual engine health details
 */
interface EngineHealthDetails {
  /** Whether the engine is reachable and responding */
  available: boolean;
  /** Response time in milliseconds, null if unavailable */
  latency_ms: number | null;
  /** Number of indices/engines, null if unavailable */
  indices_count: number | null;
  /** Last error message if any */
  last_error: string | null;
}

/**
 * Complete health response structure
 */
interface SearchHealthResponse {
  /** Overall system status */
  status: HealthStatus;
  /** ISO timestamp of the health check */
  timestamp: string;
  /** Health details for AppSearch */
  engine: EngineHealthDetails;
  /** Array of warning messages */
  warnings: string[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Maximum time to wait for each engine health check (5 seconds) */
const HEALTH_CHECK_TIMEOUT_MS = 5000;

/** Expected index names for completeness check */
const EXPECTED_INDICES = Object.values(INDEX_NAMES);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Execute a promise with timeout
 *
 * @param promise - The promise to execute
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @param timeoutError - Error message on timeout
 * @returns The promise result or throws on timeout
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(timeoutError));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
}

/**
 * Check App Search health via API
 *
 * Uses the /api/as/v1/engines endpoint to verify connectivity.
 *
 * @returns Engine health details with latency
 */
async function checkAppSearchHealth(): Promise<EngineHealthDetails> {
  const endpoint = process.env.APPSEARCH_ENDPOINT;
  const apiKey = process.env.APPSEARCH_PRIVATE_KEY;

  // Not configured - return as unavailable but not an error
  if (!endpoint || !apiKey) {
    return {
      available: false,
      latency_ms: null,
      indices_count: null,
      last_error: "App Search not configured (missing APPSEARCH_ENDPOINT or APPSEARCH_PRIVATE_KEY)",
    };
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    // List engines to check health and get count
    const response = await fetch(`${endpoint}/api/as/v1/engines`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok) {
      return {
        available: false,
        latency_ms: latency,
        indices_count: null,
        last_error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as {
      results?: Array<unknown>;
      meta?: { page?: { total_results?: number } };
    };

    // Get engine count from response
    const enginesCount = data.meta?.page?.total_results ?? data.results?.length ?? 0;

    return {
      available: true,
      latency_ms: latency,
      indices_count: enginesCount,
      last_error: null,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage =
      error instanceof Error
        ? error.name === "AbortError"
          ? `Timeout after ${HEALTH_CHECK_TIMEOUT_MS}ms`
          : error.message
        : "Unknown connection error";

    return {
      available: false,
      latency_ms: latency,
      indices_count: null,
      last_error: errorMessage,
    };
  }
}

/**
 * Get last sync timestamp from search service
 *
 * @param searchService - The search module service
 * @returns Last sync date or null
 */
function getLastSyncTimestamp(searchService: SearchModuleService): Date | null {
  try {
    const reports = searchService.getSyncReports(1);
    if (reports.length > 0 && reports[0].completedAt) {
      return reports[0].completedAt;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Determine overall health status based on engine availability
 *
 * @param appsearchHealth - App Search health details
 * @returns Overall health status
 */
function determineOverallStatus(
  appsearchHealth: EngineHealthDetails
): HealthStatus {
  return appsearchHealth.available ? "healthy" : "unhealthy";
}

/**
 * Collect warnings based on health check results
 *
 * @param appsearchHealth - App Search health details
 * @param lastSync - Last sync timestamp
 * @returns Array of warning messages
 */
function collectWarnings(
  appsearchHealth: EngineHealthDetails,
  lastSync: Date | null
): string[] {
  const warnings: string[] = [];

  // Check for high latency (> 1000ms)
  const HIGH_LATENCY_THRESHOLD_MS = 1000;

  if (appsearchHealth.available && appsearchHealth.latency_ms !== null) {
    if (appsearchHealth.latency_ms > HIGH_LATENCY_THRESHOLD_MS) {
      warnings.push(
        `App Search latency is high: ${appsearchHealth.latency_ms}ms (threshold: ${HIGH_LATENCY_THRESHOLD_MS}ms)`
      );
    }
  }

  // Check for stale sync (> 24 hours)
  const STALE_SYNC_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
  if (lastSync !== null) {
    const timeSinceSync = Date.now() - lastSync.getTime();
    if (timeSinceSync > STALE_SYNC_THRESHOLD_MS) {
      const hoursAgo = Math.round(timeSinceSync / (60 * 60 * 1000));
      warnings.push(`Last successful sync was ${hoursAgo} hours ago`);
    }
  } else {
    warnings.push("No sync history found - indices may not be populated");
  }

  // Check for active engine being unavailable
  if (!appsearchHealth.available) {
    warnings.push("App Search is unavailable - search will fail");
  }

  return warnings;
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

/**
 * GET /admin/search/health
 *
 * Health check endpoint for load balancers and monitoring systems.
 * Does NOT require authentication for basic availability checks.
 *
 * Response format:
 * ```json
 * {
 *   "status": "healthy" | "unhealthy",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "engine": {
 *     "available": true,
 *     "latency_ms": 45,
 *     "indices_count": 4,
 *     "last_error": null
 *   },
 *   "warnings": []
 * }
 * ```
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const startTime = Date.now();

  try {
    // Get search service for active provider info
    const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);

    // Run health check with timeout protection
    const appsearchHealth = await withTimeout(
      checkAppSearchHealth(),
      HEALTH_CHECK_TIMEOUT_MS + 500,
      "App Search health check timed out"
    ).catch((error): EngineHealthDetails => ({
      available: false,
      latency_ms: Date.now() - startTime,
      indices_count: null,
      last_error: error instanceof Error ? error.message : "Health check failed",
    }));

    // Get last sync timestamp
    const lastSync = getLastSyncTimestamp(searchService);

    // Determine overall status
    const status = determineOverallStatus(appsearchHealth);

    // Collect warnings
    const warnings = collectWarnings(appsearchHealth, lastSync);

    // Build response
    const response: SearchHealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      engine: appsearchHealth,
      warnings,
    };

    // Set appropriate HTTP status based on health
    const httpStatus = status === "healthy" ? 200 : 503;

    // Add cache control headers for load balancers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.status(httpStatus).json(response);
  } catch (error) {
    // Even on error, return a structured response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during health check";

    const errorResponse: SearchHealthResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      engine: {
        available: false,
        latency_ms: null,
        indices_count: null,
        last_error: errorMessage,
      },
      warnings: [`Health check failed: ${errorMessage}`],
    };

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(503).json(errorResponse);
  }
}
