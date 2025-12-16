'use client';

/**
 * QuickSearchBar Component
 *
 * Compact search bar optimized for SKU/EAN quick lookups.
 * Features direct product access without full search overlay.
 *
 * @packageDocumentation
 */

import {
  useState,
  useCallback,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSearch } from '@/contexts/SearchContext';

// ============================================================================
// Icons
// ============================================================================

function BarcodeIcon({ className }: { className?: string }) {
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
      <path d="M3 5v14" />
      <path d="M8 5v14" />
      <path d="M12 5v14" />
      <path d="M17 5v14" />
      <path d="M21 5v14" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

// ============================================================================
// Types
// ============================================================================

export interface QuickSearchBarProps {
  /** Additional class name */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when product is found */
  onProductFound?: (productUrl: string) => void;
  /** Callback when product is not found */
  onProductNotFound?: (code: string) => void;
  /** Show inline feedback */
  showFeedback?: boolean;
}

type SearchStatus = 'idle' | 'searching' | 'found' | 'not-found';

// ============================================================================
// Component
// ============================================================================

export function QuickSearchBar({
  className,
  placeholder = 'SKU ou EAN',
  onProductFound,
  onProductNotFound,
  showFeedback = true,
}: QuickSearchBarProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { quickSearch } = useSearch();

  // Reset status after delay
  const resetStatus = useCallback(() => {
    setTimeout(() => {
      setStatus('idle');
    }, 2000);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const trimmedCode = code.trim();
      if (!trimmedCode) return;

      setStatus('searching');

      try {
        const result = await quickSearch(trimmedCode);

        if (result) {
          setStatus('found');
          onProductFound?.(result.url);

          // Navigate to product after brief feedback
          setTimeout(() => {
            router.push(result.url);
            setCode('');
            setStatus('idle');
          }, 500);
        } else {
          setStatus('not-found');
          onProductNotFound?.(trimmedCode);
          resetStatus();
        }
      } catch (error) {
        console.error('Quick search error:', error);
        setStatus('not-found');
        resetStatus();
      }
    },
    [code, quickSearch, onProductFound, onProductNotFound, router, resetStatus]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setCode('');
        inputRef.current?.blur();
      }
    },
    []
  );

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'searching':
        return <LoaderIcon className="w-4 h-4 text-accent" />;
      case 'found':
        return <CheckIcon className="w-4 h-4 text-green-600" />;
      case 'not-found':
        return <AlertCircleIcon className="w-4 h-4 text-amber-600" />;
      default:
        return <BarcodeIcon className="w-4 h-4 text-neutral-500" />;
    }
  };

  // Get border color based on status
  const getBorderColor = () => {
    switch (status) {
      case 'found':
        return 'border-green-500 focus-within:border-green-500';
      case 'not-found':
        return 'border-amber-500 focus-within:border-amber-500';
      default:
        return 'border-neutral-200 focus-within:border-accent';
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative', className)}
      role="search"
      aria-label="Recherche rapide par SKU ou EAN"
    >
      <div
        className={cn(
          'flex items-center',
          'h-9',
          'bg-white',
          'border',
          'rounded-md',
          'transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-accent/20',
          getBorderColor()
        )}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-9 flex-shrink-0">
          {getStatusIcon()}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={status === 'searching'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck="false"
          className={cn(
            'flex-1 min-w-0',
            'h-full',
            'px-0 pr-2',
            'text-sm font-mono',
            'text-neutral-900',
            'placeholder:text-neutral-500',
            'bg-transparent',
            'border-none outline-none',
            'disabled:opacity-50',
            '[&::-webkit-search-cancel-button]:hidden'
          )}
          aria-label="Code SKU ou EAN"
        />

        {/* Search Button */}
        <button
          type="submit"
          disabled={!code.trim() || status === 'searching'}
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8 mr-0.5',
            'rounded',
            'text-neutral-500',
            'transition-all duration-200',
            'hover:text-accent',
            'hover:bg-orange-50',
            'focus:outline-none',
            'focus-visible:ring-2 focus-visible:ring-accent/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'disabled:hover:bg-transparent disabled:hover:text-neutral-500'
          )}
          aria-label="Rechercher"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Feedback Message */}
      {showFeedback && status === 'not-found' && (
        <div
          className={cn(
            'absolute top-full left-0 right-0',
            'mt-1 px-3 py-1.5',
            'text-xs',
            'text-amber-700',
            'bg-amber-50',
            'border border-amber-200',
            'rounded',
            'animate-fade-in'
          )}
          role="alert"
        >
          Aucun produit trouve pour "{code}"
        </div>
      )}
    </form>
  );
}

export default QuickSearchBar;
