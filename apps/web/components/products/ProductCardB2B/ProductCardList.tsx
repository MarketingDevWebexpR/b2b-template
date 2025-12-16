'use client';

/**
 * ProductCardList Component
 *
 * Horizontal list card layout for B2B product display.
 *
 * Layout (left to right):
 * - Product image (small square)
 * - Product info (brand, name, reference, description)
 * - Stock indicator with warehouse
 * - Pricing
 * - Actions (quantity, add to cart)
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePricing, useWarehouse } from '@/contexts';
import { ProductCardPriceCompact } from './ProductCardPrice';
import { ProductCardStock } from './ProductCardStock';
import { ProductCardActions } from './ProductCardActions';
import type {
  ProductCardListProps,
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
 * ProductCardList - Horizontal list card for B2B
 *
 * Compact horizontal layout ideal for search results
 * and category listings where space efficiency matters.
 */
export function ProductCardList({
  product,
  showStock = true,
  showVolumeDiscount = true,
  showActions = true,
  showDescription = false,
  onAddToCart,
  onToggleFavorite,
  onToggleCompare,
  isComparing = false,
  isFavorite = false,
  priceInfo,
  stockInfo,
  className,
  priority = false,
}: ProductCardListProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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
        isPromotional: calculatedPrice.isPromotional,
        promotionEndsAt: calculatedPrice.promotionEndsAt,
        volumeDiscounts: pricingContext.getVolumeDiscounts(product.id),
        unitLabel: calculatedPrice.unitLabel,
      };
    }

    return {
      unitPriceHT: product.price,
      unitPriceTTC: product.isPriceTTC ? product.price : product.price * 1.2,
      currency: 'EUR',
      unitLabel: 'unite',
    };
  }, [priceInfo, pricingContext, product, quantity]);

  // Calculate stock info
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
        'group flex items-stretch bg-white rounded-lg border border-gray-200',
        'transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        className
      )}
    >
      {/* Image */}
      <div className="relative w-28 md:w-36 flex-shrink-0 bg-gray-50 rounded-l-lg overflow-hidden">
        {/* Loading skeleton */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100',
            'bg-[length:200%_100%] animate-pulse',
            'transition-opacity duration-300',
            imageLoaded ? 'opacity-0' : 'opacity-100'
          )}
        />

        <Link
          href={`/products/${product.id}`}
          className="block w-full h-full"
          aria-label={`Voir ${product.name}`}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 112px, 144px"
            className={cn(
              'object-contain p-3',
              'transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            priority={priority}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Link>

        {/* Badges */}
        {product.isNew && (
          <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] font-medium uppercase tracking-wide rounded">
            Nouveau
          </span>
        )}
      </div>

      {/* Content Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 md:gap-4 p-3 md:p-4 min-w-0">
        {/* Product Info */}
        <div className="flex flex-col justify-center min-w-0">
          {/* Brand */}
          {product.brand && (
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
              {product.brand}
            </span>
          )}

          {/* Name */}
          <Link href={`/products/${product.id}`} className="group/link">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover/link:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Reference and Description */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
            <span>REF: {product.reference}</span>
            {showDescription && product.shortDescription && (
              <>
                <span className="text-gray-300">|</span>
                <span className="truncate">{product.shortDescription}</span>
              </>
            )}
          </div>
        </div>

        {/* Stock Info */}
        {showStock && (
          <div className="flex items-center justify-start md:justify-center md:min-w-[140px]">
            <ProductCardStock
              stock={effectiveStockInfo}
              mode="inline"
              showWarehouse={true}
              className="text-sm"
            />
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-start md:justify-end md:min-w-[120px]">
          <ProductCardPriceCompact price={effectivePriceInfo} />
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-start md:justify-end md:min-w-[180px]">
            <ProductCardActions
              productId={product.id}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={onAddToCart ? handleAddToCart : undefined}
              onToggleFavorite={onToggleFavorite ? handleToggleFavorite : undefined}
              onToggleCompare={onToggleCompare ? handleToggleCompare : undefined}
              isFavorite={isFavorite}
              isComparing={isComparing}
              maxQuantity={effectiveStockInfo.quantity > 0 ? effectiveStockInfo.quantity : undefined}
              isOutOfStock={isOutOfStock}
              layout="vertical"
              minimal={true}
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCardList;
