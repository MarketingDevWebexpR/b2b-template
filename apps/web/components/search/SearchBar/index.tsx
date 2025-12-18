'use client';

/**
 * SearchBar Component
 *
 * Advanced B2B search bar with autocomplete featuring:
 * - Product, category, and brand suggestions
 * - Search history (localStorage)
 * - Quick SKU/EAN search
 * - Keyboard navigation (arrows, Enter, Escape)
 * - Cmd/Ctrl+K shortcut to open
 * - ARIA combobox pattern for accessibility
 * - 300ms debounce on input
 *
 * @packageDocumentation
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  useSearch,
  useSearchSuggestions,
  useSearchOverlay,
  type SearchSuggestion,
} from '@/contexts/SearchContext';
import type { CategorySuggestion } from '@/lib/search/medusa-search-client';
import { SearchInput } from './SearchInput';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchHistory } from './SearchHistory';

// ============================================================================
// Types
// ============================================================================

export interface SearchBarProps {
  /** Additional class name for the container */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Show the dropdown suggestions */
  showSuggestions?: boolean;
  /** Auto focus the input on mount */
  autoFocus?: boolean;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Callback when a suggestion is selected */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show voice search button (placeholder for future implementation) */
  showVoiceSearch?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEBOUNCE_DELAY = 300;

// ============================================================================
// Component
// ============================================================================

export function SearchBar({
  className,
  placeholder = 'Rechercher par nom, reference, SKU ou EAN...',
  showSuggestions: enableSuggestions = true,
  autoFocus = false,
  onSearch,
  onSuggestionSelect,
  size = 'md',
  showVoiceSearch = false,
}: SearchBarProps) {
  // Context hooks
  const { state, setQuery, search, clearSearch } = useSearch();
  const {
    suggestions,
    categorySuggestions: contextCategorySuggestions,
    brandSuggestions: contextBrandSuggestions,
    isLoading: isSuggestionsLoading,
    getSuggestions,
    clearSuggestions,
    navigateToCategory,
    navigateToBrand,
    history,
    clearHistory,
  } = useSearchSuggestions();
  const { isOpen: isOverlayOpen, open: openOverlay, close: closeOverlay } = useSearchOverlay();

  // Local state
  const [inputValue, setInputValue] = useState(state.query);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeSection, setActiveSection] = useState<'history' | 'products' | 'categories' | 'brands'>('history');

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Router
  const router = useRouter();

  // Computed values
  const hasHistory = history.length > 0;
  const hasQuery = inputValue.trim().length > 0;
  const showHistory = isDropdownOpen && !hasQuery && hasHistory;
  const showSuggestionsDropdown = enableSuggestions && isDropdownOpen && hasQuery;

  // Group suggestions by type
  const productSuggestions = suggestions.filter((s) => s.type === 'product');
  const categorySuggestions = suggestions.filter((s) => s.type === 'category');
  const brandSuggestions = suggestions.filter((s) => s.type === 'brand');

  // Calculate total navigable items
  const getTotalItems = useCallback(() => {
    if (showHistory) {
      return history.length;
    }
    if (showSuggestionsDropdown) {
      // Use context category suggestions if available, otherwise legacy
      const categoryCount = contextCategorySuggestions.length > 0
        ? contextCategorySuggestions.length
        : categorySuggestions.length;
      // Use context brand suggestions if available, otherwise legacy
      const brandCount = contextBrandSuggestions.length > 0
        ? contextBrandSuggestions.length
        : brandSuggestions.length;
      return productSuggestions.length + categoryCount + brandCount;
    }
    return 0;
  }, [showHistory, showSuggestionsDropdown, history.length, productSuggestions.length, categorySuggestions.length, contextCategorySuggestions.length, brandSuggestions.length, contextBrandSuggestions.length]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsDropdownOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    console.log('[SearchBar] useEffect triggered, inputValue:', inputValue, 'length:', inputValue.trim().length);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.trim().length >= 2) {
      console.log('[SearchBar] Setting debounce for:', inputValue);
      debounceRef.current = setTimeout(() => {
        console.log('[SearchBar] Debounce fired, calling getSuggestions');
        getSuggestions(inputValue);
      }, DEBOUNCE_DELAY);
    } else {
      clearSuggestions();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, getSuggestions, clearSuggestions]);

  // Sync input value with context query
  useEffect(() => {
    setInputValue(state.query);
  }, [state.query]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleInputChange = useCallback((value: string) => {
    console.log('[SearchBar] handleInputChange called with:', value);
    setInputValue(value);
    setActiveIndex(-1);
    if (value.trim().length > 0) {
      setIsDropdownOpen(true);
    }
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsDropdownOpen(true);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    clearSearch();
    clearSuggestions();
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, [clearSearch, clearSuggestions]);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue) {
        setQuery(trimmedValue);
        search(trimmedValue);
        setIsDropdownOpen(false);
        onSearch?.(trimmedValue);
        router.push(`/recherche?q=${encodeURIComponent(trimmedValue)}`);
      }
    },
    [inputValue, setQuery, search, onSearch, router]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: SearchSuggestion) => {
      setInputValue(suggestion.text);
      setIsDropdownOpen(false);
      onSuggestionSelect?.(suggestion);

      if (suggestion.type === 'product') {
        router.push(suggestion.url);
      } else {
        setQuery(suggestion.text);
        search(suggestion.text);
        router.push(suggestion.url);
      }
    },
    [setQuery, search, onSuggestionSelect, router]
  );

  const handleHistoryClick = useCallback(
    (query: string) => {
      setInputValue(query);
      setQuery(query);
      search(query);
      setIsDropdownOpen(false);
      router.push(`/recherche?q=${encodeURIComponent(query)}`);
    },
    [setQuery, search, router]
  );

  const handleClearHistory = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  const handleCategoryClick = useCallback(
    (category: CategorySuggestion) => {
      setIsDropdownOpen(false);
      navigateToCategory(category);
    },
    [navigateToCategory]
  );

  const handleBrandClick = useCallback(
    (brand: import('@/lib/search/medusa-search-client').MarqueSuggestion) => {
      setIsDropdownOpen(false);
      navigateToBrand(brand);
    },
    [navigateToBrand]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const totalItems = getTotalItems();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isDropdownOpen) {
            setIsDropdownOpen(true);
          } else {
            setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (isDropdownOpen) {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0) {
            if (showHistory && history[activeIndex]) {
              handleHistoryClick(history[activeIndex].query);
            } else if (showSuggestionsDropdown) {
              // Calculate which suggestion is selected
              let currentIndex = 0;

              // Check products
              if (activeIndex < productSuggestions.length) {
                handleSuggestionClick(productSuggestions[activeIndex]);
                return;
              }
              currentIndex += productSuggestions.length;

              // Check categories (use context category suggestions if available)
              const activeCategorySuggestions = contextCategorySuggestions.length > 0
                ? contextCategorySuggestions
                : categorySuggestions;
              if (activeIndex < currentIndex + activeCategorySuggestions.length) {
                if (contextCategorySuggestions.length > 0) {
                  handleCategoryClick(contextCategorySuggestions[activeIndex - currentIndex]);
                } else {
                  handleSuggestionClick(categorySuggestions[activeIndex - currentIndex]);
                }
                return;
              }
              currentIndex += activeCategorySuggestions.length;

              // Check brands (use context brand suggestions if available)
              const activeBrandSuggestions = contextBrandSuggestions.length > 0
                ? contextBrandSuggestions
                : brandSuggestions;
              if (activeIndex < currentIndex + activeBrandSuggestions.length) {
                if (contextBrandSuggestions.length > 0) {
                  handleBrandClick(contextBrandSuggestions[activeIndex - currentIndex]);
                } else {
                  handleSuggestionClick(brandSuggestions[activeIndex - currentIndex]);
                }
                return;
              }
            }
          } else {
            handleSubmit();
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsDropdownOpen(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;

        case 'Tab':
          setIsDropdownOpen(false);
          break;
      }
    },
    [
      isDropdownOpen,
      activeIndex,
      getTotalItems,
      showHistory,
      showSuggestionsDropdown,
      history,
      productSuggestions,
      categorySuggestions,
      contextCategorySuggestions,
      brandSuggestions,
      contextBrandSuggestions,
      handleHistoryClick,
      handleSuggestionClick,
      handleCategoryClick,
      handleBrandClick,
      handleSubmit,
    ]
  );

  // ============================================================================
  // Render
  // ============================================================================

  const dropdownId = 'search-suggestions-listbox';
  const inputId = 'search-input';

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      role="combobox"
      aria-expanded={isDropdownOpen}
      aria-haspopup="listbox"
      aria-owns={dropdownId}
    >
      {/* Search Form */}
      <form onSubmit={handleSubmit} role="search">
        <SearchInput
          ref={inputRef}
          id={inputId}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          onClear={handleClear}
          placeholder={placeholder}
          size={size}
          isLoading={isSuggestionsLoading}
          showVoiceSearch={showVoiceSearch}
          aria-controls={dropdownId}
          aria-activedescendant={
            activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
          }
          autoFocus={autoFocus}
        />
      </form>

      {/* Dropdown */}
      {isDropdownOpen && (showHistory || showSuggestionsDropdown) && (
        <div
          ref={listboxRef}
          id={dropdownId}
          role="listbox"
          aria-label="Suggestions de recherche"
          className={cn(
            'absolute top-full left-0 right-0 z-50',
            'mt-2',
            'bg-white',
            'border border-neutral-200',
            'rounded-lg',
            'shadow-lg',
            'overflow-hidden',
            'animate-fade-in-down'
          )}
        >
          {/* Search History */}
          {showHistory && (
            <SearchHistory
              history={history}
              activeIndex={activeIndex}
              onHistoryClick={handleHistoryClick}
              onClearHistory={handleClearHistory}
            />
          )}

          {/* Search Suggestions */}
          {showSuggestionsDropdown && (
            <SearchSuggestions
              query={inputValue}
              products={productSuggestions}
              categorySuggestions={contextCategorySuggestions}
              categories={categorySuggestions}
              brandSuggestions={contextBrandSuggestions}
              brands={brandSuggestions}
              activeIndex={activeIndex}
              isLoading={isSuggestionsLoading}
              onSuggestionClick={handleSuggestionClick}
              onCategoryClick={handleCategoryClick}
              onBrandClick={handleBrandClick}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Re-exports for convenience
export { BrandSuggestionItem } from './BrandSuggestionItem';
export type { BrandSuggestionItemProps } from './BrandSuggestionItem';
export { CategorySuggestionItem } from './CategorySuggestionItem';
export type { CategorySuggestionItemProps } from './CategorySuggestionItem';
export { SearchSuggestions } from './SearchSuggestions';
export type { SearchSuggestionsProps } from './SearchSuggestions';

export default SearchBar;
