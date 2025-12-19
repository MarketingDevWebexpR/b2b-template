/**
 * Search API Route (App Search v3)
 *
 * Direct integration with Elastic App Search v3 engine.
 * Supports multi-type search (products, categories, marques via doc_type filter),
 * hierarchical faceting using category_lvl0-4, and brand facets.
 *
 * GET /api/search?q=query&type=products|categories|marques|all&limit=20&offset=0...
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  APP_SEARCH_CONFIG,
  getAppSearchUrl,
  type SearchType,
  type DocType,
  type ProductHit,
  type CategoryHit,
  type MarqueHit,
  type AppSearchResponse,
  type FacetsResponse,
  transformProductHit,
  transformCategoryHit,
  transformMarqueHit,
  transformFacets,
  PRODUCT_RESULT_FIELDS,
  PRODUCT_SEARCH_FIELDS,
  PRODUCT_FACETS,
} from '@/lib/search/app-search-v3';

// Local type alias for the generic hit type used in this route
type AppSearchHit = ProductHit & CategoryHit & MarqueHit;

/**
 * Build App Search query with filters and facets
 */
function buildAppSearchQuery(
  query: string,
  options: {
    type?: string;
    limit?: number;
    offset?: number;
    facets?: boolean;
    category?: string;
    brand?: string;
    material?: string;
    tags?: string;
    inStock?: boolean;
    priceMin?: number;
    priceMax?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }
) {
  const { type = 'all', limit = 20, offset = 0, facets = true } = options;

  // Base query
  const searchQuery: Record<string, unknown> = {
    query: query || '',
    page: {
      size: limit,
      current: Math.floor(offset / limit) + 1,
    },
  };

  // Result fields to return - App Search v3 schema
  // Products: title (NOT name!), handle, description, thumbnail, images, price_min, price_max, brand_name, brand_slug, brand_id,
  //           category_lvl0-4, all_category_handles, category_names, category_ids, category_paths,
  //           has_stock, is_available, sku, barcode, tags, material, metadata, created_at, updated_at, doc_type, id
  // Categories: name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, is_active, doc_type, id
  // Marques: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
  searchQuery.result_fields = {
    id: { raw: {} },
    // Product: title (NOT name), Categories/Marques: name
    title: { raw: {} },
    name: { raw: {} },
    handle: { raw: {} },
    slug: { raw: {} },
    description: { raw: {}, snippet: { size: 200, fallback: true } },
    thumbnail: { raw: {} },
    images: { raw: {} },
    doc_type: { raw: {} },
    // Product fields
    brand_id: { raw: {} },
    brand_name: { raw: {} },
    brand_slug: { raw: {} },
    category_lvl0: { raw: {} },
    category_lvl1: { raw: {} },
    category_lvl2: { raw: {} },
    category_lvl3: { raw: {} },
    category_lvl4: { raw: {} },
    all_category_handles: { raw: {} },
    category_names: { raw: {} },
    category_ids: { raw: {} },
    category_paths: { raw: {} },
    price_min: { raw: {} },
    price_max: { raw: {} },
    has_stock: { raw: {} },
    is_available: { raw: {} },
    sku: { raw: {} },
    barcode: { raw: {} },
    tags: { raw: {} },
    material: { raw: {} },
    metadata: { raw: {} },
    created_at: { raw: {} },
    updated_at: { raw: {} },
    // Category fields
    parent_category_id: { raw: {} },
    path: { raw: {} },
    ancestor_handles: { raw: {} },
    ancestor_names: { raw: {} },
    depth: { raw: {} },
    rank: { raw: {} },
    product_count: { raw: {} },
    // Marque fields
    logo_url: { raw: {} },
    website_url: { raw: {} },
    is_active: { raw: {} },
    country: { raw: {} },
  };

  // Search fields with boosts - use 'title' for products, 'name' for categories/marques
  searchQuery.search_fields = {
    title: { weight: 10 },
    name: { weight: 10 },
    description: { weight: 3 },
    brand_name: { weight: 5 },
    sku: { weight: 8 },
    barcode: { weight: 8 },
    tags: { weight: 4 },
    category_lvl0: { weight: 4 },
    category_lvl1: { weight: 3 },
    category_lvl2: { weight: 2 },
  };

  // Filters
  const filters: Record<string, unknown> = {};

  // Filter by doc_type based on search type (V3: plural form)
  if (type === 'products') {
    filters.doc_type = 'products';
  } else if (type === 'categories') {
    filters.doc_type = 'categories';
  } else if (type === 'marques') {
    filters.doc_type = 'marques';
  }
  // For 'all', no doc_type filter is applied

  // Category filter - search by category name in category_lvl fields
  if (options.category) {
    // Use category_lvl0 for filtering since all_category_handles doesn't exist
    filters.category_lvl0 = options.category;
  }

  // Brand filter
  if (options.brand) {
    filters.brand_slug = options.brand;
  }

  // Material filter - v3 schema includes material field on products
  if (options.material) {
    filters.material = options.material;
  }

  // Stock filter (boolean as string)
  if (options.inStock !== undefined) {
    filters.has_stock = options.inStock ? 'true' : 'false';
  }

  // Price range filter
  if (options.priceMin !== undefined || options.priceMax !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (options.priceMin !== undefined) priceFilter.from = options.priceMin;
    if (options.priceMax !== undefined) priceFilter.to = options.priceMax;
    filters.price_min = priceFilter;
  }

  // Tags filter - v3 schema includes tags field on products
  if (options.tags) {
    filters.tags = options.tags;
  }

  if (Object.keys(filters).length > 0) {
    searchQuery.filters = { all: [filters] };
  }

  // Facets for hierarchical categories and brands - only use fields from v3 schema
  if (facets) {
    searchQuery.facets = {
      // Hierarchical category facets (InstantSearch style) - available on products
      category_lvl0: [{ type: 'value', size: 20 }],
      category_lvl1: [{ type: 'value', size: 20 }],
      category_lvl2: [{ type: 'value', size: 20 }],
      category_lvl3: [{ type: 'value', size: 10 }],
      // Brand facets
      brand_name: [{ type: 'value', size: 20 }],
      brand_slug: [{ type: 'value', size: 20 }],
      // Availability facets
      has_stock: [{ type: 'value', size: 2 }],
      is_available: [{ type: 'value', size: 2 }],
      doc_type: [{ type: 'value', size: 5 }],
    };
  }

  // Sorting
  if (options.sort) {
    const sortField = options.sort;
    const sortOrder = options.order || 'asc';
    searchQuery.sort = [{ [sortField]: sortOrder }];
  }

  return searchQuery;
}

// Note: Transform functions are imported from @/lib/search/app-search-v3
// They handle: transformProductHit, transformCategoryHit, transformMarqueHit, transformFacets

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startTime = Date.now();

  // Parse parameters
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const facets = searchParams.get('facets') !== 'false';
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const material = searchParams.get('material') || undefined;
  const tags = searchParams.get('tags') || undefined;
  const inStock = searchParams.get('in_stock') === 'true' ? true : undefined;
  const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined;
  const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined;
  const sort = searchParams.get('sort') || undefined;
  const order = (searchParams.get('order') as 'asc' | 'desc') || undefined;

  try {
    // Build App Search query
    const searchQuery = buildAppSearchQuery(query, {
      type,
      limit,
      offset,
      facets,
      category,
      brand,
      material,
      tags,
      inStock,
      priceMin,
      priceMax,
      sort,
      order,
    });

    // Call App Search API using shared configuration
    const appSearchUrl = getAppSearchUrl();

    const response = await fetch(appSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APP_SEARCH_CONFIG.publicKey}`,
      },
      body: JSON.stringify(searchQuery),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Search API] App Search error: ${response.status}`, errorText);
      return NextResponse.json(
        {
          query,
          error: 'Search service unavailable',
          hits: [],
          total: 0,
          processingTimeMs: Date.now() - startTime,
        },
        { status: response.status }
      );
    }

    const data: AppSearchResponse<AppSearchHit> = await response.json();
    const processingTimeMs = Date.now() - startTime;

    // Transform results based on type
    if (type === 'all') {
      // Group results by doc_type (V3: plural form)
      const products: ReturnType<typeof transformProductHit>[] = [];
      const categories: ReturnType<typeof transformCategoryHit>[] = [];
      const marques: ReturnType<typeof transformMarqueHit>[] = [];

      for (const hit of data.results) {
        const docType = hit.doc_type?.raw as DocType;
        if (docType === 'products') {
          products.push(transformProductHit(hit as ProductHit));
        } else if (docType === 'categories') {
          categories.push(transformCategoryHit(hit as CategoryHit));
        } else if (docType === 'marques') {
          marques.push(transformMarqueHit(hit as MarqueHit));
        } else {
          // Default to product if no doc_type
          products.push(transformProductHit(hit as ProductHit));
        }
      }

      return NextResponse.json({
        query,
        type: 'all',
        products: {
          hits: products,
          total: products.length,
          processingTimeMs,
        },
        categories: {
          hits: categories,
          total: categories.length,
          processingTimeMs,
        },
        marques: {
          hits: marques,
          total: marques.length,
          processingTimeMs,
        },
        meta: {
          totalResults: data.meta.page.total_results,
          currentPage: data.meta.page.current,
          totalPages: data.meta.page.total_pages,
        },
        facetDistribution: transformFacets(data.facets, type as SearchType),
        processingTimeMs,
      });
    }

    // Single type response
    let hits: unknown[] = [];
    if (type === 'products') {
      hits = data.results.map((hit) => transformProductHit(hit as ProductHit));
    } else if (type === 'categories') {
      hits = data.results.map((hit) => transformCategoryHit(hit as CategoryHit));
    } else if (type === 'marques') {
      hits = data.results.map((hit) => transformMarqueHit(hit as MarqueHit));
    }

    return NextResponse.json({
      query,
      type,
      hits,
      total: data.meta.page.total_results,
      limit,
      offset,
      processingTimeMs,
      facetDistribution: facets
        ? transformFacets(data.facets, type as SearchType)
        : undefined,
    });
  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      {
        query,
        error: 'Search request failed',
        hits: [],
        total: 0,
        processingTimeMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
