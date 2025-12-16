'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import type { BulkOrderItem, ProductCatalogEntry } from '@maison/types';

/**
 * Row status for visual feedback
 */
export type QuickOrderRowStatus = 'empty' | 'valid' | 'error' | 'warning' | 'loading';

/**
 * Props for QuickOrderRow component
 */
export interface QuickOrderRowProps {
  /** Current row data */
  item: Partial<BulkOrderItem> & { sku: string; quantity: number };
  /** Row index for identification */
  index: number;
  /** Product catalog for autocomplete */
  productCatalog: Record<string, ProductCatalogEntry>;
  /** Callback when SKU changes */
  onSkuChange: (index: number, sku: string) => void;
  /** Callback when quantity changes */
  onQuantityChange: (index: number, quantity: number) => void;
  /** Callback to remove the row */
  onRemove: (index: number) => void;
  /** Callback when Enter is pressed (to move to next row or add new) */
  onEnterPress?: (index: number) => void;
  /** Whether this row should auto-focus */
  autoFocus?: boolean;
  /** Whether remove button should be disabled */
  disableRemove?: boolean;
}

/**
 * QuickOrderRow Component
 *
 * Individual row for quick order entry with:
 * - SKU input with autocomplete
 * - Quantity input with validation
 * - Price display (calculated)
 * - Stock availability indicator
 * - Status indicator (valid/error/warning)
 *
 * @example
 * ```tsx
 * <QuickOrderRow
 *   item={{ sku: 'BRA-001', quantity: 5 }}
 *   index={0}
 *   productCatalog={catalog}
 *   onSkuChange={handleSkuChange}
 *   onQuantityChange={handleQtyChange}
 *   onRemove={handleRemove}
 * />
 * ```
 */
export function QuickOrderRow({
  item,
  index,
  productCatalog,
  onSkuChange,
  onQuantityChange,
  onRemove,
  onEnterPress,
  autoFocus = false,
  disableRemove = false,
}: QuickOrderRowProps) {
  const [skuInput, setSkuInput] = useState(item.sku);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const skuInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Sync skuInput with item.sku when it changes externally
  useEffect(() => {
    setSkuInput(item.sku);
  }, [item.sku]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && skuInputRef.current) {
      skuInputRef.current.focus();
    }
  }, [autoFocus]);

  // Determine row status
  const getStatus = useCallback((): QuickOrderRowStatus => {
    if (!item.sku) return 'empty';
    if (item.isValid === false) return 'error';
    if (item.product && item.quantity > (item.product.availableStock ?? 0) * 0.8) {
      return 'warning';
    }
    if (item.product && item.isValid === true) return 'valid';
    return 'empty';
  }, [item]);

  const status = getStatus();

  // Filter suggestions based on input
  const suggestions = Object.values(productCatalog)
    .filter((product) => {
      if (!skuInput) return false;
      const searchTerm = skuInput.toUpperCase();
      return (
        product.sku.toUpperCase().includes(searchTerm) ||
        product.name.toUpperCase().includes(searchTerm)
      );
    })
    .slice(0, 8);

  // Handle SKU input change
  const handleSkuInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setSkuInput(value);
      setShowSuggestions(value.length > 0);
      setSelectedSuggestionIndex(-1);
    },
    []
  );

  // Handle SKU blur - validate and update
  const handleSkuBlur = useCallback(() => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      if (skuInput !== item.sku) {
        onSkuChange(index, skuInput);
      }
    }, 200);
  }, [skuInput, item.sku, index, onSkuChange]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback(
    (product: ProductCatalogEntry) => {
      setSkuInput(product.sku);
      setShowSuggestions(false);
      onSkuChange(index, product.sku);
      // Move focus to quantity input
      quantityInputRef.current?.focus();
    },
    [index, onSkuChange]
  );

  // Handle keyboard navigation in suggestions
  const handleSkuKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions && suggestions.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedSuggestionIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
          case 'Enter':
            e.preventDefault();
            if (selectedSuggestionIndex >= 0) {
              handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
            } else if (suggestions.length === 1) {
              handleSelectSuggestion(suggestions[0]);
            } else {
              setShowSuggestions(false);
              onSkuChange(index, skuInput);
              quantityInputRef.current?.focus();
            }
            break;
          case 'Escape':
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
            break;
          case 'Tab':
            setShowSuggestions(false);
            if (skuInput !== item.sku) {
              onSkuChange(index, skuInput);
            }
            break;
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (skuInput !== item.sku) {
          onSkuChange(index, skuInput);
        }
        quantityInputRef.current?.focus();
      }
    },
    [
      showSuggestions,
      suggestions,
      selectedSuggestionIndex,
      handleSelectSuggestion,
      index,
      skuInput,
      item.sku,
      onSkuChange,
    ]
  );

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0) {
        onQuantityChange(index, value);
      }
    },
    [index, onQuantityChange]
  );

  // Handle quantity keyboard
  const handleQuantityKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnterPress?.(index);
      }
    },
    [index, onEnterPress]
  );

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[
        selectedSuggestionIndex
      ] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedSuggestionIndex]);

  // Status indicator styles
  const statusStyles: Record<QuickOrderRowStatus, string> = {
    empty: 'border-neutral-200',
    valid: 'border-green-300 bg-green-50/30',
    error: 'border-red-300 bg-red-50/30',
    warning: 'border-amber-300 bg-amber-50/30',
    loading: 'border-blue-300 bg-blue-50/30',
  };

  const statusIndicatorStyles: Record<QuickOrderRowStatus, string> = {
    empty: 'bg-gray-200',
    valid: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    loading: 'bg-blue-500 animate-pulse',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-3 p-3 rounded-lg border transition-all duration-200',
        statusStyles[status]
      )}
      role="row"
      aria-label={`Ligne ${index + 1}`}
    >
      {/* Status indicator */}
      <div className="col-span-1 flex items-center justify-center" role="cell">
        <div
          className={cn('w-2.5 h-2.5 rounded-full', statusIndicatorStyles[status])}
          aria-label={
            status === 'valid'
              ? 'Produit valide'
              : status === 'error'
              ? 'Erreur'
              : status === 'warning'
              ? 'Attention'
              : 'En attente'
          }
        />
      </div>

      {/* SKU input with autocomplete */}
      <div className="col-span-4 relative" role="cell">
        <label htmlFor={`sku-${index}`} className="sr-only">
          Reference produit
        </label>
        <input
          ref={skuInputRef}
          id={`sku-${index}`}
          type="text"
          value={skuInput}
          onChange={handleSkuInputChange}
          onBlur={handleSkuBlur}
          onFocus={() => skuInput && setShowSuggestions(true)}
          onKeyDown={handleSkuKeyDown}
          placeholder="REF-001"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls={`suggestions-${index}`}
          aria-activedescendant={
            selectedSuggestionIndex >= 0
              ? `suggestion-${index}-${selectedSuggestionIndex}`
              : undefined
          }
          className={cn(
            'w-full px-3 py-2',
            'bg-white border border-neutral-200 rounded-lg',
            'font-mono text-body-sm text-neutral-900 uppercase',
            'placeholder:text-neutral-500 placeholder:normal-case',
            'focus:outline-none focus:ring-2 focus-visible:ring-accent/30 focus:border-accent',
            'transition-all duration-200'
          )}
        />

        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            id={`suggestions-${index}`}
            role="listbox"
            className={cn(
              'absolute z-50 left-0 right-0 mt-1',
              'bg-white border border-neutral-200 rounded-lg shadow-lg',
              'max-h-60 overflow-auto'
            )}
          >
            {suggestions.map((product, suggestionIndex) => (
              <li
                key={product.sku}
                id={`suggestion-${index}-${suggestionIndex}`}
                role="option"
                aria-selected={selectedSuggestionIndex === suggestionIndex}
                onClick={() => handleSelectSuggestion(product)}
                className={cn(
                  'px-3 py-2 cursor-pointer',
                  'transition-colors duration-150',
                  selectedSuggestionIndex === suggestionIndex
                    ? 'bg-accent/5 text-accent'
                    : 'hover:bg-neutral-100'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-body-sm font-medium text-accent">
                      {product.sku}
                    </span>
                    <p className="font-sans text-caption text-neutral-600 truncate">
                      {product.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-sans text-caption font-medium text-neutral-900">
                      {formatCurrency(product.unitPrice)}
                    </p>
                    <p className="font-sans text-caption text-neutral-500">
                      Stock: {formatNumber(product.availableStock)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quantity input */}
      <div className="col-span-2" role="cell">
        <label htmlFor={`qty-${index}`} className="sr-only">
          Quantite
        </label>
        <input
          ref={quantityInputRef}
          id={`qty-${index}`}
          type="number"
          min={1}
          value={item.quantity || ''}
          onChange={handleQuantityChange}
          onKeyDown={handleQuantityKeyDown}
          placeholder="Qte"
          className={cn(
            'w-full px-3 py-2 text-center',
            'bg-white border border-neutral-200 rounded-lg',
            'font-sans text-body-sm text-neutral-900',
            'placeholder:text-neutral-500',
            'focus:outline-none focus:ring-2 focus-visible:ring-accent/30 focus:border-accent',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
        />
      </div>

      {/* Unit price display */}
      <div className="col-span-2 flex items-center justify-end" role="cell">
        <span className="font-sans text-body-sm text-neutral-600">
          {item.unitPrice ? formatCurrency(item.unitPrice) : '-'}
        </span>
      </div>

      {/* Line total */}
      <div className="col-span-2 flex items-center justify-end" role="cell">
        <span className="font-sans text-body-sm font-medium text-neutral-900">
          {item.lineTotal ? formatCurrency(item.lineTotal) : '-'}
        </span>
      </div>

      {/* Remove button */}
      <div className="col-span-1 flex items-center justify-center" role="cell">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={disableRemove}
          aria-label={`Supprimer la ligne ${index + 1}`}
          className={cn(
            'p-1.5 rounded-lg',
            'text-neutral-500 hover:text-red-600 hover:bg-red-50',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-neutral-500 disabled:hover:bg-transparent',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-red-200'
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Error/Warning message */}
      {(status === 'error' || status === 'warning') && item.errors && item.errors.length > 0 && (
        <div className="col-span-12 mt-1 pl-8" role="alert">
          <p
            className={cn(
              'font-sans text-caption',
              status === 'error' ? 'text-red-600' : 'text-amber-600'
            )}
          >
            {item.errors[0]}
          </p>
        </div>
      )}

      {/* Product info hint when valid */}
      {status === 'valid' && item.product && (
        <div className="col-span-12 mt-1 pl-8">
          <p className="font-sans text-caption text-neutral-500 truncate">
            {item.product.name}
            <span className="ml-2 text-green-600">
              (Stock: {formatNumber(item.product.availableStock)})
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default QuickOrderRow;
