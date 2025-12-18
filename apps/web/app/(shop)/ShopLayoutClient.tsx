'use client';

/**
 * ShopLayoutClient Component
 *
 * Client-side wrapper for the shop layout that handles:
 * - React Context Providers via B2BProvider (Company, Employee, Warehouse, Pricing, Search, Operations)
 * - Header with SSR announcement data
 * - Footer
 * - Layout structure
 *
 * This component receives CMS data via props from the Server Component layout,
 * preventing the content flash caused by client-side fetching.
 *
 * Note: B2BProvider already includes all necessary providers (CompanyProvider,
 * EmployeeProvider, WarehouseProvider, PricingProvider, SearchProvider, OperationsProvider).
 * No additional nested providers are needed.
 */

import { B2BProvider } from '@/contexts/B2BProvider';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';
import {
  B2BHeaderEcomSSR,
  B2BHeaderEcomSSRSpacer,
  FooterEcom,
} from '@/components/layout';
import type { Announcement } from '@/types/cms';

interface ShopLayoutClientProps {
  children: React.ReactNode;
  /**
   * Announcement data from server-side fetch.
   * Passed to the header for SSR rendering.
   */
  announcements: Announcement[];
}

/**
 * Client wrapper for Shop Layout
 *
 * Receives CMS data from the Server Component parent and passes it
 * to the SSR-compatible header component.
 */
export default function ShopLayoutClient({
  children,
  announcements,
}: ShopLayoutClientProps) {
  const hasAnnouncements = announcements.length > 0;

  return (
    <B2BProvider mockMode={true}>
      <MobileMenuProvider>
        <div className="min-h-screen flex flex-col bg-white">
          {/* E-commerce Header with SSR announcement data */}
          <B2BHeaderEcomSSR announcements={announcements} />

          {/* Header spacer to prevent content from going under fixed header */}
          <B2BHeaderEcomSSRSpacer hasAnnouncements={hasAnnouncements} />

          {/* Main content area */}
          <main
            id="main-content"
            role="main"
            aria-label="Contenu principal"
            className="flex-1"
          >
            {children}
          </main>

          {/* E-commerce Footer */}
          <FooterEcom />
        </div>
      </MobileMenuProvider>
    </B2BProvider>
  );
}
