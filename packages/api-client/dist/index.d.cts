import { ProviderConfig, ICommerceClient, ApiProvider, CommerceClientFactory, CommerceClientConfig } from './interfaces/index.cjs';
export { AddToCartInput, AddressInput, ApprovalActionResult, ApprovalStats, AuthResult, BudgetSummary, BulkAddResult, BulkAddToCartInput, Cart, CartDiscount, CartLineItem, CartShippingOption, CartTotals, CategoryTreeNode, CategoryWithHierarchy, CompanyRegistrationRequest, CompanyRegistrationResult, CreateDirectOrderInput, CreateOrderInput, CreditAdjustmentInput, CreditHistoryEntry, Customer, CustomerAddress, CustomerInput, EmployeeLoginResult, GetProductOptions, IApprovalService, IB2BServices, ICartService, ICategoryService, ICompanyService, ICustomerService, IEmployeeService, IOrderService, IProductService, IQuoteService, ISpendingService, ListApprovalsOptions, ListCategoriesOptions, ListCompaniesOptions, ListEmployeesOptions, ListOrdersOptions, ListProductsOptions, ListQuotesOptions, ListSpendingLimitsOptions, OrderFulfillment, OrderRefund, OrderWithDetails, PasswordResetResult, ProductFacets, ProductInventory, ProductSearchResult, ProductWithRelated, QuoteConversionResult, QuotePdfOptions, SpendingCheckResult, UpdateCartItemInput } from './interfaces/index.cjs';
import '@maison/api-core';
import '@maison/types';

/**
 * API Client Configuration and Factory
 *
 * Provides factory functions for creating API clients from different providers.
 */

/**
 * Register a provider adapter.
 *
 * @param provider - Provider name
 * @param factory - Factory function
 *
 * @example
 * ```typescript
 * // In @maison/api-medusa package
 * import { registerProvider } from "@maison/api-client";
 * import { createMedusaClient } from "./client";
 *
 * registerProvider("medusa", createMedusaClient);
 * ```
 */
declare function registerProvider(provider: ApiProvider, factory: CommerceClientFactory): void;
/**
 * Unregister a provider adapter.
 *
 * @param provider - Provider name
 */
declare function unregisterProvider(provider: ApiProvider): void;
/**
 * Get a registered provider factory.
 *
 * @param provider - Provider name
 * @returns Factory function or undefined
 */
declare function getProvider(provider: ApiProvider): CommerceClientFactory | undefined;
/**
 * Check if a provider is registered.
 *
 * @param provider - Provider name
 * @returns Whether provider is registered
 */
declare function hasProvider(provider: ApiProvider): boolean;
/**
 * Get all registered providers.
 *
 * @returns Array of provider names
 */
declare function getRegisteredProviders(): ApiProvider[];
/**
 * Default configuration values
 */
declare const DEFAULT_CONFIG: Partial<CommerceClientConfig>;
/**
 * Validate provider configuration.
 *
 * @param config - Configuration to validate
 * @throws Error if configuration is invalid
 */
declare function validateConfig(config: ProviderConfig): void;
/**
 * Merge configuration with defaults.
 *
 * @param config - User configuration
 * @returns Merged configuration
 */
declare function mergeConfig(config: ProviderConfig): ProviderConfig;
/**
 * Create an API client for the specified provider.
 *
 * @param config - Provider configuration
 * @returns Commerce client instance
 * @throws Error if provider is not registered or config is invalid
 *
 * @example
 * ```typescript
 * // Create Medusa client
 * const api = createApiClient({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx",
 *   enableB2B: true
 * });
 *
 * // Create Bridge client
 * const bridgeApi = createApiClient({
 *   provider: "bridge",
 *   baseUrl: "https://bridge.mycompany.com",
 *   authToken: "api_key_xxx"
 * });
 * ```
 */
declare function createApiClient(config: ProviderConfig): ICommerceClient;
/**
 * Configuration builder for fluent API.
 */
declare class ApiClientConfigBuilder {
    private config;
    /**
     * Set the provider.
     */
    provider(provider: ApiProvider): this;
    /**
     * Set the base URL.
     */
    baseUrl(url: string): this;
    /**
     * Set the region ID.
     */
    regionId(id: string): this;
    /**
     * Set the publishable key.
     */
    publishableKey(key: string): this;
    /**
     * Set the auth token.
     */
    authToken(token: string): this;
    /**
     * Set the timeout.
     */
    timeout(ms: number): this;
    /**
     * Add default headers.
     */
    headers(headers: Record<string, string>): this;
    /**
     * Enable B2B features.
     */
    enableB2B(companyId?: string, employeeId?: string): this;
    /**
     * Set provider-specific options.
     */
    providerOptions(options: Record<string, unknown>): this;
    /**
     * Build the client.
     */
    build(): ICommerceClient;
}
/**
 * Start building an API client configuration.
 *
 * @example
 * ```typescript
 * const api = apiClient()
 *   .provider("medusa")
 *   .baseUrl("https://api.mystore.com")
 *   .regionId("reg_123")
 *   .enableB2B("comp_456")
 *   .build();
 * ```
 */
declare function apiClient(): ApiClientConfigBuilder;

/**
 * API Client Manager
 *
 * Singleton manager for API client instances.
 * Useful for maintaining a global client instance in applications.
 */

/**
 * API Client Manager - Singleton pattern for managing API client instances.
 *
 * @example
 * ```typescript
 * // Initialize once at app startup
 * ApiClientManager.initialize({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123"
 * });
 *
 * // Use anywhere in the app
 * const products = await ApiClientManager.getClient().products.list();
 * ```
 */
declare class ApiClientManager {
    private static instances;
    private static defaultInstanceKey;
    /**
     * Private constructor to prevent instantiation.
     */
    private constructor();
    /**
     * Generate a unique key for a configuration.
     */
    private static generateKey;
    /**
     * Initialize the default API client.
     *
     * @param config - Provider configuration
     * @returns The initialized client
     *
     * @example
     * ```typescript
     * ApiClientManager.initialize({
     *   provider: "medusa",
     *   baseUrl: "https://api.mystore.com",
     *   regionId: "reg_123",
     *   enableB2B: true
     * });
     * ```
     */
    static initialize(config: ProviderConfig): ICommerceClient;
    /**
     * Get the default client instance.
     *
     * @returns The default client
     * @throws Error if no client is initialized
     *
     * @example
     * ```typescript
     * const api = ApiClientManager.getClient();
     * const products = await api.products.list();
     * ```
     */
    static getClient(): ICommerceClient;
    /**
     * Get a specific client by provider and base URL.
     *
     * @param provider - Provider type
     * @param baseUrl - Base URL
     * @returns The client or undefined
     */
    static getClientByKey(provider: ApiProvider, baseUrl: string): ICommerceClient | undefined;
    /**
     * Create and register a named client.
     *
     * @param name - Client name
     * @param config - Provider configuration
     * @returns The created client
     *
     * @example
     * ```typescript
     * // Create multiple clients
     * ApiClientManager.createNamed("primary", {
     *   provider: "medusa",
     *   baseUrl: "https://primary.mystore.com"
     * });
     *
     * ApiClientManager.createNamed("secondary", {
     *   provider: "bridge",
     *   baseUrl: "https://bridge.mystore.com"
     * });
     *
     * // Use specific client
     * const api = ApiClientManager.getNamed("secondary");
     * ```
     */
    static createNamed(name: string, config: ProviderConfig): ICommerceClient;
    /**
     * Get a named client.
     *
     * @param name - Client name
     * @returns The client
     * @throws Error if client not found
     */
    static getNamed(name: string): ICommerceClient;
    /**
     * Check if a named client exists.
     *
     * @param name - Client name
     * @returns Whether client exists
     */
    static hasNamed(name: string): boolean;
    /**
     * Set the default client.
     *
     * @param name - Client name to set as default
     * @throws Error if client not found
     */
    static setDefault(name: string): void;
    /**
     * Remove a client instance.
     *
     * @param name - Client name
     */
    static remove(name: string): void;
    /**
     * Clear all client instances.
     */
    static clear(): void;
    /**
     * Get all registered client names.
     *
     * @returns Array of client names
     */
    static getClientNames(): string[];
    /**
     * Check if manager is initialized.
     *
     * @returns Whether any client is registered
     */
    static isInitialized(): boolean;
    /**
     * Get client metadata.
     *
     * @param name - Client name (optional, defaults to default client)
     * @returns Client metadata
     */
    static getMetadata(name?: string): {
        provider: ApiProvider;
        baseUrl: string;
        createdAt: Date;
        enableB2B: boolean;
    } | null;
}
/**
 * Convenience function to get the default client.
 * Equivalent to ApiClientManager.getClient().
 *
 * @example
 * ```typescript
 * import { getApiClient } from "@maison/api-client";
 *
 * const api = getApiClient();
 * const products = await api.products.list();
 * ```
 */
declare function getApiClient(): ICommerceClient;
/**
 * Convenience function to get a named client.
 * Equivalent to ApiClientManager.getNamed(name).
 */
declare function getNamedClient(name: string): ICommerceClient;

export { ApiClientConfigBuilder, ApiClientManager, ApiProvider, CommerceClientConfig, CommerceClientFactory, DEFAULT_CONFIG, ICommerceClient, ProviderConfig, apiClient, createApiClient, getApiClient, getNamedClient, getProvider, getRegisteredProviders, hasProvider, mergeConfig, registerProvider, unregisterProvider, validateConfig };
