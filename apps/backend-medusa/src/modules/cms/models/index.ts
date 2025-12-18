/**
 * CMS Models - Barrel Export
 *
 * Exporte tous les modeles du module CMS.
 *
 * @packageDocumentation
 */

export {
  AnnouncementBanner,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  default as AnnouncementBannerModel,
} from "./announcement-banner";

export {
  HeroSlide,
  DEFAULT_HERO_GRADIENT,
  DEFAULT_HERO_TEXT_COLOR,
  // Nouvelles constantes pour layout
  HERO_LAYOUT_TYPES,
  HERO_IMAGE_POSITIONS,
  DEFAULT_HERO_LAYOUT_TYPE,
  DEFAULT_HERO_IMAGE_POSITION,
  DEFAULT_HERO_OVERLAY_OPACITY,
  default as HeroSlideModel,
} from "./hero-slide";

// Re-export des types pour le layout
export type { HeroLayoutType, HeroImagePosition } from "./hero-slide";
