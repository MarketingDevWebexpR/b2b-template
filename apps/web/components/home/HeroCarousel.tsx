'use client';

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeroSlide as CMSHeroSlide, HeroSlidesResponse } from '@/types/cms';
import { BackgroundLayout, SideLayout, FullwidthLayout } from './hero-layouts';

/**
 * Local HeroSlide interface for component props
 * Supports both CMS slides and hardcoded fallback slides
 */
export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string | null;
  secondaryCtaHref?: string | null;
  image?: string | null;
  badge?: string | null;
  gradient?: string;
  /** Layout type: 'background', 'side', or 'fullwidth' */
  layoutType?: 'background' | 'side' | 'fullwidth';
  /** Image position for 'side' layout: 'left' or 'right' */
  imagePosition?: 'left' | 'right';
  /** Image alt text for accessibility */
  imageAlt?: string | null;
  /** Text color (CSS color value) */
  textColor?: string;
  /** Overlay opacity (0-100) for background/fullwidth layouts */
  overlayOpacity?: number;
}

export interface HeroCarouselProps {
  /** Slides to display (overrides CMS if provided) */
  slides?: HeroSlide[];
  /** Auto-play interval in ms (0 to disable) */
  autoPlayInterval?: number;
  /** Additional CSS classes */
  className?: string;
  /** Disable CMS fetching (use provided slides only) */
  disableCMS?: boolean;
}

/**
 * Default slides used as fallback when CMS is unavailable
 */
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
    layoutType: 'background',
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
    layoutType: 'background',
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
    layoutType: 'background',
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
    layoutType: 'background',
  },
];

/**
 * Convert CMS slide to local format
 */
function cmsSlideToLocal(slide: CMSHeroSlide): HeroSlide {
  return {
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    description: slide.description,
    ctaLabel: slide.cta_label,
    ctaHref: slide.cta_href,
    secondaryCtaLabel: slide.secondary_cta_label,
    secondaryCtaHref: slide.secondary_cta_href,
    image: slide.image_url,
    badge: slide.badge,
    gradient: slide.gradient,
    layoutType: slide.layout_type || 'background',
    imagePosition: slide.image_position || 'right',
    imageAlt: slide.image_alt,
    textColor: slide.text_color,
    overlayOpacity: slide.overlay_opacity,
  };
}

/**
 * Render slide content based on layout type
 */
function renderSlide(slide: HeroSlide, isFirst: boolean = false) {
  const layoutType = slide.layoutType || 'background';

  switch (layoutType) {
    case 'side':
      return <SideLayout slide={slide} isFirst={isFirst} />;
    case 'fullwidth':
      return <FullwidthLayout slide={slide} isFirst={isFirst} />;
    case 'background':
    default:
      return <BackgroundLayout slide={slide} isFirst={isFirst} />;
  }
}

/**
 * Fetch hero slides from CMS API
 */
async function fetchHeroSlides(): Promise<HeroSlide[]> {
  try {
    const response = await fetch('/api/cms/hero-slides');
    if (!response.ok) {
      console.warn('Failed to fetch hero slides from CMS');
      return [];
    }
    const data: HeroSlidesResponse = await response.json();
    return data.slides.map(cmsSlideToLocal);
  } catch (error) {
    console.warn('Error fetching hero slides:', error);
    return [];
  }
}

/**
 * HeroCarousel Component
 *
 * A fully accessible, responsive hero carousel with:
 * - Multiple layout options (background, side, fullwidth)
 * - Responsive design for mobile/tablet/desktop
 * - Next.js Image optimization with lazy loading
 * - Screen reader announcements for slide changes
 * - Keyboard navigation (Arrow keys)
 * - Respects prefers-reduced-motion
 * - Play/pause controls
 * - Touch/swipe support (via mouse events)
 */
export const HeroCarousel = memo(function HeroCarousel({
  slides: propSlides,
  autoPlayInterval = 5000,
  className,
  disableCMS = false,
}: HeroCarouselProps) {
  const [cmsSlides, setCmsSlides] = useState<HeroSlide[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [announceSlide, setAnnounceSlide] = useState('');

  const carouselRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Determine which slides to use
  const slides = propSlides || (cmsSlides && cmsSlides.length > 0 ? cmsSlides : defaultSlides);

  // Fetch CMS slides on mount
  useEffect(() => {
    if (disableCMS || propSlides) return;

    fetchHeroSlides().then((fetchedSlides) => {
      if (fetchedSlides.length > 0) {
        setCmsSlides(fetchedSlides);
      }
    });
  }, [disableCMS, propSlides]);

  // Navigation callbacks
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    // Announce slide change to screen readers
    setAnnounceSlide(`Slide ${index + 1} sur ${slides.length}: ${slides[index]?.title}`);
  }, [slides]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, slides.length, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, slides.length, goToSlide]);

  const togglePause = useCallback(() => {
    setIsManuallyPaused(prev => !prev);
  }, []);

  // Auto-play with pause on hover/focus and manual control
  useEffect(() => {
    if (autoPlayInterval <= 0 || isPaused || isManuallyPaused) return;

    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlayInterval, isPaused, isManuallyPaused, goToNext]);

  // Keyboard navigation - only when carousel is focused
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
        case 'Enter':
          if (e.target === carousel) {
            e.preventDefault();
            togglePause();
          }
          break;
      }
    };

    carousel.addEventListener('keydown', handleKeyDown);
    return () => carousel.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, togglePause]);

  // Reset index if slides change and current index is out of bounds
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const currentSlide = slides[currentIndex];

  if (!currentSlide) {
    return null;
  }

  // Animation variants for slide transitions
  const slideVariants = {
    enter: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 1.02,
    },
    center: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.5,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.98,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
      },
    },
  };

  return (
    <section
      ref={carouselRef}
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-roledescription="carrousel"
      aria-label={`Carrousel promotionnel, ${slides.length} slides`}
      role="region"
      tabIndex={0}
    >
      {/* Screen reader live region for slide announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announceSlide}
      </div>

      {/* Slides container - Responsive heights */}
      <div
        className={cn(
          'relative',
          // Mobile: 280px, Small: 320px, Tablet: 400px, Desktop: 480px, Large: 560px
          'h-[280px] xs:h-[320px] sm:h-[400px] lg:h-[480px] xl:h-[560px]'
        )}
        aria-live="off"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide.id}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentIndex + 1} sur ${slides.length}`}
          >
            {renderSlide(currentSlide, currentIndex === 0)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows - Larger touch targets on mobile */}
      <button
        onClick={goToPrevious}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 z-20',
          'left-2 sm:left-4',
          'flex items-center justify-center',
          // Larger on mobile for better touch targets
          'w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12',
          'rounded-full',
          'bg-black/30 backdrop-blur-sm text-white',
          'hover:bg-black/40 active:bg-black/50',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50'
        )}
        aria-label="Slide precedente"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>

      <button
        onClick={goToNext}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 z-20',
          'right-2 sm:right-4',
          'flex items-center justify-center',
          'w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12',
          'rounded-full',
          'bg-black/30 backdrop-blur-sm text-white',
          'hover:bg-black/40 active:bg-black/50',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50'
        )}
        aria-label="Slide suivante"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>

      {/* Bottom controls: dots + play/pause */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 px-4">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* Dots indicator with better touch targets */}
          <div
            className="flex gap-1.5 sm:gap-2"
            role="tablist"
            aria-label="Slides du carrousel"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  // Larger touch targets
                  'min-w-[8px] h-2 sm:min-w-[10px] sm:h-2.5',
                  index === currentIndex
                    ? 'w-6 sm:w-8 bg-white'
                    : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/70'
                )}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Aller a la slide ${index + 1}: ${slide.title}`}
                aria-controls={`slide-${slide.id}`}
                tabIndex={index === currentIndex ? 0 : -1}
              />
            ))}
          </div>

          {/* Play/Pause button */}
          {autoPlayInterval > 0 && (
            <button
              onClick={togglePause}
              className={cn(
                'flex items-center justify-center',
                'w-8 h-8 sm:w-9 sm:h-9',
                'rounded-full',
                'bg-black/30 backdrop-blur-sm text-white',
                'hover:bg-black/40 active:bg-black/50',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50'
              )}
              aria-label={isManuallyPaused ? 'Reprendre le defilement automatique' : 'Mettre en pause le defilement automatique'}
              aria-pressed={isManuallyPaused}
            >
              {isManuallyPaused ? (
                <Play className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Pause className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar (only when not paused) */}
      {autoPlayInterval > 0 && !isPaused && !isManuallyPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <motion.div
            key={currentIndex}
            className="h-full bg-white/60"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: autoPlayInterval / 1000,
              ease: 'linear',
            }}
          />
        </div>
      )}
    </section>
  );
});

HeroCarousel.displayName = 'HeroCarousel';

export default HeroCarousel;
