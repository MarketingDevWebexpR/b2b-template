/**
 * useCheckout Hook
 * Manages the checkout flow state for the luxury jewelry e-commerce app
 *
 * MIGRATION NOTE: This hook now wraps useCheckoutContext for backward compatibility.
 * New code should import { useCheckoutContext } from '../context/CheckoutContext' directly.
 *
 * Features:
 * - Step-by-step checkout navigation
 * - Shipping and billing address management
 * - Payment method selection
 * - Form validation
 * - Order totals calculation
 * - Temporary state persistence with AsyncStorage
 * - Haptic feedback integration
 */

import { useCheckoutContext } from '../context/CheckoutContext';
import type {
  ShippingAddress as BaseShippingAddress,
  BillingAddress,
  PaymentMethod,
} from '@bijoux/types';

// Re-export types for backward compatibility
export type {
  ShippingMethod,
  ShippingOptionData,
  ValidationErrors,
  OrderTotals,
} from '../context/CheckoutContext';

export {
  SHIPPING_METHODS,
  CHECKOUT_STEPS,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from '../context/CheckoutContext';

/**
 * Extended ShippingAddress that supports both formats
 * (from @bijoux/types and from ShippingForm component)
 */
export interface ShippingAddress extends BaseShippingAddress {
  // Additional fields from ShippingForm component
  address1?: string;
  address2?: string;
}

// ============================================
// Hook Implementation - Wrapper for CheckoutContext
// ============================================

/**
 * useCheckout Hook
 *
 * @deprecated Use useCheckoutContext from '../context/CheckoutContext' directly.
 * This hook is maintained for backward compatibility only.
 */
export function useCheckout() {
  const context = useCheckoutContext();

  // Return the same interface for backward compatibility
  return {
    // State
    state: context.state,
    isLoading: context.isLoading,
    validationErrors: context.state.validationErrors,
    orderTotals: context.orderTotals,
    selectedShippingMethod: context.selectedShippingMethod,
    availableShippingMethods: context.availableShippingMethods,

    // Direct access to shipping data (for checkout screens)
    shippingAddress: context.state.shippingAddress as ShippingAddress | null,
    shippingOption: context.state.shippingOptionData,

    // Navigation
    currentStep: context.state.currentStep,
    completedSteps: context.state.completedSteps,
    canProceed: context.canProceed,
    nextStep: context.nextStep,
    prevStep: context.prevStep,
    goToStep: context.goToStep,

    // Shipping
    setShippingAddress: context.setShippingAddress,
    validateShippingAddress: context.validateShippingAddress,
    setShippingMethod: context.setShippingMethod,
    setShippingOption: context.setShippingOption,

    // Billing
    setBillingAddress: context.setBillingAddress,
    setSameAsShipping: context.setSameAsShipping,
    validateBillingAddress: context.validateBillingAddress,

    // Payment
    setPaymentMethod: context.setPaymentMethod,

    // Order
    setOrderNotes: context.setOrderNotes,

    // Actions
    reset: context.reset,
    resetCheckout: context.reset,
    clearError: context.clearError,
    setError: context.setError,
    setProcessing: context.setProcessing,
  };
}
