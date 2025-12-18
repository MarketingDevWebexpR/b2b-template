/**
 * B2B Products Seed Script - Professional Hardware & Supplies
 *
 * Creates 1000 professional B2B products for electrical, plumbing, tools,
 * HVAC, and hardware categories with realistic French product data.
 *
 * Run with: npx medusa exec ./src/scripts/seed-b2b-products.ts
 *
 * Prerequisites:
 * - Run seed-marques.ts first to create brand data
 * - The marques module must be registered
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type {
  IProductModuleService,
  ISalesChannelModuleService,
  IFulfillmentModuleService,
  IStockLocationService,
} from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows";
import { MARQUES_MODULE } from "../modules/marques";
import type { MarquesModuleService, MarqueDTO } from "../modules/marques";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Category definition for B2B products
 */
interface CategoryDefinition {
  name: string;
  handle: string;
  description: string;
  metadata: {
    name_en: string;
    icon?: string;
  };
  children?: CategoryDefinition[];
}

/**
 * Product template for generation
 */
interface ProductTemplate {
  namePrefix: string;
  nameSuffix: string;
  descriptionTemplate: string;
  categoryHandle: string;
  rootCategory: string; // Catégorie racine pour le filtrage (electricite, plomberie, outillage, chauffage-climatisation, quincaillerie)
  brands: string[];
  optionName: string;
  optionValues: string[];
  priceRange: { min: number; max: number };
  skuPrefix: string;
  imageKeywords: string[];
  hsCode: string;
  weight: number;
  productType: string; // Type de produit pour personnalisation frontend
}

/**
 * Collection definition for B2B products
 */
interface CollectionDefinition {
  title: string;
  handle: string;
  metadata?: Record<string, unknown>;
}

/**
 * Product Type definition
 */
interface ProductTypeDefinition {
  value: string;
  metadata?: Record<string, unknown>;
}

/**
 * Variant configuration with image support
 */
interface VariantConfig {
  title: string;
  optionValue: string;
  priceMod: number;
  weightMod: number;
  imageUrl: string;
  imageKeyword: string;
}

/**
 * Remote link service interface
 */
interface IRemoteLinkService {
  create(linkDefinition: Record<string, Record<string, string>>): Promise<void>;
}

// ============================================================================
// B2B CATEGORY HIERARCHY
// ============================================================================

const B2B_CATEGORIES: CategoryDefinition[] = [
  // ÉLECTRICITÉ
  {
    name: "Électricité",
    handle: "electricite",
    description: "Matériel électrique professionnel - câbles, interrupteurs, tableaux, éclairage",
    metadata: { name_en: "Electrical", icon: "bolt" },
    children: [
      {
        name: "Câbles et Fils",
        handle: "cables-fils",
        description: "Câbles électriques, fils de câblage, gaines",
        metadata: { name_en: "Cables & Wires" },
        children: [
          {
            name: "Câbles Rigides",
            handle: "cables-rigides",
            description: "Câbles rigides U1000R2V et H07VU",
            metadata: { name_en: "Rigid Cables" },
            children: [
              { name: "Câbles U1000R2V", handle: "cables-u1000r2v", description: "Câbles U1000R2V 3G à 5G", metadata: { name_en: "U1000R2V Cables" },
                children: [
                  { name: "U1000R2V 3G1.5 à 3G6", handle: "u1000r2v-3g", description: "Câbles U1000R2V triphasés section 1.5 à 6mm²", metadata: { name_en: "U1000R2V 3G" } },
                  { name: "U1000R2V 5G1.5 à 5G6", handle: "u1000r2v-5g", description: "Câbles U1000R2V 5 conducteurs section 1.5 à 6mm²", metadata: { name_en: "U1000R2V 5G" } },
                ]
              },
              { name: "Câbles H07VU", handle: "cables-h07vu", description: "Fils rigides H07VU pour installation fixe", metadata: { name_en: "H07VU Cables" } },
            ],
          },
          {
            name: "Câbles Souples",
            handle: "cables-souples",
            description: "Câbles souples H07RNF et H05VVF",
            metadata: { name_en: "Flexible Cables" },
            children: [
              { name: "Câbles H07RNF", handle: "cables-h07rnf", description: "Câbles souples extérieurs H07RNF", metadata: { name_en: "H07RNF Cables" },
                children: [
                  { name: "H07RNF 3G1.5 à 3G6", handle: "h07rnf-3g", description: "Câbles H07RNF 3 conducteurs", metadata: { name_en: "H07RNF 3G" } },
                  { name: "H07RNF 4G et 5G", handle: "h07rnf-4g5g", description: "Câbles H07RNF 4 et 5 conducteurs", metadata: { name_en: "H07RNF 4G/5G" } },
                ]
              },
              { name: "Câbles H05VVF", handle: "cables-h05vvf", description: "Câbles souples intérieurs H05VVF", metadata: { name_en: "H05VVF Cables" } },
            ],
          },
          { name: "Fils de Câblage", handle: "fils-cablage", description: "Fils H07VU et H07VR pour tableau", metadata: { name_en: "Wiring" } },
        ],
      },
      {
        name: "Appareillage",
        handle: "appareillage",
        description: "Interrupteurs, prises, variateurs",
        metadata: { name_en: "Switches & Outlets" },
        children: [
          {
            name: "Interrupteurs",
            handle: "interrupteurs",
            description: "Interrupteurs va-et-vient, poussoirs",
            metadata: { name_en: "Switches" },
            children: [
              { name: "Interrupteurs Simple Allumage", handle: "inter-simple", description: "Interrupteurs simple allumage encastrés", metadata: { name_en: "Single Switches" } },
              { name: "Interrupteurs Va-et-Vient", handle: "inter-va-vient", description: "Interrupteurs va-et-vient pour commande multiple", metadata: { name_en: "Two-Way Switches" } },
              { name: "Boutons Poussoirs", handle: "boutons-poussoirs", description: "Poussoirs pour minuterie et télérupteur", metadata: { name_en: "Push Buttons" } },
            ],
          },
          {
            name: "Prises Électriques",
            handle: "prises-electriques",
            description: "Prises 2P+T, USB, RJ45",
            metadata: { name_en: "Electrical Outlets" },
            children: [
              { name: "Prises 2P+T 16A", handle: "prises-2pt-16a", description: "Prises de courant 2P+T 16A standard", metadata: { name_en: "16A Outlets" } },
              { name: "Prises USB", handle: "prises-usb", description: "Prises avec chargeur USB intégré", metadata: { name_en: "USB Outlets" } },
              { name: "Prises RJ45", handle: "prises-rj45", description: "Prises informatiques RJ45 Cat6", metadata: { name_en: "RJ45 Outlets" } },
            ],
          },
          { name: "Variateurs", handle: "variateurs", description: "Variateurs et gradateurs LED compatibles", metadata: { name_en: "Dimmers" } },
        ],
      },
      {
        name: "Tableau Électrique",
        handle: "tableau-electrique",
        description: "Coffrets, disjoncteurs, différentiels",
        metadata: { name_en: "Electrical Panel" },
        children: [
          {
            name: "Disjoncteurs",
            handle: "disjoncteurs",
            description: "Disjoncteurs modulaires",
            metadata: { name_en: "Circuit Breakers" },
            children: [
              { name: "Disjoncteurs Courbe C", handle: "disj-courbe-c", description: "Disjoncteurs courbe C usage général", metadata: { name_en: "Type C Breakers" },
                children: [
                  { name: "Disjoncteurs 10A à 20A", handle: "disj-10a-20a", description: "Disjoncteurs éclairage et prises", metadata: { name_en: "10-20A Breakers" } },
                  { name: "Disjoncteurs 25A à 40A", handle: "disj-25a-40a", description: "Disjoncteurs gros appareils", metadata: { name_en: "25-40A Breakers" } },
                ]
              },
              { name: "Disjoncteurs Courbe D", handle: "disj-courbe-d", description: "Disjoncteurs courbe D fort appel", metadata: { name_en: "Type D Breakers" } },
            ],
          },
          {
            name: "Différentiels",
            handle: "differentiels",
            description: "Interrupteurs différentiels",
            metadata: { name_en: "RCDs" },
            children: [
              { name: "Différentiels 30mA Type AC", handle: "diff-30ma-ac", description: "Inter diff 30mA type AC standard", metadata: { name_en: "30mA Type AC" } },
              { name: "Différentiels 30mA Type A", handle: "diff-30ma-a", description: "Inter diff 30mA type A circuits spéciaux", metadata: { name_en: "30mA Type A" } },
            ],
          },
          { name: "Coffrets", handle: "coffrets-electriques", description: "Coffrets et armoires électriques", metadata: { name_en: "Enclosures" } },
        ],
      },
      {
        name: "Éclairage",
        handle: "eclairage",
        description: "Ampoules, luminaires, projecteurs",
        metadata: { name_en: "Lighting" },
        children: [
          {
            name: "Ampoules LED",
            handle: "ampoules-led",
            description: "Ampoules LED E27, E14, GU10",
            metadata: { name_en: "LED Bulbs" },
            children: [
              { name: "LED E27", handle: "led-e27", description: "Ampoules LED culot E27 gros vis", metadata: { name_en: "E27 LED" } },
              { name: "LED E14", handle: "led-e14", description: "Ampoules LED culot E14 petit vis", metadata: { name_en: "E14 LED" } },
              { name: "LED GU10", handle: "led-gu10", description: "Spots LED culot GU10", metadata: { name_en: "GU10 LED" } },
            ],
          },
          { name: "Tubes LED", handle: "tubes-led", description: "Tubes LED T8 et T5 remplacement fluorescent", metadata: { name_en: "LED Tubes" } },
          { name: "Projecteurs", handle: "projecteurs", description: "Projecteurs LED chantier et extérieur", metadata: { name_en: "Floodlights" } },
          { name: "Réglettes", handle: "reglettes", description: "Réglettes LED et plafonniers", metadata: { name_en: "Light Fixtures" } },
        ],
      },
      {
        name: "Gaines et Conduits",
        handle: "gaines-conduits",
        description: "Gaines ICTA, tubes IRL, moulures",
        metadata: { name_en: "Conduits" },
        children: [
          { name: "Gaines ICTA", handle: "gaines-icta", description: "Gaines ICTA préfilées et vides", metadata: { name_en: "ICTA Conduits" } },
          { name: "Tubes IRL", handle: "tubes-irl", description: "Tubes IRL rigides apparents", metadata: { name_en: "Rigid Tubes" } },
          { name: "Moulures", handle: "moulures", description: "Moulures et goulottes passage câbles", metadata: { name_en: "Cable Trunking" } },
        ],
      },
    ],
  },
  // PLOMBERIE
  {
    name: "Plomberie",
    handle: "plomberie",
    description: "Équipements de plomberie - tuyaux, raccords, robinetterie, sanitaire",
    metadata: { name_en: "Plumbing", icon: "droplet" },
    children: [
      {
        name: "Tuyauterie",
        handle: "tuyauterie",
        description: "Tubes cuivre, PER, multicouche",
        metadata: { name_en: "Piping" },
        children: [
          {
            name: "Tubes PER",
            handle: "tubes-per",
            description: "Tubes PER rouge et bleu",
            metadata: { name_en: "PEX Tubes" },
            children: [
              { name: "PER Gainé", handle: "per-gaine", description: "Tubes PER prégainés bleu/rouge", metadata: { name_en: "Pre-Insulated PEX" },
                children: [
                  { name: "PER Gainé Ø12", handle: "per-gaine-12", description: "PER gainé diamètre 12mm", metadata: { name_en: "12mm PEX" } },
                  { name: "PER Gainé Ø16", handle: "per-gaine-16", description: "PER gainé diamètre 16mm", metadata: { name_en: "16mm PEX" } },
                  { name: "PER Gainé Ø20", handle: "per-gaine-20", description: "PER gainé diamètre 20mm", metadata: { name_en: "20mm PEX" } },
                ]
              },
              { name: "PER Nu", handle: "per-nu", description: "Tubes PER nu sans gaine", metadata: { name_en: "Bare PEX" } },
            ],
          },
          {
            name: "Tubes Multicouche",
            handle: "tubes-multicouche",
            description: "Tubes multicouche alu/PER",
            metadata: { name_en: "Multilayer Tubes" },
            children: [
              { name: "Multicouche Ø16", handle: "multicouche-16", description: "Multicouche diamètre 16mm", metadata: { name_en: "16mm Multilayer" } },
              { name: "Multicouche Ø20", handle: "multicouche-20", description: "Multicouche diamètre 20mm", metadata: { name_en: "20mm Multilayer" } },
              { name: "Multicouche Ø26", handle: "multicouche-26", description: "Multicouche diamètre 26mm", metadata: { name_en: "26mm Multilayer" } },
            ],
          },
          { name: "Tubes Cuivre", handle: "tubes-cuivre", description: "Tubes cuivre écroui et recuit", metadata: { name_en: "Copper Tubes" } },
          { name: "Tubes PVC Évacuation", handle: "tubes-pvc", description: "Tubes PVC évacuation Ø32 à Ø100", metadata: { name_en: "PVC Pipes" } },
        ],
      },
      {
        name: "Raccords",
        handle: "raccords",
        description: "Raccords laiton, à sertir, à compression",
        metadata: { name_en: "Fittings" },
        children: [
          {
            name: "Raccords à Sertir",
            handle: "raccords-sertir",
            description: "Raccords à sertir multicouche",
            metadata: { name_en: "Press Fittings" },
            children: [
              { name: "Raccords Sertir Ø16", handle: "sertir-16", description: "Raccords à sertir Ø16", metadata: { name_en: "16mm Press" } },
              { name: "Raccords Sertir Ø20", handle: "sertir-20", description: "Raccords à sertir Ø20", metadata: { name_en: "20mm Press" } },
              { name: "Raccords Sertir Ø26", handle: "sertir-26", description: "Raccords à sertir Ø26", metadata: { name_en: "26mm Press" } },
            ],
          },
          { name: "Raccords Laiton", handle: "raccords-laiton", description: "Raccords laiton filetés M/F", metadata: { name_en: "Brass Fittings" } },
          { name: "Raccords PVC", handle: "raccords-pvc", description: "Raccords PVC à coller évacuation", metadata: { name_en: "PVC Fittings" } },
        ],
      },
      {
        name: "Robinetterie",
        handle: "robinetterie",
        description: "Robinets, mitigeurs, vannes",
        metadata: { name_en: "Taps & Valves" },
        children: [
          {
            name: "Mitigeurs",
            handle: "mitigeurs",
            description: "Mitigeurs cuisine et salle de bain",
            metadata: { name_en: "Mixer Taps" },
            children: [
              { name: "Mitigeurs Cuisine", handle: "mitigeurs-cuisine", description: "Mitigeurs évier cuisine", metadata: { name_en: "Kitchen Mixers" },
                children: [
                  { name: "Mitigeurs Cuisine Standard", handle: "mitigeur-cuisine-std", description: "Mitigeurs cuisine bec fixe", metadata: { name_en: "Standard Kitchen" } },
                  { name: "Mitigeurs Cuisine Douchette", handle: "mitigeur-cuisine-douchette", description: "Mitigeurs cuisine bec extractible", metadata: { name_en: "Pull-Out Kitchen" } },
                ]
              },
              { name: "Mitigeurs Lavabo", handle: "mitigeurs-lavabo", description: "Mitigeurs lavabo salle de bain", metadata: { name_en: "Basin Mixers" } },
            ],
          },
          { name: "Robinets d'Arrêt", handle: "robinets-arret", description: "Robinets d'arrêt et vannes quart de tour", metadata: { name_en: "Stop Valves" } },
          { name: "Colonnes de Douche", handle: "colonnes-douche", description: "Colonnes et panneaux de douche thermostatiques", metadata: { name_en: "Shower Columns" } },
        ],
      },
      {
        name: "Sanitaire",
        handle: "sanitaire",
        description: "WC, lavabos, baignoires",
        metadata: { name_en: "Sanitary" },
        children: [
          {
            name: "WC et Réservoirs",
            handle: "wc-reservoirs",
            description: "Cuvettes WC et réservoirs",
            metadata: { name_en: "Toilets" },
            children: [
              { name: "WC à Poser", handle: "wc-poser", description: "Cuvettes WC à poser sortie horizontale/verticale", metadata: { name_en: "Floor-Mounted WC" } },
              { name: "WC Suspendus", handle: "wc-suspendus", description: "Cuvettes WC suspendues avec bâti-support", metadata: { name_en: "Wall-Hung WC" } },
              { name: "Mécanismes WC", handle: "mecanismes-wc", description: "Mécanismes de chasse et robinets flotteurs", metadata: { name_en: "WC Mechanisms" } },
            ],
          },
          { name: "Lavabos et Vasques", handle: "lavabos", description: "Lavabos céramique et vasques à poser", metadata: { name_en: "Basins" } },
          { name: "Baignoires et Receveurs", handle: "baignoires", description: "Baignoires acrylique et receveurs de douche", metadata: { name_en: "Bathtubs" } },
        ],
      },
      {
        name: "Évacuation",
        handle: "evacuation",
        description: "Siphons, bondes, évacuation",
        metadata: { name_en: "Drainage" },
        children: [
          { name: "Siphons", handle: "siphons", description: "Siphons lavabo, évier et douche", metadata: { name_en: "Traps" } },
          { name: "Bondes", handle: "bondes", description: "Bondes à grille et bondes clic-clac", metadata: { name_en: "Drains" } },
        ],
      },
    ],
  },
  // OUTILLAGE
  {
    name: "Outillage",
    handle: "outillage",
    description: "Outillage professionnel - électroportatif, à main, mesure",
    metadata: { name_en: "Tools", icon: "wrench" },
    children: [
      {
        name: "Électroportatif",
        handle: "electroportatif",
        description: "Perceuses, visseuses, meuleuses",
        metadata: { name_en: "Power Tools" },
        children: [
          {
            name: "Perceuses-Visseuses",
            handle: "perceuses-visseuses",
            description: "Perceuses et visseuses sans fil",
            metadata: { name_en: "Drill Drivers" },
            children: [
              { name: "Perceuses 12V", handle: "perceuses-12v", description: "Perceuses-visseuses compactes 12V", metadata: { name_en: "12V Drills" },
                children: [
                  { name: "Perceuses 12V 2Ah", handle: "perceuses-12v-2ah", description: "Perceuses 12V batteries 2Ah", metadata: { name_en: "12V 2Ah" } },
                  { name: "Perceuses 12V 4Ah", handle: "perceuses-12v-4ah", description: "Perceuses 12V batteries 4Ah", metadata: { name_en: "12V 4Ah" } },
                ]
              },
              { name: "Perceuses 18V", handle: "perceuses-18v", description: "Perceuses-visseuses professionnelles 18V", metadata: { name_en: "18V Drills" } },
              { name: "Perceuses à Percussion", handle: "perceuses-percussion", description: "Perceuses à percussion sans fil", metadata: { name_en: "Hammer Drills" } },
            ],
          },
          {
            name: "Perforateurs",
            handle: "perforateurs",
            description: "Perforateurs SDS+ et SDS-Max",
            metadata: { name_en: "Rotary Hammers" },
            children: [
              { name: "Perforateurs SDS+", handle: "perfo-sds-plus", description: "Perforateurs SDS+ légers et moyens", metadata: { name_en: "SDS+ Hammers" } },
              { name: "Perforateurs SDS-Max", handle: "perfo-sds-max", description: "Perforateurs SDS-Max gros travaux", metadata: { name_en: "SDS-Max Hammers" } },
            ],
          },
          {
            name: "Meuleuses",
            handle: "meuleuses",
            description: "Meuleuses 125mm et 230mm",
            metadata: { name_en: "Angle Grinders" },
            children: [
              { name: "Meuleuses Ø125", handle: "meuleuses-125", description: "Meuleuses d'angle diamètre 125mm", metadata: { name_en: "125mm Grinders" } },
              { name: "Meuleuses Ø230", handle: "meuleuses-230", description: "Meuleuses d'angle diamètre 230mm", metadata: { name_en: "230mm Grinders" } },
            ],
          },
          { name: "Scies Électriques", handle: "scies-electriques", description: "Scies circulaires, sauteuses et sabres", metadata: { name_en: "Electric Saws" } },
          { name: "Visseuses à Chocs", handle: "visseuses-chocs", description: "Visseuses à chocs et boulonneuses", metadata: { name_en: "Impact Drivers" } },
        ],
      },
      {
        name: "Outillage à Main",
        handle: "outillage-main",
        description: "Tournevis, clés, pinces",
        metadata: { name_en: "Hand Tools" },
        children: [
          {
            name: "Tournevis",
            handle: "tournevis",
            description: "Tournevis et embouts",
            metadata: { name_en: "Screwdrivers" },
            children: [
              { name: "Tournevis Plats", handle: "tournevis-plats", description: "Tournevis à lame plate", metadata: { name_en: "Flathead" } },
              { name: "Tournevis Cruciformes", handle: "tournevis-cruciformes", description: "Tournevis Phillips et Pozidriv", metadata: { name_en: "Phillips" } },
              { name: "Jeux de Tournevis", handle: "jeux-tournevis", description: "Coffrets et jeux de tournevis", metadata: { name_en: "Screwdriver Sets" } },
            ],
          },
          {
            name: "Clés",
            handle: "cles",
            description: "Clés plates, à molette, Allen",
            metadata: { name_en: "Wrenches" },
            children: [
              { name: "Clés Plates", handle: "cles-plates", description: "Clés plates et mixtes", metadata: { name_en: "Open Wrenches" } },
              { name: "Clés à Molette", handle: "cles-molette", description: "Clés à molette réglables", metadata: { name_en: "Adjustable Wrenches" } },
              { name: "Clés Allen", handle: "cles-allen", description: "Clés Allen et Torx", metadata: { name_en: "Hex Keys" } },
            ],
          },
          { name: "Pinces", handle: "pinces", description: "Pinces coupantes, multiprise et universelles", metadata: { name_en: "Pliers" } },
          { name: "Marteaux", handle: "marteaux", description: "Marteaux et masses", metadata: { name_en: "Hammers" } },
        ],
      },
      {
        name: "Mesure et Traçage",
        handle: "mesure-tracage",
        description: "Mètres, niveaux, lasers",
        metadata: { name_en: "Measuring" },
        children: [
          { name: "Mètres et Règles", handle: "metres-regles", description: "Mètres ruban 3m à 10m et règles", metadata: { name_en: "Tape Measures" } },
          {
            name: "Niveaux",
            handle: "niveaux",
            description: "Niveaux à bulle et laser",
            metadata: { name_en: "Levels" },
            children: [
              { name: "Niveaux à Bulle", handle: "niveaux-bulle", description: "Niveaux à bulle 40cm à 120cm", metadata: { name_en: "Spirit Levels" } },
              { name: "Niveaux Laser", handle: "niveaux-laser", description: "Niveaux laser lignes croisées", metadata: { name_en: "Laser Levels" } },
            ],
          },
          { name: "Télémètres", handle: "telemetres", description: "Télémètres laser 20m à 100m", metadata: { name_en: "Distance Meters" } },
        ],
      },
      {
        name: "Consommables Outillage",
        handle: "consommables-outillage",
        description: "Forets, disques, lames",
        metadata: { name_en: "Consumables" },
        children: [
          {
            name: "Forets",
            handle: "forets",
            description: "Forets métal, béton, bois",
            metadata: { name_en: "Drill Bits" },
            children: [
              { name: "Forets Béton SDS+", handle: "forets-beton-sds", description: "Forets béton emmanchement SDS+", metadata: { name_en: "SDS+ Concrete" } },
              { name: "Forets Métal HSS", handle: "forets-metal-hss", description: "Forets métal HSS et cobalt", metadata: { name_en: "HSS Metal" } },
              { name: "Forets Bois", handle: "forets-bois", description: "Forets bois hélicoïdaux et mèches", metadata: { name_en: "Wood Bits" } },
            ],
          },
          { name: "Disques", handle: "disques", description: "Disques à tronçonner et à meuler", metadata: { name_en: "Cutting Discs" } },
          { name: "Lames de Scie", handle: "lames-scie", description: "Lames circulaires et sauteuses", metadata: { name_en: "Saw Blades" } },
        ],
      },
      {
        name: "Rangement Outillage",
        handle: "rangement-outillage",
        description: "Caisses, servantes, sacs",
        metadata: { name_en: "Tool Storage" },
        children: [
          { name: "Caisses à Outils", handle: "caisses-outils", description: "Caisses et coffres à outils", metadata: { name_en: "Tool Boxes" } },
          { name: "Servantes d'Atelier", handle: "servantes", description: "Servantes et établis d'atelier", metadata: { name_en: "Tool Carts" } },
        ],
      },
    ],
  },
  // CHAUFFAGE / CLIMATISATION
  {
    name: "Chauffage & Climatisation",
    handle: "chauffage-climatisation",
    description: "Équipements de chauffage et climatisation - radiateurs, chaudières, PAC",
    metadata: { name_en: "HVAC", icon: "thermometer" },
    children: [
      {
        name: "Chauffage Électrique",
        handle: "chauffage-electrique",
        description: "Radiateurs électriques, convecteurs",
        metadata: { name_en: "Electric Heating" },
        children: [
          {
            name: "Radiateurs à Inertie",
            handle: "radiateurs-inertie",
            description: "Radiateurs à inertie sèche et fluide",
            metadata: { name_en: "Storage Heaters" },
            children: [
              { name: "Inertie Sèche", handle: "inertie-seche", description: "Radiateurs inertie sèche céramique/pierre", metadata: { name_en: "Dry Inertia" },
                children: [
                  { name: "Inertie Sèche 1000W", handle: "inertie-seche-1000w", description: "Radiateurs inertie sèche 1000W", metadata: { name_en: "1000W Dry" } },
                  { name: "Inertie Sèche 1500W", handle: "inertie-seche-1500w", description: "Radiateurs inertie sèche 1500W", metadata: { name_en: "1500W Dry" } },
                  { name: "Inertie Sèche 2000W", handle: "inertie-seche-2000w", description: "Radiateurs inertie sèche 2000W", metadata: { name_en: "2000W Dry" } },
                ]
              },
              { name: "Inertie Fluide", handle: "inertie-fluide", description: "Radiateurs inertie fluide caloporteur", metadata: { name_en: "Fluid Inertia" } },
            ],
          },
          { name: "Convecteurs", handle: "convecteurs", description: "Convecteurs électriques muraux", metadata: { name_en: "Convectors" } },
          { name: "Panneaux Rayonnants", handle: "panneaux-rayonnants", description: "Panneaux rayonnants infrarouge", metadata: { name_en: "Radiant Panels" } },
          { name: "Sèche-Serviettes", handle: "seche-serviettes", description: "Sèche-serviettes électriques et mixtes", metadata: { name_en: "Towel Warmers" } },
        ],
      },
      {
        name: "Chauffage Central",
        handle: "chauffage-central",
        description: "Radiateurs eau chaude, chaudières",
        metadata: { name_en: "Central Heating" },
        children: [
          {
            name: "Radiateurs Eau Chaude",
            handle: "radiateurs-eau-chaude",
            description: "Radiateurs acier et fonte",
            metadata: { name_en: "Hot Water Radiators" },
            children: [
              { name: "Radiateurs Acier", handle: "radiateurs-acier", description: "Radiateurs panneaux acier Type 21/22", metadata: { name_en: "Steel Radiators" } },
              { name: "Radiateurs Fonte", handle: "radiateurs-fonte", description: "Radiateurs fonte classiques", metadata: { name_en: "Cast Iron" } },
            ],
          },
          {
            name: "Chaudières Gaz",
            handle: "chaudieres-gaz",
            description: "Chaudières gaz murales condensation",
            metadata: { name_en: "Gas Boilers" },
            children: [
              { name: "Chaudières 24kW", handle: "chaudieres-24kw", description: "Chaudières gaz 24kW", metadata: { name_en: "24kW Boilers" } },
              { name: "Chaudières 28-35kW", handle: "chaudieres-28-35kw", description: "Chaudières gaz 28 à 35kW", metadata: { name_en: "28-35kW Boilers" } },
            ],
          },
          { name: "Têtes Thermostatiques", handle: "tetes-thermostatiques", description: "Têtes thermostatiques et robinets", metadata: { name_en: "Thermostatic Heads" } },
        ],
      },
      {
        name: "Eau Chaude Sanitaire",
        handle: "eau-chaude-sanitaire",
        description: "Chauffe-eau, ballons, cumulus",
        metadata: { name_en: "Hot Water" },
        children: [
          {
            name: "Chauffe-Eau Électriques",
            handle: "chauffe-eau-electriques",
            description: "Chauffe-eau et cumulus électriques",
            metadata: { name_en: "Electric Water Heaters" },
            children: [
              { name: "Chauffe-Eau 100L", handle: "ce-100l", description: "Chauffe-eau électrique 100 litres", metadata: { name_en: "100L Heaters" } },
              { name: "Chauffe-Eau 150L", handle: "ce-150l", description: "Chauffe-eau électrique 150 litres", metadata: { name_en: "150L Heaters" } },
              { name: "Chauffe-Eau 200L", handle: "ce-200l", description: "Chauffe-eau électrique 200 litres", metadata: { name_en: "200L Heaters" } },
              { name: "Chauffe-Eau 300L", handle: "ce-300l", description: "Chauffe-eau électrique 300 litres", metadata: { name_en: "300L Heaters" } },
            ],
          },
          { name: "Chauffe-Eau Thermodynamiques", handle: "chauffe-eau-thermo", description: "Chauffe-eau thermodynamiques PAC", metadata: { name_en: "Heat Pump Water Heaters" } },
        ],
      },
      {
        name: "Climatisation",
        handle: "climatisation",
        description: "Climatiseurs, splits, PAC réversibles",
        metadata: { name_en: "Air Conditioning" },
        children: [
          {
            name: "Splits Muraux",
            handle: "splits",
            description: "Climatiseurs split muraux",
            metadata: { name_en: "Split Units" },
            children: [
              { name: "Splits 2.5kW", handle: "splits-2-5kw", description: "Climatiseurs split 2.5kW (jusqu'à 25m²)", metadata: { name_en: "2.5kW Splits" } },
              { name: "Splits 3.5kW", handle: "splits-3-5kw", description: "Climatiseurs split 3.5kW (25-35m²)", metadata: { name_en: "3.5kW Splits" } },
              { name: "Splits 5kW+", handle: "splits-5kw", description: "Climatiseurs split 5kW et plus", metadata: { name_en: "5kW+ Splits" } },
            ],
          },
          { name: "Multi-Splits", handle: "multi-splits", description: "Systèmes multi-split 2 à 5 unités", metadata: { name_en: "Multi-Split" } },
          { name: "Climatiseurs Mobiles", handle: "climatiseurs-mobiles", description: "Climatiseurs portables monobloc", metadata: { name_en: "Portable AC" } },
        ],
      },
      {
        name: "Ventilation",
        handle: "ventilation",
        description: "VMC, extracteurs, aérateurs",
        metadata: { name_en: "Ventilation" },
        children: [
          {
            name: "VMC",
            handle: "vmc",
            description: "VMC simple et double flux",
            metadata: { name_en: "HRV/ERV" },
            children: [
              { name: "VMC Simple Flux", handle: "vmc-simple-flux", description: "VMC simple flux autoréglable et hygroréglable", metadata: { name_en: "Single Flow" } },
              { name: "VMC Double Flux", handle: "vmc-double-flux", description: "VMC double flux avec récupération chaleur", metadata: { name_en: "Heat Recovery" } },
            ],
          },
          { name: "Extracteurs", handle: "extracteurs", description: "Extracteurs et aérateurs salle de bain", metadata: { name_en: "Extractors" } },
        ],
      },
    ],
  },
  // QUINCAILLERIE
  {
    name: "Quincaillerie",
    handle: "quincaillerie",
    description: "Quincaillerie professionnelle - fixation, serrurerie, ferrures",
    metadata: { name_en: "Hardware", icon: "cog" },
    children: [
      {
        name: "Fixation",
        handle: "fixation",
        description: "Chevilles, vis, boulons",
        metadata: { name_en: "Fasteners" },
        children: [
          {
            name: "Chevilles",
            handle: "chevilles",
            description: "Chevilles nylon, chimiques, métal",
            metadata: { name_en: "Wall Plugs" },
            children: [
              { name: "Chevilles Nylon", handle: "chevilles-nylon", description: "Chevilles nylon universelles", metadata: { name_en: "Nylon Plugs" },
                children: [
                  { name: "Chevilles Ø6", handle: "chevilles-6", description: "Chevilles nylon diamètre 6mm", metadata: { name_en: "6mm Plugs" } },
                  { name: "Chevilles Ø8", handle: "chevilles-8", description: "Chevilles nylon diamètre 8mm", metadata: { name_en: "8mm Plugs" } },
                  { name: "Chevilles Ø10", handle: "chevilles-10", description: "Chevilles nylon diamètre 10mm", metadata: { name_en: "10mm Plugs" } },
                ]
              },
              { name: "Chevilles Chimiques", handle: "chevilles-chimiques", description: "Scellements chimiques et résines", metadata: { name_en: "Chemical Anchors" } },
              { name: "Chevilles Métal", handle: "chevilles-metal", description: "Chevilles métalliques à expansion", metadata: { name_en: "Metal Anchors" } },
            ],
          },
          {
            name: "Vis",
            handle: "vis",
            description: "Vis bois, métal, plâtre",
            metadata: { name_en: "Screws" },
            children: [
              { name: "Vis à Bois", handle: "vis-bois", description: "Vis à bois tête fraisée et ronde", metadata: { name_en: "Wood Screws" } },
              { name: "Vis Agglo", handle: "vis-agglo", description: "Vis aggloméré et MDF", metadata: { name_en: "Chipboard Screws" } },
              { name: "Vis Placo", handle: "vis-placo", description: "Vis plaques de plâtre phosphatées", metadata: { name_en: "Drywall Screws" } },
              { name: "Vis Autoperceuses", handle: "vis-autoperceuses", description: "Vis autoperceuses tôle et métal", metadata: { name_en: "Self-Drilling" } },
            ],
          },
          { name: "Boulons et Écrous", handle: "boulons-ecrous", description: "Boulonnerie M6 à M16", metadata: { name_en: "Bolts & Nuts" } },
          { name: "Clous et Pointes", handle: "clous", description: "Clous tête plate et pointes", metadata: { name_en: "Nails" } },
        ],
      },
      {
        name: "Serrurerie",
        handle: "serrurerie",
        description: "Serrures, cylindres, verrous",
        metadata: { name_en: "Locks" },
        children: [
          {
            name: "Serrures",
            handle: "serrures",
            description: "Serrures à encastrer et en applique",
            metadata: { name_en: "Locks" },
            children: [
              { name: "Serrures à Encastrer", handle: "serrures-encastrer", description: "Serrures à encastrer axe 40-70mm", metadata: { name_en: "Mortice Locks" } },
              { name: "Serrures en Applique", handle: "serrures-applique", description: "Serrures en applique horizontales/verticales", metadata: { name_en: "Surface Locks" } },
              { name: "Serrures Multipoints", handle: "serrures-multipoints", description: "Serrures 3 et 5 points de fermeture", metadata: { name_en: "Multipoint Locks" } },
            ],
          },
          {
            name: "Cylindres",
            handle: "cylindres",
            description: "Cylindres et barillets",
            metadata: { name_en: "Cylinders" },
            children: [
              { name: "Cylindres Standards", handle: "cylindres-standards", description: "Cylindres européens standards", metadata: { name_en: "Standard Cylinders" } },
              { name: "Cylindres Haute Sécurité", handle: "cylindres-securite", description: "Cylindres haute sécurité brevetés", metadata: { name_en: "High Security" } },
            ],
          },
          { name: "Verrous", handle: "verrous", description: "Verrous et targettes", metadata: { name_en: "Bolts" } },
        ],
      },
      {
        name: "Ferrures",
        handle: "ferrures",
        description: "Charnières, poignées, glissières",
        metadata: { name_en: "Hardware Fittings" },
        children: [
          {
            name: "Charnières",
            handle: "charnieres",
            description: "Charnières et paumelles",
            metadata: { name_en: "Hinges" },
            children: [
              { name: "Charnières Invisibles", handle: "charnieres-invisibles", description: "Charnières invisibles 35mm cuvette", metadata: { name_en: "Concealed Hinges" } },
              { name: "Paumelles", handle: "paumelles", description: "Paumelles de porte intérieure", metadata: { name_en: "Door Hinges" } },
            ],
          },
          {
            name: "Poignées",
            handle: "poignees",
            description: "Poignées de porte et fenêtre",
            metadata: { name_en: "Handles" },
            children: [
              { name: "Poignées sur Plaque", handle: "poignees-plaque", description: "Poignées de porte sur plaque", metadata: { name_en: "Plate Handles" } },
              { name: "Poignées sur Rosace", handle: "poignees-rosace", description: "Poignées de porte sur rosace", metadata: { name_en: "Rose Handles" } },
              { name: "Poignées Fenêtre", handle: "poignees-fenetre", description: "Crémones et poignées de fenêtre", metadata: { name_en: "Window Handles" } },
            ],
          },
          { name: "Glissières", handle: "glissieres", description: "Glissières et coulisses tiroir", metadata: { name_en: "Slides" } },
        ],
      },
      {
        name: "Étanchéité",
        handle: "etancheite",
        description: "Joints, silicones, mousses",
        metadata: { name_en: "Sealing" },
        children: [
          {
            name: "Silicones et Mastics",
            handle: "silicones",
            description: "Silicones sanitaires et mastics",
            metadata: { name_en: "Silicones" },
            children: [
              { name: "Silicone Sanitaire", handle: "silicone-sanitaire", description: "Silicone sanitaire anti-moisissures", metadata: { name_en: "Sanitary Silicone" } },
              { name: "Silicone Neutre", handle: "silicone-neutre", description: "Silicone neutre multi-usages", metadata: { name_en: "Neutral Silicone" } },
              { name: "Mastic Acrylique", handle: "mastic-acrylique", description: "Mastic acrylique peinture", metadata: { name_en: "Acrylic Sealant" } },
            ],
          },
          { name: "Joints", handle: "joints", description: "Joints de fenêtre et de porte", metadata: { name_en: "Gaskets" } },
          { name: "Mousses Polyuréthane", handle: "mousses-pu", description: "Mousses expansives polyuréthane", metadata: { name_en: "PU Foam" } },
        ],
      },
    ],
  },
];

// ============================================================================
// B2B COLLECTIONS
// ============================================================================

const B2B_COLLECTIONS: CollectionDefinition[] = [
  { title: "Nouveautés", handle: "nouveautes", metadata: { icon: "sparkles", priority: 1 } },
  { title: "Best-Sellers", handle: "bestsellers", metadata: { icon: "trophy", priority: 2 } },
  { title: "Promotions", handle: "promotions", metadata: { icon: "tag", priority: 3 } },
  { title: "Sélection Pro", handle: "selection-pro", metadata: { icon: "star", priority: 4 } },
  { title: "Éco-Responsable", handle: "eco-responsable", metadata: { icon: "leaf", priority: 5 } },
  { title: "Packs et Kits", handle: "packs-kits", metadata: { icon: "package", priority: 6 } },
  { title: "Rénovation", handle: "renovation", metadata: { icon: "home", priority: 7 } },
  { title: "Chantier", handle: "chantier", metadata: { icon: "hard-hat", priority: 8 } },
];

// ============================================================================
// PRODUCT TYPES
// ============================================================================

const B2B_PRODUCT_TYPES: ProductTypeDefinition[] = [
  { value: "Outillage Électroportatif", metadata: { category: "outillage" } },
  { value: "Outillage à Main", metadata: { category: "outillage" } },
  { value: "Matériel de Mesure", metadata: { category: "outillage" } },
  { value: "Consommable Outillage", metadata: { category: "outillage" } },
  { value: "Câble Électrique", metadata: { category: "electricite" } },
  { value: "Appareillage Électrique", metadata: { category: "electricite" } },
  { value: "Tableau Électrique", metadata: { category: "electricite" } },
  { value: "Éclairage", metadata: { category: "electricite" } },
  { value: "Tuyauterie", metadata: { category: "plomberie" } },
  { value: "Raccord", metadata: { category: "plomberie" } },
  { value: "Robinetterie", metadata: { category: "plomberie" } },
  { value: "Sanitaire", metadata: { category: "plomberie" } },
  { value: "Chauffage Électrique", metadata: { category: "chauffage" } },
  { value: "Chauffage Central", metadata: { category: "chauffage" } },
  { value: "Climatisation", metadata: { category: "chauffage" } },
  { value: "Eau Chaude Sanitaire", metadata: { category: "chauffage" } },
  { value: "Ventilation", metadata: { category: "chauffage" } },
  { value: "Fixation", metadata: { category: "quincaillerie" } },
  { value: "Serrurerie", metadata: { category: "quincaillerie" } },
  { value: "Ferrure", metadata: { category: "quincaillerie" } },
  { value: "Étanchéité", metadata: { category: "quincaillerie" } },
  { value: "Rangement Outillage", metadata: { category: "outillage" } },
];

// ============================================================================
// BRAND MAPPINGS BY CATEGORY
// ============================================================================

const BRAND_MAPPINGS: Record<string, string[]> = {
  // Power tools
  "perceuses-visseuses": ["bosch", "dewalt", "makita", "milwaukee", "hilti", "metabo"],
  "perforateurs": ["bosch", "dewalt", "makita", "milwaukee", "hilti"],
  "meuleuses": ["bosch", "dewalt", "makita", "metabo", "milwaukee"],
  "scies-electriques": ["bosch", "dewalt", "makita", "metabo"],
  "visseuses-chocs": ["bosch", "dewalt", "makita", "milwaukee"],
  "electroportatif": ["bosch", "dewalt", "makita", "milwaukee", "hilti", "metabo"],

  // Hand tools
  "tournevis": ["stanley", "facom", "bahco", "wiha"],
  "cles": ["facom", "bahco", "stanley", "knipex"],
  "pinces": ["knipex", "facom", "bahco", "stanley"],
  "marteaux": ["stanley", "facom"],
  "outillage-main": ["stanley", "facom", "bahco", "knipex", "wiha"],

  // Measuring
  "metres-regles": ["stanley", "facom"],
  "niveaux": ["bosch", "stanley"],
  "lasers-mesure": ["bosch", "dewalt", "hilti"],
  "telemetres": ["bosch", "hilti"],
  "mesure-tracage": ["bosch", "stanley", "hilti"],

  // Electrical
  "cables-rigides": ["schneider-electric", "legrand"],
  "cables-souples": ["schneider-electric", "legrand"],
  "fils-cablage": ["schneider-electric", "legrand"],
  "cables-fils": ["schneider-electric", "legrand"],
  "interrupteurs": ["schneider-electric", "legrand", "hager"],
  "prises-electriques": ["schneider-electric", "legrand", "hager"],
  "variateurs": ["schneider-electric", "legrand"],
  "appareillage": ["schneider-electric", "legrand", "hager"],
  "disjoncteurs": ["schneider-electric", "legrand", "hager"],
  "differentiels": ["schneider-electric", "legrand", "hager"],
  "coffrets-electriques": ["schneider-electric", "legrand", "hager"],
  "tableau-electrique": ["schneider-electric", "legrand", "hager"],
  "ampoules-led": ["schneider-electric", "legrand"],
  "tubes-led": ["schneider-electric"],
  "projecteurs": ["schneider-electric"],
  "reglettes": ["schneider-electric", "legrand"],
  "eclairage": ["schneider-electric", "legrand"],
  "gaines-icta": ["schneider-electric", "legrand"],
  "tubes-irl": ["schneider-electric", "legrand"],
  "moulures": ["schneider-electric", "legrand"],
  "gaines-conduits": ["schneider-electric", "legrand"],
  "electricite": ["schneider-electric", "legrand", "hager"],

  // Plumbing
  "tubes-per": ["grohe", "geberit"],
  "tubes-multicouche": ["geberit"],
  "tubes-cuivre": ["geberit"],
  "tubes-pvc": ["geberit"],
  "tuyauterie": ["grohe", "geberit"],
  "raccords-sertir": ["geberit"],
  "raccords-laiton": ["grohe", "geberit"],
  "raccords-pvc": ["geberit"],
  "raccords": ["grohe", "geberit"],
  "mitigeurs": ["grohe", "hansgrohe", "roca"],
  "robinets-arret": ["grohe", "geberit"],
  "colonnes-douche": ["grohe", "hansgrohe"],
  "robinetterie": ["grohe", "hansgrohe", "geberit"],
  "wc-reservoirs": ["geberit", "roca"],
  "lavabos": ["roca", "geberit"],
  "baignoires": ["roca"],
  "sanitaire": ["grohe", "geberit", "roca"],
  "siphons": ["geberit"],
  "bondes": ["geberit", "grohe"],
  "evacuation": ["geberit"],
  "plomberie": ["grohe", "hansgrohe", "geberit", "roca"],

  // HVAC
  "radiateurs-inertie": ["atlantic", "thermor"],
  "convecteurs": ["atlantic", "thermor"],
  "panneaux-rayonnants": ["atlantic", "thermor"],
  "chauffage-electrique": ["atlantic", "thermor"],
  "radiateurs-eau-chaude": ["atlantic"],
  "chaudieres-gaz": ["atlantic", "daikin"],
  "accessoires-chauffage": ["atlantic", "thermor"],
  "chauffage-central": ["atlantic", "daikin"],
  "chauffe-eau-electriques": ["atlantic", "thermor"],
  "chauffe-eau-thermo": ["atlantic", "thermor", "daikin"],
  "eau-chaude-sanitaire": ["atlantic", "thermor"],
  "splits": ["daikin", "atlantic"],
  "climatiseurs-mobiles": ["daikin"],
  "climatisation": ["daikin", "atlantic"],
  "vmc": ["atlantic"],
  "extracteurs": ["atlantic"],
  "ventilation": ["atlantic"],
  "chauffage-climatisation": ["atlantic", "thermor", "daikin"],

  // Hardware
  "chevilles": ["fischer", "wurth"],
  "vis": ["fischer", "wurth"],
  "boulons-ecrous": ["wurth"],
  "clous": ["wurth"],
  "fixation": ["fischer", "wurth"],
  "serrures": ["wurth"],
  "cylindres": ["wurth"],
  "verrous": ["wurth"],
  "serrurerie": ["wurth"],
  "charnieres": ["wurth"],
  "poignees": ["wurth"],
  "glissieres": ["wurth"],
  "ferrures": ["wurth"],
  "silicones": ["fischer", "wurth"],
  "joints": ["wurth"],
  "mousses-pu": ["fischer", "wurth"],
  "etancheite": ["fischer", "wurth"],
  "quincaillerie": ["fischer", "wurth"],

  // Consumables
  "forets": ["bosch", "dewalt", "hilti"],
  "disques": ["bosch", "dewalt"],
  "lames-scie": ["bosch", "dewalt", "makita"],
  "consommables-outillage": ["bosch", "dewalt", "hilti"],

  // Storage
  "caisses-outils": ["stanley", "dewalt", "milwaukee"],
  "servantes": ["facom", "stanley"],
  "rangement-outillage": ["stanley", "facom", "dewalt"],
  "outillage": ["bosch", "dewalt", "makita", "milwaukee", "stanley", "facom"],
};

// ============================================================================
// PRODUCT TEMPLATES
// ============================================================================

/**
 * Generate product templates for each category
 */
function getProductTemplates(): ProductTemplate[] {
  return [
    // =========== ÉLECTRICITÉ ===========
    // Câbles
    {
      namePrefix: "Câble U1000R2V",
      nameSuffix: "",
      descriptionTemplate: "Câble électrique rigide U1000R2V pour installation fixe. Norme NF C 32-321. Idéal pour alimentation tableau et circuits de puissance. Isolation PVC, âme cuivre.",
      categoryHandle: "cables-rigides",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Section",
      optionValues: ["3G1.5mm² 25m", "3G2.5mm² 25m", "3G1.5mm² 50m", "3G2.5mm² 50m", "3G1.5mm² 100m"],
      priceRange: { min: 2500, max: 15000 },
      skuPrefix: "U1000-",
      imageKeywords: ["cable", "electrical", "wire"],
      hsCode: "8544.49",
      weight: 5000,
      productType: "Câble Électrique",
    },
    {
      namePrefix: "Câble H07RNF",
      nameSuffix: "Souple",
      descriptionTemplate: "Câble souple H07RNF pour usage extérieur et industriel. Résistant aux huiles et intempéries. Gaine néoprène haute résistance. Utilisation chantier et machines.",
      categoryHandle: "cables-souples",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Section",
      optionValues: ["3G1.5mm² 25m", "3G2.5mm² 25m", "3G4mm² 25m", "5G2.5mm² 25m"],
      priceRange: { min: 4500, max: 18000 },
      skuPrefix: "H07RNF-",
      imageKeywords: ["cable", "flexible", "rubber"],
      hsCode: "8544.49",
      weight: 6000,
      productType: "Câble Électrique",
    },
    {
      namePrefix: "Fil H07VU",
      nameSuffix: "Rigide",
      descriptionTemplate: "Fil de câblage rigide H07VU pour tableau électrique et boîtes de dérivation. Conforme NF C 32-201. Isolation PVC, conducteur cuivre plein.",
      categoryHandle: "fils-cablage",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Section/Couleur",
      optionValues: ["1.5mm² Rouge 100m", "1.5mm² Bleu 100m", "2.5mm² Rouge 100m", "2.5mm² Bleu 100m", "6mm² Vert/Jaune 100m"],
      priceRange: { min: 1500, max: 8000 },
      skuPrefix: "H07VU-",
      imageKeywords: ["wire", "electrical", "copper"],
      hsCode: "8544.49",
      weight: 3000,
      productType: "Câble Électrique",
    },
    // Appareillage
    {
      namePrefix: "Interrupteur Va-et-Vient",
      nameSuffix: "Blanc",
      descriptionTemplate: "Interrupteur va-et-vient 10A 250V. Mécanisme silencieux, contacts argent. Installation encastrée, fixation à vis ou griffes. Finition mate anti-traces.",
      categoryHandle: "interrupteurs",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand", "hager"],
      optionName: "Gamme",
      optionValues: ["Odace", "Céliane", "Mosaic", "Systo"],
      priceRange: { min: 500, max: 2500 },
      skuPrefix: "INT-VV-",
      imageKeywords: ["switch", "electrical", "white"],
      hsCode: "8536.50",
      weight: 100,
      productType: "Appareillage Électrique",
    },
    {
      namePrefix: "Prise 2P+T",
      nameSuffix: "16A",
      descriptionTemplate: "Prise de courant 2P+T 16A 250V avec terre. Obturateurs de sécurité enfant. Bornes automatiques ou à vis. Installation encastrée standard.",
      categoryHandle: "prises-electriques",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand", "hager"],
      optionName: "Gamme",
      optionValues: ["Odace", "Céliane", "Mosaic", "Systo", "Dooxie"],
      priceRange: { min: 400, max: 2000 },
      skuPrefix: "PRISE-",
      imageKeywords: ["outlet", "socket", "electrical"],
      hsCode: "8536.69",
      weight: 80,
      productType: "Appareillage Électrique",
    },
    {
      namePrefix: "Double Prise USB",
      nameSuffix: "Type A+C",
      descriptionTemplate: "Double prise USB Type-A et Type-C intégrée. Puissance 3A max, charge rapide compatible. Installation dans boîte d'encastrement standard.",
      categoryHandle: "prises-electriques",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Gamme",
      optionValues: ["Odace", "Céliane", "Mosaic"],
      priceRange: { min: 2500, max: 5000 },
      skuPrefix: "USB-",
      imageKeywords: ["usb", "charger", "outlet"],
      hsCode: "8536.69",
      weight: 90,
      productType: "Appareillage Électrique",
    },
    {
      namePrefix: "Variateur LED",
      nameSuffix: "Universel",
      descriptionTemplate: "Variateur rotatif universel LED 3-400W. Compatible ampoules LED dimmables, halogènes et incandescentes. Minimum dimming 3%. Silencieux.",
      categoryHandle: "variateurs",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Gamme",
      optionValues: ["Odace", "Céliane", "Mosaic"],
      priceRange: { min: 3500, max: 7000 },
      skuPrefix: "VAR-",
      imageKeywords: ["dimmer", "switch", "led"],
      hsCode: "8536.50",
      weight: 120,
      productType: "Appareillage Électrique",
    },
    // Tableau électrique
    {
      namePrefix: "Disjoncteur Modulaire",
      nameSuffix: "Phase+Neutre",
      descriptionTemplate: "Disjoncteur modulaire P+N courbe C. Pouvoir de coupure 6kA. Visualisation de l'état par voyant. Conforme NF EN 60898-1.",
      categoryHandle: "disjoncteurs",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand", "hager"],
      optionName: "Calibre",
      optionValues: ["10A", "16A", "20A", "25A", "32A"],
      priceRange: { min: 800, max: 2500 },
      skuPrefix: "DJ-",
      imageKeywords: ["circuit", "breaker", "electrical"],
      hsCode: "8536.20",
      weight: 150,
      productType: "Tableau Électrique",
    },
    {
      namePrefix: "Interrupteur Différentiel",
      nameSuffix: "Type AC",
      descriptionTemplate: "Interrupteur différentiel 30mA type AC. Protection des personnes contre les contacts indirects. Bouton test et voyant de défaut.",
      categoryHandle: "differentiels",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand", "hager"],
      optionName: "Configuration",
      optionValues: ["2P 40A", "2P 63A", "4P 40A", "4P 63A"],
      priceRange: { min: 3500, max: 8000 },
      skuPrefix: "DIFF-",
      imageKeywords: ["rcd", "safety", "electrical"],
      hsCode: "8536.30",
      weight: 250,
      productType: "Tableau Électrique",
    },
    {
      namePrefix: "Coffret Électrique",
      nameSuffix: "Encastré",
      descriptionTemplate: "Coffret électrique encastré avec porte opaque. Rails DIN, borniers terre et neutre inclus. IP30. Conforme NF C 15-100.",
      categoryHandle: "coffrets-electriques",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand", "hager"],
      optionName: "Modules",
      optionValues: ["1 rangée 13M", "2 rangées 26M", "3 rangées 39M", "4 rangées 52M"],
      priceRange: { min: 2500, max: 12000 },
      skuPrefix: "COFF-",
      imageKeywords: ["panel", "electrical", "box"],
      hsCode: "8537.10",
      weight: 2000,
      productType: "Tableau Électrique",
    },
    // Éclairage
    {
      namePrefix: "Ampoule LED E27",
      nameSuffix: "",
      descriptionTemplate: "Ampoule LED standard E27. Équivalent halogène, faible consommation. Allumage instantané, pas de mercure. Durée de vie 15000 heures.",
      categoryHandle: "ampoules-led",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Puissance/Température",
      optionValues: ["9W 2700K", "9W 4000K", "12W 2700K", "12W 4000K", "15W 4000K"],
      priceRange: { min: 300, max: 1200 },
      skuPrefix: "LED-E27-",
      imageKeywords: ["bulb", "led", "light"],
      hsCode: "8539.50",
      weight: 50,
      productType: "Éclairage",
    },
    {
      namePrefix: "Tube LED T8",
      nameSuffix: "",
      descriptionTemplate: "Tube LED T8 remplacement direct tube fluo. Installation sur réglette existante avec starter LED. Rotation 330 degrés.",
      categoryHandle: "tubes-led",
      rootCategory: "electricite",
      brands: ["schneider-electric"],
      optionName: "Longueur/Puissance",
      optionValues: ["60cm 10W", "120cm 18W", "150cm 22W"],
      priceRange: { min: 800, max: 2500 },
      skuPrefix: "TUBE-",
      imageKeywords: ["tube", "led", "fluorescent"],
      hsCode: "8539.50",
      weight: 200,
      productType: "Éclairage",
    },
    {
      namePrefix: "Projecteur LED Chantier",
      nameSuffix: "",
      descriptionTemplate: "Projecteur LED de chantier sur pied télescopique. IP65 résistant aux projections d'eau. Poignée de transport, câble 3m.",
      categoryHandle: "projecteurs",
      rootCategory: "electricite",
      brands: ["schneider-electric"],
      optionName: "Puissance",
      optionValues: ["20W", "30W", "50W", "100W"],
      priceRange: { min: 2500, max: 12000 },
      skuPrefix: "PROJ-",
      imageKeywords: ["floodlight", "construction", "led"],
      hsCode: "9405.40",
      weight: 3000,
      productType: "Éclairage",
    },
    {
      namePrefix: "Réglette LED Étanche",
      nameSuffix: "IP65",
      descriptionTemplate: "Réglette LED étanche IP65 pour garage, atelier, cave. Diffuseur polycarbonate anti-chocs. Fixation murale ou plafond.",
      categoryHandle: "reglettes",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Longueur/Puissance",
      optionValues: ["60cm 18W", "120cm 36W", "150cm 50W"],
      priceRange: { min: 2000, max: 6000 },
      skuPrefix: "REGL-",
      imageKeywords: ["fixture", "led", "waterproof"],
      hsCode: "9405.40",
      weight: 800,
      productType: "Éclairage",
    },
    // Gaines
    {
      namePrefix: "Gaine ICTA",
      nameSuffix: "Préfilé",
      descriptionTemplate: "Gaine ICTA préfilé avec aiguille tire-fil. Double paroi pour faciliter le passage des câbles. Conforme NF C 68-171.",
      categoryHandle: "gaines-icta",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Diamètre/Longueur",
      optionValues: ["D16 25m", "D20 25m", "D16 50m", "D20 50m", "D25 50m"],
      priceRange: { min: 1500, max: 5000 },
      skuPrefix: "ICTA-",
      imageKeywords: ["conduit", "cable", "tube"],
      hsCode: "3917.32",
      weight: 2000,
      productType: "Câble Électrique",
    },
    {
      namePrefix: "Tube IRL",
      nameSuffix: "Rigide",
      descriptionTemplate: "Tube IRL rigide pour installation apparente. Autoextinguible, résistant aux UV. Raccords à clipser disponibles.",
      categoryHandle: "tubes-irl",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Diamètre",
      optionValues: ["D16 3m", "D20 3m", "D25 3m", "D32 3m"],
      priceRange: { min: 200, max: 800 },
      skuPrefix: "IRL-",
      imageKeywords: ["tube", "conduit", "rigid"],
      hsCode: "3917.32",
      weight: 500,
      productType: "Câble Électrique",
    },
    {
      namePrefix: "Moulure PVC",
      nameSuffix: "avec Cloison",
      descriptionTemplate: "Moulure PVC avec cloison de séparation. Finition lisse, clips de maintien. Idéal passage câbles informatique et électrique.",
      categoryHandle: "moulures",
      rootCategory: "electricite",
      brands: ["schneider-electric", "legrand"],
      optionName: "Dimensions",
      optionValues: ["20x12mm 2m", "32x12mm 2m", "40x16mm 2m", "60x25mm 2m"],
      priceRange: { min: 300, max: 1500 },
      skuPrefix: "MOUL-",
      imageKeywords: ["trunking", "cable", "management"],
      hsCode: "3925.90",
      weight: 400,
      productType: "Câble Électrique",
    },

    // =========== PLOMBERIE ===========
    // Tuyauterie
    {
      namePrefix: "Tube PER",
      nameSuffix: "Nu",
      descriptionTemplate: "Tube PER (polyéthylène réticulé) pour eau chaude et froide. Pression max 6 bars, température max 60°C. Souple et facile à installer.",
      categoryHandle: "tubes-per",
      rootCategory: "plomberie",
      brands: ["grohe", "geberit"],
      optionName: "Diamètre/Longueur",
      optionValues: ["D12 25m Rouge", "D12 25m Bleu", "D16 25m Rouge", "D16 25m Bleu", "D20 25m"],
      priceRange: { min: 2000, max: 8000 },
      skuPrefix: "PER-",
      imageKeywords: ["pipe", "pex", "plumbing"],
      hsCode: "3917.32",
      weight: 3000,
      productType: "Tuyauterie",
    },
    {
      namePrefix: "Tube Multicouche",
      nameSuffix: "Alu/PER",
      descriptionTemplate: "Tube multicouche aluminium/PER pour chauffage et sanitaire. Couche alu soudée laser, barrière anti-oxygène. Pression 10 bars.",
      categoryHandle: "tubes-multicouche",
      rootCategory: "plomberie",
      brands: ["geberit"],
      optionName: "Diamètre/Longueur",
      optionValues: ["D16 50m", "D20 50m", "D26 25m", "D32 25m"],
      priceRange: { min: 5000, max: 18000 },
      skuPrefix: "MLC-",
      imageKeywords: ["multilayer", "pipe", "aluminum"],
      hsCode: "3917.32",
      weight: 5000,
      productType: "Tuyauterie",
    },
    {
      namePrefix: "Tube Cuivre",
      nameSuffix: "Écroui",
      descriptionTemplate: "Tube cuivre écroui pour installation sanitaire et chauffage. Conforme NF EN 1057. Brasage ou sertissage. Qualité professionnelle.",
      categoryHandle: "tubes-cuivre",
      rootCategory: "plomberie",
      brands: ["geberit"],
      optionName: "Diamètre/Longueur",
      optionValues: ["D12 5m", "D14 5m", "D16 5m", "D18 5m", "D22 5m"],
      priceRange: { min: 3000, max: 15000 },
      skuPrefix: "CU-",
      imageKeywords: ["copper", "pipe", "tube"],
      hsCode: "7411.10",
      weight: 4000,
      productType: "Tuyauterie",
    },
    {
      namePrefix: "Tube PVC Évacuation",
      nameSuffix: "M1",
      descriptionTemplate: "Tube PVC évacuation diamètre 40 à 100mm. Classement M1, auto-extinguible. Assemblage par collage. Conforme NF EN 1329-1.",
      categoryHandle: "tubes-pvc",
      rootCategory: "plomberie",
      brands: ["geberit"],
      optionName: "Diamètre",
      optionValues: ["D40 4m", "D50 4m", "D63 4m", "D80 4m", "D100 4m"],
      priceRange: { min: 500, max: 3000 },
      skuPrefix: "PVC-",
      imageKeywords: ["pvc", "drain", "pipe"],
      hsCode: "3917.23",
      weight: 2000,
      productType: "Tuyauterie",
    },
    // Raccords
    {
      namePrefix: "Raccord à Sertir",
      nameSuffix: "Multicouche",
      descriptionTemplate: "Raccord à sertir pour tube multicouche. Corps laiton dézincification résistant. Joint EPDM intégré. Sertissage radial.",
      categoryHandle: "raccords-sertir",
      rootCategory: "plomberie",
      brands: ["geberit"],
      optionName: "Type/Diamètre",
      optionValues: ["Coude 16", "Té 16", "Manchon 16", "Coude 20", "Té 20", "Manchon 20"],
      priceRange: { min: 300, max: 2000 },
      skuPrefix: "RS-",
      imageKeywords: ["fitting", "press", "brass"],
      hsCode: "7412.20",
      weight: 100,
      productType: "Raccord",
    },
    {
      namePrefix: "Raccord Laiton",
      nameSuffix: "Mâle/Femelle",
      descriptionTemplate: "Raccord laiton fileté pour installation cuivre et acier. Filetage conforme ISO 228. Étanchéité par filasse ou téflon.",
      categoryHandle: "raccords-laiton",
      rootCategory: "plomberie",
      brands: ["grohe", "geberit"],
      optionName: "Type/Filetage",
      optionValues: ["Coude M/F 1/2", "Coude M/F 3/4", "Té F/F/F 1/2", "Manchon F/F 1/2", "Mamelon M/M 1/2"],
      priceRange: { min: 150, max: 1000 },
      skuPrefix: "RL-",
      imageKeywords: ["brass", "fitting", "threaded"],
      hsCode: "7412.20",
      weight: 80,
      productType: "Raccord",
    },
    {
      namePrefix: "Raccord PVC",
      nameSuffix: "à Coller",
      descriptionTemplate: "Raccord PVC évacuation à coller. Conforme NF EN 1329-1. Assemblage par collage solvant. Résistant aux effluents domestiques.",
      categoryHandle: "raccords-pvc",
      rootCategory: "plomberie",
      brands: ["geberit"],
      optionName: "Type/Diamètre",
      optionValues: ["Coude 87° D40", "Coude 45° D40", "Té D40", "Coude 87° D50", "Té D50"],
      priceRange: { min: 100, max: 600 },
      skuPrefix: "RPVC-",
      imageKeywords: ["pvc", "fitting", "drain"],
      hsCode: "3917.40",
      weight: 50,
      productType: "Raccord",
    },
    // Robinetterie
    {
      namePrefix: "Mitigeur Évier",
      nameSuffix: "Bec Haut",
      descriptionTemplate: "Mitigeur cuisine bec haut orientable. Cartouche céramique 35mm, aérateur anti-calcaire. Finition chrome brillant.",
      categoryHandle: "mitigeurs",
      rootCategory: "plomberie",
      brands: ["grohe", "hansgrohe", "roca"],
      optionName: "Modèle",
      optionValues: ["Classic Chrome", "Modern Chrome", "Douchette extractible", "Bec U"],
      priceRange: { min: 5000, max: 25000 },
      skuPrefix: "MIG-EV-",
      imageKeywords: ["faucet", "kitchen", "mixer"],
      hsCode: "8481.80",
      weight: 1500,
      productType: "Robinetterie",
    },
    {
      namePrefix: "Mitigeur Lavabo",
      nameSuffix: "",
      descriptionTemplate: "Mitigeur lavabo monocommande. Cartouche céramique, limiteur de débit. Vidage clic-clac inclus. Fixation tige filetée.",
      categoryHandle: "mitigeurs",
      rootCategory: "plomberie",
      brands: ["grohe", "hansgrohe", "roca"],
      optionName: "Hauteur/Finition",
      optionValues: ["Standard Chrome", "Rehaussé Chrome", "Cascade Chrome", "Standard Noir mat"],
      priceRange: { min: 4000, max: 20000 },
      skuPrefix: "MIG-LV-",
      imageKeywords: ["faucet", "basin", "mixer"],
      hsCode: "8481.80",
      weight: 1200,
      productType: "Robinetterie",
    },
    {
      namePrefix: "Colonne de Douche",
      nameSuffix: "Thermostatique",
      descriptionTemplate: "Colonne de douche thermostatique avec douchette et pomme haute. Sécurité anti-brûlure 38°C. Flexible 150cm inclus.",
      categoryHandle: "colonnes-douche",
      rootCategory: "plomberie",
      brands: ["grohe", "hansgrohe"],
      optionName: "Modèle",
      optionValues: ["Rond Chrome", "Carré Chrome", "Rond Noir", "Carré Noir"],
      priceRange: { min: 15000, max: 50000 },
      skuPrefix: "COL-",
      imageKeywords: ["shower", "column", "rain"],
      hsCode: "8481.80",
      weight: 5000,
      productType: "Robinetterie",
    },
    {
      namePrefix: "Robinet d'Arrêt",
      nameSuffix: "Équerre",
      descriptionTemplate: "Robinet d'arrêt équerre pour raccordement appareil sanitaire. 1/4 de tour céramique. Entrée 1/2\", sortie 3/8\".",
      categoryHandle: "robinets-arret",
      rootCategory: "plomberie",
      brands: ["grohe", "geberit"],
      optionName: "Type",
      optionValues: ["1/4 tour Chrome", "Volant Chrome", "1/4 tour Laiton"],
      priceRange: { min: 800, max: 3000 },
      skuPrefix: "RA-",
      imageKeywords: ["valve", "stop", "angle"],
      hsCode: "8481.80",
      weight: 200,
      productType: "Robinetterie",
    },
    // Sanitaire
    {
      namePrefix: "Pack WC",
      nameSuffix: "Suspendu",
      descriptionTemplate: "Pack WC suspendu complet avec cuvette, abattant frein de chute et bâti-support. Chasse double touche 3/6L. Gain de place et nettoyage facile.",
      categoryHandle: "wc-reservoirs",
      rootCategory: "plomberie",
      brands: ["geberit", "roca"],
      optionName: "Configuration",
      optionValues: ["Bâti court", "Bâti standard", "Bâti autoportant"],
      priceRange: { min: 25000, max: 80000 },
      skuPrefix: "WC-SUSP-",
      imageKeywords: ["toilet", "wall", "hung"],
      hsCode: "6910.10",
      weight: 25000,
      productType: "Sanitaire",
    },
    {
      namePrefix: "Cuvette WC",
      nameSuffix: "à Poser",
      descriptionTemplate: "Cuvette WC à poser sortie horizontale. Céramique vitrifiée, fixation au sol. Sans bride pour hygiène optimale.",
      categoryHandle: "wc-reservoirs",
      rootCategory: "plomberie",
      brands: ["geberit", "roca"],
      optionName: "Type",
      optionValues: ["Standard", "Sans bride", "Compact"],
      priceRange: { min: 8000, max: 25000 },
      skuPrefix: "WC-POS-",
      imageKeywords: ["toilet", "floor", "standing"],
      hsCode: "6910.10",
      weight: 20000,
      productType: "Sanitaire",
    },
    {
      namePrefix: "Lavabo Céramique",
      nameSuffix: "",
      descriptionTemplate: "Lavabo céramique avec trop-plein. Perçage robinetterie centrale. Fixation murale ou sur meuble. Finition blanc brillant.",
      categoryHandle: "lavabos",
      rootCategory: "plomberie",
      brands: ["roca", "geberit"],
      optionName: "Largeur",
      optionValues: ["45cm", "55cm", "60cm", "65cm"],
      priceRange: { min: 4000, max: 15000 },
      skuPrefix: "LAV-",
      imageKeywords: ["basin", "sink", "ceramic"],
      hsCode: "6910.10",
      weight: 8000,
      productType: "Sanitaire",
    },
    {
      namePrefix: "Baignoire Acrylique",
      nameSuffix: "Rectangulaire",
      descriptionTemplate: "Baignoire acrylique rectangulaire renforcée fibre de verre. Capacité 180L. Pieds réglables inclus. Garantie 10 ans.",
      categoryHandle: "baignoires",
      rootCategory: "plomberie",
      brands: ["roca"],
      optionName: "Dimensions",
      optionValues: ["150x70cm", "160x70cm", "170x70cm", "170x75cm", "180x80cm"],
      priceRange: { min: 15000, max: 45000 },
      skuPrefix: "BAIG-",
      imageKeywords: ["bathtub", "acrylic", "bath"],
      hsCode: "3922.10",
      weight: 25000,
      productType: "Sanitaire",
    },
    // Évacuation
    {
      namePrefix: "Siphon Lavabo",
      nameSuffix: "à Culot",
      descriptionTemplate: "Siphon lavabo à culot démontable. Hauteur réglable, débit 30L/min. Raccordement D32. Démontage facile pour entretien.",
      categoryHandle: "siphons",
      rootCategory: "plomberie",
      brands: ["geberit"],
      optionName: "Type",
      optionValues: ["Laiton Chrome", "ABS Blanc", "ABS Chrome"],
      priceRange: { min: 800, max: 3500 },
      skuPrefix: "SIPH-",
      imageKeywords: ["trap", "drain", "siphon"],
      hsCode: "3922.90",
      weight: 300,
      productType: "Sanitaire",
    },
    {
      namePrefix: "Bonde Douche",
      nameSuffix: "Extraplate",
      descriptionTemplate: "Bonde de douche extraplate hauteur 50mm. Grille inox, débit 40L/min. Compatible receveur extra-plat. Nettoyage par le haut.",
      categoryHandle: "bondes",
      rootCategory: "plomberie",
      brands: ["geberit", "grohe"],
      optionName: "Diamètre",
      optionValues: ["D60", "D90", "D90 carré"],
      priceRange: { min: 2500, max: 8000 },
      skuPrefix: "BOND-",
      imageKeywords: ["drain", "shower", "grate"],
      hsCode: "3922.90",
      weight: 400,
      productType: "Sanitaire",
    },

    // =========== OUTILLAGE ===========
    // Électroportatif
    {
      namePrefix: "Perceuse-Visseuse",
      nameSuffix: "Sans Fil",
      descriptionTemplate: "Perceuse-visseuse sans fil brushless. Mandrin métal 13mm, couple max élevé. 2 vitesses, variateur de vitesse. Éclairage LED intégré.",
      categoryHandle: "perceuses-visseuses",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "makita", "milwaukee"],
      optionName: "Voltage/Batterie",
      optionValues: ["12V 2Ah", "18V 2Ah", "18V 4Ah", "18V 5Ah", "18V Machine seule"],
      priceRange: { min: 8000, max: 35000 },
      skuPrefix: "PV-",
      imageKeywords: ["drill", "cordless", "power"],
      hsCode: "8467.21",
      weight: 2000,
      productType: "Outillage Électroportatif",
    },
    {
      namePrefix: "Perforateur",
      nameSuffix: "SDS-Plus",
      descriptionTemplate: "Perforateur SDS-Plus 3 modes: percussion, rotation, burinage. Système anti-vibration. Mandrin SDS-Plus. Idéal béton et maçonnerie.",
      categoryHandle: "perforateurs",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "makita", "hilti"],
      optionName: "Configuration",
      optionValues: ["800W Filaire", "18V 4Ah", "18V 5Ah", "36V 4Ah"],
      priceRange: { min: 15000, max: 60000 },
      skuPrefix: "PERF-",
      imageKeywords: ["hammer", "drill", "sds"],
      hsCode: "8467.21",
      weight: 3500,
      productType: "Outillage Électroportatif",
    },
    {
      namePrefix: "Meuleuse",
      nameSuffix: "125mm",
      descriptionTemplate: "Meuleuse d'angle 125mm moteur puissant. Démarrage progressif, protection anti-redémarrage. Carter de protection réglable.",
      categoryHandle: "meuleuses",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "makita", "metabo"],
      optionName: "Configuration",
      optionValues: ["1000W Filaire", "1400W Filaire", "18V 4Ah", "18V 5Ah"],
      priceRange: { min: 6000, max: 28000 },
      skuPrefix: "MEUL-",
      imageKeywords: ["grinder", "angle", "disc"],
      hsCode: "8467.29",
      weight: 2500,
      productType: "Outillage Électroportatif",
    },
    {
      namePrefix: "Scie Circulaire",
      nameSuffix: "",
      descriptionTemplate: "Scie circulaire professionnelle. Guide laser, système d'aspiration. Lame carbure incluse. Profondeur de coupe réglable.",
      categoryHandle: "scies-electriques",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "makita"],
      optionName: "Configuration",
      optionValues: ["1400W D190mm", "1600W D235mm", "18V D165mm", "36V D190mm"],
      priceRange: { min: 12000, max: 45000 },
      skuPrefix: "SCIR-",
      imageKeywords: ["circular", "saw", "wood"],
      hsCode: "8467.22",
      weight: 4000,
      productType: "Outillage Électroportatif",
    },
    {
      namePrefix: "Scie Sauteuse",
      nameSuffix: "",
      descriptionTemplate: "Scie sauteuse professionnelle mouvement pendulaire. Variateur de vitesse, changement de lame rapide. Coupe bois et métal.",
      categoryHandle: "scies-electriques",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "makita"],
      optionName: "Configuration",
      optionValues: ["700W Filaire", "800W Filaire", "18V 2Ah", "18V 4Ah"],
      priceRange: { min: 8000, max: 30000 },
      skuPrefix: "SAUT-",
      imageKeywords: ["jigsaw", "saw", "cutting"],
      hsCode: "8467.29",
      weight: 2200,
      productType: "Outillage Électroportatif",
    },
    {
      namePrefix: "Visseuse à Chocs",
      nameSuffix: "",
      descriptionTemplate: "Visseuse à chocs compacte sans fil. Couple élevé, moteur brushless. Idéal vissage long et boulonnage. 3 modes de vitesse.",
      categoryHandle: "visseuses-chocs",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "makita", "milwaukee"],
      optionName: "Voltage/Batterie",
      optionValues: ["12V 2Ah", "18V 2Ah", "18V 4Ah", "18V 5Ah"],
      priceRange: { min: 10000, max: 35000 },
      skuPrefix: "VISC-",
      imageKeywords: ["impact", "driver", "cordless"],
      hsCode: "8467.29",
      weight: 1500,
      productType: "Outillage Électroportatif",
    },
    // Outillage à main
    {
      namePrefix: "Jeu de Tournevis",
      nameSuffix: "Professionnel",
      descriptionTemplate: "Jeu de tournevis professionnel acier chrome-vanadium. Poignée bi-matière ergonomique. Lames magnétiques. Embouts PH, PZ, plat, Torx.",
      categoryHandle: "tournevis",
      rootCategory: "outillage",
      brands: ["stanley", "facom", "wiha"],
      optionName: "Configuration",
      optionValues: ["6 pièces", "10 pièces", "12 pièces", "18 pièces"],
      priceRange: { min: 1500, max: 8000 },
      skuPrefix: "TV-",
      imageKeywords: ["screwdriver", "tool", "set"],
      hsCode: "8205.40",
      weight: 800,
      productType: "Outillage à Main",
    },
    {
      namePrefix: "Jeu de Clés",
      nameSuffix: "Mixtes",
      descriptionTemplate: "Jeu de clés mixtes plates/oeil. Chrome-vanadium poli miroir. Angles 15° pour accès difficile. Trousse de rangement incluse.",
      categoryHandle: "cles",
      rootCategory: "outillage",
      brands: ["facom", "bahco", "stanley"],
      optionName: "Configuration",
      optionValues: ["8-19mm 12 pièces", "6-22mm 17 pièces", "6-32mm 22 pièces"],
      priceRange: { min: 4000, max: 20000 },
      skuPrefix: "CLE-",
      imageKeywords: ["wrench", "spanner", "set"],
      hsCode: "8204.11",
      weight: 2000,
      productType: "Outillage a Main",
    },
    {
      namePrefix: "Pince Multiprise",
      nameSuffix: "",
      descriptionTemplate: "Pince multiprise a cremaillere. Machoires paralleles, capacite d'ouverture elevee. Acier chrome-vanadium. Poignees bi-matiere.",
      categoryHandle: "pinces",
      rootCategory: "outillage",
      brands: ["knipex", "facom", "bahco"],
      optionName: "Longueur",
      optionValues: ["180mm", "250mm", "300mm"],
      priceRange: { min: 2000, max: 6000 },
      skuPrefix: "PM-",
      imageKeywords: ["pliers", "adjustable", "grip"],
      hsCode: "8203.20",
      weight: 350,
      productType: "Outillage a Main",
    },
    {
      namePrefix: "Pince Coupante",
      nameSuffix: "Diagonale",
      descriptionTemplate: "Pince coupante diagonale professionnelle. Tranchant inductionné longue durée. Ressort d'ouverture. Pour fil cuivre et acier.",
      categoryHandle: "pinces",
      rootCategory: "outillage",
      brands: ["knipex", "facom", "bahco"],
      optionName: "Longueur",
      optionValues: ["140mm", "160mm", "180mm", "200mm"],
      priceRange: { min: 1500, max: 4500 },
      skuPrefix: "PC-",
      imageKeywords: ["cutter", "pliers", "diagonal"],
      hsCode: "8203.20",
      weight: 200,
      productType: "Outillage a Main",
    },
    {
      namePrefix: "Marteau Menuisier",
      nameSuffix: "",
      descriptionTemplate: "Marteau de menuisier manche fibre triple injection. Tete acier traite, arrache-clou magnetique. Equilibrage optimal.",
      categoryHandle: "marteaux",
      rootCategory: "outillage",
      brands: ["stanley", "facom"],
      optionName: "Poids",
      optionValues: ["450g", "570g", "750g"],
      priceRange: { min: 1500, max: 4000 },
      skuPrefix: "MART-",
      imageKeywords: ["hammer", "claw", "carpenter"],
      hsCode: "8205.20",
      weight: 600,
      productType: "Outillage a Main",
    },
    // Mesure
    {
      namePrefix: "Metre Ruban",
      nameSuffix: "Professionnel",
      descriptionTemplate: "Metre ruban professionnel boitier bi-matiere. Ruban laque anti-reflet, crochet mobile. Blocage du ruban. Clip ceinture.",
      categoryHandle: "metres-regles",
      rootCategory: "outillage",
      brands: ["stanley", "facom"],
      optionName: "Longueur",
      optionValues: ["3m", "5m", "8m", "10m"],
      priceRange: { min: 800, max: 3500 },
      skuPrefix: "MET-",
      imageKeywords: ["tape", "measure", "ruler"],
      hsCode: "9017.80",
      weight: 300,
      productType: "Materiel de Mesure",
    },
    {
      namePrefix: "Niveau a Bulle",
      nameSuffix: "Aluminium",
      descriptionTemplate: "Niveau a bulle aluminium profile en I. 3 fioles precision 0.5mm/m. Embouts antichocs. Poignee ergonomique.",
      categoryHandle: "niveaux",
      rootCategory: "outillage",
      brands: ["stanley", "bosch"],
      optionName: "Longueur",
      optionValues: ["40cm", "60cm", "80cm", "100cm", "120cm"],
      priceRange: { min: 1500, max: 6000 },
      skuPrefix: "NIV-",
      imageKeywords: ["level", "spirit", "aluminum"],
      hsCode: "9015.80",
      weight: 800,
      productType: "Materiel de Mesure",
    },
    {
      namePrefix: "Laser Lignes",
      nameSuffix: "Auto-nivelant",
      descriptionTemplate: "Laser lignes auto-nivelant. Lignes horizontale et verticale croisees. Portee avec cellule. Support mural et trepied inclus.",
      categoryHandle: "lasers-mesure",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "hilti"],
      optionName: "Configuration",
      optionValues: ["2 lignes vert", "3 lignes vert", "2 lignes rouge", "360° vert"],
      priceRange: { min: 8000, max: 45000 },
      skuPrefix: "LAS-",
      imageKeywords: ["laser", "level", "line"],
      hsCode: "9015.40",
      weight: 500,
      productType: "Materiel de Mesure",
    },
    {
      namePrefix: "Telemetre Laser",
      nameSuffix: "",
      descriptionTemplate: "Telemetre laser professionnel. Mesure distance, surface, volume. Memoire des mesures. Fonction Pythagore. Ecran retro-eclaire.",
      categoryHandle: "telemetres",
      rootCategory: "outillage",
      brands: ["bosch", "hilti"],
      optionName: "Portee",
      optionValues: ["30m", "50m", "80m", "120m"],
      priceRange: { min: 5000, max: 35000 },
      skuPrefix: "TEL-",
      imageKeywords: ["laser", "distance", "meter"],
      hsCode: "9031.80",
      weight: 200,
      productType: "Materiel de Mesure",
    },
    // Consommables
    {
      namePrefix: "Coffret Forets",
      nameSuffix: "Multi-Materiaux",
      descriptionTemplate: "Coffret de forets multi-materiaux carbure de tungstene. Beton, brique, carrelage, metal, bois. Pointe 4 tranchants.",
      categoryHandle: "forets",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "hilti"],
      optionName: "Configuration",
      optionValues: ["5 pieces 4-10mm", "7 pieces 4-12mm", "10 pieces 3-12mm"],
      priceRange: { min: 2500, max: 8000 },
      skuPrefix: "FOR-",
      imageKeywords: ["drill", "bit", "set"],
      hsCode: "8207.50",
      weight: 500,
      productType: "Consommable Outillage",
    },
    {
      namePrefix: "Disques a Tronconner",
      nameSuffix: "Inox",
      descriptionTemplate: "Disques a tronconner inox et metal 125x1mm. Sans fer pour inox, coupe fine et rapide. Lot de 10 disques. 12000 tr/min max.",
      categoryHandle: "disques",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt"],
      optionName: "Quantite",
      optionValues: ["10 disques", "25 disques", "50 disques"],
      priceRange: { min: 1000, max: 4500 },
      skuPrefix: "DISC-",
      imageKeywords: ["cutting", "disc", "grinder"],
      hsCode: "6804.22",
      weight: 400,
      productType: "Consommable Outillage",
    },
    {
      namePrefix: "Lame Scie Circulaire",
      nameSuffix: "Carbure",
      descriptionTemplate: "Lame de scie circulaire carbure. Dents alternees pour coupe nette bois massif et derives. Alesage standard.",
      categoryHandle: "lames-scie",
      rootCategory: "outillage",
      brands: ["bosch", "dewalt", "makita"],
      optionName: "Dimensions/Dents",
      optionValues: ["165mm 24 dents", "190mm 24 dents", "190mm 48 dents", "235mm 40 dents"],
      priceRange: { min: 1500, max: 6000 },
      skuPrefix: "LAME-",
      imageKeywords: ["blade", "saw", "circular"],
      hsCode: "8202.39",
      weight: 400,
      productType: "Consommable Outillage",
    },
    // Rangement
    {
      namePrefix: "Caisse à Outils",
      nameSuffix: "",
      descriptionTemplate: "Caisse à outils professionnelle polypropylène. Plateau amovible, organiseurs. Poignée ergonomique, fermetures métal.",
      categoryHandle: "caisses-outils",
      rootCategory: "outillage",
      brands: ["stanley", "dewalt"],
      optionName: "Taille",
      optionValues: ["16\"", "19\"", "24\""],
      priceRange: { min: 2500, max: 8000 },
      skuPrefix: "CAIS-",
      imageKeywords: ["toolbox", "storage", "case"],
      hsCode: "4202.92",
      weight: 2500,
      productType: "Rangement Outillage",
    },
    {
      namePrefix: "Servante d'Atelier",
      nameSuffix: "",
      descriptionTemplate: "Servante d'atelier 6 tiroirs sur roulettes. Structure acier, plan de travail bois. Tiroirs sur glissières à billes. Serrure centralisée.",
      categoryHandle: "servantes",
      rootCategory: "outillage",
      brands: ["facom", "stanley"],
      optionName: "Configuration",
      optionValues: ["6 tiroirs", "7 tiroirs", "6 tiroirs + armoire"],
      priceRange: { min: 35000, max: 120000 },
      skuPrefix: "SERV-",
      imageKeywords: ["cabinet", "tool", "cart"],
      hsCode: "9403.20",
      weight: 50000,
      productType: "Rangement Outillage",
    },

    // =========== CHAUFFAGE CLIMATISATION ===========
    {
      namePrefix: "Radiateur Inertie",
      nameSuffix: "Fluide",
      descriptionTemplate: "Radiateur électrique à inertie fluide caloporteur. Programmation hebdomadaire, détecteur de présence. Classe II. NF Électricité Performance.",
      categoryHandle: "radiateurs-inertie",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic", "thermor"],
      optionName: "Puissance",
      optionValues: ["750W", "1000W", "1500W", "2000W"],
      priceRange: { min: 25000, max: 60000 },
      skuPrefix: "RAD-IF-",
      imageKeywords: ["radiator", "electric", "heater"],
      hsCode: "8516.29",
      weight: 15000,
      productType: "Chauffage Électrique",
    },
    {
      namePrefix: "Radiateur Inertie",
      nameSuffix: "Pierre",
      descriptionTemplate: "Radiateur à inertie pierre naturelle. Chaleur douce et homogène. Programmation digitale, détection fenêtre ouverte. Garantie 2 ans.",
      categoryHandle: "radiateurs-inertie",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic", "thermor"],
      optionName: "Puissance",
      optionValues: ["1000W", "1500W", "2000W"],
      priceRange: { min: 35000, max: 80000 },
      skuPrefix: "RAD-IP-",
      imageKeywords: ["radiator", "stone", "heating"],
      hsCode: "8516.29",
      weight: 25000,
      productType: "Chauffage Électrique",
    },
    {
      namePrefix: "Convecteur Électrique",
      nameSuffix: "",
      descriptionTemplate: "Convecteur électrique mural. Thermostat mécanique, sélecteur de puissance. Installation simple, fixation murale incluse.",
      categoryHandle: "convecteurs",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic", "thermor"],
      optionName: "Puissance",
      optionValues: ["500W", "1000W", "1500W", "2000W"],
      priceRange: { min: 3000, max: 10000 },
      skuPrefix: "CONV-",
      imageKeywords: ["convector", "heater", "electric"],
      hsCode: "8516.29",
      weight: 5000,
      productType: "Chauffage Électrique",
    },
    {
      namePrefix: "Panneau Rayonnant",
      nameSuffix: "",
      descriptionTemplate: "Panneau rayonnant infrarouge lointain. Chaleur immédiate, faible inertie. Programmation LCD, détection automatique. Discret et silencieux.",
      categoryHandle: "panneaux-rayonnants",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic", "thermor"],
      optionName: "Puissance",
      optionValues: ["1000W Horizontal", "1500W Horizontal", "1000W Vertical", "1500W Vertical"],
      priceRange: { min: 15000, max: 40000 },
      skuPrefix: "PANN-",
      imageKeywords: ["panel", "radiant", "heater"],
      hsCode: "8516.29",
      weight: 8000,
      productType: "Chauffage Électrique",
    },
    {
      namePrefix: "Radiateur Eau Chaude",
      nameSuffix: "Acier",
      descriptionTemplate: "Radiateur eau chaude acier horizontal. Pression max 10 bars, temp max 110°C. Peinture époxy. Raccordement 1/2\".",
      categoryHandle: "radiateurs-eau-chaude",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic"],
      optionName: "Puissance",
      optionValues: ["600W", "900W", "1200W", "1500W", "2000W"],
      priceRange: { min: 8000, max: 25000 },
      skuPrefix: "RAD-EC-",
      imageKeywords: ["radiator", "water", "steel"],
      hsCode: "7322.90",
      weight: 12000,
      productType: "Chauffage Central",
    },
    {
      namePrefix: "Chaudière Gaz",
      nameSuffix: "Condensation",
      descriptionTemplate: "Chaudière gaz murale condensation. Haut rendement >100%, classe A. Production ECS instantanée ou micro-accumulation. Garantie 5 ans.",
      categoryHandle: "chaudieres-gaz",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic", "daikin"],
      optionName: "Puissance",
      optionValues: ["24kW", "28kW", "35kW"],
      priceRange: { min: 150000, max: 300000 },
      skuPrefix: "CHAUD-",
      imageKeywords: ["boiler", "gas", "condensing"],
      hsCode: "8403.10",
      weight: 35000,
      productType: "Chauffage Central",
    },
    {
      namePrefix: "Tête Thermostatique",
      nameSuffix: "Programmable",
      descriptionTemplate: "Tête thermostatique programmable pour radiateur eau chaude. Programmation hebdomadaire, détection fenêtre ouverte. Pile 2 ans.",
      categoryHandle: "accessoires-chauffage",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic", "thermor"],
      optionName: "Type",
      optionValues: ["M30 Standard", "RA Compatible"],
      priceRange: { min: 3000, max: 8000 },
      skuPrefix: "TETE-",
      imageKeywords: ["thermostat", "valve", "radiator"],
      hsCode: "9032.10",
      weight: 200,
      productType: "Chauffage Central",
    },
    {
      namePrefix: "Chauffe-Eau Électrique",
      nameSuffix: "Vertical Mural",
      descriptionTemplate: "Chauffe-eau électrique vertical mural. Cuve émaillée, anode magnésium. Thermostat réglable. Groupe de sécurité inclus.",
      categoryHandle: "chauffe-eau-electriques",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic", "thermor"],
      optionName: "Capacité",
      optionValues: ["75L", "100L", "150L", "200L", "300L"],
      priceRange: { min: 20000, max: 80000 },
      skuPrefix: "CE-",
      imageKeywords: ["water", "heater", "tank"],
      hsCode: "8516.10",
      weight: 30000,
      productType: "Eau Chaude Sanitaire",
    },
    {
      namePrefix: "Chauffe-Eau Thermodynamique",
      nameSuffix: "",
      descriptionTemplate: "Chauffe-eau thermodynamique sur air ambiant ou extrait. COP >3. Économie jusqu'à 70%. Résistance appoint intégrée. Mode boost.",
      categoryHandle: "chauffe-eau-thermo",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic", "thermor"],
      optionName: "Capacité",
      optionValues: ["200L", "250L", "270L"],
      priceRange: { min: 150000, max: 250000 },
      skuPrefix: "CETH-",
      imageKeywords: ["heat", "pump", "water"],
      hsCode: "8418.61",
      weight: 80000,
      productType: "Eau Chaude Sanitaire",
    },
    {
      namePrefix: "Climatiseur Split",
      nameSuffix: "Inverter",
      descriptionTemplate: "Climatiseur split mural inverter réversible. Classe A++. Filtration anti-bactérienne. Télécommande infrarouge. Mode nuit silencieux.",
      categoryHandle: "splits",
      rootCategory: "chauffage-climatisation",
      brands: ["daikin", "atlantic"],
      optionName: "Puissance",
      optionValues: ["2.5kW", "3.5kW", "5kW", "7kW"],
      priceRange: { min: 60000, max: 180000 },
      skuPrefix: "CLIM-",
      imageKeywords: ["air", "conditioner", "split"],
      hsCode: "8415.10",
      weight: 12000,
      productType: "Climatisation",
    },
    {
      namePrefix: "Climatiseur Mobile",
      nameSuffix: "",
      descriptionTemplate: "Climatiseur mobile monobloc. Pas d'installation permanente, roulettes. Mode froid, déshumidification, ventilation. Kit calfeutrage fenêtre.",
      categoryHandle: "climatiseurs-mobiles",
      rootCategory: "chauffage-climatisation",
      brands: ["daikin"],
      optionName: "Puissance",
      optionValues: ["2.6kW", "3.5kW"],
      priceRange: { min: 40000, max: 80000 },
      skuPrefix: "CLIMOB-",
      imageKeywords: ["air", "portable", "cooling"],
      hsCode: "8415.10",
      weight: 25000,
      productType: "Climatisation",
    },
    {
      namePrefix: "VMC Simple Flux",
      nameSuffix: "Hygro B",
      descriptionTemplate: "VMC simple flux hygroréglable type B. Bouches hygroréglables incluses. Basse consommation. Silencieuse, moteur microwatt.",
      categoryHandle: "vmc",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic"],
      optionName: "Configuration",
      optionValues: ["2 sanitaires", "3 sanitaires", "4 sanitaires"],
      priceRange: { min: 15000, max: 40000 },
      skuPrefix: "VMC-",
      imageKeywords: ["ventilation", "extractor", "hrv"],
      hsCode: "8414.59",
      weight: 5000,
      productType: "Ventilation",
    },
    {
      namePrefix: "Extracteur d'Air",
      nameSuffix: "Silencieux",
      descriptionTemplate: "Extracteur d'air salle de bain silencieux. Débit élevé, niveau sonore réduit. Temporisateur, détecteur d'humidité disponible.",
      categoryHandle: "extracteurs",
      rootCategory: "chauffage-climatisation",
      brands: ["atlantic"],
      optionName: "Configuration",
      optionValues: ["D100 Standard", "D100 Timer", "D100 Hygro", "D125 Timer"],
      priceRange: { min: 2500, max: 8000 },
      skuPrefix: "EXTR-",
      imageKeywords: ["extractor", "fan", "bathroom"],
      hsCode: "8414.59",
      weight: 800,
      productType: "Ventilation",
    },

    // =========== QUINCAILLERIE ===========
    {
      namePrefix: "Chevilles Nylon",
      nameSuffix: "Universelles",
      descriptionTemplate: "Chevilles nylon universelles multimatériaux. Béton plein, brique creuse, plaque de plâtre. Expansion par vissage. Boîte professionnelle.",
      categoryHandle: "chevilles",
      rootCategory: "quincaillerie",
      brands: ["fischer", "wurth"],
      optionName: "Diamètre/Quantité",
      optionValues: ["6mm x100", "8mm x100", "10mm x50", "6-8-10mm assort x200"],
      priceRange: { min: 500, max: 3000 },
      skuPrefix: "CHEV-",
      imageKeywords: ["anchor", "wall", "plug"],
      hsCode: "3926.90",
      weight: 500,
      productType: "Fixation",
    },
    {
      namePrefix: "Chevilles à Frapper",
      nameSuffix: "Béton",
      descriptionTemplate: "Chevilles à frapper expansion mécanique pour béton plein et pierre. Pose rapide au marteau. Vis acier zingué incluse.",
      categoryHandle: "chevilles",
      rootCategory: "quincaillerie",
      brands: ["fischer", "wurth"],
      optionName: "Dimensions",
      optionValues: ["6x40mm x100", "6x60mm x100", "8x60mm x50", "8x80mm x50", "10x80mm x25"],
      priceRange: { min: 800, max: 4000 },
      skuPrefix: "CHEVF-",
      imageKeywords: ["anchor", "concrete", "hammer"],
      hsCode: "7318.14",
      weight: 1000,
      productType: "Fixation",
    },
    {
      namePrefix: "Vis Bois",
      nameSuffix: "Tête Fraisée",
      descriptionTemplate: "Vis bois tête fraisée pozidrive. Acier zingué bichromaté ou inox A2. Filetage partiel, pointe vrille. Boîte pro.",
      categoryHandle: "vis",
      rootCategory: "quincaillerie",
      brands: ["fischer", "wurth"],
      optionName: "Dimensions",
      optionValues: ["4x40mm x200", "4x50mm x200", "5x50mm x100", "5x70mm x100", "6x80mm x50"],
      priceRange: { min: 500, max: 3000 },
      skuPrefix: "VISB-",
      imageKeywords: ["screw", "wood", "countersunk"],
      hsCode: "7318.12",
      weight: 800,
      productType: "Fixation",
    },
    {
      namePrefix: "Vis Placoplâtre",
      nameSuffix: "Tête Trompette",
      descriptionTemplate: "Vis pour plaque de plâtre tête trompette phosphatée noir. Filetage fin, pointe acérée. Vissage rapide, pas d'avant-trou.",
      categoryHandle: "vis",
      rootCategory: "quincaillerie",
      brands: ["wurth"],
      optionName: "Dimensions",
      optionValues: ["3.5x25mm x500", "3.5x35mm x500", "3.5x45mm x200", "3.5x55mm x200"],
      priceRange: { min: 600, max: 2500 },
      skuPrefix: "VISP-",
      imageKeywords: ["screw", "drywall", "black"],
      hsCode: "7318.12",
      weight: 600,
      productType: "Fixation",
    },
    {
      namePrefix: "Boulon HM",
      nameSuffix: "Classe 8.8",
      descriptionTemplate: "Boulon tête hexagonale classe 8.8 zingué. Avec écrou et rondelles. Conforme ISO 4017. Usage industriel et mécanique.",
      categoryHandle: "boulons-ecrous",
      rootCategory: "quincaillerie",
      brands: ["wurth"],
      optionName: "Dimensions",
      optionValues: ["M6x30 x50", "M8x40 x25", "M10x50 x25", "M12x60 x10"],
      priceRange: { min: 500, max: 3000 },
      skuPrefix: "BOUL-",
      imageKeywords: ["bolt", "nut", "hex"],
      hsCode: "7318.15",
      weight: 1500,
      productType: "Fixation",
    },
    {
      namePrefix: "Serrure à Encastrer",
      nameSuffix: "Multipoints",
      descriptionTemplate: "Serrure à encastrer multipoints 3 ou 5 points. Axe 40 ou 50mm. Cylindre européen. Réversible droite/gauche. Label A2P.",
      categoryHandle: "serrures",
      rootCategory: "quincaillerie",
      brands: ["wurth"],
      optionName: "Configuration",
      optionValues: ["3 points axe 40", "3 points axe 50", "5 points axe 50"],
      priceRange: { min: 8000, max: 25000 },
      skuPrefix: "SERR-",
      imageKeywords: ["lock", "door", "multipoint"],
      hsCode: "8301.40",
      weight: 2000,
      productType: "Serrurerie",
    },
    {
      namePrefix: "Cylindre Européen",
      nameSuffix: "Haute Sécurité",
      descriptionTemplate: "Cylindre européen haute sécurité anti-crochetage, anti-casse, anti-perçage. Carte de propriété, clés incopiables. Label A2P.",
      categoryHandle: "cylindres",
      rootCategory: "quincaillerie",
      brands: ["wurth"],
      optionName: "Dimensions",
      optionValues: ["30x30mm", "30x40mm", "35x35mm", "40x40mm"],
      priceRange: { min: 5000, max: 15000 },
      skuPrefix: "CYL-",
      imageKeywords: ["cylinder", "lock", "security"],
      hsCode: "8301.40",
      weight: 300,
      productType: "Serrurerie",
    },
    {
      namePrefix: "Verrou à Bouton",
      nameSuffix: "",
      descriptionTemplate: "Verrou de sûreté à bouton intérieur. Cylindre 45mm, pêne acier. Fixation en applique. Bronze ou chrome.",
      categoryHandle: "verrous",
      rootCategory: "quincaillerie",
      brands: ["wurth"],
      optionName: "Finition",
      optionValues: ["Bronze", "Chrome"],
      priceRange: { min: 2000, max: 5000 },
      skuPrefix: "VERR-",
      imageKeywords: ["bolt", "lock", "door"],
      hsCode: "8301.40",
      weight: 400,
      productType: "Serrurerie",
    },
    {
      namePrefix: "Charnière Universelle",
      nameSuffix: "Inox",
      descriptionTemplate: "Charnière universelle inox A2. Droite ou gauche, noeud démontable. Bagues nylon silencieuses. Usage intérieur/extérieur.",
      categoryHandle: "charnieres",
      rootCategory: "quincaillerie",
      brands: ["wurth"],
      optionName: "Dimensions",
      optionValues: ["80x80mm", "100x100mm", "120x80mm"],
      priceRange: { min: 500, max: 2500 },
      skuPrefix: "CHAR-",
      imageKeywords: ["hinge", "door", "stainless"],
      hsCode: "8302.10",
      weight: 200,
      productType: "Ferrure",
    },
    {
      namePrefix: "Poignée de Porte",
      nameSuffix: "Sur Rosace",
      descriptionTemplate: "Poignée de porte intérieure sur rosace ronde. Aluminium ou inox 304. Visserie cachée. Fournie par paire avec rosaces et vis.",
      categoryHandle: "poignees",
      rootCategory: "quincaillerie",
      brands: ["wurth"],
      optionName: "Finition",
      optionValues: ["Aluminium Anodisé", "Inox Brossé", "Inox Poli", "Noir Mat"],
      priceRange: { min: 1500, max: 6000 },
      skuPrefix: "POIG-",
      imageKeywords: ["handle", "door", "lever"],
      hsCode: "8302.41",
      weight: 400,
      productType: "Ferrure",
    },
    {
      namePrefix: "Coulisse Tiroir",
      nameSuffix: "Sortie Totale",
      descriptionTemplate: "Coulisse tiroir à sortie totale sur billes. Charge jusqu'à 45kg. Démontage rapide, amortisseur de fermeture. Zinguée ou galvanisée.",
      categoryHandle: "glissieres",
      rootCategory: "quincaillerie",
      brands: ["wurth"],
      optionName: "Longueur",
      optionValues: ["300mm", "400mm", "450mm", "500mm", "550mm"],
      priceRange: { min: 800, max: 3500 },
      skuPrefix: "COUL-",
      imageKeywords: ["slide", "drawer", "rail"],
      hsCode: "8302.42",
      weight: 600,
      productType: "Ferrure",
    },
    {
      namePrefix: "Silicone Sanitaire",
      nameSuffix: "Anti-Moisissure",
      descriptionTemplate: "Silicone sanitaire anti-moisissure pour joints cuisine et salle de bain. Haute adhérence, souple, étanche. Fongicide longue durée.",
      categoryHandle: "silicones",
      rootCategory: "quincaillerie",
      brands: ["fischer", "wurth"],
      optionName: "Couleur/Conditionnement",
      optionValues: ["Blanc 310ml", "Transparent 310ml", "Gris 310ml", "Blanc 280ml lot x3"],
      priceRange: { min: 500, max: 2500 },
      skuPrefix: "SIL-",
      imageKeywords: ["silicone", "sealant", "caulk"],
      hsCode: "3214.10",
      weight: 350,
      productType: "Étanchéité",
    },
    {
      namePrefix: "Mastic Acrylique",
      nameSuffix: "Peinture",
      descriptionTemplate: "Mastic acrylique en cartouche. Jointoiement et finition, peinturable. Souple, sans solvant. Intérieur et extérieur abrité.",
      categoryHandle: "silicones",
      rootCategory: "quincaillerie",
      brands: ["fischer", "wurth"],
      optionName: "Couleur",
      optionValues: ["Blanc 310ml", "Gris 310ml", "Brun 310ml"],
      priceRange: { min: 300, max: 1200 },
      skuPrefix: "MAST-",
      imageKeywords: ["acrylic", "sealant", "filler"],
      hsCode: "3214.10",
      weight: 400,
      productType: "Étanchéité",
    },
    {
      namePrefix: "Mousse Polyuréthane",
      nameSuffix: "Expansive",
      descriptionTemplate: "Mousse polyuréthane expansive mono-composant. Calfeutrement, isolation, collage. Expansion x2.5. Pistolet ou manuelle.",
      categoryHandle: "mousses-pu",
      rootCategory: "quincaillerie",
      brands: ["fischer", "wurth"],
      optionName: "Type/Conditionnement",
      optionValues: ["Manuelle 500ml", "Manuelle 750ml", "Pistolet 750ml"],
      priceRange: { min: 500, max: 2000 },
      skuPrefix: "MOUSSE-",
      imageKeywords: ["foam", "expanding", "insulation"],
      hsCode: "3909.50",
      weight: 600,
      productType: "Étanchéité",
    },
  ];
}

// ============================================================================
// PRODUCT VARIATION DATA FOR UNIQUE GENERATION
// ============================================================================

/**
 * Model number prefixes for different product types
 */
const MODEL_PREFIXES: string[] = [
  "PRO", "EXPERT", "PREMIUM", "ECO", "PLUS", "MAX", "ULTRA", "COMPACT",
  "ELITE", "SERIE", "GAMMA", "DELTA", "ALPHA", "OMEGA", "SIGMA", "BASIC",
  "ADVANCED", "STANDARD", "CLASSIC", "MODERN", "TECH", "SMART", "FLEX",
  "ROBUST", "SUPER", "MEGA", "MINI", "MICRO", "GRAND", "TITAN",
];

/**
 * Series/generation names for products
 */
const SERIES_NAMES: string[] = [
  "Generation 2", "Gen 3", "V2.0", "V3.0", "Mark II", "Mark III", "Serie A",
  "Serie B", "Serie C", "Edition 2024", "Edition 2025", "New", "Evolution",
  "Performance", "Efficiency", "Confort", "Securite", "Industrie", "Habitat",
  "Commercial", "Residentiel", "Tertiaire", "Chantier", "Atelier", "Pro+",
];

/**
 * Quality/finish descriptors
 */
const QUALITY_DESCRIPTORS: string[] = [
  "Premium", "Standard", "Economique", "Professionnel", "Industriel",
  "Haute Performance", "Haute Qualite", "Renforce", "Extra", "Superieur",
  "Select", "Excellence", "Optimal", "Performance+", "Durable",
];

/**
 * Reference number formats for B2B products
 */
const REFERENCE_FORMATS: string[] = [
  "REF", "CAT", "ART", "MOD", "TYPE", "NUM", "CODE", "ID",
];

/**
 * Generate a unique model identifier based on index
 */
function generateModelIdentifier(index: number): string {
  const prefix = MODEL_PREFIXES[index % MODEL_PREFIXES.length];
  const modelNum = 1000 + Math.floor(index / MODEL_PREFIXES.length);
  const suffix = String.fromCharCode(65 + (index % 26)); // A-Z
  return `${prefix}-${modelNum}${suffix}`;
}

/**
 * Generate a unique series/generation name
 */
function generateSeriesName(index: number): string {
  return SERIES_NAMES[index % SERIES_NAMES.length];
}

/**
 * Generate unique reference code
 */
function generateReferenceCode(index: number): string {
  const format = REFERENCE_FORMATS[index % REFERENCE_FORMATS.length];
  const code = String(10000 + index).substring(1); // 4-digit code
  return `${format}-${code}`;
}

/**
 * Generate quality descriptor
 */
function generateQualityDescriptor(index: number): string {
  return QUALITY_DESCRIPTORS[index % QUALITY_DESCRIPTORS.length];
}

/**
 * Generate a unique product title with model/series variation
 * Ensures no two products have the same title
 */
function generateUniqueTitle(
  template: ProductTemplate,
  index: number
): string {
  const baseTitle = `${template.namePrefix} ${template.nameSuffix}`.trim();
  const modelId = generateModelIdentifier(index);

  // Create variations based on index to ensure uniqueness
  const variation = index % 4;
  switch (variation) {
    case 0:
      return `${baseTitle} ${modelId}`;
    case 1:
      return `${baseTitle} - ${generateSeriesName(index)}`;
    case 2:
      return `${baseTitle} ${generateQualityDescriptor(index)} ${generateReferenceCode(index)}`;
    case 3:
    default:
      return `${baseTitle} ${modelId} ${generateSeriesName(index)}`;
  }
}

/**
 * Generate a unique description with specific parameters
 * Each product gets customized details based on its index
 */
function generateUniqueDescription(
  template: ProductTemplate,
  index: number,
  brandSlug: string | undefined
): string {
  const baseDesc = template.descriptionTemplate;
  const modelId = generateModelIdentifier(index);
  const refCode = generateReferenceCode(index);
  const quality = generateQualityDescriptor(index);
  const brand = brandSlug?.toUpperCase() || template.brands[0]?.toUpperCase() || "MARQUE";

  // Technical specifications based on index
  const specs = [
    `Modele: ${modelId}`,
    `Reference: ${refCode}`,
    `Qualite: ${quality}`,
    `Garantie: ${2 + (index % 3)} ans`,
  ];

  // Add category-specific details
  const categoryDetails = generateCategorySpecificDetails(template.categoryHandle, index);

  return `${baseDesc}\n\n` +
    `Specifications techniques:\n` +
    `- ${specs.join("\n- ")}\n` +
    `${categoryDetails}\n` +
    `Marque: ${brand}. Reference fabricant: ${modelId}.`;
}

/**
 * Generate category-specific technical details
 */
function generateCategorySpecificDetails(categoryHandle: string, index: number): string {
  const normes = ["NF", "CE", "ISO 9001", "EN", "AFNOR"];
  const norme = normes[index % normes.length];

  if (categoryHandle.includes("cable") || categoryHandle.includes("fil")) {
    const sections = ["1.5", "2.5", "4", "6", "10", "16"];
    const section = sections[index % sections.length];
    return `Section: ${section}mm2. Norme: ${norme}. Temperature max: ${60 + (index % 30)}C.`;
  }

  if (categoryHandle.includes("disjoncteur") || categoryHandle.includes("differentiel")) {
    const calibres = ["10", "16", "20", "25", "32", "40", "63"];
    const calibre = calibres[index % calibres.length];
    return `Calibre: ${calibre}A. Pouvoir de coupure: ${4 + (index % 6)}kA. Norme: ${norme}.`;
  }

  if (categoryHandle.includes("led") || categoryHandle.includes("eclairage")) {
    const lumens = [800, 1000, 1200, 1500, 2000, 3000];
    const lumen = lumens[index % lumens.length];
    const temp = [2700, 3000, 4000, 5000, 6500];
    const colorTemp = temp[index % temp.length];
    return `Flux lumineux: ${lumen}lm. Temperature: ${colorTemp}K. Duree: ${15000 + (index * 100)}h.`;
  }

  if (categoryHandle.includes("tube") || categoryHandle.includes("per") || categoryHandle.includes("multicouche")) {
    const diametres = ["12", "16", "20", "25", "32", "40"];
    const diametre = diametres[index % diametres.length];
    return `Diametre: ${diametre}mm. Pression max: ${10 + (index % 6)} bars. Norme: ${norme}.`;
  }

  if (categoryHandle.includes("perceuse") || categoryHandle.includes("visseuse") || categoryHandle.includes("meuleuse")) {
    const voltages = ["12V", "18V", "20V", "36V", "54V"];
    const voltage = voltages[index % voltages.length];
    const batteries = ["2.0Ah", "4.0Ah", "5.0Ah", "6.0Ah", "8.0Ah"];
    const battery = batteries[index % batteries.length];
    return `Tension: ${voltage}. Batterie: ${battery}. Vitesse: ${1000 + (index * 50)} tr/min.`;
  }

  if (categoryHandle.includes("robinet") || categoryHandle.includes("mitigeur")) {
    const debits = ["5", "6", "8", "10", "12"];
    const debit = debits[index % debits.length];
    return `Debit: ${debit}L/min. Pression: ${1 + (index % 3)}-${3 + (index % 3)} bars. Norme: ${norme}.`;
  }

  // Default generic specs
  return `Certification: ${norme}. Indice de protection: IP${20 + (index % 50)}. Classe: ${["I", "II", "III"][index % 3]}.`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Category to image URL mapping using Imgur-hosted images (from Platzi Fake Store API)
 * Each category has 3-4 image URLs for variety
 */
const CATEGORY_IMAGE_MAPPINGS: Record<string, string[]> = {
  // =========== ELECTRICITE ===========
  // Cables et Fils (Electronics images)
  "cables-rigides": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/mWwek7p.jpeg"],
  "cables-souples": ["https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/keVCVIa.jpeg"],
  "fils-cablage": ["https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/afHY7v2.jpeg"],
  // Appareillage
  "interrupteurs": ["https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/yAOihUe.jpeg"],
  "prises-electriques": ["https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/SolkFEB.jpeg"],
  "variateurs": ["https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/mWwek7p.jpeg"],
  // Tableau electrique
  "disjoncteurs": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/afHY7v2.jpeg"],
  "differentiels": ["https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/yAOihUe.jpeg"],
  "coffrets-electriques": ["https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/keVCVIa.jpeg"],
  // Eclairage
  "ampoules-led": ["https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/KIGW49u.jpeg"],
  "tubes-led": ["https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/SolkFEB.jpeg"],
  "projecteurs": ["https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/KIGW49u.jpeg"],
  "reglettes": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/afHY7v2.jpeg"],
  // Gaines et Conduits
  "gaines-icta": ["https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/mWwek7p.jpeg"],
  "tubes-irl": ["https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/KIGW49u.jpeg"],
  "moulures": ["https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/yAOihUe.jpeg"],

  // =========== PLOMBERIE ===========
  // Tuyauterie (Miscellaneous images)
  "tubes-per": ["https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/7OqTPO6.jpg"],
  "tubes-multicouche": ["https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/Lqaqz59.jpg"],
  "tubes-cuivre": ["https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/jVfoZnP.jpg"],
  "tubes-pvc": ["https://i.imgur.com/Lqaqz59.jpg", "https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/Tnl15XK.jpg"],
  // Raccords
  "raccords-sertir": ["https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/0qQBkxX.jpg"],
  "raccords-laiton": ["https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/I5g1DoE.jpg"],
  "raccords-pvc": ["https://i.imgur.com/0qQBkxX.jpg", "https://i.imgur.com/Lqaqz59.jpg", "https://i.imgur.com/atWACf1.jpg"],
  // Robinetterie
  "mitigeurs": ["https://i.imgur.com/I5g1DoE.jpg", "https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/TF0pXdL.jpg"],
  "robinets-arret": ["https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/0qQBkxX.jpg", "https://i.imgur.com/I5g1DoE.jpg"],
  "colonnes-douche": ["https://i.imgur.com/TF0pXdL.jpg", "https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/myfFQBW.jpg"],
  // Sanitaire
  "wc-reservoirs": ["https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/TF0pXdL.jpg"],
  "lavabos": ["https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/I5g1DoE.jpg"],
  "baignoires": ["https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/myfFQBW.jpg"],
  // Evacuation
  "siphons": ["https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/7OqTPO6.jpg"],
  "bondes": ["https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/Lqaqz59.jpg"],

  // =========== OUTILLAGE ===========
  // Electroportatif (Shoes images - varied colors/shapes)
  "perceuses-visseuses": ["https://i.imgur.com/hKcMNJs.jpeg", "https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/HiiapCt.jpeg"],
  "perforateurs": ["https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/mcW42Gi.jpeg", "https://i.imgur.com/hKcMNJs.jpeg"],
  "meuleuses": ["https://i.imgur.com/HiiapCt.jpeg", "https://i.imgur.com/mhn7qsF.jpeg", "https://i.imgur.com/NYToymX.jpeg"],
  "scies-electriques": ["https://i.imgur.com/mcW42Gi.jpeg", "https://i.imgur.com/F8vhnFJ.jpeg", "https://i.imgur.com/HiiapCt.jpeg"],
  "visseuses-chocs": ["https://i.imgur.com/mhn7qsF.jpeg", "https://i.imgur.com/npLfCGq.jpeg", "https://i.imgur.com/mcW42Gi.jpeg"],
  // Outillage a main
  "tournevis": ["https://i.imgur.com/F8vhnFJ.jpeg", "https://i.imgur.com/vYim3gj.jpeg", "https://i.imgur.com/mhn7qsF.jpeg"],
  "cles": ["https://i.imgur.com/npLfCGq.jpeg", "https://i.imgur.com/HxuHwBO.jpeg", "https://i.imgur.com/F8vhnFJ.jpeg"],
  "pinces": ["https://i.imgur.com/vYim3gj.jpeg", "https://i.imgur.com/HqYqLnW.jpeg", "https://i.imgur.com/npLfCGq.jpeg"],
  "marteaux": ["https://i.imgur.com/HxuHwBO.jpeg", "https://i.imgur.com/RlDGnZw.jpeg", "https://i.imgur.com/vYim3gj.jpeg"],
  // Mesure et Tracage
  "metres-regles": ["https://i.imgur.com/HqYqLnW.jpeg", "https://i.imgur.com/qa0O6fg.jpeg", "https://i.imgur.com/HxuHwBO.jpeg"],
  "niveaux": ["https://i.imgur.com/RlDGnZw.jpeg", "https://i.imgur.com/Au8J9sX.jpeg", "https://i.imgur.com/HqYqLnW.jpeg"],
  "lasers-mesure": ["https://i.imgur.com/qa0O6fg.jpeg", "https://i.imgur.com/gdr8BW2.jpeg", "https://i.imgur.com/RlDGnZw.jpeg"],
  "telemetres": ["https://i.imgur.com/Au8J9sX.jpeg", "https://i.imgur.com/KDCZxnJ.jpeg", "https://i.imgur.com/qa0O6fg.jpeg"],
  // Consommables
  "forets": ["https://i.imgur.com/gdr8BW2.jpeg", "https://i.imgur.com/sC0ztOB.jpeg", "https://i.imgur.com/Au8J9sX.jpeg"],
  "disques": ["https://i.imgur.com/KDCZxnJ.jpeg", "https://i.imgur.com/Jf9DL9R.jpeg", "https://i.imgur.com/gdr8BW2.jpeg"],
  "lames-scie": ["https://i.imgur.com/sC0ztOB.jpeg", "https://i.imgur.com/R1IN95T.jpeg", "https://i.imgur.com/KDCZxnJ.jpeg"],
  // Rangement
  "caisses-outils": ["https://i.imgur.com/Jf9DL9R.jpeg", "https://i.imgur.com/hKcMNJs.jpeg", "https://i.imgur.com/sC0ztOB.jpeg"],
  "servantes": ["https://i.imgur.com/R1IN95T.jpeg", "https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/Jf9DL9R.jpeg"],

  // =========== CHAUFFAGE CLIMATISATION ===========
  // Chauffage Electrique (Mix of Electronics and Misc)
  "radiateurs-inertie": ["https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/KIGW49u.jpeg"],
  "convecteurs": ["https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/mWwek7p.jpeg"],
  "panneaux-rayonnants": ["https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/keVCVIa.jpeg"],
  // Chauffage Central
  "radiateurs-eau-chaude": ["https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/Lqaqz59.jpg", "https://i.imgur.com/afHY7v2.jpeg"],
  "chaudieres-gaz": ["https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/yAOihUe.jpeg"],
  "accessoires-chauffage": ["https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/SolkFEB.jpeg"],
  // Eau Chaude Sanitaire
  "chauffe-eau-electriques": ["https://i.imgur.com/0qQBkxX.jpg", "https://i.imgur.com/SolkFEB.jpeg", "https://i.imgur.com/I5g1DoE.jpg"],
  "chauffe-eau-thermo": ["https://i.imgur.com/I5g1DoE.jpg", "https://i.imgur.com/KIGW49u.jpeg", "https://i.imgur.com/myfFQBW.jpg"],
  // Climatisation
  "splits": ["https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/mWwek7p.jpeg", "https://i.imgur.com/TF0pXdL.jpg"],
  "climatiseurs-mobiles": ["https://i.imgur.com/TF0pXdL.jpg", "https://i.imgur.com/keVCVIa.jpeg", "https://i.imgur.com/BLDByXP.jpg"],
  // Ventilation
  "vmc": ["https://i.imgur.com/BLDByXP.jpg", "https://i.imgur.com/afHY7v2.jpeg", "https://i.imgur.com/b7trwCv.jpg"],
  "extracteurs": ["https://i.imgur.com/b7trwCv.jpg", "https://i.imgur.com/yAOihUe.jpeg", "https://i.imgur.com/jVfoZnP.jpg"],

  // =========== QUINCAILLERIE ===========
  // Fixation (Mix of images)
  "chevilles": ["https://i.imgur.com/jVfoZnP.jpg", "https://i.imgur.com/hKcMNJs.jpeg", "https://i.imgur.com/Tnl15XK.jpg"],
  "vis": ["https://i.imgur.com/Tnl15XK.jpg", "https://i.imgur.com/NYToymX.jpeg", "https://i.imgur.com/7OqTPO6.jpg"],
  "boulons-ecrous": ["https://i.imgur.com/7OqTPO6.jpg", "https://i.imgur.com/HiiapCt.jpeg", "https://i.imgur.com/Lqaqz59.jpg"],
  "clous": ["https://i.imgur.com/Lqaqz59.jpg", "https://i.imgur.com/mcW42Gi.jpeg", "https://i.imgur.com/uSqWK0m.jpg"],
  // Serrurerie
  "serrures": ["https://i.imgur.com/uSqWK0m.jpg", "https://i.imgur.com/mhn7qsF.jpeg", "https://i.imgur.com/atWACf1.jpg"],
  "cylindres": ["https://i.imgur.com/atWACf1.jpg", "https://i.imgur.com/F8vhnFJ.jpeg", "https://i.imgur.com/0qQBkxX.jpg"],
  "verrous": ["https://i.imgur.com/0qQBkxX.jpg", "https://i.imgur.com/npLfCGq.jpeg", "https://i.imgur.com/I5g1DoE.jpg"],
  // Ferrures
  "charnieres": ["https://i.imgur.com/I5g1DoE.jpg", "https://i.imgur.com/vYim3gj.jpeg", "https://i.imgur.com/myfFQBW.jpg"],
  "poignees": ["https://i.imgur.com/myfFQBW.jpg", "https://i.imgur.com/HxuHwBO.jpeg", "https://i.imgur.com/TF0pXdL.jpg"],
  "glissieres": ["https://i.imgur.com/TF0pXdL.jpg", "https://i.imgur.com/HqYqLnW.jpeg", "https://i.imgur.com/BLDByXP.jpg"],
  // Etancheite
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

/**
 * Default fallback images for products without specific category mapping (Imgur URLs)
 */
const DEFAULT_B2B_IMAGES: string[] = [
  "https://i.imgur.com/SolkFEB.jpeg",
  "https://i.imgur.com/jVfoZnP.jpg",
  "https://i.imgur.com/hKcMNJs.jpeg",
  "https://i.imgur.com/myfFQBW.jpg",
];

/**
 * Get image URL - returns the URL directly (for compatibility with existing code)
 */
function buildUnsplashUrl(imageUrl: string, _width = 800, _quality = 80): string {
  // Images are now full URLs, return as-is
  return imageUrl;
}

/**
 * Get relevant product images based on category handle and product type
 *
 * @param categoryHandle - The product category handle (e.g., "perceuses-visseuses")
 * @param productType - The product type (e.g., "Outillage Electroportatif")
 * @param seed - A seed number for consistent but varied image selection
 * @returns Object with array of 2-4 relevant image URLs and thumbnail URL
 */
function getProductImages(
  categoryHandle: string,
  productType: string,
  seed: number
): { urls: string[]; thumbnail: string } {
  // Try to find images for the specific category
  let photoIds = CATEGORY_IMAGE_MAPPINGS[categoryHandle];

  // If not found, try parent category (remove last segment)
  if (!photoIds) {
    const parts = categoryHandle.split("-");
    while (parts.length > 1 && !photoIds) {
      parts.pop();
      const parentHandle = parts.join("-");
      photoIds = CATEGORY_IMAGE_MAPPINGS[parentHandle];
    }
  }

  // Try to match by product type root category
  if (!photoIds) {
    const typeToCategory: Record<string, string> = {
      "Cable Electrique": "electricite",
      "Appareillage Electrique": "electricite",
      "Tableau Electrique": "electricite",
      "Eclairage": "electricite",
      "Tuyauterie": "plomberie",
      "Raccord": "plomberie",
      "Robinetterie": "plomberie",
      "Sanitaire": "plomberie",
      "Outillage Electroportatif": "outillage",
      "Outillage a Main": "outillage",
      "Materiel de Mesure": "outillage",
      "Consommable Outillage": "outillage",
      "Rangement Outillage": "outillage",
      "Chauffage Electrique": "chauffage-climatisation",
      "Chauffage Central": "chauffage-climatisation",
      "Climatisation": "chauffage-climatisation",
      "Eau Chaude Sanitaire": "chauffage-climatisation",
      "Ventilation": "chauffage-climatisation",
      "Fixation": "quincaillerie",
      "Serrurerie": "quincaillerie",
      "Ferrure": "quincaillerie",
      "Etancheite": "quincaillerie",
    };
    const rootCategory = typeToCategory[productType];
    if (rootCategory) {
      photoIds = CATEGORY_IMAGE_MAPPINGS[rootCategory];
    }
  }

  // Use default images if nothing found
  if (!photoIds || photoIds.length === 0) {
    photoIds = DEFAULT_B2B_IMAGES;
  }

  // Select 2-4 images based on seed for variety
  const numImages = 2 + (seed % 3); // 2, 3, or 4 images
  const selectedIds: string[] = [];
  const startIndex = seed % photoIds.length;

  for (let i = 0; i < numImages && i < photoIds.length; i++) {
    const idx = (startIndex + i) % photoIds.length;
    selectedIds.push(photoIds[idx]);
  }

  // Build URLs
  const urls = selectedIds.map((id) => buildUnsplashUrl(id));

  // First image is the thumbnail
  const thumbnail = urls[0];

  return { urls, thumbnail };
}

/**
 * Generate a unique SKU
 */
function generateSKU(prefix: string, index: number, variantIndex: number): string {
  const paddedIndex = String(index).padStart(4, "0");
  const variantSuffix = String.fromCharCode(65 + variantIndex);
  return `${prefix}${paddedIndex}${variantSuffix}`;
}

/**
 * Generate image URL for a category using category-based mappings
 *
 * @param categoryHandle - The product category handle
 * @param productType - The product type for fallback
 * @param seed - Seed for image selection
 */
function generateImageUrl(categoryHandle: string, productType: string, seed: number): string {
  const { thumbnail } = getProductImages(categoryHandle, productType, seed);
  return thumbnail;
}

/**
 * Generate a variant-specific image URL using category-based mappings
 */
function generateVariantImageUrl(categoryHandle: string, productType: string, productIndex: number, variantIndex: number): string {
  const combinedSeed = productIndex * 7 + variantIndex * 3;
  const { urls } = getProductImages(categoryHandle, productType, combinedSeed);
  // Select different image for each variant
  return urls[variantIndex % urls.length];
}

/**
 * Generate a price based on range and variant modifier
 */
function generatePrice(priceRange: { min: number; max: number }, priceMod: number, seed: number): number {
  const basePrice = priceRange.min + ((seed * 17) % (priceRange.max - priceRange.min));
  const modifiedPrice = Math.round(basePrice * priceMod);
  return Math.round(modifiedPrice / 10) * 10;
}

/**
 * Map product types to image keywords
 */
function getImageKeywordForProductType(productType: string): string {
  const typeToKeyword: Record<string, string> = {
    "Cable Electrique": "cable", "Appareillage Electrique": "switch", "Tableau Electrique": "breaker",
    "Eclairage": "led", "Tuyauterie": "pipe", "Raccord": "fitting", "Robinetterie": "faucet",
    "Sanitaire": "toilet", "Outillage Electroportatif": "drill", "Outillage a Main": "wrench",
    "Materiel de Mesure": "measure", "Consommable Outillage": "drill", "Rangement Outillage": "toolbox",
    "Chauffage Electrique": "radiator", "Chauffage Central": "boiler", "Eau Chaude Sanitaire": "heater",
    "Climatisation": "airconditioner", "Ventilation": "ventilation", "Fixation": "screw",
    "Serrurerie": "lock", "Ferrure": "hinge", "Etancheite": "sealant",
  };
  return typeToKeyword[productType] || "tool";
}

/**
 * Generate variant configurations with diverse price/weight modifiers and unique images
 */
function generateVariantConfigs(template: ProductTemplate, productIndex: number = 0): VariantConfig[] {
  // Use category handle for coherent image selection
  const categoryHandle = template.categoryHandle;
  const productType = template.productType;

  return template.optionValues.map((value, index) => {
    let priceMod = 1.0;
    let weightMod = 1.0;
    const lowerValue = value.toLowerCase();

    // Length/Capacity modifiers
    if (lowerValue.includes("100m") || lowerValue.includes("300l")) { priceMod = 2.8; weightMod = 2.8; }
    else if (lowerValue.includes("50m") || lowerValue.includes("200l") || lowerValue.includes("270l")) { priceMod = 2.0; weightMod = 2.0; }
    else if (lowerValue.includes("25m") || lowerValue.includes("150l") || lowerValue.includes("250l")) { priceMod = 1.5; weightMod = 1.5; }
    else if (lowerValue.includes("100l") || lowerValue.includes("75l")) { priceMod = 1.25; weightMod = 1.25; }

    // Power/Voltage modifiers
    if (lowerValue.includes("2000w") || lowerValue.includes("36v") || lowerValue.includes("7kw") || lowerValue.includes("35kw")) { priceMod *= 1.9; weightMod *= 1.6; }
    else if (lowerValue.includes("1500w") || lowerValue.includes("18v 5ah") || lowerValue.includes("5kw") || lowerValue.includes("28kw")) { priceMod *= 1.55; weightMod *= 1.35; }
    else if (lowerValue.includes("1000w") || lowerValue.includes("18v 4ah") || lowerValue.includes("3.5kw") || lowerValue.includes("24kw")) { priceMod *= 1.3; weightMod *= 1.2; }
    else if (lowerValue.includes("750w") || lowerValue.includes("18v 2ah") || lowerValue.includes("2.5kw") || lowerValue.includes("2.6kw")) { priceMod *= 1.15; weightMod *= 1.1; }

    // Diameter modifiers
    if (lowerValue.includes("d32") || lowerValue.includes("d100") || lowerValue.includes("100mm")) { priceMod *= 1.7; weightMod *= 1.6; }
    else if (lowerValue.includes("d26") || lowerValue.includes("d80") || lowerValue.includes("80mm")) { priceMod *= 1.45; weightMod *= 1.35; }
    else if (lowerValue.includes("d20") || lowerValue.includes("d63") || lowerValue.includes("63mm")) { priceMod *= 1.25; weightMod *= 1.2; }
    else if (lowerValue.includes("d16") || lowerValue.includes("d50") || lowerValue.includes("50mm")) { priceMod *= 1.1; weightMod *= 1.1; }

    // Amperage modifiers
    if (lowerValue.includes("63a") || lowerValue.includes("4p 63")) { priceMod *= 1.6; weightMod *= 1.4; }
    else if (lowerValue.includes("32a") || lowerValue.includes("4p 40")) { priceMod *= 1.45; weightMod *= 1.3; }
    else if (lowerValue.includes("25a") || lowerValue.includes("2p 63")) { priceMod *= 1.3; weightMod *= 1.2; }
    else if (lowerValue.includes("20a") || lowerValue.includes("2p 40")) { priceMod *= 1.15; weightMod *= 1.1; }

    // Cable section modifiers
    if (lowerValue.includes("6mm") || lowerValue.includes("5g")) { priceMod *= 1.6; weightMod *= 1.5; }
    else if (lowerValue.includes("4mm")) { priceMod *= 1.35; weightMod *= 1.3; }
    else if (lowerValue.includes("2.5mm") || lowerValue.includes("3g2.5")) { priceMod *= 1.15; weightMod *= 1.15; }

    // Pack quantity modifiers
    if (lowerValue.includes("x500")) { priceMod *= 2.5; weightMod *= 2.3; }
    else if (lowerValue.includes("x200")) { priceMod *= 1.8; weightMod *= 1.7; }
    else if (lowerValue.includes("x100")) { priceMod *= 1.4; weightMod *= 1.35; }
    else if (lowerValue.includes("x50")) { priceMod *= 1.2; weightMod *= 1.15; }
    else if (lowerValue.includes("x25") || lowerValue.includes("x10")) { priceMod *= 1.05; weightMod *= 1.05; }

    // Size modifiers
    if (lowerValue.includes("24\"") || lowerValue.includes("22 pieces") || lowerValue.includes("120cm") || lowerValue.includes("150cm")) { priceMod *= 1.65; weightMod *= 1.55; }
    else if (lowerValue.includes("19\"") || lowerValue.includes("17 pieces") || lowerValue.includes("100cm")) { priceMod *= 1.35; weightMod *= 1.3; }
    else if (lowerValue.includes("16\"") || lowerValue.includes("12 pieces") || lowerValue.includes("80cm")) { priceMod *= 1.15; weightMod *= 1.1; }

    // Premium finishes
    if (lowerValue.includes("inox poli") || lowerValue.includes("noir mat")) { priceMod *= 1.2; }
    else if (lowerValue.includes("inox") || lowerValue.includes("chrome") || lowerValue.includes("noir")) { priceMod *= 1.12; }

    // Electrical panel modules
    if (lowerValue.includes("4 rangees") || lowerValue.includes("52m")) { priceMod *= 2.1; weightMod *= 1.9; }
    else if (lowerValue.includes("3 rangees") || lowerValue.includes("39m")) { priceMod *= 1.65; weightMod *= 1.55; }
    else if (lowerValue.includes("2 rangees") || lowerValue.includes("26m")) { priceMod *= 1.3; weightMod *= 1.25; }

    // Bathroom dimensions
    if (lowerValue.includes("180x80") || lowerValue.includes("65cm")) { priceMod *= 1.55; weightMod *= 1.45; }
    else if (lowerValue.includes("170x75") || lowerValue.includes("60cm") || lowerValue.includes("170x70")) { priceMod *= 1.3; weightMod *= 1.25; }
    else if (lowerValue.includes("160x70") || lowerValue.includes("55cm")) { priceMod *= 1.15; weightMod *= 1.1; }

    // Position-based fallback
    if (priceMod === 1.0) { priceMod = 1 + (index * 0.22); }
    if (weightMod === 1.0) { weightMod = 1 + (index * 0.15); }

    const variantImageUrl = generateVariantImageUrl(categoryHandle, productType, productIndex, index);

    return {
      title: value,
      optionValue: value,
      priceMod: Math.round(priceMod * 100) / 100,
      weightMod: Math.round(weightMod * 100) / 100,
      imageUrl: variantImageUrl,
      imageKeyword: categoryHandle, // Use category handle for image tracking
    };
  });
}

/**
 * Slugify a string for handle generation
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

/**
 * Get random brand for a category
 */
function getRandomBrand(categoryHandle: string, seed: number, allBrands: MarqueDTO[]): string | undefined {
  // Look up brands for this category
  let brands = BRAND_MAPPINGS[categoryHandle];

  // If no specific mapping, check parent categories
  if (!brands) {
    // Try to find a parent mapping
    const parts = categoryHandle.split("-");
    while (parts.length > 0 && !brands) {
      parts.pop();
      const parentHandle = parts.join("-");
      if (parentHandle && BRAND_MAPPINGS[parentHandle]) {
        brands = BRAND_MAPPINGS[parentHandle];
      }
    }
  }

  // Default brands if nothing found
  if (!brands || brands.length === 0) {
    brands = ["bosch", "stanley", "schneider-electric"];
  }

  // Pick a brand based on seed
  const selectedSlug = brands[seed % brands.length];

  // Find the actual brand from the seeded marques
  const matchedBrand = allBrands.find((b) => b.slug === selectedSlug);
  if (matchedBrand) {
    return matchedBrand.slug;
  }

  // Return first available brand if not found
  return allBrands[0]?.slug;
}

// ============================================================================
// CATEGORY CREATION
// ============================================================================

/**
 * Create categories recursively
 */
async function createCategoriesRecursively(
  productService: IProductModuleService,
  categories: CategoryDefinition[],
  parentId: string | undefined,
  categoryMap: Record<string, string>,
  logger: Logger
): Promise<void> {
  for (const categoryDef of categories) {
    try {
      const category = await productService.createProductCategories({
        name: categoryDef.name,
        handle: categoryDef.handle,
        description: categoryDef.description,
        is_active: true,
        is_internal: false,
        parent_category_id: parentId,
        metadata: categoryDef.metadata,
      });

      categoryMap[categoryDef.handle] = category.id;
      logger.info(`   Created category: ${categoryDef.name}`);

      if (categoryDef.children && categoryDef.children.length > 0) {
        await createCategoriesRecursively(
          productService,
          categoryDef.children,
          category.id,
          categoryMap,
          logger
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("unique") || message.includes("duplicate")) {
        // Category already exists, try to find it
        const existing = await productService.listProductCategories({ handle: categoryDef.handle });
        if (existing.length > 0) {
          categoryMap[categoryDef.handle] = existing[0].id;
          logger.info(`   Using existing category: ${categoryDef.name}`);

          // Still process children
          if (categoryDef.children && categoryDef.children.length > 0) {
            await createCategoriesRecursively(
              productService,
              categoryDef.children,
              existing[0].id,
              categoryMap,
              logger
            );
          }
        }
      } else {
        logger.error(`   Failed to create category ${categoryDef.name}: ${message}`);
      }
    }
  }
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

export default async function seedB2BProducts({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

  logger.info("=".repeat(70));
  logger.info("Seed B2B Products - Professional Hardware & Supplies");
  logger.info("=".repeat(70));
  logger.info("");

  // -------------------------------------------------------------------------
  // Step 1: Get required services
  // -------------------------------------------------------------------------
  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);
  const salesChannelService = container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL);
  const fulfillmentService = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT);
  const stockLocationService = container.resolve<IStockLocationService>(Modules.STOCK_LOCATION);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // -------------------------------------------------------------------------
  // Step 2: Get or create sales channels (Web + App)
  // -------------------------------------------------------------------------
  logger.info("[1/10] Creating sales channels (Web + App)...");
  const existingChannels = await salesChannelService.listSalesChannels({});

  // Find or create Web channel
  let webChannel = existingChannels.find((c) => c.name === "Web");
  if (!webChannel) {
    webChannel = await salesChannelService.createSalesChannels({
      name: "Web",
      description: "Canal de vente site web B2B",
      is_disabled: false,
    });
    logger.info("   Created Web sales channel");
  } else {
    logger.info("   Using existing Web sales channel");
  }

  // Find or create App channel
  let appChannel = existingChannels.find((c) => c.name === "App");
  if (!appChannel) {
    appChannel = await salesChannelService.createSalesChannels({
      name: "App",
      description: "Canal de vente application mobile B2B",
      is_disabled: false,
    });
    logger.info("   Created App sales channel");
  } else {
    logger.info("   Using existing App sales channel");
  }

  const salesChannels = [{ id: webChannel.id }, { id: appChannel.id }];
  logger.info(`   Products will be available on both Web and App channels`);

  // -------------------------------------------------------------------------
  // Step 3: Get or create shipping profile
  // -------------------------------------------------------------------------
  logger.info("[2/8] Getting shipping profile...");
  const existingProfiles = await fulfillmentService.listShippingProfiles({});
  let shippingProfile: { id: string };
  if (existingProfiles.length > 0) {
    shippingProfile = { id: existingProfiles[0].id };
    logger.info("   Using existing shipping profile");
  } else {
    const { result } = await createProductsWorkflow(container).run({
      input: { products: [] },
    });
    // Create default profile
    shippingProfile = { id: "" }; // Will be assigned automatically
    logger.info("   Will use default shipping profile");
  }

  // -------------------------------------------------------------------------
  // Step 4: Get or create stock location
  // -------------------------------------------------------------------------
  logger.info("[3/8] Getting stock location...");
  const existingLocations = await stockLocationService.listStockLocations({});
  let stockLocation: { id: string };
  if (existingLocations.length > 0) {
    stockLocation = { id: existingLocations[0].id };
    logger.info(`   Using existing stock location: ${existingLocations[0].name}`);
  } else {
    const location = await stockLocationService.createStockLocations({
      name: "Entrepot B2B Pro - Lyon",
      address: {
        address_1: "Zone Industrielle des Platanes",
        city: "Lyon",
        country_code: "fr",
        postal_code: "69007",
      },
    });
    stockLocation = { id: location.id };
    logger.info("   Created new stock location");
  }

  // -------------------------------------------------------------------------
  // Step 5: Create B2B categories
  // -------------------------------------------------------------------------
  logger.info("[4/8] Creating B2B categories...");
  const categoryMap: Record<string, string> = {};

  // First, get existing categories
  const existingCategories = await productService.listProductCategories({});
  for (const cat of existingCategories) {
    categoryMap[cat.handle] = cat.id;
  }
  logger.info(`   Found ${existingCategories.length} existing categories`);

  // Create B2B categories
  await createCategoriesRecursively(productService, B2B_CATEGORIES, undefined, categoryMap, logger);
  logger.info(`   Total categories available: ${Object.keys(categoryMap).length}`);

  // -------------------------------------------------------------------------
  // Step 5b: Create B2B collections
  // -------------------------------------------------------------------------
  logger.info("[5/10] Creating B2B collections...");
  const collectionMap: Record<string, string> = {};

  const existingCollections = await productService.listProductCollections({});
  for (const col of existingCollections) {
    collectionMap[col.handle] = col.id;
  }
  logger.info(`   Found ${existingCollections.length} existing collections`);

  for (const collectionDef of B2B_COLLECTIONS) {
    if (!collectionMap[collectionDef.handle]) {
      const collection = await productService.createProductCollections({
        title: collectionDef.title,
        handle: collectionDef.handle,
        metadata: collectionDef.metadata,
      });
      collectionMap[collectionDef.handle] = collection.id;
      logger.info(`   Created collection: ${collectionDef.title}`);
    } else {
      logger.info(`   Collection exists: ${collectionDef.title}`);
    }
  }
  logger.info(`   Total collections: ${Object.keys(collectionMap).length}`);

  // -------------------------------------------------------------------------
  // Step 5c: Create B2B product types
  // -------------------------------------------------------------------------
  logger.info("[6/10] Creating B2B product types...");
  const typeMap: Record<string, string> = {};

  const existingTypes = await productService.listProductTypes({});
  for (const type of existingTypes) {
    typeMap[type.value] = type.id;
  }
  logger.info(`   Found ${existingTypes.length} existing product types`);

  for (const typeDef of B2B_PRODUCT_TYPES) {
    if (!typeMap[typeDef.value]) {
      const productType = await productService.createProductTypes({
        value: typeDef.value,
        metadata: typeDef.metadata,
      });
      typeMap[typeDef.value] = productType.id;
      logger.info(`   Created type: ${typeDef.value}`);
    } else {
      logger.info(`   Type exists: ${typeDef.value}`);
    }
  }
  logger.info(`   Total product types: ${Object.keys(typeMap).length}`);

  // -------------------------------------------------------------------------
  // Step 7: Get marques (brands)
  // -------------------------------------------------------------------------
  logger.info("[7/10] Getting marques (brands)...");
  let marques: MarqueDTO[] = [];
  let marquesService: MarquesModuleService | null = null;
  let remoteLink: IRemoteLinkService | null = null;

  try {
    marquesService = container.resolve<MarquesModuleService>(MARQUES_MODULE);
    marques = await marquesService.listMarques({ is_active: true });
    logger.info(`   Found ${marques.length} active marques`);

    if (marques.length === 0) {
      logger.warn("   No marques found. Run seed-marques.ts first for proper brand linking.");
    }
  } catch {
    logger.warn("   Marques module not available. Products will use metadata.brand instead.");
  }

  try {
    remoteLink = container.resolve<IRemoteLinkService>("remoteLink");
  } catch {
    logger.warn("   Remote link service not available.");
  }

  // -------------------------------------------------------------------------
  // Step 8: Generate and create products
  // -------------------------------------------------------------------------
  logger.info("[8/10] Generating products...");

  const templates = getProductTemplates();
  const productsToCreate: ReturnType<typeof generateProductData>[] = [];
  let productIndex = 0;

  // Target distribution:
  // ~250 Electricite, ~250 Plomberie, ~250 Outillage, ~150 HVAC, ~100 Quincaillerie
  const categoryDistribution: Record<string, number> = {
    electricite: 250,
    plomberie: 250,
    outillage: 250,
    "chauffage-climatisation": 150,
    quincaillerie: 100,
  };

  // Collection assignment rules:
  // - Nouveautes: first 10% of products
  // - Best-Sellers: products 50-150 (index)
  // - Promotions: every 10th product
  // - Selection Pro: products with high price (random 5%)
  // - Eco-Responsable: products with "eco" or "led" in template
  // - Packs et Kits: products with "kit" or "pack" or "coffret" in name
  // - Renovation: plumbing and electrical products (random 10%)
  // - Chantier: tools and hardware (random 10%)
  function getCollectionForProduct(template: ProductTemplate, index: number): string | undefined {
    const name = `${template.namePrefix} ${template.nameSuffix}`.toLowerCase();

    // Packs et Kits
    if (name.includes("kit") || name.includes("pack") || name.includes("coffret") || name.includes("lot")) {
      return "packs-kits";
    }

    // Eco-Responsable (LED products, eco-friendly items)
    if (name.includes("led") || name.includes("eco") || name.includes("solaire")) {
      return "eco-responsable";
    }

    // Nouveautes (first 100 products)
    if (index < 100) {
      return "nouveautes";
    }

    // Best-Sellers (index 100-250)
    if (index >= 100 && index < 250) {
      return "bestsellers";
    }

    // Promotions (every 10th product starting from 250)
    if (index >= 250 && index % 10 === 0) {
      return "promotions";
    }

    // Selection Pro (every 15th product)
    if (index % 15 === 0) {
      return "selection-pro";
    }

    // Renovation (electrical and plumbing, every 20th)
    if ((template.categoryHandle.includes("electricite") || template.categoryHandle.includes("plomberie")) && index % 20 === 0) {
      return "renovation";
    }

    // Chantier (tools, every 25th)
    if (template.categoryHandle.includes("outillage") && index % 25 === 0) {
      return "chantier";
    }

    return undefined;
  }

  // Helper to generate product data
  function generateProductData(
    template: ProductTemplate,
    index: number,
    brandSlug: string | undefined
  ) {
    // Pass productIndex to generate diverse variant configs with unique images
    const variants = generateVariantConfigs(template, index);
    // Generate unique title and description using helper functions
    const uniqueTitle = generateUniqueTitle(template, index);
    const uniqueDescription = generateUniqueDescription(template, index, brandSlug);
    const handle = slugify(`${template.namePrefix}-${template.nameSuffix}-${index}`);
    const collectionHandle = getCollectionForProduct(template, index);

    // Get category-coherent product images using the new mapping
    const productImages = getProductImages(template.categoryHandle, template.productType, index);

    // Collect all images: main product images + variant images
    const allImages = [
      ...productImages.urls.map((url) => ({ url })),
      ...variants.map((v) => ({ url: v.imageUrl })),
    ];
    // Remove duplicate URLs
    const uniqueImages = allImages.filter(
      (img, idx, arr) => arr.findIndex((i) => i.url === img.url) === idx
    );

    return {
      title: uniqueTitle,
      handle,
      description: uniqueDescription,
      status: "published" as const,
      thumbnail: productImages.thumbnail, // Set thumbnail from category-matched image
      type_id: typeMap[template.productType] || undefined,
      collection_id: collectionHandle && collectionMap[collectionHandle] ? collectionMap[collectionHandle] : undefined,
      categories: categoryMap[template.categoryHandle]
        ? [{ id: categoryMap[template.categoryHandle] }]
        : [],
      sales_channels: salesChannels,
      images: uniqueImages,
      weight: template.weight,
      hs_code: template.hsCode,
      origin_country: "FR",
      metadata: {
        brand: brandSlug || template.brands[0],
        modelId: generateModelIdentifier(index),
        referenceCode: generateReferenceCode(index),
        garantie: `${2 + (index % 3)} ans`,
        usage: "Professionnel",
        productType: template.productType,
      },
      options: [
        {
          title: template.optionName,
          values: variants.map((v) => v.optionValue),
        },
      ],
      variants: variants.map((v, vi) => ({
        title: v.title,
        sku: generateSKU(template.skuPrefix, index, vi),
        options: { [template.optionName]: v.optionValue },
        prices: [
          {
            amount: generatePrice(template.priceRange, v.priceMod, index + vi),
            currency_code: "eur",
          },
        ],
        manage_inventory: true,
        weight: Math.round(template.weight * v.weightMod),
        // Store variant image URL in metadata for frontend use
        metadata: {
          imageUrl: v.imageUrl,
          imageKeyword: v.imageKeyword,
          variantSpec: v.optionValue,
        },
      })),
      _brandSlug: brandSlug, // Store for later linking
    };
  }

  // Generate products for each category
  for (const [rootCategory, targetCount] of Object.entries(categoryDistribution)) {
    // Find templates for this category using the rootCategory field
    const categoryTemplates = templates.filter((t) => t.rootCategory === rootCategory);

    if (categoryTemplates.length === 0) {
      logger.warn(`   No templates found for category: ${rootCategory}`);
      continue;
    }

    // Generate products until we reach target
    let categoryProductCount = 0;
    while (categoryProductCount < targetCount && productsToCreate.length < 1000) {
      const template = categoryTemplates[categoryProductCount % categoryTemplates.length];
      const brandSlug = getRandomBrand(template.categoryHandle, productIndex, marques);

      const productData = generateProductData(template, productIndex, brandSlug);
      productsToCreate.push(productData);

      productIndex++;
      categoryProductCount++;
    }

    logger.info(`   Generated ${categoryProductCount} products for ${rootCategory}`);
  }

  logger.info(`   Total products to create: ${productsToCreate.length}`);

  // -------------------------------------------------------------------------
  // Step 7b: Create products in batches
  // -------------------------------------------------------------------------
  logger.info("[9/10] Creating products in batches...");

  const BATCH_SIZE = 50;
  const createdProducts: Array<{ id: string; _brandSlug?: string }> = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
    const batch = productsToCreate.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(productsToCreate.length / BATCH_SIZE);

    logger.info(`   Batch ${batchNum}/${totalBatches} (${batch.length} products)...`);

    try {
      // Remove _brandSlug before creating (not a valid field)
      const productsInput = batch.map((p) => {
        const { _brandSlug, ...productData } = p;
        return productData;
      });

      const { result: products } = await createProductsWorkflow(container).run({
        input: { products: productsInput },
      });

      // Store created products with their brand slugs
      products.forEach((product, idx) => {
        createdProducts.push({
          id: product.id,
          _brandSlug: batch[idx]._brandSlug,
        });
      });

      successCount += products.length;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`   Batch ${batchNum} failed: ${message}`);
      errorCount += batch.length;
    }

    // Small delay between batches to avoid overwhelming the database
    if (i + BATCH_SIZE < productsToCreate.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  logger.info(`   Products created: ${successCount}, Errors: ${errorCount}`);

  // -------------------------------------------------------------------------
  // Step 8: Link products to marques
  // -------------------------------------------------------------------------
  if (remoteLink && marques.length > 0) {
    logger.info("[10/10] Linking products to marques...");

    let linkCount = 0;
    let linkErrors = 0;

    for (const product of createdProducts) {
      if (!product._brandSlug) continue;

      const marque = marques.find((m) => m.slug === product._brandSlug);
      if (!marque) continue;

      try {
        await remoteLink.create({
          [Modules.PRODUCT]: { product_id: product.id },
          [MARQUES_MODULE]: { marque_id: marque.id },
        });
        linkCount++;

        if (linkCount % 100 === 0) {
          logger.info(`   Linked ${linkCount} products...`);
        }
      } catch {
        linkErrors++;
      }
    }

    logger.info(`   Products linked to marques: ${linkCount}, Errors: ${linkErrors}`);
  } else {
    logger.info("[10/10] Skipping marque linking (service unavailable or no marques)");
  }

  // -------------------------------------------------------------------------
  // Create inventory levels
  // -------------------------------------------------------------------------
  logger.info("Creating inventory levels...");

  try {
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
    });

    if (inventoryItems.length > 0 && stockLocation.id) {
      const inventoryLevels = inventoryItems.map((item: { id: string }) => ({
        inventory_item_id: item.id,
        location_id: stockLocation.id,
        stocked_quantity: Math.floor(Math.random() * 500) + 50, // 50-550 units
      }));

      // Create in batches
      for (let i = 0; i < inventoryLevels.length; i += BATCH_SIZE) {
        const batch = inventoryLevels.slice(i, i + BATCH_SIZE);
        try {
          await createInventoryLevelsWorkflow(container).run({
            input: { inventory_levels: batch },
          });
        } catch {
          // Ignore inventory errors
        }
      }

      logger.info(`   Inventory levels created for ${inventoryItems.length} items`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`   Could not create inventory levels: ${message}`);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  logger.info("");
  logger.info("=".repeat(70));
  logger.info("B2B Products Seed Summary");
  logger.info("=".repeat(70));
  logger.info(`Sales Channels: Web + App`);
  logger.info(`Categories: ${Object.keys(categoryMap).length}`);
  logger.info(`Collections: ${Object.keys(collectionMap).length}`);
  logger.info(`Product Types: ${Object.keys(typeMap).length}`);
  logger.info(`Products created: ${successCount}`);
  logger.info(`Products with errors: ${errorCount}`);
  logger.info(`Total variants: ~${successCount * 4}`);
  logger.info("");
  logger.info("Category breakdown:");
  logger.info(`   - Electricite: ~250 products`);
  logger.info(`   - Plomberie: ~250 products`);
  logger.info(`   - Outillage: ~250 products`);
  logger.info(`   - Chauffage/Climatisation: ~150 products`);
  logger.info(`   - Quincaillerie: ~100 products`);
  logger.info("");
  logger.info("Collections: Nouveautes, Best-Sellers, Promotions, Selection Pro,");
  logger.info("             Eco-Responsable, Packs et Kits, Renovation, Chantier");
  logger.info("");
  logger.info("Product Types: 22 types covering all categories");
  logger.info("");
  logger.info("=".repeat(70));
  logger.info("B2B Products seed completed!");
  logger.info("=".repeat(70));
}
