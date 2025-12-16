/**
 * Cart B2B Reducer
 *
 * Manages B2B cart state with bulk ordering, spending limits, and validation.
 * Pure function with no side effects - compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

import type { CartB2BState, B2BCartItem, B2BCartTotals } from "../types/state";
import type { CartB2BAction } from "../types/actions";
import { CartB2BActionTypes } from "../types/actions";
import {
  initialCartB2BState,
  initialCartTotals,
  initialSpendingValidation,
} from "../types/state";

/**
 * Calculates cart totals from items.
 * Note: This is a simplified calculation. Real implementation would include
 * company tier discounts, volume discounts, and tax calculations from the server.
 *
 * @param items - Cart items
 * @param currentTotals - Current totals for preserving discounts/tax
 * @returns Updated cart totals
 */
function calculateTotals(
  items: readonly B2BCartItem[],
  currentTotals: B2BCartTotals
): B2BCartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalDiscount = currentTotals.tierDiscount + currentTotals.volumeDiscount;
  const total =
    subtotal - totalDiscount + currentTotals.shippingEstimate + currentTotals.tax;

  return {
    ...currentTotals,
    subtotal,
    totalDiscount,
    total: Math.max(0, total),
  };
}

/**
 * Calculates total item count in cart.
 *
 * @param items - Cart items
 * @returns Total quantity of all items
 */
function calculateItemCount(items: readonly B2BCartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Determines if checkout is allowed based on cart state.
 *
 * @param items - Cart items
 * @param isWithinLimits - Whether spending is within limits
 * @param shippingAddressId - Selected shipping address
 * @returns Tuple of [canCheckout, reason]
 */
function determineCheckoutStatus(
  items: readonly B2BCartItem[],
  isWithinLimits: boolean,
  shippingAddressId: string | null
): readonly [boolean, string | null] {
  if (items.length === 0) {
    return [false, "Cart is empty"];
  }

  if (!isWithinLimits) {
    return [false, "Order exceeds spending limits"];
  }

  if (shippingAddressId === null) {
    return [false, "Shipping address required"];
  }

  // Check for invalid quantities
  const hasInvalidQuantity = items.some(
    (item) =>
      item.quantity < item.minOrderQuantity ||
      item.quantity > item.maxOrderQuantity
  );

  if (hasInvalidQuantity) {
    return [false, "Some items have invalid quantities"];
  }

  return [true, null];
}

/**
 * Reducer for B2B cart state management.
 *
 * Handles:
 * - Adding, updating, and removing cart items
 * - Bulk item operations
 * - Cart metadata (shipping address, PO number, notes)
 * - Totals calculation
 * - Spending limit validation
 * - Checkout eligibility
 * - Cart persistence (hydration)
 *
 * @param state - Current cart state
 * @param action - Action to process
 * @returns New cart state
 *
 * @example
 * ```ts
 * const newState = cartB2BReducer(currentState, {
 *   type: CartB2BActionTypes.ADD_ITEM,
 *   payload: { item: cartItem }
 * });
 * ```
 */
export function cartB2BReducer(
  state: CartB2BState = initialCartB2BState,
  action: CartB2BAction
): CartB2BState {
  switch (action.type) {
    case CartB2BActionTypes.ADD_ITEM: {
      const { item } = action.payload;

      // Check if item already exists
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId
      );

      let newItems: readonly B2BCartItem[];

      if (existingIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingIndex];
        if (existingItem === undefined) {
          return state;
        }
        const newQuantity = Math.min(
          existingItem.quantity + item.quantity,
          item.maxOrderQuantity
        );
        const updatedItem: B2BCartItem = {
          ...existingItem,
          quantity: newQuantity,
          lineTotal: newQuantity * existingItem.unitPrice,
        };
        newItems = [
          ...state.items.slice(0, existingIndex),
          updatedItem,
          ...state.items.slice(existingIndex + 1),
        ];
      } else {
        // Add new item
        newItems = [...state.items, item];
      }

      const newTotals = calculateTotals(newItems, state.totals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        newItems,
        state.spendingValidation.isWithinLimits,
        state.shippingAddressId
      );

      return {
        ...state,
        items: newItems,
        itemCount: calculateItemCount(newItems),
        totals: newTotals,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.UPDATE_ITEM_QUANTITY: {
      const { productId, quantity } = action.payload;

      const itemIndex = state.items.findIndex((i) => i.productId === productId);
      if (itemIndex < 0) {
        return state;
      }

      const item = state.items[itemIndex];
      if (item === undefined) {
        return state;
      }

      // Validate quantity bounds
      const validQuantity = Math.max(
        item.minOrderQuantity,
        Math.min(quantity, item.maxOrderQuantity)
      );

      const updatedItem: B2BCartItem = {
        ...item,
        quantity: validQuantity,
        lineTotal: validQuantity * item.unitPrice,
      };

      const newItems = [
        ...state.items.slice(0, itemIndex),
        updatedItem,
        ...state.items.slice(itemIndex + 1),
      ];

      const newTotals = calculateTotals(newItems, state.totals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        newItems,
        state.spendingValidation.isWithinLimits,
        state.shippingAddressId
      );

      return {
        ...state,
        items: newItems,
        itemCount: calculateItemCount(newItems),
        totals: newTotals,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.REMOVE_ITEM: {
      const { productId } = action.payload;

      const newItems = state.items.filter((i) => i.productId !== productId);
      const newTotals = calculateTotals(newItems, state.totals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        newItems,
        state.spendingValidation.isWithinLimits,
        state.shippingAddressId
      );

      return {
        ...state,
        items: newItems,
        itemCount: calculateItemCount(newItems),
        totals: newTotals,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.UPDATE_ITEM_NOTES: {
      const { productId, notes } = action.payload;

      const itemIndex = state.items.findIndex((i) => i.productId === productId);
      if (itemIndex < 0) {
        return state;
      }

      const item = state.items[itemIndex];
      if (item === undefined) {
        return state;
      }

      const updatedItem: B2BCartItem = {
        ...item,
        notes,
      };

      const newItems = [
        ...state.items.slice(0, itemIndex),
        updatedItem,
        ...state.items.slice(itemIndex + 1),
      ];

      return {
        ...state,
        items: newItems,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.CLEAR_CART: {
      return {
        ...initialCartB2BState,
        shippingAddressId: state.shippingAddressId, // Preserve shipping address
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.ADD_ITEMS_BULK: {
      const { items: newItemsToAdd } = action.payload;

      // Merge with existing items
      const itemMap = new Map<string, B2BCartItem>();

      // Add existing items
      for (const item of state.items) {
        itemMap.set(item.productId, item);
      }

      // Merge new items
      for (const newItem of newItemsToAdd) {
        const existing = itemMap.get(newItem.productId);
        if (existing !== undefined) {
          const newQuantity = Math.min(
            existing.quantity + newItem.quantity,
            newItem.maxOrderQuantity
          );
          itemMap.set(newItem.productId, {
            ...existing,
            quantity: newQuantity,
            lineTotal: newQuantity * existing.unitPrice,
          });
        } else {
          itemMap.set(newItem.productId, newItem);
        }
      }

      const newItems = Array.from(itemMap.values());
      const newTotals = calculateTotals(newItems, state.totals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        newItems,
        state.spendingValidation.isWithinLimits,
        state.shippingAddressId
      );

      return {
        ...state,
        items: newItems,
        itemCount: calculateItemCount(newItems),
        totals: newTotals,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.SET_SHIPPING_ADDRESS: {
      const { addressId } = action.payload;
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        state.items,
        state.spendingValidation.isWithinLimits,
        addressId
      );

      return {
        ...state,
        shippingAddressId: addressId,
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.SET_PURCHASE_ORDER_NUMBER: {
      return {
        ...state,
        purchaseOrderNumber: action.payload.poNumber,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.SET_NOTES: {
      return {
        ...state,
        notes: action.payload.notes,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.UPDATE_TOTALS: {
      const { totals } = action.payload;
      return {
        ...state,
        totals,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.UPDATE_SPENDING_VALIDATION: {
      const { validation, limits } = action.payload;
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        state.items,
        validation.isWithinLimits,
        state.shippingAddressId
      );

      return {
        ...state,
        spendingValidation: {
          ...validation,
          applicableLimits: limits,
        },
        canCheckout,
        checkoutBlockedReason,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.CART_LOADING_START: {
      return {
        ...state,
        status: "loading",
        error: null,
      };
    }

    case CartB2BActionTypes.CART_LOADING_SUCCESS: {
      return {
        ...state,
        status: "succeeded",
        error: null,
      };
    }

    case CartB2BActionTypes.CART_LOADING_FAILURE: {
      return {
        ...state,
        status: "failed",
        error: action.payload.error,
      };
    }

    case CartB2BActionTypes.HYDRATE_CART: {
      const { items, shippingAddressId, purchaseOrderNumber, notes } =
        action.payload;

      const newTotals = calculateTotals(items, initialCartTotals);
      const [canCheckout, checkoutBlockedReason] = determineCheckoutStatus(
        items,
        initialSpendingValidation.isWithinLimits,
        shippingAddressId
      );

      return {
        ...state,
        items,
        itemCount: calculateItemCount(items),
        totals: newTotals,
        shippingAddressId,
        purchaseOrderNumber,
        notes,
        canCheckout,
        checkoutBlockedReason,
        status: "succeeded",
        error: null,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    case CartB2BActionTypes.RESET_CART_STATE: {
      return initialCartB2BState;
    }

    case CartB2BActionTypes.CLEAR_CART_ERROR: {
      return {
        ...state,
        error: null,
      };
    }

    default: {
      return state;
    }
  }
}

export default cartB2BReducer;
