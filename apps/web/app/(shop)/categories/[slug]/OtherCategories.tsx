'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import type { Category } from '@/types';

interface OtherCategoriesProps {
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
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

interface CategoryCardProps {
  category: Category;
  index: number;
}

/**
 * CategoryCard - Clean B2B category card
 */
function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <motion.div variants={itemVariants} className="h-full">
      <Link
        href={`/categories/${category.slug}`}
        className="group relative flex h-full flex-col border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-neutral-300 hover:shadow-md lg:p-6"
        aria-label={`Decouvrir la categorie ${category.name}`}
      >
        {/* Index number */}
        <span className="absolute right-3 top-3 font-sans text-2xl font-light text-neutral-200 transition-colors duration-200 group-hover:text-accent/30 lg:right-4 lg:top-4 lg:text-3xl">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Category Name */}
        <h3 className="pr-10 font-sans text-body-lg font-semibold text-neutral-900 transition-colors duration-200 group-hover:text-accent lg:pr-12">
          {category.name}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 font-sans text-body-sm text-neutral-500 lg:mt-2">
          {category.description}
        </p>

        {/* Bottom row: product count + arrow - pushed to bottom */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-sans text-caption uppercase tracking-wider text-neutral-400">
            {category.productCount} produits
          </span>

          <div className="flex items-center gap-1.5">
            <span className="h-px w-0 bg-accent transition-all duration-200 group-hover:w-5" />
            <ArrowUpRight
              className="h-4 w-4 text-accent transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Hover accent line */}
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-accent transition-all duration-200 group-hover:w-full" />
      </Link>
    </motion.div>
  );
}

/**
 * OtherCategories - Clean B2B navigation to other category pages
 *
 * Features:
 * - Text-only card-based category navigation (no images)
 * - Subtle hover effects
 * - Professional neutral styling
 * - Responsive grid layout
 */
export function OtherCategories({ categories, currentSlug }: OtherCategoriesProps) {
  // Filter out current category
  const otherCategories = categories.filter((cat) => cat.slug !== currentSlug);

  if (otherCategories.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 bg-neutral-50 py-12 lg:py-16">
      <Container>
        {/* Section Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="mb-2 inline-block font-sans text-caption uppercase tracking-wider text-accent font-medium">
            Explorer
          </span>
          <h2 className="font-sans text-section-title font-semibold text-neutral-900">
            Autres Categories
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-10 bg-accent" />
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
        >
          {otherCategories.slice(0, 6).map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </motion.div>

        {/* View All Link */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link
            href="/categories"
            className="group inline-flex items-center gap-2 font-sans text-body-sm font-medium text-neutral-700 transition-colors duration-200 hover:text-accent"
          >
            <span>Toutes les categories</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
            <span className="h-px w-8 bg-accent transition-all duration-200 group-hover:w-10" />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}

export default OtherCategories;
