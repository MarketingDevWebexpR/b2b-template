/**
 * Debug Product Categories Script
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function debugProductCategories({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Debug: Fetching products with categories...");

  // Get 3 products with categories
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "categories.*"],
    pagination: { take: 3 }
  });

  logger.info(`Got ${products.length} products`);

  for (const product of products) {
    logger.info(`\nProduct: ${JSON.stringify(product, null, 2)}`);
  }
}
