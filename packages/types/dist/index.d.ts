/**
 * B2B Company Types
 * Defines company entities, settings, and payment terms for B2B e-commerce.
 */
/**
 * Standard payment term options for B2B transactions.
 */
type PaymentTermType = 'immediate' | 'net_7' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90' | 'custom';
/**
 * Payment terms configuration for a company.
 */
interface PaymentTerms {
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
/**
 * Company tier levels for pricing and features.
 */
type CompanyTier = 'standard' | 'premium' | 'enterprise' | 'vip';
/**
 * Configuration for a company tier.
 */
interface CompanyTierConfig {
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
/**
 * Type of company address.
 */
type CompanyAddressType = 'billing' | 'shipping' | 'headquarters' | 'warehouse';
/**
 * Company address with business-specific fields.
 */
interface CompanyAddress {
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
/**
 * Company-level settings and preferences.
 */
interface CompanySettings {
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
/**
 * Company account status.
 */
type CompanyStatus = 'pending' | 'active' | 'suspended' | 'inactive' | 'closed';
/**
 * B2B Company entity.
 * Represents a business customer with employees, addresses, and settings.
 */
interface Company {
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
    /** Tax ID / VAT number */
    taxId?: string;
    /** Company registration number */
    registrationNumber?: string;
    /** DUNS number */
    dunsNumber?: string;
    /** Industry code (NAICS/SIC) */
    industryCode?: string;
    /** Primary contact email */
    email: string;
    /** Primary phone number */
    phone?: string;
    /** Primary fax number */
    fax?: string;
    /** Account status */
    status: CompanyStatus;
    /** Company tier */
    tier: CompanyTier;
    /** Payment terms */
    paymentTerms: PaymentTerms;
    /** Credit limit in currency */
    creditLimit: number;
    /** Current credit used */
    creditUsed: number;
    /** Available credit (creditLimit - creditUsed) */
    creditAvailable: number;
    /** Company addresses */
    addresses: CompanyAddress[];
    /** Default billing address ID */
    defaultBillingAddressId?: string;
    /** Default shipping address ID */
    defaultShippingAddressId?: string;
    /** Company settings */
    settings: CompanySettings;
    /** Account manager user ID */
    accountManagerId?: string;
    /** Sales representative user ID */
    salesRepId?: string;
    /** Notes about the company */
    notes?: string;
    /** Tags for categorization */
    tags: string[];
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
    /** ISO timestamp of last order */
    lastOrderAt?: string;
}
/**
 * Lightweight company representation for lists and references.
 */
interface CompanySummary {
    id: string;
    name: string;
    tradeName?: string;
    slug: string;
    logoUrl?: string;
    status: CompanyStatus;
    tier: CompanyTier;
    creditAvailable: number;
}
/**
 * Data required to create a new company.
 */
interface CreateCompanyInput {
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
interface UpdateCompanyInput {
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

/**
 * B2B Employee Types
 * Defines employee entities, roles, and permissions for B2B company management.
 */
/**
 * Granular permissions for B2B employees.
 */
type EmployeePermission = 'orders.create' | 'orders.view' | 'orders.view_all' | 'orders.cancel' | 'orders.approve' | 'orders.bulk_create' | 'quotes.create' | 'quotes.view' | 'quotes.view_all' | 'quotes.accept' | 'quotes.reject' | 'quotes.negotiate' | 'products.view' | 'products.view_prices' | 'products.view_stock' | 'spending.unlimited' | 'spending.view_reports' | 'company.view' | 'company.edit' | 'company.manage_employees' | 'company.manage_addresses' | 'company.view_credit' | 'company.view_invoices' | 'approvals.view' | 'approvals.approve' | 'approvals.delegate' | 'admin.full_access';
/**
 * Permission group for common use cases.
 */
interface PermissionGroup {
    id: string;
    name: string;
    description: string;
    permissions: EmployeePermission[];
}
/**
 * Predefined employee roles.
 */
type EmployeeRole = 'owner' | 'admin' | 'manager' | 'purchaser' | 'viewer' | 'custom';
/**
 * Role configuration with default permissions.
 */
interface RoleConfig {
    role: EmployeeRole;
    displayName: string;
    description: string;
    defaultPermissions: EmployeePermission[];
    /** Whether this role can be deleted */
    isSystemRole: boolean;
    /** Whether users with this role can manage other users */
    canManageUsers: boolean;
    /** Maximum spending limit for this role (0 = unlimited) */
    maxSpendingLimit: number;
}
/**
 * Employee account status.
 */
type EmployeeStatus = 'pending' | 'active' | 'suspended' | 'inactive';
/**
 * Department within a company.
 */
interface Department {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    costCenter?: string;
    managerId?: string;
    parentDepartmentId?: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * B2B Employee entity.
 * Represents a user within a company with specific roles and permissions.
 */
interface Employee {
    /** Unique identifier */
    id: string;
    /** Reference to the user account */
    userId: string;
    /** Company this employee belongs to */
    companyId: string;
    /** First name */
    firstName: string;
    /** Last name */
    lastName: string;
    /** Full name (computed) */
    fullName: string;
    /** Email address */
    email: string;
    /** Phone number */
    phone?: string;
    /** Job title */
    jobTitle?: string;
    /** Avatar URL */
    avatarUrl?: string;
    /** Employee role */
    role: EmployeeRole;
    /** Custom permissions (overrides role defaults) */
    permissions: EmployeePermission[];
    /** Department ID */
    departmentId?: string;
    /** Reports to employee ID */
    reportsToId?: string;
    /** Employee status */
    status: EmployeeStatus;
    /** Reason for suspension (if suspended) */
    suspensionReason?: string;
    /** Per-order spending limit */
    spendingLimitPerOrder?: number;
    /** Daily spending limit */
    spendingLimitDaily?: number;
    /** Weekly spending limit */
    spendingLimitWeekly?: number;
    /** Monthly spending limit */
    spendingLimitMonthly?: number;
    /** Current daily spending */
    currentDailySpending: number;
    /** Current weekly spending */
    currentWeeklySpending: number;
    /** Current monthly spending */
    currentMonthlySpending: number;
    /** Can approve orders up to this amount */
    approvalLimit?: number;
    /** Whether this employee is an approver */
    isApprover: boolean;
    /** IDs of employees this person can approve for */
    canApproveFor: string[];
    /** Default shipping address ID */
    defaultShippingAddressId?: string;
    /** Preferred notification method */
    notificationPreference: 'email' | 'sms' | 'both' | 'none';
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
    /** ISO timestamp of last login */
    lastLoginAt?: string;
    /** ISO timestamp of invitation sent */
    invitedAt?: string;
    /** ISO timestamp of invitation acceptance */
    acceptedAt?: string;
}
/**
 * Lightweight employee representation for lists and references.
 */
interface EmployeeSummary {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    jobTitle?: string;
    role: EmployeeRole;
    status: EmployeeStatus;
    departmentId?: string;
    isApprover: boolean;
}
/**
 * Employee invitation details.
 */
interface EmployeeInvitation {
    id: string;
    companyId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: EmployeeRole;
    permissions?: EmployeePermission[];
    departmentId?: string;
    spendingLimitPerOrder?: number;
    spendingLimitMonthly?: number;
    message?: string;
    invitedById: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}
/**
 * Data required to invite a new employee.
 */
interface InviteEmployeeInput {
    email: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    role: EmployeeRole;
    permissions?: EmployeePermission[];
    departmentId?: string;
    reportsToId?: string;
    spendingLimitPerOrder?: number;
    spendingLimitDaily?: number;
    spendingLimitWeekly?: number;
    spendingLimitMonthly?: number;
    approvalLimit?: number;
    isApprover?: boolean;
    message?: string;
}
/**
 * Data to update an existing employee.
 */
interface UpdateEmployeeInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    jobTitle?: string;
    avatarUrl?: string;
    role?: EmployeeRole;
    permissions?: EmployeePermission[];
    departmentId?: string;
    reportsToId?: string;
    status?: EmployeeStatus;
    suspensionReason?: string;
    spendingLimitPerOrder?: number;
    spendingLimitDaily?: number;
    spendingLimitWeekly?: number;
    spendingLimitMonthly?: number;
    approvalLimit?: number;
    isApprover?: boolean;
    canApproveFor?: string[];
    defaultShippingAddressId?: string;
    notificationPreference?: 'email' | 'sms' | 'both' | 'none';
}
/**
 * Activity types for employee audit log.
 */
type EmployeeActivityType = 'login' | 'logout' | 'order_created' | 'order_approved' | 'order_rejected' | 'quote_created' | 'quote_accepted' | 'settings_updated' | 'password_changed' | 'profile_updated';
/**
 * Employee activity log entry.
 */
interface EmployeeActivity {
    id: string;
    employeeId: string;
    companyId: string;
    type: EmployeeActivityType;
    description: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

/**
 * B2B Quote Types
 * Defines quote entities, items, and workflow for B2B request-for-quote system.
 */

/**
 * Status of a quote in the workflow.
 */
type QuoteStatus = 'draft' | 'submitted' | 'under_review' | 'pending_info' | 'responded' | 'negotiating' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'cancelled';
/**
 * A single item in a quote.
 */
interface QuoteItem {
    /** Unique identifier */
    id: string;
    /** Product ID */
    productId: string;
    /** Product SKU/reference */
    productSku: string;
    /** Product name at time of quote */
    productName: string;
    /** Product image URL */
    productImage?: string;
    /** Requested quantity */
    quantity: number;
    /** Unit of measure */
    unitOfMeasure: string;
    /** Original unit price (list price) */
    listPrice: number;
    /** Requested/proposed unit price */
    requestedPrice?: number;
    /** Final quoted price (after seller response) */
    quotedPrice?: number;
    /** Discount percentage from list */
    discountPercent?: number;
    /** Line total (quantity * quotedPrice or requestedPrice) */
    lineTotal: number;
    /** Target delivery date for this item */
    targetDeliveryDate?: string;
    /** Confirmed delivery date */
    confirmedDeliveryDate?: string;
    /** Notes specific to this item */
    notes?: string;
    /** Custom specifications */
    specifications?: Record<string, string>;
}
/**
 * Quote financial totals.
 */
interface QuoteTotals {
    /** Sum of line totals */
    subtotal: number;
    /** Total discount amount */
    discount: number;
    /** Shipping cost */
    shipping: number;
    /** Tax amount */
    tax: number;
    /** Grand total */
    total: number;
    /** Currency code */
    currency: string;
}
/**
 * Terms and conditions for a quote.
 */
interface QuoteTerms {
    /** Payment terms type */
    paymentTerms: PaymentTermType;
    /** Custom payment terms days */
    paymentTermsDays?: number;
    /** Shipping terms (Incoterms) */
    shippingTerms?: string;
    /** Warranty terms */
    warrantyTerms?: string;
    /** Return policy */
    returnPolicy?: string;
    /** Custom terms and conditions */
    customTerms?: string;
}
/**
 * Type of quote history event.
 */
type QuoteHistoryEventType = 'created' | 'submitted' | 'viewed' | 'responded' | 'price_updated' | 'quantity_updated' | 'item_added' | 'item_removed' | 'note_added' | 'negotiation_started' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'cancelled';
/**
 * A history entry tracking quote changes.
 */
interface QuoteHistoryEntry {
    id: string;
    quoteId: string;
    eventType: QuoteHistoryEventType;
    description: string;
    /** Actor who made the change */
    actorId: string;
    actorType: 'buyer' | 'seller' | 'system';
    actorName: string;
    /** Previous values (for changes) */
    previousValues?: Record<string, unknown>;
    /** New values (for changes) */
    newValues?: Record<string, unknown>;
    /** ISO timestamp */
    createdAt: string;
}
/**
 * A message in the quote conversation.
 */
interface QuoteMessage {
    id: string;
    quoteId: string;
    senderId: string;
    senderType: 'buyer' | 'seller';
    senderName: string;
    message: string;
    attachments?: QuoteAttachment[];
    isRead: boolean;
    createdAt: string;
}
/**
 * An attachment on a quote or message.
 */
interface QuoteAttachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedById: string;
    uploadedAt: string;
}
/**
 * B2B Quote entity.
 * Represents a request for quotation and its responses.
 */
interface Quote {
    /** Unique identifier */
    id: string;
    /** Human-readable quote number */
    quoteNumber: string;
    /** Reference to previous quote (for revisions) */
    parentQuoteId?: string;
    /** Revision number (1 for original) */
    revision: number;
    /** Company requesting the quote */
    companyId: string;
    /** Company name (denormalized) */
    companyName: string;
    /** Employee who created the quote */
    employeeId: string;
    /** Employee name (denormalized) */
    employeeName: string;
    /** Contact email for this quote */
    contactEmail: string;
    /** Contact phone for this quote */
    contactPhone?: string;
    /** Current status */
    status: QuoteStatus;
    /** Priority level */
    priority: 'low' | 'normal' | 'high' | 'urgent';
    /** Quote items */
    items: QuoteItem[];
    /** Quote totals */
    totals: QuoteTotals;
    /** Quote terms */
    terms: QuoteTerms;
    /** Shipping address ID */
    shippingAddressId?: string;
    /** Requested delivery date */
    requestedDeliveryDate?: string;
    /** Confirmed delivery date */
    confirmedDeliveryDate?: string;
    /** Shipping method preference */
    shippingMethod?: string;
    /** Quote validity period start */
    validFrom: string;
    /** Quote validity period end */
    validUntil: string;
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
    /** ISO timestamp of submission */
    submittedAt?: string;
    /** ISO timestamp of seller response */
    respondedAt?: string;
    /** ISO timestamp of acceptance/rejection */
    decidedAt?: string;
    /** ISO timestamp of conversion to order */
    convertedAt?: string;
    /** Internal notes (visible only to buyer) */
    internalNotes?: string;
    /** Notes for seller */
    notesForSeller?: string;
    /** Seller response notes */
    sellerNotes?: string;
    /** Message count */
    messageCount: number;
    /** Unread message count */
    unreadMessageCount: number;
    /** Converted order ID */
    orderId?: string;
    /** Sales representative ID */
    salesRepId?: string;
    /** Attachments */
    attachments: QuoteAttachment[];
    /** Quote history */
    history: QuoteHistoryEntry[];
}
/**
 * Lightweight quote representation for lists.
 */
interface QuoteSummary {
    id: string;
    quoteNumber: string;
    companyId: string;
    companyName: string;
    status: QuoteStatus;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    itemCount: number;
    total: number;
    currency: string;
    validUntil: string;
    createdAt: string;
    updatedAt: string;
    hasUnreadMessages: boolean;
}
/**
 * Item input for creating/updating a quote.
 */
interface QuoteItemInput {
    productId: string;
    quantity: number;
    requestedPrice?: number;
    targetDeliveryDate?: string;
    notes?: string;
    specifications?: Record<string, string>;
}
/**
 * Data required to create a new quote.
 */
interface CreateQuoteInput {
    items: QuoteItemInput[];
    shippingAddressId?: string;
    requestedDeliveryDate?: string;
    shippingMethod?: string;
    paymentTerms?: PaymentTermType;
    notesForSeller?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    validityDays?: number;
}
/**
 * Data to update a draft quote.
 */
interface UpdateQuoteInput {
    items?: QuoteItemInput[];
    shippingAddressId?: string;
    requestedDeliveryDate?: string;
    shippingMethod?: string;
    paymentTerms?: PaymentTermType;
    notesForSeller?: string;
    internalNotes?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}
/**
 * Seller response to a quote.
 */
interface QuoteResponseInput {
    items: {
        quoteItemId: string;
        quotedPrice: number;
        confirmedDeliveryDate?: string;
        notes?: string;
    }[];
    shipping: number;
    terms?: Partial<QuoteTerms>;
    sellerNotes?: string;
    validityDays?: number;
}
/**
 * Filters for listing quotes.
 */
interface QuoteFilters {
    status?: QuoteStatus | QuoteStatus[];
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    companyId?: string;
    employeeId?: string;
    salesRepId?: string;
    minTotal?: number;
    maxTotal?: number;
    createdAfter?: string;
    createdBefore?: string;
    validUntilAfter?: string;
    validUntilBefore?: string;
    search?: string;
    hasUnreadMessages?: boolean;
}

/**
 * B2B Approval Types
 * Defines approval workflow entities, rules, and statuses for B2B order management.
 */
/**
 * Type of entity requiring approval.
 */
type ApprovalEntityType = 'order' | 'quote' | 'return' | 'credit' | 'employee' | 'spending_limit';
/**
 * Condition that triggers an approval requirement.
 */
type ApprovalTriggerType = 'amount_exceeds' | 'spending_limit_exceeds' | 'quantity_exceeds' | 'new_vendor' | 'new_customer' | 'restricted_product' | 'out_of_budget' | 'manual' | 'always';
/**
 * Configuration for an approval trigger.
 */
interface ApprovalTrigger {
    type: ApprovalTriggerType;
    /** Threshold value (for amount/quantity triggers) */
    threshold?: number;
    /** Product IDs (for restricted product trigger) */
    productIds?: string[];
    /** Category IDs (for restricted category trigger) */
    categoryIds?: string[];
    /** Description of the trigger */
    description?: string;
}
/**
 * Status of an approval request.
 */
type ApprovalStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated' | 'delegated' | 'expired' | 'cancelled';
/**
 * A single level in a multi-level approval workflow.
 */
interface ApprovalLevel {
    /** Level number (1 = first, 2 = second, etc.) */
    level: number;
    /** Name of this approval level */
    name: string;
    /** Description of this level's purpose */
    description?: string;
    /** IDs of employees who can approve at this level */
    approverIds: string[];
    /** Role required to approve (alternative to specific approvers) */
    approverRole?: string;
    /** Department that can approve (alternative to specific approvers) */
    approverDepartmentId?: string;
    /** Minimum amount threshold for this level */
    minAmount?: number;
    /** Maximum amount threshold for this level */
    maxAmount?: number;
    /** How many approvers needed (1 = any one, 2+ = multiple) */
    requiredApprovals: number;
    /** Whether all approvers must approve (vs any one) */
    requireAll: boolean;
    /** Hours before auto-escalation */
    escalationHours?: number;
    /** Next level to escalate to */
    escalatesToLevel?: number;
}
/**
 * An approval workflow configuration.
 */
interface ApprovalWorkflow {
    /** Unique identifier */
    id: string;
    /** Company this workflow belongs to */
    companyId: string;
    /** Workflow name */
    name: string;
    /** Workflow description */
    description?: string;
    /** Entity type this workflow applies to */
    entityType: ApprovalEntityType;
    /** Triggers that activate this workflow */
    triggers: ApprovalTrigger[];
    /** Approval levels */
    levels: ApprovalLevel[];
    /** Whether this workflow is active */
    isActive: boolean;
    /** Whether this is the default workflow for the entity type */
    isDefault: boolean;
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
}
/**
 * Status of a single approval step.
 */
interface ApprovalStep {
    /** Unique identifier */
    id: string;
    /** Approval request ID */
    approvalRequestId: string;
    /** Level number in the workflow */
    level: number;
    /** Level name */
    levelName: string;
    /** Status of this step */
    status: ApprovalStatus;
    /** Assigned approver IDs */
    assignedApproverIds: string[];
    /** Approver who took action */
    decidedById?: string;
    /** Approver name (denormalized) */
    decidedByName?: string;
    /** Decision timestamp */
    decidedAt?: string;
    /** Decision comment */
    comment?: string;
    /** Number of approvals received (for multi-approver steps) */
    approvalsReceived: number;
    /** Number of approvals required */
    approvalsRequired: number;
    /** Individual approver decisions */
    approverDecisions: ApproverDecision[];
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
    /** Due date for this step */
    dueAt?: string;
}
/**
 * Individual approver decision within a step.
 */
interface ApproverDecision {
    approverId: string;
    approverName: string;
    decision: 'approved' | 'rejected' | 'pending';
    comment?: string;
    decidedAt?: string;
}
/**
 * B2B Approval Request entity.
 * Represents a request for approval on an entity (order, quote, etc.).
 */
interface ApprovalRequest {
    /** Unique identifier */
    id: string;
    /** Human-readable request number */
    requestNumber: string;
    /** Company ID */
    companyId: string;
    /** Company name (denormalized) */
    companyName: string;
    /** Type of entity */
    entityType: ApprovalEntityType;
    /** ID of the entity */
    entityId: string;
    /** Reference number of the entity */
    entityReference: string;
    /** Entity summary for display */
    entitySummary: string;
    /** Entity amount (if applicable) */
    entityAmount?: number;
    /** Entity currency */
    entityCurrency?: string;
    /** Employee who requested approval */
    requesterId: string;
    /** Requester name (denormalized) */
    requesterName: string;
    /** Requester email */
    requesterEmail: string;
    /** Workflow ID used */
    workflowId: string;
    /** Workflow name (denormalized) */
    workflowName: string;
    /** Trigger that caused this request */
    triggerType: ApprovalTriggerType;
    /** Trigger description */
    triggerDescription: string;
    /** Overall status */
    status: ApprovalStatus;
    /** Current level being processed */
    currentLevel: number;
    /** Total levels in workflow */
    totalLevels: number;
    /** All approval steps */
    steps: ApprovalStep[];
    /** Priority level */
    priority: 'low' | 'normal' | 'high' | 'urgent';
    /** Whether this is expedited */
    isExpedited: boolean;
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
    /** Due date for final decision */
    dueAt?: string;
    /** ISO timestamp of completion */
    completedAt?: string;
    /** Requester notes */
    requesterNotes?: string;
    /** Final decision notes */
    decisionNotes?: string;
    /** Attachments */
    attachments?: ApprovalAttachment[];
    /** Final decision maker ID */
    finalDecisionById?: string;
    /** Final decision maker name */
    finalDecisionByName?: string;
}
/**
 * Attachment on an approval request.
 */
interface ApprovalAttachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedById: string;
    uploadedByName: string;
    uploadedAt: string;
}
/**
 * Lightweight approval request for lists.
 */
interface ApprovalSummary {
    id: string;
    requestNumber: string;
    entityType: ApprovalEntityType;
    entityReference: string;
    entitySummary: string;
    entityAmount?: number;
    entityCurrency?: string;
    requesterName: string;
    status: ApprovalStatus;
    currentLevel: number;
    totalLevels: number;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    createdAt: string;
    dueAt?: string;
    isOverdue: boolean;
}
/**
 * Action to take on an approval request.
 */
type ApprovalAction = 'approve' | 'reject' | 'escalate' | 'delegate' | 'request_info';
/**
 * Input for taking action on an approval.
 */
interface ApprovalActionInput {
    action: ApprovalAction;
    comment?: string;
    /** For delegation: ID of employee to delegate to */
    delegateToId?: string;
    /** For escalation: level to escalate to */
    escalateToLevel?: number;
}
/**
 * Input for creating an approval workflow.
 */
interface CreateApprovalWorkflowInput {
    name: string;
    description?: string;
    entityType: ApprovalEntityType;
    triggers: ApprovalTrigger[];
    levels: Omit<ApprovalLevel, 'level'>[];
    isDefault?: boolean;
}
/**
 * Input for updating an approval workflow.
 */
interface UpdateApprovalWorkflowInput {
    name?: string;
    description?: string;
    triggers?: ApprovalTrigger[];
    levels?: Omit<ApprovalLevel, 'level'>[];
    isActive?: boolean;
    isDefault?: boolean;
}
/**
 * Filters for listing approvals.
 */
interface ApprovalFilters {
    status?: ApprovalStatus | ApprovalStatus[];
    entityType?: ApprovalEntityType;
    requesterId?: string;
    approverId?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    isOverdue?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    search?: string;
}
/**
 * A delegation of approval authority.
 */
interface ApprovalDelegation {
    id: string;
    companyId: string;
    /** Employee delegating authority */
    delegatorId: string;
    delegatorName: string;
    /** Employee receiving authority */
    delegateeId: string;
    delegateeName: string;
    /** Start date of delegation */
    startDate: string;
    /** End date of delegation */
    endDate: string;
    /** Reason for delegation */
    reason?: string;
    /** Whether delegation is active */
    isActive: boolean;
    /** Entity types this applies to */
    entityTypes?: ApprovalEntityType[];
    /** Max amount delegatee can approve */
    maxAmount?: number;
    createdAt: string;
}

/**
 * B2B Spending Types
 * Defines spending limits, rules, and tracking for B2B budget management.
 */
/**
 * Time period for spending limits.
 */
type SpendingPeriod = 'per_order' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
/**
 * Type of entity the spending limit applies to.
 */
type SpendingLimitEntityType = 'employee' | 'department' | 'company' | 'role';
/**
 * A spending limit configuration.
 */
interface SpendingLimit {
    /** Unique identifier */
    id: string;
    /** Company ID */
    companyId: string;
    /** Limit name */
    name: string;
    /** Limit description */
    description?: string;
    /** Type of entity this limit applies to */
    entityType: SpendingLimitEntityType;
    /** Entity ID (employee, department, or role ID) */
    entityId?: string;
    /** Entity name (denormalized) */
    entityName?: string;
    /** Spending period */
    period: SpendingPeriod;
    /** Maximum amount allowed */
    limitAmount: number;
    /** Currency */
    currency: string;
    /** Warning threshold (percentage of limit) */
    warningThreshold: number;
    /** Product category restrictions */
    categoryRestrictions?: CategoryRestriction[];
    /** Product restrictions */
    productRestrictions?: ProductRestriction[];
    /** Whether this limit is active */
    isActive: boolean;
    /** Current spending amount */
    currentSpending: number;
    /** Remaining amount */
    remainingAmount: number;
    /** Percentage used */
    percentageUsed: number;
    /** Whether warning threshold is exceeded */
    isWarning: boolean;
    /** Whether limit is exceeded */
    isExceeded: boolean;
    /** Last reset timestamp */
    lastResetAt: string;
    /** Next reset timestamp */
    nextResetAt: string;
    /** Created by employee ID */
    createdById: string;
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
}
/**
 * Category restriction on spending.
 */
interface CategoryRestriction {
    categoryId: string;
    categoryName: string;
    /** 'allow' = only these categories, 'block' = all except these */
    type: 'allow' | 'block';
}
/**
 * Product restriction on spending.
 */
interface ProductRestriction {
    productId: string;
    productName: string;
    productSku: string;
    /** 'allow' = only these products, 'block' = all except these */
    type: 'allow' | 'block';
}
/**
 * Type of spending rule action.
 */
type SpendingRuleAction = 'require_approval' | 'block' | 'warn' | 'notify' | 'escalate';
/**
 * A spending rule that triggers actions.
 */
interface SpendingRule {
    /** Unique identifier */
    id: string;
    /** Company ID */
    companyId: string;
    /** Rule name */
    name: string;
    /** Rule description */
    description?: string;
    /** Minimum amount to trigger (optional) */
    minAmount?: number;
    /** Maximum amount to trigger (optional) */
    maxAmount?: number;
    /** Categories that trigger this rule */
    categoryIds?: string[];
    /** Products that trigger this rule */
    productIds?: string[];
    /** Employee roles this applies to */
    roleIds?: string[];
    /** Departments this applies to */
    departmentIds?: string[];
    /** Action to take when triggered */
    action: SpendingRuleAction;
    /** IDs to notify (for 'notify' action) */
    notifyEmployeeIds?: string[];
    /** Approval workflow ID (for 'require_approval' action) */
    approvalWorkflowId?: string;
    /** Custom message to display */
    message?: string;
    /** Rule priority (lower = higher priority) */
    priority: number;
    /** Whether this rule is active */
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
/**
 * A spending transaction record.
 */
interface SpendingTransaction {
    /** Unique identifier */
    id: string;
    /** Company ID */
    companyId: string;
    /** Employee ID */
    employeeId: string;
    /** Employee name (denormalized) */
    employeeName: string;
    /** Department ID */
    departmentId?: string;
    /** Department name (denormalized) */
    departmentName?: string;
    /** Transaction type */
    type: 'order' | 'quote_conversion' | 'refund' | 'adjustment';
    /** Reference ID (order ID, etc.) */
    referenceId: string;
    /** Reference number */
    referenceNumber: string;
    /** Transaction amount (positive = spend, negative = refund) */
    amount: number;
    /** Currency */
    currency: string;
    /** Spending limit IDs affected */
    affectedLimitIds: string[];
    /** Transaction status */
    status: 'completed' | 'pending' | 'reversed';
    /** Notes */
    notes?: string;
    /** ISO timestamp */
    createdAt: string;
}
/**
 * Spending report for a period.
 */
interface SpendingReport {
    /** Report period start */
    periodStart: string;
    /** Report period end */
    periodEnd: string;
    /** Currency */
    currency: string;
    /** Total spending */
    totalSpending: number;
    /** Total orders */
    totalOrders: number;
    /** Average order value */
    averageOrderValue: number;
    /** Spending by category */
    byCategory: SpendingByCategory[];
    /** Spending by employee */
    byEmployee: SpendingByEmployee[];
    /** Spending by department */
    byDepartment: SpendingByDepartment[];
    /** Daily spending data */
    dailyTrend: DailySpending[];
    /** Employees who exceeded limits */
    limitExceeded: LimitExceededAlert[];
    /** Employees near limits */
    nearLimit: NearLimitAlert[];
}
/**
 * Spending grouped by category.
 */
interface SpendingByCategory {
    categoryId: string;
    categoryName: string;
    amount: number;
    orderCount: number;
    percentOfTotal: number;
}
/**
 * Spending grouped by employee.
 */
interface SpendingByEmployee {
    employeeId: string;
    employeeName: string;
    departmentName?: string;
    amount: number;
    orderCount: number;
    percentOfTotal: number;
    monthlyLimit?: number;
    limitUsagePercent?: number;
}
/**
 * Spending grouped by department.
 */
interface SpendingByDepartment {
    departmentId: string;
    departmentName: string;
    amount: number;
    orderCount: number;
    employeeCount: number;
    percentOfTotal: number;
    budget?: number;
    budgetUsagePercent?: number;
}
/**
 * Daily spending data point.
 */
interface DailySpending {
    date: string;
    amount: number;
    orderCount: number;
}
/**
 * Alert for exceeded spending limit.
 */
interface LimitExceededAlert {
    employeeId: string;
    employeeName: string;
    limitName: string;
    limitAmount: number;
    currentSpending: number;
    exceededBy: number;
    exceededAt: string;
}
/**
 * Alert for near spending limit.
 */
interface NearLimitAlert {
    employeeId: string;
    employeeName: string;
    limitName: string;
    limitAmount: number;
    currentSpending: number;
    percentUsed: number;
    remaining: number;
}
/**
 * Input for creating a spending limit.
 */
interface CreateSpendingLimitInput {
    name: string;
    description?: string;
    entityType: SpendingLimitEntityType;
    entityId?: string;
    period: SpendingPeriod;
    limitAmount: number;
    currency: string;
    warningThreshold?: number;
    categoryRestrictions?: Omit<CategoryRestriction, 'categoryName'>[];
    productRestrictions?: Omit<ProductRestriction, 'productName' | 'productSku'>[];
}
/**
 * Input for updating a spending limit.
 */
interface UpdateSpendingLimitInput {
    name?: string;
    description?: string;
    limitAmount?: number;
    warningThreshold?: number;
    categoryRestrictions?: Omit<CategoryRestriction, 'categoryName'>[];
    productRestrictions?: Omit<ProductRestriction, 'productName' | 'productSku'>[];
    isActive?: boolean;
}
/**
 * Input for creating a spending rule.
 */
interface CreateSpendingRuleInput {
    name: string;
    description?: string;
    minAmount?: number;
    maxAmount?: number;
    categoryIds?: string[];
    productIds?: string[];
    roleIds?: string[];
    departmentIds?: string[];
    action: SpendingRuleAction;
    notifyEmployeeIds?: string[];
    approvalWorkflowId?: string;
    message?: string;
    priority?: number;
}
/**
 * Input for manual spending adjustment.
 */
interface SpendingAdjustmentInput {
    employeeId: string;
    amount: number;
    reason: string;
    affectedLimitIds?: string[];
}
/**
 * Filters for spending reports and queries.
 */
interface SpendingFilters {
    employeeId?: string;
    departmentId?: string;
    categoryId?: string;
    periodStart: string;
    periodEnd: string;
    minAmount?: number;
    maxAmount?: number;
}

/**
 * B2B Order Types
 * Defines order entities, items, shipping, payment, and workflow for B2B order management.
 */

/**
 * Status of an order in the workflow.
 */
type OrderStatus$1 = 'pending_approval' | 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
/**
 * A single item in an order.
 */
interface OrderItem$1 {
    /** Unique identifier */
    id: string;
    /** Product ID */
    productId: string;
    /** Product SKU/reference */
    productSku: string;
    /** Product name at time of order */
    productName: string;
    /** Product image URL */
    productImage?: string;
    /** Ordered quantity */
    quantity: number;
    /** Unit of measure */
    unitOfMeasure: string;
    /** Original unit price (list price) */
    listPrice: number;
    /** Final unit price (after discounts) */
    unitPrice: number;
    /** Discount percentage applied */
    discountPercent?: number;
    /** Discount amount per unit */
    discountAmount?: number;
    /** Line total (quantity * unitPrice) */
    lineTotal: number;
    /** Tax amount for this line */
    lineTax: number;
    /** Weight per unit (for shipping calculation) */
    unitWeight?: number;
    /** Total weight for this line */
    totalWeight?: number;
    /** Notes specific to this item */
    notes?: string;
    /** Custom specifications */
    specifications?: Record<string, string>;
    /** Fulfillment status for this item */
    fulfillmentStatus?: 'pending' | 'partial' | 'fulfilled' | 'backordered';
    /** Quantity fulfilled */
    quantityFulfilled?: number;
    /** Quantity backordered */
    quantityBackordered?: number;
}
/**
 * Order financial totals.
 */
interface OrderTotals$1 {
    /** Sum of line totals before discounts */
    subtotal: number;
    /** Total discount amount */
    discount: number;
    /** Shipping cost */
    shipping: number;
    /** Tax amount */
    tax: number;
    /** Grand total */
    total: number;
    /** Currency code */
    currency: string;
    /** Total weight */
    totalWeight?: number;
    /** Weight unit (kg, lb) */
    weightUnit?: string;
}
/**
 * Shipping address for an order.
 */
interface OrderShippingAddress {
    /** Address ID reference */
    addressId?: string;
    /** Recipient name */
    recipientName: string;
    /** Company name */
    companyName?: string;
    /** Street address line 1 */
    street1: string;
    /** Street address line 2 */
    street2?: string;
    /** City */
    city: string;
    /** State/Province/Region */
    state?: string;
    /** Postal/ZIP code */
    postalCode: string;
    /** Country code (ISO 3166-1 alpha-2) */
    countryCode: string;
    /** Country name */
    country: string;
    /** Phone number */
    phone?: string;
    /** Delivery instructions */
    deliveryInstructions?: string;
}
/**
 * Shipping information for an order.
 */
interface OrderShipping {
    /** Shipping address */
    address: OrderShippingAddress;
    /** Billing address (if different) */
    billingAddress?: OrderShippingAddress;
    /** Shipping method ID */
    methodId: string;
    /** Shipping method name */
    methodName: string;
    /** Shipping carrier */
    carrier?: string;
    /** Tracking number */
    trackingNumber?: string;
    /** Tracking URL */
    trackingUrl?: string;
    /** Estimated delivery date */
    estimatedDelivery?: string;
    /** Actual delivery date */
    actualDelivery?: string;
    /** Shipped date */
    shippedAt?: string;
    /** Shipping cost */
    cost: number;
    /** Whether shipping is free */
    isFreeShipping: boolean;
    /** Shipping notes */
    notes?: string;
    /** Signature required on delivery */
    signatureRequired?: boolean;
    /** Insurance amount */
    insuranceAmount?: number;
}
/**
 * Payment method types.
 */
type PaymentMethodType = 'credit_card' | 'bank_transfer' | 'check' | 'wire' | 'net_terms' | 'purchase_order' | 'paypal' | 'other';
/**
 * Payment status.
 */
type PaymentStatus$1 = 'pending' | 'authorized' | 'paid' | 'partial' | 'refunded' | 'partial_refund' | 'failed' | 'cancelled';
/**
 * Payment information for an order.
 */
interface OrderPayment {
    /** Payment method type */
    method: PaymentMethodType;
    /** Payment method display name */
    methodName: string;
    /** Payment status */
    status: PaymentStatus$1;
    /** Payment reference/transaction ID */
    reference?: string;
    /** Purchase order number (for PO payments) */
    purchaseOrderNumber?: string;
    /** Payment terms type */
    paymentTerms: PaymentTermType;
    /** Payment terms days */
    paymentTermsDays?: number;
    /** Amount authorized */
    amountAuthorized?: number;
    /** Amount paid */
    amountPaid: number;
    /** Amount refunded */
    amountRefunded?: number;
    /** Amount due */
    amountDue: number;
    /** Payment due date */
    dueDate?: string;
    /** Date payment was received */
    paidAt?: string;
    /** Last 4 digits of card (for card payments) */
    cardLast4?: string;
    /** Card brand (for card payments) */
    cardBrand?: string;
    /** Bank name (for bank transfers) */
    bankName?: string;
    /** Payment notes */
    notes?: string;
}
/**
 * Type of order history event.
 */
type OrderHistoryEventType = 'created' | 'submitted' | 'approved' | 'rejected' | 'payment_received' | 'payment_failed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'returned' | 'refunded' | 'item_updated' | 'note_added' | 'tracking_updated';
/**
 * A history entry tracking order changes.
 */
interface OrderHistoryEntry {
    /** Unique identifier */
    id: string;
    /** Order ID */
    orderId: string;
    /** Event type */
    eventType: OrderHistoryEventType;
    /** Human-readable description */
    description: string;
    /** Actor who made the change */
    actorId: string;
    /** Actor type */
    actorType: 'buyer' | 'seller' | 'system';
    /** Actor name */
    actorName: string;
    /** Previous values (for changes) */
    previousValues?: Record<string, unknown>;
    /** New values (for changes) */
    newValues?: Record<string, unknown>;
    /** ISO timestamp */
    createdAt: string;
}
/**
 * An attachment on an order (invoice, packing slip, etc.).
 */
interface OrderAttachment {
    /** Unique identifier */
    id: string;
    /** File name */
    fileName: string;
    /** File type/MIME type */
    fileType: string;
    /** File size in bytes */
    fileSize: number;
    /** Download URL */
    url: string;
    /** Attachment type */
    attachmentType: 'invoice' | 'packing_slip' | 'receipt' | 'customs' | 'other';
    /** Uploaded by user ID */
    uploadedById: string;
    /** ISO timestamp of upload */
    uploadedAt: string;
}
/**
 * B2B Order entity.
 * Represents a complete purchase order with all associated data.
 */
interface Order$1 {
    /** Unique identifier */
    id: string;
    /** Human-readable order number */
    orderNumber: string;
    /** Company placing the order */
    companyId: string;
    /** Company name (denormalized) */
    companyName: string;
    /** Employee who placed the order */
    employeeId: string;
    /** Employee name (denormalized) */
    employeeName: string;
    /** Contact email for this order */
    contactEmail: string;
    /** Contact phone for this order */
    contactPhone?: string;
    /** Current order status */
    status: OrderStatus$1;
    /** Display label for status (localized) */
    statusLabel?: string;
    /** Priority level */
    priority: 'low' | 'normal' | 'high' | 'urgent';
    /** Order items */
    items: OrderItem$1[];
    /** Order totals */
    totals: OrderTotals$1;
    /** Shipping information */
    shipping: OrderShipping;
    /** Payment information */
    payment: OrderPayment;
    /** Whether approval was required */
    approvalRequired: boolean;
    /** Approval request ID (if approval was required) */
    approvalRequestId?: string;
    /** Approver ID (if approved) */
    approvedById?: string;
    /** Approver name (denormalized) */
    approvedByName?: string;
    /** Approval timestamp */
    approvedAt?: string;
    /** Source quote ID (if converted from quote) */
    sourceQuoteId?: string;
    /** Source quote number */
    sourceQuoteNumber?: string;
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
    /** ISO timestamp when submitted for approval */
    submittedAt?: string;
    /** ISO timestamp when shipped */
    shippedAt?: string;
    /** ISO timestamp when delivered */
    deliveredAt?: string;
    /** ISO timestamp when cancelled */
    cancelledAt?: string;
    /** Internal notes (visible only to buyer) */
    internalNotes?: string;
    /** Notes for seller/fulfillment */
    notesForSeller?: string;
    /** Seller notes */
    sellerNotes?: string;
    /** Cancellation reason (if cancelled) */
    cancelReason?: string;
    /** Sales representative ID */
    salesRepId?: string;
    /** Sales representative name */
    salesRepName?: string;
    /** Attachments */
    attachments: OrderAttachment[];
    /** Order history */
    history: OrderHistoryEntry[];
    /** Whether this order can be reordered */
    canReorder: boolean;
    /** Parent order ID (if this is a reorder) */
    reorderedFromId?: string;
}
/**
 * Lightweight order representation for lists.
 * Matches the mock data pattern used in the UI.
 */
interface OrderSummary {
    /** Unique identifier */
    id: string;
    /** Human-readable order number */
    orderNumber: string;
    /** Order date (formatted for display) */
    date?: string;
    /** ISO timestamp of creation */
    createdAt: string;
    /** Current status */
    status: OrderStatus$1;
    /** Status display label (localized) */
    statusLabel?: string;
    /** Number of items in the order */
    itemCount: number;
    /** Order total */
    total: number;
    /** Currency code */
    currency: string;
    /** Shipping address (formatted for display) */
    shippingAddress: string;
    /** Tracking number (if shipped) */
    trackingNumber?: string;
    /** Name of employee who ordered */
    orderedBy: string;
    /** Estimated delivery date (if shipped) */
    estimatedDelivery?: string;
    /** ISO timestamp when shipped */
    shippedAt?: string;
    /** Actual delivery date (if delivered) */
    deliveredAt?: string;
    /** ISO timestamp when cancelled */
    cancelledAt?: string;
    /** Whether approval is required/pending */
    approvalRequired?: boolean;
    /** Cancellation reason (if cancelled) */
    cancelReason?: string;
    /** Whether this order can be reordered */
    canReorder?: boolean;
}
/**
 * Item input for creating an order.
 */
interface OrderItemInput {
    /** Product ID */
    productId: string;
    /** Quantity to order */
    quantity: number;
    /** Requested unit price (for negotiated pricing) */
    requestedPrice?: number;
    /** Notes for this item */
    notes?: string;
    /** Custom specifications */
    specifications?: Record<string, string>;
}
/**
 * Shipping address input.
 */
interface ShippingAddressInput {
    /** Existing address ID (if using saved address) */
    addressId?: string;
    /** Recipient name */
    recipientName?: string;
    /** Company name */
    companyName?: string;
    /** Street address line 1 */
    street1?: string;
    /** Street address line 2 */
    street2?: string;
    /** City */
    city?: string;
    /** State/Province/Region */
    state?: string;
    /** Postal/ZIP code */
    postalCode?: string;
    /** Country code (ISO 3166-1 alpha-2) */
    countryCode?: string;
    /** Phone number */
    phone?: string;
    /** Delivery instructions */
    deliveryInstructions?: string;
}
/**
 * Data required to create a new order.
 */
interface CreateOrderInput {
    /** Order items */
    items: OrderItemInput[];
    /** Shipping address */
    shippingAddress: ShippingAddressInput;
    /** Billing address (if different from shipping) */
    billingAddress?: ShippingAddressInput;
    /** Shipping method ID */
    shippingMethodId: string;
    /** Payment method type */
    paymentMethod: PaymentMethodType;
    /** Payment terms (for net terms payment) */
    paymentTerms?: PaymentTermType;
    /** Purchase order number */
    purchaseOrderNumber?: string;
    /** Notes for seller */
    notesForSeller?: string;
    /** Internal notes */
    internalNotes?: string;
    /** Priority level */
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    /** Source quote ID (if converting from quote) */
    sourceQuoteId?: string;
    /** Requested delivery date */
    requestedDeliveryDate?: string;
}
/**
 * Data to update an existing order.
 * Only certain fields can be updated based on order status.
 */
interface UpdateOrderInput {
    /** Shipping address (only if not yet shipped) */
    shippingAddress?: ShippingAddressInput;
    /** Shipping method (only if not yet shipped) */
    shippingMethodId?: string;
    /** Notes for seller */
    notesForSeller?: string;
    /** Internal notes */
    internalNotes?: string;
    /** Priority level */
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}
/**
 * Input for cancelling an order.
 */
interface CancelOrderInput {
    /** Reason for cancellation */
    reason: string;
    /** Additional notes */
    notes?: string;
}
/**
 * Input for returning an order or items.
 */
interface ReturnOrderInput {
    /** Items to return (if partial return) */
    items?: {
        orderItemId: string;
        quantity: number;
        reason: string;
    }[];
    /** Return all items */
    returnAll?: boolean;
    /** Overall return reason */
    reason: string;
    /** Additional notes */
    notes?: string;
}
/**
 * Filters for listing orders.
 */
interface OrderFilters {
    /** Filter by status */
    status?: OrderStatus$1 | OrderStatus$1[];
    /** Filter by priority */
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    /** Filter by company ID */
    companyId?: string;
    /** Filter by employee ID */
    employeeId?: string;
    /** Filter by sales rep ID */
    salesRepId?: string;
    /** Minimum order total */
    minTotal?: number;
    /** Maximum order total */
    maxTotal?: number;
    /** Orders created after this date */
    createdAfter?: string;
    /** Orders created before this date */
    createdBefore?: string;
    /** Orders delivered after this date */
    deliveredAfter?: string;
    /** Orders delivered before this date */
    deliveredBefore?: string;
    /** Search term (order number, tracking, customer name) */
    search?: string;
    /** Filter by approval required */
    approvalRequired?: boolean;
    /** Filter by source quote ID */
    sourceQuoteId?: string;
    /** Filter by tracking number */
    trackingNumber?: string;
    /** Filter by purchase order number */
    purchaseOrderNumber?: string;
}
/**
 * Sort field options for order lists.
 */
type OrderSortField = 'orderNumber' | 'createdAt' | 'updatedAt' | 'total' | 'status' | 'deliveredAt';
/**
 * Sort configuration for order lists.
 */
interface OrderSortOptions {
    /** Field to sort by */
    field: OrderSortField;
    /** Sort direction */
    direction: 'asc' | 'desc';
}
/**
 * Statistics for order dashboard.
 */
interface OrderStatistics {
    /** Total number of orders */
    total: number;
    /** Orders pending approval */
    pendingApproval: number;
    /** Orders pending payment */
    pendingPayment: number;
    /** Orders being processed */
    processing: number;
    /** Orders shipped */
    shipped: number;
    /** Orders delivered */
    delivered: number;
    /** Orders cancelled */
    cancelled: number;
    /** Orders returned */
    returned: number;
    /** Total revenue */
    totalRevenue: number;
    /** Average order value */
    averageOrderValue: number;
    /** Currency for monetary values */
    currency: string;
}

/**
 * B2B Report Types
 * Defines types for B2B reporting and analytics functionality.
 */
/**
 * Time period for report data.
 */
type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';
/**
 * Type of report to display.
 */
type ReportType = 'spending' | 'category' | 'trend' | 'products';
/**
 * Employee spending data for reports.
 */
interface EmployeeSpending {
    /** Employee unique identifier */
    employeeId: string;
    /** Employee full name */
    employeeName: string;
    /** Total spending in the period */
    totalSpending: number;
    /** Number of orders in the period */
    ordersCount: number;
    /** Average order value */
    averageOrder: number;
    /** Percentage of total company spending */
    percentOfTotal: number;
}
/**
 * Spending data grouped by product category.
 */
interface CategorySpending {
    /** Category unique identifier */
    categoryId: string;
    /** Category name */
    categoryName: string;
    /** Total spending in the category */
    totalSpending: number;
    /** Number of items purchased in the category */
    itemsCount: number;
    /** Percentage of total spending */
    percentOfTotal: number;
}
/**
 * Monthly spending trend data point.
 */
interface MonthlyTrend {
    /** Month identifier (e.g., "2024-07", "2024-08") */
    month: string;
    /** Total spending in the month */
    spending: number;
    /** Number of orders in the month */
    ordersCount: number;
    /** Average order value */
    averageOrder: number;
}
/**
 * Top-selling product data for reports.
 */
interface TopProduct {
    /** Product unique identifier */
    productId: string;
    /** Product name */
    productName: string;
    /** Product SKU */
    sku: string;
    /** Quantity sold */
    quantity: number;
    /** Total spending on this product */
    totalSpending: number;
    /** Average price per unit */
    averagePrice: number;
}
/**
 * Summary statistics for the report dashboard.
 */
interface ReportSummary {
    /** Total spending in the period */
    totalSpending: number;
    /** Budget limit for the period */
    budgetLimit: number;
    /** Number of orders in the period */
    ordersCount: number;
    /** Average order value */
    averageOrder: number;
    /** Number of pending approvals */
    pendingApprovals: number;
}
/**
 * Complete report data structure.
 */
interface ReportData {
    /** Summary statistics */
    summary: ReportSummary;
    /** Spending by employee */
    byEmployee: EmployeeSpending[];
    /** Spending by category */
    byCategory: CategorySpending[];
    /** Monthly spending trend */
    monthlyTrend: MonthlyTrend[];
    /** Top-selling products */
    topProducts: TopProduct[];
}

/**
 * Bulk Order Types
 *
 * Type definitions for bulk order operations in the B2B e-commerce platform.
 * Includes types for bulk order items, summaries, catalog entries, and validation.
 *
 * @packageDocumentation
 */
/**
 * Represents a single item in a bulk order.
 *
 * @example
 * ```ts
 * const item: BulkOrderItem = {
 *   sku: 'BRA-001',
 *   quantity: 5,
 *   product: productCatalogEntry,
 *   isValid: true,
 *   unitPrice: 450,
 *   lineTotal: 2250,
 * };
 * ```
 */
interface BulkOrderItem {
    /** Stock Keeping Unit (product reference) */
    sku: string;
    /** Quantity requested */
    quantity: number;
    /** Reference to the product catalog entry (if found) */
    product?: ProductCatalogEntry;
    /** Whether the item is valid for ordering */
    isValid: boolean;
    /** Price per unit (in EUR) */
    unitPrice?: number;
    /** Total price for this line (unitPrice * quantity) */
    lineTotal?: number;
    /** Error messages if item has validation issues */
    errors?: string[];
}
/**
 * Summary of a bulk order with aggregated totals.
 *
 * @example
 * ```ts
 * const summary: BulkOrderSummary = {
 *   totalItems: 3,
 *   totalQuantity: 25,
 *   totalAmount: 3500,
 *   currency: 'EUR',
 *   errorCount: 1,
 *   availableCount: 2,
 * };
 * ```
 */
interface BulkOrderSummary {
    /** Number of distinct items (SKUs) */
    totalItems: number;
    /** Sum of all quantities */
    totalQuantity: number;
    /** Total order amount before tax (in cents or minor currency unit) */
    totalAmount: number;
    /** Currency code (ISO 4217) */
    currency: string;
    /** Number of items with errors */
    errorCount: number;
    /** Number of items that are fully available */
    availableCount: number;
}
/**
 * Product catalog entry for bulk order lookup.
 *
 * @example
 * ```ts
 * const product: ProductCatalogEntry = {
 *   productId: 'prod_001',
 *   sku: 'BRA-001',
 *   name: 'Bracelet Or 18K - Maille Figaro',
 *   description: 'Bracelet en or 18K avec maille figaro',
 *   unitPrice: 450,
 *   currency: 'EUR',
 *   minQuantity: 1,
 *   maxQuantity: 100,
 *   availableStock: 25,
 *   category: 'bracelets',
 *   brand: 'Maison',
 * };
 * ```
 */
interface ProductCatalogEntry {
    /** Product unique identifier */
    productId: string;
    /** Stock Keeping Unit (product reference) */
    sku: string;
    /** Product name */
    name: string;
    /** Product description */
    description: string;
    /** Price per unit */
    unitPrice: number;
    /** Currency code (ISO 4217) */
    currency: string;
    /** Minimum order quantity */
    minQuantity: number;
    /** Maximum order quantity */
    maxQuantity: number;
    /** Current available stock level */
    availableStock: number;
    /** Product category name */
    category: string;
    /** Product brand name */
    brand: string;
    /** Product image URL */
    imageUrl?: string;
}
/**
 * Result of bulk order validation.
 *
 * @example
 * ```ts
 * const result: BulkOrderValidationResult = {
 *   isValid: false,
 *   errors: [
 *     { row: 1, field: 'sku', code: 'PRODUCT_NOT_FOUND', message: 'SKU non trouve' }
 *   ],
 *   warnings: [],
 *   validItems: [],
 *   invalidCount: 1,
 *   totalAmount: 0,
 *   currency: 'EUR',
 * };
 * ```
 */
interface BulkOrderValidationResult {
    /** Whether the entire bulk order is valid */
    isValid: boolean;
    /** List of validation errors */
    errors: BulkOrderValidationError[];
    /** List of validation warnings (non-blocking) */
    warnings: BulkOrderValidationWarning[];
    /** List of valid items that passed validation */
    validItems: BulkOrderItem[];
    /** Number of invalid items */
    invalidCount: number;
    /** Total amount for valid items */
    totalAmount: number;
    /** Currency code for the total amount */
    currency: string;
}
/**
 * Validation error for a bulk order item.
 */
interface BulkOrderValidationError {
    /** Row number in the bulk order (1-indexed) */
    row: number;
    /** Field that has the error */
    field: string;
    /** Error code for programmatic handling */
    code: BulkOrderErrorCode;
    /** Human-readable error message */
    message: string;
}
/**
 * Validation warning for a bulk order item.
 */
interface BulkOrderValidationWarning {
    /** SKU that has the warning */
    sku: string;
    /** Warning code for programmatic handling */
    code: BulkOrderWarningCode;
    /** Human-readable warning message */
    message: string;
}
/**
 * Error codes for bulk order validation.
 */
type BulkOrderErrorCode = 'UNKNOWN_SKU' | 'PRODUCT_NOT_FOUND' | 'INSUFFICIENT_STOCK' | 'INVALID_QUANTITY' | 'PRODUCT_UNAVAILABLE' | 'EXCEEDS_ORDER_LIMIT' | 'BELOW_MIN_QUANTITY' | 'BELOW_MINIMUM';
/**
 * Warning codes for bulk order validation.
 */
type BulkOrderWarningCode = 'LOW_STOCK' | 'PRICE_CHANGED' | 'BACKORDER_AVAILABLE';
/**
 * Input for parsing CSV content into bulk order items.
 */
interface BulkOrderCsvInput {
    /** Raw CSV content */
    content: string;
    /** Delimiter character (default: comma) */
    delimiter?: ',' | ';' | '\t';
    /** Whether the first row is a header */
    hasHeader?: boolean;
}
/**
 * Result of parsing CSV content.
 */
interface BulkOrderCsvParseResult {
    /** Successfully parsed items */
    items: Array<{
        sku: string;
        quantity: number;
    }>;
    /** Parsing errors */
    errors: Array<{
        line: number;
        message: string;
    }>;
}

/**
 * Warehouse Types
 *
 * Defines types for warehouse/point-of-sale management in B2B e-commerce.
 * Supports multi-location inventory, pickup points, and delivery options.
 *
 * @packageDocumentation
 */
/**
 * Type of warehouse/location
 */
type WarehouseType = 'store' | 'depot' | 'warehouse' | 'distribution_center';
/**
 * Status of the warehouse
 */
type WarehouseStatus = 'active' | 'inactive' | 'maintenance' | 'closed';
/**
 * Warehouse physical address
 */
interface WarehouseAddress {
    /** Street address line 1 */
    street1: string;
    /** Street address line 2 (optional) */
    street2?: string;
    /** City */
    city: string;
    /** Postal/ZIP code */
    postalCode: string;
    /** State/Province/Region */
    region?: string;
    /** Country code (ISO 3166-1 alpha-2) */
    countryCode: string;
    /** Country name */
    country: string;
    /** Latitude for map display */
    latitude?: number;
    /** Longitude for map display */
    longitude?: number;
}
/**
 * Time slot for opening hours
 */
interface TimeSlot {
    /** Opening time (HH:mm format) */
    open: string;
    /** Closing time (HH:mm format) */
    close: string;
}
/**
 * Day of week
 */
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
/**
 * Opening hours for a specific day
 */
interface DaySchedule {
    /** Day of the week */
    day: DayOfWeek;
    /** Whether the warehouse is open on this day */
    isOpen: boolean;
    /** Time slots (supports lunch breaks) */
    slots: TimeSlot[];
}
/**
 * Special opening hours (holidays, special events)
 */
interface SpecialSchedule {
    /** Date (YYYY-MM-DD format) */
    date: string;
    /** Description (e.g., "Christmas Eve") */
    description?: string;
    /** Whether the warehouse is open */
    isOpen: boolean;
    /** Time slots if open */
    slots?: TimeSlot[];
}
/**
 * Complete opening hours configuration
 */
interface OpeningHours {
    /** Regular weekly schedule */
    regular: DaySchedule[];
    /** Special dates (holidays, etc.) */
    special?: SpecialSchedule[];
    /** Timezone (IANA format) */
    timezone: string;
}
/**
 * Type of delivery option
 */
type DeliveryOptionType = 'store_pickup' | 'express_pickup' | 'standard_delivery' | 'express_delivery' | 'scheduled_delivery' | 'locker_pickup';
/**
 * Delivery option configuration
 */
interface DeliveryOption {
    /** Unique identifier */
    id: string;
    /** Type of delivery */
    type: DeliveryOptionType;
    /** Display name */
    name: string;
    /** Description */
    description?: string;
    /** Estimated delivery time (human readable) */
    estimatedTime: string;
    /** Estimated delivery time in hours (for calculations) */
    estimatedHours?: number;
    /** Price (HT - tax excluded) */
    priceHT: number;
    /** Currency */
    currency: string;
    /** Whether this option is free above certain order value */
    freeAbove?: number;
    /** Minimum order value to unlock this option */
    minOrderValue?: number;
    /** Maximum order weight in kg */
    maxWeight?: number;
    /** Whether this option is available */
    isAvailable: boolean;
    /** Available time slots for scheduled delivery */
    timeSlots?: TimeSlot[];
}
/**
 * Contact information for the warehouse
 */
interface WarehouseContact {
    /** Contact name */
    name?: string;
    /** Phone number */
    phone?: string;
    /** Email address */
    email?: string;
    /** Fax number */
    fax?: string;
}
/**
 * Warehouse capabilities and features
 */
interface WarehouseCapabilities {
    /** Supports click & collect */
    pickupEnabled: boolean;
    /** Supports delivery from this location */
    deliveryEnabled: boolean;
    /** Has professional counter service */
    hasCounter: boolean;
    /** Has showroom/display area */
    hasShowroom: boolean;
    /** Supports dangerous goods */
    handlesDangerousGoods: boolean;
    /** Has forklift for heavy items */
    hasForklift: boolean;
    /** Maximum item weight that can be handled (kg) */
    maxItemWeight?: number;
    /** Supports returns */
    acceptsReturns: boolean;
}
/**
 * Complete Warehouse entity
 */
interface Warehouse {
    /** Unique identifier */
    id: string;
    /** Internal code (for reference) */
    code: string;
    /** Display name */
    name: string;
    /** Type of location */
    type: WarehouseType;
    /** Status */
    status: WarehouseStatus;
    /** Physical address */
    address: WarehouseAddress;
    /** Contact information */
    contact?: WarehouseContact;
    /** Opening hours */
    openingHours: OpeningHours;
    /** Available delivery options */
    deliveryOptions: DeliveryOption[];
    /** Capabilities and features */
    capabilities: WarehouseCapabilities;
    /** Associated company IDs (for restricted warehouses) */
    allowedCompanyIds?: string[];
    /** Whether this is the default warehouse */
    isDefault: boolean;
    /** Sort order for display */
    sortOrder: number;
    /** Custom metadata */
    metadata?: Record<string, unknown>;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}
/**
 * Warehouse summary for lists
 */
interface WarehouseSummary {
    /** Unique identifier */
    id: string;
    /** Internal code */
    code: string;
    /** Display name */
    name: string;
    /** Type of location */
    type: WarehouseType;
    /** City (for quick display) */
    city: string;
    /** Whether pickup is available */
    pickupEnabled: boolean;
    /** Whether delivery is available */
    deliveryEnabled: boolean;
    /** Whether currently open */
    isOpen: boolean;
    /** Next opening time if closed */
    nextOpenAt?: string;
    /** Distance from user (if location available) */
    distanceKm?: number;
}
/**
 * Input for creating a warehouse
 */
interface CreateWarehouseInput {
    code: string;
    name: string;
    type: WarehouseType;
    address: WarehouseAddress;
    contact?: WarehouseContact;
    openingHours: OpeningHours;
    deliveryOptions?: DeliveryOption[];
    capabilities?: Partial<WarehouseCapabilities>;
    allowedCompanyIds?: string[];
    isDefault?: boolean;
    sortOrder?: number;
}
/**
 * Input for updating a warehouse
 */
interface UpdateWarehouseInput {
    name?: string;
    status?: WarehouseStatus;
    address?: Partial<WarehouseAddress>;
    contact?: WarehouseContact;
    openingHours?: OpeningHours;
    deliveryOptions?: DeliveryOption[];
    capabilities?: Partial<WarehouseCapabilities>;
    allowedCompanyIds?: string[];
    isDefault?: boolean;
    sortOrder?: number;
}
/**
 * Filters for warehouse search
 */
interface WarehouseFilters {
    /** Search by name or code */
    search?: string;
    /** Filter by type */
    types?: WarehouseType[];
    /** Filter by status */
    statuses?: WarehouseStatus[];
    /** Filter by pickup availability */
    pickupEnabled?: boolean;
    /** Filter by delivery availability */
    deliveryEnabled?: boolean;
    /** Filter by city */
    city?: string;
    /** Filter by country */
    countryCode?: string;
    /** Filter by proximity (requires lat/lng) */
    nearLocation?: {
        latitude: number;
        longitude: number;
        radiusKm: number;
    };
    /** Only show currently open warehouses */
    isOpenNow?: boolean;
}

/**
 * Pricing Types
 *
 * Defines types for B2B pricing, price lists, volume discounts, and personalized pricing.
 * Supports multi-tier pricing, customer-specific rates, and promotional pricing.
 *
 * @packageDocumentation
 */
/**
 * Type of price list
 */
type PriceListType = 'standard' | 'contract' | 'promotional' | 'tier' | 'seasonal';
/**
 * Status of a price list
 */
type PriceListStatus = 'active' | 'inactive' | 'scheduled' | 'expired';
/**
 * Currency code (ISO 4217)
 */
type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD';
/**
 * Volume discount tier
 */
interface VolumeDiscount {
    /** Minimum quantity to activate this tier */
    minQuantity: number;
    /** Maximum quantity for this tier (optional) */
    maxQuantity?: number;
    /** Discount percentage (0-100) */
    discountPercent?: number;
    /** Fixed unit price (alternative to percentage) */
    fixedUnitPrice?: number;
    /** Label for display (e.g., "Lot de 10") */
    label?: string;
}
/**
 * Volume discount configuration for a product
 */
interface VolumeDiscountConfig {
    /** Product ID */
    productId: string;
    /** Volume discount tiers */
    tiers: VolumeDiscount[];
    /** Whether tiers are cumulative */
    isCumulative: boolean;
    /** Minimum order quantity */
    minOrderQuantity: number;
    /** Order quantity step (e.g., multiples of 5) */
    quantityStep: number;
}
/**
 * Unit of measure for pricing
 */
type UnitOfMeasure = 'unit' | 'pack' | 'box' | 'case' | 'pallet' | 'kg' | 'g' | 'm' | 'm2' | 'm3' | 'l' | 'ml';
/**
 * Unit of measure configuration
 */
interface UnitConfig {
    /** Primary unit */
    baseUnit: UnitOfMeasure;
    /** Conversion factor from base unit */
    conversionFactor: number;
    /** Number of items per unit (e.g., 10 per pack) */
    quantityPerUnit: number;
    /** Display label */
    displayLabel: string;
    /** Short label */
    shortLabel: string;
}
/**
 * Tax rate configuration
 */
interface TaxRate {
    /** Tax rate percentage */
    rate: number;
    /** Tax type/name */
    name: string;
    /** Whether price includes tax */
    isIncluded: boolean;
}
/**
 * Base product price
 */
interface BasePrice {
    /** Unit price excluding tax */
    priceHT: number;
    /** Unit price including tax */
    priceTTC: number;
    /** Currency */
    currency: CurrencyCode;
    /** Tax rate */
    taxRate: TaxRate;
    /** Unit of measure */
    unit: UnitOfMeasure;
    /** Unit configuration */
    unitConfig?: UnitConfig;
}
/**
 * Product pricing with all variations
 */
interface ProductPricing {
    /** Product ID */
    productId: string;
    /** Product SKU */
    sku: string;
    /** Variant ID (if applicable) */
    variantId?: string;
    /** Price list ID */
    priceListId: string;
    /** Base price */
    basePrice: BasePrice;
    /** Volume discounts */
    volumeDiscounts?: VolumeDiscount[];
    /** Pack size (if sold in packs) */
    packSize?: number;
    /** Pack price (if different from unit price * packSize) */
    packPrice?: number;
    /** Minimum order quantity */
    minOrderQuantity: number;
    /** Quantity step (multiples) */
    quantityStep: number;
    /** Price valid from */
    validFrom?: string;
    /** Price valid until */
    validUntil?: string;
    /** Last price update */
    updatedAt: string;
}
/**
 * Price list entity
 */
interface PriceList {
    /** Unique identifier */
    id: string;
    /** Internal code */
    code: string;
    /** Display name */
    name: string;
    /** Description */
    description?: string;
    /** Type of price list */
    type: PriceListType;
    /** Status */
    status: PriceListStatus;
    /** Currency */
    currency: CurrencyCode;
    /** Priority (higher = more important) */
    priority: number;
    /** Whether this is the default price list */
    isDefault: boolean;
    /** Valid from date */
    validFrom?: string;
    /** Valid until date */
    validUntil?: string;
    /** Assigned company IDs */
    companyIds?: string[];
    /** Assigned company tier */
    companyTier?: string;
    /** Discount percentage from base price */
    globalDiscount?: number;
    /** Markup percentage from base price */
    globalMarkup?: number;
    /** Rounding rule */
    roundingRule?: PriceRoundingRule;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}
/**
 * Price rounding rule
 */
interface PriceRoundingRule {
    /** Round to nearest value (e.g., 0.05 for 5 cents) */
    roundTo: number;
    /** Rounding direction */
    direction: 'up' | 'down' | 'nearest';
}
/**
 * Price list summary for lists
 */
interface PriceListSummary {
    id: string;
    code: string;
    name: string;
    type: PriceListType;
    status: PriceListStatus;
    currency: CurrencyCode;
    companiesCount: number;
    productsCount: number;
}
/**
 * Customer-specific price override
 */
interface CustomerPriceOverride {
    /** Unique identifier */
    id: string;
    /** Company ID */
    companyId: string;
    /** Product ID */
    productId: string;
    /** SKU */
    sku: string;
    /** Negotiated unit price (HT) */
    negotiatedPriceHT: number;
    /** Original price (HT) for reference */
    originalPriceHT: number;
    /** Discount percentage from original */
    discountPercent: number;
    /** Contract reference */
    contractRef?: string;
    /** Valid from */
    validFrom?: string;
    /** Valid until */
    validUntil?: string;
    /** Notes */
    notes?: string;
    /** Created by employee ID */
    createdBy: string;
    /** Creation timestamp */
    createdAt: string;
}
/**
 * Fully calculated price for display
 */
interface CalculatedPrice {
    /** Product ID */
    productId: string;
    /** Variant ID */
    variantId?: string;
    /** Unit price excluding tax */
    unitPriceHT: number;
    /** Unit price including tax */
    unitPriceTTC: number;
    /** Currency */
    currency: CurrencyCode;
    /** Tax rate applied */
    taxRate: number;
    /** Original price before discounts */
    originalPriceHT?: number;
    /** Discount percentage applied */
    discountPercent?: number;
    /** Volume discount applicable */
    volumeDiscountApplied?: VolumeDiscount;
    /** Price source (which price list/override) */
    priceSource: {
        type: 'price_list' | 'customer_override' | 'contract';
        id: string;
        name: string;
    };
    /** Whether price is negotiated/special */
    isNegotiated: boolean;
    /** Whether price is promotional */
    isPromotional: boolean;
    /** Promotion end date */
    promotionEndsAt?: string;
    /** Unit of measure */
    unit: UnitOfMeasure;
    /** Unit label */
    unitLabel: string;
    /** Pack configuration (if applicable) */
    pack?: {
        size: number;
        priceHT: number;
        priceTTC: number;
        savingsPercent: number;
    };
}
/**
 * Input for creating a price list
 */
interface CreatePriceListInput {
    code: string;
    name: string;
    description?: string;
    type: PriceListType;
    currency: CurrencyCode;
    priority?: number;
    isDefault?: boolean;
    validFrom?: string;
    validUntil?: string;
    companyIds?: string[];
    companyTier?: string;
    globalDiscount?: number;
    globalMarkup?: number;
    roundingRule?: PriceRoundingRule;
}
/**
 * Input for updating a price list
 */
interface UpdatePriceListInput {
    name?: string;
    description?: string;
    status?: PriceListStatus;
    priority?: number;
    isDefault?: boolean;
    validFrom?: string;
    validUntil?: string;
    companyIds?: string[];
    companyTier?: string;
    globalDiscount?: number;
    globalMarkup?: number;
    roundingRule?: PriceRoundingRule;
}
/**
 * Input for setting product price in a price list
 */
interface SetProductPriceInput {
    productId: string;
    variantId?: string;
    priceHT: number;
    taxRate?: number;
    volumeDiscounts?: VolumeDiscount[];
    packSize?: number;
    packPrice?: number;
    minOrderQuantity?: number;
    quantityStep?: number;
    validFrom?: string;
    validUntil?: string;
}
/**
 * Input for creating customer price override
 */
interface CreateCustomerPriceInput {
    companyId: string;
    productId: string;
    negotiatedPriceHT: number;
    contractRef?: string;
    validFrom?: string;
    validUntil?: string;
    notes?: string;
}
/**
 * Filters for price list search
 */
interface PriceListFilters {
    /** Search by name or code */
    search?: string;
    /** Filter by type */
    types?: PriceListType[];
    /** Filter by status */
    statuses?: PriceListStatus[];
    /** Filter by currency */
    currency?: CurrencyCode;
    /** Filter by company ID */
    companyId?: string;
    /** Only show active/valid price lists */
    activeOnly?: boolean;
}
/**
 * Request for price calculation
 */
interface PriceCalculationRequest {
    /** Product ID */
    productId: string;
    /** Variant ID */
    variantId?: string;
    /** Quantity for volume discount calculation */
    quantity?: number;
    /** Company ID for customer-specific pricing */
    companyId?: string;
    /** Warehouse ID for location-specific pricing */
    warehouseId?: string;
    /** Currency override */
    currency?: CurrencyCode;
}

/**
 * Stock Types
 *
 * Defines types for multi-warehouse stock management in B2B e-commerce.
 * Supports real-time availability, stock reservations, and backorder handling.
 *
 * @packageDocumentation
 */
/**
 * Stock availability status
 */
type StockStatus$1 = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'discontinued' | 'preorder';
/**
 * Stock reservation status
 */
type ReservationStatus = 'pending' | 'confirmed' | 'released' | 'fulfilled';
/**
 * Stock information for a specific warehouse
 */
interface WarehouseStock {
    /** Warehouse ID */
    warehouseId: string;
    /** Warehouse name (for display) */
    warehouseName: string;
    /** Warehouse code */
    warehouseCode: string;
    /** Available quantity */
    availableQuantity: number;
    /** Reserved quantity (pending orders) */
    reservedQuantity: number;
    /** Total physical quantity */
    physicalQuantity: number;
    /** Stock status */
    status: StockStatus$1;
    /** Low stock threshold */
    lowStockThreshold: number;
    /** Expected restock date */
    nextRestockDate?: string;
    /** Expected restock quantity */
    nextRestockQuantity?: number;
    /** Whether pickup is available at this warehouse */
    pickupAvailable: boolean;
    /** Pickup delay (e.g., "2h", "24h", "48h") */
    pickupDelay?: string;
    /** Pickup ready time (ISO 8601) */
    pickupReadyAt?: string;
    /** Whether delivery is available from this warehouse */
    deliveryAvailable: boolean;
    /** Estimated delivery delay (e.g., "24h", "2-3 jours") */
    deliveryDelay?: string;
    /** Last stock update timestamp */
    updatedAt: string;
}
/**
 * Complete stock information for a product across all warehouses
 */
interface ProductStock {
    /** Product ID */
    productId: string;
    /** Product SKU */
    sku: string;
    /** Variant ID (if applicable) */
    variantId?: string;
    /** Global stock status (best available) */
    globalStatus: StockStatus$1;
    /** Total available quantity across all warehouses */
    totalAvailable: number;
    /** Stock by warehouse */
    warehouseStock: WarehouseStock[];
    /** Whether the product is available anywhere */
    isAvailable: boolean;
    /** Best warehouse for pickup (closest with stock) */
    bestPickupWarehouseId?: string;
    /** Best warehouse for delivery (fastest) */
    bestDeliveryWarehouseId?: string;
    /** Last global update timestamp */
    updatedAt: string;
}
/**
 * Stock reservation for cart/order
 */
interface StockReservation {
    /** Unique reservation ID */
    id: string;
    /** Product ID */
    productId: string;
    /** Variant ID */
    variantId?: string;
    /** SKU */
    sku: string;
    /** Warehouse ID where stock is reserved */
    warehouseId: string;
    /** Reserved quantity */
    quantity: number;
    /** Reservation status */
    status: ReservationStatus;
    /** Cart ID (if from cart) */
    cartId?: string;
    /** Order ID (if from order) */
    orderId?: string;
    /** Company ID */
    companyId: string;
    /** Employee ID who created reservation */
    employeeId: string;
    /** Reservation expiration time */
    expiresAt: string;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}
/**
 * Reservation summary for a cart/order
 */
interface ReservationSummary {
    /** Cart or Order ID */
    referenceId: string;
    /** Reference type */
    referenceType: 'cart' | 'order';
    /** Total items reserved */
    totalItems: number;
    /** Total quantity reserved */
    totalQuantity: number;
    /** Reservations by warehouse */
    reservationsByWarehouse: {
        warehouseId: string;
        warehouseName: string;
        itemCount: number;
        totalQuantity: number;
    }[];
    /** Items that couldn't be reserved */
    unavailableItems: {
        productId: string;
        sku: string;
        requestedQuantity: number;
        availableQuantity: number;
        reason: string;
    }[];
    /** Reservation expiration */
    expiresAt: string;
    /** Creation timestamp */
    createdAt: string;
}
/**
 * Type of stock movement
 */
type StockMovementType = 'receipt' | 'sale' | 'transfer' | 'adjustment' | 'return' | 'damage' | 'reservation' | 'release';
/**
 * Stock movement record
 */
interface StockMovement {
    /** Unique movement ID */
    id: string;
    /** Product ID */
    productId: string;
    /** SKU */
    sku: string;
    /** Warehouse ID */
    warehouseId: string;
    /** Movement type */
    type: StockMovementType;
    /** Quantity (positive or negative) */
    quantity: number;
    /** Stock before movement */
    previousQuantity: number;
    /** Stock after movement */
    newQuantity: number;
    /** Reference (order ID, transfer ID, etc.) */
    referenceId?: string;
    /** Reference type */
    referenceType?: string;
    /** Reason/notes */
    reason?: string;
    /** User who made the movement */
    createdBy: string;
    /** Creation timestamp */
    createdAt: string;
}
/**
 * Type of stock alert
 */
type StockAlertType = 'low_stock' | 'out_of_stock' | 'restock_due' | 'overstock' | 'expiring_soon' | 'reservation_expiring';
/**
 * Stock alert for monitoring
 */
interface StockAlert {
    /** Alert ID */
    id: string;
    /** Alert type */
    type: StockAlertType;
    /** Severity level */
    severity: 'low' | 'medium' | 'high' | 'critical';
    /** Product ID */
    productId: string;
    /** SKU */
    sku: string;
    /** Product name (for display) */
    productName: string;
    /** Warehouse ID */
    warehouseId: string;
    /** Warehouse name */
    warehouseName: string;
    /** Alert message */
    message: string;
    /** Current quantity */
    currentQuantity: number;
    /** Threshold that triggered alert */
    threshold?: number;
    /** Whether alert has been acknowledged */
    acknowledged: boolean;
    /** User who acknowledged */
    acknowledgedBy?: string;
    /** Acknowledgement timestamp */
    acknowledgedAt?: string;
    /** Creation timestamp */
    createdAt: string;
}
/**
 * Request to check product availability
 */
interface AvailabilityCheckRequest {
    /** Product ID */
    productId: string;
    /** Variant ID */
    variantId?: string;
    /** Requested quantity */
    quantity: number;
    /** Preferred warehouse ID */
    preferredWarehouseId?: string;
    /** Company ID for personalized availability */
    companyId?: string;
    /** Whether to include alternative warehouses */
    includeAlternatives?: boolean;
}
/**
 * Availability check result
 */
interface AvailabilityResult {
    /** Product ID */
    productId: string;
    /** Variant ID */
    variantId?: string;
    /** Requested quantity */
    requestedQuantity: number;
    /** Whether fully available */
    isAvailable: boolean;
    /** Available quantity */
    availableQuantity: number;
    /** Primary fulfillment option */
    primaryOption?: FulfillmentOption;
    /** Alternative fulfillment options */
    alternativeOptions: FulfillmentOption[];
    /** Partial availability options */
    partialOptions?: PartialFulfillmentOption[];
    /** Expected availability date if not in stock */
    expectedAvailableDate?: string;
    /** Message to display */
    message: string;
}
/**
 * Fulfillment option from a warehouse
 */
interface FulfillmentOption {
    /** Warehouse ID */
    warehouseId: string;
    /** Warehouse name */
    warehouseName: string;
    /** Available quantity */
    availableQuantity: number;
    /** Fulfillment type */
    type: 'pickup' | 'delivery';
    /** Estimated ready/delivery time */
    estimatedTime: string;
    /** Estimated time in hours (for sorting) */
    estimatedHours: number;
    /** Additional cost (if any) */
    additionalCost?: number;
    /** Whether this is the recommended option */
    isRecommended: boolean;
}
/**
 * Partial fulfillment option (split across warehouses)
 */
interface PartialFulfillmentOption {
    /** Fulfillment parts */
    parts: {
        warehouseId: string;
        warehouseName: string;
        quantity: number;
        type: 'pickup' | 'delivery';
        estimatedTime: string;
    }[];
    /** Total quantity fulfilled */
    totalQuantity: number;
    /** Whether this completes the order */
    completesOrder: boolean;
}
/**
 * Input for creating a stock reservation
 */
interface CreateReservationInput {
    productId: string;
    variantId?: string;
    warehouseId: string;
    quantity: number;
    cartId?: string;
    orderId?: string;
    /** Duration in minutes */
    durationMinutes?: number;
}
/**
 * Input for recording stock movement
 */
interface CreateStockMovementInput {
    productId: string;
    warehouseId: string;
    type: StockMovementType;
    quantity: number;
    referenceId?: string;
    referenceType?: string;
    reason?: string;
}
/**
 * Input for stock adjustment
 */
interface StockAdjustmentInput {
    productId: string;
    warehouseId: string;
    newQuantity: number;
    reason: string;
}
/**
 * Input for stock transfer between warehouses
 */
interface StockTransferInput {
    productId: string;
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    quantity: number;
    reason?: string;
}
/**
 * Filters for stock queries
 */
interface StockFilters {
    /** Filter by product IDs */
    productIds?: string[];
    /** Filter by SKUs */
    skus?: string[];
    /** Filter by warehouse IDs */
    warehouseIds?: string[];
    /** Filter by status */
    statuses?: StockStatus$1[];
    /** Filter products with low stock */
    lowStockOnly?: boolean;
    /** Filter products out of stock */
    outOfStockOnly?: boolean;
    /** Filter products with pending reservations */
    hasReservations?: boolean;
    /** Filter by category ID */
    categoryId?: string;
    /** Filter by brand */
    brand?: string;
}
/**
 * Filters for stock alerts
 */
interface StockAlertFilters {
    /** Filter by alert types */
    types?: StockAlertType[];
    /** Filter by severity */
    severities?: ('low' | 'medium' | 'high' | 'critical')[];
    /** Filter by warehouse IDs */
    warehouseIds?: string[];
    /** Show only unacknowledged alerts */
    unacknowledgedOnly?: boolean;
    /** Date range start */
    dateFrom?: string;
    /** Date range end */
    dateTo?: string;
}
/**
 * Filters for stock movement history
 */
interface StockMovementFilters {
    /** Filter by product ID */
    productId?: string;
    /** Filter by warehouse ID */
    warehouseId?: string;
    /** Filter by movement types */
    types?: StockMovementType[];
    /** Date range start */
    dateFrom?: string;
    /** Date range end */
    dateTo?: string;
    /** Filter by user */
    createdBy?: string;
}

interface SageStatistiqueArticle {
    Intitule: string;
    IdStatistique: number;
    Valeur: string;
}
interface SageInfoLibre {
    Name: string;
    Type: number;
    Size: number;
    EstCalculee: boolean;
    Value: string | number | null;
}
interface SageArticle {
    __type: 'ArticleStandard:http://www.proconsult.lu/WebServices100' | 'ArticleGamme:http://www.proconsult.lu/WebServices100';
    Reference: string;
    Intitule: string;
    CodeFamille: string;
    TypeArticle: number;
    PrixAchat: number;
    PrixUnitaireNet: number;
    PrixVente: number;
    Coefficient: number;
    EstEnPrixTTTC: boolean;
    PoidsNet: number;
    PoidsBrut: number;
    UnitePoids: number;
    Garantie: number;
    Pays: string;
    IdUniteVente: number;
    TypeSuiviStock: number;
    Fictif: boolean;
    EstEnSommeil: boolean;
    Publie: boolean;
    InterdireCommande: boolean;
    ExclureReapprovisionnement: boolean;
    Langue1?: string;
    Langue2?: string;
    CodeBarres?: string;
    Photo?: string;
    IdCatalogue1: number;
    IdCatalogue2: number;
    IdCatalogue3: number;
    IdCatalogue4: number;
    Statistique1: string;
    Statistique2: string;
    Statistique3: string;
    Statistique4: string;
    Statistique5: string;
    StatistiqueArticles?: SageStatistiqueArticle[];
    InfosLibres?: SageInfoLibre[];
    DateCreation: string;
    DateModification: string;
    Createur: string;
    UtilisateurCreateur: string;
}
interface SageFamille {
    CodeFamille: string;
    Intitule: string;
    TypeFamille: number;
    Createur: string;
    DateModification: string;
    DateCreation: string;
    UtilisateurCreateur: string;
}
interface Product {
    id: string;
    reference: string;
    name: string;
    nameEn?: string;
    slug: string;
    ean?: string;
    description: string;
    shortDescription: string;
    price: number;
    compareAtPrice?: number;
    isPriceTTC: boolean;
    images: string[];
    categoryId: string;
    category?: Category;
    collection?: string;
    style?: string;
    materials: string[];
    weight?: number;
    weightUnit: 'g' | 'kg';
    brand?: string;
    origin?: string;
    warranty?: number;
    stock: number;
    isAvailable: boolean;
    featured: boolean;
    isNew: boolean;
    createdAt: string;
}
interface Category {
    id: string;
    code?: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    productCount: number;
    type?: number;
}
interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: 'user' | 'admin';
}
interface MockUser extends User {
    password: string;
}
interface CartItem {
    product: Product;
    quantity: number;
}
interface Cart {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}
interface ProductFilters {
    category?: string;
    priceRange?: [number, number];
    materials?: string[];
    sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
    search?: string;
}
interface NavItem {
    label: string;
    href: string;
    children?: NavItem[];
}
interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}
interface LoginFormData {
    email: string;
    password: string;
}
interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}
interface ShippingAddress {
    firstName: string;
    lastName: string;
    address: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email?: string;
}
interface BillingAddress extends ShippingAddress {
    companyName?: string;
    vatNumber?: string;
}
interface PaymentInfo {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    lastFourDigits?: string;
    cardBrand?: CardBrand;
    paidAt?: string;
}
type PaymentMethod = 'card' | 'paypal' | 'bank_transfer' | 'apple_pay' | 'google_pay';
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'cb';
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
interface OrderItem {
    productId: string;
    productReference?: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
interface OrderTotals {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
}
interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: OrderItem[];
    totals: OrderTotals;
    shippingAddress: ShippingAddress;
    billingAddress?: BillingAddress;
    paymentInfo: PaymentInfo;
    status: OrderStatus;
    notes?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt: string;
    shippedAt?: string;
    deliveredAt?: string;
}
type CheckoutStep = 'cart' | 'shipping' | 'billing' | 'payment' | 'review' | 'confirmation';
interface CheckoutState {
    currentStep: CheckoutStep;
    completedSteps: CheckoutStep[];
    shippingAddress: ShippingAddress | null;
    billingAddress: BillingAddress | null;
    sameAsShipping: boolean;
    paymentMethod: PaymentMethod | null;
    orderNotes: string;
    isProcessing: boolean;
    error: string | null;
}
interface CartItemWithDetails {
    productId: string;
    productReference?: string;
    productName: string;
    productSlug: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    maxQuantity: number;
    totalPrice: number;
}
interface CartState {
    items: CartItemWithDetails[];
    itemCount: number;
    subtotal: number;
    lastUpdated: string;
}
interface StockInfo {
    productId: string;
    available: number;
    reserved: number;
    showExactStock: boolean;
}
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
interface CreateOrderRequest {
    items: CartItemWithDetails[];
    shippingAddress: ShippingAddress;
    billingAddress?: BillingAddress;
    paymentMethod: PaymentMethod;
    notes?: string;
}
interface CreateOrderResponse {
    success: boolean;
    order?: Order;
    error?: string;
    paymentIntent?: string;
}
interface OrderListResponse {
    orders: Order[];
    total: number;
    page: number;
    pageSize: number;
}
interface ExtendedUser extends User {
    addresses?: ShippingAddress[];
    defaultShippingAddressId?: string;
    defaultBillingAddressId?: string;
}
/**
 * A single item in the user's wishlist.
 * Stores the full product for offline access and display.
 */
interface WishlistItem {
    /** The product saved to wishlist */
    product: Product;
    /** ISO timestamp when item was added */
    addedAt: string;
}
/**
 * The complete wishlist state.
 */
interface Wishlist {
    /** Array of wishlist items */
    items: WishlistItem[];
    /** Total count of items */
    totalItems: number;
}

export type { ApiResponse, ApprovalAction, ApprovalActionInput, ApprovalAttachment, ApprovalDelegation, ApprovalEntityType, ApprovalFilters, ApprovalLevel, ApprovalRequest, ApprovalStatus, ApprovalStep, ApprovalSummary, ApprovalTrigger, ApprovalTriggerType, ApprovalWorkflow, ApproverDecision, AvailabilityCheckRequest, AvailabilityResult, Order$1 as B2BOrder, OrderItem$1 as B2BOrderItem, OrderStatus$1 as B2BOrderStatus, OrderTotals$1 as B2BOrderTotals, BasePrice, BillingAddress, BulkOrderCsvInput, BulkOrderCsvParseResult, BulkOrderErrorCode, BulkOrderItem, BulkOrderSummary, BulkOrderValidationError, BulkOrderValidationResult, BulkOrderValidationWarning, BulkOrderWarningCode, CalculatedPrice, CancelOrderInput, CardBrand, Cart, CartItem, CartItemWithDetails, CartState, Category, CategoryRestriction, CategorySpending, CheckoutState, CheckoutStep, Company, CompanyAddress, CompanyAddressType, CompanySettings, CompanyStatus, CompanySummary, CompanyTier, CompanyTierConfig, CreateApprovalWorkflowInput, CreateCompanyInput, CreateCustomerPriceInput, CreateOrderInput, CreateOrderRequest, CreateOrderResponse, CreatePriceListInput, CreateQuoteInput, CreateReservationInput, CreateSpendingLimitInput, CreateSpendingRuleInput, CreateStockMovementInput, CreateWarehouseInput, CurrencyCode, CustomerPriceOverride, DailySpending, DayOfWeek, DaySchedule, DeliveryOption, DeliveryOptionType, Department, Employee, EmployeeActivity, EmployeeActivityType, EmployeeInvitation, EmployeePermission, EmployeeRole, EmployeeSpending, EmployeeStatus, EmployeeSummary, ExtendedUser, FulfillmentOption, InviteEmployeeInput, LimitExceededAlert, LoginFormData, MockUser, MonthlyTrend, NavItem, NearLimitAlert, OpeningHours, Order, OrderAttachment, OrderFilters, OrderHistoryEntry, OrderHistoryEventType, OrderItem, OrderItemInput, OrderListResponse, OrderPayment, OrderShipping, OrderShippingAddress, OrderSortField, OrderSortOptions, OrderStatistics, OrderStatus, OrderSummary, OrderTotals, PartialFulfillmentOption, PaymentInfo, PaymentMethod, PaymentMethodType, PaymentStatus, PaymentTermType, PaymentTerms, PermissionGroup, PriceCalculationRequest, PriceList, PriceListFilters, PriceListStatus, PriceListSummary, PriceListType, PriceRoundingRule, Product, ProductCatalogEntry, ProductFilters, ProductPricing, ProductRestriction, ProductStock, Quote, QuoteAttachment, QuoteFilters, QuoteHistoryEntry, QuoteHistoryEventType, QuoteItem, QuoteItemInput, QuoteMessage, QuoteResponseInput, QuoteStatus, QuoteSummary, QuoteTerms, QuoteTotals, RegisterFormData, ReportData, ReportPeriod, ReportSummary, ReportType, ReservationStatus, ReservationSummary, ReturnOrderInput, RoleConfig, SageArticle, SageFamille, SageInfoLibre, SageStatistiqueArticle, SetProductPriceInput, ShippingAddress, ShippingAddressInput, SpecialSchedule, SpendingAdjustmentInput, SpendingByCategory, SpendingByDepartment, SpendingByEmployee, SpendingFilters, SpendingLimit, SpendingLimitEntityType, SpendingPeriod, SpendingReport, SpendingRule, SpendingRuleAction, SpendingTransaction, StockAdjustmentInput, StockAlert, StockAlertFilters, StockAlertType, StockFilters, StockInfo, StockMovement, StockMovementFilters, StockMovementType, StockReservation, StockStatus, StockTransferInput, TaxRate, TimeSlot, TopProduct, UnitConfig, UnitOfMeasure, UpdateApprovalWorkflowInput, UpdateCompanyInput, UpdateEmployeeInput, UpdateOrderInput, UpdatePriceListInput, UpdateQuoteInput, UpdateSpendingLimitInput, UpdateWarehouseInput, User, VolumeDiscount, VolumeDiscountConfig, Warehouse, WarehouseAddress, WarehouseCapabilities, WarehouseContact, WarehouseFilters, WarehouseStatus, WarehouseStock, WarehouseSummary, WarehouseType, Wishlist, WishlistItem };
