import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge variant styles
 */
const badgeVariants = {
  gold: [
    'bg-gold-500 text-luxury-black',
    'border border-gold-400',
  ].join(' '),
  dark: [
    'bg-luxury-charcoal text-luxury-pearl',
    'border border-luxury-gray',
  ].join(' '),
};

export interface BadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Visual style variant */
  variant?: keyof typeof badgeVariants;
  /** Additional CSS classes */
  className?: string;
  /** Size of the badge */
  size?: 'sm' | 'md';
}

/**
 * Badge size configurations
 */
const badgeSizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
};

/**
 * Badge component for product tags like "New" or "Sale".
 * Designed with luxury aesthetic using gold and dark variants.
 */
function Badge({
  children,
  variant = 'gold',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-sans font-semibold uppercase tracking-wider',
        'rounded-none', // Sharp edges for luxury feel
        'transition-colors duration-200',
        // Variant styles
        badgeVariants[variant],
        // Size styles
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
