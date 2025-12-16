'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';

/**
 * Alert type definitions
 */
interface Alert {
  id: string;
  type: 'low_stock' | 'promotion' | 'price_change' | 'new_product' | 'order_update';
  title: string;
  description: string;
  link?: string;
  createdAt: string;
}

/**
 * Mock alerts data (in production, this would come from API/context)
 */
const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    type: 'low_stock',
    title: 'Stock faible',
    description: 'Bracelet Or 18K - Maille Figaro (10 restants)',
    link: '/products/prod_001',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  },
  {
    id: 'alert_002',
    type: 'promotion',
    title: 'Promotion en cours',
    description: '-15% sur les nouveautes Printemps jusqu\'au 31 dec.',
    link: '/categories?sort=newest',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'alert_003',
    type: 'price_change',
    title: 'Changement de prix',
    description: 'Nouveaux tarifs B2B appliques sur 12 produits',
    link: '/catalogue',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

/**
 * Icon for each alert type
 */
const AlertIcon = ({ type }: { type: Alert['type'] }) => {
  switch (type) {
    case 'low_stock':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'promotion':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
    case 'price_change':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'new_product':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 'order_update':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

/**
 * Get alert background color
 */
const getAlertColor = (type: Alert['type']) => {
  switch (type) {
    case 'low_stock':
      return 'bg-amber-50 text-amber-700';
    case 'promotion':
      return 'bg-green-50 text-green-700';
    case 'price_change':
      return 'bg-blue-50 text-blue-700';
    case 'new_product':
      return 'bg-purple-50 text-purple-700';
    case 'order_update':
      return 'bg-accent/5 text-accent';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

/**
 * AlertsWidget Component
 *
 * Displays important alerts such as:
 * - Low stock on favorite products
 * - Active promotions
 * - Price changes
 * - New products
 */
export function AlertsWidget() {
  const alerts = mockAlerts;

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <h2 className="font-sans font-semibold text-heading-6 text-neutral-900">
            Alertes
          </h2>
          {alerts.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-medium">
              {alerts.length}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-neutral-200">
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <svg
              className="w-10 h-10 mx-auto mb-2 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="font-sans text-body-sm text-neutral-500">
              Aucune alerte pour le moment
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  getAlertColor(alert.type)
                )}>
                  <AlertIcon type={alert.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-body-sm font-medium text-neutral-900">
                    {alert.title}
                  </p>
                  <p className="font-sans text-caption text-neutral-500 mt-0.5 line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-sans text-caption text-neutral-500">
                      {formatRelativeDate(alert.createdAt)}
                    </span>
                    {alert.link && (
                      <Link
                        href={alert.link}
                        className="font-sans text-caption text-accent hover:text-accent/90"
                      >
                        Voir
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertsWidget;
