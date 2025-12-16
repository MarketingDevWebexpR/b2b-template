'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Check, Loader2 } from 'lucide-react';
import type { Product } from '@/types';
import { cn, formatPrice, calculateDiscount } from '@/lib/utils';
import { StockDisplay } from './StockDisplay';

interface ProductInfoProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void | Promise<void>;
  className?: string;
}

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 5) return 'low_stock';
  return 'in_stock';
}

export function ProductInfo({ product, onAddToCart, className }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? calculateDiscount(product.price, product.compareAtPrice!)
    : 0;
  const stockStatus = getStockStatus(product.stock);
  const isOutOfStock = stockStatus === 'out_of_stock';

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  }, [product.stock]);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart || isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await onAddToCart(product, quantity);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } finally {
      setIsAdding(false);
    }
  }, [onAddToCart, product, quantity, isOutOfStock, isAdding]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Product Name */}
      <motion.h1
        className="font-sans font-semibold text-2xl md:text-3xl text-neutral-900 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {product.name}
      </motion.h1>

      {/* Price Display */}
      <motion.div
        className="flex items-baseline gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span className="text-2xl md:text-3xl font-medium text-neutral-900">
          {formatPrice(product.price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-neutral-500 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
            <span className="px-2 py-1 bg-accent text-white text-xs font-bold uppercase rounded">
              -{discountPercentage}%
            </span>
          </>
        )}
      </motion.div>

      {/* Short Description */}
      <motion.p
        className="text-neutral-500 text-base md:text-lg leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {product.shortDescription}
      </motion.p>

      {/* Materials */}
      {product.materials.length > 0 && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-sm uppercase tracking-wider text-neutral-500">
            Materiaux
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.materials.map((material, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent text-sm font-medium rounded"
              >
                {material}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stock Status - Enhanced for logged-in users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <StockDisplay stock={product.stock} showDetailedInfo={false} />
      </motion.div>

      {/* Quantity Selector & Add to Cart */}
      <motion.div
        className="space-y-5 pt-6 border-t border-neutral-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm uppercase tracking-wider text-neutral-500 font-medium">
            Quantité
          </span>
          <div className="flex items-center border border-neutral-200 rounded-lg">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1 || isOutOfStock}
              className={cn(
                'w-11 h-11 flex items-center justify-center transition-all duration-200',
                'hover:bg-neutral-100 focus:outline-none focus:bg-neutral-100',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-4 h-4 text-neutral-900" strokeWidth={1.5} />
            </button>
            <span
              className="w-14 h-11 flex items-center justify-center text-neutral-900 font-medium border-x border-neutral-200 bg-white"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              disabled={quantity >= product.stock || isOutOfStock}
              className={cn(
                'w-11 h-11 flex items-center justify-center transition-all duration-200',
                'hover:bg-neutral-100 focus:outline-none focus:bg-neutral-100',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-4 h-4 text-neutral-900" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={cn(
            'w-full py-4 px-8 font-sans text-sm font-medium uppercase tracking-wider rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
            isOutOfStock
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : addedFeedback
              ? 'bg-green-600 text-white'
              : 'bg-accent text-white hover:bg-accent/90 active:scale-[0.98]'
          )}
          aria-live="polite"
        >
          {isAdding ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Ajout en cours...
            </span>
          ) : addedFeedback ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Ajouté au panier
            </span>
          ) : isOutOfStock ? (
            'Rupture de stock'
          ) : (
            'Ajouter au panier'
          )}
        </button>

        {/* Total Price Hint */}
        {!isOutOfStock && quantity > 1 && (
          <p className="text-center text-neutral-500 text-sm">
            Total: <span className="text-neutral-900 font-medium">{formatPrice(product.price * quantity)}</span>
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default ProductInfo;
