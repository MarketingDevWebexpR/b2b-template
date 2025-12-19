/**
 * Search Module Service
 *
 * Main service for search functionality in Medusa V2.
 * Supports dual-engine operation (Meilisearch + App Search) for progressive migration.
 * Provides methods for indexing and searching products, categories, etc.
 */

import { MedusaService } from '@medusajs/framework/utils';
import type { Logger } from '@medusajs/framework/types';
import type { SearchProvider, SearchResult, SearchOptions, SearchableDocument } from './providers/search-provider.interface';
import { MeilisearchProvider, type MeilisearchConfig } from './providers/meilisearch-provider';
import { AppSearchProvider } from './providers/appsearch-provider';
import { INDEX_NAMES, getIndexSettings } from './utils/index-config';
import { transformProductForIndex, transformCategoryForIndex, transformMarqueForIndex } from './utils/transformers';
import type { AppSearchConfig } from './utils/appsearch-config';

export type SearchProviderType = 'meilisearch' | 'appsearch' | 'dual';

export interface SearchServiceConfig {
  /** Active search provider: 'meilisearch', 'appsearch', or 'dual' for A/B testing */
  provider: SearchProviderType;

  // Meilisearch configuration
  meilisearchHost?: string;
  meilisearchApiKey?: string;
  indexPrefix?: string;

  // App Search configuration
  appSearchEndpoint?: string;
  appSearchPrivateKey?: string;
  appSearchPublicKey?: string;
  appSearchEngine?: string;

  /** Traffic percentage to send to App Search in dual mode (0-100) */
  appSearchTrafficPercentage?: number;
}

export interface ProductDocument extends SearchableDocument {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  thumbnail: string | null;
  images: string[];
  collection_id: string | null;
  collection: string | null;
  /** Brand/Marque ID from product-marque link */
  brand_id: string | null;
  /** Brand/Marque name from product-marque link */
  brand_name: string | null;
  /** Brand/Marque slug from product-marque link */
  brand_slug: string | null;
  /** Legacy brand field for backwards compatibility */
  brand: string | null;
  material: string | null;
  categories: Array<{ id: string; name: string; handle: string }>;
  /** Flat array of all category IDs for filtering */
  category_ids: string[];
  /** Flat array of all category names for faceting */
  category_names: string[];
  /** Full category paths for hierarchical navigation (e.g., "Bijoux > Bagues > Or") */
  category_paths: string[];
  /** All category handles including ancestors for filtering */
  all_category_handles?: string[];
  tags: string[];
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    prices: Array<{ amount: number; currency_code: string }>;
    inventory_quantity: number;
  }>;
  price_min: number | null;
  price_max: number | null;
  is_available: boolean;
  has_stock: boolean;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface CategoryDocument extends SearchableDocument {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  parent_category_id: string | null;
  /** Full path of parent category IDs from root to this category */
  parent_category_ids: string[];
  /** Full path of category names from root (e.g., "Bijoux > Bagues > Or") */
  path: string;
  /** Array of ancestor names for filtering */
  ancestor_names: string[];
  /** Array of ancestor handles for URL building */
  ancestor_handles: string[];
  is_active: boolean;
  rank: number;
  depth: number;
  product_count: number;
  created_at: string;
  /** Category icon/picto identifier for frontend display */
  icon: string | null;
  /** Category image URL for category cards/banners */
  image_url: string | null;
  metadata: Record<string, unknown>;
}

export interface MarqueDocument extends SearchableDocument {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  rank: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

/**
 * Sync report for tracking synchronization history
 * Used internally and by admin API routes
 */
export interface SyncReport {
  id: string;
  engine: SearchProviderType;
  syncType: 'full' | 'incremental' | 'scheduled' | 'entity';
  entityType: 'all' | 'products' | 'categories' | 'marques' | 'collections';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  triggeredBy: string;
  startedAt: Date | null;
  completedAt: Date | null;
  documentsIndexed: number;
  documentsFailed: number;
  errorMessage: string | null;
  /** Detailed results per entity (optional) */
  details?: {
    products: number;
    categories: number;
    marques: number;
    collections: number;
  };
  errors: Array<{ entity: string; id: string; error: string }>;
}

/**
 * Search engine status
 */
export interface SearchEngineStatus {
  provider: SearchProviderType;
  isHealthy: boolean;
  meilisearch?: {
    isHealthy: boolean;
    host: string;
    indexes: Record<string, { documents: number; isIndexing: boolean }>;
  };
  appSearch?: {
    isHealthy: boolean;
    endpoint: string;
    engine: string;
    indexes: Record<string, { documents: number }>;
  };
  trafficPercentage?: number;
}

class SearchModuleService extends MedusaService({}) {
  protected meilisearchProvider_?: SearchProvider;
  protected appSearchProvider_?: SearchProvider;
  protected activeProvider_: SearchProviderType;
  protected logger_: Logger;
  protected config_: SearchServiceConfig;
  protected initialized_: boolean = false;
  protected appSearchTrafficPercentage_: number = 0;

  /** In-memory sync reports (should be persisted to DB in production) */
  protected syncReports_: SyncReport[] = [];

  /** Last sync timestamps per index */
  protected lastSyncTimestamps_: Record<string, Date> = {};

  constructor(
    container: Record<string, unknown>,
    config: SearchServiceConfig
  ) {
    super(container);

    this.logger_ = container.logger as Logger;
    this.config_ = config;
    this.activeProvider_ = config.provider || 'meilisearch';
    this.appSearchTrafficPercentage_ = config.appSearchTrafficPercentage || 0;

    // Initialize providers based on configuration
    this.initializeProviders(config);
  }

  private initializeProviders(config: SearchServiceConfig): void {
    const loggerAdapter = {
      info: (msg: string) => this.logger_.info(msg),
      error: (msg: string, err?: Error) => this.logger_.error(msg, err),
      debug: (msg: string) => this.logger_.debug(msg),
      warn: (msg: string) => this.logger_.warn(msg),
    };

    // Always initialize Meilisearch if config provided (for dual mode or meilisearch mode)
    if (config.provider === 'meilisearch' || config.provider === 'dual' || config.meilisearchHost) {
      const meilisearchConfig: MeilisearchConfig = {
        host: config.meilisearchHost || process.env.MEILISEARCH_HOST || 'http://localhost:7700',
        apiKey: config.meilisearchApiKey || process.env.MEILISEARCH_API_KEY || '',
        indexPrefix: config.indexPrefix || process.env.MEILISEARCH_INDEX_PREFIX || 'bijoux_',
      };
      this.meilisearchProvider_ = new MeilisearchProvider(meilisearchConfig);
    }

    // Initialize App Search if config provided
    if (config.provider === 'appsearch' || config.provider === 'dual' || config.appSearchEndpoint) {
      const appSearchConfig: AppSearchConfig = {
        endpoint: config.appSearchEndpoint || process.env.APPSEARCH_ENDPOINT || '',
        privateApiKey: config.appSearchPrivateKey || process.env.APPSEARCH_PRIVATE_KEY || '',
        publicSearchKey: config.appSearchPublicKey || process.env.APPSEARCH_PUBLIC_KEY || '',
        engineName: config.appSearchEngine || process.env.APPSEARCH_ENGINE || 'dev-medusa-v2',
      };

      if (appSearchConfig.endpoint && appSearchConfig.privateApiKey) {
        this.appSearchProvider_ = new AppSearchProvider(appSearchConfig, loggerAdapter);
      }
    }

    // Validate provider configuration
    if (config.provider === 'appsearch' && !this.appSearchProvider_) {
      throw new Error('App Search configuration is required when provider is set to "appsearch"');
    }

    if (config.provider === 'meilisearch' && !this.meilisearchProvider_) {
      throw new Error('Meilisearch configuration is required when provider is set to "meilisearch"');
    }

    if (config.provider === 'dual' && (!this.meilisearchProvider_ || !this.appSearchProvider_)) {
      throw new Error('Both Meilisearch and App Search configuration required for dual mode');
    }
  }

  /**
   * Get the active provider for queries
   * In dual mode, routes traffic based on percentage
   */
  private getQueryProvider(): SearchProvider {
    if (this.activeProvider_ === 'dual') {
      // Route traffic based on percentage
      const useAppSearch = Math.random() * 100 < this.appSearchTrafficPercentage_;
      const provider = useAppSearch ? this.appSearchProvider_! : this.meilisearchProvider_!;
      this.logger_.debug(`[Search] Query routed to ${provider.name} (traffic split: ${this.appSearchTrafficPercentage_}% App Search)`);
      return provider;
    }

    if (this.activeProvider_ === 'appsearch') {
      return this.appSearchProvider_!;
    }

    return this.meilisearchProvider_!;
  }

  /**
   * Get all providers for indexing operations
   * In dual mode, index to both engines
   */
  private getIndexingProviders(): SearchProvider[] {
    if (this.activeProvider_ === 'dual') {
      return [this.meilisearchProvider_!, this.appSearchProvider_!].filter(Boolean);
    }

    if (this.activeProvider_ === 'appsearch') {
      return [this.appSearchProvider_!];
    }

    return [this.meilisearchProvider_!];
  }

  // ============================================
  // ENGINE MANAGEMENT
  // ============================================

  /**
   * Get current active provider type
   */
  getActiveProvider(): SearchProviderType {
    return this.activeProvider_;
  }

  /**
   * Switch active provider
   */
  async switchProvider(provider: SearchProviderType): Promise<void> {
    if (provider === 'appsearch' && !this.appSearchProvider_) {
      throw new Error('App Search provider not configured');
    }

    if (provider === 'meilisearch' && !this.meilisearchProvider_) {
      throw new Error('Meilisearch provider not configured');
    }

    if (provider === 'dual' && (!this.meilisearchProvider_ || !this.appSearchProvider_)) {
      throw new Error('Both providers must be configured for dual mode');
    }

    const previousProvider = this.activeProvider_;
    this.activeProvider_ = provider;
    this.logger_.info(`Search provider switched from '${previousProvider}' to '${provider}'`);
  }

  /**
   * Set App Search traffic percentage in dual mode
   */
  setAppSearchTrafficPercentage(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Traffic percentage must be between 0 and 100');
    }
    this.appSearchTrafficPercentage_ = percentage;
    this.logger_.info(`App Search traffic percentage set to ${percentage}%`);
  }

  /**
   * Get App Search traffic percentage
   */
  getAppSearchTrafficPercentage(): number {
    return this.appSearchTrafficPercentage_;
  }

  /**
   * Get basic engine status (synchronous)
   * Returns configuration without health checks
   */
  getEngineStatus(): {
    mode: SearchProviderType;
    activeProvider: 'meilisearch' | 'appsearch';
    secondaryProvider: 'meilisearch' | 'appsearch' | null;
    appSearchTrafficPercentage: number;
  } {
    const mode = this.activeProvider_;
    let activeProvider: 'meilisearch' | 'appsearch' = 'meilisearch';
    let secondaryProvider: 'meilisearch' | 'appsearch' | null = null;

    if (mode === 'dual') {
      activeProvider = 'meilisearch';
      secondaryProvider = 'appsearch';
    } else if (mode === 'appsearch') {
      activeProvider = 'appsearch';
    }

    return {
      mode,
      activeProvider,
      secondaryProvider,
      appSearchTrafficPercentage: this.appSearchTrafficPercentage_,
    };
  }

  /**
   * Get comprehensive search engine status with health checks (async)
   */
  async getEngineStatusDetailed(): Promise<SearchEngineStatus> {
    const status: SearchEngineStatus = {
      provider: this.activeProvider_,
      isHealthy: false,
    };

    // Check Meilisearch health
    if (this.meilisearchProvider_) {
      try {
        const isHealthy = await this.meilisearchProvider_.isHealthy();
        const indexes: Record<string, { documents: number; isIndexing: boolean }> = {};

        for (const indexName of Object.values(INDEX_NAMES)) {
          try {
            const stats = await this.meilisearchProvider_.getIndexStats(indexName);
            indexes[indexName] = {
              documents: stats.numberOfDocuments,
              isIndexing: stats.isIndexing,
            };
          } catch {
            indexes[indexName] = { documents: 0, isIndexing: false };
          }
        }

        status.meilisearch = {
          isHealthy,
          host: this.config_.meilisearchHost || 'http://localhost:7700',
          indexes,
        };
      } catch {
        status.meilisearch = {
          isHealthy: false,
          host: this.config_.meilisearchHost || 'http://localhost:7700',
          indexes: {},
        };
      }
    }

    // Check App Search health
    if (this.appSearchProvider_) {
      try {
        const isHealthy = await this.appSearchProvider_.isHealthy();
        const indexes: Record<string, { documents: number }> = {};

        for (const indexName of Object.values(INDEX_NAMES)) {
          try {
            const stats = await this.appSearchProvider_.getIndexStats(indexName);
            indexes[indexName] = { documents: stats.numberOfDocuments };
          } catch {
            indexes[indexName] = { documents: 0 };
          }
        }

        status.appSearch = {
          isHealthy,
          endpoint: this.config_.appSearchEndpoint || '',
          engine: this.config_.appSearchEngine || 'dev-medusa-v2',
          indexes,
        };
      } catch {
        status.appSearch = {
          isHealthy: false,
          endpoint: this.config_.appSearchEndpoint || '',
          engine: this.config_.appSearchEngine || 'dev-medusa-v2',
          indexes: {},
        };
      }
    }

    // Overall health
    if (this.activeProvider_ === 'dual') {
      status.isHealthy = (status.meilisearch?.isHealthy || false) && (status.appSearch?.isHealthy || false);
      status.trafficPercentage = this.appSearchTrafficPercentage_;
    } else if (this.activeProvider_ === 'appsearch') {
      status.isHealthy = status.appSearch?.isHealthy || false;
    } else {
      status.isHealthy = status.meilisearch?.isHealthy || false;
    }

    return status;
  }

  // ============================================
  // SYNC REPORTS
  // ============================================

  /**
   * Get sync reports (returns array directly for admin API compatibility)
   */
  getSyncReports(limit = 50): SyncReport[] {
    const sorted = [...this.syncReports_].sort(
      (a, b) => {
        const aTime = a.startedAt?.getTime() || 0;
        const bTime = b.startedAt?.getTime() || 0;
        return bTime - aTime;
      }
    );
    return sorted.slice(0, limit);
  }

  /**
   * Get sync reports with pagination
   */
  getSyncReportsPaginated(limit = 50, offset = 0): { reports: SyncReport[]; total: number } {
    const sorted = [...this.syncReports_].sort(
      (a, b) => {
        const aTime = a.startedAt?.getTime() || 0;
        const bTime = b.startedAt?.getTime() || 0;
        return bTime - aTime;
      }
    );
    return {
      reports: sorted.slice(offset, offset + limit),
      total: this.syncReports_.length,
    };
  }

  /**
   * Create a new sync report
   */
  createSyncReport(
    syncType: 'full' | 'incremental' | 'scheduled' | 'entity',
    entityType: 'all' | 'products' | 'categories' | 'marques' | 'collections' = 'all',
    triggeredBy = 'system'
  ): SyncReport {
    const report: SyncReport = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      engine: this.activeProvider_,
      syncType,
      entityType,
      status: 'in_progress',
      triggeredBy,
      startedAt: new Date(),
      completedAt: null,
      documentsIndexed: 0,
      documentsFailed: 0,
      errorMessage: null,
      details: { products: 0, categories: 0, marques: 0, collections: 0 },
      errors: [],
    };
    this.syncReports_.push(report);
    return report;
  }

  /**
   * Update sync report progress
   */
  updateSyncReport(reportId: string, updates: Partial<Pick<SyncReport, 'documentsIndexed' | 'documentsFailed' | 'details'>>): void {
    const report = this.syncReports_.find(r => r.id === reportId);
    if (report) {
      if (updates.documentsIndexed !== undefined) report.documentsIndexed = updates.documentsIndexed;
      if (updates.documentsFailed !== undefined) report.documentsFailed = updates.documentsFailed;
      if (updates.details) report.details = { ...report.details, ...updates.details };
    }
  }

  /**
   * Complete a sync report
   */
  completeSyncReport(report: SyncReport, success: boolean, errorMessage?: string): void {
    report.status = success ? 'completed' : 'failed';
    report.completedAt = new Date();
    if (errorMessage) {
      report.errorMessage = errorMessage;
    }

    // Keep only last 100 reports
    if (this.syncReports_.length > 100) {
      this.syncReports_ = this.syncReports_.slice(-100);
    }
  }

  /**
   * Get last sync timestamp for an index
   */
  getLastSyncTimestamp(indexName: string): Date | null {
    return this.lastSyncTimestamps_[indexName] || null;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize the search service and create indexes
   */
  async initialize(): Promise<void> {
    if (this.initialized_) return;

    try {
      const providers = this.getIndexingProviders();

      for (const provider of providers) {
        await provider.initialize();

        // Create indexes with their settings
        for (const indexName of Object.values(INDEX_NAMES)) {
          try {
            await provider.createIndex(indexName);
            const settings = getIndexSettings(indexName);
            await provider.updateIndexSettings(indexName, settings);
            this.logger_.info(`[${provider.name}] Index '${indexName}' initialized`);
          } catch (error) {
            // Index might already exist, try to update settings
            try {
              const settings = getIndexSettings(indexName);
              await provider.updateIndexSettings(indexName, settings);
              this.logger_.info(`[${provider.name}] Index '${indexName}' settings updated`);
            } catch (settingsError) {
              this.logger_.error(`[${provider.name}] Failed to configure index '${indexName}':`, settingsError instanceof Error ? settingsError : undefined);
            }
          }
        }
      }

      this.initialized_ = true;
      this.logger_.info(`Search service initialized with provider(s): ${providers.map(p => p.name).join(', ')}`);
    } catch (error) {
      this.logger_.error('Failed to initialize search service:', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  /**
   * Check if search service is healthy
   */
  async isHealthy(): Promise<boolean> {
    const provider = this.getQueryProvider();
    return provider.isHealthy();
  }

  // ============================================
  // PRODUCT INDEXING
  // ============================================

  /**
   * Index a single product
   */
  async indexProduct(product: ProductDocument): Promise<void> {
    await this.ensureInitialized();
    const document = transformProductForIndex(product);
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.indexDocument(INDEX_NAMES.PRODUCTS, document)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to index product ${product.id}:`, err))
      )
    );

    this.logger_.debug(`Indexed product: ${product.id}`);
  }

  /**
   * Index multiple products
   */
  async indexProducts(products: ProductDocument[]): Promise<void> {
    await this.ensureInitialized();
    if (products.length === 0) return;

    const documents = products.map(transformProductForIndex);
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.indexDocuments(INDEX_NAMES.PRODUCTS, documents)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to index ${products.length} products:`, err))
      )
    );

    this.logger_.info(`Indexed ${products.length} products to ${providers.length} engine(s)`);
  }

  /**
   * Update a product in the index
   */
  async updateProduct(product: Partial<ProductDocument> & { id: string }): Promise<void> {
    await this.ensureInitialized();
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.updateDocument(INDEX_NAMES.PRODUCTS, product)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to update product ${product.id}:`, err))
      )
    );

    this.logger_.debug(`Updated product in index: ${product.id}`);
  }

  /**
   * Remove a product from the index
   */
  async deleteProduct(productId: string): Promise<void> {
    await this.ensureInitialized();
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.deleteDocument(INDEX_NAMES.PRODUCTS, productId)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to delete product ${productId}:`, err))
      )
    );

    this.logger_.debug(`Deleted product from index: ${productId}`);
  }

  /**
   * Remove multiple products from the index
   */
  async deleteProducts(productIds: string[]): Promise<void> {
    await this.ensureInitialized();
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.deleteDocuments(INDEX_NAMES.PRODUCTS, productIds)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to delete ${productIds.length} products:`, err))
      )
    );

    this.logger_.debug(`Deleted ${productIds.length} products from index`);
  }

  // ============================================
  // CATEGORY INDEXING
  // ============================================

  /**
   * Index a single category
   */
  async indexCategory(category: CategoryDocument): Promise<void> {
    await this.ensureInitialized();
    const document = transformCategoryForIndex(category);
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.indexDocument(INDEX_NAMES.CATEGORIES, document)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to index category ${category.id}:`, err))
      )
    );

    this.logger_.debug(`Indexed category: ${category.id}`);
  }

  /**
   * Index multiple categories
   */
  async indexCategories(categories: CategoryDocument[]): Promise<void> {
    await this.ensureInitialized();
    if (categories.length === 0) return;

    const documents = categories.map(transformCategoryForIndex);
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.indexDocuments(INDEX_NAMES.CATEGORIES, documents)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to index ${categories.length} categories:`, err))
      )
    );

    this.logger_.info(`Indexed ${categories.length} categories to ${providers.length} engine(s)`);
  }

  /**
   * Remove a category from the index
   */
  async deleteCategory(categoryId: string): Promise<void> {
    await this.ensureInitialized();
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.deleteDocument(INDEX_NAMES.CATEGORIES, categoryId)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to delete category ${categoryId}:`, err))
      )
    );

    this.logger_.debug(`Deleted category from index: ${categoryId}`);
  }

  // ============================================
  // MARQUE (BRAND) INDEXING
  // ============================================

  /**
   * Index a single marque (brand)
   */
  async indexMarque(marque: MarqueDocument): Promise<void> {
    await this.ensureInitialized();
    const document = transformMarqueForIndex(marque);
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.indexDocument(INDEX_NAMES.MARQUES, document)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to index marque ${marque.id}:`, err))
      )
    );

    this.logger_.debug(`Indexed marque: ${marque.id}`);
  }

  /**
   * Index multiple marques (brands)
   */
  async indexMarques(marques: MarqueDocument[]): Promise<void> {
    await this.ensureInitialized();
    if (marques.length === 0) return;

    const documents = marques.map(transformMarqueForIndex);
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.indexDocuments(INDEX_NAMES.MARQUES, documents)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to index ${marques.length} marques:`, err))
      )
    );

    this.logger_.info(`Indexed ${marques.length} marques to ${providers.length} engine(s)`);
  }

  /**
   * Remove a marque from the index
   */
  async deleteMarque(marqueId: string): Promise<void> {
    await this.ensureInitialized();
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.deleteDocument(INDEX_NAMES.MARQUES, marqueId)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to delete marque ${marqueId}:`, err))
      )
    );

    this.logger_.debug(`Deleted marque from index: ${marqueId}`);
  }

  /**
   * Remove multiple marques from the index
   */
  async deleteMarques(marqueIds: string[]): Promise<void> {
    await this.ensureInitialized();
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.deleteDocuments(INDEX_NAMES.MARQUES, marqueIds)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to delete ${marqueIds.length} marques:`, err))
      )
    );

    this.logger_.debug(`Deleted ${marqueIds.length} marques from index`);
  }

  // ============================================
  // SEARCH OPERATIONS
  // ============================================

  /**
   * Search products
   */
  async searchProducts(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<ProductDocument>> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();

    return provider.search<ProductDocument>(INDEX_NAMES.PRODUCTS, query, {
      facets: [
        'category_names',
        'category_paths',
        'category_ids',
        'brand_id',
        'brand_name',
        'brand',
        'material',
        'tags',
        'has_stock',
        'collection',
      ],
      ...options,
    });
  }

  /**
   * Search categories
   */
  async searchCategories(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<CategoryDocument>> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();

    return provider.search<CategoryDocument>(INDEX_NAMES.CATEGORIES, query, {
      facets: ['depth', 'is_active', 'parent_category_id'],
      ...options,
    });
  }

  /**
   * Get categories by parent
   */
  async getCategoriesByParent(
    parentCategoryId: string | null,
    options: SearchOptions = {}
  ): Promise<SearchResult<CategoryDocument>> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();

    const filter = parentCategoryId === null
      ? 'parent_category_id IS NULL'
      : `parent_category_id = "${parentCategoryId}"`;

    return provider.search<CategoryDocument>(INDEX_NAMES.CATEGORIES, '', {
      filters: filter,
      sort: ['rank:asc', 'name:asc'],
      ...options,
    });
  }

  /**
   * Get category with ancestors (for breadcrumb)
   */
  async getCategoryWithAncestors(
    categoryId: string
  ): Promise<CategoryDocument | null> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();

    const result = await provider.search<CategoryDocument>(INDEX_NAMES.CATEGORIES, '', {
      filters: `id = "${categoryId}"`,
      limit: 1,
    });

    if (result.hits.length === 0) {
      return null;
    }

    return result.hits[0].document;
  }

  /**
   * Search marques (brands)
   */
  async searchMarques(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<MarqueDocument>> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();

    return provider.search<MarqueDocument>(INDEX_NAMES.MARQUES, query, {
      facets: ['is_active', 'country'],
      ...options,
    });
  }

  /**
   * Get active marques sorted by rank
   */
  async getActiveMarques(
    options: SearchOptions = {}
  ): Promise<SearchResult<MarqueDocument>> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();

    return provider.search<MarqueDocument>(INDEX_NAMES.MARQUES, '', {
      filters: 'is_active = true',
      sort: ['rank:desc', 'name:asc'],
      ...options,
    });
  }

  /**
   * Multi-search across products, categories, and marques
   */
  async searchAll(
    query: string,
    limits: { products?: number; categories?: number; marques?: number } = {}
  ): Promise<{
    products: SearchResult<ProductDocument>;
    categories: SearchResult<CategoryDocument>;
    marques: SearchResult<MarqueDocument>;
  }> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();

    const results = await provider.multiSearch([
      {
        indexName: INDEX_NAMES.PRODUCTS,
        query,
        options: {
          limit: limits.products || 5,
          attributesToRetrieve: ['id', 'title', 'handle', 'thumbnail', 'price_min', 'brand', 'brand_id', 'brand_name'],
        },
      },
      {
        indexName: INDEX_NAMES.CATEGORIES,
        query,
        options: {
          limit: limits.categories || 3,
          attributesToRetrieve: ['id', 'name', 'handle', 'product_count', 'path'],
        },
      },
      {
        indexName: INDEX_NAMES.MARQUES,
        query,
        options: {
          limit: limits.marques || 3,
          attributesToRetrieve: ['id', 'name', 'slug', 'logo_url', 'country'],
        },
      },
    ]);

    return {
      products: results[0] as SearchResult<ProductDocument>,
      categories: results[1] as SearchResult<CategoryDocument>,
      marques: results[2] as SearchResult<MarqueDocument>,
    };
  }

  /**
   * Get product suggestions for autocomplete
   */
  async getProductSuggestions(query: string, limit: number = 5): Promise<{
    query: string;
    suggestions: Array<{
      id: string;
      title: string;
      handle: string;
      thumbnail: string | null;
      price_min: number | null;
    }>;
  }> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();

    const result = await provider.search<ProductDocument>(INDEX_NAMES.PRODUCTS, query, {
      limit,
      attributesToRetrieve: ['id', 'title', 'handle', 'thumbnail', 'price_min'],
    });

    return {
      query,
      suggestions: result.hits.map((hit) => ({
        id: hit.document.id,
        title: hit.document.title,
        handle: hit.document.handle,
        thumbnail: hit.document.thumbnail,
        price_min: hit.document.price_min,
      })),
    };
  }

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  /**
   * Clear all documents from an index
   */
  async clearIndex(indexName: string): Promise<void> {
    await this.ensureInitialized();
    const providers = this.getIndexingProviders();

    await Promise.all(
      providers.map(provider =>
        provider.deleteAllDocuments(indexName)
          .catch(err => this.logger_.error(`[${provider.name}] Failed to clear index ${indexName}:`, err))
      )
    );

    this.logger_.info(`Cleared index: ${indexName}`);
  }

  /**
   * Get index statistics
   */
  async getIndexStats(indexName: string): Promise<{
    numberOfDocuments: number;
    isIndexing: boolean;
  }> {
    await this.ensureInitialized();
    const provider = this.getQueryProvider();
    return provider.getIndexStats(indexName);
  }

  /**
   * Rebuild all indexes (full reindex)
   * This is a placeholder - actual implementation requires database access
   */
  async rebuildIndexes(): Promise<{ products: number; categories: number }> {
    await this.ensureInitialized();

    const report = this.createSyncReport('full', 'all', 'system');

    try {
      // This would typically fetch all data from the database
      // For now, we just return the structure
      this.logger_.warn('rebuildIndexes: Implement full reindex logic with database access');

      this.completeSyncReport(report, true);
      return { products: 0, categories: 0 };
    } catch (error) {
      this.completeSyncReport(report, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized_) {
      await this.initialize();
    }
  }
}

export default SearchModuleService;
