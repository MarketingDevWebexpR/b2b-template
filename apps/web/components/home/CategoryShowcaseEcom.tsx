'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CategoryCard {
  id: string;
  name: string;
  description?: string;
  image?: string;
  href: string;
  productCount?: number;
  featured?: boolean;
}

export interface CategoryShowcaseEcomProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Categories to display */
  categories?: CategoryCard[];
  /** Additional CSS classes */
  className?: string;
}

const defaultCategories: CategoryCard[] = [
  {
    id: 'bagues',
    name: 'Bagues',
    description: 'Alliance, solitaire, chevaliere',
    href: '/categories/bagues',
    productCount: 1250,
    featured: true,
  },
  {
    id: 'colliers',
    name: 'Colliers & Pendentifs',
    description: 'Chaines, medailles, sautoirs',
    href: '/categories/colliers',
    productCount: 890,
    featured: true,
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    description: 'Joncs, chaines, manchettes',
    href: '/categories/bracelets',
    productCount: 650,
  },
  {
    id: 'boucles',
    name: 'Boucles d\'oreilles',
    description: 'Creoles, puces, pendantes',
    href: '/categories/boucles-oreilles',
    productCount: 780,
  },
  {
    id: 'montres',
    name: 'Montres',
    description: 'Femme, homme, unisexe',
    href: '/categories/montres',
    productCount: 420,
  },
  {
    id: 'pierres',
    name: 'Pierres & Diamants',
    description: 'Diamants, saphirs, rubis',
    href: '/categories/pierres',
    productCount: 340,
  },
];

export const CategoryShowcaseEcom = memo(function CategoryShowcaseEcom({
  title = 'Explorer nos categories',
  subtitle = 'Trouvez les produits qu\'il vous faut parmi notre catalogue',
  categories = defaultCategories,
  className,
}: CategoryShowcaseEcomProps) {
  // Separate featured and regular categories
  const featuredCategories = categories.filter((c) => c.featured);
  const regularCategories = categories.filter((c) => !c.featured);

  return (
    <section className={cn('py-10 lg:py-16 bg-white', className)}>
      <div className="container-ecom">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-section lg:text-section-xl font-heading text-content-primary mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-body lg:text-body-lg text-content-secondary max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Featured categories - larger cards */}
        {featuredCategories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
            {featuredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={category.href}
                  className="group block relative overflow-hidden rounded-2xl bg-surface-secondary h-[200px] lg:h-[280px]"
                >
                  {/* Background placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 group-hover:scale-105 transition-transform duration-500">
                    {/* Image placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <svg className="w-24 h-24 lg:w-32 lg:h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Text content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
                    <h3 className="text-card-title lg:text-section font-heading mb-1 group-hover:text-accent transition-colors duration-200">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-body-sm lg:text-body opacity-80 mb-2">
                        {category.description}
                      </p>
                    )}
                    {category.productCount && (
                      <p className="text-caption opacity-60">
                        {category.productCount.toLocaleString('fr-FR')} produits
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Regular categories - smaller grid */}
        {regularCategories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {regularCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (featuredCategories.length + index) * 0.05 }}
              >
                <Link
                  href={category.href}
                  className="group block relative overflow-hidden rounded-xl bg-surface-secondary h-[140px] lg:h-[160px]"
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-secondary to-surface-tertiary group-hover:from-primary-50 group-hover:to-primary-100 transition-colors duration-300">
                    {/* Image placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-card-title-sm font-semibold text-content-primary mb-0.5 group-hover:text-primary transition-colors duration-200">
                      {category.name}
                    </h3>
                    {category.productCount && (
                      <p className="text-caption text-content-muted">
                        {category.productCount.toLocaleString('fr-FR')} produits
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

CategoryShowcaseEcom.displayName = 'CategoryShowcaseEcom';

export default CategoryShowcaseEcom;
