/**
 * Public CMS Marques API Route
 *
 * Point d'entree API public pour recuperer les marques actives.
 * Cette route est accessible sans authentification et sans publishable API key.
 *
 * GET /cms/marques - Recupere les marques actives
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MARQUES_MODULE } from "../../../modules/marques";

/**
 * Interface pour le service Marques
 */
interface MarquesModuleService {
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
  is_favorite: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Marque publique avec comptage de produits
 */
interface PublicMarqueWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_favorite: boolean;
  product_count: number;
}

/**
 * Filtres pour lister les marques
 */
interface ListMarquesFilters {
  is_active?: boolean;
  is_favorite?: boolean;
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
 * GET /cms/marques
 *
 * Recupere toutes les marques actives sans authentification.
 * Cette route est identique a /store/marques mais ne requiert
 * pas de publishable API key.
 *
 * Query params:
 * - q?: string - Recherche par nom
 * - favorites?: boolean - Filtrer les marques favorites uniquement (defaut: false)
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
 *   - is_favorite: boolean
 * - count: number - Nombre total de marques actives
 *
 * @example
 * ```
 * GET /cms/marques
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
 *       "website_url": "https://www.cartier.com",
 *       "is_favorite": true
 *     }
 *   ],
 *   "count": 1
 * }
 * ```
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { q, favorites, skip, take } = req.query as {
    q?: string;
    favorites?: string;
    skip?: string;
    take?: string;
  };

  const filters: ListMarquesFilters = {
    is_active: true, // Always filter by active marques for public routes
    is_favorite: favorites === "true" ? true : undefined,
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

    // Ajouter le comptage de produits pour chaque marque
    const marquesWithCount = await Promise.all(
      marques.map(async (marque) => {
        let product_count = 0;
        try {
          const { data: marqueData } = await query.graph({
            entity: "marque",
            fields: ["id", "products.id"],
            filters: { id: marque.id },
          });
          product_count = marqueData?.[0]?.products?.length || 0;
        } catch (error) {
          // Si la requete echoue, garder product_count a 0
        }

        return {
          id: marque.id,
          name: marque.name,
          slug: marque.slug,
          description: marque.description,
          logo_url: marque.logo_url,
          website_url: marque.website_url,
          is_favorite: marque.is_favorite,
          product_count,
          // Do not expose: is_active, metadata, created_at, updated_at
        };
      })
    );

    res.status(200).json({
      marques: marquesWithCount,
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
