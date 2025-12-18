/**
 * CMS Module Service
 *
 * Service pour la gestion du contenu CMS, incluant les bandeaux d'annonce.
 * Herite de MedusaService pour les operations CRUD standard.
 *
 * @packageDocumentation
 */

import { MedusaService } from "@medusajs/framework/utils";
import {
  AnnouncementBanner,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
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
import type { HeroLayoutType, HeroImagePosition } from "./models/index";
import {
  validateRequired,
  validateStringLength,
  validateOptional,
} from "../validation-utils";

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Configuration des metadonnees pour un bandeau d'annonce
 */
export interface AnnouncementMetadata {
  /** Identifiant de campagne marketing */
  campaign_id?: string;
  /** Tags pour le filtrage */
  tags?: string[];
  /** Configuration d'affichage specifique */
  display_config?: {
    /** Pages ou afficher le bandeau (vide = toutes) */
    pages?: string[];
    /** Classes CSS additionnelles */
    css_classes?: string[];
  };
  [key: string]: unknown;
}

/**
 * Input pour creer un bandeau d'annonce
 */
export interface CreateAnnouncementInput {
  message: string;
  link_url?: string;
  link_text?: string;
  background_color?: string;
  text_color?: string;
  start_date?: Date | string;
  end_date?: Date | string;
  is_active?: boolean;
  priority?: number;
  metadata?: AnnouncementMetadata;
}

/**
 * Input pour mettre a jour un bandeau d'annonce
 */
export interface UpdateAnnouncementInput {
  message?: string;
  link_url?: string | null;
  link_text?: string | null;
  background_color?: string;
  text_color?: string;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  is_active?: boolean;
  priority?: number;
  metadata?: AnnouncementMetadata | null;
}

/**
 * Filtres pour lister les bandeaux d'annonce
 */
export interface ListAnnouncementsFilters {
  is_active?: boolean;
  priority?: number;
  start_date?: Date | string;
  end_date?: Date | string;
}

/**
 * Options de pagination
 */
export interface PaginationOptions {
  skip?: number;
  take?: number;
}

/**
 * Type represantant un bandeau d'annonce retourne par les methodes du service
 */
export interface AnnouncementBannerDTO {
  id: string;
  message: string;
  link_url: string | null;
  link_text: string | null;
  background_color: string;
  text_color: string;
  start_date: Date | null;
  end_date: Date | null;
  is_active: boolean;
  priority: number;
  metadata: AnnouncementMetadata | null;
  created_at: Date;
  updated_at: Date;
}

// ==========================================
// HERO SLIDE TYPE DEFINITIONS
// ==========================================

/**
 * Configuration des metadonnees pour un slide hero
 */
export interface HeroSlideMetadata {
  /** Identifiant de campagne marketing */
  campaign_id?: string;
  /** Tags pour le filtrage */
  tags?: string[];
  /** Configuration d'animation */
  animation_config?: {
    /** Duree de la transition en ms */
    transition_duration?: number;
    /** Type d'animation */
    animation_type?: "fade" | "slide" | "zoom";
  };
  [key: string]: unknown;
}

/**
 * Input pour creer un slide hero
 */
export interface CreateHeroSlideInput {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  // Champs image
  image_url?: string;
  image_alt?: string;
  image_file_key?: string;
  // Champs layout
  layout_type?: HeroLayoutType;
  image_position?: HeroImagePosition;
  // Champs style
  gradient?: string;
  text_color?: string;
  overlay_opacity?: number;
  // Champs CTA
  cta_label: string;
  cta_href: string;
  secondary_cta_label?: string;
  secondary_cta_href?: string;
  // Champs affichage
  position?: number;
  is_published?: boolean;
  start_date?: Date | string;
  end_date?: Date | string;
  metadata?: HeroSlideMetadata;
}

/**
 * Input pour mettre a jour un slide hero
 */
export interface UpdateHeroSlideInput {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  badge?: string | null;
  // Champs image
  image_url?: string | null;
  image_alt?: string | null;
  image_file_key?: string | null;
  // Champs layout
  layout_type?: HeroLayoutType;
  image_position?: HeroImagePosition;
  // Champs style
  gradient?: string;
  text_color?: string;
  overlay_opacity?: number;
  // Champs CTA
  cta_label?: string;
  cta_href?: string;
  secondary_cta_label?: string | null;
  secondary_cta_href?: string | null;
  // Champs affichage
  position?: number;
  is_published?: boolean;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  metadata?: HeroSlideMetadata | null;
}

/**
 * Filtres pour lister les slides hero
 */
export interface ListHeroSlidesFilters {
  is_published?: boolean;
  position?: number;
  start_date?: Date | string;
  end_date?: Date | string;
}

/**
 * Type representant un slide hero retourne par les methodes du service
 */
export interface HeroSlideDTO {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  badge: string | null;
  // Champs image
  image_url: string | null;
  image_alt: string | null;
  image_file_key: string | null;
  // Champs layout
  layout_type: HeroLayoutType;
  image_position: HeroImagePosition;
  // Champs style
  gradient: string;
  text_color: string;
  overlay_opacity: number;
  // Champs CTA
  cta_label: string;
  cta_href: string;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  // Champs affichage
  position: number;
  is_published: boolean;
  start_date: Date | null;
  end_date: Date | null;
  metadata: HeroSlideMetadata | null;
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Valide un code couleur hexadecimal
 *
 * @param color - La couleur a valider
 * @param fieldName - Le nom du champ pour les messages d'erreur
 * @throws Error si le format est invalide
 */
function validateHexColor(color: string, fieldName: string): void {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(color)) {
    throw new Error(
      `${fieldName} doit etre un code couleur hexadecimal valide (ex: #ffffff)`
    );
  }
}

/**
 * Valide qu'une URL est bien formee
 *
 * @param url - L'URL a valider
 * @param fieldName - Le nom du champ pour les messages d'erreur
 * @throws Error si l'URL est invalide
 */
function validateUrl(url: string, fieldName: string): void {
  // Accepte les URLs relatives (/page) et absolues (https://...)
  if (!url.startsWith("/") && !url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(
      `${fieldName} doit etre une URL relative (commencant par /) ou absolue (commencant par http:// ou https://)`
    );
  }
}

/**
 * Valide la coherence des dates de debut et fin
 *
 * @param startDate - Date de debut
 * @param endDate - Date de fin
 * @throws Error si la date de fin est anterieure a la date de debut
 */
function validateDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined
): void {
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error("La date de fin doit etre posterieure a la date de debut");
  }
}

/**
 * Valide le type de layout d'un slide hero
 *
 * @param layoutType - Le type de layout a valider
 * @throws Error si le type n'est pas valide
 */
function validateLayoutType(layoutType: string): asserts layoutType is HeroLayoutType {
  if (!HERO_LAYOUT_TYPES.includes(layoutType as HeroLayoutType)) {
    throw new Error(
      `layout_type doit etre l'une des valeurs suivantes: ${HERO_LAYOUT_TYPES.join(", ")}`
    );
  }
}

/**
 * Valide la position de l'image pour le layout 'side'
 *
 * @param imagePosition - La position a valider
 * @throws Error si la position n'est pas valide
 */
function validateImagePosition(imagePosition: string): asserts imagePosition is HeroImagePosition {
  if (!HERO_IMAGE_POSITIONS.includes(imagePosition as HeroImagePosition)) {
    throw new Error(
      `image_position doit etre l'une des valeurs suivantes: ${HERO_IMAGE_POSITIONS.join(", ")}`
    );
  }
}

/**
 * Valide l'opacite de l'overlay (0-100)
 *
 * @param opacity - L'opacite a valider
 * @param fieldName - Le nom du champ pour les messages d'erreur
 * @throws Error si l'opacite n'est pas dans la plage valide
 */
function validateOverlayOpacity(opacity: number, fieldName: string): void {
  if (opacity < 0 || opacity > 100) {
    throw new Error(`${fieldName} doit etre compris entre 0 et 100`);
  }
}

// ==========================================
// CMS MODULE SERVICE
// ==========================================

/**
 * CMS Module Service
 *
 * Fournit la logique metier pour la gestion du contenu CMS.
 * Etend MedusaService pour obtenir automatiquement les operations CRUD.
 *
 * Methodes generees par MedusaService pour AnnouncementBanner:
 * - listAnnouncementBanners(filters?, config?) - liste des bandeaux
 * - listAndCountAnnouncementBanners(filters?, config?) - liste avec comptage
 * - retrieveAnnouncementBanner(id, config?) - recuperer un bandeau
 * - createAnnouncementBanners(data) - creer des bandeaux
 * - updateAnnouncementBanners(data) - mettre a jour des bandeaux
 * - deleteAnnouncementBanners(ids) - supprimer des bandeaux
 * - softDeleteAnnouncementBanners(ids) - suppression douce
 * - restoreAnnouncementBanners(ids) - restaurer des bandeaux supprimes
 *
 * @example
 * ```typescript
 * // Recuperer les bandeaux actifs
 * const activeBanners = await cmsService.getActiveAnnouncements();
 *
 * // Creer un nouveau bandeau
 * const banner = await cmsService.createAnnouncementWithValidation({
 *   message: "Nouvelle collection disponible!",
 *   link_url: "/collections/new",
 *   priority: 10,
 * });
 * ```
 */
class CmsModuleService extends MedusaService({
  AnnouncementBanner,
  HeroSlide,
}) {
  // ==========================================
  // CUSTOM ANNOUNCEMENT METHODS
  // ==========================================

  /**
   * Recupere les bandeaux d'annonce actuellement actifs.
   *
   * Filtre les bandeaux selon les criteres suivants:
   * - is_active = true
   * - start_date est null OU <= maintenant
   * - end_date est null OU >= maintenant
   *
   * Les resultats sont tries par priorite (DESC) puis par date de creation (DESC).
   *
   * @returns Liste des bandeaux actifs tries par priorite
   */
  async getActiveAnnouncements(): Promise<AnnouncementBannerDTO[]> {
    const now = new Date();

    // Recuperer tous les bandeaux actifs
    const banners = await this.listAnnouncementBanners(
      { is_active: true },
      { order: { priority: "DESC", created_at: "DESC" } }
    );

    // Filtrer ceux qui sont dans leur periode d'affichage
    const activeBanners = banners.filter((banner) => {
      const startDate = banner.start_date ? new Date(banner.start_date as Date) : null;
      const endDate = banner.end_date ? new Date(banner.end_date as Date) : null;

      // Verifier la date de debut
      if (startDate && startDate > now) {
        return false;
      }

      // Verifier la date de fin
      if (endDate && endDate < now) {
        return false;
      }

      return true;
    });

    return activeBanners as AnnouncementBannerDTO[];
  }

  /**
   * Cree un bandeau d'annonce avec validation complete des donnees.
   *
   * @param data - Donnees pour creer le bandeau
   * @returns Le bandeau cree
   * @throws Error si les donnees sont invalides
   */
  async createAnnouncementWithValidation(
    data: CreateAnnouncementInput
  ): Promise<AnnouncementBannerDTO> {
    // Validation du message (requis)
    validateRequired(data.message, "message");
    validateStringLength(data.message, "message", 1, 500);

    // Validation de l'URL si fournie
    validateOptional(data.link_url, (url) => {
      validateUrl(url, "link_url");
    });

    // Validation du texte du lien si fourni
    validateOptional(data.link_text, (text) => {
      validateStringLength(text, "link_text", 1, 100);
    });

    // Validation des couleurs si fournies
    const backgroundColor = data.background_color ?? DEFAULT_BACKGROUND_COLOR;
    const textColor = data.text_color ?? DEFAULT_TEXT_COLOR;

    validateHexColor(backgroundColor, "background_color");
    validateHexColor(textColor, "text_color");

    // Validation des dates
    const startDate = data.start_date ? new Date(data.start_date) : null;
    const endDate = data.end_date ? new Date(data.end_date) : null;
    validateDateRange(startDate, endDate);

    // Preparer les donnees pour la creation
    const bannerData = {
      message: data.message.trim(),
      link_url: data.link_url?.trim() ?? null,
      link_text: data.link_text?.trim() ?? null,
      background_color: backgroundColor,
      text_color: textColor,
      start_date: startDate,
      end_date: endDate,
      is_active: data.is_active ?? true,
      priority: data.priority ?? 0,
      metadata: data.metadata ?? null,
    };

    const banner = await this.createAnnouncementBanners(bannerData);
    return banner as AnnouncementBannerDTO;
  }

  /**
   * Met a jour un bandeau d'annonce avec validation.
   *
   * @param id - Identifiant du bandeau a mettre a jour
   * @param data - Donnees de mise a jour
   * @returns Le bandeau mis a jour
   * @throws Error si les donnees sont invalides ou si le bandeau n'existe pas
   */
  async updateAnnouncementWithValidation(
    id: string,
    data: UpdateAnnouncementInput
  ): Promise<AnnouncementBannerDTO> {
    // Verifier que le bandeau existe
    const existing = await this.retrieveAnnouncementBanner(id);

    // Validation du message si fourni
    if (data.message !== undefined) {
      validateRequired(data.message, "message");
      validateStringLength(data.message, "message", 1, 500);
    }

    // Validation de l'URL si fournie (null est valide pour supprimer)
    if (data.link_url !== undefined && data.link_url !== null) {
      validateUrl(data.link_url, "link_url");
    }

    // Validation du texte du lien si fourni
    if (data.link_text !== undefined && data.link_text !== null) {
      validateStringLength(data.link_text, "link_text", 1, 100);
    }

    // Validation des couleurs si fournies
    if (data.background_color !== undefined) {
      validateHexColor(data.background_color, "background_color");
    }
    if (data.text_color !== undefined) {
      validateHexColor(data.text_color, "text_color");
    }

    // Validation des dates
    const startDate = data.start_date !== undefined
      ? (data.start_date ? new Date(data.start_date) : null)
      : (existing.start_date ? new Date(existing.start_date as Date) : null);
    const endDate = data.end_date !== undefined
      ? (data.end_date ? new Date(data.end_date) : null)
      : (existing.end_date ? new Date(existing.end_date as Date) : null);
    validateDateRange(startDate, endDate);

    // Construire l'objet de mise a jour
    const updateData: Record<string, unknown> = { id };

    if (data.message !== undefined) {
      updateData.message = data.message.trim();
    }
    if (data.link_url !== undefined) {
      updateData.link_url = data.link_url?.trim() ?? null;
    }
    if (data.link_text !== undefined) {
      updateData.link_text = data.link_text?.trim() ?? null;
    }
    if (data.background_color !== undefined) {
      updateData.background_color = data.background_color;
    }
    if (data.text_color !== undefined) {
      updateData.text_color = data.text_color;
    }
    if (data.start_date !== undefined) {
      updateData.start_date = data.start_date ? new Date(data.start_date) : null;
    }
    if (data.end_date !== undefined) {
      updateData.end_date = data.end_date ? new Date(data.end_date) : null;
    }
    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    const updated = await this.updateAnnouncementBanners(updateData);
    return updated as AnnouncementBannerDTO;
  }

  /**
   * Active ou desactive un bandeau d'annonce.
   *
   * @param id - Identifiant du bandeau
   * @param isActive - Nouvel etat d'activation
   * @returns Le bandeau mis a jour
   */
  async toggleAnnouncementStatus(
    id: string,
    isActive: boolean
  ): Promise<AnnouncementBannerDTO> {
    // Verifier que le bandeau existe
    await this.retrieveAnnouncementBanner(id);

    const updated = await this.updateAnnouncementBanners({
      id,
      is_active: isActive,
    });

    return updated as AnnouncementBannerDTO;
  }

  /**
   * Duplique un bandeau d'annonce existant.
   * Utile pour creer des variantes d'une annonce.
   *
   * @param id - Identifiant du bandeau a dupliquer
   * @param overrides - Champs a modifier dans la copie
   * @returns Le nouveau bandeau cree
   */
  async duplicateAnnouncement(
    id: string,
    overrides?: Partial<CreateAnnouncementInput>
  ): Promise<AnnouncementBannerDTO> {
    const original = await this.retrieveAnnouncementBanner(id);

    const duplicateData: CreateAnnouncementInput = {
      message: overrides?.message ?? `${original.message} (copie)`,
      link_url: overrides?.link_url ?? (original.link_url as string | undefined),
      link_text: overrides?.link_text ?? (original.link_text as string | undefined),
      background_color: overrides?.background_color ?? (original.background_color as string),
      text_color: overrides?.text_color ?? (original.text_color as string),
      start_date: overrides?.start_date,
      end_date: overrides?.end_date,
      is_active: overrides?.is_active ?? false, // Desactive par defaut
      priority: overrides?.priority ?? ((original.priority as number) - 1), // Priorite inferieure
      metadata: overrides?.metadata ?? (original.metadata as AnnouncementMetadata | undefined),
    };

    return await this.createAnnouncementWithValidation(duplicateData);
  }

  /**
   * Liste les bandeaux d'annonce avec pagination et filtres.
   *
   * @param filters - Filtres optionnels
   * @param pagination - Options de pagination
   * @returns Liste des bandeaux et comptage total
   */
  async listAnnouncementsWithCount(
    filters?: ListAnnouncementsFilters,
    pagination?: PaginationOptions
  ): Promise<{ announcements: AnnouncementBannerDTO[]; count: number }> {
    const queryFilters: Record<string, unknown> = {};

    if (filters?.is_active !== undefined) {
      queryFilters.is_active = filters.is_active;
    }
    if (filters?.priority !== undefined) {
      queryFilters.priority = filters.priority;
    }

    const config = {
      skip: pagination?.skip ?? 0,
      take: pagination?.take ?? 20,
      order: { priority: "DESC" as const, created_at: "DESC" as const },
    };

    const [announcements, allAnnouncements] = await Promise.all([
      this.listAnnouncementBanners(queryFilters, config),
      this.listAnnouncementBanners(queryFilters, { select: ["id"] }),
    ]);

    return {
      announcements: announcements as AnnouncementBannerDTO[],
      count: allAnnouncements.length,
    };
  }

  // ==========================================
  // CUSTOM HERO SLIDE METHODS
  // ==========================================

  /**
   * Recupere les slides hero actuellement publiees et actives.
   *
   * Filtre les slides selon les criteres suivants:
   * - is_published = true
   * - start_date est null OU <= maintenant
   * - end_date est null OU >= maintenant
   *
   * Les resultats sont tries par position (ASC).
   *
   * @returns Liste des slides publiees triees par position
   */
  async getPublishedHeroSlides(): Promise<HeroSlideDTO[]> {
    const now = new Date();

    // Recuperer tous les slides publies
    const slides = await this.listHeroSlides(
      { is_published: true },
      { order: { position: "ASC", created_at: "DESC" } }
    );

    // Filtrer ceux qui sont dans leur periode d'affichage
    const activeSlides = slides.filter((slide) => {
      const startDate = slide.start_date ? new Date(slide.start_date as Date) : null;
      const endDate = slide.end_date ? new Date(slide.end_date as Date) : null;

      // Verifier la date de debut
      if (startDate && startDate > now) {
        return false;
      }

      // Verifier la date de fin
      if (endDate && endDate < now) {
        return false;
      }

      return true;
    });

    return activeSlides as HeroSlideDTO[];
  }

  /**
   * Cree un slide hero avec validation complete des donnees.
   *
   * @param data - Donnees pour creer le slide
   * @returns Le slide cree
   * @throws Error si les donnees sont invalides
   */
  async createHeroSlideWithValidation(
    data: CreateHeroSlideInput
  ): Promise<HeroSlideDTO> {
    // Validation du titre (requis)
    validateRequired(data.title, "title");
    validateStringLength(data.title, "title", 1, 200);

    // Validation du CTA (requis)
    validateRequired(data.cta_label, "cta_label");
    validateStringLength(data.cta_label, "cta_label", 1, 100);
    validateRequired(data.cta_href, "cta_href");

    // Validation de l'URL CTA
    validateUrl(data.cta_href, "cta_href");

    // Validation du CTA secondaire si fourni
    if (data.secondary_cta_href) {
      validateUrl(data.secondary_cta_href, "secondary_cta_href");
    }

    // Validation des champs optionnels
    validateOptional(data.subtitle, (text) => {
      validateStringLength(text, "subtitle", 1, 200);
    });

    validateOptional(data.description, (text) => {
      validateStringLength(text, "description", 1, 500);
    });

    validateOptional(data.badge, (text) => {
      validateStringLength(text, "badge", 1, 50);
    });

    // Validation du layout_type si fourni
    const layoutType = data.layout_type ?? DEFAULT_HERO_LAYOUT_TYPE;
    validateLayoutType(layoutType);

    // Validation de image_position si fourni
    const imagePosition = data.image_position ?? DEFAULT_HERO_IMAGE_POSITION;
    validateImagePosition(imagePosition);

    // Validation de overlay_opacity si fourni
    const overlayOpacity = data.overlay_opacity ?? DEFAULT_HERO_OVERLAY_OPACITY;
    validateOverlayOpacity(overlayOpacity, "overlay_opacity");

    // Validation des dates
    const startDate = data.start_date ? new Date(data.start_date) : null;
    const endDate = data.end_date ? new Date(data.end_date) : null;
    validateDateRange(startDate, endDate);

    // Determiner la position (dernier + 1 si non specifie)
    let position = data.position;
    if (position === undefined) {
      const allSlides = await this.listHeroSlides({}, { order: { position: "DESC" }, take: 1 });
      position = allSlides.length > 0 ? ((allSlides[0].position as number) + 1) : 0;
    }

    // Preparer les donnees pour la creation
    const slideData = {
      title: data.title.trim(),
      subtitle: data.subtitle?.trim() ?? null,
      description: data.description?.trim() ?? null,
      badge: data.badge?.trim() ?? null,
      // Champs image
      image_url: data.image_url?.trim() ?? null,
      image_alt: data.image_alt?.trim() ?? null,
      image_file_key: data.image_file_key?.trim() ?? null,
      // Champs layout
      layout_type: layoutType,
      image_position: imagePosition,
      // Champs style
      gradient: data.gradient ?? DEFAULT_HERO_GRADIENT,
      text_color: data.text_color ?? DEFAULT_HERO_TEXT_COLOR,
      overlay_opacity: overlayOpacity,
      // Champs CTA
      cta_label: data.cta_label.trim(),
      cta_href: data.cta_href.trim(),
      secondary_cta_label: data.secondary_cta_label?.trim() ?? null,
      secondary_cta_href: data.secondary_cta_href?.trim() ?? null,
      // Champs affichage
      position,
      is_published: data.is_published ?? false,
      start_date: startDate,
      end_date: endDate,
      metadata: data.metadata ?? null,
    };

    const slide = await this.createHeroSlides(slideData);
    return slide as HeroSlideDTO;
  }

  /**
   * Met a jour un slide hero avec validation.
   *
   * @param id - Identifiant du slide a mettre a jour
   * @param data - Donnees de mise a jour
   * @returns Le slide mis a jour
   * @throws Error si les donnees sont invalides ou si le slide n'existe pas
   */
  async updateHeroSlideWithValidation(
    id: string,
    data: UpdateHeroSlideInput
  ): Promise<HeroSlideDTO> {
    // Verifier que le slide existe
    const existing = await this.retrieveHeroSlide(id);

    // Validation du titre si fourni
    if (data.title !== undefined) {
      validateRequired(data.title, "title");
      validateStringLength(data.title, "title", 1, 200);
    }

    // Validation du CTA si fourni
    if (data.cta_label !== undefined) {
      validateRequired(data.cta_label, "cta_label");
      validateStringLength(data.cta_label, "cta_label", 1, 100);
    }

    if (data.cta_href !== undefined) {
      validateRequired(data.cta_href, "cta_href");
      validateUrl(data.cta_href, "cta_href");
    }

    // Validation du CTA secondaire si fourni
    if (data.secondary_cta_href !== undefined && data.secondary_cta_href !== null) {
      validateUrl(data.secondary_cta_href, "secondary_cta_href");
    }

    // Validation du layout_type si fourni
    if (data.layout_type !== undefined) {
      validateLayoutType(data.layout_type);
    }

    // Validation de image_position si fourni
    if (data.image_position !== undefined) {
      validateImagePosition(data.image_position);
    }

    // Validation de overlay_opacity si fourni
    if (data.overlay_opacity !== undefined) {
      validateOverlayOpacity(data.overlay_opacity, "overlay_opacity");
    }

    // Validation des dates
    const startDate = data.start_date !== undefined
      ? (data.start_date ? new Date(data.start_date) : null)
      : (existing.start_date ? new Date(existing.start_date as Date) : null);
    const endDate = data.end_date !== undefined
      ? (data.end_date ? new Date(data.end_date) : null)
      : (existing.end_date ? new Date(existing.end_date as Date) : null);
    validateDateRange(startDate, endDate);

    // Construire l'objet de mise a jour
    const updateData: Record<string, unknown> = { id };

    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }
    if (data.subtitle !== undefined) {
      updateData.subtitle = data.subtitle?.trim() ?? null;
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() ?? null;
    }
    if (data.badge !== undefined) {
      updateData.badge = data.badge?.trim() ?? null;
    }
    // Champs image
    if (data.image_url !== undefined) {
      updateData.image_url = data.image_url?.trim() ?? null;
    }
    if (data.image_alt !== undefined) {
      updateData.image_alt = data.image_alt?.trim() ?? null;
    }
    if (data.image_file_key !== undefined) {
      updateData.image_file_key = data.image_file_key?.trim() ?? null;
    }
    // Champs layout
    if (data.layout_type !== undefined) {
      updateData.layout_type = data.layout_type;
    }
    if (data.image_position !== undefined) {
      updateData.image_position = data.image_position;
    }
    // Champs style
    if (data.gradient !== undefined) {
      updateData.gradient = data.gradient;
    }
    if (data.text_color !== undefined) {
      updateData.text_color = data.text_color;
    }
    if (data.overlay_opacity !== undefined) {
      updateData.overlay_opacity = data.overlay_opacity;
    }
    // Champs CTA
    if (data.cta_label !== undefined) {
      updateData.cta_label = data.cta_label.trim();
    }
    if (data.cta_href !== undefined) {
      updateData.cta_href = data.cta_href.trim();
    }
    if (data.secondary_cta_label !== undefined) {
      updateData.secondary_cta_label = data.secondary_cta_label?.trim() ?? null;
    }
    if (data.secondary_cta_href !== undefined) {
      updateData.secondary_cta_href = data.secondary_cta_href?.trim() ?? null;
    }
    // Champs affichage
    if (data.position !== undefined) {
      updateData.position = data.position;
    }
    if (data.is_published !== undefined) {
      updateData.is_published = data.is_published;
    }
    if (data.start_date !== undefined) {
      updateData.start_date = data.start_date ? new Date(data.start_date) : null;
    }
    if (data.end_date !== undefined) {
      updateData.end_date = data.end_date ? new Date(data.end_date) : null;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    const updated = await this.updateHeroSlides(updateData);
    return updated as HeroSlideDTO;
  }

  /**
   * Publie ou depublie un slide hero.
   *
   * @param id - Identifiant du slide
   * @param isPublished - Nouvel etat de publication
   * @returns Le slide mis a jour
   */
  async toggleHeroSlidePublishStatus(
    id: string,
    isPublished: boolean
  ): Promise<HeroSlideDTO> {
    // Verifier que le slide existe
    await this.retrieveHeroSlide(id);

    const updated = await this.updateHeroSlides({
      id,
      is_published: isPublished,
    });

    return updated as HeroSlideDTO;
  }

  /**
   * Met a jour la position d'un slide dans le carousel.
   *
   * @param id - Identifiant du slide
   * @param newPosition - Nouvelle position
   * @returns Le slide mis a jour
   */
  async updateHeroSlidePosition(
    id: string,
    newPosition: number
  ): Promise<HeroSlideDTO> {
    // Verifier que le slide existe
    await this.retrieveHeroSlide(id);

    const updated = await this.updateHeroSlides({
      id,
      position: newPosition,
    });

    return updated as HeroSlideDTO;
  }

  /**
   * Reordonne tous les slides avec un tableau d'IDs dans l'ordre desire.
   *
   * @param slideIds - Tableau des IDs dans l'ordre souhaite
   * @returns Les slides mis a jour
   */
  async reorderHeroSlides(slideIds: string[]): Promise<HeroSlideDTO[]> {
    const updates = slideIds.map((id, index) => ({
      id,
      position: index,
    }));

    const results: HeroSlideDTO[] = [];
    for (const update of updates) {
      const updated = await this.updateHeroSlides(update);
      results.push(updated as HeroSlideDTO);
    }

    return results;
  }

  /**
   * Duplique un slide hero existant.
   * Utile pour creer des variantes d'un slide.
   *
   * @param id - Identifiant du slide a dupliquer
   * @param overrides - Champs a modifier dans la copie
   * @returns Le nouveau slide cree
   */
  async duplicateHeroSlide(
    id: string,
    overrides?: Partial<CreateHeroSlideInput>
  ): Promise<HeroSlideDTO> {
    const original = await this.retrieveHeroSlide(id);

    const duplicateData: CreateHeroSlideInput = {
      title: overrides?.title ?? `${original.title} (copie)`,
      subtitle: overrides?.subtitle ?? (original.subtitle as string | undefined),
      description: overrides?.description ?? (original.description as string | undefined),
      badge: overrides?.badge ?? (original.badge as string | undefined),
      // Champs image - Note: on ne copie pas image_file_key pour eviter les references croisees
      image_url: overrides?.image_url ?? (original.image_url as string | undefined),
      image_alt: overrides?.image_alt ?? (original.image_alt as string | undefined),
      image_file_key: overrides?.image_file_key, // Ne pas copier la cle du fichier original
      // Champs layout
      layout_type: overrides?.layout_type ?? (original.layout_type as HeroLayoutType),
      image_position: overrides?.image_position ?? (original.image_position as HeroImagePosition),
      // Champs style
      gradient: overrides?.gradient ?? (original.gradient as string),
      text_color: overrides?.text_color ?? (original.text_color as string),
      overlay_opacity: overrides?.overlay_opacity ?? (original.overlay_opacity as number),
      // Champs CTA
      cta_label: overrides?.cta_label ?? (original.cta_label as string),
      cta_href: overrides?.cta_href ?? (original.cta_href as string),
      secondary_cta_label: overrides?.secondary_cta_label ?? (original.secondary_cta_label as string | undefined),
      secondary_cta_href: overrides?.secondary_cta_href ?? (original.secondary_cta_href as string | undefined),
      // Champs affichage
      is_published: overrides?.is_published ?? false, // Depublie par defaut
      start_date: overrides?.start_date,
      end_date: overrides?.end_date,
      metadata: overrides?.metadata ?? (original.metadata as HeroSlideMetadata | undefined),
    };

    return await this.createHeroSlideWithValidation(duplicateData);
  }

  /**
   * Liste les slides hero avec pagination et filtres.
   *
   * @param filters - Filtres optionnels
   * @param pagination - Options de pagination
   * @returns Liste des slides et comptage total
   */
  async listHeroSlidesWithCount(
    filters?: ListHeroSlidesFilters,
    pagination?: PaginationOptions
  ): Promise<{ slides: HeroSlideDTO[]; count: number }> {
    const queryFilters: Record<string, unknown> = {};

    if (filters?.is_published !== undefined) {
      queryFilters.is_published = filters.is_published;
    }

    const config = {
      skip: pagination?.skip ?? 0,
      take: pagination?.take ?? 20,
      order: { position: "ASC" as const, created_at: "DESC" as const },
    };

    const [slides, allSlides] = await Promise.all([
      this.listHeroSlides(queryFilters, config),
      this.listHeroSlides(queryFilters, { select: ["id"] }),
    ]);

    return {
      slides: slides as HeroSlideDTO[],
      count: allSlides.length,
    };
  }
}

export default CmsModuleService;
