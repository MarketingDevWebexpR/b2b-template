'use client';

/**
 * useProductActionsVisibility Hook
 *
 * Detects when the product actions section scrolls out of view
 * to show/hide a sticky bottom bar.
 *
 * Uses Intersection Observer via Framer Motion's useInView for performance.
 */

import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';

interface UseProductActionsVisibilityOptions {
  /** Threshold before showing sticky bar (default: 0.5 = 50% visible) */
  threshold?: number;
  /** Delay before showing (ms) to prevent flash */
  showDelay?: number;
  /** Minimum scroll position to activate */
  minScrollY?: number;
}

interface UseProductActionsVisibilityReturn {
  /** Ref to attach to the sentinel element (original actions container) */
  sentinelRef: React.RefObject<HTMLDivElement>;
  /** Whether to show the sticky bar */
  shouldShowSticky: boolean;
  /** Whether the original actions are currently in view */
  isOriginalInView: boolean;
}

export function useProductActionsVisibility(
  options: UseProductActionsVisibilityOptions = {}
): UseProductActionsVisibilityReturn {
  const {
    threshold = 0.5,
    showDelay = 100,
    minScrollY = 200
  } = options;

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Use Framer Motion's useInView with margin to account for header
  const isInView = useInView(sentinelRef, {
    amount: threshold,
    margin: '0px 0px -100px 0px', // Account for fixed header height
  });

  const [shouldShowSticky, setShouldShowSticky] = useState(false);
  const [hasScrolledPastThreshold, setHasScrolledPastThreshold] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolledPastThreshold(window.scrollY > minScrollY);
    };

    // Check initial position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [minScrollY]);

  // Determine when to show sticky bar
  useEffect(() => {
    // Show sticky bar when:
    // 1. Original actions are NOT in view
    // 2. User has scrolled past the minimum threshold
    const shouldShow = !isInView && hasScrolledPastThreshold;

    if (shouldShow) {
      // Add small delay to prevent flash
      const timer = setTimeout(() => {
        setShouldShowSticky(true);
      }, showDelay);
      return () => clearTimeout(timer);
    } else {
      setShouldShowSticky(false);
    }
  }, [isInView, hasScrolledPastThreshold, showDelay]);

  return {
    sentinelRef,
    shouldShowSticky,
    isOriginalInView: isInView,
  };
}

export default useProductActionsVisibility;
