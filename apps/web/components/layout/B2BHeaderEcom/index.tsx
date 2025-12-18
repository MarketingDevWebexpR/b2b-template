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
import { AnnouncementBanner } from '@/components/cms';
// New 5-level navigation components
import { MegaMenu } from '@/components/navigation/MegaMenu';
import { MobileNavigation } from '@/components/navigation/MobileMenu';

export interface B2BHeaderEcomProps {
  /** Show promo banner */
  showPromoBanner?: boolean;
  /** Use CMS announcement banner instead of hardcoded promo */
  useCmsAnnouncement?: boolean;
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
  useCmsAnnouncement = false,
  promoMessage = '-15% sur toute la collection avec le code PRO15',
  promoHref = '/promotions',
  promoEndDate,
  className,
}: B2BHeaderEcomProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPromoBannerVisible, setIsPromoBannerVisible] = useState(showPromoBanner);

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
        {/* CMS Announcement Banner or Promo Banner */}
        {useCmsAnnouncement ? (
          <AnnouncementBanner />
        ) : (
          isPromoBannerVisible && (
            <PromoBanner
              message={promoMessage}
              href={promoHref}
              endDate={promoEndDate}
              variant="dark"
              dismissible
            />
          )
        )}

        {/* Main Header (with mobile menu toggle using context) */}
        <HeaderTop onSearch={handleSearch} />

        {/* Desktop Navigation - New 5-level MegaMenu */}
        <div className="hidden lg:block">
          <MegaMenu />
        </div>
      </header>

      {/* Mobile Navigation Drawer - Uses context for state */}
      <MobileNavigation rootTitle="Catalogue" />
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
  useCmsAnnouncement = false,
}: {
  showPromoBanner?: boolean;
  useCmsAnnouncement?: boolean;
}) {
  // CMS announcements may not always be visible (e.g., dismissed or no active announcement)
  // so we use a slightly smaller base height and let CSS handle the rest
  const showBanner = showPromoBanner || useCmsAnnouncement;

  return (
    <div
      className={cn(
        'w-full',
        showBanner ? 'h-[148px] lg:h-[164px]' : 'h-[108px] lg:h-[124px]'
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

// SSR-compatible header (recommended - prevents content flash)
export {
  B2BHeaderEcomSSR,
  B2BHeaderEcomSSRSpacer,
  type B2BHeaderEcomSSRProps,
} from './B2BHeaderEcomSSR';

export default B2BHeaderEcom;
