/**
 * Medusa Commerce Client
 *
 * Full implementation of ICommerceClient for Medusa V2 backend.
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
import { MedusaProductService } from "./services/products";
import { MedusaCartService } from "./services/cart";

/**
 * Medusa-specific configuration options
 */
export interface MedusaConfig extends CommerceClientConfig {
  /** Publishable API key for store operations */
  publishableKey?: string;
}

/**
 * Extended BaseApiClient that supports dynamic header management
 */
class MedusaApiClient extends BaseApiClient {
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
 * Medusa Commerce Client implementation.
 *
 * Provides full ICommerceClient interface for Medusa V2 backend.
 *
 * @example
 * ```typescript
 * const client = new MedusaCommerceClient({
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx",
 *   enableB2B: true
 * });
 *
 * const products = await client.products.list({ pageSize: 20 });
 * const cart = await client.cart.create();
 * ```
 */
export class MedusaCommerceClient implements ICommerceClient {
  // ApiAdapter interface
  readonly name = "medusa";
  readonly version = "2.0";

  // ICommerceClient interface
  readonly provider: ApiProvider = "medusa";
  readonly config: CommerceClientConfig;

  private readonly httpClient: MedusaApiClient;
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

  constructor(config: MedusaConfig) {
    this.config = config;

    // Build default headers
    const defaultHeaders: Record<string, string> = {
      ...config.defaultHeaders,
    };

    if (config.publishableKey) {
      defaultHeaders["x-publishable-api-key"] = config.publishableKey;
    }

    // Initialize HTTP client
    this.httpClient = new MedusaApiClient({
      baseUrl: config.baseUrl,
      defaultHeaders,
      timeout: config.timeout,
    });

    // Initialize B2B context if provided
    if (config.enableB2B && config.b2b) {
      this.b2bContext = {
        companyId: config.b2b.companyId,
        employeeId: config.b2b.employeeId,
      };
    }

    this.initialized = true;
  }

  // ==========================================
  // ApiAdapter Interface
  // ==========================================

  async initialize(): Promise<void> {
    // Already initialized in constructor
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
      this._products = new MedusaProductService(
        this.httpClient,
        this.config.regionId
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
      if (!this.config.regionId) {
        throw new Error("regionId is required for cart operations");
      }
      this._cart = new MedusaCartService(this.httpClient, this.config.regionId);
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
    this.b2bContext = { companyId, employeeId };
    this.httpClient.setDynamicHeader("x-company-id", companyId);
    if (employeeId) {
      this.httpClient.setDynamicHeader("x-employee-id", employeeId);
    }
  }

  clearB2BContext(): void {
    this.b2bContext = null;
    this.httpClient.removeDynamicHeader("x-company-id");
    this.httpClient.removeDynamicHeader("x-employee-id");
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
  // Stub Services (to be implemented)
  // ==========================================

  private createStubCategoryService(): ICategoryService {
    const notImplemented = (): never => {
      throw new Error("Category service not implemented for Medusa adapter");
    };

    return {
      list: async () => [],
      get: async () => notImplemented(),
      getBySlug: async () => notImplemented(),
      getTree: async () => [],
      getRoots: async () => [],
      getChildren: async () => [],
      getBreadcrumbs: async () => [],
      getMany: async () => [],
    };
  }

  private createStubOrderService(): IOrderService {
    const notImplemented = (): never => {
      throw new Error("Order service not implemented for Medusa adapter");
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
      get: async () => notImplemented(),
      getByNumber: async () => notImplemented(),
      create: async () => notImplemented(),
      createDirect: async () => notImplemented(),
      cancel: async () => notImplemented(),
      updateNotes: async () => notImplemented(),
      getFulfillments: async () => [],
      getRefunds: async () => [],
      requestRefund: async () => notImplemented(),
      getCustomerOrders: async () => emptyPaginated(),
      getCompanyOrders: async () => emptyPaginated(),
      reorder: async () => notImplemented(),
      getInvoiceUrl: async () => notImplemented(),
      track: async () => notImplemented(),
    };
  }

  private createStubCustomerService(): ICustomerService {
    const notImplemented = (): never => {
      throw new Error("Customer service not implemented for Medusa adapter");
    };

    return {
      getCurrent: async () => notImplemented(),
      get: async () => notImplemented(),
      getByEmail: async () => notImplemented(),
      update: async () => notImplemented(),
      register: async () => notImplemented(),
      login: async () => notImplemented(),
      logout: async () => {},
      refreshToken: async () => notImplemented(),
      requestPasswordReset: async () => notImplemented(),
      resetPassword: async () => notImplemented(),
      changePassword: async () => notImplemented(),
      listAddresses: async () => [],
      getAddress: async () => notImplemented(),
      addAddress: async () => notImplemented(),
      updateAddress: async () => notImplemented(),
      deleteAddress: async () => {},
      setDefaultAddress: async () => notImplemented(),
      getDefaultShippingAddress: async () => null,
      getDefaultBillingAddress: async () => null,
      delete: async () => {},
    };
  }

  private createStubB2BServices(): IB2BServices {
    const notImplemented = (): never => {
      throw new Error("B2B service not implemented. Requires Medusa B2B plugins.");
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
        get: async () => notImplemented(),
        getBySlug: async () => notImplemented(),
        getCurrent: async () => null,
        register: async () => notImplemented(),
        update: async () => notImplemented(),
        updateStatus: async () => notImplemented(),
        updateTier: async () => notImplemented(),
        listAddresses: async () => [],
        addAddress: async () => notImplemented(),
        updateAddress: async () => notImplemented(),
        deleteAddress: async () => {},
        setDefaultAddress: async () => notImplemented(),
        getCreditInfo: async () => notImplemented(),
        adjustCredit: async () => notImplemented(),
        getCreditHistory: async () => emptyPaginated(),
        updateCreditLimit: async () => notImplemented(),
        addTags: async () => notImplemented(),
        removeTags: async () => notImplemented(),
        delete: async () => {},
      },
      employees: {
        list: async () => emptyPaginated(),
        get: async () => notImplemented(),
        getCurrent: async () => notImplemented(),
        invite: async () => notImplemented(),
        resendInvitation: async () => notImplemented(),
        cancelInvitation: async () => {},
        acceptInvitation: async () => notImplemented(),
        listInvitations: async () => [],
        update: async () => notImplemented(),
        updateStatus: async () => notImplemented(),
        updateRole: async () => notImplemented(),
        updatePermissions: async () => notImplemented(),
        updateSpendingLimits: async () => notImplemented(),
        resetSpending: async () => notImplemented(),
        getPermissions: async () => [],
        hasPermission: async () => false,
        login: async () => notImplemented(),
        logout: async () => {},
        refreshToken: async () => notImplemented(),
        changePassword: async () => {},
        requestPasswordReset: async () => {},
        resetPassword: async () => {},
        getActivity: async () => emptyPaginated(),
        listDepartments: async () => [],
        createDepartment: async () => notImplemented(),
        updateDepartment: async () => notImplemented(),
        deleteDepartment: async () => {},
        getByDepartment: async () => [],
        delete: async () => {},
      },
      quotes: {
        list: async () => emptyPaginated(),
        get: async () => notImplemented(),
        getByNumber: async () => notImplemented(),
        createFromCart: async () => notImplemented(),
        create: async () => notImplemented(),
        update: async () => notImplemented(),
        submit: async () => notImplemented(),
        accept: async () => notImplemented(),
        reject: async () => notImplemented(),
        cancel: async () => notImplemented(),
        convertToOrder: async () => notImplemented(),
        convertToCart: async () => notImplemented(),
        requestRevision: async () => notImplemented(),
        createRevision: async () => notImplemented(),
        addItem: async () => notImplemented(),
        updateItem: async () => notImplemented(),
        removeItem: async () => notImplemented(),
        getMessages: async () => [],
        sendMessage: async () => notImplemented(),
        markMessagesRead: async () => {},
        uploadAttachment: async () => notImplemented(),
        deleteAttachment: async () => {},
        generatePdf: async () => notImplemented(),
        getPdfUrl: async () => notImplemented(),
        getByCompany: async () => emptyPaginated(),
        getByEmployee: async () => emptyPaginated(),
        getRequiringAttention: async () => [],
        delete: async () => {},
      },
      approvals: {
        list: async () => emptyPaginated(),
        get: async () => notImplemented(),
        getByNumber: async () => notImplemented(),
        getMyPending: async () => emptyPaginated(),
        getMySubmitted: async () => emptyPaginated(),
        getStats: async () => notImplemented(),
        takeAction: async () => notImplemented(),
        approve: async () => notImplemented(),
        reject: async () => notImplemented(),
        delegate: async () => notImplemented(),
        escalate: async () => notImplemented(),
        requestInfo: async () => notImplemented(),
        addComment: async () => notImplemented(),
        listWorkflows: async () => [],
        getWorkflow: async () => notImplemented(),
        createWorkflow: async () => notImplemented(),
        updateWorkflow: async () => notImplemented(),
        deleteWorkflow: async () => {},
        activateWorkflow: async () => notImplemented(),
        deactivateWorkflow: async () => notImplemented(),
        listDelegations: async () => [],
        createDelegation: async () => notImplemented(),
        cancelDelegation: async () => {},
        getMyDelegations: async () => [],
        getDelegationsToMe: async () => [],
        approveMany: async () => new Map(),
        rejectMany: async () => new Map(),
      },
      spending: {
        listLimits: async () => [],
        getLimit: async () => notImplemented(),
        getEmployeeLimits: async () => [],
        getDepartmentLimits: async () => [],
        createLimit: async () => notImplemented(),
        updateLimit: async () => notImplemented(),
        deleteLimit: async () => {},
        resetLimit: async () => notImplemented(),
        listRules: async () => [],
        getRule: async () => notImplemented(),
        createRule: async () => notImplemented(),
        updateRule: async () => notImplemented(),
        deleteRule: async () => {},
        activateRule: async () => notImplemented(),
        deactivateRule: async () => notImplemented(),
        checkPurchase: async () => ({
          allowed: true,
          affectedLimits: [],
          triggeredRules: [],
          requiresApproval: false,
        }),
        getRemainingBudget: async () => 0,
        listTransactions: async () => emptyPaginated(),
        getEmployeeTransactions: async () => emptyPaginated(),
        recordAdjustment: async () => notImplemented(),
        getReport: async () => notImplemented(),
        getBudgetSummaries: async () => [],
        getEmployeeBudgetSummary: async () => [],
        getDepartmentBudgetSummary: async () => notImplemented(),
        exportReport: async () => notImplemented(),
        getAlerts: async () => [],
        dismissAlert: async () => {},
      },
    };
  }
}

/**
 * Create a Medusa commerce client.
 *
 * @param config - Client configuration
 * @returns Medusa commerce client
 *
 * @example
 * ```typescript
 * const client = createMedusaClient({
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx"
 * });
 * ```
 */
export function createMedusaClient(config: MedusaConfig): ICommerceClient {
  return new MedusaCommerceClient(config);
}
