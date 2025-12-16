// src/errors.ts
var ApiError = class extends Error {
  name = "ApiError";
  statusCode;
  code;
  details;
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? "UNKNOWN_ERROR";
    this.details = options.details;
    Error.captureStackTrace?.(this, this.constructor);
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details
    };
  }
};
var NetworkError = class extends ApiError {
  name = "NetworkError";
  constructor(message, cause) {
    super(message, {
      statusCode: 0,
      code: "NETWORK_ERROR",
      cause
    });
  }
};
var AuthenticationError = class extends ApiError {
  name = "AuthenticationError";
  constructor(message = "Authentication failed") {
    super(message, {
      statusCode: 401,
      code: "AUTHENTICATION_ERROR"
    });
  }
};
var AuthorizationError = class extends ApiError {
  name = "AuthorizationError";
  constructor(message = "Access denied") {
    super(message, {
      statusCode: 403,
      code: "AUTHORIZATION_ERROR"
    });
  }
};
var NotFoundError = class extends ApiError {
  name = "NotFoundError";
  constructor(resource, identifier) {
    const message = identifier ? `${resource} with identifier '${identifier}' not found` : `${resource} not found`;
    super(message, {
      statusCode: 404,
      code: "NOT_FOUND",
      details: { resource, identifier }
    });
  }
};
var ValidationError = class extends ApiError {
  name = "ValidationError";
  errors;
  constructor(message, errors = []) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: { errors }
    });
    this.errors = errors;
  }
};
var RateLimitError = class extends ApiError {
  name = "RateLimitError";
  retryAfter;
  constructor(retryAfter) {
    super("Rate limit exceeded", {
      statusCode: 429,
      code: "RATE_LIMIT_EXCEEDED",
      details: { retryAfter }
    });
    this.retryAfter = retryAfter;
  }
};
var TimeoutError = class extends ApiError {
  name = "TimeoutError";
  constructor(timeoutMs) {
    super(`Request timed out after ${timeoutMs}ms`, {
      statusCode: 408,
      code: "TIMEOUT",
      details: { timeoutMs }
    });
  }
};
function isApiError(error) {
  return error instanceof ApiError;
}
function isApiErrorWithCode(error, code) {
  return isApiError(error) && error.code === code;
}

// src/client.ts
var DEFAULT_TIMEOUT = 3e4;
var BaseApiClient = class {
  config;
  fetchFn;
  constructor(config) {
    this.config = {
      ...config,
      timeout: config.timeout ?? DEFAULT_TIMEOUT
    };
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);
  }
  /**
   * Build the full URL with query parameters
   */
  buildUrl(path, params) {
    const url = new URL(path, this.config.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== void 0) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }
  /**
   * Build headers for the request
   */
  buildHeaders(customHeaders) {
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.config.defaultHeaders,
      ...customHeaders
    });
    if (this.config.authToken) {
      headers.set("Authorization", `Bearer ${this.config.authToken}`);
    }
    return headers;
  }
  /**
   * Handle HTTP error responses
   */
  handleErrorResponse(status, body) {
    const message = typeof body === "object" && body !== null && "message" in body ? String(body.message) : `Request failed with status ${status}`;
    switch (status) {
      case 401:
        throw new AuthenticationError(message);
      case 403:
        throw new AuthorizationError(message);
      case 404:
        throw new NotFoundError("Resource", void 0);
      case 429: {
        const retryAfter = typeof body === "object" && body !== null && "retryAfter" in body && typeof body.retryAfter === "number" ? body.retryAfter : void 0;
        throw new RateLimitError(retryAfter);
      }
      default:
        throw new ApiError(message, {
          statusCode: status,
          code: "HTTP_ERROR",
          details: body
        });
    }
  }
  /**
   * Execute an HTTP request
   */
  async request(method, path, options = {}) {
    const { headers, params, timeout, signal, body } = options;
    const url = this.buildUrl(path, params);
    const requestHeaders = this.buildHeaders(headers);
    const timeoutMs = timeout ?? this.config.timeout ?? DEFAULT_TIMEOUT;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
    try {
      const requestInit = {
        method,
        headers: requestHeaders,
        signal: combinedSignal
      };
      if (body !== void 0) {
        requestInit.body = JSON.stringify(body);
      }
      const response = await this.fetchFn(url, requestInit);
      clearTimeout(timeoutId);
      let responseBody;
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
        data: responseBody,
        status: response.status,
        headers: response.headers
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
  async get(path, options) {
    return this.request("GET", path, options);
  }
  /**
   * HTTP POST request
   */
  async post(path, body, options) {
    return this.request("POST", path, { ...options, body });
  }
  /**
   * HTTP PUT request
   */
  async put(path, body, options) {
    return this.request("PUT", path, { ...options, body });
  }
  /**
   * HTTP PATCH request
   */
  async patch(path, body, options) {
    return this.request("PATCH", path, { ...options, body });
  }
  /**
   * HTTP DELETE request
   */
  async delete(path, options) {
    return this.request("DELETE", path, options);
  }
};

export { ApiError, AuthenticationError, AuthorizationError, BaseApiClient, NetworkError, NotFoundError, RateLimitError, TimeoutError, ValidationError, isApiError, isApiErrorWithCode };
//# sourceMappingURL=chunk-ZJODLBWI.js.map
//# sourceMappingURL=chunk-ZJODLBWI.js.map