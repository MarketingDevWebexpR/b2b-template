import { ICommerceClient, ApiProvider, CommerceClientConfig, IProductService, ICategoryService, ICartService, IOrderService, ICustomerService, IB2BServices, ListProductsOptions, GetProductOptions, ProductWithRelated, ProductSearchResult, ProductInventory } from '@maison/api-client';
import { BaseApiClient, PaginatedResponse } from '@maison/api-core';
import { Product, Category } from '@maison/types';

/**
 * Bridge Inventory Service
 *
 * Provides real-time inventory operations via Laravel Bridge API.
 * This service is specific to Bridge adapter and not part of ICommerceClient.
 */

/**
 * Inventory item from Bridge API
 */
interface BridgeInventoryItem {
    sku: string;
    product_id?: string;
    variant_id?: string;
    quantity: number;
    reserved?: number;
    available: number;
    location?: string;
    warehouse_id?: string;
    last_updated: string;
    low_stock_threshold?: number;
    is_low_stock?: boolean;
    reorder_point?: number;
    expected_restock_date?: string | null;
}
/**
 * Inventory update request
 */
interface InventoryUpdateRequest {
    sku: string;
    quantity: number;
    adjustment_type: "set" | "increment" | "decrement";
    reason?: string;
    location?: string;
}
/**
 * Inventory reservation request
 */
interface InventoryReservation {
    sku: string;
    quantity: number;
    reference_type: "cart" | "order" | "quote";
    reference_id: string;
    expires_at?: string;
}
/**
 * Inventory sync status
 */
interface InventorySyncStatus {
    last_sync: string;
    status: "synced" | "pending" | "error";
    items_synced: number;
    items_failed: number;
    next_sync?: string;
    errors?: Array<{
        sku: string;
        message: string;
    }>;
}
/**
 * Bridge Inventory Service
 *
 * Provides real-time inventory management for B2B operations.
 *
 * @example
 * ```typescript
 * const inventory = new BridgeInventoryService(httpClient);
 *
 * // Check stock for multiple SKUs
 * const stock = await inventory.checkStock(['SKU001', 'SKU002']);
 *
 * // Reserve inventory for a cart
 * await inventory.reserve({
 *   sku: 'SKU001',
 *   quantity: 5,
 *   reference_type: 'cart',
 *   reference_id: 'cart_123'
 * });
 * ```
 */
declare class BridgeInventoryService {
    private readonly client;
    constructor(client: BaseApiClient);
    /**
     * Get inventory for a single SKU
     */
    getBySku(sku: string): Promise<BridgeInventoryItem>;
    /**
     * Check stock for multiple SKUs
     */
    checkStock(skus: string[]): Promise<BridgeInventoryItem[]>;
    /**
     * Check if specific quantities are available
     */
    checkAvailability(items: Array<{
        sku: string;
        quantity: number;
    }>): Promise<Array<{
        sku: string;
        requested: number;
        available: number;
        is_available: boolean;
    }>>;
    /**
     * Reserve inventory for a cart, order, or quote
     */
    reserve(reservation: InventoryReservation): Promise<{
        reservation_id: string;
        sku: string;
        quantity: number;
        expires_at: string;
    }>;
    /**
     * Reserve inventory for multiple items
     */
    reserveMany(reservations: InventoryReservation[]): Promise<Array<{
        reservation_id: string;
        sku: string;
        quantity: number;
        expires_at: string;
        success: boolean;
        error?: string;
    }>>;
    /**
     * Release a reservation
     */
    releaseReservation(reservationId: string): Promise<void>;
    /**
     * Release all reservations for a reference (cart/order/quote)
     */
    releaseByReference(referenceType: "cart" | "order" | "quote", referenceId: string): Promise<{
        released_count: number;
    }>;
    /**
     * Confirm reservation (convert to actual stock deduction)
     */
    confirmReservation(reservationId: string): Promise<void>;
    /**
     * Update inventory (admin operation)
     */
    update(request: InventoryUpdateRequest): Promise<BridgeInventoryItem>;
    /**
     * Batch update inventory (admin operation)
     */
    updateMany(updates: InventoryUpdateRequest[]): Promise<Array<BridgeInventoryItem & {
        success: boolean;
        error?: string;
    }>>;
    /**
     * Get low stock items
     */
    getLowStock(options?: {
        threshold?: number;
        warehouse_id?: string;
        page?: number;
        per_page?: number;
    }): Promise<{
        items: BridgeInventoryItem[];
        total: number;
        page: number;
        per_page: number;
    }>;
    /**
     * Get sync status
     */
    getSyncStatus(): Promise<InventorySyncStatus>;
    /**
     * Trigger manual sync (admin operation)
     */
    triggerSync(options?: {
        full?: boolean;
        skus?: string[];
    }): Promise<{
        job_id: string;
        status: string;
    }>;
}

/**
 * Bridge Sync Service
 *
 * Handles data synchronization between external ERP/systems and the e-commerce platform.
 */

/**
 * Sync job status
 */
type SyncJobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
/**
 * Sync entity types
 */
type SyncEntityType = "products" | "inventory" | "prices" | "customers" | "orders" | "categories";
/**
 * Sync job details
 */
interface SyncJob {
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
interface SyncLogEntry {
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
interface SyncConfig {
    entity_type: SyncEntityType;
    enabled: boolean;
    schedule?: string;
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
interface SyncWebhookEvent {
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
declare class BridgeSyncService {
    private readonly client;
    constructor(client: BaseApiClient);
    /**
     * Start a new sync job
     */
    startSync(entityType: SyncEntityType, options?: {
        full_sync?: boolean;
        batch_size?: number;
        filters?: Record<string, unknown>;
        direction?: "import" | "export" | "bidirectional";
    }): Promise<SyncJob>;
    /**
     * Get sync job status
     */
    getJobStatus(jobId: string): Promise<SyncJob>;
    /**
     * List sync jobs with optional filtering
     */
    listJobs(options?: {
        entity_type?: SyncEntityType;
        status?: SyncJobStatus;
        page?: number;
        per_page?: number;
    }): Promise<{
        items: SyncJob[];
        total: number;
        page: number;
        per_page: number;
    }>;
    /**
     * Cancel a running sync job
     */
    cancelJob(jobId: string): Promise<SyncJob>;
    /**
     * Retry a failed sync job
     */
    retryJob(jobId: string): Promise<SyncJob>;
    /**
     * Get logs for a sync job
     */
    getJobLogs(jobId: string, options?: {
        level?: "info" | "warning" | "error";
        page?: number;
        per_page?: number;
    }): Promise<{
        items: SyncLogEntry[];
        total: number;
        page: number;
        per_page: number;
    }>;
    /**
     * Get errors for a sync job
     */
    getJobErrors(jobId: string): Promise<SyncLogEntry[]>;
    /**
     * Get sync configuration for an entity type
     */
    getConfig(entityType: SyncEntityType): Promise<SyncConfig>;
    /**
     * List all sync configurations
     */
    listConfigs(): Promise<SyncConfig[]>;
    /**
     * Update sync configuration
     */
    updateConfig(entityType: SyncEntityType, config: Partial<Omit<SyncConfig, "entity_type" | "last_sync" | "next_sync">>): Promise<SyncConfig>;
    /**
     * Sync a specific product by ID or SKU
     */
    syncProduct(identifier: string, by?: "id" | "sku"): Promise<{
        success: boolean;
        product_id?: string;
        error?: string;
    }>;
    /**
     * Sync multiple products
     */
    syncProducts(identifiers: string[], by?: "id" | "sku"): Promise<Array<{
        identifier: string;
        success: boolean;
        product_id?: string;
        error?: string;
    }>>;
    /**
     * Sync inventory for specific SKUs
     */
    syncInventory(skus?: string[]): Promise<SyncJob>;
    /**
     * Sync prices for specific products
     */
    syncPrices(productIds?: string[]): Promise<SyncJob>;
    /**
     * Register a webhook for sync events
     */
    registerWebhook(url: string, events: SyncWebhookEvent["event"][], secret?: string): Promise<{
        webhook_id: string;
    }>;
    /**
     * List registered webhooks
     */
    listWebhooks(): Promise<Array<{
        id: string;
        url: string;
        events: SyncWebhookEvent["event"][];
        active: boolean;
        created_at: string;
    }>>;
    /**
     * Delete a webhook
     */
    deleteWebhook(webhookId: string): Promise<void>;
    /**
     * Get overall sync health status
     */
    getHealth(): Promise<{
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
    }>;
    /**
     * Get sync statistics
     */
    getStats(options?: {
        period?: "day" | "week" | "month";
        entity_type?: SyncEntityType;
    }): Promise<{
        total_jobs: number;
        successful_jobs: number;
        failed_jobs: number;
        total_items_synced: number;
        average_duration_seconds: number;
        by_entity: Record<SyncEntityType, {
            jobs: number;
            items: number;
            errors: number;
        }>;
    }>;
}

/**
 * Bridge Commerce Client
 *
 * Full implementation of ICommerceClient for Laravel Bridge backend.
 * Primarily used for inventory sync and product data from external ERP systems.
 */

/**
 * Bridge-specific configuration options
 */
interface BridgeConfig extends CommerceClientConfig {
    /** API key for Bridge authentication */
    apiKey?: string;
    /** Tenant/store identifier for multi-tenant setups */
    tenantId?: string;
    /** Currency code (default: EUR) */
    currency?: string;
    /** Enable inventory sync features */
    enableInventorySync?: boolean;
    /** Enable full sync service */
    enableSyncService?: boolean;
}
/**
 * Bridge Commerce Client implementation.
 *
 * Provides ICommerceClient interface for Laravel Bridge backend.
 * This adapter is specialized for:
 * - Product catalog sync from external ERP/PIM systems
 * - Real-time inventory management
 * - Price sync with external systems
 *
 * @example
 * ```typescript
 * const client = new BridgeCommerceClient({
 *   baseUrl: "https://bridge.example.com/api",
 *   apiKey: "your-api-key",
 *   currency: "EUR",
 *   enableInventorySync: true
 * });
 *
 * // Get products from bridge
 * const products = await client.products.list({ pageSize: 20 });
 *
 * // Check inventory (bridge-specific)
 * const stock = await client.inventory.checkStock(['SKU001', 'SKU002']);
 *
 * // Start a sync job
 * const job = await client.sync.startSync('products');
 * ```
 */
declare class BridgeCommerceClient implements ICommerceClient {
    readonly name = "bridge";
    readonly version = "1.0";
    readonly provider: ApiProvider;
    readonly config: CommerceClientConfig;
    private readonly httpClient;
    private readonly bridgeConfig;
    private authToken;
    private b2bContext;
    private initialized;
    private _products;
    private _categories;
    private _cart;
    private _orders;
    private _customers;
    private _b2b;
    private _inventory;
    private _sync;
    constructor(config: BridgeConfig);
    initialize(): Promise<void>;
    isConfigured(): boolean;
    healthCheck(): Promise<boolean>;
    get products(): IProductService;
    get categories(): ICategoryService;
    get cart(): ICartService;
    get orders(): IOrderService;
    get customers(): ICustomerService;
    get b2b(): IB2BServices | null;
    /**
     * Get inventory service for real-time stock management.
     * This is a Bridge-specific feature not part of ICommerceClient.
     */
    get inventory(): BridgeInventoryService;
    /**
     * Get sync service for data synchronization.
     * This is a Bridge-specific feature not part of ICommerceClient.
     */
    get sync(): BridgeSyncService;
    setAuthToken(token: string): void;
    clearAuth(): void;
    getAuthToken(): string | null;
    setB2BContext(companyId: string, employeeId?: string): void;
    clearB2BContext(): void;
    getB2BContext(): {
        companyId?: string;
        employeeId?: string;
    } | null;
    isB2BEnabled(): boolean;
    getHttpClient(): {
        get: <T>(path: string, options?: Record<string, unknown>) => Promise<T>;
        post: <T>(path: string, body?: unknown, options?: Record<string, unknown>) => Promise<T>;
        put: <T>(path: string, body?: unknown, options?: Record<string, unknown>) => Promise<T>;
        patch: <T>(path: string, body?: unknown, options?: Record<string, unknown>) => Promise<T>;
        delete: <T>(path: string, options?: Record<string, unknown>) => Promise<T>;
    };
    private createStubCategoryService;
    private createStubCartService;
    private createStubOrderService;
    private createStubCustomerService;
    private createStubB2BServices;
}
/**
 * Create a Bridge commerce client.
 *
 * @param config - Client configuration
 * @returns Bridge commerce client
 *
 * @example
 * ```typescript
 * const client = createBridgeClient({
 *   baseUrl: "https://bridge.example.com/api",
 *   apiKey: "your-api-key",
 *   currency: "EUR"
 * });
 *
 * // Check product inventory
 * const stock = await client.inventory.checkStock(['SKU001']);
 * ```
 */
declare function createBridgeClient(config: BridgeConfig): BridgeCommerceClient;

/**
 * Bridge Product Service
 *
 * Implements IProductService for Laravel Bridge backend.
 */

/**
 * Bridge Product Service implementation.
 *
 * Provides product operations via Laravel Bridge API.
 *
 * @example
 * ```typescript
 * const service = new BridgeProductService(httpClient, 'EUR');
 * const products = await service.list({ pageSize: 20 });
 * const product = await service.get('prod-123');
 * ```
 */
declare class BridgeProductService implements IProductService {
    private readonly client;
    private readonly currency;
    constructor(client: BaseApiClient, currency?: string);
    /**
     * List products with optional filtering and pagination.
     */
    list(options?: ListProductsOptions): Promise<PaginatedResponse<Product>>;
    /**
     * Get a single product by ID.
     */
    get(id: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get a product by slug/handle.
     */
    getBySlug(slug: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get a product by SKU.
     */
    getBySku(sku: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get multiple products by IDs.
     */
    getMany(ids: string[]): Promise<Product[]>;
    /**
     * Search products by query string.
     */
    search(query: string, options?: ListProductsOptions): Promise<ProductSearchResult>;
    /**
     * Get products by category ID.
     */
    getByCategory(categoryId: string, options?: Omit<ListProductsOptions, "categoryId">): Promise<PaginatedResponse<Product>>;
    /**
     * Get featured products.
     */
    getFeatured(limit?: number): Promise<Product[]>;
    /**
     * Get new products.
     */
    getNew(limit?: number, daysBack?: number): Promise<Product[]>;
    /**
     * Get product inventory information.
     */
    getInventory(productId: string): Promise<ProductInventory>;
    /**
     * Get inventory for multiple products.
     */
    getInventoryBulk(productIds: string[]): Promise<Map<string, ProductInventory>>;
}

/**
 * Product mappers for Laravel Bridge API responses
 *
 * Maps Laravel Bridge API product format to domain Product type.
 */

/**
 * Laravel Bridge raw product structure
 */
interface BridgeRawProduct {
    id: string | number;
    sku: string;
    name: string;
    name_en?: string;
    slug?: string;
    description?: string;
    short_description?: string;
    price: number | string;
    sale_price?: number | string | null;
    currency?: string;
    is_price_ttc?: boolean;
    quantity?: number;
    stock_status?: "in_stock" | "out_of_stock" | "backorder";
    images?: BridgeRawImage[];
    categories?: BridgeRawCategory[];
    attributes?: Record<string, string | number | boolean>;
    metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
    weight?: number;
    weight_unit?: "g" | "kg";
    brand?: string;
    origin?: string;
    warranty?: number;
    barcode?: string;
    is_active?: boolean;
    is_featured?: boolean;
    is_new?: boolean;
    collection?: string;
    style?: string;
    materials?: string[];
}
interface BridgeRawImage {
    id?: string | number;
    url: string;
    alt?: string;
    position?: number;
    is_primary?: boolean;
}
interface BridgeRawCategory {
    id: string | number;
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    product_count?: number;
}
/**
 * Map Bridge category to domain Category
 */
declare function mapBridgeCategory(raw: BridgeRawCategory): Category;
/**
 * Map Bridge product to domain Product
 *
 * @param raw - Raw product from Bridge API
 * @param currency - Currency code (default: EUR) - used for formatting, not stored
 * @returns Domain Product object
 *
 * @example
 * ```typescript
 * const bridgeProduct = await bridgeApi.get('/products/123');
 * const product = mapBridgeProduct(bridgeProduct.data, 'EUR');
 * ```
 */
declare function mapBridgeProduct(raw: BridgeRawProduct, _currency?: string): Product;
/**
 * Map array of Bridge products to domain Products
 */
declare function mapBridgeProducts(rawProducts: BridgeRawProduct[], currency?: string): Product[];

/**
 * @maison/api-bridge
 *
 * Laravel Bridge adapter for the unified commerce API client.
 *
 * This package provides ICommerceClient implementation for Laravel Bridge backend,
 * specialized for:
 * - Product catalog synchronization from external ERP/PIM systems
 * - Real-time inventory management
 * - Price synchronization
 * - Data sync between e-commerce platform and external systems
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { createBridgeClient, registerBridgeProvider } from "@maison/api-bridge";
 * import { createApiClient, registerProvider } from "@maison/api-client";
 *
 * // Option 1: Direct creation
 * const bridgeClient = createBridgeClient({
 *   baseUrl: "https://bridge.example.com/api",
 *   apiKey: "your-api-key",
 *   currency: "EUR",
 *   enableInventorySync: true
 * });
 *
 * // Option 2: Register with api-client factory
 * registerBridgeProvider();
 * const client = createApiClient({
 *   provider: "bridge",
 *   baseUrl: "https://bridge.example.com/api",
 *   providerOptions: {
 *     apiKey: "your-api-key",
 *     currency: "EUR"
 *   }
 * });
 *
 * // Use for product sync
 * const products = await client.products.list({ pageSize: 100 });
 *
 * // Bridge-specific: Check inventory (requires BridgeCommerceClient)
 * const bridgeTyped = bridgeClient;
 * const stock = await bridgeTyped.inventory.checkStock(['SKU001', 'SKU002']);
 *
 * // Bridge-specific: Start sync job
 * const job = await bridgeTyped.sync.startSync('products');
 * ```
 */

/**
 * Register Bridge provider with the api-client factory.
 *
 * After calling this, you can use `createApiClient({ provider: "bridge", ... })`
 * to create Bridge clients through the unified factory.
 *
 * @example
 * ```typescript
 * import { registerBridgeProvider } from "@maison/api-bridge";
 * import { createApiClient } from "@maison/api-client";
 *
 * // Register once at app startup
 * registerBridgeProvider();
 *
 * // Now create clients using the factory
 * const client = createApiClient({
 *   provider: "bridge",
 *   baseUrl: "https://bridge.example.com/api",
 *   providerOptions: {
 *     apiKey: "your-api-key"
 *   }
 * });
 * ```
 */
declare function registerBridgeProvider(): void;

export { BridgeCommerceClient, type BridgeConfig, type BridgeInventoryItem, BridgeInventoryService, BridgeProductService, type BridgeRawCategory, type BridgeRawImage, type BridgeRawProduct, BridgeSyncService, type InventoryReservation, type InventorySyncStatus, type InventoryUpdateRequest, type SyncConfig, type SyncEntityType, type SyncJob, type SyncJobStatus, type SyncLogEntry, type SyncWebhookEvent, createBridgeClient, mapBridgeCategory, mapBridgeProduct, mapBridgeProducts, registerBridgeProvider };
