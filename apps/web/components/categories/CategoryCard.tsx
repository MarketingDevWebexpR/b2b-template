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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Link
        href={`/categories/${category.slug}`}
        className={cn(
          'block relative bg-white rounded-xl overflow-hidden',
          'border border-neutral-200',
          'transition-all duration-300 ease-out',
          'hover:shadow-md hover:border-neutral-300',
          isHovered && 'scale-[1.02]'
        )}
        aria-label={`View ${category.name} collection`}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-all duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              isHovered && 'scale-105'
            )}
            priority={priority}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          )}

          {/* Subtle Overlay for Text Readability */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent',
              'transition-opacity duration-300',
              isHovered ? 'opacity-60' : 'opacity-40'
            )}
          />

          {/* Product Count Badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-neutral-700 backdrop-blur-sm">
              {category.productCount} products
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-5">
          {/* Category Name */}
          <h3 className="font-sans text-lg font-semibold text-neutral-900 mb-1">
            {category.name}
          </h3>

          {/* Description if available */}
          {category.description && (
            <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
              {category.description}
            </p>
          )}

          {/* CTA Link */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium',
              'text-neutral-600 transition-colors duration-200',
              'group-hover:text-accent-600'
            )}
          >
            View collection
            <svg
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isHovered && 'translate-x-0.5'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

export default CategoryCard;
