/**
 * @maison/api-client
 *
 * Unified API client facade for multi-source B2B e-commerce.
 *
 * This package provides a consistent interface for interacting with
 * various e-commerce backends (Medusa V2, Bridge Laravel, Shopify Plus, etc.)
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { createApiClient, ApiClientManager } from "@maison/api-client";
 *
 * // Option 1: Direct creation
 * const api = createApiClient({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   enableB2B: true
 * });
 *
 * // Option 2: Using the manager (singleton pattern)
 * ApiClientManager.initialize({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123"
 * });
 * const api2 = ApiClientManager.getClient();
 *
 * // Use the API
 * const products = await api.products.list({ pageSize: 20 });
 * const cart = await api.cart.addItem(cartId, { productId: "prod_1", quantity: 2 });
 *
 * // B2B operations
 * if (api.isB2BEnabled()) {
 *   const quote = await api.b2b.quotes.createFromCart(cartId);
 *   const employees = await api.b2b.employees.list({ companyId: "comp_123" });
 * }
 * ```
 */

// Configuration and factory
export {
  createApiClient,
  registerProvider,
  unregisterProvider,
  getProvider,
  hasProvider,
  getRegisteredProviders,
  validateConfig,
  mergeConfig,
  apiClient,
  ApiClientConfigBuilder,
  DEFAULT_CONFIG,
} from "./config";

// Client manager
export {
  ApiClientManager,
  getApiClient,
  getNamedClient,
} from "./client";

// Re-export all interfaces
export * from "./interfaces";
