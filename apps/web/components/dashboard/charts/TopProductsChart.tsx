'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/formatters';

/**
 * Product data for the top products chart
 */
export interface ProductData {
  /** Product ID */
  productId: string;
  /** Product name */
  productName: string;
  /** Product SKU */
  sku: string;
  /** Quantity ordered */
  quantity: number;
  /** Total spending on this product */
  totalSpending: number;
  /** Average price per unit */
  averagePrice?: number;
}

export interface TopProductsChartProps {
  /** Array of product data (will show top 10) */
  data: ProductData[];
  /** Currency code */
  currency?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Number of products to show (default: 10) */
  limit?: number;
  /** Additional class names */
  className?: string;
}

/**
 * View mode for the chart
 */
type ViewMode = 'amount' | 'quantity';

/**
 * TopProductsChart Component
 *
 * Displays top products as horizontal bar chart with toggle
 * between quantity and amount views.
 *
 * @example
 * ```tsx
 * <TopProductsChart
 *   data={[
 *     { productId: '1', productName: 'Bracelet Or 18K', sku: 'BRA-001', quantity: 45, totalSpending: 20250 },
 *     // ...
 *   ]}
 *   limit={10}
 * />
 * ```
 */
export function TopProductsChart({
  data,
  currency = 'EUR',
  isLoading = false,
  limit = 10,
  className,
}: TopProductsChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('amount');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Process and sort data
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a, b) => {
      if (viewMode === 'amount') {
        return b.totalSpending - a.totalSpending;
      }
      return b.quantity - a.quantity;
    });

    return sorted.slice(0, limit);
  }, [data, viewMode, limit]);

  // Calculate max value for bar scaling
  const maxValue = useMemo(() => {
    if (sortedData.length === 0) return 1;

    if (viewMode === 'amount') {
      return Math.max(...sortedData.map((p) => p.totalSpending));
    }
    return Math.max(...sortedData.map((p) => p.quantity));
  }, [sortedData, viewMode]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)} aria-busy="true">
        {/* Toggle skeleton */}
        <div className="flex justify-end">
          <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse" />
        </div>

        {/* Bars skeleton */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-neutral-100 rounded w-48 animate-pulse" />
              <div className="h-4 bg-neutral-100 rounded w-20 animate-pulse" />
            </div>
            <div
              className="h-2 bg-neutral-100 rounded-full animate-pulse"
              style={{ width: `${100 - i * 15}%` }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-neutral-500 font-sans text-body-sm py-8',
          className
        )}
        role="img"
        aria-label="Aucune donnee disponible"
      >
        Aucune donnee de produit disponible
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* View mode toggle */}
      <div className="flex justify-end">
        <div
          role="group"
          aria-label="Mode d affichage"
          className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'amount'}
            onClick={() => setViewMode('amount')}
            className={cn(
              'px-3 py-1.5 font-sans text-caption font-medium rounded transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1',
              viewMode === 'amount'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-600'
            )}
          >
            Par montant
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'quantity'}
            onClick={() => setViewMode('quantity')}
            className={cn(
              'px-3 py-1.5 font-sans text-caption font-medium rounded transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1',
              viewMode === 'quantity'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-600'
            )}
          >
            Par quantite
          </button>
        </div>
      </div>

      {/* Products list */}
      <div
        className="space-y-4"
        role="list"
        aria-label={`Top ${sortedData.length} produits par ${viewMode === 'amount' ? 'montant' : 'quantite'}`}
      >
        {sortedData.map((product, index) => {
          const value = viewMode === 'amount' ? product.totalSpending : product.quantity;
          const barWidth = (value / maxValue) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={product.productId}
              className={cn(
                'p-3 rounded-lg transition-colors duration-150 cursor-default',
                isHovered ? 'bg-neutral-100' : ''
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="listitem"
            >
              {/* Product info row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-caption text-neutral-500 font-medium w-5">
                      {index + 1}.
                    </span>
                    <span className="font-sans text-body-sm text-neutral-900 truncate font-medium">
                      {product.productName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-7 mt-0.5">
                    <span className="font-sans text-caption text-neutral-500">
                      SKU: {product.sku}
                    </span>
                  </div>
                </div>

                {/* Value display */}
                <div className="text-right flex-shrink-0">
                  <p className="font-sans text-body-sm font-semibold text-neutral-900">
                    {viewMode === 'amount'
                      ? formatCurrency(product.totalSpending, currency)
                      : `${formatNumber(product.quantity)} unites`}
                  </p>
                  <p className="font-sans text-caption text-neutral-500">
                    {viewMode === 'amount'
                      ? `${formatNumber(product.quantity)} unites`
                      : formatCurrency(product.totalSpending, currency)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="ml-7">
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      index === 0 ? 'bg-accent' : 'bg-accent/30'
                    )}
                    style={{ width: `${barWidth}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={maxValue}
                  />
                </div>
              </div>

              {/* Expanded info on hover */}
              {isHovered && product.averagePrice && (
                <div className="ml-7 mt-2 pt-2 border-t border-neutral-200">
                  <p className="font-sans text-caption text-neutral-500">
                    Prix moyen: {formatCurrency(product.averagePrice, currency)} / unite
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact version of TopProductsChart for smaller spaces
 * Shows only top 5 products with simplified display
 */
export function TopProductsCompact({
  data,
  currency = 'EUR',
  className,
}: Pick<TopProductsChartProps, 'data' | 'currency' | 'className'>) {
  // Get top 5 by spending
  const topProducts = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => b.totalSpending - a.totalSpending).slice(0, 5);
  }, [data]);

  const maxSpending = useMemo(() => {
    if (topProducts.length === 0) return 1;
    return Math.max(...topProducts.map((p) => p.totalSpending));
  }, [topProducts]);

  if (!data || data.length === 0) {
    return (
      <p className="text-neutral-500 font-sans text-body-sm py-4">
        Aucune donnee disponible
      </p>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {topProducts.map((product, index) => (
        <div key={product.productId} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-body-sm text-neutral-900 truncate max-w-[60%]">
              {index + 1}. {product.productName}
            </span>
            <span className="font-sans text-caption text-neutral-500">
              {product.quantity} unites
            </span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                'bg-accent'
              )}
              style={{ width: `${(product.totalSpending / maxSpending) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-sans text-caption text-neutral-500">
              SKU: {product.sku}
            </span>
            <span className="font-sans text-caption font-medium text-neutral-600">
              {formatCurrency(product.totalSpending, currency)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TopProductsChart;
