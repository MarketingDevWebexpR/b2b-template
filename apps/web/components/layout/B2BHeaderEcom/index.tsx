'use client';

/**
 * B2BHeaderEcom Component
 *
 * E-commerce header inspired by Leroy Merlin with 3-level structure:
 * 1. PromoBanner - Top promotional banner with countdown
 * 2. HeaderTop - Logo, warehouse selector, search bar, action icons
 * 3. HeaderNav - Horizontal navigation with MegaMenu
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  [X] -15% sur toute la collection - Code: PRO15  |  J:HH:MM:SS             │ PromoBanner
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ [Logo]  Paris Est  ┌────────────────────────────┐  Compte Devis Favoris 🛒 │ HeaderTop
 * │                    │ Rechercher...    [Rechercher]│                         │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ Catalogue ▼  Marques ▼  Promotions  Nouveautes  Services ▼  Express  📞   │ HeaderNav
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * Features:
 * - Sticky header with smooth scroll behavior
 * - MegaMenu on hover (Leroy Merlin style)
 * - Mobile responsive with hamburger menu
 * - Keyboard and screen reader accessible
 */

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PromoBanner } from './PromoBanner';
import { HeaderTop } from './HeaderTop';
import { HeaderNav } from './HeaderNav';
import { MegaMenuEcom } from './MegaMenuEcom';
import { MobileMenuEcom } from './MobileMenuEcom';

export interface B2BHeaderEcomProps {
  /** Show promo banner */
  showPromoBanner?: boolean;
  /** Promo banner message */
  promoMessage?: string;
  /** Promo banner link */
  promoHref?: string;
  /** Promo end date for countdown */
  promoEndDate?: string;
  /** Additional CSS classes */
  className?: string;
}

export const B2BHeaderEcom = memo(function B2BHeaderEcom({
  showPromoBanner = true,
  promoMessage = '-15% sur toute la collection avec le code PRO15',
  promoHref = '/promotions',
  promoEndDate,
  className,
}: B2BHeaderEcomProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isPromoBannerVisible, setIsPromoBannerVisible] = useState(showPromoBanner);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track scroll position
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setIsScrolled(window.scrollY > 10);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
        if (activeMegaMenu) {
          setActiveMegaMenu(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, activeMegaMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMegaMenuOpen = useCallback((itemId: string | null) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setActiveMegaMenu(itemId);
  }, []);

  const handleMegaMenuClose = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  }, []);

  const handleMegaMenuMouseEnter = useCallback(() => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    // Navigate to search results
    window.location.href = `/recherche?q=${encodeURIComponent(query)}`;
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'bg-white',
          'transition-shadow duration-300',
          isScrolled && 'shadow-header',
          className
        )}
        role="banner"
      >
        {/* Promo Banner */}
        {isPromoBannerVisible && (
          <PromoBanner
            message={promoMessage}
            href={promoHref}
            endDate={promoEndDate}
            variant="dark"
            dismissible
          />
        )}

        {/* Main Header */}
        <HeaderTop
          onMobileMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
          onSearch={handleSearch}
        />

        {/* Navigation */}
        <div className="relative">
          <HeaderNav
            onMegaMenuOpen={handleMegaMenuOpen}
            activeMegaMenu={activeMegaMenu}
          />

          {/* MegaMenu */}
          {activeMegaMenu && (
            <MegaMenuEcom
              activeSection={activeMegaMenu}
              onClose={() => setActiveMegaMenu(null)}
              onMouseEnter={handleMegaMenuMouseEnter}
              onMouseLeave={handleMegaMenuClose}
            />
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenuEcom
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      {/* MegaMenu backdrop */}
      {activeMegaMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-40 hidden lg:block"
          style={{ top: 'var(--header-height)' }}
          onClick={() => setActiveMegaMenu(null)}
          aria-hidden="true"
        />
      )}
    </>
  );
});

B2BHeaderEcom.displayName = 'B2BHeaderEcom';

/**
 * Header spacer component
 * Creates vertical space to prevent content from going under the fixed header.
 */
export const B2BHeaderEcomSpacer = memo(function B2BHeaderEcomSpacer({
  showPromoBanner = true,
}: {
  showPromoBanner?: boolean;
}) {
  return (
    <div
      className={cn(
        'w-full',
        showPromoBanner ? 'h-[168px] lg:h-[180px]' : 'h-[128px] lg:h-[140px]'
      )}
      aria-hidden="true"
    />
  );
});

B2BHeaderEcomSpacer.displayName = 'B2BHeaderEcomSpacer';

// Re-exports
export { PromoBanner } from './PromoBanner';
export { HeaderTop } from './HeaderTop';
export { HeaderNav } from './HeaderNav';
export { MegaMenuEcom } from './MegaMenuEcom';
export { MobileMenuEcom } from './MobileMenuEcom';

export default B2BHeaderEcom;
