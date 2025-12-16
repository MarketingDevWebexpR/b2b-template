/**
 * Commerce Client Interface
 * Main interface that all API adapters must implement.
 */

import type { ApiAdapter } from "@maison/api-core";
import type { IProductService } from "./products";
import type { ICategoryService } from "./categories";
import type { ICartService } from "./cart";
import type { IOrderService } from "./orders";
import type { ICustomerService } from "./customers";
import type {
  ICompanyService,
  IEmployeeService,
  IQuoteService,
  IApprovalService,
  ISpendingService,
} from "./b2b";

/**
 * B2B services namespace
 */
export interface IB2BServices {
  /** Company management */
  readonly companies: ICompanyService;
  /** Employee management */
  readonly employees: IEmployeeService;
  /** Quote management */
  readonly quotes: IQuoteService;
  /** Approval workflows */
  readonly approvals: IApprovalService;
  /** Spending limits */
  readonly spending: ISpendingService;
}

/**
 * Commerce client configuration
 */
export interface CommerceClientConfig {
  /** Base URL for the API */
  baseUrl: string;
  /** Region/market ID */
  regionId?: string;
  /** Publishable API key */
  publishableKey?: string;
  /** Auth token */
  authToken?: string;
  /** Default timeout in ms */
  timeout?: number;
  /** Default headers */
  defaultHeaders?: Record<string, string>;
  /** Custom fetch implementation */
  fetch?: typeof globalThis.fetch;
  /** Enable B2B features */
  enableB2B?: boolean;
  /** B2B specific config */
  b2b?: {
    /** Company ID */
    companyId?: string;
    /** Employee ID */
    employeeId?: string;
  };
}

/**
 * API provider type
 */
export type ApiProvider = "medusa" | "bridge" | "sage" | "shopify" | "custom";

/**
 * Provider configuration
 */
export interface ProviderConfig extends CommerceClientConfig {
  /** Provider type */
  provider: ApiProvider;
  /** Provider-specific options */
  providerOptions?: Record<string, unknown>;
}

/**
 * Main commerce client interface.
 * All API adapters must implement this interface.
 *
 * @example
 * ```typescript
 * // Using with Medusa adapter
 * const api = createApiClient({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   enableB2B: true
 * });
 *
 * // Fetch products
 * const products = await api.products.list({ pageSize: 20 });
 *
 * // Add to cart
 * const cart = await api.cart.addItem(cartId, {
 *   productId: "prod_123",
 *   quantity: 2
 * });
 *
 * // B2B: Create quote
 * const quote = await api.b2b.quotes.createFromCart(cartId);
 * ```
 */
export interface ICommerceClient extends ApiAdapter {
  /** Provider type */
  readonly provider: ApiProvider;

  /** Configuration */
  readonly config: CommerceClientConfig;

  // Core commerce services
  /** Product operations */
  readonly products: IProductService;

  /** Category operations */
  readonly categories: ICategoryService;

  /** Cart operations */
  readonly cart: ICartService;

  /** Order operations */
  readonly orders: IOrderService;

  /** Customer operations */
  readonly customers: ICustomerService;

  // B2B services (optional based on enableB2B)
  /** B2B operations (companies, employees, quotes, approvals, spending) */
  readonly b2b: IB2BServices | null;

  /**
   * Set authentication token.
   *
   * @param token - Auth token
   */
  setAuthToken(token: string): void;

  /**
   * Clear authentication.
   */
  clearAuth(): void;

  /**
   * Get current auth token.
   *
   * @returns Current token or null
   */
  getAuthToken(): string | null;

  /**
   * Set B2B context (company and employee).
   *
   * @param companyId - Company ID
   * @param employeeId - Employee ID
   */
  setB2BContext(companyId: string, employeeId?: string): void;

  /**
   * Clear B2B context.
   */
  clearB2BContext(): void;

  /**
   * Get current B2B context.
   *
   * @returns Current B2B context
   */
  getB2BContext(): { companyId?: string; employeeId?: string } | null;

  /**
   * Check if B2B is enabled.
   *
   * @returns Whether B2B is enabled
   */
  isB2BEnabled(): boolean;

  /**
   * Get the underlying HTTP client.
   * Useful for custom requests not covered by services.
   */
  getHttpClient(): {
    get<T>(path: string, options?: Record<string, unknown>): Promise<T>;
    post<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
    put<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
    patch<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
    delete<T>(path: string, options?: Record<string, unknown>): Promise<T>;
  };
}

/**
 * Commerce client factory function type
 */
export type CommerceClientFactory = (config: ProviderConfig) => ICommerceClient;
