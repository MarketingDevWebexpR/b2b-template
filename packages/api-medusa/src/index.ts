/**
 * @maison/api-medusa
 *
 * Medusa V2 adapter for the unified commerce API client.
 *
 * This package provides ICommerceClient implementation for Medusa V2 backend,
 * including support for B2B features through custom Medusa plugins.
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { createMedusaClient, registerMedusaProvider } from "@maison/api-medusa";
 * import { createApiClient, registerProvider } from "@maison/api-client";
 *
 * // Option 1: Direct creation
 * const medusaClient = createMedusaClient({
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx",
 *   enableB2B: true
 * });
 *
 * // Option 2: Register with api-client factory
 * registerMedusaProvider();
 * const client = createApiClient({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx"
 * });
 *
 * // Use the client
 * const products = await client.products.list({ pageSize: 20 });
 * const cart = await client.cart.create();
 * ```
 */

import { registerProvider, type ProviderConfig, type ICommerceClient } from "@maison/api-client";
import { MedusaCommerceClient, createMedusaClient, type MedusaConfig } from "./client";

// Export client and factory
export { MedusaCommerceClient, createMedusaClient, type MedusaConfig } from "./client";

// Export services
export { MedusaProductService } from "./services/products";
export { MedusaCartService } from "./services/cart";

// Export mappers
export * from "./mappers";

/**
 * Register Medusa provider with the api-client factory.
 *
 * After calling this, you can use `createApiClient({ provider: "medusa", ... })`
 * to create Medusa clients through the unified factory.
 *
 * @example
 * ```typescript
 * import { registerMedusaProvider } from "@maison/api-medusa";
 * import { createApiClient } from "@maison/api-client";
 *
 * // Register once at app startup
 * registerMedusaProvider();
 *
 * // Now create clients using the factory
 * const client = createApiClient({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123"
 * });
 * ```
 */
export function registerMedusaProvider(): void {
  registerProvider("medusa", (config: ProviderConfig): ICommerceClient => {
    return createMedusaClient(config as MedusaConfig);
  });
}

// Auto-register provider when module is imported (side effect)
// Users can also call registerMedusaProvider() manually for explicit registration
try {
  registerMedusaProvider();
} catch {
  // Provider might already be registered, ignore
}
