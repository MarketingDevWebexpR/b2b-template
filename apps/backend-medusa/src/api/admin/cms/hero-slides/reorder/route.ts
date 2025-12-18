/**
 * Admin CMS Hero Slides Reorder API Route
 *
 * Route API pour reordonner les slides hero.
 *
 * POST /admin/cms/hero-slides/reorder - Reordonne les slides
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type CmsModuleService from "../../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

interface ReorderBody {
  slide_ids: string[];
}

/**
 * POST /admin/cms/hero-slides/reorder
 *
 * Reordonne les slides hero selon l'ordre specifie.
 * Le premier ID dans le tableau aura la position 0, etc.
 *
 * Body:
 * - slide_ids: string[] - Tableau des IDs dans l'ordre souhaite
 *
 * @returns Les slides reordonnees
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const { slide_ids } = req.body as ReorderBody;

  if (!slide_ids || !Array.isArray(slide_ids) || slide_ids.length === 0) {
    res.status(400).json({
      type: "validation_error",
      message: "slide_ids must be a non-empty array of slide IDs",
    });
    return;
  }

  try {
    const slides = await cmsService.reorderHeroSlides(slide_ids);
    res.status(200).json({ slides });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors du reordonnancement";
    res.status(400).json({
      type: "error",
      message,
    });
  }
}
