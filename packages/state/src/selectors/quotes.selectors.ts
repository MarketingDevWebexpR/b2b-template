/**
 * Quotes Selectors
 *
 * Selector functions for extracting and deriving data from quotes state.
 * All selectors are pure functions that can be used with any state management library.
 *
 * @packageDocumentation
 */

import type { Quote, QuoteSummary, QuoteStatus, QuoteFilters } from "@maison/types";
import type { RootState, QuotesState, LoadingStatus, PaginationState } from "../types/state";
import {
  createDerivedSelector,
  createParameterizedSelector,
} from "../utils/memoize";

// ============================================
// Base Selectors
// ============================================

/**
 * Selects the entire quotes state slice.
 *
 * @param state - Root state
 * @returns Quotes state
 */
export function selectQuotesState(state: RootState): QuotesState {
  return state.quotes;
}

/**
 * Selects all quotes (summary view).
 *
 * @param state - Root state
 * @returns Array of quote summaries
 */
export function selectQuotes(state: RootState): readonly QuoteSummary[] {
  return state.quotes.quotes;
}

/**
 * Selects the currently selected quote (full details).
 *
 * @param state - Root state
 * @returns Selected quote or null
 */
export function selectSelectedQuote(state: RootState): Quote | null {
  return state.quotes.selectedQuote;
}

/**
 * Selects the current quote filters.
 *
 * @param state - Root state
 * @returns Active quote filters
 */
export function selectQuoteFilters(state: RootState): QuoteFilters {
  return state.quotes.filters;
}

/**
 * Selects the active status filter.
 *
 * @param state - Root state
 * @returns Active status filter or 'all'
 */
export function selectActiveStatusFilter(
  state: RootState
): QuoteStatus | "all" {
  return state.quotes.activeStatusFilter;
}

/**
 * Selects the current search query.
 *
 * @param state - Root state
 * @returns Search query string
 */
export function selectQuoteSearchQuery(state: RootState): string {
  return state.quotes.searchQuery;
}

// ============================================
// Status Selectors
// ============================================

/**
 * Selects the quotes list loading status.
 *
 * @param state - Root state
 * @returns Loading status for list
 */
export function selectQuotesListStatus(state: RootState): LoadingStatus {
  return state.quotes.listStatus;
}

/**
 * Selects whether quotes list is loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
export function selectIsQuotesLoading(state: RootState): boolean {
  return state.quotes.listStatus === "loading";
}

/**
 * Selects the quote detail loading status.
 *
 * @param state - Root state
 * @returns Loading status for detail
 */
export function selectQuoteDetailStatus(state: RootState): LoadingStatus {
  return state.quotes.detailStatus;
}

/**
 * Selects whether quote detail is loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
export function selectIsQuoteDetailLoading(state: RootState): boolean {
  return state.quotes.detailStatus === "loading";
}

/**
 * Selects the quotes error message.
 *
 * @param state - Root state
 * @returns Error message or null
 */
export function selectQuotesError(state: RootState): string | null {
  return state.quotes.error;
}

// ============================================
// Pagination Selectors
// ============================================

/**
 * Selects the quotes pagination state.
 *
 * @param state - Root state
 * @returns Pagination state
 */
export function selectQuotesPagination(state: RootState): PaginationState {
  return state.quotes.pagination;
}

/**
 * Selects the current page number.
 *
 * @param state - Root state
 * @returns Current page (1-indexed)
 */
export function selectQuotesCurrentPage(state: RootState): number {
  return state.quotes.pagination.currentPage;
}

/**
 * Selects the total number of quotes.
 *
 * @param state - Root state
 * @returns Total quotes count
 */
export function selectQuotesTotalCount(state: RootState): number {
  return state.quotes.pagination.totalItems;
}

/**
 * Selects whether there's a next page.
 *
 * @param state - Root state
 * @returns True if next page exists
 */
export function selectQuotesHasNextPage(state: RootState): boolean {
  return state.quotes.pagination.hasNextPage;
}

/**
 * Selects whether there's a previous page.
 *
 * @param state - Root state
 * @returns True if previous page exists
 */
export function selectQuotesHasPreviousPage(state: RootState): boolean {
  return state.quotes.pagination.hasPreviousPage;
}

// ============================================
// Derived Selectors
// ============================================

/**
 * Selects a quote by ID from the quotes list.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param quoteId - Quote ID to find
 * @returns Quote summary or undefined
 */
export const selectQuoteById = createParameterizedSelector(
  (state: RootState, quoteId: string): QuoteSummary | undefined =>
    state.quotes.quotes.find((q) => q.id === quoteId)
);

/**
 * Selects quotes filtered by status.
 * Uses the current list and applies client-side filtering.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param status - Status to filter by
 * @returns Filtered quote summaries
 */
export const selectQuotesByStatus = createParameterizedSelector(
  (state: RootState, status: QuoteStatus): readonly QuoteSummary[] =>
    state.quotes.quotes.filter((q) => q.status === status)
);

/**
 * Selects filtered quotes based on current filter state.
 * Applies search query and status filter to the current list.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Filtered quote summaries
 */
export const selectFilteredQuotes = createDerivedSelector(
  [selectQuotes, selectActiveStatusFilter, selectQuoteSearchQuery],
  (quotes, activeStatusFilter, searchQuery): readonly QuoteSummary[] => {
    let filtered = quotes;

    // Apply status filter
    if (activeStatusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === activeStatusFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.quoteNumber.toLowerCase().includes(query) ||
          q.companyName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }
);

/**
 * Selects the count of quotes by status.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param status - Status to count
 * @returns Number of quotes with the given status
 */
export const selectQuoteCountByStatus = createParameterizedSelector(
  (state: RootState, status: QuoteStatus): number =>
    state.quotes.quotes.filter((q) => q.status === status).length
);

/**
 * Selects quotes that have unread messages.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Quotes with unread messages
 */
export const selectQuotesWithUnreadMessages = createDerivedSelector(
  [selectQuotes],
  (quotes): readonly QuoteSummary[] => quotes.filter((q) => q.hasUnreadMessages)
);

/**
 * Selects the count of quotes with unread messages.
 *
 * @param state - Root state
 * @returns Number of quotes with unread messages
 */
export function selectUnreadQuotesCount(state: RootState): number {
  return state.quotes.quotes.filter((q) => q.hasUnreadMessages).length;
}

/**
 * Seven days in milliseconds - constant to avoid creating Date objects on every call.
 */
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Quote statuses that indicate the quote is finalized and shouldn't be considered "expiring".
 */
const FINALIZED_STATUSES: readonly QuoteStatus[] = [
  "accepted",
  "rejected",
  "expired",
  "converted",
  "cancelled",
] as const;

/**
 * Selects quotes that are expiring soon (within 7 days).
 * Memoized to prevent recalculation when quotes haven't changed.
 * Note: The Date comparison uses the current time at the moment of selector call,
 * so results may change over time even with the same state.
 *
 * @param state - Root state
 * @returns Quotes expiring soon
 */
export const selectExpiringQuotes = createDerivedSelector(
  [selectQuotes],
  (quotes): readonly QuoteSummary[] => {
    const now = Date.now();
    const sevenDaysFromNow = now + SEVEN_DAYS_MS;

    return quotes.filter((q) => {
      const validUntilTime = new Date(q.validUntil).getTime();
      return (
        validUntilTime > now &&
        validUntilTime <= sevenDaysFromNow &&
        !FINALIZED_STATUSES.includes(q.status)
      );
    });
  }
);

/**
 * Selects whether there are any quotes.
 *
 * @param state - Root state
 * @returns True if there are quotes
 */
export function selectHasQuotes(state: RootState): boolean {
  return state.quotes.quotes.length > 0;
}

/**
 * Selects the total value of all quotes.
 *
 * @param state - Root state
 * @returns Total value
 */
export function selectQuotesTotalValue(state: RootState): number {
  return state.quotes.quotes.reduce((sum, q) => sum + q.total, 0);
}

// ============================================
// Selected Quote Selectors
// ============================================

/**
 * Selects the selected quote's ID.
 *
 * @param state - Root state
 * @returns Quote ID or null
 */
export function selectSelectedQuoteId(state: RootState): string | null {
  return state.quotes.selectedQuote?.id ?? null;
}

/**
 * Selects the selected quote's status.
 *
 * @param state - Root state
 * @returns Quote status or null
 */
export function selectSelectedQuoteStatus(state: RootState): QuoteStatus | null {
  return state.quotes.selectedQuote?.status ?? null;
}

/**
 * Selects the selected quote's items.
 *
 * @param state - Root state
 * @returns Quote items or empty array
 */
export function selectSelectedQuoteItems(
  state: RootState
): Quote["items"] {
  return state.quotes.selectedQuote?.items ?? [];
}

/**
 * Selects the selected quote's totals.
 *
 * @param state - Root state
 * @returns Quote totals or null
 */
export function selectSelectedQuoteTotals(
  state: RootState
): Quote["totals"] | null {
  return state.quotes.selectedQuote?.totals ?? null;
}

/**
 * Selects whether the selected quote can be accepted.
 * Quote can be accepted if status is 'responded'.
 *
 * @param state - Root state
 * @returns True if quote can be accepted
 */
export function selectCanAcceptSelectedQuote(state: RootState): boolean {
  const status = state.quotes.selectedQuote?.status;
  return status === "responded" || status === "negotiating";
}

/**
 * Selects whether the selected quote can be edited.
 * Quote can be edited if status is 'draft'.
 *
 * @param state - Root state
 * @returns True if quote can be edited
 */
export function selectCanEditSelectedQuote(state: RootState): boolean {
  return state.quotes.selectedQuote?.status === "draft";
}
