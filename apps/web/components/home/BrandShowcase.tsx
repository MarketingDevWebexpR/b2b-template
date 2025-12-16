'use client';

/**
 * BrandShowcase Component
 *
 * Displays partner brand logos in a grid or carousel format.
 * Designed for B2B homepage to show trusted brand partnerships.
 *
 * Features:
 * - Responsive grid layout
 * - Optional auto-scroll carousel
 * - Brand logo placeholders with names
 * - Links to brand filter pages
 * - Grayscale to color hover effect
 *
 * Design: Professional B2B style, subtle and trustworthy
 */

import { memo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface Brand {
  /** Brand ID */
  id: string;
  /** Brand name */
  name: string;
  /** Brand logo URL (optional, will show placeholder if not provided) */
  logo?: string;
  /** Brand slug for filtering */
  slug: string;
}

export interface BrandShowcaseProps {
  /** Brands to display */
  brands?: Brand[];
  /** Section title */
  title?: string;
  /** Enable auto-scroll carousel */
  autoScroll?: boolean;
  /** Auto-scroll speed in ms */
  scrollSpeed?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockBrands: Brand[] = [
  { id: '1', name: 'Cartier', slug: 'cartier' },
  { id: '2', name: 'Pandora', slug: 'pandora' },
  { id: '3', name: 'Swarovski', slug: 'swarovski' },
  { id: '4', name: 'Mauboussin', slug: 'mauboussin' },
  { id: '5', name: 'Boucheron', slug: 'boucheron' },
  { id: '6', name: 'Chopard', slug: 'chopard' },
  { id: '7', name: 'Bulgari', slug: 'bulgari' },
  { id: '8', name: 'Van Cleef', slug: 'van-cleef' },
  { id: '9', name: 'Piaget', slug: 'piaget' },
  { id: '10', name: 'Tiffany', slug: 'tiffany' },
  { id: '11', name: 'Harry Winston', slug: 'harry-winston' },
  { id: '12', name: 'Graff', slug: 'graff' },
];

// ============================================================================
// Sub-components
// ============================================================================

interface BrandCardProps {
  brand: Brand;
  className?: string;
}

const BrandCard = memo(function BrandCard({ brand, className }: BrandCardProps) {
  return (
    <Link
      href={`/produits?marque=${brand.slug}`}
      className={cn(
        'group flex items-center justify-center',
        'p-6 lg:p-8',
        'bg-white rounded-lg',
        'border border-neutral-200 hover:border-neutral-300',
        'transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        className
      )}
      aria-label={`Voir les produits ${brand.name}`}
    >
      {brand.logo ? (
        <img
          src={brand.logo}
          alt={brand.name}
          className={cn(
            'max-h-10 lg:max-h-12 w-auto',
            'grayscale opacity-60',
            'group-hover:grayscale-0 group-hover:opacity-100',
            'transition-all duration-300'
          )}
        />
      ) : (
        // Placeholder when no logo is provided
        <div
          className={cn(
            'text-base font-semibold',
            'text-neutral-400 group-hover:text-neutral-700',
            'transition-colors duration-300'
          )}
        >
          {brand.name}
        </div>
      )}
    </Link>
  );
});

BrandCard.displayName = 'BrandCard';

// ============================================================================
// Auto-scroll Carousel
// ============================================================================

interface CarouselProps {
  brands: Brand[];
  scrollSpeed: number;
}

const BrandCarousel = memo(function BrandCarousel({ brands, scrollSpeed }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;

    const scroll = () => {
      if (!isPaused) {
        scrollPosition += 0.5;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

        // Reset to beginning when reaching the end
        if (scrollPosition >= maxScroll / 2) {
          scrollPosition = 0;
        }

        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused, scrollSpeed]);

  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...brands, ...brands];

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex gap-4 lg:gap-6',
        'overflow-x-hidden',
        'scroll-smooth'
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Carrousel de marques partenaires"
    >
      {duplicatedBrands.map((brand, index) => (
        <div
          key={`${brand.id}-${index}`}
          className="flex-shrink-0 w-40 lg:w-48"
        >
          <BrandCard brand={brand} />
        </div>
      ))}
    </div>
  );
});

BrandCarousel.displayName = 'BrandCarousel';

// ============================================================================
// Main Component
// ============================================================================

export const BrandShowcase = memo(function BrandShowcase({
  brands,
  title = 'Nos marques partenaires',
  autoScroll = false,
  scrollSpeed = 3000,
  className,
}: BrandShowcaseProps) {
  const displayBrands = brands && brands.length > 0 ? brands : mockBrands;

  return (
    <section
      className={cn(
        'py-12 lg:py-16',
        'bg-neutral-50',
        className
      )}
      aria-labelledby="brand-showcase-title"
    >
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              id="brand-showcase-title"
              className="text-2xl font-bold text-neutral-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Plus de 120 marques de confiance dans notre catalogue
            </p>
          </div>

          {/* View all link */}
          <Link
            href="/marques"
            className={cn(
              'hidden sm:flex items-center gap-2',
              'text-sm text-accent hover:text-orange-600',
              'font-medium',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded'
            )}
          >
            Toutes les marques
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Brand display */}
        {autoScroll ? (
          <BrandCarousel brands={displayBrands} scrollSpeed={scrollSpeed} />
        ) : (
          <div
            className={cn(
              'grid gap-4 lg:gap-6',
              'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
            )}
            role="list"
            aria-label="Liste des marques partenaires"
          >
            {displayBrands.slice(0, 12).map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        )}

        {/* Mobile view all link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/marques"
            className={cn(
              'inline-flex items-center gap-2',
              'px-6 py-3',
              'text-sm text-accent',
              'bg-white hover:bg-orange-50',
              'border border-neutral-200',
              'rounded-lg',
              'font-medium',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            )}
          >
            Voir toutes les marques
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
});

BrandShowcase.displayName = 'BrandShowcase';

export default BrandShowcase;
