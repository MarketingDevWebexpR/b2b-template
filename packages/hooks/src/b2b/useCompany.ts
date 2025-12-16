/**
 * Company Hook
 *
 * Provides access to the current B2B company context and company data.
 */

import { useState, useEffect, useCallback } from "react";
import type { Company, Employee } from "@maison/types";
import type { ICommerceClient } from "@maison/api-client";

/**
 * Company state
 */
export interface CompanyState {
  /** Current company */
  company: Company | null;
  /** Current employee */
  employee: Employee | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Whether B2B context is active */
  isB2BActive: boolean;
}

/**
 * Company hook options
 */
export interface UseCompanyOptions {
  /** Company ID to fetch (optional, uses context if not provided) */
  companyId?: string;
  /** Whether to fetch employees */
  includeEmployees?: boolean;
  /** Auto-refresh interval in ms */
  refreshInterval?: number;
}

/**
 * Company hook result
 */
export interface UseCompanyResult extends CompanyState {
  /** Set the active company */
  setCompany: (companyId: string) => Promise<void>;
  /** Clear the company context */
  clearCompany: () => void;
  /** Refresh company data */
  refresh: () => Promise<void>;
  /** List employees (if B2B enabled) */
  employees: Employee[];
  /** Check if current user can perform an action */
  canPerform: (action: B2BAction) => boolean;
}

/**
 * B2B actions that can be checked for permissions
 */
export type B2BAction =
  | "create_quote"
  | "approve_order"
  | "manage_employees"
  | "view_spending"
  | "edit_company"
  | "place_order";

/**
 * Hook for managing B2B company context
 *
 * @param api - API client instance
 * @param options - Hook options
 * @returns Company state and actions
 *
 * @example
 * ```typescript
 * const { company, employee, isB2BActive, setCompany, canPerform } = useCompany(api);
 *
 * if (isB2BActive && canPerform('create_quote')) {
 *   // Show quote creation UI
 * }
 * ```
 */
export function useCompany(
  api: ICommerceClient,
  options: UseCompanyOptions = {}
): UseCompanyResult {
  const { companyId, includeEmployees = false, refreshInterval } = options;

  const [state, setState] = useState<CompanyState>({
    company: null,
    employee: null,
    isLoading: false,
    error: null,
    isB2BActive: false,
  });

  const [employees, setEmployees] = useState<Employee[]>([]);

  const fetchCompany = useCallback(
    async (id?: string) => {
      const targetId = id ?? companyId;
      if (!targetId || !api?.b2b?.companies) {
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const company = await api.b2b.companies.get(targetId);
        const b2bContext = api.getB2BContext?.();

        let employee: Employee | null = null;
        if (b2bContext?.employeeId) {
          try {
            employee = await api.b2b.employees.get(b2bContext.employeeId);
          } catch {
            // Employee not found, continue without
          }
        }

        if (includeEmployees) {
          const employeeList = await api.b2b.employees.list(targetId);
          setEmployees(employeeList);
        }

        setState({
          company,
          employee,
          isLoading: false,
          error: null,
          isB2BActive: true,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    },
    [api, companyId, includeEmployees]
  );

  const setCompany = useCallback(
    async (newCompanyId: string) => {
      api?.setB2BContext?.(newCompanyId);
      await fetchCompany(newCompanyId);
    },
    [api, fetchCompany]
  );

  const clearCompany = useCallback(() => {
    api?.clearB2BContext?.();
    setState({
      company: null,
      employee: null,
      isLoading: false,
      error: null,
      isB2BActive: false,
    });
    setEmployees([]);
  }, [api]);

  const refresh = useCallback(async () => {
    const context = api?.getB2BContext?.();
    if (context?.companyId) {
      await fetchCompany(context.companyId);
    }
  }, [api, fetchCompany]);

  const canPerform = useCallback(
    (action: B2BAction): boolean => {
      if (!state.isB2BActive || !state.employee) {
        return false;
      }

      const permissions = state.employee.permissions ?? [];
      const role = state.employee.role;

      // Owner and admin can do everything
      if (role === "owner" || role === "admin") {
        return true;
      }

      // Check specific permissions based on the actual EmployeePermission types
      switch (action) {
        case "create_quote":
          return permissions.includes("quotes.create") || role === "purchaser";
        case "approve_order":
          return permissions.includes("orders.approve") || role === "manager";
        case "manage_employees":
          return permissions.includes("company.manage_employees");
        case "view_spending":
          return permissions.includes("spending.view_reports") || role !== "viewer";
        case "edit_company":
          return permissions.includes("company.edit");
        case "place_order":
          return permissions.includes("orders.create") || role === "purchaser" || role === "manager";
        default:
          return false;
      }
    },
    [state.isB2BActive, state.employee]
  );

  // Initial fetch
  useEffect(() => {
    const context = api?.getB2BContext?.();
    if (context?.companyId || companyId) {
      fetchCompany(context?.companyId ?? companyId);
    }
  }, [api, companyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval || !state.isB2BActive) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, state.isB2BActive, refresh]);

  return {
    ...state,
    employees,
    setCompany,
    clearCompany,
    refresh,
    canPerform,
  };
}
