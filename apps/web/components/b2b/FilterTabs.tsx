import { cn } from '@/lib/utils';

interface FilterOption<T extends string> {
  /** Value of the filter option */
  value: T;
  /** Display label */
  label: string;
  /** Optional badge count */
  count?: number;
}

interface FilterTabsProps<T extends string> {
  /** Available filter options */
  options: FilterOption<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Show count badges */
  showCounts?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * FilterTabs Component
 *
 * Displays a row of filter buttons for filtering lists.
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
 *
 * <FilterTabs
 *   options={[
 *     { value: 'all', label: 'Tous', count: 42 },
 *     { value: 'pending', label: 'En attente', count: 5 },
 *     { value: 'approved', label: 'Approuves', count: 37 },
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 *   showCounts
 * />
 * ```
 */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  showCounts = false,
  className,
}: FilterTabsProps<T>) {
  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="tablist"
      aria-label="Filtres"
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const showBadge = showCounts && option.count !== undefined && option.count > 0;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`tabpanel-${option.value}`}
            tabIndex={isSelected ? 0 : -1}
            className={cn(
              'px-4 py-2 rounded-lg',
              'text-body-sm font-medium',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
              isSelected
                ? 'bg-primary text-white'
                : 'bg-white border border-stroke-light text-content-secondary hover:bg-surface-secondary'
            )}
          >
            {option.label}
            {showBadge && (
              <span
                className={cn(
                  'ml-2 px-1.5 py-0.5 rounded text-xs',
                  isSelected ? 'bg-white/20' : 'bg-surface-secondary'
                )}
                aria-label={`${option.count} elements`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
