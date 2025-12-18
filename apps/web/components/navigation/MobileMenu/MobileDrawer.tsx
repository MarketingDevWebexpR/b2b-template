'use client';

import {
  memo,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import { BreadcrumbHeader } from './BreadcrumbHeader';
import { NavigationPanelContainer, type CategoryData } from './NavigationPanel';

// ============================================================================
// Types
// ============================================================================

export interface MobileDrawerProps {
  /** Root level categories to display */
  categories: CategoryData[];
  /** Function to get child categories for a given category ID */
  getChildCategories?: (categoryId: string) => CategoryData[];
  /** Callback when navigating to a category page */
  onNavigate?: (href: string) => void;
  /** Root menu title */
  rootTitle?: string;
  /** Optional header content (e.g., warehouse selector) */
  headerContent?: ReactNode;
  /** Optional footer content (e.g., contact info, account links) */
  footerContent?: ReactNode;
  /** Additional CSS classes for the drawer panel */
  className?: string;
  /** Whether to use portal for rendering */
  usePortal?: boolean;
}

// ============================================================================
// Animation Variants
// ============================================================================

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

// ============================================================================
// Focus Trap Hook
// ============================================================================

function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Store the previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus the first focusable element
    if (firstFocusable) {
      firstFocusable.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus when closing
      previouslyFocused?.focus();
    };
  }, [isActive, containerRef]);
}

// ============================================================================
// Body Scroll Lock Hook
// ============================================================================

function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Get current scroll position
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Apply styles to lock scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}

// ============================================================================
// Component
// ============================================================================

/**
 * Mobile Navigation Drawer
 *
 * Full-screen drawer that slides from the right, containing stacked
 * navigation panels for up to 5 levels of category hierarchy.
 *
 * Features:
 * - Full-screen overlay with dark backdrop
 * - Drawer panel (85vw max width)
 * - Framer Motion slide animation (300ms)
 * - Focus trap when open
 * - Body scroll lock
 * - Escape to close
 * - Safe area padding for notched devices
 * - Screen reader announcements
 *
 * @example
 * ```tsx
 * <MobileDrawer
 *   categories={categoryTree}
 *   getChildCategories={(id) => findChildren(id)}
 *   onNavigate={(href) => router.push(href)}
 *   rootTitle="Catalogue"
 *   footerContent={<ContactInfo />}
 * />
 * ```
 */
const MobileDrawer = memo(function MobileDrawer({
  categories,
  getChildCategories,
  onNavigate,
  rootTitle = 'Menu',
  headerContent,
  footerContent,
  className,
  usePortal = true,
}: MobileDrawerProps) {
  const { isOpen, closeMenu } = useMobileMenu();
  const drawerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Hooks
  // ============================================================================

  // Focus trap
  useFocusTrap(isOpen, drawerRef);

  // Body scroll lock
  useBodyScrollLock(isOpen);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        closeMenu();
      }
    },
    [closeMenu]
  );

  // Handle navigation
  const handleNavigate = useCallback(
    (href: string) => {
      if (onNavigate) {
        onNavigate(href);
      }
      closeMenu();
    },
    [onNavigate, closeMenu]
  );

  // ============================================================================
  // Render
  // ============================================================================

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className={cn(
              'fixed inset-0 z-50',
              'bg-black/50',
              // Only show on mobile/tablet
              'lg:hidden'
            )}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: 'tween',
              duration: 0.3,
              ease: [0.32, 0.72, 0, 1], // Custom easing for smooth feel
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation mobile"
            className={cn(
              // Fixed positioning
              'fixed top-0 right-0 bottom-0 z-50',
              // Width (85vw max, but full on very small screens)
              'w-[85vw] max-w-sm',
              // Visual styling
              'bg-white shadow-2xl',
              // Layout
              'flex flex-col',
              // Safe area padding for notched devices
              'pl-safe pr-safe',
              // Only show on mobile/tablet
              'lg:hidden',
              className
            )}
          >
            {/* Header with breadcrumb */}
            <BreadcrumbHeader
              rootTitle={rootTitle}
              onClose={closeMenu}
            />

            {/* Optional header content (e.g., warehouse selector) */}
            {headerContent && (
              <div className="border-b border-stroke-light">
                {headerContent}
              </div>
            )}

            {/* Navigation panels container */}
            <NavigationPanelContainer
              rootCategories={categories}
              getChildCategories={getChildCategories}
              onNavigate={handleNavigate}
              className="flex-1"
            />

            {/* Optional footer content */}
            {footerContent && (
              <div
                className={cn(
                  'border-t border-stroke-light',
                  'bg-surface-secondary',
                  // Safe area padding at bottom
                  'pb-safe'
                )}
              >
                {footerContent}
              </div>
            )}
          </motion.div>

          {/* Screen reader announcement */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            Menu de navigation ouvert
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Render in portal if enabled and on client
  if (usePortal && typeof window !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }

  return drawerContent;
});

// ============================================================================
// Default Footer Content Component
// ============================================================================

export interface DefaultFooterContentProps {
  /** Phone number to display */
  phoneNumber?: string;
  /** Additional links to show */
  links?: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
  }>;
}

/**
 * Default footer content for the mobile drawer.
 * Provides common footer elements like contact info and quick links.
 */
const DefaultFooterContent = memo(function DefaultFooterContent({
  phoneNumber = '01 23 45 67 89',
  links = [],
}: DefaultFooterContentProps) {
  return (
    <div className="p-4 space-y-3">
      {/* Quick links */}
      {links.length > 0 && (
        <nav aria-label="Liens rapides">
          <ul className="space-y-1">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3',
                    'px-3 py-2 rounded-lg',
                    'text-body text-content-secondary',
                    'hover:bg-white hover:text-content-primary',
                    'transition-colors duration-150'
                  )}
                >
                  {link.icon && (
                    <span className="text-content-muted">{link.icon}</span>
                  )}
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Phone CTA */}
      {phoneNumber && (
        <a
          href={`tel:${phoneNumber.replace(/\s/g, '')}`}
          className={cn(
            'flex items-center justify-center gap-2',
            'w-full px-4 py-3 rounded-lg',
            'bg-accent text-white font-medium',
            'hover:bg-accent/90',
            'transition-colors duration-150',
            // Focus
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2'
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>{phoneNumber}</span>
        </a>
      )}
    </div>
  );
});

export { MobileDrawer, DefaultFooterContent };
export default MobileDrawer;
