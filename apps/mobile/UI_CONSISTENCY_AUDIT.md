# UI Design Consistency Audit Report

**Date**: 2025-12-13
**Scope**: Mobile app at `/apps/mobile`
**Focus**: Search feature components and screens

---

## Executive Summary

The mobile app has multiple local `COLORS` objects defined in each component file rather than using centralized design tokens. This leads to inconsistencies in color values, naming conventions, and creates maintenance challenges.

---

## 1. Color Consistency Issues

### Critical Finding: Duplicate COLORS Objects

Each component defines its own `COLORS` object locally instead of importing from a shared location. Found **8+ different COLORS definitions** across:

| File | Colors Defined |
|------|----------------|
| `VoiceSearch.tsx` | 14 colors |
| `BarcodeScanner.tsx` | 8 colors |
| `ScannerOverlay.tsx` | 9 colors |
| `search.tsx` (screen) | 10 colors |
| `cart.tsx` (screen) | 12 colors |
| `LuxuryAddToCartBar.tsx` | 11 colors |
| `CartQuantitySelector.tsx` | 10 colors |
| `LuxuryQuantitySelector.tsx` | 8 colors |

### Color Value Inconsistencies

#### Hermes Orange (Primary Brand Color)
- **Most files**: `#f67828` (Correct)
- **No inconsistencies found** - all files use the same value

#### Background Colors
| Color Name | Values Found | Files |
|------------|--------------|-------|
| `background` | `#fffcf7` | All files (Consistent) |
| `backgroundBeige` | `#fcf7f1` | cart.tsx, CartQuantitySelector.tsx |
| `backgroundBeige` | `#f8f5f0` | search.tsx (screen) |
| `hermesLight` | `#fff7ed` | search.tsx, LuxuryQuantitySelector.tsx |
| `hermesLight` | `rgba(246, 120, 40, 0.15)` | VoiceSearch.tsx |

**Issue**: `backgroundBeige` has 2 different hex values, `hermesLight` uses hex in some files and rgba in others.

#### Stone/Muted Gray
| Color Name | Values Found | Files |
|------------|--------------|-------|
| `stone` | `#b8a99a` | Most files (Consistent) |
| `muted` | `#696969` | search.tsx |
| `textMuted` | `#696969` | cart.tsx |

**Issue**: Same color has different names (`muted` vs `textMuted`).

#### Error Color
| Color Name | Values Found | Files |
|------------|--------------|-------|
| `error` | `#dc2626` | VoiceSearch.tsx |
| `danger` | `#dc2626` | cart.tsx |
| error text | `#ef4444` | ScannerOverlay.tsx (hardcoded in styles) |

**Issue**: Different naming (`error` vs `danger`) and one hardcoded different shade.

#### Border Colors
| Color Name | Values Found | Files |
|------------|--------------|-------|
| `borderLight` | `#f0ebe3` | VoiceSearch.tsx, LuxuryAddToCartBar.tsx |
| `sand` | `#f0ebe3` | search.tsx, LuxuryQuantitySelector.tsx |
| `border` | `#e2d8ce` | cart.tsx, CartQuantitySelector.tsx |

**Issue**: Same visual purpose with different names (`borderLight` vs `sand`).

### Missing Colors in Some Files

| Color | Present In | Missing From |
|-------|-----------|--------------|
| `gold` | BarcodeScanner, ScannerOverlay | VoiceSearch, search.tsx |
| `hermesDark` | cart.tsx, LuxuryAddToCartBar | BarcodeScanner |
| `successLight` | cart.tsx, LuxuryAddToCartBar | VoiceSearch |

---

## 2. Typography Consistency Issues

### Font Families Used
- **PlayfairDisplay** - Headlines, titles
- **PlayfairDisplay-SemiBold** - Emphasized titles
- **Inter** - Body text, labels
- **Inter-Regular** - Regular weight body
- **Inter-Medium** - Medium weight
- **Inter-SemiBold** - Semi-bold weight
- **Inter-Bold** - Bold weight

### Inconsistent Font Family References

| File | Font Reference | Issue |
|------|----------------|-------|
| `cart.tsx` | `fontFamily: 'Inter'` | Missing weight suffix |
| `cart.tsx` | `fontFamily: 'PlayfairDisplay'` | Missing weight suffix |
| `search.tsx` | `fontFamily: 'PlayfairDisplay'` | Should be `PlayfairDisplay-Regular` |
| `VoiceSearch.tsx` | `fontFamily: 'Inter-SemiBold'` | Correct format |
| `LuxuryAddToCartBar.tsx` | `fontFamily: 'Inter'` with `fontWeight: '600'` | Mixed approach |

**Recommendation**: Standardize on using font files with weight suffix (e.g., `Inter-SemiBold`) instead of mixing `fontWeight` property.

### Font Size Scale

| Use Case | Sizes Found | Recommendation |
|----------|-------------|----------------|
| Page Title | 32, 26 | Standardize to 32 |
| Section Title | 18, 20, 24 | Standardize to 20 or 24 |
| Body Text | 14, 15, 16 | Standardize to 15 |
| Small/Label | 11, 12, 13, 14 | Standardize to 12 |
| Tiny/Caption | 10, 11 | Standardize to 11 |

---

## 3. Spacing Consistency Issues

### Padding/Margin Values Used

The design system scale should be: **8, 12, 16, 20, 24, 32, 40, 48**

| Found Value | On Scale? | Occurrences | Files |
|-------------|-----------|-------------|-------|
| 4 | Yes | Many | Various (button internal) |
| 8 | Yes | Many | Various |
| 10 | No | Few | search.tsx, VoiceSearch.tsx |
| 12 | Yes | Many | Various |
| 14 | No | Few | cart.tsx |
| 16 | Yes | Many | Various |
| 18 | No | Few | cart.tsx |
| 20 | Yes | Many | Various |
| 24 | Yes | Many | Various |
| 28 | No | Few | Various (button margins) |
| 32 | Yes | Many | Various |
| 40 | Yes | Few | BarcodeScanner.tsx |

**Off-scale values to fix**: 10, 14, 18, 28

---

## 4. Border Radius Consistency Issues

### Border Radius Scale

| Purpose | Values Found | Recommendation |
|---------|--------------|----------------|
| Small (chips, tags) | 2, 4 | 4 |
| Medium (buttons, cards) | 8, 12, 16 | 12 |
| Large (modals, sheets) | 20, 22, 24, 26, 28 | 24 |
| Full (circular) | 40, 44, 50 | Half of element size |

### Specific Issues

| Component | Current | Issue |
|-----------|---------|-------|
| Button border-radius | 26, 28 | Inconsistent |
| Card border-radius | 12, 16 | Inconsistent |
| Modal border-radius | 22, 24 | Inconsistent |

---

## 5. Shadow Consistency Issues

### Shadow Definitions Found

```javascript
// VoiceSearch.tsx - Card shadow
shadowColor: '#000',
shadowOffset: { width: 0, height: 10 },
shadowOpacity: 0.15,
shadowRadius: 30,
elevation: 20,

// search.tsx - Trending card shadow
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.06,
shadowRadius: 8,
elevation: 2,

// LuxuryAddToCartBar.tsx - No shadow on main button
// (Using glow effect instead)
```

**Issue**: No standardized shadow scale. Values are ad-hoc.

**Recommendation**: Create shadow presets:
- `shadow.sm`: Subtle (opacity: 0.05, radius: 4)
- `shadow.md`: Medium (opacity: 0.08, radius: 8)
- `shadow.lg`: Large (opacity: 0.12, radius: 16)
- `shadow.xl`: Extra large (opacity: 0.15, radius: 24)

---

## 6. Critical Issues in Search Components

### Priority 1 - Must Fix

1. **ScannerOverlay.tsx line 582-585**: Hardcoded error color `#ef4444` instead of token
2. **ScannerOverlay.tsx lines 505, 555**: Hardcoded rgba colors in styles
3. **BarcodeScanner.tsx lines 87-88, 107**: Hardcoded gradient color `#ea580c`
4. **VoiceSearch.tsx**: `hermesLight` uses rgba while other files use hex

### Priority 2 - Should Fix

1. Inconsistent naming (`error` vs `danger`, `muted` vs `textMuted`)
2. Multiple definitions of `backgroundBeige` with different values
3. Font family references without weight suffix

### Priority 3 - Nice to Have

1. Standardize spacing to 8-point grid
2. Standardize border-radius values
3. Create shadow presets

---

## 7. Recommended Actions

### Immediate Actions

1. **Create shared design tokens file** at `constants/designTokens.ts`
2. **Update search components** to import from shared tokens
3. **Fix hardcoded colors** in ScannerOverlay.tsx

### Short-term Actions

1. Update all component files to use shared tokens
2. Standardize font family references
3. Create spacing and shadow scale constants

### Long-term Actions

1. Consider using Tailwind classes more consistently
2. Create component library with built-in token usage
3. Add linting rules to prevent hardcoded values

---

## 8. Files Requiring Updates

### Search Feature (Priority)
- [x] Create `constants/designTokens.ts`
- [ ] `components/search/VoiceSearch.tsx`
- [ ] `components/search/BarcodeScanner.tsx`
- [ ] `components/search/ScannerOverlay.tsx`
- [ ] `components/search/SearchBar.tsx`
- [ ] `components/search/SearchResults.tsx`
- [ ] `components/search/SearchFilters.tsx`
- [ ] `app/(tabs)/search.tsx`

### Other Components (Secondary)
- [ ] `app/(tabs)/cart.tsx`
- [ ] `components/product/LuxuryAddToCartBar.tsx`
- [ ] `components/cart/CartQuantitySelector.tsx`
- [ ] `components/product/LuxuryQuantitySelector.tsx`

---

*Report generated by UI Design Consistency Audit*
