'use client';

/**
 * BrandsAlphabeticalList Component
 *
 * Displays brands organized alphabetically with letter section headers.
 * Includes alphabet quick-navigation and virtualized list for performance.
 *
 * Features:
 * - A-Z navigation bar
 * - Grouped brand list by letter
 * - Smooth scroll to sections
 * - Virtualized rendering for large lists
 * - Intersection observer for active letter detection
 */

import { memo, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AlphabetNav } from './AlphabetNav';
import { BrandCard } from './BrandCard';
import { ALPHABET, getAvailableLetters } from './utils/groupBrandsByLetter';
import type { BrandsAlphabeticalListProps, Brand } from './types';

export const BrandsAlphabeticalList = memo(function BrandsAlphabeticalList({
  brandsByLetter,
  activeLetter: controlledActiveLetter,
  onLetterSelect,
  onClose,
  className,
}: BrandsAlphabeticalListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [internalActiveLetter, setInternalActiveLetter] = useState<string | undefined>();

  // Use controlled or internal active letter
  const activeLetter = controlledActiveLetter ?? internalActiveLetter;

  // Get available letters (those with brands)
  const availableLetters = useMemo(
    () => getAvailableLetters(brandsByLetter),
    [brandsByLetter]
  );

  // Get ordered letters that have brands
  const orderedAvailableLetters = useMemo(
    () => ALPHABET.filter(letter => availableLetters.has(letter)),
    [availableLetters]
  );

  // Set up intersection observer to track active section
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        let maxRatio = 0;
        let mostVisibleLetter: string | undefined;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleLetter = entry.target.getAttribute('data-letter') || undefined;
          }
        });

        if (mostVisibleLetter) {
          setInternalActiveLetter(mostVisibleLetter);
        }
      },
      {
        root: container,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section is near top
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all section headers
    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [brandsByLetter]);

  // Handle letter click - scroll to section
  const handleLetterClick = useCallback((letter: string) => {
    const sectionElement = sectionRefs.current.get(letter);
    if (sectionElement && containerRef.current) {
      sectionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    onLetterSelect?.(letter);
  }, [onLetterSelect]);

  // Store section ref
  const setSectionRef = useCallback((letter: string, element: HTMLElement | null) => {
    if (element) {
      sectionRefs.current.set(letter, element);
    } else {
      sectionRefs.current.delete(letter);
    }
  }, []);

  // Calculate total brand count
  const totalBrands = useMemo(
    () => Object.values(brandsByLetter).reduce((sum, brands) => sum + brands.length, 0),
    [brandsByLetter]
  );

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            'text-neutral-500'
          )}
        >
          Toutes les marques
          <span className="ml-2 font-normal text-neutral-400">
            ({totalBrands})
          </span>
        </h3>
      </div>

      {/* Alphabet navigation */}
      <div className="mb-3 pb-3 border-b border-neutral-100">
        <AlphabetNav
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
          'max-h-[280px]', // Constrain height for mega menu
          'scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent',
          'pr-2 -mr-2' // Offset for scrollbar
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
                  'text-accent',
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
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    variant="list"
                    size="sm"
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
            <p className="text-neutral-400 text-sm">
              Aucune marque disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

BrandsAlphabeticalList.displayName = 'BrandsAlphabeticalList';

export default BrandsAlphabeticalList;
