/**
 * SpendingMeter Types
 *
 * Type definitions for budget usage gauge component
 * with threshold calculations and warning states.
 */

/**
 * Spending threshold level
 */
export type ThresholdLevel = "safe" | "warning" | "danger" | "exceeded";

/**
 * Spending period type
 */
export type SpendingPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  /** Currency code (e.g., 'EUR', 'USD') */
  code: string;
  /** Currency symbol (e.g., '$', '???') */
  symbol: string;
  /** Decimal places */
  decimals: number;
  /** Symbol position */
  symbolPosition: "before" | "after";
  /** Thousands separator */
  thousandsSeparator: string;
  /** Decimal separator */
  decimalSeparator: string;
}

/**
 * Spending threshold configuration
 */
export interface SpendingThreshold {
  /** Threshold level name */
  level: ThresholdLevel;
  /** Percentage at which this threshold starts (0-100) */
  percentage: number;
  /** Custom label for this threshold */
  label?: string;
  /** Color associated with this threshold */
  color?: string;
}

/**
 * Spending limit configuration
 */
export interface SpendingLimit {
  /** Unique limit ID */
  id: string;
  /** Limit name/label */
  name: string;
  /** Maximum spending amount */
  maxAmount: number;
  /** Current spent amount */
  spentAmount: number;
  /** Spending period */
  period: SpendingPeriod;
  /** Period start date */
  periodStart: Date;
  /** Period end date */
  periodEnd: Date;
  /** Currency configuration */
  currency: CurrencyConfig;
  /** Custom thresholds */
  thresholds?: SpendingThreshold[];
  /** Whether this limit is active */
  isActive: boolean;
  /** Whether to allow exceeding the limit */
  allowExceed: boolean;
  /** Soft limit (warning threshold) */
  softLimit?: number;
  /** Hard limit (absolute maximum) */
  hardLimit?: number;
}

/**
 * Spending meter state
 */
export interface SpendingMeterState {
  /** Current spending limit configuration */
  limit: SpendingLimit;
  /** Amount spent */
  spent: number;
  /** Remaining amount */
  remaining: number;
  /** Usage percentage (0-100+) */
  percentage: number;
  /** Capped percentage for display (0-100) */
  displayPercentage: number;
  /** Current threshold level */
  thresholdLevel: ThresholdLevel;
  /** Active threshold configuration */
  activeThreshold: SpendingThreshold;
  /** All thresholds for display */
  thresholds: SpendingThreshold[];
  /** Whether limit is exceeded */
  isExceeded: boolean;
  /** Whether soft limit is exceeded */
  isSoftLimitExceeded: boolean;
  /** Whether hard limit is exceeded */
  isHardLimitExceeded: boolean;
  /** Formatted spent amount */
  formattedSpent: string;
  /** Formatted remaining amount */
  formattedRemaining: string;
  /** Formatted limit amount */
  formattedLimit: string;
  /** Days remaining in period */
  daysRemaining: number;
  /** Average daily spending */
  averageDailySpending: number;
  /** Projected end-of-period spending */
  projectedSpending: number;
  /** Whether on track to stay under limit */
  isOnTrack: boolean;
}

/**
 * Options for useSpendingMeter hook
 */
export interface UseSpendingMeterOptions {
  /** Spending limit configuration */
  limit: SpendingLimit;
  /** Warning threshold percentage (default: 75) */
  warningThreshold?: number;
  /** Danger threshold percentage (default: 90) */
  dangerThreshold?: number;
  /** Callback when threshold level changes */
  onThresholdChange?: (level: ThresholdLevel, state: SpendingMeterState) => void;
  /** Callback when limit is exceeded */
  onLimitExceeded?: (state: SpendingMeterState) => void;
  /** Callback when soft limit is exceeded */
  onSoftLimitExceeded?: (state: SpendingMeterState) => void;
  /** Custom currency formatter */
  formatCurrency?: (amount: number, currency: CurrencyConfig) => string;
}

/**
 * Return type for useSpendingMeter hook
 */
export interface UseSpendingMeterReturn {
  /** Current state */
  state: SpendingMeterState;

  // Actions
  /** Update spent amount */
  setSpent: (amount: number) => void;
  /** Add to spent amount */
  addSpending: (amount: number) => void;
  /** Update limit configuration */
  updateLimit: (limit: Partial<SpendingLimit>) => void;
  /** Reset spending to zero */
  resetSpending: () => void;

  // Query helpers
  /** Check if an amount can be spent */
  canSpend: (amount: number) => boolean;
  /** Get amount that can still be spent */
  getSpendableAmount: () => number;
  /** Check if spending amount would trigger warning */
  wouldTriggerWarning: (amount: number) => boolean;
  /** Check if spending amount would exceed limit */
  wouldExceedLimit: (amount: number) => boolean;

  // Formatting helpers
  /** Format an amount with currency */
  formatAmount: (amount: number) => string;
  /** Get percentage for a given amount */
  getPercentage: (amount: number) => number;
  /** Get threshold level for a given percentage */
  getThresholdLevel: (percentage: number) => ThresholdLevel;
}

/**
 * Default thresholds
 */
export const DEFAULT_THRESHOLDS: SpendingThreshold[] = [
  { level: "safe", percentage: 0, label: "On Track", color: "#22c55e" },
  { level: "warning", percentage: 75, label: "Approaching Limit", color: "#f59e0b" },
  { level: "danger", percentage: 90, label: "Near Limit", color: "#ef4444" },
  { level: "exceeded", percentage: 100, label: "Limit Exceeded", color: "#dc2626" },
];

/**
 * Default currency configuration (EUR)
 */
export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "\u20AC",
  decimals: 2,
  symbolPosition: "after",
  thousandsSeparator: " ",
  decimalSeparator: ",",
};
