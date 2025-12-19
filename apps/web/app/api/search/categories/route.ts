/**
 * Category Search API Route (App Search v3)
 *
 * Direct integration with Elastic App Search v3 engine for category search.
 * Filters by doc_type="categories" (plural) and returns categories with paths.
 *
 * Note: category_lvl0-4 fields exist only on PRODUCTS, not on categories.
 * Categories use: path, ancestor_names, ancestor_handles, depth fields.
 *
 * GET /api/search/categories?q=query&limit=5
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  APP_SEARCH_CONFIG,
  getAppSearchUrl,
} from '@/lib/search/app-search-v3';

// Types for App Search v3 category results
// Categories schema: name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, is_active, doc_type, id
interface AppSearchCategoryHit {
  id: { raw: string };
  name?: { raw: string };
  handle?: { raw: string };
  description?: { raw: string };
  doc_type?: { raw: string };
  // Category hierarchy fields
  path?: { raw: string };
  ancestor_names?: { raw: string[] };
  ancestor_handles?: { raw: string[] };
  // Category-specific fields
  depth?: { raw: number };
  rank?: { raw: number };
  product_count?: { raw: number };
  parent_category_id?: { raw: string };
  is_active?: { raw: string };
  _meta?: {
    score: number;
  };
}

interface AppSearchResponse {
  meta: {
    request_id: string;
    page: {
      current: number;
      total_pages: number;
      total_results: number;
      size: number;
    };
  };
  results: AppSearchCategoryHit[];
}

export interface CategorySuggestion {
  id: string;
  name: string;
  handle: string;
  path: string[];
  pathString: string;
  /** Full URL path for navigation (e.g., "electricite/led-e14") */
  fullPath: string;
  productCount: number;
  depth: number;
}

export interface CategorySuggestionsResponse {
  query: string;
  categories: CategorySuggestion[];
}

/**
 * Transform App Search category hit to CategorySuggestion format
 * Uses only fields from App Search v3 categories: name, handle, path, ancestor_names, ancestor_handles, depth, product_count
 */
function transformCategoryHit(hit: AppSearchCategoryHit): CategorySuggestion {
  const name = hit.name?.raw || '';
  const handle = hit.handle?.raw || '';

  // Build path array from path field or ancestor_names
  let pathArray: string[] = [name];
  let pathString = name;

  if (hit.path?.raw) {
    pathString = hit.path.raw;
    pathArray = pathString.split(' > ');
  } else if (hit.ancestor_names?.raw?.length) {
    // Build path from ancestor_names + current name
    pathArray = [...hit.ancestor_names.raw, name];
    pathString = pathArray.join(' > ');
  }

  // Build full URL path from ancestor_handles
  let fullPath = handle;
  if (hit.ancestor_handles?.raw?.length) {
    fullPath = [...hit.ancestor_handles.raw, handle].join('/');
  }

  return {
    id: hit.id?.raw || '',
    name,
    handle,
    path: pathArray,
    pathString,
    fullPath,
    productCount: hit.product_count?.raw ?? 0,
    depth: hit.depth?.raw ?? Math.max(0, pathArray.length - 1),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  // Validate query
  if (!query || query.length < 2) {
    return NextResponse.json({
      query,
      categories: [],
    });
  }

  try {
    // Build App Search query for categories
    const searchQuery = {
      query,
      page: {
        size: limit,
        current: 1,
      },
      // Filter by doc_type = categories (V3: plural form)
      filters: {
        all: [{ doc_type: 'categories' }],
      },
      // Result fields - only include fields from App Search v3 categories schema
      // Categories: name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, is_active, doc_type, id
      result_fields: {
        id: { raw: {} },
        name: { raw: {} },
        handle: { raw: {} },
        description: { raw: {} },
        doc_type: { raw: {} },
        // Category hierarchy fields
        path: { raw: {} },
        ancestor_names: { raw: {} },
        ancestor_handles: { raw: {} },
        // Category specific
        depth: { raw: {} },
        rank: { raw: {} },
        product_count: { raw: {} },
        parent_category_id: { raw: {} },
        is_active: { raw: {} },
      },
      // Search fields - only use fields that exist in schema
      search_fields: {
        name: { weight: 10 },
        path: { weight: 5 },
        description: { weight: 2 },
      },
    };

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
      console.error(
        `[Category Search API] App Search error: ${response.status}`,
        errorText
      );
      return NextResponse.json({
        query,
        categories: [],
      });
    }

    const data: AppSearchResponse = await response.json();

    // Transform results to CategorySuggestion format (V3: plural form)
    const categories = data.results
      .filter((hit) => hit.doc_type?.raw === 'categories')
      .map(transformCategoryHit);

    return NextResponse.json({
      query,
      categories,
    });
  } catch (error) {
    console.error('[Category Search API] Error:', error);
    return NextResponse.json({
      query,
      categories: [],
    });
  }
}
