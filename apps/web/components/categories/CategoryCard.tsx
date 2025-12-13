'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
  priority?: boolean;
}

export function CategoryCard({ category, className, priority = false }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/categories/${category.slug}`}
        className="block relative aspect-[4/5] overflow-hidden"
        aria-label={`Voir la collection ${category.name}`}
      >
        {/* Background Image with Zoom Effect */}
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-700 ease-luxury',
            isHovered && 'scale-110'
          )}
        >
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-opacity duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            priority={priority}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-luxury-charcoal animate-shimmer bg-gradient-to-r from-luxury-charcoal via-luxury-gray to-luxury-charcoal bg-[length:200%_100%]" />
          )}
        </div>

        {/* Gradient Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent',
            'transition-opacity duration-500',
            isHovered ? 'opacity-90' : 'opacity-70'
          )}
        />

        {/* Animated Border */}
        <div
          className={cn(
            'absolute inset-0 z-10 pointer-events-none transition-all duration-500 ease-luxury',
            'border-2 border-transparent',
            isHovered && 'border-gold-500/60 m-3'
          )}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-20">
          {/* Gold Decorative Line */}
          <motion.div
            className="w-12 h-[2px] bg-gold-500 mb-4"
            initial={{ width: 0 }}
            animate={{ width: isHovered ? 64 : 48 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Category Name */}
          <h3
            className={cn(
              'font-serif text-heading-3 md:text-heading-2 text-white mb-2',
              'transition-transform duration-500 ease-luxury',
              isHovered && '-translate-y-1'
            )}
          >
            {category.name}
          </h3>

          {/* Product Count */}
          <p
            className={cn(
              'text-luxury-silver text-sm uppercase tracking-wider',
              'transition-all duration-500 ease-luxury',
              isHovered && 'text-gold-400'
            )}
          >
            {category.productCount} pieces
          </p>

          {/* Hover CTA */}
          <motion.span
            className="mt-4 text-gold-500 text-sm uppercase tracking-wider flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10,
            }}
            transition={{ duration: 0.3 }}
          >
            Decouvrir la collection
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.span>
        </div>
      </Link>
    </motion.article>
  );
}

export default CategoryCard;
