/**
 * Custom error classes for API operations
 */

/**
 * Base error class for all API-related errors
 */
export class ApiError extends Error {
  public override readonly name: string = "ApiError";
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      details?: unknown;
      cause?: Error;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? "UNKNOWN_ERROR";
    this.details = options.details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Error thrown when a network request fails
 */
export class NetworkError extends ApiError {
  public override readonly name = "NetworkError";

  constructor(message: string, cause?: Error) {
    super(message, {
      statusCode: 0,
      code: "NETWORK_ERROR",
      cause,
    });
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends ApiError {
  public override readonly name = "AuthenticationError";

  constructor(message = "Authentication failed") {
    super(message, {
      statusCode: 401,
      code: "AUTHENTICATION_ERROR",
    });
  }
}

/**
 * Error thrown when authorization fails
 */
export class AuthorizationError extends ApiError {
  public override readonly name = "AuthorizationError";

  constructor(message = "Access denied") {
    super(message, {
      statusCode: 403,
      code: "AUTHORIZATION_ERROR",
    });
  }
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends ApiError {
  public override readonly name = "NotFoundError";

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message, {
      statusCode: 404,
      code: "NOT_FOUND",
      details: { resource, identifier },
    });
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends ApiError {
  public override readonly name = "ValidationError";
  public readonly errors: readonly ValidationFieldError[];

  constructor(message: string, errors: readonly ValidationFieldError[] = []) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: { errors },
    });
    this.errors = errors;
  }
}

/**
 * Individual field validation error
 */
export interface ValidationFieldError {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends ApiError {
  public override readonly name = "RateLimitError";
  public readonly retryAfter?: number;

  constructor(retryAfter?: number) {
    super("Rate limit exceeded", {
      statusCode: 429,
      code: "RATE_LIMIT_EXCEEDED",
      details: { retryAfter },
    });
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends ApiError {
  public override readonly name = "TimeoutError";

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`, {
      statusCode: 408,
      code: "TIMEOUT",
      details: { timeoutMs },
    });
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if an error is a specific type of ApiError
 */
export function isApiErrorWithCode<T extends ApiError>(
  error: unknown,
  code: string
): error is T {
  return isApiError(error) && error.code === code;
}
