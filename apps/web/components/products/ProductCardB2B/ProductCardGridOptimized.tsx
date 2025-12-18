'use client';

/**
 * ProductCardGridOptimized Component
 *
 * Optimized vertical grid card for B2B product display.
 * Designed for ~280px width with maximum information density.
 *
 * Features:
 * - Compact badge display (new, promo, low stock)
 * - Efficient space utilization for all required data
 * - Hover-revealed actions for cleaner default state
 * - Inline quantity selector with quick add
 * - Accessible and keyboard navigable
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import type { B2BProduct } from '@/types/product-b2b';
import type { PriceInfo, StockInfo, ProductStockStatus } from './types';
import { ProductCardB2BBadges } from './ProductCardB2BBadges';

// ============================================================================
// Types
// ============================================================================

export interface ProductCardGridOptimizedProps {
  /** Product data */
  product: Product;
  /** B2B product metadata (optional, for displaying certifications, etc.) */
  b2bProduct?: Partial<B2BProduct>;
  /** Price information */
  priceInfo?: PriceInfo;
  /** Stock information */
  stockInfo?: StockInfo;
  /** Show stock indicator */
  showStock?: boolean;
  /** Show volume discount hint */
  showVolumeDiscount?: boolean;
  /** Show B2B badges (certifications, sustainability) */
  showB2BBadges?: boolean;
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
  /** Priority loading for image */
  priority?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

// ============================================================================
// Icons (inline SVG for performance)
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

/** Compact badge for status indicators */
const StatusBadge = memo(function StatusBadge({
  variant,
  children,
  className,
}: {
  variant: 'new' | 'promo' | 'lowStock';
  children: React.ReactNode;
  className?: string;
}) {
  const variants = {
    new: 'bg-blue-600 text-white',
    promo: 'bg-red-600 text-white',
    lowStock: 'bg-amber-500 text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
});

/** Stock indicator dot with label */
const StockIndicator = memo(function StockIndicator({
  status,
  quantity,
  className,
}: {
  status: ProductStockStatus;
  quantity?: number;
  className?: string;
}) {
  const config = {
    in_stock: { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'En stock' },
    low_stock: { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Stock faible' },
    out_of_stock: { dot: 'bg-red-500', text: 'text-red-700', label: 'Rupture' },
    backorder: { dot: 'bg-slate-400', text: 'text-slate-600', label: 'Sur cde' },
  };

  const { dot, text, label } = config[status];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      <span className={cn('text-xs font-medium', text)}>
        {label}
        {quantity !== undefined && status !== 'out_of_stock' && (
          <span className="font-normal ml-0.5">({quantity})</span>
        )}
      </span>
    </div>
  );
});

/** Compact quantity selector */
const QuantitySelector = memo(function QuantitySelector({
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
  const handleDecrement = useCallback(() => {
    onChange(Math.max(min, value - 1));
  }, [value, min, onChange]);

  const handleIncrement = useCallback(() => {
    const newValue = max !== undefined ? Math.min(max, value + 1) : value + 1;
    onChange(newValue);
  }, [value, max, onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = parseInt(e.target.value, 10);
      if (isNaN(inputValue)) return;
      let newValue = Math.max(min, inputValue);
      if (max !== undefined) newValue = Math.min(max, newValue);
      onChange(newValue);
    },
    [min, max, onChange]
  );

  return (
    <div
      className={cn(
        'inline-flex items-center h-8 rounded border border-neutral-200 bg-white',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-7 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        aria-label="Diminuer"
      >
        <Icons.Minus className="w-3.5 h-3.5" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="w-9 h-full text-center text-sm font-medium text-neutral-900 border-x border-neutral-200 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Quantite"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className="w-7 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        aria-label="Augmenter"
      >
        <Icons.Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

/** Floating action button */
const FloatingAction = memo(function FloatingAction({
  onClick,
  active,
  label,
  children,
  className,
}: {
  onClick: () => void;
  active?: boolean;
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
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-full',
        'bg-white/95 backdrop-blur-sm shadow-sm border border-neutral-100',
        'transition-all duration-150',
        'hover:bg-white hover:shadow-md hover:scale-105',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        active && 'text-red-500',
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
 * ProductCardGridOptimized - Compact grid card optimized for B2B
 *
 * Designed for ~280px width with maximum data density:
 * - Image with overlay badges
 * - Brand + product name
 * - SKU reference
 * - Stock status
 * - Price with discount
 * - Quantity + add to cart
 */
export const ProductCardGridOptimized = memo(function ProductCardGridOptimized({
  product,
  b2bProduct,
  priceInfo,
  stockInfo,
  showStock = true,
  showVolumeDiscount = true,
  showB2BBadges = false,
  onAddToCart,
  onToggleFavorite,
  onToggleCompare,
  isFavorite = false,
  isComparing = false,
  priority = false,
  className,
}: ProductCardGridOptimizedProps) {
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

  return (
    <article
      className={cn(
        'group relative flex flex-col bg-white rounded-lg border border-neutral-200',
        'transition-all duration-200',
        'hover:shadow-lg hover:border-neutral-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-neutral-50">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 animate-pulse" />
        )}

        {/* Product Image */}
        <Link
          href={`/produit/${product.slug || product.id}`}
          className="block w-full h-full"
          aria-label={`Voir ${product.name}`}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className={cn(
              'object-cover transition-all duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              isHovered && 'scale-105'
            )}
            priority={priority}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Link>

        {/* Top Left Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.isNew && <StatusBadge variant="new">Nouveau</StatusBadge>}
          {effectivePrice.isPromotional && effectivePrice.discountPercent && (
            <StatusBadge variant="promo">-{effectivePrice.discountPercent}%</StatusBadge>
          )}
          {effectiveStock.status === 'low_stock' && (
            <StatusBadge variant="lowStock">Stock faible</StatusBadge>
          )}
        </div>

        {/* Floating Actions (appear on hover) */}
        <div
          className={cn(
            'absolute top-2 right-2 z-10 flex flex-col gap-1.5',
            'transition-all duration-200',
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          )}
        >
          {onToggleFavorite && (
            <FloatingAction
              onClick={handleToggleFavorite}
              active={isFavorite}
              label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Icons.Heart filled={isFavorite} className={cn('w-4 h-4', isFavorite ? 'text-red-500' : 'text-neutral-600')} />
            </FloatingAction>
          )}
          {onToggleCompare && (
            <FloatingAction
              onClick={handleToggleCompare}
              active={isComparing}
              label={isComparing ? 'Retirer de la comparaison' : 'Comparer'}
            >
              <Icons.Compare active={isComparing} className={cn('w-4 h-4', isComparing ? 'text-blue-600' : 'text-neutral-600')} />
            </FloatingAction>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {/* Brand */}
        {brandName && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 truncate">
            {brandName}
          </span>
        )}

        {/* Product Name */}
        <Link href={`/produit/${product.slug || product.id}`} className="group/link">
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-tight group-hover/link:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Reference */}
        <p className="text-[11px] text-neutral-400 font-mono truncate">
          REF: {product.reference || product.id.slice(0, 8).toUpperCase()}
        </p>

        {/* Stock Status */}
        {showStock && (
          <StockIndicator
            status={effectiveStock.status}
            quantity={effectiveStock.quantity}
            className="mt-0.5"
          />
        )}

        {/* B2B Badges (certifications, sustainability) */}
        {showB2BBadges && b2bProduct && (
          <ProductCardB2BBadges
            product={b2bProduct}
            variant="compact"
            maxBadges={3}
            className="mt-1"
          />
        )}

        {/* Spacer */}
        <div className="flex-grow min-h-1" />

        {/* Price Section */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={cn(
                'text-base font-bold',
                effectivePrice.isPromotional ? 'text-red-600' : 'text-neutral-900'
              )}
            >
              {formatPrice(effectivePrice.unitPriceHT, effectivePrice.currency)}
            </span>
            <span className="text-xs text-neutral-400">HT</span>
            {effectivePrice.originalPriceHT && effectivePrice.originalPriceHT > effectivePrice.unitPriceHT && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(effectivePrice.originalPriceHT, effectivePrice.currency)}
              </span>
            )}
          </div>

          {/* Volume discount hint */}
          {showVolumeDiscount && effectivePrice.volumeDiscounts && effectivePrice.volumeDiscounts.length > 0 && (
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
              Lot {effectivePrice.volumeDiscounts[0].minQuantity}+: -{effectivePrice.volumeDiscounts[0].discountPercent}%
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={effectiveStock.quantity > 0 ? effectiveStock.quantity : undefined}
            disabled={isOutOfStock}
            className="flex-shrink-0"
          />

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={cn(
              'flex-1 h-8 flex items-center justify-center gap-1.5 rounded',
              'text-sm font-medium transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-black'
            )}
          >
            {isAdding ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : justAdded ? (
              <>
                <Icons.Check className="w-4 h-4" />
                <span>Ajoute</span>
              </>
            ) : (
              <>
                <Icons.Cart className="w-4 h-4" />
                <span>{isOutOfStock ? 'Indispo.' : 'Ajouter'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

export default ProductCardGridOptimized;
