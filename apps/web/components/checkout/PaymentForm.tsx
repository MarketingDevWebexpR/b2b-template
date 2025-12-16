'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Clock, CreditCard, Lock, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getStripe } from '@/lib/stripe';
import { StripePaymentForm } from './StripePaymentForm';

/**
 * Payment method type
 */
type PaymentMethod = 'deferred' | 'immediate';

/**
 * Payment form data type (simplified for deferred payments)
 */
export interface PaymentFormData {
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
}

/**
 * PaymentForm Props
 */
interface PaymentFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: PaymentFormData) => void;
  /** Callback to go back to previous step */
  onBack: () => void;
  /** Whether form submission is in progress */
  isLoading?: boolean;
  /** Total amount in EUR (for Stripe) */
  totalAmount?: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * PaymentForm Component
 * Payment method selection with Stripe integration
 * B2B professional neutral aesthetic
 */
export function PaymentForm({
  onSubmit,
  onBack,
  isLoading = false,
  totalAmount = 0,
  className,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('immediate');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);

  // Create PaymentIntent when immediate payment is selected
  useEffect(() => {
    if (paymentMethod === 'immediate' && totalAmount > 0) {
      setIsLoadingStripe(true);
      setStripeError(null);

      fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'eur',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setStripeError(data.error);
          } else {
            setClientSecret(data.clientSecret);
          }
        })
        .catch((err) => {
          console.error('Error creating payment intent:', err);
          setStripeError('Erreur lors de la connexion au service de paiement');
        })
        .finally(() => {
          setIsLoadingStripe(false);
        });
    }
  }, [paymentMethod, totalAmount]);

  /**
   * Handle deferred payment submission
   */
  const handleDeferredSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ paymentMethod: 'deferred' });
  };

  /**
   * Handle Stripe payment success
   */
  const handleStripeSuccess = () => {
    onSubmit({ paymentMethod: 'immediate' });
  };

  /**
   * Handle Stripe payment error
   */
  const handleStripeError = (error: string) => {
    setStripeError(error);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section title */}
      <div className="mb-8">
        <h2 className="font-sans font-semibold text-xl md:text-2xl text-neutral-900 mb-2">
          Mode de paiement
        </h2>
        <p className="text-sm text-neutral-500">
          Choisissez votre methode de paiement preferee.
        </p>
      </div>

      {/* Payment method selection */}
      <div className="space-y-3">
        {/* Deferred payment option */}
        <button
          type="button"
          onClick={() => setPaymentMethod('deferred')}
          disabled={isLoading}
          className={cn(
            'w-full p-5 text-left rounded-lg',
            'border transition-all duration-200',
            'flex items-start gap-4',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            paymentMethod === 'deferred'
              ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
              : 'border-neutral-200 bg-white hover:border-accent/50'
          )}
        >
          {/* Selection indicator */}
          <div
            className={cn(
              'flex-shrink-0 w-5 h-5 mt-0.5',
              'rounded-full border-2',
              'flex items-center justify-center',
              'transition-colors duration-200',
              paymentMethod === 'deferred'
                ? 'border-accent bg-accent'
                : 'border-neutral-300 bg-white'
            )}
          >
            {paymentMethod === 'deferred' && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </div>

          {/* Option content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-accent" />
              <span className="font-medium text-neutral-900 text-lg">
                Paiement a 30 jours
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              Recevez votre commande maintenant et payez dans 30 jours.
              Aucun frais supplementaire.
            </p>
          </div>
        </button>

        {/* Immediate payment option */}
        <button
          type="button"
          onClick={() => setPaymentMethod('immediate')}
          disabled={isLoading}
          className={cn(
            'w-full p-5 text-left rounded-lg',
            'border transition-all duration-200',
            'flex items-start gap-4',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            paymentMethod === 'immediate'
              ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
              : 'border-neutral-200 bg-white hover:border-accent/50'
          )}
        >
          {/* Selection indicator */}
          <div
            className={cn(
              'flex-shrink-0 w-5 h-5 mt-0.5',
              'rounded-full border-2',
              'flex items-center justify-center',
              'transition-colors duration-200',
              paymentMethod === 'immediate'
                ? 'border-accent bg-accent'
                : 'border-neutral-300 bg-white'
            )}
          >
            {paymentMethod === 'immediate' && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </div>

          {/* Option content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-accent" />
              <span className="font-medium text-neutral-900 text-lg">
                Paiement comptant
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              Payez immediatement par carte bancaire via notre plateforme securisee Stripe.
            </p>
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-200" />

      {/* Payment form based on selection */}
      {paymentMethod === 'deferred' ? (
        /* Deferred payment confirmation */
        <form onSubmit={handleDeferredSubmit} className="space-y-6">
          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 mb-2">
                  Paiement differe a 30 jours
                </h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Votre commande est expediee immediatement
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Vous recevez une facture par email
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Reglez sous 30 jours sans frais
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 uppercase tracking-wider"
            >
              Retour
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="flex-1 uppercase tracking-wider bg-accent text-white border border-accent hover:bg-accent/90 transition-all duration-200"
            >
              Confirmer la commande
            </Button>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-2">
            <Lock className="h-4 w-4" />
            <span>Commande securisee</span>
          </div>
        </form>
      ) : (
        /* Immediate payment with Stripe */
        <div className="space-y-6">
          {stripeError && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {stripeError}
            </div>
          )}

          {isLoadingStripe ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-neutral-500">
                  Chargement du formulaire de paiement...
                </p>
              </div>
            </div>
          ) : clientSecret ? (
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#f67828',
                    colorBackground: '#ffffff',
                    colorText: '#171717',
                    colorDanger: '#dc2626',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <StripePaymentForm
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
                isSubmitting={isLoading}
              />
            </Elements>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p>Impossible de charger le formulaire de paiement.</p>
              <button
                type="button"
                onClick={() => setPaymentMethod('immediate')}
                className="mt-2 text-accent underline hover:text-accent/80"
              >
                Reessayer
              </button>
            </div>
          )}

          {/* Back button for Stripe form */}
          <div className="pt-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onBack}
              disabled={isLoading || isLoadingStripe}
              className="w-full uppercase tracking-wider"
            >
              Retour
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentForm;
