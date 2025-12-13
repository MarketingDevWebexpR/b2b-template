# Maison Bijoux Design System

## Overview

A Hermes-inspired luxury design system for the Maison Bijoux e-commerce platform. This system prioritizes elegance, refinement, and visual harmony while maintaining excellent accessibility and user experience.

---

## Design Philosophy

### Core Principles

1. **Elegance Through Restraint**: Every element earns its place. Remove what doesn't add value.
2. **Warmth and Approachability**: Luxury doesn't mean cold. Use warm tones to create an inviting atmosphere.
3. **Visual Breathing Room**: Generous spacing allows content to shine.
4. **Subtle Motion**: Animations enhance without distracting.
5. **Accessibility First**: Beautiful design that everyone can use.

---

## Color Palette

### Primary Accent: Hermes Orange

```
hermes-500: #f67828  (Primary)
hermes-400: #fb923c
hermes-600: #ea580c
hermes-50:  #fff7ed  (Soft backgrounds)
```

### Background Colors (Light Theme)

```
background-cream: #fffcf7  (Primary background)
background-beige: #fcf7f1  (Secondary sections)
background-warm:  #f6f1eb  (Muted areas)
background-muted: #f8f5f0  (Subtle emphasis)
```

### Text Colors

```
text-primary:   #2b333f  (Charcoal - main text)
text-secondary: #444444  (Medium grey)
text-muted:     #696969  (Secondary text)
text-light:     #8b8b8b  (Subtle text)
text-inverse:   #fffcf7  (On dark backgrounds)
```

### Luxe Neutrals

```
luxe-white:    #ffffff
luxe-cream:    #fffcf7
luxe-pearl:    #faf8f5
luxe-sand:     #f0ebe3
luxe-taupe:    #d4c9bd
luxe-stone:    #b8a99a
luxe-bronze:   #a08b76
luxe-charcoal: #2b333f
luxe-noir:     #1a1a1a
```

### Semantic Colors

```
Success: emerald-50 / emerald-500 / emerald-700
Error:   red-50 / red-500 / red-700
Warning: amber-50 / amber-500 / amber-700
Info:    blue-50 / blue-500 / blue-700
```

---

## Typography

### Font Families

- **Serif (Headings)**: Playfair Display, Cormorant Garamond
- **Sans-Serif (Body)**: Inter, Helvetica Neue
- **Display (Impact)**: Cormorant Garamond

### Type Scale

| Name          | Size   | Line Height | Letter Spacing | Weight |
|---------------|--------|-------------|----------------|--------|
| display-hero  | 5rem   | 1.05        | -0.03em        | 300    |
| display-1     | 4rem   | 1.1         | -0.025em       | 300    |
| display-2     | 3.25rem| 1.1         | -0.02em        | 400    |
| heading-1     | 2.75rem| 1.15        | -0.015em       | 400    |
| heading-2     | 2.25rem| 1.2         | -0.01em        | 400    |
| heading-3     | 1.875rem| 1.25       | -0.005em       | 500    |
| heading-4     | 1.5rem | 1.3         | 0              | 500    |
| heading-5     | 1.25rem| 1.4         | 0.005em        | 500    |
| body-lg       | 1.125rem| 1.7        | 0.01em         | -      |
| body          | 1rem   | 1.7         | 0.01em         | -      |
| body-sm       | 0.9375rem| 1.6       | 0.01em         | -      |
| caption       | 0.8125rem| 1.5       | 0.02em         | -      |
| overline      | 0.75rem| 1.4         | 0.15em         | 500    |

### Letter Spacing Utilities

```
tracking-luxe:    0.15em  (Labels, buttons)
tracking-elegant: 0.1em   (Badges, captions)
tracking-refined: 0.05em  (Subtle emphasis)
```

---

## Spacing System

### Base Scale (rem)

```
18: 4.5rem
22: 5.5rem
26: 6.5rem
30: 7.5rem
34: 8.5rem
38: 9.5rem
42: 10.5rem
50: 12.5rem
60: 15rem
```

### Usage Guidelines

- **Section padding**: Use 24-32 for vertical rhythm
- **Card padding**: Use sm (p-4), md (p-6), lg (p-8)
- **Component gaps**: Use 4-6 for tight, 8-12 for comfortable

---

## Components

### Button

Variants: `primary`, `secondary`, `ghost`
Sizes: `sm`, `md`, `lg`

```tsx
<Button variant="primary" size="md">
  Ajouter au panier
</Button>
```

**Design Notes**:
- Sharp edges (rounded-none) for luxury aesthetic
- Uppercase text with letter-spacing
- Subtle hover shadows

### Badge

Variants: `hermes`, `hermes-outline`, `hermes-soft`, `dark`, `light`, `success`, `warning`, `error`, `info`, `pending`
Sizes: `xs`, `sm`, `md`, `lg`

```tsx
<Badge variant="success" dot>
  Commande confirmee
</Badge>
```

**Use Cases**:
- Order status indicators
- Product tags (Nouveau, Edition limitee)
- Inventory status (En stock, Rupture)

### Card

Variants: `elevated`, `outlined`, `filled`, `ghost`, `interactive`, `featured`
Sizes: `none`, `sm`, `md`, `lg`, `xl`

```tsx
<Card variant="elevated" size="lg">
  <CardHeader>
    <CardTitle>Recapitulatif</CardTitle>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

**Specialized Cards**:
- `CartItemCard`: For displaying cart/order items
- `OrderSummaryCard`: For checkout totals and summary

### Stepper

Orientations: `horizontal`, `vertical`
Sizes: `sm`, `md`, `lg`

```tsx
const steps = [
  { id: 'cart', label: 'Panier' },
  { id: 'shipping', label: 'Livraison' },
  { id: 'payment', label: 'Paiement' },
  { id: 'confirmation', label: 'Confirmation' },
];

<Stepper steps={steps} currentStep={1} />
```

**Mobile**: Use `CompactStepper` for constrained spaces.

### Separator

Variants: `default`, `light`, `medium`, `strong`, `hermes`, `fade`, `hermes-fade`
Orientations: `horizontal`, `vertical`
Sizes: `xs`, `sm`, `md`, `lg`

```tsx
// Simple divider
<Separator />

// Hermes accent divider (centered)
<DecorativeDivider lineWidth="w-24" />

// Divider with text
<DecorativeDivider>ou</DecorativeDivider>

// Section header with divider
<SectionDivider title="Informations de livraison" />
```

### Alert

Variants: `success`, `error`, `warning`, `info`, `hermes`, `neutral`
Sizes: `sm`, `md`, `lg`

```tsx
<Alert
  variant="success"
  title="Commande confirmee"
  dismissible
>
  Votre commande #12345 a ete placee avec succes.
</Alert>

// Inline validation message
<InlineAlert variant="error">
  Ce champ est requis
</InlineAlert>

// Toast notification
<ToastAlert
  variant="info"
  position="top-right"
  title="Article ajoute"
>
  Le produit a ete ajoute a votre panier.
</ToastAlert>
```

### Input

Sizes: `sm`, `md`, `lg`

```tsx
<Input
  label="Email"
  placeholder="votre@email.fr"
  error="Email invalide"
  helperText="Nous ne partagerons jamais votre email"
/>
```

---

## Animation System

### Timing Functions

```
ease-luxe:       cubic-bezier(0.25, 0.46, 0.45, 0.94)  (Elegant ease)
ease-luxe-out:   cubic-bezier(0.22, 1, 0.36, 1)        (Snappy exit)
ease-luxe-in-out: cubic-bezier(0.65, 0, 0.35, 1)      (Smooth both)
```

### Durations

```
duration-250: 250ms  (Micro-interactions)
duration-350: 350ms  (Standard transitions)
duration-400: 400ms  (Emphasis transitions)
duration-600: 600ms  (Entrance animations)
duration-800: 800ms  (Dramatic reveals)
```

### Animation Presets

```
fade-in:      0.8s elegant fade
fade-in-up:   0.8s fade with 24px slide up
slide-in-right: 0.6s slide from right
scale-in:     0.5s subtle scale entrance
shimmer:      2.5s loading shimmer
```

### Framer Motion Patterns

```tsx
// Container with staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

// Individual item animation
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};
```

---

## Shadows

```
shadow-soft:      Light, subtle shadow
shadow-soft-md:   Medium soft shadow
shadow-soft-lg:   Large soft shadow
shadow-elegant:   Multi-layer refined shadow
shadow-elegant-lg: Large elegant shadow
shadow-card:      Default card shadow
shadow-card-hover: Elevated card on hover
shadow-button:    Button depth
shadow-button-hover: Button hover state
```

---

## Border Radius

```
rounded-soft:    0.375rem  (Subtle rounding)
rounded-elegant: 0.5rem    (Standard cards)
rounded-luxe:    0.75rem   (Prominent elements)
rounded-pill:    9999px    (Full pill shape)
```

---

## Accessibility Guidelines

### Color Contrast

- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px bold): 3:1 minimum
- Interactive elements: Visible focus states

### Touch Targets

- Minimum 44x44px for touch devices
- Adequate spacing between interactive elements

### Focus States

All interactive elements include:
- `focus:outline-none` (remove default)
- `focus-visible:ring-2` (keyboard focus)
- `focus-visible:ring-offset-2` (spacing)
- Color-appropriate ring color

### Screen Readers

- Proper heading hierarchy
- ARIA labels on icon-only buttons
- Role attributes where semantic HTML insufficient
- `aria-current="step"` for stepper progress

---

## Checkout Flow Components

### Recommended Structure

```tsx
// Checkout page layout
<Container size="lg">
  {/* Progress indicator */}
  <Stepper steps={checkoutSteps} currentStep={currentStep} />

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
    {/* Main content (2/3) */}
    <div className="lg:col-span-2 space-y-8">
      <Card variant="outlined" size="lg">
        <CardHeader>
          <CardTitle>Adresse de livraison</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Form fields */}
        </CardContent>
      </Card>
    </div>

    {/* Order summary (1/3) */}
    <div className="lg:col-span-1">
      <OrderSummaryCard
        subtotal="1 250 EUR"
        shipping="Gratuit"
        total="1 250 EUR"
        footer={
          <Button variant="primary" className="w-full">
            Passer la commande
          </Button>
        }
      />
    </div>
  </div>
</Container>
```

### Cart Item Display

```tsx
<Card variant="outlined" size="none">
  {cartItems.map((item) => (
    <CartItemCard
      key={item.id}
      image={item.image}
      name={item.name}
      variant={item.variant}
      price={formatPrice(item.price)}
      quantity={item.quantity}
      actions={
        <button onClick={() => removeItem(item.id)}>
          <X className="w-4 h-4" />
        </button>
      }
    />
  ))}
</Card>
```

### Status Feedback

```tsx
// Order confirmation
<Alert variant="success" title="Commande confirmee" size="lg">
  Merci pour votre commande. Vous recevrez un email de confirmation.
</Alert>

// Payment error
<Alert variant="error" title="Erreur de paiement" dismissible>
  Le paiement n'a pas pu etre traite. Veuillez verifier vos informations.
</Alert>

// Form validation
<InlineAlert variant="error">
  Veuillez entrer une adresse email valide
</InlineAlert>
```

---

## File Structure

```
components/ui/
  |- index.ts           # Central exports
  |- Alert.tsx          # Feedback messages
  |- Badge.tsx          # Status indicators
  |- Button.tsx         # Actions
  |- Card.tsx           # Content containers
  |- Container.tsx      # Layout wrapper
  |- Input.tsx          # Form inputs
  |- Separator.tsx      # Dividers
  |- Skeleton.tsx       # Loading states
  |- Stepper.tsx        # Progress steps
  |- Breadcrumbs.tsx    # Navigation
  |- LoadMore.tsx       # Pagination
  |- DESIGN_SYSTEM.md   # This documentation
```

---

## Usage with cn()

All components use the `cn()` utility from `@/lib/utils` for class merging:

```tsx
import { cn } from '@/lib/utils';

// Combining Tailwind classes safely
className={cn(
  'base-classes',
  variant && variantClasses[variant],
  size && sizeClasses[size],
  isActive && 'active-classes',
  className // Allow overrides
)}
```

---

## Version

Design System v1.0 - December 2024
Built for Maison Bijoux luxury jewelry e-commerce.
