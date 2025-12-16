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
export interface CacheConfig {
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
export interface CacheResult<T> {
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
export interface CacheAdapter {
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
export interface CacheKeyParams {
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
export function generateCacheKey(params: CacheKeyParams): string {
  const parts: string[] = [];

  if (params.method) {
    parts.push(params.method.toUpperCase());
  }

  parts.push(params.path);

  if (params.params && Object.keys(params.params).length > 0) {
    // Sort keys for deterministic output
    const sortedParams: Record<string, unknown> = {};
    for (const key of Object.keys(params.params).sort()) {
      sortedParams[key] = params.params[key];
    }
    parts.push(JSON.stringify(sortedParams));
  }

  if (params.body !== undefined) {
    parts.push(JSON.stringify(params.body));
  }

  if (params.extra && params.extra.length > 0) {
    parts.push(...params.extra);
  }

  return parts.join(":");
}

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
export class ApiCache {
  private readonly cache: Map<string, CacheEntry<unknown>>;
  private readonly config: Required<Omit<CacheConfig, "adapter">> & {
    adapter?: CacheAdapter;
  };
  private readonly accessOrder: Map<string, number>;
  private accessCounter: number;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.accessOrder = new Map();
    this.accessCounter = 0;
    this.config = {
      ttl: config.ttl,
      staleTime: config.staleTime ?? config.ttl,
      maxEntries: config.maxEntries ?? 1000,
      adapter: config.adapter,
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
  async set<T>(
    key: string,
    data: T,
    options?: { readonly ttl?: number; readonly staleTime?: number }
  ): Promise<void> {
    const now = Date.now();
    const ttl = options?.ttl ?? this.config.ttl;
    const staleTime = options?.staleTime ?? this.config.staleTime;

    const entry: CacheEntry<T> = {
      data,
      createdAt: now,
      staleAt: now + staleTime,
      expiresAt: now + ttl,
    };

    // Enforce maxEntries with LRU eviction
    if (this.cache.size >= this.config.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.updateAccessOrder(key);

    // Also store in external adapter if configured
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
  async get<T>(key: string): Promise<CacheResult<T> | null> {
    const now = Date.now();

    // Try local cache first
    let entry = this.cache.get(key) as CacheEntry<T> | undefined;

    // If not in local cache, try external adapter
    if (!entry && this.config.adapter) {
      entry = (await this.config.adapter.get<T>(key)) ?? undefined;
      // Store in local cache for faster subsequent access
      if (entry) {
        this.cache.set(key, entry);
      }
    }

    if (!entry) {
      return null;
    }

    // Check if expired
    if (now >= entry.expiresAt) {
      // Clean up expired entry
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
      timeToExpire: entry.expiresAt - now,
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
  async has(key: string): Promise<boolean> {
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
  async delete(key: string): Promise<boolean> {
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
  async invalidateByPattern(pattern: RegExp): Promise<number> {
    let count = 0;

    // Invalidate from local cache
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        count++;
      }
    }

    // Invalidate from external adapter if configured
    if (this.config.adapter) {
      // Convert RegExp to a simpler pattern for adapter
      // Most adapters use glob-like patterns, so we do a best-effort conversion
      const adapterPattern = pattern.source
        .replace(/\^/g, "")
        .replace(/\$/g, "")
        .replace(/\.\*/g, "*")
        .replace(/\./g, "?");

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
  async invalidateByPrefix(prefix: string): Promise<number> {
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
  async clear(): Promise<void> {
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
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys currently in the local cache
   *
   * @returns An array of cache keys
   */
  keys(): string[] {
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
  stats(): {
    size: number;
    staleCount: number;
    freshCount: number;
    maxEntries: number;
  } {
    const now = Date.now();
    let staleCount = 0;
    let freshCount = 0;

    for (const entry of this.cache.values()) {
      if (now >= entry.expiresAt) {
        continue; // Expired entries don't count
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
      maxEntries: this.config.maxEntries,
    };
  }

  /**
   * Update the access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    this.accessCounter++;
    this.accessOrder.set(key, this.accessCounter);
  }

  /**
   * Evict the least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
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
export function createCacheKeyGenerator(
  prefix: string
): (params: CacheKeyParams) => string {
  return (params: CacheKeyParams) => {
    const baseKey = generateCacheKey(params);
    return `${prefix}:${baseKey}`;
  };
}
