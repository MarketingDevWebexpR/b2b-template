'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/formatters';
import { useB2B, useB2BPermissions } from '@/contexts/B2BContext';
import type { QuoteStatus } from '@maison/types';
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
 * Filter options for quote status
 */
const filterOptions: { value: QuoteStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'submitted', label: 'En attente' },
  { value: 'responded', label: 'Reponse recue' },
  { value: 'accepted', label: 'Acceptes' },
  { value: 'rejected', label: 'Refuses' },
  { value: 'expired', label: 'Expires' },
];

/**
 * Plus icon component
 */
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

/**
 * Quotes List Page
 * Displays a list of B2B quotes with filtering and status management
 */
export default function DevisPage() {
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const { quotes, quotesLoading, isLoading } = useB2B();
  const { canCreateQuote } = useB2BPermissions();

  // Filter quotes based on selected status
  const filteredQuotes = useMemo(() => {
    if (statusFilter === 'all') return quotes;
    return quotes.filter((quote) => quote.status === statusFilter);
  }, [quotes, statusFilter]);

  // Count pending quotes (submitted or responded)
  const pendingCount = useMemo(() => {
    return quotes.filter(
      (q) => q.status === 'submitted' || q.status === 'responded' || q.status === 'under_review'
    ).length;
  }, [quotes]);

  // Stats data
  const stats = useMemo(() => [
    { label: 'Total devis', value: quotes.length },
    { label: 'En attente', value: pendingCount, color: 'amber' as const },
    {
      label: 'Acceptes',
      value: quotes.filter(q => q.status === 'accepted' || q.status === 'converted').length,
      color: 'green' as const
    },
    {
      label: 'Valeur totale',
      value: formatCurrency(
        quotes
          .filter(q => q.status !== 'rejected' && q.status !== 'expired' && q.status !== 'cancelled')
          .reduce((sum, q) => sum + q.total, 0)
      ),
    },
  ], [quotes, pendingCount]);

  // Loading state
  if (isLoading) {
    return <PageLoader message="Chargement des devis..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <PageHeader
        title="Devis"
        description={
          pendingCount > 0
            ? `${pendingCount} devis en attente d'action`
            : 'Gerez vos demandes de devis'
        }
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

      {/* Filters */}
      <FilterTabs
        options={filterOptions}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      {/* Quotes List */}
      <section
        className="bg-white rounded-soft border border-border-light overflow-hidden"
        aria-labelledby="quotes-list-heading"
      >
        <h2 id="quotes-list-heading" className="sr-only">Liste des devis</h2>
        {quotesLoading ? (
          <SectionLoader message="Chargement..." />
        ) : filteredQuotes.length === 0 ? (
          <EmptyState
            icon="document"
            message={
              statusFilter === 'all'
                ? 'Aucun devis pour le moment'
                : `Aucun devis avec ce statut`
            }
            action={canCreateQuote && statusFilter === 'all' ? {
              label: 'Creer votre premier devis',
              href: '/devis/nouveau',
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto" role="region" aria-label="Tableau des devis" tabIndex={0}>
            <table className="w-full" aria-label="Liste des devis">
              <thead>
                <tr className="border-b border-border-light bg-background-muted">
                  <th scope="col" className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Devis
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Statut
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Articles
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-sans text-caption font-medium text-text-muted">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                    Expire le
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-sans text-caption font-medium text-text-muted">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-background-muted transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        href={`/devis/${quote.id}`}
                        className={cn(
                          'font-sans text-body-sm font-medium text-hermes-500 hover:text-hermes-600',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft'
                        )}
                      >
                        {quote.quoteNumber}
                      </Link>
                      <p className="font-sans text-caption text-text-muted">
                        {formatRelativeDate(quote.updatedAt)}
                      </p>
                      {quote.hasUnreadMessages && (
                        <span className="inline-flex items-center gap-1 mt-1 text-hermes-500" role="status">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <circle cx="10" cy="10" r="6" />
                          </svg>
                          <span className="text-xs">Nouveau message</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-sans text-body-sm text-text-secondary">
                      {formatDate(quote.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={quote.status} size="sm" />
                    </td>
                    <td className="px-4 py-4 font-sans text-body-sm text-text-secondary">
                      {quote.itemCount} article{quote.itemCount > 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-4 text-right font-sans text-body-sm font-medium text-text-primary">
                      {formatCurrency(quote.total, quote.currency)}
                    </td>
                    <td className="px-4 py-4 font-sans text-body-sm text-text-secondary">
                      {quote.status === 'accepted' || quote.status === 'rejected' || quote.status === 'converted'
                        ? <span aria-label="Non applicable">-</span>
                        : formatDate(quote.validUntil)
                      }
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2" role="group" aria-label={`Actions pour devis ${quote.quoteNumber}`}>
                        {quote.status === 'responded' && (
                          <Link
                            href={`/devis/${quote.id}`}
                            className={cn(
                              'px-3 py-1 rounded-soft',
                              'font-sans text-caption font-medium',
                              'bg-hermes-500 text-white hover:bg-hermes-600',
                              'transition-colors duration-200',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-300 focus-visible:ring-offset-2'
                            )}
                          >
                            Voir la reponse
                          </Link>
                        )}
                        {quote.status === 'converted' && (
                          <Link
                            href={`/commandes`}
                            className={cn(
                              'px-3 py-1 rounded-soft',
                              'font-sans text-caption font-medium',
                              'bg-green-100 text-green-700 hover:bg-green-200',
                              'transition-colors duration-200',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2'
                            )}
                          >
                            Voir commande
                          </Link>
                        )}
                        <Link
                          href={`/devis/${quote.id}`}
                          className={cn(
                            'p-2 rounded-soft',
                            'text-text-muted hover:text-text-primary hover:bg-background-muted',
                            'transition-colors duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
                          )}
                          aria-label={`Voir les details du devis ${quote.quoteNumber}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
        )}
      </section>

      {/* Quick Stats */}
      {quotes.length > 0 && <StatsGrid stats={stats} columns={4} />}
    </div>
  );
}
