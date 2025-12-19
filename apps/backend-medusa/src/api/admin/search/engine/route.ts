/**
 * Admin Search Engine Configuration API Route
 *
 * GET /admin/search/engine - Get current engine configuration
 * PUT /admin/search/engine - No longer supported (AppSearch only)
 *
 * Returns AppSearch engine configuration.
 * Engine switching has been removed.
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
    const configuration: EngineConfiguration = {
      active_engine: "appsearch",
      secondary_engine: null,
      dual_write_enabled: false,
      appsearch_traffic_percentage: 100,
      last_switch_at: null,
      last_switch_by: null,
    };

    res.status(200).json({
      configuration,
      available_engines: {
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
 * This endpoint is simplified to only work with AppSearch.
 * Engine switching is no longer supported.
 *
 * @deprecated Engine switching has been removed. AppSearch is the only supported engine.
 */
export async function PUT(
  req: MedusaRequest<SwitchEngineRequestInput>,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger");

  logger.warn("[Admin Engine Switch] Engine switching is no longer supported. AppSearch is the only engine.");

  res.status(400).json({
    success: false,
    error_code: "NOT_SUPPORTED",
    message: "Engine switching is no longer supported. AppSearch is the only search engine.",
    timestamp: new Date().toISOString(),
  });
}
