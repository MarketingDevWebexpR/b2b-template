/**
 * Customer Service Interface
 * Defines the contract for customer-related operations.
 */

import type { ShippingAddress, BillingAddress, User } from "@maison/types";

/**
 * Customer profile
 */
export interface Customer {
  /** Unique identifier */
  id: string;
  /** Email address */
  email: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Full name */
  fullName: string;
  /** Phone number */
  phone?: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Date of birth */
  dateOfBirth?: string;
  /** Preferred language */
  language?: string;
  /** Marketing opt-in */
  acceptsMarketing: boolean;
  /** Company ID (for B2B) */
  companyId?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Account creation date */
  createdAt: string;
  /** Last update date */
  updatedAt: string;
  /** Last order date */
  lastOrderAt?: string;
  /** Total orders count */
  ordersCount?: number;
  /** Total spent */
  totalSpent?: number;
}

/**
 * Customer address (shipping or billing)
 */
export interface CustomerAddress extends ShippingAddress {
  /** Address ID */
  id: string;
  /** Customer ID */
  customerId: string;
  /** Address type */
  type: "shipping" | "billing" | "both";
  /** Address label (e.g., "Home", "Work") */
  label?: string;
  /** Whether this is the default address */
  isDefault: boolean;
  /** Company name (for billing) */
  companyName?: string;
  /** VAT number (for billing) */
  vatNumber?: string;
  /** Creation date */
  createdAt: string;
  /** Last update */
  updatedAt: string;
}

/**
 * Input for creating/updating a customer
 */
export interface CustomerInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  language?: string;
  acceptsMarketing?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Input for creating/updating an address
 */
export interface AddressInput {
  type?: "shipping" | "billing" | "both";
  label?: string;
  isDefault?: boolean;
  firstName: string;
  lastName: string;
  address: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  companyName?: string;
  vatNumber?: string;
}

/**
 * Customer authentication result
 */
export interface AuthResult {
  /** Authenticated customer */
  customer: Customer;
  /** Access token */
  accessToken: string;
  /** Refresh token */
  refreshToken?: string;
  /** Token expiry timestamp */
  expiresAt: string;
}

/**
 * Password reset request result
 */
export interface PasswordResetResult {
  /** Whether reset was requested successfully */
  success: boolean;
  /** Message to display */
  message: string;
}

/**
 * Interface for customer-related operations.
 * All adapters must implement this interface.
 */
export interface ICustomerService {
  /**
   * Get the current authenticated customer.
   *
   * @returns Current customer profile
   */
  getCurrent(): Promise<Customer>;

  /**
   * Get a customer by ID.
   *
   * @param id - Customer ID
   * @returns Customer profile
   */
  get(id: string): Promise<Customer>;

  /**
   * Get a customer by email.
   *
   * @param email - Customer email
   * @returns Customer profile
   */
  getByEmail(email: string): Promise<Customer>;

  /**
   * Update customer profile.
   *
   * @param customerId - Customer ID
   * @param input - Update data
   * @returns Updated customer
   *
   * @example
   * ```typescript
   * const customer = await api.customers.update("cust_123", {
   *   firstName: "John",
   *   acceptsMarketing: true
   * });
   * ```
   */
  update(customerId: string, input: CustomerInput): Promise<Customer>;

  /**
   * Register a new customer.
   *
   * @param email - Email address
   * @param password - Password
   * @param profile - Optional profile data
   * @returns Auth result with token
   *
   * @example
   * ```typescript
   * const result = await api.customers.register(
   *   "john@example.com",
   *   "securePassword123",
   *   { firstName: "John", lastName: "Doe" }
   * );
   * ```
   */
  register(
    email: string,
    password: string,
    profile?: Omit<CustomerInput, "email">
  ): Promise<AuthResult>;

  /**
   * Authenticate a customer.
   *
   * @param email - Email address
   * @param password - Password
   * @returns Auth result with token
   */
  login(email: string, password: string): Promise<AuthResult>;

  /**
   * Logout the current customer.
   */
  logout(): Promise<void>;

  /**
   * Refresh authentication token.
   *
   * @param refreshToken - Refresh token
   * @returns New auth result
   */
  refreshToken(refreshToken: string): Promise<AuthResult>;

  /**
   * Request a password reset.
   *
   * @param email - Customer email
   * @returns Reset request result
   */
  requestPasswordReset(email: string): Promise<PasswordResetResult>;

  /**
   * Reset password with token.
   *
   * @param token - Reset token
   * @param newPassword - New password
   * @returns Result
   */
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean }>;

  /**
   * Change password (authenticated).
   *
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Result
   */
  changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean }>;

  /**
   * List customer addresses.
   *
   * @param customerId - Customer ID
   * @returns Array of addresses
   */
  listAddresses(customerId: string): Promise<CustomerAddress[]>;

  /**
   * Get a specific address.
   *
   * @param customerId - Customer ID
   * @param addressId - Address ID
   * @returns Address
   */
  getAddress(customerId: string, addressId: string): Promise<CustomerAddress>;

  /**
   * Add a new address.
   *
   * @param customerId - Customer ID
   * @param input - Address data
   * @returns Created address
   *
   * @example
   * ```typescript
   * const address = await api.customers.addAddress("cust_123", {
   *   type: "shipping",
   *   label: "Home",
   *   firstName: "John",
   *   lastName: "Doe",
   *   address: "123 Main St",
   *   city: "Paris",
   *   postalCode: "75001",
   *   country: "FR",
   *   isDefault: true
   * });
   * ```
   */
  addAddress(customerId: string, input: AddressInput): Promise<CustomerAddress>;

  /**
   * Update an address.
   *
   * @param customerId - Customer ID
   * @param addressId - Address ID
   * @param input - Update data
   * @returns Updated address
   */
  updateAddress(
    customerId: string,
    addressId: string,
    input: Partial<AddressInput>
  ): Promise<CustomerAddress>;

  /**
   * Delete an address.
   *
   * @param customerId - Customer ID
   * @param addressId - Address ID
   */
  deleteAddress(customerId: string, addressId: string): Promise<void>;

  /**
   * Set default address.
   *
   * @param customerId - Customer ID
   * @param addressId - Address ID
   * @param type - Address type to set as default
   * @returns Updated address
   */
  setDefaultAddress(
    customerId: string,
    addressId: string,
    type: "shipping" | "billing"
  ): Promise<CustomerAddress>;

  /**
   * Get default shipping address.
   *
   * @param customerId - Customer ID
   * @returns Default shipping address or null
   */
  getDefaultShippingAddress(customerId: string): Promise<CustomerAddress | null>;

  /**
   * Get default billing address.
   *
   * @param customerId - Customer ID
   * @returns Default billing address or null
   */
  getDefaultBillingAddress(customerId: string): Promise<CustomerAddress | null>;

  /**
   * Delete customer account.
   *
   * @param customerId - Customer ID
   */
  delete(customerId: string): Promise<void>;
}
