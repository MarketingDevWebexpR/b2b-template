// src/forms/employee.schema.ts
import { z } from "zod";
var employeeRoleSchema = z.enum([
  "admin",
  "manager",
  "purchaser",
  "viewer",
  "approver"
]);
var employeeStatusSchema = z.enum([
  "active",
  "inactive",
  "pending",
  "suspended"
]);
var employeeBaseSchema = z.object({
  /** First name */
  firstName: z.string().min(1, "First name is required").max(50, "First name must be 50 characters or less"),
  /** Last name */
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be 50 characters or less"),
  /** Email address */
  email: z.string().email("Invalid email address"),
  /** Phone number */
  phone: z.string().regex(
    /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{4,10}$/,
    "Invalid phone number"
  ).optional().or(z.literal("")),
  /** Job title */
  jobTitle: z.string().max(100, "Job title must be 100 characters or less").optional(),
  /** Department */
  department: z.string().max(100, "Department must be 100 characters or less").optional(),
  /** Employee number/ID */
  employeeNumber: z.string().max(50, "Employee number must be 50 characters or less").optional()
});
var employeePermissionsSchema = z.object({
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
  allowedCostCenters: z.array(z.string()).default([])
});
var employeeSpendingLimitSchema = z.object({
  /** Monthly spending limit */
  monthlyLimit: z.number().min(0, "Limit must be positive").optional(),
  /** Single order limit */
  orderLimit: z.number().min(0, "Limit must be positive").optional(),
  /** Whether to require approval above limit */
  requireApprovalAboveLimit: z.boolean().default(true),
  /** Reporting manager ID for approvals */
  managerId: z.string().optional(),
  /** Custom approval chain */
  approvalChain: z.array(z.string()).default([])
});
var employeeCreateSchema = employeeBaseSchema.extend({
  /** Employee role */
  role: employeeRoleSchema,
  /** Permissions */
  permissions: employeePermissionsSchema.optional(),
  /** Spending limits */
  spendingLimits: employeeSpendingLimitSchema.optional(),
  /** Send welcome email */
  sendWelcomeEmail: z.boolean().default(true),
  /** Notes */
  notes: z.string().max(1e3, "Notes must be 1000 characters or less").optional()
});
var employeeUpdateSchema = employeeBaseSchema.partial().extend({
  /** Employee role */
  role: employeeRoleSchema.optional(),
  /** Employee status */
  status: employeeStatusSchema.optional(),
  /** Permissions */
  permissions: employeePermissionsSchema.partial().optional(),
  /** Spending limits */
  spendingLimits: employeeSpendingLimitSchema.partial().optional(),
  /** Notes */
  notes: z.string().max(1e3, "Notes must be 1000 characters or less").optional()
});
var employeeBulkImportRowSchema = z.object({
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
  managerId: z.string().optional()
});
var employeeInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: employeeRoleSchema,
  permissions: employeePermissionsSchema.optional(),
  message: z.string().max(500, "Message must be 500 characters or less").optional(),
  expiresIn: z.number().min(1).max(30).default(7)
  // days
});
var employeeFilterSchema = z.object({
  search: z.string().optional(),
  role: employeeRoleSchema.optional(),
  status: employeeStatusSchema.optional(),
  department: z.string().optional(),
  hasSpendingLimit: z.boolean().optional(),
  managerId: z.string().optional()
});

// src/forms/quote.schema.ts
import { z as z2 } from "zod";
var quoteStatusSchema = z2.enum([
  "draft",
  "pending_review",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "cancelled"
]);
var discountTypeSchema = z2.enum(["percentage", "fixed", "per_unit"]);
var taxTypeSchema = z2.enum(["included", "excluded", "exempt"]);
var addressSchema = z2.object({
  line1: z2.string().min(1, "Address line 1 is required").max(200),
  line2: z2.string().max(200).optional(),
  city: z2.string().min(1, "City is required").max(100),
  state: z2.string().max(100).optional(),
  postalCode: z2.string().min(1, "Postal code is required").max(20),
  country: z2.string().min(2, "Country is required").max(2)
});
var quoteCustomerSchema = z2.object({
  companyName: z2.string().min(1, "Company name is required").max(200, "Company name must be 200 characters or less"),
  contactName: z2.string().min(1, "Contact name is required").max(100, "Contact name must be 100 characters or less"),
  email: z2.string().email("Invalid email address"),
  phone: z2.string().max(30, "Phone must be 30 characters or less").optional().or(z2.literal("")),
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  taxId: z2.string().max(50, "Tax ID must be 50 characters or less").optional(),
  paymentTerms: z2.string().max(50).optional()
});
var lineItemDiscountSchema = z2.object({
  type: discountTypeSchema,
  value: z2.number().min(0, "Discount value must be positive"),
  reason: z2.string().max(200).optional()
});
var quoteLineItemSchema = z2.object({
  productId: z2.string().min(1, "Product ID is required"),
  name: z2.string().min(1, "Product name is required").max(200, "Product name must be 200 characters or less"),
  description: z2.string().max(1e3).optional(),
  sku: z2.string().max(50).optional(),
  quantity: z2.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1"),
  unit: z2.string().max(20).optional(),
  unitPrice: z2.number().min(0, "Unit price must be positive"),
  discount: lineItemDiscountSchema.optional(),
  taxRate: z2.number().min(0).max(100).optional(),
  customOptions: z2.record(z2.unknown()).optional(),
  leadTime: z2.number().int().min(0).optional(),
  notes: z2.string().max(500).optional()
});
var quoteDiscountSchema = z2.object({
  type: discountTypeSchema,
  value: z2.number().min(0, "Discount value must be positive"),
  code: z2.string().max(50).optional(),
  reason: z2.string().max(200).optional(),
  minOrderValue: z2.number().min(0).optional(),
  maxDiscount: z2.number().min(0).optional()
});
var quoteTermsSchema = z2.object({
  paymentTerms: z2.string().min(1, "Payment terms are required").max(50, "Payment terms must be 50 characters or less"),
  paymentDueDate: z2.coerce.date().optional(),
  deliveryTerms: z2.string().max(50).optional(),
  deliveryDate: z2.coerce.date().optional(),
  validityDays: z2.number().int("Validity must be a whole number").min(1, "Validity must be at least 1 day").max(365, "Validity cannot exceed 365 days"),
  customTerms: z2.string().max(5e3, "Custom terms must be 5000 characters or less").optional(),
  notes: z2.string().max(2e3, "Notes must be 2000 characters or less").optional(),
  internalNotes: z2.string().max(2e3, "Internal notes must be 2000 characters or less").optional()
});
var quotePricingSchema = z2.object({
  shipping: z2.number().min(0, "Shipping must be positive"),
  taxType: taxTypeSchema,
  taxRate: z2.number().min(0, "Tax rate must be positive").max(100, "Tax rate cannot exceed 100%"),
  currency: z2.string().length(3, "Currency must be a 3-letter code")
});
var quoteCreateSchema = z2.object({
  customer: quoteCustomerSchema,
  items: z2.array(quoteLineItemSchema).min(1, "Quote must have at least one item"),
  discounts: z2.array(quoteDiscountSchema).default([]),
  pricing: quotePricingSchema,
  terms: quoteTermsSchema,
  metadata: z2.record(z2.unknown()).optional()
});
var quoteUpdateSchema = z2.object({
  customer: quoteCustomerSchema.partial().optional(),
  items: z2.array(quoteLineItemSchema).optional(),
  discounts: z2.array(quoteDiscountSchema).optional(),
  pricing: quotePricingSchema.partial().optional(),
  terms: quoteTermsSchema.partial().optional(),
  status: quoteStatusSchema.optional(),
  metadata: z2.record(z2.unknown()).optional()
});
var quoteSendSchema = z2.object({
  recipientEmail: z2.string().email("Invalid recipient email"),
  ccEmails: z2.array(z2.string().email()).default([]),
  subject: z2.string().min(1, "Subject is required").max(200),
  message: z2.string().max(5e3).optional(),
  attachPdf: z2.boolean().default(true)
});
var quoteResponseSchema = z2.object({
  action: z2.enum(["accept", "reject", "request_revision"]),
  comment: z2.string().max(2e3).optional(),
  purchaseOrderNumber: z2.string().max(50).optional()
});
var quoteFilterSchema = z2.object({
  search: z2.string().optional(),
  status: quoteStatusSchema.optional(),
  customerId: z2.string().optional(),
  createdBy: z2.string().optional(),
  dateFrom: z2.coerce.date().optional(),
  dateTo: z2.coerce.date().optional(),
  minTotal: z2.number().optional(),
  maxTotal: z2.number().optional()
});

// src/forms/company.schema.ts
import { z as z3 } from "zod";
var companyTypeSchema = z3.enum([
  "retailer",
  "wholesaler",
  "distributor",
  "manufacturer",
  "other"
]);
var companyStatusSchema = z3.enum([
  "active",
  "pending_approval",
  "suspended",
  "inactive"
]);
var companyAddressSchema = z3.object({
  line1: z3.string().min(1, "Address line 1 is required").max(200),
  line2: z3.string().max(200).optional(),
  city: z3.string().min(1, "City is required").max(100),
  state: z3.string().max(100).optional(),
  postalCode: z3.string().min(1, "Postal code is required").max(20),
  country: z3.string().min(2, "Country code must be 2 characters").max(2, "Country code must be 2 characters"),
  isDefault: z3.boolean().default(false),
  label: z3.string().max(50).optional()
});
var companyBillingSettingsSchema = z3.object({
  /** Payment terms (e.g., 'NET30', 'NET60') */
  paymentTerms: z3.string().min(1, "Payment terms are required").max(50),
  /** Credit limit */
  creditLimit: z3.number().min(0, "Credit limit must be positive").optional(),
  /** Whether to auto-approve orders under credit limit */
  autoApproveUnderCreditLimit: z3.boolean().default(false),
  /** Tax exemption status */
  taxExempt: z3.boolean().default(false),
  /** Tax exemption certificate number */
  taxExemptionCertificate: z3.string().max(100).optional(),
  /** Preferred currency */
  preferredCurrency: z3.string().length(3, "Currency must be a 3-letter code").default("EUR"),
  /** Default billing address ID */
  defaultBillingAddressId: z3.string().optional(),
  /** Invoice email */
  invoiceEmail: z3.string().email("Invalid invoice email").optional(),
  /** PO required for orders */
  requirePurchaseOrder: z3.boolean().default(false)
});
var companyShippingSettingsSchema = z3.object({
  /** Default shipping address ID */
  defaultShippingAddressId: z3.string().optional(),
  /** Preferred shipping method */
  preferredShippingMethod: z3.string().max(50).optional(),
  /** Shipping account number (for carrier accounts) */
  shippingAccountNumber: z3.string().max(50).optional(),
  /** Special shipping instructions */
  shippingInstructions: z3.string().max(500).optional(),
  /** Allow partial shipments */
  allowPartialShipments: z3.boolean().default(true),
  /** Consolidate shipments */
  consolidateShipments: z3.boolean().default(false)
});
var companyOrderingSettingsSchema = z3.object({
  /** Minimum order value */
  minimumOrderValue: z3.number().min(0, "Minimum order must be positive").optional(),
  /** Maximum order value */
  maximumOrderValue: z3.number().min(0, "Maximum order must be positive").optional(),
  /** Require approval for orders over amount */
  approvalThreshold: z3.number().min(0).optional(),
  /** Allowed product categories (empty = all) */
  allowedCategories: z3.array(z3.string()).default([]),
  /** Blocked product categories */
  blockedCategories: z3.array(z3.string()).default([]),
  /** Enable bulk ordering */
  enableBulkOrdering: z3.boolean().default(true),
  /** Enable quick reorder */
  enableQuickReorder: z3.boolean().default(true),
  /** Default cost center */
  defaultCostCenter: z3.string().max(50).optional()
});
var companyNotificationSettingsSchema = z3.object({
  /** Order confirmation emails */
  orderConfirmation: z3.boolean().default(true),
  /** Shipping notification emails */
  shippingNotification: z3.boolean().default(true),
  /** Invoice emails */
  invoiceNotification: z3.boolean().default(true),
  /** Quote emails */
  quoteNotification: z3.boolean().default(true),
  /** Spending alert emails */
  spendingAlerts: z3.boolean().default(true),
  /** Weekly spending summary */
  weeklySpendingSummary: z3.boolean().default(false),
  /** Monthly spending summary */
  monthlySpendingSummary: z3.boolean().default(true),
  /** Additional notification emails */
  additionalEmails: z3.array(z3.string().email()).default([])
});
var companyBrandingSettingsSchema = z3.object({
  /** Company logo URL */
  logoUrl: z3.string().url("Invalid logo URL").optional(),
  /** Primary brand color */
  primaryColor: z3.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  /** Custom CSS class prefix */
  cssPrefix: z3.string().max(20).optional(),
  /** Custom footer text */
  footerText: z3.string().max(500).optional()
});
var companyProfileSchema = z3.object({
  /** Company legal name */
  legalName: z3.string().min(1, "Legal name is required").max(200, "Legal name must be 200 characters or less"),
  /** Trading/display name */
  tradingName: z3.string().max(200).optional(),
  /** Company type */
  type: companyTypeSchema,
  /** Tax ID / VAT number */
  taxId: z3.string().min(1, "Tax ID is required").max(50, "Tax ID must be 50 characters or less"),
  /** Registration number */
  registrationNumber: z3.string().max(50).optional(),
  /** Company website */
  website: z3.string().url("Invalid website URL").optional().or(z3.literal("")),
  /** Company phone */
  phone: z3.string().max(30).optional(),
  /** Company email */
  email: z3.string().email("Invalid email address"),
  /** Industry/sector */
  industry: z3.string().max(100).optional(),
  /** Company description */
  description: z3.string().max(2e3).optional(),
  /** Year established */
  yearEstablished: z3.number().int().min(1800).max((/* @__PURE__ */ new Date()).getFullYear()).optional(),
  /** Number of employees */
  employeeCount: z3.number().int().min(1).optional(),
  /** Annual revenue range */
  revenueRange: z3.string().max(50).optional()
});
var companySettingsSchema = z3.object({
  profile: companyProfileSchema,
  addresses: z3.array(companyAddressSchema).default([]),
  billing: companyBillingSettingsSchema,
  shipping: companyShippingSettingsSchema,
  ordering: companyOrderingSettingsSchema,
  notifications: companyNotificationSettingsSchema,
  branding: companyBrandingSettingsSchema.optional()
});
var companyRegistrationSchema = z3.object({
  profile: companyProfileSchema,
  primaryAddress: companyAddressSchema,
  primaryContact: z3.object({
    firstName: z3.string().min(1, "First name is required").max(50),
    lastName: z3.string().min(1, "Last name is required").max(50),
    email: z3.string().email("Invalid email address"),
    phone: z3.string().max(30).optional(),
    jobTitle: z3.string().max(100).optional()
  }),
  billing: companyBillingSettingsSchema.pick({
    paymentTerms: true,
    preferredCurrency: true,
    invoiceEmail: true
  }),
  acceptTerms: z3.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" })
  })
});
var companyFilterSchema = z3.object({
  search: z3.string().optional(),
  type: companyTypeSchema.optional(),
  status: companyStatusSchema.optional(),
  country: z3.string().optional(),
  hasCredit: z3.boolean().optional(),
  minCreditLimit: z3.number().optional(),
  maxCreditLimit: z3.number().optional()
});

// src/forms/spending-limit.schema.ts
import { z as z4 } from "zod";
var spendingPeriodSchema = z4.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom"
]);
var spendingLimitTypeSchema = z4.enum([
  "employee",
  "department",
  "cost_center",
  "company",
  "category"
]);
var spendingLimitStatusSchema = z4.enum([
  "active",
  "paused",
  "expired",
  "exceeded"
]);
var thresholdActionSchema = z4.enum([
  "notify",
  "notify_manager",
  "require_approval",
  "block"
]);
var spendingThresholdSchema = z4.object({
  /** Percentage at which this threshold triggers (0-100) */
  percentage: z4.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100"),
  /** Action to take when threshold is reached */
  action: thresholdActionSchema,
  /** Custom message for notifications */
  notificationMessage: z4.string().max(500).optional(),
  /** Whether threshold is active */
  isActive: z4.boolean().default(true)
});
var currencyConfigSchema = z4.object({
  code: z4.string().length(3, "Currency code must be 3 characters"),
  symbol: z4.string().min(1).max(5),
  decimals: z4.number().int().min(0).max(4).default(2),
  symbolPosition: z4.enum(["before", "after"]).default("before"),
  thousandsSeparator: z4.string().max(1).default(","),
  decimalSeparator: z4.string().max(1).default(".")
});
var spendingLimitBaseSchema = z4.object({
  /** Limit name */
  name: z4.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  /** Description */
  description: z4.string().max(500).optional(),
  /** Limit type */
  type: spendingLimitTypeSchema,
  /** Maximum spending amount */
  maxAmount: z4.number().positive("Maximum amount must be positive").max(999999999, "Maximum amount is too large"),
  /** Spending period */
  period: spendingPeriodSchema,
  /** Currency */
  currency: currencyConfigSchema.optional(),
  /** Whether limit is active */
  isActive: z4.boolean().default(true),
  /** Whether to allow exceeding the limit */
  allowExceed: z4.boolean().default(false),
  /** Soft limit (warning threshold) */
  softLimit: z4.number().positive("Soft limit must be positive").optional(),
  /** Hard limit (absolute maximum) */
  hardLimit: z4.number().positive("Hard limit must be positive").optional()
});
var employeeSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z4.literal("employee"),
  /** Employee ID */
  employeeId: z4.string().min(1, "Employee ID is required"),
  /** Per-order limit */
  orderLimit: z4.number().positive().optional(),
  /** Require approval above amount */
  approvalThreshold: z4.number().positive().optional(),
  /** Manager ID for approvals */
  managerId: z4.string().optional(),
  /** Custom thresholds */
  thresholds: z4.array(spendingThresholdSchema).default([])
});
var departmentSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z4.literal("department"),
  /** Department ID */
  departmentId: z4.string().min(1, "Department ID is required"),
  /** Department name */
  departmentName: z4.string().min(1).max(100),
  /** Whether to distribute across employees */
  distributeToEmployees: z4.boolean().default(false),
  /** Per-employee limit when distributed */
  perEmployeeLimit: z4.number().positive().optional(),
  /** Approval chain */
  approvalChain: z4.array(z4.string()).default([]),
  /** Custom thresholds */
  thresholds: z4.array(spendingThresholdSchema).default([])
});
var costCenterSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z4.literal("cost_center"),
  /** Cost center code */
  costCenterCode: z4.string().min(1, "Cost center code is required").max(50),
  /** Cost center name */
  costCenterName: z4.string().min(1).max(100),
  /** Account code */
  accountCode: z4.string().max(50).optional(),
  /** GL code */
  glCode: z4.string().max(50).optional(),
  /** Approval chain */
  approvalChain: z4.array(z4.string()).default([]),
  /** Custom thresholds */
  thresholds: z4.array(spendingThresholdSchema).default([])
});
var categorySpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z4.literal("category"),
  /** Category ID */
  categoryId: z4.string().min(1, "Category ID is required"),
  /** Category name */
  categoryName: z4.string().min(1).max(100),
  /** Include subcategories */
  includeSubcategories: z4.boolean().default(true),
  /** Custom thresholds */
  thresholds: z4.array(spendingThresholdSchema).default([])
});
var companySpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: z4.literal("company"),
  /** Company ID */
  companyId: z4.string().min(1, "Company ID is required"),
  /** Whether this is a global cap */
  isGlobalCap: z4.boolean().default(true),
  /** Custom thresholds */
  thresholds: z4.array(spendingThresholdSchema).default([])
});
var spendingLimitCreateSchema = z4.discriminatedUnion("type", [
  employeeSpendingLimitCreateSchema,
  departmentSpendingLimitCreateSchema,
  costCenterSpendingLimitCreateSchema,
  categorySpendingLimitCreateSchema,
  companySpendingLimitCreateSchema
]);
var spendingLimitUpdateSchema = spendingLimitBaseSchema.partial().extend({
  /** Custom thresholds */
  thresholds: z4.array(spendingThresholdSchema).optional()
});
var spendingLimitFilterSchema = z4.object({
  search: z4.string().optional(),
  type: spendingLimitTypeSchema.optional(),
  status: spendingLimitStatusSchema.optional(),
  period: spendingPeriodSchema.optional(),
  employeeId: z4.string().optional(),
  departmentId: z4.string().optional(),
  isActive: z4.boolean().optional(),
  isExceeded: z4.boolean().optional()
});
var spendingTransactionSchema = z4.object({
  /** Transaction amount */
  amount: z4.number().positive("Amount must be positive"),
  /** Transaction description */
  description: z4.string().max(500).optional(),
  /** Reference (order ID, etc.) */
  reference: z4.string().max(100).optional(),
  /** Transaction date */
  transactionDate: z4.coerce.date().default(() => /* @__PURE__ */ new Date()),
  /** Category */
  category: z4.string().optional(),
  /** Cost center */
  costCenter: z4.string().optional()
});
var spendingAdjustmentSchema = z4.object({
  /** Adjustment amount (positive to increase, negative to decrease) */
  amount: z4.number(),
  /** Reason for adjustment */
  reason: z4.string().min(1, "Reason is required").max(500),
  /** Reference (order ID, refund ID, etc.) */
  reference: z4.string().max(100).optional(),
  /** Approved by */
  approvedBy: z4.string().min(1, "Approver is required")
});

export {
  employeeRoleSchema,
  employeeStatusSchema,
  employeeBaseSchema,
  employeePermissionsSchema,
  employeeSpendingLimitSchema,
  employeeCreateSchema,
  employeeUpdateSchema,
  employeeBulkImportRowSchema,
  employeeInviteSchema,
  employeeFilterSchema,
  quoteStatusSchema,
  discountTypeSchema,
  taxTypeSchema,
  addressSchema,
  quoteCustomerSchema,
  lineItemDiscountSchema,
  quoteLineItemSchema,
  quoteDiscountSchema,
  quoteTermsSchema,
  quotePricingSchema,
  quoteCreateSchema,
  quoteUpdateSchema,
  quoteSendSchema,
  quoteResponseSchema,
  quoteFilterSchema,
  companyTypeSchema,
  companyStatusSchema,
  companyAddressSchema,
  companyBillingSettingsSchema,
  companyShippingSettingsSchema,
  companyOrderingSettingsSchema,
  companyNotificationSettingsSchema,
  companyBrandingSettingsSchema,
  companyProfileSchema,
  companySettingsSchema,
  companyRegistrationSchema,
  companyFilterSchema,
  spendingPeriodSchema,
  spendingLimitTypeSchema,
  spendingLimitStatusSchema,
  thresholdActionSchema,
  spendingThresholdSchema,
  currencyConfigSchema,
  spendingLimitBaseSchema,
  employeeSpendingLimitCreateSchema,
  departmentSpendingLimitCreateSchema,
  costCenterSpendingLimitCreateSchema,
  categorySpendingLimitCreateSchema,
  companySpendingLimitCreateSchema,
  spendingLimitCreateSchema,
  spendingLimitUpdateSchema,
  spendingLimitFilterSchema,
  spendingTransactionSchema,
  spendingAdjustmentSchema
};
//# sourceMappingURL=chunk-QVLSUSTM.js.map