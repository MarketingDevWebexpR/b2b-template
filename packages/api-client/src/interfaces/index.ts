/**
 * API Client Interfaces
 *
 * This module exports all service interfaces for the unified API client.
 * Adapters implement these interfaces to provide consistent API across providers.
 *
 * @packageDocumentation
 */

// Main commerce client interface
export type {
  ICommerceClient,
  IB2BServices,
  CommerceClientConfig,
  ProviderConfig,
  ApiProvider,
  CommerceClientFactory,
} from "./commerce-client";

// Product service
export type {
  IProductService,
  ListProductsOptions,
  GetProductOptions,
  ProductWithRelated,
  ProductSearchResult,
  ProductFacets,
  ProductInventory,
} from "./products";

// Category service
export type {
  ICategoryService,
  CategoryWithHierarchy,
  CategoryTreeNode,
  ListCategoriesOptions,
} from "./categories";

// Cart service
export type {
  ICartService,
  Cart,
  CartLineItem,
  CartDiscount,
  CartShippingOption,
  CartTotals,
  AddToCartInput,
  UpdateCartItemInput,
  BulkAddToCartInput,
  BulkAddResult,
} from "./cart";

// Order service
export type {
  IOrderService,
  ListOrdersOptions,
  CreateOrderInput,
  CreateDirectOrderInput,
  OrderWithDetails,
  OrderFulfillment,
  OrderRefund,
} from "./orders";

// Customer service
export type {
  ICustomerService,
  Customer,
  CustomerAddress,
  CustomerInput,
  AddressInput,
  AuthResult,
  PasswordResetResult,
} from "./customers";

// B2B services
export * from "./b2b";
