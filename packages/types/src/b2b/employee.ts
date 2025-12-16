/**
 * B2B Employee Types
 * Defines employee entities, roles, and permissions for B2B company management.
 */

// ============================================
// Employee Permissions
// ============================================

/**
 * Granular permissions for B2B employees.
 */
export type EmployeePermission =
  // Order permissions
  | 'orders.create'           // Can create orders
  | 'orders.view'             // Can view orders
  | 'orders.view_all'         // Can view all company orders
  | 'orders.cancel'           // Can cancel orders
  | 'orders.approve'          // Can approve orders
  | 'orders.bulk_create'      // Can create bulk orders

  // Quote permissions
  | 'quotes.create'           // Can create quotes
  | 'quotes.view'             // Can view quotes
  | 'quotes.view_all'         // Can view all company quotes
  | 'quotes.accept'           // Can accept quotes
  | 'quotes.reject'           // Can reject quotes
  | 'quotes.negotiate'        // Can negotiate quote terms

  // Product permissions
  | 'products.view'           // Can view products
  | 'products.view_prices'    // Can view product prices
  | 'products.view_stock'     // Can view stock levels

  // Spending permissions
  | 'spending.unlimited'      // No spending limits
  | 'spending.view_reports'   // Can view spending reports

  // Company management
  | 'company.view'            // Can view company details
  | 'company.edit'            // Can edit company details
  | 'company.manage_employees' // Can manage employees
  | 'company.manage_addresses' // Can manage addresses
  | 'company.view_credit'     // Can view credit information
  | 'company.view_invoices'   // Can view invoices

  // Approval permissions
  | 'approvals.view'          // Can view approval requests
  | 'approvals.approve'       // Can approve requests
  | 'approvals.delegate'      // Can delegate approval authority

  // Admin permissions
  | 'admin.full_access';      // Full administrative access

/**
 * Permission group for common use cases.
 */
export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: EmployeePermission[];
}

// ============================================
// Employee Roles
// ============================================

/**
 * Predefined employee roles.
 */
export type EmployeeRole =
  | 'owner'           // Company owner - full access
  | 'admin'           // Administrator - most permissions
  | 'manager'         // Manager - can approve and manage
  | 'purchaser'       // Purchaser - can create orders
  | 'viewer'          // Viewer - read-only access
  | 'custom';         // Custom role with specific permissions

/**
 * Role configuration with default permissions.
 */
export interface RoleConfig {
  role: EmployeeRole;
  displayName: string;
  description: string;
  defaultPermissions: EmployeePermission[];
  /** Whether this role can be deleted */
  isSystemRole: boolean;
  /** Whether users with this role can manage other users */
  canManageUsers: boolean;
  /** Maximum spending limit for this role (0 = unlimited) */
  maxSpendingLimit: number;
}

// ============================================
// Employee Status
// ============================================

/**
 * Employee account status.
 */
export type EmployeeStatus =
  | 'pending'     // Invitation sent, not yet accepted
  | 'active'      // Active employee
  | 'suspended'   // Temporarily suspended
  | 'inactive';   // Deactivated

// ============================================
// Employee Department
// ============================================

/**
 * Department within a company.
 */
export interface Department {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  costCenter?: string;
  managerId?: string;
  parentDepartmentId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Employee
// ============================================

/**
 * B2B Employee entity.
 * Represents a user within a company with specific roles and permissions.
 */
export interface Employee {
  /** Unique identifier */
  id: string;
  /** Reference to the user account */
  userId: string;
  /** Company this employee belongs to */
  companyId: string;

  // Personal information
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Full name (computed) */
  fullName: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone?: string;
  /** Job title */
  jobTitle?: string;
  /** Avatar URL */
  avatarUrl?: string;

  // Role and permissions
  /** Employee role */
  role: EmployeeRole;
  /** Custom permissions (overrides role defaults) */
  permissions: EmployeePermission[];
  /** Department ID */
  departmentId?: string;
  /** Reports to employee ID */
  reportsToId?: string;

  // Status
  /** Employee status */
  status: EmployeeStatus;
  /** Reason for suspension (if suspended) */
  suspensionReason?: string;

  // Spending limits
  /** Per-order spending limit */
  spendingLimitPerOrder?: number;
  /** Daily spending limit */
  spendingLimitDaily?: number;
  /** Weekly spending limit */
  spendingLimitWeekly?: number;
  /** Monthly spending limit */
  spendingLimitMonthly?: number;

  // Current spending (tracked values)
  /** Current daily spending */
  currentDailySpending: number;
  /** Current weekly spending */
  currentWeeklySpending: number;
  /** Current monthly spending */
  currentMonthlySpending: number;

  // Approval settings
  /** Can approve orders up to this amount */
  approvalLimit?: number;
  /** Whether this employee is an approver */
  isApprover: boolean;
  /** IDs of employees this person can approve for */
  canApproveFor: string[];

  // Preferences
  /** Default shipping address ID */
  defaultShippingAddressId?: string;
  /** Preferred notification method */
  notificationPreference: 'email' | 'sms' | 'both' | 'none';

  // Timestamps
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** ISO timestamp of last login */
  lastLoginAt?: string;
  /** ISO timestamp of invitation sent */
  invitedAt?: string;
  /** ISO timestamp of invitation acceptance */
  acceptedAt?: string;
}

// ============================================
// Employee Summary (for lists)
// ============================================

/**
 * Lightweight employee representation for lists and references.
 */
export interface EmployeeSummary {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  departmentId?: string;
  isApprover: boolean;
}

// ============================================
// Employee Invitation
// ============================================

/**
 * Employee invitation details.
 */
export interface EmployeeInvitation {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  permissions?: EmployeePermission[];
  departmentId?: string;
  spendingLimitPerOrder?: number;
  spendingLimitMonthly?: number;
  message?: string;
  invitedById: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

// ============================================
// Employee Create/Update DTOs
// ============================================

/**
 * Data required to invite a new employee.
 */
export interface InviteEmployeeInput {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  role: EmployeeRole;
  permissions?: EmployeePermission[];
  departmentId?: string;
  reportsToId?: string;
  spendingLimitPerOrder?: number;
  spendingLimitDaily?: number;
  spendingLimitWeekly?: number;
  spendingLimitMonthly?: number;
  approvalLimit?: number;
  isApprover?: boolean;
  message?: string;
}

/**
 * Data to update an existing employee.
 */
export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  avatarUrl?: string;
  role?: EmployeeRole;
  permissions?: EmployeePermission[];
  departmentId?: string;
  reportsToId?: string;
  status?: EmployeeStatus;
  suspensionReason?: string;
  spendingLimitPerOrder?: number;
  spendingLimitDaily?: number;
  spendingLimitWeekly?: number;
  spendingLimitMonthly?: number;
  approvalLimit?: number;
  isApprover?: boolean;
  canApproveFor?: string[];
  defaultShippingAddressId?: string;
  notificationPreference?: 'email' | 'sms' | 'both' | 'none';
}

// ============================================
// Employee Activity
// ============================================

/**
 * Activity types for employee audit log.
 */
export type EmployeeActivityType =
  | 'login'
  | 'logout'
  | 'order_created'
  | 'order_approved'
  | 'order_rejected'
  | 'quote_created'
  | 'quote_accepted'
  | 'settings_updated'
  | 'password_changed'
  | 'profile_updated';

/**
 * Employee activity log entry.
 */
export interface EmployeeActivity {
  id: string;
  employeeId: string;
  companyId: string;
  type: EmployeeActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
