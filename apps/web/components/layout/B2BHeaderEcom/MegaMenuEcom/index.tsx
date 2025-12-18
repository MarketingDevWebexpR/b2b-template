'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { menuSections, type Category, type MenuSection } from './menuData';

export interface MegaMenuEcomProps {
  /** Active menu section ID */
  activeSection: string | null;
  /** Callback when menu closes */
  onClose?: () => void;
  /** Callback to keep menu open (for mouse enter on menu) */
  onMouseEnter?: () => void;
  /** Callback when mouse leaves menu */
  onMouseLeave?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const MegaMenuEcom = memo(function MegaMenuEcom({
  activeSection,
  onClose,
  onMouseEnter,
  onMouseLeave,
  className,
}: MegaMenuEcomProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const section = activeSection ? menuSections[activeSection] : null;

  // Reset hovered category when section changes
  useEffect(() => {
    if (activeSection && section?.categories[0]) {
      setHoveredCategory(section.categories[0].id);
    } else {
      setHoveredCategory(null);
    }
  }, [activeSection, section]);

  const handleCategoryHover = useCallback((categoryId: string) => {
    setHoveredCategory(categoryId);
  }, []);

  const currentCategory = section?.categories.find((c) => c.id === hoveredCategory);

  if (!activeSection || !section) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          'absolute top-full left-0 right-0 z-50',
          'bg-white shadow-lg border-t border-stroke',
          className
        )}
        role="menu"
        aria-label={`Menu ${section.title}`}
      >
        <div className="container-ecom py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar - Categories list */}
            <div className="col-span-3 border-r border-stroke-light pr-6">
              <h3 className="text-label text-content-muted uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={category.href}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      onFocus={() => handleCategoryHover(category.id)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-md',
                        'text-body font-medium',
                        'transition-colors duration-150',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                        hoveredCategory === category.id
                          ? 'bg-primary-50 text-primary'
                          : 'text-content-primary hover:bg-surface-secondary'
                      )}
                      role="menuitem"
                    >
                      <span>{category.name}</span>
                      <ChevronRight
                        className={cn(
                          'w-4 h-4',
                          hoveredCategory === category.id
                            ? 'text-primary'
                            : 'text-content-muted'
                        )}
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* View all link */}
              <div className="mt-4 pt-4 border-t border-stroke-light">
                <Link
                  href={`/c`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2',
                    'text-body font-semibold text-primary',
                    'hover:text-primary-600',
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
                    <h3 className="text-section-sm font-heading text-content-primary">
                      {currentCategory.name}
                    </h3>
                    <Link
                      href={currentCategory.href}
                      className="text-body-sm text-primary hover:text-primary-600 font-medium flex items-center gap-1"
                    >
                      Tout voir
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {currentCategory.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        className={cn(
                          'flex items-center justify-between py-2 px-2 -mx-2 rounded',
                          'text-body text-content-secondary',
                          'hover:text-content-primary hover:bg-surface-secondary',
                          'transition-colors duration-150',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
                        )}
                        role="menuitem"
                      >
                        <span>{sub.name}</span>
                        {sub.count && (
                          <span className="text-caption text-content-muted">
                            ({sub.count})
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right - Promo card */}
            <div className="col-span-3">
              {section.promo && (
                <Link
                  href={section.promo.href}
                  className="block group"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-secondary">
                    {section.promo.image && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80">
                        {/* Placeholder gradient - would be image */}
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                      {section.promo.badge && (
                        <span className="inline-flex self-start px-2 py-0.5 mb-2 text-badge font-semibold bg-accent rounded">
                          {section.promo.badge}
                        </span>
                      )}
                      <h4 className="text-card-title font-semibold mb-1 group-hover:underline">
                        {section.promo.title}
                      </h4>
                      <p className="text-body-sm opacity-90">
                        {section.promo.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Quick links */}
              <div className="mt-4 space-y-2">
                <Link
                  href="/promotions"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md',
                    'text-body font-medium text-accent',
                    'bg-accent-50 hover:bg-accent-100',
                    'transition-colors duration-150'
                  )}
                >
                  <span>Voir les promotions</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/nouveautes"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md',
                    'text-body font-medium text-content-secondary',
                    'hover:bg-surface-secondary hover:text-content-primary',
                    'transition-colors duration-150'
                  )}
                >
                  <span>Nouveautes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

MegaMenuEcom.displayName = 'MegaMenuEcom';

export default MegaMenuEcom;
