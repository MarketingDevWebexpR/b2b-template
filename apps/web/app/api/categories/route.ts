/**
 * Categories API Route
 *
 * Fetches all categories from Meilisearch and builds a hierarchical tree structure.
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
import type { MeilisearchCategory, CategoryResponse, MeilisearchCategoryHit } from '@/types/category';
import { buildCategoryResponse } from '@/lib/categories/build-tree';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

const MEILISEARCH_URL = process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const CATEGORIES_INDEX = process.env.MEILISEARCH_CATEGORIES_INDEX || 'bijoux_categories';

// ============================================================================
// Meilisearch Client
// ============================================================================

interface MeilisearchSearchResponse {
  hits: MeilisearchCategoryHit[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

/**
 * Fetch all categories from Meilisearch
 * Uses a large limit to get all categories in one request
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
      limit: 1000, // Large limit to get all categories
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

  // Map Meilisearch hits to MeilisearchCategory type
  return data.hits.map(mapHitToCategory);
}

/**
 * Map Meilisearch hit to MeilisearchCategory type
 * Ensures all fields have proper defaults
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
// Route Handler
// ============================================================================

export async function GET(): Promise<NextResponse<CategoryResponse | { error: string }>> {
  try {
    // Fetch all categories from Meilisearch
    const categories = await fetchCategoriesFromMeilisearch();

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
