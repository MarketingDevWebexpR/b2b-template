import { z } from "zod";

/**
 * Spending period schema
 */
export const spendingPeriodSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom",
]);

export type SpendingPeriod = z.infer<typeof spendingPeriodSchema>;

/**
 * Spending limit type schema
 */
export const spendingLimitTypeSchema = z.enum([
  "employee",
  "department",
  "cost_center",
  "company",
  "category",
]);

export type SpendingLimitType = z.infer<typeof spendingLimitTypeSchema>;

/**
 * Spending limit status schema
 */
export const spendingLimitStatusSchema = z.enum([
  "active",
  "paused",
  "expired",
  "exceeded",
]);

export type SpendingLimitStatus = z.infer<typeof spendingLimitStatusSchema>;

/**
 * Threshold action schema
 */
export const thresholdActionSchema = z.enum([
  "notify",
  "notify_manager",
  "require_approval",
  "block",
]);

export type ThresholdAction = z.infer<typeof thresholdActionSchema>;

/**
 * Spending threshold schema
 */
export const spendingThresholdSchema = z.object({
  /** Percentage at which this threshold triggers (0-100) */
  percentage: z
    .number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage cannot exceed 100"),

  /** Action to take when threshold is reached */
  action: thresholdActionSchema,

  /** Custom message for notifications */
  notificationMessage: z.string().max(500).optional(),

  /** Whether threshold is active */
  isActive: z.boolean().default(true),
});

export type SpendingThresholdInput = z.infer<typeof spendingThresholdSchema>;

/**
 * Currency config schema
 */
export const currencyConfigSchema = z.object({
  code: z.string().length(3, "Currency code must be 3 characters"),
  symbol: z.string().min(1).max(5),
  decimals: z.number().int().min(0).max(4).default(2),
  symbolPosition: z.enum(["before", "after"]).default("before"),
  thousandsSeparator: z.string().max(1).default(","),
  decimalSeparator: z.string().max(1).default("."),
});

export type CurrencyConfigInput = z.infer<typeof currencyConfigSchema>;

/**
 * Base spending limit schema
 */
export const spendingLimitBaseSchema = z.object({
  /** Limit name */
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  /** Description */
  description: z.string().max(500).optional(),

  /** Limit type */
  type: spendingLimitTypeSchema,

  /** Maximum spending amount */
  maxAmount: z
    .number()
    .positive("Maximum amount must be positive")
    .max(999999999, "Maximum amount is too large"),

  /** Spending period */
  period: spendingPeriodSchema,

  /** Currency */
  currency: currencyConfigSchema.optional(),

  /** Whether limit is active */
  isActive: z.boolean().default(true),

  /** Whether to allow exceeding the limit */
  allowExceed: z.boolean().default(false),

  /** Soft limit (warning threshold) */
  softLimit: z
    .number()
    .positive("Soft limit must be positive")
    .optional(),

  /** Hard limit (absolute maximum) */
  hardLimit: z
    .number()
    .positive("Hard limit must be positive")
    .optional(),
});

/**
 * Employee spending limit schema
 */
export const employeeSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z.literal("employee"),

  /** Employee ID */
  employeeId: z.string().min(1, "Employee ID is required"),

  /** Per-order limit */
  orderLimit: z.number().positive().optional(),

  /** Require approval above amount */
  approvalThreshold: z.number().positive().optional(),

  /** Manager ID for approvals */
  managerId: z.string().optional(),

  /** Custom thresholds */
  thresholds: z.array(spendingThresholdSchema).default([]),
});

export type EmployeeSpendingLimitCreateInput = z.infer<typeof employeeSpendingLimitCreateSchema>;

/**
 * Department spending limit schema
 */
export const departmentSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z.literal("department"),

  /** Department ID */
  departmentId: z.string().min(1, "Department ID is required"),

  /** Department name */
  departmentName: z.string().min(1).max(100),

  /** Whether to distribute across employees */
  distributeToEmployees: z.boolean().default(false),

  /** Per-employee limit when distributed */
  perEmployeeLimit: z.number().positive().optional(),

  /** Approval chain */
  approvalChain: z.array(z.string()).default([]),

  /** Custom thresholds */
  thresholds: z.array(spendingThresholdSchema).default([]),
});

export type DepartmentSpendingLimitCreateInput = z.infer<typeof departmentSpendingLimitCreateSchema>;

/**
 * Cost center spending limit schema
 */
export const costCenterSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z.literal("cost_center"),

  /** Cost center code */
  costCenterCode: z.string().min(1, "Cost center code is required").max(50),

  /** Cost center name */
  costCenterName: z.string().min(1).max(100),

  /** Account code */
  accountCode: z.string().max(50).optional(),

  /** GL code */
  glCode: z.string().max(50).optional(),

  /** Approval chain */
  approvalChain: z.array(z.string()).default([]),

  /** Custom thresholds */
  thresholds: z.array(spendingThresholdSchema).default([]),
});

export type CostCenterSpendingLimitCreateInput = z.infer<typeof costCenterSpendingLimitCreateSchema>;

/**
 * Category spending limit schema
 */
export const categorySpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z.literal("category"),

  /** Category ID */
  categoryId: z.string().min(1, "Category ID is required"),

  /** Category name */
  categoryName: z.string().min(1).max(100),

  /** Include subcategories */
  includeSubcategories: z.boolean().default(true),

  /** Custom thresholds */
  thresholds: z.array(spendingThresholdSchema).default([]),
});

export type CategorySpendingLimitCreateInput = z.infer<typeof categorySpendingLimitCreateSchema>;

/**
 * Company-wide spending limit schema
 */
export const companySpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z.literal("company"),

  /** Company ID */
  companyId: z.string().min(1, "Company ID is required"),

  /** Whether this is a global cap */
  isGlobalCap: z.boolean().default(true),

  /** Custom thresholds */
  thresholds: z.array(spendingThresholdSchema).default([]),
});

export type CompanySpendingLimitCreateInput = z.infer<typeof companySpendingLimitCreateSchema>;

/**
 * Union of all spending limit create schemas
 */
export const spendingLimitCreateSchema = z.discriminatedUnion("type", [
  employeeSpendingLimitCreateSchema,
  departmentSpendingLimitCreateSchema,
  costCenterSpendingLimitCreateSchema,
  categorySpendingLimitCreateSchema,
  companySpendingLimitCreateSchema,
]);

export type SpendingLimitCreateInput = z.infer<typeof spendingLimitCreateSchema>;

/**
 * Spending limit update schema
 */
export const spendingLimitUpdateSchema = spendingLimitBaseSchema.partial().extend({
  /** Custom thresholds */
  thresholds: z.array(spendingThresholdSchema).optional(),
});

export type SpendingLimitUpdateInput = z.infer<typeof spendingLimitUpdateSchema>;

/**
 * Spending limit filter schema
 */
export const spendingLimitFilterSchema = z.object({
  search: z.string().optional(),
  type: spendingLimitTypeSchema.optional(),
  status: spendingLimitStatusSchema.optional(),
  period: spendingPeriodSchema.optional(),
  employeeId: z.string().optional(),
  departmentId: z.string().optional(),
  isActive: z.boolean().optional(),
  isExceeded: z.boolean().optional(),
});

export type SpendingLimitFilter = z.infer<typeof spendingLimitFilterSchema>;

/**
 * Spending transaction schema (for tracking)
 */
export const spendingTransactionSchema = z.object({
  /** Transaction amount */
  amount: z.number().positive("Amount must be positive"),

  /** Transaction description */
  description: z.string().max(500).optional(),

  /** Reference (order ID, etc.) */
  reference: z.string().max(100).optional(),

  /** Transaction date */
  transactionDate: z.coerce.date().default(() => new Date()),

  /** Category */
  category: z.string().optional(),

  /** Cost center */
  costCenter: z.string().optional(),
});

export type SpendingTransactionInput = z.infer<typeof spendingTransactionSchema>;

/**
 * Spending adjustment schema (for corrections)
 */
export const spendingAdjustmentSchema = z.object({
  /** Adjustment amount (positive to increase, negative to decrease) */
  amount: z.number(),

  /** Reason for adjustment */
  reason: z.string().min(1, "Reason is required").max(500),

  /** Reference (order ID, refund ID, etc.) */
  reference: z.string().max(100).optional(),

  /** Approved by */
  approvedBy: z.string().min(1, "Approver is required"),
});

export type SpendingAdjustmentInput = z.infer<typeof spendingAdjustmentSchema>;
