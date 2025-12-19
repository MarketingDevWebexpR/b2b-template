/**
 * Catalog Categories Tree API Route
 *
 * Fetches all categories from App Search and builds a hierarchical tree structure.
 * Provides both tree and flat representations for different use cases.
 *
 * GET /api/catalog/categories/tree
 *
 * Response:
 * {
 *   tree: CategoryTreeNode[],
 *   flat: Category[],
 *   total: number
 * }
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type {
  IndexedCategory,
  CategoryTreeNode,
} from '@/types/category';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes

// App Search Configuration (V3)
const APPSEARCH_ENDPOINT = process.env.APPSEARCH_ENDPOINT || 'https://elasticsearch-webexpr.ent.europe-west1.gcp.cloud.es.io';
const APPSEARCH_PUBLIC_KEY = process.env.APPSEARCH_PUBLIC_KEY || 'search-smojpz6bs5oufe3g9krdupke';
const APPSEARCH_ENGINE = process.env.APPSEARCH_ENGINE || 'dev-medusa-v3';

// ============================================================================
// Types
// ============================================================================

/**
 * App Search v3 result structure for categories
 *
 * V3 schema fields for categories:
 * name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, is_active, doc_type, id
 *
 * Note: `category_lvl0-4` fields exist only on PRODUCTS, not on categories
 */
interface AppSearchResult {
  id: { raw: string };
  doc_type: { raw: string };
  name: { raw: string };
  handle: { raw: string };
  description?: { raw: string };
  // V3: Parent category reference
  parent_category_id?: { raw: string };
  // V3: URL path
  path?: { raw: string };
  // V3: Ancestor arrays for breadcrumb building
  ancestor_names?: { raw: string[] };
  ancestor_handles?: { raw: string[] };
  // V3: depth as number
  depth?: { raw: number };
  // V3: Ranking and counts
  rank?: { raw: number };
  product_count?: { raw: number };
  is_active?: { raw: string };
}

interface AppSearchResponse {
  meta: {
    page: { current: number; total_pages: number; total_results: number; size: number };
    request_id: string;
  };
  results: AppSearchResult[];
}

interface CategoryTreeResponse {
  tree: CategoryTreeNode[];
  flat: IndexedCategory[];
  total: number;
}

// ============================================================================
// App Search Client
// ============================================================================

/**
 * Fetch all categories from App Search
 */
async function fetchCategoriesFromAppSearch(): Promise<IndexedCategory[]> {
  const searchUrl = `${APPSEARCH_ENDPOINT}/api/as/v1/engines/${APPSEARCH_ENGINE}/search`;

  // Fetch all categories with pagination
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
        // Result fields - only include fields from App Search v3 categories schema
        // Categories: name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, is_active, doc_type, id
        result_fields: {
          id: { raw: {} },
          doc_type: { raw: {} },
          name: { raw: {} },
          handle: { raw: {} },
          description: { raw: {} },
          parent_category_id: { raw: {} },
          // V3 hierarchical fields
          path: { raw: {} },
          ancestor_names: { raw: {} },
          ancestor_handles: { raw: {} },
          depth: { raw: {} },
          rank: { raw: {} },
          product_count: { raw: {} },
          is_active: { raw: {} },
        },
        page: { current: currentPage, size: 100 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Categories Tree API] App Search error: ${response.status}`, errorText);
      throw new Error(`App Search request failed: ${response.status}`);
    }

    const data: AppSearchResponse = await response.json();
    const categories = data.results.map(mapAppSearchResultToCategory);
    allCategories.push(...categories);

    hasMorePages = currentPage < data.meta.page.total_pages;
    currentPage++;
  }

  return allCategories;
}

/**
 * Map App Search v3 result to IndexedCategory type
 *
 * V3 schema for categories uses:
 * - `doc_type: "categories"` (plural)
 * - `name`, `handle`, `description`
 * - `parent_category_id`: Reference to parent for tree building
 * - `path`: Display path (e.g., "Plomberie > Robinetterie")
 * - `ancestor_names`, `ancestor_handles`: Arrays for breadcrumbs
 * - `depth`, `rank`, `product_count`
 *
 * Note: `category_lvl0-4` exist only on products, NOT on categories
 *
 * @param result - Raw App Search result
 * @returns Mapped IndexedCategory for frontend consumption
 */
function mapAppSearchResultToCategory(result: AppSearchResult): IndexedCategory {
  // Build display path from path field or ancestor_names
  let displayPath = result.path?.raw || '';
  if (!displayPath && result.ancestor_names?.raw?.length) {
    displayPath = [...result.ancestor_names.raw, result.name?.raw || ''].join(' > ');
  } else if (!displayPath) {
    displayPath = result.name?.raw || '';
  }

  return {
    id: result.id?.raw || '',
    name: result.name?.raw || '',
    name_en: undefined, // name_en doesn't exist in v3 schema
    handle: result.handle?.raw || '',
    description: result.description?.raw || null,
    icon: null, // icon doesn't exist in v3 schema
    image_url: null, // image_url doesn't exist in v3 schema
    // V3: Parent reference for tree building
    parent_category_id: result.parent_category_id?.raw || null,
    parent_category_ids: [], // parent_category_ids doesn't exist in v3 schema
    // V3: Path for display
    path: displayPath,
    full_path: displayPath,
    // V3: Ancestor arrays for navigation
    ancestor_names: result.ancestor_names?.raw || [],
    ancestor_handles: result.ancestor_handles?.raw || [],
    // V3: Depth field - critical for tree building
    depth: typeof result.depth?.raw === 'number' ? result.depth.raw : 0,
    // V3: is_active field for category status
    is_active: result.is_active?.raw === 'true',
    rank: typeof result.rank?.raw === 'number' ? result.rank.raw : 0,
    product_count: typeof result.product_count?.raw === 'number' ? result.product_count.raw : 0,
    metadata: undefined, // metadata doesn't exist in v3 schema
    created_at: undefined, // created_at doesn't exist in v3 schema
    updated_at: undefined, // updated_at doesn't exist in v3 schema
  };
}


// ============================================================================
// Tree Building
// ============================================================================

/**
 * Build a hierarchical tree from a flat array of categories
 * Algorithm: O(n) performance using a map-based approach
 */
function buildCategoryTree(categories: IndexedCategory[]): CategoryTreeNode[] {
  const nodeMap = new Map<string, CategoryTreeNode>();

  for (const category of categories) {
    nodeMap.set(category.id, {
      ...category,
      children: [],
    });
  }

  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    const node = nodeMap.get(category.id);
    if (!node) continue;

    if (category.parent_category_id && nodeMap.has(category.parent_category_id)) {
      const parent = nodeMap.get(category.parent_category_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  sortTreeByRank(roots);
  return roots;
}

/**
 * Recursively sort tree nodes by rank
 */
function sortTreeByRank(nodes: CategoryTreeNode[]): void {
  nodes.sort((a, b) => a.rank - b.rank);

  for (const node of nodes) {
    if (node.children.length > 0) {
      sortTreeByRank(node.children);
    }
  }
}

/**
 * Sort flat list by depth and rank
 */
function sortFlatList(categories: IndexedCategory[]): IndexedCategory[] {
  return [...categories].sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.rank - b.rank;
  });
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(): Promise<NextResponse<CategoryTreeResponse | { error: string }>> {
  try {
    console.info('[Categories Tree API] Fetching from App Search');
    const categories = await fetchCategoriesFromAppSearch();

    console.info(`[Categories Tree API] Fetched ${categories.length} categories`);

    // Build tree structure
    const tree = buildCategoryTree(categories);

    // Sort flat list
    const flat = sortFlatList(categories);

    const response: CategoryTreeResponse = {
      tree,
      flat,
      total: categories.length,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('[Categories Tree API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch category tree',
        tree: [],
        flat: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
