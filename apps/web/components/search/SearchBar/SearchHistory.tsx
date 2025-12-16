'use client';

/**
 * SearchHistory Component
 *
 * Displays recent search history with clear functionality.
 * Integrates with localStorage via SearchContext.
 *
 * @packageDocumentation
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { SearchHistoryItem } from '@/contexts/SearchContext';

// ============================================================================
// Icons
// ============================================================================

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ArrowUpLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 17V7h10" />
      <path d="M7 7l10 10" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

// ============================================================================
// Types
// ============================================================================

export interface SearchHistoryProps {
  /** History items from SearchContext */
  history: SearchHistoryItem[];
  /** Currently active/focused index */
  activeIndex: number;
  /** Click handler for history item */
  onHistoryClick: (query: string) => void;
  /** Clear all history handler */
  onClearHistory: () => void;
}

// ============================================================================
// History Item Component
// ============================================================================

interface HistoryItemProps {
  item: SearchHistoryItem;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

const HistoryItem = memo(function HistoryItem({
  item,
  isActive,
  index,
  onClick,
}: HistoryItemProps) {
  return (
    <button
      type="button"
      role="option"
      id={`search-option-${index}`}
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3',
        'px-4 py-2.5',
        'text-left',
        'transition-colors duration-150',
        'focus:outline-none',
        'group',
        isActive
          ? 'bg-b2b-primary-50'
          : 'hover:bg-b2b-bg-secondary'
      )}
    >
      {/* Clock Icon */}
      <ClockIcon
        className={cn(
          'w-4 h-4 flex-shrink-0',
          'text-b2b-text-muted',
          'group-hover:text-b2b-text-secondary'
        )}
      />

      {/* Query Text */}
      <span
        className={cn(
          'flex-1',
          'text-b2b-body',
          'text-b2b-text-primary',
          'truncate'
        )}
      >
        {item.query}
      </span>

      {/* Result Count */}
      {item.resultCount > 0 && (
        <span className="text-b2b-caption text-b2b-text-muted">
          {item.resultCount} resultat{item.resultCount > 1 ? 's' : ''}
        </span>
      )}

      {/* Arrow Icon (visible on hover) */}
      <ArrowUpLeftIcon
        className={cn(
          'w-4 h-4 flex-shrink-0',
          'text-b2b-text-muted',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          'rotate-90'
        )}
      />
    </button>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export function SearchHistory({
  history,
  activeIndex,
  onHistoryClick,
  onClearHistory,
}: SearchHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between',
          'px-4 py-2',
          'bg-b2b-bg-secondary',
          'border-b border-b2b-border-light'
        )}
      >
        <span
          className={cn(
            'flex items-center gap-2',
            'text-b2b-label',
            'text-b2b-text-muted',
            'uppercase tracking-wide'
          )}
        >
          <ClockIcon className="w-4 h-4" />
          Recherches recentes
        </span>

        <button
          type="button"
          onClick={onClearHistory}
          className={cn(
            'flex items-center gap-1.5',
            'px-2 py-1',
            'text-b2b-caption',
            'text-b2b-text-muted',
            'rounded',
            'transition-colors duration-150',
            'hover:text-b2b-danger',
            'hover:bg-b2b-danger-50',
            'focus:outline-none',
            'focus-visible:ring-2 focus-visible:ring-b2b-danger/30'
          )}
          aria-label="Effacer l'historique"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          <span>Effacer</span>
        </button>
      </div>

      {/* History List */}
      <div role="group" aria-label="Recherches recentes">
        {history.map((item, index) => (
          <HistoryItem
            key={`${item.query}-${item.timestamp}`}
            item={item}
            isActive={activeIndex === index}
            index={index}
            onClick={() => onHistoryClick(item.query)}
          />
        ))}
      </div>
    </div>
  );
}

export default SearchHistory;
