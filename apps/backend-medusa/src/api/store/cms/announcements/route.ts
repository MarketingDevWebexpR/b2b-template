/**
 * Store CMS Announcements API Route
 *
 * Point d'entree API public pour recuperer les bandeaux d'annonce actifs.
 * Aucune authentification requise.
 *
 * GET /store/cms/announcements - Recupere les bandeaux actifs
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type CmsModuleService from "../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * GET /store/cms/announcements
 *
 * Recupere tous les bandeaux d'annonce actuellement actifs.
 *
 * Criteres d'activation:
 * - is_active = true
 * - start_date est null OU <= maintenant
 * - end_date est null OU >= maintenant
 *
 * Les resultats sont tries par priorite (DESC) puis par date de creation (DESC).
 *
 * @returns Liste des bandeaux actifs
 *
 * @example Response:
 * ```json
 * {
 *   "announcements": [
 *     {
 *       "id": "ann_123",
 *       "message": "Livraison gratuite pour toute commande superieure a 100 EUR!",
 *       "link_url": "/promotions",
 *       "link_text": "En savoir plus",
 *       "background_color": "#1a1a2e",
 *       "text_color": "#ffffff",
 *       "priority": 10
 *     }
 *   ]
 * }
 * ```
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);

  // Recuperer les bandeaux actifs
  const announcements = await cmsService.getActiveAnnouncements();

  // Retourner uniquement les champs necessaires pour le frontend
  const publicAnnouncements = announcements.map((announcement) => ({
    id: announcement.id,
    message: announcement.message,
    link_url: announcement.link_url,
    link_text: announcement.link_text,
    background_color: announcement.background_color,
    text_color: announcement.text_color,
    priority: announcement.priority,
  }));

  res.status(200).json({
    announcements: publicAnnouncements,
  });
}
