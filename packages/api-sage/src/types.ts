/**
 * Sage-specific types
 *
 * Includes types from Proconsult WebServices and simplified Sage API responses.
 */

import type { ApiClientConfig } from "@maison/api-core";

/**
 * Sage API client configuration
 */
export interface SageConfig extends ApiClientConfig {
  /** Sage company ID */
  readonly companyId: string;
  /** Sage API version */
  readonly apiVersion?: string;
  /** Currency code (default: EUR) */
  readonly currency?: string;
}

// ============================================
// Sage Raw Types from Proconsult WebServices
// ============================================

/**
 * Sage statistique article (Collection, Style, etc.)
 */
export interface SageStatistiqueArticle {
  Intitule: string;
  IdStatistique: number;
  Valeur: string;
}

/**
 * Sage infos libres article
 */
export interface SageInfoLibre {
  Name: string;
  Type: number;
  Size: number;
  EstCalculee: boolean;
  Value: string | number | null;
}

/**
 * Raw article from Sage/Proconsult API
 */
export interface SageRawArticle {
  __type: string;
  Reference: string;
  Intitule: string;
  CodeFamille: string;
  TypeArticle: number;

  // Prices
  PrixAchat: number;
  PrixUnitaireNet: number;
  PrixVente: number;
  Coefficient: number;
  EstEnPrixTTTC: boolean;

  // Physical characteristics
  PoidsNet: number;
  PoidsBrut: number;
  UnitePoids: number;
  Garantie: number;
  Pays: string;

  // Management
  IdUniteVente: number;
  TypeSuiviStock: number;
  Fictif: boolean;
  EstEnSommeil: boolean;
  Publie: boolean;
  InterdireCommande: boolean;
  ExclureReapprovisionnement: boolean;

  // Descriptions
  Langue1?: string;
  Langue2?: string;

  // Identifiers
  CodeBarres?: string;
  Photo?: string;

  // Categories/Catalogs
  IdCatalogue1: number;
  IdCatalogue2: number;
  IdCatalogue3: number;
  IdCatalogue4: number;

  // Statistics
  Statistique1: string;
  Statistique2: string;
  Statistique3: string;
  Statistique4: string;
  Statistique5: string;
  StatistiqueArticles?: SageStatistiqueArticle[];

  // Free fields
  InfosLibres?: SageInfoLibre[];

  // Dates
  DateCreation: string;
  DateModification: string;

  // Internal
  Createur: string;
  UtilisateurCreateur: string;
}

/**
 * Raw family/category from Sage API
 */
export interface SageRawFamille {
  CodeFamille: string;
  Intitule: string;
  TypeFamille: number;
  Createur: string;
  DateModification: string;
  DateCreation: string;
  UtilisateurCreateur: string;
}

// ============================================
// Simplified Sage API Types
// ============================================

/**
 * Sage product representation (simplified)
 */
export interface SageProduct {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly currency: string;
  readonly category?: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Sage inventory item
 */
export interface SageInventory {
  readonly productId: string;
  readonly sku: string;
  readonly quantity: number;
  readonly reservedQuantity: number;
  readonly availableQuantity: number;
  readonly warehouseId: string;
  readonly lastUpdated: string;
}

// ============================================
// API Response Types
// ============================================

/**
 * Sage API response for products list
 */
export interface SageProductsResponse {
  readonly products: readonly SageProduct[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Sage API response for articles list (Proconsult format)
 */
export interface SageArticlesResponse {
  readonly articles: readonly SageRawArticle[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Sage API response for inventory
 */
export interface SageInventoryResponse {
  readonly inventory: readonly SageInventory[];
  readonly lastSyncedAt: string;
}

/**
 * Sage sync result
 */
export interface SageSyncResult {
  readonly synced: number;
  readonly errors: readonly string[];
  readonly timestamp: string;
}
