/**
 * ProductComparison - Main Export
 *
 * B2B Product Comparison Feature
 * Allows users to compare up to 4 products side by side.
 *
 * Components:
 * - ComparisonProvider: Context provider for comparison state
 * - ComparisonDrawer: Floating bottom drawer with product thumbnails
 * - ComparisonTable: Comparison table with product characteristics
 * - ComparisonModal: Fullscreen modal for detailed comparison
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider (in Providers.tsx)
 * <ComparisonProvider>
 *   <App />
 *   <ComparisonDrawer />
 *   <ComparisonModal />
 * </ComparisonProvider>
 *
 * // Use in product card
 * const { toggleCompare, isInComparison, isAtLimit } = useComparison();
 *
 * <button
 *   onClick={() => toggleCompare(product)}
 *   disabled={isAtLimit && !isInComparison(product.id)}
 * >
 *   {isInComparison(product.id) ? 'Retirer' : 'Comparer'}
 * </button>
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Context & Provider
// ============================================================================

export {
  ComparisonProvider,
  useComparison,
  useProductComparison,
  COMPARISON_STORAGE_KEY,
  MAX_COMPARISON_ITEMS,
} from './ComparisonContext';

export type {
  ComparisonState,
  ComparisonContextType,
  ComparisonProviderProps,
} from './ComparisonContext';

// ============================================================================
// Components
// ============================================================================

export { ComparisonDrawer } from './ComparisonDrawer';
export type { ComparisonDrawerProps } from './ComparisonDrawer';

export { ComparisonTable } from './ComparisonTable';
export type { ComparisonTableProps } from './ComparisonTable';

export { ComparisonModal } from './ComparisonModal';
export type { ComparisonModalProps } from './ComparisonModal';

// ============================================================================
// Default Export - ComparisonDrawer for convenience
// ============================================================================

export { ComparisonDrawer as default } from './ComparisonDrawer';
