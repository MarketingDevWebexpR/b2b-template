'use client';

/**
 * HeaderLogo Component
 *
 * Luxury jewelry brand logo for the header.
 * Adapts size based on scroll state for a refined experience.
 */

import { memo } from 'react';
import Link from 'next/link';
import { Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderLogoProps {
  /** Compact mode when scrolled */
  isCompact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const HeaderLogo = memo(function HeaderLogo({
  isCompact = false,
  className,
}: HeaderLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2.5 flex-shrink-0',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 rounded-lg',
        'group',
        className
      )}
      aria-label="Maison Bijoux Pro - Accueil"
    >
      {/* Logo icon */}
      <div
        className={cn(
          'flex items-center justify-center',
          'bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg',
          'transition-all duration-300',
          'group-hover:from-amber-500 group-hover:to-amber-600',
          isCompact ? 'w-9 h-9' : 'w-10 h-10'
        )}
      >
        <Gem
          className={cn(
            'text-white transition-all duration-300',
            isCompact ? 'w-5 h-5' : 'w-5.5 h-5.5'
          )}
          strokeWidth={1.5}
        />
      </div>

      {/* Brand name */}
      <div
        className={cn(
          'hidden sm:flex flex-col',
          'transition-all duration-300',
          isCompact && 'scale-95 origin-left'
        )}
      >
        <span
          className={cn(
            'font-serif font-semibold tracking-wide text-neutral-900',
            'transition-all duration-300',
            isCompact ? 'text-base' : 'text-lg'
          )}
        >
          Maison Bijoux
        </span>
        <span
          className={cn(
            'text-amber-700 uppercase tracking-widest font-medium',
            'transition-all duration-300',
            isCompact ? 'text-[9px]' : 'text-[10px]'
          )}
        >
          Professionnel
        </span>
      </div>
    </Link>
  );
});

HeaderLogo.displayName = 'HeaderLogo';

export default HeaderLogo;
