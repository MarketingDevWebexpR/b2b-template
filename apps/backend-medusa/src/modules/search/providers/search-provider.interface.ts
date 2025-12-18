/**
 * Search Provider Interface
 *
 * Abstract interface for search engine implementations.
 * This allows swapping between Meilisearch, Algolia, Elasticsearch, etc.
 */

export interface SearchableDocument {
  id: string;
  [key: string]: unknown;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  filters?: string | string[];
  facets?: string[];
  sort?: string[];
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
  highlightPreTag?: string;
  highlightPostTag?: string;
}

export interface SearchHit<T = Record<string, unknown>> {
  id: string;
  document: T;
  score?: number;
  highlights?: Record<string, string>;
}

export interface FacetDistribution {
  [facetName: string]: {
    [value: string]: number;
  };
}

export interface SearchResult<T = Record<string, unknown>> {
  hits: SearchHit<T>[];
  totalHits: number;
  processingTimeMs: number;
  query: string;
  facetDistribution?: FacetDistribution;
  page?: number;
  hitsPerPage?: number;
}

export interface SuggestionResult {
  query: string;
  suggestions: Array<{
    text: string;
    highlighted?: string;
    score?: number;
  }>;
}

export interface IndexSettings {
  searchableAttributes?: string[];
  filterableAttributes?: string[];
  sortableAttributes?: string[];
  displayedAttributes?: string[];
  rankingRules?: string[];
  stopWords?: string[];
  synonyms?: Record<string, string[]>;
  distinctAttribute?: string;
  typoTolerance?: {
    enabled?: boolean;
    minWordSizeForTypos?: {
      oneTypo?: number;
      twoTypos?: number;
    };
    disableOnWords?: string[];
    disableOnAttributes?: string[];
  };
  pagination?: {
    maxTotalHits?: number;
  };
  faceting?: {
    maxValuesPerFacet?: number;
  };
}

export interface IndexStats {
  numberOfDocuments: number;
  isIndexing: boolean;
  fieldDistribution?: Record<string, number>;
}

/**
 * Search Provider Interface
 *
 * All search engine implementations must implement this interface.
 */
export interface SearchProvider {
  /**
   * Provider identifier
   */
  readonly name: string;

  /**
   * Initialize the provider connection
   */
  initialize(): Promise<void>;

  /**
   * Check if the provider is healthy
   */
  isHealthy(): Promise<boolean>;

  /**
   * Create or update an index
   */
  createIndex(indexName: string, primaryKey?: string): Promise<void>;

  /**
   * Delete an index
   */
  deleteIndex(indexName: string): Promise<void>;

  /**
   * Get index settings
   */
  getIndexSettings(indexName: string): Promise<IndexSettings>;

  /**
   * Update index settings
   */
  updateIndexSettings(indexName: string, settings: IndexSettings): Promise<void>;

  /**
   * Get index stats
   */
  getIndexStats(indexName: string): Promise<IndexStats>;

  /**
   * Index a single document
   */
  indexDocument(indexName: string, document: SearchableDocument): Promise<void>;

  /**
   * Index multiple documents
   */
  indexDocuments(indexName: string, documents: SearchableDocument[]): Promise<void>;

  /**
   * Update a single document
   */
  updateDocument(indexName: string, document: Partial<SearchableDocument> & { id: string }): Promise<void>;

  /**
   * Update multiple documents
   */
  updateDocuments(indexName: string, documents: Array<Partial<SearchableDocument> & { id: string }>): Promise<void>;

  /**
   * Delete a document by ID
   */
  deleteDocument(indexName: string, documentId: string): Promise<void>;

  /**
   * Delete multiple documents by IDs
   */
  deleteDocuments(indexName: string, documentIds: string[]): Promise<void>;

  /**
   * Delete all documents in an index
   */
  deleteAllDocuments(indexName: string): Promise<void>;

  /**
   * Search an index
   */
  search<T = Record<string, unknown>>(
    indexName: string,
    query: string,
    options?: SearchOptions
  ): Promise<SearchResult<T>>;

  /**
   * Multi-index search
   */
  multiSearch<T = Record<string, unknown>>(
    searches: Array<{
      indexName: string;
      query: string;
      options?: SearchOptions;
    }>
  ): Promise<Array<SearchResult<T>>>;

  /**
   * Get suggestions/autocomplete
   */
  getSuggestions(
    indexName: string,
    query: string,
    limit?: number
  ): Promise<SuggestionResult>;

  /**
   * Wait for pending tasks to complete
   */
  waitForTasks(taskIds: number[]): Promise<void>;
}

export default SearchProvider;
