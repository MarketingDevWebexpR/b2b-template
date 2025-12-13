/**
 * useStripePayment Hook
 * Manages Stripe payment integration for React Native / Expo
 *
 * Features:
 * - Stripe PaymentSheet initialization
 * - Payment intent creation and confirmation
 * - Apple Pay and Google Pay support
 * - Comprehensive error handling
 * - Loading and success states
 * - Haptic feedback integration
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  initPaymentSheet,
  presentPaymentSheet,
  confirmPaymentSheetPayment,
  PaymentSheetError,
  PaymentSheet,
  StripeError,
} from '@stripe/stripe-react-native';
import { hapticFeedback } from '../constants/haptics';
import type { PaymentMethod, ShippingAddress, OrderTotals } from '@bijoux/types';

// ============================================
// Types & Interfaces
// ============================================

/** Stripe payment status */
export type StripePaymentStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

/** Stripe error types for better error handling */
export type StripeErrorCode =
  | 'initialization_failed'
  | 'payment_cancelled'
  | 'card_declined'
  | 'network_error'
  | 'invalid_card'
  | 'expired_card'
  | 'insufficient_funds'
  | 'processing_error'
  | 'unknown_error';

/** Structured Stripe error */
export interface StripePaymentError {
  code: StripeErrorCode;
  message: string;
  localizedMessage: string;
  declineCode?: string;
  stripeError?: StripeError<PaymentSheetError>;
}

/** Payment intent response from backend */
export interface PaymentIntentResponse {
  paymentIntent: string;
  ephemeralKey: string;
  customerId: string;
  publishableKey: string;
}

/** Customer info for Stripe */
export interface StripeCustomerInfo {
  email: string;
  name: string;
  phone?: string;
}

/** Payment result after successful payment */
export interface PaymentResult {
  paymentIntentId: string;
  status: 'succeeded';
  paymentMethod: PaymentMethod;
}

/** Hook options */
export interface UseStripePaymentOptions {
  /** Merchant display name for Apple Pay */
  merchantDisplayName?: string;
  /** Callback when payment succeeds */
  onPaymentSuccess?: (result: PaymentResult) => void;
  /** Callback when payment fails */
  onPaymentError?: (error: StripePaymentError) => void;
  /** Default payment method (for UX, not actual payment) */
  defaultPaymentMethod?: PaymentMethod;
}

/** Hook return type */
export interface UseStripePaymentReturn {
  // State
  status: StripePaymentStatus;
  isLoading: boolean;
  isReady: boolean;
  isProcessing: boolean;
  error: StripePaymentError | null;

  // Methods
  initializePayment: (params: InitializePaymentParams) => Promise<boolean>;
  confirmPayment: () => Promise<PaymentResult | null>;
  reset: () => void;
  clearError: () => void;

  // Payment method info
  selectedPaymentMethod: PaymentMethod | null;
}

/** Parameters for initializing payment */
export interface InitializePaymentParams {
  /** Total amount in cents */
  amountInCents: number;
  /** Currency code (e.g., 'eur') */
  currency?: string;
  /** Customer information */
  customer: StripeCustomerInfo;
  /** Shipping address for fraud prevention */
  shippingAddress?: ShippingAddress;
  /** Order metadata */
  metadata?: Record<string, string>;
}

// ============================================
// Constants
// ============================================

/** API endpoint for creating payment intent */
const PAYMENT_INTENT_ENDPOINT = process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL}/api/payments/create-intent`
  : 'https://api.bijoux-luxe.fr/api/payments/create-intent';

/** Default merchant name */
const DEFAULT_MERCHANT_NAME = 'Bijoux Luxe';

// ============================================
// Error Mapping
// ============================================

function mapStripeErrorToCode(error: StripeError<PaymentSheetError>): StripeErrorCode {
  const errorCode = error.code;

  switch (errorCode) {
    case PaymentSheetError.Canceled:
      return 'payment_cancelled';
    case PaymentSheetError.Failed:
      // Check for specific failure reasons
      if (error.message?.includes('declined')) {
        return 'card_declined';
      }
      if (error.message?.includes('network') || error.message?.includes('connection')) {
        return 'network_error';
      }
      if (error.message?.includes('invalid')) {
        return 'invalid_card';
      }
      if (error.message?.includes('expired')) {
        return 'expired_card';
      }
      if (error.message?.includes('insufficient')) {
        return 'insufficient_funds';
      }
      return 'processing_error';
    case PaymentSheetError.Timeout:
      return 'processing_error';
    default:
      return 'unknown_error';
  }
}

function getLocalizedErrorMessage(code: StripeErrorCode): string {
  const messages: Record<StripeErrorCode, string> = {
    initialization_failed: 'Impossible d\'initialiser le paiement. Veuillez réessayer.',
    payment_cancelled: 'Paiement annulé.',
    card_declined: 'Votre carte a été refusée. Veuillez utiliser une autre carte.',
    network_error: 'Erreur de connexion. Vérifiez votre connexion internet.',
    invalid_card: 'Les informations de carte sont invalides.',
    expired_card: 'Votre carte est expirée. Veuillez utiliser une autre carte.',
    insufficient_funds: 'Fonds insuffisants. Veuillez utiliser une autre carte.',
    processing_error: 'Erreur lors du traitement du paiement. Veuillez réessayer.',
    unknown_error: 'Une erreur est survenue. Veuillez réessayer.',
  };

  return messages[code] ?? messages.unknown_error;
}

function createStripeError(
  code: StripeErrorCode,
  originalError?: StripeError<PaymentSheetError>
): StripePaymentError {
  return {
    code,
    message: originalError?.message ?? getLocalizedErrorMessage(code),
    localizedMessage: getLocalizedErrorMessage(code),
    stripeError: originalError,
  };
}

// ============================================
// Hook Implementation
// ============================================

export function useStripePayment(options: UseStripePaymentOptions = {}): UseStripePaymentReturn {
  const {
    merchantDisplayName = DEFAULT_MERCHANT_NAME,
    onPaymentSuccess,
    onPaymentError,
    defaultPaymentMethod = 'card',
  } = options;

  // State
  const [status, setStatus] = useState<StripePaymentStatus>('idle');
  const [error, setError] = useState<StripePaymentError | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(
    defaultPaymentMethod
  );

  // Refs for tracking current payment
  const paymentIntentIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      paymentIntentIdRef.current = null;
      isInitializedRef.current = false;
    };
  }, []);

  // ============================================
  // Computed Values
  // ============================================

  const isLoading = status === 'initializing' || status === 'processing';
  const isReady = status === 'ready';
  const isProcessing = status === 'processing';

  // ============================================
  // API Methods
  // ============================================

  /**
   * Fetches a payment intent from the backend
   */
  const fetchPaymentIntent = useCallback(
    async (params: InitializePaymentParams): Promise<PaymentIntentResponse | null> => {
      try {
        const response = await fetch(PAYMENT_INTENT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: params.amountInCents,
            currency: params.currency ?? 'eur',
            customer: {
              email: params.customer.email,
              name: params.customer.name,
              phone: params.customer.phone,
            },
            shipping: params.shippingAddress
              ? {
                  name: `${params.shippingAddress.firstName} ${params.shippingAddress.lastName}`,
                  address: {
                    line1: params.shippingAddress.address,
                    line2: params.shippingAddress.addressLine2,
                    city: params.shippingAddress.city,
                    postal_code: params.shippingAddress.postalCode,
                    country: params.shippingAddress.country,
                  },
                  phone: params.shippingAddress.phone,
                }
              : undefined,
            metadata: params.metadata,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create payment intent');
        }

        const data: PaymentIntentResponse = await response.json();
        return data;
      } catch (err) {
        console.error('[useStripePayment] fetchPaymentIntent error:', err);
        return null;
      }
    },
    []
  );

  // ============================================
  // Payment Methods
  // ============================================

  /**
   * Initializes the Stripe PaymentSheet
   */
  const initializePayment = useCallback(
    async (params: InitializePaymentParams): Promise<boolean> => {
      setStatus('initializing');
      setError(null);
      hapticFeedback.softConfirm();

      try {
        // Fetch payment intent from backend
        const intentData = await fetchPaymentIntent(params);

        if (!intentData) {
          throw new Error('Failed to create payment intent');
        }

        paymentIntentIdRef.current = intentData.paymentIntent;

        // Initialize PaymentSheet
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: intentData.paymentIntent,
          customerEphemeralKeySecret: intentData.ephemeralKey,
          customerId: intentData.customerId,
          merchantDisplayName,
          // Apple Pay configuration
          applePay: {
            merchantCountryCode: 'FR',
          },
          // Google Pay configuration
          googlePay: {
            merchantCountryCode: 'FR',
            testEnv: __DEV__,
          },
          // Styling
          appearance: {
            colors: {
              primary: '#1A1A1A', // Luxury black
              background: '#FFFFFF',
              componentBackground: '#F8F8F8',
              componentBorder: '#E5E5E5',
              componentDivider: '#E5E5E5',
              primaryText: '#1A1A1A',
              secondaryText: '#6B7280',
              componentText: '#1A1A1A',
              placeholderText: '#9CA3AF',
              icon: '#1A1A1A',
              error: '#DC2626',
            },
            shapes: {
              borderRadius: 8,
              borderWidth: 1,
            },
            primaryButton: {
              colors: {
                background: '#1A1A1A',
                text: '#FFFFFF',
                border: '#1A1A1A',
              },
              shapes: {
                borderRadius: 8,
              },
            },
          },
          // Billing details collection
          billingDetailsCollectionConfiguration: {
            name: PaymentSheet.CollectionMode.ALWAYS,
            email: PaymentSheet.CollectionMode.ALWAYS,
            phone: PaymentSheet.CollectionMode.AUTOMATIC,
            address: PaymentSheet.AddressCollectionMode.AUTOMATIC,
          },
          // Allow delayed payment methods (SEPA, etc.)
          allowsDelayedPaymentMethods: false,
          // Return URL for web-based payment methods
          returnURL: 'bijoux-luxe://stripe-redirect',
        });

        if (initError) {
          console.error('[useStripePayment] initPaymentSheet error:', initError);
          const stripeError = createStripeError('initialization_failed', initError);
          setError(stripeError);
          setStatus('failed');
          hapticFeedback.error();
          onPaymentError?.(stripeError);
          return false;
        }

        isInitializedRef.current = true;
        setStatus('ready');
        hapticFeedback.softConfirm();
        return true;
      } catch (err) {
        console.error('[useStripePayment] initializePayment error:', err);
        const stripeError = createStripeError('initialization_failed');
        setError(stripeError);
        setStatus('failed');
        hapticFeedback.error();
        onPaymentError?.(stripeError);
        return false;
      }
    },
    [fetchPaymentIntent, merchantDisplayName, onPaymentError]
  );

  /**
   * Presents the PaymentSheet and confirms payment
   */
  const confirmPayment = useCallback(async (): Promise<PaymentResult | null> => {
    if (!isInitializedRef.current) {
      console.error('[useStripePayment] Payment not initialized');
      const stripeError = createStripeError('initialization_failed');
      setError(stripeError);
      hapticFeedback.error();
      return null;
    }

    setStatus('processing');
    setError(null);
    hapticFeedback.addToCartPress();

    try {
      // Present the PaymentSheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('[useStripePayment] presentPaymentSheet error:', presentError);

        const errorCode = mapStripeErrorToCode(presentError);

        // Handle cancellation separately (not an error per se)
        if (errorCode === 'payment_cancelled') {
          setStatus('cancelled');
          hapticFeedback.quantityChange();

          const stripeError = createStripeError('payment_cancelled', presentError);
          setError(stripeError);
          return null;
        }

        const stripeError = createStripeError(errorCode, presentError);
        setError(stripeError);
        setStatus('failed');
        hapticFeedback.error();
        onPaymentError?.(stripeError);
        return null;
      }

      // Payment succeeded
      setStatus('succeeded');
      hapticFeedback.addToCartSuccess();

      const result: PaymentResult = {
        paymentIntentId: paymentIntentIdRef.current ?? '',
        status: 'succeeded',
        paymentMethod: selectedPaymentMethod ?? 'card',
      };

      onPaymentSuccess?.(result);
      return result;
    } catch (err) {
      console.error('[useStripePayment] confirmPayment error:', err);
      const stripeError = createStripeError('processing_error');
      setError(stripeError);
      setStatus('failed');
      hapticFeedback.error();
      onPaymentError?.(stripeError);
      return null;
    }
  }, [selectedPaymentMethod, onPaymentSuccess, onPaymentError]);

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Resets the payment state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setSelectedPaymentMethod(defaultPaymentMethod);
    paymentIntentIdRef.current = null;
    isInitializedRef.current = false;
    hapticFeedback.softConfirm();
  }, [defaultPaymentMethod]);

  /**
   * Clears the current error
   */
  const clearError = useCallback(() => {
    setError(null);

    // If we were in failed state, go back to ready if initialized
    if (status === 'failed' && isInitializedRef.current) {
      setStatus('ready');
    } else if (status === 'failed' || status === 'cancelled') {
      setStatus('idle');
    }
  }, [status]);

  // ============================================
  // Return Value
  // ============================================

  return {
    // State
    status,
    isLoading,
    isReady,
    isProcessing,
    error,

    // Methods
    initializePayment,
    confirmPayment,
    reset,
    clearError,

    // Payment method info
    selectedPaymentMethod,
  };
}

// ============================================
// Utility Exports
// ============================================

/**
 * Formats an amount in cents to a display string
 */
export function formatAmountForStripe(amountInEuros: number): number {
  return Math.round(amountInEuros * 100);
}

/**
 * Converts OrderTotals to Stripe amount in cents
 */
export function orderTotalsToStripeAmount(totals: OrderTotals): number {
  return formatAmountForStripe(totals.total);
}

export {
  PAYMENT_INTENT_ENDPOINT,
  DEFAULT_MERCHANT_NAME,
  getLocalizedErrorMessage,
  mapStripeErrorToCode,
};
