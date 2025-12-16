/**
 * B2B Unit Membership Model
 *
 * Links customers to specific organizational units within a company.
 * Enables hierarchical access control and budget management per unit.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Unit membership role values
 *
 * - head: Unit leader with full control
 * - manager: Can manage unit operations and members
 * - lead: Can lead projects and approve within limits
 * - member: Standard unit member
 * - viewer: Read-only access to unit data
 */
export const UNIT_MEMBERSHIP_ROLES = [
  "head",
  "manager",
  "lead",
  "member",
  "viewer",
] as const;

/**
 * B2B Unit Membership Model
 *
 * Represents the relationship between a customer and an organizational unit.
 * A customer can belong to multiple units within the same company.
 *
 * @example
 * ```typescript
 * const unitMembership = await companyService.createUnitMemberships({
 *   unit_id: "unit_789",
 *   customer_id: "cust_456",
 *   company_id: "comp_123", // Denormalized for query efficiency
 *   role: "manager",
 *   is_default: true,
 *   can_approve: true,
 *   spending_limit: 500000, // 5,000.00 in cents - overrides company membership limit
 *   permissions: {
 *     canManageBudget: true,
 *     canAddMembers: true,
 *   },
 * });
 * ```
 */
export const UnitMembership = model.define(
  { name: "UnitMembership", tableName: "b2b_unit_membership" },
  {
    // Primary key
    id: model.id().primaryKey(),

    // Foreign keys
    unit_id: model.text(),
    customer_id: model.text(),
    // Denormalized for query efficiency - avoids joins when filtering by company
    company_id: model.text(),

    // Role within the unit
    role: model.enum([...UNIT_MEMBERSHIP_ROLES]).default("member"),

    // Default unit flag
    // When a customer places an order, this unit is pre-selected
    is_default: model.boolean().default(false),

    // Approval capability
    // If true, this member can approve orders for this unit
    can_approve: model.boolean().default(false),

    // Spending controls
    // Amount in cents, null = no unit-level limit (uses company membership limit)
    // When set, this overrides the company membership spending_limit for orders in this unit
    spending_limit: model.bigNumber().nullable(),

    // Unit-specific permissions (JSON)
    // {
    //   canManageBudget: boolean,
    //   canAddMembers: boolean,
    //   canRemoveMembers: boolean,
    //   canEditUnit: boolean,
    //   approvalThreshold: number,
    //   canViewAllUnitOrders: boolean,
    // }
    permissions: model.json().nullable(),

    // Extensibility
    metadata: model.json().nullable(),
  }
)
.indexes([
  { on: ["unit_id"], name: "idx_unit_membership_unit" },
  { on: ["customer_id"], name: "idx_unit_membership_customer" },
  { on: ["company_id"], name: "idx_unit_membership_company" },
  { on: ["unit_id", "customer_id"], name: "idx_unit_membership_unit_customer", unique: true },
  { on: ["customer_id", "company_id"], name: "idx_unit_membership_customer_company" },
  { on: ["customer_id", "is_default"], name: "idx_unit_membership_customer_default" },
  { on: ["unit_id", "role"], name: "idx_unit_membership_unit_role" },
  { on: ["unit_id", "can_approve"], name: "idx_unit_membership_unit_approvers" },
  { on: ["company_id", "customer_id", "is_default"], name: "idx_unit_membership_company_customer_default" },
]);

export default UnitMembership;
