/**
 * Admin Search Reindex Job Status API Route
 *
 * GET /admin/search/reindex/:jobId
 *
 * Returns status of a specific reindex job.
 *
 * @admin
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// In-memory job tracking (should be in database for production)
// This would be shared with the parent route in a real implementation
interface ReindexJob {
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
}

// This would be imported from a shared store in production
declare global {
  // eslint-disable-next-line no-var
  var __reindexJobs: Map<string, ReindexJob> | undefined;
}

if (!globalThis.__reindexJobs) {
  globalThis.__reindexJobs = new Map();
}

const activeJobs = globalThis.__reindexJobs;

/**
 * GET /admin/search/reindex/:jobId
 *
 * Get status of a specific reindex job.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { jobId } = req.params;

  const job = activeJobs.get(jobId);

  if (!job) {
    res.status(404).json({
      success: false,
      error_code: "JOB_NOT_FOUND",
      message: `Reindex job ${jobId} not found. It may have expired or never existed.`,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(200).json({
    id: job.id,
    status: job.status,
    started_at: job.startedAt.toISOString(),
    completed_at: job.completedAt?.toISOString() || null,
    results: job.results
      ? {
          products_indexed: job.results.products,
          categories_indexed: job.results.categories,
          marques_indexed: job.results.marques,
          collections_indexed: job.results.collections,
          total_indexed:
            job.results.products +
            job.results.categories +
            job.results.marques +
            job.results.collections,
        }
      : null,
    errors: job.errors || [],
    errors_count: job.errors?.length || 0,
    duration_ms: job.completedAt
      ? job.completedAt.getTime() - job.startedAt.getTime()
      : Date.now() - job.startedAt.getTime(),
    timestamp: new Date().toISOString(),
  });
}
