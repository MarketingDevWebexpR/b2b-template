'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { MobileMenu } from './MobileMenu';
import { useAnnouncement } from '@/contexts/AnnouncementContext';
import { SearchOverlay } from '@/components/search';
import { useSearch } from '@/hooks';
import { CartIndicator } from '@/components/cart';

interface HeaderProps {
  className?: string;
}

// Height of announcement bar in pixels
const ANNOUNCEMENT_BAR_HEIGHT = 40;

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();
  const { isVisible: isAnnouncementVisible } = useAnnouncement();
  const { isSearchOpen, openSearch, closeSearch } = useSearch();

  // Track scroll position for shadow and hide/show
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Add shadow after scrolling 20px
    setIsScrolled(latest > 20);

    // Hide header when scrolling down, show when scrolling up
    if (latest > 100) {
      setIsVisible(latest < previous);
    } else {
      setIsVisible(true);
    }
  });

  // Initial check on mount
  useEffect(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);


  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ top: isAnnouncementVisible ? ANNOUNCEMENT_BAR_HEIGHT : 0 }}
      className={cn(
        'fixed left-0 right-0 z-50',
        'bg-luxe-cream/95 backdrop-blur-sm',
        'transition-all duration-300 ease-luxe',
        isScrolled && 'shadow-elegant',
        className
      )}
    >
      {/* Center section - Logo (absolutely centered on page) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute inset-x-0 top-0 h-16 md:h-20 lg:h-24 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="pointer-events-auto">
          <Logo size="md" variant="dark" />
        </div>
      </motion.div>

      {/* Main header container */}
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-20 lg:h-24">

          {/* Left section - Navigation (Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:flex flex-1"
          >
            <Navigation />
          </motion.div>

          {/* Spacer for mobile to push icons right */}
          <div className="flex-1 lg:hidden" />

          {/* Right section - Icons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center gap-1 md:gap-4 flex-1 justify-end"
          >
            {/* Contact Link */}
            <Link
              href="/contact"
              className={cn(
                'hidden md:flex items-center',
                'text-xs uppercase tracking-luxe',
                'text-text-secondary hover:text-text-primary',
                'transition-colors duration-300 ease-luxe',
                'focus:outline-none focus-visible:ring-1 focus-visible:ring-luxe-charcoal/20'
              )}
            >
              Contact
            </Link>

            {/* Search Button */}
            <button
              onClick={openSearch}
              className={cn(
                'hidden md:flex items-center justify-center',
                'w-10 h-10 rounded-full',
                'text-text-secondary hover:text-text-primary',
                'hover:bg-background-warm',
                'transition-all duration-300 ease-luxe',
                'focus:outline-none focus-visible:ring-1 focus-visible:ring-luxe-charcoal/20',
                'group'
              )}
              aria-label="Rechercher (Cmd+K)"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
            >
              <Search
                className="w-[17px] h-[17px] transition-transform duration-300 group-hover:scale-105"
                strokeWidth={1.25}
              />
            </button>

            {/* Account Button */}
            <Link
              href="/compte"
              className={cn(
                'hidden md:flex items-center justify-center',
                'w-10 h-10 rounded-full',
                'text-text-secondary hover:text-text-primary',
                'hover:bg-background-warm',
                'transition-all duration-300 ease-luxe',
                'focus:outline-none focus-visible:ring-1 focus-visible:ring-luxe-charcoal/20',
                'group'
              )}
              aria-label="Mon compte"
            >
              <User
                className="w-[17px] h-[17px] transition-transform duration-300 group-hover:scale-105"
                strokeWidth={1.25}
              />
            </Link>

            {/* Cart Button */}
            <CartIndicator />

            {/* Mobile Menu Toggle */}
            <MobileMenu />
          </motion.div>
        </div>
      </div>

      {/* Subtle bottom border - elegant separator */}
      <div
        className={cn(
          'absolute bottom-0 left-6 right-6 lg:left-12 lg:right-12 h-px',
          'bg-border-light',
          'transition-opacity duration-400 ease-luxe',
          isScrolled ? 'opacity-0' : 'opacity-100'
        )}
      />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
    </motion.header>
  );
}

// Header spacer to prevent content from going under fixed header + announcement bar
export function HeaderSpacer() {
  const { isVisible: isAnnouncementVisible } = useAnnouncement();

  // Header heights: h-16 (64px), md:h-20 (80px), lg:h-24 (96px)
  // Announcement bar height: 40px
  return (
    <div
      className={isAnnouncementVisible
        ? "h-[104px] md:h-[120px] lg:h-[136px]"
        : "h-16 md:h-20 lg:h-24"
      }
      aria-hidden="true"
    />
  );
}
