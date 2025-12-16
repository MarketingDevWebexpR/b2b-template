'use client';

/**
 * ViewModeToggle Component
 *
 * Toggle buttons for switching between Grid, List, and Compact view modes.
 * Persists user preference to localStorage.
 */

import { cn } from '@/lib/utils';
import { useSearchPagination } from '@/contexts/SearchContext';
import type { ProductViewMode } from '@/contexts/SearchContext';

interface ViewModeButtonProps {
  mode: ProductViewMode;
  currentMode: ProductViewMode;
  onClick: (mode: ProductViewMode) => void;
  icon: React.ReactNode;
  label: string;
}

function ViewModeButton({
  mode,
  currentMode,
  onClick,
  icon,
  label,
}: ViewModeButtonProps) {
  const isActive = mode === currentMode;

  return (
    <button
      type="button"
      onClick={() => onClick(mode)}
      className={cn(
        'relative p-2',
        'rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary focus-visible:ring-offset-1',
        isActive
          ? 'bg-b2b-primary text-white shadow-sm'
          : 'bg-white text-b2b-text-muted hover:text-b2b-text-primary hover:bg-b2b-bg-tertiary border border-b2b-border'
      )}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
    >
      {icon}
    </button>
  );
}

/**
 * Grid icon (4 squares)
 */
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/**
 * List icon (horizontal lines)
 */
function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  );
}

/**
 * Compact icon (thin lines)
 */
function CompactIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="3" y1="14" x2="21" y2="14" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export interface ViewModeToggleProps {
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show labels instead of icons only */
  showLabels?: boolean;
}

/**
 * ViewModeToggle allows users to switch between different product display modes
 */
export function ViewModeToggle({
  className,
  size = 'md',
  showLabels = false,
}: ViewModeToggleProps) {
  const { viewMode, setViewMode } = useSearchPagination();

  const viewModes: Array<{
    mode: ProductViewMode;
    icon: React.ReactNode;
    label: string;
  }> = [
    { mode: 'grid', icon: <GridIcon />, label: 'Grille' },
    { mode: 'list', icon: <ListIcon />, label: 'Liste' },
    { mode: 'compact', icon: <CompactIcon />, label: 'Compact' },
  ];

  if (showLabels) {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-lg bg-b2b-bg-secondary p-1',
          'border border-b2b-border-light',
          className
        )}
        role="group"
        aria-label="Mode d'affichage"
      >
        {viewModes.map(({ mode, icon, label }) => {
          const isActive = mode === viewMode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={cn(
                'inline-flex items-center gap-1.5',
                'px-3 py-1.5',
                'text-sm font-medium',
                'rounded-md',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary focus-visible:ring-inset',
                isActive
                  ? 'bg-white text-b2b-text-primary shadow-sm'
                  : 'text-b2b-text-muted hover:text-b2b-text-primary'
              )}
              aria-pressed={isActive}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role="group"
      aria-label="Mode d'affichage"
    >
      {viewModes.map(({ mode, icon, label }) => (
        <ViewModeButton
          key={mode}
          mode={mode}
          currentMode={viewMode}
          onClick={setViewMode}
          icon={icon}
          label={label}
        />
      ))}
    </div>
  );
}

export default ViewModeToggle;
