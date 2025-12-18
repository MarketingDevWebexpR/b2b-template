/**
 * Hero Slide Model
 *
 * Modele pour les slides du carousel hero affiche sur la page d'accueil.
 * Permet de gerer le contenu dynamique du bandeau principal avec images,
 * textes et appels a l'action.
 *
 * Supporte plusieurs types de mise en page (layout):
 * - background: image en arriere-plan avec texte superpose
 * - side: image sur le cote (gauche ou droite), texte de l'autre cote
 * - fullwidth: image pleine largeur avec texte minimal
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

// ==========================================
// CONSTANTES ET TYPES
// ==========================================

/**
 * Types de mise en page disponibles pour les slides hero
 * Layout types disponibles pour l'affichage du slide
 */
export const HERO_LAYOUT_TYPES = ["background", "side", "fullwidth"] as const;

/**
 * Type pour les options de layout
 * - background: image en arriere-plan avec texte superpose (defaut)
 * - side: image sur le cote, texte de l'autre cote
 * - fullwidth: image pleine largeur avec texte minimal
 */
export type HeroLayoutType = (typeof HERO_LAYOUT_TYPES)[number];

/**
 * Positions disponibles pour l'image en mode 'side'
 */
export const HERO_IMAGE_POSITIONS = ["left", "right"] as const;

/**
 * Type pour la position de l'image (mode side uniquement)
 * - left: image a gauche, texte a droite
 * - right: image a droite, texte a gauche (defaut)
 */
export type HeroImagePosition = (typeof HERO_IMAGE_POSITIONS)[number];

/**
 * Valeurs par defaut pour les slides hero
 */
export const DEFAULT_HERO_LAYOUT_TYPE: HeroLayoutType = "background";
export const DEFAULT_HERO_IMAGE_POSITION: HeroImagePosition = "right";
export const DEFAULT_HERO_OVERLAY_OPACITY = 40;

/**
 * Default gradient for hero slides
 * Gradient par defaut pour les slides hero
 */
export const DEFAULT_HERO_GRADIENT = "from-primary-700 via-primary-600 to-primary-500";

/**
 * Default text color for hero slides
 */
export const DEFAULT_HERO_TEXT_COLOR = "#ffffff";

/**
 * Hero Slide Model
 *
 * Slide du carousel hero de la page d'accueil.
 *
 * @example
 * ```typescript
 * const slide = await cmsService.createHeroSlides({
 *   title: "Collection Printemps 2025",
 *   subtitle: "Nouveautes",
 *   description: "Decouvrez notre selection exclusive",
 *   cta_label: "Decouvrir",
 *   cta_href: "/categories?sort=newest",
 *   image_url: "/hero/spring-collection.jpg",
 *   gradient: "from-primary-700 to-primary-500",
 *   is_published: true,
 *   position: 1,
 * });
 * ```
 */
export const HeroSlide = model.define(
  { name: "HeroSlide", tableName: "cms_hero_slide" },
  {
    // Identifiant unique
    id: model.id().primaryKey(),

    // Titre principal (requis, recherchable)
    title: model.text().searchable(),

    // Sous-titre (optionnel)
    subtitle: model.text().nullable(),

    // Description (optionnel)
    description: model.text().nullable(),

    // Badge affiché en haut (ex: "Nouveau", "Promo")
    badge: model.text().nullable(),

    // ==========================================
    // CHAMPS IMAGE
    // ==========================================

    // URL de l'image (peut etre une URL S3/MinIO apres upload)
    // Compatible avec les anciennes URLs et les nouvelles images uploadees
    image_url: model.text().nullable(),

    // Texte alternatif pour l'image (accessibilite)
    image_alt: model.text().nullable(),

    // Cle du fichier dans le stockage S3/MinIO (retournee par le file service)
    // Utilisee pour supprimer le fichier quand le slide est supprime
    image_file_key: model.text().nullable(),

    // ==========================================
    // CHAMPS LAYOUT
    // ==========================================

    // Type de mise en page du slide
    // - background: image en arriere-plan avec texte superpose (defaut)
    // - side: image sur le cote, texte de l'autre cote
    // - fullwidth: image pleine largeur avec texte minimal
    layout_type: model.text().default(DEFAULT_HERO_LAYOUT_TYPE),

    // Position de l'image pour le layout 'side'
    // - left: image a gauche, texte a droite
    // - right: image a droite, texte a gauche (defaut)
    image_position: model.text().default(DEFAULT_HERO_IMAGE_POSITION),

    // ==========================================
    // CHAMPS STYLE
    // ==========================================

    // Gradient CSS (ex: "from-primary-700 via-primary-600 to-primary-500")
    gradient: model.text().default(DEFAULT_HERO_GRADIENT),

    // Couleur du texte
    text_color: model.text().default(DEFAULT_HERO_TEXT_COLOR),

    // Opacite de l'overlay sur l'image (0-100)
    // Utilise principalement avec layout_type = 'background'
    overlay_opacity: model.number().default(DEFAULT_HERO_OVERLAY_OPACITY),

    // ==========================================
    // CHAMPS CTA (Call To Action)
    // ==========================================

    // CTA Principal (requis)
    cta_label: model.text(),
    cta_href: model.text(),

    // CTA Secondaire (optionnel)
    secondary_cta_label: model.text().nullable(),
    secondary_cta_href: model.text().nullable(),

    // ==========================================
    // CHAMPS AFFICHAGE
    // ==========================================

    // Position d'affichage (ordre dans le carousel)
    position: model.number().default(0),

    // Statut de publication
    is_published: model.boolean().default(false),

    // Date de debut d'affichage (optionnel)
    start_date: model.dateTime().nullable(),

    // Date de fin d'affichage (optionnel)
    end_date: model.dateTime().nullable(),

    // Metadonnees extensibles (JSON)
    metadata: model.json().nullable(),
  }
).indexes([
  // Index pour filtrer les slides publiees
  { on: ["is_published"], name: "idx_hero_slide_published" },
  // Index pour trier par position
  { on: ["position"], name: "idx_hero_slide_position" },
  // Index pour filtrer par date de debut
  { on: ["start_date"], name: "idx_hero_slide_start_date" },
  // Index pour filtrer par date de fin
  { on: ["end_date"], name: "idx_hero_slide_end_date" },
  // Index compose pour les requetes frequentes sur les slides publiees
  { on: ["is_published", "position"], name: "idx_hero_slide_published_position" },
  // Index compose pour les slides publiees dans une periode
  { on: ["is_published", "start_date", "end_date"], name: "idx_hero_slide_published_period" },
]);

export default HeroSlide;
