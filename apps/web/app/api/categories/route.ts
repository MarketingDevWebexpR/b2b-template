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
 *   flat: IndexedCategory[],   // Flat array sorted by depth/rank
 *   byId: Record<string, IndexedCategory>, // ID lookup map
 *   byHandle: Record<string, IndexedCategory>, // Handle lookup map
 *   total: number,                 // Total category count
 *   maxDepth: number               // Maximum tree depth
 * }
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { IndexedCategory, CategoryResponse } from '@/types/category';
import { buildCategoryResponse } from '@/lib/categories/build-tree';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

const APPSEARCH_ENDPOINT = process.env.APPSEARCH_ENDPOINT || 'https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io';
const APPSEARCH_PUBLIC_KEY = process.env.APPSEARCH_PUBLIC_KEY || 'search-smojpz6bs5oufe3g9krdupke';
const APPSEARCH_ENGINE = process.env.APPSEARCH_ENGINE || 'dev-medusa-v3';

// ============================================================================
// App Search Types
// ============================================================================

/**
 * App Search v3 result structure for categories
 *
 * V3 schema:
 * - `doc_type` is "categories" (plural)
 * - `path`: URL path (e.g., "/plomberie/robinetterie/mitigeurs")
 * - `depth`: Hierarchy depth (0-4)
 * - `ancestor_handles`: Array of parent handles for breadcrumbs
 *
 * Note: `category_lvl0-4` fields exist only on PRODUCTS, not on categories
 */
interface AppSearchResult {
  id: { raw: string };
  doc_type: { raw: string };
  name: { raw: string };
  name_en?: { raw: string };
  handle: { raw: string };
  description?: { raw: string };
  icon?: { raw: string };
  image_url?: { raw: string };
  // V3: Parent category reference
  parent_category_id?: { raw: string };
  parent_category_ids?: { raw: string[] };
  // V3: URL path (e.g., "/plomberie/robinetterie")
  path?: { raw: string };
  full_path?: { raw: string };
  // V3: Ancestor arrays for breadcrumb building
  ancestor_names?: { raw: string[] };
  ancestor_handles?: { raw: string[] };
  // V3: InstantSearch-style hierarchical category levels
  // These are ">" separated strings, e.g., "Plomberie > Robinetterie > Mitigeurs"
  category_lvl0?: { raw: string };
  category_lvl1?: { raw: string };
  category_lvl2?: { raw: string };
  category_lvl3?: { raw: string };
  category_lvl4?: { raw: string };
  // V3: All category handles for hierarchical filtering
  all_category_handles?: { raw: string[] };
  // V3: depth as string (will be parsed to number)
  depth?: { raw: string };
  // V3: Boolean fields as strings ("true"/"false")
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
async function fetchCategoriesFromAppSearch(): Promise<IndexedCategory[]> {
  const searchUrl = `${APPSEARCH_ENDPOINT}/api/as/v1/engines/${APPSEARCH_ENGINE}/search`;

  // Fetch all categories with pagination (App Search max 100 per page)
  const allCategories: IndexedCategory[] = [];
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
        // V3: doc_type is "categories" (plural)
        filters: { doc_type: 'categories' },
        result_fields: {
          id: { raw: {} },
          doc_type: { raw: {} },
          name: { raw: {} },
          handle: { raw: {} },
          description: { raw: {} },
          icon: { raw: {} },
          image_url: { raw: {} },
          parent_category_id: { raw: {} },
          parent_category_ids: { raw: {} },
          // V3 hierarchical fields
          path: { raw: {} },
          ancestor_names: { raw: {} },
          ancestor_handles: { raw: {} },
          depth: { raw: {} },
          is_active: { raw: {} },
          rank: { raw: {} },
          product_count: { raw: {} },
          metadata: { raw: {} },
          created_at: { raw: {} },
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
 * Map App Search v3 result to IndexedCategory type
 *
 * V3 schema includes:
 * - `doc_type: "categories"` (plural)
 * - `path`: URL path (e.g., "/plomberie/robinetterie")
 * - `depth`: Hierarchy level (0-4)
 * - `parent_category_id`: Reference to parent
 * - `ancestor_handles`: Array of parent handles for breadcrumbs
 *
 * Note: `category_lvl0-4` exist only on products, not on categories
 *
 * @param result - Raw App Search result
 * @returns Mapped IndexedCategory for frontend consumption
 */
function mapAppSearchResultToCategory(result: AppSearchResult): IndexedCategory {
  return {
    id: result.id?.raw || '',
    name: result.name?.raw || '',
    handle: result.handle?.raw || '',
    description: result.description?.raw || null,
    icon: result.icon?.raw || null,
    image_url: result.image_url?.raw || null,
    // V3: Parent reference for tree building
    parent_category_id: result.parent_category_id?.raw || null,
    parent_category_ids: result.parent_category_ids?.raw || [],
    // V3: Path is the display path (e.g., "Outillage > Électroportatif > Visseuses à Chocs")
    path: result.path?.raw || result.name?.raw || '',
    // V3: Ancestor arrays for navigation
    ancestor_names: result.ancestor_names?.raw || [],
    ancestor_handles: result.ancestor_handles?.raw || [],
    // V3: Depth field (0-4) - critical for tree building
    depth: parseInt(result.depth?.raw || '0', 10),
    is_active: result.is_active?.raw === 'true',
    rank: parseInt(result.rank?.raw || '0', 10),
    product_count: parseInt(result.product_count?.raw || '0', 10),
    metadata: result.metadata?.raw || undefined,
    created_at: result.created_at?.raw || undefined,
  };
}

/**
 * Build display path from V3 category_lvl fields
 *
 * V3 indexes categories with InstantSearch-style hierarchical fields:
 * - category_lvl0: "Plomberie"
 * - category_lvl1: "Plomberie > Robinetterie"
 * - category_lvl2: "Plomberie > Robinetterie > Mitigeurs"
 *
 * This function returns the deepest level as the display path.
 *
 * @param result - App Search result with category_lvl fields
 * @returns Display path string or empty string
 */
function buildDisplayPathFromLevels(result: AppSearchResult): string {
  // Return the deepest available level (most specific path)
  if (result.category_lvl4?.raw) return result.category_lvl4.raw;
  if (result.category_lvl3?.raw) return result.category_lvl3.raw;
  if (result.category_lvl2?.raw) return result.category_lvl2.raw;
  if (result.category_lvl1?.raw) return result.category_lvl1.raw;
  if (result.category_lvl0?.raw) return result.category_lvl0.raw;
  return '';
}


// ============================================================================
// Route Handler
// ============================================================================

export async function GET(): Promise<NextResponse<CategoryResponse | { error: string }>> {
  try {
    console.log('[Categories API] Fetching from App Search');
    const categories = await fetchCategoriesFromAppSearch();

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
