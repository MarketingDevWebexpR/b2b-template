/**
 * Medusa Search Adapter
 *
 * Adapts the Medusa Search API responses to the SearchContext format.
 * Provides a bridge between the backend API and the frontend state management.
 *
 * @packageDocumentation
 */

import {
  getMedusaSearchClient,
  type ProductSearchResult,
  type CategorySearchResult,
  type SearchOptions,
  type ProductSearchResponse,
  type MultiSearchResponse,
} from './medusa-search-client';
import type {
  SearchSuggestion,
  Facet,
  FacetValue,
  CategoryNode,
  SearchResultType,
} from '@/contexts/SearchContext';

// ============================================================================
// Types
// ============================================================================

export interface AdaptedSearchResult {
  products: ProductSearchResult[];
  categories: CategorySearchResult[];
  totalProducts: number;
  totalCategories: number;
  facets: Facet[];
  processingTimeMs: number;
}

export interface SearchFilters {
  categories?: string[];
  brands?: string[];
  materials?: string[];
  tags?: string[];
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
}

// ============================================================================
// Adapter Functions
// ============================================================================

/**
 * Convert ProductSearchResult to SearchSuggestion format
 */
export function productToSuggestion(product: ProductSearchResult): SearchSuggestion {
  return {
    type: 'product' as SearchResultType,
    id: product.id,
    text: product.title,
    highlight: product.title,
    image: product.thumbnail ?? undefined,
    category: product.categories?.[0]?.name ?? product.collection ?? undefined,
    price: product.price_min ?? undefined,
    url: `/products/${product.handle}`,
  };
}

/**
 * Convert CategorySearchResult to SearchSuggestion format
 */
export function categoryToSuggestion(category: CategorySearchResult): SearchSuggestion {
  return {
    type: 'category' as SearchResultType,
    id: category.id,
    text: category.name,
    url: `/categorie/${category.handle}`,
  };
}

/**
 * Convert facet distribution to Facet array
 */
export function adaptFacetDistribution(
  facetDistribution: Record<string, Record<string, number>> | undefined,
  selectedFilters: SearchFilters = {}
): Facet[] {
  if (!facetDistribution) return [];

  const facets: Facet[] = [];

  // Categories facet
  if (facetDistribution['categories.name']) {
    facets.push({
      id: 'category',
      name: 'Catégories',
      type: 'checkbox',
      isExpanded: true,
      values: Object.entries(facetDistribution['categories.name'])
        .map(([value, count]) => ({
          value,
          label: value,
          count,
          selected: selectedFilters.categories?.includes(value) ?? false,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    });
  }

  // Brand facet
  if (facetDistribution['brand']) {
    facets.push({
      id: 'brand',
      name: 'Marques',
      type: 'checkbox',
      isExpanded: true,
      values: Object.entries(facetDistribution['brand'])
        .map(([value, count]) => ({
          value,
          label: value,
          count,
          selected: selectedFilters.brands?.includes(value) ?? false,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    });
  }

  // Material facet
  if (facetDistribution['material']) {
    facets.push({
      id: 'material',
      name: 'Matériau',
      type: 'checkbox',
      isExpanded: true,
      values: Object.entries(facetDistribution['material'])
        .map(([value, count]) => ({
          value,
          label: value,
          count,
          selected: selectedFilters.materials?.includes(value) ?? false,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    });
  }

  // Tags facet
  if (facetDistribution['tags']) {
    facets.push({
      id: 'tags',
      name: 'Tags',
      type: 'checkbox',
      isExpanded: false,
      values: Object.entries(facetDistribution['tags'])
        .map(([value, count]) => ({
          value,
          label: value,
          count,
          selected: selectedFilters.tags?.includes(value) ?? false,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    });
  }

  // Stock facet
  if (facetDistribution['has_stock']) {
    facets.push({
      id: 'stock',
      name: 'Disponibilité',
      type: 'checkbox',
      isExpanded: true,
      values: [
        {
          value: 'true',
          label: 'En stock',
          count: facetDistribution['has_stock']['true'] ?? 0,
          selected: selectedFilters.inStock === true,
        },
        {
          value: 'false',
          label: 'Sur commande',
          count: facetDistribution['has_stock']['false'] ?? 0,
          selected: selectedFilters.inStock === false,
        },
      ],
    });
  }

  return facets;
}

/**
 * Convert categories to tree structure
 */
export function buildCategoryTree(categories: CategorySearchResult[]): CategoryNode[] {
  // Group by parent
  const byParent: Record<string, CategorySearchResult[]> = {};
  const roots: CategorySearchResult[] = [];

  for (const cat of categories) {
    if (cat.parent_category_id) {
      if (!byParent[cat.parent_category_id]) {
        byParent[cat.parent_category_id] = [];
      }
      byParent[cat.parent_category_id].push(cat);
    } else {
      roots.push(cat);
    }
  }

  // Build tree recursively
  function buildNode(cat: CategorySearchResult, level: number): CategoryNode {
    const children = byParent[cat.id] ?? [];
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.handle,
      count: cat.product_count,
      level,
      isExpanded: level === 0,
      children: children.length > 0
        ? children
            .sort((a, b) => a.rank - b.rank)
            .map((c) => buildNode(c, level + 1))
        : undefined,
    };
  }

  return roots
    .sort((a, b) => a.rank - b.rank)
    .map((cat) => buildNode(cat, 0));
}

// ============================================================================
// Medusa Search Adapter Class
// ============================================================================

/**
 * Medusa Search Adapter
 *
 * Provides methods to search via the Medusa backend and adapt results
 * to the frontend SearchContext format.
 */
export class MedusaSearchAdapter {
  private client = getMedusaSearchClient();

  /**
   * Execute search and adapt results
   */
  async search(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      filters?: SearchFilters;
      facets?: boolean;
      sort?: string;
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<AdaptedSearchResult> {
    const searchOptions: SearchOptions = {
      type: 'all',
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
      facets: options.facets ?? true,
      sort: options.sort,
      order: options.order,
    };

    // Apply filters
    if (options.filters) {
      const f = options.filters;
      if (f.categories?.length) searchOptions.category = f.categories[0];
      if (f.brands?.length) searchOptions.brand = f.brands[0];
      if (f.materials?.length) searchOptions.material = f.materials[0];
      if (f.tags?.length) searchOptions.tags = f.tags.join(',');
      if (f.inStock !== undefined) searchOptions.inStock = f.inStock;
      if (f.priceMin !== undefined) searchOptions.priceMin = f.priceMin;
      if (f.priceMax !== undefined) searchOptions.priceMax = f.priceMax;
    }

    const result = await this.client.search(query, searchOptions);

    if ('products' in result) {
      // MultiSearchResponse
      const multi = result as MultiSearchResponse;
      return {
        products: multi.products.hits,
        categories: multi.categories.hits,
        totalProducts: multi.products.total,
        totalCategories: multi.categories.total,
        facets: [],
        processingTimeMs: multi.products.processingTimeMs + multi.categories.processingTimeMs,
      };
    }

    // ProductSearchResponse
    const productResult = result as ProductSearchResponse;
    return {
      products: productResult.hits,
      categories: [],
      totalProducts: productResult.total,
      totalCategories: 0,
      facets: adaptFacetDistribution(productResult.facetDistribution, options.filters),
      processingTimeMs: productResult.processingTimeMs,
    };
  }

  /**
   * Search products only with full faceting
   */
  async searchProducts(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      filters?: SearchFilters;
      sort?: string;
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    products: ProductSearchResult[];
    total: number;
    facets: Facet[];
    processingTimeMs: number;
  }> {
    const searchOptions: SearchOptions = {
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
      facets: true,
      sort: options.sort,
      order: options.order,
    };

    // Apply filters
    if (options.filters) {
      const f = options.filters;
      if (f.categories?.length) searchOptions.category = f.categories[0];
      if (f.brands?.length) searchOptions.brand = f.brands[0];
      if (f.materials?.length) searchOptions.material = f.materials[0];
      if (f.tags?.length) searchOptions.tags = f.tags.join(',');
      if (f.inStock !== undefined) searchOptions.inStock = f.inStock;
      if (f.priceMin !== undefined) searchOptions.priceMin = f.priceMin;
      if (f.priceMax !== undefined) searchOptions.priceMax = f.priceMax;
    }

    const result = await this.client.searchProducts(query, searchOptions);

    return {
      products: result.hits,
      total: result.total,
      facets: adaptFacetDistribution(result.facetDistribution, options.filters),
      processingTimeMs: result.processingTimeMs,
    };
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
    const result = await this.client.getSuggestions(query, limit);

    return result.suggestions.map((s) => ({
      type: 'product' as SearchResultType,
      id: s.id,
      text: s.title,
      highlight: s.title,
      image: s.thumbnail ?? undefined,
      price: s.price_min ?? undefined,
      url: `/products/${s.handle}`,
    }));
  }

  /**
   * Get categories for navigation
   */
  async getCategories(query: string = ''): Promise<CategoryNode[]> {
    const result = await this.client.searchCategories(query, { limit: 100 });
    return buildCategoryTree(result.hits);
  }

  /**
   * Quick search by SKU/EAN
   */
  async quickSearch(code: string): Promise<SearchSuggestion | null> {
    const result = await this.client.searchProducts(code, { limit: 1 });

    if (result.hits.length === 0) return null;

    return productToSuggestion(result.hits[0]);
  }

  /**
   * Check if search is healthy
   */
  async isHealthy(): Promise<boolean> {
    return this.client.isHealthy();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let adapterInstance: MedusaSearchAdapter | null = null;

/**
 * Get the singleton adapter instance
 */
export function getMedusaSearchAdapter(): MedusaSearchAdapter {
  if (!adapterInstance) {
    adapterInstance = new MedusaSearchAdapter();
  }
  return adapterInstance;
}

export default MedusaSearchAdapter;
