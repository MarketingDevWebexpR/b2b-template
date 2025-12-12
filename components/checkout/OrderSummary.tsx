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
 * Hermes-inspired luxury styling
 */
export function OrderSummary({ compact = false, className }: OrderSummaryProps) {
  const { cart, isLoading } = useCart();

  // Calculate shipping
  const shippingCost = cart.totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const orderTotal = cart.totalPrice + shippingCost;

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-background-beige p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-border-light w-1/2" />
          <div className="h-20 bg-border-light" />
          <div className="h-20 bg-border-light" />
          <div className="h-px bg-border-light" />
          <div className="h-6 bg-border-light" />
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className={cn('bg-background-beige p-6', className)}>
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted mb-4">Votre panier est vide</p>
          <Link
            href="/collections"
            className="text-hermes-500 hover:text-hermes-600 text-sm uppercase tracking-luxe"
          >
            Decouvrir nos collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-background-beige', className)}>
      {/* Header */}
      <div className="p-6 border-b border-border-light">
        <h2 className="font-serif text-lg md:text-xl text-text-primary flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-hermes-500" />
          Votre commande
        </h2>
        <p className="text-sm text-text-muted mt-1">
          {cart.totalItems} {cart.totalItems > 1 ? 'articles' : 'article'}
        </p>
      </div>

      {/* Cart items */}
      <div className={cn('divide-y divide-border-light', compact ? 'max-h-60 overflow-y-auto' : '')}>
        {cart.items.map((item) => (
          <div
            key={item.product.id}
            className="p-4 flex gap-4"
          >
            {/* Product image */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white border border-border-light">
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-6 w-6 text-text-muted" />
                </div>
              )}

              {/* Quantity badge */}
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-hermes-500 text-white text-xs font-medium flex items-center justify-center">
                {item.quantity}
              </span>
            </div>

            {/* Product details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-text-primary text-sm truncate">
                {item.product.name}
              </h3>
              {item.product.reference && (
                <p className="text-xs text-text-muted mt-0.5">
                  Ref: {item.product.reference}
                </p>
              )}
              <p className="text-sm text-hermes-600 mt-1 font-medium">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals section */}
      <div className="p-6 border-t border-border-light space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Sous-total</span>
          <span className="text-text-primary">{formatPrice(cart.totalPrice)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Livraison</span>
          <span className="text-text-primary">
            {shippingCost === 0 ? (
              <span className="text-green-600">Offerte</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-light my-4" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-text-primary">Total</span>
          <span className="font-serif text-xl md:text-2xl text-hermes-600">
            {formatPrice(orderTotal)}
          </span>
        </div>

        {/* Tax note */}
        <p className="text-xs text-text-muted text-right">
          TVA incluse
        </p>
      </div>

      {/* Trust badges */}
      {!compact && (
        <div className="px-6 pb-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <Truck className="h-4 w-4 text-hermes-500 flex-shrink-0" />
            <span>Livraison securisee sous 3-5 jours</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <Shield className="h-4 w-4 text-hermes-500 flex-shrink-0" />
            <span>Retours gratuits sous 30 jours</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <Package className="h-4 w-4 text-hermes-500 flex-shrink-0" />
            <span>Ecrin et certificat inclus</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderSummary;
