'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Icon components
 */
const ErrorIcon = () => (
  <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error state for Order Detail Page
 *
 * Displayed when an error occurs during order data fetching or rendering.
 * Provides options to retry or navigate back to the orders list.
 */
export default function OrderDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry, LogRocket)
    console.error('Order detail page error:', error);
  }, [error]);

  return (
    <div
      className="p-6 lg:p-8 flex items-center justify-center min-h-[500px]"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md">
        <ErrorIcon />

        <h1 className="mt-6 font-sans text-heading-3 text-content-primary">
          Une erreur est survenue
        </h1>

        <p className="mt-4 font-sans text-body text-content-secondary">
          Impossible de charger les details de la commande. Cela peut etre du a un probleme
          de connexion ou a une erreur temporaire.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left bg-red-50 rounded-lg p-4 border border-red-200">
            <summary className="cursor-pointer font-sans text-body-sm font-medium text-red-800">
              Details de l'erreur (developpement)
            </summary>
            <pre className="mt-2 font-mono text-caption text-red-700 overflow-auto max-h-32">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className={cn(
              'inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3',
              'bg-primary text-white rounded-lg',
              'font-sans text-body font-medium',
              'hover:bg-primary-600 transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
            )}
          >
            <RefreshIcon />
            Reessayer
          </button>

          <Link
            href="/commandes"
            className={cn(
              'inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3',
              'bg-white border border-stroke-light text-content-secondary rounded-lg',
              'font-sans text-body font-medium',
              'hover:bg-surface-secondary transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
            )}
          >
            Retour aux commandes
          </Link>
        </div>

        <p className="mt-8 font-sans text-caption text-content-muted">
          Si le probleme persiste, veuillez{' '}
          <Link
            href="/support"
            className="text-primary hover:text-primary-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
          >
            contacter le support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
