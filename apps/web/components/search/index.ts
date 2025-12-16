// Search components exports
export { SearchOverlay } from './SearchOverlay';

// SearchBar components
export { SearchBar } from './SearchBar';
export { SearchInput } from './SearchBar/SearchInput';
export { SearchSuggestions } from './SearchBar/SearchSuggestions';
export { SearchHistory } from './SearchBar/SearchHistory';
export { QuickSearchBar } from './SearchBar/QuickSearchBar';

// SearchResults components
export {
  SearchResults,
  SearchFacets,
  SearchProductGrid,
  SearchPagination,
  SearchPaginationCompact,
  SearchLoadMore,
  SearchSortSelect,
  SearchSortSelectInline,
  ViewModeToggle,
  ActiveFilters,
  generateMockProducts,
} from './SearchResults';

// Re-export types
export type { SearchBarProps } from './SearchBar';
export type { SearchInputProps } from './SearchBar/SearchInput';
export type { SearchSuggestionsProps } from './SearchBar/SearchSuggestions';
export type { SearchHistoryProps } from './SearchBar/SearchHistory';
export type { QuickSearchBarProps } from './SearchBar/QuickSearchBar';

// SearchResults types
export type { SearchResultsProps } from './SearchResults';
export type { SearchFacetsProps } from './SearchResults/SearchFacets';
export type { SearchProductGridProps } from './SearchResults/SearchProductGrid';
export type { SearchPaginationProps } from './SearchResults/SearchPagination';
export type { SearchSortSelectProps } from './SearchResults/SearchSortSelect';
export type { ViewModeToggleProps } from './SearchResults/ViewModeToggle';
export type { ActiveFiltersProps } from './SearchResults/ActiveFilters';
