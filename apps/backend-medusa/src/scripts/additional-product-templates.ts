/**
 * Additional Product Templates for B2B E-commerce
 *
 * This file contains product templates for categories not covered in the main seed file.
 * Templates follow the same structure as defined in seed-b2b-products.ts
 *
 * Categories covered:
 * - Level 1: electricite, plomberie, outillage, chauffage-climatisation, quincaillerie (kit products)
 * - Level 2: outillage-electroportatif, outillage-a-main, mesure-tracage, chauffage-electrique,
 *            chauffage-central, eau-chaude-sanitaire, fixation, serrurerie, ferrures, etancheite
 * - Level 3-5: Specific product categories
 */

/**
 * Product template structure matching seed-b2b-products.ts
 */
export interface ProductTemplate {
  namePrefix: string;
  nameSuffix: string;
  descriptionTemplate: string;
  categoryHandle: string;
  rootCategory: string;
  brands: string[];
  optionName: string;
  optionValues: string[];
  priceRange: { min: number; max: number };
  skuPrefix: string;
  imageKeywords: string[];
  hsCode: string;
  weight: number;
  productType: string;
}

/**
 * Additional product templates for missing categories
 */
export const additionalProductTemplates: ProductTemplate[] = [
  // ===========================================================================
  // LEVEL 1 - ROOT CATEGORY KIT PRODUCTS
  // ===========================================================================

  // =========== ELECTRICITE KIT ===========
  {
    namePrefix: "Kit Electricite",
    nameSuffix: "Complet Renovation",
    descriptionTemplate:
      "Kit complet pour renovation electrique comprenant disjoncteurs, interrupteurs differentiels, fils et accessoires. Conforme NF C 15-100. Ideal pour mise aux normes tableau electrique.",
    categoryHandle: "electricite",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Configuration",
    optionValues: [
      "T2 Studio",
      "T3 Appartement",
      "T4 Maison",
      "T5+ Grande Maison",
    ],
    priceRange: { min: 35000, max: 150000 },
    skuPrefix: "KIT-ELEC-",
    imageKeywords: ["electrical", "kit", "renovation"],
    hsCode: "8537.10",
    weight: 8000,
    productType: "Kit Electrique",
  },

  // =========== PLOMBERIE KIT ===========
  {
    namePrefix: "Kit Plomberie",
    nameSuffix: "Installation Sanitaire",
    descriptionTemplate:
      "Kit complet installation sanitaire avec raccords, tubes PER, robinets d'arret et accessoires. Solution tout-en-un pour creation ou renovation salle de bain.",
    categoryHandle: "plomberie",
    rootCategory: "plomberie",
    brands: ["grohe", "geberit", "hansgrohe"],
    optionName: "Configuration",
    optionValues: [
      "1 point d'eau",
      "2 points d'eau",
      "Salle de bain complete",
      "Cuisine + SDB",
    ],
    priceRange: { min: 25000, max: 120000 },
    skuPrefix: "KIT-PLOMB-",
    imageKeywords: ["plumbing", "kit", "bathroom"],
    hsCode: "8481.80",
    weight: 10000,
    productType: "Kit Plomberie",
  },

  // =========== OUTILLAGE KIT ===========
  {
    namePrefix: "Kit Outillage",
    nameSuffix: "Professionnel",
    descriptionTemplate:
      "Kit outillage professionnel complet pour electricien, plombier ou menuisier. Outils a main et electroportatifs dans coffret de transport robuste. Selection qualite pro.",
    categoryHandle: "outillage",
    rootCategory: "outillage",
    brands: ["bosch", "dewalt", "makita", "milwaukee"],
    optionName: "Metier",
    optionValues: [
      "Electricien",
      "Plombier",
      "Menuisier",
      "Multi-metiers Debutant",
      "Multi-metiers Pro",
    ],
    priceRange: { min: 50000, max: 300000 },
    skuPrefix: "KIT-OUT-",
    imageKeywords: ["tool", "kit", "professional"],
    hsCode: "8206.00",
    weight: 15000,
    productType: "Kit Outillage",
  },

  // =========== CHAUFFAGE-CLIMATISATION KIT ===========
  {
    namePrefix: "Kit Chauffage",
    nameSuffix: "Installation Complete",
    descriptionTemplate:
      "Kit installation chauffage comprenant radiateurs, tuyauterie, vannes et accessoires de regulation. Solution complete pour chauffage central ou electrique selon configuration.",
    categoryHandle: "chauffage-climatisation",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "daikin"],
    optionName: "Type Installation",
    optionValues: [
      "Electrique Studio",
      "Electrique Appartement",
      "Central T3",
      "Central Maison",
    ],
    priceRange: { min: 80000, max: 400000 },
    skuPrefix: "KIT-CHAUF-",
    imageKeywords: ["heating", "kit", "installation"],
    hsCode: "8516.29",
    weight: 50000,
    productType: "Kit Chauffage",
  },

  // =========== QUINCAILLERIE KIT ===========
  {
    namePrefix: "Kit Quincaillerie",
    nameSuffix: "Amenagement",
    descriptionTemplate:
      "Kit quincaillerie complet pour amenagement interieur. Visserie, chevilles, charnières, poignées et accessoires de fixation. Coffret organiseur inclus.",
    categoryHandle: "quincaillerie",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth"],
    optionName: "Type Projet",
    optionValues: [
      "Cuisine",
      "Salle de bain",
      "Dressing",
      "Amenagement complet",
    ],
    priceRange: { min: 15000, max: 60000 },
    skuPrefix: "KIT-QUINC-",
    imageKeywords: ["hardware", "kit", "fittings"],
    hsCode: "7318.29",
    weight: 5000,
    productType: "Kit Quincaillerie",
  },

  // ===========================================================================
  // LEVEL 2 - SUBCATEGORY PRODUCTS
  // ===========================================================================

  // =========== OUTILLAGE-ELECTROPORTATIF ===========
  {
    namePrefix: "Pack Electroportatif",
    nameSuffix: "Duo Batterie",
    descriptionTemplate:
      "Pack electroportatif professionnel avec perceuse-visseuse et visseuse a chocs. Moteurs brushless, 2 batteries haute capacite et chargeur rapide. Coffret transport robuste.",
    categoryHandle: "outillage-electroportatif",
    rootCategory: "outillage",
    brands: ["bosch", "dewalt", "makita", "milwaukee"],
    optionName: "Configuration",
    optionValues: [
      "12V 2x2Ah",
      "18V 2x4Ah",
      "18V 2x5Ah",
      "18V 3x5Ah + chargeur duo",
    ],
    priceRange: { min: 25000, max: 80000 },
    skuPrefix: "PACK-ELEC-",
    imageKeywords: ["power", "tool", "combo"],
    hsCode: "8467.21",
    weight: 6000,
    productType: "Outillage Electroportatif",
  },

  // =========== OUTILLAGE-A-MAIN ===========
  {
    namePrefix: "Coffret Outillage",
    nameSuffix: "a Main Complet",
    descriptionTemplate:
      "Coffret outillage a main professionnel. Tournevis, cles, pinces, marteau, scie et accessoires. Acier chrome-vanadium. Coffret ABS resistant avec mousse de calage.",
    categoryHandle: "outillage-a-main",
    rootCategory: "outillage",
    brands: ["facom", "stanley", "bahco", "knipex"],
    optionName: "Composition",
    optionValues: [
      "32 pieces Essentiel",
      "56 pieces Standard",
      "108 pieces Complet",
      "150 pieces Pro",
    ],
    priceRange: { min: 8000, max: 45000 },
    skuPrefix: "COFF-MAIN-",
    imageKeywords: ["hand", "tool", "set"],
    hsCode: "8206.00",
    weight: 5000,
    productType: "Outillage a Main",
  },

  // =========== MESURE-TRACAGE ===========
  {
    namePrefix: "Kit Mesure et Tracage",
    nameSuffix: "Professionnel",
    descriptionTemplate:
      "Kit complet mesure et tracage: niveau laser, telemetre, equerre, reglet, pointe a tracer, compas et crayons. Precision professionnelle pour tous travaux de pose.",
    categoryHandle: "mesure-tracage",
    rootCategory: "outillage",
    brands: ["bosch", "stanley", "hilti"],
    optionName: "Configuration",
    optionValues: [
      "Kit Basique",
      "Kit Standard",
      "Kit Pro Laser",
      "Kit Expert 360",
    ],
    priceRange: { min: 5000, max: 50000 },
    skuPrefix: "KIT-MES-",
    imageKeywords: ["measure", "layout", "laser"],
    hsCode: "9017.80",
    weight: 2000,
    productType: "Materiel de Mesure",
  },

  // =========== CHAUFFAGE-ELECTRIQUE ===========
  {
    namePrefix: "Radiateur Electrique",
    nameSuffix: "Connecte",
    descriptionTemplate:
      "Radiateur electrique connecte pilotable par smartphone. Programmation intelligente, detection presence et fenetre ouverte. Compatible assistants vocaux. NF Electricite Performance 3 etoiles.",
    categoryHandle: "chauffage-electrique",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor"],
    optionName: "Puissance/Type",
    optionValues: [
      "1000W Inertie",
      "1500W Inertie",
      "2000W Inertie",
      "1500W Rayonnant",
    ],
    priceRange: { min: 45000, max: 95000 },
    skuPrefix: "RAD-CONN-",
    imageKeywords: ["radiator", "smart", "electric"],
    hsCode: "8516.29",
    weight: 18000,
    productType: "Chauffage Electrique",
  },

  // =========== CHAUFFAGE-CENTRAL ===========
  {
    namePrefix: "Kit Chauffage Central",
    nameSuffix: "Hydraulique",
    descriptionTemplate:
      "Kit installation chauffage central hydraulique avec circulateur, vase d'expansion, soupape securite et raccords. Compatible tous types de chaudieres. Documentation technique incluse.",
    categoryHandle: "chauffage-central",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor"],
    optionName: "Configuration",
    optionValues: [
      "Appartement T3",
      "Maison 100m2",
      "Maison 150m2",
      "Grande maison 200m2+",
    ],
    priceRange: { min: 35000, max: 150000 },
    skuPrefix: "KIT-CENTR-",
    imageKeywords: ["central", "heating", "hydraulic"],
    hsCode: "8403.90",
    weight: 25000,
    productType: "Chauffage Central",
  },

  // =========== EAU-CHAUDE-SANITAIRE ===========
  {
    namePrefix: "Kit ECS",
    nameSuffix: "Production Eau Chaude",
    descriptionTemplate:
      "Kit production eau chaude sanitaire complet. Groupe de securite, siphon, raccords flexibles et accessoires installation. Compatible chauffe-eau electrique ou thermodynamique.",
    categoryHandle: "eau-chaude-sanitaire",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "geberit"],
    optionName: "Configuration",
    optionValues: [
      "Standard 100L",
      "Standard 200L",
      "Thermo 200L",
      "Thermo 300L",
    ],
    priceRange: { min: 8000, max: 35000 },
    skuPrefix: "KIT-ECS-",
    imageKeywords: ["water", "heater", "kit"],
    hsCode: "8516.10",
    weight: 5000,
    productType: "Eau Chaude Sanitaire",
  },

  // =========== FIXATION ===========
  {
    namePrefix: "Coffret Fixation",
    nameSuffix: "Multi-Supports",
    descriptionTemplate:
      "Coffret fixation professionnelle multi-supports. Chevilles tous materiaux, vis acier et inox, rondelles et ecrous. Organiseur compartimente pour atelier ou chantier.",
    categoryHandle: "fixation",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth"],
    optionName: "Composition",
    optionValues: [
      "200 pieces",
      "400 pieces",
      "600 pieces Pro",
      "1000 pieces Chantier",
    ],
    priceRange: { min: 3500, max: 18000 },
    skuPrefix: "COFF-FIX-",
    imageKeywords: ["fixing", "anchor", "screw"],
    hsCode: "7318.29",
    weight: 4000,
    productType: "Fixation",
  },

  // =========== SERRURERIE ===========
  {
    namePrefix: "Kit Serrurerie",
    nameSuffix: "Porte d'Entree",
    descriptionTemplate:
      "Kit serrurerie complet pour porte d'entree: serrure multipoints, cylindre haute securite, poignee et accessoires. Niveau de securite A2P. Installation professionnelle recommandee.",
    categoryHandle: "serrurerie",
    rootCategory: "quincaillerie",
    brands: ["wurth"],
    optionName: "Niveau Securite",
    optionValues: ["A2P 1 etoile", "A2P 2 etoiles", "A2P 3 etoiles"],
    priceRange: { min: 25000, max: 80000 },
    skuPrefix: "KIT-SERR-",
    imageKeywords: ["lock", "security", "door"],
    hsCode: "8301.40",
    weight: 5000,
    productType: "Serrurerie",
  },

  // =========== FERRURES ===========
  {
    namePrefix: "Kit Ferrures",
    nameSuffix: "Ameublement",
    descriptionTemplate:
      "Kit ferrures ameublement complet: charnieres, glissieres, supports, verins et poignees. Qualite professionnelle pour fabrication ou renovation meubles. Visserie incluse.",
    categoryHandle: "ferrures",
    rootCategory: "quincaillerie",
    brands: ["wurth"],
    optionName: "Type Meuble",
    optionValues: [
      "Cuisine Standard",
      "Cuisine Premium",
      "Dressing",
      "Bureau/Rangement",
    ],
    priceRange: { min: 8000, max: 35000 },
    skuPrefix: "KIT-FERR-",
    imageKeywords: ["furniture", "hardware", "hinge"],
    hsCode: "8302.42",
    weight: 3000,
    productType: "Ferrure",
  },

  // =========== ETANCHEITE ===========
  {
    namePrefix: "Kit Etancheite",
    nameSuffix: "Salle de Bain",
    descriptionTemplate:
      "Kit etancheite salle de bain complet: primaire, membrane liquide, bandes de renfort et joints. Solution SPEC (Systeme de Protection a l'Eau sous Carrelage) certifiee.",
    categoryHandle: "etancheite",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth"],
    optionName: "Surface",
    optionValues: [
      "Douche italienne 3m2",
      "Salle de bain 6m2",
      "Salle de bain 10m2",
      "Grande piece 15m2",
    ],
    priceRange: { min: 8000, max: 35000 },
    skuPrefix: "KIT-ETAN-",
    imageKeywords: ["waterproof", "sealant", "membrane"],
    hsCode: "3214.10",
    weight: 8000,
    productType: "Etancheite",
  },

  // ===========================================================================
  // LEVEL 3-5 - SPECIFIC PRODUCT CATEGORIES
  // ===========================================================================

  // =========== CABLES H07V-U ===========
  {
    namePrefix: "Fil H07V-U",
    nameSuffix: "Rigide Unifilaire",
    descriptionTemplate:
      "Fil electrique H07V-U rigide ame cuivre plein. Isolation PVC, tension 450/750V. Ideal cablage tableau electrique et boites de derivation. Conforme NF C 32-201.",
    categoryHandle: "cables-h07v-u",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand"],
    optionName: "Section/Couleur",
    optionValues: [
      "1.5mm2 Bleu 100m",
      "1.5mm2 Rouge 100m",
      "2.5mm2 Bleu 100m",
      "2.5mm2 Rouge 100m",
      "6mm2 Vert-Jaune 100m",
    ],
    priceRange: { min: 2000, max: 12000 },
    skuPrefix: "H07VU-",
    imageKeywords: ["wire", "copper", "electrical"],
    hsCode: "8544.49",
    weight: 3500,
    productType: "Cable Electrique",
  },

  // =========== CABLES H07V-R ===========
  {
    namePrefix: "Fil H07V-R",
    nameSuffix: "Rigide Multibrins",
    descriptionTemplate:
      "Fil electrique H07V-R rigide multibrins cuivre. Plus souple que H07V-U, meme usage. Isolation PVC 450/750V. Pour cablage tableaux et derivations.",
    categoryHandle: "cables-h07v-r",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand"],
    optionName: "Section/Couleur",
    optionValues: [
      "1.5mm2 Bleu 100m",
      "1.5mm2 Rouge 100m",
      "2.5mm2 Bleu 100m",
      "4mm2 Marron 100m",
      "6mm2 Vert-Jaune 100m",
    ],
    priceRange: { min: 2200, max: 13000 },
    skuPrefix: "H07VR-",
    imageKeywords: ["wire", "stranded", "electrical"],
    hsCode: "8544.49",
    weight: 3600,
    productType: "Cable Electrique",
  },

  // =========== CABLES H07V-K ===========
  {
    namePrefix: "Fil H07V-K",
    nameSuffix: "Souple",
    descriptionTemplate:
      "Fil electrique H07V-K souple ame cuivre multibrins fin. Grande flexibilite pour passage dans gaines cintrees. Isolation PVC 450/750V. Norme NF C 32-201.",
    categoryHandle: "cables-h07v-k",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand"],
    optionName: "Section/Couleur",
    optionValues: [
      "1.5mm2 Bleu 100m",
      "1.5mm2 Rouge 100m",
      "2.5mm2 Bleu 100m",
      "2.5mm2 Marron 100m",
      "4mm2 Noir 100m",
    ],
    priceRange: { min: 2500, max: 14000 },
    skuPrefix: "H07VK-",
    imageKeywords: ["wire", "flexible", "electrical"],
    hsCode: "8544.49",
    weight: 3400,
    productType: "Cable Electrique",
  },

  // =========== CABLES ARMES ===========
  {
    namePrefix: "Cable Arme",
    nameSuffix: "Enterre",
    descriptionTemplate:
      "Cable electrique arme pour pose directe en terre sans protection supplementaire. Armure acier feuillard. Conforme NF C 32-321. Alimentation batiments et eclairage exterieur.",
    categoryHandle: "cables-armes",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand"],
    optionName: "Section/Configuration",
    optionValues: [
      "3G2.5mm2 25m",
      "3G4mm2 25m",
      "4G2.5mm2 25m",
      "4G6mm2 25m",
      "5G6mm2 25m",
    ],
    priceRange: { min: 8000, max: 35000 },
    skuPrefix: "ARM-",
    imageKeywords: ["cable", "armored", "underground"],
    hsCode: "8544.49",
    weight: 12000,
    productType: "Cable Electrique",
  },

  // =========== CABLES BLINDES ===========
  {
    namePrefix: "Cable Blinde",
    nameSuffix: "CEM",
    descriptionTemplate:
      "Cable blinde compatibilite electromagnetique (CEM). Ecran cuivre tresse, protection contre perturbations. Pour environnements industriels, informatique et audiovisuel.",
    categoryHandle: "cables-blindes",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand"],
    optionName: "Type/Section",
    optionValues: [
      "2x1.5mm2 50m",
      "3x1.5mm2 50m",
      "2x2.5mm2 50m",
      "Cat6 FTP 100m",
      "Cat6A SFTP 100m",
    ],
    priceRange: { min: 5000, max: 25000 },
    skuPrefix: "BLIND-",
    imageKeywords: ["cable", "shielded", "emc"],
    hsCode: "8544.49",
    weight: 5000,
    productType: "Cable Electrique",
  },

  // =========== APPAREILLAGE-ODACE ===========
  {
    namePrefix: "Schneider Odace",
    nameSuffix: "",
    descriptionTemplate:
      "Appareillage Schneider Electric gamme Odace. Design epure, lignes contemporaines. Mecanismes silencieux, bornes automatiques. Large choix de finitions et couleurs.",
    categoryHandle: "appareillage-odace",
    rootCategory: "electricite",
    brands: ["schneider-electric"],
    optionName: "Fonction",
    optionValues: [
      "Interrupteur VV Blanc",
      "Prise 2P+T Blanc",
      "Double Prise Blanc",
      "Prise USB A+C Blanc",
      "Variateur LED Blanc",
    ],
    priceRange: { min: 600, max: 4500 },
    skuPrefix: "ODACE-",
    imageKeywords: ["switch", "socket", "odace"],
    hsCode: "8536.50",
    weight: 100,
    productType: "Appareillage Electrique",
  },

  // =========== APPAREILLAGE-CELIANE ===========
  {
    namePrefix: "Legrand Celiane",
    nameSuffix: "",
    descriptionTemplate:
      "Appareillage Legrand gamme Celiane. Formes arrondies elegantes, finitions haut de gamme. Mecanismes precis, installation rapide. Personnalisation plaques et touches.",
    categoryHandle: "appareillage-celiane",
    rootCategory: "electricite",
    brands: ["legrand"],
    optionName: "Fonction",
    optionValues: [
      "Interrupteur VV Blanc",
      "Prise 2P+T Blanc",
      "Double Prise Blanc",
      "Prise USB Blanc",
      "Variateur Toutes Charges",
    ],
    priceRange: { min: 800, max: 5500 },
    skuPrefix: "CELIANE-",
    imageKeywords: ["switch", "socket", "celiane"],
    hsCode: "8536.50",
    weight: 110,
    productType: "Appareillage Electrique",
  },

  // =========== APPAREILLAGE-MOSAIC ===========
  {
    namePrefix: "Legrand Mosaic",
    nameSuffix: "",
    descriptionTemplate:
      "Appareillage Legrand gamme Mosaic. Modularite 45x45mm, polyvalence maximale. Compatible goulottes, plinthes et boites sol. Standard tertiaire et residentiel haut de gamme.",
    categoryHandle: "appareillage-mosaic",
    rootCategory: "electricite",
    brands: ["legrand"],
    optionName: "Fonction",
    optionValues: [
      "Interrupteur VV 2M",
      "Prise 2P+T 2M",
      "Prise RJ45 Cat6 1M",
      "Prise USB Type-C 1M",
      "Obturateur 1M",
    ],
    priceRange: { min: 500, max: 4000 },
    skuPrefix: "MOSAIC-",
    imageKeywords: ["switch", "socket", "mosaic"],
    hsCode: "8536.50",
    weight: 80,
    productType: "Appareillage Electrique",
  },

  // =========== COFFRETS 1 RANGEE ===========
  {
    namePrefix: "Coffret Electrique",
    nameSuffix: "1 Rangee",
    descriptionTemplate:
      "Coffret electrique 1 rangee 13 modules. Encastre ou saillie selon modele. Rail DIN, borniers terre et neutre. IP30, classe II. Porte opaque ou transparente.",
    categoryHandle: "coffrets-1-rangee",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Type/Porte",
    optionValues: [
      "Encastre Opaque",
      "Encastre Transparent",
      "Saillie Opaque",
      "Saillie Transparent",
    ],
    priceRange: { min: 1500, max: 4500 },
    skuPrefix: "COFF-1R-",
    imageKeywords: ["panel", "electrical", "box"],
    hsCode: "8537.10",
    weight: 1500,
    productType: "Tableau Electrique",
  },

  // =========== COFFRETS 2 RANGEES ===========
  {
    namePrefix: "Coffret Electrique",
    nameSuffix: "2 Rangees",
    descriptionTemplate:
      "Coffret electrique 2 rangees 26 modules. Configuration standard appartement T2-T3. Rail DIN, borniers integres. IP30, classe II. Conforme NF C 15-100.",
    categoryHandle: "coffrets-2-rangees",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Type/Porte",
    optionValues: [
      "Encastre Opaque",
      "Encastre Transparent",
      "Saillie Opaque",
      "Precable T2",
    ],
    priceRange: { min: 2500, max: 7000 },
    skuPrefix: "COFF-2R-",
    imageKeywords: ["panel", "electrical", "enclosure"],
    hsCode: "8537.10",
    weight: 2500,
    productType: "Tableau Electrique",
  },

  // =========== COFFRETS 3 RANGEES PLUS ===========
  {
    namePrefix: "Coffret Electrique",
    nameSuffix: "3+ Rangees",
    descriptionTemplate:
      "Coffret electrique grande capacite 3 rangees et plus. Jusqu'a 72 modules. Ideal maison individuelle. Structure renforcee, accessoires de cablage inclus. Evolutif.",
    categoryHandle: "coffrets-3-rangees-plus",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Configuration",
    optionValues: [
      "3 rangees 39M",
      "4 rangees 52M",
      "5 rangees 65M",
      "6 rangees 72M",
    ],
    priceRange: { min: 5000, max: 18000 },
    skuPrefix: "COFF-3R-",
    imageKeywords: ["panel", "distribution", "board"],
    hsCode: "8537.10",
    weight: 5000,
    productType: "Tableau Electrique",
  },

  // =========== GAMME PROFESSIONNELLE ===========
  {
    namePrefix: "Appareillage Pro",
    nameSuffix: "Chantier",
    descriptionTemplate:
      "Appareillage gamme professionnelle pour chantier et locaux techniques. Robustesse renforcee IP55, resistance chocs IK08. Fixation saillie, etanche poussieres et projections eau.",
    categoryHandle: "gamme-professionnelle",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand"],
    optionName: "Fonction",
    optionValues: [
      "Interrupteur IP55",
      "Prise 2P+T IP55",
      "Prise CEE 16A",
      "Prise CEE 32A",
      "Coffret Prise IP65",
    ],
    priceRange: { min: 1200, max: 8000 },
    skuPrefix: "PRO-",
    imageKeywords: ["industrial", "socket", "waterproof"],
    hsCode: "8536.69",
    weight: 300,
    productType: "Appareillage Electrique",
  },

  // =========== FILS CONDUCTEURS ===========
  {
    namePrefix: "Conducteur Cuivre",
    nameSuffix: "Nu",
    descriptionTemplate:
      "Conducteur cuivre nu pour mise a la terre et liaisons equipotentielles. Cuivre electrolytique haute conductivite. Sections conformes NF C 15-100. En couronne.",
    categoryHandle: "fils-conducteurs",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand"],
    optionName: "Section/Longueur",
    optionValues: [
      "6mm2 25m",
      "10mm2 25m",
      "16mm2 25m",
      "25mm2 10m",
      "35mm2 10m",
    ],
    priceRange: { min: 3000, max: 15000 },
    skuPrefix: "CU-NU-",
    imageKeywords: ["copper", "wire", "ground"],
    hsCode: "7408.11",
    weight: 4000,
    productType: "Cable Electrique",
  },

  // =========== PVC 32MM ===========
  {
    namePrefix: "Tube PVC Evacuation",
    nameSuffix: "D32",
    descriptionTemplate:
      "Tube PVC evacuation diametre 32mm pour vidange lavabo, bidet et petit electromenager. Classement M1 autoextinguible. Assemblage par collage. Longueur 4m.",
    categoryHandle: "pvc-32mm",
    rootCategory: "plomberie",
    brands: ["geberit"],
    optionName: "Conditionnement",
    optionValues: ["Barre 2m", "Barre 4m", "Lot 5x2m", "Lot 3x4m"],
    priceRange: { min: 400, max: 2500 },
    skuPrefix: "PVC32-",
    imageKeywords: ["pvc", "drain", "pipe"],
    hsCode: "3917.23",
    weight: 1200,
    productType: "Tuyauterie",
  },

  // =========== PVC 40MM ===========
  {
    namePrefix: "Tube PVC Evacuation",
    nameSuffix: "D40",
    descriptionTemplate:
      "Tube PVC evacuation diametre 40mm standard pour evier, lavabo et machine a laver. Classement M1, conforme NF EN 1329-1. Longueur 4m, assemblage par collage.",
    categoryHandle: "pvc-40mm",
    rootCategory: "plomberie",
    brands: ["geberit"],
    optionName: "Conditionnement",
    optionValues: ["Barre 2m", "Barre 4m", "Lot 5x2m", "Lot 3x4m"],
    priceRange: { min: 500, max: 3000 },
    skuPrefix: "PVC40-",
    imageKeywords: ["pvc", "drain", "tube"],
    hsCode: "3917.23",
    weight: 1500,
    productType: "Tuyauterie",
  },

  // =========== PVC 50MM ===========
  {
    namePrefix: "Tube PVC Evacuation",
    nameSuffix: "D50",
    descriptionTemplate:
      "Tube PVC evacuation diametre 50mm pour douche, baignoire et collecteur secondaire. Debit eleve, conforme NF EN 1329-1. Classement M1. Longueur standard 4m.",
    categoryHandle: "pvc-50mm",
    rootCategory: "plomberie",
    brands: ["geberit"],
    optionName: "Conditionnement",
    optionValues: ["Barre 2m", "Barre 4m", "Lot 5x2m", "Lot 3x4m"],
    priceRange: { min: 600, max: 3500 },
    skuPrefix: "PVC50-",
    imageKeywords: ["pvc", "drainage", "pipe"],
    hsCode: "3917.23",
    weight: 1800,
    productType: "Tuyauterie",
  },

  // =========== PVC 100MM ===========
  {
    namePrefix: "Tube PVC Evacuation",
    nameSuffix: "D100",
    descriptionTemplate:
      "Tube PVC evacuation diametre 100mm pour WC et collecteur principal. Fort debit, conforme NF EN 1329-1. Classement M1 autoextinguible. Longueur 4m standard.",
    categoryHandle: "pvc-100mm",
    rootCategory: "plomberie",
    brands: ["geberit"],
    optionName: "Conditionnement",
    optionValues: ["Barre 2m", "Barre 4m", "Lot 3x2m", "Lot 2x4m"],
    priceRange: { min: 1200, max: 5500 },
    skuPrefix: "PVC100-",
    imageKeywords: ["pvc", "sewer", "large"],
    hsCode: "3917.23",
    weight: 3500,
    productType: "Tuyauterie",
  },

  // =========== PVC PRESSION ===========
  {
    namePrefix: "Tube PVC Pression",
    nameSuffix: "PN16",
    descriptionTemplate:
      "Tube PVC pression PN16 pour adduction eau froide et irrigation. Pression nominale 16 bars a 20C. Assemblage par collage ou joint. Conforme NF EN 1452.",
    categoryHandle: "pvc-pression",
    rootCategory: "plomberie",
    brands: ["geberit"],
    optionName: "Diametre",
    optionValues: [
      "D20 barre 4m",
      "D25 barre 4m",
      "D32 barre 4m",
      "D40 barre 4m",
      "D50 barre 4m",
    ],
    priceRange: { min: 800, max: 4500 },
    skuPrefix: "PVC-P-",
    imageKeywords: ["pvc", "pressure", "water"],
    hsCode: "3917.23",
    weight: 2500,
    productType: "Tuyauterie",
  },

  // =========== MITIGEURS SALLE DE BAIN ===========
  {
    namePrefix: "Mitigeur Salle de Bain",
    nameSuffix: "Design",
    descriptionTemplate:
      "Mitigeur lavabo salle de bain design contemporain. Cartouche ceramique 35mm, aérateur economiseur d'eau. Finition chrome brillant ou noir mat. Vidage clic-clac inclus.",
    categoryHandle: "mitigeurs-salle-de-bain",
    rootCategory: "plomberie",
    brands: ["grohe", "hansgrohe", "roca"],
    optionName: "Style/Finition",
    optionValues: [
      "Cascade Chrome",
      "Haut Chrome",
      "Standard Chrome",
      "Standard Noir Mat",
      "Mural Chrome",
    ],
    priceRange: { min: 5000, max: 25000 },
    skuPrefix: "MIG-SDB-",
    imageKeywords: ["faucet", "basin", "bathroom"],
    hsCode: "8481.80",
    weight: 1300,
    productType: "Robinetterie",
  },

  // =========== MITIGEURS DOUCHE ===========
  {
    namePrefix: "Mitigeur Douche",
    nameSuffix: "Encastre",
    descriptionTemplate:
      "Mitigeur douche encastre mecanique ou thermostatique. Corps encastrement inclus, facade finition chrome ou noir. Sortie 1/2\" pour flexible ou bras de douche.",
    categoryHandle: "mitigeurs-douche",
    rootCategory: "plomberie",
    brands: ["grohe", "hansgrohe", "roca"],
    optionName: "Type/Finition",
    optionValues: [
      "Mecanique Chrome",
      "Thermostatique Chrome",
      "Mecanique Noir",
      "Thermostatique Noir",
    ],
    priceRange: { min: 8000, max: 35000 },
    skuPrefix: "MIG-DCH-",
    imageKeywords: ["shower", "mixer", "concealed"],
    hsCode: "8481.80",
    weight: 1800,
    productType: "Robinetterie",
  },

  // =========== BATI-SUPPORTS ===========
  {
    namePrefix: "Bati-Support",
    nameSuffix: "WC Suspendu",
    descriptionTemplate:
      "Bati-support autoportant pour WC suspendu. Hauteur reglable, chasse d'eau 3/6L. Plaque de commande compatible. Conforme EN 997. Garantie 10 ans sur reservoir.",
    categoryHandle: "bati-supports",
    rootCategory: "plomberie",
    brands: ["geberit", "grohe"],
    optionName: "Configuration",
    optionValues: [
      "Standard 112cm",
      "Reduit 98cm",
      "Autoportant Angle",
      "Avec Extraction Odeurs",
    ],
    priceRange: { min: 18000, max: 55000 },
    skuPrefix: "BATI-",
    imageKeywords: ["frame", "toilet", "concealed"],
    hsCode: "3922.90",
    weight: 15000,
    productType: "Sanitaire",
  },

  // =========== RECEVEURS DOUCHE ===========
  {
    namePrefix: "Receveur Douche",
    nameSuffix: "Extra-Plat",
    descriptionTemplate:
      "Receveur de douche extra-plat hauteur 3 a 5cm. Resine minerale ou acrylique renforce. Surface antiderapante. Bonde extra-plate compatible. Decoupe possible.",
    categoryHandle: "receveurs-douche",
    rootCategory: "plomberie",
    brands: ["roca", "geberit"],
    optionName: "Dimensions",
    optionValues: [
      "80x80cm Blanc",
      "90x90cm Blanc",
      "100x80cm Blanc",
      "120x80cm Blanc",
      "140x90cm Blanc",
    ],
    priceRange: { min: 15000, max: 45000 },
    skuPrefix: "RECV-",
    imageKeywords: ["shower", "tray", "base"],
    hsCode: "3922.10",
    weight: 20000,
    productType: "Sanitaire",
  },

  // =========== PAROIS DOUCHE ===========
  {
    namePrefix: "Paroi Douche",
    nameSuffix: "Verre Securit",
    descriptionTemplate:
      "Paroi de douche verre securit 8mm traitement anti-calcaire. Profiles aluminium chrome ou noir. Fixation murale reglable. Reversible droite/gauche. Hauteur 200cm.",
    categoryHandle: "parois-douche",
    rootCategory: "plomberie",
    brands: ["roca"],
    optionName: "Configuration",
    optionValues: [
      "Fixe 80cm Chrome",
      "Fixe 100cm Chrome",
      "Pivotante 90cm",
      "Coulissante 120cm",
      "Walk-in 120cm Noir",
    ],
    priceRange: { min: 25000, max: 80000 },
    skuPrefix: "PAROI-",
    imageKeywords: ["shower", "screen", "glass"],
    hsCode: "7007.19",
    weight: 25000,
    productType: "Sanitaire",
  },

  // =========== COLONNES DOUCHE ===========
  {
    namePrefix: "Colonne Douche",
    nameSuffix: "Complete",
    descriptionTemplate:
      "Colonne de douche complete avec mitigeur thermostatique, douchette et pomme de tete. Securite anti-brulure 38C. Corps laiton, flexibles inclus. Fixation reglable.",
    categoryHandle: "colonnes-douche",
    rootCategory: "plomberie",
    brands: ["grohe", "hansgrohe"],
    optionName: "Style/Finition",
    optionValues: [
      "Ronde Chrome",
      "Carree Chrome",
      "Design Chrome",
      "Ronde Noir Mat",
      "Carree Noir Mat",
    ],
    priceRange: { min: 20000, max: 65000 },
    skuPrefix: "COL-DCH-",
    imageKeywords: ["shower", "column", "thermostatic"],
    hsCode: "8481.80",
    weight: 6000,
    productType: "Robinetterie",
  },

  // =========== PERCEUSES SANS FIL ===========
  {
    namePrefix: "Perceuse Sans Fil",
    nameSuffix: "Brushless",
    descriptionTemplate:
      "Perceuse-visseuse sans fil moteur brushless haute performance. Mandrin metal 13mm autoserrant. 2 vitesses, variateur electronique. LED integree. Coffret et batteries inclus.",
    categoryHandle: "perceuses-sans-fil",
    rootCategory: "outillage",
    brands: ["bosch", "dewalt", "makita", "milwaukee"],
    optionName: "Voltage/Kit",
    optionValues: [
      "12V 2x2Ah",
      "18V 2x2Ah",
      "18V 2x4Ah",
      "18V 2x5Ah Pro",
      "18V Machine Seule",
    ],
    priceRange: { min: 10000, max: 45000 },
    skuPrefix: "PERC-SF-",
    imageKeywords: ["drill", "cordless", "brushless"],
    hsCode: "8467.21",
    weight: 2200,
    productType: "Outillage Electroportatif",
  },

  // =========== PERCEUSES FILAIRES ===========
  {
    namePrefix: "Perceuse Filaire",
    nameSuffix: "a Percussion",
    descriptionTemplate:
      "Perceuse filaire a percussion pour beton, brique et materiaux durs. Moteur puissant, mandrin metal 13mm. Variateur de vitesse, inversion rotation. Poignee auxiliaire.",
    categoryHandle: "perceuses-filaires",
    rootCategory: "outillage",
    brands: ["bosch", "dewalt", "makita", "metabo"],
    optionName: "Puissance",
    optionValues: ["650W", "750W", "850W", "1000W", "1100W"],
    priceRange: { min: 5000, max: 18000 },
    skuPrefix: "PERC-FIL-",
    imageKeywords: ["drill", "corded", "hammer"],
    hsCode: "8467.21",
    weight: 2500,
    productType: "Outillage Electroportatif",
  },

  // =========== NIVEAUX A BULLE ===========
  {
    namePrefix: "Niveau a Bulle",
    nameSuffix: "Professionnel",
    descriptionTemplate:
      "Niveau a bulle professionnel aluminium profile renforce. 3 fioles precision 0.5mm/m. Embouts antichocs remplacables. Surfaces d'appui usinees. Garantie precision a vie.",
    categoryHandle: "niveaux-a-bulle",
    rootCategory: "outillage",
    brands: ["stanley", "stabila", "bosch"],
    optionName: "Longueur",
    optionValues: ["40cm", "60cm", "80cm", "100cm", "120cm", "200cm"],
    priceRange: { min: 2000, max: 12000 },
    skuPrefix: "NIV-BUL-",
    imageKeywords: ["level", "spirit", "bubble"],
    hsCode: "9015.80",
    weight: 1000,
    productType: "Materiel de Mesure",
  },

  // =========== NIVEAUX LASER ===========
  {
    namePrefix: "Niveau Laser",
    nameSuffix: "Auto-Nivelant",
    descriptionTemplate:
      "Niveau laser lignes auto-nivelant. Faisceau vert haute visibilite. Croisement horizontal/vertical. Mode impulsion pour cellule. Trepied et support mural inclus.",
    categoryHandle: "niveaux-laser",
    rootCategory: "outillage",
    brands: ["bosch", "dewalt", "hilti", "makita"],
    optionName: "Configuration",
    optionValues: [
      "2 lignes Vert 15m",
      "3 lignes Vert 25m",
      "360 Vert 30m",
      "360x2 Vert 40m",
    ],
    priceRange: { min: 12000, max: 60000 },
    skuPrefix: "LAS-NIV-",
    imageKeywords: ["laser", "level", "green"],
    hsCode: "9015.40",
    weight: 800,
    productType: "Materiel de Mesure",
  },

  // =========== RADIATEURS INERTIE ===========
  {
    namePrefix: "Radiateur Inertie",
    nameSuffix: "Coeur de Chauffe",
    descriptionTemplate:
      "Radiateur electrique inertie coeur de chauffe ceramique ou pierre. Chaleur douce et homogene. Programmation digitale, detection fenetre ouverte. NF Electricite Performance.",
    categoryHandle: "radiateurs-inertie",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor"],
    optionName: "Puissance/Type",
    optionValues: [
      "1000W Ceramique",
      "1500W Ceramique",
      "2000W Ceramique",
      "1500W Pierre",
      "2000W Pierre",
    ],
    priceRange: { min: 35000, max: 90000 },
    skuPrefix: "RAD-INER-",
    imageKeywords: ["radiator", "inertia", "electric"],
    hsCode: "8516.29",
    weight: 22000,
    productType: "Chauffage Electrique",
  },

  // =========== RADIATEURS RAYONNANTS ===========
  {
    namePrefix: "Panneau Rayonnant",
    nameSuffix: "Nouvelle Generation",
    descriptionTemplate:
      "Panneau rayonnant nouvelle generation facade verre ou metal. Chaleur immediate par rayonnement infrarouge. Programmation integree, detecteur presence optionnel.",
    categoryHandle: "radiateurs-rayonnants",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor"],
    optionName: "Puissance/Facade",
    optionValues: [
      "1000W Verre Blanc",
      "1500W Verre Blanc",
      "1000W Verre Noir",
      "1500W Metal Blanc",
      "2000W Metal Blanc",
    ],
    priceRange: { min: 18000, max: 50000 },
    skuPrefix: "RAD-RAY-",
    imageKeywords: ["panel", "radiant", "glass"],
    hsCode: "8516.29",
    weight: 12000,
    productType: "Chauffage Electrique",
  },

  // =========== CONVECTEURS ===========
  {
    namePrefix: "Convecteur Electrique",
    nameSuffix: "Mural",
    descriptionTemplate:
      "Convecteur electrique mural economique. Montee en temperature rapide. Thermostat mecanique ou electronique. Silencieux, leger, installation facile. IP24 salle de bain.",
    categoryHandle: "convecteurs",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor"],
    optionName: "Puissance/Type",
    optionValues: [
      "500W Mecanique",
      "1000W Mecanique",
      "1500W Mecanique",
      "1000W Electronique",
      "2000W Electronique",
    ],
    priceRange: { min: 2500, max: 12000 },
    skuPrefix: "CONV-MUR-",
    imageKeywords: ["convector", "heater", "wall"],
    hsCode: "8516.29",
    weight: 4500,
    productType: "Chauffage Electrique",
  },

  // =========== CHAUDIERES MURALES ===========
  {
    namePrefix: "Chaudiere Murale",
    nameSuffix: "Gaz",
    descriptionTemplate:
      "Chaudiere gaz murale compacte pour chauffage et production ECS. Rendement eleve, faible encombrement. Raccordement ventouse ou cheminee. Regulation integree.",
    categoryHandle: "chaudieres-murales",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "daikin"],
    optionName: "Puissance/Type",
    optionValues: [
      "24kW Instantanee",
      "28kW Instantanee",
      "24kW Micro-accumulation",
      "30kW Instantanee",
    ],
    priceRange: { min: 120000, max: 280000 },
    skuPrefix: "CHAUD-MUR-",
    imageKeywords: ["boiler", "gas", "wall"],
    hsCode: "8403.10",
    weight: 32000,
    productType: "Chauffage Central",
  },

  // =========== CHAUDIERES SOL ===========
  {
    namePrefix: "Chaudiere Sol",
    nameSuffix: "Gaz ou Fioul",
    descriptionTemplate:
      "Chaudiere sol haute puissance pour grandes surfaces. Bruleur gaz ou fioul selon modele. Ballon integre ou separe. Robustesse professionnelle, garantie etendue.",
    categoryHandle: "chaudieres-sol",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic"],
    optionName: "Configuration",
    optionValues: [
      "Gaz 25kW",
      "Gaz 35kW",
      "Fioul 25kW",
      "Fioul 35kW",
      "Gaz 45kW Ballon 130L",
    ],
    priceRange: { min: 200000, max: 500000 },
    skuPrefix: "CHAUD-SOL-",
    imageKeywords: ["boiler", "floor", "standing"],
    hsCode: "8403.10",
    weight: 120000,
    productType: "Chauffage Central",
  },

  // =========== CHAUDIERES CONDENSATION ===========
  {
    namePrefix: "Chaudiere Condensation",
    nameSuffix: "Gaz HPE",
    descriptionTemplate:
      "Chaudiere gaz condensation haute performance energetique. Rendement superieur a 100% sur PCI. Classe A++, eligible aides renovation energetique. Connectee et modulante.",
    categoryHandle: "chaudieres-condensation",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "daikin"],
    optionName: "Puissance/Type",
    optionValues: [
      "24kW Murale",
      "28kW Murale",
      "35kW Murale",
      "35kW Sol",
      "45kW Sol Ballon 150L",
    ],
    priceRange: { min: 180000, max: 450000 },
    skuPrefix: "CHAUD-COND-",
    imageKeywords: ["boiler", "condensing", "efficient"],
    hsCode: "8403.10",
    weight: 38000,
    productType: "Chauffage Central",
  },

  // =========== PAC AIR-EAU ===========
  {
    namePrefix: "Pompe a Chaleur",
    nameSuffix: "Air-Eau",
    descriptionTemplate:
      "Pompe a chaleur air-eau pour chauffage et ECS. COP eleve, fonctionnement silencieux. Compatible plancher chauffant et radiateurs. Eligible MaPrimeRenov. Classe A++.",
    categoryHandle: "pac-air-eau",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "daikin"],
    optionName: "Puissance/Type",
    optionValues: [
      "6kW Monobloc",
      "8kW Monobloc",
      "11kW Monobloc",
      "8kW Split",
      "14kW Split",
    ],
    priceRange: { min: 600000, max: 1500000 },
    skuPrefix: "PAC-AE-",
    imageKeywords: ["heat", "pump", "outdoor"],
    hsCode: "8418.61",
    weight: 85000,
    productType: "Pompe a Chaleur",
  },

  // =========== PAC AIR-AIR ===========
  {
    namePrefix: "Pompe a Chaleur",
    nameSuffix: "Air-Air",
    descriptionTemplate:
      "Pompe a chaleur air-air reversible chauffage et climatisation. Technologie inverter, consommation optimisee. Multi-split jusqu'a 5 unites interieures. Classe A++.",
    categoryHandle: "pac-air-air",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "atlantic"],
    optionName: "Configuration",
    optionValues: [
      "Mono-split 2.5kW",
      "Mono-split 3.5kW",
      "Bi-split 2x2.5kW",
      "Tri-split 3x2.5kW",
      "Quadri-split 4x2.5kW",
    ],
    priceRange: { min: 150000, max: 600000 },
    skuPrefix: "PAC-AA-",
    imageKeywords: ["air", "conditioner", "split"],
    hsCode: "8415.10",
    weight: 40000,
    productType: "Pompe a Chaleur",
  },

  // =========== PAC GEOTHERMIQUES ===========
  {
    namePrefix: "Pompe a Chaleur",
    nameSuffix: "Geothermique",
    descriptionTemplate:
      "Pompe a chaleur geothermique eau-eau ou sol-eau. COP superieur a 5, rendement optimal. Captage horizontal ou vertical. Solution perenne 20 ans+. Silencieuse.",
    categoryHandle: "pac-geothermiques",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic"],
    optionName: "Puissance/Type",
    optionValues: [
      "6kW Eau-Eau",
      "10kW Eau-Eau",
      "14kW Eau-Eau",
      "10kW Sol-Eau",
      "17kW Sol-Eau",
    ],
    priceRange: { min: 800000, max: 2000000 },
    skuPrefix: "PAC-GEO-",
    imageKeywords: ["geothermal", "heat", "pump"],
    hsCode: "8418.61",
    weight: 100000,
    productType: "Pompe a Chaleur",
  },

  // =========== VMC SIMPLE FLUX ===========
  {
    namePrefix: "VMC Simple Flux",
    nameSuffix: "Hygroreglable",
    descriptionTemplate:
      "VMC simple flux hygroreglable type B. Debit ajuste automatiquement selon humidite. Bouches hygroreglables incluses. Basse consommation, tres silencieuse.",
    categoryHandle: "vmc-simple-flux",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic"],
    optionName: "Configuration",
    optionValues: [
      "2 sanitaires Hygro B",
      "3 sanitaires Hygro B",
      "4 sanitaires Hygro B",
      "5 sanitaires Hygro B",
    ],
    priceRange: { min: 15000, max: 45000 },
    skuPrefix: "VMC-SF-",
    imageKeywords: ["ventilation", "extract", "hygro"],
    hsCode: "8414.59",
    weight: 6000,
    productType: "Ventilation",
  },

  // =========== VMC DOUBLE FLUX ===========
  {
    namePrefix: "VMC Double Flux",
    nameSuffix: "Haut Rendement",
    descriptionTemplate:
      "VMC double flux thermodynamique haut rendement. Recuperation chaleur superieure a 90%. Filtration air neuf, bypass ete automatique. Connectee et programmable.",
    categoryHandle: "vmc-double-flux",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic"],
    optionName: "Debit/Type",
    optionValues: [
      "150m3/h Standard",
      "250m3/h Standard",
      "350m3/h Standard",
      "250m3/h Enthalpique",
      "350m3/h Enthalpique",
    ],
    priceRange: { min: 150000, max: 450000 },
    skuPrefix: "VMC-DF-",
    imageKeywords: ["ventilation", "heat", "recovery"],
    hsCode: "8414.59",
    weight: 35000,
    productType: "Ventilation",
  },
];

/**
 * Additional Product Templates 2 - Covering ALL remaining 96 leaf categories
 *
 * Categories covered:
 * - Electricite (22): h07v-u sections, h07v-r sections, h05vvf, interrupteurs, prises, variateurs,
 *   disjoncteurs, differentiels, coffrets, LED bulbs, luminaires
 * - Plomberie (18): PER tubes, multicouche tubes, raccords, mitigeurs, WC, accessoires
 * - Outillage (14): perceuses, perforateurs, meuleuses, cles, tournevis, niveaux
 * - Chauffage-Climatisation (21): radiateurs, seche-serviettes, chauffe-eau, climatiseurs, VMC, gaines
 * - Quincaillerie (20): chevilles, vis, serrures, cylindres, poignees, ferrures, etancheite
 */
export const additionalProductTemplates2: ProductTemplate[] = [
  // ===========================================================================
  // ELECTRICITE - CABLES SPECIFIQUES (7 categories)
  // ===========================================================================

  // H07V-U 1.5mm2
  {
    namePrefix: "Fil H07V-U 1.5mm2",
    nameSuffix: "Rigide",
    descriptionTemplate:
      "Fil electrique rigide H07V-U section 1.5mm2. Ame cuivre plein, isolation PVC 450/750V. Pour circuits eclairage et prises. Conforme NF C 32-201. Couronne 100m.",
    categoryHandle: "h07v-u-1-5",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "nexans"],
    optionName: "Couleur",
    optionValues: ["Bleu (Neutre)", "Rouge (Phase)", "Vert-Jaune (Terre)", "Marron", "Noir", "Orange"],
    priceRange: { min: 1800, max: 3500 },
    skuPrefix: "H07VU-15-",
    imageKeywords: ["wire", "copper", "1.5mm"],
    hsCode: "8544.49",
    weight: 2800,
    productType: "Cable Electrique",
  },

  // H07V-U 2.5mm2
  {
    namePrefix: "Fil H07V-U 2.5mm2",
    nameSuffix: "Rigide",
    descriptionTemplate:
      "Fil electrique rigide H07V-U section 2.5mm2. Ame cuivre plein pour circuits prises et petits appareils. Isolation PVC 450/750V. Conforme NF C 32-201.",
    categoryHandle: "h07v-u-2-5",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "nexans"],
    optionName: "Couleur",
    optionValues: ["Bleu (Neutre)", "Rouge (Phase)", "Vert-Jaune (Terre)", "Marron", "Noir"],
    priceRange: { min: 2800, max: 5500 },
    skuPrefix: "H07VU-25-",
    imageKeywords: ["wire", "copper", "2.5mm"],
    hsCode: "8544.49",
    weight: 4200,
    productType: "Cable Electrique",
  },

  // H07V-U 6mm2
  {
    namePrefix: "Fil H07V-U 6mm2",
    nameSuffix: "Rigide",
    descriptionTemplate:
      "Fil electrique rigide H07V-U section 6mm2. Ame cuivre plein pour circuits puissance (plaque, four). Isolation PVC 450/750V. Conforme NF C 32-201.",
    categoryHandle: "h07v-u-6",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "nexans"],
    optionName: "Couleur/Conditionnement",
    optionValues: ["Bleu 25m", "Rouge 25m", "Vert-Jaune 25m", "Bleu 100m", "Rouge 100m"],
    priceRange: { min: 3500, max: 12000 },
    skuPrefix: "H07VU-6-",
    imageKeywords: ["wire", "copper", "6mm"],
    hsCode: "8544.49",
    weight: 8500,
    productType: "Cable Electrique",
  },

  // H07V-R 10mm2
  {
    namePrefix: "Fil H07V-R 10mm2",
    nameSuffix: "Multibrins",
    descriptionTemplate:
      "Fil electrique H07V-R section 10mm2 multibrins. Plus souple que le rigide, pour liaisons tableau. Isolation PVC 450/750V. Conforme NF C 32-201.",
    categoryHandle: "h07v-r-10",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "nexans"],
    optionName: "Couleur/Conditionnement",
    optionValues: ["Bleu 25m", "Rouge 25m", "Vert-Jaune 25m", "Noir 25m"],
    priceRange: { min: 5500, max: 9500 },
    skuPrefix: "H07VR-10-",
    imageKeywords: ["wire", "stranded", "10mm"],
    hsCode: "8544.49",
    weight: 12000,
    productType: "Cable Electrique",
  },

  // H07V-R 16mm2
  {
    namePrefix: "Fil H07V-R 16mm2",
    nameSuffix: "Multibrins",
    descriptionTemplate:
      "Fil electrique H07V-R section 16mm2 multibrins. Pour liaisons principales et derivations puissance. Isolation PVC 450/750V. Grande souplesse de pose.",
    categoryHandle: "h07v-r-16",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "nexans"],
    optionName: "Couleur/Conditionnement",
    optionValues: ["Bleu 25m", "Rouge 25m", "Vert-Jaune 25m", "Noir 25m"],
    priceRange: { min: 8500, max: 15000 },
    skuPrefix: "H07VR-16-",
    imageKeywords: ["wire", "stranded", "16mm"],
    hsCode: "8544.49",
    weight: 18000,
    productType: "Cable Electrique",
  },

  // H05VVF 2x0.75
  {
    namePrefix: "Cable H05VVF 2x0.75",
    nameSuffix: "Souple",
    descriptionTemplate:
      "Cable souple H05VVF 2 conducteurs 0.75mm2. Pour appareils mobiles faible puissance (luminaires, petits appareils). Gaine PVC grise ou blanche. Couronne 50m.",
    categoryHandle: "h05vvf-2x0-75",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "nexans"],
    optionName: "Couleur/Conditionnement",
    optionValues: ["Blanc 10m", "Blanc 25m", "Blanc 50m", "Gris 25m", "Gris 50m"],
    priceRange: { min: 800, max: 3500 },
    skuPrefix: "H05VVF-2075-",
    imageKeywords: ["cable", "flexible", "light"],
    hsCode: "8544.49",
    weight: 1800,
    productType: "Cable Electrique",
  },

  // H05VVF 3x1
  {
    namePrefix: "Cable H05VVF 3x1",
    nameSuffix: "Souple",
    descriptionTemplate:
      "Cable souple H05VVF 3 conducteurs 1mm2. Pour appareils mobiles jusqu'a 10A. Gaine PVC souple, ideal electromenager. Couronne 25 ou 50m.",
    categoryHandle: "h05vvf-3x1",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "nexans"],
    optionName: "Couleur/Conditionnement",
    optionValues: ["Blanc 10m", "Blanc 25m", "Blanc 50m", "Gris 25m", "Noir 25m"],
    priceRange: { min: 1200, max: 4500 },
    skuPrefix: "H05VVF-3x1-",
    imageKeywords: ["cable", "flexible", "appliance"],
    hsCode: "8544.49",
    weight: 2500,
    productType: "Cable Electrique",
  },

  // ===========================================================================
  // ELECTRICITE - APPAREILLAGE (7 categories)
  // ===========================================================================

  // Interrupteurs Simple Allumage
  {
    namePrefix: "Interrupteur Simple Allumage",
    nameSuffix: "Encastre",
    descriptionTemplate:
      "Interrupteur simple allumage encastre. Mecanisme 10A, bornes automatiques ou a vis. Compatible toutes gammes. Fixation griffes ou vis.",
    categoryHandle: "interrupteurs-simple-allumage",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Gamme/Finition",
    optionValues: ["Odace Blanc", "Celiane Blanc", "Mosaic Blanc", "Dooxie Blanc", "Niloe Blanc"],
    priceRange: { min: 400, max: 2500 },
    skuPrefix: "INT-SA-",
    imageKeywords: ["switch", "single", "wall"],
    hsCode: "8536.50",
    weight: 80,
    productType: "Appareillage Electrique",
  },

  // Interrupteurs Va-et-Vient
  {
    namePrefix: "Interrupteur Va-et-Vient",
    nameSuffix: "Encastre",
    descriptionTemplate:
      "Interrupteur va-et-vient encastre pour commande d'un point lumineux depuis 2 endroits. Mecanisme 10A, bornes automatiques. Silencieux.",
    categoryHandle: "interrupteurs-va-et-vient",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Gamme/Finition",
    optionValues: ["Odace Blanc", "Celiane Blanc", "Mosaic Blanc", "Dooxie Blanc", "Niloe Blanc"],
    priceRange: { min: 450, max: 2800 },
    skuPrefix: "INT-VV-",
    imageKeywords: ["switch", "two-way", "wall"],
    hsCode: "8536.50",
    weight: 85,
    productType: "Appareillage Electrique",
  },

  // Boutons Poussoirs
  {
    namePrefix: "Bouton Poussoir",
    nameSuffix: "Encastre",
    descriptionTemplate:
      "Bouton poussoir encastre pour telerupteur ou minuterie. Contact NO 6A, retour par ressort. Compatible LED temoin. Silencieux.",
    categoryHandle: "boutons-poussoirs",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Gamme/Finition",
    optionValues: ["Odace Blanc", "Celiane Blanc", "Mosaic Blanc", "Avec Voyant", "Double"],
    priceRange: { min: 500, max: 3000 },
    skuPrefix: "BP-",
    imageKeywords: ["push", "button", "bell"],
    hsCode: "8536.50",
    weight: 75,
    productType: "Appareillage Electrique",
  },

  // Prises 2P+T 16A
  {
    namePrefix: "Prise 2P+T 16A",
    nameSuffix: "Encastree",
    descriptionTemplate:
      "Prise de courant 2P+T 16A encastree. Bornes automatiques, obturateurs de securite enfant. Compatible toutes gammes decoratives. IP20.",
    categoryHandle: "prises-2p-t-16a",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Gamme/Finition",
    optionValues: ["Odace Blanc", "Celiane Blanc", "Mosaic Blanc", "Dooxie Blanc", "Double Poste"],
    priceRange: { min: 350, max: 2200 },
    skuPrefix: "PR-16A-",
    imageKeywords: ["outlet", "socket", "16A"],
    hsCode: "8536.69",
    weight: 90,
    productType: "Appareillage Electrique",
  },

  // Prises USB
  {
    namePrefix: "Prise USB",
    nameSuffix: "Integree",
    descriptionTemplate:
      "Prise avec chargeur USB integre. Ports USB-A et/ou USB-C, charge rapide. Compatible smartphone et tablette. Installation standard encastree.",
    categoryHandle: "prises-usb",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Configuration",
    optionValues: ["2x USB-A Blanc", "USB-A + USB-C Blanc", "2x USB-C Blanc", "Avec Prise 2P+T", "Double USB-C 30W"],
    priceRange: { min: 1500, max: 5500 },
    skuPrefix: "PR-USB-",
    imageKeywords: ["usb", "charger", "outlet"],
    hsCode: "8536.69",
    weight: 100,
    productType: "Appareillage Electrique",
  },

  // Prises RJ45
  {
    namePrefix: "Prise RJ45",
    nameSuffix: "Cat6",
    descriptionTemplate:
      "Prise informatique RJ45 categorie 6 ou 6A. Pour reseau ethernet jusqu'a 1Gbps. Connexion auto-denudante ou a sertir. Compatible VDI.",
    categoryHandle: "prises-rj45",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Categorie/Configuration",
    optionValues: ["Cat6 Simple", "Cat6 Double", "Cat6A Simple", "Cat6A Blindee", "Cat6 + TV"],
    priceRange: { min: 1200, max: 4500 },
    skuPrefix: "RJ45-",
    imageKeywords: ["rj45", "network", "ethernet"],
    hsCode: "8536.69",
    weight: 85,
    productType: "Appareillage Electrique",
  },

  // Variateurs
  {
    namePrefix: "Variateur",
    nameSuffix: "LED Compatible",
    descriptionTemplate:
      "Variateur d'intensite compatible LED, halogene et incandescent. Technologie universelle, reglage minimum. Silencieux, sans gresillements.",
    categoryHandle: "variateurs",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Puissance/Type",
    optionValues: ["LED 3-75W", "LED 3-150W", "LED 3-300W", "Rotatif", "Tactile"],
    priceRange: { min: 2500, max: 8500 },
    skuPrefix: "VAR-",
    imageKeywords: ["dimmer", "led", "control"],
    hsCode: "8536.50",
    weight: 110,
    productType: "Appareillage Electrique",
  },

  // ===========================================================================
  // ELECTRICITE - TABLEAU (6 categories)
  // ===========================================================================

  // Disjoncteurs 10A-20A
  {
    namePrefix: "Disjoncteur",
    nameSuffix: "Courbe C",
    descriptionTemplate:
      "Disjoncteur modulaire courbe C pour protection circuits. Pouvoir de coupure 6kA, 1 module DIN. Calibres 10A, 16A ou 20A. Conforme NF C 15-100.",
    categoryHandle: "disjoncteurs-10a-20a",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Calibre",
    optionValues: ["10A Eclairage", "16A Prises", "20A Prises specialisees", "Pack 10x16A", "Pack 5x20A"],
    priceRange: { min: 600, max: 4500 },
    skuPrefix: "DJ-C-",
    imageKeywords: ["breaker", "circuit", "modular"],
    hsCode: "8536.20",
    weight: 120,
    productType: "Protection Electrique",
  },

  // Disjoncteurs 25A-40A
  {
    namePrefix: "Disjoncteur",
    nameSuffix: "Courbe C Puissance",
    descriptionTemplate:
      "Disjoncteur modulaire courbe C haute puissance. Calibres 25A, 32A ou 40A pour plaque, four, chauffe-eau. Pouvoir de coupure 6kA ou 10kA.",
    categoryHandle: "disjoncteurs-25a-40a",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Calibre",
    optionValues: ["25A Chauffe-eau", "32A Plaque", "32A Four", "40A Puissance", "32A 10kA"],
    priceRange: { min: 900, max: 3500 },
    skuPrefix: "DJ-PUIS-",
    imageKeywords: ["breaker", "power", "high"],
    hsCode: "8536.20",
    weight: 140,
    productType: "Protection Electrique",
  },

  // Disjoncteurs Courbe D
  {
    namePrefix: "Disjoncteur",
    nameSuffix: "Courbe D",
    descriptionTemplate:
      "Disjoncteur modulaire courbe D pour charges a fort appel de courant (moteurs, transformateurs). Pouvoir de coupure 10kA. Usage industriel et tertiaire.",
    categoryHandle: "disjoncteurs-courbe-d",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Calibre",
    optionValues: ["6A Moteur", "10A Moteur", "16A Moteur", "20A Moteur", "25A Transformateur"],
    priceRange: { min: 1200, max: 4500 },
    skuPrefix: "DJ-D-",
    imageKeywords: ["breaker", "motor", "industrial"],
    hsCode: "8536.20",
    weight: 150,
    productType: "Protection Electrique",
  },

  // Differentiels 30mA Type AC
  {
    namePrefix: "Interrupteur Differentiel",
    nameSuffix: "30mA Type AC",
    descriptionTemplate:
      "Interrupteur differentiel 30mA type AC. Protection contre contacts indirects. 2P 25A, 40A ou 63A. Declenchement sur defaut sinusoidal. NF C 15-100.",
    categoryHandle: "differentiels-30ma-type-ac",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Calibre/Poles",
    optionValues: ["2P 25A", "2P 40A", "2P 63A", "4P 40A", "4P 63A"],
    priceRange: { min: 2500, max: 8500 },
    skuPrefix: "ID-AC-",
    imageKeywords: ["rcd", "safety", "protection"],
    hsCode: "8536.30",
    weight: 200,
    productType: "Protection Electrique",
  },

  // Differentiels 30mA Type A
  {
    namePrefix: "Interrupteur Differentiel",
    nameSuffix: "30mA Type A",
    descriptionTemplate:
      "Interrupteur differentiel 30mA type A. Protection circuits avec composante continue (plaque induction, lave-linge). Obligatoire NF C 15-100.",
    categoryHandle: "differentiels-30ma-type-a",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Calibre/Poles",
    optionValues: ["2P 25A", "2P 40A", "2P 63A", "4P 40A", "Hpi 40A"],
    priceRange: { min: 4500, max: 15000 },
    skuPrefix: "ID-A-",
    imageKeywords: ["rcd", "type-a", "induction"],
    hsCode: "8536.30",
    weight: 220,
    productType: "Protection Electrique",
  },

  // Coffrets
  {
    namePrefix: "Coffret Electrique",
    nameSuffix: "Modulaire",
    descriptionTemplate:
      "Coffret electrique modulaire vide ou pre-equipe. De 1 a 6 rangees, 13 a 72 modules. Encastre ou saillie. Porte opaque ou transparente. IP30 classe II.",
    categoryHandle: "coffrets",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Configuration",
    optionValues: ["1 rangee Vide", "2 rangees Vide", "3 rangees Vide", "4 rangees Vide", "2 rangees Pre-cable"],
    priceRange: { min: 2500, max: 18000 },
    skuPrefix: "COFF-MOD-",
    imageKeywords: ["enclosure", "panel", "distribution"],
    hsCode: "8537.10",
    weight: 3500,
    productType: "Tableau Electrique",
  },

  // ===========================================================================
  // ELECTRICITE - ECLAIRAGE LED (8 categories)
  // ===========================================================================

  // LED E27
  {
    namePrefix: "Ampoule LED E27",
    nameSuffix: "Standard",
    descriptionTemplate:
      "Ampoule LED culot E27 (gros vis) remplacement incandescent. Haute efficacite energetique, duree de vie 15 000h. Allumage instantane, non dimmable standard.",
    categoryHandle: "led-e27",
    rootCategory: "electricite",
    brands: ["philips", "osram", "ledvance"],
    optionName: "Puissance/Teinte",
    optionValues: ["7W=60W Blanc Chaud", "10W=75W Blanc Chaud", "13W=100W Blanc Chaud", "10W Blanc Neutre", "7W Dimmable"],
    priceRange: { min: 250, max: 1200 },
    skuPrefix: "LED-E27-",
    imageKeywords: ["bulb", "led", "e27"],
    hsCode: "8539.50",
    weight: 50,
    productType: "Eclairage LED",
  },

  // LED E14
  {
    namePrefix: "Ampoule LED E14",
    nameSuffix: "Flamme",
    descriptionTemplate:
      "Ampoule LED culot E14 (petit vis) forme flamme ou goutte. Ideale lustres et appliques. Haute efficacite, blanc chaud ou neutre. 15 000h duree de vie.",
    categoryHandle: "led-e14",
    rootCategory: "electricite",
    brands: ["philips", "osram", "ledvance"],
    optionName: "Puissance/Forme",
    optionValues: ["4W Flamme Claire", "5W Flamme Depolie", "6W Goutte", "4W Flamme Coup de Vent", "5W Dimmable"],
    priceRange: { min: 250, max: 1000 },
    skuPrefix: "LED-E14-",
    imageKeywords: ["bulb", "candle", "e14"],
    hsCode: "8539.50",
    weight: 35,
    productType: "Eclairage LED",
  },

  // LED GU10
  {
    namePrefix: "Ampoule LED GU10",
    nameSuffix: "Spot",
    descriptionTemplate:
      "Spot LED culot GU10 remplacement halogene 50W. Angle 36 ou 60 degres, IRC>80. Allumage instantane, compatible variateur selon modele.",
    categoryHandle: "led-gu10",
    rootCategory: "electricite",
    brands: ["philips", "osram", "ledvance"],
    optionName: "Puissance/Angle",
    optionValues: ["4.5W=50W 36deg", "5.5W=50W 60deg", "6.5W=80W 36deg", "5W Dimmable", "Pack 5 Spots"],
    priceRange: { min: 300, max: 1500 },
    skuPrefix: "LED-GU10-",
    imageKeywords: ["spot", "gu10", "halogen"],
    hsCode: "8539.50",
    weight: 40,
    productType: "Eclairage LED",
  },

  // Tubes LED T8
  {
    namePrefix: "Tube LED T8",
    nameSuffix: "Remplacement Fluo",
    descriptionTemplate:
      "Tube LED T8 remplacement direct tubes fluorescents. Installation directe ou avec modification. Economies jusqu'a 60%. Eclairage uniforme sans scintillement.",
    categoryHandle: "tubes-led-t8",
    rootCategory: "electricite",
    brands: ["philips", "osram", "ledvance"],
    optionName: "Longueur/Puissance",
    optionValues: ["60cm 10W", "120cm 18W", "150cm 22W", "120cm 18W Blanc Froid", "Pack 10 Tubes 120cm"],
    priceRange: { min: 600, max: 4500 },
    skuPrefix: "TUBE-LED-",
    imageKeywords: ["tube", "t8", "fluorescent"],
    hsCode: "8539.50",
    weight: 200,
    productType: "Eclairage LED",
  },

  // Spots LED Encastrables
  {
    namePrefix: "Spot LED Encastrable",
    nameSuffix: "Plafond",
    descriptionTemplate:
      "Spot LED encastrable plafond fixe ou orientable. Decoupe standard 68-90mm. Driver integre, installation facile. IRC>80, eclairage sans eblouissement.",
    categoryHandle: "spots-led-encastrables",
    rootCategory: "electricite",
    brands: ["philips", "osram", "ledvance"],
    optionName: "Puissance/Type",
    optionValues: ["5W Fixe Blanc", "7W Fixe Blanc", "10W Orientable", "7W Dimmable", "Pack 6 Spots 5W"],
    priceRange: { min: 800, max: 4500 },
    skuPrefix: "SPOT-ENC-",
    imageKeywords: ["spotlight", "recessed", "ceiling"],
    hsCode: "9405.40",
    weight: 150,
    productType: "Eclairage LED",
  },

  // Reglettes LED
  {
    namePrefix: "Reglette LED",
    nameSuffix: "Etanche",
    descriptionTemplate:
      "Reglette LED integree etanche IP65 ou non. Pour garage, atelier, cave, exterieur couvert. Installation directe, eclairage puissant et homogene.",
    categoryHandle: "reglettes-led",
    rootCategory: "electricite",
    brands: ["philips", "osram", "ledvance"],
    optionName: "Longueur/Puissance",
    optionValues: ["60cm 18W IP20", "120cm 36W IP20", "60cm 20W IP65", "120cm 40W IP65", "150cm 50W IP65"],
    priceRange: { min: 1500, max: 6500 },
    skuPrefix: "REGL-LED-",
    imageKeywords: ["batten", "led", "garage"],
    hsCode: "9405.40",
    weight: 800,
    productType: "Eclairage LED",
  },

  // Hublots LED
  {
    namePrefix: "Hublot LED",
    nameSuffix: "Rond",
    descriptionTemplate:
      "Hublot LED rond etanche IP54 ou IP65. Pour couloir, escalier, exterieur. Detecteur de mouvement optionnel. Corps polycarbonate anti-UV resistant.",
    categoryHandle: "hublots-led",
    rootCategory: "electricite",
    brands: ["philips", "osram", "ledvance"],
    optionName: "Puissance/Detecteur",
    optionValues: ["12W IP54", "18W IP54", "12W IP65", "18W avec Detecteur", "24W Exterieur"],
    priceRange: { min: 1200, max: 5500 },
    skuPrefix: "HUBLOT-",
    imageKeywords: ["bulkhead", "outdoor", "round"],
    hsCode: "9405.40",
    weight: 450,
    productType: "Eclairage LED",
  },

  // ===========================================================================
  // ELECTRICITE - LUMINAIRES EXTERIEURS (3 categories)
  // ===========================================================================

  // Luminaires Exterieurs Appliques
  {
    namePrefix: "Applique Exterieure",
    nameSuffix: "LED",
    descriptionTemplate:
      "Applique murale exterieure LED IP44 ou IP65. Design moderne, eclairage direct ou indirect. Aluminium et verre securit. Duree de vie 25 000h.",
    categoryHandle: "luminaires-exterieurs-appliques",
    rootCategory: "electricite",
    brands: ["philips", "osram"],
    optionName: "Style/Puissance",
    optionValues: ["Cube Up-Down 10W", "Cylindre 8W", "Design 12W", "Avec Detecteur 10W", "Anthracite 15W"],
    priceRange: { min: 3500, max: 15000 },
    skuPrefix: "APPL-EXT-",
    imageKeywords: ["wall", "outdoor", "modern"],
    hsCode: "9405.40",
    weight: 800,
    productType: "Eclairage Exterieur",
  },

  // Luminaires Exterieurs Bornes
  {
    namePrefix: "Borne Exterieure",
    nameSuffix: "LED",
    descriptionTemplate:
      "Borne lumineuse exterieure LED pour allee et jardin. Hauteur 30 a 80cm, IP44/IP65. Fixation au sol beton ou pelouse. Aluminium ou inox.",
    categoryHandle: "luminaires-exterieurs-bornes",
    rootCategory: "electricite",
    brands: ["philips", "osram"],
    optionName: "Hauteur/Style",
    optionValues: ["30cm Moderne", "50cm Moderne", "80cm Design", "50cm Inox", "50cm avec Detecteur"],
    priceRange: { min: 4500, max: 18000 },
    skuPrefix: "BORNE-",
    imageKeywords: ["bollard", "garden", "path"],
    hsCode: "9405.40",
    weight: 2500,
    productType: "Eclairage Exterieur",
  },

  // Luminaires Exterieurs Projecteurs
  {
    namePrefix: "Projecteur Exterieur",
    nameSuffix: "LED",
    descriptionTemplate:
      "Projecteur LED exterieur IP65 pour facade, jardin, parking. Haute puissance, dissipation thermique optimisee. Detecteur de mouvement optionnel.",
    categoryHandle: "luminaires-exterieurs-projecteurs",
    rootCategory: "electricite",
    brands: ["philips", "osram", "ledvance"],
    optionName: "Puissance",
    optionValues: ["10W Jardin", "20W Facade", "30W Parking", "50W Industriel", "30W avec Detecteur"],
    priceRange: { min: 2500, max: 12000 },
    skuPrefix: "PROJ-EXT-",
    imageKeywords: ["floodlight", "security", "outdoor"],
    hsCode: "9405.40",
    weight: 1200,
    productType: "Eclairage Exterieur",
  },

  // ===========================================================================
  // PLOMBERIE - TUBES PER (3 categories)
  // ===========================================================================

  // PER 12mm
  {
    namePrefix: "Tube PER",
    nameSuffix: "Diametre 12",
    descriptionTemplate:
      "Tube PER polyethylene reticule diametre 12mm pour eau chaude et froide. Pression 6 bars, temperature max 60C. Couronne 25, 50 ou 100m. Certification ACS.",
    categoryHandle: "per-o12",
    rootCategory: "plomberie",
    brands: ["geberit", "rehau", "comap"],
    optionName: "Conditionnement",
    optionValues: ["Couronne 25m", "Couronne 50m", "Couronne 100m", "Gaine Rouge 50m", "Gaine Bleu 50m"],
    priceRange: { min: 1500, max: 8500 },
    skuPrefix: "PER-12-",
    imageKeywords: ["pex", "pipe", "12mm"],
    hsCode: "3917.32",
    weight: 3500,
    productType: "Tuyauterie",
  },

  // PER 16mm
  {
    namePrefix: "Tube PER",
    nameSuffix: "Diametre 16",
    descriptionTemplate:
      "Tube PER polyethylene reticule diametre 16mm, section standard sanitaire. Pression 6 bars, temperature max 60C. Couronne 25 a 100m. Pre-gaine optionnel.",
    categoryHandle: "per-o16",
    rootCategory: "plomberie",
    brands: ["geberit", "rehau", "comap"],
    optionName: "Conditionnement",
    optionValues: ["Couronne 25m", "Couronne 50m", "Couronne 100m", "Gaine Rouge 50m", "Gaine Bleu 50m"],
    priceRange: { min: 2000, max: 11000 },
    skuPrefix: "PER-16-",
    imageKeywords: ["pex", "pipe", "16mm"],
    hsCode: "3917.32",
    weight: 5500,
    productType: "Tuyauterie",
  },

  // PER 20mm
  {
    namePrefix: "Tube PER",
    nameSuffix: "Diametre 20",
    descriptionTemplate:
      "Tube PER polyethylene reticule diametre 20mm pour collecteur ou gros debit. Pression 6 bars, temperature max 60C. Couronne 25 ou 50m.",
    categoryHandle: "per-o20",
    rootCategory: "plomberie",
    brands: ["geberit", "rehau", "comap"],
    optionName: "Conditionnement",
    optionValues: ["Couronne 25m", "Couronne 50m", "Couronne 100m", "Barre 4m"],
    priceRange: { min: 3500, max: 15000 },
    skuPrefix: "PER-20-",
    imageKeywords: ["pex", "pipe", "20mm"],
    hsCode: "3917.32",
    weight: 8000,
    productType: "Tuyauterie",
  },

  // ===========================================================================
  // PLOMBERIE - TUBES MULTICOUCHE (3 categories)
  // ===========================================================================

  // Multicouche 16mm
  {
    namePrefix: "Tube Multicouche",
    nameSuffix: "Diametre 16",
    descriptionTemplate:
      "Tube multicouche alu-PEX diametre 16mm. Anti-diffusion oxygene, faible dilatation. Compatible chauffage et sanitaire. Couronne ou barre.",
    categoryHandle: "multicouche-o16",
    rootCategory: "plomberie",
    brands: ["geberit", "rehau", "giacomini"],
    optionName: "Conditionnement",
    optionValues: ["Couronne 25m", "Couronne 50m", "Couronne 100m", "Barre 5m x4"],
    priceRange: { min: 3500, max: 18000 },
    skuPrefix: "MLC-16-",
    imageKeywords: ["multilayer", "pex-al", "16mm"],
    hsCode: "3917.32",
    weight: 7000,
    productType: "Tuyauterie",
  },

  // Multicouche 20mm
  {
    namePrefix: "Tube Multicouche",
    nameSuffix: "Diametre 20",
    descriptionTemplate:
      "Tube multicouche alu-PEX diametre 20mm. Stabilite dimensionnelle, faible perte de charge. Ideal collecteur et distribution. Couronne ou barre.",
    categoryHandle: "multicouche-o20",
    rootCategory: "plomberie",
    brands: ["geberit", "rehau", "giacomini"],
    optionName: "Conditionnement",
    optionValues: ["Couronne 25m", "Couronne 50m", "Couronne 100m", "Barre 5m x4"],
    priceRange: { min: 5000, max: 25000 },
    skuPrefix: "MLC-20-",
    imageKeywords: ["multilayer", "pex-al", "20mm"],
    hsCode: "3917.32",
    weight: 10000,
    productType: "Tuyauterie",
  },

  // Multicouche 26mm
  {
    namePrefix: "Tube Multicouche",
    nameSuffix: "Diametre 26",
    descriptionTemplate:
      "Tube multicouche alu-PEX diametre 26mm pour gros debits. Distribution principale chauffage ou sanitaire collectif. Barre rigide 5m.",
    categoryHandle: "multicouche-o26",
    rootCategory: "plomberie",
    brands: ["geberit", "rehau", "giacomini"],
    optionName: "Conditionnement",
    optionValues: ["Couronne 25m", "Couronne 50m", "Barre 5m x4", "Barre 5m x10"],
    priceRange: { min: 7500, max: 35000 },
    skuPrefix: "MLC-26-",
    imageKeywords: ["multilayer", "pex-al", "26mm"],
    hsCode: "3917.32",
    weight: 14000,
    productType: "Tuyauterie",
  },

  // ===========================================================================
  // PLOMBERIE - RACCORDS (3 categories)
  // ===========================================================================

  // Raccords a Sertir
  {
    namePrefix: "Raccord a Sertir",
    nameSuffix: "Multicouche",
    descriptionTemplate:
      "Raccord a sertir pour tube multicouche. Laiton dezincification resistant, joint EPDM. Sertissage avec pince TH, U ou H selon modele.",
    categoryHandle: "raccords-a-sertir",
    rootCategory: "plomberie",
    brands: ["geberit", "rehau", "giacomini", "comap"],
    optionName: "Type/Diametre",
    optionValues: ["Droit 16", "Coude 90 16", "Te 16", "Droit 20", "Coude 90 20"],
    priceRange: { min: 300, max: 1500 },
    skuPrefix: "SERT-",
    imageKeywords: ["fitting", "press", "multilayer"],
    hsCode: "7412.20",
    weight: 80,
    productType: "Raccord Plomberie",
  },

  // Raccords Laiton
  {
    namePrefix: "Raccord Laiton",
    nameSuffix: "Filete",
    descriptionTemplate:
      "Raccord laiton filete male ou femelle. Filetage gaz conforme, etancheite avec teflon ou filasse. Qualite plomberie professionnelle.",
    categoryHandle: "raccords-laiton",
    rootCategory: "plomberie",
    brands: ["geberit", "comap", "giacomini"],
    optionName: "Type/Diametre",
    optionValues: ["Mamelon 15x21", "Manchon FF 15x21", "Coude MF 15x21", "Reduction 20x27-15x21", "Te FFF 15x21"],
    priceRange: { min: 150, max: 800 },
    skuPrefix: "LAIT-",
    imageKeywords: ["brass", "fitting", "threaded"],
    hsCode: "7412.20",
    weight: 120,
    productType: "Raccord Plomberie",
  },

  // Raccords PVC
  {
    namePrefix: "Raccord PVC",
    nameSuffix: "Evacuation",
    descriptionTemplate:
      "Raccord PVC evacuation pour assemblage par collage. Coudes, tes, manchons, culottes. PVC rigide M1, conforme NF EN 1329-1.",
    categoryHandle: "raccords-pvc",
    rootCategory: "plomberie",
    brands: ["geberit", "nicoll"],
    optionName: "Type/Diametre",
    optionValues: ["Coude 87 D40", "Coude 45 D40", "Te D40", "Manchon D40", "Coude 87 D100"],
    priceRange: { min: 100, max: 600 },
    skuPrefix: "PVC-RACC-",
    imageKeywords: ["pvc", "fitting", "drainage"],
    hsCode: "3917.40",
    weight: 100,
    productType: "Raccord Plomberie",
  },

  // ===========================================================================
  // PLOMBERIE - ROBINETTERIE (1 category)
  // ===========================================================================

  // Mitigeurs Cuisine
  {
    namePrefix: "Mitigeur Cuisine",
    nameSuffix: "Evier",
    descriptionTemplate:
      "Mitigeur evier cuisine avec douchette extractible ou bec haut. Cartouche ceramique 35 ou 40mm. Finition chrome, inox ou noir mat. Fixation monotrou.",
    categoryHandle: "mitigeurs-cuisine",
    rootCategory: "plomberie",
    brands: ["grohe", "hansgrohe", "franke"],
    optionName: "Style",
    optionValues: ["Bec Haut Chrome", "Douchette Chrome", "Bec Haut Inox", "Douchette Noir Mat", "Professionnel"],
    priceRange: { min: 8000, max: 35000 },
    skuPrefix: "MIG-CUIS-",
    imageKeywords: ["faucet", "kitchen", "sink"],
    hsCode: "8481.80",
    weight: 2000,
    productType: "Robinetterie",
  },

  // ===========================================================================
  // PLOMBERIE - WC ET SANITAIRES (3 categories)
  // ===========================================================================

  // WC a Poser
  {
    namePrefix: "WC a Poser",
    nameSuffix: "Complet",
    descriptionTemplate:
      "Pack WC a poser complet avec reservoir attenant et abattant. Chasse 3/6L double commande. Sortie horizontale ou verticale. Ceramique blanche emaille.",
    categoryHandle: "wc-a-poser",
    rootCategory: "plomberie",
    brands: ["geberit", "grohe", "roca", "villeroy-boch"],
    optionName: "Sortie/Style",
    optionValues: ["Sortie Horizontale", "Sortie Verticale", "Sans Bride", "Design Carre", "Sureleve PMR"],
    priceRange: { min: 15000, max: 45000 },
    skuPrefix: "WC-POSER-",
    imageKeywords: ["toilet", "floor", "complete"],
    hsCode: "6910.10",
    weight: 28000,
    productType: "Sanitaire",
  },

  // WC Suspendus
  {
    namePrefix: "Cuvette WC Suspendue",
    nameSuffix: "Sans Bride",
    descriptionTemplate:
      "Cuvette WC suspendue sans bride pour hygiene optimale. Compatible bati-support standard. Abattant frein de chute inclus ou separe. Ceramique haute qualite.",
    categoryHandle: "wc-suspendus",
    rootCategory: "plomberie",
    brands: ["geberit", "grohe", "roca", "villeroy-boch"],
    optionName: "Style/Abattant",
    optionValues: ["Compact Blanc", "Standard Blanc", "Design Carre", "Avec Abattant", "Noir Mat"],
    priceRange: { min: 18000, max: 55000 },
    skuPrefix: "WC-SUSP-",
    imageKeywords: ["toilet", "wall-hung", "rimless"],
    hsCode: "6910.10",
    weight: 22000,
    productType: "Sanitaire",
  },

  // Mecanismes WC
  {
    namePrefix: "Mecanisme WC",
    nameSuffix: "Chasse",
    descriptionTemplate:
      "Mecanisme de chasse WC universel ou specifique. Double commande 3/6L economie d'eau. Remplacement facile sans outils. Silencieux, robuste.",
    categoryHandle: "mecanismes-wc",
    rootCategory: "plomberie",
    brands: ["geberit", "grohe", "wirquin"],
    optionName: "Type",
    optionValues: ["Universel 3/6L", "Cable Double Touche", "Poussoir Simple", "Complet avec Flotteur", "Etrier seul"],
    priceRange: { min: 1500, max: 6500 },
    skuPrefix: "MECA-WC-",
    imageKeywords: ["flush", "mechanism", "dual"],
    hsCode: "8481.80",
    weight: 600,
    productType: "Accessoire Plomberie",
  },

  // ===========================================================================
  // PLOMBERIE - ACCESSOIRES (3 categories)
  // ===========================================================================

  // Siphons
  {
    namePrefix: "Siphon",
    nameSuffix: "Lavabo",
    descriptionTemplate:
      "Siphon pour lavabo, evier ou bidet. Modele a culot demontable ou gain de place. Raccordement D32 ou D40. Materiau ABS ou laiton chrome.",
    categoryHandle: "siphons",
    rootCategory: "plomberie",
    brands: ["geberit", "wirquin", "nicoll"],
    optionName: "Type/Materiau",
    optionValues: ["Culot D32 ABS", "Gain de Place D32", "Laiton Chrome", "Double Evier", "Machine a Laver"],
    priceRange: { min: 500, max: 3500 },
    skuPrefix: "SIPH-",
    imageKeywords: ["trap", "siphon", "drain"],
    hsCode: "3922.90",
    weight: 200,
    productType: "Accessoire Plomberie",
  },

  // Flexibles
  {
    namePrefix: "Flexible",
    nameSuffix: "Alimentation",
    descriptionTemplate:
      "Flexible d'alimentation eau tresse inox ou caoutchouc. Raccords 12x17 ou 15x21. Longueur 30 a 100cm. Pression max 10 bars. ACS.",
    categoryHandle: "flexibles",
    rootCategory: "plomberie",
    brands: ["geberit", "grohe", "comap"],
    optionName: "Longueur/Type",
    optionValues: ["30cm Inox", "50cm Inox", "80cm Inox", "100cm Inox", "Paire WC"],
    priceRange: { min: 300, max: 1500 },
    skuPrefix: "FLEX-",
    imageKeywords: ["hose", "braided", "connection"],
    hsCode: "4009.42",
    weight: 150,
    productType: "Accessoire Plomberie",
  },

  // Joints Plomberie
  {
    namePrefix: "Joints Plomberie",
    nameSuffix: "Assortiment",
    descriptionTemplate:
      "Assortiment de joints plomberie fibre, caoutchouc ou PTFE. Differents diametres 12x17, 15x21, 20x27. Coffret professionnel ou sachet standard.",
    categoryHandle: "joints-plomberie",
    rootCategory: "plomberie",
    brands: ["geberit", "wurth", "comap"],
    optionName: "Type/Conditionnement",
    optionValues: ["Coffret 150 joints", "Fibre 15x21 x10", "Caoutchouc 20x27 x10", "PTFE 12x17 x50", "Kit Robinetterie"],
    priceRange: { min: 300, max: 2500 },
    skuPrefix: "JOINT-",
    imageKeywords: ["gasket", "washer", "seal"],
    hsCode: "4016.93",
    weight: 100,
    productType: "Accessoire Plomberie",
  },

  // ===========================================================================
  // OUTILLAGE - PERCEUSES (3 categories)
  // ===========================================================================

  // Perceuses 12V
  {
    namePrefix: "Perceuse-Visseuse 12V",
    nameSuffix: "Compacte",
    descriptionTemplate:
      "Perceuse-visseuse compacte 12V lithium-ion. Legere et maniable pour travaux courants. 2 vitesses, mandrin 10mm. Kit 2 batteries et chargeur.",
    categoryHandle: "perceuses-12v",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee"],
    optionName: "Configuration",
    optionValues: ["2x2.0Ah", "2x3.0Ah", "2x4.0Ah", "Machine Seule", "Coffret Accessoires"],
    priceRange: { min: 8000, max: 22000 },
    skuPrefix: "PERC-12V-",
    imageKeywords: ["drill", "12v", "compact"],
    hsCode: "8467.21",
    weight: 1100,
    productType: "Outillage Electroportatif",
  },

  // Perceuses 18V
  {
    namePrefix: "Perceuse-Visseuse 18V",
    nameSuffix: "Brushless",
    descriptionTemplate:
      "Perceuse-visseuse 18V moteur brushless haute performance. Couple eleve, mandrin metal 13mm. 2 vitesses, LED. Kit batteries ou machine seule.",
    categoryHandle: "perceuses-18v",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee"],
    optionName: "Configuration",
    optionValues: ["2x3.0Ah", "2x4.0Ah", "2x5.0Ah", "2x6.0Ah", "Machine Seule"],
    priceRange: { min: 15000, max: 45000 },
    skuPrefix: "PERC-18V-",
    imageKeywords: ["drill", "18v", "brushless"],
    hsCode: "8467.21",
    weight: 1800,
    productType: "Outillage Electroportatif",
  },

  // Perceuses a Percussion
  {
    namePrefix: "Perceuse a Percussion",
    nameSuffix: "Sans Fil",
    descriptionTemplate:
      "Perceuse-visseuse a percussion sans fil pour beton et brique. Fonction percussion debrayable. Mandrin metal 13mm. Moteur brushless.",
    categoryHandle: "perceuses-a-percussion",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee"],
    optionName: "Voltage/Configuration",
    optionValues: ["12V 2x2.0Ah", "18V 2x4.0Ah", "18V 2x5.0Ah", "18V Machine Seule", "Coffret Pro"],
    priceRange: { min: 12000, max: 48000 },
    skuPrefix: "PERC-PERC-",
    imageKeywords: ["hammer", "drill", "percussion"],
    hsCode: "8467.21",
    weight: 2200,
    productType: "Outillage Electroportatif",
  },

  // ===========================================================================
  // OUTILLAGE - PERFORATEURS (2 categories)
  // ===========================================================================

  // Perforateurs SDS-Plus
  {
    namePrefix: "Perforateur SDS-Plus",
    nameSuffix: "Burineur",
    descriptionTemplate:
      "Perforateur burineur SDS-Plus 3 modes: percussion, rotation+percussion, burinage. Mandrin SDS-Plus, capacite beton 26mm. Poignee anti-vibrations.",
    categoryHandle: "perforateurs-sds-plus",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "hilti"],
    optionName: "Puissance/Configuration",
    optionValues: ["800W Filaire", "18V 2x5.0Ah", "18V Machine Seule", "1000W Pro", "Coffret Accessoires"],
    priceRange: { min: 18000, max: 65000 },
    skuPrefix: "PERFO-SDS-",
    imageKeywords: ["rotary", "hammer", "sds-plus"],
    hsCode: "8467.21",
    weight: 3500,
    productType: "Outillage Electroportatif",
  },

  // Perforateurs SDS-Max
  {
    namePrefix: "Perforateur SDS-Max",
    nameSuffix: "Demolition",
    descriptionTemplate:
      "Perforateur lourd SDS-Max pour gros travaux demolition et percage. Energie de frappe 6-12J. Anti-vibrations AVS. Usage intensif chantier.",
    categoryHandle: "perforateurs-sds-max",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "hilti"],
    optionName: "Energie/Configuration",
    optionValues: ["6J 1100W", "8J 1500W", "10J 1700W", "12J Demolisseur", "Coffret Transport"],
    priceRange: { min: 45000, max: 150000 },
    skuPrefix: "PERFO-MAX-",
    imageKeywords: ["demolition", "hammer", "sds-max"],
    hsCode: "8467.21",
    weight: 8500,
    productType: "Outillage Electroportatif",
  },

  // ===========================================================================
  // OUTILLAGE - MEULEUSES (2 categories)
  // ===========================================================================

  // Meuleuses 125mm
  {
    namePrefix: "Meuleuse 125mm",
    nameSuffix: "Angulaire",
    descriptionTemplate:
      "Meuleuse d'angle 125mm filaire ou sans fil. Puissance adaptee travaux courants. Carter de protection reglable, interrupteur homme mort.",
    categoryHandle: "meuleuses-125mm",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "metabo"],
    optionName: "Type/Puissance",
    optionValues: ["720W Filaire", "900W Filaire", "1400W Filaire", "18V Brushless", "18V Machine Seule"],
    priceRange: { min: 5000, max: 25000 },
    skuPrefix: "MEUL-125-",
    imageKeywords: ["grinder", "angle", "125mm"],
    hsCode: "8467.29",
    weight: 2200,
    productType: "Outillage Electroportatif",
  },

  // Meuleuses 230mm
  {
    namePrefix: "Meuleuse 230mm",
    nameSuffix: "Grande",
    descriptionTemplate:
      "Meuleuse d'angle 230mm pour gros travaux de meulage et tronconnage. Moteur puissant 2000-2600W. Demarrage progressif, anti-redemarrage.",
    categoryHandle: "meuleuses-230mm",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "metabo"],
    optionName: "Puissance",
    optionValues: ["2000W Standard", "2200W Pro", "2400W Intensif", "2600W Chantier", "36V Brushless"],
    priceRange: { min: 12000, max: 45000 },
    skuPrefix: "MEUL-230-",
    imageKeywords: ["grinder", "large", "230mm"],
    hsCode: "8467.29",
    weight: 5500,
    productType: "Outillage Electroportatif",
  },

  // ===========================================================================
  // OUTILLAGE - CLES (3 categories)
  // ===========================================================================

  // Cles Plates
  {
    namePrefix: "Cle Plate",
    nameSuffix: "Double",
    descriptionTemplate:
      "Cle plate double fourches acier chrome-vanadium. Finition satinee mate anti-reflets. Ouvertures marquees laser. Individuelle ou jeu complet.",
    categoryHandle: "cles-plates",
    rootCategory: "outillage",
    brands: ["facom", "stanley", "bahco", "knipex"],
    optionName: "Taille/Configuration",
    optionValues: ["8-9mm", "10-11mm", "12-13mm", "Jeu 6 pieces", "Jeu 12 pieces"],
    priceRange: { min: 500, max: 8500 },
    skuPrefix: "CLE-PLAT-",
    imageKeywords: ["wrench", "open-end", "double"],
    hsCode: "8204.11",
    weight: 150,
    productType: "Outillage a Main",
  },

  // Cles a Molette
  {
    namePrefix: "Cle a Molette",
    nameSuffix: "Reglable",
    descriptionTemplate:
      "Cle a molette reglable acier forge chrome-vanadium. Machoires usinees precision. Echelle graduee. Poignee ergonomique. Ouverture 20 a 55mm.",
    categoryHandle: "cles-a-molette",
    rootCategory: "outillage",
    brands: ["facom", "stanley", "bahco", "knipex"],
    optionName: "Longueur/Ouverture",
    optionValues: ["150mm Ouv.20mm", "200mm Ouv.24mm", "250mm Ouv.30mm", "300mm Ouv.36mm", "375mm Ouv.55mm"],
    priceRange: { min: 1500, max: 6500 },
    skuPrefix: "CLE-MOL-",
    imageKeywords: ["wrench", "adjustable", "crescent"],
    hsCode: "8204.12",
    weight: 400,
    productType: "Outillage a Main",
  },

  // Cles Allen
  {
    namePrefix: "Cles Allen",
    nameSuffix: "Hexagonales",
    descriptionTemplate:
      "Jeu de cles Allen (BTR) hexagonales acier traite. Embouts courts ou longs, tete spherique optionnel. Support plastique ou metal. Metrique et pouce.",
    categoryHandle: "cles-allen",
    rootCategory: "outillage",
    brands: ["facom", "stanley", "bahco", "wera"],
    optionName: "Configuration",
    optionValues: ["Jeu 9 cles 1.5-10mm", "Jeu 9 cles Longues", "Jeu 9 cles Spheriques", "Jeu Pouce 9 cles", "Coffret 30 cles"],
    priceRange: { min: 800, max: 5500 },
    skuPrefix: "CLE-ALLEN-",
    imageKeywords: ["hex", "allen", "key"],
    hsCode: "8204.11",
    weight: 250,
    productType: "Outillage a Main",
  },

  // ===========================================================================
  // OUTILLAGE - TOURNEVIS (3 categories)
  // ===========================================================================

  // Tournevis Plats
  {
    namePrefix: "Tournevis Plat",
    nameSuffix: "Lame Plate",
    descriptionTemplate:
      "Tournevis lame plate acier chrome-vanadium trempe. Manche bi-matiere ergonomique. Lame gravee laser anti-glisse. Individuel ou jeu.",
    categoryHandle: "tournevis-plats",
    rootCategory: "outillage",
    brands: ["facom", "stanley", "bahco", "wera"],
    optionName: "Taille",
    optionValues: ["2.5x50mm", "4x100mm", "5.5x125mm", "6.5x150mm", "Jeu 5 pieces"],
    priceRange: { min: 400, max: 3500 },
    skuPrefix: "TV-PLAT-",
    imageKeywords: ["screwdriver", "flat", "slotted"],
    hsCode: "8205.40",
    weight: 100,
    productType: "Outillage a Main",
  },

  // Tournevis Cruciformes
  {
    namePrefix: "Tournevis Cruciforme",
    nameSuffix: "Phillips/Pozidriv",
    descriptionTemplate:
      "Tournevis cruciforme Phillips ou Pozidriv. Lame acier traite, pointe magnetisee optionnel. Manche anti-derapant. Du PH0 au PH3.",
    categoryHandle: "tournevis-cruciformes",
    rootCategory: "outillage",
    brands: ["facom", "stanley", "bahco", "wera"],
    optionName: "Type/Taille",
    optionValues: ["PH1x80mm", "PH2x100mm", "PH2x150mm", "PZ2x100mm", "Jeu 4 Phillips"],
    priceRange: { min: 400, max: 3500 },
    skuPrefix: "TV-CRUZ-",
    imageKeywords: ["screwdriver", "phillips", "pozidriv"],
    hsCode: "8205.40",
    weight: 100,
    productType: "Outillage a Main",
  },

  // Tournevis Torx
  {
    namePrefix: "Tournevis Torx",
    nameSuffix: "Etoile",
    descriptionTemplate:
      "Tournevis Torx (TX) etoile 6 branches. Acier S2 haute resistance, pointe precision. Pour visserie automobile, electronique. T6 a T40.",
    categoryHandle: "tournevis-torx",
    rootCategory: "outillage",
    brands: ["facom", "stanley", "bahco", "wera"],
    optionName: "Taille",
    optionValues: ["T10x75mm", "T15x80mm", "T20x100mm", "T25x100mm", "Jeu 8 Torx"],
    priceRange: { min: 500, max: 4500 },
    skuPrefix: "TV-TORX-",
    imageKeywords: ["screwdriver", "torx", "star"],
    hsCode: "8205.40",
    weight: 90,
    productType: "Outillage a Main",
  },

  // ===========================================================================
  // OUTILLAGE - NIVEAUX (1 category - niveaux-a-bulle already exists)
  // ===========================================================================

  // Note: niveaux-a-bulle is already covered in additionalProductTemplates

  // ===========================================================================
  // CHAUFFAGE - RADIATEURS (6 categories)
  // ===========================================================================

  // Radiateurs 1000W
  {
    namePrefix: "Radiateur Electrique 1000W",
    nameSuffix: "Inertie",
    descriptionTemplate:
      "Radiateur electrique 1000W pour piece 10-12m2. Inertie seche ou fluide, programmation digitale. NF Electricite Performance. Garantie 2 ans.",
    categoryHandle: "radiateurs-1000w",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "noirot", "acova"],
    optionName: "Type/Technologie",
    optionValues: ["Inertie Seche Ceramique", "Inertie Fluide", "Rayonnant", "Connecte WiFi", "Design Verre"],
    priceRange: { min: 25000, max: 65000 },
    skuPrefix: "RAD-1000-",
    imageKeywords: ["radiator", "1000w", "electric"],
    hsCode: "8516.29",
    weight: 14000,
    productType: "Chauffage Electrique",
  },

  // Radiateurs 1500W
  {
    namePrefix: "Radiateur Electrique 1500W",
    nameSuffix: "Inertie",
    descriptionTemplate:
      "Radiateur electrique 1500W pour piece 15-18m2. Technologie inertie, chaleur douce. Detection fenetre ouverte, programmation. NF Performance.",
    categoryHandle: "radiateurs-1500w",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "noirot", "acova"],
    optionName: "Type/Technologie",
    optionValues: ["Inertie Seche Pierre", "Inertie Fluide", "Rayonnant Digital", "Connecte WiFi", "Fonte Active"],
    priceRange: { min: 35000, max: 85000 },
    skuPrefix: "RAD-1500-",
    imageKeywords: ["radiator", "1500w", "inertia"],
    hsCode: "8516.29",
    weight: 18000,
    productType: "Chauffage Electrique",
  },

  // Radiateurs 2000W
  {
    namePrefix: "Radiateur Electrique 2000W",
    nameSuffix: "Inertie",
    descriptionTemplate:
      "Radiateur electrique 2000W pour piece 20-25m2 ou volume difficile. Inertie pierre ou fonte, regulation precise. Programmation hebdomadaire.",
    categoryHandle: "radiateurs-2000w",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "noirot", "acova"],
    optionName: "Type/Technologie",
    optionValues: ["Inertie Pierre Volcanique", "Inertie Fonte", "Double Coeur", "Connecte Netatmo", "Extra Plat"],
    priceRange: { min: 45000, max: 110000 },
    skuPrefix: "RAD-2000-",
    imageKeywords: ["radiator", "2000w", "powerful"],
    hsCode: "8516.29",
    weight: 24000,
    productType: "Chauffage Electrique",
  },

  // Radiateurs a Fluide
  {
    namePrefix: "Radiateur Fluide Caloporteur",
    nameSuffix: "Inertie",
    descriptionTemplate:
      "Radiateur electrique inertie fluide caloporteur. Chaleur douce et homogene, montee en temperature rapide. Programmation, detection presence.",
    categoryHandle: "radiateurs-a-fluide",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "delonghi", "acova"],
    optionName: "Puissance",
    optionValues: ["750W Chambre", "1000W Standard", "1250W Piece", "1500W Salon", "2000W Grand Volume"],
    priceRange: { min: 28000, max: 75000 },
    skuPrefix: "RAD-FLUID-",
    imageKeywords: ["radiator", "fluid", "oil"],
    hsCode: "8516.29",
    weight: 16000,
    productType: "Chauffage Electrique",
  },

  // Radiateurs Rayonnants (already exists but adding specific subcategory)
  // Note: radiateurs-rayonnants already covered

  // Seche-Serviettes
  {
    namePrefix: "Seche-Serviettes",
    nameSuffix: "Electrique",
    descriptionTemplate:
      "Seche-serviettes electrique pour salle de bain. Fonction boost rapide, programmation. Fluide ou electrique sec. IP24 zone 2. Garantie 2 ans.",
    categoryHandle: "seche-serviettes",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "acova", "zehnder"],
    optionName: "Puissance/Type",
    optionValues: ["500W Sans Souflerie", "750W Avec Soufflerie", "1000W Grand", "750W Design", "Mixte Eau+Elec"],
    priceRange: { min: 25000, max: 85000 },
    skuPrefix: "SECH-SERV-",
    imageKeywords: ["towel", "warmer", "bathroom"],
    hsCode: "8516.29",
    weight: 12000,
    productType: "Chauffage Electrique",
  },

  // ===========================================================================
  // CHAUFFAGE - RADIATEURS EAU CHAUDE (2 categories)
  // ===========================================================================

  // Radiateurs Acier
  {
    namePrefix: "Radiateur Acier",
    nameSuffix: "Panneau",
    descriptionTemplate:
      "Radiateur acier panneau pour chauffage central eau chaude. Type 11, 21 ou 22. Raccordement lateral ou central. Peinture epoxy blanche.",
    categoryHandle: "radiateurs-acier",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "acova", "finimetal", "rettig"],
    optionName: "Type/Dimensions",
    optionValues: ["Type 11 H600 L800", "Type 21 H600 L1000", "Type 22 H600 L1200", "Type 22 H600 L1600", "Type 33 H600 L1000"],
    priceRange: { min: 12000, max: 45000 },
    skuPrefix: "RAD-ACIER-",
    imageKeywords: ["radiator", "panel", "steel"],
    hsCode: "7322.19",
    weight: 18000,
    productType: "Chauffage Central",
  },

  // Radiateurs Fonte
  {
    namePrefix: "Radiateur Fonte",
    nameSuffix: "Elements",
    descriptionTemplate:
      "Radiateur fonte a elements assembles pour chauffage central. Haute inertie, chaleur douce. Style classique ou design. Tres longue duree de vie.",
    categoryHandle: "radiateurs-fonte",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "acova", "ideal-standard"],
    optionName: "Style/Elements",
    optionValues: ["Classique 4 Elements", "Classique 6 Elements", "Classique 8 Elements", "Design 6 Elements", "Retro Pied"],
    priceRange: { min: 35000, max: 120000 },
    skuPrefix: "RAD-FONTE-",
    imageKeywords: ["radiator", "cast-iron", "classic"],
    hsCode: "7322.11",
    weight: 45000,
    productType: "Chauffage Central",
  },

  // ===========================================================================
  // CHAUFFAGE - CHAUFFE-EAU (5 categories)
  // ===========================================================================

  // Chauffe-eau 100L
  {
    namePrefix: "Chauffe-Eau Electrique 100L",
    nameSuffix: "Blinde ou Steatite",
    descriptionTemplate:
      "Chauffe-eau electrique 100L pour 2-3 personnes. Resistance blindee ou steatite. Vertical mural, horizontal ou sur socle. Garantie cuve 5 ans.",
    categoryHandle: "chauffe-eau-100l",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "ariston", "chaffoteaux"],
    optionName: "Type/Position",
    optionValues: ["Blinde Vertical", "Steatite Vertical", "Steatite Horizontal", "Sur Socle", "ACI Hybride"],
    priceRange: { min: 25000, max: 55000 },
    skuPrefix: "CE-100L-",
    imageKeywords: ["water", "heater", "100l"],
    hsCode: "8516.10",
    weight: 32000,
    productType: "Eau Chaude Sanitaire",
  },

  // Chauffe-eau 150L
  {
    namePrefix: "Chauffe-Eau Electrique 150L",
    nameSuffix: "Blinde ou Steatite",
    descriptionTemplate:
      "Chauffe-eau electrique 150L pour 3-4 personnes. Resistance blindee ou steatite ACI. Vertical mural, horizontal ou stable. Protection anti-corrosion.",
    categoryHandle: "chauffe-eau-150l",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "ariston", "chaffoteaux"],
    optionName: "Type/Position",
    optionValues: ["Blinde Vertical", "Steatite Vertical", "Steatite Horizontal", "Stable", "Connecte"],
    priceRange: { min: 35000, max: 75000 },
    skuPrefix: "CE-150L-",
    imageKeywords: ["water", "heater", "150l"],
    hsCode: "8516.10",
    weight: 42000,
    productType: "Eau Chaude Sanitaire",
  },

  // Chauffe-eau 200L
  {
    namePrefix: "Chauffe-Eau Electrique 200L",
    nameSuffix: "Steatite",
    descriptionTemplate:
      "Chauffe-eau electrique 200L pour 4-5 personnes ou usage intensif. Steatite ACI protection durable. Vertical ou stable. Thermostat electronique.",
    categoryHandle: "chauffe-eau-200l",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "ariston", "chaffoteaux"],
    optionName: "Type/Position",
    optionValues: ["Steatite Vertical Mural", "Steatite Stable", "ACI Hybride Vertical", "Connecte Cozytouch", "Thermoplonge"],
    priceRange: { min: 45000, max: 95000 },
    skuPrefix: "CE-200L-",
    imageKeywords: ["water", "heater", "200l"],
    hsCode: "8516.10",
    weight: 55000,
    productType: "Eau Chaude Sanitaire",
  },

  // Chauffe-eau 300L
  {
    namePrefix: "Chauffe-Eau Electrique 300L",
    nameSuffix: "Stable",
    descriptionTemplate:
      "Chauffe-eau electrique 300L grande capacite pour famille ou usage collectif. Modele stable au sol. Double resistance optionnel. Garantie cuve 5 ans.",
    categoryHandle: "chauffe-eau-300l",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "ariston", "chaffoteaux"],
    optionName: "Type",
    optionValues: ["Steatite Stable", "ACI Hybride Stable", "Double Resistance", "Accelere Heure Creuse", "Solaire Combine"],
    priceRange: { min: 65000, max: 140000 },
    skuPrefix: "CE-300L-",
    imageKeywords: ["water", "heater", "300l"],
    hsCode: "8516.10",
    weight: 80000,
    productType: "Eau Chaude Sanitaire",
  },

  // Chauffe-eau Instantanes
  {
    namePrefix: "Chauffe-Eau Instantane",
    nameSuffix: "Electrique",
    descriptionTemplate:
      "Chauffe-eau instantane electrique compact. Production eau chaude a la demande, pas de stockage. Puissance 3.5 a 27kW. Ideal point d'eau isole.",
    categoryHandle: "chauffe-eau-instantanes",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "dafi", "clage"],
    optionName: "Puissance",
    optionValues: ["3.5kW Lavabo", "5.5kW Lavabo", "7.5kW Douche", "11kW Multi-points", "27kW Triphase"],
    priceRange: { min: 8000, max: 55000 },
    skuPrefix: "CE-INST-",
    imageKeywords: ["instant", "water", "heater"],
    hsCode: "8516.10",
    weight: 3500,
    productType: "Eau Chaude Sanitaire",
  },

  // ===========================================================================
  // CHAUFFAGE - CLIMATISATION (5 categories)
  // ===========================================================================

  // Climatiseurs 2.5kW
  {
    namePrefix: "Climatiseur Split 2.5kW",
    nameSuffix: "Reversible",
    descriptionTemplate:
      "Climatiseur split reversible 2.5kW (9000 BTU) pour piece 15-20m2. Inverter, classe A++. Filtration, mode nuit. Telecommande et WiFi optionnel.",
    categoryHandle: "climatiseurs-2-5kw",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "mitsubishi", "atlantic", "toshiba"],
    optionName: "Configuration",
    optionValues: ["Mono-split Standard", "Mono-split WiFi", "Mono-split Design", "Multi-split Compatible", "Avec Pose"],
    priceRange: { min: 65000, max: 150000 },
    skuPrefix: "CLIM-25-",
    imageKeywords: ["air", "conditioner", "2.5kw"],
    hsCode: "8415.10",
    weight: 35000,
    productType: "Climatisation",
  },

  // Climatiseurs 3.5kW
  {
    namePrefix: "Climatiseur Split 3.5kW",
    nameSuffix: "Reversible",
    descriptionTemplate:
      "Climatiseur split reversible 3.5kW (12000 BTU) pour piece 25-35m2. Technologie Inverter, tres silencieux. Purificateur d'air integre optionnel.",
    categoryHandle: "climatiseurs-3-5kw",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "mitsubishi", "atlantic", "toshiba"],
    optionName: "Configuration",
    optionValues: ["Mono-split Standard", "Mono-split WiFi", "Mono-split Purificateur", "Design Mural", "Console"],
    priceRange: { min: 85000, max: 180000 },
    skuPrefix: "CLIM-35-",
    imageKeywords: ["air", "conditioner", "3.5kw"],
    hsCode: "8415.10",
    weight: 40000,
    productType: "Climatisation",
  },

  // Climatiseurs 5kW
  {
    namePrefix: "Climatiseur Split 5kW",
    nameSuffix: "Reversible",
    descriptionTemplate:
      "Climatiseur split reversible 5kW (18000 BTU) pour piece 35-50m2. Puissance elevee, COP excellent. Multi-diffusion, mode turbo. Connecte WiFi.",
    categoryHandle: "climatiseurs-5kw",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "mitsubishi", "atlantic", "toshiba"],
    optionName: "Configuration",
    optionValues: ["Mono-split Mural", "Mono-split Cassette", "Console Basse", "Plafonnier", "Gainable"],
    priceRange: { min: 120000, max: 250000 },
    skuPrefix: "CLIM-50-",
    imageKeywords: ["air", "conditioner", "5kw"],
    hsCode: "8415.10",
    weight: 50000,
    productType: "Climatisation",
  },

  // Multi-splits
  {
    namePrefix: "Multi-Split",
    nameSuffix: "Groupe Exterieur",
    descriptionTemplate:
      "Unite exterieure multi-split pour 2 a 5 unites interieures. Technologie Inverter, regulation independante par zone. Classe energetique A++.",
    categoryHandle: "multi-splits",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "mitsubishi", "atlantic", "toshiba"],
    optionName: "Capacite",
    optionValues: ["Bi-split 2x2.5kW", "Tri-split 3x2.5kW", "Quadri-split 4x2.5kW", "Penta-split 5x2.5kW", "Bi-split 2x3.5kW"],
    priceRange: { min: 200000, max: 600000 },
    skuPrefix: "MULTI-",
    imageKeywords: ["multi", "split", "outdoor"],
    hsCode: "8415.10",
    weight: 65000,
    productType: "Climatisation",
  },

  // Gainables
  {
    namePrefix: "Climatiseur Gainable",
    nameSuffix: "Discret",
    descriptionTemplate:
      "Climatiseur gainable encastre faux-plafond ou combles. Distribution par gaines, grilles discretes. Ideal renovation haut de gamme et tertiaire.",
    categoryHandle: "gainables",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "mitsubishi", "atlantic"],
    optionName: "Puissance",
    optionValues: ["3.5kW Compact", "5kW Standard", "7kW Moyen", "10kW Grand", "14kW Commercial"],
    priceRange: { min: 250000, max: 600000 },
    skuPrefix: "GAIN-",
    imageKeywords: ["ducted", "concealed", "ceiling"],
    hsCode: "8415.10",
    weight: 55000,
    productType: "Climatisation",
  },

  // ===========================================================================
  // CHAUFFAGE - VMC ET VENTILATION (4 categories)
  // ===========================================================================

  // Note: vmc-simple-flux and vmc-double-flux already exist

  // Gaines Ventilation
  {
    namePrefix: "Gaine Ventilation",
    nameSuffix: "Souple ou Rigide",
    descriptionTemplate:
      "Gaine de ventilation PVC souple ou rigide pour VMC et extraction. Diametres 80 a 160mm. Isolee ou non. Conforme aux normes incendie M1.",
    categoryHandle: "gaines-ventilation",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "aldes", "unelvent"],
    optionName: "Type/Diametre",
    optionValues: ["Souple D80 6m", "Souple D125 6m", "Rigide D125 2m", "Isolee D125 6m", "PVC Raccords D125"],
    priceRange: { min: 1500, max: 8500 },
    skuPrefix: "GAINE-VMC-",
    imageKeywords: ["duct", "ventilation", "flexible"],
    hsCode: "3917.39",
    weight: 2500,
    productType: "Ventilation",
  },

  // Bouches Ventilation
  {
    namePrefix: "Bouche Ventilation",
    nameSuffix: "VMC",
    descriptionTemplate:
      "Bouche de ventilation pour VMC simple ou double flux. Hygroreglable ou autoreglable. Cuisine, salle de bain ou WC. Silencieuse, demontable.",
    categoryHandle: "bouches-ventilation",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "aldes", "unelvent"],
    optionName: "Type/Piece",
    optionValues: ["Hygro Cuisine 45/135", "Hygro SDB 15/45", "Hygro WC 15/30", "Autoreglable 125", "Insufflation"],
    priceRange: { min: 1500, max: 6500 },
    skuPrefix: "BOUCHE-",
    imageKeywords: ["vent", "grille", "extract"],
    hsCode: "8414.59",
    weight: 200,
    productType: "Ventilation",
  },

  // ===========================================================================
  // QUINCAILLERIE - CHEVILLES (3 categories)
  // ===========================================================================

  // Chevilles D6
  {
    namePrefix: "Cheville Nylon",
    nameSuffix: "Diametre 6",
    descriptionTemplate:
      "Cheville nylon universelle diametre 6mm pour charges legeres. Beton, brique, parpaing. Expansion par vis 4-5mm. Boite 50 a 200 pieces.",
    categoryHandle: "chevilles-o6",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "spit", "hilti"],
    optionName: "Conditionnement",
    optionValues: ["Boite 50", "Boite 100", "Boite 200", "Avec Vis 4x40", "Kit Assortiment"],
    priceRange: { min: 300, max: 2500 },
    skuPrefix: "CHEV-6-",
    imageKeywords: ["plug", "nylon", "6mm"],
    hsCode: "3926.90",
    weight: 200,
    productType: "Fixation",
  },

  // Chevilles D8
  {
    namePrefix: "Cheville Nylon",
    nameSuffix: "Diametre 8",
    descriptionTemplate:
      "Cheville nylon universelle diametre 8mm pour charges moyennes. Multi-materiaux avec ailettes anti-rotation. Expansion par vis 5-6mm. Boite 50 a 100.",
    categoryHandle: "chevilles-o8",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "spit", "hilti"],
    optionName: "Conditionnement",
    optionValues: ["Boite 50", "Boite 100", "Avec Vis 5x50", "Avec Vis 6x60", "Pro Boite 200"],
    priceRange: { min: 400, max: 3500 },
    skuPrefix: "CHEV-8-",
    imageKeywords: ["plug", "nylon", "8mm"],
    hsCode: "3926.90",
    weight: 350,
    productType: "Fixation",
  },

  // Chevilles D10
  {
    namePrefix: "Cheville Nylon",
    nameSuffix: "Diametre 10",
    descriptionTemplate:
      "Cheville nylon universelle diametre 10mm pour charges lourdes. Haute resistance, collerette anti-enfoncement. Vis 7-8mm. Boite 25 a 100 pieces.",
    categoryHandle: "chevilles-o10",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "spit", "hilti"],
    optionName: "Conditionnement",
    optionValues: ["Boite 25", "Boite 50", "Boite 100", "Avec Vis 8x80", "Kit Charge Lourde"],
    priceRange: { min: 500, max: 4500 },
    skuPrefix: "CHEV-10-",
    imageKeywords: ["plug", "heavy", "10mm"],
    hsCode: "3926.90",
    weight: 500,
    productType: "Fixation",
  },

  // ===========================================================================
  // QUINCAILLERIE - VISSERIE (3 categories)
  // ===========================================================================

  // Vis Bois
  {
    namePrefix: "Vis a Bois",
    nameSuffix: "Agglomere",
    descriptionTemplate:
      "Vis a bois et agglomere tete fraisee Torx ou Pozidriv. Acier zinc bichromatee ou inox A2. Filetage partiel ou total. Boite 100 a 500.",
    categoryHandle: "vis-bois",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "spax", "heco"],
    optionName: "Dimensions/Quantite",
    optionValues: ["4x40 Boite 200", "4x50 Boite 200", "5x50 Boite 100", "5x70 Boite 100", "6x80 Boite 50"],
    priceRange: { min: 500, max: 3500 },
    skuPrefix: "VIS-BOIS-",
    imageKeywords: ["screw", "wood", "torx"],
    hsCode: "7318.12",
    weight: 800,
    productType: "Visserie",
  },

  // Vis Metal
  {
    namePrefix: "Vis a Metaux",
    nameSuffix: "Tete Hexagonale",
    descriptionTemplate:
      "Vis a metaux tete hexagonale (TH) ou cylindrique. Filetage metrique M4 a M10. Acier classe 8.8 zinc ou inox A2. Boite 50 a 200.",
    categoryHandle: "vis-metal",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "spit"],
    optionName: "Dimensions/Quantite",
    optionValues: ["M5x20 TH Boite 100", "M6x30 TH Boite 50", "M8x40 TH Boite 25", "M6x30 CHC Boite 50", "Assortiment M5-M8"],
    priceRange: { min: 400, max: 3000 },
    skuPrefix: "VIS-MET-",
    imageKeywords: ["screw", "metal", "hex"],
    hsCode: "7318.15",
    weight: 600,
    productType: "Visserie",
  },

  // Vis Placo
  {
    namePrefix: "Vis Placo",
    nameSuffix: "Phosphatee",
    descriptionTemplate:
      "Vis pour plaques de platre tete trompette phosphatee noire. Pointe fine ou autoforeuse. Filetage fin. Vissage rapide sans eclatement.",
    categoryHandle: "vis-placo",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "hilti"],
    optionName: "Dimensions/Quantite",
    optionValues: ["3.5x25 Boite 500", "3.5x35 Boite 500", "3.5x45 Boite 250", "3.5x55 Boite 200", "Autoperceuse 3.5x35"],
    priceRange: { min: 600, max: 2500 },
    skuPrefix: "VIS-PLACO-",
    imageKeywords: ["screw", "drywall", "plasterboard"],
    hsCode: "7318.12",
    weight: 1200,
    productType: "Visserie",
  },

  // ===========================================================================
  // QUINCAILLERIE - SERRURERIE (5 categories)
  // ===========================================================================

  // Serrures a Encastrer
  {
    namePrefix: "Serrure a Encastrer",
    nameSuffix: "Porte Interieure",
    descriptionTemplate:
      "Serrure a encastrer (a larder) pour porte interieure. Axe 40 ou 50mm, entraxe 70 ou 90mm. Bec de cane ou cle L. Compatible tout type poignee.",
    categoryHandle: "serrures-a-encastrer",
    rootCategory: "quincaillerie",
    brands: ["vachette", "bricard", "fichet", "dom"],
    optionName: "Type/Axe",
    optionValues: ["Bec de Cane Axe 40", "Bec de Cane Axe 50", "Cle L Axe 40", "Cle L Axe 50", "Condamnation WC"],
    priceRange: { min: 1500, max: 8500 },
    skuPrefix: "SERR-ENC-",
    imageKeywords: ["lock", "mortise", "interior"],
    hsCode: "8301.40",
    weight: 400,
    productType: "Serrurerie",
  },

  // Serrures en Applique
  {
    namePrefix: "Serrure en Applique",
    nameSuffix: "Horizontale",
    descriptionTemplate:
      "Serrure en applique horizontale pour porte d'entree bois. 3 a 5 points de condamnation. Cylindre europeen, gache reversible. A2P optionnel.",
    categoryHandle: "serrures-en-applique",
    rootCategory: "quincaillerie",
    brands: ["vachette", "bricard", "fichet"],
    optionName: "Points/Securite",
    optionValues: ["3 Points Standard", "3 Points A2P*", "5 Points Standard", "5 Points A2P*", "5 Points A2P**"],
    priceRange: { min: 12000, max: 55000 },
    skuPrefix: "SERR-APPL-",
    imageKeywords: ["lock", "surface", "security"],
    hsCode: "8301.40",
    weight: 2500,
    productType: "Serrurerie",
  },

  // Serrures Multipoints
  {
    namePrefix: "Serrure Multipoints",
    nameSuffix: "Encastree",
    descriptionTemplate:
      "Serrure multipoints encastree pour porte d'entree. 3 a 7 points de fermeture. Cremone ou tringlerie. Haute securite A2P. Cylindre europeen.",
    categoryHandle: "serrures-multipoints",
    rootCategory: "quincaillerie",
    brands: ["vachette", "bricard", "fichet", "ferco"],
    optionName: "Points/Certification",
    optionValues: ["3 Points A2P*", "5 Points A2P*", "5 Points A2P**", "7 Points A2P**", "Automatique 3 Points"],
    priceRange: { min: 25000, max: 95000 },
    skuPrefix: "SERR-MULTI-",
    imageKeywords: ["lock", "multipoint", "security"],
    hsCode: "8301.40",
    weight: 3500,
    productType: "Serrurerie",
  },

  // Cylindres
  {
    namePrefix: "Cylindre Serrure",
    nameSuffix: "Europeen",
    descriptionTemplate:
      "Cylindre de serrure profil europeen. Longueur 30-30 a 40-50. Anti-crochetage, anti-percage, anti-casse. Cle reversible, carte de propriete.",
    categoryHandle: "cylindres",
    rootCategory: "quincaillerie",
    brands: ["vachette", "bricard", "fichet", "mul-t-lock"],
    optionName: "Longueur/Securite",
    optionValues: ["30-30 Standard", "30-40 Standard", "30-30 A2P*", "30-40 A2P*", "40-40 A2P**"],
    priceRange: { min: 2500, max: 25000 },
    skuPrefix: "CYL-",
    imageKeywords: ["cylinder", "lock", "euro"],
    hsCode: "8301.70",
    weight: 150,
    productType: "Serrurerie",
  },

  // Poignees de Porte
  {
    namePrefix: "Poignee de Porte",
    nameSuffix: "Sur Rosace",
    descriptionTemplate:
      "Ensemble poignees de porte sur rosace ronde ou carree. Aluminium, inox ou laiton. Carre 7mm, entraxe 165 ou 195mm. Design moderne ou classique.",
    categoryHandle: "poignees-de-porte",
    rootCategory: "quincaillerie",
    brands: ["vachette", "hoppe", "normbau"],
    optionName: "Style/Materiau",
    optionValues: ["Alu Noir Rosace Ronde", "Inox Rosace Carree", "Laiton Chrome", "Design Plaque", "Bequille Seule"],
    priceRange: { min: 2500, max: 15000 },
    skuPrefix: "POIG-PORTE-",
    imageKeywords: ["handle", "door", "lever"],
    hsCode: "8302.41",
    weight: 500,
    productType: "Serrurerie",
  },

  // ===========================================================================
  // QUINCAILLERIE - FERRURES AMEUBLEMENT (5 categories)
  // ===========================================================================

  // Charnieres
  {
    namePrefix: "Charniere",
    nameSuffix: "Porte Meuble",
    descriptionTemplate:
      "Charniere pour porte de meuble cuisine ou salle de bain. Ouverture 110 ou 165 degres. Amortisseur integre, clip rapide. Reglage 3D.",
    categoryHandle: "charnieres",
    rootCategory: "quincaillerie",
    brands: ["hettich", "blum", "grass", "salice"],
    optionName: "Type/Ouverture",
    optionValues: ["Encastree 110", "Semi-encastree 110", "Applique 110", "165 Push", "Amortie 110"],
    priceRange: { min: 200, max: 1500 },
    skuPrefix: "CHARN-",
    imageKeywords: ["hinge", "cabinet", "soft-close"],
    hsCode: "8302.10",
    weight: 80,
    productType: "Ferrure",
  },

  // Paumelles
  {
    namePrefix: "Paumelle",
    nameSuffix: "Porte Interieure",
    descriptionTemplate:
      "Paumelle pour porte interieure bois ou metal. Lames 80 a 140mm. Finition laiton, chrome ou inox. Goupille demontable. Par paire.",
    categoryHandle: "paumelles",
    rootCategory: "quincaillerie",
    brands: ["vachette", "assa-abloy", "normbau"],
    optionName: "Taille/Finition",
    optionValues: ["80mm Laiton", "100mm Laiton", "100mm Chrome", "120mm Inox", "140mm Charge Lourde"],
    priceRange: { min: 800, max: 4500 },
    skuPrefix: "PAUM-",
    imageKeywords: ["hinge", "door", "leaf"],
    hsCode: "8302.10",
    weight: 250,
    productType: "Ferrure",
  },

  // Poignees de Meuble
  {
    namePrefix: "Poignee de Meuble",
    nameSuffix: "Cuisine",
    descriptionTemplate:
      "Poignee pour meuble de cuisine ou salle de bain. Barre, bouton ou tirette. Entraxe 96 a 256mm. Finition chrome, inox, noir mat ou laiton.",
    categoryHandle: "poignees-de-meuble",
    rootCategory: "quincaillerie",
    brands: ["hettich", "hafele", "ikea"],
    optionName: "Style/Entraxe",
    optionValues: ["Barre 128mm Chrome", "Barre 160mm Noir", "Barre 256mm Inox", "Tirette 96mm", "Arc 128mm Chrome"],
    priceRange: { min: 300, max: 2500 },
    skuPrefix: "POIG-MEUB-",
    imageKeywords: ["handle", "cabinet", "pull"],
    hsCode: "8302.42",
    weight: 100,
    productType: "Ferrure",
  },

  // Boutons de Meuble
  {
    namePrefix: "Bouton de Meuble",
    nameSuffix: "Decoratif",
    descriptionTemplate:
      "Bouton decoratif pour tiroir ou porte de meuble. Rond, carre ou fantaisie. Finition chrome, laiton vieilli, ceramique. Vis incluse.",
    categoryHandle: "boutons-de-meuble",
    rootCategory: "quincaillerie",
    brands: ["hettich", "hafele"],
    optionName: "Style/Finition",
    optionValues: ["Rond Chrome D30", "Rond Noir Mat D25", "Carre Inox 25mm", "Ceramique Blanc", "Laiton Vieilli"],
    priceRange: { min: 200, max: 1500 },
    skuPrefix: "BOUT-MEUB-",
    imageKeywords: ["knob", "cabinet", "decorative"],
    hsCode: "8302.42",
    weight: 50,
    productType: "Ferrure",
  },

  // Coulisses Tiroirs
  {
    namePrefix: "Coulisse Tiroir",
    nameSuffix: "A Billes",
    descriptionTemplate:
      "Coulisse a billes pour tiroir cuisine ou bureau. Extension totale ou partielle. Charge 25 a 50kg. Amortisseur integre optionnel. Paire.",
    categoryHandle: "coulisses-tiroirs",
    rootCategory: "quincaillerie",
    brands: ["hettich", "blum", "grass"],
    optionName: "Longueur/Type",
    optionValues: ["300mm Partielle", "400mm Totale", "500mm Totale", "450mm Amortie", "550mm Charge 50kg"],
    priceRange: { min: 800, max: 5500 },
    skuPrefix: "COUL-",
    imageKeywords: ["slide", "drawer", "ball-bearing"],
    hsCode: "8302.42",
    weight: 400,
    productType: "Ferrure",
  },

  // ===========================================================================
  // QUINCAILLERIE - ETANCHEITE (3 categories)
  // ===========================================================================

  // Silicone
  {
    namePrefix: "Silicone",
    nameSuffix: "Sanitaire",
    descriptionTemplate:
      "Silicone sanitaire anti-moisissures pour joints salle de bain et cuisine. Application pistolet, temps de sechage 24h. Blanc, transparent ou gris.",
    categoryHandle: "silicone",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "sika", "rubson"],
    optionName: "Couleur/Conditionnement",
    optionValues: ["Blanc 280ml", "Transparent 280ml", "Gris 280ml", "Lot 6 Blancs", "Cartouche 600ml"],
    priceRange: { min: 400, max: 3500 },
    skuPrefix: "SILIC-",
    imageKeywords: ["silicone", "sealant", "bathroom"],
    hsCode: "3214.10",
    weight: 350,
    productType: "Etancheite",
  },

  // Mastic Acrylique
  {
    namePrefix: "Mastic Acrylique",
    nameSuffix: "Peintre",
    descriptionTemplate:
      "Mastic acrylique pour joints de finition interieurs. Rebouchage fissures, jonction mur/plafond. Peignable, nettoyage a l'eau. Blanc ou beige.",
    categoryHandle: "mastic-acrylique",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "sika", "rubson"],
    optionName: "Couleur/Conditionnement",
    optionValues: ["Blanc 280ml", "Blanc 300ml Tube", "Beige 280ml", "Lot 12 Blancs", "Seau 5kg"],
    priceRange: { min: 300, max: 4500 },
    skuPrefix: "MAST-ACRYL-",
    imageKeywords: ["acrylic", "caulk", "filler"],
    hsCode: "3214.10",
    weight: 350,
    productType: "Etancheite",
  },

  // Mousse Polyurethane
  {
    namePrefix: "Mousse Polyurethane",
    nameSuffix: "Expansive",
    descriptionTemplate:
      "Mousse polyurethane expansive mono-composant. Calfeutrement, isolation, collage. Expansion x2 a x3. Application pistolet ou manuelle.",
    categoryHandle: "mousse-polyurethane",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "sika", "soudal"],
    optionName: "Type/Conditionnement",
    optionValues: ["Manuelle 500ml", "Manuelle 750ml", "Pistolet 750ml", "Coupe-Feu", "Lot 12 Manuelles"],
    priceRange: { min: 500, max: 4500 },
    skuPrefix: "MOUSSE-PU-",
    imageKeywords: ["foam", "expanding", "insulation"],
    hsCode: "3909.50",
    weight: 600,
    productType: "Etancheite",
  },
];

/**
 * Additional product templates 3 - Missing leaf categories (74 templates)
 */
export const additionalProductTemplates3: ProductTemplate[] = [
  // ===========================================================================
  // CABLES ELECTRIQUES
  // ===========================================================================
  {
    namePrefix: "Cable H05VVF",
    nameSuffix: "Souple",
    descriptionTemplate:
      "Cable electrique souple H05VVF pour installation domestique. Isolation PVC double epaisseur. Conforme NF C 32-201. Usage interieur, pose encastree ou apparente. Conducteurs cuivre souple.",
    categoryHandle: "cables-h05vvf",
    rootCategory: "electricite",
    brands: ["nexans", "prysmian", "general-cable"],
    optionName: "Section",
    optionValues: ["2x0.75mm²", "2x1mm²", "2x1.5mm²", "3x1.5mm²", "3x2.5mm²"],
    priceRange: { min: 4500, max: 18500 },
    skuPrefix: "CBL-H05VVF-",
    imageKeywords: ["cable", "electrical", "wire"],
    hsCode: "8544.49",
    weight: 800,
    productType: "Cable Electrique",
  },
  {
    namePrefix: "Cable H07VU",
    nameSuffix: "Rigide",
    descriptionTemplate:
      "Cable electrique rigide H07VU pour installation fixe. Conducteur cuivre rigide nu classe 1. Isolation PVC. Conforme NF C 32-201. Pour tableaux electriques et installations fixes.",
    categoryHandle: "cables-h07vu",
    rootCategory: "electricite",
    brands: ["nexans", "prysmian", "general-cable"],
    optionName: "Section",
    optionValues: ["1.5mm²", "2.5mm²", "4mm²", "6mm²", "10mm²"],
    priceRange: { min: 2500, max: 22500 },
    skuPrefix: "CBL-H07VU-",
    imageKeywords: ["cable", "electrical", "wire", "rigid"],
    hsCode: "8544.49",
    weight: 600,
    productType: "Cable Electrique",
  },
  {
    namePrefix: "Cable H07RNF",
    nameSuffix: "3G Caoutchouc",
    descriptionTemplate:
      "Cable souple H07RNF isolation caoutchouc. 3 conducteurs (3G). Haute resistance mecanique et thermique. Usage intensif chantier et industrie. Conforme NF C 32-201.",
    categoryHandle: "h07rnf-3g",
    rootCategory: "electricite",
    brands: ["nexans", "prysmian", "general-cable"],
    optionName: "Section",
    optionValues: ["3G1.5mm²", "3G2.5mm²", "3G4mm²", "3G6mm²"],
    priceRange: { min: 8500, max: 28500 },
    skuPrefix: "CBL-H07RNF-3G-",
    imageKeywords: ["cable", "rubber", "heavy-duty"],
    hsCode: "8544.49",
    weight: 1200,
    productType: "Cable Electrique",
  },
  {
    namePrefix: "Cable H07RNF",
    nameSuffix: "4G/5G Caoutchouc",
    descriptionTemplate:
      "Cable souple H07RNF isolation caoutchouc. 4 ou 5 conducteurs (4G/5G). Haute resistance mecanique. Pour alimentations triphase et installations industrielles. Conforme NF C 32-201.",
    categoryHandle: "h07rnf-4g5g",
    rootCategory: "electricite",
    brands: ["nexans", "prysmian", "general-cable"],
    optionName: "Section",
    optionValues: ["4G1.5mm²", "4G2.5mm²", "5G1.5mm²", "5G2.5mm²", "5G6mm²"],
    priceRange: { min: 12500, max: 45500 },
    skuPrefix: "CBL-H07RNF-4G5G-",
    imageKeywords: ["cable", "rubber", "multi-conductor"],
    hsCode: "8544.49",
    weight: 1800,
    productType: "Cable Electrique",
  },
  {
    namePrefix: "Cable U1000R2V",
    nameSuffix: "3G Rigide",
    descriptionTemplate:
      "Cable electrique rigide U1000R2V pour installations enterrees. 3 conducteurs aluminium ou cuivre. Isolation PRC. Tension 1000V. Conforme NF C 33-226. Usage exterieur et enterré.",
    categoryHandle: "u1000r2v-3g",
    rootCategory: "electricite",
    brands: ["nexans", "prysmian", "general-cable"],
    optionName: "Section",
    optionValues: ["3G1.5mm²", "3G2.5mm²", "3G4mm²", "3G6mm²"],
    priceRange: { min: 9500, max: 32500 },
    skuPrefix: "CBL-U1000-3G-",
    imageKeywords: ["cable", "underground", "armored"],
    hsCode: "8544.49",
    weight: 1500,
    productType: "Cable Electrique",
  },
  {
    namePrefix: "Cable U1000R2V",
    nameSuffix: "5G Rigide",
    descriptionTemplate:
      "Cable electrique rigide U1000R2V pour installations enterrees. 5 conducteurs pour triphase + neutre + terre. Isolation PRC. Tension 1000V. Conforme NF C 33-226.",
    categoryHandle: "u1000r2v-5g",
    rootCategory: "electricite",
    brands: ["nexans", "prysmian", "general-cable"],
    optionName: "Section",
    optionValues: ["5G1.5mm²", "5G2.5mm²", "5G4mm²", "5G6mm²"],
    priceRange: { min: 15500, max: 52500 },
    skuPrefix: "CBL-U1000-5G-",
    imageKeywords: ["cable", "underground", "five-core"],
    hsCode: "8544.49",
    weight: 2200,
    productType: "Cable Electrique",
  },

  // ===========================================================================
  // APPAREILLAGE ELECTRIQUE
  // ===========================================================================
  {
    namePrefix: "Differentiel 30mA",
    nameSuffix: "Type AC",
    descriptionTemplate:
      "Interrupteur differentiel 30mA Type AC pour protection contre contacts indirects. Conforme NF C 15-100. Declenchement instantane. Montage tableau modulaire. Sensibilite 30mA.",
    categoryHandle: "diff-30ma-ac",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager", "abb"],
    optionName: "Intensite",
    optionValues: ["25A 2P", "40A 2P", "63A 2P", "40A 4P", "63A 4P"],
    priceRange: { min: 2500, max: 8500 },
    skuPrefix: "DIFF-AC-",
    imageKeywords: ["circuit-breaker", "differential", "safety"],
    hsCode: "8536.20",
    weight: 250,
    productType: "Protection Differentielle",
  },
  {
    namePrefix: "Differentiel 30mA",
    nameSuffix: "Type A",
    descriptionTemplate:
      "Interrupteur differentiel 30mA Type A pour protection circuits specialises (plaques induction, lave-linge). Conforme NF C 15-100. Detection courants alternatifs et continus pulsés.",
    categoryHandle: "diff-30ma-a",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager", "abb"],
    optionName: "Intensite",
    optionValues: ["25A 2P", "40A 2P", "63A 2P", "40A 4P", "63A 4P"],
    priceRange: { min: 3500, max: 12500 },
    skuPrefix: "DIFF-A-",
    imageKeywords: ["circuit-breaker", "differential", "type-a"],
    hsCode: "8536.20",
    weight: 250,
    productType: "Protection Differentielle",
  },
  {
    namePrefix: "Disjoncteur Modulaire",
    nameSuffix: "10A-20A Courbe C",
    descriptionTemplate:
      "Disjoncteur divisionnaire modulaire courbe C pour protection circuits eclairage et prises. Conforme NF C 15-100. Pouvoir de coupure 4.5kA. Montage rail DIN. Calibres 10A à 20A.",
    categoryHandle: "disj-10a-20a",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager", "abb"],
    optionName: "Calibre",
    optionValues: ["10A 1P+N", "16A 1P+N", "20A 1P+N", "16A 3P+N", "20A 3P+N"],
    priceRange: { min: 850, max: 4500 },
    skuPrefix: "DISJ-C-",
    imageKeywords: ["circuit-breaker", "modular", "protection"],
    hsCode: "8536.20",
    weight: 150,
    productType: "Disjoncteur",
  },
  {
    namePrefix: "Disjoncteur Modulaire",
    nameSuffix: "25A-40A Courbe C",
    descriptionTemplate:
      "Disjoncteur divisionnaire modulaire courbe C pour protection circuits four, plaques, chauffe-eau. Conforme NF C 15-100. Pouvoir de coupure 6kA. Calibres 25A à 40A.",
    categoryHandle: "disj-25a-40a",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager", "abb"],
    optionName: "Calibre",
    optionValues: ["25A 1P+N", "32A 1P+N", "40A 1P+N", "32A 3P+N", "40A 3P+N"],
    priceRange: { min: 1250, max: 6500 },
    skuPrefix: "DISJ-C-FORT-",
    imageKeywords: ["circuit-breaker", "high-current"],
    hsCode: "8536.20",
    weight: 200,
    productType: "Disjoncteur",
  },
  {
    namePrefix: "Disjoncteur Courbe D",
    nameSuffix: "Moteurs",
    descriptionTemplate:
      "Disjoncteur divisionnaire modulaire courbe D pour protection circuits moteurs et transformateurs. Declenchement magnetique retarde. Supporte pointes de courant au demarrage. Conforme NF C 15-100.",
    categoryHandle: "disj-courbe-d",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager", "abb"],
    optionName: "Calibre",
    optionValues: ["10A", "16A", "20A", "25A", "32A"],
    priceRange: { min: 1850, max: 7500 },
    skuPrefix: "DISJ-D-",
    imageKeywords: ["circuit-breaker", "motor", "curve-d"],
    hsCode: "8536.20",
    weight: 180,
    productType: "Disjoncteur",
  },
  {
    namePrefix: "Interrupteur",
    nameSuffix: "Simple Allumage",
    descriptionTemplate:
      "Interrupteur simple allumage encastre. Mecanisme 10A 250V. Finition blanche ou ivoire. Griffes et vis. Conforme NF C 61-314. Pour commande eclairage simple.",
    categoryHandle: "inter-simple",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Finition",
    optionValues: ["Blanc", "Ivoire", "Complet Blanc", "Complet Ivoire", "Lot 10"],
    priceRange: { min: 150, max: 1500 },
    skuPrefix: "INT-SA-",
    imageKeywords: ["switch", "light-switch", "white"],
    hsCode: "8536.50",
    weight: 80,
    productType: "Interrupteur",
  },
  {
    namePrefix: "Interrupteur",
    nameSuffix: "Va-et-Vient",
    descriptionTemplate:
      "Interrupteur va-et-vient encastre. Mecanisme 10A 250V. Commande eclairage depuis 2 points. Finition blanche ou ivoire. Conforme NF C 61-314. Bornes automatiques.",
    categoryHandle: "inter-va-vient",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Finition",
    optionValues: ["Blanc", "Ivoire", "Complet Blanc", "Complet Ivoire", "Lot 10"],
    priceRange: { min: 180, max: 1800 },
    skuPrefix: "INT-VV-",
    imageKeywords: ["switch", "two-way", "white"],
    hsCode: "8536.50",
    weight: 85,
    productType: "Interrupteur",
  },
  {
    namePrefix: "Prise 2P+T",
    nameSuffix: "16A Encastree",
    descriptionTemplate:
      "Prise de courant 2P+T 16A encastree. Alvéoles eclipses obturateurs. Bornes automatiques. Finition blanche. Conforme NF C 61-314. Protection enfants integree.",
    categoryHandle: "prises-2pt-16a",
    rootCategory: "electricite",
    brands: ["schneider-electric", "legrand", "hager"],
    optionName: "Type",
    optionValues: ["Simple Blanc", "Simple Ivoire", "Double Blanc", "Double Ivoire", "Lot 10 Simples"],
    priceRange: { min: 180, max: 2200 },
    skuPrefix: "PRISE-16A-",
    imageKeywords: ["outlet", "socket", "power"],
    hsCode: "8536.69",
    weight: 90,
    productType: "Prise Electrique",
  },

  // ===========================================================================
  // CHAUFFAGE ELECTRIQUE
  // ===========================================================================
  {
    namePrefix: "Radiateur Inertie Seche",
    nameSuffix: "1000W",
    descriptionTemplate:
      "Radiateur electrique a inertie seche 1000W. Coeur de chauffe ceramique ou fonte. Programmation hebdomadaire. Detection presence et fenetre ouverte. Classe II. Garantie 2 ans.",
    categoryHandle: "inertie-seche-1000w",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "airelec", "applimo"],
    optionName: "Technologie",
    optionValues: ["Ceramique", "Fonte Alu", "Pierre Refractaire", "Steatite", "Fonte Active"],
    priceRange: { min: 15500, max: 45500 },
    skuPrefix: "RAD-IS-1000-",
    imageKeywords: ["radiator", "electric", "heating"],
    hsCode: "8516.29",
    weight: 12000,
    productType: "Radiateur Electrique",
  },
  {
    namePrefix: "Radiateur Inertie Seche",
    nameSuffix: "1500W",
    descriptionTemplate:
      "Radiateur electrique a inertie seche 1500W. Coeur de chauffe ceramique ou fonte. Programmation intelligente. Detection automatique. Montage mural. Classe II. Garantie 2 ans.",
    categoryHandle: "inertie-seche-1500w",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "airelec", "applimo"],
    optionName: "Technologie",
    optionValues: ["Ceramique", "Fonte Alu", "Pierre Refractaire", "Steatite", "Fonte Active"],
    priceRange: { min: 18500, max: 55500 },
    skuPrefix: "RAD-IS-1500-",
    imageKeywords: ["radiator", "electric", "1500w"],
    hsCode: "8516.29",
    weight: 15000,
    productType: "Radiateur Electrique",
  },
  {
    namePrefix: "Radiateur Inertie Seche",
    nameSuffix: "2000W",
    descriptionTemplate:
      "Radiateur electrique a inertie seche 2000W. Coeur de chauffe haute performance. Programmation hebdomadaire. Detection presence. Pour grandes pieces 20-30m². Classe II. Garantie 2 ans.",
    categoryHandle: "inertie-seche-2000w",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "airelec", "applimo"],
    optionName: "Technologie",
    optionValues: ["Ceramique", "Fonte Alu", "Pierre Refractaire", "Steatite", "Fonte Active"],
    priceRange: { min: 22500, max: 65500 },
    skuPrefix: "RAD-IS-2000-",
    imageKeywords: ["radiator", "electric", "2000w"],
    hsCode: "8516.29",
    weight: 18000,
    productType: "Radiateur Electrique",
  },
  {
    namePrefix: "Radiateur Inertie Fluide",
    nameSuffix: "Caloporteur",
    descriptionTemplate:
      "Radiateur electrique a inertie fluide caloporteur. Diffusion douce et homogene. Programmation digitale. Fluide mineral haute performance. Montage mural. Classe II. Garantie 2 ans.",
    categoryHandle: "inertie-fluide",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "delonghi", "acova"],
    optionName: "Puissance",
    optionValues: ["1000W", "1500W", "2000W", "2500W"],
    priceRange: { min: 16500, max: 58500 },
    skuPrefix: "RAD-IF-",
    imageKeywords: ["radiator", "fluid", "oil-filled"],
    hsCode: "8516.29",
    weight: 14000,
    productType: "Radiateur Electrique",
  },

  // ===========================================================================
  // CHAUFFAGE CENTRAL & ECS
  // ===========================================================================
  {
    namePrefix: "Chaudiere Gaz Condensation",
    nameSuffix: "24kW",
    descriptionTemplate:
      "Chaudiere gaz condensation murale 24kW. Rendement >95%. Production chauffage + ECS. Modulation 20-100%. Garantie 2 ans pieces. Conforme ErP. Label A+ chauffage.",
    categoryHandle: "chaudieres-24kw",
    rootCategory: "chauffage-climatisation",
    brands: ["saunier-duval", "elm-leblanc", "vaillant", "de-dietrich"],
    optionName: "Type",
    optionValues: ["Chauffage seul", "Mixte instantane", "Mixte microaccumulation", "Ventouse", "Cheminee"],
    priceRange: { min: 125000, max: 185000 },
    skuPrefix: "CHAUD-24-",
    imageKeywords: ["boiler", "gas", "condensing"],
    hsCode: "8403.10",
    weight: 35000,
    productType: "Chaudiere",
  },
  {
    namePrefix: "Chaudiere Gaz Condensation",
    nameSuffix: "28-35kW",
    descriptionTemplate:
      "Chaudiere gaz condensation murale haute puissance 28-35kW. Rendement >95%. Pour grandes surfaces >150m². Production ECS performante. Modulation elevee. Conforme ErP. Garantie 2 ans.",
    categoryHandle: "chaudieres-28-35kw",
    rootCategory: "chauffage-climatisation",
    brands: ["saunier-duval", "elm-leblanc", "vaillant", "de-dietrich"],
    optionName: "Puissance",
    optionValues: ["28kW Mixte", "30kW Mixte", "35kW Mixte", "28kW Chauffage seul", "35kW Chauffage seul"],
    priceRange: { min: 155000, max: 245000 },
    skuPrefix: "CHAUD-HP-",
    imageKeywords: ["boiler", "gas", "high-power"],
    hsCode: "8403.10",
    weight: 42000,
    productType: "Chaudiere",
  },
  {
    namePrefix: "Chauffe-Eau Electrique",
    nameSuffix: "100L Vertical",
    descriptionTemplate:
      "Chauffe-eau electrique 100L vertical mural. Resistance steatite. Cuve emaillee. Anode ACI. Protection anti-corrosion. Pour 1-2 personnes. Thermostat reglable. Garantie cuve 5 ans.",
    categoryHandle: "ce-100l",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "ariston", "chaffoteaux"],
    optionName: "Modele",
    optionValues: ["Standard", "Steatite", "ACI+", "Connecte", "Compact"],
    priceRange: { min: 18500, max: 35500 },
    skuPrefix: "CE-100L-",
    imageKeywords: ["water-heater", "electric", "100l"],
    hsCode: "8516.10",
    weight: 25000,
    productType: "Chauffe-Eau",
  },
  {
    namePrefix: "Chauffe-Eau Electrique",
    nameSuffix: "150L Vertical",
    descriptionTemplate:
      "Chauffe-eau electrique 150L vertical mural ou sur socle. Resistance steatite. Cuve emaillee haute qualite. Anode ACI hybride. Pour 2-3 personnes. Thermostat reglable. Garantie cuve 5 ans.",
    categoryHandle: "ce-150l",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "ariston", "chaffoteaux"],
    optionName: "Modele",
    optionValues: ["Standard Mural", "Steatite Mural", "ACI+ Mural", "Sur Socle", "Connecte"],
    priceRange: { min: 24500, max: 48500 },
    skuPrefix: "CE-150L-",
    imageKeywords: ["water-heater", "electric", "150l"],
    hsCode: "8516.10",
    weight: 35000,
    productType: "Chauffe-Eau",
  },
  {
    namePrefix: "Chauffe-Eau Electrique",
    nameSuffix: "200L Vertical",
    descriptionTemplate:
      "Chauffe-eau electrique 200L vertical sur socle. Resistance steatite. Cuve emaillee premium. Anode ACI hybride. Pour 3-4 personnes. Isolation renforcee. Thermostat reglable. Garantie cuve 5 ans.",
    categoryHandle: "ce-200l",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "ariston", "chaffoteaux"],
    optionName: "Modele",
    optionValues: ["Standard Socle", "Steatite Socle", "ACI+ Socle", "Connecte", "Stable"],
    priceRange: { min: 32500, max: 65500 },
    skuPrefix: "CE-200L-",
    imageKeywords: ["water-heater", "electric", "200l"],
    hsCode: "8516.10",
    weight: 48000,
    productType: "Chauffe-Eau",
  },
  {
    namePrefix: "Chauffe-Eau Electrique",
    nameSuffix: "300L Vertical",
    descriptionTemplate:
      "Chauffe-eau electrique 300L vertical sur socle. Resistance steatite. Cuve emaillee tres haute qualite. Anode ACI hybride. Pour 4-6 personnes. Isolation haute performance. Garantie cuve 7 ans.",
    categoryHandle: "ce-300l",
    rootCategory: "chauffage-climatisation",
    brands: ["atlantic", "thermor", "ariston", "de-dietrich"],
    optionName: "Modele",
    optionValues: ["Standard Socle", "Steatite Premium", "ACI+ Premium", "Connecte Smart", "Stable Renforce"],
    priceRange: { min: 45500, max: 95500 },
    skuPrefix: "CE-300L-",
    imageKeywords: ["water-heater", "electric", "300l"],
    hsCode: "8516.10",
    weight: 68000,
    productType: "Chauffe-Eau",
  },
  {
    namePrefix: "Tete Thermostatique",
    nameSuffix: "Radiateur",
    descriptionTemplate:
      "Tete thermostatique pour vanne radiateur. Regulation automatique temperature. Bulbe a liquide ou cire. Graduation 1-5. Economies energie 20-30%. Compatible vannes RA, RAV, RAVL. Garantie 5 ans.",
    categoryHandle: "tetes-thermostatiques",
    rootCategory: "chauffage-climatisation",
    brands: ["danfoss", "honeywell", "oventrop", "comap"],
    optionName: "Type",
    optionValues: ["Standard M30", "Connectee", "Programmable", "Design", "Lot 5"],
    priceRange: { min: 1250, max: 6500 },
    skuPrefix: "TT-RAD-",
    imageKeywords: ["thermostat", "radiator", "valve"],
    hsCode: "9032.10",
    weight: 150,
    productType: "Robinetterie Chauffage",
  },

  // ===========================================================================
  // CLIMATISATION
  // ===========================================================================
  {
    namePrefix: "Climatiseur Split",
    nameSuffix: "2.5kW Inverter",
    descriptionTemplate:
      "Climatiseur split inverter 2.5kW reversible chaud/froid. Technologie inverter economie energie. Gaz R32 ecologique. Silencieux <20dB(A). Pour 15-25m². Telecommande. Classe A++. Garantie 2 ans.",
    categoryHandle: "splits-2-5kw",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "mitsubishi", "toshiba", "panasonic"],
    optionName: "Technologie",
    optionValues: ["Inverter Standard", "Inverter Silence", "Inverter WiFi", "Multi-Split", "Console"],
    priceRange: { min: 45500, max: 95500 },
    skuPrefix: "CLIM-25-",
    imageKeywords: ["air-conditioner", "split", "inverter"],
    hsCode: "8415.10",
    weight: 28000,
    productType: "Climatisation",
  },
  {
    namePrefix: "Climatiseur Split",
    nameSuffix: "3.5kW Inverter",
    descriptionTemplate:
      "Climatiseur split inverter 3.5kW reversible chaud/froid. Technologie inverter haute performance. Gaz R32. Silencieux. Pour 25-35m². Filtre purification air. WiFi optionnel. Classe A+++. Garantie 3 ans.",
    categoryHandle: "splits-3-5kw",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "mitsubishi", "toshiba", "panasonic"],
    optionName: "Technologie",
    optionValues: ["Inverter Standard", "Inverter Premium", "Inverter WiFi", "Multi-Split", "Gainable"],
    priceRange: { min: 65500, max: 135500 },
    skuPrefix: "CLIM-35-",
    imageKeywords: ["air-conditioner", "split", "3.5kw"],
    hsCode: "8415.10",
    weight: 35000,
    productType: "Climatisation",
  },
  {
    namePrefix: "Climatiseur Split",
    nameSuffix: "5kW+ Inverter",
    descriptionTemplate:
      "Climatiseur split inverter 5kW et plus reversible chaud/froid. Haute puissance pour grandes pieces 35-50m². Technologie inverter premium. Gaz R32. Multi-filtration. WiFi integre. Classe A+++. Garantie 3 ans.",
    categoryHandle: "splits-5kw",
    rootCategory: "chauffage-climatisation",
    brands: ["daikin", "mitsubishi", "toshiba", "lg"],
    optionName: "Puissance",
    optionValues: ["5kW Standard", "5kW Premium", "6kW", "7kW", "Multi 2 zones"],
    priceRange: { min: 95500, max: 185500 },
    skuPrefix: "CLIM-5KW-",
    imageKeywords: ["air-conditioner", "high-power", "premium"],
    hsCode: "8415.10",
    weight: 45000,
    productType: "Climatisation",
  },

  // ===========================================================================
  // PLOMBERIE - TUBES ET RACCORDS
  // ===========================================================================
  {
    namePrefix: "Tube PER Gaine",
    nameSuffix: "Ø12 Rouge/Bleu",
    descriptionTemplate:
      "Tube PER gaine Ø12mm avec gaine de protection PEHD. Rouge ou bleu selon usage. Barre 50m ou 100m. Conforme NF. Pour distribution eau sanitaire. Resistance UV et chocs.",
    categoryHandle: "per-gaine-12",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "watts", "rehau"],
    optionName: "Conditionnement",
    optionValues: ["50m Rouge", "50m Bleu", "100m Rouge", "100m Bleu", "Couronne 25m"],
    priceRange: { min: 4500, max: 18500 },
    skuPrefix: "PER-G12-",
    imageKeywords: ["pipe", "per", "plumbing"],
    hsCode: "3917.21",
    weight: 800,
    productType: "Tube PER",
  },
  {
    namePrefix: "Tube PER Gaine",
    nameSuffix: "Ø16 Rouge/Bleu",
    descriptionTemplate:
      "Tube PER gaine Ø16mm avec gaine de protection PEHD. Rouge ou bleu selon usage. Barre 50m ou 100m. Conforme NF. Distribution principale eau sanitaire. Resistance UV et chocs.",
    categoryHandle: "per-gaine-16",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "watts", "rehau"],
    optionName: "Conditionnement",
    optionValues: ["50m Rouge", "50m Bleu", "100m Rouge", "100m Bleu", "Couronne 25m"],
    priceRange: { min: 6500, max: 25500 },
    skuPrefix: "PER-G16-",
    imageKeywords: ["pipe", "per", "16mm"],
    hsCode: "3917.21",
    weight: 1200,
    productType: "Tube PER",
  },
  {
    namePrefix: "Tube PER Gaine",
    nameSuffix: "Ø20 Rouge/Bleu",
    descriptionTemplate:
      "Tube PER gaine Ø20mm avec gaine de protection PEHD. Rouge ou bleu selon usage. Barre 50m ou 100m. Conforme NF. Pour nourrice et distribution principale. Resistance UV et chocs.",
    categoryHandle: "per-gaine-20",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "watts", "rehau"],
    optionName: "Conditionnement",
    optionValues: ["50m Rouge", "50m Bleu", "100m Rouge", "100m Bleu", "Couronne 25m"],
    priceRange: { min: 8500, max: 35500 },
    skuPrefix: "PER-G20-",
    imageKeywords: ["pipe", "per", "20mm"],
    hsCode: "3917.21",
    weight: 1800,
    productType: "Tube PER",
  },
  {
    namePrefix: "Tube PER Nu",
    nameSuffix: "Sans Gaine",
    descriptionTemplate:
      "Tube PER nu sans gaine de protection. Diametre 12, 16 ou 20mm. Rouge ou bleu. Couronne 25-50-100m. Conforme NF. Pour installation encastree sous dalle ou gaine technique. Economique.",
    categoryHandle: "per-nu",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "watts", "rehau"],
    optionName: "Diametre/Longueur",
    optionValues: ["Ø12 50m", "Ø16 50m", "Ø20 50m", "Ø12 100m", "Ø16 100m"],
    priceRange: { min: 3500, max: 22500 },
    skuPrefix: "PER-NU-",
    imageKeywords: ["pipe", "per", "bare"],
    hsCode: "3917.21",
    weight: 600,
    productType: "Tube PER",
  },
  {
    namePrefix: "Tube Multicouche",
    nameSuffix: "Ø16 Barre",
    descriptionTemplate:
      "Tube multicouche Ø16mm. Structure PEX-AL-PEX. Barre droite 2-4m ou couronne. Conforme NF. Distribution eau sanitaire chaude et froide. Cintrable manuellement. Resistant corrosion.",
    categoryHandle: "multicouche-16",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "henco", "geberit"],
    optionName: "Conditionnement",
    optionValues: ["Barre 2m", "Barre 4m", "Couronne 50m", "Couronne 100m", "Lot 10 barres"],
    priceRange: { min: 550, max: 28500 },
    skuPrefix: "MLT-16-",
    imageKeywords: ["multilayer", "pipe", "pex-al-pex"],
    hsCode: "3917.23",
    weight: 400,
    productType: "Tube Multicouche",
  },
  {
    namePrefix: "Tube Multicouche",
    nameSuffix: "Ø20 Barre",
    descriptionTemplate:
      "Tube multicouche Ø20mm. Structure PEX-AL-PEX. Barre droite 2-4m ou couronne. Conforme NF. Distribution principale eau sanitaire. Cintrable manuellement. Resistant corrosion et entartrage.",
    categoryHandle: "multicouche-20",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "henco", "geberit"],
    optionName: "Conditionnement",
    optionValues: ["Barre 2m", "Barre 4m", "Couronne 50m", "Couronne 100m", "Lot 10 barres"],
    priceRange: { min: 750, max: 42500 },
    skuPrefix: "MLT-20-",
    imageKeywords: ["multilayer", "pipe", "20mm"],
    hsCode: "3917.23",
    weight: 600,
    productType: "Tube Multicouche",
  },
  {
    namePrefix: "Tube Multicouche",
    nameSuffix: "Ø26 Barre",
    descriptionTemplate:
      "Tube multicouche Ø26mm. Structure PEX-AL-PEX. Barre droite 4m ou couronne. Conforme NF. Nourrice et alimentation principale. Cintrable avec cintreuse. Resistant corrosion. Haute duree de vie.",
    categoryHandle: "multicouche-26",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "henco", "geberit"],
    optionName: "Conditionnement",
    optionValues: ["Barre 4m", "Couronne 25m", "Couronne 50m", "Lot 5 barres", "Lot 10 barres"],
    priceRange: { min: 1250, max: 58500 },
    skuPrefix: "MLT-26-",
    imageKeywords: ["multilayer", "pipe", "26mm"],
    hsCode: "3917.23",
    weight: 900,
    productType: "Tube Multicouche",
  },
  {
    namePrefix: "Raccord Sertir",
    nameSuffix: "Ø16 Multicouche",
    descriptionTemplate:
      "Raccord a sertir pour tube multicouche Ø16mm. Laiton nickelé. Coudes, tés, manchons, reductions. Etancheite garantie. Outil de sertissage requis. Conforme NF. Installation rapide et propre.",
    categoryHandle: "sertir-16",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "henco", "geberit"],
    optionName: "Type",
    optionValues: ["Coude 90°", "Té egal", "Manchon", "Reduction 20-16", "Kit assortiment"],
    priceRange: { min: 250, max: 1850 },
    skuPrefix: "SERT-16-",
    imageKeywords: ["fitting", "press", "brass"],
    hsCode: "7412.20",
    weight: 80,
    productType: "Raccord Sertir",
  },
  {
    namePrefix: "Raccord Sertir",
    nameSuffix: "Ø20 Multicouche",
    descriptionTemplate:
      "Raccord a sertir pour tube multicouche Ø20mm. Laiton nickelé. Coudes, tés, manchons, reductions. Etancheite garantie. Outil de sertissage requis. Conforme NF. Installation rapide et propre.",
    categoryHandle: "sertir-20",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "henco", "geberit"],
    optionName: "Type",
    optionValues: ["Coude 90°", "Té egal", "Manchon", "Reduction 26-20", "Kit assortiment"],
    priceRange: { min: 350, max: 2450 },
    skuPrefix: "SERT-20-",
    imageKeywords: ["fitting", "press", "20mm"],
    hsCode: "7412.20",
    weight: 120,
    productType: "Raccord Sertir",
  },
  {
    namePrefix: "Raccord Sertir",
    nameSuffix: "Ø26 Multicouche",
    descriptionTemplate:
      "Raccord a sertir pour tube multicouche Ø26mm. Laiton nickelé. Coudes, tés, manchons, reductions. Etancheite garantie. Outil de sertissage requis. Conforme NF. Pour nourrice et distribution principale.",
    categoryHandle: "sertir-26",
    rootCategory: "plomberie",
    brands: ["comap", "nicoll", "henco", "geberit"],
    optionName: "Type",
    optionValues: ["Coude 90°", "Té egal", "Manchon", "Reduction 32-26", "Kit assortiment"],
    priceRange: { min: 550, max: 3450 },
    skuPrefix: "SERT-26-",
    imageKeywords: ["fitting", "press", "26mm"],
    hsCode: "7412.20",
    weight: 180,
    productType: "Raccord Sertir",
  },

  // ===========================================================================
  // ROBINETTERIE
  // ===========================================================================
  {
    namePrefix: "Mitigeur Lavabo",
    nameSuffix: "Chromé",
    descriptionTemplate:
      "Mitigeur lavabo chrome. Cartouche ceramique 35mm. Limiteur debit et temperature. Mousseur anticalcaire. Flexibles renforces inclus. Garantie 5 ans. Conforme NF. Economie eau 30%.",
    categoryHandle: "mitigeurs-lavabo",
    rootCategory: "plomberie",
    brands: ["grohe", "hansgrohe", "geberit", "jacob-delafon"],
    optionName: "Modele",
    optionValues: ["Standard", "Bec Haut", "Cascade", "Avec Tirette", "Premium"],
    priceRange: { min: 3500, max: 28500 },
    skuPrefix: "MIT-LAV-",
    imageKeywords: ["faucet", "mixer", "bathroom"],
    hsCode: "8481.80",
    weight: 800,
    productType: "Robinetterie",
  },
  {
    namePrefix: "Mitigeur Cuisine",
    nameSuffix: "Standard",
    descriptionTemplate:
      "Mitigeur cuisine chrome. Cartouche ceramique haute qualite. Bec orientable. Mousseur anticalcaire. Flexibles renforces. Installation facile. Garantie 5 ans. Conforme NF.",
    categoryHandle: "mitigeur-cuisine-std",
    rootCategory: "plomberie",
    brands: ["grohe", "hansgrohe", "franke", "blanco"],
    optionName: "Type",
    optionValues: ["Bec Bas", "Bec Haut", "Col de Cygne", "Mural", "Premium"],
    priceRange: { min: 4500, max: 35500 },
    skuPrefix: "MIT-CUI-",
    imageKeywords: ["faucet", "kitchen", "mixer"],
    hsCode: "8481.80",
    weight: 1200,
    productType: "Robinetterie",
  },
  {
    namePrefix: "Mitigeur Cuisine",
    nameSuffix: "Douchette",
    descriptionTemplate:
      "Mitigeur cuisine chrome avec douchette extractible. Cartouche ceramique. 2 jets: jet puissant et douchette. Flexible 1.5m. Rotation 360°. Installation facile. Garantie 5 ans. Conforme NF.",
    categoryHandle: "mitigeur-cuisine-douchette",
    rootCategory: "plomberie",
    brands: ["grohe", "hansgrohe", "franke", "blanco"],
    optionName: "Type",
    optionValues: ["Douchette 2 jets", "Douchette 3 jets", "Semi-Pro", "Pro", "Premium Inox"],
    priceRange: { min: 8500, max: 58500 },
    skuPrefix: "MIT-CUI-DOUCH-",
    imageKeywords: ["faucet", "kitchen", "pull-out"],
    hsCode: "8481.80",
    weight: 1500,
    productType: "Robinetterie",
  },
  {
    namePrefix: "Joint Plomberie",
    nameSuffix: "Assortiment",
    descriptionTemplate:
      "Assortiment joints plomberie. Joints fibre, caoutchouc, NBR. Differents diametres 12-40mm. Pour robinetterie et raccords. Boite assortiment pro. Resistant eau chaude et froide. Conforme NF.",
    categoryHandle: "joints",
    rootCategory: "plomberie",
    brands: ["watts", "comap", "gripp", "somatherm"],
    optionName: "Type",
    optionValues: ["Assortiment Fibre", "Assortiment Caoutchouc", "Joints CSC", "Joints Plats", "Coffret Pro 300pcs"],
    priceRange: { min: 850, max: 4500 },
    skuPrefix: "JOINT-",
    imageKeywords: ["gasket", "seal", "washer"],
    hsCode: "4016.93",
    weight: 200,
    productType: "Joint",
  },

  // ===========================================================================
  // SANITAIRES
  // ===========================================================================
  {
    namePrefix: "WC Poser",
    nameSuffix: "Sortie Horizontale",
    descriptionTemplate:
      "WC a poser sortie horizontale. Cuvette ceramique blanche. Reservoir 3/6L double chasse. Abattant thermoplastique. Kit fixation inclus. Hauteur standard 40cm. Garantie 2 ans. Conforme NF.",
    categoryHandle: "wc-poser",
    rootCategory: "plomberie",
    brands: ["geberit", "jacob-delafon", "allia", "ideal-standard"],
    optionName: "Configuration",
    optionValues: ["Sortie Horizontale", "Sortie Verticale", "Pack Complet", "PMR Surehausse", "Premium Abattant Frein"],
    priceRange: { min: 8500, max: 35500 },
    skuPrefix: "WC-POSER-",
    imageKeywords: ["toilet", "wc", "ceramic"],
    hsCode: "6910.10",
    weight: 28000,
    productType: "WC",
  },

  // ===========================================================================
  // OUTILLAGE ELECTROPORTATIF
  // ===========================================================================
  {
    namePrefix: "Perceuse Visseuse",
    nameSuffix: "12V 2Ah",
    descriptionTemplate:
      "Perceuse visseuse sans fil 12V 2Ah. Couple 25-30Nm. Mandrin automatique 10mm. 2 batteries Li-Ion + chargeur. Coffret de transport. Variateur vitesse. LED eclairage. Garantie 2 ans.",
    categoryHandle: "perceuses-12v-2ah",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee"],
    optionName: "Pack",
    optionValues: ["Machine Nue", "1 Batterie", "2 Batteries", "Pack Accessoires", "Pack Pro"],
    priceRange: { min: 6500, max: 18500 },
    skuPrefix: "PERC-12V-2-",
    imageKeywords: ["drill", "cordless", "12v"],
    hsCode: "8467.21",
    weight: 1200,
    productType: "Perceuse",
  },
  {
    namePrefix: "Perceuse Visseuse",
    nameSuffix: "12V 4Ah",
    descriptionTemplate:
      "Perceuse visseuse sans fil 12V 4Ah. Couple 35-40Nm. Mandrin automatique 13mm. 2 batteries Li-Ion haute capacite + chargeur rapide. Coffret de transport. LED. Garantie 3 ans.",
    categoryHandle: "perceuses-12v-4ah",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee"],
    optionName: "Pack",
    optionValues: ["Machine Nue", "1 Batterie 4Ah", "2 Batteries 4Ah", "Pack Accessoires Pro", "Pack Premium"],
    priceRange: { min: 9500, max: 28500 },
    skuPrefix: "PERC-12V-4-",
    imageKeywords: ["drill", "cordless", "high-capacity"],
    hsCode: "8467.21",
    weight: 1400,
    productType: "Perceuse",
  },
  {
    namePrefix: "Perceuse Percussion",
    nameSuffix: "18V",
    descriptionTemplate:
      "Perceuse a percussion sans fil 18V. Couple 50-60Nm. Percussion 25000cps/min. Mandrin automatique 13mm. 2 batteries Li-Ion + chargeur. Coffret. LED. Garantie 3 ans.",
    categoryHandle: "perceuses-percussion",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee"],
    optionName: "Pack",
    optionValues: ["Machine Nue", "2 Batteries 2Ah", "2 Batteries 4Ah", "2 Batteries 5Ah", "Pack Pro Complet"],
    priceRange: { min: 12500, max: 45500 },
    skuPrefix: "PERC-PERC-",
    imageKeywords: ["hammer-drill", "percussion", "18v"],
    hsCode: "8467.21",
    weight: 2200,
    productType: "Perceuse",
  },
  {
    namePrefix: "Perforateur SDS+",
    nameSuffix: "18V-26V",
    descriptionTemplate:
      "Perforateur burineur SDS+ 18-26V. Energie impact 2-3J. 3 modes: perfo, burinage, percussion. Mandrin SDS+. Variateur vitesse. Butee profondeur. Coffret + accessoires. Garantie 3 ans.",
    categoryHandle: "perfo-sds-plus",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee", "hilti"],
    optionName: "Configuration",
    optionValues: ["Machine Nue", "2 Batteries 4Ah", "2 Batteries 5Ah", "Pack Forets", "Pack Pro Complet"],
    priceRange: { min: 18500, max: 65500 },
    skuPrefix: "PERFO-SDS-",
    imageKeywords: ["rotary-hammer", "sds-plus", "professional"],
    hsCode: "8467.21",
    weight: 3200,
    productType: "Perforateur",
  },
  {
    namePrefix: "Perforateur SDS-Max",
    nameSuffix: "36V-40V",
    descriptionTemplate:
      "Perforateur burineur SDS-Max 36-40V haute puissance. Energie impact 8-12J. 3 modes. Mandrin SDS-Max. Anti-vibration AVH. Demolition beton arme. Coffret pro. Garantie 3 ans.",
    categoryHandle: "perfo-sds-max",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee", "hilti"],
    optionName: "Configuration",
    optionValues: ["Machine Nue", "2 Batteries 6Ah", "2 Batteries 8Ah", "Pack Burins", "Pack Pro Demolition"],
    priceRange: { min: 55500, max: 185500 },
    skuPrefix: "PERFO-MAX-",
    imageKeywords: ["demolition-hammer", "sds-max", "heavy-duty"],
    hsCode: "8467.21",
    weight: 6500,
    productType: "Perforateur",
  },
  {
    namePrefix: "Meuleuse Angulaire",
    nameSuffix: "Ø125 18V",
    descriptionTemplate:
      "Meuleuse angulaire sans fil Ø125mm 18V. Vitesse 8000-10000tr/min. Protection redemarrage. Poignee anti-vibration. Carter protection. 2 batteries + chargeur. Coffret. Garantie 3 ans.",
    categoryHandle: "meuleuses-125",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee"],
    optionName: "Pack",
    optionValues: ["Machine Nue", "2 Batteries 4Ah", "2 Batteries 5Ah", "Pack Disques", "Pack Pro"],
    priceRange: { min: 9500, max: 38500 },
    skuPrefix: "MEUL-125-",
    imageKeywords: ["angle-grinder", "125mm", "cordless"],
    hsCode: "8467.29",
    weight: 2500,
    productType: "Meuleuse",
  },
  {
    namePrefix: "Meuleuse Angulaire",
    nameSuffix: "Ø230 Filaire",
    descriptionTemplate:
      "Meuleuse angulaire filaire Ø230mm. Puissance 2000-2400W. Vitesse 6000-6500tr/min. Poignee laterale. Carter protection. Demarrage progressif. Coffret de transport. Garantie 3 ans.",
    categoryHandle: "meuleuses-230",
    rootCategory: "outillage",
    brands: ["bosch", "makita", "dewalt", "milwaukee"],
    optionName: "Puissance",
    optionValues: ["2000W", "2200W", "2400W Standard", "2400W AVH", "2600W Pro"],
    priceRange: { min: 8500, max: 28500 },
    skuPrefix: "MEUL-230-",
    imageKeywords: ["angle-grinder", "230mm", "corded"],
    hsCode: "8467.29",
    weight: 5500,
    productType: "Meuleuse",
  },

  // ===========================================================================
  // OUTILLAGE A MAIN
  // ===========================================================================
  {
    namePrefix: "Cle Molette",
    nameSuffix: "Professionnelle",
    descriptionTemplate:
      "Cle a molette professionnelle. Machoires trempees chrome vanadium. Ouverture reglable. Molette crantee precision. Poignee bi-matiere antiderapante. Garantie a vie. Fabrication europeenne.",
    categoryHandle: "cles-molette",
    rootCategory: "outillage",
    brands: ["facom", "bahco", "knipex", "stanley"],
    optionName: "Taille",
    optionValues: ["150mm (ouv.19mm)", "200mm (ouv.24mm)", "250mm (ouv.30mm)", "300mm (ouv.34mm)", "Coffret 3 cles"],
    priceRange: { min: 1250, max: 8500 },
    skuPrefix: "CLE-MOL-",
    imageKeywords: ["wrench", "adjustable", "professional"],
    hsCode: "8204.11",
    weight: 350,
    productType: "Cle",
  },
  {
    namePrefix: "Jeu Tournevis",
    nameSuffix: "Professionnel",
    descriptionTemplate:
      "Jeu de tournevis professionnels. Acier chrome vanadium. Poignees bi-matiere ergonomiques. Plats, cruciformes, Pozidriv, Torx. Coffret de rangement. Garantie a vie. Made in Europe.",
    categoryHandle: "jeux-tournevis",
    rootCategory: "outillage",
    brands: ["facom", "wiha", "wera", "stanley"],
    optionName: "Configuration",
    optionValues: ["6 pieces Base", "10 pieces Standard", "18 pieces Pro", "VDE Isoles", "Precision Electronique"],
    priceRange: { min: 1850, max: 12500 },
    skuPrefix: "TOURN-JEU-",
    imageKeywords: ["screwdriver", "set", "professional"],
    hsCode: "8205.40",
    weight: 800,
    productType: "Tournevis",
  },

  // ===========================================================================
  // MESURE ET TRACAGE
  // ===========================================================================
  {
    namePrefix: "Niveau Bulle",
    nameSuffix: "Aluminium",
    descriptionTemplate:
      "Niveau a bulle aluminium professionnel. Profil aluminium renforce. Fioles precision ±0.5mm/m. Semelles aimantees ou lisses. Garantie fioles a vie. Resistant chocs. Made in Europe.",
    categoryHandle: "niveaux-bulle",
    rootCategory: "outillage",
    brands: ["stabila", "stanley", "facom", "bosch"],
    optionName: "Longueur",
    optionValues: ["40cm", "60cm", "80cm", "100cm", "120cm"],
    priceRange: { min: 1250, max: 8500 },
    skuPrefix: "NIV-BULLE-",
    imageKeywords: ["level", "spirit-level", "aluminum"],
    hsCode: "9017.80",
    weight: 600,
    productType: "Niveau",
  },

  // ===========================================================================
  // FORETS ET MECHES
  // ===========================================================================
  {
    namePrefix: "Foret Beton SDS+",
    nameSuffix: "4 Taillants",
    descriptionTemplate:
      "Foret beton SDS+ 4 taillants. Tete carbure tungstene. Spirale optimisee evacuation. Pour perforateur SDS+. Beton, pierre, brique. Longueur utile 110-460mm. Garantie pro.",
    categoryHandle: "forets-beton-sds",
    rootCategory: "outillage",
    brands: ["bosch", "dewalt", "makita", "milwaukee"],
    optionName: "Diametre",
    optionValues: ["Ø6mm", "Ø8mm", "Ø10mm", "Ø12mm", "Coffret 7 forets"],
    priceRange: { min: 350, max: 4500 },
    skuPrefix: "FORET-SDS-",
    imageKeywords: ["drill-bit", "sds", "concrete"],
    hsCode: "8207.19",
    weight: 120,
    productType: "Foret",
  },
  {
    namePrefix: "Foret Metal HSS",
    nameSuffix: "Acier Rapide",
    descriptionTemplate:
      "Foret metal HSS acier rapide. Affutage 118°. Pour acier, inox, fonte, alu. Precision DIN 338. Queue cylindrique. Coffret assortiment ou a l'unite. Garantie professionnelle.",
    categoryHandle: "forets-metal-hss",
    rootCategory: "outillage",
    brands: ["bosch", "dewalt", "metabo", "dormer"],
    optionName: "Diametre",
    optionValues: ["Ø3mm", "Ø5mm", "Ø6mm", "Ø8mm", "Coffret 13 forets"],
    priceRange: { min: 150, max: 3500 },
    skuPrefix: "FORET-HSS-",
    imageKeywords: ["drill-bit", "hss", "metal"],
    hsCode: "8207.19",
    weight: 50,
    productType: "Foret",
  },
  {
    namePrefix: "Foret Bois",
    nameSuffix: "Helicoidale",
    descriptionTemplate:
      "Foret bois helicoidal. Pointe centreuse. Spirale helicoidale evacuation copeaux. Pour bois massif, contreplaque, agglomere. Queue cylindrique ou hexagonale. Coffret ou unite.",
    categoryHandle: "forets-bois",
    rootCategory: "outillage",
    brands: ["bosch", "dewalt", "irwin", "diager"],
    optionName: "Diametre",
    optionValues: ["Ø6mm", "Ø8mm", "Ø10mm", "Ø12mm", "Coffret 8 forets"],
    priceRange: { min: 180, max: 2800 },
    skuPrefix: "FORET-BOIS-",
    imageKeywords: ["drill-bit", "wood", "spiral"],
    hsCode: "8207.19",
    weight: 60,
    productType: "Foret",
  },

  // ===========================================================================
  // FIXATION
  // ===========================================================================
  {
    namePrefix: "Cheville Nylon",
    nameSuffix: "Ø6mm",
    descriptionTemplate:
      "Cheville nylon Ø6mm pour fixation legere a moyenne. Expansion 4 zones. Collerette anti-rotation. Pour beton, brique, parpaing. Vis 3.5-5mm. Boite 100-500pcs. Conforme NF.",
    categoryHandle: "chevilles-6",
    rootCategory: "quincaillerie",
    brands: ["fischer", "rawl", "spit", "wurth"],
    optionName: "Conditionnement",
    optionValues: ["100 pieces", "200 pieces", "500 pieces", "Avec vis 100pcs", "Avec vis 500pcs"],
    priceRange: { min: 350, max: 2500 },
    skuPrefix: "CHEV-6-",
    imageKeywords: ["anchor", "nylon", "wall-plug"],
    hsCode: "3926.90",
    weight: 150,
    productType: "Cheville",
  },
  {
    namePrefix: "Cheville Nylon",
    nameSuffix: "Ø8mm",
    descriptionTemplate:
      "Cheville nylon Ø8mm pour fixation moyenne. Expansion 4 zones. Collerette anti-rotation. Pour beton, brique, pierre. Vis 4-6mm. Boite 100-500pcs. Resistant vibrations. Conforme NF.",
    categoryHandle: "chevilles-8",
    rootCategory: "quincaillerie",
    brands: ["fischer", "rawl", "spit", "wurth"],
    optionName: "Conditionnement",
    optionValues: ["100 pieces", "200 pieces", "500 pieces", "Avec vis 100pcs", "Avec vis 500pcs"],
    priceRange: { min: 450, max: 3500 },
    skuPrefix: "CHEV-8-",
    imageKeywords: ["anchor", "nylon", "8mm"],
    hsCode: "3926.90",
    weight: 200,
    productType: "Cheville",
  },
  {
    namePrefix: "Cheville Nylon",
    nameSuffix: "Ø10mm",
    descriptionTemplate:
      "Cheville nylon Ø10mm pour fixation lourde. Expansion 4 zones. Collerette anti-rotation. Pour beton, pierre naturelle. Vis 6-8mm. Boite 50-250pcs. Haute resistance. Conforme NF.",
    categoryHandle: "chevilles-10",
    rootCategory: "quincaillerie",
    brands: ["fischer", "rawl", "spit", "wurth"],
    optionName: "Conditionnement",
    optionValues: ["50 pieces", "100 pieces", "250 pieces", "Avec vis 50pcs", "Avec vis 100pcs"],
    priceRange: { min: 550, max: 4500 },
    skuPrefix: "CHEV-10-",
    imageKeywords: ["anchor", "nylon", "heavy-duty"],
    hsCode: "3926.90",
    weight: 300,
    productType: "Cheville",
  },
  {
    namePrefix: "Cheville Chimique",
    nameSuffix: "Resine Scellement",
    descriptionTemplate:
      "Cheville chimique resine de scellement. Cartouche 280-380ml. Bi-composant. Pour beton, pierre, brique creuse. Haute resistance. Temps prise 5-45min. Tiges filetees vendues separement.",
    categoryHandle: "chevilles-chimiques",
    rootCategory: "quincaillerie",
    brands: ["fischer", "spit", "hilti", "wurth"],
    optionName: "Type",
    optionValues: ["Cartouche 280ml", "Cartouche 380ml", "Resine Polyester", "Resine Vinylester", "Kit Complet"],
    priceRange: { min: 1250, max: 8500 },
    skuPrefix: "CHEV-CHIM-",
    imageKeywords: ["chemical-anchor", "resin", "cartridge"],
    hsCode: "3506.91",
    weight: 400,
    productType: "Cheville Chimique",
  },
  {
    namePrefix: "Cheville Metal",
    nameSuffix: "Expansion",
    descriptionTemplate:
      "Cheville metal a expansion. Acier zingue. Fixation lourde beton plein. Diametre 6-12mm. Haute resistance arrachement. Pour applications structurelles. Agrement technique europeen.",
    categoryHandle: "chevilles-metal",
    rootCategory: "quincaillerie",
    brands: ["fischer", "hilti", "spit", "rawl"],
    optionName: "Diametre/Type",
    optionValues: ["M6x50", "M8x65", "M10x80", "M12x100", "Assortiment Pro"],
    priceRange: { min: 850, max: 6500 },
    skuPrefix: "CHEV-MET-",
    imageKeywords: ["metal-anchor", "expansion", "heavy-duty"],
    hsCode: "7318.15",
    weight: 250,
    productType: "Cheville Metal",
  },
  {
    namePrefix: "Vis Agglo",
    nameSuffix: "Jaune Zinguee",
    descriptionTemplate:
      "Vis a bois agglomere tete fraisee. Acier zingue jaune. Filetage total ou partiel. Pour bois, agglomere, MDF. Empreinte Pozidriv. Boite 200-1000pcs. Fabrication europeenne.",
    categoryHandle: "vis-agglo",
    rootCategory: "quincaillerie",
    brands: ["fischer", "spax", "wurth", "reisser"],
    optionName: "Dimensions",
    optionValues: ["3x20mm", "4x40mm", "5x50mm", "6x80mm", "Assortiment 600pcs"],
    priceRange: { min: 350, max: 4500 },
    skuPrefix: "VIS-AGGL-",
    imageKeywords: ["screw", "wood", "chipboard"],
    hsCode: "7318.12",
    weight: 200,
    productType: "Vis",
  },
  {
    namePrefix: "Vis Autoperceuse",
    nameSuffix: "Metal",
    descriptionTemplate:
      "Vis autoperceuse pour metal. Tete cylindrique ou fraisee. Pointe perceuse. Pour tole 0.5-6mm. Empreinte Phillips ou Torx. Acier traite. Boite 100-500pcs. Usage professionnel.",
    categoryHandle: "vis-autoperceuses",
    rootCategory: "quincaillerie",
    brands: ["fischer", "wurth", "spax", "hilti"],
    optionName: "Type/Dimensions",
    optionValues: ["4.8x19 Cylindrique", "4.8x25 Cylindrique", "5.5x25 Fraisee", "6.3x32 Fraisee", "Assortiment 500pcs"],
    priceRange: { min: 550, max: 5500 },
    skuPrefix: "VIS-AUTO-",
    imageKeywords: ["self-drilling", "screw", "metal"],
    hsCode: "7318.14",
    weight: 300,
    productType: "Vis",
  },
  {
    namePrefix: "Clou Pointe",
    nameSuffix: "Acier",
    descriptionTemplate:
      "Clous pointes acier. Tete plate ou tete homme. Pour fixation bois, coffrage, palettes. Acier trefille. Longueur 20-150mm. Boite 1-5kg. Galvanise ou brut. Fabrication France.",
    categoryHandle: "clous",
    rootCategory: "quincaillerie",
    brands: ["apara", "wurth", "fischer"],
    optionName: "Type/Longueur",
    optionValues: ["20mm Tete Plate 1kg", "40mm Tete Homme 1kg", "60mm Tete Plate 2kg", "80mm Galva 1kg", "Assortiment 5kg"],
    priceRange: { min: 450, max: 3500 },
    skuPrefix: "CLOU-",
    imageKeywords: ["nail", "steel", "construction"],
    hsCode: "7317.00",
    weight: 1000,
    productType: "Clou",
  },

  // ===========================================================================
  // SERRURERIE ET QUINCAILLERIE
  // ===========================================================================
  {
    namePrefix: "Serrure Encastrer",
    nameSuffix: "Axe 40-50mm",
    descriptionTemplate:
      "Serrure a encastrer pour porte interieure. Axe 40 ou 50mm. Bec de cane reversible. Condamnation ou a cle. Finition laiton ou nickel. Coffre acier. Garantie 2 ans. Conforme NF.",
    categoryHandle: "serrures-encastrer",
    rootCategory: "quincaillerie",
    brands: ["bricard", "vachette", "thirard", "stremler"],
    optionName: "Type",
    optionValues: ["Bec Cane Axe 40", "Bec Cane Axe 50", "Condamnation", "Cle I", "3 Points"],
    priceRange: { min: 1850, max: 12500 },
    skuPrefix: "SERR-ENC-",
    imageKeywords: ["lock", "mortise", "door"],
    hsCode: "8301.40",
    weight: 800,
    productType: "Serrure",
  },
  {
    namePrefix: "Serrure Applique",
    nameSuffix: "Tirage Gauche/Droite",
    descriptionTemplate:
      "Serrure en applique pour porte d'entree. Tirage gauche ou droite. 3 ou 5 points. Coffre acier peint. Cylindre europeen. Certifiee A2P selon modele. Garantie 5 ans. Conforme NF.",
    categoryHandle: "serrures-applique",
    rootCategory: "quincaillerie",
    brands: ["bricard", "vachette", "fichet", "picard"],
    optionName: "Points/Tirage",
    optionValues: ["3 Points Gauche", "3 Points Droite", "5 Points Gauche", "5 Points Droite", "Monopoint"],
    priceRange: { min: 5500, max: 35500 },
    skuPrefix: "SERR-APP-",
    imageKeywords: ["lock", "rim-lock", "security"],
    hsCode: "8301.40",
    weight: 2500,
    productType: "Serrure",
  },
  {
    namePrefix: "Cylindre Europeen",
    nameSuffix: "Standard",
    descriptionTemplate:
      "Cylindre europeen profil standard. Laiton nickelé. 5 ou 6 goupilles. Livres avec 3 cles. Longueur 30x30 a 40x40mm. Anti-crochetage base. Garantie 2 ans. Conforme NF.",
    categoryHandle: "cylindres-standards",
    rootCategory: "quincaillerie",
    brands: ["bricard", "vachette", "thirard", "abus"],
    optionName: "Dimensions",
    optionValues: ["30x30mm", "30x40mm", "35x35mm", "40x40mm", "Lot 5 cylindres"],
    priceRange: { min: 850, max: 3500 },
    skuPrefix: "CYL-STD-",
    imageKeywords: ["cylinder", "lock", "euro-profile"],
    hsCode: "8301.40",
    weight: 150,
    productType: "Cylindre",
  },
  {
    namePrefix: "Cylindre Haute Securite",
    nameSuffix: "A2P",
    descriptionTemplate:
      "Cylindre haute securite certifie A2P. Protection anti-crochetage, anti-arrachement, anti-perçage. Carte de propriete. 5 cles incopiables. Garantie 10 ans. Conforme assurances.",
    categoryHandle: "cylindres-securite",
    rootCategory: "quincaillerie",
    brands: ["bricard", "vachette", "mul-t-lock", "dom"],
    optionName: "Niveau/Dimensions",
    optionValues: ["A2P* 30x30", "A2P* 30x40", "A2P** 30x30", "A2P** 30x40", "A2P*** 30x40"],
    priceRange: { min: 4500, max: 18500 },
    skuPrefix: "CYL-SEC-",
    imageKeywords: ["high-security", "cylinder", "a2p"],
    hsCode: "8301.40",
    weight: 200,
    productType: "Cylindre",
  },
  {
    namePrefix: "Poignee Rosace",
    nameSuffix: "Inox/Laiton",
    descriptionTemplate:
      "Poignee de porte sur rosace. Bequille inox brosse ou laiton poli. Rosace Ø50-52mm. Carre 7 ou 8mm. Fixation invisible. Design moderne ou classique. Garantie 10 ans. Conforme NF.",
    categoryHandle: "poignees-rosace",
    rootCategory: "quincaillerie",
    brands: ["vachette", "hoppe", "delabie", "mantion"],
    optionName: "Finition",
    optionValues: ["Inox Brosse", "Laiton Poli", "Chrome Satin", "Noir Mat", "Design Premium"],
    priceRange: { min: 1850, max: 8500 },
    skuPrefix: "POIG-ROS-",
    imageKeywords: ["door-handle", "rosette", "stainless"],
    hsCode: "8302.42",
    weight: 400,
    productType: "Poignee",
  },
  {
    namePrefix: "Poignee Plaque",
    nameSuffix: "Longue",
    descriptionTemplate:
      "Poignee de porte sur plaque longue. Bequille inox ou laiton. Plaque 220-240mm. Carre 7 ou 8mm. Entree de cle ou condamnation. Fixation invisible. Design classique. Garantie 10 ans.",
    categoryHandle: "poignees-plaque",
    rootCategory: "quincaillerie",
    brands: ["vachette", "hoppe", "bricard", "mantion"],
    optionName: "Type/Finition",
    optionValues: ["Bec Cane Inox", "Bec Cane Laiton", "Cle I Inox", "Condamnation", "Design Premium"],
    priceRange: { min: 2250, max: 12500 },
    skuPrefix: "POIG-PLQ-",
    imageKeywords: ["door-handle", "backplate", "long"],
    hsCode: "8302.42",
    weight: 500,
    productType: "Poignee",
  },
  {
    namePrefix: "Poignee Fenetre",
    nameSuffix: "Aluminium/PVC",
    descriptionTemplate:
      "Poignee de fenetre ou porte-fenetre. Pour menuiserie alu ou PVC. Carre 7mm. Finition blanche, grise ou inox. Avec ou sans cle. Anti-effraction. Garantie 5 ans. Conforme NF.",
    categoryHandle: "poignees-fenetre",
    rootCategory: "quincaillerie",
    brands: ["hoppe", "roto", "siegenia", "g-u"],
    optionName: "Type",
    optionValues: ["Blanche Standard", "Grise Alu", "Inox", "Avec Cle", "Lot 10"],
    priceRange: { min: 450, max: 2500 },
    skuPrefix: "POIG-FEN-",
    imageKeywords: ["window-handle", "espagnolette", "white"],
    hsCode: "8302.42",
    weight: 120,
    productType: "Poignee Fenetre",
  },
  {
    namePrefix: "Charniere Invisible",
    nameSuffix: "3D Reglable",
    descriptionTemplate:
      "Charniere invisible pour porte interieure. Reglage 3D. Ouverture 180°. Acier zingue. Charge 60-80kg/paire. Montage encastre invisible. Lot de 2 charnieres. Garantie 5 ans.",
    categoryHandle: "charnieres-invisibles",
    rootCategory: "quincaillerie",
    brands: ["simonswerk", "anuba", "tectus", "hafele"],
    optionName: "Modele",
    optionValues: ["Standard 60kg", "Renforcee 80kg", "Inox", "3D Premium", "Lot 5 paires"],
    priceRange: { min: 2850, max: 12500 },
    skuPrefix: "CHARN-INV-",
    imageKeywords: ["hinge", "concealed", "3d"],
    hsCode: "8302.10",
    weight: 350,
    productType: "Charniere",
  },

  // ===========================================================================
  // ETANCHEITE
  // ===========================================================================
  {
    namePrefix: "Silicone Sanitaire",
    nameSuffix: "Blanc/Transparent",
    descriptionTemplate:
      "Silicone sanitaire acetique anti-moisissures. Blanc ou transparent. Cartouche 280-310ml. Pour joints salle de bain, cuisine. Fungicide. Etancheite eau. Temps de prise 24h. Garantie 10 ans.",
    categoryHandle: "silicone-sanitaire",
    rootCategory: "quincaillerie",
    brands: ["rubson", "soudal", "bostik", "sika"],
    optionName: "Couleur/Conditionnement",
    optionValues: ["Blanc 310ml", "Transparent 310ml", "Blanc Lot 12", "Transparent Lot 12", "Premium Antibact"],
    priceRange: { min: 450, max: 6500 },
    skuPrefix: "SILI-SANI-",
    imageKeywords: ["silicone", "sealant", "sanitary"],
    hsCode: "3506.91",
    weight: 350,
    productType: "Silicone",
  },
  {
    namePrefix: "Silicone Neutre",
    nameSuffix: "Tous Materiaux",
    descriptionTemplate:
      "Silicone neutre tous materiaux. Sans acide acetique. Pour verre, metal, plastique, pierre. Cartouche 280-310ml. Blanc, gris, transparent ou noir. Excellente adherence. Garantie 10 ans.",
    categoryHandle: "silicone-neutre",
    rootCategory: "quincaillerie",
    brands: ["rubson", "soudal", "bostik", "sika"],
    optionName: "Couleur",
    optionValues: ["Blanc", "Gris", "Transparent", "Noir", "Lot 12 Blanc"],
    priceRange: { min: 550, max: 7500 },
    skuPrefix: "SILI-NEU-",
    imageKeywords: ["silicone", "neutral", "universal"],
    hsCode: "3506.91",
    weight: 350,
    productType: "Silicone",
  },
];

/**
 * Combined templates from all arrays
 */
export const allAdditionalTemplates: ProductTemplate[] = [
  ...additionalProductTemplates,
  ...additionalProductTemplates2,
  ...additionalProductTemplates3,
];

/**
 * Export count for validation
 */
export const templateCount = additionalProductTemplates.length;
export const templateCount2 = additionalProductTemplates2.length;
export const templateCount3 = additionalProductTemplates3.length;
export const totalTemplateCount = allAdditionalTemplates.length;

/**
 * Get templates by root category
 */
export function getTemplatesByRootCategory(
  rootCategory: string
): ProductTemplate[] {
  return allAdditionalTemplates.filter(
    (t) => t.rootCategory === rootCategory
  );
}

/**
 * Get templates by category handle
 */
export function getTemplatesByCategoryHandle(
  categoryHandle: string
): ProductTemplate[] {
  return allAdditionalTemplates.filter(
    (t) => t.categoryHandle === categoryHandle
  );
}
