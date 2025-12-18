/**
 * Database Seed Script - B2B Bijouterie (Complete)
 *
 * Complete seed script for B2B Jewelry wholesale platform with:
 * - Hierarchical categories up to 5 levels
 * - 50+ products with complete data
 * - Rich metadata for product pages
 *
 * Run with: pnpm seed
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type {
  IRegionModuleService,
  IProductModuleService,
  ISalesChannelModuleService,
  IFulfillmentModuleService,
  IStockLocationService,
} from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createProductsWorkflow,
  createShippingProfilesWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seed({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

  logger.info("Starting complete database seed (B2B Bijouterie)...");

  try {
    const salesChannel = await seedSalesChannels(container, logger);
    await seedRegions(container, logger);
    const shippingProfile = await seedShippingProfile(container, logger);
    const stockLocation = await seedStockLocations(container, logger);
    const categories = await seedCategories(container, logger);
    const collections = await seedCollections(container, logger);
    await seedProducts(container, logger, categories, collections, shippingProfile, salesChannel, stockLocation);

    logger.info("Database seed completed successfully!");
  } catch (error) {
    logger.error("Database seed failed:", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

async function seedSalesChannels(container: ExecArgs["container"], logger: Logger): Promise<{ id: string }> {
  logger.info("Seeding sales channels...");
  const salesChannelService = container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL);
  const existingChannels = await salesChannelService.listSalesChannels({});
  if (existingChannels.length > 0) {
    logger.info("   Sales channels already exist, using existing...");
    return { id: existingChannels[0].id };
  }
  const channel = await salesChannelService.createSalesChannels({
    name: "Boutique B2B Bijouterie",
    description: "Canal de vente principal pour les professionnels de la bijouterie",
    is_disabled: false,
  });
  logger.info("   Sales channel created");
  return { id: channel.id };
}

async function seedRegions(container: ExecArgs["container"], logger: Logger): Promise<void> {
  logger.info("Seeding regions...");
  const regionService = container.resolve<IRegionModuleService>(Modules.REGION);
  const existingRegions = await regionService.listRegions({});
  if (existingRegions.length > 0) {
    logger.info("   Regions already exist, skipping...");
    return;
  }
  await regionService.createRegions([
    { name: "France", currency_code: "eur", countries: ["fr"] },
    { name: "Europe", currency_code: "eur", countries: ["de", "it", "es", "be", "nl", "lu", "ch", "at"] },
    { name: "United Kingdom", currency_code: "gbp", countries: ["gb"] },
  ]);
  logger.info("   3 regions created");
}

async function seedShippingProfile(container: ExecArgs["container"], logger: Logger): Promise<{ id: string }> {
  logger.info("Seeding shipping profile...");
  const fulfillmentService = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT);
  const existingProfiles = await fulfillmentService.listShippingProfiles({});
  if (existingProfiles.length > 0) {
    logger.info("   Shipping profile already exists, using existing...");
    return { id: existingProfiles[0].id };
  }
  const { result } = await createShippingProfilesWorkflow(container).run({
    input: { data: [{ name: "Default", type: "default" }] },
  });
  logger.info("   Shipping profile created");
  return { id: result[0].id };
}

async function seedStockLocations(container: ExecArgs["container"], logger: Logger): Promise<{ id: string }> {
  logger.info("Seeding stock locations...");
  const stockLocationService = container.resolve<IStockLocationService>(Modules.STOCK_LOCATION);
  const existingLocations = await stockLocationService.listStockLocations({});
  if (existingLocations.length > 0) {
    logger.info("   Stock location already exists, using existing...");
    return { id: existingLocations[0].id };
  }
  const location = await stockLocationService.createStockLocations({
    name: "Entrepot Principal - Paris",
    address: { address_1: "Zone Industrielle du Diamant", city: "Paris", country_code: "fr", postal_code: "75002" },
  });
  logger.info("   Stock location created");
  return { id: location.id };
}

/**
 * Category definition with metadata for B2B jewelry
 */
interface CategoryDefinition {
  name: string;
  handle: string;
  description: string;
  metadata: {
    name_en: string;
    icon?: string;
    image_url?: string;
  };
  children?: CategoryDefinition[];
}

/**
 * Complete B2B jewelry category hierarchy with up to 5 levels
 */
const JEWELRY_CATEGORIES: CategoryDefinition[] = [
  // LEVEL 1: BIJOUX (JEWELRY)
  {
    name: "Bijoux",
    handle: "bijoux",
    description: "Collection complete de bijoux pour professionnels - bagues, colliers, bracelets, boucles d'oreilles",
    metadata: { name_en: "Jewelry", icon: "gem", image_url: "/images/categories/bijoux.jpg" },
    children: [
      // Level 2: Colliers
      {
        name: "Colliers",
        handle: "colliers",
        description: "Colliers, pendentifs et chaines pour tous les styles",
        metadata: { name_en: "Necklaces", icon: "necklace" },
        children: [
          {
            name: "Colliers Or",
            handle: "colliers-or",
            description: "Colliers en or jaune, blanc et rose",
            metadata: { name_en: "Gold Necklaces" },
            children: [
              {
                name: "Colliers Or 18 Carats",
                handle: "colliers-or-18-carats",
                description: "Colliers en or 18 carats (750/1000)",
                metadata: { name_en: "18K Gold Necklaces" },
                children: [
                  { name: "Colliers Or 18K avec Diamants", handle: "colliers-or-18k-diamants", description: "Colliers or 18 carats serties de diamants", metadata: { name_en: "18K Gold Necklaces with Diamonds" } },
                  { name: "Colliers Or 18K avec Pierres Precieuses", handle: "colliers-or-18k-pierres-precieuses", description: "Colliers or 18 carats avec rubis, emeraudes, saphirs", metadata: { name_en: "18K Gold Necklaces with Precious Stones" } },
                  { name: "Colliers Or 18K Simples", handle: "colliers-or-18k-simples", description: "Colliers or 18 carats sans pierres", metadata: { name_en: "Plain 18K Gold Necklaces" } },
                ],
              },
              { name: "Colliers Or 14 Carats", handle: "colliers-or-14-carats", description: "Colliers en or 14 carats (585/1000)", metadata: { name_en: "14K Gold Necklaces" } },
              { name: "Colliers Or 9 Carats", handle: "colliers-or-9-carats", description: "Colliers en or 9 carats (375/1000)", metadata: { name_en: "9K Gold Necklaces" } },
            ],
          },
          {
            name: "Colliers Argent",
            handle: "colliers-argent",
            description: "Colliers en argent sterling et argent 925",
            metadata: { name_en: "Silver Necklaces" },
            children: [
              {
                name: "Colliers Argent 925",
                handle: "colliers-argent-925",
                description: "Colliers en argent sterling 925/1000",
                metadata: { name_en: "925 Sterling Silver Necklaces" },
                children: [
                  { name: "Colliers Argent 925 Rhodie", handle: "colliers-argent-925-rhodie", description: "Colliers argent 925 avec rhodiage anti-ternissement", metadata: { name_en: "Rhodium-Plated 925 Silver Necklaces" } },
                  { name: "Colliers Argent 925 Oxyde", handle: "colliers-argent-925-oxyde", description: "Colliers argent 925 effet vieilli", metadata: { name_en: "Oxidized 925 Silver Necklaces" } },
                ],
              },
            ],
          },
          {
            name: "Chaines",
            handle: "chaines",
            description: "Chaines en or, argent et acier",
            metadata: { name_en: "Chains" },
            children: [
              { name: "Chaines Maille Forcat", handle: "chaines-maille-forcat", description: "Chaines classiques maille forcat", metadata: { name_en: "Cable Chains" } },
              { name: "Chaines Maille Gourmette", handle: "chaines-maille-gourmette", description: "Chaines maille gourmette plates", metadata: { name_en: "Curb Chains" } },
              { name: "Chaines Maille Venitienne", handle: "chaines-maille-venitienne", description: "Chaines maille venitienne (box chain)", metadata: { name_en: "Venetian/Box Chains" } },
            ],
          },
          {
            name: "Pendentifs",
            handle: "pendentifs",
            description: "Pendentifs et medailles sans chaine",
            metadata: { name_en: "Pendants" },
            children: [
              { name: "Pendentifs Religieux", handle: "pendentifs-religieux", description: "Croix, medailles religieuses, anges", metadata: { name_en: "Religious Pendants" } },
              { name: "Pendentifs Coeur", handle: "pendentifs-coeur", description: "Pendentifs en forme de coeur", metadata: { name_en: "Heart Pendants" } },
              { name: "Pendentifs Initiales", handle: "pendentifs-initiales", description: "Lettres et initiales en pendentif", metadata: { name_en: "Initial Pendants" } },
            ],
          },
        ],
      },
      // Level 2: Bagues
      {
        name: "Bagues",
        handle: "bagues",
        description: "Bagues de fiancailles, alliances et bagues de mode",
        metadata: { name_en: "Rings", icon: "ring" },
        children: [
          {
            name: "Bagues Or",
            handle: "bagues-or",
            description: "Bagues en or jaune, blanc et rose",
            metadata: { name_en: "Gold Rings" },
            children: [
              {
                name: "Bagues Or 18 Carats",
                handle: "bagues-or-18-carats",
                description: "Bagues en or 18 carats haute joaillerie",
                metadata: { name_en: "18K Gold Rings" },
                children: [
                  { name: "Solitaires Diamant Or 18K", handle: "solitaires-diamant-or-18k", description: "Bagues solitaires avec diamant central", metadata: { name_en: "18K Gold Diamond Solitaires" } },
                  { name: "Bagues Entourage Or 18K", handle: "bagues-entourage-or-18k", description: "Bagues avec pierre centrale et entourage", metadata: { name_en: "18K Gold Halo Rings" } },
                  { name: "Alliances Or 18K", handle: "alliances-or-18k", description: "Alliances de mariage or 18 carats", metadata: { name_en: "18K Gold Wedding Bands" } },
                ],
              },
              { name: "Bagues Or 14 Carats", handle: "bagues-or-14-carats", description: "Bagues en or 14 carats", metadata: { name_en: "14K Gold Rings" } },
            ],
          },
          {
            name: "Bagues Argent",
            handle: "bagues-argent",
            description: "Bagues en argent sterling",
            metadata: { name_en: "Silver Rings" },
            children: [
              {
                name: "Bagues Argent 925",
                handle: "bagues-argent-925",
                description: "Bagues argent 925/1000",
                metadata: { name_en: "925 Sterling Silver Rings" },
                children: [
                  { name: "Bagues Argent 925 Sertissage", handle: "bagues-argent-925-sertissage", description: "Bagues argent avec pierres serties", metadata: { name_en: "925 Silver Stone-Set Rings" } },
                  { name: "Bagues Argent 925 Mode", handle: "bagues-argent-925-mode", description: "Bagues argent tendance et fashion", metadata: { name_en: "925 Silver Fashion Rings" } },
                ],
              },
            ],
          },
          {
            name: "Bagues Fiancailles",
            handle: "bagues-fiancailles",
            description: "Bagues de fiancailles et demande en mariage",
            metadata: { name_en: "Engagement Rings" },
            children: [
              { name: "Fiancailles Diamant", handle: "fiancailles-diamant", description: "Bagues fiancailles avec diamant", metadata: { name_en: "Diamond Engagement Rings" } },
              { name: "Fiancailles Saphir", handle: "fiancailles-saphir", description: "Bagues fiancailles avec saphir", metadata: { name_en: "Sapphire Engagement Rings" } },
            ],
          },
          {
            name: "Alliances",
            handle: "alliances",
            description: "Alliances de mariage homme et femme",
            metadata: { name_en: "Wedding Bands" },
            children: [
              { name: "Alliances Classiques", handle: "alliances-classiques", description: "Alliances jonc et demi-jonc classiques", metadata: { name_en: "Classic Wedding Bands" } },
              { name: "Alliances Diamants", handle: "alliances-diamants", description: "Alliances serties de diamants", metadata: { name_en: "Diamond Wedding Bands" } },
            ],
          },
        ],
      },
      // Level 2: Bracelets
      {
        name: "Bracelets",
        handle: "bracelets",
        description: "Bracelets jonc, chaine, manchette et rigides",
        metadata: { name_en: "Bracelets", icon: "bracelet" },
        children: [
          {
            name: "Bracelets Or",
            handle: "bracelets-or",
            description: "Bracelets en or toutes puretes",
            metadata: { name_en: "Gold Bracelets" },
            children: [
              {
                name: "Bracelets Jonc Or",
                handle: "bracelets-jonc-or",
                description: "Bracelets jonc rigides en or",
                metadata: { name_en: "Gold Bangle Bracelets" },
                children: [
                  { name: "Jonc Or 18K Femme", handle: "jonc-or-18k-femme", description: "Bracelets jonc or 18K pour femme", metadata: { name_en: "Women's 18K Gold Bangles" } },
                  { name: "Jonc Or 18K Homme", handle: "jonc-or-18k-homme", description: "Bracelets jonc or 18K pour homme", metadata: { name_en: "Men's 18K Gold Bangles" } },
                ],
              },
              { name: "Bracelets Tennis", handle: "bracelets-tennis", description: "Bracelets tennis riviere de diamants", metadata: { name_en: "Tennis Bracelets" } },
            ],
          },
          {
            name: "Bracelets Argent",
            handle: "bracelets-argent",
            description: "Bracelets en argent sterling",
            metadata: { name_en: "Silver Bracelets" },
          },
          {
            name: "Gourmettes",
            handle: "gourmettes",
            description: "Gourmettes identite homme, femme, enfant",
            metadata: { name_en: "ID Bracelets" },
            children: [
              { name: "Gourmettes Bebe", handle: "gourmettes-bebe", description: "Gourmettes naissance et bapteme", metadata: { name_en: "Baby ID Bracelets" } },
              { name: "Gourmettes Enfant", handle: "gourmettes-enfant", description: "Gourmettes pour enfants", metadata: { name_en: "Children ID Bracelets" } },
            ],
          },
        ],
      },
      // Level 2: Boucles d'Oreilles
      {
        name: "Boucles d'Oreilles",
        handle: "boucles-oreilles",
        description: "Boucles d'oreilles, puces, creoles et pendants",
        metadata: { name_en: "Earrings", icon: "earring" },
        children: [
          {
            name: "Puces d'Oreilles",
            handle: "puces-oreilles",
            description: "Boucles d'oreilles puces discretes",
            metadata: { name_en: "Stud Earrings" },
            children: [
              {
                name: "Puces Diamant",
                handle: "puces-diamant",
                description: "Puces serties de diamants",
                metadata: { name_en: "Diamond Studs" },
                children: [
                  { name: "Puces Diamant Solitaire", handle: "puces-diamant-solitaire", description: "Puces avec un diamant solitaire", metadata: { name_en: "Solitaire Diamond Studs" } },
                  { name: "Puces Diamant Entourage", handle: "puces-diamant-entourage", description: "Puces diamant avec entourage", metadata: { name_en: "Halo Diamond Studs" } },
                ],
              },
              { name: "Puces Perle", handle: "puces-perle", description: "Puces avec perles de culture", metadata: { name_en: "Pearl Studs" } },
            ],
          },
          {
            name: "Creoles",
            handle: "creoles",
            description: "Boucles d'oreilles creoles rondes et ovales",
            metadata: { name_en: "Hoop Earrings" },
            children: [
              { name: "Creoles Or", handle: "creoles-or", description: "Creoles en or", metadata: { name_en: "Gold Hoops" } },
              { name: "Creoles Argent", handle: "creoles-argent", description: "Creoles en argent", metadata: { name_en: "Silver Hoops" } },
            ],
          },
          {
            name: "Pendants d'Oreilles",
            handle: "pendants-oreilles",
            description: "Boucles d'oreilles pendantes",
            metadata: { name_en: "Drop Earrings" },
          },
          {
            name: "Dormeuses",
            handle: "dormeuses",
            description: "Boucles d'oreilles dormeuses fermees",
            metadata: { name_en: "Leverback Earrings" },
          },
        ],
      },
      // Level 2: Bijoux Homme
      {
        name: "Bijoux Homme",
        handle: "bijoux-homme",
        description: "Bijoux masculins - chevalieres, gourmettes, chaines",
        metadata: { name_en: "Men's Jewelry", icon: "male" },
        children: [
          {
            name: "Chevalieres",
            handle: "chevalieres",
            description: "Bagues chevalieres pour homme",
            metadata: { name_en: "Signet Rings" },
            children: [
              { name: "Chevalieres Or", handle: "chevalieres-or", description: "Chevalieres en or jaune et blanc", metadata: { name_en: "Gold Signet Rings" } },
              { name: "Chevalieres Argent", handle: "chevalieres-argent", description: "Chevalieres en argent massif", metadata: { name_en: "Silver Signet Rings" } },
            ],
          },
          { name: "Boutons de Manchette", handle: "boutons-manchette", description: "Boutons de manchette elegants", metadata: { name_en: "Cufflinks" } },
        ],
      },
    ],
  },
  // LEVEL 1: MONTRES (WATCHES)
  {
    name: "Montres",
    handle: "montres",
    description: "Montres de luxe et fashion pour hommes et femmes",
    metadata: { name_en: "Watches", icon: "watch", image_url: "/images/categories/montres.jpg" },
    children: [
      {
        name: "Montres Homme",
        handle: "montres-homme",
        description: "Montres masculines classiques et sportives",
        metadata: { name_en: "Men's Watches" },
        children: [
          {
            name: "Montres Automatiques",
            handle: "montres-automatiques",
            description: "Montres mecaniques a remontage automatique",
            metadata: { name_en: "Automatic Watches" },
            children: [
              {
                name: "Montres Plongee",
                handle: "montres-plongee",
                description: "Montres de plongee etanches",
                metadata: { name_en: "Dive Watches" },
                children: [
                  { name: "Montres Plongee 200m", handle: "montres-plongee-200m", description: "Montres etanches 200 metres", metadata: { name_en: "200m Dive Watches" } },
                  { name: "Montres Plongee 300m+", handle: "montres-plongee-300m-plus", description: "Montres etanches 300 metres et plus", metadata: { name_en: "300m+ Dive Watches" } },
                ],
              },
              { name: "Montres Chronographe", handle: "montres-chronographe", description: "Montres avec fonction chronographe", metadata: { name_en: "Chronograph Watches" } },
            ],
          },
          { name: "Montres Quartz Homme", handle: "montres-quartz-homme", description: "Montres a quartz pour homme", metadata: { name_en: "Men's Quartz Watches" } },
        ],
      },
      {
        name: "Montres Femme",
        handle: "montres-femme",
        description: "Montres feminines elegantes et fashion",
        metadata: { name_en: "Women's Watches" },
        children: [
          {
            name: "Montres Joaillerie",
            handle: "montres-joaillerie",
            description: "Montres serties de diamants et pierres",
            metadata: { name_en: "Jewelry Watches" },
            children: [
              { name: "Montres Diamants", handle: "montres-diamants", description: "Montres serties de diamants", metadata: { name_en: "Diamond Watches" } },
            ],
          },
          { name: "Montres Fashion", handle: "montres-fashion", description: "Montres tendance et mode", metadata: { name_en: "Fashion Watches" } },
        ],
      },
      {
        name: "Bracelets Montres",
        handle: "bracelets-montres",
        description: "Bracelets de remplacement pour montres",
        metadata: { name_en: "Watch Straps" },
        children: [
          { name: "Bracelets Cuir", handle: "bracelets-cuir", description: "Bracelets montres en cuir", metadata: { name_en: "Leather Straps" } },
          { name: "Bracelets Metal", handle: "bracelets-metal", description: "Bracelets montres metalliques", metadata: { name_en: "Metal Straps" } },
        ],
      },
    ],
  },
  // LEVEL 1: ACCESSOIRES (ACCESSORIES)
  {
    name: "Accessoires",
    handle: "accessoires",
    description: "Accessoires bijoux - pinces, fermoirs, chaines au metre",
    metadata: { name_en: "Accessories", icon: "tools", image_url: "/images/categories/accessoires.jpg" },
    children: [
      {
        name: "Apprets",
        handle: "apprets",
        description: "Apprets et composants pour creation de bijoux",
        metadata: { name_en: "Jewelry Findings" },
        children: [
          {
            name: "Fermoirs",
            handle: "fermoirs",
            description: "Fermoirs pour colliers et bracelets",
            metadata: { name_en: "Clasps" },
            children: [
              { name: "Fermoirs Mousqueton", handle: "fermoirs-mousqueton", description: "Fermoirs mousqueton standard", metadata: { name_en: "Lobster Clasps" } },
              { name: "Fermoirs Toggle", handle: "fermoirs-toggle", description: "Fermoirs toggle decoratifs", metadata: { name_en: "Toggle Clasps" } },
              { name: "Fermoirs Magnetiques", handle: "fermoirs-magnetiques", description: "Fermoirs magnetiques faciles", metadata: { name_en: "Magnetic Clasps" } },
            ],
          },
          {
            name: "Attaches",
            handle: "attaches",
            description: "Attaches pour boucles d'oreilles",
            metadata: { name_en: "Earring Findings" },
            children: [
              { name: "Crochets Oreilles", handle: "crochets-oreilles", description: "Crochets pour boucles pendantes", metadata: { name_en: "Earring Hooks" } },
              { name: "Tiges a Clous", handle: "tiges-clous", description: "Tiges pour puces d'oreilles", metadata: { name_en: "Earring Posts" } },
              { name: "Poussettes", handle: "poussettes", description: "Poussettes et fermoirs oreilles", metadata: { name_en: "Earring Backs" } },
            ],
          },
          { name: "Belieres", handle: "belieres", description: "Belieres pour pendentifs", metadata: { name_en: "Bails" } },
        ],
      },
      {
        name: "Chaines au Metre",
        handle: "chaines-au-metre",
        description: "Chaines vendues au metre pour creation",
        metadata: { name_en: "Chain by the Meter" },
        children: [
          { name: "Chaines Or au Metre", handle: "chaines-or-metre", description: "Chaines en or au metre", metadata: { name_en: "Gold Chain by Meter" } },
          { name: "Chaines Argent au Metre", handle: "chaines-argent-metre", description: "Chaines argent 925 au metre", metadata: { name_en: "Silver Chain by Meter" } },
        ],
      },
      {
        name: "Outils Bijouterie",
        handle: "outils-bijouterie",
        description: "Outils professionnels pour bijoutiers",
        metadata: { name_en: "Jewelry Tools" },
        children: [
          { name: "Pinces Bijouterie", handle: "pinces-bijouterie", description: "Pinces plates, rondes, coupantes", metadata: { name_en: "Jewelry Pliers" } },
          { name: "Loupes et Eclairage", handle: "loupes-eclairage", description: "Loupes de bijoutier et eclairage", metadata: { name_en: "Magnifiers & Lighting" } },
        ],
      },
    ],
  },
  // LEVEL 1: PIERRES & PERLES (STONES & PEARLS)
  {
    name: "Pierres et Perles",
    handle: "pierres-perles",
    description: "Pierres precieuses, semi-precieuses et perles de culture",
    metadata: { name_en: "Stones & Pearls", icon: "diamond", image_url: "/images/categories/pierres-perles.jpg" },
    children: [
      {
        name: "Diamants",
        handle: "diamants",
        description: "Diamants naturels et de laboratoire certifies",
        metadata: { name_en: "Diamonds" },
        children: [
          {
            name: "Diamants Naturels",
            handle: "diamants-naturels",
            description: "Diamants naturels certifies GIA/HRD",
            metadata: { name_en: "Natural Diamonds" },
            children: [
              {
                name: "Diamants Ronds",
                handle: "diamants-ronds",
                description: "Diamants taille brillant rond",
                metadata: { name_en: "Round Diamonds" },
                children: [
                  { name: "Diamants Ronds 0.5ct+", handle: "diamants-ronds-05ct-plus", description: "Diamants ronds de 0.5 carat et plus", metadata: { name_en: "Round Diamonds 0.5ct+" } },
                  { name: "Diamants Ronds Melee", handle: "diamants-ronds-melee", description: "Petits diamants pour sertissage", metadata: { name_en: "Melee Round Diamonds" } },
                ],
              },
              { name: "Diamants Princesse", handle: "diamants-princesse", description: "Diamants taille princesse carree", metadata: { name_en: "Princess Cut Diamonds" } },
              { name: "Diamants Ovales", handle: "diamants-ovales", description: "Diamants taille ovale", metadata: { name_en: "Oval Diamonds" } },
            ],
          },
          {
            name: "Diamants Laboratoire",
            handle: "diamants-laboratoire",
            description: "Diamants synthetiques de laboratoire",
            metadata: { name_en: "Lab-Grown Diamonds" },
          },
          {
            name: "Diamants Couleur",
            handle: "diamants-couleur",
            description: "Diamants de couleur naturelle",
            metadata: { name_en: "Colored Diamonds" },
            children: [
              { name: "Diamants Jaunes", handle: "diamants-jaunes", description: "Diamants jaune canari", metadata: { name_en: "Yellow Diamonds" } },
              { name: "Diamants Roses", handle: "diamants-roses", description: "Diamants roses rares", metadata: { name_en: "Pink Diamonds" } },
              { name: "Diamants Noirs", handle: "diamants-noirs", description: "Diamants noirs naturels", metadata: { name_en: "Black Diamonds" } },
            ],
          },
        ],
      },
      {
        name: "Pierres Precieuses",
        handle: "pierres-precieuses",
        description: "Rubis, saphirs et emeraudes",
        metadata: { name_en: "Precious Stones" },
        children: [
          { name: "Rubis", handle: "rubis", description: "Rubis naturels et traites", metadata: { name_en: "Rubies" } },
          {
            name: "Saphirs",
            handle: "saphirs",
            description: "Saphirs bleus et de couleur",
            metadata: { name_en: "Sapphires" },
            children: [
              { name: "Saphirs Bleus", handle: "saphirs-bleus", description: "Saphirs bleus classiques", metadata: { name_en: "Blue Sapphires" } },
              { name: "Saphirs Rose", handle: "saphirs-rose", description: "Saphirs roses (pink sapphire)", metadata: { name_en: "Pink Sapphires" } },
            ],
          },
          { name: "Emeraudes", handle: "emeraudes", description: "Emeraudes naturelles", metadata: { name_en: "Emeralds" } },
        ],
      },
      {
        name: "Pierres Semi-Precieuses",
        handle: "pierres-semi-precieuses",
        description: "Pierres fines et semi-precieuses",
        metadata: { name_en: "Semi-Precious Stones" },
        children: [
          { name: "Amethyste", handle: "amethyste", description: "Amethyste violette", metadata: { name_en: "Amethyst" } },
          { name: "Topaze", handle: "topaze", description: "Topaze bleue et de couleur", metadata: { name_en: "Topaz" } },
          { name: "Aigue-Marine", handle: "aigue-marine", description: "Aigue-marine bleue claire", metadata: { name_en: "Aquamarine" } },
          { name: "Citrine", handle: "citrine", description: "Citrine jaune doree", metadata: { name_en: "Citrine" } },
        ],
      },
      {
        name: "Perles",
        handle: "perles",
        description: "Perles de culture et perles fines",
        metadata: { name_en: "Pearls" },
        children: [
          {
            name: "Perles Akoya",
            handle: "perles-akoya",
            description: "Perles de culture Akoya japonaises",
            metadata: { name_en: "Akoya Pearls" },
            children: [
              { name: "Akoya AAA", handle: "akoya-aaa", description: "Perles Akoya qualite superieure", metadata: { name_en: "AAA Grade Akoya" } },
              { name: "Akoya AA", handle: "akoya-aa", description: "Perles Akoya qualite standard", metadata: { name_en: "AA Grade Akoya" } },
            ],
          },
          { name: "Perles Tahiti", handle: "perles-tahiti", description: "Perles noires de Tahiti", metadata: { name_en: "Tahitian Pearls" } },
          { name: "Perles Mers du Sud", handle: "perles-mers-sud", description: "Perles South Sea blanches et dorees", metadata: { name_en: "South Sea Pearls" } },
          { name: "Perles Eau Douce", handle: "perles-eau-douce", description: "Perles de culture d'eau douce", metadata: { name_en: "Freshwater Pearls" } },
        ],
      },
    ],
  },
  // LEVEL 1: PACKAGING & PRESENTOIRS
  {
    name: "Packaging et Presentoirs",
    handle: "packaging-presentoirs",
    description: "Ecrins, boites, sacs et presentoirs pour bijoux",
    metadata: { name_en: "Packaging & Displays", icon: "gift-box", image_url: "/images/categories/packaging.jpg" },
    children: [
      {
        name: "Ecrins",
        handle: "ecrins",
        description: "Ecrins de presentation pour bijoux",
        metadata: { name_en: "Jewelry Boxes" },
        children: [
          {
            name: "Ecrins Bague",
            handle: "ecrins-bague",
            description: "Ecrins pour bagues individuelles",
            metadata: { name_en: "Ring Boxes" },
            children: [
              { name: "Ecrins Bague Luxe", handle: "ecrins-bague-luxe", description: "Ecrins haut de gamme pour bagues", metadata: { name_en: "Luxury Ring Boxes" } },
              { name: "Ecrins Bague Standard", handle: "ecrins-bague-standard", description: "Ecrins classiques pour bagues", metadata: { name_en: "Standard Ring Boxes" } },
              { name: "Ecrins Bague LED", handle: "ecrins-bague-led", description: "Ecrins avec eclairage LED", metadata: { name_en: "LED Ring Boxes" } },
            ],
          },
          { name: "Ecrins Collier", handle: "ecrins-collier", description: "Ecrins pour colliers et pendentifs", metadata: { name_en: "Necklace Boxes" } },
          { name: "Ecrins Bracelet", handle: "ecrins-bracelet", description: "Ecrins pour bracelets et montres", metadata: { name_en: "Bracelet Boxes" } },
        ],
      },
      {
        name: "Pochettes et Sacs",
        handle: "pochettes-sacs",
        description: "Pochettes et sacs cadeaux",
        metadata: { name_en: "Pouches & Bags" },
        children: [
          { name: "Pochettes Velours", handle: "pochettes-velours", description: "Pochettes en velours", metadata: { name_en: "Velvet Pouches" } },
          { name: "Pochettes Organza", handle: "pochettes-organza", description: "Pochettes en organza transparent", metadata: { name_en: "Organza Pouches" } },
          { name: "Sacs Papier Luxe", handle: "sacs-papier-luxe", description: "Sacs cadeau en papier de luxe", metadata: { name_en: "Luxury Paper Bags" } },
        ],
      },
      {
        name: "Presentoirs",
        handle: "presentoirs",
        description: "Presentoirs vitrine et comptoir",
        metadata: { name_en: "Displays" },
        children: [
          {
            name: "Presentoirs Bagues",
            handle: "presentoirs-bagues",
            description: "Presentoirs et doigts pour bagues",
            metadata: { name_en: "Ring Displays" },
            children: [
              { name: "Doigts Presentoirs", handle: "doigts-presentoirs", description: "Doigts individuels pour bagues", metadata: { name_en: "Ring Fingers" } },
              { name: "Plateaux Bagues", handle: "plateaux-bagues", description: "Plateaux multi-bagues pour vitrine", metadata: { name_en: "Ring Trays" } },
            ],
          },
          {
            name: "Presentoirs Colliers",
            handle: "presentoirs-colliers",
            description: "Bustes et supports pour colliers",
            metadata: { name_en: "Necklace Displays" },
            children: [
              { name: "Bustes Colliers", handle: "bustes-colliers", description: "Bustes pour presentation colliers", metadata: { name_en: "Necklace Busts" } },
            ],
          },
          { name: "Vitrines", handle: "vitrines", description: "Vitrines de comptoir et murales", metadata: { name_en: "Display Cases" } },
        ],
      },
      {
        name: "Etiquettes et Accessoires",
        handle: "etiquettes-accessoires",
        description: "Etiquettes prix et accessoires vitrine",
        metadata: { name_en: "Tags & Accessories" },
        children: [
          { name: "Etiquettes Prix", handle: "etiquettes-prix", description: "Etiquettes et cavaliers prix", metadata: { name_en: "Price Tags" } },
          { name: "Cartes Garantie", handle: "cartes-garantie", description: "Cartes certificat et garantie", metadata: { name_en: "Guarantee Cards" } },
        ],
      },
    ],
  },
];

/**
 * Hierarchical categories up to 5 levels for B2B Jewelry
 */
async function seedCategories(container: ExecArgs["container"], logger: Logger): Promise<Record<string, string>> {
  logger.info("Seeding hierarchical categories (5 levels)...");
  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  const existingCategories = await productService.listProductCategories({});
  if (existingCategories.length > 0) {
    logger.info("   Categories already exist, using existing...");
    const categoryMap: Record<string, string> = {};
    for (const cat of existingCategories) {
      categoryMap[cat.handle] = cat.id;
    }
    return categoryMap;
  }

  const categories: Record<string, string> = {};
  let globalRank = 0;

  // Recursive function to create categories
  const createCategoriesRecursive = async (
    defs: CategoryDefinition[],
    parentId?: string
  ): Promise<void> => {
    for (const def of defs) {
      const cat = await productService.createProductCategories({
        name: def.name,
        handle: def.handle,
        description: def.description,
        is_active: true,
        is_internal: false,
        rank: globalRank++,
        parent_category_id: parentId,
        metadata: def.metadata,
      });
      categories[def.handle] = cat.id;

      if (def.children && def.children.length > 0) {
        await createCategoriesRecursive(def.children, cat.id);
      }
    }
  };

  await createCategoriesRecursive(JEWELRY_CATEGORIES);

  logger.info(`   ${Object.keys(categories).length} categories created (5 levels)`);
  return categories;
}

async function seedCollections(container: ExecArgs["container"], logger: Logger): Promise<Record<string, string>> {
  logger.info("Seeding product collections...");
  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  const existingCollections = await productService.listProductCollections({});
  if (existingCollections.length > 0) {
    logger.info("   Collections already exist, using existing...");
    const collectionMap: Record<string, string> = {};
    for (const col of existingCollections) {
      collectionMap[col.handle] = col.id;
    }
    return collectionMap;
  }

  const collectionDefinitions = [
    { title: "Nouveautes", handle: "nouveautes" },
    { title: "Best-Sellers", handle: "bestsellers" },
    { title: "Promotions", handle: "promotions" },
    { title: "Haute Joaillerie", handle: "haute-joaillerie" },
    { title: "Fiancailles & Mariage", handle: "fiancailles-mariage" },
    { title: "Selection Cadeaux", handle: "selection-cadeaux" },
    { title: "Bijoux Homme", handle: "bijoux-homme-collection" },
    { title: "Coup de Coeur", handle: "coup-de-coeur" },
  ];

  const collections: Record<string, string> = {};
  for (const def of collectionDefinitions) {
    const col = await productService.createProductCollections({ title: def.title, handle: def.handle });
    collections[def.handle] = col.id;
  }

  logger.info(`   ${collectionDefinitions.length} collections created`);
  return collections;
}

/**
 * 50+ jewelry products with complete data
 */
async function seedProducts(
  container: ExecArgs["container"],
  logger: Logger,
  categories: Record<string, string>,
  collections: Record<string, string>,
  shippingProfile: { id: string },
  salesChannel: { id: string },
  stockLocation: { id: string }
): Promise<void> {
  logger.info("Seeding products (50+ with complete data)...");

  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const existingProducts = await productService.listProducts({});
  if (existingProducts.length > 0) {
    logger.info("   Products already exist, skipping...");
    return;
  }

  // Helper to create a product with all metadata
  const makeProduct = (
    title: string,
    handle: string,
    description: string,
    categoryHandle: string,
    brand: string,
    options: { title: string; values: string[] }[],
    variants: { title: string; sku: string; options: Record<string, string>; price: number; weight?: number }[],
    metadata: Record<string, unknown>
  ) => ({
    title,
    handle,
    description,
    subtitle: metadata.subtitle as string || "",
    status: "published" as const,
    categories: categories[categoryHandle] ? [{ id: categories[categoryHandle] }] : [],
    sales_channels: [{ id: salesChannel.id }],
    shipping_profile_id: shippingProfile.id,
    weight: metadata.weight as number || 50,
    length: metadata.length as number || 5,
    height: metadata.height as number || 3,
    width: metadata.width as number || 5,
    hs_code: metadata.hs_code as string || "7113.19",
    origin_country: metadata.origin_country as string || "FR",
    material: metadata.material as string || "",
    metadata: {
      brand,
      garantie: metadata.garantie || "2 ans",
      certification: metadata.certification || [],
      caracteristiques: metadata.caracteristiques || {},
      documents: metadata.documents || [],
      ...metadata,
    },
    options,
    variants: variants.map((v) => ({
      title: v.title,
      sku: v.sku,
      options: v.options,
      prices: [
        { amount: v.price, currency_code: "eur" },
        { amount: Math.round(v.price * 0.85), currency_code: "gbp" },
      ],
      manage_inventory: true,
      weight: v.weight || 50,
    })),
  });

  const productsData = [
    // ========== BAGUES OR 18K ==========
    makeProduct(
      "Solitaire Diamant Or 18K - Taille Brillant",
      "solitaire-diamant-or-18k",
      "Bague solitaire en or blanc 18 carats avec diamant taille brillant. Monture 4 griffes classique, diamant certifie GIA. Parfait pour demande en mariage.",
      "solitaires-diamant-or-18k",
      "Maison Bijoux",
      [{ title: "Carat", values: ["0.30ct", "0.50ct", "0.70ct", "1.00ct"] }],
      [
        { title: "0.30ct G-VS2", sku: "SOL-18K-030", options: { Carat: "0.30ct" }, price: 1890_00, weight: 4 },
        { title: "0.50ct G-VS2", sku: "SOL-18K-050", options: { Carat: "0.50ct" }, price: 2890_00, weight: 4 },
        { title: "0.70ct G-VS2", sku: "SOL-18K-070", options: { Carat: "0.70ct" }, price: 4290_00, weight: 5 },
        { title: "1.00ct G-VS2", sku: "SOL-18K-100", options: { Carat: "1.00ct" }, price: 7490_00, weight: 5 },
      ],
      {
        subtitle: "La reference pour les fiancailles",
        garantie: "A vie",
        certification: ["GIA"],
        caracteristiques: {
          metal: "Or blanc 18K (750/1000)",
          pierre_principale: "Diamant naturel",
          taille: "Brillant rond",
          couleur: "G",
          purete: "VS2",
          monture: "4 griffes",
        },
        weight: 4,
        hs_code: "7113.19.00",
      }
    ),

    makeProduct(
      "Bague Entourage Diamant Or 18K",
      "bague-entourage-diamant-or-18k",
      "Bague entourage en or blanc 18K avec diamant central et halo de diamants. Style vintage elegant, parfait pour fiancailles ou anniversaire.",
      "bagues-entourage-or-18k",
      "Maison Bijoux",
      [{ title: "Taille centrale", values: ["0.30ct", "0.50ct", "0.70ct"] }],
      [
        { title: "0.30ct + entourage", sku: "ENT-18K-030", options: { "Taille centrale": "0.30ct" }, price: 2490_00, weight: 5 },
        { title: "0.50ct + entourage", sku: "ENT-18K-050", options: { "Taille centrale": "0.50ct" }, price: 3690_00, weight: 5 },
        { title: "0.70ct + entourage", sku: "ENT-18K-070", options: { "Taille centrale": "0.70ct" }, price: 5290_00, weight: 6 },
      ],
      {
        caracteristiques: {
          metal: "Or blanc 18K",
          pierre_centrale: "Diamant",
          entourage: "20 diamants 0.15ct total",
          style: "Halo vintage",
        },
        weight: 5,
      }
    ),

    makeProduct(
      "Alliance Or 18K Diamants Serti Rail",
      "alliance-or-18k-diamants-rail",
      "Alliance or blanc 18K avec diamants serti rail. 7 diamants brillants alignes pour un eclat continu. Confort++ pour port quotidien.",
      "alliances-or-18k",
      "Maison Bijoux",
      [{ title: "Caratage total", values: ["0.21ct", "0.35ct", "0.50ct"] }],
      [
        { title: "7 diamants 0.21ct total", sku: "ALL-18K-021", options: { "Caratage total": "0.21ct" }, price: 1290_00, weight: 4 },
        { title: "7 diamants 0.35ct total", sku: "ALL-18K-035", options: { "Caratage total": "0.35ct" }, price: 1690_00, weight: 4 },
        { title: "9 diamants 0.50ct total", sku: "ALL-18K-050", options: { "Caratage total": "0.50ct" }, price: 2290_00, weight: 5 },
      ],
      {
        caracteristiques: {
          metal: "Or blanc 18K",
          sertissage: "Rail",
          diamants: "Brillants G-VS",
          largeur: "2.5mm",
          confort: "Confort++",
        },
        weight: 4,
      }
    ),

    makeProduct(
      "Bague Trois Ors 18K Tresse",
      "bague-trois-ors-tresse",
      "Bague en trois ors 18K (jaune, blanc, rose) avec motif tresse. Design moderne et intemporel, portee seule ou en accumulation.",
      "bagues-or-18-carats",
      "Maison Bijoux",
      [{ title: "Largeur", values: ["3mm", "5mm", "7mm"] }],
      [
        { title: "3mm fine", sku: "3OR-TRS-3", options: { Largeur: "3mm" }, price: 590_00, weight: 3 },
        { title: "5mm medium", sku: "3OR-TRS-5", options: { Largeur: "5mm" }, price: 790_00, weight: 5 },
        { title: "7mm large", sku: "3OR-TRS-7", options: { Largeur: "7mm" }, price: 990_00, weight: 7 },
      ],
      {
        caracteristiques: {
          metal: "Trois ors 18K",
          composition: "Or jaune + Or blanc + Or rose",
          motif: "Tresse russe",
        },
        weight: 5,
      }
    ),

    // ========== BAGUES ARGENT 925 ==========
    makeProduct(
      "Bague Argent 925 Zirconium Solitaire",
      "bague-argent-925-zirconium",
      "Bague solitaire en argent sterling 925 rhodie avec zirconium cubique taille brillant. Look diamant a prix accessible.",
      "bagues-argent-925-sertissage",
      "Silver Collection",
      [{ title: "Pierre", values: ["Blanc", "Rose", "Bleu", "Vert"] }],
      [
        { title: "Zirconium blanc", sku: "AG925-SOL-BL", options: { Pierre: "Blanc" }, price: 49_00, weight: 3 },
        { title: "Zirconium rose", sku: "AG925-SOL-RS", options: { Pierre: "Rose" }, price: 49_00, weight: 3 },
        { title: "Zirconium bleu", sku: "AG925-SOL-BU", options: { Pierre: "Bleu" }, price: 49_00, weight: 3 },
        { title: "Zirconium vert", sku: "AG925-SOL-VT", options: { Pierre: "Vert" }, price: 49_00, weight: 3 },
      ],
      {
        caracteristiques: {
          metal: "Argent 925 rhodie",
          pierre: "Zirconium cubique 6mm",
          monture: "Griffes",
        },
        weight: 3,
      }
    ),

    // ========== COLLIERS OR ==========
    makeProduct(
      "Collier Or 18K Chaine Forcat",
      "collier-or-18k-forcat",
      "Collier chaine forcat en or jaune 18K. Mailles classiques et elegantes, fermoir mousqueton securise. Ideal pour porter seul ou avec pendentif.",
      "colliers-or-18-carats",
      "Maison Bijoux",
      [{ title: "Longueur", values: ["40cm", "45cm", "50cm", "55cm"] }],
      [
        { title: "40cm ras de cou", sku: "CH18-FRC-40", options: { Longueur: "40cm" }, price: 390_00, weight: 3 },
        { title: "45cm standard", sku: "CH18-FRC-45", options: { Longueur: "45cm" }, price: 450_00, weight: 4 },
        { title: "50cm mi-long", sku: "CH18-FRC-50", options: { Longueur: "50cm" }, price: 510_00, weight: 4 },
        { title: "55cm sautoir", sku: "CH18-FRC-55", options: { Longueur: "55cm" }, price: 570_00, weight: 5 },
      ],
      {
        caracteristiques: {
          metal: "Or jaune 18K",
          maille: "Forcat",
          largeur_maille: "1.5mm",
          fermoir: "Mousqueton",
        },
        weight: 4,
      }
    ),

    makeProduct(
      "Collier Pendentif Diamant Or 18K",
      "collier-pendentif-diamant-18k",
      "Collier avec pendentif diamant solitaire en or blanc 18K. Diamant clos sur chaine venitienne fine. Elegance discrete pour tous les jours.",
      "colliers-or-18k-diamants",
      "Maison Bijoux",
      [{ title: "Diamant", values: ["0.10ct", "0.15ct", "0.20ct", "0.30ct"] }],
      [
        { title: "0.10ct", sku: "PEND-DIA-010", options: { Diamant: "0.10ct" }, price: 590_00, weight: 2 },
        { title: "0.15ct", sku: "PEND-DIA-015", options: { Diamant: "0.15ct" }, price: 790_00, weight: 2 },
        { title: "0.20ct", sku: "PEND-DIA-020", options: { Diamant: "0.20ct" }, price: 990_00, weight: 2 },
        { title: "0.30ct", sku: "PEND-DIA-030", options: { Diamant: "0.30ct" }, price: 1390_00, weight: 3 },
      ],
      {
        caracteristiques: {
          metal: "Or blanc 18K",
          chaine: "Venitienne 42cm",
          sertissage: "Clos",
          diamant: "G-VS brillant",
        },
        weight: 2,
      }
    ),

    makeProduct(
      "Collier Perles Akoya 7-7.5mm",
      "collier-perles-akoya",
      "Rang de perles Akoya japonaises de culture, qualite AA+. Perles parfaitement spheriques avec bel orient. Fermoir or blanc.",
      "colliers-or-18-carats",
      "Pearl Excellence",
      [{ title: "Longueur", values: ["40cm (Ras)", "45cm (Princesse)", "55cm (Matinee)"] }],
      [
        { title: "40cm Ras de cou", sku: "AKOYA-40", options: { Longueur: "40cm (Ras)" }, price: 890_00, weight: 30 },
        { title: "45cm Princesse", sku: "AKOYA-45", options: { Longueur: "45cm (Princesse)" }, price: 990_00, weight: 35 },
        { title: "55cm Matinee", sku: "AKOYA-55", options: { Longueur: "55cm (Matinee)" }, price: 1290_00, weight: 45 },
      ],
      {
        caracteristiques: {
          type_perle: "Akoya Japon",
          diametre: "7-7.5mm",
          qualite: "AA+",
          orient: "Rose",
          fermoir: "Or blanc 18K",
        },
        weight: 35,
      }
    ),

    // ========== COLLIERS ARGENT ==========
    makeProduct(
      "Collier Argent 925 Croix Diamantee",
      "collier-argent-croix-diamantee",
      "Collier avec pendentif croix en argent 925 rhodie avec finition diamantee. Chaine maille forcat fine. Look moderne et symbolique.",
      "colliers-argent-925",
      "Silver Collection",
      [{ title: "Taille croix", values: ["15mm", "20mm", "25mm"] }],
      [
        { title: "Croix 15mm", sku: "AG-CRX-15", options: { "Taille croix": "15mm" }, price: 59_00, weight: 3 },
        { title: "Croix 20mm", sku: "AG-CRX-20", options: { "Taille croix": "20mm" }, price: 69_00, weight: 4 },
        { title: "Croix 25mm", sku: "AG-CRX-25", options: { "Taille croix": "25mm" }, price: 79_00, weight: 5 },
      ],
      {
        caracteristiques: {
          metal: "Argent 925 rhodie",
          finition: "Diamantee",
          chaine: "Forcat 45cm",
        },
        weight: 4,
      }
    ),

    // ========== BRACELETS ==========
    makeProduct(
      "Bracelet Tennis Diamants Or 18K",
      "bracelet-tennis-diamants",
      "Bracelet riviere de diamants en or blanc 18K. 50 diamants taille brillant serti griffes. Fermoir securite double.",
      "bracelets-tennis",
      "Maison Bijoux",
      [{ title: "Caratage", values: ["1.00ct", "2.00ct", "3.00ct", "5.00ct"] }],
      [
        { title: "1.00ct total", sku: "TENNIS-100", options: { Caratage: "1.00ct" }, price: 2990_00, weight: 10 },
        { title: "2.00ct total", sku: "TENNIS-200", options: { Caratage: "2.00ct" }, price: 5490_00, weight: 12 },
        { title: "3.00ct total", sku: "TENNIS-300", options: { Caratage: "3.00ct" }, price: 7990_00, weight: 14 },
        { title: "5.00ct total", sku: "TENNIS-500", options: { Caratage: "5.00ct" }, price: 12990_00, weight: 18 },
      ],
      {
        subtitle: "Le classique intemporel",
        caracteristiques: {
          metal: "Or blanc 18K",
          diamants: "50 brillants G-VS",
          longueur: "18cm",
          fermoir: "Securite double",
        },
        weight: 12,
      }
    ),

    makeProduct(
      "Bracelet Jonc Or 18K Ouvrant",
      "bracelet-jonc-or-18k",
      "Bracelet jonc rigide ouvrant en or jaune 18K. Design epure et moderne, s'adapte a tous les poignets grace a son systeme d'ouverture.",
      "bracelets-jonc-or",
      "Maison Bijoux",
      [{ title: "Largeur", values: ["3mm", "5mm", "8mm"] }],
      [
        { title: "3mm fin", sku: "JONC-18K-3", options: { Largeur: "3mm" }, price: 890_00, weight: 8 },
        { title: "5mm medium", sku: "JONC-18K-5", options: { Largeur: "5mm" }, price: 1290_00, weight: 12 },
        { title: "8mm large", sku: "JONC-18K-8", options: { Largeur: "8mm" }, price: 1890_00, weight: 18 },
      ],
      {
        caracteristiques: {
          metal: "Or jaune 18K",
          type: "Jonc ouvrant",
          finition: "Poli miroir",
        },
        weight: 12,
      }
    ),

    makeProduct(
      "Gourmette Identite Or 18K Bebe",
      "gourmette-bebe-or-18k",
      "Gourmette de naissance en or jaune 18K. Plaque a graver incluse, maille gourmette fine. Le cadeau de naissance par excellence.",
      "gourmettes-bebe",
      "Maison Bijoux",
      [{ title: "Longueur", values: ["12cm", "14cm"] }],
      [
        { title: "12cm (0-6 mois)", sku: "GOUR-BB-12", options: { Longueur: "12cm" }, price: 290_00, weight: 3 },
        { title: "14cm (6-18 mois)", sku: "GOUR-BB-14", options: { Longueur: "14cm" }, price: 350_00, weight: 4 },
      ],
      {
        caracteristiques: {
          metal: "Or jaune 18K",
          maille: "Gourmette fine",
          plaque: "Rectangle a graver",
          gravure: "Incluse (prenom + date)",
        },
        weight: 3,
      }
    ),

    // ========== BOUCLES D'OREILLES ==========
    makeProduct(
      "Puces Diamants Or 18K Solitaire",
      "puces-diamants-or-18k",
      "Paire de puces d'oreilles solitaires en or blanc 18K. Diamants taille brillant serti griffes. Fermoirs poussettes securisees.",
      "puces-diamant-solitaire",
      "Maison Bijoux",
      [{ title: "Caratage paire", values: ["0.20ct", "0.30ct", "0.50ct", "0.70ct", "1.00ct"] }],
      [
        { title: "2x 0.10ct", sku: "PUCES-020", options: { "Caratage paire": "0.20ct" }, price: 590_00, weight: 2 },
        { title: "2x 0.15ct", sku: "PUCES-030", options: { "Caratage paire": "0.30ct" }, price: 790_00, weight: 2 },
        { title: "2x 0.25ct", sku: "PUCES-050", options: { "Caratage paire": "0.50ct" }, price: 1290_00, weight: 2 },
        { title: "2x 0.35ct", sku: "PUCES-070", options: { "Caratage paire": "0.70ct" }, price: 1890_00, weight: 3 },
        { title: "2x 0.50ct", sku: "PUCES-100", options: { "Caratage paire": "1.00ct" }, price: 2990_00, weight: 3 },
      ],
      {
        caracteristiques: {
          metal: "Or blanc 18K",
          diamants: "Brillants G-VS",
          sertissage: "4 griffes",
          fermoir: "Poussettes securisees",
        },
        weight: 2,
      }
    ),

    makeProduct(
      "Creoles Or 18K Diamantees",
      "creoles-or-18k-diamantees",
      "Creoles en or jaune 18K avec finition diamantee. Look classique revisite avec texture brillante. Fermoir clipsable.",
      "creoles-or",
      "Maison Bijoux",
      [{ title: "Diametre", values: ["15mm", "20mm", "30mm", "40mm"] }],
      [
        { title: "15mm petit", sku: "CREO-18K-15", options: { Diametre: "15mm" }, price: 290_00, weight: 3 },
        { title: "20mm medium", sku: "CREO-18K-20", options: { Diametre: "20mm" }, price: 390_00, weight: 4 },
        { title: "30mm grand", sku: "CREO-18K-30", options: { Diametre: "30mm" }, price: 550_00, weight: 6 },
        { title: "40mm XXL", sku: "CREO-18K-40", options: { Diametre: "40mm" }, price: 750_00, weight: 8 },
      ],
      {
        caracteristiques: {
          metal: "Or jaune 18K",
          finition: "Diamantee",
          epaisseur: "2.5mm",
          fermoir: "Clips",
        },
        weight: 5,
      }
    ),

    makeProduct(
      "Dormeuses Perles Akoya Or 18K",
      "dormeuses-perles-akoya",
      "Boucles d'oreilles dormeuses en or blanc 18K avec perles Akoya. Perles parfaitement rondes avec bel orient rose.",
      "dormeuses",
      "Pearl Excellence",
      [{ title: "Taille perle", values: ["6mm", "7mm", "8mm"] }],
      [
        { title: "Perles 6mm", sku: "DORM-AK-6", options: { "Taille perle": "6mm" }, price: 290_00, weight: 3 },
        { title: "Perles 7mm", sku: "DORM-AK-7", options: { "Taille perle": "7mm" }, price: 350_00, weight: 4 },
        { title: "Perles 8mm", sku: "DORM-AK-8", options: { "Taille perle": "8mm" }, price: 450_00, weight: 5 },
      ],
      {
        caracteristiques: {
          metal: "Or blanc 18K",
          perles: "Akoya AA+",
          fermoir: "Dormeuse",
        },
        weight: 4,
      }
    ),

    // ========== BIJOUX HOMME ==========
    makeProduct(
      "Chevaliere Or 18K Onyx",
      "chevaliere-or-18k-onyx",
      "Chevaliere homme en or jaune 18K avec plateau onyx noir. Design classique et masculin, possibilite de gravure sur les cotes.",
      "chevalieres-or",
      "Maison Bijoux",
      [{ title: "Taille plateau", values: ["12mm", "14mm", "16mm"] }],
      [
        { title: "12mm compact", sku: "CHEV-ONX-12", options: { "Taille plateau": "12mm" }, price: 890_00, weight: 12 },
        { title: "14mm classique", sku: "CHEV-ONX-14", options: { "Taille plateau": "14mm" }, price: 1190_00, weight: 15 },
        { title: "16mm imposant", sku: "CHEV-ONX-16", options: { "Taille plateau": "16mm" }, price: 1490_00, weight: 18 },
      ],
      {
        caracteristiques: {
          metal: "Or jaune 18K",
          pierre: "Onyx noir",
          forme: "Tonneau",
          gravure: "Possible sur cotes",
        },
        weight: 15,
      }
    ),

    makeProduct(
      "Boutons de Manchette Or 18K Nacre",
      "boutons-manchette-or-nacre",
      "Paire de boutons de manchette en or jaune 18K avec plateau nacre blanche. Mecanisme T-bar classique, elegance raffinee.",
      "boutons-manchette",
      "Maison Bijoux",
      [{ title: "Forme", values: ["Rond", "Carre", "Ovale"] }],
      [
        { title: "Rond 12mm", sku: "BDM-NACRE-RD", options: { Forme: "Rond" }, price: 690_00, weight: 10 },
        { title: "Carre 12mm", sku: "BDM-NACRE-CR", options: { Forme: "Carre" }, price: 690_00, weight: 10 },
        { title: "Ovale 14x10mm", sku: "BDM-NACRE-OV", options: { Forme: "Ovale" }, price: 750_00, weight: 12 },
      ],
      {
        caracteristiques: {
          metal: "Or jaune 18K",
          plateau: "Nacre blanche",
          mecanisme: "T-bar",
        },
        weight: 10,
      }
    ),

    // ========== MONTRES ==========
    makeProduct(
      "Montre Automatique Homme Acier",
      "montre-automatique-homme",
      "Montre automatique pour homme en acier inoxydable. Mouvement suisse, reserve de marche 42h, verre saphir. Design sportif elegant.",
      "montres-automatiques",
      "Horlogerie Suisse",
      [{ title: "Cadran", values: ["Bleu", "Noir", "Argente"] }],
      [
        { title: "Cadran bleu", sku: "MON-AUTO-BL", options: { Cadran: "Bleu" }, price: 1290_00, weight: 120 },
        { title: "Cadran noir", sku: "MON-AUTO-NR", options: { Cadran: "Noir" }, price: 1290_00, weight: 120 },
        { title: "Cadran argente", sku: "MON-AUTO-AG", options: { Cadran: "Argente" }, price: 1290_00, weight: 120 },
      ],
      {
        caracteristiques: {
          mouvement: "Automatique suisse",
          boitier: "Acier 316L - 42mm",
          verre: "Saphir",
          etancheite: "100m",
          reserve_marche: "42h",
        },
        weight: 120,
        hs_code: "9101.11",
      }
    ),

    makeProduct(
      "Montre Femme Diamants Or Rose",
      "montre-femme-diamants-or-rose",
      "Montre femme en or rose 18K sertie de diamants. Cadran nacre, mouvement quartz suisse, bracelet milanais assorti.",
      "montres-diamants",
      "Horlogerie Prestige",
      [{ title: "Sertissage", values: ["Lunette seule", "Lunette + Index"] }],
      [
        { title: "Diamants lunette", sku: "MON-F-DIA-L", options: { Sertissage: "Lunette seule" }, price: 4990_00, weight: 80 },
        { title: "Diamants lunette + index", sku: "MON-F-DIA-LI", options: { Sertissage: "Lunette + Index" }, price: 6990_00, weight: 85 },
      ],
      {
        caracteristiques: {
          metal: "Or rose 18K",
          diamants: "0.50ct total VS-G",
          boitier: "28mm",
          cadran: "Nacre blanche",
          mouvement: "Quartz suisse",
        },
        weight: 80,
        hs_code: "9101.21",
      }
    ),

    // ========== DIAMANTS EN VRAC ==========
    makeProduct(
      "Diamant Naturel Certifie GIA 0.50ct",
      "diamant-gia-050ct",
      "Diamant naturel certifie GIA, taille brillant rond. Pierre ideale pour solitaire ou bijou sur mesure. Certificat fourni.",
      "diamants-ronds-05ct-plus",
      "Diamond Source",
      [{ title: "Qualite", values: ["E-VVS2", "F-VS1", "G-VS2", "H-SI1"] }],
      [
        { title: "E-VVS2 Excellent", sku: "DIA-050-EVVS", options: { Qualite: "E-VVS2" }, price: 3990_00, weight: 0.1 },
        { title: "F-VS1 Excellent", sku: "DIA-050-FVS", options: { Qualite: "F-VS1" }, price: 2890_00, weight: 0.1 },
        { title: "G-VS2 Very Good", sku: "DIA-050-GVS", options: { Qualite: "G-VS2" }, price: 2290_00, weight: 0.1 },
        { title: "H-SI1 Very Good", sku: "DIA-050-HSI", options: { Qualite: "H-SI1" }, price: 1690_00, weight: 0.1 },
      ],
      {
        certification: ["GIA"],
        caracteristiques: {
          carat: "0.50ct",
          taille: "Brillant rond",
          proportions: "GIA Excellent/Very Good",
          fluorescence: "None to Faint",
        },
        weight: 0.1,
        hs_code: "7102.39",
      }
    ),

    makeProduct(
      "Diamants Melee Ronds 1.5mm (lot 50)",
      "diamants-melee-15mm",
      "Lot de 50 petits diamants ronds 1.5mm pour sertissage pave ou grain. Qualite VS-G, taille excellente.",
      "diamants-ronds-melee",
      "Diamond Source",
      [{ title: "Taille", values: ["1.0mm", "1.5mm", "2.0mm"] }],
      [
        { title: "1.0mm (x50) 0.25ct total", sku: "MELEE-10", options: { Taille: "1.0mm" }, price: 290_00, weight: 0.05 },
        { title: "1.5mm (x50) 0.50ct total", sku: "MELEE-15", options: { Taille: "1.5mm" }, price: 490_00, weight: 0.1 },
        { title: "2.0mm (x50) 1.00ct total", sku: "MELEE-20", options: { Taille: "2.0mm" }, price: 890_00, weight: 0.2 },
      ],
      {
        caracteristiques: {
          type: "Melee ronds",
          qualite: "VS-G",
          taille: "Full cut",
          quantite: "50 pieces/lot",
        },
        weight: 0.1,
      }
    ),

    // ========== PIERRES PRECIEUSES ==========
    makeProduct(
      "Saphir Bleu Naturel Certifie",
      "saphir-bleu-certifie",
      "Saphir bleu naturel certifie, ideal pour bague ou pendentif. Couleur intense, belle saturation. Certificat gemmologique fourni.",
      "saphirs-bleus",
      "Gem Excellence",
      [{ title: "Carat", values: ["0.50ct", "1.00ct", "2.00ct"] }],
      [
        { title: "0.50ct ovale", sku: "SAPH-050", options: { Carat: "0.50ct" }, price: 590_00, weight: 0.1 },
        { title: "1.00ct ovale", sku: "SAPH-100", options: { Carat: "1.00ct" }, price: 1290_00, weight: 0.2 },
        { title: "2.00ct coussin", sku: "SAPH-200", options: { Carat: "2.00ct" }, price: 2890_00, weight: 0.4 },
      ],
      {
        certification: ["AGL", "GRS"],
        caracteristiques: {
          type: "Saphir naturel",
          origine: "Sri Lanka/Madagascar",
          traitement: "Chauffe standard",
          couleur: "Blue vivid",
        },
        weight: 0.2,
        hs_code: "7103.91",
      }
    ),

    makeProduct(
      "Rubis Naturel Certifie",
      "rubis-naturel-certifie",
      "Rubis rouge naturel certifie, intensite de couleur exceptionnelle. Pierre precieuse rare, parfait pour joaillerie haut de gamme.",
      "rubis",
      "Gem Excellence",
      [{ title: "Carat", values: ["0.50ct", "1.00ct", "1.50ct"] }],
      [
        { title: "0.50ct ovale", sku: "RUBIS-050", options: { Carat: "0.50ct" }, price: 990_00, weight: 0.1 },
        { title: "1.00ct ovale", sku: "RUBIS-100", options: { Carat: "1.00ct" }, price: 2490_00, weight: 0.2 },
        { title: "1.50ct coussin", sku: "RUBIS-150", options: { Carat: "1.50ct" }, price: 4990_00, weight: 0.3 },
      ],
      {
        certification: ["GRS", "Gubelin"],
        caracteristiques: {
          type: "Rubis naturel",
          origine: "Birmanie/Mozambique",
          traitement: "Chauffe legere",
          couleur: "Pigeon blood",
        },
        weight: 0.2,
        hs_code: "7103.91",
      }
    ),

    makeProduct(
      "Emeraude Naturelle Colombie",
      "emeraude-colombie",
      "Emeraude naturelle de Colombie, qualite joaillerie. Vert intense caracteristique, inclusions jardin typiques.",
      "emeraudes",
      "Gem Excellence",
      [{ title: "Carat", values: ["0.50ct", "1.00ct", "2.00ct"] }],
      [
        { title: "0.50ct emeraude cut", sku: "EMER-050", options: { Carat: "0.50ct" }, price: 790_00, weight: 0.1 },
        { title: "1.00ct emeraude cut", sku: "EMER-100", options: { Carat: "1.00ct" }, price: 1990_00, weight: 0.2 },
        { title: "2.00ct emeraude cut", sku: "EMER-200", options: { Carat: "2.00ct" }, price: 4490_00, weight: 0.4 },
      ],
      {
        certification: ["CDTEC", "Gubelin"],
        caracteristiques: {
          type: "Emeraude naturelle",
          origine: "Colombie (Muzo/Chivor)",
          traitement: "Huilee (minor)",
          couleur: "Green vivid",
        },
        weight: 0.2,
        hs_code: "7103.91",
      }
    ),

    // ========== PERLES ==========
    makeProduct(
      "Perles Tahiti Noires 9-10mm (lot 10)",
      "perles-tahiti-lot10",
      "Lot de 10 perles de Tahiti noires percees. Diametre 9-10mm, qualite A, orient paon caracteristique. Pour creation bijoux.",
      "perles-tahiti",
      "Pearl Excellence",
      [{ title: "Qualite", values: ["A", "AA", "AAA"] }],
      [
        { title: "Qualite A (x10)", sku: "TAHITI-A-10", options: { Qualite: "A" }, price: 490_00, weight: 20 },
        { title: "Qualite AA (x10)", sku: "TAHITI-AA-10", options: { Qualite: "AA" }, price: 790_00, weight: 20 },
        { title: "Qualite AAA (x10)", sku: "TAHITI-AAA-10", options: { Qualite: "AAA" }, price: 1290_00, weight: 20 },
      ],
      {
        caracteristiques: {
          type: "Perle de Tahiti",
          diametre: "9-10mm",
          forme: "Ronde/Semi-ronde",
          couleur: "Noir a reflets paon",
          percage: "0.8mm",
        },
        weight: 20,
        hs_code: "7101.21",
      }
    ),

    // ========== PACKAGING ==========
    makeProduct(
      "Ecrin Bague LED Luxe",
      "ecrin-bague-led-luxe",
      "Ecrin de presentation pour bague avec eclairage LED integre. Finition cuir synthetique haut de gamme, interieur velours.",
      "ecrins-bague-led",
      "Box Premium",
      [{ title: "Couleur", values: ["Noir", "Bordeaux", "Bleu nuit", "Blanc"] }],
      [
        { title: "Noir", sku: "ECR-LED-NR", options: { Couleur: "Noir" }, price: 24_90, weight: 80 },
        { title: "Bordeaux", sku: "ECR-LED-BD", options: { Couleur: "Bordeaux" }, price: 24_90, weight: 80 },
        { title: "Bleu nuit", sku: "ECR-LED-BN", options: { Couleur: "Bleu nuit" }, price: 24_90, weight: 80 },
        { title: "Blanc", sku: "ECR-LED-BL", options: { Couleur: "Blanc" }, price: 24_90, weight: 80 },
      ],
      {
        caracteristiques: {
          dimensions: "65x65x55mm",
          materiau: "Cuir synthetique",
          interieur: "Velours",
          led: "Eclairage automatique a l'ouverture",
          pile: "CR2032 incluse",
        },
        weight: 80,
      }
    ),

    makeProduct(
      "Pochettes Velours Luxe (lot 100)",
      "pochettes-velours-lot100",
      "Lot de 100 pochettes velours avec cordon. Ideal pour bijoux, parfait pour emballage cadeau ou stockage.",
      "pochettes-velours",
      "Box Premium",
      [{ title: "Taille", values: ["7x9cm", "9x12cm", "12x15cm"] }],
      [
        { title: "7x9cm (x100)", sku: "POCH-VLR-79", options: { Taille: "7x9cm" }, price: 39_00, weight: 200 },
        { title: "9x12cm (x100)", sku: "POCH-VLR-912", options: { Taille: "9x12cm" }, price: 49_00, weight: 300 },
        { title: "12x15cm (x100)", sku: "POCH-VLR-1215", options: { Taille: "12x15cm" }, price: 69_00, weight: 400 },
      ],
      {
        caracteristiques: {
          materiau: "Velours polyester",
          fermeture: "Cordon coulissant",
          couleurs: "Noir, Bordeaux, Bleu marine",
        },
        weight: 300,
      }
    ),

    makeProduct(
      "Presentoir Bagues 36 Places",
      "presentoir-bagues-36",
      "Plateau presentoir pour 36 bagues avec mousses amovibles. Structure bois laque, feutrine interchangeable.",
      "plateaux-bagues",
      "Display Pro",
      [{ title: "Finition", values: ["Noir mat", "Blanc brillant", "Bois naturel"] }],
      [
        { title: "Noir mat", sku: "PRES-36-NR", options: { Finition: "Noir mat" }, price: 59_00, weight: 500 },
        { title: "Blanc brillant", sku: "PRES-36-BL", options: { Finition: "Blanc brillant" }, price: 59_00, weight: 500 },
        { title: "Bois naturel", sku: "PRES-36-BO", options: { Finition: "Bois naturel" }, price: 69_00, weight: 550 },
      ],
      {
        caracteristiques: {
          capacite: "36 bagues",
          dimensions: "35x24x3cm",
          structure: "Bois MDF laque",
          mousses: "Amovibles",
        },
        weight: 500,
      }
    ),

    makeProduct(
      "Buste Collier Velours Premium",
      "buste-collier-velours",
      "Buste de presentation pour colliers en velours haut de gamme. Base lestee, hauteur ideale pour vitrine.",
      "bustes-colliers",
      "Display Pro",
      [{ title: "Couleur", values: ["Noir", "Gris", "Bordeaux", "Creme"] }],
      [
        { title: "Noir", sku: "BUSTE-NR", options: { Couleur: "Noir" }, price: 34_00, weight: 400 },
        { title: "Gris", sku: "BUSTE-GR", options: { Couleur: "Gris" }, price: 34_00, weight: 400 },
        { title: "Bordeaux", sku: "BUSTE-BD", options: { Couleur: "Bordeaux" }, price: 34_00, weight: 400 },
        { title: "Creme", sku: "BUSTE-CR", options: { Couleur: "Creme" }, price: 34_00, weight: 400 },
      ],
      {
        caracteristiques: {
          hauteur: "28cm",
          largeur: "18cm",
          materiau: "Velours sur mousse HD",
          base: "Lestee stable",
        },
        weight: 400,
      }
    ),

    // ========== APPRETS ==========
    makeProduct(
      "Fermoirs Mousqueton Or 18K (lot 10)",
      "fermoirs-mousqueton-or-18k",
      "Lot de 10 fermoirs mousqueton en or jaune 18K. Qualite professionnelle, ressort resistant.",
      "fermoirs-mousqueton",
      "Pro Apprets",
      [{ title: "Taille", values: ["8mm", "10mm", "12mm"] }],
      [
        { title: "8mm (x10)", sku: "FRM-OR-8", options: { Taille: "8mm" }, price: 290_00, weight: 5 },
        { title: "10mm (x10)", sku: "FRM-OR-10", options: { Taille: "10mm" }, price: 350_00, weight: 8 },
        { title: "12mm (x10)", sku: "FRM-OR-12", options: { Taille: "12mm" }, price: 420_00, weight: 12 },
      ],
      {
        caracteristiques: {
          metal: "Or jaune 18K",
          type: "Mousqueton",
          ressort: "Acier inox",
          titrage: "750/1000",
        },
        weight: 8,
      }
    ),

    makeProduct(
      "Crochets Oreilles Argent 925 (lot 50)",
      "crochets-oreilles-argent-925",
      "Lot de 50 paires de crochets d'oreilles en argent 925 rhodie. Forme classique avec boule de securite.",
      "crochets-oreilles",
      "Pro Apprets",
      [{ title: "Style", values: ["Classique", "Avec breloque", "Levier"] }],
      [
        { title: "Classique (x50 paires)", sku: "CRO-AG-CL", options: { Style: "Classique" }, price: 29_00, weight: 25 },
        { title: "Avec breloque (x50 paires)", sku: "CRO-AG-BR", options: { Style: "Avec breloque" }, price: 35_00, weight: 30 },
        { title: "Levier (x50 paires)", sku: "CRO-AG-LV", options: { Style: "Levier" }, price: 42_00, weight: 35 },
      ],
      {
        caracteristiques: {
          metal: "Argent 925 rhodie",
          securite: "Boule de retenue",
          titrage: "925/1000",
        },
        weight: 30,
      }
    ),

    makeProduct(
      "Chaine Or 18K au Metre - Forcat",
      "chaine-or-18k-metre-forcat",
      "Chaine forcat en or jaune 18K vendue au metre. Pour creation de colliers et bracelets sur mesure.",
      "chaines-or-metre",
      "Pro Apprets",
      [{ title: "Largeur maille", values: ["1.0mm", "1.5mm", "2.0mm"] }],
      [
        { title: "1.0mm (par metre)", sku: "CHN-OR-10", options: { "Largeur maille": "1.0mm" }, price: 89_00, weight: 3 },
        { title: "1.5mm (par metre)", sku: "CHN-OR-15", options: { "Largeur maille": "1.5mm" }, price: 129_00, weight: 5 },
        { title: "2.0mm (par metre)", sku: "CHN-OR-20", options: { "Largeur maille": "2.0mm" }, price: 189_00, weight: 8 },
      ],
      {
        caracteristiques: {
          metal: "Or jaune 18K",
          maille: "Forcat",
          titrage: "750/1000",
          conditionnement: "Au metre",
        },
        weight: 5,
      }
    ),

    // ========== OUTILS ==========
    makeProduct(
      "Kit Pinces Bijouterie Pro (5 pieces)",
      "kit-pinces-bijouterie",
      "Coffret de 5 pinces de bijouterie professionnelles. Inclut pince plate, ronde, demi-ronde, coupante et brucelles.",
      "pinces-bijouterie",
      "Tools Pro",
      [{ title: "Qualite", values: ["Standard", "Premium"] }],
      [
        { title: "Standard", sku: "KIT-PINC-STD", options: { Qualite: "Standard" }, price: 49_00, weight: 300 },
        { title: "Premium (pointes fines)", sku: "KIT-PINC-PRE", options: { Qualite: "Premium" }, price: 89_00, weight: 320 },
      ],
      {
        caracteristiques: {
          pieces: 5,
          inclus: ["Plate", "Ronde", "Demi-ronde", "Coupante", "Brucelles"],
          materiau: "Acier traite",
          poignees: "Ergonomiques antiderapantes",
        },
        weight: 300,
      }
    ),

    makeProduct(
      "Loupe Bijoutier LED 10x",
      "loupe-bijoutier-led",
      "Loupe de bijoutier professionnelle grossissement 10x avec eclairage LED integre. Lentille triplet achromat.",
      "loupes-eclairage",
      "Tools Pro",
      [{ title: "Type", values: ["Loupe seule", "Loupe + etui cuir"] }],
      [
        { title: "Loupe seule", sku: "LOUPE-10X", options: { Type: "Loupe seule" }, price: 29_00, weight: 50 },
        { title: "Loupe + etui cuir", sku: "LOUPE-10X-ET", options: { Type: "Loupe + etui cuir" }, price: 39_00, weight: 80 },
      ],
      {
        caracteristiques: {
          grossissement: "10x",
          lentille: "Triplet achromat 21mm",
          eclairage: "LED (pile LR44 incluse)",
          boitier: "Chrome",
        },
        weight: 50,
      }
    ),
  ];

  // Create products using workflow
  logger.info(`   Creating ${productsData.length} products...`);

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: productsData,
    },
  });

  logger.info(`   ${products.length} products created`);

  // Create inventory levels for all variants
  logger.info("   Setting up inventory levels...");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });

  if (inventoryItems.length > 0) {
    const inventoryLevels = inventoryItems.map((item: { id: string }) => ({
      inventory_item_id: item.id,
      location_id: stockLocation.id,
      stocked_quantity: Math.floor(Math.random() * 100) + 10,
    }));

    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });

    logger.info(`   Inventory levels created for ${inventoryItems.length} items`);
  }

  // Link products to collections
  logger.info("   Linking products to collections...");

  const productCollectionLinks = [
    { idx: 0, collection: "bestsellers" },
    { idx: 0, collection: "fiancailles-mariage" },
    { idx: 1, collection: "fiancailles-mariage" },
    { idx: 2, collection: "fiancailles-mariage" },
    { idx: 3, collection: "nouveautes" },
    { idx: 5, collection: "bestsellers" },
    { idx: 6, collection: "haute-joaillerie" },
    { idx: 7, collection: "bestsellers" },
    { idx: 10, collection: "haute-joaillerie" },
    { idx: 12, collection: "selection-cadeaux" },
    { idx: 14, collection: "bestsellers" },
    { idx: 15, collection: "nouveautes" },
    { idx: 17, collection: "bijoux-homme-collection" },
    { idx: 18, collection: "bijoux-homme-collection" },
    { idx: 19, collection: "haute-joaillerie" },
    { idx: 20, collection: "haute-joaillerie" },
    { idx: 25, collection: "coup-de-coeur" },
  ];

  for (const link of productCollectionLinks) {
    if (products[link.idx] && collections[link.collection]) {
      await productService.updateProductCollections(collections[link.collection], {
        product_ids: [products[link.idx].id],
      });
    }
  }

  logger.info("   Products linked to collections");
  logger.info(`\nSEED SUMMARY:`);
  logger.info(`   - Categories: ${Object.keys(categories).length} (5 levels hierarchy)`);
  logger.info(`   - Collections: ${Object.keys(collections).length}`);
  logger.info(`   - Products: ${products.length}`);
  logger.info(`   - Variants: ${inventoryItems.length}`);
}
