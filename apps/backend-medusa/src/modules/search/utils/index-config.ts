/**
 * Search Index Configuration
 *
 * Defines the structure and settings for each searchable entity index.
 */

import type { IndexSettings } from '../providers/search-provider.interface';

export const INDEX_NAMES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  MARQUES: 'marques',
  COLLECTIONS: 'collections',
} as const;

export type IndexName = (typeof INDEX_NAMES)[keyof typeof INDEX_NAMES];

/**
 * Product Index Configuration
 *
 * Optimized for B2B jewelry e-commerce search.
 */
export const PRODUCT_INDEX_SETTINGS: IndexSettings = {
  // Fields that users can search by (ordered by priority)
  searchableAttributes: [
    'title',
    'handle',
    'description',
    'sku',
    'barcode',
    'collection',
    'brand',
    'material',
    'categories.name',
    'category_names',
    'category_paths',
    'tags',
    'metadata.reference',
    'metadata.style',
  ],

  // Fields that can be used for filtering
  // NOTE: Facets must also be included here (facets require filterable)
  filterableAttributes: [
    // Category filtering - flat arrays for efficient filtering
    'category_ids',
    'category_names',
    'category_paths',
    // Hierarchical category handles - includes all ancestor handles
    // This allows filtering by parent category to find products in child categories
    'all_category_handles',
    // Legacy nested category fields
    'categories.id',
    'categories.handle',
    'categories.name',
    // Brand/Marque filtering (from product-marque link)
    'brand_id',
    'brand_name',
    'brand_slug',
    // Other filters
    'collection_id',
    'collection',
    'brand',
    'material',
    'tags',
    'is_available',
    'has_stock',
    'price_min',
    'price_max',
    'created_at',
    'updated_at',
    'metadata.origin',
    'metadata.warranty',
    'metadata.style',
    'metadata.stone_type',
    'metadata.metal_type',
    'metadata.carat',
  ],

  // Fields that can be used for sorting
  sortableAttributes: [
    'title',
    'price_min',
    'price_max',
    'created_at',
    'updated_at',
    'metadata.popularity',
    'metadata.sales_count',
  ],

  // Custom ranking rules for relevance
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
    // Custom rules can be added: 'metadata.popularity:desc'
  ],

  // Typo tolerance for user-friendly search
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 8,
    },
    // Don't apply typo tolerance to SKUs and barcodes
    disableOnAttributes: ['sku', 'barcode'],
  },

  // Pagination limits
  pagination: {
    maxTotalHits: 10000,
  },

  // Faceting configuration
  faceting: {
    maxValuesPerFacet: 100,
  },

  // Stop words for French (primary language)
  stopWords: [
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux',
    'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
    'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa',
    'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'nos', 'vos', 'leurs',
    'qui', 'que', 'quoi', 'dont', 'où',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on',
    'en', 'y', 'pour', 'par', 'sur', 'sous', 'avec', 'sans', 'entre',
    'est', 'sont', 'être', 'avoir', 'fait', 'faire',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been',
  ],

  // Synonyms for jewelry industry
  synonyms: {
    // Materials
    'or': ['gold', 'doré', 'jaune'],
    'argent': ['silver', 'argenté'],
    'platine': ['platinum'],
    'diamant': ['diamond', 'brillant'],
    'perle': ['pearl', 'nacre'],
    'rubis': ['ruby', 'rouge'],
    'saphir': ['sapphire', 'bleu'],
    'emeraude': ['emerald', 'vert'],

    // Product types
    'bague': ['ring', 'anneau'],
    'collier': ['necklace', 'chaine', 'pendentif'],
    'bracelet': ['bracelet', 'gourmette', 'jonc'],
    'boucle': ['earring', 'boucle d\'oreille', 'pendante', 'clou'],
    'montre': ['watch', 'horloge'],

    // B2B terms
    'lot': ['pack', 'ensemble', 'assortiment'],
    'gros': ['wholesale', 'grossiste'],
    'catalogue': ['catalog', 'collection'],
  },
};

/**
 * Category Index Configuration
 *
 * Includes full hierarchy support for navigation.
 */
export const CATEGORY_INDEX_SETTINGS: IndexSettings = {
  searchableAttributes: [
    'name',
    'handle',
    'description',
    'path',
    'ancestor_names',
    'metadata.name_en',
  ],

  filterableAttributes: [
    'id',
    'handle',
    'parent_category_id',
    // Hierarchy fields for navigation
    'parent_category_ids',
    'path',
    'ancestor_names',
    'ancestor_handles',
    'depth',
    'is_active',
    'rank',
  ],

  sortableAttributes: [
    'name',
    'rank',
    'depth',
    'product_count',
    'created_at',
  ],

  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 8,
    },
  },

  pagination: {
    maxTotalHits: 1000,
  },

  faceting: {
    maxValuesPerFacet: 100,
  },
};

/**
 * Marques (Brands) Index Configuration
 *
 * Index configuration for the marques module.
 * Optimized for brand search and filtering in B2B jewelry catalog.
 */
export const MARQUES_INDEX_SETTINGS: IndexSettings = {
  // Fields that users can search by (ordered by priority)
  searchableAttributes: [
    'name',
    'description',
    'country',
  ],

  // Fields that can be used for filtering
  filterableAttributes: [
    'id',
    'slug',
    'is_active',
    'country',
    'rank',
  ],

  // Fields that can be used for sorting
  sortableAttributes: [
    'name',
    'rank',
  ],

  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 8,
    },
  },

  pagination: {
    maxTotalHits: 1000,
  },

  faceting: {
    maxValuesPerFacet: 100,
  },
};

/**
 * Collection Index Configuration
 */
export const COLLECTION_INDEX_SETTINGS: IndexSettings = {
  searchableAttributes: [
    'title',
    'handle',
    'metadata.description',
  ],

  filterableAttributes: [
    'id',
    'handle',
    'product_count',
    'created_at',
  ],

  sortableAttributes: [
    'title',
    'product_count',
    'created_at',
  ],

  typoTolerance: {
    enabled: true,
  },
};

/**
 * Get index settings by name
 */
export function getIndexSettings(indexName: IndexName): IndexSettings {
  switch (indexName) {
    case INDEX_NAMES.PRODUCTS:
      return PRODUCT_INDEX_SETTINGS;
    case INDEX_NAMES.CATEGORIES:
      return CATEGORY_INDEX_SETTINGS;
    case INDEX_NAMES.MARQUES:
      return MARQUES_INDEX_SETTINGS;
    case INDEX_NAMES.COLLECTIONS:
      return COLLECTION_INDEX_SETTINGS;
    default:
      throw new Error(`Unknown index: ${indexName}`);
  }
}

export default {
  INDEX_NAMES,
  PRODUCT_INDEX_SETTINGS,
  CATEGORY_INDEX_SETTINGS,
  MARQUES_INDEX_SETTINGS,
  COLLECTION_INDEX_SETTINGS,
  getIndexSettings,
};
