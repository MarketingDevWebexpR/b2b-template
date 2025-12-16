'use client';

import { B2BProvider } from '@/contexts/B2BContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { EmployeeProvider } from '@/contexts/EmployeeContext';
import { PricingProvider } from '@/contexts/PricingContext';
import { WarehouseProvider } from '@/contexts/WarehouseContext';
import {
  B2BHeaderEcom,
  B2BHeaderEcomSpacer,
  FooterEcom,
} from '@/components/layout';

interface B2BLayoutProps {
  children: React.ReactNode;
}

/**
 * B2B E-commerce Layout
 *
 * Modern e-commerce layout inspired by Leroy Merlin with:
 * - 3-level header (promo banner, main header, navigation)
 * - MegaMenu navigation
 * - Full-width content area
 * - E-commerce footer
 *
 * Providers:
 * - B2BProvider: Core B2B context (company, employee data)
 * - CompanyProvider: Company-specific data
 * - EmployeeProvider: Employee permissions and data
 * - WarehouseProvider: Warehouse/point of sale selection
 * - PricingProvider: B2B pricing rules
 */
export default function B2BLayout({ children }: B2BLayoutProps) {
  return (
    <B2BProvider mockMode={true}>
      <CompanyProvider>
        <EmployeeProvider>
          <WarehouseProvider>
            <PricingProvider>
              <div className="min-h-screen flex flex-col bg-white">
                {/* E-commerce Header */}
                <B2BHeaderEcom
                  showPromoBanner={true}
                  promoMessage="-15% sur toute la collection avec le code PRO15"
                  promoHref="/promotions"
                />

                {/* Header spacer to prevent content from going under fixed header */}
                <B2BHeaderEcomSpacer showPromoBanner={true} />

                {/* Main content */}
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
            </PricingProvider>
          </WarehouseProvider>
        </EmployeeProvider>
      </CompanyProvider>
    </B2BProvider>
  );
}
