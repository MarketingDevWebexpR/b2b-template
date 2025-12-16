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

import type { ApiResponse, HttpMethod, RequestOptions } from "./types";
import { ApiError } from "./errors";

/**
 * Configuration for an outgoing request (before fetch)
 */
export interface RequestConfig {
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
export interface MutableRequestConfig {
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
export interface InterceptorResponse<T = unknown> {
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
export interface MutableInterceptorResponse<T = unknown> {
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
export interface InterceptorError {
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
export type RequestInterceptor = (
  config: MutableRequestConfig
) => MutableRequestConfig | Promise<MutableRequestConfig>;

/**
 * Response interceptor function
 *
 * @param response - The response data
 * @returns Modified response data
 */
export type ResponseInterceptor<T = unknown> = (
  response: MutableInterceptorResponse<T>
) => MutableInterceptorResponse<T> | Promise<MutableInterceptorResponse<T>>;

/**
 * Error interceptor function
 *
 * @param context - The error context
 * @returns Should throw the error or a new error, or return a recovery response
 */
export type ErrorInterceptor<T = unknown> = (
  context: InterceptorError
) => Promise<MutableInterceptorResponse<T>> | never;

/**
 * Handle for removing an interceptor
 */
export interface InterceptorHandle {
  /** Remove this interceptor */
  remove(): void;
}

/**
 * Internal interceptor entry with ID for removal
 */
interface InterceptorEntry<T> {
  readonly id: number;
  readonly interceptor: T;
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
export class InterceptorChain<T extends (...args: never[]) => unknown> {
  private readonly interceptors: InterceptorEntry<T>[] = [];
  private nextId = 0;

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
  use(interceptor: T): InterceptorHandle {
    const id = this.nextId++;
    this.interceptors.push({ id, interceptor });

    return {
      remove: () => {
        const index = this.interceptors.findIndex((entry) => entry.id === id);
        if (index !== -1) {
          this.interceptors.splice(index, 1);
        }
      },
    };
  }

  /**
   * Get all interceptors in order
   *
   * @returns Array of interceptor functions
   */
  getInterceptors(): readonly T[] {
    return this.interceptors.map((entry) => entry.interceptor);
  }

  /**
   * Check if any interceptors are registered
   *
   * @returns true if the chain has interceptors
   */
  hasInterceptors(): boolean {
    return this.interceptors.length > 0;
  }

  /**
   * Get the number of registered interceptors
   */
  get size(): number {
    return this.interceptors.length;
  }

  /**
   * Clear all interceptors from the chain
   */
  clear(): void {
    this.interceptors.length = 0;
  }
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
export class InterceptorManager {
  /** Request interceptor chain */
  public readonly request: InterceptorChain<RequestInterceptor>;
  /** Response interceptor chain */
  public readonly response: InterceptorChain<ResponseInterceptor>;
  /** Error interceptor chain */
  public readonly error: InterceptorChain<ErrorInterceptor>;

  constructor() {
    this.request = new InterceptorChain<RequestInterceptor>();
    this.response = new InterceptorChain<ResponseInterceptor>();
    this.error = new InterceptorChain<ErrorInterceptor>();
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
  async runRequestInterceptors(
    config: RequestConfig
  ): Promise<MutableRequestConfig> {
    let mutableConfig: MutableRequestConfig = {
      url: config.url,
      method: config.method,
      headers: { ...config.headers },
      body: config.body,
      timeout: config.timeout,
      signal: config.signal,
      metadata: config.metadata ? { ...config.metadata } : undefined,
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
  async runResponseInterceptors<T>(
    response: InterceptorResponse<T>
  ): Promise<MutableInterceptorResponse<T>> {
    let mutableResponse: MutableInterceptorResponse<T> = {
      data: response.data,
      status: response.status,
      headers: response.headers,
      config: response.config,
      metadata: response.metadata ? { ...response.metadata } : undefined,
    };

    for (const interceptor of this.response.getInterceptors()) {
      mutableResponse = await (interceptor as ResponseInterceptor<T>)(
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
  async runErrorInterceptors<T>(
    context: InterceptorError
  ): Promise<MutableInterceptorResponse<T>> {
    let currentContext = context;

    for (const interceptor of this.error.getInterceptors()) {
      try {
        // If interceptor returns a response, use it as recovery
        const response = await (interceptor as ErrorInterceptor<T>)(
          currentContext
        );
        return response;
      } catch (error) {
        // Update context with new error for next interceptor
        currentContext = {
          ...currentContext,
          error,
        };
      }
    }

    // No interceptor returned a recovery response, throw the final error
    throw currentContext.error;
  }

  /**
   * Clear all interceptors from all chains
   */
  clear(): void {
    this.request.clear();
    this.response.clear();
    this.error.clear();
  }
}

/**
 * Create common request interceptors
 */
export const commonInterceptors = {
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
  bearerAuth(
    getToken: () => string | null | Promise<string | null>
  ): RequestInterceptor {
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
  headers(
    headers: Record<string, string> | (() => Record<string, string>)
  ): RequestInterceptor {
    return (config) => {
      const headersToAdd =
        typeof headers === "function" ? headers() : headers;
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
  timing(): RequestInterceptor {
    return (config) => {
      config.metadata = {
        ...config.metadata,
        startTime: Date.now(),
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
  logRequest(
    logger: Pick<Console, "log"> = console
  ): RequestInterceptor {
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
  logResponse(
    logger: Pick<Console, "log"> = console
  ): ResponseInterceptor {
    return (response) => {
      const startTime = response.config.metadata?.["startTime"];
      const duration =
        typeof startTime === "number" ? Date.now() - startTime : undefined;
      const durationStr = duration !== undefined ? ` (${duration}ms)` : "";
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
  logError(
    logger: Pick<Console, "error"> = console
  ): ErrorInterceptor {
    return async (context) => {
      const errorMessage =
        context.error instanceof Error
          ? context.error.message
          : String(context.error);
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
  unwrapData(path: string): ResponseInterceptor {
    return (response) => {
      const parts = path.split(".");
      let current: unknown = response.data;

      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          // Path not found, return original
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
  retryOnError<T>(
    shouldRetry: (error: unknown) => boolean,
    onRetry: () => Promise<void>
  ): ErrorInterceptor<T> {
    return async (context) => {
      if (shouldRetry(context.error)) {
        await onRetry();
        // The actual retry logic should be handled by the caller
        // We just throw a special error to signal retry is needed
        throw new ApiError("Retry requested", {
          code: "RETRY_REQUESTED",
          cause: context.error instanceof Error ? context.error : undefined,
        });
      }
      throw context.error;
    };
  },
};

/**
 * Convert RequestOptions to RequestConfig
 *
 * @param method - HTTP method
 * @param url - Request URL
 * @param options - Request options
 * @returns A RequestConfig object
 */
export function toRequestConfig(
  method: HttpMethod,
  url: string,
  options: RequestOptions & { body?: unknown } = {}
): RequestConfig {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  return {
    url,
    method,
    headers,
    body: options.body,
    timeout: options.timeout,
    signal: options.signal,
  };
}

/**
 * Convert InterceptorResponse to ApiResponse
 *
 * @param response - The interceptor response
 * @returns An ApiResponse object
 */
export function toApiResponse<T>(
  response: InterceptorResponse<T> | MutableInterceptorResponse<T>
): ApiResponse<T> {
  return {
    data: response.data,
    status: response.status,
    headers: response.headers,
  };
}
