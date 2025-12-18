/**
 * MegaMenu Types
 *
 * Type definitions for the 5-level MegaMenu navigation component.
 * Supports hierarchical category structure with icons and metadata.
 */

/**
 * Level 5: Deepest category item (leaf node)
 */
export interface CategoryLevel5 {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

/**
 * Level 4: Sub-sub-subcategory
 */
export interface CategoryLevel4 {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
  children?: CategoryLevel5[];
}

/**
 * Level 3: Sub-subcategory (shown in main grid)
 */
export interface CategoryLevel3 {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
  children?: CategoryLevel4[];
}

/**
 * Level 2: Subcategory (shown in sidebar)
 */
export interface CategoryLevel2 {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
  children?: CategoryLevel3[];
}

/**
 * Level 1: Root category (shown in nav bar)
 */
export interface CategoryLevel1 {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount?: number;
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
