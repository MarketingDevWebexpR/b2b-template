/**
 * Cart B2B Action Creators
 *
 * Factory functions for creating type-safe B2B cart actions.
 * All action creators are pure functions with no side effects.
 *
 * @packageDocumentation
 */

import type { SpendingLimit } from "@maison/types";
import type { B2BCartItem, B2BCartTotals, SpendingValidation } from "../types/state";
import {
  CartB2BActionTypes,
  type AddItemAction,
  type UpdateItemQuantityAction,
  type RemoveItemAction,
  type UpdateItemNotesAction,
  type ClearCartAction,
  type AddItemsBulkAction,
  type SetShippingAddressAction,
  type SetPurchaseOrderNumberAction,
  type SetCartNotesAction,
  type UpdateTotalsAction,
  type UpdateSpendingValidationAction,
  type CartLoadingStartAction,
  type CartLoadingSuccessAction,
  type CartLoadingFailureAction,
  type HydrateCartAction,
  type ResetCartStateAction,
  type ClearCartErrorAction,
} from "../types/actions";

// ============================================
// Item Operations Actions
// ============================================

/**
 * Creates an action to add an item to the cart.
 *
 * @param item - Cart item to add
 * @returns Add item action
 *
 * @example
 * ```ts
 * dispatch(addItem({
 *   productId: 'prod-123',
 *   productSku: 'SKU-001',
 *   productName: 'Gold Necklace',
 *   productImage: '/images/necklace.jpg',
 *   unitPrice: 299.99,
 *   quantity: 2,
 *   minOrderQuantity: 1,
 *   maxOrderQuantity: 100,
 *   lineTotal: 599.98,
 * }));
 * ```
 */
export function addItem(item: B2BCartItem): AddItemAction {
  return {
    type: CartB2BActionTypes.ADD_ITEM,
    payload: {
      item,
    },
  };
}

/**
 * Creates an action to update an item's quantity.
 *
 * @param productId - ID of the product to update
 * @param quantity - New quantity
 * @returns Update item quantity action
 */
export function updateItemQuantity(
  productId: string,
  quantity: number
): UpdateItemQuantityAction {
  return {
    type: CartB2BActionTypes.UPDATE_ITEM_QUANTITY,
    payload: {
      productId,
      quantity,
    },
  };
}

/**
 * Creates an action to remove an item from the cart.
 *
 * @param productId - ID of the product to remove
 * @returns Remove item action
 */
export function removeItem(productId: string): RemoveItemAction {
  return {
    type: CartB2BActionTypes.REMOVE_ITEM,
    payload: {
      productId,
    },
  };
}

/**
 * Creates an action to update an item's notes.
 *
 * @param productId - ID of the product
 * @param notes - Notes for the item
 * @returns Update item notes action
 */
export function updateItemNotes(
  productId: string,
  notes: string
): UpdateItemNotesAction {
  return {
    type: CartB2BActionTypes.UPDATE_ITEM_NOTES,
    payload: {
      productId,
      notes,
    },
  };
}

/**
 * Creates an action to clear all items from the cart.
 *
 * @returns Clear cart action
 */
export function clearCart(): ClearCartAction {
  return {
    type: CartB2BActionTypes.CLEAR_CART,
  };
}

// ============================================
// Bulk Operations Actions
// ============================================

/**
 * Creates an action to add multiple items at once.
 *
 * @param items - Array of cart items to add
 * @returns Add items bulk action
 *
 * @example
 * ```ts
 * dispatch(addItemsBulk([item1, item2, item3]));
 * ```
 */
export function addItemsBulk(
  items: readonly B2BCartItem[]
): AddItemsBulkAction {
  return {
    type: CartB2BActionTypes.ADD_ITEMS_BULK,
    payload: {
      items,
    },
  };
}

// ============================================
// Cart Metadata Actions
// ============================================

/**
 * Creates an action to set the shipping address.
 *
 * @param addressId - ID of the shipping address, or null to clear
 * @returns Set shipping address action
 */
export function setShippingAddress(
  addressId: string | null
): SetShippingAddressAction {
  return {
    type: CartB2BActionTypes.SET_SHIPPING_ADDRESS,
    payload: {
      addressId,
    },
  };
}

/**
 * Creates an action to set the purchase order number.
 *
 * @param poNumber - Purchase order number
 * @returns Set purchase order number action
 */
export function setPurchaseOrderNumber(
  poNumber: string
): SetPurchaseOrderNumberAction {
  return {
    type: CartB2BActionTypes.SET_PURCHASE_ORDER_NUMBER,
    payload: {
      poNumber,
    },
  };
}

/**
 * Creates an action to set cart notes.
 *
 * @param notes - Cart notes
 * @returns Set notes action
 */
export function setCartNotes(notes: string): SetCartNotesAction {
  return {
    type: CartB2BActionTypes.SET_NOTES,
    payload: {
      notes,
    },
  };
}

// ============================================
// Totals and Validation Actions
// ============================================

/**
 * Creates an action to update cart totals.
 * Use after receiving calculated totals from the server.
 *
 * @param totals - Cart totals breakdown
 * @returns Update totals action
 */
export function updateTotals(totals: B2BCartTotals): UpdateTotalsAction {
  return {
    type: CartB2BActionTypes.UPDATE_TOTALS,
    payload: {
      totals,
    },
  };
}

/**
 * Creates an action to update spending validation.
 * Use after validating cart against spending limits.
 *
 * @param validation - Spending validation result
 * @param limits - Applicable spending limits
 * @returns Update spending validation action
 */
export function updateSpendingValidation(
  validation: SpendingValidation,
  limits: readonly SpendingLimit[]
): UpdateSpendingValidationAction {
  return {
    type: CartB2BActionTypes.UPDATE_SPENDING_VALIDATION,
    payload: {
      validation,
      limits,
    },
  };
}

// ============================================
// Loading State Actions
// ============================================

/**
 * Creates an action to indicate cart loading has started.
 *
 * @returns Cart loading start action
 */
export function cartLoadingStart(): CartLoadingStartAction {
  return {
    type: CartB2BActionTypes.CART_LOADING_START,
  };
}

/**
 * Creates an action to indicate cart loading succeeded.
 *
 * @returns Cart loading success action
 */
export function cartLoadingSuccess(): CartLoadingSuccessAction {
  return {
    type: CartB2BActionTypes.CART_LOADING_SUCCESS,
  };
}

/**
 * Creates an action to indicate cart loading failed.
 *
 * @param error - Error message
 * @returns Cart loading failure action
 */
export function cartLoadingFailure(error: string): CartLoadingFailureAction {
  return {
    type: CartB2BActionTypes.CART_LOADING_FAILURE,
    payload: {
      error,
    },
  };
}

// ============================================
// Hydration Actions
// ============================================

/**
 * Creates an action to hydrate cart from persisted data.
 * Use when loading cart from localStorage or session.
 *
 * @param items - Persisted cart items
 * @param shippingAddressId - Persisted shipping address ID
 * @param purchaseOrderNumber - Persisted PO number
 * @param notes - Persisted notes
 * @returns Hydrate cart action
 *
 * @example
 * ```ts
 * const savedCart = JSON.parse(localStorage.getItem('b2b-cart') || '{}');
 * dispatch(hydrateCart(
 *   savedCart.items || [],
 *   savedCart.shippingAddressId || null,
 *   savedCart.purchaseOrderNumber || '',
 *   savedCart.notes || ''
 * ));
 * ```
 */
export function hydrateCart(
  items: readonly B2BCartItem[],
  shippingAddressId: string | null,
  purchaseOrderNumber: string,
  notes: string
): HydrateCartAction {
  return {
    type: CartB2BActionTypes.HYDRATE_CART,
    payload: {
      items,
      shippingAddressId,
      purchaseOrderNumber,
      notes,
    },
  };
}

// ============================================
// Reset and Clear Actions
// ============================================

/**
 * Creates an action to reset cart state to initial values.
 *
 * @returns Reset cart state action
 */
export function resetCartState(): ResetCartStateAction {
  return {
    type: CartB2BActionTypes.RESET_CART_STATE,
  };
}

/**
 * Creates an action to clear cart error.
 *
 * @returns Clear cart error action
 */
export function clearCartError(): ClearCartErrorAction {
  return {
    type: CartB2BActionTypes.CLEAR_CART_ERROR,
  };
}

// ============================================
// Async Action Types (for thunks/sagas)
// ============================================

/**
 * Async action type constants for cart operations.
 */
export const CartB2BAsyncActionTypes = {
  /** Validate cart with server */
  VALIDATE_CART: "cartB2B/validate",
  /** Calculate totals with server (discounts, tax, shipping) */
  CALCULATE_TOTALS: "cartB2B/calculateTotals",
  /** Validate spending limits */
  VALIDATE_SPENDING: "cartB2B/validateSpending",
  /** Submit cart as order */
  SUBMIT_ORDER: "cartB2B/submitOrder",
  /** Convert cart to quote request */
  REQUEST_QUOTE: "cartB2B/requestQuote",
  /** Sync cart with server */
  SYNC_CART: "cartB2B/sync",
  /** Load cart from server */
  LOAD_CART: "cartB2B/load",
} as const;

/**
 * Async action creator types for external implementation.
 */
export interface CartB2BAsyncActions {
  /** Validates cart items with server (stock, pricing, availability) */
  validateCart: () => Promise<boolean>;
  /** Calculates totals with server (applies discounts, tax, shipping) */
  calculateTotals: () => Promise<B2BCartTotals>;
  /** Validates cart against employee spending limits */
  validateSpending: () => Promise<SpendingValidation>;
  /** Submits cart as a new order */
  submitOrder: () => Promise<string>;
  /** Converts cart to a quote request */
  requestQuote: () => Promise<string>;
  /** Syncs local cart with server */
  syncCart: () => Promise<void>;
  /** Loads cart from server (for logged-in users) */
  loadCart: () => Promise<void>;
}
