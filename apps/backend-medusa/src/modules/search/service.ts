/**
 * Search Module Service
 *
 * Main service for search functionality in Medusa V2.
 * Provides methods for indexing and searching products, categories, etc.
 */

import { MedusaService } from '@medusajs/framework/utils';
import type { Logger } from '@medusajs/framework/types';
import type { SearchProvider, SearchResult, SearchOptions, SearchableDocument } from './providers/search-provider.interface';
import { MeilisearchProvider, type MeilisearchConfig } from './providers/meilisearch-provider';
import { INDEX_NAMES, getIndexSettings } from './utils/index-config';
import { transformProductForIndex, transformCategoryForIndex, transformMarqueForIndex } from './utils/transformers';

export interface SearchServiceConfig {
  provider: 'meilisearch' | 'algolia' | 'elasticsearch';
  meilisearchHost?: string;
  meilisearchApiKey?: string;
  indexPrefix?: string;
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

class SearchModuleService extends MedusaService({}) {
  protected provider_: SearchProvider;
  protected logger_: Logger;
  protected config_: SearchServiceConfig;
  protected initialized_: boolean = false;

  constructor(
    container: Record<string, unknown>,
    config: SearchServiceConfig
  ) {
    super(container);

    this.logger_ = container.logger as Logger;
    this.config_ = config;

    // Initialize provider based on configuration
    this.provider_ = this.createProvider(config);
  }

  private createProvider(config: SearchServiceConfig): SearchProvider {
    switch (config.provider) {
      case 'meilisearch': {
        const meilisearchConfig: MeilisearchConfig = {
          host: config.meilisearchHost || process.env.MEILISEARCH_HOST || 'http://localhost:7700',
          apiKey: config.meilisearchApiKey || process.env.MEILISEARCH_API_KEY || '',
          indexPrefix: config.indexPrefix || process.env.MEILISEARCH_INDEX_PREFIX || 'bijoux_',
        };
        return new MeilisearchProvider(meilisearchConfig);
      }
      case 'algolia':
        throw new Error('Algolia provider not implemented yet');
      case 'elasticsearch':
        throw new Error('Elasticsearch provider not implemented yet');
      default:
        throw new Error(`Unknown search provider: ${config.provider}`);
    }
  }

  /**
   * Initialize the search service and create indexes
   */
  async initialize(): Promise<void> {
    if (this.initialized_) return;

    try {
      await this.provider_.initialize();

      // Create indexes with their settings
      for (const indexName of Object.values(INDEX_NAMES)) {
        try {
          await this.provider_.createIndex(indexName);
          const settings = getIndexSettings(indexName);
          await this.provider_.updateIndexSettings(indexName, settings);
          this.logger_.info(`Search index '${indexName}' initialized`);
        } catch (error) {
          // Index might already exist, try to update settings
          try {
            const settings = getIndexSettings(indexName);
            await this.provider_.updateIndexSettings(indexName, settings);
            this.logger_.info(`Search index '${indexName}' settings updated`);
          } catch (settingsError) {
            this.logger_.error(`Failed to configure index '${indexName}':`, settingsError instanceof Error ? settingsError : undefined);
          }
        }
      }

      this.initialized_ = true;
      this.logger_.info('Search service initialized successfully');
    } catch (error) {
      this.logger_.error('Failed to initialize search service:', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  /**
   * Check if search service is healthy
   */
  async isHealthy(): Promise<boolean> {
    return this.provider_.isHealthy();
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
    await this.provider_.indexDocument(INDEX_NAMES.PRODUCTS, document);
    this.logger_.debug(`Indexed product: ${product.id}`);
  }

  /**
   * Index multiple products
   */
  async indexProducts(products: ProductDocument[]): Promise<void> {
    await this.ensureInitialized();
    if (products.length === 0) return;

    const documents = products.map(transformProductForIndex);
    await this.provider_.indexDocuments(INDEX_NAMES.PRODUCTS, documents);
    this.logger_.info(`Indexed ${products.length} products`);
  }

  /**
   * Update a product in the index
   */
  async updateProduct(product: Partial<ProductDocument> & { id: string }): Promise<void> {
    await this.ensureInitialized();
    await this.provider_.updateDocument(INDEX_NAMES.PRODUCTS, product);
    this.logger_.debug(`Updated product in index: ${product.id}`);
  }

  /**
   * Remove a product from the index
   */
  async deleteProduct(productId: string): Promise<void> {
    await this.ensureInitialized();
    await this.provider_.deleteDocument(INDEX_NAMES.PRODUCTS, productId);
    this.logger_.debug(`Deleted product from index: ${productId}`);
  }

  /**
   * Remove multiple products from the index
   */
  async deleteProducts(productIds: string[]): Promise<void> {
    await this.ensureInitialized();
    await this.provider_.deleteDocuments(INDEX_NAMES.PRODUCTS, productIds);
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
    await this.provider_.indexDocument(INDEX_NAMES.CATEGORIES, document);
    this.logger_.debug(`Indexed category: ${category.id}`);
  }

  /**
   * Index multiple categories
   */
  async indexCategories(categories: CategoryDocument[]): Promise<void> {
    await this.ensureInitialized();
    if (categories.length === 0) return;

    const documents = categories.map(transformCategoryForIndex);
    await this.provider_.indexDocuments(INDEX_NAMES.CATEGORIES, documents);
    this.logger_.info(`Indexed ${categories.length} categories`);
  }

  /**
   * Remove a category from the index
   */
  async deleteCategory(categoryId: string): Promise<void> {
    await this.ensureInitialized();
    await this.provider_.deleteDocument(INDEX_NAMES.CATEGORIES, categoryId);
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
    await this.provider_.indexDocument(INDEX_NAMES.MARQUES, document);
    this.logger_.debug(`Indexed marque: ${marque.id}`);
  }

  /**
   * Index multiple marques (brands)
   */
  async indexMarques(marques: MarqueDocument[]): Promise<void> {
    await this.ensureInitialized();
    if (marques.length === 0) return;

    const documents = marques.map(transformMarqueForIndex);
    await this.provider_.indexDocuments(INDEX_NAMES.MARQUES, documents);
    this.logger_.info(`Indexed ${marques.length} marques`);
  }

  /**
   * Remove a marque from the index
   */
  async deleteMarque(marqueId: string): Promise<void> {
    await this.ensureInitialized();
    await this.provider_.deleteDocument(INDEX_NAMES.MARQUES, marqueId);
    this.logger_.debug(`Deleted marque from index: ${marqueId}`);
  }

  /**
   * Remove multiple marques from the index
   */
  async deleteMarques(marqueIds: string[]): Promise<void> {
    await this.ensureInitialized();
    await this.provider_.deleteDocuments(INDEX_NAMES.MARQUES, marqueIds);
    this.logger_.debug(`Deleted ${marqueIds.length} marques from index`);
  }

  // ============================================
  // SEARCH OPERATIONS
  // ============================================

  /**
   * Search products
   *
   * By default includes category facets for navigation:
   * - category_names: Flat list of all category names
   * - category_paths: Full hierarchical paths (e.g., "Bijoux > Bagues > Or")
   * - category_ids: For filtering by specific category
   */
  async searchProducts(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<ProductDocument>> {
    await this.ensureInitialized();
    return this.provider_.search<ProductDocument>(INDEX_NAMES.PRODUCTS, query, {
      facets: [
        // Category facets for navigation
        'category_names',
        'category_paths',
        'category_ids',
        // Brand/Marque facets for filtering
        'brand_id',
        'brand_name',
        // Other facets
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
   *
   * Includes hierarchy fields for navigation:
   * - path: Full path like "Bijoux > Bagues > Or"
   * - parent_category_ids: Array of ancestor IDs
   * - depth: Level in hierarchy (0 = root)
   */
  async searchCategories(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<CategoryDocument>> {
    await this.ensureInitialized();
    return this.provider_.search<CategoryDocument>(INDEX_NAMES.CATEGORIES, query, {
      facets: ['depth', 'is_active', 'parent_category_id'],
      ...options,
    });
  }

  /**
   * Get categories by parent
   *
   * Retrieves child categories of a given parent for navigation trees.
   * Pass null for parent_category_id to get root categories.
   */
  async getCategoriesByParent(
    parentCategoryId: string | null,
    options: SearchOptions = {}
  ): Promise<SearchResult<CategoryDocument>> {
    await this.ensureInitialized();

    const filter = parentCategoryId === null
      ? 'parent_category_id IS NULL'
      : `parent_category_id = "${parentCategoryId}"`;

    return this.provider_.search<CategoryDocument>(INDEX_NAMES.CATEGORIES, '', {
      filters: filter,
      sort: ['rank:asc', 'name:asc'],
      ...options,
    });
  }

  /**
   * Get category hierarchy (breadcrumb)
   *
   * Returns a category and all its ancestors for breadcrumb navigation.
   */
  async getCategoryWithAncestors(
    categoryId: string
  ): Promise<CategoryDocument | null> {
    await this.ensureInitialized();

    const result = await this.provider_.search<CategoryDocument>(INDEX_NAMES.CATEGORIES, '', {
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
   *
   * Includes filtering by:
   * - is_active: Filter active/inactive marques
   * - country: Filter by country of origin
   * - rank: Filter/sort by priority rank
   */
  async searchMarques(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<MarqueDocument>> {
    await this.ensureInitialized();
    return this.provider_.search<MarqueDocument>(INDEX_NAMES.MARQUES, query, {
      facets: ['is_active', 'country'],
      ...options,
    });
  }

  /**
   * Get active marques sorted by rank
   *
   * Returns marques that are active, sorted by rank descending.
   */
  async getActiveMarques(
    options: SearchOptions = {}
  ): Promise<SearchResult<MarqueDocument>> {
    await this.ensureInitialized();
    return this.provider_.search<MarqueDocument>(INDEX_NAMES.MARQUES, '', {
      filters: 'is_active = true',
      sort: ['rank:desc', 'name:asc'],
      ...options,
    });
  }

  /**
   * Multi-search across products, categories, and marques
   * Returns suggestions for autocomplete
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

    const results = await this.provider_.multiSearch([
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
          attributesToRetrieve: ['id', 'name', 'handle', 'product_count'],
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

    const result = await this.provider_.search<ProductDocument>(INDEX_NAMES.PRODUCTS, query, {
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
    await this.provider_.deleteAllDocuments(indexName);
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
    return this.provider_.getIndexStats(indexName);
  }

  /**
   * Rebuild all indexes (full reindex)
   */
  async rebuildIndexes(): Promise<{ products: number; categories: number }> {
    await this.ensureInitialized();

    // This would typically fetch all products and categories from the database
    // For now, we just return the structure
    this.logger_.warn('rebuildIndexes: Implement full reindex logic with database access');

    return { products: 0, categories: 0 };
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
