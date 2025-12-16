'use client';

/**
 * WishlistProductRow Component
 *
 * Displays a product row in a wishlist with image, details,
 * price, stock availability, quantity controls, and actions.
 */

import { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import type { WishlistItemB2B } from '@maison/types';

// ============================================================================
// Icons
// ============================================================================

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

interface WishlistProductRowProps {
  /** Wishlist item data */
  item: WishlistItemB2B;
  /** List ID for context */
  listId: string;
  /** Whether the row is selected */
  isSelected?: boolean;
  /** Whether selection mode is enabled */
  selectionMode?: boolean;
  /** Whether the row is editable */
  isEditable?: boolean;
  /** Handler for selection toggle */
  onSelect?: (itemId: string, selected: boolean) => void;
  /** Handler for quantity change */
  onQuantityChange?: (itemId: string, quantity: number) => void;
  /** Handler for notes change */
  onNotesChange?: (itemId: string, notes: string) => void;
  /** Handler for remove action */
  onRemove?: (itemId: string) => void;
  /** Additional className */
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStockStatus(available: number, requested: number): {
  status: 'available' | 'low' | 'unavailable';
  label: string;
  color: string;
} {
  if (available === 0) {
    return {
      status: 'unavailable',
      label: 'Rupture de stock',
      color: 'text-red-600',
    };
  }
  if (available < requested) {
    return {
      status: 'low',
      label: `${available} disponible${available > 1 ? 's' : ''}`,
      color: 'text-amber-600',
    };
  }
  return {
    status: 'available',
    label: 'En stock',
    color: 'text-green-600',
  };
}

function getPriceChange(current: number, original: number): {
  hasChanged: boolean;
  direction: 'up' | 'down' | 'same';
  percent: number;
} {
  if (current === original) {
    return { hasChanged: false, direction: 'same', percent: 0 };
  }
  const percent = Math.abs(((current - original) / original) * 100);
  return {
    hasChanged: true,
    direction: current > original ? 'up' : 'down',
    percent: Math.round(percent),
  };
}

// ============================================================================
// Component
// ============================================================================

export const WishlistProductRow = memo(function WishlistProductRow({
  item,
  listId,
  isSelected = false,
  selectionMode = false,
  isEditable = true,
  onSelect,
  onQuantityChange,
  onNotesChange,
  onRemove,
  className,
}: WishlistProductRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.suggestedQuantity);
  const [localNotes, setLocalNotes] = useState(item.notes || '');

  const stockStatus = getStockStatus(item.stockAvailable, item.suggestedQuantity);
  const priceChange = getPriceChange(item.currentPrice, item.priceWhenAdded);
  const lineTotal = item.currentPrice * item.suggestedQuantity;

  const handleSelectChange = useCallback(() => {
    onSelect?.(item.id, !isSelected);
  }, [item.id, isSelected, onSelect]);

  const handleQuantityDecrease = useCallback(() => {
    if (localQuantity > 1) {
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      onQuantityChange?.(item.id, newQuantity);
    }
  }, [item.id, localQuantity, onQuantityChange]);

  const handleQuantityIncrease = useCallback(() => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    onQuantityChange?.(item.id, newQuantity);
  }, [item.id, localQuantity, onQuantityChange]);

  const handleQuantityInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 1) {
        setLocalQuantity(value);
        onQuantityChange?.(item.id, value);
      }
    },
    [item.id, onQuantityChange]
  );

  const handleNotesBlur = useCallback(() => {
    if (localNotes !== item.notes) {
      onNotesChange?.(item.id, localNotes);
    }
    setIsEditing(false);
  }, [item.id, item.notes, localNotes, onNotesChange]);

  const handleRemove = useCallback(() => {
    onRemove?.(item.id);
  }, [item.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-start gap-4 p-4 bg-white border-b border-neutral-200',
        'hover:bg-neutral-50 transition-colors',
        !item.isAvailable && 'opacity-60',
        className
      )}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectChange}
            disabled={!item.isAvailable}
            className={cn(
              'w-5 h-5 rounded border-2 border-neutral-300',
              'text-accent focus:ring-accent focus:ring-offset-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
            aria-label={`Selectionner ${item.productName}`}
          />
        </div>
      )}

      {/* Product Image */}
      <Link
        href={`/produits/${item.productId}`}
        className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
      >
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-neutral-100">
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="96px"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-medium px-2 py-1 bg-red-500 rounded">
                Indisponible
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        {/* Name and Reference */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/produits/${item.productId}`}
            className={cn(
              'font-sans text-body-sm font-medium text-neutral-900',
              'hover:text-accent transition-colors',
              'focus-visible:outline-none focus-visible:underline'
            )}
          >
            {item.productName}
          </Link>
          <Link
            href={`/produits/${item.productId}`}
            className={cn(
              'shrink-0 p-1 rounded text-neutral-500',
              'hover:text-accent hover:bg-neutral-100 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            )}
            aria-label="Voir le produit"
          >
            <ExternalLinkIcon />
          </Link>
        </div>

        {/* Reference */}
        <p className="text-caption text-neutral-500 mb-2">
          Ref: {item.productReference}
        </p>

        {/* Stock Status */}
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('flex items-center gap-1 text-caption font-medium', stockStatus.color)}>
            {stockStatus.status === 'available' ? <CheckIcon /> : <AlertIcon />}
            {stockStatus.label}
          </span>
          {stockStatus.status === 'low' && item.suggestedQuantity > item.stockAvailable && (
            <span className="text-caption text-amber-600">
              ({item.suggestedQuantity} demande{item.suggestedQuantity > 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Notes */}
        {isEditable && (isEditing || item.notes) ? (
          <div className="mb-2">
            {isEditing ? (
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Ajouter une note..."
                className={cn(
                  'w-full px-2 py-1 text-caption rounded border border-neutral-300',
                  'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent',
                  'resize-none'
                )}
                rows={2}
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-caption text-neutral-500 italic hover:text-neutral-600 transition-colors text-left"
              >
                {item.notes || 'Ajouter une note...'}
              </button>
            )}
          </div>
        ) : item.notes ? (
          <p className="text-caption text-neutral-500 italic mb-2">{item.notes}</p>
        ) : null}

        {/* Added Info */}
        <p className="text-caption text-neutral-500">
          Ajoute par {item.addedByName}, {formatRelativeDate(item.addedAt)}
        </p>
      </div>

      {/* Price & Quantity */}
      <div className="shrink-0 text-right space-y-2">
        {/* Unit Price */}
        <div>
          <p className="font-sans text-body-sm font-medium text-neutral-900">
            {formatCurrency(item.currentPrice, item.currency)}
          </p>
          {priceChange.hasChanged && (
            <p className={cn(
              'text-caption',
              priceChange.direction === 'up' ? 'text-red-600' : 'text-green-600'
            )}>
              {priceChange.direction === 'up' ? '+' : '-'}{priceChange.percent}% depuis l'ajout
            </p>
          )}
        </div>

        {/* Quantity Controls */}
        {isEditable ? (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={handleQuantityDecrease}
              disabled={localQuantity <= 1}
              className={cn(
                'p-1 rounded border border-neutral-300',
                'hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
              aria-label="Diminuer la quantite"
            >
              <MinusIcon />
            </button>
            <input
              type="number"
              min="1"
              value={localQuantity}
              onChange={handleQuantityInput}
              className={cn(
                'w-12 px-2 py-1 text-center text-body-sm font-medium',
                'border border-neutral-300 rounded',
                'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent'
              )}
              aria-label="Quantite suggeree"
            />
            <button
              type="button"
              onClick={handleQuantityIncrease}
              className={cn(
                'p-1 rounded border border-neutral-300',
                'hover:bg-neutral-100 transition-colors'
              )}
              aria-label="Augmenter la quantite"
            >
              <PlusIcon />
            </button>
          </div>
        ) : (
          <p className="text-body-sm text-neutral-600">
            Qte: {item.suggestedQuantity}
          </p>
        )}

        {/* Line Total */}
        <p className="font-sans text-body font-semibold text-neutral-900">
          {formatCurrency(lineTotal, item.currency)}
        </p>
      </div>

      {/* Actions */}
      {isEditable && (
        <div className="shrink-0 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'p-2 rounded text-neutral-500',
              'hover:text-red-600 hover:bg-red-50 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
              'opacity-0 group-hover:opacity-100'
            )}
            aria-label={`Retirer ${item.productName} de la liste`}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </motion.div>
  );
});

export default WishlistProductRow;
