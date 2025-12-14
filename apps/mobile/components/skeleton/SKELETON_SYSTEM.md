# Skeleton Loading System - Maison Bijoux

A comprehensive, luxury-grade skeleton loading system designed for high-end e-commerce applications. Features elegant shimmer animations that feel premium and refined.

## Design Philosophy

The skeleton system is designed around luxury brand aesthetics, drawing inspiration from Hermes and Cartier:

1. **Warm Color Palette**: Uses bone and cream tones that complement the app's warm background (#fffcf7)
2. **Subtle Shimmer**: Pearl-like luminescence rather than harsh flashing
3. **Leisurely Pace**: 1.8s animation cycle feels unhurried and premium
4. **Staggered Loading**: Cascading reveal creates visual interest

## Color Palette

```
Background:     #fffcf7 (App warm cream)
                    |
Skeleton Base:  #f5f0e8 (Warm bone) -----> Primary skeleton color
                    |
Base Light:     #faf7f2 (Pearl) ----------> Cards, subtle elements
                    |
Base Dark:      #ebe4d8 (Taupe) ----------> Images, buttons

Shimmer Gradient:
#f5f0e8 --> #fffcf7 --> #f5f0e8 (Subtle pearl effect)
#f5f0e8 --> #fdf9f0 --> #f5f0e8 (Warm gold variant)
```

## Component Architecture

```
skeleton/
├── Skeleton.tsx              # Base component + variants
├── ProductCardSkeleton.tsx   # Product card loading
├── ProductDetailSkeleton.tsx # Product detail page loading
├── CartSkeleton.tsx          # Shopping cart loading
├── CheckoutSkeleton.tsx      # Checkout flow loading
└── index.ts                  # Exports
```

## Usage Examples

### Basic Skeleton Shapes

```tsx
import {
  Skeleton,
  SkeletonText,
  SkeletonHeading,
  SkeletonImage,
  SkeletonButton,
  SkeletonCircle
} from '@/components/skeleton';

// Text lines
<SkeletonText lines={3} lastLineWidth={70} />

// Heading
<SkeletonHeading width="60%" />

// Image with aspect ratio
<SkeletonImage aspectRatio={1} radius="md" />

// Button
<SkeletonButton width={180} height={52} />

// Avatar/Icon
<SkeletonCircle size={48} />

// Custom shape
<Skeleton
  width={200}
  height={40}
  radius="lg"
  shimmerStyle="warm"
/>
```

### Layout Helpers

```tsx
import { SkeletonRow, SkeletonStack } from '@/components/skeleton';

// Horizontal layout
<SkeletonRow gap={12} align="center">
  <SkeletonCircle size={48} />
  <SkeletonStack gap={4} style={{ flex: 1 }}>
    <Skeleton width="80%" height={16} />
    <Skeleton width="50%" height={12} />
  </SkeletonStack>
</SkeletonRow>

// Vertical layout
<SkeletonStack gap={16}>
  <SkeletonHeading />
  <SkeletonText lines={3} />
  <SkeletonButton />
</SkeletonStack>
```

### Page-Level Skeletons

```tsx
import {
  ProductCardSkeletonGrid,
  ProductDetailSkeleton,
  CartSkeleton,
  CheckoutSkeleton,
} from '@/components/skeleton';

// Product listing
<ProductCardSkeletonGrid
  count={6}
  columns={2}
  showBadges
/>

// Product detail
<ProductDetailSkeleton
  showSpecifications
  specificationCount={4}
/>

// Shopping cart
<CartSkeleton
  itemCount={3}
  showShippingProgress
/>

// Checkout flow
<CheckoutSkeleton step="summary" itemCount={2} />
<CheckoutSkeleton step="shipping" />
<CheckoutSkeleton step="payment" />
```

### Staggered Animation

```tsx
import { getStaggeredDelay, createSkeletonArray } from '@/components/skeleton';

// Manual stagger
{items.map((_, index) => (
  <Skeleton
    key={index}
    delay={getStaggeredDelay(index, 100)} // 100ms base + 80ms per item
  />
))}

// Generate delay array
const delays = createSkeletonArray(5, 200); // [200, 280, 360, 440, 520]
```

## Props Reference

### Skeleton (Base Component)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | `'100%'` | Width in pixels or percentage |
| `height` | `number \| string` | `20` | Height in pixels |
| `radius` | `SkeletonRadius` | `'sm'` | Border radius preset or number |
| `variant` | `SkeletonVariant` | `'custom'` | Shape variant |
| `animated` | `boolean` | `true` | Enable shimmer animation |
| `shimmerStyle` | `'subtle' \| 'warm' \| 'none'` | `'subtle'` | Shimmer color style |
| `delay` | `number` | `0` | Animation start delay (ms) |
| `lines` | `number` | `1` | Number of text lines (text variant) |
| `lineSpacing` | `number` | `8` | Gap between text lines |
| `lastLineWidth` | `number` | `70` | Last line width percentage |

### Radius Presets

| Preset | Value | Use Case |
|--------|-------|----------|
| `none` | 0 | Sharp corners |
| `xs` | 4px | Text lines |
| `sm` | 8px | Default |
| `md` | 12px | Cards, images |
| `lg` | 16px | Larger elements |
| `xl` | 20px | Buttons |
| `round` | 9999px | Circles |

### Shimmer Styles

| Style | Description |
|-------|-------------|
| `subtle` | Pearl-like white shimmer (default) |
| `warm` | Warm gold-tinted shimmer (for CTAs) |
| `none` | No animation |

## Integration Example

```tsx
// screens/CollectionScreen.tsx
import { View } from 'react-native';
import { ProductCardSkeletonGrid } from '@/components/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export function CollectionScreen() {
  const { products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ProductCardSkeletonGrid count={6} showBadges />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </View>
  );
}
```

## Animation Specifications

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Duration | 1800ms | Leisurely pace feels luxurious |
| Easing | cubic-bezier(0.4, 0, 0.2, 1) | Smooth, flowing movement |
| Stagger | 80ms | Subtle cascade effect |
| Gradient Width | 35% | Soft highlight band |

## Accessibility Notes

- Skeletons use sufficient contrast against the cream background
- Animation respects device "Reduce Motion" preferences (via react-native-reanimated)
- Screen readers should announce "Loading..." for skeleton containers
- Consider adding `accessibilityLabel="Loading content"` to skeleton containers

## Performance Tips

1. **Limit Skeleton Count**: Avoid rendering more than 10-15 animated skeletons simultaneously
2. **Use Staggered Delays**: Spreading animation start times reduces GPU load
3. **Disable When Hidden**: Set `animated={false}` for off-screen skeletons
4. **Memoization**: All skeleton components are wrapped with `React.memo`

## Design Tokens

Skeleton tokens are available in the design system:

```tsx
import { SKELETON_TOKENS } from '@/constants/designTokens';

// Access colors
const bgColor = SKELETON_TOKENS.colors.base;

// Animation settings
const duration = SKELETON_TOKENS.animation.duration;

// Dimensions
const textHeight = SKELETON_TOKENS.dimensions.textLineHeight;
```
