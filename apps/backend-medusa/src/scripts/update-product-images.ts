/**
 * Update Product Images Script
 *
 * Updates all existing products with new Imgur-hosted images
 * based on their category handle.
 *
 * Run with: pnpm medusa exec ./src/scripts/update-product-images.ts
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Category to image URL mapping using Imgur-hosted images (from Platzi Fake Store API)
 */
const CATEGORY_IMAGE_MAPPINGS: Record<string, string[]> = {
  // =========== ELECTRICITE ===========
  "cables-rigides": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/mWwek7p.jpeg"],
  "cables-souples": ["https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/keVCVIa.jpeg"],
  "fils-cablage": ["https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/afHY7v2.jpeg"],
  "interrupteurs": ["https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/yAOihUe.jpeg"],
  "prises-electriques": ["https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/SolkFEB.jpeg"],
  "variateurs": ["https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/mWwek7p.jpeg"],
  "disjoncteurs": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/afHY7v2.jpeg"],
  "differentiels": ["https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/yAOihUe.jpeg"],
  "coffrets-electriques": ["https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/keVCVIa.jpeg"],
  "ampoules-led": ["https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/KIGW49u.jpeg"],
  "tubes-led": ["https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/SolkFEB.jpeg"],
  "projecteurs": ["https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/KIGW49u.jpeg"],
  "reglettes": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/afHY7v2.jpeg"],
  "gaines-icta": ["https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/mWwek7p.jpeg"],
  "tubes-irl": ["https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/KIGW49u.jpeg"],
  "moulures": ["https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/yAOihUe.jpeg"],

  // =========== PLOMBERIE ===========
  "tubes-per": ["https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/7OqTPO6.jpg"],
  "tubes-multicouche": ["https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/Lqaqz59.jpg"],
  "tubes-cuivre": ["https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/jVfoZnP.jpg"],
  "tubes-pvc": ["https://i.imgur.com/Lqaqz59.jpg", "https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/Tnl15XK.jpg"],
  "raccords-sertir": ["https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/0qQBkxX.jpg"],
  "raccords-laiton": ["https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/I5g1DoE.jpg"],
  "raccords-pvc": ["https://i.imgur.com/0qQBkxX.jpg", "https://i.imgur.com/Lqaqz59.jpg", "https://i.imgur.com/atWACf1.jpg"],
  "mitigeurs": ["https://i.imgur.com/I5g1DoE.jpg", "https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/TF0pXdL.jpg"],
  "robinets-arret": ["https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/0qQBkxX.jpg", "https://i.imgur.com/I5g1DoE.jpg"],
  "colonnes-douche": ["https://i.imgur.com/TF0pXdL.jpg", "https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/myfFQBW.jpg"],
  "wc-reservoirs": ["https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/TF0pXdL.jpg"],
  "lavabos": ["https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/I5g1DoE.jpg"],
  "baignoires": ["https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/myfFQBW.jpg"],
  "siphons": ["https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/7OqTPO6.jpg"],
  "bondes": ["https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/Lqaqz59.jpg"],

  // =========== OUTILLAGE ===========
  "perceuses-visseuses": ["https://i.imgur.com/hKcMNJs.jpeg", "https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/HiiapCt.jpeg"],
  "perforateurs": ["https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/mcW42Gi.jpeg", "https://i.imgur.com/hKcMNJs.jpeg"],
  "meuleuses": ["https://i.imgur.com/HiiapCt.jpeg", "https://i.imgur.com/mhn7qsF.jpeg", "https://i.imgur.com/NYToymX.jpeg"],
  "scies-electriques": ["https://i.imgur.com/mcW42Gi.jpeg", "https://i.imgur.com/F8vhnFJ.jpeg", "https://i.imgur.com/HiiapCt.jpeg"],
  "visseuses-chocs": ["https://i.imgur.com/mhn7qsF.jpeg", "https://i.imgur.com/npLfCGq.jpeg", "https://i.imgur.com/mcW42Gi.jpeg"],
  "tournevis": ["https://i.imgur.com/F8vhnFJ.jpeg", "https://i.imgur.com/vYim3gj.jpeg", "https://i.imgur.com/mhn7qsF.jpeg"],
  "cles": ["https://i.imgur.com/npLfCGq.jpeg", "https://i.imgur.com/HxuHwBO.jpeg", "https://i.imgur.com/F8vhnFJ.jpeg"],
  "pinces": ["https://i.imgur.com/vYim3gj.jpeg", "https://i.imgur.com/HqYqLnW.jpeg", "https://i.imgur.com/npLfCGq.jpeg"],
  "marteaux": ["https://i.imgur.com/HxuHwBO.jpeg", "https://i.imgur.com/RlDGnZw.jpeg", "https://i.imgur.com/vYim3gj.jpeg"],
  "metres-regles": ["https://i.imgur.com/HqYqLnW.jpeg", "https://i.imgur.com/qa0O6fg.jpeg", "https://i.imgur.com/HxuHwBO.jpeg"],
  "niveaux": ["https://i.imgur.com/RlDGnZw.jpeg", "https://i.imgur.com/Au8J9sX.jpeg", "https://i.imgur.com/HqYqLnW.jpeg"],
  "lasers-mesure": ["https://i.imgur.com/qa0O6fg.jpeg", "https://i.imgur.com/gdr8BW2.jpeg", "https://i.imgur.com/RlDGnZw.jpeg"],
  "telemetres": ["https://i.imgur.com/Au8J9sX.jpeg", "https://i.imgur.com/KDCZxnJ.jpeg", "https://i.imgur.com/qa0O6fg.jpeg"],
  "forets": ["https://i.imgur.com/gdr8BW2.jpeg", "https://i.imgur.com/sC0ztOB.jpeg", "https://i.imgur.com/Au8J9sX.jpeg"],
  "disques": ["https://i.imgur.com/KDCZxnJ.jpeg", "https://i.imgur.com/Jf9DL9R.jpeg", "https://i.imgur.com/gdr8BW2.jpeg"],
  "lames-scie": ["https://i.imgur.com/sC0ztOB.jpeg", "https://i.imgur.com/R1IN95T.jpeg", "https://i.imgur.com/KDCZxnJ.jpeg"],
  "caisses-outils": ["https://i.imgur.com/Jf9DL9R.jpeg", "https://i.imgur.com/hKcMNJs.jpeg", "https://i.imgur.com/sC0ztOB.jpeg"],
  "servantes": ["https://i.imgur.com/R1IN95T.jpeg", "https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/Jf9DL9R.jpeg"],

  // =========== CHAUFFAGE CLIMATISATION ===========
  "radiateurs-inertie": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/KIGW49u.jpeg"],
  "convecteurs": ["https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/mWwek7p.jpeg"],
  "panneaux-rayonnants": ["https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/keVCVIa.jpeg"],
  "radiateurs-eau-chaude": ["https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/Lqaqz59.jpg", "https://i.imgur.com/afHY7v2.jpeg"],
  "chaudieres-gaz": ["https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/yAOihUe.jpeg"],
  "accessoires-chauffage": ["https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/SolkFEB.jpeg"],
  "chauffe-eau-electriques": ["https://i.imgur.com/0qQBkxX.jpg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/I5g1DoE.jpg"],
  "chauffe-eau-thermo": ["https://i.imgur.com/I5g1DoE.jpg", "https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/myfFQBW.jpg"],
  "splits": ["https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/TF0pXdL.jpg"],
  "climatiseurs-mobiles": ["https://i.imgur.com/TF0pXdL.jpg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/BLDByXP.jpg"],
  "vmc": ["https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/b7trwCv.jpg"],
  "extracteurs": ["https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/jVfoZnP.jpg"],

  // =========== QUINCAILLERIE ===========
  "chevilles": ["https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/hKcMNJs.jpeg", "https://i.imgur.com/Tnl15XK.jpg"],
  "vis": ["https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/7OqTPO6.jpg"],
  "boulons-ecrous": ["https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/HiiapCt.jpeg", "https://i.imgur.com/Lqaqz59.jpg"],
  "clous": ["https://i.imgur.com/Lqaqz59.jpg", "https://i.imgur.com/mcW42Gi.jpeg", "https://i.imgur.com/uSqWK0m.jpg"],
  "serrures": ["https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/mhn7qsF.jpeg", "https://i.imgur.com/atWACf1.jpg"],
  "cylindres": ["https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/F8vhnFJ.jpeg", "https://i.imgur.com/0qQBkxX.jpg"],
  "verrous": ["https://i.imgur.com/0qQBkxX.jpg", "https://i.imgur.com/npLfCGq.jpeg", "https://i.imgur.com/I5g1DoE.jpg"],
  "charnieres": ["https://i.imgur.com/I5g1DoE.jpg", "https://i.imgur.com/vYim3gj.jpeg", "https://i.imgur.com/myfFQBW.jpg"],
  "poignees": ["https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/HxuHwBO.jpeg", "https://i.imgur.com/TF0pXdL.jpg"],
  "glissieres": ["https://i.imgur.com/TF0pXdL.jpg", "https://i.imgur.com/HqYqLnW.jpeg", "https://i.imgur.com/BLDByXP.jpg"],
  "silicones": ["https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/RlDGnZw.jpeg", "https://i.imgur.com/b7trwCv.jpg"],
  "joints": ["https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/qa0O6fg.jpeg", "https://i.imgur.com/jVfoZnP.jpg"],
  "mousses-pu": ["https://i.imgur.com/Au8J9sX.jpeg", "https://i.imgur.com/gdr8BW2.jpeg", "https://i.imgur.com/Tnl15XK.jpg"],

  // =========== PARENT CATEGORY FALLBACKS ===========
  "electricite": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/keVCVIa.jpeg"],
  "plomberie": ["https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/Lqaqz59.jpg"],
  "outillage": ["https://i.imgur.com/hKcMNJs.jpeg", "https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/HiiapCt.jpeg", "https://i.imgur.com/mcW42Gi.jpeg"],
  "chauffage-climatisation": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/TF0pXdL.jpg"],
  "quincaillerie": ["https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/hKcMNJs.jpeg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/I5g1DoE.jpg"],
};

const DEFAULT_IMAGES = [
  "https://i.imgur.com/SolkFEB.jpeg",
  "https://i.imgur.com/jVfoZnP.jpg",
  "https://i.imgur.com/hKcMNJs.jpeg",
  "https://i.imgur.com/myfFQBW.jpg",
];

function getImagesForCategory(categoryHandle: string | undefined, seed: number): string[] {
  if (!categoryHandle) {
    const startIdx = seed % DEFAULT_IMAGES.length;
    return [DEFAULT_IMAGES[startIdx], DEFAULT_IMAGES[(startIdx + 1) % DEFAULT_IMAGES.length]];
  }

  // Try exact match
  let images = CATEGORY_IMAGE_MAPPINGS[categoryHandle];

  // Try parent category match
  if (!images) {
    const parts = categoryHandle.split("-");
    while (parts.length > 1 && !images) {
      parts.pop();
      images = CATEGORY_IMAGE_MAPPINGS[parts.join("-")];
    }
  }

  // Fallback to defaults
  if (!images || images.length === 0) {
    images = DEFAULT_IMAGES;
  }

  // Select 2-3 images based on seed
  const numImages = 2 + (seed % 2);
  const startIdx = seed % images.length;
  const selected: string[] = [];
  for (let i = 0; i < numImages && i < images.length; i++) {
    selected.push(images[(startIdx + i) % images.length]);
  }

  return selected;
}

export default async function updateProductImages({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productService = container.resolve(Modules.PRODUCT);

  logger.info("=== Starting Product Image Update ===");

  try {
    // Fetch all published products with their categories
    const { data: products } = await (query as any).graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "categories.id",
        "categories.handle",
        "images.id",
        "images.url",
      ],
      filters: {
        status: "published",
      },
    });

    logger.info(`Found ${products.length} published products to update`);

    let updated = 0;
    let skipped = 0;
    const batchSize = 50;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      for (const product of batch) {
        // Get the first category handle for this product
        const categoryHandle = product.categories?.[0]?.handle;

        // Generate new images based on category
        const newImages = getImagesForCategory(categoryHandle, i + updated);
        const newThumbnail = newImages[0];

        // Check if update is needed (if thumbnail contains unsplash or is broken)
        const currentThumbnail = product.thumbnail || "";
        const needsUpdate =
          currentThumbnail.includes("unsplash") ||
          currentThumbnail.includes("undefined") ||
          !currentThumbnail ||
          currentThumbnail === "";

        if (!needsUpdate) {
          skipped++;
          continue;
        }

        try {
          // Update product with new images
          await productService.updateProducts(product.id, {
            thumbnail: newThumbnail,
            images: newImages.map((url: string, idx: number) => ({
              url,
              rank: idx,
            })),
          });
          updated++;

          if (updated % 100 === 0) {
            logger.info(`   Updated ${updated} products...`);
          }
        } catch (error) {
          logger.error(`Failed to update product ${product.id}: ${error}`);
        }
      }
    }

    logger.info(`=== Product Image Update Complete ===`);
    logger.info(`   Updated: ${updated} products`);
    logger.info(`   Skipped: ${skipped} products (already had valid images)`);
  } catch (error) {
    logger.error("Product image update failed:", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
