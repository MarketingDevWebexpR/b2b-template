import { z } from 'zod';

/**
 * Employee role schema
 */
declare const employeeRoleSchema: z.ZodEnum<["admin", "manager", "purchaser", "viewer", "approver"]>;
type EmployeeRole = z.infer<typeof employeeRoleSchema>;
/**
 * Employee status schema
 */
declare const employeeStatusSchema: z.ZodEnum<["active", "inactive", "pending", "suspended"]>;
type EmployeeStatus = z.infer<typeof employeeStatusSchema>;
/**
 * Base employee information schema
 */
declare const employeeBaseSchema: z.ZodObject<{
    /** First name */
    firstName: z.ZodString;
    /** Last name */
    lastName: z.ZodString;
    /** Email address */
    email: z.ZodString;
    /** Phone number */
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    /** Job title */
    jobTitle: z.ZodOptional<z.ZodString>;
    /** Department */
    department: z.ZodOptional<z.ZodString>;
    /** Employee number/ID */
    employeeNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
    employeeNumber?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
    employeeNumber?: string | undefined;
}>;
/**
 * Employee permissions schema
 */
declare const employeePermissionsSchema: z.ZodObject<{
    /** Can create orders */
    canCreateOrders: z.ZodDefault<z.ZodBoolean>;
    /** Can approve orders */
    canApproveOrders: z.ZodDefault<z.ZodBoolean>;
    /** Maximum order amount they can approve (without further approval) */
    maxApprovalAmount: z.ZodOptional<z.ZodNumber>;
    /** Can manage employees */
    canManageEmployees: z.ZodDefault<z.ZodBoolean>;
    /** Can view all orders */
    canViewAllOrders: z.ZodDefault<z.ZodBoolean>;
    /** Can manage company settings */
    canManageSettings: z.ZodDefault<z.ZodBoolean>;
    /** Can export data */
    canExportData: z.ZodDefault<z.ZodBoolean>;
    /** Can create quotes */
    canCreateQuotes: z.ZodDefault<z.ZodBoolean>;
    /** Allowed product categories (empty = all) */
    allowedCategories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Allowed cost centers */
    allowedCostCenters: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    canCreateOrders: boolean;
    canApproveOrders: boolean;
    canManageEmployees: boolean;
    canViewAllOrders: boolean;
    canManageSettings: boolean;
    canExportData: boolean;
    canCreateQuotes: boolean;
    allowedCategories: string[];
    allowedCostCenters: string[];
    maxApprovalAmount?: number | undefined;
}, {
    canCreateOrders?: boolean | undefined;
    canApproveOrders?: boolean | undefined;
    maxApprovalAmount?: number | undefined;
    canManageEmployees?: boolean | undefined;
    canViewAllOrders?: boolean | undefined;
    canManageSettings?: boolean | undefined;
    canExportData?: boolean | undefined;
    canCreateQuotes?: boolean | undefined;
    allowedCategories?: string[] | undefined;
    allowedCostCenters?: string[] | undefined;
}>;
type EmployeePermissions = z.infer<typeof employeePermissionsSchema>;
/**
 * Employee spending limit schema
 */
declare const employeeSpendingLimitSchema: z.ZodObject<{
    /** Monthly spending limit */
    monthlyLimit: z.ZodOptional<z.ZodNumber>;
    /** Single order limit */
    orderLimit: z.ZodOptional<z.ZodNumber>;
    /** Whether to require approval above limit */
    requireApprovalAboveLimit: z.ZodDefault<z.ZodBoolean>;
    /** Reporting manager ID for approvals */
    managerId: z.ZodOptional<z.ZodString>;
    /** Custom approval chain */
    approvalChain: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    requireApprovalAboveLimit: boolean;
    approvalChain: string[];
    monthlyLimit?: number | undefined;
    orderLimit?: number | undefined;
    managerId?: string | undefined;
}, {
    monthlyLimit?: number | undefined;
    orderLimit?: number | undefined;
    requireApprovalAboveLimit?: boolean | undefined;
    managerId?: string | undefined;
    approvalChain?: string[] | undefined;
}>;
type EmployeeSpendingLimit = z.infer<typeof employeeSpendingLimitSchema>;
/**
 * Complete employee create schema
 */
declare const employeeCreateSchema: z.ZodObject<{
    /** First name */
    firstName: z.ZodString;
    /** Last name */
    lastName: z.ZodString;
    /** Email address */
    email: z.ZodString;
    /** Phone number */
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    /** Job title */
    jobTitle: z.ZodOptional<z.ZodString>;
    /** Department */
    department: z.ZodOptional<z.ZodString>;
    /** Employee number/ID */
    employeeNumber: z.ZodOptional<z.ZodString>;
} & {
    /** Employee role */
    role: z.ZodEnum<["admin", "manager", "purchaser", "viewer", "approver"]>;
    /** Permissions */
    permissions: z.ZodOptional<z.ZodObject<{
        /** Can create orders */
        canCreateOrders: z.ZodDefault<z.ZodBoolean>;
        /** Can approve orders */
        canApproveOrders: z.ZodDefault<z.ZodBoolean>;
        /** Maximum order amount they can approve (without further approval) */
        maxApprovalAmount: z.ZodOptional<z.ZodNumber>;
        /** Can manage employees */
        canManageEmployees: z.ZodDefault<z.ZodBoolean>;
        /** Can view all orders */
        canViewAllOrders: z.ZodDefault<z.ZodBoolean>;
        /** Can manage company settings */
        canManageSettings: z.ZodDefault<z.ZodBoolean>;
        /** Can export data */
        canExportData: z.ZodDefault<z.ZodBoolean>;
        /** Can create quotes */
        canCreateQuotes: z.ZodDefault<z.ZodBoolean>;
        /** Allowed product categories (empty = all) */
        allowedCategories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Allowed cost centers */
        allowedCostCenters: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        canCreateOrders: boolean;
        canApproveOrders: boolean;
        canManageEmployees: boolean;
        canViewAllOrders: boolean;
        canManageSettings: boolean;
        canExportData: boolean;
        canCreateQuotes: boolean;
        allowedCategories: string[];
        allowedCostCenters: string[];
        maxApprovalAmount?: number | undefined;
    }, {
        canCreateOrders?: boolean | undefined;
        canApproveOrders?: boolean | undefined;
        maxApprovalAmount?: number | undefined;
        canManageEmployees?: boolean | undefined;
        canViewAllOrders?: boolean | undefined;
        canManageSettings?: boolean | undefined;
        canExportData?: boolean | undefined;
        canCreateQuotes?: boolean | undefined;
        allowedCategories?: string[] | undefined;
        allowedCostCenters?: string[] | undefined;
    }>>;
    /** Spending limits */
    spendingLimits: z.ZodOptional<z.ZodObject<{
        /** Monthly spending limit */
        monthlyLimit: z.ZodOptional<z.ZodNumber>;
        /** Single order limit */
        orderLimit: z.ZodOptional<z.ZodNumber>;
        /** Whether to require approval above limit */
        requireApprovalAboveLimit: z.ZodDefault<z.ZodBoolean>;
        /** Reporting manager ID for approvals */
        managerId: z.ZodOptional<z.ZodString>;
        /** Custom approval chain */
        approvalChain: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        requireApprovalAboveLimit: boolean;
        approvalChain: string[];
        monthlyLimit?: number | undefined;
        orderLimit?: number | undefined;
        managerId?: string | undefined;
    }, {
        monthlyLimit?: number | undefined;
        orderLimit?: number | undefined;
        requireApprovalAboveLimit?: boolean | undefined;
        managerId?: string | undefined;
        approvalChain?: string[] | undefined;
    }>>;
    /** Send welcome email */
    sendWelcomeEmail: z.ZodDefault<z.ZodBoolean>;
    /** Notes */
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "manager" | "purchaser" | "viewer" | "approver";
    sendWelcomeEmail: boolean;
    notes?: string | undefined;
    phone?: string | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
    employeeNumber?: string | undefined;
    permissions?: {
        canCreateOrders: boolean;
        canApproveOrders: boolean;
        canManageEmployees: boolean;
        canViewAllOrders: boolean;
        canManageSettings: boolean;
        canExportData: boolean;
        canCreateQuotes: boolean;
        allowedCategories: string[];
        allowedCostCenters: string[];
        maxApprovalAmount?: number | undefined;
    } | undefined;
    spendingLimits?: {
        requireApprovalAboveLimit: boolean;
        approvalChain: string[];
        monthlyLimit?: number | undefined;
        orderLimit?: number | undefined;
        managerId?: string | undefined;
    } | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "manager" | "purchaser" | "viewer" | "approver";
    notes?: string | undefined;
    phone?: string | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
    employeeNumber?: string | undefined;
    permissions?: {
        canCreateOrders?: boolean | undefined;
        canApproveOrders?: boolean | undefined;
        maxApprovalAmount?: number | undefined;
        canManageEmployees?: boolean | undefined;
        canViewAllOrders?: boolean | undefined;
        canManageSettings?: boolean | undefined;
        canExportData?: boolean | undefined;
        canCreateQuotes?: boolean | undefined;
        allowedCategories?: string[] | undefined;
        allowedCostCenters?: string[] | undefined;
    } | undefined;
    spendingLimits?: {
        monthlyLimit?: number | undefined;
        orderLimit?: number | undefined;
        requireApprovalAboveLimit?: boolean | undefined;
        managerId?: string | undefined;
        approvalChain?: string[] | undefined;
    } | undefined;
    sendWelcomeEmail?: boolean | undefined;
}>;
type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
/**
 * Employee update schema (all fields optional)
 */
declare const employeeUpdateSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    jobTitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    department: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    employeeNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    /** Employee role */
    role: z.ZodOptional<z.ZodEnum<["admin", "manager", "purchaser", "viewer", "approver"]>>;
    /** Employee status */
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending", "suspended"]>>;
    /** Permissions */
    permissions: z.ZodOptional<z.ZodObject<{
        canCreateOrders: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        canApproveOrders: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        maxApprovalAmount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        canManageEmployees: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        canViewAllOrders: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        canManageSettings: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        canExportData: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        canCreateQuotes: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        allowedCategories: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
        allowedCostCenters: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        canCreateOrders?: boolean | undefined;
        canApproveOrders?: boolean | undefined;
        maxApprovalAmount?: number | undefined;
        canManageEmployees?: boolean | undefined;
        canViewAllOrders?: boolean | undefined;
        canManageSettings?: boolean | undefined;
        canExportData?: boolean | undefined;
        canCreateQuotes?: boolean | undefined;
        allowedCategories?: string[] | undefined;
        allowedCostCenters?: string[] | undefined;
    }, {
        canCreateOrders?: boolean | undefined;
        canApproveOrders?: boolean | undefined;
        maxApprovalAmount?: number | undefined;
        canManageEmployees?: boolean | undefined;
        canViewAllOrders?: boolean | undefined;
        canManageSettings?: boolean | undefined;
        canExportData?: boolean | undefined;
        canCreateQuotes?: boolean | undefined;
        allowedCategories?: string[] | undefined;
        allowedCostCenters?: string[] | undefined;
    }>>;
    /** Spending limits */
    spendingLimits: z.ZodOptional<z.ZodObject<{
        monthlyLimit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        orderLimit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        requireApprovalAboveLimit: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        managerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        approvalChain: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        monthlyLimit?: number | undefined;
        orderLimit?: number | undefined;
        requireApprovalAboveLimit?: boolean | undefined;
        managerId?: string | undefined;
        approvalChain?: string[] | undefined;
    }, {
        monthlyLimit?: number | undefined;
        orderLimit?: number | undefined;
        requireApprovalAboveLimit?: boolean | undefined;
        managerId?: string | undefined;
        approvalChain?: string[] | undefined;
    }>>;
    /** Notes */
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "active" | "inactive" | "suspended" | undefined;
    notes?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
    employeeNumber?: string | undefined;
    role?: "admin" | "manager" | "purchaser" | "viewer" | "approver" | undefined;
    permissions?: {
        canCreateOrders?: boolean | undefined;
        canApproveOrders?: boolean | undefined;
        maxApprovalAmount?: number | undefined;
        canManageEmployees?: boolean | undefined;
        canViewAllOrders?: boolean | undefined;
        canManageSettings?: boolean | undefined;
        canExportData?: boolean | undefined;
        canCreateQuotes?: boolean | undefined;
        allowedCategories?: string[] | undefined;
        allowedCostCenters?: string[] | undefined;
    } | undefined;
    spendingLimits?: {
        monthlyLimit?: number | undefined;
        orderLimit?: number | undefined;
        requireApprovalAboveLimit?: boolean | undefined;
        managerId?: string | undefined;
        approvalChain?: string[] | undefined;
    } | undefined;
}, {
    status?: "pending" | "active" | "inactive" | "suspended" | undefined;
    notes?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
    employeeNumber?: string | undefined;
    role?: "admin" | "manager" | "purchaser" | "viewer" | "approver" | undefined;
    permissions?: {
        canCreateOrders?: boolean | undefined;
        canApproveOrders?: boolean | undefined;
        maxApprovalAmount?: number | undefined;
        canManageEmployees?: boolean | undefined;
        canViewAllOrders?: boolean | undefined;
        canManageSettings?: boolean | undefined;
        canExportData?: boolean | undefined;
        canCreateQuotes?: boolean | undefined;
        allowedCategories?: string[] | undefined;
        allowedCostCenters?: string[] | undefined;
    } | undefined;
    spendingLimits?: {
        monthlyLimit?: number | undefined;
        orderLimit?: number | undefined;
        requireApprovalAboveLimit?: boolean | undefined;
        managerId?: string | undefined;
        approvalChain?: string[] | undefined;
    } | undefined;
}>;
type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
/**
 * Bulk employee import schema (for CSV imports)
 */
declare const employeeBulkImportRowSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<["admin", "manager", "purchaser", "viewer", "approver"]>>;
    department: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodOptional<z.ZodString>;
    employeeNumber: z.ZodOptional<z.ZodString>;
    monthlyLimit: z.ZodOptional<z.ZodNumber>;
    orderLimit: z.ZodOptional<z.ZodNumber>;
    managerId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "manager" | "purchaser" | "viewer" | "approver";
    phone?: string | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
    employeeNumber?: string | undefined;
    monthlyLimit?: number | undefined;
    orderLimit?: number | undefined;
    managerId?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
    employeeNumber?: string | undefined;
    monthlyLimit?: number | undefined;
    orderLimit?: number | undefined;
    managerId?: string | undefined;
    role?: "admin" | "manager" | "purchaser" | "viewer" | "approver" | undefined;
}>;
type EmployeeBulkImportRow = z.infer<typeof employeeBulkImportRowSchema>;
/**
 * Employee invite schema
 */
declare const employeeInviteSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<["admin", "manager", "purchaser", "viewer", "approver"]>;
    permissions: z.ZodOptional<z.ZodObject<{
        /** Can create orders */
        canCreateOrders: z.ZodDefault<z.ZodBoolean>;
        /** Can approve orders */
        canApproveOrders: z.ZodDefault<z.ZodBoolean>;
        /** Maximum order amount they can approve (without further approval) */
        maxApprovalAmount: z.ZodOptional<z.ZodNumber>;
        /** Can manage employees */
        canManageEmployees: z.ZodDefault<z.ZodBoolean>;
        /** Can view all orders */
        canViewAllOrders: z.ZodDefault<z.ZodBoolean>;
        /** Can manage company settings */
        canManageSettings: z.ZodDefault<z.ZodBoolean>;
        /** Can export data */
        canExportData: z.ZodDefault<z.ZodBoolean>;
        /** Can create quotes */
        canCreateQuotes: z.ZodDefault<z.ZodBoolean>;
        /** Allowed product categories (empty = all) */
        allowedCategories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Allowed cost centers */
        allowedCostCenters: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        canCreateOrders: boolean;
        canApproveOrders: boolean;
        canManageEmployees: boolean;
        canViewAllOrders: boolean;
        canManageSettings: boolean;
        canExportData: boolean;
        canCreateQuotes: boolean;
        allowedCategories: string[];
        allowedCostCenters: string[];
        maxApprovalAmount?: number | undefined;
    }, {
        canCreateOrders?: boolean | undefined;
        canApproveOrders?: boolean | undefined;
        maxApprovalAmount?: number | undefined;
        canManageEmployees?: boolean | undefined;
        canViewAllOrders?: boolean | undefined;
        canManageSettings?: boolean | undefined;
        canExportData?: boolean | undefined;
        canCreateQuotes?: boolean | undefined;
        allowedCategories?: string[] | undefined;
        allowedCostCenters?: string[] | undefined;
    }>>;
    message: z.ZodOptional<z.ZodString>;
    expiresIn: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "admin" | "manager" | "purchaser" | "viewer" | "approver";
    expiresIn: number;
    message?: string | undefined;
    permissions?: {
        canCreateOrders: boolean;
        canApproveOrders: boolean;
        canManageEmployees: boolean;
        canViewAllOrders: boolean;
        canManageSettings: boolean;
        canExportData: boolean;
        canCreateQuotes: boolean;
        allowedCategories: string[];
        allowedCostCenters: string[];
        maxApprovalAmount?: number | undefined;
    } | undefined;
}, {
    email: string;
    role: "admin" | "manager" | "purchaser" | "viewer" | "approver";
    message?: string | undefined;
    permissions?: {
        canCreateOrders?: boolean | undefined;
        canApproveOrders?: boolean | undefined;
        maxApprovalAmount?: number | undefined;
        canManageEmployees?: boolean | undefined;
        canViewAllOrders?: boolean | undefined;
        canManageSettings?: boolean | undefined;
        canExportData?: boolean | undefined;
        canCreateQuotes?: boolean | undefined;
        allowedCategories?: string[] | undefined;
        allowedCostCenters?: string[] | undefined;
    } | undefined;
    expiresIn?: number | undefined;
}>;
type EmployeeInviteInput = z.infer<typeof employeeInviteSchema>;
/**
 * Employee search/filter schema
 */
declare const employeeFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "manager", "purchaser", "viewer", "approver"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending", "suspended"]>>;
    department: z.ZodOptional<z.ZodString>;
    hasSpendingLimit: z.ZodOptional<z.ZodBoolean>;
    managerId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "active" | "inactive" | "suspended" | undefined;
    department?: string | undefined;
    managerId?: string | undefined;
    role?: "admin" | "manager" | "purchaser" | "viewer" | "approver" | undefined;
    search?: string | undefined;
    hasSpendingLimit?: boolean | undefined;
}, {
    status?: "pending" | "active" | "inactive" | "suspended" | undefined;
    department?: string | undefined;
    managerId?: string | undefined;
    role?: "admin" | "manager" | "purchaser" | "viewer" | "approver" | undefined;
    search?: string | undefined;
    hasSpendingLimit?: boolean | undefined;
}>;
type EmployeeFilter = z.infer<typeof employeeFilterSchema>;

/**
 * Quote status schema
 */
declare const quoteStatusSchema: z.ZodEnum<["draft", "pending_review", "sent", "viewed", "accepted", "rejected", "expired", "cancelled"]>;
type QuoteStatus = z.infer<typeof quoteStatusSchema>;
/**
 * Discount type schema
 */
declare const discountTypeSchema: z.ZodEnum<["percentage", "fixed", "per_unit"]>;
type DiscountType = z.infer<typeof discountTypeSchema>;
/**
 * Tax type schema
 */
declare const taxTypeSchema: z.ZodEnum<["included", "excluded", "exempt"]>;
type TaxType = z.infer<typeof taxTypeSchema>;
/**
 * Address schema
 */
declare const addressSchema: z.ZodObject<{
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string | undefined;
    line2?: string | undefined;
}, {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string | undefined;
    line2?: string | undefined;
}>;
type AddressInput = z.infer<typeof addressSchema>;
/**
 * Quote customer schema
 */
declare const quoteCustomerSchema: z.ZodObject<{
    companyName: z.ZodString;
    contactName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
    }, {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
    }>>;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
    }, {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
    }>>;
    taxId: z.ZodOptional<z.ZodString>;
    paymentTerms: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    contactName: string;
    email: string;
    paymentTerms?: string | undefined;
    phone?: string | undefined;
    billingAddress?: {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
    } | undefined;
    shippingAddress?: {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
    } | undefined;
    taxId?: string | undefined;
}, {
    companyName: string;
    contactName: string;
    email: string;
    paymentTerms?: string | undefined;
    phone?: string | undefined;
    billingAddress?: {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
    } | undefined;
    shippingAddress?: {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
    } | undefined;
    taxId?: string | undefined;
}>;
type QuoteCustomerInput = z.infer<typeof quoteCustomerSchema>;
/**
 * Quote line item discount schema
 */
declare const lineItemDiscountSchema: z.ZodObject<{
    type: z.ZodEnum<["percentage", "fixed", "per_unit"]>;
    value: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "percentage" | "fixed" | "per_unit";
    value: number;
    reason?: string | undefined;
}, {
    type: "percentage" | "fixed" | "per_unit";
    value: number;
    reason?: string | undefined;
}>;
type LineItemDiscountInput = z.infer<typeof lineItemDiscountSchema>;
/**
 * Quote line item schema
 */
declare const quoteLineItemSchema: z.ZodObject<{
    productId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    unit: z.ZodOptional<z.ZodString>;
    unitPrice: z.ZodNumber;
    discount: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["percentage", "fixed", "per_unit"]>;
        value: z.ZodNumber;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        reason?: string | undefined;
    }, {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        reason?: string | undefined;
    }>>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    customOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    leadTime: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    description?: string | undefined;
    sku?: string | undefined;
    unit?: string | undefined;
    discount?: {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        reason?: string | undefined;
    } | undefined;
    taxRate?: number | undefined;
    customOptions?: Record<string, unknown> | undefined;
    leadTime?: number | undefined;
    notes?: string | undefined;
}, {
    name: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    description?: string | undefined;
    sku?: string | undefined;
    unit?: string | undefined;
    discount?: {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        reason?: string | undefined;
    } | undefined;
    taxRate?: number | undefined;
    customOptions?: Record<string, unknown> | undefined;
    leadTime?: number | undefined;
    notes?: string | undefined;
}>;
type QuoteLineItemInput = z.infer<typeof quoteLineItemSchema>;
/**
 * Quote-level discount schema
 */
declare const quoteDiscountSchema: z.ZodObject<{
    type: z.ZodEnum<["percentage", "fixed", "per_unit"]>;
    value: z.ZodNumber;
    code: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    minOrderValue: z.ZodOptional<z.ZodNumber>;
    maxDiscount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "percentage" | "fixed" | "per_unit";
    value: number;
    code?: string | undefined;
    reason?: string | undefined;
    minOrderValue?: number | undefined;
    maxDiscount?: number | undefined;
}, {
    type: "percentage" | "fixed" | "per_unit";
    value: number;
    code?: string | undefined;
    reason?: string | undefined;
    minOrderValue?: number | undefined;
    maxDiscount?: number | undefined;
}>;
type QuoteDiscountInput = z.infer<typeof quoteDiscountSchema>;
/**
 * Quote terms schema
 */
declare const quoteTermsSchema: z.ZodObject<{
    paymentTerms: z.ZodString;
    paymentDueDate: z.ZodOptional<z.ZodDate>;
    deliveryTerms: z.ZodOptional<z.ZodString>;
    deliveryDate: z.ZodOptional<z.ZodDate>;
    validityDays: z.ZodNumber;
    customTerms: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    internalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    paymentTerms: string;
    validityDays: number;
    notes?: string | undefined;
    paymentDueDate?: Date | undefined;
    deliveryTerms?: string | undefined;
    deliveryDate?: Date | undefined;
    customTerms?: string | undefined;
    internalNotes?: string | undefined;
}, {
    paymentTerms: string;
    validityDays: number;
    notes?: string | undefined;
    paymentDueDate?: Date | undefined;
    deliveryTerms?: string | undefined;
    deliveryDate?: Date | undefined;
    customTerms?: string | undefined;
    internalNotes?: string | undefined;
}>;
type QuoteTermsInput = z.infer<typeof quoteTermsSchema>;
/**
 * Quote pricing schema
 */
declare const quotePricingSchema: z.ZodObject<{
    shipping: z.ZodNumber;
    taxType: z.ZodEnum<["included", "excluded", "exempt"]>;
    taxRate: z.ZodNumber;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currency: string;
    taxRate: number;
    taxType: "included" | "excluded" | "exempt";
    shipping: number;
}, {
    currency: string;
    taxRate: number;
    taxType: "included" | "excluded" | "exempt";
    shipping: number;
}>;
type QuotePricingInput = z.infer<typeof quotePricingSchema>;
/**
 * Complete quote create schema
 */
declare const quoteCreateSchema: z.ZodObject<{
    customer: z.ZodObject<{
        companyName: z.ZodString;
        contactName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        billingAddress: z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        }, {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        }>>;
        shippingAddress: z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        }, {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        }>>;
        taxId: z.ZodOptional<z.ZodString>;
        paymentTerms: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        companyName: string;
        contactName: string;
        email: string;
        paymentTerms?: string | undefined;
        phone?: string | undefined;
        billingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        shippingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        taxId?: string | undefined;
    }, {
        companyName: string;
        contactName: string;
        email: string;
        paymentTerms?: string | undefined;
        phone?: string | undefined;
        billingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        shippingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        taxId?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodOptional<z.ZodString>;
        unitPrice: z.ZodNumber;
        discount: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["percentage", "fixed", "per_unit"]>;
            value: z.ZodNumber;
            reason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        }, {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        }>>;
        taxRate: z.ZodOptional<z.ZodNumber>;
        customOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        leadTime: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        discount?: {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        } | undefined;
        taxRate?: number | undefined;
        customOptions?: Record<string, unknown> | undefined;
        leadTime?: number | undefined;
        notes?: string | undefined;
    }, {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        discount?: {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        } | undefined;
        taxRate?: number | undefined;
        customOptions?: Record<string, unknown> | undefined;
        leadTime?: number | undefined;
        notes?: string | undefined;
    }>, "many">;
    discounts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["percentage", "fixed", "per_unit"]>;
        value: z.ZodNumber;
        code: z.ZodOptional<z.ZodString>;
        reason: z.ZodOptional<z.ZodString>;
        minOrderValue: z.ZodOptional<z.ZodNumber>;
        maxDiscount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        code?: string | undefined;
        reason?: string | undefined;
        minOrderValue?: number | undefined;
        maxDiscount?: number | undefined;
    }, {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        code?: string | undefined;
        reason?: string | undefined;
        minOrderValue?: number | undefined;
        maxDiscount?: number | undefined;
    }>, "many">>;
    pricing: z.ZodObject<{
        shipping: z.ZodNumber;
        taxType: z.ZodEnum<["included", "excluded", "exempt"]>;
        taxRate: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        taxRate: number;
        taxType: "included" | "excluded" | "exempt";
        shipping: number;
    }, {
        currency: string;
        taxRate: number;
        taxType: "included" | "excluded" | "exempt";
        shipping: number;
    }>;
    terms: z.ZodObject<{
        paymentTerms: z.ZodString;
        paymentDueDate: z.ZodOptional<z.ZodDate>;
        deliveryTerms: z.ZodOptional<z.ZodString>;
        deliveryDate: z.ZodOptional<z.ZodDate>;
        validityDays: z.ZodNumber;
        customTerms: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        internalNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        paymentTerms: string;
        validityDays: number;
        notes?: string | undefined;
        paymentDueDate?: Date | undefined;
        deliveryTerms?: string | undefined;
        deliveryDate?: Date | undefined;
        customTerms?: string | undefined;
        internalNotes?: string | undefined;
    }, {
        paymentTerms: string;
        validityDays: number;
        notes?: string | undefined;
        paymentDueDate?: Date | undefined;
        deliveryTerms?: string | undefined;
        deliveryDate?: Date | undefined;
        customTerms?: string | undefined;
        internalNotes?: string | undefined;
    }>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    items: {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        discount?: {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        } | undefined;
        taxRate?: number | undefined;
        customOptions?: Record<string, unknown> | undefined;
        leadTime?: number | undefined;
        notes?: string | undefined;
    }[];
    customer: {
        companyName: string;
        contactName: string;
        email: string;
        paymentTerms?: string | undefined;
        phone?: string | undefined;
        billingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        shippingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        taxId?: string | undefined;
    };
    discounts: {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        code?: string | undefined;
        reason?: string | undefined;
        minOrderValue?: number | undefined;
        maxDiscount?: number | undefined;
    }[];
    pricing: {
        currency: string;
        taxRate: number;
        taxType: "included" | "excluded" | "exempt";
        shipping: number;
    };
    terms: {
        paymentTerms: string;
        validityDays: number;
        notes?: string | undefined;
        paymentDueDate?: Date | undefined;
        deliveryTerms?: string | undefined;
        deliveryDate?: Date | undefined;
        customTerms?: string | undefined;
        internalNotes?: string | undefined;
    };
    metadata?: Record<string, unknown> | undefined;
}, {
    items: {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        discount?: {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        } | undefined;
        taxRate?: number | undefined;
        customOptions?: Record<string, unknown> | undefined;
        leadTime?: number | undefined;
        notes?: string | undefined;
    }[];
    customer: {
        companyName: string;
        contactName: string;
        email: string;
        paymentTerms?: string | undefined;
        phone?: string | undefined;
        billingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        shippingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        taxId?: string | undefined;
    };
    pricing: {
        currency: string;
        taxRate: number;
        taxType: "included" | "excluded" | "exempt";
        shipping: number;
    };
    terms: {
        paymentTerms: string;
        validityDays: number;
        notes?: string | undefined;
        paymentDueDate?: Date | undefined;
        deliveryTerms?: string | undefined;
        deliveryDate?: Date | undefined;
        customTerms?: string | undefined;
        internalNotes?: string | undefined;
    };
    discounts?: {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        code?: string | undefined;
        reason?: string | undefined;
        minOrderValue?: number | undefined;
        maxDiscount?: number | undefined;
    }[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
type QuoteCreateInput = z.infer<typeof quoteCreateSchema>;
/**
 * Quote update schema
 */
declare const quoteUpdateSchema: z.ZodObject<{
    customer: z.ZodOptional<z.ZodObject<{
        companyName: z.ZodOptional<z.ZodString>;
        contactName: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        billingAddress: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        }, {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        }>>>;
        shippingAddress: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        }, {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        }>>>;
        taxId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        paymentTerms: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        paymentTerms?: string | undefined;
        companyName?: string | undefined;
        contactName?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        billingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        shippingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        taxId?: string | undefined;
    }, {
        paymentTerms?: string | undefined;
        companyName?: string | undefined;
        contactName?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        billingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        shippingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        taxId?: string | undefined;
    }>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodOptional<z.ZodString>;
        unitPrice: z.ZodNumber;
        discount: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["percentage", "fixed", "per_unit"]>;
            value: z.ZodNumber;
            reason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        }, {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        }>>;
        taxRate: z.ZodOptional<z.ZodNumber>;
        customOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        leadTime: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        discount?: {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        } | undefined;
        taxRate?: number | undefined;
        customOptions?: Record<string, unknown> | undefined;
        leadTime?: number | undefined;
        notes?: string | undefined;
    }, {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        discount?: {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        } | undefined;
        taxRate?: number | undefined;
        customOptions?: Record<string, unknown> | undefined;
        leadTime?: number | undefined;
        notes?: string | undefined;
    }>, "many">>;
    discounts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["percentage", "fixed", "per_unit"]>;
        value: z.ZodNumber;
        code: z.ZodOptional<z.ZodString>;
        reason: z.ZodOptional<z.ZodString>;
        minOrderValue: z.ZodOptional<z.ZodNumber>;
        maxDiscount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        code?: string | undefined;
        reason?: string | undefined;
        minOrderValue?: number | undefined;
        maxDiscount?: number | undefined;
    }, {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        code?: string | undefined;
        reason?: string | undefined;
        minOrderValue?: number | undefined;
        maxDiscount?: number | undefined;
    }>, "many">>;
    pricing: z.ZodOptional<z.ZodObject<{
        shipping: z.ZodOptional<z.ZodNumber>;
        taxType: z.ZodOptional<z.ZodEnum<["included", "excluded", "exempt"]>>;
        taxRate: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency?: string | undefined;
        taxRate?: number | undefined;
        taxType?: "included" | "excluded" | "exempt" | undefined;
        shipping?: number | undefined;
    }, {
        currency?: string | undefined;
        taxRate?: number | undefined;
        taxType?: "included" | "excluded" | "exempt" | undefined;
        shipping?: number | undefined;
    }>>;
    terms: z.ZodOptional<z.ZodObject<{
        paymentTerms: z.ZodOptional<z.ZodString>;
        paymentDueDate: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
        deliveryTerms: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        deliveryDate: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
        validityDays: z.ZodOptional<z.ZodNumber>;
        customTerms: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        internalNotes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        notes?: string | undefined;
        paymentTerms?: string | undefined;
        paymentDueDate?: Date | undefined;
        deliveryTerms?: string | undefined;
        deliveryDate?: Date | undefined;
        validityDays?: number | undefined;
        customTerms?: string | undefined;
        internalNotes?: string | undefined;
    }, {
        notes?: string | undefined;
        paymentTerms?: string | undefined;
        paymentDueDate?: Date | undefined;
        deliveryTerms?: string | undefined;
        deliveryDate?: Date | undefined;
        validityDays?: number | undefined;
        customTerms?: string | undefined;
        internalNotes?: string | undefined;
    }>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "pending_review", "sent", "viewed", "accepted", "rejected", "expired", "cancelled"]>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    items?: {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        discount?: {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        } | undefined;
        taxRate?: number | undefined;
        customOptions?: Record<string, unknown> | undefined;
        leadTime?: number | undefined;
        notes?: string | undefined;
    }[] | undefined;
    status?: "rejected" | "cancelled" | "draft" | "pending_review" | "sent" | "viewed" | "accepted" | "expired" | undefined;
    customer?: {
        paymentTerms?: string | undefined;
        companyName?: string | undefined;
        contactName?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        billingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        shippingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        taxId?: string | undefined;
    } | undefined;
    discounts?: {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        code?: string | undefined;
        reason?: string | undefined;
        minOrderValue?: number | undefined;
        maxDiscount?: number | undefined;
    }[] | undefined;
    pricing?: {
        currency?: string | undefined;
        taxRate?: number | undefined;
        taxType?: "included" | "excluded" | "exempt" | undefined;
        shipping?: number | undefined;
    } | undefined;
    terms?: {
        notes?: string | undefined;
        paymentTerms?: string | undefined;
        paymentDueDate?: Date | undefined;
        deliveryTerms?: string | undefined;
        deliveryDate?: Date | undefined;
        validityDays?: number | undefined;
        customTerms?: string | undefined;
        internalNotes?: string | undefined;
    } | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    items?: {
        name: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
        unit?: string | undefined;
        discount?: {
            type: "percentage" | "fixed" | "per_unit";
            value: number;
            reason?: string | undefined;
        } | undefined;
        taxRate?: number | undefined;
        customOptions?: Record<string, unknown> | undefined;
        leadTime?: number | undefined;
        notes?: string | undefined;
    }[] | undefined;
    status?: "rejected" | "cancelled" | "draft" | "pending_review" | "sent" | "viewed" | "accepted" | "expired" | undefined;
    customer?: {
        paymentTerms?: string | undefined;
        companyName?: string | undefined;
        contactName?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        billingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        shippingAddress?: {
            line1: string;
            city: string;
            postalCode: string;
            country: string;
            state?: string | undefined;
            line2?: string | undefined;
        } | undefined;
        taxId?: string | undefined;
    } | undefined;
    discounts?: {
        type: "percentage" | "fixed" | "per_unit";
        value: number;
        code?: string | undefined;
        reason?: string | undefined;
        minOrderValue?: number | undefined;
        maxDiscount?: number | undefined;
    }[] | undefined;
    pricing?: {
        currency?: string | undefined;
        taxRate?: number | undefined;
        taxType?: "included" | "excluded" | "exempt" | undefined;
        shipping?: number | undefined;
    } | undefined;
    terms?: {
        notes?: string | undefined;
        paymentTerms?: string | undefined;
        paymentDueDate?: Date | undefined;
        deliveryTerms?: string | undefined;
        deliveryDate?: Date | undefined;
        validityDays?: number | undefined;
        customTerms?: string | undefined;
        internalNotes?: string | undefined;
    } | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
type QuoteUpdateInput = z.infer<typeof quoteUpdateSchema>;
/**
 * Quote send schema
 */
declare const quoteSendSchema: z.ZodObject<{
    recipientEmail: z.ZodString;
    ccEmails: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    attachPdf: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    recipientEmail: string;
    ccEmails: string[];
    subject: string;
    attachPdf: boolean;
    message?: string | undefined;
}, {
    recipientEmail: string;
    subject: string;
    message?: string | undefined;
    ccEmails?: string[] | undefined;
    attachPdf?: boolean | undefined;
}>;
type QuoteSendInput = z.infer<typeof quoteSendSchema>;
/**
 * Quote response schema (accept/reject)
 */
declare const quoteResponseSchema: z.ZodObject<{
    action: z.ZodEnum<["accept", "reject", "request_revision"]>;
    comment: z.ZodOptional<z.ZodString>;
    purchaseOrderNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "reject" | "accept" | "request_revision";
    comment?: string | undefined;
    purchaseOrderNumber?: string | undefined;
}, {
    action: "reject" | "accept" | "request_revision";
    comment?: string | undefined;
    purchaseOrderNumber?: string | undefined;
}>;
type QuoteResponseInput = z.infer<typeof quoteResponseSchema>;
/**
 * Quote filter schema
 */
declare const quoteFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["draft", "pending_review", "sent", "viewed", "accepted", "rejected", "expired", "cancelled"]>>;
    customerId: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    minTotal: z.ZodOptional<z.ZodNumber>;
    maxTotal: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "rejected" | "cancelled" | "draft" | "pending_review" | "sent" | "viewed" | "accepted" | "expired" | undefined;
    createdBy?: string | undefined;
    search?: string | undefined;
    customerId?: string | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    minTotal?: number | undefined;
    maxTotal?: number | undefined;
}, {
    status?: "rejected" | "cancelled" | "draft" | "pending_review" | "sent" | "viewed" | "accepted" | "expired" | undefined;
    createdBy?: string | undefined;
    search?: string | undefined;
    customerId?: string | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    minTotal?: number | undefined;
    maxTotal?: number | undefined;
}>;
type QuoteFilter = z.infer<typeof quoteFilterSchema>;

/**
 * Company type schema
 */
declare const companyTypeSchema: z.ZodEnum<["retailer", "wholesaler", "distributor", "manufacturer", "other"]>;
type CompanyType = z.infer<typeof companyTypeSchema>;
/**
 * Company status schema
 */
declare const companyStatusSchema: z.ZodEnum<["active", "pending_approval", "suspended", "inactive"]>;
type CompanyStatus = z.infer<typeof companyStatusSchema>;
/**
 * Address schema
 */
declare const companyAddressSchema: z.ZodObject<{
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodString;
    country: z.ZodString;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    state?: string | undefined;
    line2?: string | undefined;
    label?: string | undefined;
}, {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string | undefined;
    line2?: string | undefined;
    isDefault?: boolean | undefined;
    label?: string | undefined;
}>;
type CompanyAddressInput = z.infer<typeof companyAddressSchema>;
/**
 * Company billing settings schema
 */
declare const companyBillingSettingsSchema: z.ZodObject<{
    /** Payment terms (e.g., 'NET30', 'NET60') */
    paymentTerms: z.ZodString;
    /** Credit limit */
    creditLimit: z.ZodOptional<z.ZodNumber>;
    /** Whether to auto-approve orders under credit limit */
    autoApproveUnderCreditLimit: z.ZodDefault<z.ZodBoolean>;
    /** Tax exemption status */
    taxExempt: z.ZodDefault<z.ZodBoolean>;
    /** Tax exemption certificate number */
    taxExemptionCertificate: z.ZodOptional<z.ZodString>;
    /** Preferred currency */
    preferredCurrency: z.ZodDefault<z.ZodString>;
    /** Default billing address ID */
    defaultBillingAddressId: z.ZodOptional<z.ZodString>;
    /** Invoice email */
    invoiceEmail: z.ZodOptional<z.ZodString>;
    /** PO required for orders */
    requirePurchaseOrder: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    paymentTerms: string;
    autoApproveUnderCreditLimit: boolean;
    taxExempt: boolean;
    preferredCurrency: string;
    requirePurchaseOrder: boolean;
    creditLimit?: number | undefined;
    taxExemptionCertificate?: string | undefined;
    defaultBillingAddressId?: string | undefined;
    invoiceEmail?: string | undefined;
}, {
    paymentTerms: string;
    creditLimit?: number | undefined;
    autoApproveUnderCreditLimit?: boolean | undefined;
    taxExempt?: boolean | undefined;
    taxExemptionCertificate?: string | undefined;
    preferredCurrency?: string | undefined;
    defaultBillingAddressId?: string | undefined;
    invoiceEmail?: string | undefined;
    requirePurchaseOrder?: boolean | undefined;
}>;
type CompanyBillingSettingsInput = z.infer<typeof companyBillingSettingsSchema>;
/**
 * Company shipping settings schema
 */
declare const companyShippingSettingsSchema: z.ZodObject<{
    /** Default shipping address ID */
    defaultShippingAddressId: z.ZodOptional<z.ZodString>;
    /** Preferred shipping method */
    preferredShippingMethod: z.ZodOptional<z.ZodString>;
    /** Shipping account number (for carrier accounts) */
    shippingAccountNumber: z.ZodOptional<z.ZodString>;
    /** Special shipping instructions */
    shippingInstructions: z.ZodOptional<z.ZodString>;
    /** Allow partial shipments */
    allowPartialShipments: z.ZodDefault<z.ZodBoolean>;
    /** Consolidate shipments */
    consolidateShipments: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    allowPartialShipments: boolean;
    consolidateShipments: boolean;
    defaultShippingAddressId?: string | undefined;
    preferredShippingMethod?: string | undefined;
    shippingAccountNumber?: string | undefined;
    shippingInstructions?: string | undefined;
}, {
    defaultShippingAddressId?: string | undefined;
    preferredShippingMethod?: string | undefined;
    shippingAccountNumber?: string | undefined;
    shippingInstructions?: string | undefined;
    allowPartialShipments?: boolean | undefined;
    consolidateShipments?: boolean | undefined;
}>;
type CompanyShippingSettingsInput = z.infer<typeof companyShippingSettingsSchema>;
/**
 * Company ordering settings schema
 */
declare const companyOrderingSettingsSchema: z.ZodObject<{
    /** Minimum order value */
    minimumOrderValue: z.ZodOptional<z.ZodNumber>;
    /** Maximum order value */
    maximumOrderValue: z.ZodOptional<z.ZodNumber>;
    /** Require approval for orders over amount */
    approvalThreshold: z.ZodOptional<z.ZodNumber>;
    /** Allowed product categories (empty = all) */
    allowedCategories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Blocked product categories */
    blockedCategories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Enable bulk ordering */
    enableBulkOrdering: z.ZodDefault<z.ZodBoolean>;
    /** Enable quick reorder */
    enableQuickReorder: z.ZodDefault<z.ZodBoolean>;
    /** Default cost center */
    defaultCostCenter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    allowedCategories: string[];
    blockedCategories: string[];
    enableBulkOrdering: boolean;
    enableQuickReorder: boolean;
    minimumOrderValue?: number | undefined;
    maximumOrderValue?: number | undefined;
    approvalThreshold?: number | undefined;
    defaultCostCenter?: string | undefined;
}, {
    allowedCategories?: string[] | undefined;
    minimumOrderValue?: number | undefined;
    maximumOrderValue?: number | undefined;
    approvalThreshold?: number | undefined;
    blockedCategories?: string[] | undefined;
    enableBulkOrdering?: boolean | undefined;
    enableQuickReorder?: boolean | undefined;
    defaultCostCenter?: string | undefined;
}>;
type CompanyOrderingSettingsInput = z.infer<typeof companyOrderingSettingsSchema>;
/**
 * Company notification settings schema
 */
declare const companyNotificationSettingsSchema: z.ZodObject<{
    /** Order confirmation emails */
    orderConfirmation: z.ZodDefault<z.ZodBoolean>;
    /** Shipping notification emails */
    shippingNotification: z.ZodDefault<z.ZodBoolean>;
    /** Invoice emails */
    invoiceNotification: z.ZodDefault<z.ZodBoolean>;
    /** Quote emails */
    quoteNotification: z.ZodDefault<z.ZodBoolean>;
    /** Spending alert emails */
    spendingAlerts: z.ZodDefault<z.ZodBoolean>;
    /** Weekly spending summary */
    weeklySpendingSummary: z.ZodDefault<z.ZodBoolean>;
    /** Monthly spending summary */
    monthlySpendingSummary: z.ZodDefault<z.ZodBoolean>;
    /** Additional notification emails */
    additionalEmails: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    orderConfirmation: boolean;
    shippingNotification: boolean;
    invoiceNotification: boolean;
    quoteNotification: boolean;
    spendingAlerts: boolean;
    weeklySpendingSummary: boolean;
    monthlySpendingSummary: boolean;
    additionalEmails: string[];
}, {
    orderConfirmation?: boolean | undefined;
    shippingNotification?: boolean | undefined;
    invoiceNotification?: boolean | undefined;
    quoteNotification?: boolean | undefined;
    spendingAlerts?: boolean | undefined;
    weeklySpendingSummary?: boolean | undefined;
    monthlySpendingSummary?: boolean | undefined;
    additionalEmails?: string[] | undefined;
}>;
type CompanyNotificationSettingsInput = z.infer<typeof companyNotificationSettingsSchema>;
/**
 * Company branding settings schema
 */
declare const companyBrandingSettingsSchema: z.ZodObject<{
    /** Company logo URL */
    logoUrl: z.ZodOptional<z.ZodString>;
    /** Primary brand color */
    primaryColor: z.ZodOptional<z.ZodString>;
    /** Custom CSS class prefix */
    cssPrefix: z.ZodOptional<z.ZodString>;
    /** Custom footer text */
    footerText: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    logoUrl?: string | undefined;
    primaryColor?: string | undefined;
    cssPrefix?: string | undefined;
    footerText?: string | undefined;
}, {
    logoUrl?: string | undefined;
    primaryColor?: string | undefined;
    cssPrefix?: string | undefined;
    footerText?: string | undefined;
}>;
type CompanyBrandingSettingsInput = z.infer<typeof companyBrandingSettingsSchema>;
/**
 * Complete company profile schema
 */
declare const companyProfileSchema: z.ZodObject<{
    /** Company legal name */
    legalName: z.ZodString;
    /** Trading/display name */
    tradingName: z.ZodOptional<z.ZodString>;
    /** Company type */
    type: z.ZodEnum<["retailer", "wholesaler", "distributor", "manufacturer", "other"]>;
    /** Tax ID / VAT number */
    taxId: z.ZodString;
    /** Registration number */
    registrationNumber: z.ZodOptional<z.ZodString>;
    /** Company website */
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    /** Company phone */
    phone: z.ZodOptional<z.ZodString>;
    /** Company email */
    email: z.ZodString;
    /** Industry/sector */
    industry: z.ZodOptional<z.ZodString>;
    /** Company description */
    description: z.ZodOptional<z.ZodString>;
    /** Year established */
    yearEstablished: z.ZodOptional<z.ZodNumber>;
    /** Number of employees */
    employeeCount: z.ZodOptional<z.ZodNumber>;
    /** Annual revenue range */
    revenueRange: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
    email: string;
    taxId: string;
    legalName: string;
    description?: string | undefined;
    phone?: string | undefined;
    tradingName?: string | undefined;
    registrationNumber?: string | undefined;
    website?: string | undefined;
    industry?: string | undefined;
    yearEstablished?: number | undefined;
    employeeCount?: number | undefined;
    revenueRange?: string | undefined;
}, {
    type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
    email: string;
    taxId: string;
    legalName: string;
    description?: string | undefined;
    phone?: string | undefined;
    tradingName?: string | undefined;
    registrationNumber?: string | undefined;
    website?: string | undefined;
    industry?: string | undefined;
    yearEstablished?: number | undefined;
    employeeCount?: number | undefined;
    revenueRange?: string | undefined;
}>;
type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
/**
 * Complete company settings schema
 */
declare const companySettingsSchema: z.ZodObject<{
    profile: z.ZodObject<{
        /** Company legal name */
        legalName: z.ZodString;
        /** Trading/display name */
        tradingName: z.ZodOptional<z.ZodString>;
        /** Company type */
        type: z.ZodEnum<["retailer", "wholesaler", "distributor", "manufacturer", "other"]>;
        /** Tax ID / VAT number */
        taxId: z.ZodString;
        /** Registration number */
        registrationNumber: z.ZodOptional<z.ZodString>;
        /** Company website */
        website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        /** Company phone */
        phone: z.ZodOptional<z.ZodString>;
        /** Company email */
        email: z.ZodString;
        /** Industry/sector */
        industry: z.ZodOptional<z.ZodString>;
        /** Company description */
        description: z.ZodOptional<z.ZodString>;
        /** Year established */
        yearEstablished: z.ZodOptional<z.ZodNumber>;
        /** Number of employees */
        employeeCount: z.ZodOptional<z.ZodNumber>;
        /** Annual revenue range */
        revenueRange: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
        email: string;
        taxId: string;
        legalName: string;
        description?: string | undefined;
        phone?: string | undefined;
        tradingName?: string | undefined;
        registrationNumber?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        yearEstablished?: number | undefined;
        employeeCount?: number | undefined;
        revenueRange?: string | undefined;
    }, {
        type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
        email: string;
        taxId: string;
        legalName: string;
        description?: string | undefined;
        phone?: string | undefined;
        tradingName?: string | undefined;
        registrationNumber?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        yearEstablished?: number | undefined;
        employeeCount?: number | undefined;
        revenueRange?: string | undefined;
    }>;
    addresses: z.ZodDefault<z.ZodArray<z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodString;
        isDefault: z.ZodDefault<z.ZodBoolean>;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        isDefault: boolean;
        state?: string | undefined;
        line2?: string | undefined;
        label?: string | undefined;
    }, {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
        isDefault?: boolean | undefined;
        label?: string | undefined;
    }>, "many">>;
    billing: z.ZodObject<{
        /** Payment terms (e.g., 'NET30', 'NET60') */
        paymentTerms: z.ZodString;
        /** Credit limit */
        creditLimit: z.ZodOptional<z.ZodNumber>;
        /** Whether to auto-approve orders under credit limit */
        autoApproveUnderCreditLimit: z.ZodDefault<z.ZodBoolean>;
        /** Tax exemption status */
        taxExempt: z.ZodDefault<z.ZodBoolean>;
        /** Tax exemption certificate number */
        taxExemptionCertificate: z.ZodOptional<z.ZodString>;
        /** Preferred currency */
        preferredCurrency: z.ZodDefault<z.ZodString>;
        /** Default billing address ID */
        defaultBillingAddressId: z.ZodOptional<z.ZodString>;
        /** Invoice email */
        invoiceEmail: z.ZodOptional<z.ZodString>;
        /** PO required for orders */
        requirePurchaseOrder: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        paymentTerms: string;
        autoApproveUnderCreditLimit: boolean;
        taxExempt: boolean;
        preferredCurrency: string;
        requirePurchaseOrder: boolean;
        creditLimit?: number | undefined;
        taxExemptionCertificate?: string | undefined;
        defaultBillingAddressId?: string | undefined;
        invoiceEmail?: string | undefined;
    }, {
        paymentTerms: string;
        creditLimit?: number | undefined;
        autoApproveUnderCreditLimit?: boolean | undefined;
        taxExempt?: boolean | undefined;
        taxExemptionCertificate?: string | undefined;
        preferredCurrency?: string | undefined;
        defaultBillingAddressId?: string | undefined;
        invoiceEmail?: string | undefined;
        requirePurchaseOrder?: boolean | undefined;
    }>;
    shipping: z.ZodObject<{
        /** Default shipping address ID */
        defaultShippingAddressId: z.ZodOptional<z.ZodString>;
        /** Preferred shipping method */
        preferredShippingMethod: z.ZodOptional<z.ZodString>;
        /** Shipping account number (for carrier accounts) */
        shippingAccountNumber: z.ZodOptional<z.ZodString>;
        /** Special shipping instructions */
        shippingInstructions: z.ZodOptional<z.ZodString>;
        /** Allow partial shipments */
        allowPartialShipments: z.ZodDefault<z.ZodBoolean>;
        /** Consolidate shipments */
        consolidateShipments: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        allowPartialShipments: boolean;
        consolidateShipments: boolean;
        defaultShippingAddressId?: string | undefined;
        preferredShippingMethod?: string | undefined;
        shippingAccountNumber?: string | undefined;
        shippingInstructions?: string | undefined;
    }, {
        defaultShippingAddressId?: string | undefined;
        preferredShippingMethod?: string | undefined;
        shippingAccountNumber?: string | undefined;
        shippingInstructions?: string | undefined;
        allowPartialShipments?: boolean | undefined;
        consolidateShipments?: boolean | undefined;
    }>;
    ordering: z.ZodObject<{
        /** Minimum order value */
        minimumOrderValue: z.ZodOptional<z.ZodNumber>;
        /** Maximum order value */
        maximumOrderValue: z.ZodOptional<z.ZodNumber>;
        /** Require approval for orders over amount */
        approvalThreshold: z.ZodOptional<z.ZodNumber>;
        /** Allowed product categories (empty = all) */
        allowedCategories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Blocked product categories */
        blockedCategories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Enable bulk ordering */
        enableBulkOrdering: z.ZodDefault<z.ZodBoolean>;
        /** Enable quick reorder */
        enableQuickReorder: z.ZodDefault<z.ZodBoolean>;
        /** Default cost center */
        defaultCostCenter: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        allowedCategories: string[];
        blockedCategories: string[];
        enableBulkOrdering: boolean;
        enableQuickReorder: boolean;
        minimumOrderValue?: number | undefined;
        maximumOrderValue?: number | undefined;
        approvalThreshold?: number | undefined;
        defaultCostCenter?: string | undefined;
    }, {
        allowedCategories?: string[] | undefined;
        minimumOrderValue?: number | undefined;
        maximumOrderValue?: number | undefined;
        approvalThreshold?: number | undefined;
        blockedCategories?: string[] | undefined;
        enableBulkOrdering?: boolean | undefined;
        enableQuickReorder?: boolean | undefined;
        defaultCostCenter?: string | undefined;
    }>;
    notifications: z.ZodObject<{
        /** Order confirmation emails */
        orderConfirmation: z.ZodDefault<z.ZodBoolean>;
        /** Shipping notification emails */
        shippingNotification: z.ZodDefault<z.ZodBoolean>;
        /** Invoice emails */
        invoiceNotification: z.ZodDefault<z.ZodBoolean>;
        /** Quote emails */
        quoteNotification: z.ZodDefault<z.ZodBoolean>;
        /** Spending alert emails */
        spendingAlerts: z.ZodDefault<z.ZodBoolean>;
        /** Weekly spending summary */
        weeklySpendingSummary: z.ZodDefault<z.ZodBoolean>;
        /** Monthly spending summary */
        monthlySpendingSummary: z.ZodDefault<z.ZodBoolean>;
        /** Additional notification emails */
        additionalEmails: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        orderConfirmation: boolean;
        shippingNotification: boolean;
        invoiceNotification: boolean;
        quoteNotification: boolean;
        spendingAlerts: boolean;
        weeklySpendingSummary: boolean;
        monthlySpendingSummary: boolean;
        additionalEmails: string[];
    }, {
        orderConfirmation?: boolean | undefined;
        shippingNotification?: boolean | undefined;
        invoiceNotification?: boolean | undefined;
        quoteNotification?: boolean | undefined;
        spendingAlerts?: boolean | undefined;
        weeklySpendingSummary?: boolean | undefined;
        monthlySpendingSummary?: boolean | undefined;
        additionalEmails?: string[] | undefined;
    }>;
    branding: z.ZodOptional<z.ZodObject<{
        /** Company logo URL */
        logoUrl: z.ZodOptional<z.ZodString>;
        /** Primary brand color */
        primaryColor: z.ZodOptional<z.ZodString>;
        /** Custom CSS class prefix */
        cssPrefix: z.ZodOptional<z.ZodString>;
        /** Custom footer text */
        footerText: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        cssPrefix?: string | undefined;
        footerText?: string | undefined;
    }, {
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        cssPrefix?: string | undefined;
        footerText?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    shipping: {
        allowPartialShipments: boolean;
        consolidateShipments: boolean;
        defaultShippingAddressId?: string | undefined;
        preferredShippingMethod?: string | undefined;
        shippingAccountNumber?: string | undefined;
        shippingInstructions?: string | undefined;
    };
    profile: {
        type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
        email: string;
        taxId: string;
        legalName: string;
        description?: string | undefined;
        phone?: string | undefined;
        tradingName?: string | undefined;
        registrationNumber?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        yearEstablished?: number | undefined;
        employeeCount?: number | undefined;
        revenueRange?: string | undefined;
    };
    addresses: {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        isDefault: boolean;
        state?: string | undefined;
        line2?: string | undefined;
        label?: string | undefined;
    }[];
    billing: {
        paymentTerms: string;
        autoApproveUnderCreditLimit: boolean;
        taxExempt: boolean;
        preferredCurrency: string;
        requirePurchaseOrder: boolean;
        creditLimit?: number | undefined;
        taxExemptionCertificate?: string | undefined;
        defaultBillingAddressId?: string | undefined;
        invoiceEmail?: string | undefined;
    };
    ordering: {
        allowedCategories: string[];
        blockedCategories: string[];
        enableBulkOrdering: boolean;
        enableQuickReorder: boolean;
        minimumOrderValue?: number | undefined;
        maximumOrderValue?: number | undefined;
        approvalThreshold?: number | undefined;
        defaultCostCenter?: string | undefined;
    };
    notifications: {
        orderConfirmation: boolean;
        shippingNotification: boolean;
        invoiceNotification: boolean;
        quoteNotification: boolean;
        spendingAlerts: boolean;
        weeklySpendingSummary: boolean;
        monthlySpendingSummary: boolean;
        additionalEmails: string[];
    };
    branding?: {
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        cssPrefix?: string | undefined;
        footerText?: string | undefined;
    } | undefined;
}, {
    shipping: {
        defaultShippingAddressId?: string | undefined;
        preferredShippingMethod?: string | undefined;
        shippingAccountNumber?: string | undefined;
        shippingInstructions?: string | undefined;
        allowPartialShipments?: boolean | undefined;
        consolidateShipments?: boolean | undefined;
    };
    profile: {
        type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
        email: string;
        taxId: string;
        legalName: string;
        description?: string | undefined;
        phone?: string | undefined;
        tradingName?: string | undefined;
        registrationNumber?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        yearEstablished?: number | undefined;
        employeeCount?: number | undefined;
        revenueRange?: string | undefined;
    };
    billing: {
        paymentTerms: string;
        creditLimit?: number | undefined;
        autoApproveUnderCreditLimit?: boolean | undefined;
        taxExempt?: boolean | undefined;
        taxExemptionCertificate?: string | undefined;
        preferredCurrency?: string | undefined;
        defaultBillingAddressId?: string | undefined;
        invoiceEmail?: string | undefined;
        requirePurchaseOrder?: boolean | undefined;
    };
    ordering: {
        allowedCategories?: string[] | undefined;
        minimumOrderValue?: number | undefined;
        maximumOrderValue?: number | undefined;
        approvalThreshold?: number | undefined;
        blockedCategories?: string[] | undefined;
        enableBulkOrdering?: boolean | undefined;
        enableQuickReorder?: boolean | undefined;
        defaultCostCenter?: string | undefined;
    };
    notifications: {
        orderConfirmation?: boolean | undefined;
        shippingNotification?: boolean | undefined;
        invoiceNotification?: boolean | undefined;
        quoteNotification?: boolean | undefined;
        spendingAlerts?: boolean | undefined;
        weeklySpendingSummary?: boolean | undefined;
        monthlySpendingSummary?: boolean | undefined;
        additionalEmails?: string[] | undefined;
    };
    addresses?: {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
        isDefault?: boolean | undefined;
        label?: string | undefined;
    }[] | undefined;
    branding?: {
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        cssPrefix?: string | undefined;
        footerText?: string | undefined;
    } | undefined;
}>;
type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
/**
 * Company registration schema (for new companies)
 */
declare const companyRegistrationSchema: z.ZodObject<{
    profile: z.ZodObject<{
        /** Company legal name */
        legalName: z.ZodString;
        /** Trading/display name */
        tradingName: z.ZodOptional<z.ZodString>;
        /** Company type */
        type: z.ZodEnum<["retailer", "wholesaler", "distributor", "manufacturer", "other"]>;
        /** Tax ID / VAT number */
        taxId: z.ZodString;
        /** Registration number */
        registrationNumber: z.ZodOptional<z.ZodString>;
        /** Company website */
        website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        /** Company phone */
        phone: z.ZodOptional<z.ZodString>;
        /** Company email */
        email: z.ZodString;
        /** Industry/sector */
        industry: z.ZodOptional<z.ZodString>;
        /** Company description */
        description: z.ZodOptional<z.ZodString>;
        /** Year established */
        yearEstablished: z.ZodOptional<z.ZodNumber>;
        /** Number of employees */
        employeeCount: z.ZodOptional<z.ZodNumber>;
        /** Annual revenue range */
        revenueRange: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
        email: string;
        taxId: string;
        legalName: string;
        description?: string | undefined;
        phone?: string | undefined;
        tradingName?: string | undefined;
        registrationNumber?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        yearEstablished?: number | undefined;
        employeeCount?: number | undefined;
        revenueRange?: string | undefined;
    }, {
        type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
        email: string;
        taxId: string;
        legalName: string;
        description?: string | undefined;
        phone?: string | undefined;
        tradingName?: string | undefined;
        registrationNumber?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        yearEstablished?: number | undefined;
        employeeCount?: number | undefined;
        revenueRange?: string | undefined;
    }>;
    primaryAddress: z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodString;
        isDefault: z.ZodDefault<z.ZodBoolean>;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        isDefault: boolean;
        state?: string | undefined;
        line2?: string | undefined;
        label?: string | undefined;
    }, {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
        isDefault?: boolean | undefined;
        label?: string | undefined;
    }>;
    primaryContact: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        jobTitle: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string | undefined;
        jobTitle?: string | undefined;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string | undefined;
        jobTitle?: string | undefined;
    }>;
    billing: z.ZodObject<Pick<{
        /** Payment terms (e.g., 'NET30', 'NET60') */
        paymentTerms: z.ZodString;
        /** Credit limit */
        creditLimit: z.ZodOptional<z.ZodNumber>;
        /** Whether to auto-approve orders under credit limit */
        autoApproveUnderCreditLimit: z.ZodDefault<z.ZodBoolean>;
        /** Tax exemption status */
        taxExempt: z.ZodDefault<z.ZodBoolean>;
        /** Tax exemption certificate number */
        taxExemptionCertificate: z.ZodOptional<z.ZodString>;
        /** Preferred currency */
        preferredCurrency: z.ZodDefault<z.ZodString>;
        /** Default billing address ID */
        defaultBillingAddressId: z.ZodOptional<z.ZodString>;
        /** Invoice email */
        invoiceEmail: z.ZodOptional<z.ZodString>;
        /** PO required for orders */
        requirePurchaseOrder: z.ZodDefault<z.ZodBoolean>;
    }, "paymentTerms" | "preferredCurrency" | "invoiceEmail">, "strip", z.ZodTypeAny, {
        paymentTerms: string;
        preferredCurrency: string;
        invoiceEmail?: string | undefined;
    }, {
        paymentTerms: string;
        preferredCurrency?: string | undefined;
        invoiceEmail?: string | undefined;
    }>;
    acceptTerms: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    profile: {
        type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
        email: string;
        taxId: string;
        legalName: string;
        description?: string | undefined;
        phone?: string | undefined;
        tradingName?: string | undefined;
        registrationNumber?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        yearEstablished?: number | undefined;
        employeeCount?: number | undefined;
        revenueRange?: string | undefined;
    };
    billing: {
        paymentTerms: string;
        preferredCurrency: string;
        invoiceEmail?: string | undefined;
    };
    primaryAddress: {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        isDefault: boolean;
        state?: string | undefined;
        line2?: string | undefined;
        label?: string | undefined;
    };
    primaryContact: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string | undefined;
        jobTitle?: string | undefined;
    };
    acceptTerms: true;
}, {
    profile: {
        type: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other";
        email: string;
        taxId: string;
        legalName: string;
        description?: string | undefined;
        phone?: string | undefined;
        tradingName?: string | undefined;
        registrationNumber?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        yearEstablished?: number | undefined;
        employeeCount?: number | undefined;
        revenueRange?: string | undefined;
    };
    billing: {
        paymentTerms: string;
        preferredCurrency?: string | undefined;
        invoiceEmail?: string | undefined;
    };
    primaryAddress: {
        line1: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string | undefined;
        line2?: string | undefined;
        isDefault?: boolean | undefined;
        label?: string | undefined;
    };
    primaryContact: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string | undefined;
        jobTitle?: string | undefined;
    };
    acceptTerms: true;
}>;
type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;
/**
 * Company filter schema
 */
declare const companyFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["retailer", "wholesaler", "distributor", "manufacturer", "other"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "pending_approval", "suspended", "inactive"]>>;
    country: z.ZodOptional<z.ZodString>;
    hasCredit: z.ZodOptional<z.ZodBoolean>;
    minCreditLimit: z.ZodOptional<z.ZodNumber>;
    maxCreditLimit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type?: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other" | undefined;
    status?: "active" | "inactive" | "suspended" | "pending_approval" | undefined;
    search?: string | undefined;
    country?: string | undefined;
    hasCredit?: boolean | undefined;
    minCreditLimit?: number | undefined;
    maxCreditLimit?: number | undefined;
}, {
    type?: "retailer" | "wholesaler" | "distributor" | "manufacturer" | "other" | undefined;
    status?: "active" | "inactive" | "suspended" | "pending_approval" | undefined;
    search?: string | undefined;
    country?: string | undefined;
    hasCredit?: boolean | undefined;
    minCreditLimit?: number | undefined;
    maxCreditLimit?: number | undefined;
}>;
type CompanyFilter = z.infer<typeof companyFilterSchema>;

/**
 * Spending period schema
 */
declare const spendingPeriodSchema: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
type SpendingPeriod = z.infer<typeof spendingPeriodSchema>;
/**
 * Spending limit type schema
 */
declare const spendingLimitTypeSchema: z.ZodEnum<["employee", "department", "cost_center", "company", "category"]>;
type SpendingLimitType = z.infer<typeof spendingLimitTypeSchema>;
/**
 * Spending limit status schema
 */
declare const spendingLimitStatusSchema: z.ZodEnum<["active", "paused", "expired", "exceeded"]>;
type SpendingLimitStatus = z.infer<typeof spendingLimitStatusSchema>;
/**
 * Threshold action schema
 */
declare const thresholdActionSchema: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
type ThresholdAction = z.infer<typeof thresholdActionSchema>;
/**
 * Spending threshold schema
 */
declare const spendingThresholdSchema: z.ZodObject<{
    /** Percentage at which this threshold triggers (0-100) */
    percentage: z.ZodNumber;
    /** Action to take when threshold is reached */
    action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
    /** Custom message for notifications */
    notificationMessage: z.ZodOptional<z.ZodString>;
    /** Whether threshold is active */
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    percentage: number;
    action: "notify" | "notify_manager" | "require_approval" | "block";
    notificationMessage?: string | undefined;
}, {
    percentage: number;
    action: "notify" | "notify_manager" | "require_approval" | "block";
    isActive?: boolean | undefined;
    notificationMessage?: string | undefined;
}>;
type SpendingThresholdInput = z.infer<typeof spendingThresholdSchema>;
/**
 * Currency config schema
 */
declare const currencyConfigSchema: z.ZodObject<{
    code: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodDefault<z.ZodNumber>;
    symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
    thousandsSeparator: z.ZodDefault<z.ZodString>;
    decimalSeparator: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    code: string;
    decimals: number;
    symbolPosition: "before" | "after";
    thousandsSeparator: string;
    decimalSeparator: string;
}, {
    symbol: string;
    code: string;
    decimals?: number | undefined;
    symbolPosition?: "before" | "after" | undefined;
    thousandsSeparator?: string | undefined;
    decimalSeparator?: string | undefined;
}>;
type CurrencyConfigInput = z.infer<typeof currencyConfigSchema>;
/**
 * Base spending limit schema
 */
declare const spendingLimitBaseSchema: z.ZodObject<{
    /** Limit name */
    name: z.ZodString;
    /** Description */
    description: z.ZodOptional<z.ZodString>;
    /** Limit type */
    type: z.ZodEnum<["employee", "department", "cost_center", "company", "category"]>;
    /** Maximum spending amount */
    maxAmount: z.ZodNumber;
    /** Spending period */
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    /** Currency */
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    /** Whether limit is active */
    isActive: z.ZodDefault<z.ZodBoolean>;
    /** Whether to allow exceeding the limit */
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    /** Soft limit (warning threshold) */
    softLimit: z.ZodOptional<z.ZodNumber>;
    /** Hard limit (absolute maximum) */
    hardLimit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "department" | "employee" | "cost_center" | "company" | "category";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    isActive: boolean;
    allowExceed: boolean;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
}, {
    type: "department" | "employee" | "cost_center" | "company" | "category";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
}>;
/**
 * Employee spending limit schema
 */
declare const employeeSpendingLimitCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"employee">;
    employeeId: z.ZodString;
    orderLimit: z.ZodOptional<z.ZodNumber>;
    approvalThreshold: z.ZodOptional<z.ZodNumber>;
    managerId: z.ZodOptional<z.ZodString>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "employee";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    employeeId: string;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    orderLimit?: number | undefined;
    managerId?: string | undefined;
    approvalThreshold?: number | undefined;
}, {
    type: "employee";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    employeeId: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    orderLimit?: number | undefined;
    managerId?: string | undefined;
    approvalThreshold?: number | undefined;
}>;
type EmployeeSpendingLimitCreateInput = z.infer<typeof employeeSpendingLimitCreateSchema>;
/**
 * Department spending limit schema
 */
declare const departmentSpendingLimitCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"department">;
    departmentId: z.ZodString;
    departmentName: z.ZodString;
    distributeToEmployees: z.ZodDefault<z.ZodBoolean>;
    perEmployeeLimit: z.ZodOptional<z.ZodNumber>;
    approvalChain: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "department";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    approvalChain: string[];
    departmentId: string;
    departmentName: string;
    distributeToEmployees: boolean;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    perEmployeeLimit?: number | undefined;
}, {
    type: "department";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    departmentId: string;
    departmentName: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    approvalChain?: string[] | undefined;
    distributeToEmployees?: boolean | undefined;
    perEmployeeLimit?: number | undefined;
}>;
type DepartmentSpendingLimitCreateInput = z.infer<typeof departmentSpendingLimitCreateSchema>;
/**
 * Cost center spending limit schema
 */
declare const costCenterSpendingLimitCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"cost_center">;
    costCenterCode: z.ZodString;
    costCenterName: z.ZodString;
    accountCode: z.ZodOptional<z.ZodString>;
    glCode: z.ZodOptional<z.ZodString>;
    approvalChain: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "cost_center";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    approvalChain: string[];
    costCenterCode: string;
    costCenterName: string;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    accountCode?: string | undefined;
    glCode?: string | undefined;
}, {
    type: "cost_center";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    costCenterCode: string;
    costCenterName: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    approvalChain?: string[] | undefined;
    accountCode?: string | undefined;
    glCode?: string | undefined;
}>;
type CostCenterSpendingLimitCreateInput = z.infer<typeof costCenterSpendingLimitCreateSchema>;
/**
 * Category spending limit schema
 */
declare const categorySpendingLimitCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"category">;
    categoryId: z.ZodString;
    categoryName: z.ZodString;
    includeSubcategories: z.ZodDefault<z.ZodBoolean>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "category";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    categoryId: string;
    categoryName: string;
    includeSubcategories: boolean;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
}, {
    type: "category";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    categoryId: string;
    categoryName: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    includeSubcategories?: boolean | undefined;
}>;
type CategorySpendingLimitCreateInput = z.infer<typeof categorySpendingLimitCreateSchema>;
/**
 * Company-wide spending limit schema
 */
declare const companySpendingLimitCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"company">;
    companyId: z.ZodString;
    isGlobalCap: z.ZodDefault<z.ZodBoolean>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "company";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    companyId: string;
    isGlobalCap: boolean;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
}, {
    type: "company";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    companyId: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    isGlobalCap?: boolean | undefined;
}>;
type CompanySpendingLimitCreateInput = z.infer<typeof companySpendingLimitCreateSchema>;
/**
 * Union of all spending limit create schemas
 */
declare const spendingLimitCreateSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"employee">;
    employeeId: z.ZodString;
    orderLimit: z.ZodOptional<z.ZodNumber>;
    approvalThreshold: z.ZodOptional<z.ZodNumber>;
    managerId: z.ZodOptional<z.ZodString>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "employee";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    employeeId: string;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    orderLimit?: number | undefined;
    managerId?: string | undefined;
    approvalThreshold?: number | undefined;
}, {
    type: "employee";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    employeeId: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    orderLimit?: number | undefined;
    managerId?: string | undefined;
    approvalThreshold?: number | undefined;
}>, z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"department">;
    departmentId: z.ZodString;
    departmentName: z.ZodString;
    distributeToEmployees: z.ZodDefault<z.ZodBoolean>;
    perEmployeeLimit: z.ZodOptional<z.ZodNumber>;
    approvalChain: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "department";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    approvalChain: string[];
    departmentId: string;
    departmentName: string;
    distributeToEmployees: boolean;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    perEmployeeLimit?: number | undefined;
}, {
    type: "department";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    departmentId: string;
    departmentName: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    approvalChain?: string[] | undefined;
    distributeToEmployees?: boolean | undefined;
    perEmployeeLimit?: number | undefined;
}>, z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"cost_center">;
    costCenterCode: z.ZodString;
    costCenterName: z.ZodString;
    accountCode: z.ZodOptional<z.ZodString>;
    glCode: z.ZodOptional<z.ZodString>;
    approvalChain: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "cost_center";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    approvalChain: string[];
    costCenterCode: string;
    costCenterName: string;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    accountCode?: string | undefined;
    glCode?: string | undefined;
}, {
    type: "cost_center";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    costCenterCode: string;
    costCenterName: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    approvalChain?: string[] | undefined;
    accountCode?: string | undefined;
    glCode?: string | undefined;
}>, z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"category">;
    categoryId: z.ZodString;
    categoryName: z.ZodString;
    includeSubcategories: z.ZodDefault<z.ZodBoolean>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "category";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    categoryId: string;
    categoryName: string;
    includeSubcategories: boolean;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
}, {
    type: "category";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    categoryId: string;
    categoryName: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    includeSubcategories?: boolean | undefined;
}>, z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxAmount: z.ZodNumber;
    period: z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>;
    currency: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    allowExceed: z.ZodDefault<z.ZodBoolean>;
    softLimit: z.ZodOptional<z.ZodNumber>;
    hardLimit: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<"company">;
    companyId: z.ZodString;
    isGlobalCap: z.ZodDefault<z.ZodBoolean>;
    thresholds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "company";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    thresholds: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[];
    isActive: boolean;
    allowExceed: boolean;
    companyId: string;
    isGlobalCap: boolean;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
}, {
    type: "company";
    name: string;
    maxAmount: number;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    companyId: string;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
    isGlobalCap?: boolean | undefined;
}>]>;
type SpendingLimitCreateInput = z.infer<typeof spendingLimitCreateSchema>;
/**
 * Spending limit update schema
 */
declare const spendingLimitUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<["employee", "department", "cost_center", "company", "category"]>>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    period: z.ZodOptional<z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodDefault<z.ZodNumber>;
        symbolPosition: z.ZodDefault<z.ZodEnum<["before", "after"]>>;
        thousandsSeparator: z.ZodDefault<z.ZodString>;
        decimalSeparator: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    }, {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    }>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    allowExceed: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    softLimit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    hardLimit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    /** Custom thresholds */
    thresholds: z.ZodOptional<z.ZodArray<z.ZodObject<{
        /** Percentage at which this threshold triggers (0-100) */
        percentage: z.ZodNumber;
        /** Action to take when threshold is reached */
        action: z.ZodEnum<["notify", "notify_manager", "require_approval", "block"]>;
        /** Custom message for notifications */
        notificationMessage: z.ZodOptional<z.ZodString>;
        /** Whether threshold is active */
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }, {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type?: "department" | "employee" | "cost_center" | "company" | "category" | undefined;
    name?: string | undefined;
    maxAmount?: number | undefined;
    period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom" | undefined;
    currency?: {
        symbol: string;
        code: string;
        decimals: number;
        symbolPosition: "before" | "after";
        thousandsSeparator: string;
        decimalSeparator: string;
    } | undefined;
    thresholds?: {
        isActive: boolean;
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
}, {
    type?: "department" | "employee" | "cost_center" | "company" | "category" | undefined;
    name?: string | undefined;
    maxAmount?: number | undefined;
    period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom" | undefined;
    currency?: {
        symbol: string;
        code: string;
        decimals?: number | undefined;
        symbolPosition?: "before" | "after" | undefined;
        thousandsSeparator?: string | undefined;
        decimalSeparator?: string | undefined;
    } | undefined;
    thresholds?: {
        percentage: number;
        action: "notify" | "notify_manager" | "require_approval" | "block";
        isActive?: boolean | undefined;
        notificationMessage?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    allowExceed?: boolean | undefined;
    softLimit?: number | undefined;
    hardLimit?: number | undefined;
    description?: string | undefined;
}>;
type SpendingLimitUpdateInput = z.infer<typeof spendingLimitUpdateSchema>;
/**
 * Spending limit filter schema
 */
declare const spendingLimitFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["employee", "department", "cost_center", "company", "category"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "paused", "expired", "exceeded"]>>;
    period: z.ZodOptional<z.ZodEnum<["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]>>;
    employeeId: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    isExceeded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type?: "department" | "employee" | "cost_center" | "company" | "category" | undefined;
    status?: "exceeded" | "expired" | "active" | "paused" | undefined;
    period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom" | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
    employeeId?: string | undefined;
    departmentId?: string | undefined;
    isExceeded?: boolean | undefined;
}, {
    type?: "department" | "employee" | "cost_center" | "company" | "category" | undefined;
    status?: "exceeded" | "expired" | "active" | "paused" | undefined;
    period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom" | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
    employeeId?: string | undefined;
    departmentId?: string | undefined;
    isExceeded?: boolean | undefined;
}>;
type SpendingLimitFilter = z.infer<typeof spendingLimitFilterSchema>;
/**
 * Spending transaction schema (for tracking)
 */
declare const spendingTransactionSchema: z.ZodObject<{
    /** Transaction amount */
    amount: z.ZodNumber;
    /** Transaction description */
    description: z.ZodOptional<z.ZodString>;
    /** Reference (order ID, etc.) */
    reference: z.ZodOptional<z.ZodString>;
    /** Transaction date */
    transactionDate: z.ZodDefault<z.ZodDate>;
    /** Category */
    category: z.ZodOptional<z.ZodString>;
    /** Cost center */
    costCenter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    transactionDate: Date;
    description?: string | undefined;
    category?: string | undefined;
    reference?: string | undefined;
    costCenter?: string | undefined;
}, {
    amount: number;
    description?: string | undefined;
    category?: string | undefined;
    reference?: string | undefined;
    transactionDate?: Date | undefined;
    costCenter?: string | undefined;
}>;
type SpendingTransactionInput = z.infer<typeof spendingTransactionSchema>;
/**
 * Spending adjustment schema (for corrections)
 */
declare const spendingAdjustmentSchema: z.ZodObject<{
    /** Adjustment amount (positive to increase, negative to decrease) */
    amount: z.ZodNumber;
    /** Reason for adjustment */
    reason: z.ZodString;
    /** Reference (order ID, refund ID, etc.) */
    reference: z.ZodOptional<z.ZodString>;
    /** Approved by */
    approvedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    amount: number;
    approvedBy: string;
    reference?: string | undefined;
}, {
    reason: string;
    amount: number;
    approvedBy: string;
    reference?: string | undefined;
}>;
type SpendingAdjustmentInput = z.infer<typeof spendingAdjustmentSchema>;

export { type AddressInput, type CategorySpendingLimitCreateInput, type CompanyAddressInput, type CompanyBillingSettingsInput, type CompanyBrandingSettingsInput, type CompanyFilter, type CompanyNotificationSettingsInput, type CompanyOrderingSettingsInput, type CompanyProfileInput, type CompanyRegistrationInput, type CompanySettingsInput, type CompanyShippingSettingsInput, type CompanySpendingLimitCreateInput, type CompanyStatus, type CompanyType, type CostCenterSpendingLimitCreateInput, type CurrencyConfigInput, type DepartmentSpendingLimitCreateInput, type DiscountType, type EmployeeBulkImportRow, type EmployeeCreateInput, type EmployeeFilter, type EmployeeInviteInput, type EmployeePermissions, type EmployeeRole, type EmployeeSpendingLimit, type EmployeeSpendingLimitCreateInput, type EmployeeStatus, type EmployeeUpdateInput, type LineItemDiscountInput, type QuoteCreateInput, type QuoteCustomerInput, type QuoteDiscountInput, type QuoteFilter, type QuoteLineItemInput, type QuotePricingInput, type QuoteResponseInput, type QuoteSendInput, type QuoteStatus, type QuoteTermsInput, type QuoteUpdateInput, type SpendingAdjustmentInput, type SpendingLimitCreateInput, type SpendingLimitFilter, type SpendingLimitStatus, type SpendingLimitType, type SpendingLimitUpdateInput, type SpendingPeriod, type SpendingThresholdInput, type SpendingTransactionInput, type TaxType, type ThresholdAction, addressSchema, categorySpendingLimitCreateSchema, companyAddressSchema, companyBillingSettingsSchema, companyBrandingSettingsSchema, companyFilterSchema, companyNotificationSettingsSchema, companyOrderingSettingsSchema, companyProfileSchema, companyRegistrationSchema, companySettingsSchema, companyShippingSettingsSchema, companySpendingLimitCreateSchema, companyStatusSchema, companyTypeSchema, costCenterSpendingLimitCreateSchema, currencyConfigSchema, departmentSpendingLimitCreateSchema, discountTypeSchema, employeeBaseSchema, employeeBulkImportRowSchema, employeeCreateSchema, employeeFilterSchema, employeeInviteSchema, employeePermissionsSchema, employeeRoleSchema, employeeSpendingLimitCreateSchema, employeeSpendingLimitSchema, employeeStatusSchema, employeeUpdateSchema, lineItemDiscountSchema, quoteCreateSchema, quoteCustomerSchema, quoteDiscountSchema, quoteFilterSchema, quoteLineItemSchema, quotePricingSchema, quoteResponseSchema, quoteSendSchema, quoteStatusSchema, quoteTermsSchema, quoteUpdateSchema, spendingAdjustmentSchema, spendingLimitBaseSchema, spendingLimitCreateSchema, spendingLimitFilterSchema, spendingLimitStatusSchema, spendingLimitTypeSchema, spendingLimitUpdateSchema, spendingPeriodSchema, spendingThresholdSchema, spendingTransactionSchema, taxTypeSchema, thresholdActionSchema };
