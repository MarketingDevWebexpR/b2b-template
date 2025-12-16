'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';

/**
 * SpendingWidget Component
 *
 * Displays budget usage with visual progress indicator.
 * Shows spending limits and remaining budget for the current period.
 */
export function SpendingWidget() {
  const { employee, spendingSummary, company } = useB2B();

  // Calculate spending percentages
  const monthlyLimit = employee?.spendingLimitMonthly ?? company?.creditLimit ?? 0;
  const monthlySpent = employee?.currentMonthlySpending ?? 0;
  const monthlyRemaining = monthlyLimit - monthlySpent;
  const monthlyPercent = monthlyLimit > 0 ? (monthlySpent / monthlyLimit) * 100 : 0;

  const dailyLimit = employee?.spendingLimitDaily ?? 0;
  const dailySpent = employee?.currentDailySpending ?? 0;
  const dailyRemaining = dailyLimit - dailySpent;
  const dailyPercent = dailyLimit > 0 ? (dailySpent / dailyLimit) * 100 : 0;

  // Determine status colors
  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-amber-500';
    return 'bg-accent';
  };

  const getStatusTextColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 75) return 'text-amber-600';
    return 'text-neutral-900';
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-sans font-semibold text-heading-6 text-neutral-900">
          Budget
        </h2>
        <Link
          href="/rapports"
          className="font-sans text-caption text-accent hover:text-accent/90 transition-colors"
        >
          Details
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5">
        {/* Monthly Budget */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-caption text-neutral-500">
              Budget mensuel
            </span>
            <span className={cn(
              'font-sans text-body-sm font-medium',
              getStatusTextColor(monthlyPercent)
            )}>
              {formatCurrency(monthlySpent)} / {formatCurrency(monthlyLimit)}
            </span>
          </div>
          <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                getStatusColor(monthlyPercent)
              )}
              style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="font-sans text-caption text-neutral-500">
              {formatPercent(monthlyPercent / 100)} utilise
            </span>
            <span className={cn(
              'font-sans text-caption font-medium',
              monthlyRemaining < 0 ? 'text-red-600' : 'text-green-600'
            )}>
              {monthlyRemaining >= 0 ? (
                <>Reste {formatCurrency(monthlyRemaining)}</>
              ) : (
                <>Depasse de {formatCurrency(Math.abs(monthlyRemaining))}</>
              )}
            </span>
          </div>
        </div>

        {/* Daily Budget (if set) */}
        {dailyLimit > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-caption text-neutral-500">
                Limite journaliere
              </span>
              <span className={cn(
                'font-sans text-body-sm font-medium',
                getStatusTextColor(dailyPercent)
              )}>
                {formatCurrency(dailySpent)} / {formatCurrency(dailyLimit)}
              </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  getStatusColor(dailyPercent)
                )}
                style={{ width: `${Math.min(dailyPercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-sans text-caption text-neutral-500">
                {formatPercent(dailyPercent / 100)} utilise
              </span>
              <span className={cn(
                'font-sans text-caption font-medium',
                dailyRemaining < 0 ? 'text-red-600' : 'text-green-600'
              )}>
                {dailyRemaining >= 0 ? (
                  <>Reste {formatCurrency(dailyRemaining)}</>
                ) : (
                  <>Depasse</>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Credit Line (Company) */}
        {company?.creditLimit && company.creditLimit > 0 && (
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="font-sans text-caption text-neutral-500">
                Ligne de credit entreprise
              </span>
              <span className="font-sans text-body-sm font-medium text-neutral-900">
                {formatCurrency(company.creditAvailable ?? 0)}
              </span>
            </div>
            <p className="font-sans text-caption text-neutral-500 mt-1">
              sur {formatCurrency(company.creditLimit)} disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpendingWidget;
