/**
 * Update Category Customizations Script
 *
 * Updates all existing categories with Unsplash images and icons.
 * Run with: npx medusa exec ./src/scripts/update-category-customizations.ts
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * Category customization data
 * Maps category handles to their image_url and icon
 */
interface CategoryCustomization {
  image_url: string;
  icon: string;
}

/**
 * Unsplash images and icons for all categories
 * Using direct Unsplash image URLs for reliable hosting
 */
const CATEGORY_CUSTOMIZATIONS: Record<string, CategoryCustomization> = {
  // ============================================================================
  // LEVEL 1: ROOT CATEGORIES
  // ============================================================================
  "electricite": {
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    icon: "bolt",
  },
  "plomberie": {
    image_url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    icon: "droplets",
  },
  "outillage": {
    image_url: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80",
    icon: "wrench",
  },
  "chauffage-climatisation": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "thermometer",
  },
  "quincaillerie": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },

  // ============================================================================
  // LEVEL 2: ELECTRICITE SUB-CATEGORIES
  // ============================================================================
  "cablage-fils": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },
  "appareillage-electrique": {
    image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    icon: "outlet",
  },
  "eclairage": {
    image_url: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80",
    icon: "lightbulb",
  },

  // ============================================================================
  // LEVEL 2: PLOMBERIE SUB-CATEGORIES
  // ============================================================================
  "tuyauterie": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "raccords": {
    image_url: "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=800&q=80",
    icon: "settings",
  },
  "robinetterie": {
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    icon: "faucet",
  },
  "sanitaires": {
    image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
    icon: "droplets",
  },

  // ============================================================================
  // LEVEL 2: OUTILLAGE SUB-CATEGORIES
  // ============================================================================
  "outillage-electroportatif": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "outillage-a-main": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "hammer",
  },
  "outillage-mesure": {
    image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    icon: "ruler",
  },

  // ============================================================================
  // LEVEL 2: CHAUFFAGE SUB-CATEGORIES
  // ============================================================================
  "radiateurs": {
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    icon: "flame",
  },
  "chaudieres": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "flame",
  },
  "climatisation": {
    image_url: "https://images.unsplash.com/photo-1631545806609-c31851d4a6aa?w=800&q=80",
    icon: "snowflake",
  },
  "ventilation": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "fan",
  },

  // ============================================================================
  // LEVEL 2: QUINCAILLERIE SUB-CATEGORIES
  // ============================================================================
  "visserie-boulonnerie": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },
  "chevilles-fixations": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "box",
  },
  "serrurerie": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "lock",
  },

  // ============================================================================
  // LEVEL 3: ELECTRICITE - CABLAGE
  // ============================================================================
  "cables-electriques": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },
  "fils-conducteurs": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },

  // ============================================================================
  // LEVEL 3: ELECTRICITE - APPAREILLAGE
  // ============================================================================
  "interrupteurs-prises": {
    image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    icon: "outlet",
  },
  "tableaux-electriques": {
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    icon: "bolt",
  },

  // ============================================================================
  // LEVEL 3: ELECTRICITE - ECLAIRAGE
  // ============================================================================
  "ampoules-led": {
    image_url: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80",
    icon: "lightbulb",
  },
  "luminaires": {
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    icon: "lightbulb",
  },
  "eclairage-exterieur": {
    image_url: "https://images.unsplash.com/photo-1558882224-dda166733046?w=800&q=80",
    icon: "lightbulb",
  },

  // ============================================================================
  // LEVEL 3: PLOMBERIE - TUYAUTERIE
  // ============================================================================
  "tubes-pvc": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "tubes-cuivre": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "tubes-multicouche": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "tubes-per": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },

  // ============================================================================
  // LEVEL 3: PLOMBERIE - RACCORDS
  // ============================================================================
  "raccords-pvc": {
    image_url: "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=800&q=80",
    icon: "settings",
  },
  "raccords-laiton": {
    image_url: "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=800&q=80",
    icon: "settings",
  },
  "raccords-multicouche": {
    image_url: "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=800&q=80",
    icon: "settings",
  },

  // ============================================================================
  // LEVEL 3: PLOMBERIE - ROBINETTERIE
  // ============================================================================
  "mitigeurs": {
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    icon: "faucet",
  },
  "robinets-arret": {
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    icon: "faucet",
  },
  "vannes": {
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    icon: "settings",
  },

  // ============================================================================
  // LEVEL 3: PLOMBERIE - SANITAIRES
  // ============================================================================
  "wc": {
    image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
    icon: "droplets",
  },
  "lavabos-vasques": {
    image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
    icon: "droplets",
  },
  "douche": {
    image_url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    icon: "droplets",
  },

  // ============================================================================
  // LEVEL 3: OUTILLAGE - ELECTROPORTATIF
  // ============================================================================
  "perceuses-visseuses": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "meuleuses": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "scies-circulaires": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "perforateurs": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "ponceuses": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },

  // ============================================================================
  // LEVEL 3: OUTILLAGE - A MAIN
  // ============================================================================
  "tournevis": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "pinces": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "cles": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "marteaux": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "hammer",
  },

  // ============================================================================
  // LEVEL 3: OUTILLAGE - MESURE
  // ============================================================================
  "niveaux": {
    image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    icon: "ruler",
  },
  "metres-telemetres": {
    image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    icon: "ruler",
  },
  "multimetres": {
    image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    icon: "bolt",
  },

  // ============================================================================
  // LEVEL 3: CHAUFFAGE - RADIATEURS
  // ============================================================================
  "radiateurs-electriques": {
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    icon: "flame",
  },
  "radiateurs-eau-chaude": {
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    icon: "flame",
  },
  "seche-serviettes": {
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    icon: "flame",
  },

  // ============================================================================
  // LEVEL 3: CHAUFFAGE - CHAUDIERES
  // ============================================================================
  "chaudieres-gaz": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "flame",
  },
  "pompes-a-chaleur": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "thermometer",
  },

  // ============================================================================
  // LEVEL 3: CHAUFFAGE - CLIMATISATION
  // ============================================================================
  "climatiseurs-split": {
    image_url: "https://images.unsplash.com/photo-1631545806609-c31851d4a6aa?w=800&q=80",
    icon: "snowflake",
  },
  "climatiseurs-mobiles": {
    image_url: "https://images.unsplash.com/photo-1631545806609-c31851d4a6aa?w=800&q=80",
    icon: "snowflake",
  },

  // ============================================================================
  // LEVEL 3: CHAUFFAGE - VENTILATION
  // ============================================================================
  "vmc": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "fan",
  },
  "extracteurs": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "fan",
  },

  // ============================================================================
  // LEVEL 3: QUINCAILLERIE - VISSERIE
  // ============================================================================
  "vis": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },
  "boulons": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },
  "ecrous-rondelles": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },

  // ============================================================================
  // LEVEL 3: QUINCAILLERIE - CHEVILLES
  // ============================================================================
  "chevilles": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "box",
  },
  "fixations-lourdes": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "shield",
  },

  // ============================================================================
  // LEVEL 3: QUINCAILLERIE - SERRURERIE
  // ============================================================================
  "serrures": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "lock",
  },
  "cylindres-cles": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "key",
  },
  "poignees": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "lock",
  },

  // ============================================================================
  // LEVEL 4 & 5: DEEP CATEGORIES (selected)
  // ============================================================================

  // Electricite - Cables level 4-5
  "cables-domestiques": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },
  "cables-industriels": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },
  "cables-h07v-u": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },
  "cables-h07v-r": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },
  "cables-h07v-k": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },
  "cables-armes": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },
  "cables-blindes": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "cable",
  },

  // Electricite - Appareillage level 4-5
  "gamme-residentielle": {
    image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    icon: "outlet",
  },
  "gamme-professionnelle": {
    image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    icon: "outlet",
  },
  "appareillage-odace": {
    image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    icon: "outlet",
  },
  "appareillage-celiane": {
    image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    icon: "outlet",
  },
  "appareillage-mosaic": {
    image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
    icon: "outlet",
  },
  "coffrets-electriques": {
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    icon: "bolt",
  },
  "coffrets-1-rangee": {
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    icon: "bolt",
  },
  "coffrets-2-rangees": {
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    icon: "bolt",
  },
  "coffrets-3-rangees-plus": {
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    icon: "bolt",
  },
  "disjoncteurs": {
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    icon: "bolt",
  },
  "differentiels": {
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    icon: "shield",
  },

  // Electricite - Eclairage level 4
  "led-e27": {
    image_url: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80",
    icon: "lightbulb",
  },
  "led-e14": {
    image_url: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80",
    icon: "lightbulb",
  },
  "led-gu10": {
    image_url: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80",
    icon: "lightbulb",
  },
  "led-g9": {
    image_url: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80",
    icon: "lightbulb",
  },
  "spots-encastres": {
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    icon: "lightbulb",
  },
  "plafonniers": {
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    icon: "lightbulb",
  },
  "projecteurs-led": {
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    icon: "lightbulb",
  },

  // Plomberie - Tuyauterie level 4-5
  "pvc-evacuation": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "pvc-pression": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "pvc-32mm": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "pvc-40mm": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "pvc-50mm": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },
  "pvc-100mm": {
    image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    icon: "pipe",
  },

  // Plomberie - Mitigeurs level 4
  "mitigeurs-cuisine": {
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    icon: "faucet",
  },
  "mitigeurs-salle-de-bain": {
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    icon: "faucet",
  },
  "mitigeurs-douche": {
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    icon: "faucet",
  },

  // Plomberie - Sanitaires level 4-5
  "wc-suspendus": {
    image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
    icon: "droplets",
  },
  "wc-a-poser": {
    image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
    icon: "droplets",
  },
  "bati-supports": {
    image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
    icon: "settings",
  },
  "receveurs-douche": {
    image_url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    icon: "droplets",
  },
  "parois-douche": {
    image_url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    icon: "droplets",
  },
  "colonnes-douche": {
    image_url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    icon: "droplets",
  },

  // Outillage - Perceuses level 4-5
  "perceuses-sans-fil": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "perceuses-filaires": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "perceuses-12v": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "perceuses-18v": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },
  "perceuses-36v": {
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
    icon: "settings",
  },

  // Outillage - Tournevis level 4
  "tournevis-plats": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "tournevis-cruciformes": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "tournevis-torx": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "tournevis-isoles": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },

  // Outillage - Pinces level 4
  "pinces-universelles": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "pinces-coupantes": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "pinces-a-bec": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },

  // Outillage - Cles level 4
  "cles-plates": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "cles-a-molette": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "cles-allen": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },
  "cles-dynamometriques": {
    image_url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    icon: "wrench",
  },

  // Outillage - Niveaux level 4
  "niveaux-a-bulle": {
    image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    icon: "ruler",
  },
  "niveaux-laser": {
    image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    icon: "ruler",
  },

  // Chauffage - Radiateurs level 4
  "radiateurs-inertie": {
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    icon: "flame",
  },
  "radiateurs-rayonnants": {
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    icon: "flame",
  },
  "convecteurs": {
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    icon: "flame",
  },

  // Chauffage - Chaudieres level 4-5
  "chaudieres-murales": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "flame",
  },
  "chaudieres-sol": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "flame",
  },
  "chaudieres-condensation": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "flame",
  },
  "pac-air-eau": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "thermometer",
  },
  "pac-air-air": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "thermometer",
  },
  "pac-geothermiques": {
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    icon: "thermometer",
  },

  // Chauffage - VMC level 4
  "vmc-simple-flux": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "fan",
  },
  "vmc-double-flux": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "fan",
  },

  // Quincaillerie - Vis level 4
  "vis-a-bois": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },
  "vis-a-metaux": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },
  "vis-autoforantes": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },
  "vis-inox": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "screw",
  },

  // Quincaillerie - Chevilles level 4
  "chevilles-nylon": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "box",
  },
  "chevilles-chimiques": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "box",
  },
  "chevilles-metalliques": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "box",
  },
  "chevilles-placo": {
    image_url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    icon: "box",
  },

  // Quincaillerie - Serrures level 4
  "serrures-encastrees": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "lock",
  },
  "serrures-applique": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "lock",
  },
  "serrures-multipoints": {
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    icon: "shield",
  },
};

/**
 * Main function to update all category customizations
 */
export default async function updateCategoryCustomizations({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  logger.info("=".repeat(60));
  logger.info("Update Category Customizations");
  logger.info("=".repeat(60));

  // Get all categories
  const categories = await productService.listProductCategories(
    {},
    { select: ["id", "name", "handle", "metadata"] }
  );

  if (categories.length === 0) {
    logger.info("No categories found. Run seed-categories.ts first.");
    return;
  }

  logger.info(`Found ${categories.length} categories to update...`);
  logger.info("");

  let updated = 0;
  let skipped = 0;

  for (const category of categories) {
    const customization = CATEGORY_CUSTOMIZATIONS[category.handle];

    if (!customization) {
      // No customization defined for this category
      skipped++;
      continue;
    }

    try {
      // Merge with existing metadata
      const existingMetadata = (category.metadata as Record<string, unknown>) || {};
      const updatedMetadata = {
        ...existingMetadata,
        image_url: customization.image_url,
        icon: customization.icon,
      };

      await productService.updateProductCategories(category.id, {
        metadata: updatedMetadata,
      });

      logger.info(`   Updated: ${category.name} (${category.handle}) - icon: ${customization.icon}`);
      updated++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`   Failed to update ${category.name}: ${message}`);
    }
  }

  logger.info("");
  logger.info("=".repeat(60));
  logger.info("Update Summary");
  logger.info("=".repeat(60));
  logger.info(`   - Updated: ${updated} categories`);
  logger.info(`   - Skipped (no customization defined): ${skipped} categories`);
  logger.info("");
  logger.info("Category customization update completed!");
  logger.info("");
  logger.info("Next steps:");
  logger.info("   1. Sync App Search: npx medusa exec ./src/scripts/sync-search-indexes.ts");
  logger.info("   2. Check admin: http://localhost:9000/app/categories");
}
