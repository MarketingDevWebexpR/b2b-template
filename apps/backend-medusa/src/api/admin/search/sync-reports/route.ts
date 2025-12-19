/**
 * Admin Search Sync Reports API Route
 *
 * GET /admin/search/sync-reports
 *
 * Returns paginated list of sync history with filtering options.
 *
 * @admin
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../../modules/search";
import type SearchModuleService from "../../../../modules/search/service";
import {
  ListSyncReportsQuerySchema,
  validateRequest,
} from "../../../../modules/search/validators/admin";
import type {
  ListSyncReportsResponse,
  ListSyncReportsQuery,
  SyncReport,
  SyncStatus,
  SyncType,
  EntityType,
  SearchEngineType,
} from "../../../../modules/search/types/admin";

/**
 * GET /admin/search/sync-reports
 *
 * Lists sync history with pagination and filtering.
 *
 * Query Parameters:
 * @query status - Filter by sync status (pending|in_progress|completed|failed|cancelled)
 * @query engine - Filter by target engine (meilisearch|appsearch)
 * @query entity_type - Filter by entity type (all|products|categories|marques|collections)
 * @query from_date - Filter from date (ISO 8601)
 * @query to_date - Filter to date (ISO 8601)
 * @query limit - Results per page (1-100, default: 20)
 * @query offset - Pagination offset (default: 0)
 * @query order - Sort order (asc|desc, default: desc)
 */
export async function GET(
  req: MedusaRequest<object, ListSyncReportsQuery>,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");

  try {
    // Validate query parameters
    const validatedQuery = validateRequest(
      ListSyncReportsQuerySchema,
      req.query
    );

    const {
      status,
      engine,
      entity_type,
      from_date,
      to_date,
      limit,
      offset,
      order,
    } = validatedQuery;

    // Get all reports from service (in production, this would use database filtering)
    const allReports = await searchService.getSyncReports(1000);

    // Apply filters
    let filteredReports = allReports;

    if (status) {
      filteredReports = filteredReports.filter((r) => r.status === status);
    }

    if (engine) {
      filteredReports = filteredReports.filter((r) => r.engine === engine);
    }

    if (entity_type) {
      filteredReports = filteredReports.filter(
        (r) => r.entityType === entity_type || r.entityType === "all"
      );
    }

    if (from_date) {
      const fromDateObj = new Date(from_date);
      filteredReports = filteredReports.filter(
        (r) => r.startedAt && r.startedAt >= fromDateObj
      );
    }

    if (to_date) {
      const toDateObj = new Date(to_date);
      filteredReports = filteredReports.filter(
        (r) => r.startedAt && r.startedAt <= toDateObj
      );
    }

    // Sort
    filteredReports.sort((a, b) => {
      const aDate = a.startedAt?.getTime() || 0;
      const bDate = b.startedAt?.getTime() || 0;
      return order === "asc" ? aDate - bDate : bDate - aDate;
    });

    // Get total count before pagination
    const totalCount = filteredReports.length;

    // Apply pagination
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    const paginatedReports = filteredReports.slice(
      offsetNum,
      offsetNum + limitNum
    );

    // Transform to response format
    const reports: SyncReport[] = paginatedReports.map((r) => ({
      id: r.id,
      sync_type: (r.syncType || "full") as SyncType,
      entity_type: (r.entityType || "all") as EntityType,
      status: r.status as SyncStatus,
      engine: (r.engine || "meilisearch") as SearchEngineType,
      triggered_by: r.triggeredBy || "system",
      started_at: r.startedAt?.toISOString() || null,
      completed_at: r.completedAt?.toISOString() || null,
      duration_ms:
        r.startedAt && r.completedAt
          ? r.completedAt.getTime() - r.startedAt.getTime()
          : null,
      documents_processed: r.documentsIndexed,
      documents_failed: r.documentsFailed,
      results: null, // Would contain per-entity results
      error_message: r.errorMessage || null,
      created_at: r.startedAt?.toISOString() || new Date().toISOString(),
    }));

    const response: ListSyncReportsResponse = {
      reports,
      count: totalCount,
      limit: limitNum,
      offset: offsetNum,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error && typeof error === "object" && "type" in error) {
      const validationError = error as unknown as { message: string; details?: unknown };
      res.status(400).json({
        success: false,
        error_code: "VALIDATION_ERROR",
        message: validationError.message,
        details: validationError.details,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error("[Admin Sync Reports] Error:", error instanceof Error ? error : undefined);

    res.status(500).json({
      success: false,
      error_code: "INTERNAL_ERROR",
      message: "Failed to retrieve sync reports",
      timestamp: new Date().toISOString(),
    });
  }
}
