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
      className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200"
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
});

ImageSkeleton.displayName = 'ImageSkeleton';

/**
 * SideLayout Component
 *
 * Split layout with image on one side and text on the other.
 * Desktop: 50/50 split | Mobile: Stacked (image on top)
 *
 * Features:
 * - Configurable image position (left or right)
 * - No overlay needed - clean separation of content
 * - Responsive stacking on mobile
 * - Optimized Next.js Image component with loading states
 * - Respects prefers-reduced-motion for accessibility
 * - Fallback gradient placeholder when no image
 * - Accessible focus states on interactive elements
 *
 * @example
 * <SideLayout
 *   slide={{
 *     title: "Nouvelle Collection",
 *     description: "Decouvrez nos dernieres creations",
 *     image: "/hero/collection.jpg",
 *     ctaLabel: "Explorer",
 *     ctaHref: "/collections",
 *     imagePosition: "right",
 *   }}
 *   isFirst={true}
 * />
 */
export const SideLayout = memo(function SideLayout({
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
    gradient = 'from-neutral-100 to-neutral-50',
    textColor = '#1a1a1a',
    ctaLabel,
    ctaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
    imagePosition = 'right',
  } = slide;

  // Determine if text should be light or dark based on hex color
  const isLightText = textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === '#fff' || textColor === 'text-white';

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const hasImage = Boolean(image) && !imageError;
  const isImageLeft = imagePosition === 'left';

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

  const imageVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.6,
        ease: 'easeOut' as const,
      },
    },
  }), [shouldReduceMotion]);

  return (
    <div className="relative h-full overflow-hidden">
      <div
        className={cn(
          'h-full flex flex-col lg:flex-row',
          isImageLeft && 'lg:flex-row-reverse'
        )}
      >
        {/* Text Content Side */}
        <div
          className={cn(
            'flex-1 flex items-center',
            'order-2 lg:order-none',
            'h-1/2 lg:h-full',
            `bg-gradient-to-br ${gradient}`
          )}
        >
          <div className="container-ecom lg:max-w-none px-4 sm:px-6 lg:px-12 xl:px-16 py-4 sm:py-6 lg:py-0">
            <div className="max-w-lg" style={{ color: textColor }}>
              {/* Badge */}
              {badge && (
                <motion.span
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.2}
                  className={cn(
                    'inline-block px-3 py-1 mb-2 sm:mb-3',
                    'text-xs sm:text-sm font-semibold',
                    'bg-accent/10 text-accent rounded-full'
                  )}
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
                    'text-neutral-500 mb-1 sm:mb-2'
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
                  'font-heading font-bold mb-2 sm:mb-3 lg:mb-4',
                  // Mobile: 20px, Tablet: 28px, Desktop: 36px, Large: 44px
                  'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
                  'leading-tight'
                )}
              >
                {title}
              </motion.h2>

              {/* Description - Hidden on mobile for space */}
              {description && (
                <motion.p
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.4}
                  className={cn(
                    'hidden sm:block',
                    'text-sm lg:text-base text-neutral-600',
                    'mb-3 lg:mb-6 max-w-md'
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
                    'transition-colors duration-200',
                    'shadow-md hover:shadow-lg',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'text-sm whitespace-nowrap'
                  )}
                  style={{
                    backgroundColor: isLightText ? '#ffffff' : '#f67828',
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
                      'bg-transparent font-medium',
                      'border',
                      isLightText
                        ? 'border-white/30 hover:bg-white/10 active:bg-white/20'
                        : 'border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200',
                      'transition-colors duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
                      'text-sm whitespace-nowrap'
                    )}
                    style={{ color: textColor }}
                  >
                    {secondaryCtaLabel}
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Image Side */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            'flex-1 relative',
            'order-1 lg:order-none',
            'h-1/2 lg:h-full'
          )}
        >
          {image && !imageError ? (
            <>
              {!imageLoaded && <ImageSkeleton />}
              <Image
                src={image}
                alt={imageAlt || ''} // Decorative image - content is in text
                fill
                priority={isFirst}
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
                unoptimized={process.env.NODE_ENV === 'development'}
                className={cn(
                  'object-cover transition-opacity duration-500',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            /* Fallback placeholder */
            <div
              className={cn(
                'absolute inset-0',
                'bg-gradient-to-br from-neutral-200 to-neutral-300',
                'flex items-center justify-center'
              )}
              aria-hidden="true"
            >
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
});

SideLayout.displayName = 'SideLayout';

export default SideLayout;
