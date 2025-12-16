'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useB2B, useB2BPermissions } from '@/contexts/B2BContext';
import {
  PageHeader,
  ActionButton,
  SectionCard,
} from '@/components/b2b';

/**
 * Recent orders mock data (will be replaced by API data)
 */
const mockRecentOrders = [
  {
    id: 'CMD-2024-001',
    date: '15 dec. 2024',
    status: 'delivered',
    statusLabel: 'Livree',
    total: 1250.0,
    items: 8,
  },
  {
    id: 'CMD-2024-002',
    date: '12 dec. 2024',
    status: 'shipped',
    statusLabel: 'Expediee',
    total: 890.5,
    items: 5,
  },
  {
    id: 'CMD-2024-003',
    date: '10 dec. 2024',
    status: 'processing',
    statusLabel: 'En cours',
    total: 2340.0,
    items: 12,
  },
  {
    id: 'CMD-2024-004',
    date: '8 dec. 2024',
    status: 'pending_approval',
    statusLabel: 'En approbation',
    total: 4500.0,
    items: 20,
  },
];

/**
 * Pending approvals mock data (will be replaced by API data)
 */
const mockPendingApprovals = [
  {
    id: 'APP-001',
    type: 'order',
    description: 'Commande CMD-2024-005',
    requester: 'Sophie Martin',
    amount: 3200.0,
    date: '14 dec. 2024',
    reason: 'Depassement limite mensuelle',
  },
  {
    id: 'APP-002',
    type: 'quote',
    description: 'Devis Q-2024-012',
    requester: 'Pierre Dubois',
    amount: 8500.0,
    date: '13 dec. 2024',
    reason: 'Montant superieur a 5 000 EUR',
  },
  {
    id: 'APP-003',
    type: 'order',
    description: 'Commande CMD-2024-006',
    requester: 'Julie Leroy',
    amount: 1800.0,
    date: '12 dec. 2024',
    reason: 'Premiere commande',
  },
];

const statusColors = {
  delivered: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  processing: 'bg-amber-100 text-amber-800',
  pending_approval: 'bg-purple-100 text-purple-800',
};

/**
 * Spending progress bar component
 */
interface SpendingBarProps {
  label: string;
  spent: number;
  limit: number;
  warningThreshold?: number; // Percentage at which to show warning color
}

/**
 * Plus icon component
 */
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

/**
 * Quick action card component
 */
interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function QuickActionCard({ href, icon, label }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-3 p-6',
        'bg-white rounded-soft border border-border-light',
        'hover:border-hermes-200 hover:shadow-sm transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
      )}
    >
      <div className="p-3 bg-hermes-50 rounded-full text-hermes-500" aria-hidden="true">
        {icon}
      </div>
      <span className="font-sans text-body-sm text-text-primary text-center">
        {label}
      </span>
    </Link>
  );
}

function SpendingBar({ label, spent, limit, warningThreshold = 80 }: SpendingBarProps) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const isWarning = percentage >= warningThreshold;
  const labelId = `spending-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div role="region" aria-labelledby={labelId}>
      <div className="flex items-center justify-between mb-2">
        <span id={labelId} className="font-sans text-body-sm text-text-secondary">
          {label}
        </span>
        <span className={cn(
          'font-sans text-body-sm font-medium',
          isWarning ? 'text-amber-600' : 'text-text-primary'
        )}>
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>
      </div>
      <div
        className="h-2 bg-background-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={labelId}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isWarning ? 'bg-amber-500' : 'bg-hermes-500'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {/* Screen reader announcement for warning state */}
      {isWarning && (
        <span className="sr-only">
          Attention: {percentage.toFixed(0)}% de la limite atteinte
        </span>
      )}
    </div>
  );
}

/**
 * B2B Dashboard Page
 *
 * Main dashboard showing key metrics, pending approvals,
 * and recent activity. Data is pulled from B2B context.
 */
export default function DashboardPage() {
  // Get B2B context data
  const { employee, company, spendingSummary, isLoading } = useB2B();
  const { canApproveOrders, canViewSpending, canManageEmployees, canCreateQuote } = useB2BPermissions();

  // Build stats from context data
  const stats = useMemo(() => {
    const monthlySpent = spendingSummary?.totalSpent ?? 8500;

    return [
      {
        label: 'Commandes ce mois',
        value: '12',
        change: '+15%',
        changeType: 'positive' as const,
        href: '/commandes',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
      },
      {
        label: 'Depenses ce mois',
        value: formatCurrency(monthlySpent),
        change: '+8%',
        changeType: 'positive' as const,
        href: canViewSpending ? '/rapports' : undefined,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: 'Devis en attente',
        value: '3',
        href: '/devis',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: 'Approbations',
        value: canApproveOrders ? '5' : '-',
        href: canApproveOrders ? '/approbations' : undefined,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ];
  }, [spendingSummary, canViewSpending, canApproveOrders]);

  // Derive display values
  const employeeName = employee?.firstName ?? 'Utilisateur';
  const recentOrders = mockRecentOrders; // Will be replaced by API data
  const pendingApprovals = canApproveOrders ? mockPendingApprovals : [];

  // Loading state
  if (isLoading) {
    return (
      <div
        className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-hermes-500 border-t-transparent rounded-full animate-spin mx-auto"
            aria-hidden="true"
          />
          <p className="mt-4 font-sans text-body text-text-muted">Chargement...</p>
          <span className="sr-only">Chargement du tableau de bord en cours</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <PageHeader
        title="Tableau de bord"
        description={`Bienvenue, ${employeeName}. Voici un apercu de votre activite.`}
        actions={
          canCreateQuote && (
            <ActionButton
              variant="primary"
              href="/devis/nouveau"
              icon={<PlusIcon />}
            >
              Nouveau devis
            </ActionButton>
          )
        }
      />

      {/* Stats Grid */}
      <section aria-label="Statistiques" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="bg-white rounded-soft border border-border-light p-6"
            aria-labelledby={`stat-label-${stat.label.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2 bg-hermes-50 rounded-soft text-hermes-500" aria-hidden="true">
                {stat.icon}
              </div>
              {stat.href && (
                <Link
                  href={stat.href}
                  className={cn(
                    'font-sans text-caption text-hermes-500 hover:text-hermes-600',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft'
                  )}
                  aria-label={`Voir tout pour ${stat.label}`}
                >
                  Voir tout
                </Link>
              )}
            </div>
            <div className="mt-4">
              <p
                id={`stat-label-${stat.label.replace(/\s+/g, '-').toLowerCase()}`}
                className="font-sans text-caption text-text-muted"
              >
                {stat.label}
              </p>
              <p className="mt-1 font-serif text-heading-4 text-text-primary">
                {stat.value}
              </p>
              {stat.change && (
                <p
                  className={cn(
                    'mt-1 font-sans text-caption',
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  )}
                  aria-label={`${stat.change} par rapport au mois dernier`}
                >
                  <span aria-hidden="true">{stat.change}</span> vs mois dernier
                </p>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <section
          className="bg-white rounded-soft border border-border-light"
          aria-labelledby="approvals-heading"
        >
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <h2 id="approvals-heading" className="font-serif text-heading-5 text-text-primary">
              Approbations en attente
            </h2>
            <Link
              href="/approbations"
              className={cn(
                'font-sans text-caption text-hermes-500 hover:text-hermes-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft'
              )}
              aria-label="Voir toutes les approbations"
            >
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-border-light" role="list" aria-label="Liste des approbations en attente">
            {pendingApprovals.length === 0 ? (
              <div className="p-6 text-center" role="status">
                <p className="font-sans text-body text-text-muted">
                  Aucune approbation en attente
                </p>
              </div>
            ) : (
              pendingApprovals.map((approval) => (
                <article
                  key={approval.id}
                  className="p-4 hover:bg-background-muted transition-colors"
                  role="listitem"
                  aria-labelledby={`approval-${approval.id}-title`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p
                        id={`approval-${approval.id}-title`}
                        className="font-sans text-body-sm font-medium text-text-primary"
                      >
                        {approval.description}
                      </p>
                      <p className="mt-0.5 font-sans text-caption text-text-muted">
                        {approval.requester} - {approval.date}
                      </p>
                      <p className="mt-1 font-sans text-caption text-amber-600" role="note">
                        {approval.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-body-sm font-medium text-text-primary">
                        {formatCurrency(approval.amount)}
                      </p>
                      <div className="mt-2 flex items-center gap-2" role="group" aria-label="Actions">
                        <button
                          className={cn(
                            'px-3 py-1 rounded-soft',
                            'font-sans text-caption font-medium',
                            'bg-green-100 text-green-700 hover:bg-green-200',
                            'transition-colors duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2'
                          )}
                          aria-label={`Approuver ${approval.description}`}
                        >
                          Approuver
                        </button>
                        <button
                          className={cn(
                            'px-3 py-1 rounded-soft',
                            'font-sans text-caption font-medium',
                            'bg-red-100 text-red-700 hover:bg-red-200',
                            'transition-colors duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                          )}
                          aria-label={`Refuser ${approval.description}`}
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Recent Orders */}
        <section
          className="bg-white rounded-soft border border-border-light"
          aria-labelledby="orders-heading"
        >
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <h2 id="orders-heading" className="font-serif text-heading-5 text-text-primary">
              Commandes recentes
            </h2>
            <Link
              href="/commandes"
              className={cn(
                'font-sans text-caption text-hermes-500 hover:text-hermes-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft'
              )}
              aria-label="Voir toutes les commandes"
            >
              Voir tout
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Commandes recentes">
              <thead>
                <tr className="border-b border-border-light">
                  <th scope="col" className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Commande
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Statut
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-sans text-caption font-medium text-text-muted">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background-muted transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/commandes/${order.id}`}
                        className={cn(
                          'font-sans text-body-sm font-medium text-hermes-500 hover:text-hermes-600',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft'
                        )}
                      >
                        {order.id}
                      </Link>
                      <p className="font-sans text-caption text-text-muted">
                        {order.items} articles
                      </p>
                    </td>
                    <td className="px-4 py-3 font-sans text-body-sm text-text-secondary">
                      {order.date}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex px-2 py-0.5 rounded-full',
                          'font-sans text-caption font-medium',
                          statusColors[order.status as keyof typeof statusColors]
                        )}
                        role="status"
                      >
                        {order.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans text-body-sm font-medium text-text-primary">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Spending Overview - Only shown if user can view spending */}
      {canViewSpending && (
        <section
          className="bg-white rounded-soft border border-border-light p-6"
          aria-labelledby="spending-heading"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 id="spending-heading" className="font-serif text-heading-5 text-text-primary">
              Apercu des depenses
            </h2>
            <Link
              href="/rapports"
              className={cn(
                'font-sans text-caption text-hermes-500 hover:text-hermes-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft'
              )}
              aria-label="Voir les rapports de depenses"
            >
              Voir les rapports
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily */}
            <SpendingBar
              label="Aujourdhui"
              spent={employee?.currentDailySpending ?? 450}
              limit={spendingSummary?.dailyLimit ?? 2000}
            />
            {/* Weekly - estimate based on daily/monthly ratio */}
            <SpendingBar
              label="Cette semaine"
              spent={(employee?.currentDailySpending ?? 450) * 5}
              limit={(spendingSummary?.dailyLimit ?? 2000) * 5}
            />
            {/* Monthly */}
            <SpendingBar
              label="Ce mois"
              spent={spendingSummary?.totalSpent ?? 8500}
              limit={spendingSummary?.monthlyLimit ?? 15000}
              warningThreshold={50}
            />
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <nav aria-label="Actions rapides" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard
          href="/commandes/bulk"
          label="Commande groupee"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        {canCreateQuote && (
          <QuickActionCard
            href="/devis/nouveau"
            label="Demander un devis"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        )}
        {canManageEmployees && (
          <QuickActionCard
            href="/entreprise/employes"
            label="Gerer les employes"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        )}
        {canViewSpending && (
          <QuickActionCard
            href="/rapports"
            label="Voir les rapports"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        )}
      </nav>
    </div>
  );
}
