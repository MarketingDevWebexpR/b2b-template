# Luxury Search Experience - UX Design Specification

## React Native / Expo Mobile Application
### High-End Jewelry E-Commerce - Bijoux Luxe

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design System Reference](#design-system-reference)
3. [Component Hierarchy](#component-hierarchy)
4. [Search Bar Design](#1-search-bar-design)
5. [Search Modes](#2-search-modes)
6. [Search Results](#3-search-results)
7. [Filters & Sorting](#4-filters--sorting)
8. [Search History & Suggestions](#5-search-history--suggestions)
9. [Micro-interactions](#6-micro-interactions)
10. [User Flow Diagrams](#user-flow-diagrams)
11. [Accessibility Specifications](#accessibility-specifications)
12. [Technical Implementation Notes](#technical-implementation-notes)

---

## Design Philosophy

The search experience embodies the same refined luxury aesthetic as the rest of the application. Every interaction should feel:

- **Elegant**: Smooth, unhurried animations that convey quality
- **Intuitive**: Clear affordances without cluttering the interface
- **Premium**: Generous whitespace, sophisticated typography, subtle shadows
- **Responsive**: Immediate tactile feedback through haptics and micro-animations
- **Accessible**: WCAG 2.1 AA compliant, inclusive by design

### Core Design Principles

1. **Simplicity First**: Complex functionality hidden behind elegant, simple interfaces
2. **Progressive Disclosure**: Show only what's needed, reveal more on demand
3. **Consistency**: Reuse patterns from existing components (LuxuryQuantitySelector, ProductCard)
4. **Delight in Details**: Subtle animations that reward attention

---

## Design System Reference

### Color Palette

```typescript
const COLORS = {
  // Primary Backgrounds
  background: {
    primary: '#fffcf7',    // Warm cream - main background
    secondary: '#fcf7f1',  // Beige - secondary surfaces
    tertiary: '#f6f1eb',   // Warm - cards, elevated surfaces
    muted: '#f8f5f0',      // For disabled states
  },

  // Text Colors
  text: {
    primary: '#2b333f',    // Charcoal - primary text
    secondary: '#444444',  // Dark gray - secondary text
    muted: '#696969',      // Medium gray - muted text
    light: '#8b8b8b',      // Light gray - placeholders
    inverse: '#fffcf7',    // Cream - text on dark backgrounds
  },

  // Accent - Hermes Orange
  hermes: {
    50: '#fff7ed',         // Lightest - hover backgrounds
    100: '#ffedd5',        // Light - subtle accents
    200: '#fed7aa',        // Soft - borders
    300: '#fdba74',        // Medium - secondary accents
    400: '#fb923c',        // Bright - highlights
    500: '#f67828',        // Primary - main accent color
    600: '#ea580c',        // Dark - pressed states
    700: '#c2410c',        // Darker - active states
  },

  // Neutral Luxe Palette
  luxe: {
    white: '#ffffff',
    cream: '#fffcf7',
    pearl: '#faf8f5',
    sand: '#f0ebe3',
    taupe: '#d4c9bd',
    stone: '#b8a99a',
    bronze: '#a08b76',
    charcoal: '#2b333f',
    noir: '#1a1a1a',
  },

  // Borders
  border: {
    light: '#f0ebe3',      // Subtle dividers
    default: '#e2d8ce',    // Standard borders
    medium: '#d4c9bd',     // Emphasized borders
    dark: '#b8a99a',       // Strong borders
  },
};
```

### Typography

```typescript
const TYPOGRAPHY = {
  // Serif - Playfair Display (headings, product names)
  serif: {
    regular: 'PlayfairDisplay-Regular',
    medium: 'PlayfairDisplay-Medium',
    semibold: 'PlayfairDisplay-SemiBold',
    bold: 'PlayfairDisplay-Bold',
  },

  // Sans-Serif - Inter (body, labels, UI elements)
  sans: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },

  // Display - Cormorant Garamond (large headings, quotes)
  display: {
    regular: 'CormorantGaramond-Regular',
    medium: 'CormorantGaramond-Medium',
    semibold: 'CormorantGaramond-SemiBold',
    bold: 'CormorantGaramond-Bold',
  },
};

// Font Sizes
const FONT_SIZES = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,
};

// Letter Spacing
const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  luxe: 2,        // Uppercase labels
  elegant: 1.5,   // Section titles
};
```

### Spacing System

```typescript
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};
```

### Border Radius

```typescript
const RADII = {
  soft: 8,
  elegant: 12,
  luxe: 16,
  pill: 999,  // For buttons, search bar
};
```

---

## Component Hierarchy

```
SearchScreen
├── SearchHeader
│   ├── BackButton
│   └── SearchTitle
│
├── SearchBar (Animated)
│   ├── SearchIcon (Animated)
│   ├── TextInput
│   ├── VoiceSearchButton (Optional)
│   ├── ScanButton (Camera/QR)
│   └── ClearButton (Animated, conditional)
│
├── SearchModeSelector (when search bar focused, no query)
│   ├── TextSearchMode (default)
│   ├── VoiceSearchMode
│   ├── BarcodeScanMode
│   └── VisualSearchMode
│
├── SearchContent (conditional rendering)
│   │
│   ├── [Empty State - No query]
│   │   ├── RecentSearches
│   │   │   ├── SectionHeader ("Recherches recentes")
│   │   │   └── RecentSearchItem[] (with delete)
│   │   │
│   │   ├── PopularSearches
│   │   │   ├── SectionHeader ("Tendances")
│   │   │   └── TrendingSearchChip[]
│   │   │
│   │   ├── QuickCategories
│   │   │   ├── SectionHeader ("Parcourir")
│   │   │   └── CategoryShortcut[]
│   │   │
│   │   └── SuggestionsSection
│   │       ├── SectionHeader ("Vous aimerez peut-etre")
│   │       └── SuggestionProductCard[] (horizontal scroll)
│   │
│   ├── [Auto-suggestions - While typing]
│   │   ├── TextSuggestionItem[]
│   │   ├── CategorySuggestionItem[]
│   │   └── CollectionSuggestionItem[]
│   │
│   ├── [Search Results - Query submitted]
│   │   ├── ResultsHeader
│   │   │   ├── ResultCount
│   │   │   ├── ViewToggle (Grid/List)
│   │   │   └── SortButton
│   │   │
│   │   ├── ActiveFiltersBar (conditional)
│   │   │   └── ActiveFilterChip[] (with remove)
│   │   │
│   │   ├── ProductResults
│   │   │   ├── [GridView]
│   │   │   │   └── SearchProductCard[] (2 columns)
│   │   │   └── [ListView]
│   │   │       └── SearchProductListItem[]
│   │   │
│   │   └── LoadMoreButton / InfiniteScroll
│   │
│   ├── [Loading State]
│   │   └── SkeletonGrid / SkeletonList
│   │
│   └── [No Results State]
│       ├── NoResultsIllustration
│       ├── NoResultsMessage
│       ├── SuggestionChips
│       └── BrowseCategoriesButton
│
├── FilterBottomSheet (Modal)
│   ├── SheetHeader
│   │   ├── Title ("Filtres")
│   │   ├── ResetButton
│   │   └── CloseButton
│   │
│   ├── FilterSections
│   │   ├── PriceRangeFilter
│   │   │   ├── SectionTitle
│   │   │   ├── RangeSlider (dual thumb)
│   │   │   └── PriceInputs (min/max)
│   │   │
│   │   ├── CategoryFilter
│   │   │   ├── SectionTitle
│   │   │   └── CategoryCheckbox[]
│   │   │
│   │   ├── CollectionFilter
│   │   │   ├── SectionTitle
│   │   │   └── CollectionCheckbox[]
│   │   │
│   │   ├── MaterialFilter
│   │   │   ├── SectionTitle
│   │   │   └── MaterialChip[] (multi-select)
│   │   │
│   │   └── StoneFilter
│   │       ├── SectionTitle
│   │       └── StoneChip[] (multi-select)
│   │
│   └── ApplyButton (sticky footer)
│
├── SortBottomSheet (Modal)
│   ├── SheetHeader
│   │   └── Title ("Trier par")
│   │
│   └── SortOptions
│       ├── SortOption ("Pertinence" - default)
│       ├── SortOption ("Prix croissant")
│       ├── SortOption ("Prix decroissant")
│       ├── SortOption ("Nouveautes")
│       └── SortOption ("Les plus populaires")
│
├── VoiceSearchOverlay (Modal, full screen)
│   ├── CloseButton
│   ├── VoiceWaveform (animated)
│   ├── TranscriptionText
│   └── HintText
│
├── CameraScannerOverlay (Modal, full screen)
│   ├── CloseButton
│   ├── CameraView
│   ├── ScanFrame (animated)
│   ├── ModeToggle (Barcode/QR vs Photo)
│   └── HintText
│
└── VisualSearchOverlay (Modal, full screen)
    ├── CloseButton
    ├── CameraView / ImagePreview
    ├── CaptureButton
    ├── GalleryButton
    └── ProcessingIndicator
```

---

## 1. Search Bar Design

### Component: `LuxurySearchBar`

#### Visual Specifications

```
┌─────────────────────────────────────────────────────────────────┐
│  ○  │  Rechercher un bijou...                    │  🎤  │  📷  │
│     │                                            │      │      │
└─────────────────────────────────────────────────────────────────┘
     │                    │                              │      │
   Search            Animated                        Voice   Camera
    Icon            Placeholder                      Button  Button
```

**Dimensions:**
- Height: 56px (resting), 64px (focused)
- Border radius: 28px (pill shape)
- Horizontal padding: 20px
- Icon size: 22px

**Resting State:**
- Background: `#ffffff` (pure white)
- Border: 1px solid `border.light` (#f0ebe3)
- Shadow: `0 2px 8px rgba(0,0,0,0.04)`
- Search icon: `text.light` (#8b8b8b)
- Placeholder: `text.light` (#8b8b8b)

**Focused State:**
- Background: `#ffffff`
- Border: 1.5px solid `hermes.500` (#f67828)
- Shadow: `0 4px 16px rgba(246,120,40,0.12)`
- Height animates to 64px
- Search icon transitions to `hermes.500`

**With Text State:**
- Clear button appears (animated fade + scale)
- Voice/Camera buttons fade slightly (opacity: 0.6)

#### Placeholder Animation

**Rotating Placeholder Text:**
```typescript
const PLACEHOLDER_TEXTS = [
  'Rechercher un bijou...',
  'Bague de fiancailles...',
  'Collier en or...',
  'Bracelet diamant...',
  'Boucles d\'oreilles...',
];
```

**Animation Sequence:**
1. Text fades out (opacity: 1 -> 0, duration: 200ms)
2. Text changes
3. Text slides up from bottom (translateY: 10 -> 0)
4. Text fades in (opacity: 0 -> 1, duration: 300ms)
5. Wait 4 seconds
6. Repeat

**Animation Timing:**
- Fade out: 200ms, ease-out
- Slide up + fade in: 300ms, ease-out-cubic
- Dwell time: 4000ms
- Cycle: indefinite

#### Focus/Blur State Transitions

**On Focus:**
```typescript
// Animation config
const focusAnimation = {
  height: { from: 56, to: 64, duration: 250, easing: 'ease-out-cubic' },
  borderColor: { to: COLORS.hermes[500], duration: 200 },
  borderWidth: { from: 1, to: 1.5, duration: 200 },
  shadowOpacity: { from: 0.04, to: 0.12, duration: 300 },
  searchIconColor: { to: COLORS.hermes[500], duration: 200 },
};

// Haptic feedback
hapticFeedback.softConfirm();
```

**On Blur (with no text):**
```typescript
// Reverse all animations
const blurAnimation = {
  height: { to: 56, duration: 200, easing: 'ease-in-out' },
  borderColor: { to: COLORS.border.light, duration: 200 },
  borderWidth: { to: 1, duration: 200 },
  shadowOpacity: { to: 0.04, duration: 200 },
  searchIconColor: { to: COLORS.text.light, duration: 200 },
};
```

#### Clear Button Animation

**Appearance (when text.length > 0):**
- Scale: 0 -> 1 (spring: damping 15, stiffness 200)
- Opacity: 0 -> 1 (duration: 150ms)
- Rotation: -90deg -> 0deg (duration: 200ms)

**Disappearance (when cleared):**
- Scale: 1 -> 0 (duration: 150ms, ease-out)
- Opacity: 1 -> 0 (duration: 100ms)

**Press Interaction:**
```typescript
const clearButtonPress = {
  pressIn: { scale: 0.85, duration: 80 },
  pressOut: { scale: 1, spring: springConfigs.button },
  haptic: hapticFeedback.quantityButtonPress,
};
```

#### Clear Button Visual

- Size: 32px x 32px
- Background: `hermes.50` (#fff7ed)
- Icon: X mark, 16px, `hermes.500`
- Border radius: 16px (circle)

---

## 2. Search Modes

### Mode Selector Interface

When search bar is focused with no text entered, display search mode options:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Search Bar - Focused]                                         │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │    ⌨️    │   │    🎤    │   │   ┃┃┃    │   │    📷    │
    │  Texte   │   │   Voix   │   │  Scanner │   │  Visuel  │
    └──────────┘   └──────────┘   └──────────┘   └──────────┘
        ●              ○              ○              ○
```

**Mode Button Specifications:**

- Size: 72px x 72px
- Border radius: 16px (elegant)
- Background (inactive): `background.tertiary` (#f6f1eb)
- Background (active): `hermes.50` (#fff7ed)
- Border (inactive): none
- Border (active): 1.5px solid `hermes.200` (#fed7aa)
- Icon size: 28px
- Icon color (inactive): `text.muted` (#696969)
- Icon color (active): `hermes.500` (#f67828)
- Label: 11px, `sans.medium`, `text.secondary`

### 2.1 Text Search with Auto-suggestions

**Suggestion Types:**

1. **Text Suggestions** - Based on query string
2. **Category Suggestions** - Matching categories
3. **Collection Suggestions** - Matching collections
4. **Product Suggestions** - Quick product matches (limit: 3)

**Suggestion Item Layout:**

```
┌───────────────────────────────────────────────────────────────┐
│  🔍  │  Bagues diamant                                    →  │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  📂  │  Categorie: Bagues                                 →  │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  ✨  │  Collection: Eternelle                             →  │
└───────────────────────────────────────────────────────────────┘
```

**Suggestion Item Specs:**
- Height: 52px
- Padding: 16px horizontal
- Icon size: 20px
- Icon color: `text.muted` for search, `hermes.400` for category/collection
- Text: 15px, `sans.regular`, `text.primary`
- Highlight matching text with `hermes.500` color and `sans.semibold`
- Arrow icon: 16px, `text.light`, only on hover/press
- Separator: 1px, `border.light`, inset 56px left

**Debounce Timing:**
- Wait 300ms after last keystroke before searching
- Show loading indicator after 200ms if no results yet

### 2.2 Voice Search

**Voice Search Overlay:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                          ✕     │
│                                                                 │
│                                                                 │
│                         ╭─────────╮                             │
│                      ╭──│  🎤🔴   │──╮                          │
│                      │  ╰─────────╯  │                          │
│                      ╰───────────────╯                          │
│                       (Waveform animation)                      │
│                                                                 │
│                                                                 │
│                    "Bague en or avec..."                        │
│                                                                 │
│                                                                 │
│              Parlez maintenant ou appuyez pour arreter          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Visual Specs:**
- Background: `background.primary` with blur overlay on content behind
- Microphone icon: 48px, animated pulse when listening
- Waveform: Custom component showing audio levels
- Transcription text: 24px, `serif.medium`, `text.primary`, centered
- Hint text: 14px, `sans.regular`, `text.muted`, centered

**States:**
1. **Idle** - Microphone icon, "Appuyez pour parler"
2. **Listening** - Pulsing mic icon, waveform active, real-time transcription
3. **Processing** - Loading indicator, "Traitement..."
4. **Error** - Error message with retry button

**Animation:**
- Entry: Fade in (300ms) + scale from 0.95 (300ms, spring)
- Microphone pulse: Scale 1 -> 1.1 -> 1, repeat at 1.2s interval
- Exit: Fade out (200ms) + scale to 0.95 (200ms)

### 2.3 Barcode/QR Scanner

**Scanner Overlay:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                          ✕     │
│                                                                 │
│    ┌───────────────────────────────────────────────────┐       │
│    │                                                   │       │
│    │                                                   │       │
│    │           ┌─────────────────────┐                │       │
│    │           │   ╔═══════════╗     │                │       │
│    │           │   ║           ║     │  <- Scan frame │       │
│    │           │   ║           ║     │     animated   │       │
│    │           │   ╚═══════════╝     │                │       │
│    │           └─────────────────────┘                │       │
│    │                                                   │       │
│    │                   Camera View                     │       │
│    └───────────────────────────────────────────────────┘       │
│                                                                 │
│         ┌─────────────┐     ┌─────────────┐                     │
│         │  Code-barres │     │    QR Code   │                    │
│         └─────────────┘     └─────────────┘                     │
│                                                                 │
│         Alignez le code dans le cadre                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Scan Frame Animation:**
- Border: 2px solid `hermes.500`
- Corner accents: 24px lines at each corner
- Scanning line: Horizontal line that moves up and down
- Scanning line color: `hermes.400` with 50% opacity
- Animation: translateY from top to bottom, 2s duration, ease-in-out, repeat

**Mode Toggle:**
- Segmented control style
- Active: `hermes.500` background, white text
- Inactive: Transparent, `text.secondary`

**Success State:**
- Frame turns green (`#22c55e`)
- Haptic: `notificationAsync(Success)`
- Auto-dismiss after 500ms

### 2.4 Visual/Image Search

**Visual Search Overlay:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                          ✕     │
│                                                                 │
│    ┌───────────────────────────────────────────────────┐       │
│    │                                                   │       │
│    │                                                   │       │
│    │                                                   │       │
│    │                  Camera Preview                   │       │
│    │                        or                         │       │
│    │                  Selected Image                   │       │
│    │                                                   │       │
│    │                                                   │       │
│    │                                                   │       │
│    └───────────────────────────────────────────────────┘       │
│                                                                 │
│         ┌─────────────┐              ╭──────────╮                │
│         │   Galerie   │              │    ◉     │  <- Capture   │
│         └─────────────┘              ╰──────────╯     Button    │
│                                                                 │
│      Photographiez un bijou pour trouver des pieces similaires  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Capture Button:**
- Size: 72px diameter
- Background: `hermes.500`
- Inner circle: 60px, `hermes.400`
- Press animation: Scale to 0.9, inner circle scales to 0.95
- Haptic: `heavyImpact` on capture

**Processing State:**
- Image freezes
- Overlay with analyzing animation
- Progress indicator with "Analyse en cours..."
- Animated dots or luxury-style spinner

**Gallery Button:**
- 48px x 48px
- Border: 1px solid `border.default`
- Icon: Image gallery icon, 24px
- Opens native image picker

---

## 3. Search Results

### Results Header

```
┌─────────────────────────────────────────────────────────────────┐
│  24 resultats pour "bague diamant"                              │
│                                                                 │
│  ┌────────┐  ┌────────┐                    ┌──────────────────┐ │
│  │  ▦▦   │  │  ≡     │                    │  Trier: Pertinence│ │
│  │  ▦▦   │  │  ≡     │                    └──────────────────┘ │
│  └────────┘  └────────┘                                         │
│   Grid        List                          Sort Button         │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Results count: 13px, `sans.regular`, `text.muted`
- View toggle buttons: 40px x 40px each
- Active view: `hermes.50` background, `hermes.500` icon
- Inactive view: Transparent, `text.light` icon
- Sort button: Pill shape, border `border.default`, `text.secondary`

### 3.1 Grid vs List View Toggle

**Toggle Animation:**
- Crossfade between views (300ms)
- Items animate in with stagger (50ms per item)
- Spring animation for position changes

**Grid View (2 columns):**
```
┌─────────────────┐  ┌─────────────────┐
│   [  Image  ]   │  │   [  Image  ]   │
│                 │  │                 │
│   Product Name  │  │   Product Name  │
│   1 250,00 EUR  │  │     890,00 EUR  │
└─────────────────┘  └─────────────────┘
```

**List View:**
```
┌───────────────────────────────────────────────────────────┐
│ ┌─────────┐                                               │
│ │         │   Bague Solitaire Eternelle                   │
│ │ [Image] │   Collection Eternelle                        │
│ │         │   1 250,00 EUR                           ♡   │
│ └─────────┘                                               │
└───────────────────────────────────────────────────────────┘
```

### 3.2 Product Cards

**Search Product Card (Grid View):**

Based on existing `ProductCard` component patterns:

```typescript
interface SearchProductCardProps {
  product: Product;
  onPress: () => void;
  onFavoriteToggle: () => void;
  isFavorite: boolean;
}
```

**Specifications:**
- Card background: `#ffffff`
- Border radius: 12px (elegant)
- Shadow: `0 2px 8px rgba(0,0,0,0.04)`
- Image aspect ratio: 1:1
- Image container background: `background.secondary`

**Hover/Press Animation:**
```typescript
const cardPressAnimation = {
  pressIn: {
    scale: 0.98,
    shadowOpacity: 0.02,
    duration: 100,
  },
  pressOut: {
    scale: 1,
    shadowOpacity: 0.04,
    spring: springConfigs.button,
  },
  haptic: hapticFeedback.softConfirm,
};
```

**Image Hover Effect:**
- Scale: 1 -> 1.05 over 500ms (on web/hover)
- On mobile: Scale on press

**Favorite Button:**
- Position: Top-right of image
- Size: 36px x 36px
- Background: `rgba(255,255,255,0.9)` with backdrop blur
- Icon: Heart outline (unfilled) / Heart filled (favorited)
- Icon color: `text.muted` (unfilled) / `hermes.500` (filled)
- Press animation: Scale 1 -> 1.2 -> 1 (spring)

### 3.3 Skeleton Loading States

**Grid Skeleton:**

```
┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │
│    ░░░░░░░░    │  │    ░░░░░░░░    │
│                 │  │                 │
│   ░░░░░░░░░    │  │   ░░░░░░░░░    │
│   ░░░░░░       │  │   ░░░░░░       │
└─────────────────┘  └─────────────────┘
```

**Skeleton Animation:**
- Shimmer effect using linear gradient
- Gradient colors: `background.muted` -> `background.secondary` -> `background.muted`
- Animation: translateX from -100% to 100%, duration 1.5s, ease-in-out, infinite

**Skeleton Specifications:**
- Image placeholder: Full width, aspect ratio 1:1
- Title placeholder: 80% width, 16px height, 8px border radius
- Price placeholder: 40% width, 14px height, 8px border radius
- Spacing matches actual card layout

### 3.4 Empty State Design

**Initial Empty State (no query):**

Display search suggestions, history, and recommendations (see Section 5).

### 3.5 No Results State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         ┌─────────┐                             │
│                         │   💎    │                             │
│                         │    ?    │                             │
│                         └─────────┘                             │
│                                                                 │
│               Aucun resultat pour "xyz"                         │
│                                                                 │
│        Essayez d'autres termes ou explorez nos suggestions      │
│                                                                 │
│     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│     │    Bagues    │  │   Colliers   │  │  Bracelets   │       │
│     └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                 │
│           ┌─────────────────────────────────────┐               │
│           │     Parcourir toutes les categories  │               │
│           └─────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Illustration: Custom jewelry-themed empty state illustration
- Illustration size: 120px x 120px
- Title: 20px, `serif.medium`, `text.primary`
- Subtitle: 15px, `sans.regular`, `text.muted`, max-width 280px
- Suggestion chips: Pill style, `border.default` border, `text.secondary` text
- Browse button: Full width, `hermes.500` background, white text

---

## 4. Filters & Sorting

### 4.1 Bottom Sheet Filter Panel

**Sheet Behavior:**
- Gesture-driven (drag to expand/collapse)
- Snap points: 50% height, 90% height
- Background dim: `rgba(0,0,0,0.4)`
- Handle indicator at top: 40px x 4px, `border.medium`, centered

**Sheet Header:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         ────                                    │
│                                                                 │
│     Filtres                            Reinitialiser      ✕    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Header Specs:**
- Handle: 40px x 4px, 2px border radius, `border.medium`
- Title: 20px, `serif.medium`, `text.primary`
- Reset button: 14px, `sans.medium`, `hermes.500`, only visible when filters active
- Close button: 40px x 40px, `text.secondary` icon

### 4.2 Price Range Slider

```
┌─────────────────────────────────────────────────────────────────┐
│  Fourchette de prix                                             │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  0 EUR                                          5000+ EUR  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│          ○────────────●══════════════●────────────○            │
│                      150             1200                       │
│                                                                 │
│     ┌──────────────────┐     ┌──────────────────┐              │
│     │  Min:    150 EUR │     │  Max:   1200 EUR │              │
│     └──────────────────┘     └──────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Slider Specifications:**
- Track height: 4px
- Track background (inactive): `border.light`
- Track background (active/between thumbs): `hermes.500`
- Thumb size: 28px diameter
- Thumb background: `#ffffff`
- Thumb border: 2px solid `hermes.500`
- Thumb shadow: `0 2px 8px rgba(0,0,0,0.15)`

**Thumb Press Animation:**
```typescript
const thumbPressAnimation = {
  pressIn: {
    scale: 1.15,
    shadowOpacity: 0.25,
    duration: 100,
  },
  pressOut: {
    scale: 1,
    shadowOpacity: 0.15,
    spring: springConfigs.snap,
  },
  haptic: hapticFeedback.selectionAsync,
};
```

**Input Fields:**
- Style: Text input with currency formatting
- Border: 1px solid `border.default`
- Focus border: 1.5px solid `hermes.500`
- Height: 48px
- Border radius: 8px

### 4.3 Categories, Collections, Materials

**Filter Section Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Categories                                              ▼ / ▲  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ☐  Bagues                                              (45)   │
│  ☐  Colliers                                            (32)   │
│  ☑  Bracelets                                           (28)   │
│  ☐  Boucles d'oreilles                                  (56)   │
│  ☐  Montres                                             (12)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Checkbox Specifications:**
- Size: 24px x 24px
- Border radius: 6px
- Unchecked: Border 1.5px `border.default`, background transparent
- Checked: Background `hermes.500`, white checkmark icon
- Checkmark animation: Scale from 0 with slight overshoot (spring)

**Material/Stone Chips (Multi-select):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Matieres                                                       │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Or jaune │ │✓ Or blanc│ │ Or rose  │ │ Argent   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  ┌──────────┐ ┌──────────┐                                      │
│  │ Platine  │ │ Vermeil  │                                      │
│  └──────────┘ └──────────┘                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Chip Specifications:**
- Height: 40px
- Padding: 16px horizontal
- Border radius: 20px (pill)
- Unselected: Border 1px `border.default`, text `text.secondary`
- Selected: Background `hermes.50`, border 1.5px `hermes.300`, text `hermes.600`

### 4.4 Sort Options

**Sort Bottom Sheet:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         ────                                    │
│                                                                 │
│     Trier par                                                   │
│                                                                 │
│  ───────────────────────────────────────────────────────────── │
│                                                                 │
│  ●  Pertinence                                           ✓     │
│                                                                 │
│  ○  Prix croissant                                             │
│                                                                 │
│  ○  Prix decroissant                                           │
│                                                                 │
│  ○  Nouveautes                                                  │
│                                                                 │
│  ○  Les plus populaires                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Option Specifications:**
- Height: 56px per option
- Radio indicator: 24px diameter
- Unselected: Border 1.5px `border.default`
- Selected: `hermes.500` fill with white center dot (8px)
- Text: 16px, `sans.regular`, `text.primary`
- Checkmark (selected): `hermes.500`, 20px, right-aligned

### 4.5 Active Filters Display

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │ Bracelets  ✕   │ │ Or blanc   ✕   │ │ 150-1200EUR ✕  │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
│                                                    Effacer tout │
└─────────────────────────────────────────────────────────────────┘
```

**Active Filter Chip:**
- Height: 36px
- Padding: 12px left, 8px right
- Background: `hermes.50`
- Border: 1px solid `hermes.200`
- Border radius: 18px
- Text: 13px, `sans.medium`, `hermes.600`
- X icon: 16px, `hermes.400`

**Remove Animation:**
- Scale to 0 + fade out (200ms)
- Remaining chips animate to fill space (spring)

---

## 5. Search History & Suggestions

### 5.1 Recent Searches

```
┌─────────────────────────────────────────────────────────────────┐
│  Recherches recentes                              Effacer tout  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🕐  Bague solitaire                                  ✕ │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🕐  Collier or blanc                                 ✕ │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🕐  Bracelet tennis                                  ✕ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Section Header:**
- Title: 13px, `sans.semibold`, `text.muted`, uppercase, letter-spacing: 2px
- Clear all: 13px, `sans.medium`, `hermes.500`

**Recent Search Item:**
- Height: 48px
- Icon: Clock, 18px, `text.light`
- Text: 15px, `sans.regular`, `text.primary`
- Delete button: X icon, 18px, `text.light`, only visible on hover/press
- Swipe-to-delete gesture supported

**Storage:**
- Max 10 recent searches
- Stored in AsyncStorage
- Auto-expire after 30 days

### 5.2 Popular/Trending Searches

```
┌─────────────────────────────────────────────────────────────────┐
│  Tendances                                                      │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ 🔥 Bagues diamant│  │ Colliers or      │  │ Bracelets      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ Alliance         │  │ Boucles perles   │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Trending Chip:**
- Height: 40px
- Padding: 16px horizontal
- Background: `background.tertiary`
- Border radius: 20px
- Text: 14px, `sans.medium`, `text.secondary`
- Fire icon (if #1 trending): 14px, `hermes.500`

**Press Animation:**
```typescript
const trendingChipPress = {
  pressIn: {
    scale: 0.95,
    backgroundColor: COLORS.hermes[50],
    duration: 100,
  },
  pressOut: {
    scale: 1,
    backgroundColor: COLORS.background.tertiary,
    spring: springConfigs.snap,
  },
};
```

### 5.3 Quick Category Shortcuts

```
┌─────────────────────────────────────────────────────────────────┐
│  Parcourir                                                      │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │  [Image]   │ │  [Image]   │ │  [Image]   │ │  [Image]   │   │
│  │            │ │            │ │            │ │            │   │
│  │   Bagues   │ │  Colliers  │ │ Bracelets  │ │  Boucles   │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                 │
│  (Horizontal scroll)                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Category Shortcut Card:**
- Size: 100px x 120px
- Border radius: 12px
- Image height: 80px
- Image style: Gradient overlay from bottom
- Text: 13px, `sans.medium`, `text.primary`, centered

### 5.4 "Vous aimerez peut-etre" Suggestions

```
┌─────────────────────────────────────────────────────────────────┐
│  Vous aimerez peut-etre                             Voir tout → │
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────  │
│  │   [Image]   │ │   [Image]   │ │   [Image]   │ │   [Image]  │ │
│  │             │ │             │ │             │ │            │ │
│  │ Product 1   │ │ Product 2   │ │ Product 3   │ │ Product 4 │ │
│  │ 890,00 EUR  │ │ 1 250,00EUR │ │ 650,00 EUR  │ │ 1 890,00 E│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────  │
│                                                                 │
│  (Horizontal scroll)                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Suggestion Logic:**
1. Based on recent searches
2. Based on browsing history
3. Based on favorites
4. Popular items in relevant categories

**Card Size:**
- Width: 160px
- Image aspect ratio: 1:1
- Border radius: 10px

---

## 6. Micro-interactions

### 6.1 Haptic Feedback Points

```typescript
/**
 * Haptic feedback configuration for search interactions
 */
export const searchHaptics = {
  // Search bar interactions
  searchBarFocus: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  searchBarClear: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Search mode selection
  modeSelect: () => Haptics.selectionAsync(),

  // Voice search
  voiceSearchStart: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  voiceSearchStop: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  voiceSearchSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  voiceSearchError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  // Scanner
  scanSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  scanError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // Suggestions
  suggestionSelect: () => Haptics.selectionAsync(),
  recentSearchDelete: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Filters
  filterToggle: () => Haptics.selectionAsync(),
  sliderThumbDrag: () => Haptics.selectionAsync(),
  sliderSnapToValue: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  filterApply: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  filterReset: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // Results
  viewModeToggle: () => Haptics.selectionAsync(),
  productCardPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  favoriteToggle: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  // Load more
  loadMoreTrigger: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  refreshPull: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
};
```

### 6.2 Animation Timing

```typescript
/**
 * Animation timing configurations for search components
 */
export const searchAnimations = {
  // Search bar
  searchBar: {
    focus: {
      height: { duration: 250, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
      border: { duration: 200 },
      shadow: { duration: 300 },
    },
    blur: {
      all: { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
    },
    placeholder: {
      fadeOut: { duration: 200, easing: Easing.out(Easing.ease) },
      fadeIn: { duration: 300, easing: Easing.out(Easing.cubic) },
      slideUp: { duration: 300, easing: Easing.out(Easing.cubic) },
      dwell: 4000,
    },
    clearButton: {
      enter: {
        scale: { type: 'spring', damping: 15, stiffness: 200 },
        opacity: { duration: 150 },
        rotation: { duration: 200, from: -90 },
      },
      exit: {
        scale: { duration: 150, easing: Easing.out(Easing.ease) },
        opacity: { duration: 100 },
      },
    },
  },

  // Overlays
  overlay: {
    backdrop: {
      enter: { duration: 300 },
      exit: { duration: 200 },
    },
    content: {
      enter: {
        opacity: { duration: 300, delay: 50 },
        scale: { type: 'spring', damping: 20, stiffness: 300 },
      },
      exit: {
        opacity: { duration: 200 },
        scale: { duration: 200, easing: Easing.in(Easing.ease) },
      },
    },
  },

  // Suggestions
  suggestions: {
    list: {
      stagger: 50,
      itemEnter: { duration: 250, easing: Easing.out(Easing.cubic) },
    },
    item: {
      press: { scale: 0.98, duration: 100 },
      release: { type: 'spring', damping: 15, stiffness: 300 },
    },
  },

  // Results
  results: {
    viewToggle: { duration: 300, easing: Easing.inOut(Easing.ease) },
    itemStagger: 40,
    itemEnter: {
      opacity: { duration: 300 },
      translateY: { duration: 350, from: 20, easing: Easing.out(Easing.cubic) },
    },
    skeleton: {
      shimmer: { duration: 1500, easing: Easing.inOut(Easing.ease) },
    },
  },

  // Filters
  filters: {
    bottomSheet: {
      snapAnimation: { type: 'spring', damping: 25, stiffness: 300 },
    },
    checkbox: {
      check: { type: 'spring', damping: 12, stiffness: 300 },
    },
    chip: {
      select: { duration: 200 },
      remove: {
        scale: { duration: 200, easing: Easing.out(Easing.ease) },
        opacity: { duration: 150 },
      },
    },
    slider: {
      thumb: {
        press: { scale: 1.15, duration: 100 },
        release: { type: 'spring', damping: 15, stiffness: 300 },
      },
    },
  },
};
```

### 6.3 Transition Effects

**Page Transitions:**
```typescript
const pageTransitions = {
  // Search screen entry (from home/other)
  searchScreenEnter: {
    animation: 'slide-up',
    duration: 350,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },

  // Search to product detail
  toProductDetail: {
    animation: 'shared-element', // Image morphs to detail view
    duration: 400,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },

  // Filter sheet
  filterSheet: {
    enter: {
      backdrop: { opacity: 0.4, duration: 300 },
      sheet: { translateY: '100%', to: 0, type: 'spring', damping: 25 },
    },
    exit: {
      backdrop: { opacity: 0, duration: 200 },
      sheet: { translateY: '100%', duration: 250 },
    },
  },
};
```

**Shared Element Transitions:**
- Product image from search result to product detail
- Search bar morphing when navigating to dedicated search screen

---

## User Flow Diagrams

### Flow 1: Basic Text Search

```
┌─────────────┐
│   Home      │
│   Screen    │
└──────┬──────┘
       │ Tap search icon
       ▼
┌─────────────┐
│   Search    │◄────────────────────────┐
│   Screen    │                         │
└──────┬──────┘                         │
       │ Tap search bar                 │
       ▼                                │
┌─────────────┐                         │
│ Search Bar  │                         │
│  Focused    │                         │
│  + History  │                         │
│  + Trending │                         │
└──────┬──────┘                         │
       │ Type query                     │
       ▼                                │
┌─────────────┐                         │
│   Auto-     │                         │
│ Suggestions │                         │
└──────┬──────┘                         │
       │ Submit / Select suggestion     │
       ▼                                │
┌─────────────┐                         │
│   Search    │  No results             │
│   Results   │────────────────────────►│
└──────┬──────┘                         │
       │ Tap product                    │
       ▼                                │
┌─────────────┐                         │
│   Product   │  Back                   │
│   Detail    │─────────────────────────┘
└─────────────┘
```

### Flow 2: Filtered Search

```
┌─────────────┐
│   Search    │
│   Results   │
└──────┬──────┘
       │ Tap "Filtres"
       ▼
┌─────────────────────────────────┐
│        Filter Bottom Sheet       │
│                                  │
│   ┌─────────────────────────┐   │
│   │  Price Range Slider     │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │  Categories (checkboxes)│   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │  Materials (chips)      │   │
│   └─────────────────────────┘   │
│                                  │
│   ┌─────────────────────────┐   │
│   │    Appliquer (24)       │   │
│   └─────────────────────────┘   │
└────────────────┬────────────────┘
                 │ Tap "Appliquer"
                 ▼
┌─────────────────────────────────┐
│       Filtered Results          │
│                                  │
│  ┌────────┐ ┌────────┐ ┌────┐  │
│  │ Filter │ │ Filter │ │ +3 │  │  Active filters
│  └────────┘ └────────┘ └────┘  │
│                                  │
│  ┌─────────┐  ┌─────────┐      │
│  │ Product │  │ Product │      │
│  └─────────┘  └─────────┘      │
│                                  │
└─────────────────────────────────┘
```

### Flow 3: Voice Search

```
┌─────────────┐
│   Search    │
│   Screen    │
└──────┬──────┘
       │ Tap microphone
       ▼
┌─────────────────────────────────┐
│       Voice Search Overlay       │
│                                  │
│              🎤                  │
│         "Listening..."           │
│                                  │
│   ══════════════════════════    │  Waveform
│                                  │
│     "bague en or avec..."        │  Live transcription
│                                  │
└────────────────┬────────────────┘
                 │ Speech ends / Tap to stop
                 ▼
┌─────────────┐
│  Processing │
│     ...     │
└──────┬──────┘
       │ Query recognized
       ▼
┌─────────────┐
│   Search    │
│   Results   │
└─────────────┘
```

### Flow 4: Visual Search

```
┌─────────────┐
│   Search    │
│   Screen    │
└──────┬──────┘
       │ Tap camera/visual search
       ▼
┌─────────────────────────────────┐
│      Visual Search Overlay       │
│                                  │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │     Camera Preview      │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                  │
│      [Gallery]    [◉ Capture]   │
│                                  │
└────────────────┬────────────────┘
                 │ Take photo / Select from gallery
                 ▼
┌─────────────────────────────────┐
│          Analyzing...            │
│                                  │
│   ┌─────────────────────────┐   │
│   │     [Captured Image]    │   │
│   │                         │   │
│   │    ░░░░░░░░░░░░░░░     │   │
│   │    Analyzing jewelry... │   │
│   └─────────────────────────┘   │
│                                  │
└────────────────┬────────────────┘
                 │ Analysis complete
                 ▼
┌─────────────────────────────────┐
│      Similar Products Found      │
│                                  │
│   Your image:  ┌─────┐          │
│                │ [📷] │          │
│                └─────┘          │
│                                  │
│   Similar items:                 │
│   ┌─────┐ ┌─────┐ ┌─────┐      │
│   │     │ │     │ │     │      │
│   └─────┘ └─────┘ └─────┘      │
│                                  │
└─────────────────────────────────┘
```

---

## Accessibility Specifications

### WCAG 2.1 AA Compliance

**Color Contrast:**
- All text meets minimum 4.5:1 contrast ratio
- Large text (18px+) meets 3:1 contrast ratio
- Interactive elements have visible focus states
- Do not rely on color alone to convey information

**Contrast Ratios (verified):**
| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Primary text | #2b333f | #fffcf7 | 10.2:1 |
| Secondary text | #696969 | #fffcf7 | 4.9:1 |
| Muted text | #8b8b8b | #fffcf7 | 3.5:1 * |
| Hermes accent | #f67828 | #fffcf7 | 3.1:1 ** |
| White on Hermes | #ffffff | #f67828 | 3.1:1 ** |

\* Muted text used only for non-essential information
\*\* Hermes color used with supporting elements, not text-only

**Keyboard Navigation:**
- All interactive elements accessible via keyboard
- Logical tab order
- Visible focus indicators
- Escape key closes overlays/modals

**Screen Reader Support:**
```typescript
// Accessibility labels for search components
const accessibilityLabels = {
  searchBar: {
    label: 'Champ de recherche',
    hint: 'Entrez votre recherche ou utilisez les boutons pour la recherche vocale ou visuelle',
  },
  voiceSearchButton: {
    label: 'Recherche vocale',
    hint: 'Appuyez pour effectuer une recherche vocale',
  },
  cameraButton: {
    label: 'Recherche visuelle',
    hint: 'Appuyez pour scanner un code-barres ou photographier un bijou',
  },
  clearButton: {
    label: 'Effacer la recherche',
  },
  filterButton: {
    label: 'Filtres',
    hint: activeFiltersCount > 0
      ? `${activeFiltersCount} filtres actifs`
      : 'Aucun filtre actif',
  },
  viewToggle: {
    gridView: 'Affichage en grille',
    listView: 'Affichage en liste',
  },
  productCard: {
    label: (product) => `${product.name}, ${formatPrice(product.price)}`,
    hint: 'Appuyez pour voir les details',
  },
  favoriteButton: {
    addLabel: 'Ajouter aux favoris',
    removeLabel: 'Retirer des favoris',
  },
};
```

**Touch Targets:**
- Minimum touch target size: 44x44 points
- Adequate spacing between interactive elements (minimum 8px)

**Motion Sensitivity:**
- Respect `prefers-reduced-motion` setting
- Provide option to disable animations
- Essential animations only when reduced motion is enabled

```typescript
// Reduced motion configuration
import { AccessibilityInfo } from 'react-native';

const useReducedMotion = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => listener.remove();
  }, []);

  return reduceMotion;
};

// Animation duration when reduced motion is enabled
const getAnimationDuration = (normalDuration: number, reduceMotion: boolean) => {
  return reduceMotion ? 0 : normalDuration;
};
```

---

## Technical Implementation Notes

### State Management

```typescript
// Search state structure
interface SearchState {
  // Query
  query: string;
  debouncedQuery: string;

  // Mode
  searchMode: 'text' | 'voice' | 'barcode' | 'visual';

  // UI State
  isSearchBarFocused: boolean;
  isLoading: boolean;
  isFilterSheetOpen: boolean;
  isSortSheetOpen: boolean;

  // Results
  results: Product[];
  totalResults: number;
  hasMoreResults: boolean;
  page: number;

  // Display
  viewMode: 'grid' | 'list';

  // Filters
  activeFilters: {
    priceRange: [number, number] | null;
    categories: string[];
    collections: string[];
    materials: string[];
    stones: string[];
  };

  // Sort
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';

  // Suggestions
  autoSuggestions: Suggestion[];
  recentSearches: string[];
  popularSearches: string[];

  // Errors
  error: string | null;
}
```

### API Integration

```typescript
// Search API endpoints
const searchAPI = {
  // Main search
  search: (params: {
    query: string;
    filters?: FilterParams;
    sort?: SortOption;
    page?: number;
    limit?: number;
  }) => fetch(`/api/search?${buildQueryString(params)}`),

  // Autocomplete suggestions
  suggest: (query: string) =>
    fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`),

  // Visual search
  visualSearch: (imageData: string) =>
    fetch('/api/search/visual', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    }),

  // Barcode lookup
  barcodeLookup: (barcode: string) =>
    fetch(`/api/products/barcode/${barcode}`),

  // Popular searches
  getPopularSearches: () =>
    fetch('/api/search/popular'),
};
```

### Performance Optimizations

1. **Debounced Search:** 300ms debounce on text input
2. **Virtual List:** Use `FlashList` for results (better than FlatList)
3. **Image Optimization:** Progressive loading, appropriate sizes
4. **Skeleton Caching:** Pre-render skeleton states
5. **Filter Memoization:** Memoize filter calculations
6. **Prefetching:** Prefetch next page of results

### Required Packages

```json
{
  "dependencies": {
    "react-native-reanimated": "^3.x",
    "expo-haptics": "^12.x",
    "expo-camera": "^14.x",
    "expo-barcode-scanner": "^12.x",
    "expo-speech": "^11.x",
    "@gorhom/bottom-sheet": "^4.x",
    "@shopify/flash-list": "^1.x",
    "react-native-gesture-handler": "^2.x",
    "lucide-react-native": "^0.x"
  }
}
```

### Component Files Structure

```
apps/mobile/components/search/
├── index.ts                        # Exports
├── LuxurySearchBar.tsx             # Main search bar component
├── SearchModeSelector.tsx          # Mode selection (text/voice/scan/visual)
├── SearchSuggestions.tsx           # Auto-suggestions list
├── SearchResults.tsx               # Results container
├── SearchProductCard.tsx           # Product card for grid view
├── SearchProductListItem.tsx       # Product item for list view
├── SearchSkeleton.tsx              # Loading skeletons
├── SearchEmptyState.tsx            # Empty/no results states
├── SearchHistory.tsx               # Recent searches section
├── PopularSearches.tsx             # Trending searches section
├── QuickCategories.tsx             # Category shortcuts
├── SuggestionProducts.tsx          # "Vous aimerez peut-etre" section
├── FilterBottomSheet.tsx           # Filters modal
├── SortBottomSheet.tsx             # Sort options modal
├── PriceRangeSlider.tsx            # Price filter component
├── FilterCheckbox.tsx              # Category/collection checkbox
├── FilterChip.tsx                  # Material/stone chip
├── ActiveFiltersBar.tsx            # Active filters display
├── VoiceSearchOverlay.tsx          # Voice search modal
├── CameraScannerOverlay.tsx        # Barcode/QR scanner modal
├── VisualSearchOverlay.tsx         # Visual search modal
└── constants/
    ├── animations.ts               # Search-specific animations
    ├── haptics.ts                  # Haptic feedback config
    └── styles.ts                   # Shared styles/design tokens
```

---

## Appendix: UI Labels (French)

```typescript
export const SEARCH_LABELS = {
  // Search bar
  placeholder: 'Rechercher un bijou...',
  placeholders: [
    'Rechercher un bijou...',
    'Bague de fiancailles...',
    'Collier en or...',
    'Bracelet diamant...',
    'Boucles d\'oreilles...',
  ],
  clear: 'Effacer',

  // Modes
  modes: {
    text: 'Texte',
    voice: 'Voix',
    scanner: 'Scanner',
    visual: 'Visuel',
  },

  // Sections
  sections: {
    recentSearches: 'Recherches recentes',
    popularSearches: 'Tendances',
    browse: 'Parcourir',
    suggestions: 'Vous aimerez peut-etre',
  },

  // Actions
  actions: {
    clearAll: 'Effacer tout',
    viewAll: 'Voir tout',
    apply: 'Appliquer',
    reset: 'Reinitialiser',
    close: 'Fermer',
  },

  // Results
  results: {
    count: (n: number) => `${n} resultat${n > 1 ? 's' : ''}`,
    countFor: (n: number, query: string) =>
      `${n} resultat${n > 1 ? 's' : ''} pour "${query}"`,
    noResults: 'Aucun resultat',
    noResultsFor: (query: string) => `Aucun resultat pour "${query}"`,
    tryOther: 'Essayez d\'autres termes ou explorez nos suggestions',
    browseAll: 'Parcourir toutes les categories',
  },

  // Filters
  filters: {
    title: 'Filtres',
    priceRange: 'Fourchette de prix',
    min: 'Min',
    max: 'Max',
    categories: 'Categories',
    collections: 'Collections',
    materials: 'Matieres',
    stones: 'Pierres',
  },

  // Sort
  sort: {
    title: 'Trier par',
    relevance: 'Pertinence',
    priceAsc: 'Prix croissant',
    priceDesc: 'Prix decroissant',
    newest: 'Nouveautes',
    popular: 'Les plus populaires',
  },

  // Voice search
  voice: {
    listening: 'Parlez maintenant...',
    processing: 'Traitement...',
    tapToStop: 'Appuyez pour arreter',
    error: 'Impossible de reconnaitre votre voix',
    retry: 'Reessayer',
  },

  // Scanner
  scanner: {
    barcode: 'Code-barres',
    qrCode: 'QR Code',
    align: 'Alignez le code dans le cadre',
    notFound: 'Produit non trouve',
  },

  // Visual search
  visual: {
    capture: 'Capturer',
    gallery: 'Galerie',
    analyzing: 'Analyse en cours...',
    hint: 'Photographiez un bijou pour trouver des pieces similaires',
    similar: 'Pieces similaires',
    noMatch: 'Aucune correspondance trouvee',
  },
};
```

---

## Document Version

- **Version:** 1.0
- **Date:** December 2024
- **Author:** UX Design Team
- **Status:** Ready for Implementation

---

*This specification document serves as the definitive reference for implementing the luxury search experience. All measurements, colors, and timing values should be followed precisely to maintain consistency with the established design system.*
