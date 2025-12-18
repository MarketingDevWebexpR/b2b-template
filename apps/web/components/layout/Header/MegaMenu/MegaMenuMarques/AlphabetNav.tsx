'use client';

/**
 * AlphabetNav Component
 *
 * A horizontal navigation bar for quick-jumping to alphabet sections.
 * Shows all letters with visual indication of which have brands.
 *
 * Features:
 * - Horizontal scroll on mobile
 * - Active letter highlighting
 * - Disabled state for empty letters
 * - Keyboard navigation
 * - Smooth scroll to sections
 */

import { memo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ALPHABET } from './utils/groupBrandsByLetter';
import type { AlphabetNavProps } from './types';

export const AlphabetNav = memo(function AlphabetNav({
  letters = ALPHABET,
  activeLetter,
  onLetterClick,
  availableLetters,
  className,
}: AlphabetNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll active letter into view
  useEffect(() => {
    if (activeButtonRef.current && navRef.current) {
      const nav = navRef.current;
      const button = activeButtonRef.current;
      const navRect = nav.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Check if button is outside visible area
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
    (e: React.KeyboardEvent, letter: string, index: number) => {
      const availableArray = Array.from(availableLetters);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        // Find next available letter
        const currentIndex = availableArray.indexOf(letter);
        const nextIndex = (currentIndex + 1) % availableArray.length;
        onLetterClick(availableArray[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Find previous available letter
        const currentIndex = availableArray.indexOf(letter);
        const prevIndex = currentIndex === 0 ? availableArray.length - 1 : currentIndex - 1;
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
        'scrollbar-none', // Hide scrollbar
        '-mx-1 px-1', // Padding for focus ring visibility
        className
      )}
      role="navigation"
      aria-label="Navigation alphabetique"
    >
      {letters.map((letter, index) => {
        const isAvailable = availableLetters.has(letter);
        const isActive = letter === activeLetter;

        return (
          <button
            key={letter}
            ref={isActive ? activeButtonRef : undefined}
            type="button"
            onClick={() => isAvailable && onLetterClick(letter)}
            onKeyDown={(e) => handleKeyDown(e, letter, index)}
            disabled={!isAvailable}
            className={cn(
              // Base styles
              'flex-shrink-0',
              'w-7 h-7',
              'flex items-center justify-center',
              'rounded-md',
              'text-xs font-medium',
              // Transition
              'transition-all duration-150',
              // Available state
              isAvailable && !isActive && [
                'text-neutral-600',
                'hover:bg-neutral-100',
                'hover:text-neutral-800',
              ],
              // Active state
              isActive && [
                'bg-accent text-white',
                'shadow-sm',
              ],
              // Disabled state
              !isAvailable && [
                'text-neutral-300',
                'cursor-not-allowed',
              ],
              // Focus styles
              'focus:outline-none',
              'focus-visible:ring-2 focus-visible:ring-accent/30',
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

AlphabetNav.displayName = 'AlphabetNav';

export default AlphabetNav;
