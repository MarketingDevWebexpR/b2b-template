/**
 * Cart Selectors
 *
 * Selector functions for extracting and deriving data from B2B cart state.
 * All selectors are pure functions that can be used with any state management library.
 *
 * @packageDocumentation
 */

import type { SpendingLimit } from "@maison/types";
import type {
  RootState,
  CartB2BState,
  B2BCartItem,
  B2BCartTotals,
  SpendingValidation,
  LoadingStatus,
} from "../types/state";
import {
  createDerivedSelector,
  createDerivedShallowSelector,
  createParameterizedSelector,
} from "../utils/memoize";

// ============================================
// Base Selectors
// ============================================

/**
 * Selects the entire cart B2B state slice.
 *
 * @param state - Root state
 * @returns Cart B2B state
 */
export function selectCartB2BState(state: RootState): CartB2BState {
  return state.cartB2B;
}

/**
 * Selects all cart items.
 *
 * @param state - Root state
 * @returns Array of cart items
 */
export function selectCartItems(state: RootState): readonly B2BCartItem[] {
  return state.cartB2B.items;
}

/**
 * Selects the total item count in cart.
 *
 * @param state - Root state
 * @returns Total quantity of all items
 */
export function selectCartItemCount(state: RootState): number {
  return state.cartB2B.itemCount;
}

/**
 * Selects the cart totals.
 *
 * @param state - Root state
 * @returns Cart totals breakdown
 */
export function selectCartTotals(state: RootState): B2BCartTotals {
  return state.cartB2B.totals;
}

/**
 * Selects the cart total amount.
 *
 * @param state - Root state
 * @returns Grand total
 */
export function selectCartTotal(state: RootState): number {
  return state.cartB2B.totals.total;
}

/**
 * Selects the spending validation state.
 *
 * @param state - Root state
 * @returns Spending validation result
 */
export function selectSpendingValidation(state: RootState): SpendingValidation {
  return state.cartB2B.spendingValidation;
}

/**
 * Selects whether checkout is allowed.
 *
 * @param state - Root state
 * @returns True if checkout is possible
 */
export function selectCanCheckout(state: RootState): boolean {
  return state.cartB2B.canCheckout;
}

/**
 * Selects the reason checkout is blocked (if any).
 *
 * @param state - Root state
 * @returns Block reason or null
 */
export function selectCheckoutBlockedReason(state: RootState): string | null {
  return state.cartB2B.checkoutBlockedReason;
}

// ============================================
// Status Selectors
// ============================================

/**
 * Selects the cart loading status.
 *
 * @param state - Root state
 * @returns Loading status
 */
export function selectCartStatus(state: RootState): LoadingStatus {
  return state.cartB2B.status;
}

/**
 * Selects whether cart is currently loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
export function selectIsCartLoading(state: RootState): boolean {
  return state.cartB2B.status === "loading";
}

/**
 * Selects the cart error message.
 *
 * @param state - Root state
 * @returns Error message or null
 */
export function selectCartError(state: RootState): string | null {
  return state.cartB2B.error;
}

/**
 * Selects the last update timestamp.
 *
 * @param state - Root state
 * @returns ISO timestamp or null
 */
export function selectCartLastUpdated(state: RootState): string | null {
  return state.cartB2B.lastUpdatedAt;
}

// ============================================
// Cart Metadata Selectors
// ============================================

/**
 * Selects the selected shipping address ID.
 *
 * @param state - Root state
 * @returns Shipping address ID or null
 */
export function selectCartShippingAddressId(state: RootState): string | null {
  return state.cartB2B.shippingAddressId;
}

/**
 * Selects the purchase order number.
 *
 * @param state - Root state
 * @returns PO number string
 */
export function selectCartPurchaseOrderNumber(state: RootState): string {
  return state.cartB2B.purchaseOrderNumber;
}

/**
 * Selects the cart notes.
 *
 * @param state - Root state
 * @returns Notes string
 */
export function selectCartNotes(state: RootState): string {
  return state.cartB2B.notes;
}

// ============================================
// Item Selectors
// ============================================

/**
 * Selects a cart item by product ID.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param productId - Product ID to find
 * @returns Cart item or undefined
 */
export const selectCartItemByProductId = createParameterizedSelector(
  (state: RootState, productId: string): B2BCartItem | undefined =>
    state.cartB2B.items.find((item) => item.productId === productId)
);

/**
 * Selects the quantity of a specific product in the cart.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param productId - Product ID to check
 * @returns Quantity or 0 if not in cart
 */
export const selectCartItemQuantity = createParameterizedSelector(
  (state: RootState, productId: string): number => {
    const item = state.cartB2B.items.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  }
);

/**
 * Checks if a product is in the cart.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param productId - Product ID to check
 * @returns True if product is in cart
 */
export const selectIsProductInCart = createParameterizedSelector(
  (state: RootState, productId: string): boolean =>
    state.cartB2B.items.some((item) => item.productId === productId)
);

/**
 * Selects the number of unique products in the cart.
 *
 * @param state - Root state
 * @returns Number of unique products
 */
export function selectCartUniqueItemCount(state: RootState): number {
  return state.cartB2B.items.length;
}

// ============================================
// Totals Selectors
// ============================================

/**
 * Selects the cart subtotal.
 *
 * @param state - Root state
 * @returns Subtotal before discounts/shipping/tax
 */
export function selectCartSubtotal(state: RootState): number {
  return state.cartB2B.totals.subtotal;
}

/**
 * Selects the tier discount amount.
 *
 * @param state - Root state
 * @returns Tier discount
 */
export function selectCartTierDiscount(state: RootState): number {
  return state.cartB2B.totals.tierDiscount;
}

/**
 * Selects the volume discount amount.
 *
 * @param state - Root state
 * @returns Volume discount
 */
export function selectCartVolumeDiscount(state: RootState): number {
  return state.cartB2B.totals.volumeDiscount;
}

/**
 * Selects the total discount amount.
 *
 * @param state - Root state
 * @returns Total discount
 */
export function selectCartTotalDiscount(state: RootState): number {
  return state.cartB2B.totals.totalDiscount;
}

/**
 * Selects the shipping estimate.
 *
 * @param state - Root state
 * @returns Shipping estimate
 */
export function selectCartShippingEstimate(state: RootState): number {
  return state.cartB2B.totals.shippingEstimate;
}

/**
 * Selects the tax amount.
 *
 * @param state - Root state
 * @returns Tax amount
 */
export function selectCartTax(state: RootState): number {
  return state.cartB2B.totals.tax;
}

/**
 * Selects the cart currency.
 *
 * @param state - Root state
 * @returns Currency code
 */
export function selectCartCurrency(state: RootState): string {
  return state.cartB2B.totals.currency;
}

// ============================================
// Spending Validation Selectors
// ============================================

/**
 * Selects whether cart is within spending limits.
 *
 * @param state - Root state
 * @returns True if within limits
 */
export function selectIsWithinSpendingLimits(state: RootState): boolean {
  return state.cartB2B.spendingValidation.isWithinLimits;
}

/**
 * Selects whether the order requires approval.
 *
 * @param state - Root state
 * @returns True if approval required
 */
export function selectRequiresApproval(state: RootState): boolean {
  return state.cartB2B.spendingValidation.requiresApproval;
}

/**
 * Selects the reason for requiring approval.
 *
 * @param state - Root state
 * @returns Approval reason or null
 */
export function selectApprovalReason(state: RootState): string | null {
  return state.cartB2B.spendingValidation.approvalReason;
}

/**
 * Selects applicable spending limits.
 *
 * @param state - Root state
 * @returns Array of applicable spending limits
 */
export function selectApplicableSpendingLimits(
  state: RootState
): readonly SpendingLimit[] {
  return state.cartB2B.spendingValidation.applicableLimits;
}

/**
 * Selects spending warnings.
 *
 * @param state - Root state
 * @returns Array of warning messages
 */
export function selectSpendingWarnings(state: RootState): readonly string[] {
  return state.cartB2B.spendingValidation.warnings;
}

/**
 * Selects whether there are spending warnings.
 *
 * @param state - Root state
 * @returns True if there are warnings
 */
export function selectHasSpendingWarnings(state: RootState): boolean {
  return state.cartB2B.spendingValidation.warnings.length > 0;
}

// ============================================
// Derived Selectors
// ============================================

/**
 * Selects whether the cart is empty.
 *
 * @param state - Root state
 * @returns True if cart has no items
 */
export function selectIsCartEmpty(state: RootState): boolean {
  return state.cartB2B.items.length === 0;
}

/**
 * Selects cart items with invalid quantities.
 * Invalid means quantity is below min or above max.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Items with invalid quantities
 */
export const selectInvalidQuantityItems = createDerivedSelector(
  [selectCartItems],
  (items): readonly B2BCartItem[] =>
    items.filter(
      (item) =>
        item.quantity < item.minOrderQuantity ||
        item.quantity > item.maxOrderQuantity
    )
);

/**
 * Selects whether all items have valid quantities.
 *
 * @param state - Root state
 * @returns True if all quantities are valid
 */
export function selectAllQuantitiesValid(state: RootState): boolean {
  return state.cartB2B.items.every(
    (item) =>
      item.quantity >= item.minOrderQuantity &&
      item.quantity <= item.maxOrderQuantity
  );
}

/**
 * Selects the total weight of all items in the cart.
 * Assumes unit price is used as placeholder for weight when not specified.
 *
 * @param state - Root state
 * @returns Total quantity (items don't have weight, returns quantity sum)
 */
export function selectCartTotalQuantity(state: RootState): number {
  return state.cartB2B.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Selects the average item price in the cart.
 *
 * @param state - Root state
 * @returns Average price per unit or 0 if cart is empty
 */
export function selectAverageItemPrice(state: RootState): number {
  const items = state.cartB2B.items;
  if (items.length === 0) {
    return 0;
  }

  const totalValue = items.reduce((sum, item) => sum + item.unitPrice, 0);
  return totalValue / items.length;
}

/**
 * Selects cart data for persistence (serializable subset).
 * Memoized with shallow equality to prevent unnecessary re-renders.
 *
 * @param state - Root state
 * @returns Data suitable for storage
 */
export const selectCartForPersistence = createDerivedShallowSelector(
  [
    selectCartItems,
    selectCartShippingAddressId,
    selectCartPurchaseOrderNumber,
    selectCartNotes,
  ],
  (
    items,
    shippingAddressId,
    purchaseOrderNumber,
    notes
  ): {
    readonly items: readonly B2BCartItem[];
    readonly shippingAddressId: string | null;
    readonly purchaseOrderNumber: string;
    readonly notes: string;
  } => ({
    items,
    shippingAddressId,
    purchaseOrderNumber,
    notes,
  })
);

/**
 * Type definition for checkout summary.
 */
export interface CheckoutSummary {
  readonly itemCount: number;
  readonly uniqueItems: number;
  readonly subtotal: number;
  readonly discount: number;
  readonly shipping: number;
  readonly tax: number;
  readonly total: number;
  readonly currency: string;
  readonly requiresApproval: boolean;
  readonly canCheckout: boolean;
  readonly blockedReason: string | null;
  readonly [key: string]: unknown;
}

/**
 * Creates a checkout summary from current cart state.
 * Memoized with shallow equality to prevent unnecessary re-renders
 * when the derived values haven't changed.
 *
 * @param state - Root state
 * @returns Checkout summary object
 */
export const selectCheckoutSummary = createDerivedShallowSelector(
  [
    selectCartItemCount,
    selectCartItems,
    selectCartTotals,
    selectSpendingValidation,
    selectCanCheckout,
    selectCheckoutBlockedReason,
  ],
  (
    itemCount,
    items,
    totals,
    spendingValidation,
    canCheckout,
    checkoutBlockedReason
  ): CheckoutSummary => ({
    itemCount,
    uniqueItems: items.length,
    subtotal: totals.subtotal,
    discount: totals.totalDiscount,
    shipping: totals.shippingEstimate,
    tax: totals.tax,
    total: totals.total,
    currency: totals.currency,
    requiresApproval: spendingValidation.requiresApproval,
    canCheckout,
    blockedReason: checkoutBlockedReason,
  })
);
