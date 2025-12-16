'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';

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
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

/**
 * CategoryHero - Clean B2B hero section for category pages
 *
 * Features:
 * - Minimalist text-based design (no images)
 * - Animated text elements
 * - Neutral gray background
 * - Product count badge
 * - Responsive design
 * - Professional B2B styling
 */
export function CategoryHero({ name, description, productCount }: CategoryHeroProps) {
  return (
    <section className="relative overflow-hidden bg-neutral-50">
      <B2BHeaderEcomSpacer showPromoBanner={true} />

      {/* Subtle bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200" />

      <Container className="py-10 lg:py-14">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Subtitle/Overline */}
          <motion.span
            variants={textVariants}
            className="mb-2 inline-block font-sans text-caption uppercase tracking-wider text-accent font-medium"
          >
            Categorie
          </motion.span>

          {/* Category Title */}
          <motion.h1
            variants={textVariants}
            className="font-sans text-section-title text-neutral-900 md:text-hero-title font-semibold"
          >
            {name}
          </motion.h1>

          {/* Decorative Line */}
          <motion.div
            variants={textVariants}
            className="mx-auto my-4 h-[2px] w-12 bg-accent"
          />

          {/* Description */}
          <motion.p
            variants={textVariants}
            className="mx-auto mb-4 max-w-2xl font-sans text-body leading-relaxed text-neutral-600"
          >
            {description}
          </motion.p>

          {/* Product Count Badge */}
          <motion.div
            variants={textVariants}
            className="inline-flex items-center gap-2"
          >
            <span className="h-px w-6 bg-neutral-300" aria-hidden="true" />
            <span className="font-sans text-caption font-medium uppercase tracking-wider text-neutral-500">
              {productCount} {productCount > 1 ? 'produits' : 'produit'} disponible{productCount > 1 ? 's' : ''}
            </span>
            <span className="h-px w-6 bg-neutral-300" aria-hidden="true" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

export default CategoryHero;
