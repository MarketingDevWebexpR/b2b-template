/**
 * Category Navigation Component Examples
 *
 * These are reference implementations showing the recommended patterns
 * for the 5-level category navigation system.
 *
 * Technology: React + TypeScript
 * Styling: CSS Modules (can be adapted to Tailwind, styled-components, etc.)
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: 1 | 2 | 3 | 4 | 5;
  childCount: number;
  hasChildren: boolean;
  metadata: {
    icon?: string;
    image?: string;
    description?: string;
    productCount?: number;
  };
}

interface NavigationState {
  // Desktop
  isMenuOpen: boolean;
  activeL1Id: string | null;
  activeL2Id: string | null;

  // Mobile
  isDrawerOpen: boolean;
  navigationStack: (string | null)[];
  scrollPositions: Map<string, number>;

  // Shared
  isLoading: boolean;
  focusedItemId: string | null;
}

interface NavigationContextValue extends NavigationState {
  // Desktop actions
  openMenu: (l1Id: string) => void;
  closeMenu: () => void;
  setActiveL2: (l2Id: string | null) => void;

  // Mobile actions
  openDrawer: () => void;
  closeDrawer: () => void;
  pushLevel: (categoryId: string) => void;
  popLevel: () => void;

  // Data
  categories: Category[];
  getChildren: (parentId: string | null) => Category[];
  getCategory: (id: string) => Category | undefined;
  getPath: (categoryId: string) => Category[];
}

// =============================================================================
// NAVIGATION CONTEXT
// =============================================================================

const NavigationContext = createContext<NavigationContextValue | null>(null);

function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: React.ReactNode;
  categories: Category[];
}

function NavigationProvider({ children, categories }: NavigationProviderProps) {
  const [state, setState] = useState<NavigationState>({
    isMenuOpen: false,
    activeL1Id: null,
    activeL2Id: null,
    isDrawerOpen: false,
    navigationStack: [null], // null represents root level
    scrollPositions: new Map(),
    isLoading: false,
    focusedItemId: null,
  });

  // Create lookup maps for efficient access
  const categoryMaps = useMemo(() => {
    const byId = new Map<string, Category>();
    const byParentId = new Map<string | null, Category[]>();

    categories.forEach(cat => {
      byId.set(cat.id, cat);
      const siblings = byParentId.get(cat.parentId) || [];
      siblings.push(cat);
      byParentId.set(cat.parentId, siblings);
    });

    return { byId, byParentId };
  }, [categories]);

  const getChildren = useCallback(
    (parentId: string | null) => categoryMaps.byParentId.get(parentId) || [],
    [categoryMaps]
  );

  const getCategory = useCallback(
    (id: string) => categoryMaps.byId.get(id),
    [categoryMaps]
  );

  const getPath = useCallback(
    (categoryId: string): Category[] => {
      const path: Category[] = [];
      let current = categoryMaps.byId.get(categoryId);

      while (current) {
        path.unshift(current);
        current = current.parentId
          ? categoryMaps.byId.get(current.parentId)
          : undefined;
      }

      return path;
    },
    [categoryMaps]
  );

  // Desktop actions
  const openMenu = useCallback((l1Id: string) => {
    const l2Categories = getChildren(l1Id);
    setState(prev => ({
      ...prev,
      isMenuOpen: true,
      activeL1Id: l1Id,
      activeL2Id: l2Categories[0]?.id || null,
    }));
  }, [getChildren]);

  const closeMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMenuOpen: false,
      activeL1Id: null,
      activeL2Id: null,
    }));
  }, []);

  const setActiveL2 = useCallback((l2Id: string | null) => {
    setState(prev => ({ ...prev, activeL2Id: l2Id }));
  }, []);

  // Mobile actions
  const openDrawer = useCallback(() => {
    setState(prev => ({ ...prev, isDrawerOpen: true }));
    document.body.style.overflow = 'hidden';
  }, []);

  const closeDrawer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDrawerOpen: false,
      navigationStack: [null],
    }));
    document.body.style.overflow = '';
  }, []);

  const pushLevel = useCallback((categoryId: string) => {
    setState(prev => ({
      ...prev,
      navigationStack: [...prev.navigationStack, categoryId],
    }));
  }, []);

  const popLevel = useCallback(() => {
    setState(prev => {
      if (prev.navigationStack.length <= 1) return prev;
      return {
        ...prev,
        navigationStack: prev.navigationStack.slice(0, -1),
      };
    });
  }, []);

  const value: NavigationContextValue = {
    ...state,
    openMenu,
    closeMenu,
    setActiveL2,
    openDrawer,
    closeDrawer,
    pushLevel,
    popLevel,
    categories,
    getChildren,
    getCategory,
    getPath,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

/**
 * Hook for hover intent detection with delay
 */
function useHoverIntent(delay: number = 100) {
  const timerRef = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = useCallback(() => {
    timerRef.current = window.setTimeout(() => {
      setIsHovering(true);
    }, delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHovering(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    isHovering,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

/**
 * Hook for keyboard navigation within menu
 */
function useKeyboardNavigation(
  items: Category[],
  onSelect: (category: Category) => void,
  onEscape: () => void
) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev =>
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev =>
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (items[focusedIndex]) {
            onSelect(items[focusedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onEscape();
          break;
        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
      }
    },
    [items, focusedIndex, onSelect, onEscape]
  );

  return { focusedIndex, setFocusedIndex, handleKeyDown };
}

/**
 * Hook for swipe gesture detection on mobile
 */
function useSwipeGesture(onSwipeRight: () => void, threshold: number = 100) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      // Ensure horizontal swipe (not vertical scroll)
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > threshold) {
        onSwipeRight();
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [onSwipeRight, threshold]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

interface CategoryIconProps {
  icon?: string;
  size?: number;
  className?: string;
}

function CategoryIcon({ icon, size = 24, className }: CategoryIconProps) {
  // In production, this would render from an SVG sprite or icon library
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      {/* Placeholder - replace with actual icon paths based on `icon` prop */}
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

interface ChevronProps {
  direction?: 'right' | 'left' | 'down' | 'up';
  size?: number;
  className?: string;
}

function Chevron({ direction = 'right', size = 16, className }: ChevronProps) {
  const rotations = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: `rotate(${rotations[direction]}deg)` }}
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

interface LiveRegionProps {
  message: string;
}

function LiveRegion({ message }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

interface SkeletonLoaderProps {
  variant: 'sidebar' | 'grid' | 'list';
  count?: number;
}

function SkeletonLoader({ variant, count = 6 }: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'sidebar') {
    return (
      <div className="skeleton-sidebar" role="status" aria-label="Chargement">
        {items.map(i => (
          <div key={i} className="skeleton-item skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="skeleton-grid" role="status" aria-label="Chargement">
        {items.map(i => (
          <div key={i} className="skeleton-card skeleton-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-list" role="status" aria-label="Chargement">
      {items.map(i => (
        <div key={i} className="skeleton-row skeleton-shimmer" />
      ))}
    </div>
  );
}

// =============================================================================
// DESKTOP COMPONENTS
// =============================================================================

function DesktopNav() {
  const { isMenuOpen, activeL1Id, closeMenu } = useNavigation();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, closeMenu]);

  // Delayed close on mouse leave
  const handleMouseLeave = () => {
    closeTimerRef.current = window.setTimeout(() => {
      closeMenu();
    }, 300);
  };

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  return (
    <div
      ref={menuRef}
      className="desktop-nav"
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <NavBar />
      {isMenuOpen && activeL1Id && (
        <MegaMenu categoryId={activeL1Id} />
      )}
    </div>
  );
}

function NavBar() {
  const { getChildren, activeL1Id, openMenu, isMenuOpen } = useNavigation();
  const rootCategories = getChildren(null);

  return (
    <nav aria-label="Navigation principale des categories">
      <ul role="menubar" className="nav-bar">
        {rootCategories.map(category => (
          <NavItem
            key={category.id}
            category={category}
            isActive={activeL1Id === category.id && isMenuOpen}
            onActivate={() => openMenu(category.id)}
          />
        ))}
      </ul>
    </nav>
  );
}

interface NavItemProps {
  category: Category;
  isActive: boolean;
  onActivate: () => void;
}

function NavItem({ category, isActive, onActivate }: NavItemProps) {
  const { isHovering, hoverProps } = useHoverIntent(100);

  useEffect(() => {
    if (isHovering) {
      onActivate();
    }
  }, [isHovering, onActivate]);

  return (
    <li role="none" className="nav-item-wrapper">
      <a
        href={`/${category.slug}`}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isActive}
        className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
        {...hoverProps}
        onFocus={onActivate}
      >
        <CategoryIcon icon={category.metadata.icon} size={24} />
        <span>{category.name}</span>
      </a>
    </li>
  );
}

interface MegaMenuProps {
  categoryId: string;
}

function MegaMenu({ categoryId }: MegaMenuProps) {
  const {
    getChildren,
    getCategory,
    activeL2Id,
    setActiveL2,
    closeMenu
  } = useNavigation();

  const l2Categories = getChildren(categoryId);
  const l3Categories = activeL2Id ? getChildren(activeL2Id) : [];
  const category = getCategory(categoryId);

  const { focusedIndex, handleKeyDown } = useKeyboardNavigation(
    l2Categories,
    (cat) => setActiveL2(cat.id),
    closeMenu
  );

  return (
    <div
      role="menu"
      aria-label={`Sous-categories de ${category?.name}`}
      className="mega-menu"
      onKeyDown={handleKeyDown}
    >
      <div className="mega-menu__content">
        {/* L2 Sidebar */}
        <div className="mega-menu__sidebar" role="group">
          <ul role="menu" className="category-sidebar">
            {l2Categories.map((cat, index) => (
              <li key={cat.id} role="none">
                <a
                  href={`/${cat.slug}`}
                  role="menuitem"
                  className={`sidebar-item ${
                    activeL2Id === cat.id ? 'sidebar-item--active' : ''
                  } ${focusedIndex === index ? 'sidebar-item--focused' : ''}`}
                  onMouseEnter={() => setActiveL2(cat.id)}
                  onFocus={() => setActiveL2(cat.id)}
                >
                  <CategoryIcon icon={cat.metadata.icon} size={20} />
                  <span>{cat.name}</span>
                  {cat.hasChildren && <Chevron direction="right" />}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={`/${category?.slug}`}
            className="see-all-link"
          >
            Voir tout {category?.name}
            <Chevron direction="right" />
          </a>
        </div>

        {/* L3 Grid */}
        <div className="mega-menu__grid" role="group">
          {l3Categories.length > 0 ? (
            <ul role="menu" className="category-grid">
              {l3Categories.map(cat => (
                <li key={cat.id} role="none">
                  <a
                    href={`/${cat.slug}`}
                    role="menuitem"
                    className="grid-item"
                  >
                    <span>{cat.name}</span>
                    {cat.hasChildren && (
                      <Chevron direction="right" size={14} />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <SkeletonLoader variant="grid" count={8} />
          )}
        </div>
      </div>

      {/* Featured Banner */}
      {category?.metadata.image && (
        <div className="mega-menu__banner">
          <img
            src={category.metadata.image}
            alt=""
            className="banner-image"
            loading="lazy"
          />
          <div className="banner-content">
            <h3>Nouveautes {category.name}</h3>
            <p>Decouvrez notre selection</p>
            <a href={`/${category.slug}/nouveautes`} className="banner-cta">
              Voir les nouveautes
              <Chevron direction="right" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MOBILE COMPONENTS
// =============================================================================

function MobileNav() {
  const { isDrawerOpen, openDrawer, closeDrawer } = useNavigation();

  return (
    <>
      <HamburgerButton
        isOpen={isDrawerOpen}
        onClick={isDrawerOpen ? closeDrawer : openDrawer}
      />

      <NavDrawer isOpen={isDrawerOpen} onClose={closeDrawer}>
        <NavigationStack />
      </NavDrawer>
    </>
  );
}

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      className={`hamburger-button ${isOpen ? 'hamburger-button--open' : ''}`}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="nav-drawer"
      aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
    >
      <span className="hamburger-line" />
      <span className="hamburger-line" />
      <span className="hamburger-line" />
    </button>
  );
}

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function NavDrawer({ isOpen, onClose, children }: NavDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${isOpen ? 'drawer-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        id="nav-drawer"
        className={`nav-drawer ${isOpen ? 'nav-drawer--open' : ''}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <div className="drawer-header">
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <Chevron direction="left" />
            <span>Fermer</span>
          </button>
          <span className="drawer-title">Categories</span>
        </div>

        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
}

function NavigationStack() {
  const { navigationStack, popLevel } = useNavigation();
  const swipeProps = useSwipeGesture(popLevel);

  return (
    <div className="navigation-stack" {...swipeProps}>
      {navigationStack.map((categoryId, index) => (
        <NavPanel
          key={categoryId || 'root'}
          categoryId={categoryId}
          isActive={index === navigationStack.length - 1}
          position={
            index === navigationStack.length - 1
              ? 'active'
              : index === navigationStack.length - 2
              ? 'previous'
              : 'hidden'
          }
        />
      ))}
    </div>
  );
}

interface NavPanelProps {
  categoryId: string | null;
  isActive: boolean;
  position: 'active' | 'previous' | 'hidden';
}

function NavPanel({ categoryId, isActive, position }: NavPanelProps) {
  const {
    getChildren,
    getCategory,
    getPath,
    pushLevel,
    popLevel,
    closeDrawer
  } = useNavigation();

  const categories = getChildren(categoryId);
  const currentCategory = categoryId ? getCategory(categoryId) : null;
  const breadcrumbPath = categoryId ? getPath(categoryId) : [];

  const handleItemClick = (category: Category, e: React.MouseEvent) => {
    if (category.hasChildren) {
      e.preventDefault();
      pushLevel(category.id);
    } else {
      // Let the link navigate, then close drawer
      setTimeout(closeDrawer, 100);
    }
  };

  return (
    <div
      className={`nav-panel nav-panel--${position}`}
      aria-hidden={!isActive}
      inert={!isActive ? '' : undefined}
    >
      {/* Panel Header */}
      {currentCategory && (
        <div className="panel-header">
          <button
            type="button"
            className="back-button"
            onClick={popLevel}
            aria-label={`Retour a ${breadcrumbPath[breadcrumbPath.length - 2]?.name || 'Categories'}`}
          >
            <Chevron direction="left" />
            <span>
              {breadcrumbPath[breadcrumbPath.length - 2]?.name || 'Categories'}
            </span>
          </button>
          <span className="panel-title">{currentCategory.name}</span>
        </div>
      )}

      {/* Breadcrumb (for deep levels) */}
      {breadcrumbPath.length > 1 && (
        <div className="panel-breadcrumb">
          {breadcrumbPath.map((cat, index) => (
            <React.Fragment key={cat.id}>
              {index > 0 && <span className="breadcrumb-separator"> &gt; </span>}
              <span className="breadcrumb-item">{cat.name}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* See All Link */}
      {currentCategory && (
        <a
          href={`/${currentCategory.slug}`}
          className="see-all-row"
          onClick={() => setTimeout(closeDrawer, 100)}
        >
          <CategoryIcon icon={currentCategory.metadata.icon} />
          <span>Voir tout {currentCategory.name}</span>
        </a>
      )}

      {/* Category List */}
      <ul className="panel-list" role="menu">
        {categories.map(category => (
          <li key={category.id} role="none">
            <a
              href={`/${category.slug}`}
              role="menuitem"
              className="panel-item"
              onClick={(e) => handleItemClick(category, e)}
            >
              <CategoryIcon icon={category.metadata.icon} />
              <span className="panel-item__text">{category.name}</span>
              {category.hasChildren && <Chevron direction="right" />}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface CategoryNavigationProps {
  categories: Category[];
}

export function CategoryNavigation({ categories }: CategoryNavigationProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Responsive detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <NavigationProvider categories={categories}>
      {/* Skip Link */}
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      {/* Navigation */}
      {isMobile ? <MobileNav /> : <DesktopNav />}

      {/* Screen Reader Announcements */}
      <LiveRegion message={announcement} />
    </NavigationProvider>
  );
}

// =============================================================================
// CSS STYLES (CSS Modules or global stylesheet)
// =============================================================================

/*
The following CSS should be placed in a separate stylesheet.
This is provided as reference for the component styling.

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: 9999;
  padding: 16px 24px;
  background: #1E3A5F;
  color: white;
  text-decoration: none;
  border-radius: 0 0 8px 8px;
  transition: top 200ms;
}

.skip-link:focus {
  top: 0;
}

// Desktop Navigation
.desktop-nav {
  position: relative;
}

.nav-bar {
  display: flex;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 3px solid transparent;
  transition: background-color 100ms, color 100ms, border-color 100ms;
}

.nav-item:hover,
.nav-item:focus {
  background: #F3F4F6;
  color: #1E3A5F;
  border-bottom-color: #1E3A5F;
}

.nav-item--active {
  background: white;
  color: #1E3A5F;
  border-bottom-color: #E67E22;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
}

.nav-item:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

// Mega Menu
.mega-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15);
  animation: menuOpen 150ms ease-out;
}

@keyframes menuOpen {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mega-menu__content {
  display: flex;
  padding: 24px;
  max-height: 70vh;
  overflow: hidden;
}

.mega-menu__sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid #E5E7EB;
  padding-right: 24px;
}

.category-sidebar {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: #374151;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  background: #F8FAFC;
  border-left: 3px solid transparent;
  transition: all 100ms;
}

.sidebar-item:hover,
.sidebar-item--active {
  background: white;
  color: #1E3A5F;
  font-weight: 600;
  border-left-color: #E67E22;
}

.sidebar-item:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: -2px;
}

.see-all-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  color: #1E3A5F;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  margin-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.mega-menu__grid {
  flex: 1;
  padding-left: 24px;
  overflow-y: auto;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.grid-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  color: #4B5563;
  text-decoration: none;
  font-size: 14px;
  transition: all 100ms;
}

.grid-item:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #1E3A5F;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

.grid-item:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

.mega-menu__banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  margin-top: 16px;
  background: linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%);
  border-radius: 8px;
  color: white;
}

.banner-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.banner-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #E67E22;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  margin-top: 8px;
}

// Mobile Navigation
.hamburger-button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: #374151;
  transition: transform 200ms, opacity 200ms;
}

.hamburger-button--open .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(4px, 4px);
}

.hamburger-button--open .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger-button--open .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(4px, -4px);
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 250ms, visibility 250ms;
  z-index: 100;
}

.drawer-overlay--visible {
  opacity: 1;
  visibility: visible;
}

.nav-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 85%;
  max-width: 400px;
  background: white;
  transform: translateX(-100%);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 101;
  display: flex;
  flex-direction: column;
}

.nav-drawer--open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.drawer-close {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: none;
  border: none;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
}

.drawer-title {
  margin-left: auto;
  font-weight: 600;
  color: #1F2937;
}

.drawer-content {
  flex: 1;
  overflow: hidden;
}

.navigation-stack {
  position: relative;
  height: 100%;
}

.nav-panel {
  position: absolute;
  inset: 0;
  background: white;
  overflow-y: auto;
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms;
}

.nav-panel--active {
  transform: translateX(0);
  opacity: 1;
}

.nav-panel--previous {
  transform: translateX(-30%);
  opacity: 0.5;
}

.nav-panel--hidden {
  transform: translateX(-100%);
  opacity: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: none;
  border: none;
  color: #1E3A5F;
  font-size: 14px;
  cursor: pointer;
}

.panel-title {
  margin-left: auto;
  font-weight: 600;
  color: #1F2937;
}

.panel-breadcrumb {
  padding: 8px 16px;
  background: #F3F4F6;
  font-size: 12px;
  color: #6B7280;
  overflow-x: auto;
  white-space: nowrap;
}

.see-all-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #EFF6FF;
  color: #1E3A5F;
  text-decoration: none;
  font-weight: 600;
  border-bottom: 2px solid #DBEAFE;
}

.panel-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.panel-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  min-height: 56px;
  color: #374151;
  text-decoration: none;
  border-bottom: 1px solid #E5E7EB;
  transition: background-color 150ms;
}

.panel-item:active {
  background: #EFF6FF;
}

.panel-item__text {
  flex: 1;
}

// Skeleton loaders
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #E5E7EB 0%,
    #F3F4F6 50%,
    #E5E7EB 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-sidebar .skeleton-item {
  height: 48px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.skeleton-card {
  height: 48px;
  border-radius: 6px;
}

.skeleton-list .skeleton-row {
  height: 56px;
  margin-bottom: 1px;
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

*/

export default CategoryNavigation;
