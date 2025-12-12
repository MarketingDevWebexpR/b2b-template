'use client';

import { SessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';
import { AnnouncementProvider } from '@/contexts/AnnouncementContext';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 * Includes NextAuth SessionProvider for authentication state
 * and AnnouncementProvider for site-wide announcements
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AnnouncementProvider>{children}</AnnouncementProvider>
    </SessionProvider>
  );
}
