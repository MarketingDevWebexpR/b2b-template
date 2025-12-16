import { cn } from '@/lib/utils';
import type { QuoteStatus, ApprovalStatus, B2BOrderStatus } from '@maison/types';

/**
 * All possible status values
 */
export type StatusType = QuoteStatus | ApprovalStatus | B2BOrderStatus | 'all';

/**
 * Status badge color variants
 */
const statusColors: Record<string, string> = {
  // Quote statuses
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-amber-100 text-amber-800',
  under_review: 'bg-amber-100 text-amber-800',
  pending_info: 'bg-orange-100 text-orange-800',
  responded: 'bg-blue-100 text-blue-800',
  negotiating: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
  converted: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  // Approval statuses
  pending: 'bg-amber-100 text-amber-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  escalated: 'bg-purple-100 text-purple-800',
  delegated: 'bg-indigo-100 text-indigo-800',
  // Order statuses
  pending_approval: 'bg-amber-100 text-amber-800',
  pending_payment: 'bg-orange-100 text-orange-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  returned: 'bg-red-100 text-red-800',
};

/**
 * Status labels (French)
 */
const statusLabels: Record<string, string> = {
  // Quote statuses
  draft: 'Brouillon',
  submitted: 'Soumis',
  under_review: 'En cours d\'examen',
  pending_info: 'Info demandee',
  responded: 'Reponse recue',
  negotiating: 'En negociation',
  accepted: 'Accepte',
  rejected: 'Refuse',
  expired: 'Expire',
  converted: 'Converti',
  cancelled: 'Annule',
  // Approval statuses
  pending: 'En attente',
  in_review: 'En cours',
  approved: 'Approuvee',
  escalated: 'Escaladee',
  delegated: 'Deleguee',
  // Order statuses
  pending_approval: 'En attente approbation',
  pending_payment: 'Paiement en attente',
  processing: 'En preparation',
  shipped: 'Expediee',
  delivered: 'Livree',
  returned: 'Retournee',
};

interface StatusBadgeProps {
  /** The status value */
  status: StatusType;
  /** Optional custom label to override default */
  label?: string;
  /** Badge size variant */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
}

/**
 * StatusBadge Component
 *
 * Displays a colored badge for quote or approval status.
 *
 * @example
 * ```tsx
 * <StatusBadge status="pending" />
 * <StatusBadge status="approved" size="sm" />
 * <StatusBadge status="rejected" label="Custom Label" />
 * ```
 */
export function StatusBadge({
  status,
  label,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const displayLabel = label ?? statusLabels[status] ?? status;
  const colorClass = statusColors[status] ?? 'bg-gray-100 text-gray-800';

  return (
    <span
      role="status"
      aria-label={`Statut: ${displayLabel}`}
      className={cn(
        'inline-flex items-center rounded-full font-sans font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-3 py-1 text-body-sm',
        colorClass,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}

/**
 * Get status color class without rendering component
 */
export function getStatusColor(status: StatusType): string {
  return statusColors[status] ?? 'bg-gray-100 text-gray-800';
}

/**
 * Get status label without rendering component
 */
export function getStatusLabel(status: StatusType): string {
  return statusLabels[status] ?? status;
}

export default StatusBadge;
