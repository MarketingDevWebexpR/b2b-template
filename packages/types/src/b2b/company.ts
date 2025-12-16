/**
 * B2B Company Types
 * Defines company entities, settings, and payment terms for B2B e-commerce.
 */

// ============================================
// Payment Terms
// ============================================

/**
 * Standard payment term options for B2B transactions.
 */
export type PaymentTermType =
  | 'immediate'   // Payment due immediately
  | 'net_7'       // Payment due in 7 days
  | 'net_15'      // Payment due in 15 days
  | 'net_30'      // Payment due in 30 days
  | 'net_45'      // Payment due in 45 days
  | 'net_60'      // Payment due in 60 days
  | 'net_90'      // Payment due in 90 days
  | 'custom';     // Custom payment terms

/**
 * Payment terms configuration for a company.
 */
export interface PaymentTerms {
  /** Type of payment terms */
  type: PaymentTermType;
  /** Number of days for payment (for custom terms) */
  days?: number;
  /** Early payment discount percentage (e.g., 2% if paid within 10 days) */
  earlyPaymentDiscount?: number;
  /** Days within which early payment discount applies */
  earlyPaymentDays?: number;
  /** Late payment penalty percentage */
  latePenaltyPercent?: number;
  /** Whether to allow partial payments */
  allowPartialPayments: boolean;
  /** Minimum partial payment percentage */
  minPartialPaymentPercent?: number;
}

// ============================================
// Company Tier
// ============================================

/**
 * Company tier levels for pricing and features.
 */
export type CompanyTier = 'standard' | 'premium' | 'enterprise' | 'vip';

/**
 * Configuration for a company tier.
 */
export interface CompanyTierConfig {
  tier: CompanyTier;
  /** Discount percentage applied to all orders */
  discountPercent: number;
  /** Credit limit in currency */
  creditLimit: number;
  /** Priority level for support (1 = highest) */
  supportPriority: number;
  /** Whether company has access to exclusive products */
  exclusiveAccess: boolean;
  /** Minimum order value requirement */
  minOrderValue?: number;
  /** Free shipping threshold */
  freeShippingThreshold?: number;
}

// ============================================
// Company Address
// ============================================

/**
 * Type of company address.
 */
export type CompanyAddressType = 'billing' | 'shipping' | 'headquarters' | 'warehouse';

/**
 * Company address with business-specific fields.
 */
export interface CompanyAddress {
  id: string;
  /** Address type */
  type: CompanyAddressType;
  /** Address label (e.g., "Main Office", "Warehouse Paris") */
  label: string;
  /** Whether this is the default address for its type */
  isDefault: boolean;
  /** Company name at this address */
  companyName: string;
  /** Attention line (person or department) */
  attention?: string;
  /** Street address line 1 */
  addressLine1: string;
  /** Street address line 2 */
  addressLine2?: string;
  /** City */
  city: string;
  /** State/Province/Region */
  state?: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Phone number */
  phone?: string;
  /** Delivery instructions */
  deliveryInstructions?: string;
  /** Whether address is verified */
  isVerified: boolean;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}

// ============================================
// Company Settings
// ============================================

/**
 * Company-level settings and preferences.
 */
export interface CompanySettings {
  /** Default currency code (ISO 4217) */
  defaultCurrency: string;
  /** Default language code (ISO 639-1) */
  defaultLanguage: string;
  /** Tax exempt status */
  taxExempt: boolean;
  /** Tax exemption certificate number */
  taxExemptCertificate?: string;
  /** Tax exemption expiry date */
  taxExemptExpiry?: string;
  /** Whether to receive marketing communications */
  marketingOptIn: boolean;
  /** Order notification email addresses */
  orderNotificationEmails: string[];
  /** Invoice notification email addresses */
  invoiceNotificationEmails: string[];
  /** Whether to allow employees to create orders */
  allowEmployeeOrders: boolean;
  /** Whether orders require approval */
  requireOrderApproval: boolean;
  /** Default approval workflow ID */
  defaultApprovalWorkflowId?: string;
  /** Whether to allow credit purchases */
  allowCreditPurchases: boolean;
  /** Auto-reorder settings */
  autoReorderEnabled: boolean;
  /** Preferred shipping carrier */
  preferredShippingCarrier?: string;
  /** Custom fields */
  customFields?: Record<string, string | number | boolean>;
}

// ============================================
// Company Status
// ============================================

/**
 * Company account status.
 */
export type CompanyStatus =
  | 'pending'      // Awaiting approval
  | 'active'       // Active and can place orders
  | 'suspended'    // Temporarily suspended
  | 'inactive'     // Inactive, cannot place orders
  | 'closed';      // Account closed

// ============================================
// Company
// ============================================

/**
 * B2B Company entity.
 * Represents a business customer with employees, addresses, and settings.
 */
export interface Company {
  /** Unique identifier */
  id: string;
  /** Company legal name */
  name: string;
  /** Company trade/display name */
  tradeName?: string;
  /** URL-friendly slug */
  slug: string;
  /** Company logo URL */
  logoUrl?: string;
  /** Company website */
  website?: string;
  /** Company description */
  description?: string;

  // Business identifiers
  /** Tax ID / VAT number */
  taxId?: string;
  /** Company registration number */
  registrationNumber?: string;
  /** DUNS number */
  dunsNumber?: string;
  /** Industry code (NAICS/SIC) */
  industryCode?: string;

  // Contact information
  /** Primary contact email */
  email: string;
  /** Primary phone number */
  phone?: string;
  /** Primary fax number */
  fax?: string;

  // Status and tier
  /** Account status */
  status: CompanyStatus;
  /** Company tier */
  tier: CompanyTier;

  // Financial
  /** Payment terms */
  paymentTerms: PaymentTerms;
  /** Credit limit in currency */
  creditLimit: number;
  /** Current credit used */
  creditUsed: number;
  /** Available credit (creditLimit - creditUsed) */
  creditAvailable: number;

  // Related entities
  /** Company addresses */
  addresses: CompanyAddress[];
  /** Default billing address ID */
  defaultBillingAddressId?: string;
  /** Default shipping address ID */
  defaultShippingAddressId?: string;

  // Settings
  /** Company settings */
  settings: CompanySettings;

  // Metadata
  /** Account manager user ID */
  accountManagerId?: string;
  /** Sales representative user ID */
  salesRepId?: string;
  /** Notes about the company */
  notes?: string;
  /** Tags for categorization */
  tags: string[];

  // Timestamps
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** ISO timestamp of last order */
  lastOrderAt?: string;
}

// ============================================
// Company Summary (for lists)
// ============================================

/**
 * Lightweight company representation for lists and references.
 */
export interface CompanySummary {
  id: string;
  name: string;
  tradeName?: string;
  slug: string;
  logoUrl?: string;
  status: CompanyStatus;
  tier: CompanyTier;
  creditAvailable: number;
}

// ============================================
// Company Create/Update DTOs
// ============================================

/**
 * Data required to create a new company.
 */
export interface CreateCompanyInput {
  name: string;
  tradeName?: string;
  email: string;
  phone?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  tier?: CompanyTier;
  paymentTerms?: Partial<PaymentTerms>;
  creditLimit?: number;
  addresses?: Omit<CompanyAddress, 'id' | 'createdAt' | 'updatedAt' | 'isVerified'>[];
  settings?: Partial<CompanySettings>;
  tags?: string[];
  notes?: string;
}

/**
 * Data to update an existing company.
 */
export interface UpdateCompanyInput {
  name?: string;
  tradeName?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  taxId?: string;
  registrationNumber?: string;
  dunsNumber?: string;
  industryCode?: string;
  tier?: CompanyTier;
  status?: CompanyStatus;
  paymentTerms?: Partial<PaymentTerms>;
  creditLimit?: number;
  settings?: Partial<CompanySettings>;
  tags?: string[];
  notes?: string;
  accountManagerId?: string;
  salesRepId?: string;
}
