'use client';

/**
 * HeaderSearch Component
 *
 * Search input placeholder for the B2B header.
 * Will be replaced by the full SearchBar component when integrated.
 *
 * Features:
 * - Placeholder search input with icon
 * - Keyboard shortcut hint (Cmd+K)
 * - Opens search overlay on click
 */

import { memo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderSearchProps {
  /** Additional CSS classes */
  className?: string;
  /** Callback when search is activated */
  onSearchOpen?: () => void;
  /** Placeholder text */
  placeholder?: string;
}

export const HeaderSearch = memo(function HeaderSearch({
  className,
  onSearchOpen,
  placeholder = 'Rechercher par nom, SKU, EAN...',
}: HeaderSearchProps) {
  const handleClick = useCallback(() => {
    onSearchOpen?.();
  }, [onSearchOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSearchOpen?.();
      }
    },
    [onSearchOpen]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex items-center w-full max-w-xl',
        'bg-white border border-b2b-border rounded-lg',
        'transition-all duration-200',
        'hover:border-b2b-primary-300 hover:shadow-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary-500/20 focus-visible:border-b2b-primary-500',
        'cursor-text',
        className
      )}
      aria-label="Ouvrir la recherche"
    >
      {/* Search icon */}
      <div className="flex items-center justify-center pl-3 pr-2">
        <Search
          className="w-4 h-4 text-b2b-text-muted"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      {/* Placeholder text */}
      <div className="flex-1 py-2.5 pr-3">
        <span className="text-b2b-body text-b2b-text-muted">
          {placeholder}
        </span>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="hidden md:flex items-center gap-1 pr-3">
        <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-b2b-caption font-medium text-b2b-text-muted bg-b2b-bg-secondary border border-b2b-border rounded">
          <span className="text-xs">Cmd</span>
        </kbd>
        <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-b2b-caption font-medium text-b2b-text-muted bg-b2b-bg-secondary border border-b2b-border rounded">
          <span className="text-xs">K</span>
        </kbd>
      </div>
    </div>
  );
});

HeaderSearch.displayName = 'HeaderSearch';

export default HeaderSearch;
