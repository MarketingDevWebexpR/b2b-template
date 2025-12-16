/**
 * B2B Company Model
 *
 * Represents a business entity in the B2B e-commerce platform.
 * Companies can have multiple employees, addresses, and payment terms.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Company status values
 */
export const COMPANY_STATUSES = [
  "pending",
  "active",
  "suspended",
  "inactive",
  "closed",
] as const;

/**
 * Company tier values
 */
export const COMPANY_TIERS = [
  "standard",
  "premium",
  "enterprise",
  "vip",
] as const;

/**
 * B2B Company Model
 *
 * Core entity representing a business customer in the B2B platform.
 *
 * @example
 * ```typescript
 * const company = await companyService.createCompanies({
 *   name: "Bijouterie Paris",
 *   slug: "bijouterie-paris",
 *   email: "contact@bijouterie-paris.fr",
 *   status: "pending",
 *   tier: "standard",
 *   credit_limit: 50000,
 *   payment_terms: { type: "net_30", days: 30 },
 * });
 * ```
 */
export const Company = model.define({ name: "Company", tableName: "b2b_company" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Business identification
  name: model.text().searchable(),
  trade_name: model.text().nullable(),
  slug: model.text().unique().searchable(),
  logo_url: model.text().nullable(),
  website: model.text().nullable(),
  description: model.text().nullable(),

  // Legal identifiers
  tax_id: model.text().nullable(),
  registration_number: model.text().nullable(),
  duns_number: model.text().nullable(),
  industry_code: model.text().nullable(),

  // Contact information
  email: model.text(),
  phone: model.text().nullable(),
  fax: model.text().nullable(),

  // Status and tier
  status: model.enum([...COMPANY_STATUSES]).default("pending"),
  tier: model.enum([...COMPANY_TIERS]).default("standard"),

  // Credit management
  credit_limit: model.bigNumber().default(0),

  // Payment terms (JSON)
  // { type: "net_30", days: 30, allowPartialPayments: false, earlyPaymentDiscount: 2 }
  payment_terms: model.json(),

  // Company settings (JSON)
  // { defaultCurrency, defaultLanguage, taxExempt, requireOrderApproval, etc. }
  settings: model.json(),

  // Account management
  account_manager_id: model.text().nullable(),
  sales_rep_id: model.text().nullable(),
  notes: model.text().nullable(),

  // Default addresses (denormalized for quick access)
  default_billing_address_id: model.text().nullable(),
  default_shipping_address_id: model.text().nullable(),

  // Activity tracking
  last_order_at: model.dateTime().nullable(),
})
.indexes([
  { on: ["status"], name: "idx_company_status" },
  { on: ["tier"], name: "idx_company_tier" },
  { on: ["email"], name: "idx_company_email" },
  { on: ["slug"], name: "idx_company_slug", unique: true },
  { on: ["status", "tier"], name: "idx_company_status_tier" },
]);

export default Company;
