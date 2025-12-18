'use client';

/**
 * ProductVariantSelectorPremium - Luxury B2B Variant Selection Component
 *
 * Premium variant selector for luxury jewelry e-commerce with:
 * - Color swatches with actual colors
 * - Size chips with stock indicators
 * - Material cards with images/icons
 * - Price difference indicators
 * - Stock status per option
 * - Elegant animations and transitions
 *
 * Design inspired by Hermes with orange accent (#f67828)
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  AlertCircle,
  Package,
  Clock,
  Ruler,
  Palette,
  Layers,
  X,
  ChevronRight,
  Loader2,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

// ============================================================================
// Types
// ============================================================================

export type OptionType = 'color' | 'size' | 'material' | 'custom';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'preorder' | 'discontinued';

export interface OptionValue {
  id: string;
  value: string;
  /** Hex code for color swatches */
  colorHex?: string;
  /** Image URL for material cards */
  imageUrl?: string;
  /** Material badge text (e.g., "18K", "925") */
  badge?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface ProductOption {
  id: string;
  title: string;
  type: OptionType;
  values: OptionValue[];
}

export interface ProductVariant {
  id: string;
  sku: string | null;
  title: string;
  optionValues: Record<string, string>;
  priceAmount: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  allowBackorder: boolean;
  images?: string[];
  // Additional fields for B2B compatibility
  ean?: string | null;
  currencyCode?: string;
  weight?: number | null;
  inStock?: boolean;
}

export interface ProductVariantSelectorPremiumProps {
  /** Product options configuration */
  options: ProductOption[];
  /** All available variants */
  variants: ProductVariant[];
  /** Currently selected variant ID */
  selectedVariantId?: string;
  /** Default variant to pre-select */
  defaultVariantId?: string;
  /** Currency code for price display */
  currencyCode?: string;
  /** Callback when variant changes */
  onVariantChange?: (variant: ProductVariant | null, selectedOptions: Record<string, string>) => void;
  /** Callback when valid variant is selected */
  onValidVariantSelected?: (variant: ProductVariant) => void;
  /** Show price differences from base price */
  showPriceDiff?: boolean;
  /** Show stock status per option */
  showStock?: boolean;
  /** Show size guide link for size options */
  showSizeGuide?: boolean;
  /** Size guide click handler */
  onSizeGuideClick?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Compact mode for sidebars/modals */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants & Color Mappings
// ============================================================================

const COLOR_MAP: Record<string, string> = {
  // French color names
  noir: '#000000',
  blanc: '#FFFFFF',
  or: '#FFD700',
  'or jaune': '#FFD700',
  'or rose': '#E8B4A0',
  'or blanc': '#E8E8E8',
  'or gris': '#B8B8B8',
  argent: '#C0C0C0',
  platine: '#E5E5E5',
  rose: '#FFC0CB',
  bleu: '#4169E1',
  rouge: '#DC143C',
  vert: '#228B22',
  beige: '#F5F5DC',
  marron: '#8B4513',
  gris: '#808080',
  jaune: '#FFD700',
  violet: '#8B008B',
  orange: '#FF8C00',
  // English color names
  black: '#000000',
  white: '#FFFFFF',
  gold: '#FFD700',
  'yellow gold': '#FFD700',
  'rose gold': '#E8B4A0',
  'white gold': '#E8E8E8',
  silver: '#C0C0C0',
  platinum: '#E5E5E5',
  pink: '#FFC0CB',
  blue: '#4169E1',
  red: '#DC143C',
  green: '#228B22',
  brown: '#8B4513',
  gray: '#808080',
  grey: '#808080',
  yellow: '#FFD700',
  purple: '#8B008B',
};

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
};

const selectedIndicatorVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 20 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};

const priceVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getColorHex(colorName: string, providedHex?: string): string {
  if (providedHex) return providedHex;
  return COLOR_MAP[colorName.toLowerCase()] || '#E5E5E5';
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7;
}

function formatPriceDiff(diff: number, currencyCode: string): string {
  if (diff === 0) return '';
  const sign = diff > 0 ? '+' : '';
  return `${sign}${formatCurrency(diff / 100, currencyCode)}`;
}

function getStockStatus(variant: ProductVariant): {
  status: StockStatus;
  label: string;
  quantity?: number;
} {
  if (variant.inventoryQuantity > 10) {
    return { status: 'in_stock', label: 'En stock' };
  }
  if (variant.inventoryQuantity > 0) {
    return {
      status: 'low_stock',
      label: `${variant.inventoryQuantity} dispo`,
      quantity: variant.inventoryQuantity,
    };
  }
  if (variant.allowBackorder) {
    return { status: 'backorder', label: 'Sur commande' };
  }
  return { status: 'out_of_stock', label: 'Rupture' };
}

function findVariantByOptions(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>
): ProductVariant | null {
  return (
    variants.find((variant) =>
      Object.entries(selectedOptions).every(
        ([key, value]) => variant.optionValues[key] === value
      )
    ) ?? null
  );
}

function getAvailableOptionValues(
  variants: ProductVariant[],
  currentOptions: Record<string, string>,
  optionTitle: string
): string[] {
  const availableValues = new Set<string>();

  variants.forEach((variant) => {
    // Check if variant matches all other selected options
    const matchesOthers = Object.entries(currentOptions).every(
      ([key, value]) => key === optionTitle || variant.optionValues[key] === value
    );

    if (matchesOthers) {
      const value = variant.optionValues[optionTitle];
      if (value) {
        availableValues.add(value);
      }
    }
  });

  return Array.from(availableValues);
}

function getOptionIcon(type: OptionType) {
  switch (type) {
    case 'size':
      return <Ruler className="w-4 h-4" />;
    case 'color':
      return <Palette className="w-4 h-4" />;
    case 'material':
      return <Layers className="w-4 h-4" />;
    default:
      return null;
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

// -----------------------------------------------------------------------------
// Color Swatch Component
// -----------------------------------------------------------------------------

interface ColorSwatchPremiumProps {
  value: string;
  colorHex?: string;
  isSelected: boolean;
  isAvailable: boolean;
  stockStatus: StockStatus;
  priceDiff?: number;
  currencyCode?: string;
  onClick: () => void;
  compact?: boolean;
}

function ColorSwatchPremium({
  value,
  colorHex,
  isSelected,
  isAvailable,
  stockStatus,
  priceDiff,
  currencyCode = 'EUR',
  onClick,
  compact = false,
}: ColorSwatchPremiumProps) {
  const bgColor = getColorHex(value, colorHex);
  const isLight = isLightColor(bgColor);
  const isOutOfStock = stockStatus === 'out_of_stock' || stockStatus === 'discontinued';
  const isDisabled = !isAvailable || isOutOfStock;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`Couleur: ${value}${isDisabled ? ' (indisponible)' : ''}`}
      aria-pressed={isSelected}
      className={cn(
        'group relative flex flex-col items-center',
        'focus-visible:outline-none'
      )}
    >
      {/* Swatch Circle */}
      <div
        className={cn(
          'relative rounded-full transition-all duration-200 ease-luxe',
          'ring-offset-2 ring-offset-white',
          compact ? 'w-9 h-9' : 'w-11 h-11',
          isSelected
            ? 'ring-[3px] ring-accent scale-100 shadow-elegant'
            : 'ring-2 ring-transparent hover:ring-neutral-300 hover:scale-105 hover:shadow-soft-md',
          isDisabled && 'opacity-40 cursor-not-allowed hover:scale-100 hover:ring-transparent',
          'focus-visible:ring-accent focus-visible:ring-2'
        )}
        style={{ backgroundColor: bgColor }}
      >
        {/* Border for light colors */}
        {isLight && (
          <span className="absolute inset-0 rounded-full border border-neutral-200" />
        )}

        {/* Selected checkmark */}
        <AnimatePresence>
          {isSelected && (
            <motion.span
              variants={selectedIndicatorVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                isLight ? 'text-neutral-900' : 'text-white'
              )}
            >
              <Check className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Out of stock diagonal line */}
        {isOutOfStock && !isSelected && (
          <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
            <span className="w-[150%] h-0.5 bg-danger-500 rotate-45 absolute" />
          </span>
        )}
      </div>

      {/* Color Label */}
      {!compact && (
        <div className="flex flex-col items-center gap-0.5 mt-2">
          <span
            className={cn(
              'text-[11px] font-medium truncate max-w-[60px]',
              isSelected ? 'text-accent' : 'text-neutral-600'
            )}
          >
            {value}
          </span>
          {priceDiff !== undefined && priceDiff !== 0 && isAvailable && (
            <span
              className={cn(
                'text-[10px] font-medium tabular-nums',
                priceDiff > 0 ? 'text-warning-600' : 'text-success-600'
              )}
            >
              {formatPriceDiff(priceDiff, currencyCode)}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// -----------------------------------------------------------------------------
// Size Chip Component
// -----------------------------------------------------------------------------

interface SizeChipPremiumProps {
  value: string;
  isSelected: boolean;
  isAvailable: boolean;
  stockStatus: StockStatus;
  stockQuantity?: number;
  priceDiff?: number;
  currencyCode?: string;
  showStock?: boolean;
  onClick: () => void;
  compact?: boolean;
}

function SizeChipPremium({
  value,
  isSelected,
  isAvailable,
  stockStatus,
  stockQuantity,
  priceDiff,
  currencyCode = 'EUR',
  showStock = true,
  onClick,
  compact = false,
}: SizeChipPremiumProps) {
  const isOutOfStock = stockStatus === 'out_of_stock' || stockStatus === 'discontinued';
  const isDisabled = !isAvailable || isOutOfStock;
  const isLowStock = stockStatus === 'low_stock';
  const isBackorder = stockStatus === 'backorder' || stockStatus === 'preorder';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-lg',
        'border transition-all duration-200 ease-luxe',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        compact ? 'min-w-[52px] px-3 py-2' : 'min-w-[64px] px-4 py-3',
        isSelected
          ? 'border-2 border-accent bg-accent/[0.06]'
          : isLowStock
          ? 'border-[1.5px] border-warning-300 bg-warning-50/50 hover:border-warning-400'
          : 'border-[1.5px] border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50',
        isDisabled && 'border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed'
      )}
    >
      {/* Size Value */}
      <span
        className={cn(
          'font-semibold transition-colors',
          compact ? 'text-sm' : 'text-sm',
          isSelected
            ? 'text-accent'
            : isDisabled
            ? 'text-neutral-300'
            : 'text-neutral-900 group-hover:text-neutral-700'
        )}
      >
        {value}
      </span>

      {/* Stock & Price Info */}
      {showStock && !compact && (
        <div className="flex items-center gap-1 mt-1">
          {/* Stock Status */}
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-wider',
              stockStatus === 'in_stock' && 'text-success-600',
              isLowStock && 'text-warning-600',
              isOutOfStock && 'text-error-500',
              isBackorder && 'text-info-600'
            )}
          >
            {stockStatus === 'in_stock' && 'En stock'}
            {isLowStock && `${stockQuantity} dispo`}
            {isOutOfStock && 'Rupture'}
            {isBackorder && 'Commande'}
          </span>
        </div>
      )}

      {/* Price Diff Badge */}
      {priceDiff !== undefined && priceDiff !== 0 && isAvailable && !compact && (
        <span
          className={cn(
            'mt-1 text-[10px] font-medium tabular-nums',
            priceDiff > 0 ? 'text-warning-600' : 'text-success-600'
          )}
        >
          {formatPriceDiff(priceDiff, currencyCode)}
        </span>
      )}

      {/* Selected Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.span
            variants={selectedIndicatorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-sm"
          >
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Material Card Component
// -----------------------------------------------------------------------------

interface MaterialCardPremiumProps {
  value: string;
  imageUrl?: string;
  badge?: string;
  isSelected: boolean;
  isAvailable: boolean;
  stockStatus: StockStatus;
  stockQuantity?: number;
  priceDiff?: number;
  currencyCode?: string;
  showStock?: boolean;
  onClick: () => void;
  compact?: boolean;
}

function MaterialCardPremium({
  value,
  imageUrl,
  badge,
  isSelected,
  isAvailable,
  stockStatus,
  stockQuantity,
  priceDiff,
  currencyCode = 'EUR',
  showStock = true,
  onClick,
  compact = false,
}: MaterialCardPremiumProps) {
  const isOutOfStock = stockStatus === 'out_of_stock' || stockStatus === 'discontinued';
  const isDisabled = !isAvailable || isOutOfStock;
  const isLowStock = stockStatus === 'low_stock';
  const isBackorder = stockStatus === 'backorder' || stockStatus === 'preorder';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
      className={cn(
        'group relative rounded-xl border transition-all duration-250 ease-luxe cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        compact ? 'flex flex-row items-center p-3 gap-3' : 'flex flex-col p-4 min-w-[140px]',
        isSelected
          ? 'border-2 border-accent bg-accent/[0.04] shadow-elegant'
          : 'border border-neutral-200 bg-white shadow-soft-sm hover:border-neutral-300 hover:shadow-soft-md',
        isDisabled && 'border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed'
      )}
    >
      {/* Material Image/Icon */}
      <div
        className={cn(
          'relative rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center',
          compact ? 'w-14 h-14 flex-shrink-0' : 'w-full aspect-square mb-3'
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={value}
            fill
            sizes={compact ? '56px' : '140px'}
            className="object-cover"
          />
        ) : (
          <Layers className={cn('text-neutral-400', compact ? 'w-6 h-6' : 'w-10 h-10')} />
        )}

        {/* Badge (18K, 925, etc.) */}
        {badge && (
          <span
            className={cn(
              'absolute bg-white/90 backdrop-blur-sm rounded shadow-sm',
              'text-[10px] font-semibold text-neutral-700',
              compact ? 'top-1 left-1 px-1 py-0.5' : 'top-2 left-2 px-2 py-0.5'
            )}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Material Info */}
      <div className={cn('flex flex-col', compact ? 'flex-1 min-w-0' : 'items-start')}>
        {/* Name */}
        <span
          className={cn(
            'font-semibold transition-colors',
            compact ? 'text-sm truncate' : 'text-sm mb-1',
            isSelected
              ? 'text-accent'
              : isDisabled
              ? 'text-neutral-300'
              : 'text-neutral-900 group-hover:text-neutral-700'
          )}
        >
          {value}
        </span>

        {/* Price Diff */}
        {priceDiff !== undefined && (
          <span
            className={cn(
              'text-xs font-medium tabular-nums',
              compact ? '' : 'mb-2',
              priceDiff > 0
                ? 'text-warning-600'
                : priceDiff < 0
                ? 'text-success-600'
                : 'text-neutral-500'
            )}
          >
            {priceDiff === 0
              ? 'Prix de base'
              : formatPriceDiff(priceDiff, currencyCode)}
          </span>
        )}

        {/* Stock Status */}
        {showStock && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                stockStatus === 'in_stock' && 'bg-success-500',
                isLowStock && 'bg-warning-500',
                isOutOfStock && 'bg-error-500',
                isBackorder && 'bg-info-500'
              )}
            />
            <span
              className={cn(
                stockStatus === 'in_stock' && 'text-success-600',
                isLowStock && 'text-warning-600',
                isOutOfStock && 'text-error-600',
                isBackorder && 'text-info-600'
              )}
            >
              {stockStatus === 'in_stock' && 'En stock'}
              {isLowStock && `${stockQuantity} disponibles`}
              {isOutOfStock && 'Indisponible'}
              {isBackorder && 'Sur commande'}
            </span>
          </div>
        )}
      </div>

      {/* Selected Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.span
            variants={selectedIndicatorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'absolute bg-accent rounded-full flex items-center justify-center shadow-md',
              compact ? 'top-1 right-1 w-5 h-5' : 'top-2 right-2 w-6 h-6'
            )}
          >
            <Check className={cn('text-white', compact ? 'w-3 h-3' : 'w-4 h-4')} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Stock Display Component
// -----------------------------------------------------------------------------

interface StockDisplayProps {
  variant: ProductVariant;
}

function StockDisplay({ variant }: StockDisplayProps) {
  const { status, label, quantity } = getStockStatus(variant);

  const statusConfig = {
    in_stock: { icon: Check, bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-700', dot: 'bg-success-500' },
    low_stock: { icon: AlertCircle, bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-700', dot: 'bg-warning-500' },
    out_of_stock: { icon: X, bg: 'bg-error-50', border: 'border-error-200', text: 'text-error-700', dot: 'bg-error-500' },
    backorder: { icon: Clock, bg: 'bg-info-50', border: 'border-info-200', text: 'text-info-700', dot: 'bg-info-500' },
    preorder: { icon: Clock, bg: 'bg-info-50', border: 'border-info-200', text: 'text-info-700', dot: 'bg-info-500' },
    discontinued: { icon: X, bg: 'bg-error-50', border: 'border-error-200', text: 'text-error-700', dot: 'bg-error-500' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        config.bg,
        config.border
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', config.dot)} />
      <span className={cn('text-xs font-medium', config.text)}>{label}</span>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductVariantSelectorPremium({
  options,
  variants,
  selectedVariantId,
  defaultVariantId,
  currencyCode = 'EUR',
  onVariantChange,
  onValidVariantSelected,
  showPriceDiff = true,
  showStock = true,
  showSizeGuide = true,
  onSizeGuideClick,
  isLoading = false,
  compact = false,
  className,
}: ProductVariantSelectorPremiumProps) {
  // Initialize selection from default/selected variant
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const variantId = selectedVariantId || defaultVariantId;
    if (variantId) {
      const variant = variants.find((v) => v.id === variantId);
      if (variant) return { ...variant.optionValues };
    }
    // Try first variant as fallback
    if (variants.length > 0) {
      return { ...variants[0].optionValues };
    }
    return {};
  });

  // Compute current state
  const selectionState = useMemo(() => {
    const selectedVariant = findVariantByOptions(variants, selectedOptions);
    const isComplete = options.length > 0 && options.every((opt) => selectedOptions[opt.title]);

    const availableValues: Record<string, string[]> = {};
    options.forEach((option) => {
      availableValues[option.title] = getAvailableOptionValues(
        variants,
        selectedOptions,
        option.title
      );
    });

    return { selectedOptions, selectedVariant, isComplete, availableValues };
  }, [selectedOptions, variants, options]);

  // Base price for calculating differences
  const basePrice = useMemo(() => {
    const defaultVar = defaultVariantId
      ? variants.find((v) => v.id === defaultVariantId)
      : variants[0];
    return defaultVar?.priceAmount ?? 0;
  }, [variants, defaultVariantId]);

  // Handle option selection
  const handleOptionSelect = useCallback((optionTitle: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionTitle]: value,
    }));
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onVariantChange?.(selectionState.selectedVariant, selectionState.selectedOptions);

    if (selectionState.selectedVariant && selectionState.isComplete) {
      onValidVariantSelected?.(selectionState.selectedVariant);
    }
  }, [selectionState, onVariantChange, onValidVariantSelected]);

  // Don't render if no options or single variant
  if (options.length === 0 || variants.length <= 1) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span className="ml-2 text-sm text-neutral-500">Chargement des options...</span>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-6', compact && 'space-y-4', className)}
    >
      {options.map((option) => {
        const availableValues = selectionState.availableValues[option.title] || [];
        const selectedValue = selectedOptions[option.title];

        // Find option value config
        const getOptionValueConfig = (value: string) =>
          option.values.find((v) => v.value === value);

        return (
          <motion.div
            key={option.id}
            variants={itemVariants}
            className={cn('space-y-3', compact && 'space-y-2')}
          >
            {/* Option Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">{getOptionIcon(option.type)}</span>
                <span
                  className={cn(
                    'font-semibold uppercase tracking-wider',
                    compact ? 'text-[11px]' : 'text-[13px]',
                    'text-neutral-700'
                  )}
                >
                  {option.title}
                </span>
                {selectedValue && (
                  <span className="text-sm text-accent font-medium">: {selectedValue}</span>
                )}
              </div>

              {/* Size Guide Link */}
              {option.type === 'size' && showSizeGuide && onSizeGuideClick && (
                <button
                  type="button"
                  onClick={onSizeGuideClick}
                  className={cn(
                    'flex items-center gap-1 text-sm text-accent',
                    'hover:text-accent/80 transition-colors',
                    'underline underline-offset-2'
                  )}
                >
                  Guide des tailles
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Option Values */}
            <div
              role="radiogroup"
              aria-label={option.title}
              className={cn(
                // Color swatches: horizontal scroll on mobile
                option.type === 'color' &&
                  'flex gap-3 md:gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap snap-x snap-mandatory scrollbar-none',
                // Size chips: grid on mobile, flex wrap on desktop
                option.type === 'size' &&
                  (compact
                    ? 'flex flex-wrap gap-2'
                    : 'grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2'),
                // Material cards: stack on mobile, grid on desktop
                option.type === 'material' &&
                  (compact
                    ? 'flex flex-col gap-2'
                    : 'flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3'),
                // Custom: flexible wrap
                option.type === 'custom' && 'flex flex-wrap gap-2'
              )}
            >
              {option.values.map((optionValue) => {
                const isSelected = selectedValue === optionValue.value;
                const isAvailable = availableValues.includes(optionValue.value);

                // Calculate price difference
                let priceDiff: number | undefined;
                if (showPriceDiff && isAvailable) {
                  const testSelection = {
                    ...selectedOptions,
                    [option.title]: optionValue.value,
                  };
                  const testVariant = findVariantByOptions(variants, testSelection);
                  if (testVariant) {
                    priceDiff = testVariant.priceAmount - basePrice;
                  }
                }

                // Get stock status for this option value
                const testSelection = {
                  ...selectedOptions,
                  [option.title]: optionValue.value,
                };
                const testVariant = findVariantByOptions(variants, testSelection);
                const stockInfo = testVariant
                  ? getStockStatus(testVariant)
                  : { status: 'out_of_stock' as StockStatus, label: 'Rupture' };

                // Render based on option type
                if (option.type === 'color') {
                  return (
                    <div key={optionValue.id} className="snap-center flex-shrink-0">
                      <ColorSwatchPremium
                        value={optionValue.value}
                        colorHex={optionValue.colorHex}
                        isSelected={isSelected}
                        isAvailable={isAvailable}
                        stockStatus={stockInfo.status}
                        priceDiff={priceDiff}
                        currencyCode={currencyCode}
                        onClick={() => handleOptionSelect(option.title, optionValue.value)}
                        compact={compact}
                      />
                    </div>
                  );
                }

                if (option.type === 'material') {
                  return (
                    <MaterialCardPremium
                      key={optionValue.id}
                      value={optionValue.value}
                      imageUrl={optionValue.imageUrl}
                      badge={optionValue.badge}
                      isSelected={isSelected}
                      isAvailable={isAvailable}
                      stockStatus={stockInfo.status}
                      stockQuantity={stockInfo.quantity}
                      priceDiff={priceDiff}
                      currencyCode={currencyCode}
                      showStock={showStock}
                      onClick={() => handleOptionSelect(option.title, optionValue.value)}
                      compact={compact}
                    />
                  );
                }

                // Default to size chips for size and custom types
                return (
                  <SizeChipPremium
                    key={optionValue.id}
                    value={optionValue.value}
                    isSelected={isSelected}
                    isAvailable={isAvailable}
                    stockStatus={stockInfo.status}
                    stockQuantity={stockInfo.quantity}
                    priceDiff={priceDiff}
                    currencyCode={currencyCode}
                    showStock={showStock}
                    onClick={() => handleOptionSelect(option.title, optionValue.value)}
                    compact={compact}
                  />
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* Selected Variant Summary */}
      <AnimatePresence mode="wait">
        {selectionState.selectedVariant && selectionState.isComplete && (
          <motion.div
            key={selectionState.selectedVariant.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'pt-5 border-t border-neutral-200 space-y-4',
              compact && 'pt-3 space-y-2'
            )}
          >
            {/* Variant Info Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Variant Thumbnail */}
                {selectionState.selectedVariant.images?.[0] && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100">
                    <Image
                      src={selectionState.selectedVariant.images[0]}
                      alt={selectionState.selectedVariant.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  {/* SKU */}
                  {selectionState.selectedVariant.sku && (
                    <div className="text-xs text-neutral-500 font-mono">
                      Ref: {selectionState.selectedVariant.sku}
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Badge */}
              {showStock && <StockDisplay variant={selectionState.selectedVariant} />}
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Prix unitaire</span>
              <div className="text-right">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectionState.selectedVariant.id}
                    variants={priceVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="text-xl font-bold text-neutral-900"
                  >
                    {formatCurrency(selectionState.selectedVariant.priceAmount / 100, currencyCode)}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm font-normal text-neutral-500 ml-1">HT</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incomplete Selection Warning */}
      {!selectionState.isComplete && options.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-lg',
            'bg-accent/5 border border-accent/20'
          )}
        >
          <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-700">
            Veuillez selectionner{' '}
            {options
              .filter((o) => !selectedOptions[o.title])
              .map((o) => o.title.toLowerCase())
              .join(' et ')}{' '}
            pour voir le prix et la disponibilite.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ProductVariantSelectorPremium;
