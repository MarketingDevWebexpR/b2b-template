/**
 * Bridge Sync Service
 *
 * Handles data synchronization between external ERP/systems and the e-commerce platform.
 */

import type { BaseApiClient } from "@maison/api-core";

/**
 * Sync job status
 */
export type SyncJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Sync entity types
 */
export type SyncEntityType =
  | "products"
  | "inventory"
  | "prices"
  | "customers"
  | "orders"
  | "categories";

/**
 * Sync job details
 */
export interface SyncJob {
  id: string;
  entity_type: SyncEntityType;
  direction: "import" | "export" | "bidirectional";
  status: SyncJobStatus;
  progress: number;
  total_items: number;
  processed_items: number;
  failed_items: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sync log entry
 */
export interface SyncLogEntry {
  id: string;
  job_id: string;
  level: "info" | "warning" | "error";
  message: string;
  entity_type?: SyncEntityType;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  entity_type: SyncEntityType;
  enabled: boolean;
  schedule?: string; // cron expression
  last_sync?: string;
  next_sync?: string;
  options?: {
    full_sync?: boolean;
    batch_size?: number;
    conflict_resolution?: "source" | "target" | "newest" | "manual";
    filters?: Record<string, unknown>;
  };
}

/**
 * Webhook event for sync notifications
 */
export interface SyncWebhookEvent {
  event: "sync.started" | "sync.completed" | "sync.failed" | "sync.progress";
  job_id: string;
  entity_type: SyncEntityType;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * Bridge Sync Service
 *
 * Manages data synchronization between external systems and the platform.
 *
 * @example
 * ```typescript
 * const sync = new BridgeSyncService(httpClient);
 *
 * // Start a product sync
 * const job = await sync.startSync('products', {
 *   full_sync: false,
 *   batch_size: 100
 * });
 *
 * // Check sync status
 * const status = await sync.getJobStatus(job.id);
 * ```
 */
export class BridgeSyncService {
  constructor(private readonly client: BaseApiClient) {}

  // ==========================================
  // Sync Jobs
  // ==========================================

  /**
   * Start a new sync job
   */
  async startSync(
    entityType: SyncEntityType,
    options?: {
      full_sync?: boolean;
      batch_size?: number;
      filters?: Record<string, unknown>;
      direction?: "import" | "export" | "bidirectional";
    }
  ): Promise<SyncJob> {
    const response = await this.client.post<{ data: SyncJob }>(
      "/sync/jobs",
      {
        entity_type: entityType,
        direction: options?.direction ?? "import",
        options,
      }
    );
    return response.data.data;
  }

  /**
   * Get sync job status
   */
  async getJobStatus(jobId: string): Promise<SyncJob> {
    const response = await this.client.get<{ data: SyncJob }>(
      `/sync/jobs/${jobId}`
    );
    return response.data.data;
  }

  /**
   * List sync jobs with optional filtering
   */
  async listJobs(options?: {
    entity_type?: SyncEntityType;
    status?: SyncJobStatus;
    page?: number;
    per_page?: number;
  }): Promise<{
    items: SyncJob[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.entity_type) params.set("entity_type", options.entity_type);
    if (options?.status) params.set("status", options.status);
    if (options?.page) params.set("page", String(options.page));
    if (options?.per_page) params.set("per_page", String(options.per_page));

    const response = await this.client.get<{
      data: SyncJob[];
      meta: { total: number; current_page: number; per_page: number };
    }>(`/sync/jobs?${params.toString()}`);

    return {
      items: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.current_page,
      per_page: response.data.meta.per_page,
    };
  }

  /**
   * Cancel a running sync job
   */
  async cancelJob(jobId: string): Promise<SyncJob> {
    const response = await this.client.post<{ data: SyncJob }>(
      `/sync/jobs/${jobId}/cancel`
    );
    return response.data.data;
  }

  /**
   * Retry a failed sync job
   */
  async retryJob(jobId: string): Promise<SyncJob> {
    const response = await this.client.post<{ data: SyncJob }>(
      `/sync/jobs/${jobId}/retry`
    );
    return response.data.data;
  }

  // ==========================================
  // Sync Logs
  // ==========================================

  /**
   * Get logs for a sync job
   */
  async getJobLogs(
    jobId: string,
    options?: {
      level?: "info" | "warning" | "error";
      page?: number;
      per_page?: number;
    }
  ): Promise<{
    items: SyncLogEntry[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.level) params.set("level", options.level);
    if (options?.page) params.set("page", String(options.page));
    if (options?.per_page) params.set("per_page", String(options.per_page));

    const response = await this.client.get<{
      data: SyncLogEntry[];
      meta: { total: number; current_page: number; per_page: number };
    }>(`/sync/jobs/${jobId}/logs?${params.toString()}`);

    return {
      items: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.current_page,
      per_page: response.data.meta.per_page,
    };
  }

  /**
   * Get errors for a sync job
   */
  async getJobErrors(jobId: string): Promise<SyncLogEntry[]> {
    const result = await this.getJobLogs(jobId, { level: "error", per_page: 1000 });
    return result.items;
  }

  // ==========================================
  // Sync Configuration
  // ==========================================

  /**
   * Get sync configuration for an entity type
   */
  async getConfig(entityType: SyncEntityType): Promise<SyncConfig> {
    const response = await this.client.get<{ data: SyncConfig }>(
      `/sync/config/${entityType}`
    );
    return response.data.data;
  }

  /**
   * List all sync configurations
   */
  async listConfigs(): Promise<SyncConfig[]> {
    const response = await this.client.get<{ data: SyncConfig[] }>("/sync/config");
    return response.data.data;
  }

  /**
   * Update sync configuration
   */
  async updateConfig(
    entityType: SyncEntityType,
    config: Partial<Omit<SyncConfig, "entity_type" | "last_sync" | "next_sync">>
  ): Promise<SyncConfig> {
    const response = await this.client.put<{ data: SyncConfig }>(
      `/sync/config/${entityType}`,
      config
    );
    return response.data.data;
  }

  // ==========================================
  // Quick Sync Operations
  // ==========================================

  /**
   * Sync a specific product by ID or SKU
   */
  async syncProduct(identifier: string, by: "id" | "sku" = "id"): Promise<{
    success: boolean;
    product_id?: string;
    error?: string;
  }> {
    const response = await this.client.post<{
      data: { success: boolean; product_id?: string; error?: string };
    }>("/sync/product", { identifier, by });
    return response.data.data;
  }

  /**
   * Sync multiple products
   */
  async syncProducts(
    identifiers: string[],
    by: "id" | "sku" = "id"
  ): Promise<
    Array<{
      identifier: string;
      success: boolean;
      product_id?: string;
      error?: string;
    }>
  > {
    const response = await this.client.post<{
      data: Array<{
        identifier: string;
        success: boolean;
        product_id?: string;
        error?: string;
      }>;
    }>("/sync/products", { identifiers, by });
    return response.data.data;
  }

  /**
   * Sync inventory for specific SKUs
   */
  async syncInventory(skus?: string[]): Promise<SyncJob> {
    const response = await this.client.post<{ data: SyncJob }>(
      "/sync/inventory",
      { skus }
    );
    return response.data.data;
  }

  /**
   * Sync prices for specific products
   */
  async syncPrices(productIds?: string[]): Promise<SyncJob> {
    const response = await this.client.post<{ data: SyncJob }>(
      "/sync/prices",
      { product_ids: productIds }
    );
    return response.data.data;
  }

  // ==========================================
  // Webhooks
  // ==========================================

  /**
   * Register a webhook for sync events
   */
  async registerWebhook(
    url: string,
    events: SyncWebhookEvent["event"][],
    secret?: string
  ): Promise<{ webhook_id: string }> {
    const response = await this.client.post<{ data: { webhook_id: string } }>(
      "/sync/webhooks",
      { url, events, secret }
    );
    return response.data.data;
  }

  /**
   * List registered webhooks
   */
  async listWebhooks(): Promise<
    Array<{
      id: string;
      url: string;
      events: SyncWebhookEvent["event"][];
      active: boolean;
      created_at: string;
    }>
  > {
    const response = await this.client.get<{
      data: Array<{
        id: string;
        url: string;
        events: SyncWebhookEvent["event"][];
        active: boolean;
        created_at: string;
      }>;
    }>("/sync/webhooks");
    return response.data.data;
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.client.delete(`/sync/webhooks/${webhookId}`);
  }

  // ==========================================
  // Health & Stats
  // ==========================================

  /**
   * Get overall sync health status
   */
  async getHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    last_successful_sync?: string;
    pending_jobs: number;
    failed_jobs_24h: number;
    entities: Array<{
      type: SyncEntityType;
      status: "synced" | "pending" | "error";
      last_sync?: string;
      error_count: number;
    }>;
  }> {
    const response = await this.client.get<{
      data: {
        status: "healthy" | "degraded" | "unhealthy";
        last_successful_sync?: string;
        pending_jobs: number;
        failed_jobs_24h: number;
        entities: Array<{
          type: SyncEntityType;
          status: "synced" | "pending" | "error";
          last_sync?: string;
          error_count: number;
        }>;
      };
    }>("/sync/health");
    return response.data.data;
  }

  /**
   * Get sync statistics
   */
  async getStats(options?: {
    period?: "day" | "week" | "month";
    entity_type?: SyncEntityType;
  }): Promise<{
    total_jobs: number;
    successful_jobs: number;
    failed_jobs: number;
    total_items_synced: number;
    average_duration_seconds: number;
    by_entity: Record<
      SyncEntityType,
      {
        jobs: number;
        items: number;
        errors: number;
      }
    >;
  }> {
    const params = new URLSearchParams();
    if (options?.period) params.set("period", options.period);
    if (options?.entity_type) params.set("entity_type", options.entity_type);

    const response = await this.client.get<{
      data: {
        total_jobs: number;
        successful_jobs: number;
        failed_jobs: number;
        total_items_synced: number;
        average_duration_seconds: number;
        by_entity: Record<
          SyncEntityType,
          {
            jobs: number;
            items: number;
            errors: number;
          }
        >;
      };
    }>(`/sync/stats?${params.toString()}`);
    return response.data.data;
  }
}
