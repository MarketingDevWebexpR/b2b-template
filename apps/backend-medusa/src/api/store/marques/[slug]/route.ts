/**
 * Store Marque by Slug API Route
 *
 * Route API publique pour recuperer une marque par son slug.
 * Cette route est accessible sans authentification et retourne
 * uniquement si la marque est active (is_active = true).
 *
 * GET /store/marques/:slug - Recupere une marque par slug
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MARQUES_MODULE } from "../../../../modules/marques";

/**
 * Interface pour le service Marques
 */
interface MarquesModuleService {
  retrieveMarqueBySlug(slug: string): Promise<MarqueDTO | null>;
}

/**
 * DTO pour une marque
 */
interface MarqueDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  is_active: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * GET /store/marques/:slug
 *
 * Recupere une marque active par son slug.
 * Retourne une erreur 404 si la marque n'existe pas ou n'est pas active.
 *
 * Path params:
 * - slug: string - Le slug URL-friendly de la marque
 *
 * Response:
 * - marque: object - La marque avec ses champs publics:
 *   - id: string
 *   - name: string
 *   - slug: string
 *   - description: string | null
 *   - logo_url: string | null
 *   - website_url: string | null
 *
 * @example
 * ```
 * GET /store/marques/cartier
 *
 * Response:
 * {
 *   "marque": {
 *     "id": "marque_123",
 *     "name": "Cartier",
 *     "slug": "cartier",
 *     "description": "Maison de haute joaillerie fondee en 1847",
 *     "logo_url": "https://example.com/cartier-logo.png",
 *     "website_url": "https://www.cartier.com"
 *   }
 * }
 * ```
 *
 * @example Error Response (404)
 * ```
 * {
 *   "type": "not_found",
 *   "message": "Marque 'cartier' not found"
 * }
 * ```
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const { slug } = req.params;

  try {
    const marque = await marquesService.retrieveMarqueBySlug(slug);

    // Check if marque exists and is active
    if (!marque || !marque.is_active) {
      res.status(404).json({
        type: "not_found",
        message: `Marque '${slug}' not found`,
      });
      return;
    }

    // Return only public fields
    const publicMarque = {
      id: marque.id,
      name: marque.name,
      slug: marque.slug,
      description: marque.description,
      logo_url: marque.logo_url,
      website_url: marque.website_url,
      // Do not expose: is_active, metadata, created_at, updated_at
    };

    res.status(200).json({
      marque: publicMarque,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la recuperation de la marque";

    // Handle not found errors
    if (message.includes("not found")) {
      res.status(404).json({
        type: "not_found",
        message: `Marque '${slug}' not found`,
      });
      return;
    }

    res.status(500).json({
      type: "server_error",
      message,
    });
  }
}
