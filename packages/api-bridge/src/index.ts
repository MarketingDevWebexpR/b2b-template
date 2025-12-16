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

import {
  registerProvider,
  type ProviderConfig,
  type ICommerceClient,
} from "@maison/api-client";
import {
  BridgeCommerceClient,
  createBridgeClient,
  type BridgeConfig,
} from "./client";

// Export client and factory
export {
  BridgeCommerceClient,
  createBridgeClient,
  type BridgeConfig,
} from "./client";

// Export services
export {
  BridgeProductService,
} from "./services/products";

export {
  BridgeInventoryService,
  type BridgeInventoryItem,
  type InventoryUpdateRequest,
  type InventoryReservation,
  type InventorySyncStatus,
} from "./services/inventory";

export {
  BridgeSyncService,
  type SyncJob,
  type SyncJobStatus,
  type SyncEntityType,
  type SyncLogEntry,
  type SyncConfig,
  type SyncWebhookEvent,
} from "./services/sync";

// Export mappers
export * from "./mappers";

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
export function registerBridgeProvider(): void {
  registerProvider("bridge", (config: ProviderConfig): ICommerceClient => {
    const opts = config.providerOptions ?? {};
    const apiKey = opts["apiKey"] as string | undefined;
    const tenantId = opts["tenantId"] as string | undefined;
    const currency = (opts["currency"] as string | undefined) ?? "EUR";
    const enableInventorySync = (opts["enableInventorySync"] as boolean | undefined) ?? true;
    const enableSyncService = (opts["enableSyncService"] as boolean | undefined) ?? true;

    const bridgeConfig: BridgeConfig = {
      ...config,
      currency,
      enableInventorySync,
      enableSyncService,
      ...(apiKey !== undefined && { apiKey }),
      ...(tenantId !== undefined && { tenantId }),
    };
    return createBridgeClient(bridgeConfig);
  });
}

// Auto-register provider when module is imported (side effect)
try {
  registerBridgeProvider();
} catch {
  // Provider might already be registered, ignore
}
