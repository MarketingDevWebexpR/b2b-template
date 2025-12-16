/**
 * Company Selectors
 *
 * Selector functions for extracting and deriving data from company state.
 * All selectors are pure functions that can be used with any state management library.
 *
 * @packageDocumentation
 */

import type { Company, Employee, EmployeeSummary, EmployeePermission } from "@maison/types";
import type { RootState, CompanyState, LoadingStatus } from "../types/state";
import {
  createSelector,
  createDerivedSelector,
  createDerivedShallowSelector,
  createParameterizedSelector,
} from "../utils/memoize";

// ============================================
// Base Selectors
// ============================================

/**
 * Selects the entire company state slice.
 *
 * @param state - Root state
 * @returns Company state
 */
export function selectCompanyState(state: RootState): CompanyState {
  return state.company;
}

/**
 * Selects the current company.
 *
 * @param state - Root state
 * @returns Current company or null if not set
 */
export function selectCurrentCompany(state: RootState): Company | null {
  return state.company.currentCompany;
}

/**
 * Selects the current employee.
 *
 * @param state - Root state
 * @returns Current employee or null if not set
 */
export function selectCurrentEmployee(state: RootState): Employee | null {
  return state.company.currentEmployee;
}

/**
 * Selects the list of company employees.
 *
 * @param state - Root state
 * @returns Array of employee summaries
 */
export function selectEmployees(state: RootState): readonly EmployeeSummary[] {
  return state.company.employees;
}

// ============================================
// Status Selectors
// ============================================

/**
 * Selects whether B2B mode is active.
 * B2B mode is active when both company and employee are set.
 *
 * @param state - Root state
 * @returns True if B2B mode is active
 */
export function selectIsB2BActive(state: RootState): boolean {
  return state.company.isB2BActive;
}

/**
 * Selects the company loading status.
 *
 * @param state - Root state
 * @returns Loading status
 */
export function selectCompanyStatus(state: RootState): LoadingStatus {
  return state.company.status;
}

/**
 * Selects whether company is currently loading.
 *
 * @param state - Root state
 * @returns True if loading
 */
export function selectIsCompanyLoading(state: RootState): boolean {
  return state.company.status === "loading";
}

/**
 * Selects the company error message.
 *
 * @param state - Root state
 * @returns Error message or null
 */
export function selectCompanyError(state: RootState): string | null {
  return state.company.error;
}

/**
 * Selects the last refresh timestamp.
 *
 * @param state - Root state
 * @returns ISO timestamp or null
 */
export function selectCompanyLastRefreshed(state: RootState): string | null {
  return state.company.lastRefreshedAt;
}

// ============================================
// Derived Selectors - Company
// ============================================

/**
 * Selects the current company ID.
 *
 * @param state - Root state
 * @returns Company ID or null
 */
export function selectCurrentCompanyId(state: RootState): string | null {
  return state.company.currentCompany?.id ?? null;
}

/**
 * Selects the current company name.
 *
 * @param state - Root state
 * @returns Company name or null
 */
export function selectCurrentCompanyName(state: RootState): string | null {
  return state.company.currentCompany?.name ?? null;
}

/**
 * Selects the current company tier.
 *
 * @param state - Root state
 * @returns Company tier or null
 */
export function selectCurrentCompanyTier(
  state: RootState
): Company["tier"] | null {
  return state.company.currentCompany?.tier ?? null;
}

/**
 * Selects the current company's available credit.
 *
 * @param state - Root state
 * @returns Available credit amount or 0
 */
export function selectCompanyAvailableCredit(state: RootState): number {
  return state.company.currentCompany?.creditAvailable ?? 0;
}

/**
 * Selects the current company's credit limit.
 *
 * @param state - Root state
 * @returns Credit limit or 0
 */
export function selectCompanyCreditLimit(state: RootState): number {
  return state.company.currentCompany?.creditLimit ?? 0;
}

/**
 * Selects the current company's credit usage percentage.
 *
 * @param state - Root state
 * @returns Credit usage percentage (0-100) or 0
 */
export function selectCompanyCreditUsagePercent(state: RootState): number {
  const company = state.company.currentCompany;
  if (company === null || company.creditLimit === 0) {
    return 0;
  }
  return Math.round((company.creditUsed / company.creditLimit) * 100);
}

/**
 * Selects the current company's payment terms.
 *
 * @param state - Root state
 * @returns Payment terms or null
 */
export function selectCompanyPaymentTerms(
  state: RootState
): Company["paymentTerms"] | null {
  return state.company.currentCompany?.paymentTerms ?? null;
}

/**
 * Selects the current company's addresses.
 *
 * @param state - Root state
 * @returns Array of company addresses
 */
export function selectCompanyAddresses(
  state: RootState
): Company["addresses"] {
  return state.company.currentCompany?.addresses ?? [];
}

/**
 * Selects the default shipping address ID.
 *
 * @param state - Root state
 * @returns Default shipping address ID or null
 */
export function selectDefaultShippingAddressId(
  state: RootState
): string | null {
  return state.company.currentCompany?.defaultShippingAddressId ?? null;
}

/**
 * Selects the default billing address ID.
 *
 * @param state - Root state
 * @returns Default billing address ID or null
 */
export function selectDefaultBillingAddressId(state: RootState): string | null {
  return state.company.currentCompany?.defaultBillingAddressId ?? null;
}

// ============================================
// Derived Selectors - Employee
// ============================================

/**
 * Selects the current employee ID.
 *
 * @param state - Root state
 * @returns Employee ID or null
 */
export function selectCurrentEmployeeId(state: RootState): string | null {
  return state.company.currentEmployee?.id ?? null;
}

/**
 * Selects the current employee's full name.
 *
 * @param state - Root state
 * @returns Full name or null
 */
export function selectCurrentEmployeeName(state: RootState): string | null {
  return state.company.currentEmployee?.fullName ?? null;
}

/**
 * Selects the current employee's role.
 *
 * @param state - Root state
 * @returns Employee role or null
 */
export function selectCurrentEmployeeRole(
  state: RootState
): Employee["role"] | null {
  return state.company.currentEmployee?.role ?? null;
}

/**
 * Selects the current employee's permissions.
 *
 * @param state - Root state
 * @returns Array of permissions
 */
export function selectCurrentEmployeePermissions(
  state: RootState
): readonly EmployeePermission[] {
  return state.company.currentEmployee?.permissions ?? [];
}

/**
 * Checks if the current employee has a specific permission.
 *
 * @param state - Root state
 * @param permission - Permission to check
 * @returns True if employee has the permission
 */
export function selectHasPermission(
  state: RootState,
  permission: EmployeePermission
): boolean {
  const employee = state.company.currentEmployee;
  if (employee === null) {
    return false;
  }

  // Admin has all permissions
  if (employee.permissions.includes("admin.full_access")) {
    return true;
  }

  return employee.permissions.includes(permission);
}

/**
 * Checks if the current employee is an approver.
 *
 * @param state - Root state
 * @returns True if employee can approve requests
 */
export function selectIsApprover(state: RootState): boolean {
  return state.company.currentEmployee?.isApprover ?? false;
}

/**
 * Selects the current employee's approval limit.
 *
 * @param state - Root state
 * @returns Approval limit or null (unlimited)
 */
export function selectEmployeeApprovalLimit(state: RootState): number | null {
  return state.company.currentEmployee?.approvalLimit ?? null;
}

/**
 * Selects the current employee's spending limits.
 * Memoized to prevent unnecessary re-renders - returns same object reference
 * when employee hasn't changed.
 *
 * @param state - Root state
 * @returns Object with spending limit values
 */
export const selectEmployeeSpendingLimits = createDerivedShallowSelector(
  [selectCurrentEmployee],
  (employee): {
    readonly perOrder: number | null;
    readonly daily: number | null;
    readonly weekly: number | null;
    readonly monthly: number | null;
  } => ({
    perOrder: employee?.spendingLimitPerOrder ?? null,
    daily: employee?.spendingLimitDaily ?? null,
    weekly: employee?.spendingLimitWeekly ?? null,
    monthly: employee?.spendingLimitMonthly ?? null,
  })
);

/**
 * Selects the current employee's current spending values.
 * Memoized to prevent unnecessary re-renders - returns same object reference
 * when employee hasn't changed.
 *
 * @param state - Root state
 * @returns Object with current spending values
 */
export const selectEmployeeCurrentSpending = createDerivedShallowSelector(
  [selectCurrentEmployee],
  (employee): {
    readonly daily: number;
    readonly weekly: number;
    readonly monthly: number;
  } => ({
    daily: employee?.currentDailySpending ?? 0,
    weekly: employee?.currentWeeklySpending ?? 0,
    monthly: employee?.currentMonthlySpending ?? 0,
  })
);

// ============================================
// Employee List Selectors
// ============================================

/**
 * Selects an employee by ID from the employees list.
 * Memoized with parameter caching.
 *
 * @param state - Root state
 * @param employeeId - Employee ID to find
 * @returns Employee summary or undefined
 */
export const selectEmployeeById = createParameterizedSelector(
  (state: RootState, employeeId: string): EmployeeSummary | undefined =>
    state.company.employees.find((e) => e.id === employeeId)
);

/**
 * Selects employees who are approvers.
 * Memoized to prevent creating new arrays on every call.
 *
 * @param state - Root state
 * @returns Array of approver employee summaries
 */
export const selectApproverEmployees = createDerivedSelector(
  [selectEmployees],
  (employees): readonly EmployeeSummary[] =>
    employees.filter((e) => e.isApprover)
);

/**
 * Selects the count of employees.
 *
 * @param state - Root state
 * @returns Number of employees
 */
export function selectEmployeeCount(state: RootState): number {
  return state.company.employees.length;
}

// ============================================
// Compound Selectors
// ============================================

/**
 * Selects whether the current user can create orders.
 *
 * @param state - Root state
 * @returns True if user can create orders
 */
export function selectCanCreateOrders(state: RootState): boolean {
  const company = state.company.currentCompany;
  const employee = state.company.currentEmployee;

  if (company === null || employee === null) {
    return false;
  }

  // Company must be active
  if (company.status !== "active") {
    return false;
  }

  // Check permission
  return selectHasPermission(state, "orders.create");
}

/**
 * Selects whether the current user can create quotes.
 *
 * @param state - Root state
 * @returns True if user can create quotes
 */
export function selectCanCreateQuotes(state: RootState): boolean {
  const company = state.company.currentCompany;
  const employee = state.company.currentEmployee;

  if (company === null || employee === null) {
    return false;
  }

  if (company.status !== "active") {
    return false;
  }

  return selectHasPermission(state, "quotes.create");
}

/**
 * Selects whether the current user can approve orders.
 *
 * @param state - Root state
 * @returns True if user can approve orders
 */
export function selectCanApproveOrders(state: RootState): boolean {
  const employee = state.company.currentEmployee;

  if (employee === null) {
    return false;
  }

  return (
    employee.isApprover && selectHasPermission(state, "approvals.approve")
  );
}

/**
 * Selects whether the current user needs approval for orders.
 *
 * @param state - Root state
 * @returns True if orders require approval
 */
export function selectRequiresOrderApproval(state: RootState): boolean {
  return (
    state.company.currentCompany?.settings.requireOrderApproval ?? false
  );
}
