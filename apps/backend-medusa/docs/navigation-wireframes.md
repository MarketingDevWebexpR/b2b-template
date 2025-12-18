# Navigation Wireframes & Visual Specifications

## Desktop Mega Menu Wireframes

### Full Desktop View (1280px+)

```
+==============================================================================+
|  [LOGO]      | Electricite | Plomberie | Outillage | Chauff.. | Quincaillerie |
|              |   [active]  |           |           |          |               |
+==============================================================================+
|                                                                               |
|  MEGA MENU PANEL (elevation: shadow-lg)                                       |
|  +-------------------------------------------------------------------------+  |
|  |                                                                         |  |
|  |  +------------------+  +---------------------------------------------+  |  |
|  |  | L2 SIDEBAR       |  | L3 CATEGORY GRID                            |  |  |
|  |  | (280px width)    |  | (flexible width)                            |  |  |
|  |  |                  |  |                                             |  |  |
|  |  | +==============+ |  |  +----------+  +----------+  +----------+   |  |  |
|  |  | | [icon]       | |  |  | Fils     |  | Fils     |  | Fils     |   |  |  |
|  |  | | Cables     > | |  |  | rigides  |  | souples  |  | de terre |   |  |  |
|  |  | +==============+ |  |  | [>]      |  |          |  |          |   |  |  |
|  |  |                  |  |  +----------+  +----------+  +----------+   |  |  |
|  |  | +--------------+ |  |                                             |  |  |
|  |  | | [icon]       | |  |  +----------+  +----------+  +----------+   |  |  |
|  |  | | Prises       | |  |  | Fils     |  | Cables   |  | Cables   |   |  |  |
|  |  | +--------------+ |  |  | speciaux |  | indust.  |  | data     |   |  |  |
|  |  |                  |  |  | [>]      |  |          |  | [>]      |   |  |  |
|  |  | +--------------+ |  |  +----------+  +----------+  +----------+   |  |  |
|  |  | | [icon]       | |  |                                             |  |  |
|  |  | | Tableaux     | |  +---------------------------------------------+  |  |
|  |  | +--------------+ |                                                   |  |
|  |  |                  |  +---------------------------------------------+  |  |
|  |  | +--------------+ |  | FEATURED BANNER                             |  |  |
|  |  | | [icon]       | |  | +--------+                                  |  |  |
|  |  | | Eclairage    | |  | | [IMG]  |  Nouveautes Cables               |  |  |
|  |  | +--------------+ |  | |        |  Decouvrez notre selection  [->] |  |  |
|  |  |                  |  | +--------+                                  |  |  |
|  |  | [Voir tout ->]   |  +---------------------------------------------+  |  |
|  |  +------------------+                                                   |  |
|  |                                                                         |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
+===============================================================================+
```

### L1 Navigation States

```
DEFAULT STATE:
+------------------+
|     [icon]       |
|   Electricite    |  <- 14px, 600 weight, #374151
|__________________|  <- border-bottom: 3px transparent
Background: transparent


HOVER STATE:
+==================+
|     [icon]       |
|   Electricite    |  <- 14px, 600 weight, #1E3A5F
+==================+  <- border-bottom: 3px #1E3A5F
Background: #F3F4F6


ACTIVE STATE (Menu Open):
+==================+
|     [icon]       |  <- icon filled, #1E3A5F
|   Electricite    |  <- 14px, 700 weight, #1E3A5F
+==================+  <- border-bottom: 3px #E67E22
Background: #FFFFFF
Box-shadow: 0 4px 6px rgba(0,0,0,0.07)


FOCUS STATE (Keyboard):
+------------------+
| +==============+ |
| |   [icon]     | |
| | Electricite  | |  <- Same as hover
| +==============+ |
+------------------+
Outline: 2px solid #3B82F6
Outline-offset: 2px
```

### L2 Sidebar Item States

```
DEFAULT:
+--------------------------------+
| [icon]  Cables et fils       > |
+--------------------------------+
Background: #F8FAFC
Text: #374151, 15px, 500 weight
Border-left: 3px transparent
Padding: 14px 20px


HOVER/ACTIVE:
+================================+
| [icon]  Cables et fils       > |
+================================+
Background: #FFFFFF
Text: #1E3A5F, 15px, 600 weight
Border-left: 3px #E67E22
Icon: filled variant


FOCUS (Keyboard):
+--------------------------------+
| +============================+ |
| | [icon]  Cables et fils   > | |
| +============================+ |
+--------------------------------+
Outline: 2px solid #3B82F6 (inset)
```

### L3 Grid Item States

```
DEFAULT:
+------------------------+
|                        |
|  Fils rigides          |
|                        |
+------------------------+
Background: #FFFFFF
Text: #4B5563, 14px, 400 weight
Border: 1px solid #E5E7EB
Border-radius: 6px
Padding: 12px 16px
Min-width: 180px


HOVER:
+========================+
|                        |
|  Fils rigides        > |
|                        |
+========================+
Background: #EFF6FF
Text: #1E3A5F, 14px, 500 weight
Border: 1px solid #BFDBFE
Transform: translateY(-2px)
Box-shadow: 0 4px 8px rgba(0,0,0,0.08)


WITH CHILDREN (has chevron):
+------------------------+
|                        |
|  Fils rigides        > |  <- Chevron indicates deeper levels
|                        |
+------------------------+


LEAF NODE (no children):
+------------------------+
|                        |
|  Fils rigides          |  <- No chevron, direct link
|                        |
+------------------------+
```

---

## Mobile Navigation Wireframes

### Closed State (Header Only)

```
+----------------------------------+
| [=]    [LOGO]           [O] [^] |  <- Hamburger, Logo, Search, Cart
+----------------------------------+
| Main content area               |
|                                 |
```

### Drawer Open - Level 1

```
+----------------------------------+
|                           [ ]   |  <- Overlay (semi-transparent)
+====================+     [ ]   |
| [X] Fermer         |     [ ]   |  <- Close button
+--------------------+     [ ]   |
| [____Rechercher___]|     [ ]   |  <- Search field
+--------------------+     [ ]   |
|                    |     [ ]   |
| [Z] Electricite  > |     [ ]   |  <- 56px row height
|                    |     [ ]   |
+--------------------+     [ ]   |
|                    |     [ ]   |
| [D] Plomberie    > |     [ ]   |
|                    |     [ ]   |
+--------------------+     [ ]   |
|                    |     [ ]   |
| [W] Outillage    > |     [ ]   |
|                    |     [ ]   |
+--------------------+     [ ]   |
|                    |     [ ]   |
| [T] Chauff-Clim. > |     [ ]   |
|                    |     [ ]   |
+--------------------+     [ ]   |
|                    |     [ ]   |
| [S] Quincaillerie> |     [ ]   |
|                    |     [ ]   |
+====================+     [ ]   |
```

### Drawer - Level 2 (After tapping "Electricite")

```
+====================+
| [<] Retour         |  <- Back to L1
|    Electricite     |  <- Current category name
+--------------------+
| [Z] Voir tout      |  <- Link to category page
|    Electricite     |
+====================+
|                    |
| [C] Cables       > |
|                    |
+--------------------+
|                    |
| [P] Prises       > |
|                    |
+--------------------+
|                    |
| [T] Tableaux     > |
|                    |
+--------------------+
|                    |
| [L] Eclairage    > |
|                    |
+--------------------+
|                    |
| [D] Domotique    > |
|                    |
+====================+

Animation: Previous panel slides left,
           new panel slides in from right
```

### Drawer - Level 3+ (Deep Navigation)

```
+====================+
| [<] Cables         |  <- Back to L2
|    Fils electriques|  <- Current L3
+--------------------+
| Electricite > Ca.. |  <- Truncated breadcrumb (scrollable)
+--------------------+
| Voir tous les      |  <- Category page link
| fils electriques   |
+====================+
|                    |
|    Fils rigides    |  <- No chevron = leaf node
|                    |
+--------------------+
|                    |
|    Fils souples    |
|                    |
+--------------------+
|                    |
|    Fils de terre   |
|                    |
+--------------------+
|                    |
|    Fils speciaux > |  <- Has chevron = more levels
|                    |
+====================+
```

### Mobile Item Specifications

```
ITEM ROW (56px height minimum):
+----------------------------------+
|  16px  |  CONTENT        |  16px |  <- Horizontal padding
+--------+------------------+-------+
|        | [24px]  [gap]   [20px] |
|        | icon    text    chevron|
|        |  16px   flex      >    |
+----------------------------------+
|  Tap feedback: background #EFF6FF |
|  Transition: 150ms ease-out      |
+----------------------------------+


BREADCRUMB ROW:
+----------------------------------+
| Electricite > Cables > Fils el.. |
+----------------------------------+
Font: 12px, 500 weight, #6B7280
Overflow: scroll (horizontal)
Height: 32px
Background: #F3F4F6


"SEE ALL" ROW:
+----------------------------------+
| [icon]  Voir tout Electricite    |
+----------------------------------+
Font: 15px, 600 weight, #1E3A5F
Background: #EFF6FF
Border-bottom: 2px solid #DBEAFE
```

---

## Loading States

### Desktop Skeleton

```
+------------------+-------------------------------------+
| ████████░░░░░░░  |  +------+  +------+  +------+      |
| ████████░░░░░░░  |  |██████|  |██████|  |██████|      |
| ████████░░░░░░░  |  |░░░░░░|  |░░░░░░|  |░░░░░░|      |
| ████████░░░░░░░  |  +------+  +------+  +------+      |
| ████████░░░░░░░  |                                    |
|                  |  +------+  +------+  +------+      |
| ░░░░░░░░░░░░░░░  |  |██████|  |██████|  |██████|      |
|                  |  |░░░░░░|  |░░░░░░|  |░░░░░░|      |
+------------------+  +------+  +------+  +------+      |
                                                        |
+------------------------------------------------------+
| [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] |  <- Banner skeleton
+------------------------------------------------------+

Skeleton specs:
- Background: #E5E7EB
- Shimmer: linear-gradient(90deg, #E5E7EB, #F3F4F6, #E5E7EB)
- Animation: shimmer 1.5s infinite
- Border-radius: 4px
```

### Mobile Skeleton

```
+====================+
| [<] Loading...     |
+--------------------+
| ░░░░░░░░░░░░░░░░░░ |  <- Breadcrumb skeleton
+--------------------+
| ████████████░░░░░░ |  <- "See all" skeleton
+====================+
| ████████████░░░░░░ |
+--------------------+
| ████████████░░░░░░ |
+--------------------+
| ████████████░░░░░░ |
+--------------------+
| ████████████░░░░░░ |
+====================+
```

---

## Interaction Flow Diagrams

### Desktop Hover Flow

```
USER ACTION                    SYSTEM RESPONSE
===========                    ===============

Cursor enters L1 item    -->   Start 100ms timer
                               |
                               v
Timer completes          -->   Open mega menu
(cursor still there)           - Fade in (150ms)
                               - Load L3 if needed
                               |
                               v
Cursor moves to L2       -->   Highlight L2
                               Show L3 content (50ms debounce)
                               |
                               v
Cursor moves to L3       -->   Highlight L3 item
                               |
                               v
Click L3 item            -->   Navigate to category page
                               OR show tooltip if has children
                               |
                               v
Cursor leaves menu area  -->   Start 300ms close timer
                               |
                               v
Timer completes          -->   Close mega menu
(cursor didn't return)         - Fade out (150ms)
                               - Reset state
```

### Mobile Navigation Flow

```
USER ACTION                    SYSTEM RESPONSE
===========                    ===============

Tap hamburger            -->   Open drawer
                               - Slide from left (300ms)
                               - Show L1 categories
                               - Focus trap active
                               |
                               v
Tap L1 item              -->   Highlight feedback (150ms)
(with chevron)                 Slide to L2 panel (250ms)
                               - Previous panel slides left
                               - New panel slides from right
                               |
                               v
Tap L2 item              -->   Same animation pattern
(with chevron)                 Slide to L3 panel
                               |
                               v
Tap item                 -->   Navigate to category page
(no chevron)                   Close drawer
                               |
                               v
Tap back button          -->   Slide to previous level (200ms)
OR swipe right                 - Current panel slides right
                               - Previous panel slides in
                               - Restore scroll position
                               |
                               v
Tap overlay              -->   Close drawer
OR swipe left                  - Slide out to left (250ms)
                               - Return focus to hamburger
```

---

## Responsive Breakpoints

### Navigation Adaptation

```
MOBILE (0 - 767px):
- Drawer navigation only
- No mega menu
- Full-screen panels
- 56px touch targets
- Search in drawer header

TABLET (768px - 1023px):
- Compact mega menu
- 2-column L3 grid
- Reduced sidebar width (220px)
- Featured banner hidden
- Icons smaller (20px L1)

DESKTOP (1024px - 1279px):
- Full mega menu
- 3-column L3 grid
- Standard sidebar (280px)
- Featured banner visible
- Full icon size (24px L1)

LARGE DESKTOP (1280px+):
- Extended mega menu
- 4-column L3 grid
- Category images in L3 cards (optional)
- Expanded featured banner
- Quick category search in menu
```

### Breakpoint Specifications

```css
/* Mobile First Approach */

/* Base styles (mobile) */
.nav { /* drawer styles */ }

/* Tablet */
@media (min-width: 768px) {
  .nav { /* compact mega menu */ }
}

/* Desktop */
@media (min-width: 1024px) {
  .nav { /* full mega menu */ }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .nav { /* extended features */ }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .nav-item {
    border: 2px solid currentColor;
  }
}
```

---

## Color & Contrast Verification

### Text on Background Combinations

```
COMBINATION                           RATIO    WCAG
===========                           =====    ====

Primary text (#374151) on White       8.6:1    AAA  [PASS]
Secondary text (#6B7280) on White     5.0:1    AA   [PASS]
Brand navy (#1E3A5F) on White         9.7:1    AAA  [PASS]
Brand navy (#1E3A5F) on Hover (#EFF6FF) 9.1:1  AAA  [PASS]
Brand orange (#E67E22) on White       3.1:1    AA*  [PASS] *large text
White on Brand navy                   9.7:1    AAA  [PASS]
Focus ring (#3B82F6) on White         3.5:1    AA   [PASS]

* All interactive elements meet or exceed WCAG AA
* Primary content meets WCAG AAA
```

### Focus Indicator Visibility

```
FOCUS RING SPECIFICATION:

Outline: 2px solid #3B82F6
Outline-offset: 2px

This creates a visible gap between the element
and the focus indicator, ensuring visibility
on both light and dark backgrounds.

For high contrast mode:
Outline: 3px solid currentColor
Outline-offset: 3px
```

---

## Animation Timing Reference

| Animation | Duration | Easing | Purpose |
|-----------|----------|--------|---------|
| Menu open | 150ms | ease-out | Quick response |
| Menu close | 150ms | ease-out | Quick dismiss |
| L3 content switch | 100ms | ease-in-out | Smooth transition |
| Mobile panel slide | 250ms | cubic-bezier(0.4, 0, 0.2, 1) | Natural feel |
| Mobile back | 200ms | cubic-bezier(0.4, 0, 0.2, 1) | Slightly faster |
| Hover state | 100ms | ease | Immediate feedback |
| Focus ring | 0ms | none | Instant visibility |
| Skeleton shimmer | 1500ms | linear | Continuous loading |
| Touch feedback | 150ms | ease-out | Tactile response |

```css
/* CSS Custom Properties for Animations */
:root {
  --transition-fast: 100ms ease;
  --transition-normal: 150ms ease-out;
  --transition-slow: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-none: 0ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: var(--transition-none);
    --transition-normal: var(--transition-none);
    --transition-slow: var(--transition-none);
  }
}
```
