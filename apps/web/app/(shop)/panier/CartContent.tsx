'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { CartItem } from './CartItem';
import { OrderSummary } from './OrderSummary';
import { EmptyCart } from './EmptyCart';

/**
 * CartContent - Client component managing cart display
 *
 * Features:
 * - Loading skeleton state
 * - Empty cart state
 * - Cart items list with animations
 * - Order summary sidebar
 * - Responsive two-column layout
 */
export function CartContent() {
  const { cart, isLoading, updateQuantity, removeFromCart } = useCart();

  // Loading state
  if (isLoading) {
    return <CartSkeleton />;
  }

  // Empty cart state
  if (cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
      {/* Cart Items Column */}
      <div>
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-light mb-2">
          <h2 className="font-serif text-heading-4 text-text-primary">
            Vos articles ({cart.totalItems})
          </h2>
        </div>

        {/* Cart Items List */}
        <AnimatePresence mode="popLayout">
          {cart.items.map((item, index) => (
            <CartItem
              key={item.product.id}
              item={item}
              index={index}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Order Summary Column */}
      <div className="lg:pl-8">
        <OrderSummary subtotal={cart.totalPrice} itemCount={cart.totalItems} />
      </div>
    </div>
  );
}

/**
 * CartSkeleton - Loading state for cart content
 */
function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
      {/* Cart Items Skeleton */}
      <div>
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-4 border-b border-border-light mb-2">
          <div className="h-7 w-40 bg-background-warm rounded animate-pulse" />
        </div>

        {/* Items Skeleton */}
        {[1, 2, 3].map((i) => (
          <CartItemSkeleton key={i} />
        ))}
      </div>

      {/* Order Summary Skeleton */}
      <div className="lg:pl-8">
        <OrderSummarySkeleton />
      </div>
    </div>
  );
}

/**
 * CartItemSkeleton - Loading state for individual cart item
 */
function CartItemSkeleton() {
  return (
    <div
      className={cn(
        'grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr_auto_auto] gap-4 md:gap-6',
        'py-6 md:py-8',
        'border-b border-border-light'
      )}
    >
      {/* Image Skeleton */}
      <div className="aspect-square bg-background-warm rounded animate-pulse" />

      {/* Content Skeleton */}
      <div className="flex flex-col justify-between">
        <div>
          <div className="h-6 w-48 bg-background-warm rounded animate-pulse mb-2" />
          <div className="h-4 w-24 bg-background-warm rounded animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-background-warm rounded animate-pulse mt-4 md:hidden" />
      </div>

      {/* Quantity Skeleton (Desktop) */}
      <div className="hidden md:flex items-center gap-3">
        <div className="w-10 h-10 bg-background-warm rounded animate-pulse" />
        <div className="w-12 h-6 bg-background-warm rounded animate-pulse" />
        <div className="w-10 h-10 bg-background-warm rounded animate-pulse" />
      </div>

      {/* Price Skeleton (Desktop) */}
      <div className="hidden md:flex flex-col items-end justify-between">
        <div className="h-7 w-24 bg-background-warm rounded animate-pulse" />
      </div>
    </div>
  );
}

/**
 * OrderSummarySkeleton - Loading state for order summary
 */
function OrderSummarySkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'sticky top-32',
        'bg-background-warm',
        'p-6 md:p-8',
        'border border-border-light'
      )}
    >
      {/* Header */}
      <div className="h-7 w-32 bg-background-beige rounded animate-pulse mb-6" />

      {/* Lines */}
      <div className="space-y-4 pb-6 border-b border-border-light">
        <div className="flex justify-between">
          <div className="h-5 w-32 bg-background-beige rounded animate-pulse" />
          <div className="h-5 w-20 bg-background-beige rounded animate-pulse" />
        </div>
        <div className="flex justify-between">
          <div className="h-5 w-28 bg-background-beige rounded animate-pulse" />
          <div className="h-5 w-16 bg-background-beige rounded animate-pulse" />
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between py-6">
        <div className="h-7 w-16 bg-background-beige rounded animate-pulse" />
        <div className="h-8 w-28 bg-background-beige rounded animate-pulse" />
      </div>

      {/* Button */}
      <div className="h-14 w-full bg-background-beige rounded animate-pulse" />

      {/* Link */}
      <div className="h-4 w-40 mx-auto mt-4 bg-background-beige rounded animate-pulse" />
    </motion.div>
  );
}
