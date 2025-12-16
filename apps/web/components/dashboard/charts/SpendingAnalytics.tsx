'use client';

import { useMemo, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useB2B } from '@/contexts/B2BContext';
import {
  DateRangeSelector,
  useDateRange,
  type DateRangePeriod,
} from './DateRangeSelector';
import { SpendingKPI, type SpendingData } from './SpendingKPI';
import { SpendingChart, type SpendingDataPoint } from './SpendingChart';
import { CategoryBreakdown, type CategoryData } from './CategoryBreakdown';
import { TopProductsChart, type ProductData } from './TopProductsChart';

export interface SpendingAnalyticsProps {
  /** Additional class names */
  className?: string;
  /** Show compact version */
  compact?: boolean;
}

/**
 * Generate spending data from monthly trend for different periods
 */
function generateSpendingData(
  monthlyTrend: Array<{ month: string; spending: number; ordersCount: number }>,
  period: DateRangePeriod
): SpendingDataPoint[] {
  if (!monthlyTrend || monthlyTrend.length === 0) {
    return [];
  }

  // For 12 months view, use monthly data directly
  if (period === '12m') {
    return monthlyTrend.map((m) => ({
      date: `${m.month}-01`,
      amount: m.spending,
      ordersCount: m.ordersCount,
    }));
  }

  // For shorter periods, generate synthetic daily data
  // In production, this would come from actual daily data
  const now = new Date();
  const data: SpendingDataPoint[] = [];

  let daysCount: number;
  switch (period) {
    case '7d':
      daysCount = 7;
      break;
    case '30d':
      daysCount = 30;
      break;
    case '90d':
      daysCount = 90;
      break;
    default:
      daysCount = 30;
  }

  // Get average daily spending from monthly data
  const latestMonth = monthlyTrend[monthlyTrend.length - 1];
  const avgDailySpending = latestMonth ? latestMonth.spending / 30 : 0;
  const avgDailyOrders = latestMonth ? latestMonth.ordersCount / 30 : 0;

  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some variation
    const variation = (Math.random() - 0.5) * avgDailySpending * 0.5;
    const amount = Math.max(0, avgDailySpending + variation);
    const ordersVariation = Math.round((Math.random() - 0.5) * 2);
    const ordersCount = Math.max(0, Math.round(avgDailyOrders) + ordersVariation);

    data.push({
      date: date.toISOString().split('T')[0],
      amount: Math.round(amount * 100) / 100,
      ordersCount,
    });
  }

  return data;
}

/**
 * Calculate KPI data for a period
 */
function calculateKPIData(
  monthlyTrend: Array<{ month: string; spending: number; ordersCount: number }>,
  period: DateRangePeriod,
  budgetLimit?: number
): SpendingData {
  if (!monthlyTrend || monthlyTrend.length === 0) {
    return {
      currentTotal: 0,
      previousTotal: 0,
      budgetLimit,
    };
  }

  let currentTotal = 0;
  let previousTotal = 0;

  switch (period) {
    case '7d': {
      // Last 7 days vs previous 7 days (simulated from monthly)
      const latestMonth = monthlyTrend[monthlyTrend.length - 1];
      currentTotal = latestMonth ? (latestMonth.spending / 30) * 7 : 0;
      previousTotal = currentTotal * (0.9 + Math.random() * 0.2); // Simulate variation
      break;
    }
    case '30d': {
      // Last month vs previous month
      const latestMonth = monthlyTrend[monthlyTrend.length - 1];
      const prevMonth = monthlyTrend[monthlyTrend.length - 2];
      currentTotal = latestMonth?.spending ?? 0;
      previousTotal = prevMonth?.spending ?? currentTotal * 0.9;
      break;
    }
    case '90d': {
      // Last 3 months vs previous 3 months
      const last3 = monthlyTrend.slice(-3);
      const prev3 = monthlyTrend.slice(-6, -3);
      currentTotal = last3.reduce((sum, m) => sum + m.spending, 0);
      previousTotal = prev3.reduce((sum, m) => sum + m.spending, 0) || currentTotal * 0.85;
      break;
    }
    case '12m': {
      // All months in the data
      currentTotal = monthlyTrend.reduce((sum, m) => sum + m.spending, 0);
      previousTotal = currentTotal * 0.8; // Simulated previous year
      break;
    }
  }

  return {
    currentTotal: Math.round(currentTotal * 100) / 100,
    previousTotal: Math.round(previousTotal * 100) / 100,
    budgetLimit,
  };
}

/**
 * SpendingAnalytics Component
 *
 * A complete spending analytics section for the B2B dashboard.
 * Includes KPIs, spending chart, category breakdown, and top products.
 *
 * @example
 * ```tsx
 * <SpendingAnalytics />
 *
 * // Compact version for smaller spaces
 * <SpendingAnalytics compact />
 * ```
 */
export function SpendingAnalytics({ className, compact = false }: SpendingAnalyticsProps) {
  const { reports, company, reportsLoading } = useB2B();
  const [period, setPeriod] = useDateRange('30d', 'dashboard-spending-period');
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering for localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Process data based on period
  const spendingChartData = useMemo(() => {
    return generateSpendingData(reports?.monthlyTrend ?? [], period);
  }, [reports?.monthlyTrend, period]);

  const kpiData = useMemo(() => {
    return calculateKPIData(
      reports?.monthlyTrend ?? [],
      period,
      company?.creditLimit
    );
  }, [reports?.monthlyTrend, period, company?.creditLimit]);

  const categoryData: CategoryData[] = useMemo(() => {
    if (!reports?.byCategory) return [];
    return reports.byCategory.map((cat) => ({
      id: cat.categoryId,
      name: cat.categoryName,
      amount: cat.totalSpending,
      percentage: cat.percentOfTotal,
      itemsCount: cat.itemsCount,
    }));
  }, [reports?.byCategory]);

  const productData: ProductData[] = useMemo(() => {
    if (!reports?.topProducts) return [];
    return reports.topProducts.map((prod) => ({
      productId: prod.productId,
      productName: prod.productName,
      sku: prod.sku,
      quantity: prod.quantity,
      totalSpending: prod.totalSpending,
      averagePrice: prod.averagePrice,
    }));
  }, [reports?.topProducts]);

  // Handle period change
  const handlePeriodChange = useCallback((newPeriod: DateRangePeriod) => {
    setPeriod(newPeriod);
  }, [setPeriod]);

  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <section className={cn('space-y-6', className)} aria-label="Analyse des depenses">
        <div className="h-64 bg-neutral-100 rounded-lg animate-pulse" />
      </section>
    );
  }

  if (compact) {
    return (
      <section className={cn('space-y-6', className)} aria-label="Analyse des depenses">
        {/* Header with period selector */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="font-sans text-heading-5 text-neutral-900">
            Analyse des depenses
          </h2>
          <DateRangeSelector value={period} onChange={handlePeriodChange} compact />
        </div>

        {/* KPIs */}
        <SpendingKPI data={kpiData} period={period} isLoading={reportsLoading} />

        {/* Chart */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <SpendingChart
            data={spendingChartData}
            period={period}
            isLoading={reportsLoading}
            height={160}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={cn('space-y-6', className)} aria-label="Analyse des depenses">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-sans text-heading-5 text-neutral-900">
            Analyse des depenses
          </h2>
          <p className="font-sans text-body-sm text-neutral-500 mt-1">
            Vue d ensemble de vos depenses et tendances
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangeSelector value={period} onChange={handlePeriodChange} />
          <Link
            href="/rapports"
            className="font-sans text-body-sm text-accent hover:text-accent/90 transition-colors"
          >
            Voir rapports complets
          </Link>
        </div>
      </div>

      {/* KPIs Row */}
      <SpendingKPI data={kpiData} period={period} isLoading={reportsLoading} />

      {/* Charts Grid - 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h3 className="font-sans text-body font-semibold text-neutral-900">
              Evolution des depenses
            </h3>
          </div>
          <div className="p-4">
            <SpendingChart
              data={spendingChartData}
              period={period}
              isLoading={reportsLoading}
              height={200}
            />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h3 className="font-sans text-body font-semibold text-neutral-900">
              Repartition par categorie
            </h3>
          </div>
          <div className="p-4">
            <CategoryBreakdown
              data={categoryData}
              isLoading={reportsLoading}
              size={160}
            />
          </div>
        </div>
      </div>

      {/* Top Products - Full width */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h3 className="font-sans text-body font-semibold text-neutral-900">
            Top produits commandes
          </h3>
          <Link
            href="/rapports?tab=products"
            className="font-sans text-caption text-accent hover:text-accent/90 transition-colors"
          >
            Voir tout
          </Link>
        </div>
        <div className="p-4">
          <TopProductsChart
            data={productData}
            isLoading={reportsLoading}
            limit={10}
          />
        </div>
      </div>
    </section>
  );
}

export default SpendingAnalytics;
