'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useB2BPermissions } from '@/contexts/B2BContext';
import {
  useQuotesFeatures,
  useQuickOrderFeatures,
  useOrdersFeatures,
  useApprovalsFeatures,
  useDashboardFeatures,
} from '@/contexts/FeatureContext';

/**
 * Quick action definition
 */
interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  permission?: keyof ReturnType<typeof useB2BPermissions>;
}

/**
 * QuickActionsWidget Component
 *
 * Displays quick access buttons for common B2B actions:
 * - Reorder from previous order
 * - Create new order
 * - Request a quote
 * - View pending approvals
 */
export function QuickActionsWidget() {
  const permissions = useB2BPermissions();

  // Feature flags
  const { isEnabled: hasQuotes } = useQuotesFeatures();
  const { hasCsvImport, isEnabled: hasQuickOrder } = useQuickOrderFeatures();
  const { isEnabled: hasOrders, hasReorder } = useOrdersFeatures();
  const { isEnabled: hasApprovals } = useApprovalsFeatures();
  const { hasAnalytics } = useDashboardFeatures();

  const quickActions: (QuickAction & { featureEnabled?: boolean })[] = [
    {
      id: 'new_order',
      label: 'Nouvelle commande',
      description: 'Commander des produits',
      href: '/catalogue',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'bg-accent text-white hover:bg-accent/90',
      permission: 'canPlaceOrder',
      featureEnabled: hasOrders, // Gated by orders module
    },
    {
      id: 'reorder',
      label: 'Recommander',
      description: 'Repasser une commande',
      href: '/commandes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'bg-purple-500 text-white hover:bg-purple-600',
      permission: 'canPlaceOrder',
      featureEnabled: hasOrders && hasReorder, // Gated by orders.reorder
    },
    {
      id: 'new_quote',
      label: 'Demander un devis',
      description: 'Obtenir un prix special',
      href: '/devis/nouveau',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-blue-500 text-white hover:bg-blue-600',
      permission: 'canCreateQuote',
      featureEnabled: hasQuotes, // Gated by quotes module
    },
    {
      id: 'bulk_order',
      label: 'Import CSV',
      description: 'Commande groupee',
      href: '/commandes/bulk',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      color: 'bg-green-500 text-white hover:bg-green-600',
      permission: 'canPlaceOrder',
      featureEnabled: hasQuickOrder && hasCsvImport, // Gated by quickOrder.csvImport
    },
  ];

  // Filter actions based on both features AND permissions
  const availableActions = quickActions.filter((action) => {
    // Check feature flag first
    if (action.featureEnabled === false) return false;
    // Then check permissions
    if (!action.permission) return true;
    return permissions[action.permission];
  });

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-sans font-semibold text-heading-6 text-neutral-900">
          Actions rapides
        </h2>
      </div>

      {/* Actions Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {availableActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-lg',
              'transition-all duration-200',
              action.color
            )}
          >
            {action.icon}
            <span className="font-sans text-caption font-medium mt-2 text-center">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Additional Quick Links - Feature Gated */}
      <div className="p-4 pt-0 space-y-2">
        {/* Approvals Link - Gated by approvals module */}
        {hasApprovals && (
          <Link
            href="/approbations"
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              'bg-neutral-100 hover:bg-neutral-50',
              'transition-colors duration-200'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-sans text-body-sm text-neutral-900">
                Approbations en attente
              </span>
            </div>
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Reports Link - Gated by analytics subfeature */}
        {hasAnalytics && (
          <Link
            href="/rapports"
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              'bg-neutral-100 hover:bg-neutral-50',
              'transition-colors duration-200'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-sans text-body-sm text-neutral-900">
                Rapports et statistiques
              </span>
            </div>
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

export default QuickActionsWidget;
