/**
 * Brand Colors Utility
 *
 * Generates deterministic colors for brand initials based on the brand name.
 * Uses a hash function to ensure consistent colors across renders.
 */

// Curated color palette that works well with the design system
// Colors are selected for good contrast with white text
const BRAND_COLORS = [
  '#f67828', // accent orange (primary brand color)
  '#d4a84b', // gold (luxury feel)
  '#3b82f6', // blue (trust)
  '#10b981', // emerald (premium)
  '#8b5cf6', // violet (creative)
  '#ec4899', // pink (feminine jewelry)
  '#14b8a6', // teal (modern)
  '#f59e0b', // amber (warm)
  '#6366f1', // indigo (sophisticated)
  '#84cc16', // lime (fresh)
  '#06b6d4', // cyan (cool)
  '#ef4444', // red (bold)
] as const;

// Background and text color pairs for better accessibility
export const BRAND_COLOR_PAIRS = [
  { bg: '#fff7ed', text: '#c2410c' }, // orange light
  { bg: '#fefce8', text: '#a16207' }, // amber light
  { bg: '#f0fdf4', text: '#15803d' }, // green light
  { bg: '#eff6ff', text: '#1d4ed8' }, // blue light
  { bg: '#faf5ff', text: '#7c3aed' }, // purple light
  { bg: '#fdf2f8', text: '#be185d' }, // pink light
  { bg: '#f0fdfa', text: '#0d9488' }, // teal light
  { bg: '#fef3c7', text: '#b45309' }, // yellow light
  { bg: '#e0e7ff', text: '#4338ca' }, // indigo light
  { bg: '#dcfce7', text: '#166534' }, // emerald light
] as const;

/**
 * Simple hash function for strings
 * Produces consistent numerical hash from string input
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a deterministic color for a brand based on its name
 */
export function getBrandColor(brandName: string): string {
  const hash = hashString(brandName.toLowerCase());
  return BRAND_COLORS[hash % BRAND_COLORS.length];
}

/**
 * Get a deterministic background/text color pair for a brand
 * Better for accessibility with sufficient contrast
 */
export function getBrandColorPair(brandName: string): { bg: string; text: string } {
  const hash = hashString(brandName.toLowerCase());
  return BRAND_COLOR_PAIRS[hash % BRAND_COLOR_PAIRS.length];
}

/**
 * Extract initials from a brand name
 * Handles various name formats:
 * - "Cartier" -> "C"
 * - "Van Cleef" -> "VC"
 * - "Tiffany & Co." -> "TC"
 * - "THOMAS SABO" -> "TS"
 */
export function getBrandInitials(brandName: string): string {
  if (!brandName) return '?';

  // Remove common suffixes and clean the name
  const cleanName = brandName
    .replace(/&\s*(co\.?|cie\.?)/gi, '') // Remove "& Co." or "& Cie."
    .replace(/[^a-zA-Z\s]/g, '') // Remove non-letter characters
    .trim();

  // Split into words
  const words = cleanName.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return brandName.charAt(0).toUpperCase();
  }

  if (words.length === 1) {
    // Single word: take first letter or first two if short
    return words[0].charAt(0).toUpperCase();
  }

  // Multiple words: take first letter of first two significant words
  const initials = words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials;
}

/**
 * Generate a CSS gradient background for brand initials
 * Creates a subtle, professional gradient
 */
export function getBrandGradient(brandName: string): string {
  const { bg } = getBrandColorPair(brandName);
  // Return solid color for cleaner look
  return bg;
}

export default {
  getBrandColor,
  getBrandColorPair,
  getBrandInitials,
  getBrandGradient,
};
