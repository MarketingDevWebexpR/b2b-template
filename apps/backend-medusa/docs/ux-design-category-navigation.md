# UX/UI Design Specification: 5-Level Category Navigation System

## B2B Hardware/Tools Distributor - Navigation Design Document

**Version:** 1.0
**Date:** December 2025
**Context:** 206 categories across 5 hierarchy levels
**Root Categories:** Electricite, Plomberie, Outillage, Chauffage-Climatisation, Quincaillerie

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Desktop Mega Menu](#2-desktop-mega-menu)
3. [Mobile Navigation](#3-mobile-navigation)
4. [Visual Design System](#4-visual-design-system)
5. [Interaction Patterns](#5-interaction-patterns)
6. [Loading States & Performance](#6-loading-states--performance)
7. [Accessibility Implementation](#7-accessibility-implementation)
8. [Component Architecture](#8-component-architecture)
9. [Implementation Guidelines](#9-implementation-guidelines)

---

## 1. Design Philosophy

### Core Principles

**Progressive Disclosure for Deep Hierarchies**
With 5 levels of categories, showing everything at once would overwhelm users. Our approach:
- Levels 1-3: Visible in mega menu (desktop) or sliding panels (mobile)
- Levels 4-5: Accessed via intermediary category pages

**Efficiency for B2B Professionals**
Professional buyers value speed over exploration. Design optimizations:
- Keyboard shortcuts for power users
- Quick category search integration
- Recent/frequent categories access
- Clear visual indicators for navigation depth

**Research-Backed Decisions**
Based on Baymard Institute research (source: [Baymard Navigation Best Practices](https://baymard.com/blog/ecommerce-navigation-best-practice)):
- Maximum ~10 subcategories visible at once
- Intermediary category pages for deep hierarchies
- Clear visual hierarchy reduces decision fatigue
- 76% of e-commerce sites have poor navigation - opportunity to excel

---

## 2. Desktop Mega Menu

### 2.1 Layout Structure

```
+------------------------------------------------------------------+
|  [Logo]  | Electricite | Plomberie | Outillage | Chauff.. | Quinc.|
+----------+-------------+-----------+-----------+----------+-------+
|                                                                    |
|  +----------------+  +------------------------------------------+  |
|  |  L2 SIDEBAR    |  |  L3 CATEGORY GRID                        |  |
|  |  [Icon] Cables |  |  +--------+ +--------+ +--------+        |  |
|  |  [Icon] Prises <|  |  | Item > | | Item   | | Item   |        |  |
|  |  [Icon] Tableau|  |  +--------+ +--------+ +--------+        |  |
|  |  [Icon] Eclai..|  |  +--------+ +--------+ +--------+        |  |
|  |  [Icon] Domot..|  |  | Item   | | Item > | | Item   |        |  |
|  |                |  |  +--------+ +--------+ +--------+        |  |
|  |  [See All ->]  |  |                                          |  |
|  +----------------+  +------------------------------------------+  |
|                                                                    |
|  [Featured Banner: Category promotional image or campaign]         |
+--------------------------------------------------------------------+
```

### 2.2 Dimensions & Spacing

| Element | Value | Notes |
|---------|-------|-------|
| Mega menu max-width | 1200px | Centered, with side padding |
| Menu panel height | Auto, max 70vh | Scrollable if content exceeds |
| L2 sidebar width | 280px | Fixed width |
| L3 grid columns | 3-4 columns | Responsive based on category count |
| L3 item min-width | 200px | Ensures readability |
| Padding - container | 32px | Generous whitespace |
| Padding - L2 items | 14px 20px | Comfortable click targets |
| Padding - L3 items | 12px 16px | Compact but accessible |
| Gap between L3 items | 16px | Clear separation |

### 2.3 L1 Navigation Bar

```
State: Default
+------------------+
|  [Icon]          |
|  Electricite     |
+------------------+
Background: transparent
Text: #374151 (Gray-700)
Icon: 24px, stroke 1.5px
Border-bottom: 3px transparent

State: Hover/Focus
+------------------+
|  [Icon]          |
|  Electricite     |
+==================+
Background: #F3F4F6 (Gray-100)
Text: #1E3A5F (Brand Navy)
Border-bottom: 3px #1E3A5F

State: Active (menu open)
+------------------+
|  [Icon]          |
|  Electricite     |
+==================+
Background: #FFFFFF
Text: #1E3A5F
Border-bottom: 3px #E67E22 (Brand Orange)
Box-shadow: 0 4px 6px rgba(0,0,0,0.07)
```

### 2.4 L2 Sidebar Categories

```
State: Default
+----------------------------------+
| [Icon 20px]  Cables et fils    > |
+----------------------------------+
Background: #F8FAFC
Text: #374151, 15px, font-weight: 500
Border-left: 3px transparent

State: Hover/Active
+----------------------------------+
| [Icon 20px]  Cables et fils    > |
+==================================+
Background: #FFFFFF
Text: #1E3A5F, font-weight: 600
Border-left: 3px #E67E22
Icon: filled variant

State: Focus (keyboard)
+----------------------------------+
| [Icon 20px]  Cables et fils    > |
+----------------------------------+
Outline: 2px solid #3B82F6
Outline-offset: -2px
```

### 2.5 L3 Category Grid Items

```
State: Default
+------------------------+
|  Fils rigides          |
|  [Chevron if children] |
+------------------------+
Background: #FFFFFF
Text: #4B5563, 14px
Border: 1px solid #E5E7EB
Border-radius: 6px

State: Hover
+------------------------+
|  Fils rigides        > |
+========================+
Background: #EFF6FF
Text: #1E3A5F
Border: 1px solid #BFDBFE
Transform: translateY(-1px)
Box-shadow: 0 2px 4px rgba(0,0,0,0.05)

State: Has Children (visual indicator)
+------------------------+
|  Fils rigides        > |
+------------------------+
Chevron icon: visible, #6B7280
On hover: chevron #1E3A5F

State: Leaf Node (no children)
+------------------------+
|  Fils rigides          |
+------------------------+
No chevron
Direct link to category page
```

### 2.6 Featured Banner Area

```
+------------------------------------------------------------------+
|  [Category Image 120x80]  |  TITLE: New products in Electricite   |
|                           |  Discover 50+ new references          |
|                           |  [Browse Now ->]                      |
+------------------------------------------------------------------+
Height: 100px
Background: gradient overlay on image
CTA button: Brand orange, white text
Only visible when space permits (wide screens)
```

---

## 3. Mobile Navigation

### 3.1 Navigation Paradigm: Sliding Panel Stack

Instead of nested accordions (which become unusable at 5 levels), we use a **sliding panel approach** with breadcrumb context.

### 3.2 Mobile Drawer Structure

```
CLOSED STATE:
+---------------------------+
| [Hamburger]  Logo  [Cart] |  <- Header
+---------------------------+

OPEN - LEVEL 1:
+---------------------------+
| [X] Fermer    Categories  |  <- Drawer header
+---------------------------+
| [Search field: Rechercher]|  <- Quick search
+---------------------------+
| [Icon] Electricite      > |
| [Icon] Plomberie        > |
| [Icon] Outillage        > |  <- L1 items (full width)
| [Icon] Chauff-Climat.   > |
| [Icon] Quincaillerie    > |
+---------------------------+
Height: 100vh (full screen)
Animation: slide from left (300ms)

LEVEL 2 (after tapping Electricite):
+---------------------------+
| [<] Categories Electricite|  <- Back + current category
+---------------------------+
| [Icon] Voir tout Electr.  |  <- Link to category page
+===========================+
| [Icon] Cables et fils   > |
| [Icon] Prises et inter. > |
| [Icon] Tableaux elect.  > |  <- L2 items
| [Icon] Eclairage        > |
| [Icon] Domotique        > |
+---------------------------+
Animation: slide from right (250ms)
Previous panel slides left, stays in DOM

LEVEL 3+ (deeper levels):
+---------------------------+
| [<] Cables     Fils elec. |  <- Truncated breadcrumb
+---------------------------+
| Electricite > Cables > Fi.|  <- Full path (scrollable)
+---------------------------+
| Voir tous les Fils elect. |  <- Category page link
+===========================+
|   Fils rigides            |  <- No chevron = leaf
|   Fils souples            |
|   Fils de terre           |
|   Fils speciaux         > |  <- Has children
+---------------------------+
```

### 3.3 Mobile Item Specifications

| Element | Value |
|---------|-------|
| Item height | 56px minimum (touch target) |
| Item padding | 16px horizontal |
| Icon size | 24px |
| Icon-to-text gap | 16px |
| Chevron size | 20px |
| Font size | 16px (prevents iOS zoom) |
| Font weight | 500 (medium) |
| Divider | 1px solid #E5E7EB |

### 3.4 Mobile Gestures

| Gesture | Action | Threshold |
|---------|--------|-----------|
| Tap item with `>` | Slide to next level | - |
| Tap item without `>` | Navigate to category page | - |
| Tap back button | Slide to previous level | - |
| Swipe right | Go back one level | >100px, velocity >0.3 |
| Tap overlay | Close drawer | - |
| Swipe left on drawer | Close drawer | >150px |

### 3.5 Mobile Header Breadcrumb

```
Level 1: "Categories"
Level 2: "[<] Categories    Electricite"
Level 3: "[<] Electricite   Cables"
Level 4: "[<] Cables        Fils elect."
Level 5: "[<] Fils elect.   Rigides"

Full breadcrumb trail (below header, scrollable):
"Electricite > Cables > Fils electriques > Rigides"
```

---

## 4. Visual Design System

### 4.1 Color Palette

```css
/* Primary Brand Colors */
--color-brand-navy: #1E3A5F;        /* Primary actions, active states */
--color-brand-orange: #E67E22;       /* CTAs, highlights, accents */

/* Neutral Palette */
--color-gray-50: #F9FAFB;           /* Page background */
--color-gray-100: #F3F4F6;          /* Subtle backgrounds */
--color-gray-200: #E5E7EB;          /* Borders, dividers */
--color-gray-300: #D1D5DB;          /* Disabled states */
--color-gray-400: #9CA3AF;          /* Placeholder text */
--color-gray-500: #6B7280;          /* Secondary text */
--color-gray-600: #4B5563;          /* Body text */
--color-gray-700: #374151;          /* Primary text */
--color-gray-800: #1F2937;          /* Headings */
--color-gray-900: #111827;          /* High emphasis text */

/* Semantic Colors */
--color-success: #059669;           /* Confirmation states */
--color-warning: #D97706;           /* Attention states */
--color-error: #DC2626;             /* Error states */

/* Interactive States */
--color-hover-bg: #EFF6FF;          /* Light blue hover */
--color-focus-ring: #3B82F6;        /* Focus indicator */
--color-active-bg: #DBEAFE;         /* Active/pressed state */
```

### 4.2 Typography Scale

```css
/* Font Family */
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Type Scale */
--text-xs: 0.75rem;     /* 12px - Breadcrumb, metadata */
--text-sm: 0.875rem;    /* 14px - L3 items, secondary text */
--text-base: 1rem;      /* 16px - Body, mobile items */
--text-lg: 1.125rem;    /* 18px - L2 headings */
--text-xl: 1.25rem;     /* 20px - L1 categories */

/* Font Weights */
--font-normal: 400;     /* Body text */
--font-medium: 500;     /* Navigation items */
--font-semibold: 600;   /* Active states, headings */
--font-bold: 700;       /* Emphasis */

/* Line Heights */
--leading-tight: 1.25;  /* Headings */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.75;/* Readable paragraphs */

/* Letter Spacing */
--tracking-tight: -0.025em;  /* Headings */
--tracking-normal: 0;        /* Body */
--tracking-wide: 0.025em;    /* Uppercase labels */
```

### 4.3 Spacing System (8px base)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 4.4 Shadow System

```css
/* Subtle shadow for cards */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Default shadow for dropdowns */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Prominent shadow for mega menu */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Elevated shadow for mobile drawer */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### 4.5 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.375rem;  /* 6px - Buttons, inputs */
--radius-lg: 0.5rem;    /* 8px - Cards, panels */
--radius-xl: 0.75rem;   /* 12px - Large containers */
```

### 4.6 Icon System

```
Style: Outlined (Lucide or similar)
Stroke width: 1.5px (default), 2px (emphasis)
Sizes:
  - 16px: Inline indicators (chevrons)
  - 20px: L2/L3 category icons
  - 24px: L1 category icons, mobile items
  - 32px: Featured/empty states

Category Icon Mapping (suggested):
  Electricite:         Zap / Lightning bolt
  Plomberie:           Droplet / Wrench
  Outillage:           Wrench / Hammer
  Chauffage-Climat.:   Thermometer / Snowflake
  Quincaillerie:       Settings / Nut-bolt
```

---

## 5. Interaction Patterns

### 5.1 Desktop Hover Behavior

```javascript
// Timing Constants
const HOVER_OPEN_DELAY = 100;    // ms before opening menu
const HOVER_CLOSE_DELAY = 300;   // ms before closing menu
const L2_SWITCH_DELAY = 50;      // ms debounce for L2 hover

// Intent Detection Pattern
User hovers L1 item
  -> Start 100ms timer
  -> If cursor stays (intent confirmed)
     -> Open mega menu with fade+slide animation
  -> If cursor leaves before 100ms
     -> Cancel (accidental hover)

User leaves mega menu area
  -> Start 300ms timer
  -> If cursor returns within 300ms
     -> Cancel close (user is navigating)
  -> If timer completes
     -> Close mega menu

User hovers different L1 item (menu already open)
  -> Immediate switch (no delay)
  -> Content transitions via crossfade
```

### 5.2 Desktop Click Behavior

```
L1 Category: Click navigates to category landing page
L2 Category: Click navigates to category page
L3 Category with children: Click navigates to intermediary page
L3 Category leaf: Click navigates to product listing

"See All [Category]" link: Navigates to L2 category page
```

### 5.3 Keyboard Navigation

```
TAB KEY FLOW:
[Skip Link] -> [Logo] -> [L1: Electricite] -> [L1: Plomberie] -> ...

When focused on L1 item:
  Enter/Space: Open mega menu, focus first L2 item
  ArrowDown:   Open mega menu, focus first L2 item
  ArrowRight:  Move to next L1 item
  ArrowLeft:   Move to previous L1 item

When mega menu is open (focus in L2):
  Tab:         Move through L2 items sequentially
  ArrowDown:   Move to next L2 item
  ArrowUp:     Move to previous L2 item
  ArrowRight:  Move focus to L3 grid
  Enter:       Navigate to L2 category page
  Escape:      Close menu, return focus to L1 trigger

When focus in L3 grid:
  Tab:         Move through L3 items (left-to-right, top-to-bottom)
  ArrowKeys:   Navigate grid spatially
  Enter:       Navigate to L3 category (or page if leaf)
  ArrowLeft:   Return focus to L2 sidebar
  Escape:      Close menu, return focus to L1 trigger
```

### 5.4 Mobile Touch Interactions

```
Tap item with chevron (>):
  -> Visual feedback (background color change)
  -> 150ms delay (tactile acknowledgment)
  -> Panel slides in from right (250ms ease-out)
  -> New panel takes focus
  -> Previous panel accessible via back button

Tap item without chevron:
  -> Visual feedback
  -> Navigate to category page
  -> Drawer closes automatically

Tap back button / Swipe right:
  -> Current panel slides out to right
  -> Previous panel slides in from left
  -> Focus returns to parent list
  -> Scroll position restored

Tap "See All [Category]":
  -> Navigate to category page
  -> Drawer closes

Tap overlay (outside drawer):
  -> Drawer closes
  -> Focus returns to hamburger button
```

### 5.5 Transition Specifications

```css
/* Mega menu open/close */
.mega-menu {
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out,
    visibility 150ms;
}
.mega-menu[data-state="closed"] {
  opacity: 0;
  transform: translateY(-8px);
  visibility: hidden;
  pointer-events: none;
}
.mega-menu[data-state="open"] {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}

/* L2 content switch */
.l3-content {
  transition: opacity 100ms ease-in-out;
}

/* Mobile panel slide */
.mobile-panel {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-panel[data-position="offscreen-right"] {
  transform: translateX(100%);
}
.mobile-panel[data-position="active"] {
  transform: translateX(0);
}
.mobile-panel[data-position="offscreen-left"] {
  transform: translateX(-30%);
  opacity: 0.5;
}

/* Hover states */
.menu-item {
  transition:
    background-color 100ms ease,
    color 100ms ease,
    border-color 100ms ease;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Loading States & Performance

### 6.1 Data Loading Strategy

```
INITIAL PAGE LOAD (Critical Path):
├── L1 categories (5 items)
├── L2 categories for all L1s (~25-30 items)
└── Icons (inline SVG sprite)
Total: ~5KB gzipped, rendered server-side

ON L1 HOVER (Prefetch):
├── L3 categories for hovered L1
├── Featured image URL
└── Category metadata
Loaded after 100ms hover intent detected

ON NAVIGATION (On-demand):
├── L4-L5 categories
├── Product counts
└── Full category images
Loaded when user navigates to intermediary page
```

### 6.2 Skeleton Loading States

```
Desktop Mega Menu Skeleton:
+----------------+------------------------------------------+
| ████████░░░░░  |  +------+ +------+ +------+ +------+    |
| ████████░░░░░  |  |██████| |██████| |██████| |██████|    |
| ████████░░░░░  |  |░░░░░░| |░░░░░░| |░░░░░░| |░░░░░░|    |
| ████████░░░░░  |  +------+ +------+ +------+ +------+    |
| ████████░░░░░  |  +------+ +------+ +------+              |
|                |  |██████| |██████| |██████|              |
+----------------+------------------------------------------+

Skeleton specifications:
  Background: linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%)
  Animation: shimmer 1.5s infinite
  Border-radius: 4px

Mobile Panel Skeleton:
+---------------------------+
| [<] Loading...            |
+---------------------------+
| ░░░░░░░░░░░░░░░░░░░░░░░░ |
| ████████████░░░░░░░░░░░░ |
+---------------------------+
| ████████████░░░░░░░░░░░░ |
| ████████████░░░░░░░░░░░░ |
| ████████████░░░░░░░░░░░░ |
+---------------------------+
```

### 6.3 Caching Strategy

```typescript
// Cache configuration
const CACHE_CONFIG = {
  // Categories rarely change
  categories: {
    storage: 'sessionStorage',
    ttl: 30 * 60 * 1000,  // 30 minutes
    key: 'category_tree_v1'
  },

  // User's recent categories for quick access
  recentCategories: {
    storage: 'localStorage',
    ttl: 7 * 24 * 60 * 60 * 1000,  // 7 days
    maxItems: 10
  },

  // Prefetched L3 data
  l3Data: {
    storage: 'memory',
    maxSize: 20  // Keep last 20 L1 expansions
  }
};

// Stale-while-revalidate pattern
async function getCategories(parentId: string) {
  const cached = cache.get(parentId);

  if (cached && !isStale(cached)) {
    return cached.data;
  }

  if (cached && isStale(cached)) {
    // Return stale data immediately
    // Refresh in background
    refreshInBackground(parentId);
    return cached.data;
  }

  // No cache, fetch and wait
  return await fetchCategories(parentId);
}
```

### 6.4 Prefetching Logic

```typescript
// Prefetch on L1 hover
function handleL1Hover(categoryId: string) {
  // Clear any pending prefetch
  clearTimeout(prefetchTimer);

  // Wait for hover intent
  prefetchTimer = setTimeout(() => {
    // Prefetch L3 data for this category
    prefetchL3Categories(categoryId);

    // Prefetch category page data
    prefetchCategoryPage(categoryId);

    // Preload featured image
    preloadImage(category.featuredImage);
  }, 100);
}

// Prefetch adjacent L1 categories
function handleMenuOpen(categoryId: string) {
  const adjacent = getAdjacentCategories(categoryId);

  // Low priority prefetch for adjacent categories
  requestIdleCallback(() => {
    adjacent.forEach(cat => prefetchL3Categories(cat.id));
  });
}
```

### 6.5 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial nav render | <100ms | First Contentful Paint |
| Mega menu open | <200ms | Time to interactive |
| L3 content load | <150ms | After L2 hover |
| Mobile panel transition | <300ms | Animation complete |
| Category page navigation | <500ms | Time to first byte |
| Bundle size (nav) | <15KB | Gzipped |
| Icon sprite | <5KB | Gzipped |
| LCP | <2.5s | Core Web Vital |
| FID | <100ms | Core Web Vital |
| CLS | <0.1 | Core Web Vital |

---

## 7. Accessibility Implementation

### 7.1 ARIA Structure

```html
<!-- Skip Navigation Link -->
<a href="#main-content" class="skip-link">
  Aller au contenu principal
</a>

<!-- Main Navigation -->
<nav aria-label="Navigation principale des categories">
  <ul role="menubar" aria-label="Categories de produits">

    <!-- L1 Item -->
    <li role="none">
      <a
        role="menuitem"
        href="/electricite"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="mega-menu-electricite"
        id="nav-electricite"
      >
        <svg aria-hidden="true"><!-- icon --></svg>
        <span>Electricite</span>
      </a>

      <!-- Mega Menu Panel -->
      <div
        role="menu"
        id="mega-menu-electricite"
        aria-labelledby="nav-electricite"
        aria-hidden="true"
      >
        <!-- L2 Sidebar -->
        <div role="group" aria-label="Sous-categories">
          <ul role="menu">
            <li role="none">
              <a
                role="menuitem"
                href="/electricite/cables"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Cables et fils
              </a>
            </li>
            <!-- more L2 items -->
          </ul>
        </div>

        <!-- L3 Grid -->
        <div role="group" aria-label="Types de produits">
          <ul role="menu">
            <li role="none">
              <a role="menuitem" href="/electricite/cables/rigides">
                Fils rigides
                <span class="sr-only">(voir les produits)</span>
              </a>
            </li>
            <!-- more L3 items -->
          </ul>
        </div>
      </div>
    </li>

    <!-- more L1 items -->
  </ul>
</nav>

<!-- Live Region for Announcements -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
  id="nav-announcements"
>
  <!-- Dynamic announcements inserted here -->
</div>
```

### 7.2 Screen Reader Announcements

```javascript
// Announce menu open
announceToScreenReader(
  `Menu Electricite ouvert. ${count} sous-categories disponibles.
   Utilisez les fleches pour naviguer.`
);

// Announce category change
announceToScreenReader(
  `Cables et fils selectionne. ${count} types de produits affiches.`
);

// Announce navigation
announceToScreenReader(
  `Navigation vers la page Fils rigides.`
);

// Mobile: Announce level change
announceToScreenReader(
  `Niveau 3 sur 5. Electricite, Cables et fils, Fils electriques.
   ${count} options disponibles.`
);
```

### 7.3 Focus Management

```typescript
// Focus trap within mega menu
function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a[href], button, input, [tabindex]:not([tabindex="-1"])'
  );

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// Return focus on close
function closeMenu(trigger: HTMLElement) {
  menuPanel.setAttribute('aria-hidden', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.focus(); // Return focus to trigger
}
```

### 7.4 Color Contrast Requirements

| Element | Foreground | Background | Ratio | WCAG |
|---------|------------|------------|-------|------|
| Body text | #374151 | #FFFFFF | 8.6:1 | AAA |
| Secondary text | #6B7280 | #FFFFFF | 5.0:1 | AA |
| Link text | #1E3A5F | #FFFFFF | 9.7:1 | AAA |
| Hover state | #1E3A5F | #EFF6FF | 9.1:1 | AAA |
| Focus ring | #3B82F6 | any | 3.0:1+ | AA |
| Active indicator | #E67E22 | #FFFFFF | 3.1:1 | AA (large) |

### 7.5 Focus Visible Styles

```css
/* High-visibility focus indicator */
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Remove default outline when using focus-visible */
:focus:not(:focus-visible) {
  outline: none;
}

/* Enhanced focus for keyboard users */
.menu-item:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: -2px;
  background-color: var(--color-hover-bg);
}

/* Skip link styling */
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: 9999;
  padding: 16px 24px;
  background: var(--color-brand-navy);
  color: white;
  text-decoration: none;
  border-radius: 0 0 8px 8px;
  transition: top 200ms;
}

.skip-link:focus {
  top: 0;
}
```

### 7.6 Touch Target Sizes

```css
/* Minimum touch targets */
.mobile-nav-item {
  min-height: 48px;
  padding: 12px 16px;
}

/* Ensure spacing between targets */
.mobile-nav-item + .mobile-nav-item {
  margin-top: 0; /* Divider provides visual separation */
}

/* Expand clickable area for smaller visual elements */
.chevron-button {
  /* Visual size: 20x20 */
  /* Touch target: 44x44 */
  position: relative;
  padding: 12px;
  margin: -12px;
}
```

---

## 8. Component Architecture

### 8.1 Directory Structure

```
src/components/navigation/
├── CategoryNav.tsx                 # Root orchestrator component
├── CategoryNav.module.css          # Scoped styles
├── index.ts                        # Public exports
│
├── hooks/
│   ├── useCategoryData.ts          # Data fetching, caching, prefetch
│   ├── useKeyboardNavigation.ts    # Keyboard event handling
│   ├── useFocusManagement.ts       # Focus trap, restoration
│   ├── useHoverIntent.ts           # Hover timing logic
│   ├── useSwipeGesture.ts          # Mobile swipe detection
│   └── useMediaQuery.ts            # Responsive breakpoints
│
├── context/
│   ├── NavigationContext.tsx       # Shared navigation state
│   └── types.ts                    # TypeScript interfaces
│
├── desktop/
│   ├── DesktopNav.tsx              # Desktop navigation container
│   ├── NavBar.tsx                  # L1 horizontal navigation
│   ├── NavItem.tsx                 # L1 nav item (trigger)
│   ├── MegaMenu.tsx                # Mega menu panel container
│   ├── CategorySidebar.tsx         # L2 category sidebar
│   ├── CategoryGrid.tsx            # L3 category grid
│   ├── CategoryCard.tsx            # L3 individual category card
│   └── FeaturedBanner.tsx          # Promotional banner area
│
├── mobile/
│   ├── MobileNav.tsx               # Mobile navigation container
│   ├── HamburgerButton.tsx         # Menu trigger button
│   ├── NavDrawer.tsx               # Slide-out drawer
│   ├── NavPanel.tsx                # Reusable level panel
│   ├── NavPanelItem.tsx            # Individual menu item
│   ├── BreadcrumbHeader.tsx        # Navigation header with back
│   └── NavigationStack.tsx         # Panel stack manager
│
├── shared/
│   ├── CategoryIcon.tsx            # Icon renderer (SVG sprite)
│   ├── IconSprite.tsx              # Inline SVG sprite sheet
│   ├── Chevron.tsx                 # Direction indicator
│   ├── SkeletonLoader.tsx          # Loading skeleton states
│   ├── LiveRegion.tsx              # Screen reader announcements
│   └── SkipLink.tsx                # Accessibility skip link
│
└── utils/
    ├── categoryTree.ts             # Tree traversal utilities
    ├── prefetch.ts                 # Prefetching logic
    ├── accessibility.ts            # A11y helper functions
    └── constants.ts                # Timing, sizing, breakpoints
```

### 8.2 Core Interfaces

```typescript
// types.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: 1 | 2 | 3 | 4 | 5;
  childCount: number;
  hasChildren: boolean;
  metadata: {
    icon?: string;          // Icon identifier
    image?: string;         // Category image URL
    description?: string;   // Short description
    productCount?: number;  // Number of products
  };
}

export interface CategoryTree {
  byId: Map<string, Category>;
  byParentId: Map<string, Category[]>;
  rootCategories: Category[];
}

export interface NavigationState {
  // Desktop state
  isMenuOpen: boolean;
  activeL1Id: string | null;
  activeL2Id: string | null;
  hoveredItemId: string | null;

  // Mobile state
  isDrawerOpen: boolean;
  navigationStack: string[];  // Stack of category IDs
  scrollPositions: Map<string, number>;

  // Shared state
  isLoading: boolean;
  loadingCategoryId: string | null;
  focusedItemId: string | null;

  // Data
  categories: CategoryTree;
  loadedL3: Set<string>;  // L1 IDs with L3 data loaded
}

export interface NavigationActions {
  // Desktop
  openMenu: (l1Id: string) => void;
  closeMenu: () => void;
  setActiveL2: (l2Id: string) => void;

  // Mobile
  openDrawer: () => void;
  closeDrawer: () => void;
  pushLevel: (categoryId: string) => void;
  popLevel: () => void;
  resetStack: () => void;

  // Shared
  setFocusedItem: (itemId: string | null) => void;
  prefetchCategory: (categoryId: string) => void;
}

// Hook return types
export interface UseCategoryDataReturn {
  categories: CategoryTree;
  getChildren: (parentId: string | null) => Category[];
  getCategory: (id: string) => Category | undefined;
  getPath: (categoryId: string) => Category[];
  isLoading: boolean;
  prefetch: (categoryId: string) => void;
}

export interface UseKeyboardNavigationReturn {
  handleKeyDown: (event: KeyboardEvent) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}
```

### 8.3 Key Component Implementations

```tsx
// CategoryNav.tsx - Root orchestrator
export function CategoryNav() {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <NavigationProvider>
      <SkipLink href="#main-content">
        Aller au contenu principal
      </SkipLink>

      <nav aria-label="Navigation principale des categories">
        {isMobile ? <MobileNav /> : <DesktopNav />}
      </nav>

      <LiveRegion />
    </NavigationProvider>
  );
}

// DesktopNav.tsx
export function DesktopNav() {
  const { categories, activeL1Id, isMenuOpen } = useNavigation();
  const { handleKeyDown } = useKeyboardNavigation();

  return (
    <div className={styles.desktopNav} onKeyDown={handleKeyDown}>
      <NavBar categories={categories.rootCategories} />

      {isMenuOpen && activeL1Id && (
        <MegaMenu categoryId={activeL1Id} />
      )}
    </div>
  );
}

// MegaMenu.tsx
export function MegaMenu({ categoryId }: { categoryId: string }) {
  const { getChildren, isLoading } = useCategoryData();
  const { activeL2Id, setActiveL2 } = useNavigation();

  const l2Categories = getChildren(categoryId);
  const l3Categories = activeL2Id ? getChildren(activeL2Id) : [];

  return (
    <div
      className={styles.megaMenu}
      role="menu"
      aria-label={`Sous-categories`}
    >
      <CategorySidebar
        categories={l2Categories}
        activeId={activeL2Id}
        onHover={setActiveL2}
      />

      {isLoading ? (
        <SkeletonLoader variant="grid" count={8} />
      ) : (
        <CategoryGrid categories={l3Categories} />
      )}

      <FeaturedBanner categoryId={categoryId} />
    </div>
  );
}

// MobileNav.tsx
export function MobileNav() {
  const { isDrawerOpen, openDrawer, closeDrawer } = useNavigation();

  return (
    <>
      <HamburgerButton
        isOpen={isDrawerOpen}
        onClick={isDrawerOpen ? closeDrawer : openDrawer}
      />

      <NavDrawer isOpen={isDrawerOpen} onClose={closeDrawer}>
        <NavigationStack />
      </NavDrawer>
    </>
  );
}

// NavigationStack.tsx
export function NavigationStack() {
  const { navigationStack, categories, popLevel } = useNavigation();
  const { handleSwipe } = useSwipeGesture({ onSwipeRight: popLevel });

  return (
    <div className={styles.stack} {...handleSwipe}>
      {navigationStack.map((categoryId, index) => (
        <NavPanel
          key={categoryId || 'root'}
          categoryId={categoryId}
          isActive={index === navigationStack.length - 1}
          position={getPosition(index, navigationStack.length)}
        />
      ))}
    </div>
  );
}
```

---

## 9. Implementation Guidelines

### 9.1 Development Phases

**Phase 1: Foundation (Week 1-2)**
- [ ] Set up component structure and TypeScript interfaces
- [ ] Implement category data fetching and caching hooks
- [ ] Create base navigation context and state management
- [ ] Build icon sprite system

**Phase 2: Desktop Navigation (Week 2-3)**
- [ ] Implement L1 navigation bar with hover intent
- [ ] Build mega menu panel with L2 sidebar
- [ ] Add L3 category grid with loading states
- [ ] Implement keyboard navigation
- [ ] Add focus management and ARIA attributes

**Phase 3: Mobile Navigation (Week 3-4)**
- [ ] Build drawer component with overlay
- [ ] Implement sliding panel stack
- [ ] Add swipe gesture support
- [ ] Build breadcrumb header navigation
- [ ] Mobile keyboard and screen reader testing

**Phase 4: Performance Optimization (Week 4-5)**
- [ ] Implement prefetching strategy
- [ ] Add skeleton loading states
- [ ] Optimize bundle size and code splitting
- [ ] Test and tune animation performance
- [ ] Implement caching layer

**Phase 5: Polish & Testing (Week 5-6)**
- [ ] Cross-browser testing
- [ ] Accessibility audit (automated + manual)
- [ ] Screen reader testing (NVDA, VoiceOver, JAWS)
- [ ] Performance benchmarking
- [ ] User testing and iteration

### 9.2 Testing Checklist

**Functional Testing:**
- [ ] All 206 categories accessible
- [ ] Correct parent-child relationships
- [ ] All navigation paths work
- [ ] Search integration functions
- [ ] Links navigate to correct pages

**Interaction Testing:**
- [ ] Hover intent timing feels natural
- [ ] No accidental menu opens/closes
- [ ] Mobile gestures responsive
- [ ] Touch targets adequate size
- [ ] Animation smooth (60fps)

**Accessibility Testing:**
- [ ] Screen reader navigation complete
- [ ] Keyboard-only navigation possible
- [ ] Focus visible at all times
- [ ] Color contrast passes
- [ ] Motion preferences respected
- [ ] Touch targets 44px+

**Performance Testing:**
- [ ] Initial render <100ms
- [ ] Menu open <200ms
- [ ] No layout shift (CLS <0.1)
- [ ] Bundle size <15KB
- [ ] Works on slow 3G

### 9.3 Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| iOS Safari | 14+ | Full support |
| Chrome Android | 90+ | Full support |

### 9.4 Success Metrics

**User Experience:**
- Category finding success rate: >90%
- Time to find category: <10 seconds average
- Navigation abandonment rate: <5%
- User satisfaction score: >4.0/5.0

**Performance:**
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- First Input Delay: <100ms
- Cumulative Layout Shift: <0.1
- Time to Interactive: <3.5s

**Accessibility:**
- Lighthouse accessibility score: 100
- axe-core: 0 violations
- Manual screen reader audit: Pass
- Keyboard navigation audit: Pass

---

## Appendix A: Reference Implementations

### Industry Benchmarks Analyzed

1. **McMaster-Carr** (mcmaster.com)
   - Two-tier navigation strategy
   - Sprite sheets for icons
   - Deferred script loading
   - Service worker caching

2. **Grainger** (grainger.com)
   - Extensive mega menu
   - Category images prominent
   - Mobile accordion pattern

3. **RS Components** (rscomponents.com)
   - Deep hierarchy handling
   - Icon-forward navigation
   - Technical product focus

### Research Sources

- [Baymard Institute: Homepage & Navigation UX Best Practices](https://baymard.com/blog/ecommerce-navigation-best-practice)
- [NN/g: UX Guidelines for Ecommerce](https://www.nngroup.com/articles/ecommerce-homepages-listing-pages/)
- [W3C WAI: Flyout Menus Tutorial](https://www.w3.org/WAI/tutorials/menus/flyout/)
- [Smashing Magazine: Guidelines for Navigation](https://www.smashingmagazine.com/2013/11/guidelines-navigation-categories-ecommerce-study/)

---

## Appendix B: Accessibility Compliance Matrix

| WCAG Criterion | Level | Implementation |
|----------------|-------|----------------|
| 1.1.1 Non-text Content | A | Icons have text labels, images have alt text |
| 1.3.1 Info and Relationships | A | Semantic HTML, ARIA roles |
| 1.3.2 Meaningful Sequence | A | Logical tab order, reading order |
| 1.4.1 Use of Color | A | Not color-only indicators |
| 1.4.3 Contrast (Minimum) | AA | 4.5:1 text, 3:1 UI |
| 1.4.11 Non-text Contrast | AA | Focus indicators visible |
| 2.1.1 Keyboard | A | Full keyboard navigation |
| 2.1.2 No Keyboard Trap | A | Escape closes menus |
| 2.4.1 Bypass Blocks | A | Skip navigation link |
| 2.4.3 Focus Order | A | Logical focus sequence |
| 2.4.4 Link Purpose | A | Clear link text |
| 2.4.7 Focus Visible | AA | High-visibility focus styles |
| 2.5.5 Target Size | AAA | 44px minimum touch targets |
| 3.2.3 Consistent Navigation | AA | Same navigation on all pages |
| 4.1.2 Name, Role, Value | A | ARIA attributes complete |

---

*Document prepared for B2B Hardware/Tools Distributor*
*Navigation system designed for 206 categories across 5 levels*
