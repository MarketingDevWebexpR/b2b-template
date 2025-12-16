/**
 * B2B Company Membership Model
 *
 * Links Medusa customers to B2B companies with role-based access control.
 * Supports many-to-many relationships with additional membership metadata.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Membership role values
 *
 * - owner: Full control, can delete company
 * - admin: Full access except company deletion
 * - manager: Can manage orders, quotes, and team members
 * - buyer: Can create orders and quotes
 * - approver: Can approve orders (typically combined with other roles via permissions)
 * - viewer: Read-only access
 */
export const MEMBERSHIP_ROLES = [
  "owner",
  "admin",
  "manager",
  "buyer",
  "approver",
  "viewer",
] as const;

/**
 * Membership status values
 *
 * - pending: Invitation sent, awaiting acceptance
 * - active: Fully active membership
 * - suspended: Temporarily disabled
 * - inactive: Permanently disabled
 */
export const MEMBERSHIP_STATUSES = [
  "pending",
  "active",
  "suspended",
  "inactive",
] as const;

/**
 * B2B Company Membership Model
 *
 * Represents the relationship between a customer and a company.
 * A customer can belong to multiple companies, and a company can have multiple customers.
 *
 * @example
 * ```typescript
 * const membership = await companyService.createCompanyMemberships({
 *   company_id: "comp_123",
 *   customer_id: "cust_456",
 *   role: "buyer",
 *   is_primary: true,
 *   status: "active",
 *   job_title: "Purchasing Manager",
 *   spending_limit: 1000000, // 10,000.00 in cents
 *   permissions: {
 *     canCreateOrders: true,
 *     canViewAllOrders: false,
 *     canManageTeam: false,
 *   },
 * });
 * ```
 */
export const CompanyMembership = model.define(
  { name: "CompanyMembership", tableName: "b2b_company_membership" },
  {
    // Primary key
    id: model.id().primaryKey(),

    // Foreign keys
    company_id: model.text(),
    customer_id: model.text(),

    // Role and access
    role: model.enum([...MEMBERSHIP_ROLES]).default("buyer"),
    is_primary: model.boolean().default(false),

    // Employee information
    job_title: model.text().nullable(),
    employee_number: model.text().nullable(),

    // Spending controls
    // Amount in cents, null = no limit (inherits company default)
    spending_limit: model.bigNumber().nullable(),

    // Granular permissions (JSON)
    // {
    //   canCreateOrders: boolean,
    //   canApproveOrders: boolean,
    //   canViewAllOrders: boolean,
    //   canManageTeam: boolean,
    //   canManageAddresses: boolean,
    //   canViewPricing: boolean,
    //   canRequestQuotes: boolean,
    //   maxOrderValue: number,
    //   allowedCategories: string[],
    //   restrictedCategories: string[],
    // }
    permissions: model.json().nullable(),

    // Status
    status: model.enum([...MEMBERSHIP_STATUSES]).default("pending"),

    // Invitation tracking
    invited_by: model.text().nullable(),
    joined_at: model.dateTime().nullable(),

    // Extensibility
    metadata: model.json().nullable(),
  }
)
.indexes([
  { on: ["company_id"], name: "idx_membership_company" },
  { on: ["customer_id"], name: "idx_membership_customer" },
  { on: ["company_id", "customer_id"], name: "idx_membership_company_customer", unique: true },
  { on: ["customer_id", "is_primary"], name: "idx_membership_customer_primary" },
  { on: ["company_id", "role"], name: "idx_membership_company_role" },
  { on: ["company_id", "status"], name: "idx_membership_company_status" },
  { on: ["status"], name: "idx_membership_status" },
]);

export default CompanyMembership;
