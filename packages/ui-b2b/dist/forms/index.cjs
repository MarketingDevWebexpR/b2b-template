"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/forms/index.ts
var forms_exports = {};
__export(forms_exports, {
  addressSchema: () => addressSchema,
  categorySpendingLimitCreateSchema: () => categorySpendingLimitCreateSchema,
  companyAddressSchema: () => companyAddressSchema,
  companyBillingSettingsSchema: () => companyBillingSettingsSchema,
  companyBrandingSettingsSchema: () => companyBrandingSettingsSchema,
  companyFilterSchema: () => companyFilterSchema,
  companyNotificationSettingsSchema: () => companyNotificationSettingsSchema,
  companyOrderingSettingsSchema: () => companyOrderingSettingsSchema,
  companyProfileSchema: () => companyProfileSchema,
  companyRegistrationSchema: () => companyRegistrationSchema,
  companySettingsSchema: () => companySettingsSchema,
  companyShippingSettingsSchema: () => companyShippingSettingsSchema,
  companySpendingLimitCreateSchema: () => companySpendingLimitCreateSchema,
  companyStatusSchema: () => companyStatusSchema,
  companyTypeSchema: () => companyTypeSchema,
  costCenterSpendingLimitCreateSchema: () => costCenterSpendingLimitCreateSchema,
  currencyConfigSchema: () => currencyConfigSchema,
  departmentSpendingLimitCreateSchema: () => departmentSpendingLimitCreateSchema,
  discountTypeSchema: () => discountTypeSchema,
  employeeBaseSchema: () => employeeBaseSchema,
  employeeBulkImportRowSchema: () => employeeBulkImportRowSchema,
  employeeCreateSchema: () => employeeCreateSchema,
  employeeFilterSchema: () => employeeFilterSchema,
  employeeInviteSchema: () => employeeInviteSchema,
  employeePermissionsSchema: () => employeePermissionsSchema,
  employeeRoleSchema: () => employeeRoleSchema,
  employeeSpendingLimitCreateSchema: () => employeeSpendingLimitCreateSchema,
  employeeSpendingLimitSchema: () => employeeSpendingLimitSchema,
  employeeStatusSchema: () => employeeStatusSchema,
  employeeUpdateSchema: () => employeeUpdateSchema,
  lineItemDiscountSchema: () => lineItemDiscountSchema,
  quoteCreateSchema: () => quoteCreateSchema,
  quoteCustomerSchema: () => quoteCustomerSchema,
  quoteDiscountSchema: () => quoteDiscountSchema,
  quoteFilterSchema: () => quoteFilterSchema,
  quoteLineItemSchema: () => quoteLineItemSchema,
  quotePricingSchema: () => quotePricingSchema,
  quoteResponseSchema: () => quoteResponseSchema,
  quoteSendSchema: () => quoteSendSchema,
  quoteStatusSchema: () => quoteStatusSchema,
  quoteTermsSchema: () => quoteTermsSchema,
  quoteUpdateSchema: () => quoteUpdateSchema,
  spendingAdjustmentSchema: () => spendingAdjustmentSchema,
  spendingLimitBaseSchema: () => spendingLimitBaseSchema,
  spendingLimitCreateSchema: () => spendingLimitCreateSchema,
  spendingLimitFilterSchema: () => spendingLimitFilterSchema,
  spendingLimitStatusSchema: () => spendingLimitStatusSchema,
  spendingLimitTypeSchema: () => spendingLimitTypeSchema,
  spendingLimitUpdateSchema: () => spendingLimitUpdateSchema,
  spendingPeriodSchema: () => spendingPeriodSchema,
  spendingThresholdSchema: () => spendingThresholdSchema,
  spendingTransactionSchema: () => spendingTransactionSchema,
  taxTypeSchema: () => taxTypeSchema,
  thresholdActionSchema: () => thresholdActionSchema
});
module.exports = __toCommonJS(forms_exports);

// src/forms/employee.schema.ts
var import_zod = require("zod");
var employeeRoleSchema = import_zod.z.enum([
  "admin",
  "manager",
  "purchaser",
  "viewer",
  "approver"
]);
var employeeStatusSchema = import_zod.z.enum([
  "active",
  "inactive",
  "pending",
  "suspended"
]);
var employeeBaseSchema = import_zod.z.object({
  /** First name */
  firstName: import_zod.z.string().min(1, "First name is required").max(50, "First name must be 50 characters or less"),
  /** Last name */
  lastName: import_zod.z.string().min(1, "Last name is required").max(50, "Last name must be 50 characters or less"),
  /** Email address */
  email: import_zod.z.string().email("Invalid email address"),
  /** Phone number */
  phone: import_zod.z.string().regex(
    /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{4,10}$/,
    "Invalid phone number"
  ).optional().or(import_zod.z.literal("")),
  /** Job title */
  jobTitle: import_zod.z.string().max(100, "Job title must be 100 characters or less").optional(),
  /** Department */
  department: import_zod.z.string().max(100, "Department must be 100 characters or less").optional(),
  /** Employee number/ID */
  employeeNumber: import_zod.z.string().max(50, "Employee number must be 50 characters or less").optional()
});
var employeePermissionsSchema = import_zod.z.object({
  /** Can create orders */
  canCreateOrders: import_zod.z.boolean().default(false),
  /** Can approve orders */
  canApproveOrders: import_zod.z.boolean().default(false),
  /** Maximum order amount they can approve (without further approval) */
  maxApprovalAmount: import_zod.z.number().min(0, "Amount must be positive").optional(),
  /** Can manage employees */
  canManageEmployees: import_zod.z.boolean().default(false),
  /** Can view all orders */
  canViewAllOrders: import_zod.z.boolean().default(false),
  /** Can manage company settings */
  canManageSettings: import_zod.z.boolean().default(false),
  /** Can export data */
  canExportData: import_zod.z.boolean().default(false),
  /** Can create quotes */
  canCreateQuotes: import_zod.z.boolean().default(false),
  /** Allowed product categories (empty = all) */
  allowedCategories: import_zod.z.array(import_zod.z.string()).default([]),
  /** Allowed cost centers */
  allowedCostCenters: import_zod.z.array(import_zod.z.string()).default([])
});
var employeeSpendingLimitSchema = import_zod.z.object({
  /** Monthly spending limit */
  monthlyLimit: import_zod.z.number().min(0, "Limit must be positive").optional(),
  /** Single order limit */
  orderLimit: import_zod.z.number().min(0, "Limit must be positive").optional(),
  /** Whether to require approval above limit */
  requireApprovalAboveLimit: import_zod.z.boolean().default(true),
  /** Reporting manager ID for approvals */
  managerId: import_zod.z.string().optional(),
  /** Custom approval chain */
  approvalChain: import_zod.z.array(import_zod.z.string()).default([])
});
var employeeCreateSchema = employeeBaseSchema.extend({
  /** Employee role */
  role: employeeRoleSchema,
  /** Permissions */
  permissions: employeePermissionsSchema.optional(),
  /** Spending limits */
  spendingLimits: employeeSpendingLimitSchema.optional(),
  /** Send welcome email */
  sendWelcomeEmail: import_zod.z.boolean().default(true),
  /** Notes */
  notes: import_zod.z.string().max(1e3, "Notes must be 1000 characters or less").optional()
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
  notes: import_zod.z.string().max(1e3, "Notes must be 1000 characters or less").optional()
});
var employeeBulkImportRowSchema = import_zod.z.object({
  firstName: import_zod.z.string().min(1),
  lastName: import_zod.z.string().min(1),
  email: import_zod.z.string().email(),
  phone: import_zod.z.string().optional(),
  role: employeeRoleSchema.default("viewer"),
  department: import_zod.z.string().optional(),
  jobTitle: import_zod.z.string().optional(),
  employeeNumber: import_zod.z.string().optional(),
  monthlyLimit: import_zod.z.coerce.number().optional(),
  orderLimit: import_zod.z.coerce.number().optional(),
  managerId: import_zod.z.string().optional()
});
var employeeInviteSchema = import_zod.z.object({
  email: import_zod.z.string().email("Invalid email address"),
  role: employeeRoleSchema,
  permissions: employeePermissionsSchema.optional(),
  message: import_zod.z.string().max(500, "Message must be 500 characters or less").optional(),
  expiresIn: import_zod.z.number().min(1).max(30).default(7)
  // days
});
var employeeFilterSchema = import_zod.z.object({
  search: import_zod.z.string().optional(),
  role: employeeRoleSchema.optional(),
  status: employeeStatusSchema.optional(),
  department: import_zod.z.string().optional(),
  hasSpendingLimit: import_zod.z.boolean().optional(),
  managerId: import_zod.z.string().optional()
});

// src/forms/quote.schema.ts
var import_zod2 = require("zod");
var quoteStatusSchema = import_zod2.z.enum([
  "draft",
  "pending_review",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "cancelled"
]);
var discountTypeSchema = import_zod2.z.enum(["percentage", "fixed", "per_unit"]);
var taxTypeSchema = import_zod2.z.enum(["included", "excluded", "exempt"]);
var addressSchema = import_zod2.z.object({
  line1: import_zod2.z.string().min(1, "Address line 1 is required").max(200),
  line2: import_zod2.z.string().max(200).optional(),
  city: import_zod2.z.string().min(1, "City is required").max(100),
  state: import_zod2.z.string().max(100).optional(),
  postalCode: import_zod2.z.string().min(1, "Postal code is required").max(20),
  country: import_zod2.z.string().min(2, "Country is required").max(2)
});
var quoteCustomerSchema = import_zod2.z.object({
  companyName: import_zod2.z.string().min(1, "Company name is required").max(200, "Company name must be 200 characters or less"),
  contactName: import_zod2.z.string().min(1, "Contact name is required").max(100, "Contact name must be 100 characters or less"),
  email: import_zod2.z.string().email("Invalid email address"),
  phone: import_zod2.z.string().max(30, "Phone must be 30 characters or less").optional().or(import_zod2.z.literal("")),
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  taxId: import_zod2.z.string().max(50, "Tax ID must be 50 characters or less").optional(),
  paymentTerms: import_zod2.z.string().max(50).optional()
});
var lineItemDiscountSchema = import_zod2.z.object({
  type: discountTypeSchema,
  value: import_zod2.z.number().min(0, "Discount value must be positive"),
  reason: import_zod2.z.string().max(200).optional()
});
var quoteLineItemSchema = import_zod2.z.object({
  productId: import_zod2.z.string().min(1, "Product ID is required"),
  name: import_zod2.z.string().min(1, "Product name is required").max(200, "Product name must be 200 characters or less"),
  description: import_zod2.z.string().max(1e3).optional(),
  sku: import_zod2.z.string().max(50).optional(),
  quantity: import_zod2.z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1"),
  unit: import_zod2.z.string().max(20).optional(),
  unitPrice: import_zod2.z.number().min(0, "Unit price must be positive"),
  discount: lineItemDiscountSchema.optional(),
  taxRate: import_zod2.z.number().min(0).max(100).optional(),
  customOptions: import_zod2.z.record(import_zod2.z.unknown()).optional(),
  leadTime: import_zod2.z.number().int().min(0).optional(),
  notes: import_zod2.z.string().max(500).optional()
});
var quoteDiscountSchema = import_zod2.z.object({
  type: discountTypeSchema,
  value: import_zod2.z.number().min(0, "Discount value must be positive"),
  code: import_zod2.z.string().max(50).optional(),
  reason: import_zod2.z.string().max(200).optional(),
  minOrderValue: import_zod2.z.number().min(0).optional(),
  maxDiscount: import_zod2.z.number().min(0).optional()
});
var quoteTermsSchema = import_zod2.z.object({
  paymentTerms: import_zod2.z.string().min(1, "Payment terms are required").max(50, "Payment terms must be 50 characters or less"),
  paymentDueDate: import_zod2.z.coerce.date().optional(),
  deliveryTerms: import_zod2.z.string().max(50).optional(),
  deliveryDate: import_zod2.z.coerce.date().optional(),
  validityDays: import_zod2.z.number().int("Validity must be a whole number").min(1, "Validity must be at least 1 day").max(365, "Validity cannot exceed 365 days"),
  customTerms: import_zod2.z.string().max(5e3, "Custom terms must be 5000 characters or less").optional(),
  notes: import_zod2.z.string().max(2e3, "Notes must be 2000 characters or less").optional(),
  internalNotes: import_zod2.z.string().max(2e3, "Internal notes must be 2000 characters or less").optional()
});
var quotePricingSchema = import_zod2.z.object({
  shipping: import_zod2.z.number().min(0, "Shipping must be positive"),
  taxType: taxTypeSchema,
  taxRate: import_zod2.z.number().min(0, "Tax rate must be positive").max(100, "Tax rate cannot exceed 100%"),
  currency: import_zod2.z.string().length(3, "Currency must be a 3-letter code")
});
var quoteCreateSchema = import_zod2.z.object({
  customer: quoteCustomerSchema,
  items: import_zod2.z.array(quoteLineItemSchema).min(1, "Quote must have at least one item"),
  discounts: import_zod2.z.array(quoteDiscountSchema).default([]),
  pricing: quotePricingSchema,
  terms: quoteTermsSchema,
  metadata: import_zod2.z.record(import_zod2.z.unknown()).optional()
});
var quoteUpdateSchema = import_zod2.z.object({
  customer: quoteCustomerSchema.partial().optional(),
  items: import_zod2.z.array(quoteLineItemSchema).optional(),
  discounts: import_zod2.z.array(quoteDiscountSchema).optional(),
  pricing: quotePricingSchema.partial().optional(),
  terms: quoteTermsSchema.partial().optional(),
  status: quoteStatusSchema.optional(),
  metadata: import_zod2.z.record(import_zod2.z.unknown()).optional()
});
var quoteSendSchema = import_zod2.z.object({
  recipientEmail: import_zod2.z.string().email("Invalid recipient email"),
  ccEmails: import_zod2.z.array(import_zod2.z.string().email()).default([]),
  subject: import_zod2.z.string().min(1, "Subject is required").max(200),
  message: import_zod2.z.string().max(5e3).optional(),
  attachPdf: import_zod2.z.boolean().default(true)
});
var quoteResponseSchema = import_zod2.z.object({
  action: import_zod2.z.enum(["accept", "reject", "request_revision"]),
  comment: import_zod2.z.string().max(2e3).optional(),
  purchaseOrderNumber: import_zod2.z.string().max(50).optional()
});
var quoteFilterSchema = import_zod2.z.object({
  search: import_zod2.z.string().optional(),
  status: quoteStatusSchema.optional(),
  customerId: import_zod2.z.string().optional(),
  createdBy: import_zod2.z.string().optional(),
  dateFrom: import_zod2.z.coerce.date().optional(),
  dateTo: import_zod2.z.coerce.date().optional(),
  minTotal: import_zod2.z.number().optional(),
  maxTotal: import_zod2.z.number().optional()
});

// src/forms/company.schema.ts
var import_zod3 = require("zod");
var companyTypeSchema = import_zod3.z.enum([
  "retailer",
  "wholesaler",
  "distributor",
  "manufacturer",
  "other"
]);
var companyStatusSchema = import_zod3.z.enum([
  "active",
  "pending_approval",
  "suspended",
  "inactive"
]);
var companyAddressSchema = import_zod3.z.object({
  line1: import_zod3.z.string().min(1, "Address line 1 is required").max(200),
  line2: import_zod3.z.string().max(200).optional(),
  city: import_zod3.z.string().min(1, "City is required").max(100),
  state: import_zod3.z.string().max(100).optional(),
  postalCode: import_zod3.z.string().min(1, "Postal code is required").max(20),
  country: import_zod3.z.string().min(2, "Country code must be 2 characters").max(2, "Country code must be 2 characters"),
  isDefault: import_zod3.z.boolean().default(false),
  label: import_zod3.z.string().max(50).optional()
});
var companyBillingSettingsSchema = import_zod3.z.object({
  /** Payment terms (e.g., 'NET30', 'NET60') */
  paymentTerms: import_zod3.z.string().min(1, "Payment terms are required").max(50),
  /** Credit limit */
  creditLimit: import_zod3.z.number().min(0, "Credit limit must be positive").optional(),
  /** Whether to auto-approve orders under credit limit */
  autoApproveUnderCreditLimit: import_zod3.z.boolean().default(false),
  /** Tax exemption status */
  taxExempt: import_zod3.z.boolean().default(false),
  /** Tax exemption certificate number */
  taxExemptionCertificate: import_zod3.z.string().max(100).optional(),
  /** Preferred currency */
  preferredCurrency: import_zod3.z.string().length(3, "Currency must be a 3-letter code").default("EUR"),
  /** Default billing address ID */
  defaultBillingAddressId: import_zod3.z.string().optional(),
  /** Invoice email */
  invoiceEmail: import_zod3.z.string().email("Invalid invoice email").optional(),
  /** PO required for orders */
  requirePurchaseOrder: import_zod3.z.boolean().default(false)
});
var companyShippingSettingsSchema = import_zod3.z.object({
  /** Default shipping address ID */
  defaultShippingAddressId: import_zod3.z.string().optional(),
  /** Preferred shipping method */
  preferredShippingMethod: import_zod3.z.string().max(50).optional(),
  /** Shipping account number (for carrier accounts) */
  shippingAccountNumber: import_zod3.z.string().max(50).optional(),
  /** Special shipping instructions */
  shippingInstructions: import_zod3.z.string().max(500).optional(),
  /** Allow partial shipments */
  allowPartialShipments: import_zod3.z.boolean().default(true),
  /** Consolidate shipments */
  consolidateShipments: import_zod3.z.boolean().default(false)
});
var companyOrderingSettingsSchema = import_zod3.z.object({
  /** Minimum order value */
  minimumOrderValue: import_zod3.z.number().min(0, "Minimum order must be positive").optional(),
  /** Maximum order value */
  maximumOrderValue: import_zod3.z.number().min(0, "Maximum order must be positive").optional(),
  /** Require approval for orders over amount */
  approvalThreshold: import_zod3.z.number().min(0).optional(),
  /** Allowed product categories (empty = all) */
  allowedCategories: import_zod3.z.array(import_zod3.z.string()).default([]),
  /** Blocked product categories */
  blockedCategories: import_zod3.z.array(import_zod3.z.string()).default([]),
  /** Enable bulk ordering */
  enableBulkOrdering: import_zod3.z.boolean().default(true),
  /** Enable quick reorder */
  enableQuickReorder: import_zod3.z.boolean().default(true),
  /** Default cost center */
  defaultCostCenter: import_zod3.z.string().max(50).optional()
});
var companyNotificationSettingsSchema = import_zod3.z.object({
  /** Order confirmation emails */
  orderConfirmation: import_zod3.z.boolean().default(true),
  /** Shipping notification emails */
  shippingNotification: import_zod3.z.boolean().default(true),
  /** Invoice emails */
  invoiceNotification: import_zod3.z.boolean().default(true),
  /** Quote emails */
  quoteNotification: import_zod3.z.boolean().default(true),
  /** Spending alert emails */
  spendingAlerts: import_zod3.z.boolean().default(true),
  /** Weekly spending summary */
  weeklySpendingSummary: import_zod3.z.boolean().default(false),
  /** Monthly spending summary */
  monthlySpendingSummary: import_zod3.z.boolean().default(true),
  /** Additional notification emails */
  additionalEmails: import_zod3.z.array(import_zod3.z.string().email()).default([])
});
var companyBrandingSettingsSchema = import_zod3.z.object({
  /** Company logo URL */
  logoUrl: import_zod3.z.string().url("Invalid logo URL").optional(),
  /** Primary brand color */
  primaryColor: import_zod3.z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  /** Custom CSS class prefix */
  cssPrefix: import_zod3.z.string().max(20).optional(),
  /** Custom footer text */
  footerText: import_zod3.z.string().max(500).optional()
});
var companyProfileSchema = import_zod3.z.object({
  /** Company legal name */
  legalName: import_zod3.z.string().min(1, "Legal name is required").max(200, "Legal name must be 200 characters or less"),
  /** Trading/display name */
  tradingName: import_zod3.z.string().max(200).optional(),
  /** Company type */
  type: companyTypeSchema,
  /** Tax ID / VAT number */
  taxId: import_zod3.z.string().min(1, "Tax ID is required").max(50, "Tax ID must be 50 characters or less"),
  /** Registration number */
  registrationNumber: import_zod3.z.string().max(50).optional(),
  /** Company website */
  website: import_zod3.z.string().url("Invalid website URL").optional().or(import_zod3.z.literal("")),
  /** Company phone */
  phone: import_zod3.z.string().max(30).optional(),
  /** Company email */
  email: import_zod3.z.string().email("Invalid email address"),
  /** Industry/sector */
  industry: import_zod3.z.string().max(100).optional(),
  /** Company description */
  description: import_zod3.z.string().max(2e3).optional(),
  /** Year established */
  yearEstablished: import_zod3.z.number().int().min(1800).max((/* @__PURE__ */ new Date()).getFullYear()).optional(),
  /** Number of employees */
  employeeCount: import_zod3.z.number().int().min(1).optional(),
  /** Annual revenue range */
  revenueRange: import_zod3.z.string().max(50).optional()
});
var companySettingsSchema = import_zod3.z.object({
  profile: companyProfileSchema,
  addresses: import_zod3.z.array(companyAddressSchema).default([]),
  billing: companyBillingSettingsSchema,
  shipping: companyShippingSettingsSchema,
  ordering: companyOrderingSettingsSchema,
  notifications: companyNotificationSettingsSchema,
  branding: companyBrandingSettingsSchema.optional()
});
var companyRegistrationSchema = import_zod3.z.object({
  profile: companyProfileSchema,
  primaryAddress: companyAddressSchema,
  primaryContact: import_zod3.z.object({
    firstName: import_zod3.z.string().min(1, "First name is required").max(50),
    lastName: import_zod3.z.string().min(1, "Last name is required").max(50),
    email: import_zod3.z.string().email("Invalid email address"),
    phone: import_zod3.z.string().max(30).optional(),
    jobTitle: import_zod3.z.string().max(100).optional()
  }),
  billing: companyBillingSettingsSchema.pick({
    paymentTerms: true,
    preferredCurrency: true,
    invoiceEmail: true
  }),
  acceptTerms: import_zod3.z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" })
  })
});
var companyFilterSchema = import_zod3.z.object({
  search: import_zod3.z.string().optional(),
  type: companyTypeSchema.optional(),
  status: companyStatusSchema.optional(),
  country: import_zod3.z.string().optional(),
  hasCredit: import_zod3.z.boolean().optional(),
  minCreditLimit: import_zod3.z.number().optional(),
  maxCreditLimit: import_zod3.z.number().optional()
});

// src/forms/spending-limit.schema.ts
var import_zod4 = require("zod");
var spendingPeriodSchema = import_zod4.z.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom"
]);
var spendingLimitTypeSchema = import_zod4.z.enum([
  "employee",
  "department",
  "cost_center",
  "company",
  "category"
]);
var spendingLimitStatusSchema = import_zod4.z.enum([
  "active",
  "paused",
  "expired",
  "exceeded"
]);
var thresholdActionSchema = import_zod4.z.enum([
  "notify",
  "notify_manager",
  "require_approval",
  "block"
]);
var spendingThresholdSchema = import_zod4.z.object({
  /** Percentage at which this threshold triggers (0-100) */
  percentage: import_zod4.z.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100"),
  /** Action to take when threshold is reached */
  action: thresholdActionSchema,
  /** Custom message for notifications */
  notificationMessage: import_zod4.z.string().max(500).optional(),
  /** Whether threshold is active */
  isActive: import_zod4.z.boolean().default(true)
});
var currencyConfigSchema = import_zod4.z.object({
  code: import_zod4.z.string().length(3, "Currency code must be 3 characters"),
  symbol: import_zod4.z.string().min(1).max(5),
  decimals: import_zod4.z.number().int().min(0).max(4).default(2),
  symbolPosition: import_zod4.z.enum(["before", "after"]).default("before"),
  thousandsSeparator: import_zod4.z.string().max(1).default(","),
  decimalSeparator: import_zod4.z.string().max(1).default(".")
});
var spendingLimitBaseSchema = import_zod4.z.object({
  /** Limit name */
  name: import_zod4.z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  /** Description */
  description: import_zod4.z.string().max(500).optional(),
  /** Limit type */
  type: spendingLimitTypeSchema,
  /** Maximum spending amount */
  maxAmount: import_zod4.z.number().positive("Maximum amount must be positive").max(999999999, "Maximum amount is too large"),
  /** Spending period */
  period: spendingPeriodSchema,
  /** Currency */
  currency: currencyConfigSchema.optional(),
  /** Whether limit is active */
  isActive: import_zod4.z.boolean().default(true),
  /** Whether to allow exceeding the limit */
  allowExceed: import_zod4.z.boolean().default(false),
  /** Soft limit (warning threshold) */
  softLimit: import_zod4.z.number().positive("Soft limit must be positive").optional(),
  /** Hard limit (absolute maximum) */
  hardLimit: import_zod4.z.number().positive("Hard limit must be positive").optional()
});
var employeeSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("employee"),
  /** Employee ID */
  employeeId: import_zod4.z.string().min(1, "Employee ID is required"),
  /** Per-order limit */
  orderLimit: import_zod4.z.number().positive().optional(),
  /** Require approval above amount */
  approvalThreshold: import_zod4.z.number().positive().optional(),
  /** Manager ID for approvals */
  managerId: import_zod4.z.string().optional(),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var departmentSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("department"),
  /** Department ID */
  departmentId: import_zod4.z.string().min(1, "Department ID is required"),
  /** Department name */
  departmentName: import_zod4.z.string().min(1).max(100),
  /** Whether to distribute across employees */
  distributeToEmployees: import_zod4.z.boolean().default(false),
  /** Per-employee limit when distributed */
  perEmployeeLimit: import_zod4.z.number().positive().optional(),
  /** Approval chain */
  approvalChain: import_zod4.z.array(import_zod4.z.string()).default([]),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var costCenterSpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("cost_center"),
  /** Cost center code */
  costCenterCode: import_zod4.z.string().min(1, "Cost center code is required").max(50),
  /** Cost center name */
  costCenterName: import_zod4.z.string().min(1).max(100),
  /** Account code */
  accountCode: import_zod4.z.string().max(50).optional(),
  /** GL code */
  glCode: import_zod4.z.string().max(50).optional(),
  /** Approval chain */
  approvalChain: import_zod4.z.array(import_zod4.z.string()).default([]),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var categorySpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("category"),
  /** Category ID */
  categoryId: import_zod4.z.string().min(1, "Category ID is required"),
  /** Category name */
  categoryName: import_zod4.z.string().min(1).max(100),
  /** Include subcategories */
  includeSubcategories: import_zod4.z.boolean().default(true),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var companySpendingLimitCreateSchema = spendingLimitBaseSchema.extend({
  type: import_zod4.z.literal("company"),
  /** Company ID */
  companyId: import_zod4.z.string().min(1, "Company ID is required"),
  /** Whether this is a global cap */
  isGlobalCap: import_zod4.z.boolean().default(true),
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).default([])
});
var spendingLimitCreateSchema = import_zod4.z.discriminatedUnion("type", [
  employeeSpendingLimitCreateSchema,
  departmentSpendingLimitCreateSchema,
  costCenterSpendingLimitCreateSchema,
  categorySpendingLimitCreateSchema,
  companySpendingLimitCreateSchema
]);
var spendingLimitUpdateSchema = spendingLimitBaseSchema.partial().extend({
  /** Custom thresholds */
  thresholds: import_zod4.z.array(spendingThresholdSchema).optional()
});
var spendingLimitFilterSchema = import_zod4.z.object({
  search: import_zod4.z.string().optional(),
  type: spendingLimitTypeSchema.optional(),
  status: spendingLimitStatusSchema.optional(),
  period: spendingPeriodSchema.optional(),
  employeeId: import_zod4.z.string().optional(),
  departmentId: import_zod4.z.string().optional(),
  isActive: import_zod4.z.boolean().optional(),
  isExceeded: import_zod4.z.boolean().optional()
});
var spendingTransactionSchema = import_zod4.z.object({
  /** Transaction amount */
  amount: import_zod4.z.number().positive("Amount must be positive"),
  /** Transaction description */
  description: import_zod4.z.string().max(500).optional(),
  /** Reference (order ID, etc.) */
  reference: import_zod4.z.string().max(100).optional(),
  /** Transaction date */
  transactionDate: import_zod4.z.coerce.date().default(() => /* @__PURE__ */ new Date()),
  /** Category */
  category: import_zod4.z.string().optional(),
  /** Cost center */
  costCenter: import_zod4.z.string().optional()
});
var spendingAdjustmentSchema = import_zod4.z.object({
  /** Adjustment amount (positive to increase, negative to decrease) */
  amount: import_zod4.z.number(),
  /** Reason for adjustment */
  reason: import_zod4.z.string().min(1, "Reason is required").max(500),
  /** Reference (order ID, refund ID, etc.) */
  reference: import_zod4.z.string().max(100).optional(),
  /** Approved by */
  approvedBy: import_zod4.z.string().min(1, "Approver is required")
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addressSchema,
  categorySpendingLimitCreateSchema,
  companyAddressSchema,
  companyBillingSettingsSchema,
  companyBrandingSettingsSchema,
  companyFilterSchema,
  companyNotificationSettingsSchema,
  companyOrderingSettingsSchema,
  companyProfileSchema,
  companyRegistrationSchema,
  companySettingsSchema,
  companyShippingSettingsSchema,
  companySpendingLimitCreateSchema,
  companyStatusSchema,
  companyTypeSchema,
  costCenterSpendingLimitCreateSchema,
  currencyConfigSchema,
  departmentSpendingLimitCreateSchema,
  discountTypeSchema,
  employeeBaseSchema,
  employeeBulkImportRowSchema,
  employeeCreateSchema,
  employeeFilterSchema,
  employeeInviteSchema,
  employeePermissionsSchema,
  employeeRoleSchema,
  employeeSpendingLimitCreateSchema,
  employeeSpendingLimitSchema,
  employeeStatusSchema,
  employeeUpdateSchema,
  lineItemDiscountSchema,
  quoteCreateSchema,
  quoteCustomerSchema,
  quoteDiscountSchema,
  quoteFilterSchema,
  quoteLineItemSchema,
  quotePricingSchema,
  quoteResponseSchema,
  quoteSendSchema,
  quoteStatusSchema,
  quoteTermsSchema,
  quoteUpdateSchema,
  spendingAdjustmentSchema,
  spendingLimitBaseSchema,
  spendingLimitCreateSchema,
  spendingLimitFilterSchema,
  spendingLimitStatusSchema,
  spendingLimitTypeSchema,
  spendingLimitUpdateSchema,
  spendingPeriodSchema,
  spendingThresholdSchema,
  spendingTransactionSchema,
  taxTypeSchema,
  thresholdActionSchema
});
//# sourceMappingURL=index.cjs.map