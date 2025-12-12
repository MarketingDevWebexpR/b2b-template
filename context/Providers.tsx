'use client';

import { SessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';
import { AnnouncementProvider } from '@/contexts/AnnouncementContext';
import { CartProvider } from '@/contexts/CartContext';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 * Includes NextAuth SessionProvider for authentication state,
 * AnnouncementProvider for site-wide announcements,
 * and CartProvider for shopping cart management
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider>
        <AnnouncementProvider>{children}</AnnouncementProvider>
      </CartProvider>
    </SessionProvider>
  );
}
