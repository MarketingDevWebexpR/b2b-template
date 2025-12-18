/**
 * Admin Marques Reorder API Route
 *
 * Route API pour reordonner les marques.
 *
 * POST /admin/marques/reorder - Reordonne les marques
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MARQUES_MODULE } from "../../../../modules/marques";
import type MarquesModuleService from "../../../../modules/marques/service";

/**
 * Body de la requete de reordonnancement
 */
interface ReorderBody {
  marque_ids: string[];
}

/**
 * POST /admin/marques/reorder
 *
 * Reordonne les marques selon l'ordre specifie.
 * Le premier ID dans le tableau aura le rang 0, etc.
 *
 * Body:
 * - marque_ids: string[] - Tableau des IDs dans l'ordre souhaite
 *
 * @returns Les marques reordonnees
 *
 * @example Request
 * ```json
 * {
 *   "marque_ids": ["marque_abc", "marque_def", "marque_ghi"]
 * }
 * ```
 *
 * @example Response
 * ```json
 * {
 *   "success": true,
 *   "marques": [
 *     { "id": "marque_abc", "name": "Marque A", "rank": 0, ... },
 *     { "id": "marque_def", "name": "Marque B", "rank": 1, ... },
 *     { "id": "marque_ghi", "name": "Marque C", "rank": 2, ... }
 *   ]
 * }
 * ```
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const { marque_ids } = req.body as ReorderBody;

  // Validation du body
  if (!marque_ids || !Array.isArray(marque_ids) || marque_ids.length === 0) {
    res.status(400).json({
      type: "validation_error",
      message: "marque_ids must be a non-empty array of marque IDs",
    });
    return;
  }

  // Validation que tous les elements sont des strings non vides
  const invalidIds = marque_ids.filter(
    (id) => typeof id !== "string" || id.trim() === ""
  );
  if (invalidIds.length > 0) {
    res.status(400).json({
      type: "validation_error",
      message: "All marque_ids must be non-empty strings",
    });
    return;
  }

  try {
    const marques = await marquesService.reorderMarques(marque_ids);
    res.status(200).json({
      success: true,
      marques,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors du reordonnancement des marques";

    // Check si c'est une erreur de marque non trouvee
    if (message.includes("not found") || message.includes("n'existe pas")) {
      res.status(404).json({
        type: "not_found",
        message: "Une ou plusieurs marques n'ont pas ete trouvees",
      });
      return;
    }

    res.status(400).json({
      type: "error",
      message,
    });
  }
}
