/**
 * Search Types - Provider-Agnostic Search Abstraction Layer
 *
 * This module defines a comprehensive, provider-agnostic search interface
 * that supports multiple search engines (Meilisearch, Algolia, Elasticsearch, Typesense).
 *
 * @packageDocumentation
 */

// ============================================
// Search Index Types
// ============================================

/**
 * Supported search index names in the B2B e-commerce platform.
 * Each index represents a different searchable entity.
 */
export type SearchIndexName =
  | 'products'
  | 'categories'
  | 'brands'
  | 'orders'
  | 'customers';

/**
 * Configuration for a search index.
 * Used to define searchable attributes, facets, and sorting options.
 */
export interface SearchIndexConfig {
  /** Unique name of the index */
  readonly name: SearchIndexName;
  /** Primary key field for documents in this index */
  readonly primaryKey: string;
  /** Fields that are searchable with full-text search */
  readonly searchableAttributes: readonly string[];
  /** Fields that can be used for faceted filtering */
  readonly filterableAttributes: readonly string[];
  /** Fields that can be used for sorting */
  readonly sortableAttributes: readonly string[];
  /** Fields to display in search results */
  readonly displayedAttributes?: readonly string[];
  /** Fields to highlight in search results */
  readonly highlightableAttributes?: readonly string[];
  /** Custom ranking rules (provider-specific format may vary) */
  readonly rankingRules?: readonly string[];
  /** Synonyms configuration */
  readonly synonyms?: Readonly<Record<string, readonly string[]>>;
  /** Stop words to exclude from search */
  readonly stopWords?: readonly string[];
}

// ============================================
// Search Query Types
// ============================================

/**
 * Supported sort directions.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort option for search results.
 */
export interface SearchSortOption {
  /** Field to sort by */
  readonly field: string;
  /** Sort direction */
  readonly direction: SortDirection;
}

/**
 * Filter operator types for query filtering.
 */
export type FilterOperator =
  | 'eq'      // Equal
  | 'ne'      // Not equal
  | 'gt'      // Greater than
  | 'gte'     // Greater than or equal
  | 'lt'      // Less than
  | 'lte'     // Less than or equal
  | 'in'      // In array
  | 'nin'     // Not in array
  | 'exists'  // Field exists
  | 'range';  // Between min and max

/**
 * A single filter condition.
 */
export interface SearchFilter {
  /** Field to filter on */
  readonly field: string;
  /** Filter operator */
  readonly operator: FilterOperator;
  /** Value(s) to filter by */
  readonly value: string | number | boolean | readonly (string | number)[] | SearchRangeValue;
}

/**
 * Range value for range filters.
 */
export interface SearchRangeValue {
  /** Minimum value (inclusive) */
  readonly min?: number;
  /** Maximum value (inclusive) */
  readonly max?: number;
}

/**
 * Logical group of filters.
 */
export interface SearchFilterGroup {
  /** Logical operator for combining filters */
  readonly operator: 'AND' | 'OR';
  /** Filters in this group */
  readonly filters: readonly (SearchFilter | SearchFilterGroup)[];
}

/**
 * Pagination options for search queries.
 */
export interface SearchPagination {
  /** Page number (1-indexed) */
  readonly page: number;
  /** Number of results per page */
  readonly hitsPerPage: number;
}

/**
 * Options for highlighting search results.
 */
export interface SearchHighlightOptions {
  /** Fields to highlight (empty = all searchable) */
  readonly attributesToHighlight?: readonly string[];
  /** HTML tag to wrap highlighted terms (default: 'em') */
  readonly highlightPreTag?: string;
  /** Closing tag for highlighted terms (default: '</em>') */
  readonly highlightPostTag?: string;
  /** Maximum number of characters for snippets */
  readonly snippetLength?: number;
}

/**
 * Complete search query configuration.
 * Provider implementations translate this to engine-specific queries.
 */
export interface SearchQuery {
  /** Search query string (empty string for browse/filter-only) */
  readonly query: string;
  /** Index to search in */
  readonly indexName: SearchIndexName;
  /** Filters to apply */
  readonly filters?: SearchFilter | SearchFilterGroup;
  /** Fields to retrieve facet counts for */
  readonly facets?: readonly string[];
  /** Sort options */
  readonly sort?: readonly SearchSortOption[];
  /** Pagination options */
  readonly pagination?: SearchPagination;
  /** Highlight options */
  readonly highlight?: SearchHighlightOptions;
  /** Specific attributes to retrieve (optimization) */
  readonly attributesToRetrieve?: readonly string[];
  /** Whether to include total hit count (can be expensive) */
  readonly showTotalHits?: boolean;
  /** Optional query ID for analytics/debugging */
  readonly queryId?: string;
}

// ============================================
// Search Result Types
// ============================================

/**
 * Highlighted text snippet with original and formatted versions.
 */
export interface HighlightedField {
  /** Original field value */
  readonly value: string;
  /** Highlighted/formatted value with markup */
  readonly highlighted: string;
  /** Matched words/terms */
  readonly matchedWords?: readonly string[];
}

/**
 * A single search hit (result document).
 * Generic type T represents the document schema.
 */
export interface SearchHit<T extends Record<string, unknown> = Record<string, unknown>> {
  /** The document data */
  readonly document: T;
  /** Unique document identifier */
  readonly id: string;
  /** Relevance score (if available) */
  readonly score?: number;
  /** Highlighted fields (field name -> highlighted content) */
  readonly highlights?: Readonly<Record<string, HighlightedField>>;
  /** Ranking information for debugging */
  readonly rankingInfo?: SearchRankingInfo;
}

/**
 * Ranking/scoring information for debugging search relevance.
 */
export interface SearchRankingInfo {
  /** Number of exact word matches */
  readonly exactWordsCount?: number;
  /** Number of typos tolerated */
  readonly typosCount?: number;
  /** Proximity score */
  readonly proximityScore?: number;
  /** Attribute ranking */
  readonly attributeRanking?: readonly string[];
  /** Custom ranking data */
  readonly customRanking?: Readonly<Record<string, unknown>>;
}

/**
 * A single facet value with count.
 */
export interface FacetValue {
  /** The facet value */
  readonly value: string;
  /** Number of documents with this value */
  readonly count: number;
  /** Whether this value is currently selected/filtered */
  readonly isRefined?: boolean;
}

/**
 * Facet statistics for numeric facets.
 */
export interface FacetStats {
  /** Minimum value */
  readonly min: number;
  /** Maximum value */
  readonly max: number;
  /** Average value */
  readonly avg?: number;
  /** Sum of all values */
  readonly sum?: number;
}

/**
 * Complete facet result for a single field.
 */
export interface FacetResult {
  /** Field name */
  readonly field: string;
  /** Available values with counts */
  readonly values: readonly FacetValue[];
  /** Statistics for numeric facets */
  readonly stats?: FacetStats;
  /** Whether all values are shown (or truncated) */
  readonly exhaustive?: boolean;
}

/**
 * Pagination metadata for search results.
 */
export interface SearchResultPagination {
  /** Current page (1-indexed) */
  readonly page: number;
  /** Results per page */
  readonly hitsPerPage: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Total number of hits */
  readonly totalHits: number;
  /** Whether total is exact or estimated */
  readonly isExhaustive: boolean;
}

/**
 * Complete search response.
 * Generic type T represents the document schema.
 */
export interface SearchResult<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Search hits/results */
  readonly hits: readonly SearchHit<T>[];
  /** Facet results */
  readonly facets?: Readonly<Record<string, FacetResult>>;
  /** Pagination metadata */
  readonly pagination: SearchResultPagination;
  /** Query processing time in milliseconds */
  readonly processingTimeMs: number;
  /** Original query string */
  readonly query: string;
  /** Query ID for analytics */
  readonly queryId?: string;
  /** Index that was searched */
  readonly indexName: SearchIndexName;
}

// ============================================
// Autocomplete/Suggestion Types
// ============================================

/**
 * Types of autocomplete suggestions.
 */
export type SuggestionType =
  | 'query'      // Query completion
  | 'product'    // Product suggestion
  | 'category'   // Category suggestion
  | 'brand'      // Brand suggestion
  | 'recent'     // Recent search
  | 'popular';   // Popular search

/**
 * A single autocomplete suggestion.
 */
export interface SearchSuggestion {
  /** Suggestion type */
  readonly type: SuggestionType;
  /** Suggestion text/query */
  readonly text: string;
  /** Highlighted suggestion text */
  readonly highlighted?: string;
  /** Associated object (e.g., product, category) */
  readonly object?: Readonly<Record<string, unknown>>;
  /** Object ID if applicable */
  readonly objectId?: string;
  /** Relevance score */
  readonly score?: number;
  /** Number of results this suggestion would return */
  readonly resultCount?: number;
}

/**
 * Autocomplete query options.
 */
export interface AutocompleteQuery {
  /** Partial query string */
  readonly query: string;
  /** Maximum number of suggestions per type */
  readonly limit?: number;
  /** Types of suggestions to include */
  readonly suggestionTypes?: readonly SuggestionType[];
  /** Index to get suggestions from */
  readonly indexName?: SearchIndexName;
  /** Include result counts */
  readonly includeResultCounts?: boolean;
  /** User ID for personalization */
  readonly userId?: string;
}

/**
 * Autocomplete response.
 */
export interface AutocompleteResult {
  /** Suggestions grouped by type */
  readonly suggestions: Readonly<Record<SuggestionType, readonly SearchSuggestion[]>>;
  /** All suggestions in ranked order */
  readonly all: readonly SearchSuggestion[];
  /** Original query */
  readonly query: string;
  /** Processing time in milliseconds */
  readonly processingTimeMs: number;
}

// ============================================
// Multi-Index Search Types
// ============================================

/**
 * Query for multi-index search.
 */
export interface MultiSearchQuery {
  /** Individual queries for each index */
  readonly queries: readonly SearchQuery[];
  /** Strategy for combining results */
  readonly strategy?: 'independent' | 'federated';
}

/**
 * Result from multi-index search.
 */
export interface MultiSearchResult {
  /** Results keyed by index name */
  readonly results: Readonly<Record<SearchIndexName, SearchResult>>;
  /** Total processing time */
  readonly processingTimeMs: number;
}

// ============================================
// Search Analytics Types
// ============================================

/**
 * Search event for analytics tracking.
 */
export interface SearchAnalyticsEvent {
  /** Type of event */
  readonly eventType: 'search' | 'click' | 'conversion' | 'view';
  /** Query ID from search result */
  readonly queryId: string;
  /** Original search query */
  readonly query: string;
  /** Index searched */
  readonly indexName: SearchIndexName;
  /** Position of clicked/converted item (1-indexed) */
  readonly position?: number;
  /** ID of clicked/converted item */
  readonly objectId?: string;
  /** User ID for personalization */
  readonly userId?: string;
  /** Timestamp of event */
  readonly timestamp: string;
  /** Additional metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// ============================================
// Search Provider Configuration Types
// ============================================

/**
 * Base configuration for all search providers.
 */
export interface SearchProviderConfig {
  /** Provider type identifier */
  readonly provider: 'meilisearch' | 'algolia' | 'elasticsearch' | 'typesense';
  /** API host URL */
  readonly host: string;
  /** API key for authentication */
  readonly apiKey: string;
  /** Request timeout in milliseconds */
  readonly timeout?: number;
  /** Enable debug logging */
  readonly debug?: boolean;
}

/**
 * Meilisearch-specific configuration.
 */
export interface MeilisearchConfig extends SearchProviderConfig {
  readonly provider: 'meilisearch';
  /** Index prefix for multi-tenancy */
  readonly indexPrefix?: string;
}

/**
 * Algolia-specific configuration.
 */
export interface AlgoliaConfig extends SearchProviderConfig {
  readonly provider: 'algolia';
  /** Algolia Application ID */
  readonly appId: string;
  /** Search-only API key (for frontend) */
  readonly searchApiKey?: string;
}

/**
 * Elasticsearch-specific configuration.
 */
export interface ElasticsearchConfig extends SearchProviderConfig {
  readonly provider: 'elasticsearch';
  /** Cloud ID for Elastic Cloud */
  readonly cloudId?: string;
  /** Username for basic auth */
  readonly username?: string;
  /** Password for basic auth */
  readonly password?: string;
}

/**
 * Typesense-specific configuration.
 */
export interface TypesenseConfig extends SearchProviderConfig {
  readonly provider: 'typesense';
  /** Node configurations for cluster */
  readonly nodes?: readonly {
    readonly host: string;
    readonly port: number;
    readonly protocol: 'http' | 'https';
  }[];
}

/**
 * Union type of all provider configurations.
 */
export type AnySearchProviderConfig =
  | MeilisearchConfig
  | AlgoliaConfig
  | ElasticsearchConfig
  | TypesenseConfig;

// ============================================
// Search Error Types
// ============================================

/**
 * Error codes for search operations.
 */
export type SearchErrorCode =
  | 'CONNECTION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'INDEX_NOT_FOUND'
  | 'INVALID_QUERY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR'
  | 'DOCUMENT_NOT_FOUND'
  | 'INVALID_FILTER'
  | 'PROVIDER_ERROR';

/**
 * Structured search error.
 */
export interface SearchError {
  /** Error code */
  readonly code: SearchErrorCode;
  /** Human-readable message */
  readonly message: string;
  /** Original error from provider */
  readonly cause?: unknown;
  /** HTTP status code if applicable */
  readonly statusCode?: number;
  /** Index where error occurred */
  readonly indexName?: SearchIndexName;
  /** Query that caused the error */
  readonly query?: string;
}

// ============================================
// Product Search Specific Types
// ============================================

/**
 * Product document schema for search indexing.
 * This is the structure stored in the search index.
 */
export interface ProductSearchDocument {
  /** Product ID (primary key) */
  readonly id: string;
  /** Product reference/SKU */
  readonly reference: string;
  /** Product name */
  readonly name: string;
  /** Product name in English */
  readonly nameEn?: string;
  /** URL slug */
  readonly slug: string;
  /** Full description */
  readonly description: string;
  /** Short description for snippets */
  readonly shortDescription: string;
  /** Price (for filtering/sorting) */
  readonly price: number;
  /** Compare at price */
  readonly compareAtPrice?: number;
  /** Category ID */
  readonly categoryId: string;
  /** Category name (for faceting) */
  readonly categoryName: string;
  /** Category hierarchy path */
  readonly categoryPath?: readonly string[];
  /** Collection name (e.g., "Automne/Hiver") */
  readonly collection?: string;
  /** Style (e.g., "Classique") */
  readonly style?: string;
  /** Brand name */
  readonly brand?: string;
  /** Materials (for faceting) */
  readonly materials: readonly string[];
  /** Product images URLs */
  readonly images: readonly string[];
  /** Thumbnail image */
  readonly thumbnail?: string;
  /** Stock quantity */
  readonly stock: number;
  /** Availability status */
  readonly isAvailable: boolean;
  /** Featured product flag */
  readonly isFeatured: boolean;
  /** New product flag */
  readonly isNew: boolean;
  /** EAN/barcode */
  readonly ean?: string;
  /** Weight in grams */
  readonly weight?: number;
  /** Country of origin */
  readonly origin?: string;
  /** Warranty in months */
  readonly warranty?: number;
  /** Creation timestamp for sorting */
  readonly createdAt: number;
  /** Last update timestamp */
  readonly updatedAt: number;
  /** Search ranking score (custom) */
  readonly popularityScore?: number;
}

/**
 * Category document schema for search indexing.
 */
export interface CategorySearchDocument {
  /** Category ID */
  readonly id: string;
  /** Category code */
  readonly code: string;
  /** Category name */
  readonly name: string;
  /** URL slug */
  readonly slug: string;
  /** Description */
  readonly description: string;
  /** Category image */
  readonly image?: string;
  /** Parent category ID */
  readonly parentId?: string;
  /** Full path (for hierarchical faceting) */
  readonly path: readonly string[];
  /** Depth in hierarchy */
  readonly depth: number;
  /** Number of products */
  readonly productCount: number;
  /** Sort order */
  readonly sortOrder: number;
}

/**
 * Brand document schema for search indexing.
 */
export interface BrandSearchDocument {
  /** Brand ID */
  readonly id: string;
  /** Brand name */
  readonly name: string;
  /** URL slug */
  readonly slug: string;
  /** Brand description */
  readonly description?: string;
  /** Brand logo URL */
  readonly logo?: string;
  /** Number of products */
  readonly productCount: number;
  /** Featured brand flag */
  readonly isFeatured: boolean;
}
