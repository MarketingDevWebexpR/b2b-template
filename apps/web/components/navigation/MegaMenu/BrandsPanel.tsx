'use client';

/**
 * BrandsPanel Component
 *
 * Dropdown panel for the "Marques" MegaMenu section.
 * Displays favorite brands and an A-Z alphabetical listing.
 *
 * Layout: 2-column design
 * - Left (~40%): Favorite brands grid (admin-curated via is_favorite flag)
 * - Right (~60%): Alphabetical list with letter navigation
 *
 * Features:
 * - Loading skeleton state
 * - Empty state handling
 * - Keyboard accessible navigation
 * - Smooth scroll to letter sections
 * - Framer Motion animations
 * - Responsive design
 * - Favorites are managed by admins in Medusa (read-only display)
 */

import {
  memo,
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { Building2, ArrowRight, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrands, getBrandInitials, getBrandColor } from './useBrands';
import type { BrandCardData } from '@/types/brand';

// ============================================================================
// Types
// ============================================================================

export interface BrandsPanelProps {
  /** Whether the panel is open */
  isOpen?: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Callback when a brand is clicked */
  onBrandClick?: (brand: BrandCardData) => void;
  /** Callback when mouse enters the panel */
  onMouseEnter?: () => void;
  /** Callback when mouse leaves the panel */
  onMouseLeave?: () => void;
  /** Additional CSS classes */
  className?: string;
}

interface BrandCardProps {
  brand: BrandCardData;
  variant?: 'grid' | 'list';
  size?: 'sm' | 'md' | 'lg';
  onSelect?: (brand: BrandCardData) => void;
  onClose?: () => void;
  className?: string;
}

interface FavoritesBrandsGridProps {
  brands: BrandCardData[];
  onBrandClick?: (brand: BrandCardData) => void;
  onClose: () => void;
  className?: string;
}

interface BrandsAlphabetNavProps {
  letters: string[];
  activeLetter: string | undefined;
  availableLetters: Set<string>;
  onLetterClick: (letter: string) => void;
  className?: string;
}

interface BrandsAlphabetListProps {
  brandsByLetter: Record<string, BrandCardData[]>;
  activeLetter?: string;
  onLetterSelect?: (letter: string) => void;
  onBrandClick?: (brand: BrandCardData) => void;
  onClose: () => void;
  className?: string;
}

interface BrandListItemProps {
  brand: BrandCardData;
  onBrandClick?: (brand: BrandCardData) => void;
  onClose: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

// ============================================================================
// Animation Variants
// ============================================================================

const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0, 0, 0.2, 1],
    },
  },
};

const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.15, delay: 0.05 },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get available letters from brands grouped by letter
 */
function getAvailableLetters(
  brandsByLetter: Record<string, BrandCardData[]>
): Set<string> {
  return new Set(
    Object.entries(brandsByLetter)
      .filter(([, brands]) => brands.length > 0)
      .map(([letter]) => letter)
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Brand Initials Display
 */
const BrandInitialsDisplay = memo(function BrandInitialsDisplay({
  name,
  size = 48,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = getBrandInitials(name);
  const color = getBrandColor(name);

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'rounded-full',
        'font-semibold uppercase',
        'select-none',
        'transition-all duration-200',
        className
      )}
      style={{
        backgroundColor: color.bg,
        color: color.text,
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
      role="img"
      aria-label={`Logo ${name}`}
    >
      {initials}
    </div>
  );
});

/**
 * Brand Card Component
 * Displays a brand with logo/initials, name, and product count
 */
const BrandCard = memo(function BrandCard({
  brand,
  variant = 'grid',
  size = 'md',
  onSelect,
  onClose,
  className,
}: BrandCardProps) {
  const sizeConfig = {
    sm: { card: 'p-2', logo: 32, name: 'text-xs', count: 'text-[10px]' },
    md: { card: 'p-3', logo: 48, name: 'text-sm', count: 'text-xs' },
    lg: { card: 'p-4', logo: 64, name: 'text-base font-medium', count: 'text-sm' },
  };

  const config = sizeConfig[size];

  const handleClick = useCallback(() => {
    onSelect?.(brand);
    onClose?.();
  }, [brand, onSelect, onClose]);

  // Grid variant: vertical card with centered content
  if (variant === 'grid') {
    return (
      <Link
        href={`/marques/${brand.slug}`}
        onClick={handleClick}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'bg-white rounded-xl',
          'border border-neutral-200',
          config.card,
          'hover:border-neutral-300 hover:shadow-sm',
          'hover:bg-neutral-50/50',
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-amber-500/30',
          'focus-visible:border-amber-500',
          'transition-all duration-150',
          'group',
          className
        )}
        aria-label={`${brand.name} - ${brand.product_count} produits`}
      >
        {/* Logo or Initials */}
        <div className="relative mb-2 group-hover:scale-105 transition-transform duration-200">
          {brand.logo_url ? (
            <div
              className="relative rounded-lg overflow-hidden bg-neutral-50"
              style={{ width: config.logo, height: config.logo }}
            >
              <Image
                src={brand.logo_url}
                alt={brand.name}
                fill
                className="object-contain p-1"
                sizes={`${config.logo}px`}
              />
            </div>
          ) : (
            <BrandInitialsDisplay name={brand.name} size={config.logo} />
          )}
        </div>

        {/* Brand name */}
        <span
          className={cn(
            'text-neutral-700 text-center',
            'group-hover:text-neutral-900',
            'transition-colors duration-150',
            'line-clamp-1',
            config.name
          )}
        >
          {brand.name}
        </span>

        {/* Product count */}
        <span
          className={cn(
            'text-neutral-400 mt-0.5',
            'group-hover:text-neutral-500',
            'transition-colors duration-150',
            config.count
          )}
        >
          {brand.product_count} produit{brand.product_count > 1 ? 's' : ''}
        </span>
      </Link>
    );
  }

  // List variant: horizontal row layout
  return (
    <Link
      href={`/marques/${brand.slug}`}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3',
        'py-2 px-3 -mx-3',
        'rounded-lg',
        'hover:bg-neutral-50',
        'focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-amber-500/30',
        'focus-visible:bg-neutral-50',
        'transition-all duration-150',
        'group',
        className
      )}
      aria-label={`${brand.name} - ${brand.product_count} produits`}
    >
      {/* Logo or Initials */}
      <div className="flex-shrink-0">
        {brand.logo_url ? (
          <div
            className="relative rounded-lg overflow-hidden bg-neutral-50"
            style={{ width: config.logo, height: config.logo }}
          >
            <Image
              src={brand.logo_url}
              alt={brand.name}
              fill
              className="object-contain p-0.5"
              sizes={`${config.logo}px`}
            />
          </div>
        ) : (
          <BrandInitialsDisplay
            name={brand.name}
            size={config.logo}
            className="rounded-lg"
          />
        )}
      </div>

      {/* Brand info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-neutral-700 truncate',
              'group-hover:text-neutral-900',
              'transition-colors duration-150',
              config.name
            )}
          >
            {brand.name}
          </span>
        </div>
        <span
          className={cn(
            'text-neutral-400 block',
            'group-hover:text-neutral-500',
            'transition-colors duration-150',
            config.count
          )}
        >
          {brand.product_count} produit{brand.product_count > 1 ? 's' : ''}
        </span>
      </div>

      {/* Chevron icon */}
      <ChevronRight
        className={cn(
          'w-4 h-4 text-neutral-300 flex-shrink-0',
          'group-hover:text-neutral-400 group-hover:translate-x-0.5',
          'transition-all duration-150'
        )}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </Link>
  );
});

/**
 * Favorites Brands Grid
 * Displays admin-curated favorite brands in a grid (read-only)
 */
const FavoritesBrandsGrid = memo(function FavoritesBrandsGrid({
  brands,
  onBrandClick,
  onClose,
  className,
}: FavoritesBrandsGridProps) {
  // Filter brands to only show favorites (set by admin in Medusa)
  const favoriteBrands = useMemo(() => {
    return brands.filter((brand) => brand.is_favorite === true);
  }, [brands]);

  if (favoriteBrands.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Section header */}
        <h3
          className={cn(
            'flex items-center gap-2',
            'text-xs font-semibold uppercase tracking-wider',
            'text-neutral-500'
          )}
        >
          <Heart className="w-4 h-4 text-red-500" aria-hidden="true" />
          <span>Marques Favorites</span>
        </h3>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Heart
            className="w-10 h-10 text-neutral-300 mb-3"
            strokeWidth={1}
          />
          <p className="text-neutral-500 text-sm font-medium mb-1">
            Aucune marque favorite
          </p>
          <p className="text-neutral-400 text-xs max-w-[200px]">
            Les marques favorites sont selectionnees par l&apos;administrateur
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Section header */}
      <h3
        className={cn(
          'flex items-center gap-2',
          'text-xs font-semibold uppercase tracking-wider',
          'text-neutral-500',
          'mb-3 flex-shrink-0'
        )}
      >
        <Heart className="w-4 h-4 text-red-500" aria-hidden="true" />
        <span>Marques Favorites</span>
        <span className="text-neutral-400 font-normal">
          ({favoriteBrands.length})
        </span>
      </h3>

      {/* Scrollable grid of favorite brands */}
      <div
        className={cn(
          'flex-1 overflow-y-auto',
          'scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent',
          'pr-2 -mr-2'
        )}
      >
        <div
          className={cn('grid grid-cols-2 gap-3', 'lg:grid-cols-3')}
          role="list"
          aria-label="Marques favorites"
        >
          {favoriteBrands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              variant="grid"
              size="md"
              onSelect={onBrandClick}
              onClose={onClose}
              className={cn(
                'h-full',
                'bg-gradient-to-b from-red-50/30 to-white',
                'border-red-200/40',
                'hover:border-red-300/60'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * Alphabet Navigation Bar
 * Horizontal pills for quick letter navigation
 */
const BrandsAlphabetNav = memo(function BrandsAlphabetNav({
  letters = ALPHABET,
  activeLetter,
  availableLetters,
  onLetterClick,
  className,
}: BrandsAlphabetNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll active letter into view
  useEffect(() => {
    if (activeButtonRef.current && navRef.current) {
      const nav = navRef.current;
      const button = activeButtonRef.current;
      const navRect = nav.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      if (buttonRect.left < navRect.left || buttonRect.right > navRect.right) {
        button.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeLetter]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, letter: string) => {
      const availableArray = Array.from(availableLetters);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = availableArray.indexOf(letter);
        const nextIndex = (currentIndex + 1) % availableArray.length;
        onLetterClick(availableArray[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIndex = availableArray.indexOf(letter);
        const prevIndex =
          currentIndex === 0 ? availableArray.length - 1 : currentIndex - 1;
        onLetterClick(availableArray[prevIndex]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        onLetterClick(availableArray[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        onLetterClick(availableArray[availableArray.length - 1]);
      }
    },
    [availableLetters, onLetterClick]
  );

  return (
    <nav
      ref={navRef}
      className={cn(
        'flex items-center gap-0.5',
        'overflow-x-auto',
        'scrollbar-none',
        '-mx-1 px-1',
        className
      )}
      role="navigation"
      aria-label="Navigation alphabetique"
    >
      {letters.map((letter) => {
        const isAvailable = availableLetters.has(letter);
        const isActive = letter === activeLetter;

        return (
          <button
            key={letter}
            ref={isActive ? activeButtonRef : undefined}
            type="button"
            onClick={() => isAvailable && onLetterClick(letter)}
            onKeyDown={(e) => handleKeyDown(e, letter)}
            disabled={!isAvailable}
            className={cn(
              'flex-shrink-0',
              'w-7 h-7',
              'flex items-center justify-center',
              'rounded-md',
              'text-xs font-medium',
              'transition-all duration-150',
              isAvailable &&
                !isActive && [
                  'text-neutral-600',
                  'hover:bg-neutral-100',
                  'hover:text-neutral-800',
                ],
              isActive && ['bg-amber-500 text-white', 'shadow-sm'],
              !isAvailable && ['text-neutral-300', 'cursor-not-allowed'],
              'focus:outline-none',
              'focus-visible:ring-2 focus-visible:ring-amber-500/30',
              isAvailable && 'focus-visible:bg-neutral-100'
            )}
            aria-current={isActive ? 'true' : undefined}
            aria-label={
              isAvailable
                ? `Aller a la lettre ${letter}`
                : `Lettre ${letter} - aucune marque`
            }
            tabIndex={!isAvailable ? -1 : undefined}
          >
            {letter}
          </button>
        );
      })}
    </nav>
  );
});

/**
 * Brand List Item
 * Compact list item for alphabetical list
 */
const BrandListItem = memo(function BrandListItem({
  brand,
  onBrandClick,
  onClose,
}: BrandListItemProps) {
  const handleClick = useCallback(() => {
    onBrandClick?.(brand);
    onClose();
  }, [brand, onBrandClick, onClose]);

  return (
    <Link
      href={`/marques/${brand.slug}`}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2.5',
        'py-1.5 px-2 -ml-2',
        'rounded-md',
        'hover:bg-neutral-50',
        'focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-amber-500/30',
        'focus-visible:bg-neutral-50',
        'transition-all duration-150',
        'group'
      )}
    >
      {/* Small logo/initials */}
      <div className="flex-shrink-0">
        {brand.logo_url ? (
          <div className="relative w-6 h-6 rounded overflow-hidden bg-neutral-50">
            <Image
              src={brand.logo_url}
              alt=""
              fill
              className="object-contain"
              sizes="24px"
            />
          </div>
        ) : (
          <BrandInitialsDisplay name={brand.name} size={24} />
        )}
      </div>

      {/* Brand name */}
      <span
        className={cn(
          'flex-1 text-sm text-neutral-700',
          'group-hover:text-neutral-900',
          'transition-colors duration-150',
          'truncate'
        )}
      >
        {brand.name}
      </span>

      {/* Product count */}
      <span className="text-xs text-neutral-400 flex-shrink-0">
        ({brand.product_count})
      </span>
    </Link>
  );
});

/**
 * Alphabetical Brands List
 * Scrollable list grouped by letter with sticky headers
 */
const BrandsAlphabetList = memo(function BrandsAlphabetList({
  brandsByLetter,
  activeLetter: controlledActiveLetter,
  onLetterSelect,
  onBrandClick,
  onClose,
  className,
}: BrandsAlphabetListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [internalActiveLetter, setInternalActiveLetter] = useState<
    string | undefined
  >();

  const activeLetter = controlledActiveLetter ?? internalActiveLetter;

  const availableLetters = useMemo(
    () => getAvailableLetters(brandsByLetter),
    [brandsByLetter]
  );

  const orderedAvailableLetters = useMemo(
    () => ALPHABET.filter((letter) => availableLetters.has(letter)),
    [availableLetters]
  );

  // Intersection observer for active letter detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let mostVisibleLetter: string | undefined;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleLetter =
              entry.target.getAttribute('data-letter') || undefined;
          }
        });

        if (mostVisibleLetter) {
          setInternalActiveLetter(mostVisibleLetter);
        }
      },
      {
        root: container,
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [brandsByLetter]);

  const handleLetterClick = useCallback(
    (letter: string) => {
      const sectionElement = sectionRefs.current.get(letter);
      if (sectionElement && containerRef.current) {
        sectionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
      onLetterSelect?.(letter);
    },
    [onLetterSelect]
  );

  const setSectionRef = useCallback(
    (letter: string, element: HTMLElement | null) => {
      if (element) {
        sectionRefs.current.set(letter, element);
      } else {
        sectionRefs.current.delete(letter);
      }
    },
    []
  );

  const totalBrands = useMemo(
    () =>
      Object.values(brandsByLetter).reduce(
        (sum, brands) => sum + brands.length,
        0
      ),
    [brandsByLetter]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            'text-neutral-500'
          )}
        >
          Toutes les marques A-Z
          <span className="ml-2 font-normal text-neutral-400">
            ({totalBrands})
          </span>
        </h3>
      </div>

      {/* Alphabet navigation */}
      <div className="mb-3 pb-3 border-b border-neutral-100">
        <BrandsAlphabetNav
          letters={ALPHABET}
          activeLetter={activeLetter}
          onLetterClick={handleLetterClick}
          availableLetters={availableLetters}
        />
      </div>

      {/* Scrollable brand list */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-y-auto',
          'scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent',
          'pr-2 -mr-2'
        )}
        role="list"
        aria-label="Liste des marques par lettre"
      >
        {orderedAvailableLetters.map((letter) => {
          const brands = brandsByLetter[letter];
          if (!brands || brands.length === 0) return null;

          return (
            <section
              key={letter}
              ref={(el) => setSectionRef(letter, el)}
              data-letter={letter}
              className="mb-4 last:mb-0"
              aria-labelledby={`letter-${letter}`}
            >
              {/* Letter header */}
              <h4
                id={`letter-${letter}`}
                className={cn(
                  'sticky top-0',
                  'py-1.5 mb-1',
                  'bg-white/95 backdrop-blur-sm',
                  'text-xs font-semibold',
                  'text-amber-600',
                  'border-b border-neutral-100',
                  'z-10'
                )}
              >
                {letter}
                <span className="ml-2 font-normal text-neutral-400">
                  ({brands.length})
                </span>
              </h4>

              {/* Brand list for this letter */}
              <div className="space-y-0.5">
                {brands.map((brand) => (
                  <BrandListItem
                    key={brand.id}
                    brand={brand}
                    onBrandClick={onBrandClick}
                    onClose={onClose}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {orderedAvailableLetters.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-neutral-400 text-sm">Aucune marque disponible</p>
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Loading Skeleton for BrandsPanel
 */
const BrandsPanelSkeleton = memo(function BrandsPanelSkeleton({
  className,
}: {
  className?: string;
}) {
  const shimmerClass = cn(
    'relative overflow-hidden',
    'bg-neutral-100',
    'before:absolute before:inset-0',
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
    'before:animate-[shimmer_1.5s_infinite]',
    'before:translate-x-[-100%]'
  );

  return (
    <div
      className={cn('animate-pulse', className)}
      aria-hidden="true"
      role="presentation"
    >
      <div className="flex gap-6 h-[400px]">
        {/* Left: Favorites grid skeleton */}
        <div className="w-[40%] flex-shrink-0">
          {/* Section title */}
          <div className={cn(shimmerClass, 'h-4 w-32 rounded mb-4')} />

          {/* Grid of cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(shimmerClass, 'aspect-square rounded-xl')}
              />
            ))}
          </div>
        </div>

        {/* Right: Alphabetical list skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Section title */}
          <div className={cn(shimmerClass, 'h-4 w-40 rounded mb-3')} />

          {/* Alphabet nav */}
          <div className="flex gap-1 mb-3 pb-3 border-b border-neutral-100">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className={cn(shimmerClass, 'w-7 h-7 rounded-md')} />
            ))}
          </div>

          {/* Brand list items */}
          <div className="space-y-3 flex-1">
            {/* Letter header */}
            <div className={cn(shimmerClass, 'h-4 w-8 rounded')} />

            {/* Brand rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(shimmerClass, 'w-6 h-6 rounded-full')} />
                <div className="flex-1">
                  <div className={cn(shimmerClass, 'h-4 w-24 rounded')} />
                </div>
                <div className={cn(shimmerClass, 'h-3 w-8 rounded')} />
              </div>
            ))}

            {/* Another letter header */}
            <div className={cn(shimmerClass, 'h-4 w-8 rounded mt-4')} />

            {/* More brand rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`b-${i}`} className="flex items-center gap-3">
                <div className={cn(shimmerClass, 'w-6 h-6 rounded-full')} />
                <div className="flex-1">
                  <div className={cn(shimmerClass, 'h-4 w-28 rounded')} />
                </div>
                <div className={cn(shimmerClass, 'h-3 w-8 rounded')} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * BrandsPanel - Main dropdown panel for Marques MegaMenu
 *
 * Displays a two-column layout:
 * - Left: Favorite brands grid (admin-curated via is_favorite flag)
 * - Right: A-Z alphabetical list with navigation
 *
 * @example
 * <BrandsPanel
 *   onClose={handleClose}
 *   onBrandClick={(brand) => console.log(brand)}
 * />
 */
export const BrandsPanel = memo(function BrandsPanel({
  isOpen,
  onClose,
  onBrandClick,
  onMouseEnter,
  onMouseLeave,
  className,
}: BrandsPanelProps) {
  const { brands, byLetter, isLoading, error, total } = useBrands();
  const [activeLetter, setActiveLetter] = useState<string | undefined>();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          'absolute left-0 right-0 top-full z-50',
          'bg-white',
          'border-b border-neutral-200',
          'shadow-lg shadow-neutral-900/10',
          className
        )}
      >
        <div className="container-ecom py-6">
        <BrandsPanelSkeleton />
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          'absolute left-0 right-0 top-full z-50',
          'bg-white',
          'border-b border-neutral-200',
          'shadow-lg shadow-neutral-900/10',
          className
        )}
      >
        <div className="container-ecom py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2
            className="w-12 h-12 text-neutral-300 mb-4"
            strokeWidth={1}
          />
          <p className="text-neutral-500 text-sm mb-4">
            Erreur lors du chargement des marques
          </p>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              'px-4 py-2',
              'text-sm font-medium text-amber-600',
              'bg-amber-50 hover:bg-amber-100',
              'rounded-lg',
              'transition-colors duration-150'
            )}
          >
            Reessayer
          </button>
        </div>
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (total === 0) {
    return (
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          'absolute left-0 right-0 top-full z-50',
          'bg-white',
          'border-b border-neutral-200',
          'shadow-lg shadow-neutral-900/10',
          className
        )}
      >
        <div className="container-ecom py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2
            className="w-12 h-12 text-neutral-300 mb-4"
            strokeWidth={1}
          />
          <p className="text-neutral-500 text-sm">Aucune marque disponible</p>
        </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'absolute left-0 right-0 top-full z-50',
        'bg-white',
        'border-b border-neutral-200',
        'shadow-lg shadow-neutral-900/10',
        'overflow-hidden',
        className
      )}
      role="region"
      aria-label="Panel des marques"
    >
      {/* Inner container for content alignment with nav */}
      <div className="container-ecom">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-neutral-200 bg-neutral-50/50">
        <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
          <Building2 className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
          <span>Marques</span>
          <span className="text-sm font-normal text-neutral-400">({total})</span>
        </h2>

        <Link
          href="/marques"
          onClick={onClose}
          className={cn(
            'group flex items-center gap-1.5',
            'text-sm font-medium text-amber-600',
            'hover:text-amber-700',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:underline'
          )}
        >
          <span>Voir toutes</span>
          <ArrowRight
            className={cn(
              'w-4 h-4',
              'transition-transform duration-150',
              'group-hover:translate-x-0.5'
            )}
            strokeWidth={1.5}
          />
        </Link>
      </div>

      {/* Content */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="flex py-6 h-[420px]"
      >
        {/* Left: Favorites (~40%) */}
        <div className="w-[40%] flex-shrink-0 pr-6 border-r border-neutral-100">
          <FavoritesBrandsGrid
            brands={brands}
            onBrandClick={onBrandClick}
            onClose={onClose}
          />
        </div>

        {/* Right: Alphabetical list (~60%) */}
        <div className="flex-1 pl-6">
          <BrandsAlphabetList
            brandsByLetter={byLetter}
            activeLetter={activeLetter}
            onLetterSelect={setActiveLetter}
            onBrandClick={onBrandClick}
            onClose={onClose}
          />
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
});

BrandsPanel.displayName = 'BrandsPanel';

// ============================================================================
// Exports
// ============================================================================

export {
  BrandCard,
  FavoritesBrandsGrid,
  BrandsAlphabetNav,
  BrandsAlphabetList,
  BrandListItem,
  BrandsPanelSkeleton,
};

export default BrandsPanel;
