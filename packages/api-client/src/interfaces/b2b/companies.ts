/**
 * B2B Company Service Interface
 * Defines the contract for company-related operations in B2B context.
 */

import type {
  Company,
  CompanySummary,
  CompanyAddress,
  CompanyStatus,
  CompanyTier,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "@maison/types";
import type { PaginatedResponse } from "@maison/api-core";

/**
 * Options for listing companies
 */
export interface ListCompaniesOptions {
  /** Page number */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Filter by status */
  status?: CompanyStatus | CompanyStatus[];
  /** Filter by tier */
  tier?: CompanyTier | CompanyTier[];
  /** Filter by account manager */
  accountManagerId?: string;
  /** Search by name, email, or tax ID */
  search?: string;
  /** Sort field */
  sortBy?: "name" | "createdAt" | "lastOrderAt" | "creditAvailable";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Filter by tags */
  tags?: string[];
}

/**
 * Company registration request
 */
export interface CompanyRegistrationRequest {
  /** Company details */
  company: CreateCompanyInput;
  /** Admin user details */
  adminUser: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    jobTitle?: string;
  };
  /** Password for admin user */
  password: string;
}

/**
 * Company registration result
 */
export interface CompanyRegistrationResult {
  /** Created company */
  company: Company;
  /** Admin employee ID */
  adminEmployeeId: string;
  /** Whether approval is required */
  requiresApproval: boolean;
  /** Message to display */
  message: string;
}

/**
 * Credit adjustment input
 */
export interface CreditAdjustmentInput {
  /** Amount to adjust (positive = add, negative = subtract) */
  amount: number;
  /** Reason for adjustment */
  reason: string;
  /** Reference (e.g., order ID, invoice ID) */
  reference?: string;
}

/**
 * Credit history entry
 */
export interface CreditHistoryEntry {
  id: string;
  companyId: string;
  type: "order" | "payment" | "adjustment" | "refund";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference?: string;
  description: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

/**
 * Interface for B2B company operations.
 * All adapters must implement this interface.
 */
export interface ICompanyService {
  /**
   * List companies with optional filtering.
   *
   * @param options - Listing options
   * @returns Paginated list of companies
   *
   * @example
   * ```typescript
   * const companies = await api.b2b.companies.list({
   *   status: "active",
   *   tier: ["premium", "enterprise"],
   *   pageSize: 20
   * });
   * ```
   */
  list(options?: ListCompaniesOptions): Promise<PaginatedResponse<CompanySummary>>;

  /**
   * Get a company by ID.
   *
   * @param id - Company ID
   * @returns Full company details
   */
  get(id: string): Promise<Company>;

  /**
   * Get company by slug.
   *
   * @param slug - Company slug
   * @returns Full company details
   */
  getBySlug(slug: string): Promise<Company>;

  /**
   * Get the current user's company.
   *
   * @returns Current company or null
   */
  getCurrent(): Promise<Company | null>;

  /**
   * Register a new company.
   *
   * @param request - Registration request
   * @returns Registration result
   *
   * @example
   * ```typescript
   * const result = await api.b2b.companies.register({
   *   company: {
   *     name: "Acme Inc",
   *     email: "contact@acme.com",
   *     taxId: "FR12345678901"
   *   },
   *   adminUser: {
   *     email: "admin@acme.com",
   *     firstName: "John",
   *     lastName: "Doe"
   *   },
   *   password: "securePassword123"
   * });
   * ```
   */
  register(request: CompanyRegistrationRequest): Promise<CompanyRegistrationResult>;

  /**
   * Update a company.
   *
   * @param id - Company ID
   * @param input - Update data
   * @returns Updated company
   */
  update(id: string, input: UpdateCompanyInput): Promise<Company>;

  /**
   * Update company status.
   *
   * @param id - Company ID
   * @param status - New status
   * @param reason - Reason for status change
   * @returns Updated company
   */
  updateStatus(id: string, status: CompanyStatus, reason?: string): Promise<Company>;

  /**
   * Update company tier.
   *
   * @param id - Company ID
   * @param tier - New tier
   * @returns Updated company
   */
  updateTier(id: string, tier: CompanyTier): Promise<Company>;

  // Address Management

  /**
   * List company addresses.
   *
   * @param companyId - Company ID
   * @returns Array of addresses
   */
  listAddresses(companyId: string): Promise<CompanyAddress[]>;

  /**
   * Add a company address.
   *
   * @param companyId - Company ID
   * @param address - Address data
   * @returns Created address
   */
  addAddress(
    companyId: string,
    address: Omit<CompanyAddress, "id" | "createdAt" | "updatedAt" | "isVerified">
  ): Promise<CompanyAddress>;

  /**
   * Update a company address.
   *
   * @param companyId - Company ID
   * @param addressId - Address ID
   * @param address - Update data
   * @returns Updated address
   */
  updateAddress(
    companyId: string,
    addressId: string,
    address: Partial<Omit<CompanyAddress, "id" | "createdAt" | "updatedAt">>
  ): Promise<CompanyAddress>;

  /**
   * Delete a company address.
   *
   * @param companyId - Company ID
   * @param addressId - Address ID
   */
  deleteAddress(companyId: string, addressId: string): Promise<void>;

  /**
   * Set default address.
   *
   * @param companyId - Company ID
   * @param addressId - Address ID
   * @param type - Address type
   * @returns Updated address
   */
  setDefaultAddress(
    companyId: string,
    addressId: string,
    type: "billing" | "shipping"
  ): Promise<CompanyAddress>;

  // Credit Management

  /**
   * Get company credit information.
   *
   * @param companyId - Company ID
   * @returns Credit info
   */
  getCreditInfo(companyId: string): Promise<{
    creditLimit: number;
    creditUsed: number;
    creditAvailable: number;
    currency: string;
  }>;

  /**
   * Adjust company credit.
   *
   * @param companyId - Company ID
   * @param input - Adjustment input
   * @returns Updated credit info
   */
  adjustCredit(
    companyId: string,
    input: CreditAdjustmentInput
  ): Promise<{
    creditLimit: number;
    creditUsed: number;
    creditAvailable: number;
  }>;

  /**
   * Get credit history.
   *
   * @param companyId - Company ID
   * @param options - Pagination options
   * @returns Paginated credit history
   */
  getCreditHistory(
    companyId: string,
    options?: { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<CreditHistoryEntry>>;

  /**
   * Update credit limit.
   *
   * @param companyId - Company ID
   * @param newLimit - New credit limit
   * @param reason - Reason for change
   * @returns Updated company
   */
  updateCreditLimit(companyId: string, newLimit: number, reason?: string): Promise<Company>;

  // Tags

  /**
   * Add tags to company.
   *
   * @param companyId - Company ID
   * @param tags - Tags to add
   * @returns Updated company
   */
  addTags(companyId: string, tags: string[]): Promise<Company>;

  /**
   * Remove tags from company.
   *
   * @param companyId - Company ID
   * @param tags - Tags to remove
   * @returns Updated company
   */
  removeTags(companyId: string, tags: string[]): Promise<Company>;

  /**
   * Delete a company.
   *
   * @param id - Company ID
   */
  delete(id: string): Promise<void>;
}
