/**
 * Approval Rules Utilities
 *
 * Functions for evaluating approval rules in B2B workflows.
 */
/**
 * Approval rule condition type
 */
type RuleConditionType = "amount_greater_than" | "amount_less_than" | "amount_between" | "quantity_greater_than" | "quantity_less_than" | "category_in" | "category_not_in" | "user_role_in" | "user_role_not_in" | "department_in" | "department_not_in" | "cost_center_in" | "cost_center_not_in" | "vendor_in" | "vendor_not_in" | "custom";
/**
 * Approval rule condition
 */
interface RuleCondition {
    type: RuleConditionType;
    value: unknown;
    valueTo?: unknown;
}
/**
 * Approval rule action
 */
type RuleActionType = "auto_approve" | "require_approval" | "require_multi_approval" | "escalate" | "reject" | "notify";
/**
 * Approval rule action configuration
 */
interface RuleAction {
    type: RuleActionType;
    /** Approver IDs (for require_approval) */
    approverIds?: string[];
    /** Number of approvals required (for multi_approval) */
    requiredApprovals?: number;
    /** Escalation target ID */
    escalateTo?: string;
    /** Notification message */
    message?: string;
    /** Notification recipients */
    notifyRecipients?: string[];
}
/**
 * Complete approval rule
 */
interface ApprovalRule {
    id: string;
    name: string;
    description?: string;
    /** Conditions that must all be met (AND logic) */
    conditions: RuleCondition[];
    /** Action to take when rule matches */
    action: RuleAction;
    /** Rule priority (lower = higher priority) */
    priority: number;
    /** Whether rule is active */
    isActive: boolean;
}
/**
 * Context for rule evaluation
 */
interface RuleEvaluationContext {
    /** Order/request amount */
    amount?: number;
    /** Total quantity */
    quantity?: number;
    /** Item categories */
    categories?: string[];
    /** User role */
    userRole?: string;
    /** User department */
    department?: string;
    /** Cost center */
    costCenter?: string;
    /** Vendor/supplier ID */
    vendorId?: string;
    /** Custom data for custom conditions */
    customData?: Record<string, unknown>;
}
/**
 * Rule evaluation result
 */
interface RuleEvaluationResult {
    /** Whether any rule matched */
    matched: boolean;
    /** Matching rule (if any) */
    matchedRule?: ApprovalRule;
    /** Action to take */
    action?: RuleAction;
    /** All evaluated rules with their match status */
    evaluations: Array<{
        rule: ApprovalRule;
        matched: boolean;
        failedConditions: RuleCondition[];
    }>;
}
/**
 * Evaluate a single condition against context
 */
declare function evaluateCondition(condition: RuleCondition, context: RuleEvaluationContext): boolean;
/**
 * Evaluate a single rule against context
 */
declare function evaluateRule(rule: ApprovalRule, context: RuleEvaluationContext): {
    matched: boolean;
    failedConditions: RuleCondition[];
};
/**
 * Evaluate all rules and return the first matching rule (by priority)
 */
declare function evaluateRules(rules: ApprovalRule[], context: RuleEvaluationContext): RuleEvaluationResult;
/**
 * Get required approvers based on rule evaluation result
 */
declare function getRequiredApprovers(result: RuleEvaluationResult): string[];
/**
 * Check if approval is required based on rules
 */
declare function requiresApproval(result: RuleEvaluationResult): boolean;
/**
 * Check if auto-approval is allowed based on rules
 */
declare function canAutoApprove(result: RuleEvaluationResult): boolean;
/**
 * Check if request should be rejected based on rules
 */
declare function shouldReject(result: RuleEvaluationResult): boolean;
/**
 * Create a simple amount-based approval rule
 */
declare function createAmountRule(id: string, name: string, threshold: number, action: RuleAction, priority?: number): ApprovalRule;
/**
 * Create a role-based approval rule
 */
declare function createRoleRule(id: string, name: string, roles: string[], action: RuleAction, priority?: number): ApprovalRule;
/**
 * Create a department-based approval rule
 */
declare function createDepartmentRule(id: string, name: string, departments: string[], action: RuleAction, priority?: number): ApprovalRule;
/**
 * Default approval rules for B2B
 */
declare const DEFAULT_APPROVAL_RULES: ApprovalRule[];

/**
 * Spending Calculator Utilities
 *
 * Functions for calculating spending limits, usage, and projections.
 */
/**
 * Spending period type
 */
type SpendingPeriodType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
/**
 * Spending record
 */
interface SpendingRecord {
    amount: number;
    date: Date;
    category?: string;
    reference?: string;
}
/**
 * Spending limit configuration
 */
interface SpendingLimitConfig {
    maxAmount: number;
    period: SpendingPeriodType;
    softLimitPercentage?: number;
    hardLimitPercentage?: number;
    rollover?: boolean;
    rolloverPercentage?: number;
}
/**
 * Spending calculation result
 */
interface SpendingCalculation {
    /** Total spent in current period */
    totalSpent: number;
    /** Remaining amount */
    remaining: number;
    /** Usage percentage */
    percentage: number;
    /** Whether soft limit is exceeded */
    softLimitExceeded: boolean;
    /** Whether hard limit is exceeded */
    hardLimitExceeded: boolean;
    /** Period start date */
    periodStart: Date;
    /** Period end date */
    periodEnd: Date;
    /** Days remaining in period */
    daysRemaining: number;
    /** Average daily spending */
    averageDaily: number;
    /** Projected end-of-period spending */
    projected: number;
    /** Whether on track to stay under limit */
    onTrack: boolean;
    /** Recommended daily budget to stay under limit */
    recommendedDaily: number;
}
/**
 * Get period start and end dates
 */
declare function getPeriodDates(period: SpendingPeriodType, referenceDate?: Date): {
    start: Date;
    end: Date;
};
/**
 * Calculate days between two dates
 */
declare function daysBetween(start: Date, end: Date): number;
/**
 * Filter spending records by date range
 */
declare function filterByPeriod(records: SpendingRecord[], start: Date, end: Date): SpendingRecord[];
/**
 * Calculate total spending from records
 */
declare function calculateTotal(records: SpendingRecord[]): number;
/**
 * Calculate spending by category
 */
declare function calculateByCategory(records: SpendingRecord[]): Record<string, number>;
/**
 * Calculate spending by day
 */
declare function calculateByDay(records: SpendingRecord[]): Record<string, number>;
/**
 * Calculate complete spending metrics
 */
declare function calculateSpending(records: SpendingRecord[], config: SpendingLimitConfig, referenceDate?: Date): SpendingCalculation;
/**
 * Calculate rollover amount from previous period
 */
declare function calculateRollover(previousPeriodSpent: number, config: SpendingLimitConfig): number;
/**
 * Calculate effective limit including rollover
 */
declare function calculateEffectiveLimit(config: SpendingLimitConfig, rolloverAmount?: number): number;
/**
 * Check if a purchase can be made within limit
 */
declare function canMakePurchase(purchaseAmount: number, currentSpent: number, limit: number, allowExceed?: boolean): {
    allowed: boolean;
    reason?: string;
};
/**
 * Calculate spending trend
 */
declare function calculateTrend(currentPeriodSpent: number, previousPeriodSpent: number): {
    direction: "up" | "down" | "stable";
    percentage: number;
};
/**
 * Generate spending forecast
 */
declare function generateForecast(records: SpendingRecord[], config: SpendingLimitConfig, forecastDays?: number): Array<{
    date: Date;
    projected: number;
    limit: number;
}>;
/**
 * Calculate savings opportunity
 */
declare function calculateSavingsOpportunity(records: SpendingRecord[], targetPercentage?: number): {
    potentialSavings: number;
    suggestions: string[];
};

/**
 * CSV Parser Utilities
 *
 * Functions for parsing and validating CSV data for bulk imports.
 */
/**
 * CSV parsing options
 */
interface CsvParseOptions {
    /** Field delimiter (default: ',') */
    delimiter?: string;
    /** Whether first row is header (default: true) */
    hasHeader?: boolean;
    /** Quote character (default: '"') */
    quote?: string;
    /** Whether to trim whitespace from values (default: true) */
    trim?: boolean;
    /** Whether to skip empty lines (default: true) */
    skipEmptyLines?: boolean;
    /** Maximum number of rows to parse (0 = unlimited) */
    maxRows?: number;
    /** Expected column names (for validation) */
    expectedColumns?: string[];
    /** Required column names (must be present) */
    requiredColumns?: string[];
}
/**
 * CSV parse result
 */
interface CsvParseResult<T = Record<string, string>> {
    /** Parsed data rows */
    data: T[];
    /** Column headers */
    headers: string[];
    /** Total rows parsed (including header) */
    totalRows: number;
    /** Errors encountered during parsing */
    errors: CsvParseError[];
    /** Whether parsing was successful */
    success: boolean;
    /** Raw parsed rows (before type conversion) */
    rawRows: string[][];
}
/**
 * CSV parse error
 */
interface CsvParseError {
    /** Row number (1-indexed) */
    row: number;
    /** Column number (1-indexed) */
    column?: number;
    /** Column name */
    columnName?: string;
    /** Error message */
    message: string;
    /** Error type */
    type: "parse" | "validation" | "missing_required" | "invalid_value";
    /** Raw value that caused the error */
    value?: string;
}
/**
 * Column mapping configuration
 */
interface ColumnMapping {
    /** Source column name (from CSV) */
    source: string;
    /** Target field name */
    target: string;
    /** Whether column is required */
    required?: boolean;
    /** Default value if empty */
    defaultValue?: unknown;
    /** Transform function */
    transform?: (value: string) => unknown;
    /** Validation function */
    validate?: (value: string) => boolean | string;
}
/**
 * Parse CSV string into rows and columns
 */
declare function parseCsv<T = Record<string, string>>(csvString: string, options?: CsvParseOptions): CsvParseResult<T>;
/**
 * Map CSV columns to target fields
 */
declare function mapColumns<T>(data: Record<string, string>[], mappings: ColumnMapping[]): {
    data: T[];
    errors: CsvParseError[];
};
/**
 * Generate CSV string from data
 */
declare function generateCsv<T extends Record<string, unknown>>(data: T[], options?: {
    columns?: string[];
    delimiter?: string;
    includeHeader?: boolean;
    quote?: string;
}): string;
/**
 * Common column mappings for employee import
 */
declare const EMPLOYEE_COLUMN_MAPPINGS: ColumnMapping[];
/**
 * Generate a sample CSV template
 */
declare function generateTemplate(mappings: ColumnMapping[], sampleData?: Record<string, string>[]): string;
/**
 * Validate CSV file size
 */
declare function validateFileSize(file: File | Blob, maxSizeBytes?: number): {
    valid: boolean;
    error?: string;
};
/**
 * Read CSV file content as string (browser-compatible)
 *
 * Note: This function requires browser environment with FileReader API.
 * For Node.js, use fs.readFileSync and then parseCsv.
 *
 * @example
 * ```tsx
 * // Browser usage
 * const handleFileUpload = async (file: File) => {
 *   const text = await readFileAsText(file);
 *   const result = parseCsv(text, { requiredColumns: ['email', 'name'] });
 *   return result;
 * };
 * ```
 */
declare function readFileAsText(file: Blob): Promise<string>;
/**
 * Read and parse CSV file (browser-compatible)
 *
 * Combines file reading and parsing in one operation.
 *
 * @example
 * ```tsx
 * const handleFileUpload = async (file: File) => {
 *   const result = await readAndParseCsv(file, {
 *     requiredColumns: ['email', 'name'],
 *   });
 *   if (result.success) {
 *     console.log('Parsed rows:', result.data);
 *   }
 * };
 * ```
 */
declare function readAndParseCsv<T = Record<string, string>>(file: Blob, options?: CsvParseOptions): Promise<CsvParseResult<T>>;

/**
 * B2B-specific Formatting Utilities
 *
 * Functions for formatting currencies, dates, numbers,
 * and other B2B-specific data.
 */
/**
 * Currency configuration
 */
interface CurrencyFormatOptions {
    /** Currency code (e.g., 'EUR', 'USD') */
    code?: string;
    /** Locale for formatting */
    locale?: string;
    /** Minimum fraction digits */
    minimumFractionDigits?: number;
    /** Maximum fraction digits */
    maximumFractionDigits?: number;
    /** Whether to show currency symbol */
    showSymbol?: boolean;
    /** Whether to show currency code */
    showCode?: boolean;
}
/**
 * Date format options
 */
interface DateFormatOptions {
    /** Date format style */
    style?: "short" | "medium" | "long" | "full";
    /** Include time */
    includeTime?: boolean;
    /** Time style */
    timeStyle?: "short" | "medium" | "long";
    /** Locale for formatting */
    locale?: string;
    /** Custom format pattern */
    pattern?: string;
}
/**
 * Number format options
 */
interface NumberFormatOptions {
    /** Locale for formatting */
    locale?: string;
    /** Minimum fraction digits */
    minimumFractionDigits?: number;
    /** Maximum fraction digits */
    maximumFractionDigits?: number;
    /** Use grouping separators */
    useGrouping?: boolean;
    /** Notation style */
    notation?: "standard" | "scientific" | "engineering" | "compact";
    /** Compact display */
    compactDisplay?: "short" | "long";
}
/**
 * Format currency amount
 */
declare function formatCurrency(amount: number, options?: CurrencyFormatOptions): string;
/**
 * Format currency with abbreviated large numbers
 */
declare function formatCurrencyCompact(amount: number, options?: CurrencyFormatOptions): string;
/**
 * Format date
 */
declare function formatDate(date: Date | string | number, options?: DateFormatOptions): string;
/**
 * Format relative date (e.g., "2 days ago", "in 3 hours")
 */
declare function formatRelativeDate(date: Date | string | number, locale?: string): string;
/**
 * Format number
 */
declare function formatNumber(value: number, options?: NumberFormatOptions): string;
/**
 * Format percentage
 */
declare function formatPercentage(value: number, options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSign?: boolean;
}): string;
/**
 * Format order/quote number
 */
declare function formatOrderNumber(number: string | number, prefix?: string): string;
/**
 * Format quote number
 */
declare function formatQuoteNumber(number: string | number, prefix?: string): string;
/**
 * Format invoice number
 */
declare function formatInvoiceNumber(number: string | number, prefix?: string): string;
/**
 * Format phone number
 */
declare function formatPhoneNumber(phone: string, countryCode?: string): string;
/**
 * Format address for display
 */
declare function formatAddress(address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}, options?: {
    multiline?: boolean;
    separator?: string;
}): string;
/**
 * Format VAT/Tax ID
 */
declare function formatVatId(vatId: string, countryCode?: string): string;
/**
 * Format file size
 */
declare function formatFileSize(bytes: number): string;
/**
 * Format quantity with unit
 */
declare function formatQuantity(quantity: number, unit?: string, options?: NumberFormatOptions): string;
/**
 * Format duration (in minutes)
 */
declare function formatDuration(minutes: number, options?: {
    short?: boolean;
}): string;
/**
 * Truncate text with ellipsis
 */
declare function truncateText(text: string, maxLength: number, options?: {
    ellipsis?: string;
    wordBoundary?: boolean;
}): string;
/**
 * Format company name (capitalize appropriately)
 */
declare function formatCompanyName(name: string): string;
/**
 * Format payment terms for display
 */
declare function formatPaymentTerms(terms: string): string;

export { type ApprovalRule, type ColumnMapping, type CsvParseError, type CsvParseOptions, type CsvParseResult, type CurrencyFormatOptions, DEFAULT_APPROVAL_RULES, type DateFormatOptions, EMPLOYEE_COLUMN_MAPPINGS, type NumberFormatOptions, type RuleAction, type RuleActionType, type RuleCondition, type RuleConditionType, type RuleEvaluationContext, type RuleEvaluationResult, type SpendingCalculation, type SpendingLimitConfig, type SpendingPeriodType, type SpendingRecord, calculateByCategory, calculateByDay, calculateEffectiveLimit, calculateRollover, calculateSavingsOpportunity, calculateSpending, calculateTotal, calculateTrend, canAutoApprove, canMakePurchase, createAmountRule, createDepartmentRule, createRoleRule, daysBetween, evaluateCondition, evaluateRule, evaluateRules, filterByPeriod, formatAddress, formatCompanyName, formatCurrency, formatCurrencyCompact, formatDate, formatDuration, formatFileSize, formatInvoiceNumber, formatNumber, formatOrderNumber, formatPaymentTerms, formatPercentage, formatPhoneNumber, formatQuantity, formatQuoteNumber, formatRelativeDate, formatVatId, generateCsv, generateForecast, generateTemplate, getPeriodDates, getRequiredApprovers, mapColumns, parseCsv, readAndParseCsv, readFileAsText, requiresApproval, shouldReject, truncateText, validateFileSize };
