'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getInitials,
  getApprovalStatusLabel,
} from '@/lib/formatters';
import { useB2B, useB2BPermissions } from '@/contexts/B2BContext';
import type { ApprovalStatus } from '@maison/types';
import {
  StatusBadge,
  EntityTypeBadge,
  PageLoader,
  SectionLoader,
  EmptyState,
  StatsGrid,
  FilterTabs,
} from '@/components/b2b';

/**
 * Priority colors
 */
const priorityColors = {
  urgent: 'text-red-600',
  high: 'text-red-500',
  normal: 'text-amber-500',
  low: 'text-green-500',
};

/**
 * Filter options for approval status
 */
const filterOptions: { value: ApprovalStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvees' },
  { value: 'rejected', label: 'Refusees' },
  { value: 'all', label: 'Toutes' },
];

/**
 * Approvals Page
 * Displays a list of B2B approval requests with filtering and actions
 */
export default function ApprobationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('pending');
  const { approvals, approvalsLoading, isLoading } = useB2B();
  const { canApproveOrders } = useB2BPermissions();

  // Filter approvals based on selected status
  const filteredApprovals = useMemo(() => {
    if (statusFilter === 'all') return approvals;
    return approvals.filter((approval) => approval.status === statusFilter);
  }, [approvals, statusFilter]);

  // Count pending approvals
  const pendingCount = useMemo(() => {
    return approvals.filter((a) => a.status === 'pending' || a.status === 'in_review').length;
  }, [approvals]);

  // Stats data
  const stats = useMemo(() => [
    { label: 'Total demandes', value: approvals.length },
    { label: 'En attente', value: pendingCount, color: 'amber' as const },
    {
      label: 'Approuvees',
      value: approvals.filter(a => a.status === 'approved').length,
      color: 'green' as const
    },
    {
      label: 'Refusees',
      value: approvals.filter(a => a.status === 'rejected').length,
      color: 'red' as const
    },
  ], [approvals, pendingCount]);

  // Loading state
  if (isLoading) {
    return <PageLoader message="Chargement des approbations..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header>
        <h1 className="font-sans text-heading-3 text-content-primary">
          Approbations
        </h1>
        <p className="mt-1 font-sans text-body text-content-muted" aria-live="polite">
          {pendingCount > 0
            ? `${pendingCount} demande${pendingCount > 1 ? 's' : ''} en attente de votre decision`
            : 'Toutes les demandes ont ete traitees'
          }
        </p>
      </header>

      {/* Filters */}
      <FilterTabs
        options={filterOptions.map((f) => ({
          ...f,
          count: f.value === 'pending'
            ? pendingCount
            : f.value === 'all'
              ? approvals.length
              : approvals.filter(a => a.status === f.value).length,
        }))}
        value={statusFilter}
        onChange={setStatusFilter}
        showCounts
      />

      {/* Approvals List */}
      <section aria-labelledby="approvals-list-heading" className="space-y-4">
        <h2 id="approvals-list-heading" className="sr-only">Liste des demandes d'approbation</h2>
        {approvalsLoading ? (
          <SectionLoader message="Chargement..." />
        ) : filteredApprovals.length === 0 ? (
          <EmptyState
            icon="check"
            message={
              statusFilter === 'pending'
                ? 'Aucune approbation en attente'
                : `Aucune approbation ${getApprovalStatusLabel(statusFilter)?.toLowerCase() ?? ''}`
            }
          />
        ) : (
          <ul role="list" className="space-y-4">
            {filteredApprovals.map((approval) => (
              <li key={approval.id}>
                <article
                  className="bg-white rounded-lg border border-stroke-light overflow-hidden"
                  aria-labelledby={`approval-${approval.id}-title`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left section */}
                      <div className="flex items-start gap-4">
                        {/* Priority indicator */}
                        {approval.status === 'pending' && (
                          <div
                            className={cn('mt-1', priorityColors[approval.priority])}
                            role="img"
                            aria-label={`Priorite ${approval.priority}`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        {/* Avatar */}
                        <div
                          className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0"
                          aria-hidden="true"
                        >
                          <span className="font-sans text-body font-medium text-primary-600">
                            {getInitials(approval.requesterName)}
                          </span>
                        </div>

                        {/* Content */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <EntityTypeBadge entityType={approval.entityType} />
                            <span
                              id={`approval-${approval.id}-title`}
                              className="font-sans text-body-sm font-medium text-primary"
                            >
                              {approval.entityReference}
                            </span>
                            <StatusBadge status={approval.status} size="sm" />
                          </div>
                          <p className="mt-1 font-sans text-body-sm text-content-primary">
                            {approval.entitySummary}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-content-muted">
                            <span className="font-sans text-caption">
                              Par {approval.requesterName}
                            </span>
                            <span className="font-sans text-caption">
                              <time dateTime={approval.createdAt}>
                                {formatRelativeDate(approval.createdAt)}
                              </time>
                            </span>
                          </div>
                          {approval.status === 'pending' && approval.currentLevel > 0 && (
                            <p className="mt-2 font-sans text-caption text-amber-600" role="note">
                              Niveau {approval.currentLevel}/{approval.totalLevels}
                            </p>
                          )}
                          {approval.isOverdue && (
                            <p className="mt-2 font-sans text-caption text-red-600" role="alert">
                              En retard
                            </p>
                          )}
                          {approval.dueAt && !approval.isOverdue && approval.status === 'pending' && (
                            <p className="mt-2 font-sans text-caption text-content-muted">
                              Echance: <time dateTime={approval.dueAt}>{formatDate(approval.dueAt)}</time>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right section - Amount and Actions */}
                      <div className="text-right flex-shrink-0">
                        {approval.entityAmount && (
                          <p className="font-sans text-heading-4 text-content-primary">
                            {formatCurrency(approval.entityAmount, approval.entityCurrency)}
                          </p>
                        )}

                        {approval.status === 'pending' && canApproveOrders && (
                          <div className="mt-4 flex items-center gap-2" role="group" aria-label="Actions">
                            <button
                              className={cn(
                                'px-4 py-2 rounded-lg',
                                'font-sans text-body-sm font-medium',
                                'bg-green-500 text-white hover:bg-green-600',
                                'transition-colors duration-200',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2'
                              )}
                              aria-label={`Approuver ${approval.entityReference}`}
                            >
                              Approuver
                            </button>
                            <button
                              className={cn(
                                'px-4 py-2 rounded-lg',
                                'font-sans text-body-sm font-medium',
                                'bg-white border border-red-300 text-red-600 hover:bg-red-50',
                                'transition-colors duration-200',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2'
                              )}
                              aria-label={`Refuser ${approval.entityReference}`}
                            >
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick Stats */}
      {approvals.length > 0 && <StatsGrid stats={stats} columns={4} />}
    </div>
  );
}
