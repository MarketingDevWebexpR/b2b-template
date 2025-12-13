# Luxury Add-to-Cart UX/UI Design Specification

## Overview

This document defines the complete design specification for a premium, luxury-grade add-to-cart experience for a high-end jewelry e-commerce mobile application. The design draws inspiration from maisons such as Hermes, Cartier, and Van Cleef & Arpels.

---

## 1. Current Implementation Analysis

### Existing Components (Product Detail Screen)

**Quantity Selector:**
- Basic `Pressable` buttons with `+` and `-` text
- Simple border styling with `border-border` and `rounded-soft`
- No animations or visual feedback
- Static text display for quantity

**Add to Cart Button:**
- Simple `Pressable` with solid background
- Basic color toggle between `bg-hermes-500` and `bg-green-600`
- No entrance/exit animations
- No micro-interactions on press
- Plain white background container with border

### Pain Points Identified:
1. No tactile feedback (haptics missing)
2. Jarring state transitions (no animations)
3. Generic visual design lacking luxury feel
4. No price animation when quantity changes
5. Missing frosted glass/blur effects for depth
6. No success celebration animation
7. Quantity buttons lack press feedback

---

## 2. Color Palette

### Primary Colors
```typescript
const colors = {
  // Brand Accent (Hermes Orange)
  hermes: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f67828',  // Primary accent
    600: '#ea580c',
    700: '#c2410c',
  },

  // Luxury Neutrals
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

  // Success State (Subtle Green)
  success: {
    light: '#ecfdf5',
    DEFAULT: '#059669',
    dark: '#047857',
    muted: '#10b98120',  // 20% opacity for glow
  },

  // Glass Effect Colors
  glass: {
    white: 'rgba(255, 252, 247, 0.85)',
    dark: 'rgba(43, 51, 63, 0.08)',
    border: 'rgba(226, 216, 206, 0.5)',
  },
};
```

### Gradient Definitions
```typescript
const gradients = {
  // Button gradient for premium feel
  hermesButton: ['#f67828', '#ea580c'],

  // Success gradient
  successButton: ['#059669', '#047857'],

  // Frosted glass overlay
  frostedGlass: ['rgba(255, 252, 247, 0.95)', 'rgba(255, 252, 247, 0.85)'],
};
```

---

## 3. Typography

### Font Families
```typescript
const typography = {
  serif: 'PlayfairDisplay',        // Elegant headings, price displays
  serifItalic: 'PlayfairDisplay-Italic',
  sans: 'Inter',                   // Body text, buttons
  sansMedium: 'Inter-Medium',
  sansSemiBold: 'Inter-SemiBold',
};
```

### Text Styles for Add-to-Cart Section
```typescript
const textStyles = {
  // Section label (e.g., "Quantite")
  sectionLabel: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    lineHeight: 24,
    color: colors.luxe.charcoal,
    letterSpacing: 0.3,
  },

  // Quantity display number
  quantityNumber: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 22,
    lineHeight: 28,
    color: colors.luxe.charcoal,
    letterSpacing: 0.5,
  },

  // Price display (large)
  priceDisplay: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 20,
    lineHeight: 26,
    color: colors.hermes[500],
    letterSpacing: 0.3,
  },

  // Price label
  priceLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    color: colors.luxe.stone,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Button text
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.luxe.white,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Success message
  successText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: colors.success.DEFAULT,
    letterSpacing: 0.3,
  },
};
```

---

## 4. Spacing & Sizing

### Component Dimensions
```typescript
const dimensions = {
  // Quantity Selector
  quantitySelector: {
    buttonSize: 48,          // Touch target size
    buttonRadius: 24,        // Circular buttons
    counterWidth: 64,        // Number display width
    gap: 16,                 // Space between elements
  },

  // Add to Cart Bar
  addToCartBar: {
    height: 100,             // Total bar height
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,       // Safe area for bottom
    buttonHeight: 56,
    buttonRadius: 28,        // Pill shape
  },

  // Price Display
  priceDisplay: {
    height: 44,
    minWidth: 120,
  },
};
```

### Spacing Scale
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};
```

---

## 5. Component Architecture

### 5.1 LuxuryQuantitySelector

```
LuxuryQuantitySelector
|-- AnimatedContainer (Animated.View)
|   |-- MinusButton (Pressable + Animated.View)
|   |   |-- MinusIcon (Animated.View with line)
|   |   |-- RippleEffect (Animated circle)
|   |
|   |-- QuantityDisplay (Animated.View)
|   |   |-- AnimatedNumber (uses react-native-reanimated)
|   |
|   |-- PlusButton (Pressable + Animated.View)
|       |-- PlusIcon (Animated.View with cross)
|       |-- RippleEffect (Animated circle)
```

### 5.2 LuxuryAddToCartBar

```
LuxuryAddToCartBar
|-- FrostedGlassContainer (BlurView + Animated.View)
|   |-- ContentRow (View)
|   |   |-- PriceSection (Animated.View)
|   |   |   |-- PriceLabel (Text)
|   |   |   |-- AnimatedPrice (Animated.Text)
|   |   |
|   |   |-- AddToCartButton (Pressable + Animated.View)
|   |       |-- ButtonBackground (LinearGradient or Animated.View)
|   |       |-- ButtonContent (Animated.View)
|   |       |   |-- CartIcon (Animated)
|   |       |   |-- ButtonText (Animated.Text)
|   |       |-- RippleOverlay (Animated.View)
|   |       |-- SuccessCheckmark (Animated.View) -- shown on success
```

### 5.3 SuccessOverlay (Full-screen celebration)

```
SuccessOverlay
|-- BackdropBlur (Animated.View)
|-- ContentContainer (Animated.View)
|   |-- CheckmarkCircle (Animated.View with SVG)
|   |-- SuccessMessage (Animated.Text)
|   |-- ProductThumb (Animated.Image)
|   |-- Particles (Array of Animated.View) -- subtle confetti
```

---

## 6. Animation Specifications

### 6.1 Spring Configurations

```typescript
const springConfigs = {
  // Responsive, snappy feel for buttons
  button: {
    damping: 15,
    mass: 1,
    stiffness: 200,
    overshootClamping: false,
  },

  // Smooth, elegant for number changes
  number: {
    damping: 20,
    mass: 0.8,
    stiffness: 150,
  },

  // Bouncy for success states
  celebration: {
    damping: 12,
    mass: 1,
    stiffness: 180,
  },

  // Gentle for layout changes
  gentle: {
    damping: 25,
    mass: 1,
    stiffness: 100,
  },
};
```

### 6.2 Timing Configurations

```typescript
const timingConfigs = {
  // Quick micro-interactions
  micro: {
    duration: 150,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },

  // Standard transitions
  standard: {
    duration: 300,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  },

  // Slow, luxurious reveals
  elegant: {
    duration: 500,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  },
};
```

### 6.3 Quantity Button Animation Sequence

```typescript
// On Press Down
const onPressIn = () => {
  // 1. Scale button down slightly
  buttonScale.value = withSpring(0.92, springConfigs.button);

  // 2. Increase background opacity
  bgOpacity.value = withTiming(0.15, timingConfigs.micro);

  // 3. Trigger haptic
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// On Press Up
const onPressOut = () => {
  // 1. Scale back to normal with spring
  buttonScale.value = withSpring(1, springConfigs.button);

  // 2. Reset background
  bgOpacity.value = withTiming(0, timingConfigs.standard);

  // 3. Trigger ripple animation
  rippleScale.value = 0;
  rippleScale.value = withTiming(2, timingConfigs.standard);
  rippleOpacity.value = 0.3;
  rippleOpacity.value = withTiming(0, timingConfigs.standard);
};

// On Quantity Change
const animateQuantityChange = (direction: 'up' | 'down') => {
  // 1. Slide out old number
  translateY.value = withTiming(direction === 'up' ? -20 : 20, timingConfigs.micro);
  opacity.value = withTiming(0, timingConfigs.micro);

  // 2. Update value
  // 3. Slide in new number from opposite direction
  translateY.value = direction === 'up' ? 20 : -20;
  translateY.value = withSpring(0, springConfigs.number);
  opacity.value = withTiming(1, timingConfigs.standard);
};
```

### 6.4 Add to Cart Button Animation Sequence

```typescript
// Idle State Animation (subtle pulse)
const idlePulse = () => {
  glowOpacity.value = withRepeat(
    withSequence(
      withTiming(0.3, { duration: 2000 }),
      withTiming(0.1, { duration: 2000 })
    ),
    -1, // infinite
    true
  );
};

// On Press
const onAddToCartPress = () => {
  // 1. Scale down
  buttonScale.value = withSpring(0.96, springConfigs.button);

  // 2. Heavy haptic for importance
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  // 3. Trigger ripple from center
  rippleScale.value = 0;
  rippleScale.value = withTiming(3, { duration: 600 });
  rippleOpacity.value = 0.4;
  rippleOpacity.value = withTiming(0, { duration: 600 });
};

// On Release + Add to Cart
const onAddToCartComplete = () => {
  // 1. Scale back
  buttonScale.value = withSpring(1, springConfigs.button);

  // 2. Morph to success state
  withSequence(
    // Shrink slightly
    withTiming(0.95, { duration: 100 }),
    // Expand with bounce
    withSpring(1.05, springConfigs.celebration),
    // Settle
    withSpring(1, springConfigs.gentle)
  );

  // 3. Color transition (orange -> green)
  buttonColor.value = withTiming(colors.success.DEFAULT, { duration: 300 });

  // 4. Icon morph (cart -> checkmark)
  iconRotation.value = withTiming(360, { duration: 400 });
  iconScale.value = withSequence(
    withTiming(0, { duration: 150 }),
    withTiming(1.2, { duration: 200 }),
    withSpring(1, springConfigs.button)
  );

  // 5. Success haptic
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};
```

### 6.5 Price Animation

```typescript
// Animated price that smoothly transitions
const animatedPrice = useAnimatedStyle(() => {
  return {
    transform: [
      { scale: withSpring(priceScale.value, springConfigs.number) },
    ],
  };
});

// On price change
const onPriceChange = (newPrice: number) => {
  // 1. Quick scale pulse
  priceScale.value = 1.08;
  priceScale.value = withSpring(1, springConfigs.number);

  // 2. Subtle color flash (optional)
  priceColor.value = colors.hermes[400];
  priceColor.value = withTiming(colors.hermes[500], { duration: 300 });

  // 3. Selection haptic
  Haptics.selectionAsync();
};
```

### 6.6 Success Overlay Animation

```typescript
// Entry Sequence (after add to cart)
const showSuccessOverlay = () => {
  // 1. Fade in backdrop (0 -> 1)
  backdropOpacity.value = withTiming(1, { duration: 200 });

  // 2. Scale in checkmark circle (0 -> 1 with bounce)
  circleScale.value = 0;
  circleScale.value = withSpring(1, {
    damping: 10,
    stiffness: 150,
  });

  // 3. Draw checkmark (stroke-dashoffset animation)
  checkmarkProgress.value = 0;
  checkmarkProgress.value = withTiming(1, {
    duration: 400,
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

  // 4. Fade in text
  textOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
  textTranslateY.value = withDelay(200, withSpring(0, springConfigs.gentle));

  // 5. Particle burst
  particles.forEach((particle, i) => {
    particle.scale.value = withDelay(
      100 + i * 30,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      )
    );
    particle.translateY.value = withDelay(
      100 + i * 30,
      withTiming(-100 - Math.random() * 50, { duration: 600 })
    );
  });

  // 6. Auto-dismiss after 1.5s
  setTimeout(hideSuccessOverlay, 1500);
};
```

---

## 7. Haptic Feedback Mapping

```typescript
const hapticMap = {
  // Quantity buttons
  quantityButtonPress: ImpactFeedbackStyle.Light,
  quantityChange: 'selection',

  // Add to cart button
  addToCartPress: ImpactFeedbackStyle.Medium,
  addToCartSuccess: NotificationFeedbackType.Success,

  // Error states
  quantityAtMinimum: NotificationFeedbackType.Warning,
  outOfStock: NotificationFeedbackType.Error,
};
```

---

## 8. Frosted Glass Effect Implementation

```typescript
// Using expo-blur or react-native-blur
const FrostedGlassBar = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${colors.glass.white};
`;

// BlurView props for iOS native blur
const blurProps = {
  intensity: 80,
  tint: 'light',
};

// For Android fallback (semi-transparent with subtle gradient)
const androidFallback = {
  backgroundColor: 'rgba(255, 252, 247, 0.95)',
  borderTopWidth: 1,
  borderTopColor: colors.glass.border,
};
```

---

## 9. Accessibility Considerations

```typescript
const accessibilityProps = {
  quantitySelector: {
    accessibilityRole: 'adjustable',
    accessibilityLabel: 'Quantity selector',
    accessibilityHint: 'Swipe up or down to adjust quantity',
    accessibilityValue: {
      min: 1,
      max: 99,
      now: quantity,
    },
  },

  minusButton: {
    accessibilityLabel: 'Decrease quantity',
    accessibilityRole: 'button',
    accessibilityState: { disabled: quantity <= 1 },
  },

  plusButton: {
    accessibilityLabel: 'Increase quantity',
    accessibilityRole: 'button',
  },

  addToCartButton: {
    accessibilityLabel: `Add ${quantity} item${quantity > 1 ? 's' : ''} to cart for ${formattedPrice}`,
    accessibilityRole: 'button',
    accessibilityState: { disabled: !inStock },
  },
};
```

---

## 10. State Management

```typescript
interface AddToCartState {
  quantity: number;
  isPressed: boolean;
  isAdding: boolean;       // Loading state while adding
  isSuccess: boolean;      // Success state after add
  showOverlay: boolean;    // Full success overlay
  price: number;
  totalPrice: number;      // quantity * price
}

// State transitions
const stateFlow = {
  idle: {
    button: 'default',
    quantity: 'editable',
  },

  pressing: {
    button: 'pressed',
    quantity: 'locked',
  },

  adding: {
    button: 'loading',
    quantity: 'locked',
  },

  success: {
    button: 'success',
    quantity: 'locked',
    duration: 2000, // Auto-reset to idle
  },

  inCart: {
    button: 'inCart',
    quantity: 'editable',
    text: 'Update Cart',
  },
};
```

---

## 11. Visual States Reference

### Quantity Button States

| State | Background | Border | Icon Color | Scale |
|-------|------------|--------|------------|-------|
| Default | transparent | luxe.taupe | luxe.charcoal | 1.0 |
| Hover (web) | luxe.sand | luxe.stone | luxe.charcoal | 1.0 |
| Pressed | hermes.50 | hermes.300 | hermes.500 | 0.92 |
| Disabled | luxe.sand | luxe.taupe | luxe.stone | 1.0 |

### Add to Cart Button States

| State | Background | Text | Icon | Shadow |
|-------|------------|------|------|--------|
| Default | hermes.500 gradient | white | ShoppingBag | subtle |
| Pressed | hermes.600 | white | ShoppingBag | none |
| Loading | hermes.500 | white | Spinner | subtle |
| Success | success gradient | white | Check (animated) | glow green |
| In Cart | luxe.charcoal | white | Check | subtle |
| Disabled | luxe.taupe | luxe.stone | ShoppingBag | none |

---

## 12. Implementation Priorities

### Phase 1: Core Animations
1. Quantity button press feedback with spring
2. Add to cart button micro-interaction
3. Price update animation
4. Haptic feedback integration

### Phase 2: Enhanced UX
1. Frosted glass bottom bar
2. Success state with checkmark morph
3. Quantity slide animation
4. Button ripple effects

### Phase 3: Delight
1. Full-screen success overlay
2. Particle effects
3. Idle pulse animation
4. Loading shimmer

---

## 13. Performance Considerations

- All animations run on UI thread via react-native-reanimated worklets
- Use `useAnimatedStyle` with shared values for 60fps animations
- Limit concurrent animations to prevent jank
- Use `runOnJS` sparingly, only for callbacks
- Memoize animated styles when possible
- Avoid re-renders during animations by using refs for animation state

---

## 14. File Structure

```
apps/mobile/
|-- components/
|   |-- product/
|   |   |-- LuxuryQuantitySelector.tsx
|   |   |-- LuxuryAddToCartBar.tsx
|   |   |-- AddToCartSuccessOverlay.tsx
|   |   |-- AnimatedPrice.tsx
|   |   |-- index.ts
|   |
|   |-- shared/
|       |-- AnimatedButton.tsx
|       |-- FrostedGlassView.tsx
|       |-- AnimatedCheckmark.tsx
|
|-- hooks/
|   |-- useQuantityAnimation.ts
|   |-- useButtonAnimation.ts
|   |-- useHapticFeedback.ts
|   |-- usePriceAnimation.ts
|
|-- constants/
|   |-- animations.ts  // Spring configs, timing
|   |-- haptics.ts     // Haptic mappings
```

---

This specification provides the complete foundation for implementing a luxury-grade add-to-cart experience that matches the premium positioning of a high-end jewelry brand.
