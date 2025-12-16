'use client';

/**
 * MegaMenu Component
 *
 * Full-width dropdown menu with categories, subcategories, and featured content.
 * Luxury jewelry B2B design with smooth animations.
 *
 * Features:
 * - 3-column category layout with subcategories
 * - Featured products/promotions panel
 * - Brand showcase for "Marques" section
 * - Smooth framer-motion animations
 * - Keyboard accessible
 */

import { memo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, Gem, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData } from '@/hooks/useMockData';
import { MegaMenuCategory } from './MegaMenuCategory';
import { MegaMenuFeatured } from './MegaMenuFeatured';
import { MegaMenuBrands } from './MegaMenuBrands';
import { MegaMenuServices } from './MegaMenuServices';

export interface MegaMenuProps {
  /** Active menu section ID */
  activeSection: string;
  /** Callback when menu closes */
  onClose: () => void;
  /** Callback when mouse enters menu */
  onMouseEnter: () => void;
  /** Callback when mouse leaves menu */
  onMouseLeave: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const MegaMenu = memo(function MegaMenu({
  activeSection,
  onClose,
  onMouseEnter,
  onMouseLeave,
  className,
}: MegaMenuProps) {
  const { catalog } = useMockData();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Reset hovered category when section changes
  useEffect(() => {
    setHoveredCategory(null);
  }, [activeSection]);

  const handleCategoryHover = useCallback((categoryId: string) => {
    setHoveredCategory(categoryId);
  }, []);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Render different content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'catalogue':
        return (
          <CatalogueContent
            categories={catalog.parentCategories.slice(0, 5)}
            hoveredCategory={hoveredCategory}
            onCategoryHover={handleCategoryHover}
            onLinkClick={handleLinkClick}
          />
        );
      case 'marques':
        return <MegaMenuBrands onLinkClick={handleLinkClick} />;
      case 'services':
        return <MegaMenuServices onLinkClick={handleLinkClick} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'absolute top-full left-0 right-0 z-50',
        'bg-white shadow-2xl border-t border-neutral-100',
        className
      )}
      role="menu"
      aria-label={`Menu ${activeSection}`}
    >
      <div className="container mx-auto px-4 lg:px-6 py-6">
        {renderContent()}
      </div>
    </motion.div>
  );
});

MegaMenu.displayName = 'MegaMenu';

// Catalogue section content
interface CatalogueContentProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    children?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
  hoveredCategory: string | null;
  onCategoryHover: (id: string) => void;
  onLinkClick: () => void;
}

const CatalogueContent = memo(function CatalogueContent({
  categories,
  hoveredCategory,
  onCategoryHover,
  onLinkClick,
}: CatalogueContentProps) {
  const { catalog } = useMockData();

  // Get featured products
  const featuredProducts = catalog.bestSellers.slice(0, 3);

  // Get current category details
  const currentCategory = hoveredCategory
    ? categories.find((c) => c.id === hoveredCategory)
    : categories[0];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left sidebar - Categories list */}
      <div className="col-span-3 border-r border-neutral-100 pr-6">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Categories
        </h3>
        <ul className="space-y-0.5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                onMouseEnter={() => onCategoryHover(category.id)}
                onFocus={() => onCategoryHover(category.id)}
                onClick={onLinkClick}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg',
                  'text-sm font-medium',
                  'transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20',
                  hoveredCategory === category.id || (!hoveredCategory && categories[0]?.id === category.id)
                    ? 'bg-amber-50 text-amber-800'
                    : 'text-neutral-700 hover:bg-neutral-50'
                )}
                role="menuitem"
              >
                <span>{category.name}</span>
                <ChevronRight
                  className={cn(
                    'w-4 h-4',
                    hoveredCategory === category.id || (!hoveredCategory && categories[0]?.id === category.id)
                      ? 'text-amber-600'
                      : 'text-neutral-400'
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* View all link */}
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <Link
            href="/categories"
            onClick={onLinkClick}
            className={cn(
              'flex items-center gap-2 px-3 py-2',
              'text-sm font-semibold text-amber-700',
              'hover:text-amber-800',
              'transition-colors duration-150'
            )}
          >
            <span>Voir tout le catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Middle - Subcategories grid */}
      <div className="col-span-6">
        {currentCategory && (
          <motion.div
            key={currentCategory.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {currentCategory.name}
              </h3>
              <Link
                href={`/categories/${currentCategory.slug}`}
                onClick={onLinkClick}
                className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
              >
                Tout voir
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Subcategories grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {currentCategory.children?.slice(0, 10).map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${currentCategory.slug}/${sub.slug}`}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center justify-between py-2 px-2 -mx-2 rounded-lg',
                    'text-sm text-neutral-600',
                    'hover:text-neutral-900 hover:bg-neutral-50',
                    'transition-colors duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20'
                  )}
                  role="menuitem"
                >
                  <span>{sub.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </Link>
              ))}
            </div>

            {/* Category image/promo */}
            {currentCategory.description && (
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl">
                <p className="text-sm text-neutral-600">
                  {currentCategory.description}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Right - Featured products */}
      <div className="col-span-3">
        <MegaMenuFeatured
          products={featuredProducts}
          onLinkClick={onLinkClick}
        />
      </div>
    </div>
  );
});

CatalogueContent.displayName = 'CatalogueContent';

export default MegaMenu;
