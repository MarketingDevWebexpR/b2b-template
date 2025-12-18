import { getAnnouncements, CACHE_DURATION } from '@/lib/cms';
import ShopLayoutClient from './ShopLayoutClient';

interface ShopLayoutProps {
  children: React.ReactNode;
}

/**
 * Shop Layout (Server Component)
 *
 * Server-side layout that fetches CMS data before rendering.
 * This ensures all content is included in the initial HTML response,
 * preventing content flash (CLS issues).
 *
 * Architecture:
 * 1. This Server Component fetches CMS data (announcements)
 * 2. Data is passed to ShopLayoutClient (Client Component)
 * 3. ShopLayoutClient handles React Context and renders the UI
 *
 * Features:
 * - SSR for announcement banner (no flash)
 * - ISR with 60-second revalidation for fresh content
 * - Graceful degradation if CMS is unavailable
 *
 * Providers (in ShopLayoutClient):
 * - B2BProvider: Core B2B context (company, employee data)
 * - CompanyProvider: Company-specific data
 * - EmployeeProvider: Employee permissions and data
 * - WarehouseProvider: Warehouse/point of sale selection
 * - PricingProvider: B2B pricing rules
 */
export default async function ShopLayout({ children }: ShopLayoutProps) {
  // Fetch CMS announcements server-side with ISR caching
  const announcements = await getAnnouncements(CACHE_DURATION.SHORT);

  return (
    <ShopLayoutClient announcements={announcements}>
      {children}
    </ShopLayoutClient>
  );
}
