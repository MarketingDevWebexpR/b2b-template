/**
 * Seed Categories Script - B2B Distributor Business
 *
 * Comprehensive category hierarchy for a B2B wholesale platform specializing in
 * electrical, plumbing, tools, HVAC, and hardware products.
 * Categories are organized up to 5 levels deep to support detailed product classification.
 *
 * Run with: npx medusa exec ./src/scripts/seed-categories.ts
 *
 * @packageDocumentation
 */

import type { ExecArgs, Logger } from "@medusajs/framework/types";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * Category definition with metadata for B2B distributor
 */
interface CategoryDefinition {
  /** Category name in French */
  name: string;
  /** URL-friendly handle/slug */
  handle: string;
  /** Category description in French */
  description: string;
  /** Metadata including English translation and optional icon */
  metadata: {
    name_en: string;
    icon?: string;
    image_url?: string;
  };
  /** Child categories (recursive structure) */
  children?: CategoryDefinition[];
}

/**
 * Complete B2B distributor category hierarchy with up to 5 levels
 */
const B2B_CATEGORIES: CategoryDefinition[] = [
  // ============================================================================
  // LEVEL 1: ELECTRICITE (ELECTRICAL)
  // ============================================================================
  {
    name: "Electricite",
    handle: "electricite",
    description: "Materiel electrique professionnel - cablage, appareillage, eclairage et automatismes",
    metadata: {
      name_en: "Electrical",
      icon: "bolt",
      image_url: "/images/categories/electricite.jpg",
    },
    children: [
      // Level 2: Cablage et Fils
      {
        name: "Cablage et Fils",
        handle: "cablage-fils",
        description: "Cables electriques, fils et conducteurs pour installations residentielles et industrielles",
        metadata: {
          name_en: "Wiring and Cables",
          icon: "cable",
        },
        children: [
          // Level 3: Cables electriques
          {
            name: "Cables electriques",
            handle: "cables-electriques",
            description: "Cables electriques domestiques et industriels",
            metadata: { name_en: "Electrical Cables" },
            children: [
              // Level 4: Cables domestiques
              {
                name: "Cables domestiques",
                handle: "cables-domestiques",
                description: "Cables pour installations residentielles",
                metadata: { name_en: "Domestic Cables" },
                children: [
                  // Level 5
                  {
                    name: "Cables H07V-U",
                    handle: "cables-h07v-u",
                    description: "Cables rigides H07V-U pour installation fixe",
                    metadata: { name_en: "H07V-U Cables" },
                  },
                  {
                    name: "Cables H07V-R",
                    handle: "cables-h07v-r",
                    description: "Cables semi-rigides H07V-R",
                    metadata: { name_en: "H07V-R Cables" },
                  },
                  {
                    name: "Cables H07V-K",
                    handle: "cables-h07v-k",
                    description: "Cables souples H07V-K pour cablage",
                    metadata: { name_en: "H07V-K Cables" },
                  },
                ],
              },
              // Level 4: Cables industriels
              {
                name: "Cables industriels",
                handle: "cables-industriels",
                description: "Cables pour applications industrielles",
                metadata: { name_en: "Industrial Cables" },
                children: [
                  {
                    name: "Cables armes",
                    handle: "cables-armes",
                    description: "Cables avec armure metallique de protection",
                    metadata: { name_en: "Armored Cables" },
                  },
                  {
                    name: "Cables blindes",
                    handle: "cables-blindes",
                    description: "Cables blindes anti-perturbations electromagnetiques",
                    metadata: { name_en: "Shielded Cables" },
                  },
                ],
              },
            ],
          },
          // Level 3: Fils et conducteurs
          {
            name: "Fils et conducteurs",
            handle: "fils-conducteurs",
            description: "Fils electriques et conducteurs de cuivre",
            metadata: { name_en: "Wires and Conductors" },
          },
        ],
      },
      // Level 2: Appareillage electrique
      {
        name: "Appareillage electrique",
        handle: "appareillage-electrique",
        description: "Interrupteurs, prises, tableaux et protection electrique",
        metadata: {
          name_en: "Electrical Equipment",
          icon: "outlet",
        },
        children: [
          // Level 3: Interrupteurs et prises
          {
            name: "Interrupteurs et prises",
            handle: "interrupteurs-prises",
            description: "Interrupteurs, prises de courant et appareillage mural",
            metadata: { name_en: "Switches and Outlets" },
            children: [
              // Level 4: Gamme residentielle
              {
                name: "Gamme residentielle",
                handle: "gamme-residentielle",
                description: "Appareillage pour habitat et logements",
                metadata: { name_en: "Residential Range" },
                children: [
                  // Level 5
                  {
                    name: "Odace",
                    handle: "appareillage-odace",
                    description: "Gamme Odace Schneider Electric",
                    metadata: { name_en: "Odace Range" },
                  },
                  {
                    name: "Celiane",
                    handle: "appareillage-celiane",
                    description: "Gamme Celiane Legrand",
                    metadata: { name_en: "Celiane Range" },
                  },
                  {
                    name: "Mosaic",
                    handle: "appareillage-mosaic",
                    description: "Gamme Mosaic Legrand",
                    metadata: { name_en: "Mosaic Range" },
                  },
                ],
              },
              // Level 4: Gamme professionnelle
              {
                name: "Gamme professionnelle",
                handle: "gamme-professionnelle",
                description: "Appareillage pour batiments tertiaires et industriels",
                metadata: { name_en: "Professional Range" },
              },
            ],
          },
          // Level 3: Tableaux electriques
          {
            name: "Tableaux electriques",
            handle: "tableaux-electriques",
            description: "Coffrets, disjoncteurs et protection differentielle",
            metadata: { name_en: "Electrical Panels" },
            children: [
              // Level 4: Coffrets
              {
                name: "Coffrets",
                handle: "coffrets-electriques",
                description: "Coffrets et armoires electriques",
                metadata: { name_en: "Enclosures" },
                children: [
                  // Level 5
                  {
                    name: "Coffrets 1 rangee",
                    handle: "coffrets-1-rangee",
                    description: "Coffrets electriques 1 rangee 13 modules",
                    metadata: { name_en: "1-Row Enclosures" },
                  },
                  {
                    name: "Coffrets 2 rangees",
                    handle: "coffrets-2-rangees",
                    description: "Coffrets electriques 2 rangees 26 modules",
                    metadata: { name_en: "2-Row Enclosures" },
                  },
                  {
                    name: "Coffrets 3+ rangees",
                    handle: "coffrets-3-rangees-plus",
                    description: "Coffrets electriques 3 rangees et plus",
                    metadata: { name_en: "3+ Row Enclosures" },
                  },
                ],
              },
              // Level 4: Disjoncteurs
              {
                name: "Disjoncteurs",
                handle: "disjoncteurs",
                description: "Disjoncteurs divisionnaires et de branchement",
                metadata: { name_en: "Circuit Breakers" },
              },
              // Level 4: Differentiels
              {
                name: "Differentiels",
                handle: "differentiels",
                description: "Interrupteurs differentiels et disjoncteurs differentiels",
                metadata: { name_en: "RCDs" },
              },
            ],
          },
        ],
      },
      // Level 2: Eclairage
      {
        name: "Eclairage",
        handle: "eclairage",
        description: "Solutions d'eclairage LED et luminaires professionnels",
        metadata: {
          name_en: "Lighting",
          icon: "lightbulb",
        },
        children: [
          // Level 3: Ampoules LED
          {
            name: "Ampoules LED",
            handle: "ampoules-led",
            description: "Ampoules LED tous culots",
            metadata: { name_en: "LED Bulbs" },
            children: [
              {
                name: "LED E27",
                handle: "led-e27",
                description: "Ampoules LED culot E27 gros vis",
                metadata: { name_en: "E27 LED Bulbs" },
              },
              {
                name: "LED E14",
                handle: "led-e14",
                description: "Ampoules LED culot E14 petit vis",
                metadata: { name_en: "E14 LED Bulbs" },
              },
              {
                name: "LED GU10",
                handle: "led-gu10",
                description: "Ampoules LED culot GU10 spot",
                metadata: { name_en: "GU10 LED Bulbs" },
              },
              {
                name: "LED G9",
                handle: "led-g9",
                description: "Ampoules LED culot G9 capsule",
                metadata: { name_en: "G9 LED Bulbs" },
              },
            ],
          },
          // Level 3: Luminaires
          {
            name: "Luminaires",
            handle: "luminaires",
            description: "Luminaires interieurs professionnels",
            metadata: { name_en: "Light Fixtures" },
            children: [
              {
                name: "Spots encastres",
                handle: "spots-encastres",
                description: "Spots LED encastrables plafond",
                metadata: { name_en: "Recessed Spotlights" },
              },
              {
                name: "Plafonniers",
                handle: "plafonniers",
                description: "Plafonniers et dalles LED",
                metadata: { name_en: "Ceiling Lights" },
              },
              {
                name: "Projecteurs",
                handle: "projecteurs-led",
                description: "Projecteurs LED interieurs",
                metadata: { name_en: "LED Projectors" },
              },
            ],
          },
          // Level 3: Eclairage exterieur
          {
            name: "Eclairage exterieur",
            handle: "eclairage-exterieur",
            description: "Eclairage exterieur et projecteurs de chantier",
            metadata: { name_en: "Outdoor Lighting" },
          },
        ],
      },
    ],
  },

  // ============================================================================
  // LEVEL 1: PLOMBERIE (PLUMBING)
  // ============================================================================
  {
    name: "Plomberie",
    handle: "plomberie",
    description: "Fournitures de plomberie professionnelle - tuyauterie, raccords, robinetterie et sanitaires",
    metadata: {
      name_en: "Plumbing",
      icon: "pipe",
      image_url: "/images/categories/plomberie.jpg",
    },
    children: [
      // Level 2: Tuyauterie
      {
        name: "Tuyauterie",
        handle: "tuyauterie",
        description: "Tubes et tuyaux pour alimentation et evacuation",
        metadata: {
          name_en: "Piping",
          icon: "tube",
        },
        children: [
          // Level 3: Tubes PVC
          {
            name: "Tubes PVC",
            handle: "tubes-pvc",
            description: "Tubes PVC pour evacuation et pression",
            metadata: { name_en: "PVC Pipes" },
            children: [
              // Level 4: Evacuation
              {
                name: "PVC Evacuation",
                handle: "pvc-evacuation",
                description: "Tubes PVC evacuation eaux usees",
                metadata: { name_en: "PVC Drainage" },
                children: [
                  // Level 5
                  {
                    name: "PVC diametre 32mm",
                    handle: "pvc-32mm",
                    description: "Tubes PVC evacuation diametre 32mm",
                    metadata: { name_en: "32mm PVC" },
                  },
                  {
                    name: "PVC diametre 40mm",
                    handle: "pvc-40mm",
                    description: "Tubes PVC evacuation diametre 40mm",
                    metadata: { name_en: "40mm PVC" },
                  },
                  {
                    name: "PVC diametre 50mm",
                    handle: "pvc-50mm",
                    description: "Tubes PVC evacuation diametre 50mm",
                    metadata: { name_en: "50mm PVC" },
                  },
                  {
                    name: "PVC diametre 100mm",
                    handle: "pvc-100mm",
                    description: "Tubes PVC evacuation diametre 100mm",
                    metadata: { name_en: "100mm PVC" },
                  },
                ],
              },
              // Level 4: Pression
              {
                name: "PVC Pression",
                handle: "pvc-pression",
                description: "Tubes PVC pression pour alimentation",
                metadata: { name_en: "Pressure PVC" },
              },
            ],
          },
          // Level 3: Tubes cuivre
          {
            name: "Tubes cuivre",
            handle: "tubes-cuivre",
            description: "Tubes cuivre pour eau et gaz",
            metadata: { name_en: "Copper Pipes" },
          },
          // Level 3: Tubes multicouche
          {
            name: "Tubes multicouche",
            handle: "tubes-multicouche",
            description: "Tubes multicouche aluminium-PEX",
            metadata: { name_en: "Multilayer Pipes" },
          },
          // Level 3: Tubes PER
          {
            name: "Tubes PER",
            handle: "tubes-per",
            description: "Tubes PER polyethylene reticule",
            metadata: { name_en: "PEX Pipes" },
          },
        ],
      },
      // Level 2: Raccords
      {
        name: "Raccords",
        handle: "raccords",
        description: "Raccords de plomberie tous materiaux",
        metadata: {
          name_en: "Fittings",
          icon: "fitting",
        },
        children: [
          {
            name: "Raccords PVC",
            handle: "raccords-pvc",
            description: "Raccords PVC coudes, tes, manchons",
            metadata: { name_en: "PVC Fittings" },
          },
          {
            name: "Raccords laiton",
            handle: "raccords-laiton",
            description: "Raccords laiton filetage et compression",
            metadata: { name_en: "Brass Fittings" },
          },
          {
            name: "Raccords multicouche",
            handle: "raccords-multicouche",
            description: "Raccords a sertir et a compression multicouche",
            metadata: { name_en: "Multilayer Fittings" },
          },
        ],
      },
      // Level 2: Robinetterie
      {
        name: "Robinetterie",
        handle: "robinetterie",
        description: "Robinetterie sanitaire et technique",
        metadata: {
          name_en: "Faucets and Valves",
          icon: "faucet",
        },
        children: [
          // Level 3: Mitigeurs
          {
            name: "Mitigeurs",
            handle: "mitigeurs",
            description: "Mitigeurs pour cuisine et salle de bain",
            metadata: { name_en: "Mixers" },
            children: [
              {
                name: "Mitigeurs cuisine",
                handle: "mitigeurs-cuisine",
                description: "Mitigeurs evier cuisine",
                metadata: { name_en: "Kitchen Mixers" },
              },
              {
                name: "Mitigeurs salle de bain",
                handle: "mitigeurs-salle-de-bain",
                description: "Mitigeurs lavabo salle de bain",
                metadata: { name_en: "Bathroom Mixers" },
              },
              {
                name: "Mitigeurs douche",
                handle: "mitigeurs-douche",
                description: "Mitigeurs et thermostatiques douche",
                metadata: { name_en: "Shower Mixers" },
              },
            ],
          },
          // Level 3: Robinets d'arret
          {
            name: "Robinets d'arret",
            handle: "robinets-arret",
            description: "Robinets d'arret et robinets de puisage",
            metadata: { name_en: "Stop Valves" },
          },
          // Level 3: Vannes
          {
            name: "Vannes",
            handle: "vannes",
            description: "Vannes a bille, vannes papillon et clapets",
            metadata: { name_en: "Valves" },
          },
        ],
      },
      // Level 2: Sanitaires
      {
        name: "Sanitaires",
        handle: "sanitaires",
        description: "Equipements sanitaires WC, lavabos et douches",
        metadata: {
          name_en: "Sanitary Ware",
          icon: "toilet",
        },
        children: [
          // Level 3: WC
          {
            name: "WC",
            handle: "wc",
            description: "Toilettes et equipements WC",
            metadata: { name_en: "Toilets" },
            children: [
              {
                name: "WC suspendus",
                handle: "wc-suspendus",
                description: "Cuvettes WC suspendues",
                metadata: { name_en: "Wall-Hung Toilets" },
              },
              {
                name: "WC a poser",
                handle: "wc-a-poser",
                description: "Cuvettes WC a poser au sol",
                metadata: { name_en: "Floor-Standing Toilets" },
              },
              {
                name: "Bati-supports",
                handle: "bati-supports",
                description: "Bati-supports et chassis pour WC suspendus",
                metadata: { name_en: "Frame Systems" },
              },
            ],
          },
          // Level 3: Lavabos et vasques
          {
            name: "Lavabos et vasques",
            handle: "lavabos-vasques",
            description: "Lavabos, vasques et plans de toilette",
            metadata: { name_en: "Basins and Sinks" },
          },
          // Level 3: Douche
          {
            name: "Douche",
            handle: "douche",
            description: "Equipements de douche complets",
            metadata: { name_en: "Shower" },
            children: [
              {
                name: "Receveurs",
                handle: "receveurs-douche",
                description: "Receveurs et bacs de douche",
                metadata: { name_en: "Shower Trays" },
              },
              {
                name: "Parois de douche",
                handle: "parois-douche",
                description: "Parois et portes de douche",
                metadata: { name_en: "Shower Screens" },
              },
              {
                name: "Colonnes de douche",
                handle: "colonnes-douche",
                description: "Colonnes et ensembles de douche",
                metadata: { name_en: "Shower Columns" },
              },
            ],
          },
        ],
      },
    ],
  },

  // ============================================================================
  // LEVEL 1: OUTILLAGE (TOOLS)
  // ============================================================================
  {
    name: "Outillage",
    handle: "outillage",
    description: "Outillage professionnel electroportatif et manuel pour tous les corps de metier",
    metadata: {
      name_en: "Tools",
      icon: "wrench",
      image_url: "/images/categories/outillage.jpg",
    },
    children: [
      // Level 2: Outillage electroportatif
      {
        name: "Outillage electroportatif",
        handle: "outillage-electroportatif",
        description: "Outils electriques sans fil et filaires",
        metadata: {
          name_en: "Power Tools",
          icon: "drill",
        },
        children: [
          // Level 3: Perceuses-visseuses
          {
            name: "Perceuses-visseuses",
            handle: "perceuses-visseuses",
            description: "Perceuses-visseuses sans fil et filaires",
            metadata: { name_en: "Drill Drivers" },
            children: [
              // Level 4: Sans fil
              {
                name: "Perceuses sans fil",
                handle: "perceuses-sans-fil",
                description: "Perceuses-visseuses sur batterie",
                metadata: { name_en: "Cordless Drills" },
                children: [
                  // Level 5
                  {
                    name: "Perceuses 12V",
                    handle: "perceuses-12v",
                    description: "Perceuses-visseuses batterie 12V",
                    metadata: { name_en: "12V Drills" },
                  },
                  {
                    name: "Perceuses 18V",
                    handle: "perceuses-18v",
                    description: "Perceuses-visseuses batterie 18V",
                    metadata: { name_en: "18V Drills" },
                  },
                  {
                    name: "Perceuses 36V",
                    handle: "perceuses-36v",
                    description: "Perceuses-visseuses batterie 36V haute puissance",
                    metadata: { name_en: "36V Drills" },
                  },
                ],
              },
              // Level 4: Filaires
              {
                name: "Perceuses filaires",
                handle: "perceuses-filaires",
                description: "Perceuses electriques avec fil",
                metadata: { name_en: "Corded Drills" },
              },
            ],
          },
          // Level 3: Meuleuses
          {
            name: "Meuleuses",
            handle: "meuleuses",
            description: "Meuleuses d'angle et droites",
            metadata: { name_en: "Grinders" },
          },
          // Level 3: Scies circulaires
          {
            name: "Scies circulaires",
            handle: "scies-circulaires",
            description: "Scies circulaires portatives et sur table",
            metadata: { name_en: "Circular Saws" },
          },
          // Level 3: Perforateurs
          {
            name: "Perforateurs",
            handle: "perforateurs",
            description: "Perforateurs burineurs SDS+ et SDS-Max",
            metadata: { name_en: "Rotary Hammers" },
          },
          // Level 3: Ponceuses
          {
            name: "Ponceuses",
            handle: "ponceuses",
            description: "Ponceuses vibrantes, excentriques et a bande",
            metadata: { name_en: "Sanders" },
          },
        ],
      },
      // Level 2: Outillage a main
      {
        name: "Outillage a main",
        handle: "outillage-a-main",
        description: "Outils a main professionnels",
        metadata: {
          name_en: "Hand Tools",
          icon: "hammer",
        },
        children: [
          // Level 3: Tournevis
          {
            name: "Tournevis",
            handle: "tournevis",
            description: "Tournevis et jeux de tournevis",
            metadata: { name_en: "Screwdrivers" },
            children: [
              {
                name: "Tournevis plats",
                handle: "tournevis-plats",
                description: "Tournevis a lame plate",
                metadata: { name_en: "Flathead Screwdrivers" },
              },
              {
                name: "Tournevis cruciformes",
                handle: "tournevis-cruciformes",
                description: "Tournevis Phillips et Pozidriv",
                metadata: { name_en: "Phillips Screwdrivers" },
              },
              {
                name: "Tournevis Torx",
                handle: "tournevis-torx",
                description: "Tournevis Torx et Torx Plus",
                metadata: { name_en: "Torx Screwdrivers" },
              },
              {
                name: "Tournevis isoles",
                handle: "tournevis-isoles",
                description: "Tournevis isoles VDE 1000V",
                metadata: { name_en: "Insulated Screwdrivers" },
              },
            ],
          },
          // Level 3: Pinces
          {
            name: "Pinces",
            handle: "pinces",
            description: "Pinces professionnelles",
            metadata: { name_en: "Pliers" },
            children: [
              {
                name: "Pinces universelles",
                handle: "pinces-universelles",
                description: "Pinces universelles et multiprises",
                metadata: { name_en: "Combination Pliers" },
              },
              {
                name: "Pinces coupantes",
                handle: "pinces-coupantes",
                description: "Pinces coupantes diagonales et de cote",
                metadata: { name_en: "Cutting Pliers" },
              },
              {
                name: "Pinces a bec",
                handle: "pinces-a-bec",
                description: "Pinces a bec long et demi-rond",
                metadata: { name_en: "Needle-Nose Pliers" },
              },
            ],
          },
          // Level 3: Cles
          {
            name: "Cles",
            handle: "cles",
            description: "Cles et jeux de cles",
            metadata: { name_en: "Wrenches" },
            children: [
              {
                name: "Cles plates",
                handle: "cles-plates",
                description: "Cles plates et mixtes",
                metadata: { name_en: "Open-End Wrenches" },
              },
              {
                name: "Cles a molette",
                handle: "cles-a-molette",
                description: "Cles a molette reglables",
                metadata: { name_en: "Adjustable Wrenches" },
              },
              {
                name: "Cles Allen",
                handle: "cles-allen",
                description: "Cles Allen et BTR",
                metadata: { name_en: "Allen Keys" },
              },
              {
                name: "Cles dynamometriques",
                handle: "cles-dynamometriques",
                description: "Cles dynamometriques a declenchement",
                metadata: { name_en: "Torque Wrenches" },
              },
            ],
          },
          // Level 3: Marteaux
          {
            name: "Marteaux",
            handle: "marteaux",
            description: "Marteaux, masses et maillets",
            metadata: { name_en: "Hammers" },
          },
        ],
      },
      // Level 2: Outillage de mesure
      {
        name: "Outillage de mesure",
        handle: "outillage-mesure",
        description: "Instruments de mesure professionnels",
        metadata: {
          name_en: "Measuring Tools",
          icon: "ruler",
        },
        children: [
          // Level 3: Niveaux
          {
            name: "Niveaux",
            handle: "niveaux",
            description: "Niveaux a bulle et laser",
            metadata: { name_en: "Levels" },
            children: [
              {
                name: "Niveaux a bulle",
                handle: "niveaux-a-bulle",
                description: "Niveaux a bulle professionnels",
                metadata: { name_en: "Spirit Levels" },
              },
              {
                name: "Niveaux laser",
                handle: "niveaux-laser",
                description: "Niveaux laser lignes et rotatifs",
                metadata: { name_en: "Laser Levels" },
              },
            ],
          },
          // Level 3: Metres et telemetres
          {
            name: "Metres et telemetres",
            handle: "metres-telemetres",
            description: "Metres rubans et telemetres laser",
            metadata: { name_en: "Tape Measures and Rangefinders" },
          },
          // Level 3: Multimetres
          {
            name: "Multimetres",
            handle: "multimetres",
            description: "Multimetres numeriques et pinces amperemetriques",
            metadata: { name_en: "Multimeters" },
          },
        ],
      },
    ],
  },

  // ============================================================================
  // LEVEL 1: CHAUFFAGE ET CLIMATISATION (HVAC)
  // ============================================================================
  {
    name: "Chauffage et Climatisation",
    handle: "chauffage-climatisation",
    description: "Solutions de chauffage, climatisation et ventilation pour batiments",
    metadata: {
      name_en: "Heating and Air Conditioning",
      icon: "thermometer",
      image_url: "/images/categories/chauffage-climatisation.jpg",
    },
    children: [
      // Level 2: Radiateurs
      {
        name: "Radiateurs",
        handle: "radiateurs",
        description: "Radiateurs electriques et eau chaude",
        metadata: {
          name_en: "Radiators",
          icon: "radiator",
        },
        children: [
          // Level 3: Radiateurs electriques
          {
            name: "Radiateurs electriques",
            handle: "radiateurs-electriques",
            description: "Radiateurs electriques toutes technologies",
            metadata: { name_en: "Electric Radiators" },
            children: [
              {
                name: "Radiateurs a inertie",
                handle: "radiateurs-inertie",
                description: "Radiateurs a inertie seche et fluide",
                metadata: { name_en: "Inertia Radiators" },
              },
              {
                name: "Radiateurs rayonnants",
                handle: "radiateurs-rayonnants",
                description: "Panneaux rayonnants",
                metadata: { name_en: "Radiant Panels" },
              },
              {
                name: "Convecteurs",
                handle: "convecteurs",
                description: "Convecteurs electriques",
                metadata: { name_en: "Convectors" },
              },
            ],
          },
          // Level 3: Radiateurs eau chaude
          {
            name: "Radiateurs eau chaude",
            handle: "radiateurs-eau-chaude",
            description: "Radiateurs pour chauffage central",
            metadata: { name_en: "Hot Water Radiators" },
          },
          // Level 3: Seche-serviettes
          {
            name: "Seche-serviettes",
            handle: "seche-serviettes",
            description: "Seche-serviettes electriques et mixtes",
            metadata: { name_en: "Towel Warmers" },
          },
        ],
      },
      // Level 2: Chaudieres
      {
        name: "Chaudieres",
        handle: "chaudieres",
        description: "Chaudieres gaz et pompes a chaleur",
        metadata: {
          name_en: "Boilers",
          icon: "boiler",
        },
        children: [
          // Level 3: Chaudieres gaz
          {
            name: "Chaudieres gaz",
            handle: "chaudieres-gaz",
            description: "Chaudieres gaz murales et sol",
            metadata: { name_en: "Gas Boilers" },
            children: [
              {
                name: "Chaudieres murales",
                handle: "chaudieres-murales",
                description: "Chaudieres gaz murales",
                metadata: { name_en: "Wall-Mounted Boilers" },
              },
              {
                name: "Chaudieres sol",
                handle: "chaudieres-sol",
                description: "Chaudieres gaz au sol",
                metadata: { name_en: "Floor-Standing Boilers" },
              },
              {
                name: "Chaudieres condensation",
                handle: "chaudieres-condensation",
                description: "Chaudieres gaz a condensation",
                metadata: { name_en: "Condensing Boilers" },
              },
            ],
          },
          // Level 3: Pompes a chaleur
          {
            name: "Pompes a chaleur",
            handle: "pompes-a-chaleur",
            description: "Pompes a chaleur air et geothermiques",
            metadata: { name_en: "Heat Pumps" },
            children: [
              {
                name: "PAC Air-eau",
                handle: "pac-air-eau",
                description: "Pompes a chaleur air-eau",
                metadata: { name_en: "Air-to-Water Heat Pumps" },
              },
              {
                name: "PAC Air-air",
                handle: "pac-air-air",
                description: "Pompes a chaleur air-air reversibles",
                metadata: { name_en: "Air-to-Air Heat Pumps" },
              },
              {
                name: "PAC Geothermiques",
                handle: "pac-geothermiques",
                description: "Pompes a chaleur geothermiques",
                metadata: { name_en: "Geothermal Heat Pumps" },
              },
            ],
          },
        ],
      },
      // Level 2: Climatisation
      {
        name: "Climatisation",
        handle: "climatisation",
        description: "Climatiseurs et systemes de refroidissement",
        metadata: {
          name_en: "Air Conditioning",
          icon: "snowflake",
        },
        children: [
          {
            name: "Climatiseurs split",
            handle: "climatiseurs-split",
            description: "Climatiseurs split mono et multi-split",
            metadata: { name_en: "Split Air Conditioners" },
          },
          {
            name: "Climatiseurs mobiles",
            handle: "climatiseurs-mobiles",
            description: "Climatiseurs mobiles monoblocs",
            metadata: { name_en: "Portable Air Conditioners" },
          },
        ],
      },
      // Level 2: Ventilation
      {
        name: "Ventilation",
        handle: "ventilation",
        description: "VMC et systemes de ventilation",
        metadata: {
          name_en: "Ventilation",
          icon: "fan",
        },
        children: [
          // Level 3: VMC
          {
            name: "VMC",
            handle: "vmc",
            description: "Ventilation mecanique controlee",
            metadata: { name_en: "Mechanical Ventilation" },
            children: [
              {
                name: "VMC Simple flux",
                handle: "vmc-simple-flux",
                description: "VMC simple flux auto et hygroreglables",
                metadata: { name_en: "Single-Flow VMC" },
              },
              {
                name: "VMC Double flux",
                handle: "vmc-double-flux",
                description: "VMC double flux avec echangeur",
                metadata: { name_en: "Double-Flow VMC" },
              },
            ],
          },
          // Level 3: Extracteurs
          {
            name: "Extracteurs",
            handle: "extracteurs",
            description: "Extracteurs d'air et aerateurs",
            metadata: { name_en: "Exhaust Fans" },
          },
        ],
      },
    ],
  },

  // ============================================================================
  // LEVEL 1: QUINCAILLERIE (HARDWARE)
  // ============================================================================
  {
    name: "Quincaillerie",
    handle: "quincaillerie",
    description: "Quincaillerie professionnelle - visserie, fixations et serrurerie",
    metadata: {
      name_en: "Hardware",
      icon: "screw",
      image_url: "/images/categories/quincaillerie.jpg",
    },
    children: [
      // Level 2: Visserie et boulonnerie
      {
        name: "Visserie et boulonnerie",
        handle: "visserie-boulonnerie",
        description: "Vis, boulons, ecrous et rondelles",
        metadata: {
          name_en: "Fasteners",
          icon: "bolt",
        },
        children: [
          // Level 3: Vis
          {
            name: "Vis",
            handle: "vis",
            description: "Vis tous types et materiaux",
            metadata: { name_en: "Screws" },
            children: [
              {
                name: "Vis a bois",
                handle: "vis-a-bois",
                description: "Vis a bois et agglomere",
                metadata: { name_en: "Wood Screws" },
              },
              {
                name: "Vis a metaux",
                handle: "vis-a-metaux",
                description: "Vis a metaux et tole",
                metadata: { name_en: "Machine Screws" },
              },
              {
                name: "Vis autoforantes",
                handle: "vis-autoforantes",
                description: "Vis autoperceuses et autotaraudeuses",
                metadata: { name_en: "Self-Drilling Screws" },
              },
              {
                name: "Vis inox",
                handle: "vis-inox",
                description: "Vis en acier inoxydable",
                metadata: { name_en: "Stainless Steel Screws" },
              },
            ],
          },
          // Level 3: Boulons
          {
            name: "Boulons",
            handle: "boulons",
            description: "Boulons et tiges filetees",
            metadata: { name_en: "Bolts" },
          },
          // Level 3: Ecrous et rondelles
          {
            name: "Ecrous et rondelles",
            handle: "ecrous-rondelles",
            description: "Ecrous, rondelles et freins",
            metadata: { name_en: "Nuts and Washers" },
          },
        ],
      },
      // Level 2: Chevilles et fixations
      {
        name: "Chevilles et fixations",
        handle: "chevilles-fixations",
        description: "Chevilles et systemes de fixation",
        metadata: {
          name_en: "Anchors and Fixings",
          icon: "anchor",
        },
        children: [
          // Level 3: Chevilles
          {
            name: "Chevilles",
            handle: "chevilles",
            description: "Chevilles tous materiaux",
            metadata: { name_en: "Wall Plugs" },
            children: [
              {
                name: "Chevilles nylon",
                handle: "chevilles-nylon",
                description: "Chevilles nylon universelles",
                metadata: { name_en: "Nylon Plugs" },
              },
              {
                name: "Chevilles chimiques",
                handle: "chevilles-chimiques",
                description: "Scellements chimiques et resines",
                metadata: { name_en: "Chemical Anchors" },
              },
              {
                name: "Chevilles metalliques",
                handle: "chevilles-metalliques",
                description: "Chevilles a expansion metalliques",
                metadata: { name_en: "Metal Anchors" },
              },
              {
                name: "Chevilles placo",
                handle: "chevilles-placo",
                description: "Chevilles pour plaques de platre",
                metadata: { name_en: "Drywall Anchors" },
              },
            ],
          },
          // Level 3: Fixations lourdes
          {
            name: "Fixations lourdes",
            handle: "fixations-lourdes",
            description: "Fixations charges lourdes et structurelles",
            metadata: { name_en: "Heavy Duty Fixings" },
          },
        ],
      },
      // Level 2: Serrurerie
      {
        name: "Serrurerie",
        handle: "serrurerie",
        description: "Serrures, cylindres et accessoires de securite",
        metadata: {
          name_en: "Locksmith",
          icon: "lock",
        },
        children: [
          // Level 3: Serrures
          {
            name: "Serrures",
            handle: "serrures",
            description: "Serrures de portes",
            metadata: { name_en: "Locks" },
            children: [
              {
                name: "Serrures encastrees",
                handle: "serrures-encastrees",
                description: "Serrures a larder/encastrer",
                metadata: { name_en: "Mortise Locks" },
              },
              {
                name: "Serrures en applique",
                handle: "serrures-applique",
                description: "Serrures en applique",
                metadata: { name_en: "Surface-Mounted Locks" },
              },
              {
                name: "Serrures multipoints",
                handle: "serrures-multipoints",
                description: "Serrures multipoints haute securite",
                metadata: { name_en: "Multipoint Locks" },
              },
            ],
          },
          // Level 3: Cylindres et cles
          {
            name: "Cylindres et cles",
            handle: "cylindres-cles",
            description: "Cylindres de serrure et cles",
            metadata: { name_en: "Cylinders and Keys" },
          },
          // Level 3: Poignees
          {
            name: "Poignees",
            handle: "poignees",
            description: "Poignees de porte et beqilles",
            metadata: { name_en: "Door Handles" },
          },
        ],
      },
    ],
  },
];

/**
 * Recursively creates categories with proper parent-child relationships
 *
 * @param productService - The Medusa product module service
 * @param categories - Array of category definitions to create
 * @param parentId - Parent category ID (undefined for root categories)
 * @param categoryMap - Map to store created category handles and their IDs
 * @param rankOffset - Starting rank for ordering siblings
 * @param logger - Logger instance
 * @returns Updated rank offset after processing all categories
 */
async function createCategoriesRecursively(
  productService: IProductModuleService,
  categories: CategoryDefinition[],
  parentId: string | undefined,
  categoryMap: Record<string, string>,
  rankOffset: number,
  logger: Logger
): Promise<number> {
  let currentRank = rankOffset;

  for (const categoryDef of categories) {
    try {
      // Create the category
      const category = await productService.createProductCategories({
        name: categoryDef.name,
        handle: categoryDef.handle,
        description: categoryDef.description,
        is_active: true,
        is_internal: false,
        rank: currentRank,
        parent_category_id: parentId,
        metadata: categoryDef.metadata,
      });

      categoryMap[categoryDef.handle] = category.id;
      currentRank++;

      logger.info(`   Created: ${categoryDef.name} (${categoryDef.handle})`);

      // Recursively create children
      if (categoryDef.children && categoryDef.children.length > 0) {
        await createCategoriesRecursively(
          productService,
          categoryDef.children,
          category.id,
          categoryMap,
          0, // Reset rank for children
          logger
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`   Failed to create ${categoryDef.name}: ${message}`);
    }
  }

  return currentRank;
}

/**
 * Counts total categories in the hierarchy
 */
function countCategories(categories: CategoryDefinition[]): number {
  let count = 0;
  for (const cat of categories) {
    count++;
    if (cat.children) {
      count += countCategories(cat.children);
    }
  }
  return count;
}

/**
 * Main seed function for B2B distributor categories
 *
 * Creates a comprehensive 5-level category hierarchy for a B2B wholesale platform.
 * Categories include electrical, plumbing, tools, HVAC, and hardware products.
 *
 * @param container - Medusa dependency container
 */
export default async function seedCategories({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT);

  logger.info("=".repeat(60));
  logger.info("Seed Categories - B2B Distributor Business");
  logger.info("=".repeat(60));

  // Check for existing categories
  const existingCategories = await productService.listProductCategories({});

  if (existingCategories.length > 0) {
    logger.info(`Found ${existingCategories.length} existing categories.`);
    logger.info("To re-seed, delete existing categories first.");
    logger.info("Existing category handles:");
    existingCategories.slice(0, 10).forEach((cat) => {
      logger.info(`   - ${cat.handle}: ${cat.name}`);
    });
    if (existingCategories.length > 10) {
      logger.info(`   ... and ${existingCategories.length - 10} more`);
    }
    return;
  }

  const totalCategories = countCategories(B2B_CATEGORIES);
  logger.info(`Creating ${totalCategories} categories across 5 hierarchy levels...`);
  logger.info("");

  const categoryMap: Record<string, string> = {};

  // Create all categories recursively
  await createCategoriesRecursively(
    productService,
    B2B_CATEGORIES,
    undefined,
    categoryMap,
    0,
    logger
  );

  logger.info("");
  logger.info("=".repeat(60));
  logger.info("Category Seed Summary");
  logger.info("=".repeat(60));
  logger.info(`Total categories created: ${Object.keys(categoryMap).length}`);
  logger.info("");
  logger.info("Level 1 (Root) categories:");
  B2B_CATEGORIES.forEach((cat) => {
    logger.info(`   - ${cat.name} (${cat.metadata.name_en})`);
  });
  logger.info("");
  logger.info("Category seed completed successfully!");

  // Auto-assign products to categories based on their names/descriptions
  logger.info("");
  logger.info("=".repeat(60));
  logger.info("Auto-assigning products to categories...");
  logger.info("=".repeat(60));

  await assignProductsToCategories(productService, categoryMap, logger);
}

// =============================================================================
// PRODUCT-CATEGORY AUTO-ASSIGNMENT
// =============================================================================

/**
 * Keyword patterns for matching products to categories
 * Maps category handles to arrays of keyword patterns (case-insensitive)
 * Ordered from most specific (level 5) to least specific (level 1)
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  // ==========================================================================
  // Level 5 - Most specific (check first)
  // ==========================================================================

  // Electricite - Cables
  "cables-h07v-u": ["h07v-u", "h07vu", "cable rigide", "fil rigide"],
  "cables-h07v-r": ["h07v-r", "h07vr", "cable semi-rigide"],
  "cables-h07v-k": ["h07v-k", "h07vk", "cable souple"],
  "cables-armes": ["cable arme", "cables armes", "armure metallique"],
  "cables-blindes": ["cable blinde", "cables blindes", "anti-perturbation"],

  // Electricite - Appareillage
  "appareillage-odace": ["odace", "schneider odace"],
  "appareillage-celiane": ["celiane", "legrand celiane"],
  "appareillage-mosaic": ["mosaic", "legrand mosaic"],
  "coffrets-1-rangee": ["coffret 1 rangee", "coffret 13 modules", "1 rangee"],
  "coffrets-2-rangees": ["coffret 2 rangees", "coffret 26 modules", "2 rangees"],
  "coffrets-3-rangees-plus": ["coffret 3 rangees", "coffret 4 rangees", "39 modules", "52 modules"],

  // Plomberie - PVC diametres
  "pvc-32mm": ["pvc 32", "diametre 32", "32mm"],
  "pvc-40mm": ["pvc 40", "diametre 40", "40mm"],
  "pvc-50mm": ["pvc 50", "diametre 50", "50mm"],
  "pvc-100mm": ["pvc 100", "diametre 100", "100mm"],

  // Outillage - Perceuses voltages
  "perceuses-12v": ["12v", "perceuse 12 volts", "visseuse 12v"],
  "perceuses-18v": ["18v", "perceuse 18 volts", "visseuse 18v"],
  "perceuses-36v": ["36v", "perceuse 36 volts", "visseuse 36v"],

  // ==========================================================================
  // Level 4
  // ==========================================================================

  // Electricite - Cables
  "cables-domestiques": ["cable domestique", "cable maison", "cable habitat"],
  "cables-industriels": ["cable industriel", "cable usine", "cable atelier"],

  // Electricite - Appareillage
  "gamme-residentielle": ["residentiel", "habitat", "logement", "maison"],
  "gamme-professionnelle": ["professionnel", "tertiaire", "bureau", "commercial"],
  "coffrets-electriques": ["coffret electrique", "armoire electrique", "tableau divisionnaire"],
  "disjoncteurs": ["disjoncteur", "dj", "courbe c", "courbe d"],
  "differentiels": ["differentiel", "interrupteur differentiel", "ddr", "30ma"],

  // Electricite - LED
  "led-e27": ["e27", "gros culot", "culot e27"],
  "led-e14": ["e14", "petit culot", "culot e14"],
  "led-gu10": ["gu10", "spot gu10"],
  "led-g9": ["g9", "capsule g9"],

  // Electricite - Luminaires
  "spots-encastres": ["spot encastre", "spot encastrable", "downlight"],
  "plafonniers": ["plafonnier", "dalle led", "panneau led"],
  "projecteurs-led": ["projecteur led", "projecteur interieur"],

  // Plomberie - PVC
  "pvc-evacuation": ["pvc evacuation", "evacuation pvc", "eaux usees"],
  "pvc-pression": ["pvc pression", "pression pvc", "alimentation pvc"],

  // Plomberie - Mitigeurs
  "mitigeurs-cuisine": ["mitigeur cuisine", "mitigeur evier", "robinet cuisine"],
  "mitigeurs-salle-de-bain": ["mitigeur lavabo", "mitigeur salle de bain", "robinet lavabo"],
  "mitigeurs-douche": ["mitigeur douche", "thermostatique douche", "robinet douche"],

  // Plomberie - WC
  "wc-suspendus": ["wc suspendu", "toilette suspendue", "cuvette suspendue"],
  "wc-a-poser": ["wc a poser", "wc au sol", "cuvette au sol"],
  "bati-supports": ["bati-support", "bati support", "chassis wc", "geberit"],

  // Plomberie - Douche
  "receveurs-douche": ["receveur", "bac de douche", "bac douche"],
  "parois-douche": ["paroi douche", "porte douche", "vitre douche"],
  "colonnes-douche": ["colonne douche", "ensemble douche", "barre douche"],

  // Outillage - Perceuses
  "perceuses-sans-fil": ["perceuse sans fil", "visseuse sans fil", "perceuse batterie"],
  "perceuses-filaires": ["perceuse filaire", "perceuse cable", "perceuse secteur"],

  // Outillage - Tournevis
  "tournevis-plats": ["tournevis plat", "lame plate"],
  "tournevis-cruciformes": ["tournevis cruciforme", "phillips", "pozidriv", "pz"],
  "tournevis-torx": ["tournevis torx", "torx", "t20", "t25", "t30"],
  "tournevis-isoles": ["tournevis isole", "vde", "1000v", "isole 1000"],

  // Outillage - Pinces
  "pinces-universelles": ["pince universelle", "pince multiprise"],
  "pinces-coupantes": ["pince coupante", "pince diagonale", "coupe cable"],
  "pinces-a-bec": ["pince a bec", "bec long", "demi-rond"],

  // Outillage - Cles
  "cles-plates": ["cle plate", "cle mixte", "jeu de cles plates"],
  "cles-a-molette": ["cle a molette", "cle reglable", "molette"],
  "cles-allen": ["cle allen", "btr", "cle 6 pans", "hexagonale"],
  "cles-dynamometriques": ["cle dynamometrique", "couple de serrage", "torque"],

  // Outillage - Niveaux
  "niveaux-a-bulle": ["niveau a bulle", "niveau bulle", "niveau magnetique"],
  "niveaux-laser": ["niveau laser", "laser ligne", "laser rotatif"],

  // Chauffage - Radiateurs electriques
  "radiateurs-inertie": ["radiateur inertie", "inertie seche", "inertie fluide"],
  "radiateurs-rayonnants": ["panneau rayonnant", "radiateur rayonnant", "radiant"],
  "convecteurs": ["convecteur", "convection"],

  // Chauffage - Chaudieres gaz
  "chaudieres-murales": ["chaudiere murale", "murale gaz"],
  "chaudieres-sol": ["chaudiere sol", "chaudiere au sol"],
  "chaudieres-condensation": ["condensation", "chaudiere condensation", "hpe"],

  // Chauffage - PAC
  "pac-air-eau": ["air-eau", "air eau", "pac air eau"],
  "pac-air-air": ["air-air", "air air", "pac air air", "reversible"],
  "pac-geothermiques": ["geothermique", "geothermie", "sol eau"],

  // Chauffage - VMC
  "vmc-simple-flux": ["simple flux", "hygro", "autoréglable"],
  "vmc-double-flux": ["double flux", "echangeur", "thermodynamique"],

  // Quincaillerie - Vis
  "vis-a-bois": ["vis a bois", "vis bois", "vis agglomere", "spax"],
  "vis-a-metaux": ["vis a metaux", "vis metal", "vis tole"],
  "vis-autoforantes": ["vis autoforante", "autoperceuse", "autotaraudeuse", "tek"],
  "vis-inox": ["vis inox", "acier inoxydable", "a2", "a4"],

  // Quincaillerie - Chevilles
  "chevilles-nylon": ["cheville nylon", "cheville plastique", "universelle"],
  "chevilles-chimiques": ["cheville chimique", "scellement chimique", "resine"],
  "chevilles-metalliques": ["cheville metallique", "expansion metallique", "ancrage metal"],
  "chevilles-placo": ["cheville placo", "molly", "chevilles platre", "cloison seche"],

  // Quincaillerie - Serrures
  "serrures-encastrees": ["serrure encastree", "serrure a larder", "mortaise"],
  "serrures-applique": ["serrure applique", "serrure en applique"],
  "serrures-multipoints": ["multipoints", "3 points", "5 points", "haute securite"],

  // ==========================================================================
  // Level 3
  // ==========================================================================

  // Electricite
  "cables-electriques": ["cable electrique", "cables electriques", "cable energie"],
  "fils-conducteurs": ["fil electrique", "conducteur cuivre", "fil souple"],
  "interrupteurs-prises": ["interrupteur", "prise", "va et vient", "prise 2p+t"],
  "tableaux-electriques": ["tableau electrique", "coffret", "armoire electrique"],
  "ampoules-led": ["ampoule led", "led", "lampe led"],
  "luminaires": ["luminaire", "spot", "plafonnier", "suspension"],
  "eclairage-exterieur": ["eclairage exterieur", "projecteur exterieur", "borne"],

  // Plomberie
  "tubes-pvc": ["tube pvc", "tuyau pvc"],
  "tubes-cuivre": ["tube cuivre", "cuivre recuit", "cuivre ecroui"],
  "tubes-multicouche": ["multicouche", "alu-pex", "tube multicouche"],
  "tubes-per": ["tube per", "per", "polyethylene reticule"],
  "raccords-pvc": ["raccord pvc", "coude pvc", "te pvc", "manchon pvc"],
  "raccords-laiton": ["raccord laiton", "raccord filete", "raccord compression"],
  "raccords-multicouche": ["raccord multicouche", "raccord a sertir"],
  "mitigeurs": ["mitigeur", "robinet mitigeur"],
  "robinets-arret": ["robinet arret", "robinet puisage", "vanne arret"],
  "vannes": ["vanne", "vanne a bille", "vanne papillon", "clapet"],
  "wc": ["wc", "toilette", "cuvette"],
  "lavabos-vasques": ["lavabo", "vasque", "plan toilette"],
  "douche": ["douche", "cabine douche"],

  // Outillage
  "perceuses-visseuses": ["perceuse", "visseuse", "perceuse-visseuse"],
  "meuleuses": ["meuleuse", "disqueuse", "meuleuse d'angle"],
  "scies-circulaires": ["scie circulaire", "scie plongeante"],
  "perforateurs": ["perforateur", "burineur", "sds", "sds-plus", "sds-max"],
  "ponceuses": ["ponceuse", "ponceuse vibrante", "ponceuse excentrique"],
  "tournevis": ["tournevis", "jeu tournevis"],
  "pinces": ["pince", "tenaille"],
  "cles": ["cle", "jeu de cles"],
  "marteaux": ["marteau", "masse", "maillet", "massette"],
  "niveaux": ["niveau", "nivelle"],
  "metres-telemetres": ["metre", "telemetre", "metre ruban", "decametre"],
  "multimetres": ["multimetre", "testeur", "pince amperemetrique"],

  // Chauffage
  "radiateurs-electriques": ["radiateur electrique", "chauffage electrique"],
  "radiateurs-eau-chaude": ["radiateur eau chaude", "radiateur chauffage central"],
  "seche-serviettes": ["seche-serviettes", "seche serviettes", "porte serviette chauffant"],
  "chaudieres-gaz": ["chaudiere gaz", "chaudiere murale gaz"],
  "pompes-a-chaleur": ["pompe a chaleur", "pac", "aerothermie"],
  "climatiseurs-split": ["climatiseur split", "split", "mono-split", "multi-split"],
  "climatiseurs-mobiles": ["climatiseur mobile", "climatiseur portable", "monobloc"],
  "vmc": ["vmc", "ventilation mecanique"],
  "extracteurs": ["extracteur", "aerateur", "ventilateur extraction"],

  // Quincaillerie
  "vis": ["vis", "visserie"],
  "boulons": ["boulon", "tige filetee", "goujon"],
  "ecrous-rondelles": ["ecrou", "rondelle", "frein"],
  "chevilles": ["cheville", "fixation murale"],
  "fixations-lourdes": ["fixation lourde", "ancrage lourd", "goujon d'ancrage"],
  "serrures": ["serrure", "verrou"],
  "cylindres-cles": ["cylindre", "barillet", "cle"],
  "poignees": ["poignee", "bequille", "garniture"],

  // ==========================================================================
  // Level 2
  // ==========================================================================

  // Electricite
  "cablage-fils": ["cable", "fil", "conducteur", "cablage"],
  "appareillage-electrique": ["appareillage", "interrupteur", "prise", "tableau"],
  "eclairage": ["eclairage", "lumiere", "led", "ampoule", "lampe"],

  // Plomberie
  "tuyauterie": ["tuyau", "tube", "tuyauterie", "canalisation"],
  "raccords": ["raccord", "jonction", "assemblage"],
  "robinetterie": ["robinetterie", "robinet", "mitigeur", "vanne"],
  "sanitaires": ["sanitaire", "wc", "lavabo", "douche", "baignoire"],

  // Outillage
  "outillage-electroportatif": ["electroportatif", "sans fil", "batterie", "electrique"],
  "outillage-a-main": ["outillage main", "outil main", "manuel"],
  "outillage-mesure": ["mesure", "metre", "niveau", "multimetre"],

  // Chauffage
  "radiateurs": ["radiateur", "chauffage", "convecteur"],
  "chaudieres": ["chaudiere", "chauffage central"],
  "climatisation": ["climatisation", "clim", "climatiseur", "froid"],
  "ventilation": ["ventilation", "vmc", "aeration", "extracteur"],

  // Quincaillerie
  "visserie-boulonnerie": ["vis", "boulon", "ecrou", "rondelle", "visserie"],
  "chevilles-fixations": ["cheville", "fixation", "ancrage"],
  "serrurerie": ["serrure", "cylindre", "verrou", "securite porte"],

  // ==========================================================================
  // Level 1 (Fallbacks - least specific)
  // ==========================================================================

  "electricite": ["electrique", "electricite", "courant", "tension"],
  "plomberie": ["plomberie", "eau", "tuyau", "sanitaire"],
  "outillage": ["outil", "outillage", "bricolage"],
  "chauffage-climatisation": ["chauffage", "climatisation", "thermique", "temperature"],
  "quincaillerie": ["quincaillerie", "vis", "boulon", "fixation"],
};

/**
 * Determines the best matching category for a product based on its name and description
 *
 * @param productName - The product's title/name
 * @param productDescription - The product's description
 * @returns The handle of the best matching category, or undefined if no match
 */
function findBestCategoryMatch(
  productName: string,
  productDescription: string
): string | undefined {
  const searchText = `${productName} ${productDescription}`.toLowerCase();

  // Search from most specific (level 5) to least specific (level 1)
  // The CATEGORY_KEYWORDS object is ordered by specificity
  for (const [handle, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return handle;
      }
    }
  }

  return undefined;
}

/**
 * Auto-assigns existing products to appropriate categories based on their names and descriptions
 *
 * @param productService - The Medusa product module service
 * @param categoryMap - Map of category handles to their IDs
 * @param logger - Logger instance
 */
async function assignProductsToCategories(
  productService: IProductModuleService,
  categoryMap: Record<string, string>,
  logger: Logger
): Promise<void> {
  // Get all products
  const products = await productService.listProducts(
    {},
    { select: ["id", "title", "description", "handle"], relations: ["categories"] }
  );

  if (products.length === 0) {
    logger.info("No products found to categorize.");
    return;
  }

  logger.info(`Found ${products.length} products to analyze...`);
  logger.info("");

  let assigned = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const product of products) {
    // Skip if product already has categories
    if (product.categories && product.categories.length > 0) {
      skipped++;
      continue;
    }

    const bestMatch = findBestCategoryMatch(
      product.title,
      product.description || ""
    );

    if (bestMatch && categoryMap[bestMatch]) {
      try {
        await productService.updateProducts(product.id, {
          category_ids: [categoryMap[bestMatch]],
        });
        logger.info(`   Assigned "${product.title}" -> ${bestMatch}`);
        assigned++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`   Failed to assign "${product.title}": ${message}`);
      }
    } else {
      logger.warn(`   No match found for: "${product.title}"`);
      noMatch++;
    }
  }

  logger.info("");
  logger.info("-".repeat(40));
  logger.info("Product Assignment Summary:");
  logger.info(`   - Assigned: ${assigned} products`);
  logger.info(`   - Skipped (already categorized): ${skipped} products`);
  logger.info(`   - No match found: ${noMatch} products`);
}
