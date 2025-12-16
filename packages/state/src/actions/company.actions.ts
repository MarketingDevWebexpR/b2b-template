/**
 * Company Action Creators
 *
 * Factory functions for creating type-safe company actions.
 * All action creators are pure functions with no side effects.
 *
 * @packageDocumentation
 */

import type { Company, Employee, EmployeeSummary } from "@maison/types";
import {
  CompanyActionTypes,
  type FetchCompanyStartAction,
  type FetchCompanySuccessAction,
  type FetchCompanyFailureAction,
  type SetCurrentCompanyAction,
  type SetCurrentEmployeeAction,
  type LoadEmployeesAction,
  type ResetCompanyStateAction,
  type ClearCompanyErrorAction,
} from "../types/actions";

// ============================================
// Fetch Company Actions
// ============================================

/**
 * Creates an action to start fetching company data.
 *
 * @returns Fetch company start action
 *
 * @example
 * ```ts
 * dispatch(fetchCompanyStart());
 * ```
 */
export function fetchCompanyStart(): FetchCompanyStartAction {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_START,
  };
}

/**
 * Creates an action for successful company fetch.
 *
 * @param company - The fetched company data
 * @param employee - The current employee data
 * @returns Fetch company success action
 *
 * @example
 * ```ts
 * dispatch(fetchCompanySuccess(companyData, employeeData));
 * ```
 */
export function fetchCompanySuccess(
  company: Company,
  employee: Employee
): FetchCompanySuccessAction {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_SUCCESS,
    payload: {
      company,
      employee,
    },
  };
}

/**
 * Creates an action for failed company fetch.
 *
 * @param error - Error message
 * @returns Fetch company failure action
 *
 * @example
 * ```ts
 * dispatch(fetchCompanyFailure('Failed to load company data'));
 * ```
 */
export function fetchCompanyFailure(error: string): FetchCompanyFailureAction {
  return {
    type: CompanyActionTypes.FETCH_COMPANY_FAILURE,
    payload: {
      error,
    },
  };
}

// ============================================
// Set Current Context Actions
// ============================================

/**
 * Creates an action to set the current company.
 *
 * @param company - Company to set as current, or null to clear
 * @returns Set current company action
 *
 * @example
 * ```ts
 * dispatch(setCurrentCompany(companyData));
 * // or to clear
 * dispatch(setCurrentCompany(null));
 * ```
 */
export function setCurrentCompany(
  company: Company | null
): SetCurrentCompanyAction {
  return {
    type: CompanyActionTypes.SET_CURRENT_COMPANY,
    payload: {
      company,
    },
  };
}

/**
 * Creates an action to set the current employee.
 *
 * @param employee - Employee to set as current, or null to clear
 * @returns Set current employee action
 *
 * @example
 * ```ts
 * dispatch(setCurrentEmployee(employeeData));
 * // or to clear
 * dispatch(setCurrentEmployee(null));
 * ```
 */
export function setCurrentEmployee(
  employee: Employee | null
): SetCurrentEmployeeAction {
  return {
    type: CompanyActionTypes.SET_CURRENT_EMPLOYEE,
    payload: {
      employee,
    },
  };
}

// ============================================
// Employee Management Actions
// ============================================

/**
 * Creates an action to load company employees.
 *
 * @param employees - Array of employee summaries
 * @returns Load employees action
 *
 * @example
 * ```ts
 * dispatch(loadEmployees(employeesList));
 * ```
 */
export function loadEmployees(
  employees: readonly EmployeeSummary[]
): LoadEmployeesAction {
  return {
    type: CompanyActionTypes.LOAD_EMPLOYEES,
    payload: {
      employees,
    },
  };
}

// ============================================
// Reset and Clear Actions
// ============================================

/**
 * Creates an action to reset company state to initial values.
 * Use when logging out or switching contexts.
 *
 * @returns Reset company state action
 *
 * @example
 * ```ts
 * dispatch(resetCompanyState());
 * ```
 */
export function resetCompanyState(): ResetCompanyStateAction {
  return {
    type: CompanyActionTypes.RESET_COMPANY_STATE,
  };
}

/**
 * Creates an action to clear company error.
 *
 * @returns Clear company error action
 *
 * @example
 * ```ts
 * dispatch(clearCompanyError());
 * ```
 */
export function clearCompanyError(): ClearCompanyErrorAction {
  return {
    type: CompanyActionTypes.CLEAR_COMPANY_ERROR,
  };
}

// ============================================
// Async Action Types (for thunks/sagas)
// ============================================

/**
 * Async action type constants for company operations.
 * Use these with middleware like redux-thunk or redux-saga.
 */
export const CompanyAsyncActionTypes = {
  /** Fetch company and employee data */
  FETCH_COMPANY: "company/fetch",
  /** Refresh company data */
  REFRESH_COMPANY: "company/refresh",
  /** Switch to different company (for multi-company users) */
  SWITCH_COMPANY: "company/switch",
  /** Fetch employees list */
  FETCH_EMPLOYEES: "company/fetchEmployees",
} as const;

/**
 * Async action creator types for external implementation.
 * These are type definitions only - implement with your async middleware.
 */
export interface CompanyAsyncActions {
  /** Fetches company and current employee data */
  fetchCompany: () => Promise<void>;
  /** Refreshes current company data */
  refreshCompany: () => Promise<void>;
  /** Switches to a different company */
  switchCompany: (companyId: string) => Promise<void>;
  /** Fetches the list of company employees */
  fetchEmployees: () => Promise<void>;
}
