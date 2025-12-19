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
import { getMedusaSearchClient, type CategorySuggestion, type MarqueSuggestion } from '@/lib/search/medusa-search-client';
import { transformHierarchicalCategoryFacets, transformBrandFacets, transformStockFacets, type FacetDistribution } from '@/lib/search/facet-transformers';

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
 * Hierarchical category path for v3 faceting
 * Supports category_lvl0 through category_lvl4
 */
export interface HierarchicalCategoryPath {
  /** Current category level (0-4) */
  level: number;
  /** Full path segments (e.g., ["Plomberie", "Robinetterie", "Mitigeurs"]) */
  path: string[];
  /** Full path string (e.g., "Plomberie > Robinetterie > Mitigeurs") */
  pathString: string;
}

/**
 * Hierarchical facet value with path information
 */
export interface HierarchicalFacetValue {
  /** Display label (just the last segment) */
  label: string;
  /** Full path string for filtering */
  value: string;
  /** Product count */
  count: number;
  /** Whether this value is currently selected */
  isSelected: boolean;
  /** Full path segments */
  path: string[];
  /** Depth level (0-4) */
  level: number;
}

/**
 * Hierarchical category facets from App Search v3
 * Uses category_lvl0 through category_lvl4 structure
 */
export interface HierarchicalCategoryFacets {
  /** Root categories */
  category_lvl0: HierarchicalFacetValue[];
  /** Level 1 categories (Parent > Child format) */
  category_lvl1: HierarchicalFacetValue[];
  /** Level 2 categories */
  category_lvl2: HierarchicalFacetValue[];
  /** Level 3 categories */
  category_lvl3: HierarchicalFacetValue[];
  /** Level 4 categories */
  category_lvl4: HierarchicalFacetValue[];
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
  /** Hierarchical category path for v3 faceting */
  hierarchicalCategory?: HierarchicalCategoryPath;
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
  /** Hierarchical category facets from App Search v3 */
  hierarchicalCategoryFacets: HierarchicalCategoryFacets;
}

/**
 * Search context value
 */
export interface SearchContextValue {
  /** Current search state */
  state: SearchState;
  /** Search suggestions */
  suggestions: SearchSuggestion[];
  /** Category suggestions with path */
  categorySuggestions: CategorySuggestion[];
  /** Brand suggestions with logo and country */
  brandSuggestions: MarqueSuggestion[];
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
  /** Select a hierarchical category (drill-down navigation) */
  selectHierarchicalCategory: (value: string, level: number) => void;
  /** Navigate up to a parent category level */
  navigateToHierarchicalLevel: (level: number) => void;
  /** Clear hierarchical category selection */
  clearHierarchicalCategory: () => void;
  /** Get suggestions for query */
  getSuggestions: (query: string) => Promise<void>;
  /** Clear suggestions */
  clearSuggestions: () => void;
  /** Navigate to category */
  navigateToCategory: (category: CategorySuggestion) => void;
  /** Navigate to brand */
  navigateToBrand: (brand: MarqueSuggestion) => void;
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
  // v3 stock facet with boolean string values
  {
    id: 'has_stock',
    name: 'Disponibilite',
    type: 'checkbox',
    isExpanded: true,
    values: [
      { value: 'true', label: 'En stock', count: 1850, selected: false },
      { value: 'false', label: 'Sur commande', count: 450, selected: false },
    ],
  },
];

/**
 * Mock hierarchical category facets (App Search v3 format)
 */
const mockHierarchicalCategoryFacets: HierarchicalCategoryFacets = {
  category_lvl0: [
    { label: 'Bagues', value: 'Bagues', count: 1234, isSelected: false, path: ['Bagues'], level: 0 },
    { label: 'Colliers', value: 'Colliers', count: 987, isSelected: false, path: ['Colliers'], level: 0 },
    { label: 'Boucles d\'oreilles', value: 'Boucles d\'oreilles', count: 856, isSelected: false, path: ['Boucles d\'oreilles'], level: 0 },
    { label: 'Bracelets', value: 'Bracelets', count: 654, isSelected: false, path: ['Bracelets'], level: 0 },
    { label: 'Montres', value: 'Montres', count: 432, isSelected: false, path: ['Montres'], level: 0 },
  ],
  category_lvl1: [
    { label: 'Fiancailles', value: 'Bagues > Fiancailles', count: 456, isSelected: false, path: ['Bagues', 'Fiancailles'], level: 1 },
    { label: 'Alliances', value: 'Bagues > Alliances', count: 389, isSelected: false, path: ['Bagues', 'Alliances'], level: 1 },
    { label: 'Cocktail', value: 'Bagues > Cocktail', count: 234, isSelected: false, path: ['Bagues', 'Cocktail'], level: 1 },
    { label: 'Chevalieres', value: 'Bagues > Chevalieres', count: 155, isSelected: false, path: ['Bagues', 'Chevalieres'], level: 1 },
    { label: 'Pendentifs', value: 'Colliers > Pendentifs', count: 345, isSelected: false, path: ['Colliers', 'Pendentifs'], level: 1 },
    { label: 'Chaines', value: 'Colliers > Chaines', count: 289, isSelected: false, path: ['Colliers', 'Chaines'], level: 1 },
  ],
  category_lvl2: [
    { label: 'Solitaires', value: 'Bagues > Fiancailles > Solitaires', count: 234, isSelected: false, path: ['Bagues', 'Fiancailles', 'Solitaires'], level: 2 },
    { label: 'Trilogy', value: 'Bagues > Fiancailles > Trilogy', count: 122, isSelected: false, path: ['Bagues', 'Fiancailles', 'Trilogy'], level: 2 },
    { label: 'Halo', value: 'Bagues > Fiancailles > Halo', count: 100, isSelected: false, path: ['Bagues', 'Fiancailles', 'Halo'], level: 2 },
  ],
  category_lvl3: [],
  category_lvl4: [],
};

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
  hierarchicalCategory: undefined,
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
  hierarchicalCategoryFacets: mockHierarchicalCategoryFacets,
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
  mockMode = false,
}: SearchProviderProps) {
  const [state, setState] = useState<SearchState>(() => ({
    ...initialState,
    pageSize: defaultPageSize,
  }));
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<MarqueSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Track if initial load is complete to avoid triggering search on mount
  const isInitialMount = useRef(true);
  const previousFilters = useRef<string>('');

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

    // Mark initial mount as complete
    isInitialMount.current = false;
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
          // Real API call to Medusa backend
          const client = getMedusaSearchClient();
          const result = await client.searchProducts(searchQuery, {
            limit: state.pageSize,
            offset: (state.currentPage - 1) * state.pageSize,
            facets: true,
            category: state.filters.hierarchicalCategory?.pathString
              ? state.filters.hierarchicalCategory.path[state.filters.hierarchicalCategory.path.length - 1]
              : state.filters.categories[0],
            brand: state.filters.brands[0],
            inStock: state.filters.stockFilter === 'in_stock' ? true : undefined,
            priceMin: state.filters.priceRange?.min,
            priceMax: state.filters.priceRange?.max,
            sort: state.sortBy === 'price_asc' ? 'price_min' : state.sortBy === 'price_desc' ? 'price_min' : undefined,
            order: state.sortBy === 'price_asc' ? 'asc' : state.sortBy === 'price_desc' ? 'desc' : undefined,
          });

          // Transform v3 facets from API response
          const facetDistribution = result.facetDistribution as FacetDistribution | undefined;
          const hierarchicalCategoryFacets = transformHierarchicalCategoryFacets(
            facetDistribution,
            state.filters.hierarchicalCategory?.pathString
          );

          // Transform brand facets
          const brandFacet = transformBrandFacets(facetDistribution, state.filters.brands);

          // Transform stock facets (v3 uses has_stock with "true"/"false" strings)
          const stockCounts = transformStockFacets(facetDistribution);
          const stockFacet: Facet = {
            id: 'has_stock',
            name: 'Disponibilite',
            type: 'checkbox',
            isExpanded: true,
            values: [
              { value: 'true', label: 'En stock', count: stockCounts.inStock, selected: false },
              { value: 'false', label: 'Sur commande', count: stockCounts.outOfStock, selected: false },
            ],
          };

          // Build updated facets array
          const updatedFacets = state.facets.map(facet => {
            if (facet.id === 'brand' && brandFacet) {
              return brandFacet;
            }
            if (facet.id === 'has_stock') {
              return stockFacet;
            }
            return facet;
          });

          // If brand facet doesn't exist yet but we have one from API, add it
          if (brandFacet && !state.facets.some(f => f.id === 'brand')) {
            updatedFacets.unshift(brandFacet);
          }

          // If stock facet doesn't exist yet, add it
          if (!state.facets.some(f => f.id === 'has_stock')) {
            updatedFacets.push(stockFacet);
          }

          setState((prev) => ({
            ...prev,
            isSearching: false,
            totalResults: result.total,
            totalPages: Math.ceil(result.total / prev.pageSize),
            currentPage: 1,
            hierarchicalCategoryFacets,
            facets: updatedFacets,
          }));

          // Add to history
          addToHistory(searchQuery, result.total);
        }
      } catch (err) {
        console.error('Search error:', err);
        setState((prev) => ({ ...prev, isSearching: false }));
      }
    },
    [state.query, state.filters, state.pageSize, mockMode]
  );

  // Auto-trigger search when filters, sort, or page changes
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) return;

    // Only trigger if there's an active query
    if (!state.query.trim()) return;

    // Create a serialized version of current filter state
    const currentFilters = JSON.stringify({
      filters: state.filters,
      sortBy: state.sortBy,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
    });

    // Skip if filters haven't actually changed
    if (currentFilters === previousFilters.current) return;

    // Store current filters for next comparison
    previousFilters.current = currentFilters;

    // Trigger search with debounce to avoid rapid successive calls
    const timeoutId = setTimeout(() => {
      search();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [state.filters, state.sortBy, state.currentPage, state.pageSize, state.query, search]);

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

  // Hierarchical category selection (v3 faceting)
  const selectHierarchicalCategory = useCallback((value: string, level: number) => {
    // Parse the path from the value (e.g., "Plomberie > Robinetterie" -> ["Plomberie", "Robinetterie"])
    const path = value.split(' > ').map((s) => s.trim());
    const pathString = value;

    setState((prev) => {
      // Update the hierarchical category filter
      const hierarchicalCategory: HierarchicalCategoryPath = {
        level,
        path,
        pathString,
      };

      // Update selection state in facets
      const updateFacetSelection = (
        facets: HierarchicalCategoryFacets,
        selectedPath: string[]
      ): HierarchicalCategoryFacets => {
        const levelKeys: (keyof HierarchicalCategoryFacets)[] = [
          'category_lvl0',
          'category_lvl1',
          'category_lvl2',
          'category_lvl3',
          'category_lvl4',
        ];

        const updated = { ...facets };
        levelKeys.forEach((key, idx) => {
          updated[key] = facets[key].map((item) => ({
            ...item,
            isSelected: idx === level && item.value === pathString,
          }));
        });

        return updated;
      };

      return {
        ...prev,
        filters: {
          ...prev.filters,
          hierarchicalCategory,
        },
        hierarchicalCategoryFacets: updateFacetSelection(
          prev.hierarchicalCategoryFacets,
          path
        ),
        currentPage: 1,
      };
    });
  }, []);

  // Navigate to a specific level in the hierarchy (go back up)
  const navigateToHierarchicalLevel = useCallback((level: number) => {
    setState((prev) => {
      const currentPath = prev.filters.hierarchicalCategory?.path;
      if (!currentPath || level < 0) {
        // Clear selection if going to root
        return {
          ...prev,
          filters: {
            ...prev.filters,
            hierarchicalCategory: undefined,
          },
          hierarchicalCategoryFacets: {
            ...prev.hierarchicalCategoryFacets,
            category_lvl0: prev.hierarchicalCategoryFacets.category_lvl0.map((v) => ({
              ...v,
              isSelected: false,
            })),
            category_lvl1: prev.hierarchicalCategoryFacets.category_lvl1.map((v) => ({
              ...v,
              isSelected: false,
            })),
            category_lvl2: prev.hierarchicalCategoryFacets.category_lvl2.map((v) => ({
              ...v,
              isSelected: false,
            })),
            category_lvl3: prev.hierarchicalCategoryFacets.category_lvl3.map((v) => ({
              ...v,
              isSelected: false,
            })),
            category_lvl4: prev.hierarchicalCategoryFacets.category_lvl4.map((v) => ({
              ...v,
              isSelected: false,
            })),
          },
          currentPage: 1,
        };
      }

      // Trim path to the target level
      const newPath = currentPath.slice(0, level + 1);
      const newPathString = newPath.join(' > ');

      return {
        ...prev,
        filters: {
          ...prev.filters,
          hierarchicalCategory: {
            level,
            path: newPath,
            pathString: newPathString,
          },
        },
        currentPage: 1,
      };
    });
  }, []);

  // Clear hierarchical category selection
  const clearHierarchicalCategory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        hierarchicalCategory: undefined,
      },
      hierarchicalCategoryFacets: {
        ...prev.hierarchicalCategoryFacets,
        category_lvl0: prev.hierarchicalCategoryFacets.category_lvl0.map((v) => ({
          ...v,
          isSelected: false,
        })),
        category_lvl1: prev.hierarchicalCategoryFacets.category_lvl1.map((v) => ({
          ...v,
          isSelected: false,
        })),
        category_lvl2: prev.hierarchicalCategoryFacets.category_lvl2.map((v) => ({
          ...v,
          isSelected: false,
        })),
        category_lvl3: prev.hierarchicalCategoryFacets.category_lvl3.map((v) => ({
          ...v,
          isSelected: false,
        })),
        category_lvl4: prev.hierarchicalCategoryFacets.category_lvl4.map((v) => ({
          ...v,
          isSelected: false,
        })),
      },
      currentPage: 1,
    }));
  }, []);

  // Suggestions
  const getSuggestions = useCallback(
    async (query: string) => {
      console.log('[SearchContext] getSuggestions called with:', query, 'mockMode:', mockMode);
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setCategorySuggestions([]);
        setBrandSuggestions([]);
        return;
      }

      // Debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        console.log('[SearchContext] Debounce fired, fetching suggestions for:', query);
        setIsSuggestionsLoading(true);

        try {
          if (mockMode) {
            console.log('[SearchContext] Using MOCK mode');
            await new Promise((resolve) => setTimeout(resolve, 150));
            // Filter mock suggestions
            const filtered = mockSuggestions.filter((s) =>
              s.text.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered.length > 0 ? filtered : mockSuggestions.slice(0, 4));

            // Mock category suggestions
            const mockCategorySuggestionsData: CategorySuggestion[] = [
              {
                id: 'cat_1',
                name: 'Bagues',
                handle: 'bagues',
                path: ['Bijoux', 'Bagues'],
                pathString: 'Bijoux > Bagues',
                fullPath: 'bijoux/bagues',
                productCount: 156,
                depth: 1,
              },
              {
                id: 'cat_2',
                name: 'Bagues Or',
                handle: 'bagues-or',
                path: ['Bijoux', 'Bagues', 'Or'],
                pathString: 'Bijoux > Bagues > Or',
                fullPath: 'bijoux/bagues/bagues-or',
                productCount: 89,
                depth: 2,
              },
            ].filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
            setCategorySuggestions(mockCategorySuggestionsData);

            // Mock brand suggestions
            const mockBrandSuggestionsData: MarqueSuggestion[] = [
              {
                id: 'brand_1',
                name: 'Cartier',
                slug: 'cartier',
                logo_url: null,
                country: 'France',
                product_count: 245,
              },
              {
                id: 'brand_2',
                name: 'Bulgari',
                slug: 'bulgari',
                logo_url: null,
                country: 'Italie',
                product_count: 189,
              },
              {
                id: 'brand_3',
                name: 'Chopard',
                slug: 'chopard',
                logo_url: null,
                country: 'Suisse',
                product_count: 156,
              },
            ].filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
            setBrandSuggestions(mockBrandSuggestionsData);
          } else {
            // Real API call to Medusa backend - fetch all in parallel
            console.log('[SearchContext] Using REAL API mode');
            const client = getMedusaSearchClient();
            console.log('[SearchContext] Calling getSuggestions, getCategorySuggestions, and getBrandSuggestions API...');

            const [productResult, categoryResult, brandResult] = await Promise.all([
              client.getSuggestions(query, 6),
              client.getCategorySuggestions(query, 5),
              client.getBrandSuggestions(query, 5),
            ]);

            console.log('[SearchContext] API results:', { productResult, categoryResult, brandResult });

            // Map API response to SearchSuggestion format
            const mappedSuggestions: SearchSuggestion[] = productResult.suggestions.map((s) => ({
              type: 'product' as SearchResultType,
              id: s.id,
              text: s.title,
              url: `/produit/${s.handle}`,
              image: s.thumbnail ?? undefined,
              price: s.price_min ?? undefined,
            }));

            setSuggestions(mappedSuggestions);
            setCategorySuggestions(categoryResult.categories || []);
            setBrandSuggestions(brandResult.marques || []);
          }
        } catch (err) {
          console.error('Suggestions error:', err);
          setSuggestions([]);
          setCategorySuggestions([]);
          setBrandSuggestions([]);
        } finally {
          setIsSuggestionsLoading(false);
        }
      }, 200);
    },
    [mockMode]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setCategorySuggestions([]);
    setBrandSuggestions([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Navigate to category and close search
  const navigateToCategory = useCallback((category: CategorySuggestion) => {
    // Close search overlay
    setIsSearchOpen(false);
    clearSuggestions();

    // Navigate to category page - use fullPath for hierarchical URL
    if (typeof window !== 'undefined') {
      const categoryPath = category.fullPath || category.handle;
      window.location.href = `/categorie/${categoryPath}`;
    }
  }, [clearSuggestions]);

  // Navigate to brand and close search
  const navigateToBrand = useCallback((brand: MarqueSuggestion) => {
    // Close search overlay
    setIsSearchOpen(false);
    clearSuggestions();

    // Navigate to brand page
    if (typeof window !== 'undefined') {
      window.location.href = `/marques/${brand.slug}`;
    }
  }, [clearSuggestions]);

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
      categorySuggestions,
      brandSuggestions,
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
      selectHierarchicalCategory,
      navigateToHierarchicalLevel,
      clearHierarchicalCategory,
      getSuggestions,
      clearSuggestions,
      navigateToCategory,
      navigateToBrand,
      addToHistory,
      clearHistory,
      quickSearch,
      activeFilterCount,
      hasActiveFilters,
    }),
    [
      state,
      suggestions,
      categorySuggestions,
      brandSuggestions,
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
      selectHierarchicalCategory,
      navigateToHierarchicalLevel,
      clearHierarchicalCategory,
      getSuggestions,
      clearSuggestions,
      navigateToCategory,
      navigateToBrand,
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
    selectHierarchicalCategory,
    navigateToHierarchicalLevel,
    clearHierarchicalCategory,
    activeFilterCount,
    hasActiveFilters,
  } = useSearch();

  return {
    filters: state.filters,
    facets: state.facets,
    categoryTree: state.categoryTree,
    hierarchicalCategoryFacets: state.hierarchicalCategoryFacets,
    toggleCategoryFilter,
    toggleBrandFilter,
    setPriceRange,
    setStockFilter,
    toggleAttributeFilter,
    setWarehouseFilter,
    clearFilters,
    removeFilter,
    selectHierarchicalCategory,
    navigateToHierarchicalLevel,
    clearHierarchicalCategory,
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
  const {
    suggestions,
    categorySuggestions,
    brandSuggestions,
    isSuggestionsLoading,
    getSuggestions,
    clearSuggestions,
    navigateToCategory,
    navigateToBrand,
    history,
    clearHistory,
  } = useSearch();

  return {
    suggestions,
    categorySuggestions,
    brandSuggestions,
    isLoading: isSuggestionsLoading,
    getSuggestions,
    clearSuggestions,
    navigateToCategory,
    navigateToBrand,
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
