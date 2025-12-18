/**
 * Catalog API Client
 *
 * A type-safe HTTP client for catalog API operations with built-in caching,
 * error handling, and retry logic. Designed for use in both server and client contexts.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/**
 * API client configuration options
 */
export interface CatalogApiClientConfig {
  /** Base URL for API requests (defaults to window.location.origin or process.env) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number;
  /** Enable debug logging (default: false in production) */
  debug?: boolean;
  /** Default cache revalidation time in seconds for Next.js fetch (default: 300) */
  revalidate?: number;
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * Custom error class for API errors with rich context
 */
export class CatalogApiError extends Error {
  public readonly statusCode: number;
  public readonly endpoint: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'CatalogApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.retryable = retryable;
  }

  /**
   * Check if error is a client error (4xx)
   */
  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if error is a not found error (404)
   */
  get isNotFound(): boolean {
    return this.statusCode === 404;
  }
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  /** HTTP method (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Request body (will be JSON stringified) */
  body?: Record<string, unknown>;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Override default timeout */
  timeout?: number;
  /** Override default retry count */
  retries?: number;
  /** Cache revalidation time in seconds (Next.js fetch) */
  revalidate?: number | false;
  /** Cache tags for Next.js revalidation */
  tags?: string[];
  /** Skip cache entirely */
  noCache?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: Required<CatalogApiClientConfig> = {
  baseUrl: '',
  timeout: 10000,
  retries: 3,
  debug: process.env.NODE_ENV === 'development',
  revalidate: 300, // 5 minutes
};

/** Status codes that should trigger a retry */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/** Exponential backoff base delay in ms */
const RETRY_BASE_DELAY = 1000;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  // Exponential backoff with jitter: base * 2^attempt + random jitter
  const exponentialDelay = RETRY_BASE_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
}

/**
 * Build URL with query parameters
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | string[] | undefined>
): string {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Get base URL for API requests
 */
function getBaseUrl(configBaseUrl?: string): string {
  if (configBaseUrl) return configBaseUrl;

  // Server-side
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  // Client-side
  return window.location.origin;
}

// ============================================================================
// API Client Class
// ============================================================================

/**
 * Catalog API Client
 *
 * Provides type-safe methods for interacting with catalog API endpoints
 * with built-in caching, retry logic, and error handling.
 *
 * @example
 * ```typescript
 * const client = new CatalogApiClient();
 *
 * // Fetch brands with caching
 * const brands = await client.get('/api/catalog/brands', {
 *   revalidate: 300,
 *   tags: ['brands'],
 * });
 *
 * // Fetch with query parameters
 * const products = await client.get('/api/catalog/products', {
 *   params: { category: 'rings', limit: 20 },
 * });
 * ```
 */
export class CatalogApiClient {
  private readonly config: Required<CatalogApiClientConfig>;

  constructor(config: CatalogApiClientConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      baseUrl: getBaseUrl(config.baseUrl),
    };
  }

  /**
   * Make a GET request
   */
  async get<T>(
    path: string,
    options?: RequestOptions & {
      params?: Record<string, string | number | boolean | string[] | undefined>;
    }
  ): Promise<T> {
    const url = options?.params
      ? buildUrl(this.config.baseUrl, path, options.params)
      : `${this.config.baseUrl}${path}`;

    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T>(
    path: string,
    body: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  /**
   * Core request method with retry logic and error handling
   */
  private async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.config.timeout,
      retries = this.config.retries,
      revalidate = this.config.revalidate,
      tags,
      noCache = false,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.executeRequest<T>(url, {
          method,
          body,
          headers,
          timeout,
          revalidate: noCache ? false : revalidate,
          tags,
        });
        return result;
      } catch (error) {
        lastError = error as Error;

        const shouldRetry =
          attempt < retries &&
          error instanceof CatalogApiError &&
          error.retryable;

        if (shouldRetry) {
          const delay = getRetryDelay(attempt);
          if (this.config.debug) {
            console.warn(
              `[CatalogApiClient] Retry ${attempt + 1}/${retries} for ${url} after ${delay}ms`
            );
          }
          await sleep(delay);
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute a single request (no retry logic)
   */
  private async executeRequest<T>(
    url: string,
    options: {
      method: string;
      body?: Record<string, unknown>;
      headers: Record<string, string>;
      timeout: number;
      revalidate: number | false;
      tags?: string[];
    }
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      if (this.config.debug) {
        console.log(`[CatalogApiClient] ${options.method} ${url}`);
      }

      // Build fetch options
      const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      };

      // Add body for non-GET requests
      if (options.body && options.method !== 'GET') {
        fetchOptions.body = JSON.stringify(options.body);
      }

      // Add Next.js cache options
      if (options.revalidate !== false || options.tags) {
        fetchOptions.next = {};
        if (options.revalidate !== false) {
          fetchOptions.next.revalidate = options.revalidate;
        }
        if (options.tags) {
          fetchOptions.next.tags = options.tags;
        }
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const isRetryable = RETRYABLE_STATUS_CODES.includes(response.status);
        let errorMessage = `Request failed with status ${response.status}`;

        try {
          const errorBody: ApiErrorResponse = await response.json();
          errorMessage = errorBody.error || errorBody.message || errorMessage;
        } catch {
          // Ignore JSON parse errors for error response
        }

        throw new CatalogApiError(
          errorMessage,
          response.status,
          url,
          isRetryable
        );
      }

      // Parse successful response
      const data = await response.json();

      if (this.config.debug) {
        console.log(`[CatalogApiClient] Response from ${url}:`, data);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new CatalogApiError(
          `Request timed out after ${options.timeout}ms`,
          408,
          url,
          true
        );
      }

      // Re-throw CatalogApiError as-is
      if (error instanceof CatalogApiError) {
        throw error;
      }

      // Wrap other errors
      throw new CatalogApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        url,
        true
      );
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let clientInstance: CatalogApiClient | null = null;

/**
 * Get the singleton Catalog API client instance
 *
 * @example
 * ```typescript
 * const client = getCatalogApiClient();
 * const brands = await client.get('/api/catalog/brands');
 * ```
 */
export function getCatalogApiClient(
  config?: CatalogApiClientConfig
): CatalogApiClient {
  if (!clientInstance || config) {
    clientInstance = new CatalogApiClient(config);
  }
  return clientInstance;
}

/**
 * Create a new Catalog API client instance
 * Use this when you need a client with specific configuration
 */
export function createCatalogApiClient(
  config?: CatalogApiClientConfig
): CatalogApiClient {
  return new CatalogApiClient(config);
}

// ============================================================================
// Server-side fetch helpers
// ============================================================================

/**
 * Fetch data from the catalog API on the server side
 * Optimized for use in Server Components and Route Handlers
 *
 * @example
 * ```typescript
 * // In a Server Component
 * const brands = await fetchCatalogData<BrandResponse>('/api/catalog/brands', {
 *   revalidate: 300,
 *   tags: ['brands'],
 * });
 * ```
 */
export async function fetchCatalogData<T>(
  path: string,
  options?: {
    params?: Record<string, string | number | boolean | string[] | undefined>;
    revalidate?: number | false;
    tags?: string[];
  }
): Promise<T> {
  const client = getCatalogApiClient();
  return client.get<T>(path, options);
}

export default CatalogApiClient;
