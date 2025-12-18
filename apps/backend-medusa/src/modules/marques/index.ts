/**
 * Marques Module Definition
 *
 * Module de gestion des marques (brands) pour le site e-commerce.
 * Fournit des fonctionnalites pour gerer les marques partenaires,
 * leurs informations et leur visibilite.
 *
 * @packageDocumentation
 */

import { Module } from "@medusajs/framework/utils";
import MarquesModuleService from "./service";

/**
 * Identifiant du module utilise pour l'injection de dependances
 */
export const MARQUES_MODULE = "marquesModuleService";

/**
 * Marques Module
 *
 * Enregistrer ce module dans medusa-config.js:
 * ```javascript
 * modules: [
 *   { resolve: "./src/modules/marques" },
 * ]
 * ```
 */
export default Module(MARQUES_MODULE, {
  service: MarquesModuleService,
});

// Re-export du service et des types
export { default as MarquesModuleService } from "./service";
export type {
  CreateMarqueInput,
  UpdateMarqueInput,
  ListMarquesFilters,
  PaginationOptions,
  MarqueDTO,
  MarqueMetadata,
} from "./service";

// Re-export des modeles
export { Marque, MarqueModel } from "./models/index";
