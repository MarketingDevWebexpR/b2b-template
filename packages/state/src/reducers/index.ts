/**
 * Reducers Module
 *
 * Exports all reducers and provides a combined root reducer.
 * All reducers are pure functions compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

import type { RootState } from "../types/state";
import type { RootAction } from "../types/actions";
import { initialRootState } from "../types/state";

// Individual reducers
export { companyReducer, default as companyReducerDefault } from "./company.reducer";
export { quotesReducer, default as quotesReducerDefault } from "./quotes.reducer";
export { approvalsReducer, default as approvalsReducerDefault } from "./approvals.reducer";
export { cartB2BReducer, default as cartB2BReducerDefault } from "./cart-b2b.reducer";

// Import for root reducer
import { companyReducer } from "./company.reducer";
import { quotesReducer } from "./quotes.reducer";
import { approvalsReducer } from "./approvals.reducer";
import { cartB2BReducer } from "./cart-b2b.reducer";
import type { CompanyAction } from "../types/actions";
import type { QuotesAction } from "../types/actions";
import type { ApprovalsAction } from "../types/actions";
import type { CartB2BAction } from "../types/actions";

/**
 * Combined root reducer for the entire B2B application state.
 *
 * Combines all domain-specific reducers into a single reducer function.
 * Each slice of state is managed by its corresponding reducer.
 *
 * @param state - Current root state
 * @param action - Action to process
 * @returns New root state
 *
 * @example
 * ```ts
 * // With Redux
 * import { createStore } from 'redux';
 * const store = createStore(rootReducer);
 *
 * // With useReducer
 * const [state, dispatch] = useReducer(rootReducer, initialRootState);
 *
 * // With Zustand
 * const useStore = create((set) => ({
 *   ...initialRootState,
 *   dispatch: (action) => set((state) => rootReducer(state, action)),
 * }));
 * ```
 */
export function rootReducer(
  state: RootState = initialRootState,
  action: RootAction
): RootState {
  return {
    company: companyReducer(state.company, action as CompanyAction),
    quotes: quotesReducer(state.quotes, action as QuotesAction),
    approvals: approvalsReducer(state.approvals, action as ApprovalsAction),
    cartB2B: cartB2BReducer(state.cartB2B, action as CartB2BAction),
  };
}

export default rootReducer;

/**
 * Type-safe reducer map for libraries that need individual reducers.
 */
export const reducers = {
  company: companyReducer,
  quotes: quotesReducer,
  approvals: approvalsReducer,
  cartB2B: cartB2BReducer,
} as const;

/**
 * Type representing the reducer map.
 */
export type Reducers = typeof reducers;
