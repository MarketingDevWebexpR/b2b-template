'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnnouncement } from '@/contexts/AnnouncementContext';
import type { NavItem, Category } from '@/types';

// Height of announcement bar in pixels
const ANNOUNCEMENT_BAR_HEIGHT = 40;

// Base navigation items (without dynamic categories)
const baseNavigationItems: NavItem[] = [
  { label: 'Accueil', href: '/' },
  {
    label: 'Collections',
    href: '/collections',
    children: [], // Will be populated dynamically
  },
  { label: 'Notre Histoire', href: '/notre-histoire' },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isVisible: isAnnouncementVisible } = useAnnouncement();

  // Fetch categories from internal API route (avoids CORS issues on Vercel)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories', {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          // Handle both array response and object with error
          const categoriesData = Array.isArray(data) ? data : [];
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to fetch categories for navigation:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Build navigation items with dynamic categories
  const navigationItems: NavItem[] = baseNavigationItems.map((item) => {
    if (item.label === 'Collections') {
      return {
        ...item,
        children: categories.map((cat) => ({
          label: cat.name,
          href: `/collections/${cat.slug}`,
        })),
      };
    }
    return item;
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, item: NavItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (item.children) {
        e.preventDefault();
        setOpenDropdown(openDropdown === item.label ? null : item.label);
      }
    } else if (e.key === 'Escape') {
      setOpenDropdown(null);
    }
  };

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={cn('hidden lg:flex items-center gap-8 xl:gap-10', className)}
        role="navigation"
        aria-label="Navigation principale"
      >
        {navigationItems.map((item) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => item.children && handleMouseEnter(item.label)}
            onMouseLeave={handleMouseLeave}
          >
            {item.children ? (
              <button
                className={cn(
                  'flex items-center gap-1.5',
                  'font-sans text-[11px] font-medium uppercase tracking-luxe',
                  'transition-all duration-350 ease-luxe',
                  'text-text-muted hover:text-text-primary',
                  'relative py-2',
                  // Elegant underline effect on hover
                  'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px',
                  'after:bg-luxe-charcoal after:transition-all after:duration-350 after:ease-luxe',
                  'hover:after:w-full',
                  (isActive(item.href) || openDropdown === item.label) && 'text-text-primary after:w-full'
                )}
                onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                aria-expanded={openDropdown === item.label}
                aria-haspopup="true"
              >
                {item.label}
                <ChevronDown
                  className={cn(
                    'w-3 h-3 transition-transform duration-350 ease-luxe',
                    openDropdown === item.label && 'rotate-180'
                  )}
                  strokeWidth={1.25}
                />
              </button>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'font-sans text-[11px] font-medium uppercase tracking-luxe',
                  'transition-all duration-350 ease-luxe',
                  'text-text-muted hover:text-text-primary',
                  'relative py-2',
                  // Elegant underline animation
                  'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px',
                  'after:bg-luxe-charcoal after:transition-all after:duration-350 after:ease-luxe',
                  'hover:after:w-full',
                  isActive(item.href) && 'text-text-primary after:w-full'
                )}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Mega Menu - Full Width Overlay */}
      <AnimatePresence>
        {openDropdown === 'Collections' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-0 right-0 z-40"
            style={{ top: isAnnouncementVisible ? `calc(52px + ${ANNOUNCEMENT_BAR_HEIGHT}px)` : '52px' }}
            onMouseEnter={() => handleMouseEnter('Collections')}
            onMouseLeave={handleMouseLeave}
          >
            {/* Backdrop - covers everything below header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-luxe-charcoal/40 backdrop-blur-sm"
              style={{ top: isAnnouncementVisible ? `calc(52px + ${ANNOUNCEMENT_BAR_HEIGHT}px)` : '52px' }}
              onClick={() => setOpenDropdown(null)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10 bg-luxe-white shadow-elegant-lg"
            >
              <div className="container mx-auto px-6 lg:px-12 py-5">
                <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left Section - Header & CTA */}
                  <div className="col-span-12 lg:col-span-3 xl:col-span-3 flex flex-col justify-center">
                    <span className="text-[10px] font-medium uppercase tracking-luxe text-hermes-500">
                      Explorez
                    </span>
                    <h3 className="mt-2 font-serif text-2xl lg:text-3xl text-text-primary">
                      Nos Collections
                    </h3>
                    <p className="mt-3 text-sm text-text-muted leading-relaxed">
                      Découvrez nos créations d'exception, façonnées par nos maîtres artisans.
                    </p>

                    {/* View All CTA */}
                    <Link
                      href="/collections"
                      className="mt-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-luxe text-hermes-500 hover:text-hermes-600 transition-colors group"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Toutes les collections
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
                    </Link>
                  </div>

                  {/* Right Section - Categories Grid */}
                  <div className="col-span-12 lg:col-span-9 xl:col-span-9 flex items-center">
                    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1">
                      {categories.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.05 + index * 0.02 }}
                        >
                          <Link
                            href={`/collections/${category.slug}`}
                            className="group block py-2.5 border-b border-border-light hover:border-hermes-500 transition-colors duration-300"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <span className="block font-sans text-sm text-text-primary group-hover:text-hermes-500 transition-colors duration-300">
                              {category.name}
                            </span>
                          </Link>
                        </motion.div>
                      ))}

                      {/* Loading State */}
                      {isLoading && (
                        <div className="flex items-center gap-2 text-text-muted col-span-full">
                          <div className="w-4 h-4 border-2 border-hermes-500/30 border-t-hermes-500 rounded-full animate-spin" />
                          <span className="text-sm">Chargement...</span>
                        </div>
                      )}

                      {/* Empty State */}
                      {!isLoading && categories.length === 0 && (
                        <p className="text-sm text-text-muted col-span-full">Aucune collection disponible.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative bottom line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
