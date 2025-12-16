'use client';

/**
 * ProductCardGrid Component
 *
 * Vertical grid card layout for B2B product display.
 *
 * Layout:
 * - Product image with floating action buttons
 * - Brand name
 * - Product name (max 2 lines)
 * - Reference and EAN codes
 * - Stock indicator with warehouse
 * - Pricing with volume discounts
 * - Quantity selector and add to cart
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePricing, useWarehouse } from '@/contexts';
import { ProductCardPrice } from './ProductCardPrice';
import { ProductCardStockBadge } from './ProductCardStock';
import { ProductCardActions, ProductCardFloatingActions } from './ProductCardActions';
import type {
  ProductCardGridProps,
  PriceInfo,
  StockInfo,
  ProductStockStatus,
} from './types';

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

/**
 * Determine stock status from quantity
 */
function getStockStatus(quantity: number, threshold: number = 10): ProductStockStatus {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}

/**
 * ProductCardGrid - Vertical grid card for B2B
 *
 * Full-featured product card with image, details,
 * pricing, stock info, and action buttons.
 */
export function ProductCardGrid({
  product,
  showStock = true,
  showVolumeDiscount = true,
  showActions = true,
  onAddToCart,
  onToggleFavorite,
  onToggleCompare,
  isComparing = false,
  isFavorite = false,
  priceInfo,
  stockInfo,
  className,
  priority = false,
}: ProductCardGridProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get pricing context for calculations
  let pricingContext;
  try {
    pricingContext = usePricing();
  } catch {
    pricingContext = null;
  }

  // Get warehouse context for stock info
  let warehouseContext;
  try {
    warehouseContext = useWarehouse();
  } catch {
    warehouseContext = null;
  }

  // Calculate price info from context or use provided
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
        isPromotional: calculatedPrice.isPromotional,
        promotionEndsAt: calculatedPrice.promotionEndsAt,
        volumeDiscounts: pricingContext.getVolumeDiscounts(product.id),
        unitLabel: calculatedPrice.unitLabel,
      };
    }

    // Fallback to basic price display
    return {
      unitPriceHT: product.price,
      unitPriceTTC: product.isPriceTTC ? product.price : product.price * 1.2,
      currency: 'EUR',
      unitLabel: 'unite',
    };
  }, [priceInfo, pricingContext, product, quantity]);

  // Calculate stock info from context or use provided
  const effectiveStockInfo: StockInfo = useMemo(() => {
    if (stockInfo) return stockInfo;

    const selectedWarehouse = warehouseContext?.selectedWarehouse;

    return {
      quantity: product.stock,
      status: getStockStatus(product.stock),
      warehouseName: selectedWarehouse?.name || undefined,
      warehouseCode: selectedWarehouse?.code || undefined,
      lowStockThreshold: 10,
    };
  }, [stockInfo, warehouseContext, product.stock]);

  // Image source
  const imageSrc = imageError || !product.images[0] ? PLACEHOLDER_IMAGE : product.images[0];

  // Handlers
  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    onAddToCart?.(product.id, quantity);
  }, [onAddToCart, product.id, quantity]);

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite?.(product.id);
  }, [onToggleFavorite, product.id]);

  const handleToggleCompare = useCallback(() => {
    onToggleCompare?.(product.id);
  }, [onToggleCompare, product.id]);

  const isOutOfStock = effectiveStockInfo.status === 'out_of_stock';

  return (
    <article
      className={cn(
        'group relative flex flex-col bg-white rounded-lg border border-gray-200',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-50">
        {/* Loading skeleton */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100',
            'bg-[length:200%_100%] animate-pulse',
            'transition-opacity duration-300',
            imageLoaded ? 'opacity-0' : 'opacity-100'
          )}
        />

        {/* Product image */}
        <Link
          href={`/products/${product.id}`}
          className="block w-full h-full"
          aria-label={`Voir ${product.name}`}
        >
          <div
            className={cn(
              'relative w-full h-full transition-transform duration-500 ease-out',
              isHovered && 'scale-105'
            )}
          >
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-contain p-4',
                'transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              priority={priority}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        </Link>

        {/* Floating action buttons */}
        <div
          className={cn(
            'absolute top-3 right-3 z-10',
            'transition-all duration-200',
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          )}
        >
          <ProductCardFloatingActions
            onToggleFavorite={onToggleFavorite ? handleToggleFavorite : undefined}
            onToggleCompare={onToggleCompare ? handleToggleCompare : undefined}
            isFavorite={isFavorite}
            isComparing={isComparing}
          />
        </div>

        {/* New badge */}
        {product.isNew && (
          <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-gray-900 text-white text-xs font-medium uppercase tracking-wide rounded">
            Nouveau
          </span>
        )}

        {/* Promotional badge */}
        {effectivePriceInfo.isPromotional && (
          <span className="absolute bottom-3 left-3 z-10 px-2 py-1 bg-red-600 text-white text-xs font-medium uppercase tracking-wide rounded">
            Promo
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Brand */}
        {product.brand && (
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {product.brand}
          </span>
        )}

        {/* Product Name */}
        <Link
          href={`/products/${product.id}`}
          className="group/link"
        >
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover/link:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Reference and EAN */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>REF: {product.reference}</span>
          {product.ean && (
            <>
              <span className="text-gray-300">|</span>
              <span>EAN: {product.ean}</span>
            </>
          )}
        </div>

        {/* Stock Info */}
        {showStock && (
          <ProductCardStockBadge
            status={effectiveStockInfo.status}
            quantity={effectiveStockInfo.quantity}
            warehouseName={effectiveStockInfo.warehouseName}
            className="py-1"
          />
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Pricing */}
        <ProductCardPrice
          price={effectivePriceInfo}
          showVolumeDiscount={showVolumeDiscount}
          quantity={quantity}
          size="md"
        />

        {/* Actions */}
        {showActions && (
          <ProductCardActions
            productId={product.id}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={onAddToCart ? handleAddToCart : undefined}
            maxQuantity={effectiveStockInfo.quantity > 0 ? effectiveStockInfo.quantity : undefined}
            isOutOfStock={isOutOfStock}
            layout="horizontal"
            className="pt-2 border-t border-gray-100"
          />
        )}
      </div>
    </article>
  );
}

export default ProductCardGrid;
