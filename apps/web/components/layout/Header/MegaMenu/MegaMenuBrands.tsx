'use client';

/**
 * MegaMenuBrands Component
 *
 * Brands showcase section in the MegaMenu.
 * Displays brand logos with links to brand pages.
 * Receives dynamic brand data from parent via props.
 */

import { memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Gem, Crown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Brand } from '@/types/brand';

// ============================================================================
// Types
// ============================================================================

export interface MegaMenuBrandsProps {
  /** List of brands to display */
  brands: Brand[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when link is clicked */
  onLinkClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Maximum number of premium brands to display */
const MAX_PREMIUM_BRANDS = 6;

/** Maximum number of popular brands to display */
const MAX_POPULAR_BRANDS = 8;

// ============================================================================
// Component
// ============================================================================

export const MegaMenuBrands = memo(function MegaMenuBrands({
  brands,
  isLoading = false,
  onLinkClick,
  className,
}: MegaMenuBrandsProps) {
  // Split brands into premium and standard
  const { premiumBrands, popularBrands, featuredBrand } = useMemo(() => {
    const premium = brands
      .filter((brand) => brand.is_premium)
      .slice(0, MAX_PREMIUM_BRANDS);

    const popular = brands
      .filter((brand) => !brand.is_premium)
      .slice(0, MAX_POPULAR_BRANDS);

    // Use first premium brand as featured, or first brand overall
    const featured = premium[0] || brands[0] || null;

    return {
      premiumBrands: premium,
      popularBrands: popular,
      featuredBrand: featured,
    };
  }, [brands]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="ml-3 text-neutral-600">Chargement des marques...</span>
      </div>
    );
  }

  // Empty state
  if (brands.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Gem className="w-12 h-12 text-neutral-300 mb-4" />
        <p className="text-neutral-500">Aucune marque disponible</p>
        <Link
          href="/marques"
          onClick={onLinkClick}
          className="mt-4 text-sm text-amber-700 hover:text-amber-800 font-medium"
        >
          Voir toutes les marques
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-12 gap-6', className)}>
      {/* Premium brands */}
      <div className="col-span-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          Marques Premium
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {premiumBrands.length > 0 ? (
            premiumBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isPremium
                onLinkClick={onLinkClick}
              />
            ))
          ) : (
            // Fallback: show first 6 brands if no premium brands
            brands.slice(0, MAX_PREMIUM_BRANDS).map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isPremium
                onLinkClick={onLinkClick}
              />
            ))
          )}
        </div>
      </div>

      {/* Popular brands */}
      <div className="col-span-5">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          Marques Populaires
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {popularBrands.length > 0 ? (
            popularBrands.map((brand) => (
              <BrandListItem
                key={brand.id}
                brand={brand}
                onLinkClick={onLinkClick}
              />
            ))
          ) : (
            // Fallback: show remaining brands if no non-premium brands
            brands.slice(MAX_PREMIUM_BRANDS, MAX_PREMIUM_BRANDS + MAX_POPULAR_BRANDS).map((brand) => (
              <BrandListItem
                key={brand.id}
                brand={brand}
                onLinkClick={onLinkClick}
              />
            ))
          )}
        </div>

        {/* View all brands */}
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <Link
            href="/marques"
            onClick={onLinkClick}
            className={cn(
              'flex items-center gap-2',
              'text-sm font-semibold text-amber-700',
              'hover:text-amber-800',
              'transition-colors duration-150'
            )}
          >
            <span>Voir toutes les marques</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Featured brand promo */}
      <div className="col-span-3">
        <FeaturedBrandPromo
          brand={featuredBrand}
          onLinkClick={onLinkClick}
        />
      </div>
    </div>
  );
});

MegaMenuBrands.displayName = 'MegaMenuBrands';

// ============================================================================
// Subcomponents
// ============================================================================

interface BrandCardProps {
  brand: Brand;
  isPremium?: boolean;
  onLinkClick?: () => void;
}

/**
 * Brand card with logo for premium brands section
 */
const BrandCard = memo(function BrandCard({
  brand,
  isPremium = false,
  onLinkClick,
}: BrandCardProps) {
  return (
    <Link
      href={`/marques/${brand.slug}`}
      onClick={onLinkClick}
      className={cn(
        'flex flex-col items-center justify-center p-4',
        'bg-neutral-50 border border-neutral-100 rounded-xl',
        'hover:bg-amber-50 hover:border-amber-200',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20',
        'group'
      )}
    >
      {/* Brand logo or placeholder */}
      <div
        className={cn(
          'w-12 h-12 rounded-full',
          'bg-white border border-neutral-200',
          'flex items-center justify-center',
          'group-hover:border-amber-300 transition-colors duration-200',
          'overflow-hidden'
        )}
      >
        {brand.logo_url ? (
          <Image
            src={brand.logo_url}
            alt={`${brand.name} logo`}
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <Gem className="w-5 h-5 text-neutral-400 group-hover:text-amber-600" />
        )}
      </div>
      <span className="text-sm font-medium text-neutral-700 mt-2 text-center group-hover:text-amber-800">
        {brand.name}
      </span>
      {brand.product_count > 0 && (
        <span className="text-xs text-neutral-400 mt-0.5">
          {brand.product_count} produit{brand.product_count > 1 ? 's' : ''}
        </span>
      )}
    </Link>
  );
});

BrandCard.displayName = 'BrandCard';

interface BrandListItemProps {
  brand: Brand;
  onLinkClick?: () => void;
}

/**
 * Brand list item for popular brands section
 */
const BrandListItem = memo(function BrandListItem({
  brand,
  onLinkClick,
}: BrandListItemProps) {
  return (
    <Link
      href={`/marques/${brand.slug}`}
      onClick={onLinkClick}
      className={cn(
        'flex items-center justify-between py-2 px-2 -mx-2 rounded-lg',
        'text-sm text-neutral-600',
        'hover:text-amber-700 hover:bg-neutral-50',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20'
      )}
    >
      <span>{brand.name}</span>
      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
    </Link>
  );
});

BrandListItem.displayName = 'BrandListItem';

interface FeaturedBrandPromoProps {
  brand: Brand | null;
  onLinkClick?: () => void;
}

/**
 * Featured brand promotion panel
 */
const FeaturedBrandPromo = memo(function FeaturedBrandPromo({
  brand,
  onLinkClick,
}: FeaturedBrandPromoProps) {
  if (!brand) {
    return (
      <div className="h-full bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 flex flex-col items-center justify-center">
        <Gem className="w-8 h-8 text-neutral-600 mb-2" />
        <p className="text-sm text-neutral-500">Aucune marque en vedette</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 flex flex-col">
      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
        {brand.is_premium ? 'Marque Premium' : 'En vedette'}
      </span>
      <h4 className="text-lg font-semibold text-white mt-2">
        {brand.name}
      </h4>
      <p className="text-sm text-neutral-400 mt-2 flex-1 line-clamp-3">
        {brand.description || `Decouvrez notre selection de produits ${brand.name}.`}
      </p>
      {brand.product_count > 0 && (
        <p className="text-xs text-neutral-500 mt-2">
          {brand.product_count} produit{brand.product_count > 1 ? 's' : ''} disponible{brand.product_count > 1 ? 's' : ''}
        </p>
      )}
      <Link
        href={`/marques/${brand.slug}`}
        onClick={onLinkClick}
        className={cn(
          'inline-flex items-center gap-2 mt-4',
          'text-sm font-medium text-amber-400',
          'hover:text-amber-300 transition-colors duration-150'
        )}
      >
        <span>Decouvrir</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
});

FeaturedBrandPromo.displayName = 'FeaturedBrandPromo';

export default MegaMenuBrands;
