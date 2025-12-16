'use client';

/**
 * B2BHeader Component
 *
 * Professional B2B header inspired by Rexel/Sonepar style.
 * Two-row layout with search, quick access, and mega menu navigation.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ [Logo]  ┌──────────────────────────────────────────┐  Mon compte   Panier   │
 * │         │ Search bar                               │  [3] Devis    [12]     │
 * │         └──────────────────────────────────────────┘  Commandes             │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ Categories    Marques    Promotions    Services        Entrepot Paris Est   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * Features:
 * - Sticky header with scroll reduction
 * - MegaMenu on hover
 * - Mobile responsive with hamburger
 * - Keyboard accessible
 */

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderSearch } from './HeaderSearch';
import { HeaderQuickAccess } from './HeaderQuickAccess';
import { WarehouseSelector } from './WarehouseSelector';
import { MegaMenu } from './MegaMenu';

export interface B2BHeaderProps {
  /** Additional CSS classes */
  className?: string;
  /** Callback when search is opened */
  onSearchOpen?: () => void;
}

export const B2BHeader = memo(function B2BHeader({
  className,
  onSearchOpen,
}: B2BHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    // Check initial position
    setIsScrolled(window.scrollY > 10);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

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

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'bg-white',
          'transition-shadow duration-300',
          isScrolled && 'shadow-md',
          className
        )}
        role="banner"
      >
        {/* Top row: Logo, Search, Quick Access */}
        <div
          className={cn(
            'border-b border-neutral-200',
            'transition-all duration-300',
            isScrolled ? 'py-2' : 'py-3'
          )}
        >
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Mobile menu toggle */}
              <button
                onClick={toggleMobileMenu}
                className={cn(
                  'lg:hidden flex items-center justify-center',
                  'w-10 h-10 rounded-lg',
                  'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20'
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
              <Link
                href="/"
                className={cn(
                  'flex items-center gap-2 flex-shrink-0',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 rounded-lg'
                )}
                aria-label="Accueil"
              >
                <div
                  className={cn(
                    'flex items-center justify-center',
                    'bg-neutral-900 rounded-lg',
                    'transition-all duration-300',
                    isScrolled ? 'w-8 h-8' : 'w-10 h-10'
                  )}
                >
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div className={cn(
                  'hidden sm:flex flex-col',
                  'transition-all duration-300',
                  isScrolled && 'scale-90 origin-left'
                )}>
                  <span className="text-neutral-900 font-semibold text-lg leading-tight">
                    Maison
                  </span>
                  <span className="text-neutral-500 text-xs leading-tight">
                    Pro Bijoux
                  </span>
                </div>
              </Link>

              {/* Search bar */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                <HeaderSearch
                  onSearchOpen={onSearchOpen}
                  placeholder="Rechercher par nom, SKU, EAN..."
                />
              </div>

              {/* Quick access icons */}
              <div className="flex items-center ml-auto">
                <HeaderQuickAccess />
              </div>
            </div>

            {/* Mobile search - below main row */}
            <div className="md:hidden mt-3">
              <HeaderSearch
                onSearchOpen={onSearchOpen}
                placeholder="Rechercher..."
              />
            </div>
          </div>
        </div>

        {/* Bottom row: Navigation and Warehouse selector */}
        <div
          className={cn(
            'hidden lg:block',
            'bg-neutral-50 border-b border-neutral-200',
            'transition-all duration-300',
            isScrolled ? 'py-1.5' : 'py-2'
          )}
        >
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between">
              {/* MegaMenu Navigation */}
              <MegaMenu />

              {/* Warehouse selector */}
              <WarehouseSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className={cn(
            'fixed inset-0 z-40 lg:hidden',
            'bg-black/50 backdrop-blur-sm',
            'animate-fade-in'
          )}
          aria-modal="true"
          role="dialog"
          aria-label="Menu de navigation"
        >
          {/* Menu panel */}
          <div
            className={cn(
              'absolute top-0 left-0 bottom-0 w-full max-w-sm',
              'bg-white shadow-xl',
              'animate-slide-in-left',
              'overflow-y-auto'
            )}
          >
            {/* Mobile menu header */}
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-neutral-200 bg-white z-10">
              <span className="text-base font-semibold text-neutral-900">
                Menu
              </span>
              <button
                onClick={closeMobileMenu}
                className={cn(
                  'flex items-center justify-center',
                  'w-10 h-10 rounded-lg',
                  'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20'
                )}
                aria-label="Fermer le menu"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Warehouse selector (mobile) */}
            <div className="p-4 border-b border-neutral-200">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
                Point de vente
              </p>
              <WarehouseSelector compact={false} />
            </div>

            {/* Navigation links */}
            <nav className="p-4" aria-label="Navigation mobile">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/categories"
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-sm font-medium text-neutral-900',
                      'hover:bg-neutral-50',
                      'transition-colors duration-200'
                    )}
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/marques"
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-sm font-medium text-neutral-900',
                      'hover:bg-neutral-50',
                      'transition-colors duration-200'
                    )}
                  >
                    Marques
                  </Link>
                </li>
                <li>
                  <Link
                    href="/promotions"
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-sm font-medium text-accent',
                      'hover:bg-neutral-50',
                      'transition-colors duration-200'
                    )}
                  >
                    Promotions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-sm font-medium text-neutral-900',
                      'hover:bg-neutral-50',
                      'transition-colors duration-200'
                    )}
                  >
                    Services
                  </Link>
                </li>
              </ul>

              {/* Divider */}
              <div className="my-4 border-t border-neutral-200" />

              {/* Account links */}
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/compte"
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-sm font-medium text-neutral-900',
                      'hover:bg-neutral-50',
                      'transition-colors duration-200'
                    )}
                  >
                    Mon compte
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compte/devis"
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-sm font-medium text-neutral-900',
                      'hover:bg-neutral-50',
                      'transition-colors duration-200'
                    )}
                  >
                    Mes devis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compte/commandes"
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-sm font-medium text-neutral-900',
                      'hover:bg-neutral-50',
                      'transition-colors duration-200'
                    )}
                  >
                    Mes commandes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/panier"
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-sm font-medium text-neutral-900',
                      'hover:bg-neutral-50',
                      'transition-colors duration-200'
                    )}
                  >
                    Mon panier
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto border-t border-neutral-200 bg-neutral-50">
              <p className="text-xs text-neutral-500 text-center">
                Besoin d'aide ?{' '}
                <a
                  href="tel:+33123456789"
                  className="text-accent hover:text-orange-600"
                >
                  01 23 45 67 89
                </a>
              </p>
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
});

B2BHeader.displayName = 'B2BHeader';

/**
 * B2BHeader spacer component
 *
 * Creates vertical space to prevent content from going under the fixed header.
 */
export const B2BHeaderSpacer = memo(function B2BHeaderSpacer() {
  return (
    <div
      className="h-[108px] lg:h-[140px]"
      aria-hidden="true"
    />
  );
});

B2BHeaderSpacer.displayName = 'B2BHeaderSpacer';

// Re-export all components
export { HeaderSearch } from './HeaderSearch';
export { HeaderQuickAccess } from './HeaderQuickAccess';
export { WarehouseSelector } from './WarehouseSelector';
export { MegaMenu } from './MegaMenu';
export { MegaMenuColumn } from './MegaMenu/MegaMenuColumn';
export { MegaMenuFeatured } from './MegaMenu/MegaMenuFeatured';

// Export types
export type { HeaderSearchProps } from './HeaderSearch';
export type { HeaderQuickAccessProps } from './HeaderQuickAccess';
export type { WarehouseSelectorProps } from './WarehouseSelector';
export type { MegaMenuProps } from './MegaMenu';

// Export mock data types
export type {
  Category,
  SubCategory,
  CategoryItem,
  FeaturedProduct,
  NavLink,
} from './mockData';

export default B2BHeader;
