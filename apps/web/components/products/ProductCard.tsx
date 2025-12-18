'use client';

/**
 * ProductCard - Luxury B2B Jewelry Product Card
 *
 * A premium product card component designed for B2B jewelry e-commerce.
 * Features hover effects, badges, B2B pricing tiers, stock indicators,
 * variant previews, and feature-gated actions.
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  GitCompare,
  Eye,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  Sparkles,
  Tag,
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

export interface ProductCardProps {
  /** The product to display */
  product: Product;
  /** Additional CSS classes */
  className?: string;
  /** Priority loading for LCP images */
  priority?: boolean;
  /** Handler for quick add to cart */
  onQuickAdd?: (product: Product) => void;
  /** Handler for quick view */
  onQuickView?: (product: Product) => void;
  /** Show quantity pricing tiers */
  showTieredPricing?: boolean;
  /** Custom pricing tiers for B2B */
  pricingTiers?: PricingTier[];
}

export interface PricingTier {
  /** Minimum quantity for this tier */
  minQuantity: number;
  /** Price per unit at this tier */
  unitPrice: number;
  /** Optional label (e.g., "Grossiste", "Pro") */
  label?: string;
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

/**
 * Determines stock status based on quantity
 */
function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'out_of_stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

/**
 * Stock status configuration for display
 */
const stockStatusConfig: Record<
  StockStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: typeof Package;
    dotColor: string;
  }
> = {
  in_stock: {
    label: 'En stock',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    icon: Package,
    dotColor: 'bg-emerald-500',
  },
  low_stock: {
    label: 'Stock faible',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: AlertTriangle,
    dotColor: 'bg-amber-500',
  },
  out_of_stock: {
    label: 'Rupture',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: AlertTriangle,
    dotColor: 'bg-red-500',
  },
  on_order: {
    label: 'Sur commande',
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
 * Product Badge Component
 */
interface ProductBadgeProps {
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  isBestSeller?: boolean;
}

function ProductBadges({
  isNew,
  isOnSale,
  discountPercentage,
  isBestSeller,
}: ProductBadgeProps) {
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
      {isNew && (
        <Badge
          variant="dark"
          size="sm"
          className="shadow-sm"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Nouveau
        </Badge>
      )}
      {isOnSale && discountPercentage && discountPercentage > 0 && (
        <Badge
          variant="error"
          size="sm"
          className="shadow-sm"
        >
          <Tag className="w-3 h-3 mr-1" />
          -{discountPercentage}%
        </Badge>
      )}
      {isBestSeller && !isNew && (
        <Badge
          variant="primary"
          size="sm"
          className="shadow-sm"
        >
          Best-seller
        </Badge>
      )}
    </div>
  );
}

/**
 * Stock Indicator Component
 */
interface StockIndicatorProps {
  stock: number;
  compact?: boolean;
}

function StockIndicator({ stock, compact = false }: StockIndicatorProps) {
  const status = getStockStatus(stock);
  const config = stockStatusConfig[status];

  if (compact) {
    return (
      <Tooltip tooltipContent={`${config.label}${stock > 0 ? ` (${stock})` : ''}`}>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium',
            config.color
          )}
        >
          <span
            className={cn('w-2 h-2 rounded-full animate-pulse', config.dotColor)}
          />
          {config.label}
        </span>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
        config.bgColor,
        config.color
      )}
    >
      <config.icon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
}

/**
 * Variant Preview Component
 * Shows color/material swatches for product variants
 */
interface VariantPreviewProps {
  materials?: string[];
  maxDisplay?: number;
  className?: string;
}

function VariantPreview({
  materials = [],
  maxDisplay = 4,
  className,
}: VariantPreviewProps) {
  if (materials.length === 0) return null;

  const displayMaterials = materials.slice(0, maxDisplay);
  const remainingCount = materials.length - maxDisplay;

  // Map materials to colors for visual representation
  const materialColors: Record<string, string> = {
    'Or 18 carats': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'Or 14 carats': 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    'Or rose': 'bg-gradient-to-br from-rose-300 to-rose-400',
    'Or blanc': 'bg-gradient-to-br from-gray-100 to-gray-300',
    'Argent 925': 'bg-gradient-to-br from-gray-300 to-gray-400',
    Platine: 'bg-gradient-to-br from-gray-200 to-gray-400',
    Vermeil: 'bg-gradient-to-br from-yellow-200 to-yellow-400',
    'Acier inoxydable': 'bg-gradient-to-br from-slate-400 to-slate-500',
    Titane: 'bg-gradient-to-br from-slate-300 to-slate-400',
    'Plaque or': 'bg-gradient-to-br from-yellow-200 to-yellow-300',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {displayMaterials.map((material, index) => (
        <Tooltip key={index} tooltipContent={material}>
          <span
            className={cn(
              'w-4 h-4 rounded-full border border-white shadow-sm',
              'ring-1 ring-neutral-200',
              'transition-transform hover:scale-110',
              materialColors[material] || 'bg-neutral-300'
            )}
          />
        </Tooltip>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-neutral-500 ml-1">+{remainingCount}</span>
      )}
    </div>
  );
}

/**
 * Pricing Tiers Display Component
 */
interface PricingTiersProps {
  tiers?: PricingTier[];
  basePrice: number;
}

function PricingTiers({ tiers, basePrice }: PricingTiersProps) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
        Prix degressifs
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {tiers.slice(0, 3).map((tier, index) => (
          <span key={index} className="text-xs text-neutral-600">
            <span className="font-medium">{tier.minQuantity}+:</span>{' '}
            <span className="text-accent">{formatPrice(tier.unitPrice)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Action Button Component
 */
interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  activeLabel?: string;
  children: React.ReactNode;
  activeClassName?: string;
}

function ActionButton({
  onClick,
  isActive = false,
  disabled = false,
  label,
  activeLabel,
  children,
  activeClassName = 'text-accent',
}: ActionButtonProps) {
  return (
    <Tooltip tooltipContent={isActive && activeLabel ? activeLabel : label}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-9 h-9 flex items-center justify-center',
          'rounded-full bg-white/95 backdrop-blur-sm shadow-md',
          'transition-all duration-200',
          'hover:bg-white hover:shadow-lg hover:scale-105',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          isActive && activeClassName
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
 * ProductCard - Premium B2B jewelry product card
 *
 * Features:
 * - Image with hover zoom effect and secondary image
 * - New/Sale/Best-seller badges
 * - Product name and SKU reference
 * - B2B pricing with optional quantity tiers
 * - Stock status indicator
 * - Material/variant preview swatches
 * - Feature-gated actions: Wishlist, Compare, Quick View, Quick Add
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   onQuickAdd={(p) => addToCart(p)}
 *   onQuickView={(p) => openQuickView(p)}
 *   pricingTiers={[
 *     { minQuantity: 10, unitPrice: 450 },
 *     { minQuantity: 50, unitPrice: 420 },
 *   ]}
 * />
 * ```
 */
export function ProductCard({
  product,
  className,
  priority = false,
  onQuickAdd,
  onQuickView,
  showTieredPricing = false,
  pricingTiers,
}: ProductCardProps) {
  // State
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showSecondaryImage, setShowSecondaryImage] = useState(false);

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

  // Image handling
  const primaryImage =
    imageError || !product.images[0] ? PLACEHOLDER_IMAGE : product.images[0];
  const secondaryImage = product.images[1] || null;

  const currentImage =
    showSecondaryImage && secondaryImage && isHovered
      ? secondaryImage
      : primaryImage;

  // Price calculations
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? calculateDiscount(product.price, product.compareAtPrice!)
    : 0;

  // Stock status
  const stockStatus = getStockStatus(product.stock);

  // Event handlers
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (secondaryImage) {
      // Small delay for smooth transition
      setTimeout(() => setShowSecondaryImage(true), 150);
    }
  }, [secondaryImage]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowSecondaryImage(false);
  }, []);

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

  const handleQuickAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onQuickAdd?.(product);
    },
    [onQuickAdd, product]
  );

  // Memoized materials for variant preview
  const displayMaterials = useMemo(() => {
    return product.materials || [];
  }, [product.materials]);

  return (
    <motion.article
      className={cn('group relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        href={`/produit/${product.slug || product.id}`}
        className="block"
        aria-label={`Voir ${product.name}`}
      >
        {/* Card Container */}
        <div
          className={cn(
            'relative bg-white rounded-xl overflow-hidden',
            'border border-neutral-200',
            'transition-all duration-300 ease-out',
            isHovered && 'shadow-xl border-neutral-300 -translate-y-1'
          )}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-neutral-50">
            {/* Loading Skeleton */}
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 bg-[length:200%_100%] animate-pulse" />
            </div>

            {/* Product Image with Zoom Effect */}
            <div
              className={cn(
                'relative w-full h-full transition-transform duration-700 ease-out',
                isHovered && 'scale-110'
              )}
            >
              <Image
                src={currentImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={cn(
                  'object-cover',
                  'transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                priority={priority}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>

            {/* Secondary Image Indicator */}
            {secondaryImage && (
              <div className="absolute bottom-3 left-3 flex gap-1 z-10">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    !showSecondaryImage ? 'bg-neutral-800' : 'bg-neutral-300'
                  )}
                />
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    showSecondaryImage ? 'bg-neutral-800' : 'bg-neutral-300'
                  )}
                />
              </div>
            )}

            {/* Badges */}
            <ProductBadges
              isNew={product.isNew}
              isOnSale={!!hasDiscount}
              discountPercentage={discountPercentage}
              isBestSeller={product.featured}
            />

            {/* Action Buttons */}
            <AnimatePresence>
              <motion.div
                className="absolute top-3 right-3 z-10 flex flex-col gap-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {/* Wishlist Button */}
                {hasWishlist && (
                  <ActionButton
                    onClick={handleWishlistToggle}
                    isActive={isWishlisted}
                    label="Ajouter aux favoris"
                    activeLabel="Retirer des favoris"
                    activeClassName="text-red-500"
                  >
                    <Heart
                      className={cn(
                        'w-4 h-4 transition-all',
                        isWishlisted
                          ? 'fill-red-500 text-red-500'
                          : 'text-neutral-600'
                      )}
                      strokeWidth={1.5}
                    />
                  </ActionButton>
                )}

                {/* Compare Button */}
                {hasComparison && (
                  <ActionButton
                    onClick={handleCompareToggle}
                    isActive={isCompared}
                    disabled={isAtLimit && !isCompared}
                    label="Ajouter a la comparaison"
                    activeLabel="Retirer de la comparaison"
                  >
                    <GitCompare
                      className={cn(
                        'w-4 h-4 transition-all',
                        isCompared ? 'text-accent' : 'text-neutral-600'
                      )}
                      strokeWidth={1.5}
                    />
                  </ActionButton>
                )}

                {/* Quick View Button */}
                {hasQuickView && onQuickView && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      scale: isHovered ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActionButton
                      onClick={handleQuickView}
                      label="Apercu rapide"
                    >
                      <Eye className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
                    </ActionButton>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Quick Add Button - Appears on Hover */}
            {hasQuickAdd && onQuickAdd && stockStatus !== 'out_of_stock' && (
              <motion.button
                onClick={handleQuickAdd}
                className={cn(
                  'absolute bottom-3 left-3 right-3 z-10',
                  'py-3 px-4 rounded-lg',
                  'bg-neutral-900 text-white',
                  'text-sm font-medium',
                  'flex items-center justify-center gap-2',
                  'transition-colors duration-200',
                  'hover:bg-accent',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50'
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 10,
                }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`Ajouter ${product.name} au panier`}
              >
                <ShoppingCart className="w-4 h-4" />
                Ajouter au panier
              </motion.button>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            {/* Category & Stock Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {product.category?.name || product.collection || '\u00A0'}
              </span>
              <StockIndicator stock={product.stock} compact />
            </div>

            {/* Product Name */}
            <h3
              className={cn(
                'text-sm font-medium text-neutral-900',
                'leading-snug line-clamp-2 min-h-[2.5rem]',
                'transition-colors duration-200',
                'group-hover:text-accent'
              )}
            >
              {product.name}
            </h3>

            {/* SKU Reference */}
            <p className="text-xs text-neutral-400 font-mono">
              Ref: {product.reference || product.id.slice(0, 8).toUpperCase()}
            </p>

            {/* Variant Preview */}
            {displayMaterials.length > 0 && (
              <VariantPreview materials={displayMaterials} />
            )}

            {/* Price Section */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-lg font-bold',
                    hasDiscount ? 'text-red-600' : 'text-neutral-900'
                  )}
                >
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                )}
                {!product.isPriceTTC && (
                  <span className="text-xs text-neutral-400">HT</span>
                )}
              </div>

              {/* Tiered Pricing */}
              {showTieredPricing && (
                <PricingTiers tiers={pricingTiers} basePrice={product.price} />
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default ProductCard;
