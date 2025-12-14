'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  /** Cart item data */
  item: CartItemType;
  /** Handler to update item quantity */
  onUpdateQuantity: (productId: string, quantity: number) => void;
  /** Handler to remove item */
  onRemove: (productId: string) => void;
  /** Animation delay index */
  index?: number;
}

/**
 * CartItem - Individual cart item component
 *
 * Features:
 * - Product image placeholder with elegant styling
 * - Quantity controls (+/-)
 * - Remove button
 * - Responsive layout
 * - Smooth animations
 */
function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
  index = 0,
}: CartItemProps) {
  const { product, quantity } = item;
  const itemTotal = product.price * quantity;

  const handleIncrement = () => {
    onUpdateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(product.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        'group relative',
        'grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr_auto_auto_auto] gap-4 md:gap-6',
        'py-6 md:py-8',
        'border-b border-border-light',
        'transition-colors duration-300'
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className={cn(
          'relative block aspect-square overflow-hidden',
          'bg-background-warm rounded-lg border border-border-light',
          'transition-all duration-400 ease-luxe',
          'group-hover:shadow-soft-md'
        )}
        aria-label={`Voir ${product.name}`}
      >
        <Image
          src={product.images?.[0] || '/images/placeholder-product.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100px, 140px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-col justify-between min-w-0">
        <div>
          {/* Product Name */}
          <Link
            href={`/products/${product.slug}`}
            className={cn(
              'block font-serif text-heading-5 md:text-heading-4 text-text-primary',
              'transition-colors duration-250 ease-luxe',
              'hover:text-hermes-500',
              'line-clamp-2'
            )}
          >
            {product.name}
          </Link>

          {/* Category */}
          {product.category && (
            <p className="mt-1 font-sans text-caption uppercase tracking-luxe text-text-muted">
              {product.category.name}
            </p>
          )}

          {/* Reference */}
          {product.reference && (
            <p className="mt-1 font-sans text-caption text-text-light">
              Ref: {product.reference}
            </p>
          )}
        </div>

        {/* Mobile: Price and quantity inline */}
        <div className="flex items-center justify-between mt-4 md:hidden">
          {/* Quantity Controls (Mobile) */}
          <div className="flex items-center gap-2">
            <QuantityButton
              onClick={handleDecrement}
              disabled={quantity <= 1}
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
            </QuantityButton>

            <span
              className={cn(
                'w-8 text-center',
                'font-sans text-body font-medium text-text-primary'
              )}
              aria-label={`Quantité: ${quantity}`}
            >
              {quantity}
            </span>

            <QuantityButton
              onClick={handleIncrement}
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            </QuantityButton>
          </div>

          {/* Price and Remove (Mobile) */}
          <div className="flex items-center gap-3">
            <span className="font-serif text-heading-5 text-text-primary">
              {formatPrice(itemTotal)}
            </span>
            <button
              onClick={handleRemove}
              className={cn(
                'flex items-center justify-center',
                'w-8 h-8',
                'text-text-light',
                'transition-all duration-250 ease-luxe',
                'hover:text-red-500',
                'focus:outline-none focus-visible:ring-1 focus-visible:ring-hermes-500'
              )}
              aria-label={`Supprimer ${product.name} du panier`}
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Quantity Controls (Desktop) */}
      <div className="hidden md:flex items-center gap-3">
        <QuantityButton
          onClick={handleDecrement}
          disabled={quantity <= 1}
          aria-label="Diminuer la quantite"
        >
          <Minus className="w-4 h-4" strokeWidth={1.5} />
        </QuantityButton>

        <span
          className={cn(
            'w-12 text-center',
            'font-sans text-body-lg font-medium text-text-primary'
          )}
          aria-label={`Quantite: ${quantity}`}
        >
          {quantity}
        </span>

        <QuantityButton
          onClick={handleIncrement}
          aria-label="Augmenter la quantite"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
        </QuantityButton>
      </div>

      {/* Price (Desktop) */}
      <div className="hidden md:flex flex-col items-end justify-center min-w-[100px]">
        {/* Price */}
        <span className="font-serif text-heading-4 text-text-primary whitespace-nowrap">
          {formatPrice(itemTotal)}
        </span>

        {/* Unit Price (if quantity > 1) */}
        <span className={cn(
          "mt-1 font-sans text-caption text-text-muted whitespace-nowrap",
          quantity <= 1 && "invisible"
        )}>
          {formatPrice(product.price)} / pièce
        </span>
      </div>

      {/* Remove Button (Desktop) */}
      <div className="hidden md:flex items-center justify-center">
        <button
          onClick={handleRemove}
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10',
            'text-text-light',
            'transition-all duration-250 ease-luxe',
            'hover:text-red-500',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-hermes-500'
          )}
          aria-label={`Supprimer ${product.name} du panier`}
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </motion.article>
  );
}

/**
 * Quantity Button Component
 */
interface QuantityButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  'aria-label': string;
}

function QuantityButton({
  onClick,
  disabled = false,
  children,
  'aria-label': ariaLabel,
}: QuantityButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center',
        'w-8 h-8 md:w-10 md:h-10',
        'border border-border-medium rounded-soft',
        'text-text-secondary',
        'transition-all duration-250 ease-luxe',
        'hover:border-hermes-500 hover:text-hermes-500',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-hermes-500',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border-medium disabled:hover:text-text-secondary'
      )}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

// Memoize to prevent unnecessary re-renders
export const CartItem = memo(CartItemComponent);
