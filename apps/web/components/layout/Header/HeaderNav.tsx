'use client';

/**
 * HeaderNav Component
 *
 * Main navigation bar with MegaMenu triggers.
 * Shows categories, brands, promotions and other main links.
 */

import { memo, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, Sparkles, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderNavProps {
  /** Currently active megamenu section */
  activeMegaMenu: string | null;
  /** Callback when megamenu should open */
  onMegaMenuOpen: (itemId: string | null) => void;
  /** Callback when megamenu should close */
  onMegaMenuClose: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Navigation items configuration
const navItems = [
  {
    id: 'catalogue',
    label: 'Catalogue',
    hasMegaMenu: true,
  },
  {
    id: 'marques',
    label: 'Marques',
    hasMegaMenu: true,
  },
  {
    id: 'nouveautes',
    label: 'Nouveautes',
    href: '/nouveautes',
    hasMegaMenu: false,
  },
  {
    id: 'promotions',
    label: 'Promotions',
    href: '/promotions',
    hasMegaMenu: false,
    highlight: true,
  },
  {
    id: 'services',
    label: 'Services',
    hasMegaMenu: true,
  },
];

interface NavItemProps {
  id: string;
  label: string;
  href?: string;
  hasMegaMenu: boolean;
  highlight?: boolean;
  isActive: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

const NavItem = memo(function NavItem({
  id,
  label,
  href,
  hasMegaMenu,
  highlight,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: NavItemProps) {
  const handleMouseEnter = useCallback(() => {
    if (hasMegaMenu) {
      onMouseEnter(id);
    }
  }, [hasMegaMenu, id, onMouseEnter]);

  const baseClasses = cn(
    'flex items-center gap-1.5 px-4 py-2.5',
    'text-sm font-medium',
    'rounded-lg transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20'
  );

  const stateClasses = highlight
    ? cn(
        'text-amber-700',
        isActive
          ? 'bg-amber-50'
          : 'hover:bg-amber-50 hover:text-amber-800'
      )
    : cn(
        'text-neutral-600',
        isActive
          ? 'bg-neutral-100 text-neutral-900'
          : 'hover:bg-neutral-50 hover:text-neutral-900'
      );

  const content = (
    <>
      {highlight && (
        <Sparkles className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
      )}
      <span>{label}</span>
      {hasMegaMenu && (
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isActive && 'rotate-180'
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href && !hasMegaMenu) {
    return (
      <Link
        href={href}
        className={cn(baseClasses, stateClasses)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn(baseClasses, stateClasses)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-expanded={isActive}
      aria-haspopup={hasMegaMenu}
    >
      {content}
    </button>
  );
});

NavItem.displayName = 'NavItem';

export const HeaderNav = memo(function HeaderNav({
  activeMegaMenu,
  onMegaMenuOpen,
  onMegaMenuClose,
  className,
}: HeaderNavProps) {
  return (
    <nav
      className={cn('flex items-center justify-between py-1', className)}
      aria-label="Navigation principale"
    >
      {/* Main navigation items */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            href={item.href}
            hasMegaMenu={item.hasMegaMenu}
            highlight={item.highlight}
            isActive={activeMegaMenu === item.id}
            onMouseEnter={onMegaMenuOpen}
            onMouseLeave={onMegaMenuClose}
          />
        ))}
      </div>

      {/* Right side: Contact */}
      <div className="flex items-center gap-4">
        {/* Phone number */}
        <a
          href="tel:+33140123456"
          className={cn(
            'hidden xl:flex items-center gap-2 px-3 py-2',
            'text-sm font-medium text-neutral-600',
            'hover:text-amber-700 transition-colors duration-200'
          )}
        >
          <Phone className="w-4 h-4" strokeWidth={1.5} />
          <span>01 40 12 34 56</span>
        </a>

        {/* Express delivery badge */}
        <div
          className={cn(
            'hidden lg:flex items-center gap-2 px-3 py-1.5',
            'bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full'
          )}
        >
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Livraison Express 24h</span>
        </div>
      </div>
    </nav>
  );
});

HeaderNav.displayName = 'HeaderNav';

export default HeaderNav;
