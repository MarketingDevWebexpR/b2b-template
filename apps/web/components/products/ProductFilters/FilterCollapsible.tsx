'use client';

import { useState, useCallback, type ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';

export interface FilterCollapsibleProps {
  /** Section title */
  title: string;
  /** Number of active filters in this section */
  activeCount?: number;
  /** Whether the section is initially expanded */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  isExpanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Children content */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * FilterCollapsible
 *
 * A collapsible wrapper for filter sections with smooth animations.
 * Used to organize filter groups in the sidebar.
 */
export function FilterCollapsible({
  title,
  activeCount = 0,
  defaultExpanded = true,
  isExpanded: controlledExpanded,
  onExpandedChange,
  children,
  className,
}: FilterCollapsibleProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded ?? internalExpanded;

  const contentId = useId();
  const triggerId = useId();

  const handleToggle = useCallback(() => {
    const newValue = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(newValue);
    }
    onExpandedChange?.(newValue);
  }, [isExpanded, controlledExpanded, onExpandedChange]);

  return (
    <div
      className={cn(
        'border-b border-neutral-200',
        className
      )}
    >
      {/* Header / Trigger */}
      <button
        type="button"
        id={triggerId}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={handleToggle}
        className={cn(
          'flex items-center justify-between w-full',
          'py-4 px-0',
          'text-left',
          'text-xs font-semibold uppercase tracking-wide',
          'text-neutral-900',
          'hover:text-accent',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
        )}
      >
        <span className="flex items-center gap-2">
          {title}
          {activeCount > 0 && (
            <span
              className={cn(
                'inline-flex items-center justify-center',
                'min-w-[20px] h-5 px-1.5',
                'text-xs font-medium',
                'bg-accent text-white',
                'rounded-full'
              )}
              aria-label={`${activeCount} filtre${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''}`}
            >
              {activeCount}
            </span>
          )}
        </span>

        {/* Chevron icon */}
        <svg
          className={cn(
            'w-5 h-5 text-neutral-500',
            'transform transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default FilterCollapsible;
