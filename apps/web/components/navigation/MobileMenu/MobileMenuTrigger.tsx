'use client';

import { memo, forwardRef, type ButtonHTMLAttributes } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileMenuDrawer } from '@/contexts/MobileMenuContext';

// ============================================================================
// Types
// ============================================================================

export interface MobileMenuTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Optional cart count to display as badge */
  cartCount?: number;
  /** Show cart badge even when count is 0 */
  showEmptyBadge?: boolean;
  /** Custom icon size */
  iconSize?: number;
  /** Variant for different visual styles */
  variant?: 'default' | 'minimal' | 'outlined';
}

// ============================================================================
// Component
// ============================================================================

/**
 * Mobile Menu Trigger Button
 *
 * Hamburger button that opens the mobile navigation drawer.
 * Supports an optional cart count badge overlay.
 *
 * Features:
 * - Touch-friendly 48px minimum touch target
 * - Optional cart count badge
 * - Multiple visual variants
 * - Accessible with aria labels
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MobileMenuTrigger />
 *
 * // With cart count
 * <MobileMenuTrigger cartCount={3} />
 *
 * // Minimal variant
 * <MobileMenuTrigger variant="minimal" />
 * ```
 */
const MobileMenuTrigger = memo(
  forwardRef<HTMLButtonElement, MobileMenuTriggerProps>(
    (
      {
        cartCount,
        showEmptyBadge = false,
        iconSize = 24,
        variant = 'default',
        className,
        'aria-label': ariaLabel,
        ...props
      },
      ref
    ) => {
      const { openMenu, isOpen } = useMobileMenuDrawer();

      // Show badge if cart has items, or if showEmptyBadge is true
      const showBadge = cartCount !== undefined && (cartCount > 0 || showEmptyBadge);
      const badgeContent = cartCount !== undefined && cartCount > 99 ? '99+' : cartCount;

      // Variant styles
      const variantStyles = {
        default: cn(
          'bg-transparent hover:bg-surface-secondary',
          'text-content-primary hover:text-content-primary',
          'border border-transparent'
        ),
        minimal: cn(
          'bg-transparent hover:bg-transparent',
          'text-content-secondary hover:text-content-primary'
        ),
        outlined: cn(
          'bg-transparent hover:bg-surface-secondary',
          'text-content-primary',
          'border border-stroke-light hover:border-stroke-medium'
        ),
      };

      return (
        <button
          ref={ref}
          type="button"
          onClick={openMenu}
          aria-label={ariaLabel || 'Ouvrir le menu de navigation'}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={cn(
            // Base styles - 48px minimum touch target
            'relative inline-flex items-center justify-center',
            'min-w-[48px] min-h-[48px] w-12 h-12',
            'rounded-lg',
            // Focus styles
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-white',
            // Transition
            'transition-colors duration-200',
            // Active state
            'active:scale-95 active:transition-transform active:duration-100',
            // Variant styles
            variantStyles[variant],
            // Only visible on mobile/tablet
            'lg:hidden',
            className
          )}
          {...props}
        >
          {/* Hamburger icon */}
          <Menu
            size={iconSize}
            strokeWidth={2}
            aria-hidden="true"
            className="flex-shrink-0"
          />

          {/* Cart count badge */}
          {showBadge && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5',
                'flex items-center justify-center',
                'min-w-[18px] h-[18px] px-1',
                'text-[10px] font-bold text-white',
                'bg-accent rounded-full',
                'ring-2 ring-white',
                // Animation for new items
                'animate-in fade-in zoom-in-50 duration-200'
              )}
              aria-label={`${cartCount} articles dans le panier`}
            >
              {badgeContent}
            </span>
          )}
        </button>
      );
    }
  )
);

MobileMenuTrigger.displayName = 'MobileMenuTrigger';

export { MobileMenuTrigger };
export default MobileMenuTrigger;
