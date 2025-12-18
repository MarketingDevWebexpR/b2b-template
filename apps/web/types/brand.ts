/**
 * Brand Types for B2B E-commerce
 *
 * Types for brands/marques displayed in the MegaMenu and brand pages.
 * Brands come from Medusa backend with optional Meilisearch enrichment.
 *
 * @packageDocumentation
 */

// ============================================================================
// Base Brand Types
// ============================================================================

/**
 * Brand representation from API
 */
export interface Brand {
  /** Unique brand identifier */
  id: string;
  /** Display name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Logo URL (CDN or S3) */
  logo_url: string | null;
  /** Country of origin */
  country: string | null;
  /** Number of products from this brand */
  product_count: number;
  /** Whether this is a premium/featured brand */
  is_premium?: boolean;
  /** Whether this brand is marked as favorite by admin */
  is_favorite?: boolean;
  /** Brand description */
  description?: string | null;
  /** Website URL */
  website_url?: string | null;
  /** Year founded */
  founded_year?: number | null;
}

/**
 * Brand response from API
 */
export interface BrandResponse {
  /** All brands */
  brands: Brand[];
  /** Total count */
  total: number;
  /** Premium/featured brands */
  premium: Brand[];
  /** Brands grouped by first letter */
  byLetter: Record<string, Brand[]>;
}

// ============================================================================
// UI Display Types
// ============================================================================

/**
 * Brand card display data
 */
export interface BrandCardData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  product_count: number;
  is_premium?: boolean;
  /** Whether this brand is marked as favorite by admin */
  is_favorite?: boolean;
  /** Pre-computed initials for fallback display */
  initials: string;
  /** Pre-computed color for initials background */
  color: BrandColor;
}

/**
 * Color pair for brand initials
 */
export interface BrandColor {
  bg: string;
  text: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Brand filter options
 */
export interface BrandFilterOptions {
  /** Search query */
  query?: string;
  /** Filter by country */
  country?: string;
  /** Only premium brands */
  premiumOnly?: boolean;
  /** Minimum product count */
  minProducts?: number;
  /** Sort by */
  sortBy?: 'name' | 'product_count' | 'country';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Brand navigation item for menus
 */
export interface BrandNavItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  initials: string;
  color: BrandColor;
  productCount: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Color palette for brand initials
 * Each color pair has good contrast for accessibility
 */
export const BRAND_COLORS: BrandColor[] = [
  { bg: '#fef3c7', text: '#92400e' }, // Amber
  { bg: '#dbeafe', text: '#1e40af' }, // Blue
  { bg: '#dcfce7', text: '#166534' }, // Green
  { bg: '#fce7f3', text: '#9d174d' }, // Pink
  { bg: '#e0e7ff', text: '#3730a3' }, // Indigo
  { bg: '#ffedd5', text: '#c2410c' }, // Orange
  { bg: '#f3e8ff', text: '#7c3aed' }, // Purple
  { bg: '#ccfbf1', text: '#0f766e' }, // Teal
  { bg: '#fef9c3', text: '#854d0e' }, // Yellow
  { bg: '#fee2e2', text: '#b91c1c' }, // Red
];
