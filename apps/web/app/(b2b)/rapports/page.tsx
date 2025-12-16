'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';
import type {
  ReportPeriod,
  ReportType,
  EmployeeSpending,
  CategorySpending,
  MonthlyTrend,
  TopProduct,
} from '@maison/types';
import {
  PageLoader,
  SectionLoader,
  StatsGrid,
  FilterTabs,
} from '@/components/b2b';

/**
 * Period options for the report filter
 */
const periodOptions: { value: ReportPeriod; label: string }[] = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette annee' },
];

/**
 * Report type tabs
 */
const reportTypeOptions: { value: ReportType; label: string }[] = [
  { value: 'spending', label: 'Depenses par employe' },
  { value: 'category', label: 'Par categorie' },
  { value: 'trend', label: 'Tendance mensuelle' },
  { value: 'products', label: 'Produits populaires' },
];

/**
 * Reports Page
 * Displays B2B spending reports and analytics
 */
export default function RapportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [reportType, setReportType] = useState<ReportType>('spending');
  const { reports, reportsLoading, isLoading, refreshReports } = useB2B();

  // Refresh reports when period changes
  useEffect(() => {
    refreshReports(period);
  }, [period, refreshReports]);

  // Calculate budget usage percentage
  const budgetUsage = useMemo(() => {
    if (!reports.summary.budgetLimit) return 0;
    return Math.round((reports.summary.totalSpending / reports.summary.budgetLimit) * 100);
  }, [reports.summary.totalSpending, reports.summary.budgetLimit]);

  // Handle period change
  const handlePeriodChange = useCallback((newPeriod: string) => {
    setPeriod(newPeriod as ReportPeriod);
  }, []);

  // Stats data for StatsGrid
  const stats = useMemo(() => [
    {
      label: 'Depenses ce mois',
      value: (
        <div>
          <span>{formatCurrency(reports.summary.totalSpending)}</span>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-caption text-content-muted">Budget</span>
              <span className="font-sans text-caption font-medium text-content-primary">{budgetUsage}%</span>
            </div>
            <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  budgetUsage > 80 ? 'bg-amber-500' : 'bg-primary'
                )}
                style={{ width: `${budgetUsage}%` }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Commandes ce mois',
      value: reports.summary.ordersCount,
      trend: { value: 12, label: 'vs mois precedent' },
    },
    {
      label: 'Panier moyen',
      value: formatCurrency(reports.summary.averageOrder),
      trend: { value: 5, label: 'vs mois precedent' },
    },
    {
      label: 'Approbations en attente',
      value: reports.summary.pendingApprovals,
      color: reports.summary.pendingApprovals > 0 ? 'amber' as const : 'default' as const,
    },
  ], [reports.summary, budgetUsage]);

  // Loading state
  if (isLoading) {
    return <PageLoader message="Chargement des rapports..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-heading-3 text-content-primary">
            Rapports
          </h1>
          <p className="mt-1 font-sans text-body text-content-muted">
            Analysez vos depenses et activites d'achats
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className={cn(
              'px-4 py-2',
              'bg-white border border-stroke-light rounded-lg',
              'font-sans text-body-sm text-content-primary',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            )}
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2',
              'bg-primary text-white rounded-lg',
              'font-sans text-body-sm font-medium',
              'hover:bg-primary-600 transition-colors duration-200'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <StatsGrid stats={stats} columns={4} />

      {/* Report Type Tabs */}
      <FilterTabs
        options={reportTypeOptions}
        value={reportType}
        onChange={(value) => setReportType(value as ReportType)}
        className="border-b border-stroke-light pb-4"
      />

      {/* Report Content */}
      <div className="bg-white rounded-lg border border-stroke-light">
        {reportsLoading ? (
          <SectionLoader message="Chargement des donnees..." />
        ) : (
          <>
            {/* Spending by Employee */}
            {reportType === 'spending' && (
              <SpendingByEmployeeReport data={reports.byEmployee} />
            )}

            {/* Spending by Category */}
            {reportType === 'category' && (
              <SpendingByCategoryReport data={reports.byCategory} />
            )}

            {/* Monthly Trend */}
            {reportType === 'trend' && (
              <MonthlyTrendReport data={reports.monthlyTrend} />
            )}

            {/* Top Products */}
            {reportType === 'products' && (
              <TopProductsReport data={reports.topProducts} />
            )}
          </>
        )}
      </div>

      {/* Export Options */}
      <ExportOptionsSection />
    </div>
  );
}

/**
 * Spending by Employee Report Component
 */
function SpendingByEmployeeReport({ data }: { data: EmployeeSpending[] }) {
  return (
    <div className="p-6">
      <h2 className="font-sans text-heading-5 text-content-primary mb-6">
        Depenses par employe
      </h2>
      <div className="space-y-6">
        {data.map((employee) => {
          const employeeName = employee.employeeName || '';
          const totalSpending = employee.totalSpending || 0;
          const percentOfTotal = employee.percentOfTotal || 0;
          return (
            <div key={employee.employeeId}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                    <span className="font-sans text-body-sm font-medium text-primary-600">
                      {employeeName.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-sans text-body-sm font-medium text-content-primary">
                      {employeeName}
                    </p>
                    <p className="font-sans text-caption text-content-muted">
                      {formatCurrency(totalSpending)}
                      {' - '}
                      {employee.ordersCount} commandes
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'font-sans text-body-sm font-medium',
                    percentOfTotal > 40 ? 'text-amber-600' : 'text-content-primary'
                  )}
                >
                  {percentOfTotal}%
                </span>
              </div>
              <div className="h-3 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    percentOfTotal > 40 ? 'bg-amber-500' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Spending by Category Report Component
 */
function SpendingByCategoryReport({ data }: { data: CategorySpending[] }) {
  const total = data.reduce((sum, c) => sum + (c.totalSpending || 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stroke-light bg-surface-secondary">
            <th className="px-6 py-3 text-left font-sans text-caption font-medium text-content-muted">
              Categorie
            </th>
            <th className="px-6 py-3 text-right font-sans text-caption font-medium text-content-muted">
              Montant
            </th>
            <th className="px-6 py-3 text-right font-sans text-caption font-medium text-content-muted">
              Articles
            </th>
            <th className="px-6 py-3 text-right font-sans text-caption font-medium text-content-muted">
              Part
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {data.map((cat) => {
            const catTotalSpending = cat.totalSpending || 0;
            const catItemsCount = cat.itemsCount || 0;
            const percentage = total > 0 ? Math.round((catTotalSpending / total) * 100) : 0;
            return (
              <tr key={cat.categoryId} className="hover:bg-surface-secondary transition-colors">
                <td className="px-6 py-4">
                  <p className="font-sans text-body-sm font-medium text-content-primary">
                    {cat.categoryName}
                  </p>
                </td>
                <td className="px-6 py-4 text-right font-sans text-body-sm text-content-primary">
                  {formatCurrency(catTotalSpending)}
                </td>
                <td className="px-6 py-4 text-right font-sans text-body-sm text-content-secondary">
                  {catItemsCount}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-surface-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="font-sans text-body-sm text-content-secondary w-8">
                      {percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Monthly Trend Report Component
 */
function MonthlyTrendReport({ data }: { data: MonthlyTrend[] }) {
  const trendData = data || [];
  const maxAmount = trendData.length > 0 ? Math.max(...trendData.map((m) => m.spending || 0)) : 0;

  return (
    <div className="p-6">
      <h2 className="font-sans text-heading-5 text-content-primary mb-6">
        Evolution des depenses
      </h2>
      <div className="space-y-4">
        {trendData.map((month, index) => {
          const monthSpending = month.spending || 0;
          const prevAmount = (trendData[index - 1]?.spending || 0) || monthSpending;
          const percentage = maxAmount > 0 ? Math.round((monthSpending / maxAmount) * 100) : 0;
          const change = prevAmount > 0 ? Math.round(((monthSpending - prevAmount) / prevAmount) * 100) : 0;
          return (
            <div key={month.month} className="flex items-center gap-4">
              <span className="w-24 font-sans text-body-sm text-content-secondary">
                {month.month}
              </span>
              <div className="flex-1 h-8 bg-surface-secondary rounded-lg overflow-hidden">
                <div
                  className="h-full bg-primary rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                >
                  <span className="font-sans text-caption font-medium text-white">
                    {formatCurrency(monthSpending, 'EUR')}
                  </span>
                </div>
              </div>
              {index > 0 && (
                <span
                  className={cn(
                    'w-12 font-sans text-caption font-medium text-right',
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change >= 0 ? '+' : ''}{change}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Top Products Report Component
 */
function TopProductsReport({ data }: { data: TopProduct[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stroke-light bg-surface-secondary">
            <th className="px-6 py-3 text-left font-sans text-caption font-medium text-content-muted">
              #
            </th>
            <th className="px-6 py-3 text-left font-sans text-caption font-medium text-content-muted">
              Produit
            </th>
            <th className="px-6 py-3 text-right font-sans text-caption font-medium text-content-muted">
              Quantite
            </th>
            <th className="px-6 py-3 text-right font-sans text-caption font-medium text-content-muted">
              Chiffre d'affaires
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {data.map((product, index) => (
            <tr key={product.productId} className="hover:bg-surface-secondary transition-colors">
              <td className="px-6 py-4">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    index === 0 && 'bg-amber-100 text-amber-700',
                    index === 1 && 'bg-gray-200 text-gray-700',
                    index === 2 && 'bg-orange-100 text-orange-700',
                    index > 2 && 'bg-surface-secondary text-content-muted'
                  )}
                >
                  <span className="font-sans text-caption font-medium">{index + 1}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-sans text-body-sm font-medium text-content-primary">
                  {product.productName}
                </p>
                <p className="font-mono text-caption text-content-muted">
                  {product.sku}
                </p>
              </td>
              <td className="px-6 py-4 text-right font-sans text-body-sm text-content-secondary">
                {product.quantity} unites
              </td>
              <td className="px-6 py-4 text-right font-sans text-body-sm font-medium text-content-primary">
                {formatCurrency(product.totalSpending)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Export Options Section Component
 */
function ExportOptionsSection() {
  return (
    <div className="bg-surface-secondary rounded-lg p-6">
      <h3 className="font-sans text-heading-5 text-content-primary mb-4">
        Exporter les donnees
      </h3>
      <div className="flex flex-wrap gap-3">
        <button
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'bg-white border border-stroke-light text-content-secondary rounded-lg',
            'font-sans text-body-sm font-medium',
            'hover:bg-white hover:border-primary/20',
            'transition-colors duration-200'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter CSV
        </button>
        <button
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'bg-white border border-stroke-light text-content-secondary rounded-lg',
            'font-sans text-body-sm font-medium',
            'hover:bg-white hover:border-primary/20',
            'transition-colors duration-200'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter Excel
        </button>
        <button
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'bg-white border border-stroke-light text-content-secondary rounded-lg',
            'font-sans text-body-sm font-medium',
            'hover:bg-white hover:border-primary/20',
            'transition-colors duration-200'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Rapport PDF complet
        </button>
      </div>
    </div>
  );
}
