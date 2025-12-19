/**
 * Category Hierarchy Utilities
 *
 * Functions for working with hierarchical category URLs and breadcrumbs.
 * Supports up to 5 levels of category depth (0-4).
 *
 * URL Structure: /categorie/level1/level2/level3/level4/level5
 * Example: /categorie/bijoux/colliers/or/pendentifs/coeurs
 *
 * @packageDocumentation
 */

import type {
  IndexedCategory,
  CategoryTreeNode,
  CategoryBreadcrumb,
  CategoryResponse,
} from '@/types/category';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of resolving a category from slug array
 */
export interface CategoryResolution {
  /** The resolved category */
  category: IndexedCategory;
  /** Full array of ancestor categories (root to parent) */
  ancestors: IndexedCategory[];
  /** Breadcrumb trail including current category */
  breadcrumbs: CategoryBreadcrumb[];
  /** Full URL path for the category */
  fullPath: string;
  /** Whether the slug path is valid */
  isValid: boolean;
}

/**
 * Hierarchical breadcrumb with full path support
 */
export interface HierarchicalBreadcrumb extends CategoryBreadcrumb {
  /** Full hierarchical URL path */
  hierarchicalHref: string;
  /** Depth level (0-4) */
  depth: number;
}

// ============================================================================
// Path Building
// ============================================================================

/**
 * Build the full hierarchical URL path for a category
 *
 * Uses ancestor_handles to construct the complete URL path.
 *
 * @param category - The category to build path for
 * @returns Full URL path (e.g., "/categorie/bijoux/colliers/or")
 *
 * @example
 * ```typescript
 * const category = { handle: 'or', ancestor_handles: ['bijoux', 'colliers'] };
 * const path = getCategoryPath(category);
 * // Returns: "/categorie/bijoux/colliers/or"
 * ```
 */
export function getCategoryPath(category: IndexedCategory): string {
  const pathParts = [...(category.ancestor_handles || []), category.handle];
  return `/categorie/${pathParts.join('/')}`;
}

/**
 * Build URL path from slug array
 *
 * @param slugArray - Array of slug segments
 * @returns URL path string
 */
export function buildPathFromSlug(slugArray: string[]): string {
  return `/categorie/${slugArray.join('/')}`;
}

/**
 * Parse category path into slug array
 *
 * @param path - URL path string (e.g., "/categorie/bijoux/colliers")
 * @returns Array of slug segments
 */
export function parsePathToSlug(path: string): string[] {
  const cleanPath = path.replace(/^\/categorie\//, '').replace(/\/$/, '');
  return cleanPath.split('/').filter(Boolean);
}

// ============================================================================
// Ancestor/Descendant Functions
// ============================================================================

/**
 * Get all ancestors of a category
 *
 * @param category - The category to get ancestors for
 * @param byId - Category lookup map by ID
 * @returns Array of ancestor categories from root to parent
 */
export function getAncestors(
  category: IndexedCategory,
  byId: Record<string, IndexedCategory>
): IndexedCategory[] {
  const ancestors: IndexedCategory[] = [];

  for (const ancestorId of category.parent_category_ids || []) {
    const ancestor = byId[ancestorId];
    if (ancestor) {
      ancestors.push(ancestor);
    }
  }

  return ancestors;
}

/**
 * Get all descendants of a category (recursive)
 *
 * @param category - The category to get descendants for
 * @param allCategories - All categories flat array
 * @returns Array of all descendant categories
 */
export function getDescendants(
  category: IndexedCategory,
  allCategories: IndexedCategory[]
): IndexedCategory[] {
  const descendants: IndexedCategory[] = [];

  // Find direct children
  const children = allCategories.filter(
    (c) => c.parent_category_id === category.id && c.is_active
  );

  for (const child of children) {
    descendants.push(child);
    // Recursively get descendants of this child
    const childDescendants = getDescendants(child, allCategories);
    descendants.push(...childDescendants);
  }

  return descendants;
}

/**
 * Get direct children of a category
 *
 * @param category - The parent category
 * @param allCategories - All categories flat array
 * @returns Array of direct child categories sorted by rank
 */
export function getDirectChildren(
  category: IndexedCategory,
  allCategories: IndexedCategory[]
): IndexedCategory[] {
  return allCategories
    .filter(
      (c) =>
        c.parent_category_id === category.id &&
        c.is_active
    )
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Get sibling categories (same parent, excluding self)
 *
 * @param category - The category to find siblings for
 * @param allCategories - All categories flat array
 * @returns Array of sibling categories sorted by rank
 */
export function getSiblings(
  category: IndexedCategory,
  allCategories: IndexedCategory[]
): IndexedCategory[] {
  return allCategories
    .filter(
      (c) =>
        c.parent_category_id === category.parent_category_id &&
        c.id !== category.id &&
        c.is_active
    )
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Get parent category
 *
 * @param category - The category to find parent for
 * @param byId - Category lookup map by ID
 * @returns Parent category or null if root
 */
export function getParent(
  category: IndexedCategory,
  byId: Record<string, IndexedCategory>
): IndexedCategory | null {
  if (!category.parent_category_id) {
    return null;
  }
  return byId[category.parent_category_id] || null;
}

// ============================================================================
// Breadcrumb Building
// ============================================================================

/**
 * Build hierarchical breadcrumbs from slug array
 *
 * Validates that each slug in the path exists and forms a valid hierarchy.
 *
 * @param slugArray - Array of slug segments from URL
 * @param categoryResponse - Full category response with lookup maps
 * @returns Array of hierarchical breadcrumbs or null if invalid path
 *
 * @example
 * ```typescript
 * const breadcrumbs = buildBreadcrumbsFromSlug(
 *   ['bijoux', 'colliers', 'or'],
 *   categoryResponse
 * );
 * // Returns array of breadcrumbs with hierarchical hrefs
 * ```
 */
export function buildBreadcrumbsFromSlug(
  slugArray: string[],
  categoryResponse: CategoryResponse
): HierarchicalBreadcrumb[] | null {
  const { byHandle } = categoryResponse;
  const breadcrumbs: HierarchicalBreadcrumb[] = [];
  let currentPath = '';

  for (let i = 0; i < slugArray.length; i++) {
    const handle = slugArray[i];
    const category = byHandle[handle];

    if (!category) {
      // Invalid slug in path
      return null;
    }

    // Validate hierarchy: this category should have the previous one as ancestor
    if (i > 0) {
      const expectedParentHandle = slugArray[i - 1];
      const expectedParentInAncestors = category.ancestor_handles?.includes(expectedParentHandle);
      const directParent = category.parent_category_id
        ? byHandle[expectedParentHandle]?.id === category.parent_category_id
        : false;

      if (!expectedParentInAncestors && !directParent) {
        // Category exists but is not a child of the previous slug
        return null;
      }
    }

    currentPath = currentPath ? `${currentPath}/${handle}` : handle;

    breadcrumbs.push({
      id: category.id,
      name: category.name,
      handle: category.handle,
      href: `/categorie/${currentPath}`,
      hierarchicalHref: `/categorie/${currentPath}`,
      depth: category.depth,
    });
  }

  return breadcrumbs;
}

/**
 * Build complete breadcrumb trail for a category
 *
 * @param category - The target category
 * @param byId - Category lookup map by ID
 * @param includeHome - Whether to include home link
 * @returns Array of hierarchical breadcrumbs
 */
export function buildCategoryBreadcrumbs(
  category: IndexedCategory,
  byId: Record<string, IndexedCategory>,
  includeHome: boolean = true
): HierarchicalBreadcrumb[] {
  const breadcrumbs: HierarchicalBreadcrumb[] = [];

  // Add home if requested
  if (includeHome) {
    breadcrumbs.push({
      id: 'home',
      name: 'Accueil',
      handle: '',
      href: '/',
      hierarchicalHref: '/',
      depth: -1,
    });
  }

  // Add categories link
  breadcrumbs.push({
    id: 'categories',
    name: 'Categories',
    handle: '',
    href: '/categorie',
    hierarchicalHref: '/categorie',
    depth: -1,
  });

  // Build path progressively from ancestors
  const ancestors = getAncestors(category, byId);
  let currentPath = '';

  for (const ancestor of ancestors) {
    currentPath = currentPath ? `${currentPath}/${ancestor.handle}` : ancestor.handle;

    breadcrumbs.push({
      id: ancestor.id,
      name: ancestor.name,
      handle: ancestor.handle,
      href: `/categorie/${currentPath}`,
      hierarchicalHref: `/categorie/${currentPath}`,
      depth: ancestor.depth,
    });
  }

  // Add current category
  currentPath = currentPath ? `${currentPath}/${category.handle}` : category.handle;

  breadcrumbs.push({
    id: category.id,
    name: category.name,
    handle: category.handle,
    href: `/categorie/${currentPath}`,
    hierarchicalHref: `/categorie/${currentPath}`,
    depth: category.depth,
  });

  return breadcrumbs;
}

// ============================================================================
// Category Resolution
// ============================================================================

/**
 * Resolve a category from URL slug array
 *
 * Validates the entire path and returns complete category context.
 *
 * @param slugArray - Array of slug segments from URL
 * @param categoryResponse - Full category response
 * @returns Category resolution result or null if invalid
 */
export function resolveCategoryFromSlug(
  slugArray: string[],
  categoryResponse: CategoryResponse
): CategoryResolution | null {
  if (!slugArray || slugArray.length === 0) {
    return null;
  }

  const { byHandle, byId } = categoryResponse;
  const targetHandle = slugArray[slugArray.length - 1];
  const category = byHandle[targetHandle];

  if (!category) {
    return null;
  }

  // Validate the entire path
  const breadcrumbs = buildBreadcrumbsFromSlug(slugArray, categoryResponse);

  if (!breadcrumbs) {
    // Path exists but hierarchy is invalid
    return null;
  }

  const ancestors = getAncestors(category, byId);
  const fullPath = getCategoryPath(category);

  // Verify the URL matches the expected path
  const expectedSlug = [...(category.ancestor_handles || []), category.handle];
  const isValidPath = expectedSlug.join('/') === slugArray.join('/');

  return {
    category,
    ancestors,
    breadcrumbs,
    fullPath,
    isValid: isValidPath,
  };
}

/**
 * Find category by handle and validate it exists
 *
 * @param handle - Category handle to find
 * @param byHandle - Category lookup map by handle
 * @returns Category or null if not found
 */
export function findCategoryByHandle(
  handle: string,
  byHandle: Record<string, IndexedCategory>
): IndexedCategory | null {
  return byHandle[handle] || null;
}

// ============================================================================
// Tree Navigation
// ============================================================================

/**
 * Get the path to a category in the tree
 *
 * @param targetId - ID of the target category
 * @param tree - Category tree to search
 * @returns Array of categories from root to target, or null if not found
 */
export function getPathInTree(
  targetId: string,
  tree: CategoryTreeNode[]
): CategoryTreeNode[] | null {
  function search(nodes: CategoryTreeNode[], path: CategoryTreeNode[]): CategoryTreeNode[] | null {
    for (const node of nodes) {
      const currentPath = [...path, node];

      if (node.id === targetId) {
        return currentPath;
      }

      if (node.children.length > 0) {
        const result = search(node.children, currentPath);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  return search(tree, []);
}

/**
 * Check if a category is an ancestor of another
 *
 * @param ancestorId - Potential ancestor category ID
 * @param descendantCategory - The category to check
 * @returns True if ancestorId is an ancestor of descendantCategory
 */
export function isAncestorOf(
  ancestorId: string,
  descendantCategory: IndexedCategory
): boolean {
  return (descendantCategory.parent_category_ids || []).includes(ancestorId);
}

/**
 * Get total product count including all descendants
 *
 * NOTE: The `product_count` field from the search index ALREADY includes
 * inherited counts from descendants (calculated during backend sync).
 * This function is provided for compatibility but should typically
 * just return the existing product_count.
 *
 * If you need to recalculate from scratch (not recommended), set
 * recalculate to true.
 *
 * @param category - The category
 * @param allCategories - All categories flat array
 * @param recalculate - Force recalculation (default: false, use existing count)
 * @returns Total product count
 */
export function getTotalProductCount(
  category: IndexedCategory,
  allCategories: IndexedCategory[],
  recalculate: boolean = false
): number {
  // By default, use the pre-calculated count from backend
  if (!recalculate) {
    return category.product_count || 0;
  }

  // Recalculate from scratch (only use if you know the backend count is wrong)
  let total = category.product_count || 0;

  const descendants = getDescendants(category, allCategories);
  for (const desc of descendants) {
    total += desc.product_count || 0;
  }

  return total;
}

/**
 * Get category depth level name
 *
 * @param depth - Depth level (0-4)
 * @returns French name for the depth level
 */
export function getDepthLevelName(depth: number): string {
  const levels: Record<number, string> = {
    0: 'Categorie principale',
    1: 'Sous-categorie',
    2: 'Sous-sous-categorie',
    3: 'Categorie niveau 4',
    4: 'Categorie niveau 5',
  };

  return levels[depth] || `Niveau ${depth + 1}`;
}
