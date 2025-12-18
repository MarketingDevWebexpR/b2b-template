/**
 * CMS Data Fetching Functions (Server-Side)
 *
 * These functions fetch CMS data directly from the Medusa backend
 * for Server-Side Rendering (SSR). They are meant to be called
 * from Server Components or during SSR/ISR.
 *
 * IMPORTANT: Do NOT use these functions in Client Components.
 * Use the API routes instead for client-side fetching.
 */

import type {
  Announcement,
  AnnouncementsResponse,
  HeroSlide,
  HeroSlidesResponse,
} from '@/types/cms';

/**
 * Medusa backend URL
 * Falls back to localhost:9000 for local development
 */
const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

/**
 * Cache duration constants for ISR
 * - Short: 60 seconds (for content that may change frequently)
 * - Medium: 300 seconds / 5 minutes (for semi-static content)
 * - Long: 3600 seconds / 1 hour (for rarely changing content)
 */
export const CACHE_DURATION = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
} as const;

// =============================================================================
// ANNOUNCEMENTS
// =============================================================================

/**
 * Fetch active announcements from Medusa CMS (Server-Side)
 *
 * Use this function in Server Components for SSR/ISR.
 * The data is cached and revalidated according to the revalidate option.
 *
 * @param revalidate - Cache revalidation period in seconds (default: 60)
 * @returns Array of active announcements sorted by priority
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const announcements = await getAnnouncements();
 * return <AnnouncementBanner announcements={announcements} />;
 * ```
 */
export async function getAnnouncements(
  revalidate: number = CACHE_DURATION.SHORT
): Promise<Announcement[]> {
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/cms/announcements`, {
      next: { revalidate },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(
        `[CMS] Failed to fetch announcements: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data: AnnouncementsResponse = await response.json();
    return data.announcements || [];
  } catch (error) {
    console.error('[CMS] Error fetching announcements:', error);
    return [];
  }
}

/**
 * Fetch a single active announcement (the highest priority one)
 *
 * Useful when you only need to display one announcement.
 *
 * @param revalidate - Cache revalidation period in seconds
 * @returns The highest priority active announcement or null
 */
export async function getActiveAnnouncement(
  revalidate: number = CACHE_DURATION.SHORT
): Promise<Announcement | null> {
  const announcements = await getAnnouncements(revalidate);

  if (announcements.length === 0) {
    return null;
  }

  // Sort by priority (highest first) and return the first one
  const sorted = [...announcements].sort((a, b) => b.priority - a.priority);
  return sorted[0];
}

// =============================================================================
// HERO SLIDES
// =============================================================================

/**
 * Fetch hero slides from Medusa CMS (Server-Side)
 *
 * Use this function in Server Components for SSR/ISR.
 * The data is cached and revalidated according to the revalidate option.
 *
 * @param revalidate - Cache revalidation period in seconds (default: 60)
 * @returns Array of hero slides sorted by position
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const slides = await getHeroSlides();
 * return <HeroCarousel slides={slides} />;
 * ```
 */
export async function getHeroSlides(
  revalidate: number = CACHE_DURATION.SHORT
): Promise<HeroSlide[]> {
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/cms/hero-slides`, {
      next: { revalidate },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(
        `[CMS] Failed to fetch hero slides: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data: HeroSlidesResponse = await response.json();
    return data.slides || [];
  } catch (error) {
    console.error('[CMS] Error fetching hero slides:', error);
    return [];
  }
}

// =============================================================================
// COMBINED FETCH FOR HOMEPAGE
// =============================================================================

/**
 * Homepage CMS data structure
 */
export interface HomepageCMSData {
  announcements: Announcement[];
  heroSlides: HeroSlide[];
}

/**
 * Fetch all CMS data needed for the homepage in parallel
 *
 * This is more efficient than fetching each piece of data separately.
 * Use this in the homepage Server Component.
 *
 * @param revalidate - Cache revalidation period in seconds (default: 60)
 * @returns All homepage CMS data
 *
 * @example
 * ```tsx
 * // In page.tsx (Server Component)
 * const cmsData = await getHomepageCMSData();
 * return (
 *   <>
 *     <Header announcements={cmsData.announcements} />
 *     <HeroCarousel slides={cmsData.heroSlides} />
 *   </>
 * );
 * ```
 */
export async function getHomepageCMSData(
  revalidate: number = CACHE_DURATION.SHORT
): Promise<HomepageCMSData> {
  const [announcements, heroSlides] = await Promise.all([
    getAnnouncements(revalidate),
    getHeroSlides(revalidate),
  ]);

  return {
    announcements,
    heroSlides,
  };
}
