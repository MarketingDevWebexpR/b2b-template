/**
 * Category Tree Builder Utility
 *
 * Builds a hierarchical tree structure from a flat array of categories.
 * Optimized for O(n) performance using a map-based approach.
 *
 * @packageDocumentation
 */

import type {
  IndexedCategory,
  CategoryTreeNode,
  CategoryResponse,
  CategoryFilterOptions,
  CategoryNavItem,
  CategoryBreadcrumb,
} from '@/types/category';

// ============================================================================
// Tree Building
// ============================================================================

/**
 * Build a hierarchical tree from a flat array of categories
 *
 * Algorithm: O(n) performance
 * 1. Create a map of all categories with empty children arrays
 * 2. Iterate once to assign children to their parents
 * 3. Collect root nodes (depth 0 or no parent)
 * 4. Sort children by rank at each level
 *
 * @param categories - Flat array of categories
 * @returns Array of root category tree nodes
 *
 * @example
 * ```typescript
 * const flat = await fetchCategories();
 * const tree = buildCategoryTree(flat);
 * // tree is now hierarchical with children arrays
 * ```
 */
export function buildCategoryTree(categories: IndexedCategory[]): CategoryTreeNode[] {
  // Step 1: Create a map with all categories as tree nodes
  const nodeMap = new Map<string, CategoryTreeNode>();

  for (const category of categories) {
    nodeMap.set(category.id, {
      ...category,
      children: [],
    });
  }

  // Step 2: Build parent-child relationships
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    const node = nodeMap.get(category.id)!;

    if (category.parent_category_id && nodeMap.has(category.parent_category_id)) {
      // Add to parent's children
      const parent = nodeMap.get(category.parent_category_id)!;
      parent.children.push(node);
    } else {
      // Root node (no parent or parent not in list)
      roots.push(node);
    }
  }

  // Step 3: Sort children by rank at each level
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

// ============================================================================
// Response Builder
// ============================================================================

/**
 * Build complete category response with tree, flat list, and lookup maps
 *
 * @param categories - Flat array of categories from search index
 * @returns Complete category response structure
 */
export function buildCategoryResponse(categories: IndexedCategory[]): CategoryResponse {
  // Filter to active categories only
  const activeCategories = categories.filter((c) => c.is_active);

  // Sort flat list by rank for consistent ordering
  const sortedFlat = [...activeCategories].sort((a, b) => {
    // Primary sort by depth, secondary by rank
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.rank - b.rank;
  });

  // Build tree structure
  const tree = buildCategoryTree(activeCategories);

  // Build lookup maps
  const byId: Record<string, IndexedCategory> = {};
  const byHandle: Record<string, IndexedCategory> = {};

  for (const category of activeCategories) {
    byId[category.id] = category;
    byHandle[category.handle] = category;
  }

  // Calculate max depth
  const maxDepth = activeCategories.reduce(
    (max, cat) => Math.max(max, cat.depth),
    0
  );

  return {
    tree,
    flat: sortedFlat,
    byId,
    byHandle,
    total: activeCategories.length,
    maxDepth,
  };
}

// ============================================================================
// Tree Traversal Utilities
// ============================================================================

/**
 * Find a category in the tree by ID
 *
 * @param tree - Category tree to search
 * @param id - Category ID to find
 * @returns Category tree node or null
 */
export function findCategoryById(
  tree: CategoryTreeNode[],
  id: string
): CategoryTreeNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children.length > 0) {
      const found = findCategoryById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find a category in the tree by handle
 *
 * @param tree - Category tree to search
 * @param handle - Category handle to find
 * @returns Category tree node or null
 */
export function findCategoryByHandle(
  tree: CategoryTreeNode[],
  handle: string
): CategoryTreeNode | null {
  for (const node of tree) {
    if (node.handle === handle) return node;
    if (node.children.length > 0) {
      const found = findCategoryByHandle(node.children, handle);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all ancestors of a category (from root to parent)
 *
 * @param category - The category to get ancestors for
 * @param byId - Category lookup map by ID
 * @returns Array of ancestor categories from root to parent
 */
export function getCategoryAncestors(
  category: IndexedCategory,
  byId: Record<string, IndexedCategory>
): IndexedCategory[] {
  const ancestors: IndexedCategory[] = [];

  for (const ancestorId of category.parent_category_ids) {
    const ancestor = byId[ancestorId];
    if (ancestor) {
      ancestors.push(ancestor);
    }
  }

  return ancestors;
}

/**
 * Get breadcrumb trail for a category
 *
 * @param category - The category to get breadcrumbs for
 * @param byId - Category lookup map by ID
 * @param basePath - Base URL path (default: '/categories')
 * @returns Array of breadcrumb items including the current category
 */
export function getCategoryBreadcrumbs(
  category: IndexedCategory,
  byId: Record<string, IndexedCategory>,
  basePath: string = '/categories'
): CategoryBreadcrumb[] {
  const ancestors = getCategoryAncestors(category, byId);

  const breadcrumbs: CategoryBreadcrumb[] = ancestors.map((ancestor) => ({
    id: ancestor.id,
    name: ancestor.name,
    handle: ancestor.handle,
    href: `${basePath}/${ancestor.handle}`,
  }));

  // Add current category
  breadcrumbs.push({
    id: category.id,
    name: category.name,
    handle: category.handle,
    href: `${basePath}/${category.handle}`,
  });

  return breadcrumbs;
}

/**
 * Get all descendants of a category (all children recursively)
 *
 * @param node - Category tree node
 * @returns Flat array of all descendant categories
 */
export function getCategoryDescendants(node: CategoryTreeNode): IndexedCategory[] {
  const descendants: IndexedCategory[] = [];

  function collect(n: CategoryTreeNode) {
    for (const child of n.children) {
      descendants.push(child);
      collect(child);
    }
  }

  collect(node);
  return descendants;
}

/**
 * Flatten tree back to array
 *
 * @param tree - Category tree
 * @returns Flat array of categories
 */
export function flattenTree(tree: CategoryTreeNode[]): IndexedCategory[] {
  const result: IndexedCategory[] = [];

  function collect(nodes: CategoryTreeNode[]) {
    for (const node of nodes) {
      // Extract category without children
      const { children, ...category } = node;
      result.push(category);
      if (children.length > 0) {
        collect(children);
      }
    }
  }

  collect(tree);
  return result;
}

// ============================================================================
// Filtering Utilities
// ============================================================================

/**
 * Filter categories by options
 *
 * @param categories - Categories to filter
 * @param options - Filter options
 * @returns Filtered categories
 */
export function filterCategories(
  categories: IndexedCategory[],
  options: CategoryFilterOptions
): IndexedCategory[] {
  let filtered = [...categories];

  if (options.activeOnly !== false) {
    filtered = filtered.filter((c) => c.is_active);
  }

  if (options.depth !== undefined) {
    filtered = filtered.filter((c) => c.depth === options.depth);
  }

  if (options.parentId !== undefined) {
    filtered = filtered.filter((c) => c.parent_category_id === options.parentId);
  }

  if (options.withProductsOnly) {
    filtered = filtered.filter((c) => c.product_count > 0);
  }

  if (options.limit !== undefined && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Get root categories (depth 0)
 *
 * @param categories - All categories
 * @returns Root level categories sorted by rank
 */
export function getRootCategories(categories: IndexedCategory[]): IndexedCategory[] {
  return categories
    .filter((c) => c.depth === 0 && c.is_active)
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Get children of a specific category
 *
 * @param parentId - Parent category ID
 * @param categories - All categories
 * @returns Children sorted by rank
 */
export function getChildCategories(
  parentId: string,
  categories: IndexedCategory[]
): IndexedCategory[] {
  return categories
    .filter((c) => c.parent_category_id === parentId && c.is_active)
    .sort((a, b) => a.rank - b.rank);
}

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Convert category tree to navigation items
 * Useful for building mega menus
 *
 * @param tree - Category tree
 * @param maxDepth - Maximum depth to include (default: 2)
 * @returns Navigation item array
 */
export function treeToNavItems(
  tree: CategoryTreeNode[],
  maxDepth: number = 2
): CategoryNavItem[] {
  function convert(nodes: CategoryTreeNode[], currentDepth: number): CategoryNavItem[] {
    return nodes.map((node) => ({
      id: node.id,
      name: node.name,
      handle: node.handle,
      icon: node.icon,
      image_url: node.image_url,
      depth: node.depth,
      productCount: node.product_count,
      hasChildren: node.children.length > 0,
      children:
        currentDepth < maxDepth && node.children.length > 0
          ? convert(node.children, currentDepth + 1)
          : undefined,
    }));
  }

  return convert(tree, 0);
}

/**
 * Get sibling categories (same parent)
 *
 * @param category - The category
 * @param categories - All categories
 * @returns Sibling categories sorted by rank
 */
export function getSiblingCategories(
  category: IndexedCategory,
  categories: IndexedCategory[]
): IndexedCategory[] {
  return categories
    .filter(
      (c) =>
        c.parent_category_id === category.parent_category_id &&
        c.id !== category.id &&
        c.is_active
    )
    .sort((a, b) => a.rank - b.rank);
}
