import { Header, Footer } from '@/components/layout';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { SageSyncBadge } from '@/components/ui/SageSyncBadge';

interface ShopLayoutProps {
  children: React.ReactNode;
}

/**
 * Shop Layout
 *
 * Wraps all shop pages with the fixed header and footer.
 * Note: The header is fixed/transparent on pages with hero sections.
 * Pages that need header offset should use HeaderSpacer component individually.
 */
export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Promotional announcement bar */}
      <AnnouncementBar />

      {/* Fixed navigation header - transparent initially, solid on scroll */}
      <Header />

      {/* Main content area - hero sections handle their own spacing */}
      <main className="flex-1">{children}</main>

      {/* Site footer */}
      <Footer />

      {/* Sage ERP sync status indicator */}
      <SageSyncBadge />
    </div>
  );
}
