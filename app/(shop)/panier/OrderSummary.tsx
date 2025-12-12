'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Truck, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  /** Subtotal before shipping */
  subtotal: number;
  /** Number of items in cart */
  itemCount: number;
}

/**
 * OrderSummary - Cart total summary with checkout CTA
 *
 * Features:
 * - Subtotal display
 * - Estimated shipping
 * - Total calculation
 * - Authentication check for checkout
 * - Login prompt modal
 * - Trust badges
 */
export function OrderSummary({ subtotal, itemCount }: OrderSummaryProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Shipping is free above 500EUR, otherwise 15EUR
  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = 15;
  const shippingEstimate = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingEstimate;
  const amountUntilFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleCheckout = () => {
    if (status === 'loading') return;

    if (session) {
      // User is logged in, proceed to checkout
      router.push('/checkout');
    } else {
      // Show login prompt
      setShowLoginPrompt(true);
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to login with callback to checkout
    router.push('/auth/connexion?callbackUrl=/checkout');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'sticky top-32',
          'bg-background-warm',
          'p-6 md:p-8',
          'border border-border-light'
        )}
      >
        {/* Header */}
        <h2 className="font-serif text-heading-4 text-text-primary mb-6">
          Recapitulatif
        </h2>

        {/* Order Lines */}
        <div className="space-y-4 pb-6 border-b border-border-light">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-body text-text-secondary">
              Sous-total ({itemCount} {itemCount > 1 ? 'articles' : 'article'})
            </span>
            <span className="font-sans text-body font-medium text-text-primary">
              {formatPrice(subtotal)}
            </span>
          </div>

          {/* Shipping */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-body text-text-secondary">
              Livraison estimee
            </span>
            <span className="font-sans text-body font-medium text-text-primary">
              {shippingEstimate === 0 ? (
                <span className="text-hermes-500">Offerte</span>
              ) : (
                formatPrice(shippingEstimate)
              )}
            </span>
          </div>

          {/* Free shipping progress */}
          {amountUntilFreeShipping > 0 && (
            <div className="pt-2">
              <p className="font-sans text-caption text-text-muted mb-2">
                Plus que{' '}
                <span className="font-medium text-hermes-500">
                  {formatPrice(amountUntilFreeShipping)}
                </span>{' '}
                pour beneficier de la livraison offerte
              </p>
              <div className="h-1 bg-border-light rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-hermes-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between py-6">
          <span className="font-serif text-heading-4 text-text-primary">
            Total
          </span>
          <span className="font-serif text-heading-3 text-text-primary">
            {formatPrice(total)}
          </span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={status === 'loading'}
          className={cn(
            'w-full',
            'flex items-center justify-center',
            'px-8 py-4',
            'bg-luxe-charcoal text-text-inverse',
            'font-sans text-body-sm uppercase tracking-luxe font-medium',
            'transition-all duration-350 ease-luxe',
            'hover:bg-hermes-500',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {status === 'loading' ? 'Chargement...' : 'Passer la commande'}
        </button>

        {/* Continue Shopping Link */}
        <Link
          href="/collections"
          className={cn(
            'block mt-4 text-center',
            'font-sans text-caption uppercase tracking-elegant',
            'text-text-muted',
            'transition-colors duration-250 ease-luxe',
            'hover:text-hermes-500'
          )}
        >
          Continuer mes achats
        </Link>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-border-light">
          <div className="grid grid-cols-3 gap-4">
            <TrustBadge
              icon={<ShieldCheck className="w-5 h-5" strokeWidth={1.25} />}
              label="Paiement securise"
            />
            <TrustBadge
              icon={<Truck className="w-5 h-5" strokeWidth={1.25} />}
              label="Livraison assuree"
            />
            <TrustBadge
              icon={<RotateCcw className="w-5 h-5" strokeWidth={1.25} />}
              label="Retours 30 jours"
            />
          </div>
        </div>
      </motion.div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          onLogin={handleLoginRedirect}
        />
      )}
    </>
  );
}

/**
 * Trust Badge Component
 */
interface TrustBadgeProps {
  icon: React.ReactNode;
  label: string;
}

function TrustBadge({ icon, label }: TrustBadgeProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-text-muted mb-2">{icon}</span>
      <span className="font-sans text-[10px] md:text-caption uppercase tracking-elegant text-text-muted leading-tight">
        {label}
      </span>
    </div>
  );
}

/**
 * Login Prompt Modal Component
 */
interface LoginPromptModalProps {
  onClose: () => void;
  onLogin: () => void;
}

function LoginPromptModal({ onClose, onLogin }: LoginPromptModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-luxe-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'relative',
          'w-full max-w-md',
          'bg-background-cream',
          'p-8 md:p-10',
          'shadow-elegant-lg'
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4',
            'flex items-center justify-center',
            'w-8 h-8',
            'text-text-muted',
            'transition-colors duration-250',
            'hover:text-text-primary',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-hermes-500'
          )}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Content */}
        <div className="text-center">
          <h3
            id="login-prompt-title"
            className="font-serif text-heading-3 text-text-primary mb-4"
          >
            Connexion requise
          </h3>

          <p className="font-sans text-body text-text-muted mb-8 leading-elegant">
            Pour finaliser votre commande, veuillez vous connecter a votre compte
            ou creer un nouveau compte.
          </p>

          <div className="space-y-3">
            {/* Login Button */}
            <button
              onClick={onLogin}
              className={cn(
                'w-full',
                'flex items-center justify-center',
                'px-6 py-3.5',
                'bg-luxe-charcoal text-text-inverse',
                'font-sans text-body-sm uppercase tracking-luxe font-medium',
                'transition-all duration-350 ease-luxe',
                'hover:bg-hermes-500',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
              )}
            >
              Se connecter
            </button>

            {/* Register Link */}
            <Link
              href="/auth/inscription?callbackUrl=/checkout"
              className={cn(
                'block w-full',
                'px-6 py-3.5',
                'border border-border-medium',
                'font-sans text-body-sm uppercase tracking-luxe font-medium text-text-primary',
                'transition-all duration-350 ease-luxe',
                'hover:border-hermes-500 hover:text-hermes-500',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
              )}
            >
              Creer un compte
            </Link>

            {/* Continue as Guest */}
            <button
              onClick={onClose}
              className={cn(
                'block w-full pt-4',
                'font-sans text-caption text-text-muted',
                'transition-colors duration-250',
                'hover:text-text-primary',
                'focus:outline-none'
              )}
            >
              Continuer sans compte
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
