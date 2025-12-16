// src/config.ts
var providerRegistry = /* @__PURE__ */ new Map();
function registerProvider(provider, factory) {
  providerRegistry.set(provider, factory);
}
function unregisterProvider(provider) {
  providerRegistry.delete(provider);
}
function getProvider(provider) {
  return providerRegistry.get(provider);
}
function hasProvider(provider) {
  return providerRegistry.has(provider);
}
function getRegisteredProviders() {
  return Array.from(providerRegistry.keys());
}
var DEFAULT_CONFIG = {
  timeout: 3e4,
  enableB2B: false
};
function validateConfig(config) {
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
  if (config.timeout !== void 0 && config.timeout <= 0) {
    throw new Error("Timeout must be a positive number");
  }
}
function mergeConfig(config) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    defaultHeaders: {
      ...DEFAULT_CONFIG.defaultHeaders,
      ...config.defaultHeaders
    },
    b2b: config.enableB2B ? {
      ...config.b2b
    } : void 0
  };
}
function createApiClient(config) {
  validateConfig(config);
  const factory = providerRegistry.get(config.provider);
  if (!factory) {
    const available = getRegisteredProviders();
    throw new Error(
      `Provider "${config.provider}" is not registered. Available providers: ${available.length > 0 ? available.join(", ") : "none"}. Make sure to import the provider package (e.g., @maison/api-medusa).`
    );
  }
  const mergedConfig = mergeConfig(config);
  return factory(mergedConfig);
}
var ApiClientConfigBuilder = class {
  config = {};
  /**
   * Set the provider.
   */
  provider(provider) {
    this.config.provider = provider;
    return this;
  }
  /**
   * Set the base URL.
   */
  baseUrl(url) {
    this.config.baseUrl = url;
    return this;
  }
  /**
   * Set the region ID.
   */
  regionId(id) {
    this.config.regionId = id;
    return this;
  }
  /**
   * Set the publishable key.
   */
  publishableKey(key) {
    this.config.publishableKey = key;
    return this;
  }
  /**
   * Set the auth token.
   */
  authToken(token) {
    this.config.authToken = token;
    return this;
  }
  /**
   * Set the timeout.
   */
  timeout(ms) {
    this.config.timeout = ms;
    return this;
  }
  /**
   * Add default headers.
   */
  headers(headers) {
    this.config.defaultHeaders = {
      ...this.config.defaultHeaders,
      ...headers
    };
    return this;
  }
  /**
   * Enable B2B features.
   */
  enableB2B(companyId, employeeId) {
    this.config.enableB2B = true;
    this.config.b2b = { companyId, employeeId };
    return this;
  }
  /**
   * Set provider-specific options.
   */
  providerOptions(options) {
    this.config.providerOptions = {
      ...this.config.providerOptions,
      ...options
    };
    return this;
  }
  /**
   * Build the client.
   */
  build() {
    if (!this.config.provider || !this.config.baseUrl) {
      throw new Error("Provider and baseUrl are required");
    }
    return createApiClient(this.config);
  }
};
function apiClient() {
  return new ApiClientConfigBuilder();
}

// src/client.ts
var ApiClientManager = class {
  static instances = /* @__PURE__ */ new Map();
  static defaultInstanceKey = null;
  /**
   * Private constructor to prevent instantiation.
   */
  constructor() {
  }
  /**
   * Generate a unique key for a configuration.
   */
  static generateKey(config) {
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
  static initialize(config) {
    const key = this.generateKey(config);
    const client = createApiClient(config);
    this.instances.set(key, {
      client,
      config,
      createdAt: /* @__PURE__ */ new Date()
    });
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
  static getClient() {
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
  static getClientByKey(provider, baseUrl) {
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
  static createNamed(name, config) {
    const client = createApiClient(config);
    this.instances.set(name, {
      client,
      config,
      createdAt: /* @__PURE__ */ new Date()
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
  static getNamed(name) {
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
  static hasNamed(name) {
    return this.instances.has(name);
  }
  /**
   * Set the default client.
   *
   * @param name - Client name to set as default
   * @throws Error if client not found
   */
  static setDefault(name) {
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
  static remove(name) {
    this.instances.delete(name);
    if (this.defaultInstanceKey === name) {
      const firstKey = this.instances.keys().next().value;
      this.defaultInstanceKey = firstKey ?? null;
    }
  }
  /**
   * Clear all client instances.
   */
  static clear() {
    this.instances.clear();
    this.defaultInstanceKey = null;
  }
  /**
   * Get all registered client names.
   *
   * @returns Array of client names
   */
  static getClientNames() {
    return Array.from(this.instances.keys());
  }
  /**
   * Check if manager is initialized.
   *
   * @returns Whether any client is registered
   */
  static isInitialized() {
    return this.instances.size > 0;
  }
  /**
   * Get client metadata.
   *
   * @param name - Client name (optional, defaults to default client)
   * @returns Client metadata
   */
  static getMetadata(name) {
    const key = name ?? this.defaultInstanceKey;
    if (!key) return null;
    const instance = this.instances.get(key);
    if (!instance) return null;
    return {
      provider: instance.config.provider,
      baseUrl: instance.config.baseUrl,
      createdAt: instance.createdAt,
      enableB2B: instance.config.enableB2B ?? false
    };
  }
};
function getApiClient() {
  return ApiClientManager.getClient();
}
function getNamedClient(name) {
  return ApiClientManager.getNamed(name);
}

export { ApiClientConfigBuilder, ApiClientManager, DEFAULT_CONFIG, apiClient, createApiClient, getApiClient, getNamedClient, getProvider, getRegisteredProviders, hasProvider, mergeConfig, registerProvider, unregisterProvider, validateConfig };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map