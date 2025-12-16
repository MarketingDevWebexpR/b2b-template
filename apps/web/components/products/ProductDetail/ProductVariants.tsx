'use client';

/**
 * ProductVariants - B2B Product Variant Selection Component
 *
 * Features:
 * - Size, color, material variant selection
 * - Stock availability per variant
 * - Price differentiation per variant
 * - Variant-specific images
 * - Out-of-stock variant handling
 * - Visual color swatches
 * - Size guide link
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  AlertCircle,
  Package,
  Ruler,
  Palette,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { StockStatus } from '@maison/types';

// ============================================================================
// Types
// ============================================================================

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  /** Variant attributes */
  attributes: {
    size?: string;
    color?: string;
    material?: string;
    [key: string]: string | undefined;
  };
  /** Price in cents or base unit */
  price: number;
  /** Compare at price for promotions */
  compareAtPrice?: number;
  /** Stock status */
  stockStatus: StockStatus;
  /** Available quantity */
  stockQuantity: number;
  /** Variant-specific images */
  images?: string[];
  /** Color hex code for swatch display */
  colorHex?: string;
  /** Is this the default variant */
  isDefault?: boolean;
}

export interface VariantAttribute {
  name: string;
  label: string;
  type: 'size' | 'color' | 'material' | 'custom';
  values: string[];
}

export interface ProductVariantsProps {
  /** Available variants */
  variants: ProductVariant[];
  /** Variant attributes configuration */
  attributes: VariantAttribute[];
  /** Currently selected variant ID */
  selectedVariantId?: string;
  /** Callback when variant is selected */
  onVariantSelect: (variant: ProductVariant) => void;
  /** Show stock info for each variant */
  showStock?: boolean;
  /** Show price for each variant */
  showPrice?: boolean;
  /** Show size guide link */
  showSizeGuide?: boolean;
  /** Callback when size guide is clicked */
  onSizeGuideClick?: () => void;
  /** Format price function */
  formatPrice?: (price: number) => string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return 'En stock';
    case 'low_stock':
      return 'Stock limite';
    case 'out_of_stock':
      return 'Rupture';
    case 'backorder':
      return 'Sur commande';
    case 'preorder':
      return 'Precommande';
    case 'discontinued':
      return 'Arrete';
    default:
      return 'Non disponible';
  }
}

function getStockStatusVariant(status: StockStatus): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'in_stock':
      return 'success';
    case 'low_stock':
      return 'warning';
    case 'out_of_stock':
    case 'discontinued':
      return 'error';
    case 'backorder':
    case 'preorder':
      return 'info';
    default:
      return 'error';
  }
}

function getAttributeIcon(type: VariantAttribute['type']) {
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
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// ============================================================================
// Sub-Components
// ============================================================================

interface ColorSwatchProps {
  color: string;
  colorHex?: string;
  isSelected: boolean;
  isDisabled: boolean;
  stockStatus: StockStatus;
  onClick: () => void;
}

function ColorSwatch({
  color,
  colorHex,
  isSelected,
  isDisabled,
  stockStatus,
  onClick,
}: ColorSwatchProps) {
  // Common color mappings
  const colorMap: Record<string, string> = {
    noir: '#000000',
    blanc: '#FFFFFF',
    or: '#FFD700',
    argent: '#C0C0C0',
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
  };

  const bgColor = colorHex || colorMap[color.toLowerCase()] || '#E5E5E5';
  const isLight = bgColor.toLowerCase() === '#ffffff' || bgColor.toLowerCase() === '#f5f5dc';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'relative w-10 h-10 rounded-full transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
        isSelected && 'ring-2 ring-accent ring-offset-2',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
      style={{ backgroundColor: bgColor }}
      title={color}
      aria-label={`Couleur: ${color}${isDisabled ? ' (indisponible)' : ''}`}
      aria-pressed={isSelected}
    >
      {/* Border for light colors */}
      {isLight && (
        <span className="absolute inset-0 rounded-full border border-neutral-200" />
      )}

      {/* Selected checkmark */}
      {isSelected && (
        <span className={cn(
          'absolute inset-0 flex items-center justify-center',
          isLight ? 'text-neutral-900' : 'text-white'
        )}>
          <Check className="w-5 h-5" />
        </span>
      )}

      {/* Out of stock indicator */}
      {stockStatus === 'out_of_stock' && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-full h-0.5 bg-red-500 rotate-45" />
        </span>
      )}
    </button>
  );
}

interface VariantButtonProps {
  value: string;
  isSelected: boolean;
  isDisabled: boolean;
  stockStatus: StockStatus;
  stockQuantity?: number;
  price?: number;
  formatPrice?: (price: number) => string;
  showStock?: boolean;
  showPrice?: boolean;
  onClick: () => void;
}

function VariantButton({
  value,
  isSelected,
  isDisabled,
  stockStatus,
  stockQuantity,
  price,
  formatPrice,
  showStock,
  showPrice,
  onClick,
}: VariantButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'relative px-4 py-3 rounded-lg border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        isSelected
          ? 'border-accent bg-accent/5 ring-1 ring-accent'
          : 'border-neutral-200 hover:border-accent/50',
        isDisabled && 'opacity-50 cursor-not-allowed bg-neutral-100',
        stockStatus === 'out_of_stock' && 'line-through decoration-red-500'
      )}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
    >
      <div className="flex flex-col items-start gap-1">
        {/* Value */}
        <span className={cn(
          'font-medium',
          isSelected ? 'text-accent' : 'text-neutral-900'
        )}>
          {value}
        </span>

        {/* Stock & Price Info */}
        <div className="flex items-center gap-2 text-xs">
          {showStock && (
            <span className={cn(
              'flex items-center gap-1',
              stockStatus === 'in_stock' && 'text-green-600',
              stockStatus === 'low_stock' && 'text-amber-600',
              stockStatus === 'out_of_stock' && 'text-red-600'
            )}>
              {stockStatus === 'in_stock' && <Package className="w-3 h-3" />}
              {stockStatus === 'low_stock' && <AlertCircle className="w-3 h-3" />}
              {stockQuantity !== undefined && stockQuantity > 0 && (
                <span>{stockQuantity} dispo</span>
              )}
              {stockStatus === 'out_of_stock' && <span>Rupture</span>}
            </span>
          )}

          {showPrice && price !== undefined && formatPrice && (
            <span className="text-neutral-500">
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <span className="absolute top-1 right-1">
          <Check className="w-4 h-4 text-accent" />
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductVariants({
  variants,
  attributes,
  selectedVariantId,
  onVariantSelect,
  showStock = true,
  showPrice = false,
  showSizeGuide = true,
  onSizeGuideClick,
  formatPrice,
  className,
}: ProductVariantsProps) {
  // Track selected attribute values
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    // Initialize from selected variant or default variant
    const selectedVariant = selectedVariantId
      ? variants.find((v) => v.id === selectedVariantId)
      : variants.find((v) => v.isDefault) || variants[0];

    // Filter out undefined values from attributes
    const attrs = selectedVariant?.attributes || {};
    return Object.fromEntries(
      Object.entries(attrs).filter((entry): entry is [string, string] => entry[1] !== undefined)
    );
  });

  // Find variant matching selected attributes
  const selectedVariant = useMemo(() => {
    return variants.find((variant) =>
      Object.entries(selectedAttributes).every(
        ([key, value]) => variant.attributes[key] === value
      )
    );
  }, [variants, selectedAttributes]);

  // Get available values for an attribute based on current selections
  const getAvailableValues = useCallback(
    (attributeName: string): Map<string, ProductVariant> => {
      const valueMap = new Map<string, ProductVariant>();

      variants.forEach((variant) => {
        const value = variant.attributes[attributeName];
        if (!value) return;

        // Check if this variant matches other selected attributes
        const matchesOtherAttributes = Object.entries(selectedAttributes).every(
          ([key, selectedValue]) =>
            key === attributeName || variant.attributes[key] === selectedValue
        );

        if (matchesOtherAttributes && !valueMap.has(value)) {
          valueMap.set(value, variant);
        }
      });

      return valueMap;
    },
    [variants, selectedAttributes]
  );

  // Handle attribute selection
  const handleAttributeSelect = useCallback(
    (attributeName: string, value: string) => {
      const newAttributes = { ...selectedAttributes, [attributeName]: value };
      setSelectedAttributes(newAttributes);

      // Find matching variant and notify parent
      const matchingVariant = variants.find((variant) =>
        Object.entries(newAttributes).every(
          ([key, val]) => variant.attributes[key] === val
        )
      );

      if (matchingVariant) {
        onVariantSelect(matchingVariant);
      }
    },
    [selectedAttributes, variants, onVariantSelect]
  );

  return (
    <div className={cn('space-y-6', className)}>
      {attributes.map((attribute) => {
        const availableValues = getAvailableValues(attribute.name);
        const selectedValue = selectedAttributes[attribute.name];

        return (
          <div key={attribute.name}>
            {/* Attribute Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getAttributeIcon(attribute.type)}
                <span className="text-sm font-medium text-neutral-900">
                  {attribute.label}
                </span>
                {selectedValue && (
                  <span className="text-sm text-neutral-600">
                    : <span className="font-medium">{selectedValue}</span>
                  </span>
                )}
              </div>

              {/* Size Guide Link */}
              {attribute.type === 'size' && showSizeGuide && onSizeGuideClick && (
                <button
                  type="button"
                  onClick={onSizeGuideClick}
                  className={cn(
                    'text-sm text-accent hover:text-accent/90',
                    'underline underline-offset-2 transition-colors'
                  )}
                >
                  Guide des tailles
                </button>
              )}
            </div>

            {/* Attribute Options */}
            <motion.div
              className={cn(
                'flex flex-wrap gap-2',
                attribute.type === 'color' && 'gap-3'
              )}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {attribute.values.map((value) => {
                const variant = availableValues.get(value);
                const isSelected = selectedValue === value;
                const isAvailable = !!variant;
                const stockStatus = variant?.stockStatus || 'out_of_stock';
                const isDisabled = !isAvailable || stockStatus === 'discontinued';

                if (attribute.type === 'color') {
                  return (
                    <motion.div key={value} variants={itemVariants}>
                      <ColorSwatch
                        color={value}
                        colorHex={variant?.colorHex}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        stockStatus={stockStatus}
                        onClick={() => handleAttributeSelect(attribute.name, value)}
                      />
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={value} variants={itemVariants}>
                    <VariantButton
                      value={value}
                      isSelected={isSelected}
                      isDisabled={isDisabled}
                      stockStatus={stockStatus}
                      stockQuantity={variant?.stockQuantity}
                      price={variant?.price}
                      formatPrice={formatPrice}
                      showStock={showStock}
                      showPrice={showPrice && variant?.price !== variants[0]?.price}
                      onClick={() => handleAttributeSelect(attribute.name, value)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        );
      })}

      {/* Selected Variant Summary */}
      {selectedVariant && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedVariant.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              'bg-neutral-100 border border-neutral-200'
            )}
          >
            <div className="flex items-center gap-3">
              {/* Variant Image Thumbnail */}
              {selectedVariant.images?.[0] && (
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white">
                  <Image
                    src={selectedVariant.images[0]}
                    alt={selectedVariant.name}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-neutral-900">
                  {selectedVariant.name}
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  SKU: {selectedVariant.sku}
                </div>
              </div>
            </div>

            <Badge
              variant={getStockStatusVariant(selectedVariant.stockStatus)}
              size="sm"
            >
              {getStockStatusLabel(selectedVariant.stockStatus)}
            </Badge>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default ProductVariants;
