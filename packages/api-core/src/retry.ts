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

import { ApiError, NetworkError, RateLimitError, TimeoutError } from "./errors";

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
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
export type RetryableErrorType =
  | "NetworkError"
  | "TimeoutError"
  | "RateLimitError"
  | "ApiError";

/**
 * Predicate function to determine if a retry should occur
 *
 * @param error - The error that occurred
 * @param attempt - The current attempt number (1-indexed)
 * @returns true if the request should be retried
 */
export type RetryPredicate = (error: unknown, attempt: number) => boolean;

/**
 * Callback invoked before each retry attempt
 *
 * @param error - The error that triggered the retry
 * @param attempt - The current attempt number (1-indexed)
 * @param delay - The delay in milliseconds before the next attempt
 */
export type RetryCallback = (
  error: unknown,
  attempt: number,
  delay: number
) => void;

/**
 * Context provided during retry execution
 */
export interface RetryContext {
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
export interface RetryResult<T> {
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
export class RetryExhaustedError extends ApiError {
  public override readonly name = "RetryExhaustedError";
  public readonly attempts: number;
  public readonly lastError: unknown;

  constructor(attempts: number, lastError: unknown) {
    const message =
      lastError instanceof Error
        ? `All ${attempts} retry attempts failed. Last error: ${lastError.message}`
        : `All ${attempts} retry attempts failed`;

    super(message, {
      code: "RETRY_EXHAUSTED",
      details: { attempts },
      cause: lastError instanceof Error ? lastError : undefined,
    });

    this.attempts = attempts;
    this.lastError = lastError;
  }
}

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG: Required<
  Omit<RetryConfig, "shouldRetry" | "signal" | "onRetry">
> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30_000,
  backoffMultiplier: 2,
  jitter: true,
  retryOnStatus: [408, 429, 500, 502, 503, 504],
  retryOnError: ["NetworkError", "TimeoutError", "RateLimitError"],
};

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
export function calculateDelay(
  attempt: number,
  config: Pick<
    RetryConfig,
    "initialDelay" | "maxDelay" | "backoffMultiplier" | "jitter"
  >
): number {
  const initialDelay = config.initialDelay ?? DEFAULT_CONFIG.initialDelay;
  const maxDelay = config.maxDelay ?? DEFAULT_CONFIG.maxDelay;
  const multiplier = config.backoffMultiplier ?? DEFAULT_CONFIG.backoffMultiplier;
  const useJitter = config.jitter ?? DEFAULT_CONFIG.jitter;

  // Calculate exponential delay: initialDelay * multiplier^(attempt-1)
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1);

  // Cap at maxDelay
  let delay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (random factor between 0.5 and 1.5)
  if (useJitter) {
    const jitterFactor = 0.5 + Math.random();
    delay = Math.floor(delay * jitterFactor);
  }

  return delay;
}

/**
 * Check if an error matches the configured retry conditions
 *
 * @param error - The error to check
 * @param config - The retry configuration
 * @returns true if the error should trigger a retry
 */
function shouldRetryError(
  error: unknown,
  config: Pick<RetryConfig, "retryOnStatus" | "retryOnError">
): boolean {
  const retryOnStatus = config.retryOnStatus ?? DEFAULT_CONFIG.retryOnStatus;
  const retryOnError = config.retryOnError ?? DEFAULT_CONFIG.retryOnError;

  // Check for ApiError with status code
  if (error instanceof ApiError) {
    // Check status code
    if (retryOnStatus.includes(error.statusCode)) {
      return true;
    }

    // Check error type
    if (retryOnError.includes(error.name as RetryableErrorType)) {
      return true;
    }
  }

  // Check specific error types
  if (error instanceof NetworkError && retryOnError.includes("NetworkError")) {
    return true;
  }

  if (error instanceof TimeoutError && retryOnError.includes("TimeoutError")) {
    return true;
  }

  if (
    error instanceof RateLimitError &&
    retryOnError.includes("RateLimitError")
  ) {
    return true;
  }

  return false;
}

/**
 * Get the retry delay, considering RateLimitError's retryAfter header
 *
 * @param error - The error that occurred
 * @param calculatedDelay - The delay calculated from exponential backoff
 * @returns The delay to use in milliseconds
 */
function getRetryDelay(error: unknown, calculatedDelay: number): number {
  // RateLimitError may include a retryAfter value from the server
  if (error instanceof RateLimitError && error.retryAfter !== undefined) {
    // retryAfter is in seconds, convert to milliseconds
    const serverDelay = error.retryAfter * 1000;
    // Use the longer of the two delays
    return Math.max(serverDelay, calculatedDelay);
  }

  return calculatedDelay;
}

/**
 * Sleep for a specified duration with abort support
 *
 * @param ms - Duration in milliseconds
 * @param signal - Optional AbortSignal to cancel the sleep
 */
async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
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

/**
 * Retry handler function type
 */
export type RetryHandler = <T>(
  operation: () => Promise<T>,
  config?: RetryConfig
) => Promise<RetryResult<T>>;

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
export function createRetryHandler(defaultConfig: RetryConfig = {}): RetryHandler {
  return async function retry<T>(
    operation: () => Promise<T>,
    overrideConfig: RetryConfig = {}
  ): Promise<RetryResult<T>> {
    // Merge configs: override > default > DEFAULT_CONFIG
    const config: Required<
      Omit<RetryConfig, "shouldRetry" | "signal" | "onRetry">
    > & Pick<RetryConfig, "shouldRetry" | "signal" | "onRetry"> = {
      ...DEFAULT_CONFIG,
      ...defaultConfig,
      ...overrideConfig,
    };

    const maxAttempts = config.maxRetries + 1; // +1 for initial attempt
    const startTime = Date.now();
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Check if aborted before attempting
      if (config.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      try {
        const data = await operation();
        return {
          data,
          attempts: attempt,
          totalTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error;

        // Don't retry on abort
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          throw error;
        }

        // Check if we should retry
        const isLastAttempt = attempt >= maxAttempts;
        if (isLastAttempt) {
          break;
        }

        // Check custom predicate first
        if (config.shouldRetry) {
          if (!config.shouldRetry(error, attempt)) {
            break;
          }
        } else if (!shouldRetryError(error, config)) {
          // Fall back to built-in check
          break;
        }

        // Calculate delay
        const baseDelay = calculateDelay(attempt, config);
        const delay = getRetryDelay(error, baseDelay);

        // Call onRetry callback
        if (config.onRetry) {
          config.onRetry(error, attempt, delay);
        }

        // Wait before retrying
        await sleep(delay, config.signal);
      }
    }

    // All retries exhausted
    throw new RetryExhaustedError(maxAttempts, lastError);
  };
}

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
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const handler = createRetryHandler(config);
  return handler(operation);
}

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
export function retryOnStatusCodes(
  statusCodes: readonly number[]
): RetryPredicate {
  return (error: unknown): boolean => {
    if (error instanceof ApiError) {
      return statusCodes.includes(error.statusCode);
    }
    return false;
  };
}

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
export function retryOnErrorTypes(
  errorTypes: readonly RetryableErrorType[]
): RetryPredicate {
  return (error: unknown): boolean => {
    if (error instanceof Error) {
      return errorTypes.includes(error.name as RetryableErrorType);
    }
    return false;
  };
}

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
export function combinePredicates(
  ...predicates: readonly RetryPredicate[]
): RetryPredicate {
  return (error: unknown, attempt: number): boolean => {
    return predicates.some((predicate) => predicate(error, attempt));
  };
}

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
export function withMaxAttempts(
  predicate: RetryPredicate,
  maxAttempt: number
): RetryPredicate {
  return (error: unknown, attempt: number): boolean => {
    if (attempt >= maxAttempt) {
      return false;
    }
    return predicate(error, attempt);
  };
}
