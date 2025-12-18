'use client';

import { memo, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/types/cms';

// =============================================================================
// CONSTANTES
// =============================================================================

const DISMISSED_STORAGE_KEY = 'dismissed-announcements';
const AUTO_ROTATE_INTERVAL_MS = 5000;
const TRANSITION_DURATION_MS = 400;

// =============================================================================
// UTILITAIRES LOCALSTORAGE
// =============================================================================

function isDismissedClient(announcementId: string): boolean {
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
    // Silent fail
  }
}

// =============================================================================
// HOOK - PREFERS REDUCED MOTION
// =============================================================================

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface PaginationDotsProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  textColor: string;
}

const PaginationDots = memo(function PaginationDots({
  total,
  current,
  onSelect,
  textColor,
}: PaginationDotsProps) {
  if (total <= 1) return null;

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 ml-3"
      role="tablist"
      aria-label="Navigation des annonces"
    >
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1',
            index === current ? 'w-3 opacity-100' : 'opacity-40 hover:opacity-70'
          )}
          style={{ backgroundColor: textColor }}
          role="tab"
          aria-selected={index === current}
          aria-label={`Annonce ${index + 1} sur ${total}`}
          tabIndex={index === current ? 0 : -1}
        />
      ))}
    </div>
  );
});

PaginationDots.displayName = 'PaginationDots';

interface NavButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  textColor: string;
  disabled?: boolean;
}

const NavButton = memo(function NavButton({
  direction,
  onClick,
  textColor,
  disabled = false,
}: NavButtonProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  const label = direction === 'prev' ? 'Annonce precedente' : 'Annonce suivante';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'hidden sm:flex items-center justify-center',
        'w-6 h-6 rounded-full',
        'opacity-40 hover:opacity-80 disabled:opacity-20',
        'transition-opacity duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
      )}
      style={{ color: textColor }}
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
});

NavButton.displayName = 'NavButton';

interface AnnouncementContentProps {
  announcement: Announcement;
  textColor: string;
}

const AnnouncementContent = memo(function AnnouncementContent({
  announcement,
  textColor,
}: AnnouncementContentProps) {
  const linkUrl = announcement.link_url;
  const linkText = announcement.link_text || 'En savoir plus';
  const isExternalLink = linkUrl?.startsWith('http');

  const messageContent = (
    <span className="text-xs sm:text-sm font-medium">{announcement.message}</span>
  );

  const ctaContent = linkUrl && (
    <span
      className={cn(
        'inline-flex items-center gap-1 ml-3',
        'text-xs font-semibold whitespace-nowrap',
        'px-2.5 py-0.5 rounded-full',
        'bg-white/15 hover:bg-white/25',
        'transition-colors duration-200',
        'group-hover:bg-white/25'
      )}
    >
      {linkText}
      {isExternalLink ? (
        <ExternalLink className="w-3 h-3" />
      ) : (
        <ChevronRight className="w-3 h-3" />
      )}
    </span>
  );

  if (linkUrl) {
    const linkProps = {
      className: cn(
        'group flex items-center justify-center',
        'min-w-0 flex-1',
        'hover:opacity-90 transition-opacity'
      ),
    };

    if (isExternalLink) {
      return (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" {...linkProps}>
          {messageContent}
          {ctaContent}
        </a>
      );
    }

    return (
      <Link href={linkUrl} {...linkProps}>
        {messageContent}
        {ctaContent}
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-center min-w-0 flex-1">
      {messageContent}
    </div>
  );
});

AnnouncementContent.displayName = 'AnnouncementContent';

// =============================================================================
// MAIN COMPONENT - SSR COMPATIBLE
// =============================================================================

export interface AnnouncementBannerSSRProps {
  /**
   * Announcements data passed from Server Component.
   * When provided, the component renders immediately without client fetch.
   */
  announcements: Announcement[];
  /** Additional CSS classes */
  className?: string;
  /** Auto-rotate interval (ms), 0 to disable */
  autoRotateInterval?: number;
}

/**
 * AnnouncementBannerSSR - Server-Side Rendering Compatible
 *
 * This component receives announcement data via props from a Server Component,
 * eliminating the client-side fetch delay and preventing content flash.
 *
 * The component still handles:
 * - Client-side interactions (dismiss, navigation)
 * - LocalStorage for dismissed announcements (hydration-safe)
 * - Auto-rotation and animations
 *
 * Usage:
 * ```tsx
 * // In a Server Component (e.g., layout.tsx)
 * const announcements = await getAnnouncements();
 * return <AnnouncementBannerSSR announcements={announcements} />;
 * ```
 */
export const AnnouncementBannerSSR = memo(function AnnouncementBannerSSR({
  announcements: initialAnnouncements,
  className,
  autoRotateInterval = AUTO_ROTATE_INTERVAL_MS,
}: AnnouncementBannerSSRProps) {
  // State for announcements (allows updates from dismiss)
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  // Slider state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Visibility state (for dismiss animation)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isExiting, setIsExiting] = useState(false);

  // Refs
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  // Sync with localStorage on mount (hydration-safe)
  useEffect(() => {
    const dismissed = new Set<string>();
    initialAnnouncements.forEach((a) => {
      if (isDismissedClient(a.id)) {
        dismissed.add(a.id);
      }
    });
    setDismissedIds(dismissed);
  }, [initialAnnouncements]);

  // Filter and sort active announcements
  const activeAnnouncements = useMemo(() => {
    return [...announcements]
      .filter((a) => !dismissedIds.has(a.id))
      .sort((a, b) => b.priority - a.priority);
  }, [announcements, dismissedIds]);

  const currentAnnouncement = useMemo(() => {
    if (activeAnnouncements.length === 0) return null;
    const safeIndex = Math.min(currentIndex, activeAnnouncements.length - 1);
    return activeAnnouncements[safeIndex] || null;
  }, [activeAnnouncements, currentIndex]);

  const totalAnnouncements = activeAnnouncements.length;

  // Navigation
  const goToNext = useCallback(() => {
    if (totalAnnouncements <= 1 || isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % totalAnnouncements);

    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);
  }, [totalAnnouncements, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (totalAnnouncements <= 1 || isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? totalAnnouncements - 1 : prev - 1));

    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);
  }, [totalAnnouncements, isTransitioning]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index === currentIndex || isTransitioning) return;

      setIsTransitioning(true);
      setCurrentIndex(index);

      setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITION_DURATION_MS);
    },
    [currentIndex, isTransitioning]
  );

  // Auto-rotation
  const startAutoRotate = useCallback(() => {
    if (
      autoRotateInterval <= 0 ||
      isPaused ||
      prefersReducedMotion ||
      totalAnnouncements <= 1
    ) {
      return;
    }

    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
    }

    autoRotateTimerRef.current = setInterval(() => {
      goToNext();
    }, autoRotateInterval);
  }, [autoRotateInterval, isPaused, prefersReducedMotion, totalAnnouncements, goToNext]);

  const stopAutoRotate = useCallback(() => {
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoRotate();
    return () => stopAutoRotate();
  }, [startAutoRotate, stopAutoRotate]);

  // Hover pause
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
    stopAutoRotate();
  }, [stopAutoRotate]);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      startAutoRotate();
    }
  }, [isPaused, startAutoRotate]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          goToIndex(0);
          break;
        case 'End':
          event.preventDefault();
          goToIndex(totalAnnouncements - 1);
          break;
      }
    },
    [goToPrev, goToNext, goToIndex, totalAnnouncements]
  );

  // Dismiss handler
  const handleDismiss = useCallback(() => {
    if (!currentAnnouncement) return;

    setIsExiting(true);

    setTimeout(() => {
      markDismissed(currentAnnouncement.id);
      setDismissedIds((prev) => new Set([...prev, currentAnnouncement.id]));
      setIsExiting(false);

      if (currentIndex >= totalAnnouncements - 1) {
        setCurrentIndex(0);
      }
    }, 300);
  }, [currentAnnouncement, currentIndex, totalAnnouncements]);

  // Sync index with announcements count
  useEffect(() => {
    if (currentIndex >= totalAnnouncements && totalAnnouncements > 0) {
      setCurrentIndex(totalAnnouncements - 1);
    }
  }, [currentIndex, totalAnnouncements]);

  // Don't render if no active announcements
  if (!currentAnnouncement || activeAnnouncements.length === 0) {
    return null;
  }

  const backgroundColor = currentAnnouncement.background_color || '#0A0A0A';
  const textColor = currentAnnouncement.text_color || '#FFFFFF';

  return (
    <div
      ref={bannerRef}
      className={cn(
        'relative w-full py-2.5 px-4 overflow-hidden',
        prefersReducedMotion ? '' : 'transition-all duration-300 ease-out',
        isExiting ? 'opacity-0 -translate-y-full max-h-0' : 'opacity-100 translate-y-0 max-h-20',
        className
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Annonces importantes, ${currentIndex + 1} sur ${totalAnnouncements}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Screen reader live region */}
      <div
        aria-live={prefersReducedMotion ? 'polite' : 'off'}
        aria-atomic="true"
        className="sr-only"
      >
        {currentAnnouncement.message}
      </div>

      <div className="container mx-auto max-w-7xl flex items-center justify-center relative">
        {/* Previous button */}
        {totalAnnouncements > 1 && (
          <NavButton
            direction="prev"
            onClick={goToPrev}
            textColor={textColor}
            disabled={isTransitioning}
          />
        )}

        {/* Pagination dots */}
        <PaginationDots
          total={totalAnnouncements}
          current={currentIndex}
          onSelect={goToIndex}
          textColor={textColor}
        />

        {/* Content */}
        <div
          className={cn(
            'flex-1 flex items-center justify-center px-4',
            prefersReducedMotion ? '' : 'transition-opacity duration-300',
            isTransitioning ? 'opacity-50' : 'opacity-100'
          )}
        >
          <AnnouncementContent announcement={currentAnnouncement} textColor={textColor} />
        </div>

        {/* Next button */}
        {totalAnnouncements > 1 && (
          <NavButton
            direction="next"
            onClick={goToNext}
            textColor={textColor}
            disabled={isTransitioning}
          />
        )}

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={cn(
            'ml-2 p-1.5 rounded-full',
            'opacity-60 hover:opacity-100',
            'transition-opacity duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
          )}
          style={{ color: textColor }}
          aria-label="Fermer cette annonce"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile counter */}
      {totalAnnouncements > 1 && (
        <div
          className="sm:hidden absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] opacity-50"
          style={{ color: textColor }}
        >
          {currentIndex + 1}/{totalAnnouncements}
        </div>
      )}
    </div>
  );
});

AnnouncementBannerSSR.displayName = 'AnnouncementBannerSSR';

export default AnnouncementBannerSSR;
