/**
 * Catalog Category by Path API Route
 *
 * Fetches a specific category by its hierarchical path with children,
 * products, and ancestor breadcrumbs via the backend API.
 *
 * GET /api/catalog/categories/bijoux/colliers (hierarchical path)
 *
 * Response:
 * {
 *   category: Category,
 *   children: Category[],
 *   products: Product[],
 *   ancestors: Category[]
 * }
 *
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from 'next/server';
import type { IndexedCategory } from '@/types/category';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://localhost:9000';

// ============================================================================
// Types
// ============================================================================

interface TransformedProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  inStock: boolean;
}

interface CategoryPathResponse {
  category: IndexedCategory;
  children: IndexedCategory[];
  products: TransformedProduct[];
  ancestors: IndexedCategory[];
}

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Fetch all categories from backend API
 */
async function fetchAllCategories(): Promise<IndexedCategory[]> {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/api/categories`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Backend API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.flat || [];
}

/**
 * Find category by handle path in categories list
 */
function findCategoryByPath(
  categories: IndexedCategory[],
  path: string[]
): IndexedCategory | null {
  if (path.length === 0) return null;

  const targetHandle = path[path.length - 1];
  const expectedAncestorHandles = path.slice(0, -1);

  // Find category with matching handle and ancestor path
  return (
    categories.find((cat) => {
      if (cat.handle !== targetHandle) return false;

      // Check if ancestor handles match
      if (cat.ancestor_handles.length !== expectedAncestorHandles.length) return false;

      return expectedAncestorHandles.every(
        (handle, index) => cat.ancestor_handles[index] === handle
      );
    }) ?? null
  );
}

/**
 * Get children categories for a parent
 */
function getChildCategories(
  parentId: string,
  categories: IndexedCategory[]
): IndexedCategory[] {
  return categories
    .filter((c) => c.parent_category_id === parentId && c.is_active)
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Get ancestor categories
 */
function getAncestors(
  category: IndexedCategory,
  categoriesById: Map<string, IndexedCategory>
): IndexedCategory[] {
  return category.parent_category_ids
    .map((id) => categoriesById.get(id))
    .filter((c): c is IndexedCategory => c !== undefined);
}

/**
 * Fetch products for a category from Medusa
 */
async function fetchCategoryProducts(
  categoryId: string,
  limit: number = 20
): Promise<TransformedProduct[]> {
  try {
    const url = `${MEDUSA_BACKEND_URL}/store/products?category_id[]=${categoryId}&limit=${limit}&fields=*variants.prices,*images`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`[Category Products] Failed to fetch: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.products ?? []).map(transformProduct);
  } catch (error) {
    console.error('[Category Products] Error:', error);
    return [];
  }
}

/**
 * Format price amount
 */
function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Transform Medusa product to simplified format
 */
function transformProduct(product: {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  variants: Array<{
    prices: Array<{ currency_code: string; amount: number }>;
    inventory_quantity: number;
  }>;
}): TransformedProduct {
  let lowestPrice: { amount: number; currency: string } | null = null;
  let totalInventory = 0;

  for (const variant of product.variants) {
    totalInventory += variant.inventory_quantity;
    for (const price of variant.prices) {
      if (price.currency_code.toLowerCase() === 'eur') {
        if (!lowestPrice || price.amount < lowestPrice.amount) {
          lowestPrice = { amount: price.amount, currency: price.currency_code };
        }
      }
    }
  }

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail,
    price: lowestPrice
      ? {
          amount: lowestPrice.amount,
          currency: lowestPrice.currency,
          formatted: formatPrice(lowestPrice.amount, lowestPrice.currency),
        }
      : null,
    inStock: totalInventory > 0,
  };
}

// ============================================================================
// Route Handler
// ============================================================================

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<CategoryPathResponse | { error: string }>> {
  try {
    const { path } = await context.params;

    if (!path || path.length === 0) {
      return NextResponse.json(
        { error: 'Category path is required' },
        { status: 400 }
      );
    }

    // Fetch all categories
    const categories = await fetchAllCategories();

    // Build lookup map
    const categoriesById = new Map(categories.map((c) => [c.id, c]));

    // Find category by path
    const category = findCategoryByPath(categories, path);

    if (!category) {
      return NextResponse.json(
        { error: `Category not found for path: ${path.join('/')}` },
        { status: 404 }
      );
    }

    // Get children, ancestors, and products in parallel
    const [products] = await Promise.all([
      fetchCategoryProducts(category.id),
    ]);

    const children = getChildCategories(category.id, categories);
    const ancestors = getAncestors(category, categoriesById);

    const response: CategoryPathResponse = {
      category,
      children,
      products,
      ancestors,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('[Category Path API] Error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
