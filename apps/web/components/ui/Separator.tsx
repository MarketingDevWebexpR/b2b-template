'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Separator variant styles
 */
const separatorVariants = {
  // Default subtle line
  default: 'bg-neutral-200',

  // Light, barely visible separator
  light: 'bg-neutral-100',

  // Medium emphasis separator
  medium: 'bg-neutral-300',

  // Strong separator for clear divisions
  strong: 'bg-neutral-400',

  // Accent orange line
  accent: 'bg-accent',

  // Gradient fade effect
  fade: 'bg-gradient-to-r from-transparent via-neutral-200 to-transparent',

  // Accent gradient fade
  'accent-fade': 'bg-gradient-to-r from-transparent via-accent to-transparent',

  // Dashed style
  dashed: 'bg-neutral-200 border-none border-dashed',
};

/**
 * Separator size configurations
 */
const separatorSizes = {
  xs: {
    horizontal: 'h-px',
    vertical: 'w-px',
  },
  sm: {
    horizontal: 'h-0.5',
    vertical: 'w-0.5',
  },
  md: {
    horizontal: 'h-[2px]',
    vertical: 'w-[2px]',
  },
  lg: {
    horizontal: 'h-1',
    vertical: 'w-1',
  },
};

/**
 * Separator spacing configurations
 */
const separatorSpacing = {
  none: '',
  sm: {
    horizontal: 'my-2',
    vertical: 'mx-2',
  },
  md: {
    horizontal: 'my-4',
    vertical: 'mx-4',
  },
  lg: {
    horizontal: 'my-6',
    vertical: 'mx-6',
  },
  xl: {
    horizontal: 'my-8',
    vertical: 'mx-8',
  },
};

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: keyof typeof separatorVariants;
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical';
  /** Thickness of the line */
  size?: keyof typeof separatorSizes;
  /** Spacing around the separator */
  spacing?: keyof typeof separatorSpacing;
  /** Whether the separator should be decorative (no semantic meaning) */
  decorative?: boolean;
}

/**
 * Separator component for visual division of content.
 *
 * Design principles (B2B professional):
 * - Subtle, refined lines that don't overwhelm content
 * - Optional accent orange for decorative elements
 * - Proper accessibility with role="separator"
 *
 * @example
 * // Simple horizontal divider
 * <Separator />
 *
 * // Accent divider
 * <Separator variant="accent" size="sm" className="w-24 mx-auto" />
 *
 * // Vertical divider in flex container
 * <Separator orientation="vertical" className="h-6" />
 */
const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      variant = 'default',
      orientation = 'horizontal',
      size = 'xs',
      spacing = 'none',
      decorative = true,
      className,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === 'horizontal';
    const sizeClasses = separatorSizes[size][orientation];
    const spacingClasses =
      spacing !== 'none' ? separatorSpacing[spacing][orientation] : '';

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        className={cn(
          // Base styles
          'shrink-0',
          // Orientation-based dimensions
          isHorizontal ? 'w-full' : 'h-full',
          // Size
          sizeClasses,
          // Variant
          separatorVariants[variant],
          // Spacing
          spacingClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

/**
 * Decorative accent divider with optional centered content
 */
export interface DecorativeDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to display in the center (e.g., icon, text) */
  children?: React.ReactNode;
  /** Width of the decorative lines */
  lineWidth?: string;
  /** Additional CSS classes */
  className?: string;
}

const DecorativeDivider = forwardRef<HTMLDivElement, DecorativeDividerProps>(
  ({ children, lineWidth = 'w-12', className, ...props }, ref) => {
    if (!children) {
      // Simple centered accent line
      return (
        <div
          ref={ref}
          className={cn('flex justify-center', className)}
          role="none"
          {...props}
        >
          <div className={cn('h-px bg-accent', lineWidth)} />
        </div>
      );
    }

    // Divider with centered content
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-4', className)}
        role="none"
        {...props}
      >
        <div className={cn('h-px flex-1 bg-neutral-200')} />
        <span className="font-sans text-xs uppercase tracking-wide text-neutral-500">
          {children}
        </span>
        <div className={cn('h-px flex-1 bg-neutral-200')} />
      </div>
    );
  }
);

DecorativeDivider.displayName = 'DecorativeDivider';

/**
 * Section divider with title - for separating major content sections
 */
export interface SectionDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Alignment of the title */
  align?: 'left' | 'center' | 'right';
}

const SectionDivider = forwardRef<HTMLDivElement, SectionDividerProps>(
  ({ title, subtitle, align = 'left', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'py-6',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          className
        )}
        {...props}
      >
        <h3 className="font-sans font-semibold text-heading-5 text-neutral-900">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 font-sans text-sm text-neutral-500">
            {subtitle}
          </p>
        )}
        <div
          className={cn(
            'mt-4 h-px bg-neutral-200',
            align === 'center' && 'mx-auto max-w-xs',
            align === 'right' && 'ml-auto max-w-xs'
          )}
        />
      </div>
    );
  }
);

SectionDivider.displayName = 'SectionDivider';

export {
  Separator,
  DecorativeDivider,
  SectionDivider,
  separatorVariants,
  separatorSizes,
};
