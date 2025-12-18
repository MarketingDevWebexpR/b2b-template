'use client';

/**
 * ProductCardHorizontal - Horizontal Product Card for Search Results
 *
 * A full-width horizontal product card optimized for search results
 * and detailed list views. Shows extended product information
 * including description, materials, and multiple images.
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  Star,
  MapPin,
  Scale,
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
import { Button } from '@/components/ui/Button';
import type { PricingTier } from './ProductCard';

// ============================================================================
// Types
// ============================================================================

export interface ProductCardHorizontalProps {
  /** The product to display */
  product: Product;
  /** Additional CSS classes */
  className?: string;
  /** Handler for add to cart */
  onAddToCart?: (product: Product, quantity: number) => void;
  /** Handler for quick view */
  onQuickView?: (product: Product) => void;
  /** Show extended details */
  showExtendedDetails?: boolean;
  /** Show pricing tiers */
  showPricingTiers?: boolean;
  /** Custom pricing tiers */
  pricingTiers?: PricingTier[];
  /** Highlight search terms */
  searchHighlight?: string;
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
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof Package;
  }
> = {
  in_stock: {
    label: 'En stock',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: Package,
  },
  low_stock: {
    label: 'Stock faible',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertTriangle,
  },
  out_of_stock: {
    label: 'Rupture de stock',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
  },
  on_order: {
    label: 'Sur commande',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Clock,
  },
};

/**
 * Highlights search terms in text
 */
function highlightText(text: string, highlight?: string): React.ReactNode {
  if (!highlight || !text) return text;

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <mark key={index} className="bg-yellow-100 text-yellow-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Image Gallery Component
 */
interface ImageGalleryProps {
  images: string[];
  productName: string;
  onImageClick?: () => void;
}

function ImageGallery({ images, productName, onImageClick }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const displayImages = images.length > 0 ? images : [PLACEHOLDER_IMAGE];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const currentImage = imageError[currentIndex]
    ? PLACEHOLDER_IMAGE
    : displayImages[currentIndex];

  return (
    <div className="relative group/gallery">
      {/* Main Image */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-50 cursor-pointer"
        onClick={onImageClick}
      >
        <Image
          src={currentImage}
          alt={`${productName} - Image ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-contain p-3 transition-transform duration-300 group-hover/gallery:scale-105"
          onError={() =>
            setImageError((prev) => ({ ...prev, [currentIndex]: true }))
          }
        />
      </div>

      {/* Navigation Arrows */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className={cn(
              'absolute left-1 top-1/2 -translate-y-1/2',
              'w-6 h-6 flex items-center justify-center',
              'rounded-full bg-white/90 shadow-sm',
              'opacity-0 group-hover/gallery:opacity-100',
              'transition-opacity duration-200',
              'hover:bg-white'
            )}
            aria-label="Image precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className={cn(
              'absolute right-1 top-1/2 -translate-y-1/2',
              'w-6 h-6 flex items-center justify-center',
              'rounded-full bg-white/90 shadow-sm',
              'opacity-0 group-hover/gallery:opacity-100',
              'transition-opacity duration-200',
              'hover:bg-white'
            )}
            aria-label="Image suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Image Indicators */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {displayImages.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                index === currentIndex ? 'bg-neutral-800' : 'bg-neutral-300'
              )}
              aria-label={`Voir image ${index + 1}`}
            />
          ))}
          {displayImages.length > 5 && (
            <span className="text-[9px] text-neutral-500 ml-1">
              +{displayImages.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Stock Status Badge
 */
interface StockBadgeProps {
  stock: number;
  showQuantity?: boolean;
}

function StockBadge({ stock, showQuantity = true }: StockBadgeProps) {
  const status = getStockStatus(stock);
  const config = stockStatusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
        config.bgColor,
        config.color,
        'border',
        config.borderColor
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>
        {config.label}
        {showQuantity && stock > 0 && ` (${stock})`}
      </span>
    </div>
  );
}

/**
 * Product Badges Row
 */
interface ProductBadgesRowProps {
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  isBestSeller?: boolean;
}

function ProductBadgesRow({
  isNew,
  isOnSale,
  discountPercentage,
  isBestSeller,
}: ProductBadgesRowProps) {
  const hasBadges = isNew || isOnSale || isBestSeller;
  if (!hasBadges) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {isNew && (
        <Badge variant="dark" size="sm">
          <Sparkles className="w-3 h-3 mr-1" />
          Nouveau
        </Badge>
      )}
      {isOnSale && discountPercentage && discountPercentage > 0 && (
        <Badge variant="error" size="sm">
          <Tag className="w-3 h-3 mr-1" />
          -{discountPercentage}%
        </Badge>
      )}
      {isBestSeller && (
        <Badge variant="primary" size="sm">
          <Star className="w-3 h-3 mr-1" />
          Best-seller
        </Badge>
      )}
    </div>
  );
}

/**
 * Material Swatches
 */
interface MaterialSwatchesProps {
  materials: string[];
}

function MaterialSwatches({ materials }: MaterialSwatchesProps) {
  if (materials.length === 0) return null;

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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-neutral-500">Materiaux:</span>
      <div className="flex items-center gap-1">
        {materials.slice(0, 5).map((material, index) => (
          <Tooltip key={index} tooltipContent={material}>
            <span
              className={cn(
                'w-5 h-5 rounded-full border-2 border-white shadow-sm',
                'ring-1 ring-neutral-200',
                'transition-transform hover:scale-110 cursor-pointer',
                materialColors[material] || 'bg-neutral-300'
              )}
            />
          </Tooltip>
        ))}
        {materials.length > 5 && (
          <span className="text-xs text-neutral-500">
            +{materials.length - 5}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Pricing Tiers Display
 */
interface PricingTiersDisplayProps {
  tiers?: PricingTier[];
  basePrice: number;
}

function PricingTiersDisplay({ tiers, basePrice }: PricingTiersDisplayProps) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
      <p className="text-xs font-semibold text-neutral-700 mb-2">
        Prix degressifs B2B
      </p>
      <div className="grid grid-cols-3 gap-2">
        {tiers.slice(0, 3).map((tier, index) => {
          const savings = basePrice - tier.unitPrice;
          const savingsPercent = Math.round((savings / basePrice) * 100);
          return (
            <div
              key={index}
              className="text-center p-2 bg-white rounded border border-neutral-100"
            >
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                {tier.minQuantity}+ unites
              </p>
              <p className="text-sm font-bold text-accent">
                {formatPrice(tier.unitPrice)}
              </p>
              {savingsPercent > 0 && (
                <p className="text-[10px] text-emerald-600">
                  -{savingsPercent}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ProductCardHorizontal - Full-width horizontal product card
 *
 * Features:
 * - Image gallery with navigation
 * - Full product details including description
 * - Material swatches
 * - Stock status with quantity
 * - B2B pricing tiers
 * - Extended metadata (weight, origin, warranty)
 * - Search term highlighting
 * - Feature-gated actions
 *
 * @example
 * ```tsx
 * <ProductCardHorizontal
 *   product={product}
 *   onAddToCart={(p, qty) => addToCart(p, qty)}
 *   showExtendedDetails
 *   showPricingTiers
 *   searchHighlight="diamant"
 * />
 * ```
 */
export function ProductCardHorizontal({
  product,
  className,
  onAddToCart,
  onQuickView,
  showExtendedDetails = true,
  showPricingTiers = false,
  pricingTiers,
  searchHighlight,
}: ProductCardHorizontalProps) {
  // State
  const [quantity, setQuantity] = useState(1);
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

  // Price calculations
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? calculateDiscount(product.price, product.compareAtPrice!)
    : 0;

  // Materials
  const materials = useMemo(() => product.materials || [], [product.materials]);

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

  const handleQuickView = useCallback(() => {
    onQuickView?.(product);
  }, [onQuickView, product]);

  const handleAddToCart = useCallback(() => {
    onAddToCart?.(product, quantity);
  }, [onAddToCart, product, quantity]);

  return (
    <motion.article
      className={cn('group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          'flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-5',
          'bg-white rounded-xl border border-neutral-200',
          'transition-all duration-300',
          isHovered && 'shadow-lg border-neutral-300'
        )}
      >
        {/* Image Section */}
        <div className="w-full md:w-48 lg:w-56 flex-shrink-0">
          <ImageGallery
            images={product.images}
            productName={product.name}
            onImageClick={hasQuickView && onQuickView ? handleQuickView : undefined}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex-1">
            {/* Badges */}
            <ProductBadgesRow
              isNew={product.isNew}
              isOnSale={!!hasDiscount}
              discountPercentage={discountPercentage}
              isBestSeller={product.featured}
            />

            {/* Category */}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              {product.category?.name || product.collection || '\u00A0'}
            </p>

            {/* Product Name */}
            <Link href={`/produit/${product.slug || product.id}`}>
              <h3
                className={cn(
                  'text-lg font-semibold text-neutral-900',
                  'leading-tight mb-1',
                  'group-hover:text-accent transition-colors'
                )}
              >
                {highlightText(product.name, searchHighlight)}
              </h3>
            </Link>

            {/* SKU */}
            <p className="text-xs text-neutral-400 font-mono mb-3">
              Ref: {product.reference || product.id.slice(0, 8).toUpperCase()}
            </p>

            {/* Description */}
            {showExtendedDetails && product.shortDescription && (
              <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                {highlightText(product.shortDescription, searchHighlight)}
              </p>
            )}

            {/* Materials */}
            {materials.length > 0 && (
              <div className="mb-3">
                <MaterialSwatches materials={materials} />
              </div>
            )}

            {/* Extended Details */}
            {showExtendedDetails && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 mb-3">
                {product.weight && (
                  <span className="inline-flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    {product.weight}
                    {product.weightUnit}
                  </span>
                )}
                {product.origin && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {product.origin}
                  </span>
                )}
                {product.warranty && (
                  <span className="inline-flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Garantie {product.warranty} mois
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing Tiers */}
          {showPricingTiers && (
            <PricingTiersDisplay tiers={pricingTiers} basePrice={product.price} />
          )}
        </div>

        {/* Price & Actions Section */}
        <div className="w-full md:w-56 flex-shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
          {/* Stock Status */}
          <div className="mb-4">
            <StockBadge stock={product.stock} />
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-2xl font-bold',
                  hasDiscount ? 'text-red-600' : 'text-neutral-900'
                )}
              >
                {formatPrice(product.price)}
              </span>
              {!product.isPriceTTC && (
                <span className="text-xs text-neutral-400">HT</span>
              )}
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <Badge variant="error" size="xs">
                  Economisez {formatPrice(product.compareAtPrice! - product.price)}
                </Badge>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {hasQuickAdd && !isOutOfStock && (
            <div className="mb-4">
              <label className="block text-xs text-neutral-500 mb-1">
                Quantite
              </label>
              <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  aria-label="Diminuer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min={1}
                  max={product.stock || 999}
                  className="w-14 h-9 text-center text-sm font-medium border-x border-neutral-200 focus:outline-none"
                />
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock || 999, q + 1))
                  }
                  className="w-9 h-9 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  aria-label="Augmenter"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Add to Cart */}
            {hasQuickAdd && onAddToCart && (
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full"
                size="md"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
              </Button>
            )}

            {/* Quick View */}
            {hasQuickView && onQuickView && (
              <Button
                onClick={handleQuickView}
                variant="secondary"
                className="w-full"
                size="md"
              >
                <Eye className="w-4 h-4 mr-2" />
                Apercu rapide
              </Button>
            )}

            {/* Secondary Actions */}
            <div className="flex gap-2 pt-2">
              {hasWishlist && (
                <Tooltip
                  tooltipContent={
                    isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'
                  }
                >
                  <button
                    onClick={handleWishlistToggle}
                    className={cn(
                      'flex-1 h-9 flex items-center justify-center gap-1.5',
                      'rounded-lg border border-neutral-200',
                      'text-xs font-medium',
                      'transition-colors hover:border-neutral-300',
                      isWishlisted && 'bg-red-50 border-red-200 text-red-600'
                    )}
                  >
                    <Heart
                      className={cn(
                        'w-4 h-4',
                        isWishlisted && 'fill-red-500'
                      )}
                    />
                    <span className="hidden lg:inline">Favoris</span>
                  </button>
                </Tooltip>
              )}
              {hasComparison && (
                <Tooltip
                  tooltipContent={
                    isCompared
                      ? 'Retirer de la comparaison'
                      : isAtLimit
                      ? 'Limite atteinte'
                      : 'Comparer'
                  }
                >
                  <button
                    onClick={handleCompareToggle}
                    disabled={isAtLimit && !isCompared}
                    className={cn(
                      'flex-1 h-9 flex items-center justify-center gap-1.5',
                      'rounded-lg border border-neutral-200',
                      'text-xs font-medium',
                      'transition-colors hover:border-neutral-300',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      isCompared && 'bg-accent/10 border-accent/30 text-accent'
                    )}
                  >
                    <GitCompare className="w-4 h-4" />
                    <span className="hidden lg:inline">Comparer</span>
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCardHorizontal;
