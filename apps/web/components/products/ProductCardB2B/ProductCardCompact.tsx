'use client';

/**
 * ProductCardCompact Component
 *
 * Table row style compact card for B2B product display.
 * Optimized for bulk ordering and quick scanning.
 *
 * Layout (left to right):
 * - Checkbox (optional, for bulk selection)
 * - Reference
 * - Product name
 * - Brand
 * - Stock quantity
 * - Price
 * - Quantity selector + Add button
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePricing, useWarehouse } from '@/contexts';
import { ProductCardStockCompact } from './ProductCardStock';
import { ProductCardActions } from './ProductCardActions';
import type {
  ProductCardCompactProps,
  PriceInfo,
  StockInfo,
  ProductStockStatus,
} from './types';

/**
 * Determine stock status from quantity
 */
function getStockStatus(quantity: number, threshold: number = 10): ProductStockStatus {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}

/**
 * Format price for compact display
 */
function formatCompactPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Checkbox component for selection
 */
function Checkbox({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <label className={cn('relative flex items-center cursor-pointer', disabled && 'cursor-not-allowed', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
        aria-label={ariaLabel}
      />
      <div
        className={cn(
          'w-4 h-4 border rounded transition-all duration-150',
          'flex items-center justify-center',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2',
          checked
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50'
        )}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </label>
  );
}

/**
 * ProductCardCompact - Table row style card for B2B
 *
 * Minimal footprint design for efficient bulk ordering.
 * All key information visible at a glance.
 */
export function ProductCardCompact({
  product,
  showStock = true,
  showVolumeDiscount = false,
  showActions = true,
  onAddToCart,
  onToggleFavorite,
  onToggleCompare,
  isComparing = false,
  isFavorite = false,
  priceInfo,
  stockInfo,
  selectable = false,
  isSelected = false,
  onSelectionChange,
  className,
}: ProductCardCompactProps) {
  const [quantity, setQuantity] = useState(1);

  // Get pricing context
  let pricingContext;
  try {
    pricingContext = usePricing();
  } catch {
    pricingContext = null;
  }

  // Get warehouse context
  let warehouseContext;
  try {
    warehouseContext = useWarehouse();
  } catch {
    warehouseContext = null;
  }

  // Calculate price info
  const effectivePriceInfo: PriceInfo = useMemo(() => {
    if (priceInfo) return priceInfo;

    if (pricingContext) {
      const calculatedPrice = pricingContext.calculatePrice(
        product.id,
        product.price,
        quantity
      );

      return {
        unitPriceHT: calculatedPrice.unitPriceHT,
        unitPriceTTC: calculatedPrice.unitPriceTTC,
        currency: calculatedPrice.currency,
        originalPriceHT: calculatedPrice.originalPriceHT,
        discountPercent: calculatedPrice.discountPercent,
        volumeDiscounts: pricingContext.getVolumeDiscounts(product.id),
      };
    }

    return {
      unitPriceHT: product.price,
      unitPriceTTC: product.isPriceTTC ? product.price : product.price * 1.2,
      currency: 'EUR',
    };
  }, [priceInfo, pricingContext, product, quantity]);

  // Calculate stock info
  const effectiveStockInfo: StockInfo = useMemo(() => {
    if (stockInfo) return stockInfo;

    return {
      quantity: product.stock,
      status: getStockStatus(product.stock),
      warehouseName: warehouseContext?.selectedWarehouse?.name || undefined,
      lowStockThreshold: 10,
    };
  }, [stockInfo, warehouseContext, product.stock]);

  // Handlers
  const handleAddToCart = useCallback(() => {
    onAddToCart?.(product.id, quantity);
  }, [onAddToCart, product.id, quantity]);

  const handleSelectionChange = useCallback(
    (checked: boolean) => {
      onSelectionChange?.(checked);
    },
    [onSelectionChange]
  );

  const isOutOfStock = effectiveStockInfo.status === 'out_of_stock';

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 bg-white border-b border-gray-100',
        'transition-colors duration-150',
        'hover:bg-gray-50',
        isSelected && 'bg-blue-50 hover:bg-blue-50',
        className
      )}
      role="row"
    >
      {/* Checkbox */}
      {selectable && (
        <div className="flex-shrink-0" role="cell">
          <Checkbox
            checked={isSelected}
            onChange={handleSelectionChange}
            ariaLabel={`Selectionner ${product.name}`}
          />
        </div>
      )}

      {/* Reference */}
      <div className="w-24 flex-shrink-0 text-xs font-mono text-gray-600" role="cell">
        <span className="text-gray-400">REF:</span>{' '}
        <span className="font-medium text-gray-700">{product.reference}</span>
      </div>

      {/* Product Name */}
      <div className="flex-1 min-w-0" role="cell">
        <Link
          href={`/products/${product.id}`}
          className="text-sm text-gray-900 hover:text-blue-600 transition-colors truncate block"
        >
          {product.name}
        </Link>
      </div>

      {/* Brand */}
      <div className="w-24 flex-shrink-0 text-xs text-gray-500 uppercase tracking-wide truncate" role="cell">
        {product.brand || '-'}
      </div>

      {/* Stock */}
      {showStock && (
        <div className="w-16 flex-shrink-0 text-center" role="cell">
          <ProductCardStockCompact stock={effectiveStockInfo} />
        </div>
      )}

      {/* Price */}
      <div className="w-20 flex-shrink-0 text-right" role="cell">
        <span className="text-sm font-semibold text-gray-900">
          {formatCompactPrice(effectivePriceInfo.unitPriceHT, effectivePriceInfo.currency)}
        </span>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="w-28 flex-shrink-0" role="cell">
          <ProductCardActions
            productId={product.id}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={onAddToCart ? handleAddToCart : undefined}
            maxQuantity={effectiveStockInfo.quantity > 0 ? effectiveStockInfo.quantity : undefined}
            isOutOfStock={isOutOfStock}
            layout="compact"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Table header for compact card list
 */
export function ProductCardCompactHeader({
  selectable = false,
  showStock = true,
  showActions = true,
  allSelected = false,
  onSelectAll,
  className,
}: {
  selectable?: boolean;
  showStock?: boolean;
  showActions?: boolean;
  allSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200',
        'text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      role="row"
    >
      {selectable && (
        <div className="flex-shrink-0" role="columnheader">
          <Checkbox
            checked={allSelected}
            onChange={(checked) => onSelectAll?.(checked)}
            ariaLabel="Selectionner tous les produits"
          />
        </div>
      )}
      <div className="w-24 flex-shrink-0" role="columnheader">Reference</div>
      <div className="flex-1 min-w-0" role="columnheader">Produit</div>
      <div className="w-24 flex-shrink-0" role="columnheader">Marque</div>
      {showStock && (
        <div className="w-16 flex-shrink-0 text-center" role="columnheader">Stock</div>
      )}
      <div className="w-20 flex-shrink-0 text-right" role="columnheader">Prix HT</div>
      {showActions && (
        <div className="w-28 flex-shrink-0 text-center" role="columnheader">Actions</div>
      )}
    </div>
  );
}

/**
 * Container for compact card list with table semantics
 */
export function ProductCardCompactList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}
      role="table"
      aria-label="Liste des produits"
    >
      {children}
    </div>
  );
}

export default ProductCardCompact;
