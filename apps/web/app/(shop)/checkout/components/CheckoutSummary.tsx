'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Package, Percent, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useCart, type B2BCartItem } from '@/contexts/CartContext';
import { formatPrice, cn } from '@/lib/utils';

/**
 * CheckoutSummary Props
 */
export interface CheckoutSummaryProps {
  /** Whether to show the product list in collapsed mode by default */
  collapsedByDefault?: boolean;
  /** Whether to show the detailed HT/TVA/TTC breakdown */
  showTaxBreakdown?: boolean;
  /** Title override */
  title?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Compact product item display
 */
function ProductItem({ item }: { item: B2BCartItem }) {
  return (
    <div className="flex gap-3 py-3 border-b border-neutral-100 last:border-0">
      {/* Product image */}
      <div className="relative w-14 h-14 flex-shrink-0 bg-neutral-50 rounded overflow-hidden">
        {item.productImage ? (
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-5 w-5 text-neutral-500" />
          </div>
        )}
        {/* Quantity badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-semibold flex items-center justify-center rounded-full">
          {item.quantity}
        </span>
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 text-sm truncate">
          {item.productName}
        </h4>
        {item.productReference && (
          <p className="text-xs text-neutral-500 mt-0.5">
            Ref: {item.productReference}
          </p>
        )}
        {item.pricing.volumeDiscountApplied && (
          <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
            <Percent className="h-3 w-3" />
            {item.pricing.volumeDiscountApplied.label ||
             `Remise ${item.pricing.volumeDiscountApplied.discountPercent}%`}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <span className="text-sm font-semibold text-neutral-900">
          {formatPrice(item.pricing.unitPriceHT * item.quantity)}
        </span>
        {item.pricing.originalPriceHT && item.pricing.originalPriceHT > item.pricing.unitPriceHT && (
          <span className="block text-xs text-neutral-500 line-through">
            {formatPrice(item.pricing.originalPriceHT * item.quantity)}
          </span>
        )}
        <span className="block text-xs text-neutral-500">HT</span>
      </div>
    </div>
  );
}

/**
 * CheckoutSummary Component
 *
 * B2B-styled order summary with HT/TVA/TTC breakdown.
 * Displays products, discounts, and totals.
 *
 * @example
 * <CheckoutSummary showTaxBreakdown />
 */
export function CheckoutSummary({
  collapsedByDefault = false,
  showTaxBreakdown = true,
  title = 'Recapitulatif commande',
  className,
}: CheckoutSummaryProps) {
  const { cart, isLoading } = useCart();
  const [isProductsExpanded, setIsProductsExpanded] = useState(!collapsedByDefault);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-100 rounded w-1/2" />
          <div className="h-16 bg-neutral-100 rounded" />
          <div className="h-16 bg-neutral-100 rounded" />
          <div className="h-px bg-neutral-200" />
          <div className="h-8 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">Votre panier est vide</p>
          <Link
            href="/categories"
            className="text-accent hover:text-accent/80 text-sm font-medium"
          >
            Decouvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent" />
            {title}
          </h2>
          <span className="text-sm text-neutral-600">
            {cart.totalQuantity} {cart.totalQuantity > 1 ? 'articles' : 'article'}
          </span>
        </div>
      </div>

      {/* Products list (collapsible) */}
      <div className="border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setIsProductsExpanded(!isProductsExpanded)}
          className={cn(
            'w-full flex items-center justify-between p-4',
            'hover:bg-neutral-50 transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
          )}
          aria-expanded={isProductsExpanded}
        >
          <span className="text-sm font-medium text-neutral-600">
            Voir les articles ({cart.itemCount})
          </span>
          {isProductsExpanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )}
        </button>

        {isProductsExpanded && (
          <div className="px-4 pb-4 max-h-64 overflow-y-auto">
            {cart.items.map((item) => (
              <ProductItem key={`${item.productId}-${item.variant?.id || ''}`} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Totals section */}
      <div className="p-4 md:p-6 space-y-3">
        {/* Subtotal HT */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Sous-total HT</span>
          <span className="text-neutral-900 font-medium">
            {formatPrice(cart.subtotalHT)}
          </span>
        </div>

        {/* Discounts */}
        {cart.discounts.length > 0 && (
          <>
            {cart.discounts.map((discount, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {discount.label}
                </span>
                <span className="text-green-600 font-medium">
                  -{formatPrice(discount.amountHT)}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Promo code */}
        {cart.promoCode && cart.promoDiscount && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Code promo ({cart.promoCode})
            </span>
            <span className="text-green-600 font-medium">
              -{formatPrice(cart.promoDiscount)}
            </span>
          </div>
        )}

        {/* Shipping estimate */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Livraison estimee</span>
          <span className="text-neutral-900 font-medium">
            {cart.estimatedShippingHT === 0 ? (
              <span className="text-green-600">Offerte</span>
            ) : (
              formatPrice(cart.estimatedShippingHT)
            )}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-200 my-4" />

        {/* Tax breakdown */}
        {showTaxBreakdown && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Total HT</span>
              <span className="text-neutral-900 font-medium">
                {formatPrice(cart.totalHT)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">TVA (20%)</span>
              <span className="text-neutral-900 font-medium">
                {formatPrice(cart.taxAmount)}
              </span>
            </div>
          </>
        )}

        {/* Total TTC */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-neutral-900 font-semibold">
            Total TTC
          </span>
          <span className="text-xl md:text-2xl font-bold text-accent">
            {formatPrice(cart.totalTTC)}
          </span>
        </div>

        {/* Savings highlight */}
        {cart.totalDiscountHT > 0 && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium text-center">
              Vous economisez {formatPrice(cart.totalDiscountHT)} HT sur cette commande
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Minimal summary for confirmation page
 */
export function CheckoutSummaryMinimal({
  className,
}: {
  className?: string;
}) {
  const { cart } = useCart();

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm text-neutral-600">
        <span>Sous-total HT</span>
        <span>{formatPrice(cart.subtotalHT)}</span>
      </div>
      {cart.totalDiscountHT > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Remises</span>
          <span>-{formatPrice(cart.totalDiscountHT)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm text-neutral-600">
        <span>TVA</span>
        <span>{formatPrice(cart.taxAmount)}</span>
      </div>
      <div className="h-px bg-neutral-200 my-2" />
      <div className="flex justify-between font-semibold">
        <span className="text-neutral-900">Total TTC</span>
        <span className="text-accent">{formatPrice(cart.totalTTC)}</span>
      </div>
    </div>
  );
}

export default CheckoutSummary;
