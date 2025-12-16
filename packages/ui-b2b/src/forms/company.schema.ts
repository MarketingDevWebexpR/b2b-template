import { z } from "zod";

/**
 * Company type schema
 */
export const companyTypeSchema = z.enum([
  "retailer",
  "wholesaler",
  "distributor",
  "manufacturer",
  "other",
]);

export type CompanyType = z.infer<typeof companyTypeSchema>;

/**
 * Company status schema
 */
export const companyStatusSchema = z.enum([
  "active",
  "pending_approval",
  "suspended",
  "inactive",
]);

export type CompanyStatus = z.infer<typeof companyStatusSchema>;

/**
 * Address schema
 */
export const companyAddressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z
    .string()
    .min(2, "Country code must be 2 characters")
    .max(2, "Country code must be 2 characters"),
  isDefault: z.boolean().default(false),
  label: z.string().max(50).optional(),
});

export type CompanyAddressInput = z.infer<typeof companyAddressSchema>;

/**
 * Company billing settings schema
 */
export const companyBillingSettingsSchema = z.object({
  /** Payment terms (e.g., 'NET30', 'NET60') */
  paymentTerms: z.string().min(1, "Payment terms are required").max(50),

  /** Credit limit */
  creditLimit: z.number().min(0, "Credit limit must be positive").optional(),

  /** Whether to auto-approve orders under credit limit */
  autoApproveUnderCreditLimit: z.boolean().default(false),

  /** Tax exemption status */
  taxExempt: z.boolean().default(false),

  /** Tax exemption certificate number */
  taxExemptionCertificate: z.string().max(100).optional(),

  /** Preferred currency */
  preferredCurrency: z.string().length(3, "Currency must be a 3-letter code").default("EUR"),

  /** Default billing address ID */
  defaultBillingAddressId: z.string().optional(),

  /** Invoice email */
  invoiceEmail: z.string().email("Invalid invoice email").optional(),

  /** PO required for orders */
  requirePurchaseOrder: z.boolean().default(false),
});

export type CompanyBillingSettingsInput = z.infer<typeof companyBillingSettingsSchema>;

/**
 * Company shipping settings schema
 */
export const companyShippingSettingsSchema = z.object({
  /** Default shipping address ID */
  defaultShippingAddressId: z.string().optional(),

  /** Preferred shipping method */
  preferredShippingMethod: z.string().max(50).optional(),

  /** Shipping account number (for carrier accounts) */
  shippingAccountNumber: z.string().max(50).optional(),

  /** Special shipping instructions */
  shippingInstructions: z.string().max(500).optional(),

  /** Allow partial shipments */
  allowPartialShipments: z.boolean().default(true),

  /** Consolidate shipments */
  consolidateShipments: z.boolean().default(false),
});

export type CompanyShippingSettingsInput = z.infer<typeof companyShippingSettingsSchema>;

/**
 * Company ordering settings schema
 */
export const companyOrderingSettingsSchema = z.object({
  /** Minimum order value */
  minimumOrderValue: z.number().min(0, "Minimum order must be positive").optional(),

  /** Maximum order value */
  maximumOrderValue: z.number().min(0, "Maximum order must be positive").optional(),

  /** Require approval for orders over amount */
  approvalThreshold: z.number().min(0).optional(),

  /** Allowed product categories (empty = all) */
  allowedCategories: z.array(z.string()).default([]),

  /** Blocked product categories */
  blockedCategories: z.array(z.string()).default([]),

  /** Enable bulk ordering */
  enableBulkOrdering: z.boolean().default(true),

  /** Enable quick reorder */
  enableQuickReorder: z.boolean().default(true),

  /** Default cost center */
  defaultCostCenter: z.string().max(50).optional(),
});

export type CompanyOrderingSettingsInput = z.infer<typeof companyOrderingSettingsSchema>;

/**
 * Company notification settings schema
 */
export const companyNotificationSettingsSchema = z.object({
  /** Order confirmation emails */
  orderConfirmation: z.boolean().default(true),

  /** Shipping notification emails */
  shippingNotification: z.boolean().default(true),

  /** Invoice emails */
  invoiceNotification: z.boolean().default(true),

  /** Quote emails */
  quoteNotification: z.boolean().default(true),

  /** Spending alert emails */
  spendingAlerts: z.boolean().default(true),

  /** Weekly spending summary */
  weeklySpendingSummary: z.boolean().default(false),

  /** Monthly spending summary */
  monthlySpendingSummary: z.boolean().default(true),

  /** Additional notification emails */
  additionalEmails: z.array(z.string().email()).default([]),
});

export type CompanyNotificationSettingsInput = z.infer<typeof companyNotificationSettingsSchema>;

/**
 * Company branding settings schema
 */
export const companyBrandingSettingsSchema = z.object({
  /** Company logo URL */
  logoUrl: z.string().url("Invalid logo URL").optional(),

  /** Primary brand color */
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),

  /** Custom CSS class prefix */
  cssPrefix: z.string().max(20).optional(),

  /** Custom footer text */
  footerText: z.string().max(500).optional(),
});

export type CompanyBrandingSettingsInput = z.infer<typeof companyBrandingSettingsSchema>;

/**
 * Complete company profile schema
 */
export const companyProfileSchema = z.object({
  /** Company legal name */
  legalName: z
    .string()
    .min(1, "Legal name is required")
    .max(200, "Legal name must be 200 characters or less"),

  /** Trading/display name */
  tradingName: z.string().max(200).optional(),

  /** Company type */
  type: companyTypeSchema,

  /** Tax ID / VAT number */
  taxId: z
    .string()
    .min(1, "Tax ID is required")
    .max(50, "Tax ID must be 50 characters or less"),

  /** Registration number */
  registrationNumber: z.string().max(50).optional(),

  /** Company website */
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),

  /** Company phone */
  phone: z.string().max(30).optional(),

  /** Company email */
  email: z.string().email("Invalid email address"),

  /** Industry/sector */
  industry: z.string().max(100).optional(),

  /** Company description */
  description: z.string().max(2000).optional(),

  /** Year established */
  yearEstablished: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),

  /** Number of employees */
  employeeCount: z.number().int().min(1).optional(),

  /** Annual revenue range */
  revenueRange: z.string().max(50).optional(),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

/**
 * Complete company settings schema
 */
export const companySettingsSchema = z.object({
  profile: companyProfileSchema,
  addresses: z.array(companyAddressSchema).default([]),
  billing: companyBillingSettingsSchema,
  shipping: companyShippingSettingsSchema,
  ordering: companyOrderingSettingsSchema,
  notifications: companyNotificationSettingsSchema,
  branding: companyBrandingSettingsSchema.optional(),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

/**
 * Company registration schema (for new companies)
 */
export const companyRegistrationSchema = z.object({
  profile: companyProfileSchema,
  primaryAddress: companyAddressSchema,
  primaryContact: z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    phone: z.string().max(30).optional(),
    jobTitle: z.string().max(100).optional(),
  }),
  billing: companyBillingSettingsSchema.pick({
    paymentTerms: true,
    preferredCurrency: true,
    invoiceEmail: true,
  }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;

/**
 * Company filter schema
 */
export const companyFilterSchema = z.object({
  search: z.string().optional(),
  type: companyTypeSchema.optional(),
  status: companyStatusSchema.optional(),
  country: z.string().optional(),
  hasCredit: z.boolean().optional(),
  minCreditLimit: z.number().optional(),
  maxCreditLimit: z.number().optional(),
});

export type CompanyFilter = z.infer<typeof companyFilterSchema>;
