/**
 * Quotes Action Creators
 *
 * Factory functions for creating type-safe quotes actions.
 * All action creators are pure functions with no side effects.
 *
 * @packageDocumentation
 */

import type { Quote, QuoteSummary, QuoteFilters, QuoteStatus } from "@maison/types";
import type { PaginationState } from "../types/state";
import {
  QuotesActionTypes,
  type FetchQuotesStartAction,
  type FetchQuotesSuccessAction,
  type FetchQuotesFailureAction,
  type FetchQuoteDetailStartAction,
  type FetchQuoteDetailSuccessAction,
  type FetchQuoteDetailFailureAction,
  type SelectQuoteAction,
  type ClearSelectedQuoteAction,
  type SetQuoteFiltersAction,
  type SetQuoteStatusFilterAction,
  type SetQuoteSearchAction,
  type ClearQuoteFiltersAction,
  type SetQuotesPaginationAction,
  type SetQuotesPageAction,
  type CreateQuoteSuccessAction,
  type UpdateQuoteSuccessAction,
  type ResetQuotesStateAction,
  type ClearQuotesErrorAction,
} from "../types/actions";

// ============================================
// Fetch Quotes List Actions
// ============================================

/**
 * Creates an action to start fetching quotes list.
 *
 * @returns Fetch quotes start action
 */
export function fetchQuotesStart(): FetchQuotesStartAction {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_START,
  };
}

/**
 * Creates an action for successful quotes fetch.
 *
 * @param quotes - Array of quote summaries
 * @param pagination - Pagination state
 * @returns Fetch quotes success action
 */
export function fetchQuotesSuccess(
  quotes: readonly QuoteSummary[],
  pagination: PaginationState
): FetchQuotesSuccessAction {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_SUCCESS,
    payload: {
      quotes,
      pagination,
    },
  };
}

/**
 * Creates an action for failed quotes fetch.
 *
 * @param error - Error message
 * @returns Fetch quotes failure action
 */
export function fetchQuotesFailure(error: string): FetchQuotesFailureAction {
  return {
    type: QuotesActionTypes.FETCH_QUOTES_FAILURE,
    payload: {
      error,
    },
  };
}

// ============================================
// Fetch Quote Detail Actions
// ============================================

/**
 * Creates an action to start fetching quote details.
 *
 * @returns Fetch quote detail start action
 */
export function fetchQuoteDetailStart(): FetchQuoteDetailStartAction {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_START,
  };
}

/**
 * Creates an action for successful quote detail fetch.
 *
 * @param quote - Full quote data
 * @returns Fetch quote detail success action
 */
export function fetchQuoteDetailSuccess(
  quote: Quote
): FetchQuoteDetailSuccessAction {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_SUCCESS,
    payload: {
      quote,
    },
  };
}

/**
 * Creates an action for failed quote detail fetch.
 *
 * @param error - Error message
 * @returns Fetch quote detail failure action
 */
export function fetchQuoteDetailFailure(
  error: string
): FetchQuoteDetailFailureAction {
  return {
    type: QuotesActionTypes.FETCH_QUOTE_DETAIL_FAILURE,
    payload: {
      error,
    },
  };
}

// ============================================
// Selection Actions
// ============================================

/**
 * Creates an action to select a quote.
 *
 * @param quoteId - ID of the quote to select
 * @returns Select quote action
 */
export function selectQuote(quoteId: string): SelectQuoteAction {
  return {
    type: QuotesActionTypes.SELECT_QUOTE,
    payload: {
      quoteId,
    },
  };
}

/**
 * Creates an action to clear the selected quote.
 *
 * @returns Clear selected quote action
 */
export function clearSelectedQuote(): ClearSelectedQuoteAction {
  return {
    type: QuotesActionTypes.CLEAR_SELECTED_QUOTE,
  };
}

// ============================================
// Filter Actions
// ============================================

/**
 * Creates an action to set quote filters.
 *
 * @param filters - Quote filters to apply
 * @returns Set quote filters action
 */
export function setQuoteFilters(filters: QuoteFilters): SetQuoteFiltersAction {
  return {
    type: QuotesActionTypes.SET_QUOTE_FILTERS,
    payload: {
      filters,
    },
  };
}

/**
 * Creates an action to set the status filter.
 *
 * @param status - Status to filter by, or 'all' for no filter
 * @returns Set quote status filter action
 */
export function setQuoteStatusFilter(
  status: QuoteStatus | "all"
): SetQuoteStatusFilterAction {
  return {
    type: QuotesActionTypes.SET_QUOTE_STATUS_FILTER,
    payload: {
      status,
    },
  };
}

/**
 * Creates an action to set the search query.
 *
 * @param query - Search query string
 * @returns Set quote search action
 */
export function setQuoteSearch(query: string): SetQuoteSearchAction {
  return {
    type: QuotesActionTypes.SET_QUOTE_SEARCH,
    payload: {
      query,
    },
  };
}

/**
 * Creates an action to clear all quote filters.
 *
 * @returns Clear quote filters action
 */
export function clearQuoteFilters(): ClearQuoteFiltersAction {
  return {
    type: QuotesActionTypes.CLEAR_QUOTE_FILTERS,
  };
}

// ============================================
// Pagination Actions
// ============================================

/**
 * Creates an action to set quotes pagination.
 *
 * @param pagination - Pagination state
 * @returns Set quotes pagination action
 */
export function setQuotesPagination(
  pagination: PaginationState
): SetQuotesPaginationAction {
  return {
    type: QuotesActionTypes.SET_QUOTES_PAGINATION,
    payload: {
      pagination,
    },
  };
}

/**
 * Creates an action to set the current page.
 *
 * @param page - Page number (1-indexed)
 * @returns Set quotes page action
 */
export function setQuotesPage(page: number): SetQuotesPageAction {
  return {
    type: QuotesActionTypes.SET_QUOTES_PAGE,
    payload: {
      page,
    },
  };
}

// ============================================
// CRUD Actions
// ============================================

/**
 * Creates an action for successful quote creation.
 *
 * @param quote - Created quote summary
 * @returns Create quote success action
 */
export function createQuoteSuccess(
  quote: QuoteSummary
): CreateQuoteSuccessAction {
  return {
    type: QuotesActionTypes.CREATE_QUOTE_SUCCESS,
    payload: {
      quote,
    },
  };
}

/**
 * Creates an action for successful quote update.
 *
 * @param quote - Updated quote data
 * @returns Update quote success action
 */
export function updateQuoteSuccess(quote: Quote): UpdateQuoteSuccessAction {
  return {
    type: QuotesActionTypes.UPDATE_QUOTE_SUCCESS,
    payload: {
      quote,
    },
  };
}

// ============================================
// Reset and Clear Actions
// ============================================

/**
 * Creates an action to reset quotes state to initial values.
 *
 * @returns Reset quotes state action
 */
export function resetQuotesState(): ResetQuotesStateAction {
  return {
    type: QuotesActionTypes.RESET_QUOTES_STATE,
  };
}

/**
 * Creates an action to clear quotes error.
 *
 * @returns Clear quotes error action
 */
export function clearQuotesError(): ClearQuotesErrorAction {
  return {
    type: QuotesActionTypes.CLEAR_QUOTES_ERROR,
  };
}

// ============================================
// Async Action Types (for thunks/sagas)
// ============================================

/**
 * Async action type constants for quotes operations.
 */
export const QuotesAsyncActionTypes = {
  /** Fetch quotes list */
  FETCH_QUOTES: "quotes/fetch",
  /** Fetch single quote details */
  FETCH_QUOTE_DETAIL: "quotes/fetchDetail",
  /** Create new quote */
  CREATE_QUOTE: "quotes/create",
  /** Update existing quote */
  UPDATE_QUOTE: "quotes/update",
  /** Submit quote for review */
  SUBMIT_QUOTE: "quotes/submit",
  /** Accept a quote */
  ACCEPT_QUOTE: "quotes/accept",
  /** Reject a quote */
  REJECT_QUOTE: "quotes/reject",
  /** Cancel a quote */
  CANCEL_QUOTE: "quotes/cancel",
  /** Convert quote to order */
  CONVERT_QUOTE: "quotes/convert",
} as const;

/**
 * Async action creator types for external implementation.
 */
export interface QuotesAsyncActions {
  /** Fetches quotes list with current filters */
  fetchQuotes: (filters?: QuoteFilters, page?: number) => Promise<void>;
  /** Fetches a single quote's full details */
  fetchQuoteDetail: (quoteId: string) => Promise<void>;
  /** Creates a new quote */
  createQuote: (data: unknown) => Promise<Quote>;
  /** Updates an existing quote */
  updateQuote: (quoteId: string, data: unknown) => Promise<Quote>;
  /** Submits a quote for seller review */
  submitQuote: (quoteId: string) => Promise<void>;
  /** Accepts a quote */
  acceptQuote: (quoteId: string) => Promise<void>;
  /** Rejects a quote */
  rejectQuote: (quoteId: string, reason?: string) => Promise<void>;
  /** Cancels a quote */
  cancelQuote: (quoteId: string) => Promise<void>;
  /** Converts a quote to an order */
  convertQuote: (quoteId: string) => Promise<string>;
}
