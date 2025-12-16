import { cn } from '@/lib/utils';
import type { ApprovalEntityType } from '@maison/types';

/**
 * Entity type color variants
 */
const entityTypeColors: Record<ApprovalEntityType, string> = {
  order: 'bg-blue-100 text-blue-800',
  quote: 'bg-purple-100 text-purple-800',
  return: 'bg-orange-100 text-orange-800',
  credit: 'bg-green-100 text-green-800',
  employee: 'bg-cyan-100 text-cyan-800',
  spending_limit: 'bg-amber-100 text-amber-800',
};

/**
 * Entity type labels (French)
 */
const entityTypeLabels: Record<ApprovalEntityType, string> = {
  order: 'Commande',
  quote: 'Devis',
  return: 'Retour',
  credit: 'Credit',
  employee: 'Employe',
  spending_limit: 'Limite',
};

interface EntityTypeBadgeProps {
  /** The entity type */
  entityType: ApprovalEntityType;
  /** Optional custom label */
  label?: string;
  /** Badge size variant */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
}

/**
 * EntityTypeBadge Component
 *
 * Displays a colored badge for approval entity types.
 *
 * @example
 * ```tsx
 * <EntityTypeBadge entityType="order" />
 * <EntityTypeBadge entityType="quote" size="sm" />
 * <EntityTypeBadge entityType="return" label="Demande de retour" />
 * ```
 */
export function EntityTypeBadge({
  entityType,
  label,
  size = 'md',
  className,
}: EntityTypeBadgeProps) {
  const displayLabel = label ?? entityTypeLabels[entityType] ?? entityType;
  const colorClass = entityTypeColors[entityType] ?? 'bg-gray-100 text-gray-800';

  return (
    <span
      role="status"
      aria-label={`Type: ${displayLabel}`}
      className={cn(
        'inline-flex items-center rounded font-sans font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-caption',
        colorClass,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}

/**
 * Get entity type color class without rendering component
 */
export function getEntityTypeColor(entityType: ApprovalEntityType): string {
  return entityTypeColors[entityType] ?? 'bg-gray-100 text-gray-800';
}

/**
 * Get entity type label without rendering component
 */
export function getEntityTypeLabel(entityType: ApprovalEntityType): string {
  return entityTypeLabels[entityType] ?? entityType;
}

export default EntityTypeBadge;
