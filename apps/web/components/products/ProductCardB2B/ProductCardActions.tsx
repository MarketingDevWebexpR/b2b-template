'use client';

/**
 * ProductCardActions Component
 *
 * Provides B2B action buttons for product cards:
 * - Quantity selector (increment/decrement)
 * - Add to cart button
 * - Favorite toggle button
 * - Compare toggle button
 *
 * Supports multiple layouts for different card variants.
 *
 * @packageDocumentation
 */

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ProductCardActionsProps } from './types';

/**
 * Icons for action buttons
 */
const Icons = {
  Heart: ({ filled, className }: { filled?: boolean; className?: string }) => (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  ),
  Compare: ({ active, className }: { active?: boolean; className?: string }) => (
    <svg
      className={className}
      fill={active ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  ),
  Minus: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Cart: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  ),
};

/**
 * Quantity Selector Component
 */
function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  disabled = false,
  size = 'md',
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  }, [value, min, step, onChange]);

  const handleIncrement = useCallback(() => {
    const newValue = max !== undefined ? Math.min(max, value + step) : value + step;
    onChange(newValue);
  }, [value, max, step, onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = parseInt(e.target.value, 10);
      if (isNaN(inputValue)) return;

      let newValue = Math.max(min, inputValue);
      if (max !== undefined) {
        newValue = Math.min(max, newValue);
      }
      onChange(newValue);
    },
    [min, max, onChange]
  );

  const sizeStyles = {
    sm: {
      wrapper: 'h-7',
      button: 'w-7 h-7',
      icon: 'w-3 h-3',
      input: 'w-10 text-xs',
    },
    md: {
      wrapper: 'h-9',
      button: 'w-9 h-9',
      icon: 'w-4 h-4',
      input: 'w-12 text-sm',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-stroke bg-white',
        disabled && 'opacity-50 cursor-not-allowed',
        styles.wrapper,
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          'flex items-center justify-center rounded-l-soft',
          'text-content-secondary hover:bg-surface-secondary hover:text-content-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50',
          styles.button
        )}
        aria-label="Diminuer la quantite"
      >
        <Icons.Minus className={styles.icon} />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={cn(
          'border-x border-stroke text-center font-medium text-content-primary',
          'focus:outline-none focus:ring-0',
          'disabled:bg-surface-secondary disabled:cursor-not-allowed',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          styles.input,
          styles.wrapper
        )}
        aria-label="Quantite"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className={cn(
          'flex items-center justify-center rounded-r-soft',
          'text-content-secondary hover:bg-surface-secondary hover:text-content-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50',
          styles.button
        )}
        aria-label="Augmenter la quantite"
      >
        <Icons.Plus className={styles.icon} />
      </button>
    </div>
  );
}

/**
 * Icon Button Component
 */
function IconButton({
  onClick,
  active = false,
  disabled = false,
  ariaLabel,
  children,
  className,
}: {
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
        active
          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          : 'bg-surface-secondary text-content-secondary hover:bg-surface-tertiary hover:text-content-primary',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-surface-secondary',
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * ProductCardActions - B2B action buttons component
 */
export function ProductCardActions({
  productId,
  quantity,
  onQuantityChange,
  onAddToCart,
  onToggleFavorite,
  onToggleCompare,
  isFavorite = false,
  isComparing = false,
  maxQuantity,
  minQuantity = 1,
  quantityStep = 1,
  layout = 'horizontal',
  minimal = false,
  isOutOfStock = false,
  className,
}: ProductCardActionsProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart || isOutOfStock) return;

    setIsAdding(true);
    try {
      await onAddToCart();
    } finally {
      setIsAdding(false);
    }
  }, [onAddToCart, isOutOfStock]);

  // Horizontal layout (default for grid cards)
  if (layout === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <QuantitySelector
          value={quantity}
          onChange={onQuantityChange}
          min={minQuantity}
          max={maxQuantity}
          step={quantityStep}
          disabled={isOutOfStock}
        />

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'text-sm font-medium transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
            isOutOfStock
              ? 'bg-surface-secondary text-content-muted cursor-not-allowed'
              : 'bg-content-primary text-white hover:bg-content-secondary active:bg-black'
          )}
        >
          {isAdding ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icons.Cart className="w-4 h-4" />
              <span>{isOutOfStock ? 'Indisponible' : 'Ajouter'}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Vertical layout (for list cards)
  if (layout === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center gap-2">
          <QuantitySelector
            value={quantity}
            onChange={onQuantityChange}
            min={minQuantity}
            max={maxQuantity}
            step={quantityStep}
            disabled={isOutOfStock}
          />

          {!minimal && (
            <div className="flex items-center gap-1">
              {onToggleFavorite && (
                <IconButton
                  onClick={onToggleFavorite}
                  active={isFavorite}
                  ariaLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Icons.Heart filled={isFavorite} className="w-4 h-4" />
                </IconButton>
              )}
              {onToggleCompare && (
                <IconButton
                  onClick={onToggleCompare}
                  active={isComparing}
                  ariaLabel={isComparing ? 'Retirer de la comparaison' : 'Ajouter a la comparaison'}
                >
                  <Icons.Compare active={isComparing} className="w-4 h-4" />
                </IconButton>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'text-sm font-medium transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
            isOutOfStock
              ? 'bg-surface-secondary text-content-muted cursor-not-allowed'
              : 'bg-content-primary text-white hover:bg-content-secondary active:bg-black'
          )}
        >
          {isAdding ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icons.Cart className="w-4 h-4" />
              <span>{isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Compact layout (for table rows)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <QuantitySelector
        value={quantity}
        onChange={onQuantityChange}
        min={minQuantity}
        max={maxQuantity}
        step={quantityStep}
        disabled={isOutOfStock}
        size="sm"
      />

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
        className={cn(
          'flex items-center justify-center p-1.5 rounded-lg',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1',
          isOutOfStock
            ? 'bg-surface-secondary text-content-muted cursor-not-allowed'
            : 'bg-content-primary text-white hover:bg-content-secondary'
        )}
        aria-label={isOutOfStock ? 'Produit indisponible' : 'Ajouter au panier'}
      >
        {isAdding ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Icons.Plus className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

/**
 * Floating action buttons for grid cards
 */
export function ProductCardFloatingActions({
  onToggleFavorite,
  onToggleCompare,
  isFavorite = false,
  isComparing = false,
  className,
}: {
  onToggleFavorite?: () => void;
  onToggleCompare?: () => void;
  isFavorite?: boolean;
  isComparing?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isFavorite}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full',
            'bg-white/90 backdrop-blur-sm shadow-sm',
            'transition-all duration-200',
            'hover:bg-white hover:shadow-md hover:scale-110',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            isFavorite ? 'text-danger' : 'text-content-secondary'
          )}
        >
          <Icons.Heart filled={isFavorite} className="w-4 h-4" />
        </button>
      )}

      {onToggleCompare && (
        <button
          type="button"
          onClick={onToggleCompare}
          aria-label={isComparing ? 'Retirer de la comparaison' : 'Comparer'}
          aria-pressed={isComparing}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full',
            'bg-white/90 backdrop-blur-sm shadow-sm',
            'transition-all duration-200',
            'hover:bg-white hover:shadow-md hover:scale-110',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            isComparing ? 'text-primary' : 'text-content-secondary'
          )}
        >
          <Icons.Compare active={isComparing} className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default ProductCardActions;
