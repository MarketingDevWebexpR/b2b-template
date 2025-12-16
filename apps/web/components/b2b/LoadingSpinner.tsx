import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Optional loading message */
  message?: string;
  /** Whether to center in container */
  centered?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
};

/**
 * LoadingSpinner Component
 *
 * Displays a loading spinner with optional message.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" message="Chargement..." />
 * <LoadingSpinner size="lg" centered />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  message,
  centered = false,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'border-primary border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        !centered && className
      )}
      role="status"
      aria-label={message || 'Chargement en cours'}
    />
  );

  if (centered || message) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center', className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className={cn(
            'border-primary border-t-transparent rounded-full animate-spin',
            sizeClasses[size]
          )}
          aria-hidden="true"
        />
        {message && (
          <p className="mt-4 font-sans text-body text-content-muted">{message}</p>
        )}
        <span className="sr-only">{message || 'Chargement en cours'}</span>
      </div>
    );
  }

  return spinner;
}

/**
 * Full page loading state for B2B pages
 */
export function PageLoader({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div
      className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]"
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size="lg" message={message} centered />
    </div>
  );
}

/**
 * Inline loading state for sections
 */
export function SectionLoader({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div
      className="bg-white rounded-lg border border-stroke-light p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size="md" message={message} centered />
    </div>
  );
}

export default LoadingSpinner;
