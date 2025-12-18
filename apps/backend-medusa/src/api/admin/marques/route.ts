/**
 * Admin Marques API Routes
 *
 * Routes API admin pour la gestion des marques (brands).
 * Ces routes sont protegees par l'authentification admin.
 *
 * GET /admin/marques - Liste toutes les marques avec pagination et product_count
 * POST /admin/marques - Cree une nouvelle marque
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MARQUES_MODULE } from "../../../modules/marques";

/**
 * Interface pour le service Marques
 * A adapter selon l'implementation reelle du module
 */
interface MarquesModuleService {
  listMarquesWithCount(
    filters: ListMarquesFilters,
    pagination: PaginationOptions
  ): Promise<{ marques: MarqueDTO[]; count: number }>;
  createMarque(data: CreateMarqueInput): Promise<MarqueDTO>;
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
  logo_file_key?: string | null;
  website_url?: string | null;
  country?: string | null;
  is_active: boolean;
  rank: number;
  metadata?: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Marque avec comptage de produits
 */
interface MarqueWithProductCount extends MarqueDTO {
  product_count: number;
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
 * Input pour creer une marque
 */
interface CreateMarqueInput {
  name: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * GET /admin/marques
 *
 * Liste toutes les marques avec pagination et filtres.
 *
 * Query params:
 * - q: string - Recherche par nom
 * - is_active: boolean - Filtrer par statut actif
 * - skip: number - Offset pour pagination (defaut: 0)
 * - take: number - Limite pour pagination (defaut: 50)
 *
 * @returns Liste des marques et comptage total
 *
 * @example Response
 * ```json
 * {
 *   "marques": [
 *     {
 *       "id": "marque_123",
 *       "name": "Cartier",
 *       "slug": "cartier",
 *       "description": "Maison de haute joaillerie",
 *       "logo_url": "https://...",
 *       "is_active": true,
 *       "rank": 0,
 *       "product_count": 42
 *     }
 *   ],
 *   "count": 15,
 *   "skip": 0,
 *   "take": 50
 * }
 * ```
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { q, is_active, skip, take } = req.query as {
    q?: string;
    is_active?: string;
    skip?: string;
    take?: string;
  };

  const filters: ListMarquesFilters = {
    q: q || undefined,
    is_active: is_active !== undefined ? is_active === "true" : undefined,
  };

  const pagination: PaginationOptions = {
    skip: skip ? parseInt(skip, 10) : 0,
    take: take ? parseInt(take, 10) : 50,
  };

  try {
    const { marques, count } = await marquesService.listMarquesWithCount(
      filters,
      pagination
    );

    // Ajouter le comptage de produits pour chaque marque
    // Utiliser query.graph pour recuperer les marques avec leurs produits lies
    const marquesWithCount: MarqueWithProductCount[] = await Promise.all(
      marques.map(async (marque) => {
        try {
          // Utiliser marque entity avec products pour obtenir le count via le lien
          const { data: marqueData } = await query.graph({
            entity: "marque",
            fields: ["id", "products.id"],
            filters: { id: marque.id },
          });

          const productCount = marqueData?.[0]?.products?.length || 0;
          return { ...marque, product_count: productCount };
        } catch (error) {
          // Si la requete echoue (ex: pas de lien configure), retourner 0
          return { ...marque, product_count: 0 };
        }
      })
    );

    res.status(200).json({
      marques: marquesWithCount,
      count,
      skip: pagination.skip,
      take: pagination.take,
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

/**
 * POST /admin/marques
 *
 * Cree une nouvelle marque.
 *
 * Body:
 * - name: string (requis) - Nom de la marque
 * - slug?: string - Slug URL-friendly (genere automatiquement si non fourni)
 * - description?: string - Description de la marque
 * - logo_url?: string - URL du logo
 * - website_url?: string - URL du site web officiel
 * - is_active?: boolean - Statut actif (defaut: true)
 * - metadata?: object - Metadonnees additionnelles
 *
 * @returns La marque creee
 *
 * @example Request
 * ```json
 * {
 *   "name": "Cartier",
 *   "description": "Maison de haute joaillerie fondee en 1847",
 *   "logo_url": "https://example.com/cartier-logo.png",
 *   "website_url": "https://www.cartier.com",
 *   "is_active": true
 * }
 * ```
 *
 * @example Response
 * ```json
 * {
 *   "marque": {
 *     "id": "marque_123",
 *     "name": "Cartier",
 *     "slug": "cartier",
 *     "description": "Maison de haute joaillerie fondee en 1847",
 *     "logo_url": "https://example.com/cartier-logo.png",
 *     "website_url": "https://www.cartier.com",
 *     "is_active": true,
 *     "created_at": "2025-01-15T10:00:00.000Z",
 *     "updated_at": "2025-01-15T10:00:00.000Z"
 *   }
 * }
 * ```
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const data = req.body as CreateMarqueInput;

  // Validation basique
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    res.status(400).json({
      type: "validation_error",
      message: "Le nom de la marque est requis",
    });
    return;
  }

  try {
    const marque = await marquesService.createMarque({
      ...data,
      name: data.name.trim(),
    });

    res.status(201).json({ marque });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la creation de la marque";

    // Check for duplicate slug error
    if (message.includes("slug") && message.includes("unique")) {
      res.status(409).json({
        type: "conflict_error",
        message: "Une marque avec ce slug existe deja",
      });
      return;
    }

    res.status(400).json({
      type: "validation_error",
      message,
    });
  }
}
