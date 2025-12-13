'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge variant styles - Hermes-inspired luxury design
 *
 * Design principles:
 * - Clean, minimal aesthetic matching the light theme
 * - Hermes orange as accent color
 * - Subtle, refined appearance
 */
const badgeVariants = {
  // Primary Hermes orange badge
  hermes: [
    'bg-hermes-500 text-white',
    'border border-hermes-500',
  ].join(' '),

  // Subtle Hermes outline
  'hermes-outline': [
    'bg-transparent text-hermes-500',
    'border border-hermes-500',
  ].join(' '),

  // Soft Hermes background
  'hermes-soft': [
    'bg-hermes-50 text-hermes-600',
    'border border-hermes-100',
  ].join(' '),

  // Dark/charcoal for neutral tags
  dark: [
    'bg-luxe-charcoal text-white',
    'border border-luxe-charcoal',
  ].join(' '),

  // Light/subtle for secondary information
  light: [
    'bg-background-muted text-text-muted',
    'border border-border-light',
  ].join(' '),

  // Success state (order confirmed, payment successful)
  success: [
    'bg-emerald-50 text-emerald-700',
    'border border-emerald-200',
  ].join(' '),

  // Warning state (low stock, processing)
  warning: [
    'bg-amber-50 text-amber-700',
    'border border-amber-200',
  ].join(' '),

  // Error state (payment failed, out of stock)
  error: [
    'bg-red-50 text-red-700',
    'border border-red-200',
  ].join(' '),

  // Info state (shipping, updates)
  info: [
    'bg-blue-50 text-blue-700',
    'border border-blue-200',
  ].join(' '),

  // Pending/processing state
  pending: [
    'bg-background-beige text-text-muted',
    'border border-border',
  ].join(' '),
};

/**
 * Badge size configurations
 */
const badgeSizes = {
  xs: 'px-1.5 py-0.5 text-[9px]',
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
};

export interface BadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Visual style variant */
  variant?: keyof typeof badgeVariants;
  /** Size of the badge */
  size?: keyof typeof badgeSizes;
  /** Show dot indicator before text */
  dot?: boolean;
  /** Dot color class (if different from text color) */
  dotColor?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Badge component for status indicators, labels, and tags.
 *
 * Designed with Hermes-inspired luxury aesthetic:
 * - Refined typography with letter spacing
 * - Subtle borders for elegance
 * - Multiple variants for different contexts
 *
 * @example
 * // Order status
 * <Badge variant="success">Commande confirmee</Badge>
 * <Badge variant="pending" dot>En cours de traitement</Badge>
 *
 * // Product tags
 * <Badge variant="hermes" size="sm">Nouveau</Badge>
 * <Badge variant="hermes-soft">Edition limitee</Badge>
 */
function Badge({
  children,
  variant = 'hermes',
  size = 'md',
  dot = false,
  dotColor,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-1.5',
        'font-sans font-medium uppercase tracking-elegant',
        'rounded-soft',
        'transition-colors duration-200',
        // Variant styles
        badgeVariants[variant],
        // Size styles
        badgeSizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColor || 'bg-current'
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants, badgeSizes };
