/**
 * Checkout Components - B2B Multi-step Checkout
 *
 * Re-exports all checkout-related components for easy imports.
 *
 * @example
 * import { CheckoutStepper, CheckoutSummary } from '@/app/(shop)/checkout/components';
 */

export {
  CheckoutStepper,
  CheckoutStepperCompact,
  checkoutSteps,
  type CheckoutStepConfig,
  type CheckoutStepperProps,
} from './CheckoutStepper';

export {
  CheckoutSummary,
  CheckoutSummaryMinimal,
  type CheckoutSummaryProps,
} from './CheckoutSummary';
