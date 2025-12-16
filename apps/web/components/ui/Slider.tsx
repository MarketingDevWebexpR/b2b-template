'use client';

import {
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useId,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'onChange'> {
  /** Slider label */
  label?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Current value (controlled) */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Change handler */
  onChange?: (value: number) => void;
  /** Show value tooltip */
  showTooltip?: boolean;
  /** Show value markers */
  showMarkers?: boolean;
  /** Custom value formatter */
  formatValue?: (value: number) => string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Container class name */
  containerClassName?: string;
}

/**
 * Slider size configurations
 */
const sliderSizes = {
  sm: {
    track: 'h-1',
    thumb: 'w-4 h-4',
    label: 'text-sm',
  },
  md: {
    track: 'h-1.5',
    thumb: 'w-5 h-5',
    label: 'text-sm',
  },
  lg: {
    track: 'h-2',
    thumb: 'w-6 h-6',
    label: 'text-base',
  },
};

/**
 * Professional B2B Slider component.
 * Used for price ranges, quantity selection, and filter controls.
 */
const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue = min,
      onChange,
      showTooltip = false,
      showMarkers = false,
      formatValue = (v) => String(v),
      size = 'md',
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

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const sizeConfig = sliderSizes[size];

    // Calculate percentage for filled track
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      [controlledValue, onChange]
    );

    // Sync internal state with controlled value
    useEffect(() => {
      if (controlledValue !== undefined) {
        setInternalValue(controlledValue);
      }
    }, [controlledValue]);

    return (
      <div
        className={cn(
          'relative w-full',
          containerClassName
        )}
      >
        {/* Label and value display */}
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={id}
              className={cn(
                'font-sans font-medium text-neutral-900',
                sizeConfig.label,
                disabled && 'text-neutral-500'
              )}
            >
              {label}
            </label>
            <span
              className={cn(
                'font-sans font-medium text-accent',
                sizeConfig.label,
                disabled && 'text-neutral-500'
              )}
            >
              {formatValue(value)}
            </span>
          </div>
        )}

        {/* Slider container */}
        <div className="relative py-2">
          {/* Track background */}
          <div
            className={cn(
              'absolute inset-x-0 top-1/2 -translate-y-1/2',
              sizeConfig.track,
              'bg-neutral-200 rounded-full',
              disabled && 'bg-neutral-100'
            )}
          />

          {/* Filled track */}
          <div
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2',
              sizeConfig.track,
              'bg-accent rounded-full',
              'transition-all duration-100',
              disabled && 'bg-neutral-500'
            )}
            style={{ width: `${percentage}%` }}
          />

          {/* Native range input */}
          <input
            ref={ref}
            type="range"
            id={id}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            disabled={disabled}
            className={cn(
              'relative w-full appearance-none bg-transparent cursor-pointer z-10',
              'disabled:cursor-not-allowed',
              // Webkit (Chrome, Safari, Edge)
              '[&::-webkit-slider-thumb]:appearance-none',
              `[&::-webkit-slider-thumb]:${sizeConfig.thumb}`,
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-white',
              '[&::-webkit-slider-thumb]:border-2',
              '[&::-webkit-slider-thumb]:border-accent',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:transition-all',
              '[&::-webkit-slider-thumb]:duration-200',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-webkit-slider-thumb]:hover:shadow-lg',
              // Focus state
              '[&:focus::-webkit-slider-thumb]:ring-2',
              '[&:focus::-webkit-slider-thumb]:ring-accent/30',
              // Disabled state
              '[&:disabled::-webkit-slider-thumb]:bg-neutral-100',
              '[&:disabled::-webkit-slider-thumb]:border-neutral-300',
              '[&:disabled::-webkit-slider-thumb]:cursor-not-allowed',
              '[&:disabled::-webkit-slider-thumb]:hover:scale-100',
              // Firefox
              '[&::-moz-range-thumb]:appearance-none',
              `[&::-moz-range-thumb]:${sizeConfig.thumb}`,
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-white',
              '[&::-moz-range-thumb]:border-2',
              '[&::-moz-range-thumb]:border-accent',
              '[&::-moz-range-thumb]:shadow-md',
              '[&::-moz-range-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:transition-all',
              '[&::-moz-range-thumb]:duration-200',
              className
            )}
            {...props}
          />

          {/* Value tooltip */}
          {showTooltip && (isFocused || isDragging) && (
            <div
              className={cn(
                'absolute -top-8',
                'px-2 py-1',
                'bg-neutral-900 text-white',
                'text-xs font-medium',
                'rounded',
                'transform -translate-x-1/2',
                'pointer-events-none',
                'whitespace-nowrap',
                'transition-opacity duration-200'
              )}
              style={{ left: `${percentage}%` }}
            >
              {formatValue(value)}
              <span
                className={cn(
                  'absolute -bottom-1 left-1/2 -translate-x-1/2',
                  'w-2 h-2',
                  'bg-neutral-900',
                  'transform rotate-45'
                )}
              />
            </div>
          )}
        </div>

        {/* Markers */}
        {showMarkers && (
          <div className="flex justify-between mt-1 text-xs text-neutral-500">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

/**
 * Range Slider component with two handles for min/max selection
 */
export interface RangeSliderProps
  extends Omit<SliderProps, 'value' | 'defaultValue' | 'onChange'> {
  /** Current range value [min, max] */
  value?: [number, number];
  /** Default range value */
  defaultValue?: [number, number];
  /** Change handler for range */
  onChange?: (value: [number, number]) => void;
  /** Minimum gap between handles */
  minGap?: number;
}

const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  (
    {
      label,
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue,
      onChange,
      minGap = 0,
      formatValue = (v) => String(v),
      size = 'md',
      containerClassName,
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    const [internalValue, setInternalValue] = useState<[number, number]>(
      defaultValue || [min, max]
    );

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const sizeConfig = sliderSizes[size];

    const minPercentage = ((value[0] - min) / (max - min)) * 100;
    const maxPercentage = ((value[1] - min) / (max - min)) * 100;

    const handleMinChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.min(Number(e.target.value), value[1] - minGap);
        const newValue: [number, number] = [newMin, value[1]];
        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      [controlledValue, onChange, value, minGap]
    );

    const handleMaxChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(Number(e.target.value), value[0] + minGap);
        const newValue: [number, number] = [value[0], newMax];
        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      [controlledValue, onChange, value, minGap]
    );

    useEffect(() => {
      if (controlledValue !== undefined) {
        setInternalValue(controlledValue);
      }
    }, [controlledValue]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full',
          containerClassName
        )}
      >
        {/* Label and value display */}
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={`${id}-min`}
              className={cn(
                'font-sans font-medium text-neutral-900',
                sizeConfig.label,
                disabled && 'text-neutral-500'
              )}
            >
              {label}
            </label>
            <span
              className={cn(
                'font-sans font-medium text-accent',
                sizeConfig.label,
                disabled && 'text-neutral-500'
              )}
            >
              {formatValue(value[0])} - {formatValue(value[1])}
            </span>
          </div>
        )}

        {/* Slider container */}
        <div className="relative py-2">
          {/* Track background */}
          <div
            className={cn(
              'absolute inset-x-0 top-1/2 -translate-y-1/2',
              sizeConfig.track,
              'bg-neutral-200 rounded-full',
              disabled && 'bg-neutral-100'
            )}
          />

          {/* Filled track */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2',
              sizeConfig.track,
              'bg-accent rounded-full',
              disabled && 'bg-neutral-500'
            )}
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />

          {/* Min input */}
          <input
            type="range"
            id={`${id}-min`}
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={handleMinChange}
            disabled={disabled}
            className={cn(
              'absolute w-full appearance-none bg-transparent cursor-pointer z-20',
              'pointer-events-none',
              '[&::-webkit-slider-thumb]:pointer-events-auto',
              '[&::-webkit-slider-thumb]:appearance-none',
              `[&::-webkit-slider-thumb]:${sizeConfig.thumb}`,
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-white',
              '[&::-webkit-slider-thumb]:border-2',
              '[&::-webkit-slider-thumb]:border-accent',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:pointer-events-auto'
            )}
          />

          {/* Max input */}
          <input
            type="range"
            id={`${id}-max`}
            min={min}
            max={max}
            step={step}
            value={value[1]}
            onChange={handleMaxChange}
            disabled={disabled}
            className={cn(
              'absolute w-full appearance-none bg-transparent cursor-pointer z-20',
              'pointer-events-none',
              '[&::-webkit-slider-thumb]:pointer-events-auto',
              '[&::-webkit-slider-thumb]:appearance-none',
              `[&::-webkit-slider-thumb]:${sizeConfig.thumb}`,
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-white',
              '[&::-webkit-slider-thumb]:border-2',
              '[&::-webkit-slider-thumb]:border-accent',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:pointer-events-auto'
            )}
          />
        </div>

        {/* Markers */}
        <div className="flex justify-between mt-1 text-xs text-neutral-500">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    );
  }
);

RangeSlider.displayName = 'RangeSlider';

export { Slider, RangeSlider, sliderSizes };
