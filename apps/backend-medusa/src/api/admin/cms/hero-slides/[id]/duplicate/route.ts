/**
 * Admin CMS Hero Slide Duplicate API Route
 *
 * Route API pour dupliquer un slide hero.
 *
 * POST /admin/cms/hero-slides/:id/duplicate - Duplique un slide
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type CmsModuleService from "../../../../../../modules/cms/service";
import type { CreateHeroSlideInput } from "../../../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * POST /admin/cms/hero-slides/:id/duplicate
 *
 * Duplique un slide hero existant.
 * Le slide duplique est depublie par defaut.
 *
 * Body (optionnel):
 * - Tous les champs de CreateHeroSlideInput pour override
 *
 * @returns Le nouveau slide cree
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const { id } = req.params;
  const overrides = req.body as Partial<CreateHeroSlideInput> | undefined;

  try {
    const slide = await cmsService.duplicateHeroSlide(id, overrides);
    res.status(201).json({ slide });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la duplication";

    if (message.includes("not found")) {
      res.status(404).json({
        type: "not_found",
        message,
      });
      return;
    }

    res.status(400).json({
      type: "error",
      message,
    });
  }
}
