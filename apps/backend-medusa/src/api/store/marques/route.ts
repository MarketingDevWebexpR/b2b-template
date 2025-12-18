/**
 * Store Marques API Route
 *
 * Route API publique pour recuperer les marques actives.
 * Cette route est accessible sans authentification et retourne
 * uniquement les marques actives (is_active = true).
 *
 * GET /store/marques - Liste les marques actives
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MARQUES_MODULE } from "../../../modules/marques";

/**
 * Interface pour le service Marques
 */
interface MarquesModuleService {
  listActiveMarques(pagination?: PaginationOptions): Promise<MarqueDTO[]>;
  listMarquesWithCount(
    filters: ListMarquesFilters,
    pagination: PaginationOptions
  ): Promise<{ marques: MarqueDTO[]; count: number }>;
}

/**
 * DTO pour une marque (version publique)
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
 * Filtres pour lister les marques
 */
interface ListMarquesFilters {
  is_active?: boolean;
  q?: string;
}

/**
 * Options de pagination
 */
interface PaginationOptions {
  skip?: number;
  take?: number;
}

/**
 * GET /store/marques
 *
 * Liste les marques actives pour le storefront.
 * Seules les marques avec is_active = true sont retournees.
 *
 * Query params:
 * - q?: string - Recherche par nom
 * - skip?: number - Offset pour pagination (defaut: 0)
 * - take?: number - Limite pour pagination (defaut: 100)
 *
 * Response:
 * - marques: MarqueDTO[] - Liste des marques actives avec champs publics:
 *   - id: string
 *   - name: string
 *   - slug: string
 *   - description: string | null
 *   - logo_url: string | null
 *   - website_url: string | null
 * - count: number - Nombre total de marques actives
 *
 * @example
 * ```
 * GET /store/marques
 *
 * Response:
 * {
 *   "marques": [
 *     {
 *       "id": "marque_123",
 *       "name": "Cartier",
 *       "slug": "cartier",
 *       "description": "Maison de haute joaillerie",
 *       "logo_url": "https://...",
 *       "website_url": "https://www.cartier.com"
 *     },
 *     {
 *       "id": "marque_456",
 *       "name": "Bulgari",
 *       "slug": "bulgari",
 *       "description": "Joaillier italien de luxe",
 *       "logo_url": "https://...",
 *       "website_url": "https://www.bulgari.com"
 *     }
 *   ],
 *   "count": 2
 * }
 * ```
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);

  const { q, skip, take } = req.query as {
    q?: string;
    skip?: string;
    take?: string;
  };

  const filters: ListMarquesFilters = {
    is_active: true, // Always filter by active marques for store
    q: q || undefined,
  };

  const pagination: PaginationOptions = {
    skip: skip ? parseInt(skip, 10) : 0,
    take: take ? parseInt(take, 10) : 100,
  };

  try {
    const { marques, count } = await marquesService.listMarquesWithCount(
      filters,
      pagination
    );

    // Return only public fields
    const publicMarques = marques.map((marque) => ({
      id: marque.id,
      name: marque.name,
      slug: marque.slug,
      description: marque.description,
      logo_url: marque.logo_url,
      website_url: marque.website_url,
      // Do not expose: is_active, metadata, created_at, updated_at
    }));

    res.status(200).json({
      marques: publicMarques,
      count,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la recuperation des marques";

    res.status(500).json({
      type: "server_error",
      message,
    });
  }
}
