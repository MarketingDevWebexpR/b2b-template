'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button variant styles for B2B Jewelry e-commerce
 *
 * Design Philosophy:
 * - Primary: Gold/Accent for main CTAs - luxurious, premium feel
 * - Secondary: Outlined style for secondary actions
 * - Outline: Subtle border style for tertiary actions
 * - Ghost: Minimal for navigation and subtle interactions
 * - Danger: Red for destructive actions
 */
const buttonVariants = {
  // Primary - Main CTA, accent orange Hermes
  primary: [
    'bg-accent text-white',
    'hover:bg-accent/90 hover:shadow-button',
    'active:bg-accent/95 active:shadow-none',
    'disabled:bg-accent/40 disabled:text-white/60 disabled:shadow-none',
  ].join(' '),

  // Secondary - Outlined accent style
  secondary: [
    'bg-transparent text-accent',
    'border-2 border-accent',
    'hover:bg-accent/5 hover:border-accent',
    'active:bg-accent/10',
    'disabled:border-accent/30 disabled:text-accent/40',
  ].join(' '),

  // Outline - Neutral outlined style
  outline: [
    'bg-white text-neutral-700',
    'border border-neutral-300',
    'hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-900',
    'active:bg-neutral-100',
    'disabled:bg-neutral-50 disabled:border-neutral-200 disabled:text-neutral-400',
  ].join(' '),

  // Ghost - Minimal transparent style
  ghost: [
    'bg-transparent text-neutral-700',
    'hover:bg-neutral-100 hover:text-neutral-900',
    'active:bg-neutral-200',
    'disabled:text-neutral-400 disabled:bg-transparent',
  ].join(' '),

  // Danger - Destructive actions
  danger: [
    'bg-red-500 text-white',
    'hover:bg-red-600 hover:shadow-sm',
    'active:bg-red-700',
    'disabled:bg-red-300 disabled:text-white/70',
  ].join(' '),

  // Danger Outline - Soft destructive style
  'danger-outline': [
    'bg-transparent text-red-600',
    'border border-red-300',
    'hover:bg-red-50 hover:border-red-400',
    'active:bg-red-100',
    'disabled:border-red-200 disabled:text-red-300',
  ].join(' '),

  // Success - Positive actions
  success: [
    'bg-emerald-500 text-white',
    'hover:bg-emerald-600 hover:shadow-sm',
    'active:bg-emerald-700',
    'disabled:bg-emerald-300 disabled:text-white/70',
  ].join(' '),

  // Gold - Premium/Luxury variant for B2B jewelry
  gold: [
    'bg-gradient-to-r from-gold-500 to-gold-600 text-white',
    'hover:from-gold-600 hover:to-gold-700 hover:shadow-md',
    'active:from-gold-700 active:to-gold-800',
    'disabled:from-gold-300 disabled:to-gold-400 disabled:text-white/70',
  ].join(' '),

  // Link - Text link style button
  link: [
    'bg-transparent text-accent underline-offset-4',
    'hover:underline hover:text-accent/80',
    'active:text-accent/70',
    'disabled:text-neutral-400 disabled:no-underline',
  ].join(' '),
};

/**
 * Button size configurations
 */
const buttonSizes = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-6 text-base gap-2',
  lg: 'h-13 px-8 text-lg gap-2.5',
  xl: 'h-14 px-10 text-lg gap-3',
};

/**
 * Icon-only button sizes (square buttons)
 */
const iconButtonSizes = {
  xs: 'h-7 w-7',
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-13 w-13',
  xl: 'h-14 w-14',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: keyof typeof buttonVariants;
  /** Size of the button */
  size?: keyof typeof buttonSizes;
  /** Show loading spinner and disable interactions */
  isLoading?: boolean;
  /** Icon to display before text */
  leftIcon?: ReactNode;
  /** Icon to display after text */
  rightIcon?: ReactNode;
  /** Icon-only mode (square button) */
  iconOnly?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
}

/**
 * Button component with B2B Jewelry professional styling.
 *
 * Features:
 * - Multiple variants: primary, secondary, outline, ghost, danger, success, gold, link
 * - Multiple sizes: xs, sm, md, lg, xl
 * - Loading state with spinner
 * - Left/Right icon support
 * - Icon-only mode for square buttons
 * - Full width option
 *
 * @example
 * // Primary CTA
 * <Button variant="primary">Ajouter au panier</Button>
 *
 * // With icons
 * <Button leftIcon={<CartIcon />}>Commander</Button>
 *
 * // Danger action
 * <Button variant="danger">Supprimer</Button>
 *
 * // Loading state
 * <Button isLoading>Chargement...</Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      fullWidth = false,
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

    // Spinner sizes based on button size
    const spinnerSizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center',
          'font-sans font-medium',
          'rounded-lg',
          'transition-all duration-200 ease-out',
          // Focus states (accessibility)
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          // Disabled base
          'disabled:cursor-not-allowed',
          // Variant styles
          buttonVariants[variant],
          // Size styles
          iconOnly ? iconButtonSizes[size] : buttonSizes[size],
          // Full width
          fullWidth && 'w-full',
          // Loading state
          isLoading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {/* Loading spinner overlay */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className={cn('animate-spin', spinnerSizes[size])}
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
        <span
          className={cn(
            'inline-flex items-center justify-center',
            isLoading && 'invisible'
          )}
        >
          {leftIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {!iconOnly && children}
          {rightIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
          {iconOnly && children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * IconButton - Convenience wrapper for icon-only buttons
 */
export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'leftIcon' | 'rightIcon'> {
  /** Icon element to render */
  icon: ReactNode;
  /** Accessible label for the button */
  'aria-label': string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, children, ...props }, ref) => (
    <Button ref={ref} iconOnly {...props}>
      {icon}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

/**
 * ButtonGroup - Container for grouping related buttons
 */
export interface ButtonGroupProps {
  /** Buttons to group */
  children: ReactNode;
  /** Orientation of the group */
  orientation?: 'horizontal' | 'vertical';
  /** Size for all buttons in the group */
  size?: keyof typeof buttonSizes;
  /** Additional CSS classes */
  className?: string;
}

const ButtonGroup = ({
  children,
  orientation = 'horizontal',
  className,
}: ButtonGroupProps) => {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex',
        orientation === 'horizontal'
          ? 'flex-row [&>*:not(:first-child)]:-ml-px [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none'
          : 'flex-col [&>*:not(:first-child)]:-mt-px [&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none [&>*:not(:first-child):not(:last-child)]:rounded-none',
        className
      )}
    >
      {children}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';

export { Button, IconButton, ButtonGroup, buttonVariants, buttonSizes, iconButtonSizes };
