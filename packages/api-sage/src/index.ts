/**
 * @maison/api-sage
 *
 * Sage ERP API adapter for Maison packages.
 * Provides integration with Sage ERP/accounting systems for:
 * - Product catalog synchronization
 * - Real-time inventory levels
 * - Price list management
 *
 * @remarks
 * Sage is primarily an ERP system, not a full e-commerce platform.
 * For cart, checkout, and customer operations, use one of the
 * e-commerce adapters (Medusa, Bridge, Shopify).
 *
 * @example
 * ```typescript
 * import { SageCommerceClient } from "@maison/api-sage";
 *
 * const sage = new SageCommerceClient({
 *   baseUrl: "https://sage-api.example.com",
 *   companyId: "COMPANY_001",
 *   authToken: "your-token"
 * });
 *
 * // Fetch products
 * const products = await sage.products.list();
 *
 * // Get inventory
 * const inventory = await sage.products.getInventory("PROD001");
 *
 * // Sync products from ERP
 * await sage.syncProducts();
 * ```
 *
 * @packageDocumentation
 */

// Main commerce client
export { SageCommerceClient, type SageCommerceClientConfig } from "./commerce-client";

// Legacy client (for backward compatibility)
export { SageApiClient } from "./client";

// Types
export type {
  SageConfig,
  SageProduct,
  SageInventory,
  SageRawArticle,
  SageRawFamille,
  SageStatistiqueArticle,
  SageInfoLibre,
  SageProductsResponse,
  SageArticlesResponse,
  SageInventoryResponse,
  SageSyncResult,
} from "./types";

// Mappers (for custom integrations)
export {
  mapSageProduct,
  mapSageProducts,
  mapSageArticle,
  mapSageArticles,
} from "./mappers";

// Services (for advanced usage)
export { SageProductService } from "./services";
