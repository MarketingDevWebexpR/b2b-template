'use client';

import { SessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';
import { AnnouncementProvider } from '@/contexts/AnnouncementContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CartDrawer } from '@/components/cart';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 * Includes NextAuth SessionProvider for authentication state,
 * AnnouncementProvider for site-wide announcements,
 * CartProvider for shopping cart management,
 * and WishlistProvider for wishlist/favorites management
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider refetchOnWindowFocus={true} refetchWhenOffline={false}>
      <WishlistProvider>
        <CartProvider>
          <CartDrawer />
          <AnnouncementProvider>{children}</AnnouncementProvider>
        </CartProvider>
      </WishlistProvider>
    </SessionProvider>
  );
}
