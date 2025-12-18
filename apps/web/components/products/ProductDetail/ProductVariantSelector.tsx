'use client';

/**
 * ProductVariantSelector - B2B Variant Selection Component
 *
 * Handles product variant selection via:
 * - Dropdowns for options with many values (>5)
 * - Text buttons for options with few values (<=5)
 * - Price/stock updates based on selection
 * - Image switching when variant has specific images
 *
 * Scalable design per user requirements: no color swatches,
 * use dropdowns/text buttons for all option types.
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
  Package,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import type {
  ProductOption,
  B2BProductVariant,
  VariantSelectionState,
} from '@/types/product-b2b';
import {
  findVariantByOptions,
  getAvailableOptionValues,
} from '@/lib/medusa/adapters';

// ============================================================================
// Types
// ============================================================================

export interface ProductVariantSelectorProps {
  /** Product options (e.g., "Carat", "Longueur", "Taille") */
  options: ProductOption[];
  /** All variants for this product */
  variants: B2BProductVariant[];
  /** Default variant to pre-select */
  defaultVariant?: B2BProductVariant | null;
  /** Currency code for price display */
  currencyCode?: string;
  /** Callback when variant selection changes */
  onVariantChange?: (variant: B2BProductVariant | null, selectedOptions: Record<string, string>) => void;
  /** Callback when complete selection leads to valid variant */
  onValidVariantSelected?: (variant: B2BProductVariant) => void;
  /** Loading state while fetching data */
  isLoading?: boolean;
  /** Show price difference from default */
  showPriceDiff?: boolean;
  /** Show stock information */
  showStock?: boolean;
  /** Max values before switching to dropdown */
  dropdownThreshold?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DROPDOWN_THRESHOLD = 5; // Switch to dropdown if more than 5 values

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format price difference display
 */
function formatPriceDiff(diff: number, currencyCode: string): string {
  if (diff === 0) return '';
  const sign = diff > 0 ? '+' : '';
  return `${sign}${formatCurrency(diff / 100, currencyCode)}`;
}

/**
 * Get stock status text and color
 */
function getStockStatus(variant: B2BProductVariant): { text: string; color: string; icon: React.ReactNode } {
  if (variant.inventoryQuantity > 10) {
    return {
      text: 'En stock',
      color: 'text-green-600',
      icon: <Check className="w-4 h-4" />,
    };
  }
  if (variant.inventoryQuantity > 0) {
    return {
      text: `${variant.inventoryQuantity} en stock`,
      color: 'text-amber-600',
      icon: <AlertCircle className="w-4 h-4" />,
    };
  }
  if (variant.allowBackorder) {
    return {
      text: 'Sur commande',
      color: 'text-blue-600',
      icon: <Clock className="w-4 h-4" />,
    };
  }
  return {
    text: 'Rupture',
    color: 'text-red-600',
    icon: <Package className="w-4 h-4" />,
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

interface OptionButtonProps {
  value: string;
  isSelected: boolean;
  isAvailable: boolean;
  onClick: () => void;
  priceDiff?: number;
  currencyCode?: string;
}

function OptionButton({
  value,
  isSelected,
  isAvailable,
  onClick,
  priceDiff,
  currencyCode = 'EUR',
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      className={cn(
        'relative px-4 py-2.5 rounded-lg text-sm font-medium',
        'border-2 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        isSelected
          ? 'border-accent bg-accent/5 text-accent'
          : isAvailable
          ? 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
          : 'border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed'
      )}
    >
      <span>{value}</span>
      {priceDiff !== undefined && priceDiff !== 0 && isAvailable && (
        <span className={cn(
          'ml-1.5 text-xs',
          priceDiff > 0 ? 'text-amber-600' : 'text-green-600'
        )}>
          {formatPriceDiff(priceDiff, currencyCode)}
        </span>
      )}
      {isSelected && (
        <motion.div
          layoutId="option-selected"
          className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center"
        >
          <Check className="w-2.5 h-2.5 text-white" />
        </motion.div>
      )}
    </button>
  );
}

interface OptionDropdownProps {
  option: ProductOption;
  selectedValue: string | undefined;
  availableValues: string[];
  onSelect: (value: string) => void;
  variants: B2BProductVariant[];
  basePrice?: number;
  currencyCode?: string;
  showPriceDiff?: boolean;
}

function OptionDropdown({
  option,
  selectedValue,
  availableValues,
  onSelect,
  variants,
  basePrice,
  currencyCode = 'EUR',
  showPriceDiff,
}: OptionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'px-4 py-3 rounded-lg text-sm',
          'border-2 transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          selectedValue
            ? 'border-accent bg-accent/5'
            : 'border-neutral-200 bg-white hover:border-neutral-300'
        )}
      >
        <span className={cn(
          'font-medium',
          selectedValue ? 'text-accent' : 'text-neutral-500'
        )}>
          {selectedValue || `Selectionnez ${option.title.toLowerCase()}`}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-neutral-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-20 w-full mt-2',
                'bg-white rounded-lg shadow-lg border border-neutral-200',
                'max-h-64 overflow-y-auto'
              )}
            >
              {option.values.map((optionValue) => {
                const isSelected = selectedValue === optionValue.value;
                const isAvailable = availableValues.includes(optionValue.value);

                return (
                  <button
                    key={optionValue.id}
                    type="button"
                    onClick={() => {
                      if (isAvailable) {
                        onSelect(optionValue.value);
                        setIsOpen(false);
                      }
                    }}
                    disabled={!isAvailable}
                    className={cn(
                      'w-full flex items-center justify-between gap-2',
                      'px-4 py-3 text-sm text-left',
                      'transition-colors duration-150',
                      isSelected
                        ? 'bg-accent/10 text-accent'
                        : isAvailable
                        ? 'hover:bg-neutral-50 text-neutral-700'
                        : 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
                    )}
                  >
                    <span className="font-medium">{optionValue.value}</span>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Check className="w-4 h-4 text-accent" />
                      )}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StockDisplayProps {
  variant: B2BProductVariant;
}

function StockDisplay({ variant }: StockDisplayProps) {
  const status = getStockStatus(variant);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-2',
        'px-3 py-2 rounded-lg bg-neutral-50',
        status.color
      )}
    >
      {status.icon}
      <span className="text-sm font-medium">{status.text}</span>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductVariantSelector({
  options,
  variants,
  defaultVariant = null,
  currencyCode = 'EUR',
  onVariantChange,
  onValidVariantSelected,
  isLoading = false,
  showPriceDiff = true,
  showStock = true,
  dropdownThreshold = DROPDOWN_THRESHOLD,
  className,
}: ProductVariantSelectorProps) {
  // Initialize selection from default variant
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (defaultVariant) {
      return { ...defaultVariant.optionValues };
    }
    return {};
  });

  // Compute current state
  const selectionState = useMemo((): VariantSelectionState => {
    const selectedVariant = findVariantByOptions(variants, selectedOptions);
    const isComplete = options.length > 0 && options.every((opt) => selectedOptions[opt.title]);

    const availableValues: Record<string, string[]> = {};
    options.forEach((option) => {
      availableValues[option.title] = getAvailableOptionValues(
        variants,
        options,
        selectedOptions,
        option.title
      );
    });

    return {
      selectedOptions,
      selectedVariant,
      isComplete,
      availableValues,
    };
  }, [selectedOptions, variants, options]);

  // Base price for calculating differences
  const basePrice = defaultVariant?.priceAmount ?? variants[0]?.priceAmount ?? 0;

  // Handle option selection
  const handleOptionSelect = useCallback(
    (optionTitle: string, value: string) => {
      setSelectedOptions((prev) => ({
        ...prev,
        [optionTitle]: value,
      }));
    },
    []
  );

  // Notify parent of changes
  useEffect(() => {
    onVariantChange?.(selectionState.selectedVariant, selectionState.selectedOptions);

    if (selectionState.selectedVariant && selectionState.isComplete) {
      onValidVariantSelected?.(selectionState.selectedVariant);
    }
  }, [selectionState, onVariantChange, onValidVariantSelected]);

  // Don't render if no options
  if (options.length === 0 || variants.length <= 1) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span className="ml-2 text-sm text-neutral-500">
          Chargement des options...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-6', className)}
    >
      {/* Options */}
      {options.map((option) => {
        const useDropdown = option.values.length > dropdownThreshold;
        const availableValues = selectionState.availableValues[option.title] || [];
        const selectedValue = selectedOptions[option.title];

        return (
          <motion.div key={option.id} variants={itemVariants} className="space-y-3">
            {/* Option Title */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-neutral-900">
                {option.title}
              </h4>
              {selectedValue && (
                <span className="text-sm text-accent font-medium">
                  {selectedValue}
                </span>
              )}
            </div>

            {/* Option Values */}
            {useDropdown ? (
              <OptionDropdown
                option={option}
                selectedValue={selectedValue}
                availableValues={availableValues}
                onSelect={(value) => handleOptionSelect(option.title, value)}
                variants={variants}
                basePrice={basePrice}
                currencyCode={currencyCode}
                showPriceDiff={showPriceDiff}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {option.values.map((optionValue) => {
                  const isSelected = selectedValue === optionValue.value;
                  const isAvailable = availableValues.includes(optionValue.value);

                  // Calculate price difference for this option value
                  let priceDiff: number | undefined;
                  if (showPriceDiff && isAvailable) {
                    const testSelection = { ...selectedOptions, [option.title]: optionValue.value };
                    const testVariant = findVariantByOptions(variants, testSelection);
                    if (testVariant) {
                      priceDiff = testVariant.priceAmount - basePrice;
                    }
                  }

                  return (
                    <OptionButton
                      key={optionValue.id}
                      value={optionValue.value}
                      isSelected={isSelected}
                      isAvailable={isAvailable}
                      onClick={() => handleOptionSelect(option.title, optionValue.value)}
                      priceDiff={priceDiff}
                      currencyCode={currencyCode}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Selected Variant Info */}
      <AnimatePresence>
        {selectionState.selectedVariant && selectionState.isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pt-4 border-t border-neutral-200 space-y-3"
          >
            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Prix unitaire</span>
              <span className="text-lg font-bold text-neutral-900">
                {formatCurrency(selectionState.selectedVariant.priceAmount / 100, currencyCode)}
                <span className="text-sm font-normal text-neutral-500 ml-1">HT</span>
              </span>
            </div>

            {/* Stock Status */}
            {showStock && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Disponibilite</span>
                <StockDisplay variant={selectionState.selectedVariant} />
              </div>
            )}

            {/* SKU */}
            {selectionState.selectedVariant.sku && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">SKU</span>
                <span className="font-mono text-neutral-600">
                  {selectionState.selectedVariant.sku}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incomplete Selection Warning */}
      {!selectionState.isComplete && options.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-lg border border-amber-200"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Veuillez selectionner {options.filter((o) => !selectedOptions[o.title]).map((o) => o.title.toLowerCase()).join(' et ')} pour voir le prix et la disponibilite.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ProductVariantSelector;
