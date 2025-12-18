/**
 * Announcement Banner Model
 *
 * Modele pour les bandeaux d'annonce affiches au-dessus du header du site.
 * Permet de communiquer des informations importantes aux visiteurs
 * (promotions, evenements, informations de livraison, etc.)
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Default colors for announcement banners
 * Couleurs par defaut pour les bandeaux d'annonce
 */
export const DEFAULT_BACKGROUND_COLOR = "#1a1a2e"; // Couleur de marque primaire
export const DEFAULT_TEXT_COLOR = "#ffffff";

/**
 * Announcement Banner Model
 *
 * Bandeau d'annonce affiche en haut du site web.
 *
 * @example
 * ```typescript
 * const banner = await cmsService.createAnnouncementBanners({
 *   message: "Livraison gratuite pour toute commande superieure a 100 EUR!",
 *   link_url: "/promotions",
 *   link_text: "En savoir plus",
 *   background_color: "#1a1a2e",
 *   text_color: "#ffffff",
 *   is_active: true,
 *   priority: 10,
 * });
 * ```
 */
export const AnnouncementBanner = model.define(
  { name: "AnnouncementBanner", tableName: "cms_announcement_banner" },
  {
    // Identifiant unique
    id: model.id().primaryKey(),

    // Contenu du message (requis, recherchable)
    message: model.text().searchable(),

    // URL de destination lors du clic (optionnel)
    link_url: model.text().nullable(),

    // Texte du lien (ex: "En savoir plus", "Decouvrir")
    link_text: model.text().nullable(),

    // Couleur de fond du bandeau (hex)
    background_color: model.text().default(DEFAULT_BACKGROUND_COLOR),

    // Couleur du texte (hex)
    text_color: model.text().default(DEFAULT_TEXT_COLOR),

    // Date de debut d'affichage (optionnel)
    start_date: model.dateTime().nullable(),

    // Date de fin d'affichage (optionnel)
    end_date: model.dateTime().nullable(),

    // Activation/desactivation du bandeau
    is_active: model.boolean().default(true),

    // Priorite d'affichage (plus eleve = plus prioritaire)
    priority: model.number().default(0),

    // Metadonnees extensibles (JSON)
    metadata: model.json().nullable(),
  }
).indexes([
  // Index pour filtrer les bandeaux actifs
  { on: ["is_active"], name: "idx_announcement_is_active" },
  // Index pour filtrer par date de debut
  { on: ["start_date"], name: "idx_announcement_start_date" },
  // Index pour filtrer par date de fin
  { on: ["end_date"], name: "idx_announcement_end_date" },
  // Index pour trier par priorite
  { on: ["priority"], name: "idx_announcement_priority" },
  // Index compose pour les requetes frequentes sur les bandeaux actifs dans une periode
  { on: ["is_active", "start_date", "end_date"], name: "idx_announcement_active_period" },
  // Index compose pour le tri par priorite des bandeaux actifs
  { on: ["is_active", "priority"], name: "idx_announcement_active_priority" },
]);

export default AnnouncementBanner;
