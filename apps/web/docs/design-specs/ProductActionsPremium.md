# ProductActionsPremium - Design Specifications

## Overview

A premium, luxury-focused product actions component designed for B2B jewelry e-commerce. Features glass morphism effects, refined micro-interactions, and optimized conversion patterns with a sticky bottom bar option.

---

## Design Philosophy

### Brand Alignment
- **Premium/Luxury Feel**: Clean lines, generous spacing, subtle animations
- **B2B Professional**: Clear pricing, stock visibility, quote functionality
- **Hermes Orange Accent** (#F97316 / #f67828): Used for primary CTAs to create urgency while maintaining elegance

### Key Principles
1. **Clarity Over Complexity**: Every element serves a purpose
2. **Conversion Optimization**: Sticky bar ensures CTA is always visible
3. **Visual Hierarchy**: Clear distinction between primary and secondary actions
4. **Accessibility First**: WCAG 2.1 AA compliant, respects reduced motion preferences

---

## Color System

### Primary Action Colors
```css
/* Add to Cart Button - Primary CTA */
--cta-gradient-start: #f67828;  /* Hermes Orange */
--cta-gradient-end: #ea580c;    /* Orange 600 */
--cta-shadow: rgba(246, 120, 40, 0.25);

/* Hover State */
--cta-hover-start: #fb923c;     /* Orange 400 */
--cta-hover-end: #f67828;       /* Hermes Orange */
--cta-hover-shadow: rgba(246, 120, 40, 0.30);
```

### Secondary Action Colors
```css
/* Request Quote Button - Secondary */
--secondary-bg: #ffffff;
--secondary-border: #e5e5e5;    /* Neutral 200 */
--secondary-text: #262626;      /* Neutral 800 */
--secondary-hover-border: #f67828;
--secondary-hover-text: #f67828;
--secondary-hover-bg: rgba(246, 120, 40, 0.05);
```

### Wishlist Button Colors
```css
/* Inactive State */
--wishlist-bg: #ffffff;
--wishlist-border: #e5e5e5;
--wishlist-icon: #a3a3a3;       /* Neutral 400 */

/* Active State */
--wishlist-active-bg: #fef2f2; /* Red 50 */
--wishlist-active-border: #fecaca;
--wishlist-active-icon: #ef4444;
```

### Stock Status Colors
```css
/* In Stock */
--stock-in-bg: #ecfdf5;        /* Emerald 50 */
--stock-in-border: #a7f3d0;    /* Emerald 200 */
--stock-in-text: #059669;      /* Emerald 600 */
--stock-in-dot: #10b981;       /* Emerald 500 */

/* Low Stock */
--stock-low-bg: #fffbeb;       /* Amber 50 */
--stock-low-border: #fde68a;   /* Amber 200 */
--stock-low-text: #d97706;     /* Amber 600 */
--stock-low-dot: #f59e0b;      /* Amber 500 */

/* Out of Stock */
--stock-out-bg: #fef2f2;       /* Red 50 */
--stock-out-border: #fecaca;   /* Red 200 */
--stock-out-text: #dc2626;     /* Red 600 */
--stock-out-dot: #ef4444;      /* Red 500 */

/* Backorder */
--stock-back-bg: #eff6ff;      /* Blue 50 */
--stock-back-border: #bfdbfe;  /* Blue 200 */
--stock-back-text: #2563eb;    /* Blue 600 */
--stock-back-dot: #3b82f6;     /* Blue 500 */
```

---

## Typography

### Price Display
```css
/* Main Total Price */
font-family: 'Inter', sans-serif;
font-size: 1.5rem;       /* 24px */
font-weight: 700;
line-height: 1;
font-variant-numeric: tabular-nums;
color: #171717;          /* Neutral 900 */

/* Unit Price */
font-size: 0.75rem;      /* 12px */
font-weight: 400;
color: #a3a3a3;          /* Neutral 400 */
```

### Labels
```css
/* Section Labels (e.g., "Quantite", "Total HT") */
font-family: 'Inter', sans-serif;
font-size: 0.875rem;     /* 14px */
font-weight: 600;
color: #404040;          /* Neutral 700 */
text-transform: none;
```

### Button Text
```css
/* Primary CTA */
font-family: 'Inter', sans-serif;
font-size: 1rem;         /* 16px */
font-weight: 600;
letter-spacing: 0;

/* Secondary Buttons */
font-size: 1rem;
font-weight: 500;
```

---

## Spacing System

### Component Spacing
```css
/* Inline Variant */
--section-gap: 1.5rem;     /* 24px - Between major sections */
--item-gap: 1rem;          /* 16px - Between related items */
--inner-gap: 0.75rem;      /* 12px - Inside components */

/* Sticky Bar */
--bar-padding-x: 1rem;     /* 16px */
--bar-padding-y: 0.75rem;  /* 12px */
--bar-gap: 0.75rem;        /* 12px - Between elements */
```

### Button Padding
```css
/* Size: Small */
height: 2.5rem;    /* 40px */
padding-x: 1rem;   /* 16px */

/* Size: Medium */
height: 2.75rem;   /* 44px */
padding-x: 1.5rem; /* 24px */

/* Size: Large */
height: 3.5rem;    /* 56px */
padding-x: 2rem;   /* 32px */
```

---

## Component Layouts

### Inline Variant (Desktop/Tablet)
```
+--------------------------------------------------+
|  [Stock Status Banner]                            |
|  En stock (45) - Expedition sous 24-48h          |
+--------------------------------------------------+
|                                                   |
|  Quantite                           Par 5        |
|  [-] [  10  ] [+]           Total HT             |
|                              245,00 EUR           |
|                              24,50 EUR / unite    |
+--------------------------------------------------+
|                                                   |
|  [========= AJOUTER AU PANIER =========]         |
|                                                   |
|  [--- Demander un devis ---]  [heart]            |
|                                                   |
+--------------------------------------------------+
|  Expedition depuis Paris                          |
|  2-3 jours - Livraison offerte                   |
+--------------------------------------------------+
```

### Sticky Bar Variant (Mobile)
```
+--------------------------------------------------+
|  EXPANDABLE SECTION (when open)                   |
|  +----------------------------------------------+ |
|  | [Stock Status]                               | |
|  | Quantite     [-] [5] [+]                     | |
|  | [--- Demander un devis ---]                  | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
|  MAIN BAR                                         |
|  En stock          245,00 EUR    [^] [AJOUTER]   |
+--------------------------------------------------+
```

### Sticky Bar Variant (Desktop)
```
+------------------------------------------------------------------+
|  En stock  [-][10][+]      Total: 245,00 EUR  [Devis] [heart] [AJOUTER AU PANIER] |
+------------------------------------------------------------------+
```

---

## Visual States

### Add to Cart Button

#### Default State
```css
background: linear-gradient(180deg, #f67828 0%, #ea580c 100%);
color: #ffffff;
box-shadow: 0 10px 15px -3px rgba(246, 120, 40, 0.25);
transform: translateY(0);
```

#### Hover State
```css
background: linear-gradient(180deg, #fb923c 0%, #f67828 100%);
box-shadow: 0 20px 25px -5px rgba(246, 120, 40, 0.30);
transform: translateY(-2px);
transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

#### Active/Pressed State
```css
background: linear-gradient(180deg, #ea580c 0%, #c2410c 100%);
box-shadow: 0 4px 6px -1px rgba(246, 120, 40, 0.20);
transform: translateY(0);
transition: all 100ms ease;
```

#### Loading State
```css
/* Same as default, content replaced with spinner */
cursor: wait;
pointer-events: none;
```
- Spinner: 20px white SVG, `animation: spin 1s linear infinite`
- Button text opacity: 0 (hidden but maintains width)

#### Success State
```css
/* Same background as default */
/* Content: checkmark icon + "Ajoute au panier" */
/* Duration: 2500ms before returning to idle */
```
- Icon: Check (lucide-react), scale animation 1 -> 1.2 -> 1
- Text changes from "Ajouter" to "Ajoute"

#### Disabled State
```css
background: linear-gradient(180deg, #d4d4d4 0%, #a3a3a3 100%);
box-shadow: none;
cursor: not-allowed;
opacity: 1; /* Full opacity, just grayed out */
```

### Quantity Selector

#### Default State
```css
border: 1px solid #e5e5e5;
border-radius: 0.75rem;
overflow: hidden;

/* Buttons */
background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
color: #525252;

/* Input */
background: #ffffff;
color: #171717;
font-weight: 600;
```

#### Focused State
```css
border-color: #f67828;
box-shadow: 0 0 0 3px rgba(246, 120, 40, 0.15);
```

#### Disabled State
```css
opacity: 0.5;
pointer-events: none;
```

---

## Animation Specifications

### Container Entrance
```javascript
// Staggered fade-in for inline variant
{
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom luxe easing
      staggerChildren: 0.1,
    },
  },
}
```

### Sticky Bar Entrance
```javascript
{
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
}
```

### Button Tap Effect
```javascript
whileTap: { scale: 0.98 }
// Duration: instantaneous
// Respects prefers-reduced-motion
```

### Stock Indicator Pulse
```css
@keyframes pulse-stock {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.5);
  }
}
/* Duration: 2s, ease-in-out, infinite */
/* Only for "in_stock" status */
```

### Heart Animation (Wishlist)
```javascript
// On toggle to active
animate: { scale: [1, 1.2, 1] }
transition: { duration: 0.3 }
```

---

## Glass Morphism Specifications

### Sticky Bar Background
```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border-top: 1px solid rgba(226, 232, 240, 0.5);
box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
```

### Expanded Section
```css
background: rgba(255, 255, 255, 1);
border-bottom: 1px solid #f1f5f9;
```

---

## Icon Recommendations

Using **Lucide React** icons for consistency:

| Element | Icon | Size | Notes |
|---------|------|------|-------|
| Add to Cart | `ShoppingCart` | 20px | Primary CTA |
| Request Quote | `FileText` | 16px | Secondary action |
| Wishlist (inactive) | `Heart` | 20px | Outline only |
| Wishlist (active) | `Heart` | 20px | Filled (`fill-current`) |
| In Stock | `Package` | 16px | Stock indicator |
| Low Stock | `AlertCircle` | 16px | Warning indicator |
| Out of Stock | `AlertCircle` | 16px | Error indicator |
| Backorder | `Clock` | 16px | Time-based indicator |
| Quantity Decrement | `Minus` | 16px | Quantity control |
| Quantity Increment | `Plus` | 16px | Quantity control |
| Success | `Check` | 20px | Confirmation state |
| Loading | `Loader2` | 20px | With spin animation |
| Expand/Collapse | `ChevronUp` | 20px | Sticky bar toggle |

---

## Responsive Behavior

### Breakpoints
- **Mobile**: < 768px (md breakpoint)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
1. Sticky bar is primary interface
2. Expandable section for quantity/quote
3. Simplified button labels
4. Larger touch targets (min 44px)

### Desktop Adaptations
1. Inline variant is default
2. All controls visible without expansion
3. Horizontal layout for sticky bar
4. More generous spacing

---

## Accessibility Requirements

### Focus Management
- All interactive elements have visible focus states
- Focus ring: `ring-2 ring-accent ring-offset-2`
- Tab order follows visual hierarchy

### Screen Reader Support
- Quantity input has `aria-label="Quantite"`
- Loading state announces `aria-busy="true"`
- Wishlist button uses `aria-pressed` for toggle state
- Stock status is announced with semantic text

### Reduced Motion
- Component respects `prefers-reduced-motion`
- Falls back to instant state changes
- No decorative animations when preference is set

### Color Contrast
- All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- Button text on orange background: white (#ffffff) on #f67828 = 4.5:1
- Stock status text meets requirements per color

---

## Usage Examples

### Basic Inline Usage
```tsx
import { ProductActionsPremium } from '@/components/products/ProductDetail/ProductActionsPremium';

<ProductActionsPremium
  productId="prod_123"
  productName="Bracelet Or 18K"
  unitPrice={245.00}
  formatPrice={(price) => `${price.toFixed(2)} EUR`}
  stock={{
    globalStatus: 'in_stock',
    totalAvailable: 45,
  }}
  variant="inline"
  onAddToCart={async (qty) => {
    await addToCart(productId, qty);
  }}
  onRequestQuote={(qty) => {
    openQuoteModal(productId, qty);
  }}
  onAddToWishlist={() => toggleWishlist(productId)}
  isInWishlist={false}
/>
```

### Sticky Bar Usage (Mobile Optimization)
```tsx
<ProductActionsPremium
  variant="sticky"
  showStickyBar={shouldShowStickyBar}
  // ... other props
/>
```

### Combined Usage (Product Detail Page)
```tsx
// Use inline for desktop, sticky for mobile scroll
<>
  {/* Always render inline for initial view */}
  <div className="md:block">
    <ProductActionsPremium variant="inline" {...props} />
  </div>

  {/* Show sticky bar when scrolled past inline version */}
  <ProductActionsPremium
    variant="sticky"
    showStickyBar={hasScrolledPastActions}
    {...props}
  />
</>
```

---

## File Locations

- **Component**: `/apps/web/components/products/ProductDetail/ProductActionsPremium.tsx`
- **Global Styles**: `/apps/web/app/globals.css` (glass morphism utilities)
- **Design Docs**: `/apps/web/docs/design-specs/ProductActionsPremium.md`

---

## Dependencies

- `framer-motion` - Animations and gestures
- `lucide-react` - Icons
- `@/lib/utils` - cn() utility for class merging
- `@maison/types` - TypeScript types (StockStatus, ProductStock, Warehouse)
