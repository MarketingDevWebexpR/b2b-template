'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import type { Category } from '@/types';

interface OtherCollectionsProps {
  /** Array of categories to display */
  categories: Category[];
  /** Current category slug (to exclude from display) */
  currentSlug: string;
}

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

interface CategoryCardProps {
  category: Category;
  index: number;
}

/**
 * CategoryCard - Text-only category card with elegant styling
 */
function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <motion.div variants={itemVariants} className="h-full">
      <Link
        href={`/collections/${category.slug}`}
        className="group relative flex h-full flex-col border border-border bg-white p-6 transition-all duration-400 hover:border-hermes-500 hover:shadow-elegant lg:p-8"
        aria-label={`Decouvrir la collection ${category.name}`}
      >
        {/* Index number */}
        <span className="absolute right-4 top-4 font-serif text-3xl text-hermes-500/20 transition-colors duration-400 group-hover:text-hermes-500/40 lg:right-6 lg:top-6 lg:text-4xl">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Category Name */}
        <h3 className="pr-12 font-serif text-heading-4 text-text-primary transition-colors duration-350 group-hover:text-hermes-600 lg:pr-14 lg:text-heading-3">
          {category.name}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 font-sans text-body-sm text-text-muted lg:mt-3 lg:text-body">
          {category.description}
        </p>

        {/* Bottom row: product count + arrow - pushed to bottom */}
        <div className="mt-auto flex items-center justify-between pt-4 lg:pt-6">
          <span className="font-sans text-caption uppercase tracking-luxe text-text-muted">
            {category.productCount} pieces
          </span>

          <div className="flex items-center gap-2">
            <span className="h-px w-0 bg-hermes-500 transition-all duration-400 group-hover:w-6 lg:group-hover:w-8" />
            <ArrowUpRight
              className="h-4 w-4 text-hermes-500 transition-transform duration-400 group-hover:translate-x-1 group-hover:-translate-y-1 lg:h-5 lg:w-5"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Hover accent line */}
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-hermes-500 transition-all duration-400 group-hover:w-full" />
      </Link>
    </motion.div>
  );
}

/**
 * OtherCollections - Elegant navigation to other collection pages
 *
 * Features:
 * - Text-only card-based collection navigation (no images)
 * - Subtle hover effects with Hermes accent color
 * - Hermes-inspired minimalist design
 * - Responsive grid layout
 * - Framer-motion animations
 */
export function OtherCollections({
  categories,
  currentSlug,
}: OtherCollectionsProps) {
  // Filter out current category
  const otherCategories = categories.filter((cat) => cat.slug !== currentSlug);

  if (otherCategories.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border-light bg-background-beige py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="mb-3 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500">
            Explorer
          </span>
          <h2 className="font-serif text-heading-2 text-text-primary md:text-heading-1">
            Autres Collections
          </h2>
          <div className="mx-auto mt-5 h-px w-16 bg-hermes-500" />
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {otherCategories.slice(0, 6).map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </motion.div>

        {/* View All Link */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link
            href="/collections"
            className="group inline-flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-luxe text-text-primary transition-colors duration-350 hover:text-hermes-500"
          >
            <span>Toutes les collections</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-350 group-hover:translate-x-1"
              strokeWidth={1.5}
            />
            <span className="h-px w-10 bg-hermes-500 transition-all duration-350 group-hover:w-14" />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}

export default OtherCollections;
