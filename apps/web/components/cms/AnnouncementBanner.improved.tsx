'use client';

import {
  memo,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Link from 'next/link';
import { X, ChevronRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/types/cms';

// ============================================================================
// CONSTANTS
// ============================================================================

const DISMISSED_STORAGE_KEY = 'dismissed-announcements';
const POLLING_INTERVAL_MS = 60 * 1000;
const DEFAULT_ROTATION_INTERVAL_MS = 6000;
const TRANSITION_DURATION_MS = 300;
const SWIPE_THRESHOLD_PX = 50;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isDismissed(announcementId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dismissed = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!dismissed) return false;
    const dismissedIds: string[] = JSON.parse(dismissed);
    return dismissedIds.includes(announcementId);
  } catch {
    return false;
  }
}

function markDismissed(announcementId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const dismissed = localStorage.getItem(DISMISSED_STORAGE_KEY);
    const dismissedIds: string[] = dismissed ? JSON.parse(dismissed) : [];
    if (!dismissedIds.includes(announcementId)) {
      dismissedIds.push(announcementId);
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(dismissedIds));
    }
  } catch {
    // Silently fail
  }
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to detect user's reduced motion preference
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

/**
 * Hook to handle swipe gestures on touch devices
 */
function useSwipeGesture(
  ref: React.RefObject<HTMLElement>,
  onSwipeLeft: () => void,
  onSwipeRight: () => void
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      // Only trigger if horizontal swipe is more significant than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD_PX) {
        if (diffX < 0) {
          onSwipeLeft();
        } else {
          onSwipeRight();
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight]);
}

// ============================================================================
// TYPES
// ============================================================================

export interface AnnouncementBannerProps {
  /** Additional CSS classes */
  className?: string;
  /** Enable auto-rotation (default: true) */
  autoRotate?: boolean;
  /** Rotation interval in ms (default: 6000) */
  rotationInterval?: number;
  /** Show navigation indicators (default: true) */
  showIndicators?: boolean;
  /** Callback when announcement is clicked */
  onAnnouncementClick?: (announcement: Announcement) => void;
  /** Callback when announcement is dismissed */
  onDismiss?: (announcementId: string) => void;
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Navigation indicator dots/dashes
 */
const NavigationIndicators = memo(function NavigationIndicators({
  total,
  current,
  onSelect,
  textColor,
}: {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  textColor: string;
}) {
  if (total <= 1) return null;

  return (
    <div
      className="flex items-center gap-1.5 ml-3"
      role="tablist"
      aria-label="Navigation des annonces"
    >
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          role="tab"
          aria-selected={index === current}
          aria-label={`Annonce ${index + 1} sur ${total}`}
          onClick={() => onSelect(index)}
          className={cn(
            // Touch target 44x44px
            'min-w-[44px] min-h-[44px] flex items-center justify-center',
            // Focus styles
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded'
          )}
        >
          <span
            className={cn(
              'h-0.5 rounded-full transition-all duration-300',
              index === current ? 'w-4 opacity-90' : 'w-2 opacity-40'
            )}
            style={{ backgroundColor: textColor }}
          />
        </button>
      ))}
    </div>
  );
});

/**
 * Close button with proper touch target
 */
const CloseButton = memo(function CloseButton({
  onClick,
  textColor,
}: {
  onClick: () => void;
  textColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Touch target 44x44px minimum
        'min-w-[44px] min-h-[44px] flex items-center justify-center',
        'opacity-60 hover:opacity-100',
        'transition-opacity duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded'
      )}
      style={{ color: textColor }}
      aria-label="Fermer cette annonce"
    >
      <X className="w-4 h-4" />
    </button>
  );
});

/**
 * CTA Link component with luxury styling
 */
const AnnouncementCTA = memo(function AnnouncementCTA({
  linkUrl,
  linkText,
  isExternal,
  textColor,
}: {
  linkUrl: string;
  linkText: string;
  isExternal: boolean;
  textColor: string;
}) {
  // Use gold accent for CTA on dark backgrounds, or inherit for light
  const ctaColor = textColor === '#FFFFFF' || textColor === '#ffffff'
    ? '#d4a84b'
    : textColor;

  const ctaContent = (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'text-xs font-semibold uppercase tracking-wider',
        'relative group/cta',
        'focus:outline-none'
      )}
      style={{ color: ctaColor }}
    >
      <span className="relative">
        {linkText}
        {/* Underline animation */}
        <span
          className={cn(
            'absolute bottom-0 left-0 w-full h-px',
            'origin-left scale-x-0 group-hover/cta:scale-x-100',
            'transition-transform duration-200'
          )}
          style={{ backgroundColor: ctaColor }}
        />
      </span>
      {isExternal ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ChevronRight className="w-3 h-3" />
      )}
    </span>
  );

  return ctaContent;
});

/**
 * Single announcement content
 */
const AnnouncementContent = memo(function AnnouncementContent({
  announcement,
  showCTA,
}: {
  announcement: Announcement;
  showCTA: boolean;
}) {
  const textColor = announcement.text_color || '#FFFFFF';
  const linkUrl = announcement.link_url;
  const linkText = announcement.link_text || 'Voir';
  const isExternal = linkUrl?.startsWith('http') ?? false;

  const messageContent = (
    <p className="text-xs sm:text-sm font-medium truncate max-w-[70vw] sm:max-w-none">
      {announcement.message}
    </p>
  );

  const ctaContent = showCTA && linkUrl && (
    <>
      {/* Separator */}
      <span
        className="hidden sm:block w-px h-4 mx-4 opacity-20"
        style={{ backgroundColor: textColor }}
        aria-hidden="true"
      />
      <AnnouncementCTA
        linkUrl={linkUrl}
        linkText={linkText}
        isExternal={isExternal}
        textColor={textColor}
      />
    </>
  );

  // Wrap in link if URL exists
  if (linkUrl) {
    const linkClasses = cn(
      'group flex items-center justify-center flex-1 min-w-0',
      'hover:opacity-90 transition-opacity',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded'
    );

    if (isExternal) {
      return (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
        >
          {messageContent}
          {ctaContent}
        </a>
      );
    }

    return (
      <Link href={linkUrl} className={linkClasses}>
        {messageContent}
        {ctaContent}
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-center flex-1 min-w-0">
      {messageContent}
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CMS Announcement Banner with Multi-Announcement Carousel
 *
 * Features:
 * - Displays multiple announcements in a rotating carousel
 * - Auto-rotation with pause on hover/focus
 * - Swipe navigation on touch devices
 * - Accessible with proper ARIA attributes
 * - Respects prefers-reduced-motion
 * - Smooth transitions between announcements
 * - Dismissible with localStorage persistence
 */
export const AnnouncementBanner = memo(function AnnouncementBanner({
  className,
  autoRotate = true,
  rotationInterval = DEFAULT_ROTATION_INTERVAL_MS,
  showIndicators = true,
  onAnnouncementClick,
  onDismiss,
}: AnnouncementBannerProps) {
  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs
  const bannerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const prefersReducedMotion = usePrefersReducedMotion();

  // Get active (non-dismissed) announcements sorted by priority
  const activeAnnouncements = useMemo(() => {
    return [...announcements]
      .filter((a) => !isDismissed(a.id))
      .sort((a, b) => b.priority - a.priority);
  }, [announcements]);

  const currentAnnouncement = activeAnnouncements[currentIndex] || null;
  const totalAnnouncements = activeAnnouncements.length;

  // Navigation functions
  const goToNext = useCallback(() => {
    if (totalAnnouncements <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalAnnouncements);
      setIsTransitioning(false);
    }, prefersReducedMotion ? 0 : TRANSITION_DURATION_MS / 2);
  }, [totalAnnouncements, prefersReducedMotion]);

  const goToPrevious = useCallback(() => {
    if (totalAnnouncements <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        prev === 0 ? totalAnnouncements - 1 : prev - 1
      );
      setIsTransitioning(false);
    }, prefersReducedMotion ? 0 : TRANSITION_DURATION_MS / 2);
  }, [totalAnnouncements, prefersReducedMotion]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index === currentIndex || index < 0 || index >= totalAnnouncements)
        return;

      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, prefersReducedMotion ? 0 : TRANSITION_DURATION_MS / 2);
    },
    [currentIndex, totalAnnouncements, prefersReducedMotion]
  );

  // Swipe gestures
  useSwipeGesture(
    bannerRef as React.RefObject<HTMLElement>,
    goToNext,
    goToPrevious
  );

  // Auto-rotation
  useEffect(() => {
    if (
      !autoRotate ||
      isPaused ||
      prefersReducedMotion ||
      totalAnnouncements <= 1
    ) {
      return;
    }

    timerRef.current = setInterval(goToNext, rotationInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    autoRotate,
    isPaused,
    prefersReducedMotion,
    totalAnnouncements,
    rotationInterval,
    goToNext,
  ]);

  // Pause on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fetch announcements
  useEffect(() => {
    let isMounted = true;

    async function fetchAnnouncements() {
      try {
        const response = await fetch('/api/cms/announcements', {
          cache: 'no-store',
        });

        if (!response.ok) {
          console.error('Failed to fetch announcements:', response.status);
          if (isMounted) setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (isMounted) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchAnnouncements();
    const pollInterval = setInterval(fetchAnnouncements, POLLING_INTERVAL_MS);

    const handleFocus = () => fetchAnnouncements();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Show banner after loading
  useEffect(() => {
    if (!isLoading && activeAnnouncements.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, activeAnnouncements.length]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    if (!currentAnnouncement) return;

    setIsExiting(true);

    setTimeout(
      () => {
        markDismissed(currentAnnouncement.id);
        onDismiss?.(currentAnnouncement.id);

        // Check if there are more announcements
        const remaining = activeAnnouncements.filter(
          (a) => a.id !== currentAnnouncement.id
        );

        if (remaining.length === 0) {
          setIsVisible(false);
        } else {
          // Move to next announcement
          setCurrentIndex((prev) =>
            prev >= remaining.length ? 0 : prev
          );
        }

        setIsExiting(false);
        // Force re-render
        setAnnouncements((prev) => [...prev]);
      },
      prefersReducedMotion ? 0 : TRANSITION_DURATION_MS
    );
  }, [currentAnnouncement, activeAnnouncements, onDismiss, prefersReducedMotion]);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && currentAnnouncement) {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentAnnouncement, handleDismiss]);

  // Don't render if no active announcements
  if (isLoading || !currentAnnouncement || (!isVisible && !isExiting)) {
    return null;
  }

  const backgroundColor = currentAnnouncement.background_color || '#0A0A0A';
  const textColor = currentAnnouncement.text_color || '#FFFFFF';

  return (
    <div
      ref={bannerRef}
      className={cn(
        // Base styles
        'relative w-full overflow-hidden',
        // Height: 40px as per --promo-height
        'h-10',
        // Animation
        'transition-all ease-out',
        prefersReducedMotion ? 'duration-0' : 'duration-300',
        isVisible && !isExiting
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-full',
        className
      )}
      style={{ backgroundColor, color: textColor }}
      role="region"
      aria-label="Annonces promotionnelles"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        // Only unpause if focus leaves the banner entirely
        if (!bannerRef.current?.contains(e.relatedTarget as Node)) {
          setIsPaused(false);
        }
      }}
    >
      {/* Screen reader announcement */}
      {totalAnnouncements > 1 && (
        <div className="sr-only">
          Annonce {currentIndex + 1} sur {totalAnnouncements}
        </div>
      )}

      <div className="container mx-auto max-w-7xl h-full flex items-center px-2 sm:px-4">
        {/* Close button - Left side */}
        <CloseButton onClick={handleDismiss} textColor={textColor} />

        {/* Announcement content - Center */}
        <div
          className={cn(
            'flex-1 flex items-center justify-center min-w-0',
            'transition-opacity',
            prefersReducedMotion ? 'duration-0' : 'duration-150',
            isTransitioning ? 'opacity-0' : 'opacity-100'
          )}
          role="group"
          aria-roledescription="annonce"
        >
          <AnnouncementContent
            announcement={currentAnnouncement}
            showCTA={true}
          />
        </div>

        {/* Navigation indicators - Right side */}
        {showIndicators && (
          <NavigationIndicators
            total={totalAnnouncements}
            current={currentIndex}
            onSelect={goToIndex}
            textColor={textColor}
          />
        )}
      </div>
    </div>
  );
});

AnnouncementBanner.displayName = 'AnnouncementBanner';

export default AnnouncementBanner;
