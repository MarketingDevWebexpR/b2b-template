/**
 * B2B Company Module Service
 *
 * Service class providing business logic for company management including:
 * - Company CRUD and business operations
 * - Company addresses
 * - Organizational units (hierarchical departments/services)
 * - Company memberships (customer-company associations)
 * - Unit memberships (customer-unit associations)
 *
 * Uses MedusaService with proper model configuration.
 *
 * @packageDocumentation
 */

import { MedusaService } from "@medusajs/framework/utils";
import {
  Company,
  CompanyAddress,
  CompanyUnit,
  CompanyMembership,
  UnitMembership,
  COMPANY_STATUSES,
  COMPANY_TIERS,
  ADDRESS_TYPES,
  COMPANY_UNIT_TYPES,
  MEMBERSHIP_ROLES,
  MEMBERSHIP_STATUSES,
  UNIT_MEMBERSHIP_ROLES,
} from "./models/index";
import {
  validateRequired,
  validateStringLength,
  validateEmail,
  validateNonNegative,
  validateOptional,
  validatePhone,
} from "../validation-utils";

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Payment terms types
 */
export type PaymentTermType = "prepaid" | "net_15" | "net_30" | "net_45" | "net_60" | "net_90" | "due_on_receipt";

/**
 * Payment terms configuration
 */
export interface PaymentTerms {
  type: PaymentTermType;
  days: number;
  allowPartialPayments?: boolean;
  earlyPaymentDiscount?: number;
  earlyPaymentDays?: number;
}

/**
 * Company settings configuration
 */
export interface CompanySettings {
  defaultCurrency: string;
  defaultLanguage: string;
  taxExempt: boolean;
  marketingOptIn: boolean;
  orderNotificationEmails: string[];
  invoiceNotificationEmails: string[];
  allowEmployeeOrders: boolean;
  requireOrderApproval: boolean;
  allowCreditPurchases: boolean;
  autoReorderEnabled: boolean;
}

/**
 * Company status type
 */
export type CompanyStatus = typeof COMPANY_STATUSES[number];

/**
 * Company tier type
 */
export type CompanyTier = typeof COMPANY_TIERS[number];

/**
 * Address type
 */
export type AddressType = typeof ADDRESS_TYPES[number];

/**
 * Company unit type
 */
export type CompanyUnitType = typeof COMPANY_UNIT_TYPES[number];

/**
 * Membership role type
 */
export type MembershipRole = typeof MEMBERSHIP_ROLES[number];

/**
 * Membership status type
 */
export type MembershipStatus = typeof MEMBERSHIP_STATUSES[number];

/**
 * Unit membership role type
 */
export type UnitMembershipRole = typeof UNIT_MEMBERSHIP_ROLES[number];

/**
 * Input for creating a company
 */
export interface CreateCompanyInput {
  name: string;
  tradeName?: string;
  email: string;
  phone?: string;
  taxId?: string;
  registrationNumber?: string;
  website?: string;
  description?: string;
  tier?: CompanyTier;
  creditLimit?: number;
  paymentTerms?: Partial<PaymentTerms>;
  settings?: Partial<CompanySettings>;
  accountManagerId?: string;
  salesRepId?: string;
}

/**
 * Input for creating an address
 */
export interface CreateAddressInput {
  type: AddressType;
  label: string;
  is_default?: boolean;
  company_name: string;
  attention?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country_code: string;
  phone?: string;
  delivery_instructions?: string;
}

/**
 * Input for creating a company unit
 */
export interface CreateUnitInput {
  name: string;
  slug?: string;
  type: CompanyUnitType;
  description?: string;
  parent_id?: string | null;
  sort_order?: number;
  manager_id?: string;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating a company unit
 */
export interface UpdateUnitInput {
  name?: string;
  slug?: string;
  type?: CompanyUnitType;
  description?: string;
  parent_id?: string | null;
  sort_order?: number;
  manager_id?: string | null;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  is_active?: boolean;
}

/**
 * Unit tree node structure for getUnitTree
 */
export interface UnitTreeNode {
  id: string;
  name: string;
  slug: string;
  type: CompanyUnitType;
  level: number;
  path: string;
  parent_id: string | null;
  manager_id: string | null;
  is_active: boolean;
  children: UnitTreeNode[];
}

/**
 * Filter options for listing units
 */
export interface ListUnitsFilters {
  parent_id?: string | null;
  type?: CompanyUnitType;
  is_active?: boolean;
  manager_id?: string;
}

/**
 * Input for creating a company membership
 */
export interface CreateMembershipInput {
  role?: MembershipRole;
  is_primary?: boolean;
  job_title?: string;
  employee_number?: string;
  spending_limit?: number;
  permissions?: Record<string, unknown>;
  status?: MembershipStatus;
  invited_by?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating a company membership
 */
export interface UpdateMembershipInput {
  role?: MembershipRole;
  is_primary?: boolean;
  job_title?: string;
  employee_number?: string;
  spending_limit?: number | null;
  permissions?: Record<string, unknown>;
  status?: MembershipStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Filter options for listing company members
 */
export interface ListMembersFilters {
  role?: MembershipRole;
  status?: MembershipStatus;
  is_primary?: boolean;
}

/**
 * Input for creating a unit membership
 */
export interface CreateUnitMembershipInput {
  role?: UnitMembershipRole;
  is_default?: boolean;
  can_approve?: boolean;
  spending_limit?: number;
  permissions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating a unit membership
 */
export interface UpdateUnitMembershipInput {
  role?: UnitMembershipRole;
  is_default?: boolean;
  can_approve?: boolean;
  spending_limit?: number | null;
  permissions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Valid status transitions
 */
const STATUS_TRANSITIONS: Record<CompanyStatus, CompanyStatus[]> = {
  pending: ["active", "inactive", "closed"],
  active: ["suspended", "inactive", "closed"],
  suspended: ["active", "inactive", "closed"],
  inactive: ["active", "closed"],
  closed: [], // Terminal state
};

/**
 * B2B Company Module Service
 *
 * Provides all business logic for managing companies, addresses, units, and memberships.
 * Extends MedusaService to get automatic CRUD operations.
 *
 * Generated methods from MedusaService (based on model key names):
 * For Company:
 * - listCompanies(filters?, config?) - list companies
 * - listAndCountCompanies(filters?, config?) - list with count
 * - retrieveCompany(id, config?) - get single company
 * - createCompanies(data) - create companies
 * - updateCompanies(data) - update companies
 * - deleteCompanies(ids) - delete companies
 * - softDeleteCompanies(ids) - soft delete
 * - restoreCompanies(ids) - restore soft deleted
 *
 * For CompanyAddress:
 * - listCompanyAddresses, retrieveCompanyAddress, createCompanyAddresses, etc.
 *
 * For CompanyUnit:
 * - listCompanyUnits, retrieveCompanyUnit, createCompanyUnits, etc.
 *
 * For CompanyMembership:
 * - listCompanyMemberships, retrieveCompanyMembership, createCompanyMemberships, etc.
 *
 * For UnitMembership:
 * - listUnitMemberships, retrieveUnitMembership, createUnitMemberships, etc.
 *
 * @example
 * ```typescript
 * // List companies using generated method
 * const companies = await companyService.listCompanies();
 *
 * // Use custom business method
 * const company = await companyService.createCompanyWithSlug({
 *   name: "Bijouterie Paris",
 *   email: "contact@bijouterie-paris.fr",
 * });
 *
 * // Create organizational unit
 * const unit = await companyService.createUnit(company.id, {
 *   name: "Sales Department",
 *   type: "department",
 * });
 *
 * // Add customer to company
 * const membership = await companyService.addCustomerToCompany(
 *   company.id,
 *   customerId,
 *   { role: "buyer", is_primary: true }
 * );
 * ```
 */
class CompanyModuleService extends MedusaService({
  Company,
  CompanyAddress,
  CompanyUnit,
  CompanyMembership,
  UnitMembership,
}) {
  // ==========================================
  // CUSTOM COMPANY METHODS
  // ==========================================

  /**
   * Creates a company with an auto-generated unique slug.
   * Validates input and normalizes payment terms and settings.
   */
  async createCompanyWithSlug(data: CreateCompanyInput) {
    // Validate required fields
    validateRequired(data.name, "name");
    validateStringLength(data.name, "name", 1, 200);

    validateRequired(data.email, "email");
    validateEmail(data.email);

    // Validate optional fields
    validateOptional(data.creditLimit, (value) =>
      validateNonNegative(value, "creditLimit")
    );

    validateOptional(data.phone, (value) =>
      validatePhone(value, "phone")
    );

    const slug = this.generateSlug(data.name);
    const paymentTerms = this.normalizePaymentTerms(data.paymentTerms);
    const settings = this.normalizeSettings(data.settings);

    const companyData = {
      name: data.name,
      trade_name: data.tradeName ?? null,
      slug,
      email: data.email,
      phone: data.phone ?? null,
      tax_id: data.taxId ?? null,
      registration_number: data.registrationNumber ?? null,
      website: data.website ?? null,
      description: data.description ?? null,
      status: "pending" as CompanyStatus,
      tier: data.tier ?? "standard",
      credit_limit: data.creditLimit ?? 0,
      payment_terms: paymentTerms as unknown as Record<string, unknown>,
      settings: settings as unknown as Record<string, unknown>,
      account_manager_id: data.accountManagerId ?? null,
      sales_rep_id: data.salesRepId ?? null,
    };

    // Use the generated createCompanies method
    const company = await this.createCompanies(companyData);
    return company;
  }

  // ==========================================
  // BUSINESS LOGIC METHODS
  // ==========================================

  /**
   * Updates a company's status with validation of transitions.
   */
  async updateCompanyStatus(
    id: string,
    status: CompanyStatus,
    reason?: string
  ) {
    const company = await this.retrieveCompany(id);

    // Validate status transition
    this.validateStatusTransition(company.status as CompanyStatus, status);

    const currentNotes = (company.notes as string) ?? "";
    const newNote = reason
      ? `\n[${new Date().toISOString()}] Status changed to ${status}: ${reason}`
      : "";

    return await this.updateCompanies({ id, status, notes: currentNotes + newNote });
  }


  // ==========================================
  // COMPANY LOOKUP
  // ==========================================

  /**
   * Finds a company by its slug.
   */
  async findBySlug(slug: string) {
    const companies = await this.listCompanies({ slug });
    return companies[0] ?? null;
  }

  /**
   * Finds a company by its email.
   */
  async findByEmail(email: string) {
    const companies = await this.listCompanies({ email });
    return companies[0] ?? null;
  }

  /**
   * Lists companies by status.
   */
  async listByStatus(status: CompanyStatus) {
    return await this.listCompanies({ status });
  }

  /**
   * Lists companies by tier.
   */
  async listByTier(tier: CompanyTier) {
    return await this.listCompanies({ tier });
  }

  // ==========================================
  // ADDRESS MANAGEMENT
  // ==========================================

  /**
   * Adds a new address to a company.
   */
  async addAddress(companyId: string, data: CreateAddressInput) {
    // If this is set as default, unset other defaults of same type
    if (data.is_default) {
      await this.unsetDefaultAddresses(companyId, data.type);
    }

    const address = await this.createCompanyAddresses({
      ...data,
      company_id: companyId,
    });

    // Update company default address reference
    if (data.is_default) {
      await this.updateCompanyDefaultAddress(companyId, data.type, address.id);
    }

    return address;
  }

  /**
   * Sets an address as the default for its type.
   */
  async setDefaultAddress(companyId: string, addressId: string) {
    const address = await this.retrieveCompanyAddress(addressId);

    if (address.company_id !== companyId) {
      throw new Error("Address does not belong to company");
    }

    await this.unsetDefaultAddresses(companyId, address.type as AddressType);
    await this.updateCompanyAddresses({ id: addressId, is_default: true });
    await this.updateCompanyDefaultAddress(companyId, address.type as AddressType, addressId);
  }

  /**
   * Gets all addresses for a company, optionally filtered by type.
   */
  async getCompanyAddresses(companyId: string, type?: AddressType) {
    const filters: Record<string, unknown> = { company_id: companyId };
    if (type) {
      filters["type"] = type;
    }
    return await this.listCompanyAddresses(filters);
  }

  /**
   * Gets the default address for a company by type.
   */
  async getDefaultAddress(companyId: string, type: AddressType) {
    const addresses = await this.listCompanyAddresses({
      company_id: companyId,
      type,
      is_default: true,
    });
    return addresses[0] ?? null;
  }

  // ==========================================
  // COMPANY UNIT MANAGEMENT
  // ==========================================

  /**
   * Creates a new organizational unit within a company.
   * Auto-generates path based on parent unit hierarchy.
   *
   * @param companyId - The company to create the unit in
   * @param data - Unit creation data
   * @returns The created unit
   */
  async createUnit(companyId: string, data: CreateUnitInput) {
    validateRequired(data.name, "name");
    validateStringLength(data.name, "name", 1, 200);
    validateRequired(data.type, "type");

    // Generate slug if not provided
    const slug = data.slug ?? this.generateUnitSlug(data.name);

    // Check for slug uniqueness within company
    const existingUnit = await this.listCompanyUnits({
      company_id: companyId,
      slug,
    });
    if (existingUnit.length > 0) {
      throw new Error(`A unit with slug "${slug}" already exists in this company`);
    }

    // Calculate path and level based on parent
    const { path, level } = await this.generateUnitPath(companyId, data.parent_id ?? null, slug);

    const unitData = {
      company_id: companyId,
      parent_id: data.parent_id ?? null,
      name: data.name,
      slug,
      type: data.type,
      description: data.description ?? null,
      path,
      level,
      sort_order: data.sort_order ?? 0,
      manager_id: data.manager_id ?? null,
      settings: data.settings ?? null,
      metadata: data.metadata ?? null,
      is_active: true,
    };

    return await this.createCompanyUnits(unitData);
  }

  /**
   * Updates an existing organizational unit.
   * Recalculates path for this unit and all descendants if parent changes.
   *
   * @param unitId - The unit ID to update
   * @param data - Update data
   * @returns The updated unit
   */
  async updateUnit(unitId: string, data: UpdateUnitInput) {
    const unit = await this.retrieveCompanyUnit(unitId);
    const oldPath = unit.path as string;
    const oldParentId = unit.parent_id as string | null;

    // If parent is changing, need to recalculate paths
    if (data.parent_id !== undefined && data.parent_id !== oldParentId) {
      // Prevent circular reference
      if (data.parent_id !== null) {
        const newParent = await this.retrieveCompanyUnit(data.parent_id);
        const newParentPath = newParent.path as string;
        if (newParentPath.includes(`/${unit.id}`)) {
          throw new Error("Cannot move unit under its own descendant");
        }
      }

      // Generate new slug if provided, otherwise keep old
      const slug = data.slug ?? (unit.slug as string);

      // Calculate new path and level
      const { path: newPath, level: newLevel } = await this.generateUnitPath(
        unit.company_id as string,
        data.parent_id,
        slug
      );

      // Update this unit
      await this.updateCompanyUnits({
        id: unitId,
        ...data,
        slug,
        path: newPath,
        level: newLevel,
      });

      // Update all descendant paths
      await this.updateDescendantPaths(unitId, oldPath, newPath);

      return await this.retrieveCompanyUnit(unitId);
    }

    // Simple update without path change
    const updateData: Record<string, unknown> = { id: unitId };
    if (data.name !== undefined) updateData["name"] = data.name;
    if (data.slug !== undefined) {
      // Check slug uniqueness
      const existingUnit = await this.listCompanyUnits({
        company_id: unit.company_id,
        slug: data.slug,
      });
      if (existingUnit.length > 0 && existingUnit[0].id !== unitId) {
        throw new Error(`A unit with slug "${data.slug}" already exists in this company`);
      }
      updateData["slug"] = data.slug;
    }
    if (data.type !== undefined) updateData["type"] = data.type;
    if (data.description !== undefined) updateData["description"] = data.description;
    if (data.sort_order !== undefined) updateData["sort_order"] = data.sort_order;
    if (data.manager_id !== undefined) updateData["manager_id"] = data.manager_id;
    if (data.settings !== undefined) updateData["settings"] = data.settings;
    if (data.metadata !== undefined) updateData["metadata"] = data.metadata;
    if (data.is_active !== undefined) updateData["is_active"] = data.is_active;

    return await this.updateCompanyUnits(updateData);
  }

  /**
   * Soft deletes an organizational unit.
   * Throws error if the unit has active children.
   *
   * @param unitId - The unit ID to delete
   */
  async deleteUnit(unitId: string): Promise<void> {
    const unit = await this.retrieveCompanyUnit(unitId);

    // Check for active children
    const children = await this.listCompanyUnits({
      company_id: unit.company_id,
      parent_id: unitId,
      is_active: true,
    });

    if (children.length > 0) {
      throw new Error(
        `Cannot delete unit with ${children.length} active child unit(s). ` +
        "Delete or deactivate children first."
      );
    }

    // Soft delete by setting is_active to false
    await this.updateCompanyUnits({ id: unitId, is_active: false });
  }

  /**
   * Lists units for a company with optional filters.
   *
   * @param companyId - The company ID
   * @param filters - Optional filters
   * @returns List of units matching filters
   */
  async listUnits(companyId: string, filters?: ListUnitsFilters) {
    const queryFilters: Record<string, unknown> = { company_id: companyId };

    if (filters?.parent_id !== undefined) {
      queryFilters["parent_id"] = filters.parent_id;
    }
    if (filters?.type !== undefined) {
      queryFilters["type"] = filters.type;
    }
    if (filters?.is_active !== undefined) {
      queryFilters["is_active"] = filters.is_active;
    }
    if (filters?.manager_id !== undefined) {
      queryFilters["manager_id"] = filters.manager_id;
    }

    return await this.listCompanyUnits(queryFilters);
  }

  /**
   * Gets the full organizational tree structure for a company.
   * Returns a hierarchical array of units with nested children.
   *
   * @param companyId - The company ID
   * @returns Tree structure of all units
   */
  async getUnitTree(companyId: string): Promise<UnitTreeNode[]> {
    // Get all active units for the company
    const units = await this.listCompanyUnits({
      company_id: companyId,
      is_active: true,
    });

    // Build tree structure
    const unitMap = new Map<string, UnitTreeNode>();
    const rootNodes: UnitTreeNode[] = [];

    // First pass: create all nodes
    for (const unit of units) {
      const node: UnitTreeNode = {
        id: unit.id,
        name: unit.name as string,
        slug: unit.slug as string,
        type: unit.type as CompanyUnitType,
        level: unit.level as number,
        path: unit.path as string,
        parent_id: unit.parent_id as string | null,
        manager_id: unit.manager_id as string | null,
        is_active: unit.is_active as boolean,
        children: [],
      };
      unitMap.set(unit.id, node);
    }

    // Second pass: build hierarchy
    for (const unit of units) {
      const node = unitMap.get(unit.id)!;
      const parentId = unit.parent_id as string | null;

      if (parentId === null) {
        rootNodes.push(node);
      } else {
        const parent = unitMap.get(parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Orphaned node (parent was deleted), treat as root
          rootNodes.push(node);
        }
      }
    }

    // Sort children by sort_order at each level
    const sortChildren = (nodes: UnitTreeNode[]) => {
      nodes.sort((a, b) => {
        // Would need to fetch sort_order from original data
        // For now, sort by name
        return a.name.localeCompare(b.name);
      });
      for (const node of nodes) {
        sortChildren(node.children);
      }
    };
    sortChildren(rootNodes);

    return rootNodes;
  }

  /**
   * Gets a unit and all its descendants.
   *
   * @param unitId - The unit ID
   * @returns The unit with all descendants as flat array
   */
  async getUnitWithChildren(unitId: string) {
    const unit = await this.retrieveCompanyUnit(unitId);
    const path = unit.path as string;
    const companyId = unit.company_id as string;

    // Get all units whose path starts with this unit's path
    // This includes the unit itself and all descendants
    const allUnits = await this.listCompanyUnits({
      company_id: companyId,
    });

    // Filter units that are descendants (path starts with parent path + /)
    const descendants = allUnits.filter((u) => {
      const unitPath = u.path as string;
      return unitPath === path || unitPath.startsWith(path + "/");
    });

    return {
      unit,
      descendants,
    };
  }

  /**
   * Moves a unit to a new parent, updating all paths in the hierarchy.
   *
   * @param unitId - The unit ID to move
   * @param newParentId - The new parent ID (null for root)
   * @returns The updated unit
   */
  async moveUnit(unitId: string, newParentId: string | null) {
    return await this.updateUnit(unitId, { parent_id: newParentId });
  }

  // ==========================================
  // COMPANY MEMBERSHIP MANAGEMENT
  // ==========================================

  /**
   * Adds a customer to a company with specified role and settings.
   *
   * @param companyId - The company ID
   * @param customerId - The customer ID
   * @param data - Membership configuration
   * @returns The created membership
   */
  async addCustomerToCompany(
    companyId: string,
    customerId: string,
    data?: CreateMembershipInput
  ) {
    // Check if membership already exists
    const existing = await this.listCompanyMemberships({
      company_id: companyId,
      customer_id: customerId,
    });

    if (existing.length > 0) {
      throw new Error("Customer is already a member of this company");
    }

    // If this is primary, unset other primary memberships for this customer
    if (data?.is_primary) {
      await this.unsetPrimaryMemberships(customerId);
    }

    const membershipData = {
      company_id: companyId,
      customer_id: customerId,
      role: data?.role ?? "buyer",
      is_primary: data?.is_primary ?? false,
      job_title: data?.job_title ?? null,
      employee_number: data?.employee_number ?? null,
      spending_limit: data?.spending_limit ?? null,
      permissions: data?.permissions ?? null,
      status: data?.status ?? "active",
      invited_by: data?.invited_by ?? null,
      joined_at: data?.status === "active" ? new Date() : null,
      metadata: data?.metadata ?? null,
    };

    return await this.createCompanyMemberships(membershipData);
  }

  /**
   * Updates an existing company membership.
   *
   * @param membershipId - The membership ID
   * @param data - Update data
   * @returns The updated membership
   */
  async updateMembership(membershipId: string, data: UpdateMembershipInput) {
    const membership = await this.retrieveCompanyMembership(membershipId);

    // If setting as primary, unset other primary memberships
    if (data.is_primary === true) {
      await this.unsetPrimaryMemberships(membership.customer_id as string);
    }

    const updateData: Record<string, unknown> = { id: membershipId };
    if (data.role !== undefined) updateData["role"] = data.role;
    if (data.is_primary !== undefined) updateData["is_primary"] = data.is_primary;
    if (data.job_title !== undefined) updateData["job_title"] = data.job_title;
    if (data.employee_number !== undefined) updateData["employee_number"] = data.employee_number;
    if (data.spending_limit !== undefined) updateData["spending_limit"] = data.spending_limit;
    if (data.permissions !== undefined) updateData["permissions"] = data.permissions;
    if (data.status !== undefined) {
      updateData["status"] = data.status;
      // Set joined_at when becoming active
      if (data.status === "active" && membership.joined_at === null) {
        updateData["joined_at"] = new Date();
      }
    }
    if (data.metadata !== undefined) updateData["metadata"] = data.metadata;

    return await this.updateCompanyMemberships(updateData);
  }

  /**
   * Removes a customer from a company by deleting the membership.
   *
   * @param membershipId - The membership ID to remove
   */
  async removeCustomerFromCompany(membershipId: string): Promise<void> {
    const membership = await this.retrieveCompanyMembership(membershipId);

    // Remove any unit memberships for this customer in this company
    const unitMemberships = await this.listUnitMemberships({
      customer_id: membership.customer_id,
      company_id: membership.company_id,
    });

    for (const um of unitMemberships) {
      await this.deleteUnitMemberships(um.id);
    }

    // Delete the company membership
    await this.deleteCompanyMemberships(membershipId);
  }

  /**
   * Lists all members of a company with optional filters.
   *
   * @param companyId - The company ID
   * @param filters - Optional filters
   * @returns List of memberships
   */
  async listCompanyMembers(companyId: string, filters?: ListMembersFilters) {
    const queryFilters: Record<string, unknown> = { company_id: companyId };

    if (filters?.role !== undefined) {
      queryFilters["role"] = filters.role;
    }
    if (filters?.status !== undefined) {
      queryFilters["status"] = filters.status;
    }
    if (filters?.is_primary !== undefined) {
      queryFilters["is_primary"] = filters.is_primary;
    }

    return await this.listCompanyMemberships(queryFilters);
  }

  /**
   * Gets all companies a customer belongs to.
   *
   * @param customerId - The customer ID
   * @returns List of memberships (includes company_id)
   */
  async getCustomerCompanies(customerId: string) {
    return await this.listCompanyMemberships({
      customer_id: customerId,
      status: "active",
    });
  }

  /**
   * Sets a company as the primary company for a customer.
   *
   * @param customerId - The customer ID
   * @param companyId - The company ID to set as primary
   * @returns The updated membership
   */
  async setPrimaryCompany(customerId: string, companyId: string) {
    // Find the membership
    const memberships = await this.listCompanyMemberships({
      customer_id: customerId,
      company_id: companyId,
    });

    if (memberships.length === 0) {
      throw new Error("Customer is not a member of this company");
    }

    const membership = memberships[0];

    // Unset all other primary memberships for this customer
    await this.unsetPrimaryMemberships(customerId);

    // Set this one as primary
    return await this.updateCompanyMemberships({
      id: membership.id,
      is_primary: true,
    });
  }

  // ==========================================
  // UNIT MEMBERSHIP MANAGEMENT
  // ==========================================

  /**
   * Adds a customer to an organizational unit.
   *
   * @param unitId - The unit ID
   * @param customerId - The customer ID
   * @param data - Unit membership configuration
   * @returns The created unit membership
   */
  async addCustomerToUnit(
    unitId: string,
    customerId: string,
    data?: CreateUnitMembershipInput
  ) {
    const unit = await this.retrieveCompanyUnit(unitId);
    const companyId = unit.company_id as string;

    // Verify customer is a member of the company
    const companyMemberships = await this.listCompanyMemberships({
      company_id: companyId,
      customer_id: customerId,
      status: "active",
    });

    if (companyMemberships.length === 0) {
      throw new Error("Customer must be an active member of the company to join a unit");
    }

    // Check if already a member of this unit
    const existing = await this.listUnitMemberships({
      unit_id: unitId,
      customer_id: customerId,
    });

    if (existing.length > 0) {
      throw new Error("Customer is already a member of this unit");
    }

    // If this is default, unset other default unit memberships for this customer in this company
    if (data?.is_default) {
      await this.unsetDefaultUnitMemberships(customerId, companyId);
    }

    const membershipData = {
      unit_id: unitId,
      customer_id: customerId,
      company_id: companyId,
      role: data?.role ?? "member",
      is_default: data?.is_default ?? false,
      can_approve: data?.can_approve ?? false,
      spending_limit: data?.spending_limit ?? null,
      permissions: data?.permissions ?? null,
      metadata: data?.metadata ?? null,
    };

    return await this.createUnitMemberships(membershipData);
  }

  /**
   * Updates an existing unit membership.
   *
   * @param membershipId - The unit membership ID
   * @param data - Update data
   * @returns The updated unit membership
   */
  async updateUnitMembership(membershipId: string, data: UpdateUnitMembershipInput) {
    const membership = await this.retrieveUnitMembership(membershipId);

    // If setting as default, unset other default memberships
    if (data.is_default === true) {
      await this.unsetDefaultUnitMemberships(
        membership.customer_id as string,
        membership.company_id as string
      );
    }

    const updateData: Record<string, unknown> = { id: membershipId };
    if (data.role !== undefined) updateData["role"] = data.role;
    if (data.is_default !== undefined) updateData["is_default"] = data.is_default;
    if (data.can_approve !== undefined) updateData["can_approve"] = data.can_approve;
    if (data.spending_limit !== undefined) updateData["spending_limit"] = data.spending_limit;
    if (data.permissions !== undefined) updateData["permissions"] = data.permissions;
    if (data.metadata !== undefined) updateData["metadata"] = data.metadata;

    return await this.updateUnitMemberships(updateData);
  }

  /**
   * Removes a customer from an organizational unit.
   *
   * @param membershipId - The unit membership ID to remove
   */
  async removeCustomerFromUnit(membershipId: string): Promise<void> {
    await this.deleteUnitMemberships(membershipId);
  }

  /**
   * Lists all members of a unit.
   *
   * @param unitId - The unit ID
   * @returns List of unit memberships
   */
  async listUnitMembers(unitId: string) {
    return await this.listUnitMemberships({ unit_id: unitId });
  }

  /**
   * Gets all units a customer belongs to.
   *
   * @param customerId - The customer ID
   * @param companyId - Optional company ID to filter by
   * @returns List of unit memberships
   */
  async getCustomerUnits(customerId: string, companyId?: string) {
    const filters: Record<string, unknown> = { customer_id: customerId };
    if (companyId) {
      filters["company_id"] = companyId;
    }
    return await this.listUnitMemberships(filters);
  }

  // ==========================================
  // SPENDING LIMIT HELPERS
  // ==========================================

  /**
   * Calculates the effective spending limit for a customer in a company/unit context.
   * Priority: Unit limit > Company membership limit > Company default
   *
   * @param customerId - The customer ID
   * @param companyId - The company ID
   * @param unitId - Optional unit ID for unit-specific limit
   * @returns The effective spending limit (null means no limit)
   */
  async getEffectiveSpendingLimit(
    customerId: string,
    companyId: string,
    unitId?: string
  ): Promise<number | null> {
    // If unit is specified, check unit membership limit first
    if (unitId) {
      const unitMemberships = await this.listUnitMemberships({
        unit_id: unitId,
        customer_id: customerId,
      });

      if (unitMemberships.length > 0) {
        const unitMembership = unitMemberships[0];
        if (unitMembership.spending_limit !== null) {
          return Number(unitMembership.spending_limit);
        }
      }
    }

    // Check company membership limit
    const companyMemberships = await this.listCompanyMemberships({
      company_id: companyId,
      customer_id: customerId,
    });

    if (companyMemberships.length > 0) {
      const membership = companyMemberships[0];
      if (membership.spending_limit !== null) {
        return Number(membership.spending_limit);
      }
    }

    // No specific limit set - return null (unlimited within company credit)
    return null;
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Generates a unique slug from a company name.
   */
  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Add timestamp suffix for uniqueness
    return `${base}-${Date.now().toString(36)}`;
  }

  /**
   * Generates a slug from a unit name.
   */
  private generateUnitSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /**
   * Validates a status transition.
   */
  private validateStatusTransition(from: CompanyStatus, to: CompanyStatus): void {
    if (!STATUS_TRANSITIONS[from]?.includes(to)) {
      throw new Error(`Invalid status transition from "${from}" to "${to}"`);
    }
  }

  /**
   * Normalizes payment terms with defaults.
   */
  private normalizePaymentTerms(terms?: Partial<PaymentTerms>): PaymentTerms {
    return {
      type: terms?.type ?? "net_30",
      days: terms?.days ?? 30,
      allowPartialPayments: terms?.allowPartialPayments ?? false,
      earlyPaymentDiscount: terms?.earlyPaymentDiscount,
      earlyPaymentDays: terms?.earlyPaymentDays,
    };
  }

  /**
   * Normalizes company settings with defaults.
   */
  private normalizeSettings(settings?: Partial<CompanySettings>): CompanySettings {
    return {
      defaultCurrency: settings?.defaultCurrency ?? "EUR",
      defaultLanguage: settings?.defaultLanguage ?? "fr",
      taxExempt: settings?.taxExempt ?? false,
      marketingOptIn: settings?.marketingOptIn ?? false,
      orderNotificationEmails: settings?.orderNotificationEmails ?? [],
      invoiceNotificationEmails: settings?.invoiceNotificationEmails ?? [],
      allowEmployeeOrders: settings?.allowEmployeeOrders ?? true,
      requireOrderApproval: settings?.requireOrderApproval ?? false,
      allowCreditPurchases: settings?.allowCreditPurchases ?? false,
      autoReorderEnabled: settings?.autoReorderEnabled ?? false,
    };
  }

  /**
   * Unsets default flag for all addresses of a given type.
   */
  private async unsetDefaultAddresses(companyId: string, type: AddressType) {
    const addresses = await this.listCompanyAddresses({
      company_id: companyId,
      type,
      is_default: true,
    });

    for (const addr of addresses) {
      await this.updateCompanyAddresses({ id: addr.id, is_default: false });
    }
  }

  /**
   * Updates company's default address reference.
   */
  private async updateCompanyDefaultAddress(
    companyId: string,
    type: AddressType,
    addressId: string
  ) {
    const updateData: Record<string, string | null> = { id: companyId };

    if (type === "billing") {
      updateData["default_billing_address_id"] = addressId;
    } else if (type === "shipping") {
      updateData["default_shipping_address_id"] = addressId;
    }

    if (Object.keys(updateData).length > 1) {
      await this.updateCompanies(updateData);
    }
  }

  /**
   * Generates the materialized path and level for a unit.
   *
   * @param companyId - The company ID
   * @param parentId - The parent unit ID (null for root)
   * @param slug - The unit slug
   * @returns Object with path and level
   */
  private async generateUnitPath(
    companyId: string,
    parentId: string | null,
    slug: string
  ): Promise<{ path: string; level: number }> {
    if (parentId === null) {
      // Root level unit
      return {
        path: `/${slug}`,
        level: 0,
      };
    }

    // Get parent unit to build path
    const parent = await this.retrieveCompanyUnit(parentId);

    // Verify parent belongs to same company
    if (parent.company_id !== companyId) {
      throw new Error("Parent unit must belong to the same company");
    }

    const parentPath = parent.path as string;
    const parentLevel = parent.level as number;

    return {
      path: `${parentPath}/${slug}`,
      level: parentLevel + 1,
    };
  }

  /**
   * Updates paths for all descendant units when a parent is moved.
   *
   * @param unitId - The moved unit ID
   * @param oldPath - The old path prefix
   * @param newPath - The new path prefix
   */
  private async updateDescendantPaths(
    unitId: string,
    oldPath: string,
    newPath: string
  ): Promise<void> {
    const unit = await this.retrieveCompanyUnit(unitId);
    const companyId = unit.company_id as string;

    // Get all units in the company
    const allUnits = await this.listCompanyUnits({ company_id: companyId });

    // Find descendants (units whose path starts with oldPath/)
    const descendants = allUnits.filter((u) => {
      const unitPath = u.path as string;
      return unitPath.startsWith(oldPath + "/") && u.id !== unitId;
    });

    // Update each descendant's path
    for (const descendant of descendants) {
      const descendantPath = descendant.path as string;
      const updatedPath = newPath + descendantPath.substring(oldPath.length);

      // Calculate new level from path depth
      const newLevel = updatedPath.split("/").length - 2; // -2 because path starts with /

      await this.updateCompanyUnits({
        id: descendant.id,
        path: updatedPath,
        level: newLevel,
      });
    }
  }

  /**
   * Unsets primary flag for all company memberships for a customer.
   */
  private async unsetPrimaryMemberships(customerId: string): Promise<void> {
    const memberships = await this.listCompanyMemberships({
      customer_id: customerId,
      is_primary: true,
    });

    for (const membership of memberships) {
      await this.updateCompanyMemberships({
        id: membership.id,
        is_primary: false,
      });
    }
  }

  /**
   * Unsets default flag for all unit memberships for a customer in a company.
   */
  private async unsetDefaultUnitMemberships(
    customerId: string,
    companyId: string
  ): Promise<void> {
    const memberships = await this.listUnitMemberships({
      customer_id: customerId,
      company_id: companyId,
      is_default: true,
    });

    for (const membership of memberships) {
      await this.updateUnitMemberships({
        id: membership.id,
        is_default: false,
      });
    }
  }
}

export default CompanyModuleService;
