/**
 * Admin CMS Announcements API Routes
 *
 * Points d'entree API pour la gestion des bandeaux d'annonce.
 *
 * GET /admin/cms/announcements - Liste tous les bandeaux avec pagination
 * POST /admin/cms/announcements - Cree un nouveau bandeau
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CmsModuleService from "../../../../modules/cms/service";
import type { CreateAnnouncementInput } from "../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * Parametres de requete pour la liste des bandeaux
 */
interface ListAnnouncementsQuery {
  /** Filtrer par etat d'activation */
  is_active?: string;
  /** Nombre de resultats (defaut: 20) */
  limit?: number;
  /** Decalage pour la pagination (defaut: 0) */
  offset?: number;
  /** Recherche dans le message */
  search?: string;
}

/**
 * GET /admin/cms/announcements
 *
 * Liste tous les bandeaux d'annonce avec filtrage et pagination.
 *
 * @query is_active - Filtrer par etat d'activation ("true" ou "false")
 * @query limit - Nombre de resultats (defaut: 20)
 * @query offset - Decalage pour la pagination (defaut: 0)
 * @query search - Recherche dans le message
 */
export async function GET(
  req: MedusaRequest<object, ListAnnouncementsQuery>,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);

  const {
    is_active,
    limit = 20,
    offset = 0,
    search,
  } = req.query;

  const filters: Record<string, unknown> = {};

  // Convertir is_active de string a boolean si fourni
  if (is_active !== undefined) {
    filters.is_active = is_active === "true";
  }

  // Ajouter recherche si fournie
  if (search) {
    filters.$or = [
      { message: { $like: `%${search}%` } },
    ];
  }

  const { announcements, count } = await cmsService.listAnnouncementsWithCount(
    filters.is_active !== undefined ? { is_active: filters.is_active as boolean } : undefined,
    { skip: Number(offset), take: Number(limit) }
  );

  res.status(200).json({
    announcements,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * POST /admin/cms/announcements
 *
 * Cree un nouveau bandeau d'annonce.
 *
 * @body message - Contenu du message (requis)
 * @body link_url - URL de destination (optionnel)
 * @body link_text - Texte du lien (optionnel)
 * @body background_color - Couleur de fond hex (optionnel, defaut: #1a1a2e)
 * @body text_color - Couleur du texte hex (optionnel, defaut: #ffffff)
 * @body start_date - Date de debut d'affichage (optionnel)
 * @body end_date - Date de fin d'affichage (optionnel)
 * @body is_active - Actif ou non (optionnel, defaut: true)
 * @body priority - Priorite d'affichage (optionnel, defaut: 0)
 * @body metadata - Metadonnees additionnelles (optionnel)
 */
export async function POST(
  req: MedusaRequest<CreateAnnouncementInput>,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);

  const body = req.body;

  // Valider le champ requis
  if (!body.message?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Le message est requis"
    );
  }

  try {
    const announcement = await cmsService.createAnnouncementWithValidation(body);

    res.status(201).json({
      announcement,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error.message
      );
    }
    throw error;
  }
}
