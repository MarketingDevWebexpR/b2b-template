'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  image: string;
  badge?: string;
  gradient?: string;
}

export interface HeroCarouselProps {
  /** Slides to display */
  slides?: HeroSlide[];
  /** Auto-play interval in ms (0 to disable) */
  autoPlayInterval?: number;
  /** Additional CSS classes */
  className?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: 'spring-collection',
    title: 'Collection Printemps 2025',
    subtitle: 'Nouveautes',
    description: 'Decouvrez notre selection exclusive de bijoux pour la nouvelle saison',
    ctaLabel: 'Decouvrir les nouveautes',
    ctaHref: '/categories?sort=newest',
    image: '/hero/spring-collection.jpg',
    badge: 'Nouveau',
    gradient: 'from-primary-700 via-primary-600 to-primary-500',
  },
  {
    id: 'promo-pro',
    title: '-20% sur les commandes pro',
    subtitle: 'Offre limitee',
    description: 'Profitez de remises exceptionnelles sur tout le catalogue avec le code PRO20',
    ctaLabel: 'En profiter',
    ctaHref: '/promotions',
    secondaryCtaLabel: 'Voir les conditions',
    secondaryCtaHref: '/promotions/conditions',
    image: '/hero/promo-pro.jpg',
    badge: 'Promo',
    gradient: 'from-accent-700 via-accent-600 to-accent-500',
  },
  {
    id: 'diamonds',
    title: 'Diamants certifies',
    subtitle: 'Selection Premium',
    description: 'Une selection de diamants certifies GIA pour vos creations les plus prestigieuses',
    ctaLabel: 'Explorer',
    ctaHref: '/categories/pierres/diamants',
    image: '/hero/diamonds.jpg',
    badge: 'Premium',
    gradient: 'from-gold-700 via-gold-600 to-accent',
  },
  {
    id: 'express-delivery',
    title: 'Livraison express 24h',
    subtitle: 'Service Pro',
    description: 'Recevez vos commandes en 24h sur toute la France metropolitaine',
    ctaLabel: 'En savoir plus',
    ctaHref: '/services/livraison-express',
    image: '/hero/express-delivery.jpg',
    gradient: 'from-success-700 via-success-600 to-success-500',
  },
];

export const HeroCarousel = memo(function HeroCarousel({
  slides = defaultSlides,
  autoPlayInterval = 5000,
  className,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Auto-play
  useEffect(() => {
    if (autoPlayInterval <= 0 || isPaused) return;

    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlayInterval, isPaused, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  const currentSlide = slides[currentIndex];

  return (
    <section
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Carousel promotionnel"
      role="region"
    >
      {/* Slides */}
      <div className="relative h-[320px] sm:h-[400px] lg:h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
              'absolute inset-0 bg-gradient-to-r',
              currentSlide.gradient || 'from-primary-700 to-primary-500'
            )}
          >
            <div className="container-ecom h-full flex items-center">
              <div className="max-w-xl text-white">
                {/* Badge */}
                {currentSlide.badge && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-3 py-1 mb-4 text-badge font-semibold bg-white/20 backdrop-blur-sm rounded-full"
                  >
                    {currentSlide.badge}
                  </motion.span>
                )}

                {/* Subtitle */}
                {currentSlide.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-overline uppercase tracking-wider opacity-80 mb-2"
                  >
                    {currentSlide.subtitle}
                  </motion.p>
                )}

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-hero-sm sm:text-hero lg:text-hero-xl font-heading mb-4"
                >
                  {currentSlide.title}
                </motion.h2>

                {/* Description */}
                {currentSlide.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-body-lg opacity-90 mb-6 max-w-md"
                  >
                    {currentSlide.description}
                  </motion.p>
                )}

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link
                    href={currentSlide.ctaHref}
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
                      'bg-white text-primary font-semibold',
                      'hover:bg-white/90 transition-colors duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
                    )}
                  >
                    {currentSlide.ctaLabel}
                  </Link>

                  {currentSlide.secondaryCtaLabel && currentSlide.secondaryCtaHref && (
                    <Link
                      href={currentSlide.secondaryCtaHref}
                      className={cn(
                        'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
                        'bg-white/10 text-white font-medium border border-white/30',
                        'hover:bg-white/20 transition-colors duration-200',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
                      )}
                    >
                      {currentSlide.secondaryCtaLabel}
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 z-10',
          'flex items-center justify-center w-10 h-10 rounded-full',
          'bg-white/20 backdrop-blur-sm text-white',
          'hover:bg-white/30 transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
        )}
        aria-label="Slide precedente"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 z-10',
          'flex items-center justify-center w-10 h-10 rounded-full',
          'bg-white/20 backdrop-blur-sm text-white',
          'hover:bg-white/30 transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
        )}
        aria-label="Slide suivante"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'w-8 bg-white'
                : 'bg-white/50 hover:bg-white/70'
            )}
            aria-label={`Aller a la slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  );
});

HeroCarousel.displayName = 'HeroCarousel';

export default HeroCarousel;
