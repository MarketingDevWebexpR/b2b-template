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
    isLoading: isSuggestionsLoading,
    getSuggestions,
    clearSuggestions,
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
      return productSuggestions.length + categorySuggestions.length + brandSuggestions.length;
    }
    return 0;
  }, [showHistory, showSuggestionsDropdown, history.length, productSuggestions.length, categorySuggestions.length, brandSuggestions.length]);

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
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
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

              // Check categories
              if (activeIndex < currentIndex + categorySuggestions.length) {
                handleSuggestionClick(categorySuggestions[activeIndex - currentIndex]);
                return;
              }
              currentIndex += categorySuggestions.length;

              // Check brands
              if (activeIndex < currentIndex + brandSuggestions.length) {
                handleSuggestionClick(brandSuggestions[activeIndex - currentIndex]);
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
      brandSuggestions,
      handleHistoryClick,
      handleSuggestionClick,
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
              categories={categorySuggestions}
              brands={brandSuggestions}
              activeIndex={activeIndex}
              isLoading={isSuggestionsLoading}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
