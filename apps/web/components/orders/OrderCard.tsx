'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/formatters';
import { OrderStatusBadge, TrackingLink } from './OrderStatus';
import type { OrderSummary } from '@maison/types';

interface OrderCardProps {
  /** Order data */
  order: OrderSummary;
  /** Whether the card is selected */
  selected?: boolean;
  /** Callback when card is clicked */
  onClick?: (order: OrderSummary) => void;
  /** Callback when reorder button is clicked */
  onReorder?: (order: OrderSummary) => void;
  /** Callback when view invoice button is clicked */
  onViewInvoice?: (order: OrderSummary) => void;
  /** Additional class names */
  className?: string;
}

/**
 * OrderCard Component
 *
 * Mobile-friendly card view for displaying order information.
 * Shows essential info with status badge and quick actions.
 */
export function OrderCard({
  order,
  selected = false,
  onClick,
  onReorder,
  onViewInvoice,
  className,
}: OrderCardProps) {
  const handleCardClick = () => {
    onClick?.(order);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border overflow-hidden',
        'transition-all duration-200',
        selected ? 'border-accent ring-2 ring-accent/20' : 'border-neutral-200',
        onClick && 'cursor-pointer hover:shadow-sm hover:border-neutral-300',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-100/50">
        <div className="flex items-center gap-3">
          <Link
            href={`/commandes/${order.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-sans text-body-sm font-medium text-accent hover:text-accent/90"
          >
            {order.orderNumber}
          </Link>
          <OrderStatusBadge status={order.status} size="sm" showIcon={false} />
        </div>
        <span className="font-sans text-body font-semibold text-neutral-900">
          {formatCurrency(order.total, order.currency)}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date and Items */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-caption text-neutral-500">
              {formatDate(order.createdAt)}
            </p>
            <p className="font-sans text-caption text-neutral-500">
              {formatRelativeDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-sans text-body-sm text-neutral-600">
              {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
            </p>
            <p className="font-sans text-caption text-neutral-500">
              par {order.orderedBy}
            </p>
          </div>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-purple-50 border border-purple-100"
            onClick={(e) => e.stopPropagation()}
          >
            <TrackingLink trackingNumber={order.trackingNumber} />
            {order.estimatedDelivery && (
              <span className="font-sans text-caption text-purple-600">
                Livraison: {formatDate(order.estimatedDelivery)}
              </span>
            )}
          </div>
        )}

        {/* Delivery Status */}
        {order.deliveredAt && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-green-50 border border-green-100">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-sans text-caption text-green-700">
              Livree le {formatDate(order.deliveredAt)}
            </span>
          </div>
        )}

        {/* Cancelled Status */}
        {order.cancelledAt && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gray-50 border border-gray-200">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-sans text-caption text-gray-600">
              Annulee le {formatDate(order.cancelledAt)}
              {order.cancelReason && ` - ${order.cancelReason}`}
            </span>
          </div>
        )}

        {/* Shipping Address (truncated) */}
        {order.shippingAddress && (
          <p className="font-sans text-caption text-neutral-500 truncate">
            <svg className="w-3.5 h-3.5 inline-block mr-1 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {order.shippingAddress}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-4 pt-0">
        <Link
          href={`/commandes/${order.id}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'font-sans text-caption font-medium',
            'border border-neutral-200 text-neutral-900',
            'hover:bg-neutral-100 transition-colors'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Voir
        </Link>

        {(order.status === 'delivered' || order.status === 'shipped') && onReorder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReorder(order);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
              'font-sans text-caption font-medium',
              'bg-accent text-white',
              'hover:bg-accent/90 transition-colors'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recommander
          </button>
        )}

        {(order.status === 'delivered' || order.status === 'shipped') && onViewInvoice && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewInvoice(order);
            }}
            className={cn(
              'p-2 rounded-lg',
              'border border-neutral-200 text-neutral-500',
              'hover:bg-neutral-100 hover:text-neutral-900 transition-colors'
            )}
            aria-label="Telecharger la facture"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface OrderCardsGridProps {
  /** Orders to display */
  orders: OrderSummary[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when an order card is clicked */
  onOrderClick?: (order: OrderSummary) => void;
  /** Callback to reorder */
  onReorder?: (order: OrderSummary) => void;
  /** Callback to view invoice */
  onViewInvoice?: (order: OrderSummary) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional class names */
  className?: string;
}

/**
 * OrderCardsGrid Component
 *
 * Displays orders in a responsive card grid layout.
 * Ideal for mobile and tablet views.
 */
export function OrderCardsGrid({
  orders,
  isLoading = false,
  onOrderClick,
  onReorder,
  onViewInvoice,
  emptyMessage = 'Aucune commande trouvee',
  className,
}: OrderCardsGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-neutral-200 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-24 bg-neutral-100 rounded" />
              <div className="h-5 w-16 bg-neutral-100 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-neutral-100 rounded" />
              <div className="h-4 w-3/4 bg-neutral-100 rounded" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-9 flex-1 bg-neutral-100 rounded" />
              <div className="h-9 flex-1 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
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
        <p className="font-sans text-body text-neutral-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onClick={onOrderClick}
          onReorder={onReorder}
          onViewInvoice={onViewInvoice}
        />
      ))}
    </div>
  );
}

export default OrderCard;
