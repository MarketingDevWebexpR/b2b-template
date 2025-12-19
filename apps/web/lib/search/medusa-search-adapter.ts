/**
 * Medusa Search Adapter (v3)
 *
 * Adapts the Search API v3 responses to the SearchContext format.
 * Provides a bridge between the backend API and the frontend state management.
 *
 * Updated for App Search v3 schema:
 * - Hierarchical categories (category_lvl0-4, category_paths)
 * - Brand fields (brand_name, brand_slug, brand_id)
 * - Boolean strings (has_stock, is_available as "true"/"false")
 * - doc_type field for multi-type search
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
  type ProductSuggestion,
} from './medusa-search-client';
import {
  parseBooleanString as parseBoolV3,
} from './app-search-v3';
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
  /** Hierarchical category facets for InstantSearch-style refinement */
  hierarchicalFacets?: HierarchicalFacet[];
  processingTimeMs: number;
}

/** Hierarchical facet for category refinement (InstantSearch style) */
export interface HierarchicalFacet {
  name: string;
  attributes: string[]; // ['category_lvl0', 'category_lvl1', ...]
  separator: string;
  data: HierarchicalFacetValue[];
}

export interface HierarchicalFacetValue {
  name: string;
  path: string;
  count: number;
  isRefined: boolean;
  data?: HierarchicalFacetValue[];
}

export interface SearchFilters {
  categories?: string[];
  /** Hierarchical category path for filtering (e.g., "Plomberie > Robinetterie") */
  categoryPath?: string;
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
 * Updated for v3 schema with brand and category path support
 */
export function productToSuggestion(product: ProductSearchResult): SearchSuggestion {
  // Get category from v3 fields or fallback to legacy
  let category: string | undefined;

  // Try v3 category_paths first (array of paths like "Plomberie > Robinetterie")
  // ProductSearchResult may have additional v3 fields not in the base type
  const productWithV3 = product as ProductSearchResult & {
    category_paths?: string[];
  };
  if (productWithV3.category_paths?.length) {
    category = productWithV3.category_paths[0];
  } else if (product.categories?.[0]?.name) {
    category = product.categories[0].name;
  } else if (product.collection) {
    category = product.collection;
  }

  return {
    type: 'product' as SearchResultType,
    id: product.id,
    text: product.title,
    highlight: product.title,
    image: product.thumbnail ?? undefined,
    category,
    price: product.price_min ?? undefined,
    url: `/produit/${product.handle}`,
  };
}

/**
 * Convert CategorySearchResult to SearchSuggestion format
 * Updated for v3 schema with category path support
 */
export function categoryToSuggestion(category: CategorySearchResult): SearchSuggestion {
  // Get path from v3 fields
  // CategorySearchResult may have additional v3 fields not in the base type
  const categoryWithV3 = category as CategorySearchResult & {
    category_paths?: string[];
    path?: string;
  };

  const displayPath = categoryWithV3.category_paths?.[0] || categoryWithV3.path || category.name;

  return {
    type: 'category' as SearchResultType,
    id: category.id,
    text: category.name,
    highlight: displayPath,
    url: `/categorie/${category.handle}`,
  };
}

/**
 * Convert facet distribution to Facet array
 * Updated for v3 schema with hierarchical categories and brand fields
 */
export function adaptFacetDistribution(
  facetDistribution: Record<string, Record<string, number>> | undefined,
  selectedFilters: SearchFilters = {}
): Facet[] {
  if (!facetDistribution) return [];

  const facets: Facet[] = [];

  // Hierarchical categories facet - prefer category_lvl0 for top-level
  // Build combined categories from hierarchical levels
  const categoryValues: FacetValue[] = [];

  // Check for v3 hierarchical category facets
  if (facetDistribution['category_lvl0']) {
    for (const [value, count] of Object.entries(facetDistribution['category_lvl0'])) {
      categoryValues.push({
        value,
        label: value,
        count,
        selected: selectedFilters.categories?.includes(value) ?? false,
      });
    }
  }

  // Fallback to legacy categories.name
  if (categoryValues.length === 0 && facetDistribution['categories.name']) {
    for (const [value, count] of Object.entries(facetDistribution['categories.name'])) {
      categoryValues.push({
        value,
        label: value,
        count,
        selected: selectedFilters.categories?.includes(value) ?? false,
      });
    }
  }

  if (categoryValues.length > 0) {
    facets.push({
      id: 'category',
      name: 'Categories',
      type: 'checkbox',
      isExpanded: true,
      values: categoryValues
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
    });
  }

  // Brand facet - use v3 brand_name field
  const brandField = facetDistribution['brand_name'] || facetDistribution['brand'];
  if (brandField) {
    facets.push({
      id: 'brand',
      name: 'Marques',
      type: 'checkbox',
      isExpanded: true,
      values: Object.entries(brandField)
        .map(([value, count]) => ({
          value,
          label: value,
          count,
          selected: selectedFilters.brands?.includes(value) ?? false,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
    });
  }

  // Material facet
  if (facetDistribution['material']) {
    facets.push({
      id: 'material',
      name: 'Materiau',
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

  // Stock facet - v3 uses string "true"/"false"
  if (facetDistribution['has_stock']) {
    facets.push({
      id: 'stock',
      name: 'Disponibilite',
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
      ].filter(v => v.count > 0),
    });
  }

  return facets;
}

/**
 * Build hierarchical category facets for InstantSearch-style refinement
 * Uses category_lvl0-4 fields from v3 schema
 */
export function buildHierarchicalFacets(
  facetDistribution: Record<string, Record<string, number>> | undefined,
  selectedPath?: string
): HierarchicalFacet[] {
  if (!facetDistribution) return [];

  const levels: string[] = ['category_lvl0', 'category_lvl1', 'category_lvl2', 'category_lvl3', 'category_lvl4'];
  const hasHierarchy = levels.some(lvl => facetDistribution[lvl]);

  if (!hasHierarchy) return [];

  // Build tree from hierarchical levels
  const rootValues: HierarchicalFacetValue[] = [];

  // Level 0 is the root
  if (facetDistribution['category_lvl0']) {
    for (const [path, count] of Object.entries(facetDistribution['category_lvl0'])) {
      const parts = path.split(' > ');
      const name = parts[parts.length - 1];

      rootValues.push({
        name,
        path,
        count,
        isRefined: selectedPath === path || (selectedPath?.startsWith(path + ' > ') ?? false),
        data: buildChildFacets(facetDistribution, path, 1, selectedPath),
      });
    }
  }

  return [{
    name: 'categories',
    attributes: levels,
    separator: ' > ',
    data: rootValues.sort((a, b) => b.count - a.count),
  }];
}

/**
 * Build child facets recursively for hierarchical navigation
 */
function buildChildFacets(
  facetDistribution: Record<string, Record<string, number>>,
  parentPath: string,
  level: number,
  selectedPath?: string
): HierarchicalFacetValue[] | undefined {
  const levelKey = `category_lvl${level}`;
  const levelData = facetDistribution[levelKey];

  if (!levelData || level > 4) return undefined;

  const children: HierarchicalFacetValue[] = [];

  for (const [path, count] of Object.entries(levelData)) {
    // Only include direct children of parentPath
    if (path.startsWith(parentPath + ' > ')) {
      const parts = path.split(' > ');
      const name = parts[parts.length - 1];

      // Check if this is a direct child (not grandchild)
      const expectedParts = parentPath.split(' > ').length + 1;
      if (parts.length === expectedParts) {
        children.push({
          name,
          path,
          count,
          isRefined: selectedPath === path || (selectedPath?.startsWith(path + ' > ') ?? false),
          data: buildChildFacets(facetDistribution, path, level + 1, selectedPath),
        });
      }
    }
  }

  return children.length > 0 ? children.sort((a, b) => b.count - a.count) : undefined;
}

/**
 * Convert categories to tree structure
 * Updated for v3 schema with category_paths support
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

/**
 * Parse boolean string from v3 schema
 * Converts "true"/"false" strings to actual booleans
 * @deprecated Use parseBooleanString from app-search-v3.ts instead
 */
export function parseBooleanString(value: string | boolean | undefined | null): boolean {
  return parseBoolV3(value);
}

/**
 * Transform product result to handle v3 boolean strings
 */
export function normalizeProductResult(product: ProductSearchResult): ProductSearchResult {
  return {
    ...product,
    // Convert boolean strings to actual booleans
    // The API may return strings "true"/"false" that need normalization
    has_stock: parseBooleanString(product.has_stock as unknown as string | boolean),
    is_available: parseBooleanString(product.is_available as unknown as string | boolean),
  };
}

// ============================================================================
// Medusa Search Adapter Class
// ============================================================================

/**
 * Medusa Search Adapter
 *
 * Provides methods to search via the Medusa backend and adapt results
 * to the frontend SearchContext format.
 *
 * Updated for v3 schema support.
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

      // Normalize products to handle v3 boolean strings
      const normalizedProducts = multi.products.hits.map(normalizeProductResult);

      return {
        products: normalizedProducts,
        categories: multi.categories.hits,
        totalProducts: multi.products.total,
        totalCategories: multi.categories.total,
        facets: [],
        processingTimeMs: multi.products.processingTimeMs + multi.categories.processingTimeMs,
      };
    }

    // ProductSearchResponse
    const productResult = result as ProductSearchResponse;

    // Normalize products to handle v3 boolean strings
    const normalizedProducts = productResult.hits.map(normalizeProductResult);

    return {
      products: normalizedProducts,
      categories: [],
      totalProducts: productResult.total,
      totalCategories: 0,
      facets: adaptFacetDistribution(productResult.facetDistribution, options.filters),
      hierarchicalFacets: buildHierarchicalFacets(
        productResult.facetDistribution,
        options.filters?.categoryPath
      ),
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
    hierarchicalFacets?: HierarchicalFacet[];
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

    // Normalize products to handle v3 boolean strings
    const normalizedProducts = result.hits.map(normalizeProductResult);

    return {
      products: normalizedProducts,
      total: result.total,
      facets: adaptFacetDistribution(result.facetDistribution, options.filters),
      hierarchicalFacets: buildHierarchicalFacets(
        result.facetDistribution,
        options.filters?.categoryPath
      ),
      processingTimeMs: result.processingTimeMs,
    };
  }

  /**
   * Get search suggestions
   * Updated for v3 schema with category path and brand info
   */
  async getSuggestions(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
    const result = await this.client.getSuggestions(query, limit);

    return result.suggestions.map((s: ProductSuggestion) => {
      // v3 fields are now properly typed
      const categoryPath = s.category_path;
      const brandName = s.brand_name;

      // Build category display with brand if available
      let category: string | undefined = categoryPath ?? undefined;
      if (brandName && categoryPath) {
        category = `${brandName} - ${categoryPath}`;
      } else if (brandName) {
        category = brandName;
      }

      return {
        type: 'product' as SearchResultType,
        id: s.id,
        text: s.title,
        highlight: s.title,
        image: s.thumbnail ?? undefined,
        category,
        price: s.price_min ?? undefined,
        url: `/produit/${s.handle}`,
      };
    });
  }

  /**
   * Get all suggestions (products, categories, brands) in a single call
   * More efficient than calling separate endpoints
   */
  async getAllSuggestions(
    query: string,
    options: { products?: number; categories?: number; brands?: number } = {}
  ): Promise<{
    products: SearchSuggestion[];
    categories: SearchSuggestion[];
    brands: SearchSuggestion[];
  }> {
    const { products = 6, categories = 3, brands = 3 } = options;

    // Fetch all in parallel
    const [productResult, categoryResult, brandResult] = await Promise.all([
      this.client.getSuggestions(query, products),
      this.client.getCategorySuggestions(query, categories),
      this.client.getBrandSuggestions(query, brands),
    ]);

    // Transform products
    const productSuggestions = productResult.suggestions.map((s: ProductSuggestion) => {
      const categoryPath = s.category_path;
      const brandName = s.brand_name;
      let category: string | undefined = categoryPath ?? undefined;
      if (brandName && categoryPath) {
        category = `${brandName} - ${categoryPath}`;
      } else if (brandName) {
        category = brandName;
      }

      return {
        type: 'product' as SearchResultType,
        id: s.id,
        text: s.title,
        highlight: s.title,
        image: s.thumbnail ?? undefined,
        category,
        price: s.price_min ?? undefined,
        url: `/produit/${s.handle}`,
      };
    });

    // Transform categories
    const categorySuggestions = categoryResult.categories.map((c) => ({
      type: 'category' as SearchResultType,
      id: c.id,
      text: c.name,
      highlight: c.pathString || c.name,
      url: `/categorie/${c.fullPath || c.handle}`,
    }));

    // Transform brands
    const brandSuggestions = brandResult.marques.map((b) => ({
      type: 'brand' as SearchResultType,
      id: b.id,
      text: b.name,
      highlight: b.name,
      image: b.logo_url ?? undefined,
      url: `/marques/${b.slug}`,
    }));

    return {
      products: productSuggestions,
      categories: categorySuggestions,
      brands: brandSuggestions,
    };
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

    return productToSuggestion(normalizeProductResult(result.hits[0]));
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
