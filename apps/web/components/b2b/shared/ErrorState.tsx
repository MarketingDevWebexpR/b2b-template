import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  /** Error title (default: "Une erreur s'est produite") */
  title?: string;
  /** Error message */
  message: string;
  /** Optional retry callback */
  retry?: () => void;
  /** Optional navigation action */
  action?: {
    label: string;
    href: string;
  };
  /** Additional class names */
  className?: string;
}

/**
 * ErrorState Component
 *
 * Displays an error message with optional retry action.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   message="Impossible de charger les donnees"
 *   retry={() => refetch()}
 * />
 *
 * <ErrorState
 *   title="Erreur de connexion"
 *   message="Verifiez votre connexion internet"
 * />
 * ```
 */
export function ErrorState({
  title = "Une erreur s'est produite",
  message,
  retry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-danger/20 p-8 text-center',
        className
      )}
      role="alert"
    >
      {/* Error Icon */}
      <div className="text-danger mx-auto mb-4">
        <svg
          className="w-12 h-12 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Error Title */}
      <h3 className="text-body font-medium text-danger">
        {title}
      </h3>

      {/* Error Message */}
      <p className="mt-2 text-body-sm text-content-muted">
        {message}
      </p>

      {/* Retry Button */}
      {retry && (
        <button
          onClick={retry}
          className={cn(
            'inline-flex items-center gap-2 mt-4 px-4 py-2',
            'bg-white border border-stroke-light text-content-primary rounded-lg',
            'text-body-sm font-medium',
            'hover:bg-surface-secondary transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2'
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reessayer
        </button>
      )}

      {/* Navigation Action */}
      {action && (
        <Link
          href={action.href}
          className={cn(
            'inline-flex items-center gap-2 mt-4 px-4 py-2',
            'bg-primary text-white rounded-lg',
            'text-body-sm font-medium',
            'hover:bg-primary-600 transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2'
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default ErrorState;
