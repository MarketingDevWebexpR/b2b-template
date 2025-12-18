'use client';

/**
 * NavBar Component (Level 1)
 *
 * Static horizontal navigation bar with:
 * - "Catalogue" button that opens the MegaMenu dropdown
 * - Static links for Promotions, Nouveautes, Contact
 * - Phone number display on the right
 *
 * Design inspired by Leroy Merlin navigation style.
 */

import { memo, useCallback, useRef, forwardRef } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Building2,
  Tag,
  Sparkles,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryLevel1 } from './types';

/** Special ID used to identify the Catalogue button */
export const CATALOGUE_ID = 'catalogue';
/** Special ID used to identify the Marques button */
export const MARQUES_ID = 'marques';

export interface NavBarProps {
  /** Root categories to display in MegaMenu (passed through for compatibility) */
  categories: CategoryLevel1[];
  /** Currently active (hovered) category ID */
  activeCategory: string | null;
  /** Callback when a category is hovered */
  onCategoryHover: (categoryId: string | null) => void;
  /** Callback when a category is clicked */
  onCategoryClick: (categoryId: string) => void;
  /** Whether the dropdown is open */
  isDropdownOpen: boolean;
  /** Currently active panel (catalogue or marques) */
  activePanel: 'catalogue' | 'marques' | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation item configuration
 */
interface NavItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  isCatalogueButton?: boolean;
  isMarquesButton?: boolean;
}

/**
 * Static navigation items configuration
 */
const NAV_ITEMS: NavItemConfig[] = [
  {
    id: CATALOGUE_ID,
    label: 'Catalogue',
    icon: LayoutGrid,
    isCatalogueButton: true,
  },
  {
    id: MARQUES_ID,
    label: 'Marques',
    icon: Building2,
    isMarquesButton: true,
  },
  {
    id: 'promotions',
    label: 'Promotions',
    icon: Tag,
    href: '/promotions',
  },
  {
    id: 'nouveautes',
    label: 'Nouveautés',
    icon: Sparkles,
    href: '/nouveautes',
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: Phone,
    href: '/contact',
  },
];

/**
 * Props for the CatalogueButton component
 */
interface CatalogueButtonProps {
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Catalogue button that triggers the MegaMenu dropdown
 */
const CatalogueButton = memo(
  forwardRef<HTMLButtonElement, CatalogueButtonProps>(function CatalogueButton(
    { isActive, onMouseEnter, onMouseLeave, onClick, onKeyDown },
    ref
  ) {
    return (
      <li role="none">
        <button
          ref={ref}
          type="button"
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={isActive}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          onKeyDown={onKeyDown}
          className={cn(
            // Base styles
            'group relative flex items-center gap-2 px-4 py-3',
            'text-sm font-semibold',
            'transition-all duration-150 ease-out',
            // Default state
            'text-neutral-700 hover:text-neutral-900',
            // Active/hover state with amber background
            isActive && 'text-amber-700 bg-amber-50',
            !isActive && 'hover:bg-neutral-50',
            // Focus visible
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset',
            // Border bottom indicator - full width
            'after:absolute after:bottom-0 after:left-0 after:right-0',
            'after:h-[3px] after:bg-amber-500',
            'after:scale-x-0 after:origin-center',
            'after:transition-transform after:duration-200',
            isActive && 'after:scale-x-100'
          )}
        >
          <LayoutGrid
            className={cn(
              'w-5 h-5 transition-colors duration-150',
              'text-neutral-500 group-hover:text-amber-600',
              isActive && 'text-amber-600'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">Catalogue</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-neutral-400',
              'transition-transform duration-200',
              isActive && 'rotate-180 text-amber-600'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      </li>
    );
  })
);

CatalogueButton.displayName = 'CatalogueButton';

/**
 * Props for the MarquesButton component
 */
interface MarquesButtonProps {
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Marques button that triggers the Brands panel
 */
const MarquesButton = memo(
  forwardRef<HTMLButtonElement, MarquesButtonProps>(function MarquesButton(
    { isActive, onMouseEnter, onMouseLeave, onClick, onKeyDown },
    ref
  ) {
    return (
      <li role="none">
        <button
          ref={ref}
          type="button"
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={isActive}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          onKeyDown={onKeyDown}
          className={cn(
            // Base styles
            'group relative flex items-center gap-2 px-4 py-3',
            'text-sm font-semibold',
            'transition-all duration-150 ease-out',
            // Default state
            'text-neutral-700 hover:text-neutral-900',
            // Active/hover state with amber background
            isActive && 'text-amber-700 bg-amber-50',
            !isActive && 'hover:bg-neutral-50',
            // Focus visible
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset',
            // Border bottom indicator - full width
            'after:absolute after:bottom-0 after:left-0 after:right-0',
            'after:h-[3px] after:bg-amber-500',
            'after:scale-x-0 after:origin-center',
            'after:transition-transform after:duration-200',
            isActive && 'after:scale-x-100'
          )}
        >
          <Building2
            className={cn(
              'w-5 h-5 transition-colors duration-150',
              'text-neutral-500 group-hover:text-amber-600',
              isActive && 'text-amber-600'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">Marques</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-neutral-400',
              'transition-transform duration-200',
              isActive && 'rotate-180 text-amber-600'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      </li>
    );
  })
);

MarquesButton.displayName = 'MarquesButton';

/**
 * Props for NavLink component
 */
interface NavLinkProps {
  item: NavItemConfig;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Static navigation link (Promotions, Nouveautes, Contact)
 */
const NavLink = memo(
  forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
    { item, onKeyDown },
    ref
  ) {
    const Icon = item.icon;

    return (
      <li role="none">
        <Link
          ref={ref}
          href={item.href || '#'}
          role="menuitem"
          onKeyDown={onKeyDown}
          className={cn(
            // Base styles
            'group relative flex items-center gap-2 px-4 py-3',
            'text-sm font-medium',
            'transition-all duration-150 ease-out',
            // Default state
            'text-neutral-700 hover:text-neutral-900',
            'hover:bg-neutral-50',
            // Focus visible
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset',
            // Border bottom indicator on hover
            'after:absolute after:bottom-0 after:left-4 after:right-4',
            'after:h-0.5 after:bg-amber-600',
            'after:scale-x-0 after:origin-left',
            'after:transition-transform after:duration-200',
            'hover:after:scale-x-100'
          )}
        >
          <Icon
            className={cn(
              'w-4 h-4 transition-colors duration-150',
              'text-neutral-500 group-hover:text-amber-600'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{item.label}</span>
        </Link>
      </li>
    );
  })
);

NavLink.displayName = 'NavLink';

/**
 * Phone number display component
 */
const PhoneDisplay = memo(function PhoneDisplay() {
  return (
    <a
      href="tel:+33123456789"
      className={cn(
        'flex items-center gap-2 px-4 py-3',
        'text-sm font-semibold text-neutral-700',
        'hover:text-amber-600 transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset rounded'
      )}
      aria-label="Appelez-nous au 01 23 45 67 89"
    >
      <Phone
        className="w-4 h-4 text-amber-600"
        strokeWidth={2}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">01 23 45 67 89</span>
    </a>
  );
});

PhoneDisplay.displayName = 'PhoneDisplay';

/**
 * NavBar renders the static horizontal navigation.
 * Features a Catalogue button that opens the MegaMenu,
 * plus static links for Promotions, Nouveautes, and Contact.
 *
 * @example
 * <NavBar
 *   categories={categories}
 *   activeCategory={activeL1}
 *   onCategoryHover={setActiveL1}
 *   onCategoryClick={handleL1Click}
 *   isDropdownOpen={isOpen}
 * />
 */
export const NavBar = memo(function NavBar({
  categories,
  activeCategory,
  onCategoryHover,
  onCategoryClick,
  isDropdownOpen,
  activePanel,
  className,
}: NavBarProps) {
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const setItemRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        itemRefs.current.set(id, el);
      } else {
        itemRefs.current.delete(id);
      }
    },
    []
  );

  /**
   * Handle keyboard navigation across all nav items
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, itemId: string) => {
      const items = NAV_ITEMS;
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = index < items.length - 1 ? index + 1 : 0;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = index > 0 ? index - 1 : items.length - 1;
          break;
        case 'ArrowDown':
          // Trigger dropdown for catalogue or marques button
          if (itemId === CATALOGUE_ID || itemId === MARQUES_ID) {
            e.preventDefault();
            onCategoryClick(itemId);
          }
          break;
        case 'Enter':
        case ' ':
          // Handle for catalogue and marques buttons, links navigate naturally
          if (itemId === CATALOGUE_ID || itemId === MARQUES_ID) {
            e.preventDefault();
            onCategoryClick(itemId);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onCategoryHover(null);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== null) {
        const nextItem = items[nextIndex];
        const nextRef = itemRefs.current.get(nextItem.id);
        nextRef?.focus();
      }
    },
    [onCategoryHover, onCategoryClick]
  );

  const isCatalogueActive = activePanel === 'catalogue' && isDropdownOpen;
  const isMarquesActive = activePanel === 'marques' && isDropdownOpen;

  return (
    <nav
      className={cn('bg-white border-b border-neutral-200', className)}
      aria-label="Navigation principale"
    >
      <div className="container-ecom flex items-center justify-between">
        {/* Left side: Navigation items */}
        <ul
          role="menubar"
          aria-label="Menu principal"
          className={cn(
            'flex items-center justify-start',
            'overflow-x-auto scrollbar-hide',
            '-mb-px' // Offset for border indicator
          )}
        >
          {NAV_ITEMS.map((item, index) => {
            if (item.isCatalogueButton) {
              return (
                <CatalogueButton
                  key={item.id}
                  ref={setItemRef(item.id) as React.Ref<HTMLButtonElement>}
                  isActive={isCatalogueActive}
                  onMouseEnter={() => onCategoryHover(CATALOGUE_ID)}
                  onMouseLeave={() => {}}
                  onClick={() => onCategoryClick(CATALOGUE_ID)}
                  onKeyDown={(e) => handleKeyDown(e, index, item.id)}
                />
              );
            }

            if (item.isMarquesButton) {
              return (
                <MarquesButton
                  key={item.id}
                  ref={setItemRef(item.id) as React.Ref<HTMLButtonElement>}
                  isActive={isMarquesActive}
                  onMouseEnter={() => onCategoryHover(MARQUES_ID)}
                  onMouseLeave={() => {}}
                  onClick={() => onCategoryClick(MARQUES_ID)}
                  onKeyDown={(e) => handleKeyDown(e, index, item.id)}
                />
              );
            }

            return (
              <NavLink
                key={item.id}
                ref={setItemRef(item.id) as React.Ref<HTMLAnchorElement>}
                item={item}
                onKeyDown={(e) => handleKeyDown(e, index, item.id)}
              />
            );
          })}
        </ul>

        {/* Right side: Phone number */}
        <div className="hidden md:flex items-center border-l border-neutral-200">
          <PhoneDisplay />
        </div>
      </div>
    </nav>
  );
});

NavBar.displayName = 'NavBar';

export default NavBar;
