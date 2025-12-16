'use client';

/**
 * HeaderActions Component
 *
 * Action buttons for the header: Wishlist, Quotes, Cart.
 * Uses feature gates to conditionally show/hide based on configuration.
 */

import { memo } from 'react';
import Link from 'next/link';
import { Heart, FileText, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubFeatureGate, ModuleGate } from '@/components/features/FeatureGate';

export interface HeaderActionsProps {
  /** Number of items in cart */
  cartCount?: number;
  /** Number of pending quotes */
  quotesCount?: number;
  /** Number of wishlist items */
  wishlistCount?: number;
  /** Additional CSS classes */
  className?: string;
}

interface ActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  ariaLabel: string;
  variant?: 'default' | 'primary';
}

const ActionButton = memo(function ActionButton({
  href,
  icon,
  label,
  count,
  ariaLabel,
  variant = 'default',
}: ActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-1.5 px-2 lg:px-3 py-2',
        'rounded-lg transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20',
        'group',
        variant === 'primary'
          ? 'text-amber-700 hover:text-amber-800 hover:bg-amber-50'
          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
      )}
      aria-label={ariaLabel}
    >
      {/* Icon with badge */}
      <div className="relative">
        {icon}
        {typeof count === 'number' && count > 0 && (
          <span
            className={cn(
              'absolute -top-1.5 -right-1.5',
              'flex items-center justify-center',
              'min-w-[18px] h-[18px] px-1',
              'text-[10px] font-bold text-white',
              'bg-amber-600 rounded-full',
              'transition-transform duration-200',
              'group-hover:scale-110'
            )}
            aria-label={`${count} ${label.toLowerCase()}`}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>

      {/* Label - hidden on smaller screens */}
      <span className="hidden xl:inline text-sm font-medium">{label}</span>
    </Link>
  );
});

ActionButton.displayName = 'ActionButton';

export const HeaderActions = memo(function HeaderActions({
  cartCount = 0,
  quotesCount = 0,
  wishlistCount = 0,
  className,
}: HeaderActionsProps) {
  return (
    <div className={cn('flex items-center gap-0.5 lg:gap-1', className)}>
      {/* Wishlist - Only show if lists.wishlist is enabled */}
      <SubFeatureGate module="lists" subFeature="wishlist">
        <ActionButton
          href="/compte/favoris"
          icon={
            <Heart
              className="w-5 h-5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          }
          label="Favoris"
          count={wishlistCount}
          ariaLabel={`Favoris${wishlistCount > 0 ? ` (${wishlistCount} articles)` : ''}`}
        />
      </SubFeatureGate>

      {/* Quotes - Only show if quotes module is enabled */}
      <ModuleGate module="quotes">
        <ActionButton
          href="/compte/devis"
          icon={
            <FileText
              className="w-5 h-5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          }
          label="Devis"
          count={quotesCount}
          ariaLabel={`Devis${quotesCount > 0 ? ` (${quotesCount} en attente)` : ''}`}
        />
      </ModuleGate>

      {/* Divider */}
      <div
        className="hidden lg:block w-px h-6 bg-neutral-200 mx-1"
        aria-hidden="true"
      />

      {/* Cart - Always visible */}
      <ActionButton
        href="/panier"
        icon={
          <ShoppingBag
            className="w-5 h-5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        }
        label="Panier"
        count={cartCount}
        ariaLabel={`Panier${cartCount > 0 ? ` (${cartCount} articles)` : ''}`}
        variant="primary"
      />
    </div>
  );
});

HeaderActions.displayName = 'HeaderActions';

export default HeaderActions;
