/**
 * Check for duplicate categories in Medusa
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkDuplicateCategories({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);

  const cats = await productService.listProductCategories(
    {},
    { take: 500, select: ["id", "handle", "name", "parent_category_id"] }
  );

  logger.info(`Total categories: ${cats.length}`);

  // Count by handle
  const handleCounts: Record<string, { count: number; ids: string[]; names: string[] }> = {};
  for (const cat of cats) {
    if (!handleCounts[cat.handle]) {
      handleCounts[cat.handle] = { count: 0, ids: [], names: [] };
    }
    handleCounts[cat.handle].count++;
    handleCounts[cat.handle].ids.push(cat.id);
    handleCounts[cat.handle].names.push(cat.name);
  }

  // Find duplicates
  const duplicates = Object.entries(handleCounts).filter(([_, data]) => data.count > 1);

  if (duplicates.length > 0) {
    logger.info(`\n❌ DUPLICATES FOUND: ${duplicates.length} handles`);
    for (const [handle, data] of duplicates) {
      logger.info(`  "${handle}": ${data.count} times`);
      logger.info(`    IDs: ${data.ids.join(", ")}`);
      logger.info(`    Names: ${data.names.join(", ")}`);
    }
  } else {
    logger.info("\n✅ No duplicate handles in Medusa categories");
  }

  // Also check by name
  const nameCounts: Record<string, { count: number; handles: string[] }> = {};
  for (const cat of cats) {
    if (!nameCounts[cat.name]) {
      nameCounts[cat.name] = { count: 0, handles: [] };
    }
    nameCounts[cat.name].count++;
    nameCounts[cat.name].handles.push(cat.handle);
  }

  const nameDuplicates = Object.entries(nameCounts).filter(([_, data]) => data.count > 1);

  if (nameDuplicates.length > 0) {
    logger.info(`\n❌ NAME DUPLICATES FOUND: ${nameDuplicates.length} names`);
    for (const [name, data] of nameDuplicates) {
      logger.info(`  "${name}": ${data.count} times`);
      logger.info(`    Handles: ${data.handles.join(", ")}`);
    }
  } else {
    logger.info("\n✅ No duplicate names in Medusa categories");
  }
}
