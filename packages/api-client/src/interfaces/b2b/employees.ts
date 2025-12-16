/**
 * B2B Employee Service Interface
 * Defines the contract for employee-related operations in B2B context.
 */

import type {
  Employee,
  EmployeeSummary,
  EmployeeRole,
  EmployeeStatus,
  EmployeePermission,
  EmployeeInvitation,
  EmployeeActivity,
  Department,
  InviteEmployeeInput,
  UpdateEmployeeInput,
} from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";

/**
 * Options for listing employees
 */
export interface ListEmployeesOptions {
  /** Page number */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Filter by company ID */
  companyId?: string;
  /** Filter by status */
  status?: EmployeeStatus | EmployeeStatus[];
  /** Filter by role */
  role?: EmployeeRole | EmployeeRole[];
  /** Filter by department */
  departmentId?: string;
  /** Filter approvers only */
  isApprover?: boolean;
  /** Search by name or email */
  search?: string;
  /** Sort field */
  sortBy?: "fullName" | "email" | "role" | "createdAt" | "lastLoginAt";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Employee login result
 */
export interface EmployeeLoginResult {
  /** Authenticated employee */
  employee: Employee;
  /** Company details */
  company: {
    id: string;
    name: string;
    status: string;
  };
  /** Access token */
  accessToken: string;
  /** Refresh token */
  refreshToken?: string;
  /** Token expiry */
  expiresAt: string;
  /** Permissions */
  permissions: EmployeePermission[];
}

/**
 * Interface for B2B employee operations.
 * All adapters must implement this interface.
 */
export interface IEmployeeService {
  /**
   * List employees with optional filtering.
   *
   * @param options - Listing options
   * @returns Paginated list of employees
   *
   * @example
   * ```typescript
   * const employees = await api.b2b.employees.list({
   *   companyId: "comp_123",
   *   status: "active",
   *   role: ["admin", "manager"]
   * });
   * ```
   */
  list(options?: ListEmployeesOptions): Promise<PaginatedResponse<EmployeeSummary>>;

  /**
   * Get an employee by ID.
   *
   * @param id - Employee ID
   * @returns Full employee details
   */
  get(id: string): Promise<Employee>;

  /**
   * Get the current authenticated employee.
   *
   * @returns Current employee
   */
  getCurrent(): Promise<Employee>;

  /**
   * Invite a new employee to the company.
   *
   * @param companyId - Company ID
   * @param input - Invitation data
   * @returns Created invitation
   *
   * @example
   * ```typescript
   * const invitation = await api.b2b.employees.invite("comp_123", {
   *   email: "jane@company.com",
   *   firstName: "Jane",
   *   lastName: "Smith",
   *   role: "purchaser",
   *   spendingLimitMonthly: 5000
   * });
   * ```
   */
  invite(companyId: string, input: InviteEmployeeInput): Promise<EmployeeInvitation>;

  /**
   * Resend an invitation.
   *
   * @param invitationId - Invitation ID
   * @returns Updated invitation
   */
  resendInvitation(invitationId: string): Promise<EmployeeInvitation>;

  /**
   * Cancel an invitation.
   *
   * @param invitationId - Invitation ID
   */
  cancelInvitation(invitationId: string): Promise<void>;

  /**
   * Accept an invitation.
   *
   * @param token - Invitation token
   * @param password - Password for the new account
   * @returns Login result
   */
  acceptInvitation(token: string, password: string): Promise<EmployeeLoginResult>;

  /**
   * List pending invitations.
   *
   * @param companyId - Company ID
   * @returns Array of pending invitations
   */
  listInvitations(companyId: string): Promise<EmployeeInvitation[]>;

  /**
   * Update an employee.
   *
   * @param id - Employee ID
   * @param input - Update data
   * @returns Updated employee
   */
  update(id: string, input: UpdateEmployeeInput): Promise<Employee>;

  /**
   * Update employee status.
   *
   * @param id - Employee ID
   * @param status - New status
   * @param reason - Reason (required for suspension)
   * @returns Updated employee
   */
  updateStatus(
    id: string,
    status: EmployeeStatus,
    reason?: string
  ): Promise<Employee>;

  /**
   * Update employee role.
   *
   * @param id - Employee ID
   * @param role - New role
   * @param customPermissions - Custom permissions (for custom role)
   * @returns Updated employee
   */
  updateRole(
    id: string,
    role: EmployeeRole,
    customPermissions?: EmployeePermission[]
  ): Promise<Employee>;

  /**
   * Update employee permissions.
   *
   * @param id - Employee ID
   * @param permissions - New permissions
   * @returns Updated employee
   */
  updatePermissions(id: string, permissions: EmployeePermission[]): Promise<Employee>;

  /**
   * Update spending limits.
   *
   * @param id - Employee ID
   * @param limits - New limits
   * @returns Updated employee
   */
  updateSpendingLimits(
    id: string,
    limits: {
      perOrder?: number;
      daily?: number;
      weekly?: number;
      monthly?: number;
    }
  ): Promise<Employee>;

  /**
   * Reset spending counters.
   *
   * @param id - Employee ID
   * @param period - Period to reset
   * @returns Updated employee
   */
  resetSpending(
    id: string,
    period: "daily" | "weekly" | "monthly" | "all"
  ): Promise<Employee>;

  /**
   * Get employee permissions.
   *
   * @param id - Employee ID
   * @returns Array of effective permissions
   */
  getPermissions(id: string): Promise<EmployeePermission[]>;

  /**
   * Check if employee has specific permission.
   *
   * @param id - Employee ID
   * @param permission - Permission to check
   * @returns Whether employee has permission
   */
  hasPermission(id: string, permission: EmployeePermission): Promise<boolean>;

  /**
   * Employee login.
   *
   * @param email - Email address
   * @param password - Password
   * @returns Login result
   */
  login(email: string, password: string): Promise<EmployeeLoginResult>;

  /**
   * Employee logout.
   */
  logout(): Promise<void>;

  /**
   * Refresh employee token.
   *
   * @param refreshToken - Refresh token
   * @returns New login result
   */
  refreshToken(refreshToken: string): Promise<EmployeeLoginResult>;

  /**
   * Change password.
   *
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;

  /**
   * Request password reset.
   *
   * @param email - Employee email
   */
  requestPasswordReset(email: string): Promise<void>;

  /**
   * Reset password with token.
   *
   * @param token - Reset token
   * @param newPassword - New password
   */
  resetPassword(token: string, newPassword: string): Promise<void>;

  // Activity

  /**
   * Get employee activity log.
   *
   * @param id - Employee ID
   * @param options - Pagination options
   * @returns Paginated activity entries
   */
  getActivity(
    id: string,
    options?: { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<EmployeeActivity>>;

  // Departments

  /**
   * List departments.
   *
   * @param companyId - Company ID
   * @returns Array of departments
   */
  listDepartments(companyId: string): Promise<Department[]>;

  /**
   * Create a department.
   *
   * @param companyId - Company ID
   * @param input - Department data
   * @returns Created department
   */
  createDepartment(
    companyId: string,
    input: Omit<Department, "id" | "companyId" | "createdAt" | "updatedAt">
  ): Promise<Department>;

  /**
   * Update a department.
   *
   * @param departmentId - Department ID
   * @param input - Update data
   * @returns Updated department
   */
  updateDepartment(
    departmentId: string,
    input: Partial<Omit<Department, "id" | "companyId" | "createdAt" | "updatedAt">>
  ): Promise<Department>;

  /**
   * Delete a department.
   *
   * @param departmentId - Department ID
   */
  deleteDepartment(departmentId: string): Promise<void>;

  /**
   * Get employees in a department.
   *
   * @param departmentId - Department ID
   * @returns Array of employees
   */
  getByDepartment(departmentId: string): Promise<EmployeeSummary[]>;

  /**
   * Delete an employee.
   *
   * @param id - Employee ID
   */
  delete(id: string): Promise<void>;
}
