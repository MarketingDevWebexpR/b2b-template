'use client';

/**
 * MegaMenu Component
 *
 * Full-width dropdown menu with 3-level category navigation.
 * Displays on hover over "Categories" in the header navigation.
 *
 * Features:
 * - 3 category columns with subcategories
 * - Featured products column
 * - Smooth open/close animations
 * - Keyboard accessible
 * - Click outside to close
 */

import {
  memo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MegaMenuColumn } from './MegaMenuColumn';
import { MegaMenuFeatured } from './MegaMenuFeatured';
import { mockCategories, mockFeaturedProducts, mockNavLinks } from '../mockData';
import type { Category } from '../mockData';

export interface MegaMenuProps {
  /** Additional CSS classes */
  className?: string;
  /** Categories to display (defaults to mock data) */
  categories?: Category[];
}

export const MegaMenu = memo(function MegaMenu({
  className,
  categories = mockCategories,
}: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  const handleTriggerClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleLinkClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          setIsOpen((prev) => !prev);
          break;
        case 'ArrowDown':
          if (!isOpen) {
            event.preventDefault();
            setIsOpen(true);
          }
          break;
      }
    },
    [isOpen]
  );

  // Select first 3 categories for display
  const displayCategories = categories.slice(0, 3);

  return (
    <nav className={cn('relative', className)} aria-label="Navigation principale">
      <div className="flex items-center gap-1">
        {/* Categories trigger */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            ref={triggerRef}
            onClick={handleTriggerClick}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5',
              'bg-neutral-900 text-white rounded-lg',
              'hover:bg-neutral-800',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/50',
              isOpen && 'bg-neutral-800'
            )}
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-controls="mega-menu-dropdown"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-medium text-sm">Categories</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Other nav links */}
        {mockNavLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className={cn(
              'px-4 py-2.5',
              'text-sm font-medium',
              link.highlight
                ? 'text-accent hover:text-orange-600'
                : 'text-neutral-600 hover:text-neutral-900',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:text-accent'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mega menu dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          id="mega-menu-dropdown"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'absolute left-0 top-full mt-2 z-50',
            'w-[calc(100vw-4rem)] max-w-6xl',
            'bg-white border border-neutral-200 rounded-xl shadow-xl',
            'animate-fade-in-down'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {/* Close button (mobile) */}
          <button
            onClick={() => setIsOpen(false)}
            className={cn(
              'absolute top-4 right-4 md:hidden',
              'p-2 rounded-lg',
              'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20'
            )}
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="flex">
            {/* Category columns */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {displayCategories.map((category) => (
                <MegaMenuColumn
                  key={category.id}
                  category={category}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>

            {/* Featured products */}
            <div className="hidden lg:block w-80 border-l border-neutral-200">
              <MegaMenuFeatured
                products={mockFeaturedProducts}
                title="A la une"
                onLinkClick={handleLinkClick}
                className="h-full rounded-none rounded-r-xl"
              />
            </div>
          </div>

          {/* Bottom bar with all categories link */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
            <Link
              href="/categories"
              className={cn(
                'inline-flex items-center gap-2',
                'text-sm font-medium text-accent',
                'hover:text-orange-600 transition-colors duration-150',
                'focus:outline-none focus-visible:underline'
              )}
              onClick={handleLinkClick}
            >
              <span>Voir toutes les categories</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              {categories.slice(3, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className={cn(
                    'text-sm text-neutral-600',
                    'hover:text-accent transition-colors duration-150',
                    'focus:outline-none focus-visible:text-accent'
                  )}
                  onClick={handleLinkClick}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

MegaMenu.displayName = 'MegaMenu';

export default MegaMenu;
