'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * CartDrawer - Slide-out cart panel from the right
 *
 * Features:
 * - Smooth slide animation
 * - Backdrop with blur
 * - Cart items with quantity controls
 * - Totals and free shipping progress
 * - Checkout CTA
 * - Body scroll lock when open
 */
export function CartDrawer() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    cart,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 500;
  const shippingCost = cart.totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 15;
  const amountUntilFreeShipping = FREE_SHIPPING_THRESHOLD - cart.totalPrice;

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, closeDrawer]);

  // Focus trap inside drawer
  useEffect(() => {
    if (isDrawerOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isDrawerOpen]);

  const handleCheckout = () => {
    closeDrawer();
    if (session) {
      router.push('/checkout');
    } else {
      router.push('/login?callbackUrl=/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-luxe-charcoal/60 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 z-[70]',
              'h-full w-full max-w-md',
              'bg-background-cream',
              'shadow-elegant-lg',
              'flex flex-col',
              'focus:outline-none'
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
                <h2
                  id="cart-drawer-title"
                  className="font-serif text-heading-4 text-text-primary"
                >
                  Mon Panier
                </h2>
                {cart.totalItems > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-hermes-500 text-white rounded-full">
                    {cart.totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className={cn(
                  'flex items-center justify-center',
                  'w-10 h-10 -mr-2',
                  'text-text-muted',
                  'transition-colors duration-250',
                  'hover:text-text-primary',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
                )}
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            {cart.items.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-20 h-20 mb-6 rounded-full bg-background-warm flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-text-muted" strokeWidth={1} />
                </div>
                <p className="font-serif text-heading-4 text-text-primary mb-2">
                  Votre panier est vide
                </p>
                <p className="font-sans text-body text-text-muted text-center mb-8">
                  Decouvrez nos collections et trouvez la piece qui vous correspond.
                </p>
                <Link
                  href="/collections"
                  onClick={closeDrawer}
                  className={cn(
                    'inline-flex items-center justify-center',
                    'px-8 py-3',
                    'bg-luxe-charcoal !text-white',
                    'font-sans text-body-sm uppercase tracking-luxe font-medium',
                    'transition-all duration-350 ease-luxe',
                    'hover:bg-hermes-500'
                  )}
                >
                  Voir les collections
                </Link>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {/* Free Shipping Progress */}
                  {amountUntilFreeShipping > 0 && (
                    <div className="mb-6 p-4 bg-background-warm border border-border-light">
                      <p className="font-sans text-caption text-text-muted mb-2">
                        Plus que{' '}
                        <span className="font-medium text-hermes-500">
                          {formatPrice(amountUntilFreeShipping)}
                        </span>{' '}
                        pour la livraison offerte
                      </p>
                      <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min((cart.totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                          }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full bg-hermes-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cart Items */}
                  <ul className="space-y-4">
                    {cart.items.map((item) => (
                      <li
                        key={item.product.id}
                        className="flex gap-4 pb-4 border-b border-border-light last:border-0"
                      >
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.product.slug || item.product.id}`}
                          onClick={closeDrawer}
                          className="relative w-20 h-20 flex-shrink-0 bg-background-warm overflow-hidden rounded-lg border border-border-light group"
                        >
                          <Image
                            src={item.product.images[0] || '/images/placeholder-product.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="80px"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.slug || item.product.id}`}
                            onClick={closeDrawer}
                            className="block"
                          >
                            <h3 className="font-sans text-body font-medium text-text-primary truncate hover:text-hermes-500 transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          {item.product.reference && (
                            <p className="font-sans text-caption text-text-muted mt-0.5">
                              Ref: {item.product.reference}
                            </p>
                          )}
                          <p className="font-sans text-body font-medium text-text-primary mt-2">
                            {formatPrice(item.product.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-border-light">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={cn(
                                  'flex items-center justify-center',
                                  'w-8 h-8',
                                  'text-text-muted',
                                  'transition-colors duration-250',
                                  'hover:text-text-primary hover:bg-background-warm',
                                  'disabled:opacity-40 disabled:cursor-not-allowed'
                                )}
                                aria-label="Diminuer la quantite"
                              >
                                <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                              <span className="w-8 text-center font-sans text-body-sm text-text-primary">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.product.stock || 10)}
                                className={cn(
                                  'flex items-center justify-center',
                                  'w-8 h-8',
                                  'text-text-muted',
                                  'transition-colors duration-250',
                                  'hover:text-text-primary hover:bg-background-warm',
                                  'disabled:opacity-40 disabled:cursor-not-allowed'
                                )}
                                aria-label="Augmenter la quantite"
                              >
                                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className={cn(
                                'flex items-center justify-center',
                                'w-8 h-8',
                                'text-text-muted',
                                'transition-colors duration-250',
                                'hover:text-red-500'
                              )}
                              aria-label={`Supprimer ${item.product.name}`}
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer with Totals */}
                <div className="border-t border-border-light px-6 py-5 bg-background-warm">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-body text-text-secondary">Sous-total</span>
                    <span className="font-sans text-body font-medium text-text-primary">
                      {formatPrice(cart.totalPrice)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-light">
                    <span className="font-sans text-body text-text-secondary">Livraison</span>
                    <span className="font-sans text-body font-medium text-text-primary">
                      {shippingCost === 0 ? (
                        <span className="text-hermes-500">Offerte</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-heading-4 text-text-primary">Total</span>
                    <span className="font-serif text-heading-3 text-text-primary">
                      {formatPrice(cart.totalPrice + shippingCost)}
                    </span>
                  </div>

                  {/* CTA Buttons */}
                  <button
                    onClick={handleCheckout}
                    className={cn(
                      'w-full',
                      'flex items-center justify-center',
                      'px-8 py-4',
                      'bg-luxe-charcoal !text-white',
                      'text-sm uppercase tracking-widest font-medium',
                      'transition-all duration-350 ease-luxe',
                      'hover:bg-hermes-500',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
                    )}
                  >
                    {session ? 'COMMANDER' : 'SE CONNECTER & COMMANDER'}
                  </button>

                  <Link
                    href="/collections"
                    onClick={closeDrawer}
                    className={cn(
                      'block mt-3 text-center',
                      'font-sans text-caption uppercase tracking-elegant',
                      'text-text-muted',
                      'transition-colors duration-250',
                      'hover:text-hermes-500'
                    )}
                  >
                    Continuer mes achats
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
