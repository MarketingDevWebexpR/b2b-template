/**
 * Search Admin API Types
 *
 * TypeScript interfaces for the search administration dashboard API.
 * These types ensure type safety across routes, services, and frontend.
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const SearchEngineType = {
  APPSEARCH: "appsearch",
} as const;

export type SearchEngineType = (typeof SearchEngineType)[keyof typeof SearchEngineType];

export const SyncStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];

export const SyncType = {
  FULL: "full",
  INCREMENTAL: "incremental",
  ENTITY: "entity",
} as const;

export type SyncType = (typeof SyncType)[keyof typeof SyncType];

export const EntityType = {
  ALL: "all",
  PRODUCTS: "products",
  CATEGORIES: "categories",
  MARQUES: "marques",
  COLLECTIONS: "collections",
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

// =============================================================================
// GET /admin/search/status - Search Health & Engine Info
// =============================================================================

/**
 * Engine health information
 */
export interface EngineHealth {
  /** Engine identifier */
  engine: SearchEngineType;
  /** Whether the engine is reachable and healthy */
  healthy: boolean;
  /** Response time in milliseconds */
  latency_ms: number;
  /** Engine version (if available) */
  version?: string;
  /** Last successful health check */
  last_check_at: string;
  /** Error message if unhealthy */
  error?: string;
}

/**
 * Active engine configuration
 */
export interface EngineConfiguration {
  /** Currently active search engine */
  active_engine: SearchEngineType;
  /** Secondary engine (if dual-write mode) */
  secondary_engine: SearchEngineType | null;
  /** Whether dual-write mode is enabled */
  dual_write_enabled: boolean;
  /** App Search traffic percentage (0-100) for A/B testing */
  appsearch_traffic_percentage?: number;
  /** Timestamp of last engine switch */
  last_switch_at: string | null;
  /** User who performed last switch */
  last_switch_by: string | null;
}

/**
 * GET /admin/search/status Response
 */
export interface SearchStatusResponse {
  /** Overall system status: "healthy" | "degraded" | "unhealthy" */
  status: "healthy" | "degraded" | "unhealthy";
  /** Current engine configuration */
  configuration: EngineConfiguration;
  /** Health status of each configured engine */
  engines: {
    appsearch: EngineHealth;
  };
  /** Summary of last sync operation */
  last_sync: {
    id: string;
    status: SyncStatus;
    completed_at: string | null;
    documents_processed: number;
  } | null;
  /** Current timestamp */
  timestamp: string;
}

// =============================================================================
// GET /admin/search/sync-reports - Sync History
// =============================================================================

/**
 * Query parameters for sync reports list
 */
export interface ListSyncReportsQuery {
  /** Filter by status */
  status?: SyncStatus;
  /** Filter by engine */
  engine?: SearchEngineType;
  /** Filter by entity type */
  entity_type?: EntityType;
  /** Start date filter (ISO string) */
  from_date?: string;
  /** End date filter (ISO string) */
  to_date?: string;
  /** Number of results per page (default: 20, max: 100) */
  limit?: number;
  /** Pagination offset (default: 0) */
  offset?: number;
  /** Sort order: "asc" | "desc" (default: "desc") */
  order?: "asc" | "desc";
}

/**
 * Individual sync report record
 */
export interface SyncReport {
  id: string;
  sync_type: SyncType;
  entity_type: EntityType;
  status: SyncStatus;
  engine: SearchEngineType;
  triggered_by: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  documents_processed: number;
  documents_failed: number;
  results: Record<string, { count: number; success: boolean; error?: string }> | null;
  error_message: string | null;
  created_at: string;
}

/**
 * GET /admin/search/sync-reports Response
 */
export interface ListSyncReportsResponse {
  reports: SyncReport[];
  count: number;
  limit: number;
  offset: number;
}

// =============================================================================
// POST /admin/search/reindex - Trigger Reindex
// =============================================================================

/**
 * POST /admin/search/reindex Request Body
 */
export interface ReindexRequest {
  /** Type of reindex: "full" (clear + reindex) or "incremental" (add/update) */
  sync_type?: SyncType;
  /** Which entities to reindex (default: "all") */
  entity_types?: EntityType[];
  /** Target engine (default: active engine, "both" for dual-write) */
  target_engine?: SearchEngineType | "both";
  /** Clear existing index before reindexing (only for "full" sync) */
  clear_before?: boolean;
  /** Run asynchronously (default: true for large datasets) */
  async?: boolean;
  /** Batch size for indexing (default: 1000) */
  batch_size?: number;
}

/**
 * POST /admin/search/reindex Response (Async)
 */
export interface ReindexAsyncResponse {
  /** Sync report ID for tracking */
  sync_report_id: string;
  /** Status of the initiated job */
  status: "accepted";
  /** Message confirming job initiation */
  message: string;
  /** Estimated duration (if calculable) */
  estimated_duration_ms?: number;
  /** URL to poll for status */
  status_url: string;
}

/**
 * POST /admin/search/reindex Response (Sync - small datasets)
 */
export interface ReindexSyncResponse {
  /** Sync report ID */
  sync_report_id: string;
  /** Final status */
  status: "completed" | "failed";
  /** Results per entity type */
  results: Record<string, { count: number; success: boolean; error?: string }>;
  /** Total documents processed */
  documents_processed: number;
  /** Total documents failed */
  documents_failed: number;
  /** Duration in milliseconds */
  duration_ms: number;
  /** Timestamp */
  timestamp: string;
}

/**
 * POST /admin/search/reindex Response (Unified)
 * Used for both async and sync responses
 */
export interface ReindexResponse {
  /** Operation status */
  success: boolean;
  /** Job ID for tracking */
  job_id: string;
  /** Status message */
  message: string;
  /** Estimated duration in seconds (async only) */
  estimated_duration_seconds?: number;
  /** Results (sync only) */
  results?: {
    products_indexed: number;
    categories_indexed: number;
    marques_indexed: number;
    collections_indexed: number;
    total_indexed: number;
    errors_count: number;
    duration_ms: number;
  };
  /** Timestamp */
  timestamp: string;
}

// =============================================================================
// PUT /admin/search/engine - Switch Engine
// =============================================================================

/**
 * PUT /admin/search/engine Request Body
 */
export interface SwitchEngineRequest {
  /** New primary engine */
  active_engine: SearchEngineType;
  /** Enable dual-write mode */
  dual_write_enabled?: boolean;
  /** Secondary engine for dual-write (required if dual_write_enabled is true) */
  secondary_engine?: SearchEngineType;
  /** App Search traffic percentage (0-100) for gradual rollout */
  appsearch_traffic_percentage?: number;
  /** Run data migration to new engine (optional, time-consuming) */
  migrate_data?: boolean;
  /** Confirmation token (required for production safety) */
  confirmation_token?: string;
}

/**
 * PUT /admin/search/engine Response
 */
export interface SwitchEngineResponse {
  /** Operation status */
  success: boolean;
  /** Updated configuration */
  configuration: EngineConfiguration;
  /** Migration job ID (if migrate_data was true) */
  migration_job_id?: string;
  /** Warning messages */
  warnings?: string[];
  /** Timestamp */
  timestamp: string;
}

// =============================================================================
// GET /admin/search/stats - Index Statistics
// =============================================================================

/**
 * Statistics for a single index
 */
export interface IndexStats {
  /** Index name */
  name: string;
  /** Number of documents in the index */
  document_count: number;
  /** Whether indexing is currently in progress */
  is_indexing: boolean;
  /** Index size in bytes (if available) */
  size_bytes?: number;
  /** Field distribution (count per field) */
  field_distribution?: Record<string, number>;
  /** Last updated timestamp */
  last_updated_at?: string;
}

/**
 * Engine-level statistics
 */
export interface EngineStats {
  /** Engine identifier */
  engine: SearchEngineType;
  /** Whether stats are available */
  available: boolean;
  /** Total documents across all indexes */
  total_documents: number;
  /** Statistics per index */
  indexes: {
    products: IndexStats;
    categories: IndexStats;
    marques: IndexStats;
    collections?: IndexStats;
  };
  /** Last successful sync */
  last_sync?: {
    id: string;
    completed_at: string;
    documents_processed: number;
  };
}

/**
 * Sync statistics summary
 */
export interface SyncStatistics {
  /** Total sync operations (all time) */
  total_syncs: number;
  /** Successful syncs in last 24 hours */
  successful_last_24h: number;
  /** Failed syncs in last 24 hours */
  failed_last_24h: number;
  /** Average sync duration (last 10 syncs) */
  avg_duration_ms: number;
  /** Total documents synced (last 24 hours) */
  documents_synced_24h: number;
}

/**
 * GET /admin/search/stats Response
 */
export interface SearchStatsResponse {
  /** Statistics for each configured engine */
  engines: {
    appsearch: EngineStats;
  };
  /** Active engine indicator */
  active_engine: SearchEngineType;
  /** Sync operation statistics */
  sync_stats: SyncStatistics;
  /** Timestamp */
  timestamp: string;
}

// =============================================================================
// ERROR RESPONSES
// =============================================================================

/**
 * Standard error response structure
 */
export interface SearchAdminErrorResponse {
  /** Error status */
  success: false;
  /** Error code for programmatic handling */
  error_code: string;
  /** Human-readable error message */
  message: string;
  /** Detailed error information */
  details?: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
}

// Error codes
export const SearchAdminErrorCodes = {
  ENGINE_UNAVAILABLE: "SEARCH_ENGINE_UNAVAILABLE",
  REINDEX_IN_PROGRESS: "REINDEX_ALREADY_IN_PROGRESS",
  INVALID_ENGINE: "INVALID_ENGINE_TYPE",
  MIGRATION_FAILED: "ENGINE_MIGRATION_FAILED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SYNC_REPORT_NOT_FOUND: "SYNC_REPORT_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
