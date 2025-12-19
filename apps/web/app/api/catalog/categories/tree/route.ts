/**
 * Catalog Categories Tree API Route
 *
 * Fetches all categories from App Search and builds a hierarchical tree structure.
 * Provides both tree and flat representations for different use cases.
 * Falls back to Meilisearch if App Search is not configured.
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
  MeilisearchCategory,
  CategoryTreeNode,
  MeilisearchCategoryHit,
} from '@/types/category';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes

// App Search Configuration (Primary)
const APPSEARCH_ENDPOINT = process.env.APPSEARCH_ENDPOINT || '';
const APPSEARCH_PUBLIC_KEY = process.env.APPSEARCH_PUBLIC_KEY || '';
const APPSEARCH_ENGINE = process.env.APPSEARCH_ENGINE || 'dev-medusa-v2';

// Meilisearch Configuration (Fallback)
const MEILISEARCH_URL =
  process.env.NEXT_PUBLIC_MEILISEARCH_URL ||
  process.env.MEILISEARCH_URL ||
  'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const CATEGORIES_INDEX =
  process.env.MEILISEARCH_CATEGORIES_INDEX || 'bijoux_categories';

// ============================================================================
// Types
// ============================================================================

interface MeilisearchSearchResponse {
  hits: MeilisearchCategoryHit[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

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

interface CategoryTreeResponse {
  tree: CategoryTreeNode[];
  flat: MeilisearchCategory[];
  total: number;
}

// ============================================================================
// App Search Client
// ============================================================================

/**
 * Fetch all categories from App Search
 */
async function fetchCategoriesFromAppSearch(): Promise<MeilisearchCategory[]> {
  const searchUrl = `${APPSEARCH_ENDPOINT}/api/as/v1/engines/${APPSEARCH_ENGINE}/search`;

  // Fetch all categories with pagination
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

/**
 * Fallback: Fetch categories from Meilisearch
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
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Categories Tree API] Meilisearch error: ${response.status}`, errorText);
    throw new Error(`Meilisearch request failed: ${response.status}`);
  }

  const data: MeilisearchSearchResponse = await response.json();
  return data.hits.map(mapHitToCategory);
}

/**
 * Map Meilisearch hit to MeilisearchCategory type
 */
function mapHitToCategory(hit: MeilisearchCategoryHit): MeilisearchCategory {
  return {
    id: hit.id,
    name: hit.name,
    name_en: hit.name_en,
    handle: hit.handle,
    description: hit.description ?? null,
    icon: hit.icon ?? null,
    image_url: hit.image_url ?? null,
    parent_category_id: hit.parent_category_id ?? null,
    parent_category_ids: hit.parent_category_ids ?? [],
    path: hit.path ?? hit.name,
    full_path: hit.full_path ?? hit.path ?? hit.name,
    ancestor_names: hit.ancestor_names ?? [],
    ancestor_handles: hit.ancestor_handles ?? [],
    depth: hit.depth ?? 0,
    is_active: hit.is_active ?? true,
    rank: hit.rank ?? 0,
    product_count: hit.product_count ?? 0,
    metadata: hit.metadata,
    created_at: hit.created_at,
    updated_at: hit.updated_at,
  };
}

// ============================================================================
// Tree Building
// ============================================================================

/**
 * Build a hierarchical tree from a flat array of categories
 * Algorithm: O(n) performance using a map-based approach
 */
function buildCategoryTree(categories: MeilisearchCategory[]): CategoryTreeNode[] {
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
function sortFlatList(categories: MeilisearchCategory[]): MeilisearchCategory[] {
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
    let categories: MeilisearchCategory[];

    // Use App Search if configured, otherwise fallback to Meilisearch
    if (APPSEARCH_ENDPOINT && APPSEARCH_PUBLIC_KEY) {
      console.info('[Categories Tree API] Fetching from App Search');
      categories = await fetchCategoriesFromAppSearch();
    } else {
      console.info('[Categories Tree API] Fetching from Meilisearch (fallback)');
      categories = await fetchCategoriesFromMeilisearch();
    }

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
