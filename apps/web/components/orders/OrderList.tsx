'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/formatters';
import { DataTable, type DataTableColumn, type SortState } from '@/components/ui/DataTable';
import { OrderStatusBadge, TrackingLink } from './OrderStatus';
import type { OrderSummary, B2BOrderStatus } from '@maison/types';

/**
 * Order actions menu
 */
interface OrderActionsProps {
  order: OrderSummary;
  onReorder?: (order: OrderSummary) => void;
  onExportInvoice?: (order: OrderSummary) => void;
}

function OrderActions({ order, onReorder, onExportInvoice }: OrderActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={cn(
          'p-2 rounded-lg',
          'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30'
        )}
        aria-label="Actions"
        aria-expanded={menuOpen}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <div className={cn(
            'absolute right-0 top-full mt-1 z-20',
            'w-48 py-1',
            'bg-white rounded-lg shadow-lg border border-neutral-200'
          )}>
            <Link
              href={`/commandes/${order.id}`}
              className={cn(
                'flex items-center gap-2 px-4 py-2',
                'font-sans text-body-sm text-neutral-900',
                'hover:bg-neutral-100 transition-colors'
              )}
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Voir les details
            </Link>

            {(order.status === 'delivered' || order.status === 'shipped') && onReorder && (
              <button
                onClick={() => {
                  onReorder(order);
                  setMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2',
                  'font-sans text-body-sm text-neutral-900',
                  'hover:bg-neutral-100 transition-colors'
                )}
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recommander
              </button>
            )}

            {order.status === 'shipped' && order.trackingNumber && (
              <a
                href={`https://www.laposte.fr/outils/suivre-vos-envois?code=${order.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-2 px-4 py-2',
                  'font-sans text-body-sm text-neutral-900',
                  'hover:bg-neutral-100 transition-colors'
                )}
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Suivre le colis
              </a>
            )}

            {onExportInvoice && (order.status === 'delivered' || order.status === 'shipped') && (
              <button
                onClick={() => {
                  onExportInvoice(order);
                  setMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2',
                  'font-sans text-body-sm text-neutral-900',
                  'hover:bg-neutral-100 transition-colors'
                )}
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Telecharger facture
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface OrderListProps {
  /** List of orders to display */
  orders: OrderSummary[];
  /** Loading state */
  isLoading?: boolean;
  /** Whether to enable row selection */
  selectable?: boolean;
  /** Selected order IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Callback when an order row is clicked */
  onRowClick?: (order: OrderSummary) => void;
  /** Callback to reorder */
  onReorder?: (order: OrderSummary) => void;
  /** Callback to export invoice */
  onExportInvoice?: (order: OrderSummary) => void;
  /** Sort state */
  sortState?: SortState;
  /** Callback when sort changes */
  onSortChange?: (sort: SortState | undefined) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional class names */
  className?: string;
}

/**
 * OrderList Component
 *
 * Displays orders in a sortable, selectable data table.
 * Supports bulk actions through selection.
 */
export function OrderList({
  orders,
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  onReorder,
  onExportInvoice,
  sortState,
  onSortChange,
  emptyMessage = 'Aucune commande trouvee',
  className,
}: OrderListProps) {
  // Define columns
  const columns = useMemo<DataTableColumn<OrderSummary>[]>(() => [
    {
      key: 'orderNumber',
      header: 'Commande',
      sortable: true,
      cell: (order) => (
        <div>
          <Link
            href={`/commandes/${order.id}`}
            className="font-sans text-body-sm font-medium text-accent hover:text-accent/90"
            onClick={(e) => e.stopPropagation()}
          >
            {order.orderNumber}
          </Link>
          {order.trackingNumber && (
            <div className="mt-1" onClick={(e) => e.stopPropagation()}>
              <TrackingLink trackingNumber={order.trackingNumber} />
            </div>
          )}
        </div>
      ),
      minWidth: 140,
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      sortFn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      cell: (order) => (
        <div>
          <span className="font-sans text-body-sm text-neutral-600">
            {formatDate(order.createdAt)}
          </span>
          <p className="font-sans text-caption text-neutral-500">
            {formatRelativeDate(order.createdAt)}
          </p>
        </div>
      ),
      minWidth: 120,
      hideOnMobile: true,
    },
    {
      key: 'itemCount',
      header: 'Articles',
      sortable: true,
      align: 'center',
      cell: (order) => (
        <span className="font-sans text-body-sm text-neutral-600">
          {order.itemCount}
        </span>
      ),
      width: 80,
      hideOnMobile: true,
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      align: 'right',
      sortFn: (a, b) => a.total - b.total,
      cell: (order) => (
        <span className="font-sans text-body-sm font-medium text-neutral-900">
          {formatCurrency(order.total, order.currency)}
        </span>
      ),
      minWidth: 100,
    },
    {
      key: 'status',
      header: 'Statut',
      sortable: true,
      cell: (order) => (
        <div>
          <OrderStatusBadge status={order.status} size="sm" showIcon={false} />
          {order.estimatedDelivery && order.status === 'shipped' && (
            <p className="mt-1 font-sans text-caption text-neutral-500">
              Livraison: {formatDate(order.estimatedDelivery)}
            </p>
          )}
          {order.deliveredAt && (
            <p className="mt-1 font-sans text-caption text-green-600">
              {formatDate(order.deliveredAt)}
            </p>
          )}
          {order.cancelledAt && (
            <p className="mt-1 font-sans text-caption text-red-600">
              {formatDate(order.cancelledAt)}
            </p>
          )}
        </div>
      ),
      minWidth: 150,
    },
    {
      key: 'orderedBy',
      header: 'Commande par',
      sortable: true,
      cell: (order) => (
        <span className="font-sans text-body-sm text-neutral-600">
          {order.orderedBy}
        </span>
      ),
      minWidth: 120,
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (order) => (
        <OrderActions
          order={order}
          onReorder={onReorder}
          onExportInvoice={onExportInvoice}
        />
      ),
      width: 50,
    },
  ], [onReorder, onExportInvoice]);

  // Handle selection
  const handleSelectionChange = useCallback((keys: (string | number)[]) => {
    onSelectionChange?.(keys.map(String));
  }, [onSelectionChange]);

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200', className)}>
      <DataTable
        data={orders}
        columns={columns}
        getRowKey={(order) => order.id}
        selectable={selectable}
        selectedKeys={selectedIds}
        onSelectionChange={handleSelectionChange}
        sortState={sortState}
        onSortChange={onSortChange}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
        hoverable
        stickyHeader
      />
    </div>
  );
}

export default OrderList;
