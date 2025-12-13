'use client';

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface StripePaymentFormProps {
  /** Callback when payment is successful */
  onSuccess: () => void;
  /** Callback when payment fails */
  onError: (error: string) => void;
  /** Whether parent form is submitting */
  isSubmitting?: boolean;
}

/**
 * StripePaymentForm - Stripe Elements payment form
 * Handles card input and payment confirmation
 */
export function StripePaymentForm({
  onSuccess,
  onError,
  isSubmitting = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check for payment intent status in URL (redirect flow)
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Paiement reussi !');
          onSuccess();
          break;
        case 'processing':
          setMessage('Votre paiement est en cours de traitement.');
          break;
        case 'requires_payment_method':
          setMessage('Votre paiement a echoue. Veuillez reessayer.');
          break;
        default:
          setMessage('Une erreur est survenue.');
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation`,
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'Une erreur est survenue');
        onError(error.message || 'Une erreur est survenue');
      } else {
        setMessage('Une erreur inattendue est survenue.');
        onError('Une erreur inattendue est survenue.');
      }
      setIsLoading(false);
    } else {
      // Payment succeeded without redirect
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        id="payment-element"
        options={{
          layout: 'tabs',
        }}
      />

      {message && (
        <div
          className={cn(
            'flex items-center gap-2 p-3 text-sm rounded',
            message.includes('reussi')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          )}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {message}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading || !stripe || !elements || isSubmitting}
        isLoading={isLoading}
        className="w-full uppercase tracking-wider bg-luxe-charcoal !text-white border border-luxe-charcoal hover:bg-hermes-500 hover:border-hermes-500 transition-all duration-300"
      >
        {isLoading ? 'Traitement...' : 'Payer maintenant'}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-2">
        <Lock className="h-4 w-4" />
        <span>Paiement securise par Stripe</span>
      </div>
    </form>
  );
}

export default StripePaymentForm;
