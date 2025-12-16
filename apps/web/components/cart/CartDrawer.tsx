'use client';

/**
 * CartDrawer Component - B2B Enhanced
 *
 * Slide-in drawer from the right with:
 * - Mini cart items list
 * - Quick quantity actions
 * - B2B pricing display (HT/TTC)
 * - Volume discount indicators
 * - Stock status
 * - Quick checkout access
 * - Save cart option (Feature Gated)
 */

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Package,
  AlertCircle,
  CheckCircle,
  Tag,
  Bookmark,
  Loader2,
} from 'lucide-react';
import { useCart, useCartTotals } from '@/contexts/CartContext';
import { useCartFeatures } from '@/contexts/FeatureContext';
import { formatPrice, cn } from '@/lib/utils';

// ============================================================================
// Mini Cart Item
// ============================================================================

interface MiniCartItemProps {
  item: ReturnType<typeof useCart>['cart']['items'][number];
}

function MiniCartItem({ item }: MiniCartItemProps) {
  const { updateQuantity, removeFromCart, stockValidationErrors } = useCart();

  const hasStockError = stockValidationErrors.some((e) => e.productId === item.productId);

  const handleDecrement = async () => {
    if (item.quantity > 1) {
      await updateQuantity(item.productId, item.quantity - 1, item.variant?.id);
    }
  };

  const handleIncrement = async () => {
    if (item.quantity < item.maxQuantity) {
      await updateQuantity(item.productId, item.quantity + 1, item.variant?.id);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.productId, item.variant?.id);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'flex gap-3 p-3 rounded-lg border',
        hasStockError ? 'border-red-200 bg-red-50/30' : 'border-neutral-200 bg-white'
      )}
    >
      {/* Product Image */}
      <Link
        href={`/produits/${item.productSlug}`}
        className="relative w-16 h-16 flex-shrink-0 bg-neutral-100 rounded overflow-hidden group"
      >
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="64px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/produits/${item.productSlug}`}>
          <h4 className="text-sm font-medium text-neutral-900 line-clamp-1 hover:text-accent transition-colors">
            {item.productName}
          </h4>
        </Link>

        {item.productReference && (
          <p className="text-xs text-neutral-500">Ref: {item.productReference}</p>
        )}

        {/* Stock Status */}
        <div className="flex items-center gap-1 mt-1">
          {item.stock.status === 'in_stock' ? (
            <span className="flex items-center gap-0.5 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              En stock
            </span>
          ) : item.stock.status === 'low_stock' ? (
            <span className="flex items-center gap-0.5 text-xs text-amber-600">
              <AlertCircle className="w-3 h-3" />
              Stock limite
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              Rupture
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-neutral-200 rounded">
              <button
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
                className={cn(
                  'flex items-center justify-center w-6 h-6',
                  'text-neutral-500 hover:text-neutral-900',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
                aria-label="Diminuer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-medium text-neutral-900">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={item.quantity >= item.maxQuantity}
                className={cn(
                  'flex items-center justify-center w-6 h-6',
                  'text-neutral-500 hover:text-neutral-900',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
                aria-label="Augmenter"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Remove */}
            <button
              onClick={handleRemove}
              className="flex items-center justify-center w-6 h-6 text-neutral-500 hover:text-red-500 transition-colors"
              aria-label="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Line Total */}
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-900">
              {formatPrice(item.quantity * item.pricing.unitPriceHT)}
            </p>
            {item.pricing.volumeDiscountApplied && (
              <span className="inline-flex items-center gap-0.5 text-xs text-green-600">
                <Tag className="w-2.5 h-2.5" />
                -{item.pricing.volumeDiscountApplied.discountPercent}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CartDrawer() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    cart,
    isLoading,
    isDrawerOpen,
    closeDrawer,
    stockValidationErrors,
    saveCurrentCart,
    savedCarts,
  } = useCart();
  const { subtotalHT, totalDiscountHT, totalHT } = useCartTotals();

  // Feature flags
  const { hasSavedCarts } = useCartFeatures();

  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Focus trap
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

  const handleViewCart = () => {
    closeDrawer();
    router.push('/panier');
  };

  const handleQuickSave = useCallback(() => {
    const name = `Panier du ${new Date().toLocaleDateString('fr-FR')}`;
    saveCurrentCart(name);
  }, [saveCurrentCart]);

  const hasStockErrors = stockValidationErrors.length > 0;

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
            className="fixed inset-0 z-[70] bg-neutral-900/60 backdrop-blur-sm"
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
              'bg-white',
              'shadow-2xl',
              'flex flex-col',
              'focus:outline-none'
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-neutral-900" strokeWidth={1.5} />
                <h2
                  id="cart-drawer-title"
                  className="font-sans font-semibold text-lg text-neutral-900"
                >
                  Mon Panier
                </h2>
                {cart.totalQuantity > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-accent text-white rounded-full">
                    {cart.totalQuantity}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className={cn(
                  'flex items-center justify-center',
                  'w-10 h-10 -mr-2 rounded-full',
                  'text-neutral-500',
                  'transition-colors duration-200',
                  'hover:text-neutral-900 hover:bg-neutral-100'
                )}
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : cart.items.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-20 h-20 mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-neutral-400" strokeWidth={1} />
                </div>
                <p className="font-sans font-semibold text-lg text-neutral-900 mb-2">
                  Votre panier est vide
                </p>
                <p className="text-sm text-neutral-500 text-center mb-8">
                  Decouvrez notre catalogue professionnel.
                </p>
                <Link
                  href="/catalogue"
                  onClick={closeDrawer}
                  className={cn(
                    'inline-flex items-center justify-center gap-2',
                    'px-8 py-3 rounded-lg',
                    'bg-accent text-white',
                    'text-sm font-medium uppercase tracking-wider',
                    'transition-all duration-200',
                    'hover:bg-accent/90'
                  )}
                >
                  Voir le catalogue
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Quick access to saved carts - Feature Gated */}
                {hasSavedCarts && savedCarts.length > 0 && (
                  <div className="mt-8 w-full">
                    <p className="text-xs text-neutral-500 text-center mb-3">
                      Paniers sauvegardes
                    </p>
                    <div className="space-y-2">
                      {savedCarts.slice(0, 2).map((saved) => (
                        <button
                          key={saved.id}
                          onClick={() => {
                            // loadSavedCart(saved.id);
                            closeDrawer();
                            router.push('/panier');
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-3',
                            'bg-white rounded-lg border border-neutral-200',
                            'hover:border-accent transition-colors'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-neutral-500" />
                            <span className="text-sm text-neutral-900">
                              {saved.name}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {saved.itemCount} art.
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Stock Warning */}
                {hasStockErrors && (
                  <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
                    <p className="text-caption text-amber-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Certains articles ont un stock limite
                    </p>
                  </div>
                )}

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {cart.items.map((item) => (
                        <MiniCartItem
                          key={`${item.productId}-${item.variant?.id || ''}`}
                          item={item}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                {/* Footer with Totals */}
                <div className="border-t border-neutral-200 px-6 py-5 bg-white">
                  {/* Discounts */}
                  {totalDiscountHT > 0 && (
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Remises appliquees
                      </span>
                      <span className="text-green-600 font-medium">
                        -{formatPrice(totalDiscountHT)}
                      </span>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">Sous-total HT</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {formatPrice(subtotalHT)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
                    <span className="font-sans font-semibold text-lg text-neutral-900">
                      Total HT
                    </span>
                    <span className="font-sans font-bold text-xl text-accent">
                      {formatPrice(totalHT)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      disabled={hasStockErrors}
                      className={cn(
                        'w-full py-3.5 rounded-lg',
                        'bg-accent text-white',
                        'text-sm font-medium uppercase tracking-wider',
                        'transition-all duration-200',
                        'hover:bg-accent/90',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'flex items-center justify-center gap-2'
                      )}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {session ? 'Commander' : 'Se connecter & Commander'}
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={handleViewCart}
                        className={cn(
                          'flex-1 py-3 rounded-lg',
                          'border border-neutral-200',
                          'text-sm font-medium text-neutral-900',
                          'hover:border-accent hover:text-accent',
                          'transition-colors'
                        )}
                      >
                        Voir le panier
                      </button>

                      {/* Save Cart Button - Feature Gated */}
                      {hasSavedCarts && (
                        <button
                          onClick={handleQuickSave}
                          className={cn(
                            'flex items-center justify-center gap-1',
                            'px-4 py-3 rounded-lg',
                            'border border-neutral-200',
                            'text-sm text-neutral-500',
                            'hover:border-accent hover:text-accent',
                            'transition-colors'
                          )}
                          title="Sauvegarder le panier"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Continue Shopping */}
                  <Link
                    href="/catalogue"
                    onClick={closeDrawer}
                    className={cn(
                      'block mt-4 text-center',
                      'text-xs uppercase tracking-wider',
                      'text-neutral-500',
                      'hover:text-accent transition-colors'
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
