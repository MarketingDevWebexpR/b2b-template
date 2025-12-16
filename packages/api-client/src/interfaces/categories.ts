/**
 * Category Service Interface
 * Defines the contract for category-related operations.
 */

import type { Category } from "@maison/types";

/**
 * Extended category with hierarchy information
 */
export interface CategoryWithHierarchy extends Category {
  /** Parent category */
  parent?: Category;
  /** Child categories */
  children?: Category[];
  /** Full path from root */
  path?: Category[];
  /** Breadcrumb trail */
  breadcrumbs?: Array<{ id: string; name: string; slug: string }>;
}

/**
 * Category tree node
 */
export interface CategoryTreeNode extends Category {
  /** Nested child categories */
  children: CategoryTreeNode[];
  /** Depth level in tree (0 = root) */
  level: number;
}

/**
 * Options for listing categories
 */
export interface ListCategoriesOptions {
  /** Parent category ID (null for root categories) */
  parentId?: string | null;
  /** Include categories with no products */
  includeEmpty?: boolean;
  /** Maximum depth to include children */
  depth?: number;
  /** Include product counts */
  includeProductCount?: boolean;
}

/**
 * Interface for category-related operations.
 * All adapters must implement this interface.
 */
export interface ICategoryService {
  /**
   * List all categories.
   *
   * @param options - Listing options
   * @returns Array of categories
   *
   * @example
   * ```typescript
   * const categories = await api.categories.list({
   *   includeEmpty: false,
   *   includeProductCount: true
   * });
   * ```
   */
  list(options?: ListCategoriesOptions): Promise<Category[]>;

  /**
   * Get a single category by ID.
   *
   * @param id - Category ID
   * @returns Category details with hierarchy
   */
  get(id: string): Promise<CategoryWithHierarchy>;

  /**
   * Get a category by slug.
   *
   * @param slug - Category slug
   * @returns Category details with hierarchy
   */
  getBySlug(slug: string): Promise<CategoryWithHierarchy>;

  /**
   * Get the full category tree.
   *
   * @param options - Tree options
   * @returns Root categories with nested children
   *
   * @example
   * ```typescript
   * const tree = await api.categories.getTree({ depth: 3 });
   * // Returns nested structure: [{ id, name, children: [...] }]
   * ```
   */
  getTree(options?: ListCategoriesOptions): Promise<CategoryTreeNode[]>;

  /**
   * Get root level categories.
   *
   * @returns Array of root categories
   */
  getRoots(): Promise<Category[]>;

  /**
   * Get child categories of a parent.
   *
   * @param parentId - Parent category ID
   * @returns Array of child categories
   */
  getChildren(parentId: string): Promise<Category[]>;

  /**
   * Get the breadcrumb path for a category.
   *
   * @param categoryId - Category ID
   * @returns Array of categories from root to target
   */
  getBreadcrumbs(categoryId: string): Promise<Category[]>;

  /**
   * Get multiple categories by IDs.
   *
   * @param ids - Array of category IDs
   * @returns Array of categories
   */
  getMany(ids: string[]): Promise<Category[]>;
}
