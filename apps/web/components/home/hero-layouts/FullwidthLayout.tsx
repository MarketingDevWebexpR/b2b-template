'use client';

import { memo, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LayoutProps } from './BackgroundLayout';

/**
 * Image skeleton placeholder component for loading state
 */
const ImageSkeleton = memo(function ImageSkeleton() {
  return (
    <div
      className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
});

ImageSkeleton.displayName = 'ImageSkeleton';

/**
 * FullwidthLayout Component
 *
 * Full-width immersive image with minimal centered text overlay.
 * Designed for maximum visual impact with minimal text distraction.
 *
 * Features:
 * - Full-width optimized image with loading states
 * - Subtle bottom gradient overlay for text readability
 * - Centered title + single CTA only (no description/subtitle)
 * - Clean, magazine-style presentation
 * - Respects prefers-reduced-motion for accessibility
 * - Fallback gradient when no image provided
 * - Accessible focus states on interactive elements
 *
 * @example
 * <FullwidthLayout
 *   slide={{
 *     title: "Collection Ete 2025",
 *     image: "/hero/summer.jpg",
 *     ctaLabel: "Decouvrir",
 *     ctaHref: "/collections/ete",
 *   }}
 *   isFirst={true}
 * />
 */
export const FullwidthLayout = memo(function FullwidthLayout({
  slide,
  isFirst = false,
}: LayoutProps) {
  const {
    title,
    badge,
    image,
    imageAlt,
    gradient = 'from-primary-700 via-primary-600 to-primary-500',
    textColor = '#ffffff',
    ctaLabel,
    ctaHref,
  } = slide;

  // Determine if text should be light or dark based on hex color
  const isLightText = textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === '#fff' || textColor === 'text-white';

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const hasImage = Boolean(image) && !imageError;

  // Animation variants respecting reduced motion
  const contentVariants = useMemo(() => ({
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : delay,
        duration: shouldReduceMotion ? 0.1 : 0.6,
        ease: 'easeOut' as const,
      },
    }),
  }), [shouldReduceMotion]);

  return (
    <div
      className={cn(
        'relative h-full overflow-hidden',
        !hasImage && `bg-gradient-to-r ${gradient}`
      )}
    >
      {/* Background Image with loading state */}
      {image && !imageError && (
        <div className="absolute inset-0">
          {!imageLoaded && <ImageSkeleton />}
          <Image
            src={image}
            alt={imageAlt || ''} // Decorative image - content is in text
            fill
            priority={isFirst}
            sizes="100vw"
            quality={85}
            unoptimized={process.env.NODE_ENV === 'development'}
            className={cn(
              'object-cover transition-opacity duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Fallback pattern when no image */}
      {!hasImage && (
        <div
          className="absolute inset-0 bg-[url('/patterns/diamond-pattern.svg')] bg-repeat opacity-10"
          aria-hidden="true"
        />
      )}

      {/* Subtle gradient overlay at bottom for text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        aria-hidden="true"
      />

      {/* Centered Content - Responsive padding */}
      <div className="relative h-full flex flex-col items-center justify-end pb-8 sm:pb-12 md:pb-16 lg:pb-20 px-4">
        <div className="text-center" style={{ color: textColor }}>
          {/* Badge - Optional, shown above title */}
          {badge && (
            <motion.span
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className={cn(
                'inline-block px-3 py-1 sm:px-4 sm:py-1.5 mb-3 sm:mb-4',
                'text-xs sm:text-sm font-semibold',
                'rounded-full'
              )}
              style={{
                backgroundColor: isLightText ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
                color: textColor,
              }}
            >
              {badge}
            </motion.span>
          )}

          {/* Title - Main focus, responsive sizes */}
          <motion.h2
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className={cn(
              'font-heading font-bold mb-4 sm:mb-6 lg:mb-8',
              // Mobile: 28px, Tablet: 36px, Desktop: 48px, Large: 56px
              'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
              'leading-tight',
              'max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto'
            )}
          >
            {title}
          </motion.h2>

          {/* Single CTA - Responsive sizes */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            custom={0.45}
          >
            <Link
              href={ctaHref}
              className={cn(
                'inline-flex items-center gap-2',
                'px-5 py-2.5 sm:px-6 sm:py-3',
                'rounded-full',
                'font-semibold',
                shouldReduceMotion ? '' : 'hover:scale-105',
                'transition-all duration-300',
                'shadow-lg hover:shadow-xl',
                'text-sm sm:text-base',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
              style={{
                backgroundColor: isLightText ? '#ffffff' : '#1a1a1a',
                color: isLightText ? '#1a1a1a' : '#ffffff',
              }}
            >
              {ctaLabel}
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

FullwidthLayout.displayName = 'FullwidthLayout';

export default FullwidthLayout;
