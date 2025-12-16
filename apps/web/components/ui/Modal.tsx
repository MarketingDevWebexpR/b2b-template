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

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking overlay closes the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
  /** Custom footer content */
  footer?: ReactNode;
  /** Children content */
  children: ReactNode;
}

/**
 * Modal size configurations
 */
const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

/**
 * Professional B2B Modal component.
 * Used for dialogs, confirmations, and focused workflows.
 */
const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
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

    const modalContent = (
      <div
        className={cn(
          'fixed inset-0 z-50',
          'flex items-center justify-center',
          'p-4'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Overlay */}
        <div
          className={cn(
            'fixed inset-0',
            'bg-black/50 backdrop-blur-sm',
            'animate-in fade-in duration-200'
          )}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal container */}
        <div
          ref={ref}
          className={cn(
            'relative w-full',
            modalSizes[size],
            'bg-b2b-bg-primary',
            'rounded-xl shadow-2xl',
            'animate-in fade-in zoom-in-95 duration-200',
            'max-h-[90vh] flex flex-col',
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
                'border-b border-b2b-border-light'
              )}
            >
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-b2b-section-title text-b2b-text-primary truncate"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="modal-description"
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
                'rounded-b-xl'
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
      return createPortal(modalContent, document.body);
    }

    return null;
  }
);

Modal.displayName = 'Modal';

/**
 * Confirmation Modal preset
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  /** Confirmation message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: 'primary' | 'danger';
  /** Loading state */
  isLoading?: boolean;
  /** Callback when confirmed */
  onConfirm: () => void;
}

const ConfirmModal = forwardRef<HTMLDivElement, ConfirmModalProps>(
  (
    {
      message,
      confirmText = 'Confirmer',
      cancelText = 'Annuler',
      confirmVariant = 'primary',
      isLoading = false,
      onConfirm,
      onClose,
      ...props
    },
    ref
  ) => {
    return (
      <Modal
        ref={ref}
        size="sm"
        onClose={onClose}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                'px-4 py-2',
                'text-b2b-body font-medium',
                'text-b2b-text-secondary',
                'bg-b2b-bg-primary',
                'border border-b2b-border',
                'rounded-lg',
                'hover:bg-b2b-bg-tertiary',
                'transition-colors duration-200',
                'disabled:opacity-50'
              )}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'px-4 py-2',
                'text-b2b-body font-medium',
                'text-white',
                confirmVariant === 'danger'
                  ? 'bg-b2b-danger hover:bg-b2b-danger-600'
                  : 'bg-b2b-primary hover:bg-b2b-primary-600',
                'rounded-lg',
                'transition-colors duration-200',
                'disabled:opacity-50',
                'flex items-center gap-2'
              )}
            >
              {isLoading && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {confirmText}
            </button>
          </div>
        }
        {...props}
      >
        <p className="text-b2b-body text-b2b-text-primary">{message}</p>
      </Modal>
    );
  }
);

ConfirmModal.displayName = 'ConfirmModal';

export { Modal, ConfirmModal, modalSizes };
