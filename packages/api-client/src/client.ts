/**
 * API Client Manager
 *
 * Singleton manager for API client instances.
 * Useful for maintaining a global client instance in applications.
 */

import type { ICommerceClient, ApiProvider, ProviderConfig } from "./interfaces";
import { createApiClient } from "./config";

/**
 * Client instance with metadata
 */
interface ClientInstance {
  client: ICommerceClient;
  config: ProviderConfig;
  createdAt: Date;
}

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
export class ApiClientManager {
  private static instances = new Map<string, ClientInstance>();
  private static defaultInstanceKey: string | null = null;

  /**
   * Private constructor to prevent instantiation.
   */
  private constructor() {}

  /**
   * Generate a unique key for a configuration.
   */
  private static generateKey(config: ProviderConfig): string {
    return `${config.provider}:${config.baseUrl}`;
  }

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
  static initialize(config: ProviderConfig): ICommerceClient {
    const key = this.generateKey(config);
    const client = createApiClient(config);

    this.instances.set(key, {
      client,
      config,
      createdAt: new Date(),
    });

    // Set as default if first instance or no default set
    if (!this.defaultInstanceKey) {
      this.defaultInstanceKey = key;
    }

    return client;
  }

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
  static getClient(): ICommerceClient {
    if (!this.defaultInstanceKey) {
      throw new Error(
        "API client not initialized. Call ApiClientManager.initialize() first."
      );
    }

    const instance = this.instances.get(this.defaultInstanceKey);
    if (!instance) {
      throw new Error("Default client instance not found.");
    }

    return instance.client;
  }

  /**
   * Get a specific client by provider and base URL.
   *
   * @param provider - Provider type
   * @param baseUrl - Base URL
   * @returns The client or undefined
   */
  static getClientByKey(provider: ApiProvider, baseUrl: string): ICommerceClient | undefined {
    const key = `${provider}:${baseUrl}`;
    return this.instances.get(key)?.client;
  }

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
  static createNamed(name: string, config: ProviderConfig): ICommerceClient {
    const client = createApiClient(config);

    this.instances.set(name, {
      client,
      config,
      createdAt: new Date(),
    });

    return client;
  }

  /**
   * Get a named client.
   *
   * @param name - Client name
   * @returns The client
   * @throws Error if client not found
   */
  static getNamed(name: string): ICommerceClient {
    const instance = this.instances.get(name);
    if (!instance) {
      throw new Error(`API client "${name}" not found.`);
    }
    return instance.client;
  }

  /**
   * Check if a named client exists.
   *
   * @param name - Client name
   * @returns Whether client exists
   */
  static hasNamed(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Set the default client.
   *
   * @param name - Client name to set as default
   * @throws Error if client not found
   */
  static setDefault(name: string): void {
    if (!this.instances.has(name)) {
      throw new Error(`API client "${name}" not found.`);
    }
    this.defaultInstanceKey = name;
  }

  /**
   * Remove a client instance.
   *
   * @param name - Client name
   */
  static remove(name: string): void {
    this.instances.delete(name);
    if (this.defaultInstanceKey === name) {
      // Set first remaining instance as default, or null
      const firstKey = this.instances.keys().next().value as string | undefined;
      this.defaultInstanceKey = firstKey ?? null;
    }
  }

  /**
   * Clear all client instances.
   */
  static clear(): void {
    this.instances.clear();
    this.defaultInstanceKey = null;
  }

  /**
   * Get all registered client names.
   *
   * @returns Array of client names
   */
  static getClientNames(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Check if manager is initialized.
   *
   * @returns Whether any client is registered
   */
  static isInitialized(): boolean {
    return this.instances.size > 0;
  }

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
  } | null {
    const key = name ?? this.defaultInstanceKey;
    if (!key) return null;

    const instance = this.instances.get(key);
    if (!instance) return null;

    return {
      provider: instance.config.provider,
      baseUrl: instance.config.baseUrl,
      createdAt: instance.createdAt,
      enableB2B: instance.config.enableB2B ?? false,
    };
  }
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
export function getApiClient(): ICommerceClient {
  return ApiClientManager.getClient();
}

/**
 * Convenience function to get a named client.
 * Equivalent to ApiClientManager.getNamed(name).
 */
export function getNamedClient(name: string): ICommerceClient {
  return ApiClientManager.getNamed(name);
}
