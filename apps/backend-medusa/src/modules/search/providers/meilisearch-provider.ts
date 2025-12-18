/**
 * Meilisearch Provider Implementation
 *
 * Implements the SearchProvider interface for Meilisearch.
 */

import { MeiliSearch, Index, SearchResponse, MultiSearchResponse } from 'meilisearch';
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

export interface MeilisearchConfig {
  host: string;
  apiKey: string;
  indexPrefix?: string;
  requestTimeout?: number;
}

export class MeilisearchProvider implements SearchProvider {
  readonly name = 'meilisearch';

  private client: MeiliSearch;
  private indexPrefix: string;
  private pendingTasks: Map<string, number[]> = new Map();

  constructor(private config: MeilisearchConfig) {
    this.client = new MeiliSearch({
      host: config.host,
      apiKey: config.apiKey,
      timeout: config.requestTimeout || 10000,
    });
    this.indexPrefix = config.indexPrefix || '';
  }

  private getFullIndexName(indexName: string): string {
    return `${this.indexPrefix}${indexName}`;
  }

  private getIndex(indexName: string): Index {
    return this.client.index(this.getFullIndexName(indexName));
  }

  async initialize(): Promise<void> {
    // Verify connection by getting health status
    await this.client.health();
  }

  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.client.health();
      return health.status === 'available';
    } catch {
      return false;
    }
  }

  async createIndex(indexName: string, primaryKey: string = 'id'): Promise<void> {
    const fullName = this.getFullIndexName(indexName);
    const task = await this.client.createIndex(fullName, { primaryKey });
    await this.client.tasks.waitForTask(task.taskUid);
  }

  async deleteIndex(indexName: string): Promise<void> {
    const fullName = this.getFullIndexName(indexName);
    const task = await this.client.deleteIndex(fullName);
    await this.client.tasks.waitForTask(task.taskUid);
  }

  async getIndexSettings(indexName: string): Promise<IndexSettings> {
    const index = this.getIndex(indexName);
    const settings = await index.getSettings();
    return {
      searchableAttributes: settings.searchableAttributes ?? undefined,
      filterableAttributes: settings.filterableAttributes?.filter(
        (attr): attr is string => typeof attr === 'string'
      ) ?? undefined,
      sortableAttributes: settings.sortableAttributes ?? undefined,
      displayedAttributes: settings.displayedAttributes ?? undefined,
      rankingRules: settings.rankingRules ?? undefined,
      stopWords: settings.stopWords ?? undefined,
      synonyms: settings.synonyms ?? undefined,
      distinctAttribute: settings.distinctAttribute ?? undefined,
      typoTolerance: settings.typoTolerance ? {
        enabled: settings.typoTolerance.enabled ?? undefined,
        minWordSizeForTypos: settings.typoTolerance.minWordSizeForTypos ? {
          oneTypo: settings.typoTolerance.minWordSizeForTypos.oneTypo ?? undefined,
          twoTypos: settings.typoTolerance.minWordSizeForTypos.twoTypos ?? undefined,
        } : undefined,
        disableOnWords: settings.typoTolerance.disableOnWords ?? undefined,
        disableOnAttributes: settings.typoTolerance.disableOnAttributes ?? undefined,
      } : undefined,
      pagination: settings.pagination ? {
        maxTotalHits: settings.pagination.maxTotalHits ?? undefined,
      } : undefined,
      faceting: settings.faceting ? {
        maxValuesPerFacet: settings.faceting.maxValuesPerFacet ?? undefined,
      } : undefined,
    };
  }

  async updateIndexSettings(indexName: string, settings: IndexSettings): Promise<void> {
    const index = this.getIndex(indexName);
    const task = await index.updateSettings({
      searchableAttributes: settings.searchableAttributes,
      filterableAttributes: settings.filterableAttributes,
      sortableAttributes: settings.sortableAttributes,
      displayedAttributes: settings.displayedAttributes,
      rankingRules: settings.rankingRules,
      stopWords: settings.stopWords,
      synonyms: settings.synonyms,
      distinctAttribute: settings.distinctAttribute,
      typoTolerance: settings.typoTolerance,
      pagination: settings.pagination,
      faceting: settings.faceting,
    });
    await this.client.tasks.waitForTask(task.taskUid);
  }

  async getIndexStats(indexName: string): Promise<IndexStats> {
    const index = this.getIndex(indexName);
    const stats = await index.getStats();
    return {
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
      fieldDistribution: stats.fieldDistribution,
    };
  }

  async indexDocument(indexName: string, document: SearchableDocument): Promise<void> {
    const index = this.getIndex(indexName);
    const task = await index.addDocuments([document]);
    // Track task for optional waiting
    const tasks = this.pendingTasks.get(indexName) || [];
    tasks.push(task.taskUid);
    this.pendingTasks.set(indexName, tasks);
  }

  async indexDocuments(indexName: string, documents: SearchableDocument[]): Promise<void> {
    if (documents.length === 0) return;

    const index = this.getIndex(indexName);
    // Batch in chunks of 1000 for large datasets
    const chunkSize = 1000;
    const tasks: number[] = [];

    for (let i = 0; i < documents.length; i += chunkSize) {
      const chunk = documents.slice(i, i + chunkSize);
      const task = await index.addDocuments(chunk);
      tasks.push(task.taskUid);
    }

    // Wait for all tasks to complete
    await Promise.all(tasks.map((taskUid) => this.client.tasks.waitForTask(taskUid)));
  }

  async updateDocument(
    indexName: string,
    document: Partial<SearchableDocument> & { id: string }
  ): Promise<void> {
    const index = this.getIndex(indexName);
    const task = await index.updateDocuments([document]);
    await this.client.tasks.waitForTask(task.taskUid);
  }

  async updateDocuments(
    indexName: string,
    documents: Array<Partial<SearchableDocument> & { id: string }>
  ): Promise<void> {
    if (documents.length === 0) return;

    const index = this.getIndex(indexName);
    const task = await index.updateDocuments(documents);
    await this.client.tasks.waitForTask(task.taskUid);
  }

  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    const index = this.getIndex(indexName);
    const task = await index.deleteDocument(documentId);
    await this.client.tasks.waitForTask(task.taskUid);
  }

  async deleteDocuments(indexName: string, documentIds: string[]): Promise<void> {
    if (documentIds.length === 0) return;

    const index = this.getIndex(indexName);
    const task = await index.deleteDocuments(documentIds);
    await this.client.tasks.waitForTask(task.taskUid);
  }

  async deleteAllDocuments(indexName: string): Promise<void> {
    const index = this.getIndex(indexName);
    const task = await index.deleteAllDocuments();
    await this.client.tasks.waitForTask(task.taskUid);
  }

  async search<T = Record<string, unknown>>(
    indexName: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const index = this.getIndex(indexName);

    const searchParams: Record<string, unknown> = {
      limit: options.limit || 20,
      offset: options.offset || 0,
    };

    if (options.filters) {
      searchParams.filter = Array.isArray(options.filters)
        ? options.filters
        : options.filters;
    }

    if (options.facets) {
      searchParams.facets = options.facets;
    }

    if (options.sort) {
      searchParams.sort = options.sort;
    }

    if (options.attributesToRetrieve) {
      searchParams.attributesToRetrieve = options.attributesToRetrieve;
    }

    if (options.attributesToHighlight) {
      searchParams.attributesToHighlight = options.attributesToHighlight;
      searchParams.highlightPreTag = options.highlightPreTag || '<mark>';
      searchParams.highlightPostTag = options.highlightPostTag || '</mark>';
    }

    const response = await index.search(query, searchParams);

    return this.transformSearchResponse<T>(response as unknown as SearchResponse<T>, query);
  }

  async multiSearch<T = Record<string, unknown>>(
    searches: Array<{
      indexName: string;
      query: string;
      options?: SearchOptions;
    }>
  ): Promise<Array<SearchResult<T>>> {
    const queries = searches.map(({ indexName, query, options = {} }) => ({
      indexUid: this.getFullIndexName(indexName),
      q: query,
      limit: options.limit || 20,
      offset: options.offset || 0,
      filter: options.filters,
      facets: options.facets,
      sort: options.sort,
      attributesToRetrieve: options.attributesToRetrieve,
      attributesToHighlight: options.attributesToHighlight,
    }));

    const response = await this.client.multiSearch({ queries });

    return (response as { results: SearchResponse<T>[] }).results.map((result, idx) =>
      this.transformSearchResponse<T>(result, searches[idx].query)
    );
  }

  async getSuggestions(
    indexName: string,
    query: string,
    limit: number = 5
  ): Promise<SuggestionResult> {
    // Meilisearch uses prefix search for suggestions
    const index = this.getIndex(indexName);
    const response = await index.search(query, {
      limit,
      attributesToRetrieve: ['id', 'title', 'name'],
      attributesToHighlight: ['title', 'name'],
      highlightPreTag: '<strong>',
      highlightPostTag: '</strong>',
    });

    const suggestions = response.hits.map((hit: Record<string, unknown>) => {
      const formatted = hit._formatted as Record<string, string> | undefined;
      const title = (hit.title || hit.name || '') as string;
      const highlightedTitle = formatted?.title || formatted?.name || title;

      return {
        text: title,
        highlighted: highlightedTitle,
        score: undefined, // Meilisearch doesn't expose relevance score by default
      };
    });

    return {
      query,
      suggestions,
    };
  }

  async waitForTasks(taskIds: number[]): Promise<void> {
    await Promise.all(taskIds.map((taskUid) => this.client.tasks.waitForTask(taskUid)));
  }

  private transformSearchResponse<T>(
    response: SearchResponse<T>,
    query: string
  ): SearchResult<T> {
    const hits: SearchHit<T>[] = response.hits.map((hit) => {
      const { _formatted, ...document } = hit as Record<string, unknown> & {
        _formatted?: Record<string, string>;
      };

      return {
        id: document.id as string,
        document: document as T,
        highlights: _formatted,
      };
    });

    return {
      hits,
      totalHits: response.estimatedTotalHits || response.hits.length,
      processingTimeMs: response.processingTimeMs,
      query,
      facetDistribution: response.facetDistribution,
      page: response.page,
      hitsPerPage: response.hitsPerPage,
    };
  }
}

export default MeilisearchProvider;
