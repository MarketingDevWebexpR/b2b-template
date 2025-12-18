/**
 * CMS Module Definition
 *
 * Module de gestion de contenu (CMS) pour le site e-commerce.
 * Fournit des fonctionnalites pour gerer le contenu dynamique du site,
 * notamment les bandeaux d'annonce.
 *
 * @packageDocumentation
 */

import { Module } from "@medusajs/framework/utils";
import CmsModuleService from "./service";

/**
 * Identifiant du module utilise pour l'injection de dependances
 * Note: Doit correspondre au nom de service derive du nom de table
 */
export const CMS_MODULE = "cmsService";

/**
 * CMS Module
 *
 * Enregistrer ce module dans medusa-config.ts:
 * ```typescript
 * modules: [
 *   { resolve: "./src/modules/cms" },
 * ]
 * ```
 */
export default Module(CMS_MODULE, {
  service: CmsModuleService,
});

// Re-export du service et des types
export { default as CmsModuleService } from "./service";
export type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  ListAnnouncementsFilters,
  PaginationOptions,
  AnnouncementBannerDTO,
  AnnouncementMetadata,
  // HeroSlide types
  CreateHeroSlideInput,
  UpdateHeroSlideInput,
  ListHeroSlidesFilters,
  HeroSlideDTO,
  HeroSlideMetadata,
} from "./service";

// Re-export des modeles
export {
  AnnouncementBanner,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  // HeroSlide model
  HeroSlide,
  DEFAULT_HERO_GRADIENT,
  DEFAULT_HERO_TEXT_COLOR,
  // Nouvelles constantes et types pour layout
  HERO_LAYOUT_TYPES,
  HERO_IMAGE_POSITIONS,
  DEFAULT_HERO_LAYOUT_TYPE,
  DEFAULT_HERO_IMAGE_POSITION,
  DEFAULT_HERO_OVERLAY_OPACITY,
} from "./models/index";

// Re-export des types pour le layout
export type { HeroLayoutType, HeroImagePosition } from "./models/index";
