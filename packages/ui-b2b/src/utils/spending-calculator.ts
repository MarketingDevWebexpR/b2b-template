/**
 * Spending Calculator Utilities
 *
 * Functions for calculating spending limits, usage, and projections.
 */

/**
 * Spending period type
 */
export type SpendingPeriodType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

/**
 * Spending record
 */
export interface SpendingRecord {
  amount: number;
  date: Date;
  category?: string;
  reference?: string;
}

/**
 * Spending limit configuration
 */
export interface SpendingLimitConfig {
  maxAmount: number;
  period: SpendingPeriodType;
  softLimitPercentage?: number; // e.g., 75 for 75%
  hardLimitPercentage?: number; // e.g., 100 for 100%
  rollover?: boolean; // Whether unused amount rolls over
  rolloverPercentage?: number; // Max percentage to roll over
}

/**
 * Spending calculation result
 */
export interface SpendingCalculation {
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
export function getPeriodDates(
  period: SpendingPeriodType,
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  const date = new Date(referenceDate);

  switch (period) {
    case "daily": {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      end.setMilliseconds(-1);
      return { start, end };
    }

    case "weekly": {
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      end.setMilliseconds(-1);
      return { start, end };
    }

    case "monthly": {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }

    case "quarterly": {
      const quarter = Math.floor(date.getMonth() / 3);
      const start = new Date(date.getFullYear(), quarter * 3, 1);
      const end = new Date(date.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      return { start, end };
    }

    case "yearly": {
      const start = new Date(date.getFullYear(), 0, 1);
      const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }

    default:
      throw new Error(`Unknown period type: ${period}`);
  }
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Filter spending records by date range
 */
export function filterByPeriod(
  records: SpendingRecord[],
  start: Date,
  end: Date
): SpendingRecord[] {
  return records.filter(
    (record) => record.date >= start && record.date <= end
  );
}

/**
 * Calculate total spending from records
 */
export function calculateTotal(records: SpendingRecord[]): number {
  return records.reduce((sum, record) => sum + record.amount, 0);
}

/**
 * Calculate spending by category
 */
export function calculateByCategory(
  records: SpendingRecord[]
): Record<string, number> {
  const byCategory: Record<string, number> = {};

  for (const record of records) {
    const category = record.category ?? "uncategorized";
    byCategory[category] = (byCategory[category] ?? 0) + record.amount;
  }

  return byCategory;
}

/**
 * Calculate spending by day
 */
export function calculateByDay(
  records: SpendingRecord[]
): Record<string, number> {
  const byDay: Record<string, number> = {};

  for (const record of records) {
    const isoString = record.date.toISOString();
    const day = isoString.split("T")[0] ?? isoString.substring(0, 10);
    byDay[day] = (byDay[day] ?? 0) + record.amount;
  }

  return byDay;
}

/**
 * Calculate complete spending metrics
 */
export function calculateSpending(
  records: SpendingRecord[],
  config: SpendingLimitConfig,
  referenceDate: Date = new Date()
): SpendingCalculation {
  const { start: periodStart, end: periodEnd } = getPeriodDates(
    config.period,
    referenceDate
  );

  // Filter records for current period
  const periodRecords = filterByPeriod(records, periodStart, periodEnd);
  const totalSpent = calculateTotal(periodRecords);

  // Calculate remaining
  const remaining = Math.max(0, config.maxAmount - totalSpent);

  // Calculate percentage
  const percentage =
    config.maxAmount > 0 ? (totalSpent / config.maxAmount) * 100 : 0;

  // Check limits
  const softLimitPercentage = config.softLimitPercentage ?? 75;
  const hardLimitPercentage = config.hardLimitPercentage ?? 100;
  const softLimitExceeded = percentage >= softLimitPercentage;
  const hardLimitExceeded = percentage >= hardLimitPercentage;

  // Calculate days
  const now = new Date(referenceDate);
  const daysInPeriod = daysBetween(periodStart, periodEnd);
  const daysElapsed = Math.max(1, daysBetween(periodStart, now));
  const daysRemaining = Math.max(0, daysBetween(now, periodEnd));

  // Calculate averages and projections
  const averageDaily = totalSpent / daysElapsed;
  const projected = averageDaily * daysInPeriod;
  const onTrack = projected <= config.maxAmount;

  // Calculate recommended daily budget
  const recommendedDaily =
    daysRemaining > 0 ? remaining / daysRemaining : 0;

  return {
    totalSpent,
    remaining,
    percentage,
    softLimitExceeded,
    hardLimitExceeded,
    periodStart,
    periodEnd,
    daysRemaining,
    averageDaily,
    projected,
    onTrack,
    recommendedDaily,
  };
}

/**
 * Calculate rollover amount from previous period
 */
export function calculateRollover(
  previousPeriodSpent: number,
  config: SpendingLimitConfig
): number {
  if (!config.rollover) return 0;

  const unused = Math.max(0, config.maxAmount - previousPeriodSpent);
  const rolloverPercentage = config.rolloverPercentage ?? 100;

  return unused * (rolloverPercentage / 100);
}

/**
 * Calculate effective limit including rollover
 */
export function calculateEffectiveLimit(
  config: SpendingLimitConfig,
  rolloverAmount: number = 0
): number {
  return config.maxAmount + rolloverAmount;
}

/**
 * Check if a purchase can be made within limit
 */
export function canMakePurchase(
  purchaseAmount: number,
  currentSpent: number,
  limit: number,
  allowExceed: boolean = false
): { allowed: boolean; reason?: string } {
  if (allowExceed) {
    return { allowed: true };
  }

  const newTotal = currentSpent + purchaseAmount;

  if (newTotal > limit) {
    return {
      allowed: false,
      reason: `Purchase would exceed spending limit. Current: ${currentSpent}, Purchase: ${purchaseAmount}, Limit: ${limit}`,
    };
  }

  return { allowed: true };
}

/**
 * Calculate spending trend
 */
export function calculateTrend(
  currentPeriodSpent: number,
  previousPeriodSpent: number
): { direction: "up" | "down" | "stable"; percentage: number } {
  if (previousPeriodSpent === 0) {
    return {
      direction: currentPeriodSpent > 0 ? "up" : "stable",
      percentage: currentPeriodSpent > 0 ? 100 : 0,
    };
  }

  const change =
    ((currentPeriodSpent - previousPeriodSpent) / previousPeriodSpent) * 100;

  let direction: "up" | "down" | "stable";
  if (Math.abs(change) < 1) {
    direction = "stable";
  } else if (change > 0) {
    direction = "up";
  } else {
    direction = "down";
  }

  return {
    direction,
    percentage: Math.abs(change),
  };
}

/**
 * Generate spending forecast
 */
export function generateForecast(
  records: SpendingRecord[],
  config: SpendingLimitConfig,
  forecastDays: number = 30
): Array<{ date: Date; projected: number; limit: number }> {
  const { start: periodStart } = getPeriodDates(config.period);
  const periodRecords = filterByPeriod(
    records,
    periodStart,
    new Date()
  );

  const byDay = calculateByDay(periodRecords);
  const days = Object.keys(byDay);

  // Calculate average daily spending
  const total = calculateTotal(periodRecords);
  const avgDaily = days.length > 0 ? total / days.length : 0;

  // Generate forecast
  const forecast: Array<{ date: Date; projected: number; limit: number }> = [];
  let cumulative = total;

  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    cumulative += avgDaily;

    forecast.push({
      date,
      projected: cumulative,
      limit: config.maxAmount,
    });
  }

  return forecast;
}

/**
 * Calculate savings opportunity
 */
export function calculateSavingsOpportunity(
  records: SpendingRecord[],
  targetPercentage: number = 10
): { potentialSavings: number; suggestions: string[] } {
  const byCategory = calculateByCategory(records);
  const total = calculateTotal(records);
  const targetSavings = total * (targetPercentage / 100);

  const suggestions: string[] = [];
  let potentialSavings = 0;

  // Sort categories by spending (highest first)
  const sortedCategories = Object.entries(byCategory).sort(
    ([, a], [, b]) => b - a
  );

  for (const [category, amount] of sortedCategories) {
    const categoryPercentage = (amount / total) * 100;
    if (categoryPercentage > 20) {
      const savingAmount = amount * 0.1; // 10% reduction suggestion
      potentialSavings += savingAmount;
      suggestions.push(
        `Reduce "${category}" spending by 10% to save ${savingAmount.toFixed(2)}`
      );
    }

    if (potentialSavings >= targetSavings) break;
  }

  return {
    potentialSavings,
    suggestions,
  };
}
