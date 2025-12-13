'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button variant styles for luxury jewelry e-commerce
 */
const buttonVariants = {
  primary: [
    'bg-gold-500 text-luxury-black',
    'hover:bg-gold-400 hover:shadow-luxury',
    'active:bg-gold-600',
    'disabled:bg-gold-300 disabled:text-luxury-gray',
  ].join(' '),
  secondary: [
    'bg-transparent text-gold-500 border border-gold-500',
    'hover:bg-gold-500/10 hover:border-gold-400',
    'active:bg-gold-500/20',
    'disabled:border-gold-300 disabled:text-gold-300',
  ].join(' '),
  ghost: [
    'bg-transparent text-luxury-pearl',
    'hover:bg-luxury-charcoal hover:text-gold-500',
    'active:bg-luxury-gray',
    'disabled:text-luxury-silver',
  ].join(' '),
};

/**
 * Button size configurations
 */
const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: keyof typeof buttonVariants;
  /** Size of the button */
  size?: keyof typeof buttonSizes;
  /** Show loading spinner and disable interactions */
  isLoading?: boolean;
  /** Button content */
  children: ReactNode;
}

/**
 * Elegant button component with luxury styling.
 * Supports primary (gold background), secondary (outline), and ghost variants.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      className,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center',
          'font-sans font-medium tracking-wide',
          'rounded-none', // Sharp edges for luxury aesthetic
          'transition-all duration-300 ease-luxury',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-black',
          'disabled:cursor-not-allowed disabled:opacity-70',
          // Variant styles
          buttonVariants[variant],
          // Size styles
          buttonSizes[size],
          // Loading state
          isLoading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
          </span>
        )}

        {/* Button content */}
        <span className={cn('flex items-center gap-2', isLoading && 'invisible')}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants, buttonSizes };
