/**
 * @maison/ui-b2b
 *
 * Headless B2B UI components for Maison e-commerce.
 *
 * This package provides logic-only primitives, form schemas,
 * and utilities for building B2B commerce interfaces.
 *
 * @example
 * ```tsx
 * // Import primitives
 * import { useDataTable, useBulkSelector } from '@maison/ui-b2b';
 *
 * // Import form schemas
 * import { employeeCreateSchema } from '@maison/ui-b2b/forms';
 *
 * // Import utilities
 * import { formatCurrency, evaluateRules } from '@maison/ui-b2b/utils';
 * ```
 */

// =============================================================================
// PRIMITIVES
// =============================================================================

// DataTable
export { useDataTable } from "./primitives/DataTable";
export type {
  ColumnDef,
  DataTableState,
  FilterConfig,
  FilterOperator,
  PaginationConfig,
  PaginationState,
  RowSelectionMode,
  RowSelectionState,
  SortConfig,
  SortDirection,
  UseDataTableOptions,
  UseDataTableReturn,
} from "./primitives/DataTable";

// BulkSelector
export { useBulkSelector } from "./primitives/BulkSelector";
export type {
  BulkSelectionState,
  SelectableItem,
  SelectionState,
  UseBulkSelectorOptions,
  UseBulkSelectorReturn,
} from "./primitives/BulkSelector";

// ApprovalFlow
export { useApprovalFlow } from "./primitives/ApprovalFlow";
export type {
  ApprovalAction,
  ApprovalFlowState,
  ApprovalStep,
  ApprovalStepStatus,
  ApprovalWorkflow,
  ApprovalWorkflowStatus,
  Approver,
  UseApprovalFlowOptions,
  UseApprovalFlowReturn,
} from "./primitives/ApprovalFlow";

// SpendingMeter
export {
  useSpendingMeter,
  DEFAULT_CURRENCY,
  DEFAULT_THRESHOLDS,
} from "./primitives/SpendingMeter";
export type {
  CurrencyConfig,
  SpendingLimit,
  SpendingMeterState,
  SpendingPeriod,
  SpendingThreshold,
  ThresholdLevel,
  UseSpendingMeterOptions,
  UseSpendingMeterReturn,
} from "./primitives/SpendingMeter";

// QuoteBuilder
export { useQuoteBuilder } from "./primitives/QuoteBuilder";
export type {
  Address,
  CartItem,
  DiscountType,
  Quote,
  QuoteBuilderState,
  QuoteCustomer,
  QuoteDiscount,
  QuoteLineItem,
  QuotePricing,
  QuoteStatus,
  QuoteTerms,
  QuoteValidationError,
  TaxType,
  UseQuoteBuilderOptions,
  UseQuoteBuilderReturn,
} from "./primitives/QuoteBuilder";

// =============================================================================
// FORMS (Zod Schemas)
// =============================================================================

// Employee schemas
export {
  employeeBaseSchema,
  employeeBulkImportRowSchema,
  employeeCreateSchema,
  employeeFilterSchema,
  employeeInviteSchema,
  employeePermissionsSchema,
  employeeRoleSchema,
  employeeSpendingLimitSchema,
  employeeStatusSchema,
  employeeUpdateSchema,
} from "./forms/employee.schema";
export type {
  EmployeeBulkImportRow,
  EmployeeCreateInput,
  EmployeeFilter,
  EmployeeInviteInput,
  EmployeePermissions,
  EmployeeRole,
  EmployeeSpendingLimit,
  EmployeeStatus,
  EmployeeUpdateInput,
} from "./forms/employee.schema";

// Quote schemas
export {
  addressSchema,
  discountTypeSchema,
  lineItemDiscountSchema,
  quoteCreateSchema,
  quoteCustomerSchema,
  quoteDiscountSchema,
  quoteFilterSchema,
  quoteLineItemSchema,
  quotePricingSchema,
  quoteResponseSchema,
  quoteSendSchema,
  quoteStatusSchema,
  quoteTermsSchema,
  quoteUpdateSchema,
  taxTypeSchema,
} from "./forms/quote.schema";
export type {
  AddressInput,
  LineItemDiscountInput,
  QuoteCreateInput,
  QuoteCustomerInput,
  QuoteDiscountInput,
  QuoteFilter,
  QuoteLineItemInput,
  QuotePricingInput,
  QuoteResponseInput,
  QuoteSendInput,
  QuoteTermsInput,
  QuoteUpdateInput,
} from "./forms/quote.schema";

// Company schemas
export {
  companyAddressSchema,
  companyBillingSettingsSchema,
  companyBrandingSettingsSchema,
  companyFilterSchema,
  companyNotificationSettingsSchema,
  companyOrderingSettingsSchema,
  companyProfileSchema,
  companyRegistrationSchema,
  companySettingsSchema,
  companyShippingSettingsSchema,
  companyStatusSchema,
  companyTypeSchema,
} from "./forms/company.schema";
export type {
  CompanyAddressInput,
  CompanyBillingSettingsInput,
  CompanyBrandingSettingsInput,
  CompanyFilter,
  CompanyNotificationSettingsInput,
  CompanyOrderingSettingsInput,
  CompanyProfileInput,
  CompanyRegistrationInput,
  CompanySettingsInput,
  CompanyShippingSettingsInput,
  CompanyStatus,
  CompanyType,
} from "./forms/company.schema";

// Spending limit schemas
export {
  categorySpendingLimitCreateSchema,
  companySpendingLimitCreateSchema,
  costCenterSpendingLimitCreateSchema,
  currencyConfigSchema,
  departmentSpendingLimitCreateSchema,
  employeeSpendingLimitCreateSchema,
  spendingAdjustmentSchema,
  spendingLimitBaseSchema,
  spendingLimitCreateSchema,
  spendingLimitFilterSchema,
  spendingLimitStatusSchema,
  spendingLimitTypeSchema,
  spendingLimitUpdateSchema,
  spendingPeriodSchema,
  spendingThresholdSchema,
  spendingTransactionSchema,
  thresholdActionSchema,
} from "./forms/spending-limit.schema";
export type {
  CategorySpendingLimitCreateInput,
  CompanySpendingLimitCreateInput,
  CostCenterSpendingLimitCreateInput,
  CurrencyConfigInput,
  DepartmentSpendingLimitCreateInput,
  EmployeeSpendingLimitCreateInput,
  SpendingAdjustmentInput,
  SpendingLimitCreateInput,
  SpendingLimitFilter,
  SpendingLimitStatus,
  SpendingLimitType,
  SpendingLimitUpdateInput,
  SpendingPeriod as SpendingLimitPeriod,
  SpendingThresholdInput,
  SpendingTransactionInput,
  ThresholdAction,
} from "./forms/spending-limit.schema";

// =============================================================================
// UTILITIES
// =============================================================================

// Approval Rules
export {
  canAutoApprove,
  createAmountRule,
  createDepartmentRule,
  createRoleRule,
  DEFAULT_APPROVAL_RULES,
  evaluateCondition,
  evaluateRule,
  evaluateRules,
  getRequiredApprovers,
  requiresApproval,
  shouldReject,
} from "./utils/approval-rules";
export type {
  ApprovalRule,
  RuleAction,
  RuleActionType,
  RuleCondition,
  RuleConditionType,
  RuleEvaluationContext,
  RuleEvaluationResult,
} from "./utils/approval-rules";

// Spending Calculator
export {
  calculateByCategory,
  calculateByDay,
  calculateEffectiveLimit,
  calculateRollover,
  calculateSavingsOpportunity,
  calculateSpending,
  calculateTotal,
  calculateTrend,
  canMakePurchase,
  daysBetween,
  filterByPeriod,
  generateForecast,
  getPeriodDates,
} from "./utils/spending-calculator";
export type {
  SpendingCalculation,
  SpendingLimitConfig,
  SpendingPeriodType,
  SpendingRecord,
} from "./utils/spending-calculator";

// CSV Parser
export {
  EMPLOYEE_COLUMN_MAPPINGS,
  generateCsv,
  generateTemplate,
  mapColumns,
  parseCsv,
  readAndParseCsv,
  readFileAsText,
  validateFileSize,
} from "./utils/csv-parser";
export type {
  ColumnMapping,
  CsvParseError,
  CsvParseOptions,
  CsvParseResult,
} from "./utils/csv-parser";

// Formatters
export {
  formatAddress,
  formatCompanyName,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  formatDuration,
  formatFileSize,
  formatInvoiceNumber,
  formatNumber,
  formatOrderNumber,
  formatPaymentTerms,
  formatPercentage,
  formatPhoneNumber,
  formatQuantity,
  formatQuoteNumber,
  formatRelativeDate,
  formatVatId,
  truncateText,
} from "./utils/format";
export type {
  CurrencyFormatOptions,
  DateFormatOptions,
  NumberFormatOptions,
} from "./utils/format";
