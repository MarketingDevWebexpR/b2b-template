'use client';

import { B2BProvider } from '@/contexts/B2BContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { EmployeeProvider } from '@/contexts/EmployeeContext';
import { WarehouseProvider } from '@/contexts/WarehouseContext';
import { PricingProvider } from '@/contexts/PricingContext';
import {
  B2BHeaderEcom,
  B2BHeaderEcomSpacer,
  FooterEcom,
} from '@/components/layout';
import { SageSyncBadge } from '@/components/ui/SageSyncBadge';

interface ShopLayoutProps {
  children: React.ReactNode;
}

/**
 * Shop Layout
 *
 * Public shop layout using B2B components with mock mode enabled.
 * Features:
 * - 3-level header (promo banner, main header, navigation)
 * - MegaMenu navigation
 * - Full-width content area
 * - E-commerce footer
 * - Sage ERP sync status indicator
 *
 * Providers (mockMode enabled for public shop):
 * - B2BProvider: Core B2B context (company, employee data)
 * - CompanyProvider: Company-specific data
 * - EmployeeProvider: Employee permissions and data
 * - WarehouseProvider: Warehouse/point of sale selection
 * - PricingProvider: B2B pricing rules
 */
export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <B2BProvider mockMode={true}>
      <CompanyProvider>
        <EmployeeProvider>
          <WarehouseProvider>
            <PricingProvider>
              <div className="min-h-screen flex flex-col bg-white">
                {/* E-commerce Header with promo banner */}
                <B2BHeaderEcom showPromoBanner={true} />

                {/* Header spacer to prevent content from going under fixed header */}
                <B2BHeaderEcomSpacer showPromoBanner={true} />

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

                {/* Sage ERP sync status indicator */}
                <SageSyncBadge />
              </div>
            </PricingProvider>
          </WarehouseProvider>
        </EmployeeProvider>
      </CompanyProvider>
    </B2BProvider>
  );
}
