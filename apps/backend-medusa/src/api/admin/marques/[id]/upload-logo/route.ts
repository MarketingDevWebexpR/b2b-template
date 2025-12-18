/**
 * Admin Marque Logo Upload API Route
 *
 * Route API admin pour uploader un logo pour une marque.
 * Utilise le File Module de Medusa pour stocker le logo dans S3/MinIO.
 *
 * POST /admin/marques/:id/upload-logo - Upload un logo
 * DELETE /admin/marques/:id/upload-logo - Supprime le logo
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import type { IFileModuleService } from "@medusajs/framework/types";
import { MARQUES_MODULE } from "../../../../../modules/marques";
import type MarquesModuleService from "../../../../../modules/marques/service";

/**
 * Interface pour le fichier uploade via multipart/form-data
 * Compatible avec multer (utilise par Medusa)
 */
interface UploadedFile {
  /** Nom original du fichier */
  originalname: string;
  /** Type MIME du fichier */
  mimetype: string;
  /** Contenu du fichier en buffer */
  buffer: Buffer;
  /** Taille du fichier en octets */
  size: number;
}

/**
 * Types MIME acceptes pour les logos
 * Note: Pas de GIF pour les logos (trop volumineux et pas necessaire)
 */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

/**
 * Taille maximale du fichier en octets (2 MB pour les logos)
 */
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Valide qu'un fichier uploade est un logo valide
 *
 * @param file - Le fichier a valider
 * @throws Error si le fichier n'est pas valide
 */
function validateLogoFile(file: UploadedFile): void {
  if (!file) {
    throw new Error("Aucun fichier n'a ete fourni");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype as typeof ALLOWED_MIME_TYPES[number])) {
    throw new Error(
      `Type de fichier non supporte: ${file.mimetype}. ` +
      `Types acceptes: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `Le fichier est trop volumineux (${fileSizeMB} MB). ` +
      `Taille maximale: ${maxSizeMB} MB`
    );
  }
}

/**
 * Genere un nom de fichier unique pour le stockage
 *
 * @param originalName - Nom original du fichier
 * @param marqueId - ID de la marque
 * @returns Nom de fichier unique avec prefixe
 */
function generateUniqueFilename(originalName: string, marqueId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "png";
  return `pim/marques/${marqueId}/${timestamp}-${randomSuffix}.${extension}`;
}

/**
 * POST /admin/marques/:id/upload-logo
 *
 * Upload un logo pour une marque.
 * Le logo est stocke dans S3/MinIO via le File Module de Medusa.
 *
 * Content-Type: multipart/form-data
 * Body:
 * - file: File (requis) - Le logo a uploader
 *
 * @returns L'URL du logo uploade et les infos de la marque mise a jour
 *
 * @example Response
 * ```json
 * {
 *   "marque": {
 *     "id": "marque_123",
 *     "name": "Cartier",
 *     "logo_url": "https://s3.../pim/marques/marque_123/...",
 *     "logo_file_key": "file_abc123",
 *     ...
 *   },
 *   "file": {
 *     "url": "https://s3.../pim/marques/marque_123/...",
 *     "key": "file_abc123",
 *     "filename": "cartier-logo.png",
 *     "mimetype": "image/png",
 *     "size": 45678
 *   }
 * }
 * ```
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const fileModuleService: IFileModuleService = req.scope.resolve(Modules.FILE);
  const { id } = req.params;

  try {
    // Verifier que la marque existe
    const existingMarque = await marquesService.retrieveMarque(id);

    // Recuperer le fichier uploade
    // Note: Medusa utilise multer pour gerer les uploads multipart
    const file = (req as MedusaRequest & { file?: UploadedFile }).file;

    if (!file) {
      res.status(400).json({
        type: "validation_error",
        message: "Aucun fichier n'a ete fourni. Envoyez le fichier avec le champ 'file'.",
      });
      return;
    }

    // Valider le fichier
    validateLogoFile(file);

    // Generer un nom de fichier unique
    const filename = generateUniqueFilename(file.originalname, id);

    // Convertir le buffer en base64 pour le File Module
    const base64Content = file.buffer.toString("base64");

    // Supprimer l'ancien logo si il existe
    if (existingMarque.logo_file_key) {
      try {
        await fileModuleService.deleteFiles([existingMarque.logo_file_key as string]);
      } catch (deleteError) {
        // Log mais ne pas echouer si la suppression echoue
        console.warn(
          `Impossible de supprimer l'ancien logo: ${existingMarque.logo_file_key}`,
          deleteError
        );
      }
    }

    // Uploader le nouveau fichier via le File Module
    const [uploadedFile] = await fileModuleService.createFiles([{
      filename,
      mimeType: file.mimetype,
      content: base64Content,
    }]);

    // Mettre a jour la marque avec la nouvelle URL et la cle du fichier
    const updatedMarque = await marquesService.updateMarques({
      id,
      logo_url: uploadedFile.url,
      logo_file_key: uploadedFile.id,
    });

    res.status(200).json({
      marque: updatedMarque,
      file: {
        url: uploadedFile.url,
        key: uploadedFile.id,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'upload du logo";

    if (message.includes("not found") || message.includes("n'existe pas")) {
      res.status(404).json({
        type: "not_found",
        message: `Marque avec l'id ${id} non trouvee`,
      });
      return;
    }

    res.status(400).json({
      type: "upload_error",
      message,
    });
  }
}

/**
 * DELETE /admin/marques/:id/upload-logo
 *
 * Supprime le logo associe a une marque.
 * Le logo est supprime du stockage S3/MinIO et les champs logo_url et logo_file_key
 * sont mis a null.
 *
 * @returns La marque mise a jour sans logo
 *
 * @example Response
 * ```json
 * {
 *   "marque": {
 *     "id": "marque_123",
 *     "name": "Cartier",
 *     "logo_url": null,
 *     "logo_file_key": null,
 *     ...
 *   },
 *   "deleted": true
 * }
 * ```
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const marquesService: MarquesModuleService = req.scope.resolve(MARQUES_MODULE);
  const fileModuleService: IFileModuleService = req.scope.resolve(Modules.FILE);
  const { id } = req.params;

  try {
    // Verifier que la marque existe
    const existingMarque = await marquesService.retrieveMarque(id);

    // Supprimer le logo du stockage si il existe
    if (existingMarque.logo_file_key) {
      try {
        await fileModuleService.deleteFiles([existingMarque.logo_file_key as string]);
      } catch (deleteError) {
        // Log mais continuer meme si la suppression du fichier echoue
        console.warn(
          `Impossible de supprimer le fichier: ${existingMarque.logo_file_key}`,
          deleteError
        );
      }
    }

    // Mettre a jour la marque pour supprimer les references au logo
    const updatedMarque = await marquesService.updateMarques({
      id,
      logo_url: null,
      logo_file_key: null,
    });

    res.status(200).json({
      marque: updatedMarque,
      deleted: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la suppression du logo";

    if (message.includes("not found") || message.includes("n'existe pas")) {
      res.status(404).json({
        type: "not_found",
        message: `Marque avec l'id ${id} non trouvee`,
      });
      return;
    }

    res.status(400).json({
      type: "delete_error",
      message,
    });
  }
}
