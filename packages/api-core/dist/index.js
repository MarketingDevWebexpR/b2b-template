import { ApiError, NetworkError, TimeoutError, RateLimitError } from './chunk-ZJODLBWI.js';
export { ApiError, AuthenticationError, AuthorizationError, BaseApiClient, NetworkError, NotFoundError, RateLimitError, TimeoutError, ValidationError, isApiError, isApiErrorWithCode } from './chunk-ZJODLBWI.js';

// src/cache.ts
function generateCacheKey(params) {
  const parts = [];
  if (params.method) {
    parts.push(params.method.toUpperCase());
  }
  parts.push(params.path);
  if (params.params && Object.keys(params.params).length > 0) {
    const sortedParams = {};
    for (const key of Object.keys(params.params).sort()) {
      sortedParams[key] = params.params[key];
    }
    parts.push(JSON.stringify(sortedParams));
  }
  if (params.body !== void 0) {
    parts.push(JSON.stringify(params.body));
  }
  if (params.extra && params.extra.length > 0) {
    parts.push(...params.extra);
  }
  return parts.join(":");
}
var ApiCache = class {
  cache;
  config;
  accessOrder;
  accessCounter;
  constructor(config) {
    this.cache = /* @__PURE__ */ new Map();
    this.accessOrder = /* @__PURE__ */ new Map();
    this.accessCounter = 0;
    this.config = {
      ttl: config.ttl,
      staleTime: config.staleTime ?? config.ttl,
      maxEntries: config.maxEntries ?? 1e3,
      adapter: config.adapter
    };
  }
  /**
   * Store a value in the cache
   *
   * @param key - The cache key
   * @param data - The data to cache
   * @param options - Optional override for TTL and stale time
   *
   * @example
   * ```typescript
   * // Use default TTL
   * cache.set('products:list', products);
   *
   * // Override TTL for this entry
   * cache.set('session:abc', sessionData, { ttl: 30 * 60 * 1000 });
   * ```
   */
  async set(key, data, options) {
    const now = Date.now();
    const ttl = options?.ttl ?? this.config.ttl;
    const staleTime = options?.staleTime ?? this.config.staleTime;
    const entry = {
      data,
      createdAt: now,
      staleAt: now + staleTime,
      expiresAt: now + ttl
    };
    if (this.cache.size >= this.config.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }
    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    if (this.config.adapter) {
      await this.config.adapter.set(key, entry, ttl);
    }
  }
  /**
   * Retrieve a value from the cache
   *
   * @param key - The cache key
   * @returns The cache result with data and freshness info, or null if not found/expired
   *
   * @example
   * ```typescript
   * const result = cache.get('users:123');
   * if (result) {
   *   console.log('Data:', result.data);
   *   console.log('Is stale:', result.isStale);
   *   console.log('Expires in:', result.timeToExpire, 'ms');
   * }
   * ```
   */
  async get(key) {
    const now = Date.now();
    let entry = this.cache.get(key);
    if (!entry && this.config.adapter) {
      entry = await this.config.adapter.get(key) ?? void 0;
      if (entry) {
        this.cache.set(key, entry);
      }
    }
    if (!entry) {
      return null;
    }
    if (now >= entry.expiresAt) {
      this.cache.delete(key);
      if (this.config.adapter) {
        await this.config.adapter.delete(key);
      }
      return null;
    }
    this.updateAccessOrder(key);
    return {
      data: entry.data,
      isStale: now >= entry.staleAt,
      createdAt: entry.createdAt,
      timeToExpire: entry.expiresAt - now
    };
  }
  /**
   * Check if a key exists in the cache and is not expired
   *
   * @param key - The cache key
   * @returns true if the key exists and is not expired
   *
   * @example
   * ```typescript
   * if (await cache.has('user:123')) {
   *   // Use cached data
   * }
   * ```
   */
  async has(key) {
    const result = await this.get(key);
    return result !== null;
  }
  /**
   * Delete a specific key from the cache
   *
   * @param key - The cache key to delete
   * @returns true if the key was found and deleted
   *
   * @example
   * ```typescript
   * // Invalidate a specific user's cache
   * await cache.delete('user:123');
   * ```
   */
  async delete(key) {
    const existed = this.cache.delete(key);
    this.accessOrder.delete(key);
    if (this.config.adapter) {
      await this.config.adapter.delete(key);
    }
    return existed;
  }
  /**
   * Invalidate all cache entries matching a pattern
   *
   * @param pattern - A RegExp to match against cache keys
   * @returns The number of entries invalidated
   *
   * @example
   * ```typescript
   * // Invalidate all user-related cache entries
   * const count = await cache.invalidateByPattern(/^user:/);
   * console.log(`Invalidated ${count} entries`);
   *
   * // Invalidate all GET requests for products
   * await cache.invalidateByPattern(/^GET:\/api\/products/);
   * ```
   */
  async invalidateByPattern(pattern) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        count++;
      }
    }
    if (this.config.adapter) {
      const adapterPattern = pattern.source.replace(/\^/g, "").replace(/\$/g, "").replace(/\.\*/g, "*").replace(/\./g, "?");
      const keys = await this.config.adapter.keys(adapterPattern);
      for (const key of keys) {
        if (pattern.test(key)) {
          await this.config.adapter.delete(key);
          count++;
        }
      }
    }
    return count;
  }
  /**
   * Invalidate cache entries by prefix
   *
   * @param prefix - The prefix to match
   * @returns The number of entries invalidated
   *
   * @example
   * ```typescript
   * // Invalidate all entries starting with "products:"
   * const count = await cache.invalidateByPrefix('products:');
   * ```
   */
  async invalidateByPrefix(prefix) {
    return this.invalidateByPattern(
      new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
    );
  }
  /**
   * Clear all entries from the cache
   *
   * @example
   * ```typescript
   * // Clear entire cache
   * await cache.clear();
   * ```
   */
  async clear() {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
    if (this.config.adapter) {
      await this.config.adapter.clear();
    }
  }
  /**
   * Get the current number of entries in the local cache
   *
   * @returns The number of cached entries
   */
  get size() {
    return this.cache.size;
  }
  /**
   * Get all keys currently in the local cache
   *
   * @returns An array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }
  /**
   * Get cache statistics
   *
   * @returns Object with cache statistics
   *
   * @example
   * ```typescript
   * const stats = cache.stats();
   * console.log(`Cache has ${stats.size} entries`);
   * console.log(`${stats.staleCount} entries are stale`);
   * ```
   */
  stats() {
    const now = Date.now();
    let staleCount = 0;
    let freshCount = 0;
    for (const entry of this.cache.values()) {
      if (now >= entry.expiresAt) {
        continue;
      }
      if (now >= entry.staleAt) {
        staleCount++;
      } else {
        freshCount++;
      }
    }
    return {
      size: this.cache.size,
      staleCount,
      freshCount,
      maxEntries: this.config.maxEntries
    };
  }
  /**
   * Update the access order for LRU tracking
   */
  updateAccessOrder(key) {
    this.accessCounter++;
    this.accessOrder.set(key, this.accessCounter);
  }
  /**
   * Evict the least recently used entry
   */
  evictLRU() {
    let oldestKey = null;
    let oldestAccess = Infinity;
    for (const [key, access] of this.accessOrder.entries()) {
      if (access < oldestAccess) {
        oldestAccess = access;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }
};
function createCacheKeyGenerator(prefix) {
  return (params) => {
    const baseKey = generateCacheKey(params);
    return `${prefix}:${baseKey}`;
  };
}

// src/retry.ts
var RetryExhaustedError = class extends ApiError {
  name = "RetryExhaustedError";
  attempts;
  lastError;
  constructor(attempts, lastError) {
    const message = lastError instanceof Error ? `All ${attempts} retry attempts failed. Last error: ${lastError.message}` : `All ${attempts} retry attempts failed`;
    super(message, {
      code: "RETRY_EXHAUSTED",
      details: { attempts },
      cause: lastError instanceof Error ? lastError : void 0
    });
    this.attempts = attempts;
    this.lastError = lastError;
  }
};
var DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelay: 1e3,
  maxDelay: 3e4,
  backoffMultiplier: 2,
  jitter: true,
  retryOnStatus: [408, 429, 500, 502, 503, 504],
  retryOnError: ["NetworkError", "TimeoutError", "RateLimitError"]
};
function calculateDelay(attempt, config) {
  const initialDelay = config.initialDelay ?? DEFAULT_CONFIG.initialDelay;
  const maxDelay = config.maxDelay ?? DEFAULT_CONFIG.maxDelay;
  const multiplier = config.backoffMultiplier ?? DEFAULT_CONFIG.backoffMultiplier;
  const useJitter = config.jitter ?? DEFAULT_CONFIG.jitter;
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1);
  let delay = Math.min(exponentialDelay, maxDelay);
  if (useJitter) {
    const jitterFactor = 0.5 + Math.random();
    delay = Math.floor(delay * jitterFactor);
  }
  return delay;
}
function shouldRetryError(error, config) {
  const retryOnStatus = config.retryOnStatus ?? DEFAULT_CONFIG.retryOnStatus;
  const retryOnError = config.retryOnError ?? DEFAULT_CONFIG.retryOnError;
  if (error instanceof ApiError) {
    if (retryOnStatus.includes(error.statusCode)) {
      return true;
    }
    if (retryOnError.includes(error.name)) {
      return true;
    }
  }
  if (error instanceof NetworkError && retryOnError.includes("NetworkError")) {
    return true;
  }
  if (error instanceof TimeoutError && retryOnError.includes("TimeoutError")) {
    return true;
  }
  if (error instanceof RateLimitError && retryOnError.includes("RateLimitError")) {
    return true;
  }
  return false;
}
function getRetryDelay(error, calculatedDelay) {
  if (error instanceof RateLimitError && error.retryAfter !== void 0) {
    const serverDelay = error.retryAfter * 1e3;
    return Math.max(serverDelay, calculatedDelay);
  }
  return calculatedDelay;
}
async function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timeoutId = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}
function createRetryHandler(defaultConfig = {}) {
  return async function retry(operation, overrideConfig = {}) {
    const config = {
      ...DEFAULT_CONFIG,
      ...defaultConfig,
      ...overrideConfig
    };
    const maxAttempts = config.maxRetries + 1;
    const startTime = Date.now();
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (config.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      try {
        const data = await operation();
        return {
          data,
          attempts: attempt,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error;
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }
        const isLastAttempt = attempt >= maxAttempts;
        if (isLastAttempt) {
          break;
        }
        if (config.shouldRetry) {
          if (!config.shouldRetry(error, attempt)) {
            break;
          }
        } else if (!shouldRetryError(error, config)) {
          break;
        }
        const baseDelay = calculateDelay(attempt, config);
        const delay = getRetryDelay(error, baseDelay);
        if (config.onRetry) {
          config.onRetry(error, attempt, delay);
        }
        await sleep(delay, config.signal);
      }
    }
    throw new RetryExhaustedError(maxAttempts, lastError);
  };
}
async function withRetry(operation, config = {}) {
  const handler = createRetryHandler(config);
  return handler(operation);
}
function retryOnStatusCodes(statusCodes) {
  return (error) => {
    if (error instanceof ApiError) {
      return statusCodes.includes(error.statusCode);
    }
    return false;
  };
}
function retryOnErrorTypes(errorTypes) {
  return (error) => {
    if (error instanceof Error) {
      return errorTypes.includes(error.name);
    }
    return false;
  };
}
function combinePredicates(...predicates) {
  return (error, attempt) => {
    return predicates.some((predicate) => predicate(error, attempt));
  };
}
function withMaxAttempts(predicate, maxAttempt) {
  return (error, attempt) => {
    if (attempt >= maxAttempt) {
      return false;
    }
    return predicate(error, attempt);
  };
}

// src/interceptors.ts
var InterceptorChain = class {
  interceptors = [];
  nextId = 0;
  /**
   * Add an interceptor to the chain
   *
   * @param interceptor - The interceptor function
   * @returns A handle to remove the interceptor
   *
   * @example
   * ```typescript
   * const handle = chain.use((config) => {
   *   // Modify config
   *   return config;
   * });
   *
   * // Remove later
   * handle.remove();
   * ```
   */
  use(interceptor) {
    const id = this.nextId++;
    this.interceptors.push({ id, interceptor });
    return {
      remove: () => {
        const index = this.interceptors.findIndex((entry) => entry.id === id);
        if (index !== -1) {
          this.interceptors.splice(index, 1);
        }
      }
    };
  }
  /**
   * Get all interceptors in order
   *
   * @returns Array of interceptor functions
   */
  getInterceptors() {
    return this.interceptors.map((entry) => entry.interceptor);
  }
  /**
   * Check if any interceptors are registered
   *
   * @returns true if the chain has interceptors
   */
  hasInterceptors() {
    return this.interceptors.length > 0;
  }
  /**
   * Get the number of registered interceptors
   */
  get size() {
    return this.interceptors.length;
  }
  /**
   * Clear all interceptors from the chain
   */
  clear() {
    this.interceptors.length = 0;
  }
};
var InterceptorManager = class {
  /** Request interceptor chain */
  request;
  /** Response interceptor chain */
  response;
  /** Error interceptor chain */
  error;
  constructor() {
    this.request = new InterceptorChain();
    this.response = new InterceptorChain();
    this.error = new InterceptorChain();
  }
  /**
   * Run all request interceptors in order
   *
   * @param config - The initial request configuration
   * @returns The modified request configuration
   * @throws If any interceptor throws
   *
   * @example
   * ```typescript
   * const finalConfig = await manager.runRequestInterceptors({
   *   url: 'https://api.example.com/users',
   *   method: 'GET',
   *   headers: { 'Content-Type': 'application/json' }
   * });
   * ```
   */
  async runRequestInterceptors(config) {
    let mutableConfig = {
      url: config.url,
      method: config.method,
      headers: { ...config.headers },
      body: config.body,
      timeout: config.timeout,
      signal: config.signal,
      metadata: config.metadata ? { ...config.metadata } : void 0
    };
    for (const interceptor of this.request.getInterceptors()) {
      mutableConfig = await interceptor(mutableConfig);
    }
    return mutableConfig;
  }
  /**
   * Run all response interceptors in order
   *
   * @param response - The initial response data
   * @returns The modified response data
   * @throws If any interceptor throws
   *
   * @example
   * ```typescript
   * const finalResponse = await manager.runResponseInterceptors({
   *   data: responseData,
   *   status: 200,
   *   headers: responseHeaders,
   *   config: requestConfig
   * });
   * ```
   */
  async runResponseInterceptors(response) {
    let mutableResponse = {
      data: response.data,
      status: response.status,
      headers: response.headers,
      config: response.config,
      metadata: response.metadata ? { ...response.metadata } : void 0
    };
    for (const interceptor of this.response.getInterceptors()) {
      mutableResponse = await interceptor(
        mutableResponse
      );
    }
    return mutableResponse;
  }
  /**
   * Run all error interceptors in order
   *
   * Each interceptor can either:
   * - Throw an error (possibly transformed)
   * - Return a recovery response (to convert error to success)
   *
   * @param context - The error context
   * @returns A recovery response if any interceptor returns one
   * @throws The final error if no interceptor returns a recovery response
   *
   * @example
   * ```typescript
   * try {
   *   const response = await manager.runErrorInterceptors({
   *     error: new AuthenticationError('Token expired'),
   *     config: requestConfig
   *   });
   *   // An interceptor returned a recovery response
   *   return response;
   * } catch (error) {
   *   // All interceptors threw, final error is rethrown
   *   throw error;
   * }
   * ```
   */
  async runErrorInterceptors(context) {
    let currentContext = context;
    for (const interceptor of this.error.getInterceptors()) {
      try {
        const response = await interceptor(
          currentContext
        );
        return response;
      } catch (error) {
        currentContext = {
          ...currentContext,
          error
        };
      }
    }
    throw currentContext.error;
  }
  /**
   * Clear all interceptors from all chains
   */
  clear() {
    this.request.clear();
    this.response.clear();
    this.error.clear();
  }
};
var commonInterceptors = {
  /**
   * Add a bearer token to all requests
   *
   * @param getToken - Function to get the current token
   * @returns A request interceptor
   *
   * @example
   * ```typescript
   * manager.request.use(
   *   commonInterceptors.bearerAuth(() => localStorage.getItem('token'))
   * );
   * ```
   */
  bearerAuth(getToken) {
    return async (config) => {
      const token = await getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    };
  },
  /**
   * Add custom headers to all requests
   *
   * @param headers - Headers to add
   * @returns A request interceptor
   *
   * @example
   * ```typescript
   * manager.request.use(
   *   commonInterceptors.headers({ 'X-API-Version': '2' })
   * );
   * ```
   */
  headers(headers) {
    return (config) => {
      const headersToAdd = typeof headers === "function" ? headers() : headers;
      Object.assign(config.headers, headersToAdd);
      return config;
    };
  },
  /**
   * Add request timing metadata
   *
   * @returns A request interceptor that adds a start timestamp
   *
   * @example
   * ```typescript
   * manager.request.use(commonInterceptors.timing());
   * manager.response.use((response) => {
   *   const startTime = response.config.metadata?.startTime as number;
   *   console.log(`Request took ${Date.now() - startTime}ms`);
   *   return response;
   * });
   * ```
   */
  timing() {
    return (config) => {
      config.metadata = {
        ...config.metadata,
        startTime: Date.now()
      };
      return config;
    };
  },
  /**
   * Log requests for debugging
   *
   * @param logger - Optional custom logger (defaults to console)
   * @returns A request interceptor
   *
   * @example
   * ```typescript
   * manager.request.use(commonInterceptors.logRequest());
   * ```
   */
  logRequest(logger = console) {
    return (config) => {
      logger.log(`[API Request] ${config.method} ${config.url}`);
      return config;
    };
  },
  /**
   * Log responses for debugging
   *
   * @param logger - Optional custom logger (defaults to console)
   * @returns A response interceptor
   *
   * @example
   * ```typescript
   * manager.response.use(commonInterceptors.logResponse());
   * ```
   */
  logResponse(logger = console) {
    return (response) => {
      const startTime = response.config.metadata?.["startTime"];
      const duration = typeof startTime === "number" ? Date.now() - startTime : void 0;
      const durationStr = duration !== void 0 ? ` (${duration}ms)` : "";
      logger.log(
        `[API Response] ${response.status} ${response.config.method} ${response.config.url}${durationStr}`
      );
      return response;
    };
  },
  /**
   * Log errors for debugging
   *
   * @param logger - Optional custom logger (defaults to console)
   * @returns An error interceptor
   *
   * @example
   * ```typescript
   * manager.error.use(commonInterceptors.logError());
   * ```
   */
  logError(logger = console) {
    return async (context) => {
      const errorMessage = context.error instanceof Error ? context.error.message : String(context.error);
      logger.error(
        `[API Error] ${context.config.method} ${context.config.url}: ${errorMessage}`
      );
      throw context.error;
    };
  },
  /**
   * Unwrap nested response data
   *
   * @param path - Dot-notation path to the data (e.g., 'data.result')
   * @returns A response interceptor
   *
   * @example
   * ```typescript
   * // If API returns { data: { result: actualData } }
   * manager.response.use(commonInterceptors.unwrapData('data.result'));
   * ```
   */
  unwrapData(path) {
    return (response) => {
      const parts = path.split(".");
      let current = response.data;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          return response;
        }
      }
      response.data = current;
      return response;
    };
  },
  /**
   * Retry on specific error conditions
   *
   * @param shouldRetry - Function to determine if retry should happen
   * @param onRetry - Function to perform before retry (e.g., refresh token)
   * @returns An error interceptor
   *
   * @example
   * ```typescript
   * manager.error.use(
   *   commonInterceptors.retryOnError(
   *     (error) => error instanceof AuthenticationError,
   *     async () => {
   *       await refreshToken();
   *     }
   *   )
   * );
   * ```
   */
  retryOnError(shouldRetry, onRetry) {
    return async (context) => {
      if (shouldRetry(context.error)) {
        await onRetry();
        throw new ApiError("Retry requested", {
          code: "RETRY_REQUESTED",
          cause: context.error instanceof Error ? context.error : void 0
        });
      }
      throw context.error;
    };
  }
};
function toRequestConfig(method, url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers
  };
  return {
    url,
    method,
    headers,
    body: options.body,
    timeout: options.timeout,
    signal: options.signal
  };
}
function toApiResponse(response) {
  return {
    data: response.data,
    status: response.status,
    headers: response.headers
  };
}

export { ApiCache, InterceptorChain, InterceptorManager, RetryExhaustedError, calculateDelay, combinePredicates, commonInterceptors, createCacheKeyGenerator, createRetryHandler, generateCacheKey, retryOnErrorTypes, retryOnStatusCodes, toApiResponse, toRequestConfig, withMaxAttempts, withRetry };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map