import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Breadcrumb item type
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Optional href for navigation */
  href?: string;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action buttons (typically placed on the right) */
  actions?: ReactNode;
  /** Optional breadcrumbs navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Additional class names */
  className?: string;
}

/**
 * PageHeader Component
 *
 * Displays a consistent page header with title, optional description,
 * breadcrumbs navigation, and action buttons.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Devis"
 *   description="Gerez vos demandes de devis"
 *   actions={<Button>Nouveau devis</Button>}
 *   breadcrumbs={[
 *     { label: 'Tableau de bord', href: '/dashboard' },
 *     { label: 'Devis' }
 *   ]}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="font-sans text-caption text-text-muted hover:text-hermes-500 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-sans text-caption text-text-secondary">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-heading-3 text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="mt-1 font-sans text-body text-text-muted">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
