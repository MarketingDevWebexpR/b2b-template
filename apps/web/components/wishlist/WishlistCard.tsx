'use client';

/**
 * WishlistCard Component
 *
 * Displays a summary card for a wishlist with preview images,
 * item count, visibility badge, and quick actions.
 */

import { memo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import type { WishlistSummary, WishlistVisibility, WishlistTemplate } from '@maison/types';

// ============================================================================
// Icons
// ============================================================================

const LockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

interface WishlistCardProps {
  /** Wishlist summary data */
  wishlist: WishlistSummary;
  /** Click handler for the card */
  onClick?: () => void;
  /** Handler for duplicate action */
  onDuplicate?: (id: string) => void;
  /** Handler for share action */
  onShare?: (id: string) => void;
  /** Handler for delete action */
  onDelete?: (id: string) => void;
  /** Additional className */
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getVisibilityIcon(visibility: WishlistVisibility) {
  switch (visibility) {
    case 'private':
      return <LockIcon />;
    case 'shared':
      return <UsersIcon />;
    case 'public':
      return <GlobeIcon />;
  }
}

function getVisibilityLabel(visibility: WishlistVisibility): string {
  switch (visibility) {
    case 'private':
      return 'Prive';
    case 'shared':
      return 'Partage';
    case 'public':
      return 'Public';
  }
}

function getVisibilityColor(visibility: WishlistVisibility): string {
  switch (visibility) {
    case 'private':
      return 'bg-gray-100 text-gray-700';
    case 'shared':
      return 'bg-blue-100 text-blue-700';
    case 'public':
      return 'bg-green-100 text-green-700';
  }
}

function getTemplateLabel(template: WishlistTemplate): string {
  const labels: Record<WishlistTemplate, string> = {
    favorites: 'Favoris',
    seasonal_spring: 'Printemps',
    seasonal_summer: 'Ete',
    seasonal_autumn: 'Automne',
    seasonal_winter: 'Hiver',
    bestsellers: 'Meilleures ventes',
    new_arrivals: 'Nouveautes',
    reorder: 'Reapprovisionnement',
    custom: 'Personnalise',
  };
  return labels[template] || template;
}

// ============================================================================
// Component
// ============================================================================

export const WishlistCard = memo(function WishlistCard({
  wishlist,
  onClick,
  onDuplicate,
  onShare,
  onDelete,
  className,
}: WishlistCardProps) {
  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDuplicate?.(wishlist.id);
    },
    [wishlist.id, onDuplicate]
  );

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onShare?.(wishlist.id);
    },
    [wishlist.id, onShare]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete?.(wishlist.id);
    },
    [wishlist.id, onDelete]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative bg-white rounded-lg border border-neutral-200',
        'hover:border-accent/50 hover:shadow-md transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2',
        className
      )}
    >
      <Link
        href={`/listes/${wishlist.id}`}
        onClick={onClick}
        className="block focus:outline-none"
        aria-label={`Voir la liste ${wishlist.name}`}
      >
        {/* Preview Images Grid */}
        <div className="relative aspect-[4/3] bg-neutral-100 rounded-t-lg overflow-hidden">
          {wishlist.previewImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-0.5 h-full">
              {wishlist.previewImages.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative bg-neutral-100',
                    wishlist.previewImages.length === 1 && 'col-span-2 row-span-2',
                    wishlist.previewImages.length === 2 && 'row-span-2',
                    wishlist.previewImages.length === 3 && index === 0 && 'row-span-2'
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-neutral-500">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-caption">Aucun produit</p>
              </div>
            </div>
          )}

          {/* Default/Favorites Badge */}
          {wishlist.isDefault && wishlist.template === 'favorites' && (
            <div className="absolute top-2 left-2 p-1.5 rounded-full bg-red-500 text-white">
              <HeartIcon />
            </div>
          )}

          {/* Item Count Badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-caption font-medium">
            {wishlist.itemCount} article{wishlist.itemCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          {/* Title and Badges */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-sans text-body-sm font-medium text-neutral-900 line-clamp-1">
              {wishlist.name}
            </h3>
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
                getVisibilityColor(wishlist.visibility)
              )}
            >
              {getVisibilityIcon(wishlist.visibility)}
              <span className="sr-only md:not-sr-only">{getVisibilityLabel(wishlist.visibility)}</span>
            </div>
          </div>

          {/* Description */}
          {wishlist.description && (
            <p className="text-caption text-neutral-500 line-clamp-2 mb-3">
              {wishlist.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-caption text-neutral-500">
            <div className="flex items-center gap-3">
              {/* Estimated Total */}
              <span className="font-medium text-neutral-900">
                {formatCurrency(wishlist.estimatedTotal, wishlist.currency)}
              </span>

              {/* Collaborators Count */}
              {wishlist.collaboratorCount > 0 && (
                <span className="flex items-center gap-1">
                  <UsersIcon />
                  {wishlist.collaboratorCount}
                </span>
              )}
            </div>

            {/* Last Updated */}
            <span title={wishlist.updatedAt}>
              {formatRelativeDate(wishlist.updatedAt)}
            </span>
          </div>

          {/* Template Tag */}
          {wishlist.template !== 'custom' && wishlist.template !== 'favorites' && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-500">
                {getTemplateLabel(wishlist.template)}
              </span>
            </div>
          )}

          {/* Shared With Me Indicator */}
          {wishlist.isSharedWithMe && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <span className="text-caption text-neutral-500">
                Partage par {wishlist.lastUpdatedByName}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Quick Actions Menu (appears on hover) */}
      {!wishlist.isDefault && (onDuplicate || onShare || onDelete) && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              type="button"
              className={cn(
                'p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm',
                'hover:bg-white transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
              aria-label="Actions"
            >
              <MoreIcon />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-1 py-1 w-36 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {onDuplicate && (
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="w-full px-3 py-2 text-left text-body-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Dupliquer
                </button>
              )}
              {onShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full px-3 py-2 text-left text-body-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Partager
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-body-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
});

export default WishlistCard;
