'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, ShoppingBag, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoText } from './Logo';
import type { NavItem, Category } from '@/types';

// API URL for fetching categories
const API_BASE_URL = process.env.NEXT_PUBLIC_SAGE_API_URL || 'https://sage-portal.webexpr.dev/api';

// Base navigation items (without dynamic categories)
const baseNavigationItems: NavItem[] = [
  { label: 'Accueil', href: '/' },
  {
    label: 'Collections',
    href: '/collections',
    children: [], // Will be populated dynamically
  },
  { label: 'Notre Histoire', href: '/notre-histoire' },
  { label: 'Contact', href: '/contact' },
];

interface MobileMenuProps {
  className?: string;
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${API_BASE_URL}/sage/families`);
        if (response.ok) {
          const families = await response.json();
          // Map Sage families to categories (only leaf categories with type 0)
          const mappedCategories: Category[] = families
            .filter((f: { TypeFamille: number }) => f.TypeFamille === 0)
            .map((f: { CodeFamille: string; Intitule: string }) => ({
              id: f.CodeFamille,
              code: f.CodeFamille,
              name: f.Intitule,
              slug: f.Intitule
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, ''),
              description: f.Intitule,
              image: '/images/placeholder-category.svg',
              productCount: 0,
            }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories for mobile menu:', error);
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

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setExpandedItem(null);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleExpanded = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Animation variants - refined for luxury feel
  const menuVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 35,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 35,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.06,
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  const childVariants = {
    closed: { height: 0, opacity: 0 },
    open: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
        opacity: { duration: 0.25, delay: 0.1 },
      },
    },
  };

  return (
    <div className={cn('lg:hidden', className)}>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className={cn(
          'relative z-50 p-2 rounded-full',
          'text-text-secondary hover:text-text-primary',
          'hover:bg-background-warm',
          'transition-all duration-300 ease-luxe',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-luxe-charcoal/20'
        )}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <X className="w-5 h-5" strokeWidth={1.25} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Menu className="w-5 h-5" strokeWidth={1.25} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 bg-luxe-charcoal/15 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              'fixed top-0 right-0 z-40 h-full w-full max-w-sm',
              'bg-luxe-cream',
              'flex flex-col',
              'border-l border-border-light'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
              <LogoText size="sm" variant="dark" />
              {/* Close button handled by hamburger toggle */}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-8 px-6" role="navigation">
              <ul className="space-y-1">
                {navigationItems.map((item, index) => (
                  <motion.li
                    key={item.label}
                    custom={index}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => toggleExpanded(item.label)}
                          className={cn(
                            'w-full flex items-center justify-between py-4',
                            'font-sans text-[12px] uppercase tracking-luxe',
                            'text-text-muted hover:text-text-primary',
                            'transition-colors duration-300 ease-luxe',
                            isActive(item.href) && 'text-text-primary'
                          )}
                          aria-expanded={expandedItem === item.label}
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              'w-3.5 h-3.5 transition-transform duration-350 ease-luxe',
                              expandedItem === item.label && 'rotate-180'
                            )}
                            strokeWidth={1.25}
                          />
                        </button>

                        <AnimatePresence>
                          {expandedItem === item.label && (
                            <motion.ul
                              variants={childVariants}
                              initial="closed"
                              animate="open"
                              exit="closed"
                              className="overflow-hidden pl-4 border-l border-border-light ml-2 mb-2"
                            >
                              <li>
                                <Link
                                  href={item.href}
                                  className={cn(
                                    'block py-3 font-sans text-[11px] uppercase tracking-elegant',
                                    'text-text-primary hover:text-text-muted',
                                    'transition-colors duration-250 ease-luxe'
                                  )}
                                >
                                  Toutes les collections
                                </Link>
                              </li>
                              {item.children.map((child) => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    className={cn(
                                      'block py-3 font-sans text-[11px] uppercase tracking-elegant',
                                      'text-text-light hover:text-text-primary',
                                      'transition-colors duration-250 ease-luxe',
                                      pathname === child.href && 'text-text-primary'
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          'block py-4 font-sans text-[12px] uppercase tracking-luxe',
                          'text-text-muted hover:text-text-primary',
                          'transition-colors duration-300 ease-luxe',
                          isActive(item.href) && 'text-text-primary'
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border-light space-y-3">
              {/* Search */}
              <Link
                href="/recherche"
                className={cn(
                  'flex items-center gap-4 py-3 px-4',
                  'text-text-muted hover:text-text-primary',
                  'transition-all duration-300 ease-luxe',
                  'border border-border-light hover:border-border-medium'
                )}
              >
                <Search className="w-4 h-4" strokeWidth={1.25} />
                <span className="font-sans text-[10px] uppercase tracking-luxe">Rechercher</span>
              </Link>

              {/* Account */}
              <Link
                href="/compte"
                className={cn(
                  'flex items-center gap-4 py-3 px-4',
                  'text-text-muted hover:text-text-primary',
                  'transition-all duration-300 ease-luxe',
                  'border border-border-light hover:border-border-medium'
                )}
              >
                <User className="w-4 h-4" strokeWidth={1.25} />
                <span className="font-sans text-[10px] uppercase tracking-luxe">Mon Compte</span>
              </Link>

              {/* Cart */}
              <Link
                href="/panier"
                className={cn(
                  'flex items-center gap-4 py-3 px-4',
                  'bg-luxe-charcoal text-text-inverse',
                  'hover:bg-luxe-noir',
                  'transition-all duration-300 ease-luxe'
                )}
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.25} />
                <span className="font-sans text-[10px] uppercase tracking-luxe">Panier</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
