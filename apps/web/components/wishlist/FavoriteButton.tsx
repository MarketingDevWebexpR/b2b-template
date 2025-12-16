'use client';

/**
 * FavoriteButton Component
 *
 * Animated heart button for toggling products in the default favorites list.
 * Features smooth animations with framer-motion.
 */

import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/contexts/WishlistContext';
import type { Product } from '@/types';

// ============================================================================
// Types
// ============================================================================

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'default' | 'outline' | 'ghost';

interface FavoriteButtonProps {
  /** Product to toggle */
  product: Product;
  /** Button size */
  size?: ButtonSize;
  /** Button variant */
  variant?: ButtonVariant;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Custom tooltip text when not favorited */
  addTooltip?: string;
  /** Custom tooltip text when favorited */
  removeTooltip?: string;
  /** Callback after toggle */
  onToggle?: (isFavorite: boolean) => void;
  /** Additional className */
  className?: string;
  /** Aria label override */
  ariaLabel?: string;
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles: Record<ButtonSize, { button: string; icon: string }> = {
  sm: {
    button: 'w-8 h-8',
    icon: 'w-4 h-4',
  },
  md: {
    button: 'w-10 h-10',
    icon: 'w-5 h-5',
  },
  lg: {
    button: 'w-12 h-12',
    icon: 'w-6 h-6',
  },
};

const variantStyles: Record<ButtonVariant, { base: string; active: string; inactive: string }> = {
  default: {
    base: 'rounded-full shadow-sm',
    active: 'bg-red-50 text-red-500 hover:bg-red-100',
    inactive: 'bg-white text-neutral-500 hover:text-red-500 hover:bg-red-50',
  },
  outline: {
    base: 'rounded-full border-2',
    active: 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100',
    inactive: 'border-neutral-300 text-neutral-500 hover:border-red-500 hover:text-red-500',
  },
  ghost: {
    base: 'rounded-full',
    active: 'text-red-500 hover:bg-red-50',
    inactive: 'text-neutral-500 hover:text-red-500 hover:bg-red-50',
  },
};

// ============================================================================
// Heart Icon
// ============================================================================

interface HeartIconProps {
  filled: boolean;
  className?: string;
}

const HeartIcon = memo(function HeartIcon({ filled, className }: HeartIconProps) {
  return (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
});

// ============================================================================
// Particle Animation
// ============================================================================

const particles = Array.from({ length: 6 }, (_, i) => ({
  angle: (i * 60 * Math.PI) / 180,
  delay: i * 0.05,
}));

const ParticleEffect = memo(function ParticleEffect() {
  return (
    <AnimatePresence>
      {particles.map((particle, i) => (
        <motion.span
          key={i}
          initial={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 0,
            scale: 0.5,
            x: Math.cos(particle.angle) * 20,
            y: Math.sin(particle.angle) * 20,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.4,
            delay: particle.delay,
            ease: 'easeOut',
          }}
          className="absolute w-1.5 h-1.5 rounded-full bg-red-400"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-3px',
            marginTop: '-3px',
          }}
        />
      ))}
    </AnimatePresence>
  );
});

// ============================================================================
// Component
// ============================================================================

export const FavoriteButton = memo(function FavoriteButton({
  product,
  size = 'md',
  variant = 'default',
  showTooltip = true,
  addTooltip = 'Ajouter aux favoris',
  removeTooltip = 'Retirer des favoris',
  onToggle,
  className,
  ariaLabel,
}: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const isFav = isFavorite(product.id);
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isAnimating) return;

      setIsAnimating(true);

      // Show particles when adding to favorites
      if (!isFav) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 600);
      }

      try {
        await toggleFavorite(product);
        onToggle?.(!isFav);
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      } finally {
        setTimeout(() => setIsAnimating(false), 300);
      }
    },
    [product, isFav, isAnimating, toggleFavorite, onToggle]
  );

  const label = ariaLabel || (isFav ? removeTooltip : addTooltip);
  const tooltipText = isFav ? removeTooltip : addTooltip;

  return (
    <div className="relative group">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={isAnimating}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'relative flex items-center justify-center transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'disabled:cursor-wait',
          sizeStyle.button,
          variantStyle.base,
          isFav ? variantStyle.active : variantStyle.inactive,
          className
        )}
        aria-label={label}
        aria-pressed={isFav}
      >
        {/* Particles */}
        {showParticles && <ParticleEffect />}

        {/* Heart Icon with Animation */}
        <motion.div
          initial={false}
          animate={
            isAnimating
              ? {
                  scale: [1, 1.3, 0.9, 1.1, 1],
                }
              : { scale: 1 }
          }
          transition={{
            duration: 0.4,
            ease: 'easeInOut',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFav ? 'filled' : 'empty'}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <HeartIcon filled={isFav} className={sizeStyle.icon} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Ring Animation */}
        {isAnimating && isFav && (
          <motion.span
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-full border-2 border-red-400"
          />
        )}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={cn(
            'absolute z-10 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap',
            'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
            'transition-all duration-200 pointer-events-none',
            'bottom-full left-1/2 -translate-x-1/2 mb-2'
          )}
          role="tooltip"
        >
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
});

export default FavoriteButton;
