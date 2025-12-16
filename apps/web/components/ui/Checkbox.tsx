'use client';

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Checkbox label */
  label?: ReactNode;
  /** Description text below the label */
  description?: string;
  /** Error message to display */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether it's a radio button instead */
  type?: 'checkbox' | 'radio';
  /** Indeterminate state (checkbox only) */
  indeterminate?: boolean;
  /** Container class name */
  containerClassName?: string;
}

/**
 * Checkbox/Radio size configurations
 */
const checkboxSizes = {
  sm: {
    box: 'w-4 h-4',
    label: 'text-sm',
    description: 'text-xs',
    icon: 'w-2.5 h-2.5',
  },
  md: {
    box: 'w-5 h-5',
    label: 'text-sm',
    description: 'text-sm',
    icon: 'w-3 h-3',
  },
  lg: {
    box: 'w-6 h-6',
    label: 'text-base',
    description: 'text-sm',
    icon: 'w-3.5 h-3.5',
  },
};

/**
 * Professional B2B Checkbox/Radio component.
 * Used for form inputs, filters, and multi-select scenarios.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      type = 'checkbox',
      indeterminate = false,
      containerClassName,
      className,
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;

    const hasError = Boolean(error);
    const sizeConfig = checkboxSizes[size];
    const isRadio = type === 'radio';

    return (
      <div className={cn('relative', containerClassName)}>
        <label
          htmlFor={id}
          className={cn(
            'flex items-start gap-3 cursor-pointer group',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {/* Custom checkbox/radio visual */}
          <span
            className={cn(
              'relative flex-shrink-0 mt-0.5',
              sizeConfig.box,
              'border-2 border-neutral-300',
              'bg-white',
              'transition-all duration-200',
              isRadio ? 'rounded-full' : 'rounded',
              // Hover state
              !disabled && 'group-hover:border-accent',
              // Error state
              hasError && [
                'border-red-500',
                'group-hover:border-red-400',
              ],
              // Disabled state
              disabled && 'bg-neutral-100 border-neutral-200'
            )}
          >
            {/* Hidden native input */}
            <input
              ref={ref}
              type={type}
              id={id}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
              className={cn(
                'absolute inset-0 w-full h-full opacity-0 cursor-pointer peer',
                'disabled:cursor-not-allowed',
                className
              )}
              {...props}
            />

            {/* Checkbox check icon */}
            {!isRadio && (
              <svg
                className={cn(
                  'absolute inset-0 m-auto',
                  sizeConfig.icon,
                  'text-white',
                  'opacity-0 scale-50',
                  'transition-all duration-200',
                  'peer-checked:opacity-100 peer-checked:scale-100'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                {indeterminate ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                )}
              </svg>
            )}

            {/* Radio dot */}
            {isRadio && (
              <span
                className={cn(
                  'absolute inset-0 m-auto',
                  'w-2 h-2 rounded-full',
                  'bg-white',
                  'opacity-0 scale-50',
                  'transition-all duration-200',
                  'peer-checked:opacity-100 peer-checked:scale-100'
                )}
              />
            )}

            {/* Checked background */}
            <span
              className={cn(
                'absolute inset-0',
                isRadio ? 'rounded-full' : 'rounded',
                'bg-accent',
                'opacity-0',
                'transition-opacity duration-200',
                'peer-checked:opacity-100',
                hasError && 'peer-checked:bg-red-500',
                disabled && 'peer-checked:bg-neutral-400'
              )}
            />
          </span>

          {/* Label and description */}
          {(label || description) && (
            <span className="flex flex-col">
              {label && (
                <span
                  className={cn(
                    'font-sans font-medium text-neutral-900',
                    sizeConfig.label,
                    hasError && 'text-red-500',
                    disabled && 'text-neutral-400'
                  )}
                >
                  {label}
                </span>
              )}
              {description && (
                <span
                  className={cn(
                    'font-sans text-neutral-500 mt-0.5',
                    sizeConfig.description
                  )}
                >
                  {description}
                </span>
              )}
            </span>
          )}
        </label>

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              'mt-1.5 ml-8',
              'font-sans text-xs',
              'text-red-500'
            )}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * Radio button component - alias for Checkbox with type="radio"
 */
const Radio = forwardRef<HTMLInputElement, Omit<CheckboxProps, 'type' | 'indeterminate'>>(
  (props, ref) => <Checkbox ref={ref} type="radio" {...props} />
);

Radio.displayName = 'Radio';

/**
 * Checkbox Group component for managing multiple checkboxes
 */
export interface CheckboxGroupProps {
  /** Group label */
  label?: string;
  /** Error message for the group */
  error?: string;
  /** Children checkboxes */
  children: ReactNode;
  /** Orientation of the group */
  orientation?: 'horizontal' | 'vertical';
  /** Container class name */
  className?: string;
}

const CheckboxGroup = ({
  label,
  error,
  children,
  orientation = 'vertical',
  className,
}: CheckboxGroupProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  return (
    <fieldset
      className={cn('w-full', className)}
      aria-invalid={hasError}
      aria-describedby={hasError ? errorId : undefined}
    >
      {label && (
        <legend
          className={cn(
            'mb-3',
            'font-sans text-sm font-medium',
            'text-neutral-600',
            hasError && 'text-red-500'
          )}
        >
          {label}
        </legend>
      )}
      <div
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {children}
      </div>
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            'mt-2',
            'font-sans text-xs',
            'text-red-500'
          )}
        >
          {error}
        </p>
      )}
    </fieldset>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';

export { Checkbox, Radio, CheckboxGroup, checkboxSizes };
