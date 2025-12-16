import { C as CompanyState, Q as QuotesState, a as ApprovalsState, c as CartB2BState, R as RootState } from '../state-RCP8oCT3.cjs';
import { d as CompanyAction, Q as QuotesAction, W as ApprovalsAction, ac as CartB2BAction, ad as RootAction } from '../actions-yzTWTrGA.cjs';
import '@maison/types';

/**
 * Company Reducer
 *
 * Manages company and employee context state for B2B operations.
 * Pure function with no side effects - compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

/**
 * Reducer for company state management.
 *
 * Handles:
 * - Fetching and setting current company
 * - Fetching and setting current employee
 * - Loading company employees
 * - B2B active state management
 *
 * @param state - Current company state
 * @param action - Action to process
 * @returns New company state
 *
 * @example
 * ```ts
 * const newState = companyReducer(currentState, {
 *   type: CompanyActionTypes.SET_CURRENT_COMPANY,
 *   payload: { company: companyData }
 * });
 * ```
 */
declare function companyReducer(state: CompanyState | undefined, action: CompanyAction): CompanyState;

/**
 * Quotes Reducer
 *
 * Manages quote list, filters, and selection state for B2B quote management.
 * Pure function with no side effects - compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

/**
 * Reducer for quotes state management.
 *
 * Handles:
 * - Fetching and displaying quote lists
 * - Fetching and viewing quote details
 * - Quote filtering and search
 * - Quote selection
 * - Pagination
 * - Quote CRUD operations
 *
 * @param state - Current quotes state
 * @param action - Action to process
 * @returns New quotes state
 *
 * @example
 * ```ts
 * const newState = quotesReducer(currentState, {
 *   type: QuotesActionTypes.SET_QUOTE_STATUS_FILTER,
 *   payload: { status: 'pending' }
 * });
 * ```
 */
declare function quotesReducer(state: QuotesState | undefined, action: QuotesAction): QuotesState;

/**
 * Approvals Reducer
 *
 * Manages approval requests, filters, and pending counts for B2B workflow management.
 * Pure function with no side effects - compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

/**
 * Reducer for approvals state management.
 *
 * Handles:
 * - Fetching pending and all approval requests
 * - Fetching approval details
 * - Filtering and searching approvals
 * - Approval selection
 * - Processing approval actions (approve, reject, etc.)
 * - Tracking pending approval counts
 * - Pagination
 *
 * @param state - Current approvals state
 * @param action - Action to process
 * @returns New approvals state
 *
 * @example
 * ```ts
 * const newState = approvalsReducer(currentState, {
 *   type: ApprovalsActionTypes.APPROVAL_ACTION_SUCCESS,
 *   payload: { approvalId: '123', action: 'approve', updatedApproval: approval }
 * });
 * ```
 */
declare function approvalsReducer(state: ApprovalsState | undefined, action: ApprovalsAction): ApprovalsState;

/**
 * Cart B2B Reducer
 *
 * Manages B2B cart state with bulk ordering, spending limits, and validation.
 * Pure function with no side effects - compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

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
declare function cartB2BReducer(state: CartB2BState | undefined, action: CartB2BAction): CartB2BState;

/**
 * Reducers Module
 *
 * Exports all reducers and provides a combined root reducer.
 * All reducers are pure functions compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

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
declare function rootReducer(state: RootState | undefined, action: RootAction): RootState;

/**
 * Type-safe reducer map for libraries that need individual reducers.
 */
declare const reducers: {
    readonly company: typeof companyReducer;
    readonly quotes: typeof quotesReducer;
    readonly approvals: typeof approvalsReducer;
    readonly cartB2B: typeof cartB2BReducer;
};
/**
 * Type representing the reducer map.
 */
type Reducers = typeof reducers;

export { type Reducers, approvalsReducer, approvalsReducer as approvalsReducerDefault, cartB2BReducer, cartB2BReducer as cartB2BReducerDefault, companyReducer, companyReducer as companyReducerDefault, rootReducer as default, quotesReducer, quotesReducer as quotesReducerDefault, reducers, rootReducer };
