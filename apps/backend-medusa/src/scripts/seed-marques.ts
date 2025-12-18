/**
 * Seed Marques (Brands) Script - B2B Industrial Distribution
 *
 * Creates real B2B industrial brand data for development and testing.
 * Brands are real European and international industrial distributors.
 *
 * Run with: medusa exec ./src/scripts/seed-marques.ts
 *
 * Prerequisites:
 * - The marques module must be registered in medusa-config.js
 * - Run database migrations: medusa db:migrate
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MARQUES_MODULE } from "../modules/marques";
import type { MarquesModuleService, CreateMarqueInput, MarqueDTO } from "../modules/marques";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Brand definition for seeding
 */
interface MarqueDefinition {
  /** Brand name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Description in French */
  description: string;
  /** Logo URL (placeholder) */
  logo_url: string;
  /** Fake website URL */
  website_url: string;
  /** Country of origin */
  country: string;
  /** Active status */
  is_active: boolean;
  /** Display rank/order */
  rank: number;
}

/**
 * Link service interface
 */
interface IRemoteLinkService {
  create(linkDefinition: Record<string, Record<string, string>>): Promise<void>;
  dismiss(linkDefinition: Record<string, Record<string, string>>): Promise<void>;
}

// ============================================================================
// LOGO.DEV API CONFIGURATION
// ============================================================================

/**
 * Logo.dev API token
 * Get your publishable key from https://www.logo.dev/
 * Set via environment variable LOGO_DEV_TOKEN
 */
const LOGO_DEV_TOKEN = process.env.LOGO_DEV_TOKEN || "pk_P5GhHUJET1id8okI1fijeg";

/**
 * Generate logo URL using logo.dev API
 *
 * logo.dev URL format: https://img.logo.dev/{domain}?token={token}&format=png&size=128
 */
function generateLogoUrl(domain: string): string {
  const params = new URLSearchParams({
    token: LOGO_DEV_TOKEN,
    format: "png",
    size: "128",
  });
  return `https://img.logo.dev/${domain}?${params.toString()}`;
}

// ============================================================================
// BRAND DATA - B2B Industrial Distribution Brands
// ============================================================================

/**
 * Brand definition without computed fields
 */
interface BrandDefinitionInput {
  /** Brand name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Description in French */
  description: string;
  /** Website domain for logo.dev API */
  domain: string;
  /** Full website URL */
  website_url: string;
  /** Country of origin */
  country: string;
  /** Active status */
  is_active: boolean;
}

/**
 * Real B2B industrial distribution brands with their actual data
 * Using logo.dev API to fetch real brand logos
 */
const B2B_BRANDS: BrandDefinitionInput[] = [
  // -------------------------------------------------------------------------
  // OUTILLAGE ELECTROPORTATIF (Power Tools)
  // -------------------------------------------------------------------------
  {
    name: "Bosch",
    slug: "bosch",
    description: "Leader mondial de l'outillage electroportatif professionnel. Gamme complete d'outils pour les professionnels du batiment et de l'industrie. Innovation allemande depuis 1886.",
    domain: "bosch.com",
    website_url: "https://www.bosch.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "DeWalt",
    slug: "dewalt",
    description: "Marque americaine d'outillage professionnel reconnue pour sa robustesse. Specialiste des perceuses, visseuses et scies circulaires pour chantiers exigeants.",
    domain: "dewalt.com",
    website_url: "https://www.dewalt.com",
    country: "United States",
    is_active: true,
  },
  {
    name: "Makita",
    slug: "makita",
    description: "Fabricant japonais d'outillage electroportatif de haute qualite. Pionnier de la technologie lithium-ion et des outils sans fil professionnels.",
    domain: "makita.com",
    website_url: "https://www.makita.com",
    country: "Japan",
    is_active: true,
  },
  {
    name: "Milwaukee",
    slug: "milwaukee",
    description: "Outillage electroportatif haute performance pour professionnels. Systeme M18 et M12 leader du marche. Innovation et durabilite americaine.",
    domain: "milwaukeetool.com",
    website_url: "https://www.milwaukeetool.com",
    country: "United States",
    is_active: true,
  },
  {
    name: "Hilti",
    slug: "hilti",
    description: "Solutions de fixation et outillage premium pour professionnels du batiment. Service et support technique d'excellence. Qualite suisse reconnue mondialement.",
    domain: "hilti.com",
    website_url: "https://www.hilti.com",
    country: "Liechtenstein",
    is_active: true,
  },
  {
    name: "Metabo",
    slug: "metabo",
    description: "Outillage electroportatif allemand pour l'industrie et l'artisanat. Specialiste des meuleuses et perceuses professionnelles depuis 1924.",
    domain: "metabo.com",
    website_url: "https://www.metabo.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Festool",
    slug: "festool",
    description: "Outillage electroportatif haut de gamme pour menuisiers et agenceurs. Systeme Systainer et aspiration integree. Excellence allemande pour artisans exigeants.",
    domain: "festool.com",
    website_url: "https://www.festool.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Ryobi",
    slug: "ryobi",
    description: "Outillage electroportatif accessible et polyvalent. Plateforme ONE+ compatible avec plus de 300 outils. Ideal pour artisans et bricoleurs avertis.",
    domain: "ryobitools.com",
    website_url: "https://www.ryobitools.com",
    country: "Japan",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // OUTILLAGE A MAIN (Hand Tools)
  // -------------------------------------------------------------------------
  {
    name: "Stanley",
    slug: "stanley",
    description: "Reference mondiale de l'outillage a main depuis 1843. Metres, cutters, niveaux et outils de mesure pour tous les corps de metiers.",
    domain: "stanleytools.com",
    website_url: "https://www.stanleytools.com",
    country: "United States",
    is_active: true,
  },
  {
    name: "Facom",
    slug: "facom",
    description: "Outillage a main professionnel francais depuis 1918. Cles, pinces, tournevis et rangements pour mecaniciens et techniciens. Excellence francaise.",
    domain: "facom.com",
    website_url: "https://www.facom.com",
    country: "France",
    is_active: true,
  },
  {
    name: "Bahco",
    slug: "bahco",
    description: "Outillage a main suedois de haute qualite. Scies, limes, cles ajustables et pinces pour professionnels. Innovation scandinave depuis 1886.",
    domain: "bahco.com",
    website_url: "https://www.bahco.com",
    country: "Sweden",
    is_active: true,
  },
  {
    name: "Knipex",
    slug: "knipex",
    description: "Specialiste allemand des pinces professionnelles. Reference mondiale pour electriciens, plombiers et mecaniciens. Precision et durabilite depuis 1882.",
    domain: "knipex.com",
    website_url: "https://www.knipex.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Wiha",
    slug: "wiha",
    description: "Outillage de precision allemand pour electriciens et techniciens. Tournevis, cles et outils VDE pour travaux sous tension. Qualite premium depuis 1939.",
    domain: "wiha.com",
    website_url: "https://www.wiha.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Beta Tools",
    slug: "beta-tools",
    description: "Outillage professionnel italien reconnu dans le sport automobile. Cles, douilles et servantes d'atelier. Design et robustesse italiens depuis 1923.",
    domain: "beta-tools.com",
    website_url: "https://www.beta-tools.com",
    country: "Italy",
    is_active: true,
  },
  {
    name: "Gedore",
    slug: "gedore",
    description: "Outillage a main industriel allemand depuis 1919. Cles dynamometriques, douilles et outils pour industrie automobile et aeronautique.",
    domain: "gedore.com",
    website_url: "https://www.gedore.com",
    country: "Germany",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // ELECTRICITE (Electrical Equipment)
  // -------------------------------------------------------------------------
  {
    name: "Schneider Electric",
    slug: "schneider-electric",
    description: "Leader mondial de la gestion de l'energie et des automatismes. Tableaux electriques, disjoncteurs et solutions domotiques. Innovation francaise depuis 1836.",
    domain: "se.com",
    website_url: "https://www.se.com",
    country: "France",
    is_active: true,
  },
  {
    name: "Legrand",
    slug: "legrand",
    description: "Specialiste mondial des infrastructures electriques et numeriques. Appareillage, VDI et chemins de cables. Excellence francaise depuis 1865.",
    domain: "legrand.com",
    website_url: "https://www.legrand.com",
    country: "France",
    is_active: true,
  },
  {
    name: "Hager",
    slug: "hager",
    description: "Solutions electriques pour batiments residentiels et tertiaires. Tableaux, disjoncteurs et gestion technique. Fiabilite allemande depuis 1955.",
    domain: "hager.com",
    website_url: "https://www.hager.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "ABB",
    slug: "abb",
    description: "Leader mondial de l'electrification et l'automatisation. Disjoncteurs, variateurs et solutions industrielles. Technologies suisso-suedoises innovantes.",
    domain: "abb.com",
    website_url: "https://www.abb.com",
    country: "Switzerland",
    is_active: true,
  },
  {
    name: "Siemens",
    slug: "siemens",
    description: "Geant allemand de l'electrotechnique et l'automatisation. Solutions pour industrie, energie et batiment. Innovation depuis 1847.",
    domain: "siemens.com",
    website_url: "https://www.siemens.com",
    country: "Germany",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // ECLAIRAGE (Lighting)
  // -------------------------------------------------------------------------
  {
    name: "Philips",
    slug: "philips",
    description: "Leader mondial de l'eclairage depuis 1891. Solutions LED professionnelles et connectees. Innovation hollandaise pour tous les secteurs.",
    domain: "philips.com",
    website_url: "https://www.philips.com",
    country: "Netherlands",
    is_active: true,
  },
  {
    name: "Osram",
    slug: "osram",
    description: "Specialiste allemand de l'eclairage depuis 1919. Lampes, LED et solutions d'eclairage intelligent pour industrie et batiment.",
    domain: "osram.com",
    website_url: "https://www.osram.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Ledvance",
    slug: "ledvance",
    description: "Expert en solutions LED pour professionnels. Lampes, luminaires et eclairage intelligent. Heritier de la tradition Osram.",
    domain: "ledvance.com",
    website_url: "https://www.ledvance.com",
    country: "Germany",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // PLOMBERIE (Plumbing)
  // -------------------------------------------------------------------------
  {
    name: "Grohe",
    slug: "grohe",
    description: "Leader europeen de la robinetterie sanitaire. Mitigeurs, colonnes de douche et systemes d'eau. Design et technologie allemands depuis 1936.",
    domain: "grohe.com",
    website_url: "https://www.grohe.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Hansgrohe",
    slug: "hansgrohe",
    description: "Specialiste allemand de la robinetterie haut de gamme. Solutions innovantes pour salle de bain et cuisine. Excellence depuis 1901.",
    domain: "hansgrohe.com",
    website_url: "https://www.hansgrohe.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Geberit",
    slug: "geberit",
    description: "Leader europeen des systemes sanitaires. Bati-supports, evacuations et robinetterie. Technologie suisse depuis 1874.",
    domain: "geberit.com",
    website_url: "https://www.geberit.com",
    country: "Switzerland",
    is_active: true,
  },
  {
    name: "Roca",
    slug: "roca",
    description: "Fabricant espagnol de sanitaires et robinetterie. WC, lavabos et solutions completes pour salle de bain. Design mediterraneen depuis 1917.",
    domain: "roca.com",
    website_url: "https://www.roca.com",
    country: "Spain",
    is_active: true,
  },
  {
    name: "Ideal Standard",
    slug: "ideal-standard",
    description: "Reference europeenne des sanitaires et robinetterie. Solutions completes pour salle de bain residentielles et collectivites.",
    domain: "idealstandard.com",
    website_url: "https://www.idealstandard.com",
    country: "Belgium",
    is_active: true,
  },
  {
    name: "Nicoll",
    slug: "nicoll",
    description: "Specialiste francais des systemes d'evacuation et ventilation. Tubes, raccords et siphons PVC. Expertise francaise depuis 1965.",
    domain: "nicoll.fr",
    website_url: "https://www.nicoll.fr",
    country: "France",
    is_active: true,
  },
  {
    name: "Watts",
    slug: "watts",
    description: "Solutions de gestion de l'eau et securite hydraulique. Disconnecteurs, detendeurs et traitement d'eau. Expertise americaine depuis 1874.",
    domain: "watts.com",
    website_url: "https://www.watts.com",
    country: "United States",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // CHAUFFAGE / CLIMATISATION (HVAC)
  // -------------------------------------------------------------------------
  {
    name: "Atlantic",
    slug: "atlantic",
    description: "Leader francais du chauffage et de la climatisation. Chauffe-eau, radiateurs et pompes a chaleur. Confort thermique depuis 1968.",
    domain: "atlantic.fr",
    website_url: "https://www.atlantic.fr",
    country: "France",
    is_active: true,
  },
  {
    name: "Thermor",
    slug: "thermor",
    description: "Specialiste francais du chauffage electrique et chauffe-eau. Solutions innovantes pour confort thermique domestique depuis 1931.",
    domain: "thermor.fr",
    website_url: "https://www.thermor.fr",
    country: "France",
    is_active: true,
  },
  {
    name: "Daikin",
    slug: "daikin",
    description: "Leader mondial de la climatisation et pompes a chaleur. Technologies inverter et solutions multi-split. Excellence japonaise depuis 1924.",
    domain: "daikin.com",
    website_url: "https://www.daikin.com",
    country: "Japan",
    is_active: true,
  },
  {
    name: "Mitsubishi Electric",
    slug: "mitsubishi-electric",
    description: "Geant japonais de la climatisation et ventilation. Systemes split, VRF et pompes a chaleur haute performance. Innovation depuis 1921.",
    domain: "mitsubishielectric.com",
    website_url: "https://www.mitsubishielectric.com",
    country: "Japan",
    is_active: true,
  },
  {
    name: "De Dietrich",
    slug: "de-dietrich",
    description: "Specialiste francais du chauffage depuis 1684. Chaudieres, pompes a chaleur et solutions hybrides. Savoir-faire francais seculaire.",
    domain: "dedietrich-thermique.fr",
    website_url: "https://www.dedietrich-thermique.fr",
    country: "France",
    is_active: true,
  },

  // -------------------------------------------------------------------------
  // QUINCAILLERIE (Hardware/Fasteners)
  // -------------------------------------------------------------------------
  {
    name: "Fischer",
    slug: "fischer",
    description: "Leader mondial des systemes de fixation. Chevilles, vis et solutions chimiques pour tous supports. Innovation allemande depuis 1948.",
    domain: "fischer.de",
    website_url: "https://www.fischer.de",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Wurth",
    slug: "wurth",
    description: "Geant mondial de la distribution de fixations et consommables. Plus de 125 000 references pour professionnels. Service allemand depuis 1945.",
    domain: "wurth.com",
    website_url: "https://www.wurth.com",
    country: "Germany",
    is_active: true,
  },
  {
    name: "Simpson Strong-Tie",
    slug: "simpson-strong-tie",
    description: "Specialiste des connecteurs structurels et fixations pour construction bois. Solutions parasismiques et structurelles. Expertise americaine depuis 1956.",
    domain: "strongtie.com",
    website_url: "https://www.strongtie.com",
    country: "United States",
    is_active: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates complete brand data with computed fields
 */
function generateBrandData(): MarqueDefinition[] {
  return B2B_BRANDS.map((brand, index) => ({
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logo_url: generateLogoUrl(brand.domain),
    website_url: brand.website_url,
    country: brand.country,
    is_active: brand.is_active,
    rank: (index + 1) * 10, // Use multiples of 10 for easy reordering
  }));
}

/**
 * Shuffles array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

/**
 * Main seed function for B2B industrial brands (marques)
 *
 * This function:
 * 1. Clears existing brands
 * 2. Creates 41 real B2B industrial brands
 * 3. Associates products with brands randomly using the product-marque link
 *
 * @param container - Medusa dependency container
 */
export default async function seedMarques({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

  logger.info("=".repeat(60));
  logger.info("Seed Marques (Brands) - B2B Industrial Distribution");
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
    logger.error("  2. Registered in medusa-config.js:");
    logger.error("     modules: [");
    logger.error('       { resolve: "./src/modules/marques" },');
    logger.error("     ]");
    logger.error("");
    throw new Error("Marques module not available. Please register it first.");
  }

  // -------------------------------------------------------------------------
  // Step 2: Clear existing brands
  // -------------------------------------------------------------------------
  logger.info("[1/4] Clearing existing brands...");

  try {
    const existingBrands = await marquesService.listMarques({});
    if (existingBrands.length > 0) {
      const brandIds = existingBrands.map((b) => b.id);
      await marquesService.deleteMarques(brandIds);
      logger.info(`   Deleted ${existingBrands.length} existing brands`);
    } else {
      logger.info("   No existing brands to delete");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`   Could not clear existing brands: ${message}`);
    logger.warn("   Continuing with brand creation...");
  }

  // -------------------------------------------------------------------------
  // Step 3: Create all brands
  // -------------------------------------------------------------------------
  logger.info("");
  logger.info("[2/4] Creating B2B industrial brands...");

  const brandData = generateBrandData();
  const createdBrands: MarqueDTO[] = [];

  try {
    // Create brands one by one to handle potential duplicates gracefully
    for (const brand of brandData) {
      try {
        const createInput: CreateMarqueInput = {
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          logo_url: brand.logo_url,
          website_url: brand.website_url,
          country: brand.country,
          is_active: brand.is_active,
          rank: brand.rank,
        };

        const created = await marquesService.createMarques(createInput);
        createdBrands.push(created as MarqueDTO);
        logger.info(`   Created: ${brand.name} (${brand.country})`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        // Skip if brand already exists (unique constraint)
        if (errMsg.includes("existe deja") || errMsg.includes("unique") || errMsg.includes("duplicate")) {
          logger.warn(`   Skipped (already exists): ${brand.name}`);
        } else {
          throw err;
        }
      }
    }

    logger.info("");
    logger.info(`   Total brands created: ${createdBrands.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`   Failed to create brands: ${message}`);
    throw error;
  }

  // -------------------------------------------------------------------------
  // Step 4: Get existing products
  // -------------------------------------------------------------------------
  logger.info("");
  logger.info("[3/4] Fetching existing products...");

  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  let products: Array<{ id: string; title: string }> = [];
  try {
    products = await productService.listProducts(
      {},
      { select: ["id", "title"] }
    );
    logger.info(`   Found ${products.length} products`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`   Failed to fetch products: ${message}`);
    throw error;
  }

  if (products.length === 0) {
    logger.warn("");
    logger.warn("   No products found. Skipping brand associations.");
    logger.warn("   Run the main seed script first to create products:");
    logger.warn("   pnpm seed");
    printSummary(logger, createdBrands, 0, 0, 0);
    return;
  }

  // -------------------------------------------------------------------------
  // Step 5: Associate products with brands using remote link
  // -------------------------------------------------------------------------
  logger.info("");
  logger.info("[4/4] Associating products with brands...");

  let associationCount = 0;
  let associationErrors = 0;

  // Get the remote link service
  let remoteLink: IRemoteLinkService | null = null;
  try {
    remoteLink = container.resolve<IRemoteLinkService>("remoteLink");
  } catch {
    logger.warn("   Remote link service not available.");
  }

  // Shuffle brands for random distribution
  const shuffledBrands = shuffleArray(createdBrands);

  if (remoteLink) {
    // Use remote link to create product-marque associations
    for (let i = 0; i < products.length; i++) {
      const product = products[i]!;
      const brand = shuffledBrands[i % shuffledBrands.length]!;

      try {
        await remoteLink.create({
          [Modules.PRODUCT]: { product_id: product.id },
          [MARQUES_MODULE]: { marque_id: brand.id },
        });
        associationCount++;

        if (associationCount % 10 === 0 || associationCount === products.length) {
          logger.info(`   Progress: ${associationCount}/${products.length} products associated`);
        }
      } catch (error) {
        associationErrors++;
        const message = error instanceof Error ? error.message : String(error);
        // Only log first few errors to avoid spam
        if (associationErrors <= 3) {
          logger.error(`   Failed to link "${product.title}" with "${brand.name}": ${message}`);
        }
      }
    }

    if (associationErrors > 3) {
      logger.error(`   ... and ${associationErrors - 3} more errors`);
    }
  } else {
    // Fallback: Store brand info in product metadata
    logger.info("   Using metadata fallback for associations...");

    for (let i = 0; i < products.length; i++) {
      const product = products[i]!;
      const brand = shuffledBrands[i % shuffledBrands.length]!;

      try {
        await productService.updateProducts(product.id, {
          metadata: {
            marque_id: brand.id,
            marque_name: brand.name,
            marque_slug: brand.slug,
          },
        });
        associationCount++;

        if (associationCount % 10 === 0 || associationCount === products.length) {
          logger.info(`   Progress: ${associationCount}/${products.length} products associated`);
        }
      } catch (error) {
        associationErrors++;
        const message = error instanceof Error ? error.message : String(error);
        if (associationErrors <= 3) {
          logger.error(`   Failed to update metadata for "${product.title}": ${message}`);
        }
      }
    }

    if (associationErrors > 3) {
      logger.error(`   ... and ${associationErrors - 3} more errors`);
    }
  }

  printSummary(logger, createdBrands, products.length, associationCount, associationErrors);
}

/**
 * Print final summary
 */
function printSummary(
  logger: Logger,
  createdBrands: MarqueDTO[],
  totalProducts: number,
  associationCount: number,
  associationErrors: number
): void {
  logger.info("");
  logger.info("=".repeat(60));
  logger.info("Brand Seed Summary");
  logger.info("=".repeat(60));
  logger.info("");
  logger.info(`Total brands created: ${createdBrands.length}`);
  logger.info("");
  logger.info("Brands by category:");
  logger.info("   - Outillage electroportatif: 8 brands");
  logger.info("   - Outillage a main: 7 brands");
  logger.info("   - Electricite: 5 brands");
  logger.info("   - Eclairage: 3 brands");
  logger.info("   - Plomberie: 7 brands");
  logger.info("   - Chauffage/Climatisation: 5 brands");
  logger.info("   - Quincaillerie: 3 brands");
  logger.info("");
  logger.info("Brands by country:");

  // Count by country from created brands
  const countryCount: Record<string, number> = {};
  for (const brand of createdBrands) {
    const country = brand.country || "Unknown";
    countryCount[country] = (countryCount[country] || 0) + 1;
  }
  for (const [country, count] of Object.entries(countryCount).sort((a, b) => b[1] - a[1])) {
    logger.info(`   - ${country}: ${count} brands`);
  }

  logger.info("");
  logger.info("Product associations:");
  logger.info(`   - Total products: ${totalProducts}`);
  logger.info(`   - Successfully associated: ${associationCount}`);
  if (associationErrors > 0) {
    logger.info(`   - Failed associations: ${associationErrors}`);
  }

  logger.info("");
  logger.info("Created brands:");
  for (const brand of createdBrands.slice(0, 15)) {
    logger.info(`   - ${brand.name} (${brand.slug})`);
  }
  if (createdBrands.length > 15) {
    logger.info(`   ... and ${createdBrands.length - 15} more`);
  }

  logger.info("");
  logger.info("=".repeat(60));
  logger.info("Brand seed completed successfully!");
  logger.info("=".repeat(60));
}
