'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook pour gerer l'etat de l'overlay de recherche
 * avec support des raccourcis clavier
 */
export function useSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }

      // "/" key to open search (common pattern)
      if (e.key === '/' && !isSearchOpen) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        openSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, openSearch, toggleSearch]);

  return {
    isSearchOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  };
}

export default useSearch;
