/**
 * Bridge Commerce Client
 *
 * Full implementation of ICommerceClient for Laravel Bridge backend.
 * Primarily used for inventory sync and product data from external ERP systems.
 */

import type {
  ICommerceClient,
  IB2BServices,
  IProductService,
  ICategoryService,
  ICartService,
  IOrderService,
  ICustomerService,
  CommerceClientConfig,
  ApiProvider,
} from "@maison/api-client";
import { BaseApiClient, type ApiClientConfig } from "@maison/api-core";
import { BridgeProductService } from "./services/products";
import { BridgeInventoryService } from "./services/inventory";
import { BridgeSyncService } from "./services/sync";

/**
 * Bridge-specific configuration options
 */
export interface BridgeConfig extends CommerceClientConfig {
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
 * Extended BaseApiClient that supports dynamic header management
 */
class BridgeApiClient extends BaseApiClient {
  private dynamicHeaders: Record<string, string> = {};

  constructor(config: ApiClientConfig) {
    super(config);
  }

  /**
   * Set a dynamic header
   */
  setDynamicHeader(name: string, value: string): void {
    this.dynamicHeaders[name] = value;
  }

  /**
   * Remove a dynamic header
   */
  removeDynamicHeader(name: string): void {
    delete this.dynamicHeaders[name];
  }

  /**
   * Override buildHeaders to include dynamic headers
   */
  protected override buildHeaders(
    customHeaders?: Record<string, string>
  ): Headers {
    const baseHeaders = super.buildHeaders(customHeaders);

    // Add dynamic headers
    for (const [name, value] of Object.entries(this.dynamicHeaders)) {
      baseHeaders.set(name, value);
    }

    return baseHeaders;
  }
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
export class BridgeCommerceClient implements ICommerceClient {
  // ApiAdapter interface
  readonly name = "bridge";
  readonly version = "1.0";

  // ICommerceClient interface
  readonly provider: ApiProvider = "bridge";
  readonly config: CommerceClientConfig;

  private readonly httpClient: BridgeApiClient;
  private readonly bridgeConfig: BridgeConfig;
  private authToken: string | null = null;
  private b2bContext: { companyId?: string; employeeId?: string } | null = null;
  private initialized = false;

  // Service instances (lazy initialized)
  private _products: IProductService | null = null;
  private _categories: ICategoryService | null = null;
  private _cart: ICartService | null = null;
  private _orders: IOrderService | null = null;
  private _customers: ICustomerService | null = null;
  private _b2b: IB2BServices | null = null;

  // Bridge-specific services
  private _inventory: BridgeInventoryService | null = null;
  private _sync: BridgeSyncService | null = null;

  constructor(config: BridgeConfig) {
    this.config = config;
    this.bridgeConfig = config;

    // Build default headers
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.defaultHeaders,
    };

    // Add API key if provided
    if (config.apiKey) {
      defaultHeaders["X-Api-Key"] = config.apiKey;
    }

    // Add tenant ID if provided
    if (config.tenantId) {
      defaultHeaders["X-Tenant-Id"] = config.tenantId;
    }

    // Initialize HTTP client
    this.httpClient = new BridgeApiClient({
      baseUrl: config.baseUrl,
      defaultHeaders,
      ...(config.timeout !== undefined && { timeout: config.timeout }),
    });

    // Initialize B2B context if provided
    if (config.enableB2B && config.b2b) {
      this.b2bContext = {
        ...(config.b2b.companyId && { companyId: config.b2b.companyId }),
        ...(config.b2b.employeeId && { employeeId: config.b2b.employeeId }),
      };
    }

    this.initialized = true;
  }

  // ==========================================
  // ApiAdapter Interface
  // ==========================================

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  isConfigured(): boolean {
    return this.initialized && !!this.config.baseUrl;
  }

  async healthCheck(): Promise<boolean> {
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

  get products(): IProductService {
    if (!this._products) {
      this._products = new BridgeProductService(
        this.httpClient,
        this.bridgeConfig.currency ?? "EUR"
      );
    }
    return this._products;
  }

  get categories(): ICategoryService {
    if (!this._categories) {
      this._categories = this.createStubCategoryService();
    }
    return this._categories;
  }

  get cart(): ICartService {
    if (!this._cart) {
      this._cart = this.createStubCartService();
    }
    return this._cart;
  }

  get orders(): IOrderService {
    if (!this._orders) {
      this._orders = this.createStubOrderService();
    }
    return this._orders;
  }

  get customers(): ICustomerService {
    if (!this._customers) {
      this._customers = this.createStubCustomerService();
    }
    return this._customers;
  }

  get b2b(): IB2BServices | null {
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
  get inventory(): BridgeInventoryService {
    if (!this._inventory) {
      this._inventory = new BridgeInventoryService(this.httpClient);
    }
    return this._inventory;
  }

  /**
   * Get sync service for data synchronization.
   * This is a Bridge-specific feature not part of ICommerceClient.
   */
  get sync(): BridgeSyncService {
    if (!this._sync) {
      this._sync = new BridgeSyncService(this.httpClient);
    }
    return this._sync;
  }

  // ==========================================
  // Authentication Methods
  // ==========================================

  setAuthToken(token: string): void {
    this.authToken = token;
    this.httpClient.setDynamicHeader("Authorization", `Bearer ${token}`);
  }

  clearAuth(): void {
    this.authToken = null;
    this.httpClient.removeDynamicHeader("Authorization");
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // ==========================================
  // B2B Context Methods
  // ==========================================

  setB2BContext(companyId: string, employeeId?: string): void {
    this.b2bContext = employeeId
      ? { companyId, employeeId }
      : { companyId };
    this.httpClient.setDynamicHeader("X-Company-Id", companyId);
    if (employeeId) {
      this.httpClient.setDynamicHeader("X-Employee-Id", employeeId);
    }
  }

  clearB2BContext(): void {
    this.b2bContext = null;
    this.httpClient.removeDynamicHeader("X-Company-Id");
    this.httpClient.removeDynamicHeader("X-Employee-Id");
  }

  getB2BContext(): { companyId?: string; employeeId?: string } | null {
    return this.b2bContext;
  }

  isB2BEnabled(): boolean {
    return this.config.enableB2B ?? false;
  }

  // ==========================================
  // HTTP Client Access
  // ==========================================

  getHttpClient() {
    return {
      get: <T>(path: string, options?: Record<string, unknown>) =>
        this.httpClient.get<T>(path, options).then((r) => r.data),
      post: <T>(path: string, body?: unknown, options?: Record<string, unknown>) =>
        this.httpClient.post<T>(path, body, options).then((r) => r.data),
      put: <T>(path: string, body?: unknown, options?: Record<string, unknown>) =>
        this.httpClient.put<T>(path, body, options).then((r) => r.data),
      patch: <T>(path: string, body?: unknown, options?: Record<string, unknown>) =>
        this.httpClient.patch<T>(path, body, options).then((r) => r.data),
      delete: <T>(path: string, options?: Record<string, unknown>) =>
        this.httpClient.delete<T>(path, options).then((r) => r.data),
    };
  }

  // ==========================================
  // Stub Services
  // Note: Bridge is primarily for product/inventory sync.
  // Cart, orders, and checkout are typically handled by the primary
  // e-commerce platform (Medusa, Shopify, etc.)
  // ==========================================

  private createStubCategoryService(): ICategoryService {
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
      getMany: async () => [],
    };
  }

  private createStubCartService(): ICartService {
    const notImplemented = (): never => {
      throw new Error(
        "Cart service not implemented for Bridge adapter. " +
          "Bridge is for product/inventory sync only. " +
          "Use Medusa or another provider for cart operations."
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
      delete: async () => {},
      merge: notImplemented,
    };
  }

  private createStubOrderService(): IOrderService {
    const notImplemented = (): never => {
      throw new Error(
        "Order service not implemented for Bridge adapter. " +
          "Bridge is for product/inventory sync only."
      );
    };

    const emptyPaginated = () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      hasNextPage: false,
      hasPreviousPage: false,
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
      track: notImplemented,
    };
  }

  private createStubCustomerService(): ICustomerService {
    const notImplemented = (): never => {
      throw new Error(
        "Customer service not implemented for Bridge adapter. " +
          "Bridge is for product/inventory sync only."
      );
    };

    return {
      getCurrent: notImplemented,
      get: notImplemented,
      getByEmail: notImplemented,
      update: notImplemented,
      register: notImplemented,
      login: notImplemented,
      logout: async () => {},
      refreshToken: notImplemented,
      requestPasswordReset: notImplemented,
      resetPassword: notImplemented,
      changePassword: notImplemented,
      listAddresses: async () => [],
      getAddress: notImplemented,
      addAddress: notImplemented,
      updateAddress: notImplemented,
      deleteAddress: async () => {},
      setDefaultAddress: notImplemented,
      getDefaultShippingAddress: async () => null,
      getDefaultBillingAddress: async () => null,
      delete: async () => {},
    };
  }

  private createStubB2BServices(): IB2BServices {
    const notImplemented = (): never => {
      throw new Error(
        "B2B service not implemented for Bridge adapter. " +
          "Use Medusa with B2B plugins for B2B operations."
      );
    };

    const emptyPaginated = () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      hasNextPage: false,
      hasPreviousPage: false,
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
        deleteAddress: async () => {},
        setDefaultAddress: notImplemented,
        getCreditInfo: notImplemented,
        adjustCredit: notImplemented,
        getCreditHistory: async () => emptyPaginated(),
        updateCreditLimit: notImplemented,
        addTags: notImplemented,
        removeTags: notImplemented,
        delete: async () => {},
      },
      employees: {
        list: async () => emptyPaginated(),
        get: notImplemented,
        getCurrent: notImplemented,
        invite: notImplemented,
        resendInvitation: notImplemented,
        cancelInvitation: async () => {},
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
        logout: async () => {},
        refreshToken: notImplemented,
        changePassword: async () => {},
        requestPasswordReset: async () => {},
        resetPassword: async () => {},
        getActivity: async () => emptyPaginated(),
        listDepartments: async () => [],
        createDepartment: notImplemented,
        updateDepartment: notImplemented,
        deleteDepartment: async () => {},
        getByDepartment: async () => [],
        delete: async () => {},
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
        markMessagesRead: async () => {},
        uploadAttachment: notImplemented,
        deleteAttachment: async () => {},
        generatePdf: notImplemented,
        getPdfUrl: notImplemented,
        getByCompany: async () => emptyPaginated(),
        getByEmployee: async () => emptyPaginated(),
        getRequiringAttention: async () => [],
        delete: async () => {},
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
        deleteWorkflow: async () => {},
        activateWorkflow: notImplemented,
        deactivateWorkflow: notImplemented,
        listDelegations: async () => [],
        createDelegation: notImplemented,
        cancelDelegation: async () => {},
        getMyDelegations: async () => [],
        getDelegationsToMe: async () => [],
        approveMany: async () => new Map(),
        rejectMany: async () => new Map(),
      },
      spending: {
        listLimits: async () => [],
        getLimit: notImplemented,
        getEmployeeLimits: async () => [],
        getDepartmentLimits: async () => [],
        createLimit: notImplemented,
        updateLimit: notImplemented,
        deleteLimit: async () => {},
        resetLimit: notImplemented,
        listRules: async () => [],
        getRule: notImplemented,
        createRule: notImplemented,
        updateRule: notImplemented,
        deleteRule: async () => {},
        activateRule: notImplemented,
        deactivateRule: notImplemented,
        checkPurchase: async () => ({
          allowed: true,
          affectedLimits: [],
          triggeredRules: [],
          requiresApproval: false,
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
        dismissAlert: async () => {},
      },
    };
  }
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
export function createBridgeClient(config: BridgeConfig): BridgeCommerceClient {
  return new BridgeCommerceClient(config);
}
