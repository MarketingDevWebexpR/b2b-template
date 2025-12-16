'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Package, Truck, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, cn } from '@/lib/utils';

/**
 * OrderSummary Props
 */
interface OrderSummaryProps {
  /** Whether the order summary is in compact mode */
  compact?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Shipping cost (free above threshold)
 */
const SHIPPING_COST = 0; // Livraison offerte
const FREE_SHIPPING_THRESHOLD = 0;

/**
 * OrderSummary Component
 * Displays cart items and totals in the checkout sidebar
 * B2B professional neutral aesthetic
 */
export function OrderSummary({ compact = false, className }: OrderSummaryProps) {
  const { cart, isLoading } = useCart();

  // Calculate shipping
  const shippingCost = cart.totalTTC >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const orderTotal = cart.totalTTC + shippingCost;

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-neutral-50 p-6 rounded-lg', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/2" />
          <div className="h-20 bg-neutral-200 rounded" />
          <div className="h-20 bg-neutral-200 rounded" />
          <div className="h-px bg-neutral-200" />
          <div className="h-6 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className={cn('bg-neutral-50 p-6 rounded-lg', className)}>
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">Votre panier est vide</p>
          <Link
            href="/categories"
            className="text-accent hover:text-accent/80 text-sm font-medium uppercase tracking-wider"
          >
            Decouvrir nos categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-neutral-50 rounded-lg', className)}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <h2 className="font-sans font-semibold text-lg md:text-xl text-neutral-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-accent" />
          Votre commande
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          {cart.itemCount} {cart.itemCount > 1 ? 'articles' : 'article'}
        </p>
      </div>

      {/* Cart items */}
      <div className={cn('divide-y divide-neutral-200', compact ? 'max-h-60 overflow-y-auto' : '')}>
        {cart.items.map((item) => (
          <div
            key={item.productId}
            className="p-4 flex gap-4"
          >
            {/* Product image */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white rounded border border-neutral-200">
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  className="object-cover rounded"
                  sizes="80px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-6 w-6 text-neutral-400" />
                </div>
              )}

              {/* Quantity badge */}
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white text-xs font-medium flex items-center justify-center rounded-full">
                {item.quantity}
              </span>
            </div>

            {/* Product details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-neutral-900 text-sm truncate">
                {item.productName}
              </h3>
              {item.productReference && (
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ref: {item.productReference}
                </p>
              )}
              <p className="text-sm text-accent mt-1 font-semibold">
                {formatPrice(item.pricing.unitPriceTTC * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals section */}
      <div className="p-6 border-t border-neutral-200 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Sous-total</span>
          <span className="text-neutral-900">{formatPrice(cart.totalTTC)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Livraison</span>
          <span className="text-neutral-900">
            {shippingCost === 0 ? (
              <span className="text-green-600 font-medium">Offerte</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-200 my-4" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-neutral-900">Total</span>
          <span className="font-sans font-bold text-xl md:text-2xl text-accent">
            {formatPrice(orderTotal)}
          </span>
        </div>

        {/* Tax note */}
        <p className="text-xs text-neutral-500 text-right">
          TVA incluse
        </p>
      </div>

      {/* Trust badges */}
      {!compact && (
        <div className="px-6 pb-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Truck className="h-4 w-4 text-accent flex-shrink-0" />
            <span>Livraison securisee sous 3-5 jours</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Shield className="h-4 w-4 text-accent flex-shrink-0" />
            <span>Retours gratuits sous 30 jours</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Package className="h-4 w-4 text-accent flex-shrink-0" />
            <span>Emballage professionnel inclus</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderSummary;
