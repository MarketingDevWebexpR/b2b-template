# B2B Professional Design System

## Overview

A modern, ultra-minimalist B2B design system for the professional jewelry e-commerce platform. This system prioritizes clarity, efficiency, and professional aesthetics while maintaining excellent accessibility and user experience.

---

## Design Philosophy

### Core Principles

1. **Professional Clarity**: Clean interfaces that communicate clearly and efficiently.
2. **Neutral Foundation**: Gray-based palette that lets products be the focus.
3. **Strategic Accent**: Orange accent (#f67828) for CTAs and important actions.
4. **Generous Spacing**: Comfortable visual breathing room.
5. **Accessibility First**: WCAG compliant design that everyone can use.

---

## Color Palette

### Accent Color (CTAs & Actions)

```
accent: #f67828  (Primary action color)
```

Usage: Buttons, links, progress indicators, active states

### Neutral Gray Scale

```
neutral-50:  #fafafa  (Subtle backgrounds)
neutral-100: #f5f5f5  (Muted sections)
neutral-200: #e5e5e5  (Borders, dividers)
neutral-300: #d4d4d4  (Medium borders)
neutral-400: #a3a3a3  (Subtle text, icons)
neutral-500: #737373  (Secondary text)
neutral-600: #525252  (Body text)
neutral-700: #404040  (Dark text)
neutral-800: #262626  (Headings)
neutral-900: #171717  (Primary text)
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

- **Sans-Serif (All text)**: Inter, system-ui, sans-serif

### Type Scale

| Name          | Size   | Line Height | Letter Spacing | Weight |
|---------------|--------|-------------|----------------|--------|
| hero          | 4rem   | 1.1         | -0.02em        | 700    |
| section       | 2.5rem | 1.2         | -0.01em        | 600    |
| heading-1     | 2rem   | 1.25        | -0.01em        | 600    |
| heading-2     | 1.75rem| 1.3         | 0              | 600    |
| heading-3     | 1.5rem | 1.35        | 0              | 600    |
| heading-4     | 1.25rem| 1.4         | 0              | 600    |
| heading-5     | 1.125rem| 1.4        | 0              | 600    |
| body-lg       | 1.125rem| 1.7        | 0              | 400    |
| body          | 1rem   | 1.7         | 0              | 400    |
| body-sm       | 0.875rem| 1.6        | 0              | 400    |
| caption       | 0.75rem| 1.5         | 0.01em         | 400    |

### Letter Spacing Utilities

```
tracking-wide:   0.025em  (Labels, buttons)
tracking-wider:  0.05em   (Uppercase text)
tracking-normal: 0        (Body text)
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

- **Section padding**: Use 16-24 for vertical rhythm
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
- Rounded corners (rounded-lg)
- Uppercase text with tracking-wide
- Primary uses accent color
- Subtle hover transitions (duration-150)

### Badge

Variants: `primary`, `primary-outline`, `primary-soft`, `dark`, `light`, `success`, `warning`, `error`, `info`, `pending`
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

Variants: `default`, `light`, `medium`, `strong`, `accent`, `fade`, `accent-fade`
Orientations: `horizontal`, `vertical`
Sizes: `xs`, `sm`, `md`, `lg`

```tsx
// Simple divider
<Separator />

// Accent divider (centered)
<DecorativeDivider lineWidth="w-24" />

// Divider with text
<DecorativeDivider>ou</DecorativeDivider>

// Section header with divider
<SectionDivider title="Informations de livraison" />
```

### Alert

Variants: `success`, `error`, `warning`, `info`, `accent`, `neutral`
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

Standard CSS transitions with duration-150 for most interactions.

### Durations

```
duration-150: 150ms  (Standard transitions)
duration-200: 200ms  (Micro-interactions)
duration-300: 300ms  (Medium transitions)
duration-500: 500ms  (Entrance animations)
```

### Animation Presets

```
fade-in:      0.5s fade
fade-in-up:   0.5s fade with 20px slide up
scale-in:     0.3s subtle scale entrance
shimmer:      2s loading shimmer
```

### Framer Motion Patterns

```tsx
// Container with staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
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
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};
```

---

## Shadows

```
shadow-sm:   Subtle shadow
shadow:      Default shadow
shadow-md:   Medium shadow
shadow-lg:   Large shadow
shadow-xl:   Extra large shadow
```

---

## Border Radius

```
rounded:     0.25rem  (Subtle rounding)
rounded-md:  0.375rem (Small elements)
rounded-lg:  0.5rem   (Standard - default for most components)
rounded-xl:  0.75rem  (Prominent elements)
rounded-2xl: 1rem     (Large containers)
rounded-full: 9999px  (Pills, avatars)
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
- `focus-visible:ring-accent` (accent color ring)

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

Design System v2.0 - December 2024
B2B Professional Design for wholesale jewelry e-commerce.
