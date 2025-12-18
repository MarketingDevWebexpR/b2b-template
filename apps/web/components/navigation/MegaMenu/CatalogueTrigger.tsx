'use client';

/**
 * CatalogueTrigger Component
 *
 * Button that triggers the MegaMenu dropdown.
 * Displays "Catalogue" with a grid icon and chevron indicator.
 */

import { memo, forwardRef } from 'react';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CatalogueTriggerProps {
  /** Whether the dropdown is currently open */
  isOpen: boolean;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Callback when mouse enters the button */
  onMouseEnter?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CatalogueTrigger renders the main button to open the MegaMenu.
 * Shows a grid icon, "Catalogue" text, and animated chevron.
 *
 * @example
 * <CatalogueTrigger
 *   isOpen={isMenuOpen}
 *   onClick={handleToggleMenu}
 * />
 */
export const CatalogueTrigger = memo(
  forwardRef<HTMLButtonElement, CatalogueTriggerProps>(function CatalogueTrigger(
    { isOpen, onClick, onMouseEnter, className },
    ref
  ) {
    return (
      <div
        className={cn(
          'bg-white border-b border-neutral-200',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <button
            ref={ref}
            type="button"
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-label="Ouvrir le catalogue de categories"
            className={cn(
              // Base styles
              'group relative flex items-center gap-2.5 px-5 py-3.5',
              'text-sm font-semibold',
              'transition-all duration-150 ease-out',
              // Default state
              'text-neutral-700 hover:text-neutral-900',
              // Active/hover state
              isOpen && 'text-neutral-900 bg-neutral-50',
              // Focus visible
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset',
              // Border bottom indicator
              'after:absolute after:bottom-0 after:left-5 after:right-5',
              'after:h-0.5 after:bg-amber-600',
              'after:scale-x-0 after:origin-left',
              'after:transition-transform after:duration-200',
              isOpen && 'after:scale-x-100'
            )}
          >
            <LayoutGrid
              className={cn(
                'w-5 h-5',
                'text-neutral-500 transition-colors duration-150',
                'group-hover:text-amber-600',
                isOpen && 'text-amber-600'
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Catalogue</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-neutral-400',
                'transition-transform duration-200',
                isOpen && 'rotate-180 text-amber-600'
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    );
  })
);

CatalogueTrigger.displayName = 'CatalogueTrigger';

export default CatalogueTrigger;
