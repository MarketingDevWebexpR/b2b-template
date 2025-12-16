import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

/**
 * Button variants for different use cases
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-hermes-500 text-white hover:bg-hermes-600 border-transparent',
  secondary: 'bg-white text-text-secondary border-border-light hover:bg-background-muted',
  outline: 'bg-transparent text-hermes-500 border-hermes-300 hover:bg-hermes-50',
  ghost: 'bg-transparent text-text-muted border-transparent hover:text-text-primary hover:bg-background-muted',
  danger: 'bg-red-500 text-white hover:bg-red-600 border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-caption',
  md: 'px-4 py-2 text-body-sm',
  lg: 'px-6 py-3 text-body',
};

export interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Button label */
  children: ReactNode;
  /** Optional icon to display before the label */
  icon?: ReactNode;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Optional href to render as Link */
  href?: string;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * ActionButton Component
 *
 * A flexible button component for B2B actions with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <ActionButton variant="primary" icon={<PlusIcon />}>
 *   Nouveau devis
 * </ActionButton>
 *
 * <ActionButton variant="secondary" href="/commandes/bulk">
 *   Import CSV
 * </ActionButton>
 *
 * <ActionButton variant="danger" onClick={handleDelete}>
 *   Supprimer
 * </ActionButton>
 * ```
 */
export function ActionButton({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  href,
  loading = false,
  disabled = false,
  className,
  ...props
}: ActionButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2',
    'border rounded-soft',
    'font-sans font-medium',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:ring-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  );

  const content = (
    <>
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}

export default ActionButton;
