/**
 * SectionHeader Component
 *
 * Reusable section header with title, subtitle, and optional action link.
 * Supports centered and left-aligned variants with decorative underline.
 */

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface SectionHeaderProps {
  /** Main section title */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional action link */
  action?: {
    label: string;
    href: string;
  };
  /** Alignment variant */
  align?: 'left' | 'center';
  /** Show decorative underline */
  showUnderline?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SectionHeader = memo(function SectionHeader({
  title,
  subtitle,
  action,
  align = 'center',
  showUnderline = true,
  className,
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'mb-8 lg:mb-12',
        isCenter ? 'text-center' : 'flex items-end justify-between',
        className
      )}
    >
      <div className={cn(isCenter && 'max-w-2xl mx-auto')}>
        {/* Title */}
        <h2
          className={cn(
            'text-section lg:text-section-xl font-heading text-content-primary',
            'relative inline-block'
          )}
        >
          {title}
          {/* Decorative underline */}
          {showUnderline && (
            <span
              className={cn(
                'absolute -bottom-2 h-1 bg-accent rounded-full',
                'transition-all duration-300',
                isCenter ? 'left-1/2 -translate-x-1/2 w-16' : 'left-0 w-12'
              )}
              aria-hidden="true"
            />
          )}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p
            className={cn(
              'mt-4 text-body lg:text-body-lg text-content-secondary',
              isCenter && 'max-w-xl mx-auto'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Action link - only for left-aligned variant */}
      {!isCenter && action && (
        <Link
          href={action.href}
          className={cn(
            'hidden sm:inline-flex items-center gap-2',
            'text-body font-medium text-accent hover:text-accent-600',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded'
          )}
        >
          {action.label}
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}

      {/* Centered action link */}
      {isCenter && action && (
        <Link
          href={action.href}
          className={cn(
            'mt-6 inline-flex items-center gap-2',
            'text-body font-medium text-accent hover:text-accent-600',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded'
          )}
        >
          {action.label}
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  );
});

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
