'use client';

/**
 * ProductPricing - B2B Product Pricing Component
 *
 * Features:
 * - Price display based on customer price list
 * - Volume discount tiers with quantity thresholds
 * - Promotional/crossed-out pricing
 * - HT/TTC toggle based on user preference
 * - Tier-specific discount indicator
 * - Contract price display for negotiated rates
 * - Real-time price calculation as quantity changes
 *
 * @packageDocumentation
 */

import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Percent,
  TrendingDown,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { usePricing, useProductPrice, type PriceDisplayFormat } from '@/contexts/PricingContext';
import type { VolumeDiscount, CalculatedPrice } from '@maison/types';

// ============================================================================
// Types
// ============================================================================

export interface ProductPricingProps {
  /** Product ID for price calculation */
  productId: string;
  /** Base price of the product (HT) */
  basePrice: number;
  /** Compare at price for promotions */
  compareAtPrice?: number;
  /** Current selected quantity */
  quantity?: number;
  /** Product category for volume discounts */
  category?: string;
  /** Show volume discount tiers */
  showVolumeTiers?: boolean;
  /** Show price source info */
  showPriceSource?: boolean;
  /** Compact display mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when quantity tier is clicked */
  onTierClick?: (tier: VolumeDiscount) => void;
}

// ============================================================================
// Animation Variants
// ============================================================================

const priceAnimationVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

// ============================================================================
// Sub-Components
// ============================================================================

interface PriceDisplayProps {
  priceHT: number;
  priceTTC: number;
  originalPrice?: number;
  format: PriceDisplayFormat;
  formatPrice: (price: number, options?: { format?: PriceDisplayFormat }) => string;
  isPromotional?: boolean;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg';
}

function PriceDisplay({
  priceHT,
  priceTTC,
  originalPrice,
  format,
  formatPrice,
  isPromotional,
  discountPercent,
  size = 'lg',
}: PriceDisplayProps) {
  const displayPrice = format === 'ttc' ? priceTTC : priceHT;
  const displayOriginal = originalPrice
    ? format === 'ttc'
      ? originalPrice * 1.2 // Assuming 20% tax
      : originalPrice
    : undefined;

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl md:text-4xl',
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-3 flex-wrap">
        {/* Original Price (crossed out) */}
        {displayOriginal && displayOriginal > displayPrice && (
          <span className="text-neutral-500 line-through text-lg">
            {formatPrice(displayOriginal, { format })}
          </span>
        )}

        {/* Current Price */}
        <AnimatePresence mode="wait">
          <motion.span
            key={displayPrice}
            className={cn(
              'font-semibold text-neutral-900',
              sizeClasses[size],
              isPromotional && 'text-red-600'
            )}
            {...priceAnimationVariants}
            transition={{ duration: 0.2 }}
          >
            {formatPrice(displayPrice, { format })}
          </motion.span>
        </AnimatePresence>

        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <Badge variant="error" size="sm" className="ml-1">
            <TrendingDown className="w-3 h-3 mr-1" />
            -{Math.round(discountPercent)}%
          </Badge>
        )}
      </div>

      {/* Secondary price (opposite format) */}
      {format === 'both' && (
        <span className="text-neutral-500 text-sm">
          soit {formatPrice(priceTTC, { format: 'ttc' })}
        </span>
      )}
    </div>
  );
}

// Volume Discount Tier Component
interface VolumeTierProps {
  tier: VolumeDiscount;
  isActive: boolean;
  formatPrice: (price: number, options?: { format?: PriceDisplayFormat }) => string;
  basePrice: number;
  onClick?: () => void;
}

function VolumeTier({
  tier,
  isActive,
  formatPrice,
  basePrice,
  onClick,
}: VolumeTierProps) {
  const tierPrice = tier.fixedUnitPrice ?? basePrice * (1 - (tier.discountPercent ?? 0) / 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-between gap-4 p-3 rounded-lg border transition-all duration-200',
        isActive
          ? 'border-accent bg-accent/5 ring-1 ring-accent'
          : 'border-neutral-200 hover:border-accent/50 hover:bg-neutral-50',
        onClick ? 'cursor-pointer' : 'cursor-default'
      )}
    >
      <div className="flex items-center gap-2">
        {isActive && <CheckCircle2 className="w-4 h-4 text-accent" />}
        <span className={cn('text-sm', isActive ? 'text-accent font-medium' : 'text-neutral-600')}>
          {tier.label || `A partir de ${tier.minQuantity}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('font-medium', isActive ? 'text-accent' : 'text-neutral-900')}>
          {formatPrice(tierPrice, { format: 'ht' })}
        </span>
        {tier.discountPercent && (
          <Badge variant={isActive ? 'warning' : 'light'} size="xs">
            -{tier.discountPercent}%
          </Badge>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductPricing({
  productId,
  basePrice,
  compareAtPrice,
  quantity = 1,
  category,
  showVolumeTiers = true,
  showPriceSource = true,
  compact = false,
  className,
  onTierClick,
}: ProductPricingProps) {
  const {
    settings,
    formatPrice,
    tierDiscount,
    activePriceList,
    hasActivePromotion,
    getPromotionEndDate,
    getVolumeDiscounts,
    getApplicableVolumeDiscount,
  } = usePricing();

  const {
    unitPriceHT,
    unitPriceTTC,
    originalPriceHT,
    discountPercent,
    volumeDiscountApplied,
    priceSource,
    isPromotional,
    promotionEndsAt,
  } = useProductPrice(productId, basePrice, quantity);

  // Get volume discounts for display
  const volumeDiscounts = useMemo(
    () => getVolumeDiscounts(productId, category),
    [getVolumeDiscounts, productId, category]
  );

  // Format promotion end date
  const formattedPromotionEnd = useMemo(() => {
    if (!promotionEndsAt) return null;
    const date = new Date(promotionEndsAt);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [promotionEndsAt]);

  // Calculate total price
  const totalPriceHT = unitPriceHT * quantity;
  const totalPriceTTC = unitPriceTTC * quantity;

  // Check if current quantity qualifies for a tier
  const currentTier = getApplicableVolumeDiscount(productId, quantity, category);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Price Source Badge */}
      {showPriceSource && !compact && priceSource && (
        <div className="flex items-center gap-2 text-sm">
          <Tag className="w-4 h-4 text-neutral-500" />
          <span className="text-neutral-600">
            Tarif: <span className="font-medium text-neutral-900">{priceSource.name}</span>
          </span>
          {tierDiscount > 0 && (
            <Badge variant="success" size="xs">
              <Percent className="w-3 h-3 mr-1" />
              {tierDiscount}% remise client
            </Badge>
          )}
        </div>
      )}

      {/* Promotional Banner */}
      {isPromotional && formattedPromotionEnd && !compact && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-red-50 border border-red-200'
          )}
        >
          <Clock className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600">
            Promotion valable jusqu'au {formattedPromotionEnd}
          </span>
        </motion.div>
      )}

      {/* Main Price Display */}
      <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
        {/* Unit Price */}
        <div>
          <div className="text-neutral-500 text-sm mb-1">Prix unitaire</div>
          <PriceDisplay
            priceHT={unitPriceHT}
            priceTTC={unitPriceTTC}
            originalPrice={originalPriceHT}
            format={settings.displayFormat}
            formatPrice={formatPrice}
            isPromotional={isPromotional}
            discountPercent={discountPercent}
            size={compact ? 'md' : 'lg'}
          />
        </div>

        {/* Applied Volume Discount Info */}
        {volumeDiscountApplied && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">
              {volumeDiscountApplied.label || `Remise quantite appliquee`}
              {volumeDiscountApplied.discountPercent && (
                <span className="font-medium"> (-{volumeDiscountApplied.discountPercent}%)</span>
              )}
            </span>
          </div>
        )}

        {/* Total Price (when quantity > 1) */}
        {quantity > 1 && (
          <div className={cn(
            'pt-3 border-t border-neutral-200',
            compact && 'pt-2'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 text-sm">
                Total ({quantity} unites)
              </span>
              <div className="text-right">
                <div className="font-semibold text-neutral-900 text-lg">
                  {formatPrice(settings.displayFormat === 'ttc' ? totalPriceTTC : totalPriceHT, {
                    format: settings.displayFormat,
                  })}
                </div>
                {settings.displayFormat !== 'both' && (
                  <div className="text-neutral-500 text-xs">
                    {settings.displayFormat === 'ht'
                      ? `soit ${formatPrice(totalPriceTTC, { format: 'ttc' })}`
                      : `soit ${formatPrice(totalPriceHT, { format: 'ht' })}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Volume Discount Tiers */}
      {showVolumeTiers && volumeDiscounts.length > 0 && !compact && (
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-900">
              Paliers de quantite
            </span>
            <button
              type="button"
              className="text-neutral-500 hover:text-neutral-600 transition-colors"
              aria-label="Plus d'informations sur les paliers"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="grid gap-2">
            {/* Base price tier */}
            <VolumeTier
              tier={{ minQuantity: 1, discountPercent: 0, label: 'Prix unitaire' }}
              isActive={!currentTier}
              formatPrice={formatPrice}
              basePrice={basePrice * (1 - tierDiscount / 100)}
              onClick={onTierClick ? () => onTierClick({ minQuantity: 1, discountPercent: 0 }) : undefined}
            />

            {/* Volume discount tiers */}
            {volumeDiscounts.map((tier, index) => (
              <VolumeTier
                key={`tier-${tier.minQuantity}-${index}`}
                tier={tier}
                isActive={currentTier?.minQuantity === tier.minQuantity}
                formatPrice={formatPrice}
                basePrice={basePrice * (1 - tierDiscount / 100)}
                onClick={onTierClick ? () => onTierClick(tier) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tax Info Footer */}
      {!compact && (
        <div className="flex items-center gap-1 text-xs text-neutral-500 pt-2">
          <Info className="w-3 h-3" />
          <span>
            Prix {settings.displayFormat === 'ht' ? 'Hors Taxes' : 'Toutes Taxes Comprises'}.
            TVA {settings.defaultTaxRate.rate}% applicable.
          </span>
        </div>
      )}
    </div>
  );
}

export default ProductPricing;
