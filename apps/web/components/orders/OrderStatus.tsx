'use client';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import type { B2BOrderStatus, OrderHistoryEntry } from '@maison/types';

/**
 * Status configuration with colors and labels
 */
const statusConfig: Record<B2BOrderStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  pending_approval: {
    label: 'En attente d\'approbation',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  pending_payment: {
    label: 'Paiement en attente',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  processing: {
    label: 'En preparation',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  shipped: {
    label: 'Expediee',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    ),
  },
  delivered: {
    label: 'Livree',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  cancelled: {
    label: 'Annulee',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  returned: {
    label: 'Retournee',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
};

/**
 * Order status progression for timeline
 */
const statusProgression: B2BOrderStatus[] = [
  'pending_approval',
  'pending_payment',
  'processing',
  'shipped',
  'delivered',
];

interface OrderStatusBadgeProps {
  /** Current order status */
  status: B2BOrderStatus;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show icon */
  showIcon?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * OrderStatusBadge Component
 *
 * Displays a colored badge with the order status.
 */
export function OrderStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-caption',
    md: 'px-3 py-1 text-body-sm',
    lg: 'px-4 py-1.5 text-body',
  };

  return (
    <span
      role="status"
      aria-label={`Statut: ${config.label}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-sans font-medium',
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}

interface OrderStatusTimelineProps {
  /** Current order status */
  status: B2BOrderStatus;
  /** Order history entries for detailed timeline */
  history?: OrderHistoryEntry[];
  /** Tracking number */
  trackingNumber?: string;
  /** Tracking URL */
  trackingUrl?: string;
  /** Estimated delivery date */
  estimatedDelivery?: string;
  /** Actual delivery date */
  deliveredAt?: string;
  /** Shipped date */
  shippedAt?: string;
  /** Whether to show compact version */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * OrderStatusTimeline Component
 *
 * Displays the order progression as a visual timeline.
 */
export function OrderStatusTimeline({
  status,
  history = [],
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  deliveredAt,
  shippedAt,
  compact = false,
  className,
}: OrderStatusTimelineProps) {
  // Determine which steps are completed
  const currentIndex = statusProgression.indexOf(status);
  const isTerminal = status === 'cancelled' || status === 'returned';

  // Get relevant history entries for each status
  const getHistoryForStatus = (s: B2BOrderStatus) => {
    const eventMap: Record<string, string[]> = {
      pending_approval: ['created', 'submitted'],
      pending_payment: ['approved', 'payment_received'],
      processing: ['processing'],
      shipped: ['shipped', 'tracking_updated'],
      delivered: ['delivered', 'out_for_delivery'],
    };
    const events = eventMap[s] || [];
    return history.filter(h => events.includes(h.eventType));
  };

  if (isTerminal) {
    // Show terminal status
    const config = statusConfig[status];
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-100">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            config.bgColor
          )}>
            <span className={config.color}>{config.icon}</span>
          </div>
          <div>
            <p className={cn('font-sans text-body-sm font-medium', config.color)}>
              {config.label}
            </p>
            {status === 'cancelled' && history.find(h => h.eventType === 'cancelled') && (
              <p className="font-sans text-caption text-neutral-500 mt-0.5">
                {formatDate(history.find(h => h.eventType === 'cancelled')!.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Steps */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-neutral-200" />
        <div
          className="absolute left-[18px] top-6 w-0.5 bg-accent transition-all duration-500"
          style={{
            height: `${Math.min((currentIndex / (statusProgression.length - 1)) * 100, 100)}%`,
          }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {statusProgression.map((s, index) => {
            const config = statusConfig[s];
            const isCompleted = index <= currentIndex;
            const isCurrent = s === status;
            const historyEntries = getHistoryForStatus(s);

            return (
              <div key={s} className="flex items-start gap-4">
                {/* Step Circle */}
                <div
                  className={cn(
                    'relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    isCompleted
                      ? cn('border-accent', isCurrent ? 'bg-accent text-white' : 'bg-accent/10 text-accent')
                      : 'border-neutral-200 bg-white text-neutral-500'
                  )}
                >
                  {isCompleted ? (
                    isCurrent ? config.icon : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )
                  ) : (
                    <span className="font-sans text-caption font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className={cn(
                    'font-sans text-body-sm font-medium',
                    isCompleted ? 'text-neutral-900' : 'text-neutral-500'
                  )}>
                    {config.label}
                  </p>

                  {!compact && historyEntries.length > 0 && (
                    <p className="font-sans text-caption text-neutral-500 mt-0.5">
                      {formatDate(historyEntries[historyEntries.length - 1].createdAt)}
                    </p>
                  )}

                  {/* Shipping Details */}
                  {s === 'shipped' && isCurrent && trackingNumber && (
                    <div className="mt-2 p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-caption text-purple-700">
                          N° suivi: {trackingNumber}
                        </span>
                        {trackingUrl && (
                          <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-caption font-medium text-purple-700 hover:text-purple-800"
                          >
                            Suivre
                          </a>
                        )}
                      </div>
                      {estimatedDelivery && (
                        <p className="font-sans text-caption text-purple-600 mt-1">
                          Livraison estimee: {formatDate(estimatedDelivery)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Delivery Confirmation */}
                  {s === 'delivered' && isCurrent && deliveredAt && (
                    <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="font-sans text-caption text-green-700">
                        Livree le {formatDate(deliveredAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface TrackingLinkProps {
  /** Tracking number */
  trackingNumber: string;
  /** Tracking URL */
  trackingUrl?: string;
  /** Carrier name */
  carrier?: string;
  /** Additional class names */
  className?: string;
}

/**
 * TrackingLink Component
 *
 * Displays a clickable tracking number that opens tracking page.
 */
export function TrackingLink({
  trackingNumber,
  trackingUrl,
  carrier,
  className,
}: TrackingLinkProps) {
  // Default tracking URLs for common carriers
  const getTrackingUrl = () => {
    if (trackingUrl) return trackingUrl;

    // Try to detect carrier from tracking number pattern
    if (trackingNumber.startsWith('FR') || trackingNumber.startsWith('LV')) {
      return `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`;
    }
    if (trackingNumber.startsWith('JD')) {
      return `https://www.chronopost.fr/tracking-no-cms/suivi-page?liession=${trackingNumber}`;
    }
    if (trackingNumber.startsWith('1Z')) {
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    }

    return null;
  };

  const url = getTrackingUrl();

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1.5',
          'font-sans text-body-sm font-medium text-purple-600',
          'hover:text-purple-700 hover:underline',
          'transition-colors duration-200',
          className
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {trackingNumber}
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5',
      'font-sans text-body-sm text-neutral-600',
      className
    )}>
      <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {trackingNumber}
    </span>
  );
}

export { statusConfig, statusProgression };
export default OrderStatusBadge;
