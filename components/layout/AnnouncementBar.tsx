'use client';

import { X, Gift } from 'lucide-react';
import { useAnnouncement } from '@/contexts/AnnouncementContext';

export function AnnouncementBar() {
  const { isVisible, hide } = useAnnouncement();

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] bg-hermes-500 px-4 py-2.5 text-center text-white">
      <div className="mx-auto flex max-w-content-wide items-center justify-center gap-2">
        <Gift className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
        <p className="font-sans text-sm font-medium tracking-wide">
          <span className="hidden sm:inline">Noël approche ! </span>
          Commandez avant le <span className="font-semibold">23 décembre</span> pour recevoir vos cadeaux à temps
        </p>
      </div>
      <button
        onClick={hide}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/20"
        aria-label="Fermer l'annonce"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export default AnnouncementBar;
