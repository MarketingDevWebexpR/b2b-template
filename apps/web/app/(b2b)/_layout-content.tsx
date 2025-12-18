'use client';

import { B2BProvider } from '@/contexts/B2BProvider';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';
import {
  B2BHeaderEcom,
  B2BHeaderEcomSpacer,
  FooterEcom,
} from '@/components/layout';

interface B2BLayoutContentProps {
  children: React.ReactNode;
}

/**
 * B2B E-commerce Layout Content (Client Component)
 *
 * Modern e-commerce layout inspired by Leroy Merlin with:
 * - 3-level header (promo banner, main header, navigation)
 * - MegaMenu navigation
 * - Full-width content area
 * - E-commerce footer
 *
 * Note: B2BProvider already includes all necessary providers
 * (CompanyProvider, EmployeeProvider, WarehouseProvider, PricingProvider, SearchProvider, OperationsProvider)
 * MobileMenuProvider is required for the mobile navigation drawer in B2BHeaderEcom.
 */
export default function B2BLayoutContent({ children }: B2BLayoutContentProps) {
  return (
    <B2BProvider mockMode={true}>
      <MobileMenuProvider>
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
      </MobileMenuProvider>
    </B2BProvider>
  );
}
