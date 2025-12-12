'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

interface CartIndicatorProps {
  /** Additional CSS classes */
  className?: string;
  /** Show count badge even when cart is empty */
  showEmptyBadge?: boolean;
  /** Custom aria-label prefix (defaults to "Panier") */
  ariaLabelPrefix?: string;
  /** Use link navigation instead of opening drawer */
  asLink?: boolean;
}

/**
 * CartIndicator Component
 *
 * A compact cart icon with animated item count badge.
 * Designed for use in the site header.
 * Follows the luxury Hermes-inspired design language.
 */
export function CartIndicator({
  className,
  showEmptyBadge = false,
  ariaLabelPrefix = 'Panier',
  asLink = false,
}: CartIndicatorProps) {
  const { cart, isLoading, openDrawer } = useCart();
  const itemCount = cart.totalItems;

  // Determine if badge should be visible
  const showBadge = itemCount > 0 || showEmptyBadge;

  // Format count for display (9+ for 10 or more items)
  const displayCount = itemCount > 9 ? '9+' : itemCount.toString();

  // Accessible label with item count
  const ariaLabel = itemCount > 0
    ? `${ariaLabelPrefix} (${itemCount} ${itemCount === 1 ? 'article' : 'articles'})`
    : ariaLabelPrefix;

  const sharedClassName = cn(
    'relative flex items-center justify-center',
    'w-10 h-10 rounded-full',
    'text-text-secondary hover:text-text-primary',
    'hover:bg-background-warm',
    'transition-all duration-300 ease-luxe',
    'focus:outline-none focus-visible:ring-1 focus-visible:ring-luxe-charcoal/20',
    'group',
    className
  );

  const content = (
    <>
      {/* Shopping bag icon */}
      <ShoppingBag
        className={cn(
          'w-[17px] h-[17px]',
          'transition-transform duration-300',
          'group-hover:scale-105',
          // Subtle opacity change when loading
          isLoading && 'opacity-50'
        )}
        strokeWidth={1.25}
      />

      {/* Animated item count badge */}
      <AnimatePresence mode="wait">
        {showBadge && itemCount > 0 && (
          <motion.span
            key="cart-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
            }}
            className={cn(
              'absolute -top-0.5 -right-0.5',
              'min-w-4 h-4 px-1 rounded-full',
              'bg-luxe-charcoal text-white',
              'text-[9px] font-medium',
              'flex items-center justify-center',
              'pointer-events-none'
            )}
          >
            {displayCount}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Pulse animation when item is added */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key="cart-pulse"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
              'absolute inset-0',
              'rounded-full',
              'bg-hermes-500/20',
              'pointer-events-none'
            )}
          />
        )}
      </AnimatePresence>
    </>
  );

  // Render as link or button based on asLink prop
  if (asLink) {
    return (
      <Link href="/panier" className={sharedClassName} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={openDrawer}
      className={sharedClassName}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}

/**
 * Compact version of CartIndicator for mobile or smaller spaces
 */
export function CartIndicatorCompact({ className, asLink = false }: { className?: string; asLink?: boolean }) {
  const { cart, openDrawer } = useCart();
  const itemCount = cart.totalItems;

  const sharedClassName = cn(
    'relative inline-flex items-center gap-2',
    'text-text-secondary hover:text-text-primary',
    'transition-colors duration-300 ease-luxe',
    className
  );

  const content = (
    <>
      <ShoppingBag className="w-4 h-4" strokeWidth={1.25} />
      {itemCount > 0 && (
        <span className="text-caption font-medium">
          {itemCount}
        </span>
      )}
    </>
  );

  if (asLink) {
    return (
      <Link
        href="/panier"
        className={sharedClassName}
        aria-label={`Panier (${itemCount} articles)`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={openDrawer}
      className={sharedClassName}
      aria-label={`Panier (${itemCount} articles)`}
    >
      {content}
    </button>
  );
}

export default CartIndicator;
