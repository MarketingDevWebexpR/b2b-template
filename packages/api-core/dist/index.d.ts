import { H as HttpMethod, R as RequestOptions, A as ApiResponse } from './client-kRKdhjzn.js';
export { b as ApiAdapter, a as ApiClientConfig, B as BaseApiClient, P as PaginatedResponse } from './client-kRKdhjzn.js';

/**
 * Custom error classes for API operations
 */
/**
 * Base error class for all API-related errors
 */
declare class ApiError extends Error {
    readonly name: string;
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, options?: {
        statusCode?: number;
        code?: string;
        details?: unknown;
        cause?: Error;
    });
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when a network request fails
 */
declare class NetworkError extends ApiError {
    readonly name = "NetworkError";
    constructor(message: string, cause?: Error);
}
/**
 * Error thrown when authentication fails
 */
declare class AuthenticationError extends ApiError {
    readonly name = "AuthenticationError";
    constructor(message?: string);
}
/**
 * Error thrown when authorization fails
 */
declare class AuthorizationError extends ApiError {
    readonly name = "AuthorizationError";
    constructor(message?: string);
}
/**
 * Error thrown when a resource is not found
 */
declare class NotFoundError extends ApiError {
    readonly name = "NotFoundError";
    constructor(resource: string, identifier?: string);
}
/**
 * Error thrown when validation fails
 */
declare class ValidationError extends ApiError {
    readonly name = "ValidationError";
    readonly errors: readonly ValidationFieldError[];
    constructor(message: string, errors?: readonly ValidationFieldError[]);
}
/**
 * Individual field validation error
 */
interface ValidationFieldError {
    readonly field: string;
    readonly message: string;
    readonly code?: string;
}
/**
 * Error thrown when rate limit is exceeded
 */
declare class RateLimitError extends ApiError {
    readonly name = "RateLimitError";
    readonly retryAfter?: number;
    constructor(retryAfter?: number);
}
/**
 * Error thrown when request times out
 */
declare class TimeoutError extends ApiError {
    readonly name = "TimeoutError";
    constructor(timeoutMs: number);
}
/**
 * Type guard to check if an error is an ApiError
 */
declare function isApiError(error: unknown): error is ApiError;
/**
 * Type guard to check if an error is a specific type of ApiError
 */
declare function isApiErrorWithCode<T extends ApiError>(error: unknown, code: string): error is T;

/**
 * Cache system for API requests
 *
 * Provides in-memory caching with TTL (time-to-live) and stale time support.
 * Supports pattern-based invalidation and external cache adapters for distributed caching.
 *
 * @example
 * ```typescript
 * // Create a cache with 5-minute TTL and 1-minute stale time
 * const cache = new ApiCache({ ttl: 300_000, staleTime: 60_000 });
 *
 * // Store a value
 * cache.set('users:123', userData);
 *
 * // Retrieve with freshness info
 * const entry = cache.get('users:123');
 * if (entry) {
 *   console.log(entry.data, entry.isStale);
 * }
 *
 * // Invalidate by pattern
 * cache.invalidateByPattern(/^users:/);
 * ```
 */
/**
 * Configuration options for the cache
 */
interface CacheConfig {
    /** Time-to-live in milliseconds (how long until entry expires completely) */
    readonly ttl: number;
    /** Stale time in milliseconds (how long until entry is considered stale but still usable) */
    readonly staleTime?: number;
    /** Maximum number of entries in the cache (uses LRU eviction when exceeded) */
    readonly maxEntries?: number;
    /** Optional external cache adapter for distributed caching */
    readonly adapter?: CacheAdapter;
}
/**
 * Internal cache entry structure
 */
interface CacheEntry<T> {
    /** The cached data */
    readonly data: T;
    /** Timestamp when the entry was created */
    readonly createdAt: number;
    /** Timestamp when the entry becomes stale */
    readonly staleAt: number;
    /** Timestamp when the entry expires */
    readonly expiresAt: number;
}
/**
 * Result of a cache lookup including freshness information
 */
interface CacheResult<T> {
    /** The cached data */
    readonly data: T;
    /** Whether the entry is stale (past staleTime but not yet expired) */
    readonly isStale: boolean;
    /** Timestamp when the entry was created */
    readonly createdAt: number;
    /** Time remaining until expiration in milliseconds */
    readonly timeToExpire: number;
}
/**
 * Interface for external cache adapters (Redis, Memcached, etc.)
 *
 * @example
 * ```typescript
 * // Example Redis adapter implementation
 * const redisAdapter: CacheAdapter = {
 *   async get(key) {
 *     const data = await redis.get(key);
 *     return data ? JSON.parse(data) : null;
 *   },
 *   async set(key, value, ttl) {
 *     await redis.setex(key, Math.ceil(ttl / 1000), JSON.stringify(value));
 *   },
 *   async delete(key) {
 *     await redis.del(key);
 *   },
 *   async has(key) {
 *     return (await redis.exists(key)) === 1;
 *   },
 *   async clear() {
 *     await redis.flushdb();
 *   },
 *   async keys(pattern) {
 *     // Convert regex-like pattern to Redis glob pattern
 *     return redis.keys(pattern);
 *   }
 * };
 * ```
 */
interface CacheAdapter {
    /**
     * Retrieve an entry from the cache
     * @param key - The cache key
     * @returns The cached entry or null if not found
     */
    get<T>(key: string): Promise<CacheEntry<T> | null>;
    /**
     * Store an entry in the cache
     * @param key - The cache key
     * @param entry - The entry to store
     * @param ttl - Time-to-live in milliseconds
     */
    set<T>(key: string, entry: CacheEntry<T>, ttl: number): Promise<void>;
    /**
     * Delete an entry from the cache
     * @param key - The cache key
     */
    delete(key: string): Promise<boolean>;
    /**
     * Check if a key exists in the cache
     * @param key - The cache key
     */
    has(key: string): Promise<boolean>;
    /**
     * Clear all entries from the cache
     */
    clear(): Promise<void>;
    /**
     * Get all keys matching a pattern (for pattern-based invalidation)
     * @param pattern - A string pattern (adapter-specific format, e.g., "users:*" for Redis)
     */
    keys(pattern: string): Promise<string[]>;
}
/**
 * Parameters used to generate a cache key
 */
interface CacheKeyParams {
    /** HTTP method */
    readonly method?: string;
    /** Request path/URL */
    readonly path: string;
    /** Query parameters */
    readonly params?: Readonly<Record<string, unknown>>;
    /** Request body (for POST/PUT/PATCH) */
    readonly body?: unknown;
    /** Additional key components */
    readonly extra?: readonly string[];
}
/**
 * Generate a deterministic cache key from request parameters
 *
 * @param params - The parameters to generate a key from
 * @returns A deterministic string key
 *
 * @example
 * ```typescript
 * const key = generateCacheKey({
 *   method: 'GET',
 *   path: '/api/users',
 *   params: { page: 1, limit: 10 }
 * });
 * // Returns: "GET:/api/users:{"limit":10,"page":1}"
 * ```
 */
declare function generateCacheKey(params: CacheKeyParams): string;
/**
 * In-memory cache implementation with TTL and stale time support
 *
 * The cache implements a stale-while-revalidate pattern:
 * - Fresh: Entry is within staleTime, can be used immediately
 * - Stale: Entry is past staleTime but before TTL, can be used but should be refreshed
 * - Expired: Entry is past TTL, should not be used
 *
 * @example
 * ```typescript
 * const cache = new ApiCache({
 *   ttl: 5 * 60 * 1000,      // 5 minutes until expiry
 *   staleTime: 60 * 1000,    // 1 minute until stale
 *   maxEntries: 1000         // LRU eviction after 1000 entries
 * });
 *
 * // Cache a user response
 * cache.set('user:123', { id: 123, name: 'John' });
 *
 * // Later, check the cache
 * const result = cache.get('user:123');
 * if (result) {
 *   if (result.isStale) {
 *     // Use cached data but refresh in background
 *     refreshUser(123);
 *   }
 *   return result.data;
 * }
 * ```
 */
declare class ApiCache {
    private readonly cache;
    private readonly config;
    private readonly accessOrder;
    private accessCounter;
    constructor(config: CacheConfig);
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
    set<T>(key: string, data: T, options?: {
        readonly ttl?: number;
        readonly staleTime?: number;
    }): Promise<void>;
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
    get<T>(key: string): Promise<CacheResult<T> | null>;
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
    has(key: string): Promise<boolean>;
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
    delete(key: string): Promise<boolean>;
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
    invalidateByPattern(pattern: RegExp): Promise<number>;
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
    invalidateByPrefix(prefix: string): Promise<number>;
    /**
     * Clear all entries from the cache
     *
     * @example
     * ```typescript
     * // Clear entire cache
     * await cache.clear();
     * ```
     */
    clear(): Promise<void>;
    /**
     * Get the current number of entries in the local cache
     *
     * @returns The number of cached entries
     */
    get size(): number;
    /**
     * Get all keys currently in the local cache
     *
     * @returns An array of cache keys
     */
    keys(): string[];
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
    stats(): {
        size: number;
        staleCount: number;
        freshCount: number;
        maxEntries: number;
    };
    /**
     * Update the access order for LRU tracking
     */
    private updateAccessOrder;
    /**
     * Evict the least recently used entry
     */
    private evictLRU;
}
/**
 * Create a cache key generator with a prefix
 *
 * @param prefix - The prefix to add to all generated keys
 * @returns A function that generates prefixed cache keys
 *
 * @example
 * ```typescript
 * const userCacheKey = createCacheKeyGenerator('users');
 * const key = userCacheKey({ path: '/123', method: 'GET' });
 * // Returns: "users:GET:/123"
 * ```
 */
declare function createCacheKeyGenerator(prefix: string): (params: CacheKeyParams) => string;

/**
 * Retry logic with exponential backoff for API requests
 *
 * Provides configurable retry mechanisms with support for:
 * - Exponential backoff with jitter
 * - Configurable retry conditions
 * - AbortSignal support for cancellation
 * - Custom delay strategies
 *
 * @example
 * ```typescript
 * const retry = createRetryHandler({
 *   maxRetries: 3,
 *   initialDelay: 1000,
 *   maxDelay: 30000,
 *   backoffMultiplier: 2,
 *   retryOn: [408, 429, 500, 502, 503, 504]
 * });
 *
 * const result = await retry(async () => {
 *   return fetch('/api/data');
 * });
 * ```
 */

/**
 * Configuration for retry behavior
 */
interface RetryConfig {
    /** Maximum number of retry attempts (default: 3) */
    readonly maxRetries?: number;
    /** Initial delay in milliseconds before first retry (default: 1000) */
    readonly initialDelay?: number;
    /** Maximum delay in milliseconds between retries (default: 30000) */
    readonly maxDelay?: number;
    /** Multiplier for exponential backoff (default: 2) */
    readonly backoffMultiplier?: number;
    /** Whether to add random jitter to delays (default: true) */
    readonly jitter?: boolean;
    /** HTTP status codes that should trigger a retry */
    readonly retryOnStatus?: readonly number[];
    /** Error types that should trigger a retry */
    readonly retryOnError?: readonly RetryableErrorType[];
    /** Custom function to determine if a retry should occur */
    readonly shouldRetry?: RetryPredicate;
    /** AbortSignal to cancel retries */
    readonly signal?: AbortSignal;
    /** Callback invoked before each retry attempt */
    readonly onRetry?: RetryCallback;
}
/**
 * Error types that can be configured for retry
 */
type RetryableErrorType = "NetworkError" | "TimeoutError" | "RateLimitError" | "ApiError";
/**
 * Predicate function to determine if a retry should occur
 *
 * @param error - The error that occurred
 * @param attempt - The current attempt number (1-indexed)
 * @returns true if the request should be retried
 */
type RetryPredicate = (error: unknown, attempt: number) => boolean;
/**
 * Callback invoked before each retry attempt
 *
 * @param error - The error that triggered the retry
 * @param attempt - The current attempt number (1-indexed)
 * @param delay - The delay in milliseconds before the next attempt
 */
type RetryCallback = (error: unknown, attempt: number, delay: number) => void;
/**
 * Context provided during retry execution
 */
interface RetryContext {
    /** Current attempt number (1-indexed) */
    readonly attempt: number;
    /** Total number of retries allowed */
    readonly maxRetries: number;
    /** Delay before the next retry (if applicable) */
    readonly nextDelay: number;
    /** Whether this is the last attempt */
    readonly isLastAttempt: boolean;
}
/**
 * Result of a retry operation
 */
interface RetryResult<T> {
    /** The successful result data */
    readonly data: T;
    /** Number of attempts made (1 = success on first try) */
    readonly attempts: number;
    /** Total time spent including retries in milliseconds */
    readonly totalTime: number;
}
/**
 * Error thrown when all retry attempts are exhausted
 */
declare class RetryExhaustedError extends ApiError {
    readonly name = "RetryExhaustedError";
    readonly attempts: number;
    readonly lastError: unknown;
    constructor(attempts: number, lastError: unknown);
}
/**
 * Calculate the delay for a retry attempt using exponential backoff
 *
 * @param attempt - The current attempt number (1-indexed)
 * @param config - The retry configuration
 * @returns The delay in milliseconds
 *
 * @example
 * ```typescript
 * // With default config (initialDelay: 1000, multiplier: 2)
 * calculateDelay(1, config); // ~1000ms
 * calculateDelay(2, config); // ~2000ms
 * calculateDelay(3, config); // ~4000ms
 * ```
 */
declare function calculateDelay(attempt: number, config: Pick<RetryConfig, "initialDelay" | "maxDelay" | "backoffMultiplier" | "jitter">): number;
/**
 * Retry handler function type
 */
type RetryHandler = <T>(operation: () => Promise<T>, config?: RetryConfig) => Promise<RetryResult<T>>;
/**
 * Create a retry handler with pre-configured defaults
 *
 * @param defaultConfig - Default configuration for all retries
 * @returns A retry handler function
 *
 * @example
 * ```typescript
 * // Create a retry handler with custom defaults
 * const retry = createRetryHandler({
 *   maxRetries: 5,
 *   initialDelay: 500,
 *   retryOnStatus: [429, 500, 502, 503, 504]
 * });
 *
 * // Use the handler
 * const result = await retry(async () => {
 *   const response = await fetch('/api/data');
 *   if (!response.ok) throw new Error('Request failed');
 *   return response.json();
 * });
 *
 * console.log(`Succeeded after ${result.attempts} attempts`);
 * ```
 */
declare function createRetryHandler(defaultConfig?: RetryConfig): RetryHandler;
/**
 * Execute an operation with retry logic
 *
 * This is a convenience function that creates a one-time retry handler.
 * For repeated use, prefer {@link createRetryHandler}.
 *
 * @param operation - The async operation to execute
 * @param config - Retry configuration
 * @returns The result of the operation with retry metadata
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => {
 *     const response = await fetch('/api/flaky-endpoint');
 *     if (!response.ok) {
 *       throw new ApiError('Request failed', { statusCode: response.status });
 *     }
 *     return response.json();
 *   },
 *   {
 *     maxRetries: 3,
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
 *     }
 *   }
 * );
 * ```
 */
declare function withRetry<T>(operation: () => Promise<T>, config?: RetryConfig): Promise<RetryResult<T>>;
/**
 * Create a predicate that retries only on specific status codes
 *
 * @param statusCodes - The status codes to retry on
 * @returns A retry predicate function
 *
 * @example
 * ```typescript
 * const retry = createRetryHandler({
 *   shouldRetry: retryOnStatusCodes([429, 503])
 * });
 * ```
 */
declare function retryOnStatusCodes(statusCodes: readonly number[]): RetryPredicate;
/**
 * Create a predicate that retries only on specific error types
 *
 * @param errorTypes - The error types to retry on
 * @returns A retry predicate function
 *
 * @example
 * ```typescript
 * const retry = createRetryHandler({
 *   shouldRetry: retryOnErrorTypes(['NetworkError', 'TimeoutError'])
 * });
 * ```
 */
declare function retryOnErrorTypes(errorTypes: readonly RetryableErrorType[]): RetryPredicate;
/**
 * Combine multiple retry predicates with OR logic
 *
 * @param predicates - The predicates to combine
 * @returns A combined retry predicate
 *
 * @example
 * ```typescript
 * const retry = createRetryHandler({
 *   shouldRetry: combinePredicates(
 *     retryOnStatusCodes([429, 503]),
 *     retryOnErrorTypes(['NetworkError']),
 *     (error) => error instanceof CustomRetryableError
 *   )
 * });
 * ```
 */
declare function combinePredicates(...predicates: readonly RetryPredicate[]): RetryPredicate;
/**
 * Create a predicate with a maximum attempt limit
 *
 * @param predicate - The base predicate
 * @param maxAttempt - Maximum attempt number to allow retries
 * @returns A retry predicate that stops after maxAttempt
 *
 * @example
 * ```typescript
 * // Only retry network errors for the first 2 attempts
 * const retry = createRetryHandler({
 *   maxRetries: 5,
 *   shouldRetry: withMaxAttempts(
 *     retryOnErrorTypes(['NetworkError']),
 *     2
 *   )
 * });
 * ```
 */
declare function withMaxAttempts(predicate: RetryPredicate, maxAttempt: number): RetryPredicate;

/**
 * Interceptor system for API requests and responses
 *
 * Provides a middleware-like pattern for transforming requests before sending,
 * responses after receiving, and handling errors centrally.
 *
 * @example
 * ```typescript
 * const interceptors = new InterceptorManager();
 *
 * // Add auth header to all requests
 * interceptors.request.use(async (config) => ({
 *   ...config,
 *   headers: { ...config.headers, Authorization: `Bearer ${token}` }
 * }));
 *
 * // Log all responses
 * interceptors.response.use(async (response) => {
 *   console.log(`${response.status}: ${response.url}`);
 *   return response;
 * });
 *
 * // Handle errors globally
 * interceptors.error.use(async (error) => {
 *   if (error instanceof AuthenticationError) {
 *     await refreshToken();
 *     throw error; // Re-throw to trigger retry
 *   }
 *   throw error;
 * });
 * ```
 */

/**
 * Configuration for an outgoing request (before fetch)
 */
interface RequestConfig {
    /** The request URL */
    readonly url: string;
    /** HTTP method */
    readonly method: HttpMethod;
    /** Request headers */
    readonly headers: Record<string, string>;
    /** Request body (for POST, PUT, PATCH) */
    readonly body?: unknown;
    /** Request timeout in milliseconds */
    readonly timeout?: number;
    /** Abort signal */
    readonly signal?: AbortSignal;
    /** Additional metadata that can be passed through the interceptor chain */
    readonly metadata?: Readonly<Record<string, unknown>>;
}
/**
 * Mutable request configuration for interceptors to modify
 */
interface MutableRequestConfig {
    /** The request URL */
    url: string;
    /** HTTP method */
    method: HttpMethod;
    /** Request headers */
    headers: Record<string, string>;
    /** Request body (for POST, PUT, PATCH) */
    body?: unknown;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Abort signal */
    signal?: AbortSignal;
    /** Additional metadata that can be passed through the interceptor chain */
    metadata?: Record<string, unknown>;
}
/**
 * Response data passed through response interceptors
 */
interface InterceptorResponse<T = unknown> {
    /** Response data */
    readonly data: T;
    /** HTTP status code */
    readonly status: number;
    /** Response headers */
    readonly headers: Headers;
    /** Original request configuration */
    readonly config: RequestConfig;
    /** Additional metadata */
    readonly metadata?: Readonly<Record<string, unknown>>;
}
/**
 * Mutable response for interceptors to modify
 */
interface MutableInterceptorResponse<T = unknown> {
    /** Response data */
    data: T;
    /** HTTP status code */
    status: number;
    /** Response headers */
    headers: Headers;
    /** Original request configuration */
    config: RequestConfig;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Error context passed through error interceptors
 */
interface InterceptorError {
    /** The error that occurred */
    readonly error: unknown;
    /** The request configuration that caused the error */
    readonly config: RequestConfig;
    /** The response if one was received (e.g., for HTTP errors) */
    readonly response?: InterceptorResponse;
}
/**
 * Request interceptor function
 *
 * @param config - The request configuration
 * @returns Modified request configuration
 */
type RequestInterceptor = (config: MutableRequestConfig) => MutableRequestConfig | Promise<MutableRequestConfig>;
/**
 * Response interceptor function
 *
 * @param response - The response data
 * @returns Modified response data
 */
type ResponseInterceptor<T = unknown> = (response: MutableInterceptorResponse<T>) => MutableInterceptorResponse<T> | Promise<MutableInterceptorResponse<T>>;
/**
 * Error interceptor function
 *
 * @param context - The error context
 * @returns Should throw the error or a new error, or return a recovery response
 */
type ErrorInterceptor<T = unknown> = (context: InterceptorError) => Promise<MutableInterceptorResponse<T>> | never;
/**
 * Handle for removing an interceptor
 */
interface InterceptorHandle {
    /** Remove this interceptor */
    remove(): void;
}
/**
 * Chain of interceptors that can be added to and removed from
 *
 * @example
 * ```typescript
 * const chain = new InterceptorChain<RequestInterceptor>();
 *
 * // Add an interceptor
 * const handle = chain.use(async (config) => {
 *   config.headers['X-Custom'] = 'value';
 *   return config;
 * });
 *
 * // Later, remove it
 * handle.remove();
 * ```
 */
declare class InterceptorChain<T extends (...args: never[]) => unknown> {
    private readonly interceptors;
    private nextId;
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
    use(interceptor: T): InterceptorHandle;
    /**
     * Get all interceptors in order
     *
     * @returns Array of interceptor functions
     */
    getInterceptors(): readonly T[];
    /**
     * Check if any interceptors are registered
     *
     * @returns true if the chain has interceptors
     */
    hasInterceptors(): boolean;
    /**
     * Get the number of registered interceptors
     */
    get size(): number;
    /**
     * Clear all interceptors from the chain
     */
    clear(): void;
}
/**
 * Manager for all interceptor chains (request, response, error)
 *
 * @example
 * ```typescript
 * const manager = new InterceptorManager();
 *
 * // Add authentication
 * manager.request.use(async (config) => {
 *   const token = await getAuthToken();
 *   config.headers.Authorization = `Bearer ${token}`;
 *   return config;
 * });
 *
 * // Transform responses
 * manager.response.use(async (response) => {
 *   // Unwrap nested data structure
 *   if (response.data && typeof response.data === 'object' && 'result' in response.data) {
 *     response.data = response.data.result;
 *   }
 *   return response;
 * });
 *
 * // Handle errors
 * manager.error.use(async (context) => {
 *   logError(context.error);
 *   throw context.error;
 * });
 *
 * // Execute with interceptors
 * const config = await manager.runRequestInterceptors({
 *   url: '/api/users',
 *   method: 'GET',
 *   headers: {}
 * });
 * ```
 */
declare class InterceptorManager {
    /** Request interceptor chain */
    readonly request: InterceptorChain<RequestInterceptor>;
    /** Response interceptor chain */
    readonly response: InterceptorChain<ResponseInterceptor>;
    /** Error interceptor chain */
    readonly error: InterceptorChain<ErrorInterceptor>;
    constructor();
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
    runRequestInterceptors(config: RequestConfig): Promise<MutableRequestConfig>;
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
    runResponseInterceptors<T>(response: InterceptorResponse<T>): Promise<MutableInterceptorResponse<T>>;
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
    runErrorInterceptors<T>(context: InterceptorError): Promise<MutableInterceptorResponse<T>>;
    /**
     * Clear all interceptors from all chains
     */
    clear(): void;
}
/**
 * Create common request interceptors
 */
declare const commonInterceptors: {
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
    bearerAuth(getToken: () => string | null | Promise<string | null>): RequestInterceptor;
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
    headers(headers: Record<string, string> | (() => Record<string, string>)): RequestInterceptor;
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
    timing(): RequestInterceptor;
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
    logRequest(logger?: Pick<Console, "log">): RequestInterceptor;
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
    logResponse(logger?: Pick<Console, "log">): ResponseInterceptor;
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
    logError(logger?: Pick<Console, "error">): ErrorInterceptor;
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
    unwrapData(path: string): ResponseInterceptor;
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
    retryOnError<T>(shouldRetry: (error: unknown) => boolean, onRetry: () => Promise<void>): ErrorInterceptor<T>;
};
/**
 * Convert RequestOptions to RequestConfig
 *
 * @param method - HTTP method
 * @param url - Request URL
 * @param options - Request options
 * @returns A RequestConfig object
 */
declare function toRequestConfig(method: HttpMethod, url: string, options?: RequestOptions & {
    body?: unknown;
}): RequestConfig;
/**
 * Convert InterceptorResponse to ApiResponse
 *
 * @param response - The interceptor response
 * @returns An ApiResponse object
 */
declare function toApiResponse<T>(response: InterceptorResponse<T> | MutableInterceptorResponse<T>): ApiResponse<T>;

export { ApiCache, ApiError, ApiResponse, AuthenticationError, AuthorizationError, type CacheAdapter, type CacheConfig, type CacheKeyParams, type CacheResult, type ErrorInterceptor, HttpMethod, InterceptorChain, type InterceptorError, type InterceptorHandle, InterceptorManager, type InterceptorResponse, type MutableInterceptorResponse, type MutableRequestConfig, NetworkError, NotFoundError, RateLimitError, type RequestConfig, type RequestInterceptor, RequestOptions, type ResponseInterceptor, type RetryCallback, type RetryConfig, type RetryContext, RetryExhaustedError, type RetryHandler, type RetryPredicate, type RetryResult, type RetryableErrorType, TimeoutError, ValidationError, type ValidationFieldError, calculateDelay, combinePredicates, commonInterceptors, createCacheKeyGenerator, createRetryHandler, generateCacheKey, isApiError, isApiErrorWithCode, retryOnErrorTypes, retryOnStatusCodes, toApiResponse, toRequestConfig, withMaxAttempts, withRetry };
