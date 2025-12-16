'use client';

/**
 * ComparisonTable - Product Comparison Table
 *
 * Displays products side by side with:
 * - Product images in header
 * - Rows for each characteristic (name, price, brand, stock, specs)
 * - Best value highlighting per row
 * - Add to cart and remove actions
 *
 * @packageDocumentation
 */

import { memo, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useComparison } from './ComparisonContext';
import type { Product } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface ComparisonTableProps {
  /** Products to compare (uses context if not provided) */
  products?: Product[];
  /** Whether to show the remove button */
  showRemoveButton?: boolean;
  /** Whether to show add to cart button */
  showAddToCart?: boolean;
  /** Whether to highlight best values */
  highlightBest?: boolean;
  /** Whether table is in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface ComparisonRowProps {
  label: string;
  values: (string | number | null | undefined)[];
  highlightBest?: boolean;
  highlightType?: 'lowest' | 'highest' | 'none';
  format?: (value: string | number | null | undefined) => string;
  isEven?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get stock status label
 */
function getStockLabel(stock: number, isAvailable: boolean): string {
  if (!isAvailable) return 'Indisponible';
  if (stock === 0) return 'Rupture';
  if (stock <= 5) return `Faible (${stock})`;
  if (stock <= 20) return `Limite (${stock})`;
  return `En stock (${stock})`;
}

/**
 * Get stock status color class
 */
function getStockColorClass(stock: number, isAvailable: boolean): string {
  if (!isAvailable || stock === 0) return 'text-red-600';
  if (stock <= 5) return 'text-amber-600';
  return 'text-green-600';
}

/**
 * Find best value indices based on type
 */
function findBestIndices(
  values: (string | number | null | undefined)[],
  type: 'lowest' | 'highest'
): number[] {
  const numericValues = values.map((v) => {
    if (v === null || v === undefined) return null;
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return isNaN(num) ? null : num;
  });

  const validValues = numericValues.filter((v): v is number => v !== null);
  if (validValues.length === 0) return [];

  const bestValue = type === 'lowest'
    ? Math.min(...validValues)
    : Math.max(...validValues);

  return numericValues
    .map((v, i) => (v === bestValue ? i : -1))
    .filter((i) => i !== -1);
}

// ============================================================================
// Sub-Components
// ============================================================================

const ComparisonRow = memo(function ComparisonRow({
  label,
  values,
  highlightBest = false,
  highlightType = 'none',
  format = (v) => String(v ?? '-'),
  isEven = false,
}: ComparisonRowProps) {
  const bestIndices = useMemo(() => {
    if (!highlightBest || highlightType === 'none') return [];
    return findBestIndices(values, highlightType);
  }, [values, highlightBest, highlightType]);

  return (
    <tr
      className={cn(
        isEven ? 'bg-neutral-50' : 'bg-white',
        'transition-colors duration-150'
      )}
    >
      {/* Row label */}
      <th
        scope="row"
        className={cn(
          'px-4 py-3',
          'text-left text-sm font-medium text-neutral-900',
          'border-r border-neutral-200',
          'sticky left-0 z-10',
          isEven ? 'bg-neutral-50' : 'bg-white'
        )}
      >
        {label}
      </th>

      {/* Values */}
      {values.map((value, index) => {
        const isBest = bestIndices.includes(index);

        return (
          <td
            key={index}
            className={cn(
              'px-4 py-3',
              'text-center text-sm text-neutral-900',
              'border-r border-neutral-200 last:border-r-0',
              isBest && [
                'bg-green-50',
                'font-medium',
                'relative',
              ]
            )}
          >
            {format(value)}
            {isBest && (
              <span
                className={cn(
                  'absolute top-1 right-1',
                  'w-4 h-4',
                  'flex items-center justify-center',
                  'bg-green-600 text-white',
                  'rounded-full',
                  'text-[10px]'
                )}
                title="Meilleure valeur"
                aria-label="Meilleure valeur"
              >
                <svg
                  className="w-2.5 h-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
});

interface ProductHeaderCellProps {
  product: Product;
  onRemove?: (productId: string) => void;
  showRemoveButton?: boolean;
}

const ProductHeaderCell = memo(function ProductHeaderCell({
  product,
  onRemove,
  showRemoveButton = true,
}: ProductHeaderCellProps) {
  const handleRemove = useCallback(() => {
    onRemove?.(product.id);
  }, [product.id, onRemove]);

  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-4',
        'text-center',
        'border-r border-neutral-200 last:border-r-0',
        'bg-white',
        'min-w-[200px]'
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Remove button */}
        {showRemoveButton && onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'absolute top-2 right-2',
              'p-1.5',
              'text-neutral-500 hover:text-red-600',
              'hover:bg-red-50',
              'rounded-lg',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600'
            )}
            aria-label={`Retirer ${product.name} de la comparaison`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Product image */}
        <Link
          href={`/produits/${product.slug}`}
          className={cn(
            'relative w-24 h-24 sm:w-32 sm:h-32',
            'rounded-lg overflow-hidden',
            'bg-neutral-100',
            'border border-neutral-200',
            'hover:border-accent',
            'transition-all duration-200',
            'group'
          )}
        >
          <Image
            src={product.images[0] || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 96px, 128px"
          />
        </Link>

        {/* Product name */}
        <Link
          href={`/produits/${product.slug}`}
          className={cn(
            'text-sm font-medium text-neutral-900',
            'hover:text-accent',
            'transition-colors duration-200',
            'line-clamp-2 text-center',
            'max-w-[180px]'
          )}
        >
          {product.name}
        </Link>

        {/* Reference */}
        <span className="text-xs text-neutral-500">
          Ref: {product.reference}
        </span>
      </div>
    </th>
  );
});

interface ActionsCellProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isLoading?: boolean;
}

const ActionsCell = memo(function ActionsCell({
  product,
  onAddToCart,
  isLoading = false,
}: ActionsCellProps) {
  const handleAddToCart = useCallback(() => {
    onAddToCart(product);
  }, [product, onAddToCart]);

  const isOutOfStock = !product.isAvailable || product.stock === 0;

  return (
    <td
      className={cn(
        'px-4 py-4',
        'text-center',
        'border-r border-neutral-200 last:border-r-0',
        'bg-white'
      )}
    >
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
        className={cn(
          'w-full',
          'inline-flex items-center justify-center gap-2',
          'px-4 py-2.5',
          'text-sm font-medium',
          'rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          isOutOfStock
            ? [
                'bg-neutral-100 text-neutral-500',
                'cursor-not-allowed',
              ]
            : [
                'bg-accent text-white',
                'hover:bg-accent/90',
                'focus-visible:ring-accent',
              ]
        )}
      >
        {isLoading ? (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{isOutOfStock ? 'Indisponible' : 'Ajouter'}</span>
          </>
        )}
      </button>
    </td>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const ComparisonTable = memo(function ComparisonTable({
  products: productsProp,
  showRemoveButton = true,
  showAddToCart = true,
  highlightBest = true,
  compact = false,
  className,
}: ComparisonTableProps) {
  const { products: contextProducts, removeFromCompare } = useComparison();
  const { addToCart, isLoading: cartIsLoading } = useCart();

  // Use provided products or context products
  const products = productsProp ?? contextProducts;

  // Handle add to cart
  const handleAddToCart = useCallback(
    async (product: Product) => {
      await addToCart(product, 1);
    },
    [addToCart]
  );

  // Don't render if no products
  if (products.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'py-12 px-4',
          'text-center',
          className
        )}
      >
        <svg
          className="w-16 h-16 text-neutral-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Aucun produit a comparer
        </h3>
        <p className="text-sm text-neutral-600 max-w-sm">
          Ajoutez des produits a la comparaison en cliquant sur le bouton
          &quot;Comparer&quot; sur les fiches produits.
        </p>
      </div>
    );
  }

  // Extract values for each row
  const prices = products.map((p) => p.price);
  const stocks = products.map((p) => p.stock);
  const brands = products.map((p) => p.brand ?? '-');
  const materials = products.map((p) => p.materials?.join(', ') ?? '-');
  const weights = products.map((p) => p.weight);
  const origins = products.map((p) => p.origin ?? '-');
  const collections = products.map((p) => p.collection ?? '-');
  const styles = products.map((p) => p.style ?? '-');
  const warranties = products.map((p) => p.warranty);

  return (
    <div
      className={cn(
        'overflow-x-auto',
        '-mx-4 sm:mx-0',
        className
      )}
      role="region"
      aria-label="Tableau de comparaison des produits"
    >
      <table
        className={cn(
          'w-full min-w-max',
          'border-collapse',
          'border border-neutral-200',
          'bg-white'
        )}
      >
        {/* Header with product images */}
        <thead>
          <tr className="border-b border-neutral-200">
            {/* Empty cell for row labels column */}
            <th
              scope="col"
              className={cn(
                'px-4 py-4',
                'text-left text-sm font-semibold text-neutral-900',
                'border-r border-neutral-200',
                'bg-neutral-100',
                'sticky left-0 z-20',
                'min-w-[150px]'
              )}
            >
              Caracteristiques
            </th>

            {/* Product header cells */}
            {products.map((product) => (
              <ProductHeaderCell
                key={product.id}
                product={product}
                onRemove={showRemoveButton ? removeFromCompare : undefined}
                showRemoveButton={showRemoveButton}
              />
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Price row */}
          <ComparisonRow
            label="Prix HT"
            values={prices}
            highlightBest={highlightBest}
            highlightType="lowest"
            format={(v) => formatPrice(Number(v) || 0)}
            isEven={false}
          />

          {/* Stock row */}
          <tr className="bg-neutral-50">
            <th
              scope="row"
              className={cn(
                'px-4 py-3',
                'text-left text-sm font-medium text-neutral-900',
                'border-r border-neutral-200',
                'sticky left-0 z-10',
                'bg-neutral-50'
              )}
            >
              Stock
            </th>
            {products.map((product, index) => (
              <td
                key={product.id}
                className={cn(
                  'px-4 py-3',
                  'text-center text-sm font-medium',
                  'border-r border-neutral-200 last:border-r-0',
                  getStockColorClass(product.stock, product.isAvailable)
                )}
              >
                {getStockLabel(product.stock, product.isAvailable)}
              </td>
            ))}
          </tr>

          {/* Brand row */}
          <ComparisonRow
            label="Marque"
            values={brands}
            isEven={false}
          />

          {/* Materials row */}
          <ComparisonRow
            label="Materiaux"
            values={materials}
            isEven={true}
          />

          {/* Weight row */}
          <ComparisonRow
            label="Poids"
            values={weights}
            format={(v) => (v ? `${v} g` : '-')}
            isEven={false}
          />

          {/* Origin row */}
          <ComparisonRow
            label="Origine"
            values={origins}
            isEven={true}
          />

          {/* Collection row */}
          <ComparisonRow
            label="Collection"
            values={collections}
            isEven={false}
          />

          {/* Style row */}
          <ComparisonRow
            label="Style"
            values={styles}
            isEven={true}
          />

          {/* Warranty row */}
          <ComparisonRow
            label="Garantie"
            values={warranties}
            format={(v) => (v ? `${v} mois` : '-')}
            highlightBest={highlightBest}
            highlightType="highest"
            isEven={false}
          />

          {/* Actions row */}
          {showAddToCart && (
            <tr className="border-t-2 border-neutral-200">
              <th
                scope="row"
                className={cn(
                  'px-4 py-4',
                  'text-left text-sm font-medium text-neutral-900',
                  'border-r border-neutral-200',
                  'sticky left-0 z-10',
                  'bg-white'
                )}
              >
                Actions
              </th>
              {products.map((product) => (
                <ActionsCell
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isLoading={cartIsLoading}
                />
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default ComparisonTable;
