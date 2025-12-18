/**
 * Public CMS Hero Slides API Route
 *
 * Point d'entree API public pour recuperer les slides hero publiees.
 * Cette route est accessible sans authentification et sans publishable API key.
 *
 * GET /cms/hero-slides - Recupere les slides publiees
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type CmsModuleService from "../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * GET /cms/hero-slides
 *
 * Recupere tous les slides hero actuellement publies et actifs.
 *
 * Criteres d'activation:
 * - is_published = true
 * - start_date est null OU <= maintenant
 * - end_date est null OU >= maintenant
 *
 * Les resultats sont tries par position (ASC).
 *
 * @returns Liste des slides publiees
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);

  // Recuperer les slides publiees
  const slides = await cmsService.getPublishedHeroSlides();

  // Retourner uniquement les champs necessaires pour le frontend
  const publicSlides = slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    description: slide.description,
    badge: slide.badge,
    image_url: slide.image_url,
    image_alt: slide.image_alt,
    gradient: slide.gradient,
    text_color: slide.text_color,
    overlay_opacity: slide.overlay_opacity,
    cta_label: slide.cta_label,
    cta_href: slide.cta_href,
    secondary_cta_label: slide.secondary_cta_label,
    secondary_cta_href: slide.secondary_cta_href,
    position: slide.position,
    // Champs layout pour les differents modes d'affichage
    layout_type: slide.layout_type,
    image_position: slide.image_position,
  }));

  res.status(200).json({
    slides: publicSlides,
  });
}
