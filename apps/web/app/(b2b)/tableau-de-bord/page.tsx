'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';
import {
  PageLoader,
  PageHeader,
  StatsGrid,
} from '@/components/b2b';
import { OrdersWidget } from '@/components/dashboard/OrdersWidget';
import { SpendingWidget } from '@/components/dashboard/SpendingWidget';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget';
import { SpendingAnalytics } from '@/components/dashboard/charts';

/**
 * Icon components
 */
const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

/**
 * TopProductsChart Component
 * Displays top products ordered with horizontal bar chart
 */
function TopProductsChart() {
  const { reports } = useB2B();
  const topProducts = reports?.topProducts?.slice(0, 5) ?? [];

  if (topProducts.length === 0) {
    return (
      <div className="p-4 text-center text-content-muted font-sans text-body-sm">
        Aucune donnee disponible
      </div>
    );
  }

  const maxSpending = Math.max(...topProducts.map(p => p.totalSpending));

  return (
    <div className="space-y-4">
      {topProducts.map((product, index) => (
        <div key={product.productId} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-body-sm text-content-primary truncate max-w-[60%]">
              {index + 1}. {product.productName}
            </span>
            <span className="font-sans text-caption text-content-muted">
              {product.quantity} unites
            </span>
          </div>
          <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(product.totalSpending / maxSpending) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-sans text-caption text-content-muted">
              SKU: {product.sku}
            </span>
            <span className="font-sans text-caption font-medium text-content-secondary">
              {formatCurrency(product.totalSpending)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * OrdersEvolutionChart Component
 * Displays monthly orders evolution
 */
function OrdersEvolutionChart() {
  const { reports } = useB2B();
  const monthlyTrend = reports?.monthlyTrend ?? [];

  if (monthlyTrend.length === 0) {
    return (
      <div className="p-4 text-center text-content-muted font-sans text-body-sm">
        Aucune donnee disponible
      </div>
    );
  }

  const maxSpending = Math.max(...monthlyTrend.map(m => m.spending));
  const minSpending = Math.min(...monthlyTrend.map(m => m.spending));
  const range = maxSpending - minSpending || 1;

  // Format month name
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(month, 10) - 1] || month;
  };

  return (
    <div className="space-y-4">
      {/* Simple bar chart */}
      <div className="flex items-end justify-between h-32 gap-2">
        {monthlyTrend.map((month, index) => {
          const height = ((month.spending - minSpending) / range) * 80 + 20;
          const isLast = index === monthlyTrend.length - 1;
          return (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-full rounded-t transition-all duration-300',
                  isLast ? 'bg-primary' : 'bg-primary/20'
                )}
                style={{ height: `${height}%` }}
                title={`${formatCurrency(month.spending)} - ${month.ordersCount} commandes`}
              />
              <span className="font-sans text-[10px] text-content-muted">
                {formatMonth(month.month)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-stroke-light">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/20" />
            <span className="font-sans text-caption text-content-muted">Mois precedents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="font-sans text-caption text-content-muted">Mois en cours</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Page
 *
 * Main B2B dashboard with overview of account, orders, spending, and alerts.
 */
export default function DashboardPage() {
  const {
    company,
    employee,
    orders,
    approvals,
    reports,
    isLoading,
    isB2BActive,
  } = useB2B();

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
    const recentOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate >= thirtyDaysAgo;
    }).length;

    const totalSpent = reports?.summary?.totalSpending ?? 0;
    const budgetLimit = reports?.summary?.budgetLimit ?? 0;
    const budgetRemaining = budgetLimit - totalSpent;

    return [
      {
        label: 'Commandes ce mois',
        value: recentOrders,
        trend: '+12%',
        trendUp: true,
      },
      {
        label: 'Depenses du mois',
        value: formatCurrency(totalSpent),
        trend: '-5%',
        trendUp: false,
      },
      {
        label: 'Budget restant',
        value: formatCurrency(budgetRemaining > 0 ? budgetRemaining : 0),
        subtext: `sur ${formatCurrency(budgetLimit)}`,
      },
      {
        label: 'Approbations en attente',
        value: pendingApprovals,
        color: pendingApprovals > 0 ? 'amber' as const : undefined,
      },
    ];
  }, [orders, approvals, reports]);

  // Loading state
  if (isLoading) {
    return <PageLoader message="Chargement du tableau de bord..." />;
  }

  // Not B2B active
  if (!isB2BActive) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <h1 className="font-sans text-heading-4 text-content-primary mb-2">
            Acces non autorise
          </h1>
          <p className="font-sans text-body text-content-muted">
            Vous devez etre connecte a un compte B2B pour acceder au tableau de bord.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <PageHeader
        title={`Bonjour, ${employee?.firstName ?? 'Utilisateur'}`}
        description={`Bienvenue sur votre espace B2B ${company?.name ?? ''}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              'bg-white rounded-lg border border-stroke-light p-4',
              'transition-all duration-200 hover:shadow-sm'
            )}
          >
            <p className="font-sans text-caption text-content-muted mb-1">
              {stat.label}
            </p>
            <div className="flex items-end justify-between">
              <p className={cn(
                'font-sans text-heading-5',
                stat.color === 'amber' ? 'text-amber-600' : 'text-content-primary'
              )}>
                {stat.value}
              </p>
              {stat.trend && (
                <span className={cn(
                  'flex items-center gap-0.5 font-sans text-caption font-medium',
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.trendUp ? <TrendUpIcon /> : <TrendDownIcon />}
                  {stat.trend}
                </span>
              )}
            </div>
            {stat.subtext && (
              <p className="font-sans text-caption text-content-muted mt-1">
                {stat.subtext}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders Widget */}
          <OrdersWidget />

          {/* Orders Evolution Chart (legacy) */}
          <div className="bg-white rounded-lg border border-stroke-light">
            <div className="flex items-center justify-between p-4 border-b border-stroke-light">
              <h2 className="font-sans text-heading-6 text-content-primary">
                Evolution des commandes
              </h2>
              <Link
                href="/rapports"
                className="font-sans text-caption text-primary hover:text-primary-600"
              >
                Voir rapports
              </Link>
            </div>
            <div className="p-4">
              <OrdersEvolutionChart />
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions Widget */}
          <QuickActionsWidget />

          {/* Spending Widget */}
          <SpendingWidget />

          {/* Alerts Widget */}
          <AlertsWidget />
        </div>
      </div>

      {/* Spending Analytics Section - Full Width */}
      <SpendingAnalytics />
    </div>
  );
}
