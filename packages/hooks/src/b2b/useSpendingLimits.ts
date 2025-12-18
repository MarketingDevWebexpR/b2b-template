/**
 * Spending Limits Hook
 *
 * Provides access to B2B spending limits and budget tracking.
 */

import { useState, useMemo, useCallback } from "react";
import type { SpendingLimit, SpendingPeriod } from "@maison/types";
import type { ICommerceClient } from "@maison/api-client";
import { useApiQuery } from "../api/useApiQuery";

/**
 * Spending summary for a specific period
 */
export interface SpendingSummary {
  /** Spending limit for the period */
  limit: number;
  /** Amount spent in current period */
  spent: number;
  /** Remaining budget */
  remaining: number;
  /** Percentage of limit used */
  percentageUsed: number;
  /** Whether limit is exceeded */
  isExceeded: boolean;
  /** Whether approaching limit (warning threshold) */
  isWarning: boolean;
  /** Period start date */
  periodStart: string;
  /** Period end date */
  periodEnd: string;
}

/**
 * Spending hook result
 */
export interface UseSpendingLimitsResult {
  /** All spending limits for the employee */
  limits: SpendingLimit[];
  /** Spending summaries by period */
  summaries: {
    perOrder: SpendingSummary | null;
    daily: SpendingSummary | null;
    weekly: SpendingSummary | null;
    monthly: SpendingSummary | null;
  };
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Check if an amount would exceed limits */
  canSpend: (amount: number) => { allowed: boolean; reason?: string };
  /** Get spending history */
  getHistory: (period: SpendingPeriod) => Promise<SpendingHistoryEntry[]>;
  /** Refresh spending data */
  refresh: () => void;
}

/**
 * Spending history entry
 */
export interface SpendingHistoryEntry {
  /** Entry ID */
  id: string;
  /** Order/quote ID */
  entityId: string;
  /** Entity type */
  entityType: "order" | "quote";
  /** Amount spent */
  amount: number;
  /** Timestamp */
  createdAt: string;
  /** Description */
  description?: string;
}

/**
 * Hook for managing B2B spending limits
 *
 * @param api - API client instance
 * @param employeeId - Employee ID (optional, uses current employee)
 * @returns Spending limits state and utilities
 *
 * @example
 * ```typescript
 * const { summaries, canSpend, refresh } = useSpendingLimits(api);
 *
 * // Check before placing order
 * const { allowed, reason } = canSpend(orderTotal);
 * if (!allowed) {
 *   showError(reason);
 * }
 *
 * // Display spending meter
 * const monthly = summaries.monthly;
 * if (monthly) {
 *   <SpendingMeter percentage={monthly.percentageUsed} warning={monthly.isWarning} />
 * }
 * ```
 */
export function useSpendingLimits(
  api: ICommerceClient,
  employeeId?: string
): UseSpendingLimitsResult {
  // Query for spending limits
  const {
    data: limits,
    isLoading,
    error,
    refetch,
  } = useApiQuery<SpendingLimit[]>(
    ["spending-limits", employeeId],
    async () => {
      if (!api?.b2b?.spending) {
        return [];
      }
      const context = api.getB2BContext?.();
      const targetEmployeeId = employeeId ?? context?.employeeId;
      if (!targetEmployeeId) {
        return [];
      }
      // Try getLimits first, fall back to getLimit
      const spendingApi = api.b2b.spending as { getLimits?: (id: string) => Promise<unknown>; getLimit?: (id: string) => Promise<unknown> };
      const result = await (spendingApi.getLimits ?? spendingApi.getLimit)?.(targetEmployeeId);
      if (!result) return [];
      // Normalize to array
      return Array.isArray(result) ? result : (result as { items?: unknown[] })?.items ?? [result].filter(Boolean) as SpendingLimit[];
    },
    {
      enabled: !!api?.b2b?.spending,
      staleTime: 60000, // 1 minute
    }
  );

  // Helper to find limit by period
  const findLimitByPeriod = useCallback(
    (period: SpendingPeriod): SpendingLimit | null => {
      return (limits ?? []).find((l) => l.period === period && l.isActive) ?? null;
    },
    [limits]
  );

  // Helper to create summary from a SpendingLimit
  const createSummaryFromLimit = useCallback(
    (limit: SpendingLimit | null): SpendingSummary | null => {
      if (!limit) {
        return null;
      }

      return {
        limit: limit.limitAmount,
        spent: limit.currentSpending,
        remaining: limit.remainingAmount,
        percentageUsed: limit.percentageUsed,
        isExceeded: limit.isExceeded,
        isWarning: limit.isWarning,
        periodStart: limit.lastResetAt,
        periodEnd: limit.nextResetAt,
      };
    },
    []
  );

  // Calculate summaries from limits
  const summaries = useMemo(() => {
    return {
      perOrder: createSummaryFromLimit(findLimitByPeriod("per_order")),
      daily: createSummaryFromLimit(findLimitByPeriod("daily")),
      weekly: createSummaryFromLimit(findLimitByPeriod("weekly")),
      monthly: createSummaryFromLimit(findLimitByPeriod("monthly")),
    };
  }, [findLimitByPeriod, createSummaryFromLimit]);

  // Check if amount can be spent
  const canSpend = useCallback(
    (amount: number): { allowed: boolean; reason?: string } => {
      if (!limits || limits.length === 0) {
        return { allowed: true }; // No limits configured
      }

      // Check per-order limit
      const perOrderLimit = findLimitByPeriod("per_order");
      if (perOrderLimit && amount > perOrderLimit.limitAmount) {
        return {
          allowed: false,
          reason: `Order amount (€${amount.toFixed(2)}) exceeds per-order limit (€${perOrderLimit.limitAmount.toFixed(2)})`,
        };
      }

      // Check daily limit
      const dailyLimit = findLimitByPeriod("daily");
      if (dailyLimit && dailyLimit.currentSpending + amount > dailyLimit.limitAmount) {
        return {
          allowed: false,
          reason: `This order would exceed your daily spending limit (€${dailyLimit.limitAmount.toFixed(2)})`,
        };
      }

      // Check weekly limit
      const weeklyLimit = findLimitByPeriod("weekly");
      if (weeklyLimit && weeklyLimit.currentSpending + amount > weeklyLimit.limitAmount) {
        return {
          allowed: false,
          reason: `This order would exceed your weekly spending limit (€${weeklyLimit.limitAmount.toFixed(2)})`,
        };
      }

      // Check monthly limit
      const monthlyLimit = findLimitByPeriod("monthly");
      if (monthlyLimit && monthlyLimit.currentSpending + amount > monthlyLimit.limitAmount) {
        return {
          allowed: false,
          reason: `This order would exceed your monthly spending limit (€${monthlyLimit.limitAmount.toFixed(2)})`,
        };
      }

      return { allowed: true };
    },
    [limits, findLimitByPeriod]
  );

  // Get spending history
  const getHistory = useCallback(
    async (period: SpendingPeriod): Promise<SpendingHistoryEntry[]> => {
      if (!api?.b2b?.spending) {
        return [];
      }
      const context = api.getB2BContext?.();
      const targetEmployeeId = employeeId ?? context?.employeeId;
      if (!targetEmployeeId) {
        return [];
      }
      // Type assertion for getHistory method which may not be in interface
      const spendingApi = api.b2b.spending as { getHistory?: (employeeId: string, period: SpendingPeriod) => Promise<SpendingHistoryEntry[]> };
      if (!spendingApi.getHistory) {
        return [];
      }
      return spendingApi.getHistory(targetEmployeeId, period);
    },
    [api, employeeId]
  );

  return {
    limits: limits ?? [],
    summaries,
    isLoading,
    error,
    canSpend,
    getHistory,
    refresh: refetch,
  };
}
