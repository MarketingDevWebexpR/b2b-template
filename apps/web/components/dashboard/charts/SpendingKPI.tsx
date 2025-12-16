'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import type { DateRangePeriod } from './DateRangeSelector';

/**
 * Spending data structure for KPI calculations
 */
export interface SpendingData {
  /** Total spending for current period */
  currentTotal: number;
  /** Total spending for previous period (same duration) */
  previousTotal: number;
  /** Budget limit (optional) */
  budgetLimit?: number;
  /** Currency code */
  currency?: string;
}

export interface SpendingKPIProps {
  /** Spending data for calculations */
  data: SpendingData;
  /** Current selected period */
  period: DateRangePeriod;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Icon for trend up
 */
const TrendUpIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

/**
 * Icon for trend down
 */
const TrendDownIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
    />
  </svg>
);

/**
 * Icon for neutral trend
 */
const TrendNeutralIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h14"
    />
  </svg>
);

/**
 * Get period comparison label
 */
function getPeriodComparisonLabel(period: DateRangePeriod): string {
  const labels: Record<DateRangePeriod, string> = {
    '7d': 'vs semaine precedente',
    '30d': 'vs mois precedent',
    '90d': 'vs trimestre precedent',
    '12m': 'vs annee precedente',
  };
  return labels[period];
}

/**
 * Determine budget status color
 */
function getBudgetStatusColor(percentage: number): {
  bg: string;
  text: string;
  bar: string;
  status: 'good' | 'warning' | 'danger';
} {
  if (percentage >= 100) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      bar: 'bg-red-500',
      status: 'danger',
    };
  }
  if (percentage >= 80) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
      status: 'warning',
    };
  }
  return {
    bg: 'bg-green-50',
    text: 'text-green-700',
    bar: 'bg-green-500',
    status: 'good',
  };
}

/**
 * SpendingKPI Component
 *
 * Displays key spending metrics: total, evolution vs previous period,
 * and budget consumption with visual indicators.
 *
 * @example
 * ```tsx
 * <SpendingKPI
 *   data={{
 *     currentTotal: 12500,
 *     previousTotal: 11000,
 *     budgetLimit: 20000,
 *   }}
 *   period="30d"
 * />
 * ```
 */
export function SpendingKPI({
  data,
  period,
  isLoading = false,
  className,
}: SpendingKPIProps) {
  const { currentTotal, previousTotal, budgetLimit, currency = 'EUR' } = data;

  // Calculate evolution percentage
  const evolution = useMemo(() => {
    if (previousTotal === 0) return { value: 0, isPositive: true, isNeutral: true };
    const diff = currentTotal - previousTotal;
    const percentage = (diff / previousTotal) * 100;
    return {
      value: Math.abs(percentage),
      isPositive: diff >= 0,
      isNeutral: Math.abs(percentage) < 0.5,
    };
  }, [currentTotal, previousTotal]);

  // Calculate budget consumption
  const budgetConsumption = useMemo(() => {
    if (!budgetLimit || budgetLimit <= 0) return null;
    const percentage = (currentTotal / budgetLimit) * 100;
    const remaining = budgetLimit - currentTotal;
    return {
      percentage: Math.min(percentage, 100),
      remaining,
      isOverBudget: currentTotal > budgetLimit,
      ...getBudgetStatusColor(percentage),
    };
  }, [currentTotal, budgetLimit]);

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-neutral-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-neutral-100 rounded w-24 mb-2" />
            <div className="h-8 bg-neutral-100 rounded w-32 mb-2" />
            <div className="h-3 bg-neutral-100 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}
      role="region"
      aria-label="Indicateurs cles de depenses"
    >
      {/* Total Spending KPI */}
      <article
        className="bg-white rounded-lg border border-neutral-200 p-4"
        aria-labelledby="kpi-total-label"
      >
        <p
          id="kpi-total-label"
          className="font-sans text-caption text-neutral-500 mb-1"
        >
          Total depenses
        </p>
        <p className="font-sans text-xl font-semibold text-neutral-900">
          {formatCurrency(currentTotal, currency)}
        </p>
        <p className="font-sans text-caption text-neutral-500 mt-1">
          {period === '7d' && 'Cette semaine'}
          {period === '30d' && 'Ce mois'}
          {period === '90d' && 'Ce trimestre'}
          {period === '12m' && 'Cette annee'}
        </p>
      </article>

      {/* Evolution KPI */}
      <article
        className="bg-white rounded-lg border border-neutral-200 p-4"
        aria-labelledby="kpi-evolution-label"
      >
        <p
          id="kpi-evolution-label"
          className="font-sans text-caption text-neutral-500 mb-1"
        >
          Evolution
        </p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex items-center gap-1 font-sans text-xl font-semibold',
              evolution.isNeutral
                ? 'text-neutral-600'
                : evolution.isPositive
                  ? 'text-red-600'
                  : 'text-green-600'
            )}
          >
            {evolution.isNeutral ? (
              <TrendNeutralIcon />
            ) : evolution.isPositive ? (
              <TrendUpIcon />
            ) : (
              <TrendDownIcon />
            )}
            {evolution.isNeutral ? '0%' : `${evolution.isPositive ? '+' : '-'}${evolution.value.toFixed(1)}%`}
          </span>
        </div>
        <p className="font-sans text-caption text-neutral-500 mt-1">
          {getPeriodComparisonLabel(period)}
        </p>
        <p className="font-sans text-caption text-neutral-500">
          ({formatCurrency(previousTotal, currency)} precedemment)
        </p>
      </article>

      {/* Budget Consumption KPI */}
      {budgetConsumption ? (
        <article
          className={cn(
            'rounded-lg border border-neutral-200 p-4',
            budgetConsumption.bg
          )}
          aria-labelledby="kpi-budget-label"
        >
          <p
            id="kpi-budget-label"
            className="font-sans text-caption text-neutral-500 mb-1"
          >
            Budget consomme
          </p>
          <p className={cn('font-sans text-xl font-semibold', budgetConsumption.text)}>
            {formatPercent(budgetConsumption.percentage / 100)}
          </p>

          {/* Progress bar */}
          <div
            className="h-2 bg-white/60 rounded-full overflow-hidden mt-2"
            role="progressbar"
            aria-valuenow={budgetConsumption.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Budget consomme a ${budgetConsumption.percentage.toFixed(0)} pourcent`}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                budgetConsumption.bar
              )}
              style={{ width: `${budgetConsumption.percentage}%` }}
            />
          </div>

          <p className={cn('font-sans text-caption mt-2', budgetConsumption.text)}>
            {budgetConsumption.isOverBudget ? (
              <>Depasse de {formatCurrency(Math.abs(budgetConsumption.remaining), currency)}</>
            ) : (
              <>Reste {formatCurrency(budgetConsumption.remaining, currency)}</>
            )}
          </p>
          <p className="font-sans text-caption text-neutral-500">
            sur {formatCurrency(budgetLimit!, currency)}
          </p>
        </article>
      ) : (
        <article
          className="bg-white rounded-lg border border-neutral-200 p-4"
          aria-labelledby="kpi-avg-label"
        >
          <p
            id="kpi-avg-label"
            className="font-sans text-caption text-neutral-500 mb-1"
          >
            Moyenne journaliere
          </p>
          <p className="font-sans text-xl font-semibold text-neutral-900">
            {formatCurrency(
              currentTotal /
                (period === '7d'
                  ? 7
                  : period === '30d'
                    ? 30
                    : period === '90d'
                      ? 90
                      : 365),
              currency
            )}
          </p>
          <p className="font-sans text-caption text-neutral-500 mt-1">
            par jour en moyenne
          </p>
        </article>
      )}
    </div>
  );
}

export default SpendingKPI;
