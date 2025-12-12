'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '@/types';

const containerVariants = {
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

function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/collections/${category.slug}`}
        className="group relative flex h-[200px] flex-col border border-border bg-white p-6 transition-all duration-400 hover:border-hermes-500 hover:shadow-elegant"
        aria-label={`Découvrir la collection ${category.name}`}
      >
        {/* Index number */}
        <span className="absolute right-4 top-4 font-serif text-4xl text-hermes-500/20 transition-colors duration-400 group-hover:text-hermes-500/40">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Category Name */}
        <h3 className="line-clamp-2 pr-12 font-serif text-lg text-text-primary transition-colors duration-350 group-hover:text-hermes-600">
          {category.name}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-1 font-sans text-sm text-text-muted">
          {category.description}
        </p>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Bottom row: product count + arrow */}
        <div className="flex items-center justify-between">
          <span className="font-sans text-caption uppercase tracking-luxe text-text-muted">
            {category.productCount} pièces
          </span>

          <div className="flex items-center gap-2">
            <span className="h-px w-0 bg-hermes-500 transition-all duration-400 group-hover:w-8" />
            <ArrowUpRight
              className="h-5 w-5 text-hermes-500 transition-transform duration-400 group-hover:translate-x-1 group-hover:-translate-y-1"
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

interface CategoriesShowcaseProps {
  categories: Category[];
}

export function CategoriesShowcase({ categories }: CategoriesShowcaseProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-background-beige py-24 lg:py-32">
      <div className="mx-auto max-w-content-wide px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500">
            Explorez
          </span>

          <h2 className="font-serif text-heading-1 text-text-primary md:text-display-2">
            Nos Collections
          </h2>

          {/* Hermes Orange Decorative Line */}
          <div className="mx-auto mt-6 h-px w-24 bg-hermes-500" />
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {categories.slice(0, 6).map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </motion.div>

        {/* View All Collections CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/collections"
            className="group inline-flex items-center gap-3 border border-hermes-500 bg-transparent px-8 py-4 font-sans text-overline font-medium uppercase tracking-luxe text-hermes-500 transition-all duration-400 hover:bg-hermes-500 hover:text-white"
          >
            <span>Voir toutes les collections</span>
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-350 group-hover:translate-x-1 group-hover:-translate-y-1"
              strokeWidth={1.5}
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default CategoriesShowcase;
