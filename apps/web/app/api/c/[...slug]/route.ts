/**
 * Hierarchical Category API Route
 *
 * GET /api/c/[...slug] (legacy endpoint - use /api/categorie/[...slug])
 *
 * Fetches a category by its hierarchical path and returns complete context:
 * - Category details
 * - Ancestors
 * - Breadcrumbs
 * - Subcategories
 * - Sibling categories
 * - Product count (including descendants)
 *
 * URL Examples:
 * - /api/c/bijoux (legacy)
 * - /api/c/bijoux/colliers (legacy)
 * - /api/c/bijoux/colliers/or (legacy)
 *
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from 'next/server';
import type { MeilisearchCategory, CategoryResponse, CategoryTreeNode } from '@/types/category';
import { buildCategoryResponse } from '@/lib/categories/build-tree';
import {
  resolveCategoryFromSlug,
  buildCategoryBreadcrumbs,
  getDirectChildren,
  getSiblings,
  getParent,
  getTotalProductCount,
  getDescendants,
  getCategoryPath,
} from '@/lib/categories/hierarchy';
import type { HierarchicalBreadcrumb } from '@/lib/categories/hierarchy';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

const MEILISEARCH_URL = process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const CATEGORIES_INDEX = process.env.MEILISEARCH_CATEGORIES_INDEX || 'bijoux_categories';

// ============================================================================
// Types
// ============================================================================

interface HierarchicalCategoryResponse {
  /** The resolved category */
  category: MeilisearchCategory;
  /** Breadcrumb trail */
  breadcrumbs: HierarchicalBreadcrumb[];
  /** Ancestor categories */
  ancestors: MeilisearchCategory[];
  /** Direct child categories */
  children: MeilisearchCategory[];
  /** Sibling categories (same level) */
  siblings: MeilisearchCategory[];
  /** Parent category (null if root) */
  parent: MeilisearchCategory | null;
  /** Total product count including descendants */
  totalProductCount: number;
  /** Full URL path */
  fullPath: string;
  /** Category depth (0-4) */
  depth: number;
  /** Full category tree for navigation */
  tree: CategoryTreeNode[];
  /** Metadata */
  meta: {
    totalCategories: number;
    maxDepth: number;
    fetchedAt: string;
  };
}

interface ErrorResponse {
  error: string;
  message: string;
  slug?: string[];
}

// ============================================================================
// Meilisearch Client
// ============================================================================

interface MeilisearchSearchResponse {
  hits: MeilisearchCategory[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

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
    console.error(`[Category API] Meilisearch error: ${response.status}`, errorText);
    throw new Error(`Meilisearch request failed: ${response.status}`);
  }

  const data: MeilisearchSearchResponse = await response.json();
  return data.hits;
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
): Promise<NextResponse<HierarchicalCategoryResponse | ErrorResponse>> {
  try {
    const { slug } = await params;

    // Validate slug
    if (!slug || slug.length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Category slug is required',
        },
        { status: 400 }
      );
    }

    // Validate max depth (5 levels)
    if (slug.length > 5) {
      return NextResponse.json(
        {
          error: 'invalid_depth',
          message: 'Category hierarchy cannot exceed 5 levels',
          slug,
        },
        { status: 400 }
      );
    }

    // Fetch all categories
    const categories = await fetchCategoriesFromMeilisearch();

    if (categories.length === 0) {
      return NextResponse.json(
        {
          error: 'no_categories',
          message: 'No categories found in the system',
        },
        { status: 404 }
      );
    }

    // Build category response with lookup maps
    const categoryResponse = buildCategoryResponse(categories);

    // Resolve category from slug
    const resolution = resolveCategoryFromSlug(slug, categoryResponse);

    if (!resolution) {
      return NextResponse.json(
        {
          error: 'not_found',
          message: `Category not found for path: /${slug.join('/')}`,
          slug,
        },
        { status: 404 }
      );
    }

    if (!resolution.isValid) {
      // Category exists but hierarchy is invalid
      // Redirect to the correct path
      const correctPath = getCategoryPath(resolution.category);
      return NextResponse.json(
        {
          error: 'invalid_path',
          message: `Invalid category path. The correct path is: ${correctPath}`,
          slug,
        },
        { status: 400 }
      );
    }

    const { category, ancestors } = resolution;
    const { flat, byId, tree, total, maxDepth } = categoryResponse;

    // Build complete breadcrumbs
    const breadcrumbs = buildCategoryBreadcrumbs(category, byId, false);

    // Get related categories
    const children = getDirectChildren(category, flat);
    const siblings = getSiblings(category, flat);
    const parent = getParent(category, byId);

    // Calculate total products
    const totalProductCount = getTotalProductCount(category, flat);

    // Build response
    const response: HierarchicalCategoryResponse = {
      category,
      breadcrumbs,
      ancestors,
      children,
      siblings,
      parent,
      totalProductCount,
      fullPath: getCategoryPath(category),
      depth: category.depth,
      tree,
      meta: {
        totalCategories: total,
        maxDepth,
        fetchedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, max-age=3600',
        'Vercel-CDN-Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Category API] Error:', error);

    return NextResponse.json(
      {
        error: 'server_error',
        message: 'An unexpected error occurred while fetching category data',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HEAD Handler (for validation)
// ============================================================================

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    if (!slug || slug.length === 0 || slug.length > 5) {
      return new NextResponse(null, { status: 400 });
    }

    const categories = await fetchCategoriesFromMeilisearch();
    const categoryResponse = buildCategoryResponse(categories);
    const resolution = resolveCategoryFromSlug(slug, categoryResponse);

    if (!resolution || !resolution.isValid) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
