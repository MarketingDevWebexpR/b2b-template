'use client';

import {
  forwardRef,
  type SelectHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the select */
  helperText?: string;
  /** Options to display */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Container class name */
  containerClassName?: string;
  /** Icon to display at the start */
  startIcon?: ReactNode;
}

/**
 * Select size configurations
 */
const selectSizes = {
  sm: 'px-3 py-2 text-sm pr-10',
  md: 'px-4 py-2.5 text-sm pr-10',
  lg: 'px-4 py-3 text-base pr-10',
};

/**
 * Professional B2B Select component with label and error state.
 * Designed for high-density data entry with clear visual feedback.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      size = 'md',
      fullWidth = true,
      containerClassName,
      className,
      disabled,
      startIcon,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = Boolean(error);

    return (
      <div
        className={cn(
          'relative',
          fullWidth && 'w-full',
          containerClassName
        )}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block mb-1.5',
              'font-sans text-sm font-medium',
              'text-neutral-600',
              'transition-colors duration-200',
              hasError && 'text-red-500',
              disabled && 'text-neutral-400 opacity-60'
            )}
          >
            {label}
          </label>
        )}

        {/* Select wrapper */}
        <div className="relative">
          {/* Start icon */}
          {startIcon && (
            <span
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'text-neutral-500',
                'pointer-events-none',
                hasError && 'text-red-500'
              )}
            >
              {startIcon}
            </span>
          )}

          {/* Select field */}
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              // Base styles
              'w-full appearance-none',
              'font-sans',
              'bg-white text-neutral-900',
              'border border-neutral-200',
              'rounded-md',
              'transition-all duration-200',
              // Focus styles
              'focus:outline-none',
              'focus:border-accent',
              'focus:ring-2 focus:ring-accent/20',
              // Hover styles
              'hover:border-neutral-300',
              // Disabled styles
              'disabled:bg-neutral-100 disabled:border-neutral-200',
              'disabled:text-neutral-400 disabled:cursor-not-allowed',
              // Error styles
              hasError && [
                'border-red-500',
                'focus:border-red-500 focus:ring-red-500/20',
                'hover:border-red-400',
              ],
              // Size styles
              selectSizes[size],
              // Icon padding adjustments
              startIcon && 'pl-10',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow */}
          <span
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-neutral-500',
              'pointer-events-none',
              hasError && 'text-red-500'
            )}
          >
            <svg
              className="w-4 h-4"
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
          </span>
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              'mt-1.5',
              'font-sans text-xs',
              'text-red-500'
            )}
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !hasError && (
          <p
            id={helperId}
            className={cn(
              'mt-1.5',
              'font-sans text-xs',
              'text-neutral-500'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectSizes };
