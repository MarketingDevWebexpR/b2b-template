/**
 * Admin CMS Hero Slide Publish API Route
 *
 * Route API pour publier/depublier un slide hero.
 *
 * POST /admin/cms/hero-slides/:id/publish - Publie un slide
 * DELETE /admin/cms/hero-slides/:id/publish - Depublie un slide
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type CmsModuleService from "../../../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * POST /admin/cms/hero-slides/:id/publish
 *
 * Publie un slide hero.
 *
 * @returns Le slide publie
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const { id } = req.params;

  try {
    const slide = await cmsService.toggleHeroSlidePublishStatus(id, true);
    res.status(200).json({ slide });
  } catch (error) {
    res.status(404).json({
      type: "not_found",
      message: `Slide with id ${id} not found`,
    });
  }
}

/**
 * DELETE /admin/cms/hero-slides/:id/publish
 *
 * Depublie un slide hero.
 *
 * @returns Le slide depublie
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const { id } = req.params;

  try {
    const slide = await cmsService.toggleHeroSlidePublishStatus(id, false);
    res.status(200).json({ slide });
  } catch (error) {
    res.status(404).json({
      type: "not_found",
      message: `Slide with id ${id} not found`,
    });
  }
}
