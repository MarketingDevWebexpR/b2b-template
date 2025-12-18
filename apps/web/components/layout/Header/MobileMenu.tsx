'use client';

/**
 * MobileMenu Component
 *
 * Full-screen mobile navigation drawer.
 * Features accordion-style category navigation and quick access links.
 */

import { memo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronDown,
  Home,
  Search,
  Heart,
  ShoppingBag,
  FileText,
  User,
  Building2,
  Package,
  Settings,
  LogOut,
  Phone,
  Mail,
  Gem,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useB2B } from '@/contexts';
import { useMockData } from '@/hooks/useMockData';
import { SubFeatureGate, ModuleGate } from '@/components/features/FeatureGate';

export interface MobileMenuProps {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Callback when menu should close */
  onClose: () => void;
  /** Cart item count */
  cartCount?: number;
  /** Quotes count */
  quotesCount?: number;
  /** Additional CSS classes */
  className?: string;
}

// Navigation categories
const mainCategories = [
  { id: 'catalogue', label: 'Catalogue', href: '/categorie', hasChildren: true },
  { id: 'marques', label: 'Marques', href: '/marques', hasChildren: false },
  { id: 'nouveautes', label: 'Nouveautes', href: '/nouveautes', hasChildren: false },
  { id: 'promotions', label: 'Promotions', href: '/promotions', hasChildren: false, highlight: true },
  { id: 'services', label: 'Services', href: '/services', hasChildren: false },
];

// Account links
const accountLinks = [
  { id: 'dashboard', label: 'Mon compte', href: '/compte', icon: User },
  { id: 'orders', label: 'Mes commandes', href: '/compte/commandes', icon: Package },
  { id: 'quotes', label: 'Mes devis', href: '/compte/devis', icon: FileText, module: 'quotes' as const },
  { id: 'favorites', label: 'Mes favoris', href: '/compte/favoris', icon: Heart, subFeature: 'wishlist' as const },
  { id: 'settings', label: 'Parametres', href: '/compte/parametres', icon: Settings },
];

export const MobileMenu = memo(function MobileMenu({
  isOpen,
  onClose,
  cartCount = 0,
  quotesCount = 0,
  className,
}: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { employee, company } = useB2B();
  const { catalog, company: mockCompany } = useMockData();

  const displayCompany = company || mockCompany.currentCompany;
  const displayUser = employee || mockCompany.currentUser;

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset expanded category when menu closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedCategory(null);
    }
  }, [isOpen]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!mounted) return null;

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          id="mobile-menu"
          className={cn('fixed inset-0 z-50 lg:hidden', className)}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'absolute top-0 left-0 bottom-0 w-full max-w-sm',
              'bg-white shadow-2xl',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              {/* Logo */}
              <Link
                href="/"
                onClick={handleLinkClick}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
                  <Gem className="w-4 h-4 text-white" />
                </div>
                <span className="font-serif font-semibold text-neutral-900">
                  Maison Bijoux
                </span>
              </Link>

              {/* Close button */}
              <button
                onClick={onClose}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20'
                )}
                aria-label="Fermer le menu"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Company badge */}
            {displayCompany && (
              <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {displayCompany.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {displayUser?.firstName} {displayUser?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Quick actions */}
              <div className="px-4 py-3 border-b border-neutral-100">
                <div className="grid grid-cols-3 gap-2">
                  {/* Cart */}
                  <Link
                    href="/panier"
                    onClick={handleLinkClick}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl',
                      'bg-amber-50 text-amber-700',
                      'hover:bg-amber-100 transition-colors'
                    )}
                  >
                    <div className="relative">
                      <ShoppingBag className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-amber-600 text-white rounded-full flex items-center justify-center">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium">Panier</span>
                  </Link>

                  {/* Quotes */}
                  <ModuleGate module="quotes">
                    <Link
                      href="/compte/devis"
                      onClick={handleLinkClick}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl',
                        'bg-neutral-50 text-neutral-600',
                        'hover:bg-neutral-100 transition-colors'
                      )}
                    >
                      <div className="relative">
                        <FileText className="w-5 h-5" />
                        {quotesCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-neutral-600 text-white rounded-full flex items-center justify-center">
                            {quotesCount > 9 ? '9+' : quotesCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium">Devis</span>
                    </Link>
                  </ModuleGate>

                  {/* Favorites */}
                  <SubFeatureGate module="lists" subFeature="wishlist">
                    <Link
                      href="/compte/favoris"
                      onClick={handleLinkClick}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl',
                        'bg-neutral-50 text-neutral-600',
                        'hover:bg-neutral-100 transition-colors'
                      )}
                    >
                      <Heart className="w-5 h-5" />
                      <span className="text-xs font-medium">Favoris</span>
                    </Link>
                  </SubFeatureGate>
                </div>
              </div>

              {/* Main navigation */}
              <nav className="p-4" aria-label="Navigation principale">
                <ul className="space-y-1">
                  {mainCategories.map((category) => (
                    <li key={category.id}>
                      {category.hasChildren ? (
                        // Expandable category
                        <div>
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-3 rounded-lg',
                              'text-sm font-medium',
                              'transition-colors duration-200',
                              expandedCategory === category.id
                                ? 'bg-neutral-100 text-neutral-900'
                                : 'text-neutral-700 hover:bg-neutral-50'
                            )}
                            aria-expanded={expandedCategory === category.id}
                          >
                            <span>{category.label}</span>
                            <ChevronDown
                              className={cn(
                                'w-4 h-4 transition-transform duration-200',
                                expandedCategory === category.id && 'rotate-180'
                              )}
                            />
                          </button>

                          {/* Subcategories */}
                          <AnimatePresence>
                            {expandedCategory === category.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <ul className="pl-4 py-2 space-y-1">
                                  {catalog.parentCategories.slice(0, 6).map((subCategory) => (
                                    <li key={subCategory.id}>
                                      <Link
                                        href={`/categorie/${subCategory.slug}`}
                                        onClick={handleLinkClick}
                                        className={cn(
                                          'flex items-center justify-between px-3 py-2 rounded-lg',
                                          'text-sm text-neutral-600',
                                          'hover:bg-neutral-50 hover:text-neutral-900',
                                          'transition-colors duration-150'
                                        )}
                                      >
                                        <span>{subCategory.name}</span>
                                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                                      </Link>
                                    </li>
                                  ))}
                                  <li>
                                    <Link
                                      href="/categorie"
                                      onClick={handleLinkClick}
                                      className={cn(
                                        'flex items-center gap-1 px-3 py-2',
                                        'text-sm font-medium text-amber-700',
                                        'hover:text-amber-800 transition-colors'
                                      )}
                                    >
                                      <span>Voir tout</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </Link>
                                  </li>
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        // Simple link
                        <Link
                          href={category.href}
                          onClick={handleLinkClick}
                          className={cn(
                            'flex items-center gap-2 px-3 py-3 rounded-lg',
                            'text-sm font-medium',
                            'transition-colors duration-200',
                            category.highlight
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          )}
                        >
                          {category.highlight && (
                            <Sparkles className="w-4 h-4" />
                          )}
                          <span>{category.label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Divider */}
              <div className="mx-4 border-t border-neutral-100" />

              {/* Account links */}
              <nav className="p-4" aria-label="Mon compte">
                <h3 className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Mon compte
                </h3>
                <ul className="space-y-1">
                  {accountLinks.map((link) => {
                    const IconComponent = link.icon;
                    const linkContent = (
                      <Link
                        href={link.href}
                        onClick={handleLinkClick}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                          'text-sm text-neutral-700',
                          'hover:bg-neutral-50 hover:text-neutral-900',
                          'transition-colors duration-150'
                        )}
                      >
                        <IconComponent className="w-4.5 h-4.5 text-neutral-400" />
                        <span>{link.label}</span>
                      </Link>
                    );

                    if (link.module) {
                      return (
                        <ModuleGate key={link.id} module={link.module}>
                          <li>{linkContent}</li>
                        </ModuleGate>
                      );
                    }

                    if (link.subFeature) {
                      return (
                        <SubFeatureGate
                          key={link.id}
                          module="lists"
                          subFeature={link.subFeature}
                        >
                          <li>{linkContent}</li>
                        </SubFeatureGate>
                      );
                    }

                    return <li key={link.id}>{linkContent}</li>;
                  })}
                </ul>
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 bg-neutral-50">
              {/* Contact */}
              <div className="px-4 py-3">
                <p className="text-xs text-neutral-500 mb-2">Besoin d&apos;aide ?</p>
                <div className="flex items-center gap-4">
                  <a
                    href="tel:+33140123456"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-amber-700"
                  >
                    <Phone className="w-4 h-4" />
                    <span>01 40 12 34 56</span>
                  </a>
                  <a
                    href="mailto:pro@maisonbijoux.fr"
                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-amber-700"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* Logout */}
              <div className="px-4 py-3 border-t border-neutral-200">
                <button
                  onClick={() => {
                    onClose();
                    // Handle logout
                  }}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
                    'text-sm font-medium text-red-600',
                    'bg-red-50 hover:bg-red-100',
                    'transition-colors duration-150'
                  )}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se deconnecter</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(menuContent, document.body);
});

MobileMenu.displayName = 'MobileMenu';

export default MobileMenu;
