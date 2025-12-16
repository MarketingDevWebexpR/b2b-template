/**
 * Configuration par defaut des Feature Flags
 *
 * Cette configuration active toutes les fonctionnalites par defaut.
 * Les clients peuvent override cette config via le back-office Medusa.
 *
 * @packageDocumentation
 */

import type { FeaturesConfig } from '@maison/types';

/**
 * Configuration par defaut - Toutes les fonctionnalites activees
 */
export const defaultFeaturesConfig: FeaturesConfig = {
  // ============================================================================
  // Catalog Module - Gestion du catalogue produits
  // ============================================================================
  catalog: {
    enabled: true,
    subFeatures: {
      search: {
        enabled: true,
        config: {
          minChars: 2,
          debounceMs: 300,
          showSuggestions: true,
        },
      },
      filters: {
        enabled: true,
        config: {
          showCounts: true,
          maxFilters: 10,
          collapsible: true,
        },
      },
      sorting: {
        enabled: true,
        config: {
          defaultSort: 'relevance',
          options: ['relevance', 'price-asc', 'price-desc', 'name', 'newest'],
        },
      },
      quickView: {
        enabled: true,
      },
      comparison: {
        enabled: true,
        config: {
          maxItems: 4,
        },
      },
      bulkActions: {
        enabled: true,
      },
    },
  },

  // ============================================================================
  // Cart Module - Gestion du panier
  // ============================================================================
  cart: {
    enabled: true,
    subFeatures: {
      quickAdd: {
        enabled: true,
      },
      bulkAdd: {
        enabled: true,
      },
      savedCarts: {
        enabled: true,
        config: {
          maxSavedCarts: 5,
        },
      },
      notes: {
        enabled: true,
      },
      quantityRules: {
        enabled: true,
        config: {
          minQuantity: 1,
          stepQuantity: 1,
          enforceMultiples: false,
        },
      },
    },
  },

  // ============================================================================
  // Checkout Module - Tunnel de commande
  // ============================================================================
  checkout: {
    enabled: true,
    subFeatures: {
      guestCheckout: {
        enabled: false, // B2B: login requis par defaut
      },
      multipleAddresses: {
        enabled: true,
      },
      splitShipment: {
        enabled: true,
      },
      orderNotes: {
        enabled: true,
      },
    },
  },

  // ============================================================================
  // Orders Module - Gestion des commandes
  // ============================================================================
  orders: {
    enabled: true,
    subFeatures: {
      reorder: {
        enabled: true,
      },
      tracking: {
        enabled: true,
      },
      exportPdf: {
        enabled: true,
      },
      orderHistory: {
        enabled: true,
        config: {
          defaultPeriod: '6months',
          maxResults: 100,
        },
      },
    },
  },

  // ============================================================================
  // Quotes Module - Systeme de devis
  // ============================================================================
  quotes: {
    enabled: true,
    subFeatures: {
      requestQuote: {
        enabled: true,
      },
      negotiation: {
        enabled: true,
      },
      quoteToOrder: {
        enabled: true,
      },
      expirationAlerts: {
        enabled: true,
        config: {
          alertDaysBefore: 3,
        },
      },
    },
  },

  // ============================================================================
  // Approvals Module - Workflow d'approbation
  // ============================================================================
  approvals: {
    enabled: true,
    subFeatures: {
      multiLevel: {
        enabled: true,
        config: {
          maxLevels: 3,
        },
      },
      budgetLimits: {
        enabled: true,
      },
      notifications: {
        enabled: true,
      },
      delegation: {
        enabled: true,
      },
    },
  },

  // ============================================================================
  // Company Module - Gestion de l'entreprise
  // ============================================================================
  company: {
    enabled: true,
    subFeatures: {
      employees: {
        enabled: true,
        config: {
          maxEmployees: 50,
        },
      },
      roles: {
        enabled: true,
      },
      addresses: {
        enabled: true,
        config: {
          maxAddresses: 10,
        },
      },
      budgets: {
        enabled: true,
      },
      departments: {
        enabled: true,
      },
    },
  },

  // ============================================================================
  // Lists Module - Listes de produits
  // ============================================================================
  lists: {
    enabled: true,
    subFeatures: {
      wishlist: {
        enabled: true,
      },
      favorites: {
        enabled: true,
      },
      sharedLists: {
        enabled: true,
      },
      purchaseLists: {
        enabled: true,
        config: {
          maxLists: 20,
        },
      },
    },
  },

  // ============================================================================
  // Comparison Module - Comparaison de produits
  // ============================================================================
  comparison: {
    enabled: true,
    subFeatures: {
      compareTable: {
        enabled: true,
      },
      export: {
        enabled: true,
      },
      maxItems: {
        enabled: true,
        config: {
          max: 4,
        },
      },
    },
  },

  // ============================================================================
  // Dashboard Module - Tableau de bord
  // ============================================================================
  dashboard: {
    enabled: true,
    subFeatures: {
      analytics: {
        enabled: true,
      },
      quickActions: {
        enabled: true,
      },
      recentOrders: {
        enabled: true,
        config: {
          count: 5,
        },
      },
      pendingQuotes: {
        enabled: true,
      },
    },
  },

  // ============================================================================
  // QuickOrder Module - Commande rapide
  // ============================================================================
  quickOrder: {
    enabled: true,
    subFeatures: {
      skuEntry: {
        enabled: true,
      },
      csvImport: {
        enabled: true,
      },
      pastOrders: {
        enabled: true,
      },
      templates: {
        enabled: true,
        config: {
          maxTemplates: 10,
        },
      },
    },
  },

  // ============================================================================
  // Warehouse Module - Multi-entrepot
  // ============================================================================
  warehouse: {
    enabled: true,
    subFeatures: {
      stockVisibility: {
        enabled: true,
      },
      warehouseSelection: {
        enabled: true,
      },
      deliveryEstimates: {
        enabled: true,
      },
    },
  },
};

/**
 * Configuration "Basic" - E-commerce simple sans features avancees
 */
export const basicFeaturesConfig: Partial<FeaturesConfig> = {
  quotes: { enabled: false, subFeatures: {} as never },
  approvals: { enabled: false, subFeatures: {} as never },
  quickOrder: { enabled: false, subFeatures: {} as never },
  warehouse: { enabled: false, subFeatures: {} as never },
  company: {
    enabled: true,
    subFeatures: {
      employees: { enabled: false },
      roles: { enabled: false },
      addresses: { enabled: true },
      budgets: { enabled: false },
      departments: { enabled: false },
    },
  },
};

/**
 * Configuration "Enterprise" - Toutes les fonctionnalites avec limites etendues
 */
export const enterpriseFeaturesConfig: Partial<FeaturesConfig> = {
  approvals: {
    enabled: true,
    subFeatures: {
      multiLevel: { enabled: true, config: { maxLevels: 5 } },
      budgetLimits: { enabled: true },
      notifications: { enabled: true },
      delegation: { enabled: true },
    },
  },
  company: {
    enabled: true,
    subFeatures: {
      employees: { enabled: true, config: { maxEmployees: 200 } },
      roles: { enabled: true },
      addresses: { enabled: true, config: { maxAddresses: 50 } },
      budgets: { enabled: true },
      departments: { enabled: true },
    },
  },
};
