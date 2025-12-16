/**
 * Product Components - Main Export
 *
 * Collection of product display components for B2B jewelry e-commerce.
 *
 * Components:
 * - ProductCard: Standard grid card with hover effects, badges, pricing
 * - ProductCardCompact: Compact list view with quantity selector
 * - ProductCardHorizontal: Full-width card for search results
 * - ProductInfo: Detailed product information panel
 * - ProductInfoWithCart: ProductInfo with cart integration
 * - StockDisplay: Stock status indicator
 *
 * @packageDocumentation
 */

// ============================================================================
// Product Cards
// ============================================================================

export { ProductCard } from './ProductCard';
export type { ProductCardProps, PricingTier } from './ProductCard';

export { ProductCardCompact } from './ProductCardCompact';
export type { ProductCardCompactProps } from './ProductCardCompact';

export { ProductCardHorizontal } from './ProductCardHorizontal';
export type { ProductCardHorizontalProps } from './ProductCardHorizontal';

// ============================================================================
// Product Information
// ============================================================================

export { ProductInfo } from './ProductInfo';
export { ProductInfoWithCart } from './ProductInfoWithCart';
export { StockDisplay } from './StockDisplay';

// ============================================================================
// Default Export - ProductCard for convenience
// ============================================================================

export { ProductCard as default } from './ProductCard';
