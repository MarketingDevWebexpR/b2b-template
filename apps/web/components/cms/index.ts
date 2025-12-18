/**
 * CMS Components
 *
 * Components for displaying CMS content from the Medusa backend.
 *
 * SSR Components:
 * - AnnouncementBannerSSR: Receives data via props for Server-Side Rendering
 * - HeroCarouselSSR: Receives data via props for Server-Side Rendering
 *
 * Client Components (legacy):
 * - AnnouncementBanner: Fetches data client-side (causes content flash)
 */

// SSR-compatible components (recommended)
export { AnnouncementBannerSSR, type AnnouncementBannerSSRProps } from './AnnouncementBannerSSR';

// Legacy client components (for backward compatibility)
export { AnnouncementBanner, type AnnouncementBannerProps } from './AnnouncementBanner';
