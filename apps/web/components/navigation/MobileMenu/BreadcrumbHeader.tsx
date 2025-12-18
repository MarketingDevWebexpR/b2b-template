'use client';

import { memo, useCallback, Fragment } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileMenu } from '@/contexts/MobileMenuContext';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbHeaderProps {
  /** Title to display when at root level */
  rootTitle?: string;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Breadcrumb Header for Mobile Navigation
 *
 * Displays a back button and breadcrumb trail showing the current
 * navigation path through the category hierarchy.
 *
 * Features:
 * - Back arrow button (48px touch target)
 * - Breadcrumb segments separated by chevrons
 * - Tap on segment to jump back to that level
 * - Close button on the right
 * - Safe area padding for notched devices
 *
 * @example
 * ```tsx
 * <BreadcrumbHeader
 *   rootTitle="Menu"
 *   onClose={() => closeMenu()}
 * />
 *
 * // Displays: <- Bagues > Or > 18 carats  [X]
 * ```
 */
const BreadcrumbHeader = memo(function BreadcrumbHeader({
  rootTitle = 'Menu',
  onClose,
  className,
}: BreadcrumbHeaderProps) {
  const {
    navigationStack,
    currentLevel,
    canGoBack,
    popCategory,
    navigateToLevel,
    closeMenu,
  } = useMobileMenu();

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleBack = useCallback(() => {
    popCategory();
  }, [popCategory]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      closeMenu();
    }
  }, [onClose, closeMenu]);

  const handleBreadcrumbClick = useCallback(
    (level: number) => {
      navigateToLevel(level);
    },
    [navigateToLevel]
  );

  // ============================================================================
  // Render
  // ============================================================================

  // Determine title to display
  const currentTitle = currentLevel > 0
    ? navigationStack[currentLevel - 1]?.name
    : rootTitle;

  return (
    <header
      className={cn(
        // Layout
        'flex items-center gap-2',
        'w-full h-14',
        'px-2 pr-2',
        // Visual styles
        'bg-white',
        'border-b border-stroke-light',
        // Safe area padding for notched devices
        'pt-safe',
        className
      )}
    >
      {/* Back button - only shown when not at root */}
      {canGoBack ? (
        <button
          type="button"
          onClick={handleBack}
          className={cn(
            // 48px touch target
            'flex items-center justify-center',
            'min-w-[48px] min-h-[48px] w-12 h-12',
            '-ml-2',
            'rounded-lg',
            // Visual
            'text-content-secondary',
            'hover:text-content-primary hover:bg-surface-secondary',
            // Transitions
            'transition-colors duration-150',
            // Focus
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30'
          )}
          aria-label="Retour"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      ) : (
        // Spacer when no back button
        <div className="w-2" />
      )}

      {/* Breadcrumb trail */}
      <nav
        className="flex-1 min-w-0 flex items-center overflow-hidden"
        aria-label="Navigation par fil d'Ariane"
      >
        {currentLevel === 0 ? (
          // Root level - just show title
          <h2 className="text-lg font-semibold text-content-primary truncate">
            {rootTitle}
          </h2>
        ) : (
          // Show breadcrumb trail
          <ol className="flex items-center gap-1 min-w-0 overflow-hidden">
            {navigationStack.map((item, index) => {
              const isLast = index === navigationStack.length - 1;
              const level = index + 1;

              return (
                <Fragment key={item.categoryId}>
                  {/* Breadcrumb item */}
                  <li className={cn('flex items-center min-w-0', isLast && 'flex-shrink-0')}>
                    {isLast ? (
                      // Current level - bold, not clickable
                      <span
                        className="text-body font-semibold text-content-primary truncate max-w-[150px]"
                        aria-current="page"
                      >
                        {item.name}
                      </span>
                    ) : (
                      // Previous level - clickable
                      <button
                        type="button"
                        onClick={() => handleBreadcrumbClick(level)}
                        className={cn(
                          'text-body text-content-muted truncate max-w-[100px]',
                          'hover:text-content-primary',
                          'transition-colors duration-150',
                          'focus:outline-none focus-visible:underline'
                        )}
                      >
                        {item.name}
                      </button>
                    )}
                  </li>

                  {/* Separator */}
                  {!isLast && (
                    <li className="flex-shrink-0 text-content-muted" aria-hidden="true">
                      <span className="text-caption">/</span>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        )}
      </nav>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className={cn(
          // 48px touch target
          'flex items-center justify-center',
          'min-w-[48px] min-h-[48px] w-12 h-12',
          '-mr-2',
          'rounded-lg',
          // Visual
          'text-content-secondary',
          'hover:text-content-primary hover:bg-surface-secondary',
          // Transitions
          'transition-colors duration-150',
          // Focus
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30'
        )}
        aria-label="Fermer le menu"
      >
        <X className="w-6 h-6" />
      </button>
    </header>
  );
});

export { BreadcrumbHeader };
export default BreadcrumbHeader;
