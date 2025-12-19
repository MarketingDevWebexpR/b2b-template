/**
 * MegaMenu Types
 *
 * Type definitions for the 5-level MegaMenu navigation component.
 * Supports hierarchical category structure with icons and metadata.
 *
 * Compatible with App Search v3 category schema:
 * - depth: 0-4 indicating hierarchy level
 * - parent_category_id: reference to parent
 * - path: full path like "Plomberie > Robinetterie > Mitigeurs"
 * - ancestor_handles/ancestor_names: for breadcrumb construction
 * - product_count: total products including descendants
 */

/**
 * Base category properties shared across all levels
 */
interface BaseCategoryLevel {
  id: string;
  name: string;
  slug: string;
  /** Number of products in this category (including descendants) */
  productCount?: number;
  /** Hierarchy depth level (0-4, mapped from API depth field) */
  depth?: number;
  /** Full path string for display (e.g., "Plomberie > Robinetterie") */
  path?: string;
  /** Array of ancestor handles for URL construction */
  ancestorHandles?: string[];
}

/**
 * Level 5: Deepest category item (leaf node, depth=4)
 */
export interface CategoryLevel5 extends BaseCategoryLevel {
  // No children at this level
}

/**
 * Level 4: Sub-sub-subcategory (depth=3)
 */
export interface CategoryLevel4 extends BaseCategoryLevel {
  icon?: string;
  children?: CategoryLevel5[];
}

/**
 * Level 3: Sub-subcategory (shown in main grid, depth=2)
 */
export interface CategoryLevel3 extends BaseCategoryLevel {
  icon?: string;
  children?: CategoryLevel4[];
}

/**
 * Level 2: Subcategory (shown in sidebar, depth=1)
 */
export interface CategoryLevel2 extends BaseCategoryLevel {
  icon?: string;
  children?: CategoryLevel3[];
}

/**
 * Level 1: Root category (shown in nav bar, depth=0)
 */
export interface CategoryLevel1 extends BaseCategoryLevel {
  icon?: string;
  description?: string;
  children?: CategoryLevel2[];
}

/**
 * Generic category type for flexible usage
 */
export type Category =
  | CategoryLevel1
  | CategoryLevel2
  | CategoryLevel3
  | CategoryLevel4
  | CategoryLevel5;

/**
 * Featured product for display in MegaMenu
 */
export interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: 'new' | 'promo' | 'bestseller';
}

/**
 * MegaMenu state for managing active selections
 */
export interface MegaMenuState {
  isOpen: boolean;
  activeL1: string | null;
  activeL2: string | null;
  activeL3: string | null;
}

/**
 * Icon name type for CategoryIcon component
 */
export type IconName =
  | 'bolt'
  | 'droplets'
  | 'hammer'
  | 'thermometer'
  | 'screw'
  | 'pipe'
  | 'outlet'
  | 'cable'
  | 'lightbulb'
  | 'faucet'
  | 'fan'
  | 'flame'
  | 'snowflake'
  | 'lock'
  | 'key'
  | 'shield'
  | 'box'
  | 'ruler'
  | 'settings'
  | 'folder'
  | string;
