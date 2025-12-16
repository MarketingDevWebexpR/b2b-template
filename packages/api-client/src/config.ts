/**
 * API Client Configuration and Factory
 *
 * Provides factory functions for creating API clients from different providers.
 */

import type {
  ICommerceClient,
  ApiProvider,
  ProviderConfig,
  CommerceClientConfig,
  CommerceClientFactory,
} from "./interfaces";

/**
 * Registry of provider adapters
 */
const providerRegistry = new Map<ApiProvider, CommerceClientFactory>();

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
export function registerProvider(
  provider: ApiProvider,
  factory: CommerceClientFactory
): void {
  providerRegistry.set(provider, factory);
}

/**
 * Unregister a provider adapter.
 *
 * @param provider - Provider name
 */
export function unregisterProvider(provider: ApiProvider): void {
  providerRegistry.delete(provider);
}

/**
 * Get a registered provider factory.
 *
 * @param provider - Provider name
 * @returns Factory function or undefined
 */
export function getProvider(provider: ApiProvider): CommerceClientFactory | undefined {
  return providerRegistry.get(provider);
}

/**
 * Check if a provider is registered.
 *
 * @param provider - Provider name
 * @returns Whether provider is registered
 */
export function hasProvider(provider: ApiProvider): boolean {
  return providerRegistry.has(provider);
}

/**
 * Get all registered providers.
 *
 * @returns Array of provider names
 */
export function getRegisteredProviders(): ApiProvider[] {
  return Array.from(providerRegistry.keys());
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<CommerceClientConfig> = {
  timeout: 30_000,
  enableB2B: false,
};

/**
 * Validate provider configuration.
 *
 * @param config - Configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: ProviderConfig): void {
  if (!config.provider) {
    throw new Error("Provider is required");
  }

  if (!config.baseUrl) {
    throw new Error("Base URL is required");
  }

  try {
    new URL(config.baseUrl);
  } catch {
    throw new Error(`Invalid base URL: ${config.baseUrl}`);
  }

  if (config.timeout !== undefined && config.timeout <= 0) {
    throw new Error("Timeout must be a positive number");
  }
}

/**
 * Merge configuration with defaults.
 *
 * @param config - User configuration
 * @returns Merged configuration
 */
export function mergeConfig(config: ProviderConfig): ProviderConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    defaultHeaders: {
      ...DEFAULT_CONFIG.defaultHeaders,
      ...config.defaultHeaders,
    },
    b2b: config.enableB2B
      ? {
          ...config.b2b,
        }
      : undefined,
  };
}

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
export function createApiClient(config: ProviderConfig): ICommerceClient {
  // Validate configuration
  validateConfig(config);

  // Check if provider is registered
  const factory = providerRegistry.get(config.provider);
  if (!factory) {
    const available = getRegisteredProviders();
    throw new Error(
      `Provider "${config.provider}" is not registered. ` +
        `Available providers: ${available.length > 0 ? available.join(", ") : "none"}. ` +
        `Make sure to import the provider package (e.g., @maison/api-medusa).`
    );
  }

  // Merge with defaults
  const mergedConfig = mergeConfig(config);

  // Create and return client
  return factory(mergedConfig);
}

/**
 * Configuration builder for fluent API.
 */
export class ApiClientConfigBuilder {
  private config: Partial<ProviderConfig> = {};

  /**
   * Set the provider.
   */
  provider(provider: ApiProvider): this {
    this.config.provider = provider;
    return this;
  }

  /**
   * Set the base URL.
   */
  baseUrl(url: string): this {
    this.config.baseUrl = url;
    return this;
  }

  /**
   * Set the region ID.
   */
  regionId(id: string): this {
    this.config.regionId = id;
    return this;
  }

  /**
   * Set the publishable key.
   */
  publishableKey(key: string): this {
    this.config.publishableKey = key;
    return this;
  }

  /**
   * Set the auth token.
   */
  authToken(token: string): this {
    this.config.authToken = token;
    return this;
  }

  /**
   * Set the timeout.
   */
  timeout(ms: number): this {
    this.config.timeout = ms;
    return this;
  }

  /**
   * Add default headers.
   */
  headers(headers: Record<string, string>): this {
    this.config.defaultHeaders = {
      ...this.config.defaultHeaders,
      ...headers,
    };
    return this;
  }

  /**
   * Enable B2B features.
   */
  enableB2B(companyId?: string, employeeId?: string): this {
    this.config.enableB2B = true;
    this.config.b2b = { companyId, employeeId };
    return this;
  }

  /**
   * Set provider-specific options.
   */
  providerOptions(options: Record<string, unknown>): this {
    this.config.providerOptions = {
      ...this.config.providerOptions,
      ...options,
    };
    return this;
  }

  /**
   * Build the client.
   */
  build(): ICommerceClient {
    if (!this.config.provider || !this.config.baseUrl) {
      throw new Error("Provider and baseUrl are required");
    }
    return createApiClient(this.config as ProviderConfig);
  }
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
export function apiClient(): ApiClientConfigBuilder {
  return new ApiClientConfigBuilder();
}
