'use client';

/**
 * CartSummary Component - B2B Enhanced
 *
 * Displays cart totals with:
 * - Subtotal (HT)
 * - Applied discounts breakdown
 * - Promo code input
 * - Estimated shipping
 * - Tax amount
 * - Total HT / TTC
 * - Save cart option
 * - Checkout CTA
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Truck,
  Info,
  X,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { useCart, useCartTotals } from '@/contexts/CartContext';
import { formatPrice, cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface CartSummaryProps {
  showCheckout?: boolean;
  showSaveOption?: boolean;
  compact?: boolean;
}

// ============================================================================
// Promo Code Input
// ============================================================================

function PromoCodeInput() {
  const { cart, applyPromoCode, removePromoCode } = useCart();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await applyPromoCode(code);
      if (!success) {
        setError('Code promo invalide ou expire');
      } else {
        setCode('');
        setIsExpanded(false);
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    removePromoCode();
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  // If promo is already applied
  if (cart.promoCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" />
          <span className="text-body-sm font-medium text-green-700">
            {cart.promoCode}
          </span>
          <span className="text-caption text-green-600">
            (-{formatPrice(cart.promoDiscount || 0)})
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="text-green-600 hover:text-green-800 transition-colors"
          aria-label="Supprimer le code promo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm text-neutral-500 hover:text-accent transition-colors"
      >
        <span className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Ajouter un code promo
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="CODE PROMO"
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg border',
                  'text-sm uppercase tracking-wide',
                  'focus:outline-none focus:ring-2 focus:ring-accent/20',
                  error
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-neutral-200 focus:border-accent'
                )}
              />
              <button
                onClick={handleApply}
                disabled={!code.trim() || isLoading}
                className={cn(
                  'px-4 py-2 rounded-lg',
                  'bg-accent text-white',
                  'text-sm font-medium',
                  'transition-all duration-200',
                  'hover:bg-accent/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Appliquer'
                )}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Save Cart Modal
// ============================================================================

interface SaveCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

function SaveCartModal({ isOpen, onClose, onSave }: SaveCartModalProps) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave(name);
    setName('');
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-2xl mx-4"
      >
        <h3 className="font-sans font-semibold text-lg text-neutral-900 mb-4">
          Sauvegarder le panier
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Donnez un nom a ce panier pour le retrouver facilement plus tard.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du panier (ex: Commande Q1 2024)"
          className={cn(
            'w-full px-4 py-3 rounded-lg border border-neutral-200',
            'text-sm text-neutral-900 placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent'
          )}
          autoFocus
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg',
              'border border-neutral-200',
              'text-sm font-medium text-neutral-900',
              'hover:bg-neutral-100 transition-colors'
            )}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg',
              'bg-accent text-white',
              'text-sm font-medium',
              'hover:bg-accent/90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CartSummary({
  showCheckout = true,
  showSaveOption = true,
  compact = false,
}: CartSummaryProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, saveCurrentCart, stockValidationErrors } = useCart();
  const {
    itemCount,
    subtotalHT,
    totalDiscountHT,
    taxAmount,
    totalHT,
    totalTTC,
    discounts,
  } = useCartTotals();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Shipping calculation (simplified)
  const FREE_SHIPPING_THRESHOLD = 500;
  const estimatedShipping = subtotalHT >= FREE_SHIPPING_THRESHOLD ? 0 : 15;
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalHT);

  const hasStockErrors = stockValidationErrors.length > 0;

  const handleCheckout = () => {
    if (session) {
      router.push('/checkout');
    } else {
      router.push('/login?callbackUrl=/checkout');
    }
  };

  const handleSaveCart = (name: string) => {
    saveCurrentCart(name);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  if (itemCount === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Sous-total HT</span>
          <span className="font-medium text-neutral-900">{formatPrice(subtotalHT)}</span>
        </div>
        {totalDiscountHT > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Remises</span>
            <span>-{formatPrice(totalDiscountHT)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium pt-2 border-t border-neutral-200">
          <span className="text-neutral-900">Total TTC</span>
          <span className="text-neutral-900">{formatPrice(totalTTC + estimatedShipping)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
        <h2 className="font-sans font-semibold text-lg text-neutral-900">
          Recapitulatif
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600">
            Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})
          </span>
          <span className="text-sm font-medium text-neutral-900">
            {formatPrice(subtotalHT)} HT
          </span>
        </div>

        {/* Discounts */}
        {discounts.length > 0 && (
          <div className="space-y-2 pb-4 border-b border-neutral-200">
            {discounts.map((discount, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {discount.label}
                </span>
                <span className="text-green-600 font-medium">
                  -{formatPrice(discount.amountHT)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Promo Code */}
        <PromoCodeInput />

        {/* Shipping */}
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-neutral-600 flex items-center gap-1">
              <Truck className="w-4 h-4" />
              Livraison estimee
            </span>
            <span className="text-sm font-medium text-neutral-900">
              {estimatedShipping === 0 ? (
                <span className="text-green-600">Offerte</span>
              ) : (
                `${formatPrice(estimatedShipping)} HT`
              )}
            </span>
          </div>

          {/* Free shipping progress */}
          {amountUntilFreeShipping > 0 && (
            <div className="mt-2 p-3 bg-accent/5 rounded-lg">
              <p className="text-xs text-accent mb-2">
                Plus que{' '}
                <span className="font-medium">
                  {formatPrice(amountUntilFreeShipping)} HT
                </span>{' '}
                pour la livraison offerte
              </p>
              <div className="h-1.5 bg-accent/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((subtotalHT / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm text-neutral-500">
          <span>TVA (20%)</span>
          <span>{formatPrice(taxAmount)}</span>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-neutral-200 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-900">Total HT</span>
            <span className="text-sm font-medium text-neutral-900">
              {formatPrice(totalHT + estimatedShipping)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans font-semibold text-lg text-neutral-900">Total TTC</span>
            <span className="font-sans font-bold text-xl text-accent">
              {formatPrice(totalTTC + estimatedShipping + (estimatedShipping * 0.2))}
            </span>
          </div>
        </div>

        {/* Stock Error Warning */}
        {hasStockErrors && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Certains articles ont un stock insuffisant. Veuillez ajuster les quantites.
            </p>
          </div>
        )}

        {/* Actions */}
        {showCheckout && (
          <div className="pt-4 space-y-3">
            <button
              onClick={handleCheckout}
              disabled={hasStockErrors || itemCount === 0}
              className={cn(
                'w-full py-4 rounded-lg',
                'bg-accent text-white',
                'text-sm font-medium uppercase tracking-wider',
                'transition-all duration-200',
                'hover:bg-accent/90',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              <ShoppingBag className="w-5 h-5" />
              {session ? 'Commander' : 'Se connecter & Commander'}
            </button>

            {showSaveOption && (
              <button
                onClick={() => setShowSaveModal(true)}
                className={cn(
                  'w-full py-3 rounded-lg',
                  'border border-neutral-200',
                  'text-sm font-medium text-neutral-900',
                  'transition-colors duration-200',
                  'hover:bg-neutral-100 hover:border-accent',
                  'flex items-center justify-center gap-2'
                )}
              >
                <Bookmark className="w-4 h-4" />
                Sauvegarder ce panier
              </button>
            )}
          </div>
        )}

        {/* Saved confirmation */}
        <AnimatePresence>
          {savedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-xs"
            >
              <Check className="w-4 h-4" />
              Panier sauvegarde avec succes
            </motion.div>
          )}
        </AnimatePresence>

        {/* B2B Info */}
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex items-start gap-2 text-xs text-neutral-500">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Les prix affiches sont des prix professionnels HT. Les remises volume
              sont appliquees automatiquement selon les quantites commandees.
            </p>
          </div>
        </div>
      </div>

      {/* Save Cart Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <SaveCartModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSaveCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CartSummary;
