'use client';

/**
 * DropdownPanel Component
 *
 * Animated dropdown panel containing the MegaMenu content.
 * Features Framer Motion animations (fade + slide), 3-column layout
 * (L1 sidebar + L2 sidebar + L3+ content grid),
 * click outside to close, and keyboard navigation support.
 */

import { memo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { X, ArrowRight, ChevronRight, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryGrid } from './CategoryGrid';
import { CategoryIcon } from './CategoryIcon';
import type { CategoryLevel1, CategoryLevel2 } from './types';

export interface DropdownPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** All Level 1 categories to display in the first column */
  categories: CategoryLevel1[];
  /** Active Level 1 category ID */
  activeL1: string | null;
  /** Callback when Level 1 category is hovered */
  onL1Hover: (categoryId: string | null) => void;
  /** Callback when Level 1 category is clicked */
  onL1Click: (category: CategoryLevel1) => void;
  /** Active Level 2 category ID */
  activeL2: string | null;
  /** Callback when Level 2 category is hovered */
  onL2Hover: (categoryId: string | null) => void;
  /** Callback when Level 2 category is clicked */
  onL2Click: (category: CategoryLevel2) => void;
  /** Callback to close the panel */
  onClose: () => void;
  /** Callback when mouse enters the panel */
  onMouseEnter: () => void;
  /** Callback when mouse leaves the panel */
  onMouseLeave: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animation variants for the dropdown panel
 */
const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1], // easeIn cubic-bezier
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0, 0, 0.2, 1], // easeOut cubic-bezier
    },
  },
};

/**
 * Animation variants for content sections
 */
const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
      delay: 0.05,
    },
  },
};

/**
 * L1 Column Sidebar - displays all Level 1 categories
 */
interface L1SidebarProps {
  categories: CategoryLevel1[];
  activeL1: string | null;
  onL1Hover: (categoryId: string | null) => void;
  onL1Click: (category: CategoryLevel1) => void;
  onLinkClick: () => void;
}

const L1Sidebar = memo(function L1Sidebar({
  categories,
  activeL1,
  onL1Hover,
  onL1Click,
  onLinkClick,
}: L1SidebarProps) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, category: CategoryLevel1) => {
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = index < categories.length - 1 ? index + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = index > 0 ? index - 1 : categories.length - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (category.children && category.children.length > 0) {
            onL1Click(category);
          }
          break;
        case 'Enter':
        case ' ':
          // Let the link navigate
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = categories.length - 1;
          break;
      }

      if (nextIndex !== null) {
        const nextCategory = categories[nextIndex];
        onL1Hover(nextCategory.id);
      }
    },
    [categories, onL1Hover, onL1Click]
  );

  return (
    <div
      className={cn(
        'w-[300px] shrink-0 h-full flex flex-col',
        'bg-neutral-50/80',
        'border-r border-neutral-200'
      )}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-neutral-200">
        <h3 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
          <LayoutGrid className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
          <span>Catégories</span>
        </h3>
      </div>

      {/* L1 Category list */}
      <nav
        className="flex-1 overflow-y-auto py-2"
        aria-label="Categories principales"
      >
        <ul role="menu" className="space-y-0.5 px-2">
          {categories.map((category, index) => {
            const hasChildren = category.children && category.children.length > 0;
            const isActive = activeL1 === category.id;
            const href = `/categorie/${category.slug}`;

            return (
              <li key={category.id} role="none">
                <Link
                  href={href}
                  role="menuitem"
                  aria-haspopup={hasChildren ? 'true' : undefined}
                  aria-expanded={hasChildren ? isActive : undefined}
                  onMouseEnter={() => {
                    onL1Hover(category.id);
                    router.prefetch(href);
                  }}
                  onClick={(e) => {
                    // If has children and user just wants to expand, prevent navigation
                    // But allow click-through to navigate to the L1 page
                    onL1Click(category);
                    onLinkClick();
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index, category)}
                  className={cn(
                    // Base styles
                    'group w-full flex items-center justify-between gap-2',
                    'px-3 py-2.5',
                    'text-left text-sm',
                    'rounded-lg',
                    'transition-all duration-150 ease-out',
                    // Default state
                    'text-neutral-700',
                    // Hover state
                    'hover:bg-neutral-100 hover:text-neutral-900',
                    // Active state
                    isActive && 'bg-amber-50 text-amber-900 border-l-2 border-amber-500 rounded-l-none',
                    // Focus visible
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset'
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <CategoryIcon
                      name={category.icon}
                      size="sm"
                      className={cn(
                        'text-neutral-400 transition-colors duration-150',
                        'group-hover:text-amber-600',
                        isActive && 'text-amber-600'
                      )}
                    />
                    <span className="font-medium whitespace-nowrap">{category.name}</span>
                  </span>
                  {hasChildren && (
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 text-neutral-400 shrink-0',
                        'transition-all duration-150',
                        'group-hover:text-amber-600 group-hover:translate-x-0.5',
                        isActive && 'text-amber-600 translate-x-0.5'
                      )}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - View all link */}
      <div className="px-3 py-3 border-t border-neutral-200 bg-white">
        <Link
          href="/categorie"
          onClick={onLinkClick}
          className={cn(
            'group flex items-center justify-center gap-2',
            'w-full px-3 py-2',
            'text-xs font-medium text-amber-600',
            'bg-amber-50 hover:bg-amber-100',
            'rounded-lg',
            'transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
          )}
        >
          <span>Toutes les catégories</span>
          <ArrowRight
            className={cn(
              'w-3.5 h-3.5',
              'transition-transform duration-150',
              'group-hover:translate-x-0.5'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
});

L1Sidebar.displayName = 'L1Sidebar';

/**
 * L2 Column Sidebar - displays Level 2 categories for selected L1
 * L2 items are now clickable links that navigate to /categorie/{L1-slug}/{L2-slug}
 */
interface L2SidebarProps {
  parentCategory: CategoryLevel1;
  activeL2: string | null;
  onL2Hover: (categoryId: string | null) => void;
  onL2Click: (category: CategoryLevel2) => void;
  onLinkClick: () => void;
}

const L2Sidebar = memo(function L2Sidebar({
  parentCategory,
  activeL2,
  onL2Hover,
  onL2Click,
  onLinkClick,
}: L2SidebarProps) {
  const router = useRouter();
  const children = parentCategory.children || [];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, category: CategoryLevel2) => {
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = index < children.length - 1 ? index + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = index > 0 ? index - 1 : children.length - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (category.children && category.children.length > 0) {
            onL2Click(category);
          }
          break;
        case 'Enter':
        case ' ':
          // Don't prevent default - let the link navigate
          onL2Click(category);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = children.length - 1;
          break;
      }

      if (nextIndex !== null) {
        const nextCategory = children[nextIndex];
        onL2Hover(nextCategory.id);
      }
    },
    [children, onL2Hover, onL2Click]
  );

  return (
    <div
      className={cn(
        'w-[300px] shrink-0 h-full flex flex-col',
        'bg-white',
        'border-r border-neutral-200'
      )}
    >
      {/* Header with L1 category info */}
      <div className="px-4 py-4 border-b border-neutral-200 bg-neutral-50/50">
        <Link
          href={`/categorie/${parentCategory.slug}`}
          onClick={onLinkClick}
          className={cn(
            'group flex items-center gap-2',
            'text-sm font-semibold text-neutral-900',
            'hover:text-amber-600',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:text-amber-600'
          )}
        >
          <CategoryIcon
            name={parentCategory.icon}
            size="sm"
            className="text-amber-600"
          />
          <span className="whitespace-nowrap">{parentCategory.name}</span>
        </Link>
        {parentCategory.productCount !== undefined && parentCategory.productCount > 0 && (
          <p className="mt-0.5 text-xs text-neutral-500 pl-6">
            {parentCategory.productCount.toLocaleString('fr-FR')} produits
          </p>
        )}
      </div>

      {/* L2 Category list */}
      <nav
        className="flex-1 overflow-y-auto py-2"
        aria-label={`Sous-categories de ${parentCategory.name}`}
      >
        <ul role="menu" className="space-y-0.5 px-2">
          {children.map((category, index) => {
            const hasChildren = category.children && category.children.length > 0;
            const isActive = activeL2 === category.id;
            const href = `/categorie/${parentCategory.slug}/${category.slug}`;

            return (
              <li key={category.id} role="none">
                <Link
                  href={href}
                  role="menuitem"
                  aria-haspopup={hasChildren ? 'true' : undefined}
                  aria-expanded={hasChildren ? isActive : undefined}
                  onMouseEnter={() => {
                    onL2Hover(category.id);
                    router.prefetch(href);
                  }}
                  onClick={() => onL2Click(category)}
                  onKeyDown={(e) => handleKeyDown(e, index, category)}
                  className={cn(
                    // Base styles
                    'group w-full flex items-center justify-between gap-2',
                    'px-3 py-2',
                    'text-left text-sm',
                    'rounded-lg',
                    'transition-all duration-150 ease-out',
                    // Default state
                    'text-neutral-600',
                    // Hover state
                    'hover:bg-neutral-100 hover:text-neutral-900',
                    // Active state
                    isActive && 'bg-amber-50 text-amber-900 border-l-2 border-amber-500 rounded-l-none',
                    // Focus visible
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset'
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {category.icon && (
                      <CategoryIcon
                        name={category.icon}
                        size="sm"
                        className={cn(
                          'text-neutral-400 transition-colors duration-150',
                          'group-hover:text-amber-600',
                          isActive && 'text-amber-600'
                        )}
                      />
                    )}
                    <span className="whitespace-nowrap">{category.name}</span>
                  </span>
                  {hasChildren && (
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 text-neutral-400 shrink-0',
                        'transition-all duration-150',
                        'group-hover:text-amber-600 group-hover:translate-x-0.5',
                        isActive && 'text-amber-600 translate-x-0.5'
                      )}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - View all L1 category link */}
      <div className="px-3 py-3 border-t border-neutral-200">
        <Link
          href={`/categorie/${parentCategory.slug}`}
          onClick={onLinkClick}
          className={cn(
            'group flex items-center justify-center gap-1.5',
            'w-full px-3 py-2',
            'text-xs font-medium text-amber-600',
            'bg-amber-50 hover:bg-amber-100',
            'rounded-lg',
            'transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
          )}
        >
          <span>Tout {parentCategory.name}</span>
          <ArrowRight
            className={cn(
              'w-3.5 h-3.5',
              'transition-transform duration-150',
              'group-hover:translate-x-0.5'
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
});

L2Sidebar.displayName = 'L2Sidebar';

/**
 * DropdownPanel renders the main MegaMenu dropdown content.
 * Features 3-section layout: L1 sidebar (~300px), L2 sidebar (~300px),
 * and L3+ content grid (flex-1).
 *
 * @example
 * <DropdownPanel
 *   isOpen={isOpen}
 *   categories={allCategories}
 *   activeL1={activeL1Id}
 *   onL1Hover={setActiveL1}
 *   onL1Click={handleL1Click}
 *   activeL2={activeL2Id}
 *   onL2Hover={setActiveL2}
 *   onL2Click={handleL2Click}
 *   onClose={closeMenu}
 *   onMouseEnter={handleMouseEnter}
 *   onMouseLeave={handleMouseLeave}
 * />
 */
export const DropdownPanel = memo(function DropdownPanel({
  isOpen,
  categories,
  activeL1,
  onL1Hover,
  onL1Click,
  activeL2,
  onL2Hover,
  onL2Click,
  onClose,
  onMouseEnter,
  onMouseLeave,
  className,
}: DropdownPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Get active L1 category object
  const activeL1Category = categories.find((cat) => cat.id === activeL1) || null;

  // Get active L2 category object
  const activeL2Category = activeL1Category?.children?.find(
    (cat) => cat.id === activeL2
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleViewAllClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={cn(
            'absolute left-0 right-0 top-full z-50',
            'bg-white',
            'border-b border-neutral-200',
            'shadow-lg shadow-neutral-900/10',
            'overflow-hidden',
            className
          )}
          role="menu"
          aria-label="Menu de navigation par categories"
        >
          {/* Inner container for content alignment with nav */}
          <div className="container-ecom relative">
          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4 z-10',
              'p-2 rounded-lg',
              'text-neutral-500 hover:text-neutral-900',
              'hover:bg-neutral-100',
              'transition-colors duration-150',
              'lg:hidden',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
            )}
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* 3-section layout: L1 | L2 | L3+ Content */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="flex h-[480px] max-h-[70vh]"
          >
            {/* Column 1 - L1 Categories (~200px) */}
            <L1Sidebar
              categories={categories}
              activeL1={activeL1}
              onL1Hover={onL1Hover}
              onL1Click={onL1Click}
              onLinkClick={handleViewAllClick}
            />

            {/* Column 2 - L2 Categories (~200px) - Only shown when L1 has children */}
            {activeL1Category && activeL1Category.children && activeL1Category.children.length > 0 && (
              <L2Sidebar
                parentCategory={activeL1Category}
                activeL2={activeL2}
                onL2Hover={onL2Hover}
                onL2Click={onL2Click}
                onLinkClick={handleViewAllClick}
              />
            )}

            {/* Column 3 - Content Area (flex-1) - Handles variable depth */}
            <div className="flex-1 min-w-0">
              {(() => {
                // Case 1: No L1 selected - show welcome message
                if (!activeL1Category) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <CategoryIcon
                        name="folder"
                        size="lg"
                        className="text-neutral-300 mb-4"
                      />
                      <p className="text-sm text-neutral-500">
                        Survolez une categorie pour commencer
                      </p>
                    </div>
                  );
                }

                // Case 2: L1 selected but has NO children (2-level category)
                // Show direct category content with link
                const hasL2Children = activeL1Category.children && activeL1Category.children.length > 0;
                if (!hasL2Children) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <CategoryIcon
                        name={activeL1Category.icon}
                        size="lg"
                        className="text-amber-500 mb-4"
                      />
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {activeL1Category.name}
                      </h3>
                      {activeL1Category.description && (
                        <p className="text-sm text-neutral-500 mb-4 max-w-md">
                          {activeL1Category.description}
                        </p>
                      )}
                      {activeL1Category.productCount !== undefined && activeL1Category.productCount > 0 && (
                        <p className="text-sm text-neutral-400 mb-4">
                          {activeL1Category.productCount.toLocaleString('fr-FR')} produits
                        </p>
                      )}
                      <Link
                        href={`/categorie/${activeL1Category.slug}`}
                        onClick={handleViewAllClick}
                        className={cn(
                          'inline-flex items-center gap-2',
                          'px-6 py-3',
                          'text-sm font-medium text-white',
                          'bg-amber-600 hover:bg-amber-700',
                          'rounded-lg',
                          'transition-colors duration-150',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2'
                        )}
                      >
                        <span>Explorer {activeL1Category.name}</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                    </div>
                  );
                }

                // Case 3: L1 has children but no L2 is selected yet
                if (!activeL2Category) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <CategoryIcon
                        name={activeL1Category.icon}
                        size="lg"
                        className="text-neutral-300 mb-4"
                      />
                      <p className="text-sm text-neutral-500 mb-2">
                        Survolez une sous-categorie pour voir les details
                      </p>
                      <Link
                        href={`/categorie/${activeL1Category.slug}`}
                        onClick={handleViewAllClick}
                        className={cn(
                          'inline-flex items-center gap-2',
                          'px-4 py-2 mt-4',
                          'text-sm font-medium text-amber-600',
                          'hover:text-amber-700',
                          'transition-colors duration-150',
                          'focus:outline-none focus-visible:underline'
                        )}
                      >
                        <span>Explorer {activeL1Category.name}</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                    </div>
                  );
                }

                // Case 4: L2 selected but has NO children (3-level category)
                // Show L2 as a clickable destination
                const hasL3Children = activeL2Category.children && activeL2Category.children.length > 0;
                if (!hasL3Children) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <CategoryIcon
                        name={activeL2Category.icon || activeL1Category.icon}
                        size="lg"
                        className="text-amber-500 mb-4"
                      />
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {activeL2Category.name}
                      </h3>
                      {activeL2Category.productCount !== undefined && activeL2Category.productCount > 0 && (
                        <p className="text-sm text-neutral-400 mb-4">
                          {activeL2Category.productCount.toLocaleString('fr-FR')} produits
                        </p>
                      )}
                      <Link
                        href={`/categorie/${activeL1Category.slug}/${activeL2Category.slug}`}
                        onClick={handleViewAllClick}
                        className={cn(
                          'inline-flex items-center gap-2',
                          'px-6 py-3',
                          'text-sm font-medium text-white',
                          'bg-amber-600 hover:bg-amber-700',
                          'rounded-lg',
                          'transition-colors duration-150',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2'
                        )}
                      >
                        <span>Explorer {activeL2Category.name}</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                    </div>
                  );
                }

                // Case 5: L2 has children (4+ level category) - Show full L3+ grid
                return (
                  <CategoryGrid
                    category={activeL2Category}
                    parentSlug={activeL1Category.slug}
                    onLinkClick={handleViewAllClick}
                    maxItemsPerSection={5}
                    className="h-full"
                  />
                );
              })()}
            </div>

          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

DropdownPanel.displayName = 'DropdownPanel';

export default DropdownPanel;
