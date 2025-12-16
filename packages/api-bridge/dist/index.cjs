'use strict';

var apiClient = require('@maison/api-client');
var apiCore = require('@maison/api-core');

// src/index.ts

// src/mappers/product.ts
function parsePrice(value) {
  if (value === null || value === void 0) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? 0 : parsed;
}
function generateSlug(name, sku) {
  if (!name) return sku.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function mapBridgeCategory(raw) {
  return {
    id: raw.id.toString(),
    name: raw.name,
    slug: raw.slug ?? generateSlug(raw.name, raw.id.toString()),
    description: raw.description ?? "",
    image: raw.image ?? "",
    productCount: raw.product_count ?? 0
  };
}
function mapBridgeProduct(raw, _currency = "EUR") {
  const price = parsePrice(raw.price);
  const salePrice = raw.sale_price ? parsePrice(raw.sale_price) : null;
  const hasDiscount = salePrice !== null && salePrice < price;
  const images = raw.images?.map((img) => img.url) ?? [];
  let isAvailable = true;
  if (raw.is_active === false) {
    isAvailable = false;
  } else if (raw.stock_status === "out_of_stock") {
    isAvailable = false;
  } else if (raw.quantity !== void 0 && raw.quantity <= 0) {
    isAvailable = false;
  }
  const primaryCategory = raw.categories?.[0];
  return {
    id: raw.id.toString(),
    reference: raw.sku,
    name: raw.name,
    slug: raw.slug ?? generateSlug(raw.name, raw.sku),
    description: raw.description ?? "",
    shortDescription: raw.short_description ?? "",
    price: hasDiscount && salePrice !== null ? salePrice : price,
    isPriceTTC: raw.is_price_ttc ?? false,
    images,
    categoryId: primaryCategory?.id.toString() ?? "",
    materials: raw.materials ?? [],
    weightUnit: raw.weight_unit ?? "g",
    stock: raw.quantity ?? 0,
    isAvailable,
    featured: raw.is_featured ?? false,
    isNew: raw.is_new ?? false,
    createdAt: raw.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    // Optional properties - only include when they have values
    ...raw.name_en && { nameEn: raw.name_en },
    ...raw.barcode && { ean: raw.barcode },
    ...hasDiscount && { compareAtPrice: price },
    ...primaryCategory && { category: mapBridgeCategory(primaryCategory) },
    ...raw.collection && { collection: raw.collection },
    ...raw.style && { style: raw.style },
    ...raw.weight !== void 0 && { weight: raw.weight },
    ...raw.brand && { brand: raw.brand },
    ...raw.origin && { origin: raw.origin },
    ...raw.warranty !== void 0 && { warranty: raw.warranty }
  };
}
function mapBridgeProducts(rawProducts, currency = "EUR") {
  return rawProducts.map((p) => mapBridgeProduct(p, currency));
}

// src/services/products.ts
var BridgeProductService = class {
  constructor(client, currency = "EUR") {
    this.client = client;
    this.currency = currency;
  }
  /**
   * List products with optional filtering and pagination.
   */
  async list(options = {}) {
    const {
      page = 1,
      pageSize = 20,
      categoryId,
      collection,
      search,
      sortBy,
      sortOrder,
      filters
    } = options;
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(pageSize));
    if (categoryId) {
      params.set("category_id", categoryId);
    }
    if (collection) {
      params.set("collection", collection);
    }
    if (search) {
      params.set("search", search);
    }
    if (sortBy) {
      params.set("sort_by", sortBy);
      params.set("sort_order", sortOrder ?? "asc");
    }
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(`filter[${key}][]`, String(v)));
        } else if (value !== void 0 && value !== null) {
          params.set(`filter[${key}]`, String(value));
        }
      }
    }
    const response = await this.client.get(
      `/products?${params.toString()}`
    );
    const products = mapBridgeProducts(response.data.data, this.currency);
    const meta = response.data.meta;
    return {
      items: products,
      total: meta?.total ?? products.length,
      page: meta?.current_page ?? page,
      pageSize: meta?.per_page ?? pageSize,
      hasNextPage: meta?.current_page !== void 0 && meta?.last_page !== void 0 ? meta.current_page < meta.last_page : false,
      hasPreviousPage: (meta?.current_page ?? page) > 1
    };
  }
  /**
   * Get a single product by ID.
   */
  async get(id, options) {
    const params = new URLSearchParams();
    if (options?.includeRelated) {
      params.set("include_related", "true");
      if (options.relatedLimit) {
        params.set("related_limit", String(options.relatedLimit));
      }
    }
    const queryString = params.toString();
    const url = queryString ? `/products/${id}?${queryString}` : `/products/${id}`;
    const response = await this.client.get(url);
    const product = mapBridgeProduct(response.data.data, this.currency);
    const relatedProducts = response.data.related ? mapBridgeProducts(response.data.related, this.currency) : void 0;
    return {
      ...product,
      ...relatedProducts && { relatedProducts }
    };
  }
  /**
   * Get a product by slug/handle.
   */
  async getBySlug(slug, options) {
    const params = new URLSearchParams();
    if (options?.includeRelated) {
      params.set("include_related", "true");
    }
    const queryString = params.toString();
    const url = queryString ? `/products/slug/${slug}?${queryString}` : `/products/slug/${slug}`;
    const response = await this.client.get(url);
    const product = mapBridgeProduct(response.data.data, this.currency);
    const relatedProducts = response.data.related ? mapBridgeProducts(response.data.related, this.currency) : void 0;
    return {
      ...product,
      ...relatedProducts && { relatedProducts }
    };
  }
  /**
   * Get a product by SKU.
   */
  async getBySku(sku, options) {
    const params = new URLSearchParams();
    if (options?.includeRelated) {
      params.set("include_related", "true");
    }
    const queryString = params.toString();
    const url = queryString ? `/products/sku/${sku}?${queryString}` : `/products/sku/${sku}`;
    const response = await this.client.get(url);
    const product = mapBridgeProduct(response.data.data, this.currency);
    const relatedProducts = response.data.related ? mapBridgeProducts(response.data.related, this.currency) : void 0;
    return {
      ...product,
      ...relatedProducts && { relatedProducts }
    };
  }
  /**
   * Get multiple products by IDs.
   */
  async getMany(ids) {
    if (ids.length === 0) return [];
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("ids[]", id));
    const response = await this.client.get(
      `/products/batch?${params.toString()}`
    );
    return mapBridgeProducts(response.data.data, this.currency);
  }
  /**
   * Search products by query string.
   */
  async search(query, options = {}) {
    const result = await this.list({ ...options, search: query });
    return {
      products: [...result.items],
      total: result.total
      // suggestions and facets are optional and not available from Bridge API
    };
  }
  /**
   * Get products by category ID.
   */
  async getByCategory(categoryId, options = {}) {
    return this.list({ ...options, categoryId });
  }
  /**
   * Get featured products.
   */
  async getFeatured(limit = 10) {
    const response = await this.client.get(
      `/products/featured?limit=${limit}`
    );
    return mapBridgeProducts(response.data.data, this.currency);
  }
  /**
   * Get new products.
   */
  async getNew(limit = 10, daysBack = 30) {
    const response = await this.client.get(
      `/products/new?limit=${limit}&days_back=${daysBack}`
    );
    return mapBridgeProducts(response.data.data, this.currency);
  }
  /**
   * Get product inventory information.
   */
  async getInventory(productId) {
    const response = await this.client.get(
      `/products/${productId}/inventory`
    );
    const inv = response.data.data;
    return {
      productId: inv.product_id,
      sku: inv.sku,
      available: inv.available,
      reserved: inv.reserved,
      ...inv.incoming !== void 0 && { incoming: inv.incoming },
      ...inv.incoming_date !== void 0 && { incomingDate: inv.incoming_date }
    };
  }
  /**
   * Get inventory for multiple products.
   */
  async getInventoryBulk(productIds) {
    if (productIds.length === 0) return /* @__PURE__ */ new Map();
    const params = new URLSearchParams();
    productIds.forEach((id) => params.append("product_ids[]", id));
    const response = await this.client.get(
      `/products/inventory?${params.toString()}`
    );
    const result = /* @__PURE__ */ new Map();
    for (const inv of response.data.data) {
      result.set(inv.product_id, {
        productId: inv.product_id,
        sku: inv.sku,
        available: inv.available,
        reserved: inv.reserved,
        ...inv.incoming !== void 0 && { incoming: inv.incoming },
        ...inv.incoming_date !== void 0 && { incomingDate: inv.incoming_date }
      });
    }
    return result;
  }
};

// src/services/inventory.ts
var BridgeInventoryService = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Get inventory for a single SKU
   */
  async getBySku(sku) {
    const response = await this.client.get(
      `/inventory/${encodeURIComponent(sku)}`
    );
    return response.data.data;
  }
  /**
   * Check stock for multiple SKUs
   */
  async checkStock(skus) {
    if (skus.length === 0) return [];
    const response = await this.client.post(
      "/inventory/check",
      { skus }
    );
    return response.data.data;
  }
  /**
   * Check if specific quantities are available
   */
  async checkAvailability(items) {
    const response = await this.client.post("/inventory/availability", { items });
    return response.data.data;
  }
  /**
   * Reserve inventory for a cart, order, or quote
   */
  async reserve(reservation) {
    const response = await this.client.post("/inventory/reserve", reservation);
    return response.data.data;
  }
  /**
   * Reserve inventory for multiple items
   */
  async reserveMany(reservations) {
    const response = await this.client.post("/inventory/reserve-many", { reservations });
    return response.data.data;
  }
  /**
   * Release a reservation
   */
  async releaseReservation(reservationId) {
    await this.client.delete(`/inventory/reservations/${reservationId}`);
  }
  /**
   * Release all reservations for a reference (cart/order/quote)
   */
  async releaseByReference(referenceType, referenceId) {
    const response = await this.client.delete(`/inventory/reservations/${referenceType}/${referenceId}`);
    return response.data.data;
  }
  /**
   * Confirm reservation (convert to actual stock deduction)
   */
  async confirmReservation(reservationId) {
    await this.client.post(`/inventory/reservations/${reservationId}/confirm`);
  }
  /**
   * Update inventory (admin operation)
   */
  async update(request) {
    const response = await this.client.put(
      `/inventory/${encodeURIComponent(request.sku)}`,
      request
    );
    return response.data.data;
  }
  /**
   * Batch update inventory (admin operation)
   */
  async updateMany(updates) {
    const response = await this.client.post("/inventory/batch", { updates });
    return response.data.data;
  }
  /**
   * Get low stock items
   */
  async getLowStock(options) {
    const params = new URLSearchParams();
    if (options?.threshold) params.set("threshold", String(options.threshold));
    if (options?.warehouse_id) params.set("warehouse_id", options.warehouse_id);
    if (options?.page) params.set("page", String(options.page));
    if (options?.per_page) params.set("per_page", String(options.per_page));
    const response = await this.client.get(`/inventory/low-stock?${params.toString()}`);
    return {
      items: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.current_page,
      per_page: response.data.meta.per_page
    };
  }
  /**
   * Get sync status
   */
  async getSyncStatus() {
    const response = await this.client.get(
      "/inventory/sync-status"
    );
    return response.data.data;
  }
  /**
   * Trigger manual sync (admin operation)
   */
  async triggerSync(options) {
    const response = await this.client.post("/inventory/sync", options ?? {});
    return response.data.data;
  }
};

// src/services/sync.ts
var BridgeSyncService = class {
  constructor(client) {
    this.client = client;
  }
  // ==========================================
  // Sync Jobs
  // ==========================================
  /**
   * Start a new sync job
   */
  async startSync(entityType, options) {
    const response = await this.client.post(
      "/sync/jobs",
      {
        entity_type: entityType,
        direction: options?.direction ?? "import",
        options
      }
    );
    return response.data.data;
  }
  /**
   * Get sync job status
   */
  async getJobStatus(jobId) {
    const response = await this.client.get(
      `/sync/jobs/${jobId}`
    );
    return response.data.data;
  }
  /**
   * List sync jobs with optional filtering
   */
  async listJobs(options) {
    const params = new URLSearchParams();
    if (options?.entity_type) params.set("entity_type", options.entity_type);
    if (options?.status) params.set("status", options.status);
    if (options?.page) params.set("page", String(options.page));
    if (options?.per_page) params.set("per_page", String(options.per_page));
    const response = await this.client.get(`/sync/jobs?${params.toString()}`);
    return {
      items: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.current_page,
      per_page: response.data.meta.per_page
    };
  }
  /**
   * Cancel a running sync job
   */
  async cancelJob(jobId) {
    const response = await this.client.post(
      `/sync/jobs/${jobId}/cancel`
    );
    return response.data.data;
  }
  /**
   * Retry a failed sync job
   */
  async retryJob(jobId) {
    const response = await this.client.post(
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
  async getJobLogs(jobId, options) {
    const params = new URLSearchParams();
    if (options?.level) params.set("level", options.level);
    if (options?.page) params.set("page", String(options.page));
    if (options?.per_page) params.set("per_page", String(options.per_page));
    const response = await this.client.get(`/sync/jobs/${jobId}/logs?${params.toString()}`);
    return {
      items: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.current_page,
      per_page: response.data.meta.per_page
    };
  }
  /**
   * Get errors for a sync job
   */
  async getJobErrors(jobId) {
    const result = await this.getJobLogs(jobId, { level: "error", per_page: 1e3 });
    return result.items;
  }
  // ==========================================
  // Sync Configuration
  // ==========================================
  /**
   * Get sync configuration for an entity type
   */
  async getConfig(entityType) {
    const response = await this.client.get(
      `/sync/config/${entityType}`
    );
    return response.data.data;
  }
  /**
   * List all sync configurations
   */
  async listConfigs() {
    const response = await this.client.get("/sync/config");
    return response.data.data;
  }
  /**
   * Update sync configuration
   */
  async updateConfig(entityType, config) {
    const response = await this.client.put(
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
  async syncProduct(identifier, by = "id") {
    const response = await this.client.post("/sync/product", { identifier, by });
    return response.data.data;
  }
  /**
   * Sync multiple products
   */
  async syncProducts(identifiers, by = "id") {
    const response = await this.client.post("/sync/products", { identifiers, by });
    return response.data.data;
  }
  /**
   * Sync inventory for specific SKUs
   */
  async syncInventory(skus) {
    const response = await this.client.post(
      "/sync/inventory",
      { skus }
    );
    return response.data.data;
  }
  /**
   * Sync prices for specific products
   */
  async syncPrices(productIds) {
    const response = await this.client.post(
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
  async registerWebhook(url, events, secret) {
    const response = await this.client.post(
      "/sync/webhooks",
      { url, events, secret }
    );
    return response.data.data;
  }
  /**
   * List registered webhooks
   */
  async listWebhooks() {
    const response = await this.client.get("/sync/webhooks");
    return response.data.data;
  }
  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId) {
    await this.client.delete(`/sync/webhooks/${webhookId}`);
  }
  // ==========================================
  // Health & Stats
  // ==========================================
  /**
   * Get overall sync health status
   */
  async getHealth() {
    const response = await this.client.get("/sync/health");
    return response.data.data;
  }
  /**
   * Get sync statistics
   */
  async getStats(options) {
    const params = new URLSearchParams();
    if (options?.period) params.set("period", options.period);
    if (options?.entity_type) params.set("entity_type", options.entity_type);
    const response = await this.client.get(`/sync/stats?${params.toString()}`);
    return response.data.data;
  }
};

// src/client.ts
var BridgeApiClient = class extends apiCore.BaseApiClient {
  dynamicHeaders = {};
  constructor(config) {
    super(config);
  }
  /**
   * Set a dynamic header
   */
  setDynamicHeader(name, value) {
    this.dynamicHeaders[name] = value;
  }
  /**
   * Remove a dynamic header
   */
  removeDynamicHeader(name) {
    delete this.dynamicHeaders[name];
  }
  /**
   * Override buildHeaders to include dynamic headers
   */
  buildHeaders(customHeaders) {
    const baseHeaders = super.buildHeaders(customHeaders);
    for (const [name, value] of Object.entries(this.dynamicHeaders)) {
      baseHeaders.set(name, value);
    }
    return baseHeaders;
  }
};
var BridgeCommerceClient = class {
  // ApiAdapter interface
  name = "bridge";
  version = "1.0";
  // ICommerceClient interface
  provider = "bridge";
  config;
  httpClient;
  bridgeConfig;
  authToken = null;
  b2bContext = null;
  initialized = false;
  // Service instances (lazy initialized)
  _products = null;
  _categories = null;
  _cart = null;
  _orders = null;
  _customers = null;
  _b2b = null;
  // Bridge-specific services
  _inventory = null;
  _sync = null;
  constructor(config) {
    this.config = config;
    this.bridgeConfig = config;
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.defaultHeaders
    };
    if (config.apiKey) {
      defaultHeaders["X-Api-Key"] = config.apiKey;
    }
    if (config.tenantId) {
      defaultHeaders["X-Tenant-Id"] = config.tenantId;
    }
    this.httpClient = new BridgeApiClient({
      baseUrl: config.baseUrl,
      defaultHeaders,
      ...config.timeout !== void 0 && { timeout: config.timeout }
    });
    if (config.enableB2B && config.b2b) {
      this.b2bContext = {
        ...config.b2b.companyId && { companyId: config.b2b.companyId },
        ...config.b2b.employeeId && { employeeId: config.b2b.employeeId }
      };
    }
    this.initialized = true;
  }
  // ==========================================
  // ApiAdapter Interface
  // ==========================================
  async initialize() {
    this.initialized = true;
  }
  isConfigured() {
    return this.initialized && !!this.config.baseUrl;
  }
  async healthCheck() {
    try {
      await this.httpClient.get("/health");
      return true;
    } catch {
      return false;
    }
  }
  // ==========================================
  // Service Accessors (Lazy Initialization)
  // ==========================================
  get products() {
    if (!this._products) {
      this._products = new BridgeProductService(
        this.httpClient,
        this.bridgeConfig.currency ?? "EUR"
      );
    }
    return this._products;
  }
  get categories() {
    if (!this._categories) {
      this._categories = this.createStubCategoryService();
    }
    return this._categories;
  }
  get cart() {
    if (!this._cart) {
      this._cart = this.createStubCartService();
    }
    return this._cart;
  }
  get orders() {
    if (!this._orders) {
      this._orders = this.createStubOrderService();
    }
    return this._orders;
  }
  get customers() {
    if (!this._customers) {
      this._customers = this.createStubCustomerService();
    }
    return this._customers;
  }
  get b2b() {
    if (!this.config.enableB2B) {
      return null;
    }
    if (!this._b2b) {
      this._b2b = this.createStubB2BServices();
    }
    return this._b2b;
  }
  // ==========================================
  // Bridge-Specific Service Accessors
  // ==========================================
  /**
   * Get inventory service for real-time stock management.
   * This is a Bridge-specific feature not part of ICommerceClient.
   */
  get inventory() {
    if (!this._inventory) {
      this._inventory = new BridgeInventoryService(this.httpClient);
    }
    return this._inventory;
  }
  /**
   * Get sync service for data synchronization.
   * This is a Bridge-specific feature not part of ICommerceClient.
   */
  get sync() {
    if (!this._sync) {
      this._sync = new BridgeSyncService(this.httpClient);
    }
    return this._sync;
  }
  // ==========================================
  // Authentication Methods
  // ==========================================
  setAuthToken(token) {
    this.authToken = token;
    this.httpClient.setDynamicHeader("Authorization", `Bearer ${token}`);
  }
  clearAuth() {
    this.authToken = null;
    this.httpClient.removeDynamicHeader("Authorization");
  }
  getAuthToken() {
    return this.authToken;
  }
  // ==========================================
  // B2B Context Methods
  // ==========================================
  setB2BContext(companyId, employeeId) {
    this.b2bContext = employeeId ? { companyId, employeeId } : { companyId };
    this.httpClient.setDynamicHeader("X-Company-Id", companyId);
    if (employeeId) {
      this.httpClient.setDynamicHeader("X-Employee-Id", employeeId);
    }
  }
  clearB2BContext() {
    this.b2bContext = null;
    this.httpClient.removeDynamicHeader("X-Company-Id");
    this.httpClient.removeDynamicHeader("X-Employee-Id");
  }
  getB2BContext() {
    return this.b2bContext;
  }
  isB2BEnabled() {
    return this.config.enableB2B ?? false;
  }
  // ==========================================
  // HTTP Client Access
  // ==========================================
  getHttpClient() {
    return {
      get: (path, options) => this.httpClient.get(path, options).then((r) => r.data),
      post: (path, body, options) => this.httpClient.post(path, body, options).then((r) => r.data),
      put: (path, body, options) => this.httpClient.put(path, body, options).then((r) => r.data),
      patch: (path, body, options) => this.httpClient.patch(path, body, options).then((r) => r.data),
      delete: (path, options) => this.httpClient.delete(path, options).then((r) => r.data)
    };
  }
  // ==========================================
  // Stub Services
  // Note: Bridge is primarily for product/inventory sync.
  // Cart, orders, and checkout are typically handled by the primary
  // e-commerce platform (Medusa, Shopify, etc.)
  // ==========================================
  createStubCategoryService() {
    return {
      list: async () => [],
      get: async () => {
        throw new Error("Category service not implemented for Bridge adapter");
      },
      getBySlug: async () => {
        throw new Error("Category service not implemented for Bridge adapter");
      },
      getTree: async () => [],
      getRoots: async () => [],
      getChildren: async () => [],
      getBreadcrumbs: async () => [],
      getMany: async () => []
    };
  }
  createStubCartService() {
    const notImplemented = () => {
      throw new Error(
        "Cart service not implemented for Bridge adapter. Bridge is for product/inventory sync only. Use Medusa or another provider for cart operations."
      );
    };
    return {
      get: notImplemented,
      create: notImplemented,
      addItem: notImplemented,
      updateItem: notImplemented,
      removeItem: notImplemented,
      addItemsBulk: notImplemented,
      clear: notImplemented,
      applyDiscount: notImplemented,
      removeDiscount: notImplemented,
      setShippingOption: notImplemented,
      getShippingOptions: async () => [],
      setCustomer: notImplemented,
      setAddresses: notImplemented,
      updateMetadata: notImplemented,
      delete: async () => {
      },
      merge: notImplemented
    };
  }
  createStubOrderService() {
    const notImplemented = () => {
      throw new Error(
        "Order service not implemented for Bridge adapter. Bridge is for product/inventory sync only."
      );
    };
    const emptyPaginated = () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      hasNextPage: false,
      hasPreviousPage: false
    });
    return {
      list: async () => emptyPaginated(),
      get: notImplemented,
      getByNumber: notImplemented,
      create: notImplemented,
      createDirect: notImplemented,
      cancel: notImplemented,
      updateNotes: notImplemented,
      getFulfillments: async () => [],
      getRefunds: async () => [],
      requestRefund: notImplemented,
      getCustomerOrders: async () => emptyPaginated(),
      getCompanyOrders: async () => emptyPaginated(),
      reorder: notImplemented,
      getInvoiceUrl: notImplemented,
      track: notImplemented
    };
  }
  createStubCustomerService() {
    const notImplemented = () => {
      throw new Error(
        "Customer service not implemented for Bridge adapter. Bridge is for product/inventory sync only."
      );
    };
    return {
      getCurrent: notImplemented,
      get: notImplemented,
      getByEmail: notImplemented,
      update: notImplemented,
      register: notImplemented,
      login: notImplemented,
      logout: async () => {
      },
      refreshToken: notImplemented,
      requestPasswordReset: notImplemented,
      resetPassword: notImplemented,
      changePassword: notImplemented,
      listAddresses: async () => [],
      getAddress: notImplemented,
      addAddress: notImplemented,
      updateAddress: notImplemented,
      deleteAddress: async () => {
      },
      setDefaultAddress: notImplemented,
      getDefaultShippingAddress: async () => null,
      getDefaultBillingAddress: async () => null,
      delete: async () => {
      }
    };
  }
  createStubB2BServices() {
    const notImplemented = () => {
      throw new Error(
        "B2B service not implemented for Bridge adapter. Use Medusa with B2B plugins for B2B operations."
      );
    };
    const emptyPaginated = () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      hasNextPage: false,
      hasPreviousPage: false
    });
    return {
      companies: {
        list: async () => emptyPaginated(),
        get: notImplemented,
        getBySlug: notImplemented,
        getCurrent: async () => null,
        register: notImplemented,
        update: notImplemented,
        updateStatus: notImplemented,
        updateTier: notImplemented,
        listAddresses: async () => [],
        addAddress: notImplemented,
        updateAddress: notImplemented,
        deleteAddress: async () => {
        },
        setDefaultAddress: notImplemented,
        getCreditInfo: notImplemented,
        adjustCredit: notImplemented,
        getCreditHistory: async () => emptyPaginated(),
        updateCreditLimit: notImplemented,
        addTags: notImplemented,
        removeTags: notImplemented,
        delete: async () => {
        }
      },
      employees: {
        list: async () => emptyPaginated(),
        get: notImplemented,
        getCurrent: notImplemented,
        invite: notImplemented,
        resendInvitation: notImplemented,
        cancelInvitation: async () => {
        },
        acceptInvitation: notImplemented,
        listInvitations: async () => [],
        update: notImplemented,
        updateStatus: notImplemented,
        updateRole: notImplemented,
        updatePermissions: notImplemented,
        updateSpendingLimits: notImplemented,
        resetSpending: notImplemented,
        getPermissions: async () => [],
        hasPermission: async () => false,
        login: notImplemented,
        logout: async () => {
        },
        refreshToken: notImplemented,
        changePassword: async () => {
        },
        requestPasswordReset: async () => {
        },
        resetPassword: async () => {
        },
        getActivity: async () => emptyPaginated(),
        listDepartments: async () => [],
        createDepartment: notImplemented,
        updateDepartment: notImplemented,
        deleteDepartment: async () => {
        },
        getByDepartment: async () => [],
        delete: async () => {
        }
      },
      quotes: {
        list: async () => emptyPaginated(),
        get: notImplemented,
        getByNumber: notImplemented,
        createFromCart: notImplemented,
        create: notImplemented,
        update: notImplemented,
        submit: notImplemented,
        accept: notImplemented,
        reject: notImplemented,
        cancel: notImplemented,
        convertToOrder: notImplemented,
        convertToCart: notImplemented,
        requestRevision: notImplemented,
        createRevision: notImplemented,
        addItem: notImplemented,
        updateItem: notImplemented,
        removeItem: notImplemented,
        getMessages: async () => [],
        sendMessage: notImplemented,
        markMessagesRead: async () => {
        },
        uploadAttachment: notImplemented,
        deleteAttachment: async () => {
        },
        generatePdf: notImplemented,
        getPdfUrl: notImplemented,
        getByCompany: async () => emptyPaginated(),
        getByEmployee: async () => emptyPaginated(),
        getRequiringAttention: async () => [],
        delete: async () => {
        }
      },
      approvals: {
        list: async () => emptyPaginated(),
        get: notImplemented,
        getByNumber: notImplemented,
        getMyPending: async () => emptyPaginated(),
        getMySubmitted: async () => emptyPaginated(),
        getStats: notImplemented,
        takeAction: notImplemented,
        approve: notImplemented,
        reject: notImplemented,
        delegate: notImplemented,
        escalate: notImplemented,
        requestInfo: notImplemented,
        addComment: notImplemented,
        listWorkflows: async () => [],
        getWorkflow: notImplemented,
        createWorkflow: notImplemented,
        updateWorkflow: notImplemented,
        deleteWorkflow: async () => {
        },
        activateWorkflow: notImplemented,
        deactivateWorkflow: notImplemented,
        listDelegations: async () => [],
        createDelegation: notImplemented,
        cancelDelegation: async () => {
        },
        getMyDelegations: async () => [],
        getDelegationsToMe: async () => [],
        approveMany: async () => /* @__PURE__ */ new Map(),
        rejectMany: async () => /* @__PURE__ */ new Map()
      },
      spending: {
        listLimits: async () => [],
        getLimit: notImplemented,
        getEmployeeLimits: async () => [],
        getDepartmentLimits: async () => [],
        createLimit: notImplemented,
        updateLimit: notImplemented,
        deleteLimit: async () => {
        },
        resetLimit: notImplemented,
        listRules: async () => [],
        getRule: notImplemented,
        createRule: notImplemented,
        updateRule: notImplemented,
        deleteRule: async () => {
        },
        activateRule: notImplemented,
        deactivateRule: notImplemented,
        checkPurchase: async () => ({
          allowed: true,
          affectedLimits: [],
          triggeredRules: [],
          requiresApproval: false
        }),
        getRemainingBudget: async () => 0,
        listTransactions: async () => emptyPaginated(),
        getEmployeeTransactions: async () => emptyPaginated(),
        recordAdjustment: notImplemented,
        getReport: notImplemented,
        getBudgetSummaries: async () => [],
        getEmployeeBudgetSummary: async () => [],
        getDepartmentBudgetSummary: notImplemented,
        exportReport: notImplemented,
        getAlerts: async () => [],
        dismissAlert: async () => {
        }
      }
    };
  }
};
function createBridgeClient(config) {
  return new BridgeCommerceClient(config);
}

// src/index.ts
function registerBridgeProvider() {
  apiClient.registerProvider("bridge", (config) => {
    const opts = config.providerOptions ?? {};
    const apiKey = opts["apiKey"];
    const tenantId = opts["tenantId"];
    const currency = opts["currency"] ?? "EUR";
    const enableInventorySync = opts["enableInventorySync"] ?? true;
    const enableSyncService = opts["enableSyncService"] ?? true;
    const bridgeConfig = {
      ...config,
      currency,
      enableInventorySync,
      enableSyncService,
      ...apiKey !== void 0 && { apiKey },
      ...tenantId !== void 0 && { tenantId }
    };
    return createBridgeClient(bridgeConfig);
  });
}
try {
  registerBridgeProvider();
} catch {
}

exports.BridgeCommerceClient = BridgeCommerceClient;
exports.BridgeInventoryService = BridgeInventoryService;
exports.BridgeProductService = BridgeProductService;
exports.BridgeSyncService = BridgeSyncService;
exports.createBridgeClient = createBridgeClient;
exports.mapBridgeCategory = mapBridgeCategory;
exports.mapBridgeProduct = mapBridgeProduct;
exports.mapBridgeProducts = mapBridgeProducts;
exports.registerBridgeProvider = registerBridgeProvider;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map