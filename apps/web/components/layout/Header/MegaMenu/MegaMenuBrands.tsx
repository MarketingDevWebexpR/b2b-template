'use client';

/**
 * MegaMenuBrands Component
 *
 * Brands showcase section in the MegaMenu.
 * Displays brand logos with links to brand pages.
 */

import { memo } from 'react';
import Link from 'next/link';
import { ArrowRight, Gem, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MegaMenuBrandsProps {
  /** Callback when link is clicked */
  onLinkClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Mock brands data
const featuredBrands = [
  { id: 'brand_1', name: 'Cartier', handle: 'cartier', tier: 'premium' },
  { id: 'brand_2', name: 'Bulgari', handle: 'bulgari', tier: 'premium' },
  { id: 'brand_3', name: 'Tiffany & Co.', handle: 'tiffany', tier: 'premium' },
  { id: 'brand_4', name: 'Van Cleef & Arpels', handle: 'van-cleef', tier: 'premium' },
  { id: 'brand_5', name: 'Chopard', handle: 'chopard', tier: 'premium' },
  { id: 'brand_6', name: 'Piaget', handle: 'piaget', tier: 'premium' },
];

const popularBrands = [
  { id: 'brand_7', name: 'Pandora', handle: 'pandora', tier: 'standard' },
  { id: 'brand_8', name: 'Swarovski', handle: 'swarovski', tier: 'standard' },
  { id: 'brand_9', name: 'Thomas Sabo', handle: 'thomas-sabo', tier: 'standard' },
  { id: 'brand_10', name: 'Fossil', handle: 'fossil', tier: 'standard' },
  { id: 'brand_11', name: 'Michael Kors', handle: 'michael-kors', tier: 'standard' },
  { id: 'brand_12', name: 'Guess', handle: 'guess', tier: 'standard' },
  { id: 'brand_13', name: 'Tommy Hilfiger', handle: 'tommy-hilfiger', tier: 'standard' },
  { id: 'brand_14', name: 'Calvin Klein', handle: 'calvin-klein', tier: 'standard' },
];

export const MegaMenuBrands = memo(function MegaMenuBrands({
  onLinkClick,
  className,
}: MegaMenuBrandsProps) {
  return (
    <div className={cn('grid grid-cols-12 gap-6', className)}>
      {/* Premium brands */}
      <div className="col-span-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          Marques Premium
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {featuredBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/marques/${brand.handle}`}
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
              {/* Brand logo placeholder */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full',
                  'bg-white border border-neutral-200',
                  'flex items-center justify-center',
                  'group-hover:border-amber-300 transition-colors duration-200'
                )}
              >
                <Gem className="w-5 h-5 text-neutral-400 group-hover:text-amber-600" />
              </div>
              <span className="text-sm font-medium text-neutral-700 mt-2 text-center group-hover:text-amber-800">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular brands */}
      <div className="col-span-5">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          Marques Populaires
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {popularBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/marques/${brand.handle}`}
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
          ))}
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
        <div className="h-full bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 flex flex-col">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Nouveaute
          </span>
          <h4 className="text-lg font-semibold text-white mt-2">
            Collection Cartier 2024
          </h4>
          <p className="text-sm text-neutral-400 mt-2 flex-1">
            Decouvrez la nouvelle collection exclusive de haute joaillerie.
          </p>
          <Link
            href="/marques/cartier/collection-2024"
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
      </div>
    </div>
  );
});

MegaMenuBrands.displayName = 'MegaMenuBrands';

export default MegaMenuBrands;
