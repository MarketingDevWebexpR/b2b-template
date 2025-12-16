import { z } from "zod";

/**
 * Quote status schema
 */
export const quoteStatusSchema = z.enum([
  "draft",
  "pending_review",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
]);

export type QuoteStatus = z.infer<typeof quoteStatusSchema>;

/**
 * Discount type schema
 */
export const discountTypeSchema = z.enum(["percentage", "fixed", "per_unit"]);

export type DiscountType = z.infer<typeof discountTypeSchema>;

/**
 * Tax type schema
 */
export const taxTypeSchema = z.enum(["included", "excluded", "exempt"]);

export type TaxType = z.infer<typeof taxTypeSchema>;

/**
 * Address schema
 */
export const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(2),
});

export type AddressInput = z.infer<typeof addressSchema>;

/**
 * Quote customer schema
 */
export const quoteCustomerSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be 200 characters or less"),

  contactName: z
    .string()
    .min(1, "Contact name is required")
    .max(100, "Contact name must be 100 characters or less"),

  email: z.string().email("Invalid email address"),

  phone: z
    .string()
    .max(30, "Phone must be 30 characters or less")
    .optional()
    .or(z.literal("")),

  billingAddress: addressSchema.optional(),

  shippingAddress: addressSchema.optional(),

  taxId: z.string().max(50, "Tax ID must be 50 characters or less").optional(),

  paymentTerms: z.string().max(50).optional(),
});

export type QuoteCustomerInput = z.infer<typeof quoteCustomerSchema>;

/**
 * Quote line item discount schema
 */
export const lineItemDiscountSchema = z.object({
  type: discountTypeSchema,
  value: z.number().min(0, "Discount value must be positive"),
  reason: z.string().max(200).optional(),
});

export type LineItemDiscountInput = z.infer<typeof lineItemDiscountSchema>;

/**
 * Quote line item schema
 */
export const quoteLineItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),

  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be 200 characters or less"),

  description: z.string().max(1000).optional(),

  sku: z.string().max(50).optional(),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),

  unit: z.string().max(20).optional(),

  unitPrice: z.number().min(0, "Unit price must be positive"),

  discount: lineItemDiscountSchema.optional(),

  taxRate: z.number().min(0).max(100).optional(),

  customOptions: z.record(z.unknown()).optional(),

  leadTime: z.number().int().min(0).optional(),

  notes: z.string().max(500).optional(),
});

export type QuoteLineItemInput = z.infer<typeof quoteLineItemSchema>;

/**
 * Quote-level discount schema
 */
export const quoteDiscountSchema = z.object({
  type: discountTypeSchema,
  value: z.number().min(0, "Discount value must be positive"),
  code: z.string().max(50).optional(),
  reason: z.string().max(200).optional(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
});

export type QuoteDiscountInput = z.infer<typeof quoteDiscountSchema>;

/**
 * Quote terms schema
 */
export const quoteTermsSchema = z.object({
  paymentTerms: z
    .string()
    .min(1, "Payment terms are required")
    .max(50, "Payment terms must be 50 characters or less"),

  paymentDueDate: z.coerce.date().optional(),

  deliveryTerms: z.string().max(50).optional(),

  deliveryDate: z.coerce.date().optional(),

  validityDays: z
    .number()
    .int("Validity must be a whole number")
    .min(1, "Validity must be at least 1 day")
    .max(365, "Validity cannot exceed 365 days"),

  customTerms: z.string().max(5000, "Custom terms must be 5000 characters or less").optional(),

  notes: z.string().max(2000, "Notes must be 2000 characters or less").optional(),

  internalNotes: z
    .string()
    .max(2000, "Internal notes must be 2000 characters or less")
    .optional(),
});

export type QuoteTermsInput = z.infer<typeof quoteTermsSchema>;

/**
 * Quote pricing schema
 */
export const quotePricingSchema = z.object({
  shipping: z.number().min(0, "Shipping must be positive"),
  taxType: taxTypeSchema,
  taxRate: z.number().min(0, "Tax rate must be positive").max(100, "Tax rate cannot exceed 100%"),
  currency: z.string().length(3, "Currency must be a 3-letter code"),
});

export type QuotePricingInput = z.infer<typeof quotePricingSchema>;

/**
 * Complete quote create schema
 */
export const quoteCreateSchema = z.object({
  customer: quoteCustomerSchema,

  items: z
    .array(quoteLineItemSchema)
    .min(1, "Quote must have at least one item"),

  discounts: z.array(quoteDiscountSchema).default([]),

  pricing: quotePricingSchema,

  terms: quoteTermsSchema,

  metadata: z.record(z.unknown()).optional(),
});

export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>;

/**
 * Quote update schema
 */
export const quoteUpdateSchema = z.object({
  customer: quoteCustomerSchema.partial().optional(),

  items: z.array(quoteLineItemSchema).optional(),

  discounts: z.array(quoteDiscountSchema).optional(),

  pricing: quotePricingSchema.partial().optional(),

  terms: quoteTermsSchema.partial().optional(),

  status: quoteStatusSchema.optional(),

  metadata: z.record(z.unknown()).optional(),
});

export type QuoteUpdateInput = z.infer<typeof quoteUpdateSchema>;

/**
 * Quote send schema
 */
export const quoteSendSchema = z.object({
  recipientEmail: z.string().email("Invalid recipient email"),
  ccEmails: z.array(z.string().email()).default([]),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().max(5000).optional(),
  attachPdf: z.boolean().default(true),
});

export type QuoteSendInput = z.infer<typeof quoteSendSchema>;

/**
 * Quote response schema (accept/reject)
 */
export const quoteResponseSchema = z.object({
  action: z.enum(["accept", "reject", "request_revision"]),
  comment: z.string().max(2000).optional(),
  purchaseOrderNumber: z.string().max(50).optional(),
});

export type QuoteResponseInput = z.infer<typeof quoteResponseSchema>;

/**
 * Quote filter schema
 */
export const quoteFilterSchema = z.object({
  search: z.string().optional(),
  status: quoteStatusSchema.optional(),
  customerId: z.string().optional(),
  createdBy: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minTotal: z.number().optional(),
  maxTotal: z.number().optional(),
});

export type QuoteFilter = z.infer<typeof quoteFilterSchema>;
