/**
 * Category Utilities
 *
 * Re-exports all category-related utilities.
 *
 * @packageDocumentation
 */

// Tree building utilities
export {
  buildCategoryTree,
  buildCategoryResponse,
  findCategoryById,
  findCategoryByHandle,
  getCategoryAncestors,
  getCategoryBreadcrumbs,
  getCategoryDescendants,
  flattenTree,
  filterCategories,
  getRootCategories,
  getChildCategories,
  treeToNavItems,
  getSiblingCategories,
} from './build-tree';

// Hierarchy utilities for 5-level category support
export {
  getCategoryPath,
  buildPathFromSlug,
  parsePathToSlug,
  getAncestors,
  getDescendants,
  getDirectChildren,
  getSiblings,
  getParent,
  buildBreadcrumbsFromSlug,
  buildCategoryBreadcrumbs as buildHierarchicalBreadcrumbs,
  resolveCategoryFromSlug,
  findCategoryByHandle as findByHandle,
  getPathInTree,
  isAncestorOf,
  getTotalProductCount,
  getDepthLevelName,
} from './hierarchy';

export type {
  CategoryResolution,
  HierarchicalBreadcrumb,
} from './hierarchy';

// Server-side data fetching
export { getLevel1Categories } from './get-level1-categories';
