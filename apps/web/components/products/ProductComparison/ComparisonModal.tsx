'use client';

/**
 * ComparisonModal - Fullscreen Comparison Modal
 *
 * Displays the comparison table in a fullscreen modal:
 * - Uses the existing Modal component
 * - Contains ComparisonTable
 * - Responsive with horizontal scroll on mobile
 * - Close button and keyboard navigation
 *
 * @packageDocumentation
 */

import { memo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useComparison } from './ComparisonContext';
import { ComparisonTable } from './ComparisonTable';

// ============================================================================
// Types
// ============================================================================

export interface ComparisonModalProps {
  /** Whether modal is controlled externally */
  isOpen?: boolean;
  /** Callback when modal should close (for controlled mode) */
  onClose?: () => void;
  /** Whether to show the clear all button */
  showClearButton?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export const ComparisonModal = memo(function ComparisonModal({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  showClearButton = true,
  className,
}: ComparisonModalProps) {
  const {
    products,
    count,
    isModalOpen: contextIsOpen,
    closeModal: contextCloseModal,
    clearComparison,
  } = useComparison();

  // Use controlled or context state
  const isOpen = isOpenProp ?? contextIsOpen;
  const closeModal = onCloseProp ?? contextCloseModal;

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    },
    [closeModal]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    },
    [closeModal]
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

  // Handle clear and close
  const handleClearAndClose = useCallback(() => {
    clearComparison();
    closeModal();
  }, [clearComparison, closeModal]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'flex items-start justify-center',
        'overflow-y-auto',
        'animate-in fade-in duration-200'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
    >
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0',
          'bg-black/60 backdrop-blur-sm'
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        className={cn(
          'relative',
          'w-full max-w-7xl',
          'min-h-screen lg:min-h-0',
          'lg:my-8',
          'bg-white',
          'lg:rounded-xl lg:shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'sticky top-0 z-10',
            'flex items-center justify-between gap-4',
            'px-4 sm:px-6 py-4',
            'bg-white',
            'border-b border-neutral-200',
            'lg:rounded-t-xl'
          )}
        >
          <div className="flex-1 min-w-0">
            <h2
              id="comparison-modal-title"
              className="text-lg font-semibold text-neutral-900"
            >
              Comparaison
              <span className="ml-2 text-neutral-500 font-normal">
                ({count} {count === 1 ? 'produit' : 'produits'})
              </span>
            </h2>
            <p className="mt-1 text-sm text-neutral-600 hidden sm:block">
              Comparez les caracteristiques de vos produits selectionnes
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Clear button */}
            {showClearButton && count > 0 && (
              <button
                type="button"
                onClick={handleClearAndClose}
                className={cn(
                  'px-3 py-2',
                  'text-sm font-medium',
                  'text-neutral-600',
                  'hover:text-red-600 hover:bg-red-50',
                  'rounded-lg',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                  'hidden sm:flex items-center gap-2'
                )}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Tout effacer
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              className={cn(
                'p-2',
                'text-neutral-500 hover:text-neutral-900',
                'hover:bg-neutral-100',
                'rounded-lg',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
              aria-label="Fermer la comparaison"
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
          </div>
        </div>

        {/* Body - Comparison Table */}
        <div
          className={cn(
            'px-0 sm:px-4 py-4 sm:py-6',
            'overflow-x-auto'
          )}
        >
          {count >= 2 ? (
            <ComparisonTable
              products={products}
              showRemoveButton={true}
              showAddToCart={true}
              highlightBest={true}
            />
          ) : (
            <div
              className={cn(
                'flex flex-col items-center justify-center',
                'py-16 px-4',
                'text-center'
              )}
            >
              <svg
                className="w-20 h-20 text-neutral-400 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {count === 0
                  ? 'Aucun produit selectionne'
                  : 'Ajoutez un autre produit'}
              </h3>
              <p className="text-sm text-neutral-600 max-w-md">
                {count === 0
                  ? 'Selectionnez au moins 2 produits pour les comparer. Cliquez sur le bouton "Comparer" sur les fiches produits.'
                  : 'Selectionnez au moins 2 produits pour afficher le tableau comparatif.'}
              </p>
              <button
                type="button"
                onClick={closeModal}
                className={cn(
                  'mt-6',
                  'inline-flex items-center gap-2',
                  'px-5 py-2.5',
                  'bg-accent text-white',
                  'text-sm font-medium',
                  'rounded-lg',
                  'hover:bg-accent/90',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
                )}
              >
                Continuer mes achats
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {count >= 2 && (
          <div
            className={cn(
              'sticky bottom-0',
              'px-4 sm:px-6 py-4',
              'bg-neutral-50',
              'border-t border-neutral-200',
              'lg:rounded-b-xl',
              'flex items-center justify-between gap-4'
            )}
          >
            <p className="text-sm text-neutral-600 hidden sm:block">
              <span className="text-green-600 font-medium">Astuce:</span> Les
              meilleures valeurs sont mises en evidence en vert.
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={closeModal}
                className={cn(
                  'px-4 py-2.5',
                  'text-sm font-medium',
                  'text-neutral-600',
                  'bg-white',
                  'border border-neutral-200',
                  'rounded-lg',
                  'hover:bg-neutral-100',
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
              >
                Continuer mes achats
              </button>
            </div>
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
});

export default ComparisonModal;
