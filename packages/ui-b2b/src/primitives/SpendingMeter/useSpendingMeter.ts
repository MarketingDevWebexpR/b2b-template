import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CurrencyConfig,
  SpendingLimit,
  SpendingMeterState,
  SpendingThreshold,
  ThresholdLevel,
  UseSpendingMeterOptions,
  UseSpendingMeterReturn,
} from "./types";
import { DEFAULT_CURRENCY, DEFAULT_THRESHOLDS } from "./types";

/**
 * Default currency formatter
 */
function defaultFormatCurrency(amount: number, currency: CurrencyConfig): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  // Format the number
  const parts = absAmount.toFixed(currency.decimals).split(".");
  const integerPart = (parts[0] ?? "0").replace(
    /\B(?=(\d{3})+(?!\d))/g,
    currency.thousandsSeparator
  );
  const decimalPart = parts[1];

  const formattedNumber = decimalPart
    ? `${integerPart}${currency.decimalSeparator}${decimalPart}`
    : integerPart;

  // Add symbol
  if (currency.symbolPosition === "before") {
    return `${sign}${currency.symbol}${formattedNumber}`;
  }
  return `${sign}${formattedNumber} ${currency.symbol}`;
}

/**
 * Calculate days between two dates
 */
function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Get threshold level for a percentage
 */
function getThresholdLevelForPercentage(
  percentage: number,
  thresholds: SpendingThreshold[]
): ThresholdLevel {
  // Sort thresholds by percentage descending
  const sorted = [...thresholds].sort((a, b) => b.percentage - a.percentage);

  for (const threshold of sorted) {
    if (percentage >= threshold.percentage) {
      return threshold.level;
    }
  }

  return "safe";
}

/**
 * Get active threshold for a percentage
 */
function getActiveThreshold(
  percentage: number,
  thresholds: SpendingThreshold[]
): SpendingThreshold {
  const level = getThresholdLevelForPercentage(percentage, thresholds);
  const found = thresholds.find((t) => t.level === level);
  if (found) return found;

  // Fallback to first threshold or create a default
  const first = thresholds[0];
  return first ?? { level: "safe", percentage: 0, label: "Safe", color: "#22c55e" };
}

/**
 * Hook for spending meter state management
 *
 * Provides budget tracking with threshold calculations,
 * projections, and warning states.
 *
 * @example
 * ```tsx
 * const { state, addSpending, canSpend } = useSpendingMeter({
 *   limit: employeeSpendingLimit,
 *   onThresholdChange: (level) => {
 *     if (level === 'danger') {
 *       showWarningToast('Approaching spending limit!');
 *     }
 *   },
 *   onLimitExceeded: () => {
 *     showErrorToast('Spending limit exceeded!');
 *   },
 * });
 *
 * // Display gauge
 * <ProgressBar
 *   value={state.displayPercentage}
 *   color={state.activeThreshold.color}
 * />
 * <p>{state.formattedSpent} / {state.formattedLimit}</p>
 * <p>{state.formattedRemaining} remaining</p>
 *
 * // Before making a purchase
 * if (canSpend(orderTotal)) {
 *   addSpending(orderTotal);
 * }
 * ```
 */
export function useSpendingMeter(
  options: UseSpendingMeterOptions
): UseSpendingMeterReturn {
  const {
    limit: initialLimit,
    warningThreshold = 75,
    dangerThreshold = 90,
    onThresholdChange,
    onLimitExceeded,
    onSoftLimitExceeded,
    formatCurrency = defaultFormatCurrency,
  } = options;

  const [limit, setLimit] = useState<SpendingLimit>(initialLimit);
  const previousThresholdRef = useRef<ThresholdLevel | null>(null);

  // Build thresholds
  const thresholds = useMemo((): SpendingThreshold[] => {
    if (limit.thresholds && limit.thresholds.length > 0) {
      return limit.thresholds;
    }

    return [
      { level: "safe", percentage: 0, label: "On Track", color: "#22c55e" },
      {
        level: "warning",
        percentage: warningThreshold,
        label: "Approaching Limit",
        color: "#f59e0b",
      },
      {
        level: "danger",
        percentage: dangerThreshold,
        label: "Near Limit",
        color: "#ef4444",
      },
      {
        level: "exceeded",
        percentage: 100,
        label: "Limit Exceeded",
        color: "#dc2626",
      },
    ];
  }, [limit.thresholds, warningThreshold, dangerThreshold]);

  // Calculate state
  const state: SpendingMeterState = useMemo(() => {
    const spent = limit.spentAmount;
    const maxAmount = limit.maxAmount;
    const remaining = Math.max(0, maxAmount - spent);
    const percentage = maxAmount > 0 ? (spent / maxAmount) * 100 : 0;
    const displayPercentage = Math.min(100, percentage);

    const thresholdLevel = getThresholdLevelForPercentage(percentage, thresholds);
    const activeThreshold = getActiveThreshold(percentage, thresholds);

    const isExceeded = spent > maxAmount;
    const isSoftLimitExceeded = limit.softLimit
      ? spent > limit.softLimit
      : percentage >= warningThreshold;
    const isHardLimitExceeded = limit.hardLimit
      ? spent > limit.hardLimit
      : isExceeded;

    const currency = limit.currency ?? DEFAULT_CURRENCY;
    const formattedSpent = formatCurrency(spent, currency);
    const formattedRemaining = formatCurrency(remaining, currency);
    const formattedLimit = formatCurrency(maxAmount, currency);

    // Period calculations
    const now = new Date();
    const daysInPeriod = daysBetween(limit.periodStart, limit.periodEnd);
    const daysElapsed = Math.max(1, daysBetween(limit.periodStart, now));
    const daysRemaining = Math.max(0, daysBetween(now, limit.periodEnd));

    const averageDailySpending = spent / daysElapsed;
    const projectedSpending = averageDailySpending * daysInPeriod;
    const isOnTrack = projectedSpending <= maxAmount;

    return {
      limit,
      spent,
      remaining,
      percentage,
      displayPercentage,
      thresholdLevel,
      activeThreshold,
      thresholds,
      isExceeded,
      isSoftLimitExceeded,
      isHardLimitExceeded,
      formattedSpent,
      formattedRemaining,
      formattedLimit,
      daysRemaining,
      averageDailySpending,
      projectedSpending,
      isOnTrack,
    };
  }, [limit, thresholds, warningThreshold, formatCurrency]);

  // Track threshold changes and trigger callbacks
  useEffect(() => {
    const currentLevel = state.thresholdLevel;

    if (previousThresholdRef.current !== null) {
      if (previousThresholdRef.current !== currentLevel) {
        onThresholdChange?.(currentLevel, state);
      }
    }

    previousThresholdRef.current = currentLevel;
  }, [state.thresholdLevel, state, onThresholdChange]);

  // Track limit exceeded
  useEffect(() => {
    if (state.isExceeded) {
      onLimitExceeded?.(state);
    }
  }, [state.isExceeded, state, onLimitExceeded]);

  // Track soft limit exceeded
  useEffect(() => {
    if (state.isSoftLimitExceeded) {
      onSoftLimitExceeded?.(state);
    }
  }, [state.isSoftLimitExceeded, state, onSoftLimitExceeded]);

  // Actions
  const setSpent = useCallback((amount: number) => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: Math.max(0, amount),
    }));
  }, []);

  const addSpending = useCallback((amount: number) => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: Math.max(0, prev.spentAmount + amount),
    }));
  }, []);

  const updateLimit = useCallback((updates: Partial<SpendingLimit>) => {
    setLimit((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetSpending = useCallback(() => {
    setLimit((prev) => ({
      ...prev,
      spentAmount: 0,
    }));
    previousThresholdRef.current = null;
  }, []);

  // Query helpers
  const canSpend = useCallback(
    (amount: number): boolean => {
      if (!limit.isActive) return true;
      if (limit.allowExceed) return true;

      const newTotal = limit.spentAmount + amount;

      if (limit.hardLimit && newTotal > limit.hardLimit) {
        return false;
      }

      return newTotal <= limit.maxAmount;
    },
    [limit]
  );

  const getSpendableAmount = useCallback((): number => {
    if (!limit.isActive || limit.allowExceed) {
      return Infinity;
    }

    const maxAllowed = limit.hardLimit ?? limit.maxAmount;
    return Math.max(0, maxAllowed - limit.spentAmount);
  }, [limit]);

  const wouldTriggerWarning = useCallback(
    (amount: number): boolean => {
      const newPercentage =
        ((limit.spentAmount + amount) / limit.maxAmount) * 100;
      return newPercentage >= warningThreshold;
    },
    [limit, warningThreshold]
  );

  const wouldExceedLimit = useCallback(
    (amount: number): boolean => {
      return limit.spentAmount + amount > limit.maxAmount;
    },
    [limit]
  );

  // Formatting helpers
  const formatAmount = useCallback(
    (amount: number): string => {
      return formatCurrency(amount, limit.currency ?? DEFAULT_CURRENCY);
    },
    [formatCurrency, limit.currency]
  );

  const getPercentage = useCallback(
    (amount: number): number => {
      return limit.maxAmount > 0 ? (amount / limit.maxAmount) * 100 : 0;
    },
    [limit.maxAmount]
  );

  const getThresholdLevel = useCallback(
    (percentage: number): ThresholdLevel => {
      return getThresholdLevelForPercentage(percentage, thresholds);
    },
    [thresholds]
  );

  return {
    state,

    // Actions
    setSpent,
    addSpending,
    updateLimit,
    resetSpending,

    // Query helpers
    canSpend,
    getSpendableAmount,
    wouldTriggerWarning,
    wouldExceedLimit,

    // Formatting helpers
    formatAmount,
    getPercentage,
    getThresholdLevel,
  };
}
