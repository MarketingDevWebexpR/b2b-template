'use client';

/**
 * ProductActions - B2B Product Action Buttons Component
 *
 * Features:
 * - Quantity selector with min/max/step constraints
 * - Add to cart button with loading state
 * - Add to favorites/wishlist
 * - Request a quote (B2B specific)
 * - Stock-aware quantity limits
 * - Quick order by reference
 * - Bulk quantity entry
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  FileText,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Loader2,
  Package,
  Truck,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { StockStatus, ProductStock, Warehouse } from '@maison/types';

// ============================================================================
// Types
// ============================================================================

export interface ProductActionsProps {
  /** Product ID */
  productId: string;
  /** Product name for confirmations */
  productName: string;
  /** Current unit price */
  unitPrice: number;
  /** Format price function */
  formatPrice: (price: number) => string;
  /** Stock information */
  stock?: ProductStock;
  /** Minimum order quantity */
  minQuantity?: number;
  /** Maximum order quantity */
  maxQuantity?: number;
  /** Quantity step (e.g., multiples of 5) */
  quantityStep?: number;
  /** Is the product in wishlist */
  isInWishlist?: boolean;
  /** Currently selected warehouse */
  selectedWarehouse?: Warehouse | null;
  /** Whether to show warehouse selector */
  showWarehouseSelector?: boolean;
  /** Callback when quantity changes */
  onQuantityChange?: (quantity: number) => void;
  /** Callback when adding to cart */
  onAddToCart: (quantity: number) => Promise<void>;
  /** Callback when adding to wishlist */
  onAddToWishlist?: () => void;
  /** Callback when requesting a quote */
  onRequestQuote?: (quantity: number) => void;
  /** Callback when warehouse selection is needed */
  onSelectWarehouse?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const QUANTITY_INPUT_DEBOUNCE = 300;

// ============================================================================
// Helper Functions
// ============================================================================

function getStockStatusConfig(status: StockStatus) {
  switch (status) {
    case 'in_stock':
      return {
        label: 'En stock',
        icon: <Package className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    case 'low_stock':
      return {
        label: 'Stock limite',
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      };
    case 'out_of_stock':
      return {
        label: 'Rupture de stock',
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    case 'backorder':
      return {
        label: 'Sur commande',
        icon: <Clock className="w-4 h-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      };
    case 'preorder':
      return {
        label: 'Precommande',
        icon: <Clock className="w-4 h-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      };
    default:
      return {
        label: 'Indisponible',
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-neutral-500',
        bgColor: 'bg-neutral-100',
      };
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

interface QuantitySelectorProps {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function QuantitySelector({
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input value with prop
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  }, [min, step, value, onChange]);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  }, [max, step, value, onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setInputValue(rawValue);

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce the actual change
      debounceRef.current = setTimeout(() => {
        const numValue = parseInt(rawValue, 10);
        if (!isNaN(numValue)) {
          // Snap to step
          const snappedValue = Math.round(numValue / step) * step;
          const clampedValue = Math.min(Math.max(snappedValue, min), max);
          onChange(clampedValue);
          setInputValue(String(clampedValue));
        } else {
          setInputValue(String(value));
        }
      }, QUANTITY_INPUT_DEBOUNCE);
    },
    [min, max, step, value, onChange]
  );

  const handleBlur = useCallback(() => {
    // Ensure valid value on blur
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min) {
      onChange(min);
      setInputValue(String(min));
    } else if (numValue > max) {
      onChange(max);
      setInputValue(String(max));
    } else {
      const snappedValue = Math.round(numValue / step) * step;
      onChange(snappedValue);
      setInputValue(String(snappedValue));
    }
  }, [inputValue, min, max, step, onChange]);

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          'flex items-center justify-center w-10 h-12',
          'bg-neutral-100 hover:bg-neutral-200',
          'border border-r-0 border-neutral-200 rounded-l-lg',
          'text-neutral-600 hover:text-neutral-900',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset'
        )}
        aria-label="Reduire la quantite"
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          'w-20 h-12 text-center text-neutral-900 font-medium',
          'bg-white border-y border-neutral-200',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
          'disabled:bg-neutral-100 disabled:opacity-50'
        )}
        aria-label="Quantite"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          'flex items-center justify-center w-10 h-12',
          'bg-neutral-100 hover:bg-neutral-200',
          'border border-l-0 border-neutral-200 rounded-r-lg',
          'text-neutral-600 hover:text-neutral-900',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset'
        )}
        aria-label="Augmenter la quantite"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductActions({
  productId,
  productName,
  unitPrice,
  formatPrice,
  stock,
  minQuantity = 1,
  maxQuantity = 999,
  quantityStep = 1,
  isInWishlist = false,
  selectedWarehouse,
  showWarehouseSelector = false,
  onQuantityChange,
  onAddToCart,
  onAddToWishlist,
  onRequestQuote,
  onSelectWarehouse,
  className,
}: ProductActionsProps) {
  // State
  const [quantity, setQuantity] = useState(minQuantity);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const stockStatus = stock?.globalStatus || 'in_stock';
  const availableQuantity = stock?.totalAvailable ?? maxQuantity;
  const effectiveMaxQuantity = Math.min(maxQuantity, availableQuantity);
  const statusConfig = getStockStatusConfig(stockStatus);

  const isOutOfStock = stockStatus === 'out_of_stock' || stockStatus === 'discontinued';
  const canAddToCart = !isOutOfStock && quantity >= minQuantity && quantity <= effectiveMaxQuantity;

  // Total price
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      setQuantity(newQuantity);
      setError(null);
      onQuantityChange?.(newQuantity);
    },
    [onQuantityChange]
  );

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart || isAddingToCart) return;

    setIsAddingToCart(true);
    setError(null);

    try {
      await onAddToCart(quantity);
      setAddedToCart(true);

      // Reset added state after animation
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  }, [canAddToCart, isAddingToCart, quantity, onAddToCart]);

  // Handle request quote
  const handleRequestQuote = useCallback(() => {
    onRequestQuote?.(quantity);
  }, [quantity, onRequestQuote]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stock Status Banner */}
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg',
          statusConfig.bgColor
        )}
      >
        <span className={statusConfig.color}>{statusConfig.icon}</span>
        <div className="flex-1">
          <span className={cn('font-medium', statusConfig.color)}>
            {statusConfig.label}
          </span>
          {stock?.totalAvailable !== undefined && stock.totalAvailable > 0 && (
            <span className="text-neutral-600 text-sm ml-2">
              ({stock.totalAvailable} disponible{stock.totalAvailable > 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Selected Warehouse */}
        {selectedWarehouse && (
          <button
            type="button"
            onClick={onSelectWarehouse}
            className="text-sm text-neutral-600 hover:text-accent transition-colors"
          >
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              {selectedWarehouse.name}
            </span>
          </button>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-900">
            Quantite
          </label>
          {quantityStep > 1 && (
            <span className="text-xs text-neutral-500">
              (par multiples de {quantityStep})
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <QuantitySelector
            value={quantity}
            min={minQuantity}
            max={effectiveMaxQuantity}
            step={quantityStep}
            disabled={isOutOfStock}
            onChange={handleQuantityChange}
          />

          {/* Total Price */}
          <div className="flex-1 text-right">
            <div className="text-sm text-neutral-500">Total</div>
            <div className="text-xl font-semibold text-neutral-900">
              {formatPrice(totalPrice)}
            </div>
          </div>
        </div>

        {/* Min/Max Info */}
        {(minQuantity > 1 || effectiveMaxQuantity < maxQuantity) && (
          <div className="text-xs text-neutral-500">
            {minQuantity > 1 && <span>Min: {minQuantity} unites</span>}
            {minQuantity > 1 && effectiveMaxQuantity < maxQuantity && <span> | </span>}
            {effectiveMaxQuantity < maxQuantity && (
              <span>Max: {effectiveMaxQuantity} unites (stock disponible)</span>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!canAddToCart}
          isLoading={isAddingToCart}
          onClick={handleAddToCart}
        >
          <AnimatePresence mode="wait">
            {addedToCart ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Ajoute au panier
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Ajouter au panier
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          {/* Request Quote Button */}
          {onRequestQuote && (
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={handleRequestQuote}
            >
              <FileText className="w-4 h-4 mr-2" />
              Demander un devis
            </Button>
          )}

          {/* Add to Wishlist Button */}
          {onAddToWishlist && (
            <Button
              variant="ghost"
              size="md"
              className={cn(
                'flex-shrink-0',
                isInWishlist && 'text-red-600'
              )}
              onClick={onAddToWishlist}
              aria-label={isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-pressed={isInWishlist}
            >
              <Heart
                className={cn('w-5 h-5', isInWishlist && 'fill-current')}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Delivery Info */}
      {selectedWarehouse && (
        <div className="space-y-2 pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Truck className="w-4 h-4 text-neutral-500" />
            <span>Livraison depuis {selectedWarehouse.name}</span>
          </div>
          {selectedWarehouse.deliveryOptions?.[0] && (
            <div className="text-xs text-neutral-500 ml-6">
              {selectedWarehouse.deliveryOptions[0].estimatedTime} -
              {selectedWarehouse.deliveryOptions[0].priceHT === 0
                ? ' Gratuit'
                : ` ${formatPrice(selectedWarehouse.deliveryOptions[0].priceHT)}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductActions;
