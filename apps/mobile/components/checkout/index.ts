/**
 * Checkout Components Barrel Export
 * Luxury jewelry e-commerce checkout flow components
 *
 * This module exports all checkout-related UI components for the
 * premium jewelry shopping experience.
 */

// Step Indicator
export { CheckoutStepIndicator } from './CheckoutStepIndicator';
export type { default as CheckoutStepIndicatorDefault } from './CheckoutStepIndicator';

// Shipping Form
export { ShippingForm } from './ShippingForm';
export type { ShippingAddress } from './ShippingForm';

// Shipping Option Card
export { ShippingOptionCard } from './ShippingOptionCard';
export type { ShippingOption } from './ShippingOptionCard';

// Payment Form
export { PaymentForm } from './PaymentForm';
export type { PaymentMethod } from './PaymentForm';

// Order Summary
export { OrderSummary } from './OrderSummary';
export type { CartItem } from './OrderSummary';

// Checkout Button
export { CheckoutButton } from './CheckoutButton';

// Secure Payment Badge
export { SecurePaymentBadge } from './SecurePaymentBadge';

// Order Confirmation Overlay
export { OrderConfirmationOverlay } from './OrderConfirmationOverlay';

// Address Selector
export { AddressSelector } from './AddressSelector';
export type { SavedAddress, NewAddress, AddressLabel } from './AddressSelector';
