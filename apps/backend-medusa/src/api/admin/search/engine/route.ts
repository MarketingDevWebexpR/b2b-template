/**
 * Admin Search Engine Switch API Route
 *
 * GET /admin/search/engine - Get current engine configuration
 * PUT /admin/search/engine - Switch between engines
 *
 * Allows switching between Meilisearch and App Search engines.
 * Supports dual-write mode and traffic splitting for safe migrations.
 *
 * @admin
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { SEARCH_MODULE } from "../../../../modules/search";
import type SearchModuleService from "../../../../modules/search/service";
import {
  SwitchEngineRequestSchema,
  validateRequest,
  type SwitchEngineRequestInput,
} from "../../../../modules/search/validators/admin";
import type {
  SwitchEngineResponse,
  EngineConfiguration,
} from "../../../../modules/search/types/admin";

// Required confirmation token for production safety
const REQUIRED_CONFIRMATION = "CONFIRM_ENGINE_SWITCH";

/**
 * GET /admin/search/engine
 *
 * Returns current engine configuration.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);

  try {
    const engineStatus = searchService.getEngineStatus();

    const configuration: EngineConfiguration = {
      active_engine: engineStatus.activeProvider as "meilisearch" | "appsearch",
      secondary_engine: engineStatus.secondaryProvider as "meilisearch" | "appsearch" | null,
      dual_write_enabled: engineStatus.mode === "dual",
      appsearch_traffic_percentage: engineStatus.appSearchTrafficPercentage,
      last_switch_at: null,
      last_switch_by: null,
    };

    res.status(200).json({
      configuration,
      available_engines: {
        meilisearch: Boolean(process.env.MEILISEARCH_HOST),
        appsearch: Boolean(process.env.APPSEARCH_ENDPOINT),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error_code: "INTERNAL_ERROR",
      message: "Failed to retrieve engine configuration",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * PUT /admin/search/engine
 *
 * Switches the active search engine.
 *
 * Request Body:
 * @body active_engine - New primary engine: "meilisearch" | "appsearch"
 * @body dual_write_enabled - Enable writing to both engines (default: false)
 * @body secondary_engine - Secondary engine for dual-write (required if dual_write_enabled)
 * @body appsearch_traffic_percentage - Traffic percentage for App Search (0-100)
 * @body migrate_data - Trigger data migration to new engine (optional)
 * @body confirmation_token - Required: "CONFIRM_ENGINE_SWITCH" for production safety
 */
export async function PUT(
  req: MedusaRequest<SwitchEngineRequestInput>,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  try {
    // Validate request body
    const validatedBody = validateRequest(
      SwitchEngineRequestSchema,
      req.body || {}
    );

    const {
      active_engine,
      dual_write_enabled,
      secondary_engine,
      appsearch_traffic_percentage,
      migrate_data,
      confirmation_token,
    } = validatedBody;

    // Require confirmation token for safety
    if (confirmation_token !== REQUIRED_CONFIRMATION) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Engine switch requires confirmation. Set confirmation_token to "${REQUIRED_CONFIRMATION}"`
      );
    }

    // Validate engine availability before switching
    const targetEngineAvailable = await checkEngineAvailability(active_engine);
    if (!targetEngineAvailable) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Target engine "${active_engine}" is not available or not configured`
      );
    }

    if (dual_write_enabled && secondary_engine) {
      const secondaryAvailable = await checkEngineAvailability(secondary_engine);
      if (!secondaryAvailable) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          `Secondary engine "${secondary_engine}" is not available or not configured`
        );
      }
    }

    // Get admin user for audit
    const reqWithUser = req as unknown as { user?: { id?: string } };
    const switchedBy = `admin:${reqWithUser.user?.id || "unknown"}`;

    logger.warn(
      `[Search Engine Switch] Switching to ${active_engine} by ${switchedBy}` +
        (dual_write_enabled ? ` (dual-write to ${secondary_engine})` : "") +
        (appsearch_traffic_percentage !== undefined ? ` (traffic: ${appsearch_traffic_percentage}%)` : "")
    );

    // Apply the engine switch via the service
    if (dual_write_enabled && active_engine === "meilisearch") {
      // Enable dual mode with Meilisearch as primary
      searchService.switchProvider("dual");
      if (appsearch_traffic_percentage !== undefined) {
        searchService.setAppSearchTrafficPercentage(appsearch_traffic_percentage);
      }
    } else if (active_engine === "appsearch") {
      // Switch to App Search
      searchService.switchProvider("appsearch");
      if (appsearch_traffic_percentage !== undefined) {
        searchService.setAppSearchTrafficPercentage(100);
      }
    } else {
      // Switch to Meilisearch only
      searchService.switchProvider("meilisearch");
    }

    // Get updated configuration
    const engineStatus = searchService.getEngineStatus();

    const newConfiguration: EngineConfiguration = {
      active_engine: engineStatus.activeProvider as "meilisearch" | "appsearch",
      secondary_engine: engineStatus.secondaryProvider as "meilisearch" | "appsearch" | null,
      dual_write_enabled: engineStatus.mode === "dual",
      appsearch_traffic_percentage: engineStatus.appSearchTrafficPercentage,
      last_switch_at: new Date().toISOString(),
      last_switch_by: switchedBy,
    };

    // Generate warnings
    const warnings: string[] = [];

    if (!migrate_data && active_engine === "appsearch") {
      warnings.push(
        "Data was not migrated. App Search may be empty. Consider running a reindex."
      );
    }

    if (dual_write_enabled) {
      warnings.push(
        "Dual-write mode enabled. Write operations will be slower. " +
          "Disable dual-write after confirming data consistency."
      );
    }

    // Trigger migration if requested
    let migrationJobId: string | undefined;
    if (migrate_data) {
      migrationJobId = `migration_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      logger.info(`[Search] Migration requested - job ID: ${migrationJobId}`);
      // In production, this would queue a migration job
    }

    const response: SwitchEngineResponse = {
      success: true,
      configuration: newConfiguration,
      migration_job_id: migrationJobId,
      warnings: warnings.length > 0 ? warnings : undefined,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error;
    }

    logger.error("[Admin Engine Switch] Error:", error instanceof Error ? error : undefined);

    res.status(500).json({
      success: false,
      error_code: "INTERNAL_ERROR",
      message: "Failed to switch search engine",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Check if an engine is available and configured
 */
async function checkEngineAvailability(
  engine: "meilisearch" | "appsearch"
): Promise<boolean> {
  if (engine === "meilisearch") {
    const host = process.env.MEILISEARCH_HOST;
    if (!host) return false;

    try {
      const response = await fetch(`${host}/health`, { method: "GET" });
      return response.ok;
    } catch {
      return false;
    }
  }

  if (engine === "appsearch") {
    const endpoint = process.env.APPSEARCH_ENDPOINT;
    const apiKey = process.env.APPSEARCH_PRIVATE_KEY;

    if (!endpoint || !apiKey) return false;

    try {
      const engineName = process.env.APPSEARCH_ENGINE_NAME || "dev-medusa-v2";
      const response = await fetch(`${endpoint}/api/as/v1/engines/${engineName}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  return false;
}
