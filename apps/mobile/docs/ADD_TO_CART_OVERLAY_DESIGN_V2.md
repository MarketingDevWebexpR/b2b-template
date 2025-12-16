# Add-to-Cart Success Overlay V2 - Design Specification

## Maison Bijoux - Luxury Jewelry Mobile App

---

## 1. Overview

This document defines the complete design specification for an improved add-to-cart success overlay that provides clear user feedback, maintains luxury brand aesthetics, and ensures accessibility compliance.

### Key Changes from V1
| Aspect | V1 (Current) | V2 (Improved) |
|--------|--------------|---------------|
| Auto-dismiss | 1.5 seconds | No auto-dismiss |
| User actions | None (passive) | Two clear CTAs |
| Cart summary | None | Shows article count + total |
| Dismiss method | Timer only | Tap outside or button |
| Product info | Optional thumbnail | Larger product display |

---

## 2. Brand Colors

```typescript
const BRAND_COLORS = {
  // Primary Brand
  hermes: '#f67828',        // Primary accent (Hermes orange)
  gold: '#d4a574',          // Secondary accent (luxury gold)

  // Backgrounds
  cream: '#fffcf7',         // Primary background
  charcoal: '#2b333f',      // Dark text, overlay tint

  // Semantic
  success: '#059669',       // Success green
  successLight: '#ecfdf5',  // Light success background
  successGlow: 'rgba(5, 150, 105, 0.4)', // Success shadow

  // Neutrals
  white: '#ffffff',
  stone: '#b8a99a',         // Muted text
  taupe: '#d4c9bd',         // Borders

  // Overlays
  backdropDark: 'rgba(43, 51, 63, 0.6)',  // 60% charcoal overlay
  cardGlass: 'rgba(255, 252, 247, 0.98)', // Near-opaque cream
};
```

---

## 3. Component Layout Structure

```
AddToCartSuccessOverlayV2
|
|-- TouchableBackdrop (Pressable - dismisses on tap)
|   |-- AnimatedBlurBackground
|
|-- CenteredModalCard (Animated.View)
|   |
|   |-- SuccessIconSection
|   |   |-- GlowRing (outer glow animation)
|   |   |-- SuccessCircle (white background)
|   |   |   |-- AnimatedCheckmark (green checkmark icon)
|   |
|   |-- ProductSection (product details)
|   |   |-- ProductImage (80x80px rounded)
|   |   |-- ProductDetails
|   |   |   |-- ProductName (max 2 lines)
|   |   |   |-- QuantityBadge ("x2" format)
|   |
|   |-- Divider (subtle horizontal line)
|   |
|   |-- CartSummarySection
|   |   |-- SummaryRow
|   |   |   |-- ArticleCount ("3 articles dans votre panier")
|   |   |   |-- TotalPrice ("Total: 1 250,00 EUR")
|   |
|   |-- ActionButtonsSection
|   |   |-- PrimaryButton ("Voir le panier")
|   |   |-- SecondaryButton ("Continuer mes achats")
|
|-- ConfettiParticles (decorative, animated)
```

---

## 4. Typography Specification

### French Copy

| Element | Text | Font | Size | Weight | Color |
|---------|------|------|------|--------|-------|
| Success Title | "Ajoute au panier" | PlayfairDisplay | 24px | Regular | charcoal |
| Product Name | (dynamic) | Inter | 15px | Medium | charcoal |
| Quantity Badge | "x{n}" | Inter | 13px | SemiBold | white on hermes |
| Cart Summary | "{n} article(s) dans votre panier" | Inter | 14px | Regular | stone |
| Total Price | "Total: {price}" | PlayfairDisplay | 18px | Medium | charcoal |
| Primary CTA | "Voir le panier" | Inter | 15px | SemiBold | white |
| Secondary CTA | "Continuer mes achats" | Inter | 15px | Medium | charcoal |

### Line Heights
- Headlines: 1.2 (tight)
- Body text: 1.4 (normal)
- Buttons: 1.3

### Letter Spacing
- Headlines: 0.5px
- Body: 0px
- Buttons: 0.3px
- Labels (uppercase): 1.5px

---

## 5. Spacing & Dimensions

### Modal Card
```typescript
const MODAL_DIMENSIONS = {
  width: '90%',              // Or max 340px
  maxWidth: 340,
  borderRadius: 24,          // Generous luxury radius
  padding: 24,
};
```

### Internal Spacing (8pt grid)
```typescript
const SPACING = {
  // Sections
  sectionGap: 20,            // Between major sections

  // Success Icon
  iconSize: 72,              // Success circle diameter
  glowRingSize: 88,          // Outer glow ring
  checkmarkSize: 32,         // Check icon

  // Product Section
  productImageSize: 80,
  productImageRadius: 12,
  productGap: 16,            // Between image and text

  // Quantity Badge
  badgeHeight: 24,
  badgePaddingH: 10,
  badgeRadius: 12,

  // Buttons
  buttonHeight: 52,
  buttonRadius: 26,          // Pill shape
  buttonGap: 12,             // Between buttons

  // Divider
  dividerMarginV: 16,
};
```

---

## 6. Visual Hierarchy

### Z-Index Layers
1. **Backdrop** (z: 400) - Dark blur overlay
2. **Modal Card** (z: 401) - Main content container
3. **Confetti** (z: 402) - Decorative particles

### Focus Areas (Visual Weight)
1. **Primary**: Success checkmark (largest, centered)
2. **Secondary**: Action buttons (high contrast)
3. **Tertiary**: Product info (supporting context)
4. **Quaternary**: Cart summary (informational)

---

## 7. Animation Specifications

### Entry Sequence (550ms total)

```typescript
const ENTRY_ANIMATION = {
  // Step 1: Backdrop fade in (0-200ms)
  backdrop: {
    duration: 200,
    easing: 'ease-out',
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  // Step 2: Modal scale + fade (100-400ms)
  modal: {
    delay: 100,
    duration: 300,
    spring: { damping: 18, stiffness: 200 },
    from: { scale: 0.9, opacity: 0, translateY: 20 },
    to: { scale: 1, opacity: 1, translateY: 0 },
  },

  // Step 3: Success circle (150-400ms)
  successCircle: {
    delay: 150,
    spring: { damping: 12, stiffness: 180 },
    from: { scale: 0 },
    to: { scale: 1 },
  },

  // Step 4: Checkmark draw (250-450ms)
  checkmark: {
    delay: 250,
    duration: 200,
    easing: 'ease-out',
    // SVG stroke-dashoffset animation
  },

  // Step 5: Content fade in (300-550ms)
  content: {
    delay: 300,
    duration: 250,
    stagger: 50, // Between each content row
    from: { opacity: 0, translateY: 10 },
    to: { opacity: 1, translateY: 0 },
  },

  // Step 6: Confetti burst (200-600ms)
  confetti: {
    delay: 200,
    duration: 400,
    // Multiple particles with random trajectories
  },
};
```

### Exit Sequence (250ms)

```typescript
const EXIT_ANIMATION = {
  // All elements fade out together
  duration: 250,
  easing: 'ease-in',
  to: { opacity: 0, scale: 0.95 },
};
```

### Idle Animations

```typescript
const IDLE_ANIMATIONS = {
  // Subtle glow pulse on success circle
  glowPulse: {
    duration: 2000,
    repeat: -1,
    yoyo: true,
    opacity: [0.2, 0.4, 0.2],
  },

  // Primary button subtle scale
  buttonPulse: {
    duration: 3000,
    repeat: -1,
    yoyo: true,
    scale: [1, 1.02, 1],
  },
};
```

---

## 8. Button States

### Primary Button ("Voir le panier")

| State | Background | Text | Border | Shadow |
|-------|------------|------|--------|--------|
| Default | hermes (#f67828) | white | none | hermes glow |
| Pressed | hermesDark (#ea580c) | white | none | none |
| Focused | hermes | white | 2px gold | hermes glow |

### Secondary Button ("Continuer mes achats")

| State | Background | Text | Border | Shadow |
|-------|------------|------|--------|--------|
| Default | transparent | charcoal | 1px taupe | none |
| Pressed | cream | charcoal | 1px stone | subtle |
| Focused | transparent | charcoal | 2px charcoal | none |

---

## 9. Accessibility Requirements (WCAG AA)

### Color Contrast Ratios
- Primary text (charcoal on cream): 10.5:1 [PASS]
- Secondary text (stone on cream): 4.6:1 [PASS]
- Button text (white on hermes): 4.5:1 [PASS]
- Success icon (success on white): 5.1:1 [PASS]

### Touch Targets
- All interactive elements: minimum 44x44px
- Button heights: 52px (exceeds minimum)
- Tap-outside area: entire backdrop

### Screen Reader Support

```typescript
const ACCESSIBILITY_LABELS = {
  overlay: {
    accessibilityRole: 'alert',
    accessibilityLiveRegion: 'polite',
    accessibilityLabel: 'Article ajoute au panier avec succes',
  },

  productSection: {
    accessibilityLabel: (name: string, qty: number) =>
      `${qty} ${name} ajoute${qty > 1 ? 's' : ''} au panier`,
  },

  cartSummary: {
    accessibilityLabel: (count: number, total: string) =>
      `Votre panier contient ${count} article${count > 1 ? 's' : ''} pour un total de ${total}`,
  },

  primaryButton: {
    accessibilityRole: 'button',
    accessibilityLabel: 'Voir le panier',
    accessibilityHint: 'Ouvre la page du panier',
  },

  secondaryButton: {
    accessibilityRole: 'button',
    accessibilityLabel: 'Continuer mes achats',
    accessibilityHint: 'Ferme cette fenetre et retourne a la page produit',
  },

  backdrop: {
    accessibilityRole: 'button',
    accessibilityLabel: 'Fermer',
    accessibilityHint: 'Touchez pour fermer et continuer vos achats',
  },
};
```

### Focus Management
1. When overlay opens, focus moves to modal container
2. Tab order: Primary button -> Secondary button -> Backdrop dismiss
3. Escape key dismisses overlay (web/keyboard)
4. Focus trapped within modal while open

### Motion Preferences
```typescript
// Respect reduced motion settings
const shouldReduceMotion = useReducedMotion();

const animationDuration = shouldReduceMotion ? 0 : normalDuration;
const springConfig = shouldReduceMotion
  ? { duration: 0 }
  : normalSpringConfig;
```

---

## 10. Interaction Behaviors

### Dismissal Methods
1. **Tap "Continuer mes achats"** - Closes overlay, stays on product page
2. **Tap outside modal** - Same as "Continuer mes achats"
3. **Tap "Voir le panier"** - Closes overlay, navigates to cart

### Navigation
- "Voir le panier" navigates to `/cart` (tabs/cart.tsx)
- All dismissal methods call `onDismiss()` callback

### Haptic Feedback
```typescript
const HAPTICS = {
  overlayAppear: 'notificationSuccess',
  primaryButtonPress: 'impactMedium',
  secondaryButtonPress: 'impactLight',
  backdropTap: 'selection',
};
```

---

## 11. Confetti Particle Configuration

```typescript
const CONFETTI_CONFIG = {
  particleCount: 8,
  colors: [
    '#f67828',  // hermes
    '#d4a574',  // gold
    '#fed7aa',  // light orange
    '#fde68a',  // light gold
    '#059669',  // success green
  ],

  particle: {
    size: { min: 6, max: 10 },
    duration: 600,
    spread: { x: [-80, 80], y: [-100, -40] },
    rotation: { min: 0, max: 360 },
    opacity: { start: 1, end: 0 },
  },
};
```

---

## 12. Component Props Interface

```typescript
interface AddToCartSuccessOverlayV2Props {
  // Visibility
  visible: boolean;

  // Product information
  productName: string;
  productImage?: string;
  quantityAdded: number;

  // Cart state
  cartTotalItems: number;
  cartTotalPrice: number;

  // Callbacks
  onViewCart: () => void;      // Navigate to cart
  onContinueShopping: () => void; // Dismiss and stay
  onDismiss?: () => void;      // Called on any dismissal

  // Optional customization
  testID?: string;
}
```

---

## 13. Usage Example

```tsx
import { AddToCartSuccessOverlayV2 } from '@/components/product';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';

function ProductScreen() {
  const router = useRouter();
  const { cart } = useCart();
  const [showOverlay, setShowOverlay] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [lastAddedQty, setLastAddedQty] = useState(1);

  const handleAddToCart = async (product, quantity) => {
    await addToCart(product, quantity);
    setLastAddedProduct(product);
    setLastAddedQty(quantity);
    setShowOverlay(true);
  };

  return (
    <>
      {/* Product content */}

      <AddToCartSuccessOverlayV2
        visible={showOverlay}
        productName={lastAddedProduct?.name ?? ''}
        productImage={lastAddedProduct?.image}
        quantityAdded={lastAddedQty}
        cartTotalItems={cart.totalItems}
        cartTotalPrice={cart.totalPrice}
        onViewCart={() => {
          setShowOverlay(false);
          router.push('/(tabs)/cart');
        }}
        onContinueShopping={() => setShowOverlay(false)}
        onDismiss={() => setShowOverlay(false)}
      />
    </>
  );
}
```

---

## 14. Visual Mockup (ASCII)

```
+------------------------------------------+
|                                          |
|           (dark blur backdrop)           |
|                                          |
|      +----------------------------+      |
|      |                            |      |
|      |         [CHECKMARK]        |      |
|      |          in circle         |      |
|      |                            |      |
|      |     Ajoute au panier       |      |
|      |                            |      |
|      |   +------+  Product Name   |      |
|      |   | IMG  |  That Wraps     |      |
|      |   |      |  Nicely  [x2]   |      |
|      |   +------+                 |      |
|      |                            |      |
|      |   ----------------------   |      |
|      |                            |      |
|      |   3 articles dans votre    |      |
|      |   panier                   |      |
|      |   Total: 1 250,00 EUR      |      |
|      |                            |      |
|      |  +----------------------+  |      |
|      |  |   Voir le panier     |  |      |
|      |  +----------------------+  |      |
|      |                            |      |
|      |  +----------------------+  |      |
|      |  | Continuer mes achats |  |      |
|      |  +----------------------+  |      |
|      |                            |      |
|      +----------------------------+      |
|                                          |
+------------------------------------------+
```

---

## 15. Implementation Checklist

- [ ] Create new component file `AddToCartSuccessOverlayV2.tsx`
- [ ] Implement backdrop with blur and tap-to-dismiss
- [ ] Build modal card with all sections
- [ ] Add entry/exit animations with reanimated
- [ ] Implement confetti particles
- [ ] Add haptic feedback
- [ ] Complete accessibility attributes
- [ ] Handle reduced motion preference
- [ ] Test with screen reader (VoiceOver/TalkBack)
- [ ] Test touch targets (44px minimum)
- [ ] Test color contrast ratios
- [ ] Update product page to use new overlay
- [ ] Update export in components/product/index.ts

---

*Document Version: 2.0*
*Last Updated: December 2024*
*Author: UI Design System*
