import { NextResponse } from 'next/server';
import type { HeroSlidesResponse } from '@/types/cms';

/**
 * Medusa backend URL
 * Falls back to localhost:9000 for local development
 */
const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

/**
 * Cache duration constants
 * - REVALIDATE: How often Next.js revalidates the backend data (60 seconds)
 * - S_MAXAGE: CDN cache duration (60 seconds)
 * - STALE_WHILE_REVALIDATE: Serve stale content while revalidating (5 minutes)
 *
 * Note: For instant updates, use the revalidate endpoint at /api/cms/revalidate
 */
const CACHE_REVALIDATE_SECONDS = 60; // 1 minute
const CACHE_S_MAXAGE = 60; // 1 minute
const CACHE_STALE_WHILE_REVALIDATE = 300; // 5 minutes

/**
 * GET /api/cms/hero-slides
 *
 * Proxies to Medusa backend to fetch published hero slides.
 * Returns slides sorted by position for the homepage carousel.
 *
 * PERFORMANCE OPTIMIZATION:
 * - Aggressive caching: 1 hour revalidation (hero content rarely changes)
 * - stale-while-revalidate: Serve cached content instantly while fetching fresh data
 * - Single fetch per session: No polling from frontend
 *
 * To force update: Use on-demand revalidation via revalidatePath('/api/cms/hero-slides')
 */
export async function GET() {
  try {
    // Use the public CMS endpoint with aggressive caching
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/cms/hero-slides`,
      {
        // Next.js will cache and revalidate every hour
        next: { revalidate: CACHE_REVALIDATE_SECONDS },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(
        `CMS Hero Slides API error: ${response.status} ${response.statusText}`
      );

      // Return empty array on error with short cache to retry sooner
      return NextResponse.json<HeroSlidesResponse>(
        { slides: [] },
        {
          status: 200, // Return 200 with empty array for graceful degradation
          headers: {
            'Cache-Control': `public, s-maxage=300, stale-while-revalidate=600`,
          },
        }
      );
    }

    const data: HeroSlidesResponse = await response.json();

    return NextResponse.json<HeroSlidesResponse>(data, {
      headers: {
        // Aggressive caching for CDN and browsers
        // s-maxage: CDN caches for 1 hour
        // stale-while-revalidate: Serve stale for 24h while fetching fresh
        'Cache-Control': `public, s-maxage=${CACHE_S_MAXAGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
      },
    });
  } catch (error) {
    console.error('CMS Hero Slides API error:', error);

    // Return empty array on error with moderate cache
    return NextResponse.json<HeroSlidesResponse>(
      { slides: [] },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=300, stale-while-revalidate=600`,
        },
      }
    );
  }
}
