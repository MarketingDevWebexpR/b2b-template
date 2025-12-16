'use client';

/**
 * Checkout Context - B2B Multi-step Checkout
 *
 * Manages checkout state across shipping and payment steps:
 * - Delivery/pickup selection
 * - Address management
 * - Shipping method
 * - Payment method
 * - Order reference
 *
 * @packageDocumentation
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { CompanyAddress } from '@/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Delivery mode options
 */
export type DeliveryMode = 'shipping' | 'pickup';

/**
 * Shipping method options
 */
export type ShippingMethod = 'standard' | 'express';

/**
 * B2B Payment method options
 */
export type B2BPaymentMethod =
  | 'card'           // Carte bancaire
  | 'bank_transfer'  // Virement bancaire
  | 'company_credit' // Credit entreprise
  | 'deferred';      // Paiement differe

/**
 * Pickup point configuration
 */
export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  openingHours?: string;
  distance?: number;
}

/**
 * Shipping address for checkout
 */
export interface CheckoutAddress {
  id?: string;
  label?: string;
  companyName: string;
  attention?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  deliveryInstructions?: string;
}

/**
 * Shipping data for checkout
 */
export interface ShippingData {
  deliveryMode: DeliveryMode;
  /** Selected address for delivery */
  shippingAddress?: CheckoutAddress;
  /** Selected pickup point ID */
  pickupPointId?: string;
  /** Selected pickup point details */
  pickupPoint?: PickupPoint;
  /** Shipping method */
  shippingMethod: ShippingMethod;
  /** Delivery notes */
  deliveryNotes?: string;
}

/**
 * Payment data for checkout
 */
export interface PaymentData {
  paymentMethod: B2BPaymentMethod;
  /** Purchase order / reference number */
  purchaseOrderNumber?: string;
  /** Additional notes for the order */
  orderNotes?: string;
  /** Accept general terms */
  acceptTerms: boolean;
  /** Accept specific B2B conditions */
  acceptB2BConditions: boolean;
}

/**
 * Complete checkout state
 */
export interface CheckoutState {
  // Shipping step
  shipping: ShippingData | null;
  // Payment step
  payment: PaymentData | null;
  // Validation
  isShippingComplete: boolean;
  isPaymentComplete: boolean;
  // Errors
  errors: Record<string, string>;
}

/**
 * Checkout Context Type
 */
export interface CheckoutContextType {
  // State
  state: CheckoutState;

  // Shipping actions
  setDeliveryMode: (mode: DeliveryMode) => void;
  setShippingAddress: (address: CheckoutAddress) => void;
  setPickupPoint: (point: PickupPoint) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setDeliveryNotes: (notes: string) => void;
  validateShipping: () => boolean;

  // Payment actions
  setPaymentMethod: (method: B2BPaymentMethod) => void;
  setPurchaseOrderNumber: (ref: string) => void;
  setOrderNotes: (notes: string) => void;
  setAcceptTerms: (accept: boolean) => void;
  setAcceptB2BConditions: (accept: boolean) => void;
  validatePayment: () => boolean;

  // General actions
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  resetCheckout: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: CheckoutState = {
  shipping: null,
  payment: null,
  isShippingComplete: false,
  isPaymentComplete: false,
  errors: {},
};

// ============================================================================
// Context
// ============================================================================

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export interface CheckoutProviderProps {
  children: ReactNode;
  /** Initial shipping data (e.g., from saved address) */
  initialShipping?: Partial<ShippingData>;
  /** Initial payment data */
  initialPayment?: Partial<PaymentData>;
}

export function CheckoutProvider({
  children,
  initialShipping,
  initialPayment,
}: CheckoutProviderProps) {
  const [state, setState] = useState<CheckoutState>(() => ({
    ...initialState,
    shipping: initialShipping ? {
      deliveryMode: 'shipping',
      shippingMethod: 'standard',
      ...initialShipping,
    } : null,
    payment: initialPayment ? {
      paymentMethod: 'card',
      acceptTerms: false,
      acceptB2BConditions: false,
      ...initialPayment,
    } : null,
  }));

  // ========== Shipping Actions ==========

  const setDeliveryMode = useCallback((mode: DeliveryMode) => {
    setState((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        deliveryMode: mode,
        shippingMethod: prev.shipping?.shippingMethod || 'standard',
        // Clear pickup if switching to shipping
        ...(mode === 'shipping' ? { pickupPointId: undefined, pickupPoint: undefined } : {}),
        // Clear address if switching to pickup
        ...(mode === 'pickup' ? { shippingAddress: undefined } : {}),
      },
      isShippingComplete: false,
    }));
  }, []);

  const setShippingAddress = useCallback((address: CheckoutAddress) => {
    setState((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        deliveryMode: 'shipping',
        shippingAddress: address,
        shippingMethod: prev.shipping?.shippingMethod || 'standard',
      },
      errors: { ...prev.errors, shippingAddress: '' },
    }));
  }, []);

  const setPickupPoint = useCallback((point: PickupPoint) => {
    setState((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        deliveryMode: 'pickup',
        pickupPointId: point.id,
        pickupPoint: point,
        shippingMethod: prev.shipping?.shippingMethod || 'standard',
      },
      errors: { ...prev.errors, pickupPoint: '' },
    }));
  }, []);

  const setShippingMethod = useCallback((method: ShippingMethod) => {
    setState((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        deliveryMode: prev.shipping?.deliveryMode || 'shipping',
        shippingMethod: method,
      },
    }));
  }, []);

  const setDeliveryNotes = useCallback((notes: string) => {
    setState((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        deliveryMode: prev.shipping?.deliveryMode || 'shipping',
        shippingMethod: prev.shipping?.shippingMethod || 'standard',
        deliveryNotes: notes,
      },
    }));
  }, []);

  const validateShipping = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const { shipping } = state;

    if (!shipping) {
      errors.shipping = 'Veuillez selectionner un mode de livraison';
    } else if (shipping.deliveryMode === 'shipping' && !shipping.shippingAddress) {
      errors.shippingAddress = 'Veuillez selectionner une adresse de livraison';
    } else if (shipping.deliveryMode === 'pickup' && !shipping.pickupPointId) {
      errors.pickupPoint = 'Veuillez selectionner un point de retrait';
    }

    const isValid = Object.keys(errors).length === 0;

    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isShippingComplete: isValid,
    }));

    return isValid;
  }, [state]);

  // ========== Payment Actions ==========

  const setPaymentMethod = useCallback((method: B2BPaymentMethod) => {
    setState((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        paymentMethod: method,
        acceptTerms: prev.payment?.acceptTerms || false,
        acceptB2BConditions: prev.payment?.acceptB2BConditions || false,
      },
    }));
  }, []);

  const setPurchaseOrderNumber = useCallback((ref: string) => {
    setState((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        paymentMethod: prev.payment?.paymentMethod || 'card',
        purchaseOrderNumber: ref,
        acceptTerms: prev.payment?.acceptTerms || false,
        acceptB2BConditions: prev.payment?.acceptB2BConditions || false,
      },
    }));
  }, []);

  const setOrderNotes = useCallback((notes: string) => {
    setState((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        paymentMethod: prev.payment?.paymentMethod || 'card',
        orderNotes: notes,
        acceptTerms: prev.payment?.acceptTerms || false,
        acceptB2BConditions: prev.payment?.acceptB2BConditions || false,
      },
    }));
  }, []);

  const setAcceptTerms = useCallback((accept: boolean) => {
    setState((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        paymentMethod: prev.payment?.paymentMethod || 'card',
        acceptTerms: accept,
        acceptB2BConditions: prev.payment?.acceptB2BConditions || false,
      },
      errors: { ...prev.errors, acceptTerms: '' },
    }));
  }, []);

  const setAcceptB2BConditions = useCallback((accept: boolean) => {
    setState((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        paymentMethod: prev.payment?.paymentMethod || 'card',
        acceptTerms: prev.payment?.acceptTerms || false,
        acceptB2BConditions: accept,
      },
      errors: { ...prev.errors, acceptB2BConditions: '' },
    }));
  }, []);

  const validatePayment = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const { payment } = state;

    if (!payment) {
      errors.payment = 'Veuillez selectionner un mode de paiement';
    } else {
      if (!payment.acceptTerms) {
        errors.acceptTerms = 'Vous devez accepter les conditions generales de vente';
      }
      if (!payment.acceptB2BConditions) {
        errors.acceptB2BConditions = 'Vous devez accepter les conditions B2B';
      }
    }

    const isValid = Object.keys(errors).length === 0;

    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isPaymentComplete: isValid,
    }));

    return isValid;
  }, [state]);

  // ========== General Actions ==========

  const setError = useCallback((field: string, message: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: message },
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setState((prev) => {
      const { [field]: _, ...rest } = prev.errors;
      return { ...prev, errors: rest };
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: {} }));
  }, []);

  const resetCheckout = useCallback(() => {
    setState(initialState);
  }, []);

  // ========== Context Value ==========

  const contextValue = useMemo<CheckoutContextType>(
    () => ({
      state,
      // Shipping
      setDeliveryMode,
      setShippingAddress,
      setPickupPoint,
      setShippingMethod,
      setDeliveryNotes,
      validateShipping,
      // Payment
      setPaymentMethod,
      setPurchaseOrderNumber,
      setOrderNotes,
      setAcceptTerms,
      setAcceptB2BConditions,
      validatePayment,
      // General
      setError,
      clearError,
      clearAllErrors,
      resetCheckout,
    }),
    [
      state,
      setDeliveryMode,
      setShippingAddress,
      setPickupPoint,
      setShippingMethod,
      setDeliveryNotes,
      validateShipping,
      setPaymentMethod,
      setPurchaseOrderNumber,
      setOrderNotes,
      setAcceptTerms,
      setAcceptB2BConditions,
      validatePayment,
      setError,
      clearError,
      clearAllErrors,
      resetCheckout,
    ]
  );

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access checkout context
 * @throws Error if used outside of CheckoutProvider
 */
export function useCheckout(): CheckoutContextType {
  const context = useContext(CheckoutContext);

  if (context === undefined) {
    throw new Error('useCheckout doit etre utilise dans un CheckoutProvider');
  }

  return context;
}

/**
 * Hook for shipping step data
 */
export function useCheckoutShipping() {
  const {
    state,
    setDeliveryMode,
    setShippingAddress,
    setPickupPoint,
    setShippingMethod,
    setDeliveryNotes,
    validateShipping,
  } = useCheckout();

  return {
    shipping: state.shipping,
    errors: state.errors,
    isComplete: state.isShippingComplete,
    setDeliveryMode,
    setShippingAddress,
    setPickupPoint,
    setShippingMethod,
    setDeliveryNotes,
    validate: validateShipping,
  };
}

/**
 * Hook for payment step data
 */
export function useCheckoutPayment() {
  const {
    state,
    setPaymentMethod,
    setPurchaseOrderNumber,
    setOrderNotes,
    setAcceptTerms,
    setAcceptB2BConditions,
    validatePayment,
  } = useCheckout();

  return {
    payment: state.payment,
    shipping: state.shipping,
    errors: state.errors,
    isComplete: state.isPaymentComplete,
    setPaymentMethod,
    setPurchaseOrderNumber,
    setOrderNotes,
    setAcceptTerms,
    setAcceptB2BConditions,
    validate: validatePayment,
  };
}
