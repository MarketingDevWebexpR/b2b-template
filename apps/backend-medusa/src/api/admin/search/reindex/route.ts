/**
 * Admin Search Reindex API Route
 *
 * POST /admin/search/reindex
 *
 * Triggers a manual reindex of search data.
 * Supports full reindex, incremental sync, or entity-specific reindex.
 *
 * @admin
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SEARCH_MODULE } from "../../../../modules/search";
import type SearchModuleService from "../../../../modules/search/service";
import type { ProductDocument, CategoryDocument, MarqueDocument } from "../../../../modules/search/service";
import {
  ReindexRequestSchema,
  validateRequest,
  type ReindexRequestInput,
} from "../../../../modules/search/validators/admin";
import type {
  ReindexResponse,
  SyncReport,
  EntityType,
} from "../../../../modules/search/types/admin";

// Query interface for Medusa remote query
interface MedusaQuery {
  graph: (params: {
    entity: string;
    fields: string[];
    filters?: Record<string, unknown>;
    pagination?: { take: number; skip: number };
  }) => Promise<{ data: unknown[] }>;
}

// In-memory tracking for async jobs (should be in database for production)
const activeJobs: Map<string, {
  id: string;
  status: "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  results?: {
    products: number;
    categories: number;
    marques: number;
    collections: number;
  };
  errors?: Array<{ entity: string; id: string; error: string }>;
}> = new Map();

/**
 * POST /admin/search/reindex
 *
 * Triggers a reindex operation.
 *
 * Request Body:
 * @body sync_type - Type of sync: "full" | "incremental" | "entity" (default: "full")
 * @body entity_types - Array of entity types to sync: ["products", "categories", "marques", "collections", "all"]
 * @body target_engine - Target engine: "appsearch" (only AppSearch is supported)
 * @body clear_before - Clear index before reindexing (default: true for full sync)
 * @body async - Run async and return job ID (default: true)
 * @body batch_size - Batch size for indexing (100-5000, default: 1000)
 */
export async function POST(
  req: MedusaRequest<ReindexRequestInput>,
  res: MedusaResponse
): Promise<void> {
  const searchService: SearchModuleService = req.scope.resolve(SEARCH_MODULE);
  const logger = req.scope.resolve("logger");
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as MedusaQuery;

  try {
    // Validate request body
    const validatedBody = validateRequest(ReindexRequestSchema, req.body || {});

    const {
      sync_type,
      entity_types,
      target_engine,
      clear_before,
      async: runAsync,
      batch_size,
    } = validatedBody;

    // Generate job ID
    const jobId = `reindex_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Get triggered by user
    const reqWithUser = req as unknown as { user?: { id?: string } };
    const triggeredBy = `admin:${reqWithUser.user?.id || "unknown"}`;

    logger.info(
      `[Admin Reindex] Starting ${sync_type} reindex for ${entity_types.join(", ")}` +
        (target_engine ? ` to ${target_engine}` : "") +
        ` (job: ${jobId}, by: ${triggeredBy})`
    );

    // Create job tracking entry
    activeJobs.set(jobId, {
      id: jobId,
      status: "running",
      startedAt: new Date(),
    });

    // Build the reindex function
    const runReindex = async () => {
      const results = {
        products: 0,
        categories: 0,
        marques: 0,
        collections: 0,
      };
      const errors: Array<{ entity: string; id: string; error: string }> = [];

      try {
        // Ensure service is initialized
        await searchService.initialize();

        const shouldSyncAll = entity_types.includes("all" as EntityType);

        // Sync products
        if (shouldSyncAll || entity_types.includes("products" as EntityType)) {
          logger.info("[Admin Reindex] Syncing products...");
          const productResult = await syncProductsForReindex(
            query,
            searchService,
            logger,
            clear_before,
            batch_size
          );
          results.products = productResult.indexed;
          errors.push(...productResult.errors);
        }

        // Sync categories
        if (shouldSyncAll || entity_types.includes("categories" as EntityType)) {
          logger.info("[Admin Reindex] Syncing categories...");
          const categoryResult = await syncCategoriesForReindex(
            query,
            searchService,
            logger,
            clear_before,
            batch_size
          );
          results.categories = categoryResult.indexed;
          errors.push(...categoryResult.errors);
        }

        // Sync marques
        if (shouldSyncAll || entity_types.includes("marques" as EntityType)) {
          logger.info("[Admin Reindex] Syncing marques...");
          const marqueResult = await syncMarquesForReindex(
            query,
            searchService,
            logger,
            clear_before,
            batch_size
          );
          results.marques = marqueResult.indexed;
          errors.push(...marqueResult.errors);
        }

        // Update job status
        const job = activeJobs.get(jobId);
        if (job) {
          job.status = errors.length > 0 ? "failed" : "completed";
          job.completedAt = new Date();
          job.results = results;
          job.errors = errors;
        }

        logger.info(
          `[Admin Reindex] Completed job ${jobId}. ` +
            `Indexed: products=${results.products}, categories=${results.categories}, marques=${results.marques}. ` +
            `Errors: ${errors.length}`
        );

        return { results, errors };
      } catch (error) {
        const job = activeJobs.get(jobId);
        if (job) {
          job.status = "failed";
          job.completedAt = new Date();
          job.errors = [{ entity: "system", id: jobId, error: error instanceof Error ? error.message : "Unknown error" }];
        }
        throw error;
      }
    };

    if (runAsync) {
      // Run async - start job and return immediately
      runReindex().catch((error) => {
        logger.error(`[Admin Reindex] Async job ${jobId} failed:`, error instanceof Error ? error : undefined);
      });

      const response: ReindexResponse = {
        success: true,
        job_id: jobId,
        message: `Reindex job ${jobId} started. Use GET /admin/search/reindex/${jobId} to check status.`,
        estimated_duration_seconds: getEstimatedDuration(entity_types, batch_size),
        timestamp: new Date().toISOString(),
      };

      res.status(202).json(response);
    } else {
      // Run sync - wait for completion
      const startTime = Date.now();
      const { results, errors } = await runReindex();
      const duration = Date.now() - startTime;

      const response: ReindexResponse = {
        success: errors.length === 0,
        job_id: jobId,
        message: `Reindex completed in ${duration}ms`,
        results: {
          products_indexed: results.products,
          categories_indexed: results.categories,
          marques_indexed: results.marques,
          collections_indexed: results.collections,
          total_indexed:
            results.products + results.categories + results.marques + results.collections,
          errors_count: errors.length,
          duration_ms: duration,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    }
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

    logger.error("[Admin Reindex] Error:", error instanceof Error ? error : undefined);

    res.status(500).json({
      success: false,
      error_code: "INTERNAL_ERROR",
      message: "Failed to start reindex operation",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Estimate reindex duration based on entity types and batch size
 */
function getEstimatedDuration(entityTypes: EntityType[], batchSize: number): number {
  const includesAll = entityTypes.includes("all" as EntityType);
  let estimate = 0;

  // Rough estimates: 1 second per 100 documents
  if (includesAll || entityTypes.includes("products" as EntityType)) {
    estimate += 300; // ~30,000 products / 100 batch = 300 batches
  }
  if (includesAll || entityTypes.includes("categories" as EntityType)) {
    estimate += 10; // ~1,000 categories
  }
  if (includesAll || entityTypes.includes("marques" as EntityType)) {
    estimate += 5; // ~500 marques
  }

  // Adjust for batch size
  estimate = estimate * (1000 / batchSize);

  return Math.max(estimate, 10);
}

/**
 * Sync products for reindex
 */
async function syncProductsForReindex(
  query: MedusaQuery,
  searchService: SearchModuleService,
  logger: { info: (msg: string) => void; error: (msg: string, err?: Error) => void },
  clearBefore: boolean,
  batchSize: number
): Promise<{ indexed: number; errors: Array<{ entity: string; id: string; error: string }> }> {
  let indexed = 0;
  const errors: Array<{ entity: string; id: string; error: string }> = [];
  let offset = 0;
  let hasMore = true;

  // Clear index if requested
  if (clearBefore) {
    try {
      await searchService.clearIndex("bijoux_products");
      logger.info("[Admin Reindex] Cleared products index");
    } catch (error) {
      logger.error("[Admin Reindex] Failed to clear products index:", error instanceof Error ? error : undefined);
    }
  }

  while (hasMore) {
    try {
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
          "categories.parent_category.id",
          "categories.parent_category.name",
          "categories.parent_category.handle",
          "categories.parent_category.parent_category.id",
          "categories.parent_category.parent_category.name",
          "categories.parent_category.parent_category.handle",
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
        pagination: {
          take: batchSize,
          skip: offset,
        },
      });

      if (products.length === 0) {
        hasMore = false;
        break;
      }

      // Index products
      await searchService.indexProducts(products as ProductDocument[]);

      indexed += products.length;
      offset += batchSize;

      if (products.length < batchSize) {
        hasMore = false;
      }

      logger.info(`[Admin Reindex] Indexed ${indexed} products...`);
    } catch (error) {
      errors.push({
        entity: "product",
        id: `batch_${offset}`,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      offset += batchSize;

      if (errors.length > 10) {
        logger.error("[Admin Reindex] Too many errors, stopping product reindex");
        break;
      }
    }
  }

  return { indexed, errors };
}

/**
 * Sync categories for reindex
 */
async function syncCategoriesForReindex(
  query: MedusaQuery,
  searchService: SearchModuleService,
  logger: { info: (msg: string) => void; error: (msg: string, err?: Error) => void },
  clearBefore: boolean,
  batchSize: number
): Promise<{ indexed: number; errors: Array<{ entity: string; id: string; error: string }> }> {
  let indexed = 0;
  const errors: Array<{ entity: string; id: string; error: string }> = [];
  let offset = 0;
  let hasMore = true;

  if (clearBefore) {
    try {
      await searchService.clearIndex("bijoux_categories");
      logger.info("[Admin Reindex] Cleared categories index");
    } catch (error) {
      logger.error("[Admin Reindex] Failed to clear categories index:", error instanceof Error ? error : undefined);
    }
  }

  while (hasMore) {
    try {
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
          "parent_category.handle",
          "parent_category.parent_category.id",
          "parent_category.parent_category.name",
          "parent_category.parent_category.handle",
        ],
        pagination: {
          take: batchSize,
          skip: offset,
        },
      });

      if (categories.length === 0) {
        hasMore = false;
        break;
      }

      await searchService.indexCategories(categories as CategoryDocument[]);

      indexed += categories.length;
      offset += batchSize;

      if (categories.length < batchSize) {
        hasMore = false;
      }
    } catch (error) {
      errors.push({
        entity: "category",
        id: `batch_${offset}`,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      offset += batchSize;

      if (errors.length > 5) {
        break;
      }
    }
  }

  return { indexed, errors };
}

/**
 * Sync marques for reindex
 */
async function syncMarquesForReindex(
  query: MedusaQuery,
  searchService: SearchModuleService,
  logger: { info: (msg: string) => void; error: (msg: string, err?: Error) => void },
  clearBefore: boolean,
  batchSize: number
): Promise<{ indexed: number; errors: Array<{ entity: string; id: string; error: string }> }> {
  let indexed = 0;
  const errors: Array<{ entity: string; id: string; error: string }> = [];
  let offset = 0;
  let hasMore = true;

  if (clearBefore) {
    try {
      await searchService.clearIndex("bijoux_marques");
      logger.info("[Admin Reindex] Cleared marques index");
    } catch (error) {
      logger.error("[Admin Reindex] Failed to clear marques index:", error instanceof Error ? error : undefined);
    }
  }

  while (hasMore) {
    try {
      const { data: marques } = await query.graph({
        entity: "marque",
        fields: [
          "id",
          "name",
          "slug",
          "description",
          "country",
          "logo_url",
          "website_url",
          "is_active",
          "rank",
          "created_at",
          "updated_at",
          "metadata",
        ],
        filters: {
          is_active: true,
        },
        pagination: {
          take: batchSize,
          skip: offset,
        },
      });

      if (marques.length === 0) {
        hasMore = false;
        break;
      }

      await searchService.indexMarques(marques as MarqueDocument[]);

      indexed += marques.length;
      offset += batchSize;

      if (marques.length < batchSize) {
        hasMore = false;
      }
    } catch (error) {
      errors.push({
        entity: "marque",
        id: `batch_${offset}`,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      offset += batchSize;

      if (errors.length > 5) {
        break;
      }
    }
  }

  return { indexed, errors };
}

/**
 * GET /admin/search/reindex/:id
 *
 * Get status of a reindex job.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // List all recent jobs
  const jobs = Array.from(activeJobs.values())
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, 20);

  res.status(200).json({
    jobs: jobs.map((job) => ({
      id: job.id,
      status: job.status,
      started_at: job.startedAt.toISOString(),
      completed_at: job.completedAt?.toISOString() || null,
      results: job.results,
      errors_count: job.errors?.length || 0,
    })),
    timestamp: new Date().toISOString(),
  });
}
