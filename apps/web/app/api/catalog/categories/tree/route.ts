/**
 * Catalog Categories Tree API Route
 *
 * Fetches all categories from Meilisearch and builds a hierarchical tree structure.
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
  MeilisearchCategory,
  CategoryTreeNode,
  MeilisearchCategoryHit,
} from '@/types/category';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes

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

interface CategoryTreeResponse {
  tree: CategoryTreeNode[];
  flat: MeilisearchCategory[];
  total: number;
}

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Fetch all categories from Meilisearch
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
      q: '', // Empty query to get all documents
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
  };
}

// ============================================================================
// Tree Building
// ============================================================================

/**
 * Build a hierarchical tree from a flat array of categories
 *
 * Algorithm: O(n) performance using a map-based approach
 */
function buildCategoryTree(categories: MeilisearchCategory[]): CategoryTreeNode[] {
  // Create a map of all categories as tree nodes
  const nodeMap = new Map<string, CategoryTreeNode>();

  for (const category of categories) {
    nodeMap.set(category.id, {
      ...category,
      children: [],
    });
  }

  // Build parent-child relationships
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

  // Sort children by rank at each level
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
    // Fetch all categories from Meilisearch
    const categories = await fetchCategoriesFromMeilisearch();
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
