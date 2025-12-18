/**
 * Admin CMS Announcement Detail API Routes
 *
 * Points d'entree API pour la gestion d'un bandeau d'annonce individuel.
 *
 * GET /admin/cms/announcements/:id - Recupere un bandeau
 * PUT /admin/cms/announcements/:id - Met a jour un bandeau
 * DELETE /admin/cms/announcements/:id - Supprime un bandeau
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type CmsModuleService from "../../../../../modules/cms/service";
import type { UpdateAnnouncementInput } from "../../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * Requete avec parametre ID
 */
interface AnnouncementIdRequest extends MedusaRequest {
  params: {
    id: string;
  };
}

/**
 * GET /admin/cms/announcements/:id
 *
 * Recupere les details d'un bandeau d'annonce specifique.
 *
 * @param id - Identifiant du bandeau
 */
export async function GET(
  req: AnnouncementIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);

  try {
    const announcement = await cmsService.retrieveAnnouncementBanner(id);

    res.status(200).json({
      announcement,
    });
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Bandeau d'annonce avec l'id "${id}" non trouve`
    );
  }
}

/**
 * PUT /admin/cms/announcements/:id
 *
 * Met a jour un bandeau d'annonce existant.
 *
 * @param id - Identifiant du bandeau
 * @body message - Nouveau message (optionnel)
 * @body link_url - Nouvelle URL (optionnel, null pour supprimer)
 * @body link_text - Nouveau texte de lien (optionnel, null pour supprimer)
 * @body background_color - Nouvelle couleur de fond (optionnel)
 * @body text_color - Nouvelle couleur de texte (optionnel)
 * @body start_date - Nouvelle date de debut (optionnel, null pour supprimer)
 * @body end_date - Nouvelle date de fin (optionnel, null pour supprimer)
 * @body is_active - Nouvel etat d'activation (optionnel)
 * @body priority - Nouvelle priorite (optionnel)
 * @body metadata - Nouvelles metadonnees (optionnel, null pour supprimer)
 */
export async function PUT(
  req: AnnouncementIdRequest & { body: UpdateAnnouncementInput },
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const body = req.body;
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);

  // Verifier que le bandeau existe
  try {
    await cmsService.retrieveAnnouncementBanner(id);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Bandeau d'annonce avec l'id "${id}" non trouve`
    );
  }

  try {
    const updatedAnnouncement = await cmsService.updateAnnouncementWithValidation(id, body);

    res.status(200).json({
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur de validation
      if (error.message.includes("doit") || error.message.includes("invalide")) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          error.message
        );
      }
    }
    throw error;
  }
}

/**
 * DELETE /admin/cms/announcements/:id
 *
 * Supprime definitivement un bandeau d'annonce.
 * Pour une desactivation temporaire, utiliser PUT avec is_active: false.
 *
 * @param id - Identifiant du bandeau a supprimer
 */
export async function DELETE(
  req: AnnouncementIdRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);

  // Verifier que le bandeau existe
  try {
    await cmsService.retrieveAnnouncementBanner(id);
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Bandeau d'annonce avec l'id "${id}" non trouve`
    );
  }

  // Supprimer le bandeau
  await cmsService.deleteAnnouncementBanners(id);

  res.status(200).json({
    id,
    object: "announcement_banner",
    deleted: true,
  });
}
