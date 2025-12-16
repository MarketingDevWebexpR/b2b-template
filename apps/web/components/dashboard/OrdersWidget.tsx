'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';
import { useOrdersFeatures, useDashboardFeatures } from '@/contexts/FeatureContext';
import { StatusBadge } from '@/components/b2b';

/**
 * OrdersWidget Component
 *
 * Displays the 5 most recent orders with status and quick actions.
 * Part of the B2B Dashboard.
 */
export function OrdersWidget() {
  const { orders, ordersLoading } = useB2B();

  // Feature flags
  const { isEnabled: hasOrders, hasOrderHistory } = useOrdersFeatures();
  const { hasRecentOrders } = useDashboardFeatures();

  // Get the 5 most recent orders
  const recentOrders = orders.slice(0, 5);

  // Don't render if orders module or recentOrders feature is disabled
  if (!hasOrders || !hasRecentOrders) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-sans font-semibold text-heading-6 text-neutral-900">
          Commandes recentes
        </h2>
        <Link
          href="/commandes"
          className="font-sans text-caption text-accent hover:text-accent/90 transition-colors"
        >
          Voir toutes
        </Link>
      </div>

      {/* Content */}
      <div className="divide-y divide-neutral-200">
        {ordersLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-neutral-100 rounded" />
                <div className="h-5 w-20 bg-neutral-100 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-32 bg-neutral-100 rounded" />
                <div className="h-4 w-16 bg-neutral-100 rounded" />
              </div>
            </div>
          ))
        ) : recentOrders.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="font-sans text-body-sm text-neutral-500 mb-3">
              Aucune commande recente
            </p>
            <Link
              href="/catalogue"
              className={cn(
                'inline-flex items-center px-4 py-2 rounded-lg',
                'font-sans text-body-sm font-medium',
                'bg-accent text-white',
                'hover:bg-accent/90 transition-colors'
              )}
            >
              Passer une commande
            </Link>
          </div>
        ) : (
          // Orders list
          recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/commandes/${order.id}`}
              className={cn(
                'block p-4',
                'hover:bg-neutral-100 transition-colors'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-body-sm font-medium text-neutral-900">
                  {order.orderNumber}
                </span>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-caption text-neutral-500">
                    {order.itemCount} articles
                  </span>
                  <span className="text-neutral-500">-</span>
                  <span className="font-sans text-caption text-neutral-500">
                    {formatRelativeDate(order.createdAt)}
                  </span>
                </div>
                <span className="font-sans text-body-sm font-medium text-neutral-900">
                  {formatCurrency(order.total, order.currency)}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="mt-2 flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-neutral-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="font-sans text-caption text-purple-600">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default OrdersWidget;
