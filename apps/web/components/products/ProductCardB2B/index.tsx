'use client';

/**
 * ProductCardB2B - Main Export
 *
 * Smart wrapper component that renders the appropriate card variant
 * based on the `variant` prop. Also exports all sub-components for
 * direct usage when more control is needed.
 *
 * @example
 * ```tsx
 * // Using the smart wrapper
 * <ProductCardB2B
 *   product={product}
 *   variant="grid"
 *   onAddToCart={(id, qty) => addToCart(id, qty)}
 * />
 *
 * // Using specific variants directly
 * <ProductCardGrid product={product} onAddToCart={handleAddToCart} />
 * <ProductCardList product={product} showDescription />
 * <ProductCardCompact product={product} selectable />
 * ```
 *
 * @packageDocumentation
 */

import { ProductCardGrid } from './ProductCardGrid';
import { ProductCardList } from './ProductCardList';
import { ProductCardCompact } from './ProductCardCompact';
import type { ProductCardB2BProps } from './types';

/**
 * ProductCardB2B - Smart Wrapper Component
 *
 * Automatically selects the appropriate card variant based on the
 * `variant` prop. Provides a unified API for all three layouts.
 */
export function ProductCardB2B({
  variant,
  ...props
}: ProductCardB2BProps) {
  switch (variant) {
    case 'grid':
      return <ProductCardGrid {...props} />;
    case 'list':
      return <ProductCardList {...props} />;
    case 'compact':
      return <ProductCardCompact {...props} />;
    default:
      return <ProductCardGrid {...props} />;
  }
}

// ============================================================================
// Named Exports - Card Variants
// ============================================================================

export { ProductCardGrid } from './ProductCardGrid';
export { ProductCardList } from './ProductCardList';
export {
  ProductCardCompact,
  ProductCardCompactHeader,
  ProductCardCompactList,
} from './ProductCardCompact';

// ============================================================================
// Named Exports - Sub-Components
// ============================================================================

export {
  ProductCardPrice,
  ProductCardPriceCompact,
} from './ProductCardPrice';

export {
  ProductCardStock,
  ProductCardStockCompact,
  ProductCardStockBadge,
} from './ProductCardStock';

export {
  ProductCardActions,
  ProductCardFloatingActions,
} from './ProductCardActions';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Main props
  ProductCardB2BProps,
  ProductCardVariant,
  // Variant props
  ProductCardGridProps,
  ProductCardListProps,
  ProductCardCompactProps,
  // Sub-component props
  ProductCardPriceProps,
  ProductCardStockProps,
  ProductCardActionsProps,
  // Data types
  PriceInfo,
  StockInfo,
  ProductStockStatus,
  // Mock helpers
  MockProductB2B,
} from './types';

export {
  createMockPriceInfo,
  createMockStockInfo,
  createMockProductB2B,
} from './types';

// ============================================================================
// Default Export
// ============================================================================

export default ProductCardB2B;
