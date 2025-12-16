/**
 * Base API client implementation
 */

import type {
  ApiClientConfig,
  ApiResponse,
  HttpMethod,
  RequestOptions,
} from "./types";
import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
} from "./errors";

/**
 * Default configuration values
 */
const DEFAULT_TIMEOUT = 30_000; // 30 seconds

/**
 * Base API client that all adapters can extend
 */
export class BaseApiClient {
  protected readonly config: ApiClientConfig;
  protected readonly fetchFn: typeof globalThis.fetch;

  constructor(config: ApiClientConfig) {
    this.config = {
      ...config,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * Build the full URL with query parameters
   */
  protected buildUrl(
    path: string,
    params?: RequestOptions["params"]
  ): string {
    const url = new URL(path, this.config.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Build headers for the request
   */
  protected buildHeaders(
    customHeaders?: RequestOptions["headers"]
  ): Headers {
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.config.defaultHeaders,
      ...customHeaders,
    });

    if (this.config.authToken) {
      headers.set("Authorization", `Bearer ${this.config.authToken}`);
    }

    return headers;
  }

  /**
   * Handle HTTP error responses
   */
  protected handleErrorResponse(status: number, body: unknown): never {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed with status ${status}`;

    switch (status) {
      case 401:
        throw new AuthenticationError(message);
      case 403:
        throw new AuthorizationError(message);
      case 404:
        throw new NotFoundError("Resource", undefined);
      case 429: {
        const retryAfter =
          typeof body === "object" &&
          body !== null &&
          "retryAfter" in body &&
          typeof (body as { retryAfter: unknown }).retryAfter === "number"
            ? (body as { retryAfter: number }).retryAfter
            : undefined;
        throw new RateLimitError(retryAfter);
      }
      default:
        throw new ApiError(message, {
          statusCode: status,
          code: "HTTP_ERROR",
          details: body,
        });
    }
  }

  /**
   * Execute an HTTP request
   */
  protected async request<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions & { body?: unknown } = {}
  ): Promise<ApiResponse<T>> {
    const { headers, params, timeout, signal, body } = options;
    const url = this.buildUrl(path, params);
    const requestHeaders = this.buildHeaders(headers);

    // Create timeout controller if needed
    const timeoutMs = timeout ?? this.config.timeout ?? DEFAULT_TIMEOUT;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Combine abort signals
    const combinedSignal = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal;

    try {
      const requestInit: RequestInit = {
        method,
        headers: requestHeaders,
        signal: combinedSignal,
      };

      if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
      }

      const response = await this.fetchFn(url, requestInit);

      clearTimeout(timeoutId);

      // Try to parse response body
      let responseBody: unknown;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      if (!response.ok) {
        this.handleErrorResponse(response.status, responseBody);
      }

      return {
        data: responseBody as T,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(timeoutMs);
        }

        throw new NetworkError(error.message, error);
      }

      throw new NetworkError("Unknown network error");
    }
  }

  /**
   * HTTP GET request
   */
  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path, options);
  }

  /**
   * HTTP POST request
   */
  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, { ...options, body });
  }

  /**
   * HTTP PUT request
   */
  async put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", path, { ...options, body });
  }

  /**
   * HTTP PATCH request
   */
  async patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path, options);
  }
}
