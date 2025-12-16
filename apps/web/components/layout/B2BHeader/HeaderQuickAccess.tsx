'use client';

/**
 * HeaderQuickAccess Component
 *
 * Quick access icons for B2B header actions.
 * Displays cart, quotes, and orders with notification badges.
 *
 * Features:
 * - Cart with item count
 * - Quotes with pending count
 * - Orders with active count
 * - User account dropdown
 */

import { memo } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  FileText,
  Package,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useB2B } from '@/contexts';

export interface HeaderQuickAccessProps {
  /** Additional CSS classes */
  className?: string;
  /** Number of items in cart */
  cartCount?: number;
  /** Number of pending quotes */
  quotesCount?: number;
  /** Number of active orders */
  ordersCount?: number;
}

interface QuickAccessButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  ariaLabel: string;
  showLabel?: boolean;
}

const QuickAccessButton = memo(function QuickAccessButton({
  href,
  icon,
  label,
  count,
  ariaLabel,
  showLabel = true,
}: QuickAccessButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-1.5 px-2.5 py-2',
        'text-neutral-600 hover:text-accent',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 rounded-lg',
        'group'
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
              'text-[10px] font-semibold text-white',
              'bg-accent rounded-full',
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
      {showLabel && (
        <span className="hidden lg:inline text-sm font-medium">
          {label}
        </span>
      )}
    </Link>
  );
});

QuickAccessButton.displayName = 'QuickAccessButton';

export const HeaderQuickAccess = memo(function HeaderQuickAccess({
  className,
  cartCount = 0,
  quotesCount = 0,
  ordersCount = 0,
}: HeaderQuickAccessProps) {
  const { employee, company } = useB2B();

  // Mock counts if not provided and B2B context has data
  const displayCartCount = cartCount;
  const displayQuotesCount = quotesCount || 3; // Mock pending quotes
  const displayOrdersCount = ordersCount || 12; // Mock active orders

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        className
      )}
    >
      {/* Quotes */}
      <QuickAccessButton
        href="/compte/devis"
        icon={
          <FileText
            className="w-5 h-5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        }
        label="Devis"
        count={displayQuotesCount}
        ariaLabel={`Devis (${displayQuotesCount} en attente)`}
      />

      {/* Orders */}
      <QuickAccessButton
        href="/compte/commandes"
        icon={
          <Package
            className="w-5 h-5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        }
        label="Commandes"
        count={displayOrdersCount}
        ariaLabel={`Commandes (${displayOrdersCount} en cours)`}
      />

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-neutral-200 mx-1" aria-hidden="true" />

      {/* Cart */}
      <QuickAccessButton
        href="/panier"
        icon={
          <ShoppingCart
            className="w-5 h-5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        }
        label="Panier"
        count={displayCartCount}
        ariaLabel={`Panier (${displayCartCount} articles)`}
        showLabel={false}
      />

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-neutral-200 mx-1" aria-hidden="true" />

      {/* User Account */}
      <Link
        href="/compte"
        className={cn(
          'flex items-center gap-2 px-2.5 py-2',
          'text-neutral-600 hover:text-accent',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 rounded-lg',
          'group'
        )}
        aria-label="Mon compte"
      >
        {/* User icon or avatar */}
        <div className="relative flex items-center justify-center w-8 h-8 bg-neutral-50 rounded-full border border-neutral-200 group-hover:border-neutral-300 transition-colors">
          <User
            className="w-4 h-4 text-neutral-500 group-hover:text-accent"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        {/* User info - hidden on mobile */}
        <div className="hidden lg:flex flex-col items-start">
          <span className="text-sm font-medium text-neutral-900">
            {employee?.firstName || 'Mon compte'}
          </span>
          <span className="text-xs text-neutral-500 truncate max-w-[120px]">
            {company?.tradeName || company?.name || 'Se connecter'}
          </span>
        </div>

        {/* Dropdown chevron */}
        <ChevronDown
          className="hidden lg:block w-4 h-4 text-neutral-500"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
});

HeaderQuickAccess.displayName = 'HeaderQuickAccess';

export default HeaderQuickAccess;
