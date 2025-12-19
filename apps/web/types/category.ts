/**
 * Category Types for Meilisearch Integration
 *
 * Types for categories indexed in Meilisearch with full hierarchy support.
 * Categories have up to 5 levels of depth (0-4).
 *
 * Note: These types are prefixed with "Meilisearch" to avoid conflicts
 * with the base Category type from @bijoux/types which is used for Sage integration.
 *
 * @packageDocumentation
 */

// ============================================================================
// Base Category Types
// ============================================================================

/**
 * Flat category representation from search index (App Search or Meilisearch)
 * This is the enhanced category with full hierarchy support
 */
export interface MeilisearchCategory {
  /** Unique category identifier */
  id: string;
  /** Display name (French) */
  name: string;
  /** English translation of the name */
  name_en?: string;
  /** URL-friendly slug */
  handle: string;
  /** Category description */
  description: string | null;
  /** Icon identifier for Lucide icons (e.g., "bolt", "droplets", "hammer") */
  icon: string | null;
  /** Image URL from Unsplash or CDN */
  image_url: string | null;
  /** Parent category ID (null for root categories) */
  parent_category_id: string | null;
  /** Array of all ancestor category IDs (ordered from root to parent) */
  parent_category_ids: string[];
  /** Full path string with hierarchy (e.g., "Électricité > Protection > Disjoncteurs") */
  path: string;
  /** Full path string (alias for path, from App Search) */
  full_path?: string;
  /** Array of ancestor category names (ordered from root to parent) */
  ancestor_names: string[];
  /** Array of ancestor category handles (ordered from root to parent) */
  ancestor_handles: string[];
  /** Depth level in hierarchy (0 = root, up to 4 for 5 levels) */
  depth: number;
  /** Whether the category is active */
  is_active: boolean;
  /** Sort order within parent */
  rank: number;
  /** Number of products in this category */
  product_count: number;
  /** Full metadata JSON string */
  metadata?: string;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Category tree node with children
 */
export interface CategoryTreeNode extends MeilisearchCategory {
  /** Child categories */
  children: CategoryTreeNode[];
}

/**
 * Response structure from categories API
 */
export interface CategoryResponse {
  /** Hierarchical tree structure */
  tree: CategoryTreeNode[];
  /** Flat array of all categories */
  flat: MeilisearchCategory[];
  /** Categories indexed by ID for quick lookup */
  byId: Record<string, MeilisearchCategory>;
  /** Categories indexed by handle for URL routing */
  byHandle: Record<string, MeilisearchCategory>;
  /** Total category count */
  total: number;
  /** Maximum depth in the tree */
  maxDepth: number;
}

// ============================================================================
// Meilisearch Response Types
// ============================================================================

/**
 * Raw Meilisearch search response for categories
 */
export interface MeilisearchCategoryHit {
  id: string;
  name: string;
  name_en?: string;
  handle: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  parent_category_id: string | null;
  parent_category_ids: string[];
  path: string;
  full_path?: string;
  ancestor_names: string[];
  ancestor_handles: string[];
  depth: number;
  is_active: boolean;
  rank: number;
  product_count: number;
  metadata?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Meilisearch search response structure
 */
export interface MeilisearchCategoryResponse {
  hits: MeilisearchCategoryHit[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

// ============================================================================
// Icon Mapping Types
// ============================================================================

/**
 * Valid icon identifiers used in category metadata
 * These map to Lucide React icons
 */
export type CategoryIconName =
  | 'bolt'
  | 'droplets'
  | 'hammer'
  | 'thermometer'
  | 'screw'
  | 'wrench'
  | 'plug'
  | 'lightbulb'
  | 'cable'
  | 'shield'
  | 'gauge'
  | 'fan'
  | 'pipette'
  | 'zap'
  | 'settings'
  | 'tool'
  | 'box'
  | 'package'
  | 'layers'
  | 'grid'
  | 'folder'
  | string; // Allow any string for extensibility

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Category filter options
 */
export interface CategoryFilterOptions {
  /** Filter by depth level */
  depth?: number;
  /** Filter by parent ID (null for root categories) */
  parentId?: string | null;
  /** Only include active categories */
  activeOnly?: boolean;
  /** Only include categories with products */
  withProductsOnly?: boolean;
  /** Limit results */
  limit?: number;
}

/**
 * Category navigation item for menus
 */
export interface CategoryNavItem {
  id: string;
  name: string;
  name_en?: string;
  handle: string;
  icon: string | null;
  image_url: string | null;
  depth: number;
  productCount: number;
  hasChildren: boolean;
  children?: CategoryNavItem[];
}

/**
 * Breadcrumb item for category pages
 */
export interface CategoryBreadcrumb {
  id: string;
  name: string;
  handle: string;
  href: string;
}

// ============================================================================
// Type Aliases for Convenience
// ============================================================================

/**
 * Alias for MeilisearchCategory
 * Use this when working with the categories API
 */
export type CatalogCategory = MeilisearchCategory;
