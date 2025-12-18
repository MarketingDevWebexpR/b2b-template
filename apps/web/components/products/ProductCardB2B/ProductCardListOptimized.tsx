'use client';

/**
 * ProductCardListOptimized Component
 *
 * Optimized horizontal list card for B2B product display.
 * Single-row layout optimized for rapid scanning of product data.
 *
 * Features:
 * - Compact thumbnail on left
 * - All key data visible in one line (desktop)
 * - Quick quantity input + add to cart
 * - Hover state reveals additional actions
 * - Responsive layout for mobile
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import type { PriceInfo, StockInfo, ProductStockStatus } from './types';

// ============================================================================
// Types
// ============================================================================

export interface ProductCardListOptimizedProps {
  /** Product data */
  product: Product;
  /** Price information */
  priceInfo?: PriceInfo;
  /** Stock information */
  stockInfo?: StockInfo;
  /** Show stock indicator */
  showStock?: boolean;
  /** Show volume discount hint */
  showVolumeDiscount?: boolean;
  /** Callback when adding to cart */
  onAddToCart?: (productId: string, quantity: number) => void;
  /** Callback when toggling favorite */
  onToggleFavorite?: (productId: string) => void;
  /** Callback when toggling compare */
  onToggleCompare?: (productId: string) => void;
  /** Whether product is in favorites */
  isFavorite?: boolean;
  /** Whether product is being compared */
  isComparing?: boolean;
  /** Enable row selection (for bulk actions) */
  selectable?: boolean;
  /** Whether row is selected */
  isSelected?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selected: boolean) => void;
  /** Priority loading for image */
  priority?: boolean;
  /** Compact mode (even less padding) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

// ============================================================================
// Icons
// ============================================================================

const Icons = {
  Heart: ({ filled, className }: { filled?: boolean; className?: string }) => (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
  ),
  Compare: ({ active, className }: { active?: boolean; className?: string }) => (
    <svg className={className} fill={active ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h14M3 8h14M3 12h10M3 16h6" />
    </svg>
  ),
  Minus: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h10" />
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 5v10m5-5H5" />
    </svg>
  ),
  Cart: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Checkbox: ({ checked, className }: { checked?: boolean; className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="14" height="14" rx="2" fill={checked ? 'currentColor' : 'none'} />
      {checked && (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 10l3 3 5-6" stroke="white" strokeWidth={2} />
      )}
    </svg>
  ),
};

// ============================================================================
// Helper Functions
// ============================================================================

function getStockStatus(quantity: number, threshold: number = 10): ProductStockStatus {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}

function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Compact stock indicator */
const StockDot = memo(function StockDot({
  status,
  quantity,
  showQuantity = true,
  className,
}: {
  status: ProductStockStatus;
  quantity?: number;
  showQuantity?: boolean;
  className?: string;
}) {
  const config = {
    in_stock: { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'En stock' },
    low_stock: { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Faible' },
    out_of_stock: { dot: 'bg-red-500', text: 'text-red-700', label: 'Rupture' },
    backorder: { dot: 'bg-slate-400', text: 'text-slate-600', label: 'Cde' },
  };

  const { dot, text, label } = config[status];

  return (
    <div className={cn('flex items-center gap-1', className)} title={`${label}${quantity !== undefined ? ` (${quantity})` : ''}`}>
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dot)} />
      <span className={cn('text-xs font-medium whitespace-nowrap', text)}>
        {showQuantity && quantity !== undefined && status !== 'out_of_stock' ? quantity : label}
      </span>
    </div>
  );
});

/** Inline quantity input */
const InlineQuantityInput = memo(function InlineQuantityInput({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = parseInt(e.target.value, 10);
      if (isNaN(inputValue)) return;
      let newValue = Math.max(min, inputValue);
      if (max !== undefined) newValue = Math.min(max, newValue);
      onChange(newValue);
    },
    [min, max, onChange]
  );

  const handleDecrement = useCallback(() => {
    onChange(Math.max(min, value - 1));
  }, [value, min, onChange]);

  const handleIncrement = useCallback(() => {
    const newValue = max !== undefined ? Math.min(max, value + 1) : value + 1;
    onChange(newValue);
  }, [value, max, onChange]);

  return (
    <div
      className={cn(
        'inline-flex items-center h-7 rounded border border-neutral-200 bg-white',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-6 h-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
        aria-label="Diminuer"
      >
        <Icons.Minus className="w-3 h-3" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        min={min}
        max={max}
        className="w-8 h-full text-center text-xs font-medium text-neutral-900 border-x border-neutral-200 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Quantite"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className="w-6 h-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
        aria-label="Augmenter"
      >
        <Icons.Plus className="w-3 h-3" />
      </button>
    </div>
  );
});

/** Icon button for actions */
const IconButton = memo(function IconButton({
  onClick,
  active,
  disabled,
  label,
  children,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * ProductCardListOptimized - Dense list row for B2B
 *
 * Layout (left to right):
 * - [Checkbox] (optional)
 * - Image thumbnail (64px)
 * - Product info (brand, name, SKU)
 * - Stock indicator
 * - Price
 * - Quantity + Add to cart
 * - Actions (favorite, compare)
 */
export const ProductCardListOptimized = memo(function ProductCardListOptimized({
  product,
  priceInfo,
  stockInfo,
  showStock = true,
  showVolumeDiscount = false,
  onAddToCart,
  onToggleFavorite,
  onToggleCompare,
  isFavorite = false,
  isComparing = false,
  selectable = false,
  isSelected = false,
  onSelectionChange,
  priority = false,
  compact = false,
  className,
}: ProductCardListOptimizedProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Compute effective price info
  const effectivePrice: PriceInfo = useMemo(() => {
    if (priceInfo) return priceInfo;
    return {
      unitPriceHT: product.price,
      unitPriceTTC: product.isPriceTTC ? product.price : product.price * 1.2,
      currency: 'EUR',
      originalPriceHT: product.compareAtPrice,
      discountPercent: product.compareAtPrice
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : undefined,
      isPromotional: !!(product.compareAtPrice && product.compareAtPrice > product.price),
    };
  }, [priceInfo, product]);

  // Compute effective stock info
  const effectiveStock: StockInfo = useMemo(() => {
    if (stockInfo) return stockInfo;
    return {
      quantity: product.stock,
      status: getStockStatus(product.stock),
    };
  }, [stockInfo, product.stock]);

  const imageSrc = imageError || !product.images?.[0] ? PLACEHOLDER_IMAGE : product.images[0];
  const isOutOfStock = effectiveStock.status === 'out_of_stock';
  const brandName = (product as { brand_name?: string }).brand_name || product.brand;

  // Handlers
  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart || isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await onAddToCart(product.id, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
  }, [onAddToCart, product.id, quantity, isOutOfStock, isAdding]);

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite?.(product.id);
  }, [onToggleFavorite, product.id]);

  const handleToggleCompare = useCallback(() => {
    onToggleCompare?.(product.id);
  }, [onToggleCompare, product.id]);

  const handleSelectionToggle = useCallback(() => {
    onSelectionChange?.(!isSelected);
  }, [onSelectionChange, isSelected]);

  const padding = compact ? 'p-2' : 'p-3';
  const imageSize = compact ? 'w-14 h-14' : 'w-16 h-16';

  return (
    <article
      className={cn(
        'group flex items-center gap-3 bg-white border-b border-neutral-100',
        'transition-colors duration-150',
        'hover:bg-neutral-50',
        isSelected && 'bg-blue-50 hover:bg-blue-50',
        padding,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox (selectable mode) */}
      {selectable && (
        <button
          type="button"
          onClick={handleSelectionToggle}
          className={cn(
            'flex-shrink-0 w-5 h-5 flex items-center justify-center rounded',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            isSelected ? 'text-blue-600' : 'text-neutral-300 hover:text-neutral-500'
          )}
          aria-label={isSelected ? 'Deselectionner' : 'Selectionner'}
          aria-pressed={isSelected}
        >
          <Icons.Checkbox checked={isSelected} className="w-5 h-5" />
        </button>
      )}

      {/* Image */}
      <div className={cn('relative flex-shrink-0 rounded overflow-hidden bg-neutral-100', imageSize)}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 animate-pulse" />
        )}
        <Link
          href={`/produit/${product.slug || product.id}`}
          className="block w-full h-full"
          aria-label={`Voir ${product.name}`}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="64px"
            className={cn(
              'object-cover',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            priority={priority}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Link>

        {/* Badges overlay */}
        {(product.isNew || effectivePrice.isPromotional) && (
          <div className="absolute top-0.5 left-0.5 flex gap-0.5">
            {product.isNew && (
              <span className="px-1 py-0.5 text-[8px] font-bold uppercase bg-blue-600 text-white rounded">N</span>
            )}
            {effectivePrice.isPromotional && effectivePrice.discountPercent && (
              <span className="px-1 py-0.5 text-[8px] font-bold uppercase bg-red-600 text-white rounded">
                -{effectivePrice.discountPercent}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          {brandName && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex-shrink-0">
              {brandName}
            </span>
          )}
          <Link href={`/produit/${product.slug || product.id}`} className="group/link min-w-0">
            <h3 className="text-sm font-medium text-neutral-900 truncate group-hover/link:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        <p className="text-[11px] text-neutral-400 font-mono">
          REF: {product.reference || product.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Stock (desktop) */}
      {showStock && (
        <div className="hidden md:flex flex-shrink-0 w-20 justify-center">
          <StockDot
            status={effectiveStock.status}
            quantity={effectiveStock.quantity}
            showQuantity={true}
          />
        </div>
      )}

      {/* Price */}
      <div className="flex-shrink-0 w-24 text-right">
        <div className="flex flex-col items-end">
          <span
            className={cn(
              'text-sm font-bold whitespace-nowrap',
              effectivePrice.isPromotional ? 'text-red-600' : 'text-neutral-900'
            )}
          >
            {formatPrice(effectivePrice.unitPriceHT, effectivePrice.currency)}
          </span>
          <span className="text-[10px] text-neutral-400">HT</span>
          {effectivePrice.originalPriceHT && effectivePrice.originalPriceHT > effectivePrice.unitPriceHT && (
            <span className="text-[10px] text-neutral-400 line-through">
              {formatPrice(effectivePrice.originalPriceHT, effectivePrice.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity + Add to Cart */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <InlineQuantityInput
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={effectiveStock.quantity > 0 ? effectiveStock.quantity : undefined}
          disabled={isOutOfStock}
        />

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={cn(
            'h-7 px-3 flex items-center justify-center gap-1 rounded',
            'text-xs font-medium transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            isOutOfStock
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
          )}
        >
          {isAdding ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : justAdded ? (
            <Icons.Check className="w-3.5 h-3.5" />
          ) : (
            <>
              <Icons.Cart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isOutOfStock ? 'Indispo.' : 'Ajouter'}</span>
            </>
          )}
        </button>
      </div>

      {/* Actions (appear on hover on desktop) */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center gap-1',
          'md:transition-opacity md:duration-150',
          isHovered ? 'md:opacity-100' : 'md:opacity-0'
        )}
      >
        {onToggleFavorite && (
          <IconButton
            onClick={handleToggleFavorite}
            active={isFavorite}
            label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Icons.Heart
              filled={isFavorite}
              className={cn('w-4 h-4', isFavorite ? 'text-red-500' : '')}
            />
          </IconButton>
        )}
        {onToggleCompare && (
          <IconButton
            onClick={handleToggleCompare}
            active={isComparing}
            label={isComparing ? 'Retirer de la comparaison' : 'Comparer'}
          >
            <Icons.Compare active={isComparing} className="w-4 h-4" />
          </IconButton>
        )}
      </div>
    </article>
  );
});

/**
 * List header component for column labels
 */
export const ProductCardListHeader = memo(function ProductCardListHeader({
  selectable = false,
  showStock = true,
  onSelectAll,
  isAllSelected = false,
  className,
}: {
  selectable?: boolean;
  showStock?: boolean;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 bg-neutral-50 border-b border-neutral-200',
        'text-[10px] font-semibold uppercase tracking-wider text-neutral-500',
        className
      )}
    >
      {/* Checkbox */}
      {selectable && (
        <button
          type="button"
          onClick={onSelectAll}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
          aria-label={isAllSelected ? 'Tout deselectionner' : 'Tout selectionner'}
        >
          <Icons.Checkbox checked={isAllSelected} className={cn('w-5 h-5', isAllSelected ? 'text-blue-600' : 'text-neutral-300')} />
        </button>
      )}

      {/* Image placeholder */}
      <div className="flex-shrink-0 w-16" />

      {/* Product */}
      <div className="flex-1 min-w-0">Produit</div>

      {/* Stock */}
      {showStock && (
        <div className="hidden md:flex flex-shrink-0 w-20 justify-center">Stock</div>
      )}

      {/* Price */}
      <div className="flex-shrink-0 w-24 text-right">Prix HT</div>

      {/* Qty + Add */}
      <div className="flex-shrink-0 w-[140px]">Quantite</div>

      {/* Actions */}
      <div className="flex-shrink-0 w-[60px]" />
    </div>
  );
});

export default ProductCardListOptimized;
