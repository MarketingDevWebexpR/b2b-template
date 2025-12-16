'use client';

/**
 * Employee Context
 *
 * Manages employee data, permissions, and spending limits for B2B functionality.
 * Handles role-based access control and spending tracking.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Employee, EmployeePermission, EmployeeRole } from '@maison/types';

// ============================================================================
// Mock Data
// ============================================================================

const mockEmployee: Employee = {
  id: 'emp_001',
  userId: 'user_001',
  companyId: 'comp_001',
  firstName: 'Marie',
  lastName: 'Dupont',
  fullName: 'Marie Dupont',
  email: 'marie.dupont@bijouterie-parisienne.fr',
  jobTitle: 'Responsable Achats',
  role: 'admin',
  permissions: [
    'orders.create',
    'orders.approve',
    'quotes.create',
    'quotes.view',
    'spending.view_reports',
    'company.manage_employees',
    'company.edit',
  ],
  spendingLimitPerOrder: 5000,
  spendingLimitDaily: 10000,
  spendingLimitMonthly: 50000,
  currentDailySpending: 450,
  currentWeeklySpending: 2800,
  currentMonthlySpending: 8500,
  status: 'active',
  isApprover: true,
  canApproveFor: ['emp_002', 'emp_003'],
  notificationPreference: 'email',
  createdAt: '2024-01-20T09:00:00Z',
  updatedAt: '2024-11-15T14:30:00Z',
};

const mockEmployeesList: Employee[] = [
  mockEmployee,
  {
    id: 'emp_002',
    userId: 'user_002',
    companyId: 'comp_001',
    firstName: 'Pierre',
    lastName: 'Martin',
    fullName: 'Pierre Martin',
    email: 'pierre.martin@bijouterie-parisienne.fr',
    jobTitle: 'Acheteur',
    role: 'purchaser',
    permissions: ['orders.create', 'quotes.create', 'quotes.view'],
    spendingLimitPerOrder: 2000,
    spendingLimitDaily: 5000,
    spendingLimitMonthly: 20000,
    currentDailySpending: 800,
    currentWeeklySpending: 3200,
    currentMonthlySpending: 12000,
    status: 'active',
    isApprover: false,
    canApproveFor: [],
    notificationPreference: 'email',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-10-20T16:45:00Z',
  },
  {
    id: 'emp_003',
    userId: 'user_003',
    companyId: 'comp_001',
    firstName: 'Sophie',
    lastName: 'Bernard',
    fullName: 'Sophie Bernard',
    email: 'sophie.bernard@bijouterie-parisienne.fr',
    jobTitle: 'Comptable',
    role: 'viewer',
    permissions: ['spending.view_reports'],
    currentDailySpending: 0,
    currentWeeklySpending: 0,
    currentMonthlySpending: 0,
    status: 'active',
    isApprover: false,
    canApproveFor: [],
    notificationPreference: 'email',
    createdAt: '2024-03-05T11:00:00Z',
    updatedAt: '2024-09-15T09:20:00Z',
  },
];

// ============================================================================
// Types
// ============================================================================

/**
 * B2B actions that can be checked for permissions
 */
export type B2BAction =
  | 'create_quote'
  | 'approve_order'
  | 'manage_employees'
  | 'view_spending'
  | 'edit_company'
  | 'place_order'
  | 'view_prices'
  | 'view_stock'
  | 'request_quote'
  | 'bulk_order';

/**
 * Spending summary for current employee
 */
export interface SpendingSummary {
  /** Total spent this month */
  monthlySpent: number;
  /** Monthly spending limit */
  monthlyLimit: number;
  /** Remaining monthly budget */
  monthlyRemaining: number;
  /** Total spent today */
  dailySpent: number;
  /** Daily spending limit */
  dailyLimit: number;
  /** Remaining daily budget */
  dailyRemaining: number;
  /** Total spent this week */
  weeklySpent: number;
  /** Per-order limit */
  orderLimit: number;
  /** Utilization percentage */
  utilizationPercent: number;
}

/**
 * Employee context value
 */
export interface EmployeeContextValue {
  /** Current employee data */
  employee: Employee | null;
  /** All employees in the company */
  employees: Employee[];
  /** Whether employee data is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Current employee's role */
  role: EmployeeRole | null;
  /** Current employee's permissions */
  permissions: EmployeePermission[];
  /** Whether current employee is an approver */
  isApprover: boolean;
  /** Spending summary */
  spendingSummary: SpendingSummary | null;
  /** Check if employee can perform an action */
  canPerform: (action: B2BAction) => boolean;
  /** Check if employee has a specific permission */
  hasPermission: (permission: EmployeePermission) => boolean;
  /** Refresh employee data */
  refreshEmployee: () => Promise<void>;
  /** Refresh all employees list */
  refreshEmployees: () => Promise<void>;
  /** Check spending limit for an amount */
  checkSpendingLimit: (amount: number) => { allowed: boolean; reason?: string };
  /** Get employee by ID */
  getEmployeeById: (id: string) => Employee | undefined;
  /** Check if current employee can approve for another employee */
  canApproveForEmployee: (employeeId: string) => boolean;
}

// ============================================================================
// Context
// ============================================================================

const EmployeeContext = createContext<EmployeeContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface EmployeeProviderProps {
  children: React.ReactNode;
  /** Company ID for fetching employees */
  companyId?: string;
  /** Initial employee ID to load */
  initialEmployeeId?: string;
  /** Enable mock mode for development */
  mockMode?: boolean;
}

// ============================================================================
// Provider
// ============================================================================

/**
 * Employee Provider
 *
 * Provides employee data and permission checking to the application.
 */
export function EmployeeProvider({
  children,
  companyId,
  initialEmployeeId,
  mockMode = true,
}: EmployeeProviderProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize employee data
  useEffect(() => {
    const initEmployee = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setEmployee(mockEmployee);
          setEmployees(mockEmployeesList);
        } else {
          // TODO: Fetch from API
          setEmployee(mockEmployee);
          setEmployees(mockEmployeesList);
        }
      } catch (err) {
        console.error('Failed to load employee:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    initEmployee();
  }, [companyId, initialEmployeeId, mockMode]);

  // Derived state: role
  const role = employee?.role ?? null;

  // Derived state: permissions
  const permissions = useMemo<EmployeePermission[]>(
    () => (employee?.permissions as EmployeePermission[]) ?? [],
    [employee]
  );

  // Derived state: is approver
  const isApprover = employee?.isApprover ?? false;

  // Derived state: spending summary
  const spendingSummary = useMemo<SpendingSummary | null>(() => {
    if (!employee) return null;

    const monthlyLimit = employee.spendingLimitMonthly ?? 0;
    const monthlySpent = employee.currentMonthlySpending ?? 0;
    const dailyLimit = employee.spendingLimitDaily ?? 0;
    const dailySpent = employee.currentDailySpending ?? 0;

    return {
      monthlySpent,
      monthlyLimit,
      monthlyRemaining: Math.max(0, monthlyLimit - monthlySpent),
      dailySpent,
      dailyLimit,
      dailyRemaining: Math.max(0, dailyLimit - dailySpent),
      weeklySpent: employee.currentWeeklySpending ?? 0,
      orderLimit: employee.spendingLimitPerOrder ?? 0,
      utilizationPercent: monthlyLimit > 0 ? Math.round((monthlySpent / monthlyLimit) * 100) : 0,
    };
  }, [employee]);

  // Check if employee has a specific permission
  const hasPermission = useCallback(
    (permission: EmployeePermission): boolean => {
      if (!employee) return false;
      // Owner and admin have all permissions
      if (employee.role === 'owner' || employee.role === 'admin') return true;
      return permissions.includes(permission);
    },
    [employee, permissions]
  );

  // Check if employee can perform an action
  const canPerform = useCallback(
    (action: B2BAction): boolean => {
      if (!employee) return false;

      // Owner and admin can do everything
      if (employee.role === 'owner' || employee.role === 'admin') return true;

      switch (action) {
        case 'create_quote':
        case 'request_quote':
          return hasPermission('quotes.create') || employee.role === 'purchaser';

        case 'approve_order':
          return hasPermission('orders.approve') || employee.role === 'manager' || isApprover;

        case 'manage_employees':
          return hasPermission('company.manage_employees');

        case 'view_spending':
          return hasPermission('spending.view_reports') || employee.role !== 'viewer';

        case 'edit_company':
          return hasPermission('company.edit');

        case 'place_order':
        case 'bulk_order':
          return hasPermission('orders.create') || employee.role === 'purchaser' || employee.role === 'manager';

        case 'view_prices':
        case 'view_stock':
          return employee.role !== 'viewer' || hasPermission('orders.view');

        default:
          return false;
      }
    },
    [employee, hasPermission, isApprover]
  );

  // Check spending limit for an amount
  const checkSpendingLimit = useCallback(
    (amount: number): { allowed: boolean; reason?: string } => {
      if (!employee || !spendingSummary) {
        return { allowed: false, reason: 'Employe non connecte' };
      }

      // Check per-order limit
      if (spendingSummary.orderLimit > 0 && amount > spendingSummary.orderLimit) {
        return {
          allowed: false,
          reason: `Montant depasse la limite par commande (${spendingSummary.orderLimit.toFixed(2)} EUR)`,
        };
      }

      // Check daily limit
      if (spendingSummary.dailyLimit > 0 && spendingSummary.dailySpent + amount > spendingSummary.dailyLimit) {
        return {
          allowed: false,
          reason: `Montant depasse la limite journaliere (${spendingSummary.dailyRemaining.toFixed(2)} EUR restants)`,
        };
      }

      // Check monthly limit
      if (spendingSummary.monthlyLimit > 0 && spendingSummary.monthlySpent + amount > spendingSummary.monthlyLimit) {
        return {
          allowed: false,
          reason: `Montant depasse la limite mensuelle (${spendingSummary.monthlyRemaining.toFixed(2)} EUR restants)`,
        };
      }

      return { allowed: true };
    },
    [employee, spendingSummary]
  );

  // Get employee by ID
  const getEmployeeById = useCallback(
    (id: string): Employee | undefined => {
      return employees.find((e) => e.id === id);
    },
    [employees]
  );

  // Check if can approve for employee
  const canApproveForEmployee = useCallback(
    (employeeId: string): boolean => {
      if (!employee) return false;
      if (employee.role === 'owner' || employee.role === 'admin') return true;
      return employee.canApproveFor?.includes(employeeId) ?? false;
    },
    [employee]
  );

  // Refresh employee data
  const refreshEmployee = useCallback(async () => {
    if (!employee) return;
    setIsLoading(true);
    try {
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else {
        // TODO: Fetch from API
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [employee, mockMode]);

  // Refresh employees list
  const refreshEmployees = useCallback(async () => {
    if (!companyId && !employee?.companyId) return;
    setIsLoading(true);
    try {
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setEmployees(mockEmployeesList);
      } else {
        // TODO: Fetch from API
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [companyId, employee?.companyId, mockMode]);

  // Memoize context value
  const value = useMemo<EmployeeContextValue>(
    () => ({
      employee,
      employees,
      isLoading,
      error,
      role,
      permissions,
      isApprover,
      spendingSummary,
      canPerform,
      hasPermission,
      refreshEmployee,
      refreshEmployees,
      checkSpendingLimit,
      getEmployeeById,
      canApproveForEmployee,
    }),
    [
      employee,
      employees,
      isLoading,
      error,
      role,
      permissions,
      isApprover,
      spendingSummary,
      canPerform,
      hasPermission,
      refreshEmployee,
      refreshEmployees,
      checkSpendingLimit,
      getEmployeeById,
      canApproveForEmployee,
    ]
  );

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access employee context
 *
 * @throws Error if used outside of EmployeeProvider
 */
export function useEmployee(): EmployeeContextValue {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
}

/**
 * Hook for permission checking
 */
export function usePermissions() {
  const { canPerform, hasPermission, role, permissions, isApprover } = useEmployee();
  return { canPerform, hasPermission, role, permissions, isApprover };
}

/**
 * Hook for spending limits
 */
export function useSpendingLimits() {
  const { spendingSummary, checkSpendingLimit } = useEmployee();
  return { spendingSummary, checkSpendingLimit };
}

/**
 * Hook for common permission checks
 */
export function useB2BPermissions(): {
  canCreateQuote: boolean;
  canApproveOrders: boolean;
  canManageEmployees: boolean;
  canViewSpending: boolean;
  canEditCompany: boolean;
  canPlaceOrder: boolean;
  canBulkOrder: boolean;
} {
  const { canPerform } = useEmployee();

  return useMemo(
    () => ({
      canCreateQuote: canPerform('create_quote'),
      canApproveOrders: canPerform('approve_order'),
      canManageEmployees: canPerform('manage_employees'),
      canViewSpending: canPerform('view_spending'),
      canEditCompany: canPerform('edit_company'),
      canPlaceOrder: canPerform('place_order'),
      canBulkOrder: canPerform('bulk_order'),
    }),
    [canPerform]
  );
}

export default EmployeeProvider;
