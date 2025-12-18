'use client';

import { memo, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/types/cms';

// =============================================================================
// CONSTANTES
// =============================================================================

/**
 * Clé de stockage local pour les annonces fermées
 */
const DISMISSED_STORAGE_KEY = 'dismissed-announcements';

/**
 * Intervalle de rotation automatique du slider (en millisecondes)
 * 5 secondes par défaut
 */
const AUTO_ROTATE_INTERVAL_MS = 5000;

/**
 * Durée de la transition entre les annonces (en millisecondes)
 */
const TRANSITION_DURATION_MS = 400;

// =============================================================================
// UTILITAIRES LOCALSTORAGE
// =============================================================================

/**
 * Vérifie si une annonce a été fermée par l'utilisateur
 */
function isDismissed(announcementId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const dismissed = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!dismissed) return false;

    const dismissedIds: string[] = JSON.parse(dismissed);
    return dismissedIds.includes(announcementId);
  } catch {
    return false;
  }
}

/**
 * Marque une annonce comme fermée dans le localStorage
 */
function markDismissed(announcementId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const dismissed = localStorage.getItem(DISMISSED_STORAGE_KEY);
    const dismissedIds: string[] = dismissed ? JSON.parse(dismissed) : [];

    if (!dismissedIds.includes(announcementId)) {
      dismissedIds.push(announcementId);
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(dismissedIds));
    }
  } catch {
    // Échec silencieux si localStorage n'est pas disponible
  }
}

// =============================================================================
// HOOK PERSONNALISE - DETECTION PREFERS-REDUCED-MOTION
// =============================================================================

/**
 * Hook pour détecter si l'utilisateur préfère les animations réduites
 * Respecte les préférences d'accessibilité du système
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Vérifier si matchMedia est disponible (SSR safety)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Écouter les changements de préférence
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// =============================================================================
// COMPOSANT INDICATEUR DE PAGINATION
// =============================================================================

interface PaginationDotsProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  textColor: string;
}

/**
 * Composant d'indicateurs de pagination (petits points)
 * Permet la navigation directe vers une annonce spécifique
 */
const PaginationDots = memo(function PaginationDots({
  total,
  current,
  onSelect,
  textColor,
}: PaginationDotsProps) {
  // Ne pas afficher si une seule annonce
  if (total <= 1) return null;

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 ml-3"
      role="tablist"
      aria-label="Navigation des annonces"
    >
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1',
            index === current
              ? 'w-3 opacity-100'
              : 'opacity-40 hover:opacity-70'
          )}
          style={{ backgroundColor: textColor }}
          role="tab"
          aria-selected={index === current}
          aria-label={`Annonce ${index + 1} sur ${total}`}
          tabIndex={index === current ? 0 : -1}
        />
      ))}
    </div>
  );
});

PaginationDots.displayName = 'PaginationDots';

// =============================================================================
// COMPOSANT BOUTON DE NAVIGATION
// =============================================================================

interface NavButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  textColor: string;
  disabled?: boolean;
}

/**
 * Bouton de navigation discret pour le slider
 */
const NavButton = memo(function NavButton({
  direction,
  onClick,
  textColor,
  disabled = false,
}: NavButtonProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  const label = direction === 'prev' ? 'Annonce précédente' : 'Annonce suivante';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'hidden sm:flex items-center justify-center',
        'w-6 h-6 rounded-full',
        'opacity-40 hover:opacity-80 disabled:opacity-20',
        'transition-opacity duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
      )}
      style={{ color: textColor }}
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
});

NavButton.displayName = 'NavButton';

// =============================================================================
// COMPOSANT CONTENU D'ANNONCE
// =============================================================================

interface AnnouncementContentProps {
  announcement: Announcement;
  textColor: string;
}

/**
 * Contenu d'une annonce individuelle avec message et CTA
 * Structure optimisée : message centré + CTA clairement séparé
 */
const AnnouncementContent = memo(function AnnouncementContent({
  announcement,
  textColor,
}: AnnouncementContentProps) {
  const linkUrl = announcement.link_url;
  const linkText = announcement.link_text || 'En savoir plus';
  const isExternalLink = linkUrl?.startsWith('http');

  // Contenu du message
  const messageContent = (
    <span className="text-xs sm:text-sm font-medium">
      {announcement.message}
    </span>
  );

  // Bouton CTA avec style amélioré
  const ctaContent = linkUrl && (
    <span
      className={cn(
        'inline-flex items-center gap-1 ml-3',
        'text-xs font-semibold whitespace-nowrap',
        'px-2.5 py-0.5 rounded-full',
        'bg-white/15 hover:bg-white/25',
        'transition-colors duration-200',
        'group-hover:bg-white/25'
      )}
    >
      {linkText}
      {isExternalLink ? (
        <ExternalLink className="w-3 h-3" />
      ) : (
        <ChevronRight className="w-3 h-3" />
      )}
    </span>
  );

  // Wrapper avec ou sans lien
  if (linkUrl) {
    const linkProps = {
      className: cn(
        'group flex items-center justify-center',
        'min-w-0 flex-1',
        'hover:opacity-90 transition-opacity'
      ),
    };

    if (isExternalLink) {
      return (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          {...linkProps}
        >
          {messageContent}
          {ctaContent}
        </a>
      );
    }

    return (
      <Link href={linkUrl} {...linkProps}>
        {messageContent}
        {ctaContent}
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-center min-w-0 flex-1">
      {messageContent}
    </div>
  );
});

AnnouncementContent.displayName = 'AnnouncementContent';

// =============================================================================
// COMPOSANT PRINCIPAL - ANNOUNCEMENT BANNER
// =============================================================================

export interface AnnouncementBannerProps {
  /** Classes CSS additionnelles */
  className?: string;
  /** Intervalle de rotation automatique (ms), 0 pour désactiver */
  autoRotateInterval?: number;
}

/**
 * Banniere d'annonces CMS avec slider multi-annonces
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Single fetch on mount (NO POLLING) - the API route handles caching
 * - API cached for 1 hour with stale-while-revalidate for 24 hours
 * - Instant response from browser/CDN cache
 *
 * Fonctionnalites:
 * - Recupere les annonces depuis /api/cms/announcements (single fetch)
 * - Affiche plusieurs annonces avec rotation automatique
 * - Navigation par fleches et indicateurs de pagination
 * - Pause de l'animation au survol
 * - Support complet de l'accessibilite (ARIA, clavier, reduced-motion)
 * - Couleurs personnalisables depuis le CMS
 * - Persistance des annonces fermees via localStorage
 * - Animations fluides avec transitions CSS
 */
export const AnnouncementBanner = memo(function AnnouncementBanner({
  className,
  autoRotateInterval = AUTO_ROTATE_INTERVAL_MS,
}: AnnouncementBannerProps) {
  // État des données
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // État du slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // État de visibilité du banner
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Refs pour la gestion du timer
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Détection des préférences de mouvement réduit
  const prefersReducedMotion = usePrefersReducedMotion();

  // Filtrer les annonces non fermées et trier par priorité
  const activeAnnouncements = useMemo(() => {
    if (announcements.length === 0) return [];

    return [...announcements]
      .filter((a) => !isDismissed(a.id))
      .sort((a, b) => b.priority - a.priority);
  }, [announcements]);

  // Annonce actuellement affichée
  const currentAnnouncement = useMemo(() => {
    if (activeAnnouncements.length === 0) return null;
    // S'assurer que l'index est dans les limites
    const safeIndex = Math.min(currentIndex, activeAnnouncements.length - 1);
    return activeAnnouncements[safeIndex] || null;
  }, [activeAnnouncements, currentIndex]);

  // Nombre total d'annonces actives
  const totalAnnouncements = activeAnnouncements.length;

  // ==========================================================================
  // NAVIGATION DU SLIDER
  // ==========================================================================

  /**
   * Passer à l'annonce suivante avec animation
   */
  const goToNext = useCallback(() => {
    if (totalAnnouncements <= 1 || isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % totalAnnouncements);

    // Réinitialiser l'état de transition après l'animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);
  }, [totalAnnouncements, isTransitioning]);

  /**
   * Passer à l'annonce précédente avec animation
   */
  const goToPrev = useCallback(() => {
    if (totalAnnouncements <= 1 || isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) =>
      prev === 0 ? totalAnnouncements - 1 : prev - 1
    );

    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);
  }, [totalAnnouncements, isTransitioning]);

  /**
   * Aller directement à une annonce spécifique
   */
  const goToIndex = useCallback(
    (index: number) => {
      if (index === currentIndex || isTransitioning) return;

      setIsTransitioning(true);
      setCurrentIndex(index);

      setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITION_DURATION_MS);
    },
    [currentIndex, isTransitioning]
  );

  // ==========================================================================
  // ROTATION AUTOMATIQUE
  // ==========================================================================

  /**
   * Démarrer le timer de rotation automatique
   */
  const startAutoRotate = useCallback(() => {
    // Ne pas démarrer si désactivé, en pause, ou mouvement réduit préféré
    if (
      autoRotateInterval <= 0 ||
      isPaused ||
      prefersReducedMotion ||
      totalAnnouncements <= 1
    ) {
      return;
    }

    // Nettoyer le timer existant
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
    }

    autoRotateTimerRef.current = setInterval(() => {
      goToNext();
    }, autoRotateInterval);
  }, [autoRotateInterval, isPaused, prefersReducedMotion, totalAnnouncements, goToNext]);

  /**
   * Arrêter le timer de rotation automatique
   */
  const stopAutoRotate = useCallback(() => {
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }
  }, []);

  // Gérer la rotation automatique
  useEffect(() => {
    startAutoRotate();
    return () => stopAutoRotate();
  }, [startAutoRotate, stopAutoRotate]);

  // ==========================================================================
  // GESTION DU SURVOL (PAUSE)
  // ==========================================================================

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
    stopAutoRotate();
  }, [stopAutoRotate]);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Redémarrer la rotation quand isPaused change
  useEffect(() => {
    if (!isPaused) {
      startAutoRotate();
    }
  }, [isPaused, startAutoRotate]);

  // ==========================================================================
  // NAVIGATION CLAVIER
  // ==========================================================================

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          goToIndex(0);
          break;
        case 'End':
          event.preventDefault();
          goToIndex(totalAnnouncements - 1);
          break;
      }
    },
    [goToPrev, goToNext, goToIndex, totalAnnouncements]
  );

  // ==========================================================================
  // CHARGEMENT DES DONNEES (SINGLE FETCH - NO POLLING)
  // ==========================================================================

  useEffect(() => {
    let isMounted = true;

    async function fetchAnnouncements() {
      try {
        // Use default caching - the API route handles cache headers
        const response = await fetch('/api/cms/announcements');

        if (!response.ok) {
          console.error('Echec du chargement des annonces:', response.status);
          if (isMounted) setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (isMounted) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    // Single fetch on mount - NO POLLING
    // The API route caches for 1 hour, and stale-while-revalidate ensures
    // instant responses from cache while fresh data is fetched in background
    fetchAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================================================
  // ANIMATION D'ENTREE
  // ==========================================================================

  useEffect(() => {
    if (!isLoading && currentAnnouncement) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, currentAnnouncement]);

  // ==========================================================================
  // FERMETURE D'UNE ANNONCE
  // ==========================================================================

  const handleDismiss = useCallback(() => {
    if (!currentAnnouncement) return;

    setIsExiting(true);

    setTimeout(() => {
      markDismissed(currentAnnouncement.id);
      setIsVisible(false);
      setIsExiting(false);

      // Si c'était la dernière annonce, forcer le re-render
      // Sinon, ajuster l'index si nécessaire
      setAnnouncements((prev) => [...prev]);

      // Réinitialiser l'index si on a fermé la dernière
      if (currentIndex >= totalAnnouncements - 1) {
        setCurrentIndex(0);
      }
    }, 300);
  }, [currentAnnouncement, currentIndex, totalAnnouncements]);

  // ==========================================================================
  // SYNCHRONISER L'INDEX AVEC LE NOMBRE D'ANNONCES
  // ==========================================================================

  useEffect(() => {
    if (currentIndex >= totalAnnouncements && totalAnnouncements > 0) {
      setCurrentIndex(totalAnnouncements - 1);
    }
  }, [currentIndex, totalAnnouncements]);

  // ==========================================================================
  // RENDU CONDITIONNEL
  // ==========================================================================

  // Ne rien rendre si pas d'annonce active
  if (isLoading || !currentAnnouncement || (!isVisible && !isExiting)) {
    return null;
  }

  // Styles personnalisés depuis le CMS
  const backgroundColor = currentAnnouncement.background_color || '#0A0A0A';
  const textColor = currentAnnouncement.text_color || '#FFFFFF';

  return (
    <div
      ref={bannerRef}
      className={cn(
        // Styles de base
        'relative w-full py-2.5 px-4 overflow-hidden',
        // Animation d'entrée/sortie (respecte prefers-reduced-motion)
        prefersReducedMotion
          ? ''
          : 'transition-all duration-300 ease-out',
        isVisible && !isExiting
          ? 'opacity-100 translate-y-0 max-h-20'
          : 'opacity-0 -translate-y-full max-h-0',
        className
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Annonces importantes, ${currentIndex + 1} sur ${totalAnnouncements}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Zone de contenu avec aria-live pour les lecteurs d'écran */}
      <div
        aria-live={prefersReducedMotion ? 'polite' : 'off'}
        aria-atomic="true"
        className="sr-only"
      >
        {currentAnnouncement.message}
      </div>

      <div className="container mx-auto max-w-7xl flex items-center justify-center relative">
        {/* Structure: [Prev] [Dots] [Content] [Next] [Close] */}

        {/* Bouton précédent (gauche) */}
        {totalAnnouncements > 1 && (
          <NavButton
            direction="prev"
            onClick={goToPrev}
            textColor={textColor}
            disabled={isTransitioning}
          />
        )}

        {/* Indicateurs de pagination */}
        <PaginationDots
          total={totalAnnouncements}
          current={currentIndex}
          onSelect={goToIndex}
          textColor={textColor}
        />

        {/* Contenu de l'annonce avec transition */}
        <div
          className={cn(
            'flex-1 flex items-center justify-center px-4',
            // Animation de transition entre annonces
            prefersReducedMotion
              ? ''
              : 'transition-opacity duration-300',
            isTransitioning ? 'opacity-50' : 'opacity-100'
          )}
        >
          <AnnouncementContent
            announcement={currentAnnouncement}
            textColor={textColor}
          />
        </div>

        {/* Bouton suivant (droite) */}
        {totalAnnouncements > 1 && (
          <NavButton
            direction="next"
            onClick={goToNext}
            textColor={textColor}
            disabled={isTransitioning}
          />
        )}

        {/* Bouton de fermeture */}
        <button
          onClick={handleDismiss}
          className={cn(
            'ml-2 p-1.5 rounded-full',
            'opacity-60 hover:opacity-100',
            'transition-opacity duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
          )}
          style={{ color: textColor }}
          aria-label="Fermer cette annonce"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Indicateur mobile - compteur simple */}
      {totalAnnouncements > 1 && (
        <div
          className="sm:hidden absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] opacity-50"
          style={{ color: textColor }}
        >
          {currentIndex + 1}/{totalAnnouncements}
        </div>
      )}
    </div>
  );
});

AnnouncementBanner.displayName = 'AnnouncementBanner';

export default AnnouncementBanner;
