/**
 * B2B Types - Re-exports
 *
 * This module exports all B2B-specific types for e-commerce functionality.
 *
 * @packageDocumentation
 */

// Company types
export type {
  // Payment terms
  PaymentTermType,
  PaymentTerms,
  // Company tier
  CompanyTier,
  CompanyTierConfig,
  // Address
  CompanyAddressType,
  CompanyAddress,
  // Settings and status
  CompanySettings,
  CompanyStatus,
  // Company entity
  Company,
  CompanySummary,
  // DTOs
  CreateCompanyInput,
  UpdateCompanyInput,
} from './company';

// Employee types
export type {
  // Permissions
  EmployeePermission,
  PermissionGroup,
  // Roles
  EmployeeRole,
  RoleConfig,
  // Status and department
  EmployeeStatus,
  Department,
  // Employee entity
  Employee,
  EmployeeSummary,
  EmployeeInvitation,
  // DTOs
  InviteEmployeeInput,
  UpdateEmployeeInput,
  // Activity
  EmployeeActivityType,
  EmployeeActivity,
} from './employee';

// Quote types
export type {
  // Status
  QuoteStatus,
  // Items and totals
  QuoteItem,
  QuoteTotals,
  QuoteTerms,
  // History and messages
  QuoteHistoryEventType,
  QuoteHistoryEntry,
  QuoteMessage,
  QuoteAttachment,
  // Quote entity
  Quote,
  QuoteSummary,
  // DTOs
  QuoteItemInput,
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteResponseInput,
  // Filters
  QuoteFilters,
} from './quote';

// Approval types
export type {
  // Types and triggers
  ApprovalEntityType,
  ApprovalTriggerType,
  ApprovalTrigger,
  // Status
  ApprovalStatus,
  // Workflow
  ApprovalLevel,
  ApprovalWorkflow,
  // Steps
  ApprovalStep,
  ApproverDecision,
  // Request entity
  ApprovalRequest,
  ApprovalAttachment,
  ApprovalSummary,
  // DTOs
  ApprovalAction,
  ApprovalActionInput,
  CreateApprovalWorkflowInput,
  UpdateApprovalWorkflowInput,
  // Filters and delegation
  ApprovalFilters,
  ApprovalDelegation,
} from './approval';

// Spending types
export type {
  // Period and entity type
  SpendingPeriod,
  SpendingLimitEntityType,
  // Limits
  SpendingLimit,
  CategoryRestriction,
  ProductRestriction,
  // Rules
  SpendingRuleAction,
  SpendingRule,
  // Transactions
  SpendingTransaction,
  // Reports
  SpendingReport,
  SpendingByCategory,
  SpendingByEmployee,
  SpendingByDepartment,
  DailySpending,
  LimitExceededAlert,
  NearLimitAlert,
  // DTOs
  CreateSpendingLimitInput,
  UpdateSpendingLimitInput,
  CreateSpendingRuleInput,
  SpendingAdjustmentInput,
  // Filters
  SpendingFilters,
} from './spending';

// Order types
export type {
  // Status (renamed to avoid conflict with e-commerce OrderStatus)
  OrderStatus as B2BOrderStatus,
  // Items and totals
  OrderItem as B2BOrderItem,
  OrderTotals as B2BOrderTotals,
  // Shipping
  OrderShippingAddress,
  OrderShipping,
  // Payment
  PaymentMethodType,
  PaymentStatus,
  OrderPayment,
  // History and attachments
  OrderHistoryEventType,
  OrderHistoryEntry,
  OrderAttachment,
  // Order entity
  Order as B2BOrder,
  OrderSummary,
  // DTOs
  OrderItemInput,
  ShippingAddressInput,
  CreateOrderInput,
  UpdateOrderInput,
  CancelOrderInput,
  ReturnOrderInput,
  // Filters and sorting
  OrderFilters,
  OrderSortField,
  OrderSortOptions,
  // Statistics
  OrderStatistics,
} from './order';

// Report types
export type {
  // Period and type
  ReportPeriod,
  ReportType,
  // Data structures
  EmployeeSpending,
  CategorySpending,
  MonthlyTrend,
  TopProduct,
  // Summary and complete data
  ReportSummary,
  ReportData,
} from './report';

// Bulk order types
export type {
  // Items and entries
  BulkOrderItem,
  BulkOrderSummary,
  ProductCatalogEntry,
  // Validation
  BulkOrderValidationResult,
  BulkOrderValidationError,
  BulkOrderValidationWarning,
  BulkOrderErrorCode,
  BulkOrderWarningCode,
  // CSV parsing
  BulkOrderCsvInput,
  BulkOrderCsvParseResult,
} from './bulk';
