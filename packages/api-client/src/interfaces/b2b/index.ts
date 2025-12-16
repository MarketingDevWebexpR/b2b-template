/**
 * B2B Service Interfaces - Re-exports
 *
 * @packageDocumentation
 */

// Company service
export type {
  ListCompaniesOptions,
  CompanyRegistrationRequest,
  CompanyRegistrationResult,
  CreditAdjustmentInput,
  CreditHistoryEntry,
  ICompanyService,
} from "./companies";

// Employee service
export type {
  ListEmployeesOptions,
  EmployeeLoginResult,
  IEmployeeService,
} from "./employees";

// Quote service
export type {
  ListQuotesOptions,
  QuoteConversionResult,
  QuotePdfOptions,
  IQuoteService,
} from "./quotes";

// Approval service
export type {
  ListApprovalsOptions,
  ApprovalActionResult,
  ApprovalStats,
  IApprovalService,
} from "./approvals";

// Spending service
export type {
  ListSpendingLimitsOptions,
  SpendingCheckResult,
  BudgetSummary,
  ISpendingService,
} from "./spending";
