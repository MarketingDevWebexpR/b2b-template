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
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

interface CollectionCardProps {
  category: Category;
  index: number;
}

function CollectionCard({ category, index }: CollectionCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/collections/${category.slug}`}
        className="group relative flex h-[200px] flex-col rounded-soft border border-border bg-white p-6 transition-all duration-400 hover:border-hermes-500 hover:shadow-elegant overflow-hidden"
        aria-label={`Découvrir la collection ${category.name}`}
      >
        {/* Index number */}
        <span className="absolute right-4 top-4 font-serif text-4xl text-hermes-500/15 transition-colors duration-400 group-hover:text-hermes-500/30">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Category Name */}
        <h2 className="line-clamp-2 pr-12 font-serif text-lg text-text-primary transition-colors duration-350 group-hover:text-hermes-600">
          {category.name}
        </h2>

        {/* Description */}
        <p className="mt-2 line-clamp-1 font-sans text-sm text-text-muted">
          {category.description || `Découvrez notre sélection de ${category.name.toLowerCase()}`}
        </p>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Bottom row: product count + arrow */}
        <div className="flex items-center justify-between">
          <span className="font-sans text-caption uppercase tracking-luxe text-text-muted">
            {category.productCount} {category.productCount > 1 ? 'pièces' : 'pièce'}
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

interface CollectionsGridProps {
  categories: Category[];
}

export function CollectionsGrid({ categories }: CollectionsGridProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-body text-text-muted">
          Aucune collection disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {categories.map((category, index) => (
        <CollectionCard key={category.id} category={category} index={index} />
      ))}
    </motion.div>
  );
}

export default CollectionsGrid;
