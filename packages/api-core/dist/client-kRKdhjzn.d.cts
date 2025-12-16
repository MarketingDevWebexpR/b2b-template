/**
 * Core types for API clients
 */
/**
 * HTTP methods supported by the API client
 */
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
/**
 * Configuration options for API requests
 */
interface RequestOptions {
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
interface ApiClientConfig {
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
interface ApiResponse<T> {
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
interface PaginatedResponse<T> {
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
interface ApiAdapter {
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

/**
 * Base API client implementation
 */

/**
 * Base API client that all adapters can extend
 */
declare class BaseApiClient {
    protected readonly config: ApiClientConfig;
    protected readonly fetchFn: typeof globalThis.fetch;
    constructor(config: ApiClientConfig);
    /**
     * Build the full URL with query parameters
     */
    protected buildUrl(path: string, params?: RequestOptions["params"]): string;
    /**
     * Build headers for the request
     */
    protected buildHeaders(customHeaders?: RequestOptions["headers"]): Headers;
    /**
     * Handle HTTP error responses
     */
    protected handleErrorResponse(status: number, body: unknown): never;
    /**
     * Execute an HTTP request
     */
    protected request<T>(method: HttpMethod, path: string, options?: RequestOptions & {
        body?: unknown;
    }): Promise<ApiResponse<T>>;
    /**
     * HTTP GET request
     */
    get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * HTTP POST request
     */
    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * HTTP PUT request
     */
    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * HTTP PATCH request
     */
    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * HTTP DELETE request
     */
    delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}

export { type ApiResponse as A, BaseApiClient as B, type HttpMethod as H, type PaginatedResponse as P, type RequestOptions as R, type ApiClientConfig as a, type ApiAdapter as b };
