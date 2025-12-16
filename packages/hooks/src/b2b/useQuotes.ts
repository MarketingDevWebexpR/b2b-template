/**
 * Quotes Hook
 *
 * Provides access to B2B quote management functionality.
 */

import { useState, useCallback } from "react";
import type { Quote, QuoteStatus } from "@maison/types";
import type { ICommerceClient } from "@maison/api-client";
import { useApiQuery, invalidateQueries } from "../api/useApiQuery";
import { useApiMutation } from "../api/useApiMutation";

/**
 * Quote filter options
 */
export interface QuoteFilters {
  /** Filter by status */
  status?: QuoteStatus | QuoteStatus[];
  /** Filter by company ID */
  companyId?: string;
  /** Filter quotes after this date */
  createdAfter?: string;
  /** Filter quotes before this date */
  createdBefore?: string;
  /** Search by quote number or product */
  search?: string;
}

/**
 * Quote creation input
 */
export interface CreateQuoteInput {
  /** Cart ID to create quote from */
  cartId: string;
  /** Quote notes */
  notes?: string;
  /** Requested delivery date */
  requestedDeliveryDate?: string;
  /** PO number */
  purchaseOrderNumber?: string;
}

/**
 * Quote response input
 */
export interface RespondToQuoteInput {
  /** Response message */
  message?: string;
  /** Adjusted prices per item */
  priceAdjustments?: Array<{
    itemId: string;
    newPrice: number;
  }>;
  /** Validity period in days */
  validityDays?: number;
}

/**
 * Quotes hook result
 */
export interface UseQuotesResult {
  /** List of quotes */
  quotes: Quote[];
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Fetch quotes */
  fetchQuotes: (filters?: QuoteFilters) => void;
  /** Get a single quote */
  getQuote: (quoteId: string) => Promise<Quote>;
  /** Create quote from cart */
  createFromCart: (input: CreateQuoteInput) => Promise<Quote>;
  /** Submit quote for review */
  submitQuote: (quoteId: string) => Promise<Quote>;
  /** Accept a quote */
  acceptQuote: (quoteId: string) => Promise<Quote>;
  /** Reject a quote */
  rejectQuote: (quoteId: string, reason?: string) => Promise<Quote>;
  /** Respond to quote (for admin/sales) */
  respondToQuote: (quoteId: string, input: RespondToQuoteInput) => Promise<Quote>;
  /** Convert quote to order */
  convertToOrder: (quoteId: string) => Promise<{ orderId: string }>;
  /** Delete draft quote */
  deleteQuote: (quoteId: string) => Promise<void>;
  /** Current filters */
  filters: QuoteFilters;
  /** Set filters */
  setFilters: (filters: QuoteFilters) => void;
  /** Refresh quotes */
  refresh: () => void;
}

/**
 * Hook for managing B2B quotes
 *
 * @param api - API client instance
 * @param initialFilters - Initial filter values
 * @returns Quotes state and actions
 *
 * @example
 * ```typescript
 * const {
 *   quotes,
 *   isLoading,
 *   createFromCart,
 *   acceptQuote,
 *   setFilters
 * } = useQuotes(api, { status: 'pending' });
 *
 * // Create quote from cart
 * await createFromCart({ cartId: 'cart_123', notes: 'Urgent order' });
 *
 * // Filter by status
 * setFilters({ status: 'responded' });
 * ```
 */
export function useQuotes(
  api: ICommerceClient,
  initialFilters: QuoteFilters = {}
): UseQuotesResult {
  const [filters, setFilters] = useState<QuoteFilters>(initialFilters);

  // Query for quotes list
  const {
    data: quotes,
    isLoading,
    error,
    refetch,
  } = useApiQuery<Quote[]>(
    ["quotes", filters],
    async () => {
      if (!api?.b2b?.quotes) {
        return [];
      }
      const result = await api.b2b.quotes.list(filters);
      return result.items ?? result;
    },
    {
      enabled: !!api?.b2b?.quotes,
      staleTime: 30000, // 30 seconds
    }
  );

  // Create quote mutation
  const createMutation = useApiMutation<Quote, CreateQuoteInput>(
    async (input) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.createFromCart(input.cartId, input);
    },
    {
      invalidateKeys: [["quotes"]],
    }
  );

  // Submit quote mutation
  const submitMutation = useApiMutation<Quote, string>(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.submit(quoteId);
    },
    {
      invalidateKeys: [["quotes"]],
    }
  );

  // Accept quote mutation
  const acceptMutation = useApiMutation<Quote, string>(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.accept(quoteId);
    },
    {
      invalidateKeys: [["quotes"]],
    }
  );

  // Reject quote mutation
  const rejectMutation = useApiMutation<Quote, { quoteId: string; reason?: string }>(
    async ({ quoteId, reason }) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.reject(quoteId, reason);
    },
    {
      invalidateKeys: [["quotes"]],
    }
  );

  // Respond to quote mutation
  const respondMutation = useApiMutation<Quote, { quoteId: string; input: RespondToQuoteInput }>(
    async ({ quoteId, input }) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.respond(quoteId, input);
    },
    {
      invalidateKeys: [["quotes"]],
    }
  );

  // Convert to order mutation
  const convertMutation = useApiMutation<{ orderId: string }, string>(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.convertToOrder(quoteId);
    },
    {
      invalidateKeys: [["quotes"], ["orders"]],
    }
  );

  // Delete quote mutation
  const deleteMutation = useApiMutation<void, string>(
    async (quoteId) => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.delete(quoteId);
    },
    {
      invalidateKeys: [["quotes"]],
    }
  );

  const getQuote = useCallback(
    async (quoteId: string): Promise<Quote> => {
      if (!api?.b2b?.quotes) {
        throw new Error("B2B quotes not available");
      }
      return api.b2b.quotes.get(quoteId);
    },
    [api]
  );

  const fetchQuotes = useCallback(
    (newFilters?: QuoteFilters) => {
      if (newFilters) {
        setFilters(newFilters);
      }
      invalidateQueries(["quotes", newFilters ?? filters]);
      refetch();
    },
    [filters, refetch]
  );

  return {
    quotes: quotes ?? [],
    isLoading,
    error,
    filters,
    setFilters,
    fetchQuotes,
    getQuote,
    createFromCart: createMutation.mutateAsync,
    submitQuote: submitMutation.mutateAsync,
    acceptQuote: acceptMutation.mutateAsync,
    rejectQuote: (quoteId, reason) =>
      rejectMutation.mutateAsync({ quoteId, reason }),
    respondToQuote: (quoteId, input) =>
      respondMutation.mutateAsync({ quoteId, input }),
    convertToOrder: convertMutation.mutateAsync,
    deleteQuote: deleteMutation.mutateAsync,
    refresh: refetch,
  };
}
