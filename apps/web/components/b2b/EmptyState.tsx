import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Predefined icon types for common empty states
 */
type IconType = 'document' | 'check' | 'folder' | 'search' | 'cart' | 'users';

interface EmptyStateProps {
  /** Icon to display (predefined type or custom ReactNode) */
  icon?: IconType | ReactNode;
  /** Main message */
  message: string;
  /** Optional description */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Additional class names */
  className?: string;
}

/**
 * Predefined icons for empty states
 */
const icons: Record<IconType, ReactNode> = {
  document: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  check: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  folder: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  search: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  cart: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),
  users: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
};

/**
 * EmptyState Component
 *
 * Displays an empty state with icon, message, and optional action.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="document"
 *   message="Aucun devis pour le moment"
 *   action={{ label: "Creer un devis", href: "/devis/nouveau" }}
 * />
 * ```
 */
export function EmptyState({
  icon = 'folder',
  message,
  description,
  action,
  className,
}: EmptyStateProps) {
  const iconElement =
    typeof icon === 'string' ? icons[icon as IconType] : icon;

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-stroke-light p-8 text-center',
        className
      )}
      role="status"
      aria-label={message}
    >
      <div className="text-content-muted mx-auto mb-4" aria-hidden="true">{iconElement}</div>
      <p className="font-sans text-body text-content-muted">{message}</p>
      {description && (
        <p className="mt-2 font-sans text-body-sm text-content-muted">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className={cn(
              'inline-flex items-center gap-2 mt-4 px-4 py-2',
              'bg-primary text-white rounded-lg',
              'font-sans text-body-sm font-medium',
              'hover:bg-primary-600 transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2'
            )}
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className={cn(
              'inline-flex items-center gap-2 mt-4 px-4 py-2',
              'bg-primary text-white rounded-lg',
              'font-sans text-body-sm font-medium',
              'hover:bg-primary-600 transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2'
            )}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

export default EmptyState;
