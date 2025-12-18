'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';
import {
  User,
  Heart,
  ShoppingCart,
  FileText,
  MapPin,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useMobileMenuDrawer } from '@/contexts/MobileMenuContext';
import { SearchBar } from '@/components/search/SearchBar';

export interface HeaderTopProps {
  /** Callback when mobile menu toggle is clicked (optional, uses context if not provided) */
  onMobileMenuToggle?: () => void;
  /** Whether mobile menu is open (optional, uses context if not provided) */
  isMobileMenuOpen?: boolean;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export const HeaderTop = memo(function HeaderTop({
  onMobileMenuToggle: propToggle,
  isMobileMenuOpen: propIsOpen,
  onSearch,
  className,
}: HeaderTopProps) {
  const { selectedWarehouse } = useWarehouse();

  // Use context for mobile menu state, with props as fallback
  let contextState: { isOpen: boolean; toggleMenu: () => void } | null = null;
  try {
    contextState = useMobileMenuDrawer();
  } catch {
    // Context not available, use props
  }

  const isMobileMenuOpen = propIsOpen ?? contextState?.isOpen ?? false;
  const onMobileMenuToggle = propToggle ?? contextState?.toggleMenu;

  const handleSearch = useCallback(
    (query: string) => {
      onSearch?.(query);
    },
    [onSearch]
  );

  // Mock cart count - would come from cart context
  const cartCount = 3;
  const wishlistCount = 5;
  const quotesCount = 2;

  return (
    <div className={cn('bg-white border-b border-stroke', className)}>
      <div className="container-ecom">
        <div className="flex items-center gap-4 h-16 lg:h-20">
          {/* Mobile menu toggle */}
          <button
            onClick={onMobileMenuToggle}
            className={cn(
              'lg:hidden flex items-center justify-center',
              'w-10 h-10 -ml-2 rounded-lg',
              'text-content-secondary hover:text-content-primary hover:bg-surface-secondary',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
            )}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 flex-shrink-0',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-lg'
            )}
            aria-label="WebexpR Pro - Accueil"
          >
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-lg">
              <span className="text-white font-heading text-xl lg:text-2xl">M</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-content-primary font-heading text-lg lg:text-xl leading-tight">
                WebexpR Pro
              </span>
              <span className="text-content-muted text-xs leading-tight">
                Espace Professionnel
              </span>
            </div>
          </Link>

          {/* Warehouse selector */}
          <div className="hidden lg:flex items-center ml-4">
            <button
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                'text-sm text-content-secondary',
                'hover:bg-surface-secondary hover:text-content-primary',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
              )}
              aria-label="Changer de point de vente"
            >
              <MapPin className="w-4 h-4 text-accent" />
              <div className="text-left">
                <p className="text-xs text-content-muted">Point de vente</p>
                <p className="font-medium text-content-primary">
                  {selectedWarehouse?.name || 'Selectionner'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Search bar with autocomplete */}
          <div className="hidden md:block flex-1 max-w-xl mx-4 lg:mx-8">
            <SearchBar
              placeholder="Rechercher un produit, une marque, une reference..."
              onSearch={handleSearch}
              size="md"
              showSuggestions={true}
            />
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Account */}
            <Link
              href="/compte"
              className={cn(
                'hidden sm:flex flex-col items-center justify-center',
                'w-14 h-14 rounded-lg',
                'text-content-secondary hover:text-content-primary hover:bg-surface-secondary',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
              )}
            >
              <User className="w-5 h-5" />
              <span className="text-xs mt-0.5">Compte</span>
            </Link>

            {/* Quotes */}
            <Link
              href="/devis"
              className={cn(
                'hidden lg:flex flex-col items-center justify-center relative',
                'w-14 h-14 rounded-lg',
                'text-content-secondary hover:text-content-primary hover:bg-surface-secondary',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
              )}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs mt-0.5">Devis</span>
              {quotesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold">
                  {quotesCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/favoris"
              className={cn(
                'hidden lg:flex flex-col items-center justify-center relative',
                'w-14 h-14 rounded-lg',
                'text-content-secondary hover:text-content-primary hover:bg-surface-secondary',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
              )}
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs mt-0.5">Favoris</span>
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/panier"
              className={cn(
                'flex flex-col items-center justify-center relative',
                'w-14 h-14 rounded-lg',
                'text-content-secondary hover:text-content-primary hover:bg-surface-secondary',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs mt-0.5">Panier</span>
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search with autocomplete */}
        <div className="md:hidden pb-3">
          <SearchBar
            placeholder="Rechercher..."
            onSearch={handleSearch}
            size="sm"
            showSuggestions={true}
          />
        </div>
      </div>
    </div>
  );
});

HeaderTop.displayName = 'HeaderTop';

export default HeaderTop;
