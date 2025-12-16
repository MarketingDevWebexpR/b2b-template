'use client';

import {
  forwardRef,
  createContext,
  useContext,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Radio size configurations - B2B Jewelry Design System
 */
const radioSizes = {
  sm: {
    radio: 'w-4 h-4',
    dot: 'w-1.5 h-1.5',
    label: 'text-sm',
    description: 'text-xs',
  },
  md: {
    radio: 'w-5 h-5',
    dot: 'w-2 h-2',
    label: 'text-sm',
    description: 'text-sm',
  },
  lg: {
    radio: 'w-6 h-6',
    dot: 'w-2.5 h-2.5',
    label: 'text-base',
    description: 'text-sm',
  },
};

// Radio Group Context
interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size: keyof typeof radioSizes;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}

/**
 * Radio Props
 */
export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Radio label */
  label?: ReactNode;
  /** Description text below the label */
  description?: string;
  /** Error message to display */
  error?: string;
  /** Size variant */
  size?: keyof typeof radioSizes;
  /** Container class name */
  containerClassName?: string;
}

/**
 * Radio component for single selection from a group.
 *
 * B2B Jewelry Design:
 * - Clean, elegant circular design
 * - Smooth animations on selection
 * - Clear visual feedback
 * - Accessible with proper ARIA attributes
 *
 * @example
 * // Standalone radio
 * <Radio name="payment" value="card" label="Carte bancaire" />
 *
 * // Within a RadioGroup
 * <RadioGroup name="shipping" value={shipping} onChange={setShipping}>
 *   <Radio value="standard" label="Standard (3-5 jours)" />
 *   <Radio value="express" label="Express (24h)" />
 * </RadioGroup>
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      error,
      size: sizeProp = 'md',
      containerClassName,
      className,
      disabled: disabledProp,
      name: nameProp,
      value,
      onChange: onChangeProp,
      checked: checkedProp,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;

    // Get context if within RadioGroup
    const groupContext = useRadioGroupContext();

    // Use group values if available, otherwise use props
    const name = groupContext?.name ?? nameProp;
    const disabled = groupContext?.disabled ?? disabledProp;
    const size = groupContext?.size ?? sizeProp;
    const isChecked = groupContext
      ? groupContext.value === value
      : checkedProp;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (groupContext?.onChange && value && typeof value === 'string') {
        groupContext.onChange(value);
      }
      onChangeProp?.(e);
    };

    const hasError = Boolean(error);
    const sizeConfig = radioSizes[size];

    return (
      <div className={cn('relative', containerClassName)}>
        <label
          htmlFor={id}
          className={cn(
            'flex items-start gap-3 cursor-pointer group',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {/* Custom radio visual */}
          <span
            className={cn(
              'relative flex-shrink-0 mt-0.5',
              sizeConfig.radio,
              'rounded-full',
              'border-2 border-neutral-300',
              'bg-white',
              'transition-all duration-200',
              // Hover state (not disabled)
              !disabled && 'group-hover:border-accent',
              // Checked state
              isChecked && 'border-accent bg-accent',
              // Error state
              hasError && [
                'border-red-500',
                'group-hover:border-red-400',
              ],
              // Disabled state
              disabled && 'bg-neutral-100 border-neutral-200'
            )}
          >
            {/* Hidden native radio */}
            <input
              ref={ref}
              type="radio"
              id={id}
              name={name}
              value={value}
              checked={isChecked}
              onChange={handleChange}
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

            {/* Radio dot indicator */}
            <span
              className={cn(
                'absolute inset-0 m-auto',
                sizeConfig.dot,
                'rounded-full',
                'bg-white',
                'opacity-0 scale-0',
                'transition-all duration-200',
                isChecked && 'opacity-100 scale-100'
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

Radio.displayName = 'Radio';

/**
 * RadioGroup Props
 */
export interface RadioGroupProps {
  /** Group name (required for form submission) */
  name: string;
  /** Currently selected value */
  value?: string;
  /** Default value (uncontrolled mode) */
  defaultValue?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Group label */
  label?: string;
  /** Error message for the group */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Size for all radios in the group */
  size?: keyof typeof radioSizes;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Orientation of the group */
  orientation?: 'horizontal' | 'vertical';
  /** Children (Radio components) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RadioGroup - Container for grouping Radio components
 *
 * @example
 * <RadioGroup
 *   name="delivery"
 *   label="Mode de livraison"
 *   value={delivery}
 *   onChange={setDelivery}
 * >
 *   <Radio value="pickup" label="Retrait en magasin" description="Gratuit" />
 *   <Radio value="delivery" label="Livraison" description="A partir de 9.90EUR" />
 * </RadioGroup>
 */
const RadioGroup = ({
  name,
  value,
  defaultValue,
  onChange,
  label,
  error,
  helperText,
  size = 'md',
  disabled = false,
  orientation = 'vertical',
  children,
  className,
}: RadioGroupProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;

  const handleChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <RadioGroupContext.Provider
      value={{
        name,
        value: currentValue,
        onChange: handleChange,
        disabled,
        size,
      }}
    >
      <fieldset
        className={cn('w-full', className)}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? errorId : helperText ? helperId : undefined
        }
        role="radiogroup"
      >
        {label && (
          <legend
            className={cn(
              'mb-3',
              'font-sans text-sm font-medium',
              'text-neutral-700',
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

        {/* Error message */}
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

        {/* Helper text */}
        {helperText && !hasError && (
          <p
            id={helperId}
            className={cn(
              'mt-2',
              'font-sans text-xs',
              'text-neutral-500'
            )}
          >
            {helperText}
          </p>
        )}
      </fieldset>
    </RadioGroupContext.Provider>
  );
};

RadioGroup.displayName = 'RadioGroup';

/**
 * RadioCard - Radio option with card-style design
 */
export interface RadioCardProps extends Omit<RadioProps, 'label' | 'description'> {
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Price or additional info */
  price?: string;
  /** Icon or image */
  icon?: ReactNode;
  /** Whether the card is selected */
  selected?: boolean;
}

const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(
  (
    {
      title,
      description,
      price,
      icon,
      selected,
      disabled,
      className,
      size: _size, // Exclude size from props to avoid HTML attribute conflict
      ...props
    },
    ref
  ) => {
    const groupContext = useRadioGroupContext();
    const isSelected = selected ?? (groupContext?.value === props.value);
    const isDisabled = disabled ?? groupContext?.disabled;

    return (
      <label
        className={cn(
          'relative flex cursor-pointer rounded-lg border-2 p-4',
          'transition-all duration-200',
          isSelected
            ? 'border-accent bg-accent/5'
            : 'border-neutral-200 bg-white hover:border-neutral-300',
          isDisabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <input
          ref={ref}
          type="radio"
          disabled={isDisabled}
          className="sr-only"
          {...props}
        />

        <div className="flex flex-1 items-start gap-4">
          {/* Icon */}
          {icon && (
            <span
              className={cn(
                'flex-shrink-0 w-10 h-10 flex items-center justify-center',
                'rounded-lg bg-neutral-100',
                isSelected && 'bg-accent/10 text-accent'
              )}
            >
              {icon}
            </span>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                'block font-medium text-neutral-900',
                isSelected && 'text-accent'
              )}
            >
              {title}
            </span>
            {description && (
              <span className="mt-1 block text-sm text-neutral-500">
                {description}
              </span>
            )}
          </div>

          {/* Price */}
          {price && (
            <span
              className={cn(
                'flex-shrink-0 font-semibold',
                isSelected ? 'text-accent' : 'text-neutral-900'
              )}
            >
              {price}
            </span>
          )}
        </div>

        {/* Selected indicator */}
        <span
          className={cn(
            'absolute top-4 right-4 w-5 h-5 rounded-full border-2',
            'flex items-center justify-center',
            'transition-all duration-200',
            isSelected
              ? 'border-accent bg-accent'
              : 'border-neutral-300 bg-white'
          )}
        >
          {isSelected && (
            <span className="w-2 h-2 rounded-full bg-white" />
          )}
        </span>
      </label>
    );
  }
);

RadioCard.displayName = 'RadioCard';

// Import React for useState in RadioGroup
import React from 'react';

export { Radio, RadioGroup, RadioCard, radioSizes };
