'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { HeaderSpacer } from '@/components/layout/Header';

interface CategoryHeroProps {
  /** Category name */
  name: string;
  /** Category description */
  description: string;
  /** Hero background image URL - not used, kept for interface compatibility */
  image?: string;
  /** Number of products in this category */
  productCount: number;
}

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      delay: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * CategoryHero - Elegant hero section for category pages
 *
 * Features:
 * - Minimalist text-based design (no images)
 * - Animated text elements
 * - Light cream/beige gradient background
 * - Product count badge
 * - Responsive design
 * - Same style as CategoriesShowcase on homepage
 */
export function CategoryHero({ name, description, productCount }: CategoryHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-warm">
      <HeaderSpacer />
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-vignette" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-hermes-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />

      <Container className="py-16 lg:py-20">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Subtitle/Overline */}
          <motion.span
            variants={textVariants}
            className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500"
          >
            Collection
          </motion.span>

          {/* Category Title */}
          <motion.h1
            variants={textVariants}
            className="font-serif text-heading-1 text-text-primary md:text-display-2 lg:text-display-1"
          >
            {name}
          </motion.h1>

          {/* Decorative Line */}
          <motion.div
            variants={lineVariants}
            className="mx-auto my-6 h-px w-24 origin-center bg-hermes-500"
          />

          {/* Description */}
          <motion.p
            variants={textVariants}
            className="mx-auto mb-6 max-w-2xl font-sans text-body-lg leading-elegant text-text-muted"
          >
            {description}
          </motion.p>

          {/* Product Count Badge */}
          <motion.div
            variants={textVariants}
            className="inline-flex items-center gap-3"
          >
            <span className="h-px w-8 bg-border-medium" aria-hidden="true" />
            <span className="font-sans text-xs font-medium uppercase tracking-luxe text-text-secondary">
              {productCount} {productCount > 1 ? 'pieces' : 'piece'} d'exception
            </span>
            <span className="h-px w-8 bg-border-medium" aria-hidden="true" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

export default CategoryHero;
