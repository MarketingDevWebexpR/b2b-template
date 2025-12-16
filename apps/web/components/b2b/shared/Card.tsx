import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Optional card title */
  title?: string;
  /** Optional action in the header */
  headerAction?: ReactNode;
  /** Optional href to make the card clickable */
  href?: string;
  /** Optional padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card Component
 *
 * A flexible card container for B2B content.
 *
 * @example
 * ```tsx
 * <Card title="Commandes recentes" headerAction={<Link href="/commandes">Voir tout</Link>}>
 *   <OrdersList orders={recentOrders} />
 * </Card>
 *
 * <Card padding="lg">
 *   <StatsSummary />
 * </Card>
 * ```
 */
export function Card({
  children,
  title,
  headerAction,
  href,
  padding = 'md',
  className,
}: CardProps) {
  const hasHeader = title || headerAction;

  const cardContent = (
    <>
      {hasHeader && (
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          {title && (
            <h2 className="font-serif text-heading-5 text-text-primary">
              {title}
            </h2>
          )}
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className={hasHeader ? paddingClasses[padding] : paddingClasses[padding]}>
        {children}
      </div>
    </>
  );

  const cardClasses = cn(
    'bg-white rounded-soft border border-border-light',
    href && 'hover:border-hermes-200 hover:shadow-sm transition-all duration-200',
    !hasHeader && paddingClasses[padding],
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(cardClasses, 'block')}>
        {cardContent}
      </Link>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
}

export interface SectionCardProps {
  /** Card title */
  title: string;
  /** Optional "View all" link */
  viewAllHref?: string;
  /** View all link text (default: "Voir tout") */
  viewAllText?: string;
  /** Card content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * SectionCard Component
 *
 * A card with a header section, title, and optional "View all" link.
 * Commonly used for dashboard sections.
 *
 * @example
 * ```tsx
 * <SectionCard
 *   title="Approbations en attente"
 *   viewAllHref="/approbations"
 * >
 *   <ApprovalsList />
 * </SectionCard>
 * ```
 */
export function SectionCard({
  title,
  viewAllHref,
  viewAllText = 'Voir tout',
  children,
  className,
}: SectionCardProps) {
  return (
    <div className={cn('bg-white rounded-soft border border-border-light', className)}>
      <div className="flex items-center justify-between p-6 border-b border-border-light">
        <h2 className="font-serif text-heading-5 text-text-primary">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="font-sans text-caption text-hermes-500 hover:text-hermes-600 transition-colors"
          >
            {viewAllText}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default Card;
