/**
 * Category Search API Route (Proxy)
 *
 * Proxies category search requests to the Medusa backend.
 * Returns categories matching the search query with their full path.
 *
 * GET /api/search/categories?q=query&limit=5
 */

import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = searchParams.get('limit') || '5';

  // Validate query
  if (!query || query.length < 2) {
    return NextResponse.json({
      query,
      categories: [],
    });
  }

  try {
    // Search categories via Medusa backend
    const url = `${MEDUSA_BACKEND_URL}/search?q=${encodeURIComponent(query)}&type=categories&limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Allow caching for 60 seconds
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`[Category Search Proxy] Error from Medusa: ${response.status}`);
      return NextResponse.json({
        query,
        categories: [],
      });
    }

    const data = await response.json();

    // Transform Medusa category results to our CategorySuggestion format
    const categories: CategorySuggestion[] = (data.hits || []).map((cat: {
      id: string;
      name: string;
      handle: string;
      parent_category_id: string | null;
      depth: number;
      product_count?: number;
      metadata?: Record<string, unknown>;
      path?: string; // Full path string from Meilisearch (e.g., "Bijoux > Bagues > Or")
      ancestor_names?: string[];
      ancestor_handles?: string[]; // Handles of ancestor categories
    }) => {
      // Build path from the path string or ancestor_names
      let pathArray: string[] = [cat.name];
      let pathString = cat.name;

      if (cat.path && cat.path.includes(' > ')) {
        // path is the full hierarchy string "Bijoux > Bagues > Or"
        pathArray = cat.path.split(' > ');
        pathString = cat.path;
      } else if (cat.ancestor_names && cat.ancestor_names.length > 0) {
        // ancestor_names contains parent names from root to immediate parent
        pathArray = [...cat.ancestor_names, cat.name];
        pathString = pathArray.join(' > ');
      }

      // Build full URL path from ancestor_handles if available
      let fullPath = cat.handle;
      if (cat.ancestor_handles && cat.ancestor_handles.length > 0) {
        fullPath = [...cat.ancestor_handles, cat.handle].join('/');
      }

      return {
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
        path: pathArray,
        pathString: pathString,
        fullPath: fullPath,
        productCount: cat.product_count || 0,
        depth: pathArray.length - 1,
      };
    });

    return NextResponse.json({
      query,
      categories,
    });
  } catch (error) {
    console.error('[Category Search Proxy] Error:', error);
    return NextResponse.json({
      query,
      categories: [],
    });
  }
}
