/**
 * B2B Product Types
 *
 * Extended product types with B2B-specific metadata for the jewelry wholesale platform.
 * These types extend the base Product type with rich metadata from Medusa.
 *
 * @packageDocumentation
 */

import type { Product, Category } from '@bijoux/types';
import type { MedusaProduct, MedusaVariant } from '@/lib/medusa/client';

// ============================================================================
// Product Characteristics (Caracteristiques)
// ============================================================================

/**
 * Product characteristics/specifications
 * Maps to Medusa metadata.caracteristiques
 */
export interface ProductCharacteristics {
  /** Metal type and purity (e.g., "Or blanc 18K (750/1000)") */
  metal?: string;
  /** Main stone type (e.g., "Diamant naturel") */
  pierre_principale?: string;
  /** Stone cut (e.g., "Brillant rond") */
  taille?: string;
  /** Stone color grade (e.g., "G") */
  couleur?: string;
  /** Stone clarity grade (e.g., "VS2") */
  purete?: string;
  /** Setting type (e.g., "4 griffes") */
  monture?: string;
  /** Stone weight in carats */
  carat?: string;
  /** Metal weight in grams */
  poids_metal?: string;
  /** Stone origin */
  origine_pierre?: string;
  /** Treatment information */
  traitement?: string;
  /** Chain length (for necklaces) */
  longueur?: string;
  /** Ring size */
  taille_bague?: string;
  /** Bracelet size */
  taille_bracelet?: string;
  /** Watch diameter */
  diametre_boitier?: string;
  /** Watch movement */
  mouvement?: string;
  /** Water resistance */
  etancheite?: string;
  /** Additional custom characteristics */
  [key: string]: string | undefined;
}

/**
 * Certification information
 */
export interface ProductCertification {
  /** Certification authority (e.g., "GIA", "HRD", "IGI") */
  authority: string;
  /** Certificate number (optional) */
  number?: string;
}

// ============================================================================
// B2B Product Extension
// ============================================================================

/**
 * Extended Product with B2B metadata
 * Includes all rich data from Medusa seeder
 */
export interface B2BProduct extends Product {
  // === Extended Identification ===
  /** Product subtitle (from Medusa) */
  subtitle?: string;

  // === B2B Metadata ===
  /** Technical specifications */
  caracteristiques?: ProductCharacteristics;
  /** Product certifications (e.g., GIA, HRD) */
  certifications?: ProductCertification[];
  /** Warranty text (e.g., "A vie", "2 ans") */
  garantieText?: string;
  /** HS code for customs */
  hsCode?: string;

  // === Pricing B2B ===
  /** Minimum order quantity */
  minOrderQuantity?: number;
  /** Volume discount available */
  hasVolumeDiscount?: boolean;

  // === Manufacturing ===
  /** Handmade indicator */
  isHandmade?: boolean;
  /** Production time in days */
  productionTimeDays?: number;
  /** Made to order indicator */
  isMadeToOrder?: boolean;

  // === Marketing ===
  /** Featured on homepage */
  isFeaturedOnHomepage?: boolean;
  /** Marketing tags */
  marketingTags?: string[];

  // === Sustainability ===
  /** Ethical sourcing indicator */
  isEthicallySourced?: boolean;
  /** Conflict-free indicator */
  isConflictFree?: boolean;
  /** Recycled metal indicator */
  hasRecycledMetal?: boolean;
}

// ============================================================================
// Product Options (for variant selection)
// ============================================================================

/**
 * Product option definition (e.g., "Carat", "Longueur", "Taille")
 */
export interface ProductOption {
  /** Option ID */
  id: string;
  /** Option title (e.g., "Carat", "Longueur") */
  title: string;
  /** Available values for this option */
  values: ProductOptionValue[];
}

/**
 * Single option value
 */
export interface ProductOptionValue {
  /** Value ID */
  id: string;
  /** Display value (e.g., "0.30ct", "45cm") */
  value: string;
}

/**
 * Product variant with parsed options
 */
export interface B2BProductVariant {
  /** Variant ID */
  id: string;
  /** Variant title */
  title: string;
  /** SKU */
  sku: string | null;
  /** EAN/Barcode */
  ean: string | null;
  /** Price in cents */
  priceAmount: number;
  /** Currency code */
  currencyCode: string;
  /** Available stock */
  inventoryQuantity: number;
  /** Allow backorder */
  allowBackorder: boolean;
  /** Weight in grams */
  weight: number | null;
  /** Option values for this variant */
  optionValues: Record<string, string>;
  /** Variant-specific images (if any) */
  images?: string[];
  /** Is this variant in stock */
  inStock: boolean;
}

// ============================================================================
// Variant Selection State
// ============================================================================

/**
 * Current variant selection state
 */
export interface VariantSelectionState {
  /** Currently selected option values */
  selectedOptions: Record<string, string>;
  /** Currently selected variant (if complete selection) */
  selectedVariant: B2BProductVariant | null;
  /** Whether all required options are selected */
  isComplete: boolean;
  /** Available values for each option (may be filtered based on selection) */
  availableValues: Record<string, string[]>;
}

// ============================================================================
// Enhanced B2B Product Data (from adapter)
// ============================================================================

/**
 * Complete B2B product data bundle for the detail page
 */
export interface B2BProductData {
  /** Adapted product for base components */
  product: B2BProduct;
  /** Original Medusa product (for variants, options) */
  medusaProduct: MedusaProduct;
  /** Parsed product options */
  options: ProductOption[];
  /** Parsed variants with option values */
  variants: B2BProductVariant[];
  /** Default selected variant */
  defaultVariant: B2BProductVariant | null;
  /** Breadcrumb categories */
  breadcrumbs: Category[];
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Price display configuration
 */
export interface PriceDisplayConfig {
  /** Show HT label */
  showHTLabel?: boolean;
  /** Show currency symbol */
  showCurrency?: boolean;
  /** Number of decimal places */
  decimals?: number;
  /** Locale for formatting */
  locale?: string;
}

/**
 * Stock display configuration
 */
export interface StockDisplayConfig {
  /** Show exact quantity */
  showExactQuantity?: boolean;
  /** Low stock threshold */
  lowStockThreshold?: number;
  /** Text for in stock */
  inStockText?: string;
  /** Text for low stock */
  lowStockText?: string;
  /** Text for out of stock */
  outOfStockText?: string;
  /** Text for backorder */
  backorderText?: string;
}

// ============================================================================
// Medusa Metadata Type Guards
// ============================================================================

/**
 * Check if metadata has caracteristiques
 */
export function hasCaracteristiques(
  metadata: Record<string, unknown> | null | undefined
): metadata is { caracteristiques: ProductCharacteristics } & Record<string, unknown> {
  return (
    metadata != null &&
    typeof metadata === 'object' &&
    'caracteristiques' in metadata &&
    typeof metadata.caracteristiques === 'object' &&
    metadata.caracteristiques !== null
  );
}

/**
 * Check if metadata has certifications
 */
export function hasCertifications(
  metadata: Record<string, unknown> | null | undefined
): metadata is { certification: string[] } & Record<string, unknown> {
  return (
    metadata != null &&
    typeof metadata === 'object' &&
    'certification' in metadata &&
    Array.isArray(metadata.certification) &&
    metadata.certification.length > 0
  );
}

/**
 * Check if metadata has garantie
 */
export function hasGarantie(
  metadata: Record<string, unknown> | null | undefined
): metadata is { garantie: string } & Record<string, unknown> {
  return (
    metadata != null &&
    typeof metadata === 'object' &&
    'garantie' in metadata &&
    typeof metadata.garantie === 'string'
  );
}

// ============================================================================
// Characteristic Labels (French)
// ============================================================================

/**
 * French labels for product characteristics
 */
export const CHARACTERISTIC_LABELS: Record<string, string> = {
  metal: 'Metal',
  pierre_principale: 'Pierre principale',
  taille: 'Taille de pierre',
  couleur: 'Couleur',
  purete: 'Purete',
  monture: 'Monture',
  carat: 'Caratage',
  poids_metal: 'Poids metal',
  origine_pierre: 'Origine pierre',
  traitement: 'Traitement',
  longueur: 'Longueur',
  taille_bague: 'Taille de bague',
  taille_bracelet: 'Taille bracelet',
  diametre_boitier: 'Diametre boitier',
  mouvement: 'Mouvement',
  etancheite: 'Etancheite',
};

/**
 * Get the French label for a characteristic key
 */
export function getCharacteristicLabel(key: string): string {
  return CHARACTERISTIC_LABELS[key] || key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

// ============================================================================
// Certification Authorities
// ============================================================================

/**
 * Known certification authorities with metadata
 */
export const CERTIFICATION_AUTHORITIES: Record<string, { name: string; fullName: string; color: string }> = {
  GIA: { name: 'GIA', fullName: 'Gemological Institute of America', color: '#1a365d' },
  HRD: { name: 'HRD', fullName: 'HRD Antwerp', color: '#c53030' },
  IGI: { name: 'IGI', fullName: 'International Gemological Institute', color: '#2f855a' },
  AGS: { name: 'AGS', fullName: 'American Gem Society', color: '#744210' },
  EGL: { name: 'EGL', fullName: 'European Gemological Laboratory', color: '#553c9a' },
};

/**
 * Get certification authority info
 */
export function getCertificationInfo(authority: string) {
  return CERTIFICATION_AUTHORITIES[authority.toUpperCase()] || {
    name: authority,
    fullName: authority,
    color: '#718096',
  };
}
