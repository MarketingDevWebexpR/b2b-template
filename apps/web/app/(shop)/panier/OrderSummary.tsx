'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
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
      // Redirect to login with callback to checkout
      router.push('/login?callbackUrl=/checkout');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'sticky top-32',
          'bg-surface-secondary',
          'p-6 md:p-8',
          'border border-stroke-light'
        )}
      >
        {/* Header */}
        <h2 className="font-sans text-heading-4 text-content-primary mb-6">
          Recapitulatif
        </h2>

        {/* Order Lines */}
        <div className="space-y-4 pb-6 border-b border-stroke-light">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-body text-content-secondary">
              Sous-total ({itemCount} {itemCount > 1 ? 'articles' : 'article'})
            </span>
            <span className="font-sans text-body font-medium text-content-primary">
              {formatPrice(subtotal)}
            </span>
          </div>

          {/* Shipping */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-body text-content-secondary">
              Livraison estimee
            </span>
            <span className="font-sans text-body font-medium text-content-primary">
              {shippingEstimate === 0 ? (
                <span className="text-primary">Offerte</span>
              ) : (
                formatPrice(shippingEstimate)
              )}
            </span>
          </div>

          {/* Free shipping progress */}
          {amountUntilFreeShipping > 0 && (
            <div className="pt-2">
              <p className="font-sans text-caption text-content-muted mb-2">
                Plus que{' '}
                <span className="font-medium text-primary">
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
                  className="h-full bg-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between py-6">
          <span className="font-sans text-heading-4 text-content-primary">
            Total
          </span>
          <span className="font-sans text-heading-3 text-content-primary">
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
            'bg-neutral-900 !text-white',
            'text-sm uppercase tracking-widest font-medium',
            'transition-all duration-300 duration-200',
            'hover:bg-primary',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {status === 'loading'
            ? 'CHARGEMENT...'
            : session
            ? 'PASSER LA COMMANDE'
            : 'SE CONNECTER & COMMANDER'}
        </button>

        {/* Continue Shopping Link */}
        <Link
          href="/categories"
          className={cn(
            'block mt-4 text-center',
            'font-sans text-caption uppercase tracking-wider',
            'text-neutral-500',
            'transition-colors duration-200',
            'hover:text-accent'
          )}
        >
          Continuer mes achats
        </Link>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-stroke-light">
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
      <span className="text-content-muted mb-2">{icon}</span>
      <span className="font-sans text-[10px] md:text-caption uppercase  text-content-muted leading-tight">
        {label}
      </span>
    </div>
  );
}
