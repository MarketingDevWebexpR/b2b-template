// ============================================
// Feature Flags Types - Systeme Modulaire B2B
// ============================================

/**
 * Configuration de base pour une sous-fonctionnalite.
 * Chaque sous-feature peut etre activee/desactivee et avoir une config specifique.
 */
export interface SubFeatureConfig {
  enabled: boolean;
  config?: Record<string, unknown>;
}

/**
 * Configuration de base pour un module.
 * Un module regroupe plusieurs sous-fonctionnalites liees.
 */
export interface ModuleConfig<T = Record<string, SubFeatureConfig>> {
  enabled: boolean;
  subFeatures: T;
}

// ============================================
// Sous-features par Module
// ============================================

/**
 * Catalog Module - Gestion du catalogue produits
 */
export interface CatalogSubFeatures {
  /** Barre de recherche produits */
  search: SubFeatureConfig & {
    config?: {
      minChars?: number;
      debounceMs?: number;
      showSuggestions?: boolean;
    };
  };
  /** Filtres de recherche */
  filters: SubFeatureConfig & {
    config?: {
      showCounts?: boolean;
      maxFilters?: number;
      collapsible?: boolean;
    };
  };
  /** Options de tri */
  sorting: SubFeatureConfig & {
    config?: {
      defaultSort?: string;
      options?: string[];
    };
  };
  /** Apercu rapide produit */
  quickView: SubFeatureConfig;
  /** Comparaison de produits */
  comparison: SubFeatureConfig & {
    config?: {
      maxItems?: number;
    };
  };
  /** Actions groupees (selection multiple) */
  bulkActions: SubFeatureConfig;
}

/**
 * Cart Module - Gestion du panier
 */
export interface CartSubFeatures {
  /** Ajout rapide au panier */
  quickAdd: SubFeatureConfig;
  /** Ajout en masse (CSV, liste SKU) */
  bulkAdd: SubFeatureConfig;
  /** Paniers sauvegardes */
  savedCarts: SubFeatureConfig & {
    config?: {
      maxSavedCarts?: number;
    };
  };
  /** Notes sur les lignes panier */
  notes: SubFeatureConfig;
  /** Regles de quantite (min, step, multiples) */
  quantityRules: SubFeatureConfig & {
    config?: {
      minQuantity?: number;
      stepQuantity?: number;
      enforceMultiples?: boolean;
    };
  };
}

/**
 * Checkout Module - Tunnel de commande
 */
export interface CheckoutSubFeatures {
  /** Commande sans compte (invité) */
  guestCheckout: SubFeatureConfig;
  /** Plusieurs adresses de livraison */
  multipleAddresses: SubFeatureConfig;
  /** Livraison fractionnee */
  splitShipment: SubFeatureConfig;
  /** Notes de commande */
  orderNotes: SubFeatureConfig;
}

/**
 * Orders Module - Gestion des commandes
 */
export interface OrdersSubFeatures {
  /** Recommander une commande */
  reorder: SubFeatureConfig;
  /** Suivi de livraison */
  tracking: SubFeatureConfig;
  /** Export PDF */
  exportPdf: SubFeatureConfig;
  /** Historique des commandes */
  orderHistory: SubFeatureConfig & {
    config?: {
      defaultPeriod?: '3months' | '6months' | '1year' | 'all';
      maxResults?: number;
    };
  };
}

/**
 * Quotes Module - Systeme de devis
 */
export interface QuotesSubFeatures {
  /** Demande de devis */
  requestQuote: SubFeatureConfig;
  /** Negociation (contre-propositions) */
  negotiation: SubFeatureConfig;
  /** Conversion devis en commande */
  quoteToOrder: SubFeatureConfig;
  /** Alertes d'expiration */
  expirationAlerts: SubFeatureConfig & {
    config?: {
      alertDaysBefore?: number;
    };
  };
}

/**
 * Approvals Module - Workflow d'approbation
 */
export interface ApprovalsSubFeatures {
  /** Approbation multi-niveaux */
  multiLevel: SubFeatureConfig & {
    config?: {
      maxLevels?: number;
    };
  };
  /** Limites budgetaires */
  budgetLimits: SubFeatureConfig;
  /** Notifications d'approbation */
  notifications: SubFeatureConfig;
  /** Delegation d'approbation */
  delegation: SubFeatureConfig;
}

/**
 * Company Module - Gestion de l'entreprise
 */
export interface CompanySubFeatures {
  /** Gestion des employes */
  employees: SubFeatureConfig & {
    config?: {
      maxEmployees?: number;
    };
  };
  /** Roles et permissions */
  roles: SubFeatureConfig;
  /** Adresses multiples */
  addresses: SubFeatureConfig & {
    config?: {
      maxAddresses?: number;
    };
  };
  /** Budgets par departement/employe */
  budgets: SubFeatureConfig;
  /** Departements/services */
  departments: SubFeatureConfig;
}

/**
 * Lists Module - Listes de produits
 */
export interface ListsSubFeatures {
  /** Liste de souhaits */
  wishlist: SubFeatureConfig;
  /** Favoris rapides */
  favorites: SubFeatureConfig;
  /** Listes partagees */
  sharedLists: SubFeatureConfig;
  /** Listes d'achat recurrentes */
  purchaseLists: SubFeatureConfig & {
    config?: {
      maxLists?: number;
    };
  };
}

/**
 * Comparison Module - Comparaison de produits
 */
export interface ComparisonSubFeatures {
  /** Tableau de comparaison */
  compareTable: SubFeatureConfig;
  /** Export de la comparaison */
  export: SubFeatureConfig;
  /** Limite du nombre de produits */
  maxItems: SubFeatureConfig & {
    config?: {
      max?: number;
    };
  };
}

/**
 * Dashboard Module - Tableau de bord
 */
export interface DashboardSubFeatures {
  /** Statistiques et analytics */
  analytics: SubFeatureConfig;
  /** Actions rapides */
  quickActions: SubFeatureConfig;
  /** Commandes recentes */
  recentOrders: SubFeatureConfig & {
    config?: {
      count?: number;
    };
  };
  /** Devis en attente */
  pendingQuotes: SubFeatureConfig;
}

/**
 * QuickOrder Module - Commande rapide
 */
export interface QuickOrderSubFeatures {
  /** Saisie par SKU */
  skuEntry: SubFeatureConfig;
  /** Import CSV */
  csvImport: SubFeatureConfig;
  /** Depuis commandes passees */
  pastOrders: SubFeatureConfig;
  /** Templates de commande */
  templates: SubFeatureConfig & {
    config?: {
      maxTemplates?: number;
    };
  };
}

/**
 * Warehouse Module - Multi-entrepot
 */
export interface WarehouseSubFeatures {
  /** Visibilite du stock par entrepot */
  stockVisibility: SubFeatureConfig;
  /** Selection de l'entrepot */
  warehouseSelection: SubFeatureConfig;
  /** Estimations de livraison */
  deliveryEstimates: SubFeatureConfig;
}

// ============================================
// Configuration Complete des Features
// ============================================

/**
 * Configuration complete de tous les modules et leurs sous-fonctionnalites.
 * Cette interface est utilisee par le FeatureProvider pour gerer l'etat.
 */
export interface FeaturesConfig {
  /** Catalogue produits */
  catalog: ModuleConfig<CatalogSubFeatures>;
  /** Panier */
  cart: ModuleConfig<CartSubFeatures>;
  /** Tunnel de commande */
  checkout: ModuleConfig<CheckoutSubFeatures>;
  /** Gestion des commandes */
  orders: ModuleConfig<OrdersSubFeatures>;
  /** Systeme de devis */
  quotes: ModuleConfig<QuotesSubFeatures>;
  /** Workflow d'approbation */
  approvals: ModuleConfig<ApprovalsSubFeatures>;
  /** Gestion de l'entreprise */
  company: ModuleConfig<CompanySubFeatures>;
  /** Listes de produits */
  lists: ModuleConfig<ListsSubFeatures>;
  /** Comparaison de produits */
  comparison: ModuleConfig<ComparisonSubFeatures>;
  /** Tableau de bord */
  dashboard: ModuleConfig<DashboardSubFeatures>;
  /** Commande rapide */
  quickOrder: ModuleConfig<QuickOrderSubFeatures>;
  /** Multi-entrepot */
  warehouse: ModuleConfig<WarehouseSubFeatures>;
}

// ============================================
// Types Utilitaires
// ============================================

/** Nom d'un module (cle de FeaturesConfig) */
export type ModuleName = keyof FeaturesConfig;

/** Nom d'une sous-fonctionnalite pour un module donne */
export type SubFeatureName<M extends ModuleName> = keyof FeaturesConfig[M]['subFeatures'];

/** Configuration d'une sous-fonctionnalite pour un module donne */
export type SubFeatureConfigOf<M extends ModuleName, S extends SubFeatureName<M>> =
  FeaturesConfig[M]['subFeatures'][S];

/** Configuration partielle pour les overrides */
export type PartialFeaturesConfig = {
  [K in ModuleName]?: Partial<ModuleConfig<Partial<FeaturesConfig[K]['subFeatures']>>>;
};

// ============================================
// Types pour le Chargement de Configuration
// ============================================

/** Source de la configuration */
export type FeaturesSource = 'local' | 'medusa' | 'env';

/** Options du loader de configuration */
export interface FeaturesLoaderOptions {
  source: FeaturesSource;
  clientId?: string;
  fallbackToDefault?: boolean;
}

/** Reponse du loader de configuration */
export interface FeaturesLoaderResponse {
  config: FeaturesConfig;
  source: FeaturesSource;
  loadedAt: string;
  clientId?: string;
}
