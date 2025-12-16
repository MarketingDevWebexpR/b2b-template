'use client';

/**
 * Search Context
 *
 * Manages search state, filters, suggestions, and history for B2B search functionality.
 * Prepared for ElasticSearch integration with support for faceted filtering.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Search result types
 */
export type SearchResultType = 'product' | 'category' | 'brand' | 'document';

/**
 * Sort options for search results
 */
export type SearchSortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'stock_desc'
  | 'newest'
  | 'bestseller';

/**
 * View mode for product listing
 */
export type ProductViewMode = 'grid' | 'list' | 'compact';

/**
 * Price range filter
 */
export interface PriceRange {
  min: number;
  max: number;
}

/**
 * Stock availability filter options
 */
export type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'available_24h' | 'on_order';

/**
 * Facet (filter) value with count
 */
export interface FacetValue {
  value: string;
  label: string;
  count: number;
  selected: boolean;
}

/**
 * Facet (filter category)
 */
export interface Facet {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'tree' | 'color';
  values: FacetValue[];
  isExpanded: boolean;
}

/**
 * Category tree node
 */
export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  count: number;
  children?: CategoryNode[];
  level: number;
  isExpanded?: boolean;
}

/**
 * Search suggestion item
 */
export interface SearchSuggestion {
  type: SearchResultType;
  id: string;
  text: string;
  highlight?: string;
  image?: string;
  category?: string;
  price?: number;
  url: string;
}

/**
 * Search history item
 */
export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount: number;
}

/**
 * Active filters state
 */
export interface ActiveFilters {
  categories: string[];
  brands: string[];
  priceRange?: PriceRange;
  stockFilter: StockFilter;
  attributes: Record<string, string[]>;
  warehouseId?: string;
}

/**
 * Search state
 */
export interface SearchState {
  query: string;
  isSearching: boolean;
  totalResults: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  sortBy: SearchSortOption;
  viewMode: ProductViewMode;
  filters: ActiveFilters;
  facets: Facet[];
  categoryTree: CategoryNode[];
}

/**
 * Search context value
 */
export interface SearchContextValue {
  /** Current search state */
  state: SearchState;
  /** Search suggestions */
  suggestions: SearchSuggestion[];
  /** Is suggestions loading */
  isSuggestionsLoading: boolean;
  /** Search history */
  history: SearchHistoryItem[];
  /** Is search overlay open */
  isSearchOpen: boolean;
  /** Open search overlay */
  openSearch: () => void;
  /** Close search overlay */
  closeSearch: () => void;
  /** Toggle search overlay */
  toggleSearch: () => void;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Execute search */
  search: (query?: string) => Promise<void>;
  /** Clear search */
  clearSearch: () => void;
  /** Set sort option */
  setSortBy: (sort: SearchSortOption) => void;
  /** Set view mode */
  setViewMode: (mode: ProductViewMode) => void;
  /** Set page */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Toggle category filter */
  toggleCategoryFilter: (categoryId: string) => void;
  /** Toggle brand filter */
  toggleBrandFilter: (brandId: string) => void;
  /** Set price range */
  setPriceRange: (range: PriceRange | undefined) => void;
  /** Set stock filter */
  setStockFilter: (filter: StockFilter) => void;
  /** Toggle attribute filter */
  toggleAttributeFilter: (attributeId: string, value: string) => void;
  /** Set warehouse filter */
  setWarehouseFilter: (warehouseId: string | undefined) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Remove specific filter */
  removeFilter: (type: string, value?: string) => void;
  /** Toggle facet expansion */
  toggleFacetExpansion: (facetId: string) => void;
  /** Toggle category expansion in tree */
  toggleCategoryExpansion: (categoryId: string) => void;
  /** Get suggestions for query */
  getSuggestions: (query: string) => Promise<void>;
  /** Clear suggestions */
  clearSuggestions: () => void;
  /** Add to search history */
  addToHistory: (query: string, resultCount: number) => void;
  /** Clear search history */
  clearHistory: () => void;
  /** Quick search by SKU/EAN */
  quickSearch: (code: string) => Promise<SearchSuggestion | null>;
  /** Get active filter count */
  activeFilterCount: number;
  /** Check if any filters are active */
  hasActiveFilters: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockFacets: Facet[] = [
  {
    id: 'brand',
    name: 'Marques',
    type: 'checkbox',
    isExpanded: true,
    values: [
      { value: 'cartier', label: 'Cartier', count: 245, selected: false },
      { value: 'bulgari', label: 'Bulgari', count: 189, selected: false },
      { value: 'chopard', label: 'Chopard', count: 156, selected: false },
      { value: 'van-cleef', label: 'Van Cleef & Arpels', count: 134, selected: false },
      { value: 'boucheron', label: 'Boucheron', count: 98, selected: false },
    ],
  },
  {
    id: 'material',
    name: 'Materiau',
    type: 'checkbox',
    isExpanded: true,
    values: [
      { value: 'or-jaune', label: 'Or jaune 18K', count: 456, selected: false },
      { value: 'or-blanc', label: 'Or blanc 18K', count: 389, selected: false },
      { value: 'or-rose', label: 'Or rose 18K', count: 234, selected: false },
      { value: 'platine', label: 'Platine', count: 167, selected: false },
      { value: 'argent', label: 'Argent 925', count: 345, selected: false },
    ],
  },
  {
    id: 'stone',
    name: 'Pierre principale',
    type: 'checkbox',
    isExpanded: false,
    values: [
      { value: 'diamant', label: 'Diamant', count: 567, selected: false },
      { value: 'saphir', label: 'Saphir', count: 234, selected: false },
      { value: 'emeraude', label: 'Emeraude', count: 189, selected: false },
      { value: 'rubis', label: 'Rubis', count: 156, selected: false },
      { value: 'perle', label: 'Perle', count: 278, selected: false },
    ],
  },
  {
    id: 'price',
    name: 'Prix HT',
    type: 'range',
    isExpanded: true,
    values: [
      { value: '0-500', label: 'Moins de 500 EUR', count: 234, selected: false },
      { value: '500-1000', label: '500 EUR - 1 000 EUR', count: 456, selected: false },
      { value: '1000-5000', label: '1 000 EUR - 5 000 EUR', count: 789, selected: false },
      { value: '5000-10000', label: '5 000 EUR - 10 000 EUR', count: 345, selected: false },
      { value: '10000+', label: 'Plus de 10 000 EUR', count: 167, selected: false },
    ],
  },
];

const mockCategoryTree: CategoryNode[] = [
  {
    id: 'bagues',
    name: 'Bagues',
    slug: 'bagues',
    count: 1234,
    level: 0,
    isExpanded: true,
    children: [
      { id: 'bagues-fiancailles', name: 'Fiancailles', slug: 'bagues/fiancailles', count: 456, level: 1 },
      { id: 'bagues-alliance', name: 'Alliances', slug: 'bagues/alliance', count: 389, level: 1 },
      { id: 'bagues-cocktail', name: 'Cocktail', slug: 'bagues/cocktail', count: 234, level: 1 },
      { id: 'bagues-chevaliere', name: 'Chevalieres', slug: 'bagues/chevaliere', count: 155, level: 1 },
    ],
  },
  {
    id: 'colliers',
    name: 'Colliers',
    slug: 'colliers',
    count: 987,
    level: 0,
    isExpanded: false,
    children: [
      { id: 'colliers-pendentifs', name: 'Pendentifs', slug: 'colliers/pendentifs', count: 345, level: 1 },
      { id: 'colliers-chaines', name: 'Chaines', slug: 'colliers/chaines', count: 289, level: 1 },
      { id: 'colliers-riviere', name: 'Riviere', slug: 'colliers/riviere', count: 156, level: 1 },
      { id: 'colliers-plastron', name: 'Plastron', slug: 'colliers/plastron', count: 89, level: 1 },
    ],
  },
  {
    id: 'boucles',
    name: "Boucles d'oreilles",
    slug: 'boucles-oreilles',
    count: 856,
    level: 0,
    isExpanded: false,
    children: [
      { id: 'boucles-puces', name: 'Puces', slug: 'boucles-oreilles/puces', count: 289, level: 1 },
      { id: 'boucles-pendantes', name: 'Pendantes', slug: 'boucles-oreilles/pendantes', count: 234, level: 1 },
      { id: 'boucles-creoles', name: 'Creoles', slug: 'boucles-oreilles/creoles', count: 178, level: 1 },
      { id: 'boucles-clips', name: 'Clips', slug: 'boucles-oreilles/clips', count: 89, level: 1 },
    ],
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    count: 654,
    level: 0,
    isExpanded: false,
    children: [
      { id: 'bracelets-jonc', name: 'Joncs', slug: 'bracelets/jonc', count: 189, level: 1 },
      { id: 'bracelets-chaine', name: 'Chaines', slug: 'bracelets/chaine', count: 234, level: 1 },
      { id: 'bracelets-manchette', name: 'Manchettes', slug: 'bracelets/manchette', count: 123, level: 1 },
      { id: 'bracelets-tennis', name: 'Tennis', slug: 'bracelets/tennis', count: 89, level: 1 },
    ],
  },
  {
    id: 'montres',
    name: 'Montres',
    slug: 'montres',
    count: 432,
    level: 0,
    isExpanded: false,
    children: [
      { id: 'montres-femme', name: 'Femme', slug: 'montres/femme', count: 234, level: 1 },
      { id: 'montres-homme', name: 'Homme', slug: 'montres/homme', count: 189, level: 1 },
    ],
  },
];

const mockSuggestions: SearchSuggestion[] = [
  {
    type: 'product',
    id: 'prod_001',
    text: 'Bague Solitaire Diamant 1ct Or Blanc',
    highlight: 'Bague <em>Solitaire</em> Diamant 1ct Or Blanc',
    image: '/images/products/solitaire-1ct.jpg',
    category: 'Bagues > Fiancailles',
    price: 4500,
    url: '/products/bague-solitaire-diamant-1ct',
  },
  {
    type: 'product',
    id: 'prod_002',
    text: 'Bague Trilogy Diamants Or Jaune',
    highlight: 'Bague Trilogy <em>Diamants</em> Or Jaune',
    image: '/images/products/trilogy-or-jaune.jpg',
    category: 'Bagues > Fiancailles',
    price: 3200,
    url: '/products/bague-trilogy-diamants',
  },
  {
    type: 'category',
    id: 'cat_bagues',
    text: 'Bagues de Fiancailles',
    url: '/categories/bagues/fiancailles',
  },
  {
    type: 'brand',
    id: 'brand_cartier',
    text: 'Cartier',
    url: '/marques/cartier',
  },
];

// ============================================================================
// Initial State
// ============================================================================

const initialFilters: ActiveFilters = {
  categories: [],
  brands: [],
  priceRange: undefined,
  stockFilter: 'all',
  attributes: {},
  warehouseId: undefined,
};

const initialState: SearchState = {
  query: '',
  isSearching: false,
  totalResults: 0,
  currentPage: 1,
  pageSize: 24,
  totalPages: 0,
  sortBy: 'relevance',
  viewMode: 'grid',
  filters: initialFilters,
  facets: mockFacets,
  categoryTree: mockCategoryTree,
};

// ============================================================================
// Context
// ============================================================================

const SearchContext = createContext<SearchContextValue | null>(null);

// ============================================================================
// Local Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  HISTORY: 'b2b_search_history',
  VIEW_MODE: 'b2b_view_mode',
  PAGE_SIZE: 'b2b_page_size',
} as const;

// ============================================================================
// Provider Props
// ============================================================================

export interface SearchProviderProps {
  children: React.ReactNode;
  /** Default page size */
  defaultPageSize?: number;
  /** Maximum history items to store */
  maxHistoryItems?: number;
  /** Enable mock mode for development */
  mockMode?: boolean;
}

// ============================================================================
// Provider
// ============================================================================

/**
 * Search Provider
 *
 * Provides search functionality, filtering, and history management.
 */
export function SearchProvider({
  children,
  defaultPageSize = 24,
  maxHistoryItems = 10,
  mockMode = true,
}: SearchProviderProps) {
  const [state, setState] = useState<SearchState>(() => ({
    ...initialState,
    pageSize: defaultPageSize,
  }));
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load persisted state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load history
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(
          parsed.map((item: SearchHistoryItem) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      } catch {
        // Ignore parse errors
      }
    }

    // Load view mode
    const savedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ProductViewMode;
    if (savedViewMode && ['grid', 'list', 'compact'].includes(savedViewMode)) {
      setState((prev) => ({ ...prev, viewMode: savedViewMode }));
    }

    // Load page size
    const savedPageSize = localStorage.getItem(STORAGE_KEYS.PAGE_SIZE);
    if (savedPageSize) {
      const size = parseInt(savedPageSize, 10);
      if (!isNaN(size) && size > 0) {
        setState((prev) => ({ ...prev, pageSize: size }));
      }
    }
  }, []);

  // Persist history to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  // Open/close search
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    clearSuggestions();
  }, []);
  const toggleSearch = useCallback(() => setIsSearchOpen((prev) => !prev), []);

  // Set query without searching
  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  // Execute search
  const search = useCallback(
    async (query?: string) => {
      const searchQuery = query ?? state.query;
      if (!searchQuery.trim()) return;

      setState((prev) => ({ ...prev, isSearching: true, query: searchQuery }));

      try {
        if (mockMode) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Mock results
          const mockTotal = Math.floor(Math.random() * 500) + 50;
          setState((prev) => ({
            ...prev,
            isSearching: false,
            totalResults: mockTotal,
            totalPages: Math.ceil(mockTotal / prev.pageSize),
            currentPage: 1,
          }));

          // Add to history
          addToHistory(searchQuery, mockTotal);
        } else {
          // TODO: Real API call
          // const response = await searchApi.search({ query: searchQuery, ...state.filters });
        }
      } catch (err) {
        console.error('Search error:', err);
        setState((prev) => ({ ...prev, isSearching: false }));
      }
    },
    [state.query, state.filters, state.pageSize, mockMode]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      query: '',
      totalResults: 0,
      currentPage: 1,
      totalPages: 0,
      filters: initialFilters,
    }));
    setSuggestions([]);
  }, []);

  // Sort and pagination
  const setSortBy = useCallback((sortBy: SearchSortOption) => {
    setState((prev) => ({ ...prev, sortBy, currentPage: 1 }));
  }, []);

  const setViewMode = useCallback((viewMode: ProductViewMode) => {
    setState((prev) => ({ ...prev, viewMode }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    }
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: Math.max(1, Math.min(page, prev.totalPages)) }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState((prev) => ({
      ...prev,
      pageSize,
      totalPages: Math.ceil(prev.totalResults / pageSize),
      currentPage: 1,
    }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PAGE_SIZE, String(pageSize));
    }
  }, []);

  // Filter management
  const toggleCategoryFilter = useCallback((categoryId: string) => {
    setState((prev) => {
      const categories = prev.filters.categories.includes(categoryId)
        ? prev.filters.categories.filter((id) => id !== categoryId)
        : [...prev.filters.categories, categoryId];
      return {
        ...prev,
        filters: { ...prev.filters, categories },
        currentPage: 1,
      };
    });
  }, []);

  const toggleBrandFilter = useCallback((brandId: string) => {
    setState((prev) => {
      const brands = prev.filters.brands.includes(brandId)
        ? prev.filters.brands.filter((id) => id !== brandId)
        : [...prev.filters.brands, brandId];

      // Update facet selection state
      const facets = prev.facets.map((facet) =>
        facet.id === 'brand'
          ? {
              ...facet,
              values: facet.values.map((v) => ({
                ...v,
                selected: brands.includes(v.value),
              })),
            }
          : facet
      );

      return {
        ...prev,
        filters: { ...prev.filters, brands },
        facets,
        currentPage: 1,
      };
    });
  }, []);

  const setPriceRange = useCallback((priceRange: PriceRange | undefined) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, priceRange },
      currentPage: 1,
    }));
  }, []);

  const setStockFilter = useCallback((stockFilter: StockFilter) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, stockFilter },
      currentPage: 1,
    }));
  }, []);

  const toggleAttributeFilter = useCallback((attributeId: string, value: string) => {
    setState((prev) => {
      const currentValues = prev.filters.attributes[attributeId] ?? [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      const attributes = { ...prev.filters.attributes };
      if (newValues.length === 0) {
        delete attributes[attributeId];
      } else {
        attributes[attributeId] = newValues;
      }

      // Update facet selection state
      const facets = prev.facets.map((facet) =>
        facet.id === attributeId
          ? {
              ...facet,
              values: facet.values.map((v) => ({
                ...v,
                selected: newValues.includes(v.value),
              })),
            }
          : facet
      );

      return {
        ...prev,
        filters: { ...prev.filters, attributes },
        facets,
        currentPage: 1,
      };
    });
  }, []);

  const setWarehouseFilter = useCallback((warehouseId: string | undefined) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, warehouseId },
      currentPage: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: initialFilters,
      facets: prev.facets.map((facet) => ({
        ...facet,
        values: facet.values.map((v) => ({ ...v, selected: false })),
      })),
      currentPage: 1,
    }));
  }, []);

  const removeFilter = useCallback((type: string, value?: string) => {
    setState((prev) => {
      const newFilters = { ...prev.filters };

      switch (type) {
        case 'category':
          if (value) {
            newFilters.categories = newFilters.categories.filter((c) => c !== value);
          }
          break;
        case 'brand':
          if (value) {
            newFilters.brands = newFilters.brands.filter((b) => b !== value);
          }
          break;
        case 'price':
          newFilters.priceRange = undefined;
          break;
        case 'stock':
          newFilters.stockFilter = 'all';
          break;
        case 'warehouse':
          newFilters.warehouseId = undefined;
          break;
        default:
          // Attribute filter
          if (value && newFilters.attributes[type]) {
            newFilters.attributes[type] = newFilters.attributes[type].filter((v) => v !== value);
            if (newFilters.attributes[type].length === 0) {
              delete newFilters.attributes[type];
            }
          }
      }

      return {
        ...prev,
        filters: newFilters,
        currentPage: 1,
      };
    });
  }, []);

  // Facet expansion
  const toggleFacetExpansion = useCallback((facetId: string) => {
    setState((prev) => ({
      ...prev,
      facets: prev.facets.map((facet) =>
        facet.id === facetId ? { ...facet, isExpanded: !facet.isExpanded } : facet
      ),
    }));
  }, []);

  // Category tree expansion
  const toggleCategoryExpansion = useCallback((categoryId: string) => {
    const toggleNode = (nodes: CategoryNode[]): CategoryNode[] =>
      nodes.map((node) => {
        if (node.id === categoryId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });

    setState((prev) => ({
      ...prev,
      categoryTree: toggleNode(prev.categoryTree),
    }));
  }, []);

  // Suggestions
  const getSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        return;
      }

      // Debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsSuggestionsLoading(true);

        try {
          if (mockMode) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            // Filter mock suggestions
            const filtered = mockSuggestions.filter((s) =>
              s.text.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered.length > 0 ? filtered : mockSuggestions.slice(0, 4));
          } else {
            // TODO: Real API call
          }
        } catch (err) {
          console.error('Suggestions error:', err);
        } finally {
          setIsSuggestionsLoading(false);
        }
      }, 200);
    },
    [mockMode]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // History management
  const addToHistory = useCallback(
    (query: string, resultCount: number) => {
      setHistory((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
        // Add new item at the beginning
        const newHistory = [
          { query, timestamp: new Date(), resultCount },
          ...filtered,
        ].slice(0, maxHistoryItems);
        return newHistory;
      });
    },
    [maxHistoryItems]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    }
  }, []);

  // Quick search by SKU/EAN
  const quickSearch = useCallback(
    async (code: string): Promise<SearchSuggestion | null> => {
      if (!code.trim()) return null;

      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Mock: return first product suggestion
          return mockSuggestions.find((s) => s.type === 'product') ?? null;
        } else {
          // TODO: Real API call
          return null;
        }
      } catch (err) {
        console.error('Quick search error:', err);
        return null;
      }
    },
    [mockMode]
  );

  // Computed values
  const activeFilterCount = useMemo(() => {
    const { categories, brands, priceRange, stockFilter, attributes, warehouseId } = state.filters;
    let count = 0;
    count += categories.length;
    count += brands.length;
    if (priceRange) count += 1;
    if (stockFilter !== 'all') count += 1;
    if (warehouseId) count += 1;
    count += Object.values(attributes).reduce((acc, arr) => acc + arr.length, 0);
    return count;
  }, [state.filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Context value
  const value = useMemo<SearchContextValue>(
    () => ({
      state,
      suggestions,
      isSuggestionsLoading,
      history,
      isSearchOpen,
      openSearch,
      closeSearch,
      toggleSearch,
      setQuery,
      search,
      clearSearch,
      setSortBy,
      setViewMode,
      setPage,
      setPageSize,
      toggleCategoryFilter,
      toggleBrandFilter,
      setPriceRange,
      setStockFilter,
      toggleAttributeFilter,
      setWarehouseFilter,
      clearFilters,
      removeFilter,
      toggleFacetExpansion,
      toggleCategoryExpansion,
      getSuggestions,
      clearSuggestions,
      addToHistory,
      clearHistory,
      quickSearch,
      activeFilterCount,
      hasActiveFilters,
    }),
    [
      state,
      suggestions,
      isSuggestionsLoading,
      history,
      isSearchOpen,
      openSearch,
      closeSearch,
      toggleSearch,
      setQuery,
      search,
      clearSearch,
      setSortBy,
      setViewMode,
      setPage,
      setPageSize,
      toggleCategoryFilter,
      toggleBrandFilter,
      setPriceRange,
      setStockFilter,
      toggleAttributeFilter,
      setWarehouseFilter,
      clearFilters,
      removeFilter,
      toggleFacetExpansion,
      toggleCategoryExpansion,
      getSuggestions,
      clearSuggestions,
      addToHistory,
      clearHistory,
      quickSearch,
      activeFilterCount,
      hasActiveFilters,
    ]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access search context
 *
 * @throws Error if used outside of SearchProvider
 */
export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

/**
 * Hook for search state only
 */
export function useSearchState() {
  const { state, setQuery, search, clearSearch } = useSearch();
  return { state, setQuery, search, clearSearch };
}

/**
 * Hook for search filters
 */
export function useSearchFilters() {
  const {
    state,
    toggleCategoryFilter,
    toggleBrandFilter,
    setPriceRange,
    setStockFilter,
    toggleAttributeFilter,
    setWarehouseFilter,
    clearFilters,
    removeFilter,
    activeFilterCount,
    hasActiveFilters,
  } = useSearch();

  return {
    filters: state.filters,
    facets: state.facets,
    categoryTree: state.categoryTree,
    toggleCategoryFilter,
    toggleBrandFilter,
    setPriceRange,
    setStockFilter,
    toggleAttributeFilter,
    setWarehouseFilter,
    clearFilters,
    removeFilter,
    activeFilterCount,
    hasActiveFilters,
  };
}

/**
 * Hook for search pagination
 */
export function useSearchPagination() {
  const { state, setPage, setPageSize, setSortBy, setViewMode } = useSearch();

  return {
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    totalPages: state.totalPages,
    totalResults: state.totalResults,
    sortBy: state.sortBy,
    viewMode: state.viewMode,
    setPage,
    setPageSize,
    setSortBy,
    setViewMode,
  };
}

/**
 * Hook for search suggestions
 */
export function useSearchSuggestions() {
  const { suggestions, isSuggestionsLoading, getSuggestions, clearSuggestions, history, clearHistory } = useSearch();

  return {
    suggestions,
    isLoading: isSuggestionsLoading,
    getSuggestions,
    clearSuggestions,
    history,
    clearHistory,
  };
}

/**
 * Hook for search overlay state
 */
export function useSearchOverlay() {
  const { isSearchOpen, openSearch, closeSearch, toggleSearch } = useSearch();
  return { isOpen: isSearchOpen, open: openSearch, close: closeSearch, toggle: toggleSearch };
}

export default SearchProvider;
