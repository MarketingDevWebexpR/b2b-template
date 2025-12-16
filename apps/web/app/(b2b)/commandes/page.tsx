'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';
import type { B2BOrderStatus } from '@maison/types';
import {
  StatusBadge,
  PageLoader,
  SectionLoader,
  EmptyState,
  StatsGrid,
  FilterTabs,
  PageHeader,
  ActionButton,
} from '@/components/b2b';

/**
 * Filter options for order status
 */
const filterOptions: { value: B2BOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending_approval', label: 'En attente' },
  { value: 'processing', label: 'En preparation' },
  { value: 'shipped', label: 'Expediees' },
  { value: 'delivered', label: 'Livrees' },
  { value: 'cancelled', label: 'Annulees' },
];

/**
 * Icon components
 */
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

/**
 * Orders List Page
 * Displays a list of B2B orders with filtering and status management
 */
export default function CommandesPage() {
  const [statusFilter, setStatusFilter] = useState<B2BOrderStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const { orders, ordersLoading, isLoading } = useB2B();

  // Filter orders based on selected status
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  // Stats data
  const stats = useMemo(() => [
    { label: 'Total', value: orders.length },
    {
      label: 'En attente',
      value: orders.filter((o) => o.status === 'pending_approval').length,
      color: 'amber' as const
    },
    {
      label: 'En cours',
      value: orders.filter((o) => o.status === 'processing' || o.status === 'shipped').length,
      color: 'blue' as const
    },
    {
      label: 'Livrees',
      value: orders.filter((o) => o.status === 'delivered').length,
      color: 'green' as const
    },
  ], [orders]);

  // Loading state
  if (isLoading) {
    return <PageLoader message="Chargement des commandes..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <PageHeader
        title="Commandes"
        description="Historique et suivi de vos commandes"
        actions={
          <>
            <ActionButton
              variant="secondary"
              href="/commandes/bulk"
              icon={<UploadIcon />}
            >
              Import CSV
            </ActionButton>
            <ActionButton
              variant="primary"
              href="/catalogue"
              icon={<PlusIcon />}
            >
              Nouvelle commande
            </ActionButton>
          </>
        }
      />

      {/* Stats */}
      <StatsGrid stats={stats} columns={4} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <FilterTabs
          options={filterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <div className="sm:ml-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={cn(
              'px-4 py-2',
              'bg-white border border-border-light rounded-soft',
              'font-sans text-body-sm text-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500'
            )}
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="365">Cette annee</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {ordersLoading ? (
        <SectionLoader message="Chargement des commandes..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon="cart"
          message="Aucune commande trouvee"
          description={
            statusFilter !== 'all'
              ? 'Essayez de modifier vos filtres pour voir plus de resultats'
              : 'Vous n\'avez pas encore passe de commandes'
          }
          action={{
            label: 'Nouvelle commande',
            href: '/catalogue',
          }}
        />
      ) : (
        <div className="bg-white rounded-soft border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light bg-background-muted">
                  <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Commande
                  </th>
                  <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Articles
                  </th>
                  <th className="px-4 py-3 text-right font-sans text-caption font-medium text-text-muted">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Commande par
                  </th>
                  <th className="px-4 py-3 text-right font-sans text-caption font-medium text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background-muted transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        href={`/commandes/${order.id}`}
                        className="font-sans text-body-sm font-medium text-hermes-500 hover:text-hermes-600"
                      >
                        {order.orderNumber}
                      </Link>
                      {order.trackingNumber && (
                        <p className="font-sans text-caption text-text-muted">
                          {order.trackingNumber}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-sans text-body-sm text-text-secondary">
                        {formatDate(order.createdAt)}
                      </span>
                      <p className="font-sans text-caption text-text-muted">
                        {formatRelativeDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} size="sm" />
                      {order.estimatedDelivery && (
                        <p className="mt-1 font-sans text-caption text-text-muted">
                          Livraison prevue: {formatDate(order.estimatedDelivery)}
                        </p>
                      )}
                      {order.deliveredAt && (
                        <p className="mt-1 font-sans text-caption text-green-600">
                          Livree le {formatDate(order.deliveredAt)}
                        </p>
                      )}
                      {order.cancelledAt && (
                        <p className="mt-1 font-sans text-caption text-red-600">
                          Annulee le {formatDate(order.cancelledAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 font-sans text-body-sm text-text-secondary">
                      {order.itemCount} articles
                    </td>
                    <td className="px-4 py-4 text-right font-sans text-body-sm font-medium text-text-primary">
                      {formatCurrency(order.total, order.currency)}
                    </td>
                    <td className="px-4 py-4 font-sans text-body-sm text-text-secondary">
                      {order.orderedBy}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'shipped' && order.trackingNumber && (
                          <button
                            className={cn(
                              'px-3 py-1 rounded-soft',
                              'font-sans text-caption font-medium',
                              'bg-purple-100 text-purple-700 hover:bg-purple-200',
                              'transition-colors duration-200'
                            )}
                          >
                            Suivre
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button
                            className={cn(
                              'px-3 py-1 rounded-soft',
                              'font-sans text-caption font-medium',
                              'bg-hermes-100 text-hermes-700 hover:bg-hermes-200',
                              'transition-colors duration-200'
                            )}
                          >
                            Recommander
                          </button>
                        )}
                        <Link
                          href={`/commandes/${order.id}`}
                          className={cn(
                            'p-2 rounded-soft',
                            'text-text-muted hover:text-text-primary hover:bg-background-muted',
                            'transition-colors duration-200'
                          )}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-caption text-text-muted">
          Affichage de {filteredOrders.length} commandes
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled
            className={cn(
              'px-3 py-1.5 rounded-soft',
              'font-sans text-caption font-medium',
              'bg-white border border-border-light text-text-muted',
              'disabled:opacity-50'
            )}
          >
            Precedent
          </button>
          <button
            disabled
            className={cn(
              'px-3 py-1.5 rounded-soft',
              'font-sans text-caption font-medium',
              'bg-white border border-border-light text-text-muted',
              'disabled:opacity-50'
            )}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
