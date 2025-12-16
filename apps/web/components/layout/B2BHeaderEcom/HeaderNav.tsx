'use client';

import { memo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Grid3X3, Tag, Sparkles, Truck, Gift, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  hasMegaMenu?: boolean;
  highlight?: boolean;
}

export interface HeaderNavProps {
  /** Navigation items */
  items?: NavItem[];
  /** Callback when a nav item with mega menu is hovered */
  onMegaMenuOpen?: (itemId: string | null) => void;
  /** Currently open mega menu item */
  activeMegaMenu?: string | null;
  /** Additional CSS classes */
  className?: string;
}

const defaultNavItems: NavItem[] = [
  {
    id: 'catalogue',
    label: 'Catalogue',
    href: '/categories',
    icon: <Grid3X3 className="w-4 h-4" />,
    hasMegaMenu: true,
  },
  {
    id: 'promotions',
    label: 'Promotions',
    href: '/categories?filter=promo',
    icon: <Tag className="w-4 h-4" />,
    highlight: true,
  },
  {
    id: 'nouveautes',
    label: 'Nouveautes',
    href: '/categories?sort=newest',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '/contact',
    icon: <Phone className="w-4 h-4" />,
  },
];

export const HeaderNav = memo(function HeaderNav({
  items = defaultNavItems,
  onMegaMenuOpen,
  activeMegaMenu,
  className,
}: HeaderNavProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(
    (item: NavItem) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (item.hasMegaMenu && onMegaMenuOpen) {
        onMegaMenuOpen(item.id);
      }
    },
    [onMegaMenuOpen]
  );

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (onMegaMenuOpen) {
        onMegaMenuOpen(null);
      }
    }, 150);
  }, [onMegaMenuOpen]);

  const handleFocus = useCallback(
    (item: NavItem) => {
      if (item.hasMegaMenu && onMegaMenuOpen) {
        onMegaMenuOpen(item.id);
      }
    },
    [onMegaMenuOpen]
  );

  return (
    <nav
      className={cn(
        'hidden lg:block bg-surface-nav border-b border-stroke-light',
        className
      )}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="container-ecom">
        <ul className="flex items-center gap-1 h-12">
          {items.map((item) => {
            const isActive = activeMegaMenu === item.id;
            const Component = item.href && !item.hasMegaMenu ? Link : 'button';

            return (
              <li key={item.id}>
                <Component
                  href={item.href || '#'}
                  onMouseEnter={() => handleMouseEnter(item)}
                  onMouseLeave={handleMouseLeave}
                  onFocus={() => handleFocus(item)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-md',
                    'text-nav font-medium',
                    'transition-colors duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                    item.highlight
                      ? 'text-accent hover:text-accent-600 hover:bg-accent-50'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary',
                    isActive && 'bg-surface-tertiary text-content-primary'
                  )}
                  aria-expanded={item.hasMegaMenu ? isActive : undefined}
                  aria-haspopup={item.hasMegaMenu ? 'menu' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.hasMegaMenu && (
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 ml-0.5 transition-transform duration-200',
                        isActive && 'rotate-180'
                      )}
                    />
                  )}
                </Component>
              </li>
            );
          })}

          {/* Spacer */}
          <li className="flex-1" />

          {/* Help link */}
          <li>
            <a
              href="tel:+33123456789"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md',
                'text-nav font-medium text-content-secondary',
                'hover:text-primary hover:bg-primary-50',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
              )}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline">01 23 45 67 89</span>
              <span className="xl:hidden">Aide</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
});

HeaderNav.displayName = 'HeaderNav';

export default HeaderNav;
