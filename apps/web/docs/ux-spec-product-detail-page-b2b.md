# UX/UI Specification: B2B Product Detail Page
## Luxury Jewelry Wholesale Platform

**Version:** 1.0
**Date:** December 2024
**Author:** UX Design Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Context & Personas](#2-user-context--personas)
3. [Page Structure Overview](#3-page-structure-overview)
4. [Component Specifications](#4-component-specifications)
5. [State Management](#5-state-management)
6. [Accessibility Requirements](#6-accessibility-requirements)
7. [Animation & Interaction Guidelines](#7-animation--interaction-guidelines)
8. [Mobile Specifications](#8-mobile-specifications)
9. [SEO Requirements](#9-seo-requirements)
10. [Component Hierarchy](#10-component-hierarchy)
11. [Data Requirements](#11-data-requirements)
12. [Wireframe Descriptions](#12-wireframe-descriptions)

---

## 1. Executive Summary

### Purpose
This document defines the complete UX/UI specification for the Product Detail Page (PDP) of a B2B luxury jewelry wholesale platform. The design prioritizes professional buyers' needs: quick access to technical specifications, transparent pricing with volume tiers, stock visibility, and efficient ordering workflows.

### Key Differentiators from B2C
- **Price Display:** HT (excluding tax) as primary, with volume discount tiers
- **Tone:** Professional, factual, efficient (not emotional marketing)
- **Technical Specs:** Primary content, not secondary
- **Actions:** Quote requests, bulk ordering, comparison tools
- **Stock:** Multi-warehouse visibility with delivery estimates
- **Authentication:** Account-specific pricing and features

### Design Principles
1. **Efficiency First** - Minimize clicks to complete purchase decisions
2. **Information Density** - Show more data per screen than typical B2C
3. **Trust Signals** - Certifications, brand authenticity, warranty prominent
4. **Scalability** - Components must work with millions of SKUs
5. **Accessibility** - WCAG 2.1 AA compliance minimum

---

## 2. User Context & Personas

### Primary Persona: Independent Jeweler
**Name:** Sophie, 42
**Role:** Owner of boutique jewelry store
**Goals:**
- Quickly evaluate if product fits her clientele
- Compare prices across variants and quantities
- Check stock for immediate availability
- Download product information for internal records

**Pain Points:**
- Needs to make decisions fast (time is money)
- Frustrated by hidden pricing or unclear MOQs
- Needs technical specs to answer customer questions

### Secondary Persona: Retail Chain Buyer
**Name:** Marc, 35
**Role:** Purchasing Manager for 12-store chain
**Goals:**
- Order in bulk with best volume pricing
- Request quotes for large orders
- Track certifications for compliance
- Compare products systematically

**Pain Points:**
- Needs approval workflows visibility
- Must justify purchases with documentation
- Requires multi-delivery logistics

---

## 3. Page Structure Overview

### 3.1 Desktop Layout (1440px reference)

```
+------------------------------------------------------------------+
|                         HEADER (Fixed)                           |
+------------------------------------------------------------------+
|  BREADCRUMB NAVIGATION                                           |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------+  +-----------------------------+  |
|  |                           |  |  BRAND LINK                 |  |
|  |                           |  |  PRODUCT TITLE (H1)         |  |
|  |      PRODUCT GALLERY      |  |  BADGES ROW                 |  |
|  |       (55% width)         |  |  REFERENCE / SKU / EAN      |  |
|  |                           |  |  SHORT DESCRIPTION          |  |
|  |  [Main Image + Zoom]      |  +-----------------------------+  |
|  |                           |  |  VARIANT SELECTOR           |  |
|  |  [Thumbnail Strip]        |  +-----------------------------+  |
|  |                           |  |  STOCK STATUS BANNER        |  |
|  +---------------------------+  +-----------------------------+  |
|                                 |  PRICING SECTION            |  |
|                                 |  - Unit price HT            |  |
|                                 |  - Volume tiers table       |  |
|                                 |  - Total calculation        |  |
|                                 +-----------------------------+  |
|                                 |  QUANTITY + ADD TO CART     |  |
|                                 +-----------------------------+  |
|                                 |  SECONDARY ACTIONS          |  |
|                                 |  [Quote] [Wishlist] [PDF]   |  |
|                                 +-----------------------------+  |
|                                 |  DELIVERY ESTIMATE          |  |
|                                 +-----------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
|                    PRODUCT DETAILS TABS                          |
|  [Description] [Specifications] [Certifications] [Documents]     |
+------------------------------------------------------------------+
|                    RELATED PRODUCTS CAROUSEL                     |
+------------------------------------------------------------------+
|                    CROSS-SELL PRODUCTS                           |
+------------------------------------------------------------------+
|                    BRAND SHOWCASE SECTION                        |
+------------------------------------------------------------------+
|                    RECENTLY VIEWED                               |
+------------------------------------------------------------------+
|                         FOOTER                                   |
+------------------------------------------------------------------+
```

### 3.2 Information Hierarchy (Priority Order)

| Priority | Element | Rationale |
|----------|---------|-----------|
| 1 | Brand + Product Title | Identity confirmation |
| 2 | Reference/SKU | Quick verification for returning buyers |
| 3 | Badges | Status indicators (New, Certified, Promo) |
| 4 | Gallery | Visual confirmation |
| 5 | Variant Selector | Configuration before pricing |
| 6 | Stock Status | Availability check |
| 7 | Pricing + Volume Tiers | Decision factor |
| 8 | Quantity + Add to Cart | Primary action |
| 9 | Secondary Actions | Quote, wishlist, compare |
| 10 | Technical Specs | Supporting information |

---

## 4. Component Specifications

### 4.1 Breadcrumb Navigation

**Purpose:** Contextual navigation, SEO, and user orientation.

**Structure:**
```
Accueil > Bijoux > Bagues > Solitaires > [Product Name]
```

**Specifications:**
- Maximum 5 levels visible
- Truncate long category names (max 20 characters)
- Current page (last item) is non-clickable, bold
- Separator: chevron icon (`>`)
- Font: 13px, neutral-600, 400 weight
- Links: hover state changes to accent color

**Accessibility:**
- Wrap in `<nav aria-label="Fil d'Ariane">`
- Use ordered list (`<ol>`) semantically
- Last item has `aria-current="page"`

**JSON-LD Required:** Yes (BreadcrumbList schema)

---

### 4.2 Product Gallery

**Existing Component:** `ProductGallery.tsx`

**Enhancements Required:**

#### 4.2.1 Main Image Container
- **Dimensions:** Minimum 600x600px, 1:1 aspect ratio
- **Background:** neutral-50 (#f9fafb)
- **Border radius:** 8px

#### 4.2.2 Zoom Behavior
- **Desktop:** Hover zoom (1.5x scale, lens follows cursor)
- **Click:** Opens lightbox
- **Indicator:** "Zoom actif" badge appears on hover

#### 4.2.3 Thumbnail Strip
- **Position:** Below main image (horizontal)
- **Visible thumbnails:** 5-6 max
- **Size:** 80x80px each
- **Active state:** 2px accent border
- **Overflow:** Scroll arrows appear
- **Video indicator:** Play icon overlay on video thumbnails

#### 4.2.4 Lightbox Mode
- **Background:** Black (rgba(0,0,0,0.95))
- **Controls:** Close (X), Previous/Next arrows, Zoom +/-
- **Zoom levels:** 100%, 150%, 200%, 250%, 300%
- **Counter:** "3 / 8" format
- **Keyboard:** Arrow keys navigate, Escape closes

#### 4.2.5 Variant Image Switching
- When variant is selected, gallery updates to show variant-specific images
- Smooth fade transition (300ms)
- If no variant images exist, show default gallery

#### 4.2.6 Mobile Behavior
- Full-width swipe carousel
- Pagination dots (max 5 visible, then "1/8" counter)
- Pinch-to-zoom supported
- Double-tap toggles zoom

**Reference Badge:**
- Position: Top-left corner of main image
- Content: "Ref: ABC-123"
- Style: White background, 90% opacity, 12px monospace font

---

### 4.3 Product Information Section

**Existing Component:** `ProductInfo.tsx`

#### 4.3.1 Brand Display
- **Position:** First element above title
- **Format:** Uppercase, letter-spacing: 0.05em
- **Link:** To brand page (`/marques/{brand-slug}`)
- **Font:** 12px, neutral-600, hover: accent

#### 4.3.2 Product Title (H1)
- **Font:** 28px desktop / 24px mobile, semibold (600)
- **Color:** neutral-900
- **Max lines:** 3, truncate with ellipsis if longer

#### 4.3.3 Badges Row
Displayed horizontally with 8px gap.

| Badge Type | Label | Color | Icon |
|------------|-------|-------|------|
| New | "Nouveau" | Yellow (warning) | Sparkles |
| Promo | "-X%" | Red (error) | Tag |
| Exclusive | "Exclusif" | Gray (light) | Award |
| Bestseller | "Best-seller" | Green (success) | Star |
| Certified | "Certifie GIA" | Blue (info) | Shield |
| Limited | "Edition limitee" | Orange (warning) | Clock |

**Badge Component Specs:**
- Height: 24px
- Padding: 0 8px
- Border-radius: 4px
- Font: 11px, medium weight
- Icon: 12px, left of text

#### 4.3.4 Reference & Identifiers
```
Ref: ABC-123-456  |  EAN: 3760123456789
```
- Font: 13px monospace
- Color: neutral-500 (label), neutral-700 (value)
- Separator: vertical bar with spacing

#### 4.3.5 Short Description
- Max 2-3 sentences
- Font: 15px, neutral-600, line-height 1.6
- Character limit: 250

#### 4.3.6 Detailed Info Grid (below description)
Display in 2-column grid:

| Label | Value Example |
|-------|---------------|
| Origine | France |
| Garantie | 2 ans |
| Poids | 4.2 g |
| Matieres | Or blanc 18K, Diamant |
| Collection | Printemps/Ete 2024 |
| Style | Classique |

**Icon per row:** Globe (origin), Shield (warranty), Scale (weight), Sparkles (materials)

---

### 4.4 Variant Selector

**Critical Design Decision:** NO color swatches (data quality issue with millions of SKUs)

#### 4.4.1 Option Types & Display Logic

| Option Type | # Options | Display Pattern |
|-------------|-----------|-----------------|
| Material/Metal | 1-4 | Button group (toggle) |
| Material/Metal | 5+ | Dropdown |
| Size | Any | Searchable dropdown |
| Stone/Color | Any | Text dropdown |

#### 4.4.2 Button Group (for <= 4 options)
```
+----------+  +----------+  +----------+  +----------+
| Or 18K   |  | Or Blanc |  | Platine  |  | Argent   |
| (active) |  |          |  |          |  | 925      |
+----------+  +----------+  +----------+  +----------+
```

**Specs:**
- Min width: 80px
- Padding: 12px 16px
- Border: 1px neutral-200 (inactive), 2px accent (active)
- Background: white (inactive), accent/5% (active)
- Font: 14px, medium

**Stock indication in button:**
```
+------------------+
|    Or Blanc      |
|  (12 en stock)   |
+------------------+
```

#### 4.4.3 Dropdown Pattern
```
+--------------------------------+
| Metal           | Or 18K    [v]|
+--------------------------------+
| Options:                       |
| * Or 18K - En stock (12)       |
|   Or Blanc - En stock (8)      |
|   Platine - Sur commande       |
|   Rose Gold - Rupture          |
+--------------------------------+
```

**Dropdown Specs:**
- Full width within info column
- Label above dropdown: 13px, medium, neutral-900
- Dropdown height: 44px (touch target)
- Options show stock status inline
- Out-of-stock options: grayed but selectable (for quote)

#### 4.4.4 Size Guide Link
Position: Next to Size dropdown label
Text: "Guide des tailles"
Action: Opens modal with size conversion chart

#### 4.4.5 Price Change Animation
When variant changes and price differs:
- Show delta briefly: "+150,00" or "-50,00"
- Animate number transition (300ms ease-out)
- Optional: highlight price briefly with accent background

---

### 4.5 Stock & Availability Section

**Existing Component:** Uses `ProductStock` type from `@maison/types`

#### 4.5.1 Stock Status Banner

**Display Variants:**

| Status | Visual | Text | Background |
|--------|--------|------|------------|
| In Stock (>10) | Green dot | "En stock" | green-50 |
| Low Stock (<=10) | Orange dot | "Stock limite (X)" | amber-50 |
| Last Items (<=3) | Red dot | "Dernieres pieces (X)" | red-50 |
| Backorder | Gray dot | "Sur commande (X sem.)" | blue-50 |
| Out of Stock | Crossed gray dot | "Rupture de stock" | neutral-100 |

**Banner Structure:**
```
+---------------------------------------------------+
| [Status Dot] [Status Label] (X disponibles)       |
|              [Warehouse: Paris] [Change v]        |
+---------------------------------------------------+
```

**Specs:**
- Padding: 12px 16px
- Border-radius: 8px
- Status dot: 8px circle
- Font: 14px, colored per status

#### 4.5.2 Multi-Warehouse Display (Expandable)

```
Disponibilite par entrepot:
+--------------------------------+
| v Paris: En stock (12)         |
|   Lyon: En stock (5)           |
|   Bordeaux: Sur commande (2s)  |
+--------------------------------+
```

**Interaction:**
- Collapsed by default
- Click to expand
- Clicking warehouse updates delivery estimate

#### 4.5.3 Backorder Information
When status is "backorder":
```
+------------------------------------------+
| [Package Icon] Sur commande              |
| Delai estime: 3-4 semaines               |
| Livraison prevue: 15-22 janvier 2025     |
|                                          |
| [Reserver maintenant]                    |
+------------------------------------------+
```

---

### 4.6 Pricing Section

**Existing Component:** `ProductPricing.tsx`

#### 4.6.1 Price Source Indicator
Shows which price list is being used:
```
[Tag Icon] Tarif: Professionnel  [Badge: -15% remise client]
```

#### 4.6.2 Unit Price Display

```
Prix unitaire HT
-----------------
1 250,00 EUR  <-- Main price, 32px, semibold
(soit 1 500,00 EUR TTC)  <-- Secondary, 14px, neutral-500
```

**Promotional Price:**
```
1 500,00 EUR  <-- Crossed out, neutral-400
1 250,00 EUR  [-17%]  <-- Red, with discount badge
```

#### 4.6.3 Volume Discount Tiers Table

```
Remises quantite:
+--------------------------------------------------+
|  Quantite      Prix unit.      Economie          |
+--------------------------------------------------+
|  1 - 4         1 250,00 EUR    -                 |
|  5 - 9         1 187,50 EUR    -5%    [selected] |
|  10 - 24       1 125,00 EUR    -10%              |
|  25+           1 062,50 EUR    -15%              |
+--------------------------------------------------+
[Contactez-nous pour volumes importants]
```

**Specs:**
- Table with alternating row colors
- Active tier highlighted with accent border
- Checkmark icon on active tier
- Click on tier updates quantity to tier minimum
- Rows are interactive (focusable, clickable)

#### 4.6.4 Total Calculation

```
Quantite: [-] [  5  ] [+]    MOQ: 2 unites

Prix unitaire:  1 187,50 EUR  (-5%)
-----------------------------------
Sous-total HT:  5 937,50 EUR
TVA (20%):      1 187,50 EUR
===================================
Total TTC:      7 125,00 EUR
```

**Specs:**
- Total section appears when quantity > 1
- Animated price updates (framer-motion)
- Clear visual hierarchy with horizontal rules

#### 4.6.5 Tax Information Footer
```
[Info Icon] Prix Hors Taxes. TVA 20% applicable.
```
Font: 12px, neutral-500

---

### 4.7 Action Buttons Section

**Existing Component:** `ProductActions.tsx`

#### 4.7.1 Quantity Selector

```
+---------+------------+---------+
|   [-]   |     5      |   [+]   |
+---------+------------+---------+
```

**Specs:**
- Total width: 140px
- Button width: 40px each
- Input width: 60px, centered text
- Height: 48px
- Input accepts direct typing
- Validates against min/max/step on blur

**Validation:**
- Min: MOQ (minimum order quantity, default 1)
- Max: Available stock or maxQuantity
- Step: quantityStep (default 1, can be 5, 10, etc.)
- Invalid input: shake animation + revert to last valid

#### 4.7.2 Add to Cart Button (Primary CTA)

```
+--------------------------------------------------+
|  [Cart Icon]  AJOUTER AU PANIER                  |
+--------------------------------------------------+
```

**Specs:**
- Full width of info column
- Height: 56px
- Background: accent color (gold/bronze for luxury)
- Font: 16px, uppercase, letter-spacing 0.05em, bold
- Border-radius: 8px

**States:**
| State | Visual |
|-------|--------|
| Default | Solid accent background |
| Hover | Slightly darker (darken 10%) |
| Active | Scale down 98% |
| Loading | Spinner + "Ajout en cours..." |
| Success | Checkmark + "Ajoute!" (2s, then revert) |
| Disabled | 50% opacity, not clickable |
| Error | Shake animation + error message below |

#### 4.7.3 Request Quote Button (Secondary CTA)

```
+--------------------------------------------------+
|  [Document Icon]  DEMANDER UN DEVIS              |
+--------------------------------------------------+
```

**Specs:**
- Full width
- Height: 48px
- Border: 1px accent
- Background: white
- Font: 14px, accent color

**Action:** Opens slide-over panel with quote form

#### 4.7.4 Secondary Actions Row

```
+----------------+  +----------------+  +----------------+
| [Heart] Liste  |  | [Compare]      |  | [PDF] Fiche    |
+----------------+  +----------------+  +----------------+
```

**Specs:**
- Flex row, gap 12px
- Each button: 48px height, equal width (flex-1)
- Icon + text on desktop
- Icon only on mobile (with tooltip)

**Wishlist Button:**
- Heart icon, outline by default
- Filled when product is in wishlist
- Color: red when active

**Compare Button:**
- Scale icon
- Adds to comparison drawer (max 4 products)
- Badge shows count if items in comparison

**PDF Button:**
- Downloads product datasheet
- Generated on-demand if not pre-built
- Includes: All specs, images, pricing, certifications

---

### 4.8 Product Details Tabs

**Existing Component:** `ProductTabs.tsx`

#### 4.8.1 Tab Navigation

```
[Description] [Caracteristiques] [Certifications] [Documents] [Livraison]
========================================================================
```

**Specs:**
- Horizontal scrollable on mobile
- Active tab: accent border-bottom (2px), accent text
- Inactive: neutral-600 text, no border
- Hover: neutral-900 text
- Badge counts on Documents tab

#### 4.8.2 Description Tab

**Content:**
- Rich HTML content (supports headings, lists, bold/italic)
- May include lifestyle images
- Prose styling with proper line-height

**Specs:**
- Max prose width: 65ch
- Typography: prose-neutral class
- Image max-width: 100%

#### 4.8.3 Caracteristiques Tab (Technical Specifications)

**Table Format:**
```
+------------------------------------------+
| CARACTERISTIQUES TECHNIQUES              |
+------------------------------------------+
| Metal           | Or blanc 18K (750)     |
| Poids total     | 4.2 g                  |
| Pierre centrale | Diamant                |
| Carat           | 0.50 ct                |
| Couleur         | G                      |
| Purete          | VS1                    |
| Taille          | Brillant rond         |
| Sertissage      | Griffes 4 branches    |
| Dimensions      | 6.2mm x 6.2mm         |
| Reference       | BG-DR-2024-001        |
| Code EAN        | 3760123456789         |
+------------------------------------------+
```

**Specs:**
- Alternating row backgrounds (white/neutral-50)
- Label column: 40% width, neutral-600, medium
- Value column: 60% width, neutral-900
- Group by category if many specs (e.g., "Pierre", "Metal", "Dimensions")

#### 4.8.4 Certifications Tab

**Content:**
- GIA/HRD/IGI certificate information
- Certificate number with verification link
- Warranty details and coverage
- Authenticity guarantee

**Display:**
```
+------------------------------------------+
| [Shield Icon] CERTIFICAT GIA             |
| Numero: 2195837453                        |
| [Verifier sur GIA.edu ->]                |
+------------------------------------------+
| [Award Icon] GARANTIE                    |
| Duree: 2 ans                             |
| Couverture: Defauts de fabrication       |
+------------------------------------------+
```

#### 4.8.5 Documents Tab

**List Format:**
```
+------------------------------------------+
| [PDF Icon] Fiche technique           [v] |
| Format PDF - 245 KB                      |
+------------------------------------------+
| [Image Icon] Images haute resolution [v] |
| Archive ZIP - 12.3 MB                    |
+------------------------------------------+
| [PDF Icon] Certificat GIA            [v] |
| Format PDF - 1.2 MB                      |
+------------------------------------------+
```

**Specs:**
- Each document is a card with download action
- Icon based on file type (PDF, Image, Spreadsheet)
- File size displayed
- Opens in new tab or downloads

#### 4.8.6 Livraison Tab

**Content:**
- Shipping methods and costs
- Estimated delivery times by method
- Insurance information
- Return policy (B2B specific: 14 days, conditions)
- Special delivery contact

---

### 4.9 Below-Fold Sections

#### 4.9.1 Related Products Carousel

**Existing Component:** `RelatedProducts.tsx`

**Header:**
```
Produits similaires
-------------------
[<] [Product Card] [Product Card] [Product Card] [Product Card] [>]
```

**Specs:**
- Section title: 24px, semibold
- Horizontal scroll with arrow navigation
- 4 visible on desktop, 2 on mobile
- Products from same subcategory
- Card shows: Image, Brand, Name, Price, Stock indicator

**Product Card (Compact):**
```
+-------------------+
|    [Image]        |
|                   |
+-------------------+
| BRAND             |
| Product Name      |
| 1 250,00 EUR      |
| [En stock]        |
| [+ Panier]        | <- on hover
+-------------------+
```

#### 4.9.2 Cross-sell Products

**Header:**
```
Completez votre selection
-------------------------
```

**Content:**
- Matching items (earrings for necklace, etc.)
- Accessories (boxes, display stands)
- Cleaning products
- Same brand complementary pieces

#### 4.9.3 Brand Showcase Section

```
+----------------------------------------------------------+
|  [Brand Logo]                                            |
|                                                          |
|  Decouvrez CARTIER                                       |
|                                                          |
|  Fondee en 1847, Cartier est synonyme de luxe et        |
|  d'elegance. Decouvrez notre collection complete...      |
|                                                          |
|  [Voir tous les produits CARTIER ->]                     |
+----------------------------------------------------------+
```

**Specs:**
- Only shown if brand has dedicated page
- Subtle background color from brand identity
- Logo max-height: 48px
- Description: 2 sentences max
- CTA links to brand page

#### 4.9.4 Recently Viewed

**Header:**
```
Recemment consultes
-------------------
```

**Specs:**
- Stored in localStorage (client-side)
- Max 8-12 items
- Excludes current product
- Same card format as related products
- Horizontal scroll

---

## 5. State Management

### 5.1 Component State

| Component | State | Type | Default |
|-----------|-------|------|---------|
| Gallery | selectedIndex | number | 0 |
| Gallery | isZoomed | boolean | false |
| Gallery | isLightboxOpen | boolean | false |
| Gallery | lightboxZoomLevel | number | 0 |
| VariantSelector | selectedVariantId | string | first variant |
| PriceSection | quantity | number | MOQ |
| Actions | isAddingToCart | boolean | false |
| Actions | addedToCart | boolean | false |
| Actions | isInWishlist | boolean | from context |
| Tabs | activeTab | string | 'description' |

### 5.2 Context Dependencies

| Context | Data Used |
|---------|-----------|
| CartContext | addToCart, cart items |
| PricingContext | formatPrice, settings, tierDiscount |
| WishlistContext | isInWishlist, addToWishlist |
| ComparisonContext | addToComparison, comparisonItems |
| AuthContext | isAuthenticated, user |

### 5.3 Server Data (Props from SSR)

```typescript
interface ProductDetailPageProps {
  product: Product;
  medusaProduct: MedusaProduct;
  galleryMedia: GalleryMedia[];
  variantImagesMap: Record<string, string[]>;
  relatedProducts: Product[];
  crossSellProducts: Product[];
  brandInfo?: BrandInfo;
}
```

### 5.4 URL State

- Variant selection may update URL query params: `?variant=var_abc123`
- Tab selection may use hash: `#specifications`
- Supports deep linking and sharing

---

## 6. Accessibility Requirements

### 6.1 WCAG 2.1 AA Compliance

#### Keyboard Navigation
| Element | Keys | Behavior |
|---------|------|----------|
| Gallery | Arrow Left/Right | Navigate images |
| Gallery | Enter/Space | Open lightbox |
| Gallery | Escape | Close lightbox |
| Thumbnails | Tab | Focus each thumbnail |
| Dropdowns | Arrow Up/Down | Navigate options |
| Quantity | Arrow Up/Down | Increment/decrement |
| Tabs | Arrow Left/Right | Navigate tabs |
| Tabs | Enter/Space | Activate tab |

#### Focus Management
- Visible focus indicators (2px outline, offset 2px)
- Focus trap in lightbox modal
- Focus returns to trigger when modal closes
- Skip to main content link

#### Screen Reader Support
| Element | ARIA | Notes |
|---------|------|-------|
| Breadcrumb | `nav aria-label="Fil d'Ariane"` | Use `<ol>` |
| Gallery | `role="region" aria-label` | Announce image changes |
| Lightbox | `role="dialog" aria-modal="true"` | Trap focus |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"` | Standard pattern |
| Price | `aria-live="polite"` | Announce price changes |
| Stock | `aria-live="polite"` | Announce availability |
| Buttons | `aria-label` | For icon-only buttons |

#### Color & Contrast
- Text contrast: Minimum 4.5:1 (AA)
- UI components: Minimum 3:1
- Stock status: Never color-only (always icon + text)
- Focus indicators: 3:1 against adjacent colors

#### Forms
- All inputs have visible labels
- Error messages linked with `aria-describedby`
- Required fields marked with `aria-required="true"`
- Clear error recovery guidance

### 6.2 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Animation & Interaction Guidelines

### 7.1 Animation Principles

1. **Purpose-Driven:** Every animation serves a purpose (feedback, orientation, or delight)
2. **Subtle:** Luxury brand = refined, not flashy
3. **Fast:** Max 300ms for UI feedback, 500ms for larger transitions
4. **Respectful:** Honor prefers-reduced-motion

### 7.2 Specific Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page load | Stagger fade-in | 500ms | ease-out |
| Image transition | Fade | 300ms | ease |
| Price update | Number morph | 200ms | ease-out |
| Add to cart | Button scale + check | 300ms | spring |
| Add to cart success | Cart icon bounce | 400ms | ease-out |
| Tab content | Fade + slide up | 300ms | ease-out |
| Dropdown open | Scale + fade | 200ms | ease-out |
| Hover states | Color/background | 150ms | ease |
| Error shake | Horizontal shake | 400ms | ease |
| Lightbox open | Scale + fade | 300ms | ease-out |
| Toast notification | Slide in from right | 300ms | ease-out |

### 7.3 Micro-interactions

1. **Hover on product card:** Subtle shadow lift
2. **Thumbnail active:** Border animates in
3. **Quantity button press:** Scale down 95%
4. **Wishlist heart:** Fill animation (stroke to fill)
5. **Add to cart success:** Checkmark draw animation
6. **Price tier click:** Row highlight pulse

---

## 8. Mobile Specifications

### 8.1 Layout Order (Single Column)

1. Breadcrumb (simplified: last 2 levels)
2. Brand + Title
3. Badges Row
4. Image Gallery (full-width swipe)
5. Reference + Short Description
6. Variant Selectors
7. Stock Status Banner
8. Pricing Section
9. Sticky Add to Cart Bar (appears on scroll)
10. Secondary Actions (icons only)
11. Accordions (replaces tabs)
12. Related Products (horizontal scroll)
13. Recently Viewed

### 8.2 Sticky Add-to-Cart Bar

Appears when main CTA scrolls out of viewport.

```
+-----------------------------------------------+
| 1 250,00 EUR  [-][5][+]  [Ajouter au panier] |
+-----------------------------------------------+
```

**Specs:**
- Position: fixed bottom
- Height: 60px
- Background: white with shadow
- z-index: 40
- Safe area padding for notched phones

### 8.3 Collapsible Sections (Accordions)

Replace tabs with accordions on mobile:

```
v Description
  [Content visible]

> Caracteristiques

> Certifications

> Documents (3)

> Livraison
```

**Specs:**
- First accordion open by default
- Smooth expand/collapse (300ms)
- Chevron icon rotates on toggle
- Multiple can be open simultaneously

### 8.4 Touch Targets

- Minimum touch target: 44x44px
- Adequate spacing between targets: 8px minimum
- Dropdowns open in full-screen mode
- Use native `<select>` on iOS for better UX

### 8.5 Mobile Gallery

- Horizontal swipe with momentum
- Pagination dots below (max 5, then "1/8" counter)
- Double-tap to zoom
- Pinch to zoom with pan
- Full-screen mode accessible via button

### 8.6 Mobile Performance

- Lazy load below-fold images
- Use `loading="lazy"` on images
- Skeleton loading states
- Passive touch event listeners
- Reduced animations on low-end devices

---

## 9. SEO Requirements

### 9.1 Structured Data (JSON-LD)

#### Product Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Bague Solitaire Diamant Or Blanc 18K",
  "sku": "BG-DR-2024-001",
  "gtin13": "3760123456789",
  "brand": {
    "@type": "Brand",
    "name": "Cartier"
  },
  "image": [
    "https://example.com/images/product-1.jpg",
    "https://example.com/images/product-2.jpg"
  ],
  "description": "Bague solitaire en or blanc 18 carats sertie d'un diamant brillant de 0.50 carat...",
  "category": "Bijoux > Bagues > Solitaires",
  "material": "Or blanc 18K",
  "weight": {
    "@type": "QuantitativeValue",
    "value": "4.2",
    "unitCode": "GRM"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "EUR",
    "lowPrice": "1062.50",
    "highPrice": "1250.00",
    "offerCount": "4",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "WebexpR Pro B2B"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "24"
  }
}
```

#### BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Bagues",
      "item": "https://example.com/categories/bagues"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Solitaires",
      "item": "https://example.com/categories/bagues/solitaires"
    }
  ]
}
```

### 9.2 Meta Tags

```html
<title>Bague Solitaire Diamant 0.5ct Or Blanc 18K | Cartier | B2B Wholesale</title>
<meta name="description" content="Bague solitaire en or blanc 18K avec diamant 0.50ct certifie GIA. Prix professionnel a partir de 1 062,50 EUR HT. Livraison rapide, garantie 2 ans.">
<link rel="canonical" href="https://example.com/produit/bague-solitaire-diamant-or-blanc">

<!-- Open Graph -->
<meta property="og:title" content="Bague Solitaire Diamant 0.5ct Or Blanc 18K">
<meta property="og:description" content="Prix professionnel a partir de 1 062,50 EUR HT">
<meta property="og:image" content="https://example.com/images/product-og.jpg">
<meta property="og:type" content="product">

<!-- Twitter Card -->
<meta name="twitter:card" content="product">
<meta name="twitter:title" content="Bague Solitaire Diamant 0.5ct">
<meta name="twitter:image" content="https://example.com/images/product-twitter.jpg">
```

### 9.3 Internal Linking Strategy

- Breadcrumb links to category hierarchy
- Brand name links to brand page
- Related products link to their pages
- Cross-sell products link to their pages
- Collection name links to collection page
- Footer navigation links

### 9.4 URL Structure

Pattern: `/produit/{handle}`

Example: `/produit/bague-solitaire-diamant-or-blanc-18k-050ct`

Rules:
- Lowercase
- Hyphens for spaces
- No special characters
- Include key attributes in URL
- Maximum 100 characters

---

## 10. Component Hierarchy

```
ProductDetailPage (Server Component)
|
+-- ProductJsonLd
+-- BreadcrumbJsonLd
|
+-- ProductDetailClient (Client Component)
    |
    +-- Container
        |
        +-- Grid (2-column desktop)
        |   |
        |   +-- ProductGallery
        |   |   +-- MainImage
        |   |   +-- ZoomOverlay
        |   |   +-- ThumbnailStrip
        |   |   +-- Lightbox (Portal)
        |   |
        |   +-- ProductInfoPanel
        |       +-- Breadcrumbs
        |       +-- ProductInfo
        |       |   +-- BrandLink
        |       |   +-- ProductTitle
        |       |   +-- BadgesRow
        |       |   +-- ReferenceDisplay
        |       |   +-- ShortDescription
        |       |   +-- DetailedInfoGrid
        |       |
        |       +-- VariantSelector
        |       |   +-- OptionGroup (per option type)
        |       |   +-- SizeGuideLink
        |       |
        |       +-- StockStatusBanner
        |       |   +-- StatusIndicator
        |       |   +-- WarehouseSelector (optional)
        |       |
        |       +-- ProductPricing
        |       |   +-- PriceSourceBadge
        |       |   +-- PromotionalBanner (conditional)
        |       |   +-- UnitPriceDisplay
        |       |   +-- VolumeTiersTable
        |       |   +-- TotalCalculation
        |       |   +-- TaxInfoFooter
        |       |
        |       +-- ProductActions
        |           +-- QuantitySelector
        |           +-- AddToCartButton
        |           +-- RequestQuoteButton
        |           +-- SecondaryActionsRow
        |           |   +-- WishlistButton
        |           |   +-- CompareButton
        |           |   +-- PDFButton
        |           +-- DeliveryEstimate
        |
        +-- ProductTabs / ProductAccordions (mobile)
        |   +-- DescriptionTab
        |   +-- SpecificationsTab
        |   +-- CertificationsTab
        |   +-- DocumentsTab
        |   +-- ShippingTab
        |
        +-- RelatedProductsSection
        |   +-- SectionHeader
        |   +-- ProductCarousel
        |       +-- ProductCard (multiple)
        |
        +-- CrossSellSection
        |   +-- SectionHeader
        |   +-- ProductCarousel
        |
        +-- BrandShowcaseSection (conditional)
        |
        +-- RecentlyViewedSection
            +-- SectionHeader
            +-- ProductCarousel

+-- StickyAddToCartBar (mobile, Portal)
+-- ComparisonDrawer (Portal)
+-- QuoteRequestSlideOver (Portal)
+-- ToastNotifications (Portal)
```

---

## 11. Data Requirements

### 11.1 Required Product Fields

| Field | Source | Required | Notes |
|-------|--------|----------|-------|
| id | Medusa | Yes | Product ID |
| handle | Medusa | Yes | URL slug |
| title | Medusa | Yes | Product name |
| subtitle | Medusa | No | Short description |
| description | Medusa | No | Full description (HTML) |
| thumbnail | Medusa | Yes | Main image |
| images | Medusa | Yes | Array with rank |
| variants | Medusa | Yes | With options, prices |
| categories | Medusa | No | Hierarchical |
| brand/marque | Custom Module | No | With logo URL |
| metadata | Medusa | No | Custom fields |

### 11.2 Required Variant Fields

| Field | Type | Required |
|-------|------|----------|
| id | string | Yes |
| title | string | Yes |
| sku | string | Yes |
| barcode | string | No |
| prices | Price[] | Yes |
| inventory_quantity | number | Yes |
| options | Option[] | Yes |
| allow_backorder | boolean | No |

### 11.3 Mocked Data (Not in Backend Yet)

| Data Type | Mock Strategy | Future Source |
|-----------|---------------|---------------|
| Stock levels | Generate from inventory_quantity | Sage sync |
| Volume tiers | Static config per category | Price lists module |
| Delivery times | Static based on mock warehouse | Shipping module |
| Multi-warehouse | Single warehouse mock | Warehouse module |
| Certifications | Metadata field | Certifications module |

### 11.4 API Endpoints Required

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products/[handle]` | GET | Fetch product by handle |
| `/api/products/[id]/related` | GET | Fetch related products |
| `/api/products/[id]/stock` | GET | Real-time stock check |
| `/api/products/[id]/price` | POST | Calculate price with quantity |
| `/api/cart/add` | POST | Add item to cart |
| `/api/quotes` | POST | Create quote request |
| `/api/wishlist/add` | POST | Add to wishlist |
| `/api/comparison/add` | POST | Add to comparison |

---

## 12. Wireframe Descriptions

### 12.1 Desktop Above-the-Fold Wireframe

```
+------------------------------------------------------------------------+
|                              HEADER                                     |
|  [Logo] [Nav: Catalogue | Marques | Soldes] [Search]  [Account] [Cart] |
+------------------------------------------------------------------------+
|                                                                         |
|  Accueil > Bagues > Solitaires > Bague Solitaire Diamant Or Blanc      |
|                                                                         |
+------------------------------------------------------------------------+
|                                                                         |
|  +--------------------------------+   +------------------------------+  |
|  |                                |   | CARTIER                      |  |
|  |                                |   |                              |  |
|  |                                |   | Bague Solitaire Diamant      |  |
|  |        [MAIN PRODUCT          |   | Or Blanc 18K 0.50ct          |  |
|  |            IMAGE]              |   |                              |  |
|  |                                |   | [Nouveau] [Certifie GIA]     |  |
|  |                                |   |                              |  |
|  |         Ref: BG-DR-001         |   | Ref: BG-DR-2024-001          |  |
|  |                                |   | EAN: 3760123456789           |  |
|  |                                |   |                              |  |
|  |     [Zoom actif indicator]     |   | Bague solitaire en or blanc  |  |
|  |                                |   | 18 carats sertie d'un        |  |
|  +--------------------------------+   | diamant brillant...          |  |
|  [o] [o] [o] [o] [o] [o]  <- thumbs   |                              |  |
|                                       +------------------------------+  |
|                                       | Metal:                       |  |
|                                       | [Or 18K] [Or Blanc] [Platine]|  |
|                                       |                              |  |
|                                       | Taille:  [54 (FR)      v]    |  |
|                                       |          Guide des tailles    |  |
|                                       +------------------------------+  |
|                                       | [Green dot] En stock (12)    |  |
|                                       | Entrepot: Paris [Changer]    |  |
|                                       +------------------------------+  |
|                                       | Prix unitaire HT             |  |
|                                       |                              |  |
|                                       | 1 250,00 EUR                 |  |
|                                       | (soit 1 500,00 EUR TTC)      |  |
|                                       |                              |  |
|                                       | Remises quantite:            |  |
|                                       | +---------------------------+ |  |
|                                       | | 1-4    | 1 250,00 | -    | |  |
|                                       | | 5-9    | 1 187,50 | -5%  | |  |
|                                       | | 10-24  | 1 125,00 | -10% | |  |
|                                       | | 25+    | 1 062,50 | -15% | |  |
|                                       | +---------------------------+ |  |
|                                       +------------------------------+  |
|                                       | Qte: [-] [1] [+]    MOQ: 1   |  |
|                                       |                              |  |
|                                       | +==========================+ |  |
|                                       | |  [Cart] AJOUTER AU PANIER| |  |
|                                       | +==========================+ |  |
|                                       |                              |  |
|                                       | +---------------------------+ |  |
|                                       | | [Doc] DEMANDER UN DEVIS   | |  |
|                                       | +---------------------------+ |  |
|                                       |                              |  |
|                                       | [Heart Liste] [Compare] [PDF]|  |
|                                       |                              |  |
|                                       | Livraison: 2-3 jours (Paris) |  |
|                                       +------------------------------+  |
|                                                                         |
+------------------------------------------------------------------------+
```

### 12.2 Mobile Above-the-Fold Wireframe

```
+----------------------------+
|        HEADER              |
| [=] [Logo] [Search] [Cart] |
+----------------------------+
| Bagues > Solitaires        |
+----------------------------+
| CARTIER                    |
|                            |
| Bague Solitaire Diamant    |
| Or Blanc 18K               |
|                            |
| [Nouveau] [GIA]            |
+----------------------------+
|  +----------------------+  |
|  |                      |  |
|  |                      |  |
|  |   [PRODUCT IMAGE]    |  |
|  |                      |  |
|  |                      |  |
|  +----------------------+  |
|        o o o o o o         |
|          1 / 6             |
+----------------------------+
| Ref: BG-DR-2024-001        |
| Bague solitaire en or...   |
+----------------------------+
| Metal:                     |
| [Or 18K] [Or Blanc]        |
|                            |
| Taille:  [54 (FR)      v]  |
+----------------------------+
| [Green] En stock (12)      |
+----------------------------+
| Prix unitaire HT           |
| 1 250,00 EUR               |
|                            |
| v Voir remises quantite    |
+----------------------------+
| Qte: [-] [1] [+]           |
|                            |
| [=== AJOUTER AU PANIER ==] |
|                            |
| [Devis] [Heart] [Compare]  |
+----------------------------+
| v Description              |
| > Caracteristiques         |
| > Documents (3)            |
+----------------------------+

[STICKY BAR when scrolled]
+----------------------------+
| 1 250 EUR [-][1][+][Panier]|
+----------------------------+
```

---

## Appendix A: Component Props Reference

### ProductGallery Props
```typescript
interface ProductGalleryProps {
  media: GalleryMedia[];
  productName: string;
  productRef?: string;
  selectedVariantId?: string;
  variantImages?: Record<string, string[]>;
  showZoomIndicator?: boolean;
  enableLightbox?: boolean;
  className?: string;
}
```

### ProductInfo Props
```typescript
interface ProductInfoProps {
  product: Product;
  badges?: ProductBadge[];
  breadcrumbs?: BreadcrumbItem[];
  showDetailedInfo?: boolean;
  showCollectionInfo?: boolean;
  className?: string;
  onBadgeClick?: (badge: ProductBadge) => void;
}
```

### ProductPricing Props
```typescript
interface ProductPricingProps {
  productId: string;
  basePrice: number;
  compareAtPrice?: number;
  quantity?: number;
  category?: string;
  showVolumeTiers?: boolean;
  showPriceSource?: boolean;
  compact?: boolean;
  className?: string;
  onTierClick?: (tier: VolumeDiscount) => void;
}
```

### ProductActions Props
```typescript
interface ProductActionsProps {
  productId: string;
  productName: string;
  unitPrice: number;
  formatPrice: (price: number) => string;
  stock?: ProductStock;
  minQuantity?: number;
  maxQuantity?: number;
  quantityStep?: number;
  isInWishlist?: boolean;
  onQuantityChange?: (quantity: number) => void;
  onAddToCart: (quantity: number) => Promise<void>;
  onAddToWishlist?: () => void;
  onRequestQuote?: (quantity: number) => void;
  className?: string;
}
```

---

## Appendix B: CSS Variables Reference

```css
:root {
  /* Colors */
  --color-accent: #B8860B; /* Gold for luxury */
  --color-accent-hover: #996B08;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Neutrals */
  --color-neutral-50: #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-200: #E5E7EB;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #374151;
  --color-neutral-900: #111827;

  /* Typography */
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --spacing-unit: 4px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

---

## Appendix C: Implementation Checklist

### Phase 1: Core Components
- [ ] Update ProductGallery with mobile swipe
- [ ] Add variant image switching
- [ ] Implement VariantSelector component
- [ ] Add size guide modal
- [ ] Update ProductPricing with volume tiers table
- [ ] Implement sticky add-to-cart bar (mobile)

### Phase 2: Enhanced Features
- [ ] Add multi-warehouse stock display
- [ ] Implement comparison drawer
- [ ] Add quote request slide-over
- [ ] Create PDF datasheet generator
- [ ] Add recently viewed tracking

### Phase 3: Polish
- [ ] Implement all animations
- [ ] Complete accessibility audit
- [ ] Add structured data validation
- [ ] Performance optimization
- [ ] Cross-browser testing

---

*End of Specification Document*
