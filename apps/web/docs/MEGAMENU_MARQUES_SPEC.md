# MegaMenu "Marques" (Brands) Tab - UX/UI Specification

## Executive Summary

This document specifies a world-class "Marques" (Brands) tab for the B2B jewelry e-commerce MegaMenu. The design prioritizes **exceptional performance**, **professional aesthetics**, and **accessibility** while handling potentially hundreds of brands with varying data completeness (logos may or may not exist).

---

## 1. Design Philosophy

### Core Principles

1. **Performance First**: Sub-100ms render times even with 500+ brands
2. **Progressive Enhancement**: Works without JavaScript, enhanced with it
3. **Visual Hierarchy**: Guide users to discover brands efficiently
4. **Accessibility**: WCAG 2.1 AA compliant minimum
5. **Brand Equity**: Showcase brands professionally, building trust

### Visual Language

- **Color Palette**: Neutral foundation with accent orange (`#f67828`) for interactions
- **Typography**: Inter for body, clean and professional
- **Spacing**: Generous whitespace for luxury feel
- **Motion**: Subtle, purposeful animations (150-200ms)

---

## 2. Layout Architecture

### Desktop Layout (1280px+)

```
+------------------------------------------------------------------+
|  [Search brands...]                              [View all ->]    |
+------------------------------------------------------------------+
|                                                                   |
|  MARQUES PREMIUM (6)              |  MARQUES POPULAIRES A-Z       |
|  +------+ +------+ +------+       |  [A] [B] [C] ... [Z] [#]      |
|  | Logo | | Logo | | Init |       |  --------------------------------
|  | Cart | | Bulg | | VC   |       |  A                             |
|  | 234  | | 156  | | 89   |       |  Amor & Amore (45)             |
|  +------+ +------+ +------+       |  Argyor (123)                  |
|  +------+ +------+ +------+       |  Ateliers Saint-Germain (67)   |
|  | Logo | | Init | | Logo |       |  B                             |
|  | Tiff | | Chop | | Piag |       |  Bulgari (156)                 |
|  | 312  | | 78   | | 145  |       |  Boucheron (89)                |
|  +------+ +------+ +------+       |  ...                           |
|                                   |                               |
+-----------------------------------+-------------------------------+
|  PROMO CARD                                                       |
|  [Nouvelle Collection Cartier 2024 - Decouvrir ->]               |
+------------------------------------------------------------------+
```

### Tablet Layout (768px - 1279px)

- 2-column premium brands grid
- Alphabetical list below in scrollable container
- Search bar remains prominent

### Mobile Layout (<768px)

- Full-width search bar
- Popular brands horizontal scroll
- Vertical alphabetical list with sticky letter headers
- Bottom sheet presentation

---

## 3. Component Hierarchy

```
MegaMenuMarques/
├── index.tsx                    # Main orchestrator
├── BrandsSearchBar.tsx          # Search input with debounce
├── BrandsPremiumGrid.tsx        # Featured/premium brands grid
├── BrandsAlphabeticalList.tsx   # A-Z navigation + brand list
│   ├── AlphabetNav.tsx          # Letter quick-jump navigation
│   └── BrandListSection.tsx     # Grouped brands by letter
├── BrandCard.tsx                # Individual brand card
│   ├── BrandLogo.tsx            # Logo with lazy loading
│   └── BrandInitials.tsx        # Fallback initials avatar
├── BrandPromoCard.tsx           # Promotional featured brand
├── BrandsSkeleton.tsx           # Loading state
└── types.ts                     # TypeScript interfaces
```

---

## 4. Component Specifications

### 4.1 BrandCard Component

**Purpose**: Display a single brand with logo, name, and product count.

**Visual States**:
- Default: Light background, subtle border
- Hover: Elevated shadow, accent border hint
- Focus: Visible focus ring (accessibility)
- Loading: Skeleton placeholder

**Props Interface**:
```typescript
interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    productCount: number;
    tier?: 'premium' | 'standard';
  };
  variant?: 'grid' | 'list';
  size?: 'sm' | 'md' | 'lg';
  onSelect?: (brand: Brand) => void;
}
```

**Logo Fallback Strategy**:
1. Attempt to load `logoUrl` with lazy loading
2. On error or missing URL, display initials
3. Initials use deterministic color based on brand name hash

**Initials Color Algorithm**:
```typescript
function getBrandColor(brandName: string): string {
  const colors = [
    '#f67828', // accent orange
    '#d4a84b', // gold
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f59e0b', // amber
  ];

  const hash = brandName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
}
```

**Dimensions**:
- Grid variant (lg): 140px x 140px
- Grid variant (md): 100px x 100px
- List variant: 40px height, full width

### 4.2 BrandsSearchBar Component

**Purpose**: Enable rapid brand discovery via search.

**Behavior**:
- Debounced input (300ms)
- Minimum 2 characters to trigger search
- Highlights matching text in results
- Keyboard navigation support (Arrow keys, Enter, Escape)

**Visual Design**:
- Prominent placement at top
- Search icon (magnifying glass) prefix
- Clear button when text present
- Results dropdown with max 8 suggestions

**Accessibility**:
- `role="combobox"`
- `aria-expanded` state
- `aria-activedescendant` for keyboard navigation
- Live region for result count announcements

### 4.3 BrandsAlphabeticalList Component

**Purpose**: Organized A-Z brand browsing with quick navigation.

**Features**:
- Sticky alphabet navigation bar
- Smooth scroll to letter sections
- Virtual scrolling for performance (react-window)
- Empty letter states handled gracefully

**Alphabet Navigation**:
- Horizontal scroll on mobile
- Disabled state for letters with no brands
- Active state shows current visible section
- Click/touch to jump to section

**Performance Optimizations**:
- Virtualized list rendering (only visible items in DOM)
- Intersection Observer for active letter detection
- Memoized brand grouping computation

### 4.4 BrandsPremiumGrid Component

**Purpose**: Highlight premium/featured brands prominently.

**Layout**:
- 2x3 grid on desktop (6 brands)
- 2x2 grid on tablet (4 brands)
- Horizontal scroll on mobile

**Visual Treatment**:
- Larger cards than standard brands
- Subtle golden border accent for premium tier
- Crown icon indicator

---

## 5. Data Structure

### Brand Interface

```typescript
interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  logoAlt?: string;
  productCount: number;
  tier: 'premium' | 'standard';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BrandsData {
  premium: Brand[];
  alphabetical: Record<string, Brand[]>;
  totalCount: number;
  lastUpdated: string;
}
```

### API Response Optimization

```typescript
// Minimal payload for MegaMenu (fast initial load)
interface BrandSummary {
  id: string;
  n: string;     // name (shortened key)
  s: string;     // slug
  l?: string;    // logoUrl (optional)
  c: number;     // productCount
  t: 0 | 1;      // tier (0=standard, 1=premium)
}
```

---

## 6. Performance Strategy

### Initial Load Optimization

1. **Server-Side Rendering**: Pre-render brand list structure
2. **Static Data**: Brand list changes infrequently, cache aggressively
3. **Compressed Payload**: Minified JSON keys, gzip compression
4. **Critical Path**: Render skeleton immediately, hydrate with data

### Image Loading Strategy

1. **Lazy Loading**: Native `loading="lazy"` attribute
2. **Intersection Observer**: Load images 200px before viewport
3. **Placeholder**: Show initials immediately, swap when image loads
4. **Image Optimization**:
   - WebP format with JPEG fallback
   - Responsive srcset (48px, 96px, 144px)
   - CDN with edge caching

### Virtualization

```typescript
// react-window configuration
<FixedSizeList
  height={400}
  itemCount={brands.length}
  itemSize={48}
  overscanCount={5}
>
  {BrandRow}
</FixedSizeList>
```

### Caching Strategy

- **Browser Cache**: 1 hour for brand data
- **Service Worker**: Cache-first for logos
- **React Query/SWR**: Stale-while-revalidate pattern

---

## 7. Interaction Design

### Hover States

| Element | Default | Hover |
|---------|---------|-------|
| Brand Card | `bg-white border-neutral-200` | `bg-neutral-50 border-neutral-300 shadow-sm` |
| Brand Logo | `opacity-100` | `scale-105` |
| Brand Name | `text-neutral-700` | `text-accent` |
| Product Count | `text-neutral-400` | `text-neutral-500` |

### Transitions

```css
/* Brand Card */
.brand-card {
  transition: all 150ms ease-out;
}

/* Logo Image */
.brand-logo {
  transition: transform 200ms ease-out;
}

/* Focus Ring */
.brand-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus between cards |
| Enter/Space | Select brand (navigate) |
| Arrow Keys | Navigate within grid |
| Escape | Close MegaMenu |
| / | Focus search bar |

---

## 8. Accessibility Checklist

### WCAG 2.1 AA Compliance

- [ ] Color contrast ratio >= 4.5:1 for text
- [ ] Color contrast ratio >= 3:1 for UI components
- [ ] Focus indicators visible on all interactive elements
- [ ] Touch targets minimum 44x44px
- [ ] Screen reader announcements for dynamic content
- [ ] Keyboard navigation fully functional
- [ ] No keyboard traps
- [ ] Reduced motion support (`prefers-reduced-motion`)

### ARIA Implementation

```tsx
<nav aria-label="Navigation des marques">
  <div role="search">
    <input
      type="search"
      aria-label="Rechercher une marque"
      aria-describedby="search-hint"
    />
    <span id="search-hint" className="sr-only">
      Tapez le nom d'une marque pour filtrer la liste
    </span>
  </div>

  <section aria-labelledby="premium-brands-title">
    <h3 id="premium-brands-title">Marques Premium</h3>
    <ul role="list">
      {/* Brand cards */}
    </ul>
  </section>

  <section aria-labelledby="all-brands-title">
    <h3 id="all-brands-title">Toutes les marques</h3>
    <nav aria-label="Navigation alphabetique">
      {/* Alphabet nav */}
    </nav>
    <ul role="list">
      {/* Alphabetical brand list */}
    </ul>
  </section>
</nav>
```

---

## 9. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom sheet |
| Tablet | 640-1023px | 2 columns, reduced grid |
| Desktop | 1024-1279px | 3 columns |
| Wide | >= 1280px | Full layout |

### Mobile-Specific Adaptations

1. **Bottom Sheet**: MegaMenu slides up from bottom
2. **Sticky Search**: Search bar stays at top when scrolling
3. **Horizontal Scroll**: Premium brands in horizontal carousel
4. **Collapsible Sections**: Alphabet sections expandable
5. **Touch Optimized**: Larger touch targets, swipe gestures

---

## 10. Error States

### No Results

```tsx
<div className="text-center py-12">
  <SearchIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
  <p className="text-neutral-600 font-medium">
    Aucune marque trouvee pour "{searchQuery}"
  </p>
  <p className="text-neutral-400 text-sm mt-1">
    Essayez avec un autre terme de recherche
  </p>
</div>
```

### Loading Failed

```tsx
<div className="text-center py-12">
  <AlertCircle className="w-12 h-12 text-danger-400 mx-auto mb-4" />
  <p className="text-neutral-600 font-medium">
    Impossible de charger les marques
  </p>
  <button className="mt-4 text-accent hover:underline">
    Reessayer
  </button>
</div>
```

### Image Load Error

- Gracefully fall back to initials
- No broken image icons
- Log error for monitoring

---

## 11. Analytics Events

```typescript
// Brand card click
trackEvent('megamenu_brand_click', {
  brand_id: brand.id,
  brand_name: brand.name,
  brand_tier: brand.tier,
  source: 'megamenu_brands',
  position: index,
});

// Search interaction
trackEvent('megamenu_brand_search', {
  search_term: query,
  results_count: results.length,
  selected_brand: selectedBrand?.id,
});

// Alphabet navigation
trackEvent('megamenu_brand_alphabet_nav', {
  letter: selectedLetter,
  brands_in_section: count,
});
```

---

## 12. Implementation Priority

### Phase 1: Core Functionality
1. BrandCard with logo/initials fallback
2. Premium brands grid
3. Basic alphabetical list
4. Desktop layout

### Phase 2: Performance
1. Lazy loading images
2. Virtualized list
3. Optimized data fetching
4. Skeleton loading states

### Phase 3: Enhanced UX
1. Search functionality
2. Alphabet quick-nav
3. Keyboard navigation
4. Mobile layout

### Phase 4: Polish
1. Animations and transitions
2. Analytics integration
3. Accessibility audit
4. Performance monitoring

---

## 13. Visual Mockup Description

### Desktop View (1440px)

**Header Section**:
- Full-width search bar with rounded corners
- Placeholder text: "Rechercher une marque..."
- Magnifying glass icon on left
- "Voir toutes les marques" link aligned right with arrow icon

**Premium Brands Section**:
- Left side, occupying ~40% width
- Section title with crown icon: "MARQUES PREMIUM"
- 2x3 grid of brand cards
- Each card:
  - 140x140px
  - White background
  - Subtle border (`border-neutral-200`)
  - Centered logo or initials avatar (64x64px)
  - Brand name below (14px, medium weight)
  - Product count badge (small, neutral)
  - Hover: slight elevation, border color change

**Alphabetical Section**:
- Right side, ~60% width
- Sticky alphabet navigation at top
- Letters in a single row, scrollable if needed
- Active letter highlighted with accent color
- Disabled letters (no brands) appear muted
- List below with letter group headers
- Each brand row:
  - Small logo or initials (32x32px)
  - Brand name
  - Product count
  - Chevron icon for navigation affordance

**Promo Card** (bottom):
- Full-width promotional banner
- Dark background with gradient
- Featured brand collection announcement
- CTA button

---

## 14. Technical Notes

### Dependencies

```json
{
  "react-window": "^1.8.10",
  "use-debounce": "^10.0.0",
  "@tanstack/react-query": "^5.x"
}
```

### File Structure

```
components/
  layout/
    Header/
      MegaMenu/
        MegaMenuMarques/
          index.tsx
          BrandsSearchBar.tsx
          BrandsPremiumGrid.tsx
          BrandsAlphabeticalList.tsx
          BrandCard.tsx
          BrandInitials.tsx
          BrandPromoCard.tsx
          BrandsSkeleton.tsx
          types.ts
          hooks/
            useBrandsData.ts
            useBrandSearch.ts
            useAlphabetNav.ts
          utils/
            brandColors.ts
            groupBrandsByLetter.ts
```

---

## 15. Success Metrics

| Metric | Target |
|--------|--------|
| Time to Interactive | < 200ms |
| First Contentful Paint | < 100ms |
| Brand Card Click Rate | > 15% |
| Search Usage Rate | > 25% |
| Mobile Usability Score | > 90 |
| Accessibility Score | 100 |

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: UI Design System Team*
