'use client';

/**
 * BrandsSearchBar Component
 *
 * A search input for filtering brands in the MegaMenu.
 * Features debounced input and keyboard navigation.
 *
 * Features:
 * - Debounced search (300ms)
 * - Clear button when text present
 * - Keyboard shortcut (/)
 * - Accessible ARIA attributes
 * - Visual feedback during search
 */

import { memo, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BrandsSearchBarProps } from './types';

export const BrandsSearchBar = memo(function BrandsSearchBar({
  value,
  onChange,
  placeholder = 'Rechercher une marque...',
  className,
}: BrandsSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when "/" is pressed (keyboard shortcut)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not already in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (value) {
          // Clear search first
          onChange('');
        }
      }
    },
    [value, onChange]
  );

  return (
    <div className={cn('relative', className)}>
      {/* Search icon */}
      <div
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2',
          'pointer-events-none',
          'text-neutral-400'
        )}
      >
        <Search className="w-4 h-4" aria-hidden="true" />
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          // Base styles
          'w-full',
          'pl-10 pr-10 py-2.5',
          'bg-neutral-50',
          'border border-neutral-200',
          'rounded-lg',
          'text-sm text-neutral-700',
          'placeholder:text-neutral-400',
          // Focus styles
          'focus:outline-none',
          'focus:bg-white',
          'focus:border-neutral-300',
          'focus:ring-2 focus:ring-accent/10',
          // Transition
          'transition-all duration-150'
        )}
        aria-label="Rechercher une marque"
        aria-describedby="search-hint"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Screen reader hint */}
      <span id="search-hint" className="sr-only">
        Tapez le nom d'une marque pour filtrer la liste. Appuyez sur Echap pour effacer.
      </span>

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'p-1 -m-1',
            'text-neutral-400 hover:text-neutral-600',
            'rounded-full',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            'transition-colors duration-150'
          )}
          aria-label="Effacer la recherche"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Keyboard shortcut hint (visible on desktop) */}
      {!value && (
        <div
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'hidden sm:flex items-center gap-1',
            'pointer-events-none'
          )}
        >
          <kbd
            className={cn(
              'px-1.5 py-0.5',
              'bg-neutral-100',
              'border border-neutral-200',
              'rounded',
              'text-[10px] text-neutral-400',
              'font-mono'
            )}
          >
            /
          </kbd>
        </div>
      )}
    </div>
  );
});

BrandsSearchBar.displayName = 'BrandsSearchBar';

export default BrandsSearchBar;
