/**
 * Core types for API clients
 */

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Configuration options for API requests
 */
export interface RequestOptions {
  /** Request headers */
  readonly headers?: Readonly<Record<string, string>>;
  /** Query parameters */
  readonly params?: Readonly<Record<string, string | number | boolean | undefined>>;
  /** Request timeout in milliseconds */
  readonly timeout?: number;
  /** Abort signal for request cancellation */
  readonly signal?: AbortSignal;
}

/**
 * Configuration for initializing an API client
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  readonly baseUrl: string;
  /** Default headers to include with every request */
  readonly defaultHeaders?: Readonly<Record<string, string>>;
  /** Default timeout in milliseconds */
  readonly timeout?: number;
  /** Optional authentication token */
  readonly authToken?: string;
  /** Custom fetch implementation (useful for testing) */
  readonly fetch?: typeof globalThis.fetch;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  readonly data: T;
  /** HTTP status code */
  readonly status: number;
  /** Response headers */
  readonly headers: Headers;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  readonly items: readonly T[];
  /** Total number of items across all pages */
  readonly total: number;
  /** Current page number (1-indexed) */
  readonly page: number;
  /** Number of items per page */
  readonly pageSize: number;
  /** Whether there are more pages */
  readonly hasNextPage: boolean;
  /** Whether there are previous pages */
  readonly hasPreviousPage: boolean;
}

/**
 * Interface that all API adapters must implement
 */
export interface ApiAdapter {
  /** Unique identifier for the adapter */
  readonly name: string;
  /** Version of the adapter */
  readonly version: string;
  /** Initialize the adapter with configuration */
  initialize(config: ApiClientConfig): Promise<void>;
  /** Check if the adapter is properly configured */
  isConfigured(): boolean;
  /** Health check for the API connection */
  healthCheck(): Promise<boolean>;
}
