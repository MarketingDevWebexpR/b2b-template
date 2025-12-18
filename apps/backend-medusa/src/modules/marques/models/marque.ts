/**
 * Marque (Brand) Model
 *
 * Modele pour les marques/fabricants des produits.
 * Permet de gerer les informations sur les marques partenaires
 * avec leur logo, pays d'origine et classement.
 *
 * @packageDocumentation
 */

import { model } from "@medusajs/framework/utils";

/**
 * Marque Model
 *
 * Represente une marque ou un fabricant de produits.
 *
 * @example
 * ```typescript
 * const marque = await marquesService.createMarques({
 *   name: "Swarovski",
 *   slug: "swarovski",
 *   description: "Cristaux de luxe autrichiens",
 *   logo_url: "/brands/swarovski-logo.png",
 *   website_url: "https://www.swarovski.com",
 *   country: "Autriche",
 *   is_active: true,
 *   is_favorite: false,
 *   rank: 10,
 * });
 * ```
 */
export const Marque = model.define(
  { name: "Marque", tableName: "marque" },
  {
    // Identifiant unique
    id: model.id().primaryKey(),

    // Nom de la marque (requis, unique, recherchable)
    name: model.text().searchable(),

    // Slug pour URL (requis, unique)
    // Ex: "swarovski" pour /marques/swarovski
    slug: model.text(),

    // Description de la marque (optionnel)
    description: model.text().nullable(),

    // URL du logo de la marque (optionnel)
    // Peut etre une URL S3/MinIO apres upload
    logo_url: model.text().nullable(),

    // Cle du fichier logo dans S3/MinIO (optionnel)
    // Utilisee pour supprimer le fichier lors de la mise a jour ou suppression
    logo_file_key: model.text().nullable(),

    // Site web officiel de la marque (optionnel)
    website_url: model.text().nullable(),

    // Pays d'origine de la marque (optionnel)
    country: model.text().nullable(),

    // Statut actif/inactif
    // Une marque inactive n'apparait pas dans les recherches publiques
    is_active: model.boolean().default(true),

    // Rang pour le tri (plus eleve = priorite plus haute)
    // Utilise pour l'affichage des marques mises en avant
    rank: model.number().default(0),

    // Marque favorite
    // Permet de mettre en avant certaines marques dans l'interface
    is_favorite: model.boolean().default(false),

    // Metadonnees extensibles (JSON)
    // Peut contenir des informations supplementaires comme:
    // - social_links: liens vers les reseaux sociaux
    // - certifications: certifications qualite
    // - year_founded: annee de creation
    metadata: model.json().nullable(),
  }
).indexes([
  // Index unique sur le nom (evite les doublons)
  { on: ["name"], name: "idx_marque_name_unique", unique: true },
  // Index unique sur le slug (evite les doublons)
  { on: ["slug"], name: "idx_marque_slug_unique", unique: true },
  // Index pour filtrer les marques actives
  { on: ["is_active"], name: "idx_marque_active" },
  // Index pour trier par rang
  { on: ["rank"], name: "idx_marque_rank" },
  // Index compose pour les marques actives triees par rang
  { on: ["is_active", "rank"], name: "idx_marque_active_rank" },
  // Index pour le pays (filtrage par origine)
  { on: ["country"], name: "idx_marque_country" },
  // Index pour les marques favorites
  { on: ["is_favorite"], name: "idx_marque_favorite" },
  // Index compose pour les marques actives et favorites
  { on: ["is_active", "is_favorite"], name: "idx_marque_active_favorite" },
]);

export default Marque;
