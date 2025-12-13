'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Card variant styles - Hermes-inspired luxury design
 */
const cardVariants = {
  // Default elevated card with subtle shadow
  elevated: [
    'bg-white',
    'border border-border-light',
    'shadow-card',
    'hover:shadow-card-hover hover:border-hermes-500/20',
  ].join(' '),

  // Flat card with border only
  outlined: [
    'bg-white',
    'border border-border',
    'hover:border-hermes-500/30',
  ].join(' '),

  // Subtle background card
  filled: [
    'bg-background-muted',
    'border border-transparent',
    'hover:bg-background-beige',
  ].join(' '),

  // Ghost/transparent card
  ghost: [
    'bg-transparent',
    'border border-transparent',
    'hover:bg-background-muted',
  ].join(' '),

  // Interactive card with more prominent hover
  interactive: [
    'bg-white',
    'border border-border-light',
    'shadow-card',
    'hover:shadow-elegant-lg hover:border-hermes-500/30 hover:-translate-y-0.5',
    'cursor-pointer',
  ].join(' '),

  // Highlighted/featured card with accent
  featured: [
    'bg-white',
    'border-2 border-hermes-500/20',
    'shadow-elegant',
    'hover:border-hermes-500/40',
  ].join(' '),
};

/**
 * Card size/padding configurations
 */
const cardSizes = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: keyof typeof cardVariants;
  /** Padding size */
  size?: keyof typeof cardSizes;
  /** Whether to animate on mount */
  animate?: boolean;
  /** Card content */
  children: ReactNode;
}

/**
 * Card component for containing content sections.
 *
 * Design principles (Hermes-inspired):
 * - Clean white backgrounds for content focus
 * - Subtle shadows for depth without heaviness
 * - Refined borders and hover states
 * - Generous padding for breathing room
 *
 * @example
 * <Card variant="elevated" size="lg">
 *   <CardHeader>
 *     <CardTitle>Order Summary</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     ...content
 *   </CardContent>
 * </Card>
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'elevated',
      size = 'md',
      animate = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const cardClasses = cn(
      'rounded-soft',
      'transition-all duration-400 ease-luxe',
      cardVariants[variant],
      cardSizes[size],
      className
    );

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          {...(props as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header component
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Header content */
  children: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Title component - uses serif typography for luxury feel
 */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Title text */
  children: ReactNode;
  /** HTML heading level */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className, children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'font-serif text-heading-5 text-text-primary',
        'leading-tight tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);

CardTitle.displayName = 'CardTitle';

/**
 * Card Description component
 */
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Description text */
  children: ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('font-sans text-body-sm text-text-muted', className)}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

/**
 * Card Content component - main content area
 */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Content */
  children: ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

/**
 * Card Footer component - for actions or summary info
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Footer content */
  children: ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

/**
 * Cart Item Card - specialized card for cart/order items
 */
export interface CartItemCardProps {
  /** Product image URL */
  image?: string;
  /** Product name */
  name: string;
  /** Product variant/options (e.g., "Or rose, Taille 52") */
  variant?: string;
  /** Product price */
  price: string;
  /** Quantity */
  quantity?: number;
  /** Original price if on sale */
  originalPrice?: string;
  /** Whether the item is being removed (for animation) */
  isRemoving?: boolean;
  /** Actions (e.g., quantity controls, remove button) */
  actions?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function CartItemCard({
  image,
  name,
  variant,
  price,
  quantity = 1,
  originalPrice,
  isRemoving = false,
  actions,
  className,
}: CartItemCardProps) {
  return (
    <motion.div
      className={cn(
        'flex gap-4 py-4',
        'border-b border-border-light last:border-b-0',
        className
      )}
      initial={{ opacity: 1, height: 'auto' }}
      animate={{
        opacity: isRemoving ? 0 : 1,
        height: isRemoving ? 0 : 'auto',
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Product Image */}
      {image && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-soft bg-background-muted">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="font-serif text-base text-text-primary leading-tight">
            {name}
          </h4>
          {variant && (
            <p className="mt-0.5 font-sans text-xs text-text-muted">
              {variant}
            </p>
          )}
          {quantity > 1 && (
            <p className="mt-1 font-sans text-xs text-text-light">
              Quantite: {quantity}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-sans text-sm font-medium text-text-primary">
            {price}
          </span>
          {originalPrice && (
            <span className="font-sans text-xs text-text-light line-through">
              {originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex flex-shrink-0 items-start">
          {actions}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Order Summary Card - specialized card for checkout summaries
 */
export interface OrderSummaryCardProps {
  /** Summary title */
  title?: string;
  /** Subtotal amount */
  subtotal: string;
  /** Shipping cost (or "Gratuit" for free) */
  shipping?: string;
  /** Tax amount */
  tax?: string;
  /** Discount amount */
  discount?: string;
  /** Discount code applied */
  discountCode?: string;
  /** Total amount */
  total: string;
  /** Additional line items */
  additionalItems?: Array<{ label: string; value: string }>;
  /** Footer content (e.g., promo code input, checkout button) */
  footer?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function OrderSummaryCard({
  title = 'Recapitulatif',
  subtotal,
  shipping,
  tax,
  discount,
  discountCode,
  total,
  additionalItems,
  footer,
  className,
}: OrderSummaryCardProps) {
  return (
    <Card variant="outlined" size="lg" className={className}>
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="text-center">
          {title}
        </CardTitle>
        <div className="mx-auto mt-2 h-px w-12 bg-hermes-500" />
      </CardHeader>

      {/* Summary Lines */}
      <CardContent className="space-y-3 pt-4">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="font-sans text-sm text-text-muted">Sous-total</span>
          <span className="font-sans text-sm text-text-primary">{subtotal}</span>
        </div>

        {/* Shipping */}
        {shipping !== undefined && (
          <div className="flex justify-between">
            <span className="font-sans text-sm text-text-muted">Livraison</span>
            <span className="font-sans text-sm text-text-primary">{shipping}</span>
          </div>
        )}

        {/* Tax */}
        {tax && (
          <div className="flex justify-between">
            <span className="font-sans text-sm text-text-muted">TVA</span>
            <span className="font-sans text-sm text-text-primary">{tax}</span>
          </div>
        )}

        {/* Discount */}
        {discount && (
          <div className="flex justify-between">
            <span className="font-sans text-sm text-hermes-500">
              Remise{discountCode && ` (${discountCode})`}
            </span>
            <span className="font-sans text-sm text-hermes-500">-{discount}</span>
          </div>
        )}

        {/* Additional Items */}
        {additionalItems?.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="font-sans text-sm text-text-muted">{item.label}</span>
            <span className="font-sans text-sm text-text-primary">{item.value}</span>
          </div>
        ))}

        {/* Divider */}
        <div className="my-4 h-px bg-border" />

        {/* Total */}
        <div className="flex justify-between">
          <span className="font-serif text-lg text-text-primary">Total</span>
          <span className="font-serif text-lg text-text-primary">{total}</span>
        </div>
      </CardContent>

      {/* Footer */}
      {footer && (
        <CardFooter className="mt-6 flex-col gap-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  cardSizes,
};
