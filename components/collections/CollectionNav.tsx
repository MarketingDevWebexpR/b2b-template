'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Collection type for navigation
 */
export interface CollectionNavItem {
  id: string;
  name: string;
  slug: string;
}

interface CollectionNavProps {
  /** Array of collections to display in navigation */
  collections: CollectionNavItem[];
  /** Currently active collection slug */
  currentSlug: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animation variants
 */
const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * CollectionNav - Horizontal scrollable navigation between collections
 *
 * Features:
 * - Horizontal scrollable bar on mobile
 * - Active collection highlighted with hermes-500 border
 * - Smooth scroll animation on click
 * - Elegant minimalist design matching Hermes style
 * - Auto-scrolls to show active item on mount
 * - Keyboard accessible navigation
 */
export function CollectionNav({
  collections,
  currentSlug,
  className,
}: CollectionNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);

  /**
   * Scroll to center the active item in the viewport
   */
  const scrollToActive = useCallback(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeItem = activeItemRef.current;

      const containerWidth = container.offsetWidth;
      const itemLeft = activeItem.offsetLeft;
      const itemWidth = activeItem.offsetWidth;

      // Calculate scroll position to center the active item
      const scrollPosition = itemLeft - containerWidth / 2 + itemWidth / 2;

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
    }
  }, []);

  // Scroll to active item on mount and when currentSlug changes
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(scrollToActive, 100);
    return () => clearTimeout(timeoutId);
  }, [currentSlug, scrollToActive]);

  if (collections.length === 0) {
    return null;
  }

  return (
    <motion.nav
      className={cn(
        'relative border-b border-border-light bg-background-cream',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="navigation"
      aria-label="Navigation des collections"
    >
      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <motion.div
          className="mx-auto flex min-w-max items-center justify-start gap-1 px-4 py-3 sm:justify-center sm:gap-2 sm:px-6 lg:px-8"
          variants={containerVariants}
        >
          {collections.map((collection) => {
            const isActive = collection.slug === currentSlug;

            return (
              <motion.div key={collection.id} variants={itemVariants}>
                <Link
                  ref={isActive ? activeItemRef : null}
                  href={`/collections/${collection.slug}`}
                  className={cn(
                    'group relative inline-flex items-center whitespace-nowrap px-4 py-2 font-sans text-caption uppercase tracking-luxe transition-all duration-350',
                    'border-b-2 hover:text-hermes-500',
                    isActive
                      ? 'border-hermes-500 text-hermes-600'
                      : 'border-transparent text-text-muted hover:border-hermes-300'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="relative">
                    {collection.name}
                    {/* Subtle underline effect on hover for non-active items */}
                    {!isActive && (
                      <span className="absolute bottom-0 left-0 h-px w-0 bg-hermes-500 transition-all duration-350 group-hover:w-full" />
                    )}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Fade edges for scroll indication on mobile */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background-cream to-transparent sm:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background-cream to-transparent sm:hidden" />
    </motion.nav>
  );
}

/**
 * CollectionNavSkeleton - Loading state for CollectionNav
 */
export function CollectionNavSkeleton() {
  return (
    <nav className="border-b border-border-light bg-background-cream">
      <div className="mx-auto flex items-center justify-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-20 animate-pulse rounded bg-background-sable sm:w-24"
          />
        ))}
      </div>
    </nav>
  );
}

export default CollectionNav;
