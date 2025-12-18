/**
 * Category Icons/Pictos Configuration
 *
 * Defines all available icons for product category customization.
 * Icons use Lucide React icons (compatible with @medusajs/icons).
 */

import {
  Zap,
  Cable,
  Lightbulb,
  Plug,
  Droplets,
  Wrench,
  Hammer,
  Ruler,
  Thermometer,
  Flame,
  Snowflake,
  Fan,
  Lock,
  Key,
  Settings,
  Package,
  Layers,
  Box,
  CircleDot,
  Shield,
  AlertTriangle,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * All available category icon keys
 */
export const CATEGORY_PICTOS = [
  // Électricité
  "bolt",
  "cable",
  "lightbulb",
  "outlet",
  // Plomberie
  "droplets",
  "pipe",
  "faucet",
  // Outillage
  "wrench",
  "hammer",
  "ruler",
  "settings",
  // Chauffage / Climatisation
  "thermometer",
  "flame",
  "snowflake",
  "fan",
  // Quincaillerie
  "lock",
  "key",
  "screw",
  // Général
  "package",
  "layers",
  "box",
  "shield",
  "check",
  "warning",
] as const;

export type CategoryPicto = (typeof CATEGORY_PICTOS)[number];

export interface CategoryIconDefinition {
  label: string;
  labelEn: string;
  Icon: LucideIcon;
  category: "electricite" | "plomberie" | "outillage" | "chauffage" | "quincaillerie" | "general";
}

/**
 * Icon definitions with French labels and category grouping
 */
export const CATEGORY_ICONS: Record<CategoryPicto, CategoryIconDefinition> = {
  // Électricité
  bolt: {
    label: "Éclair",
    labelEn: "Lightning",
    Icon: Zap,
    category: "electricite",
  },
  cable: {
    label: "Câble",
    labelEn: "Cable",
    Icon: Cable,
    category: "electricite",
  },
  lightbulb: {
    label: "Ampoule",
    labelEn: "Lightbulb",
    Icon: Lightbulb,
    category: "electricite",
  },
  outlet: {
    label: "Prise",
    labelEn: "Outlet",
    Icon: Plug,
    category: "electricite",
  },

  // Plomberie
  droplets: {
    label: "Gouttes",
    labelEn: "Droplets",
    Icon: Droplets,
    category: "plomberie",
  },
  pipe: {
    label: "Tuyau",
    labelEn: "Pipe",
    Icon: CircleDot,
    category: "plomberie",
  },
  faucet: {
    label: "Robinet",
    labelEn: "Faucet",
    Icon: Droplets,
    category: "plomberie",
  },

  // Outillage
  wrench: {
    label: "Clé",
    labelEn: "Wrench",
    Icon: Wrench,
    category: "outillage",
  },
  hammer: {
    label: "Marteau",
    labelEn: "Hammer",
    Icon: Hammer,
    category: "outillage",
  },
  ruler: {
    label: "Règle",
    labelEn: "Ruler",
    Icon: Ruler,
    category: "outillage",
  },
  settings: {
    label: "Réglages",
    labelEn: "Settings",
    Icon: Settings,
    category: "outillage",
  },

  // Chauffage / Climatisation
  thermometer: {
    label: "Thermomètre",
    labelEn: "Thermometer",
    Icon: Thermometer,
    category: "chauffage",
  },
  flame: {
    label: "Flamme",
    labelEn: "Flame",
    Icon: Flame,
    category: "chauffage",
  },
  snowflake: {
    label: "Flocon",
    labelEn: "Snowflake",
    Icon: Snowflake,
    category: "chauffage",
  },
  fan: {
    label: "Ventilateur",
    labelEn: "Fan",
    Icon: Fan,
    category: "chauffage",
  },

  // Quincaillerie
  lock: {
    label: "Cadenas",
    labelEn: "Lock",
    Icon: Lock,
    category: "quincaillerie",
  },
  key: {
    label: "Clé",
    labelEn: "Key",
    Icon: Key,
    category: "quincaillerie",
  },
  screw: {
    label: "Vis",
    labelEn: "Screw",
    Icon: Settings,
    category: "quincaillerie",
  },

  // Général
  package: {
    label: "Paquet",
    labelEn: "Package",
    Icon: Package,
    category: "general",
  },
  layers: {
    label: "Couches",
    labelEn: "Layers",
    Icon: Layers,
    category: "general",
  },
  box: {
    label: "Boîte",
    labelEn: "Box",
    Icon: Box,
    category: "general",
  },
  shield: {
    label: "Bouclier",
    labelEn: "Shield",
    Icon: Shield,
    category: "general",
  },
  check: {
    label: "Validé",
    labelEn: "Check",
    Icon: CheckCircle,
    category: "general",
  },
  warning: {
    label: "Attention",
    labelEn: "Warning",
    Icon: AlertTriangle,
    category: "general",
  },
};

/**
 * Get icon definition by key, with fallback to package icon
 */
export function getCategoryIcon(key: string | undefined | null): CategoryIconDefinition {
  if (key && key in CATEGORY_ICONS) {
    return CATEGORY_ICONS[key as CategoryPicto];
  }
  return CATEGORY_ICONS.package;
}

/**
 * Validate if a string is a valid picto key
 */
export function isValidPicto(value: string): value is CategoryPicto {
  return CATEGORY_PICTOS.includes(value as CategoryPicto);
}

/**
 * Group icons by category for organized display
 */
export function getIconsByCategory(): Record<string, { key: CategoryPicto; def: CategoryIconDefinition }[]> {
  const groups: Record<string, { key: CategoryPicto; def: CategoryIconDefinition }[]> = {
    electricite: [],
    plomberie: [],
    outillage: [],
    chauffage: [],
    quincaillerie: [],
    general: [],
  };

  for (const [key, def] of Object.entries(CATEGORY_ICONS)) {
    groups[def.category].push({ key: key as CategoryPicto, def });
  }

  return groups;
}

/**
 * Category group labels in French
 */
export const CATEGORY_GROUP_LABELS: Record<string, string> = {
  electricite: "Électricité",
  plomberie: "Plomberie",
  outillage: "Outillage",
  chauffage: "Chauffage / Clim",
  quincaillerie: "Quincaillerie",
  general: "Général",
};
