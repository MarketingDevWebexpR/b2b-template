import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Color variants for stat values
 */
type ColorVariant = 'default' | 'amber' | 'green' | 'red' | 'blue' | 'purple';

const colorClasses: Record<ColorVariant, string> = {
  default: 'text-text-primary',
  amber: 'text-amber-600',
  green: 'text-green-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
};

interface StatCardProps {
  /** Label for the stat */
  label: string;
  /** Value to display (number, string, or formatted ReactNode) */
  value: ReactNode;
  /** Color variant for the value */
  color?: ColorVariant;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional trend indicator */
  trend?: {
    value: number;
    label?: string;
  };
  /** Additional class names */
  className?: string;
}

/**
 * StatCard Component
 *
 * Displays a statistic card with label, value, and optional trend.
 *
 * @example
 * ```tsx
 * <StatCard label="Total devis" value={42} />
 * <StatCard label="En attente" value={5} color="amber" />
 * <StatCard
 *   label="Valeur totale"
 *   value={formatCurrency(12500)}
 *   trend={{ value: 12.5, label: "vs mois dernier" }}
 * />
 * ```
 */
export function StatCard({
  label,
  value,
  color = 'default',
  icon,
  trend,
  className,
}: StatCardProps) {
  const labelId = `stat-label-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const valueId = `stat-value-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <article
      className={cn(
        'bg-white rounded-soft border border-border-light p-4',
        className
      )}
      aria-labelledby={labelId}
    >
      <div className="flex items-start justify-between">
        <p id={labelId} className="font-sans text-caption text-text-muted">{label}</p>
        {icon && <div className="text-text-muted" aria-hidden="true">{icon}</div>}
      </div>
      <p
        id={valueId}
        className={cn('font-serif text-heading-4 mt-1', colorClasses[color])}
        aria-describedby={labelId}
      >
        {value}
      </p>
      {trend && (
        <div className="flex items-center gap-1 mt-2" role="note">
          <span className="sr-only">
            {trend.value >= 0 ? 'Augmentation de' : 'Diminution de'} {Math.abs(trend.value)}%
            {trend.label ? ` ${trend.label}` : ''}
          </span>
          {trend.value >= 0 ? (
            <svg
              className="w-3 h-3 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span
            className={cn(
              'font-sans text-caption',
              trend.value >= 0 ? 'text-green-600' : 'text-red-600'
            )}
            aria-hidden="true"
          >
            {Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span className="font-sans text-caption text-text-muted" aria-hidden="true">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

interface StatsGridProps {
  /** Array of stats to display */
  stats: Array<StatCardProps>;
  /** Number of columns (2-4) */
  columns?: 2 | 3 | 4;
  /** Additional class names */
  className?: string;
}

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * StatsGrid Component
 *
 * Displays a responsive grid of StatCards.
 *
 * @example
 * ```tsx
 * <StatsGrid
 *   stats={[
 *     { label: "Total", value: 100 },
 *     { label: "En cours", value: 25, color: "amber" },
 *     { label: "Termine", value: 75, color: "green" },
 *   ]}
 *   columns={3}
 * />
 * ```
 */
export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  return (
    <section aria-label="Statistiques" className={cn('grid gap-4', columnClasses[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </section>
  );
}

export default StatCard;
