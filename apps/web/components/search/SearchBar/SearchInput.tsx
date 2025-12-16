'use client';

/**
 * SearchInput Component
 *
 * Input field with search icon, clear button, and optional voice search.
 * Designed for B2B professional interface with accessibility support.
 *
 * @packageDocumentation
 */

import {
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Icons
// ============================================================================

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

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
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

// ============================================================================
// Types
// ============================================================================

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /** Current input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Key down handler */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Clear button click handler */
  onClear: () => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading indicator */
  isLoading?: boolean;
  /** Show voice search button */
  showVoiceSearch?: boolean;
  /** Voice search click handler */
  onVoiceSearch?: () => void;
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig = {
  sm: {
    container: 'h-10',
    input: 'text-sm pl-9 pr-20',
    icon: 'w-4 h-4 left-3',
    button: 'w-7 h-7',
    buttonIcon: 'w-3.5 h-3.5',
  },
  md: {
    container: 'h-12',
    input: 'text-b2b-body pl-11 pr-24',
    icon: 'w-5 h-5 left-3.5',
    button: 'w-8 h-8',
    buttonIcon: 'w-4 h-4',
  },
  lg: {
    container: 'h-14',
    input: 'text-base pl-12 pr-28',
    icon: 'w-5 h-5 left-4',
    button: 'w-9 h-9',
    buttonIcon: 'w-4.5 h-4.5',
  },
};

// ============================================================================
// Component
// ============================================================================

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onClear,
      size = 'md',
      isLoading = false,
      showVoiceSearch = false,
      onVoiceSearch,
      placeholder,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const config = sizeConfig[size];
    const hasValue = value.length > 0;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <div className={cn('relative', config.container, className)}>
        {/* Search Icon or Loader */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2',
            'text-b2b-text-muted',
            'pointer-events-none',
            'transition-colors duration-200',
            config.icon
          )}
        >
          {isLoading ? (
            <LoaderIcon className={cn(config.buttonIcon, 'text-b2b-primary')} />
          ) : (
            <SearchIcon className={config.buttonIcon} />
          )}
        </div>

        {/* Input Field */}
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={cn(
            // Base styles
            'w-full h-full',
            'font-sans',
            'bg-white',
            'text-b2b-text-primary',
            'placeholder:text-b2b-text-muted',
            'border border-b2b-border',
            'rounded-lg',
            // Transitions
            'transition-all duration-200 ease-smooth',
            // Focus styles
            'focus:outline-none',
            'focus:border-b2b-primary',
            'focus:ring-2 focus:ring-b2b-primary/20',
            // Hover styles
            'hover:border-b2b-border-medium',
            // Disabled styles
            'disabled:bg-b2b-bg-tertiary',
            'disabled:text-b2b-text-muted',
            'disabled:cursor-not-allowed',
            // Hide native search cancel button
            '[&::-webkit-search-cancel-button]:hidden',
            '[&::-webkit-search-decoration]:hidden',
            // Size-specific padding
            config.input
          )}
          {...props}
        />

        {/* Action Buttons Container */}
        <div
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'flex items-center gap-1'
          )}
        >
          {/* Clear Button */}
          {hasValue && (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                'flex items-center justify-center',
                'text-b2b-text-muted',
                'rounded-md',
                'transition-all duration-200',
                'hover:text-b2b-text-secondary',
                'hover:bg-b2b-bg-tertiary',
                'focus:outline-none',
                'focus-visible:ring-2 focus-visible:ring-b2b-primary/30',
                config.button
              )}
              aria-label="Effacer la recherche"
            >
              <XIcon className={config.buttonIcon} />
            </button>
          )}

          {/* Voice Search Button */}
          {showVoiceSearch && (
            <button
              type="button"
              onClick={onVoiceSearch}
              className={cn(
                'flex items-center justify-center',
                'text-b2b-text-muted',
                'rounded-md',
                'transition-all duration-200',
                'hover:text-b2b-primary',
                'hover:bg-b2b-primary-50',
                'focus:outline-none',
                'focus-visible:ring-2 focus-visible:ring-b2b-primary/30',
                config.button
              )}
              aria-label="Recherche vocale"
            >
              <MicIcon className={config.buttonIcon} />
            </button>
          )}

          {/* Keyboard Shortcut Hint */}
          {!hasValue && (
            <kbd
              className={cn(
                'hidden sm:inline-flex items-center gap-1',
                'px-2 py-1',
                'text-xs font-mono',
                'text-b2b-text-muted',
                'bg-b2b-bg-tertiary',
                'border border-b2b-border-light',
                'rounded'
              )}
            >
              <span className="text-[10px]">Cmd</span>
              <span>K</span>
            </kbd>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
