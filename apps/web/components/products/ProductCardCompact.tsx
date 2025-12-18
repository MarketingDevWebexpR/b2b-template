'use client';

/**
 * ProductCardCompact - Compact Product Card for List Views
 *
 * A condensed product card variant optimized for list/table layouts.
 * Shows essential information in a horizontal compact format.
 *
 * @packageDocumentation
 */

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  GitCompare,
  Eye,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  Plus,
  Minus,
} from 'lucide-react';
import type { Product } from '@/types';
import { cn, formatPrice, calculateDiscount } from '@/lib/utils';
import { useWishlist } from '@/contexts/WishlistContext';
import { useComparison } from '@/components/products/ProductComparison';
import {
  useListsFeatures,
  useCartFeatures,
  useCatalogFeatures,
} from '@/contexts/FeatureContext';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

// ============================================================================
// Types
// ============================================================================

export interface ProductCardCompactProps {
  /** The product to display */
  product: Product;
  /** Additional CSS classes */
  className?: string;
  /** Handler for quick add to cart with quantity */
  onAddToCart?: (product: Product, quantity: number) => void;
  /** Handler for quick view */
  onQuickView?: (product: Product) => void;
  /** Show quantity selector */
  showQuantitySelector?: boolean;
  /** Minimum order quantity */
  minQuantity?: number;
  /** Maximum order quantity */
  maxQuantity?: number;
  /** Quantity step */
  quantityStep?: number;
}

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';

// ============================================================================
// Constants
// ============================================================================

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';
const LOW_STOCK_THRESHOLD = 5;

// ============================================================================
// Helper Functions
// ============================================================================

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'out_of_stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

const stockStatusConfig: Record<
  StockStatus,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    icon: typeof Package;
    dotColor: string;
  }
> = {
  in_stock: {
    label: 'En stock',
    shortLabel: 'Dispo',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    icon: Package,
    dotColor: 'bg-emerald-500',
  },
  low_stock: {
    label: 'Stock faible',
    shortLabel: 'Faible',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: AlertTriangle,
    dotColor: 'bg-amber-500',
  },
  out_of_stock: {
    label: 'Rupture de stock',
    shortLabel: 'Rupture',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: AlertTriangle,
    dotColor: 'bg-red-500',
  },
  on_order: {
    label: 'Sur commande',
    shortLabel: 'Commande',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: Clock,
    dotColor: 'bg-blue-500',
  },
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Quantity Selector Component
 */
interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function QuantitySelector({
  value,
  min = 1,
  max = 999,
  step = 1,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const inputValue = parseInt(e.target.value, 10);
    if (!isNaN(inputValue)) {
      const clampedValue = Math.max(min, Math.min(max, inputValue));
      onChange(clampedValue);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center border border-neutral-200 rounded-lg overflow-hidden',
        disabled && 'opacity-50 pointer-events-none'
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          'w-8 h-8 flex items-center justify-center',
          'bg-neutral-50 hover:bg-neutral-100',
          'text-neutral-600 hover:text-neutral-900',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Diminuer la quantite"
      >
        <Minus className="w-3 h-3" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        onClick={(e) => e.stopPropagation()}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          'w-12 h-8 text-center text-sm font-medium',
          'border-x border-neutral-200',
          'focus:outline-none focus:ring-1 focus:ring-accent/50',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        )}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          'w-8 h-8 flex items-center justify-center',
          'bg-neutral-50 hover:bg-neutral-100',
          'text-neutral-600 hover:text-neutral-900',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Augmenter la quantite"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

/**
 * Compact Stock Indicator
 */
interface StockIndicatorCompactProps {
  stock: number;
}

function StockIndicatorCompact({ stock }: StockIndicatorCompactProps) {
  const status = getStockStatus(stock);
  const config = stockStatusConfig[status];

  return (
    <Tooltip tooltipContent={`${config.label}${stock > 0 ? ` (${stock})` : ''}`}>
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide',
          config.color
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
        {config.shortLabel}
      </span>
    </Tooltip>
  );
}

/**
 * Compact Action Button
 */
interface CompactActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  activeLabel?: string;
  children: React.ReactNode;
}

function CompactActionButton({
  onClick,
  isActive = false,
  disabled = false,
  label,
  activeLabel,
  children,
}: CompactActionButtonProps) {
  return (
    <Tooltip tooltipContent={isActive && activeLabel ? activeLabel : label}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-7 h-7 flex items-center justify-center',
          'rounded-md bg-neutral-100 hover:bg-neutral-200',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isActive && 'bg-accent/10 text-accent'
        )}
        aria-label={isActive && activeLabel ? activeLabel : label}
        aria-pressed={isActive}
      >
        {children}
      </button>
    </Tooltip>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ProductCardCompact - Compact product card for list views
 *
 * Features:
 * - Horizontal compact layout
 * - Small image thumbnail
 * - Essential product info (name, SKU, price)
 * - Stock status indicator
 * - Quantity selector
 * - Quick action buttons
 * - Feature-gated actions
 *
 * @example
 * ```tsx
 * <ProductCardCompact
 *   product={product}
 *   onAddToCart={(p, qty) => addToCart(p, qty)}
 *   showQuantitySelector
 *   minQuantity={5}
 * />
 * ```
 */
export function ProductCardCompact({
  product,
  className,
  onAddToCart,
  onQuickView,
  showQuantitySelector = true,
  minQuantity = 1,
  maxQuantity,
  quantityStep = 1,
}: ProductCardCompactProps) {
  // State
  const [quantity, setQuantity] = useState(minQuantity);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Feature flags
  const { hasWishlist } = useListsFeatures();
  const { hasQuickAdd } = useCartFeatures();
  const { hasComparison, hasQuickView } = useCatalogFeatures();

  // Contexts
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInComparison, isAtLimit } = useComparison();

  // Derived state
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);
  const stockStatus = getStockStatus(product.stock);
  const isOutOfStock = stockStatus === 'out_of_stock';

  // Image handling
  const imageSrc =
    imageError || !product.images[0] ? PLACEHOLDER_IMAGE : product.images[0];

  // Price calculations
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? calculateDiscount(product.price, product.compareAtPrice!)
    : 0;

  // Effective max quantity
  const effectiveMaxQuantity = maxQuantity ?? product.stock ?? 999;

  // Event handlers
  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product);
    },
    [toggleWishlist, product]
  );

  const handleCompareToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleCompare(product);
    },
    [toggleCompare, product]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onQuickView?.(product);
    },
    [onQuickView, product]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.(product, quantity);
    },
    [onAddToCart, product, quantity]
  );

  return (
    <motion.article
      className={cn('group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          'flex items-center gap-4 p-3',
          'bg-white rounded-lg border border-neutral-200',
          'transition-all duration-200',
          isHovered && 'shadow-md border-neutral-300'
        )}
      >
        {/* Image */}
        <Link
          href={`/produit/${product.slug || product.id}`}
          className="relative flex-shrink-0"
        >
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-50">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="64px"
              className="object-contain p-1"
              onError={() => setImageError(true)}
            />
            {/* Badges overlay */}
            {(product.isNew || hasDiscount) && (
              <div className="absolute top-0 left-0">
                {product.isNew && (
                  <span className="block w-2 h-2 bg-neutral-900 rounded-br" />
                )}
                {hasDiscount && !product.isNew && (
                  <span className="block w-2 h-2 bg-red-500 rounded-br" />
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/produit/${product.slug || product.id}`}>
            {/* Category & Stock */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 truncate">
                {product.category?.name || product.collection || '\u00A0'}
              </span>
              <StockIndicatorCompact stock={product.stock} />
            </div>

            {/* Product Name */}
            <h3
              className={cn(
                'text-sm font-medium text-neutral-900 truncate',
                'group-hover:text-accent transition-colors'
              )}
            >
              {product.name}
            </h3>

            {/* SKU */}
            <p className="text-[10px] text-neutral-400 font-mono truncate">
              {product.reference || product.id.slice(0, 8).toUpperCase()}
            </p>
          </Link>
        </div>

        {/* Price Column */}
        <div className="flex-shrink-0 text-right min-w-[80px]">
          <div className="flex flex-col items-end">
            <span
              className={cn(
                'text-sm font-bold',
                hasDiscount ? 'text-red-600' : 'text-neutral-900'
              )}
            >
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
            {hasDiscount && (
              <Badge variant="error" size="xs" className="mt-0.5">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
        </div>

        {/* Quantity Selector */}
        {showQuantitySelector && hasQuickAdd && !isOutOfStock && (
          <div className="flex-shrink-0">
            <QuantitySelector
              value={quantity}
              min={minQuantity}
              max={effectiveMaxQuantity}
              step={quantityStep}
              onChange={setQuantity}
              disabled={isOutOfStock}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Quick View */}
          {hasQuickView && onQuickView && (
            <CompactActionButton onClick={handleQuickView} label="Apercu rapide">
              <Eye className="w-3.5 h-3.5 text-neutral-600" />
            </CompactActionButton>
          )}

          {/* Wishlist */}
          {hasWishlist && (
            <CompactActionButton
              onClick={handleWishlistToggle}
              isActive={isWishlisted}
              label="Ajouter aux favoris"
              activeLabel="Retirer des favoris"
            >
              <Heart
                className={cn(
                  'w-3.5 h-3.5',
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600'
                )}
              />
            </CompactActionButton>
          )}

          {/* Compare */}
          {hasComparison && (
            <CompactActionButton
              onClick={handleCompareToggle}
              isActive={isCompared}
              disabled={isAtLimit && !isCompared}
              label="Comparer"
              activeLabel="Retirer"
            >
              <GitCompare
                className={cn(
                  'w-3.5 h-3.5',
                  isCompared ? 'text-accent' : 'text-neutral-600'
                )}
              />
            </CompactActionButton>
          )}

          {/* Add to Cart Button */}
          {hasQuickAdd && onAddToCart && (
            <Tooltip
              tooltipContent={
                isOutOfStock ? 'Produit indisponible' : 'Ajouter au panier'
              }
            >
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={cn(
                  'h-8 px-3 flex items-center gap-1.5',
                  'rounded-lg text-xs font-medium',
                  'transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                  isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-900 text-white hover:bg-accent'
                )}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCardCompact;
