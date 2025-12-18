/**
 * Admin CMS Hero Slide Individual API Routes
 *
 * Routes API admin pour la gestion d'un slide hero individuel.
 *
 * GET /admin/cms/hero-slides/:id - Recupere un slide
 * PUT /admin/cms/hero-slides/:id - Met a jour un slide
 * DELETE /admin/cms/hero-slides/:id - Supprime un slide (et son image S3/MinIO)
 *
 * Endpoints associes:
 * - POST /admin/cms/hero-slides/:id/upload-image - Upload une image
 * - DELETE /admin/cms/hero-slides/:id/upload-image - Supprime l'image
 * - POST /admin/cms/hero-slides/:id/publish - Publie/depublie
 * - POST /admin/cms/hero-slides/:id/duplicate - Duplique
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import type { IFileModuleService } from "@medusajs/framework/types";
import type CmsModuleService from "../../../../../modules/cms/service";
import type { UpdateHeroSlideInput } from "../../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * GET /admin/cms/hero-slides/:id
 *
 * Recupere un slide hero par son ID.
 *
 * @returns Le slide demande
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const { id } = req.params;

  try {
    const slide = await cmsService.retrieveHeroSlide(id);
    res.status(200).json({ slide });
  } catch (error) {
    res.status(404).json({
      type: "not_found",
      message: `Slide with id ${id} not found`,
    });
  }
}

/**
 * PUT /admin/cms/hero-slides/:id
 *
 * Met a jour un slide hero existant.
 *
 * Body (tous les champs sont optionnels):
 * - title?: string - Titre principal
 * - subtitle?: string | null - Sous-titre
 * - description?: string | null - Description
 * - badge?: string | null - Badge
 *
 * Image:
 * - image_url?: string | null - URL de l'image
 * - image_alt?: string | null - Texte alternatif
 * - image_file_key?: string | null - Cle du fichier S3/MinIO
 *
 * Layout:
 * - layout_type?: 'background' | 'side' | 'fullwidth' - Type de mise en page
 * - image_position?: 'left' | 'right' - Position de l'image (layout 'side')
 *
 * Style:
 * - gradient?: string - Classes CSS gradient
 * - text_color?: string - Couleur du texte
 * - overlay_opacity?: number - Opacite overlay (0-100)
 *
 * CTA:
 * - cta_label?: string - Texte du bouton CTA
 * - cta_href?: string - URL du CTA
 * - secondary_cta_label?: string | null - Texte CTA secondaire
 * - secondary_cta_href?: string | null - URL CTA secondaire
 *
 * Affichage:
 * - position?: number - Position dans le carousel
 * - is_published?: boolean - Statut de publication
 * - start_date?: string | null - Date de debut (ISO)
 * - end_date?: string | null - Date de fin (ISO)
 * - metadata?: object | null - Metadonnees
 *
 * @returns Le slide mis a jour
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const { id } = req.params;
  const data = req.body as UpdateHeroSlideInput;

  try {
    const slide = await cmsService.updateHeroSlideWithValidation(id, data);
    res.status(200).json({ slide });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la mise a jour";

    if (message.includes("not found")) {
      res.status(404).json({
        type: "not_found",
        message,
      });
      return;
    }

    res.status(400).json({
      type: "validation_error",
      message,
    });
  }
}

/**
 * DELETE /admin/cms/hero-slides/:id
 *
 * Supprime un slide hero et son image associee du stockage S3/MinIO.
 *
 * @returns Confirmation de suppression
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const fileModuleService: IFileModuleService = req.scope.resolve(Modules.FILE);
  const { id } = req.params;

  try {
    // Recuperer le slide pour obtenir la cle du fichier image
    const slide = await cmsService.retrieveHeroSlide(id);

    // Supprimer l'image du stockage S3/MinIO si elle existe
    if (slide.image_file_key) {
      try {
        await fileModuleService.deleteFiles([slide.image_file_key as string]);
      } catch (deleteError) {
        // Log mais continuer la suppression du slide meme si le fichier ne peut pas etre supprime
        console.warn(
          `Impossible de supprimer le fichier image: ${slide.image_file_key}`,
          deleteError
        );
      }
    }

    // Supprimer le slide
    await cmsService.deleteHeroSlides([id]);

    res.status(200).json({
      id,
      deleted: true,
      image_deleted: !!slide.image_file_key,
    });
  } catch (error) {
    res.status(404).json({
      type: "not_found",
      message: `Slide with id ${id} not found`,
    });
  }
}
