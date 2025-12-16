'use client';

import { useState, useCallback, useEffect, useRef, useMemo, useId } from 'react';
import { cn, formatPrice, debounce } from '@/lib/utils';
import { useSearchFilters } from '@/contexts/SearchContext';
import { RangeSlider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';
import { FilterCollapsible } from './FilterCollapsible';
import type { PriceRange } from '@/contexts/SearchContext';

export interface PricePreset {
  label: string;
  min: number;
  max: number;
}

export interface FilterPriceProps {
  /** Custom title for the section */
  title?: string;
  /** Minimum possible price */
  minPrice?: number;
  /** Maximum possible price */
  maxPrice?: number;
  /** Step for slider/inputs */
  step?: number;
  /** Debounce delay for slider in ms */
  debounceMs?: number;
  /** Price presets to show */
  presets?: PricePreset[];
  /** Whether to show input fields */
  showInputs?: boolean;
  /** Whether to show presets */
  showPresets?: boolean;
  /** Currency symbol */
  currency?: string;
  /** Additional class name */
  className?: string;
}

const DEFAULT_PRESETS: PricePreset[] = [
  { label: '< 100 EUR', min: 0, max: 100 },
  { label: '100 EUR - 500 EUR', min: 100, max: 500 },
  { label: '500 EUR - 2 000 EUR', min: 500, max: 2000 },
  { label: '> 2 000 EUR', min: 2000, max: Infinity },
];

/**
 * FilterPrice
 *
 * Price range filter with dual range slider, min/max inputs, and preset options.
 * Features debounced updates to prevent excessive re-renders during slider interaction.
 */
export function FilterPrice({
  title = 'Prix HT',
  minPrice = 0,
  maxPrice = 10000,
  step = 10,
  debounceMs = 300,
  presets = DEFAULT_PRESETS,
  showInputs = true,
  showPresets = true,
  currency = 'EUR',
  className,
}: FilterPriceProps) {
  const { filters, setPriceRange } = useSearchFilters();

  // Local state for immediate UI feedback
  const [localRange, setLocalRange] = useState<[number, number]>([
    filters.priceRange?.min ?? minPrice,
    filters.priceRange?.max ?? maxPrice,
  ]);

  // Input values as strings for controlled inputs
  const [minInputValue, setMinInputValue] = useState(
    filters.priceRange?.min?.toString() ?? ''
  );
  const [maxInputValue, setMaxInputValue] = useState(
    filters.priceRange?.max?.toString() ?? ''
  );

  const minInputId = useId();
  const maxInputId = useId();

  // Debounced update to context
  const debouncedSetPriceRange = useRef(
    debounce((range: PriceRange | undefined) => {
      setPriceRange(range);
    }, debounceMs)
  ).current;

  // Sync local state with context when filters change externally
  useEffect(() => {
    if (filters.priceRange) {
      setLocalRange([filters.priceRange.min, filters.priceRange.max]);
      setMinInputValue(filters.priceRange.min.toString());
      setMaxInputValue(filters.priceRange.max.toString());
    } else {
      setLocalRange([minPrice, maxPrice]);
      setMinInputValue('');
      setMaxInputValue('');
    }
  }, [filters.priceRange, minPrice, maxPrice]);

  // Check if price filter is active
  const isActive = filters.priceRange !== undefined;

  // Handle slider change
  const handleSliderChange = useCallback(
    (value: [number, number]) => {
      setLocalRange(value);
      setMinInputValue(value[0].toString());
      setMaxInputValue(value[1].toString());

      // Check if it's the full range (no filter)
      if (value[0] === minPrice && value[1] === maxPrice) {
        debouncedSetPriceRange(undefined);
      } else {
        debouncedSetPriceRange({ min: value[0], max: value[1] });
      }
    },
    [minPrice, maxPrice, debouncedSetPriceRange]
  );

  // Handle min input change
  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMinInputValue(value);

      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= minPrice && numValue < localRange[1]) {
        setLocalRange([numValue, localRange[1]]);
        debouncedSetPriceRange({ min: numValue, max: localRange[1] });
      }
    },
    [minPrice, localRange, debouncedSetPriceRange]
  );

  // Handle max input change
  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMaxInputValue(value);

      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue <= maxPrice && numValue > localRange[0]) {
        setLocalRange([localRange[0], numValue]);
        debouncedSetPriceRange({ min: localRange[0], max: numValue });
      }
    },
    [maxPrice, localRange, debouncedSetPriceRange]
  );

  // Handle preset selection
  const handlePresetClick = useCallback(
    (preset: PricePreset) => {
      const min = preset.min;
      const max = preset.max === Infinity ? maxPrice : preset.max;

      setLocalRange([min, max]);
      setMinInputValue(min.toString());
      setMaxInputValue(max.toString());
      setPriceRange({ min, max });
    },
    [maxPrice, setPriceRange]
  );

  // Check if a preset matches current range
  const isPresetActive = useCallback(
    (preset: PricePreset) => {
      if (!filters.priceRange) return false;
      const presetMax = preset.max === Infinity ? maxPrice : preset.max;
      return (
        filters.priceRange.min === preset.min &&
        filters.priceRange.max === presetMax
      );
    },
    [filters.priceRange, maxPrice]
  );

  // Format price for display
  const formatDisplayPrice = useCallback(
    (value: number) => {
      return `${value.toLocaleString('fr-FR')} ${currency}`;
    },
    [currency]
  );

  return (
    <FilterCollapsible
      title={title}
      activeCount={isActive ? 1 : 0}
      defaultExpanded={true}
      className={className}
    >
      <div className="space-y-4">
        {/* Range Slider */}
        <RangeSlider
          min={minPrice}
          max={maxPrice}
          step={step}
          value={localRange}
          onChange={handleSliderChange}
          formatValue={formatDisplayPrice}
          size="sm"
          aria-label="Fourchette de prix"
        />

        {/* Min/Max Inputs */}
        {showInputs && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label htmlFor={minInputId} className="sr-only">
                Prix minimum
              </label>
              <div className="relative">
                <input
                  id={minInputId}
                  type="number"
                  value={minInputValue}
                  onChange={handleMinInputChange}
                  placeholder="Min"
                  min={minPrice}
                  max={maxPrice}
                  className={cn(
                    'w-full px-3 py-2 pr-12',
                    'text-sm text-right',
                    'bg-neutral-50',
                    'border border-neutral-200 rounded-md',
                    'placeholder:text-neutral-400',
                    'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
                    'transition-colors duration-200',
                    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  {currency}
                </span>
              </div>
            </div>

            <span className="text-neutral-500">-</span>

            <div className="flex-1">
              <label htmlFor={maxInputId} className="sr-only">
                Prix maximum
              </label>
              <div className="relative">
                <input
                  id={maxInputId}
                  type="number"
                  value={maxInputValue}
                  onChange={handleMaxInputChange}
                  placeholder="Max"
                  min={minPrice}
                  max={maxPrice}
                  className={cn(
                    'w-full px-3 py-2 pr-12',
                    'text-sm text-right',
                    'bg-neutral-50',
                    'border border-neutral-200 rounded-md',
                    'placeholder:text-neutral-400',
                    'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
                    'transition-colors duration-200',
                    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  {currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Presets */}
        {showPresets && presets.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-neutral-200">
            {presets.map((preset, index) => {
              const active = isPresetActive(preset);
              return (
                <button
                  key={`${preset.min}-${preset.max}-${index}`}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    'flex items-center w-full py-1.5 px-2 -mx-2 rounded',
                    'text-sm text-left',
                    'transition-colors duration-150',
                    active
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-neutral-900 hover:bg-neutral-100'
                  )}
                  aria-pressed={active}
                >
                  <span
                    className={cn(
                      'w-4 h-4 mr-2 rounded-sm border-2 flex items-center justify-center',
                      'transition-colors duration-150',
                      active
                        ? 'border-accent bg-accent'
                        : 'border-neutral-300'
                    )}
                  >
                    {active && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FilterCollapsible>
  );
}

export default FilterPrice;
