/**
 * SearchContext
 *
 * Provides global search state management for the jewelry e-commerce app.
 * Features:
 * - Global search state accessible from any component
 * - Active filters management
 * - Search mode (text/voice/barcode)
 * - Integration with useSearch and useSearchHistory hooks
 * - Persistent search history
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Product } from '@bijoux/types';
import {
  useSearch,
  useBarcodeSearch,
  usePopularSearches,
  type SearchState,
  type SearchActions,
  type UseSearchOptions,
} from '@/hooks/useSearch';
import {
  useSearchHistory,
  type SearchHistoryState,
  type SearchHistoryActions,
} from '@/hooks/useSearchHistory';
import type {
  SearchFilters,
  SearchSortOption,
  SearchSuggestion,
  AvailableFilters,
  PopularSearch,
} from '@/lib/api';

// ============================================
// Types
// ============================================

/**
 * Available search modes
 */
export type SearchMode = 'text' | 'voice' | 'barcode';

/**
 * Search UI state (for controlling modals/sheets)
 */
export interface SearchUIState {
  /** Whether the search modal/sheet is open */
  readonly isSearchOpen: boolean;
  /** Whether the filter panel is open */
  readonly isFilterOpen: boolean;
  /** Current search mode */
  readonly mode: SearchMode;
  /** Whether voice input is active */
  readonly isVoiceActive: boolean;
  /** Whether barcode scanner is active */
  readonly isScannerActive: boolean;
}

/**
 * Combined search context state
 */
export interface SearchContextState {
  // Core search state
  readonly search: SearchState;
  // Search history state
  readonly history: SearchHistoryState;
  // Popular searches
  readonly popular: {
    readonly searches: readonly PopularSearch[];
    readonly isLoading: boolean;
  };
  // Barcode search state
  readonly barcode: {
    readonly product: Product | null;
    readonly isLoading: boolean;
    readonly error: string | null;
  };
  // UI state
  readonly ui: SearchUIState;
}

/**
 * Combined search context actions
 */
export interface SearchContextActions {
  // Core search actions
  readonly search: SearchActions;
  // Search history actions
  readonly history: SearchHistoryActions;
  // Barcode actions
  readonly barcode: {
    readonly scan: (barcode: string) => Promise<Product | null>;
    readonly clear: () => void;
  };
  // Popular searches actions
  readonly refreshPopular: () => Promise<void>;
  // UI actions
  readonly openSearch: () => void;
  readonly closeSearch: () => void;
  readonly toggleSearch: () => void;
  readonly openFilters: () => void;
  readonly closeFilters: () => void;
  readonly toggleFilters: () => void;
  readonly setSearchMode: (mode: SearchMode) => void;
  readonly startVoiceSearch: () => void;
  readonly stopVoiceSearch: () => void;
  readonly startBarcodeScanner: () => void;
  readonly stopBarcodeScanner: () => void;
  // Combined actions
  readonly performSearch: (query: string) => Promise<void>;
  readonly selectSuggestion: (suggestion: SearchSuggestion) => void;
  readonly selectHistoryItem: (query: string) => void;
  readonly selectPopularSearch: (query: string) => void;
}

/**
 * Full search context type
 */
export interface SearchContextType {
  readonly state: SearchContextState;
  readonly actions: SearchContextActions;
}

// ============================================
// Context Creation
// ============================================

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// ============================================
// Provider Props
// ============================================

export interface SearchProviderProps {
  readonly children: ReactNode;
  /** Options passed to useSearch hook */
  readonly searchOptions?: UseSearchOptions;
  /** Maximum history items to keep */
  readonly maxHistoryItems?: number;
}

// ============================================
// Provider Implementation
// ============================================

/**
 * SearchProvider component that provides global search state.
 *
 * @example
 * ```tsx
 * // In _layout.tsx or App.tsx
 * <SearchProvider searchOptions={{ debounceMs: 300, pageSize: 20 }}>
 *   <App />
 * </SearchProvider>
 *
 * // In any component
 * const { state, actions } = useSearchContext();
 *
 * // Open search modal
 * actions.openSearch();
 *
 * // Perform search
 * actions.performSearch('gold ring');
 *
 * // Apply filters
 * actions.search.setFilters({
 *   priceRange: { min: 100, max: 500 },
 *   categories: ['rings'],
 * });
 * ```
 */
export function SearchProvider({
  children,
  searchOptions = {},
  maxHistoryItems = 10,
}: SearchProviderProps): JSX.Element {
  // Use the search hook
  const { state: searchState, actions: searchActions } = useSearch({
    debounceMs: 300,
    pageSize: 20,
    enableSuggestions: true,
    minQueryLength: 2,
    ...searchOptions,
    onSearchComplete: (response) => {
      // Save successful searches to history
      if (response.query.length >= 2 && response.totalCount > 0) {
        historyActions.addSearch(response.query);
      }
      searchOptions.onSearchComplete?.(response);
    },
  });

  // Use the search history hook
  const { state: historyState, actions: historyActions } = useSearchHistory({
    maxItems: maxHistoryItems,
  });

  // Use the barcode search hook
  const barcodeSearch = useBarcodeSearch();

  // Use the popular searches hook
  const popularSearches = usePopularSearches();

  // UI State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mode, setMode] = useState<SearchMode>('text');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);

  // ============================================
  // UI Actions
  // ============================================

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
    setMode('text');
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setIsVoiceActive(false);
    setIsScannerActive(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  const openFilters = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  const closeFilters = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const toggleFilters = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  const setSearchMode = useCallback((newMode: SearchMode) => {
    setMode(newMode);
    if (newMode === 'voice') {
      setIsScannerActive(false);
    } else if (newMode === 'barcode') {
      setIsVoiceActive(false);
    } else {
      setIsVoiceActive(false);
      setIsScannerActive(false);
    }
  }, []);

  const startVoiceSearch = useCallback(() => {
    setMode('voice');
    setIsVoiceActive(true);
    setIsScannerActive(false);
  }, []);

  const stopVoiceSearch = useCallback(() => {
    setIsVoiceActive(false);
    setMode('text');
  }, []);

  const startBarcodeScanner = useCallback(() => {
    setMode('barcode');
    setIsScannerActive(true);
    setIsVoiceActive(false);
  }, []);

  const stopBarcodeScanner = useCallback(() => {
    setIsScannerActive(false);
    setMode('text');
    barcodeSearch.clear();
  }, [barcodeSearch]);

  // ============================================
  // Combined Actions
  // ============================================

  /**
   * Perform a search and save to history
   */
  const performSearch = useCallback(
    async (query: string): Promise<void> => {
      searchActions.setQuery(query);
      await searchActions.search();
    },
    [searchActions]
  );

  /**
   * Handle suggestion selection
   */
  const selectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      switch (suggestion.type) {
        case 'product':
          // Navigate to product - handled by consuming component
          searchActions.setQuery(suggestion.text);
          break;
        case 'category':
          // Set category filter
          searchActions.setFilters({
            categories: suggestion.categoryId ? [suggestion.categoryId] : [],
          });
          break;
        case 'collection':
          // Set collection filter
          searchActions.setFilters({
            collections: [suggestion.text],
          });
          break;
        case 'query':
        default:
          // Perform text search
          searchActions.setQuery(suggestion.text);
          break;
      }
      searchActions.clearSuggestions();
    },
    [searchActions]
  );

  /**
   * Handle history item selection
   */
  const selectHistoryItem = useCallback(
    (query: string) => {
      searchActions.setQuery(query);
    },
    [searchActions]
  );

  /**
   * Handle popular search selection
   */
  const selectPopularSearch = useCallback(
    (query: string) => {
      searchActions.setQuery(query);
    },
    [searchActions]
  );

  // ============================================
  // Context Value
  // ============================================

  const state: SearchContextState = useMemo(
    () => ({
      search: searchState,
      history: historyState,
      popular: {
        searches: popularSearches.searches,
        isLoading: popularSearches.isLoading,
      },
      barcode: {
        product: barcodeSearch.product,
        isLoading: barcodeSearch.isLoading,
        error: barcodeSearch.error,
      },
      ui: {
        isSearchOpen,
        isFilterOpen,
        mode,
        isVoiceActive,
        isScannerActive,
      },
    }),
    [
      searchState,
      historyState,
      popularSearches.searches,
      popularSearches.isLoading,
      barcodeSearch.product,
      barcodeSearch.isLoading,
      barcodeSearch.error,
      isSearchOpen,
      isFilterOpen,
      mode,
      isVoiceActive,
      isScannerActive,
    ]
  );

  const actions: SearchContextActions = useMemo(
    () => ({
      search: searchActions,
      history: historyActions,
      barcode: {
        scan: barcodeSearch.scan,
        clear: barcodeSearch.clear,
      },
      refreshPopular: popularSearches.refresh,
      openSearch,
      closeSearch,
      toggleSearch,
      openFilters,
      closeFilters,
      toggleFilters,
      setSearchMode,
      startVoiceSearch,
      stopVoiceSearch,
      startBarcodeScanner,
      stopBarcodeScanner,
      performSearch,
      selectSuggestion,
      selectHistoryItem,
      selectPopularSearch,
    }),
    [
      searchActions,
      historyActions,
      barcodeSearch.scan,
      barcodeSearch.clear,
      popularSearches.refresh,
      openSearch,
      closeSearch,
      toggleSearch,
      openFilters,
      closeFilters,
      toggleFilters,
      setSearchMode,
      startVoiceSearch,
      stopVoiceSearch,
      startBarcodeScanner,
      stopBarcodeScanner,
      performSearch,
      selectSuggestion,
      selectHistoryItem,
      selectPopularSearch,
    ]
  );

  const contextValue: SearchContextType = useMemo(
    () => ({ state, actions }),
    [state, actions]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access the search context.
 * Must be used within a SearchProvider.
 *
 * @returns Search context with state and actions
 * @throws Error if used outside of SearchProvider
 *
 * @example
 * ```tsx
 * function SearchBar() {
 *   const { state, actions } = useSearchContext();
 *
 *   return (
 *     <View>
 *       <TextInput
 *         value={state.search.query}
 *         onChangeText={actions.search.setQuery}
 *         placeholder="Search jewelry..."
 *       />
 *       {state.search.isLoading && <ActivityIndicator />}
 *       <FlatList
 *         data={state.search.results}
 *         renderItem={({ item }) => <ProductCard product={item} />}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */
export function useSearchContext(): SearchContextType {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }

  return context;
}

// ============================================
// Selector Hooks (for performance)
// ============================================

/**
 * Hook to access only search results.
 * Useful for components that only need results.
 */
export function useSearchResults(): {
  results: readonly Product[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
} {
  const { state, actions } = useSearchContext();

  return {
    results: state.search.results,
    isLoading: state.search.isLoading,
    error: state.search.error,
    hasMore: state.search.hasMore,
    loadMore: actions.search.loadMore,
  };
}

/**
 * Hook to access search filters.
 * Useful for filter components.
 */
export function useSearchFilters(): {
  filters: SearchFilters;
  availableFilters: AvailableFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
  clearFilters: () => void;
} {
  const { state, actions } = useSearchContext();

  return {
    filters: state.search.filters,
    availableFilters: state.search.availableFilters,
    setFilters: actions.search.setFilters,
    updateFilter: actions.search.updateFilter,
    clearFilters: actions.search.clearFilters,
  };
}

/**
 * Hook to access search suggestions.
 * Useful for autocomplete components.
 */
export function useSearchSuggestions(): {
  suggestions: readonly SearchSuggestion[];
  isLoading: boolean;
  selectSuggestion: (suggestion: SearchSuggestion) => void;
  clearSuggestions: () => void;
} {
  const { state, actions } = useSearchContext();

  return {
    suggestions: state.search.suggestions,
    isLoading: state.search.isSuggestionsLoading,
    selectSuggestion: actions.selectSuggestion,
    clearSuggestions: actions.search.clearSuggestions,
  };
}

/**
 * Hook to access search sort options.
 * Useful for sort selector components.
 */
export function useSearchSort(): {
  sort: SearchSortOption;
  setSort: (sort: SearchSortOption) => void;
} {
  const { state, actions } = useSearchContext();

  return {
    sort: state.search.sort,
    setSort: actions.search.setSort,
  };
}

/**
 * Hook to access search UI state.
 * Useful for controlling modals and panels.
 */
export function useSearchUI(): {
  ui: SearchUIState;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openFilters: () => void;
  closeFilters: () => void;
  toggleFilters: () => void;
  setSearchMode: (mode: SearchMode) => void;
} {
  const { state, actions } = useSearchContext();

  return {
    ui: state.ui,
    openSearch: actions.openSearch,
    closeSearch: actions.closeSearch,
    toggleSearch: actions.toggleSearch,
    openFilters: actions.openFilters,
    closeFilters: actions.closeFilters,
    toggleFilters: actions.toggleFilters,
    setSearchMode: actions.setSearchMode,
  };
}

export default SearchContext;
