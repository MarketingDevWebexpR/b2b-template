'use client';

/**
 * B2B Wishlist Context
 *
 * Provides multi-list wishlist management for B2B users:
 * - Create, update, delete multiple lists
 * - Add/remove products with suggested quantities
 * - Share lists with collaborators
 * - Sync with localStorage + API
 *
 * @packageDocumentation
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Product } from '@/types';
import type {
  WishlistB2B,
  WishlistSummary,
  WishlistItemB2B,
  WishlistCollaborator,
  WishlistVisibility,
  WishlistPermission,
  WishlistTemplate,
  CreateWishlistInput,
  UpdateWishlistInput,
  AddWishlistItemInput,
  ShareWishlistInput,
  WishlistFilters,
} from '@maison/types';

// ============================================================================
// Constants
// ============================================================================

const WISHLISTS_STORAGE_KEY = 'bijoux-wishlists-b2b';
const DEFAULT_FAVORITES_ID = 'favorites-default';

// ============================================================================
// Mock Data
// ============================================================================

const createDefaultFavorites = (employeeId: string, employeeName: string): WishlistB2B => ({
  id: DEFAULT_FAVORITES_ID,
  companyId: 'comp_001',
  name: 'Mes Favoris',
  description: 'Liste de favoris par defaut',
  visibility: 'private',
  template: 'favorites',
  isDefault: true,
  items: [],
  itemCount: 0,
  estimatedTotal: 0,
  currency: 'EUR',
  previewImages: [],
  collaborators: [],
  createdAt: new Date().toISOString(),
  createdBy: employeeId,
  createdByName: employeeName,
  updatedAt: new Date().toISOString(),
  lastUpdatedBy: employeeId,
  lastUpdatedByName: employeeName,
});

const mockWishlists: WishlistB2B[] = [
  {
    id: 'list_001',
    companyId: 'comp_001',
    name: 'Collection Printemps 2025',
    description: 'Selection pour la nouvelle saison',
    visibility: 'shared',
    template: 'seasonal_spring',
    isDefault: false,
    items: [
      {
        id: 'item_001',
        productId: 'prod_001',
        productReference: 'BRA-001',
        productName: 'Bracelet Or 18K - Maille Figaro',
        productImage: '/images/products/bracelet-or-figaro.jpg',
        currentPrice: 450,
        priceWhenAdded: 450,
        currency: 'EUR',
        suggestedQuantity: 10,
        stockAvailable: 25,
        isAvailable: true,
        addedAt: '2024-12-10T10:00:00Z',
        addedBy: 'emp_001',
        addedByName: 'Marie Dupont',
      },
      {
        id: 'item_002',
        productId: 'prod_003',
        productReference: 'COL-001',
        productName: 'Collier Or 18K - Pendentif Coeur',
        productImage: '/images/products/collier-or-coeur.jpg',
        currentPrice: 680,
        priceWhenAdded: 680,
        currency: 'EUR',
        suggestedQuantity: 5,
        stockAvailable: 15,
        isAvailable: true,
        addedAt: '2024-12-10T10:05:00Z',
        addedBy: 'emp_001',
        addedByName: 'Marie Dupont',
      },
    ],
    itemCount: 2,
    estimatedTotal: 7900,
    currency: 'EUR',
    previewImages: [
      '/images/products/bracelet-or-figaro.jpg',
      '/images/products/collier-or-coeur.jpg',
    ],
    collaborators: [
      {
        id: 'collab_001',
        employeeId: 'emp_002',
        email: 'pierre.martin@bijouterie-parisienne.fr',
        name: 'Pierre Martin',
        permission: 'edit',
        isPending: false,
        grantedAt: '2024-12-10T12:00:00Z',
        grantedBy: 'emp_001',
      },
    ],
    createdAt: '2024-12-10T10:00:00Z',
    createdBy: 'emp_001',
    createdByName: 'Marie Dupont',
    updatedAt: '2024-12-14T16:30:00Z',
    lastUpdatedBy: 'emp_002',
    lastUpdatedByName: 'Pierre Martin',
  },
  {
    id: 'list_002',
    companyId: 'comp_001',
    name: 'Reapprovisionnement Decembre',
    description: 'Articles a commander pour les fetes',
    visibility: 'private',
    template: 'reorder',
    isDefault: false,
    items: [
      {
        id: 'item_003',
        productId: 'prod_005',
        productReference: 'BAG-001',
        productName: 'Bague Or Blanc - Solitaire Diamant',
        productImage: '/images/products/bague-or-blanc-solitaire.jpg',
        currentPrice: 1200,
        priceWhenAdded: 1150,
        currency: 'EUR',
        suggestedQuantity: 3,
        stockAvailable: 8,
        isAvailable: true,
        notes: 'Modele tres demande',
        addedAt: '2024-12-05T14:00:00Z',
        addedBy: 'emp_001',
        addedByName: 'Marie Dupont',
      },
    ],
    itemCount: 1,
    estimatedTotal: 3600,
    currency: 'EUR',
    previewImages: ['/images/products/bague-or-blanc-solitaire.jpg'],
    collaborators: [],
    createdAt: '2024-12-05T14:00:00Z',
    createdBy: 'emp_001',
    createdByName: 'Marie Dupont',
    updatedAt: '2024-12-05T14:00:00Z',
    lastUpdatedBy: 'emp_001',
    lastUpdatedByName: 'Marie Dupont',
  },
];

// ============================================================================
// Types
// ============================================================================

/**
 * Legacy Wishlist type for compatibility with simple wishlist consumers
 */
export interface LegacyWishlist {
  items: { product: Product }[];
  totalItems: number;
}

/**
 * Wishlist Context Type
 */
interface WishlistContextType {
  /** All wishlists */
  wishlists: WishlistB2B[];
  /** Wishlists summaries for list view */
  wishlistSummaries: WishlistSummary[];
  /** Default favorites list */
  defaultFavorites: WishlistB2B | null;
  /** Currently selected wishlist */
  selectedWishlist: WishlistB2B | null;
  /** Loading state */
  isLoading: boolean;
  /** Syncing state */
  isSyncing: boolean;
  /** Error state */
  error: Error | null;

  // Legacy API - Simple wishlist interface for compatibility
  /** Legacy wishlist object for simple consumers */
  wishlist: LegacyWishlist;
  /** Clear all items from default favorites (legacy alias) */
  clearWishlist: () => Promise<void>;
  /** Toggle product in favorites (legacy alias for toggleFavorite) */
  toggleWishlist: (product: Product) => Promise<void>;
  /** Check if product is in favorites (legacy alias for isFavorite) */
  isInWishlist: (productId: string) => boolean;

  // List operations
  /** Create a new wishlist */
  createWishlist: (input: CreateWishlistInput) => Promise<WishlistB2B>;
  /** Update a wishlist */
  updateWishlist: (listId: string, input: UpdateWishlistInput) => Promise<void>;
  /** Delete a wishlist */
  deleteWishlist: (listId: string) => Promise<void>;
  /** Duplicate a wishlist */
  duplicateWishlist: (listId: string, newName?: string) => Promise<WishlistB2B>;
  /** Get a wishlist by ID */
  getWishlist: (listId: string) => WishlistB2B | undefined;
  /** Select a wishlist for detail view */
  selectWishlist: (listId: string) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Filter wishlists */
  filterWishlists: (filters: WishlistFilters) => WishlistSummary[];

  // Item operations
  /** Add product to a list */
  addToList: (listId: string, product: Product, suggestedQuantity?: number, notes?: string) => Promise<void>;
  /** Remove product from a list */
  removeFromList: (listId: string, itemId: string) => Promise<void>;
  /** Update item in a list */
  updateItem: (listId: string, itemId: string, suggestedQuantity?: number, notes?: string) => Promise<void>;
  /** Check if product is in any list */
  isInAnyList: (productId: string) => boolean;
  /** Check if product is in specific list */
  isInList: (listId: string, productId: string) => boolean;
  /** Get lists containing a product */
  getListsContainingProduct: (productId: string) => WishlistSummary[];

  // Favorites shortcuts
  /** Toggle product in default favorites */
  toggleFavorite: (product: Product) => Promise<void>;
  /** Check if product is in favorites */
  isFavorite: (productId: string) => boolean;

  // Sharing operations
  /** Share a list with collaborators */
  shareList: (listId: string, input: ShareWishlistInput) => Promise<void>;
  /** Remove collaborator from list */
  removeCollaborator: (listId: string, collaboratorId: string) => Promise<void>;
  /** Update collaborator permission */
  updateCollaboratorPermission: (listId: string, collaboratorId: string, permission: WishlistPermission) => Promise<void>;
  /** Generate public link */
  generatePublicLink: (listId: string) => Promise<string>;
  /** Revoke public link */
  revokePublicLink: (listId: string) => Promise<void>;

  // Bulk operations
  /** Add all list items to cart */
  addListToCart: (listId: string, itemIds?: string[]) => Promise<void>;
  /** Clear all items from a list */
  clearList: (listId: string) => Promise<void>;

  // Sync
  /** Force sync with server */
  syncWithServer: () => Promise<void>;
  /** Refresh all lists */
  refreshWishlists: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateListTotals(items: WishlistItemB2B[]): { itemCount: number; estimatedTotal: number } {
  return items.reduce(
    (acc, item) => ({
      itemCount: acc.itemCount + 1,
      estimatedTotal: acc.estimatedTotal + item.currentPrice * item.suggestedQuantity,
    }),
    { itemCount: 0, estimatedTotal: 0 }
  );
}

function createWishlistSummary(list: WishlistB2B, currentEmployeeId: string): WishlistSummary {
  const isOwner = list.createdBy === currentEmployeeId;
  const myCollaboration = list.collaborators.find(
    (c) => c.employeeId === currentEmployeeId
  );

  return {
    id: list.id,
    name: list.name,
    description: list.description,
    visibility: list.visibility,
    template: list.template,
    isDefault: list.isDefault,
    itemCount: list.itemCount,
    estimatedTotal: list.estimatedTotal,
    currency: list.currency,
    previewImages: list.previewImages.slice(0, 4),
    collaboratorCount: list.collaborators.length,
    isOwner,
    isSharedWithMe: !isOwner && !!myCollaboration,
    myPermission: myCollaboration?.permission,
    updatedAt: list.updatedAt,
    lastUpdatedByName: list.lastUpdatedByName,
  };
}

function loadWishlistsFromStorage(): WishlistB2B[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(WISHLISTS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as WishlistB2B[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Erreur lors du chargement des listes:', error);
    return [];
  }
}

function saveWishlistsToStorage(wishlists: WishlistB2B[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(wishlists));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des listes:', error);
  }
}

// ============================================================================
// Provider Props
// ============================================================================

interface WishlistProviderProps {
  children: ReactNode;
  /** Current employee ID */
  employeeId?: string;
  /** Current employee name */
  employeeName?: string;
  /** Mock mode for development */
  mockMode?: boolean;
}

// ============================================================================
// Provider Component
// ============================================================================

export function WishlistProvider({
  children,
  employeeId = 'emp_001',
  employeeName = 'Marie Dupont',
  mockMode = true,
}: WishlistProviderProps) {
  const [wishlists, setWishlists] = useState<WishlistB2B[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistB2B | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load wishlists on mount
  useEffect(() => {
    const loadWishlists = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (mockMode) {
          // Load from localStorage first
          const storedLists = loadWishlistsFromStorage();

          if (storedLists.length > 0) {
            setWishlists(storedLists);
          } else {
            // Initialize with mock data and default favorites
            const defaultFav = createDefaultFavorites(employeeId, employeeName);
            const initialLists = [defaultFav, ...mockWishlists];
            setWishlists(initialLists);
            saveWishlistsToStorage(initialLists);
          }
        } else {
          // TODO: Fetch from API
          const storedLists = loadWishlistsFromStorage();
          if (storedLists.length > 0) {
            setWishlists(storedLists);
          }
        }
      } catch (err) {
        console.error('Failed to load wishlists:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlists();
  }, [mockMode, employeeId, employeeName]);

  // Save to localStorage when wishlists change
  useEffect(() => {
    if (!isLoading && wishlists.length > 0) {
      saveWishlistsToStorage(wishlists);
    }
  }, [wishlists, isLoading]);

  // Derived: default favorites list
  const defaultFavorites = useMemo(() => {
    return wishlists.find((list) => list.isDefault && list.template === 'favorites') || null;
  }, [wishlists]);

  // Derived: wishlist summaries
  const wishlistSummaries = useMemo(() => {
    return wishlists.map((list) => createWishlistSummary(list, employeeId));
  }, [wishlists, employeeId]);

  // =========================================================================
  // List Operations
  // =========================================================================

  const createWishlist = useCallback(
    async (input: CreateWishlistInput): Promise<WishlistB2B> => {
      const now = new Date().toISOString();
      const newList: WishlistB2B = {
        id: generateId('list'),
        companyId: 'comp_001',
        name: input.name,
        description: input.description,
        visibility: input.visibility || 'private',
        template: input.template || 'custom',
        isDefault: false,
        items: [],
        itemCount: 0,
        estimatedTotal: 0,
        currency: 'EUR',
        previewImages: [],
        collaborators: [],
        createdAt: now,
        createdBy: employeeId,
        createdByName: employeeName,
        updatedAt: now,
        lastUpdatedBy: employeeId,
        lastUpdatedByName: employeeName,
      };

      setWishlists((prev) => [...prev, newList]);
      return newList;
    },
    [employeeId, employeeName]
  );

  const updateWishlist = useCallback(
    async (listId: string, input: UpdateWishlistInput): Promise<void> => {
      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;
          return {
            ...list,
            ...input,
            updatedAt: new Date().toISOString(),
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  const deleteWishlist = useCallback(async (listId: string): Promise<void> => {
    setWishlists((prev) => prev.filter((list) => list.id !== listId && !list.isDefault));
    if (selectedWishlist?.id === listId) {
      setSelectedWishlist(null);
    }
  }, [selectedWishlist]);

  const duplicateWishlist = useCallback(
    async (listId: string, newName?: string): Promise<WishlistB2B> => {
      const original = wishlists.find((list) => list.id === listId);
      if (!original) {
        throw new Error('Liste non trouvee');
      }

      const now = new Date().toISOString();
      const duplicated: WishlistB2B = {
        ...original,
        id: generateId('list'),
        name: newName || `${original.name} (copie)`,
        isDefault: false,
        collaborators: [],
        publicShareLink: undefined,
        visibility: 'private',
        createdAt: now,
        createdBy: employeeId,
        createdByName: employeeName,
        updatedAt: now,
        lastUpdatedBy: employeeId,
        lastUpdatedByName: employeeName,
        items: original.items.map((item) => ({
          ...item,
          id: generateId('item'),
          addedAt: now,
          addedBy: employeeId,
          addedByName: employeeName,
        })),
      };

      setWishlists((prev) => [...prev, duplicated]);
      return duplicated;
    },
    [wishlists, employeeId, employeeName]
  );

  const getWishlist = useCallback(
    (listId: string): WishlistB2B | undefined => {
      return wishlists.find((list) => list.id === listId);
    },
    [wishlists]
  );

  const selectWishlist = useCallback(
    (listId: string): void => {
      const list = wishlists.find((l) => l.id === listId);
      setSelectedWishlist(list || null);
    },
    [wishlists]
  );

  const clearSelection = useCallback((): void => {
    setSelectedWishlist(null);
  }, []);

  const filterWishlists = useCallback(
    (filters: WishlistFilters): WishlistSummary[] => {
      return wishlistSummaries.filter((summary) => {
        if (filters.visibility && summary.visibility !== filters.visibility) {
          return false;
        }
        if (filters.template && summary.template !== filters.template) {
          return false;
        }
        if (filters.ownership === 'mine' && !summary.isOwner) {
          return false;
        }
        if (filters.ownership === 'shared' && !summary.isSharedWithMe) {
          return false;
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            summary.name.toLowerCase().includes(searchLower) ||
            summary.description?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });
    },
    [wishlistSummaries]
  );

  // =========================================================================
  // Item Operations
  // =========================================================================

  const addToList = useCallback(
    async (
      listId: string,
      product: Product,
      suggestedQuantity: number = 1,
      notes?: string
    ): Promise<void> => {
      const now = new Date().toISOString();

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;

          // Check if product already in list
          const existingItem = list.items.find((item) => item.productId === product.id);
          if (existingItem) {
            // Update quantity
            const updatedItems = list.items.map((item) =>
              item.productId === product.id
                ? { ...item, suggestedQuantity: item.suggestedQuantity + suggestedQuantity }
                : item
            );
            const totals = calculateListTotals(updatedItems);
            return {
              ...list,
              items: updatedItems,
              ...totals,
              previewImages: updatedItems.slice(0, 4).map((i) => i.productImage),
              updatedAt: now,
              lastUpdatedBy: employeeId,
              lastUpdatedByName: employeeName,
            };
          }

          // Add new item
          const newItem: WishlistItemB2B = {
            id: generateId('item'),
            productId: product.id,
            productReference: product.reference,
            productName: product.name,
            productImage: product.images[0] || '/images/placeholder.jpg',
            currentPrice: product.price,
            priceWhenAdded: product.price,
            currency: 'EUR',
            suggestedQuantity,
            stockAvailable: product.stock,
            isAvailable: product.isAvailable,
            notes,
            addedAt: now,
            addedBy: employeeId,
            addedByName: employeeName,
          };

          const updatedItems = [...list.items, newItem];
          const totals = calculateListTotals(updatedItems);

          return {
            ...list,
            items: updatedItems,
            ...totals,
            previewImages: updatedItems.slice(0, 4).map((i) => i.productImage),
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  const removeFromList = useCallback(
    async (listId: string, itemId: string): Promise<void> => {
      const now = new Date().toISOString();

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;

          const updatedItems = list.items.filter((item) => item.id !== itemId);
          const totals = calculateListTotals(updatedItems);

          return {
            ...list,
            items: updatedItems,
            ...totals,
            previewImages: updatedItems.slice(0, 4).map((i) => i.productImage),
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  const updateItem = useCallback(
    async (
      listId: string,
      itemId: string,
      suggestedQuantity?: number,
      notes?: string
    ): Promise<void> => {
      const now = new Date().toISOString();

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;

          const updatedItems = list.items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              ...(suggestedQuantity !== undefined && { suggestedQuantity }),
              ...(notes !== undefined && { notes }),
            };
          });

          const totals = calculateListTotals(updatedItems);

          return {
            ...list,
            items: updatedItems,
            ...totals,
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  const isInAnyList = useCallback(
    (productId: string): boolean => {
      return wishlists.some((list) =>
        list.items.some((item) => item.productId === productId)
      );
    },
    [wishlists]
  );

  const isInList = useCallback(
    (listId: string, productId: string): boolean => {
      const list = wishlists.find((l) => l.id === listId);
      return list?.items.some((item) => item.productId === productId) || false;
    },
    [wishlists]
  );

  const getListsContainingProduct = useCallback(
    (productId: string): WishlistSummary[] => {
      return wishlistSummaries.filter((summary) => {
        const list = wishlists.find((l) => l.id === summary.id);
        return list?.items.some((item) => item.productId === productId);
      });
    },
    [wishlists, wishlistSummaries]
  );

  // =========================================================================
  // Favorites Shortcuts
  // =========================================================================

  const toggleFavorite = useCallback(
    async (product: Product): Promise<void> => {
      if (!defaultFavorites) {
        // Create default favorites list if it doesn't exist
        const newFavorites = createDefaultFavorites(employeeId, employeeName);
        setWishlists((prev) => [newFavorites, ...prev]);
        await addToList(newFavorites.id, product);
        return;
      }

      const existingItem = defaultFavorites.items.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        await removeFromList(defaultFavorites.id, existingItem.id);
      } else {
        await addToList(defaultFavorites.id, product);
      }
    },
    [defaultFavorites, employeeId, employeeName, addToList, removeFromList]
  );

  const isFavorite = useCallback(
    (productId: string): boolean => {
      if (!defaultFavorites) return false;
      return defaultFavorites.items.some((item) => item.productId === productId);
    },
    [defaultFavorites]
  );

  // =========================================================================
  // Sharing Operations
  // =========================================================================

  const shareList = useCallback(
    async (listId: string, input: ShareWishlistInput): Promise<void> => {
      const now = new Date().toISOString();

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;

          const newCollaborators: WishlistCollaborator[] = input.emails.map((email) => ({
            id: generateId('collab'),
            email,
            name: email.split('@')[0],
            permission: input.permission,
            isPending: true,
            grantedAt: now,
            grantedBy: employeeId,
          }));

          return {
            ...list,
            visibility: 'shared',
            collaborators: [...list.collaborators, ...newCollaborators],
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  const removeCollaborator = useCallback(
    async (listId: string, collaboratorId: string): Promise<void> => {
      const now = new Date().toISOString();

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;

          const updatedCollaborators = list.collaborators.filter(
            (c) => c.id !== collaboratorId
          );

          return {
            ...list,
            visibility: updatedCollaborators.length === 0 ? 'private' : list.visibility,
            collaborators: updatedCollaborators,
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  const updateCollaboratorPermission = useCallback(
    async (
      listId: string,
      collaboratorId: string,
      permission: WishlistPermission
    ): Promise<void> => {
      const now = new Date().toISOString();

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;

          const updatedCollaborators = list.collaborators.map((c) =>
            c.id === collaboratorId ? { ...c, permission } : c
          );

          return {
            ...list,
            collaborators: updatedCollaborators,
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  const generatePublicLink = useCallback(
    async (listId: string): Promise<string> => {
      const now = new Date().toISOString();
      const publicLink = `https://bijouterie.fr/listes/public/${listId}?token=${generateId('token')}`;

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;
          return {
            ...list,
            visibility: 'public',
            publicShareLink: publicLink,
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );

      return publicLink;
    },
    [employeeId, employeeName]
  );

  const revokePublicLink = useCallback(
    async (listId: string): Promise<void> => {
      const now = new Date().toISOString();

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;
          return {
            ...list,
            visibility: list.collaborators.length > 0 ? 'shared' : 'private',
            publicShareLink: undefined,
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  // =========================================================================
  // Bulk Operations
  // =========================================================================

  const addListToCart = useCallback(
    async (listId: string, itemIds?: string[]): Promise<void> => {
      const list = wishlists.find((l) => l.id === listId);
      if (!list) return;

      const itemsToAdd = itemIds
        ? list.items.filter((item) => itemIds.includes(item.id))
        : list.items;

      // TODO: Integrate with CartContext
      console.log('Adding to cart:', itemsToAdd);
    },
    [wishlists]
  );

  const clearList = useCallback(
    async (listId: string): Promise<void> => {
      const now = new Date().toISOString();

      setWishlists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;
          return {
            ...list,
            items: [],
            itemCount: 0,
            estimatedTotal: 0,
            previewImages: [],
            updatedAt: now,
            lastUpdatedBy: employeeId,
            lastUpdatedByName: employeeName,
          };
        })
      );
    },
    [employeeId, employeeName]
  );

  // =========================================================================
  // Sync Operations
  // =========================================================================

  const syncWithServer = useCallback(async (): Promise<void> => {
    setIsSyncing(true);
    try {
      // TODO: Implement actual API sync
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const refreshWishlists = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Fetch from API
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================================
  // Legacy API - Simple wishlist interface for compatibility
  // =========================================================================

  /**
   * Legacy wishlist object - transforms B2B favorites into simple format
   */
  const wishlist = useMemo<LegacyWishlist>(() => {
    if (!defaultFavorites) {
      return { items: [], totalItems: 0 };
    }

    // Transform B2B wishlist items to legacy format with product objects
    const items = defaultFavorites.items.map((item) => ({
      product: {
        id: item.productId,
        reference: item.productReference,
        name: item.productName,
        slug: item.productId, // Use ID as slug fallback
        description: '',
        shortDescription: '',
        price: item.currentPrice,
        isPriceTTC: true,
        images: [item.productImage],
        categoryId: '',
        materials: [],
        weightUnit: 'g' as const,
        stock: item.stockAvailable || 0,
        isAvailable: item.isAvailable,
        featured: false,
        isNew: false,
        createdAt: item.addedAt,
      },
    }));

    return {
      items,
      totalItems: defaultFavorites.itemCount,
    };
  }, [defaultFavorites]);

  /**
   * Clear all items from default favorites (legacy alias)
   */
  const clearWishlist = useCallback(async (): Promise<void> => {
    if (defaultFavorites) {
      await clearList(defaultFavorites.id);
    }
  }, [defaultFavorites, clearList]);

  /**
   * Toggle product in favorites (legacy alias for toggleFavorite)
   */
  const toggleWishlist = toggleFavorite;

  /**
   * Check if product is in favorites (legacy alias for isFavorite)
   */
  const isInWishlist = isFavorite;

  // =========================================================================
  // Context Value
  // =========================================================================

  const contextValue = useMemo<WishlistContextType>(
    () => ({
      wishlists,
      wishlistSummaries,
      defaultFavorites,
      selectedWishlist,
      isLoading,
      isSyncing,
      error,
      // Legacy API
      wishlist,
      clearWishlist,
      toggleWishlist,
      isInWishlist,
      // List operations
      createWishlist,
      updateWishlist,
      deleteWishlist,
      duplicateWishlist,
      getWishlist,
      selectWishlist,
      clearSelection,
      filterWishlists,
      addToList,
      removeFromList,
      updateItem,
      isInAnyList,
      isInList,
      getListsContainingProduct,
      toggleFavorite,
      isFavorite,
      shareList,
      removeCollaborator,
      updateCollaboratorPermission,
      generatePublicLink,
      revokePublicLink,
      addListToCart,
      clearList,
      syncWithServer,
      refreshWishlists,
    }),
    [
      wishlists,
      wishlistSummaries,
      defaultFavorites,
      selectedWishlist,
      isLoading,
      isSyncing,
      error,
      wishlist,
      clearWishlist,
      toggleWishlist,
      isInWishlist,
      createWishlist,
      updateWishlist,
      deleteWishlist,
      duplicateWishlist,
      getWishlist,
      selectWishlist,
      clearSelection,
      filterWishlists,
      addToList,
      removeFromList,
      updateItem,
      isInAnyList,
      isInList,
      getListsContainingProduct,
      toggleFavorite,
      isFavorite,
      shareList,
      removeCollaborator,
      updateCollaboratorPermission,
      generatePublicLink,
      revokePublicLink,
      addListToCart,
      clearList,
      syncWithServer,
      refreshWishlists,
    ]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access full wishlist context
 * @throws Error if used outside WishlistProvider
 */
export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist doit etre utilise dans un WishlistProvider');
  }
  return context;
}

/**
 * Hook for favorites operations only
 */
export function useFavorites() {
  const { toggleFavorite, isFavorite, defaultFavorites } = useWishlist();
  return { toggleFavorite, isFavorite, favorites: defaultFavorites };
}

/**
 * Hook for list operations
 */
export function useWishlistOperations() {
  const {
    createWishlist,
    updateWishlist,
    deleteWishlist,
    duplicateWishlist,
    addToList,
    removeFromList,
    updateItem,
    clearList,
  } = useWishlist();

  return {
    createWishlist,
    updateWishlist,
    deleteWishlist,
    duplicateWishlist,
    addToList,
    removeFromList,
    updateItem,
    clearList,
  };
}

/**
 * Hook for sharing operations
 */
export function useWishlistSharing() {
  const {
    shareList,
    removeCollaborator,
    updateCollaboratorPermission,
    generatePublicLink,
    revokePublicLink,
  } = useWishlist();

  return {
    shareList,
    removeCollaborator,
    updateCollaboratorPermission,
    generatePublicLink,
    revokePublicLink,
  };
}

export { WISHLISTS_STORAGE_KEY, DEFAULT_FAVORITES_ID };
