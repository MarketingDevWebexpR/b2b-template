/**
 * Quotes Reducer
 *
 * Manages quote list, filters, and selection state for B2B quote management.
 * Pure function with no side effects - compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

import type { QuotesState } from "../types/state";
import type { QuotesAction } from "../types/actions";
import { QuotesActionTypes } from "../types/actions";
import { initialQuotesState, initialPaginationState } from "../types/state";

/**
 * Calculates pagination metadata from raw values.
 *
 * @param currentPage - Current page number
 * @param pageSize - Items per page
 * @param totalItems - Total number of items
 * @returns Complete pagination state
 */
function calculatePagination(
  currentPage: number,
  pageSize: number,
  totalItems: number
): {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
} {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Reducer for quotes state management.
 *
 * Handles:
 * - Fetching and displaying quote lists
 * - Fetching and viewing quote details
 * - Quote filtering and search
 * - Quote selection
 * - Pagination
 * - Quote CRUD operations
 *
 * @param state - Current quotes state
 * @param action - Action to process
 * @returns New quotes state
 *
 * @example
 * ```ts
 * const newState = quotesReducer(currentState, {
 *   type: QuotesActionTypes.SET_QUOTE_STATUS_FILTER,
 *   payload: { status: 'pending' }
 * });
 * ```
 */
export function quotesReducer(
  state: QuotesState = initialQuotesState,
  action: QuotesAction
): QuotesState {
  switch (action.type) {
    case QuotesActionTypes.FETCH_QUOTES_START: {
      return {
        ...state,
        listStatus: "loading",
        error: null,
      };
    }

    case QuotesActionTypes.FETCH_QUOTES_SUCCESS: {
      return {
        ...state,
        quotes: action.payload.quotes,
        pagination: action.payload.pagination,
        listStatus: "succeeded",
        error: null,
      };
    }

    case QuotesActionTypes.FETCH_QUOTES_FAILURE: {
      return {
        ...state,
        listStatus: "failed",
        error: action.payload.error,
      };
    }

    case QuotesActionTypes.FETCH_QUOTE_DETAIL_START: {
      return {
        ...state,
        detailStatus: "loading",
        error: null,
      };
    }

    case QuotesActionTypes.FETCH_QUOTE_DETAIL_SUCCESS: {
      return {
        ...state,
        selectedQuote: action.payload.quote,
        detailStatus: "succeeded",
        error: null,
      };
    }

    case QuotesActionTypes.FETCH_QUOTE_DETAIL_FAILURE: {
      return {
        ...state,
        detailStatus: "failed",
        error: action.payload.error,
      };
    }

    case QuotesActionTypes.SELECT_QUOTE: {
      // Find the quote in the list and set as selected (summary only)
      const quote = state.quotes.find((q) => q.id === action.payload.quoteId);
      if (quote === undefined) {
        return state;
      }
      // Note: selectedQuote expects full Quote, but we only have QuoteSummary here
      // The caller should use FETCH_QUOTE_DETAIL_SUCCESS to set the full quote
      return state;
    }

    case QuotesActionTypes.CLEAR_SELECTED_QUOTE: {
      return {
        ...state,
        selectedQuote: null,
        detailStatus: "idle",
      };
    }

    case QuotesActionTypes.SET_QUOTE_FILTERS: {
      return {
        ...state,
        filters: action.payload.filters,
        pagination: {
          ...state.pagination,
          currentPage: 1, // Reset to first page on filter change
        },
      };
    }

    case QuotesActionTypes.SET_QUOTE_STATUS_FILTER: {
      // Create new filters, removing status key when 'all' is selected
      const { status: _unusedStatus, ...restFilters } = state.filters;
      const newFilters =
        action.payload.status === "all"
          ? restFilters
          : { ...restFilters, status: action.payload.status };

      return {
        ...state,
        activeStatusFilter: action.payload.status,
        filters: newFilters,
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      };
    }

    case QuotesActionTypes.SET_QUOTE_SEARCH: {
      // Handle search filter, removing key when empty
      const { search: _unusedSearch, ...filtersWithoutSearch } = state.filters;
      const newFilters = action.payload.query
        ? { ...filtersWithoutSearch, search: action.payload.query }
        : filtersWithoutSearch;

      return {
        ...state,
        searchQuery: action.payload.query,
        filters: newFilters,
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      };
    }

    case QuotesActionTypes.CLEAR_QUOTE_FILTERS: {
      return {
        ...state,
        filters: {},
        activeStatusFilter: "all",
        searchQuery: "",
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      };
    }

    case QuotesActionTypes.SET_QUOTES_PAGINATION: {
      return {
        ...state,
        pagination: action.payload.pagination,
      };
    }

    case QuotesActionTypes.SET_QUOTES_PAGE: {
      const newPagination = calculatePagination(
        action.payload.page,
        state.pagination.pageSize,
        state.pagination.totalItems
      );
      return {
        ...state,
        pagination: newPagination,
      };
    }

    case QuotesActionTypes.CREATE_QUOTE_SUCCESS: {
      // Add new quote to the beginning of the list
      return {
        ...state,
        quotes: [action.payload.quote, ...state.quotes],
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems + 1,
          totalPages: Math.ceil(
            (state.pagination.totalItems + 1) / state.pagination.pageSize
          ),
        },
      };
    }

    case QuotesActionTypes.UPDATE_QUOTE_SUCCESS: {
      const updatedQuote = action.payload.quote;
      // Update in list if present
      const updatedQuotes = state.quotes.map((q) =>
        q.id === updatedQuote.id
          ? {
              id: updatedQuote.id,
              quoteNumber: updatedQuote.quoteNumber,
              companyId: updatedQuote.companyId,
              companyName: updatedQuote.companyName,
              status: updatedQuote.status,
              priority: updatedQuote.priority,
              itemCount: updatedQuote.items.length,
              total: updatedQuote.totals.total,
              currency: updatedQuote.totals.currency,
              validUntil: updatedQuote.validUntil,
              createdAt: updatedQuote.createdAt,
              updatedAt: updatedQuote.updatedAt,
              hasUnreadMessages: updatedQuote.unreadMessageCount > 0,
            }
          : q
      );

      return {
        ...state,
        quotes: updatedQuotes,
        selectedQuote:
          state.selectedQuote?.id === updatedQuote.id
            ? updatedQuote
            : state.selectedQuote,
      };
    }

    case QuotesActionTypes.RESET_QUOTES_STATE: {
      return initialQuotesState;
    }

    case QuotesActionTypes.CLEAR_QUOTES_ERROR: {
      return {
        ...state,
        error: null,
      };
    }

    default: {
      return state;
    }
  }
}

export default quotesReducer;
