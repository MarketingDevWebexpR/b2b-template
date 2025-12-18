'use client';


/**
 * Cart Page - B2B
 *
 * Full cart page with:
 * - Cart items list with inline editing
 * - Cart summary with B2B pricing
 * - Saved carts functionality
 * - Continue shopping / checkout actions
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  Truck,
  Shield,
  Info,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { CartEmpty } from '@/components/cart/CartEmpty';
import { SavedCarts } from '@/components/cart/SavedCarts';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type CartTab = 'current' | 'saved';

// ============================================================================
// Component
// ============================================================================

export default function CartPage() {
  const {
    cart,
    isLoading,
    isValidatingStock,
    stockValidationErrors,
    clearCart,
    validateStock,
  } = useCart();

  const [activeTab, setActiveTab] = useState<CartTab>('current');
  const [isValidating, setIsValidating] = useState(false);

  // Handle stock validation
  const handleValidateStock = async () => {
    setIsValidating(true);
    await validateStock();
    setIsValidating(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-body text-content-muted">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cart.items.length === 0 && activeTab === 'current') {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header with tabs */}
        <div className="mb-8">
          <h1 className="font-sans text-heading-2 text-content-primary mb-6">
            Mon Panier
          </h1>
          <CartTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <CartEmpty />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-sans text-heading-2 text-content-primary">
            Mon Panier
          </h1>
          {activeTab === 'current' && cart.items.length > 0 && (
            <span className="text-body text-content-muted">
              {cart.totalQuantity} article{cart.totalQuantity > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tabs */}
        <CartTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'current' ? (
          <motion.div
            key="current-cart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Stock validation warnings */}
            {stockValidationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 mb-2">
                      Attention: Certains articles ont un stock limite
                    </p>
                    <ul className="text-caption text-amber-700 space-y-1">
                      {stockValidationErrors.map((error) => (
                        <li key={error.productId}>
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items - Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Actions bar */}
                <div className="flex items-center justify-between pb-4 border-b border-stroke-light">
                  <Link
                    href="/catalogue"
                    className="inline-flex items-center gap-2 text-body text-content-muted hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continuer mes achats
                  </Link>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleValidateStock}
                      disabled={isValidating || isValidatingStock}
                      className={cn(
                        'inline-flex items-center gap-2',
                        'text-caption text-content-muted',
                        'hover:text-primary transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isValidating || isValidatingStock ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Verifier les stocks
                    </button>

                    <button
                      onClick={clearCart}
                      className="text-caption text-content-muted hover:text-red-500 transition-colors"
                    >
                      Vider le panier
                    </button>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.variant?.id || ''}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CartItem item={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stroke-light">
                  <div className="flex items-center gap-3 p-4 bg-surface-secondary rounded-lg">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-caption font-medium text-content-primary">
                        Livraison rapide
                      </p>
                      <p className="text-caption text-content-muted">
                        24-48h ouvrees
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-surface-secondary rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-caption font-medium text-content-primary">
                        Emballage soigne
                      </p>
                      <p className="text-caption text-content-muted">
                        Qualite professionnelle
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-surface-secondary rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-caption font-medium text-content-primary">
                        Paiement securise
                      </p>
                      <p className="text-caption text-content-muted">
                        SSL / 3D Secure
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart Summary - Right Column */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CartSummary />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="saved-carts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SavedCarts />
          </motion.div>
        )}
      </AnimatePresence>

      {/* B2B Info Banner */}
      <div className="mt-12 p-6 bg-neutral-900/5 border border-stroke-light rounded-lg">
        <div className="flex items-start gap-4">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-content-primary mb-2">
              Avantages B2B
            </h3>
            <ul className="text-body-sm text-content-secondary space-y-1">
              <li>Remises volume automatiques selon les quantites commandees</li>
              <li>Prix negocie selon votre niveau de partenariat</li>
              <li>Sauvegardez vos paniers pour les reutiliser plus tard</li>
              <li>Workflow dapprobation pour les commandes importantes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Cart Tabs Component
// ============================================================================

interface CartTabsProps {
  activeTab: CartTab;
  onTabChange: (tab: CartTab) => void;
}

function CartTabs({ activeTab, onTabChange }: CartTabsProps) {
  const { savedCarts } = useCart();

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-lg inline-flex">
      <button
        onClick={() => onTabChange('current')}
        className={cn(
          'px-4 py-2 rounded-md text-body-sm font-medium transition-all duration-200',
          activeTab === 'current'
            ? 'bg-white text-content-primary shadow-sm'
            : 'text-content-muted hover:text-content-primary'
        )}
      >
        <span className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Panier actuel
        </span>
      </button>
      <button
        onClick={() => onTabChange('saved')}
        className={cn(
          'px-4 py-2 rounded-md text-body-sm font-medium transition-all duration-200',
          activeTab === 'saved'
            ? 'bg-white text-content-primary shadow-sm'
            : 'text-content-muted hover:text-content-primary'
        )}
      >
        <span className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Paniers sauvegardes
          {savedCarts.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
              {savedCarts.length}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
