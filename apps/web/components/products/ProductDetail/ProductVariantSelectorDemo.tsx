'use client';

/**
 * ProductVariantSelectorDemo - Demo component showcasing all variant selector states
 *
 * This component demonstrates:
 * - Color swatches with various states
 * - Size chips with stock indicators
 * - Material cards with images
 * - Price differences
 * - Mobile responsive behavior
 *
 * @packageDocumentation
 */

import { useState } from 'react';
import { ProductVariantSelectorPremium } from './ProductVariantSelectorPremium';
import type {
  ProductOption,
  ProductVariant,
  OptionType,
} from './ProductVariantSelectorPremium';

// ============================================================================
// Demo Data
// ============================================================================

const demoOptions: ProductOption[] = [
  {
    id: 'opt-color',
    title: 'Couleur',
    type: 'color',
    values: [
      { id: 'color-1', value: 'Or Jaune', colorHex: '#FFD700' },
      { id: 'color-2', value: 'Or Rose', colorHex: '#E8B4A0' },
      { id: 'color-3', value: 'Or Blanc', colorHex: '#E8E8E8' },
      { id: 'color-4', value: 'Platine', colorHex: '#E5E5E5' },
      { id: 'color-5', value: 'Argent', colorHex: '#C0C0C0' },
    ],
  },
  {
    id: 'opt-size',
    title: 'Taille',
    type: 'size',
    values: [
      { id: 'size-1', value: '50' },
      { id: 'size-2', value: '52' },
      { id: 'size-3', value: '54' },
      { id: 'size-4', value: '56' },
      { id: 'size-5', value: '58' },
      { id: 'size-6', value: '60' },
    ],
  },
  {
    id: 'opt-material',
    title: 'Materiau',
    type: 'material',
    values: [
      {
        id: 'mat-1',
        value: 'Or 18 carats',
        badge: '18K',
        imageUrl: '/images/materials/gold-18k.jpg',
      },
      {
        id: 'mat-2',
        value: 'Or 14 carats',
        badge: '14K',
        imageUrl: '/images/materials/gold-14k.jpg',
      },
      {
        id: 'mat-3',
        value: 'Argent 925',
        badge: '925',
        imageUrl: '/images/materials/silver-925.jpg',
      },
      {
        id: 'mat-4',
        value: 'Platine 950',
        badge: 'PT950',
        imageUrl: '/images/materials/platinum.jpg',
      },
    ],
  },
];

// Generate demo variants with various stock and price states
function generateDemoVariants(): ProductVariant[] {
  const variants: ProductVariant[] = [];
  let variantIndex = 0;

  const colors = ['Or Jaune', 'Or Rose', 'Or Blanc', 'Platine', 'Argent'];
  const sizes = ['50', '52', '54', '56', '58', '60'];
  const materials = ['Or 18 carats', 'Or 14 carats', 'Argent 925', 'Platine 950'];

  const materialPrices: Record<string, number> = {
    'Or 18 carats': 0,
    'Or 14 carats': -15000,
    'Argent 925': -25000,
    'Platine 950': 35000,
  };

  const colorPrices: Record<string, number> = {
    'Or Jaune': 0,
    'Or Rose': 5000,
    'Or Blanc': 8000,
    'Platine': 45000,
    'Argent': -20000,
  };

  colors.forEach((color) => {
    sizes.forEach((size) => {
      materials.forEach((material) => {
        variantIndex++;

        // Calculate price based on options
        const basePrice = 85000; // 850.00 EUR base
        const colorPrice = colorPrices[color] || 0;
        const materialPrice = materialPrices[material] || 0;
        const price = basePrice + colorPrice + materialPrice;

        // Simulate various stock states
        let inventoryQuantity = 15;
        let allowBackorder = false;

        // Some variants are out of stock
        if (
          (color === 'Platine' && material === 'Or 18 carats') ||
          (size === '60' && material === 'Platine 950')
        ) {
          inventoryQuantity = 0;
        }
        // Some have low stock
        else if (size === '50' || size === '58') {
          inventoryQuantity = Math.floor(Math.random() * 5) + 1;
        }
        // Some are backorder
        else if (material === 'Platine 950' && color === 'Or Blanc') {
          inventoryQuantity = 0;
          allowBackorder = true;
        }

        variants.push({
          id: `var-${variantIndex}`,
          sku: `BJX-${color.substring(0, 2).toUpperCase()}-${size}-${material.substring(0, 2).toUpperCase()}-${variantIndex.toString().padStart(4, '0')}`,
          title: `${color} - ${size} - ${material}`,
          optionValues: {
            Couleur: color,
            Taille: size,
            Materiau: material,
          },
          priceAmount: price,
          inventoryQuantity,
          allowBackorder,
        });
      });
    });
  });

  return variants;
}

const demoVariants = generateDemoVariants();

// Simpler demo with just color and size
const simpleOptions: ProductOption[] = [
  {
    id: 'opt-color',
    title: 'Couleur',
    type: 'color',
    values: [
      { id: 'color-1', value: 'Or Jaune', colorHex: '#FFD700' },
      { id: 'color-2', value: 'Or Rose', colorHex: '#E8B4A0' },
      { id: 'color-3', value: 'Or Blanc', colorHex: '#E8E8E8' },
    ],
  },
  {
    id: 'opt-size',
    title: 'Taille',
    type: 'size',
    values: [
      { id: 'size-1', value: '50' },
      { id: 'size-2', value: '52' },
      { id: 'size-3', value: '54' },
      { id: 'size-4', value: '56' },
    ],
  },
];

const simpleVariants: ProductVariant[] = [
  {
    id: 'sv-1',
    sku: 'BJX-RING-001',
    title: 'Or Jaune - 50',
    optionValues: { Couleur: 'Or Jaune', Taille: '50' },
    priceAmount: 85000,
    inventoryQuantity: 15,
    allowBackorder: false,
  },
  {
    id: 'sv-2',
    sku: 'BJX-RING-002',
    title: 'Or Jaune - 52',
    optionValues: { Couleur: 'Or Jaune', Taille: '52' },
    priceAmount: 85000,
    inventoryQuantity: 3,
    allowBackorder: false,
  },
  {
    id: 'sv-3',
    sku: 'BJX-RING-003',
    title: 'Or Jaune - 54',
    optionValues: { Couleur: 'Or Jaune', Taille: '54' },
    priceAmount: 85000,
    inventoryQuantity: 20,
    allowBackorder: false,
  },
  {
    id: 'sv-4',
    sku: 'BJX-RING-004',
    title: 'Or Jaune - 56',
    optionValues: { Couleur: 'Or Jaune', Taille: '56' },
    priceAmount: 85000,
    inventoryQuantity: 0,
    allowBackorder: false,
  },
  {
    id: 'sv-5',
    sku: 'BJX-RING-005',
    title: 'Or Rose - 50',
    optionValues: { Couleur: 'Or Rose', Taille: '50' },
    priceAmount: 90000,
    inventoryQuantity: 8,
    allowBackorder: false,
  },
  {
    id: 'sv-6',
    sku: 'BJX-RING-006',
    title: 'Or Rose - 52',
    optionValues: { Couleur: 'Or Rose', Taille: '52' },
    priceAmount: 90000,
    inventoryQuantity: 12,
    allowBackorder: false,
  },
  {
    id: 'sv-7',
    sku: 'BJX-RING-007',
    title: 'Or Rose - 54',
    optionValues: { Couleur: 'Or Rose', Taille: '54' },
    priceAmount: 90000,
    inventoryQuantity: 0,
    allowBackorder: true,
  },
  {
    id: 'sv-8',
    sku: 'BJX-RING-008',
    title: 'Or Rose - 56',
    optionValues: { Couleur: 'Or Rose', Taille: '56' },
    priceAmount: 90000,
    inventoryQuantity: 5,
    allowBackorder: false,
  },
  {
    id: 'sv-9',
    sku: 'BJX-RING-009',
    title: 'Or Blanc - 50',
    optionValues: { Couleur: 'Or Blanc', Taille: '50' },
    priceAmount: 93000,
    inventoryQuantity: 7,
    allowBackorder: false,
  },
  {
    id: 'sv-10',
    sku: 'BJX-RING-010',
    title: 'Or Blanc - 52',
    optionValues: { Couleur: 'Or Blanc', Taille: '52' },
    priceAmount: 93000,
    inventoryQuantity: 0,
    allowBackorder: false,
  },
  {
    id: 'sv-11',
    sku: 'BJX-RING-011',
    title: 'Or Blanc - 54',
    optionValues: { Couleur: 'Or Blanc', Taille: '54' },
    priceAmount: 93000,
    inventoryQuantity: 10,
    allowBackorder: false,
  },
  {
    id: 'sv-12',
    sku: 'BJX-RING-012',
    title: 'Or Blanc - 56',
    optionValues: { Couleur: 'Or Blanc', Taille: '56' },
    priceAmount: 93000,
    inventoryQuantity: 2,
    allowBackorder: false,
  },
];

// ============================================================================
// Demo Component
// ============================================================================

export function ProductVariantSelectorDemo() {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [demoType, setDemoType] = useState<'simple' | 'full' | 'compact'>('simple');

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-heading text-neutral-900">
          Premium Variant Selector Demo
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Demonstration of the luxury B2B jewelry variant selector with color swatches,
          size chips, material cards, and responsive behavior.
        </p>
      </div>

      {/* Demo Type Selector */}
      <div className="flex justify-center gap-2">
        {(['simple', 'full', 'compact'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setDemoType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              demoType === type
                ? 'bg-accent text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {type === 'simple' && 'Simple (2 options)'}
            {type === 'full' && 'Full (3 options)'}
            {type === 'compact' && 'Compact Mode'}
          </button>
        ))}
      </div>

      {/* Demo Container */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-soft-md p-6 md:p-8">
        <div className="mb-6 pb-6 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Bague Solitaire Diamant
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Selectionnez vos options
          </p>
        </div>

        {demoType === 'simple' && (
          <ProductVariantSelectorPremium
            options={simpleOptions}
            variants={simpleVariants}
            defaultVariantId="sv-1"
            currencyCode="EUR"
            showPriceDiff
            showStock
            showSizeGuide
            onSizeGuideClick={() => alert('Size guide modal would open here')}
            onVariantChange={(variant) => setSelectedVariant(variant)}
          />
        )}

        {demoType === 'full' && (
          <ProductVariantSelectorPremium
            options={demoOptions}
            variants={demoVariants}
            currencyCode="EUR"
            showPriceDiff
            showStock
            showSizeGuide
            onSizeGuideClick={() => alert('Size guide modal would open here')}
            onVariantChange={(variant) => setSelectedVariant(variant)}
          />
        )}

        {demoType === 'compact' && (
          <ProductVariantSelectorPremium
            options={simpleOptions}
            variants={simpleVariants}
            defaultVariantId="sv-1"
            currencyCode="EUR"
            showPriceDiff
            showStock={false}
            compact
            onVariantChange={(variant) => setSelectedVariant(variant)}
          />
        )}
      </div>

      {/* Selected Variant Debug Info */}
      {selectedVariant && (
        <div className="bg-neutral-50 rounded-lg p-4 text-sm font-mono">
          <h3 className="font-semibold text-neutral-900 mb-2">Selected Variant Data:</h3>
          <pre className="text-xs text-neutral-600 overflow-auto">
            {JSON.stringify(selectedVariant, null, 2)}
          </pre>
        </div>
      )}

      {/* State Examples */}
      <div className="space-y-8">
        <h2 className="text-xl font-heading text-neutral-900 text-center">
          State Reference Guide
        </h2>

        {/* Color Swatch States */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            Color Swatch States
          </h3>
          <div className="flex flex-wrap gap-6">
            <StateExample label="Default" />
            <StateExample label="Hover" className="ring-2 ring-neutral-300 scale-105" />
            <StateExample label="Selected" className="ring-[3px] ring-accent" showCheck />
            <StateExample label="Disabled" className="opacity-40" />
            <StateExample label="Out of Stock" className="opacity-30" showStrike />
          </div>
        </div>

        {/* Size Chip States */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            Size Chip States
          </h3>
          <div className="flex flex-wrap gap-3">
            <ChipExample label="50" sublabel="En stock" status="success" />
            <ChipExample label="52" sublabel="3 dispo" status="warning" />
            <ChipExample label="54" sublabel="Selected" status="selected" />
            <ChipExample label="56" sublabel="Rupture" status="error" />
            <ChipExample label="58" sublabel="Commande" status="info" />
          </div>
        </div>

        {/* Price Difference Examples */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            Price Difference Indicators
          </h3>
          <div className="flex flex-wrap gap-4">
            <PriceDiffExample amount="+50,00 EUR" type="increase" />
            <PriceDiffExample amount="-30,00 EUR" type="decrease" />
            <PriceDiffExample amount="Prix de base" type="base" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components for State Examples
// ============================================================================

function StateExample({
  label,
  className = '',
  showCheck = false,
  showStrike = false,
}: {
  label: string;
  className?: string;
  showCheck?: boolean;
  showStrike?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 ring-offset-2 ring-offset-white ${className}`}
      >
        {showCheck && (
          <span className="absolute inset-0 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
        {showStrike && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-[150%] h-0.5 bg-red-500 rotate-45 absolute" />
          </span>
        )}
      </div>
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}

function ChipExample({
  label,
  sublabel,
  status,
}: {
  label: string;
  sublabel: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'selected';
}) {
  const statusStyles = {
    success: 'border-neutral-200 bg-white',
    warning: 'border-warning-300 bg-warning-50/50',
    error: 'border-neutral-100 bg-neutral-50 opacity-50',
    info: 'border-info-300 bg-info-50/50',
    selected: 'border-2 border-accent bg-accent/[0.06]',
  };

  const textStyles = {
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-500',
    info: 'text-info-600',
    selected: 'text-accent',
  };

  return (
    <div
      className={`relative min-w-[64px] px-4 py-3 rounded-lg border-[1.5px] flex flex-col items-center gap-1 ${statusStyles[status]}`}
    >
      <span className={`text-sm font-semibold ${status === 'selected' ? 'text-accent' : 'text-neutral-900'}`}>
        {label}
      </span>
      <span className={`text-[10px] font-medium uppercase tracking-wider ${textStyles[status]}`}>
        {sublabel}
      </span>
      {status === 'selected' && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  );
}

function PriceDiffExample({
  amount,
  type,
}: {
  amount: string;
  type: 'increase' | 'decrease' | 'base';
}) {
  const styles = {
    increase: 'bg-warning-100 text-warning-700',
    decrease: 'bg-success-100 text-success-700',
    base: 'bg-neutral-100 text-neutral-500',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${styles[type]}`}>
      {amount}
    </span>
  );
}

export default ProductVariantSelectorDemo;
