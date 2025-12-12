'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AnnouncementContextType {
  isVisible: boolean;
  hide: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  const hide = () => setIsVisible(false);

  return (
    <AnnouncementContext.Provider value={{ isVisible, hide }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncement() {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  return context;
}
