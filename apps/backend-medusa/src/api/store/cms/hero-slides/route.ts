/**
 * Store CMS Hero Slides API Route
 *
 * Route API publique pour recuperer les slides hero publiees.
 * Cette route est accessible sans authentification et retourne
 * uniquement les slides publiees et actives (dans leur periode d'affichage).
 *
 * GET /store/cms/hero-slides - Liste les slides publiees et actives
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type CmsModuleService from "../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * GET /store/cms/hero-slides
 *
 * Liste les slides hero publiees et actuellement actives.
 *
 * Retourne uniquement les slides qui:
 * - Sont publiees (is_published = true)
 * - Sont dans leur periode d'affichage (start_date <= now <= end_date)
 *
 * Les slides sont triees par position (ascendant).
 *
 * Response:
 * - slides: HeroSlideDTO[] - Liste des slides avec tous leurs champs:
 *   - id: string
 *   - title: string
 *   - subtitle: string | null
 *   - description: string | null
 *   - badge: string | null
 *   - image_url: string | null - URL de l'image (S3/MinIO)
 *   - image_alt: string | null - Texte alternatif
 *   - layout_type: 'background' | 'side' | 'fullwidth'
 *   - image_position: 'left' | 'right'
 *   - gradient: string
 *   - text_color: string
 *   - overlay_opacity: number
 *   - cta_label: string
 *   - cta_href: string
 *   - secondary_cta_label: string | null
 *   - secondary_cta_href: string | null
 *   - position: number
 *
 * @example
 * ```
 * GET /store/cms/hero-slides
 *
 * Response:
 * {
 *   "slides": [
 *     {
 *       "id": "hslide_123",
 *       "title": "Collection Printemps 2025",
 *       "subtitle": "Nouveautes",
 *       "layout_type": "background",
 *       "image_position": "right",
 *       "image_url": "https://s3.example.com/hero/spring.jpg",
 *       "overlay_opacity": 40,
 *       ...
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

  try {
    // Utilise la methode qui filtre deja par publication et periode
    const slides = await cmsService.getPublishedHeroSlides();

    // Ne pas exposer certains champs internes au frontend
    const publicSlides = slides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      badge: slide.badge,
      // Champs image
      image_url: slide.image_url,
      image_alt: slide.image_alt,
      // Champs layout
      layout_type: slide.layout_type,
      image_position: slide.image_position,
      // Champs style
      gradient: slide.gradient,
      text_color: slide.text_color,
      overlay_opacity: slide.overlay_opacity,
      // Champs CTA
      cta_label: slide.cta_label,
      cta_href: slide.cta_href,
      secondary_cta_label: slide.secondary_cta_label,
      secondary_cta_href: slide.secondary_cta_href,
      // Position
      position: slide.position,
      // Ne pas exposer: image_file_key, is_published, start_date, end_date, metadata, created_at, updated_at
    }));

    res.status(200).json({
      slides: publicSlides,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la recuperation des slides";

    res.status(500).json({
      type: "server_error",
      message,
    });
  }
}
