'use client';

/**
 * B2BHeaderEcomSSR Component
 *
 * SSR-compatible version of B2BHeaderEcom that receives announcement data
 * via props from a Server Component, preventing content flash.
 *
 * This component is identical to B2BHeaderEcom but uses AnnouncementBannerSSR
 * with data passed from the server instead of fetching client-side.
 *
 * Updated to use new 5-level MegaMenu navigation.
 */

import { memo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { PromoBanner } from './PromoBanner';
import { HeaderTop } from './HeaderTop';
import { AnnouncementBannerSSR } from '@/components/cms';
// New 5-level navigation components
import { MegaMenu } from '@/components/navigation/MegaMenu';
import { MobileNavigation } from '@/components/navigation/MobileMenu';
import type { Announcement } from '@/types/cms';

export interface B2BHeaderEcomSSRProps {
  /**
   * Announcement data from server-side fetch.
   * When provided, renders the banner immediately without client fetch.
   */
  announcements?: Announcement[];
  /** Show promo banner (used when not using CMS announcements) */
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

export const B2BHeaderEcomSSR = memo(function B2BHeaderEcomSSR({
  announcements = [],
  showPromoBanner = false,
  promoMessage = '-15% sur toute la collection avec le code PRO15',
  promoHref = '/promotions',
  promoEndDate,
  className,
}: B2BHeaderEcomSSRProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPromoBannerVisible, setIsPromoBannerVisible] = useState(showPromoBanner);

  // Determine if we should show the announcement banner
  const showAnnouncementBanner = announcements.length > 0;

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
        {/* SSR Announcement Banner (data passed from server) */}
        {showAnnouncementBanner && (
          <AnnouncementBannerSSR announcements={announcements} />
        )}

        {/* Fallback: Static Promo Banner (when no CMS announcements) */}
        {!showAnnouncementBanner && isPromoBannerVisible && (
          <PromoBanner
            message={promoMessage}
            href={promoHref}
            endDate={promoEndDate}
            variant="dark"
            dismissible
          />
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

B2BHeaderEcomSSR.displayName = 'B2BHeaderEcomSSR';

/**
 * Header spacer component for SSR header
 */
export const B2BHeaderEcomSSRSpacer = memo(function B2BHeaderEcomSSRSpacer({
  hasAnnouncements = false,
}: {
  hasAnnouncements?: boolean;
}) {
  return (
    <div
      className={cn(
        'w-full',
        hasAnnouncements ? 'h-[148px] lg:h-[164px]' : 'h-[108px] lg:h-[124px]'
      )}
      aria-hidden="true"
    />
  );
});

B2BHeaderEcomSSRSpacer.displayName = 'B2BHeaderEcomSSRSpacer';

export default B2BHeaderEcomSSR;
