'use client';

/**
 * ProductActionsPremium - Premium B2B Jewelry Product Actions Component
 *
 * A luxury-focused product actions component with:
 * - Glass morphism design language
 * - Sticky bottom bar for mobile conversion optimization
 * - Elegant quantity selector with premium feel
 * - Visual hierarchy between Add to Cart (primary) and Request Quote (secondary)
 * - Multiple visual states: default, hover, loading, success, disabled
 * - Responsive design with mobile-first approach
 *
 * Design Philosophy:
 * - Premium/luxury feel appropriate for B2B jewelry
 * - Clear visual hierarchy for action prioritization
 * - Smooth, refined animations
 * - Accessibility-first approach
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  Clock,
  Sparkles,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockStatus, ProductStock, Warehouse } from '@maison/types';

// ============================================================================
// Types
// ============================================================================

export type ActionState = 'idle' | 'loading' | 'success' | 'error';

export interface ProductActionsPremiumProps {
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
  /** Display variant: inline or sticky bottom bar */
  variant?: 'inline' | 'sticky';
  /** Whether to show the sticky bar (only for sticky variant) */
  showStickyBar?: boolean;
  /** Callback when quantity changes */
  onQuantityChange?: (quantity: number) => void;
  /** Callback when adding to cart */
  onAddToCart: (quantity: number) => Promise<void>;
  /** Callback when adding to wishlist */
  onAddToWishlist?: () => void;
  /** Callback when requesting a quote */
  onRequestQuote?: (quantity: number) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const QUANTITY_INPUT_DEBOUNCE = 300;
const SUCCESS_STATE_DURATION = 2500;

// Animation variants for premium feel
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const stickyBarVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

const buttonContentVariants = {
  idle: { scale: 1, opacity: 1 },
  loading: { scale: 0.95, opacity: 0 },
  success: { scale: 1.05, opacity: 1 },
  error: { scale: 1, opacity: 1 },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getStockStatusConfig(status: StockStatus) {
  const configs = {
    in_stock: {
      label: 'En stock',
      sublabel: 'Expedition sous 24-48h',
      icon: <Package className="w-4 h-4" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      dotColor: 'bg-emerald-500',
    },
    low_stock: {
      label: 'Stock limite',
      sublabel: 'Commandez rapidement',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      dotColor: 'bg-amber-500',
    },
    out_of_stock: {
      label: 'Rupture de stock',
      sublabel: 'Demandez un devis',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      dotColor: 'bg-red-500',
    },
    backorder: {
      label: 'Sur commande',
      sublabel: 'Delai 2-3 semaines',
      icon: <Clock className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      dotColor: 'bg-blue-500',
    },
    preorder: {
      label: 'Precommande',
      sublabel: 'Disponible bientot',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      dotColor: 'bg-violet-500',
    },
    discontinued: {
      label: 'Arrete',
      sublabel: 'Plus disponible',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-50',
      borderColor: 'border-neutral-200',
      dotColor: 'bg-neutral-500',
    },
  };

  return configs[status] || configs.out_of_stock;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Premium Quantity Selector with refined styling
 */
interface QuantitySelectorPremiumProps {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange: (value: number) => void;
}

function QuantitySelectorPremium({
  value,
  min,
  max,
  step,
  disabled,
  size = 'md',
  onChange,
}: QuantitySelectorPremiumProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useReducedMotion();

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

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const numValue = parseInt(rawValue, 10);
        if (!isNaN(numValue)) {
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
    setIsFocused(false);
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

  const sizeClasses = {
    sm: {
      button: 'w-8 h-8',
      input: 'w-12 h-8 text-sm',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      button: 'w-11 h-11',
      input: 'w-16 h-11 text-base',
      icon: 'w-4 h-4',
    },
    lg: {
      button: 'w-12 h-12',
      input: 'w-20 h-12 text-lg',
      icon: 'w-5 h-5',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'inline-flex items-center',
        'rounded-lg overflow-hidden',
        'border transition-all duration-300',
        isFocused
          ? 'border-accent ring-2 ring-accent/20 shadow-md'
          : 'border-neutral-200 hover:border-neutral-300',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <motion.button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        whileTap={!prefersReducedMotion ? { scale: 0.92 } : undefined}
        className={cn(
          'flex items-center justify-center',
          classes.button,
          'bg-gradient-to-b from-neutral-50 to-neutral-100',
          'text-neutral-600 hover:text-neutral-900',
          'hover:from-neutral-100 hover:to-neutral-150',
          'active:from-neutral-150 active:to-neutral-200',
          'transition-all duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset'
        )}
        aria-label="Reduire la quantite"
      >
        <Minus className={classes.icon} />
      </motion.button>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          classes.input,
          'text-center text-neutral-900 font-semibold',
          'bg-white border-x border-neutral-200',
          'focus:outline-none',
          'disabled:bg-neutral-50 disabled:opacity-50',
          'tabular-nums'
        )}
        aria-label="Quantite"
      />

      <motion.button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        whileTap={!prefersReducedMotion ? { scale: 0.92 } : undefined}
        className={cn(
          'flex items-center justify-center',
          classes.button,
          'bg-gradient-to-b from-neutral-50 to-neutral-100',
          'text-neutral-600 hover:text-neutral-900',
          'hover:from-neutral-100 hover:to-neutral-150',
          'active:from-neutral-150 active:to-neutral-200',
          'transition-all duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset'
        )}
        aria-label="Augmenter la quantite"
      >
        <Plus className={classes.icon} />
      </motion.button>
    </div>
  );
}

/**
 * Premium Stock Indicator with animated pulse
 */
interface StockIndicatorPremiumProps {
  status: StockStatus;
  quantity?: number;
  compact?: boolean;
}

function StockIndicatorPremium({ status, quantity, compact = false }: StockIndicatorPremiumProps) {
  const config = getStockStatusConfig(status);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg transition-colors duration-200',
        compact ? 'px-3 py-2' : 'px-4 py-3',
        config.bgColor,
        'border',
        config.borderColor
      )}
    >
      {/* Animated status dot */}
      <div className="relative flex items-center justify-center">
        <span className={cn('w-2.5 h-2.5 rounded-full', config.dotColor)} />
        {status === 'in_stock' && !prefersReducedMotion && (
          <motion.span
            className={cn('absolute w-2.5 h-2.5 rounded-full', config.dotColor)}
            animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      <div className="flex flex-col">
        <span className={cn('font-semibold text-sm', config.color)}>
          {config.label}
          {quantity !== undefined && quantity > 0 && (
            <span className="font-normal ml-1">({quantity})</span>
          )}
        </span>
        {!compact && (
          <span className="text-xs text-neutral-500">{config.sublabel}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Premium Action Button with loading/success states
 */
interface ActionButtonPremiumProps {
  children: React.ReactNode;
  state: ActionState;
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  successContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

function ActionButtonPremium({
  children,
  state,
  variant,
  size = 'md',
  disabled,
  fullWidth,
  leftIcon,
  successContent,
  onClick,
  className,
  'aria-label': ariaLabel,
}: ActionButtonPremiumProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || state === 'loading';

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm gap-2',
    md: 'h-12 px-6 text-base gap-2.5',
    lg: 'h-14 px-8 text-lg gap-3',
  };

  const variantClasses = {
    primary: cn(
      // Solid accent color - elegant and professional
      'bg-accent',
      'text-white font-semibold',
      'shadow-md',
      // Hover state
      'hover:bg-accent/90',
      'hover:shadow-lg',
      // Active state
      'active:bg-accent/80',
      'active:shadow-sm',
      // Disabled
      'disabled:bg-neutral-300',
      'disabled:shadow-none'
    ),
    secondary: cn(
      'bg-white',
      'text-neutral-700 font-medium',
      'border border-neutral-300',
      // Hover state
      'hover:border-accent hover:text-accent',
      'hover:bg-accent/5',
      // Active state
      'active:bg-accent/10',
      // Disabled
      'disabled:border-neutral-200 disabled:text-neutral-400',
      'disabled:bg-neutral-50'
    ),
    ghost: cn(
      'bg-transparent',
      'text-neutral-600',
      // Hover state
      'hover:bg-neutral-100 hover:text-neutral-900',
      // Active state
      'active:bg-neutral-200',
      // Disabled
      'disabled:text-neutral-300 disabled:bg-transparent'
    ),
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      whileTap={!prefersReducedMotion && !isDisabled ? { scale: 0.98 } : undefined}
      className={cn(
        'relative inline-flex items-center justify-center',
        'rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      aria-label={ariaLabel}
      aria-busy={state === 'loading'}
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {state === 'loading' && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Success overlay */}
      <AnimatePresence>
        {state === 'success' && successContent && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center gap-2"
          >
            {successContent}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Default content */}
      <motion.span
        animate={{
          opacity: state === 'loading' || state === 'success' ? 0 : 1,
        }}
        className="inline-flex items-center justify-center gap-2"
      >
        {leftIcon}
        {children}
      </motion.span>
    </motion.button>
  );
}

/**
 * Premium Wishlist Button with heart animation
 */
interface WishlistButtonPremiumProps {
  isActive: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

function WishlistButtonPremium({ isActive, onClick, size = 'md' }: WishlistButtonPremiumProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
      className={cn(
        'flex items-center justify-center',
        'rounded-full border transition-all duration-200',
        'aspect-square',
        sizeClasses[size],
        isActive
          ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
          : 'bg-white border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
      )}
      aria-label={isActive ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={isActive}
    >
      <motion.div
        animate={isActive && !prefersReducedMotion ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(
            iconSizes[size],
            'transition-all duration-300',
            isActive && 'fill-current'
          )}
        />
      </motion.div>
    </motion.button>
  );
}

// ============================================================================
// Main Component - Inline Variant
// ============================================================================

function ProductActionsInline({
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
  onQuantityChange,
  onAddToCart,
  onAddToWishlist,
  onRequestQuote,
  className,
}: Omit<ProductActionsPremiumProps, 'variant' | 'showStickyBar'>) {
  const [quantity, setQuantity] = useState(minQuantity);
  const [cartState, setCartState] = useState<ActionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Computed values
  const stockStatus = stock?.globalStatus || 'in_stock';
  const availableQuantity = stock?.totalAvailable ?? maxQuantity;
  const effectiveMaxQuantity = Math.min(maxQuantity, availableQuantity);

  const isOutOfStock = stockStatus === 'out_of_stock' || stockStatus === 'discontinued';
  const canAddToCart = !isOutOfStock && quantity >= minQuantity && quantity <= effectiveMaxQuantity;

  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  // Handlers
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      setQuantity(newQuantity);
      setError(null);
      onQuantityChange?.(newQuantity);
    },
    [onQuantityChange]
  );

  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart || cartState === 'loading') return;

    setCartState('loading');
    setError(null);

    try {
      await onAddToCart(quantity);
      setCartState('success');
      setTimeout(() => setCartState('idle'), SUCCESS_STATE_DURATION);
    } catch (err) {
      setCartState('error');
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout au panier");
      setTimeout(() => setCartState('idle'), 3000);
    }
  }, [canAddToCart, cartState, quantity, onAddToCart]);

  const handleRequestQuote = useCallback(() => {
    onRequestQuote?.(quantity);
  }, [quantity, onRequestQuote]);

  return (
    <motion.div
      variants={!prefersReducedMotion ? containerVariants : undefined}
      initial="hidden"
      animate="visible"
      className={cn('space-y-5', className)}
    >
      {/* Quantity and Price Section */}
      <motion.div
        variants={!prefersReducedMotion ? itemVariants : undefined}
        className="space-y-4"
      >
        {/* Quantity Label */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-700">
            Quantite
          </label>
          {quantityStep > 1 && (
            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
              Par {quantityStep}
            </span>
          )}
        </div>

        {/* Quantity Selector and Total Price */}
        <div className="flex items-center justify-between gap-4">
          <QuantitySelectorPremium
            value={quantity}
            min={minQuantity}
            max={effectiveMaxQuantity}
            step={quantityStep}
            disabled={isOutOfStock}
            size="md"
            onChange={handleQuantityChange}
          />

          {/* Price Display */}
          <div className="text-right">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Total HT
            </div>
            <div className="text-2xl font-bold text-neutral-900 tabular-nums">
              {formatPrice(totalPrice)}
            </div>
            <div className="text-xs text-neutral-400">
              {formatPrice(unitPrice)} / unite
            </div>
          </div>
        </div>

        {/* Min/Max constraints info */}
        {(minQuantity > 1 || effectiveMaxQuantity < maxQuantity) && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {minQuantity > 1 && `Minimum ${minQuantity} unites`}
              {minQuantity > 1 && effectiveMaxQuantity < maxQuantity && ' - '}
              {effectiveMaxQuantity < maxQuantity && `Maximum ${effectiveMaxQuantity} (stock disponible)`}
            </span>
          </div>
        )}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        variants={!prefersReducedMotion ? itemVariants : undefined}
        className="space-y-3"
      >
        {/* Primary: Add to Cart */}
        <ActionButtonPremium
          variant="primary"
          size="lg"
          state={cartState}
          disabled={!canAddToCart}
          fullWidth
          leftIcon={<ShoppingCart className="w-5 h-5" />}
          successContent={
            <>
              <Check className="w-5 h-5" />
              <span>Ajoute au panier</span>
            </>
          }
          onClick={handleAddToCart}
        >
          Ajouter au panier
        </ActionButtonPremium>

        {/* Secondary Actions Row */}
        <div className="flex gap-3">
          {/* Request Quote */}
          {onRequestQuote && (
            <ActionButtonPremium
              variant="secondary"
              size="md"
              state="idle"
              fullWidth
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={handleRequestQuote}
            >
              Demander un devis
            </ActionButtonPremium>
          )}

          {/* Wishlist */}
          {onAddToWishlist && (
            <WishlistButtonPremium
              isActive={isInWishlist}
              onClick={onAddToWishlist}
              size="md"
            />
          )}
        </div>
      </motion.div>

      {/* Delivery Info */}
      {selectedWarehouse && (
        <motion.div
          variants={!prefersReducedMotion ? itemVariants : undefined}
          className="pt-4 border-t border-neutral-100"
        >
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100">
              <Package className="w-4 h-4 text-neutral-500" />
            </div>
            <div>
              <div className="font-medium">Expedition depuis {selectedWarehouse.name}</div>
              {selectedWarehouse.deliveryOptions?.[0] && (
                <div className="text-xs text-neutral-500">
                  {selectedWarehouse.deliveryOptions[0].estimatedTime} -
                  {selectedWarehouse.deliveryOptions[0].priceHT === 0
                    ? ' Livraison offerte'
                    : ` ${formatPrice(selectedWarehouse.deliveryOptions[0].priceHT)}`}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Component - Sticky Bar Variant
// ============================================================================

function ProductActionsStickyBar({
  productId,
  productName,
  unitPrice,
  formatPrice,
  stock,
  minQuantity = 1,
  maxQuantity = 999,
  quantityStep = 1,
  isInWishlist = false,
  showStickyBar = true,
  onQuantityChange,
  onAddToCart,
  onAddToWishlist,
  onRequestQuote,
  className,
}: Omit<ProductActionsPremiumProps, 'variant' | 'selectedWarehouse'> & { showStickyBar?: boolean }) {
  const [quantity, setQuantity] = useState(minQuantity);
  const [cartState, setCartState] = useState<ActionState>('idle');
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Computed values
  const stockStatus = stock?.globalStatus || 'in_stock';
  const availableQuantity = stock?.totalAvailable ?? maxQuantity;
  const effectiveMaxQuantity = Math.min(maxQuantity, availableQuantity);

  const isOutOfStock = stockStatus === 'out_of_stock' || stockStatus === 'discontinued';
  const canAddToCart = !isOutOfStock && quantity >= minQuantity && quantity <= effectiveMaxQuantity;

  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);
  const statusConfig = getStockStatusConfig(stockStatus);

  // Handlers
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    },
    [onQuantityChange]
  );

  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart || cartState === 'loading') return;

    setCartState('loading');

    try {
      await onAddToCart(quantity);
      setCartState('success');
      setTimeout(() => setCartState('idle'), SUCCESS_STATE_DURATION);
    } catch (err) {
      setCartState('error');
      setTimeout(() => setCartState('idle'), 3000);
    }
  }, [canAddToCart, cartState, quantity, onAddToCart]);

  if (!showStickyBar) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={!prefersReducedMotion ? stickyBarVariants : undefined}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'safe-area-inset-bottom',
          className
        )}
      >
        {/* Glass morphism background */}
        <div
          className={cn(
            'relative',
            'bg-white/95 backdrop-blur-xl',
            'border-t border-neutral-200/50',
            'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
          )}
        >
          {/* Expandable details section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-neutral-100"
              >
                <div className="px-4 py-4 space-y-4">
                  {/* Stock indicator */}
                  <StockIndicatorPremium status={stockStatus} quantity={stock?.totalAvailable} compact />

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Quantite</span>
                    <QuantitySelectorPremium
                      value={quantity}
                      min={minQuantity}
                      max={effectiveMaxQuantity}
                      step={quantityStep}
                      disabled={isOutOfStock}
                      size="sm"
                      onChange={handleQuantityChange}
                    />
                  </div>

                  {/* Request quote button (when expanded) */}
                  {onRequestQuote && (
                    <ActionButtonPremium
                      variant="secondary"
                      size="sm"
                      state="idle"
                      fullWidth
                      leftIcon={<FileText className="w-4 h-4" />}
                      onClick={() => onRequestQuote(quantity)}
                    >
                      Demander un devis
                    </ActionButtonPremium>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main sticky bar content */}
          <div className="px-4 py-3">
            {/* Mobile layout */}
            <div className="flex items-center gap-3 md:hidden">
              {/* Price and stock */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', statusConfig.dotColor)} />
                  <span className="text-xs font-medium text-neutral-500 truncate">
                    {statusConfig.label}
                  </span>
                </div>
                <div className="text-xl font-bold text-neutral-900 tabular-nums">
                  {formatPrice(totalPrice)}
                </div>
              </div>

              {/* Expand toggle */}
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className={cn(
                  'flex items-center justify-center w-10 h-10',
                  'rounded-lg border border-neutral-200 bg-neutral-50',
                  'text-neutral-500 hover:text-neutral-700',
                  'transition-colors duration-200'
                )}
                aria-label={isExpanded ? 'Reduire' : 'Plus d\'options'}
              >
                <ChevronUp className="w-5 h-5" />
              </motion.button>

              {/* Add to cart button */}
              <ActionButtonPremium
                variant="primary"
                size="md"
                state={cartState}
                disabled={!canAddToCart}
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                successContent={<Check className="w-5 h-5" />}
                onClick={handleAddToCart}
                className="flex-shrink-0"
              >
                <span className="sr-only md:not-sr-only">Ajouter</span>
              </ActionButtonPremium>
            </div>

            {/* Desktop layout */}
            <div className="hidden md:flex items-center gap-4">
              {/* Stock status */}
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', statusConfig.dotColor)} />
                <span className="text-sm font-medium text-neutral-600">
                  {statusConfig.label}
                </span>
              </div>

              {/* Quantity selector */}
              <QuantitySelectorPremium
                value={quantity}
                min={minQuantity}
                max={effectiveMaxQuantity}
                step={quantityStep}
                disabled={isOutOfStock}
                size="sm"
                onChange={handleQuantityChange}
              />

              {/* Price */}
              <div className="flex-1 text-right">
                <span className="text-sm text-neutral-500">Total: </span>
                <span className="text-xl font-bold text-neutral-900 tabular-nums">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Request quote */}
              {onRequestQuote && (
                <ActionButtonPremium
                  variant="secondary"
                  size="md"
                  state="idle"
                  leftIcon={<FileText className="w-4 h-4" />}
                  onClick={() => onRequestQuote(quantity)}
                >
                  Devis
                </ActionButtonPremium>
              )}

              {/* Wishlist */}
              {onAddToWishlist && (
                <WishlistButtonPremium
                  isActive={isInWishlist}
                  onClick={onAddToWishlist}
                  size="md"
                />
              )}

              {/* Add to cart */}
              <ActionButtonPremium
                variant="primary"
                size="md"
                state={cartState}
                disabled={!canAddToCart}
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                successContent={
                  <>
                    <Check className="w-5 h-5" />
                    <span>Ajoute</span>
                  </>
                }
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </ActionButtonPremium>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function ProductActionsPremium({
  variant = 'inline',
  showStickyBar = true,
  ...props
}: ProductActionsPremiumProps) {
  if (variant === 'sticky') {
    return <ProductActionsStickyBar showStickyBar={showStickyBar} {...props} />;
  }

  return <ProductActionsInline {...props} />;
}

// Named exports for direct usage
export {
  ProductActionsInline,
  ProductActionsStickyBar,
  QuantitySelectorPremium,
  StockIndicatorPremium,
  ActionButtonPremium,
  WishlistButtonPremium,
};

export default ProductActionsPremium;
