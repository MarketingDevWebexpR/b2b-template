'use client';

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Icon or element to display at the start of the input */
  startIcon?: ReactNode;
  /** Icon or element to display at the end of the input */
  endIcon?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Container class name */
  containerClassName?: string;
}

/**
 * Input size configurations
 */
const inputSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};

/**
 * Elegant form input component with label and error state.
 * Designed with luxury styling - gold accents on focus, clean typography.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      size = 'md',
      fullWidth = true,
      containerClassName,
      className,
      type = 'text',
      disabled,
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
              'block mb-2',
              'font-sans text-sm font-medium tracking-wide',
              'text-luxury-pearl',
              'transition-colors duration-200',
              hasError && 'text-red-400',
              disabled && 'text-luxury-silver opacity-60'
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Start icon */}
          {startIcon && (
            <span
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2',
                'text-luxury-silver',
                'pointer-events-none',
                hasError && 'text-red-400'
              )}
            >
              {startIcon}
            </span>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              // Base styles
              'w-full',
              'font-sans',
              'bg-luxury-charcoal text-luxury-pearl',
              'border border-luxury-gray',
              'rounded-none', // Sharp edges for luxury aesthetic
              'placeholder:text-luxury-silver',
              'transition-all duration-300 ease-luxury',
              // Focus styles
              'focus:outline-none',
              'focus:border-gold-500',
              'focus:ring-1 focus:ring-gold-500/30',
              // Hover styles
              'hover:border-luxury-silver',
              // Disabled styles
              'disabled:bg-luxury-black disabled:border-luxury-gray',
              'disabled:text-luxury-silver disabled:cursor-not-allowed',
              // Error styles
              hasError && [
                'border-red-500',
                'focus:border-red-500 focus:ring-red-500/30',
                'hover:border-red-400',
              ],
              // Size styles
              inputSizes[size],
              // Icon padding adjustments
              startIcon && 'pl-11',
              endIcon && 'pr-11',
              className
            )}
            {...props}
          />

          {/* End icon */}
          {endIcon && (
            <span
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2',
                'text-luxury-silver',
                hasError && 'text-red-400'
              )}
            >
              {endIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              'mt-2',
              'font-sans text-sm',
              'text-red-400',
              'animate-fade-in'
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
              'mt-2',
              'font-sans text-sm',
              'text-luxury-silver'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
