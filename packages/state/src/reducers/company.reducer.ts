/**
 * Company Reducer
 *
 * Manages company and employee context state for B2B operations.
 * Pure function with no side effects - compatible with Redux, Zustand, or useReducer.
 *
 * @packageDocumentation
 */

import type { CompanyState } from "../types/state";
import type { CompanyAction } from "../types/actions";
import { CompanyActionTypes } from "../types/actions";
import { initialCompanyState } from "../types/state";

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
export function companyReducer(
  state: CompanyState = initialCompanyState,
  action: CompanyAction
): CompanyState {
  switch (action.type) {
    case CompanyActionTypes.FETCH_COMPANY_START: {
      return {
        ...state,
        status: "loading",
        error: null,
      };
    }

    case CompanyActionTypes.FETCH_COMPANY_SUCCESS: {
      const { company, employee } = action.payload;
      return {
        ...state,
        currentCompany: company,
        currentEmployee: employee,
        status: "succeeded",
        error: null,
        isB2BActive: true,
        lastRefreshedAt: new Date().toISOString(),
      };
    }

    case CompanyActionTypes.FETCH_COMPANY_FAILURE: {
      return {
        ...state,
        status: "failed",
        error: action.payload.error,
        isB2BActive: false,
      };
    }

    case CompanyActionTypes.SET_CURRENT_COMPANY: {
      const { company } = action.payload;
      const isB2BActive = company !== null && state.currentEmployee !== null;
      return {
        ...state,
        currentCompany: company,
        isB2BActive,
        lastRefreshedAt: company !== null ? new Date().toISOString() : state.lastRefreshedAt,
      };
    }

    case CompanyActionTypes.SET_CURRENT_EMPLOYEE: {
      const { employee } = action.payload;
      const isB2BActive = state.currentCompany !== null && employee !== null;
      return {
        ...state,
        currentEmployee: employee,
        isB2BActive,
      };
    }

    case CompanyActionTypes.LOAD_EMPLOYEES: {
      return {
        ...state,
        employees: action.payload.employees,
      };
    }

    case CompanyActionTypes.RESET_COMPANY_STATE: {
      return initialCompanyState;
    }

    case CompanyActionTypes.CLEAR_COMPANY_ERROR: {
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

export default companyReducer;
