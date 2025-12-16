'use client';

import { SessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';
import { FeatureProvider } from '@/contexts/FeatureContext';
import { AnnouncementProvider } from '@/contexts/AnnouncementContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CartDrawer } from '@/components/cart';
import {
  ComparisonProvider,
  ComparisonDrawer,
  ComparisonModal,
} from '@/components/products/ProductComparison';
import { ModuleGate, SubFeatureGate } from '@/components/features';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 * Includes:
 * - FeatureProvider for modular feature flags (white-label)
 * - NextAuth SessionProvider for authentication state
 * - AnnouncementProvider for site-wide announcements
 * - CartProvider for shopping cart management
 * - WishlistProvider for wishlist/favorites management
 * - ComparisonProvider for product comparison feature
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <FeatureProvider>
      <SessionProvider refetchOnWindowFocus={true} refetchWhenOffline={false}>
        <WishlistProvider>
          <CartProvider>
            <ComparisonProvider>
              {/* Cart Drawer - Feature Gated by cart module */}
              <ModuleGate module="cart">
                <CartDrawer />
              </ModuleGate>

              {/* Comparison UI - Feature Gated by comparison module */}
              <ModuleGate module="comparison">
                <ComparisonDrawer />
                <ComparisonModal />
              </ModuleGate>

              <AnnouncementProvider>{children}</AnnouncementProvider>
            </ComparisonProvider>
          </CartProvider>
        </WishlistProvider>
      </SessionProvider>
    </FeatureProvider>
  );
}
