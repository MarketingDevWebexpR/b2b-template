import { z } from "zod";

/**
 * Employee role schema
 */
export const employeeRoleSchema = z.enum([
  "admin",
  "manager",
  "purchaser",
  "viewer",
  "approver",
]);

export type EmployeeRole = z.infer<typeof employeeRoleSchema>;

/**
 * Employee status schema
 */
export const employeeStatusSchema = z.enum([
  "active",
  "inactive",
  "pending",
  "suspended",
]);

export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;

/**
 * Base employee information schema
 */
export const employeeBaseSchema = z.object({
  /** First name */
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),

  /** Last name */
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),

  /** Email address */
  email: z.string().email("Invalid email address"),

  /** Phone number */
  phone: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{4,10}$/,
      "Invalid phone number"
    )
    .optional()
    .or(z.literal("")),

  /** Job title */
  jobTitle: z.string().max(100, "Job title must be 100 characters or less").optional(),

  /** Department */
  department: z.string().max(100, "Department must be 100 characters or less").optional(),

  /** Employee number/ID */
  employeeNumber: z
    .string()
    .max(50, "Employee number must be 50 characters or less")
    .optional(),
});

/**
 * Employee permissions schema
 */
export const employeePermissionsSchema = z.object({
  /** Can create orders */
  canCreateOrders: z.boolean().default(false),

  /** Can approve orders */
  canApproveOrders: z.boolean().default(false),

  /** Maximum order amount they can approve (without further approval) */
  maxApprovalAmount: z.number().min(0, "Amount must be positive").optional(),

  /** Can manage employees */
  canManageEmployees: z.boolean().default(false),

  /** Can view all orders */
  canViewAllOrders: z.boolean().default(false),

  /** Can manage company settings */
  canManageSettings: z.boolean().default(false),

  /** Can export data */
  canExportData: z.boolean().default(false),

  /** Can create quotes */
  canCreateQuotes: z.boolean().default(false),

  /** Allowed product categories (empty = all) */
  allowedCategories: z.array(z.string()).default([]),

  /** Allowed cost centers */
  allowedCostCenters: z.array(z.string()).default([]),
});

export type EmployeePermissions = z.infer<typeof employeePermissionsSchema>;

/**
 * Employee spending limit schema
 */
export const employeeSpendingLimitSchema = z.object({
  /** Monthly spending limit */
  monthlyLimit: z.number().min(0, "Limit must be positive").optional(),

  /** Single order limit */
  orderLimit: z.number().min(0, "Limit must be positive").optional(),

  /** Whether to require approval above limit */
  requireApprovalAboveLimit: z.boolean().default(true),

  /** Reporting manager ID for approvals */
  managerId: z.string().optional(),

  /** Custom approval chain */
  approvalChain: z.array(z.string()).default([]),
});

export type EmployeeSpendingLimit = z.infer<typeof employeeSpendingLimitSchema>;

/**
 * Complete employee create schema
 */
export const employeeCreateSchema = employeeBaseSchema.extend({
  /** Employee role */
  role: employeeRoleSchema,

  /** Permissions */
  permissions: employeePermissionsSchema.optional(),

  /** Spending limits */
  spendingLimits: employeeSpendingLimitSchema.optional(),

  /** Send welcome email */
  sendWelcomeEmail: z.boolean().default(true),

  /** Notes */
  notes: z.string().max(1000, "Notes must be 1000 characters or less").optional(),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;

/**
 * Employee update schema (all fields optional)
 */
export const employeeUpdateSchema = employeeBaseSchema.partial().extend({
  /** Employee role */
  role: employeeRoleSchema.optional(),

  /** Employee status */
  status: employeeStatusSchema.optional(),

  /** Permissions */
  permissions: employeePermissionsSchema.partial().optional(),

  /** Spending limits */
  spendingLimits: employeeSpendingLimitSchema.partial().optional(),

  /** Notes */
  notes: z.string().max(1000, "Notes must be 1000 characters or less").optional(),
});

export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;

/**
 * Bulk employee import schema (for CSV imports)
 */
export const employeeBulkImportRowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: employeeRoleSchema.default("viewer"),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  employeeNumber: z.string().optional(),
  monthlyLimit: z.coerce.number().optional(),
  orderLimit: z.coerce.number().optional(),
  managerId: z.string().optional(),
});

export type EmployeeBulkImportRow = z.infer<typeof employeeBulkImportRowSchema>;

/**
 * Employee invite schema
 */
export const employeeInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: employeeRoleSchema,
  permissions: employeePermissionsSchema.optional(),
  message: z.string().max(500, "Message must be 500 characters or less").optional(),
  expiresIn: z.number().min(1).max(30).default(7), // days
});

export type EmployeeInviteInput = z.infer<typeof employeeInviteSchema>;

/**
 * Employee search/filter schema
 */
export const employeeFilterSchema = z.object({
  search: z.string().optional(),
  role: employeeRoleSchema.optional(),
  status: employeeStatusSchema.optional(),
  department: z.string().optional(),
  hasSpendingLimit: z.boolean().optional(),
  managerId: z.string().optional(),
});

export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;
