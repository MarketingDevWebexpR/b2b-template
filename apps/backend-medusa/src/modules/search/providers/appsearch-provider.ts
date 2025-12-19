/**
 * Elastic App Search Provider Implementation
 *
 * Implements the SearchProvider interface for Elastic App Search.
 * Optimized for 500K+ products with advanced relevance tuning.
 *
 * App Search API Documentation:
 * https://www.elastic.co/guide/en/app-search/current/api-reference.html
 */

import type {
  SearchProvider,
  SearchableDocument,
  SearchOptions,
  SearchResult,
  SearchHit,
  SuggestionResult,
  IndexSettings,
  IndexStats,
} from './search-provider.interface';
import {
  getAppSearchEngineConfig,
  convertFilterToAppSearch,
  convertSortToAppSearch,
  JEWELRY_SYNONYMS,
  type AppSearchConfig,
} from '../utils/appsearch-config';

// ==========================================================================
// CUSTOM ERROR CLASSES
// ==========================================================================

export type AppSearchErrorCode =
  | 'CONNECTION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'INDEXING_ERROR'
  | 'SEARCH_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Base error class for App Search operations
 */
export class AppSearchError extends Error {
  override readonly name: string = 'AppSearchError';

  constructor(
    message: string,
    public readonly code: AppSearchErrorCode,
    public readonly cause?: Error
  ) {
    super(message);
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Error thrown when batch indexing partially fails
 */
export class BatchIndexingError extends AppSearchError {
  override readonly name: string = 'BatchIndexingError';

  constructor(
    message: string,
    public readonly successCount: number,
    public readonly failureCount: number,
    public readonly failedDocumentIds: readonly string[],
    cause?: Error
  ) {
    super(message, 'INDEXING_ERROR', cause);
  }
}

// ==========================================================================
// LOGGER INTERFACE
// ==========================================================================

/**
 * Logger interface for AppSearch provider
 */
export interface AppSearchLogger {
  readonly info: (message: string, context?: Record<string, unknown>) => void;
  readonly warn: (message: string, context?: Record<string, unknown>) => void;
  readonly error: (message: string, error?: Error, context?: Record<string, unknown>) => void;
  readonly debug: (message: string, context?: Record<string, unknown>) => void;
}

/**
 * App Search API response types
 */
interface AppSearchDocument {
  id: { raw: string };
  [key: string]: { raw?: unknown; snippet?: string } | string;
}

interface AppSearchSearchResult {
  meta: {
    alerts: unknown[];
    warnings: unknown[];
    precision: number;
    page: {
      current: number;
      total_pages: number;
      total_results: number;
      size: number;
    };
    request_id: string;
  };
  results: AppSearchDocument[];
  facets?: Record<string, Array<{ type: string; data: Array<{ value: string; count: number }> }>>;
}

interface AppSearchIndexResult {
  id: string;
  errors: string[];
}

interface AppSearchEngineInfo {
  name: string;
  type: string;
  language: string | null;
  document_count: number;
}

/**
 * Elastic App Search Provider
 *
 * Features:
 * - Batch indexing with 100-document chunks (App Search limit)
 * - Concurrent batch processing for high throughput (500K+ documents)
 * - Automatic retry with exponential backoff and rate limit handling
 * - Filter and sort syntax translation
 * - Relevance tuning via search field weights
 * - Synonym support for jewelry industry terms
 * - Memory-efficient streaming for large operations
 */
export class AppSearchProvider implements SearchProvider {
  readonly name = 'appsearch';

  private readonly endpoint: string;
  private readonly privateApiKey: string;
  private readonly publicSearchKey?: string;
  private readonly engineName: string;
  private readonly requestTimeout: number;
  private readonly logger?: AppSearchLogger;

  /** Maximum documents per batch (App Search limit) */
  private readonly BATCH_SIZE = 100;

  /** Maximum concurrent batch requests for indexing */
  private readonly MAX_CONCURRENT_BATCHES = 5;

  /** Maximum retries for failed requests */
  private readonly MAX_RETRIES = 3;

  /** Base delay for exponential backoff (ms) */
  private readonly RETRY_DELAY = 1000;

  /** HTTP status codes that should trigger retry */
  private readonly RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

  constructor(config: AppSearchConfig, logger?: AppSearchLogger) {
    if (!config.endpoint) {
      throw new AppSearchError('App Search endpoint is required', 'VALIDATION_ERROR');
    }
    if (!config.privateApiKey) {
      throw new AppSearchError('App Search private API key is required', 'VALIDATION_ERROR');
    }
    if (!config.engineName) {
      throw new AppSearchError('App Search engine name is required', 'VALIDATION_ERROR');
    }

    this.endpoint = config.endpoint.replace(/\/$/, ''); // Remove trailing slash
    this.privateApiKey = config.privateApiKey;
    this.publicSearchKey = config.publicSearchKey;
    this.engineName = config.engineName;
    this.requestTimeout = config.requestTimeout ?? 30000;
    this.logger = logger;
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Make an authenticated API request to App Search
   *
   * @param method - HTTP method
   * @param path - API path (without /api/as/v1/ prefix)
   * @param body - Request body
   * @param usePublicKey - Whether to use public search key instead of private key
   * @returns Parsed response body
   * @throws {AppSearchError} On API errors, timeouts, or network failures
   */
  private async apiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    usePublicKey = false
  ): Promise<{ data: T; status: number }> {
    const url = `${this.endpoint}/api/as/v1/${path}`;
    const apiKey = usePublicKey && this.publicSearchKey ? this.publicSearchKey : this.privateApiKey;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unable to read error body');
        const errorCode = this.mapHttpStatusToErrorCode(response.status);

        throw new AppSearchError(
          `App Search API error ${response.status}: ${errorBody}`,
          errorCode
        );
      }

      // Parse JSON response with proper type assertion
      const data = (await response.json()) as T;
      return { data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw AppSearchError as-is
      if (error instanceof AppSearchError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new AppSearchError(
            `App Search request timeout after ${this.requestTimeout}ms`,
            'TIMEOUT_ERROR',
            error
          );
        }
        throw new AppSearchError(
          `App Search request failed: ${error.message}`,
          'CONNECTION_ERROR',
          error
        );
      }

      throw new AppSearchError(
        'App Search request failed with unknown error',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Map HTTP status codes to error codes
   */
  private mapHttpStatusToErrorCode(status: number): AppSearchErrorCode {
    switch (status) {
      case 401:
      case 403:
        return 'AUTHENTICATION_ERROR';
      case 404:
        return 'NOT_FOUND_ERROR';
      case 400:
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'RATE_LIMIT_ERROR';
      case 408:
        return 'TIMEOUT_ERROR';
      default:
        return status >= 500 ? 'CONNECTION_ERROR' : 'UNKNOWN_ERROR';
    }
  }

  /**
   * Make a request with retry logic and exponential backoff
   *
   * Handles rate limiting (429) with appropriate delays and retries
   * server errors (5xx) with exponential backoff.
   *
   * @param method - HTTP method
   * @param path - API path
   * @param body - Request body
   * @param usePublicKey - Whether to use public search key
   * @param retries - Maximum number of retry attempts
   * @returns Parsed response data
   * @throws {AppSearchError} After all retries exhausted or on non-retryable errors
   */
  private async apiRequestWithRetry<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    usePublicKey = false,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: AppSearchError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.apiRequest<T>(method, path, body, usePublicKey);
        return response.data;
      } catch (error) {
        // Ensure error is AppSearchError
        lastError = error instanceof AppSearchError
          ? error
          : new AppSearchError(
              error instanceof Error ? error.message : String(error),
              'UNKNOWN_ERROR',
              error instanceof Error ? error : undefined
            );

        // Determine if error is retryable
        const isRetryable = this.isRetryableError(lastError);

        if (!isRetryable) {
          throw lastError;
        }

        if (attempt < retries) {
          // Calculate delay with exponential backoff
          // For rate limits, use longer base delay
          const baseDelay = lastError.code === 'RATE_LIMIT_ERROR'
            ? this.RETRY_DELAY * 2
            : this.RETRY_DELAY;
          const delay = baseDelay * Math.pow(2, attempt);
          const jitter = Math.random() * 100; // Add jitter to avoid thundering herd

          this.logger?.warn(
            `App Search request failed, retrying in ${delay}ms`,
            {
              attempt: attempt + 1,
              maxRetries: retries,
              errorCode: lastError.code,
              path,
            }
          );

          await this.delay(delay + jitter);
        }
      }
    }

    throw lastError ?? new AppSearchError(
      'App Search request failed after retries',
      'UNKNOWN_ERROR'
    );
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: AppSearchError): boolean {
    // Retry on rate limits, timeouts, and server errors
    const retryableCodes: AppSearchErrorCode[] = [
      'RATE_LIMIT_ERROR',
      'TIMEOUT_ERROR',
      'CONNECTION_ERROR',
    ];
    return retryableCodes.includes(error.code);
  }

  /**
   * Promisified delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the engine name for a given index
   * All entity types use the same engine - distinguished by doc_type field
   */
  private getEngineName(_indexName: string): string {
    return this.engineName;
  }

  /**
   * Prepare a document for App Search indexing
   * App Search requires specific format and handles nested objects differently
   */
  private prepareDocumentForIndexing(document: SearchableDocument): Record<string, unknown> {
    const prepared: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(document)) {
      if (value === undefined) continue;

      // App Search doesn't support deeply nested objects
      // Flatten or convert to strings as needed
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Convert objects to JSON string for storage
        // Exception: keep simple arrays as-is
        prepared[key] = JSON.stringify(value);
      } else if (Array.isArray(value)) {
        // Check if array contains objects
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          // Convert array of objects to JSON string
          prepared[key] = JSON.stringify(value);
        } else {
          // Keep simple arrays (strings, numbers)
          prepared[key] = value;
        }
      } else {
        prepared[key] = value;
      }
    }

    return prepared;
  }

  /**
   * Parse an App Search document back to original format
   */
  private parseDocumentFromAppSearch<T>(doc: AppSearchDocument): T {
    const parsed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(doc)) {
      if (key === '_meta') continue;

      // App Search returns { raw: value } format
      const rawValue = typeof value === 'object' && value !== null && 'raw' in value
        ? value.raw
        : value;

      // Try to parse JSON strings back to objects
      if (typeof rawValue === 'string' && (rawValue.startsWith('{') || rawValue.startsWith('['))) {
        try {
          parsed[key] = JSON.parse(rawValue);
        } catch {
          parsed[key] = rawValue;
        }
      } else {
        parsed[key] = rawValue;
      }
    }

    return parsed as T;
  }

  // ==========================================================================
  // SEARCH PROVIDER INTERFACE IMPLEMENTATION
  // ==========================================================================

  /**
   * Initialize the App Search provider
   *
   * Verifies connection to the engine and sets up synonyms.
   */
  async initialize(): Promise<void> {
    // Verify connection by checking engine exists
    try {
      await this.apiRequestWithRetry<AppSearchEngineInfo>('GET', `engines/${this.engineName}`);
      this.logger?.info(
        `App Search provider initialized, connected to engine: ${this.engineName}`,
        { engine: this.engineName }
      );

      // Initialize synonyms
      await this.initializeSynonyms();
    } catch (error) {
      // Engine might not exist yet, that's OK - will be created on first index
      const appSearchError = error instanceof AppSearchError ? error : undefined;
      this.logger?.warn(
        `App Search engine '${this.engineName}' not found, will be created on first index`,
        { engine: this.engineName, errorCode: appSearchError?.code }
      );
    }
  }

  /**
   * Initialize synonyms for the engine
   *
   * Configures jewelry industry-specific synonyms for improved search relevance.
   */
  private async initializeSynonyms(): Promise<void> {
    try {
      // App Search synonyms format: POST /engines/{engine}/synonyms with synonym sets
      for (const synonymSet of JEWELRY_SYNONYMS) {
        await this.apiRequestWithRetry('POST', `engines/${this.engineName}/synonyms`, {
          synonyms: synonymSet,
        });
      }
      this.logger?.info(
        `Initialized ${JEWELRY_SYNONYMS.length} synonym sets`,
        { count: JEWELRY_SYNONYMS.length }
      );
    } catch (error) {
      // Synonyms might already exist, that's OK
      this.logger?.debug('Synonyms initialization skipped (may already exist)');
    }
  }

  /**
   * Check if the App Search connection is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.apiRequestWithRetry<AppSearchEngineInfo>('GET', `engines/${this.engineName}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create an App Search engine for the given index
   *
   * @param indexName - Logical index name
   * @param _primaryKey - Ignored (App Search uses 'id' as primary key)
   */
  async createIndex(indexName: string, _primaryKey?: string): Promise<void> {
    const engineName = this.getEngineName(indexName);

    try {
      // Check if engine exists
      await this.apiRequestWithRetry<AppSearchEngineInfo>('GET', `engines/${engineName}`);
      this.logger?.debug(`Engine '${engineName}' already exists`);
    } catch (error) {
      const appSearchError = error instanceof AppSearchError ? error : undefined;

      // Only create if it's a not found error
      if (appSearchError?.code !== 'NOT_FOUND_ERROR') {
        throw error;
      }

      // Create engine if it doesn't exist
      await this.apiRequestWithRetry('POST', 'engines', {
        name: engineName,
        type: 'default', // or 'meta' for meta-engines
        language: 'fr', // French as primary language
      });
      this.logger?.info(`Created App Search engine: ${engineName}`, { engine: engineName });
    }
  }

  /**
   * Delete an App Search engine
   *
   * @param indexName - Logical index name to delete
   */
  async deleteIndex(indexName: string): Promise<void> {
    const engineName = this.getEngineName(indexName);

    try {
      await this.apiRequestWithRetry('DELETE', `engines/${engineName}`);
      this.logger?.info(`Deleted App Search engine: ${engineName}`, { engine: engineName });
    } catch (error) {
      const appSearchError = error instanceof AppSearchError ? error : undefined;

      // It's OK if engine doesn't exist
      if (appSearchError?.code === 'NOT_FOUND_ERROR') {
        this.logger?.debug(`Engine '${engineName}' not found for deletion`);
        return;
      }

      throw error;
    }
  }

  /**
   * Get index settings (derived from configuration)
   */
  async getIndexSettings(indexName: string): Promise<IndexSettings> {
    // App Search doesn't have direct settings API
    // Return the configured settings from our config
    const config = getAppSearchEngineConfig(indexName, this.engineName);

    return {
      searchableAttributes: Object.keys(config.searchFields),
      // All fields are filterable by default in App Search
      filterableAttributes: Object.keys(config.resultFields),
      sortableAttributes: Object.keys(config.resultFields),
    };
  }

  /**
   * Update index settings (search weights, result fields)
   */
  async updateIndexSettings(indexName: string, _settings: IndexSettings): Promise<void> {
    // App Search manages settings differently (via search_fields, result_fields APIs)
    // Settings are applied at query time, not index time
    this.logger?.debug(`App Search settings are applied at query time for index: ${indexName}`);

    // Configure search fields weights if available
    const engineName = this.getEngineName(indexName);
    const config = getAppSearchEngineConfig(indexName, this.engineName);

    try {
      // Update search settings (weights)
      await this.apiRequestWithRetry('PUT', `engines/${engineName}/search_settings`, {
        search_fields: config.searchFields,
        result_fields: config.resultFields,
        boosts: config.boosts ?? {},
      });
      this.logger?.info(`Updated search settings for engine: ${engineName}`, { engine: engineName });
    } catch (error) {
      // Might fail if no documents indexed yet
      this.logger?.debug(`Could not update search settings for '${engineName}' (may need documents first)`);
    }
  }

  /**
   * Get statistics for an index
   */
  async getIndexStats(indexName: string): Promise<IndexStats> {
    const engineName = this.getEngineName(indexName);

    try {
      const info = await this.apiRequestWithRetry<AppSearchEngineInfo>('GET', `engines/${engineName}`);
      return {
        numberOfDocuments: info.document_count,
        isIndexing: false, // App Search doesn't expose this directly
      };
    } catch {
      return {
        numberOfDocuments: 0,
        isIndexing: false,
      };
    }
  }

  async indexDocument(indexName: string, document: SearchableDocument): Promise<void> {
    await this.indexDocuments(indexName, [document]);
  }

  /**
   * Index multiple documents with concurrent batch processing
   *
   * Optimized for large datasets (500K+ documents):
   * - Processes batches concurrently (up to MAX_CONCURRENT_BATCHES)
   * - Memory-efficient: prepares documents lazily per batch
   * - Detailed error tracking with failed document IDs
   * - Progress logging for monitoring
   *
   * @param indexName - Target index name
   * @param documents - Documents to index
   * @throws {BatchIndexingError} If any documents fail to index (includes partial success info)
   */
  async indexDocuments(indexName: string, documents: SearchableDocument[]): Promise<void> {
    if (documents.length === 0) return;

    const engineName = this.getEngineName(indexName);
    const totalBatches = Math.ceil(documents.length / this.BATCH_SIZE);

    // Track results across all batches
    let indexedCount = 0;
    let errorCount = 0;
    const failedDocumentIds: string[] = [];

    // Process batches with controlled concurrency
    const batchPromises: Array<Promise<void>> = [];
    let activeBatches = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      // Wait if we've hit max concurrent batches
      while (activeBatches >= this.MAX_CONCURRENT_BATCHES) {
        await Promise.race(batchPromises.filter(p => p !== undefined));
      }

      const startIdx = batchIndex * this.BATCH_SIZE;
      const endIdx = Math.min(startIdx + this.BATCH_SIZE, documents.length);
      const batchNumber = batchIndex + 1;

      // Prepare documents lazily for this batch only (memory efficient)
      // Add doc_type field to distinguish entity types in single engine
      const batch = documents
        .slice(startIdx, endIdx)
        .map(doc => ({
          ...this.prepareDocumentForIndexing(doc),
          doc_type: indexName, // 'products', 'categories', 'marques', 'collections'
        }));

      activeBatches++;

      const batchPromise = this.processBatch(
        engineName,
        batch,
        batchNumber,
        totalBatches
      )
        .then(result => {
          indexedCount += result.successCount;
          errorCount += result.errorCount;
          failedDocumentIds.push(...result.failedIds);

          // Progress logging for large datasets (every 10%)
          if (totalBatches >= 10 && batchNumber % Math.ceil(totalBatches / 10) === 0) {
            const progress = Math.round((batchNumber / totalBatches) * 100);
            this.logger?.info(
              `[App Search] Indexing progress: ${progress}%`,
              {
                indexed: indexedCount,
                errors: errorCount,
                batch: batchNumber,
                total: totalBatches,
              }
            );
          }
        })
        .finally(() => {
          activeBatches--;
        });

      batchPromises.push(batchPromise);
    }

    // Wait for all batches to complete
    await Promise.all(batchPromises);

    // Log final results
    this.logger?.info(
      `[App Search] Indexing complete`,
      {
        indexed: indexedCount,
        errors: errorCount,
        totalDocuments: documents.length,
      }
    );

    // Throw if there were any failures (with detailed info)
    if (errorCount > 0) {
      throw new BatchIndexingError(
        `Failed to index ${errorCount} out of ${documents.length} documents`,
        indexedCount,
        errorCount,
        failedDocumentIds.slice(0, 100) // Limit to first 100 failed IDs
      );
    }
  }

  /**
   * Process a single batch of documents
   */
  private async processBatch(
    engineName: string,
    batch: Record<string, unknown>[],
    batchNumber: number,
    totalBatches: number
  ): Promise<{ successCount: number; errorCount: number; failedIds: string[] }> {
    const failedIds: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      const results = await this.apiRequestWithRetry<AppSearchIndexResult[]>(
        'POST',
        `engines/${engineName}/documents`,
        batch
      );

      // Check for per-document errors
      for (const result of results) {
        if (result.errors && result.errors.length > 0) {
          this.logger?.error(
            `Error indexing document ${result.id}`,
            new Error(result.errors.join(', ')),
            { documentId: result.id }
          );
          failedIds.push(result.id);
          errorCount++;
        } else {
          successCount++;
        }
      }
    } catch (error) {
      const appSearchError = error instanceof AppSearchError ? error : undefined;
      this.logger?.error(
        `Failed to index batch ${batchNumber}/${totalBatches}`,
        appSearchError,
        { batchNumber, totalBatches }
      );

      // All documents in batch failed
      errorCount = batch.length;
      for (const doc of batch) {
        const id = doc.id;
        if (typeof id === 'string') {
          failedIds.push(id);
        }
      }
    }

    return { successCount, errorCount, failedIds };
  }

  /**
   * Update a single document (partial update)
   */
  async updateDocument(
    indexName: string,
    document: Partial<SearchableDocument> & { id: string }
  ): Promise<void> {
    await this.updateDocuments(indexName, [document]);
  }

  /**
   * Update multiple documents (partial updates)
   *
   * @param indexName - Target index name
   * @param documents - Documents with partial fields to update (must include id)
   */
  async updateDocuments(
    indexName: string,
    documents: Array<Partial<SearchableDocument> & { id: string }>
  ): Promise<void> {
    if (documents.length === 0) return;

    const engineName = this.getEngineName(indexName);

    // Prepare documents for update - only include fields that are present
    const prepared = documents.map(doc => {
      const result: Record<string, unknown> = { id: doc.id };

      for (const [key, value] of Object.entries(doc)) {
        if (key === 'id' || value === undefined) continue;

        // Apply same transformation as prepareDocumentForIndexing
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          result[key] = JSON.stringify(value);
        } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          result[key] = JSON.stringify(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    });

    // App Search uses PATCH for partial updates
    await this.apiRequestWithRetry<AppSearchIndexResult[]>(
      'PATCH',
      `engines/${engineName}/documents`,
      prepared
    );

    this.logger?.debug(`Updated ${documents.length} documents in ${engineName}`);
  }

  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    await this.deleteDocuments(indexName, [documentId]);
  }

  async deleteDocuments(indexName: string, documentIds: string[]): Promise<void> {
    if (documentIds.length === 0) return;

    const engineName = this.getEngineName(indexName);

    // App Search DELETE expects array of IDs
    await this.apiRequestWithRetry<{ deleted: boolean; id: string }[]>(
      'DELETE',
      `engines/${engineName}/documents`,
      documentIds
    );

    this.logger?.debug(`Deleted ${documentIds.length} documents from ${engineName}`);
  }

  /**
   * Delete all documents from an index (filtered by doc_type)
   *
   * Uses search with doc_type filter to find documents, then deletes in batches.
   * This is necessary because App Search uses a single engine with doc_type discrimination.
   *
   * @param indexName - Target index name (used as doc_type filter)
   */
  async deleteAllDocuments(indexName: string): Promise<void> {
    const engineName = this.getEngineName(indexName);

    // Use search with doc_type filter to find documents to delete
    // This ensures we only delete documents for this specific index type
    let hasMore = true;
    let totalDeleted = 0;
    const batchSize = 100; // App Search max batch size

    this.logger?.info(
      `[App Search] Starting bulk delete for doc_type: ${indexName}`,
      { engine: engineName, docType: indexName }
    );

    while (hasMore) {
      try {
        // Search for documents with this doc_type
        const response = await this.apiRequest<AppSearchSearchResult>(
          'POST',
          `engines/${engineName}/search`,
          {
            query: '',
            filters: { doc_type: indexName },
            page: { current: 1, size: batchSize },
            result_fields: { id: { raw: {} } },
          }
        );

        // Extract IDs from search results (search returns { id: { raw: "..." } } format)
        const ids = response.data.results
          .map(doc => {
            // Handle both formats: { id: { raw: "..." } } from search and { id: "..." } from list
            const idValue = doc.id;
            if (typeof idValue === 'object' && idValue !== null && 'raw' in idValue) {
              return idValue.raw as string;
            }
            return idValue as unknown as string;
          })
          .filter((id): id is string => typeof id === 'string' && id.length > 0);

        if (ids.length === 0) {
          hasMore = false;
          break;
        }

        // Delete this batch
        await this.deleteDocuments(indexName, ids);
        totalDeleted += ids.length;

        // Check if there are more documents
        const remainingDocs = response.data.meta.page.total_results - ids.length;
        hasMore = remainingDocs > 0;

        // Progress logging for large deletions
        if (totalDeleted % 1000 === 0) {
          this.logger?.info(
            `[App Search] Bulk delete progress`,
            { deleted: totalDeleted, docType: indexName }
          );
        }
      } catch (error) {
        const appSearchError = error instanceof AppSearchError ? error : undefined;

        // If it's a 404, the engine is empty or doesn't exist
        if (appSearchError?.code === 'NOT_FOUND_ERROR') {
          hasMore = false;
          break;
        }

        this.logger?.error(
          `[App Search] Error during bulk delete`,
          appSearchError,
          { docType: indexName, engine: engineName }
        );
        throw error; // Re-throw to stop the sync and report the error
      }
    }

    this.logger?.info(
      `[App Search] Bulk delete complete`,
      { totalDeleted, docType: indexName }
    );
  }

  async search<T = Record<string, unknown>>(
    indexName: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const engineName = this.getEngineName(indexName);
    const config = getAppSearchEngineConfig(indexName, this.engineName);

    // Build App Search query
    const searchRequest: Record<string, unknown> = {
      query: query || '',
      page: {
        current: Math.floor((options.offset || 0) / (options.limit || 20)) + 1,
        size: options.limit || 20,
      },
      search_fields: config.searchFields,
      result_fields: options.attributesToRetrieve
        ? options.attributesToRetrieve.reduce((acc, field) => ({ ...acc, [field]: { raw: {} } }), {})
        : config.resultFields,
    };

    // Add filters - always include doc_type filter for single-engine architecture
    const userFilters = convertFilterToAppSearch(options.filters);
    const docTypeFilter = { doc_type: indexName };

    // Combine doc_type filter with user filters
    if (userFilters) {
      // If user filters exist, combine with doc_type filter using "all" (AND)
      const existingAll = 'all' in userFilters ? (userFilters as { all: unknown[] }).all : [userFilters];
      searchRequest.filters = { all: [docTypeFilter, ...existingAll] };
    } else {
      searchRequest.filters = docTypeFilter;
    }

    // Add sorting
    const sort = convertSortToAppSearch(options.sort);
    if (sort) {
      searchRequest.sort = sort;
    }

    // Add facets
    if (options.facets && options.facets.length > 0) {
      searchRequest.facets = options.facets.reduce((acc, facet) => {
        const facetConfig = config.facets[facet];
        return {
          ...acc,
          [facet]: facetConfig || { type: 'value', size: 50 },
        };
      }, {});
    }

    // Add boosts if available
    if (config.boosts) {
      searchRequest.boosts = config.boosts;
    }

    const startTime = Date.now();
    const response = await this.apiRequestWithRetry<AppSearchSearchResult>(
      'POST',
      `engines/${engineName}/search`,
      searchRequest,
      true // Use public search key if available
    );
    const processingTimeMs = Date.now() - startTime;

    // Transform results
    const hits: SearchHit<T>[] = response.results.map(doc => {
      const document = this.parseDocumentFromAppSearch<T>(doc);
      const highlights: Record<string, string> = {};

      // Extract snippets as highlights
      for (const [key, value] of Object.entries(doc)) {
        if (typeof value === 'object' && value !== null && 'snippet' in value && value.snippet) {
          highlights[key] = value.snippet as string;
        }
      }

      return {
        id: doc.id.raw,
        document,
        highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
      };
    });

    // Transform facets
    const facetDistribution: Record<string, Record<string, number>> = {};
    if (response.facets) {
      for (const [facetName, facetData] of Object.entries(response.facets)) {
        facetDistribution[facetName] = {};
        for (const item of facetData[0]?.data || []) {
          facetDistribution[facetName][item.value] = item.count;
        }
      }
    }

    return {
      hits,
      totalHits: response.meta.page.total_results,
      processingTimeMs,
      query,
      facetDistribution: Object.keys(facetDistribution).length > 0 ? facetDistribution : undefined,
      page: response.meta.page.current,
      hitsPerPage: response.meta.page.size,
    };
  }

  async multiSearch<T = Record<string, unknown>>(
    searches: Array<{
      indexName: string;
      query: string;
      options?: SearchOptions;
    }>
  ): Promise<Array<SearchResult<T>>> {
    // App Search doesn't have native multi-search
    // Execute searches in parallel
    const results = await Promise.all(
      searches.map(({ indexName, query, options }) =>
        this.search<T>(indexName, query, options)
      )
    );

    return results;
  }

  /**
   * Get search suggestions for autocomplete
   *
   * @param indexName - Target index name
   * @param query - Partial query string
   * @param limit - Maximum number of suggestions
   * @returns Suggestion results with highlighted matches
   */
  async getSuggestions(
    indexName: string,
    query: string,
    limit = 5
  ): Promise<SuggestionResult> {
    const engineName = this.getEngineName(indexName);

    try {
      // App Search Query Suggestions API
      const response = await this.apiRequestWithRetry<{ results: { suggestion: string }[] }>(
        'POST',
        `engines/${engineName}/query_suggestion`,
        {
          query,
          size: limit,
          types: {
            documents: {
              fields: ['title', 'name'],
            },
          },
        },
        true // Use public key
      );

      return {
        query,
        suggestions: response.results.map(r => ({
          text: r.suggestion,
          highlighted: this.highlightMatch(r.suggestion, query),
        })),
      };
    } catch (error) {
      // Log the error for debugging
      if (error instanceof AppSearchError) {
        this.logger?.debug(
          'Query suggestion API not available, falling back to search',
          { errorCode: error.code }
        );
      }

      // Fallback to regular search if query_suggestion not available
      const searchResult = await this.search(indexName, query, {
        limit,
        attributesToRetrieve: ['id', 'title', 'name'],
      });

      return {
        query,
        suggestions: searchResult.hits.map(hit => {
          const doc = hit.document as Record<string, unknown>;
          const title = (doc.title ?? doc.name ?? '') as string;
          const text = String(title);
          return {
            text,
            highlighted: this.highlightMatch(text, query),
          };
        }),
      };
    }
  }

  /**
   * Safely highlight query matches in text
   *
   * Escapes special regex characters to prevent ReDoS attacks.
   *
   * @param text - Text to highlight
   * @param query - Query to find and highlight
   * @returns Text with highlighted matches
   */
  private highlightMatch(text: string, query: string): string {
    if (!query || !text) return text;

    // Escape special regex characters to prevent ReDoS
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    try {
      return text.replace(
        new RegExp(`(${escapedQuery})`, 'gi'),
        '<strong>$1</strong>'
      );
    } catch {
      // If regex still fails, return unhighlighted text
      return text;
    }
  }

  async waitForTasks(_taskIds: number[]): Promise<void> {
    // App Search indexes synchronously, no need to wait for tasks
    // This method exists for interface compatibility
    return Promise.resolve();
  }
}

export default AppSearchProvider;
