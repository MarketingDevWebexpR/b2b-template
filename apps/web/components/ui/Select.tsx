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
  sm: 'px-3 py-2 text-b2b-body-sm pr-10',
  md: 'px-4 py-2.5 text-b2b-body pr-10',
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
              'font-sans text-b2b-label',
              'text-b2b-text-secondary',
              'transition-colors duration-200',
              hasError && 'text-b2b-danger',
              disabled && 'text-b2b-text-muted opacity-60'
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
                'text-b2b-text-muted',
                'pointer-events-none',
                hasError && 'text-b2b-danger'
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
              'bg-b2b-bg-primary text-b2b-text-primary',
              'border border-b2b-border',
              'rounded-md',
              'transition-all duration-200',
              // Focus styles
              'focus:outline-none',
              'focus:border-b2b-primary',
              'focus:ring-2 focus:ring-b2b-primary/20',
              // Hover styles
              'hover:border-b2b-border-medium',
              // Disabled styles
              'disabled:bg-b2b-bg-tertiary disabled:border-b2b-border-light',
              'disabled:text-b2b-text-muted disabled:cursor-not-allowed',
              // Error styles
              hasError && [
                'border-b2b-danger',
                'focus:border-b2b-danger focus:ring-b2b-danger/20',
                'hover:border-b2b-danger-400',
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
              'text-b2b-text-muted',
              'pointer-events-none',
              hasError && 'text-b2b-danger'
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
              'font-sans text-b2b-caption',
              'text-b2b-danger'
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
              'font-sans text-b2b-caption',
              'text-b2b-text-muted'
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
