'use client';

import {
  forwardRef,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Drawer title */
  title?: string;
  /** Drawer description */
  description?: string;
  /** Side from which the drawer slides in */
  side?: 'left' | 'right';
  /** Size variant (width) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether clicking overlay closes the drawer */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the drawer */
  closeOnEscape?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
  /** Custom footer content */
  footer?: ReactNode;
  /** Children content */
  children: ReactNode;
}

/**
 * Drawer size configurations
 */
const drawerSizes = {
  sm: 'max-w-xs w-full',
  md: 'max-w-md w-full',
  lg: 'max-w-lg w-full',
  xl: 'max-w-xl w-full',
};

/**
 * Professional B2B Drawer component.
 * Used for side panels, cart previews, filters, and detail views.
 */
const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      side = 'right',
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      footer,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Handle escape key
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape) {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    // Handle overlay click
    const handleOverlayClick = useCallback(
      (event: React.MouseEvent) => {
        if (event.target === event.currentTarget && closeOnOverlayClick) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    // Add/remove event listeners and body scroll lock
    useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const drawerContent = (
      <div
        className="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        aria-describedby={description ? 'drawer-description' : undefined}
      >
        {/* Overlay */}
        <div
          className={cn(
            'fixed inset-0',
            'bg-black/50 backdrop-blur-sm',
            'transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Drawer container */}
        <div
          ref={ref}
          className={cn(
            'fixed inset-y-0',
            side === 'left' ? 'left-0' : 'right-0',
            drawerSizes[size],
            'bg-b2b-bg-primary',
            'shadow-2xl',
            'flex flex-col',
            'transition-transform duration-300 ease-out',
            isOpen
              ? 'translate-x-0'
              : side === 'left'
                ? '-translate-x-full'
                : 'translate-x-full',
            className
          )}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div
              className={cn(
                'flex items-start justify-between gap-4',
                'px-6 py-4',
                'border-b border-b2b-border-light',
                'flex-shrink-0'
              )}
            >
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id="drawer-title"
                    className="text-b2b-section-title text-b2b-text-primary truncate"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="drawer-description"
                    className="mt-1 text-b2b-body-sm text-b2b-text-secondary"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'flex-shrink-0',
                    'p-2 -m-2',
                    'text-b2b-text-muted hover:text-b2b-text-primary',
                    'hover:bg-b2b-bg-tertiary',
                    'rounded-lg',
                    'transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary'
                  )}
                  aria-label="Fermer"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className={cn(
                'px-6 py-4',
                'border-t border-b2b-border-light',
                'bg-b2b-bg-secondary',
                'flex-shrink-0'
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    );

    // Render in portal
    if (typeof window !== 'undefined') {
      return createPortal(drawerContent, document.body);
    }

    return null;
  }
);

Drawer.displayName = 'Drawer';

export { Drawer, drawerSizes };
