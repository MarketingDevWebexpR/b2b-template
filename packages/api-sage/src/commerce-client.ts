/**
 * Sage Commerce Client
 *
 * Implements ICommerceClient for Sage ERP integration.
 * Provides product and inventory synchronization from Sage.
 *
 * @remarks
 * Sage is primarily an ERP/accounting system, so many e-commerce
 * features (cart, checkout, customer auth) are not available.
 * This client is best used for:
 * - Product catalog synchronization
 * - Real-time inventory levels
 * - Price list management
 */

import type {
  ICommerceClient,
  IProductService,
  ICategoryService,
  ICartService,
  IOrderService,
  ICustomerService,
  IB2BServices,
  CommerceClientConfig,
  ApiProvider,
  CategoryWithHierarchy,
  CategoryTreeNode,
  Cart,
  BulkAddResult,
  CartShippingOption,
  OrderWithDetails,
  OrderFulfillment,
  OrderRefund,
  Customer,
  CustomerAddress,
  AuthResult,
  PasswordResetResult,
} from "@maison/api-client";
import type { Category, Order } from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";
import { SageApiClient } from "./client";
import { SageProductService } from "./services/products";
import type { SageConfig } from "./types";

/**
 * Helper to create not implemented error
 */
function notImplemented(method: string): never {
  throw new Error(`${method} is not available in Sage adapter. Sage is an ERP system, not a full e-commerce platform.`);
}

/**
 * Create a stub category service
 *
 * @remarks
 * Sage can provide family/category data but with limited hierarchy.
 * For full category management, use the primary e-commerce backend.
 */
function createStubCategoryService(): ICategoryService {
  return {
    async list(): Promise<Category[]> {
      return [];
    },
    async get(_id: string): Promise<CategoryWithHierarchy> {
      notImplemented("categories.get");
    },
    async getBySlug(_slug: string): Promise<CategoryWithHierarchy> {
      notImplemented("categories.getBySlug");
    },
    async getTree(): Promise<CategoryTreeNode[]> {
      return [];
    },
    async getRoots(): Promise<Category[]> {
      return [];
    },
    async getChildren(_parentId: string): Promise<Category[]> {
      return [];
    },
    async getBreadcrumbs(_categoryId: string): Promise<Category[]> {
      return [];
    },
    async getMany(_ids: string[]): Promise<Category[]> {
      return [];
    },
  };
}

/**
 * Create a stub cart service
 *
 * @remarks
 * Sage doesn't have cart functionality.
 * Use the primary e-commerce backend for cart operations.
 */
function createStubCartService(): ICartService {
  return {
    async get(_cartId?: string): Promise<Cart> {
      notImplemented("cart.get");
    },
    async create(_regionId?: string, _customerId?: string): Promise<Cart> {
      notImplemented("cart.create");
    },
    async addItem(_cartId: string, _input: Parameters<ICartService["addItem"]>[1]): Promise<Cart> {
      notImplemented("cart.addItem");
    },
    async updateItem(_cartId: string, _itemId: string, _input: Parameters<ICartService["updateItem"]>[2]): Promise<Cart> {
      notImplemented("cart.updateItem");
    },
    async removeItem(_cartId: string, _itemId: string): Promise<Cart> {
      notImplemented("cart.removeItem");
    },
    async addItemsBulk(_cartId: string, _input: Parameters<ICartService["addItemsBulk"]>[1]): Promise<BulkAddResult> {
      notImplemented("cart.addItemsBulk");
    },
    async clear(_cartId: string): Promise<Cart> {
      notImplemented("cart.clear");
    },
    async applyDiscount(_cartId: string, _code: string): Promise<Cart> {
      notImplemented("cart.applyDiscount");
    },
    async removeDiscount(_cartId: string, _discountId: string): Promise<Cart> {
      notImplemented("cart.removeDiscount");
    },
    async setShippingOption(_cartId: string, _optionId: string): Promise<Cart> {
      notImplemented("cart.setShippingOption");
    },
    async getShippingOptions(_cartId: string): Promise<CartShippingOption[]> {
      return [];
    },
    async setCustomer(_cartId: string, _customerId: string): Promise<Cart> {
      notImplemented("cart.setCustomer");
    },
    async setAddresses(_cartId: string, _shippingAddressId: string, _billingAddressId?: string): Promise<Cart> {
      notImplemented("cart.setAddresses");
    },
    async updateMetadata(_cartId: string, _metadata: Record<string, unknown>): Promise<Cart> {
      notImplemented("cart.updateMetadata");
    },
    async delete(_cartId: string): Promise<void> {
      // No-op
    },
    async merge(_guestCartId: string, _customerCartId: string): Promise<Cart> {
      notImplemented("cart.merge");
    },
  };
}

/**
 * Create a stub order service
 *
 * @remarks
 * Sage can sync order data but doesn't manage orders directly.
 * Order creation should be done via the primary e-commerce backend.
 */
function createStubOrderService(): IOrderService {
  return {
    async list(_options?: Parameters<IOrderService["list"]>[0]): Promise<PaginatedResponse<Order>> {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
    async get(_id: string): Promise<OrderWithDetails> {
      notImplemented("orders.get");
    },
    async getByNumber(_orderNumber: string): Promise<OrderWithDetails> {
      notImplemented("orders.getByNumber");
    },
    async create(_input: Parameters<IOrderService["create"]>[0]): Promise<Order> {
      notImplemented("orders.create");
    },
    async createDirect(_input: Parameters<IOrderService["createDirect"]>[0]): Promise<Order> {
      notImplemented("orders.createDirect");
    },
    async cancel(_orderId: string, _reason?: string): Promise<Order> {
      notImplemented("orders.cancel");
    },
    async updateNotes(_orderId: string, _notes: string): Promise<Order> {
      notImplemented("orders.updateNotes");
    },
    async getFulfillments(_orderId: string): Promise<OrderFulfillment[]> {
      return [];
    },
    async getRefunds(_orderId: string): Promise<OrderRefund[]> {
      return [];
    },
    async requestRefund(_orderId: string, _items: Array<{ orderItemId: string; quantity: number }>, _reason: string): Promise<OrderRefund> {
      notImplemented("orders.requestRefund");
    },
    async getCustomerOrders(_customerId: string, _options?: Parameters<IOrderService["getCustomerOrders"]>[1]): Promise<PaginatedResponse<Order>> {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
    async getCompanyOrders(_companyId: string, _options?: Parameters<IOrderService["getCompanyOrders"]>[1]): Promise<PaginatedResponse<Order>> {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
    async reorder(_orderId: string): Promise<Cart> {
      notImplemented("orders.reorder");
    },
    async getInvoiceUrl(_orderId: string): Promise<string> {
      notImplemented("orders.getInvoiceUrl");
    },
    async track(_orderId: string): Promise<{ status: string }> {
      notImplemented("orders.track");
    },
  };
}

/**
 * Create a stub customer service
 *
 * @remarks
 * Sage manages business contacts but not e-commerce customers.
 * Customer auth should be done via the primary e-commerce backend.
 */
function createStubCustomerService(): ICustomerService {
  return {
    async getCurrent(): Promise<Customer> {
      notImplemented("customers.getCurrent");
    },
    async get(_id: string): Promise<Customer> {
      notImplemented("customers.get");
    },
    async getByEmail(_email: string): Promise<Customer> {
      notImplemented("customers.getByEmail");
    },
    async update(_customerId: string, _input: Parameters<ICustomerService["update"]>[1]): Promise<Customer> {
      notImplemented("customers.update");
    },
    async register(_email: string, _password: string, _profile?: Parameters<ICustomerService["register"]>[2]): Promise<AuthResult> {
      notImplemented("customers.register");
    },
    async login(_email: string, _password: string): Promise<AuthResult> {
      notImplemented("customers.login");
    },
    async logout(): Promise<void> {
      // No-op
    },
    async refreshToken(_refreshToken: string): Promise<AuthResult> {
      notImplemented("customers.refreshToken");
    },
    async requestPasswordReset(_email: string): Promise<PasswordResetResult> {
      return { success: false, message: "Password reset not available via Sage" };
    },
    async resetPassword(_token: string, _newPassword: string): Promise<{ success: boolean }> {
      return { success: false };
    },
    async changePassword(_currentPassword: string, _newPassword: string): Promise<{ success: boolean }> {
      return { success: false };
    },
    async listAddresses(_customerId: string): Promise<CustomerAddress[]> {
      return [];
    },
    async getAddress(_customerId: string, _addressId: string): Promise<CustomerAddress> {
      notImplemented("customers.getAddress");
    },
    async addAddress(_customerId: string, _input: Parameters<ICustomerService["addAddress"]>[1]): Promise<CustomerAddress> {
      notImplemented("customers.addAddress");
    },
    async updateAddress(_customerId: string, _addressId: string, _input: Parameters<ICustomerService["updateAddress"]>[2]): Promise<CustomerAddress> {
      notImplemented("customers.updateAddress");
    },
    async deleteAddress(_customerId: string, _addressId: string): Promise<void> {
      // No-op
    },
    async setDefaultAddress(_customerId: string, _addressId: string, _type: "shipping" | "billing"): Promise<CustomerAddress> {
      notImplemented("customers.setDefaultAddress");
    },
    async getDefaultShippingAddress(_customerId: string): Promise<CustomerAddress | null> {
      return null;
    },
    async getDefaultBillingAddress(_customerId: string): Promise<CustomerAddress | null> {
      return null;
    },
    async delete(_customerId: string): Promise<void> {
      notImplemented("customers.delete");
    },
  };
}

/**
 * Sage Commerce Client configuration
 */
export interface SageCommerceClientConfig extends CommerceClientConfig {
  /** Sage company ID (required) */
  companyId: string;
  /** Sage API version */
  apiVersion?: string;
  /** Default currency */
  currency?: string;
}

/**
 * Sage Commerce Client
 *
 * Implements ICommerceClient for Sage ERP integration.
 *
 * @example
 * ```typescript
 * import { SageCommerceClient } from "@maison/api-sage";
 *
 * const client = new SageCommerceClient({
 *   baseUrl: "https://sage-proxy.example.com",
 *   companyId: "COMPANY_001",
 *   authToken: "your-api-token"
 * });
 *
 * // Fetch products from Sage
 * const products = await client.products.list();
 *
 * // Get inventory for specific products
 * const inventory = await client.products.getInventoryBulk(["SKU1", "SKU2"]);
 * ```
 */
export class SageCommerceClient implements ICommerceClient {
  public readonly name = "sage";
  public readonly version = "1.0.0";
  public readonly provider: ApiProvider = "sage";
  public readonly config: CommerceClientConfig;

  private readonly sageClient: SageApiClient;
  private authToken: string | null = null;
  private b2bContext: { companyId?: string; employeeId?: string } | null = null;

  // Services
  public readonly products: IProductService;
  public readonly categories: ICategoryService;
  public readonly cart: ICartService;
  public readonly orders: IOrderService;
  public readonly customers: ICustomerService;
  public readonly b2b: IB2BServices | null = null; // Sage doesn't support B2B workflow

  constructor(config: SageCommerceClientConfig) {
    this.config = config;

    // Create Sage-specific config
    const sageConfig: SageConfig = {
      baseUrl: config.baseUrl,
      companyId: config.companyId,
      ...(config.apiVersion && { apiVersion: config.apiVersion }),
      ...(config.currency && { currency: config.currency }),
      ...(config.authToken && { authToken: config.authToken }),
      ...(config.timeout !== undefined && { timeout: config.timeout }),
      ...(config.defaultHeaders && { defaultHeaders: config.defaultHeaders }),
    };

    this.sageClient = new SageApiClient(sageConfig);

    if (config.authToken) {
      this.authToken = config.authToken;
    }

    // Initialize services
    this.products = new SageProductService(this.sageClient);
    this.categories = createStubCategoryService();
    this.cart = createStubCartService();
    this.orders = createStubOrderService();
    this.customers = createStubCustomerService();
  }

  /**
   * Initialize the client (verify connection)
   */
  async initialize(): Promise<void> {
    await this.sageClient.initialize();
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return this.sageClient.isConfigured();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return this.sageClient.healthCheck();
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    // Note: SageApiClient handles auth via config, would need refactoring
    // to support dynamic token changes
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.authToken = null;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Set B2B context
   *
   * @remarks
   * Sage doesn't have native B2B workflow, but we track context
   * for potential filtering/reporting purposes.
   */
  setB2BContext(companyId: string, employeeId?: string): void {
    this.b2bContext = { companyId };
    if (employeeId) {
      this.b2bContext.employeeId = employeeId;
    }
  }

  /**
   * Clear B2B context
   */
  clearB2BContext(): void {
    this.b2bContext = null;
  }

  /**
   * Get current B2B context
   */
  getB2BContext(): { companyId?: string; employeeId?: string } | null {
    return this.b2bContext;
  }

  /**
   * Check if B2B is enabled
   *
   * @remarks
   * Always returns false for Sage as it doesn't support B2B workflow.
   */
  isB2BEnabled(): boolean {
    return false;
  }

  /**
   * Get underlying HTTP client
   */
  getHttpClient(): {
    get<T>(path: string, options?: Record<string, unknown>): Promise<T>;
    post<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
    put<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
    patch<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
    delete<T>(path: string, options?: Record<string, unknown>): Promise<T>;
  } {
    return {
      get: async <T>(path: string, options?: Record<string, unknown>) => {
        const response = await this.sageClient.get<T>(path, options);
        return response.data;
      },
      post: async <T>(path: string, body?: unknown, _options?: Record<string, unknown>) => {
        const response = await this.sageClient.post<T>(path, body);
        return response.data;
      },
      put: async <T>(path: string, body?: unknown, _options?: Record<string, unknown>) => {
        const response = await this.sageClient.put<T>(path, body);
        return response.data;
      },
      patch: async <T>(path: string, body?: unknown, _options?: Record<string, unknown>) => {
        const response = await this.sageClient.patch<T>(path, body);
        return response.data;
      },
      delete: async <T>(path: string, _options?: Record<string, unknown>) => {
        const response = await this.sageClient.delete<T>(path);
        return response.data;
      },
    };
  }

  /**
   * Sync products from Sage (convenience method)
   *
   * @remarks
   * Triggers a full product sync from Sage ERP.
   */
  async syncProducts(): Promise<{ synced: number; errors: readonly string[] }> {
    return this.sageClient.syncProducts();
  }

  /**
   * Update inventory (convenience method)
   *
   * @remarks
   * Updates inventory quantity in Sage for a specific product/warehouse.
   */
  async updateInventory(productId: string, warehouseId: string, quantity: number) {
    return this.sageClient.updateInventory(productId, warehouseId, quantity);
  }
}
