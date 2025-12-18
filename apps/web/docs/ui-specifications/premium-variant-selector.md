# Premium Product Variant Selector - UI Design Specification

## Overview

This document provides comprehensive UI specifications for a premium product variant/option selector designed for a B2B luxury jewelry e-commerce platform. The design draws inspiration from Hermes' elegant aesthetic while maintaining professional B2B functionality.

---

## 1. Design System Foundation

### 1.1 Color Palette

```css
/* Primary Brand Colors */
--accent-primary: #f67828;        /* Hermes Orange - Primary CTA */
--accent-hover: #ea580c;          /* Darker orange on hover */
--accent-soft: rgba(246, 120, 40, 0.08);  /* Background tint */
--accent-border: rgba(246, 120, 40, 0.3); /* Selected state border */

/* Gold Accent (Premium indicators) */
--gold-primary: #d4a84b;
--gold-soft: rgba(212, 168, 75, 0.1);

/* Neutral Palette */
--neutral-900: #171717;           /* Primary text */
--neutral-700: #404040;           /* Secondary text */
--neutral-500: #737373;           /* Muted text */
--neutral-300: #d4d4d4;           /* Disabled text */
--neutral-200: #e5e5e5;           /* Borders */
--neutral-100: #f5f5f5;           /* Subtle backgrounds */
--neutral-50: #fafafa;            /* Card backgrounds */

/* Status Colors */
--success-600: #059669;           /* In stock */
--success-100: #d1fae5;           /* Success background */
--warning-600: #d97706;           /* Low stock */
--warning-100: #fef3c7;           /* Warning background */
--error-600: #dc2626;             /* Out of stock */
--error-100: #fee2e2;             /* Error background */
--info-600: #2563eb;              /* Backorder */
--info-100: #dbeafe;              /* Info background */
```

### 1.2 Typography

```css
/* Option Label */
font-family: 'Inter', system-ui, sans-serif;
font-size: 0.8125rem; /* 13px */
font-weight: 600;
letter-spacing: 0.05em;
text-transform: uppercase;
color: var(--neutral-700);

/* Selected Value Display */
font-size: 0.875rem; /* 14px */
font-weight: 500;
color: var(--accent-primary);

/* Price Difference */
font-size: 0.75rem; /* 12px */
font-weight: 500;
font-variant-numeric: tabular-nums;

/* Stock Status */
font-size: 0.6875rem; /* 11px */
font-weight: 500;
letter-spacing: 0.02em;
```

### 1.3 Spacing System

```css
/* Component Spacing */
--space-section: 24px;           /* Between option groups */
--space-label: 12px;             /* Label to options gap */
--space-options: 8px;            /* Between option items (chips) */
--space-options-lg: 12px;        /* Between larger items (material cards) */

/* Internal Padding */
--padding-chip: 12px 16px;       /* Size chips */
--padding-swatch: 4px;           /* Color swatch outer ring */
--padding-card: 16px;            /* Material cards */
```

### 1.4 Border Radius

```css
--radius-swatch: 50%;            /* Circular color swatches */
--radius-chip: 8px;              /* Size/option chips */
--radius-card: 12px;             /* Material cards */
--radius-badge: 4px;             /* Stock/price badges */
```

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
ProductVariantSelectorPremium
├── OptionGroup (for each option type)
│   ├── OptionHeader
│   │   ├── OptionIcon (type-specific)
│   │   ├── OptionLabel
│   │   ├── SelectedValueDisplay
│   │   └── ActionLink (e.g., "Size Guide")
│   │
│   └── OptionValues
│       ├── ColorSwatchPremium[] (for color options)
│       ├── SizeChipPremium[] (for size options)
│       ├── MaterialCardPremium[] (for material options)
│       └── GenericOptionPremium[] (for other options)
│
├── VariantSummary (appears when selection is complete)
│   ├── VariantThumbnail
│   ├── VariantDetails
│   │   ├── VariantName
│   │   ├── SKU
│   │   └── StockBadge
│   └── PriceDisplay
│
└── IncompleteWarning (when selection is incomplete)
```

---

## 3. Selector Types

### 3.1 Color Swatch Selector

**Use Case:** Color, Finish, Enamel options

#### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ [Palette Icon] COULEUR : Or Rose                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ ████ │  │ ████ │  │ ████ │  │ ████ │  │░░░░░░│     │
│  │ ████ │  │  ✓   │  │ ████ │  │ ████ │  │░░░░░░│     │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘     │
│   Or Jaune  Or Rose   Or Blanc  Platine   Argent      │
│   +50EUR    (actif)   +120EUR  +450EUR   (rupture)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### States & Dimensions

| State | Dimensions | Border | Background | Shadow |
|-------|------------|--------|------------|--------|
| Default | 44x44px | 2px transparent | Color fill | soft-sm |
| Hover | 44x44px | 2px neutral-300 | Color fill | soft-md + scale(1.05) |
| Selected | 48x48px | 3px accent-primary | Color fill | elegant |
| Disabled | 44x44px | 1px neutral-200 | Color fill @ 40% | none |
| Out of Stock | 44x44px | 1px neutral-200 | Color fill @ 30% + diagonal stripe | none |

#### Tailwind Classes

```tsx
// Default state
"relative w-11 h-11 rounded-full transition-all duration-200 ease-luxe
 ring-2 ring-transparent ring-offset-2 ring-offset-white
 hover:ring-neutral-300 hover:scale-105 hover:shadow-soft-md
 focus-visible:outline-none focus-visible:ring-accent focus-visible:ring-offset-2"

// Selected state
"w-12 h-12 ring-[3px] ring-accent shadow-elegant scale-100"

// Disabled state
"opacity-40 cursor-not-allowed pointer-events-none"

// Out of stock state
"opacity-30 cursor-not-allowed
 after:absolute after:inset-0 after:bg-gradient-to-br
 after:from-transparent after:via-error-600/40 after:to-transparent
 after:rotate-45"
```

#### Color Label (Below Swatch)

```tsx
// Container
"flex flex-col items-center gap-1 mt-2"

// Color name
"text-[11px] font-medium text-neutral-600 truncate max-w-[60px]"

// Price diff (if applicable)
"text-[10px] font-medium tabular-nums
 [&.positive]:text-warning-600 [&.negative]:text-success-600"
```

---

### 3.2 Size Chip Selector

**Use Case:** Ring Size, Chain Length, Bracelet Size

#### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ [Ruler Icon] TAILLE : 54                Guide des tailles│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │    50    │ │    52    │ │    54    │ │    56    │  │
│  │  En stock│ │ 3 dispo  │ │    ✓     │ │ Rupture  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                            (selected)    (disabled)    │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │    58    │ │    60    │ │    62    │               │
│  │Sur commande│ │  En stock│ │  En stock│               │
│  └──────────┘ └──────────┘ └──────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### States & Dimensions

| State | Min-Width | Padding | Border | Background |
|-------|-----------|---------|--------|------------|
| Default | 64px | 12px 16px | 1.5px neutral-200 | white |
| Hover | 64px | 12px 16px | 1.5px neutral-400 | neutral-50 |
| Selected | 64px | 12px 16px | 2px accent | accent-soft |
| Disabled | 64px | 12px 16px | 1px neutral-100 | neutral-50 |
| Low Stock | 64px | 12px 16px | 1.5px warning-300 | warning-50 |

#### Tailwind Classes

```tsx
// Chip container
"group relative min-w-[64px] px-4 py-3 rounded-lg
 border-[1.5px] transition-all duration-200 ease-luxe
 flex flex-col items-center gap-1
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"

// Default state
"border-neutral-200 bg-white
 hover:border-neutral-400 hover:bg-neutral-50"

// Selected state
"border-accent border-2 bg-accent/[0.06]"

// Disabled state
"border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed"

// Size value text
"text-sm font-semibold text-neutral-900
 group-hover:text-neutral-700
 [&.selected]:text-accent"

// Stock indicator
"text-[10px] font-medium uppercase tracking-wider
 [&.in-stock]:text-success-600
 [&.low-stock]:text-warning-600
 [&.out-of-stock]:text-error-500
 [&.backorder]:text-info-600"

// Selected checkmark badge
"absolute -top-1.5 -right-1.5 w-5 h-5
 bg-accent rounded-full flex items-center justify-center
 shadow-sm"
```

---

### 3.3 Material Card Selector

**Use Case:** Metal Type, Stone Type, Chain Style

#### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ [Layers Icon] MATERIAU : Or 18 carats                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │    [Image]      │  │    [Image]      │              │
│  │   ┌───────┐     │  │   ┌───────┐     │              │
│  │   │ 18K   │     │  │   │ 14K   │     │              │
│  │   └───────┘     │  │   └───────┘     │              │
│  │                 │  │                 │              │
│  │  Or 18 carats   │  │  Or 14 carats   │              │
│  │  +200EUR HT     │  │  Prix de base   │              │
│  │  ● En stock     │  │  ● 5 disponibles│              │
│  └─────────────────┘  └─────────────────┘              │
│       (selected)                                        │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │    [Image]      │  │    [Image]      │              │
│  │   ┌───────┐     │  │   ┌───────┐     │              │
│  │   │ 925   │     │  │   │ PT    │     │              │
│  │   └───────┘     │  │   └───────┘     │              │
│  │                 │  │                 │              │
│  │  Argent 925     │  │  Platine 950    │              │
│  │  -150EUR HT     │  │  +850EUR HT     │              │
│  │  ○ Sur commande │  │  ✕ Indisponible │              │
│  └─────────────────┘  └─────────────────┘              │
│                           (disabled)                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### States & Dimensions

| State | Dimensions | Border | Background | Shadow |
|-------|------------|--------|------------|--------|
| Default | 140px min-w, auto h | 1px neutral-200 | white | soft-sm |
| Hover | 140px min-w | 1px neutral-300 | white | soft-md |
| Selected | 140px min-w | 2px accent | accent-soft | elegant |
| Disabled | 140px min-w | 1px neutral-100 | neutral-50 | none |

#### Tailwind Classes

```tsx
// Card container
"group relative min-w-[140px] p-4 rounded-xl
 border transition-all duration-250 ease-luxe
 cursor-pointer
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"

// Default state
"border-neutral-200 bg-white shadow-soft-sm
 hover:border-neutral-300 hover:shadow-soft-md"

// Selected state
"border-2 border-accent bg-accent/[0.04] shadow-elegant"

// Disabled state
"border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed"

// Material image/icon container
"relative w-full aspect-square mb-3 rounded-lg overflow-hidden
 bg-neutral-100 flex items-center justify-center"

// Material badge (18K, 14K, etc.)
"absolute top-2 left-2 px-2 py-0.5
 bg-white/90 backdrop-blur-sm rounded text-[10px] font-semibold
 text-neutral-700 shadow-sm"

// Material name
"text-sm font-semibold text-neutral-900 mb-1
 group-hover:text-neutral-700
 [&.selected]:text-accent"

// Price difference
"text-xs font-medium tabular-nums mb-2
 [&.positive]:text-warning-600
 [&.negative]:text-success-600
 [&.base]:text-neutral-500"

// Stock status with dot
"flex items-center gap-1.5 text-[11px] font-medium"

// Status dot
"w-1.5 h-1.5 rounded-full
 [&.in-stock]:bg-success-500
 [&.low-stock]:bg-warning-500
 [&.out-of-stock]:bg-error-500
 [&.backorder]:bg-info-500"

// Selected overlay checkmark
"absolute top-2 right-2 w-6 h-6
 bg-accent rounded-full flex items-center justify-center
 shadow-md opacity-0 scale-75 transition-all duration-200
 group-[.selected]:opacity-100 group-[.selected]:scale-100"
```

---

## 4. Price Difference Indicators

### 4.1 Inline Price Badge

For use within chips and small selectors.

```tsx
// Positive (price increase)
"inline-flex items-center px-1.5 py-0.5 rounded
 bg-warning-100 text-warning-700 text-[10px] font-semibold tabular-nums"
// Display: "+50 EUR"

// Negative (price decrease)
"inline-flex items-center px-1.5 py-0.5 rounded
 bg-success-100 text-success-700 text-[10px] font-semibold tabular-nums"
// Display: "-30 EUR"

// Base price (no difference)
"text-[10px] text-neutral-400 font-medium"
// Display: "Prix de base"
```

### 4.2 Card Price Display

For material cards with more space.

```tsx
// Price container
"flex items-baseline gap-1"

// Price value
"text-sm font-bold tabular-nums
 [&.increase]:text-warning-600
 [&.decrease]:text-success-600
 [&.base]:text-neutral-600"

// Currency & unit
"text-xs text-neutral-500"
```

---

## 5. Stock Status Indicators

### 5.1 Status Variants

| Status | Icon | Color | Label (FR) |
|--------|------|-------|------------|
| In Stock (>10) | Check circle | Success | "En stock" |
| Low Stock (1-10) | Alert circle | Warning | "X disponibles" |
| Out of Stock | X circle | Error | "Rupture" |
| Backorder | Clock | Info | "Sur commande" |
| Preorder | Calendar | Info | "Precommande" |
| Discontinued | Ban | Error | "Arrete" |

### 5.2 Compact Stock Badge

```tsx
// Container
"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"

// Variants
"bg-success-100 text-success-700" // In stock
"bg-warning-100 text-warning-700" // Low stock
"bg-error-100 text-error-700"     // Out of stock
"bg-info-100 text-info-700"       // Backorder

// Icon
"w-3 h-3"
```

### 5.3 Expanded Stock Display

```tsx
// Container
"flex items-center gap-2 p-2 rounded-lg"

// Background variants
"bg-success-50 border border-success-200"  // In stock
"bg-warning-50 border border-warning-200"  // Low stock
"bg-error-50 border border-error-200"      // Out of stock

// Text
"text-xs font-medium"

// Quantity badge
"px-1.5 py-0.5 rounded bg-white/80 text-[11px] font-semibold"
```

---

## 6. Animation Specifications

### 6.1 Micro-interactions

```css
/* Selection transition */
transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Hover scale */
transform: scale(1.05);
transition: transform 150ms ease-out;

/* Selected checkmark appear */
@keyframes checkmarkAppear {
  0% { opacity: 0; transform: scale(0.5); }
  50% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
animation: checkmarkAppear 300ms ease-out;

/* Focus ring */
transition: box-shadow 150ms ease;
box-shadow: 0 0 0 3px rgba(246, 120, 40, 0.3);

/* Color swatch pulse on selection */
@keyframes swatchPulse {
  0% { box-shadow: 0 0 0 0 rgba(246, 120, 40, 0.4); }
  100% { box-shadow: 0 0 0 8px rgba(246, 120, 40, 0); }
}
animation: swatchPulse 400ms ease-out;
```

### 6.2 Framer Motion Variants

```tsx
// Container stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Option item
const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

// Selected indicator
const selectedVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// Price update
const priceVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};
```

---

## 7. Responsive Behavior

### 7.1 Breakpoints

```css
/* Mobile First */
--bp-sm: 640px;   /* Small tablets */
--bp-md: 768px;   /* Tablets */
--bp-lg: 1024px;  /* Desktop */
--bp-xl: 1280px;  /* Large desktop */
```

### 7.2 Mobile Layout (< 640px)

```tsx
// Color swatches: Horizontal scroll
"flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory
 scrollbar-none"

// Each swatch
"snap-center flex-shrink-0"

// Size chips: 2-column grid
"grid grid-cols-2 gap-2"

// Material cards: Full width stack
"flex flex-col gap-3"

// Material card: Horizontal layout on mobile
"flex-row items-center p-3"

// Material image: Fixed size on mobile
"w-16 h-16 flex-shrink-0 mr-3"
```

### 7.3 Tablet Layout (640px - 1024px)

```tsx
// Color swatches: Wrap with more items visible
"flex flex-wrap gap-3"

// Size chips: 3-4 column grid
"grid grid-cols-3 sm:grid-cols-4 gap-2"

// Material cards: 2-column grid
"grid grid-cols-2 gap-4"
```

### 7.4 Desktop Layout (> 1024px)

```tsx
// Color swatches: Single row with wrap
"flex flex-wrap gap-4"

// Size chips: Flexible wrap
"flex flex-wrap gap-2"

// Material cards: 3-4 column grid
"grid grid-cols-3 lg:grid-cols-4 gap-4"
```

---

## 8. Accessibility Requirements

### 8.1 ARIA Implementation

```tsx
// Option group
<div role="radiogroup" aria-labelledby="option-label">

// Individual option
<button
  role="radio"
  aria-checked={isSelected}
  aria-disabled={isDisabled}
  aria-describedby={`${id}-stock ${id}-price`}
>

// Stock status (for screen readers)
<span id={`${id}-stock`} className="sr-only">
  {stockStatus === 'in_stock' ? 'En stock' : `${quantity} disponibles`}
</span>

// Price difference
<span id={`${id}-price`} className="sr-only">
  {priceDiff > 0 ? `Plus ${formatPrice(priceDiff)}` : `Moins ${formatPrice(Math.abs(priceDiff))}`}
</span>
```

### 8.2 Keyboard Navigation

```tsx
// Arrow key navigation within option group
onKeyDown={(e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    focusNextOption();
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    focusPreviousOption();
  }
  if (e.key === 'Enter' || e.key === ' ') {
    selectOption();
  }
}}

// Focus visible styles
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
```

### 8.3 Color Contrast Requirements

| Element | Foreground | Background | Ratio | WCAG Level |
|---------|------------|------------|-------|------------|
| Option label | neutral-700 (#404040) | white (#fff) | 7.5:1 | AAA |
| Price text | neutral-900 (#171717) | white (#fff) | 14.5:1 | AAA |
| Success text | success-700 (#047857) | success-50 (#ecfdf5) | 4.8:1 | AA |
| Warning text | warning-700 (#b45309) | warning-50 (#fffbeb) | 5.2:1 | AA |
| Error text | error-700 (#b91c1c) | error-50 (#fef2f2) | 5.8:1 | AA |
| Accent on white | accent (#f67828) | white (#fff) | 3.1:1 | AA Large |

---

## 9. Complete Component Props

```typescript
interface ProductVariantSelectorPremiumProps {
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
  onVariantChange?: (variant: ProductVariant | null) => void;

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

interface ProductOption {
  id: string;
  title: string;
  type: 'color' | 'size' | 'material' | 'custom';
  values: OptionValue[];
}

interface OptionValue {
  id: string;
  value: string;
  /** Hex code for color swatches */
  colorHex?: string;
  /** Image URL for material cards */
  imageUrl?: string;
  /** Icon name for custom display */
  icon?: string;
  /** Metadata for display */
  metadata?: Record<string, unknown>;
}

interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  optionValues: Record<string, string>;
  priceAmount: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  allowBackorder: boolean;
  images?: string[];
}
```

---

## 10. Usage Examples

### 10.1 Basic Implementation

```tsx
<ProductVariantSelectorPremium
  options={product.options}
  variants={product.variants}
  defaultVariantId={product.variants[0]?.id}
  currencyCode="EUR"
  showPriceDiff
  showStock
  showSizeGuide
  onSizeGuideClick={() => openSizeGuideModal()}
  onVariantChange={(variant) => setSelectedVariant(variant)}
/>
```

### 10.2 Compact Mode (Quick View Modal)

```tsx
<ProductVariantSelectorPremium
  options={product.options}
  variants={product.variants}
  compact
  showStock={false}
  showPriceDiff
  onValidVariantSelected={(variant) => {
    addToCart(variant);
    closeModal();
  }}
/>
```

---

## 11. Design Tokens Summary (Tailwind Config)

```javascript
// Add to tailwind.config.ts theme.extend
{
  // Variant selector specific
  animation: {
    'swatch-pulse': 'swatchPulse 400ms ease-out',
    'check-appear': 'checkAppear 300ms ease-out',
  },
  keyframes: {
    swatchPulse: {
      '0%': { boxShadow: '0 0 0 0 rgba(246, 120, 40, 0.4)' },
      '100%': { boxShadow: '0 0 0 8px rgba(246, 120, 40, 0)' },
    },
    checkAppear: {
      '0%': { opacity: '0', transform: 'scale(0.5)' },
      '50%': { transform: 'scale(1.1)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
  },
}
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Design System: Maison Bijoux B2B*
