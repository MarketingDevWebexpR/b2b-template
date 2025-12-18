/**
 * Admin Marque Individual API Routes
 *
 * Routes API admin pour la gestion d'une marque individuelle.
 *
 * GET /admin/marques/:id - Recupere une marque par ID
 * PUT /admin/marques/:id - Met a jour une marque
 * DELETE /admin/marques/:id - Supprime une marque
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MARQUES_MODULE } from "../../../../modules/marques";

/**
 * Interface pour le service Marques
 */
interface MarquesModuleService {
  retrieveMarque(id: string): Promise<MarqueDTO>;
  updateMarque(id: string, data: UpdateMarqueInput): Promise<MarqueDTO>;
  deleteMarques(ids: string[]): Promise<void>;
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
  is_favorite: boolean;
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
 * Input pour mettre a jour une marque
 */
interface UpdateMarqueInput {
  name?: string;
  slug?: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  is_active?: boolean;
  is_favorite?: boolean;
  metadata?: Record<string, unknown> | null;
}

/**
 * GET /admin/marques/:id
 *
 * Recupere une marque par son ID.
 *
 * @returns La marque demandee
 *
 * @example Response
 * ```json
 * {
 *   "marque": {
 *     "id": "marque_123",
 *     "name": "Cartier",
 *     "slug": "cartier",
 *     "description": "Maison de haute joaillerie",
 *     "logo_url": "https://...",
 *     "website_url": "https://www.cartier.com",
 *     "is_active": true,
 *     "created_at": "2025-01-15T10:00:00.000Z",
 *     "updated_at": "2025-01-15T10:00:00.000Z"
 *   }
 * }
 * ```
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  try {
    const marque = await marquesService.retrieveMarque(id);

    // Ajouter le comptage de produits
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

    const marqueWithCount: MarqueWithProductCount = {
      ...marque,
      product_count,
    };

    res.status(200).json({ marque: marqueWithCount });
  } catch (error) {
    res.status(404).json({
      type: "not_found",
      message: `Marque with id ${id} not found`,
    });
  }
}

/**
 * PUT /admin/marques/:id
 *
 * Met a jour une marque existante.
 *
 * Body (tous les champs sont optionnels):
 * - name?: string - Nom de la marque
 * - slug?: string - Slug URL-friendly
 * - description?: string | null - Description
 * - logo_url?: string | null - URL du logo
 * - website_url?: string | null - URL du site web
 * - is_active?: boolean - Statut actif
 * - is_favorite?: boolean - Marque favorite (mise en avant)
 * - metadata?: object | null - Metadonnees
 *
 * @returns La marque mise a jour
 *
 * @example Request
 * ```json
 * {
 *   "description": "Nouvelle description de la marque",
 *   "is_favorite": true
 * }
 * ```
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const { id } = req.params;
  const data = req.body as UpdateMarqueInput;

  // Validation: name cannot be empty if provided
  if (data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim() === "") {
      res.status(400).json({
        type: "validation_error",
        message: "Le nom de la marque ne peut pas etre vide",
      });
      return;
    }
    data.name = data.name.trim();
  }

  try {
    const marque = await marquesService.updateMarque(id, data);
    res.status(200).json({ marque });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la mise a jour";

    if (message.includes("not found")) {
      res.status(404).json({
        type: "not_found",
        message: `Marque with id ${id} not found`,
      });
      return;
    }

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

/**
 * DELETE /admin/marques/:id
 *
 * Supprime une marque.
 *
 * Note: Cette operation peut echouer si des produits sont lies a cette marque.
 * Il est recommande de d'abord dissocier les produits ou de desactiver la marque.
 *
 * @returns Confirmation de suppression
 *
 * @example Response
 * ```json
 * {
 *   "id": "marque_123",
 *   "deleted": true
 * }
 * ```
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const { id } = req.params;

  try {
    // Verify marque exists before deletion
    await marquesService.retrieveMarque(id);

    // Delete the marque
    await marquesService.deleteMarques([id]);

    res.status(200).json({
      id,
      deleted: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la suppression";

    if (message.includes("not found")) {
      res.status(404).json({
        type: "not_found",
        message: `Marque with id ${id} not found`,
      });
      return;
    }

    // Check for foreign key constraint (products linked)
    if (
      message.includes("foreign key") ||
      message.includes("constraint") ||
      message.includes("referenced")
    ) {
      res.status(409).json({
        type: "conflict_error",
        message:
          "Cette marque ne peut pas etre supprimee car des produits y sont associes. Veuillez d'abord dissocier les produits.",
      });
      return;
    }

    res.status(500).json({
      type: "server_error",
      message,
    });
  }
}
