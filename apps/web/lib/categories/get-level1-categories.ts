/**
 * Get Level 1 Categories for QuickLinksBar
 *
 * Server-side function to fetch root categories from the API.
 * Returns only Level 1 categories (depth 0) for quick access navigation.
 */

import type { CategoryResponse, CategoryTreeNode } from '@/types/category';
import type { QuickLinkCategory } from '@/components/home/QuickLinksBar';

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Transform CategoryTreeNode to QuickLinkCategory format
 */
function transformToQuickLink(node: CategoryTreeNode): QuickLinkCategory {
  return {
    id: node.id,
    name: node.name,
    slug: node.handle,
    icon: node.icon || undefined,
    productCount: node.product_count,
  };
}

/**
 * Fetch Level 1 categories from the API
 *
 * @param revalidate - Cache revalidation time in seconds (default: 3600)
 * @returns Array of Level 1 categories for QuickLinksBar
 *
 * @example
 * ```tsx
 * // In a Server Component (page.tsx)
 * const level1Categories = await getLevel1Categories();
 * return <QuickLinksBar categories={level1Categories} />;
 * ```
 */
export async function getLevel1Categories(revalidate = 3600): Promise<QuickLinkCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(`[getLevel1Categories] API error: ${response.status}`);
      return [];
    }

    const data: CategoryResponse = await response.json();

    // Return only root nodes (Level 1) transformed to QuickLinkCategory format
    return data.tree.map(transformToQuickLink);
  } catch (error) {
    console.error('[getLevel1Categories] Error:', error);
    return [];
  }
}
