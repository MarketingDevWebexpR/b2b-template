'use client';

/**
 * ProductCardStock Component
 *
 * Displays B2B stock information with:
 * - Stock status indicator (colored dot)
 * - Available quantity
 * - Warehouse location
 * - Backorder status
 *
 * Status indicators:
 * - Green (in_stock): > 10 units
 * - Orange (low_stock): 1-10 units
 * - Red (out_of_stock): 0 units
 * - Gray (backorder): available on order
 *
 * @packageDocumentation
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ProductCardStockProps, ProductStockStatus } from './types';

/**
 * Stock status configuration
 */
const stockStatusConfig: Record<
  ProductStockStatus,
  {
    label: string;
    dotClass: string;
    textClass: string;
    bgClass: string;
    icon: 'full' | 'half' | 'empty';
  }
> = {
  in_stock: {
    label: 'En stock',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    icon: 'full',
  },
  low_stock: {
    label: 'Stock faible',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
    icon: 'half',
  },
  out_of_stock: {
    label: 'Rupture',
    dotClass: 'bg-red-500',
    textClass: 'text-red-700',
    bgClass: 'bg-red-50',
    icon: 'empty',
  },
  backorder: {
    label: 'Sur commande',
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-600',
    bgClass: 'bg-gray-50',
    icon: 'half',
  },
};

/**
 * Stock dot indicator icon
 */
function StockDot({
  status,
  className,
}: {
  status: ProductStockStatus;
  className?: string;
}) {
  const config = stockStatusConfig[status];

  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        config.dotClass,
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Warehouse location icon
 */
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-3.5 h-3.5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

/**
 * ProductCardStock - B2B stock display component
 *
 * Shows stock availability with visual indicators,
 * quantity, and warehouse information.
 */
export function ProductCardStock({
  stock,
  mode = 'inline',
  showWarehouse = true,
  className,
}: ProductCardStockProps) {
  const config = stockStatusConfig[stock.status];

  // Format quantity for display
  const quantityDisplay = useMemo(() => {
    if (stock.status === 'out_of_stock') return null;
    if (stock.status === 'backorder') return 'Disponible sous 2-3 semaines';
    return `(${stock.quantity})`;
  }, [stock.status, stock.quantity]);

  // Badge mode - compact single-line badge
  if (mode === 'badge') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
          config.bgClass,
          config.textClass,
          className
        )}
        role="status"
        aria-label={`Stock: ${config.label}${quantityDisplay ? ` ${quantityDisplay}` : ''}`}
      >
        <StockDot status={stock.status} />
        <span>{config.label}</span>
        {quantityDisplay && stock.status !== 'backorder' && (
          <span className="font-normal">{quantityDisplay}</span>
        )}
      </span>
    );
  }

  // Inline mode - horizontal layout
  if (mode === 'inline') {
    return (
      <div
        className={cn('flex items-center gap-3 text-sm', className)}
        role="status"
        aria-label={`Stock: ${config.label}${quantityDisplay ? ` ${quantityDisplay}` : ''}`}
      >
        {/* Stock status */}
        <div className={cn('flex items-center gap-1.5', config.textClass)}>
          <StockDot status={stock.status} />
          <span className="font-medium">{config.label}</span>
          {quantityDisplay && stock.status !== 'backorder' && (
            <span className="font-normal">{quantityDisplay}</span>
          )}
        </div>

        {/* Warehouse */}
        {showWarehouse && stock.warehouseName && stock.status !== 'out_of_stock' && (
          <div className="flex items-center gap-1 text-gray-500">
            <LocationIcon />
            <span>{stock.warehouseName}</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed mode - vertical layout with more info
  return (
    <div
      className={cn('space-y-2', className)}
      role="status"
      aria-label={`Stock: ${config.label}`}
    >
      {/* Main status */}
      <div className={cn('flex items-center gap-2', config.textClass)}>
        <StockDot status={stock.status} className="w-2.5 h-2.5" />
        <span className="font-medium">{config.label}</span>
        {quantityDisplay && stock.status !== 'backorder' && (
          <span className="font-semibold">{quantityDisplay}</span>
        )}
      </div>

      {/* Warehouse info */}
      {showWarehouse && stock.warehouseName && stock.status !== 'out_of_stock' && (
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <LocationIcon />
          <span>{stock.warehouseName}</span>
          {stock.warehouseCode && (
            <span className="text-gray-400">({stock.warehouseCode})</span>
          )}
        </div>
      )}

      {/* Restock info */}
      {stock.restockDate && stock.status === 'out_of_stock' && (
        <div className="text-sm text-gray-500">
          Reapprovisionnement prevu le{' '}
          <span className="font-medium">
            {new Date(stock.restockDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      )}

      {/* Low stock warning */}
      {stock.status === 'low_stock' && (
        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Commandez rapidement, stock limite
        </div>
      )}
    </div>
  );
}

/**
 * Compact stock indicator for table/list views
 */
export function ProductCardStockCompact({
  stock,
  className,
}: {
  stock: { quantity: number; status: ProductStockStatus };
  className?: string;
}) {
  const config = stockStatusConfig[stock.status];

  return (
    <div
      className={cn('flex items-center gap-1.5 text-sm', className)}
      role="status"
    >
      <StockDot status={stock.status} />
      <span className={config.textClass}>
        {stock.status === 'out_of_stock'
          ? 'Rupture'
          : stock.status === 'backorder'
            ? 'Cde'
            : stock.quantity}
      </span>
    </div>
  );
}

/**
 * Stock indicator for grid cards - minimal
 */
export function ProductCardStockBadge({
  status,
  quantity,
  warehouseName,
  className,
}: {
  status: ProductStockStatus;
  quantity?: number;
  warehouseName?: string;
  className?: string;
}) {
  const config = stockStatusConfig[status];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className={cn('flex items-center gap-1.5 text-sm', config.textClass)}>
        <StockDot status={status} />
        <span className="font-medium">{config.label}</span>
        {quantity !== undefined && status !== 'out_of_stock' && status !== 'backorder' && (
          <span>({quantity})</span>
        )}
      </div>
      {warehouseName && status !== 'out_of_stock' && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <LocationIcon className="w-3 h-3" />
          <span>{warehouseName}</span>
        </div>
      )}
    </div>
  );
}

export default ProductCardStock;
