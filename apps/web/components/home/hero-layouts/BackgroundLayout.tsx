'use client';

import { memo, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
 * Shared interface for hero slide layout props
 */
export interface LayoutProps {
  slide: {
    title: string;
    subtitle?: string | null;
    description?: string | null;
    badge?: string | null;
    image?: string | null;
    imageAlt?: string | null;
    /** CSS gradient classes (e.g., "from-primary-700 via-primary-600 to-primary-500") */
    gradient?: string;
    /** Text color in hex format (e.g., "#ffffff") */
    textColor?: string;
    /** Overlay opacity (0-100) */
    overlayOpacity?: number;
    ctaLabel: string;
    ctaHref: string;
    secondaryCtaLabel?: string | null;
    secondaryCtaHref?: string | null;
    imagePosition?: 'left' | 'right';
  };
  /** Whether this is the first/active slide (for priority image loading) */
  isFirst?: boolean;
}


/**
 * BackgroundLayout Component
 *
 * Full-bleed background image with gradient overlay and left-aligned text.
 * Ideal for immersive, hero-style presentations.
 *
 * Features:
 * - Next.js Image with fill + object-cover for optimized loading
 * - Configurable gradient overlay opacity
 * - Responsive heights and text sizes for mobile/tablet/desktop
 * - Left-aligned text content with staggered animations
 * - Respects prefers-reduced-motion for accessibility
 * - Image loading state with skeleton placeholder
 * - Fallback gradient when no image provided
 * - Accessible focus states on interactive elements
 *
 * @example
 * <BackgroundLayout
 *   slide={{
 *     title: "Collection Printemps 2025",
 *     subtitle: "Nouveautes",
 *     description: "Decouvrez notre selection exclusive",
 *     image: "/hero/spring.jpg",
 *     ctaLabel: "Decouvrir",
 *     ctaHref: "/collections/printemps",
 *     overlayOpacity: 0.6,
 *   }}
 * />
 */
export const BackgroundLayout = memo(function BackgroundLayout({
  slide,
  isFirst = false,
}: LayoutProps) {
  const {
    title,
    subtitle,
    description,
    badge,
    image,
    imageAlt,
    gradient = 'from-primary-700 via-primary-600 to-primary-500',
    textColor = '#ffffff',
    overlayOpacity = 0.5,
    ctaLabel,
    ctaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
  } = slide;

  // Determine if text should be light or dark based on hex color
  const isLightText = textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === '#fff' || textColor === 'text-white';

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const hasImage = Boolean(image) && !imageError;

  // Animation variants respecting reduced motion
  const contentVariants = useMemo(() => ({
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : delay,
        duration: shouldReduceMotion ? 0.1 : 0.5,
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
          {/* Gradient Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r',
              gradient
            )}
            style={{ opacity: overlayOpacity }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Fallback placeholder when no image */}
      {!hasImage && (
        <div
          className="absolute inset-0 bg-[url('/patterns/diamond-pattern.svg')] bg-repeat opacity-10"
          aria-hidden="true"
        />
      )}

      {/* Content - Responsive padding */}
      <div className="relative h-full container-ecom flex items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl lg:max-w-2xl" style={{ color: textColor }}>
          {/* Badge */}
          {badge && (
            <motion.span
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className={cn(
                'inline-block px-3 py-1 mb-3 sm:mb-4',
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

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0.25}
              className={cn(
                'text-xs sm:text-sm uppercase tracking-wider',
                'mb-1 sm:mb-2'
              )}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Title - Responsive font sizes */}
          <motion.h2
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className={cn(
              'font-heading font-bold mb-3 sm:mb-4',
              // Mobile: 24px, Tablet: 32px, Desktop: 40px, Large: 48px
              'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
              'leading-tight'
            )}
          >
            {title}
          </motion.h2>

          {/* Description - Hidden on very small screens for better mobile UX */}
          {description && (
            <motion.p
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0.4}
              className={cn(
                'mb-4 sm:mb-6',
                'text-sm sm:text-base lg:text-lg',
                'max-w-md',
                'hidden xs:block' // Hide on very small screens (< 475px)
              )}
            >
              {description}
            </motion.p>
          )}

          {/* CTAs - Always inline */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="flex flex-row gap-3 items-center"
          >
            <Link
              href={ctaHref}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg',
                'font-semibold',
                'transition-all duration-200',
                'text-sm whitespace-nowrap',
                'shadow-md hover:shadow-lg',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
              style={{
                backgroundColor: isLightText ? '#ffffff' : '#1a1a1a',
                color: isLightText ? '#1a1a1a' : '#ffffff',
              }}
            >
              {ctaLabel}
            </Link>

            {secondaryCtaLabel && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className={cn(
                  'inline-flex items-center justify-center gap-2',
                  'px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg',
                  'font-medium',
                  'transition-all duration-200',
                  'text-sm whitespace-nowrap',
                  'border-2',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                )}
                style={{
                  color: textColor,
                  borderColor: isLightText ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
                  backgroundColor: isLightText ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                }}
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
});

BackgroundLayout.displayName = 'BackgroundLayout';

export default BackgroundLayout;
