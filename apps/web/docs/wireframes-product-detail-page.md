# Product Detail Page - Visual Wireframes & Component Reference

## Quick Reference Wireframes

### Desktop Layout (1440px)

```
+--------------------------------------------------------------------------------+
|  [Logo]  [Catalogue v] [Marques v] [Soldes]           [Search] [Account] [Cart]|
+--------------------------------------------------------------------------------+
|                                                                                 |
|  Accueil  >  Bijoux  >  Bagues  >  Solitaires  >  Bague Solitaire Diamant      |
|                                                                                 |
+--------------------------------------------------------------------------------+
|                                                                                 |
|  +----------------------------------------+   +------------------------------+  |
|  |                                        |   |                              |  |
|  |                                        |   |  CARTIER                     |  |
|  |                                        |   |                              |  |
|  |                                        |   |  Bague Solitaire Diamant     |  |
|  |           +------------------+         |   |  Or Blanc 18K 0.50ct         |  |
|  |           |                  |         |   |                              |  |
|  |           |                  |         |   |  [Nouveau] [Certifie GIA]    |  |
|  |           |  MAIN PRODUCT    |         |   |                              |  |
|  |           |     IMAGE        |         |   |  Ref: BG-DR-2024-001         |  |
|  |           |                  |         |   |  EAN: 3760123456789          |  |
|  |           |  600 x 600px     |         |   |                              |  |
|  |           |                  |         |   |  Bague solitaire en or blanc |  |
|  |           |                  |         |   |  18 carats sertie d'un       |  |
|  |           +------------------+         |   |  diamant brillant de 0.50ct  |  |
|  |                                        |   |  certifie GIA.               |  |
|  |   Ref: BG-DR-001   [Zoom indicator]    |   |                              |  |
|  |                                        |   +------------------------------+  |
|  +----------------------------------------+   |                              |  |
|                                               |  VARIANT SELECTOR            |  |
|  +--+  +--+  +--+  +--+  +--+  +--+  [>]      |  -------------------------    |  |
|  |01|  |02|  |03|  |04|  |05|  |06|           |  Metal:                      |  |
|  +--+  +--+  +--+  +--+  +--+  +--+           |  +--------+ +--------+        |  |
|   80x80px thumbnails                          |  | Or 18K | |Or Blanc|        |  |
|                                               |  +--------+ +--------+        |  |
|                                               |  +--------+ +--------+        |  |
|                                               |  |Platine | |  Rose  |        |  |
|                                               |  +--------+ +--------+        |  |
|                                               |                              |  |
|                                               |  Taille:  [54 (FR)      v]   |  |
|                                               |           Guide des tailles   |  |
|                                               |                              |  |
|                                               +------------------------------+  |
|                                               |                              |  |
|                                               |  STOCK STATUS                |  |
|                                               |  +------------------------+  |  |
|                                               |  | * En stock (12)        |  |  |
|                                               |  | Entrepot: Paris        |  |  |
|                                               |  +------------------------+  |  |
|                                               |                              |  |
|                                               +------------------------------+  |
|                                               |                              |  |
|                                               |  PRICING SECTION             |  |
|                                               |                              |  |
|                                               |  Prix unitaire HT            |  |
|                                               |  -----------------------     |  |
|                                               |  1 250,00 EUR                |  |
|                                               |  (soit 1 500,00 EUR TTC)     |  |
|                                               |                              |  |
|                                               |  Remises quantite:           |  |
|                                               |  +------------------------+  |  |
|                                               |  | Qte   | Prix   | Eco  |  |  |
|                                               |  |-------|--------|------|  |  |
|                                               |  | 1-4   | 1 250  | -    |  |  |
|                                               |  | 5-9   | 1 187  | -5%  |  |  |
|                                               |  | 10-24 | 1 125  | -10% |  |  |
|                                               |  | 25+   | 1 062  | -15% |  |  |
|                                               |  +------------------------+  |  |
|                                               |                              |  |
|                                               +------------------------------+  |
|                                               |                              |  |
|                                               |  ACTION SECTION              |  |
|                                               |                              |  |
|                                               |  Quantite: [-] [ 1 ] [+]     |  |
|                                               |                              |  |
|                                               |  +========================+  |  |
|                                               |  |                        |  |  |
|                                               |  |  AJOUTER AU PANIER     |  |  |
|                                               |  |                        |  |  |
|                                               |  +========================+  |  |
|                                               |                              |  |
|                                               |  +------------------------+  |  |
|                                               |  |  DEMANDER UN DEVIS     |  |  |
|                                               |  +------------------------+  |  |
|                                               |                              |  |
|                                               |  [Heart] [Compare] [PDF]     |  |
|                                               |                              |  |
|                                               |  Livraison estimee:          |  |
|                                               |  Mar. 7 - Jeu. 9 janvier     |  |
|                                               |                              |  |
|                                               +------------------------------+  |
|                                                                                 |
+--------------------------------------------------------------------------------+
|                                                                                 |
|  PRODUCT DETAILS TABS                                                           |
|  ==================================================================================
|  [Description] [Caracteristiques] [Certifications] [Documents (3)] [Livraison]  |
|  ----------------------------------------------------------------------------------
|                                                                                 |
|  [Tab content area - varies based on selected tab]                             |
|                                                                                 |
+--------------------------------------------------------------------------------+
|                                                                                 |
|  PRODUITS SIMILAIRES                                                            |
|  -------------------                                                            |
|                                                                                 |
|  [<]  +--------+  +--------+  +--------+  +--------+  +--------+  [>]          |
|       |  img   |  |  img   |  |  img   |  |  img   |  |  img   |               |
|       +--------+  +--------+  +--------+  +--------+  +--------+               |
|       | Brand  |  | Brand  |  | Brand  |  | Brand  |  | Brand  |               |
|       | Name   |  | Name   |  | Name   |  | Name   |  | Name   |               |
|       | Price  |  | Price  |  | Price  |  | Price  |  | Price  |               |
|       | [+]    |  | [+]    |  | [+]    |  | [+]    |  | [+]    |               |
|       +--------+  +--------+  +--------+  +--------+  +--------+               |
|                                                                                 |
+--------------------------------------------------------------------------------+
|                                                                                 |
|  COMPLETEZ VOTRE SELECTION                                                      |
|  -------------------------                                                      |
|  [Similar carousel structure with complementary products]                       |
|                                                                                 |
+--------------------------------------------------------------------------------+
|                                                                                 |
|  +--------------------------------------------------------------------------+  |
|  |  [Brand Logo]                                                             |  |
|  |                                                                           |  |
|  |  Decouvrez CARTIER                                                        |  |
|  |                                                                           |  |
|  |  Fondee en 1847, Cartier est synonyme de luxe et d'elegance...           |  |
|  |                                                                           |  |
|  |  [Voir tous les produits CARTIER ->]                                      |  |
|  +--------------------------------------------------------------------------+  |
|                                                                                 |
+--------------------------------------------------------------------------------+
|                                                                                 |
|  RECEMMENT CONSULTES                                                            |
|  --------------------                                                           |
|  [Similar carousel structure]                                                   |
|                                                                                 |
+--------------------------------------------------------------------------------+
|                              FOOTER                                             |
+--------------------------------------------------------------------------------+
```

---

### Mobile Layout (375px)

```
+----------------------------------+
|  [=]  [Logo]     [Search] [Cart] |
+----------------------------------+
| Bagues > Solitaires              |
+----------------------------------+
|                                  |
| CARTIER                          |
|                                  |
| Bague Solitaire Diamant          |
| Or Blanc 18K 0.50ct              |
|                                  |
| [Nouveau] [Certifie GIA]         |
|                                  |
+----------------------------------+
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |                            |  |
|  |                            |  |
|  |      PRODUCT IMAGE         |  |
|  |      Full Width            |  |
|  |      Swipe Carousel        |  |
|  |                            |  |
|  |                            |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|         o o o o o o              |
|            1 / 6                 |
|                                  |
+----------------------------------+
| Ref: BG-DR-2024-001              |
|                                  |
| Bague solitaire en or blanc 18   |
| carats sertie d'un diamant...    |
|                                  |
+----------------------------------+
|                                  |
| VARIANTES                        |
| --------                         |
|                                  |
| Metal:                           |
| +-------+ +-------+ +-------+    |
| |Or 18K | |Or Bl. | |Plat.  |    |
| +-------+ +-------+ +-------+    |
|                                  |
| Taille:                          |
| +----------------------------+   |
| | 54 (FR)                  v |   |
| +----------------------------+   |
| Guide des tailles                |
|                                  |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | * En stock (12 disponibles)  | |
| +------------------------------+ |
|                                  |
+----------------------------------+
|                                  |
| Prix unitaire HT                 |
| ----------------                 |
|                                  |
| 1 250,00 EUR                     |
| (soit 1 500,00 EUR TTC)          |
|                                  |
| v Voir remises quantite          |
|   (expand to show tiers)         |
|                                  |
+----------------------------------+
|                                  |
| Quantite: [-] [  1  ] [+]        |
|                                  |
| +==============================+ |
| |    AJOUTER AU PANIER         | |
| +==============================+ |
|                                  |
| +------------------------------+ |
| |    DEMANDER UN DEVIS         | |
| +------------------------------+ |
|                                  |
| [Heart]    [Compare]    [PDF]    |
|                                  |
| Livraison: 2-3 jours             |
|                                  |
+----------------------------------+
|                                  |
| DETAILS DU PRODUIT               |
| (Accordions)                     |
|                                  |
| v Description                    |
|   [Content visible when open]    |
|                                  |
| > Caracteristiques               |
|                                  |
| > Certifications & Garanties     |
|                                  |
| > Documents (3)                  |
|                                  |
| > Livraison & Retours            |
|                                  |
+----------------------------------+
|                                  |
| PRODUITS SIMILAIRES              |
|                                  |
| +------+ +------+ +------+       |
| | img  | | img  | | img  | [->]  |
| | ---- | | ---- | | ---- |       |
| |Brand | |Brand | |Brand |       |
| |Name  | |Name  | |Name  |       |
| |Price | |Price | |Price |       |
| +------+ +------+ +------+       |
|                                  |
+----------------------------------+
|                                  |
| RECEMMENT CONSULTES              |
| [Similar horizontal scroll]      |
|                                  |
+----------------------------------+
|            FOOTER                |
+----------------------------------+

========================================
STICKY ADD TO CART BAR (Mobile)
When scrolled past main CTA:
========================================
+----------------------------------+
| 1 250 EUR  [-][1][+]  [Panier]   |
+----------------------------------+
```

---

## Component Detail Wireframes

### Variant Selector - Button Group

```
For <= 4 options, use button group:

+----------+  +----------+  +----------+  +----------+
|          |  |          |  |          |  |          |
|  Or 18K  |  | Or Blanc |  | Platine  |  | Argent   |
| (active) |  |          |  |          |  |   925    |
|          |  |          |  |          |  |          |
+----------+  +----------+  +----------+  +----------+
   ^
   |
   Active state:
   - 2px accent border
   - Subtle accent background (5% opacity)
   - Font weight: medium

With stock indication:
+------------------+
|                  |
|     Or Blanc     |
|   (8 en stock)   |
|                  |
+------------------+
```

### Variant Selector - Dropdown

```
For > 4 options, use dropdown:

Label above dropdown:
Metal
+--------------------------------+
| Or 18K                      [v]|
+--------------------------------+
                 |
                 v (on click)
+--------------------------------+
| * Or 18K - En stock (12)       |  <- Currently selected
|   Or Blanc - En stock (8)      |
|   Platine - Sur commande       |  <- Gray, italic "Sur commande"
|   Rose Gold - Rupture          |  <- Grayed out, but selectable
+--------------------------------+

Height: 44px (touch friendly)
Dropdown max-height: 300px (scrollable)
```

### Stock Status Banner

```
IN STOCK (quantity > 10):
+------------------------------------------------+
| [Green Dot *]  En stock                        |
|                                                |
|                Entrepot: Paris [Modifier v]    |
+------------------------------------------------+
Background: green-50 (#f0fdf4)


LOW STOCK (quantity 3-10):
+------------------------------------------------+
| [Orange Dot *]  Stock limite (8 disponibles)   |
|                                                |
|                Entrepot: Paris [Modifier v]    |
+------------------------------------------------+
Background: amber-50 (#fffbeb)


LAST ITEMS (quantity 1-2):
+------------------------------------------------+
| [Red Dot *]  Dernieres pieces (2 disponibles)  |
|                                                |
|                Entrepot: Paris [Modifier v]    |
+------------------------------------------------+
Background: red-50 (#fef2f2)


BACKORDER:
+------------------------------------------------+
| [Gray Dot o]  Sur commande                     |
|              Delai: 3-4 semaines               |
+------------------------------------------------+
Background: blue-50 (#eff6ff)


OUT OF STOCK:
+------------------------------------------------+
| [X Gray]  Rupture de stock                     |
|           [Etre alerte quand disponible]       |
+------------------------------------------------+
Background: neutral-100 (#f3f4f6)
```

### Volume Discount Tiers Table

```
+------------------------------------------------------------+
|  Remises quantite                                     [i]  |
+------------------------------------------------------------+
|                                                            |
|  +------------------------------------------------------+  |
|  |  Quantite   |  Prix unitaire  |  Economie           |  |
|  |-------------|-----------------|---------------------|  |
|  |  1 - 4      |  1 250,00 EUR   |  -                  |  |
|  |-------------|-----------------|---------------------|  |
|  |  5 - 9      |  1 187,50 EUR   |  -5%   [*]         |  |  <- Active tier
|  |-------------|-----------------|---------------------|  |
|  |  10 - 24    |  1 125,00 EUR   |  -10%              |  |
|  |-------------|-----------------|---------------------|  |
|  |  25+        |  1 062,50 EUR   |  -15%              |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [Contactez-nous pour volumes importants]                  |
|                                                            |
+------------------------------------------------------------+

Active row styling:
- Left border: 3px accent color
- Background: accent/5%
- Checkmark icon [*] before discount
- Font: medium weight

Row hover:
- Background: neutral-50
- Cursor: pointer (rows are clickable)
```

### Quantity Selector

```
+-----------+------------------+-----------+
|           |                  |           |
|    [-]    |        5         |    [+]    |
|           |                  |           |
+-----------+------------------+-----------+
    40px          60px             40px

Total width: 140px
Height: 48px

Button states:
- Default: neutral-100 bg, neutral-600 icon
- Hover: neutral-200 bg, neutral-900 icon
- Disabled: 50% opacity (at min/max)
- Focus: accent ring

Input:
- Centered text
- Accepts numeric input
- Validates on blur
- Shake animation on invalid
```

### Add to Cart Button States

```
DEFAULT:
+================================================+
|                                                |
|  [Cart Icon]  AJOUTER AU PANIER                |
|                                                |
+================================================+
Background: accent (gold #B8860B)
Text: white
Height: 56px


HOVER:
+================================================+
|                                                |
|  [Cart Icon]  AJOUTER AU PANIER                |
|                                                |
+================================================+
Background: darken 10% (#996B08)


LOADING:
+================================================+
|                                                |
|  [Spinner]  AJOUT EN COURS...                  |
|                                                |
+================================================+


SUCCESS (2 seconds, then revert):
+================================================+
|                                                |
|  [Checkmark]  AJOUTE AU PANIER !               |
|                                                |
+================================================+
Background: green-600


DISABLED (out of stock):
+================================================+
|                                                |
|  [Cart Icon]  AJOUTER AU PANIER                |
|                                                |
+================================================+
Opacity: 50%
Cursor: not-allowed
```

### Secondary Actions Row

```
Desktop (with labels):
+-----------------+  +-----------------+  +-----------------+
|                 |  |                 |  |                 |
| [Heart] Liste   |  | [Scale] Comparer|  | [Doc] Fiche PDF |
|                 |  |                 |  |                 |
+-----------------+  +-----------------+  +-----------------+

Mobile (icons only, with tooltips):
+-------+  +-------+  +-------+
|       |  |       |  |       |
| [Heart]  | [Scale]  |  [Doc] |
|       |  |       |  |       |
+-------+  +-------+  +-------+
   44px      44px       44px

Wishlist states:
- Default: Heart outline
- Active: Heart filled, red color
```

### Product Tabs (Desktop)

```
+-----------------------------------------------------------------------+
| [Description] | [Caracteristiques] | [Certifications] | [Documents (3)] |
+===============+====================+===================+=================+
|               |                    |                   |                 |
|  [Tab content panel]                                                     |
|                                                                          |
|  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do        |
|  eiusmod tempor incididunt ut labore et dolore magna aliqua.            |
|                                                                          |
+-----------------------------------------------------------------------+

Active tab:
- 2px bottom border (accent)
- Text color: accent
- Font weight: medium

Inactive tab:
- No bottom border
- Text color: neutral-600
- Hover: neutral-900

Tab with badge:
[Documents (3)]
             ^-- Badge: neutral background, small text
```

### Product Accordions (Mobile)

```
+----------------------------------+
|                                  |
| v Description                    |
|   -------------                  |
|                                  |
|   Lorem ipsum dolor sit amet,    |
|   consectetur adipiscing elit.   |
|   Sed do eiusmod tempor...       |
|                                  |
+----------------------------------+
| > Caracteristiques               |
+----------------------------------+
| > Certifications & Garanties     |
+----------------------------------+
| > Documents (3)                  |
+----------------------------------+
| > Livraison & Retours            |
+----------------------------------+

Open state:
- Chevron rotated down (v)
- Content visible with animation
- Border on all sides

Closed state:
- Chevron pointing right (>)
- Only header visible
- Bottom border only
```

### Lightbox Modal

```
+----------------------------------------------------------------------+
|                                                         [X Close]    |
|                                                                      |
|                                                                      |
|  [<]                    +----------------------+                [>]  |
|                         |                      |                     |
|                         |                      |                     |
|                         |   LARGE PRODUCT      |                     |
|                         |      IMAGE           |                     |
|                         |                      |                     |
|                         |    (Zoomable)        |                     |
|                         |                      |                     |
|                         +----------------------+                     |
|                                                                      |
|                                                                      |
|                   +--+  +--+  +--+  +--+  +--+                       |
|                   |01|  |02|  |03|  |04|  |05|                       |
|                   +--+  +--+  +--+  +--+  +--+                       |
|                                                                      |
|                         [-] 150% [+]                                 |
|                                                                      |
|  3 / 6                                                               |
+----------------------------------------------------------------------+

Background: black (95% opacity)
Navigation arrows: white, semi-transparent bg on hover
Thumbnails: smaller, horizontal strip
Zoom controls: center bottom
Counter: bottom left
Close: top right
```

---

## Responsive Breakpoints

```
Mobile:     0 - 639px    (single column, accordions)
Tablet:     640 - 1023px (two column, narrower gallery)
Desktop:    1024px+      (full two column, tabs)
Wide:       1440px+      (max-width container)

Container max-width: 1280px
Gallery width: 55% on desktop
Info panel width: 45% on desktop
Gap between columns: 48px (lg:gap-12)
```

---

## Color Reference

```
ACCENT (Luxury Gold):
- Primary: #B8860B
- Hover: #996B08
- Light (5%): rgba(184, 134, 11, 0.05)

STATUS COLORS:
- Success (Green): #22C55E / bg: #F0FDF4
- Warning (Amber): #F59E0B / bg: #FFFBEB
- Error (Red): #EF4444 / bg: #FEF2F2
- Info (Blue): #3B82F6 / bg: #EFF6FF

NEUTRALS:
- 50: #F9FAFB (backgrounds)
- 100: #F3F4F6 (borders, disabled)
- 200: #E5E7EB (borders)
- 500: #6B7280 (secondary text)
- 600: #4B5563 (body text)
- 700: #374151 (headings)
- 900: #111827 (primary text)
```

---

## Typography Scale

```
Hero Title (H1): 28px / 32px mobile, semibold
Section Title (H2): 24px, semibold
Subsection (H3): 18px, medium
Body Large: 16px, regular
Body: 15px, regular (line-height: 1.6)
Body Small: 14px, regular
Caption: 13px, regular
Label: 12px, medium, uppercase, tracking 0.05em
Mono (refs): 13px, JetBrains Mono
```

---

*End of Wireframes Document*
