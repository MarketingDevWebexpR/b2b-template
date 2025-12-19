/**
 * Categories API Route
 *
 * Fetches all categories from App Search and builds a hierarchical tree structure.
 * Uses Edge runtime for optimal performance and caches results for 1 hour.
 *
 * GET /api/categories
 *
 * Response:
 * {
 *   tree: CategoryTreeNode[],      // Hierarchical structure
 *   flat: MeilisearchCategory[],   // Flat array sorted by depth/rank
 *   byId: Record<string, MeilisearchCategory>, // ID lookup map
 *   byHandle: Record<string, MeilisearchCategory>, // Handle lookup map
 *   total: number,                 // Total category count
 *   maxDepth: number               // Maximum tree depth
 * }
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { MeilisearchCategory, CategoryResponse } from '@/types/category';
import { buildCategoryResponse } from '@/lib/categories/build-tree';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

const APPSEARCH_ENDPOINT = process.env.APPSEARCH_ENDPOINT || '';
const APPSEARCH_PUBLIC_KEY = process.env.APPSEARCH_PUBLIC_KEY || '';
const APPSEARCH_ENGINE = process.env.APPSEARCH_ENGINE || 'dev-medusa-v2';

// Fallback to Meilisearch if App Search not configured
const MEILISEARCH_URL = process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const CATEGORIES_INDEX = process.env.MEILISEARCH_CATEGORIES_INDEX || 'bijoux_categories';

// ============================================================================
// App Search Types
// ============================================================================

interface AppSearchResult {
  id: { raw: string };
  doc_type: { raw: string };
  name: { raw: string };
  name_en?: { raw: string };
  handle: { raw: string };
  description?: { raw: string };
  icon?: { raw: string };
  image_url?: { raw: string };
  parent_category_id?: { raw: string };
  parent_category_ids?: { raw: string[] };
  full_path?: { raw: string };
  ancestor_names?: { raw: string[] };
  ancestor_handles?: { raw: string[] };
  depth?: { raw: string };
  is_active?: { raw: string };
  rank?: { raw: string };
  product_count?: { raw: string };
  metadata?: { raw: string };
  created_at?: { raw: string };
  updated_at?: { raw: string };
}

interface AppSearchResponse {
  meta: {
    page: { current: number; total_pages: number; total_results: number; size: number };
    request_id: string;
  };
  results: AppSearchResult[];
}

// ============================================================================
// App Search Client
// ============================================================================

/**
 * Fetch all categories from App Search
 */
async function fetchCategoriesFromAppSearch(): Promise<MeilisearchCategory[]> {
  const searchUrl = `${APPSEARCH_ENDPOINT}/api/as/v1/engines/${APPSEARCH_ENGINE}/search`;

  // Fetch all categories with pagination (App Search max 100 per page)
  const allCategories: MeilisearchCategory[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APPSEARCH_PUBLIC_KEY}`,
      },
      body: JSON.stringify({
        query: '',
        filters: { doc_type: 'categories' },
        result_fields: {
          id: { raw: {} },
          doc_type: { raw: {} },
          name: { raw: {} },
          name_en: { raw: {} },
          handle: { raw: {} },
          description: { raw: {} },
          icon: { raw: {} },
          image_url: { raw: {} },
          parent_category_id: { raw: {} },
          parent_category_ids: { raw: {} },
          full_path: { raw: {} },
          ancestor_names: { raw: {} },
          ancestor_handles: { raw: {} },
          depth: { raw: {} },
          is_active: { raw: {} },
          rank: { raw: {} },
          product_count: { raw: {} },
          metadata: { raw: {} },
          created_at: { raw: {} },
          updated_at: { raw: {} },
        },
        page: { current: currentPage, size: 100 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Categories API] App Search error: ${response.status}`, errorText);
      throw new Error(`App Search request failed: ${response.status}`);
    }

    const data: AppSearchResponse = await response.json();
    const categories = data.results.map(mapAppSearchResultToCategory);
    allCategories.push(...categories);

    // Check if there are more pages
    hasMorePages = currentPage < data.meta.page.total_pages;
    currentPage++;
  }

  // Sort by depth then rank
  return allCategories.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.rank - b.rank;
  });
}

/**
 * Map App Search result to MeilisearchCategory type
 */
function mapAppSearchResultToCategory(result: AppSearchResult): MeilisearchCategory {
  const fullPath = result.full_path?.raw || result.name?.raw || '';

  return {
    id: result.id?.raw || '',
    name: result.name?.raw || '',
    name_en: result.name_en?.raw || undefined,
    handle: result.handle?.raw || '',
    description: result.description?.raw || null,
    icon: result.icon?.raw || null,
    image_url: result.image_url?.raw || null,
    parent_category_id: result.parent_category_id?.raw || null,
    parent_category_ids: result.parent_category_ids?.raw || [],
    path: fullPath,
    full_path: fullPath,
    ancestor_names: result.ancestor_names?.raw || [],
    ancestor_handles: result.ancestor_handles?.raw || [],
    depth: parseInt(result.depth?.raw || '0', 10),
    is_active: result.is_active?.raw === 'true',
    rank: parseInt(result.rank?.raw || '0', 10),
    product_count: parseInt(result.product_count?.raw || '0', 10),
    metadata: result.metadata?.raw || undefined,
    created_at: result.created_at?.raw || undefined,
    updated_at: result.updated_at?.raw || undefined,
  };
}

// ============================================================================
// Meilisearch Fallback Client
// ============================================================================

interface MeilisearchSearchResponse {
  hits: Array<{
    id: string;
    name: string;
    handle: string;
    description: string | null;
    icon: string | null;
    image_url: string | null;
    parent_category_id: string | null;
    parent_category_ids: string[];
    path: string;
    ancestor_names: string[];
    ancestor_handles: string[];
    depth: number;
    is_active: boolean;
    rank: number;
    product_count: number;
    created_at?: string;
    updated_at?: string;
  }>;
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

/**
 * Fallback: Fetch categories from Meilisearch if App Search is not configured
 */
async function fetchCategoriesFromMeilisearch(): Promise<MeilisearchCategory[]> {
  const searchUrl = `${MEILISEARCH_URL}/indexes/${CATEGORIES_INDEX}/search`;

  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(MEILISEARCH_API_KEY && { Authorization: `Bearer ${MEILISEARCH_API_KEY}` }),
    },
    body: JSON.stringify({
      q: '',
      limit: 1000,
      sort: ['depth:asc', 'rank:asc'],
      filter: 'is_active = true',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Categories API] Meilisearch error: ${response.status}`, errorText);
    throw new Error(`Meilisearch request failed: ${response.status}`);
  }

  const data: MeilisearchSearchResponse = await response.json();
  return data.hits.map((hit) => ({
    id: hit.id,
    name: hit.name,
    handle: hit.handle,
    description: hit.description ?? null,
    icon: hit.icon ?? null,
    image_url: hit.image_url ?? null,
    parent_category_id: hit.parent_category_id ?? null,
    parent_category_ids: hit.parent_category_ids ?? [],
    path: hit.path ?? hit.name,
    ancestor_names: hit.ancestor_names ?? [],
    ancestor_handles: hit.ancestor_handles ?? [],
    depth: hit.depth ?? 0,
    is_active: hit.is_active ?? true,
    rank: hit.rank ?? 0,
    product_count: hit.product_count ?? 0,
    created_at: hit.created_at,
    updated_at: hit.updated_at,
  }));
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(): Promise<NextResponse<CategoryResponse | { error: string }>> {
  try {
    let categories: MeilisearchCategory[];

    // Use App Search if configured, otherwise fallback to Meilisearch
    if (APPSEARCH_ENDPOINT && APPSEARCH_PUBLIC_KEY) {
      console.log('[Categories API] Fetching from App Search');
      categories = await fetchCategoriesFromAppSearch();
    } else {
      console.log('[Categories API] Fetching from Meilisearch (fallback)');
      categories = await fetchCategoriesFromMeilisearch();
    }

    // Build complete response with tree structure
    const response = buildCategoryResponse(categories);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, max-age=3600',
        'Vercel-CDN-Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Categories API] Error:', error);

    // Return empty response structure on error
    const errorResponse: CategoryResponse = {
      tree: [],
      flat: [],
      byId: {},
      byHandle: {},
      total: 0,
      maxDepth: 0,
    };

    return NextResponse.json(
      { error: 'Failed to fetch categories', ...errorResponse },
      { status: 500 }
    );
  }
}
