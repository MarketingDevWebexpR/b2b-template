/**
 * Admin CMS Hero Slides API Routes
 *
 * Routes API admin pour la gestion des slides hero.
 * Ces routes sont protegees par l'authentification admin.
 *
 * GET /admin/cms/hero-slides - Liste toutes les slides
 * POST /admin/cms/hero-slides - Cree une nouvelle slide
 *
 * Endpoints associes:
 * - POST /admin/cms/hero-slides/:id/upload-image - Upload une image
 * - DELETE /admin/cms/hero-slides/:id/upload-image - Supprime l'image
 * - POST /admin/cms/hero-slides/:id/publish - Publie/depublie un slide
 * - POST /admin/cms/hero-slides/:id/duplicate - Duplique un slide
 * - POST /admin/cms/hero-slides/reorder - Reordonne les slides
 *
 * Types de layout supportes:
 * - 'background': image en arriere-plan avec texte superpose (defaut)
 * - 'side': image sur le cote, texte de l'autre cote
 * - 'fullwidth': image pleine largeur avec texte minimal
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type CmsModuleService from "../../../../modules/cms/service";
import type { CreateHeroSlideInput } from "../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * GET /admin/cms/hero-slides
 *
 * Liste toutes les slides hero avec pagination.
 *
 * Query params:
 * - is_published: boolean - Filtrer par statut de publication
 * - skip: number - Offset pour pagination
 * - take: number - Limite pour pagination
 *
 * @returns Liste des slides et comptage total
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);

  const { is_published, skip, take } = req.query as {
    is_published?: string;
    skip?: string;
    take?: string;
  };

  const filters = {
    is_published: is_published !== undefined
      ? is_published === "true"
      : undefined,
  };

  const pagination = {
    skip: skip ? parseInt(skip, 10) : 0,
    take: take ? parseInt(take, 10) : 50,
  };

  const { slides, count } = await cmsService.listHeroSlidesWithCount(
    filters,
    pagination
  );

  res.status(200).json({
    slides,
    count,
    skip: pagination.skip,
    take: pagination.take,
  });
}

/**
 * POST /admin/cms/hero-slides
 *
 * Cree une nouvelle slide hero.
 *
 * Body:
 * - title: string (requis) - Titre principal
 * - subtitle?: string - Sous-titre
 * - description?: string - Description
 * - badge?: string - Badge (ex: "Nouveau", "Promo")
 *
 * Image (utiliser /upload-image pour uploader une image):
 * - image_url?: string - URL de l'image (S3/MinIO ou externe)
 * - image_alt?: string - Texte alternatif pour l'accessibilite
 * - image_file_key?: string - Cle du fichier S3/MinIO (interne)
 *
 * Layout:
 * - layout_type?: 'background' | 'side' | 'fullwidth' - Type de mise en page (defaut: 'background')
 * - image_position?: 'left' | 'right' - Position de l'image pour layout 'side' (defaut: 'right')
 *
 * Style:
 * - gradient?: string - Classes CSS gradient (ex: "from-primary-700 to-primary-500")
 * - text_color?: string - Couleur du texte (defaut: "#ffffff")
 * - overlay_opacity?: number - Opacite overlay 0-100 (defaut: 40, pour layout 'background')
 *
 * CTA:
 * - cta_label: string (requis) - Texte du bouton CTA principal
 * - cta_href: string (requis) - URL du CTA principal
 * - secondary_cta_label?: string - Texte CTA secondaire
 * - secondary_cta_href?: string - URL CTA secondaire
 *
 * Affichage:
 * - position?: number - Position dans le carousel (auto-increment si non specifie)
 * - is_published?: boolean - Statut de publication (defaut: false)
 * - start_date?: string - Date de debut d'affichage (ISO)
 * - end_date?: string - Date de fin d'affichage (ISO)
 * - metadata?: object - Metadonnees additionnelles (JSON)
 *
 * @returns Le slide cree
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const data = req.body as CreateHeroSlideInput;

  try {
    const slide = await cmsService.createHeroSlideWithValidation(data);
    res.status(201).json({ slide });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la creation du slide";
    res.status(400).json({
      type: "validation_error",
      message,
    });
  }
}
