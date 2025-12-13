'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';

// ============================================
// Animation Variants
// ============================================

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const headerVariants = {
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

// ============================================
// Types
// ============================================

export interface FeaturedProductsProps {
  /** Array of products to display */
  products: Product[];
  /** Section title - defaults to "Pieces d'Exception" */
  title?: string;
  /** Section subtitle - defaults to "Selection exclusive" */
  subtitle?: string;
  /** Section description */
  description?: string;
  /** Link to view all products - defaults to "/products" */
  viewAllLink?: string;
  /** Text for view all button - defaults to "Voir tout" */
  viewAllText?: string;
  /** Maximum number of products to display - defaults to 8 */
  maxProducts?: number;
  /** Show only featured products - defaults to false (shows all passed products) */
  filterFeatured?: boolean;
}

// ============================================
// Component
// ============================================

export function FeaturedProducts({
  products,
  title = "Pieces d'Exception",
  subtitle = 'Selection exclusive',
  description = "Decouvrez notre selection de pieces d'exception, creees avec passion par nos maitres joailliers.",
  viewAllLink = '/products',
  viewAllText = 'Voir tout',
  maxProducts = 8,
  filterFeatured = false,
}: FeaturedProductsProps) {
  // Filter and limit products
  const displayProducts = filterFeatured
    ? products.filter((p) => p.featured).slice(0, maxProducts)
    : products.slice(0, maxProducts);

  // Don't render if no products
  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-background-cream py-24 lg:py-32">
      <div className="mx-auto max-w-content-wide px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span
            className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500"
            variants={headerVariants}
          >
            {subtitle}
          </motion.span>

          <motion.h2
            className="font-serif text-heading-1 text-text-primary md:text-display-2"
            variants={headerVariants}
          >
            {title}
          </motion.h2>

          {/* Hermes Orange Decorative Line */}
          <motion.div
            className="mx-auto mt-6 h-px w-24 bg-hermes-500"
            variants={headerVariants}
          />

          <motion.p
            className="mx-auto mt-6 max-w-prose font-sans text-body-lg text-text-muted"
            variants={headerVariants}
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </motion.div>

        {/* View All Link */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link
            href={viewAllLink}
            className="group inline-flex items-center gap-3 font-sans text-overline uppercase tracking-luxe text-text-primary transition-colors duration-350 hover:text-hermes-500"
          >
            <span>{viewAllText}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-350 group-hover:translate-x-1"
              strokeWidth={1.5}
            />
            <span className="h-px w-12 bg-hermes-500 transition-all duration-350 group-hover:w-16" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
