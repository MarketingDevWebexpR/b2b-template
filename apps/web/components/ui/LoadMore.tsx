'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadMoreProps {
  /** Current number of visible items */
  currentCount: number;
  /** Total number of items available */
  totalCount: number;
  /** Number of items to load per click */
  loadIncrement?: number;
  /** Callback when user requests more items - returns new count */
  onLoadMore: (newCount: number) => void | Promise<void>;
  /** Custom loading state (for async operations) */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: 'default' | 'minimal' | 'outline';
  /** Custom text for the button */
  buttonText?: string;
}

const buttonVariants = {
  default: cn(
    'px-8 py-4',
    'bg-neutral-900 text-white',
    'hover:bg-neutral-800'
  ),
  minimal: cn(
    'px-6 py-3',
    'bg-transparent text-neutral-900',
    'border-b border-accent',
    'hover:text-accent'
  ),
  outline: cn(
    'px-8 py-4',
    'bg-transparent text-neutral-900',
    'border border-neutral-300',
    'hover:border-accent hover:text-accent'
  ),
};

const progressVariants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

/**
 * LoadMore - Elegant load more button with progress indicator
 *
 * Features:
 * - Visual progress bar showing loaded/total items
 * - Loading state with spinner
 * - Multiple variants (default, minimal, outline)
 * - Accessible with proper ARIA attributes
 * - Smooth animations
 */
export function LoadMore({
  currentCount,
  totalCount,
  loadIncrement = 12,
  onLoadMore,
  isLoading: externalLoading,
  className,
  variant = 'default',
  buttonText = 'Voir plus',
}: LoadMoreProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading ?? internalLoading;
  const hasMore = currentCount < totalCount;
  const progress = Math.min((currentCount / totalCount) * 100, 100);
  const remainingCount = Math.max(0, totalCount - currentCount);
  const nextLoadCount = Math.min(loadIncrement, remainingCount);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    const newCount = Math.min(currentCount + loadIncrement, totalCount);
    setInternalLoading(true);

    try {
      await onLoadMore(newCount);
    } finally {
      setInternalLoading(false);
    }
  }, [isLoading, hasMore, currentCount, loadIncrement, totalCount, onLoadMore]);

  if (!hasMore) {
    return (
      <motion.div
        className={cn('text-center', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-sans text-xs uppercase tracking-wide text-neutral-500">
          Vous avez vu tous les {totalCount} produits
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('flex flex-col items-center gap-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress Info */}
      <div className="flex flex-col items-center gap-3">
        <p className="font-sans text-sm text-neutral-500">
          <span className="font-medium text-neutral-900">{currentCount}</span>
          {' sur '}
          <span className="font-medium text-neutral-900">{totalCount}</span>
          {' produits'}
        </p>

        {/* Progress Bar */}
        <div className="relative h-px w-48 overflow-hidden bg-neutral-200">
          <motion.div
            className="absolute inset-y-0 left-0 bg-accent origin-left"
            style={{ width: `${progress}%` }}
            variants={progressVariants}
            initial="initial"
            animate="animate"
            key={currentCount}
          />
        </div>
      </div>

      {/* Load More Button */}
      <button
        onClick={handleLoadMore}
        disabled={isLoading}
        className={cn(
          'group relative inline-flex items-center justify-center gap-2',
          'font-sans text-xs font-medium uppercase tracking-wide',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          buttonVariants[variant]
        )}
        aria-label={`Charger ${nextLoadCount} produits supplementaires`}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="loading"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement...</span>
            </motion.span>
          ) : (
            <motion.span
              key="text"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span>{buttonText}</span>
              <ChevronDown
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-y-0.5"
                strokeWidth={1.5}
              />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Hover underline for minimal variant */}
        {variant === 'minimal' && (
          <span
            className={cn(
              'absolute -bottom-px left-0 h-px w-0 bg-accent',
              'transition-all duration-150',
              'group-hover:w-full'
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Remaining count hint */}
      <p className="font-sans text-xs text-neutral-400">
        {remainingCount} produit{remainingCount > 1 ? 's' : ''} restant{remainingCount > 1 ? 's' : ''}
      </p>
    </motion.div>
  );
}

export default LoadMore;
