'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Spinner size configurations - B2B Jewelry Design System
 */
const spinnerSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
};

/**
 * Spinner color variants
 */
const spinnerColors = {
  primary: 'text-neutral-900',
  accent: 'text-accent',
  white: 'text-white',
  current: 'text-current',
  muted: 'text-neutral-400',
};

export interface SpinnerProps {
  /** Size variant */
  size?: keyof typeof spinnerSizes;
  /** Color variant */
  color?: keyof typeof spinnerColors;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
}

/**
 * Spinner component for loading states.
 *
 * B2B Jewelry Design:
 * - Clean, minimal design
 * - Smooth animation
 * - Multiple sizes for different contexts
 *
 * @example
 * <Spinner size="md" color="accent" />
 */
const Spinner = ({
  size = 'md',
  color = 'accent',
  className,
  label = 'Chargement...',
}: SpinnerProps) => {
  return (
    <svg
      className={cn(
        'animate-spin',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
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
  );
};

Spinner.displayName = 'Spinner';

/**
 * DotsLoader - Three bouncing dots loader
 */
export interface DotsLoaderProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color */
  color?: keyof typeof spinnerColors;
  /** Additional CSS classes */
  className?: string;
}

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

const dotGaps = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
};

const DotsLoader = ({
  size = 'md',
  color = 'accent',
  className,
}: DotsLoaderProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center',
        dotGaps[size],
        className
      )}
      role="status"
      aria-label="Chargement..."
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'rounded-full',
            dotSizes[size],
            spinnerColors[color].replace('text-', 'bg-'),
            'animate-bounce'
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
};

DotsLoader.displayName = 'DotsLoader';

/**
 * PulseLoader - Pulsing circle loader
 */
export interface PulseLoaderProps {
  /** Size variant */
  size?: keyof typeof spinnerSizes;
  /** Color */
  color?: keyof typeof spinnerColors;
  /** Additional CSS classes */
  className?: string;
}

const PulseLoader = ({
  size = 'md',
  color = 'accent',
  className,
}: PulseLoaderProps) => {
  return (
    <span
      className={cn(
        'relative inline-flex',
        spinnerSizes[size],
        className
      )}
      role="status"
      aria-label="Chargement..."
    >
      <span
        className={cn(
          'absolute inset-0 rounded-full',
          spinnerColors[color].replace('text-', 'bg-'),
          'animate-ping opacity-75'
        )}
      />
      <span
        className={cn(
          'relative inline-flex rounded-full w-full h-full',
          spinnerColors[color].replace('text-', 'bg-')
        )}
      />
    </span>
  );
};

PulseLoader.displayName = 'PulseLoader';

/**
 * Loading - Full loading state with optional text
 */
export interface LoadingProps {
  /** Loading text */
  text?: string;
  /** Size variant */
  size?: keyof typeof spinnerSizes;
  /** Spinner type */
  type?: 'spinner' | 'dots' | 'pulse';
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

const Loading = ({
  text,
  size = 'md',
  type = 'spinner',
  direction = 'vertical',
  className,
}: LoadingProps) => {
  const LoaderComponent = {
    spinner: Spinner,
    dots: DotsLoader,
    pulse: PulseLoader,
  }[type];

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        direction === 'vertical' ? 'flex-col gap-3' : 'flex-row gap-3',
        className
      )}
      role="status"
    >
      <LoaderComponent size={size as any} />
      {text && (
        <span className="font-sans text-sm text-neutral-500">
          {text}
        </span>
      )}
    </div>
  );
};

Loading.displayName = 'Loading';

/**
 * LoadingOverlay - Full-screen or container overlay loading
 */
export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Loading text */
  text?: string;
  /** Blur the background */
  blur?: boolean;
  /** Overlay opacity */
  opacity?: 'light' | 'medium' | 'dark';
  /** Children content to show behind overlay */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const opacityClasses = {
  light: 'bg-white/60',
  medium: 'bg-white/80',
  dark: 'bg-white/90',
};

const LoadingOverlay = ({
  isLoading,
  text,
  blur = true,
  opacity = 'medium',
  children,
  className,
}: LoadingOverlayProps) => {
  if (!isLoading && !children) return null;

  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 z-50',
            'flex items-center justify-center',
            opacityClasses[opacity],
            blur && 'backdrop-blur-sm',
            'transition-all duration-300'
          )}
        >
          <Loading text={text} size="lg" />
        </div>
      )}
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';

/**
 * PageLoader - Full page loading state
 */
export interface PageLoaderProps {
  /** Loading text */
  text?: string;
  /** Show logo */
  showLogo?: boolean;
  /** Logo element */
  logo?: ReactNode;
}

const PageLoader = ({
  text = 'Chargement...',
  showLogo = false,
  logo,
}: PageLoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {showLogo && (
        <div className="mb-8">
          {logo || (
            <div className="text-2xl font-heading font-semibold text-neutral-900">
              Maison Bijoux
            </div>
          )}
        </div>
      )}
      <Spinner size="xl" color="accent" />
      {text && (
        <p className="mt-4 font-sans text-sm text-neutral-500">
          {text}
        </p>
      )}
    </div>
  );
};

PageLoader.displayName = 'PageLoader';

/**
 * InlineLoading - Small inline loading indicator
 */
export interface InlineLoadingProps {
  /** Loading text */
  text?: string;
  /** Additional CSS classes */
  className?: string;
}

const InlineLoading = ({
  text = 'Chargement...',
  className,
}: InlineLoadingProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-sm text-neutral-500',
        className
      )}
      role="status"
    >
      <Spinner size="xs" color="current" />
      {text}
    </span>
  );
};

InlineLoading.displayName = 'InlineLoading';

/**
 * ButtonLoading - Loading state for buttons
 */
export interface ButtonLoadingProps {
  /** Size to match button */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const buttonSpinnerSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

const ButtonLoading = ({ size = 'md' }: ButtonLoadingProps) => {
  return (
    <svg
      className={cn('animate-spin', buttonSpinnerSizes[size])}
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
  );
};

ButtonLoading.displayName = 'ButtonLoading';

/**
 * TableLoading - Loading skeleton for tables
 */
export interface TableLoadingProps {
  /** Number of rows to show */
  rows?: number;
  /** Number of columns to show */
  columns?: number;
  /** Additional CSS classes */
  className?: string;
}

const TableLoading = ({
  rows = 5,
  columns = 4,
  className,
}: TableLoadingProps) => {
  return (
    <div className={cn('w-full', className)} role="status" aria-label="Chargement des donnees...">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-neutral-200 bg-neutral-50">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-4 bg-neutral-200 rounded animate-pulse"
            style={{ width: `${100 / columns}%` }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex gap-4 p-4 border-b border-neutral-200"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 bg-neutral-100 rounded animate-pulse"
              style={{ width: `${100 / columns}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

TableLoading.displayName = 'TableLoading';

export {
  Spinner,
  DotsLoader,
  PulseLoader,
  Loading,
  LoadingOverlay,
  PageLoader,
  InlineLoading,
  ButtonLoading,
  TableLoading,
  spinnerSizes,
  spinnerColors,
};
