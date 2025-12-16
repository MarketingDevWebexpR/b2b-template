'use client';

/**
 * ProductCardPrice Component
 *
 * Displays B2B pricing information with:
 * - Unit price HT (primary)
 * - Unit price TTC (secondary)
 * - Original price with strikethrough if discounted
 * - Volume discount tiers
 * - Promotional badges
 *
 * @packageDocumentation
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { usePricing } from '@/contexts';
import type { ProductCardPriceProps, PriceInfo } from './types';

/**
 * Format price for display with currency
 */
function formatPriceDisplay(
  amount: number,
  currency: string = 'EUR',
  decimals: number = 2
): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * ProductCardPrice - B2B price display component
 *
 * Shows pricing in B2B format with HT prices, volume discounts,
 * and promotional pricing indicators.
 */
export function ProductCardPrice({
  price,
  showVolumeDiscount = true,
  quantity = 1,
  size = 'md',
  className,
}: ProductCardPriceProps) {
  // Get formatting utilities from pricing context (optional)
  let formatPrice: ((p: number) => string) | undefined;
  try {
    const pricingContext = usePricing();
    formatPrice = (p: number) => pricingContext.formatPrice(p, { format: 'ht' });
  } catch {
    // Context not available, use default formatting
    formatPrice = undefined;
  }

  // Calculate applicable volume discount
  const applicableDiscount = useMemo(() => {
    if (!price.volumeDiscounts || price.volumeDiscounts.length === 0) {
      return null;
    }

    // Sort by minQuantity descending to find highest applicable tier
    const sorted = [...price.volumeDiscounts].sort(
      (a, b) => b.minQuantity - a.minQuantity
    );

    return sorted.find((d) => quantity >= d.minQuantity) || null;
  }, [price.volumeDiscounts, quantity]);

  // Calculate discounted unit price if volume discount applies
  const effectiveUnitPrice = useMemo(() => {
    if (!applicableDiscount) return price.unitPriceHT;

    if (applicableDiscount.fixedUnitPrice !== undefined) {
      return applicableDiscount.fixedUnitPrice;
    }

    if (applicableDiscount.discountPercent) {
      return price.unitPriceHT * (1 - applicableDiscount.discountPercent / 100);
    }

    return price.unitPriceHT;
  }, [price.unitPriceHT, applicableDiscount]);

  // Size variants using design system
  const sizeStyles = {
    sm: {
      main: 'text-body-sm font-semibold',
      secondary: 'text-caption',
      discount: 'text-caption',
    },
    md: {
      main: 'text-price font-bold',
      secondary: 'text-body-sm',
      discount: 'text-body-sm',
    },
    lg: {
      main: 'text-price-lg font-bold',
      secondary: 'text-body',
      discount: 'text-body-sm',
    },
  };

  const styles = sizeStyles[size];

  // First volume discount for preview
  const firstVolumeDiscount = price.volumeDiscounts?.[0];

  return (
    <div className={cn('space-y-1', className)}>
      {/* Main price row */}
      <div className="flex items-baseline gap-2 flex-wrap">
        {/* Current price HT */}
        <span className={cn(
          styles.main,
          price.isPromotional ? 'text-promo' : 'text-content-primary'
        )}>
          {formatPrice
            ? formatPrice(effectiveUnitPrice)
            : `${formatPriceDisplay(effectiveUnitPrice, price.currency)} HT`}
        </span>

        {/* Unit label */}
        {price.unitLabel && (
          <span className={cn(styles.secondary, 'text-content-muted')}>
            /{price.unitLabel}
          </span>
        )}

        {/* Original price if discounted */}
        {price.originalPriceHT && price.originalPriceHT > price.unitPriceHT && (
          <span className="price-old">
            {formatPriceDisplay(price.originalPriceHT, price.currency)}
          </span>
        )}

        {/* Discount badge */}
        {price.discountPercent && price.discountPercent > 0 && (
          <span className="badge-promo">
            -{Math.round(price.discountPercent)}%
          </span>
        )}
      </div>

      {/* TTC price (smaller) */}
      <div className="price-ht">
        {formatPriceDisplay(price.unitPriceTTC, price.currency)} TTC
      </div>

      {/* Volume discount preview */}
      {showVolumeDiscount && firstVolumeDiscount && (
        <div
          className={cn(
            'flex items-center gap-1.5 pt-1',
            styles.discount,
            'text-success-700'
          )}
        >
          <span className="font-medium">
            {firstVolumeDiscount.label || `Lot de ${firstVolumeDiscount.minQuantity}`}:
          </span>
          <span>
            {firstVolumeDiscount.fixedUnitPrice !== undefined
              ? formatPriceDisplay(firstVolumeDiscount.fixedUnitPrice, price.currency)
              : formatPriceDisplay(
                  price.unitPriceHT * (1 - (firstVolumeDiscount.discountPercent || 0) / 100),
                  price.currency
                )}
            {' HT'}
          </span>
          <span className="text-success-600">
            ({firstVolumeDiscount.fixedUnitPrice !== undefined
              ? formatPriceDisplay(
                  firstVolumeDiscount.fixedUnitPrice,
                  price.currency
                )
              : `-${firstVolumeDiscount.discountPercent}%`}
            /u)
          </span>
        </div>
      )}

      {/* Promotional countdown */}
      {price.isPromotional && price.promotionEndsAt && (
        <PromotionalBadge endsAt={price.promotionEndsAt} />
      )}
    </div>
  );
}

/**
 * Promotional badge with countdown
 */
function PromotionalBadge({ endsAt }: { endsAt: string }) {
  const endDate = new Date(endsAt);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-caption text-warning-700 bg-warning-50 px-2 py-1 rounded mt-1">
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        Offre termine{' '}
        {diffDays === 1 ? 'demain' : `dans ${diffDays} jours`}
      </span>
    </div>
  );
}

/**
 * Compact price display for list/table views
 */
export function ProductCardPriceCompact({
  price,
  className,
}: {
  price: PriceInfo;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn(
        'text-body-sm font-semibold',
        price.isPromotional ? 'text-promo' : 'text-content-primary'
      )}>
        {formatPriceDisplay(price.unitPriceHT, price.currency)} HT
      </span>
      {price.volumeDiscounts && price.volumeDiscounts.length > 0 && (
        <span className="text-caption text-success-600">
          Lot {price.volumeDiscounts[0].minQuantity}:{' '}
          {price.volumeDiscounts[0].fixedUnitPrice !== undefined
            ? formatPriceDisplay(
                price.volumeDiscounts[0].fixedUnitPrice,
                price.currency
              )
            : `-${price.volumeDiscounts[0].discountPercent}%`}
          /u
        </span>
      )}
    </div>
  );
}

export default ProductCardPrice;
