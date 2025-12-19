/**
 * Search Admin API Validators
 *
 * Zod schemas for request validation.
 */

import { z } from "zod";

// =============================================================================
// SHARED SCHEMAS
// =============================================================================

export const SearchEngineTypeSchema = z.enum(["meilisearch", "appsearch"]);

export const SyncStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

export const SyncTypeSchema = z.enum(["full", "incremental", "entity"]);

export const EntityTypeSchema = z.enum([
  "all",
  "products",
  "categories",
  "marques",
  "collections",
]);

// =============================================================================
// GET /admin/search/sync-reports Query Validation
// =============================================================================

export const ListSyncReportsQuerySchema = z.object({
  status: SyncStatusSchema.optional(),
  engine: SearchEngineTypeSchema.optional(),
  entity_type: EntityTypeSchema.optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional()
    .default("20"),
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0))
    .optional()
    .default("0"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListSyncReportsQueryInput = z.input<typeof ListSyncReportsQuerySchema>;

// =============================================================================
// POST /admin/search/reindex Body Validation
// =============================================================================

export const ReindexRequestSchema = z
  .object({
    sync_type: SyncTypeSchema.optional().default("full"),
    entity_types: z.array(EntityTypeSchema).optional().default(["all"]),
    target_engine: z
      .union([SearchEngineTypeSchema, z.literal("both")])
      .optional(),
    clear_before: z.boolean().optional().default(true),
    async: z.boolean().optional().default(true),
    batch_size: z.number().min(100).max(5000).optional().default(1000),
  })
  .refine(
    (data) => {
      // If sync_type is incremental, clear_before must be false
      if (data.sync_type === "incremental" && data.clear_before) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot clear index with incremental sync type",
      path: ["clear_before"],
    }
  );

export type ReindexRequestInput = z.infer<typeof ReindexRequestSchema>;

// =============================================================================
// PUT /admin/search/engine Body Validation
// =============================================================================

export const SwitchEngineRequestSchema = z
  .object({
    active_engine: SearchEngineTypeSchema,
    dual_write_enabled: z.boolean().optional().default(false),
    secondary_engine: SearchEngineTypeSchema.optional(),
    appsearch_traffic_percentage: z.number().min(0).max(100).optional(),
    migrate_data: z.boolean().optional().default(false),
    confirmation_token: z.string().optional(),
  })
  .refine(
    (data) => {
      // If dual_write is enabled, secondary_engine is required
      if (data.dual_write_enabled && !data.secondary_engine) {
        return false;
      }
      return true;
    },
    {
      message: "secondary_engine is required when dual_write_enabled is true",
      path: ["secondary_engine"],
    }
  )
  .refine(
    (data) => {
      // active_engine and secondary_engine must be different
      if (
        data.dual_write_enabled &&
        data.active_engine === data.secondary_engine
      ) {
        return false;
      }
      return true;
    },
    {
      message: "active_engine and secondary_engine must be different",
      path: ["secondary_engine"],
    }
  );

export type SwitchEngineRequestInput = z.infer<typeof SwitchEngineRequestSchema>;

// =============================================================================
// VALIDATION HELPER
// =============================================================================

/**
 * Validates request data against a Zod schema.
 * Returns parsed data or throws with detailed validation errors.
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    const error = new Error("Validation failed") as Error & {
      type: string;
      details: typeof errors
    };
    error.type = "invalid_data";
    error.details = errors;
    throw error;
  }

  return result.data;
}
