'use client';

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Switch label */
  label?: ReactNode;
  /** Description text below the label */
  description?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Container class name */
  containerClassName?: string;
}

/**
 * Switch size configurations
 */
const switchSizes = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
    label: 'text-b2b-body-sm',
    description: 'text-b2b-caption',
  },
  md: {
    track: 'w-10 h-5',
    thumb: 'w-4 h-4',
    translate: 'translate-x-5',
    label: 'text-b2b-body',
    description: 'text-b2b-body-sm',
  },
  lg: {
    track: 'w-12 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-6',
    label: 'text-base',
    description: 'text-b2b-body',
  },
};

/**
 * Professional B2B Switch/Toggle component.
 * Used for boolean settings and feature toggles.
 */
const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      size = 'md',
      labelPosition = 'right',
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

    const sizeConfig = switchSizes[size];

    const switchElement = (
      <span
        className={cn(
          'relative inline-flex flex-shrink-0',
          sizeConfig.track,
          'rounded-full',
          'bg-b2b-border-medium',
          'transition-colors duration-200',
          'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed bg-b2b-border-light'
        )}
      >
        {/* Hidden native input */}
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={id}
          disabled={disabled}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer peer',
            'disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />

        {/* Track background (checked state) */}
        <span
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-b2b-primary',
            'opacity-0',
            'transition-opacity duration-200',
            'peer-checked:opacity-100',
            disabled && 'peer-checked:bg-b2b-text-muted'
          )}
        />

        {/* Thumb */}
        <span
          className={cn(
            'relative inline-block',
            sizeConfig.thumb,
            'rounded-full',
            'bg-white',
            'shadow-sm',
            'ring-0',
            'transform translate-x-0.5',
            'transition-transform duration-200 ease-in-out',
            `peer-checked:${sizeConfig.translate}`,
            // Focus ring
            'peer-focus-visible:ring-2 peer-focus-visible:ring-b2b-primary peer-focus-visible:ring-offset-2'
          )}
          style={{
            // Using inline style for dynamic translate since cn doesn't handle it well
            transform: 'translateX(2px)',
          }}
        />

        {/* Thumb when checked - using CSS sibling selector */}
        <style jsx>{`
          input:checked ~ span:last-child {
            transform: translateX(${size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px'});
          }
        `}</style>
      </span>
    );

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-start gap-3 cursor-pointer',
          labelPosition === 'left' && 'flex-row-reverse',
          disabled && 'cursor-not-allowed',
          containerClassName
        )}
      >
        {switchElement}

        {/* Label and description */}
        {(label || description) && (
          <span className="flex flex-col">
            {label && (
              <span
                className={cn(
                  'font-sans font-medium text-b2b-text-primary',
                  sizeConfig.label,
                  disabled && 'text-b2b-text-muted'
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                className={cn(
                  'font-sans text-b2b-text-muted mt-0.5',
                  sizeConfig.description
                )}
              >
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch, switchSizes };
