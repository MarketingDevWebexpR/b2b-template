/**
 * CheckoutContext
 * Centralized state management for the checkout flow
 *
 * This context provides a single source of truth for checkout state,
 * replacing the pattern of calling useCheckout() in each screen which
 * creates separate instances.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CheckoutState,
  CheckoutStep,
  ShippingAddress as BaseShippingAddress,
  BillingAddress,
  PaymentMethod,
} from '@bijoux/types';
import { useCart } from './CartContext';
import { hapticFeedback } from '../constants/haptics';

// ============================================
// Types
// ============================================

/**
 * Extended ShippingAddress supporting both formats
 */
export interface ShippingAddress extends BaseShippingAddress {
  address1?: string;
  address2?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier: string;
}

export interface ShippingOptionData {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

export interface ValidationErrors {
  [field: string]: string | undefined;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

// ============================================
// Actions
// ============================================

type CheckoutAction =
  | { type: 'SET_STEP'; payload: CheckoutStep }
  | { type: 'COMPLETE_STEP'; payload: CheckoutStep }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_BILLING_ADDRESS'; payload: BillingAddress }
  | { type: 'SET_SAME_AS_SHIPPING'; payload: boolean }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_SHIPPING_METHOD'; payload: string }
  | { type: 'SET_SHIPPING_OPTION'; payload: ShippingOptionData }
  | { type: 'SET_ORDER_NOTES'; payload: string }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationErrors }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: Partial<CheckoutState> };

// ============================================
// Constants
// ============================================

const CHECKOUT_STORAGE_KEY = '@bijoux/checkout_v2';

const CHECKOUT_STEPS: CheckoutStep[] = [
  'cart',
  'shipping',
  'billing',
  'payment',
  'review',
  'confirmation',
];

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'express',
    name: 'Livraison Express',
    description: 'Livraison securisee avec signature',
    price: 0,
    estimatedDays: '1-2 jours ouvres',
    carrier: 'Chronopost',
  },
  {
    id: 'secure',
    name: 'Livraison Premium',
    description: 'Assurance valeur declaree, remise en main propre',
    price: 15,
    estimatedDays: '2-3 jours ouvres',
    carrier: 'Chronopost',
  },
  {
    id: 'boutique',
    name: 'Retrait en Boutique',
    description: 'Retirez votre commande en boutique',
    price: 0,
    estimatedDays: 'Sous 24h',
    carrier: 'Boutique',
  },
];

export const TAX_RATE = 0.20;
export const FREE_SHIPPING_THRESHOLD = 500;

// ============================================
// Initial State
// ============================================

const initialState: CheckoutState = {
  currentStep: 'cart',
  completedSteps: [],
  shippingAddress: null,
  billingAddress: null,
  sameAsShipping: true,
  paymentMethod: null,
  orderNotes: '',
  isProcessing: false,
  error: null,
};

interface ExtendedCheckoutState extends CheckoutState {
  selectedShippingMethodId: string;
  shippingOptionData: ShippingOptionData | null;
  validationErrors: ValidationErrors;
}

const initialExtendedState: ExtendedCheckoutState = {
  ...initialState,
  selectedShippingMethodId: 'express',
  shippingOptionData: null,
  validationErrors: {},
};

// ============================================
// Reducer
// ============================================

function checkoutReducer(
  state: ExtendedCheckoutState,
  action: CheckoutAction
): ExtendedCheckoutState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, error: null };

    case 'COMPLETE_STEP':
      if (state.completedSteps.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
      };

    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload,
        validationErrors: {},
      };

    case 'SET_BILLING_ADDRESS':
      return {
        ...state,
        billingAddress: action.payload,
        validationErrors: {},
      };

    case 'SET_SAME_AS_SHIPPING':
      return {
        ...state,
        sameAsShipping: action.payload,
        billingAddress: action.payload ? null : state.billingAddress,
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload,
        validationErrors: {},
      };

    case 'SET_SHIPPING_METHOD':
      return {
        ...state,
        selectedShippingMethodId: action.payload,
      };

    case 'SET_SHIPPING_OPTION':
      return {
        ...state,
        shippingOptionData: action.payload,
        selectedShippingMethodId: action.payload.id,
      };

    case 'SET_ORDER_NOTES':
      return { ...state, orderNotes: action.payload };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
      };

    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };

    case 'CLEAR_VALIDATION_ERRORS':
      return { ...state, validationErrors: {} };

    case 'RESET':
      return initialExtendedState;

    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
        currentStep:
          action.payload.currentStep === 'confirmation'
            ? 'cart'
            : action.payload.currentStep ?? 'cart',
        isProcessing: false,
        error: null,
      };

    default:
      return state;
  }
}

// ============================================
// Validation Helpers
// ============================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
const POSTAL_CODE_REGEX = /^[0-9]{5}$/;

function validateEmail(email: string): string | undefined {
  if (!email) return 'L\'email est requis';
  if (!EMAIL_REGEX.test(email)) return 'Email invalide';
  return undefined;
}

function validatePhone(phone: string): string | undefined {
  if (!phone) return 'Le telephone est requis';
  const cleanPhone = phone.replace(/\s/g, '');
  if (!PHONE_REGEX.test(cleanPhone)) return 'Numero de telephone invalide';
  return undefined;
}

function validatePostalCode(postalCode: string): string | undefined {
  if (!postalCode) return 'Le code postal est requis';
  if (!POSTAL_CODE_REGEX.test(postalCode)) return 'Code postal invalide (5 chiffres)';
  return undefined;
}

function validateRequired(value: string, fieldName: string): string | undefined {
  if (!value || !value.trim()) return `${fieldName} est requis`;
  return undefined;
}

// ============================================
// Context Types
// ============================================

interface CheckoutContextValue {
  // State
  state: ExtendedCheckoutState;
  isLoading: boolean;
  orderTotals: OrderTotals;
  selectedShippingMethod: ShippingMethod | null;
  availableShippingMethods: ShippingMethod[];
  canProceed: boolean;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: CheckoutStep) => void;

  // Shipping
  setShippingAddress: (address: ShippingAddress) => void;
  validateShippingAddress: () => boolean;
  setShippingMethod: (methodId: string) => void;
  setShippingOption: (option: ShippingOptionData) => void;

  // Billing
  setBillingAddress: (address: BillingAddress) => void;
  setSameAsShipping: (same: boolean) => void;
  validateBillingAddress: () => boolean;

  // Payment
  setPaymentMethod: (method: PaymentMethod) => void;

  // Order
  setOrderNotes: (notes: string) => void;

  // Actions
  reset: () => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
  setProcessing: (processing: boolean) => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { cart } = useCart();
  const [state, dispatch] = useReducer(checkoutReducer, initialExtendedState);
  const [isLoading, setIsLoading] = React.useState(true);
  const isInitialized = useRef(false);

  // ============================================
  // Persistence - Load
  // ============================================

  useEffect(() => {
    const loadCheckoutState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(CHECKOUT_STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      } catch (error) {
        console.error('[CheckoutContext] Error loading state:', error);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };
    loadCheckoutState();
  }, []);

  // ============================================
  // Persistence - Save
  // ============================================

  useEffect(() => {
    if (!isInitialized.current) return;

    const saveCheckoutState = async () => {
      try {
        const stateToSave = {
          ...state,
          isProcessing: false,
          error: null,
          validationErrors: {},
        };
        await AsyncStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('[CheckoutContext] Error saving state:', error);
      }
    };
    saveCheckoutState();
  }, [state]);

  // ============================================
  // Computed Values
  // ============================================

  const selectedShippingMethod = useMemo(() => {
    return SHIPPING_METHODS.find((m) => m.id === state.selectedShippingMethodId) ?? null;
  }, [state.selectedShippingMethodId]);

  const orderTotals = useMemo((): OrderTotals => {
    const subtotal = cart.totalPrice;
    const shippingCost =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (selectedShippingMethod?.price ?? 0);
    const subtotalHT = subtotal / (1 + TAX_RATE);
    const tax = subtotal - subtotalHT;
    const discount = 0;
    const total = subtotal + shippingCost - discount;

    return { subtotal, shipping: shippingCost, tax, discount, total };
  }, [cart.totalPrice, selectedShippingMethod]);

  const canProceed = useMemo((): boolean => {
    switch (state.currentStep) {
      case 'cart':
        return cart.items.length > 0;
      case 'shipping':
        return state.shippingAddress !== null && selectedShippingMethod !== null;
      case 'billing':
        return state.sameAsShipping || state.billingAddress !== null;
      case 'payment':
        return state.paymentMethod !== null;
      case 'review':
        return !state.isProcessing;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  }, [
    state.currentStep,
    state.shippingAddress,
    state.billingAddress,
    state.sameAsShipping,
    state.paymentMethod,
    state.isProcessing,
    cart.items.length,
    selectedShippingMethod,
  ]);

  // ============================================
  // Validation
  // ============================================

  const validateShippingAddress = useCallback((): boolean => {
    const address = state.shippingAddress;
    if (!address) {
      dispatch({
        type: 'SET_VALIDATION_ERRORS',
        payload: { general: 'Adresse de livraison requise' },
      });
      hapticFeedback.error();
      return false;
    }

    const errors: ValidationErrors = {};
    errors.firstName = validateRequired(address.firstName, 'Le prenom');
    errors.lastName = validateRequired(address.lastName, 'Le nom');
    errors.address = validateRequired(address.address, 'L\'adresse');
    errors.city = validateRequired(address.city, 'La ville');
    errors.postalCode = validatePostalCode(address.postalCode);
    errors.country = validateRequired(address.country, 'Le pays');
    errors.phone = validatePhone(address.phone);
    if (address.email) {
      errors.email = validateEmail(address.email);
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([, v]) => v !== undefined)
    );

    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: filteredErrors });

    const isValid = Object.keys(filteredErrors).length === 0;
    if (!isValid) {
      hapticFeedback.error();
    }
    return isValid;
  }, [state.shippingAddress]);

  const validateBillingAddress = useCallback((): boolean => {
    if (state.sameAsShipping) {
      return validateShippingAddress();
    }

    const address = state.billingAddress;
    if (!address) {
      dispatch({
        type: 'SET_VALIDATION_ERRORS',
        payload: { general: 'Adresse de facturation requise' },
      });
      hapticFeedback.error();
      return false;
    }

    const errors: ValidationErrors = {};
    errors.firstName = validateRequired(address.firstName, 'Le prenom');
    errors.lastName = validateRequired(address.lastName, 'Le nom');
    errors.address = validateRequired(address.address, 'L\'adresse');
    errors.city = validateRequired(address.city, 'La ville');
    errors.postalCode = validatePostalCode(address.postalCode);
    errors.country = validateRequired(address.country, 'Le pays');
    errors.phone = validatePhone(address.phone);

    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([, v]) => v !== undefined)
    );

    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: filteredErrors });

    const isValid = Object.keys(filteredErrors).length === 0;
    if (!isValid) {
      hapticFeedback.error();
    }
    return isValid;
  }, [state.sameAsShipping, state.billingAddress, validateShippingAddress]);

  // ============================================
  // Navigation Actions
  // ============================================

  const nextStep = useCallback(() => {
    const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);
    if (currentIndex < 0 || currentIndex >= CHECKOUT_STEPS.length - 1) return;

    let isValid = true;

    if (state.currentStep === 'shipping') {
      isValid = validateShippingAddress();
    } else if (state.currentStep === 'billing') {
      isValid = validateBillingAddress();
    } else if (state.currentStep === 'payment') {
      isValid = state.paymentMethod !== null;
      if (!isValid) {
        dispatch({
          type: 'SET_VALIDATION_ERRORS',
          payload: { paymentMethod: 'Veuillez selectionner un mode de paiement' },
        });
        hapticFeedback.error();
      }
    }

    if (!isValid) return;

    hapticFeedback.softConfirm();
    dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep });
    dispatch({ type: 'SET_STEP', payload: CHECKOUT_STEPS[currentIndex + 1] });
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' });
  }, [state.currentStep, state.paymentMethod, validateShippingAddress, validateBillingAddress]);

  const prevStep = useCallback(() => {
    const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);
    if (currentIndex <= 0) return;

    hapticFeedback.quantityChange();
    dispatch({ type: 'SET_STEP', payload: CHECKOUT_STEPS[currentIndex - 1] });
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' });
  }, [state.currentStep]);

  const goToStep = useCallback(
    (step: CheckoutStep) => {
      const targetIndex = CHECKOUT_STEPS.indexOf(step);
      const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);

      if (targetIndex < currentIndex) {
        hapticFeedback.quantityChange();
        dispatch({ type: 'SET_STEP', payload: step });
        dispatch({ type: 'CLEAR_VALIDATION_ERRORS' });
        return;
      }

      if (targetIndex === currentIndex + 1 && canProceed) {
        nextStep();
      }
    },
    [state.currentStep, canProceed, nextStep]
  );

  // ============================================
  // Setter Actions
  // ============================================

  const setShippingAddress = useCallback((address: ShippingAddress) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address });
  }, []);

  const setShippingMethod = useCallback((methodId: string) => {
    const method = SHIPPING_METHODS.find((m) => m.id === methodId);
    if (method) {
      hapticFeedback.quantityChange();
      dispatch({ type: 'SET_SHIPPING_METHOD', payload: methodId });
    }
  }, []);

  const setShippingOption = useCallback((option: ShippingOptionData) => {
    hapticFeedback.quantityChange();
    dispatch({ type: 'SET_SHIPPING_OPTION', payload: option });
  }, []);

  const setBillingAddress = useCallback((address: BillingAddress) => {
    dispatch({ type: 'SET_BILLING_ADDRESS', payload: address });
  }, []);

  const setSameAsShipping = useCallback((same: boolean) => {
    hapticFeedback.quantityChange();
    dispatch({ type: 'SET_SAME_AS_SHIPPING', payload: same });
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    hapticFeedback.softConfirm();
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  }, []);

  const setOrderNotes = useCallback((notes: string) => {
    dispatch({ type: 'SET_ORDER_NOTES', payload: notes });
  }, []);

  const reset = useCallback(async () => {
    hapticFeedback.rigidConfirm();
    dispatch({ type: 'RESET' });
    try {
      await AsyncStorage.removeItem(CHECKOUT_STORAGE_KEY);
    } catch (error) {
      console.error('[CheckoutContext] Error clearing storage:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const setError = useCallback((error: string) => {
    hapticFeedback.error();
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setProcessing = useCallback((processing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: processing });
  }, []);

  // ============================================
  // Context Value (Memoized)
  // ============================================

  const value = useMemo<CheckoutContextValue>(
    () => ({
      state,
      isLoading,
      orderTotals,
      selectedShippingMethod,
      availableShippingMethods: SHIPPING_METHODS,
      canProceed,

      nextStep,
      prevStep,
      goToStep,

      setShippingAddress,
      validateShippingAddress,
      setShippingMethod,
      setShippingOption,

      setBillingAddress,
      setSameAsShipping,
      validateBillingAddress,

      setPaymentMethod,

      setOrderNotes,

      reset,
      clearError,
      setError,
      setProcessing,
    }),
    [
      state,
      isLoading,
      orderTotals,
      selectedShippingMethod,
      canProceed,
      nextStep,
      prevStep,
      goToStep,
      setShippingAddress,
      validateShippingAddress,
      setShippingMethod,
      setShippingOption,
      setBillingAddress,
      setSameAsShipping,
      validateBillingAddress,
      setPaymentMethod,
      setOrderNotes,
      reset,
      clearError,
      setError,
      setProcessing,
    ]
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider');
  }
  return context;
}

// Re-export for backward compatibility
export { CHECKOUT_STEPS };
