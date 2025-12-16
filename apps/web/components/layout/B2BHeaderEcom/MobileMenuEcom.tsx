'use client';

import { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  MapPin,
  User,
  FileText,
  Heart,
  ShoppingCart,
  Phone,
  Grid3X3,
  Tag,
  Sparkles,
  Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { catalogueMenu, marquesMenu, servicesMenu, type Category } from './MegaMenuEcom/menuData';

export interface MobileMenuEcomProps {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Callback when menu closes */
  onClose: () => void;
  /** Additional CSS classes */
  className?: string;
}

type MenuView = 'main' | 'catalogue' | 'marques' | 'services' | 'category';

interface MenuState {
  view: MenuView;
  category?: Category;
  parentView?: MenuView;
}

export const MobileMenuEcom = memo(function MobileMenuEcom({
  isOpen,
  onClose,
  className,
}: MobileMenuEcomProps) {
  const { selectedWarehouse } = useWarehouse();
  const [menuState, setMenuState] = useState<MenuState>({ view: 'main' });

  const handleNavigateToSection = useCallback((view: MenuView) => {
    setMenuState({ view, parentView: 'main' });
  }, []);

  const handleNavigateToCategory = useCallback((category: Category, parentView: MenuView) => {
    setMenuState({ view: 'category', category, parentView });
  }, []);

  const handleBack = useCallback(() => {
    if (menuState.view === 'category' && menuState.parentView) {
      setMenuState({ view: menuState.parentView });
    } else {
      setMenuState({ view: 'main' });
    }
  }, [menuState]);

  const handleClose = useCallback(() => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setMenuState({ view: 'main' });
    }, 300);
  }, [onClose]);

  const getMenuTitle = () => {
    switch (menuState.view) {
      case 'catalogue':
        return 'Catalogue';
      case 'marques':
        return 'Marques';
      case 'services':
        return 'Services Pro';
      case 'category':
        return menuState.category?.name || '';
      default:
        return 'Menu';
    }
  };

  const renderMainMenu = () => (
    <div className="flex flex-col h-full">
      {/* Warehouse selector */}
      <div className="p-4 border-b border-stroke-light">
        <button
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
            'bg-surface-secondary text-left',
            'hover:bg-surface-tertiary transition-colors duration-150'
          )}
        >
          <MapPin className="w-5 h-5 text-accent" />
          <div className="flex-1 min-w-0">
            <p className="text-caption text-content-muted">Point de vente</p>
            <p className="text-body font-medium text-content-primary truncate">
              {selectedWarehouse?.name || 'Selectionner'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-content-muted" />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto p-4" aria-label="Navigation mobile">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => handleNavigateToSection('catalogue')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <div className="flex items-center gap-3">
                <Grid3X3 className="w-5 h-5 text-content-muted" />
                <span>Catalogue</span>
              </div>
              <ChevronRight className="w-5 h-5 text-content-muted" />
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigateToSection('marques')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center text-content-muted font-bold text-sm">M</span>
                <span>Marques</span>
              </div>
              <ChevronRight className="w-5 h-5 text-content-muted" />
            </button>
          </li>
          <li>
            <Link
              href="/categories?filter=promo"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg',
                'text-body font-medium text-accent',
                'hover:bg-accent-50 transition-colors duration-150'
              )}
            >
              <Tag className="w-5 h-5" />
              <span>Promotions</span>
            </Link>
          </li>
          <li>
            <Link
              href="/categories?sort=newest"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <Sparkles className="w-5 h-5 text-content-muted" />
              <span>Nouveautes</span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => handleNavigateToSection('services')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-content-muted" />
                <span>Services Pro</span>
              </div>
              <ChevronRight className="w-5 h-5 text-content-muted" />
            </button>
          </li>
          <li>
            <Link
              href="/contact"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <Phone className="w-5 h-5 text-content-muted" />
              <span>Contact</span>
            </Link>
          </li>
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-stroke-light" />

        {/* Account links */}
        <ul className="space-y-1">
          <li>
            <Link
              href="/compte"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <User className="w-5 h-5 text-content-muted" />
              <span>Mon compte</span>
            </Link>
          </li>
          <li>
            <Link
              href="/devis"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <FileText className="w-5 h-5 text-content-muted" />
              <span>Mes devis</span>
            </Link>
          </li>
          <li>
            <Link
              href="/favoris"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <Heart className="w-5 h-5 text-content-muted" />
              <span>Mes favoris</span>
            </Link>
          </li>
          <li>
            <Link
              href="/panier"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg',
                'text-body font-medium text-content-primary',
                'hover:bg-surface-secondary transition-colors duration-150'
              )}
            >
              <ShoppingCart className="w-5 h-5 text-content-muted" />
              <span>Mon panier</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stroke-light bg-surface-secondary">
        <a
          href="tel:+33123456789"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
            'bg-primary text-white font-medium',
            'hover:bg-primary-600 transition-colors duration-150'
          )}
        >
          <Phone className="w-5 h-5" />
          <span>01 23 45 67 89</span>
        </a>
      </div>
    </div>
  );

  const renderCategoryList = (categories: Category[], parentView: MenuView) => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto p-4" aria-label={`Navigation ${getMenuTitle()}`}>
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => handleNavigateToCategory(category, parentView)}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-3 rounded-lg',
                  'text-body font-medium text-content-primary',
                  'hover:bg-surface-secondary transition-colors duration-150'
                )}
              >
                <span>{category.name}</span>
                <ChevronRight className="w-5 h-5 text-content-muted" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  const renderSubcategoryList = () => {
    if (!menuState.category) return null;

    return (
      <div className="flex flex-col h-full">
        <nav className="flex-1 overflow-y-auto p-4" aria-label={`Sous-categories ${menuState.category.name}`}>
          <Link
            href={menuState.category.href}
            onClick={handleClose}
            className={cn(
              'flex items-center justify-between px-3 py-3 mb-2 rounded-lg',
              'text-body font-semibold text-primary',
              'bg-primary-50 hover:bg-primary-100 transition-colors duration-150'
            )}
          >
            <span>Voir tout {menuState.category.name}</span>
            <ChevronRight className="w-5 h-5" />
          </Link>

          <ul className="space-y-1">
            {menuState.category.subcategories.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={sub.href}
                  onClick={handleClose}
                  className={cn(
                    'flex items-center justify-between px-3 py-3 rounded-lg',
                    'text-body text-content-secondary',
                    'hover:bg-surface-secondary hover:text-content-primary transition-colors duration-150'
                  )}
                >
                  <span>{sub.name}</span>
                  {sub.count && (
                    <span className="text-caption text-content-muted">({sub.count})</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  };

  const renderContent = () => {
    switch (menuState.view) {
      case 'catalogue':
        return renderCategoryList(catalogueMenu.categories, 'catalogue');
      case 'marques':
        return renderCategoryList(marquesMenu.categories, 'marques');
      case 'services':
        return renderCategoryList(servicesMenu.categories, 'services');
      case 'category':
        return renderSubcategoryList();
      default:
        return renderMainMenu();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className={cn(
              'fixed top-0 left-0 bottom-0 z-50',
              'w-full max-w-sm bg-white shadow-xl',
              'flex flex-col lg:hidden',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-stroke-light bg-white">
              {menuState.view !== 'main' ? (
                <button
                  onClick={handleBack}
                  className={cn(
                    'flex items-center gap-2 -ml-2 px-2 py-2 rounded-lg',
                    'text-body font-medium text-content-secondary',
                    'hover:text-content-primary hover:bg-surface-secondary',
                    'transition-colors duration-150'
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Retour</span>
                </button>
              ) : (
                <span className="text-section-sm font-semibold text-content-primary">
                  {getMenuTitle()}
                </span>
              )}

              {menuState.view !== 'main' && (
                <span className="text-body font-semibold text-content-primary">
                  {getMenuTitle()}
                </span>
              )}

              <button
                onClick={handleClose}
                className={cn(
                  'flex items-center justify-center w-10 h-10 -mr-2 rounded-lg',
                  'text-content-secondary hover:text-content-primary hover:bg-surface-secondary',
                  'transition-colors duration-150'
                )}
                aria-label="Fermer le menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

MobileMenuEcom.displayName = 'MobileMenuEcom';

export default MobileMenuEcom;
