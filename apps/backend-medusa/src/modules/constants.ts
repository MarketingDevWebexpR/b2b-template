/**
 * B2B Module Constants
 *
 * Module identifiers used for dependency injection.
 * These must match the service names derived from the first model's table name
 * in each MedusaService definition.
 *
 * @packageDocumentation
 */

/**
 * B2B Company Module identifier
 * Derived from model.define("b2b_company", ...) → b2bCompanyService
 */
export const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * B2B Spending Module identifier
 * Derived from model.define("b2b_spending_limit", ...) → b2bSpendingLimitService
 */
export const B2B_SPENDING_MODULE = "b2bSpendingLimitService";

/**
 * B2B Approval Module identifier
 * Derived from model.define("b2b_approval_workflow", ...) → b2bApprovalWorkflowService
 */
export const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";

/**
 * B2B Quote Module identifier
 * Derived from model.define("b2b_quote", ...) → b2bQuoteService
 */
export const B2B_QUOTE_MODULE = "b2bQuoteService";
