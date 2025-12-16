/**
 * Database Seed Script
 *
 * This script populates the database with initial data for development and testing.
 * Run with: pnpm seed
 *
 * @example
 * ```bash
 * cd apps/backend-medusa
 * pnpm seed
 * ```
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IRegionModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function seed({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve("logger") as Logger;

  logger.info("Starting database seed...");

  try {
    // =========================================================================
    // SEED REGIONS
    // =========================================================================
    await seedRegions(container, logger);

    // =========================================================================
    // SEED PRODUCTS (Optional - uncomment when ready)
    // =========================================================================
    // await seedProducts(container, logger);

    // =========================================================================
    // SEED B2B DATA (Optional - uncomment when modules are ready)
    // =========================================================================
    // await seedCompanies(container, logger);
    // await seedSpendingLimits(container, logger);

    logger.info("Database seed completed successfully!");
  } catch (error) {
    logger.error("Database seed failed:", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Seed regions and currencies
 */
async function seedRegions(
  container: ExecArgs["container"],
  logger: Logger
): Promise<void> {
  logger.info("Seeding regions...");

  const regionService = container.resolve<IRegionModuleService>(Modules.REGION);

  // Check if regions already exist
  const existingRegions = await regionService.listRegions({});
  if (existingRegions.length > 0) {
    logger.info("Regions already exist, skipping...");
    return;
  }

  // Create Europe region
  await regionService.createRegions({
    name: "Europe",
    currency_code: "eur",
    countries: ["fr", "de", "it", "es", "be", "nl", "lu", "ch", "at"],
  });

  // Create North America region
  await regionService.createRegions({
    name: "North America",
    currency_code: "usd",
    countries: ["us", "ca"],
  });

  // Create UK region
  await regionService.createRegions({
    name: "United Kingdom",
    currency_code: "gbp",
    countries: ["gb"],
  });

  logger.info("Regions seeded successfully");
}

/**
 * Seed sample products
 * Uncomment and customize when you're ready to add products
 */
// async function seedProducts(
//   container: ExecArgs["container"],
//   logger: Logger
// ): Promise<void> {
//   logger.info("Seeding products...");
//
//   const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);
//
//   // Example: Create a sample jewelry product
//   await productService.createProducts({
//     title: "Gold Ring",
//     description: "18K gold ring with diamond accent",
//     handle: "gold-ring",
//     status: "published",
//     options: [
//       { title: "Size", values: ["5", "6", "7", "8", "9"] },
//     ],
//     variants: [
//       { title: "Size 5", sku: "RING-GOLD-5", manage_inventory: true },
//       { title: "Size 6", sku: "RING-GOLD-6", manage_inventory: true },
//       { title: "Size 7", sku: "RING-GOLD-7", manage_inventory: true },
//       { title: "Size 8", sku: "RING-GOLD-8", manage_inventory: true },
//       { title: "Size 9", sku: "RING-GOLD-9", manage_inventory: true },
//     ],
//   });
//
//   logger.info("Products seeded successfully");
// }

/**
 * Seed B2B companies
 * Uncomment when company module is implemented
 */
// async function seedCompanies(
//   container: ExecArgs["container"],
//   logger: Logger
// ): Promise<void> {
//   logger.info("Seeding B2B companies...");
//
//   const companyService = container.resolve("companyModuleService");
//
//   await companyService.createCompany({
//     name: "Acme Jewelry Distributors",
//     tax_id: "FR12345678901",
//     spending_limit: 50000_00, // 50,000.00 in cents
//     approval_required: true,
//   });
//
//   await companyService.createCompany({
//     name: "Luxury Gems Inc",
//     tax_id: "US987654321",
//     spending_limit: 100000_00, // 100,000.00 in cents
//     approval_required: true,
//   });
//
//   logger.info("B2B companies seeded successfully");
// }

/**
 * Seed spending limits
 * Uncomment when spending limits module is implemented
 */
// async function seedSpendingLimits(
//   container: ExecArgs["container"],
//   logger: Logger
// ): Promise<void> {
//   logger.info("Seeding spending limits...");
//
//   const spendingLimitService = container.resolve("spendingLimitModuleService");
//
//   // Example spending limit tiers
//   // Implement based on your spending limits module design
//
//   logger.info("Spending limits seeded successfully");
// }
