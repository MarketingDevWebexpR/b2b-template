'use client';

/**
 * CartItem Component - B2B Enhanced
 *
 * Displays a cart item with:
 * - Product image and details
 * - Variant/SKU information
 * - Inline quantity selector
 * - Stock indicator
 * - Price breakdown (HT/TTC)
 * - Volume discount badge
 * - Remove action
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Warehouse,
} from 'lucide-react';
import { useCart, type B2BCartItem } from '@/contexts/CartContext';
import { formatPrice, cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface CartItemProps {
  item: B2BCartItem;
  compact?: boolean;
}

// ============================================================================
// Stock Status Badge
// ============================================================================

function StockBadge({ item }: { item: B2BCartItem }) {
  const status = item.stock.status;
  const available = item.stock.available;

  const statusConfig = {
    in_stock: {
      icon: CheckCircle,
      label: 'En stock',
      className: 'text-green-600 bg-green-50',
    },
    low_stock: {
      icon: AlertCircle,
      label: `Stock limite (${available})`,
      className: 'text-amber-600 bg-amber-50',
    },
    out_of_stock: {
      icon: AlertCircle,
      label: 'Rupture de stock',
      className: 'text-red-600 bg-red-50',
    },
    backorder: {
      icon: Clock,
      label: 'Sur commande',
      className: 'text-blue-600 bg-blue-50',
    },
    preorder: {
      icon: Clock,
      label: 'Precommande',
      className: 'text-purple-600 bg-purple-50',
    },
    discontinued: {
      icon: AlertCircle,
      label: 'Arrete',
      className: 'text-gray-600 bg-gray-50',
    },
  };

  const config = statusConfig[status] || statusConfig.in_stock;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ============================================================================
// Quantity Selector
// ============================================================================

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onUpdate: (quantity: number) => Promise<boolean>;
  disabled?: boolean;
}

function QuantitySelector({
  quantity,
  maxQuantity,
  onUpdate,
  disabled,
}: QuantitySelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [inputValue, setInputValue] = useState(quantity.toString());

  const handleDecrement = async () => {
    if (quantity <= 1 || isUpdating) return;
    setIsUpdating(true);
    await onUpdate(quantity - 1);
    setInputValue((quantity - 1).toString());
    setIsUpdating(false);
  };

  const handleIncrement = async () => {
    if (quantity >= maxQuantity || isUpdating) return;
    setIsUpdating(true);
    await onUpdate(quantity + 1);
    setInputValue((quantity + 1).toString());
    setIsUpdating(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = async () => {
    const newQuantity = parseInt(inputValue, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      setInputValue(quantity.toString());
      return;
    }
    if (newQuantity > maxQuantity) {
      setInputValue(maxQuantity.toString());
      setIsUpdating(true);
      await onUpdate(maxQuantity);
      setIsUpdating(false);
      return;
    }
    if (newQuantity !== quantity) {
      setIsUpdating(true);
      await onUpdate(newQuantity);
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center border border-neutral-200 rounded-lg overflow-hidden',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <button
        onClick={handleDecrement}
        disabled={quantity <= 1 || isUpdating || disabled}
        className={cn(
          'flex items-center justify-center',
          'w-9 h-9',
          'text-neutral-500',
          'transition-colors duration-200',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        aria-label="Diminuer la quantite"
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'w-12 h-9 text-center',
          'font-sans text-sm text-neutral-900',
          'border-x border-neutral-200',
          'focus:outline-none focus:bg-accent/5',
          'disabled:bg-neutral-50'
        )}
        aria-label="Quantite"
      />

      <button
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity || isUpdating || disabled}
        className={cn(
          'flex items-center justify-center',
          'w-9 h-9',
          'text-neutral-500',
          'transition-colors duration-200',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        aria-label="Augmenter la quantite"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CartItem({ item, compact = false }: CartItemProps) {
  const { updateQuantity, removeFromCart, updateItemNotes, stockValidationErrors } = useCart();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');

  const hasStockError = stockValidationErrors.some((e) => e.productId === item.productId);

  const handleUpdateQuantity = useCallback(
    async (quantity: number): Promise<boolean> => {
      return await updateQuantity(item.productId, quantity, item.variant?.id);
    },
    [updateQuantity, item.productId, item.variant?.id]
  );

  const handleRemove = useCallback(() => {
    removeFromCart(item.productId, item.variant?.id);
  }, [removeFromCart, item.productId, item.variant?.id]);

  const handleNotesBlur = useCallback(() => {
    if (notes !== item.notes) {
      updateItemNotes(item.productId, notes, item.variant?.id);
    }
  }, [updateItemNotes, item.productId, item.variant?.id, notes, item.notes]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="relative w-12 h-12 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {item.productName}
          </p>
          <p className="text-xs text-neutral-500">
            Qte: {item.quantity} x {formatPrice(item.pricing.unitPriceHT)}
          </p>
        </div>
        <p className="text-sm font-medium text-neutral-900">
          {formatPrice(item.quantity * item.pricing.unitPriceHT)}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={cn(
        'relative p-4 bg-white rounded-lg border',
        hasStockError ? 'border-red-200 bg-red-50/30' : 'border-neutral-200'
      )}
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/produits/${item.productSlug}`}
          className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden group"
        >
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 96px, 128px"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Product Name */}
              <Link
                href={`/produits/${item.productSlug}`}
                className="block"
              >
                <h3 className="font-medium text-neutral-900 hover:text-accent transition-colors line-clamp-2">
                  {item.productName}
                </h3>
              </Link>

              {/* Reference / SKU */}
              <div className="flex items-center gap-3 mt-1">
                {item.productReference && (
                  <p className="text-xs text-neutral-500">
                    Ref: {item.productReference}
                  </p>
                )}
                {item.variant && (
                  <p className="text-xs text-neutral-500">
                    {item.variant.name} ({item.variant.sku})
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-2">
                <StockBadge item={item} />
              </div>

              {/* Warehouse if selected */}
              {item.warehouseId && item.warehouseName && (
                <div className="flex items-center gap-1 mt-2 text-xs text-neutral-500">
                  <Warehouse className="w-3 h-3" />
                  {item.warehouseName}
                </div>
              )}
            </div>

            {/* Remove Button (mobile hidden) */}
            <button
              onClick={handleRemove}
              className="hidden md:flex items-center justify-center w-8 h-8 text-neutral-500 hover:text-red-500 transition-colors"
              aria-label="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Pricing Row */}
          <div className="flex items-end justify-between mt-4">
            <div className="flex items-center gap-6">
              {/* Quantity Selector */}
              <QuantitySelector
                quantity={item.quantity}
                maxQuantity={item.maxQuantity}
                onUpdate={handleUpdateQuantity}
                disabled={item.stock.status === 'out_of_stock'}
              />

              {/* Unit Price */}
              <div className="hidden sm:block">
                <p className="text-xs text-neutral-500">Prix unitaire</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-neutral-900">
                    {formatPrice(item.pricing.unitPriceHT)} HT
                  </span>
                  {item.pricing.originalPriceHT &&
                    item.pricing.originalPriceHT > item.pricing.unitPriceHT && (
                      <span className="text-xs text-neutral-400 line-through">
                        {formatPrice(item.pricing.originalPriceHT)}
                      </span>
                    )}
                </div>
              </div>
            </div>

            {/* Line Total */}
            <div className="text-right">
              <p className="text-xs text-neutral-500">Total ligne</p>
              <p className="text-base font-medium text-neutral-900">
                {formatPrice(item.quantity * item.pricing.unitPriceHT)} HT
              </p>
              <p className="text-xs text-neutral-500">
                {formatPrice(item.quantity * item.pricing.unitPriceTTC)} TTC
              </p>
            </div>
          </div>

          {/* Volume Discount Badge */}
          {item.pricing.volumeDiscountApplied && (
            <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
              <Package className="w-3 h-3" />
              {item.pricing.volumeDiscountApplied.label ||
                `-${item.pricing.volumeDiscountApplied.discountPercent}% (${item.pricing.volumeDiscountApplied.minQuantity}+ articles)`}
            </div>
          )}

          {/* Notes Section */}
          <div className="mt-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-accent transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              {item.notes ? 'Modifier la note' : 'Ajouter une note'}
              {showNotes ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            <AnimatePresence>
              {showNotes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 overflow-hidden"
                >
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Note pour cet article (ex: gravure, emballage special...)"
                    className={cn(
                      'w-full p-3 rounded-lg border border-neutral-200',
                      'text-sm text-neutral-900 placeholder:text-neutral-400',
                      'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
                      'resize-none'
                    )}
                    rows={2}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Remove Button */}
      <button
        onClick={handleRemove}
        className="md:hidden absolute top-4 right-4 flex items-center justify-center w-8 h-8 text-neutral-500 hover:text-red-500 transition-colors"
        aria-label="Supprimer"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Stock Error Message */}
      {hasStockError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-caption text-red-600"
        >
          <AlertCircle className="w-4 h-4" />
          <span>
            Quantite demandee superieure au stock disponible ({item.stock.available} disponible{item.stock.available > 1 ? 's' : ''})
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default CartItem;
