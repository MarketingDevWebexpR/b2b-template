/**
 * B2B Company Address Model
 *
 * Represents a physical address associated with a company.
 * Each company can have multiple addresses for different purposes.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Address type values
 */
export const ADDRESS_TYPES = [
  "billing",
  "shipping",
  "headquarters",
  "warehouse",
] as const;

/**
 * B2B Company Address Model
 *
 * Stores address information for companies.
 * Supports multiple addresses per company with different types.
 *
 * @example
 * ```typescript
 * const address = await companyService.createCompanyAddresss({
 *   company_id: "comp_123",
 *   type: "shipping",
 *   label: "Entrepôt Principal",
 *   is_default: true,
 *   company_name: "Bijouterie Paris",
 *   address_line1: "123 Rue de la Paix",
 *   city: "Paris",
 *   postal_code: "75001",
 *   country_code: "FR",
 * });
 * ```
 */
export const CompanyAddress = model.define({ name: "CompanyAddress", tableName: "b2b_company_address" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Reference to company
  company_id: model.text(),

  // Address classification
  type: model.enum([...ADDRESS_TYPES]),
  label: model.text(),
  is_default: model.boolean().default(false),

  // Address details
  company_name: model.text(),
  attention: model.text().nullable(),
  address_line1: model.text(),
  address_line2: model.text().nullable(),
  city: model.text(),
  state: model.text().nullable(),
  postal_code: model.text(),
  country_code: model.text(),

  // Contact
  phone: model.text().nullable(),

  // Delivery instructions
  delivery_instructions: model.text().nullable(),

  // Verification status
  is_verified: model.boolean().default(false),
})
.indexes([
  { on: ["company_id"], name: "idx_address_company" },
  { on: ["company_id", "type"], name: "idx_address_company_type" },
  { on: ["company_id", "type", "is_default"], name: "idx_address_default" },
]);

export default CompanyAddress;
