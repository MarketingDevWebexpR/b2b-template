/**
 * Seed Product Images Script
 *
 * Adds placeholder images to all products and variants.
 * Uses Unsplash for high-quality product images.
 *
 * Run with: pnpm medusa exec src/scripts/seed-product-images.ts
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * Image URLs by product category/type
 * Using Unsplash source for high-quality jewelry and tool images
 */
const IMAGE_COLLECTIONS = {
  // Jewelry images
  bijoux: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
  ],
  bagues: [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80",
    "https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=800&q=80",
    "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&q=80",
  ],
  colliers: [
    "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80",
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
  ],
  bracelets: [
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
  ],
  boucles: [
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
    "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80",
    "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&q=80",
    "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80",
  ],
  montres: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
    "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800&q=80",
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80",
  ],
  diamants: [
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
    "https://images.unsplash.com/photo-1615655114865-4cc1890a9d49?w=800&q=80",
    "https://images.unsplash.com/photo-1600267165477-6d4cc741b379?w=800&q=80",
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80",
  ],
  // Tools images (for products like perceuse, etc.)
  outils: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
  ],
  perceuse: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
  ],
  // Generic product images
  default: [
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
  ],
};

/**
 * Determine which image collection to use based on product handle/title
 */
function getImageCollection(handle: string, title: string): string[] {
  const text = `${handle} ${title}`.toLowerCase();

  if (text.includes("perceuse") || text.includes("visseuse") || text.includes("perforateur") || text.includes("ponceuse")) {
    return IMAGE_COLLECTIONS.outils;
  }
  if (text.includes("bague") || text.includes("solitaire") || text.includes("alliance") || text.includes("ring")) {
    return IMAGE_COLLECTIONS.bagues;
  }
  if (text.includes("collier") || text.includes("pendentif") || text.includes("chaine") || text.includes("necklace")) {
    return IMAGE_COLLECTIONS.colliers;
  }
  if (text.includes("bracelet") || text.includes("jonc") || text.includes("gourmette")) {
    return IMAGE_COLLECTIONS.bracelets;
  }
  if (text.includes("boucle") || text.includes("earring") || text.includes("oreille")) {
    return IMAGE_COLLECTIONS.boucles;
  }
  if (text.includes("montre") || text.includes("watch") || text.includes("horloge")) {
    return IMAGE_COLLECTIONS.montres;
  }
  if (text.includes("diamant") || text.includes("diamond") || text.includes("pierre") || text.includes("gem")) {
    return IMAGE_COLLECTIONS.diamants;
  }
  if (text.includes("bijou") || text.includes("jewelry") || text.includes("or ") || text.includes("argent")) {
    return IMAGE_COLLECTIONS.bijoux;
  }

  return IMAGE_COLLECTIONS.default;
}

/**
 * Main seed function
 */
export default async function seedProductImages({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

  logger.info("🖼️  Starting product images seed...");

  try {
    const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

    // Fetch all products
    const products = await productService.listProducts(
      {},
      {
        relations: ["variants", "images"],
        take: 1000,
      }
    );

    logger.info(`   Found ${products.length} products to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Skip if product already has images
      if (product.thumbnail && product.images && product.images.length > 0) {
        skippedCount++;
        continue;
      }

      // Get appropriate images for this product
      const imageCollection = getImageCollection(product.handle || "", product.title);

      // Shuffle to get variety
      const shuffled = [...imageCollection].sort(() => Math.random() - 0.5);
      const thumbnail = shuffled[0];
      const images = shuffled.slice(0, 3).map((url) => ({ url }));

      // Update product
      await productService.updateProducts(product.id, {
        thumbnail,
        images,
      });

      updatedCount++;

      if (updatedCount % 10 === 0) {
        logger.info(`   Updated ${updatedCount} products...`);
      }
    }

    logger.info(`✅ Product images seed completed!`);
    logger.info(`   - Updated: ${updatedCount} products`);
    logger.info(`   - Skipped (already have images): ${skippedCount} products`);
  } catch (error) {
    logger.error("❌ Product images seed failed:", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
