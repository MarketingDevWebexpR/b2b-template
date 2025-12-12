'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  onQuickAdd?: (product: Product) => void;
  className?: string;
}

export function RelatedProducts({
  products,
  title = 'Vous aimerez aussi',
  onQuickAdd,
  className,
}: RelatedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check scroll capabilities
  const checkScrollCapabilities = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize scroll check
  useEffect(() => {
    checkScrollCapabilities();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollCapabilities);
      return () => container.removeEventListener('scroll', checkScrollCapabilities);
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-12 md:py-16', className)} aria-labelledby="related-products-title">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            id="related-products-title"
            className="font-serif text-heading-3 md:text-heading-2 text-text-primary"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h2>

          {/* Navigation Arrows (Desktop) */}
          {!isMobile && products.length > 4 && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={cn(
                  'w-10 h-10 flex items-center justify-center border transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-hermes-500',
                  canScrollLeft
                    ? 'border-hermes-500 text-hermes-500 hover:bg-hermes-500 hover:text-white'
                    : 'border-border text-text-muted cursor-not-allowed'
                )}
                aria-label="Produits precedents"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={cn(
                  'w-10 h-10 flex items-center justify-center border transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-hermes-500',
                  canScrollRight
                    ? 'border-hermes-500 text-hermes-500 hover:bg-hermes-500 hover:text-white'
                    : 'border-border text-text-muted cursor-not-allowed'
                )}
                aria-label="Produits suivants"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Products Container */}
        {isMobile ? (
          // Mobile: Horizontal Scroll
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
            role="list"
            aria-label="Produits similaires"
          >
            {products.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.id}
                className="flex-shrink-0 w-[70vw] max-w-[280px] snap-start"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} onQuickAdd={onQuickAdd} />
              </motion.div>
            ))}
          </div>
        ) : (
          // Desktop: Grid with optional scroll
          <div
            ref={scrollContainerRef}
            className={cn(
              'grid gap-6 md:gap-8',
              products.length <= 4
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'flex overflow-x-auto pb-4 scrollbar-hide'
            )}
            role="list"
            aria-label="Produits similaires"
          >
            {products.slice(0, products.length <= 4 ? 4 : 8).map((product, index) => (
              <motion.div
                key={product.id}
                className={cn(
                  products.length > 4 && 'flex-shrink-0 w-[280px]'
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} onQuickAdd={onQuickAdd} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Scroll Indicator (Mobile) */}
        {isMobile && products.length > 2 && (
          <div className="flex justify-center mt-4 gap-1">
            {products.slice(0, Math.min(products.length, 8)).map((_, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-hermes-500/40"
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default RelatedProducts;
