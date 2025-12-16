/**
 * B2B Company Unit Model
 *
 * Represents hierarchical organizational units (departments, services, teams)
 * within a company. Supports tree structure with materialized path for
 * efficient hierarchy queries.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Company unit type values
 */
export const COMPANY_UNIT_TYPES = [
  "department",
  "service",
  "team",
  "division",
  "branch",
  "office",
] as const;

/**
 * B2B Company Unit Model
 *
 * Hierarchical organizational structure within a company.
 * Uses materialized path pattern for efficient tree operations.
 *
 * @example
 * ```typescript
 * const unit = await companyService.createCompanyUnits({
 *   company_id: "comp_123",
 *   name: "Engineering",
 *   slug: "engineering",
 *   type: "department",
 *   path: "/engineering",
 *   level: 0,
 *   sort_order: 1,
 * });
 *
 * const subUnit = await companyService.createCompanyUnits({
 *   company_id: "comp_123",
 *   parent_id: unit.id,
 *   name: "Frontend Team",
 *   slug: "frontend-team",
 *   type: "team",
 *   path: "/engineering/frontend-team",
 *   level: 1,
 *   sort_order: 0,
 * });
 * ```
 */
export const CompanyUnit = model.define({ name: "CompanyUnit", tableName: "b2b_company_unit" }, {
  // Primary key
  id: model.id().primaryKey(),

  // Reference to company
  company_id: model.text(),

  // Self-reference for hierarchy
  parent_id: model.text().nullable(),

  // Unit identification
  name: model.text().searchable(),
  slug: model.text(),
  type: model.enum([...COMPANY_UNIT_TYPES]),
  description: model.text().nullable(),

  // Hierarchy management (materialized path pattern)
  // Path format: "/parent-slug/child-slug" for efficient tree queries
  path: model.text(),
  // Depth in tree (0 for root units)
  level: model.number(),

  // Display ordering within same parent
  sort_order: model.number().default(0),

  // Manager reference (will link to customer via module link)
  manager_id: model.text().nullable(),

  // Flexible configuration
  // { budget_limit, can_approve_orders, max_approval_amount, etc. }
  settings: model.json().nullable(),

  // Custom metadata
  metadata: model.json().nullable(),

  // Status
  is_active: model.boolean().default(true),
})
.indexes([
  { on: ["company_id"], name: "idx_unit_company" },
  { on: ["company_id", "slug"], name: "idx_unit_company_slug", unique: true },
  { on: ["company_id", "parent_id"], name: "idx_unit_company_parent" },
  { on: ["company_id", "type"], name: "idx_unit_company_type" },
  { on: ["company_id", "is_active"], name: "idx_unit_company_active" },
  { on: ["path"], name: "idx_unit_path" },
  { on: ["manager_id"], name: "idx_unit_manager" },
]);

export default CompanyUnit;
