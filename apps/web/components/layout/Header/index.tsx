'use client';

/**
 * Header Component
 *
 * Modern B2B e-commerce header for a jewelry platform.
 * Features a three-row layout with promo banner, main header, and navigation.
 *
 * Layout:
 * +-----------------------------------------------------------------------+
 * | [X] Livraison offerte des 500EUR HT - Code: BIENVENUE15              | PromoBanner (optional)
 * +-----------------------------------------------------------------------+
 * | [Logo]  [Search Bar.............................]  Actions  Company  | Main Header
 * +-----------------------------------------------------------------------+
 * | Catalogue v  Marques v  Nouveautes  Promotions  Services  Contact    | Navigation
 * +-----------------------------------------------------------------------+
 *
 * Features:
 * - Sticky header with scroll behavior
 * - MegaMenu on hover for categories
 * - Responsive mobile drawer
 * - Feature-gated actions (wishlist, quotes)
 * - Company/user indicator for B2B context
 * - Keyboard accessible
 */

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Search,
  User,
  Heart,
  ShoppingBag,
  FileText,
  ChevronDown,
  Building2,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useB2B } from '@/contexts';
import { useFeatures, useListsFeatures, useQuotesFeatures } from '@/contexts/FeatureContext';
import { SubFeatureGate, ModuleGate } from '@/components/features/FeatureGate';
import { useMockData } from '@/hooks/useMockData';
import { HeaderLogo } from './HeaderLogo';
import { HeaderSearch } from './HeaderSearch';
import { HeaderActions } from './HeaderActions';
import { HeaderCompanyBadge } from './HeaderCompanyBadge';
import { HeaderNav } from './HeaderNav';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';

export interface HeaderProps {
  /** Show promotional banner */
  showPromoBanner?: boolean;
  /** Promo banner message */
  promoMessage?: string;
  /** Promo banner link */
  promoHref?: string;
  /** Additional CSS classes */
  className?: string;
}

export const Header = memo(function Header({
  showPromoBanner = true,
  promoMessage = 'Livraison offerte des 500EUR HT - Code: BIENVENUE15',
  promoHref = '/promotions',
  className,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isPromoBannerVisible, setIsPromoBannerVisible] = useState(showPromoBanner);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // B2B context
  const { employee, company } = useB2B();
  const { cart, quotes } = useMockData();

  // Track scroll position for sticky behavior
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
    };
  }, []);

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

  const dismissPromoBanner = useCallback(() => {
    setIsPromoBannerVisible(false);
  }, []);

  // Cart and quotes counts
  const cartCount = cart.currentCart.items.length;
  const quotesCount = quotes.stats.pending;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'bg-white',
          'transition-shadow duration-300',
          isScrolled && 'shadow-lg',
          className
        )}
        role="banner"
      >
        {/* Promo Banner */}
        <AnimatePresence>
          {isPromoBannerVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-neutral-900 text-white overflow-hidden"
            >
              <div className="container mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between py-2">
                  <Link
                    href={promoHref}
                    className="flex-1 text-center text-sm font-medium hover:text-neutral-200 transition-colors"
                  >
                    {promoMessage}
                  </Link>
                  <button
                    onClick={dismissPromoBanner}
                    className="ml-4 p-1 rounded hover:bg-white/10 transition-colors"
                    aria-label="Fermer la banniere"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Header Row */}
        <div
          className={cn(
            'border-b border-neutral-100',
            'transition-all duration-300',
            isScrolled ? 'py-2' : 'py-3'
          )}
        >
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center gap-4 lg:gap-8">
              {/* Mobile menu toggle */}
              <button
                onClick={toggleMobileMenu}
                className={cn(
                  'lg:hidden flex items-center justify-center',
                  'w-10 h-10 rounded-lg',
                  'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20'
                )}
                aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-6 h-6" strokeWidth={1.5} />
                )}
              </button>

              {/* Logo */}
              <HeaderLogo isCompact={isScrolled} />

              {/* Search bar - desktop */}
              <div className="hidden md:flex flex-1 max-w-2xl">
                <HeaderSearch />
              </div>

              {/* Right side: Actions + Company Badge */}
              <div className="flex items-center gap-2 lg:gap-4 ml-auto">
                {/* Action icons */}
                <HeaderActions
                  cartCount={cartCount}
                  quotesCount={quotesCount}
                />

                {/* Company/User badge - desktop */}
                <div className="hidden lg:block">
                  <HeaderCompanyBadge />
                </div>
              </div>
            </div>

            {/* Mobile search - below main row */}
            <div className="md:hidden mt-3">
              <HeaderSearch />
            </div>
          </div>
        </div>

        {/* Navigation Row - Desktop */}
        <div
          className={cn(
            'hidden lg:block',
            'bg-white border-b border-neutral-100',
            'transition-all duration-300'
          )}
        >
          <div className="container mx-auto px-4 lg:px-6">
            <HeaderNav
              activeMegaMenu={activeMegaMenu}
              onMegaMenuOpen={handleMegaMenuOpen}
              onMegaMenuClose={handleMegaMenuClose}
            />
          </div>
        </div>

        {/* MegaMenu Dropdown */}
        <AnimatePresence>
          {activeMegaMenu && (
            <MegaMenu
              activeSection={activeMegaMenu}
              onClose={() => setActiveMegaMenu(null)}
              onMouseEnter={handleMegaMenuMouseEnter}
              onMouseLeave={handleMegaMenuClose}
            />
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        cartCount={cartCount}
        quotesCount={quotesCount}
      />

      {/* MegaMenu backdrop */}
      <AnimatePresence>
        {activeMegaMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40 hidden lg:block"
            style={{ top: 'var(--header-height, 140px)' }}
            onClick={() => setActiveMegaMenu(null)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
});

Header.displayName = 'Header';

/**
 * Header spacer component
 * Creates vertical space to prevent content from going under the fixed header.
 */
export const HeaderSpacer = memo(function HeaderSpacer({
  showPromoBanner = true,
}: {
  showPromoBanner?: boolean;
}) {
  return (
    <div
      className={cn(
        'w-full',
        showPromoBanner ? 'h-[152px] lg:h-[164px]' : 'h-[116px] lg:h-[128px]'
      )}
      aria-hidden="true"
    />
  );
});

HeaderSpacer.displayName = 'HeaderSpacer';

// Re-exports
export { HeaderLogo } from './HeaderLogo';
export { HeaderSearch } from './HeaderSearch';
export { HeaderActions } from './HeaderActions';
export { HeaderCompanyBadge } from './HeaderCompanyBadge';
export { HeaderNav } from './HeaderNav';
export { MegaMenu } from './MegaMenu';
export { MobileMenu } from './MobileMenu';

export default Header;
