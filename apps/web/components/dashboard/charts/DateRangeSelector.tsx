'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Time period options for the date range selector
 */
export type DateRangePeriod = '7d' | '30d' | '90d' | '12m';

export interface DateRangeSelectorProps {
  /** Currently selected period */
  value: DateRangePeriod;
  /** Callback when period changes */
  onChange: (period: DateRangePeriod) => void;
  /** Additional class names */
  className?: string;
  /** Show compact version (mobile) */
  compact?: boolean;
}

interface PeriodOption {
  value: DateRangePeriod;
  label: string;
  shortLabel: string;
}

const periodOptions: PeriodOption[] = [
  { value: '7d', label: '7 jours', shortLabel: '7j' },
  { value: '30d', label: '30 jours', shortLabel: '30j' },
  { value: '90d', label: '90 jours', shortLabel: '90j' },
  { value: '12m', label: '12 mois', shortLabel: '12m' },
];

/**
 * DateRangeSelector Component
 *
 * A button group to select time periods for chart data.
 * Used across spending analysis charts for consistent filtering.
 *
 * @example
 * ```tsx
 * const [period, setPeriod] = useState<DateRangePeriod>('30d');
 *
 * <DateRangeSelector
 *   value={period}
 *   onChange={setPeriod}
 * />
 * ```
 */
export function DateRangeSelector({
  value,
  onChange,
  className,
  compact = false,
}: DateRangeSelectorProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, period: DateRangePeriod) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onChange(period);
      }
    },
    [onChange]
  );

  return (
    <div
      role="group"
      aria-label="Selectionner une periode"
      className={cn(
        'inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5',
        className
      )}
    >
      {periodOptions.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option.value)}
            className={cn(
              'px-3 py-1.5 font-sans text-body-sm font-medium rounded transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1',
              isSelected
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-600 hover:bg-white/50'
            )}
          >
            <span className={compact ? 'sm:hidden' : 'hidden'}>
              {option.shortLabel}
            </span>
            <span className={compact ? 'hidden sm:inline' : ''}>
              {compact ? option.label : option.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Hook to manage date range state with localStorage persistence
 */
export function useDateRange(
  defaultPeriod: DateRangePeriod = '30d',
  storageKey?: string
): [DateRangePeriod, (period: DateRangePeriod) => void] {
  const [period, setPeriod] = useState<DateRangePeriod>(() => {
    if (typeof window === 'undefined' || !storageKey) return defaultPeriod;
    const stored = localStorage.getItem(storageKey);
    if (stored && ['7d', '30d', '90d', '12m'].includes(stored)) {
      return stored as DateRangePeriod;
    }
    return defaultPeriod;
  });

  const handleChange = useCallback(
    (newPeriod: DateRangePeriod) => {
      setPeriod(newPeriod);
      if (storageKey && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newPeriod);
      }
    },
    [storageKey]
  );

  return [period, handleChange];
}

/**
 * Get date range boundaries from period
 */
export function getDateRangeFromPeriod(period: DateRangePeriod): {
  startDate: Date;
  endDate: Date;
  daysCount: number;
} {
  const endDate = new Date();
  const startDate = new Date();

  let daysCount: number;

  switch (period) {
    case '7d':
      daysCount = 7;
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      daysCount = 30;
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      daysCount = 90;
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '12m':
      daysCount = 365;
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      daysCount = 30;
      startDate.setDate(endDate.getDate() - 30);
  }

  return { startDate, endDate, daysCount };
}

/**
 * Get period label in French
 */
export function getPeriodLabel(period: DateRangePeriod): string {
  const labels: Record<DateRangePeriod, string> = {
    '7d': 'les 7 derniers jours',
    '30d': 'les 30 derniers jours',
    '90d': 'les 90 derniers jours',
    '12m': 'les 12 derniers mois',
  };
  return labels[period];
}

export default DateRangeSelector;
