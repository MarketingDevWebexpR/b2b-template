/**
 * Seed B2B Professional Brands Script
 *
 * Creates professional B2B brands for electrical, plumbing, tools,
 * HVAC, and hardware categories.
 *
 * Run with: npx medusa exec ./src/scripts/seed-b2b-brands.ts
 *
 * Prerequisites:
 * - The marques module must be registered in medusa-config.js
 * - Run database migrations: medusa db:migrate
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MARQUES_MODULE } from "../modules/marques";
import type { MarquesModuleService, CreateMarqueInput, MarqueDTO } from "../modules/marques";

// ============================================================================
// B2B PROFESSIONAL BRANDS
// ============================================================================

interface BrandDefinition {
  name: string;
  slug: string;
  description: string;
  website_url: string;
  country: string;
  is_active: boolean;
}

/**
 * Professional B2B brands for hardware, electrical, plumbing, tools, and HVAC
 */
const B2B_BRANDS: BrandDefinition[] = [
  // -------------------------------------------------------------------------
  // POWER TOOLS / ELECTROPORTATIF
  // -------------------------------------------------------------------------
  {
    name: "Bosch Professional",
    slug: "bosch",
    description: "Marque allemande leader mondial de l'outillage electroportatif professionnel. Solutions innovantes pour le batiment et l'industrie.",
    website_url: "https://www.bosch-professional.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "DeWalt",
    slug: "dewalt",
    description: "Marque americaine d'outillage professionnel haut de gamme. Perceuses, visseuses, scies pour professionnels du batiment.",
    website_url: "https://www.dewalt.com",
    country: "United States",
    is_active: true,
  },
  {
    name: "Makita",
    slug: "makita",
    description: "Fabricant japonais d'outillage electrique professionnel. Innovation et fiabilite depuis 1915.",
    website_url: "https://www.makita.com",
    country: "Japan",
    is_active: true,
  },
  {
    name: "Milwaukee",
    slug: "milwaukee",
    description: "Marque americaine d'outils electriques professionnels. Technologies M12 et M18 pour tous les metiers du batiment.",
    website_url: "https://www.milwaukeetool.com",
    country: "United States",
    is_active: true,
  },
  {
    name: "Hilti",
    slug: "hilti",
    description: "Groupe liechtensteinois specialise dans l'outillage et la fixation pour professionnels du batiment. Solutions innovantes et services.",
    website_url: "https://www.hilti.com",
    country: "Liechtenstein",
    is_active: true,
  },
  {
    name: "Metabo",
    slug: "metabo",
    description: "Fabricant allemand d'outils electriques professionnels. Meuleuses, perforateurs et solutions sans fil de qualite.",
    website_url: "https://www.metabo.com",
    country: "Germany",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // HAND TOOLS / OUTILLAGE A MAIN
  // -------------------------------------------------------------------------
  {
    name: "Stanley",
    slug: "stanley",
    description: "Marque americaine iconique d'outillage a main depuis 1843. Metres, tournevis, caisses a outils pour professionnels.",
    website_url: "https://www.stanleytools.com",
    country: "United States",
    is_active: true,
  },
  {
    name: "Facom",
    slug: "facom",
    description: "Marque francaise d'outillage a main professionnel depuis 1918. Reference pour les mecaniciens et techniciens.",
    website_url: "https://www.facom.com",
    country: "France",
    is_active: true,
  },
  {
    name: "Bahco",
    slug: "bahco",
    description: "Marque suedoise d'outillage a main professionnel. Cles, pinces et scies de qualite superieure.",
    website_url: "https://www.bahco.com",
    country: "Sweden",
    is_active: true,
  },
  {
    name: "Knipex",
    slug: "knipex",
    description: "Fabricant allemand specialise dans les pinces professionnelles. Reference mondiale pour les electriciens et mecaniciens.",
    website_url: "https://www.knipex.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Wiha",
    slug: "wiha",
    description: "Fabricant allemand d'outillage de precision. Tournevis, embouts et outils isoles pour electriciens.",
    website_url: "https://www.wiha.com",
    country: "Germany",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // ELECTRICAL / ELECTRICITE
  // -------------------------------------------------------------------------
  {
    name: "Schneider Electric",
    slug: "schneider-electric",
    description: "Leader mondial de la gestion de l'energie et des automatismes. Appareillage electrique, tableaux, disjoncteurs.",
    website_url: "https://www.se.com",
    country: "France",
    is_active: true,
  },
  {
    name: "Legrand",
    slug: "legrand",
    description: "Specialiste mondial des infrastructures electriques et numeriques. Appareillage, goulottes, VDI.",
    website_url: "https://www.legrand.com",
    country: "France",
    is_active: true,
  },
  {
    name: "Hager",
    slug: "hager",
    description: "Groupe allemand specialise dans les solutions electriques pour le batiment. Tableaux, disjoncteurs, domotique.",
    website_url: "https://www.hager.com",
    country: "Germany",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // PLUMBING / PLOMBERIE
  // -------------------------------------------------------------------------
  {
    name: "Grohe",
    slug: "grohe",
    description: "Marque allemande leader de la robinetterie sanitaire. Innovation et design pour salles de bains et cuisines.",
    website_url: "https://www.grohe.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Hansgrohe",
    slug: "hansgrohe",
    description: "Fabricant allemand de robinetterie et douches haut de gamme. Design innovant et qualite premium.",
    website_url: "https://www.hansgrohe.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Geberit",
    slug: "geberit",
    description: "Leader europeen des systemes sanitaires. WC suspendus, systemes d'evacuation et d'alimentation.",
    website_url: "https://www.geberit.com",
    country: "Switzerland",
    is_active: true,
  },
  {
    name: "Roca",
    slug: "roca",
    description: "Fabricant espagnol de sanitaires et robinetterie. Solutions completes pour salles de bains.",
    website_url: "https://www.roca.com",
    country: "Spain",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // HVAC / CHAUFFAGE CLIMATISATION
  // -------------------------------------------------------------------------
  {
    name: "Atlantic",
    slug: "atlantic",
    description: "Leader francais du confort thermique. Chauffage electrique, chauffe-eau, climatisation, ventilation.",
    website_url: "https://www.atlantic.fr",
    country: "France",
    is_active: true,
  },
  {
    name: "Thermor",
    slug: "thermor",
    description: "Marque francaise de chauffage et eau chaude sanitaire. Radiateurs electriques et chauffe-eau innovants.",
    website_url: "https://www.thermor.fr",
    country: "France",
    is_active: true,
  },
  {
    name: "Daikin",
    slug: "daikin",
    description: "Leader mondial de la climatisation et des pompes a chaleur. Solutions professionnelles pour le residentiel et tertiaire.",
    website_url: "https://www.daikin.com",
    country: "Japan",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // HARDWARE / QUINCAILLERIE
  // -------------------------------------------------------------------------
  {
    name: "Fischer",
    slug: "fischer",
    description: "Specialiste allemand de la fixation. Chevilles, systemes d'ancrage, produits chimiques pour le batiment.",
    website_url: "https://www.fischer.de",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Wurth",
    slug: "wurth",
    description: "Groupe allemand leader de la distribution de materiel de fixation et montage. Visserie, outillage, consommables.",
    website_url: "https://www.wurth.com",
    country: "Germany",
    is_active: true,
  },
];

// ============================================================================
// LOGO URL GENERATION
// ============================================================================

const LOGO_DEV_TOKEN = process.env.LOGO_DEV_TOKEN || "pk_P5GhHUJET1id8okI1fijeg";

function generateLogoUrl(domain: string): string {
  const params = new URLSearchParams({
    token: LOGO_DEV_TOKEN,
    format: "png",
    size: "128",
  });
  return `https://img.logo.dev/${domain}?${params.toString()}`;
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] || url;
  }
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

export default async function seedB2BBrands({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

  logger.info("=".repeat(60));
  logger.info("Seed B2B Professional Brands");
  logger.info("=".repeat(60));
  logger.info("");

  // -------------------------------------------------------------------------
  // Step 1: Check if marques module is available
  // -------------------------------------------------------------------------
  let marquesService: MarquesModuleService;
  try {
    marquesService = container.resolve<MarquesModuleService>(MARQUES_MODULE);
  } catch (error) {
    logger.error("Marques module not found!");
    logger.error("");
    logger.error("Please ensure the marques module is:");
    logger.error("  1. Created in src/modules/marques/");
    logger.error("  2. Registered in medusa-config.js");
    throw new Error("Marques module not available. Please register it first.");
  }

  // -------------------------------------------------------------------------
  // Step 2: Check existing brands
  // -------------------------------------------------------------------------
  logger.info("[1/3] Checking existing brands...");

  const existingBrands = await marquesService.listMarques({});
  const existingSlugs = new Set(existingBrands.map((b) => b.slug));

  logger.info(`   Found ${existingBrands.length} existing brands`);

  // -------------------------------------------------------------------------
  // Step 3: Create new B2B brands
  // -------------------------------------------------------------------------
  logger.info("[2/3] Creating B2B professional brands...");

  const createdBrands: MarqueDTO[] = [];
  let skippedCount = 0;

  for (let i = 0; i < B2B_BRANDS.length; i++) {
    const brand = B2B_BRANDS[i];

    // Skip if brand already exists
    if (existingSlugs.has(brand.slug)) {
      logger.info(`   Skipped (exists): ${brand.name}`);
      skippedCount++;
      continue;
    }

    try {
      const domain = extractDomain(brand.website_url);
      const logoUrl = generateLogoUrl(domain);

      const createInput: CreateMarqueInput = {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        logo_url: logoUrl,
        website_url: brand.website_url,
        country: brand.country,
        is_active: brand.is_active,
        rank: (existingBrands.length + i + 1) * 10,
      };

      const created = await marquesService.createMarques(createInput);
      createdBrands.push(created as MarqueDTO);
      logger.info(`   Created: ${brand.name} (${brand.country})`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("existe deja") || errMsg.includes("unique") || errMsg.includes("duplicate")) {
        logger.warn(`   Skipped (duplicate): ${brand.name}`);
        skippedCount++;
      } else {
        logger.error(`   Failed to create ${brand.name}: ${errMsg}`);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  logger.info("");
  logger.info("[3/3] Summary");
  logger.info("=".repeat(60));
  logger.info(`B2B brands created: ${createdBrands.length}`);
  logger.info(`Brands skipped (already exist): ${skippedCount}`);
  logger.info("");
  logger.info("Brands by category:");
  logger.info("   - Power Tools: Bosch, DeWalt, Makita, Milwaukee, Hilti, Metabo");
  logger.info("   - Hand Tools: Stanley, Facom, Bahco, Knipex, Wiha");
  logger.info("   - Electrical: Schneider Electric, Legrand, Hager");
  logger.info("   - Plumbing: Grohe, Hansgrohe, Geberit, Roca");
  logger.info("   - HVAC: Atlantic, Thermor, Daikin");
  logger.info("   - Hardware: Fischer, Wurth");
  logger.info("");
  logger.info("=".repeat(60));
  logger.info("B2B Brands seed completed!");
  logger.info("=".repeat(60));
}
