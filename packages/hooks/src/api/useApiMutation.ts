/**
 * Generic API Mutation Hook
 *
 * Provides a reusable hook for performing mutations (create, update, delete)
 * with loading states, error handling, and optimistic updates.
 */

import { useState, useCallback } from "react";
import { invalidateQueries } from "./useApiQuery";

/**
 * Mutation state
 */
export interface MutationState<TData> {
  /** The result data */
  data: TData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Whether mutation was successful */
  isSuccess: boolean;
  /** Whether mutation resulted in error */
  isError: boolean;
}

/**
 * Mutation options
 */
export interface UseApiMutationOptions<TData, TVariables> {
  /** On success callback */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** On error callback */
  onError?: (error: Error, variables: TVariables) => void;
  /** On settled callback (runs after success or error) */
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  /** Query keys to invalidate on success */
  invalidateKeys?: unknown[][];
  /** Retry count (default: 0) */
  retryCount?: number;
}

/**
 * Mutation result
 */
export interface UseApiMutationResult<TData, TVariables> extends MutationState<TData> {
  /** Execute the mutation */
  mutate: (variables: TVariables) => void;
  /** Execute the mutation and return a promise */
  mutateAsync: (variables: TVariables) => Promise<TData>;
  /** Reset the mutation state */
  reset: () => void;
}

/**
 * Generic API mutation hook
 *
 * @param mutationFn - Async function to perform the mutation
 * @param options - Mutation options
 * @returns Mutation result with mutate function and state
 *
 * @example
 * ```typescript
 * const { mutate, isLoading, error } = useApiMutation(
 *   (input) => api.cart.addItem(cartId, input),
 *   {
 *     onSuccess: () => toast.success('Item added!'),
 *     invalidateKeys: [['cart', cartId]]
 *   }
 * );
 *
 * // Usage
 * mutate({ productId: 'prod_123', quantity: 2 });
 * ```
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, TVariables> = {}
): UseApiMutationResult<TData, TVariables> {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = [],
    retryCount = 0,
  } = options;

  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState({
        data: null,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
      });

      let lastError: Error | null = null;
      let attempts = 0;

      while (attempts <= retryCount) {
        try {
          const data = await mutationFn(variables);

          setState({
            data,
            isLoading: false,
            error: null,
            isSuccess: true,
            isError: false,
          });

          // Invalidate related queries
          for (const key of invalidateKeys) {
            invalidateQueries(key);
          }

          onSuccess?.(data, variables);
          onSettled?.(data, null, variables);

          return data;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          attempts++;

          if (attempts > retryCount) {
            break;
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }

      // All retries failed
      setState({
        data: null,
        isLoading: false,
        error: lastError,
        isSuccess: false,
        isError: true,
      });

      onError?.(lastError!, variables);
      onSettled?.(null, lastError, variables);

      throw lastError;
    },
    [mutationFn, retryCount, invalidateKeys, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    (variables: TVariables): void => {
      mutateAsync(variables).catch(() => {
        // Error is already handled in state
      });
    },
    [mutateAsync]
  );

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}
