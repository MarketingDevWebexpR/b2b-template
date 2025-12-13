/**
 * Hooks
 * Barrel export for custom hooks
 */

export { useVoiceSearch } from './useVoiceSearch';
export type {
  VoiceSearchState,
  VoiceSearchError,
  VoiceSearchResult,
  UseVoiceSearchOptions,
  UseVoiceSearchReturn,
} from './useVoiceSearch';

// Barcode Scanner hook
export { useBarcodeScanner, SUPPORTED_BARCODE_TYPES } from './useBarcodeScanner';
export type {
  ScanResult,
  ProductLookupResult,
  UseBarcodeScanner,
} from './useBarcodeScanner';

// Checkout flow hook
export {
  useCheckout,
  SHIPPING_METHODS,
  CHECKOUT_STEPS,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from './useCheckout';
export type {
  ShippingMethod,
  ValidationErrors,
  OrderTotals,
} from './useCheckout';

// Stripe payment hook
export {
  useStripePayment,
  formatAmountForStripe,
  orderTotalsToStripeAmount,
  PAYMENT_INTENT_ENDPOINT,
  DEFAULT_MERCHANT_NAME,
  getLocalizedErrorMessage,
  mapStripeErrorToCode,
} from './useStripePayment';
export type {
  StripePaymentStatus,
  StripeErrorCode,
  StripePaymentError,
  PaymentIntentResponse,
  StripeCustomerInfo,
  PaymentResult,
  UseStripePaymentOptions,
  UseStripePaymentReturn,
  InitializePaymentParams,
} from './useStripePayment';

// Saved addresses hook
export {
  useAddresses,
  formatAddressLine,
  formatAddressMultiLine,
  getMockAddresses,
} from './useAddresses';
export type {
  SavedAddress,
  AddressInput,
  AddressUpdateInput,
  AddressesState,
  AddressesActions,
  UseAddressesOptions,
} from './useAddresses';
