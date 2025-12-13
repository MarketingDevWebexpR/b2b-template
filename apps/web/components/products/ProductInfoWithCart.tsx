'use client';

import { useCart } from '@/contexts/CartContext';
import { ProductInfo } from './ProductInfo';
import type { Product } from '@/types';

interface ProductInfoWithCartProps {
  product: Product;
  className?: string;
}

/**
 * Client component wrapper for ProductInfo that connects to CartContext
 * This allows the server-rendered product page to have cart functionality
 */
export function ProductInfoWithCart({ product, className }: ProductInfoWithCartProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  return (
    <ProductInfo
      product={product}
      onAddToCart={handleAddToCart}
      className={className}
    />
  );
}

export default ProductInfoWithCart;
