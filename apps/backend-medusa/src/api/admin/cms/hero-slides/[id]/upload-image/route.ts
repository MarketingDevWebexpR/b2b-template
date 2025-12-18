/**
 * Admin CMS Hero Slide Image Upload API Route
 *
 * Route API admin pour uploader une image pour un slide hero.
 * Utilise le File Module de Medusa pour stocker l'image dans S3/MinIO.
 *
 * POST /admin/cms/hero-slides/:id/upload-image - Upload une image
 * DELETE /admin/cms/hero-slides/:id/upload-image - Supprime l'image
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import type { IFileModuleService } from "@medusajs/framework/types";
import type CmsModuleService from "../../../../../../modules/cms/service";

const CMS_MODULE = "cmsService";

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
 * Types MIME acceptes pour les images
 */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

/**
 * Taille maximale du fichier en octets (5 MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Valide qu'un fichier uploade est une image valide
 *
 * @param file - Le fichier a valider
 * @throws Error si le fichier n'est pas valide
 */
function validateImageFile(file: UploadedFile): void {
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
 * @param slideId - ID du slide hero
 * @returns Nom de fichier unique avec prefixe
 */
function generateUniqueFilename(originalName: string, slideId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "jpg";
  return `cms/hero-slides/${slideId}/${timestamp}-${randomSuffix}.${extension}`;
}

/**
 * POST /admin/cms/hero-slides/:id/upload-image
 *
 * Upload une image pour un slide hero.
 * L'image est stockee dans S3/MinIO via le File Module de Medusa.
 *
 * Content-Type: multipart/form-data
 * Body:
 * - file: File (requis) - L'image a uploader
 * - alt?: string - Texte alternatif pour l'image
 *
 * @returns L'URL de l'image uploadee et les infos du slide mis a jour
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const fileModuleService: IFileModuleService = req.scope.resolve(Modules.FILE);
  const { id } = req.params;

  try {
    // Verifier que le slide existe
    const existingSlide = await cmsService.retrieveHeroSlide(id);

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
    validateImageFile(file);

    // Generer un nom de fichier unique
    const filename = generateUniqueFilename(file.originalname, id);

    // Convertir le buffer en base64 pour le File Module
    const base64Content = file.buffer.toString("base64");

    // Supprimer l'ancienne image si elle existe
    if (existingSlide.image_file_key) {
      try {
        await fileModuleService.deleteFiles([existingSlide.image_file_key as string]);
      } catch (deleteError) {
        // Log mais ne pas echouer si la suppression echoue
        console.warn(
          `Impossible de supprimer l'ancienne image: ${existingSlide.image_file_key}`,
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

    // Recuperer le texte alternatif depuis le body si fourni
    const imageAlt = (req.body as { alt?: string }).alt ?? file.originalname;

    // Mettre a jour le slide avec la nouvelle URL et la cle du fichier
    const updatedSlide = await cmsService.updateHeroSlides({
      id,
      image_url: uploadedFile.url,
      image_file_key: uploadedFile.id,
      image_alt: imageAlt,
    });

    res.status(200).json({
      slide: updatedSlide,
      file: {
        url: uploadedFile.url,
        key: uploadedFile.id,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'upload de l'image";

    if (message.includes("not found") || message.includes("n'existe pas")) {
      res.status(404).json({
        type: "not_found",
        message: `Slide avec l'id ${id} non trouve`,
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
 * DELETE /admin/cms/hero-slides/:id/upload-image
 *
 * Supprime l'image associee a un slide hero.
 * L'image est supprimee du stockage S3/MinIO et les champs image_url et image_file_key
 * sont mis a null.
 *
 * @returns Le slide mis a jour sans image
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cmsService: CmsModuleService = req.scope.resolve(CMS_MODULE);
  const fileModuleService: IFileModuleService = req.scope.resolve(Modules.FILE);
  const { id } = req.params;

  try {
    // Verifier que le slide existe
    const existingSlide = await cmsService.retrieveHeroSlide(id);

    // Supprimer l'image du stockage si elle existe
    if (existingSlide.image_file_key) {
      try {
        await fileModuleService.deleteFiles([existingSlide.image_file_key as string]);
      } catch (deleteError) {
        // Log mais continuer meme si la suppression du fichier echoue
        console.warn(
          `Impossible de supprimer le fichier: ${existingSlide.image_file_key}`,
          deleteError
        );
      }
    }

    // Mettre a jour le slide pour supprimer les references a l'image
    const updatedSlide = await cmsService.updateHeroSlides({
      id,
      image_url: null,
      image_file_key: null,
    });

    res.status(200).json({
      slide: updatedSlide,
      deleted: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la suppression de l'image";

    if (message.includes("not found") || message.includes("n'existe pas")) {
      res.status(404).json({
        type: "not_found",
        message: `Slide avec l'id ${id} non trouve`,
      });
      return;
    }

    res.status(400).json({
      type: "delete_error",
      message,
    });
  }
}
